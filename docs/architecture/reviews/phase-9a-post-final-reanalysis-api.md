# Phase 9a review: post-final reanalysis API and persistence

## Outcome

The API and persistence layer now allow an owner to append post-final
reasoning and request repeated AI analysis without reopening or modifying the
official AMC submission. Changed reasoning creates
`POST_FINAL_REASONING_COMMIT`; an unchanged rerun creates
`MANUAL_REANALYSIS_COMMIT`. Each version keeps its own work/run/report/Tutor
lineage while every interactive version reads the same immutable official
answer and score snapshot.

The HTTP mutation is default-off, CSRF protected, idempotent, optimistic on
`expectedCurrentVersion`, bounded by UTF-8/request/version/daily limits, and
explicitly owner scoped. A changed note can be saved as `BLOCKED_CONTEXT`
without a provider call. A pure rerun requires approved context. A provider-
leased current run returns 409; only unleased blocked/queued work is
superseded.

## Database and concurrency evidence

Migration 018 adds the two version reasons and `POST_FINAL_UPDATE` provenance,
official-answer lineage validation, complete deferred snapshot validation,
and append-only guards for official submissions, question responses, versions,
reports, and question analyses. It preserves the 017-era unavailable
`BATCH_REVIEW_ANCHOR` state while still requiring every newly created anchor
to pin complete context.

The fresh PostgreSQL smoke passed 1/1. It includes:

- a real historical upgrade: migrations 001–014, insertion of a legal
  unavailable 25-question batch-review anchor, then migrations 015–018 with
  the anchor still readable;
- ready-context changed v2 followed by same-evidence v3, proving retained
  `POST_FINAL_UPDATE`, equal evidence/reasoning revision, and valid database
  triggers;
- v3 report completion followed by an exact v3/question Tutor root containing
  the post-final reasoning, frozen official answer/selection, and two approved
  solution references;
- two-pool version conflicts, worker-claim versus restart, and context-import
  versus reasoning-commit races;
- stable rejection of batch-confirmed current evidence and unchanged official
  submission/answer JSON;
- direct mutation/deletion rejection for official and learning snapshots.

The independent Tutor PostgreSQL Store/HTTP/fencing suite passed 7/7 on its own
fresh database. The default API suite reported 274 tests: 263 passed, 0 failed,
and 11 explicit PostgreSQL-environment skips; those skipped paths were then
run through the fresh PostgreSQL suites above. Focused changed-path tests
passed 56/56. JavaScript syntax checks and `git diff --check` passed.

## Independent reviews

The final application/security reviews found no blocker or high-severity
finding. The earlier compatibility and race findings were closed: historical
anchor compatibility, pure-rerun provenance, stable batch-source 409, exact-
form context locking, Memory/PostgreSQL damaged-work parity, append-only
analysis snapshots, and real dispatcher/context races all have regression
evidence.

The deployment review separates repository readiness from production
readiness. Migration 018 requires a maintenance window: stop API ingress,
drain every worker work class, stop the worker, start only the new API for the
migration, then start the new worker and canary before enabling the API gate.
The gate stops only new reanalysis writes; it does not pause or cancel durable
work.

## Critical reflection

Encoding reruns as learning versions preserves the established one-version /
one-run / one-report / pinned-Tutor model and makes history reproducible. The
cost is extra immutable storage and a version number that currently carries
both evidence and rerun revisions. If model comparison or concurrent branches
become a requirement, a separate analysis-revision axis is required rather
than extending this overload.

Partial approved context intentionally yields a partial report with
`UNASSESSABLE` questions. That is useful during manual solution approval but
must never be presented as a complete 25-question assessment. Batch-confirmed
mapped evidence is rejected rather than silently merged with official answers;
a future merge needs explicit provenance and scoring semantics.

The database prevents normal application requests from corrupting the new
lineage. A privileged writer could still create internally inconsistent work /
run statuses that PostgreSQL detects less strictly than MemoryStore; unique
and foreign-key constraints contain the external risk, but a future state-
shape constraint would improve corruption diagnostics.

Repository/API phase completion does not authorize production rollout. At
review time the host had about 13.67% free disk, below the runbook's 15% hard
gate. Migration, service restart, feature enablement, and real 4110 v2/v3
canary remain blocked until capacity is restored and the maintenance preflight
passes.
