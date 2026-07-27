import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';

const execFileAsync = promisify(execFile);
const connectionString = process.env.AMC12_TEST_DATABASE_URL;
const contentRoot = fileURLToPath(new URL('../../practice-content/', import.meta.url));

async function generatedSyntheticPrivate() {
  const directory = await mkdtemp(`${tmpdir()}/amc-pg-content-`);
  try {
    const privatePath = `${directory}/private.json`;
    await execFileAsync('python3', [
      '-m', 'amc_content.cli', 'build',
      '--form', 'fixtures/synthetic-25/source-form.json',
      '--answer-key', 'fixtures/synthetic-25/approved-answer-key.json',
      '--source-root', '.',
      '--public-output', `${directory}/public.json`,
      '--private-output', privatePath,
      '--allow-test-only'
    ], { cwd: contentRoot });
    return { directory, manifest: JSON.parse(await readFile(privatePath, 'utf8')) };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

test('PostgreSQL migration rerun and real private pipeline import smoke test', { skip: !connectionString }, async (t) => {
  const store = new PostgresStore({ connectionString, max: 12 });
  const built = await generatedSyntheticPrivate();
  t.after(async () => {
    await rm(built.directory, { recursive: true, force: true });
    await store.close();
  });

  await Promise.all(Array.from({ length: 12 }, () => runMigrations(store.pool)));
  const first = await store.pool.query('SELECT filename, applied_at FROM amc_practice.schema_migrations ORDER BY filename');
  await runMigrations(store.pool);
  const second = await store.pool.query('SELECT filename, applied_at FROM amc_practice.schema_migrations ORDER BY filename');
  assert.deepEqual(second.rows, first.rows, 'rerunning must skip recorded migrations');
  assert.deepEqual(first.rows.map((row) => row.filename), ['001_initial.sql', '002_pipeline_audit_metadata.sql']);

  const service = new PracticeService({
    store,
    authPepper: 'postgres-test-pepper-that-is-long-enough-for-safe-hmac-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true
  });
  // The source fixture has a stable revision; importing it repeatedly is safe
  // because the canonical source manifest hash is immutable.
  const imported = await service.importManifest(built.manifest, { publish: true });
  assert.equal(imported.id, built.manifest.id);
  assert.equal(imported.version, built.manifest.version);
  const audit = await store.pool.query(
    `SELECT published, test_only, source_manifest_hash, content_hash, question_bundle_hash, provenance
     FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2`,
    [built.manifest.id, built.manifest.version]
  );
  assert.equal(audit.rows[0].published, true);
  assert.equal(audit.rows[0].test_only, true);
  assert.equal(audit.rows[0].source_manifest_hash, built.manifest.manifestHash);
  assert.equal(audit.rows[0].content_hash, built.manifest.contentHash);
  assert.equal(audit.rows[0].question_bundle_hash, built.manifest.questionBundleHash);
  assert.deepEqual(audit.rows[0].provenance, built.manifest.provenance);

  // Exercise the real catalog SQL, not just the in-memory adapter. A CTE does
  // not retain PostgreSQL's base-table functional-dependency shortcut, so the
  // question count must be computed without an under-specified GROUP BY.
  const catalog = await service.listForms();
  const listed = catalog.find((form) => form.id === built.manifest.id && form.version === built.manifest.version);
  assert.deepEqual(listed, {
    id: built.manifest.id,
    version: built.manifest.version,
    title: built.manifest.title,
    durationMs: 4_500_000,
    questionCount: 25
  });

  const student = await service.seedAccessCode({
    code: `pg-smoke-${randomUUID()}`,
    displayName: 'Postgres smoke student'
  });
  const attempt = await service.createAttempt(student.id, built.manifest.id);
  const final = await service.final(student.id, attempt.attempt.id, 'postgres-final-0001', {
    expectedAnswersRevision: attempt.attempt.answersRevision,
    expectedStateRevision: attempt.attempt.stateRevision
  });
  assert.equal(final.attempt.phase, 'FINALIZED');
  const results = await service.getResults(student.id, attempt.attempt.id);
  assert.equal(results.finalSubmission.answers.length, 25);
});
