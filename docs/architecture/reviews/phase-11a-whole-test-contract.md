# Phase 11a: whole-test assessment contract and worker integration

## Outcome

An additive whole-test assessment now follows stable per-question outcomes in
the existing analysis queue. It sends all 25 objective ledger rows and the full
approved context for each model-safe question to a dedicated Gateway contract,
then stores the bounded assessment atomically with the immutable report.

## Review and reflection

Architecture, UI, and SRE subagents independently reviewed the change. Their
common finding was that blanks, answer-only responses, unavailable visual
context, and provider failures must not be treated as evidence of inability.
The output contract therefore binds every qualitative claim to eligible
question numbers and distinguishes method, answer-pattern, and coverage bases.

The API architecture review recommended a durable two-phase checkpoint so a
synthesis retry can never repeat question calls. The first version instead
makes synthesis failure terminal and preserves the question report. This is
less operational machinery and meets the current explicit-rerun workflow, but
does not eliminate replay after a worker process crash. ADR-014 records this as
intentional debt rather than claiming exactly-once delivery.

The SRE review also found that the downstream local AI adapter does not enforce
the configured output-token value. Consequently acceptance relies on strict
request, provider-envelope, structured-output byte limits and schema bounds;
no token-level cost guarantee is claimed.

The first API security disposition was `NO-GO`: unavailable questions still
carried student reasoning and free-form question-analysis text. The release
candidate now replaces those fields with a fixed availability-only projection,
and both API and Gateway reject any deviation. A unique reasoning canary proves
the outbound request contains none of the unavailable evidence. A second
semantic `NO-GO` found that `ANSWER_PATTERN` could cite unavailable or failed
questions. The final evidence rule requires complete available context, a
successful question analysis, a scored question, and a submitted answer.
Unavailable, failed, blank, and unscored questions remain eligible only for a
cautious `COVERAGE_PATTERN` priority action. Final disposition: `GO`.

## Pre-deployment verification

- Gateway typecheck and production build pass; all 12 files and 130/130 tests
  pass, including strict paper contracts, traffic isolation, redaction canary,
  and output evidence fencing.
- Practice API has 309 tests: 298 pass, 11 PostgreSQL-conditional tests skip in
  the default environment, and none fail. The suite covers all 25 rows, all
  eligible solutions, fail-soft synthesis, authorization, report hashing,
  compatibility, and score immutability.
- Cross-repository context and input hashes are byte-identical for the shared
  runtime fixture.
- UI syntax, Node tests, and browser-backed smoke pass 71/71.

Coordinated restart, real 2025A reanalysis, immutable-score comparison, queue
drainage, and report inspection remain the production acceptance phase.
