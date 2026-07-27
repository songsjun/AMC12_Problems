# AMC 12 practice UI manual and API test guide

Run the static UI behind the same origin as the AMC practice API. The browser
uses `credentials: 'include'` and sends the CSRF token returned by login in an
`X-CSRF-Token` header for every state-changing request.

The automated baseline is deliberately browser-independent:

```sh
cd AMC12_Problems/practice
npm run verify
```

It includes an invariant that a non-final attempt makes **zero** requests to
the results or solutions endpoints. Use the checklist below for browser/API
acceptance once a reviewed form and a test access code have been seeded.

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
```

All mutations carry `X-CSRF-Token`; attempt mutations also carry an opaque
`Idempotency-Key`. Score-producing mutations must carry both current expected
revision fields. Confirm that unauthenticated requests return 401, invalid
CSRF returns 403, a stale answer or submission revision returns 409, and
results/solutions return 409 before finalization.
