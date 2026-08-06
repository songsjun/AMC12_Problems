# Phase 11b: evidence-linked whole-test report UI

## Outcome

Final results and immutable learning history now share one whole-test report
renderer. The report shows the locally computed evidence coverage first, then
the model synthesis, observed strengths, growth areas, ranked high-impact next
steps, evidence limitations, and confidence. Every claim links to its cited
question: Final results scroll and focus the question card; History opens the
exact immutable question version and its Tutor entry.

Question cards no longer use one generic “reasoning was not detailed enough”
message. They distinguish no attempt, unscored, missing visual context, missing
approved solutions, invalid evidence, and analysis failure. Answer-only results
state that the selected answer was reviewed without inventing a solution
method.

## Safety and compatibility

The browser normalizer accepts only the bounded whole-test schema and its
evidence enums. It rechecks ordered question references against the exact
report, method references against successful reasoning evidence, coverage
arithmetic, ranked priority order, failure-result emptiness, text encoding, and
field bounds. `ANSWER_PATTERN` references must point to a successful
`REASONING` or `ANSWER_ONLY` question, which independently rejects unavailable
or failed evidence even if an upstream response drifts. An invalid synthesis
fails closed while the score and per-question report remain visible. Old
reports render with a clear legacy overview notice.

Queued and running Final and History reports continue authoritative polling
without an active-work retry ceiling. Hidden-tab timers pause; returning to an
active exact-version History report immediately resumes reconciliation. Stale
attempt/version response fences remain unchanged.

## Reflection

Counts alone are not a student diagnosis. The UI never constructs strengths or
weaknesses from correctness or blank totals and never displays unavailable
system context as a student deficit. Confidence is explicitly labelled as AI
synthesis confidence, not a probability that the student possesses a trait.

The current design displays ten coverage counters because the distinctions are
pedagogically important. On a narrow screen they collapse to a single column;
future usability evidence may justify grouping them, but hiding context/failure
counts would make a partial report look more complete than it is.

## Verification

- UI syntax and browser-backed suite: 71/71.
- Includes restricted MathJax/Markdown smoke, strict whole-test normalization,
  malicious/invalid evidence rejection (including unavailable/failed
  `ANSWER_PATTERN` references), reason-specific question presentation,
  Final/History DOM contracts, active polling and visibility recovery, keyboard
  focus targets, and score-before-report rendering.
