import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const migrationUrl = new URL('../migrations/011_question_tutor_persistence.sql', import.meta.url);
const recoveryMigrationUrl = new URL('../migrations/012_tutor_expired_lease_recovery.sql', import.meta.url);
const connectionString = process.env.AMC12_TEST_DATABASE_URL;
const { Pool } = pg;

test('Tutor persistence migration freezes immutable lineage and bounded thread/job state', async () => {
  const sql = await readFile(migrationUrl, 'utf8');

  for (const table of [
    'learning_tutor_snapshots', 'learning_tutor_threads',
    'learning_tutor_messages', 'learning_tutor_turn_jobs'
  ]) assert.match(sql, new RegExp(`CREATE TABLE amc_practice\\.${table}`));

  assert.match(sql, /payload_schema = 'amc-tutor-snapshot-v2'/);
  assert.match(sql, /octet_length\(snapshot_payload::text\) <= 262144/);
  assert.match(sql, /snapshot_payload \?& ARRAY/);
  assert.match(sql, /learningSubmissionVersionId/);
  assert.match(sql, /CONSTRAINT amc_tutor_snapshot_response_fk/);
  assert.match(sql, /CONSTRAINT amc_tutor_snapshot_official_answer_fk/);
  assert.match(sql, /CONSTRAINT amc_tutor_snapshot_batch_result_item_fk/);
  assert.match(sql, /CONSTRAINT amc_tutor_snapshot_context_artifact_fk/);
  assert.match(sql, /tutor_contract_version = 'amc-tutor-contract-v2'/);
  assert.match(sql, /successful_turn_count BETWEEN 0 AND 9/);
  assert.match(sql, /request_count BETWEEN 0 AND 32/);
  assert.match(sql, /successful_history_bytes BETWEEN 0 AND 51200/);
  assert.match(sql, /turn_number BETWEEN 1 AND 9/);
  assert.match(sql, /octet_length\(content_markdown\) BETWEEN 1 AND 2048/);
  assert.match(sql, /octet_length\(content_markdown\) BETWEEN 1 AND 4096/);

  assert.match(sql,
    /UNIQUE \(learning_submission_version_id, question_number, analysis_run_id, report_id\)/);
  assert.doesNotMatch(sql,
    /UNIQUE \(learning_submission_version_id, question_number, analysis_run_id, report_id, snapshot_hash\)/);
  assert.match(sql, /CONSTRAINT amc_tutor_job_owner_unique\s+UNIQUE \(id, thread_id, student_id\)/);
  assert.match(sql, /CONSTRAINT amc_tutor_job_thread_fk\s+FOREIGN KEY \(thread_id, student_id, snapshot_hash, context_hash,/);
  assert.match(sql, /retry_authorization = 'STUDENT_EXPLICIT'/);
  assert.match(sql, /CHECK \(retry_of_job_id IS NULL OR retry_of_job_id <> id\)/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_child_per_retry_idx/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_job_per_request_ordinal_idx/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_root_job_per_request_idx/);
  assert.match(sql, /CONSTRAINT amc_tutor_job_response_message_fk/);
  assert.match(sql, /CONSTRAINT amc_tutor_message_source_job_fk/);
  assert.match(sql, /DEFERRABLE INITIALLY DEFERRED/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_active_job_per_thread_idx/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_success_per_turn_idx/);
  assert.match(sql, /CREATE UNIQUE INDEX amc_tutor_one_assistant_message_per_job_idx/);

  for (const trigger of [
    'amc_tutor_snapshots_append_only', 'amc_guard_tutor_thread_mutation',
    'amc_reject_tutor_thread_delete', 'amc_tutor_messages_append_only',
    'amc_validate_tutor_fork', 'amc_validate_tutor_assistant_message',
    'amc_validate_tutor_job', 'amc_validate_tutor_snapshot_insert',
    'amc_guard_tutor_job_transition', 'amc_reject_tutor_job_delete'
  ]) assert.match(sql, new RegExp(`CREATE TRIGGER ${trigger}`));
  for (const trigger of [
    'amc_tutor_thread_head_from_thread', 'amc_tutor_thread_head_from_job',
    'amc_tutor_thread_head_from_message'
  ]) assert.match(sql, new RegExp(`CREATE CONSTRAINT TRIGGER ${trigger}`));

  assert.match(sql, /OLD\.status IN \('SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED'\)/);
  assert.match(sql, /Tutor claim must increment attempt count/);
  assert.match(sql, /Tutor running lease identity is immutable/);
  assert.match(sql, /Expired Tutor lease cannot dispatch or publish a worker result/);
  assert.match(sql, /Tutor claim must start a clean provider attempt/);
  assert.match(sql, /Tutor tombstone must advance deletion generation exactly once/);
  assert.match(sql, /Tutor job must start as a clean queued intent/);
  assert.match(sql, /Tutor dispatch intent must commit before any terminal transition/);
  assert.match(sql, /Tutor commit must atomically advance one contiguous thread head/);
  assert.match(sql, /Tutor user messages must commit with their first turn job/);
  assert.match(sql, /OLD\.available_at > clock_timestamp\(\)/);
  assert.match(sql, /CREATE TRIGGER amc_guard_tutor_submission_deletion/);
  assert.doesNotMatch(sql, /CREATE TRIGGER amc_guard_tutor_batch_deletion/);
  assert.match(sql, /session\.expires_at > clock_timestamp\(\)/);
  assert.match(sql, /Tutor snapshot payload differs from authoritative content/);
  assert.match(sql, /tutor_source_generation_is_live/);
  assert.doesNotMatch(sql, /ON DELETE CASCADE/);
});

test('migration 012 replaces the immutable 011 guard for bounded expired-lease recovery',
  async () => {
    const oldSql = await readFile(migrationUrl, 'utf8');
    const recoverySql = await readFile(recoveryMigrationUrl, 'utf8');
    assert.doesNotMatch(oldSql, /Expired Tutor lease permits only bounded safe recovery/);
    assert.match(recoverySql, /CREATE OR REPLACE FUNCTION amc_practice\.guard_tutor_job_transition/);
    assert.match(recoverySql, /Expired Tutor lease permits only bounded safe recovery/);
    assert.match(recoverySql, /NEW\.outcome_code = 'ATTEMPTS_EXHAUSTED'/);
    assert.match(recoverySql, /NEW\.delivery_disposition = OLD\.delivery_disposition/);
  });

test('migration 012 upgrades an already-installed 011 guard in PostgreSQL',
  { skip: !connectionString }, async (t) => {
    const pool = new Pool({ connectionString, max: 2 });
    const schema = `amc_tutor_upgrade_${randomUUID().replaceAll('-', '')}`;
    t.after(async () => {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await pool.end();
    });
    await pool.query(`CREATE SCHEMA ${schema}`);
    const oldSql = await readFile(migrationUrl, 'utf8');
    const oldFunction = oldSql.match(
      /CREATE FUNCTION amc_practice\.guard_tutor_job_transition\(\)[\s\S]*?\n\$\$;/
    )?.[0];
    assert.ok(oldFunction, '011 must retain its original guard definition');
    await pool.query(oldFunction.replaceAll('amc_practice', schema));
    let definition = (await pool.query(
      `SELECT pg_get_functiondef('${schema}.guard_tutor_job_transition()'::regprocedure) AS body`
    )).rows[0].body;
    assert.match(definition, /Expired Tutor lease cannot dispatch or publish a worker result/);

    const recoverySql = (await readFile(recoveryMigrationUrl, 'utf8'))
      .replaceAll('amc_practice', schema);
    await pool.query(recoverySql);
    definition = (await pool.query(
      `SELECT pg_get_functiondef('${schema}.guard_tutor_job_transition()'::regprocedure) AS body`
    )).rows[0].body;
    assert.doesNotMatch(definition, /Expired Tutor lease cannot dispatch or publish a worker result/);
    assert.match(definition, /Expired Tutor lease permits only bounded safe recovery/);
  });
