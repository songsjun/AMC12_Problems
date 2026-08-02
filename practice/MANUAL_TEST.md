# AMC 12 practice UI manual and API test guide

Run the static UI behind the same origin as the AMC practice API. The browser
uses `credentials: 'include'` and sends the CSRF token returned by login in an
`X-CSRF-Token` header for every state-changing request.

The automated baseline is runnable without a browser; when Chrome/Chromium is
present it also runs the browser-level restricted-MathJax probe:

```sh
cd AMC12_Problems/practice
npm run verify
```

It includes an invariant that a non-final attempt makes **zero** requests to
the results or solutions endpoints. If no supported Chrome/Chromium binary is
available, the MathJax browser probe is explicitly skipped while its package
configuration and TeX preprocessing unit tests still run. Use the checklist
below for browser/API acceptance once a reviewed form and a test access code
have been seeded.

## Preconditions

1. Start the API on loopback port 8090 (or update the nginx upstream) and
   import a published, reviewed form. The synthetic fixture is suitable only
   for local development.
2. Serve this repository through the workspace nginx sample configuration,
   then open `http://localhost:8084/practice/` (or its proxied public host).
3. Use a non-production test access code. Do not put real codes in this file,
   browser source, nginx configuration, screenshots, or shell history.
4. Open browser devtools Network and preserve the log for the solution-gating
   checks below.

## Student-flow acceptance checklist

| Scenario | Steps | Expected result |
| --- | --- | --- |
| Sign in and form list | Sign in with a valid access code, then refresh. | The student name and published form cards appear; no credentials are rendered or stored in page source/local storage. |
| Start/resume | Start a form, refresh the page, then choose Resume. | The server returns the same active attempt, selected answers, phase, and active timer state. |
| Dashboard practice method | On a form without an active attempt, choose Start practice. Exercise Cancel, Escape, keyboard Tab wrapping, and Question-by-question test. Repeat Batch submit files with the form summary capability omitted, false, and true; for true, test both with and without a prior final result for the exact form revision. | Cancel/Escape returns focus to that form's Start practice button. Question-by-question is never capability-gated and creates the timed attempt. False/omitted intake shows “Batch submission is not available yet” and the batch action is disabled. A true capability plus eligible anchor opens the matching final result, scrolls to the file section, and focuses its file input. Without an exact-revision final anchor, no POST is sent and the dialog explains the prerequisite. Resume and View result remain direct actions. |
| Archive deep link | Signed out, open `/practice/?form=amc12-YYYY-a&mode=practice` and the corresponding `mode=batch` URL; sign in, then refresh after routing. Repeat with an invalid/missing form, duplicate parameter, a form whose attempt-history request is temporarily unavailable, and false/omitted `batchIntakeAvailable`. | The query is removed immediately but the valid intent survives sign-in in memory. After forms/history load it matches the exact id once: practice resumes an active attempt or asks before starting; batch first requires explicit intake capability, then an exact-version final anchor. Unavailable intake does not navigate, scroll, or POST and displays the readiness message. Refresh never repeats a consumed action. Invalid intents fail closed; a history outage retains the intent for the in-page Refresh control. |
| Revision pinning | In a test environment publish a newer revision of a form after an older-revision attempt exists, then resume that older attempt. | The client uses the owner-scoped `GET /attempts/:attemptId/form` route; displayed questions/options match the saved revision. A version mismatch fails closed rather than rendering newest content against old answers. |
| Autosave | Select A for question 1, move to another question, reload, and resume. | The answer remains selected and Network shows `PUT /answers` with the current `answersRevision`. |
| Reset while working | During `TIMED`, `LIMIT_NOTICE`, and `OVERTIME` in separate test attempts, click Reset attempt and confirm. | Pending answer saves flush first, `POST /reset` creates a blank `TIMED/RUNNING` retry, and the closed prior attempt remains in history. |
| Paused clock | Click Pause, try changing an answer, then click Resume. | Inputs are disabled while paused; no failed answer PUT is generated. After Resume, inputs re-enable and the server timer resumes. |
| One checkpoint | While the phase is `TIMED`, click Check score and confirm. | One `CHECKPOINT` is saved using the displayed `answersRevision` and `stateRevision`; a total score/count summary appears, answers remain editable, and no answer key or solution appears. Repeating it is disabled or gets the server's `SUBMISSION_SLOT_USED` conflict. |
| 75-minute notice | Use the API's injectable/fake clock in an integration environment to advance active time to 75 minutes, then wait for the worker or call a read endpoint. | Server moves the attempt to `LIMIT_NOTICE`, freezes the active timer at 75:00, and the UI opens a non-dismissible dialog. A `DEADLINE` checkpoint exists only when no earlier checkpoint exists. |
| Continue after limit | In that dialog choose Continue answering. | `POST /deadline-decision` sends `decision` plus the displayed `expectedAnswersRevision` and `expectedStateRevision`; phase becomes `OVERTIME`, answer inputs re-enable, and the timer continues to count for display only. |
| Stop at limit | Start another timed attempt, reach the notice, choose Stop and submit final answers. | The client sends `decision: "finalize"` plus the displayed expected revisions, creates one `FINAL` submission, and shows score/review/solutions. |
| Early final | Before 75 minutes, click Submit final answers and confirm. | The final request includes the displayed answer/state revisions. A `FINAL` submission is created only if they still match, the attempt is locked, and final score, per-question review, submission history, and solutions load. |
| Solution gate | Before final submission inspect Network and page DOM. | There is no request to `/results` or `/solutions`, no `correctOption`, and no solution content. After final submission exactly those authenticated GETs may occur. |
| Reset/retry | From final results choose Start a new attempt, return to My tests, and open the prior final result. | `POST /reset` returns a new `TIMED/RUNNING` attempt with blank answers. The previous attempt and every submission remain in the database; its `RESET` history item is marked `resultsAvailable` only when it has an immutable `FINAL` submission, so its final results/solutions remain viewable. |
| Network failure | Disconnect after choosing an answer and before final submission. Reconnect and retry/reload. | The UI warns that answers are not saved and does not submit final while a save has failed. The server remains the source of truth. |
| Two tabs | Resume the same attempt in two tabs, change answers in each; in the stale tab try Check score, Stop, or Submit final. | A revision conflict does not silently overwrite the other tab; saves and score-producing actions reject with `ANSWER_REVISION_CONFLICT`, the UI refreshes/requires a new confirmation, and the server retains an audit trail. |
| Batch text upload | Open a finalized result, choose a `.txt` or `.md` file containing answers and approaches, then upload. | Network shows an exact file-descriptor reservation, `application/octet-stream` body upload, and empty submit mutation. Processing status polls without changing the official final score. |
| Batch audio upload | Upload a supported MP3/M4A/MP4/WAV/OGG/FLAC test recording. | The private asset progresses through upload/transcription/decomposition; no API key or provider identifier appears in browser source, requests, or responses. |
| Result-page intake gate | Open a final result directly from View result with the exact form revision's `batchIntakeAvailable` set to false, omitted, then true. Before each disabled case select a file while enabled and reopen after changing the fixture. Also retain a `PROCESSING` and a `NEEDS_CONFIRMATION` batch. | False/omitted capability disables both file input and upload button, clears the old file selection, shows “Batch submission is not available yet,” and sends no create/upload/submit request. Existing batch status, mapping evidence, and deletion remain visible; mapping confirmation is disabled with an explanation. Explicit true re-enables new intake. |
| Batch-entry navigation failure | From the Start practice method dialog choose an eligible Batch submit files action, first fail the attempt GET and then fail the final results/solutions GET. Repeat once with success. | Each failure hides the dialog but returns focus to the still-visible original Start practice button or the main content fallback; focus never remains on a hidden dialog control. Success scrolls to the batch section and focuses the file input. |
| Explicit mapping confirmation | Wait for `NEEDS_CONFIRMATION`. Inspect AI-proposed question/answer/reasoning fields, change at least one, discard one item, and press Confirm reviewed mapping. | No confirmation request occurs merely because confidence is high. The mutation contains only the displayed mapping revision and complete student decisions; every item is assigned exactly once or discarded. The committed mapped-question score appears separately from the official final score. |
| Batch recovery | Drop the network response once during create/upload/submit/confirm, then restore it. For a repeatedly interrupted draft, reopen the result and delete the incomplete file submission. | The immediate retry reuses the exact idempotency key and cannot create a duplicate operation. Durable status is recovered by GET; incomplete private assets can be explicitly purged. |
| Unified learning history | Open Learning history after an interactive final and after confirming a batch. Open the submission and each version. | Both sources appear under one submission. Each immutable version shows its own response count, question set, result/report status, and origin; older pages load with the cursor button. |
| Version and question report | Open a version report, then a specific question. | Queued/running analysis polls to a terminal status. The question view shows its frozen answer/reasoning, objective mapped/final result, strengths, gaps, suggestions, and comparisons with approved solutions. |
| Restricted Markdown | Put a raw `<script>`, `<img onerror>`, and an external Markdown link in test student/AI fixtures. | The strings render as inert text or restricted prose. No active link, remote image, raw HTML node, or script is created. |
| Restricted TeX | In a student reasoning note or Tutor reply, test `\href`, `\url`, `\includegraphics`, `\require`, `\class`, `\cssId`, and `\style`; in reviewed question content also test `\frac`, `\sqrt`, `\boldsymbol`, `\textcolor`, `\cancel`, and `\coloneqq`. Keep DevTools Network open. | Untrusted extension commands are shown as unsupported and create no link, image, external request, event handler, or caller-chosen class/id/style. Ordinary AMC TeX still renders. `npm run verify` performs the same core probe in headless Chrome when available. |
| Tutor discussion | From a released question report start a discussion, send a question, and wait for the reply. | Create sends an empty body and message sends only `{ message }`; DevTools contains no question, solutions, scoring, hashes, provider metadata, or internal job ID in mutation bodies. Pending status polls to success and Markdown remains restricted. |
| Tutor summary pagination | Create more than 10 discussions for one question, including one whose source entitlement has expired, reopen it, then choose Load earlier discussions. | The collection GET uses `limit=10` and an opaque cursor and returns only `thread`, nullable `latestRequest`, and `sourceEntitled`. The first entitled row opens automatically. The stale row says “Source unavailable—delete to free capacity,” cannot be opened, and still has an independently labelled Delete button. Earlier summaries append once; messages and request history load only after a single discussion GET. |
| Tutor failure/retry | Inject a terminal `FAILED` or `DELIVERY_UNKNOWN` Tutor outcome. | The failure remains visible and does not auto-retry. Only pressing **Retry request** sends an empty retry mutation using the public request ordinal. |
| Tutor capacity/fork | Reach the configured Tutor turn/context limit. | Message input disables, **Fork discussion** appears, and only an explicit fork creates a new server-grounded thread from the latest successful answer. |
| Tutor deletion and stale polls | Start a slow poll on discussion A, switch to B, then delete B after it becomes idle. Separately delete an unselected source-unavailable row while an older cursor page is delayed. | A's delayed response never replaces B. Both selected and unselected deletion require confirmation and target the row's explicit thread ID. The tombstone removes the row, invalidates the delayed page/poll/full GET, and prevents resurrection. |
| Tutor context privacy | Open a discussion containing distinctive text, then switch questions, close the question, return to the dashboard, and separately revoke its source before a full refresh. Inspect hidden DOM after each transition. | Messages, requests, composer text, and the full bundle are physically absent rather than merely hidden. Revocation retains only the context-free summary with Delete; a delayed GET/poll cannot restore content. |
| Sign-out privacy | Open a final result, learning report, question reasoning, and Tutor messages, then sign out and inspect hidden page DOM before another login. | Attempt, batch, learning-history, and Tutor state is empty; rendered score, reasoning, report, solution, message, cursor, file selection, and cached form DOM is cleared. |

## API smoke checks

Use browser devtools or a cookie-aware HTTP client; do not paste a real access
code into shared terminal history. Verify these request contracts:

```text
POST /api/amc12/auth/login              { accessCode }
GET  /api/amc12/auth/me
GET  /api/amc12/forms
GET  /api/amc12/forms/:formId/versions/:formVersion
POST /api/amc12/attempts                { formId }
GET  /api/amc12/attempts/:attemptId
GET  /api/amc12/attempts/:attemptId/form
PUT  /api/amc12/attempts/:attemptId/answers
POST /api/amc12/attempts/:attemptId/pause
POST /api/amc12/attempts/:attemptId/resume
POST /api/amc12/attempts/:attemptId/checkpoint         { expectedAnswersRevision, expectedStateRevision }
POST /api/amc12/attempts/:attemptId/final              { expectedAnswersRevision, expectedStateRevision }
POST /api/amc12/attempts/:attemptId/deadline-decision  { decision, expectedAnswersRevision, expectedStateRevision }
POST /api/amc12/attempts/:attemptId/reset              {}
GET  /api/amc12/attempts/:attemptId/results            (final only)
GET  /api/amc12/attempts/:attemptId/solutions          (final only)
POST /api/amc12/attempts/:attemptId/learning-batches   { files: [{ displayName, kind, contentType, declaredBytes }] }
PUT  /api/amc12/attempts/:attemptId/learning-batches/:batchId/assets/:assetId/body
POST /api/amc12/attempts/:attemptId/learning-batches/:batchId/submit   {}
POST /api/amc12/attempts/:attemptId/learning-batches/:batchId/confirm { mappingRevision, responses, discardedItemIds }
DELETE /api/amc12/attempts/:attemptId/learning-batches/:batchId      (Idempotency-Key required)
GET  /api/amc12/learning-history
GET  /api/amc12/learning-history/:submissionId
GET  /api/amc12/learning-history/:submissionId/versions/:version/report
GET  /api/amc12/learning-history/:submissionId/versions/:version/questions/:question
POST /api/amc12/learning-history/:submissionId/versions/:version/questions/:question/tutor-threads {}
POST /api/amc12/learning-history/:submissionId/versions/:version/questions/:question/tutor-threads/:thread/messages { message }
POST /api/amc12/learning-history/:submissionId/versions/:version/questions/:question/tutor-threads/:thread/requests/:ordinal/retries {}
POST /api/amc12/learning-history/:submissionId/versions/:version/questions/:question/tutor-threads/:thread/forks {}
DELETE /api/amc12/learning-history/:submissionId/versions/:version/questions/:question/tutor-threads/:thread (Idempotency-Key required)
```

All mutations carry `X-CSRF-Token`; attempt mutations also carry an opaque
`Idempotency-Key`. Score-producing mutations must carry both current expected
revision fields. Confirm that unauthenticated requests return 401, invalid
CSRF returns 403, a stale answer or submission revision returns 409, and
results/solutions return 409 before finalization.
