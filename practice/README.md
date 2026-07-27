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

## Local verification

```sh
cd AMC12_Problems/practice
npm run verify
```

See [MANUAL_TEST.md](./MANUAL_TEST.md) for browser, API, timer, security, and
recovery acceptance checks. Deployment configuration is documented in
`../deploy/README.md`.
