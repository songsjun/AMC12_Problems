# ADR-007: Project one owner-scoped learning-history read model

## Status

Accepted

## Context

Interactive FINAL review, confirmed batch revisions, and OPEN_REVIEW now create
the same immutable `LearningSubmission` lineage, but their existing read routes
are organized around the workflow that created them. Students need one history
that shows every submitted revision, its deterministic result, its exact
analysis/report, and its own answer/reasoning evidence without causing new AI
work. Later question chat will consume the same exact-version projection.

This boundary has unusual disclosure rules. Timed FINAL results are permanent;
an ACTIVE or SUPERSEDED_VALID open-review release retains protected access; a
REVOKED release retains the prompt, choices, and owner-confirmed evidence but
withholds answers, correctness, points, solution comparisons, and reports. A
deleted learning submission is a minimal tombstone, not another revocation
case. The blank OPEN_REVIEW v1 anchor has no report.

## Decision

Add a localized CQRS read model over the existing immutable write aggregates.
It introduces no history table, writer, queue, provider call, tutor thread, or
second scoring implementation. Memory and PostgreSQL adapters assemble the
same owner-filtered record; the application service alone applies release and
deletion policy.

The read API is:

- `GET /learning-history`: a bounded owner-scoped page. Every item includes
  summaries of all immutable versions as well as current/release/status data.
- `GET /learning-history/:submissionId`: the same lineage with every immutable
  version, mapped-question count, batch lineage, and analysis/result/report
  state.
- `GET /learning-history/:submissionId/versions/:versionNumber/questions/:questionNumber`:
  exact pinned question, choices, owner evidence, exact deterministic result,
  and solution-grounded analysis when entitled.
- `GET /learning-history/:submissionId/versions/:versionNumber/report`: the
  stored report for that exact version; the blank anchor fails explicitly.

All four routes set `Cache-Control: no-store` and `Pragma: no-cache` before
authentication so success and error responses share the cache policy. BOLA
returns 404. Version/question path values accept canonical positive decimal
strings only. Cursors are canonical unpadded base64url encoding of the exact
versioned JSON schema `{v,updatedAt,submissionId}`; altered encodings fail.

Pagination orders by `(learning_submissions.updated_at DESC, id DESC)` and uses
the matching `(student_id, updated_at DESC, id DESC)` index. PostgreSQL first
materializes at most `limit + 1` identities, then enriches only that bounded
page. `lastActivityAt` remains a separately computed presentation field; work
or report timestamps never silently change cursor semantics. The UUID tie
breaker makes equal timestamps total and deterministic.

Every PostgreSQL projection uses one short `REPEATABLE READ READ ONLY`
transaction and one client. Its first owner/release query is the authorization
and consistency linearization point: a concurrent batch commit, revoke, or
deletion is observed wholly before or wholly after a response snapshot, never
as a mixture of stale entitlement and newer protected rows. A subsequent
request always observes a transition that committed before its snapshot.

Protected output follows this matrix:

| State | Prompt/choices | Own answer/reasoning | Answer/result/analysis/report |
| --- | --- | --- | --- |
| Timed FINAL | visible | visible | visible |
| OPEN_REVIEW ACTIVE | visible | visible | visible |
| OPEN_REVIEW SUPERSEDED_VALID | visible | visible | visible for existing work |
| OPEN_REVIEW REVOKED | visible | visible | withheld |
| LearningSubmission DELETED | unavailable | unavailable | unavailable |

Deleted list/detail projections keep only non-content audit identity, lifecycle,
version/reason/time/status data. They omit title/form content, response counts,
question numbers, batch lineage, evidence, results, and analysis. Question and
report reads fail closed. This follows ADR-005's distinction between deleting
uploaded source files and deleting the derived learning record.
REVOKED and DELETED projections also exclude report/work completion timestamps;
their activity fields derive only from submission/version lifecycle timestamps.

Deterministic result fields come from the immutable official
`submission_answers` snapshot for interactive v1 and from
`learning_batch_result_items` for batch versions. They are never recalculated
from a current answer key. Reports and analyses are likewise selected by exact
`learning_submission_version_id`; no endpoint aliases an old URL to the current
version.

## Alternatives considered

1. **Build a denormalized history table.** Rejected for now: it creates a new
   consistency and deletion surface before read volume justifies it.
2. **Merge workflow-specific endpoints in the browser.** Rejected: entitlement,
   BOLA, exact-version, and tombstone policy would be duplicated and drift.
3. **Paginate by computed last activity.** Rejected: work/report completion can
   move rows between pages, and the aggregate cannot use a simple bounded
   student index.
4. **Return only the current version in the list.** Rejected: it hides immutable
   learning history and forces N+1 detail reads to discover revisions.
5. **Treat REVOKED as deleted.** Rejected: revocation withdraws protected
   licensed/approved context but does not erase the student's own evidence.

## Consequences and critical reflection

The design centralizes disclosure and exact-version semantics while preserving
the official scoring tables and worker lifecycle. It is intentionally a read
projection inside the current service/store files; extracting a dedicated
history module becomes worthwhile when tutor delivery or additional consumers
need the same policy.

`updated_at` keyset pagination is deterministic for a fixed database state but
is not snapshot isolation across a long browsing session: a concurrent write
may move a submission ahead of the cursor. A server-side snapshot token would
be required for a frozen multi-page export. That complexity is not justified
for the bounded interactive history view, and the contract does not claim it.

The list carries all version summaries, increasing response size. The 50-item
page cap bounds submission identities, not nested version rows: a submission's
version count currently has no hard ceiling. The two-step query prevents other
students or off-page submissions from being expanded, and supporting indexes
bound the principal lookups, but telemetry must track nested version counts,
p95 bytes, and query time. A future high-volume release needs per-submission
version pagination or a compact/export representation without silently hiding
immutable history.

REVOKED deliberately retains student evidence, which is product history rather
than approved-solution content. A future legal deletion request must invoke the
learning-submission tombstone path; changing release status is not deletion.
Question chat is explicitly out of this change: it must later pin the exact
version and reuse this entitlement projection rather than bypassing it.
