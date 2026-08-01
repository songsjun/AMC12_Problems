# Phase 2 review: interactive reasoning and final learning evidence

## Scope

This stage adds optional per-question reasoning to the existing timed practice flow and atomically creates the first immutable LearningSubmission version with the official FINAL. It exposes only a deterministic status skeleton (`CONTEXT_UNAVAILABLE` / `BLOCKED_CONTEXT`); it performs no transcription, inference, or other provider call.

## Verification evidence

- `practice/npm run verify`: lint passed; 31 tests passed, 0 failed, 0 skipped.
- `practice-api/npm test` without a database: 40 passed, 1 explicitly reported PostgreSQL skip.
- Full API suite against a newly initialized isolated PostgreSQL 17 cluster: 41 passed, 0 failed, 0 skipped. The primary reviewer and both independent reviewers repeated the non-skipped run against separate temporary databases.
- The PostgreSQL suite proves migration serialization/rerun, exact attempt/owner/form-revision and FINAL bindings, deferred current-version integrity, 25-row evidence, transaction rollback after learning writes, and two independent connection pools racing FINAL.
- PostgreSQL parity covers checkpoint and deadline preliminary paths producing no LearningSubmission, plus explicit historical reconciliation that creates once and leaves official submission/answer rows unchanged.
- Input and access tests cover exact 8,000/8,001-byte notes, exact 48,000/48,001-byte batches, NUL/unknown/duplicate/invalid question fields, a greater-than-64-KiB HTTP body returning 413 without echo, CSRF, cross-student fail-closed access, idempotency without copied prose, and independent per-student quotas.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `git diff --check`: passed.

## Independent review

The first UI reviews rejected the implementation because its route/envelope did not match the API, UTF-8 and serialized-body limits were incomplete, editable capability was stale across resume/overtime transitions, and dirty notes could be lost or strand FINAL at the deadline. The revised client accepts the frozen bare/wrapped envelope during rollout but requires the exact attempt id; bounds each note, raw batch, and actual serialized request; retries only the named revision conflict; reloads capability; serializes/coalesces saves; flushes before switching or score-producing actions; and provides explicit keep, reload, or discard recovery. Final architecture and security dispositions: **APPROVE**, with zero blocker or major finding. Both independently ran 31/31 UI tests.

The first API reviews rejected the evidence because the normal test command skipped PostgreSQL and because database constraints did not themselves prove the LearningSubmission used the attempt's pinned form revision or an existing current version. They also required real-database concurrency and Memory/PostgreSQL parity rather than application-only assertions. The migration now uses an attempt/student/form/version composite foreign key, the official FINAL composite foreign key, and a deferred parent/current-version foreign key. The expanded PostgreSQL suite supplies the required negative, rollback, race, preliminary, and reconciliation evidence. Final architecture and security dispositions: **APPROVE**, each with blocker/major/minor counts of 0/0/0.

## Reflection

A correct application assignment is not a durable aggregate invariant. Reports and later chats will depend on the exact question revision, so a LearningSubmission that can be attached to any existing revision is unsafe even when today's service always supplies the right values. The repaired schema makes PostgreSQL prove owner, attempt, FINAL, pinned form, and current evidence version as one chain.

A green default suite can also conceal the highest-risk adapter. Once a migration exists, “PostgreSQL skipped” is not acceptable completion evidence. The stage now records both the honest default skip and repeated isolated 41/41 runs; later database phases must keep the same non-skipped gate.

Reasoning is learning evidence, not scoring input. It has its own revision, storage, rate limit, and recovery behavior, and finalization snapshots it only after deterministic scoring data is fixed in the same transaction. The UI continues to show the official score even when analysis is unavailable. This prevents AI or provider availability from weakening the established AMC scoring flow.

Two limitations remain explicit rather than hidden. The per-student quota is process-local and must move to shared storage before horizontal API scaling. The hardest browser races are presently supported by state-machine/source-contract tests rather than a DOM plus mock-network E2E suite; Phase 5 must exercise deadline network failure, delayed cross-attempt responses, and dirty-note recovery end to end. Finally, the reasoning GET retains the existing attempt read-and-deadline-reconcile semantics; the strict no-write polling guarantee applies to the LearningSubmission status GET.
