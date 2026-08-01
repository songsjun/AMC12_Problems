# ADR-001: Keep official scoring separate from learning submissions

## Status

Accepted

## Context

The existing timed-practice model snapshots answers and scoring policy into official submissions. The new feature must also analyze interactive reasoning, batch uploads, corrected transcripts, later evidence, and question-scoped discussions. Extending the existing submission kinds would mix mutable learning evidence and probabilistic AI output with immutable contest scoring.

## Decision

Introduce a separate `LearningSubmission` aggregate with an optional reference to an official final submission. It snapshots normalized question responses and evidence in immutable versions. Analysis reports and tutor threads reference those versions; they never write to official submission tables.

The existing FINAL transaction atomically writes the official final, answer snapshots, initial `LearningSubmission`, versioned question evidence (including reasoning), and durable local analysis intent. It therefore returns a stable learning-submission ID without calling any provider. Reconciliation only repairs pre-feature history or exceptional deployment gaps; it is not the normal creation path.

Timed checkpoints are not learning-submission release events. A separate future `QUESTION_PRACTICE` mode may provide immediate per-question feedback without weakening timed-exam isolation.

A batch may attach to an owned FINAL for the exact form revision. A standalone batch is allowed only for a separately published `OPEN_REVIEW` form revision that is never eligible for restricted timed attempts. A normal timed form cannot be converted into an answer-release event by committing a batch. Batch lifecycle is `DRAFT -> NEEDS_CONFIRMATION -> COMMITTED`. Every AI-derived question mapping, proposed answer, and evidence grouping requires an explicit student confirmation event, regardless of model confidence. A segment hash proves that quoted bytes existed; it does not prove that a model claim is entailed by those bytes. Only the API's deterministic reconstruction from the confirmed spans may become student reasoning, and model summaries remain non-authoritative extraction aids. `RELEASE_OPEN` is derived only when the form entitlement is valid and all accessed questions are confirmed. The same entitlement is checked at HTTP entry, enqueue, worker context load, provider call, retry, reassessment, and tutor fork/message.

Batch scoring may reuse the deterministic scorer, but is stored and labeled as a `batch practice result`; it is never an official final score.

## Alternatives

### Add batch and AI kinds to the existing submissions table

Fewer tables, but it weakens scoring constraints, makes retention/deletion harder, and lets AI lifecycle changes affect official history.

### Store only transient AI reports keyed by attempt ID

Fast to build, but corrected evidence and model/content revisions would overwrite history and make tutor conversations irreproducible.

## Consequences

- Official scoring remains small and deterministic.
- Learning evidence can evolve through explicit versions.
- Queries and UI must deliberately combine official result and learning report.
- Additional tables and a reconciliation path are required.
