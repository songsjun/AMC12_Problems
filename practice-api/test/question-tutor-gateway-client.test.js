import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  AmcTutorGatewayClient,
  TUTOR_RESULT_CERTAINTY,
  validateLocalTutorRequest
} from '../src/question-tutor/gateway-client.js';

const TOKEN = 'tutor-gateway-token-that-is-long-enough-1234567890';
const MODEL = 'gpt-5.6-terra';
const contract = JSON.parse(await readFile(
  new URL('./fixtures/tutor-contract-v2.json', import.meta.url), 'utf8'
));

function requestFixture() {
  return structuredClone(contract.request);
}

function successPayload(request = requestFixture()) {
  return {
    ok: true,
    tutorTurn: {
      ...structuredClone(contract.expectedOutput),
      correlationId: request.correlationId,
      inputHash: request.inputHash,
      snapshotHash: request.snapshotHash,
      contextHash: request.contextHash,
      historyHash: request.historyHash,
      threadId: request.threadId,
      turnId: request.turnId,
      turnNumber: request.turnNumber
    },
    runMetadata: {
      provider: 'openai',
      requestedModel: MODEL,
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-tutor-prompt-v2',
      schemaVersion: 'amc-tutor-turn-v2',
      usage: {
        inputTokens: 900,
        cachedInputTokens: 100,
        outputTokens: 180,
        totalTokens: 1080,
        reasoningTokens: 40
      }
    }
  };
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status, headers: { 'content-type': 'application/json', ...headers }
  });
}

test('Tutor Gateway client makes one fixed authenticated loopback call and validates the full success envelope', async () => {
  const request = requestFixture();
  const calls = [];
  const client = new AmcTutorGatewayClient({
    origin: 'http://127.0.0.1:4110', token: TOKEN, requestedModel: MODEL,
    fetchImpl: async (...args) => {
      calls.push(args);
      return jsonResponse(successPayload(request));
    }
  });
  assert.equal(validateLocalTutorRequest(request), true);
  assert.equal(JSON.stringify(client).includes(TOKEN), false);
  assert.deepEqual(await client.tutorTurn(request), successPayload(request));
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'http://127.0.0.1:4110/v1/tutor-turn');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].redirect, 'manual');
  assert.equal(calls[0][1].headers.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(JSON.parse(calls[0][1].body), request);
  assert.deepEqual(client.dispatchMetadata(), {
    provider: 'openai', requestedModel: MODEL,
    promptVersion: 'amc-question-tutor-prompt-v2',
    responseSchemaVersion: 'amc-tutor-turn-v2'
  });
});

test('Tutor Gateway client recomputes the complete request before transport', async () => {
  let calls = 0;
  const client = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL,
    fetchImpl: async () => { calls += 1; throw new Error('must not call'); }
  });
  for (const mutate of [
    (request) => { request.inputHash = 'f'.repeat(64); },
    (request) => { request.context.question.solutions[0].markdown = 'tampered'; },
    (request) => { request.untrusted = true; },
    (request) => { request.priorTurns[0].turnNumber = 9; }
  ]) {
    const request = requestFixture();
    mutate(request);
    await assert.rejects(() => client.tutorTurn(request), (error) =>
      error.code === 'INVALID_LOCAL_TUTOR_REQUEST'
        && error.certainty === TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT
        && error.retryable === false);
  }
  assert.equal(calls, 0);
});

test('Tutor Gateway client accepts known-no-result only from a strict failure envelope', async () => {
  const rateLimited = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL,
    fetchImpl: async () => jsonResponse({
      ok: false, error: 'RATE_LIMITED', retryable: true,
      errorClass: 'rate_limit', retryAfterSeconds: 9
    }, 429)
  });
  await assert.rejects(() => rateLimited.tutorTurn(requestFixture()), (error) =>
    error.code === 'RATE_LIMITED'
      && error.certainty === TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT
      && error.retryable === true && error.errorClass === 'rate_limit'
      && error.retryAfterMs === 9_000);

  const unknown = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL,
    fetchImpl: async () => jsonResponse({
      ok: false, error: 'DELIVERY_UNKNOWN', retryable: false,
      errorClass: 'delivery_unknown'
    }, 502)
  });
  await assert.rejects(() => unknown.tutorTurn(requestFixture()), (error) =>
    error.code === 'DELIVERY_UNKNOWN'
      && error.certainty === TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN
      && error.retryable === false);

  const contradictory = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL,
    fetchImpl: async () => jsonResponse({
      ok: false, error: 'PROVIDER_TIMEOUT', retryable: true,
      errorClass: 'delivery_unknown'
    }, 502)
  });
  await assert.rejects(() => contradictory.tutorTurn(requestFixture()), (error) =>
    error.code === 'TUTOR_GATEWAY_PROTOCOL_ERROR'
      && error.certainty === TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN);

  const disguisedUnknown = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL,
    fetchImpl: async () => jsonResponse({
      ok: false, error: 'DELIVERY_UNKNOWN', retryable: true,
      errorClass: 'transient'
    }, 502)
  });
  await assert.rejects(() => disguisedUnknown.tutorTurn(requestFixture()), (error) =>
    error.code === 'TUTOR_GATEWAY_PROTOCOL_ERROR'
      && error.certainty === TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN
      && error.retryable === false);
});

test('Tutor Gateway client treats redirects, connection/stream faults, malformed successes, and size overflow as delivery-unknown', async () => {
  const request = requestFixture();
  const cases = [
    new AmcTutorGatewayClient({
      token: TOKEN, requestedModel: MODEL,
      fetchImpl: async () => new Response('', { status: 307 })
    }),
    new AmcTutorGatewayClient({
      token: TOKEN, requestedModel: MODEL,
      fetchImpl: async () => { throw new TypeError('private connection detail'); }
    }),
    new AmcTutorGatewayClient({
      token: TOKEN, requestedModel: MODEL,
      fetchImpl: async () => new Response(new ReadableStream({
        pull(controller) { controller.error(new Error('private stream detail')); }
      }), { status: 200 })
    }),
    new AmcTutorGatewayClient({
      token: TOKEN, requestedModel: MODEL,
      fetchImpl: async () => {
        const payload = successPayload(request);
        payload.tutorTurn.turnId = 'cross-job-turn';
        return jsonResponse(payload);
      }
    }),
    new AmcTutorGatewayClient({
      token: TOKEN, requestedModel: MODEL, maxResponseBytes: 2_048,
      fetchImpl: async () => new Response('x'.repeat(2_049), { status: 200 })
    })
  ];
  for (const client of cases) {
    await assert.rejects(() => client.tutorTurn(request), (error) =>
      error.certainty === TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN);
  }
});

test('Tutor Gateway client aborts bounded calls and rejects non-loopback or path-bearing origins', async () => {
  const client = new AmcTutorGatewayClient({
    token: TOKEN, requestedModel: MODEL, timeoutMs: 100,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('private abort reason')), { once: true });
    })
  });
  await assert.rejects(() => client.tutorTurn(requestFixture()), (error) =>
    error.code === 'TUTOR_GATEWAY_TIMEOUT'
      && error.certainty === TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN);
  assert.throws(() => new AmcTutorGatewayClient({
    origin: 'https://example.test', token: TOKEN, requestedModel: MODEL
  }), /loopback/);
  assert.throws(() => new AmcTutorGatewayClient({
    origin: 'http://127.0.0.1:4110/untrusted', token: TOKEN, requestedModel: MODEL
  }), /loopback/);
});

test('Tutor Gateway transport policy cannot be reassigned after construction', () => {
  const client = new AmcTutorGatewayClient({
    origin: 'http://127.0.0.1:4110', token: 't'.repeat(32),
    requestedModel: 'gpt-5.6-terra', fetchImpl: async () => new Response('{}')
  });
  assert.equal(client.timeoutMs, 65_000);
  assert.throws(() => { client.timeoutMs = 1; }, TypeError);
  assert.equal(Object.hasOwn(client, 'endpoint'), false);
  assert.equal(Object.hasOwn(client, 'fetchImpl'), false);
  assert.equal(Object.hasOwn(client, 'requestedModel'), false);
  assert.equal(Object.hasOwn(client, 'maxResponseBytes'), false);
});
