# Learning review acceptance matrix

## Baseline recorded before implementation

Recorded on 2026-08-01 at Git commit `f52fceb`, Node `v25.8.1`, and Python `3.14.3`.

| Suite | Result |
|---|---:|
| `practice-content`: `python3 -m unittest discover -s tests -v` | 62 passed |
| `practice-api`: `npm test` | 33 passed, 1 environment-dependent PostgreSQL test skipped |
| `practice`: `npm test` | 23 passed |
| `ai-gateway`: test suite | 57 passed |
| `practice-api`: `npm audit --omit=dev` | 0 production vulnerabilities |
| `ai-gateway`: production dependency audit | 3 High advisories; release-blocking until upgraded or explicitly resolved |

The skipped PostgreSQL smoke test is a Phase 0 environment gap. From the first database migration onward, skipped PostgreSQL integration is not acceptable release evidence.

## Functional evidence required

| Capability | Evidence |
|---|---|
| Interactive final creates a learning submission | service/API tests covering final, deadline-final, reset history, idempotency, and reconciliation |
| Reasoning is captured without changing scoring | domain/API/UI tests showing score equality and immutable reasoning snapshot |
| Batch text/audio creates the same question-response model | adapter/worker/API tests with mixed files, partial failure, mapping confidence, and correction |
| Reports are per-question and aggregate | schema, grounding, partial/unassessable, retry, and rendered UI tests |
| Multiple solutions are isolated and reviewed | parser/compiler tests plus proof existing manifest output remains byte-for-byte unchanged |
| Question chat is pinned and owner-scoped | context snapshot, history ordering, fork/version, cross-student, pre-final, and failure tests |
| Interactive work is not starved by batch analysis | deterministic dispatcher-priority/concurrency tests |

## Hard security and correctness gates

These are invariants, not model-quality targets:

- 100% of tested pre-final report/context/chat paths deny access.
- 100% of official scores match the existing deterministic scoring behavior with AI enabled, disabled, failed, or timed out.
- 100% of report and tutor paths record reproducible evidence/context/schema versions plus `provider_invoked`; invoked paths also record prompt/model/provider versions, while deterministic or unassessable paths explicitly record `provider_invoked=false`.
- No AI-derived batch mapping, proposed answer, or evidence grouping is treated as confirmed solely from model confidence; every such item requires an explicit student confirmation event.
- No provider key, token, raw error, answer key, or alternate solution appears in a pre-final/browser configuration response.
- The previously disclosed AssemblyAI credential is confirmed revoked; a replacement belongs to a dedicated AMC provider project and secret scans prove it is absent from Git, logs, fixtures, and browser responses.
- Production-equivalent prompt-injection tests prove that model execution cannot read a canary inherited secret or same-host secret file; the existing agentic CLI path is not eligible until this passes.
- The same canary gate proves the model cannot access the executor's provider credential; only a tool-free, non-persistent inference path is eligible.
- Batch/report/chat endpoint-by-state matrices prove no standalone batch can bypass the exact form revision's release entitlement, including an active timed attempt conflict.
- Workers recheck owner, relation, deletion generation, mapping confirmation, and release entitlement before protected context load and provider invocation.
- All new mutations enforce CSRF and idempotency; provider spies record zero calls on rejected requests.
- Model output uses a restricted Markdown/MathJax profile with no raw HTML, external media, active links, style/HTML/URL TeX macros, or unreviewed solution content.
- Dependency audit has no unaccepted High/Critical findings.
- Upload limits pass independently through direct workspace nginx, portal nginx, Fastify, batch, and per-student quota layers while ordinary JSON stays at 64 KiB.
- Per-student request, accepted-byte, and provider-work budgets remain effective across different client IPs and multiple API/store instances; fair claims prevent one student from monopolizing transcription.
- Global byte quota, disk high-watermark, and minimum-free-space tests reject new work safely; orphan/partial/reservation reconciliation and cleanup-backlog/disk alerts are verified.
- Delete/retry/crash tests prove tombstones prevent stale worker results from restoring data, and process death at every provider request/response persistence boundary cannot produce a false deletion-complete claim.

## Model-quality evaluation

Before broad release, build a human-reviewed fixture set containing correct, partially correct, incorrect, novel, blank, ambiguous, bilingual, and transcription-damaged reasoning. Measure:

- question-mapping and answer-extraction accuracy;
- agreement with human reasoning classifications;
- false rejection of valid novel methods;
- unsupported claims and wrong solution citations;
- transcript uncertainty detection;
- report usefulness and tutor factual correctness;
- latency, provider error rate, and cost per submission/chat turn.

Numeric launch thresholds must be set after a baseline is measured and documented. They must not be invented from implementation tests.

## Stage review record

Every implementation commit must include in its commit message or the final delivery evidence:

1. tests executed and result;
2. reviewer blocking findings and resolution;
3. security findings relevant to the stage;
4. explicit trade-off/reflection;
5. known deferred work tied to a later stage or acceptance item.
