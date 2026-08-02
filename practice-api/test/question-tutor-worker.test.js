import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  TUTOR_RESULT_CERTAINTY,
  TutorGatewayClientError
} from '../src/question-tutor/gateway-client.js';
import { QuestionTutorWorker } from '../src/question-tutor/worker.js';

const contract = JSON.parse(await readFile(
  new URL('./fixtures/tutor-contract-v2.json', import.meta.url), 'utf8'
));

function successPayload(request) {
  return {
    ok: true,
    tutorTurn: { ...structuredClone(contract.expectedOutput),
      correlationId: request.correlationId, inputHash: request.inputHash,
      snapshotHash: request.snapshotHash, contextHash: request.contextHash,
      historyHash: request.historyHash, threadId: request.threadId,
      turnId: request.turnId, turnNumber: request.turnNumber },
    runMetadata: {
      provider: 'openai', requestedModel: 'gpt-5.6-terra',
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-tutor-prompt-v2',
      schemaVersion: 'amc-tutor-turn-v2',
      usage: { inputTokens: 900, cachedInputTokens: 100, outputTokens: 180, totalTokens: 1080 }
    }
  };
}

class CrashWindowStore {
  constructor({ markMode = 'success', completeMode = 'success' } = {}) {
    this.request = structuredClone(contract.request);
    this.job = {
      id: this.request.turnId,
      threadId: this.request.threadId,
      correlationId: this.request.correlationId,
      inputHash: this.request.inputHash,
      snapshotHash: this.request.snapshotHash,
      contextHash: this.request.contextHash,
      historyHash: this.request.historyHash,
      leaseToken: 'lease-token-001',
      deletionGeneration: 0,
      status: 'RUNNING',
      providerInvoked: false,
      deliveryDisposition: 'NOT_DISPATCHED'
    };
    this.markMode = markMode;
    this.completeMode = completeMode;
    this.calls = [];
    this.claimed = false;
  }

  claimTutorTurnJob() {
    this.calls.push('claim');
    if (this.claimed || this.job.status !== 'RUNNING') return null;
    this.claimed = true;
    return { job: structuredClone(this.job), request: structuredClone(this.request) };
  }

  markTutorTurnDispatched(input) {
    this.calls.push('mark');
    assert.equal(input.jobId, this.job.id);
    assert.equal(input.leaseToken, this.job.leaseToken);
    if (this.markMode === 'false') return false;
    this.job.providerInvoked = true;
    this.job.deliveryDisposition = 'MAY_HAVE_BEEN_DELIVERED';
    if (this.markMode === 'ack-lost') throw new Error('private database acknowledgement detail');
    return true;
  }

  recordTutorDeliveryUnknown() {
    this.calls.push('unknown');
    if (!this.job.providerInvoked
        || this.job.deliveryDisposition !== 'MAY_HAVE_BEEN_DELIVERED') return false;
    this.job.status = 'DELIVERY_UNKNOWN';
    return true;
  }

  recordTutorKnownNoResult(input) {
    this.calls.push('known');
    if (!this.job.providerInvoked
        || this.job.deliveryDisposition !== 'MAY_HAVE_BEEN_DELIVERED') return false;
    this.job.deliveryDisposition = 'KNOWN_NO_RESULT';
    this.job.status = input.retryable ? 'RETRY_WAIT' : 'FAILED';
    this.knownInput = structuredClone(input);
    return true;
  }

  completeTutorTurnJob(input) {
    this.calls.push('complete');
    if (this.completeMode === 'throw') throw new Error('private completion acknowledgement detail');
    if (this.completeMode === 'false') return false;
    this.job.status = 'SUCCEEDED';
    this.job.deliveryDisposition = 'DELIVERED_RESULT';
    this.completedInput = structuredClone(input);
    return { job: structuredClone(this.job) };
  }
}

class FakeGatewayClient {
  constructor(store, behavior = 'success') {
    this.store = store;
    this.behavior = behavior;
    this.providerCalls = 0;
  }

  dispatchMetadata() {
    return {
      provider: 'openai', requestedModel: 'gpt-5.6-terra',
      promptVersion: 'amc-question-tutor-prompt-v2',
      responseSchemaVersion: 'amc-tutor-turn-v2'
    };
  }

  async tutorTurn(request) {
    assert.equal(this.store.job.deliveryDisposition, 'MAY_HAVE_BEEN_DELIVERED',
      'provider transport is forbidden before the dispatch transaction commits');
    this.providerCalls += 1;
    if (this.behavior === 'during-call-crash') throw new Error('private process fault');
    if (this.behavior === 'delivery-unknown') {
      throw new TutorGatewayClientError('DELIVERY_UNKNOWN', {
        certainty: TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN
      });
    }
    if (this.behavior === 'known-rate-limit') {
      throw new TutorGatewayClientError('RATE_LIMITED', {
        certainty: TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT,
        retryable: true, errorClass: 'rate_limit', retryAfterMs: 9_000
      });
    }
    return successPayload(request);
  }
}

function workerFixture(options = {}, behavior = 'success') {
  const store = new CrashWindowStore(options);
  const client = new FakeGatewayClient(store, behavior);
  let elapsed = 1_000;
  const worker = new QuestionTutorWorker({
    store, gatewayClient: client, workerId: 'tutor-worker-001', leaseMs: 120_000,
    clock: () => new Date('2026-08-01T12:00:00.000Z'),
    elapsedClock: () => { elapsed += 125; return elapsed; }
  });
  return { store, client, worker };
}

test('crash window 1: an abort before provider call leaves durable MAY and never invokes the provider', async () => {
  const { store, client, worker } = workerFixture();
  const controller = new AbortController();
  controller.abort();
  const result = await worker.runOnce({ signal: controller.signal });
  assert.deepEqual(result, { processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 0 });
  assert.equal(client.providerCalls, 0);
  assert.equal(store.job.status, 'DELIVERY_UNKNOWN');
  assert.deepEqual(store.calls, ['claim', 'mark', 'unknown']);
  assert.deepEqual(await worker.runOnce(), { processed: false, providerCalls: 0 });
  assert.equal(client.providerCalls, 0, 'terminal MAY work is not replayed automatically');
});

test('crash window 2: lost dispatch-commit acknowledgement forbids provider invocation and terminalizes MAY', async () => {
  const { store, client, worker } = workerFixture({ markMode: 'ack-lost' });
  const result = await worker.runOnce();
  assert.deepEqual(result, { processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 0 });
  assert.equal(client.providerCalls, 0);
  assert.equal(store.job.deliveryDisposition, 'MAY_HAVE_BEEN_DELIVERED');
  assert.equal(store.job.status, 'DELIVERY_UNKNOWN');
  assert.deepEqual(store.calls, ['claim', 'mark', 'unknown']);
  assert.deepEqual(await worker.runOnce(), { processed: false, providerCalls: 0 });
  assert.equal(client.providerCalls, 0, 'an acknowledgement gap cannot trigger a provider replay');
});

test('crash window 3: a crash during provider call is never automatically retried', async () => {
  const { store, client, worker } = workerFixture({}, 'during-call-crash');
  const result = await worker.runOnce();
  assert.deepEqual(result, { processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 1 });
  assert.equal(client.providerCalls, 1);
  assert.equal(store.job.status, 'DELIVERY_UNKNOWN');
  assert.deepEqual(store.calls, ['claim', 'mark', 'unknown']);
  assert.deepEqual(await worker.runOnce(), { processed: false, providerCalls: 0 });
  assert.equal(client.providerCalls, 1, 'the in-flight crash remains a single provider invocation');
});

test('a delivery-unknown Gateway classification is terminal until explicit student retry', async () => {
  const { store, client, worker } = workerFixture({}, 'delivery-unknown');
  assert.deepEqual(await worker.runOnce(), {
    processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 1
  });
  assert.equal(store.job.status, 'DELIVERY_UNKNOWN');
  assert.deepEqual(await worker.runOnce(), { processed: false, providerCalls: 0 });
  assert.equal(client.providerCalls, 1);
});

test('crash window 4: provider success followed by completion uncertainty is never replayed', async () => {
  const { store, client, worker } = workerFixture({ completeMode: 'throw' });
  const result = await worker.runOnce();
  assert.deepEqual(result, { processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 1 });
  assert.equal(client.providerCalls, 1);
  assert.equal(store.job.status, 'DELIVERY_UNKNOWN');
  assert.deepEqual(store.calls, ['claim', 'mark', 'complete', 'unknown']);
  assert.deepEqual(await worker.runOnce(), { processed: false, providerCalls: 0 });
  assert.equal(client.providerCalls, 1, 'provider success is not replayed after persistence uncertainty');
});

test('worker retries only a strict known-no-result outcome and preserves gateway retry semantics', async () => {
  const { store, client, worker } = workerFixture({}, 'known-rate-limit');
  const result = await worker.runOnce();
  assert.deepEqual(result, { processed: true, status: 'KNOWN_NO_RESULT', providerCalls: 1 });
  assert.equal(client.providerCalls, 1);
  assert.equal(store.job.status, 'RETRY_WAIT');
  assert.equal(store.job.deliveryDisposition, 'KNOWN_NO_RESULT');
  assert.equal(store.knownInput.retryAfterMs, 9_000);
  assert.equal(store.knownInput.outcomeCode, 'RATE_LIMITED');
  assert.equal(store.knownInput.errorClass, 'rate_limit');
  assert.deepEqual(store.calls, ['claim', 'mark', 'known']);
});

test('worker never calls the provider when dispatch intent is not durably acknowledged', async () => {
  const { store, client, worker } = workerFixture({ markMode: 'false' });
  const result = await worker.runOnce();
  assert.deepEqual(result, {
    processed: false, status: 'DISPATCH_NOT_COMMITTED', providerCalls: 0, staleWrite: true
  });
  assert.equal(client.providerCalls, 0);
  assert.equal(store.job.deliveryDisposition, 'NOT_DISPATCHED');
  assert.deepEqual(store.calls, ['claim', 'mark']);
});

test('successful Tutor completion passes the complete immutable Gateway envelope and measured latency', async () => {
  const { store, client, worker } = workerFixture();
  const result = await worker.runOnce();
  assert.deepEqual(result, { processed: true, status: 'SUCCEEDED', providerCalls: 1 });
  assert.equal(client.providerCalls, 1);
  assert.equal(store.completedInput.gatewayResult.ok, true);
  assert.equal(store.completedInput.gatewayResult.tutorTurn.turnId, store.job.id);
  assert.equal(store.completedInput.latencyMs, 125);
  assert.equal(store.job.status, 'SUCCEEDED');
  assert.deepEqual(store.calls, ['claim', 'mark', 'complete']);
});

test('worker rejects a lease that cannot cover the configured Gateway timeout and persistence margin', () => {
  const store = new CrashWindowStore();
  const client = new FakeGatewayClient(store);
  client.timeoutMs = 65_000;
  assert.throws(() => new QuestionTutorWorker({
    store, gatewayClient: client, workerId: 'tutor-worker-short-lease', leaseMs: 69_999
  }), /configuration/);
  assert.doesNotThrow(() => new QuestionTutorWorker({
    store, gatewayClient: client, workerId: 'tutor-worker-covered-lease', leaseMs: 70_000
  }));
});

test('worker rechecks remaining lease budget after durable dispatch and skips a late provider call', async () => {
  const store = new CrashWindowStore();
  store.job.leaseExpiresAt = new Date('2026-08-01T12:00:10.000Z');
  const client = new FakeGatewayClient(store);
  client.timeoutMs = 65_000;
  const worker = new QuestionTutorWorker({
    store, gatewayClient: client, workerId: 'tutor-worker-late', leaseMs: 120_000,
    clock: () => new Date('2026-08-01T12:00:05.001Z')
  });
  assert.deepEqual(await worker.runOnce(), {
    processed: true, status: 'DELIVERY_UNKNOWN', providerCalls: 0
  });
  assert.equal(client.providerCalls, 0);
  assert.deepEqual(store.calls, ['claim', 'mark', 'unknown']);
});
