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
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { archiveReleaseFixture } from './archive-fixture.js';
import { fixtureManifest } from './helpers.js';
import {
  approvedContextArtifact, approvalReceiptsForArtifact, FakeInferenceClient, learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

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
  const secondStore = new PostgresStore({ connectionString, max: 4 });
  const built = await generatedSyntheticPrivate();
  t.after(async () => {
    await rm(built.directory, { recursive: true, force: true });
    await secondStore.close();
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
    '004_one_published_form_revision.sql',
    '005_learning_submission_core.sql',
    '006_approved_context_learning_reports.sql'
  ]);

  const learningColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('attempts', 'reasoning_revision'),
         ('learning_submissions', 'official_submission_kind'),
         ('learning_submission_versions', 'creation_reason'),
         ('learning_submission_versions', 'context_status'),
         ('learning_submission_versions', 'context_set_id'),
         ('learning_question_responses', 'answer_origin'),
         ('learning_question_responses', 'reasoning_origin'),
         ('learning_work_items', 'input_hash'),
         ('learning_work_items', 'deletion_generation'),
         ('learning_work_items', 'analysis_run_id'),
         ('learning_question_analyses', 'run_metadata'),
         ('learning_question_analyses', 'error_class'),
         ('learning_question_analyses', 'retryable')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(learningColumns.rows, [
    { table_name: 'attempts', column_name: 'reasoning_revision', is_nullable: 'NO' },
    { table_name: 'learning_question_analyses', column_name: 'error_class', is_nullable: 'YES' },
    { table_name: 'learning_question_analyses', column_name: 'retryable', is_nullable: 'NO' },
    { table_name: 'learning_question_analyses', column_name: 'run_metadata', is_nullable: 'YES' },
    { table_name: 'learning_question_responses', column_name: 'answer_origin', is_nullable: 'NO' },
    { table_name: 'learning_question_responses', column_name: 'reasoning_origin', is_nullable: 'NO' },
    { table_name: 'learning_submission_versions', column_name: 'context_set_id', is_nullable: 'YES' },
    { table_name: 'learning_submission_versions', column_name: 'context_status', is_nullable: 'NO' },
    { table_name: 'learning_submission_versions', column_name: 'creation_reason', is_nullable: 'NO' },
    { table_name: 'learning_submissions', column_name: 'official_submission_kind', is_nullable: 'NO' },
    { table_name: 'learning_work_items', column_name: 'analysis_run_id', is_nullable: 'YES' },
    { table_name: 'learning_work_items', column_name: 'deletion_generation', is_nullable: 'NO' },
    { table_name: 'learning_work_items', column_name: 'input_hash', is_nullable: 'NO' }
  ]);
  const learningConstraints = await store.pool.query(
    `SELECT conname, condeferrable, condeferred, pg_get_constraintdef(oid) AS definition
     FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname IN (
         'amc_attempts_id_student_form_unique',
         'amc_learning_submission_current_version_fk'
       )
     ORDER BY conname`
  );
  assert.deepEqual(learningConstraints.rows, [
    {
      conname: 'amc_attempts_id_student_form_unique',
      condeferrable: false,
      condeferred: false,
      definition: 'UNIQUE (id, student_id, form_id, form_version)'
    },
    {
      conname: 'amc_learning_submission_current_version_fk',
      condeferrable: true,
      condeferred: true,
      definition: 'FOREIGN KEY (id, current_version) REFERENCES amc_practice.learning_submission_versions(learning_submission_id, version_number) DEFERRABLE INITIALLY DEFERRED'
    }
  ]);
  const analysisLineageConstraints = await store.pool.query(
    `SELECT conname, pg_get_constraintdef(oid) AS definition
     FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname = ANY($1::text[])
     ORDER BY conname`, [[
      'amc_analysis_run_version_lineage_fk',
      'amc_approved_context_question_set_fk',
      'amc_learning_report_run_version_fk',
      'amc_learning_work_run_version_fk'
    ]]
  );
  assert.deepEqual(analysisLineageConstraints.rows.map((row) => row.conname), [
    'amc_analysis_run_version_lineage_fk',
    'amc_approved_context_question_set_fk',
    'amc_learning_report_run_version_fk',
    'amc_learning_work_run_version_fk'
  ]);
  assert.equal(analysisLineageConstraints.rows.every((row) => row.definition.includes('FOREIGN KEY')), true);

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
  const secondService = new PracticeService({
    store: secondStore,
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
  const reasoning = await service.putReasoning(student.id, attempt.attempt.id, 'postgres-reasoning-001', {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'PostgreSQL reasoning snapshot' },
      { questionNumber: 2, reasoningText: null }
    ]
  });
  assert.equal(reasoning.reasoningRevision, 1);
  const reasoningIdempotency = await store.pool.query(
    `SELECT response_body FROM amc_practice.idempotency_records
     WHERE student_id = $1 AND scope = $2 AND key = $3`,
    [student.id, `attempt:${attempt.attempt.id}:put-reasoning`, 'postgres-reasoning-001']
  );
  assert.equal(reasoningIdempotency.rowCount, 1);
  assert.equal(JSON.stringify(reasoningIdempotency.rows[0].response_body).includes('PostgreSQL reasoning snapshot'), false);
  assert.equal(reasoningIdempotency.rows[0].response_body.responseKind, 'CURRENT_REASONING_ENVELOPE');
  const currentAttempt = await service.getAttempt(student.id, attempt.attempt.id);
  const final = await service.final(student.id, attempt.attempt.id, 'postgres-final-0001', {
    expectedAnswersRevision: currentAttempt.answersRevision,
    expectedStateRevision: currentAttempt.stateRevision
  });
  assert.equal(final.attempt.phase, 'FINALIZED');
  assert.equal(final.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const results = await service.getResults(student.id, attempt.attempt.id);
  assert.equal(results.finalSubmission.answers.length, 25);
  const learningRows = await store.pool.query(
    `SELECT ls.official_submission_id, ls.official_submission_kind,
            lsv.creation_reason, lsv.context_status, lsv.evidence_hash,
            count(lqr.*)::integer AS response_count,
            count(lqr.*) FILTER (WHERE lqr.reasoning_origin = 'DURING_ATTEMPT')::integer AS reasoning_count,
            min(lwi.status) AS analysis_status,
            min(lwi.input_hash) AS input_hash
     FROM amc_practice.learning_submissions ls
     JOIN amc_practice.learning_submission_versions lsv
       ON lsv.learning_submission_id = ls.id AND lsv.version_number = ls.current_version
     JOIN amc_practice.learning_question_responses lqr
       ON lqr.learning_submission_version_id = lsv.id
     JOIN amc_practice.learning_work_items lwi
       ON lwi.learning_submission_version_id = lsv.id
     WHERE ls.attempt_id = $1
     GROUP BY ls.official_submission_id, ls.official_submission_kind,
              lsv.creation_reason, lsv.context_status, lsv.evidence_hash`,
    [attempt.attempt.id]
  );
  assert.deepEqual(learningRows.rows[0], {
    official_submission_id: final.submission.id,
    official_submission_kind: 'FINAL',
    creation_reason: 'FINAL_COMMIT',
    context_status: 'CONTEXT_UNAVAILABLE',
    evidence_hash: final.learningSubmission.evidenceHash,
    response_count: 25,
    reasoning_count: 1,
    analysis_status: 'BLOCKED_CONTEXT',
    input_hash: final.learningSubmission.evidenceHash
  });

  // The deferred parent->current-version FK is checked at COMMIT, not merely
  // by application convention.
  const currentVersionClient = await store.pool.connect();
  try {
    await currentVersionClient.query('BEGIN');
    await currentVersionClient.query(
      'UPDATE amc_practice.learning_submissions SET current_version = 2 WHERE attempt_id = $1',
      [attempt.attempt.id]
    );
    await assert.rejects(
      () => currentVersionClient.query('COMMIT'),
      (error) => error.code === '23503'
        && error.constraint === 'amc_learning_submission_current_version_fk'
    );
  } finally {
    await currentVersionClient.query('ROLLBACK').catch(() => {});
    currentVersionClient.release();
  }

  // Force a failure after both the official and learning rows have been
  // written. PostgresStore must roll back the complete unit of work.
  const rollbackStudent = await service.seedAccessCode({
    code: `pg-rollback-${randomUUID()}`,
    displayName: 'Postgres rollback student'
  });
  const rollbackAttempt = await service.createAttempt(rollbackStudent.id, built.manifest.id);
  const originalWithAttemptLock = store.withAttemptLock.bind(store);
  store.withAttemptLock = (attemptId, work) => originalWithAttemptLock(attemptId, async (tx) => {
    if (tx) {
      const originalCreate = tx.createLearningSubmission.bind(tx);
      tx.createLearningSubmission = async (aggregate) => {
        await originalCreate(aggregate);
        throw new Error('postgres-injected-after-learning-write');
      };
    }
    return work(tx);
  });
  await assert.rejects(
    () => service.final(rollbackStudent.id, rollbackAttempt.attempt.id, 'postgres-rollback-final', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    }),
    /postgres-injected-after-learning-write/
  );
  store.withAttemptLock = originalWithAttemptLock;
  const rolledBack = await store.pool.query(
    `SELECT a.phase,
            (SELECT count(*)::integer FROM amc_practice.submissions s WHERE s.attempt_id = a.id) AS official_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = a.id) AS learning_count
     FROM amc_practice.attempts a WHERE a.id = $1`,
    [rollbackAttempt.attempt.id]
  );
  assert.deepEqual(rolledBack.rows[0], { phase: 'TIMED', official_count: 0, learning_count: 0 });

  // Preliminary score paths must never create a learning aggregate.
  const checkpointStudent = await service.seedAccessCode({
    code: `pg-checkpoint-${randomUUID()}`,
    displayName: 'Postgres checkpoint student'
  });
  const checkpointAttempt = await service.createAttempt(checkpointStudent.id, built.manifest.id);
  await service.checkpoint(checkpointStudent.id, checkpointAttempt.attempt.id, 'postgres-checkpoint-1', {
    expectedAnswersRevision: 0,
    expectedStateRevision: 0
  });
  const checkpointParity = await store.pool.query(
    `SELECT count(*) FILTER (WHERE s.kind = 'CHECKPOINT')::integer AS preliminary_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count
     FROM amc_practice.submissions s WHERE s.attempt_id = $1`,
    [checkpointAttempt.attempt.id]
  );
  assert.deepEqual(checkpointParity.rows[0], { preliminary_count: 1, learning_count: 0 });

  const deadlineStudent = await service.seedAccessCode({
    code: `pg-deadline-${randomUUID()}`,
    displayName: 'Postgres deadline student'
  });
  const deadlineAttempt = await service.createAttempt(deadlineStudent.id, built.manifest.id);
  await store.pool.query(
    `UPDATE amc_practice.attempts SET clock_started_at = now() - interval '76 minutes'
     WHERE id = $1`,
    [deadlineAttempt.attempt.id]
  );
  assert.equal((await service.processDueAttempt(deadlineAttempt.attempt.id)).processed, true);
  const deadlineParity = await store.pool.query(
    `SELECT count(*) FILTER (WHERE s.kind = 'DEADLINE')::integer AS preliminary_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count
     FROM amc_practice.submissions s WHERE s.attempt_id = $1`,
    [deadlineAttempt.attempt.id]
  );
  assert.deepEqual(deadlineParity.rows[0], { preliminary_count: 1, learning_count: 0 });

  // Simulate a pre-feature historical FINAL by allowing the official final
  // transaction to commit while replacing only the new aggregate writer.
  const historicStudent = await service.seedAccessCode({
    code: `pg-historic-${randomUUID()}`,
    displayName: 'Postgres historical student'
  });
  const historicAttempt = await service.createAttempt(historicStudent.id, built.manifest.id);
  const historicWithAttemptLock = store.withAttemptLock.bind(store);
  store.withAttemptLock = (attemptId, work) => historicWithAttemptLock(attemptId, async (tx) => {
    if (tx) {
      tx.createLearningSubmission = async (aggregate) => ({
        submission: aggregate.submission,
        version: aggregate.version,
        responses: aggregate.responses,
        workItems: [aggregate.workItem]
      });
    }
    return work(tx);
  });
  const historicFinal = await service.final(historicStudent.id, historicAttempt.attempt.id, 'historic-final-pg', {
    expectedAnswersRevision: 0,
    expectedStateRevision: 0
  });
  store.withAttemptLock = historicWithAttemptLock;
  assert.equal((await store.pool.query(
    'SELECT count(*)::integer AS count FROM amc_practice.learning_submissions WHERE attempt_id = $1',
    [historicAttempt.attempt.id]
  )).rows[0].count, 0);
  const historicOfficialBefore = await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1',
    [historicFinal.submission.id]
  );
  const historicAnswersBefore = await store.pool.query(
    'SELECT * FROM amc_practice.submission_answers WHERE submission_id = $1 ORDER BY question_number',
    [historicFinal.submission.id]
  );
  const repaired = await service.reconcileFinalLearningSubmission(historicAttempt.attempt.id);
  const repairedAgain = await secondService.reconcileFinalLearningSubmission(historicAttempt.attempt.id);
  assert.equal(repaired.created, true);
  assert.equal(repairedAgain.created, false);
  assert.deepEqual(repairedAgain.learningSubmission, repaired.learningSubmission);
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [historicFinal.submission.id]
  )).rows, historicOfficialBefore.rows);
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submission_answers WHERE submission_id = $1 ORDER BY question_number',
    [historicFinal.submission.id]
  )).rows, historicAnswersBefore.rows);

  // Independent store pools model separate API processes contending on the
  // same attempt row. Different idempotency keys cannot create two finals.
  const raceStudent = await service.seedAccessCode({
    code: `pg-final-race-${randomUUID()}`,
    displayName: 'Postgres final race student'
  });
  const raceAttempt = await service.createAttempt(raceStudent.id, built.manifest.id);
  const racedFinals = await Promise.allSettled([
    service.final(raceStudent.id, raceAttempt.attempt.id, 'pg-final-race-left', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    }),
    secondService.final(raceStudent.id, raceAttempt.attempt.id, 'pg-final-race-right', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    })
  ]);
  assert.equal(racedFinals.filter((result) => result.status === 'fulfilled').length, 1);
  const rejectedRace = racedFinals.find((result) => result.status === 'rejected');
  assert.equal(rejectedRace?.reason?.code, 'INVALID_STATE');
  const raceCounts = await store.pool.query(
    `SELECT
       (SELECT count(*)::integer FROM amc_practice.submissions s WHERE s.attempt_id = $1 AND s.kind = 'FINAL') AS final_count,
       (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count,
       (SELECT count(*)::integer FROM amc_practice.learning_submission_versions lsv
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS version_count,
       (SELECT count(*)::integer FROM amc_practice.learning_question_responses lqr
          JOIN amc_practice.learning_submission_versions lsv ON lsv.id = lqr.learning_submission_version_id
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS response_count,
       (SELECT count(*)::integer FROM amc_practice.learning_work_items lwi
          JOIN amc_practice.learning_submission_versions lsv ON lsv.id = lwi.learning_submission_version_id
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS work_count`,
    [raceAttempt.attempt.id]
  );
  assert.deepEqual(raceCounts.rows[0], {
    final_count: 1,
    learning_count: 1,
    version_count: 1,
    response_count: 25,
    work_count: 1
  });

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

  // Both revisions exist, so the simple form FK would accept either one. The
  // four-column attempt FK must reject attaching a learning submission to the
  // revision that this attempt did not actually start with.
  const pinnedStudent = await service.seedAccessCode({
    code: `pg-pinned-negative-${randomUUID()}`,
    displayName: 'Postgres pinned-form negative student'
  });
  const pinnedAttempt = await service.createAttempt(pinnedStudent.id, concurrentFormId);
  const wrongPinnedVersion = pinnedAttempt.attempt.formVersion === 'race-v1' ? 'race-v2' : 'race-v1';
  const wrongFormClient = await store.pool.connect();
  try {
    await wrongFormClient.query('BEGIN');
    const fakeFinalId = randomUUID();
    await wrongFormClient.query(
      `INSERT INTO amc_practice.submissions
       (id, attempt_id, kind, slot, trigger, active_elapsed_ms, scoring_policy,
        total_points, maximum_points, answered_count, correct_count, incorrect_count,
        blank_count, unscored_count, created_at)
       VALUES ($1, $2, 'FINAL', 'FINAL', 'NEGATIVE_FK_TEST', 0, $3::jsonb,
               4.5, 18, 0, 0, 0, 3, 0, now())`,
      [fakeFinalId, pinnedAttempt.attempt.id, JSON.stringify({
        id: 'amc-legacy', version: '1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0
      })]
    );
    await assert.rejects(
      () => wrongFormClient.query(
        `INSERT INTO amc_practice.learning_submissions
         (id, student_id, attempt_id, official_submission_id, official_submission_kind,
          form_id, form_version, source_type, lifecycle_status, current_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'FINAL', $5, $6,
                 'INTERACTIVE_FINAL', 'COMMITTED', 1, now(), now())`,
        [randomUUID(), pinnedStudent.id, pinnedAttempt.attempt.id, fakeFinalId, concurrentFormId, wrongPinnedVersion]
      ),
      (error) => error.code === '23503'
        && error.constraint === 'amc_learning_submission_attempt_form_fk'
    );
  } finally {
    await wrongFormClient.query('ROLLBACK').catch(() => {});
    wrongFormClient.release();
  }

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

  // The approved-context repair and durable worker path is exercised against
  // real PostgreSQL. Two pools race for one row; SKIP LOCKED permits exactly
  // one claim, an expired lease is reclaimed, and the old owner cannot write.
  const reviewForm = learningReviewForm();
  await store.importForm(reviewForm, { publish: true, allowTestOnlyPublish: true });
  const reviewStudent = await service.seedAccessCode({
    code: `pg-learning-review-${randomUUID()}`,
    displayName: 'Postgres learning review student'
  });
  const reviewAttempt = await service.createAttempt(reviewStudent.id, reviewForm.id);
  await service.putReasoning(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-reasoning-1', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'Subtract the same quantity from both sides.' }]
  });
  const reviewCurrent = await service.getAttempt(reviewStudent.id, reviewAttempt.attempt.id);
  const reviewFinal = await service.final(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-final-1', {
    expectedAnswersRevision: reviewCurrent.answersRevision,
    expectedStateRevision: reviewCurrent.stateRevision
  });
  assert.equal(reviewFinal.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const officialBeforeAnalysis = await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [reviewFinal.submission.id]
  );

  const approvedArtifact = approvedContextArtifact(reviewForm, { readyNumbers: [1] });
  const importedContext = await new ApprovedContextImporter({
    store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(approvedArtifact, approvalReceiptsForArtifact(approvedArtifact));
  assert.equal(importedContext.length, 1);
  assert.equal(importedContext[0].questions.length, 1);
  assert.equal(importedContext[0].approvalAuthorityId, 'approval-authority:fixture');
  assert.equal(importedContext[0].questions[0].solutions[0].authorityReceipt.status, 'active');
  assert.equal((await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id)).status, 'QUEUED');

  const claimedAt = new Date('2026-08-01T20:00:00.000Z');
  const claims = await Promise.all([
    store.claimLearningAnalysisWork({ workerId: 'pg-worker-shared', now: claimedAt, leaseMs: 1_000 }),
    secondStore.claimLearningAnalysisWork({ workerId: 'pg-worker-shared', now: claimedAt, leaseMs: 1_000 })
  ]);
  assert.equal(claims.filter(Boolean).length, 1);
  const staleClaim = claims.find(Boolean);
  assert.ok(staleClaim);

  const fakeInference = new FakeInferenceClient();
  const reclaimAt = new Date(claimedAt.getTime() + 2_000);
  const reclaimed = await secondStore.claimLearningAnalysisWork({
    workerId: 'pg-worker-shared', now: reclaimAt, leaseMs: 120_000
  });
  assert.ok(reclaimed);
  assert.notEqual(reclaimed.workItem.leaseToken, staleClaim.workItem.leaseToken);
  assert.equal(await store.heartbeatLearningAnalysisWork({
    workItemId: staleClaim.workItem.id, workerId: 'pg-worker-shared',
    leaseToken: staleClaim.workItem.leaseToken, now: reclaimAt, leaseMs: 120_000
  }), false);
  assert.equal(await store.completeLearningAnalysisWork({
    workItemId: staleClaim.workItem.id,
    analysisRunId: staleClaim.run.id,
    workerId: 'pg-worker-shared',
    expectedLeaseToken: staleClaim.workItem.leaseToken,
    expectedInputHash: staleClaim.workItem.inputHash,
    expectedDeletionGeneration: staleClaim.workItem.deletionGeneration,
    expectedVersionNumber: staleClaim.version.versionNumber,
    expectedStudentId: staleClaim.submission.studentId,
    expectedContextSetId: staleClaim.version.contextSetId,
    outcomes: [], report: {}, now: reclaimAt
  }), false);
  assert.equal(await store.retryLearningAnalysisWork({
    workItemId: staleClaim.workItem.id, analysisRunId: staleClaim.run.id,
    workerId: 'pg-worker-shared', expectedLeaseToken: staleClaim.workItem.leaseToken,
    expectedInputHash: staleClaim.workItem.inputHash,
    expectedDeletionGeneration: staleClaim.workItem.deletionGeneration,
    expectedVersionNumber: staleClaim.version.versionNumber,
    expectedStudentId: staleClaim.submission.studentId,
    expectedContextSetId: staleClaim.version.contextSetId,
    availableAt: reclaimAt, now: reclaimAt, lastErrorCode: 'STALE_TOKEN_TEST'
  }), false);
  assert.equal(await secondStore.heartbeatLearningAnalysisWork({
    workItemId: reclaimed.workItem.id, workerId: 'pg-worker-shared',
    leaseToken: reclaimed.workItem.leaseToken, now: reclaimAt, leaseMs: 120_000
  }), true);
  assert.equal(await secondStore.retryLearningAnalysisWork({
    workItemId: reclaimed.workItem.id, analysisRunId: reclaimed.run.id,
    workerId: 'pg-worker-shared', expectedLeaseToken: reclaimed.workItem.leaseToken,
    expectedInputHash: reclaimed.workItem.inputHash,
    expectedDeletionGeneration: reclaimed.workItem.deletionGeneration,
    expectedVersionNumber: reclaimed.version.versionNumber,
    expectedStudentId: reclaimed.submission.studentId,
    expectedContextSetId: reclaimed.version.contextSetId,
    availableAt: reclaimAt, now: reclaimAt, lastErrorCode: 'NEW_TOKEN_TEST'
  }), true);
  const worker = new LearningReviewWorker({
    store: secondStore,
    inferenceClient: fakeInference,
    workerId: 'pg-worker-shared',
    leaseMs: 1_000,
    clock: () => reclaimAt
  });
  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'PARTIAL', providerCalls: 1 });
  assert.equal(fakeInference.calls.length, 1);
  const learningReport = await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id);
  assert.equal(learningReport.status, 'PARTIAL');
  assert.equal(learningReport.summary.totalQuestions, 25);
  assert.equal(learningReport.summary.analyzedCount, 1);
  assert.equal(learningReport.questions.length, 25);
  assert.equal(JSON.stringify(learningReport).includes('gpt-5.6-terra'), false);
  assert.equal(JSON.stringify(learningReport).includes('reviewer:fixture'), false);
  const internalAnalysis = await store.pool.query(
    `SELECT status, provider_invoked, run_metadata, error_class, retryable
     FROM amc_practice.learning_question_analyses
     WHERE analysis_run_id = $1 ORDER BY question_number`, [staleClaim.run.id]
  );
  assert.equal(internalAnalysis.rowCount, 25);
  assert.deepEqual(internalAnalysis.rows[0], {
    status: 'SUCCEEDED',
    provider_invoked: true,
    run_metadata: {
      provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-analysis-prompt-v1', schemaVersion: 'amc-question-analysis-v1',
      usage: { inputTokens: 800, cachedInputTokens: 120, outputTokens: 200, totalTokens: 1000, reasoningTokens: 50 }
    },
    error_class: null,
    retryable: false
  });
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [reviewFinal.submission.id]
  )).rows, officialBeforeAnalysis.rows);

  await service.reset(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-reset-1');
  assert.equal((await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id)).status, 'PARTIAL');
});
