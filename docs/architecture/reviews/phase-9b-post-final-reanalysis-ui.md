# Phase 9b review: student post-final reanalysis workflow

## Outcome

The Final results page now exposes repeated AI analysis only when the API
returns the explicit `reanalysisAvailable: true` capability for an
`INTERACTIVE_FINAL` learning submission. The student can select one question,
load that exact immutable version's submitted approach, save a changed
approach and restart analysis, or request a fresh analysis without changing
evidence. The official answers and Final score are never part of the mutation
body and are not re-rendered after a version is created.

The editor explains that every successful action creates an immutable version
and that earlier approaches, reports, and Tutor discussions remain available
in Learning history. History labels distinguish post-final reasoning commits
from manual same-evidence reruns. A reload/discard action and navigation
confirmation protect local unsaved text.

## Contract and concurrency evidence

The browser mutation sends exactly `expectedCurrentVersion` and `notes`. It
uses one caller-owned idempotency key for the original call and one bounded
network retry. Client validation matches the server's strict object shape,
positive version/question bounds, 25-note limit, 8,000 UTF-8 bytes per note,
48,000 combined reasoning bytes, NUL rejection, and 60,000-byte JSON envelope
ceiling. Whitespace-only text uses the same canonical empty-string rule on
both sides.

Question reads are pinned to submission ID, version, and question number.
Report reads are pinned to attempt epoch, submission ID, version, request
sequence, and results-view visibility. A reanalysis commit invalidates the old
report request and polling sequence before requesting the new version.

The independent reviews initially found a release-blocking conflict-recovery
race: a delayed current-version GET could restore a draft after navigation or
replace a locally newer version. The corrected flow checks mutation sequence,
attempt, epoch, submission, version, question, and visibility before and after
both the current-version read and exact-question read. Projection selection is
monotonic and fails closed for missing or different lineage. Conflict recovery
loads the exact current question: an already-saved identical draft becomes
clean, while a differing local draft remains explicit and requires another
student action. A successful v2 followed by another tab's v3 is reported as
two distinct events rather than attributing v3 to the first action.

The reviews also found that selecting another question could silently discard
an unsaved approach. Question switching, leaving for the dashboard/history,
and starting a new attempt now share an explicit keep/discard decision. The
select is restored when the student chooses to keep editing. The intentionally
destructive reload control is labelled `Discard draft and reload` while dirty.

## Verification

`npm run verify` in `practice/` passes syntax validation and 68/68 UI tests,
including the headless Chrome MathJax/security smoke. Coverage includes:

- fail-closed pre-Final paths and boolean capability;
- exact UTF-8 and combined request limits, canonical whitespace, NUL,
  duplicate question, excess-field, and type rejection;
- fixed-key network retry and the exact mutation field set;
- immutable question identity checks;
- attempt/submission/version/question/navigation mutation-fence matrices;
- report version/request fencing and response identity validation;
- monotonic projection behavior for lower, missing, different, and equal
  lineage;
- context-unavailable messaging, version-history labels, accessible controls,
  live regions, busy state, and unsaved-draft decisions;
- static isolation of the Final score path from the reanalysis mutation.

The focused API/domain suites pass 31/31. The complete API suite passes 263
with 0 failures and 11 explicit PostgreSQL-environment skips out of 274; the
real PostgreSQL upgrade, append-only, race, v2/v3 report, and Tutor evidence is
recorded in phase 9a. `git diff --check` passes.

## Critical reflection

One-question-at-a-time editing is deliberately conservative: it makes the
student's intent, optimistic version, audit event, and cost visible. It can be
inefficient when a student wants to supplement several questions before one
new analysis. A future multi-question draft basket should still produce one
explicit immutable version and one analysis request; automatic analysis on
typing would create unnecessary versions and spend provider budget without a
clear student decision.

Conflict recovery preserves evidence but does not merge prose. If two tabs
change the same question, the UI shows that the current saved approach differs
and requires the student either to reload it or deliberately replace it in a
new version. Silent last-write-wins or automated text merging would obscure
pedagogical authorship.

The feature capability is release-gated by the API, not inferred from the
presence of DOM controls. This makes an older or partially deployed API fail
closed, at the cost of hiding the workflow during mixed-version rollout. That
tradeoff is preferable to presenting a button whose server mutation is not
enabled.

The unit and headless security evidence exercises contract and race predicates,
but does not substitute for a restarted production canary with a real
PostgreSQL version, Gateway response, old-version History read, and unchanged
official score. Those checks remain mandatory in the deployment phase.
