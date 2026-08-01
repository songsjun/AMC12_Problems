export class AiWorkDispatcher {
  constructor({
    store, interactiveWorker, batchWorker, workerId, leaseMs = 120_000,
    concurrency = 2, maxBatchConcurrent = 1, clock = () => new Date(), onError = () => {}
  }) {
    if (!interactiveWorker && !batchWorker) throw new Error('AI dispatcher needs at least one worker handler.');
    if (typeof onError !== 'function') throw new Error('AI dispatcher onError must be a function.');
    if (interactiveWorker && interactiveWorker.workerId !== workerId
        || batchWorker && batchWorker.workerId !== workerId) {
      throw new Error('AI dispatcher and handlers must share one worker identity.');
    }
    if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 32
        || !Number.isSafeInteger(maxBatchConcurrent) || maxBatchConcurrent < 1
        || maxBatchConcurrent > concurrency
        || (interactiveWorker && batchWorker && (concurrency < 2 || maxBatchConcurrent >= concurrency))) {
      throw new Error('Unified AI capacity must reserve at least one non-batch slot.');
    }
    this.store = store;
    this.interactiveWorker = interactiveWorker;
    this.batchWorker = batchWorker;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.concurrency = concurrency;
    this.maxBatchConcurrent = maxBatchConcurrent;
    this.clock = clock;
    this.onError = onError;
    this.active = new Set();
    this.fillPromise = null;
  }

  async #claim() {
    const acceptedKinds = [];
    if (this.interactiveWorker) acceptedKinds.push('INTERACTIVE_ANALYSIS');
    if (this.batchWorker) acceptedKinds.push('BATCH_EXTRACTION');
    const claimed = await this.store.claimNextAiWork({
      workerId: this.workerId,
      now: this.clock(),
      leaseMs: this.leaseMs,
      acceptedKinds,
      maxBatchConcurrent: this.maxBatchConcurrent
    });
    return claimed;
  }

  async #process(claimed, signal) {
    if (claimed.kind === 'INTERACTIVE_ANALYSIS') {
      return this.interactiveWorker.processClaimed(claimed.job, { signal });
    }
    if (claimed.kind === 'BATCH_EXTRACTION') {
      return this.batchWorker.processClaimed(claimed.job, { signal });
    }
    throw new Error(`Unified AI dispatcher received unsupported work kind: ${claimed.kind}`);
  }

  async runOnce({ signal } = {}) {
    if (signal?.aborted) return { processed: false, shuttingDown: true };
    const claimed = await this.#claim();
    if (!claimed) return { processed: false };
    return this.#process(claimed, signal);
  }

  async #fillAvailableSlots(signal) {
    let claimedCount = 0;
    while (!signal?.aborted && this.active.size < this.concurrency) {
      const claimed = await this.#claim();
      if (!claimed) break;
      claimedCount += 1;
      let tracked;
      tracked = Promise.resolve().then(() => this.#process(claimed, signal))
        .catch((error) => {
          this.onError(error);
          return { processed: false, errorCode: error?.code || 'WORKER_FAILED' };
        })
        .finally(() => this.active.delete(tracked));
      this.active.add(tracked);
    }
    return { claimed: claimedCount, active: this.active.size };
  }

  async tick({ signal } = {}) {
    if (signal?.aborted) return { claimed: 0, active: this.active.size, shuttingDown: true };
    // Interval callbacks and explicit wake-ups may overlap while a database
    // claim is slow. One fill loop owns the local capacity snapshot at a time.
    if (this.fillPromise) return this.fillPromise;
    let filling;
    filling = this.#fillAvailableSlots(signal).finally(() => {
      if (this.fillPromise === filling) this.fillPromise = null;
    });
    this.fillPromise = filling;
    return filling;
  }

  async drain() {
    await Promise.allSettled([...this.active]);
  }
}
