# AMC 12 practice UI

This directory is a no-build, vanilla browser client for the authenticated AMC
practice API. It is intentionally separate from the public archive at `../`:
the archive is a static reader, while `/practice/` receives problem text and
student state from `/api/amc12`.

Math rendering is self-hosted in `vendor/mathjax/`, pinned to MathJax 3.2.2.
The practice page does not load third-party scripts: its deployment CSP permits
scripts, API calls, fonts, and images only from the same origin (with
`data:` images permitted for reviewed content). If the local MathJax asset
cannot load, prompts and solutions remain readable as TeX text rather than
executing a remote fallback.

Both `\(...\)` and the AMC source's `$...$` inline TeX delimiters are
supported. A literal currency dollar must be authored as `\$` (for example
`\$5`); MathJax preserves that escape, while an unmatched dollar such as
`$5` stays ordinary text. Paired unescaped dollars are deliberately treated
as mathematics, because `$3.5$` is a common AMC answer choice.

Although the pinned `tex-svg-full` file contains every MathJax extension, the
runtime activates only the packages required by the AMC archive. URL/resource,
HTML attribute, dynamic loader, and action packages remain disabled. Student
and AI Markdown also neutralizes resource/attribute/macro-definition commands
before typesetting and scrubs resource-capable nodes after typesetting. This
keeps ordinary AMC constructs—including AMS notation, bold symbols, color,
cancel marks, and `\coloneqq`—while treating hostile extensions as unsupported.

## API contract used by the client

- Login is `POST /api/amc12/auth/login` with `{ "accessCode": "…" }`.
  Successful login returns `{ student, csrfToken }` and an HttpOnly session
  cookie.
- The client sends `credentials: "include"`, `X-CSRF-Token` for mutations,
  and an `Idempotency-Key` for attempt actions.
- Started attempts fetch questions through the owner-scoped, revision-pinned
  `GET /attempts/:attemptId/form` endpoint. Public version lookup is
  `GET /forms/:id/versions/:version`; both contain only `number`, `promptMarkdown`, and
  `choices[].textMarkdown`. The API must never include answer keys or
  solutions in form or pre-final attempt responses.
- The server owns elapsed time and state. The UI's clock is only a display
  extrapolated from the last server response; 75-minute transitions are
  reconciled from `GET /attempts/:id` and never decided by browser time.
- Score-producing mutations (`checkpoint`, `final`, and `deadline-decision`)
  include both `expectedAnswersRevision` and `expectedStateRevision` from the
  state the student reviewed. The server atomically rejects a stale tab before
  it can score another tab's unseen answer sheet.
- A `TIMED` or `OVERTIME` attempt accepts answer changes only when
  `clockState` is `RUNNING`. `LIMIT_NOTICE` requires the server-backed
  `deadline-decision` choice.
- `GET results` and `GET solutions` are called only after final submission:
  when `phase` is `FINALIZED`, or for a `RESET` history item explicitly marked
  `resultsAvailable` by the server because it contains an immutable final
  submission. See the tested `fetchFinalReview` gate in `app.mjs`.
- A finalized attempt can reserve and upload 1-10 private text/audio assets,
  submit them for asynchronous transcription/decomposition, and poll the
  owner-scoped batch resource. AI mapping confidence is display-only input:
  the client sends no confirmation until the student has assigned or
  discarded every extracted item and presses **Confirm reviewed mapping**.
- `GET /learning-history` is the common read model for interactive finals and
  confirmed batches. The client opens an immutable version, its report, and
  then an owner-scoped question; it never reconstructs a version from current
  attempt state.
- Tutor mutations send only an empty create/fork/retry decision or
  `{ message }`. The question, approved solutions, frozen answer/reasoning,
  scoring context, hashes, and provider job identifiers are server-owned and
  never accepted from the browser. A failed/unknown request is retried only
  when the student presses its retry button, and a capacity-limited thread is
  continued only through an explicit fork.
- Tutor collection reads use cursor-paged lightweight summaries
  (`thread`, `latestRequest`, and `sourceEntitled`). A false entitlement forces
  `latestRequest` to `null`, disables opening that row, and leaves its explicit
  delete action available so the student can free thread capacity. A true
  value permits the client to try the owner-scoped full GET but does not claim
  that the GET will authorize. Messages, request history, and frozen question
  context are loaded only by that GET; create/fork/full responses are projected
  back to summaries with explicit `sourceEntitled: true`.
- Network retries reuse the same idempotency key. Batch/report/Tutor polling
  carries a view identity and generation so a response from a closed view,
  older question, or previously selected thread cannot overwrite current UI.
  Leaving learning history or changing its submission/version/question clears
  the full Tutor bundle and rendered message/request DOM. If a full GET loses
  source authority, the same purge runs while retaining only the summary row
  needed for an explicit capacity-releasing delete.
- Student reasoning, extracted evidence, AI reports, and Tutor replies never
  enter raw HTML. Student/AI Markdown uses the restricted renderer with links,
  remote images, raw HTML, resource-loading TeX, caller-defined DOM attributes,
  and TeX macro definitions disabled.

Batch text/audio evidence follows a separate private workflow. A lost provider
upload response causes immediate local-audio purge. The browser must continue
to display `PROVIDER_RETENTION_PENDING` after the configured upstream retention
window elapses; elapsed time is not deletion proof. Only an independently
audited provider/operator confirmation may make that deletion `COMPLETE`.

The Tutor controls are progressively available: when the API deployment keeps
its Tutor feature flag off or a version lacks a completed eligible report, the
question review remains usable and the UI reports that discussion is not yet
available.

Known follow-up: failed Tutor status refreshes still use the fixed
`TUTOR_POLL_MS` interval. The identity/generation fences prevent stale writes,
but exponential retry backoff with jitter should be added before treating a
prolonged Tutor outage as production-hardened behavior.

## Local verification

```sh
cd AMC12_Problems/practice
npm run verify
```

The suite always checks the MathJax package policy and restricted-TeX
preprocessor. When Chrome/Chromium is installed it additionally generates a
probe in an operating-system temporary directory, opens it headlessly, and
verifies rendered AMC notation, dangerous nodes/attributes, and external
resource entries. The probe is removed after the test and is never part of the
production static tree. The browser test is reported as skipped—not silently
emulated—when no supported browser binary is available.

See [MANUAL_TEST.md](./MANUAL_TEST.md) for browser, API, timer, security, and
recovery acceptance checks. Deployment configuration is documented in
`../deploy/README.md`.
