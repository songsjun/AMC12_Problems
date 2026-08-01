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
shutdown `AbortSignal` through AssemblyAI/provider cleanup and both AI Gateway
workers, drains in-flight dispatch, and closes PostgreSQL. A shutdown abort
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

sudo install -d -o ss -g staff -m 0750 /var/log/kapy
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

The API environment contains request-serving settings only:

```text
AMC12_SESSION_SECRET=<at least 32 random characters>
AMC12_AUTH_PEPPER=<distinct, at least 32 random characters>
AMC12_DATABASE_URL=postgres://<dedicated-api-user>:<password>@127.0.0.1:5432/<database>
AMC12_PRIVATE_UPLOAD_ROOT=/var/lib/kapy/amc12-private-uploads
AMC12_SECURE_COOKIES=true
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
AMC12_ASSEMBLYAI_API_KEY=<secret from the protected operator workflow>
AMC12_ASSEMBLYAI_RETENTION_PROFILE=<CONFIGURED_TTL|BAA_DEFAULT|NO_TTL_OR_BAA>
AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED=true
AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS=<operator-verified account policy delay>
AMC12_ASSEMBLYAI_RETENTION_PROCESSING_SLACK_HOURS=<explicit conservative AWS processing slack>
```

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

SELECT count(*) AS expired_running_leases
FROM (
  SELECT lease_expires_at FROM amc_practice.learning_work_items WHERE status = 'RUNNING'
  UNION ALL
  SELECT lease_expires_at FROM amc_practice.learning_batch_work_items WHERE status = 'RUNNING'
  UNION ALL
  SELECT lease_expires_at FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs WHERE status = 'RUNNING'
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
- **Ticket/page by impact:** oldest ready interactive analysis exceeds 5
  minutes or batch/transcription work exceeds 15 minutes. Compare queue arrival
  rate, worker concurrency, provider latency, and PostgreSQL saturation before
  increasing capacity; interactive capacity must remain reserved.
- **Ticket:** `private_storage_reconcile_attention`, orphan-cleanup retry, or
  worker error events recur. Also alert before free space reaches
  `AMC12_PRIVATE_MINIMUM_FREE_BYTES`; do not delete private files manually.
- **Ticket/page by rate:** worker stderr or log bytes grow anomalously, or the
  bounded retention job stops succeeding. Investigate the originating event
  code before rotating/restarting; avoid a restart loop that amplifies logs.

Never log or alert on transcript text, uploaded reasoning, provider external
IDs, tokens, env-file contents, or raw upstream error bodies.

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
