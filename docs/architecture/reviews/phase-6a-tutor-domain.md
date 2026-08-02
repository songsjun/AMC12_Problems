# Phase 6a review: Tutor domain contract

## Outcome

The application now has a provider-independent Tutor v2 domain module. It
freezes the Gateway-compatible context and hash algorithms, keeps internal
analysis/report lineage separate, enforces complete in-thread history, and
models retry versus unknown-delivery transitions before any database or HTTP
surface is introduced.

## Evidence

- The repository-local Tutor golden has SHA-256
  `97b2c1d24220154af696ae6ff34a9443b5559fa38cd75c4b653c2eac5ef2877f`
  and is byte-identical to the reviewed Gateway fixture.
- Its frozen hashes match exactly:
  - snapshot: `6ddf5866c6b730900056e5cbff9c148e03b1bd1cb7d89284362549b5019c7e69`;
  - context: `ddd6a0f657f48d843ed17e70f492abe053b01100ada1c5762405e91b9dd8f186`;
  - history: `6ca1383060010dfab2a96e5e97bde2e725368a63c5b90eeea60369d5e2670caf`;
  - input: `0a9b8b921c8acd5a2174035ca8534863612970d293ebed5aa96424450e973878`.
- Domain tests cover accepted alternatives, intentionally unscored questions,
  duplicate/unordered options, missing and v1-shaped fields, literal Unicode
  form versions, fork hash semantics, context/history/message/identity tamper,
  turns 1/9/10, request/turn/byte capacity, safe retry, and
  `DELIVERY_UNKNOWN`.
- The focused suite passed 9/9; JavaScript syntax and `git diff --check` passed.

## Critical reflection

Independent review found that the first lease-expiry rule sent every dispatched
job to `DELIVERY_UNKNOWN`, including a Gateway response already classified as
`KNOWN_NO_RESULT`. The transition now distinguishes a retryable known-no-result
from a permanent known failure, while both possibly-delivered and delivered-but-
uncommitted outcomes remain unknown. Review also tightened `RETRY_WAIT` so only
a job still marked retryable can be reclaimed. Adversarial vectors freeze each
branch.

The Gateway's eight-prior-turn sliding window is a transport capability, not a
product policy. The application deliberately refuses turn ten instead of
silently omitting turn one.

The checked-in golden gives independent packages a stable test fixture, but it
can drift from the Gateway copy. Byte comparison belongs in release/system
evidence, not a package test that depends on a sibling checkout.

This phase proves only pure data and state semantics. It does not yet prove
database lineage, BOLA resistance, session/release authorization, durable lease
fencing, or provider behavior. Those remain explicit gates for the persistence,
API, and worker phases.
