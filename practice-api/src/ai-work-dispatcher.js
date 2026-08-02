export class AiWorkDispatcher {
  constructor({
    store, tutorWorker, interactiveWorker, batchWorker, workerId, leaseMs = 120_000,
    concurrency = 2, maxBatchConcurrent = 1, maxTutorConcurrent = 1,
    clock = () => new Date(), onError = () => {}
  }) {
    if (!tutorWorker && !interactiveWorker && !batchWorker) {
      throw new Error('AI dispatcher needs at least one worker handler.');
    }
    if (typeof onError !== 'function') throw new Error('AI dispatcher onError must be a function.');
    if (tutorWorker && tutorWorker.workerId !== workerId
        || interactiveWorker && interactiveWorker.workerId !== workerId
        || batchWorker && batchWorker.workerId !== workerId) {
      throw new Error('AI dispatcher and handlers must share one worker identity.');
    }
    if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 32
        || !Number.isSafeInteger(maxBatchConcurrent) || maxBatchConcurrent < 1
        || maxBatchConcurrent > concurrency
        || !Number.isSafeInteger(maxTutorConcurrent) || maxTutorConcurrent < 1
        || maxTutorConcurrent > concurrency
        || (interactiveWorker && batchWorker && (concurrency < 2 || maxBatchConcurrent >= concurrency))) {
      throw new Error('Unified AI capacity must reserve at least one non-batch slot.');
    }
    if (tutorWorker && (interactiveWorker || batchWorker) && maxTutorConcurrent >= concurrency) {
      throw new Error('Unified AI capacity must reserve at least one non-Tutor slot.');
    }
    this.store = store;
    this.tutorWorker = tutorWorker;
    this.interactiveWorker = interactiveWorker;
    this.batchWorker = batchWorker;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.concurrency = concurrency;
    this.maxBatchConcurrent = maxBatchConcurrent;
    this.maxTutorConcurrent = maxTutorConcurrent;
    this.clock = clock;
    this.onError = onError;
    this.active = new Map();
    this.fillPromise = null;
  }

  async #claim() {
    // Tutor is an interactive, student-waiting path and therefore has strict
    // precedence over report analysis and batch extraction. The Store still
    // owns durable ordering, lease recovery, entitlement checks, and fencing.
    const activeTutor = [...this.active.values()].filter((kind) => kind === 'TUTOR_TURN').length;
    if (this.tutorWorker && activeTutor < this.maxTutorConcurrent) {
      const tutorClaim = await this.store.claimTutorTurnJob({
        workerId: this.workerId,
        now: this.clock(),
        leaseMs: this.leaseMs
      });
      if (tutorClaim) return { kind: 'TUTOR_TURN', job: tutorClaim };
    }
    const acceptedKinds = [];
    if (this.interactiveWorker) acceptedKinds.push('INTERACTIVE_ANALYSIS');
    if (this.batchWorker) acceptedKinds.push('BATCH_EXTRACTION');
    if (!acceptedKinds.length) return null;
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
    if (claimed.kind === 'TUTOR_TURN') {
      return this.tutorWorker.processClaimed(claimed.job, { signal });
    }
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
      this.active.set(tracked, claimed.kind);
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
    await Promise.allSettled([...this.active.keys()]);
  }
}
