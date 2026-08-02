# ADR-002: Run external AI work in a durable background module

## Status

Accepted

## Context

Audio transcription, batch extraction, per-question analysis, and tutor responses have different latency and failure modes. AssemblyAI and the local AI Gateway can time out, rate-limit, restart, or retain terminal state for less time than a student report must exist. Calling them inside final-submission transactions would couple official scoring to external availability.

## Decision

Keep the application as a modular monolith but add a separately runnable worker using PostgreSQL work records and leases. API transactions store intent and return stable application IDs; the worker calls provider adapters, validates results, and persists application-owned output immediately. PostgreSQL is the only durable application queue and stores leases, retry state, priority, and deletion generation.

Use the pre-recorded AssemblyAI API for uploaded files. Keep the API key server-side, store the provider transcript ID before polling, and request provider deletion after the transcript is durably stored.

The current AI Gateway's agentic CLI execution and persistent job paths are not acceptable boundaries for untrusted student or community content: a read-only filesystem sandbox does not prevent secret reads, and the completed-job API cannot immediately purge stored prompts/results. This feature may call the Gateway only after it exposes a tool-free synchronous inference endpoint that does not persist prompts, results, or raw stdout/stderr. The inference process holds credentials outside model-visible tools, uses an explicit minimal environment, and has no shell, filesystem, or arbitrary network capability. Merely adding prompt instructions is not a control. Production-equivalent canary tests must cover inherited secrets, host files, and the executor's own provider credential.

Use a dedicated AMC Gateway instance/token or tenant-scoped credential so another application cannot read/cancel AMC work or consume its reserved capacity. Gateway IDs are infrastructure details and never enter browser responses. The AMC worker dispatches lazily from PostgreSQL and uses bounded synchronous calls after the isolation gate passes; it never preloads an entire form into external shared capacity.

Persist only schema-validated application output, input/output hashes, model/schema versions, usage/cost, latency, and redacted error codes. Raw provider output is transient and is not a long-term audit record.

Question analysis additionally follows the versioned contract and immutable
scoring-source decision in `ADR-008`. A worker claims only the contract version
it implements and re-authorizes the exact official or batch result snapshot
immediately before the provider call.

## Alternatives

### Synchronous provider calls inside browser/API request transactions

Simpler request flow, but nginx/client timeouts, lost responses, provider outages, and long database locks make it unsafe for final submission and poor for batch work.

### Dedicated microservices and a distributed message broker

Supports independent scaling but adds deployment, tracing, and consistency complexity that the current single-host workload does not justify.

## Consequences

- Final scoring works when AI is unavailable.
- Jobs survive API and worker restarts through PostgreSQL leases.
- Chat and background work need explicit priority/capacity policy.
- Gateway isolation and environment minimization become deployment invariants, not optional hardening.
- Queue depth, lease recovery, provider latency/error/cost, and correlation/work/run IDs are observable without logging student text.
- File storage is initially single-host and must move behind a storage adapter before multi-host deployment.
