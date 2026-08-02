# Analysis contract v2 deployment runbook

## Purpose

Migration `010_analysis_contract_v2.sql` is a drained, one-way maintenance-window cutover.
It preserves completed v1 reports and upgrades work that has not crossed the
provider boundary. It must never run concurrently with an old analysis worker
or an old API process that can create analysis runs/work.

## Preflight

1. Record the API, worker, database migration, and Gateway release identifiers.
   The Gateway release must include the reviewed v2 golden fixture and
   `/v2/analyze-question`.
2. Compare the API and Gateway golden fixture bytes in the release workspace
   and record both SHA-256 values. Package tests intentionally read only the
   fixture in their own repository, so an independent checkout remains valid.
3. Back up the database according to the normal PostgreSQL recovery procedure.
4. Enter a maintenance window. Disable automatic restart and stop every old API
   and learning-worker process; verify all old processes are absent. This avoids
   both mixed-contract writes and a lock-order deadlock between migration and an
   API transaction inserting `learning_analysis_runs` before
   `learning_work_items`.
5. Verify both queries return zero:

   ```sql
   SELECT count(*) FROM amc_practice.learning_analysis_runs
   WHERE status = 'RUNNING';

   SELECT count(*) FROM amc_practice.learning_work_items
   WHERE work_type = 'ANALYZE_SUBMISSION' AND status = 'RUNNING';
   ```

If a row remains, do not relabel it. Complete it with the matching v1 release
under a controlled drain or cancel it through an audited operator procedure,
then repeat shutdown and preflight. Migration intentionally fails with SQLSTATE
`55006` while either count is nonzero.

## Cutover

1. Run migrations through the normal migration runner.
2. Verify migration 010 is recorded exactly once.
3. Verify `analysis_contract_version` is non-null, queued rows are v2, and no
   row has a value outside the v1/v2 allowlist.
4. Deploy the v2 API/worker artifact. Start only the v2 API and worker release;
   never restore an old API or worker binary.
5. Submit one scored accepted-alternative fixture, one blank answer with
   reasoning, and one unscored fixture. Verify the first two use v2 status
   semantics and the unscored item records `provider_invoked=false`.
6. Confirm queue depth falls, provider error rate is normal, and no log contains
   student bodies, answer keys, bearer tokens, or raw provider output.

## Rollback boundary

Do not restart a v1 worker after migration. It does not understand the v2 run
label or request contract. If the v2 worker must be rolled back, stop analysis
workers and leave queued v2 rows untouched while deploying a corrected v2
worker. Existing v1 terminal reports remain readable throughout.

The append-only snapshot triggers and validated scoring constraints are data
integrity controls. Removing or disabling them is not an application rollback.

## Recovery checks

- A `SCORING_SNAPSHOT_INVALID` outcome is investigated as a data-integrity
  incident; it is not retried through the provider.
- A queued v1 row is not claimable by the v2 worker and requires explicit
  operator review.
- Repeated `55006` migration failures mean the worker drain is incomplete; do
  not bypass the guard.
- Compare report/provider counts with official submission rows. Analysis must
  not update official score or answer snapshots.
