import test from 'node:test';
import assert from 'node:assert/strict';
import {
  batchSha256,
  buildBatchQuestionCatalog,
  buildDecompositionPlan,
  segmentBatchGatewaySources
} from '../src/batch-ingest/domain.js';
import { AmcBatchDecompositionClient } from '../src/infrastructure/amc-batch-decomposition-client.js';
import { learningReviewForm } from './learning-review-fixture.js';

const TOKEN = 'batch-gateway-token-long-enough-1234567890';

function context(text = 'Question 1: C because one plus two equals three.') {
  const evidence = [{
    assetId: 'd282f7aa-8cb5-49db-8447-d948f1a834a9',
    position: 1,
    sourceKind: 'TEXT_UPLOAD',
    normalizedText: text,
    normalizedSha256: batchSha256(text),
    transcriptConfidence: null
  }];
  const plan = buildDecompositionPlan(evidence, {
    correlationId: 'batch-client-correlation-001',
    questionCatalog: buildBatchQuestionCatalog(learningReviewForm())
  });
  return { evidence, plan };
}

function publicSpan(segment) {
  return Object.fromEntries(['segmentId', 'assetId', 'startByte', 'endByte', 'sha256']
    .map((key) => [key, segment[key]]));
}

function decomposition(chunk, { allUnmapped = false } = {}) {
  const segments = segmentBatchGatewaySources(chunk.sources);
  return {
    schema: 'amc-batch-decomposition-v1',
    correlationId: chunk.correlationId,
    inputHash: chunk.inputHash,
    planHash: chunk.planHash,
    chunkId: chunk.chunkId,
    items: allUnmapped ? [] : [{
      itemKey: `item-${chunk.chunkId}`,
      candidateQuestionNumbers: [1],
      proposedQuestionNumber: 1,
      answer: 'C',
      reasoningSummary: 'One plus two equals three.',
      confidence: 0.97,
      ambiguity: 'NONE',
      spans: segments.map(publicSpan),
      conflictFlags: [],
      requiresConfirmation: false
    }],
    unmappedSpans: allUnmapped ? segments.map(publicSpan) : []
  };
}

function success(chunk, overrides = {}) {
  const payload = {
    ok: true,
    decomposition: decomposition(chunk),
    runMetadata: {
      provider: 'openai',
      requestedModel: 'gpt-5.6-terra',
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-batch-decomposition-prompt-v1',
      schemaVersion: 'amc-batch-decomposition-v1',
      usage: {
        inputTokens: 800,
        cachedInputTokens: 100,
        outputTokens: 200,
        totalTokens: 1000,
        reasoningTokens: 50
      }
    },
    ...overrides
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

test('client makes one fixed authenticated call for one rebuilt chunk without grading context or provider secrets', async () => {
  const { plan, evidence } = context();
  const chunk = plan.chunks[0];
  const calls = [];
  const client = new AmcBatchDecompositionClient({
    origin: 'http://127.0.0.1:4110', token: TOKEN,
    fetchImpl: async (...args) => { calls.push(args); return success(chunk); }
  });

  assert.equal(JSON.stringify(client).includes(TOKEN), false);
  const result = await client.decomposeChunk(chunk, { plan, evidence });
  assert.equal(result.decomposition.chunkId, chunk.chunkId);
  assert.equal(result.runMetadata.promptVersion, 'amc-batch-decomposition-prompt-v1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'http://127.0.0.1:4110/v1/decompose-batch');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].redirect, 'manual');
  assert.equal(calls[0][1].headers.authorization, `Bearer ${TOKEN}`);
  const body = JSON.parse(calls[0][1].body);
  assert.deepEqual(body, chunk);
  assert.equal(calls[0][1].body.includes(TOKEN), false);
  assert.equal(calls[0][1].body.includes('solutions'), false);
  assert.equal(calls[0][1].body.includes('official_answer'), false);
  assert.equal(calls[0][1].body.includes('correctOption'), false);
  assert.equal(calls[0][1].body.includes('providerApiKey'), false);

  assert.throws(() => new AmcBatchDecompositionClient({ origin: 'https://example.test', token: TOKEN }), /loopback/);
  assert.throws(() => new AmcBatchDecompositionClient({
    origin: 'http://127.0.0.1:4110/override', token: TOKEN
  }), /loopback/);
});

test('each durable plan chunk is one independent Gateway call', async () => {
  const evidence = [
    ['d282f7aa-8cb5-49db-8447-d948f1a834a9', 1],
    ['e392f7aa-8cb5-49db-8447-d948f1a834a9', 2]
  ].map(([assetId, position]) => {
    const normalizedText = 'x'.repeat(100_000);
    return {
      assetId, position, sourceKind: 'TEXT_UPLOAD', normalizedText,
      normalizedSha256: batchSha256(normalizedText), transcriptConfidence: null
    };
  });
  const plan = buildDecompositionPlan(evidence, {
    correlationId: 'batch-client-multiple-chunks',
    questionCatalog: buildBatchQuestionCatalog(learningReviewForm())
  });
  assert.ok(plan.chunks.length > 1);
  const calls = [];
  const client = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async (url, options) => {
      const request = JSON.parse(options.body);
      calls.push({ url, chunkId: request.chunkId });
      return success(request, { decomposition: decomposition(request, { allUnmapped: true }) });
    }
  });

  for (const chunk of plan.chunks) {
    await client.decomposeChunk(chunk, { plan, evidence });
  }
  assert.deepEqual(calls.map((call) => call.chunkId), plan.chunks.map((chunk) => chunk.chunkId));
  assert.equal(new Set(calls.map((call) => call.chunkId)).size, plan.chunks.length);
});

test('local request recomputes the complete plan and rejects tampering before fetch', async () => {
  const { plan, evidence } = context();
  let calls = 0;
  const client = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async () => { calls += 1; throw new Error('must not call'); }
  });

  for (const mutate of [
    (chunk) => { chunk.inputHash = '0'.repeat(64); },
    (chunk) => { chunk.planHash = '0'.repeat(64); },
    (chunk) => { chunk.sources[0].content += ' tampered'; },
    (chunk) => { chunk.solutions = [{ answer: 'C' }]; }
  ]) {
    const chunk = structuredClone(plan.chunks[0]);
    mutate(chunk);
    await assert.rejects(
      () => client.decomposeChunk(chunk, { plan, evidence }),
      (error) => error.code === 'INVALID_LOCAL_REQUEST'
    );
  }
  const changedPlan = structuredClone(plan);
  changedPlan.masterPlanHash = 'f'.repeat(64);
  await assert.rejects(
    () => client.decomposeChunk(plan.chunks[0], { plan: changedPlan, evidence }),
    (error) => error.code === 'INVALID_LOCAL_REQUEST'
  );
  assert.equal(calls, 0);
});

test('API domain re-slices durable evidence and rejects forged, missing, or duplicated Gateway spans', async () => {
  const { plan, evidence } = context();
  const chunk = plan.chunks[0];
  for (const mutate of [
    (output) => { output.items[0].spans[0].sha256 = '0'.repeat(64); },
    (output) => { output.items[0].spans = []; },
    (output) => { output.unmappedSpans.push(structuredClone(output.items[0].spans[0])); }
  ]) {
    const client = new AmcBatchDecompositionClient({
      token: TOKEN,
      fetchImpl: async () => {
        const output = decomposition(chunk);
        mutate(output);
        return success(chunk, { decomposition: output });
      }
    });
    await assert.rejects(
      () => client.decomposeChunk(chunk, { plan, evidence }),
      (error) => error.code === 'GATEWAY_PROTOCOL_ERROR'
    );
  }

  const staleEvidence = structuredClone(evidence);
  staleEvidence[0].normalizedText = 'same stored hash but different bytes';
  const client = new AmcBatchDecompositionClient({ token: TOKEN, fetchImpl: async () => success(chunk) });
  await assert.rejects(
    () => client.decomposeChunk(chunk, { plan, evidence: staleEvidence }),
    (error) => error.code === 'INVALID_LOCAL_REQUEST'
  );
});

test('strict envelopes reject redirects, oversized/non-JSON output, metadata drift, and reflected bearer secrets', async () => {
  const { plan, evidence } = context();
  const chunk = plan.chunks[0];
  const cases = [
    [async () => new Response('', { status: 307 }), 'GATEWAY_REDIRECT_REJECTED', {}],
    [async () => new Response('x'.repeat(16_385), {
      status: 200, headers: { 'content-type': 'application/json' }
    }), 'GATEWAY_RESPONSE_TOO_LARGE', { maxResponseBytes: 16_384 }],
    [async () => new Response('{}', { status: 200, headers: { 'content-type': 'text/plain' } }),
      'GATEWAY_PROTOCOL_ERROR', {}],
    [async () => {
      const response = JSON.parse(await success(chunk).text());
      response.runMetadata.schemaVersion = 'other-schema';
      return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
    }, 'GATEWAY_PROTOCOL_ERROR', {}],
    [async () => new Response(JSON.stringify({ ok: true, reflected: TOKEN }), {
      headers: { 'content-type': 'application/json' }
    }), 'GATEWAY_OUTPUT_REJECTED', {}]
  ];
  for (const [fetchImpl, code, options] of cases) {
    const client = new AmcBatchDecompositionClient({ token: TOKEN, fetchImpl, ...options });
    await assert.rejects(
      () => client.decomposeChunk(chunk, { plan, evidence }),
      (error) => error.code === code
    );
  }
});

test('only stable Gateway error semantics escape and Retry-After stays bounded', async () => {
  const { plan, evidence } = context();
  const chunk = plan.chunks[0];
  const rateLimited = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async () => new Response(JSON.stringify({
      ok: false,
      error: 'RATE_LIMITED',
      retryable: true,
      errorClass: 'rate_limit',
      retryAfterSeconds: 17
    }), { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '17' } })
  });
  await assert.rejects(
    () => rateLimited.decomposeChunk(chunk, { plan, evidence }),
    (error) => error.code === 'RATE_LIMITED' && error.retryable === true
      && error.errorClass === 'rate_limit' && error.retryAfterSeconds === 17
  );

  const rawError = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async () => new Response(JSON.stringify({
      ok: false,
      error: 'PROVIDER_UNAVAILABLE',
      retryable: true,
      errorClass: 'transient',
      rawProviderError: 'secret upstream body'
    }), { status: 502, headers: { 'content-type': 'application/json' } })
  });
  await assert.rejects(
    () => rawError.decomposeChunk(chunk, { plan, evidence }),
    (error) => error.code === 'PROVIDER_FAILED' && !error.message.includes('secret upstream body')
  );
});

test('connection, response-stream, caller abort, and timeout failures have transient retry semantics', async () => {
  const { plan, evidence } = context();
  const chunk = plan.chunks[0];
  const unavailable = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async () => { throw new TypeError('connect ECONNREFUSED secret detail'); }
  });
  await assert.rejects(
    () => unavailable.decomposeChunk(chunk, { plan, evidence }),
    (error) => error.code === 'GATEWAY_UNAVAILABLE' && error.retryable === true
      && error.errorClass === 'transient' && !error.message.includes('ECONNREFUSED')
  );

  const unreadable = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async () => new Response(new ReadableStream({
      pull(controller) { controller.error(new Error('raw socket error')); }
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  });
  await assert.rejects(
    () => unreadable.decomposeChunk(chunk, { plan, evidence }),
    (error) => error.code === 'GATEWAY_READ_FAILED' && error.retryable === true
  );

  const timedOut = new AmcBatchDecompositionClient({
    token: TOKEN,
    timeoutMs: 1_000,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    })
  });
  await assert.rejects(
    () => timedOut.decomposeChunk(chunk, { plan, evidence }),
    (error) => error.code === 'GATEWAY_TIMEOUT' && error.retryable === true
      && error.errorClass === 'transient'
  );

  const controller = new AbortController();
  const aborted = new AmcBatchDecompositionClient({
    token: TOKEN,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    })
  });
  const pending = aborted.decomposeChunk(chunk, { plan, evidence, signal: controller.signal });
  controller.abort();
  await assert.rejects(
    () => pending,
    (error) => error.code === 'REQUEST_ABORTED' && error.retryable === true
      && error.errorClass === 'transient'
  );
});
