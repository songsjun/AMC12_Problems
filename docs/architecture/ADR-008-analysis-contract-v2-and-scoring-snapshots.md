# ADR-008: Version analysis contracts and grade from immutable scoring snapshots

## Status

Accepted

## Context

The first question-analysis contract sent one `official_answer`. That is not a
complete AMC scoring fact: an archive question can accept multiple options, a
question can intentionally be unscored, and a blank answer differs from a
selected but nonaccepted answer. Reading `form_questions` at worker time also
lets current form state drift away from the exact result already shown to the
student.

Changing a request and response schema in place would create a second problem.
A leased v1 run may have crossed the provider boundary already; interpreting
its eventual result as v2 would make its hashes and metadata dishonest.

## Decision

Use `amc-analysis-contract-v2` for every newly created analysis run. The fixed
Gateway boundary is `/v2/analyze-question` with exact v2 request, task, prompt,
hash, and response identifiers. The request carries:

- `scoring.is_scored`, `canonical_answer`, and ordered unique
  `accepted_options`;
- a server-derived `student_answer_status` of `BLANK`, `ACCEPTED`, or
  `NOT_ACCEPTED`;
- nonblank student reasoning and at least two approved, model-eligible
  solutions.

Only a valid, scored snapshot with nonblank reasoning and usable context may
reach the Gateway. Intentionally unscored questions are persisted locally as
`QUESTION_UNSCORED`; corrupt or contradictory snapshots become
`SCORING_SNAPSHOT_INVALID`. Both paths record `provider_invoked=false` and are
evaluated before blank-reasoning or context-availability branches.

The scoring authority is selected by the response origin and exact version:

| Origin | Authoritative join |
|---|---|
| `OFFICIAL_FINAL` | `learning_submissions.official_submission_id -> submission_answers` |
| `BATCH_CONFIRMED` | `learning_submission_versions.batch_id -> learning_batch_results`, additionally matching `learning_submission_version_id`, then its result item |

There is no `form_questions` fallback. Claim validates the snapshot once. The
worker then authorizes immediately before dispatch by re-reading the same
source in one repeatable-read transaction and comparing every scoring field,
the response origin/body hash, context lineage, solution approvals, lease, and
entitlement.

Database checks enforce canonical scored and unscored shapes on form questions
and both result-snapshot tables. They also derive `is_correct` membership for a
selected scored answer and require `is_correct IS NULL` plus `points = 0` for
unscored results. Official answer snapshots and batch results/items become
append-only after insertion.

Migration 010 is a drained maintenance-window cutover. It locks analysis work/run tables before
checking for active work, refuses any `RUNNING` analysis with SQLSTATE `55006`,
labels existing terminal runs v1, labels queued runs v2, and defaults future
runs to v2. v2 workers claim only v2 runs. Existing v1 terminal reports remain
readable without rewriting reports or hashes. Old API processes that can create
analysis runs/work and all old workers are stopped before migration; the v2 API
and worker start only after it commits.

Context and input hashes include the v2 scoring/status fields, but hashes are
consistency evidence, not authorization. Durable lineage and the exact
append-only source remain authoritative.

## Alternatives

### Continue reading the current form answer key

This is simpler but cannot prove what scoring facts produced an older result
and mishandles accepted alternatives and unscored questions.

### Rewrite every queued and running run as v2

Queued work has not crossed the provider boundary and is safe to upgrade.
Running work is not; the migration therefore refuses it instead of guessing.

### Send unscored questions to the model for qualitative feedback

That conflates feedback with grading semantics and spends provider capacity on
a case whose contract deliberately has no accepted answer. A future separate
qualitative-review contract may support that use case explicitly.

## Consequences

- Interactive and batch analysis use the same contract and status semantics.
- Accepted alternatives cannot be falsely classified as wrong by contract.
- An unscored or invalid snapshot makes zero provider calls.
- Snapshot tables can no longer be corrected in place; remediation requires a
  new evidence/result version with explicit lineage.
- Deployment must stop old API and worker binaries before migration. The
  database lock closes the migration race but cannot prevent an old binary
  restarted after migration from creating or claiming v2 work.
- The API and Gateway keep duplicate golden fixtures for independent checkout;
  release validation must compare their bytes and pin their checksums.
