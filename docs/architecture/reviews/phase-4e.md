# Phase 4e review: untimed open-review workspaces

## Scope

This stage lets an authenticated student start an untimed `OPEN_REVIEW`
workspace and submit the same confirmed text/audio evidence used by a finalized
timed attempt. The workspace reuses the owner-scoped attempt and learning
lineage, but it is permanently paused and has no timer events, mutable attempt
answers/reasoning, official submission, or official score. Its blank v1 is only
an immutable anchor; the first confirmed batch creates mapped-question-only v2
evidence and enters the existing approved multi-solution analysis pipeline.

An operator-only release binds one unpublished form revision, question bundle,
approved context set, authority, and hashes. `ACTIVE`, `SUPERSEDED_VALID`, and
`REVOKED` have distinct creation, continuation, visibility, and cleanup
entitlements. A database-level question-bundle fence prevents timed and open
delivery of the same questions and prevents two active open aliases.

## Verification evidence

- Root created a new PostgreSQL 17.9 database after proving its exact name was
  absent, ran the complete API suite with 163/163 passing and no skips, dropped
  that exact database, and proved it absent again.
- Without a database, 163 tests were discovered: 162 passed, none failed, and
  only the PostgreSQL smoke test skipped as expected.
- The PostgreSQL path creates a blank v1 through a two-connection idempotency
  race, commits a real text batch as v2, completes analysis against two pinned
  solutions after supersession, revokes a second claimed job, denies new
  authorization and stale completion, preserves cleanup authority, and proves
  official submissions/answers are unchanged throughout.
- A newer active approved context for the same form contains distinct solution
  IDs, while the release, v2, analysis run, and provider request remain bound to
  the original context and solution IDs.
- Direct SQL adversarial checks reject timer, official submission, attempt
  answer, delivery-mode mutation, released-form mutation, released child-row
  move-out, and release-event mutation. Concurrent release-vs-release,
  release-vs-timed-attempt, and release-vs-publication tests prove exactly one
  delivery winner per question bundle.
- HTTP tests cover authentication, owner/BOLA behavior, CSRF, idempotent
  workspace creation, every timed-operation guard, superseded history, revoked
  report denial, and revoked `GET`, list, delete, and original create-key replay
  projections. Revocation keeps student evidence visible while withholding the
  complete derived scoring result.
- All JavaScript source/test/script files passed `node --check`; `git diff
  --check` passed; `npm audit --omit=dev` reported zero known vulnerabilities.
  A credential-prefix scan found no match in the reviewed tree while explicitly
  excluding the unrelated untracked startup script, which was never read or
  staged.

## Independent review

The initial architecture review returned `REQUEST_CHANGES`. It found that
revocation hid the learning report but not the batch result, so list/get still
exposed correct options, per-question correctness, and scores. It also rejected
the evidence level because the complex entitlement lifecycle was covered only
by `MemoryStore`. Both were repaired with a protected-result projection and a
real PostgreSQL v2/supersede/revoke/cleanup/official-isolation flow.

A separate database/security review found a more fundamental immutability
bypass: an UPDATE checked only a child row's new context ID, allowing a released
solution to be moved out to a compatible unreleased context. Form-question and
approved-context child guards now inspect both OLD and NEW identities, with
direct SQL move-out regressions and a before/after pinned solution digest.

Review then identified two more boundary errors. Active uniqueness was only by
form ID, allowing duplicate active catalogs for cross-form clones; it is now
also unique by question-bundle hash and is race-tested. Finally, root found that
an old batch-create idempotency key could replay a committed result after
revocation even though normal reads were redacted. Every replay path was
audited, and create replay now uses the same redacted read projection while
remaining observable and idempotent.

The independent post-fix review created a fourth fresh PostgreSQL 17 database,
proved its 0 -> 1 -> 0 lifecycle, and repeated the complete 163/163 suite with
no skips. Its focused OPEN_REVIEW group passed 4/4; 64 JavaScript files passed
syntax checks; dependency audit, diff check, and credential-prefix scan were
clean. Final disposition: **APPROVE** this Phase 4e code boundary with P0/P1 =
0/0.

One non-blocking P2 evidence improvement remains: the PostgreSQL OPEN_REVIEW
end-to-end case uses text evidence for revoked cleanup, while audio revocation
relies on the same database `CLEANUP` predicate plus the separately proven
generic audio crash/retention/cleanup suite. A dedicated combined
OPEN_REVIEW-audio-revocation drill should be added before production rollout.

## Reflection

Reusing the attempt aggregate avoided a second ownership and batch/report
system, but “synthetic attempt” is safe only when mode is a first-class database
identity. Service guards provide stable API errors; constraints and triggers
make omitted or direct-SQL timed writes fail closed.

Supersession and revocation are not synonyms. Supersession stops new workspace
and batch creation but preserves already pinned learning. Revocation withdraws
solution-derived reports and deterministic grading while preserving the
student's own evidence and exact-lineage cleanup. That distinction must apply
to every projection, including idempotent replay responses, not only ordinary
GET routes.

Provider revocation has a real distributed-systems boundary. The system can
guarantee that authorization begun after committed revocation fails and that
no stale completion is committed or exposed. It cannot truthfully guarantee
that a call authorized just before revocation will never physically begin; the
test and documentation preserve that limitation instead of overstating it.

Successor rollout remains a two-step operator procedure: supersede, then
publish. A failure between the steps creates a safe, fail-closed catalog gap,
not a fabricated successor relationship. An atomic predecessor/successor audit
link is a useful later operational improvement, but is not represented as a
property of this release.
