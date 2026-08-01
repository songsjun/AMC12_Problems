import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AssemblyAiPrerecordedClient,
  _test
} from '../src/infrastructure/assemblyai-prerecorded.js';

const API_KEY = 'assembly-test-key-long-enough-never-real';
const UPLOAD_ID = 'f756988d-47e2-4ca3-96ce-04bb168f8f2a';
const TRANSCRIPT_ID = '9ea68fd3-f953-42c1-9742-976c447fb463';
const jsonResponse = (value, init = {}) => new Response(JSON.stringify(value), {
  ...init,
  headers: { 'content-type': 'application/json', ...(init.headers || {}) }
});

test('pre-recorded adapter uses only fixed endpoints, current speech_models, and no optional provider features', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push([url, init]);
    if (url.endsWith('/v2/upload')) {
      return jsonResponse({ upload_url: `https://cdn.assemblyai.com/upload/${UPLOAD_ID}` });
    }
    if (init.method === 'POST') return jsonResponse({ id: TRANSCRIPT_ID, status: 'queued' });
    if (init.method === 'GET') {
      return jsonResponse({
        id: TRANSCRIPT_ID, status: 'completed', text: 'Question one reasoning.', confidence: 0.91,
        audio_duration: 12.5
      });
    }
    return jsonResponse({
      id: TRANSCRIPT_ID, status: 'completed', audio_url: 'http://deleted_by_user', text: 'Deleted by user.'
    });
  };
  const client = new AssemblyAiPrerecordedClient({ apiKey: API_KEY, fetchImpl });
  assert.equal(JSON.stringify(client).includes(API_KEY), false);
  const uploaded = await client.upload({ body: new Uint8Array([1, 2, 3]), contentLength: 3 });
  const submitted = await client.submit({ uploadUrl: uploaded.uploadUrl });
  const completed = await client.getTranscript(submitted.transcriptId);
  const deleted = await client.deleteTranscript(submitted.transcriptId);

  assert.equal(completed.text, 'Question one reasoning.');
  assert.equal(deleted.deletionEvidenced, true);
  assert.deepEqual(calls.map(([url]) => url), [
    'https://api.assemblyai.com/v2/upload',
    'https://api.assemblyai.com/v2/transcript',
    `https://api.assemblyai.com/v2/transcript/${TRANSCRIPT_ID}`,
    `https://api.assemblyai.com/v2/transcript/${TRANSCRIPT_ID}`
  ]);
  assert.ok(calls.every(([, init]) => init.redirect === 'manual'));
  assert.ok(calls.every(([, init]) => init.headers.authorization === API_KEY));
  const submitPayload = JSON.parse(calls[1][1].body);
  assert.deepEqual(submitPayload, {
    audio_url: `https://cdn.assemblyai.com/upload/${UPLOAD_ID}`,
    speech_models: ['universal-3-pro', 'universal-2'],
    language_detection: true
  });
  assert.deepEqual(_test.SPEECH_MODELS, ['universal-3-pro', 'universal-2']);
  for (const forbidden of ['webhook_url', 'summarization', 'entity_detection', 'content_safety']) {
    assert.equal(Object.hasOwn(submitPayload, forbidden), false);
  }
});

test('adapter rejects user/provider URL substitution and redirects without following them', async () => {
  let calls = 0;
  const invalidUpload = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({ upload_url: `https://evil.invalid/upload/${UPLOAD_ID}` });
    }
  });
  await assert.rejects(
    () => invalidUpload.upload({ body: new Uint8Array([1]), contentLength: 1 }),
    (error) => error.code === 'ASSEMBLYAI_UPLOAD_URL_REJECTED'
  );
  await assert.rejects(
    () => invalidUpload.submit({ uploadUrl: `https://evil.invalid/upload/${UPLOAD_ID}` }),
    (error) => error.code === 'ASSEMBLYAI_UPLOAD_URL_REJECTED'
  );
  assert.equal(calls, 1);

  const redirect = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async (_url, init) => {
      calls += 1;
      assert.equal(init.redirect, 'manual');
      return new Response('', { status: 307, headers: { location: 'http://127.0.0.1/private' } });
    }
  });
  await assert.rejects(
    () => redirect.upload({ body: new Uint8Array([1]), contentLength: 1 }),
    (error) => error.code === 'ASSEMBLYAI_REDIRECT_REJECTED' && !error.retryable
  );
  assert.equal(calls, 2);
});

test('an exact transcript DELETE 404 is idempotent absence evidence, while other delete errors remain failures', async () => {
  const absent = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async (_url, init) => {
      assert.equal(init.method, 'DELETE');
      return jsonResponse({}, { status: 404 });
    }
  });
  assert.deepEqual(await absent.deleteTranscript(TRANSCRIPT_ID), {
    transcriptId: TRANSCRIPT_ID,
    deletionEvidenced: true,
    evidenceType: 'provider-already-absent'
  });

  const forbidden = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({}, { status: 403 })
  });
  await assert.rejects(
    () => forbidden.deleteTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_REJECTED' && error.retryable === false
  );
});

test('list reconciliation follows only the fixed older-page cursor and ignores non-Assembly audio rows', async () => {
  const olderId = '8ea68fd3-f953-42c1-9742-976c447fb463';
  const requested = [];
  const client = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async (url, init) => {
      requested.push(url);
      assert.equal(init.method, 'GET');
      return jsonResponse({
        page_details: {
          prev_url: `https://api.assemblyai.com/v2/transcript?limit=200&created_on=2026-08-01&before_id=${olderId}`,
          next_url: 'https://api.assemblyai.com/v2/transcript?after_id=ignored-newer-page'
        },
        transcripts: [
          { id: TRANSCRIPT_ID, audio_url: `https://cdn.assemblyai.com/upload/${UPLOAD_ID}` },
          { id: '7ea68fd3-f953-42c1-9742-976c447fb463', audio_url: 'https://student.example/audio.mp3' },
          { id: '6ea68fd3-f953-42c1-9742-976c447fb463', audio_url: 'http://deleted_by_user' }
        ]
      });
    }
  });
  assert.deepEqual(await client.listTranscripts({ createdOn: '2026-08-01' }), {
    transcripts: [{
      transcriptId: TRANSCRIPT_ID,
      audioUrl: `https://cdn.assemblyai.com/upload/${UPLOAD_ID}`
    }],
    nextBeforeId: olderId
  });
  assert.deepEqual(requested, [
    'https://api.assemblyai.com/v2/transcript?limit=200&created_on=2026-08-01'
  ]);

  for (const prevUrl of [
    `https://evil.invalid/v2/transcript?limit=200&created_on=2026-08-01&before_id=${olderId}`,
    `https://api.assemblyai.com/v2/transcript?limit=200&created_on=2026-08-02&before_id=${olderId}`,
    `https://api.assemblyai.com/v2/transcript?limit=200&created_on=2026-08-01&before_id=${olderId}&url=http://127.0.0.1`
  ]) {
    const malicious = new AssemblyAiPrerecordedClient({
      apiKey: API_KEY,
      fetchImpl: async () => jsonResponse({ page_details: { prev_url: prevUrl }, transcripts: [] })
    });
    await assert.rejects(
      () => malicious.listTranscripts({ createdOn: '2026-08-01' }),
      (error) => error.code === 'ASSEMBLYAI_PROTOCOL_ERROR'
    );
  }
});

test('adapter bounds upload and provider responses, validates completed fields, and never parses raw error bodies', async () => {
  const never = new AssemblyAiPrerecordedClient({ apiKey: API_KEY, fetchImpl: async () => { throw new Error('not called'); } });
  await assert.rejects(
    () => never.upload({ body: new Uint8Array([1]), contentLength: _test.MAX_AUDIO_BYTES + 1 }),
    (error) => error.code === 'INVALID_AUDIO_UPLOAD'
  );

  const declaredOversize = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY, maxResponseBytes: 16_384,
    fetchImpl: async () => jsonResponse({}, { headers: { 'content-length': '16385' } })
  });
  await assert.rejects(
    () => declaredOversize.upload({ body: new Uint8Array([1]), contentLength: 1 }),
    (error) => error.code === 'ASSEMBLYAI_RESPONSE_TOO_LARGE'
  );

  for (const malformed of [
    { id: TRANSCRIPT_ID, status: 'completed', text: null, confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: '   \n\t', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'bad\u0000text', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'bad\u0001text', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'bad\u007ftext', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'bad\ufffdtext', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'bad\ud800text', confidence: 0.9, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'ok', confidence: 2, audio_duration: 2 },
    { id: TRANSCRIPT_ID, status: 'completed', text: 'ok', confidence: 0.9, audio_duration: '2' }
  ]) {
    const client = new AssemblyAiPrerecordedClient({ apiKey: API_KEY, fetchImpl: async () => jsonResponse(malformed) });
    await assert.rejects(
      () => client.getTranscript(TRANSCRIPT_ID),
      (error) => error.code === 'ASSEMBLYAI_TRANSCRIPT_INVALID'
    );
  }

  const validUnicode = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({
      id: TRANSCRIPT_ID, status: 'completed', text: 'valid\tline\nreturn\r and emoji 😀',
      confidence: null, audio_duration: 2
    })
  });
  assert.equal((await validUnicode.getTranscript(TRANSCRIPT_ID)).confidence, null);

  const falseDeletionEvidence = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({ id: TRANSCRIPT_ID, status: 'completed', text: 'Still retained.' })
  });
  await assert.rejects(
    () => falseDeletionEvidence.deleteTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_PROTOCOL_ERROR'
  );

  const rawSecret = 'RAW-PROVIDER-PRIVATE-DETAIL';
  const rejected = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({ error: rawSecret }, { status: 400 })
  });
  await assert.rejects(
    () => rejected.getTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_REJECTED' && !error.message.includes(rawSecret)
  );
});

test('adapter classifies rate limits, transient failures, abort, and timeout with redacted codes', async () => {
  const rateLimited = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({}, { status: 429, headers: { 'retry-after': '17' } })
  });
  await assert.rejects(
    () => rateLimited.getTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_RATE_LIMITED' && error.retryable
      && error.errorClass === 'rate_limit' && error.retryAfterSeconds === 17
  );

  const unavailable = new AssemblyAiPrerecordedClient({
    apiKey: API_KEY,
    fetchImpl: async () => jsonResponse({}, { status: 503 })
  });
  await assert.rejects(
    () => unavailable.getTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_UNAVAILABLE' && error.retryable && error.errorClass === 'transient'
  );

  const waitingFetch = async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  const aborting = new AssemblyAiPrerecordedClient({ apiKey: API_KEY, fetchImpl: waitingFetch });
  const controller = new AbortController();
  const aborted = aborting.getTranscript(TRANSCRIPT_ID, { signal: controller.signal });
  controller.abort();
  await assert.rejects(aborted, (error) => error.code === 'ASSEMBLYAI_ABORTED' && error.retryable);

  const timeout = new AssemblyAiPrerecordedClient({ apiKey: API_KEY, timeoutMs: 1_000, fetchImpl: waitingFetch });
  await assert.rejects(
    () => timeout.getTranscript(TRANSCRIPT_ID),
    (error) => error.code === 'ASSEMBLYAI_TIMEOUT' && error.retryable
  );
});
