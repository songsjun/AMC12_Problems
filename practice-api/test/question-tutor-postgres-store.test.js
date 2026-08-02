import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';
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

const connectionString = process.env.AMC12_TEST_DATABASE_URL;

async function postgresTutorFixture(store) {
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
  const student = await service.seedAccessCode({
    code: `tutor-pg-student-${randomUUID()}`,
    displayName: 'Postgres tutor adapter student'
  });
  const attempt = await service.createAttempt(student.id, form.id);
  await service.putReasoning(student.id, attempt.attempt.id, `reason-${randomUUID()}`, {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'Subtract the same quantity from both sides.' }]
  });
  const current = await service.getAttempt(student.id, attempt.attempt.id);
  const final = await service.final(student.id, attempt.attempt.id, `final-${randomUUID()}`, {
    expectedAnswersRevision: current.answersRevision,
    expectedStateRevision: current.stateRevision
  });
  const artifact = approvedContextArtifact(form, { readyNumbers: [1] });
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
  await store.createTutorSnapshot(snapshot);
  return { studentId: student.id, sessionId, snapshot, dbClock };
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
