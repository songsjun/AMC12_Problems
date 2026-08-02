import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { MemoryStore } from '../src/memory-store.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import {
  computeTutorContextReleaseHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  tutorSha256
} from '../src/question-tutor/domain.js';

const fixtureUrl = new URL('./fixtures/tutor-contract-v2.json', import.meta.url);

async function memoryFixture({ batchConfirmed = false } = {}) {
  const store = new MemoryStore();
  const golden = JSON.parse(await readFile(fixtureUrl, 'utf8'));
  const context = structuredClone(golden.request.context);
  context.question.questionId = `${context.formId}:q:${context.question.questionNumber}`;
  const studentId = randomUUID();
  const attemptId = randomUUID();
  const officialSubmissionId = randomUUID();
  const learningSubmissionId = context.learningSubmissionId;
  const versionId = context.learningSubmissionVersionId;
  const contextSetId = context.contextSetId;
  const analysisRunId = randomUUID();
  const reportId = randomUUID();
  const batchId = batchConfirmed ? randomUUID() : null;
  const batchResultId = batchConfirmed ? randomUUID() : null;
  const scoringOrigin = batchConfirmed ? 'BATCH_CONFIRMED' : 'OFFICIAL_FINAL';
  const sessionId = 'tutor-session-001';
  const now = new Date('2026-08-01T12:00:00.000Z');
  const response = {
    learningSubmissionVersionId: versionId,
    formId: context.formId,
    formVersion: context.formVersion,
    questionNumber: 1,
    selectedOption: 'C',
    answerOrigin: scoringOrigin,
    reasoningText: context.question.studentReasoning,
    reasoningOrigin: 'STUDENT',
    createdAt: now
  };
  const scoring = {
    isScored: true,
    canonicalAnswer: 'C',
    acceptedOptions: ['C'],
    studentAnswerIsCorrect: true,
    selectedOption: 'C'
  };
  const questionContentHash = 'd'.repeat(64);
  const analysisQuestionInputHash = 'e'.repeat(64);
  const analysisQuestionContextHash = 'f'.repeat(64);
  const reportHash = '1'.repeat(64);
  const questionResponseHash = canonicalHash({
    questionNumber: 1, selectedOption: 'C',
    reasoningText: response.reasoningText, answerOrigin: scoringOrigin
  });
  const scoringSnapshotHash = canonicalHash(scoring);
  const releaseBinding = {
    manifestHash: '3'.repeat(64), contentHash: '4'.repeat(64),
    questionBundleHash: '5'.repeat(64)
  };
  const approvalAuthorityId = 'review-authority-001';
  const approvalReceiptSetHash = '6'.repeat(64);
  context.contextReleaseHash = computeTutorContextReleaseHash({
    sourceType: 'INTERACTIVE_FINAL', formId: context.formId,
    formVersion: context.formVersion, ...releaseBinding,
    contextSetId, contextArtifactSha256: context.contextArtifactSha256,
    approvalAuthorityId, approvalReceiptSetHash, openReviewReleaseHash: null
  });

  store.students.set(studentId, { id: studentId, displayName: 'Tutor student', createdAt: now });
  store.sessions.set(sessionId, {
    id: sessionId, studentId, csrfTokenHash: 'csrf', createdAt: now,
    expiresAt: new Date(now.getTime() + 86_400_000), revokedAt: null
  });
  store.attempts.set(attemptId, {
    id: attemptId, studentId, formId: context.formId, formVersion: context.formVersion,
    attemptMode: 'TIMED', phase: 'FINALIZED'
  });
  store.submissions.set(attemptId, [{ id: officialSubmissionId, attemptId, kind: 'FINAL' }]);
  store.submissionAnswers.set(officialSubmissionId, [{
    questionNumber: 1, selectedOption: 'C', correctOption: 'C',
    acceptedOptions: ['C'], isScored: true, isCorrect: true
  }]);
  store.learningSubmissions.set(attemptId, {
    id: learningSubmissionId, studentId, attemptId, officialSubmissionId,
    officialSubmissionKind: 'FINAL', attemptMode: 'TIMED', openReviewReleaseId: null,
    formId: context.formId, formVersion: context.formVersion,
    sourceType: 'INTERACTIVE_FINAL', lifecycleStatus: 'COMMITTED',
    currentVersion: 1, deletionGeneration: 0, createdAt: now, updatedAt: now
  });
  store.learningVersions.set(learningSubmissionId, [{
    id: versionId, learningSubmissionId, versionNumber: 1,
    formId: context.formId, formVersion: context.formVersion,
    contextStatus: 'CONTEXT_READY', contextSetId,
    evidenceHash: context.evidenceHash, batchId, createdAt: now
  }]);
  store.learningResponses.set(versionId, [response]);
  if (batchConfirmed) {
    store.learningBatchResults.set(batchId, {
      id: batchResultId, learningSubmissionVersionId: versionId,
      items: [{
        questionNumber: 1, selectedOption: 'C', correctOption: 'C',
        acceptedOptions: ['C'], isScored: true, isCorrect: true
      }]
    });
  }
  store.approvedContextSets.set(contextSetId, {
    id: contextSetId, artifactSetHash: context.contextArtifactSha256,
    approvalAuthorityId, approvalReceiptSetHash, releaseBinding,
    formId: context.formId, formVersion: context.formVersion,
    questions: [{
      questionNumber: 1, questionContentHash,
      promptMarkdown: context.question.promptMarkdown,
      choices: Object.fromEntries(context.question.choices.map(({ label, textMarkdown }) =>
        [label, textMarkdown])),
      solutions: context.question.solutions.map((solution, index) => ({
        solutionPosition: index + 1,
        artifactSolutionId: solution.solutionId,
        title: solution.title,
        bodyMarkdown: solution.markdown,
        bodySha256: solution.bodySha256,
        sourceRef: { sha256: solution.sourceSha256 },
        reviewerId: solution.reviewerId,
        reviewedAt: solution.reviewedAt,
        rightsStatus: solution.rightsStatus,
        qualityFlags: solution.qualityFlags,
        methodTags: solution.methodTags,
        modelEligibility: { eligible: true },
        authorityReceipt: {
          receiptId: solution.authorityReceiptId,
          status: solution.authorityReceiptStatus
        }
      }))
    }]
  });
  store.analysisRuns.set(versionId, {
    id: analysisRunId, learningSubmissionVersionId: versionId, contextSetId,
    versionNumber: 1, inputHash: '2'.repeat(64), evidenceHash: context.evidenceHash,
    deletionGeneration: 0, analysisContractVersion: 'amc-analysis-contract-v2',
    status: 'SUCCEEDED', createdAt: now, completedAt: now
  });
  store.questionAnalyses.set(analysisRunId, [{
    questionNumber: 1, questionInputHash: analysisQuestionInputHash,
    questionContextHash: analysisQuestionContextHash, status: 'SUCCEEDED'
  }]);
  store.learningReports.set(versionId, {
    id: reportId, analysisRunId, learningSubmissionVersionId: versionId,
    status: 'COMPLETE', generatedAt: now, summary: {}, reportHash
  });
  const snapshotHash = computeTutorSnapshotHash(context);
  const snapshot = {
    id: randomUUID(), studentId, learningSubmissionId,
    learningSubmissionVersionId: versionId, versionNumber: 1,
    formId: context.formId, formVersion: context.formVersion,
    sourceType: 'INTERACTIVE_FINAL', questionNumber: 1, contextSetId,
    questionContentHash, analysisRunId,
    analysisContractVersion: 'amc-analysis-contract-v2',
    analysisQuestionInputHash, analysisQuestionContextHash,
    reportId, reportHash, evidenceHash: context.evidenceHash,
    questionResponseHash, scoringSnapshotHash, scoringOrigin,
    officialSubmissionId: batchConfirmed ? null : officialSubmissionId,
    batchResultId, initialDeletionGeneration: 0,
    contextArtifactSha256: context.contextArtifactSha256,
    contextReleaseHash: context.contextReleaseHash,
    payloadSchema: 'amc-tutor-snapshot-v2', snapshotPayload: context, snapshotHash,
    threadLineageHash: computeTutorThreadLineageHash({
      analysisRunId, analysisContractVersion: 'amc-analysis-contract-v2',
      reportId, reportHash, snapshotHash, questionResponseHash, scoringSnapshotHash,
      scoringOrigin, initialDeletionGeneration: 0
    }),
    createdAt: now
  };
  return { store, snapshot, studentId, sessionId, now };
}

async function createThread(fixture, suffix) {
  await fixture.store.createTutorSnapshot(fixture.snapshot);
  return fixture.store.createTutorThread({
    id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: `thread-${suffix}`, now: fixture.now
  });
}

function dispatchMetadata() {
  return {
    provider: 'openai', requestedModel: 'gpt-5.6-terra',
    promptVersion: 'amc-question-tutor-prompt-v2',
    responseSchemaVersion: 'amc-tutor-turn-v2'
  };
}

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
        outputTokens: 20, totalTokens: 120,
        cacheWriteTokens: 10, reasoningTokens: 5
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

test('MemoryStore atomically enqueues a hash-bound USER turn and rejects snapshot drift', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'enqueue');
  const enqueued = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'turn-one',
    correlationId: 'memory-tutor-correlation-001', message: 'Please compare both methods.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  assert.equal(enqueued.job.status, 'QUEUED');
  assert.equal(enqueued.job.requestHash.length, 64);
  const bundle = await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id);
  assertStudentSafeBundle(bundle);
  assert.equal(bundle.thread.requestCount, 1);
  assert.equal(bundle.thread.threadRevision, 1);
  assert.deepEqual(bundle.messages.map((message) => message.role), ['USER']);
  await assert.rejects(() => fixture.store.createTutorThread({
    id: thread.id, studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: 'different-key-same-thread-id', now: fixture.now
  }), (error) => error.code === 'TUTOR_THREAD_ID_CONFLICT');

  const replay = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'turn-one',
    correlationId: 'memory-tutor-correlation-001', message: 'Please compare both methods.',
    now: new Date(fixture.now.getTime() + 2_000)
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.job.id, enqueued.job.id);
  assert.equal((await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id)).thread.requestCount, 1);
  fixture.store.sessions.get(fixture.sessionId).revokedAt = new Date(fixture.now.getTime() + 2_500);
  await assert.rejects(() => fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'turn-one',
    correlationId: 'memory-tutor-correlation-001', message: 'Please compare both methods.',
    now: new Date(fixture.now.getTime() + 3_000)
  }), (error) => error.code === 'TUTOR_SESSION_NOT_LIVE',
  'an idempotency replay must reauthorize the session');

  const forged = structuredClone(fixture.snapshot);
  forged.id = randomUUID();
  forged.snapshotPayload.question.studentReasoning = 'Forged reasoning.';
  forged.snapshotHash = computeTutorSnapshotHash(forged.snapshotPayload);
  forged.threadLineageHash = computeTutorThreadLineageHash({
    analysisRunId: forged.analysisRunId, analysisContractVersion: forged.analysisContractVersion,
    reportId: forged.reportId, reportHash: forged.reportHash, snapshotHash: forged.snapshotHash,
    questionResponseHash: forged.questionResponseHash,
    scoringSnapshotHash: forged.scoringSnapshotHash, scoringOrigin: forged.scoringOrigin,
    initialDeletionGeneration: forged.initialDeletionGeneration
  });
  await assert.rejects(() => fixture.store.createTutorSnapshot(forged),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');
});

test('MemoryStore persists dispatch intent before call and crash recovery never retries MAY delivery', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'crash');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'crash-turn',
    correlationId: 'memory-tutor-crash-001', message: 'Explain the direct method.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const claimedAt = new Date(fixture.now.getTime() + 2_000);
  const claim = await fixture.store.claimTutorTurnJob({ workerId: 'worker-a', leaseMs: 1_000, now: claimedAt });
  assert.ok(claim);
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: claim.job.id, workerId: 'worker-a', leaseToken: randomUUID(),
    expectedDeletionGeneration: 0, now: claimedAt, ...dispatchMetadata()
  }), false, 'a stale token cannot persist dispatch intent');
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: claim.job.id, workerId: 'worker-a', leaseToken: claim.job.leaseToken,
    expectedDeletionGeneration: 0, now: claimedAt, ...dispatchMetadata()
  }), true);

  const afterCrash = await fixture.store.claimTutorTurnJob({
    workerId: 'worker-b', leaseMs: 1_000,
    now: new Date(claimedAt.getTime() + 1_001)
  });
  assert.equal(afterCrash, null);
  const bundle = await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id);
  assert.equal(bundle.requests[0].status, 'DELIVERY_UNKNOWN');
  const unknownJob = fixture.store.tutorTurnJobs.get(claim.job.id);
  assert.equal(unknownJob.deliveryDisposition, 'MAY_HAVE_BEEN_DELIVERED');
  assert.equal(unknownJob.attemptCount, 1);
  const explicit = await fixture.store.retryTutorTurnExplicitly({
    studentId: fixture.studentId, threadId: thread.id,
    previousJobId: claim.job.id, authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'explicit-after-unknown', correlationId: 'memory-explicit-001',
    now: new Date(claimedAt.getTime() + 2_000)
  });
  assert.equal(explicit.job.retryAuthorization, 'STUDENT_EXPLICIT');
  const replayWithNewCorrelation = await fixture.store.retryTutorTurnExplicitly({
    studentId: fixture.studentId, threadId: thread.id,
    previousJobId: claim.job.id, authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'explicit-after-unknown', correlationId: 'changed-correlation',
    now: new Date(claimedAt.getTime() + 2_001)
  });
  assert.equal(replayWithNewCorrelation.replayed, true);
  assert.equal(replayWithNewCorrelation.job.correlationId, explicit.job.correlationId,
    'transport correlation is replayed from durable request identity');
  fixture.store.sessions.get(fixture.sessionId).revokedAt = new Date(claimedAt.getTime() + 2_500);
  await assert.rejects(() => fixture.store.retryTutorTurnExplicitly({
    studentId: fixture.studentId, threadId: thread.id,
    previousJobId: claim.job.id, authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'explicit-after-unknown', correlationId: 'memory-explicit-001',
    now: new Date(claimedAt.getTime() + 3_000)
  }), (error) => error.code === 'TUTOR_SESSION_NOT_LIVE',
  'an explicit-retry replay must reauthorize the session');
});

test('MemoryStore retries only known-no-result and atomically commits reply plus thread head', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'retry');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'retry-turn',
    correlationId: 'memory-tutor-retry-001', message: 'Why is subtraction valid?',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const first = await fixture.store.claimTutorTurnJob({
    workerId: 'worker-shared', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 2_000)
  });
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: first.job.id, workerId: 'worker-shared', leaseToken: first.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 3_000),
    ...dispatchMetadata()
  }), true);
  assert.equal(await fixture.store.recordTutorKnownNoResult({
    jobId: first.job.id, workerId: 'worker-shared', leaseToken: first.job.leaseToken,
    expectedDeletionGeneration: 0, retryable: true, outcomeCode: 'RATE_LIMIT',
    errorClass: 'rate_limit', retryAfterMs: 500,
    now: new Date(fixture.now.getTime() + 3_500)
  }), true);
  const second = await fixture.store.claimTutorTurnJob({
    workerId: 'worker-shared', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 4_000)
  });
  assert.notEqual(second.job.leaseToken, first.job.leaseToken);
  assert.equal(second.job.attemptCount, 2);
  assert.equal(second.job.providerInvoked, false);
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: first.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 4_500),
    ...dispatchMetadata()
  }), false);
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: second.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 4_500),
    ...dispatchMetadata()
  }), true);
  const reply = 'Subtracting the same quantity from both sides preserves equality.';
  assert.equal(await fixture.store.completeTutorTurnJob({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: first.job.leaseToken,
    expectedDeletionGeneration: 0, gatewayResult: gatewaySuccess(second.job, reply),
    latencyMs: 250, now: new Date(fixture.now.getTime() + 5_000)
  }), false);
  const crossJobResult = gatewaySuccess(second.job, reply);
  crossJobResult.tutorTurn.turnId = randomUUID();
  await assert.rejects(() => fixture.store.completeTutorTurnJob({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: second.job.leaseToken,
    expectedDeletionGeneration: 0, gatewayResult: crossJobResult,
    latencyMs: 250, now: new Date(fixture.now.getTime() + 5_000)
  }), (error) => error.code === 'TUTOR_GATEWAY_RESPONSE_MISMATCH');
  await assert.rejects(() => fixture.store.completeTutorTurnJob({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: second.job.leaseToken,
    expectedDeletionGeneration: 0,
    assistantMessageId: second.job.requestMessageId,
    gatewayResult: gatewaySuccess(second.job, reply), latencyMs: 250,
    now: new Date(fixture.now.getTime() + 5_000)
  }), (error) => error.code === 'TUTOR_MESSAGE_ID_CONFLICT');
  const malformedReply = gatewaySuccess(second.job, reply);
  malformedReply.tutorTurn.replyMarkdown = { markdown: reply };
  await assert.rejects(() => fixture.store.completeTutorTurnJob({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: second.job.leaseToken,
    expectedDeletionGeneration: 0, gatewayResult: malformedReply,
    latencyMs: 250, now: new Date(fixture.now.getTime() + 5_000)
  }), (error) => error.code === 'TUTOR_GATEWAY_RESPONSE_MISMATCH');
  const completed = await fixture.store.completeTutorTurnJob({
    jobId: second.job.id, workerId: 'worker-shared', leaseToken: second.job.leaseToken,
    expectedDeletionGeneration: 0, gatewayResult: gatewaySuccess(second.job, reply),
    latencyMs: 250, now: new Date(fixture.now.getTime() + 5_000)
  });
  assert.equal(completed.job.status, 'SUCCEEDED');
  const bundle = await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id);
  assert.equal(bundle.thread.successfulTurnCount, 1);
  assert.equal(bundle.thread.threadRevision, 2);
  assert.deepEqual(bundle.messages.map((message) => message.role), ['USER', 'ASSISTANT']);
  const persistedJob = fixture.store.tutorTurnJobs.get(second.job.id);
  assert.equal(persistedJob.responseMessageId, bundle.messages[1].id);
  assert.equal(persistedJob.replySha256, tutorSha256(bundle.messages[1].contentMarkdown));
  const historicalReplay = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'retry-turn',
    correlationId: 'memory-tutor-retry-001', message: 'Why is subtraction valid?',
    now: new Date(fixture.now.getTime() + 6_000)
  });
  assert.equal(historicalReplay.replayed, true,
    'a later successful head does not contaminate the original turn history hash');
});

test('MemoryStore public Tutor reads fail closed after source generation drift and tombstone', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'visibility');
  assert.ok(await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id));
  const submission = [...fixture.store.learningSubmissions.values()]
    .find((candidate) => candidate.id === fixture.snapshot.learningSubmissionId);
  submission.deletionGeneration += 1;
  assert.equal(await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id), null);
  await assert.rejects(() => fixture.store.createTutorThread({
    id: thread.id, studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: 'thread-visibility', now: new Date(fixture.now.getTime() + 500)
  }), (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE',
  'thread-creation replay must revalidate the frozen source');
  submission.deletionGeneration -= 1;
  assert.equal(await fixture.store.tombstoneTutorThread({
    studentId: fixture.studentId, threadId: thread.id,
    now: new Date(fixture.now.getTime() + 1_000)
  }), true);
  assert.equal(await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id), null);
  await assert.rejects(() => fixture.store.createTutorThread({
    id: thread.id, studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: 'thread-visibility', now: new Date(fixture.now.getTime() + 2_000)
  }), (error) => error.code === 'TUTOR_THREAD_NOT_AVAILABLE',
  'a tombstoned thread cannot be resurrected through idempotency replay');
});

test('MemoryStore validates BATCH_CONFIRMED scoring against its exact committed result item', async () => {
  const fixture = await memoryFixture({ batchConfirmed: true });
  const stored = await fixture.store.createTutorSnapshot(fixture.snapshot);
  assert.equal(stored.scoringOrigin, 'BATCH_CONFIRMED');
  assert.equal(stored.officialSubmissionId, null);
  assert.ok(stored.batchResultId);
  const batch = fixture.store.learningBatchResults.values().next().value;
  batch.items[0].acceptedOptions = ['B'];
  const drift = { ...structuredClone(fixture.snapshot), id: randomUUID() };
  await assert.rejects(() => fixture.store.createTutorSnapshot(drift),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');

  const wrongAuthority = structuredClone(fixture.snapshot);
  wrongAuthority.id = randomUUID();
  wrongAuthority.batchResultId = randomUUID();
  await assert.rejects(() => fixture.store.createTutorSnapshot(wrongAuthority),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');
});

test('MemoryStore binds snapshot source and official authority to the committed submission', async () => {
  const fixture = await memoryFixture();
  const wrongSource = structuredClone(fixture.snapshot);
  wrongSource.id = randomUUID();
  wrongSource.sourceType = 'OPEN_REVIEW';
  await assert.rejects(() => fixture.store.createTutorSnapshot(wrongSource),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');

  const wrongOfficial = structuredClone(fixture.snapshot);
  wrongOfficial.id = randomUUID();
  wrongOfficial.officialSubmissionId = randomUUID();
  await assert.rejects(() => fixture.store.createTutorSnapshot(wrongOfficial),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');

  const submissionEntry = [...fixture.store.learningSubmissions.entries()]
    .find(([, submission]) => submission.id === fixture.snapshot.learningSubmissionId);
  fixture.store.learningSubmissions.delete(submissionEntry[0]);
  await assert.rejects(() => fixture.store.createTutorSnapshot({
    ...structuredClone(fixture.snapshot), id: randomUUID()
  }), (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');
});

test('MemoryStore explicit retries share the per-student active-job capacity bound', async () => {
  const fixture = await memoryFixture();
  const retryThread = await createThread(fixture, 'capacity-retry');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: retryThread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'capacity-retry-original',
    correlationId: 'capacity-retry-original-correlation', message: 'Retry this request later.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const claimed = await fixture.store.claimTutorTurnJob({
    workerId: 'capacity-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 2_000)
  });
  await fixture.store.markTutorTurnDispatched({
    jobId: claimed.job.id, workerId: 'capacity-worker', leaseToken: claimed.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 3_000),
    ...dispatchMetadata()
  });
  await fixture.store.recordTutorDeliveryUnknown({
    jobId: claimed.job.id, workerId: 'capacity-worker', leaseToken: claimed.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 4_000)
  });

  for (const suffix of ['one', 'two']) {
    const activeThread = await createThread(fixture, `capacity-active-${suffix}`);
    await fixture.store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: activeThread.id,
      authorizedSessionId: fixture.sessionId, idempotencyKey: `capacity-active-${suffix}`,
      correlationId: `capacity-active-correlation-${suffix}`,
      message: `Active request ${suffix}.`, now: new Date(fixture.now.getTime() + 5_000)
    });
  }
  await assert.rejects(() => fixture.store.retryTutorTurnExplicitly({
    studentId: fixture.studentId, threadId: retryThread.id,
    previousJobId: claimed.job.id, authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'capacity-explicit-retry', correlationId: 'capacity-explicit-correlation',
    now: new Date(fixture.now.getTime() + 6_000)
  }), (error) => error.code === 'TUTOR_STUDENT_CAPACITY_REACHED');
});

test('MemoryStore rejects queue and lease bounds before reserving capacity', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'invalid-options');
  const base = {
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'invalid-options',
    correlationId: 'invalid-options-correlation', message: 'Do not enqueue this.',
    now: fixture.now
  };
  await assert.rejects(() => fixture.store.enqueueTutorTurn({ ...base, maxAttempts: 0 }),
    (error) => error.code === 'INVALID_TUTOR_QUEUE_OPTIONS');
  await assert.rejects(() => fixture.store.enqueueTutorTurn({ ...base, priority: 101 }),
    (error) => error.code === 'INVALID_TUTOR_QUEUE_OPTIONS');
  await assert.rejects(() => fixture.store.claimTutorTurnJob({ workerId: 'worker', leaseMs: 0 }),
    (error) => error.code === 'INVALID_TUTOR_CLAIM_OPTIONS');
  assert.equal(fixture.store.tutorTurnJobs.size, 0);
});

test('MemoryStore claim cancels revoked-session work and releases student capacity', async () => {
  const fixture = await memoryFixture();
  const threads = await Promise.all(['one', 'two', 'replacement']
    .map((suffix) => createThread(fixture, `revoked-capacity-${suffix}`)));
  for (let index = 0; index < 2; index += 1) {
    await fixture.store.enqueueTutorTurn({
      studentId: fixture.studentId, threadId: threads[index].id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `revoked-capacity-${index}`,
      correlationId: `revoked-capacity-correlation-${index}`,
      message: `Queued request ${index + 1}.`,
      now: new Date(fixture.now.getTime() + 1_000)
    });
  }
  await assert.rejects(() => fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: threads[2].id,
    authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'revoked-capacity-blocked',
    correlationId: 'revoked-capacity-blocked-correlation',
    message: 'Initially blocked request.', now: new Date(fixture.now.getTime() + 1_500)
  }), (error) => error.code === 'TUTOR_STUDENT_CAPACITY_REACHED');

  await fixture.store.revokeSession(fixture.sessionId, new Date(fixture.now.getTime() + 2_000));
  assert.equal(await fixture.store.claimTutorTurnJob({
    workerId: 'revoked-capacity-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 3_000)
  }), null);
  const jobs = [...fixture.store.tutorTurnJobs.values()]
    .filter((job) => job.studentId === fixture.studentId);
  assert.deepEqual(jobs.map((job) => job.status), ['CANCELLED', 'CANCELLED']);
  assert.equal(jobs.filter((job) => ['QUEUED', 'RUNNING', 'RETRY_WAIT']
    .includes(job.status)).length, 0);

  const replacementSessionId = 'tutor-session-replacement';
  await fixture.store.createSession({
    id: replacementSessionId, studentId: fixture.studentId, csrfTokenHash: 'replacement-csrf',
    createdAt: new Date(fixture.now.getTime() + 3_500),
    expiresAt: new Date(fixture.now.getTime() + 86_400_000), revokedAt: null
  });
  const replacement = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: threads[2].id,
    authorizedSessionId: replacementSessionId,
    idempotencyKey: 'revoked-capacity-replacement',
    correlationId: 'revoked-capacity-replacement-correlation',
    message: 'Replacement request.', now: new Date(fixture.now.getTime() + 4_000)
  });
  assert.equal(replacement.job.status, 'QUEUED');
});

test('MemoryStore claim cancels queued work after source entitlement is lost', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'source-entitlement-loss');
  const enqueued = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'source-entitlement-loss',
    correlationId: 'source-entitlement-loss-correlation',
    message: 'This source will become ineligible.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const submission = [...fixture.store.learningSubmissions.values()]
    .find((candidate) => candidate.id === fixture.snapshot.learningSubmissionId);
  fixture.store.attempts.get(submission.attemptId).phase = 'ACTIVE';
  assert.equal(await fixture.store.claimTutorTurnJob({
    workerId: 'source-entitlement-cleaner', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 2_000)
  }), null);
  assert.deepEqual({
    status: fixture.store.tutorTurnJobs.get(enqueued.job.id).status,
    outcomeCode: fixture.store.tutorTurnJobs.get(enqueued.job.id).outcomeCode,
    errorClass: fixture.store.tutorTurnJobs.get(enqueued.job.id).errorClass
  }, { status: 'CANCELLED', outcomeCode: 'CANCELLED', errorClass: 'permanent' });
});

test('MemoryStore serializes claim against tombstone and fences the returned lease', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'claim-tombstone-race');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'claim-tombstone-race',
    correlationId: 'claim-tombstone-race-correlation', message: 'Race this request.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const [claim, tombstoned] = await Promise.all([
    fixture.store.claimTutorTurnJob({
      workerId: 'claim-tombstone-worker', leaseMs: 10_000,
      now: new Date(fixture.now.getTime() + 2_000)
    }),
    fixture.store.tombstoneTutorThread({
      studentId: fixture.studentId, threadId: thread.id,
      now: new Date(fixture.now.getTime() + 2_000)
    })
  ]);
  assert.equal(tombstoned, true);
  assert.equal(fixture.store.tutorTurnJobs.values().next().value.status, 'CANCELLED');
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: claim.job.id, workerId: 'claim-tombstone-worker', leaseToken: claim.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 2_001),
    ...dispatchMetadata()
  }), false);
  assert.equal(await fixture.store.getTutorThreadBundle(fixture.studentId, thread.id), null);
});
