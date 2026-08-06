# AMC 12 API and learning-worker launchd templates

These non-secret system LaunchDaemon templates supervise two independent
processes:

- `com.kapy.education.amc12-practice-api.plist` runs the loopback Fastify API
  from `practice-api/src/server.js`.
- `com.kapy.education.amc12-learning-worker.plist` runs the asynchronous
  analysis, batch extraction, AssemblyAI transcription/provider cleanup, and
  private-storage reconciliation loops from
  `practice-api/src/learning-review/worker-main.js`.

Both start at boot and are restarted by launchd. `ThrottleInterval` bounds a
crash loop; `ExitTimeOut` bounds how long launchd waits after `SIGTERM` before
it terminates a job; decimal umask `63` is octal `077`.

The API has a cooperative close path. The worker stops timers, propagates one
shutdown `AbortSignal` through AssemblyAI/provider cleanup and all AI Gateway
handlers, drains in-flight dispatch, and closes PostgreSQL. A shutdown abort
does not persist a terminal result or stale retry decision: the durable lease
is left for normal expiry and reclaim. Keep individual provider timeouts below
the 240-second launchd `ExitTimeOut`; the slow-Gateway abort tests are the
regression evidence for this bounded drain contract.

No credential belongs in a plist. Node reads two distinct protected files:

```text
API:    --env-file=/etc/kapy/amc12-practice.env
worker: --env-file=/etc/kapy/amc12-learning-worker.env
```

Do not replace them with a shared file. Separate files prevent accidentally
granting the API provider credentials it does not need and make rotation and
auditing explicit.

## Trust boundary and first-release limitation

The first-release templates run both jobs as the existing `ss` service UID so
they can read the same release tree and private upload store. File separation
is therefore a least-exposure/configuration control, **not a security boundary**:
a compromise with arbitrary code execution as `ss` can read both `0600` env
files, inspect the sibling process, and access private uploads. The API and
worker are in the same trusted computing base (TCB).

Before treating provider credentials as isolated, provision distinct OS
users (and narrowly shared upload/database capabilities) or a secret broker
that issues workload-scoped credentials. Do not claim strong secret isolation
from these first-release plists.

## Protected environments

Review the fixed repository, Node, user, and log paths in both plists on the
target host. Then install dependencies and create the files outside source
control:

```sh
cd /Users/ss/Workspaces/education/AMC12_Problems/practice-api
npm ci

sudo install -d -o root -g wheel -m 0755 /etc/kapy
sudo install -o ss -g staff -m 0600 /dev/null /etc/kapy/amc12-practice.env
sudo install -o ss -g staff -m 0600 /dev/null /etc/kapy/amc12-learning-worker.env
sudo install -d -o root -g wheel -m 0755 /var/lib/kapy
sudo install -d -o ss -g staff -m 0700 /var/lib/kapy/amc12-private-uploads
sudoedit /etc/kapy/amc12-practice.env
sudoedit /etc/kapy/amc12-learning-worker.env

sudo install -d -o root -g staff -m 0750 /var/log/kapy
sudo install -o ss -g staff -m 0600 /dev/null /var/log/kapy/amc12-practice-api.stdout.log
sudo install -o ss -g staff -m 0600 /dev/null /var/log/kapy/amc12-practice-api.stderr.log
sudo install -o ss -g staff -m 0600 /dev/null /var/log/kapy/amc12-learning-worker.stdout.log
sudo install -o ss -g staff -m 0600 /dev/null /var/log/kapy/amc12-learning-worker.stderr.log
```

launchd redirects these streams but does not provide retention or rotation.
Configure the host log collector/rotation policy with a bounded size and age,
preserving owner `ss:staff` and mode `0600`. Coordinate rotation with a
graceful job restart so inherited file descriptors reopen the current path,
and alert on both log-volume spikes and `/var/log` free space. Never use a
rotation mode that silently discards the only incident evidence.

The log directory itself remains `root:staff 0750`; only the regular log files
are `ss:staff 0600`. This lets the service append to its files without letting a
compromised service replace a pathname with a symlink before root maintenance.

The checked-in
[`newsyslog-amc12-learning-worker.conf.example`](newsyslog-amc12-learning-worker.conf.example)
is a manual-maintenance profile, not a file to install under
`/etc/newsyslog.d`. It retains seven compressed stdout archives and fourteen
compressed stderr archives, rotates at 10 MiB or the daily boundary, and
recreates both as `0600 ss:staff`. Its `N` flag deliberately sends no signal:
the bounded stop/rotate/bootstrap procedure below owns process lifecycle.
Installing it into the automatic system schedule would rotate the pathname
while the running worker continued writing to the renamed inode.

The API environment contains request-serving settings only:

```text
AMC12_SESSION_SECRET=<at least 32 random characters>
AMC12_AUTH_PEPPER=<distinct, at least 32 random characters>
AMC12_DATABASE_URL=postgres://<dedicated-api-user>:<password>@127.0.0.1:5432/<database>
AMC12_PRIVATE_UPLOAD_ROOT=/var/lib/kapy/amc12-private-uploads
AMC12_SECURE_COOKIES=true
AMC12_BATCH_INTAKE_ENABLED=false
AMC12_BATCH_REVIEW_ENABLED=false
AMC12_TUTOR_ENABLED=true
AMC12_REANALYSIS_ENABLED=false
AMC12_REANALYSIS_PER_STUDENT_PER_DAY=10
AMC12_REANALYSIS_GLOBAL_PER_DAY=1000
AMC12_REANALYSIS_MAX_VERSIONS=25
```

It must not contain `AMC12_ASSEMBLYAI_API_KEY`, `AMC12_INFERENCE_TOKEN`, or
other provider credentials. Do not place `AMC12_DEV_ACCESS_CODE`,
`AMC12_ALLOW_TEST_ONLY_PUBLISH`, or development content flags in either
production file.

The worker environment contains only the settings needed for background work:

```text
AMC12_DATABASE_URL=postgres://<dedicated-worker-user>:<password>@127.0.0.1:5432/<database>
AMC12_AUTH_PEPPER=<at least 32 random characters; currently required by the batch service>
AMC12_PRIVATE_UPLOAD_ROOT=/var/lib/kapy/amc12-private-uploads
AMC12_INFERENCE_ORIGIN=http://127.0.0.1:4110
AMC12_INFERENCE_TOKEN=<at least 32 random characters>
AMC12_INFERENCE_MODEL=gpt-5.4-mini
AMC12_TUTOR_ENABLED=true
AMC12_TUTOR_MAX_CONCURRENT=1
AMC12_ASSEMBLYAI_API_KEY=<secret from the protected operator workflow>
AMC12_ASSEMBLYAI_RETENTION_PROFILE=<CONFIGURED_TTL|BAA_DEFAULT|NO_TTL_OR_BAA>
AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED=true
AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS=<operator-verified account policy delay>
AMC12_ASSEMBLYAI_RETENTION_PROCESSING_SLACK_HOURS=<explicit conservative AWS processing slack>
```

The worker model must exactly match the Gateway's reviewed
`AMC_INFERENCE_MODEL`; this deployment profile pins both to `gpt-5.4-mini`.

Tutor is a coordinated, default-off release gate in both env files. Deploy and
validate the migrations, Gateway, and worker first with the API flag still
false; then enable the API flag only after the worker can claim a synthetic
Tutor job. The worker's model value does not let the browser or job choose a
model: it binds completion metadata to the operator-pinned Gateway model and
fails closed if the two deployments drift.

Post-final reanalysis is a separate API-only, literal-`true` release gate. The
worker needs no matching flag: it processes the same durable analysis work
contract, and disabling the API gate only prevents new reanalysis versions.
Already queued or running work continues to drain. Follow the maintenance and
canary sequence in
[`POST_FINAL_REANALYSIS_DEPLOYMENT.md`](../../docs/architecture/POST_FINAL_REANALYSIS_DEPLOYMENT.md);
do not enable the flag merely because migration 018 is present.

Batch intake has a separate coordinated API release gate. It is disabled in
development and production unless the API environment contains the literal
`AMC12_BATCH_INTAKE_ENABLED=true`; values such as `1`, `yes`, or `on` remain
disabled. The same value is projected as the non-sensitive
`batchIntakeAvailable` field by `GET /api/amc12/forms` so the UI can disable
new intake, but the API gate remains authoritative. When disabled, student
batch create, upload, submit, and confirm fail with HTTP 503
`BATCH_INTAKE_UNAVAILABLE` before reserving quota, persisting a private upload,
enqueueing Provider work, or committing a learning version. GET/list and
deletion remain available, and worker decomposition, cleanup, lease recovery,
and existing backlog processing do not consult this API flag.

Do not turn this flag into a runtime dependency probe. Deploy the dedicated AMC
Gateway and learning worker, import the approved question/solution context,
run an authenticated synthetic batch canary, verify queue progress and cleanup,
and only then set the API flag to literal `true` and restart the API. For a
rollback, set it back to `false` to stop new student mutations while workers
drain or recover already durable work. Never enable it while the production
Worker or dedicated Gateway is absent.

Direct `BATCH_REVIEW` workspace creation has an additional fail-closed gate:
both `AMC12_BATCH_REVIEW_ENABLED=true` and
`AMC12_BATCH_INTAKE_ENABLED=true` must be literal. Keep both false while the
schema and worker are deployed. Enable them together only after the exact
published form revision has all 25 questions in approved context and every
question has at least two model-eligible solutions with active authority
receipts. Disabling intake blocks new workspace/batch mutations but preserves
owner-scoped workspace/history reads, deletion, and durable backlog recovery.

These four retention settings are a deployment gate, not tunable guesses. The
worker fails closed without an explicit verified profile. `NO_TTL_OR_BAA`
requires at least 48 policy hours and `BAA_DEFAULT` at least 72; a configured
TTL uses the reviewed account value. The resulting not-before additionally
includes the full `AMC12_ASSEMBLYAI_TIMEOUT_MS`. Elapsing it records only a
retention-window observation and opens a manual-verification backlog; it is not
provider deletion evidence and cannot make batch deletion `COMPLETE`.

Use distinct least-privilege database roles if the current schema grants can
support them; otherwise document the shared-role exception. Tune concurrency,
leases, quotas, provider timeouts, retention, and reconciliation intervals in
the worker file only. Keep individual provider timeouts below the worker's
240-second launchd `ExitTimeOut`.

The private root must be an absolute `0700` directory disjoint from the Git
checkout, `practice/`, the public archive, nginx document roots, temporary
directories, and backup/export destinations that publish files. Resolve and
compare the real paths on the deployment host before bootstrap; a symlink must
not make one tree a parent or child of another. Both env files must name the
same reviewed root. Treat this as a release gate because the application's
runtime check is defense in depth, not a substitute for deployment review.

`AMC12_TRUST_PROXY=loopback` remains non-secret in the API plist. It is safe
only while the API binds to `127.0.0.1` and workspace nginx overwrites the
forwarding headers as documented in `deploy/README.md`.

## Validate and install

The repository test performs strict plist parsing, semantic assertions, and
`plutil -lint` when that macOS utility is available. It does not bootstrap a
real system LaunchDaemon:

```sh
cd /Users/ss/Workspaces/education/AMC12_Problems/practice-api
node --test test/launchd-deployment.test.js
```

On every target host, lint and install both reviewed files manually:

```sh
cd /Users/ss/Workspaces/education/AMC12_Problems
sudo plutil -lint deploy/launchd/com.kapy.education.amc12-practice-api.plist
sudo plutil -lint deploy/launchd/com.kapy.education.amc12-learning-worker.plist

sudo launchctl bootout system/com.kapy.education.amc12-learning-worker 2>/dev/null || true
sudo launchctl bootout system/com.kapy.education.amc12-practice-api 2>/dev/null || true
sudo install -o root -g wheel -m 0644 \
  deploy/launchd/com.kapy.education.amc12-practice-api.plist \
  /Library/LaunchDaemons/com.kapy.education.amc12-practice-api.plist
sudo install -o root -g wheel -m 0644 \
  deploy/launchd/com.kapy.education.amc12-learning-worker.plist \
  /Library/LaunchDaemons/com.kapy.education.amc12-learning-worker.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.kapy.education.amc12-practice-api.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.kapy.education.amc12-learning-worker.plist
sudo launchctl enable system/com.kapy.education.amc12-practice-api
sudo launchctl enable system/com.kapy.education.amc12-learning-worker
```

Bootstrap the API first and verify its migration/health result before starting
the worker. A missing/unreadable env file, database, upload root, or credential
must fail closed; never fall back to development values.

## Health, backlog, and actionable alerts

The API has an HTTP health endpoint. The worker intentionally has no public
listener, so its health is the conjunction of launchd state, recent structured
logs, and durable queue progress:

```sh
sudo launchctl print system/com.kapy.education.amc12-practice-api
sudo launchctl print system/com.kapy.education.amc12-learning-worker
curl -fsS http://127.0.0.1:8090/api/amc12/health
tail -n 100 /var/log/kapy/amc12-learning-worker.stderr.log
```

Run these read-only queries through an operator/monitoring database role; do
not put a database password in a shell history or monitoring command line:

```sql
SELECT status, count(*) AS items,
       min(available_at) FILTER (
         WHERE status = 'QUEUED' AND available_at <= clock_timestamp()
       ) AS oldest_ready
FROM amc_practice.learning_work_items
WHERE status IN ('BLOCKED_CONTEXT', 'QUEUED', 'RUNNING', 'FAILED')
GROUP BY status ORDER BY status;

SELECT work_type, status, count(*) AS items,
       min(available_at) FILTER (
         WHERE status = 'QUEUED' AND available_at <= clock_timestamp()
       ) AS oldest_ready
FROM amc_practice.learning_batch_work_items
WHERE status IN ('BLOCKED_DEPENDENCY', 'QUEUED', 'RUNNING', 'FAILED')
GROUP BY work_type, status ORDER BY work_type, status;

SELECT cleanup_kind, status, count(*) AS items,
       min(available_at) FILTER (
         WHERE status = 'QUEUED' AND available_at <= clock_timestamp()
       ) AS oldest_ready,
       max(attempt_count) AS max_attempts
FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs
WHERE status <> 'SUCCEEDED'
GROUP BY cleanup_kind, status ORDER BY cleanup_kind, status;

SELECT status, count(*) AS items,
       min(available_at) FILTER (
         WHERE status IN ('QUEUED','RETRY_WAIT') AND available_at <= clock_timestamp()
       ) AS oldest_ready
FROM amc_practice.learning_tutor_turn_jobs
WHERE status IN ('QUEUED','RETRY_WAIT','RUNNING','DELIVERY_UNKNOWN','FAILED')
GROUP BY status ORDER BY status;

SELECT budget_kind, window_started_at, window_ms, used_units
FROM amc_practice.global_resource_budget_windows
WHERE budget_kind IN ('PROVIDER_WORK', 'LEARNING_REANALYSIS')
ORDER BY window_started_at DESC LIMIT 4;

SELECT student_id, window_started_at, used_units
FROM amc_practice.student_resource_budget_windows
WHERE budget_kind = 'LEARNING_REANALYSIS'
ORDER BY window_started_at DESC, used_units DESC LIMIT 20;

SELECT version.learning_submission_id,
       count(*) FILTER (WHERE version.creation_reason IN (
         'POST_FINAL_REASONING_COMMIT','MANUAL_REANALYSIS_COMMIT')) AS reanalysis_versions,
       max(version.created_at) AS latest_reanalysis
FROM amc_practice.learning_submission_versions version
GROUP BY version.learning_submission_id
HAVING count(*) FILTER (WHERE version.creation_reason IN (
  'POST_FINAL_REASONING_COMMIT','MANUAL_REANALYSIS_COMMIT')) > 0
ORDER BY reanalysis_versions DESC, latest_reanalysis DESC LIMIT 20;

SELECT last_claimed_kind, revision, updated_at
FROM amc_practice.ai_dispatch_fairness_state
WHERE singleton = true;

SELECT count(*) AS expired_running_leases
FROM (
  SELECT lease_expires_at FROM amc_practice.learning_work_items WHERE status = 'RUNNING'
  UNION ALL
  SELECT lease_expires_at FROM amc_practice.learning_batch_work_items WHERE status = 'RUNNING'
  UNION ALL
  SELECT lease_expires_at FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs WHERE status = 'RUNNING'
  UNION ALL
  SELECT lease_expires_at FROM amc_practice.learning_tutor_turn_jobs WHERE status = 'RUNNING'
) AS leases
WHERE lease_expires_at < clock_timestamp();
```

Wire each alert to this runbook and calibrate thresholds from observed service
time rather than treating these initial values as SLOs:

- **Page:** launchd worker absent/restarting repeatedly, or expired leases keep
  increasing for two polling windows. Check last-exit status and dependency
  reachability; stop a crash loop before rotating/restarting dependencies.
- **Page:** due provider-cleanup work is older than 15 minutes or reaches three
  attempts. Preserve the append-only audit, check provider reachability, and
  do not mark deletion evidenced from a retention-window timer. A
  `MANUAL_VERIFICATION_REQUIRED` retention job may be completed only from an
  independently authenticated provider/operator confirmation and its reference
  hash; the elapsed window alone must remain `PROVIDER_RETENTION_PENDING`.
- **Warn/Page:** oldest ready Tutor work exceeds 2/5 minutes, or the shared
  provider-work window approaches/exhausts its configured limit. Compare
  Tutor, analysis and batch oldest-ready age before changing claim precedence;
  preserve the shared cost boundary when tuning either producer.
- **Ticket/page by impact:** oldest ready interactive analysis exceeds 5
  minutes or batch/transcription work exceeds 15 minutes. Compare queue arrival
  rate, worker concurrency, provider latency, and PostgreSQL saturation before
  increasing capacity. A stuck `ai_dispatch_fairness_state.revision` while both
  non-Tutor classes are ready is a dispatcher fault; do not manually edit the
  cursor while workers are live.
- **Ticket:** `private_storage_reconcile_attention`, orphan-cleanup retry, or
  worker error events recur. Also alert before free space reaches
  `AMC12_PRIVATE_MINIMUM_FREE_BYTES`; do not delete private files manually.
- **Ticket/page by rate:** worker stderr or log bytes grow anomalously, or the
  bounded retention job stops succeeding. Investigate the originating event
  code before rotating/restarting; avoid a restart loop that amplifies logs.

Never log or alert on transcript text, uploaded reasoning, provider external
IDs, tokens, env-file contents, or raw upstream error bodies.

## Disk, log, and queue preflight

Run this preflight before enabling intake, after each release, and whenever a
capacity alert fires. These commands are read-only and contain no credential:

```sh
df -Pk /var/lib/kapy/amc12-private-uploads /var/log/kapy
du -sk /var/lib/kapy/amc12-private-uploads /var/log/kapy
stat -f '%N %Sp %Su:%Sg %z' \
  /var/log/kapy/amc12-learning-worker.stdout.log \
  /var/log/kapy/amc12-learning-worker.stderr.log
sudo launchctl print system/com.kapy.education.amc12-learning-worker
```

Use the read-only monitoring database role for the queue queries in the prior
section. Capture one row per work/status class, oldest-ready age, expired
leases, provider budget usage, and fairness revision. Never source either
production env into an interactive shell and never pass a database password on
the command line.

Initial actionable thresholds, to be replaced only by observed SLO data:

- **Page and keep intake disabled:** the worker is absent/crash-looping;
  available space is below either 10% or 5 GiB; expired running leases increase
  across two polls; provider-cleanup ready age exceeds 15 minutes; Tutor ready
  age exceeds 5 minutes; or the provider-work budget is exhausted.
- **Warn and stop rollout:** available space is below either 15% or 10 GiB;
  either worker log exceeds 50 MiB or grows by 100 MiB in an hour; interactive
  analysis ready age exceeds 5 minutes; batch/transcription ready age exceeds
  15 minutes; Tutor ready age exceeds 2 minutes; or the fairness revision does
  not advance while at least two non-Tutor classes remain ready.
- **Ticket:** any private-storage reconciliation attention event, repeated
  provider cleanup retry, manual-verification backlog growth, or daily log
  rotation not completed.

Every page disables new batch intake first. Do not delete uploads, edit queue
rows, reset the fairness cursor, or mark provider deletion manually as a disk
pressure response. Preserve the durable backlog and either restore capacity or
move it through an approved encrypted migration procedure.

## Bounded learning-worker log rotation

Because launchd owns the worker's stdout/stderr descriptors, rotate only during
a bounded maintenance stop. This procedure affects the worker, not the API;
the API must already have literal `AMC12_BATCH_INTAKE_ENABLED=false` so no new
file mutations enter while the worker is stopped.

1. Record the disk/log preflight, all queue counts/oldest-ready timestamps,
   expired leases, current worker PID, and the current plist checksum.
2. Validate the profile without changing a file:

   ```sh
   sudo /usr/sbin/newsyslog -n -f \
     /Users/ss/Workspaces/education/AMC12_Problems/deploy/launchd/newsyslog-amc12-learning-worker.conf.example
   ```

3. Gracefully remove the worker from launchd and confirm the label and PID are
   absent. Allow the full 240-second `ExitTimeOut`; if drain fails, preserve
   logs and follow the crash-recovery procedure rather than deleting leases:

   ```sh
   sudo launchctl bootout system/com.kapy.education.amc12-learning-worker
   sudo launchctl print system/com.kapy.education.amc12-learning-worker
   ```

4. Reject symlink/non-regular log targets, then force one rotation while the
   worker is stopped:

   ```sh
   sudo test ! -L /var/log/kapy/amc12-learning-worker.stdout.log
   sudo test ! -L /var/log/kapy/amc12-learning-worker.stderr.log
   sudo test -f /var/log/kapy/amc12-learning-worker.stdout.log
   sudo test -f /var/log/kapy/amc12-learning-worker.stderr.log
   sudo /usr/sbin/newsyslog -F -f \
     /Users/ss/Workspaces/education/AMC12_Problems/deploy/launchd/newsyslog-amc12-learning-worker.conf.example
   sudo chown ss:staff \
     /var/log/kapy/amc12-learning-worker.stdout.log \
     /var/log/kapy/amc12-learning-worker.stderr.log
   sudo chmod 0600 \
     /var/log/kapy/amc12-learning-worker.stdout.log \
     /var/log/kapy/amc12-learning-worker.stderr.log
   ```

5. Bootstrap the already reviewed installed plist; verify a new PID, both
   current files at `0600`, current-file size growth, no writes to archived
   inodes, and decreasing oldest-ready age:

   ```sh
   sudo launchctl bootstrap system \
     /Library/LaunchDaemons/com.kapy.education.amc12-learning-worker.plist
   sudo launchctl print system/com.kapy.education.amc12-learning-worker
   sudo lsof /var/log/kapy/amc12-learning-worker.stdout.log \
     /var/log/kapy/amc12-learning-worker.stderr.log
   ```

6. Re-enable intake only after two polling windows show no increasing expired
   leases, queue progress has resumed, disk is above the warning thresholds,
   and no provider/manual-verification cleanup regression is present. Record
   rotation duration and backlog recovery time as SRE evidence.

If daily manual rotation becomes toil, do not install the `N` profile as a
shortcut. Build and test a dedicated root-owned maintenance LaunchDaemon which
executes the same gate/bootout/rotate/bootstrap/verify state machine, has a
single-instance lock and abort thresholds, and pages on any partial transition.

## Restart and crash drills

For a planned restart, record queue counts and the worker PID, request
`SIGTERM`, then verify a new PID and continued progress:

```sh
sudo launchctl print system/com.kapy.education.amc12-learning-worker
sudo launchctl kill SIGTERM system/com.kapy.education.amc12-learning-worker
sudo launchctl print system/com.kapy.education.amc12-learning-worker
tail -n 100 /var/log/kapy/amc12-learning-worker.stderr.log
```

Allow up to `ExitTimeOut` for cooperative abort/drain. Confirm that active
provider requests abort promptly, queue counts resume decreasing after restart,
leases are reclaimed after expiry, and no duplicate reports or unsupported
deletion evidence appear. Use `launchctl kickstart -k` only when the bounded
SIGTERM path itself has failed.

Quarterly in staging, perform a bounded crash-recovery drill after capturing
the same baseline:

```sh
sudo launchctl kill SIGKILL system/com.kapy.education.amc12-learning-worker
sudo launchctl print system/com.kapy.education.amc12-learning-worker
```

Expected result: launchd restarts the job after its throttle interval; durable
work remains queued or is reclaimed only after its lease expires; API health
remains available; provider-orphan cleanup remains auditable. Abort the drill
if it can reach production credentials/data, the API degrades, or backlog is
not recovering. Record restart time, oldest-ready age, expired-lease recovery,
cleanup status, and any unexpected provider calls in the drill report.
