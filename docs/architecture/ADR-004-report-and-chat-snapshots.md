# ADR-004: Pin reports and tutor threads to immutable snapshots

## Status

Accepted

## Context

Student evidence can be corrected after transcription, content solutions can be re-reviewed, reports can be rerun, and a tutor conversation can last across those changes. Rebuilding context from whichever rows are current would silently change the meaning of an old report or conversation.

## Decision

Every analysis run records the learning-submission version, form revision, question-context hash, student-evidence hash, prompt/schema version, provider, and model. A tutor thread additionally pins one question number and analysis revision. The server constructs the context from those owned references; clients never supply authoritative question text, solutions, answer keys, report text, or release state.

Corrections and supplemental reasoning create a new learning-submission version. Re-analysis creates a new report revision. Continuing with changed evidence/context requires an explicit new or forked tutor thread; existing reports and threads remain readable against their original snapshots.

The first release uses bounded, ordered, asynchronous chat turns. It does not silently summarize or discard old messages and does not claim token streaming. When the context budget is reached, the user must fork a new thread with an explicit snapshot.

Batch extraction and question mapping never receive correct answers or solutions. Release entitlement is rechecked before enqueue and again by the worker before loading any protected context or calling inference. Missing/low-confidence mappings cannot open a tutor thread. Polling is read-only and never creates provider cost; no token or infrastructure job ID appears in a URL.

## Consequences

- Historical feedback is reproducible and auditable.
- Storage use grows and needs retention/deletion rules.
- Context builders and API authorization are server-side responsibilities.
- Re-analysis can disagree with an older report without rewriting history.
