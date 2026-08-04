# Batch-review workspace contract incident

**Date:** 2026-08-03 America/Edmonton / 2026-08-04 UTC

**Severity:** SEV3

**Status:** Resolved

**Affected capability:** Starting or resuming the standalone batch-review workspace

## Summary and impact

The API successfully created the student's batch-review workspace and returned
HTTP 201, but the browser rejected that valid response with `The service
returned an invalid batch-review workspace.` The affected student could not
reach the upload screen from the Practice Test choice dialog. The timed-practice
path, existing reports, history, Tutor conversations, objective scoring, and
background processing remained available. There was no data loss and no
evidence of answer, solution, student-content, provider, or credential leakage.

The production request at 2026-08-04T01:28:21Z returned 201 in 60 ms. Its
LearningSubmission was correctly persisted as `COMMITTED`. The client
normalizer incorrectly required `lifecycleStatus: "ACTIVE"`, a value that the
LearningSubmission persistence model does not produce.

## Timeline

- The student reported the exact browser error after selecting batch submit.
- API request logs showed the matching owner-scoped workspace POST completed
  with 201, narrowing the fault to response interpretation rather than creation.
- Source and persistence review proved that MemoryStore, PostgreSQL, entitlement
  checks, and the public DTO all use the `COMMITTED` invariant, while the browser
  and its fixtures alone expected `ACTIVE`.
- Commit `e80f4d5` changed the browser to require the correct strict enum,
  added an explicit negative test for `ACTIVE`, and made the API integration
  test assert `COMMITTED`.
- Four supervised processes were restarted after a zero-active-work preflight.
  The generic Gateway, AMC Gateway, Worker, and API returned to healthy state.
- An authenticated production canary completed login, catalog read, and
  workspace creation with statuses 200, 200, and 201. The deployed browser
  normalizer accepted the real `COMMITTED/READY/true/true` DTO. The canary's
  access code and session were then revoked.
- Maximum PostgreSQL regression exposed a separate stale test-clock fixture.
  Commit `5cea009` anchored that fixture to PostgreSQL `clock_timestamp()`;
  the fresh-database smoke then passed without weakening the production
  database-clock session check.

## Root cause and contributing factors

The immediate cause was a front-end contract assertion copied from the timed
attempt mental model. `ACTIVE` describes an interactive attempt lifecycle, but
the batch workspace DTO exposes the lifecycle of its immutable learning anchor,
which is `COMMITTED` until deletion.

The system allowed this failure mode because the UI unit fixture invented the
same incorrect value as the implementation. Earlier HTTP canaries proved that
the API returned 201 and that downstream batch processing worked, but did not
feed the real response through the shipped browser normalizer. The ambiguous
field name `lifecycleStatus` also made two different domain lifecycles easy to
confuse.

The causal chain is:

1. The browser rejected a valid response because it expected `ACTIVE`.
2. It expected `ACTIVE` because the test fixture modeled a timed attempt rather
   than a committed LearningSubmission.
3. The fixture stayed green because the API projection contract was asserted
   independently, not consumed as a cross-layer contract example.
4. Live acceptance checked API and worker outcomes but omitted the browser
   response-normalization boundary.
5. The architecture exposes a generically named lifecycle field across two
   aggregates without a shared public-contract fixture.

## Correction and verification evidence

The repair remains fail closed. The browser accepts only `COMMITTED`; it rejects
missing, `ACTIVE`, `DELETED`, and unknown lifecycle values. It still requires the
exact form id and version, `BATCH_REVIEW` mode, available protected access,
ready approved context, and literal boolean intake/review capabilities. The API
projection was not widened. A recursive live-canary scan found none of
`correctOption`, `acceptedOptions`, `solutionMarkdown`, `approvedSolutions`,
`contextSetId`, approval receipts, or API keys.

Evidence after the repair:

- browser suite: 64/64 passed;
- batch-review API suite: 14/14 passed;
- complete API suite: 259 passed, 11 explicit database-environment skips,
  0 failed;
- independent focused security/API/UI review: 84/84 passed;
- fresh PostgreSQL suites: 3/3 analysis migration, 1/1 full smoke, 3/3 Tutor
  migration, and 7/7 Tutor Store/HTTP/fencing;
- AMC Gateway: TypeScript check passed and 98/98 tests passed;
- deployed static module SHA-256 matched the repository byte for byte and
  contained the strict `COMMITTED` check;
- production canary: `frontendNormalizerAccepted: true`, zero forbidden keys,
  and zero live canary sessions or access codes after cleanup.

## Critical reflection and follow-up

The smallest production correction was the right one: changing the API to
manufacture `ACTIVE`, or accepting arbitrary truthy states, would have broken
the durable learning-submission invariant. More testing was useful here because
it also exposed a calendar-dependent PostgreSQL fixture; however, the test-only
clock repair is intentionally a separate commit so it cannot be confused with
the user-facing fix.

Two follow-ups remain appropriate:

1. Introduce one checked-in public workspace contract example that is consumed
   by both API projection and browser normalization tests, including a real
   serialize/deserialize boundary. This prevents independently green but
   mutually incompatible fixtures.
2. In a versioned DTO, rename the field to `learningLifecycleStatus` and expose
   workspace writability as a separate explicit capability. Also distinguish a
   malformed response from the legitimate race where approved-context readiness
   changes after creation but before the response projection. That race must
   display a read-only/unavailable state and must never relax server-side upload
   authorization.

The lesson is not that strict client validation was wrong. Strict validation
correctly failed closed; the missing safeguard was cross-layer contract evidence
using the actual public response semantics.
