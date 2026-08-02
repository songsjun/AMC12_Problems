# Phase 6d review: server-owned Tutor application commands

## Outcome

This stage adds the default-off student HTTP/application boundary for
question-scoped Tutor threads. A browser identifies only an owned learning
submission/version/question, a public thread or request ordinal, an
idempotency key, and (for a turn) bounded message text. It cannot submit the
question, answer key, scoring, report, solutions, context hashes, model,
provider, internal job IDs, or deletion generation.

Root creation is one Store unit of work in both adapters. It re-authorizes a
live session and the exact committed source, version, release and deletion
generation; resolves the successful question analysis and COMPLETE/PARTIAL
report; selects the immutable official-final or batch-result scoring row; and
requires at least two approved, model-eligible solutions. Only then does it
derive and atomically persist the pinned snapshot plus empty root thread.
Failures leave neither row.

The same aggregate boundary now owns list filtering, fork-head selection,
public-ordinal retry resolution, and path-scoped deletion. Delete uses its own
idempotency hash domain and no longer has a get-then-delete authorization
window. Replays may use a replacement live session and never adopt caller-
generated replacement IDs.

Provider work uses the same server-owned `PROVIDER_WORK` 24-hour budget as
batch analysis: 30 units per student and 1,000 globally by default. Enqueue and
explicit retry reserve one unit atomically after validation; idempotent replay
does not reserve again and transaction failure rolls the reservation back.
Live threads are capped at 20 per immutable student/version/question and 100
per student. PostgreSQL serializes those reservations with one student
advisory lock, while tombstoning deliberately releases capacity.

## HTTP and release boundary

- All routes inherit the learning-history `no-store` policy, including errors.
- Every mutation requires CSRF; create, message, fork, retry and delete require
  semantic idempotency.
- Exact-path mismatches and stale protected sources fail closed without
  exposing whether another student's resource exists.
- Collection reads return only a safe thread/latest-request summary, ordered by
  `(updatedAt DESC, threadId DESC)`, with a default of 10, hard maximum of 20,
  and canonical opaque cursor. PostgreSQL performs one `LIMIT 21` query with a
  lateral latest-request lookup; full questions, requests and messages remain
  exclusive to the single-thread route. An owner can still see a redacted
  retained identity with `sourceEntitled:false` after deletion-generation or
  release-entitlement loss. Such a row has no latest request and cannot be
  opened or extended, but remains path-deletable so hidden history cannot
  permanently consume the student's thread capacity.
- Student projections omit session IDs, leases, internal jobs and all request,
  context, snapshot, lineage and idempotency hashes. The question projection
  exposes solution references only; complete approved solution Markdown stays
  solely in the server-built Gateway context.
- `AMC12_TUTOR_ENABLED` defaults false, so a rolling deployment cannot expose
  the routes before the provider worker is installed and verified.

## Verification

- Full no-database API suite: 246 tests, 235 pass, 11 explicit PostgreSQL
  environment skips, 0 failures.
- Fresh PostgreSQL database: all Tutor groups 71/71, including the complete
  PostgreSQL Tutor Store file 7/7 and atomic root
  creation, provider budgets, cursor-safe summaries, concurrent live-thread
  caps, path list/fork/retry/delete, lease fencing, expiry recovery and
  tombstone races. The vertical case drives HTTP through PracticeService into
  PostgreSQL and rejects cross-student create/get/message/fork/retry/delete
  while leaving the owner's aggregate unchanged. The temporary database was
  removed after the run.
- Focused HTTP/application/config tests: 12/12.
- `node --check` and `git diff --check` pass.

The independent architecture disposition and any remediation are recorded in
the commit delivery evidence after review of this exact worktree.

## Critical reflection

The first application sketch delegated root construction to several public
Store calls and deleted via read-then-mutate. Both approaches made correctness
depend on orchestration timing. Moving authority resolution and mutation into
aggregate commands increases adapter code, but makes the actual security
claim transactional and testable under concurrency.

Keeping the legacy low-level snapshot/thread methods is a compatibility cost:
they remain useful for migration and Store-invariant tests but are not eligible
HTTP application ports. A future cleanup should make that distinction explicit
in adapter interfaces instead of relying on module ownership.

List reads deliberately keep an owner-only, content-free identity for a
stale/revoked retained thread while direct reads and mutations other than
deletion fail closed. This is not a promise that the full source is readable:
`sourceEntitled:true` means only that the submission generation and release
entitlement are live; the full aggregate read still revalidates every pinned
authority and hash. Keeping a Delete action for every summary avoids an
unrecoverable capacity trap while all non-tombstoned retained rows continue to
count against the 20/100 physical-storage caps.

`CLOSED` discussions continue to count against live capacity until the student
tombstones them. That prevents unlimited retained history from bypassing the
cap, at the cost of requiring explicit cleanup. The shared provider-work
budget also means a batch submission and Tutor can compete during a student's
peak day. Rejection rates and oldest queued Tutor age therefore need production
telemetry before operators tune either limit.
