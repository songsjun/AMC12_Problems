# ADR-006: Separate open-review delivery from timed practice

## Status

Accepted

## Context

Students need to upload text/audio answers and reasoning without first taking a
timed attempt. Reusing the timed state machine would manufacture a clock,
mutable answer sheet, and official submission, while exposing one question set
through two incompatible release policies. Treating a batch as free-floating
would lose ownership, exact form revision, approved solutions, and revocation
lineage.

## Decision

`Attempt` gains an immutable delivery mode. `TIMED` retains the existing clock,
answer, timer-event, and official-scoring rules. `OPEN_REVIEW` is an untimed
owner-scoped workspace in the fixed `OPEN_REVIEW/PAUSED` state. Its v1 learning
version is a blank anchor pinned to one release and approved context set; it has
no attempt answers, reasoning notes, official submission, timer events, or AI
work. The first student-confirmed batch creates immutable v2 with only mapped
questions, deterministic `MAPPED_QUESTIONS_ONLY` grading, and ordinary analysis
work.

An operator publishes a release only for an unpublished exact form revision
whose active approved context contains at least two model-eligible solutions
for every question. The release stores form/content/question-bundle/context
hashes and approval authority. Its lifecycle is append-only audit plus the
one-way transitions:

```text
ACTIVE ──> SUPERSEDED_VALID ──> REVOKED
   └──────────────────────────> REVOKED
```

- `ACTIVE`: list publicly; create/replay workspaces; create and continue batches.
- `SUPERSEDED_VALID`: no new workspaces or batches; existing evidence, reports,
  and pinned context remain usable.
- `REVOKED`: protected inference/report context is unavailable; leased work is
  cancelled. Provider reconciliation and local deletion continue under an
  explicit `CLEANUP` entitlement that proves the same immutable lineage.

Workspace history exposes the release status, a coarse protected-access status,
and the current version's actual analysis-work status. After revocation,
owner-submitted and explicitly confirmed evidence remains inspectable, but the
deterministic result projection (including correctness, accepted answers, and
points) and the solution-grounded report are withheld. Cleanup responses use
the same redacted projection.

Question mapping/extraction receives student evidence and the redacted question
catalog, never answers or solutions. Analysis runs only after explicit mapping
confirmation and receives the release-pinned approved solutions. Official
`submissions` and `submission_answers` are never created or changed by this
path.

The database is the final delivery fence. Release insertion, timed-attempt
insertion, and `published=true` all take the same advisory lock derived from
`question_bundle_hash` before checking form rows. A release conflicts with both
its exact revision and any published/timed clone sharing that bundle. A later
open-review successor may reuse the bundle while pinning a new exact
form/context revision. Partial indexes separately enforce one active timed
attempt and one open workspace. A further partial unique index on
`question_bundle_hash WHERE status='ACTIVE'` prevents two releases with
different form IDs from simultaneously advertising the same questions.

Release administration remains a local operator CLI backed directly by the
store. Student routes expose only active catalog entries and owner-scoped
workspaces. Workspace creation requires CSRF and an idempotency key; PostgreSQL
serializes the no-row case and rechecks the key before insertion.

Successor rollout is deliberately two-step: first supersede, then publish. The
interval is a fail-closed catalog gap, not an atomic handoff. Operations must
audit both append-only events and retry or remediate a failed second step; no
successor relationship is fabricated without a successfully published release.

## Consequences and reflection

The shared attempt identity lets existing batch/report ownership and BOLA
checks be reused, but every timed query and mutation must explicitly filter or
reject `OPEN_REVIEW`; database constraints backstop omissions. A distinct
top-level workspace aggregate would reduce mode branching but duplicate the
learning and batch lineage machinery.

Revocation is intentionally stronger than supersession: even an already built
report is hidden because its protected solution context is withdrawn. It is
not data erasure. Upload/provider cleanup and deletion of the durable student
learning record are different policies and must not be represented by the same
flag.

Revocation also cannot promise that the provider observes zero calls. There is
an unavoidable boundary between a successful authorization and the external
invocation: if revocation commits inside that interval, the pre-authorized call
may begin or may only be aborted best-effort. The enforceable contract is that
no authorization starts after committed revocation and every post-revocation
completion is fenced from durable protected state and student output.

The release gate requires complete multi-solution context, which can delay
availability and makes partial-form open review impossible in this version.
That cost is accepted to keep catalog semantics simple and prevent students
from discovering only after upload that some questions cannot be grounded.
