import { setTimeout as delay } from 'node:timers/promises';

const TERMINAL_CODES = new Set([
  'DECOMPOSITION_TOO_FRAGMENTED',
  'INVALID_DECOMPOSITION_RESULT',
  'INVALID_EVIDENCE_SPAN',
  'INVALID_EVIDENCE_COVERAGE',
  'DECOMPOSITION_PLAN_CONFLICT'
]);

export class BatchExtractionWorker {
  constructor({
    store,
    service,
    gatewayClient,
    workerId,
    leaseMs = 120_000,
    maxAttempts = 3,
    retryBaseMs = 5_000,
    retryMaxMs = 60_000,
    clock = () => new Date()
  }) {
    if (typeof workerId !== 'string' || workerId.length < 8 || workerId.length > 100) {
      throw new Error('workerId must be an 8-100 character opaque id.');
    }
    this.store = store;
    this.service = service;
    this.gatewayClient = gatewayClient;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.maxAttempts = maxAttempts;
    this.retryBaseMs = retryBaseMs;
    this.retryMaxMs = retryMaxMs;
    this.clock = clock;
    this.heartbeatMs = Math.max(250, Math.min(10_000, Math.floor(leaseMs / 3)));
  }

  async #decomposeWithHeartbeat(job, request, plan, shutdownSignal) {
    const requestController = new AbortController();
    const heartbeatController = new AbortController();
    const abortForShutdown = () => requestController.abort(shutdownSignal?.reason);
    if (shutdownSignal?.aborted) abortForShutdown();
    else shutdownSignal?.addEventListener('abort', abortForShutdown, { once: true });
    let leaseLost = false;
    const heartbeatLoop = (async () => {
      while (!heartbeatController.signal.aborted) {
        try {
          await delay(this.heartbeatMs, undefined, { signal: heartbeatController.signal });
        } catch {
          return;
        }
        const alive = await this.store.heartbeatBatchExtractionWork({
          workItemId: job.workItem.id,
          workerId: this.workerId,
          leaseToken: job.workItem.leaseToken,
          now: this.clock(),
          leaseMs: this.leaseMs
        }).catch(() => false);
        if (!alive) {
          leaseLost = true;
          requestController.abort();
          return;
        }
      }
    })();
    try {
      const authorized = await this.store.authorizeBatchExtractionProviderCall({
        workItemId: job.workItem.id,
        workerId: this.workerId,
        leaseToken: job.workItem.leaseToken,
        inputHash: job.workItem.inputHash,
        deletionGeneration: job.workItem.deletionGeneration,
        now: this.clock()
      });
      if (!authorized) {
        leaseLost = true;
        requestController.abort();
        throw Object.assign(new Error('Batch extraction authorization was lost.'), { code: 'LEASE_LOST' });
      }
      const result = await this.gatewayClient.decomposeChunk(request, {
        plan,
        evidence: job.evidence,
        signal: requestController.signal
      });
      if (shutdownSignal?.aborted) {
        throw Object.assign(new Error('Batch extraction stopped for worker shutdown.'), {
          code: 'WORKER_SHUTDOWN'
        });
      }
      if (leaseLost) throw Object.assign(new Error('Batch extraction lease was lost.'), { code: 'LEASE_LOST' });
      return result;
    } finally {
      shutdownSignal?.removeEventListener('abort', abortForShutdown);
      heartbeatController.abort();
      await heartbeatLoop;
    }
  }

  async processClaimed(job, { signal } = {}) {
    if (!job?.workItem || job.workItem.workType !== 'BATCH_EXTRACTION'
        || job.workItem.leaseOwner !== this.workerId) {
      throw new Error('Batch worker received a claim owned by another worker.');
    }
    try {
      if (signal?.aborted) return { processed: false, shuttingDown: true };
      const prepared = await this.service.prepareLearningBatchDecomposition(
        job.studentId, job.attemptId, job.batch.id
      );
      const outputs = [];
      const runMetadata = [];
      for (const chunk of prepared.plan.chunks) {
        if (signal?.aborted) return { processed: false, shuttingDown: true };
        const alive = await this.store.heartbeatBatchExtractionWork({
          workItemId: job.workItem.id,
          workerId: this.workerId,
          leaseToken: job.workItem.leaseToken,
          now: this.clock(),
          leaseMs: this.leaseMs
        });
        if (!alive) return { processed: false, staleLease: true };
        const result = await this.#decomposeWithHeartbeat(job, chunk, prepared.plan, signal);
        outputs.push(result.decomposition);
        runMetadata.push({
          chunkId: chunk.chunkId,
          inputHash: chunk.inputHash,
          ...result.runMetadata
        });
      }
      if (signal?.aborted) return { processed: false, shuttingDown: true };
      const result = await this.service.recordLearningBatchDecomposition(
        job.studentId,
        job.attemptId,
        job.batch.id,
        {
          masterPlanHash: prepared.plan.masterPlanHash,
          outputs,
          runMetadata,
          workerFence: {
            workerId: this.workerId,
            leaseToken: job.workItem.leaseToken,
            inputHash: job.workItem.inputHash,
            deletionGeneration: job.workItem.deletionGeneration
          }
        }
      );
      return { processed: true, status: result.batch.status, chunks: outputs.length };
    } catch (error) {
      if (error?.code === 'WORKER_SHUTDOWN' || signal?.aborted) {
        return { processed: false, shuttingDown: true };
      }
      if (error?.code === 'LEASE_LOST') return { processed: false, staleLease: true };
      const terminal = TERMINAL_CODES.has(error?.code) || error?.retryable !== true
        || job.workItem.attemptCount >= this.maxAttempts;
      const retryDelay = Math.min(
        this.retryMaxMs,
        this.retryBaseMs * (2 ** Math.max(0, job.workItem.attemptCount - 1))
      );
      const failed = await this.store.failBatchExtractionWork({
        workItemId: job.workItem.id,
        workerId: this.workerId,
        expectedLeaseToken: job.workItem.leaseToken,
        expectedInputHash: job.workItem.inputHash,
        expectedDeletionGeneration: job.workItem.deletionGeneration,
        errorCode: error?.code || 'BATCH_EXTRACTION_FAILED',
        retry: !terminal,
        availableAt: new Date(new Date(this.clock()).getTime() + retryDelay),
        now: this.clock()
      });
      return failed
        ? { processed: true, status: terminal ? 'FAILED' : 'RETRY_QUEUED', errorCode: error?.code || 'BATCH_EXTRACTION_FAILED' }
        : { processed: false, staleWrite: true };
    }
  }
}
