# Phase 9c review: post-final reanalysis regression evidence

## Outcome

The committed API/database phase (`fbfc536`) and Final-results UI phase
(`8ad6562`) pass the complete default API suite, the UI verification suite,
focused HTTP/domain tests, and all conditional PostgreSQL suites when each
suite is run against its own freshly created database.

No production configuration, production database row, or running service was
changed during this phase. The untracked local file
`practice-api/start-with-pg-wait.sh` was not read, staged, modified, or
deleted.

## Evidence

- Complete API: 274 total, 263 passed, 0 failed, 11 conditional PostgreSQL
  skips.
- Focused learning submission/review HTTP and domain paths: 31/31 passed.
- UI `npm run verify`: syntax/lint plus 68/68 passed, including the headless
  Chrome MathJax and restricted-rendering smoke.
- PostgreSQL analysis-v2 migration: 3/3 passed.
- PostgreSQL 001-018 migration/private/archive/publication/reanalysis smoke:
  1/1 passed.
- PostgreSQL Tutor migration: 3/3 passed.
- PostgreSQL Tutor Store/HTTP/authority/fencing: 7/7 passed.
- `git diff --check` passed.

The PostgreSQL smoke includes the real 001-014 to 015-018 historical upgrade,
the previously legal unbound anchor, changed-reasoning v2, same-evidence v3,
append-only trigger checks, official score immutability, report completion,
Tutor context creation, two-pool version/claim races, and approved-context
import races. Phase 9a records the detailed assertions.

## Review closure

The first UI review correctly rejected the implementation because conflict
recovery lacked a complete asynchronous fence. After correction, both the UI
and API/security reviewers independently returned GO with no blocker, high,
or medium finding. Their final checks covered exact-version reads, monotonic
projection, navigation invalidation, same/different conflict drafts,
concurrent current-version attribution, whitespace canonicalization,
unsaved-draft protection, CSRF/BOLA, idempotency, capability fail-closed, and
official result isolation.

The only optional enhancement is a browser-level `beforeunload` prompt for an
unsaved local approach. Every in-application navigation that can leave or
replace the Final result is protected; browser/tab closure does not mutate
server state and is not a release blocker.

## Critical reflection

An initial attempt ran four conditional PostgreSQL files concurrently against
one fresh database. Thirteen tests passed, but the main smoke failed its
fresh-state assertion because the Tutor suite legitimately advanced the same
global dispatcher cursor first. This was test interference, not an application
failure. The database was deleted and the files were rerun concurrently with
four independently named fresh databases; all 14 tests passed. Future
automation should provision one database per PostgreSQL test file rather than
assuming file-level isolation inside a shared database.

Static and pure-function UI race tests validate the full fence predicates but
cannot prove deployment wiring, process supervision, production migration, or
the real loopback Gateway. The deployment phase must therefore restore the
15% disk headroom gate, rehearse backup/restore, run migration 018 in the
documented maintenance order, restart API/worker/Gateway, and demonstrate a
real v1 to v2 to v3 canary with unchanged official score and readable history.
