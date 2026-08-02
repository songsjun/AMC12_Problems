# Phase 6g: AMC learning-review system acceptance

## Accepted outcome

The implementation now has one learning lifecycle behind two student entry
paths:

1. A timed final or open-review submission freezes the student's selected
   answers and per-question reasoning into an immutable learning version.
2. A private text/audio batch is normalized (audio through the AssemblyAI
   adapter), decomposed by the private AMC inference Gateway, explicitly mapped
   or discarded by the student, scored only for confirmed mapped questions,
   and committed as another immutable learning version.

Both paths use the same scoring-aware per-question analyzer, approved question
context, multiple model-eligible solutions, report model, learning history, and
question-scoped Tutor snapshot. Objective scoring remains authoritative and
renders independently of AI availability. The Tutor request contains the exact
question Markdown, approved solutions, frozen answer/reasoning, immutable
scoring, and successful conversation history, but the server—not the browser—
derives and validates all of that context on every command and worker fence.

## Architecture evidence

- Private solution candidates require explicit approval receipts, release
  lineage, rights/reviewer metadata, deterministic hashes, and model-eligibility
  gates. Visual or otherwise unfit context never reaches the model.
- Batch files live outside the source/static tree; quotas, streaming limits,
  media validation, provider-work budgets, purge state, retention evidence,
  idempotency, and deletion fences are durable.
- Learning versions, question responses, objective scoring snapshots, analysis
  runs, reports, Tutor snapshots, threads, messages, jobs, and lineage hashes
  are persisted separately. Raw upload cleanup does not erase an already
  committed learning/Tutor authority.
- Tutor HTTP is default-off, owner/path scoped, CSRF protected, no-store,
  idempotent, body bounded, and budgeted. Stale source exposes only a deletable
  summary and never a full bundle.
- Worker transport is fixed to loopback Gateway endpoints and operator-owned
  token/model configuration. Dispatch intent precedes provider transport;
  ambiguous delivery is terminal until an explicit student retry.
- Tutor concurrency leaves non-Tutor capacity. A PostgreSQL-persisted class
  cursor alternates analysis and batch extraction across processes; a 120-second
  overdue FIFO tier prevents class-local priority starvation.
- The UI unifies results, reports, batch confirmation, history, question review,
  and Tutor. Identity/generation/tombstone fences reject late responses, while
  restricted Markdown/TeX rendering and DOM purge protect retained content.

## Final verification on committed trees

- Practice API without a configured database: 250 total, 239 passed, 11
  explicit PostgreSQL skips, 0 failed.
- PostgreSQL files, each on its own fresh database:
  - analysis-v2 migrations: 3/3;
  - Tutor migrations: 3/3;
  - Tutor PostgreSQL Store/HTTP/fencing/capacity: 7/7;
  - full migration/archive/open-review/batch/history/Tutor smoke: 1/1.
- Student UI: 54/54, 0 skipped. Real Chrome rendered ordinary AMC TeX while
  hostile TeX/DOM/resource probes created no dangerous node, attribute, or
  outbound request.
- AMC inference Gateway: 8 files / 90 tests; TypeScript typecheck passed.
- Private content and multi-solution compiler: 106/106 Python tests.
- Static syntax, scoped secret-shape scans, and `git diff --check` passed.
- Independent Worker and UI reviews both returned APPROVE with P0=0 and P1=0.

No live AssemblyAI or model-provider call was made during acceptance. Provider
adapters and crash boundaries were tested against deterministic fakes and local
Gateway contracts, avoiding external cost and avoiding use or storage of the
credential disclosed in the request.

## Failed acceptance attempts and what they mean

Running every PostgreSQL test file concurrently against one database produced
two fixture-interference failures; running them serially in that same database
produced seven failures after the smoke test intentionally revoked/reset shared
fixed authorities. Each file passed on an independent fresh database. This is
a test-isolation limitation, not evidence that production transactions failed,
but it should be fixed with per-file schemas/databases before a single-command
database-enabled CI job is advertised.

## Critical reflection and production gates

The architecture proves bounded, authorized, reproducible state transitions;
it does not prove pedagogical truth. Model analysis can still be incomplete or
wrong, so reports preserve uncertainty and approved solutions remain visible
for comparison. Human approval quality and solution coverage are upstream
quality controls, not problems an LLM can repair.

At-least-once infrastructure cannot provide exactly-once provider execution.
`DELIVERY_UNKNOWN` is intentionally honest; an explicit retry can cost money
twice. Tutor concurrency is process-local in the first deployment, so multiple
Worker replicas require a global Gateway/Tutor capacity mechanism. The first
launchd deployment also shares one service UID and therefore one trusted
computing base.

Before production enablement:

1. Rotate the AssemblyAI credential disclosed in the request and install the
   replacement only in the protected Worker environment; never commit it.
2. Deploy migrations, approved context, Gateway and Worker first; run private
   text/audio/analyze/Tutor canaries, then enable the API Tutor flag.
3. Verify the account-specific AssemblyAI retention profile and deletion
   evidence process rather than assuming elapsed time means deletion.
4. Add Gateway startup model handshake, global capacity coordination for more
   than one Worker, per-file PostgreSQL CI isolation, Tutor polling backoff,
   async button owner tokens, focus restoration, and a mock-API browser workflow
   suite before claiming production-hardening beyond the accepted first release.
