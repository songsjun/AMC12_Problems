# Post-final reanalysis deployment runbook

Migrations 018 and 019 change constraints on core learning tables; 018 also
installs append-only triggers. They are transactional, but their `ALTER TABLE`
and trigger work take strong locks. Deploy them in a maintenance window with
the old API and learning worker stopped; the migration runner has no
`lock_timeout`, so an unreviewed live rollout can wait indefinitely. For the
v3 analysis-contract rollout, deploy the additive Gateway `/v3` route before
any API or worker that can create v3 runs, and retain `/v2` until durable v2
work is drained.

## Preconditions

1. Keep `AMC12_REANALYSIS_ENABLED=false` in the protected API environment.
2. Record the release commit, database backup reference, API/worker/Gateway
   versions, and current migration ledger. Verify the backup can be restored.
3. Prepare a maintenance response that stops the API ingress before draining.
   Inventory analysis, Tutor, batch extraction, transcription, provider-orphan
   cleanup, and storage reconciliation work. Every `RUNNING` lease must finish,
   be reclaimed, or have an explicit incident disposition before migration.
4. Require at least 15% free space on the database/private-upload volume and
   enough headroom for immutable versions and reports. A host below this gate
   is a stop condition, not a warning to waive silently.
5. Inventory historical `BATCH_REVIEW_ANCHOR` rows with unavailable context;
   migration 018 intentionally preserves them. Any official-learning response
   that differs from its immutable `submission_answers` row is an integrity
   incident and makes the migration fail closed.

## Maintenance sequence

1. Stop public API ingress and the old API first so no Final, batch, Tutor, or
   other durable work can enter while the baseline is draining. Keep the
   reanalysis gate false.
2. Allow the old worker up to its 240-second cooperative shutdown/drain bound,
   then stop it. Confirm all work classes above have zero `RUNNING` rows, old
   leases are resolved, both old PIDs exited, and no supervisor can restart an
   old binary.
3. Start only the new API with the reanalysis gate still false. It runs
   migrations through 019 before binding. Verify migrations 018 and 019 are
   each recorded exactly once and `/api/amc12/health` is healthy.
4. Start the new worker and verify database connectivity, the dedicated
   loopback Gateway returns HTTP 200 from `http://127.0.0.1:4110/healthz`,
   queue progress, and absence of crash loops. A health response alone is not
   the model/token/schema canary.
5. With the gate false, restore API ingress and re-run authentication, Final submit, existing report,
   history, Tutor, batch upload/confirm, cleanup, and score-regression canaries.
6. Enable `AMC12_REANALYSIS_ENABLED=true` in the protected API environment and
   restart only the API. Use one controlled final submission with approved
   context. Save changed reasoning as learning version 2 and wait for its
   report; record its report hash and open a version-2 Tutor thread. Only then
   request unchanged evidence as learning version 3, wait for its report, and
   open a version-3 Tutor thread. New analysis runs use contract v3 in both
   cases. Verify learning versions 1, 2, and 3 remain readable, v3 Gateway
   model/prompt/schema match the reviewed 4110 contract, any preexisting v2
   contract run remains readable/claimable during drain, and the official
   score/submission JSON and hash did not change.
7. Verify stale-version, repeated idempotency key, cross-owner, CSRF, running-
   worker conflict, quota, and no-context paths return their stable errors and
   create no unexpected provider calls.

### Single-host ingress limitation

The current workstation nginx supervises several education applications as
one process and has no AMC-only maintenance switch. Do not stop the shared
nginx process to simulate step 1: doing so also removes unrelated ports
8081-8085. Until an AMC-only maintenance response is installed, the bounded
host-specific procedure is to verify every work class idle, stop the AMC API
first, confirm its upstream is unavailable, stop the AMC worker, and run the
one-shot migration while both are absent. Restore the new API with every new
intake gate still false, then the new worker and dedicated 4110 Gateway. This
is a documented operational compromise, not equivalent to selective ingress:
there is a short interval in which unrelated already-enabled AMC mutations
could be accepted before worker verification. A future deployment should add
an AMC-only maintenance location returning 503 so the canonical sequence can
be followed without affecting sibling services.

The host's live nginx file is outside this repository. Merge only the reviewed
exact raw-upload locations from `deploy/nginx/` into that file; never replace
the whole shared configuration. Require `nginx -t` before reload. Authenticated
direct and portal uploads above 64 KiB must reach the API, while ordinary JSON
and non-exact paths remain capped at 64 KiB.

## Rollback and observation

Set `AMC12_REANALYSIS_ENABLED=false` and restart the API to stop new versions.
Do not stop the worker merely to roll back intake: durable queued/running work
must drain or recover. Migrations 018/019 and already-created immutable
versions remain in place; reversing them would remove integrity protections
and contract history and is not the application rollback. Once migration
018/019 or either new creation/reasoning origin has been written, an old
API/worker binary and a down-migration are both forbidden; recover by disabling
intake and deploying a forward fix.

Monitor version creation rate, daily student/global budget denials, queued and
running analysis age, report outcomes, Gateway errors, database growth, and
free disk. A pure rerun legitimately has the same evidence hash as its parent;
duplicate hashes are not duplicate writes when version numbers differ.
Use the queue/budget monitoring queries in `deploy/launchd/README.md` and alert
before submissions approach `AMC12_REANALYSIS_MAX_VERSIONS`, not only after a
student reaches the hard limit.

## Critical limitations

- Reasoning-mode AI output is nondeterministic and advisory. Answer-only v3
  accepts only its exact deterministic report invariant. Neither mode changes
  the official answer snapshot or AMC score.
- Partial approved context yields a partial report; missing questions remain
  `UNASSESSABLE` until reviewed context is imported and a later analysis is
  requested or repaired.
- A current `BATCH_COMMIT` version is rejected by this endpoint. Mixing
  mapped-only batch evidence with complete official answers needs a future
  explicit branch/merge design.
- A default-off gate limits new cost but is not a queue pause, cancellation
  mechanism, secret boundary, or substitute for capacity monitoring.
