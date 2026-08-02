# Phase 5c review: analysis v2 and immutable scoring authority

## Outcome

The phase upgrades per-question analysis to the Gateway v2 contract without
changing official scoring, public report shapes, or historical v1 reports. Both
interactive FINAL and confirmed batch versions now derive AI grading context
from the exact immutable result already associated with that version.

## Evidence reviewed

- The API golden is self-contained and pins its complete bytes, context hash,
  input hash, request, model output, and expected output. Client tests reject v1
  schemas/tasks, unscored or contradictory requests, empty/whitespace
  reasoning, removed classifications, semantic answer/classification conflicts,
  lineage drift, redirects, malformed metadata, and oversized data.
- Memory worker tests cover canonical answers, accepted alternatives,
  nonaccepted and blank status, unscored questions with blank/nonblank reasoning
  and missing context, invalid scoring, v1 queue isolation, all five scoring
  fields drifting between claim and authorization, and exact batch result-item
  selection after live form drift.
- Migration tests cover lock-before-drain ordering, SQLSTATE `55006`, terminal
  v1/queued v2 mapping, the v2 default, validated scoring constraints,
  alternative answers, duplicate/unordered options, selected/is-correct
  contradictions, unscored nonzero points in both snapshot tables, and all
  three append-only triggers.
- A disposable PostgreSQL 16 database ran the complete 001→010 chain. The smoke
  test additionally proves exact official and batch sources despite form-row
  drift, repeatable-read authorization rejection for a valid but drifted claim,
  v2 run metadata, migration rerun safety, and official score immutability.

## Critical findings and resolution

The initial compatibility test read the Gateway fixture from a sibling
repository. That made the API package fail in an independent checkout. The
package now reads only its own golden and freezes the entire file checksum plus
both contract hashes; cross-repository byte comparison is release/system
evidence instead of a package-test dependency.

The first worker draft could have treated current `form_questions` as the
answer authority. That would make old results change when a form row changed
and would lose accepted alternatives and intentional unscored state. Claim and
authorization now select by `answer_origin` and exact submission/batch/version,
with no fallback.

The first migration guard checked for running work without blocking a
concurrent old claim. A table lock now precedes the guard. This closes the
database race during migration, but it does not make an old binary safe after
migration; the deployment runbook therefore requires old API and worker
processes to be stopped and never restarted.

Independent review also found that allowing old API processes to keep serving
mutations during migration could deadlock: API creation takes the analysis-run
table before the work table, while migration locks the work table before the run
table. The runbook and migration comments now require a maintenance window that
stops both old API and worker processes before migration and starts only v2
binaries afterward.

The first deterministic outcome hash did not bind the complete scoring
snapshot. It now uses a v2 domain and includes scoring plus validation state, so
invalid and unscored results remain distinguishable and reproducible.

Independent review then found that hashing the raw invalid scoring object could
throw when a field was missing and therefore leave the work leased instead of
persisting `SCORING_SNAPSHOT_INVALID`. Deterministic outcomes now hash a
presence- and type-safe projection, and an adversarial missing-field test proves
the job completes with zero provider calls.

The same review found a defense-in-depth inconsistency: the worker and both
inference boundaries rejected unscored work, but the store authorization method
could return true for a perfectly matching unscored snapshot. Both Memory and
PostgreSQL authorization now independently require a scored authority, and a
direct store-authorization test proves the unscored case is false.

## Critical reflection

Append-only triggers make the authority stable but also turn scoring correction
into a versioning operation. That is intentional: in-place repair would make an
already delivered report unauditable. Operational tooling must create a new
evidence/result version rather than disable a trigger.

Hashes detect accidental or malicious inconsistency only after trusted code
selects the right rows. They do not prove ownership, entitlement, or freshness;
those remain database joins and immediate authorization checks.

Provider-free handling of unscored questions is conservative. A student may
still benefit from qualitative discussion about such a problem, but silently
using the grading contract would blur product semantics. That should be a
separate, explicitly named tutor/review capability.

Two checked-in goldens can drift. Keeping package tests repository-local is the
right isolation boundary, while a release-level byte comparison and pinned
checksums are required to prove the deployed API/Gateway pair agrees.

## Review decision

**APPROVE WITH DEPLOYMENT CONDITION.** The final `practice-api` suite passed
175/175 with zero skips against both a disposable PostgreSQL 16 container and,
after independent-review fixes, a newly initialized local PostgreSQL 17.9
cluster. Those runs included the complete 001→010 migration-and-smoke scenario
and both real migration adversarial tests. The non-database run separately
passed 172 tests with only the three expected database-dependent skips.

The API/Gateway fixtures were compared outside the package tests and were
byte-identical; both SHA-256 values are
`d929c3d36a12091fa10f3ca1396f7d25b56e57d926977eb90d9ebf79d43b912e`.
All changed JavaScript files passed `node --check`, `git diff --check` passed,
and `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities.

The deployment condition is operational rather than a code deferral: all old
API and analysis-worker processes must be stopped, RUNNING work must be drained,
and no v1 API or worker may restart after migration 010. The migration fails
closed if the drain condition is not met.
