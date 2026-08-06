# ADR-012: Represent post-final reanalysis as immutable learning versions

## Status

Accepted

## Context

An interactive AMC attempt already creates an immutable official `FINAL` submission and
a separate version-one `LearningSubmission` snapshot. Students need to add or replace
reasoning after that final, request AI analysis more than once, compare old reports, and
continue Tutor conversations against the exact evidence and solutions used at the time.

The persistence model currently enforces exactly one analysis run and one report for each
learning-submission version. Removing those constraints would require a second revision
axis throughout the worker, history projections, report selection, and Tutor snapshots.
It would also leave the meaning of mutable reasoning inside one evidence version unclear.

## Decision

`submissions` and `submission_answers` remain the immutable official scoring boundary.
Post-final operations never reopen an attempt and never write to either official table.

Each explicit reanalysis request appends a learning version. A request that changes at
least one reasoning note uses `POST_FINAL_REASONING_COMMIT`; a pure rerun with identical
evidence uses `MANUAL_REANALYSIS_COMMIT`. The request contains an optimistic
`expectedCurrentVersion` and an optional replacement
patch of per-question reasoning notes. The server:

1. reloads every selected answer from the immutable official final;
2. applies only the bounded reasoning patch to the previous learning snapshot;
3. pins the currently approved exact-form context;
4. writes the new version, 25 normalized responses, analysis run, and work item; and
5. advances `learning_submissions.current_version` in one transaction.

An empty or no-op patch is a deliberate rerun with identical evidence. Its `evidence_hash` remains
content-addressed and can therefore equal the preceding version's hash. The version number
is the first-release report-revision envelope described by ADR-004. A future independent
analysis-revision axis is deferred until the product needs multiple concurrent model or
prompt experiments over one evidence snapshot.

The mutation is owner-scoped, CSRF protected, idempotent, and guarded by the expected
current version. A durable per-student and global daily budget plus a hard per-submission
version ceiling bounds cost and storage. A non-terminal batch intake blocks reanalysis so
its `baseVersion` cannot be invalidated. Any older unleased `BLOCKED_CONTEXT` or `QUEUED`
analysis is cancelled with a lease fence before the new version is queued; a `RUNNING`
analysis rejects the restart. Completed reports remain immutable and readable.

The approved-context read and version commit share the exact-form advisory lock used by
context import. Import therefore either commits first and is observed by the reanalysis,
or observes and repairs the newly blocked version afterward; there is no permanently
missed wake-up. The dispatcher lock is taken before the old work row is inspected. If a
worker has already leased the old run, reanalysis returns a conflict rather than claiming
that an unknown provider boundary was cancelled.

Interactive analysis deliberately permits a partial approved context set. Questions that
do not have two eligible, actively authorized solutions remain deterministic
`UNASSESSABLE` entries while eligible questions are analyzed. This supports progressive
manual approval, but the product must call the resulting report partial. Direct
`BATCH_REVIEW` remains stricter and requires complete 25-question context before intake.

`BATCH_COMMIT` versions are not accepted as post-final reanalysis parents in this release.
Their mapped-only, `BATCH_CONFIRMED` evidence cannot be expanded into a complete
`OFFICIAL_FINAL` snapshot without inventing provenance. The API returns a stable 409 before
budget consumption or writes. A future product requirement to combine these lineages must
introduce an explicit branch/merge model rather than reusing this endpoint.

Changed reasoning is durably committed even when approved context is unavailable. Such a
version receives a `BLOCKED_CONTEXT` work item, no analysis run, and causes zero provider
calls until the existing approved-context repair path can pin an active, sealed exact-form
context. A pure rerun without changed evidence fails without writing when context is
unavailable, because it would add no durable student value.

History reads associate every `INTERACTIVE_FINAL` learning version with the same frozen
official score snapshot. Tutor threads continue to pin an exact learning version, run,
report, question, context, and student response. A later reanalysis never changes an old
thread or report.

## Alternatives considered

1. Multiple runs and reports within one learning version. Rejected for this release
   because it expands every read and Tutor contract and does not model changed reasoning.
2. Mutate `attempt_reasoning_notes` after Final. Rejected because it reopens the official
   attempt boundary and destroys reproducibility.
3. Append text server-side. Rejected because retries can duplicate prose. The API uses a
   replacement patch; clients may present an append affordance after loading the full text.
4. Call AI synchronously from Final. Rejected because provider latency and availability
   would determine whether an official contest submission commits.

## Consequences

- Final submission still means “durably queued or explicitly blocked,” not “wait for AI.”
- Old reports and chats remain reproducible; official answers and score cannot drift.
- Pure reruns consume a learning version, so history pagination, quotas, and retention are
  required. The initial hard ceiling is intentionally conservative and configurable.
- Two reports with the same evidence hash may differ because provider output is not
  deterministic; both remain visible rather than one overwriting the other.
- Partial context creates a useful but incomplete report. The UI and operational report
  must expose missing-context outcomes; “queued” is not evidence that all 25 questions can
  be assessed.
- This design deliberately favors a small append-only evolution now. If model comparison,
  prompt A/B tests, or concurrent report branches become requirements, analysis revision
  must become a separate first-class axis rather than further overloading version numbers.
