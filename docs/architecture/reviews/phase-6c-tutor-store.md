# Phase 6c review: Tutor Store adapters and recovery

## Outcome

MemoryStore and PostgresStore now implement the frozen Tutor v2 persistence
contract. They reconstruct and hash-check every Gateway request, commit a
durable dispatch intent before a provider may be called, bind a successful
Gateway envelope to the exact job and context, atomically publish the assistant
message and thread head, and fail closed after session/source revocation or
thread tombstone.

Student reads use a dedicated projection. It contains the question reference,
displayable question data, request statuses, and messages, but no snapshot row,
lease token/owner, authorized session, idempotency key, request hash, or internal
lineage hash. The first PostgreSQL query is owner-scoped and holds a shared
thread/source lock for the complete consistent read.

## Evidence

- `npm test` without a database: 199 tests, 194 passed, 5 PostgreSQL-only tests
  skipped, 0 failed.
- Fresh isolated PostgreSQL database:
  - Tutor Store integration: 1/1 passed;
  - migration/static/011-to-012 upgrade: 3/3 passed;
  - migration rerun and PostgreSQL smoke: 1/1 passed.
- The expanded PostgreSQL Store scenario covers stale lease tokens, expired
  safe recovery, `MAY_HAVE_BEEN_DELIVERED -> DELIVERY_UNKNOWN`, final-attempt
  exhaustion, strict Gateway response identity and usage, atomic success,
  explicit retry, cross-session idempotent replay, concurrent one-child retry,
  fork persistence, two-worker claim, student capacity, session revocation, and
  student-safe serialization.
- Queued claim, expired-safe recovery, and expired-MAY recovery each race a
  privacy tombstone under a three-second deadlock bound. Five additional fresh
  database repetitions passed.
- Memory parity tests cover official and batch scoring authority, source type,
  missing source, source entitlement loss, revoked-session capacity release,
  queue/lease bounds, ID collision, tombstone fencing, and safe projection.
- `node --check`, `git diff --check`, and an exact diff check proving migration
  011 is byte-identical to its committed version all pass.

PostgreSQL tests use a fresh database per integration file. Sharing one mutable
database between independently authored fixtures is not valid evidence: an
earlier fixture may intentionally leave queued global AI work, changing which
job a later dispatcher test claims.

## Critical reflection

The first Store draft recovered expired jobs with job-first bulk updates. A
Tutor job trigger then acquired its thread, while tombstone acquired the thread
before jobs; the inverse order admitted a real PostgreSQL deadlock. Recovery is
now a bounded thread-first scan (`thread -> job -> session -> source`). The
16-thread bound avoids long transactions, but a large invalid backlog may need
multiple polling cycles. Operational monitoring must therefore alert on oldest
ready-job age, not assume one poll drains every stale row.

Skipping a revoked session was also unsafe. Queued work remained active forever
and could permanently consume both per-student slots. Reconciliation now
terminalizes known-safe work as `CANCELLED`; a possibly delivered call remains
`DELIVERY_UNKNOWN` and is never retried without a separate student-authorized
job.

The initial read method returned the internal aggregate, including the lease
token and authorized session. Owner checking alone did not make that response
safe. A named student projection now makes accidental serialization
structurally difficult, while worker aggregates remain transaction-private.

Idempotency initially included the login session and caller correlation. Those
are transport facts, not semantic request identity. A live replacement session
may now replay the immutable job; the persisted correlation and original
session fence are returned unchanged. A revoked original active job is still
cancelled by reconciliation before a new explicit action can proceed.

Accepting only reply text/hash from the worker was insufficient because a
response from another turn could be attached to this job. Completion now
validates the exact Gateway success shape, all context/history/input hashes,
thread/turn identity, model and prompt versions, bounded token arithmetic, and
latency. The Store computes the reply hash itself. Optional cache-write and
reasoning token fields are covered explicitly.

PostgreSQL now owns persisted enqueue/retry timestamps and retry-delay
calculation. Shared validators close the earlier Memory/PostgreSQL difference
for priority, attempts, leases, and retry delays. Explicit caller-supplied IDs
also fail closed rather than overwriting Memory rows.

## Release gates for the next phase

These Store primitives are intentionally not exposed as HTTP routes yet.
Snapshot plus root-thread creation must become one server-owned transaction
that locks the exact submission/version/question and constructs all context
from authoritative rows. A browser must never submit question text, approved
solutions, scoring, hashes, internal IDs, model names, or provider metadata.

The HTTP service must add authenticated, CSRF-protected, `no-store`, stable-404
routes under the learning-history question resource and return only the safe
DTO. Fork selects the successful head server-side; retry addresses the public
request ordinal. The worker must prove the dispatch-intent commit barrier and
the four crash windows before the routes are enabled. These are next-phase
release blockers, not capabilities implied by this Store commit.
