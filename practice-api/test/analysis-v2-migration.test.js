import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.AMC12_TEST_DATABASE_URL;
const migrationUrl = new URL('../migrations/010_analysis_contract_v2.sql', import.meta.url);

function isolatedSchema() {
  return `amc_analysis_v2_${randomUUID().replaceAll('-', '')}`;
}

function inSchema(sql, schema) {
  return sql.replaceAll('amc_practice', schema);
}

async function createPreV2Surface(pool, schema) {
  await pool.query(`CREATE SCHEMA ${schema}`);
  await pool.query(`
    CREATE TABLE ${schema}.form_questions (
      id integer PRIMARY KEY,
      is_scored boolean NOT NULL,
      correct_option char(1),
      accepted_options jsonb NOT NULL
    );
    CREATE TABLE ${schema}.submission_answers (
      id integer PRIMARY KEY,
      selected_option char(1),
      correct_option char(1),
      accepted_options jsonb NOT NULL,
      is_scored boolean NOT NULL,
      is_correct boolean,
      points numeric NOT NULL
    );
    CREATE TABLE ${schema}.learning_batch_result_items (
      id integer PRIMARY KEY,
      selected_option char(1),
      correct_option char(1),
      accepted_options jsonb NOT NULL,
      is_scored boolean NOT NULL,
      is_correct boolean,
      points numeric NOT NULL
    );
    CREATE TABLE ${schema}.learning_batch_results (
      id integer PRIMARY KEY
    );
    CREATE TABLE ${schema}.learning_analysis_runs (
      id integer PRIMARY KEY,
      status text NOT NULL
    );
    CREATE TABLE ${schema}.learning_work_items (
      id integer PRIMARY KEY,
      work_type text NOT NULL,
      status text NOT NULL
    );
  `);
}

test('analysis v2 migration statically freezes drain, history, defaults, and validated scoring checks', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  const lock = sql.indexOf('LOCK TABLE amc_practice.learning_work_items');
  const drain = sql.indexOf("status = 'RUNNING'");
  const alter = sql.indexOf('ADD COLUMN analysis_contract_version');
  assert.ok(lock >= 0 && lock < drain && drain < alter,
    'the claim-blocking lock and drain guard must execute before relabelling any run');
  assert.match(sql, /IN SHARE ROW EXCLUSIVE MODE/);
  assert.match(sql, /ERRCODE = '55006'/);
  assert.match(sql, /IMMUTABLE/);
  assert.match(sql, /PARALLEL SAFE/);
  assert.match(sql, /WHEN status = 'QUEUED' THEN 'amc-analysis-contract-v2'/);
  assert.match(sql, /ELSE 'amc-analysis-contract-v1'/);
  assert.match(sql, /SET DEFAULT 'amc-analysis-contract-v2'/);
  assert.match(sql, /CHECK \(analysis_contract_version IN \('amc-analysis-contract-v1', 'amc-analysis-contract-v2'\)\)/);
  for (const constraint of [
    'amc_form_question_scoring_v2_check',
    'amc_submission_answer_scoring_v2_check',
    'amc_batch_result_item_scoring_v2_check'
  ]) {
    assert.match(sql, new RegExp(`VALIDATE CONSTRAINT ${constraint}`));
  }
  for (const trigger of [
    'amc_submission_answers_append_only',
    'amc_learning_batch_results_append_only',
    'amc_learning_batch_result_items_append_only'
  ]) assert.match(sql, new RegExp(`CREATE TRIGGER ${trigger}`));
  assert.doesNotMatch(sql, /learning_reports|report_hash|question_input_hash|question_context_hash/);
});

test('analysis v2 migration labels historical terminal runs v1 and queued runs v2 on PostgreSQL',
  { skip: !connectionString }, async (t) => {
    const pool = new Pool({ connectionString, max: 2 });
    const schema = isolatedSchema();
    t.after(async () => {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await pool.end();
    });
    await createPreV2Surface(pool, schema);
    await pool.query(`
      INSERT INTO ${schema}.form_questions VALUES
        (1, true, 'D', '["D", "E"]'), (2, false, NULL, '[]');
      INSERT INTO ${schema}.submission_answers VALUES
        (1, 'E', 'D', '["D", "E"]', true, true, 6),
        (2, NULL, NULL, '[]', false, NULL, 0);
      INSERT INTO ${schema}.learning_batch_result_items VALUES
        (1, 'A', 'D', '["D", "E"]', true, false, 0),
        (2, 'C', NULL, '[]', false, NULL, 0);
      INSERT INTO ${schema}.learning_analysis_runs VALUES
        (1, 'QUEUED'), (2, 'COMPLETE'), (3, 'PARTIAL'),
        (4, 'UNASSESSABLE'), (5, 'FAILED'), (6, 'CANCELLED');
    `);
    const sql = inSchema(await readFile(migrationUrl, 'utf8'), schema);
    await pool.query(sql);
    const runs = await pool.query(
      `SELECT id, analysis_contract_version FROM ${schema}.learning_analysis_runs ORDER BY id`
    );
    assert.deepEqual(runs.rows, [
      { id: 1, analysis_contract_version: 'amc-analysis-contract-v2' },
      ...[2, 3, 4, 5, 6].map((id) => ({ id, analysis_contract_version: 'amc-analysis-contract-v1' }))
    ]);
    await pool.query(`INSERT INTO ${schema}.learning_analysis_runs(id, status) VALUES (7, 'QUEUED')`);
    assert.equal((await pool.query(
      `SELECT analysis_contract_version FROM ${schema}.learning_analysis_runs WHERE id = 7`
    )).rows[0].analysis_contract_version, 'amc-analysis-contract-v2');
    const constraints = await pool.query(
      `SELECT conname, convalidated FROM pg_constraint
       WHERE connamespace = $1::regnamespace
         AND conname LIKE '%scoring_v2_check' ORDER BY conname`, [schema]
    );
    assert.equal(constraints.rowCount, 3);
    assert.equal(constraints.rows.every((row) => row.convalidated === true), true);
    const triggers = await pool.query(
      `SELECT tgname FROM pg_trigger
       WHERE tgrelid IN ('${schema}.submission_answers'::regclass,
                         '${schema}.learning_batch_results'::regclass,
                         '${schema}.learning_batch_result_items'::regclass)
         AND NOT tgisinternal ORDER BY tgname`
    );
    assert.deepEqual(triggers.rows.map((row) => row.tgname), [
      'amc_learning_batch_result_items_append_only',
      'amc_learning_batch_results_append_only',
      'amc_submission_answers_append_only'
    ]);
    const predicate = await pool.query(
      `SELECT
         ${schema}.valid_amc_scoring(true, 'D', '["D", "E"]') AS alternative,
         ${schema}.valid_amc_scoring(false, NULL, '[]') AS unscored,
         ${schema}.valid_amc_scoring(true, 'D', '["E", "D"]') AS unordered,
         ${schema}.valid_amc_scoring(true, 'D', '["D", "D"]') AS duplicate,
         ${schema}.valid_amc_scoring(false, 'D', '[]') AS invalid_unscored`
    );
    assert.deepEqual(predicate.rows[0], {
      alternative: true, unscored: true, unordered: false, duplicate: false, invalid_unscored: false
    });
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ${schema}.submission_answers VALUES
         (3, 'E', 'D', '["D", "E"]', true, false, 6)`
      ),
      (error) => error.code === '23514'
    );
    await assert.rejects(
      () => pool.query(`UPDATE ${schema}.submission_answers SET is_correct = false WHERE id = 1`),
      (error) => error.code === '55000'
    );
    await pool.query(`INSERT INTO ${schema}.learning_batch_results VALUES (1)`);
    await assert.rejects(
      () => pool.query(`DELETE FROM ${schema}.learning_batch_results WHERE id = 1`),
      (error) => error.code === '55000'
    );
    await assert.rejects(
      () => pool.query(`DELETE FROM ${schema}.learning_batch_result_items WHERE id = 1`),
      (error) => error.code === '55000'
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ${schema}.submission_answers VALUES
         (4, 'E', 'D', '["D", "E"]', true, NULL, 6)`
      ),
      (error) => error.code === '23514'
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ${schema}.learning_batch_result_items VALUES
         (3, 'E', 'D', '["D", "E"]', true, NULL, 6)`
      ),
      (error) => error.code === '23514'
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ${schema}.learning_batch_result_items VALUES
         (4, 'C', NULL, '[]', false, NULL, 1)`
      ),
      (error) => error.code === '23514'
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO ${schema}.submission_answers VALUES
         (5, 'C', NULL, '[]', false, NULL, 1)`
      ),
      (error) => error.code === '23514'
    );
  });

test('analysis v2 migration refuses a RUNNING analysis before any contract column change',
  { skip: !connectionString }, async (t) => {
    const pool = new Pool({ connectionString, max: 2 });
    const schema = isolatedSchema();
    t.after(async () => {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await pool.end();
    });
    await createPreV2Surface(pool, schema);
    await pool.query(`INSERT INTO ${schema}.learning_analysis_runs VALUES (1, 'RUNNING')`);
    const sql = inSchema(await readFile(migrationUrl, 'utf8'), schema);
    await assert.rejects(() => pool.query(sql), (error) => error.code === '55006');
    const column = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = 'learning_analysis_runs'
         AND column_name = 'analysis_contract_version'`, [schema]
    );
    assert.equal(column.rowCount, 0);
  });
