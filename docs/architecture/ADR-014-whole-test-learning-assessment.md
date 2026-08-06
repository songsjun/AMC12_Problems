# ADR-014: Evidence-bounded whole-test learning assessment

## Status

Accepted for the additive v1 whole-test assessment contract.

## Context

The question report explains one response against approved solutions, but it
cannot answer the cross-question learning question: what is consistently
working, where is evidence of a gap, and which next action has the highest
likely return? A submission can also contain several different evidence
classes: written reasoning, a selected answer without reasoning, a blank,
an intentionally unscored item, missing visual context, or a provider failure.
Treating these classes as interchangeable would manufacture claims about the
student.

For the current 2025A release, 19 questions have model-safe question text and
at least two active, human-approved solutions. Six SVG-dependent questions do
not. The official score snapshot nevertheless covers all 25 questions.

## Decision

After the question outcomes are stable, the existing leased analysis worker
makes one additional call to the local AMC Gateway using the independent
`amc-paper-assessment-request-v1` contract. The request contains an ordered row
for every question:

- immutable scored, accepted/not-accepted, blank, or unscored status;
- the student's selected answer and, only for model-safe questions, submitted reasoning;
- the already validated question-analysis outcome;
- for model-safe questions only, the complete prompt, choices, and every
  active model-eligible approved solution;
- for unavailable questions, only the ordinal, selected answer, and
  deterministic accepted/not-accepted/blank/unscored status. Prompt, choices,
  canonical answer, accepted-option set, solutions, and student reasoning are
  null/empty. Their question-analysis projection is a fixed availability code
  and fixed summary with no strengths, gaps, or suggestions.

The Gateway uses the same authentication, global rate/concurrency ceilings,
abort handling, secret canaries, output-size boundary, and local upstream as
the question endpoints. A stricter paper gate admits at most one concurrent
paper call and two calls per global rate window, so two syntheses cannot occupy
both production provider slots. Paper completion has a distinct audit event.
The endpoint has separate request/response schemas, hashes, prompt version,
validation, and provider adapter. It is not an extension of the frozen
question-analysis v3 contract.

Every available solution crosses the API-to-Gateway boundary with its approval
status, body/source hashes, reviewer/timestamp, rights status, method tags, and
quality flags. The Gateway verifies these fields and the body hash before
projecting only the solution id, title, markdown, and method tags to the model.
Approval-administration metadata is not sent to the downstream model.

The output separates method evidence, answer-pattern evidence, and coverage
evidence. Method claims can cite only a successful reasoning analysis. Answer
patterns can cite only scored answered questions whose complete context is
available and whose question analysis succeeded; they cannot prove method
mastery. Blank, unavailable, failed, and unscored questions cannot support a
qualitative strength or weakness; they may support a cautiously worded
coverage-based next action. Every claim carries sorted question-number
evidence, and both Gateway and API client reject ineligible references.

The objective evidence coverage is computed locally and is never delegated to
the model. The overall assessment is stored inside the immutable report summary
and therefore covered by the existing report hash and append-only report row.
Public projection removes transport metadata and exposes only bounded teaching
fields. Old reports remain readable with no synthesized assessment.

## Failure and queue semantics

The whole-test call remains inside the authoritative analysis work item. The
run stays `RUNNING`, heartbeat fencing remains active, and the UI continues its
authoritative polling; another analysis request remains disabled. A whole-test
failure is terminal for that synthesis attempt and does not requeue the already
completed question calls. The question report and official score are retained,
and the student may explicitly create a new immutable analysis version.

Question-level retry semantics are unchanged and occur before synthesis. A
request with an invalid scoring snapshot never reaches the whole-test provider.

## Consequences

This design adds one logical provider call per new v3 report and makes a useful
assessment possible even when the student supplied only answers: accuracy and
coverage patterns may be discussed, but the report explicitly says that method
mastery was not observed. Missing visual questions still contribute their
objective attempt status without inducing fabricated topic claims.

Embedding the assessment in the report JSON avoids a schema migration and
preserves atomic report visibility. The tradeoff is that synthesis is not a
separately queryable domain artifact. If independent retry, separate retention,
or report-level analytics become requirements, it should move to a dedicated
append-only synthesis table and phase checkpoint rather than mutate existing
reports.

## Critical reflection

The simplest alternative—ask the browser or API to infer strengths from count
fields—was rejected because it cannot enforce evidence eligibility. Reusing the
question v3 endpoint was rejected because it would silently change a frozen
single-question contract. Sending placeholder text for missing SVG questions
was rejected because the model could mistake it for complete mathematical
context.

The stronger two-phase design would checkpoint all question outcomes before a
separately retryable synthesis phase. It prevents a worker crash during the
synthesis call from causing the leased work item to be reclaimed and the
question calls to repeat. This version does not add that persistence machinery:
normal synthesis failures are not retried, but a process crash or lease loss
can still replay the whole work item, as was already possible during a question
call. We accept this bounded operational debt for the first additive version;
provider-call metrics and a durable phase checkpoint are the required next
step before enabling automatic synthesis retries.

The “all solutions in one call” requirement also has a hard size ceiling. The
current 2025A governed payload is comfortably below the 512 KiB request limit,
but the per-question maximum multiplied by an arbitrary future 25-question
form is not. The contract fails closed with an invalid local request if the
complete payload exceeds the limit; it never truncates a solution silently.
Future content publication should calculate whole-test eligibility before
release, or adopt a separately governed hierarchical synthesis contract.

The first independent security review rejected the implementation because an
unavailable question could still carry student reasoning and provider-authored
question analysis into the synthesis. The corrected contract enforces the
fixed redacted projection independently in the Worker, API client validator,
and Gateway validator. A unique canary in unavailable-question reasoning is
covered by regression tests and must not occur anywhere in the outbound paper
payload. A second semantic review then rejected `ANSWER_PATTERN` claims backed
by unavailable or failed questions; those questions now remain visible only as
objective coverage evidence.
