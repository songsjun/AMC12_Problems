# AMC 12 learning review architecture

## Objective

Add one post-submission learning loop to the existing AMC 12 practice system:

1. A student answers interactively or uploads a batch of text/audio evidence.
2. The system creates a versioned learning-submission snapshot.
3. Deterministic answer results and AI-assisted reasoning feedback are shown per question and as an aggregate report.
4. After submission, the student can open a question-scoped AI discussion grounded in the reviewed question Markdown, approved solution alternatives, the student's answer/reasoning, and the matching report revision.

This is an incremental module inside the current application. It is not a replacement for the timed-attempt state machine, deterministic AMC scoring, or the reviewed content-release pipeline.

## Scope caveat

The existing public archive exposes source problem pages that include solutions. The practice API can and must prevent its own pre-final solution/report/chat disclosure, but it cannot make the wider public archive into a closed-book exam environment. Any future proctored-exam claim requires a separate content-access and exam-integrity design.

## Context map

```text
Content pipeline ──approved QuestionContextSet──────────────┐
                                                            │
Timed practice ──FINAL submission──┐                        │
                                   ├──> Learning Review ────┼──> Question Tutor
Batch ingest ──confirmed evidence──┘       │                │
                                           └── AI work queue┘
                                                    │
                              AssemblyAI / isolated inference adapters
```

### Existing timed-practice context

Owns attempts, the clock, option drafts, checkpoints, final submissions, and deterministic scoring. AI failures must never alter or prevent an otherwise valid official score.

### Learning-review context

Owns `LearningSubmission`, immutable evidence versions, normalized question responses, analysis runs, question analyses, and reports. Its input can be an official final submission, a standalone batch, or a later evidence supplement.

### Question-context context

Owns private, deterministic question-context artifacts compiled from source Markdown. Existing public/private form manifests continue to expose only their currently released first solution; release does not automatically grant AI-reference approval. Alternate solutions remain candidates or quarantined until explicitly approved.

### Question-tutor context

Owns question-scoped threads, ordered messages, model runs, and a pinned context snapshot. It is available only for a committed learning submission whose answer/solution release gate is open.

## Hard invariants

- A checkpoint or any other pre-final timed state cannot read answer keys, solution alternatives, AI reports, or tutor threads. Standalone batch review is limited to separately published `OPEN_REVIEW` revisions that are never timed; otherwise a batch must bind the student's exact owned FINAL.
- Existing `submissions` and `submission_answers` remain the source of truth for official AMC scoring and are never updated by AI output.
- FINAL atomically writes official snapshots, initial LearningSubmission/evidence, and local analysis intent; external calls occur only after commit.
- Every report path pins form, evidence, question-context, and schema versions. Invoked runs also pin prompt/provider/model; deterministic or unassessable paths record `provider_invoked=false`.
- Every tutor thread pins one report/evidence/context version. Updated evidence creates a new analysis version and an explicit new/forked thread.
- Missing or ambiguous student reasoning produces `unassessable` or `needs_confirmation`, never invented reasoning.
- External provider credentials stay server-side; raw provider errors and prompts are not returned to the browser.
- This feature uses only tool-free, non-persistent inference; no model handling untrusted content can access application/session/database/provider secrets, host files, shell, or arbitrary networks. The current agentic CLI and persistent job paths are blocked.
- AI work is asynchronous and retryable. An unavailable provider yields a visible pending/failure state, not a synthetic zero.
- All owner-scoped reads and mutations enforce the authenticated student on the server.
- During-attempt reasoning follows answer-edit rules: only `TIMED/OVERTIME + RUNNING`, never paused/limit/final/reset; a save increments attempt `stateRevision`, uses its own optimistic `reasoningRevision`, and is protected by FINAL's `expectedStateRevision`.
- Post-submission reasoning is a new evidence version labeled `post_submission_reflection`, never rewritten as original timed work.
- Missing approved question context yields `CONTEXT_UNAVAILABLE` without affecting final/results; unreviewed source Markdown is never a fallback.

## Delivery stages

Each stage has its own tests, independent review, reflection, and Git commit.

1. **Architecture and safety baseline**: ADRs, threat model, acceptance matrix, and green baseline tests.
2. **Question contexts**: independent multi-solution parsing, candidate/quarantine review artifacts, deterministic CLI output, and regression proof that existing manifests do not change.
3. **Core learning submissions**: reasoning drafts, atomic final snapshots, deterministic results/status, and Memory/PostgreSQL parity.
4. **Inference gate and reports**: tool-free non-persistent Gateway contract, durable local work, analysis/report APIs, and report UI.
5. **Batch ingest**: streamed text/audio assets, AssemblyAI pre-recorded transcription, question mapping, correction flow, and durable retry/cleanup.
6. **Question tutor**: persisted threads/messages, server-built pinned context, bounded history, question-only access, and interactive-work priority.
7. **System acceptance**: deployment limits, retention/deletion, end-to-end UI, security regression, failure recovery, and full-suite evidence.

## Decision records

- `ADR-001`: official scoring and learning evidence are separate aggregates.
- `ADR-002`: provider calls are durable background work behind an isolated inference boundary.
- `ADR-003`: extracted community solutions require explicit human approval and rights metadata.
- `ADR-004`: reports and tutor threads pin immutable context snapshots.
- `ADR-005`: private uploads use bounded local storage and auditable deletion.
- `ADR-006`: open review is a separate delivery mode with release-pinned
  context and revocation-aware worker entitlement.
- `ADR-007`: timed, batch, and open-review records share one owner-scoped,
  exact-version, revocation/deletion-aware learning-history read model.
- `ADR-008`: analysis v2 derives answer status from immutable official/batch
  scoring snapshots and uses a drained, versioned provider-contract cutover.
- `ADR-009`: Tutor v2 keeps Gateway context hashes separate from pinned
  analysis/report lineage and requires an explicit fork before history loss.
- `TUTOR_PERSISTENCE_DEPLOYMENT.md`: maintenance-window procedure and rollback
  boundary for migrations 011/012.
- `reviews/phase-6c-tutor-store.md`: Store adapter, lease recovery, safe read
  projection, PostgreSQL concurrency evidence, and remaining HTTP/worker gates.

## Module direction

New code should be grouped rather than appended to the existing large service/store files:

```text
practice-api/src/learning-review/   domain and application behavior
practice-api/src/question-tutor/    thread and message behavior
practice-api/src/infrastructure/    AssemblyAI, isolated inference, and private-file adapters
practice-content/amc_content/       deterministic question-context compiler
```

HTTP routes depend on application services; application services depend on explicit store/provider capabilities injected at composition time. External response shapes must not leak into domain or public response shapes.

The existing MemoryStore and PostgreSQL adapters must implement the same transaction, idempotency, state-machine, and lease contract. Tests may use MemoryStore for speed, but every migration stage must also run non-skipped PostgreSQL integration tests. New HTTP methods must be reflected in the exact CORS allowlist. Direct workspace nginx and portal nginx each require route-specific upload verification.

## Processing and priority

Post-submission analysis is background work. Tutor turns are interactive work. Once the inference boundary passes the isolation gate, the application dispatcher must not enqueue an entire form into shared capacity in advance:

```text
CHAT_TURN              highest
QUESTION_REASSESSMENT
QUESTION_ANALYSIS
BATCH_EXTRACTION
REPORT_AGGREGATION     lowest
```

At least one execution slot remains available for interactive work, and production uses a dedicated AMC inference instance/token unless tenant isolation and reserved capacity are proven. PostgreSQL stores the only durable application work/result record; the eligible Gateway endpoint does not persist prompt or result content.

## Versioning model

A stable learning-submission identity can have multiple immutable versions:

- version 1: the final interactive answer/reasoning snapshot, or first committed batch;
- later versions: corrected transcript mappings or added post-submission evidence;
- each version creates a distinct report input hash;
- old reports and tutor threads remain readable and explainable.

Evidence records distinguish `during_attempt`, `batch_upload`, and `post_submission_reflection`; reports must not present a later reflection as the student's original timed reasoning.
