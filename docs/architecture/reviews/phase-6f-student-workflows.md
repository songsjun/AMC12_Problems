# Phase 6f review: unified student learning workflows

## Outcome

The student UI now treats timed final work, open review, and confirmed batch
evidence as versions of one learning record. A final result renders objective
scoring first, independently of AI availability, then exposes report status,
per-question analysis, approved solutions, and the private text/audio batch
workspace. Learning history can reopen any retained version, its exact mapped
questions, report, response, reasoning, and solution comparisons.

From a succeeded question analysis, the student can start, reopen, fork, retry,
or delete a question-scoped Tutor discussion. The browser supplies only path
identity, a bounded message, an idempotency decision, or a public request
ordinal. It never assembles question Markdown, solutions, scoring, student
evidence, hashes, provider controls, or model configuration; those remain the
server's immutable snapshot authority.

## Ownership, stale data, and races

Tutor list rows are bounded summaries. `sourceEntitled` is fail-closed: only an
explicit `true` enables Open or allows a latest-request projection. A retained
row with unavailable source exposes no message or context, disables Open, and
still offers Delete so the student can release thread capacity. The initial
selection opens only the first entitled row. A full GET that subsequently
returns unavailable authority downgrades the row instead of polling it.

Attempt, batch, history, report, Tutor-list, and Tutor-thread responses are
fenced by path identity plus local epochs/sequences. Thread tombstones advance
both list and load generations before removing local state, so late pagination,
GET, and poll responses cannot resurrect a deleted discussion. Batch mutation
completion is similarly bound to attempt, active batch, epoch, and visible
view. Re-entering results resets an ownerless upload busy state; logout advances
all fences, stops polling, clears caches and sensitive state, empties rendered
questions, reasoning, scores, solutions, reports, messages, files, and modal
content, then clears the CSRF token.

## Rendering boundary and accessibility

All model/student Markdown passes through the restricted DOM-building renderer;
Tutor content disables external resources. The self-hosted pinned MathJax build
uses a reduced TeX package set, preprocessing removes extension/URL/attribute
commands and aliases, and a post-typeset scrub removes dangerous nodes and
attributes. The Chrome probe is generated in an operating-system temporary
directory for the test and removed afterward, so no security probe is shipped
as a production static asset.

Thread actions have independent Open/Delete controls and accessible labels;
unavailable-source text is associated with the disabled Open button. New
history, report, batch, question, and Tutor regions use unique DOM targets and
the existing keyboard/focus conventions.

## Verification

- `npm run verify`: 54/54 passed, 0 failed, 0 skipped.
- The suite launched real headless Chrome: ordinary AMC TeX rendered, while
  malicious link, URL, resource, extension, class, id, and style attempts
  produced no active node, attribute, or outbound request.
- Static syntax and repository diff checks passed; no MathJax smoke fixture is
  present under the production `practice/` static tree.

Independent final review of this exact tree: **APPROVE**, P0=0, P1=0, P2=4.

## Critical reflection

The UI deliberately does not infer that a successful objective score implies
an AI report or Tutor source is available. These capabilities can lag, fail, or
be revoked independently, and the student sees those states rather than a
fabricated combined success. Likewise, AI batch mappings remain suggestions
until every extracted item is explicitly mapped or discarded by the student.

Polling after transient report, batch, or Tutor refresh errors currently uses a
fixed interval. Visibility and generation fences prevent stale writes, but
exponential backoff, a retry ceiling, reduced-motion feedback, and explicit
offline handling remain production hardening. Shared async buttons also do not
yet carry an explicit operation-owner token; server invariants and current-state
resynchronization limit duplicate effects, but a late request can briefly
change a newer request's disabled state. Focus return after every nested
history/Tutor action can likewise be refined with full assistive-technology
testing. Finally, the real Chrome probe covers MathJax and injection resistance;
batch/history/Tutor races are presently covered by unit and static contract
tests rather than a browser driven through a mock API. A browser-level workflow
suite remains valuable defense in depth.
