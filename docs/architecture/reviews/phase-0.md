# Phase 0 review: architecture and safety baseline

## Scope

This stage records the target bounded contexts, immutable/versioned evidence model, provider and storage boundaries, threat model, acceptance gates, and baseline behavior. It intentionally changes no runtime behavior.

## Verification evidence

Executed from commit `f52fceb` on 2026-08-01:

- content suite: 62 baseline tests passed before implementation; 71 passed after the concurrently prepared Phase 1 content changes;
- API suite: 33 passed, 1 PostgreSQL smoke skipped because no isolated test database was configured;
- UI suite: 23 passed;
- independent security audit: AI Gateway 57 passed; practice API production audit had no finding; Gateway dependency audit reported three unresolved High advisories;
- working-tree secret-prefix check found no copy of the disclosed AssemblyAI credential;
- `git diff --check` passed.

The PostgreSQL skip, dependency advisories, and credential rotation are explicit later release blockers; none is represented as completed evidence.

## Independent review

The architecture reviewer initially rejected the documents because three ADRs were missing, standalone batches could bypass timed release, and FINAL/LearningSubmission transaction semantics were ambiguous. The revised design adds ADR-003/004/005, requires an exact owned FINAL or never-timed `OPEN_REVIEW` revision, and atomically commits the official final, learning snapshot, and local work intent. Final disposition: **APPROVE**, with no blocker or major finding.

The security reviewer initially rejected the documents because the agentic model executor could expose secrets, the Gateway job queue conflicted with deletion, and a standalone batch could disclose the same timed form. The revised design permits only a tool-free synchronous non-persistent inference endpoint, keeps PostgreSQL as the sole durable queue, uses dedicated inference credentials/capacity, adds multi-layer entitlement rechecks, deletion generations, renderer/SSRF/SCA gates, and bounded storage cleanup. Final disposition: **APPROVE**, with no blocker or major finding.

## Reflection

The first design over-trusted two convenient reuse points: a committed batch as a generic release event, and the existing Gateway queue as durable AI infrastructure. Both would have violated core promises—one by creating an answer-release bypass, the other by exposing secrets and retaining undeletable student prompts. The corrected architecture pays for explicit form entitlements and an AMC-owned queue, but the boundaries are testable and deletion is coherent.

Likewise, extracting multiple solution sections is not the same as having trustworthy references. Mathematical review, content rights, and source-hash approval remain human governance tasks. Missing approval must reduce feature availability (`CONTEXT_UNAVAILABLE`), never silently lower correctness or fall back to raw community text.

Finally, the public archive already contains solutions. This feature can enforce its own pre-final API boundary, but it cannot honestly claim a proctored or closed-book environment. That limitation is product scope, not a software defect to disguise.
