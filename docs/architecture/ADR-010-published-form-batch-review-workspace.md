# ADR-010: Add a context-late batch workspace for published forms

## Status

Accepted

## Context

ADR-006 permits a student to upload answers without taking a timed attempt, but
`OPEN_REVIEW` is deliberately limited to unpublished material with an operator
release and a complete approved context. AMC students also need a direct batch
entrypoint for the same published exact revision used by timed practice. The
entrypoint must work before approved solution context has been imported; making
context a creation prerequisite would leave the advertised workflow unusable
for many current forms.

Relaxing `OPEN_REVIEW` would erase its publication fence and revocation
semantics. Manufacturing a finalized timed attempt would create false timer,
official-submission, and scoring history. A free-floating upload would lose the
existing owner, BOLA, exact-revision, batch, report, deletion, and Tutor lineage.

## Decision

Add `BATCH_REVIEW` as a third immutable attempt/learning source mode. It is a
student-owned, form-scoped workspace in the fixed `BATCH_REVIEW/PAUSED` state.
One workspace exists per student plus exact `form_id/form_version`; it may
coexist with a `TIMED` attempt for that revision.

Creation requires the exact revision to be published, CSRF, a normalized
idempotency key, and both release flags. It does **not** require approved
context. The v1 anchor contains prompt/choice-only form content, blank learning
responses, and a deterministic evidence hash bound to the student and immutable
form hashes. It contains no context reference, AI work, mutable attempt answer,
reasoning note, official submission, or timer event.

“Published” has two intentionally different meanings across the lifecycle.
Creating a new workspace requires `published = true`, so a successor revision
immediately becomes the only new entrypoint. An existing workspace and its
confirmed versions use the immutable publication anchor (`published_at IS NOT
NULL`), not current catalog visibility. Publishing a successor may therefore
clear the predecessor's `published` flag without stranding the predecessor's
workspace, upload recovery, history, report, or Tutor lineage. The release
immutability trigger protects content and identity columns but permits that
publication lifecycle transition.

Existing batch upload, transcription, decomposition, confirmation, deterministic
mapped-only grading, history, report, deletion, and Tutor paths are reused.
For this source, “exact active context” means the active context binds the same
immutable release hashes and covers every question in the form, with at least
two model-eligible solutions carrying active authority receipts per question.
A partial context is not silently treated as ready, even when the student's
batch maps only to a covered question. Confirmation creates a new immutable
`BATCH_COMMIT` version:

- if exact active context is available, the version and analysis run pin it;
- otherwise the version is `CONTEXT_UNAVAILABLE` with a `BLOCKED_CONTEXT` work
  item and no provider call;
- an exact approved-context import atomically binds the blocked version and
  queues analysis using the existing repair path.

The pinned context may use strict human-review v1 or operator-delegated
AI-assisted v2 approval lineage. Readiness semantics are identical, while v2
retains governance, model/run, operator authorization, and source/supplement
provenance in Memory and PostgreSQL. Test-only, mixed-policy, unknown-field,
tampered, or incomplete audit envelopes remain non-importable.

Confirmation and approved-context import take the same exact-form advisory
lock. This serializes the context read with version creation/repair and closes
the missed-wakeup interleaving where confirmation sees no context immediately
after an importer has already searched for blocked work. Re-importing an
already-active artifact runs the repair path idempotently. Workspace creation
takes the existing delivery-bundle advisory lock before locking the form row,
matching publication and delivery-fence lock order.

Reports expose the blocked state while context is missing. Tutor creation joins
an exact completed analysis/report/context/scoring lineage and therefore fails
closed until repair and analysis finish. The workspace projection separately
reports dynamic `analysisContextStatus` (`READY` or `UNAVAILABLE`) so the UI can
explain the current capability without pretending the blank anchor has been
analyzed.

The blank anchor is not a question-history resource. Every per-question read
for `BATCH_REVIEW_ANCHOR` returns the same not-found response, so enumerating
questions cannot turn its server-held scoring snapshot into an answer-key
oracle. A `BATCH_COMMIT` version exposes only questions represented by its
mapped result items; an unmapped blank response is also not found. Official
answers, accepted alternatives, and result fields are consequently returned
only for a student-confirmed mapped question.

The database widens source constraints, rejects all timed children for the new
mode, and keeps one owner/revision workspace. A common entitlement predicate
proves owner, source, attempt, exact form, publication, lifecycle, and purpose
for every HTTP and worker operation. Form import is itself a transactional
aggregate build: an unpublished `content_sealed=false` header declares its
question count, append-only question rows are inserted, and one database-
validated transition seals a continuous `1..N` set with strict A-E structure
before optional publication. Catalog, delivery, context import, worker,
history, and Tutor paths ignore unsealed forms. Approved-context import then assembles an inactive
`sealed=false` staging aggregate and atomically seals it only after the database
verifies its declared/actual question and solution counts. Runtime selection
and new release/version pins accept only sealed contexts. After sealing, header
audit lineage and every child are permanently immutable; the sole remaining
header transition is one-way `active → superseded`. A standalone artifact also
cannot later acquire an archive-wrapper association in place: that lineage
mismatch fails with `CONTEXT_ARCHIVE_LINEAGE_CONFLICT` and requires a distinct
approved artifact revision. Form question updates/deletes are permanently
forbidden, and inserts are accepted only while the parent is unsealed. Direct
form-header and question DML takes the same exact-form advisory lock as both
imports, while context-child inserts row-lock their staging header. These locks
close both seal-before-commit races; prompt, choices, scoring fields, solutions, release
hashes, eligibility, and other content identity cannot drift afterward.
Publication remains a separate controlled lifecycle: first publication must
atomically set `published=true` and a non-null `published_at`, unpublication
retains that timestamp, and re-publication cannot rewrite it.

Before deploying migration 015 to an environment with historical approved
contexts, operations must replay the retained external v1 artifacts and
authority receipts through the current validator and compare their hashes to
the database inventory. The migration fails closed on database-visible form
lineage and child-count drift, then backfills structurally valid historical
rows as sealed (including legitimate zero-ready-question aggregates). It cannot
retroactively prove authenticity from relational rows alone; external artifact
replay is therefore a deployment gate, not an optional post-deploy audit.

`AMC12_BATCH_REVIEW_ENABLED` is an explicit, default-false gate independent of
the default-false batch-intake gate. Form and workspace projections expose
availability only when both gates and publication permit it. No production
environment is enabled by this change.

## Consequences and critical reflection

Reusing the attempt identity avoids a second ownership and deletion hierarchy,
but increases the cost of negative guarantees: every timed operation must
reject every non-`TIMED` mode, not merely `OPEN_REVIEW`. Database constraints
remain necessary because an application-only mode check is too easy to omit.

Context-late creation improves reachability but means “upload accepted” does not
guarantee “AI report immediately available.” This is intentional and visible;
silently falling back to a model without approved solutions would violate the
product's core pedagogical claim. Operational monitoring must track the age of
`BLOCKED_CONTEXT` work and approved-context coverage, otherwise technically
durable submissions can remain educationally incomplete indefinitely.

Requiring complete 25-question context is deliberately stricter than analyzing
only the questions mapped in one upload. It gives workspace status, reports,
history, retries, and Tutor one stable readiness meaning, but can delay useful
feedback for a student whose particular question is already covered. A future
per-question readiness model would need a different report contract and must
not be introduced by weakening this aggregate invariant in place.

`analysisContextStatus=READY` is a current capability projection, not historical
lineage. Historical reports and Tutor always use the context pinned to their
learning version. UI copy must not imply that a later context import rewrites a
student's confirmed evidence or deterministic grading.

The feature flag is not a deletion mechanism. Disabling it closes discovery and
workspace creation but does not erase durable work. A rollback policy must
explicitly decide whether already-started uploads remain operable under the
shared intake flag; deleting or hiding them as an incidental flag effect would
strand private evidence and provider cleanup obligations.

This design still relies on AI extraction before human mapping confirmation.
Schema validation, hashes, and multiple approved solutions improve traceability,
not mathematical correctness. Low-confidence mappings must stay confirmable,
reports must retain fallibility language, and quality evaluation must measure
pedagogical usefulness rather than only job completion.

Append-only staging deliberately trades repair convenience for provenance. A
malformed child inserted by direct SQL cannot be edited or deleted and an
unsealed header cannot be overwritten by a later importer; it stays invisible
and fails with `FORM_REVISION_NOT_SEALED`. Normal imports avoid this state by
building and sealing in one transaction, but an over-privileged direct writer
could still squat on a future form identity and create an operational denial of
service. Production roles should therefore deny table DML outside the importer,
alert on committed unsealed rows, and recover by an audited replacement identity
or explicit follow-up migration rather than silently blessing or rewriting the
staged evidence.
