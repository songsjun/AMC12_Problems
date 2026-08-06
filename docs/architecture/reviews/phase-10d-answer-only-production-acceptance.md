# Phase 10d: answer-only reanalysis production acceptance

## Outcome

The Final-results refresh control is now the `Analyze again` mutation. The UI
uses an authoritative GET, one idempotent POST, and a postflight GET; it polls
the current submission projection before the exact-version report while work
is `QUEUED` or `RUNNING`. Both active states disable repeat mutations, and the
service rejects a second active request before budgets or writes.

Scored selected answers with empty reasoning use
`amc-analysis-contract-v3/ANSWER_ONLY` and invoke the dedicated AMC Gateway on
port 4110. The provider must return a successful complete response bound to the
request. Its answer-only teaching prose is discarded, because no student
method exists to assess; the Gateway emits the unique conservative result from
the immutable answer status and reviewed solution method tags. Reasoning-mode
responses remain fully model-validated. A completely blank response, an
unscored question, invalid scoring, or unavailable visual context remains a
local explicit outcome.

## Commits and independent review

- UI authority and polling: `06788ac`.
- API, worker, queue deduplication, migration 019, and v3 client: `3eaa007`.
- Governed 2025A context review record: `e206a5b`.
- Gateway v3: `ef9cfda`.
- Gateway answer-only normalization after live-provider evidence: `9078d2e`.
- Import/current-version hardening and corrected ADR: `744fe11`.

Independent UI review first rejected draft loss during same-version queue
reconciliation. After the fix, real Chrome fault injection proved draft
retention, no duplicate business POST, conflict reconciliation, and bounded
terminal read retries. Independent API/Gateway review first rejected
whitespace-only batch evidence, then rejected a five-field truncated provider
response accepted by the first normalization patch. Both were fixed and the
final independent disposition was `GO`.

## Backup, migration, context, and restart evidence

The pre-019 custom dump is owner-only at
`/Users/ss/Library/Application Support/Kapy/AMC12/backups/amc12-before-019-20260805.dump`:

- SHA-256 `f2be4a3c94996f76383f9696cd9eebf613ae4b313c92a8b975619e7a380eceea`;
- PostgreSQL 17.9 restore completed with `--exit-on-error` into a unique
  temporary database;
- 18 migration rows, 49 base tables, all core counts, zero invalid indexes,
  zero unvalidated constraints, and zero current-version inconsistencies;
- the API role could read the restored schema but has no `CREATEDB` privilege;
- the temporary database was checked for zero connections and removed by its
  exact validated name.

Migration 019 is recorded exactly once; the production ledger has 19 rows and
the new run default is `amc-analysis-contract-v3`. The 2025A child artifact set
`f8886efc9872d1921ab11a763f4f9e3fabd55766cb1d9b8c2c9c6e924ce0b9e5`
is sealed, active, unsuperseded, and stores 19 ready questions plus 38 active,
model-eligible, receipt-bound solutions. The ready questions are
1, 2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 23, and 25.
Lineage anomalies, active non-current runs, and versions with duplicate runs
are all zero.

Final supervised state after the coordinated restart:

- Gateway `current` symlink target:
  `/opt/kapy/amc-inference-gateway/releases/9078d2e`;
- Gateway PID 50851, API PID 50884, worker PID 50887;
- all three services are `running` with last exit code 0;
- API `/api/amc12/health` and Gateway `/healthz` succeed;
- direct production practice HTML and `app.mjs` return 200, and the deployed
  module contains the authoritative queued-state UI;
- active analysis work after acceptance is zero.

The protected API environment now contains the one reviewed approval-authority
allowlist entry and remains mode 0600. The first import attempt failed before a
context write because this entry was absent. The importer now checks the trust
configuration before running migrations, so the same partial rollout cannot
recur.

## Real 2025A evidence

The existing student `kapy` had already Final-submitted
`amc12-2025-a@archive-2026-08-03-r3`. Context import atomically changed its
current v1 from `CONTEXT_UNAVAILABLE/BLOCKED_CONTEXT` to `CONTEXT_READY`, created
one v3 run, and exposed authoritative `RUNNING` while the worker held one lease.
No duplicate run or worker attempt appeared.

The immutable official result is 97.5/144: 15 answered, 14 correct, 1
incorrect, 9 blank, and 1 unscored. Its ordered submission snapshot SHA-256 is
`e44783b00c83536ad731bdb7dccd4c03035c6e06fdfe3ee82215983f379cd639`.
The same hash was independently recomputed from the pre-019 restored backup and
from current production, proving migration, context import, analysis, and
restarts did not alter the score or answers.

The first live run contained 12 answer-only provider calls. Nine succeeded and
three returned `INVALID_PROVIDER_RESPONSE`, because the model varied harmless
wording from the deterministic object. This evidence triggered the `9078d2e`
forward fix. After deployment, the same 12 requests were reconstructed by
read-only production queries and replayed through the real authenticated 4110
boundary without creating a submission, run, or report:

- 12/12 provider calls returned HTTP 200;
- 12/12 were accepted as `ANSWER_ONLY`;
- every result contained the two ordered reviewed-solution comparisons;
- the previously failing Q1, Q9, and Q12 all succeeded;
- the Gateway audit log contains 12 matching completion events;
- active durable work remained zero.

The original v1 report remains immutably `PARTIAL` with its original 9
successful, 3 failed, and 13 local unassessable outcomes. It is not rewritten
by the forward fix. The student's next explicit `Analyze again` action creates
v2 and will use the corrected Gateway; this acceptance did not impersonate the
student or silently create that immutable version.

## Regression evidence

- Gateway: production build, typecheck, 11 files and 110/110 tests.
- Practice API: 280 tests total, 269 passed, 11 conditional PostgreSQL skips,
  0 failed; focused contract/batch/worker suite 51/51.
- Fresh isolated PostgreSQL 17: analysis migration 3/3, Tutor migration 3/3,
  full migration/import/concurrency smoke 1/1, Tutor Store/HTTP/fencing 7/7.
- UI: syntax checks and 69/69, including real headless-Chrome MathJax smoke,
  GET-POST-GET fences, pending disablement, polling, draft preservation, and
  score/report separation.
- Archive entry: 9/9. Context production validators: 111/111.
- Cross-repository v3 fixture bytes remain equal with SHA-256
  `f387a99360ebf4e34e7b9649f45ebbb76182a614a52be46b8716cc279023f548`.
- `git diff --check` passed. No credential was added to either repository.

## Critical reflection and remaining limits

The user requirement to call AI for an objective answer is satisfied, but it
would be misleading to say AI evaluated a method that was never submitted.
Answer-only feedback therefore reports correctness, the absence of reasoning,
and reviewed reference methods; `confidence=1` is confidence in that
deterministic contract, not in student ability. Personalized gap analysis still
requires student reasoning.

2025A has six archived SVG-dependent questions without a governed model-safe
visual payload: Q5, Q8, Q10, Q14, Q20, and Q24. Interactive analysis can return
a partial report question by question, but the batch-review workspace requires
all 25 questions and therefore remains unavailable for this exact revision.
Q25 is intentionally unscored and remains local. Claiming full 25-question
2025A AI coverage would be false.

An authenticated production browser click was not manufactured after the
historical canary credentials had been revoked: a real click necessarily adds
immutable version/run/report/audit rows and consumes student budgets. The
production import supplied real `QUEUED/RUNNING/terminal` queue evidence, the
real Gateway replay supplied provider evidence, and deterministic Chrome fault
tests supplied UI-state evidence. A future recurring browser canary should use
an isolated restorable database and a supported credential-revocation command,
which the repository does not yet provide.

Finally, Gateway run metadata currently labels the policy boundary provider as
`openai` even though production execution is routed through the configured
local AI Gateway. This pre-existing provenance naming debt is not shown to the
student and does not affect request/result lineage, but it should be split into
policy-gateway and execution-provider fields in a future contract revision.
