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
import { archiveReleaseFixture } from './archive-fixture.js';
import { fixtureManifest } from './helpers.js';

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

test('PostgreSQL migration rerun plus private/archive import and publication-concurrency smoke test', { skip: !connectionString }, async (t) => {
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
  assert.deepEqual(first.rows.map((row) => row.filename), [
    '001_initial.sql',
    '002_pipeline_audit_metadata.sql',
    '003_archive_practice_scoring.sql',
    '004_one_published_form_revision.sql'
  ]);

  const archiveColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('form_questions', 'is_scored'),
         ('form_questions', 'accepted_options'),
         ('form_questions', 'correct_option'),
         ('submissions', 'unscored_count'),
         ('submission_answers', 'is_scored'),
         ('submission_answers', 'accepted_options'),
         ('submission_answers', 'correct_option')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(archiveColumns.rows, [
    { table_name: 'form_questions', column_name: 'accepted_options', is_nullable: 'NO' },
    { table_name: 'form_questions', column_name: 'correct_option', is_nullable: 'YES' },
    { table_name: 'form_questions', column_name: 'is_scored', is_nullable: 'NO' },
    { table_name: 'submission_answers', column_name: 'accepted_options', is_nullable: 'NO' },
    { table_name: 'submission_answers', column_name: 'correct_option', is_nullable: 'YES' },
    { table_name: 'submission_answers', column_name: 'is_scored', is_nullable: 'NO' },
    { table_name: 'submissions', column_name: 'unscored_count', is_nullable: 'NO' }
  ]);
  const publishedIndex = await store.pool.query(
    `SELECT indexdef
     FROM pg_indexes
     WHERE schemaname = 'amc_practice' AND indexname = 'amc_one_published_form_revision_idx'`
  );
  assert.equal(publishedIndex.rowCount, 1);
  assert.match(publishedIndex.rows[0].indexdef, /CREATE UNIQUE INDEX/);
  assert.match(publishedIndex.rows[0].indexdef, /WHERE \(published = true\)/);

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

  // Archive v1 only enters through the complete 48-form release workflow.
  // Keep this batch unpublished so the smoke test cannot change a current
  // historical catalog revision in a shared test database.
  const archiveRelease = archiveReleaseFixture({ version: `archive-pg-smoke-${randomUUID()}` });
  const importedArchive = await service.importArchiveRelease(archiveRelease, { publish: false });
  assert.equal(importedArchive.length, 48);
  assert.equal(importedArchive.every((form) => form.published === false && form.practiceKind === 'archive'), true);
  const archive = archiveRelease.forms.find((form) => form.id === 'amc12-2025-a');
  assert.ok(archive);
  const archiveAudit = await store.pool.query(
    `SELECT publication_status, source_schema_version, source_manifest_hash, content_hash, question_bundle_hash, provenance
     FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2`,
    [archive.id, archive.version]
  );
  assert.deepEqual(archiveAudit.rows[0], {
    publication_status: 'archive-practice',
    source_schema_version: 'amc-practice-archive-form-v1',
    source_manifest_hash: archive.manifestHash,
    content_hash: archive.contentHash,
    question_bundle_hash: archive.questionBundleHash,
    provenance: { ...archive.provenance, archiveNotice: archive.archiveNotice }
  });
  const archiveQuestions = await store.pool.query(
    `SELECT question_number, correct_option, accepted_options, is_scored
     FROM amc_practice.form_questions WHERE form_id = $1 AND form_version = $2 ORDER BY question_number`,
    [archive.id, archive.version]
  );
  assert.equal(archiveQuestions.rowCount, 25);
  assert.deepEqual(archiveQuestions.rows[11], {
    question_number: 12, correct_option: 'A', accepted_options: ['A'], is_scored: true
  });
  assert.deepEqual(archiveQuestions.rows[24], {
    question_number: 25, correct_option: null, accepted_options: [], is_scored: false
  });
  const alternativeArchive = archiveRelease.forms.find((form) => form.id === 'amc12-2012-b');
  assert.ok(alternativeArchive);
  const alternativeQuestion = await store.pool.query(
    `SELECT question_number, correct_option, accepted_options, is_scored
     FROM amc_practice.form_questions WHERE form_id = $1 AND form_version = $2 AND question_number = 12`,
    [alternativeArchive.id, alternativeArchive.version]
  );
  assert.deepEqual(alternativeQuestion.rows[0], {
    question_number: 12, correct_option: 'D', accepted_options: ['D', 'E'], is_scored: true
  });

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
    questionCount: 25,
    practiceKind: 'standard',
    archiveNotice: null,
    scoredQuestionCount: 25
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

  // Two application processes publishing different versions of the same form
  // must serialize, not leave two rows published. The partial unique index is
  // the final database backstop; ordered advisory locks make both requests
  // complete without a deadlock/retry cycle.
  const publicationService = new PracticeService({
    store,
    authPepper: 'postgres-test-pepper-that-is-long-enough-for-safe-hmac-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowGenericManifestImport: true
  });
  const concurrentFormId = `pg-publication-race-${randomUUID()}`;
  const versionOne = { ...fixtureManifest, id: concurrentFormId, version: 'race-v1', title: 'Race version one' };
  const versionTwo = { ...fixtureManifest, id: concurrentFormId, version: 'race-v2', title: 'Race version two' };
  await Promise.all([
    publicationService.importManifest(versionOne, { publish: true }),
    publicationService.importManifest(versionTwo, { publish: true })
  ]);
  const concurrentPublished = await store.pool.query(
    `SELECT version FROM amc_practice.form_revisions WHERE form_id = $1 AND published = true`,
    [concurrentFormId]
  );
  assert.equal(concurrentPublished.rowCount, 1);
  assert.ok(['race-v1', 'race-v2'].includes(concurrentPublished.rows[0].version));

  // Overlapping batches intentionally list the same form IDs in opposite
  // orders. importForms must acquire its advisory publication locks in sorted
  // order, otherwise these two transactions deadlock (A→B versus B→A).
  const batchFormA = `pg-publication-batch-a-${randomUUID()}`;
  const batchFormB = `pg-publication-batch-b-${randomUUID()}`;
  const batchA1 = { ...fixtureManifest, id: batchFormA, version: 'batch-v1', title: 'Batch A v1' };
  const batchB1 = { ...fixtureManifest, id: batchFormB, version: 'batch-v1', title: 'Batch B v1' };
  const batchA2 = { ...fixtureManifest, id: batchFormA, version: 'batch-v2', title: 'Batch A v2' };
  const batchB2 = { ...fixtureManifest, id: batchFormB, version: 'batch-v2', title: 'Batch B v2' };
  await Promise.all([
    publicationService.importManifests([batchA1, batchB1], { publish: true }),
    publicationService.importManifests([batchB2, batchA2], { publish: true })
  ]);
  const batchPublished = await store.pool.query(
    `SELECT form_id, count(*) FILTER (WHERE published)::integer AS published_count
     FROM amc_practice.form_revisions
     WHERE form_id = ANY($1::text[])
     GROUP BY form_id
     ORDER BY form_id`,
    [[batchFormA, batchFormB]]
  );
  assert.deepEqual(batchPublished.rows, [
    { form_id: batchFormA, published_count: 1 },
    { form_id: batchFormB, published_count: 1 }
  ].sort((left, right) => left.form_id.localeCompare(right.form_id)));
});
