import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  INFERENCE_CONTEXT_HASH_SCHEMA,
  INFERENCE_INPUT_HASH_SCHEMA,
  INFERENCE_PROMPT_VERSION,
  INFERENCE_REQUEST_SCHEMA,
  INFERENCE_RESPONSE_SCHEMA,
  INFERENCE_TASK,
  computeInferenceContextHash,
  computeInferenceInputHash,
  inferenceSha256
} from '../src/infrastructure/amc-inference-contract.js';
import { AmcInferenceClient } from '../src/infrastructure/amc-inference-client.js';

const TOKEN = 'gateway-token-that-is-long-enough-1234567890';

export function requestFixture() {
  const bodies = ['Use direct algebra.', 'Check the choices.'];
  const request = {
    schema: 'amc-inference-request-v2',
    task: 'question_analysis_v2',
    correlation_id: 'corr-client-0001',
    input_hash: '0'.repeat(64),
    context_hash: '0'.repeat(64),
    safety_id: 'amc-math-safe-v1',
    question: {
      question_id: 'fixture-amc12-01',
      prompt_markdown: 'If $x+2=5$, find $x$.',
      choices: ['A', 'B', 'C', 'D', 'E'].map((label, index) => ({ label, text_markdown: String(index + 1) })),
      scoring: { is_scored: true, canonical_answer: 'C', accepted_options: ['C'] },
      student_answer: 'C',
      student_answer_status: 'ACCEPTED',
      student_reasoning: 'Subtract two from both sides.',
      solutions: bodies.map((markdown, index) => ({
        solution_id: `solution-${index + 1}`,
        approval_status: 'APPROVED',
        title: `Method ${index + 1}`,
        markdown,
        body_sha256: inferenceSha256(markdown),
        source_sha256: String(index + 1).repeat(64),
        reviewer_id: `reviewer-${index + 1}`,
        reviewed_at: `2026-07-${30 + index}T12:00:00.000Z`,
        rights_status: 'approved-for-ai-use',
        method_tags: [index ? 'choice-check' : 'algebra'],
        quality_flags: []
      }))
    }
  };
  request.context_hash = computeInferenceContextHash(request);
  request.input_hash = computeInferenceInputHash(request);
  return request;
}

function analysisFixture(request) {
  return {
    schema: 'amc-question-analysis-v2',
    correlation_id: request.correlation_id,
    input_hash: request.input_hash,
    context_hash: request.context_hash,
    assessability: { status: 'ASSESSABLE', reasons: ['The response includes reasoning.'] },
    classification: 'CORRECT_AND_WELL_JUSTIFIED',
    summary: 'The algebra is correct.',
    strengths: ['The inverse operation is correct.'],
    gaps: [],
    suggestions: ['State why equality is preserved.'],
    solution_comparisons: request.question.solutions.map((solution) => ({
      solution_id: solution.solution_id,
      alignment: 'ALIGNS',
      observation: 'The submitted method follows this approved solution.'
    })),
    confidence: 0.96
  };
}

function successResponse(request) {
  return new Response(JSON.stringify({
    ok: true,
    analysis: analysisFixture(request),
    runMetadata: {
      provider: 'openai',
      requestedModel: 'gpt-5.6-terra',
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-analysis-prompt-v2',
      schemaVersion: 'amc-question-analysis-v2',
      usage: { inputTokens: 800, cachedInputTokens: 120, outputTokens: 200, totalTokens: 1000, reasoningTokens: 50 }
    }
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

test('inference v2 IDs and hash canonicalization match the frozen gateway algorithm', () => {
  assert.deepEqual([
    INFERENCE_REQUEST_SCHEMA, INFERENCE_TASK, INFERENCE_RESPONSE_SCHEMA,
    INFERENCE_PROMPT_VERSION, INFERENCE_CONTEXT_HASH_SCHEMA, INFERENCE_INPUT_HASH_SCHEMA
  ], [
    'amc-inference-request-v2', 'question_analysis_v2', 'amc-question-analysis-v2',
    'amc-question-analysis-prompt-v2', 'amc-question-context-hash-v2', 'amc-student-input-hash-v2'
  ]);
  assert.equal(
    computeInferenceContextHash(requestFixture()),
    '60af9d3cdc050a79bb41dbe77ebb2c324163f0803fb4474f1cb83573230ce6b1'
  );
  assert.equal(
    computeInferenceInputHash(requestFixture()),
    '212468805e0560268d0f6855d8a41a38a7a08a00c3b3cfb6abe484f7f2ca0811'
  );
});

test('checked-in analysis v2 golden freezes the exact request, model output, and hashes', async () => {
  const local = await readFile(new URL('./fixtures/analysis-contract-v2.json', import.meta.url));
  assert.equal(inferenceSha256(local), 'd929c3d36a12091fa10f3ca1396f7d25b56e57d926977eb90d9ebf79d43b912e');
  const fixture = JSON.parse(local.toString('utf8'));
  assert.deepEqual(Object.keys(fixture).sort(), ['expectedOutput', 'modelOutput', 'request']);
  assert.deepEqual(fixture.request, JSON.parse(JSON.stringify(fixture.request)));
  assert.deepEqual(fixture.modelOutput, JSON.parse(JSON.stringify(fixture.modelOutput)));
  assert.equal(computeInferenceContextHash(fixture.request), fixture.request.context_hash);
  assert.equal(computeInferenceInputHash(fixture.request), fixture.request.input_hash);
  const client = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => new Response(JSON.stringify({
      ok: true,
      analysis: fixture.modelOutput,
      runMetadata: {
        provider: 'openai', requestedModel: 'gpt-5.6-terra',
        responseModel: 'gpt-5.6-terra-2026-07-15',
        promptVersion: INFERENCE_PROMPT_VERSION, schemaVersion: INFERENCE_RESPONSE_SCHEMA,
        usage: { inputTokens: 800, cachedInputTokens: 100, outputTokens: 200, totalTokens: 1000 }
      }
    }), { status: 200 })
  });
  assert.deepEqual((await client.analyze(fixture.request)).analysis, fixture.expectedOutput);
});

test('client rejects v1, unscored, empty-reasoning, and scoring-contradictory requests before transport', async () => {
  let calls = 0;
  const client = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => { calls += 1; throw new Error('must not call'); }
  });
  const cases = [
    ['v1 schema', (request) => { request.schema = 'amc-inference-request-v1'; }],
    ['v1 task', (request) => { request.task = 'question_analysis_v1'; }],
    ['empty reasoning', (request) => { request.question.student_reasoning = ''; }],
    ['whitespace reasoning', (request) => { request.question.student_reasoning = ' \t\n '; }],
    ['unscored', (request) => {
      request.question.scoring = { is_scored: false, canonical_answer: null, accepted_options: [] };
      request.question.student_answer_status = 'BLANK';
    }],
    ['status contradiction', (request) => { request.question.student_answer_status = 'NOT_ACCEPTED'; }],
    ['unordered accepted options', (request) => {
      request.question.scoring.accepted_options = ['D', 'C'];
    }]
  ];
  for (const [name, mutate] of cases) {
    const request = requestFixture();
    mutate(request);
    request.context_hash = computeInferenceContextHash(request);
    request.input_hash = computeInferenceInputHash(request);
    await assert.rejects(
      () => client.analyze(request),
      (error) => error.code === 'INVALID_LOCAL_REQUEST',
      name
    );
  }
  assert.equal(calls, 0);
});

test('client rejects v1 and answer-semantics-contradictory model outputs', async () => {
  const cases = [
    ['v1 schema', 'ACCEPTED', 'C', (analysis) => { analysis.schema = 'amc-question-analysis-v1'; }],
    ['accepted answer marked incorrect', 'ACCEPTED', 'C', (analysis) => { analysis.classification = 'INCORRECT_EXECUTION'; }],
    ['nonaccepted answer marked correct', 'NOT_ACCEPTED', 'A', () => {}],
    ['removed answer-only classification', 'ACCEPTED', 'C', (analysis) => { analysis.classification = 'ANSWER_ONLY'; }],
    ['removed no-attempt classification', 'BLANK', null, (analysis) => { analysis.classification = 'NO_ATTEMPT'; }]
  ];
  for (const [name, status, answer, mutate] of cases) {
    const request = requestFixture();
    request.question.student_answer = answer;
    request.question.student_answer_status = status;
    request.input_hash = computeInferenceInputHash(request);
    const client = new AmcInferenceClient({
      token: TOKEN,
      fetchImpl: async () => {
        const payload = JSON.parse(await successResponse(request).text());
        mutate(payload.analysis);
        return new Response(JSON.stringify(payload), { status: 200 });
      }
    });
    await assert.rejects(
      () => client.analyze(request),
      (error) => error.code === 'GATEWAY_PROTOCOL_ERROR',
      name
    );
  }
});

test('client makes one fixed loopback call and accepts only the frozen success envelope', async () => {
  const request = requestFixture();
  const calls = [];
  const client = new AmcInferenceClient({
    origin: 'http://127.0.0.1:4110', token: TOKEN,
    fetchImpl: async (...input) => { calls.push(input); return successResponse(request); }
  });
  assert.equal(JSON.stringify(client).includes(TOKEN), false);
  const result = await client.analyze(request);
  assert.deepEqual(result.analysis, analysisFixture(request));
  assert.equal(result.runMetadata.promptVersion, 'amc-question-analysis-prompt-v2');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'http://127.0.0.1:4110/v2/analyze-question');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].redirect, 'manual');
  assert.equal(calls[0][1].headers.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(JSON.parse(calls[0][1].body), request);
  assert.throws(() => new AmcInferenceClient({ origin: 'https://example.test', token: TOKEN }), /loopback/);
  assert.throws(() => new AmcInferenceClient({ origin: 'http://127.0.0.1:4110/override', token: TOKEN }), /loopback/);
});

test('rich Markdown/HTML/link/TeX is accepted as quoted input but rejected in renderable model output', async () => {
  const request = requestFixture();
  const rich = '<custom-tag>work</custom-tag> [reference](https://example.test) <foo@example.com> \\htmlStyle{x}{y}';
  request.question.student_reasoning = rich;
  request.input_hash = computeInferenceInputHash(request);
  let calls = 0;
  const accepted = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => { calls += 1; return successResponse(request); }
  });
  await accepted.analyze(request);
  assert.equal(calls, 1);

  const rejected = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => {
      const response = JSON.parse(await successResponse(request).text());
      response.analysis.summary = rich;
      return new Response(JSON.stringify(response), { status: 200 });
    }
  });
  await assert.rejects(() => rejected.analyze(request), (error) => error.code === 'GATEWAY_PROTOCOL_ERROR');
});

test('input/output reject unpaired UTF-16 surrogates while preserving normal emoji', async () => {
  const emoji = requestFixture();
  emoji.question.student_reasoning = 'A valid paired scalar 😀 with allowed\tTAB,\nLF, and\rCR.';
  emoji.input_hash = computeInferenceInputHash(emoji);
  let calls = 0;
  const client = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => { calls += 1; return successResponse(emoji); }
  });
  await client.analyze(emoji);
  assert.equal(calls, 1);

  const invalidInput = structuredClone(emoji);
  invalidInput.question.student_reasoning = 'bad\uD800scalar';
  invalidInput.input_hash = computeInferenceInputHash(invalidInput);
  await assert.rejects(() => client.analyze(invalidInput), (error) => error.code === 'INVALID_LOCAL_REQUEST');
  assert.equal(calls, 1);

  const invalidOutput = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => {
      const response = JSON.parse(await successResponse(emoji).text());
      response.analysis.summary = 'bad\uDC00scalar';
      return new Response(JSON.stringify(response), { status: 200 });
    }
  });
  await assert.rejects(() => invalidOutput.analyze(emoji), (error) => error.code === 'GATEWAY_PROTOCOL_ERROR');

  for (const invalid of ['bad\u0001control', 'bad\u007Fcontrol']) {
    const request = structuredClone(emoji);
    request.question.student_reasoning = invalid;
    request.input_hash = computeInferenceInputHash(request);
    await assert.rejects(() => client.analyze(request), (error) => error.code === 'INVALID_LOCAL_REQUEST');
  }
});

test('maximum individual input fields including eight escaped solutions fit the frozen Gateway body ceiling', async () => {
  const request = requestFixture();
  request.question.prompt_markdown = '\\'.repeat(16_384);
  request.question.student_reasoning = '\\'.repeat(12_000);
  request.question.choices = ['A', 'B', 'C', 'D', 'E'].map((label) => ({
    label, text_markdown: '\\'.repeat(2_048)
  }));
  request.question.solutions = Array.from({ length: 8 }, (_, index) => {
    const markdown = '\\'.repeat(16_384);
    return {
      solution_id: `solution-${index + 1}`, approval_status: 'APPROVED', title: '\\'.repeat(256),
      markdown, body_sha256: inferenceSha256(markdown), source_sha256: String(index + 1).repeat(64),
      reviewer_id: `reviewer-${index + 1}`, reviewed_at: '2028-02-29T23:59:59.123456Z',
      rights_status: 'approved-for-ai-use', method_tags: ['algebra'], quality_flags: []
    };
  });
  request.context_hash = computeInferenceContextHash(request);
  request.input_hash = computeInferenceInputHash(request);
  const serializedBytes = Buffer.byteLength(JSON.stringify(request), 'utf8');
  assert.ok(serializedBytes > 262_144);
  assert.ok(serializedBytes <= 524_288);
  let calls = 0;
  const client = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => { calls += 1; return successResponse(request); }
  });
  await client.analyze(request);
  assert.equal(calls, 1);
});

test('client fails closed for lineage tamper, redirects, oversized bodies, and malformed metadata', async () => {
  const request = requestFixture();
  const tampered = structuredClone(request);
  tampered.question.solutions[0].reviewer_id = 'changed-reviewer';
  const never = new AmcInferenceClient({ token: TOKEN, fetchImpl: async () => { throw new Error('must not call'); } });
  await assert.rejects(() => never.analyze(tampered), (error) => error.code === 'INVALID_LOCAL_REQUEST');
  for (const invalidTimestamp of ['2026-02-30T00:00:00Z', '2026-01-01T24:00:00Z']) {
    const invalid = structuredClone(request);
    invalid.question.solutions[0].reviewed_at = invalidTimestamp;
    invalid.context_hash = computeInferenceContextHash(invalid);
    invalid.input_hash = computeInferenceInputHash(invalid);
    await assert.rejects(() => never.analyze(invalid), (error) => error.code === 'INVALID_LOCAL_REQUEST');
  }

  const redirect = new AmcInferenceClient({ token: TOKEN, fetchImpl: async () => new Response('', { status: 307 }) });
  await assert.rejects(() => redirect.analyze(request), (error) => error.code === 'GATEWAY_REDIRECT_REJECTED');

  const oversized = new AmcInferenceClient({
    token: TOKEN, maxResponseBytes: 2_048,
    fetchImpl: async () => new Response('x'.repeat(2_049), { status: 200 })
  });
  await assert.rejects(() => oversized.analyze(request), (error) => error.code === 'GATEWAY_RESPONSE_TOO_LARGE');

  const malformed = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => new Response(JSON.stringify({ ok: true, analysis: analysisFixture(request) }), { status: 200 })
  });
  await assert.rejects(() => malformed.analyze(request), (error) => error.code === 'GATEWAY_PROTOCOL_ERROR');

  const impossibleUsage = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => {
      const response = JSON.parse(await successResponse(request).text());
      response.runMetadata.usage.totalTokens += 1;
      return new Response(JSON.stringify(response), { status: 200 });
    }
  });
  await assert.rejects(() => impossibleUsage.analyze(request), (error) => error.code === 'GATEWAY_PROTOCOL_ERROR');
});

test('client preserves only stable gateway error semantics and aborts caller-disconnected work', async () => {
  const request = requestFixture();
  const capacity = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => new Response(JSON.stringify({
      ok: false, error: 'RATE_LIMITED', retryable: true, errorClass: 'rate_limit', retryAfterSeconds: 12
    }), { status: 429 })
  });
  await assert.rejects(
    () => capacity.analyze(request),
    (error) => error.code === 'RATE_LIMITED' && error.retryable === true && error.errorClass === 'rate_limit'
  );

  const controller = new AbortController();
  const aborted = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    })
  });
  const pending = aborted.analyze(request, { signal: controller.signal });
  controller.abort();
  await assert.rejects(
    () => pending,
    (error) => error.code === 'REQUEST_ABORTED' && error.retryable === true && error.errorClass === 'transient'
  );
});

test('connection and response-stream failures retain transient retry semantics', async () => {
  const request = requestFixture();
  const unavailable = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => { throw new TypeError('connect ECONNREFUSED'); }
  });
  await assert.rejects(
    () => unavailable.analyze(request),
    (error) => error.code === 'GATEWAY_UNAVAILABLE'
      && error.retryable === true && error.errorClass === 'transient'
  );

  const unreadable = new AmcInferenceClient({
    token: TOKEN,
    fetchImpl: async () => new Response(new ReadableStream({
      pull(controller) {
        controller.error(new Error('socket closed while reading'));
      }
    }), { status: 200 })
  });
  await assert.rejects(
    () => unreadable.analyze(request),
    (error) => error.code === 'GATEWAY_READ_FAILED'
      && error.retryable === true && error.errorClass === 'transient'
  );
});
