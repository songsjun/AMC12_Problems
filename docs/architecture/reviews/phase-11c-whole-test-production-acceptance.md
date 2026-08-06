# Phase 11c: whole-test production acceptance

## Outcome

Production acceptance is `GO`. Student `kapy` now has an immutable v2 report
for `amc12-2025-a@archive-2026-08-03-r3`. The existing queue ran twelve
answer-only question analyses and one whole-paper synthesis. All thirteen real
Gateway calls completed with HTTP 200, and the distinct paper audit event is
`paper_assessment_completed` for run
`e6eb8f65-872e-4127-b8c7-a87f82cea056`.

The report is intentionally `PARTIAL` at the question layer and `SUCCEEDED` at
the whole-test layer. All 25 objective response rows contribute to coverage;
19 model-safe questions contribute their prompt, choices, and all 38 active
model-eligible approved solutions. Questions 5, 8, 10, 14, 20, and 24 depend on
SVG context that is not available in a model-safe form, so their prompt,
solutions, answer key, reasoning, and free-form question analysis are redacted
from synthesis. They retain only deterministic attempt status. Question 25 is
unscored.

## Actual 2025A assessment

The official result remains 97.5/144: 15 scored answers, 14 correct, one
incorrect, nine scored blanks, and one unscored question. The only incorrect
answer is question 14, whose visual context is unavailable. It is therefore
not evidence for a topic or method weakness.

The synthesis found one defensible strength: every answered scored question
with complete model context was accepted (questions 1, 2, 3, 4, 6, 7, 9, 11,
12, 13, 15, and 19). It explicitly limits that conclusion to final-answer
accuracy. All 15 scored answers are answer-only and no student reasoning was
analyzed, so the report does not claim method mastery.

It emits no unsupported qualitative growth area. The highest-return priority
is coverage: rework the model-safe blanks 16, 17, 18, 21, 22, and 23 under
timed conditions and record at least one checkable setup or equation. A second
priority keeps unavailable-context questions and unscored question 25 out of
ability conclusions. Synthesis confidence is 0.95 for the bounded conclusions;
it is not a probability of student mastery.

## Integrity, queue, and compatibility evidence

- The ordered official answer projection
  `(question_number, selected_option, correct_option, is_correct, points::text)`
  contains 25 rows and had SHA-256
  `bf602f0aa13ea1b89cf085e6fd4eec209f7d2935b4352ab5699ad3004eb45656`
  before enqueue and after terminal completion.
- The v2 report hash recomputes from the mapped durable outcomes, including
  their PostgreSQL `createdAt` fields, to the stored value
  `d27402e3ad8470c3c3c92cf496fa0a0554e29dc09dfebd2ac1bd639c427e4dec`.
- A repeated application-service call with the same idempotency key returned
  v2 and left `current_version=2`, two versions, and two work items unchanged.
- Terminal active analysis work is zero. The report has 25 outcomes: 12
  `SUCCEEDED`, 13 deterministic `UNASSESSABLE`, and zero `FAILED`.
- The actual public report projection passes the deployed browser normalizer
  with a visible `SUCCEEDED` whole-test assessment, one strength, zero growth
  areas, and two priority actions.
- The public `app.mjs` SHA-256 matches the local committed module exactly at
  `c0a16ee4972680e789dae512d5f2954983fe4ddb803cbf5e574a715098460105`.

## Verification matrix

- AMC Gateway: TypeScript, production build, 12 files and 130/130 tests.
- Practice API/Worker: 310 total, 299 pass, 11 database-conditional skips, zero
  failures. The focused final slice is 29/29.
- PostgreSQL 17.9: six migration tests, seven Tutor persistence/fencing tests,
  and one full migration/import/concurrency smoke all pass. The smoke was run
  alone in a second fresh database after a deliberate shared-database run
  demonstrated that its fairness-cursor precondition requires isolation. Both
  exact temporary databases were checked for zero connections and removed.
- UI: syntax, Node, and real headless-Chrome MathJax smoke, 71/71.
- Cross-repository paper context/input hashes are byte-identical for the shared
  runtime fixture.

## Deployment and restart evidence

Gateway commits are `2da12cb` and `ce6c7f1`; AMC12 implementation commits are
`74f3949`, `5ba8e46`, `c2d5145`, and `7c07ed2`. The immutable Gateway release is
`/opt/kapy/amc-inference-gateway/releases/ce6c7f1`, owned by `root:wheel` and
not writable by the service account. The old `9078d2e` release remains for
rollback.

Final supervised state after the maintenance restart:

- Gateway PID 70360, API PID 83950, Worker PID 84002;
- all three are running with last exit code 0;
- Gateway `/healthz` and API `/api/amc12/health` succeed;
- the common AI Gateway on port 4100 remains PID 81399 and was not restarted;
- no new Gateway, API, or Worker startup errors were observed.

## Critical reflection

Independent review produced two pre-release `NO-GO` decisions: unavailable
questions leaked reasoning/free-form analysis into synthesis, and
`ANSWER_PATTERN` could cite unavailable or failed questions. The final Worker,
API validator, Gateway validator, prompt, and browser validator all enforce the
same evidence boundary. A unique canary proves unavailable reasoning never
enters the outbound payload.

Production acceptance found two additional integration defects that unit
fixtures did not expose. First, durable outcomes add a persistence timestamp,
so `reportHash` now explicitly removes that non-semantic field and is directly
reproducible from mapped rows without changing existing hashes. Second,
`answerOnlyCount` and `contextUnavailableCount` legitimately overlap; the UI no
longer hides the report by treating answer-only coverage as analyzed work. Both
findings received regression tests and separate commits.

Remaining limitations are explicit. Six SVG-dependent questions still need a
governed model-safe visual representation before topic/method analysis is
possible. With no submitted reasoning, this report cannot diagnose solution
methods. A worker crash during synthesis can still replay the leased work item;
a durable two-phase question/synthesis checkpoint is required before automatic
synthesis retry. The local upstream enforces response bytes and strict schema,
but does not provide a verified token-level output cap.
