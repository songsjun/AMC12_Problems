# Phase 4 review: confirmed batch evidence and prerecorded audio

## Scope

This stage adds batch text/audio source ingestion to an existing, owned FINAL
learning submission. It reserves and streams private files, transcribes audio
through a server-only AssemblyAI adapter, decomposes normalized evidence
through the isolated AMC Gateway, requires the student to confirm every
mapping/answer/reasoning decision, and atomically commits a new immutable
LearningSubmission version plus mapped-question-only practice result and
analysis work.

Batch extraction never receives answer keys or approved solutions. Deterministic
grading and the approved multi-solution comparison begin only after explicit
confirmation. The same report pipeline then serves interactive FINAL snapshots
and confirmed batch versions without changing official answers, submissions,
scores, or timers. OPEN_REVIEW workspaces, tutor chat, and their UI remain later
phases.

## Verification evidence

- `practice-api` without a database: 159 tests discovered, 158 passed, 0
  failed, and only the PostgreSQL smoke test skipped.
- `practice-api` against a newly created PostgreSQL 17.9 database: 159 passed,
  0 failed, 0 skipped. The database was proved absent, created, tested, dropped
  by its exact name, and proved absent again.
- Independent architecture/security review repeated the complete suite in a
  separate PostgreSQL 17 environment: 159/159 passed with a 0 -> 1 -> 0
  database lifecycle and removed container. Its focused retention, crash,
  cleanup, storage, and batch group passed 46/46.
- All 61 JavaScript files in the reviewed source/test/script set passed
  `node --check`. Launchd/plutil checks passed 5/5. The three real Nginx proxy
  tests each kept ordinary JSON at 64 KiB, streamed the exact upload route, and
  denied the private-storage canary.
- `npm audit --omit=dev` reported zero known vulnerabilities. `git diff
  --check` passed. The disclosed credential prefix had zero matches in the
  reviewed tree; the unrelated untracked startup script was explicitly
  excluded and never read or staged.
- The API and Gateway copies of `batch-contract-v1.json` are byte-identical at
  SHA-256 `44c4a7bc7aa3a3e6686e6607d050b8e66d9a397fb5936e98c9d258993b51c9a3`.

The database suite exercises migration replay, quota-window atomicity,
least-served transcription dispatch across independent pools, explicit
confirmation, immutable version creation, official-score isolation, deletion
generations, lease reclamation, upload/submit crash barriers, bounded hash
reconciliation, exact-ID orphan deletion, retention-window/manual-confirmation
separation, and private-file crash recovery.

## Independent review

The initial review rejected the worker boundary for several real defects:
provider rate/cost limits were process-local or incomplete, transcription
could outlive its business polling budget, overlapping dispatcher ticks could
over-claim, shutdown did not reach every active provider call, and multiple
AssemblyAI crash boundaries could lose cleanup ownership or falsely complete a
student deletion. These were repaired with PostgreSQL-backed student/global
budgets, least-served dispatch state, independent poll attempt/age limits,
serialized dispatcher filling, one shared shutdown AbortSignal, durable
pre-call intents, exact lease/generation reauthorization, and separately leased
orphan cleanup.

A later review found the most consequential defect after all then-current tests
were green: treating `upload call started + 48 hours` as provider deletion
evidence. AssemblyAI retention varies with configured TTL and BAA status, the
request may arrive near its timeout, and AWS TTL processing can lag after the
retention window. The final design requires an explicitly attested account
profile, profile-specific lower bounds, the complete upload timeout, and an
explicit processing slack. More importantly, elapsed time now appends only a
`PROVIDER_RETENTION_WINDOW_ELAPSED` audit event and leaves the artifact and
batch `PROVIDER_RETENTION_PENDING`; only independent operator/provider evidence
can confirm deletion and allow `COMPLETE`. Local audio is purged immediately
and does not wait for that external confirmation.

Fresh PostgreSQL runs also exposed two wall-clock/expectation defects that the
in-memory suite could not reveal: a fixed claim timestamp became earlier than
the newly persisted work, and one deletion assertion still expected the old
pre-retention state. The test now derives its claim time from persisted work;
the second assertion records the intentional pending-retention state. Neither
repair weakened product behavior.

Final disposition: **APPROVE** this Phase 4 code boundary with P0/P1/P2 =
0/0/0. It is explicitly **NOT APPROVED FOR PRODUCTION ROLLOUT** until the
external gates below are satisfied.

## Reflection

The student, not the model, is the authority for reconstructing a submission.
Confidence scores are hints for the confirmation UI, never permission to bind a
model-generated answer or reasoning span automatically. Exact source spans and
hashes remain alongside the confirmed text so later reports can distinguish an
unedited reconstruction from a student correction.

Crash safety must begin before a non-idempotent provider call. A successful
upload or transcript submission can be followed by a timeout, process exit, or
database failure, so retrying blindly can create duplicate upstream artifacts.
Durable `MAY_HAVE_DELIVERED` states make ambiguity explicit. Known transcript
IDs enter exact-ID deletion; unknown submit outcomes use bounded list
reconciliation and delete every exact upload-URL match; incomplete scans remain
manual rather than proving absence.

Retention policy is not deletion evidence. This phase originally encoded a
plausible-looking 48-hour timer and had green tests, yet the timer could make a
false privacy promise. The repaired state machine deliberately tolerates a
visible, long-lived provider-retention backlog. That operational discomfort is
preferable to reporting that student data was deleted when only a configured
window elapsed.

The API and worker are separate launchd units and secret environments, but on
this host they still run under the same operating-system account and therefore
share one trusted computing base. The documentation states that limitation; a
dedicated identity/container boundary is required if stronger local isolation
is needed.

Fixture and protocol tests demonstrate deterministic envelopes, isolation, and
failure handling; they do not demonstrate pedagogical quality. Production
enablement still requires revocation and rotation of the disclosed AssemblyAI
credential, verified account region/retention/training/DPA/subprocessor
settings, an authenticated operator workflow for retention-deletion evidence,
HTTP-level CSRF/BOLA/state-matrix evidence for every batch mutation, a real
Gateway canary, and measured human-reviewed report-quality thresholds.
