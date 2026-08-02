# ADR-009: Separate Tutor provider snapshots from application lineage

## Status

Accepted

## Context

The Tutor Gateway v2 contract hashes the exact question, approved solutions,
student answer, and student reasoning sent to the model. It deliberately does
not accept analysis-run or report fields. ADR-004 additionally requires a
thread to pin a report/analysis revision and forbids silently summarizing or
discarding older messages.

The Gateway permits at most eight prior turns and, for later turn numbers,
accepts a sliding eight-turn window. Using that allowance directly would drop
the beginning of a conversation without an explicit student decision.

## Decision

Use the Gateway's exact Tutor v2 context and four hash domains without adding
application-only fields:

- `amc-tutor-snapshot-hash-v2` hashes only the immutable Gateway context;
- `amc-tutor-context-hash-v2` additionally binds the thread ID;
- `amc-tutor-history-hash-v2` binds every successful prior user/assistant pair;
- `amc-tutor-input-hash-v2` binds the current message and turn identity.

Canonical JSON is byte-compatible with the Gateway: object keys are sorted,
UTF-8 is used, non-JSON values are rejected, and no newline is appended.

Application lineage is a separate `amc-tutor-thread-lineage-hash-v1`. It binds
the Gateway snapshot hash, exact analysis run and contract version, exact report
and report hash, question-response and scoring-snapshot hashes, scoring origin,
and initial deletion generation. It is never presented as the Gateway
`snapshotHash`. A separate release-lineage hash binds the form revision,
approved-context authority, and optional open-review release; analysis/report
fields do not enter that hash either.

A thread has at most nine successful turns. Turn `N` includes all successful
turns `1..N-1`; failures and `DELIVERY_UNKNOWN` do not consume a successful turn
number. After turn nine, request-count exhaustion, or the history-byte limit,
the application returns `FORK_REQUIRED`. Forking starts an explicit new thread
with empty history; it does not summarize or copy a hidden subset.

Job transition rules distinguish four delivery dispositions. A lease lost
before dispatch can retry. Once delivery may have occurred, expiry becomes
`DELIVERY_UNKNOWN` and never an automatic retry. A known provider rejection
that produced no result may use bounded retry.

## Consequences and reflection

Two hashes are intentionally insufficient in isolation: the Gateway snapshot
proves the model context, while the application lineage proves which historical
analysis/report authorized the conversation. Ownership, entitlement, session,
release status, and deletion fences still require database authorization;
hashes do not replace those checks.

The nine-turn limit is stricter than the Gateway. It costs convenience, but it
makes context loss visible and keeps ADR-004 honest. A future summarization
feature requires a new explicit contract and student-visible lineage.

The Tutor accepts intentionally unscored contexts for qualitative discussion.
Runtime validation can prove structure and output safety, not mathematical
truth or pedagogical quality. The product must retain an AI fallibility notice
and model-quality evaluation rather than treating schema validity as correctness.
