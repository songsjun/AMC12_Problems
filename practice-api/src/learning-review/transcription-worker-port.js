import { createHash } from 'node:crypto';
import { finished } from 'node:stream/promises';
import { AssemblyAiClientError } from '../infrastructure/assemblyai-prerecorded.js';
import { providerRetentionNotBefore } from '../infrastructure/assemblyai-retention-profile.js';

const MAX_AUDIO_DURATION_SECONDS = 3_600;
const SUBMIT_RECONCILIATION_MANUAL_DAYS = 90;
const MAX_RECONCILIATION_PAGES = 10;

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function requireJob(job, phase) {
  if (!job || typeof job !== 'object' || typeof job.workItemId !== 'string'
      || typeof job.leaseToken !== 'string' || !Number.isSafeInteger(job.deletionGeneration)
      || job.deletionGeneration < 0) throw new Error(`Invalid ${phase} transcription job.`);
  if (phase === 'submit' && typeof job.assetStorageKey !== 'string') {
    throw new Error('Invalid submit transcription job.');
  }
  if (phase === 'await_upload_retention' && (typeof job.uploadCallId !== 'string'
      || !(job.providerRetentionNotBefore instanceof Date || typeof job.providerRetentionNotBefore === 'string'))) {
    throw new Error('Invalid upload retention transcription job.');
  }
  if (phase === 'reconcile' && (typeof job.submitCallId !== 'string'
      || typeof job.uploadUrlSha256 !== 'string'
      || !(job.submitCallStartedAt instanceof Date || typeof job.submitCallStartedAt === 'string'))) {
    throw new Error('Invalid reconcile transcription job.');
  }
  if (['poll', 'delete'].includes(phase) && (typeof job.providerTranscriptId !== 'string'
      || typeof job.providerTranscriptPersistedAt !== 'string')) {
    throw new Error(`Invalid durable ${phase} transcription job.`);
  }
}

function errorMetadata(error) {
  if (error instanceof AssemblyAiClientError) {
    return {
      errorCode: error.code,
      retryable: error.retryable,
      errorClass: error.errorClass,
      ...(error.retryAfterSeconds === undefined ? {} : { retryAfterSeconds: error.retryAfterSeconds })
    };
  }
  return { errorCode: 'TRANSCRIPTION_INTERNAL_FAILURE', retryable: true, errorClass: 'transient' };
}

/**
 * Application orchestration port. The injected store must fence every write by
 * workItemId + leaseToken + deletionGeneration. `recordSubmitted` must commit
 * the provider transcript id before returning true; polling is intentionally a
 * separate invocation that requires a reloaded `providerTranscriptPersistedAt`.
 * Store methods own durable retry counts, exponential backoff/Retry-After,
 * next-attempt scheduling, and lease release; this port never sleeps or retries
 * a provider call inside one lease.
 */
export class TranscriptionWorkerPort {
  constructor({
    client, store, assetReader, orphanAudit, clock = () => new Date(),
    retentionProfile,
    providerCallsPerStudentPerDay = 200, globalProviderCallsPerDay = 10_000,
    globalCleanupCallsPerDay = 100_000
  }) {
    if (!client || !store || !assetReader || typeof assetReader.open !== 'function'
        || !orphanAudit || typeof orphanAudit.record !== 'function'
        || !retentionProfile) {
      throw new Error('Transcription worker dependencies are required.');
    }
    if (!Number.isSafeInteger(providerCallsPerStudentPerDay) || providerCallsPerStudentPerDay < 1
        || !Number.isSafeInteger(globalProviderCallsPerDay) || globalProviderCallsPerDay < 1
        || !Number.isSafeInteger(globalCleanupCallsPerDay) || globalCleanupCallsPerDay < 1) {
      throw new Error('Transcription provider budgets are invalid.');
    }
    this.client = client;
    this.store = store;
    this.assetReader = assetReader;
    this.orphanAudit = orphanAudit;
    this.clock = clock;
    // Validate once at construction and again when deriving each durable
    // not-before timestamp. A worker without an operator-attested profile
    // never reaches an outbound upload.
    providerRetentionNotBefore(new Date(0), retentionProfile);
    this.retentionProfile = retentionProfile;
    this.providerBudget = {
      studentLimit: providerCallsPerStudentPerDay,
      globalLimit: globalProviderCallsPerDay,
      windowMs: 24 * 60 * 60 * 1_000,
      budgetKind: 'PROVIDER_WORK'
    };
    this.cleanupProviderBudget = {
      studentLimit: null,
      globalLimit: globalCleanupCallsPerDay,
      windowMs: 24 * 60 * 60 * 1_000,
      budgetKind: 'PROVIDER_CLEANUP'
    };
  }

  async #queueUnboundTranscriptCleanup(job, providerTranscriptId) {
    // Never issue a best-effort DELETE here. Persist the exact id first so a
    // separately leased cleanup worker can reauthorize, budget, and retry it.
    await this.orphanAudit.record({
      event: 'ORPHAN_TRANSCRIPT_DELETE_PENDING',
      provider: 'assemblyai',
      providerTranscriptId,
      providerCallId: job.submitCallId || null,
      workItemId: job.workItemId,
      deletionGeneration: job.deletionGeneration,
      errorCode: 'TRANSCRIPT_NOT_BOUND',
      attemptedAt: this.clock()
    });
  }

  async #authorize(job, phase, extra = {}) {
    return this.store.authorizeTranscriptionProviderCall({
      workItemId: job.workItemId,
      leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration,
      providerTranscriptId: job.providerTranscriptId || null,
      submitCallId: job.submitCallId || null,
      uploadUrlSha256: job.uploadUrlSha256 || null,
      phase,
      now: this.clock(),
      providerBudget: phase === 'DELETE' ? this.cleanupProviderBudget : this.providerBudget,
      ...extra
    });
  }

  async submitOnce(job, { signal } = {}) {
    requireJob(job, 'submit');
    const uploadStartedAt = this.clock();
    const providerRetentionNotBeforeAt = providerRetentionNotBefore(
      uploadStartedAt, this.retentionProfile
    );
    const uploadIntent = await this.store.beginTranscriptionUploadCall({
      workItemId: job.workItemId, leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration, startedAt: uploadStartedAt,
      providerRetentionNotBefore: providerRetentionNotBeforeAt,
      retentionProfile: this.retentionProfile
    });
    if (!uploadIntent) return { processed: false, staleWrite: true };
    let submitIntent = null;
    try {
      const asset = await this.assetReader.open(job.assetStorageKey, { signal });
      let uploaded;
      try {
        if (!await this.#authorize(job, 'UPLOAD', { uploadCallId: uploadIntent.callId })) {
          return { processed: false, staleWrite: true };
        }
        uploaded = await this.client.upload({ ...asset, signal });
      } finally {
        if (typeof asset.body?.destroy === 'function' && !asset.body.destroyed) asset.body.destroy();
        if (typeof asset.body?.once === 'function') await finished(asset.body).catch(() => {});
      }
      const uploadUrlSha256 = sha256(uploaded.uploadUrl);
      const uploadRecorded = await this.store.recordTranscriptionUploadResponse({
        workItemId: job.workItemId, leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration, uploadCallId: uploadIntent.callId,
        uploadUrlSha256, returnedAt: this.clock()
      });
      if (!uploadRecorded) {
        return { processed: false, staleWrite: true, orphanHandled: true };
      }
      submitIntent = await this.store.beginTranscriptionSubmitCall({
        workItemId: job.workItemId, leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration, uploadCallId: uploadIntent.callId,
        uploadUrlSha256, startedAt: this.clock()
      });
      if (!submitIntent) return { processed: false, staleWrite: true, orphanHandled: true };
      if (!await this.#authorize(job, 'SUBMIT', {
        uploadCallId: uploadIntent.callId, submitCallId: submitIntent.callId, uploadUrlSha256
      })) return { processed: false, staleWrite: true, orphanHandled: true };
      const submitted = await this.client.submit({ uploadUrl: uploaded.uploadUrl, signal });
      let recorded;
      try {
        recorded = await this.store.recordSubmitted({
          workItemId: job.workItemId,
          leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration,
          provider: 'assemblyai',
          providerTranscriptId: submitted.transcriptId,
          uploadUrlSha256,
          submitCallId: submitIntent.callId,
          submittedAt: this.clock()
        });
      } catch {
        await this.#queueUnboundTranscriptCleanup(
          { ...job, submitCallId: submitIntent.callId }, submitted.transcriptId
        );
        return { processed: false, orphanHandled: true };
      }
      if (!recorded) await this.#queueUnboundTranscriptCleanup(
        { ...job, submitCallId: submitIntent.callId }, submitted.transcriptId
      );
      return recorded
        ? { processed: true, status: 'SUBMITTED' }
        : { processed: false, staleWrite: true, orphanHandled: true };
    } catch (error) {
      const now = this.clock();
      if (submitIntent) {
        const recorded = await this.store.markAmbiguousSubmitForReconciliation({
          workItemId: job.workItemId, leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration, submitCallId: submitIntent.callId,
          ...errorMetadata(error), now
        });
        return recorded ? { processed: true, status: 'SUBMIT_RECONCILIATION_PENDING' }
          : { processed: false, staleWrite: true };
      }
      const recorded = await this.store.deferAmbiguousUploadUntilRetention({
        workItemId: job.workItemId, leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration, uploadCallId: uploadIntent.callId, now
      });
      return recorded ? { processed: true, status: 'UPLOAD_RETENTION_PENDING' }
        : { processed: false, staleWrite: true };
    }
  }

  async awaitUploadRetentionOnce(job) {
    requireJob(job, 'await_upload_retention');
    const recorded = await this.store.deferAmbiguousUploadUntilRetention({
      workItemId: job.workItemId, leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration, uploadCallId: job.uploadCallId,
      now: this.clock()
    });
    return recorded ? { processed: true, status: 'UPLOAD_RETENTION_PENDING' }
      : { processed: false, staleWrite: true };
  }

  async reconcileOnce(job, { signal } = {}) {
    requireJob(job, 'reconcile');
    const submitStarted = new Date(job.submitCallStartedAt);
    const createdDates = [-1, 0, 1].map((offset) => {
      const value = new Date(submitStarted);
      value.setUTCDate(value.getUTCDate() + offset);
      return value.toISOString().slice(0, 10);
    });
    const matches = [];
    let scanComplete = true;
    for (const createdOn of createdDates) {
      let beforeId;
      for (let page = 0; page < MAX_RECONCILIATION_PAGES; page += 1) {
        // A long pagination scan spans multiple network calls; re-check the
        // exact lease/call/hash fence immediately before every page.
        if (!await this.#authorize(job, 'RECONCILE')) return { processed: false, staleWrite: true };
        const listed = await this.client.listTranscripts({ createdOn, beforeId, limit: 200, signal });
        for (const transcript of listed.transcripts) {
          if (sha256(transcript.audioUrl) === job.uploadUrlSha256) matches.push(transcript.transcriptId);
        }
        if (!listed.nextBeforeId) break;
        beforeId = listed.nextBeforeId;
        if (page === MAX_RECONCILIATION_PAGES - 1) scanComplete = false;
      }
    }
    const recorded = await this.store.recordAmbiguousSubmitReconciliation({
      workItemId: job.workItemId, leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration, submitCallId: job.submitCallId,
      uploadUrlSha256: job.uploadUrlSha256,
      providerTranscriptIds: matches,
      scanComplete,
      manualAfterMs: SUBMIT_RECONCILIATION_MANUAL_DAYS * 24 * 60 * 60 * 1_000,
      reconciledAt: this.clock()
    });
    return recorded
      ? { processed: true, status: scanComplete !== true
        ? 'RECONCILIATION_BLOCKED_MANUAL'
        : matches.length ? 'RECONCILED_DELETE_PENDING' : 'RECONCILIATION_PENDING' }
      : { processed: false, staleWrite: true };
  }

  async pollOnce(job, { signal } = {}) {
    requireJob(job, 'poll');
    try {
      if (!await this.#authorize(job, 'POLL')) return { processed: false, staleWrite: true };
      const transcript = await this.client.getTranscript(job.providerTranscriptId, { signal });
      if (transcript.status === 'queued' || transcript.status === 'processing') {
        const recorded = await this.store.recordPollPending({
          workItemId: job.workItemId,
          leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration,
          providerTranscriptId: job.providerTranscriptId,
          providerStatus: transcript.status,
          polledAt: this.clock()
        });
        return recorded ? { processed: true, status: 'POLL_PENDING' } : { processed: false, staleWrite: true };
      }
      if (transcript.status === 'error') {
        const recorded = await this.store.failTranscriptionAndScheduleDeletion({
          workItemId: job.workItemId,
          leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration,
          providerTranscriptId: job.providerTranscriptId,
          errorCode: 'ASSEMBLYAI_TRANSCRIPTION_FAILED',
          failedAt: this.clock()
        });
        return recorded ? { processed: true, status: 'FAILED_DELETE_PENDING' } : { processed: false, staleWrite: true };
      }
      if (transcript.audioDurationSeconds === null
          || transcript.audioDurationSeconds > MAX_AUDIO_DURATION_SECONDS) {
        const recorded = await this.store.failTranscriptionAndScheduleDeletion({
          workItemId: job.workItemId,
          leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration,
          providerTranscriptId: job.providerTranscriptId,
          errorCode: 'AUDIO_DURATION_EXCEEDED',
          failedAt: this.clock()
        });
        return recorded ? { processed: true, status: 'FAILED_DELETE_PENDING' } : { processed: false, staleWrite: true };
      }
      const recorded = await this.store.persistNormalizedTranscriptAndScheduleDeletion({
        workItemId: job.workItemId,
        leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration,
        providerTranscriptId: job.providerTranscriptId,
        transcriptText: transcript.text,
        transcriptSha256: sha256(transcript.text),
        confidence: transcript.confidence,
        transcriptionUncertain: transcript.confidence === null
          || transcript.confidence < 0.9,
        audioDurationSeconds: transcript.audioDurationSeconds,
        completedAt: this.clock()
      });
      return recorded ? { processed: true, status: 'TRANSCRIPT_STORED_DELETE_PENDING' }
        : { processed: false, staleWrite: true };
    } catch (error) {
      const metadata = errorMetadata(error);
      const recorded = await this.store.recordPollFailure({
        workItemId: job.workItemId,
        leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration,
        providerTranscriptId: job.providerTranscriptId,
        ...metadata,
        scheduleDeletion: metadata.retryable !== true,
        failedAt: this.clock()
      });
      return recorded ? { processed: true, status: metadata.retryable ? 'POLL_RETRY' : 'FAILED_DELETE_PENDING' }
        : { processed: false, staleWrite: true };
    }
  }

  async expireActiveTranscription(job) {
    requireJob(job, 'poll');
    const recorded = await this.store.failTranscriptionAndScheduleDeletion({
      workItemId: job.workItemId, leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration,
      providerTranscriptId: job.providerTranscriptId,
      errorCode: 'TRANSCRIPTION_PROCESSING_LIMIT_EXCEEDED', failedAt: this.clock()
    });
    return recorded ? { processed: true, status: 'FAILED_DELETE_PENDING' }
      : { processed: false, staleWrite: true };
  }

  async purgeResolvedOrphanLocalAudioOnce(job, { signal } = {}) {
    requireJob(job, 'purge_resolved_orphan');
    if (typeof job.assetStorageKey !== 'string' || typeof this.assetReader.delete !== 'function') {
      throw new Error('A resolved orphan requires its exact private storage key.');
    }
    const localObjectFound = await this.assetReader.delete(job.assetStorageKey, { signal });
    const recorded = await this.store.recordResolvedOrphanLocalAudioPurged({
      workItemId: job.workItemId,
      leaseToken: job.leaseToken,
      deletionGeneration: job.deletionGeneration,
      providerTranscriptId: job.providerTranscriptId || null,
      localObjectFound,
      purgedAt: this.clock()
    });
    return recorded ? { processed: true, status: 'FAILED_LOCAL_AUDIO_PURGED' }
      : { processed: false, staleWrite: true };
  }

  async deleteOnce(job, { signal } = {}) {
    requireJob(job, 'delete');
    try {
      if (job.localPurgePending === true) {
        if (typeof job.assetStorageKey !== 'string' || typeof this.assetReader.delete !== 'function') {
          throw new Error('A delete job with pending local audio requires its exact private storage key.');
        }
        const localObjectFound = await this.assetReader.delete(job.assetStorageKey, { signal });
        const purged = await this.store.recordLocalAudioPurged({
          workItemId: job.workItemId,
          leaseToken: job.leaseToken,
          deletionGeneration: job.deletionGeneration,
          providerTranscriptId: job.providerTranscriptId,
          localObjectFound,
          purgedAt: this.clock()
        });
        if (!purged) return { processed: false, staleWrite: true };
      }
      if (!await this.#authorize(job, 'DELETE')) return { processed: false, staleWrite: true };
      const deletion = await this.client.deleteTranscript(job.providerTranscriptId, { signal });
      if (!deletion || !['provider-delete-response', 'provider-already-absent'].includes(deletion.evidenceType)) {
        throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
      }
      const recorded = await this.store.recordDeletionEvidence({
        workItemId: job.workItemId,
        leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration,
        providerTranscriptId: job.providerTranscriptId,
        provider: 'assemblyai',
        evidenceType: deletion.evidenceType,
        evidencedAt: this.clock()
      });
      return recorded ? { processed: true, status: 'DELETION_EVIDENCED' }
        : { processed: false, staleWrite: true };
    } catch (error) {
      const recorded = await this.store.recordDeletionRetry({
        workItemId: job.workItemId,
        leaseToken: job.leaseToken,
        deletionGeneration: job.deletionGeneration,
        providerTranscriptId: job.providerTranscriptId,
        ...errorMetadata(error),
        attemptedAt: this.clock()
      });
      return recorded ? { processed: true, status: 'DELETION_RETRY' }
        : { processed: false, staleWrite: true };
    }
  }
}

export const _test = { MAX_AUDIO_DURATION_SECONDS, errorMetadata };
