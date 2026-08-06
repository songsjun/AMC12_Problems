# Phase 9d review: production reanalysis release

## Outcome

Migration 018, the post-Final reanalysis API, the Final-results UI, the
learning worker, and the dedicated inference Gateway are running in
production. `AMC12_REANALYSIS_ENABLED` is explicitly `true`; the per-student,
global, and maximum-version limits are explicitly 10, 1,000, and 25. A real
approved-context canary proved changed-reasoning v2, unchanged-evidence v3,
exact-version reports, question-scoped Tutor conversations, stable negative
controls, and an unchanged official Final result.

The release commits before this evidence phase are `fbfc536` (API/database),
`8ad6562` (student UI), and `0f1b3ef` (automated regression evidence). The
untracked user file `practice-api/start-with-pg-wait.sh` remained unmodified
and unstaged.

## Capacity, backup, and migration

Preflight found about 13.6% free disk, below the 15% hard gate. Two exact,
inactive, re-downloadable caches were removed after verifying target sizes,
symlinks, and open handles: the datalab model cache (3,366,724 KiB) and
Playwright browser cache (1,089,140 KiB). Free space increased to about 35.4
GiB/15.51%. This is only about 0.5 percentage points above the gate and is not
a long-term capacity fix.

The mode-`0600` recovery point is:

`/var/backups/kapy/amc12-before-018-20260805.dump`

SHA-256:
`48477849f98c5169511134118795426215ad0e41bd11bf6269843f765737df2d`

The 1,432,255-byte custom-format dump passed `pg_restore --list`. It was
restored to an independently named temporary database, where the pre-migration
ledger was 17/017 and student/attempt/learning-submission counts were 5/12/6.
Migration 018 ran there; the ledger became 18, those counts stayed 5/12/6, and
all new integrity triggers were present. The temporary database and
temporary backup copy were deleted; the recovery point remains.

Production had zero running work in every analysis, batch, cleanup, and Tutor
class, zero official-answer mismatch, and zero unavailable batch-anchor error
before cutover. The old API and worker were stopped, production advanced to
018 exactly once, and new supervised processes were started. API PID changed
from 81440 to 88092 for migration and then to 92502 when the release gate was
enabled; worker PID became 88175 and dedicated 4110 Gateway PID became 88206.
The generic 4100 service was not restarted. All three new processes passed
health checks without a crash loop.

This host lacks an AMC-only ingress maintenance switch. The API upstream was
made unavailable by stopping the API instead of stopping shared nginx. The new
API was restored with the reanalysis gate false before the new worker was
started. Preflight had no queued/running work and the interval caused no
observed error, but it is weaker than selective 503 maintenance because other
already-enabled AMC mutations could theoretically enter during the interval.
The runbook now records that limitation and requires an AMC-only maintenance
location before a future strict cutover.

## Nginx and upload boundary

The live shared nginx configuration initially capped every AMC request at 64
KiB, which would have rejected normal audio. Only the reviewed exact raw PUT
paths were merged into the live parent configuration: 25 MiB and request
buffering off for an exact batch-asset body path; ordinary AMC JSON remains 64
KiB. `nginx -t` passed before reload. Unauthenticated 100 KiB probes then
returned 401 rather than proxy 413 through both direct and portal routes,
while oversized ordinary JSON returned 413 through both.

An authenticated post-restart canary then uploaded 102,400 bytes of text
through direct nginx and 1,048,576 bytes of MP3-shaped audio through portal
nginx. The text reached `NORMALIZED`, audio reached the expected pre-submit
`STORED` state, and deletion reached `COMPLETE/PURGED` for both. A replacement
text batch went through portal upload, real AI decomposition, one-item manual
mapping confirmation, `BATCH_COMMIT`, and a `COMPLETE` v2 report with one
analyzed question and zero failure. Its official Final HTTP result hash stayed
`188e5b075768b6ee7ec1bcaec2ab7a08ccb0b6d35ae8b2e9f394f0b317625b3c`.
The committed 106-byte normalized text asset remains under the existing
retention model so the confirmed learning evidence is traceable; the private
root occupies one 4 KiB block. No new AssemblyAI call was needed for this
nginx regression. Phase 7 remains the evidence for real audio transcription
and provider deletion.

## Gate-false and v1 evidence

The controlled student `AMC12 Release Canary 2026-08-05` used
`amc12-2002-b@archive-2026-08-03-r3`, whose 25 questions each have reviewed
multi-solution context. With the gate false, Final submit created version 1,
one reasoning-bearing question succeeded, 24 blank questions were
deterministically unassessable, and the report was correctly `PARTIAL`. A v1
Tutor root was readable. Reanalysis returned 503
`LEARNING_REANALYSIS_DISABLED`, the advertised capability remained false, and
the version stayed 1.

## Enabled v2/v3 evidence

Only the API was restarted to enable the gate. The production aggregate is
attempt `5e5048b9-580f-4410-bc65-a482dae3700e`, learning submission
`cc4c2c72-a994-4fba-97b0-5bf78f78c599`:

| Version | Creation reason | Reasoning revision | Evidence prefix | Run/report | Question outcomes |
| --- | --- | ---: | --- | --- | --- |
| 1 | `FINAL_COMMIT` | 1 | `4f44a97f2e57` | `PARTIAL/PARTIAL` | 1 succeeded, 24 unassessable, 0 failed |
| 2 | `POST_FINAL_REASONING_COMMIT` | 2 | `b870d1106838` | `PARTIAL/PARTIAL` | 1 succeeded, 24 unassessable, 0 failed |
| 3 | `MANUAL_REANALYSIS_COMMIT` | 2 | `b870d1106838` | `PARTIAL/PARTIAL` | 1 succeeded, 24 unassessable, 0 failed |

Thus changed reasoning changed the evidence hash once, while the manual rerun
kept both reasoning revision and evidence hash. All three exact reports and
question projections remained readable. There are exactly three analysis
runs and two `LEARNING_REANALYSIS_COMMIT` events; rejected controls created no
extra version or run.

Every provider-backed question recorded `openai`, requested and response model
`gpt-5.4-mini`, prompt `amc-question-analysis-prompt-v2`, and schema
`amc-question-analysis-v2`. An independent real 4110 contract probe returned
the same provider/model/prompt/schema and exactly two solution comparisons.

The v2 and v3 Tutor threads each received a real student message and reached
`SUCCEEDED/DELIVERED_RESULT`. Each immutable Tutor snapshot contained two
approved solution references and each persisted a non-empty assistant reply.
Tutor uses its separately reviewed `amc-question-tutor-prompt-v2` and
`amc-tutor-turn-v2` contract.

The official HTTP result hash before and after v2/v3 was identical:
`ca1132c1b05282ca199b5d7e5871fc3486a7256b635372836a8998e076065fd3`.
The frozen score remained 66/150: one correct answer, zero incorrect, and 24
blank. Database official-answer mismatch stayed zero.

## Negative controls and credentials

- gate false: 503 `LEARNING_REANALYSIS_DISABLED`;
- stale expected version: 409 `LEARNING_VERSION_CONFLICT`;
- missing CSRF: 403 `CSRF_INVALID`;
- another student targeting the attempt: 404 `ATTEMPT_NOT_FOUND`;
- exact v2 idempotency replay: the same 202 result and no extra run;
- changed v2 plus unchanged v3: exactly two durable reanalysis events.

All access codes and sessions for the reanalysis owner, isolation student, and
batch restart canary were revoked by exact student id. Historical canary rows
remain as auditable evidence and are visibly named as canaries. Consequently,
the latest production student/attempt after acceptance is a canary, not an
actual student's new work.

## Automated and independent evidence

Before cutover, the complete API run reported 274 total, 263 passed, zero
failed, and 11 explicit PostgreSQL skips. Those database paths passed 14/14
against four independent fresh databases. Focused changed-path tests passed
31/31. UI verification passed 68/68 with lint, syntax, real headless Chrome,
MathJax, restricted rendering, stale fencing, conflict recovery, draft
protection, history, and Tutor coverage. `git diff --check` passed.

The production canaries add real PostgreSQL, launchd, nginx, private storage,
4110, OpenAI analysis, OpenAI Tutor, and restart evidence. They do not replace
the deterministic suites; they cover wiring and provider behavior that the
suites intentionally cannot prove.

## Critical reflection

Two release scripts produced false negatives without corrupting application
state. The first expected the v1 enum `INTERACTIVE_FINAL` and run status
`SUCCEEDED`; production correctly uses `FINAL_COMMIT` and aggregate `PARTIAL`
when 24 questions are blank. The second expected an unsubmitted audio asset to
be `NORMALIZED`; it correctly remains `STORED` until transcription. Both
scripts stopped before cleanup. Exact database inspection showed the intended
state, replacement credentials were scoped to the same named canary students,
the interrupted raw batches were deleted to `COMPLETE/PURGED`, and no duplicate
analysis version was created. Future release canaries should import domain
enums instead of duplicating string expectations.

Passing one form and one reasoning-bearing question proves the production
mechanism and immutable lineage, not the pedagogical quality of every report
or readiness of all 48 forms. Availability remains per exact reviewed form
revision. AI advice is nondeterministic and advisory; it never participates in
official scoring.

Immutable reruns consume storage and provider budget even when evidence is
unchanged. The 25-version cap and daily limits bound the first release, but
operators still need alerting on version growth, oldest queued work, Gateway
errors, and disk. The host's 15.51% free-space margin is thin. FileVault still
reports Off with deferred enablement; per operator decision no extra
application encryption was added, so this release does not claim at-rest disk
encryption.
