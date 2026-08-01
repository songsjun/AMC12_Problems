# Phase 5b review: unified learning history

## Outcome

The phase adds a read-only, owner-scoped projection across interactive FINAL,
confirmed batch versions, and OPEN_REVIEW. It deliberately adds no tutor API,
provider invocation, work enqueue, or alternative score calculation.

## Evidence reviewed

- Memory tests cover multiple immutable versions, exact historical reports and
  questions, deterministic per-question score, canonical path/cursor rejection,
  BOLA, equal-timestamp pagination, and read-state equality before/after GETs.
- HTTP tests cover `no-store` on authenticated success and 401/404/409/400/429
  errors, the blank-anchor report failure, and owner isolation.
- OPEN_REVIEW tests prove ACTIVE/SUPERSEDED access, then REVOKED retention of
  prompt/choices/own evidence with protected fields and report withheld.
- Tombstone tests prove deleted detail/list omit content and answer-shape
  metadata and question/report reads fail closed.
- PostgreSQL smoke coverage checks historical versions, exact result/report
  parity, official-table immutability, provider-free pure reads, deletion,
  equal-timestamp gap-free pages, migration idempotence, supporting indexes,
  and forced snapshot interleaving with a concurrent revoke.

## Critical findings and resolution

The first draft paginated on a computed maximum activity timestamp. That value
could change when analysis completed and could not be satisfied by a direct
student-history index. It was replaced with `submission.updated_at + id`; the
display activity is computed only after the bounded page is selected.

The first draft also set cache headers only inside route handlers, accepted
non-canonical numeric/UUID paths, treated DELETED like normal protected access,
and returned only the answer key rather than the immutable score snapshot. Each
issue was corrected and regression-tested; an `onSend` policy now also covers
pre-handler rate-limit failures.

Independent review found that the original PostgreSQL adapter assembled one
response from multiple autocommit snapshots. A concurrent revoke, deletion, or
batch commit could therefore mix stale entitlement/current-version metadata
with newer protected rows. Both list and detail now use one short read-only
repeatable-read transaction, and forced interleaving proves a response is a
coherent before-or-after snapshot.

REVOKED and DELETED are intentionally different. Revocation keeps the student's
own record but removes protected solution-derived content. Deletion emits only
minimal tombstone metadata. This distinction is the most important policy
boundary for future chat work.

## Residual risks

- Keyset pagination is not a frozen export under concurrent updates; ADR-007
  documents the boundary.
- The page cap bounds submissions but not all nested version summaries. Indexes
  bound the main lookups; production telemetry must drive future version
  pagination or a compact export representation.
- Exact question/report reads currently assemble the owned submission lineage,
  then select one version. A dedicated exact-version store projection is the
  next performance hardening step if version counts grow.
- The projection currently lives in the large service/store modules. A later
  tutor phase should extract a shared entitlement/read-model module instead of
  reimplementing these rules.
- Provider-call purity is established structurally and by durable-state/call
  assertions; production should also expose a zero-enqueue counter for these
  routes.

## Review decision

**APPROVE.** Two independent post-fix reviews found P0 = 0 and P1 = 0. The
architecture reviewer retained two non-blocking P2 test-hardening suggestions:
a list-specific forced interleave and an explicit timestamp-mask assertion.
The security/PostgreSQL reviewer found no remaining P2 issue.

Final evidence: 163/163 non-PostgreSQL tests passed with one expected database
skip; an independently started fresh PostgreSQL instance passed the complete
1/1 migration-and-smoke scenario and was stopped afterward; syntax checks and
`git diff --check` passed; `npm audit --omit=dev --audit-level=high` reported
zero vulnerabilities. The fresh database scenario includes v1/v2 exact reads,
forced revoke interleaving, PostgreSQL child-route BOLA, deletion tombstones,
pure-read/provider-zero assertions, migration rerun, keyset pagination, and
both supporting index plans. Current-v3 exact v1/v2/v3 behavior is covered by
the Memory/API suite.
