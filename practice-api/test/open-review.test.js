import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { buildApp } from '../src/app.js';
import { segmentBatchGatewaySources } from '../src/batch-ingest/domain.js';
import { BatchExtractionWorker } from '../src/batch-ingest/worker.js';
import { ApiError } from '../src/errors.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { MemoryStore } from '../src/memory-store.js';
import { OPEN_REVIEW_STATUS } from '../src/open-review/domain.js';
import { PracticeService } from '../src/service.js';
import {
  approvedContextArtifact, approvalReceiptsForArtifact, FakeInferenceClient,
  learningReviewForm, TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

const NOW = new Date('2026-08-20T12:00:00.000Z');
const ALL_QUESTIONS = Array.from({ length: 25 }, (_, index) => index + 1);
const APP_CONFIG = {
  basePath: '/api/amc12', bodyLimit: 64 * 1024,
  sessionSecret: 'test-cookie-secret-that-is-long-enough-for-cookie-signing',
  sessionTtlMs: 12 * 60 * 60 * 1000,
  cookieName: 'amc_session', csrfCookieName: 'amc_csrf', cookiePath: '/api/amc12',
  secureCookies: false, trustedProxy: 'loopback', corsOrigin: null, reasoningWritesPerMinute: 30
};

function cookies(response) {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values]).map((value) => value.split(';')[0]).join('; ');
}

async function openReviewFixture(t, { privateStorage = false } = {}) {
  let privateUploadStore = null;
  if (privateStorage) {
    const root = await mkdtemp(join(tmpdir(), 'amc-open-review-'));
    t.after(async () => { await rm(root, { recursive: true, force: true }); });
    privateUploadStore = new PrivateUploadStore({ root, highWatermarkPercent: 100 });
    await privateUploadStore.init();
  }
  const store = new MemoryStore();
  const service = new PracticeService({
    store, privateUploadStore,
    authPepper: 'test-pepper-that-is-long-enough-for-a-safe-local-test-suite',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    allowTestOnlyImport: true, allowTestOnlyPublish: true,
    batchIntakeEnabled: true,
    clock: () => new Date(NOW)
  });
  const form = learningReviewForm();
  await store.importForm(form, { publish: false, allowTestOnlyPublish: true });
  const artifact = approvedContextArtifact(form, { readyNumbers: ALL_QUESTIONS });
  const contexts = await new ApprovedContextImporter({
    store, clock: () => new Date(NOW), trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const release = await store.publishOpenReviewRelease({
    releaseId: randomUUID(), formId: form.id, formVersion: form.version,
    contextSetId: contexts[0].id, authorityId: 'operator:open-review-test',
    reasonCode: 'CURRICULUM_RELEASE', now: new Date(NOW)
  });
  const student = await service.seedAccessCode({
    code: 'open-review-student-code', displayName: 'Open Review Student'
  });
  return { store, service, form, context: contexts[0], release, student, privateUploadStore };
}

async function createWorkspace(context, key = 'open-workspace-key') {
  return context.service.createOpenReviewWorkspace(context.student.id, context.release.id, key);
}

async function createUploadedTextBatch(context, attemptId, key, text) {
  const size = Buffer.byteLength(text);
  const created = await context.service.createLearningBatch(
    context.student.id, attemptId, `${key}-create`,
    { files: [{ displayName: `${key}.md`, kind: 'TEXT', contentType: 'text/markdown', declaredBytes: size }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, attemptId, created.batch.id, created.batch.assets[0].id,
    `${key}-upload`, Readable.from([text]), size
  );
  await context.service.submitLearningBatch(
    context.student.id, attemptId, created.batch.id, `${key}-submit`
  );
  return created.batch.id;
}

function decompositionOutput(prepared) {
  return prepared.plan.chunks.map((chunk, index) => {
    const segment = segmentBatchGatewaySources(chunk.sources)[0];
    return {
      schema: 'amc-batch-decomposition-v1', correlationId: prepared.plan.correlationId,
      inputHash: chunk.inputHash, planHash: chunk.planHash, chunkId: chunk.chunkId,
      items: index === 0 ? [{
        itemKey: 'student-q1', candidateQuestionNumbers: [1], proposedQuestionNumber: 1,
        answer: 'A', reasoningSummary: 'The student used a direct algebraic calculation.',
        confidence: 0.98, ambiguity: 'NONE',
        spans: [{
          segmentId: segment.segmentId, assetId: segment.assetId,
          startByte: segment.startByte, endByte: segment.endByte, sha256: segment.sha256
        }],
        conflictFlags: [], requiresConfirmation: false
      }] : [],
      unmappedSpans: index === 0 ? [] : segmentBatchGatewaySources(chunk.sources).map((item) => ({
        segmentId: item.segmentId, assetId: item.assetId,
        startByte: item.startByte, endByte: item.endByte, sha256: item.sha256,
        reason: 'NO_QUESTION_MATCH'
      }))
    };
  });
}

function gatewayMetadata(prepared) {
  return prepared.plan.chunks.map((chunk) => ({
    chunkId: chunk.chunkId, inputHash: chunk.inputHash,
    provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1', schemaVersion: 'amc-batch-decomposition-v1',
    usage: { inputTokens: 500, cachedInputTokens: 50, outputTokens: 100, totalTokens: 600, reasoningTokens: 20 }
  }));
}

test('open review API creates an idempotent blank v1 workspace without timed or official state', async (t) => {
  const context = await openReviewFixture(t);
  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode: 'open-review-student-code' }
  });
  const cookie = cookies(login);
  const csrf = login.json().csrfToken;

  const catalog = await app.inject({ method: 'GET', url: '/api/amc12/open-reviews', headers: { cookie } });
  assert.equal(catalog.statusCode, 200);
  assert.equal(catalog.json().openReviews.length, 1);
  const detail = await app.inject({
    method: 'GET', url: `/api/amc12/open-reviews/${context.release.id}`, headers: { cookie }
  });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().openReview.form.questions.length, 25);
  assert.equal(/correctOption|acceptedOptions|solutionMarkdown|approvedSolutions/.test(detail.body), false,
    'student catalog is prompt/choice-only');

  const noCsrf = await app.inject({
    method: 'POST', url: `/api/amc12/open-reviews/${context.release.id}/workspace`,
    headers: { cookie, 'idempotency-key': 'api-open-workspace' }, payload: {}
  });
  assert.equal(noCsrf.statusCode, 403);
  const created = await app.inject({
    method: 'POST', url: `/api/amc12/open-reviews/${context.release.id}/workspace`,
    headers: { cookie, 'x-csrf-token': csrf, 'idempotency-key': 'api-open-workspace' }, payload: {}
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.json().workspace.form.questions.length, 25);
  assert.equal(created.json().workspace.releaseStatus, 'ACTIVE');
  assert.equal(created.json().workspace.protectedAccessStatus, 'AVAILABLE');
  assert.equal(created.json().workspace.analysisStatus, 'AWAITING_BATCH');
  assert.equal(/correctOption|solutionMarkdown|approvedSolutions/.test(created.body), false);
  const replay = await app.inject({
    method: 'POST', url: `/api/amc12/open-reviews/${context.release.id}/workspace`,
    headers: { cookie, 'x-csrf-token': csrf, 'idempotency-key': 'api-open-workspace' }, payload: {}
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().workspace.id, created.json().workspace.id);

  const attemptId = created.json().workspace.id;
  const attempt = context.store.attempts.get(attemptId);
  const learning = context.store.learningSubmissions.get(attemptId);
  const versions = context.store.learningVersions.get(learning.id);
  assert.equal(attempt.attemptMode, 'OPEN_REVIEW');
  assert.equal(attempt.phase, 'OPEN_REVIEW');
  assert.equal(attempt.clockState, 'PAUSED');
  assert.equal(attempt.activeElapsedMs, 0);
  assert.deepEqual(context.store.answers.get(attemptId), []);
  assert.deepEqual(context.store.reasoningNotes.get(attemptId), []);
  assert.deepEqual(context.store.submissions.get(attemptId), []);
  assert.deepEqual(context.store.events.get(attemptId), []);
  assert.equal(versions.length, 1);
  assert.equal(versions[0].creationReason, 'OPEN_REVIEW_ANCHOR');
  assert.equal(versions[0].contextSetId, context.release.contextSetId);
  assert.equal(context.store.learningResponses.get(versions[0].id).length, 25);
  assert.ok(context.store.learningResponses.get(versions[0].id).every((response) =>
    response.selectedOption === null && response.reasoningText === ''
      && response.answerOrigin === 'OPEN_REVIEW_BLANK' && response.reasoningOrigin === 'NONE'));
  assert.deepEqual(context.store.learningWorkItems.get(versions[0].id), []);

  const unauthenticatedHistory = await app.inject({
    method: 'GET', url: '/api/amc12/learning-history'
  });
  assert.equal(unauthenticatedHistory.statusCode, 401);
  assert.equal(unauthenticatedHistory.headers['cache-control'], 'no-store');
  assert.equal(unauthenticatedHistory.headers.pragma, 'no-cache');
  const historyList = await app.inject({
    method: 'GET', url: '/api/amc12/learning-history?limit=1', headers: { cookie }
  });
  assert.equal(historyList.statusCode, 200);
  assert.equal(historyList.headers['cache-control'], 'no-store');
  assert.equal(historyList.json().items[0].submissionId, learning.id);
  assert.equal(historyList.json().items[0].latestAnalysisStatus, 'AWAITING_BATCH');
  const historyDetail = await app.inject({
    method: 'GET', url: `/api/amc12/learning-history/${learning.id}`, headers: { cookie }
  });
  assert.equal(historyDetail.statusCode, 200);
  assert.equal(historyDetail.headers['cache-control'], 'no-store');
  assert.deepEqual(historyDetail.json().versions.map((version) => version.versionNumber), [1]);
  const anchorReport = await app.inject({
    method: 'GET', url: `/api/amc12/learning-history/${learning.id}/versions/1/report`, headers: { cookie }
  });
  assert.equal(anchorReport.statusCode, 409);
  assert.equal(anchorReport.headers['cache-control'], 'no-store');
  assert.equal(anchorReport.json().error.code, 'LEARNING_HISTORY_REPORT_UNAVAILABLE');
  const nonCanonicalPath = await app.inject({
    method: 'GET',
    url: `/api/amc12/learning-history/${learning.id}/versions/01/questions/1`,
    headers: { cookie }
  });
  assert.equal(nonCanonicalPath.statusCode, 400);
  assert.equal(nonCanonicalPath.headers['cache-control'], 'no-store');
  const uppercaseSubmissionPath = await app.inject({
    method: 'GET', url: `/api/amc12/learning-history/${learning.id.toUpperCase()}`,
    headers: { cookie }
  });
  assert.equal(uppercaseSubmissionPath.statusCode, 400);
  assert.equal(uppercaseSubmissionPath.headers['cache-control'], 'no-store');
  const uppercaseCursor = Buffer.from(JSON.stringify({
    v: 1,
    updatedAt: new Date(learning.updatedAt).toISOString(),
    submissionId: learning.id.toUpperCase()
  })).toString('base64url');
  const uppercaseCursorResponse = await app.inject({
    method: 'GET',
    url: `/api/amc12/learning-history?limit=1&cursor=${encodeURIComponent(uppercaseCursor)}`,
    headers: { cookie }
  });
  assert.equal(uppercaseCursorResponse.statusCode, 400);
  assert.equal(uppercaseCursorResponse.json().error.code, 'INVALID_LEARNING_HISTORY_CURSOR');
  assert.equal(uppercaseCursorResponse.headers['cache-control'], 'no-store');

  const otherStudent = await context.service.seedAccessCode({
    code: 'open-review-history-bola-code', displayName: 'Open Review BOLA Other'
  });
  const otherLogin = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode: 'open-review-history-bola-code' }
  });
  assert.ok(otherStudent.id);
  const bola = await app.inject({
    method: 'GET', url: `/api/amc12/learning-history/${learning.id}`,
    headers: { cookie: cookies(otherLogin) }
  });
  assert.equal(bola.statusCode, 404);
  assert.equal(bola.headers['cache-control'], 'no-store');
  assert.equal(bola.json().error.code, 'LEARNING_HISTORY_NOT_FOUND');

  const timedCalls = [
    () => context.service.getAttempt(context.student.id, attemptId),
    () => context.service.getAttemptPublicForm(context.student.id, attemptId),
    () => context.service.putAnswers(context.student.id, attemptId, { revision: 0, answers: [{ questionNumber: 1, selectedOption: 'A' }] }),
    () => context.service.getReasoning(context.student.id, attemptId),
    () => context.service.putReasoning(context.student.id, attemptId, 'open-reasoning', {
      revision: 0, notes: [{ questionNumber: 1, reasoningText: 'This must remain unavailable.' }]
    }),
    () => context.service.pause(context.student.id, attemptId, 'open-pause'),
    () => context.service.resume(context.student.id, attemptId, 'open-resume'),
    () => context.service.checkpoint(context.student.id, attemptId, 'open-checkpoint', { expectedAnswersRevision: 0, expectedStateRevision: 0 }),
    () => context.service.final(context.student.id, attemptId, 'open-final', { expectedAnswersRevision: 0, expectedStateRevision: 0 }),
    () => context.service.deadlineDecision(context.student.id, attemptId, 'continue', 'open-deadline', { expectedAnswersRevision: 0, expectedStateRevision: 0 }),
    () => context.service.reset(context.student.id, attemptId, 'open-reset'),
    () => context.service.getResults(context.student.id, attemptId),
    () => context.service.getSolutions(context.student.id, attemptId)
  ];
  for (const operation of timedCalls) {
    await assert.rejects(operation, (error) => error instanceof ApiError && error.statusCode === 409
      && error.code === 'OPEN_REVIEW_OPERATION_NOT_ALLOWED');
  }

  const other = await context.service.seedAccessCode({ code: 'open-review-other-code', displayName: 'Other' });
  assert.deepEqual(await context.service.listOpenReviewWorkspaces(other.id), []);
  await assert.rejects(
    () => context.service.getOpenReviewWorkspace(other.id, attemptId),
    (error) => error instanceof ApiError && error.statusCode === 404 && error.code === 'ATTEMPT_NOT_FOUND'
  );
  const inference = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: inference,
    workerId: 'open-anchor-worker', clock: () => new Date(NOW)
  });
  assert.deepEqual(await worker.runOnce(), { processed: false });
  assert.equal(inference.calls.length, 0);
});

test('open review batch v2 survives supersede, is mapped-only, and analyzes against pinned solutions', async (t) => {
  const context = await openReviewFixture(t, { privateStorage: true });
  const workspace = await createWorkspace(context);
  const attemptId = workspace.workspace.id;
  const firstBatchId = await createUploadedTextBatch(
    context, attemptId, 'first-open-batch', 'Question 1: A. I used a direct algebraic calculation.'
  );
  const secondBatchId = await createUploadedTextBatch(
    context, attemptId, 'second-open-batch', 'Question 2: B. I compared the possible cases.'
  );
  const firstClaim = await context.store.claimNextAiWork({
    workerId: 'open-extract-first', now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(firstClaim.kind, 'BATCH_EXTRACTION');
  const claimedBatchId = firstClaim.job.batch.id;
  const remainingBatchId = claimedBatchId === firstBatchId ? secondBatchId : firstBatchId;

  await context.store.transitionOpenReviewRelease({
    releaseId: context.release.id, nextStatus: OPEN_REVIEW_STATUS.SUPERSEDED_VALID,
    authorityId: 'operator:open-review-test', reasonCode: 'REPLACED_BY_NEW_RELEASE', now: new Date(NOW.getTime() + 1_000)
  });
  const replayedWorkspace = await createWorkspace(context);
  assert.equal(replayedWorkspace.created, false, 'an exact idempotent replay remains observable');
  assert.equal((await context.service.getOpenReviewWorkspace(context.student.id, attemptId)).form.questions.length, 25,
    'an existing workspace retains its pinned redacted questions after supersession');
  const supersededWorkspace = await context.service.getOpenReviewWorkspace(context.student.id, attemptId);
  assert.equal(supersededWorkspace.releaseStatus, 'SUPERSEDED_VALID');
  assert.equal(supersededWorkspace.protectedAccessStatus, 'AVAILABLE_FOR_EXISTING_WORK');
  const other = await context.service.seedAccessCode({ code: 'superseded-new-student', displayName: 'New Student' });
  await assert.rejects(
    () => context.service.createOpenReviewWorkspace(other.id, context.release.id, 'new-after-supersede'),
    (error) => error instanceof ApiError && error.statusCode === 404 && error.code === 'OPEN_REVIEW_NOT_FOUND'
  );
  await assert.rejects(
    () => context.service.createLearningBatch(context.student.id, attemptId, 'new-batch-after-supersede', {
      files: [{ displayName: 'blocked.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: 10 }]
    }),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === 'OPEN_REVIEW_NOT_ACTIVE'
  );

  const prepared = await context.service.prepareLearningBatchDecomposition(
    context.student.id, attemptId, claimedBatchId
  );
  assert.equal(/correctOption|acceptedOptions|solutionMarkdown|approvedSolutions/.test(JSON.stringify(prepared)), false,
    'extraction receives question identity and student evidence, never grading answers or solutions');
  const decomposed = await context.service.recordLearningBatchDecomposition(
    context.student.id, attemptId, claimedBatchId,
    {
      masterPlanHash: prepared.plan.masterPlanHash,
      outputs: decompositionOutput(prepared), runMetadata: gatewayMetadata(prepared),
      workerFence: {
        workerId: firstClaim.job.workItem.leaseOwner,
        leaseToken: firstClaim.job.workItem.leaseToken,
        inputHash: firstClaim.job.workItem.inputHash,
        deletionGeneration: firstClaim.job.workItem.deletionGeneration
      }
    }
  );
  assert.equal(decomposed.batch.status, 'NEEDS_CONFIRMATION');
  const item = decomposed.batch.mapping.items.find((candidate) => !candidate.unmapped);
  const secondClaim = await context.store.claimNextAiWork({
    workerId: 'open-extract-second', now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(secondClaim.job.batch.id, remainingBatchId);
  const committed = await context.service.confirmLearningBatch(
    context.student.id, attemptId, claimedBatchId, 'confirm-open-first',
    {
      mappingRevision: decomposed.batch.mapping.revision,
      responses: [{
        questionNumber: 1, selectedOption: 'A', reasoningText: item.evidenceText,
        sourceItemIds: [item.id]
      }],
      discardedItemIds: decomposed.batch.mapping.items.filter((candidate) => candidate.unmapped)
        .map((candidate) => candidate.id)
    }
  );
  assert.equal(committed.batch.status, 'COMMITTED');
  assert.equal(committed.batch.result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  assert.equal(committed.batch.result.items.length, 1);
  assert.equal(committed.batch.result.items[0].questionNumber, 1);
  assert.equal(committed.batch.result.maximumPoints, 6);
  assert.equal((await context.service.getLearningSubmission(context.student.id, attemptId)).version, 2);
  assert.deepEqual(context.store.submissions.get(attemptId), [], 'batch grading never creates an official submission');
  assert.deepEqual(context.store.answers.get(attemptId), [], 'batch confirmation never mutates timed answers');

  const inference = new FakeInferenceClient();
  const analysisWorker = new LearningReviewWorker({
    store: context.store, inferenceClient: inference,
    workerId: 'open-analysis-worker', clock: () => new Date(NOW)
  });
  assert.deepEqual(await analysisWorker.runOnce(), { processed: true, status: 'COMPLETE', providerCalls: 1 });
  assert.equal(inference.calls.length, 1);
  assert.match(inference.calls[0].question.question_id, /^q:1:[0-9a-f]{24}$/);
  assert.equal(inference.calls[0].question.solutions.length, 2);
  const report = await context.service.getLearningReport(context.student.id, attemptId);
  assert.equal(report.status, 'COMPLETE');
  assert.equal(report.questions[0].solutionComparisons.length, 2);
  const completedWorkspace = await context.service.getOpenReviewWorkspace(context.student.id, attemptId);
  assert.equal(completedWorkspace.analysisStatus, 'SUCCEEDED');
  const listedCompletedWorkspace = (await context.service.listOpenReviewWorkspaces(context.student.id))
    .find((candidate) => candidate.id === attemptId);
  assert.equal(listedCompletedWorkspace.analysisStatus, 'SUCCEEDED');
  const supersededLearning = context.store.learningSubmissions.get(attemptId);
  const supersededQuestion = await context.service.getLearningHistoryQuestion(
    context.student.id, supersededLearning.id, '2', '1'
  );
  assert.equal(supersededQuestion.releaseStatus, 'SUPERSEDED_VALID');
  assert.equal(supersededQuestion.protectedAccessStatus, 'AVAILABLE_FOR_EXISTING_WORK');
  assert.equal(supersededQuestion.protected.result.isCorrect, true);
  assert.equal(supersededQuestion.protected.result.points, 6);
  assert.equal(supersededQuestion.protected.analysis.status, 'SUCCEEDED');
  const supersededReport = await context.service.getLearningHistoryReport(
    context.student.id, supersededLearning.id, '2'
  );
  assert.equal(supersededReport.status, 'COMPLETE');
  assert.equal(supersededReport.questions[0].solutionComparisons.length, 2);

  await context.store.transitionOpenReviewRelease({
    releaseId: context.release.id, nextStatus: OPEN_REVIEW_STATUS.REVOKED,
    authorityId: 'operator:open-review-test', reasonCode: 'CONTENT_SAFETY_REVOCATION', now: new Date(NOW.getTime() + 2_000)
  });
  await assert.rejects(
    () => context.service.getLearningReport(context.student.id, attemptId),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === 'OPEN_REVIEW_REVOKED'
  );
  const revokedWorkspace = await context.service.getOpenReviewWorkspace(context.student.id, attemptId);
  assert.equal(revokedWorkspace.form.questions.length, 25,
    'revocation withdraws protected analysis, not the owner-visible submitted question record');
  assert.equal(revokedWorkspace.releaseStatus, 'REVOKED');
  assert.equal(revokedWorkspace.protectedAccessStatus, 'PROTECTED_RESULTS_WITHHELD');
  assert.equal(revokedWorkspace.analysisStatus, 'SUCCEEDED');
  const learning = context.store.learningSubmissions.get(attemptId);
  const history = await context.service.getLearningHistory(context.student.id, learning.id);
  assert.deepEqual(history.versions.map((version) => version.versionNumber), [1, 2]);
  assert.equal(history.versions[0].reportStatus, 'WITHHELD');
  assert.equal(history.versions[1].analysisStatus, 'WITHHELD');
  assert.equal(history.versions[1].reportStatus, 'WITHHELD');
  const revokedQuestion = await context.service.getLearningHistoryQuestion(
    context.student.id, learning.id, '2', '1'
  );
  assert.equal(revokedQuestion.question.promptMarkdown, context.form.questions[0].promptMarkdown);
  assert.equal(revokedQuestion.response.answerOrigin, 'BATCH_CONFIRMED');
  assert.ok(revokedQuestion.response.reasoningText.length > 0,
    'the owner-confirmed evidence remains readable after revocation');
  assert.equal(revokedQuestion.protected, null);
  assert.equal(revokedQuestion.protectedWithheldReason, 'OPEN_REVIEW_REVOKED');
  assert.equal(/officialAnswer|acceptedOptions|isCorrect|"points"|solutionComparisons/.test(
    JSON.stringify(revokedQuestion)
  ), false);
  await assert.rejects(
    () => context.service.getLearningHistoryReport(context.student.id, learning.id, '2'),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === 'OPEN_REVIEW_REVOKED'
  );
  await assert.rejects(
    () => context.service.getLearningHistoryReport(context.student.id, learning.id, '1'),
    (error) => error instanceof ApiError && error.statusCode === 409
      && error.code === 'LEARNING_HISTORY_REPORT_UNAVAILABLE'
  );
  assert.equal(await context.store.authorizeBatchExtractionProviderCall({
    workItemId: secondClaim.job.workItem.id,
    workerId: secondClaim.job.workItem.leaseOwner,
    leaseToken: secondClaim.job.workItem.leaseToken,
    inputHash: secondClaim.job.workItem.inputHash,
    deletionGeneration: secondClaim.job.workItem.deletionGeneration,
    now: new Date(NOW)
  }), false, 'no new provider authorization begins after committed revocation');
  const gateway = { calls: [], async decomposeChunk(...args) { this.calls.push(args); throw new Error('must not run'); } };
  const extractionWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, gatewayClient: gateway,
    workerId: 'open-extract-second', clock: () => new Date(NOW)
  });
  assert.deepEqual(await extractionWorker.processClaimed(secondClaim.job), { processed: false, staleWrite: true });
  assert.equal(gateway.calls.length, 0, 'no new provider authorization begins after committed revocation');

  const revokedBatch = await context.service.getLearningBatch(context.student.id, attemptId, claimedBatchId);
  assert.equal(revokedBatch.batch.result, null);
  assert.equal(revokedBatch.batch.resultWithheldReason, 'OPEN_REVIEW_REVOKED');
  assert.ok(revokedBatch.batch.confirmation, 'owner-confirmed evidence remains available');
  assert.equal(/correctOption|acceptedOptions|isCorrect|"points"/.test(JSON.stringify(revokedBatch)), false);
  const revokedBatchFromList = (await context.service.listLearningBatches(context.student.id, attemptId)).batches
    .find((batch) => batch.id === claimedBatchId);
  assert.equal(revokedBatchFromList.result, null);
  assert.equal(revokedBatchFromList.resultWithheldReason, 'OPEN_REVIEW_REVOKED');

  const replayLabel = claimedBatchId === firstBatchId ? 'first-open-batch' : 'second-open-batch';
  const replayText = claimedBatchId === firstBatchId
    ? 'Question 1: A. I used a direct algebraic calculation.'
    : 'Question 2: B. I compared the possible cases.';
  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login',
    payload: { accessCode: 'open-review-student-code' }
  });
  const createReplay = await app.inject({
    method: 'POST', url: `/api/amc12/attempts/${attemptId}/learning-batches`,
    headers: {
      cookie: cookies(login),
      'x-csrf-token': login.json().csrfToken,
      'idempotency-key': `${replayLabel}-create`
    },
    payload: {
      files: [{
        displayName: `${replayLabel}.md`, kind: 'TEXT', contentType: 'text/markdown',
        declaredBytes: Buffer.byteLength(replayText)
      }]
    }
  });
  assert.equal(createReplay.statusCode, 200, 'exact create replay remains observable after revoke');
  assert.equal(createReplay.json().created, false);
  assert.equal(createReplay.json().batch.id, claimedBatchId);
  assert.equal(createReplay.json().batch.result, null);
  assert.equal(createReplay.json().batch.resultWithheldReason, 'OPEN_REVIEW_REVOKED');
  assert.equal(/correctOption|acceptedOptions|isCorrect|"points"/.test(createReplay.body), false,
    'an old create idempotency key cannot bypass revoked-result redaction');
  const entitlements = await context.store.withAttemptLock(attemptId, async (tx) => ({
    existing: await tx.getLearningEntitlement({ purpose: 'EXISTING_WORK' }),
    cleanup: await tx.getLearningEntitlement({ purpose: 'CLEANUP' })
  }));
  assert.equal(entitlements.existing.allowed, false);
  assert.equal(entitlements.cleanup.allowed, true, 'revocation preserves exact-lineage cleanup authority');
  const deleted = await context.service.deleteLearningBatch(
    context.student.id, attemptId, claimedBatchId, 'delete-revoked-open-batch'
  );
  assert.equal(deleted.batch.result, null);
  assert.equal(/correctOption|acceptedOptions|isCorrect|"points"/.test(JSON.stringify(deleted)), false,
    'cleanup responses cannot re-expose protected scoring fields');

  Object.assign(context.store.learningSubmissions.get(attemptId), {
    lifecycleStatus: 'DELETED', deletedAt: new Date(NOW.getTime() + 3_000),
    updatedAt: new Date(NOW.getTime() + 3_000)
  });
  const tombstone = await context.service.getLearningHistory(context.student.id, learning.id);
  assert.equal(tombstone.protectedAccessStatus, 'RECORD_DELETED');
  assert.equal(tombstone.title, null);
  assert.ok(tombstone.versions.every((version) => version.analysisStatus === 'TOMBSTONED'
    && version.reportStatus === 'TOMBSTONED' && version.resultStatus === 'TOMBSTONED'));
  assert.equal(/"(?:questionNumbers|responseCount|mappedQuestionCount|batchLineage|officialAnswer|reasoningText|analysis)":/.test(
    JSON.stringify(tombstone.versions)
  ), false, 'a deleted history detail is minimal non-content audit metadata');
  const tombstoneList = await context.service.listLearningHistory(context.student.id, { limit: '1' });
  assert.equal(tombstoneList.items[0].title, null);
  assert.equal(tombstoneList.items[0].protectedAccessStatus, 'RECORD_DELETED');
  await assert.rejects(
    () => context.service.getLearningHistoryQuestion(context.student.id, learning.id, '2', '1'),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === 'LEARNING_HISTORY_DELETED'
  );
  await assert.rejects(
    () => context.service.getLearningHistoryReport(context.student.id, learning.id, '2'),
    (error) => error instanceof ApiError && error.statusCode === 409 && error.code === 'LEARNING_HISTORY_DELETED'
  );
});

test('the 241st learning-history GET is rate-limited but remains no-store', async (t) => {
  const context = await openReviewFixture(t);
  context.service.batchRequestLimitPerMinute = 1_000;
  const workspace = await createWorkspace(context, 'rate-limit-history-workspace');
  const learning = context.store.learningSubmissions.get(workspace.workspace.id);
  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const session = await context.service.login('open-review-student-code');
  const cookie = `${APP_CONFIG.cookieName}=${app.signCookie(session.sessionToken)}`;
  const historyRequest = () => app.inject({
    method: 'GET', url: `/api/amc12/learning-history/${learning.id}`,
    remoteAddress: '127.0.0.1', headers: { cookie }
  });
  for (let index = 0; index < 240; index += 1) {
    assert.equal((await historyRequest()).statusCode, 200);
  }
  const limited = await historyRequest();
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.json().error.code, 'RATE_LIMITED');
  assert.equal(limited.headers['cache-control'], 'no-store');
  assert.equal(limited.headers.pragma, 'no-cache');
});

test('a provider call authorized before revoke may run but its protected completion is fenced', async (t) => {
  const context = await openReviewFixture(t, { privateStorage: true });
  const attemptId = (await createWorkspace(context, 'race-workspace-key')).workspace.id;
  const batchId = await createUploadedTextBatch(
    context, attemptId, 'authorized-race-batch', 'Question 1: A. I used algebra.'
  );
  const claim = await context.store.claimNextAiWork({
    workerId: 'authorized-race-worker', now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(claim.job.batch.id, batchId);
  const prepared = await context.service.prepareLearningBatchDecomposition(
    context.student.id, attemptId, batchId
  );
  const fence = {
    workerId: claim.job.workItem.leaseOwner,
    leaseToken: claim.job.workItem.leaseToken,
    inputHash: claim.job.workItem.inputHash,
    deletionGeneration: claim.job.workItem.deletionGeneration
  };
  assert.equal(await context.store.authorizeBatchExtractionProviderCall({
    workItemId: claim.job.workItem.id, ...fence, now: new Date(NOW)
  }), true);

  let providerCalls = 0;
  providerCalls += 1; // authorization preceded revoke; invocation may cross the commit boundary
  const providerOutput = decompositionOutput(prepared);
  await context.store.transitionOpenReviewRelease({
    releaseId: context.release.id, nextStatus: OPEN_REVIEW_STATUS.REVOKED,
    authorityId: 'operator:open-review-test', reasonCode: 'RACE_REVOCATION',
    now: new Date(NOW.getTime() + 1_000)
  });
  assert.equal(providerCalls, 1, 'physical zero-call is not promised for pre-authorized in-flight work');
  await assert.rejects(
    () => context.service.recordLearningBatchDecomposition(context.student.id, attemptId, batchId, {
      masterPlanHash: prepared.plan.masterPlanHash,
      outputs: providerOutput,
      runMetadata: gatewayMetadata(prepared),
      workerFence: fence
    }),
    (error) => error instanceof ApiError && error.statusCode === 409
      && error.code === 'OPEN_REVIEW_NOT_ACTIVE'
  );
  const bundle = await context.store.withAttemptLock(attemptId,
    (tx) => tx.getLearningBatchBundle(batchId));
  assert.equal(bundle.mapping, null);
  assert.equal(bundle.batch.failureCode, 'OPEN_REVIEW_REVOKED');
});

test('release lifecycle and question-bundle fence reject timed reuse while allowing a pinned successor', async (t) => {
  const context = await openReviewFixture(t);
  assert.deepEqual(context.store.openReviewReleaseEvents.map((event) => event.eventType), ['PUBLISHED']);
  await assert.rejects(
    () => context.store.transitionOpenReviewRelease({
      releaseId: context.release.id, nextStatus: OPEN_REVIEW_STATUS.ACTIVE,
      authorityId: 'operator:open-review-test', reasonCode: 'ILLEGAL_NOOP', now: new Date(NOW.getTime() + 1)
    }),
    (error) => error.code === 'OPEN_REVIEW_TRANSITION_INVALID'
  );
  await assert.rejects(
    () => context.store.importForm(context.form, { publish: true, allowTestOnlyPublish: true }),
    (error) => error.code === 'OPEN_REVIEW_DELIVERY_CONFLICT'
  );
  await assert.rejects(
    () => context.service.createAttempt(context.student.id, context.form.id),
    (error) => error instanceof ApiError && error.statusCode === 404,
    'an unpublished open review revision never enters the timed catalog'
  );
  const successorForm = { ...learningReviewForm(), version: 'review-v2', title: 'Learning review successor' };
  await context.store.importForm(successorForm, { publish: false, allowTestOnlyPublish: true });
  const artifact = approvedContextArtifact(successorForm, { readyNumbers: ALL_QUESTIONS });
  const [successorContext] = await new ApprovedContextImporter({
    store: context.store, clock: () => new Date(NOW), trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  await assert.rejects(
    () => context.store.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: successorForm.id, formVersion: successorForm.version,
      contextSetId: successorContext.id, authorityId: 'operator:open-review-test',
      reasonCode: 'PREMATURE_SUCCESSOR', now: new Date(NOW.getTime() + 500)
    }),
    (error) => error.code === 'OPEN_REVIEW_ACTIVE_CONFLICT',
    'the same question bundle cannot have two ACTIVE releases, even under distinct form ids'
  );
  await context.store.transitionOpenReviewRelease({
    releaseId: context.release.id, nextStatus: OPEN_REVIEW_STATUS.SUPERSEDED_VALID,
    authorityId: 'operator:open-review-test', reasonCode: 'SUCCESSOR_READY', now: new Date(NOW.getTime() + 1_000)
  });
  const successor = await context.store.publishOpenReviewRelease({
    releaseId: randomUUID(), formId: successorForm.id, formVersion: successorForm.version,
    contextSetId: successorContext.id, authorityId: 'operator:open-review-test',
    reasonCode: 'SUCCESSOR_PUBLISHED', now: new Date(NOW.getTime() + 2_000)
  });
  assert.equal(successor.questionBundleHash, context.release.questionBundleHash);
  assert.equal(successor.status, OPEN_REVIEW_STATUS.ACTIVE);
  assert.deepEqual(context.store.openReviewReleaseEvents.map((event) => event.eventType),
    ['PUBLISHED', 'SUPERSEDED', 'PUBLISHED']);
});
