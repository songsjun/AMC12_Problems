# ADR-004: Pin reports and tutor threads to immutable snapshots

## Status

Accepted

## Context

Student evidence can be corrected after transcription, content solutions can be re-reviewed, reports can be rerun, and a tutor conversation can last across those changes. Rebuilding context from whichever rows are current would silently change the meaning of an old report or conversation.

## Decision

Every analysis run records the learning-submission version, form revision, question-context hash, student-evidence hash, prompt/schema version, provider, and model. A tutor thread additionally pins one question number, exact approved context set, and analysis revision. The server constructs the context from those owned references; clients never supply authoritative question text, solutions, answer keys, report text, or release state. A superseded context remains reproducible and usable unless an explicit release authorization is revoked or withdrawn; `active` means current selection, not authorization.

Corrections and supplemental reasoning create a new learning-submission version. Re-analysis creates a new report revision. Continuing with changed evidence/context requires an explicit new or forked tutor thread; existing reports and threads remain readable against their original snapshots.

The first release uses bounded, ordered, asynchronous chat turns. `POST` persists an idempotent, head-of-line turn intent before provider work and returns a pollable resource; every `GET` is a pure database read and never creates provider cost. It does not silently summarize or discard old messages and does not claim token streaming. When the context budget is reached, the user must fork a new thread with an explicit snapshot.

Before each provider call the worker rechecks the owning student and authorized session, exact thread/version/question/form/context/evidence hashes, release authorization, deletion generation, solution eligibility, and its lease fence. Completion repeats the immutable lineage and fence checks. A failure known to occur before delivery may use bounded retry. Once delivery to the provider may have occurred, a missing response is recorded as `DELIVERY_UNKNOWN` and requires an explicit new student retry; the application does not claim provider exactly-once semantics.

Batch extraction and question mapping never receive correct answers or solutions. Release entitlement is rechecked before enqueue and again by the worker before loading any protected context or calling inference. An AI-derived mapping cannot open a tutor thread until the student has explicitly confirmed it and the resulting immutable learning version has committed. Polling is read-only and never creates provider cost; no token or infrastructure job ID appears in a URL.

## Consequences

- Historical feedback is reproducible and auditable.
- Storage use grows and needs retention/deletion rules.
- Context builders and API authorization are server-side responsibilities.
- Re-analysis can disagree with an older report without rewriting history.
