# Phase 6b review: Tutor persistence contract

## Outcome

Migration 011 adds four Tutor tables with database-enforced owner, submission,
version, context, analysis, report, and session lineage. Snapshots and messages
are append-only, threads have monotonic revisions and capacity bounds, and jobs
separate safe retry from possibly delivered work.

## Evidence

- A fresh PostgreSQL 17 database applied migrations 001–011, reran the
  migration runner without changing recorded migrations, and passed the
  focused PostgreSQL smoke plus migration tests 2/2.
- PostgreSQL introspection proved four tables, nineteen named lineage
  constraints, and thirteen non-internal triggers are present and validated.
- Focused Tutor domain/migration tests passed 10/10.
- The snapshot identity unique key excludes the client-independent
  `snapshot_hash`; one analysis/report/question lineage therefore cannot be
  duplicated by supplying a different hash.
- Job-to-message and fork-to-job foreign keys use an explicit
  `(id, thread_id, student_id)` candidate key, closing cross-owner joins.
- Independent security and architecture reviews both finished with P0/P1 = 0
  for the database contract.

## Critical reflection

The first draft referenced `(id, thread_id, student_id)` without declaring it a
candidate key; a clean PostgreSQL migration exposed that error before commit.
The key is now explicit. The first snapshot uniqueness rule also included the
snapshot hash, which would have allowed two conflicting snapshots for the same
analysis/report/question lineage. It was narrowed to the semantic identity.

Independent review then rejected the phase with eight P1 findings. In
particular, source type had been incorrectly treated as scoring origin, payload
JSON was not anchored to its relational lineage, job hashes were not bound to
their thread, delivery tuples could move backwards on a terminal update, and a
successful job could commit without its assistant message. The revised schema:

- binds the response origin plus an XOR official-answer/batch-result authority;
- freezes the exact context keys and anchors all identity/release fields,
  including the approved artifact-set hash;
- uses a full job-to-thread lineage FK and a generation-aware insert guard;
- checks delivery monotonicity for every transition and resets a known-safe
  retry only when a new bounded attempt is claimed;
- permits a post-unknown retry only as a separately counted, explicitly
  student-authorized job with one child per parent; and
- uses deferred reciprocal FKs to commit one `SUCCEEDED` job and its exact
  assistant-message ID/hash in one transaction.

Thread creation is now necessarily empty/open, forks pin the successful parent
head, each request ordinal has one job, and deletion generation advances only
with a tombstone. A deferred request-ledger constraint requires the USER
message, request counter/revision, and queued job to commit atomically.
PostgreSQL DML tests execute the successful deferred cycle and reject
append-only mutation, terminal mutation, generation drift, duplicate active
work, a stale lease token, and a possibly-delivered rollback.

A second review correctly found that the reciprocal job/message FKs alone did
not make the thread head atomic, and that a terminal job could still be inserted
without traversing the update state machine. The final persistence contract adds
three deferred head constraints: at commit, successful jobs must be exactly the
contiguous turns `1..N`, every success must have its bound assistant message,
and stored history bytes must equal the actual successful user/reply bodies.
Job insertion now accepts only a clean queued intent. The database requires a
`RUNNING / MAY_HAVE_BEEN_DELIVERED` row version before success or unknown
delivery can be recorded. It cannot prove that this version committed in a
transaction distinct from the outbound call; the Store API and worker
crash-window test are the necessary second half of that safety barrier.

The same review exposed a time-of-check gap after snapshot creation. A shared
database predicate now rechecks source entitlement and the learning-submission
deletion generation for snapshot/thread/job insertion and for claim, dispatch,
and success. It locks the source and open-review release rows so concurrent
source deletion cannot pass between authorization and commit. Session
expiry/revocation uses the database clock and a shared session-row lock at job
boundaries. Source deletion is rejected until its threads and active work have
been resolved and tombstoned. Raw batch asset purging remains intentionally
independent: committed normalized evidence, reports, and Tutor history do not
depend on transient upload storage.

The final PostgreSQL evidence creates a real `BATCH_CONFIRMED` snapshot and
thread, purges the committed batch's transient source through the application
service, and proves the Tutor thread, learning version, report, and history
remain available. A future `available_at` cannot be bypassed with a forged
future application timestamp. A `lock_timeout` concurrency case proves source
deletion actually waits on thread creation before the post-commit deletion
guard rejects it. Tutor writes use the documented lock order `thread -> session
-> learning submission -> open-review release`.

Finally, checking only payload keys was insufficient. The snapshot insert
trigger now reconstructs the exact Gateway context from the immutable response,
official-or-batch scoring row, approved question/choices, and ordered eligible
approved solutions. A structurally valid snapshot with forged student reasoning
is rejected by the PostgreSQL test.

Composite candidate keys duplicate primary-key indexes and make migration 011
heavier. That cost is accepted because complete lineage then fails closed in
PostgreSQL, but the deployment runbook requires a maintenance window and disk
preflight.

SQL checks cannot recompute the application's canonical JSON/content hashes or
prove that an outbound provider call occurred only after the dispatch-intent
transaction committed. Phase 6c adds the Memory/PostgreSQL Store enforcement,
student-safe projection, lease recovery, and privacy-tombstone tests described
in `phase-6c-tutor-store.md`. HTTP publication and provider dispatch still wait
for the server-owned atomic use case and worker gates in that review. The schema
deliberately stores no raw provider request/response envelope; approved context
and student evidence exist only in the pinned snapshot and final messages.
