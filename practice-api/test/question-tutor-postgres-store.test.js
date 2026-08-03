import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';
import { buildApp } from '../src/app.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import {
  computeTutorContextReleaseHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  tutorSha256
} from '../src/question-tutor/domain.js';
import {
  approvedContextArtifact,
  approvalReceiptsForArtifact,
  FakeInferenceClient,
  learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';
import { cookiesFromResponse } from './helpers.js';

const connectionString = process.env.AMC12_TEST_DATABASE_URL;

async function postgresTutorFixture(store, {
  createSnapshot = true, readyNumbers = [1]
} = {}) {
  const baseForm = learningReviewForm();
  const form = { ...baseForm, id: `tutor-pg-${randomUUID()}` };
  await store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  const service = new PracticeService({
    store,
    authPepper: 'postgres-tutor-pepper-that-is-long-enough-for-safe-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true
  });
  const accessCode = `tutor-pg-student-${randomUUID()}`;
  const student = await service.seedAccessCode({
    code: accessCode,
    displayName: 'Postgres tutor adapter student'
  });
  const attempt = await service.createAttempt(student.id, form.id);
  await service.putAnswers(student.id, attempt.attempt.id, {
    revision: 0,
    answers: readyNumbers.map((questionNumber) => ({
      questionNumber,
      selectedOption: form.questions.find((question) =>
        question.number === questionNumber).correctOption
    }))
  });
  await service.putReasoning(student.id, attempt.attempt.id, `reason-${randomUUID()}`, {
    revision: 0,
    notes: readyNumbers.map((questionNumber) => ({
      questionNumber,
      reasoningText: `Explain the justified method for question ${questionNumber}.`
    }))
  });
  const current = await service.getAttempt(student.id, attempt.attempt.id);
  const final = await service.final(student.id, attempt.attempt.id, `final-${randomUUID()}`, {
    expectedAnswersRevision: current.answersRevision,
    expectedStateRevision: current.stateRevision
  });
  const artifact = approvedContextArtifact(form, { readyNumbers });
  const [contextSet] = await new ApprovedContextImporter({
    store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const ready = await store.pool.query(
    `SELECT max(work.available_at) AS available_at
     FROM amc_practice.learning_work_items work
     JOIN amc_practice.learning_submission_versions version
       ON version.id = work.learning_submission_version_id
     WHERE version.learning_submission_id = $1 AND work.status = 'QUEUED'`,
    [final.learningSubmission.id]
  );
  const analysisNow = new Date(new Date(ready.rows[0].available_at).getTime() + 1);
  const claimed = await store.claimLearningAnalysisWork({
    workerId: 'tutor-pg-analysis-worker', now: analysisNow, leaseMs: 120_000
  });
  assert.ok(claimed);
  const analysisResult = await new LearningReviewWorker({
    store, inferenceClient: new FakeInferenceClient(),
    workerId: 'tutor-pg-analysis-worker', leaseMs: 120_000,
    clock: () => analysisNow
  }).processClaimed(claimed);
  assert.equal(analysisResult.processed, true);

  const lineage = (await store.pool.query(
    `SELECT report.id AS report_id, report.report_hash,
            analysis.question_input_hash, analysis.question_context_hash,
            response.selected_option, response.reasoning_text, response.answer_origin,
            submission.official_submission_id, submission.deletion_generation,
            context.artifact_set_hash, context.approval_authority_id,
            context.approval_receipt_set_hash, context.release_manifest_hash,
            context.release_content_hash, context.release_question_bundle_hash,
            question.question_content_hash
     FROM amc_practice.learning_reports report
     JOIN amc_practice.learning_analysis_runs run ON run.id = report.analysis_run_id
     JOIN amc_practice.learning_submission_versions version
       ON version.id = report.learning_submission_version_id
     JOIN amc_practice.learning_submissions submission
       ON submission.id = version.learning_submission_id
     JOIN amc_practice.learning_question_analyses analysis
       ON analysis.analysis_run_id = run.id AND analysis.question_number = 1
     JOIN amc_practice.learning_question_responses response
       ON response.learning_submission_version_id = version.id AND response.question_number = 1
     JOIN amc_practice.approved_context_sets context ON context.id = version.context_set_id
     JOIN amc_practice.approved_context_questions question
       ON question.context_set_id = context.id AND question.question_number = 1
     WHERE run.id = $1`, [claimed.run.id]
  )).rows[0];
  const sourceQuestion = claimed.questions.find((question) => question.questionNumber === 1);
  const approvedQuestion = contextSet.questions.find((question) => question.questionNumber === 1);
  const choices = Array.isArray(approvedQuestion.choices)
    ? Object.fromEntries(approvedQuestion.choices.map((choice) => [choice.option, choice.textMarkdown]))
    : approvedQuestion.choices;
  const contextReleaseHash = computeTutorContextReleaseHash({
    sourceType: 'INTERACTIVE_FINAL', formId: claimed.version.formId,
    formVersion: claimed.version.formVersion,
    manifestHash: lineage.release_manifest_hash,
    contentHash: lineage.release_content_hash,
    questionBundleHash: lineage.release_question_bundle_hash,
    contextSetId: claimed.version.contextSetId,
    contextArtifactSha256: lineage.artifact_set_hash,
    approvalAuthorityId: lineage.approval_authority_id,
    approvalReceiptSetHash: lineage.approval_receipt_set_hash,
    openReviewReleaseHash: null
  });
  const context = {
    learningSubmissionId: claimed.submission.id,
    learningSubmissionVersionId: claimed.version.id,
    versionNumber: claimed.version.versionNumber,
    formId: claimed.version.formId,
    formVersion: claimed.version.formVersion,
    contextSetId: claimed.version.contextSetId,
    contextArtifactSha256: lineage.artifact_set_hash,
    contextReleaseHash,
    evidenceHash: claimed.version.evidenceHash,
    question: {
      questionNumber: 1,
      questionId: `${claimed.version.formId}:q:1`,
      promptMarkdown: approvedQuestion.promptMarkdown,
      choices: ['A', 'B', 'C', 'D', 'E'].map((label) => ({
        label, textMarkdown: choices[label]
      })),
      isScored: sourceQuestion.scoring.isScored,
      officialAnswer: sourceQuestion.scoring.canonicalAnswer,
      acceptedOptions: sourceQuestion.scoring.acceptedOptions,
      studentAnswer: sourceQuestion.selectedOption,
      studentReasoning: sourceQuestion.reasoningText || null,
      solutions: approvedQuestion.solutions
        .filter((solution) => solution.modelEligibility.eligible
          && solution.authorityReceipt.status === 'active')
        .map((solution) => ({
          solutionId: solution.artifactSolutionId,
          approvalStatus: 'APPROVED', modelEligible: true,
          title: solution.title, markdown: solution.bodyMarkdown,
          bodySha256: solution.bodySha256, sourceSha256: solution.sourceRef.sha256,
          reviewerId: solution.reviewerId, reviewedAt: solution.reviewedAt,
          rightsStatus: solution.rightsStatus,
          authorityReceiptId: solution.authorityReceipt.receiptId,
          authorityReceiptStatus: solution.authorityReceipt.status,
          methodTags: solution.methodTags, qualityFlags: solution.qualityFlags
        }))
    }
  };
  const snapshotHash = computeTutorSnapshotHash(context);
  const questionResponseHash = canonicalHash({
    questionNumber: 1, selectedOption: sourceQuestion.selectedOption,
    reasoningText: sourceQuestion.reasoningText,
    answerOrigin: sourceQuestion.answerOrigin
  });
  const scoringSnapshotHash = canonicalHash(sourceQuestion.scoring);
  const snapshot = {
    id: randomUUID(), studentId: student.id,
    learningSubmissionId: claimed.submission.id,
    learningSubmissionVersionId: claimed.version.id,
    versionNumber: claimed.version.versionNumber,
    formId: claimed.version.formId, formVersion: claimed.version.formVersion,
    sourceType: 'INTERACTIVE_FINAL', questionNumber: 1,
    contextSetId: claimed.version.contextSetId,
    questionContentHash: lineage.question_content_hash,
    analysisRunId: claimed.run.id,
    analysisContractVersion: claimed.run.analysisContractVersion,
    analysisQuestionInputHash: lineage.question_input_hash,
    analysisQuestionContextHash: lineage.question_context_hash,
    reportId: lineage.report_id, reportHash: lineage.report_hash,
    evidenceHash: claimed.version.evidenceHash,
    questionResponseHash, scoringSnapshotHash,
    scoringOrigin: lineage.answer_origin,
    officialSubmissionId: lineage.official_submission_id, batchResultId: null,
    initialDeletionGeneration: lineage.deletion_generation,
    contextArtifactSha256: lineage.artifact_set_hash, contextReleaseHash,
    payloadSchema: 'amc-tutor-snapshot-v2', snapshotPayload: context,
    snapshotHash,
    threadLineageHash: computeTutorThreadLineageHash({
      analysisRunId: claimed.run.id,
      analysisContractVersion: claimed.run.analysisContractVersion,
      reportId: lineage.report_id, reportHash: lineage.report_hash,
      snapshotHash, questionResponseHash, scoringSnapshotHash,
      scoringOrigin: lineage.answer_origin,
      initialDeletionGeneration: lineage.deletion_generation
    }),
    createdAt: new Date()
  };
  const dbClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
  const sessionId = `tutor-session-${randomUUID()}`;
  await store.createSession({
    id: sessionId, studentId: student.id, csrfTokenHash: tutorSha256('csrf'),
    createdAt: dbClock, expiresAt: new Date(dbClock.getTime() + 3_600_000), revokedAt: null
  });
  if (createSnapshot) await store.createTutorSnapshot(snapshot);
  return { studentId: student.id, sessionId, snapshot, dbClock, service, accessCode };
}

async function seedPostgresBatchConfirmedTutorAuthority(store, {
  studentId, sessionId, learningSubmissionId
}) {
  const source = (await store.pool.query(
    `SELECT submission.attempt_id, submission.form_id, submission.form_version,
            submission.source_type, submission.current_version,
            submission.deletion_generation,
            version.context_set_id
     FROM amc_practice.learning_submissions submission
     JOIN amc_practice.learning_submission_versions version
       ON version.learning_submission_id = submission.id
      AND version.version_number = submission.current_version
     WHERE submission.id = $1 AND submission.student_id = $2`,
    [learningSubmissionId, studentId]
  )).rows[0];
  assert.ok(source);
  const batchId = randomUUID();
  const versionId = randomUUID();
  const batchResultId = randomUUID();
  const analysisRunId = randomUUID();
  const reportId = randomUUID();
  const versionNumber = Number(source.current_version) + 1;
  const createdAt = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
  const evidenceHash = tutorSha256(`batch-evidence:${batchId}`);
  const questionInputHash = tutorSha256(`batch-question-input:${batchId}`);
  const questionContextHash = tutorSha256(`batch-question-context:${batchId}`);
  const reportHash = tutorSha256(`batch-report:${batchId}`);
  const client = await store.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO amc_practice.learning_batches
       (id, student_id, attempt_id, learning_submission_id, base_version,
        form_id, form_version, status, mapping_revision, has_audio,
        deletion_state, deletion_generation, created_at, updated_at, source_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'DRAFT',0,false,'ACTIVE',0,$8,$8,$9)`,
      [batchId, studentId, source.attempt_id, learningSubmissionId,
        Number(source.current_version), source.form_id, source.form_version,
        createdAt, source.source_type]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_submission_versions
       (id, learning_submission_id, version_number, form_id, form_version,
        answers_revision, reasoning_revision, creation_reason, context_status,
        context_set_id, evidence_hash, created_at, batch_id)
       VALUES ($1,$2,$3,$4,$5,NULL,NULL,'BATCH_COMMIT','CONTEXT_READY',$6,$7,$8,$9)`,
      [versionId, learningSubmissionId, versionNumber, source.form_id,
        source.form_version, source.context_set_id, evidenceHash, createdAt, batchId]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_question_responses
       (learning_submission_version_id, form_id, form_version, question_number,
        selected_option, answer_origin, reasoning_text, reasoning_origin, created_at)
       VALUES ($1,$2,$3,1,'A','BATCH_CONFIRMED',
         'I subtracted the same quantity from both sides.',
         'BATCH_CONFIRMED_EVIDENCE',$4)`,
      [versionId, source.form_id, source.form_version, createdAt]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_batch_results
       (id, batch_id, learning_submission_version_id, scoring_scope, scoring_policy,
        total_points, maximum_points, mapped_question_count, answered_count,
        correct_count, incorrect_count, blank_count, unscored_count, created_at)
       VALUES ($1,$2,$3,'MAPPED_QUESTIONS_ONLY','{}'::jsonb,6,6,1,1,1,0,0,0,$4)`,
      [batchResultId, batchId, versionId, createdAt]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_batch_result_items
       (batch_result_id, question_number, selected_option, correct_option,
        accepted_options, is_scored, is_correct, points)
       VALUES ($1,1,'A','A','["A"]'::jsonb,true,true,6)`, [batchResultId]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_analysis_runs
       (id, learning_submission_version_id, context_set_id, version_number,
        input_hash, evidence_hash, deletion_generation, analysis_contract_version,
        status, created_at, started_at, completed_at, last_error_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'amc-analysis-contract-v2',
         'COMPLETE',$8,$8,$8,NULL)`,
      [analysisRunId, versionId, source.context_set_id, versionNumber,
        tutorSha256(`batch-analysis:${batchId}`), evidenceHash,
        Number(source.deletion_generation), createdAt]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_question_analyses
       (analysis_run_id, question_number, status, provider_invoked,
        reasoning_verdict, summary_markdown, strengths, gaps, suggestions,
        solution_comparisons, confidence, outcome_code, run_metadata,
        error_class, retryable, question_input_hash, question_context_hash, created_at)
       VALUES ($1,1,'SUCCEEDED',true,'CORRECT_AND_WELL_JUSTIFIED',
         'The reasoning is valid.','[]'::jsonb,'[]'::jsonb,'[]'::jsonb,
         '[]'::jsonb,0.95,NULL,'{}'::jsonb,NULL,false,$2,$3,$4)`,
      [analysisRunId, questionInputHash, questionContextHash, createdAt]
    );
    await client.query(
      `INSERT INTO amc_practice.learning_reports
       (id, analysis_run_id, learning_submission_version_id, status,
        generated_at, summary, report_hash)
       VALUES ($1,$2,$3,'COMPLETE',$4,'{}'::jsonb,$5)`,
      [reportId, analysisRunId, versionId, createdAt, reportHash]
    );
    await client.query(
      `UPDATE amc_practice.learning_submissions
       SET current_version = $2, updated_at = $3 WHERE id = $1`,
      [learningSubmissionId, versionNumber, createdAt]
    );
    await client.query(
      `UPDATE amc_practice.learning_batches
       SET status = 'COMMITTED', committed_version_id = $2,
           committed_version_number = $3, submitted_at = $4,
           committed_at = $4, updated_at = $4 WHERE id = $1`,
      [batchId, versionId, versionNumber, createdAt]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
  return {
    studentId, sessionId, learningSubmissionId, batchId, batchResultId,
    versionId, versionNumber, questionNumber: 1,
    initialDeletionGeneration: Number(source.deletion_generation)
  };
}

async function postgresOpenReviewBatchTutorFixture(store) {
  const baseForm = learningReviewForm();
  const identity = randomUUID();
  const form = {
    ...baseForm,
    id: `tutor-open-pg-${identity}`,
    version: 'open-v1',
    contentHash: tutorSha256(`open-content:${identity}`),
    questionBundleHash: tutorSha256(`open-question-bundle:${identity}`),
    manifestHash: tutorSha256(`open-manifest:${identity}`)
  };
  form.sourceManifestHash = form.manifestHash;
  await store.importForm(form, { publish: false, allowTestOnlyPublish: true });
  const artifact = approvedContextArtifact(form, {
    readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1)
  });
  const [context] = await new ApprovedContextImporter({
    store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const release = await store.publishOpenReviewRelease({
    releaseId: randomUUID(), formId: form.id, formVersion: form.version,
    contextSetId: context.id, authorityId: 'operator:tutor-pg-test',
    reasonCode: 'TUTOR_TEST_RELEASE', now: new Date()
  });
  const service = new PracticeService({
    store,
    authPepper: 'postgres-open-tutor-pepper-that-is-long-enough-for-safe-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true
  });
  const student = await service.seedAccessCode({
    code: `tutor-open-pg-student-${randomUUID()}`,
    displayName: 'Postgres Open Review Tutor student'
  });
  const workspace = await service.createOpenReviewWorkspace(
    student.id, release.id, `tutor-open-workspace-${randomUUID()}`
  );
  const learningSubmissionId = (await store.pool.query(
    'SELECT id FROM amc_practice.learning_submissions WHERE attempt_id = $1',
    [workspace.workspace.id]
  )).rows[0].id;
  const dbClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
  const sessionId = `tutor-open-session-${randomUUID()}`;
  await store.createSession({
    id: sessionId, studentId: student.id, csrfTokenHash: tutorSha256('open-csrf'),
    createdAt: dbClock, expiresAt: new Date(dbClock.getTime() + 3_600_000), revokedAt: null
  });
  return {
    ...await seedPostgresBatchConfirmedTutorAuthority(store, {
      studentId: student.id, sessionId, learningSubmissionId
    }),
    releaseId: release.id
  };
}

async function createThread(store, fixture, suffix) {
  return store.createTutorThread({
    id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: `pg-thread-${suffix}-${randomUUID()}`, now: new Date()
  });
}

const dispatch = {
  provider: 'openai', requestedModel: 'gpt-5.6-terra',
  promptVersion: 'amc-question-tutor-prompt-v2',
  responseSchemaVersion: 'amc-tutor-turn-v2'
};

function gatewaySuccess(job, replyMarkdown) {
  return {
    ok: true,
    tutorTurn: {
      schema: 'amc-tutor-turn-v2',
      correlationId: job.correlationId,
      inputHash: job.inputHash,
      snapshotHash: job.snapshotHash,
      contextHash: job.contextHash,
      historyHash: job.historyHash,
      threadId: job.threadId,
      turnId: job.id,
      turnNumber: job.turnNumber,
      replyMarkdown
    },
    runMetadata: {
      provider: 'openai',
      requestedModel: 'gpt-5.6-terra',
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-tutor-prompt-v2',
      schemaVersion: 'amc-tutor-turn-v2',
      usage: {
        inputTokens: 100, cachedInputTokens: 0,
        outputTokens: 20, totalTokens: 120
      }
    }
  };
}

function assertStudentSafeBundle(bundle) {
  const serialized = JSON.stringify(bundle);
  for (const forbidden of [
    'leaseToken', 'leaseOwner', 'authorizedSessionId', 'idempotencyKeyHash',
    'requestHash', 'snapshotHash', 'contextHash', 'historyHash', 'inputHash',
    'threadLineageHash', 'creationIdempotencyKeyHash', 'creationRequestHash'
  ]) assert.equal(serialized.includes(forbidden), false, `${forbidden} must not cross the student boundary`);
  assert.equal(Object.hasOwn(bundle, 'snapshot'), false);
  assert.ok(Array.isArray(bundle.requests));
}

test('PostgresStore atomically creates a Tutor root from path identity and replays it',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 8 });
    t.after(() => store.close());
    await runMigrations(store.pool);
    const fixture = await postgresTutorFixture(store, { createSnapshot: false });
    const rootInput = ({
      sessionId = fixture.sessionId, key = `pg-root-${randomUUID()}`,
      snapshotId = randomUUID(), threadId = randomUUID()
    } = {}) => ({
      studentId: fixture.studentId,
      authorizedSessionId: sessionId,
      learningSubmissionId: fixture.snapshot.learningSubmissionId,
      versionNumber: fixture.snapshot.versionNumber,
      questionNumber: fixture.snapshot.questionNumber,
      idempotencyKey: key, snapshotId, threadId, now: new Date(0)
    });
    const countRootRows = async () => {
      const result = await store.pool.query(
        `SELECT
           (SELECT count(*)::integer FROM amc_practice.learning_tutor_snapshots
             WHERE learning_submission_id = $1) AS snapshots,
           (SELECT count(*)::integer FROM amc_practice.learning_tutor_threads
             WHERE learning_submission_id = $1) AS threads,
           (SELECT count(*)::integer FROM amc_practice.learning_tutor_messages message
             JOIN amc_practice.learning_tutor_threads thread ON thread.id = message.thread_id
             WHERE thread.learning_submission_id = $1) AS messages,
           (SELECT count(*)::integer FROM amc_practice.learning_tutor_turn_jobs job
             JOIN amc_practice.learning_tutor_threads thread ON thread.id = job.thread_id
             WHERE thread.learning_submission_id = $1) AS jobs`,
        [fixture.snapshot.learningSubmissionId]
      );
      return result.rows[0];
    };
    const assertUnavailableWithoutRows = async (input) => {
      await assert.rejects(() => store.createTutorRootThread(input),
        (error) => error.code === 'TUTOR_ROOT_NOT_AVAILABLE');
      assert.deepEqual(await countRootRows(), {
        snapshots: 0, threads: 0, messages: 0, jobs: 0
      });
    };

    await store.revokeSession(fixture.sessionId, new Date());
    await assertUnavailableWithoutRows(rootInput());
    const liveClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
    const liveSessionId = `tutor-root-live-${randomUUID()}`;
    await store.createSession({
      id: liveSessionId, studentId: fixture.studentId,
      csrfTokenHash: tutorSha256('root-live-csrf'), createdAt: liveClock,
      expiresAt: new Date(liveClock.getTime() + 3_600_000), revokedAt: null
    });

    const originalReportStatus = (await store.pool.query(
      'SELECT status FROM amc_practice.learning_reports WHERE id = $1',
      [fixture.snapshot.reportId]
    )).rows[0].status;
    await store.pool.query(
      "UPDATE amc_practice.learning_reports SET status = 'FAILED' WHERE id = $1",
      [fixture.snapshot.reportId]
    );
    await assertUnavailableWithoutRows(rootInput({ sessionId: liveSessionId }));
    await store.pool.query(
      'UPDATE amc_practice.learning_reports SET status = $2 WHERE id = $1',
      [fixture.snapshot.reportId, originalReportStatus]
    );

    await store.pool.query(
      `UPDATE amc_practice.learning_submissions
       SET lifecycle_status = 'DELETED', deleted_at = clock_timestamp()
       WHERE id = $1`, [fixture.snapshot.learningSubmissionId]
    );
    await assertUnavailableWithoutRows(rootInput({ sessionId: liveSessionId }));
    await store.pool.query(
      `UPDATE amc_practice.learning_submissions
       SET lifecycle_status = 'COMMITTED', deleted_at = NULL WHERE id = $1`,
      [fixture.snapshot.learningSubmissionId]
    );

    const originalRelease = (await store.pool.query(
      `SELECT release_manifest_hash FROM amc_practice.approved_context_sets
       WHERE id = $1`, [fixture.snapshot.contextSetId]
    )).rows[0].release_manifest_hash;
    await assert.rejects(() => store.pool.query(
      `UPDATE amc_practice.approved_context_sets SET release_manifest_hash = $2
       WHERE id = $1`, [fixture.snapshot.contextSetId, 'a'.repeat(64)]
    ), /approved context audit lineage is immutable after import/);
    assert.equal((await store.pool.query(
      `SELECT release_manifest_hash FROM amc_practice.approved_context_sets
       WHERE id = $1`, [fixture.snapshot.contextSetId]
    )).rows[0].release_manifest_hash, originalRelease);

    const key = `pg-root-success-${randomUUID()}`;
    const created = await store.createTutorRootThread(rootInput({
      sessionId: liveSessionId, key
    }));
    assert.equal(created.replayed, false);
    assert.equal(created.snapshot.learningSubmissionId, fixture.snapshot.learningSubmissionId);
    assert.equal(created.snapshot.versionNumber, fixture.snapshot.versionNumber);
    assert.equal(created.snapshot.questionNumber, fixture.snapshot.questionNumber);
    assert.equal(created.thread.snapshotId, created.snapshot.id);
    assert.deepEqual(await countRootRows(), {
      snapshots: 1, threads: 1, messages: 0, jobs: 0
    });

    await store.revokeSession(liveSessionId, new Date());
    const replayClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
    const replaySessionId = `tutor-root-replay-${randomUUID()}`;
    await store.createSession({
      id: replaySessionId, studentId: fixture.studentId,
      csrfTokenHash: tutorSha256('root-replay-csrf'), createdAt: replayClock,
      expiresAt: new Date(replayClock.getTime() + 3_600_000), revokedAt: null
    });
    const replayed = await store.createTutorRootThread(rootInput({
      sessionId: replaySessionId, key,
      snapshotId: randomUUID(), threadId: randomUUID()
    }));
    assert.equal(replayed.replayed, true);
    assert.equal(replayed.snapshot.id, created.snapshot.id);
    assert.equal(replayed.thread.id, created.thread.id);

    const concurrentKey = `pg-root-concurrent-${randomUUID()}`;
    const results = await Promise.all(Array.from({ length: 8 }, () =>
      store.createTutorRootThread(rootInput({
        sessionId: replaySessionId, key: concurrentKey,
        snapshotId: randomUUID(), threadId: randomUUID()
      }))));
    assert.equal(new Set(results.map((result) => result.snapshot.id)).size, 1);
    assert.equal(new Set(results.map((result) => result.thread.id)).size, 1);
    assert.equal(results.filter((result) => !result.replayed).length, 1);
    assert.deepEqual(await countRootRows(), {
      snapshots: 1, threads: 2, messages: 0, jobs: 0
    });
  });

test('Tutor HTTP through PracticeService and PostgreSQL rejects every cross-student thread operation',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 8 });
    t.after(() => store.close());
    await runMigrations(store.pool);
    const owner = await postgresTutorFixture(store, { createSnapshot: false });
    const otherAccessCode = `tutor-pg-other-${randomUUID()}`;
    await owner.service.seedAccessCode({ code: otherAccessCode, displayName: 'Other student' });
    const app = await buildApp({
      service: owner.service,
      config: {
        basePath: '/api/amc12', bodyLimit: 64 * 1024, trustedProxy: false,
        corsOrigin: null, sessionSecret: 'tutor-pg-http-secret-that-is-long-enough',
        sessionTtlMs: 3_600_000, secureCookies: false,
        cookieName: 'amc_session', csrfCookieName: 'amc_csrf',
        cookiePath: '/api/amc12', tutorEnabled: true
      },
      logger: false
    });
    t.after(() => app.close());
    const login = async (accessCode) => {
      const response = await app.inject({
        method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode }
      });
      assert.equal(response.statusCode, 200);
      return { cookie: cookiesFromResponse(response), csrf: response.json().csrfToken };
    };
    const ownerAuth = await login(owner.accessCode);
    const otherAuth = await login(otherAccessCode);
    const collection = `/api/amc12/learning-history/${owner.snapshot.learningSubmissionId}`
      + `/versions/${owner.snapshot.versionNumber}/questions/${owner.snapshot.questionNumber}/tutor-threads`;
    const ownerMutationHeaders = {
      cookie: ownerAuth.cookie, 'x-csrf-token': ownerAuth.csrf,
      'idempotency-key': `owner-root-${randomUUID()}`
    };
    let response = await app.inject({
      method: 'POST', url: collection, headers: ownerMutationHeaders, payload: {}
    });
    assert.equal(response.statusCode, 201);
    const threadId = response.json().thread.thread.id;
    response = await app.inject({
      method: 'POST', url: `${collection}/${threadId}/messages`,
      headers: {
        ...ownerMutationHeaders, 'idempotency-key': `owner-message-${randomUUID()}`
      },
      payload: { message: 'Preserve this owner-only discussion.' }
    });
    assert.equal(response.statusCode, 202);

    response = await app.inject({
      method: 'GET', url: `${collection}?limit=10`, headers: { cookie: otherAuth.cookie }
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { items: [], nextCursor: null });
    const otherMutationHeaders = {
      cookie: otherAuth.cookie, 'x-csrf-token': otherAuth.csrf
    };
    const probes = [
      { method: 'POST', url: collection, suffix: 'root', payload: {} },
      { method: 'GET', url: `${collection}/${threadId}` },
      {
        method: 'POST', url: `${collection}/${threadId}/messages`, suffix: 'message',
        payload: { message: 'Attempt a cross-student write.' }
      },
      { method: 'POST', url: `${collection}/${threadId}/forks`, suffix: 'fork', payload: {} },
      {
        method: 'POST', url: `${collection}/${threadId}/requests/1/retries`,
        suffix: 'retry', payload: {}
      },
      { method: 'DELETE', url: `${collection}/${threadId}`, suffix: 'delete' }
    ];
    for (const probe of probes) {
      const headers = probe.method === 'GET'
        ? { cookie: otherAuth.cookie }
        : {
            ...otherMutationHeaders,
            'idempotency-key': `cross-${probe.suffix}-${randomUUID()}`
          };
      response = await app.inject({
        method: probe.method, url: probe.url, headers,
        ...(probe.payload === undefined ? {} : { payload: probe.payload })
      });
      assert.equal(response.statusCode, 404, `${probe.method} ${probe.url}`);
      assert.equal(response.headers['cache-control'], 'no-store');
    }
    response = await app.inject({
      method: 'GET', url: `${collection}/${threadId}`, headers: { cookie: ownerAuth.cookie }
    });
    assert.equal(response.statusCode, 200, 'cross-student probes must not change the owner aggregate');
    assert.equal(response.json().thread.thread.status, 'OPEN');
    assert.equal(response.json().thread.requests.length, 1);
    response = await app.inject({
      method: 'DELETE', url: `${collection}/${threadId}`,
      headers: {
        ...ownerMutationHeaders, 'idempotency-key': `owner-delete-${randomUUID()}`
      }
    });
    assert.equal(response.statusCode, 204,
      'the vertical BOLA fixture must not leave globally claimable work for later tests');
  });

test('PostgresStore decouples committed Tutor authority from raw batch cleanup and preserves source revocation fences',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 8 });
    t.after(() => store.close());
    await runMigrations(store.pool);

    const base = await postgresTutorFixture(store, { createSnapshot: false });
    const batch = await seedPostgresBatchConfirmedTutorAuthority(store, {
      studentId: base.studentId, sessionId: base.sessionId,
      learningSubmissionId: base.snapshot.learningSubmissionId
    });
    const rootInput = (key, overrides = {}) => ({
      studentId: batch.studentId, authorizedSessionId: batch.sessionId,
      learningSubmissionId: batch.learningSubmissionId,
      versionNumber: batch.versionNumber, questionNumber: batch.questionNumber,
      idempotencyKey: key, snapshotId: randomUUID(), threadId: randomUUID(),
      now: new Date(0), ...overrides
    });
    const rootKey = `pg-batch-cleanup-root-${randomUUID()}`;
    const root = await store.createTutorRootThread(rootInput(rootKey));
    assert.equal(root.snapshot.scoringOrigin, 'BATCH_CONFIRMED');
    assert.equal(root.snapshot.batchResultId, batch.batchResultId);
    assert.equal(root.snapshot.initialDeletionGeneration, batch.initialDeletionGeneration);

    await store.pool.query(
      `UPDATE amc_practice.learning_batches
       SET deletion_state = 'COMPLETE', deletion_generation = 9,
           deleted_at = clock_timestamp(), updated_at = clock_timestamp()
       WHERE id = $1`, [batch.batchId]
    );
    const replay = await store.createTutorRootThread(rootInput(rootKey));
    assert.equal(replay.replayed, true);
    assert.equal(replay.thread.id, root.thread.id);
    const secondRoot = await store.createTutorRootThread(rootInput(
      `pg-batch-cleanup-second-${randomUUID()}`
    ));
    assert.equal(secondRoot.replayed, false);
    assert.equal(secondRoot.snapshot.id, root.snapshot.id,
      'raw cleanup does not change immutable Tutor snapshot identity');
    assert.ok(await store.getTutorThreadBundle(batch.studentId, root.thread.id));
    assert.equal((await store.listTutorThreadBundles(
      batch.studentId, batch.learningSubmissionId, batch.versionNumber, 1
    )).length, 2);
    assert.equal((await store.listTutorThreadSummaries(
      batch.studentId, batch.learningSubmissionId, batch.versionNumber, 1, { limit: 20 }
    )).length, 2);
    const enqueued = await store.enqueueTutorTurn({
      studentId: batch.studentId, threadId: root.thread.id,
      authorizedSessionId: batch.sessionId,
      idempotencyKey: `pg-batch-cleanup-turn-${randomUUID()}`,
      correlationId: `pg-batch-cleanup-correlation-${randomUUID()}`,
      message: 'Compare the committed reasoning after raw cleanup.', now: new Date(0)
    });
    const claimed = await store.claimTutorTurnJob({
      workerId: 'pg-batch-cleanup-worker', leaseMs: 5_000
    });
    assert.equal(claimed.job.id, enqueued.job.id);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: claimed.job.id, workerId: claimed.job.leaseOwner,
      leaseToken: claimed.job.leaseToken,
      expectedDeletionGeneration: batch.initialDeletionGeneration, ...dispatch
    }), true);
    assert.equal(await store.recordTutorDeliveryUnknown({
      jobId: claimed.job.id, workerId: claimed.job.leaseOwner,
      leaseToken: claimed.job.leaseToken,
      expectedDeletionGeneration: batch.initialDeletionGeneration
    }), true);

    const adversarialVersionId = randomUUID();
    await assert.rejects(() => store.pool.query(
      `INSERT INTO amc_practice.learning_submission_versions
       (id, learning_submission_id, version_number, form_id, form_version,
        answers_revision, reasoning_revision, creation_reason, context_status,
        context_set_id, evidence_hash, created_at, batch_id)
       SELECT $2, learning_submission_id, version_number + 1, form_id, form_version,
              NULL, NULL, 'BATCH_COMMIT', context_status, context_set_id,
              evidence_hash, clock_timestamp(), batch_id
       FROM amc_practice.learning_submission_versions WHERE id = $1`,
      [batch.versionId, adversarialVersionId]
    ), (error) => error.code === '23505'
      && error.constraint === 'amc_learning_version_one_per_batch_idx',
    'one batch cannot manufacture a second authoritative learning version');
    assert.equal((await store.pool.query(
      `SELECT committed_version_id, committed_version_number
       FROM amc_practice.learning_batches WHERE id = $1`, [batch.batchId]
    )).rows[0].committed_version_id, batch.versionId,
    'the rejected duplicate version leaves the committed marker unchanged');
    assert.ok(await store.getTutorThreadBundle(batch.studentId, root.thread.id));
    await store.tombstoneTutorThread({ studentId: batch.studentId, threadId: root.thread.id });
    await store.tombstoneTutorThread({ studentId: batch.studentId, threadId: secondRoot.thread.id });

    const deletedBase = await postgresTutorFixture(store, { createSnapshot: false });
    const deletedRoot = await store.createTutorRootThread({
      studentId: deletedBase.studentId, authorizedSessionId: deletedBase.sessionId,
      learningSubmissionId: deletedBase.snapshot.learningSubmissionId,
      versionNumber: 1, questionNumber: 1,
      idempotencyKey: `pg-learning-delete-root-${randomUUID()}`,
      snapshotId: randomUUID(), threadId: randomUUID(), now: new Date(0)
    });
    const deletedTurn = await store.enqueueTutorTurn({
      studentId: deletedBase.studentId, threadId: deletedRoot.thread.id,
      authorizedSessionId: deletedBase.sessionId,
      idempotencyKey: `pg-learning-delete-turn-${randomUUID()}`,
      correlationId: `pg-learning-delete-correlation-${randomUUID()}`,
      message: 'This work must be cancelled before source deletion.', now: new Date(0)
    });
    await assert.rejects(() => store.pool.query(
      `UPDATE amc_practice.learning_submissions
       SET lifecycle_status = 'DELETED', deletion_generation = deletion_generation + 1,
           deleted_at = clock_timestamp(), updated_at = clock_timestamp()
       WHERE id = $1`, [deletedBase.snapshot.learningSubmissionId]
    ), (error) => error.code === '55000',
    'a live Tutor aggregate must be tombstoned before learning source deletion');
    assert.equal(await store.tombstoneTutorThread({
      studentId: deletedBase.studentId, threadId: deletedRoot.thread.id
    }), true);
    assert.equal((await store.pool.query(
      'SELECT status FROM amc_practice.learning_tutor_turn_jobs WHERE id = $1',
      [deletedTurn.job.id]
    )).rows[0].status, 'CANCELLED');
    await store.pool.query(
      `UPDATE amc_practice.learning_submissions
       SET lifecycle_status = 'DELETED', deletion_generation = deletion_generation + 1,
           deleted_at = clock_timestamp(), updated_at = clock_timestamp()
       WHERE id = $1`, [deletedBase.snapshot.learningSubmissionId]
    );
    assert.equal(await store.getTutorThreadBundle(
      deletedBase.studentId, deletedRoot.thread.id
    ), null);
    assert.deepEqual(await store.listTutorThreadSummaries(
      deletedBase.studentId, deletedBase.snapshot.learningSubmissionId, 1, 1, { limit: 20 }
    ), []);
    assert.equal(await store.claimTutorTurnJob({
      workerId: 'pg-learning-delete-worker', leaseMs: 5_000
    }), null);

    const open = await postgresOpenReviewBatchTutorFixture(store);
    const openRootKey = `pg-open-revoke-root-${randomUUID()}`;
    const openRootInput = {
      studentId: open.studentId, authorizedSessionId: open.sessionId,
      learningSubmissionId: open.learningSubmissionId,
      versionNumber: open.versionNumber, questionNumber: 1,
      idempotencyKey: openRootKey, snapshotId: randomUUID(),
      threadId: randomUUID(), now: new Date(0)
    };
    const openRoot = await store.createTutorRootThread(openRootInput);
    const openRoots = [openRoot, ...await Promise.all(Array.from(
      { length: 19 }, (_, index) => store.createTutorRootThread({
        ...openRootInput,
        idempotencyKey: `pg-open-cap-${index}-${randomUUID()}`,
        snapshotId: randomUUID(), threadId: randomUUID(), now: new Date()
      })
    ))];
    await assert.rejects(() => store.createTutorRootThread({
      ...openRootInput,
      idempotencyKey: `pg-open-cap-overflow-${randomUUID()}`,
      snapshotId: randomUUID(), threadId: randomUUID(), now: new Date()
    }), (error) => error.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED');
    const openTurn = await store.enqueueTutorTurn({
      studentId: open.studentId, threadId: openRoot.thread.id,
      authorizedSessionId: open.sessionId,
      idempotencyKey: `pg-open-revoke-turn-${randomUUID()}`,
      correlationId: `pg-open-revoke-correlation-${randomUUID()}`,
      message: 'This request must not cross a committed revoke.', now: new Date(0)
    });
    const openClaim = await store.claimTutorTurnJob({
      workerId: 'pg-open-revoke-worker', leaseMs: 5_000
    });
    assert.equal(openClaim.job.id, openTurn.job.id);
    await store.transitionOpenReviewRelease({
      releaseId: open.releaseId, nextStatus: 'REVOKED',
      authorityId: 'operator:tutor-pg-test', reasonCode: 'TUTOR_TEST_REVOKE', now: new Date()
    });
    assert.equal(await store.getTutorThreadBundle(open.studentId, openRoot.thread.id), null);
    assert.deepEqual(await store.listTutorThreadBundles(
      open.studentId, open.learningSubmissionId, open.versionNumber, 1
    ), []);
    const staleSummaries = await store.listTutorThreadSummaries(
      open.studentId, open.learningSubmissionId, open.versionNumber, 1, { limit: 20 }
    );
    assert.equal(staleSummaries.length, 20);
    assert.equal(staleSummaries.every((summary) => summary.sourceEntitled === false
      && summary.latestRequest === null), true);
    await assert.rejects(() => store.markTutorTurnDispatched({
      jobId: openClaim.job.id, workerId: openClaim.job.leaseOwner,
      leaseToken: openClaim.job.leaseToken,
      expectedDeletionGeneration: open.initialDeletionGeneration, ...dispatch
    }), (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');
    await assert.rejects(() => store.createTutorRootThread({
      ...openRootInput, snapshotId: randomUUID(), threadId: randomUUID(), now: new Date()
    }), (error) => error.code === 'TUTOR_ROOT_NOT_AVAILABLE');
    assert.equal(await store.tombstoneTutorThreadByPath({
      studentId: open.studentId, authorizedSessionId: open.sessionId,
      learningSubmissionId: open.learningSubmissionId,
      versionNumber: open.versionNumber, questionNumber: 1,
      threadId: openRoot.thread.id,
      idempotencyKey: `pg-open-stale-delete-${randomUUID()}`, now: new Date()
    }), true);
    assert.equal((await store.pool.query(
      `SELECT count(*)::integer AS count
       FROM amc_practice.learning_tutor_threads
       WHERE student_id = $1 AND learning_submission_version_id = $2
         AND question_number = 1 AND status <> 'TOMBSTONED'`,
      [open.studentId, open.versionId]
    )).rows[0].count, 19,
    'deleting a stale-source retained row releases its reserved capacity');
    assert.equal(openRoots.length, 20);
  });

test('PostgresStore atomically budgets Tutor work and returns cursor-safe summaries',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 12 });
    t.after(() => store.close());
    await runMigrations(store.pool);

    const globalFixtures = [
      await postgresTutorFixture(store), await postgresTutorFixture(store)
    ];
    const globalBaseline = Number((await store.pool.query(
      `SELECT COALESCE((
         SELECT used_units FROM amc_practice.global_resource_budget_windows
         WHERE budget_kind = 'PROVIDER_WORK'
         ORDER BY window_started_at DESC LIMIT 1
       ), 0)::integer AS used_units`
    )).rows[0].used_units);
    const globalThreads = await Promise.all(globalFixtures.map((fixture, index) =>
      createThread(store, fixture, `p1-global-${index}`)));
    const globalResults = await Promise.allSettled(globalFixtures.map((fixture, index) =>
      store.enqueueTutorTurn({
        studentId: fixture.studentId, threadId: globalThreads[index].id,
        authorizedSessionId: fixture.sessionId,
        idempotencyKey: `p1-global-turn-${index}-${randomUUID()}`,
        correlationId: `p1-global-correlation-${index}-${randomUUID()}`,
        message: `Global provider request ${index}.`,
        providerBudget: {
          studentLimit: 10, globalLimit: globalBaseline + 1
        },
        now: new Date(0)
      })));
    assert.equal(globalResults.filter((result) => result.status === 'fulfilled').length, 1);
    const globalRejected = globalResults.find((result) => result.status === 'rejected').reason;
    assert.equal(globalRejected.code, 'TUTOR_GLOBAL_PROVIDER_WORK_RATE_LIMITED');
    assert.ok(globalRejected.retryAfterSeconds > 0);
    const globalWindow = await store.pool.query(
      `SELECT used_units FROM amc_practice.global_resource_budget_windows
       WHERE budget_kind = 'PROVIDER_WORK'`
    );
    assert.equal(Math.max(...globalWindow.rows.map((row) => Number(row.used_units))),
      globalBaseline + 1);
    await Promise.all(globalThreads.map((thread, index) => store.tombstoneTutorThread({
      studentId: globalFixtures[index].studentId, threadId: thread.id
    })));

    const fixture = await postgresTutorFixture(store);
    const threads = await Promise.all(Array.from({ length: 3 }, (_, index) =>
      createThread(store, fixture, `p1-student-${index}`)));
    const providerBudget = { studentLimit: 2, globalLimit: 1_000 };
    const firstInput = {
      studentId: fixture.studentId, threadId: threads[0].id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `p1-student-first-${randomUUID()}`,
      correlationId: `p1-student-first-correlation-${randomUUID()}`,
      message: 'Charge this durable request exactly once.', providerBudget, now: new Date(0)
    };
    const first = await store.enqueueTutorTurn(firstInput);
    const replay = await store.enqueueTutorTurn({
      ...firstInput, correlationId: `p1-student-replay-${randomUUID()}`,
      jobId: randomUUID(), messageId: randomUUID(), now: new Date()
    });
    assert.equal(replay.replayed, true);
    assert.equal(replay.job.id, first.job.id);
    await store.tombstoneTutorThread({ studentId: fixture.studentId, threadId: threads[0].id });
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: threads[1].id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `p1-student-second-${randomUUID()}`,
      correlationId: `p1-student-second-correlation-${randomUUID()}`,
      message: 'Consume the second student unit.', providerBudget, now: new Date(0)
    });
    await store.tombstoneTutorThread({ studentId: fixture.studentId, threadId: threads[1].id });
    await assert.rejects(() => store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: threads[2].id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `p1-student-third-${randomUUID()}`,
      correlationId: `p1-student-third-correlation-${randomUUID()}`,
      message: 'Exceed the student budget.', providerBudget, now: new Date(0)
    }), (error) => error.code === 'TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED'
      && error.retryAfterSeconds > 0);
    const studentWindow = await store.pool.query(
      `SELECT used_units FROM amc_practice.student_resource_budget_windows
       WHERE student_id = $1 AND budget_kind = 'PROVIDER_WORK'`, [fixture.studentId]
    );
    assert.deepEqual(studentWindow.rows.map((row) => Number(row.used_units)), [2]);

    const concurrentFixture = await postgresTutorFixture(store);
    const concurrentThreads = await Promise.all(Array.from({ length: 5 }, (_, index) =>
      createThread(store, concurrentFixture, `p1-budget-race-${index}`)));
    const concurrent = await Promise.allSettled(concurrentThreads.map((thread, index) =>
      store.enqueueTutorTurn({
        studentId: concurrentFixture.studentId, threadId: thread.id,
        authorizedSessionId: concurrentFixture.sessionId,
        idempotencyKey: `p1-budget-race-${index}-${randomUUID()}`,
        correlationId: `p1-budget-race-correlation-${index}-${randomUUID()}`,
        message: `Concurrent student request ${index}.`,
        providerBudget: { studentLimit: 1, globalLimit: 1_000 }, now: new Date(0)
      })));
    assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(concurrent.filter((result) => result.status === 'rejected')
      .every((result) => result.reason.code === 'TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED'), true);
    await Promise.all(concurrentThreads.map((thread) => store.tombstoneTutorThread({
      studentId: concurrentFixture.studentId, threadId: thread.id
    })));

    const retryFixture = await postgresTutorFixture(store);
    const retryThread = await createThread(store, retryFixture, 'p1-budget-retry');
    const retryBudget = { studentLimit: 2, globalLimit: 1_000 };
    await store.enqueueTutorTurn({
      studentId: retryFixture.studentId, threadId: retryThread.id,
      authorizedSessionId: retryFixture.sessionId,
      idempotencyKey: `p1-retry-parent-${randomUUID()}`,
      correlationId: `p1-retry-parent-correlation-${randomUUID()}`,
      message: 'Create a terminal retry parent.', providerBudget: retryBudget, now: new Date(0)
    });
    const retryParent = await store.claimTutorTurnJob({
      workerId: 'p1-budget-retry-worker', leaseMs: 5_000
    });
    await store.markTutorTurnDispatched({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken,
      expectedDeletionGeneration: retryParent.job.deletionGeneration, ...dispatch
    });
    await store.recordTutorDeliveryUnknown({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken,
      expectedDeletionGeneration: retryParent.job.deletionGeneration
    });
    const retryInput = {
      studentId: retryFixture.studentId,
      authorizedSessionId: retryFixture.sessionId,
      learningSubmissionId: retryFixture.snapshot.learningSubmissionId,
      versionNumber: 1, questionNumber: 1, threadId: retryThread.id,
      requestOrdinal: 1, idempotencyKey: `p1-retry-child-${randomUUID()}`,
      correlationId: `p1-retry-child-correlation-${randomUUID()}`,
      jobId: randomUUID(), providerBudget: retryBudget, now: new Date(0)
    };
    const retry = await store.retryTutorTurnByOrdinal(retryInput);
    const retryReplay = await store.retryTutorTurnByOrdinal({
      ...retryInput, correlationId: `p1-retry-replay-${randomUUID()}`,
      jobId: randomUUID(), now: new Date()
    });
    assert.equal(retryReplay.replayed, true);
    assert.equal(retryReplay.job.id, retry.job.id);
    const retryWindow = await store.pool.query(
      `SELECT used_units FROM amc_practice.student_resource_budget_windows
       WHERE student_id = $1 AND budget_kind = 'PROVIDER_WORK'`, [retryFixture.studentId]
    );
    assert.deepEqual(retryWindow.rows.map((row) => Number(row.used_units)), [2]);
    await store.tombstoneTutorThread({ studentId: retryFixture.studentId, threadId: retryThread.id });

    const summaryFixture = await postgresTutorFixture(store);
    const summaryThreads = await Promise.all(Array.from({ length: 4 }, (_, index) =>
      createThread(store, summaryFixture, `p1-summary-${index}`)));
    await store.enqueueTutorTurn({
      studentId: summaryFixture.studentId, threadId: summaryThreads[0].id,
      authorizedSessionId: summaryFixture.sessionId,
      idempotencyKey: `p1-summary-turn-${randomUUID()}`,
      correlationId: `p1-summary-correlation-${randomUUID()}`,
      message: 'SECRET PG MESSAGE MUST NOT LEAK', now: new Date()
    });
    const summaries = await store.listTutorThreadSummaries(
      summaryFixture.studentId, summaryFixture.snapshot.learningSubmissionId, 1, 1,
      { limit: 2 }
    );
    assert.equal(summaries.length, 3);
    const serialized = JSON.stringify(summaries);
    for (const forbidden of [
      'messages', 'requests', 'snapshotHash', 'contextHash',
      'threadLineageHash', 'SECRET PG MESSAGE MUST NOT LEAK'
    ]) assert.equal(serialized.includes(forbidden), false, forbidden);
    summaries.forEach((summary) => {
      assert.deepEqual(Object.keys(summary).sort(), ['latestRequest', 'sourceEntitled', 'thread']);
      assert.equal(summary.sourceEntitled, true);
      assert.equal(Object.hasOwn(summary, 'question'), false);
    });
    const publicPage = summaries.slice(0, 2);
    const cursorThread = publicPage.at(-1).thread;
    const next = await store.listTutorThreadSummaries(
      summaryFixture.studentId, summaryFixture.snapshot.learningSubmissionId, 1, 1,
      { limit: 2, cursor: { updatedAt: cursorThread.updatedAt, threadId: cursorThread.id } }
    );
    assert.equal(new Set([...publicPage, ...next].map((item) => item.thread.id)).size, 4);
    assert.equal(next.some((item) => publicPage
      .some((prior) => prior.thread.id === item.thread.id)), false);
    await Promise.all(summaryThreads.map((thread) => store.tombstoneTutorThread({
      studentId: summaryFixture.studentId, threadId: thread.id
    })));
  });

test('PostgresStore serializes live Tutor thread caps and tombstone releases capacity',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 16 });
    t.after(() => store.close());
    await runMigrations(store.pool);
    const fixture = await postgresTutorFixture(store, {
      createSnapshot: false, readyNumbers: [1, 2, 3, 4, 5, 6]
    });
    const root = (questionNumber, index) => ({
      studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
      learningSubmissionId: fixture.snapshot.learningSubmissionId,
      versionNumber: fixture.snapshot.versionNumber, questionNumber,
      idempotencyKey: `p1-cap-q${questionNumber}-${index}-${randomUUID()}`,
      snapshotId: randomUUID(), threadId: randomUUID(), now: new Date(0)
    });
    const questionOneInputs = Array.from({ length: 25 }, (_, index) => root(1, index));
    const questionOne = await Promise.allSettled(questionOneInputs.map((input) =>
      store.createTutorRootThread(input)));
    assert.equal(questionOne.filter((result) => result.status === 'fulfilled').length, 20);
    assert.equal(questionOne.filter((result) => result.status === 'rejected')
      .every((result) => result.reason.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED'), true);
    const firstSuccessIndex = questionOne.findIndex((result) => result.status === 'fulfilled');
    const firstSuccess = questionOne[firstSuccessIndex].value;
    const replay = await store.createTutorRootThread({
      ...questionOneInputs[firstSuccessIndex], snapshotId: randomUUID(), threadId: randomUUID(),
      now: new Date()
    });
    assert.equal(replay.replayed, true);
    assert.equal(replay.thread.id, firstSuccess.thread.id);

    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: firstSuccess.thread.id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `p1-cap-parent-turn-${randomUUID()}`,
      correlationId: `p1-cap-parent-correlation-${randomUUID()}`,
      message: 'Build the successful head used by a capped fork.', now: new Date()
    });
    const parentClaim = await store.claimTutorTurnJob({
      workerId: 'p1-cap-parent-worker', leaseMs: 5_000
    });
    await store.markTutorTurnDispatched({
      jobId: parentClaim.job.id, workerId: parentClaim.job.leaseOwner,
      leaseToken: parentClaim.job.leaseToken,
      expectedDeletionGeneration: parentClaim.job.deletionGeneration, ...dispatch
    });
    await store.completeTutorTurnJob({
      jobId: parentClaim.job.id, workerId: parentClaim.job.leaseOwner,
      leaseToken: parentClaim.job.leaseToken,
      expectedDeletionGeneration: parentClaim.job.deletionGeneration,
      gatewayResult: gatewaySuccess(parentClaim.job, 'This head is safe to fork.'),
      latencyMs: 25
    });
    const blockedFork = {
      studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
      learningSubmissionId: fixture.snapshot.learningSubmissionId,
      versionNumber: fixture.snapshot.versionNumber, questionNumber: 1,
      parentThreadId: firstSuccess.thread.id,
      idempotencyKey: `p1-cap-fork-${randomUUID()}`,
      threadId: randomUUID(), now: new Date(0)
    };
    await assert.rejects(() => store.createTutorForkFromHead(blockedFork),
      (error) => error.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED');
    const released = questionOne.find((result) => result.status === 'fulfilled'
      && result.value.thread.id !== firstSuccess.thread.id).value.thread;
    await store.tombstoneTutorThreadByPath({
      studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
      learningSubmissionId: fixture.snapshot.learningSubmissionId,
      versionNumber: 1, questionNumber: 1, threadId: released.id,
      idempotencyKey: `p1-cap-delete-${randomUUID()}`, now: new Date(0)
    });
    const fork = await store.createTutorForkFromHead(blockedFork);
    assert.equal(fork.replayed, false);
    const forkReplay = await store.createTutorForkFromHead({
      ...blockedFork, threadId: randomUUID(), now: new Date()
    });
    assert.equal(forkReplay.replayed, true);
    assert.equal(forkReplay.thread.id, fork.thread.id);

    for (const questionNumber of [2, 3, 4, 5]) {
      const created = await Promise.all(Array.from({ length: 20 }, (_, index) =>
        store.createTutorRootThread(root(questionNumber, index))));
      assert.equal(created.length, 20);
    }
    await assert.rejects(() => store.createTutorRootThread(root(6, 0)),
      (error) => error.code === 'TUTOR_STUDENT_THREAD_CAP_REACHED');
    const liveCount = await store.pool.query(
      `SELECT count(*)::integer AS count
       FROM amc_practice.learning_tutor_threads
       WHERE student_id = $1 AND status <> 'TOMBSTONED'`, [fixture.studentId]
    );
    assert.equal(liveCount.rows[0].count, 100);
  });

test('PostgresStore resolves path-only Tutor list, fork, retry, and idempotent tombstone',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 8 });
    t.after(() => store.close());
    await runMigrations(store.pool);
    const fixture = await postgresTutorFixture(store);
    const path = {
      studentId: fixture.studentId,
      authorizedSessionId: fixture.sessionId,
      learningSubmissionId: fixture.snapshot.learningSubmissionId,
      versionNumber: fixture.snapshot.versionNumber,
      questionNumber: fixture.snapshot.questionNumber
    };
    const parent = await createThread(store, fixture, 'path-command-parent');
    assert.equal((await store.listTutorThreadBundles(
      path.studentId, path.learningSubmissionId, path.versionNumber, path.questionNumber
    )).some((bundle) => bundle.thread.id === parent.id), true);
    assert.deepEqual(await store.listTutorThreadBundles(
      path.studentId, path.learningSubmissionId, path.versionNumber + 1, path.questionNumber
    ), []);

    await store.enqueueTutorTurn({
      studentId: path.studentId, threadId: parent.id,
      authorizedSessionId: path.authorizedSessionId,
      idempotencyKey: `path-parent-turn-${randomUUID()}`,
      correlationId: `path-parent-correlation-${randomUUID()}`,
      message: 'Establish a successful fork head.', now: new Date()
    });
    const parentClaim = await store.claimTutorTurnJob({
      workerId: 'pg-path-parent-worker', leaseMs: 5_000
    });
    assert.equal(await store.markTutorTurnDispatched({
      jobId: parentClaim.job.id, workerId: parentClaim.job.leaseOwner,
      leaseToken: parentClaim.job.leaseToken,
      expectedDeletionGeneration: parentClaim.job.deletionGeneration, ...dispatch
    }), true);
    await store.completeTutorTurnJob({
      jobId: parentClaim.job.id, workerId: parentClaim.job.leaseOwner,
      leaseToken: parentClaim.job.leaseToken,
      expectedDeletionGeneration: parentClaim.job.deletionGeneration,
      gatewayResult: gatewaySuccess(parentClaim.job, 'The successful head is now durable.'),
      latencyMs: 50
    });

    const forkKey = `path-fork-${randomUUID()}`;
    const forkInput = {
      ...path, parentThreadId: parent.id, idempotencyKey: forkKey,
      threadId: randomUUID(), now: new Date(0)
    };
    const fork = await store.createTutorForkFromHead(forkInput);
    assert.equal(fork.thread.forkedFromThreadId, parent.id);
    assert.equal(fork.thread.forkedFromTurnJobId, parentClaim.job.id);
    const forkReplays = await Promise.all(Array.from({ length: 4 }, () =>
      store.createTutorForkFromHead({
        ...forkInput, threadId: randomUUID(), now: new Date()
      })));
    assert.equal(new Set(forkReplays.map((result) => result.thread.id)).size, 1);
    assert.equal(forkReplays[0].thread.id, fork.thread.id);

    const retryThread = await createThread(store, fixture, 'path-command-retry');
    await store.enqueueTutorTurn({
      studentId: path.studentId, threadId: retryThread.id,
      authorizedSessionId: path.authorizedSessionId,
      idempotencyKey: `path-retry-parent-${randomUUID()}`,
      correlationId: `path-retry-parent-correlation-${randomUUID()}`,
      message: 'Resolve my retry parent from ordinal one.', now: new Date()
    });
    const retryParent = await store.claimTutorTurnJob({
      workerId: 'pg-path-retry-worker', leaseMs: 5_000
    });
    assert.equal(await store.markTutorTurnDispatched({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken,
      expectedDeletionGeneration: retryParent.job.deletionGeneration, ...dispatch
    }), true);
    assert.equal(await store.recordTutorDeliveryUnknown({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken,
      expectedDeletionGeneration: retryParent.job.deletionGeneration
    }), true);
    const retryKey = `path-retry-${randomUUID()}`;
    const retryInput = {
      ...path, threadId: retryThread.id, requestOrdinal: 1,
      idempotencyKey: retryKey,
      correlationId: `path-retry-correlation-${randomUUID()}`,
      jobId: randomUUID(), now: new Date(0)
    };
    const retry = await store.retryTutorTurnByOrdinal(retryInput);
    assert.equal(retry.job.retryOfJobId, retryParent.job.id);
    assert.equal(retry.job.requestOrdinal, 2);
    const sessionClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
    const replacementSessionId = `pg-path-replacement-${randomUUID()}`;
    await store.createSession({
      id: replacementSessionId, studentId: path.studentId,
      csrfTokenHash: tutorSha256('pg-path-replacement-csrf'), createdAt: sessionClock,
      expiresAt: new Date(sessionClock.getTime() + 3_600_000), revokedAt: null
    });
    const retryReplay = await store.retryTutorTurnByOrdinal({
      ...retryInput, authorizedSessionId: replacementSessionId,
      correlationId: `path-retry-replay-${randomUUID()}`, jobId: randomUUID(),
      now: new Date()
    });
    assert.equal(retryReplay.replayed, true);
    assert.equal(retryReplay.job.id, retry.job.id);
    assert.equal(retryReplay.job.correlationId, retry.job.correlationId);

    const deleteKey = `path-delete-${randomUUID()}`;
    const deleteInput = {
      ...path, authorizedSessionId: replacementSessionId,
      threadId: retryThread.id, idempotencyKey: deleteKey, now: new Date(0)
    };
    assert.equal(await store.tombstoneTutorThreadByPath({
      ...deleteInput, versionNumber: path.versionNumber + 1,
      idempotencyKey: `wrong-path-delete-${randomUUID()}`
    }), false);
    assert.equal(await store.tombstoneTutorThreadByPath(deleteInput), true);
    assert.equal(await store.tombstoneTutorThreadByPath({
      ...deleteInput, now: new Date(), authorizedSessionId: replacementSessionId
    }), true);
    const deleted = await store.pool.query(
      `SELECT status, deletion_generation FROM amc_practice.learning_tutor_threads
       WHERE id = $1`, [retryThread.id]
    );
    assert.deepEqual(deleted.rows[0], { status: 'TOMBSTONED', deletion_generation: 1 });
    await assert.rejects(() => store.tombstoneTutorThreadByPath({
      ...deleteInput, questionNumber: path.questionNumber + 1
    }), (error) => error.code === 'IDEMPOTENCY_KEY_REUSED');
    const visible = await store.listTutorThreadBundles(
      path.studentId, path.learningSubmissionId, path.versionNumber, path.questionNumber
    );
    assert.equal(visible.some((bundle) => bundle.thread.id === retryThread.id), false);
    assert.equal(visible.some((bundle) => bundle.thread.id === fork.thread.id), true);

    const forkDeleteRace = await Promise.race([
      Promise.allSettled([
        store.createTutorForkFromHead({
          ...path, parentThreadId: parent.id,
          idempotencyKey: `path-race-fork-${randomUUID()}`,
          threadId: randomUUID(), now: new Date()
        }),
        store.tombstoneTutorThreadByPath({
          ...path, threadId: parent.id,
          idempotencyKey: `path-race-delete-${randomUUID()}`, now: new Date()
        })
      ]),
      delay(3_000, undefined, { ref: false }).then(() => {
        throw new Error('fork-vs-delete exceeded the deadlock bound');
      })
    ]);
    assert.equal(forkDeleteRace.length, 2);
    assert.equal(forkDeleteRace[1].status, 'fulfilled');
  });

test('PostgresStore Tutor fencing survives stale tokens, expired leases, and dispatch crash windows',
  { skip: !connectionString }, async (t) => {
    const store = new PostgresStore({ connectionString, max: 4 });
    t.after(() => store.close());
    await runMigrations(store.pool);
    const fixture = await postgresTutorFixture(store);
    const forged = structuredClone(fixture.snapshot);
    forged.id = randomUUID();
    forged.scoringSnapshotHash = 'a'.repeat(64);
    forged.threadLineageHash = computeTutorThreadLineageHash({
      analysisRunId: forged.analysisRunId,
      analysisContractVersion: forged.analysisContractVersion,
      reportId: forged.reportId, reportHash: forged.reportHash,
      snapshotHash: forged.snapshotHash,
      questionResponseHash: forged.questionResponseHash,
      scoringSnapshotHash: forged.scoringSnapshotHash,
      scoringOrigin: forged.scoringOrigin,
      initialDeletionGeneration: forged.initialDeletionGeneration
    });
    await assert.rejects(() => store.createTutorSnapshot(forged),
      (error) => error.code === 'TUTOR_SOURCE_LINEAGE_MISMATCH');
    const semanticReplay = await store.createTutorSnapshot({
      ...structuredClone(fixture.snapshot), id: randomUUID()
    });
    assert.equal(semanticReplay.id, fixture.snapshot.id,
      'the semantic snapshot identity deterministically reuses its immutable row');

    const invalidOptionsThread = await createThread(store, fixture, 'invalid-options');
    await assert.rejects(() => store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: invalidOptionsThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `invalid-${randomUUID()}`,
      correlationId: `invalid-correlation-${randomUUID()}`,
      message: 'Do not enqueue this.', maxAttempts: 0, now: new Date()
    }), (error) => error.code === 'INVALID_TUTOR_QUEUE_OPTIONS');
    await assert.rejects(() => store.claimTutorTurnJob({ workerId: 'worker', leaseMs: 0 }),
      (error) => error.code === 'INVALID_TUTOR_CLAIM_OPTIONS');
    const invalidJobCount = await store.pool.query(
      'SELECT count(*)::integer AS count FROM amc_practice.learning_tutor_turn_jobs WHERE thread_id = $1',
      [invalidOptionsThread.id]
    );
    assert.equal(invalidJobCount.rows[0].count, 0);
    await assert.rejects(() => store.createTutorThread({
      id: invalidOptionsThread.id, studentId: fixture.studentId,
      snapshotId: fixture.snapshot.id,
      idempotencyKey: `different-key-same-thread-id-${randomUUID()}`
    }), (error) => error.code === 'TUTOR_THREAD_ID_CONFLICT');
    await store.tombstoneTutorThread({
      studentId: fixture.studentId, threadId: invalidOptionsThread.id
    });

    const unknownThread = await createThread(store, fixture, 'unknown');
    const safeUnknownBundle = await store.getTutorThreadBundle(fixture.studentId, unknownThread.id);
    assert.equal(safeUnknownBundle.thread.id, unknownThread.id);
    assertStudentSafeBundle(safeUnknownBundle);
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: unknownThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `turn-${randomUUID()}`,
      correlationId: `corr-${randomUUID()}`, message: 'Compare both approved methods.',
      now: new Date()
    });
    const unknownClaim = await store.claimTutorTurnJob({
      workerId: 'pg-tutor-worker-a', leaseMs: 80
    });
    assert.ok(unknownClaim);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: unknownClaim.job.id, workerId: 'pg-tutor-worker-a', leaseToken: randomUUID(),
      expectedDeletionGeneration: 0, ...dispatch
    }), false);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: unknownClaim.job.id, workerId: 'pg-tutor-worker-a',
      leaseToken: unknownClaim.job.leaseToken,
      expectedDeletionGeneration: 0, ...dispatch
    }), true);
    const committedIntent = await store.pool.query(
      `SELECT status, provider_invoked, delivery_disposition
       FROM amc_practice.learning_tutor_turn_jobs WHERE id = $1`, [unknownClaim.job.id]
    );
    assert.deepEqual(committedIntent.rows[0], {
      status: 'RUNNING', provider_invoked: true,
      delivery_disposition: 'MAY_HAVE_BEEN_DELIVERED'
    }, 'the dispatch intent is externally visible before any provider result transaction');
    await delay(120);
    assert.equal(await store.claimTutorTurnJob({ workerId: 'pg-tutor-worker-b', leaseMs: 1_000 }), null);
    const unknown = await store.pool.query(
      `SELECT status, attempt_count FROM amc_practice.learning_tutor_turn_jobs WHERE id = $1`,
      [unknownClaim.job.id]
    );
    assert.deepEqual(unknown.rows[0], { status: 'DELIVERY_UNKNOWN', attempt_count: 1 });

    const replayClock = (await store.pool.query('SELECT clock_timestamp() AS now')).rows[0].now;
    const replaySessionId = `tutor-replay-session-${randomUUID()}`;
    await store.createSession({
      id: replaySessionId, studentId: fixture.studentId,
      csrfTokenHash: tutorSha256('replay-csrf'), createdAt: replayClock,
      expiresAt: new Date(replayClock.getTime() + 3_600_000), revokedAt: null
    });
    const explicitKey = `explicit-${randomUUID()}`;
    const explicit = await store.retryTutorTurnExplicitly({
      studentId: fixture.studentId, threadId: unknownThread.id,
      previousJobId: unknownClaim.job.id, authorizedSessionId: fixture.sessionId,
      idempotencyKey: explicitKey, correlationId: `explicit-correlation-${randomUUID()}`,
      now: new Date()
    });
    const replayedExplicit = await store.retryTutorTurnExplicitly({
      studentId: fixture.studentId, threadId: unknownThread.id,
      previousJobId: unknownClaim.job.id, authorizedSessionId: replaySessionId,
      idempotencyKey: explicitKey, correlationId: `new-transport-correlation-${randomUUID()}`,
      now: new Date()
    });
    assert.equal(replayedExplicit.replayed, true);
    assert.equal(replayedExplicit.job.id, explicit.job.id);
    assert.equal(replayedExplicit.job.correlationId, explicit.job.correlationId);
    assert.equal(replayedExplicit.job.authorizedSessionId, fixture.sessionId,
      'relogin reauthorizes replay without mutating the durable job session fence');
    await assert.rejects(() => store.retryTutorTurnExplicitly({
      studentId: fixture.studentId, threadId: unknownThread.id,
      previousJobId: unknownClaim.job.id, authorizedSessionId: replaySessionId,
      idempotencyKey: `second-child-${randomUUID()}`,
      correlationId: `second-child-correlation-${randomUUID()}`, now: new Date()
    }), (error) => error.code === 'TUTOR_THREAD_BUSY');
    await store.tombstoneTutorThread({ studentId: fixture.studentId, threadId: unknownThread.id });

    const concurrentRetryThread = await createThread(store, fixture, 'concurrent-explicit-retry');
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: concurrentRetryThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `parent-${randomUUID()}`,
      correlationId: `parent-correlation-${randomUUID()}`,
      message: 'Retry this only with explicit authorization.', now: new Date()
    });
    const retryParent = await store.claimTutorTurnJob({
      workerId: 'pg-explicit-parent-worker', leaseMs: 5_000
    });
    assert.equal(await store.markTutorTurnDispatched({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
    }), true);
    assert.equal(await store.recordTutorDeliveryUnknown({
      jobId: retryParent.job.id, workerId: retryParent.job.leaseOwner,
      leaseToken: retryParent.job.leaseToken, expectedDeletionGeneration: 0
    }), true);
    const concurrentExplicit = await Promise.allSettled(['a', 'b'].map((suffix) =>
      store.retryTutorTurnExplicitly({
        studentId: fixture.studentId, threadId: concurrentRetryThread.id,
        previousJobId: retryParent.job.id, authorizedSessionId: replaySessionId,
        idempotencyKey: `concurrent-explicit-${suffix}-${randomUUID()}`,
        correlationId: `concurrent-explicit-correlation-${suffix}-${randomUUID()}`,
        now: new Date()
      })));
    assert.equal(concurrentExplicit.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(concurrentExplicit.find((result) => result.status === 'rejected').reason.code,
      'TUTOR_THREAD_BUSY');
    await store.tombstoneTutorThread({
      studentId: fixture.studentId, threadId: concurrentRetryThread.id
    });

    const retryThread = await createThread(store, fixture, 'expired-safe');
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: retryThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `turn-${randomUUID()}`,
      correlationId: `corr-${randomUUID()}`, message: 'Explain why the algebra step is valid.',
      now: new Date()
    });
    const expired = await store.claimTutorTurnJob({ workerId: 'pg-tutor-worker-shared', leaseMs: 80 });
    assert.ok(expired);
    await delay(120);
    const reclaimed = await store.claimTutorTurnJob({ workerId: 'pg-tutor-worker-shared', leaseMs: 5_000 });
    assert.equal(reclaimed.job.id, expired.job.id);
    assert.notEqual(reclaimed.job.leaseToken, expired.job.leaseToken);
    assert.equal(reclaimed.job.attemptCount, 2);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: reclaimed.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: expired.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
    }), false);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: reclaimed.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: reclaimed.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
    }), true);
    assert.equal(await store.recordTutorKnownNoResult({
      jobId: reclaimed.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: reclaimed.job.leaseToken, expectedDeletionGeneration: 0,
      retryable: true, outcomeCode: 'RATE_LIMIT', errorClass: 'rate_limit',
      retryAfterMs: 0
    }), true);
    const knownRetry = await store.claimTutorTurnJob({
      workerId: 'pg-tutor-worker-shared', leaseMs: 5_000
    });
    assert.equal(knownRetry.job.id, reclaimed.job.id);
    assert.equal(knownRetry.job.attemptCount, 3);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: knownRetry.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: knownRetry.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
    }), true);
    const reply = 'Subtracting the same amount from equal quantities preserves equality.';
    await assert.rejects(() => store.completeTutorTurnJob({
      jobId: knownRetry.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: knownRetry.job.leaseToken, expectedDeletionGeneration: 0,
      assistantMessageId: knownRetry.job.requestMessageId,
      gatewayResult: gatewaySuccess(knownRetry.job, reply), latencyMs: 250
    }), (error) => error.code === 'TUTOR_MESSAGE_ID_CONFLICT');
    const mismatched = gatewaySuccess(knownRetry.job, reply);
    mismatched.tutorTurn.turnId = randomUUID();
    await assert.rejects(() => store.completeTutorTurnJob({
      jobId: knownRetry.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: knownRetry.job.leaseToken, expectedDeletionGeneration: 0,
      gatewayResult: mismatched, latencyMs: 250
    }), (error) => error.code === 'TUTOR_GATEWAY_RESPONSE_MISMATCH');
    const completed = await store.completeTutorTurnJob({
      jobId: knownRetry.job.id, workerId: 'pg-tutor-worker-shared',
      leaseToken: knownRetry.job.leaseToken, expectedDeletionGeneration: 0,
      gatewayResult: gatewaySuccess(knownRetry.job, reply), latencyMs: 250
    });
    assert.equal(completed.job.status, 'SUCCEEDED');
    const bundle = await store.getTutorThreadBundle(fixture.studentId, retryThread.id);
    assert.equal(bundle.thread.successfulTurnCount, 1);
    assert.deepEqual(bundle.messages.map((message) => message.role), ['USER', 'ASSISTANT']);
    const atomicHead = await store.pool.query(
      `SELECT thread.successful_turn_count, job.status AS job_status,
              message.role AS response_role
       FROM amc_practice.learning_tutor_threads thread
       JOIN amc_practice.learning_tutor_turn_jobs job ON job.thread_id = thread.id
       JOIN amc_practice.learning_tutor_messages message
         ON message.id = job.response_message_id
       WHERE thread.id = $1`, [retryThread.id]
    );
    assert.deepEqual(atomicHead.rows[0], {
      successful_turn_count: 1, job_status: 'SUCCEEDED', response_role: 'ASSISTANT'
    });
    const forkKey = `fork-${randomUUID()}`;
    const fork = await store.createTutorThread({
      id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
      forkedFromThreadId: retryThread.id, forkedFromTurnJobId: knownRetry.job.id,
      idempotencyKey: forkKey, now: new Date()
    });
    const forkReplay = await store.createTutorThread({
      id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
      forkedFromThreadId: retryThread.id, forkedFromTurnJobId: knownRetry.job.id,
      idempotencyKey: forkKey, now: new Date()
    });
    assert.equal(forkReplay.id, fork.id);
    await assert.rejects(() => store.createTutorThread({
      id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
      forkedFromThreadId: retryThread.id, forkedFromTurnJobId: randomUUID(),
      idempotencyKey: forkKey, now: new Date()
    }), (error) => error.code === 'IDEMPOTENCY_KEY_REUSED');
    await store.tombstoneTutorThread({ studentId: fixture.studentId, threadId: fork.id });

    const exhaustedThread = await createThread(store, fixture, 'exhausted');
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: exhaustedThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `turn-${randomUUID()}`,
      correlationId: `corr-${randomUUID()}`, message: 'Show the invariant.',
      maxAttempts: 1, now: new Date()
    });
    const exhausted = await store.claimTutorTurnJob({
      workerId: 'pg-tutor-exhausted', leaseMs: 80
    });
    await delay(120);
    assert.equal(await store.claimTutorTurnJob({
      workerId: 'pg-tutor-exhausted-recovery', leaseMs: 1_000
    }), null);
    const exhaustedState = await store.pool.query(
      `SELECT status, outcome_code, error_class, retryable, lease_token
       FROM amc_practice.learning_tutor_turn_jobs WHERE id = $1`, [exhausted.job.id]
    );
    assert.deepEqual(exhaustedState.rows[0], {
      status: 'FAILED', outcome_code: 'ATTEMPTS_EXHAUSTED',
      error_class: 'transient', retryable: false, lease_token: null
    });

    const parallelThread = await createThread(store, fixture, 'parallel');
    await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: parallelThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `turn-${randomUUID()}`,
      correlationId: `corr-${randomUUID()}`, message: 'Which method is shorter?',
      now: new Date()
    });
    const parallelClaims = await Promise.all([
      store.claimTutorTurnJob({ workerId: 'pg-tutor-racer-a', leaseMs: 5_000 }),
      store.claimTutorTurnJob({ workerId: 'pg-tutor-racer-b', leaseMs: 5_000 })
    ]);
    assert.equal(parallelClaims.filter(Boolean).length, 1,
      'FOR UPDATE SKIP LOCKED permits exactly one worker claim');
    const parallelClaim = parallelClaims.find(Boolean);
    assert.equal(await store.markTutorTurnDispatched({
      jobId: parallelClaim.job.id, workerId: parallelClaim.job.leaseOwner,
      leaseToken: parallelClaim.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
    }), true);
    assert.equal(await store.tombstoneTutorThread({
      studentId: randomUUID(), threadId: parallelThread.id
    }), false);
    const [unknownRace, tombstoneRace] = await Promise.all([
      store.recordTutorDeliveryUnknown({
        jobId: parallelClaim.job.id, workerId: parallelClaim.job.leaseOwner,
        leaseToken: parallelClaim.job.leaseToken, expectedDeletionGeneration: 0
      }),
      store.tombstoneTutorThread({ studentId: fixture.studentId, threadId: parallelThread.id })
    ]);
    assert.equal(tombstoneRace, true);
    assert.equal(typeof unknownRace, 'boolean',
      'the competing result is fenced or commits before tombstone without deadlock');
    assert.equal(await store.getTutorThreadBundle(fixture.studentId, parallelThread.id), null);
    const tombstone = await store.pool.query(
      `SELECT thread.status, thread.deletion_generation, job.status AS job_status
       FROM amc_practice.learning_tutor_threads thread
       JOIN amc_practice.learning_tutor_turn_jobs job ON job.thread_id = thread.id
       WHERE thread.id = $1`, [parallelThread.id]
    );
    assert.deepEqual(tombstone.rows[0], {
      status: 'TOMBSTONED', deletion_generation: 1, job_status: 'DELIVERY_UNKNOWN'
    });

    const claimTombstoneThread = await createThread(store, fixture, 'claim-tombstone');
    const claimTombstoneEnqueue = await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: claimTombstoneThread.id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `claim-tombstone-${randomUUID()}`,
      correlationId: `claim-tombstone-correlation-${randomUUID()}`,
      message: 'Race claim against tombstone.', now: new Date()
    });
    const [claimRace, claimRaceTombstone] = await Promise.race([
      Promise.all([
        store.claimTutorTurnJob({ workerId: 'pg-claim-tombstone-worker', leaseMs: 5_000 }),
        store.tombstoneTutorThread({
          studentId: fixture.studentId, threadId: claimTombstoneThread.id
        })
      ]),
      delay(3_000, undefined, { ref: false }).then(() => {
        throw new Error('claim-vs-tombstone exceeded the deadlock bound');
      })
    ]);
    assert.equal(claimRaceTombstone, true);
    const claimRaceState = await store.pool.query(
      `SELECT thread.status AS thread_status, job.status AS job_status
       FROM amc_practice.learning_tutor_threads thread
       JOIN amc_practice.learning_tutor_turn_jobs job ON job.thread_id = thread.id
       WHERE thread.id = $1 AND job.id = $2`,
      [claimTombstoneThread.id, claimTombstoneEnqueue.job.id]
    );
    assert.deepEqual(claimRaceState.rows[0], {
      thread_status: 'TOMBSTONED', job_status: 'CANCELLED'
    });
    if (claimRace) {
      assert.equal(await store.markTutorTurnDispatched({
        jobId: claimRace.job.id, workerId: claimRace.job.leaseOwner,
        leaseToken: claimRace.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
      }), false, 'a lease returned immediately before tombstone is fenced before dispatch');
    }

    for (const recoveryCase of [
      { suffix: 'expired-safe-tombstone', dispatchBeforeExpiry: false,
        expectedJobStatus: 'CANCELLED' },
      { suffix: 'expired-may-tombstone', dispatchBeforeExpiry: true,
        expectedJobStatus: 'DELIVERY_UNKNOWN' }
    ]) {
      const recoveryThread = await createThread(store, fixture, recoveryCase.suffix);
      const recoveryEnqueue = await store.enqueueTutorTurn({
        studentId: fixture.studentId, threadId: recoveryThread.id,
        authorizedSessionId: fixture.sessionId,
        idempotencyKey: `${recoveryCase.suffix}-${randomUUID()}`,
        correlationId: `${recoveryCase.suffix}-correlation-${randomUUID()}`,
        message: `Race ${recoveryCase.suffix} recovery against tombstone.`, now: new Date()
      });
      const expiringClaim = await store.claimTutorTurnJob({
        workerId: `${recoveryCase.suffix}-worker`, leaseMs: 80
      });
      assert.equal(expiringClaim.job.id, recoveryEnqueue.job.id);
      if (recoveryCase.dispatchBeforeExpiry) {
        assert.equal(await store.markTutorTurnDispatched({
          jobId: expiringClaim.job.id, workerId: expiringClaim.job.leaseOwner,
          leaseToken: expiringClaim.job.leaseToken, expectedDeletionGeneration: 0, ...dispatch
        }), true);
      }
      await delay(120);
      const [, recoveryTombstone] = await Promise.race([
        Promise.all([
          store.claimTutorTurnJob({
            workerId: `${recoveryCase.suffix}-recovery`, leaseMs: 5_000
          }),
          store.tombstoneTutorThread({
            studentId: fixture.studentId, threadId: recoveryThread.id
          })
        ]),
        delay(3_000, undefined, { ref: false }).then(() => {
          throw new Error(`${recoveryCase.suffix} exceeded the deadlock bound`);
        })
      ]);
      assert.equal(recoveryTombstone, true);
      const recoveryState = await store.pool.query(
        `SELECT thread.status AS thread_status, job.status AS job_status
         FROM amc_practice.learning_tutor_threads thread
         JOIN amc_practice.learning_tutor_turn_jobs job ON job.thread_id = thread.id
         WHERE thread.id = $1 AND job.id = $2`, [recoveryThread.id, expiringClaim.job.id]
      );
      assert.deepEqual(recoveryState.rows[0], {
        thread_status: 'TOMBSTONED', job_status: recoveryCase.expectedJobStatus
      });
    }

    const capacityThreads = await Promise.all(['a', 'b', 'c'].map((suffix) =>
      createThread(store, fixture, `capacity-${suffix}`)));
    const capacityResults = await Promise.allSettled(capacityThreads.map((thread, index) =>
      store.enqueueTutorTurn({
        studentId: fixture.studentId, threadId: thread.id,
        authorizedSessionId: fixture.sessionId,
        idempotencyKey: `capacity-turn-${index}-${randomUUID()}`,
        correlationId: `capacity-corr-${index}-${randomUUID()}`,
        message: `Capacity request ${index + 1}.`, now: new Date()
      })));
    assert.equal(capacityResults.filter((result) => result.status === 'fulfilled').length, 2);
    const rejected = capacityResults.find((result) => result.status === 'rejected');
    assert.equal(rejected.reason.code, 'TUTOR_STUDENT_CAPACITY_REACHED');
    const activeCount = await store.pool.query(
      `SELECT count(*)::integer AS count FROM amc_practice.learning_tutor_turn_jobs
       WHERE student_id = $1 AND status IN ('QUEUED','RUNNING','RETRY_WAIT')`,
      [fixture.studentId]
    );
    assert.equal(activeCount.rows[0].count, 2);
    const queuedJobIds = capacityResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value.job.id);
    await store.revokeSession(fixture.sessionId, new Date());
    assert.equal(await store.claimTutorTurnJob({
      workerId: 'pg-revoked-session-cleaner', leaseMs: 5_000
    }), null, 'revoked work is drained instead of claimed');
    const cancelled = await store.pool.query(
      `SELECT id, status, outcome_code, error_class
       FROM amc_practice.learning_tutor_turn_jobs
       WHERE id = ANY($1::uuid[]) ORDER BY id`, [queuedJobIds]
    );
    assert.deepEqual(cancelled.rows.map((row) => ({
      status: row.status, outcomeCode: row.outcome_code, errorClass: row.error_class
    })), [
      { status: 'CANCELLED', outcomeCode: 'CANCELLED', errorClass: 'permanent' },
      { status: 'CANCELLED', outcomeCode: 'CANCELLED', errorClass: 'permanent' }
    ]);
    const releasedCapacity = await store.pool.query(
      `SELECT count(*)::integer AS count FROM amc_practice.learning_tutor_turn_jobs
       WHERE student_id = $1 AND status IN ('QUEUED','RUNNING','RETRY_WAIT')`,
      [fixture.studentId]
    );
    assert.equal(releasedCapacity.rows[0].count, 0);
    const replacementClock = (await store.pool.query(
      'SELECT clock_timestamp() AS now')).rows[0].now;
    const replacementSessionId = `tutor-replacement-session-${randomUUID()}`;
    await store.createSession({
      id: replacementSessionId, studentId: fixture.studentId,
      csrfTokenHash: tutorSha256('replacement-csrf'), createdAt: replacementClock,
      expiresAt: new Date(replacementClock.getTime() + 3_600_000), revokedAt: null
    });
    const replacement = await store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: capacityThreads[2].id,
      authorizedSessionId: replacementSessionId,
      idempotencyKey: `capacity-replacement-${randomUUID()}`,
      correlationId: `capacity-replacement-correlation-${randomUUID()}`,
      message: 'Capacity is available after revoked jobs are drained.', now: new Date()
    });
    assert.equal(replacement.job.status, 'QUEUED');
    await Promise.all(capacityThreads.map((thread) => store.tombstoneTutorThread({
      studentId: fixture.studentId, threadId: thread.id
    })));
  });
