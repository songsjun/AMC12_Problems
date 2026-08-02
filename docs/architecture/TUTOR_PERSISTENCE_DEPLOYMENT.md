# Tutor persistence migration runbook

## Scope

Migration `011_question_tutor_persistence.sql` creates the immutable Tutor
snapshot, thread, message, and turn-job records required by ADR-004 and
ADR-009. It also adds composite candidate keys to existing learning tables so
PostgreSQL, rather than application convention, checks complete owner and
version lineage.

Migration `012_tutor_expired_lease_recovery.sql` replaces only the Tutor job
transition function so an expired, known-safe final attempt can become
`FAILED / ATTEMPTS_EXHAUSTED`. Migration 011 is immutable after release: never
edit it to obtain the 012 behavior.

The migration is additive and an old application binary does not use the new
tables. It still creates unique indexes on existing tables, so run it in a
maintenance window rather than allowing unpredictable production write stalls.

## Preflight

1. Deploy and validate migration 010 first. Verify every recorded analysis run
   has an explicit v1 or v2 contract version.
2. Stop API and learning-worker processes and disable automatic restart for the
   maintenance window. Record the database backup/recovery point and the old
   application release ID.
3. Check for duplicate candidate-key groups in `sessions`,
   `learning_submissions`, `learning_submission_versions`,
   `approved_context_questions`, `learning_analysis_runs`, and
   `learning_reports`. Primary or existing unique keys should make duplicates
   impossible; a nonzero result is an integrity incident, not a migration row
   to discard.
4. Confirm enough free disk exists for the new indexes and future immutable
   message/snapshot rows.

## Cutover and verification

1. Run the normal migration runner exactly once and verify 011 and then 012 are
   recorded in `amc_practice.schema_migrations` in filename order.
2. Verify the four `learning_tutor_*` tables, all nineteen critical lineage
   constraints, and all thirteen application triggers listed in the PostgreSQL
   smoke test.
3. Verify an upgrade database with 011 already recorded accepts 012 without
   changing the recorded 011 checksum. Exercise one expired safe final attempt
   and verify it terminates rather than remaining capacity-consuming work.
4. Start an application release that understands 011/012. Do not enable the Tutor
   HTTP routes or Tutor worker until their own release gates have passed.
5. Create one thread and one successful turn using a test student. Verify a
   cross-owner snapshot, a second active job, an update to a snapshot/message,
   and a terminal-job update are rejected.
6. Confirm logs contain IDs and stable outcome codes only—never student
   reasoning, approved solution bodies, prompt bodies, cookies, or bearer
   tokens.

All Tutor write transactions acquire aggregate locks in the order `thread ->
job -> session -> learning submission -> open-review release`. Claim uses a
bounded thread-first `SKIP LOCKED` scan; new maintenance and privacy workflows
must preserve that order.

## Rollback boundary

Application rollback is safe before Tutor writes begin because old binaries do
not reference the additive tables. After Tutor data exists, stop the new Tutor
worker/routes and preserve the schema and rows. Dropping tables, constraints,
or append-only triggers is not an application rollback.

If migration execution fails, PostgreSQL rolls back the migration transaction.
Investigate the exact constraint or lock failure, restore service with the old
binary if necessary, and retry only after a new maintenance preflight.

Rolling an application back after 012 is safe because 012 broadens only the
expired-safe state transition required by the Store. Do not restore the 011
function text after 012 has been recorded: doing so can strand final-attempt
jobs and consume capacity indefinitely.

## Operational gates left for later phases

- PostgreSQL and Store adapters now enforce session/release authorization,
  deletion-generation fences, current lease tokens, safe recovery, and atomic
  request/head ledgers. The worker must call the provider only after the
  dispatch-intent Store transaction returned success.
- Snapshot JSON is reconstructed from authoritative rows in PostgreSQL, but
  canonical snapshot/request/message hashes cannot be recomputed by SQL. Store
  code must revalidate them on every trusted read/write boundary.
- A `MAY_HAVE_BEEN_DELIVERED` row is never enough evidence that the provider
  was not called. Lease recovery must terminate it as `DELIVERY_UNKNOWN`; only
  explicit student action may create the separately counted retry job.
- Tombstoning now immediately removes Store authorization to read or dispatch
  a thread. HTTP DTO/BOLA behavior and physical retention/deletion remain
  release gates for system acceptance.
- Purging transient batch uploads/transcripts does not tombstone a committed
  learning version or its Tutor history. Tutor lifetime follows the learning
  submission generation; raw batch work keeps its separate cleanup generation.
