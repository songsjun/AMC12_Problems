import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { MemoryStore } from '../src/memory-store.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import {
  TUTOR_MAX_LIVE_THREADS_PER_STUDENT,
  TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION
} from '../src/question-tutor/store-contract.js';
import {
  computeTutorContextReleaseHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  tutorSha256
} from '../src/question-tutor/domain.js';

const fixtureUrl = new URL('./fixtures/tutor-contract-v2.json', import.meta.url);

async function memoryFixture({ batchConfirmed = false, openReview = false } = {}) {
  if (openReview && !batchConfirmed) throw new Error('Open Review Tutor fixtures require a committed batch.');
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
  const openReviewReleaseId = openReview ? randomUUID() : null;
  const openReviewReleaseHash = openReview ? '7'.repeat(64) : null;
  const sourceType = openReview ? 'OPEN_REVIEW' : 'INTERACTIVE_FINAL';
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
    sourceType, formId: context.formId,
    formVersion: context.formVersion, ...releaseBinding,
    contextSetId, contextArtifactSha256: context.contextArtifactSha256,
    approvalAuthorityId, approvalReceiptSetHash, openReviewReleaseHash
  });

  store.students.set(studentId, { id: studentId, displayName: 'Tutor student', createdAt: now });
  store.sessions.set(sessionId, {
    id: sessionId, studentId, csrfTokenHash: 'csrf', createdAt: now,
    expiresAt: new Date(now.getTime() + 86_400_000), revokedAt: null
  });
  store.attempts.set(attemptId, {
    id: attemptId, studentId, formId: context.formId, formVersion: context.formVersion,
    attemptMode: openReview ? 'OPEN_REVIEW' : 'TIMED',
    phase: openReview ? 'OPEN_REVIEW' : 'FINALIZED'
  });
  store.submissions.set(attemptId, openReview
    ? [] : [{ id: officialSubmissionId, attemptId, kind: 'FINAL' }]);
  if (!openReview) {
    store.submissionAnswers.set(officialSubmissionId, [{
      questionNumber: 1, selectedOption: 'C', correctOption: 'C',
      acceptedOptions: ['C'], isScored: true, isCorrect: true
    }]);
  }
  store.learningSubmissions.set(attemptId, {
    id: learningSubmissionId, studentId, attemptId,
    officialSubmissionId: openReview ? null : officialSubmissionId,
    officialSubmissionKind: openReview ? null : 'FINAL',
    attemptMode: openReview ? 'OPEN_REVIEW' : 'TIMED', openReviewReleaseId,
    formId: context.formId, formVersion: context.formVersion,
    sourceType, lifecycleStatus: 'COMMITTED',
    currentVersion: 1, deletionGeneration: 0, createdAt: now, updatedAt: now
  });
  if (openReview) {
    store.openReviewReleases.set(openReviewReleaseId, {
      id: openReviewReleaseId, formId: context.formId, formVersion: context.formVersion,
      contextSetId, status: 'ACTIVE', releaseHash: openReviewReleaseHash
    });
  }
  store.learningVersions.set(learningSubmissionId, [{
    id: versionId, learningSubmissionId, versionNumber: 1,
    formId: context.formId, formVersion: context.formVersion,
    contextStatus: 'CONTEXT_READY', contextSetId,
    evidenceHash: context.evidenceHash, batchId, createdAt: now
  }]);
  store.learningResponses.set(versionId, [response]);
  if (batchConfirmed) {
    store.learningBatchResults.set(batchId, {
      id: batchResultId, batchId, learningSubmissionVersionId: versionId,
      items: [{
        questionNumber: 1, selectedOption: 'C', correctOption: 'C',
        acceptedOptions: ['C'], isScored: true, isCorrect: true
      }]
    });
  }
  store.approvedContextSets.set(contextSetId, {
    id: contextSetId, artifactSetHash: context.contextArtifactSha256,
    sealed: true, declaredQuestionCount: 1, active: true,
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
  store.forms.set(`${context.formId}\u0000${context.formVersion}`, {
    id: context.formId, version: context.formVersion,
    contentSealed: true, declaredQuestionCount: 25,
    manifestHash: releaseBinding.manifestHash,
    contentHash: releaseBinding.contentHash,
    questionBundleHash: releaseBinding.questionBundleHash
  });
  store.analysisRuns.set(versionId, {
    id: analysisRunId, learningSubmissionVersionId: versionId, contextSetId,
    versionNumber: 1, inputHash: '2'.repeat(64), evidenceHash: context.evidenceHash,
    deletionGeneration: 0, analysisContractVersion: 'amc-analysis-contract-v2',
    status: 'COMPLETE', createdAt: now, completedAt: now
  });
  store.questionAnalyses.set(analysisRunId, [{
    questionNumber: 1, questionInputHash: analysisQuestionInputHash,
    questionContextHash: analysisQuestionContextHash, status: 'SUCCEEDED'
  }]);
  store.learningReports.set(versionId, {
    id: reportId, analysisRunId, learningSubmissionVersionId: versionId,
    status: 'COMPLETE', generatedAt: now, summary: {}, reportHash
  });
  if (batchConfirmed) {
    store.learningBatches.set(batchId, {
      id: batchId, studentId, attemptId, learningSubmissionId,
      formId: context.formId, formVersion: context.formVersion, sourceType,
      status: 'COMMITTED', committedVersionId: versionId, committedVersionNumber: 1,
      deletionState: 'ACTIVE', deletionGeneration: 0
    });
  }
  const snapshotHash = computeTutorSnapshotHash(context);
  const snapshot = {
    id: randomUUID(), studentId, learningSubmissionId,
    learningSubmissionVersionId: versionId, versionNumber: 1,
    formId: context.formId, formVersion: context.formVersion,
    sourceType, questionNumber: 1, contextSetId,
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
  return { store, snapshot, studentId, sessionId, now, batchId, openReviewReleaseId };
}

async function createThread(fixture, suffix) {
  await fixture.store.createTutorSnapshot(fixture.snapshot);
  return fixture.store.createTutorThread({
    id: randomUUID(), studentId: fixture.studentId, snapshotId: fixture.snapshot.id,
    idempotencyKey: `thread-${suffix}`, now: fixture.now
  });
}

function rootThreadInput(fixture, overrides = {}) {
  return {
    studentId: fixture.studentId,
    authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: fixture.snapshot.versionNumber,
    questionNumber: fixture.snapshot.questionNumber,
    idempotencyKey: 'root-thread-create',
    snapshotId: randomUUID(),
    threadId: randomUUID(),
    now: fixture.now,
    ...overrides
  };
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

test('MemoryStore derives and atomically creates a root Tutor aggregate from path identity only', async () => {
  const fixture = await memoryFixture();
  const input = rootThreadInput(fixture);
  const created = await fixture.store.createTutorRootThread(input);
  assert.equal(created.replayed, false);
  assert.equal(created.snapshot.id, input.snapshotId);
  assert.equal(created.thread.id, input.threadId);
  assert.equal(created.thread.snapshotId, created.snapshot.id);
  assert.equal(created.snapshot.snapshotPayload.question.promptMarkdown,
    fixture.snapshot.snapshotPayload.question.promptMarkdown);
  assert.equal(created.snapshot.snapshotPayload.question.solutions.length, 2);
  assert.equal(fixture.store.tutorSnapshots.size, 1);
  assert.equal(fixture.store.tutorThreads.size, 1);
  assert.equal(fixture.store.tutorMessages.size, 0);
  assert.equal(fixture.store.tutorTurnJobs.size, 0);

  await fixture.store.revokeSession(fixture.sessionId,
    new Date(fixture.now.getTime() + 1_000));
  const replacementSessionId = 'tutor-root-replay-session';
  await fixture.store.createSession({
    id: replacementSessionId, studentId: fixture.studentId, csrfTokenHash: 'root-replay-csrf',
    createdAt: new Date(fixture.now.getTime() + 1_500),
    expiresAt: new Date(fixture.now.getTime() + 86_400_000), revokedAt: null
  });
  const replay = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    authorizedSessionId: replacementSessionId,
    snapshotId: randomUUID(),
    threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 2_000)
  }));
  assert.equal(replay.replayed, true);
  assert.equal(replay.snapshot.id, created.snapshot.id);
  assert.equal(replay.thread.id, created.thread.id);
  assert.equal(fixture.store.tutorSnapshots.size, 1);
  assert.equal(fixture.store.tutorThreads.size, 1);
});

test('MemoryStore root creation fails closed with no half aggregate for stale authority', async () => {
  const cases = [
    ['session', (fixture) => {
      fixture.store.sessions.get(fixture.sessionId).revokedAt = fixture.now;
    }],
    ['report', (fixture) => {
      fixture.store.learningReports.get(fixture.snapshot.learningSubmissionVersionId).status = 'FAILED';
    }],
    ['source', (fixture) => {
      const submission = [...fixture.store.learningSubmissions.values()]
        .find((candidate) => candidate.id === fixture.snapshot.learningSubmissionId);
      submission.lifecycleStatus = 'DELETED';
    }],
    ['release', (fixture) => {
      fixture.store.forms.get(
        `${fixture.snapshot.formId}\u0000${fixture.snapshot.formVersion}`).manifestHash = 'a'.repeat(64);
    }]
  ];
  for (const [label, mutate] of cases) {
    const fixture = await memoryFixture();
    mutate(fixture);
    await assert.rejects(() => fixture.store.createTutorRootThread(
      rootThreadInput(fixture, { idempotencyKey: `root-stale-${label}` })
    ), (error) => error.code === 'TUTOR_ROOT_NOT_AVAILABLE', label);
    assert.equal(fixture.store.tutorSnapshots.size, 0, `${label} left a snapshot`);
    assert.equal(fixture.store.tutorThreads.size, 0, `${label} left a thread`);
  }
});

test('MemoryStore concurrent root retries converge on one server-owned identity', async () => {
  const fixture = await memoryFixture();
  const results = await Promise.all(Array.from({ length: 8 }, () =>
    fixture.store.createTutorRootThread(rootThreadInput(fixture, {
      idempotencyKey: 'root-concurrent', snapshotId: randomUUID(), threadId: randomUUID()
    }))));
  assert.equal(new Set(results.map((result) => result.snapshot.id)).size, 1);
  assert.equal(new Set(results.map((result) => result.thread.id)).size, 1);
  assert.equal(results.filter((result) => result.replayed === false).length, 1);
  assert.equal(fixture.store.tutorSnapshots.size, 1);
  assert.equal(fixture.store.tutorThreads.size, 1);
});

test('MemoryStore atomically budgets new Tutor enqueue and ordinal retry work', async () => {
  const fixture = await memoryFixture();
  const first = await createThread(fixture, 'budget-first');
  const second = await createThread(fixture, 'budget-second');
  const third = await createThread(fixture, 'budget-third');
  const providerBudget = { studentLimit: 2, globalLimit: 100 };
  const firstInput = {
    studentId: fixture.studentId, threadId: first.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'budget-first-turn',
    correlationId: 'budget-first-correlation', message: 'Charge this request once.',
    providerBudget, now: fixture.now
  };
  const charged = await fixture.store.enqueueTutorTurn(firstInput);
  const replay = await fixture.store.enqueueTutorTurn({
    ...firstInput, jobId: randomUUID(), messageId: randomUUID(),
    correlationId: 'budget-first-replay-correlation'
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.job.id, charged.job.id);
  await fixture.store.tombstoneTutorThread({
    studentId: fixture.studentId, threadId: first.id,
    now: new Date(fixture.now.getTime() + 1_000)
  });
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: second.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'budget-second-turn',
    correlationId: 'budget-second-correlation', message: 'Use the second unit.',
    providerBudget, now: fixture.now
  });
  await fixture.store.tombstoneTutorThread({
    studentId: fixture.studentId, threadId: second.id,
    now: new Date(fixture.now.getTime() + 1_000)
  });
  await assert.rejects(() => fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: third.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'budget-third-turn',
    correlationId: 'budget-third-correlation', message: 'Exceed the student budget.',
    providerBudget, now: fixture.now
  }), (error) => error.code === 'TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED'
    && Number.isSafeInteger(error.retryAfterSeconds) && error.retryAfterSeconds > 0);
  assert.equal(fixture.store.tutorTurnJobs.size, 2);
  assert.equal([...fixture.store.studentResourceBudgetWindows.values()][0].usedUnits, 2);

  const retryFixture = await memoryFixture();
  const retryThread = await createThread(retryFixture, 'budget-retry');
  const retryBudget = { studentLimit: 2, globalLimit: 100 };
  await retryFixture.store.enqueueTutorTurn({
    studentId: retryFixture.studentId, threadId: retryThread.id,
    authorizedSessionId: retryFixture.sessionId, idempotencyKey: 'budget-retry-parent',
    correlationId: 'budget-retry-parent-correlation', message: 'Make this terminal.',
    providerBudget: retryBudget, now: retryFixture.now
  });
  const parent = await retryFixture.store.claimTutorTurnJob({
    workerId: 'budget-retry-worker', leaseMs: 10_000,
    now: new Date(retryFixture.now.getTime() + 1_000)
  });
  await retryFixture.store.markTutorTurnDispatched({
    jobId: parent.job.id, workerId: 'budget-retry-worker', leaseToken: parent.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(retryFixture.now.getTime() + 2_000),
    ...dispatchMetadata()
  });
  await retryFixture.store.recordTutorDeliveryUnknown({
    jobId: parent.job.id, workerId: 'budget-retry-worker', leaseToken: parent.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(retryFixture.now.getTime() + 3_000)
  });
  const retryInput = {
    studentId: retryFixture.studentId,
    learningSubmissionId: retryFixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, threadId: retryThread.id,
    requestOrdinal: 1, authorizedSessionId: retryFixture.sessionId,
    idempotencyKey: 'budget-retry-child', correlationId: 'budget-retry-child-correlation',
    jobId: randomUUID(), providerBudget: retryBudget,
    now: new Date(retryFixture.now.getTime() + 4_000)
  };
  const retried = await retryFixture.store.retryTutorTurnByOrdinal(retryInput);
  const retriedReplay = await retryFixture.store.retryTutorTurnByOrdinal({
    ...retryInput, jobId: randomUUID(), correlationId: 'budget-retry-replay-correlation'
  });
  assert.equal(retriedReplay.replayed, true);
  assert.equal(retriedReplay.job.id, retried.job.id);
  assert.equal([...retryFixture.store.studentResourceBudgetWindows.values()][0].usedUnits, 2);
});

test('MemoryStore provider budget is global and concurrent unique keys cannot overspend', async () => {
  for (const concurrent of [false, true]) {
    const fixture = await memoryFixture();
    const threads = await Promise.all(Array.from({ length: concurrent ? 5 : 2 }, (_, index) =>
      createThread(fixture, `global-budget-${concurrent}-${index}`)));
    const inputs = threads.map((thread, index) => ({
      studentId: fixture.studentId, threadId: thread.id,
      authorizedSessionId: fixture.sessionId,
      idempotencyKey: `global-budget-turn-${concurrent}-${index}`,
      correlationId: `global-budget-correlation-${concurrent}-${index}`,
      message: `Global budget request ${index}.`,
      providerBudget: concurrent
        ? { studentLimit: 1, globalLimit: 100 }
        : { studentLimit: 100, globalLimit: 1 },
      now: fixture.now
    }));
    const results = concurrent
      ? await Promise.allSettled(inputs.map((input) => fixture.store.enqueueTutorTurn(input)))
      : [
        { status: 'fulfilled', value: await fixture.store.enqueueTutorTurn(inputs[0]) },
        await fixture.store.tombstoneTutorThread({
          studentId: fixture.studentId, threadId: threads[0].id, now: fixture.now
        }).then(() => fixture.store.enqueueTutorTurn(inputs[1]))
          .then((value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason }))
      ];
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = results.find((result) => result.status === 'rejected').reason;
    assert.equal(rejected.code, concurrent
      ? 'TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED'
      : 'TUTOR_GLOBAL_PROVIDER_WORK_RATE_LIMITED');
    assert.ok(rejected.retryAfterSeconds > 0);
    assert.equal([...fixture.store.globalResourceBudgetWindows.values()][0].usedUnits, 1);
  }
});

test('MemoryStore enforces live Tutor root/fork caps, replay bypass, and tombstone release', async () => {
  const fixture = await memoryFixture();
  assert.equal(TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION, 20);
  assert.equal(TUTOR_MAX_LIVE_THREADS_PER_STUDENT, 100);
  const parentResult = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'cap-parent-root'
  }));
  const parent = parentResult.thread;
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: parent.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'cap-parent-turn',
    correlationId: 'cap-parent-correlation', message: 'Create a successful fork head.',
    now: fixture.now
  });
  const claim = await fixture.store.claimTutorTurnJob({
    workerId: 'cap-parent-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 1_000)
  });
  await fixture.store.markTutorTurnDispatched({
    jobId: claim.job.id, workerId: 'cap-parent-worker', leaseToken: claim.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 2_000),
    ...dispatchMetadata()
  });
  await fixture.store.completeTutorTurnJob({
    jobId: claim.job.id, workerId: 'cap-parent-worker', leaseToken: claim.job.leaseToken,
    expectedDeletionGeneration: 0,
    gatewayResult: gatewaySuccess(claim.job, 'A durable successful head.'), latencyMs: 20,
    now: new Date(fixture.now.getTime() + 3_000)
  });
  const concurrent = await Promise.allSettled(Array.from({ length: 24 }, (_, index) =>
    fixture.store.createTutorRootThread(rootThreadInput(fixture, {
      idempotencyKey: `cap-root-${index}`, snapshotId: randomUUID(), threadId: randomUUID(),
      now: new Date(fixture.now.getTime() + 4_000 + index)
    }))));
  assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 19);
  assert.equal(fixture.store.tutorThreads.size, 20);
  assert.equal(concurrent.filter((result) => result.status === 'rejected')
    .every((result) => result.reason.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED'), true);
  const replay = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'cap-parent-root', snapshotId: randomUUID(), threadId: randomUUID()
  }));
  assert.equal(replay.replayed, true);
  await assert.rejects(() => fixture.store.createTutorForkFromHead({
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, parentThreadId: parent.id,
    idempotencyKey: 'cap-fork-blocked', threadId: randomUUID(), now: fixture.now
  }), (error) => error.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED');
  const released = concurrent.find((result) => result.status === 'fulfilled').value.thread;
  await fixture.store.tombstoneTutorThreadByPath({
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, threadId: released.id,
    idempotencyKey: 'cap-release-delete', now: new Date(fixture.now.getTime() + 5_000)
  });
  const fork = await fixture.store.createTutorForkFromHead({
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, parentThreadId: parent.id,
    idempotencyKey: 'cap-fork-after-release', threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 6_000)
  });
  assert.equal(fork.thread.forkedFromTurnJobId, claim.job.id);

  const globalFixture = await memoryFixture();
  for (let index = 0; index < TUTOR_MAX_LIVE_THREADS_PER_STUDENT; index += 1) {
    globalFixture.store.tutorThreads.set(randomUUID(), {
      studentId: globalFixture.studentId, status: 'OPEN',
      learningSubmissionVersionId: randomUUID(), questionNumber: (index % 25) + 1
    });
  }
  await assert.rejects(() => globalFixture.store.createTutorRootThread(
    rootThreadInput(globalFixture, { idempotencyKey: 'global-thread-cap' })
  ), (error) => error.code === 'TUTOR_STUDENT_THREAD_CAP_REACHED');
});

test('MemoryStore summary cursor is exact and never exposes Tutor context or messages', async () => {
  const fixture = await memoryFixture();
  const threads = await Promise.all(Array.from({ length: 4 }, (_, index) =>
    createThread(fixture, `summary-${index}`)));
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: threads[0].id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'summary-latest-turn',
    correlationId: 'summary-latest-correlation', message: 'SECRET MESSAGE MUST NOT LEAK',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const first = await fixture.store.listTutorThreadSummaries(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1, { limit: 2 }
  );
  assert.equal(first.length, 3, 'Store returns limit+1 so application can encode a cursor');
  const publicPage = first.slice(0, 2);
  const serialized = JSON.stringify(first);
  for (const forbidden of [
    'messages', 'requests', 'snapshotHash', 'contextHash',
    'threadLineageHash', 'SECRET MESSAGE MUST NOT LEAK'
  ]) assert.equal(serialized.includes(forbidden), false, forbidden);
  first.forEach((summary) => {
    assert.equal(Object.hasOwn(summary, 'question'), false);
    assert.deepEqual(Object.keys(summary).sort(), ['latestRequest', 'sourceEntitled', 'thread']);
    assert.equal(summary.sourceEntitled, true);
  });
  assert.equal(first[0].thread.id, threads[0].id);
  assert.equal(first[0].latestRequest.status, 'QUEUED');
  const cursorSource = publicPage.at(-1).thread;
  const second = await fixture.store.listTutorThreadSummaries(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1,
    { limit: 2, cursor: { updatedAt: cursorSource.updatedAt, threadId: cursorSource.id } }
  );
  assert.equal(new Set([...publicPage, ...second].map((item) => item.thread.id)).size, 4);
  assert.equal(second.some((item) => publicPage
    .some((prior) => prior.thread.id === item.thread.id)), false);
  await assert.rejects(() => fixture.store.listTutorThreadSummaries(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1, { limit: 21 }
  ), (error) => error.code === 'INVALID_TUTOR_SUMMARY_PAGE');
});

test('MemoryStore lists scoped bundles and Store-selects the successful fork head', async () => {
  const fixture = await memoryFixture();
  const parent = await createThread(fixture, 'path-fork-parent');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: parent.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'path-fork-parent-turn',
    correlationId: 'path-fork-parent-correlation', message: 'Explain this solution.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const claimed = await fixture.store.claimTutorTurnJob({
    workerId: 'path-fork-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 2_000)
  });
  await fixture.store.markTutorTurnDispatched({
    jobId: claimed.job.id, workerId: 'path-fork-worker',
    leaseToken: claimed.job.leaseToken, expectedDeletionGeneration: 0,
    now: new Date(fixture.now.getTime() + 3_000), ...dispatchMetadata()
  });
  await fixture.store.completeTutorTurnJob({
    jobId: claimed.job.id, workerId: 'path-fork-worker',
    leaseToken: claimed.job.leaseToken, expectedDeletionGeneration: 0,
    gatewayResult: gatewaySuccess(claimed.job, 'Use the invariant at every algebra step.'),
    latencyMs: 100, now: new Date(fixture.now.getTime() + 4_000)
  });
  const input = {
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, parentThreadId: parent.id,
    idempotencyKey: 'path-fork-create', threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 5_000)
  };
  const created = await fixture.store.createTutorForkFromHead(input);
  assert.equal(created.replayed, false);
  assert.equal(created.thread.forkedFromThreadId, parent.id);
  assert.equal(created.thread.forkedFromTurnJobId, claimed.job.id);
  assert.equal(created.thread.successfulTurnCount, 0);
  const replay = await fixture.store.createTutorForkFromHead({
    ...input, threadId: randomUUID(), now: new Date(fixture.now.getTime() + 6_000)
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.thread.id, created.thread.id);
  const listed = await fixture.store.listTutorThreadBundles(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1
  );
  assert.deepEqual(new Set(listed.map((bundle) => bundle.thread.id)),
    new Set([parent.id, created.thread.id]));
  listed.forEach(assertStudentSafeBundle);
  assert.deepEqual(await fixture.store.listTutorThreadBundles(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 2, 1
  ), []);
});

test('MemoryStore resolves retry parents by terminal ordinal and replays server identities', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'ordinal-retry');
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'ordinal-parent',
    correlationId: 'ordinal-parent-correlation', message: 'Retry this request safely.',
    now: new Date(fixture.now.getTime() + 1_000)
  });
  const claimed = await fixture.store.claimTutorTurnJob({
    workerId: 'ordinal-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 2_000)
  });
  await fixture.store.markTutorTurnDispatched({
    jobId: claimed.job.id, workerId: 'ordinal-worker', leaseToken: claimed.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 3_000),
    ...dispatchMetadata()
  });
  await fixture.store.recordTutorDeliveryUnknown({
    jobId: claimed.job.id, workerId: 'ordinal-worker', leaseToken: claimed.job.leaseToken,
    expectedDeletionGeneration: 0, now: new Date(fixture.now.getTime() + 4_000)
  });
  const scope = {
    studentId: fixture.studentId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, threadId: thread.id,
    requestOrdinal: 1, authorizedSessionId: fixture.sessionId,
    idempotencyKey: 'ordinal-retry-create',
    correlationId: 'ordinal-retry-correlation', jobId: randomUUID(),
    now: new Date(fixture.now.getTime() + 5_000)
  };
  const retried = await fixture.store.retryTutorTurnByOrdinal(scope);
  assert.equal(retried.job.retryOfJobId, claimed.job.id);
  assert.equal(retried.job.requestOrdinal, 2);
  const replacementSessionId = 'ordinal-retry-new-session';
  await fixture.store.createSession({
    id: replacementSessionId, studentId: fixture.studentId, csrfTokenHash: 'ordinal-csrf',
    createdAt: new Date(fixture.now.getTime() + 5_500),
    expiresAt: new Date(fixture.now.getTime() + 86_400_000), revokedAt: null
  });
  const replay = await fixture.store.retryTutorTurnByOrdinal({
    ...scope, authorizedSessionId: replacementSessionId,
    correlationId: 'ordinal-retry-new-correlation', jobId: randomUUID(),
    now: new Date(fixture.now.getTime() + 6_000)
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.job.id, retried.job.id);
  assert.equal(replay.job.correlationId, retried.job.correlationId);
  await assert.rejects(() => fixture.store.retryTutorTurnByOrdinal({
    ...scope, requestOrdinal: 99, idempotencyKey: 'ordinal-not-terminal',
    jobId: randomUUID()
  }), (error) => error.code === 'TUTOR_RETRY_NOT_ALLOWED');
});

test('MemoryStore path-scoped tombstone is atomic and idempotent across sessions', async () => {
  const fixture = await memoryFixture();
  const thread = await createThread(fixture, 'path-delete');
  const input = {
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, threadId: thread.id,
    idempotencyKey: 'path-delete-request',
    now: new Date(fixture.now.getTime() + 1_000)
  };
  assert.equal(await fixture.store.tombstoneTutorThreadByPath({
    ...input, versionNumber: 2, idempotencyKey: 'path-delete-wrong-scope'
  }), false);
  assert.equal(fixture.store.tutorThreads.get(thread.id).status, 'OPEN');
  assert.equal(await fixture.store.tombstoneTutorThreadByPath(input), true);
  assert.equal(fixture.store.tutorThreads.get(thread.id).status, 'TOMBSTONED');
  assert.equal(fixture.store.tutorThreads.get(thread.id).deletionGeneration, 1);
  const replacementSessionId = 'path-delete-replay-session';
  await fixture.store.createSession({
    id: replacementSessionId, studentId: fixture.studentId, csrfTokenHash: 'delete-csrf',
    createdAt: new Date(fixture.now.getTime() + 2_000),
    expiresAt: new Date(fixture.now.getTime() + 86_400_000), revokedAt: null
  });
  assert.equal(await fixture.store.tombstoneTutorThreadByPath({
    ...input, authorizedSessionId: replacementSessionId,
    now: new Date(fixture.now.getTime() + 3_000)
  }), true);
  assert.equal(fixture.store.tutorThreads.get(thread.id).deletionGeneration, 1,
    'delete replay cannot advance the generation twice');
  await assert.rejects(() => fixture.store.tombstoneTutorThreadByPath({
    ...input, authorizedSessionId: replacementSessionId,
    questionNumber: 2, now: new Date(fixture.now.getTime() + 4_000)
  }), (error) => error.code === 'IDEMPOTENCY_KEY_REUSED');
  assert.deepEqual(await fixture.store.listTutorThreadBundles(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1
  ), []);
});

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

test('MemoryStore keeps BATCH_CONFIRMED Tutor live after raw cleanup while pinning immutable authority', async () => {
  const fixture = await memoryFixture({ batchConfirmed: true });
  const stored = await fixture.store.createTutorSnapshot(fixture.snapshot);
  assert.equal(stored.scoringOrigin, 'BATCH_CONFIRMED');
  assert.equal(stored.officialSubmissionId, null);
  assert.ok(stored.batchResultId);
  const root = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'batch-confirmed-root'
  }));
  assert.equal(root.snapshot.id, stored.id);
  assert.equal(root.snapshot.scoringOrigin, 'BATCH_CONFIRMED');
  assert.equal(root.snapshot.batchResultId, stored.batchResultId);

  const rawBatch = fixture.store.learningBatches.get(fixture.batchId);
  rawBatch.deletionState = 'COMPLETE';
  rawBatch.deletionGeneration = 9;
  assert.equal(root.snapshot.initialDeletionGeneration, 0,
    'Tutor generation is the learning submission generation, never the raw batch generation');
  const replay = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'batch-confirmed-root', snapshotId: randomUUID(), threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 500)
  }));
  assert.equal(replay.replayed, true);
  assert.equal(replay.thread.id, root.thread.id);
  const secondRoot = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'batch-confirmed-after-cleanup',
    snapshotId: randomUUID(), threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 1_000)
  }));
  assert.equal(secondRoot.replayed, false);
  assert.equal(secondRoot.snapshot.id, root.snapshot.id,
    'raw cleanup reuses the immutable semantic snapshot');
  assert.ok(await fixture.store.getTutorThreadBundle(fixture.studentId, root.thread.id));
  assert.equal((await fixture.store.listTutorThreadBundles(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1
  )).length, 2);
  assert.equal((await fixture.store.listTutorThreadSummaries(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1, { limit: 20 }
  )).length, 2);
  const enqueued = await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: root.thread.id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'batch-after-cleanup-turn',
    correlationId: 'batch-after-cleanup-correlation',
    message: 'Compare my batch-confirmed reasoning with both solutions.',
    now: new Date(fixture.now.getTime() + 2_000)
  });
  assert.equal(enqueued.job.status, 'QUEUED');
  const claimed = await fixture.store.claimTutorTurnJob({
    workerId: 'batch-after-cleanup-worker', leaseMs: 10_000,
    now: new Date(fixture.now.getTime() + 3_000)
  });
  assert.equal(claimed.job.id, enqueued.job.id);
  assert.equal(await fixture.store.markTutorTurnDispatched({
    jobId: claimed.job.id, workerId: claimed.job.leaseOwner,
    leaseToken: claimed.job.leaseToken, expectedDeletionGeneration: 0,
    ...dispatchMetadata(), now: new Date(fixture.now.getTime() + 4_000)
  }), true, 'raw batch cleanup cannot revoke provider dispatch');

  const result = fixture.store.learningBatchResults.get(fixture.batchId);
  result.items[0].acceptedOptions = ['B'];
  const drift = { ...structuredClone(fixture.snapshot), id: randomUUID() };
  await assert.rejects(() => fixture.store.createTutorSnapshot(drift),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');
  result.items[0].acceptedOptions = ['C'];

  const wrongAuthority = structuredClone(fixture.snapshot);
  wrongAuthority.id = randomUUID();
  wrongAuthority.batchResultId = randomUUID();
  await assert.rejects(() => fixture.store.createTutorSnapshot(wrongAuthority),
    (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');

  rawBatch.committedVersionId = randomUUID();
  await assert.rejects(() => fixture.store.createTutorSnapshot({
    ...structuredClone(fixture.snapshot), id: randomUUID()
  }), (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE',
  'the raw batch committed marker must still point at the exact immutable learning version');
  rawBatch.committedVersionId = fixture.snapshot.learningSubmissionVersionId;
});

test('MemoryStore learning deletion and OPEN_REVIEW revoke still hide Tutor and prevent dispatch', async () => {
  const deleted = await memoryFixture({ batchConfirmed: true });
  const deletedRoot = await deleted.store.createTutorRootThread(rootThreadInput(deleted, {
    idempotencyKey: 'learning-delete-root'
  }));
  await deleted.store.enqueueTutorTurn({
    studentId: deleted.studentId, threadId: deletedRoot.thread.id,
    authorizedSessionId: deleted.sessionId, idempotencyKey: 'learning-delete-turn',
    correlationId: 'learning-delete-correlation', message: 'Do not dispatch after deletion.',
    now: new Date(deleted.now.getTime() + 1_000)
  });
  const submission = [...deleted.store.learningSubmissions.values()]
    .find((candidate) => candidate.id === deleted.snapshot.learningSubmissionId);
  submission.lifecycleStatus = 'DELETED';
  submission.deletionGeneration += 1;
  assert.equal(await deleted.store.getTutorThreadBundle(deleted.studentId, deletedRoot.thread.id), null);
  const deletedSummaries = await deleted.store.listTutorThreadSummaries(
    deleted.studentId, deleted.snapshot.learningSubmissionId, 1, 1, { limit: 20 }
  );
  assert.equal(deletedSummaries.length, 1);
  assert.equal(deletedSummaries[0].sourceEntitled, false);
  assert.equal(deletedSummaries[0].latestRequest, null);
  assert.equal(await deleted.store.claimTutorTurnJob({
    workerId: 'learning-delete-worker', leaseMs: 10_000,
    now: new Date(deleted.now.getTime() + 2_000)
  }), null);
  assert.equal([...deleted.store.tutorTurnJobs.values()][0].status, 'CANCELLED');

  const revoked = await memoryFixture({ batchConfirmed: true, openReview: true });
  const revokedRoot = await revoked.store.createTutorRootThread(rootThreadInput(revoked, {
    idempotencyKey: 'open-review-revoke-root'
  }));
  const revokedTurn = await revoked.store.enqueueTutorTurn({
    studentId: revoked.studentId, threadId: revokedRoot.thread.id,
    authorizedSessionId: revoked.sessionId, idempotencyKey: 'open-review-revoke-turn',
    correlationId: 'open-review-revoke-correlation', message: 'Do not dispatch after revoke.',
    now: new Date(revoked.now.getTime() + 1_000)
  });
  const revokedClaim = await revoked.store.claimTutorTurnJob({
    workerId: 'open-review-revoke-worker', leaseMs: 10_000,
    now: new Date(revoked.now.getTime() + 2_000)
  });
  assert.equal(revokedClaim.job.id, revokedTurn.job.id);
  revoked.store.openReviewReleases.get(revoked.openReviewReleaseId).status = 'REVOKED';
  assert.equal(await revoked.store.getTutorThreadBundle(revoked.studentId, revokedRoot.thread.id), null);
  assert.deepEqual(await revoked.store.listTutorThreadBundles(
    revoked.studentId, revoked.snapshot.learningSubmissionId, 1, 1
  ), []);
  assert.equal(await revoked.store.markTutorTurnDispatched({
    jobId: revokedClaim.job.id, workerId: revokedClaim.job.leaseOwner,
    leaseToken: revokedClaim.job.leaseToken, expectedDeletionGeneration: 0,
    ...dispatchMetadata(), now: new Date(revoked.now.getTime() + 3_000)
  }), false);
});

test('MemoryStore stale-source summaries remain deletable and retained rows still obey thread caps', async () => {
  const fixture = await memoryFixture({ batchConfirmed: true, openReview: true });
  const roots = [];
  for (let index = 0; index < TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION; index += 1) {
    roots.push((await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
      idempotencyKey: `stale-cap-root-${index}`, snapshotId: randomUUID(),
      threadId: randomUUID(), now: new Date(fixture.now.getTime() + index)
    }))).thread);
  }
  await fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: roots[0].id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'stale-cap-request',
    correlationId: 'stale-cap-correlation', message: 'This request must be redacted after revoke.',
    now: new Date(fixture.now.getTime() + 100)
  });
  await assert.rejects(() => fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'stale-cap-overflow', snapshotId: randomUUID(), threadId: randomUUID()
  })), (error) => error.code === 'TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED');

  fixture.store.openReviewReleases.get(fixture.openReviewReleaseId).status = 'REVOKED';
  const stale = await fixture.store.listTutorThreadSummaries(
    fixture.studentId, fixture.snapshot.learningSubmissionId, 1, 1, { limit: 20 }
  );
  assert.equal(stale.length, TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION);
  assert.equal(stale.every((summary) => summary.sourceEntitled === false
    && summary.latestRequest === null), true);
  assert.equal(await fixture.store.getTutorThreadBundle(fixture.studentId, roots[0].id), null);
  await assert.rejects(() => fixture.store.enqueueTutorTurn({
    studentId: fixture.studentId, threadId: roots[1].id,
    authorizedSessionId: fixture.sessionId, idempotencyKey: 'stale-cap-blocked-turn',
    correlationId: 'stale-cap-blocked-correlation', message: 'This must remain blocked.',
    now: new Date(fixture.now.getTime() + 200)
  }), (error) => error.code === 'TUTOR_SOURCE_NOT_LIVE');

  assert.equal(await fixture.store.tombstoneTutorThreadByPath({
    studentId: fixture.studentId, authorizedSessionId: fixture.sessionId,
    learningSubmissionId: fixture.snapshot.learningSubmissionId,
    versionNumber: 1, questionNumber: 1, threadId: roots[0].id,
    idempotencyKey: 'stale-cap-delete', now: new Date(fixture.now.getTime() + 300)
  }), true);
  const retained = [...fixture.store.tutorThreads.values()].filter((thread) =>
    thread.studentId === fixture.studentId && thread.status !== 'TOMBSTONED');
  assert.equal(retained.length, TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION - 1);
  fixture.store.openReviewReleases.get(fixture.openReviewReleaseId).status = 'ACTIVE';
  const replacement = await fixture.store.createTutorRootThread(rootThreadInput(fixture, {
    idempotencyKey: 'stale-cap-replacement', snapshotId: randomUUID(), threadId: randomUUID(),
    now: new Date(fixture.now.getTime() + 400)
  }));
  assert.equal(replacement.thread.status, 'OPEN');
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
