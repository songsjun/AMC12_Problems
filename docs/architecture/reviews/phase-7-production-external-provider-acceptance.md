# Phase 7: production external-provider acceptance

## Decision and released scope

The AMC learning workflow is accepted for the one exact form revision whose
reviewed context is complete: `amc12-2002-b@archive-2026-08-03-r3`. The API
derives availability from the published revision and its sealed approved
context, so the other 47 published forms remain unavailable for new batch
review. This is a deliberate per-revision release, not a global promise that
all archive forms have reviewed multi-solution context.

The released paths share one immutable learning-submission model:

- timed website answers and reasoning create a `FINAL_COMMIT` version;
- confirmed text/audio intake creates a `BATCH_COMMIT` version;
- both enqueue the same question-analysis contract, expose the same protected
  history/report projections, and can create question-scoped Tutor snapshots;
- Tutor reconstructs the question, approved solutions, student answer,
  reasoning, and prior turns on the server. A succeeded analysis/report is a
  creation prerequisite and its lineage is pinned, but the report prose is not
  copied into the Tutor prompt. The browser cannot submit or replace context.

The release consists of AMC repository commit `4ab7626`, with the dedicated
inference Gateway at AOPS repository commit `eb6ba68`. Database migrations 001
through 017 are applied exactly once.

## Configuration and trust boundaries

The Practice API, learning Worker, dedicated AMC Gateway on loopback port 4110,
and local provider Gateway on loopback port 4100 are separately supervised by
launchd. Provider credentials exist only in protected configuration files;
they are not in Git, launchd plists, API responses, or browser code. The API
configuration and Worker configuration are mode `0600`. The API has no
AssemblyAI or inference-provider secret, while the Worker has no session
signing secret.

Audio uses direct bounded upload from the Worker to AssemblyAI. The persisted
retention profile is `NO_TTL_OR_BAA`, with a 48-hour policy window plus 24-hour
processing slack. A durable provider artifact, cleanup lease, deletion
evidence, and orphan audit separate a provider call from local file deletion.
The real audio canary ended with provider status `DELETION_EVIDENCED`, no
overdue cleanup, and no unresolved external orphan.

No additional application-level encryption was added, per the final operator
decision. `fdesetup status` reports FileVault Off with deferred enablement
present; this release does not claim disk encryption is enabled. Private upload
directories remain owner-only (`0700`) and files are created as `0600`.

## Solution review and pedagogical authority

The approved context is an operator-delegated, AI-assisted review, not a claim
of teacher or independent human accreditation. The release authority is
`codex:operator-delegated-release-authority-f`. I reviewed the 25 question
records and accepted exactly two model-eligible solution records per question
(50 total), including their question binding, active authority receipts,
solution availability, and release lineage. The approved artifact intentionally
contains no answer-key field.

Governance evidence:

- r3 archive release SHA-256:
  `e60375e643f1240c765b229e78b7a2fd3afbcc93a929c0233ad5ba99cade799b`;
- approved v2 file SHA-256:
  `a2975759da07bcfa201256b2b427f6b2171a74bd418b231f62195efbc583755d`;
- approved top-level set hash:
  `4d31cd9a06f4ed85cae74b293fb61d30ef2550ded841a76ec4344f42f7481ada`;
- external receipt set hash:
  `91258d117b0ada7e5c967443ea1258e0502dd7751b67aa511e0e8e92bb50fb62`;
- stored context id:
  `d474e4d5-b84d-41aa-9dfc-9a30509eee81`.

This establishes accountable release lineage and structural fitness for model
comparison. It does not prove that every mathematical exposition is optimal;
future content corrections must create a new sealed context rather than mutate
this one.

## Migration, backup, and content integrity

Before migrations 014-017, a mode-`0600` custom-format backup was restored into
an independent database and compared against production. Its SHA-256 is
`8290021389adf26788fcb90a1a8e4cdfcae58f7101f4a4728b7797492d092bdb`.
The pre- and post-migration r2 replay each reproduced 48 forms and 1,200
questions with zero field mismatch. The trusted set digest was
`97441ed617a51b8a95e90d13566a5a41f4931b6158b31ce40690f9a140975765`.

After live acceptance and credential revocation, another mode-`0600`
custom-format backup was restored successfully into a fresh database, then the
temporary database was dropped. It contains 17 migrations, 96 form revisions,
2,400 questions, 4 student records, 8 attempts, 3 analysis runs, and 2 Tutor
jobs. Backup path and SHA-256:

`/Users/ss/Library/Application Support/Kapy/AMC12/backups/amc12-prod-post-e2e-20260803.dump`

`67fc0ccb7dfeb8d2982556b63594a64afedb14e73b6a0c665b3338432ca15631`

The E2E-before and post-restart content fingerprints were identical:

- form headers: `d3e6107fb6ae7d3eff2e18b64578fab5b1228c1089a0ed0fc8073fc61b10ef18`;
- form questions: `012e4164f1f041938eed7d10dcbc3e06c0b6b3e0293f140c4767be49fe99cc76`;
- context headers: `0532639ef274b1786b4185a72daefb692e525d18ced5279e2f676f07ac2a7fec`;
- context questions: `bbdb9ecb3e34beb6b06c5261c04be9ba89e7ca24a50d50b9084138f58a19b0dc`;
- context solutions: `4f104625dd20e9d30daafa469709fec56269822c64e7e96399598a5febea0698`;
- combined: `e7f5def0ff0555db3bb52e6d87d94f56789cbbaad39975b7b858bacbf288c9ac`.

This proves that the acceptance workflows did not rewrite questions, answer
keys, approved solutions, or context lineage.

## Live production-style evidence

All canaries used loopback HTTP, the real PostgreSQL database, real launchd
processes, the real private store, the dedicated 4110 Gateway, the local 4100
provider Gateway, and actual external model and AssemblyAI calls.

| Path | Observed result |
| --- | --- |
| Text intake | create 201, binary upload 200, submit 200, AI mapping `NEEDS_CONFIRMATION` |
| Text mapping | question 1, option A, exact evidence preserved; operator confirmation committed version 2 |
| Text report | `COMPLETE`; 1/1 analyzed; 2 solution comparisons, strengths, gaps, and suggestions |
| Text Tutor | create 201, message 202, `RUNNING` to `SUCCEEDED`; USER and ASSISTANT messages persisted |
| Audio intake | 102,862-byte MP3; create 201, upload 200, submit 200 |
| AssemblyAI | transcript correctly recovered question 2, option B, and the spoken elimination/checking reasoning |
| Audio cleanup | local asset `PURGED`; provider artifact `DELETION_EVIDENCED` |
| Audio report | version 3 `COMPLETE`; incorrect choice identified; 2 solution comparisons and actionable advice |
| Timed website flow | create/answer/reasoning/final all succeeded; 25-question report `PARTIAL` by design |
| Timed report detail | answered question `SUCCEEDED`; 24 blank-reasoning questions deterministic `UNASSESSABLE` |
| Timed Tutor | create 201, message 202, `RUNNING` to `SUCCEEDED`; comparison and next-step guidance present |
| Raw batch deletion | text and audio raw batches each reached deletion `COMPLETE`; history, reports, and Tutor remained readable |

The first text canary exposed a real deployment defect: the process-local API
review flag was also blocking Worker decomposition. The failed canary was
deleted to `deletion_state=COMPLETE`. Commit `4ab7626` separates front-door
release gates from internal draining of already accepted work. The Worker may
now process only durable work while still rechecking owner, attempt, pinned
form identity, current exact-form readiness, `EXISTING_WORK` plus `NEW_BATCH`
entitlement, and the exact lease fence. Decomposition does not independently
re-read the pinned context id; confirmation/commit enforces the anchor's exact
context id and its complete immutable lineage. New create/upload/submit/confirm
operations remain gated. The fix added a regression test, passed independent
API review, and the replacement canary completed end to end.

## Security evidence

Two one-time students exercised live isolation. Student B received 404 for
Student A's workspace, batch, history, report, and Tutor thread. B's cross-owner
batch DELETE and Tutor message POST also returned 404. Using A's cookie with
B's CSRF token, and omitting CSRF, each returned 403. After the negative tests,
A still read the same batch as `COMMITTED/ACTIVE`. Five error bodies were
scanned for the protected answer, solution, evidence, reasoning, message,
provider, and secret field names with zero matches.

The one-time access codes and all sessions for both canary students were then
revoked by exact student id. Replaying both retained sessions returned 401.
Historical submission/audit rows were retained rather than destructively
removed.

Independent security review reported no blocker or major after 89/89 focused
HTTP, workspace, history, batch, Tutor, BOLA, CSRF, no-store, idempotency, and
leakage tests. The live probe is representative rather than exhaustive: it did
not enumerate every mutation, concurrent cross-owner race, cache/CDN behavior,
or timing side channel. Those remain defense-in-depth test opportunities.

## Automated regression and restart evidence

- Practice API full non-PostgreSQL run: 270 tests, 259 passed, 11 explicit
  database-environment skips, 0 failed.
- Fresh database per PostgreSQL test file: analysis migration 3/3, full smoke
  1/1, Tutor migration 3/3, Tutor PostgreSQL store/HTTP/fencing 7/7.
- Student UI: 64/64, including the Practice Test timed-vs-batch modal, exact
  revision capability gates, direct upload, confirmation, history, report,
  Tutor, accessibility, and stale-response fencing.
- Dedicated AMC Gateway: TypeScript typecheck plus 10 files / 98 tests.
- Hotfix-focused batch review/service/deployment runs: 44/44.
- `git diff --check` passed.

The generic Gateway, AMC Gateway, Worker, and Practice API were restarted by
launchd. Their final PIDs were 95377, 95433, 95483, and 95517 respectively;
health returned 200 with sub-3 ms local probes. The same pre-restart batch
canary session still authenticated and read its report and successful Tutor
thread; a fresh post-restart login for the timed canary read its `PARTIAL`
report and successful Tutor thread. No crash loop occurred.

Post-restart SRE inspection found zero active analysis, batch, Tutor, cleanup,
or reconciliation backlog; zero expired leases; zero private upload files; no
overdue provider deletion; and about 34.7 GiB free. The sole FAILED batch row is
the deleted first canary and is retained only as audit evidence. New log bytes
contained no error, fatal, secret, or student-body marker. Expected negative
requests accounted for the observed 401/403/404 responses.

## Critical reflection

The strongest evidence is the complete real text/audio/timed/Tutor flow,
restart persistence, external-provider cleanup, content hash stability, and
database-level isolation. It is still not a proof of mathematical or model
quality for arbitrary student work. Reports are advisory; objective AMC scoring
remains deterministic and independent of AI output. Mapping requires explicit
student/operator confirmation because speech and decomposition can be wrong.

Only 2002B r3 is ready. Expanding availability requires the same two-solution
review and sealed approval lineage for each exact form revision; bypassing this
gate would recreate the earlier product failure in which intake was offered
without a reportable context.

Operational observability remains the largest non-blocking weakness. The
Worker completed real work but its stdout/stderr stayed empty. Add
content-free startup, heartbeat, claim/completion counters, queue-age metrics,
and cleanup SLO alerts without logging student evidence. The API and Worker
also temporarily share one database role; this is a documented least-privilege
exception and should be split after the operational runbook can rotate both
identities safely.

Finally, configuration files reduce accidental disclosure but are not a
substitute for a managed secret store, host disk encryption, provider contract
controls, or credential rotation. The final operator instruction explicitly
declined additional encryption, so this acceptance records rather than hides
that residual risk.
