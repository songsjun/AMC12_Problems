import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { segmentBatchGatewaySources } from '../src/batch-ingest/domain.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';
import {
  approvedContextArtifact,
  approvalReceiptsForArtifact,
  FakeInferenceClient,
  learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

const NOW = new Date('2026-08-21T13:00:00.000Z');

function gatewayOutputs(plan) {
  return plan.chunks.map((chunk, chunkIndex) => {
    const segments = segmentBatchGatewaySources(chunk.sources);
    return {
      schema: 'amc-batch-decomposition-v1',
      correlationId: plan.correlationId,
      inputHash: chunk.inputHash,
      planHash: chunk.planHash,
      chunkId: chunk.chunkId,
      items: chunkIndex === 0 ? [{
        itemKey: 'postgres-batch-review-q1',
        candidateQuestionNumbers: [1], proposedQuestionNumber: 1,
        answer: 'A', reasoningSummary: 'Direct algebraic calculation.',
        confidence: 0.98, ambiguity: 'NONE',
        spans: [{
          segmentId: segments[0].segmentId,
          assetId: segments[0].assetId,
          startByte: segments[0].startByte,
          endByte: segments[0].endByte,
          sha256: segments[0].sha256
        }],
        conflictFlags: [], requiresConfirmation: false
      }] : [],
      unmappedSpans: chunkIndex === 0 ? [] : segments.map((segment) => ({
        segmentId: segment.segmentId, assetId: segment.assetId,
        startByte: segment.startByte, endByte: segment.endByte,
        sha256: segment.sha256, reason: 'NO_QUESTION_MATCH'
      }))
    };
  });
}

function gatewayMetadata(plan) {
  return plan.chunks.map((chunk) => ({
    chunkId: chunk.chunkId, inputHash: chunk.inputHash,
    provider: 'openai', requestedModel: 'gpt-5.6-terra',
    responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1',
    schemaVersion: 'amc-batch-decomposition-v1',
    usage: {
      inputTokens: 500, cachedInputTokens: 50, outputTokens: 100,
      totalTokens: 600, reasoningTokens: 20
    }
  }));
}

async function prepareBatch(service, store, studentId, attemptId, prefix) {
  const text = 'Question 1: A. I used a direct algebraic calculation.';
  const created = await service.createLearningBatch(studentId, attemptId, `${prefix}-create`, {
    files: [{
      displayName: 'answers.md', kind: 'TEXT', contentType: 'text/markdown',
      declaredBytes: Buffer.byteLength(text)
    }]
  });
  await service.uploadLearningBatchAsset(
    studentId, attemptId, created.batch.id, created.batch.assets[0].id,
    `${prefix}-upload`, Readable.from([text]), Buffer.byteLength(text)
  );
  await service.submitLearningBatch(studentId, attemptId, created.batch.id, `${prefix}-submit`);
  const claim = await store.claimNextAiWork({
    workerId: `${prefix}-extractor`, now: NOW, leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(claim?.job.batch.id, created.batch.id);
  const prepared = await service.prepareLearningBatchDecomposition(studentId, attemptId, created.batch.id);
  const recorded = await service.recordLearningBatchDecomposition(studentId, attemptId, created.batch.id, {
    masterPlanHash: prepared.plan.masterPlanHash,
    outputs: gatewayOutputs(prepared.plan),
    runMetadata: gatewayMetadata(prepared.plan),
    workerFence: {
      workerId: claim.job.workItem.leaseOwner,
      leaseToken: claim.job.workItem.leaseToken,
      inputHash: claim.job.workItem.inputHash,
      deletionGeneration: claim.job.workItem.deletionGeneration
    }
  });
  const item = recorded.batch.mapping.items.find((candidate) => !candidate.unmapped);
  return {
    batchId: created.batch.id,
    input: {
      mappingRevision: recorded.batch.mapping.revision,
      responses: [{
        questionNumber: 1, selectedOption: 'A', reasoningText: item.evidenceText,
        sourceItemIds: [item.id]
      }],
      discardedItemIds: recorded.batch.mapping.items
        .filter((candidate) => candidate.unmapped).map((candidate) => candidate.id)
    }
  };
}

async function waitForAdvisoryWaiters(pool, holderPid, expected) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const result = await pool.query(
      `SELECT count(DISTINCT waiting.pid)::integer AS count
       FROM pg_locks held
       JOIN pg_locks waiting
         ON waiting.locktype = held.locktype
        AND waiting.database IS NOT DISTINCT FROM held.database
        AND waiting.classid IS NOT DISTINCT FROM held.classid
        AND waiting.objid IS NOT DISTINCT FROM held.objid
        AND waiting.objsubid IS NOT DISTINCT FROM held.objsubid
       WHERE held.pid = $1 AND held.locktype = 'advisory' AND held.granted
         AND waiting.pid <> held.pid AND NOT waiting.granted`,
      [holderPid]
    );
    if (result.rows[0].count >= expected) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out waiting for ${expected} exact-form advisory lock waiters.`);
}

function uniqueForm(label) {
  const suffix = randomUUID();
  return {
    ...learningReviewForm(),
    id: `${label}-${suffix}`,
    version: 'batch-review-v1',
    sourceManifestHash: canonicalHash({ label, suffix, kind: 'source' }),
    contentHash: canonicalHash({ label, suffix, kind: 'content' }),
    questionBundleHash: canonicalHash({ label, suffix, kind: 'questions' }),
    manifestHash: canonicalHash({ label, suffix, kind: 'manifest' })
  };
}

// This evidence flow is invoked by postgres-smoke.test.js so every global
// dispatcher/budget assertion shares one serial PostgreSQL scenario. Running
// it as a second test file would make two intentionally global ledgers race.
export async function runBatchReviewPostgresEvidence({ connectionString, t }) {
  const store = new PostgresStore({ connectionString, max: 6 });
  const root = await mkdtemp(join(tmpdir(), 'amc-batch-review-pg-'));
  const privateUploadStore = new PrivateUploadStore({ root, highWatermarkPercent: 100 });
  await privateUploadStore.init();
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await store.close();
  });
  await runMigrations(store.pool);
  const suffix = randomUUID();
  const form = uniqueForm('batch-review-pg');
  await store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  const service = new PracticeService({
    store, privateUploadStore,
    authPepper: 'postgres-batch-review-pepper-that-is-long-enough-for-tests',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true,
    batchIntakeEnabled: true,
    batchReviewEnabled: true,
    clock: () => new Date(NOW)
  });
  const student = await service.seedAccessCode({
    code: `batch-review-${suffix}`,
    displayName: 'Postgres Batch Review Student'
  });
  const timed = await service.createAttempt(student.id, form.id);
  const first = await service.createBatchReviewWorkspace(
    student.id, form.id, form.version, 'postgres-batch-workspace-first'
  );
  const resumed = await service.createBatchReviewWorkspace(
    student.id, form.id, form.version, 'postgres-batch-workspace-second'
  );
  assert.equal(first.created, true);
  assert.equal(resumed.created, false);
  assert.equal(resumed.workspace.id, first.workspace.id);
  assert.notEqual(first.workspace.id, timed.attempt.id);
  assert.equal(first.workspace.analysisContextStatus, 'UNAVAILABLE');
  const listed = await service.listBatchReviewWorkspaces(student.id);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].analysisContextStatus, 'UNAVAILABLE');
  for (const questionNumber of Array.from({ length: 25 }, (_, index) => index + 1)) {
    await assert.rejects(
      () => service.getLearningHistoryQuestion(
        student.id, first.workspace.learningSubmissionId, '1', String(questionNumber)
      ),
      (error) => error?.statusCode === 404 && error?.code === 'LEARNING_HISTORY_QUESTION_NOT_FOUND'
    );
  }

  const invariant = await store.pool.query(
    `SELECT attempt.attempt_mode, attempt.phase, attempt.clock_state,
            attempt.active_elapsed_ms, attempt.answers_revision, attempt.reasoning_revision,
            submission.source_type, submission.current_version,
            version.creation_reason, version.context_status, version.context_set_id,
            count(DISTINCT response.question_number)::integer AS response_count,
            count(DISTINCT work.id)::integer AS work_count,
            count(DISTINCT answer.question_number)::integer AS mutable_answer_count,
            count(DISTINCT official.id)::integer AS official_count,
            count(DISTINCT timer.id)::integer AS timer_count
     FROM amc_practice.attempts attempt
     JOIN amc_practice.learning_submissions submission ON submission.attempt_id = attempt.id
     JOIN amc_practice.learning_submission_versions version
       ON version.learning_submission_id = submission.id AND version.version_number = 1
     LEFT JOIN amc_practice.learning_question_responses response
       ON response.learning_submission_version_id = version.id
     LEFT JOIN amc_practice.learning_work_items work
       ON work.learning_submission_version_id = version.id
     LEFT JOIN amc_practice.attempt_answers answer ON answer.attempt_id = attempt.id
     LEFT JOIN amc_practice.submissions official ON official.attempt_id = attempt.id
     LEFT JOIN amc_practice.timer_events timer ON timer.attempt_id = attempt.id
     WHERE attempt.id = $1
     GROUP BY attempt.id, submission.id, version.id`,
    [first.workspace.id]
  );
  assert.deepEqual(invariant.rows[0], {
    attempt_mode: 'BATCH_REVIEW',
    phase: 'BATCH_REVIEW',
    clock_state: 'PAUSED',
    active_elapsed_ms: '0',
    answers_revision: 0,
    reasoning_revision: 0,
    source_type: 'BATCH_REVIEW',
    current_version: 1,
    creation_reason: 'BATCH_REVIEW_ANCHOR',
    context_status: 'CONTEXT_UNAVAILABLE',
    context_set_id: null,
    response_count: 25,
    work_count: 0,
    mutable_answer_count: 0,
    official_count: 0,
    timer_count: 0
  });
  const blanks = await store.pool.query(
    `SELECT count(*)::integer AS count
     FROM amc_practice.learning_question_responses response
     JOIN amc_practice.learning_submission_versions version
       ON version.id = response.learning_submission_version_id
     JOIN amc_practice.learning_submissions submission
       ON submission.id = version.learning_submission_id
     WHERE submission.attempt_id = $1
       AND response.answer_origin = 'BATCH_REVIEW_BLANK'
       AND response.selected_option IS NULL
       AND response.reasoning_text = ''
       AND response.reasoning_origin = 'NONE'`,
    [first.workspace.id]
  );
  assert.equal(blanks.rows[0].count, 25);
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_submission_versions version
       SET context_status = 'CONTEXT_READY'
       FROM amc_practice.learning_submissions submission
       WHERE submission.id = version.learning_submission_id
         AND submission.attempt_id = $1
         AND version.version_number = 1`,
      [first.workspace.id]
    ),
    /batch review anchor cannot pin analysis context|violates check constraint/
  );

  const importer = new ApprovedContextImporter({
    store, clock: () => new Date(NOW), trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  const partialArtifact = approvedContextArtifact(form, { readyNumbers: [1] });
  const [partialContext] = await importer.import(
    partialArtifact, approvalReceiptsForArtifact(partialArtifact)
  );
  assert.equal((await store.pool.query(
    `SELECT amc_practice.batch_review_context_is_complete($1, $2, $3) AS complete`,
    [form.id, form.version, partialContext.id]
  )).rows[0].complete, false);

  const prepared = await prepareBatch(
    service, store, student.id, first.workspace.id, `pg-context-late-${suffix}`
  );
  const committed = await service.confirmLearningBatch(
    student.id, first.workspace.id, prepared.batchId,
    `pg-context-late-confirm-${suffix}`, prepared.input
  );
  assert.equal(committed.batch.status, 'COMMITTED');
  assert.equal(committed.batch.committedVersion, 2);
  assert.equal((await service.getLearningHistoryQuestion(
    student.id, first.workspace.learningSubmissionId, '2', '1'
  )).response.answerOrigin, 'BATCH_CONFIRMED');
  await assert.rejects(
    () => service.getLearningHistoryQuestion(
      student.id, first.workspace.learningSubmissionId, '2', '2'
    ),
    (error) => error?.statusCode === 404 && error?.code === 'LEARNING_HISTORY_QUESTION_NOT_FOUND'
  );
  assert.equal((await service.getLearningReport(student.id, first.workspace.id)).status, 'BLOCKED_CONTEXT');
  assert.equal((await store.pool.query(
    `SELECT count(*)::integer AS count
     FROM amc_practice.learning_analysis_runs run
     JOIN amc_practice.learning_submission_versions version
       ON version.id = run.learning_submission_version_id
     JOIN amc_practice.learning_submissions submission
       ON submission.id = version.learning_submission_id
     WHERE submission.attempt_id = $1`, [first.workspace.id]
  )).rows[0].count, 0);

  const artifact = approvedContextArtifact(form, {
    readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1)
  });
  const [context] = await importer.import(artifact, approvalReceiptsForArtifact(artifact));
  assert.equal((await service.getLearningReport(student.id, first.workspace.id)).status, 'QUEUED');
  await store.pool.query(
    `UPDATE amc_practice.learning_work_items work
     SET priority = 100, available_at = '1900-01-01T00:00:00.000Z'
     FROM amc_practice.learning_submission_versions version
     WHERE version.id = work.learning_submission_version_id
       AND version.learning_submission_id = $1 AND version.version_number = 2
       AND work.status = 'QUEUED'`,
    [first.workspace.learningSubmissionId]
  );
  const analysisClaim = await store.claimLearningAnalysisWork({
    workerId: `pg-batch-review-analysis-${suffix}`, now: NOW, leaseMs: 120_000
  });
  assert.equal(analysisClaim.submission.attemptId, first.workspace.id);
  const inference = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store, inferenceClient: inference,
    workerId: `pg-batch-review-analysis-${suffix}`, clock: () => new Date(NOW)
  });
  assert.deepEqual(await worker.processClaimed(analysisClaim), {
    processed: true, status: 'COMPLETE', providerCalls: 1
  });
  const report = await service.getLearningReport(student.id, first.workspace.id);
  assert.equal(report.status, 'COMPLETE');
  assert.equal(report.questions[0].solutionComparisons.length, 2);
  const session = await service.login(`batch-review-${suffix}`);
  const tutor = await service.createTutorRootThread(
    student.id, session.session.id, first.workspace.learningSubmissionId,
    '2', '1', `pg-batch-review-tutor-${suffix}`
  );
  assert.equal(tutor.thread.thread.sourceType, 'BATCH_REVIEW');
  assert.equal(tutor.thread.question.solutionReferences.length, 2);

  const successor = {
    ...form,
    version: 'batch-review-v2',
    title: `${form.title} successor`,
    sourceManifestHash: canonicalHash({ suffix, kind: 'successor-source' }),
    contentHash: canonicalHash({ suffix, kind: 'successor-content' }),
    questionBundleHash: canonicalHash({ suffix, kind: 'successor-questions' }),
    manifestHash: canonicalHash({ suffix, kind: 'successor-manifest' })
  };
  await store.importForm(successor, { publish: true, allowTestOnlyPublish: true });
  assert.equal((await store.getForm(form.id, form.version)).published, false);
  assert.equal((await service.getBatchReviewWorkspace(student.id, first.workspace.id)).formVersion,
    form.version);
  assert.equal((await service.getLearningHistoryReport(
    student.id, first.workspace.learningSubmissionId, '2'
  )).status, 'COMPLETE');
  const successorTutor = await service.createTutorRootThread(
    student.id, session.session.id, first.workspace.learningSubmissionId,
    '2', '1', `pg-batch-review-successor-tutor-${suffix}`
  );
  assert.equal(successorTutor.thread.thread.formVersion, form.version);
  await assert.rejects(
    () => service.createBatchReviewWorkspace(
      student.id, form.id, form.version, `pg-superseded-workspace-${suffix}`
    ),
    (error) => error?.statusCode === 404 && error?.code === 'BATCH_REVIEW_NOT_FOUND'
  );
  const successorWorkspace = await service.createBatchReviewWorkspace(
    student.id, successor.id, successor.version, `pg-successor-workspace-${suffix}`
  );
  assert.equal(successorWorkspace.created, true);
  assert.equal(successorWorkspace.workspace.formVersion, successor.version);

  // Re-importing the same active artifact is idempotent and never manufactures
  // a second analysis run. Superseded contexts are terminal and are not revived
  // as a shortcut for exercising the separate context-late repair flow.
  const duplicatePrepared = await prepareBatch(
    service, store, student.id, first.workspace.id, `pg-duplicate-repair-${suffix}`
  );
  await service.confirmLearningBatch(
    student.id, first.workspace.id, duplicatePrepared.batchId,
    `pg-duplicate-repair-confirm-${suffix}`, duplicatePrepared.input
  );
  assert.equal((await service.getLearningReport(student.id, first.workspace.id)).status, 'QUEUED');
  const [duplicateContext] = await importer.import(artifact, approvalReceiptsForArtifact(artifact));
  assert.equal(duplicateContext.id, context.id);
  assert.equal(duplicateContext.active, true);
  assert.equal((await service.getLearningReport(student.id, first.workspace.id)).status, 'QUEUED');
  assert.equal((await store.pool.query(
    `SELECT count(*)::integer AS count
     FROM amc_practice.learning_analysis_runs run
     JOIN amc_practice.learning_submission_versions version
       ON version.id = run.learning_submission_version_id
     WHERE version.learning_submission_id = $1 AND version.version_number = 3`,
    [first.workspace.learningSubmissionId]
  )).rows[0].count, 1);

  // Force confirm and import to queue behind one exact-form advisory lock.
  // Confirm is deliberately the first waiter; after the gate is released it
  // commits BLOCKED_CONTEXT, then import observes and repairs that version.
  // Without the shared lock this ordering has a deterministic missed wakeup.
  const raceForm = uniqueForm('batch-review-pg-lock-race');
  await store.importForm(raceForm, { publish: true, allowTestOnlyPublish: true });
  const raceStudent = await service.seedAccessCode({
    code: `batch-review-race-${suffix}`, displayName: 'Batch Review Lock Race Student'
  });
  const raceWorkspace = await service.createBatchReviewWorkspace(
    raceStudent.id, raceForm.id, raceForm.version, `pg-race-workspace-${suffix}`
  );
  const racePrepared = await prepareBatch(
    service, store, raceStudent.id, raceWorkspace.workspace.id, `pg-lock-race-${suffix}`
  );
  const raceArtifact = approvedContextArtifact(raceForm, {
    readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1)
  });
  const raceImporter = new ApprovedContextImporter({
    store, clock: () => new Date(NOW), trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  const gate = await store.pool.connect();
  try {
    await gate.query('BEGIN');
    await gate.query(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      [raceForm.id, raceForm.version]
    );
    const confirmPromise = service.confirmLearningBatch(
      raceStudent.id, raceWorkspace.workspace.id, racePrepared.batchId,
      `pg-lock-race-confirm-${suffix}`, racePrepared.input
    );
    await waitForAdvisoryWaiters(store.pool, gate.processID, 1);
    const importPromise = raceImporter.import(
      raceArtifact, approvalReceiptsForArtifact(raceArtifact)
    );
    await waitForAdvisoryWaiters(store.pool, gate.processID, 2);
    await gate.query('COMMIT');
    const [raceCommitted] = await Promise.all([confirmPromise, importPromise]);
    assert.equal(raceCommitted.batch.status, 'COMMITTED');
  } finally {
    await gate.query('ROLLBACK').catch(() => {});
    gate.release();
  }
  const raceReport = await service.getLearningReport(
    raceStudent.id, raceWorkspace.workspace.id
  );
  assert.equal(raceReport.status, 'QUEUED');
  assert.equal((await store.pool.query(
    `SELECT count(*)::integer AS count
     FROM amc_practice.learning_analysis_runs run
     JOIN amc_practice.learning_submission_versions version
       ON version.id = run.learning_submission_version_id
     WHERE version.learning_submission_id = $1 AND version.version_number = 2`,
    [raceWorkspace.workspace.learningSubmissionId]
  )).rows[0].count, 1);
}
