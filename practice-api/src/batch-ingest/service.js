import { randomUUID } from 'node:crypto';
import { ApiError, badRequest, conflict, notFound, tooManyRequests } from '../errors.js';
import {
  ASSET_STATUS,
  BATCH_DELETION_STATE,
  BATCH_STATUS,
  BATCH_WORK_STATUS,
  BATCH_WORK_TYPE,
  batchSha256,
  buildBatchQuestionCatalog,
  buildDecompositionPlan,
  createBatchLearningAggregate,
  normalizeBatchFileDescriptors,
  normalizeBatchGatewayRunMetadata,
  normalizeMappingConfirmation,
  publicBatchProjection,
  validateDecompositionOutputs
} from './domain.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/;
const HASH = /^[a-f0-9]{64}$/;

function requireUuid(value, label) {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw badRequest('VALIDATION_ERROR', `${label} must be a UUID.`);
  }
  return value;
}

function requireIdempotencyKey(value) {
  if (typeof value !== 'string' || !IDEMPOTENCY_KEY.test(value)) {
    throw badRequest('IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key must be an 8-128 character opaque token.');
  }
  return value;
}

function exactBody(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).length !== keys.length || keys.some((key) => !(key in value))) {
    throw badRequest('VALIDATION_ERROR', `Request body must contain exactly: ${keys.join(', ')}.`);
  }
  return value;
}

function normalizeWorkerFence(value) {
  exactBody(value, ['workerId', 'leaseToken', 'inputHash', 'deletionGeneration']);
  if (typeof value.workerId !== 'string' || value.workerId.length < 1 || value.workerId.length > 200
      || !UUID.test(value.leaseToken) || !HASH.test(value.inputHash)
      || !Number.isSafeInteger(value.deletionGeneration) || value.deletionGeneration < 0) {
    throw badRequest('INVALID_WORKER_FENCE', 'Batch extraction completion requires its exact active lease fence.');
  }
  return { ...value };
}

function assertOwner(attempt, studentId) {
  if (!attempt || attempt.studentId !== studentId) {
    throw notFound('ATTEMPT_NOT_FOUND', 'The practice attempt was not found.');
  }
}

function storeConflict(error) {
  if (error instanceof ApiError) return error;
  const messages = {
    BATCH_QUOTA_EXCEEDED: 'Persistent private upload quota is exhausted.',
    BATCH_ACTIVE_LIMIT: 'Too many active learning batches exist for this student.',
    BATCH_NOT_UPLOADABLE: 'This batch no longer accepts uploads.',
    IDEMPOTENCY_KEY_REUSED: 'This idempotency key was already used for another upload.',
    UPLOAD_IN_PROGRESS: 'This asset upload is already in progress.',
    BATCH_NOT_SUBMITTABLE: 'Every reserved asset must be uploaded before submitting the batch.',
    BATCH_BASE_VERSION_STALE: 'Learning evidence changed after this batch began. Start a new batch.',
    BATCH_COMMIT_CONFLICT: 'The batch changed before it could be committed.'
  };
  if (messages[error?.code]) return conflict(error.code, messages[error.code]);
  return error;
}

function publicAsset(asset) {
  return {
    id: asset.id,
    position: asset.position,
    displayName: asset.displayName,
    kind: asset.kind,
    contentType: asset.contentType,
    declaredBytes: asset.declaredBytes,
    observedBytes: asset.observedBytes,
    sha256: asset.sha256,
    status: asset.status
  };
}

function publicBundle(bundle) {
  return publicBatchProjection(bundle);
}

function idempotencyRecord({ studentId, scope, key, requestHash, batchId, now }) {
  return {
    studentId, scope, key, requestHash, responseStatus: 200,
    responseBody: { batchId }, createdAt: now
  };
}

export class BatchPracticeService {
  constructor({
    store,
    privateUploadStore = null,
    clock = () => new Date(),
    studentQuotaBytes = 250 * 1024 * 1024,
    globalQuotaBytes = 2 * 1024 * 1024 * 1024,
    activeBatchLimit = 3,
    uploadByteBudget = 250 * 1024 * 1024,
    providerWorkBudget = 30,
    providerAudioByteBudget = 250 * 1024 * 1024,
    globalProviderWorkBudget = 1_000,
    globalProviderAudioByteBudget = 10 * 1024 * 1024 * 1024
  }) {
    if (!Number.isSafeInteger(studentQuotaBytes) || studentQuotaBytes < 1
        || !Number.isSafeInteger(globalQuotaBytes) || globalQuotaBytes < studentQuotaBytes
        || !Number.isSafeInteger(activeBatchLimit) || activeBatchLimit < 1 || activeBatchLimit > 100
        || !Number.isSafeInteger(uploadByteBudget) || uploadByteBudget < 1
        || !Number.isSafeInteger(providerWorkBudget) || providerWorkBudget < 1
        || !Number.isSafeInteger(providerAudioByteBudget) || providerAudioByteBudget < 1
        || !Number.isSafeInteger(globalProviderWorkBudget) || globalProviderWorkBudget < 1
        || !Number.isSafeInteger(globalProviderAudioByteBudget) || globalProviderAudioByteBudget < 1) {
      throw new Error('Learning batch quota and active-batch limits are invalid.');
    }
    this.store = store;
    this.privateUploadStore = privateUploadStore;
    this.clock = clock;
    this.studentQuotaBytes = studentQuotaBytes;
    this.globalQuotaBytes = globalQuotaBytes;
    this.activeBatchLimit = activeBatchLimit;
    this.uploadByteBudget = uploadByteBudget;
    this.providerWorkBudget = providerWorkBudget;
    this.providerAudioByteBudget = providerAudioByteBudget;
    this.globalProviderWorkBudget = globalProviderWorkBudget;
    this.globalProviderAudioByteBudget = globalProviderAudioByteBudget;
  }

  now() {
    const value = this.clock();
    return value instanceof Date ? value : new Date(value);
  }

  async create(studentId, attemptId, idempotencyKey, input) {
    requireUuid(attemptId, 'attemptId');
    const key = requireIdempotencyKey(idempotencyKey);
    exactBody(input, ['files']);
    const normalized = normalizeBatchFileDescriptors(input.files);
    const scope = `attempt:${attemptId}:learning-batch-create`;
    const requestHash = batchSha256({ action: 'learning-batch-create', files: normalized.files });
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const existing = await tx.getIdempotency(studentId, scope, key);
      if (existing) {
        if (existing.requestHash !== requestHash) throw conflict('IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused.');
        const replay = await tx.getLearningBatchBundle(existing.responseBody.batchId);
        if (!replay) throw new Error('A durable batch idempotency record lost its aggregate.');
        return { batch: publicBundle(replay), created: false };
      }
      const learning = await tx.getLearningSubmissionBundle();
      if (!learning || learning.submission.lifecycleStatus !== 'COMMITTED'
          || !['FINALIZED', 'RESET'].includes(attempt.phase)) {
        throw conflict('BATCH_REQUIRES_FINAL', 'Batch evidence can be added only to an owned finalized learning submission.');
      }
      const now = this.now();
      const batch = {
        id: randomUUID(), studentId, attemptId, learningSubmissionId: learning.submission.id,
        baseVersion: learning.submission.currentVersion, formId: learning.submission.formId,
        formVersion: learning.submission.formVersion, status: BATCH_STATUS.DRAFT, mappingRevision: 0,
        hasAudio: normalized.hasAudio, deletionState: BATCH_DELETION_STATE.ACTIVE,
        deletionGeneration: 0, deletedAt: null, submittedAt: null, committedAt: null,
        failureCode: null,
        committedVersionId: null, committedVersionNumber: null, createdAt: now, updatedAt: now
      };
      const assets = normalized.files.map((file, index) => ({
        id: randomUUID(), batchId: batch.id, position: index + 1, ...file,
        observedBytes: null, sha256: null, storageKey: null, status: ASSET_STATUS.RESERVED,
        uploadAttemptCount: 0, uploadIdempotencyKey: null, writingStartedAt: null,
        storedAt: null, normalizedAt: null, purgedAt: null, lastErrorCode: null,
        createdAt: now, updatedAt: now
      }));
      const reservations = assets.map((asset) => ({
        assetId: asset.id, batchId: batch.id, studentId, reservedBytes: asset.declaredBytes,
        status: 'RESERVED', createdAt: now, consumedAt: null, releasedAt: null
      }));
      let created;
      try {
        created = await tx.createLearningBatch({
          batch, assets, reservations,
          studentQuotaBytes: this.studentQuotaBytes, globalQuotaBytes: this.globalQuotaBytes,
          activeBatchLimit: this.activeBatchLimit
        });
      } catch (error) {
        throw storeConflict(error);
      }
      await tx.putIdempotency(idempotencyRecord({ studentId, scope, key, requestHash, batchId: batch.id, now }));
      return { batch: publicBundle(created), created: true };
    });
  }

  async list(studentId, attemptId) {
    requireUuid(attemptId, 'attemptId');
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      return { batches: (await tx.listLearningBatchBundles()).map(publicBundle) };
    });
  }

  async get(studentId, attemptId, batchId) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const bundle = await tx.getLearningBatchBundle(batchId);
      if (!bundle) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      return { batch: publicBundle(bundle) };
    });
  }

  async upload(studentId, attemptId, batchId, assetId, idempotencyKey, stream, contentLength) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    requireUuid(assetId, 'assetId');
    const key = requireIdempotencyKey(idempotencyKey);
    if (!this.privateUploadStore) {
      throw new ApiError(503, 'PRIVATE_STORAGE_UNAVAILABLE', 'Private upload storage is not configured.');
    }
    let prepared;
    try {
      prepared = await this.store.withAttemptLock(attemptId, async (tx) => {
        const attempt = await tx?.getAttempt();
        assertOwner(attempt, studentId);
        const value = await tx.beginLearningBatchAssetUpload({
          batchId, assetId, uploadIdempotencyKey: key, now: this.now()
        });
        if (!value) throw notFound('BATCH_ASSET_NOT_FOUND', 'The learning batch asset was not found.');
        return value;
      });
    } catch (error) {
      throw storeConflict(error);
    }
    if (!Number.isSafeInteger(contentLength) || contentLength !== prepared.asset.declaredBytes) {
      if (stream?.destroy) stream.destroy();
      if (!prepared.replay) {
        await this.store.withAttemptLock(attemptId, async (tx) => tx?.failLearningBatchAssetUpload({
          batchId, assetId, uploadIdempotencyKey: key,
          errorCode: 'UPLOAD_LENGTH_MISMATCH', now: this.now()
        }));
      }
      throw badRequest('UPLOAD_LENGTH_MISMATCH', 'Content-Length must exactly match the persistent reservation.');
    }
    if (prepared.replay) {
      if (stream?.resume) stream.resume();
      else if (stream?.destroy) stream.destroy();
      return { asset: publicAsset(prepared.asset), replayed: true };
    }
    const uploadBudget = await this.store.consumeStudentResourceBudget({
      studentId, budgetKind: 'UPLOAD_BYTES', units: prepared.asset.declaredBytes,
      limit: this.uploadByteBudget, windowMs: 60 * 60 * 1_000, now: this.now()
    });
    if (!uploadBudget.allowed) {
      if (stream?.destroy) stream.destroy();
      await this.store.withAttemptLock(attemptId, async (tx) => tx?.failLearningBatchAssetUpload({
        batchId, assetId, uploadIdempotencyKey: key,
        errorCode: 'UPLOAD_BYTE_RATE_LIMITED', now: this.now()
      }));
      throw tooManyRequests('UPLOAD_BYTE_RATE_LIMITED',
        'The hourly private upload byte budget is exhausted.', uploadBudget.retryAfterSeconds);
    }
    let stored;
    let committed = false;
    let completionWasExplicitlyRejected = false;
    try {
      stored = await this.privateUploadStore.write({
        stream,
        expectedBytes: prepared.asset.declaredBytes,
        kind: prepared.asset.kind,
        contentType: prepared.asset.contentType
      });
      const completedAsset = await this.store.withAttemptLock(attemptId, async (tx) => {
        const attempt = await tx?.getAttempt();
        assertOwner(attempt, studentId);
        return tx.completeLearningBatchAssetUpload({
          batchId, assetId, uploadIdempotencyKey: key,
          deletionGeneration: prepared.deletionGeneration, stored,
          normalizedText: stored.normalizedText, now: this.now()
        });
      });
      if (!completedAsset) {
        completionWasExplicitlyRejected = true;
        await this.privateUploadStore.delete(stored.storageKey);
        stored = null;
        throw conflict('UPLOAD_FINALIZATION_CONFLICT', 'The batch changed while the upload was being finalized.');
      }
      committed = true;
      return { asset: publicAsset(completedAsset), replayed: false };
    } catch (error) {
      if (!committed) {
        // A thrown transaction result is ambiguous: PostgreSQL may have
        // committed before the connection failed. Preserve the blob for the
        // deterministic retry/inventory reconciler. Only an explicit false
        // proves the fenced finalize did not commit and permits deletion.
        if (stored && completionWasExplicitlyRejected) {
          await this.privateUploadStore.delete(stored.storageKey).catch(() => {});
        }
        await this.store.withAttemptLock(attemptId, async (tx) => {
          if (!tx) return false;
          return tx.failLearningBatchAssetUpload({
            batchId, assetId, uploadIdempotencyKey: key,
            errorCode: error.code || 'UPLOAD_FAILED', now: this.now()
          });
        });
      }
      throw error;
    }
  }

  async submit(studentId, attemptId, batchId, idempotencyKey) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    const key = requireIdempotencyKey(idempotencyKey);
    const scope = `attempt:${attemptId}:learning-batch:${batchId}:submit`;
    const requestHash = batchSha256({ action: 'learning-batch-submit', batchId });
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const existing = await tx.getIdempotency(studentId, scope, key);
      if (existing) {
        if (existing.requestHash !== requestHash) throw conflict('IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused.');
        const replay = await tx.getLearningBatchBundle(batchId);
        if (!replay) throw new Error('A batch submission idempotency record lost its aggregate.');
        return { batch: publicBundle(replay), replayed: true };
      }
      const bundle = await tx.getLearningBatchBundle(batchId);
      if (!bundle) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      const now = this.now();
      const audio = bundle.assets.filter((asset) => asset.kind === 'AUDIO');
      const providerWork = await tx.consumeStudentResourceBudget({
        studentId, budgetKind: 'PROVIDER_WORK', units: audio.length + 1,
        limit: this.providerWorkBudget, windowMs: 24 * 60 * 60 * 1_000, now
      });
      if (!providerWork.allowed) {
        throw tooManyRequests('PROVIDER_WORK_RATE_LIMITED',
          'The daily AI processing budget is exhausted.', providerWork.retryAfterSeconds);
      }
      const globalProviderWork = await tx.consumeGlobalResourceBudget({
        budgetKind: 'PROVIDER_WORK', units: audio.length + 1,
        limit: this.globalProviderWorkBudget, windowMs: 24 * 60 * 60 * 1_000, now
      });
      if (!globalProviderWork.allowed) {
        throw tooManyRequests('GLOBAL_PROVIDER_WORK_RATE_LIMITED',
          'The global daily AI processing budget is exhausted.', globalProviderWork.retryAfterSeconds);
      }
      if (audio.length) {
        const audioBytes = audio.reduce((sum, asset) => sum + asset.declaredBytes, 0);
        const providerAudio = await tx.consumeStudentResourceBudget({
          studentId, budgetKind: 'PROVIDER_AUDIO_BYTES', units: audioBytes,
          limit: this.providerAudioByteBudget, windowMs: 24 * 60 * 60 * 1_000, now
        });
        if (!providerAudio.allowed) {
          throw tooManyRequests('PROVIDER_AUDIO_RATE_LIMITED',
            'The daily transcription byte budget is exhausted.', providerAudio.retryAfterSeconds);
        }
        const globalProviderAudio = await tx.consumeGlobalResourceBudget({
          budgetKind: 'PROVIDER_AUDIO_BYTES', units: audioBytes,
          limit: this.globalProviderAudioByteBudget, windowMs: 24 * 60 * 60 * 1_000, now
        });
        if (!globalProviderAudio.allowed) {
          throw tooManyRequests('GLOBAL_PROVIDER_AUDIO_RATE_LIMITED',
            'The global daily transcription byte budget is exhausted.', globalProviderAudio.retryAfterSeconds);
        }
      }
      const lineage = {
        batchId, deletionGeneration: bundle.batch.deletionGeneration,
        assets: bundle.assets.map((asset) => ({ id: asset.id, sha256: asset.sha256 }))
      };
      const workItems = audio.map((asset) => ({
        id: randomUUID(), batchId, assetId: asset.id, workType: BATCH_WORK_TYPE.TRANSCRIBE_AUDIO,
        status: BATCH_WORK_STATUS.QUEUED, priority: 60, attemptCount: 0,
        inputHash: batchSha256({ ...lineage, assetId: asset.id, workType: BATCH_WORK_TYPE.TRANSCRIBE_AUDIO }),
        deletionGeneration: bundle.batch.deletionGeneration, availableAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, createdAt: now, updatedAt: now
      }));
      workItems.push({
        id: randomUUID(), batchId, assetId: null, workType: BATCH_WORK_TYPE.BATCH_EXTRACTION,
        status: audio.length ? BATCH_WORK_STATUS.BLOCKED_DEPENDENCY : BATCH_WORK_STATUS.QUEUED,
        priority: 30, attemptCount: 0,
        inputHash: batchSha256({ ...lineage, workType: BATCH_WORK_TYPE.BATCH_EXTRACTION }),
        deletionGeneration: bundle.batch.deletionGeneration, availableAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, createdAt: now, updatedAt: now
      });
      let submitted;
      try {
        submitted = await tx.submitLearningBatch({ batchId, workItems, now });
      } catch (error) {
        throw storeConflict(error);
      }
      await tx.putIdempotency(idempotencyRecord({ studentId, scope, key, requestHash, batchId, now }));
      return { batch: publicBundle(submitted), replayed: false };
    });
  }

  async prepareDecomposition(studentId, attemptId, batchId) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const bundle = await tx.getLearningBatchBundle(batchId);
      if (!bundle) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      if (bundle.batch.status !== BATCH_STATUS.PROCESSING || bundle.batch.deletionState !== BATCH_DELETION_STATE.ACTIVE
          || bundle.evidence.length !== bundle.assets.length
          || bundle.evidence.some((item) => item.normalizedText === null)) {
        throw conflict('BATCH_EVIDENCE_NOT_READY', 'All normalized text or transcript evidence must be durable first.');
      }
      const form = await this.store.getForm(bundle.batch.formId, bundle.batch.formVersion);
      if (!form) throw new Error('Pinned batch form is missing.');
      const plan = buildDecompositionPlan(bundle.evidence, {
        correlationId: `batch-${batchId}`,
        questionCatalog: buildBatchQuestionCatalog(form)
      });
      return { batch: bundle.batch, evidence: bundle.evidence, plan };
    });
  }

  async recordDecomposition(studentId, attemptId, batchId, input) {
    exactBody(input, ['masterPlanHash', 'outputs', 'runMetadata', 'workerFence']);
    const workerFence = normalizeWorkerFence(input.workerFence);
    if (!Array.isArray(input.runMetadata) || input.runMetadata.length !== input.outputs.length) {
      throw badRequest('INVALID_GATEWAY_RUN_METADATA', 'Each decomposition chunk requires internal Gateway run metadata.');
    }
    const prepared = await this.prepareDecomposition(studentId, attemptId, batchId);
    if (input.masterPlanHash !== prepared.plan.masterPlanHash) {
      throw conflict('DECOMPOSITION_PLAN_CONFLICT', 'The decomposition plan changed before its result was recorded.');
    }
    const gatewayRunMetadata = normalizeBatchGatewayRunMetadata(input.runMetadata, prepared.plan.chunks);
    const extraction = validateDecompositionOutputs(input.outputs, prepared);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      let bundle = await tx.getLearningBatchBundle(batchId);
      if (!bundle) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      const existing = bundle.mapping;
      if (existing && existing.extractionHash === extraction.extractionHash) {
        return { batch: publicBundle(bundle), replayed: true };
      }
      if (bundle.batch.status !== BATCH_STATUS.PROCESSING
          || bundle.batch.deletionGeneration !== prepared.batch.deletionGeneration) {
        throw conflict('DECOMPOSITION_RESULT_STALE', 'The batch changed before decomposition completed.');
      }
      const now = this.now();
      const mapping = {
        batchId, revision: bundle.batch.mappingRevision + 1, schemaVersion: extraction.schema,
        evidenceSetHash: extraction.evidenceSetHash, masterPlanHash: prepared.plan.masterPlanHash,
        chunkInputHashes: prepared.plan.chunks.map((chunk) => ({ chunkId: chunk.chunkId, inputHash: chunk.inputHash })),
        gatewayRunMetadata,
        extractionHash: extraction.extractionHash,
        status: BATCH_STATUS.NEEDS_CONFIRMATION,
        createdAt: now, confirmedAt: null,
        items: extraction.items.map((item, index) => ({
          id: randomUUID(), batchId, mappingRevision: bundle.batch.mappingRevision + 1,
          itemPosition: index + 1, itemKey: item.itemKey,
          candidateQuestionNumbers: item.candidateQuestionNumbers,
          proposedQuestionNumber: item.proposedQuestionNumber,
          selectedOption: item.selectedOption,
          reasoningSummary: item.reasoningSummary,
          evidenceText: item.evidenceText,
          confidence: item.confidence,
          ambiguity: item.ambiguity,
          sourceSpans: item.spans.map(({ chunkId, segmentId, virtualAssetId, assetId, assetPosition,
            startByte, endByte, sha256, sourceKind, sourceConfidence }) => ({
            chunkId, segmentId, virtualAssetId, assetId, assetPosition,
            startByte, endByte, sha256, sourceKind, sourceConfidence
          })),
          gatewayConflictFlags: item.gatewayConflictFlags,
          requiresConfirmation: item.requiresConfirmation,
          confirmationReasons: item.confirmationReasons,
          unmapped: item.unmapped === true,
          createdAt: now
        }))
      };
      if (!await tx.saveLearningBatchMapping({ batchId, mapping, workerFence, now })) {
        throw conflict('DECOMPOSITION_RESULT_STALE', 'The batch changed before decomposition completed.');
      }
      bundle = await tx.getLearningBatchBundle(batchId);
      return { batch: publicBundle(bundle), replayed: false };
    });
  }

  async confirm(studentId, attemptId, batchId, idempotencyKey, input) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    const key = requireIdempotencyKey(idempotencyKey);
    const scope = `attempt:${attemptId}:learning-batch:${batchId}:confirm`;
    const requestHash = batchSha256({ action: 'learning-batch-confirm', input });
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const replay = await tx.getIdempotency(studentId, scope, key);
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused.');
        const replayBundle = await tx.getLearningBatchBundle(batchId);
        if (!replayBundle) throw new Error('A batch confirmation idempotency record lost its aggregate.');
        return { batch: publicBundle(replayBundle), replayed: true };
      }
      const bundle = await tx.getLearningBatchBundle(batchId);
      if (!bundle) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      if (bundle.batch.status !== BATCH_STATUS.NEEDS_CONFIRMATION || !bundle.mapping) {
        throw conflict('BATCH_CONFIRMATION_NOT_AVAILABLE', 'This batch does not currently need confirmation.');
      }
      const form = await this.store.getForm(bundle.batch.formId, bundle.batch.formVersion);
      if (!form) throw new Error('Pinned batch form is missing.');
      const confirmation = normalizeMappingConfirmation(input, {
        mappingRevision: bundle.mapping.revision,
        mappingItems: bundle.mapping.items,
        formQuestionNumbers: form.questions.map((question) => question.number)
      });
      const now = this.now();
      const committed = await this.#commit(tx, bundle, confirmation, now, form);
      await tx.putIdempotency(idempotencyRecord({ studentId, scope, key, requestHash, batchId, now }));
      return { batch: publicBundle(committed), replayed: false };
    });
  }

  async #commit(tx, bundle, confirmation, now, knownForm = null) {
    const learning = await tx.getLearningSubmissionBundle();
    const form = knownForm || await this.store.getForm(bundle.batch.formId, bundle.batch.formVersion);
    if (!learning || !form) throw new Error('Pinned batch learning context is missing.');
    const approvedContext = await tx.getApprovedContextSetForForm(bundle.batch.formId, bundle.batch.formVersion);
    const aggregate = createBatchLearningAggregate({
      batch: bundle.batch,
      currentVersion: learning.version,
      confirmation,
      form,
      approvedContext,
      now
    });
    try {
      return await tx.commitLearningBatch({
        batchId: bundle.batch.id,
        expectedMappingRevision: bundle.mapping.revision,
        aggregate,
        now
      });
    } catch (error) {
      throw storeConflict(error);
    }
  }

  async delete(studentId, attemptId, batchId, idempotencyKey) {
    requireUuid(attemptId, 'attemptId');
    requireUuid(batchId, 'batchId');
    const key = requireIdempotencyKey(idempotencyKey);
    const scope = `attempt:${attemptId}:learning-batch:${batchId}:delete`;
    const requestHash = batchSha256({ action: 'learning-batch-delete', batchId });
    const tombstone = await this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwner(attempt, studentId);
      const replay = await tx.getIdempotency(studentId, scope, key);
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused.');
        const replayBundle = await tx.getLearningBatchBundle(batchId);
        if (!replayBundle) throw new Error('A batch deletion idempotency record lost its aggregate.');
        return replayBundle;
      }
      const result = await tx.requestLearningBatchDeletion({ batchId, now: this.now() });
      if (!result) throw notFound('BATCH_NOT_FOUND', 'The learning batch was not found.');
      return result;
    });
    const storageKeys = tombstone.assets.map((asset) => asset.storageKey).filter(Boolean);
    if (storageKeys.length && !this.privateUploadStore) {
      throw new ApiError(503, 'PRIVATE_STORAGE_UNAVAILABLE', 'Private upload purge is pending storage recovery.');
    }
    for (const storageKey of storageKeys) await this.privateUploadStore.delete(storageKey);
    await this.store.withAttemptLock(attemptId, async (tx) => {
      if (!tx) return;
      const now = this.now();
      await tx.completeLearningBatchLocalPurge({
        batchId,
        expectedDeletionGeneration: tombstone.batch.deletionGeneration,
        now
      });
      const existing = await tx.getIdempotency(studentId, scope, key);
      if (!existing) {
        await tx.putIdempotency(idempotencyRecord({ studentId, scope, key, requestHash, batchId, now }));
      }
    });
    return this.get(studentId, attemptId, batchId);
  }
}
