# ADR-013: Analyze answer-only evidence and drive reruns from authoritative queue state

## Status

Accepted

## Context

The v2 question-analysis contract deliberately accepts only non-blank student
reasoning. The worker therefore converts an otherwise valid selected answer
with no written reasoning into a local `BLANK_REASONING` result and never calls
the AI Gateway. The Final-results page also labels a report GET as “Refresh
analysis”, while the actual rerun mutation is a second control inside the
reasoning editor. A short, report-only poll can stop while work is still
queued, re-enable a stale control, and let another tab submit against an old
version.

Students need useful feedback even when their only evidence is an objective
answer. They also need one unambiguous rerun action whose queued and running
states reflect server authority. This must not weaken immutable scoring,
approved-solution governance, provider isolation, or the version lineage
defined by ADR-008 and ADR-012.

## Decision

Add `amc-analysis-contract-v3` alongside the frozen v2 contract. V3 uses a new
request, response, prompt, context-hash, input-hash, and `/v3/analyze-question`
endpoint. Its request carries an explicit `student_response_mode`:

- `ANSWER_ONLY` requires a selected A-E answer and an empty reasoning string;
- `REASONING` requires non-blank bounded reasoning and may have a blank answer.

The mode is included in the input hash. An answer-only response must use the
existing `ANSWER_ONLY` verdict. The Gateway still performs a provider call as
requested, but the accepted response is a complete deterministic invariant:
correctness comes only from the immutable scoring snapshot, no student method
is attributed, and each ordered approved solution is named only with its
reviewed method tags and a `NOT_COMPARABLE` alignment. Both the Gateway and API
reject any model variation from that exact object. This deliberately prevents
a fluent model from inventing a student step, strength, gap, or personalized
suggestion from answer-only evidence. A response with neither an answer nor
reasoning remains a deterministic local no-attempt outcome. Invalid or
unscored snapshots and questions without sufficient model-eligible context
also remain local and make no provider call.

The worker is dual-read and single-write during migration: it can claim and
authorize queued v2 and v3 runs, dispatches each to its exact Gateway endpoint,
and creates new runs as v3. V1/v2 rows, reports, and Tutor snapshots are not
rewritten. The Gateway deploys v3 before the API can write v3, and v2 remains
available until no queued or retryable v2 work remains.

The Final-results “Refresh analysis” control becomes the single
unchanged-evidence `Analyze again` mutation. Status refresh is automatic. The
reasoning editor keeps only the distinct `Save approach and analyze again`
mutation. Each mutation is surrounded by authoritative submission reads:

1. GET the current learning-submission projection;
2. refuse to POST from a stale version or while current work is active;
3. POST once with the authoritative expected version and one idempotency key;
4. GET the authoritative projection again before presenting the new state;
5. poll authoritative projection and the exact-version report while work is
   queued or running.

`QUEUED` and `RUNNING` are server-enforced active states. The reanalysis
transaction returns `LEARNING_ANALYSIS_IN_PROGRESS` for either state before
budget consumption or writes, regardless of whether the submitted reasoning
patch differs. The database claim and reanalysis paths retain their shared
dispatcher/row locks, so refresh-versus-claim and multi-tab races have one
linear result. Terminal work can create one next immutable version; concurrent
requests then serialize through expected-version and idempotency checks.

The UI disables both rerun mutations while it is reconciling, queued, or
running. It never re-enables them merely because a report GET failed or a
client polling budget elapsed. Attempt, view epoch, submission lineage,
version, question, and request-sequence fences prevent late responses from
overwriting newer state. Focus or visibility recovery immediately resumes an
authoritative read.

## Alternatives considered

1. Relax v2 in place. Rejected because the same frozen contract and hashes
   would gain different validation and prompt semantics during rolling deploys.
2. Allow model-written answer-only coaching behind semantic field checks.
   Rejected because field validation cannot prove that apparently helpful text
   did not fabricate a student's method. The accepted design still calls the
   provider, but only an exact, metadata-derived response may cross the trust
   boundary.
3. Treat repeated active requests as successful no-ops. Rejected for the public
   mutation because a stable conflict makes accidental duplicate intent
   observable and prevents a caller from mistaking an old run for a newly
   created analysis version.
4. Permit a changed-reasoning request to cancel queued work. Deferred. It saves
   one provider call before lease, but complicates the single visible active
   state and encourages rapid version churn. The first release requires the
   active run to reach a terminal state before another version is created.
5. Add a separate analysis-revision axis. Architecturally cleaner for model
   experiments, but disproportionate while report and Tutor lineage are built
   around one run per immutable learning version.

## Consequences

- Objective answers without reasoning receive AI feedback when exact approved
  context is available; completely blank responses still consume no AI call.
- Official answers and scores stay frozen and cannot be changed by v3 output.
- Queue truth comes from the API, not button-local state, so cross-tab progress
  can temporarily delay a user action but cannot create duplicate active work.
- A student must wait for an active analysis to finish before saving a newer
  reasoning version. This is intentional back-pressure and should be explained
  in the UI.
- Approved solutions remain a hard prerequisite. Answer-only support does not
  bypass content review, rights metadata, visual-context eligibility, or the
  minimum comparison count.
- Answer-only feedback is necessarily conservative: it confirms objective
  correctness and exposes reviewed reference-method tags, but personalized
  diagnosis requires the student to provide reasoning. Requiring a provider to
  echo an exact object may also increase fail-closed protocol errors; this is
  preferred to accepting fabricated pedagogy and must be monitored.
- V3 adds a rolling-deploy compatibility burden: Gateway v2 must remain until
  durable v2 work is drained, and rollback stops v3 intake rather than deleting
  v3 rows.
