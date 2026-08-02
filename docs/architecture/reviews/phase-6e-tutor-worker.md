# Phase 6e review: Tutor Gateway transport and crash-safe worker

## Outcome

This stage connects durable Tutor jobs to the private loopback AI Gateway. The
browser and persisted job cannot select the endpoint, provider, model, prompt,
schema, tool or generation controls. The worker rebuilds and validates the
complete immutable request, then calls only `POST /v1/tutor-turn` with an
operator-owned bearer token and model binding.

Tutor remains a coordinated default-off feature in the API and independently
supervised worker. Enabling it requires the Gateway model and worker
`AMC12_INFERENCE_MODEL` to agree; provider credentials remain outside the API
environment and no secret is checked into either repository.

## Delivery certainty

The worker persists `MAY_HAVE_BEEN_DELIVERED` before transport. Its four crash
windows fail conservatively:

1. An abort or insufficient remaining lease after durable dispatch makes zero
   provider calls and terminalizes the uncertain intent.
2. A lost dispatch-commit acknowledgement forbids the provider call; a
   best-effort terminal transition or lease recovery observes the durable
   uncertainty.
3. A process/connection/timeout/stream/protocol fault during the call becomes
   `DELIVERY_UNKNOWN` and is never automatically replayed.
4. Provider success followed by uncertain completion persistence is also
   `DELIVERY_UNKNOWN`, not a retry.

Only the Gateway's exact bounded failure envelope can prove
`KNOWN_NO_RESULT`. A strict transient/rate-limit result may enter the Store's
bounded retry path; a permanent result fails, and every malformed or
contradictory envelope is delivery-unknown. The literal
`error=DELIVERY_UNKNOWN` is legal only with the non-retryable
`delivery_unknown` class, so it cannot be disguised as a retryable transient.

The Tutor handler does not heartbeat during a provider call. Construction
requires the durable lease to cover the fixed Gateway timeout plus a five
second persistence margin, and the worker rechecks the remaining lease after
dispatch intent commits. This trades some availability for a simpler proof
that no second worker can safely reclaim the request while transport is live.

## Scheduling and shutdown

The unified dispatcher claims waiting Tutor work before analysis and batch
extraction because a student is synchronously waiting for the conversation,
but `AMC12_TUTOR_MAX_CONCURRENT` defaults to one and must remain below total
concurrency when other handlers are installed. Active work is tracked by kind;
once the Tutor cap is occupied, the next slot claims analysis/batch work. This
preserves low chat latency without allowing a sustained Tutor backlog to starve
report production. A durable PostgreSQL class cursor, advanced in the same
globally serialized transaction as each successful claim, alternates analysis
and batch extraction whenever both are eligible. MemoryStore mirrors this
contract. A batch therefore waits behind at most one successful non-Tutor claim
while its concurrency slot is available, even across processes and restarts;
the global batch cap is checked before rotation and cannot be bypassed.

Within either class, priority is preserved during the normal latency window.
After two minutes ready, work enters an overdue FIFO tier. This prevents a
continuous priority-50 official-analysis stream from indefinitely suppressing
a priority-40 batch-confirmed report. Cooperative shutdown aborts the private
call; because dispatch is already durable, the outcome is uncertainty, not an
automatic replay.

Telemetry tracks oldest ready age separately for Tutor, interactive analysis
and batch extraction. Operators should tune the bounded concurrency values
from those observations without removing either the shared provider budget or
the reserved non-Tutor slot.

## Verification

- API-side Gateway client, worker, dispatcher and deployment tests: 25/25.
- Fairness policy and MemoryStore rotation tests: 5/5; fresh-PostgreSQL full
  smoke, including two-pool rotation and the global batch cap: 1/1.
- API full suite: 250 total, 239 passed, 11 explicit PostgreSQL skips, 0 failed.
- AMC inference Gateway: 8 files / 90 tests passed; TypeScript typecheck passed.
- The contract golden is byte-identical across the API and Gateway and freezes
  request, output and all four lineage hashes.
- Static syntax and scoped diff checks pass.

The independent final disposition is recorded after review of this exact
worktree.

## Critical reflection

Persist-before-call prevents unsafe replay but cannot provide exactly-once
provider execution. A result can be lost after the provider accepted it and
before durable completion; the truthful state is `DELIVERY_UNKNOWN`, and a
student may choose an explicitly budgeted retry. Presenting that uncertainty
is less convenient than silently retrying, but it avoids duplicate cost and
contradictory Tutor histories.

The loopback boundary is only as strong as host isolation: the Gateway and
worker still share a service UID in the first deployment. Separate service
accounts, firewall rules and secret rotation remain production hardening, not
claims made by this stage.

Strict round-robin is intentionally class-level, not student-level. One large
batch extraction can still occupy the single batch slot for its lease duration,
and provider latency can dominate queue age. The design proves fair claiming;
it does not claim an end-to-end completion-time SLO. Oldest-ready alerts and
the batch concurrency cap remain necessary operational controls.
