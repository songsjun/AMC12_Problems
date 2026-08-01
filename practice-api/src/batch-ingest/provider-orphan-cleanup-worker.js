import { AssemblyAiClientError } from '../infrastructure/assemblyai-prerecorded.js';

const DELETE_EVIDENCE = new Set(['provider-delete-response', 'provider-already-absent']);
const RETENTION_WINDOW_ELAPSED = 'provider-retention-window-elapsed';

function errorMetadata(error) {
  const safeCode = typeof error?.code === 'string'
      && /^[A-Z][A-Z0-9_]{0,99}$/.test(error.code)
    ? error.code : 'PROVIDER_ORPHAN_CLEANUP_FAILED';
  const retryAfterSeconds = Number.isSafeInteger(error?.retryAfterSeconds)
    ? Math.min(3_600, Math.max(1, error.retryAfterSeconds)) : undefined;
  return { errorCode: safeCode, ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }) };
}

/**
 * Drains provider artifacts which could not be attached to the learning
 * aggregate. Jobs are independently durable: the exact transcript id is
 * leased and fenced before DELETE, while upload-only jobs merely record that
 * the conservatively configured retention window elapsed. That observation
 * makes no provider call and is never physical-deletion evidence.
 */
export class ProviderOrphanCleanupWorker {
  constructor({
    store, client, workerId, leaseMs = 120_000, clock = () => new Date(),
    globalCleanupCallsPerDay = 100_000
  }) {
    if (!store || !client || typeof workerId !== 'string' || workerId.length < 8 || workerId.length > 100
        || !Number.isSafeInteger(leaseMs) || leaseMs < 10_000 || leaseMs > 600_000
        || !Number.isSafeInteger(globalCleanupCallsPerDay) || globalCleanupCallsPerDay < 1
        || typeof clock !== 'function') {
      throw new Error('Provider orphan cleanup worker configuration is invalid.');
    }
    this.store = store;
    this.client = client;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.clock = clock;
    this.providerBudget = {
      studentLimit: null,
      globalLimit: globalCleanupCallsPerDay,
      windowMs: 24 * 60 * 60 * 1_000,
      budgetKind: 'PROVIDER_CLEANUP'
    };
  }

  async runOnce({ signal } = {}) {
    const job = await this.store.claimNextProviderOrphanCleanup({
      workerId: this.workerId,
      now: this.clock(),
      leaseMs: this.leaseMs
    });
    if (!job) return { processed: false };
    try {
      let evidenceType;
      if (job.cleanupKind === 'OBSERVE_RETENTION_WINDOW') {
        evidenceType = RETENTION_WINDOW_ELAPSED;
      } else if (job.cleanupKind === 'DELETE_TRANSCRIPT') {
        const authorized = await this.store.authorizeProviderOrphanCall({
          jobId: job.id,
          leaseToken: job.leaseToken,
          externalId: job.externalId,
          now: this.clock(),
          providerBudget: this.providerBudget
        });
        if (!authorized) return { processed: false, staleWrite: true };
        const deletion = await this.client.deleteTranscript(job.externalId, { signal });
        if (!deletion || deletion.transcriptId !== job.externalId
            || !DELETE_EVIDENCE.has(deletion.evidenceType)) {
          throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
        }
        evidenceType = deletion.evidenceType;
      } else {
        throw new Error('Unsupported provider orphan cleanup kind.');
      }
      const completed = await this.store.completeProviderOrphanCleanup({
        jobId: job.id,
        leaseToken: job.leaseToken,
        evidenceType,
        now: this.clock()
      });
      return completed
        ? { processed: true, status: evidenceType }
        : { processed: false, staleWrite: true };
    } catch (error) {
      const failed = await this.store.failProviderOrphanCleanup({
        jobId: job.id,
        leaseToken: job.leaseToken,
        ...errorMetadata(error),
        now: this.clock()
      });
      return failed
        ? { processed: true, status: 'RETRY_SCHEDULED' }
        : { processed: false, staleWrite: true };
    }
  }
}

export const _test = { RETENTION_WINDOW_ELAPSED, errorMetadata };
