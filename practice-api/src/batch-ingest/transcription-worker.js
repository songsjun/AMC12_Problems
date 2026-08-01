export class BatchTranscriptionWorker {
  constructor({
    store, port, workerId, leaseMs = 120_000, clock = () => new Date(),
    maxBusinessAttempts = 20, maxBusinessAgeMs = 24 * 60 * 60 * 1_000
  }) {
    if (!store || !port || typeof workerId !== 'string' || workerId.length < 8 || workerId.length > 100
        || !Number.isSafeInteger(leaseMs) || leaseMs < 10_000 || leaseMs > 600_000
        || !Number.isSafeInteger(maxBusinessAttempts) || maxBusinessAttempts < 1 || maxBusinessAttempts > 1_000
        || !Number.isSafeInteger(maxBusinessAgeMs) || maxBusinessAgeMs < 60_000
        || maxBusinessAgeMs > 30 * 24 * 60 * 60 * 1_000) {
      throw new Error('Batch transcription worker configuration is invalid.');
    }
    this.store = store;
    this.port = port;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.clock = clock;
    this.maxBusinessAttempts = maxBusinessAttempts;
    this.maxBusinessAgeMs = maxBusinessAgeMs;
  }

  async runOnce({ signal } = {}) {
    const job = await this.store.claimNextTranscriptionWork({
      workerId: this.workerId,
      now: this.clock(),
      leaseMs: this.leaseMs
    });
    if (!job) return { processed: false };
    if (job.phase === 'upload') return this.port.submitOnce(job, { signal });
    if (job.phase === 'await_upload_retention') {
      return this.port.awaitUploadRetentionOnce(job, { signal });
    }
    if (job.phase === 'reconcile') return this.port.reconcileOnce(job, { signal });
    if (job.phase === 'poll') {
      const nowMs = new Date(this.clock()).getTime();
      const startedMs = new Date(job.pollStartedAt || job.providerTranscriptPersistedAt || job.workCreatedAt).getTime();
      if (job.pollAttemptCount >= this.maxBusinessAttempts || nowMs - startedMs >= this.maxBusinessAgeMs) {
        return this.port.expireActiveTranscription(job);
      }
      return this.port.pollOnce(job, { signal });
    }
    if (job.phase === 'purge_resolved_orphan') {
      return this.port.purgeResolvedOrphanLocalAudioOnce(job, { signal });
    }
    if (job.phase === 'delete') return this.port.deleteOnce(job, { signal });
    throw new Error(`Unsupported durable transcription phase: ${job.phase}`);
  }
}
