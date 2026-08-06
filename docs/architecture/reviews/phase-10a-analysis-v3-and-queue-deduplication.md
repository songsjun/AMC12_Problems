# Phase 10a: analysis v3 and queue deduplication

## Outcome

New analysis runs use `amc-analysis-contract-v3`. A scored response with a
selected answer and no reasoning is sent to the dedicated Gateway as
`ANSWER_ONLY`; a response with neither answer nor reasoning remains a local
deterministic no-attempt. The worker dual-reads durable v2/v3 runs and
authorizes each provider call against the run's exact contract. Migration 019
widens run and Tutor lineage constraints without relabelling v2 history.

The reanalysis transaction rejects both `QUEUED` and `RUNNING` work with
`LEARNING_ANALYSIS_IN_PROGRESS` before budgets or writes. Expected-version,
idempotency, transaction, claim, lease, and provider-authorization fences keep
multi-tab refresh/claim races linear and allow only one active analysis for the
current immutable version.

## Trust boundary

Gateway v3 is additive; v2 remains frozen for drain. The complete
`ANSWER_ONLY` output is derived from the immutable answer status and ordered
approved-solution method tags. Gateway and API require canonical equality with
that object, so model text cannot fabricate a student method. The checked-in
Gateway/API golden fixture is byte-identical and has SHA-256
`f387a99360ebf4e34e7b9649f45ebbb76182a614a52be46b8716cc279023f548`.

## Verification and independent review

- Gateway: 110/110 tests, typecheck, and production build passed. Coverage
  includes v2/v3 wrong-route rejection, complete answer-only tamper matrices,
  authentication, request/output secret canaries, body ceiling, shared rate
  and concurrency gates, caller abort, response close, and pre-abort.
- Practice API: 268 passed, 11 PostgreSQL-conditional skipped, 0 failed in the
  normal full suite after the final fixes.
- Fresh, isolated PostgreSQL 17 runs: analysis migration 3/3, Tutor migration
  3/3, full migration/import/concurrency smoke 1/1, and Tutor
  Store/HTTP/fencing 7/7. A deliberately combined run against one shared
  schema passed the product migration/smoke but left fixture rows that polluted
  the later Tutor file; rerunning every database file against its own clean
  database passed. Release evidence therefore uses the isolated runs, matching
  the repository's established database-test boundary.
- Focused contract, batch-domain, and learning-worker suite: 51/51.
- Cross-repository golden bytes compare equal; syntax and `git diff --check`
  passed. The supplied provider credentials are absent from changed files.

The first independent review was `NO-GO`: batch confirmation retained
whitespace-only reasoning, while v3 classified it as answer-only but required
an exact empty string. The local client rejected it before transport and the
failure audit incorrectly claimed a provider invocation. The batch boundary
now canonicalizes whitespace-only evidence to `""`, the worker repeats that
normalization defensively for historical rows, and a pre-transport rejection
records `providerInvoked=false`. The reviewer reran the real client and observed
one call to `/v3/analyze-question`, exact empty reasoning, and an `ANSWER_ONLY`
result. Final independent disposition: `GO`.

## Critical reflection

Answer-only feedback is intentionally conservative. The provider is invoked,
but the only accepted report states objective correctness, absence of reasoning,
and reviewed reference-method tags. Personal diagnosis without reasoning would
be invented evidence. Requiring the model to reproduce the exact invariant may
raise fail-closed protocol errors, so live-provider acceptance and operational
monitoring are mandatory.

Polling and transaction-level conflict do not cancel queued work when a student
edits a draft. This can delay a newer analysis, but it avoids hidden cancellation
and keeps one server-authoritative active state. A future cancellation feature
would need a new explicit state transition, lease fence, cost policy, and UI;
it must not be inferred from repeated button presses.
