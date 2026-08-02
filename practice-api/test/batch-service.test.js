import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { buildApp } from '../src/app.js';
import { AiWorkDispatcher } from '../src/ai-work-dispatcher.js';
import { batchSha256, segmentBatchGatewaySources } from '../src/batch-ingest/domain.js';
import { BatchExtractionWorker } from '../src/batch-ingest/worker.js';
import { ProviderOrphanCleanupWorker } from '../src/batch-ingest/provider-orphan-cleanup-worker.js';
import { BatchTranscriptionWorker } from '../src/batch-ingest/transcription-worker.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { TranscriptionWorkerPort } from '../src/learning-review/transcription-worker-port.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { MemoryStore } from '../src/memory-store.js';
import { PracticeService } from '../src/service.js';
import {
  approvedContextArtifact, approvalReceiptsForArtifact, FakeInferenceClient,
  learningReviewForm, TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

const RETENTION_PROFILE = Object.freeze({
  name: 'CONFIGURED_TTL', policyDelayMs: 72 * 60 * 60 * 1_000,
  uploadRequestMaxDurationMs: 120_000, processingSlackMs: 72 * 60 * 60 * 1_000
});
const RETENTION_OFFSET_MS = RETENTION_PROFILE.policyDelayMs
  + RETENTION_PROFILE.uploadRequestMaxDurationMs + RETENTION_PROFILE.processingSlackMs;

const config = {
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

function gatewayOutputs(plan, { confidence = 0.97, answer = 'A' } = {}) {
  let index = 0;
  return plan.chunks.map((chunk) => ({
    schema: 'amc-batch-decomposition-v1', correlationId: plan.correlationId,
    inputHash: chunk.inputHash, planHash: chunk.planHash, chunkId: chunk.chunkId,
    items: segmentBatchGatewaySources(chunk.sources).map((segment) => {
      const questionNumber = ++index;
      return {
      itemKey: `fake-item-${questionNumber}`, candidateQuestionNumbers: [questionNumber], proposedQuestionNumber: questionNumber,
      answer, reasoningSummary: 'The student used a direct calculation.', confidence,
      ambiguity: 'NONE',
      spans: [{
        segmentId: segment.segmentId, assetId: segment.assetId,
        startByte: segment.startByte, endByte: segment.endByte, sha256: segment.sha256
      }],
      conflictFlags: confidence < 0.9 ? ['LOW_CONFIDENCE'] : [],
      requiresConfirmation: confidence < 0.9
    };
    }),
    unmappedSpans: []
  }));
}

function gatewayRunMetadata() {
  return {
    provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1', schemaVersion: 'amc-batch-decomposition-v1',
    usage: { inputTokens: 800, cachedInputTokens: 100, outputTokens: 200, totalTokens: 1000, reasoningTokens: 50 }
  };
}

function gatewayRunMetadataForPlan(plan) {
  return plan.chunks.map((chunk) => ({ chunkId: chunk.chunkId, inputHash: chunk.inputHash, ...gatewayRunMetadata() }));
}

async function confirmExtractedBatch(context, batch, key) {
  const items = batch.mapping.items;
  return context.service.confirmLearningBatch(
    context.student.id, context.attemptId, batch.id, key,
    {
      mappingRevision: batch.mapping.revision,
      responses: items.filter((item) => !item.unmapped).map((item) => ({
        questionNumber: item.proposedQuestionNumber,
        selectedOption: item.selectedOption,
        reasoningText: item.evidenceText,
        sourceItemIds: [item.id]
      })),
      discardedItemIds: items.filter((item) => item.unmapped).map((item) => item.id)
    }
  );
}

async function claimBatchExtraction(context) {
  const claimed = await context.store.claimNextAiWork({
    workerId: 'fake-batch-worker', now: new Date('2026-08-01T12:00:01.000Z'), leaseMs: 60_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(claimed.kind, 'BATCH_EXTRACTION');
  return {
    workerId: claimed.job.workItem.leaseOwner,
    leaseToken: claimed.job.workItem.leaseToken,
    inputHash: claimed.job.workItem.inputHash,
    deletionGeneration: claimed.job.workItem.deletionGeneration
  };
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'amc-batch-service-'));
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  const privateUploadStore = new PrivateUploadStore({ root, highWatermarkPercent: 100 });
  await privateUploadStore.init();
  const store = new MemoryStore();
  const service = new PracticeService({
    store, privateUploadStore,
    authPepper: 'test-pepper-that-is-long-enough-for-a-safe-local-test-suite',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    allowTestOnlyImport: true, allowTestOnlyPublish: true,
    clock: () => new Date('2026-08-01T12:00:00.000Z')
  });
  const form = learningReviewForm();
  await store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  const student = await service.seedAccessCode({ code: 'batch-student-code', displayName: 'Batch Student' });
  const created = await service.createAttempt(student.id, form.id);
  await service.final(student.id, created.attempt.id, 'finalize-batch-fixture', {
    expectedAnswersRevision: 0, expectedStateRevision: 0
  });
  return { root, store, service, student, attemptId: created.attempt.id, form };
}

async function submittedAudioBatch(context, key) {
  const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(48, 4)]);
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, `${key}-create`,
    { files: [{ displayName: `${key}.mp3`, kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    `${key}-upload`, Readable.from([audio]), audio.length
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, `${key}-submit`
  );
  return created;
}

test('distributed student budgets atomically bound concurrent units and reset at the next window', async () => {
  const store = new MemoryStore();
  const now = new Date('2026-08-01T12:00:30.000Z');
  const requests = await Promise.all(Array.from({ length: 3 }, () =>
    store.consumeStudentResourceBudget({
      studentId: 'student-budget-a', budgetKind: 'AUTHENTICATED_REQUEST',
      units: 1, limit: 2, windowMs: 60_000, now
    })));
  assert.equal(requests.filter((result) => result.allowed).length, 2);
  assert.equal(requests.filter((result) => !result.allowed).length, 1);
  assert.equal((await store.consumeStudentResourceBudget({
    studentId: 'student-budget-b', budgetKind: 'AUTHENTICATED_REQUEST',
    units: 1, limit: 2, windowMs: 60_000, now
  })).allowed, true, 'another student has an independent distributed window');
  assert.equal((await store.consumeStudentResourceBudget({
    studentId: 'student-budget-a', budgetKind: 'AUTHENTICATED_REQUEST',
    units: 1, limit: 2, windowMs: 60_000, now: new Date('2026-08-01T12:01:00.000Z')
  })).allowed, true, 'the exact next fixed window resets usage');
  const globalResults = await Promise.all(Array.from({ length: 3 }, () =>
    store.consumeGlobalResourceBudget({
      budgetKind: 'PROVIDER_WORK', units: 1, limit: 2, windowMs: 60_000, now
    })));
  assert.equal(globalResults.filter((result) => result.allowed).length, 2);
  assert.equal(globalResults.filter((result) => !result.allowed).length, 1,
    'global provider budget is shared across all students and processes');
});

test('upload and provider budgets fail closed without storing bytes or partially charging submission work', async (t) => {
  const uploadContext = await fixture(t);
  const text = 'five!';
  uploadContext.service.batchPractice.uploadByteBudget = Buffer.byteLength(text) - 1;
  const uploadBatch = await uploadContext.service.createLearningBatch(
    uploadContext.student.id, uploadContext.attemptId, 'budget-create-upload',
    { files: [{ displayName: 'work.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: Buffer.byteLength(text) }] }
  );
  await assert.rejects(
    uploadContext.service.uploadLearningBatchAsset(
      uploadContext.student.id, uploadContext.attemptId, uploadBatch.batch.id,
      uploadBatch.batch.assets[0].id, 'budget-upload-denied',
      Readable.from([text]), Buffer.byteLength(text)
    ),
    (error) => error.statusCode === 429 && error.code === 'UPLOAD_BYTE_RATE_LIMITED'
      && Number.isSafeInteger(error.details.retryAfterSeconds)
  );
  assert.deepEqual(await readdir(join(uploadContext.root, 'objects')), []);
  assert.equal((await uploadContext.service.getLearningBatch(
    uploadContext.student.id, uploadContext.attemptId, uploadBatch.batch.id
  )).batch.assets[0].status, 'RESERVED');

  const providerContext = await fixture(t);
  const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(32, 1)]);
  providerContext.service.batchPractice.providerAudioByteBudget = audio.length - 1;
  const audioBatch = await providerContext.service.createLearningBatch(
    providerContext.student.id, providerContext.attemptId, 'budget-create-audio',
    { files: [{ displayName: 'reasoning.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length }] }
  );
  await providerContext.service.uploadLearningBatchAsset(
    providerContext.student.id, providerContext.attemptId, audioBatch.batch.id,
    audioBatch.batch.assets[0].id, 'budget-upload-audio', Readable.from([audio]), audio.length
  );
  await assert.rejects(
    providerContext.service.submitLearningBatch(
      providerContext.student.id, providerContext.attemptId, audioBatch.batch.id, 'budget-submit-audio'
    ),
    (error) => error.statusCode === 429 && error.code === 'PROVIDER_AUDIO_RATE_LIMITED'
  );
  assert.equal((await providerContext.service.getLearningBatch(
    providerContext.student.id, providerContext.attemptId, audioBatch.batch.id
  )).batch.status, 'DRAFT');
  assert.equal([...providerContext.store.studentResourceBudgetWindows.values()]
    .some((window) => window.budgetKind === 'PROVIDER_WORK'), false,
  'provider-work charge rolls back atomically when the audio-byte budget rejects submit');
  assert.equal([...providerContext.store.globalResourceBudgetWindows.values()]
    .some((window) => window.budgetKind === 'PROVIDER_WORK'), false,
  'global provider-work charge rolls back with the same rejected submit');
});

test('transcription claims are least-served per student instead of draining one large batch first', async (t) => {
  const context = await fixture(t);
  const secondStudent = await context.service.seedAccessCode({
    code: 'second-fairness-student-code', displayName: 'Second fairness student'
  });
  const secondAttempt = await context.service.createAttempt(secondStudent.id, context.form.id);
  await context.service.final(secondStudent.id, secondAttempt.attempt.id, 'fairness-second-final', {
    expectedAnswersRevision: 0, expectedStateRevision: 0
  });
  const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(32, 3)]);
  const createAudioBatch = async (studentId, attemptId, key, count) => {
    const created = await context.service.createLearningBatch(studentId, attemptId, `${key}-create`, {
      files: Array.from({ length: count }, (_, index) => ({
        displayName: `${key}-${index}.mp3`, kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length
      }))
    });
    for (const [index, asset] of created.batch.assets.entries()) {
      await context.service.uploadLearningBatchAsset(
        studentId, attemptId, created.batch.id, asset.id, `${key}-upload-${index}`,
        Readable.from([audio]), audio.length
      );
    }
    await context.service.submitLearningBatch(studentId, attemptId, created.batch.id, `${key}-submit`);
    return created.batch.id;
  };
  await createAudioBatch(context.student.id, context.attemptId, 'fairness-first', 2);
  await createAudioBatch(secondStudent.id, secondAttempt.attempt.id, 'fairness-second', 1);

  const claimedStudents = [];
  for (let index = 0; index < 3; index += 1) {
    const claim = await context.store.claimNextTranscriptionWork({
      workerId: `fairness-worker-${index}`, now: new Date('2026-08-01T12:00:01.000Z'), leaseMs: 120_000
    });
    assert.ok(claim);
    const work = [...context.store.learningBatchWorkItems.values()].flat()
      .find((candidate) => candidate.id === claim.workItemId);
    claimedStudents.push(context.store.learningBatches.get(work.batchId).studentId);
  }
  assert.notEqual(claimedStudents[0], claimedStudents[1],
    'a ready second student receives the next claim before the first student is drained');
  const claimCounts = [...new Set(claimedStudents)].map((studentId) =>
    claimedStudents.filter((candidate) => candidate === studentId).length).sort();
  assert.deepEqual(claimCounts, [1, 2], 'the student with two ready assets receives the remaining claim');
});

test('text batch requires confirmation before creating an immutable learning version and mapped-question result', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: A because the direct calculation gives one.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-auto-batch',
    { files: [{ displayName: 'work.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: Buffer.byteLength(text) }] }
  );
  assert.equal(created.batch.baseVersion, 1);
  assert.equal(created.batch.status, 'DRAFT');
  assert.equal('storageKey' in created.batch.assets[0], false);
  const assetId = created.batch.assets[0].id;
  const originalGet = context.service.batchPractice.get.bind(context.service.batchPractice);
  context.service.batchPractice.get = async () => { throw new Error('projection failed after durable finalize'); };
  const uploaded = await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, assetId,
    'upload-auto-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  context.service.batchPractice.get = originalGet;
  assert.equal(uploaded.asset.status, 'NORMALIZED');
  assert.equal(uploaded.asset.sha256, batchSha256(text));
  assert.equal((await readdir(join(context.root, 'objects'))).length, 1,
    'a post-finalize projection failure seam must not be able to delete the committed blob');
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-auto-batch'
  );
  const workerFence = await claimBatchExtraction(context);
  const job = await context.service.prepareLearningBatchDecomposition(
    context.student.id, context.attemptId, created.batch.id
  );
  const recorded = await context.service.recordLearningBatchDecomposition(
    context.student.id, context.attemptId, created.batch.id,
    {
      masterPlanHash: job.plan.masterPlanHash, outputs: gatewayOutputs(job.plan),
      runMetadata: gatewayRunMetadataForPlan(job.plan), workerFence
    }
  );
  assert.equal(recorded.batch.status, 'NEEDS_CONFIRMATION');
  assert.ok(recorded.batch.mapping.items[0].confirmationReasons.includes('MODEL_DERIVED_REQUIRES_CONFIRMATION'));
  const confirmed = await confirmExtractedBatch(context, recorded.batch, 'confirm-auto-batch');
  assert.equal(confirmed.batch.status, 'COMMITTED');
  assert.equal(confirmed.batch.committedVersion, 2);
  assert.equal(confirmed.batch.result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  assert.equal(confirmed.batch.result.mappedQuestionCount, 1);
  const learning = await context.service.getLearningSubmission(context.student.id, context.attemptId);
  assert.equal(learning.version, 2);
  const versions = context.store.learningVersions.get(learning.id);
  assert.equal(versions.length, 2);
  assert.equal(versions[1].creationReason, 'BATCH_COMMIT');
  const committedResponses = context.store.learningResponses.get(versions[1].id);
  assert.equal(committedResponses.length, 1);
  assert.equal(committedResponses[0].answerOrigin, 'BATCH_CONFIRMED');
  assert.equal(committedResponses[0].reasoningOrigin, 'BATCH_CONFIRMED_EVIDENCE');
  assert.equal(confirmed.batch.confirmation.responses[0].reasoningText,
    recorded.batch.mapping.items[0].evidenceText);
  const official = await context.service.getResults(context.student.id, context.attemptId);
  assert.equal(official.submissions.length, 1);
  assert.equal(official.finalSubmission.score.totalPoints, 37.5);
  const deletedCommitted = await context.service.deleteLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'delete-committed-confirmation'
  );
  assert.equal(deletedCommitted.batch.deletionState, 'COMPLETE');
  assert.equal(deletedCommitted.batch.assets.length, 0);
  assert.equal(deletedCommitted.batch.mapping, null);
  assert.equal(deletedCommitted.batch.confirmation.responses[0].reasoningText,
    recorded.batch.mapping.items[0].evidenceText);
  assert.equal(deletedCommitted.batch.result.mappedQuestionCount, 1);
  assert.equal(context.store.learningResponses.get(versions[1].id)[0].reasoningText,
    recorded.batch.mapping.items[0].evidenceText);
});

test('HTTP raw PUT stays stream-based, retries deterministically, and low-confidence mapping waits for explicit confirmation', async (t) => {
  const context = await fixture(t);
  const app = await buildApp({ service: context.service, config, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode: 'batch-student-code' }
  });
  assert.equal(login.statusCode, 200);
  const auth = { cookie: cookies(login), csrf: login.json().csrfToken };
  const text = 'Question 1: I think the answer is B but I am not sure.';
  const create = await app.inject({
    method: 'POST', url: `/api/amc12/attempts/${context.attemptId}/learning-batches`,
    headers: { cookie: auth.cookie, 'x-csrf-token': auth.csrf, 'idempotency-key': 'http-create-low' },
    payload: { files: [{ displayName: 'uncertain.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  });
  assert.equal(create.statusCode, 201, create.body);
  const batch = create.json().batch;
  const uploadUrl = `/api/amc12/attempts/${context.attemptId}/learning-batches/${batch.id}/assets/${batch.assets[0].id}/body`;
  const uploadHeaders = {
    cookie: auth.cookie, 'x-csrf-token': auth.csrf, 'idempotency-key': 'http-upload-low',
    'content-type': 'application/octet-stream'
  };
  const upload = await app.inject({ method: 'PUT', url: uploadUrl, headers: uploadHeaders, payload: Buffer.from(text) });
  assert.equal(upload.statusCode, 200, upload.body);
  assert.equal(upload.json().asset.status, 'NORMALIZED');
  const retry = await app.inject({ method: 'PUT', url: uploadUrl, headers: uploadHeaders, payload: Buffer.from(text) });
  assert.equal(retry.statusCode, 200, retry.body);
  assert.equal(retry.json().replayed, true);
  assert.equal((await readdir(join(context.root, 'objects'))).length, 1);
  const submit = await app.inject({
    method: 'POST', url: `/api/amc12/attempts/${context.attemptId}/learning-batches/${batch.id}/submit`,
    headers: { cookie: auth.cookie, 'x-csrf-token': auth.csrf, 'idempotency-key': 'http-submit-low' }
  });
  assert.equal(submit.statusCode, 200, submit.body);
  const workerFence = await claimBatchExtraction(context);
  const job = await context.service.prepareLearningBatchDecomposition(context.student.id, context.attemptId, batch.id);
  const mapped = await context.service.recordLearningBatchDecomposition(
    context.student.id, context.attemptId, batch.id,
    {
      masterPlanHash: job.plan.masterPlanHash,
      outputs: gatewayOutputs(job.plan, { confidence: 0.4, answer: 'B' }),
      runMetadata: gatewayRunMetadataForPlan(job.plan),
      workerFence
    }
  );
  assert.equal(mapped.batch.status, 'NEEDS_CONFIRMATION');
  assert.equal(mapped.batch.mapping.items[0].evidenceText, text);
  assert.equal(mapped.batch.mapping.items[0].reasoningSummary, 'The student used a direct calculation.');
  const overlong = await app.inject({
    method: 'POST', url: `/api/amc12/attempts/${context.attemptId}/learning-batches/${batch.id}/confirm`,
    headers: { cookie: auth.cookie, 'x-csrf-token': auth.csrf, 'idempotency-key': 'http-confirm-overlong' },
    payload: {
      mappingRevision: mapped.batch.mapping.revision,
      responses: [{
        questionNumber: 1, selectedOption: 'A', reasoningText: 'x'.repeat(8_001),
        sourceItemIds: [mapped.batch.mapping.items[0].id]
      }],
      discardedItemIds: []
    }
  });
  assert.equal(overlong.statusCode, 400, overlong.body);
  const confirm = await app.inject({
    method: 'POST', url: `/api/amc12/attempts/${context.attemptId}/learning-batches/${batch.id}/confirm`,
    headers: { cookie: auth.cookie, 'x-csrf-token': auth.csrf, 'idempotency-key': 'http-confirm-low' },
    payload: {
      mappingRevision: mapped.batch.mapping.revision,
      responses: [{
        questionNumber: 1, selectedOption: 'A', reasoningText: 'I corrected the arithmetic.',
        sourceItemIds: [mapped.batch.mapping.items[0].id]
      }],
      discardedItemIds: []
    }
  });
  assert.equal(confirm.statusCode, 200, confirm.body);
  assert.equal(confirm.json().batch.status, 'COMMITTED');
  assert.equal(confirm.json().batch.committedVersion, 2);
  assert.equal(confirm.json().batch.confirmation.responses[0].reasoningOrigin,
    'BATCH_CONFIRMATION_EDIT');
  assert.equal(confirm.json().batch.confirmation.responses[0].reasoningText,
    'I corrected the arithmetic.');
});

test('ambiguous finalize return preserves a committed blob and deterministic retry observes NORMALIZED', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: durable despite a lost commit acknowledgement.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-ambiguous-upload',
    { files: [{ displayName: 'ambiguous.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  const originalWithAttemptLock = context.store.withAttemptLock.bind(context.store);
  let injectAmbiguousFailure = true;
  context.store.withAttemptLock = async (attemptId, work) => {
    let completedInsideCommittedTransaction = false;
    const result = await originalWithAttemptLock(attemptId, async (tx) => {
      if (!tx || !injectAmbiguousFailure) return work(tx);
      const originalComplete = tx.completeLearningBatchAssetUpload.bind(tx);
      tx.completeLearningBatchAssetUpload = async (input) => {
        const completed = await originalComplete(input);
        completedInsideCommittedTransaction = Boolean(completed);
        return completed;
      };
      return work(tx);
    });
    if (completedInsideCommittedTransaction) {
      injectAmbiguousFailure = false;
      throw new Error('connection lost after COMMIT');
    }
    return result;
  };
  await assert.rejects(() => context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'ambiguous-upload-key', Readable.from([text]), Buffer.byteLength(text)
  ), /connection lost after COMMIT/);
  assert.equal((await readdir(join(context.root, 'objects'))).length, 1);
  const durable = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
  assert.equal(durable.batch.assets[0].status, 'NORMALIZED');
  const replay = await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'ambiguous-upload-key', Readable.from([text]), Buffer.byteLength(text)
  );
  assert.equal(replay.replayed, true);
  assert.equal((await readdir(join(context.root, 'objects'))).length, 1);
});

test('persistent per-student active batch limit is enforced under concurrent creates', async (t) => {
  const context = await fixture(t);
  const results = await Promise.allSettled(Array.from({ length: 4 }, (_, index) =>
    context.service.createLearningBatch(
      context.student.id, context.attemptId, `active-limit-${index}`,
      { files: [{ displayName: `${index}.txt`, kind: 'TEXT', contentType: 'text/plain', declaredBytes: 1 }] }
    )));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 3);
  const rejected = results.find((result) => result.status === 'rejected');
  assert.equal(rejected.reason.code, 'BATCH_ACTIVE_LIMIT');
  assert.equal(context.store.learningBatches.size, 3);
});

test('delete tombstones before purge, cancels work, releases quota, and exposes no private evidence', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: unfinished evidence.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-delete-batch',
    { files: [{ displayName: 'delete.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-delete-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-delete-batch'
  );
  const deleted = await context.service.deleteLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'delete-batch-evidence'
  );
  assert.equal(deleted.batch.deletionState, 'COMPLETE');
  assert.equal(deleted.batch.assets.length, 0);
  assert.equal(deleted.batch.mapping, null);
  assert.equal((await readdir(join(context.root, 'objects'))).length, 0);
  assert.equal(context.store.learningBatchQuota.get(created.batch.assets[0].id).status, 'RELEASED');
  assert.equal(context.store.learningBatchEvidence.get(created.batch.id)[0].normalizedText, null);
  assert.equal(context.store.learningBatchWorkItems.get(created.batch.id)[0].status, 'CANCELLED');
  const replay = await context.service.deleteLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'delete-batch-evidence'
  );
  assert.equal(replay.batch.deletionState, 'COMPLETE');
});

test('batch worker completes through the unified claim and exact lease fence', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: A by a direct computation.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-worker-batch',
    { files: [{ displayName: 'worker.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-worker-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-worker-batch'
  );
  const workerId = 'shared-ai-worker';
  const gatewayClient = {
    calls: [],
    async decomposeChunk(request, { plan }) {
      this.calls.push(request.chunkId);
      return {
        decomposition: gatewayOutputs(plan).find((output) => output.chunkId === request.chunkId),
        runMetadata: gatewayRunMetadata()
      };
    }
  };
  const batchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, gatewayClient, workerId,
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  const dispatcher = new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker, workerId,
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  const result = await dispatcher.runOnce();
  assert.deepEqual(result, { processed: true, status: 'NEEDS_CONFIRMATION', chunks: 1 });
  assert.deepEqual(gatewayClient.calls, ['chunk-0001']);
  let stored = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
  assert.equal(stored.batch.status, 'NEEDS_CONFIRMATION');
  await confirmExtractedBatch(context, stored.batch, 'confirm-worker-batch');
  stored = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
  assert.equal(stored.batch.status, 'COMMITTED');
  assert.equal(context.store.learningBatchMappings.get(created.batch.id)[0].gatewayRunMetadata[0].provider, 'openai');
});

test('batch Gateway authorization is rechecked immediately and later learning evidence makes zero provider calls', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: A because provider authorization is current.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-batch-provider-reauth',
    { files: [{ displayName: 'reauth.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-batch-provider-reauth', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-batch-provider-reauth'
  );
  const workerId = 'batch-provider-reauth-worker';
  const claimed = await context.store.claimNextAiWork({
    workerId, now: new Date('2026-08-01T12:00:01.000Z'), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  const learning = context.store.learningSubmissions.get(context.attemptId);
  learning.currentVersion += 1;
  let providerCalls = 0;
  const worker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId,
    gatewayClient: { async decomposeChunk() { providerCalls += 1; throw new Error('must not call Gateway'); } },
    clock: () => new Date('2026-08-01T12:00:02.000Z')
  });
  assert.deepEqual(await worker.processClaimed(claimed.job), {
    processed: false, staleLease: true
  });
  assert.equal(providerCalls, 0);
});

test('dispatcher shutdown aborts a slow batch Gateway call without stale completion or failure', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: slow decomposition for shutdown.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-shutdown-batch',
    { files: [{ displayName: 'shutdown.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-shutdown-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-shutdown-batch'
  );
  let enteredResolve;
  const entered = new Promise((resolve) => { enteredResolve = resolve; });
  const workerId = 'shutdown-batch-worker';
  const batchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId,
    gatewayClient: {
      async decomposeChunk(_request, { signal }) {
        enteredResolve();
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), {
            code: 'GATEWAY_ABORTED', retryable: true, errorClass: 'transient'
          })), { once: true });
        });
      }
    },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  const dispatcher = new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker, workerId,
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  const controller = new AbortController();
  assert.equal((await dispatcher.tick({ signal: controller.signal })).claimed, 1);
  await entered;
  controller.abort();
  await dispatcher.drain();
  const work = context.store.learningBatchWorkItems.get(created.batch.id)
    .find((item) => item.workType === 'BATCH_EXTRACTION');
  assert.equal(work.status, 'RUNNING',
    'shutdown leaves the durable lease for normal expiry/reclaim');
  assert.equal(context.store.learningBatchMappings.get(created.batch.id).length, 0);
  assert.equal(context.store.learningBatches.get(created.batch.id).status, 'PROCESSING');
  assert.deepEqual(await dispatcher.tick({ signal: controller.signal }), {
    claimed: 0, active: 0, shuttingDown: true
  });
});

test('mixed text and audio follows durable transcription, purging, extraction, and report flow', async (t) => {
  const context = await fixture(t);
  const artifact = approvedContextArtifact(context.form);
  await new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date('2026-08-01T12:00:00.000Z'),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const text = 'Question 1: A because a direct calculation gives the first choice.';
  const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(128, 7)]);
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-mixed-batch',
    { files: [
      { displayName: 'q1.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) },
      { displayName: 'q2.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length }
    ] }
  );
  for (const [asset, body, key] of [
    [created.batch.assets[0], Buffer.from(text), 'upload-mixed-text'],
    [created.batch.assets[1], audio, 'upload-mixed-audio']
  ]) {
    await context.service.uploadLearningBatchAsset(
      context.student.id, context.attemptId, created.batch.id, asset.id,
      key, Readable.from([body]), body.length
    );
  }
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-mixed-batch'
  );
  const providerCalls = [];
  const transcriptId = '9ea68fd3-f953-42c1-9742-976c447fb463';
  const transcriptionPort = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload({ body, contentLength }) {
        let bytes = 0;
        for await (const chunk of body) bytes += chunk.length;
        assert.equal(bytes, contentLength);
        providerCalls.push('upload');
        return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' };
      },
      async submit() {
        providerCalls.push('submit');
        return { transcriptId, status: 'queued' };
      },
      async getTranscript() {
        providerCalls.push('poll');
        return {
          status: 'completed', text: 'Question 2: A because the same direct method applies.',
          confidence: 0.96, audioDurationSeconds: 12.5
        };
      },
      async deleteTranscript() {
        providerCalls.push('delete');
        return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
      }
    },
    store: context.store,
    assetReader: context.service.batchPractice.privateUploadStore,
    orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  const transcriptionWorker = new BatchTranscriptionWorker({
    store: context.store, port: transcriptionPort, workerId: 'mixed-transcription-worker',
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  assert.equal((await transcriptionWorker.runOnce()).status, 'SUBMITTED');
  assert.equal((await transcriptionWorker.runOnce()).status, 'TRANSCRIPT_STORED_DELETE_PENDING');
  assert.equal((await transcriptionWorker.runOnce()).status, 'DELETION_EVIDENCED');
  assert.deepEqual(providerCalls, ['upload', 'submit', 'poll', 'delete']);
  const audioAsset = context.store.learningBatchAssets.get(created.batch.id)[1];
  assert.equal(audioAsset.status, 'PURGED');
  assert.equal(audioAsset.storageKey, null);
  assert.equal(context.store.learningBatchProviderArtifacts.get(created.batch.id)[0].status, 'DELETION_EVIDENCED');

  const batchWorkerId = 'mixed-extraction-worker';
  const batchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId: batchWorkerId,
    gatewayClient: {
      async decomposeChunk(request, { plan }) {
        return {
          decomposition: gatewayOutputs(plan).find((output) => output.chunkId === request.chunkId),
          runMetadata: gatewayRunMetadata()
        };
      }
    },
    clock: () => new Date('2026-08-01T12:00:03.000Z')
  });
  const extracted = await new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker,
    workerId: batchWorkerId, clock: () => new Date('2026-08-01T12:00:03.000Z')
  }).runOnce();
  assert.equal(extracted.status, 'NEEDS_CONFIRMATION');
  const mapped = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
  await confirmExtractedBatch(context, mapped.batch, 'confirm-mixed-batch');
  const submission = context.store.learningSubmissions.get(context.attemptId);
  const version = context.store.learningVersions.get(submission.id)
    .find((candidate) => candidate.versionNumber === 2);
  assert.equal(context.store.learningResponses.get(version.id).length, 2);
  const review = new LearningReviewWorker({
    store: context.store, inferenceClient: new FakeInferenceClient(), workerId: 'mixed-review-worker',
    clock: () => new Date('2026-08-01T12:00:04.000Z')
  });
  while ((await review.runOnce()).processed) {}
  assert.equal(context.store.learningReports.has(version.id), true);
});

test('crash after upload barrier reaches retention-window observation, failed batch, and durable local purge', async (t) => {
  const context = await fixture(t);
  const created = await submittedAudioBatch(context, 'upload-crash');
  const startedAt = new Date('2026-08-01T12:00:01.000Z');
  const claim = await context.store.claimNextTranscriptionWork({
    workerId: 'upload-crash-worker', now: startedAt, leaseMs: 10_000
  });
  const deadline = new Date(startedAt.getTime() + RETENTION_OFFSET_MS);
  const barrier = await context.store.beginTranscriptionUploadCall({
    workItemId: claim.workItemId, leaseToken: claim.leaseToken,
    deletionGeneration: claim.deletionGeneration, startedAt,
    providerRetentionNotBefore: deadline, retentionProfile: RETENTION_PROFILE
  });
  assert.match(barrier.callId, /^[0-9a-f-]{36}$/i);

  let now = new Date('2026-08-01T12:00:12.000Z');
  let providerCalls = 0;
  const port = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: { async upload() { providerCalls += 1; throw new Error('must not retry ambiguous upload'); } },
    store: context.store, assetReader: context.service.batchPractice.privateUploadStore,
    orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) },
    clock: () => now
  });
  const transcription = new BatchTranscriptionWorker({
    store: context.store, port, workerId: 'upload-crash-restart', clock: () => now
  });
  assert.equal((await transcription.runOnce()).status, 'UPLOAD_RETENTION_PENDING');
  assert.equal(providerCalls, 0);

  now = deadline;
  const cleanup = new ProviderOrphanCleanupWorker({
    store: context.store,
    client: { async deleteTranscript() { providerCalls += 1; throw new Error('TTL is not a DELETE claim'); } },
    workerId: 'upload-retention-worker', clock: () => now
  });
  assert.equal((await cleanup.runOnce()).status, 'provider-retention-window-elapsed');
  assert.equal((await transcription.runOnce()).status, 'FAILED_LOCAL_AUDIO_PURGED');
  assert.equal(providerCalls, 0);
  const artifact = context.store.learningBatchProviderArtifacts.get(created.batch.id)[0];
  const asset = context.store.learningBatchAssets.get(created.batch.id)[0];
  const work = context.store.learningBatchWorkItems.get(created.batch.id)
    .find((item) => item.workType === 'TRANSCRIBE_AUDIO');
  assert.equal(artifact.status, 'PROVIDER_RETENTION_PENDING');
  assert.equal(artifact.retentionWindowElapsedAt, null);
  assert.equal(context.store.learningBatchProviderOrphanAudit
    .some((event) => event.event === 'PROVIDER_RETENTION_WINDOW_ELAPSED'
      && new Date(event.evidencedAt).getTime() === deadline.getTime()), true);
  assert.equal(asset.status, 'PURGED');
  assert.equal(asset.storageKey, null);
  assert.equal(work.status, 'FAILED');
  assert.equal(context.store.learningBatches.get(created.batch.id).status, 'FAILED');
});

test('known submit response is cleaned only by durable orphan lease and purges local audio', async (t) => {
  for (const deletionRequested of [false, true]) {
    const context = await fixture(t);
    const key = deletionRequested ? 'known-submit-delete' : 'known-submit-active';
    const created = await submittedAudioBatch(context, key);
    let now = new Date('2026-08-01T12:00:01.000Z');
    const transcriptId = deletionRequested
      ? '4ea68fd3-f953-42c1-9742-976c447fb463'
      : '5ea68fd3-f953-42c1-9742-976c447fb463';
    let providerDeletes = 0;
    const originalRecordSubmitted = context.store.recordSubmitted.bind(context.store);
    context.store.recordSubmitted = async () => false;
    const port = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
      client: {
        async upload() {
          return { uploadUrl: `https://cdn.assemblyai.com/upload/${transcriptId}` };
        },
        async submit() { return { transcriptId, status: 'queued' }; },
        async deleteTranscript() { providerDeletes += 1; throw new Error('submit path must not delete'); }
      },
      store: context.store, assetReader: context.service.batchPractice.privateUploadStore,
      orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) },
      clock: () => now
    });
    const submitWorker = new BatchTranscriptionWorker({
      store: context.store, port, workerId: `known-submit-${deletionRequested}`, clock: () => now
    });
    assert.equal((await submitWorker.runOnce()).orphanHandled, true);
    assert.equal(providerDeletes, 0, 'submit response cannot bypass the durable cleanup lease');
    context.store.recordSubmitted = originalRecordSubmitted;

    if (deletionRequested) {
      await context.service.deleteLearningBatch(
        context.student.id, context.attemptId, created.batch.id, `${key}-delete`
      );
    }
    now = new Date('2026-08-01T12:00:02.000Z');
    const orphan = new ProviderOrphanCleanupWorker({
      store: context.store,
      client: { async deleteTranscript(id) {
        providerDeletes += 1;
        return { transcriptId: id, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
      } },
      workerId: `known-cleanup-${deletionRequested}`, clock: () => now
    });
    assert.equal((await orphan.runOnce()).status, 'provider-delete-response');
    assert.equal(providerDeletes, 1);
    if (!deletionRequested) {
      now = new Date('2026-08-01T12:00:03.000Z');
      assert.equal((await submitWorker.runOnce()).status, 'FAILED_LOCAL_AUDIO_PURGED');
    }
    const asset = context.store.learningBatchAssets.get(created.batch.id)[0];
    const artifact = context.store.learningBatchProviderArtifacts.get(created.batch.id)[0];
    assert.equal(asset.status, 'PURGED');
    assert.equal(asset.storageKey, null);
    assert.equal(artifact.status, 'DELETION_EVIDENCED');
    if (deletionRequested) {
      assert.equal(context.store.learningBatches.get(created.batch.id).deletionState, 'COMPLETE');
    }
  }
});

test('SUBMIT_MAY deletion reclaims the new generation, reconciles all matches, and reaches COMPLETE', async (t) => {
  const context = await fixture(t);
  const created = await submittedAudioBatch(context, 'submit-crash-delete');
  const firstAt = new Date('2026-08-01T12:00:01.000Z');
  const first = await context.store.claimNextTranscriptionWork({
    workerId: 'submit-crash-first', now: firstAt, leaseMs: 120_000
  });
  const uploadUrl = 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a';
  const uploadUrlSha256 = createHash('sha256').update(uploadUrl).digest('hex');
  const upload = await context.store.beginTranscriptionUploadCall({
    workItemId: first.workItemId, leaseToken: first.leaseToken,
    deletionGeneration: first.deletionGeneration, startedAt: firstAt,
    providerRetentionNotBefore: new Date(firstAt.getTime() + RETENTION_OFFSET_MS),
    retentionProfile: RETENTION_PROFILE
  });
  assert.equal(await context.store.recordTranscriptionUploadResponse({
    workItemId: first.workItemId, leaseToken: first.leaseToken,
    deletionGeneration: first.deletionGeneration, uploadCallId: upload.callId,
    uploadUrlSha256, returnedAt: firstAt
  }), true);
  const submit = await context.store.beginTranscriptionSubmitCall({
    workItemId: first.workItemId, leaseToken: first.leaseToken,
    deletionGeneration: first.deletionGeneration, uploadCallId: upload.callId,
    uploadUrlSha256, startedAt: firstAt
  });
  const retentionDeadline = new Date(firstAt.getTime() + RETENTION_OFFSET_MS);
  const retentionObserver = new ProviderOrphanCleanupWorker({
    store: context.store,
    client: { async deleteTranscript() { throw new Error('retention observation must not delete'); } },
    workerId: 'submit-retention-observer', clock: () => retentionDeadline
  });
  assert.equal((await retentionObserver.runOnce()).status, 'provider-retention-window-elapsed');
  assert.equal([...context.store.learningBatchProviderOrphanCleanupJobs.values()]
    .find((job) => job.cleanupKind === 'OBSERVE_RETENTION_WINDOW').status,
  'MANUAL_VERIFICATION_REQUIRED');
  const tombstone = await context.service.deleteLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-crash-user-delete'
  );
  assert.equal(tombstone.batch.deletionGeneration, 1);
  assert.equal(tombstone.batch.deletionState, 'PROVIDER_RETENTION_PENDING');

  const transcriptIds = [
    '1ea68fd3-f953-42c1-9742-976c447fb463',
    '2ea68fd3-f953-42c1-9742-976c447fb463'
  ];
  const deletedIds = [];
  const now = new Date(retentionDeadline.getTime() + 2_000);
  const port = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async listTranscripts({ createdOn }) {
        return {
          transcripts: createdOn === '2026-08-01'
            ? transcriptIds.map((transcriptId) => ({ transcriptId, audioUrl: uploadUrl })) : [],
          nextBeforeId: null
        };
      },
      async deleteTranscript(transcriptId) {
        deletedIds.push(transcriptId);
        return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
      }
    },
    store: context.store, assetReader: context.service.batchPractice.privateUploadStore,
    orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) },
    clock: () => now
  });
  const transcription = new BatchTranscriptionWorker({
    store: context.store, port, workerId: 'submit-crash-reconcile', clock: () => now
  });
  assert.equal((await transcription.runOnce()).status, 'RECONCILED_DELETE_PENDING');
  assert.equal((await transcription.runOnce()).status, 'DELETION_EVIDENCED');
  const orphan = new ProviderOrphanCleanupWorker({
    store: context.store, client: port.client,
    workerId: 'submit-crash-extra-cleanup', clock: () => now
  });
  assert.equal((await orphan.runOnce()).status, 'provider-delete-response');
  assert.deepEqual(deletedIds.sort(), transcriptIds.sort());
  assert.equal(context.store.learningBatches.get(created.batch.id).deletionState, 'COMPLETE');
  assert.equal(context.store.learningBatchProviderArtifacts.get(created.batch.id)[0].submitCallId, submit.callId);
});

test('transcription provider is never invoked after FINAL entitlement is tampered, removed, or no longer final', async (t) => {
  for (const scenario of ['owner-tampered', 'final-removed', 'attempt-not-final']) {
    const context = await fixture(t);
    const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(32, 1)]);
    const created = await context.service.createLearningBatch(
      context.student.id, context.attemptId, `create-reauth-${scenario}`,
      { files: [{ displayName: 'voice.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length }] }
    );
    await context.service.uploadLearningBatchAsset(
      context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
      `upload-reauth-${scenario}`, Readable.from([audio]), audio.length
    );
    await context.service.submitLearningBatch(
      context.student.id, context.attemptId, created.batch.id, `submit-reauth-${scenario}`
    );
    const learning = context.store.learningSubmissions.get(context.attemptId);
    if (scenario === 'owner-tampered') {
      context.store.attempts.get(context.attemptId).studentId = '00000000-0000-4000-8000-000000000099';
    }
    if (scenario === 'final-removed') {
      context.store.submissions.set(context.attemptId,
        context.store.submissions.get(context.attemptId)
          .filter((value) => value.id !== learning.officialSubmissionId));
    }
    if (scenario === 'attempt-not-final') context.store.attempts.get(context.attemptId).phase = 'ACTIVE';
    let providerCalls = 0;
    const port = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
      client: { async upload() { providerCalls += 1; throw new Error('must not invoke provider'); } },
      store: context.store, assetReader: context.service.batchPractice.privateUploadStore,
      orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) }
    });
    const result = await new BatchTranscriptionWorker({
      store: context.store, port, workerId: `reauth-worker-${scenario}`,
      clock: () => new Date('2026-08-01T12:00:01.000Z')
    }).runOnce();
    assert.deepEqual(result, { processed: false });
    assert.equal(providerCalls, 0);
  }
});

test('user deletion fences an in-flight poll and requeues provider cleanup after either ACTIVE or normalized audio', async (t) => {
  for (const scenario of ['poll-in-flight', 'normalized']) {
    const context = await fixture(t);
    const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(48, 2)]);
    const created = await context.service.createLearningBatch(
      context.student.id, context.attemptId, `create-delete-race-${scenario}`,
      { files: [{ displayName: 'race.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: audio.length }] }
    );
    await context.service.uploadLearningBatchAsset(
      context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
      `upload-delete-race-${scenario}`, Readable.from([audio]), audio.length
    );
    await context.service.submitLearningBatch(
      context.student.id, context.attemptId, created.batch.id, `submit-delete-race-${scenario}`
    );
    const transcriptId = scenario === 'poll-in-flight'
      ? '6ea68fd3-f953-42c1-9742-976c447fb463' : '7ea68fd3-f953-42c1-9742-976c447fb463';
    let pollCalls = 0;
    let deleteCalls = 0;
    const port = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
      client: {
        async upload() {
          return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' };
        },
        async submit() { return { transcriptId, status: 'queued' }; },
        async getTranscript() {
          pollCalls += 1;
          return { status: 'completed', text: 'Question 1: A after checking.', confidence: 0.97, audioDurationSeconds: 4 };
        },
        async deleteTranscript() {
          deleteCalls += 1;
          return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
        }
      },
      store: context.store, assetReader: context.service.batchPractice.privateUploadStore,
      orphanAudit: { record: (event) => context.store.recordProviderOrphanAudit(event) },
      clock: () => new Date('2026-08-01T12:00:01.000Z')
    });
    const worker = new BatchTranscriptionWorker({
      store: context.store, port, workerId: `delete-race-${scenario}`,
      clock: () => new Date('2026-08-01T12:00:01.000Z')
    });
    assert.equal((await worker.runOnce()).status, 'SUBMITTED');
    if (scenario === 'poll-in-flight') {
      const stalePoll = await context.store.claimNextTranscriptionWork({
        workerId: `stale-poll-${scenario}`, now: new Date('2026-08-01T12:00:01.000Z'), leaseMs: 120_000
      });
      const deleted = await context.service.deleteLearningBatch(
        context.student.id, context.attemptId, created.batch.id, `delete-race-request-${scenario}`
      );
      assert.equal(deleted.batch.deletionState, 'PROVIDER_DELETE_PENDING');
      assert.deepEqual(await port.pollOnce(stalePoll), { processed: false, staleWrite: true });
      assert.equal(pollCalls, 0);
    } else {
      assert.equal((await worker.runOnce()).status, 'TRANSCRIPT_STORED_DELETE_PENDING');
      const deleted = await context.service.deleteLearningBatch(
        context.student.id, context.attemptId, created.batch.id, `delete-race-request-${scenario}`
      );
      assert.equal(deleted.batch.deletionState, 'PROVIDER_DELETE_PENDING');
      assert.equal(pollCalls, 1);
    }
    assert.equal((await worker.runOnce()).status, 'DELETION_EVIDENCED');
    assert.equal(deleteCalls, 1);
    const final = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
    assert.equal(final.batch.deletionState, 'COMPLETE');
  }
});

test('durable non-Tutor rotation prevents sustained analysis from starving batch extraction', async (t) => {
  const context = await fixture(t);
  const submission = context.store.learningSubmissions.get(context.attemptId);
  const version = context.store.learningVersions.get(submission.id)[0];
  const interactiveWork = context.store.learningWorkItems.get(version.id)[0];
  const contextSet = {
    id: '11111111-1111-4111-8111-111111111111', formId: version.formId,
    formVersion: version.formVersion, artifactSetHash: 'a'.repeat(64),
    questions: context.form.questions.map((question) => ({ questionNumber: question.number, solutions: [] }))
  };
  context.store.approvedContextSets.set(contextSet.id, contextSet);
  version.contextStatus = 'CONTEXT_READY';
  version.contextSetId = contextSet.id;
  const run = {
    id: '22222222-2222-4222-8222-222222222222', learningSubmissionVersionId: version.id,
    contextSetId: contextSet.id, versionNumber: version.versionNumber,
    inputHash: 'b'.repeat(64), evidenceHash: version.evidenceHash, deletionGeneration: 0,
    analysisContractVersion: 'amc-analysis-contract-v2',
    status: 'QUEUED', createdAt: new Date('2026-08-01T12:00:00.000Z'), startedAt: null,
    completedAt: null, lastErrorCode: null
  };
  context.store.analysisRuns.set(version.id, run);
  Object.assign(interactiveWork, {
    status: 'QUEUED', priority: 50, inputHash: run.inputHash, analysisRunId: run.id,
    availableAt: new Date('2026-08-01T12:00:00.000Z')
  });

  const text = 'Question 1: queued batch.';
  const batch = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-priority-batch',
    { files: [{ displayName: 'queued.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, batch.batch.id, batch.batch.assets[0].id,
    'upload-priority-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, batch.batch.id, 'submit-priority-batch'
  );
  const order = [];
  const workerId = 'priority-ai-worker';
  const dispatcher = new AiWorkDispatcher({
    store: context.store, workerId,
    interactiveWorker: { workerId, async processClaimed() { order.push('interactive'); return { processed: true }; } },
    batchWorker: { workerId, async processClaimed() { order.push('batch'); return { processed: true }; } },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  await dispatcher.runOnce();
  Object.assign(interactiveWork, {
    status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null
  });
  Object.assign(run, { status: 'QUEUED', startedAt: null });
  await dispatcher.runOnce();
  const batchWork = context.store.learningBatchWorkItems.get(batch.batch.id)
    .find((item) => item.workType === 'BATCH_EXTRACTION');
  Object.assign(batchWork, {
    status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null
  });
  await dispatcher.runOnce();
  assert.deepEqual(order, ['interactive', 'batch', 'interactive']);
  assert.deepEqual(context.store.aiDispatchState, {
    lastClaimedKind: 'INTERACTIVE_ANALYSIS', revision: 3
  });
});

test('a running batch cannot consume the slot reserved for a late interactive analysis', async (t) => {
  const context = await fixture(t);
  const text = 'Question 1: queued long batch.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-late-interactive-batch',
    { files: [{ displayName: 'long.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-late-interactive-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-late-interactive-batch'
  );
  let releaseBatch;
  const heldBatch = new Promise((resolve) => { releaseBatch = resolve; });
  const order = [];
  const workerId = 'late-interactive-worker';
  const dispatcher = new AiWorkDispatcher({
    store: context.store, workerId, concurrency: 2, maxBatchConcurrent: 1,
    interactiveWorker: { workerId, async processClaimed() { order.push('interactive'); return { processed: true }; } },
    batchWorker: { workerId, async processClaimed() { order.push('batch'); return heldBatch; } },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  assert.deepEqual(await dispatcher.tick(), { claimed: 1, active: 1 });
  assert.deepEqual(order, ['batch']);

  const submission = context.store.learningSubmissions.get(context.attemptId);
  const version = context.store.learningVersions.get(submission.id)[0];
  const work = context.store.learningWorkItems.get(version.id)[0];
  const contextSet = {
    id: '31111111-1111-4111-8111-111111111111', formId: version.formId,
    formVersion: version.formVersion, artifactSetHash: 'c'.repeat(64),
    questions: context.form.questions.map((question) => ({ questionNumber: question.number, solutions: [] }))
  };
  context.store.approvedContextSets.set(contextSet.id, contextSet);
  Object.assign(version, { contextStatus: 'CONTEXT_READY', contextSetId: contextSet.id });
  const run = {
    id: '32222222-2222-4222-8222-222222222222', learningSubmissionVersionId: version.id,
    contextSetId: contextSet.id, versionNumber: version.versionNumber,
    inputHash: 'd'.repeat(64), evidenceHash: version.evidenceHash, deletionGeneration: 0,
    analysisContractVersion: 'amc-analysis-contract-v2',
    status: 'QUEUED', createdAt: new Date('2026-08-01T12:00:00.000Z'), startedAt: null,
    completedAt: null, lastErrorCode: null
  };
  context.store.analysisRuns.set(version.id, run);
  Object.assign(work, {
    status: 'QUEUED', priority: 50, inputHash: run.inputHash, analysisRunId: run.id,
    availableAt: new Date('2026-08-01T12:00:00.000Z')
  });
  assert.deepEqual(await dispatcher.tick(), { claimed: 1, active: 2 });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(order, ['batch', 'interactive']);
  releaseBatch({ processed: true });
  await dispatcher.drain();
});

test('dispatcher observes handler rejection without producing an unhandled promise', async () => {
  let claimed = false;
  const errors = [];
  const workerId = 'rejecting-dispatch-worker';
  const dispatcher = new AiWorkDispatcher({
    store: {
      async claimNextAiWork() {
        if (claimed) return null;
        claimed = true;
        return { kind: 'INTERACTIVE_ANALYSIS', job: {} };
      }
    },
    workerId,
    interactiveWorker: {
      workerId,
      async processClaimed() { throw Object.assign(new Error('sensitive detail'), { code: 'HANDLER_FAILED' }); }
    },
    batchWorker: null,
    onError: (error) => errors.push(error.code)
  });
  assert.equal((await dispatcher.tick()).claimed, 1);
  await dispatcher.drain();
  assert.deepEqual(errors, ['HANDLER_FAILED']);
});

test('overlapping dispatcher ticks serialize slow claims and never exceed local concurrency', async () => {
  let claimCalls = 0;
  let releaseFirstClaim;
  const firstClaimGate = new Promise((resolve) => { releaseFirstClaim = resolve; });
  let releaseHandlers;
  const handlerGate = new Promise((resolve) => { releaseHandlers = resolve; });
  const workerId = 'serialized-dispatch-worker';
  const dispatcher = new AiWorkDispatcher({
    store: {
      async claimNextAiWork() {
        claimCalls += 1;
        if (claimCalls === 1) await firstClaimGate;
        if (claimCalls <= 3) return { kind: 'INTERACTIVE_ANALYSIS', job: { id: claimCalls } };
        return null;
      }
    },
    workerId,
    concurrency: 2,
    maxBatchConcurrent: 1,
    interactiveWorker: { workerId, async processClaimed() { return handlerGate; } },
    batchWorker: null
  });
  const ticks = [dispatcher.tick(), dispatcher.tick()];
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(claimCalls, 1, 'the second tick cannot enter a second slow claim');
  releaseFirstClaim();
  const results = await Promise.all(ticks);
  assert.deepEqual(results, [{ claimed: 2, active: 2 }, { claimed: 2, active: 2 }]);
  assert.equal(claimCalls, 2, 'no third item is claimed beyond local capacity');
  releaseHandlers({ processed: true });
  await dispatcher.drain();
});

test('current v3 preserves exact interactive v1 and batch v2/v3 questions and reports', async (t) => {
  const context = await fixture(t);
  const artifact = approvedContextArtifact(context.form);
  await new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date('2026-08-01T12:00:00.000Z'),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const text = 'Question 1: A because the first choice is correct.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-two-version-batch',
    { files: [{ displayName: 'v2.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-two-version-batch', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-two-version-batch'
  );
  const batchWorkerId = 'two-version-batch-worker';
  const batchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId: batchWorkerId,
    gatewayClient: {
      async decomposeChunk(request, { plan }) {
        return {
          decomposition: gatewayOutputs(plan).find((output) => output.chunkId === request.chunkId),
          runMetadata: gatewayRunMetadata()
        };
      }
    },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  await new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker,
    workerId: batchWorkerId, clock: () => new Date('2026-08-01T12:00:01.000Z')
  }).runOnce();
  const mapped = await context.service.getLearningBatch(context.student.id, context.attemptId, created.batch.id);
  await confirmExtractedBatch(context, mapped.batch, 'confirm-two-version-batch');
  const submission = context.store.learningSubmissions.get(context.attemptId);
  assert.equal(submission.currentVersion, 2);
  const versions = context.store.learningVersions.get(submission.id);
  assert.equal(versions.length, 2);
  assert.equal(versions.every((version) => context.store.learningWorkItems.get(version.id)[0].status === 'QUEUED'), true);
  const inferenceClient = new FakeInferenceClient();
  const interactiveWorker = new LearningReviewWorker({
    store: context.store, inferenceClient, workerId: 'two-version-review-worker',
    clock: () => new Date('2026-08-01T12:00:02.000Z')
  });
  const storedForm = [...context.store.forms.values()][0];
  const originalScoring = structuredClone(storedForm.questions[0]);
  Object.assign(storedForm.questions[0], {
    correctOption: 'C', acceptedOptions: ['C'], isScored: true
  });
  assert.equal((await interactiveWorker.runOnce()).processed, true);
  assert.equal((await interactiveWorker.runOnce()).processed, true);
  assert.deepEqual(inferenceClient.calls[0].question.scoring, {
    is_scored: true, canonical_answer: 'A', accepted_options: ['A']
  }, 'batch v2 analysis uses its committed result item, not the mutable form row');
  assert.equal(inferenceClient.calls[0].question.student_answer_status, 'ACCEPTED');
  Object.assign(storedForm.questions[0], originalScoring);
  assert.equal(context.store.learningReports.has(versions[0].id), true);
  assert.equal(context.store.learningReports.has(versions[1].id), true);
  assert.equal(context.store.learningReports.size, 2);

  const v3Text = 'Question 1: B because I used a deliberately different method.';
  const v3Created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-three-version-batch',
    { files: [{ displayName: 'v3.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(v3Text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, v3Created.batch.id, v3Created.batch.assets[0].id,
    'upload-three-version-batch', Readable.from([v3Text]), Buffer.byteLength(v3Text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, v3Created.batch.id, 'submit-three-version-batch'
  );
  const v3WorkerId = 'three-version-batch-worker';
  const v3BatchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId: v3WorkerId,
    gatewayClient: {
      async decomposeChunk(request, { plan }) {
        return {
          decomposition: gatewayOutputs(plan, { answer: 'B' })
            .find((output) => output.chunkId === request.chunkId),
          runMetadata: gatewayRunMetadata()
        };
      }
    },
    clock: () => new Date('2026-08-01T12:00:03.000Z')
  });
  await new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker: v3BatchWorker,
    workerId: v3WorkerId, clock: () => new Date('2026-08-01T12:00:03.000Z')
  }).runOnce();
  const v3Mapped = await context.service.getLearningBatch(
    context.student.id, context.attemptId, v3Created.batch.id
  );
  await confirmExtractedBatch(context, v3Mapped.batch, 'confirm-three-version-batch');
  assert.equal(submission.currentVersion, 3);
  assert.equal(versions.length, 3);
  Object.assign(storedForm.questions[0], {
    correctOption: 'D', acceptedOptions: ['D', 'E'], isScored: true
  });
  assert.equal((await interactiveWorker.runOnce()).processed, true);
  assert.deepEqual(inferenceClient.calls[1].question.scoring, {
    is_scored: true, canonical_answer: 'A', accepted_options: ['A']
  }, 'batch v3 analysis remains pinned to its own result item');
  assert.equal(inferenceClient.calls[1].question.student_answer_status, 'NOT_ACCEPTED');
  Object.assign(storedForm.questions[0], originalScoring);
  assert.equal(context.store.learningReports.has(versions[2].id), true);
  assert.equal(context.store.learningReports.size, 3);

  const providerCallsBeforeHistoryReads = inferenceClient.calls.length;
  const historyDetail = await context.service.getLearningHistory(context.student.id, submission.id);
  assert.equal(historyDetail.sourceType, 'INTERACTIVE_FINAL');
  assert.equal(historyDetail.formVersion, context.form.version);
  assert.equal(historyDetail.currentVersion, 3);
  assert.deepEqual(historyDetail.versions.map((version) => version.versionNumber), [1, 2, 3]);
  assert.equal(historyDetail.versions[1].creationReason, 'BATCH_COMMIT');
  assert.equal(historyDetail.versions[1].mappedQuestionCount, 1);
  assert.equal(historyDetail.versions[1].batchLineage.batchId, created.batch.id);
  assert.equal(historyDetail.versions[2].batchLineage.batchId, v3Created.batch.id);
  assert.deepEqual(historyDetail.versions.map((version) => version.reportStatus),
    ['UNASSESSABLE', 'COMPLETE', 'COMPLETE']);
  const historySummary = await context.service.listLearningHistory(context.student.id, { limit: '20' });
  assert.equal(historySummary.items[0].currentVersion, 3);
  assert.deepEqual(historySummary.items[0].versions.map((version) => version.versionNumber), [1, 2, 3],
    'the list projects every immutable version summary, not only current state');

  const historicalV1 = await context.service.getLearningHistoryReport(context.student.id, submission.id, '1');
  const historicalV2 = await context.service.getLearningHistoryReport(context.student.id, submission.id, '2');
  const historicalV3 = await context.service.getLearningHistoryReport(context.student.id, submission.id, '3');
  assert.equal(historicalV1.version, 1);
  assert.equal(historicalV1.summary.totalQuestions, 25);
  assert.equal(historicalV2.version, 2);
  assert.equal(historicalV2.summary.totalQuestions, 1);
  assert.equal(historicalV3.version, 3);
  assert.equal(historicalV3.summary.totalQuestions, 1);
  assert.notEqual(historicalV1.status, historicalV2.status);
  const questionV1 = await context.service.getLearningHistoryQuestion(
    context.student.id, submission.id, '1', '1'
  );
  const questionV2 = await context.service.getLearningHistoryQuestion(
    context.student.id, submission.id, '2', '1'
  );
  const questionV3 = await context.service.getLearningHistoryQuestion(
    context.student.id, submission.id, '3', '1'
  );
  assert.ok([questionV1, questionV2, questionV3]
    .every((question) => question.formVersion === context.form.version),
  'every historical question retains the literal pinned formVersion string');
  assert.equal(questionV2.question.promptMarkdown, context.form.questions[0].promptMarkdown);
  assert.equal(questionV1.response.answerOrigin, 'OFFICIAL_FINAL');
  assert.equal(questionV1.protected.result.selectedOption, null);
  assert.equal(questionV1.protected.result.isCorrect, null);
  assert.equal(questionV1.protected.result.points, 1.5);
  assert.equal(questionV1.protected.analysis.status, 'UNASSESSABLE');
  assert.equal(questionV2.response.answerOrigin, 'BATCH_CONFIRMED');
  assert.equal(questionV2.protected.officialAnswer, context.form.questions[0].correctOption);
  assert.deepEqual(questionV2.protected.result, {
    selectedOption: 'A',
    correctOption: context.form.questions[0].correctOption,
    acceptedOptions: context.form.questions[0].acceptedOptions,
    isScored: true,
    isCorrect: true,
    points: 6
  });
  assert.equal(questionV2.protected.analysis.status, 'SUCCEEDED');
  assert.equal(questionV3.response.answerOrigin, 'BATCH_CONFIRMED');
  assert.match(questionV3.response.reasoningText, /deliberately different method/);
  assert.deepEqual(questionV3.protected.result, {
    selectedOption: 'B',
    correctOption: context.form.questions[0].correctOption,
    acceptedOptions: context.form.questions[0].acceptedOptions,
    isScored: true,
    isCorrect: false,
    points: 0
  });
  assert.equal(questionV3.protected.analysis.status, 'SUCCEEDED');

  const secondAttempt = await context.service.createAttempt(context.student.id, context.form.id);
  await context.service.final(context.student.id, secondAttempt.attempt.id, 'history-second-final', {
    expectedAnswersRevision: 0, expectedStateRevision: 0
  });
  const readStateBefore = {
    submissions: structuredClone(context.store.learningSubmissions),
    versions: structuredClone(context.store.learningVersions),
    workItems: structuredClone(context.store.learningWorkItems),
    reports: structuredClone(context.store.learningReports)
  };
  const firstPage = await context.service.listLearningHistory(context.student.id, { limit: '1' });
  assert.equal(firstPage.items.length, 1);
  assert.ok(firstPage.nextCursor);
  const secondPage = await context.service.listLearningHistory(context.student.id, {
    limit: '1', cursor: firstPage.nextCursor
  });
  assert.equal(secondPage.items.length, 1);
  assert.notEqual(secondPage.items[0].submissionId, firstPage.items[0].submissionId);
  assert.equal(secondPage.nextCursor, null);
  assert.equal(
    new Date(context.store.learningSubmissions.get(context.attemptId).updatedAt).getTime(),
    new Date(context.store.learningSubmissions.get(secondAttempt.attempt.id).updatedAt).getTime(),
    'same-timestamp submissions prove the UUID tie-breaker is complete and non-duplicating'
  );
  assert.deepEqual({
    submissions: context.store.learningSubmissions,
    versions: context.store.learningVersions,
    workItems: context.store.learningWorkItems,
    reports: context.store.learningReports
  }, readStateBefore, 'history reads never enqueue or mutate learning state');
  await assert.rejects(
    () => context.service.listLearningHistory(context.student.id, { limit: '1', cursor: 'not-a-cursor' }),
    (error) => error.code === 'INVALID_LEARNING_HISTORY_CURSOR'
  );
  await assert.rejects(
    () => context.service.listLearningHistory(context.student.id, {
      limit: '1', cursor: `${firstPage.nextCursor}=`
    }),
    (error) => error.code === 'INVALID_LEARNING_HISTORY_CURSOR',
    'non-canonical padded base64url is rejected'
  );
  await assert.rejects(
    () => context.service.getLearningHistoryQuestion(context.student.id, submission.id, '01', '1'),
    (error) => error.statusCode === 400 && error.code === 'VALIDATION_ERROR'
  );
  const other = await context.service.seedAccessCode({
    code: 'history-bola-other-code', displayName: 'History Other'
  });
  await assert.rejects(
    () => context.service.getLearningHistory(other.id, submission.id),
    (error) => error.statusCode === 404 && error.code === 'LEARNING_HISTORY_NOT_FOUND'
  );
  await assert.rejects(
    () => context.service.getLearningHistoryQuestion(other.id, submission.id, '2', '1'),
    (error) => error.statusCode === 404 && error.code === 'LEARNING_HISTORY_NOT_FOUND'
  );
  await assert.rejects(
    () => context.service.getLearningHistoryReport(other.id, submission.id, '2'),
    (error) => error.statusCode === 404 && error.code === 'LEARNING_HISTORY_NOT_FOUND'
  );
  assert.equal(inferenceClient.calls.length, providerCallsBeforeHistoryReads,
    'all learning-history GET projections make zero provider calls');
});

test('batch analysis authorization re-reads the exact committed result item before provider dispatch', async (t) => {
  const context = await fixture(t);
  const artifact = approvedContextArtifact(context.form);
  await new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date('2026-08-01T12:00:00.000Z'),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
  const text = 'Question 1: A because the committed batch evidence supports it.';
  const created = await context.service.createLearningBatch(
    context.student.id, context.attemptId, 'create-batch-auth-reread',
    { files: [{ displayName: 'auth.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: Buffer.byteLength(text) }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, context.attemptId, created.batch.id, created.batch.assets[0].id,
    'upload-batch-auth-reread', Readable.from([text]), Buffer.byteLength(text)
  );
  await context.service.submitLearningBatch(
    context.student.id, context.attemptId, created.batch.id, 'submit-batch-auth-reread'
  );
  const batchWorkerId = 'batch-auth-extraction-worker';
  const batchWorker = new BatchExtractionWorker({
    store: context.store, service: context.service, workerId: batchWorkerId,
    gatewayClient: {
      async decomposeChunk(request, { plan }) {
        return {
          decomposition: gatewayOutputs(plan).find((output) => output.chunkId === request.chunkId),
          runMetadata: gatewayRunMetadata()
        };
      }
    },
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });
  await new AiWorkDispatcher({
    store: context.store, interactiveWorker: null, batchWorker,
    workerId: batchWorkerId, clock: () => new Date('2026-08-01T12:00:01.000Z')
  }).runOnce();
  const mapped = await context.service.getLearningBatch(
    context.student.id, context.attemptId, created.batch.id
  );
  await confirmExtractedBatch(context, mapped.batch, 'confirm-batch-auth-reread');

  const client = new FakeInferenceClient();
  const workerId = 'batch-auth-review-worker';
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId,
    clock: () => new Date('2026-08-01T12:00:02.000Z')
  });
  assert.equal((await worker.runOnce()).providerCalls, 0, 'the older blank interactive version drains first');
  const claimed = await context.store.claimLearningAnalysisWork({
    workerId, now: new Date('2026-08-01T12:00:02.000Z'), leaseMs: 120_000
  });
  assert.deepEqual(claimed.questions[0].scoring, {
    isScored: true, canonicalAnswer: 'A', acceptedOptions: ['A'],
    studentAnswerIsCorrect: true, selectedOption: 'A'
  });
  context.store.learningBatchResults.get(created.batch.id).items[0].acceptedOptions = ['A', 'B'];
  assert.deepEqual(await worker.processClaimed(claimed), { processed: false, staleLease: true });
  assert.equal(client.calls.length, 0);
});
