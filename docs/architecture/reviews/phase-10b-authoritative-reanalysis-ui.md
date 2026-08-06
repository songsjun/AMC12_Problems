# Phase 10b: authoritative reanalysis UI

## Outcome

The Final-results action now means `Analyze again`; it creates a new immutable
analysis version rather than performing a report-only GET. The client performs
an authoritative GET, one idempotent POST, and a postflight GET. It then reads
the current submission projection before each exact-version report poll.
`QUEUED` and `RUNNING` disable both unchanged-evidence and changed-reasoning
actions. Pending work has no client-side polling ceiling, and attempt, view,
submission, version, question, mutation, and request-sequence fences reject
late responses.

## Verification and independent review

- `npm run verify`: 69/69, including syntax checks, the self-hosted MathJax
  Chrome smoke, API-contract tests, stale-response fences, polling state, and
  accessible DOM contracts.
- Independent browser review injected same-version `QUEUED`, ambiguous network
  completion, HTTP 409 with a concurrent version advance, and terminal report
  read failures.
- The first review was `NO-GO`: same-version conflict reconciliation replaced
  an unsaved local draft with the old server value. The corrected path preserves
  every changed-reasoning draft across same-version and advanced-version
  reconciliation. Browser reruns retained the draft in all three mutation
  races, never replayed a conflict, and kept the queued button disabled.
- The failure message now distinguishes active automatic retries from the
  bounded terminal-read retry ceiling. It no longer claims to be retrying after
  that ceiling. Ambiguous same-version saves explicitly direct the student to
  retry the preserved `Save approach and restart analysis` action.

Independent disposition after the fixes: `GO`.

## Critical reflection

Five-second polling is less immediate and less efficient than server-sent
events, but it reuses the existing authenticated, `no-store`, owner-scoped API
without adding a second state channel that could disagree with PostgreSQL.
Fail-closed projection/report reconciliation can temporarily leave an action
disabled during network loss; that is preferable to presenting a stale
terminal report as permission to enqueue duplicate work. A future SSE channel
would still need this authoritative GET recovery path for reconnects and
cross-tab races.

The automated suite exercises the pure coordination and stale-fence contracts,
while the injected browser races are retained as review evidence rather than a
checked-in browser harness. Converting those fault injections into maintained
DOM integration tests is worthwhile, but is not required for this release
because the exact scenarios were independently rerun after the fix.
