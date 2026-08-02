import {
  TUTOR_RESULT_CERTAINTY,
  TutorGatewayClientError,
  validateLocalTutorRequest
} from './gateway-client.js';

function fence(claim, workerId, now) {
  return {
    jobId: claim.job.id,
    workerId,
    leaseToken: claim.job.leaseToken,
    expectedDeletionGeneration: claim.job.deletionGeneration,
    now
  };
}

function boundedLatency(startedAt, finishedAt) {
  if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt)) return 0;
  return Math.min(3_600_000, Math.max(0, Math.round(finishedAt - startedAt)));
}

function safeOutcomeCode(error) {
  return typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(error.code)
    ? error.code : 'TUTOR_GATEWAY_DELIVERY_UNKNOWN';
}

export class QuestionTutorWorker {
  constructor({
    store, gatewayClient, workerId, leaseMs = 120_000,
    knownNoResultRetryMs = 5_000,
    clock = () => new Date(), elapsedClock = () => performance.now()
  }) {
    if (!store || !gatewayClient
        || typeof gatewayClient.tutorTurn !== 'function'
        || typeof gatewayClient.dispatchMetadata !== 'function'
        || typeof workerId !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(workerId)
        || !Number.isSafeInteger(leaseMs) || leaseMs < 1 || leaseMs > 3_600_000
        || !Number.isSafeInteger(knownNoResultRetryMs)
        || knownNoResultRetryMs < 0 || knownNoResultRetryMs > 3_600_000
        || (Number.isSafeInteger(gatewayClient?.timeoutMs)
          && leaseMs < gatewayClient.timeoutMs + 5_000)
        || typeof clock !== 'function' || typeof elapsedClock !== 'function') {
      throw new Error('Question Tutor worker configuration is invalid.');
    }
    this.store = store;
    this.gatewayClient = gatewayClient;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.knownNoResultRetryMs = knownNoResultRetryMs;
    this.clock = clock;
    this.elapsedClock = elapsedClock;
  }

  async runOnce({ signal } = {}) {
    const claim = await this.store.claimTutorTurnJob({
      workerId: this.workerId,
      leaseMs: this.leaseMs,
      now: this.clock()
    });
    if (!claim) return { processed: false, providerCalls: 0 };
    return this.processClaimed(claim, { signal });
  }

  async #recordDeliveryUnknown(claim, errorClass = 'transient') {
    try {
      return await this.store.recordTutorDeliveryUnknown({
        ...fence(claim, this.workerId, this.clock()),
        errorClass: ['permanent', 'rate_limit', 'transient'].includes(errorClass)
          ? errorClass : 'transient'
      });
    } catch {
      return false;
    }
  }

  async #finishUnknown(claim, { providerCalls, errorClass = 'transient' } = {}) {
    const recorded = await this.#recordDeliveryUnknown(claim, errorClass);
    return recorded
      ? { processed: true, status: 'DELIVERY_UNKNOWN', providerCalls }
      : { processed: false, status: 'LEASE_RECOVERY_REQUIRED', providerCalls, staleWrite: true };
  }

  #leaseCoversProviderCall(claim) {
    if (!Number.isSafeInteger(this.gatewayClient.timeoutMs)) return true;
    const expiresAt = new Date(claim.job.leaseExpiresAt).getTime();
    const now = new Date(this.clock()).getTime();
    return Number.isFinite(expiresAt) && Number.isFinite(now)
      && expiresAt - now >= this.gatewayClient.timeoutMs + 5_000;
  }

  async processClaimed(claim, { signal } = {}) {
    if (!claim?.job || !validateLocalTutorRequest(claim.request)
        || claim.job.id !== claim.request.turnId
        || claim.job.threadId !== claim.request.threadId
        || claim.job.correlationId !== claim.request.correlationId
        || claim.job.inputHash !== claim.request.inputHash
        || claim.job.snapshotHash !== claim.request.snapshotHash
        || claim.job.contextHash !== claim.request.contextHash
        || claim.job.historyHash !== claim.request.historyHash) {
      return { processed: false, status: 'INVALID_CLAIM', providerCalls: 0 };
    }

    let dispatched;
    try {
      dispatched = await this.store.markTutorTurnDispatched({
        ...fence(claim, this.workerId, this.clock()),
        ...this.gatewayClient.dispatchMetadata()
      });
    } catch {
      // The commit acknowledgement may have been lost. A best-effort terminal
      // transition is safe only if the durable dispatch intent actually won.
      return this.#finishUnknown(claim, { providerCalls: 0 });
    }
    if (dispatched !== true) {
      return { processed: false, status: 'DISPATCH_NOT_COMMITTED', providerCalls: 0, staleWrite: true };
    }

    // Once MAY_HAVE_BEEN_DELIVERED is durable, even an abort before fetch must
    // fail conservatively: the worker cannot prove where an acknowledgement was lost.
    if (signal?.aborted || !this.#leaseCoversProviderCall(claim)) {
      return this.#finishUnknown(claim, { providerCalls: 0 });
    }

    const startedAt = this.elapsedClock();
    let gatewayResult;
    try {
      gatewayResult = await this.gatewayClient.tutorTurn(claim.request, { signal });
    } catch (error) {
      if (error instanceof TutorGatewayClientError
          && error.certainty === TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT) {
        const retryAfterMs = error.retryAfterMs || this.knownNoResultRetryMs;
        try {
          const recorded = await this.store.recordTutorKnownNoResult({
            ...fence(claim, this.workerId, this.clock()),
            retryable: error.retryable,
            retryAfterMs,
            outcomeCode: safeOutcomeCode(error),
            errorClass: error.errorClass
          });
          if (recorded) {
            return { processed: true, status: 'KNOWN_NO_RESULT', providerCalls: 1 };
          }
        } catch {
          // A lost acknowledgement may already have queued a safe retry. If it
          // did not, the best-effort MAY terminalization below prevents replay.
        }
      }
      return this.#finishUnknown(claim, {
        providerCalls: 1,
        errorClass: error instanceof TutorGatewayClientError ? error.errorClass : 'transient'
      });
    }

    const latencyMs = boundedLatency(startedAt, this.elapsedClock());
    try {
      const completed = await this.store.completeTutorTurnJob({
        ...fence(claim, this.workerId, this.clock()),
        gatewayResult,
        latencyMs
      });
      if (completed) return { processed: true, status: 'SUCCEEDED', providerCalls: 1 };
    } catch {
      // Provider success followed by an uncertain database acknowledgement is
      // never replayed automatically. The fenced transition below either wins
      // or lease recovery observes the durable MAY disposition.
    }
    return this.#finishUnknown(claim, { providerCalls: 1 });
  }
}

export const _test = { boundedLatency, safeOutcomeCode };
