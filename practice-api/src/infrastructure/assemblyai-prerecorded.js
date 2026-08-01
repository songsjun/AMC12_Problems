const API_ORIGIN = 'https://api.assemblyai.com';
const UPLOAD_ORIGIN = 'https://cdn.assemblyai.com';
const UPLOAD_PATH = '/v2/upload';
const TRANSCRIPT_PATH = '/v2/transcript';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UPLOAD_URL_PATH = /^\/upload\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const DEFAULT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_TRANSCRIPT_BYTES = 256 * 1024;
const SPEECH_MODELS = Object.freeze(['universal-3-pro', 'universal-2']);

export class AssemblyAiClientError extends Error {
  constructor(code, { retryable = false, errorClass = 'permanent', retryAfterSeconds } = {}) {
    super(code);
    this.name = 'AssemblyAiClientError';
    this.code = code;
    this.retryable = retryable;
    this.errorClass = errorClass;
    if (retryAfterSeconds !== undefined) this.retryAfterSeconds = retryAfterSeconds;
  }
}

function exactRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function boundedRetryAfter(value) {
  if (!value || !/^\d{1,5}$/.test(value)) return undefined;
  const seconds = Number(value);
  return seconds >= 1 && seconds <= 3_600 ? seconds : undefined;
}

function httpError(response) {
  const retryAfterSeconds = response.status === 429
    ? boundedRetryAfter(response.headers.get('retry-after'))
    : undefined;
  if (response.status === 429) {
    return new AssemblyAiClientError('ASSEMBLYAI_RATE_LIMITED', {
      retryable: true, errorClass: 'rate_limit', retryAfterSeconds
    });
  }
  if ([408, 409, 425].includes(response.status) || response.status >= 500) {
    return new AssemblyAiClientError('ASSEMBLYAI_UNAVAILABLE', {
      retryable: true, errorClass: 'transient'
    });
  }
  return new AssemblyAiClientError('ASSEMBLYAI_REJECTED', {
    retryable: false, errorClass: 'permanent'
  });
}

async function boundedJson(response, maximumBytes) {
  const contentType = response.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    await response.body?.cancel();
    throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
  }
  const declared = response.headers.get('content-length');
  if (declared && /^\d+$/.test(declared) && Number(declared) > maximumBytes) {
    await response.body?.cancel();
    throw new AssemblyAiClientError('ASSEMBLYAI_RESPONSE_TOO_LARGE');
  }
  if (!response.body) throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new AssemblyAiClientError('ASSEMBLYAI_RESPONSE_TOO_LARGE');
      }
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    if (error instanceof AssemblyAiClientError) throw error;
    throw new AssemblyAiClientError('ASSEMBLYAI_READ_FAILED', {
      retryable: true, errorClass: 'transient'
    });
  } finally {
    reader.releaseLock();
  }
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    return JSON.parse(decoded);
  } catch {
    throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
  }
}

function fixedUploadUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.origin !== UPLOAD_ORIGIN || parsed.username || parsed.password
      || parsed.search || parsed.hash || !UPLOAD_URL_PATH.test(parsed.pathname)) return null;
  return parsed.href;
}

function validConfidence(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1);
}

function validDuration(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 36_000);
}

function validTranscriptText(value) {
  if (typeof value !== 'string' || !value.trim() || Buffer.byteLength(value, 'utf8') > MAX_TRANSCRIPT_BYTES
      || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/u.test(value)) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return false;
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) return false;
  }
  return true;
}

export class AssemblyAiPrerecordedClient {
  #apiKey;

  constructor({
    apiKey,
    timeoutMs = 120_000,
    maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
    fetchImpl = globalThis.fetch
  }) {
    if (typeof apiKey !== 'string' || apiKey.length < 20) throw new Error('AssemblyAI API key is required.');
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 180_000) {
      throw new Error('Invalid AssemblyAI timeout.');
    }
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 16_384 || maxResponseBytes > 16 * 1024 * 1024) {
      throw new Error('Invalid AssemblyAI response bound.');
    }
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
    this.#apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.maxResponseBytes = maxResponseBytes;
    this.fetchImpl = fetchImpl;
  }

  async #request(path, { method, body, headers = {}, signal, allowNotFound = false } = {}) {
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await this.fetchImpl(`${API_ORIGIN}${path}`, {
        method,
        redirect: 'manual',
        headers: { authorization: this.#apiKey, ...headers },
        ...(body === undefined ? {} : { body }),
        ...(body && typeof body !== 'string' && !(body instanceof Uint8Array) ? { duplex: 'half' } : {}),
        signal: combined
      });
    } catch {
      if (signal?.aborted) {
        throw new AssemblyAiClientError('ASSEMBLYAI_ABORTED', {
          retryable: true, errorClass: 'transient'
        });
      }
      if (timeout.aborted) {
        throw new AssemblyAiClientError('ASSEMBLYAI_TIMEOUT', {
          retryable: true, errorClass: 'transient'
        });
      }
      throw new AssemblyAiClientError('ASSEMBLYAI_UNAVAILABLE', {
        retryable: true, errorClass: 'transient'
      });
    }
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw new AssemblyAiClientError('ASSEMBLYAI_REDIRECT_REJECTED');
    }
    if (allowNotFound && response.status === 404) {
      await response.body?.cancel();
      return null;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw httpError(response);
    }
    return boundedJson(response, this.maxResponseBytes);
  }

  async upload({ body, contentLength, signal } = {}) {
    if (!body || !Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > MAX_AUDIO_BYTES) {
      throw new AssemblyAiClientError('INVALID_AUDIO_UPLOAD');
    }
    const payload = await this.#request(UPLOAD_PATH, {
      method: 'POST', body, signal,
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': String(contentLength)
      }
    });
    if (!exactRecord(payload, ['upload_url'])) throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
    const uploadUrl = fixedUploadUrl(payload.upload_url);
    if (!uploadUrl) throw new AssemblyAiClientError('ASSEMBLYAI_UPLOAD_URL_REJECTED');
    return { uploadUrl };
  }

  async submit({ uploadUrl, signal } = {}) {
    const allowedUploadUrl = fixedUploadUrl(uploadUrl);
    if (!allowedUploadUrl) throw new AssemblyAiClientError('ASSEMBLYAI_UPLOAD_URL_REJECTED');
    const payload = await this.#request(TRANSCRIPT_PATH, {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        audio_url: allowedUploadUrl,
        speech_models: [...SPEECH_MODELS],
        language_detection: true
      })
    });
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
        || !UUID.test(payload.id) || !['queued', 'processing', 'completed', 'error'].includes(payload.status)) {
      throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
    }
    return { transcriptId: payload.id, status: payload.status };
  }

  async getTranscript(transcriptId, { signal } = {}) {
    if (typeof transcriptId !== 'string' || !UUID.test(transcriptId)) {
      throw new AssemblyAiClientError('INVALID_TRANSCRIPT_ID');
    }
    const payload = await this.#request(`${TRANSCRIPT_PATH}/${transcriptId}`, { method: 'GET', signal });
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
        || payload.id !== transcriptId || !['queued', 'processing', 'completed', 'error'].includes(payload.status)) {
      throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
    }
    if (payload.status === 'queued' || payload.status === 'processing') return { status: payload.status };
    if (payload.status === 'error') return { status: 'error' };
    if (!validTranscriptText(payload.text)
        || !validConfidence(payload.confidence) || !validDuration(payload.audio_duration)) {
      throw new AssemblyAiClientError('ASSEMBLYAI_TRANSCRIPT_INVALID');
    }
    return {
      status: 'completed',
      text: payload.text,
      confidence: payload.confidence,
      audioDurationSeconds: payload.audio_duration
    };
  }

  async listTranscripts({ createdOn, beforeId, limit = 200, signal } = {}) {
    if (typeof createdOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(createdOn)
        || (beforeId !== undefined && !UUID.test(beforeId))
        || !Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
      throw new AssemblyAiClientError('INVALID_TRANSCRIPT_LIST_QUERY');
    }
    const query = new URLSearchParams({ limit: String(limit), created_on: createdOn });
    if (beforeId) query.set('before_id', beforeId);
    const payload = await this.#request(`${TRANSCRIPT_PATH}?${query}`, { method: 'GET', signal });
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
        || !Array.isArray(payload.transcripts) || payload.transcripts.length > limit
        || !payload.page_details || typeof payload.page_details !== 'object'
        || Array.isArray(payload.page_details)) {
      throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
    }
    const transcripts = payload.transcripts.flatMap((transcript) => {
      if (!transcript || typeof transcript !== 'object' || Array.isArray(transcript)
          || !UUID.test(transcript.id) || typeof transcript.audio_url !== 'string') {
        throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
      }
      // Accounts may contain externally hosted inputs and already-deleted
      // rows. They are irrelevant to our fixed Assembly upload URL hash and
      // must not poison reconciliation or ever be fetched.
      const audioUrl = fixedUploadUrl(transcript.audio_url);
      return audioUrl ? [{ transcriptId: transcript.id, audioUrl }] : [];
    });
    let nextBeforeId = null;
    // AssemblyAI names the older-page link `prev_url`; `next_url` uses
    // after_id and moves toward newer rows, which would reverse reconciliation.
    const nextUrl = payload.page_details.prev_url;
    if (nextUrl !== null && nextUrl !== undefined) {
      let parsed;
      try { parsed = new URL(nextUrl); } catch { throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR'); }
      const keys = [...parsed.searchParams.keys()];
      const candidate = parsed.searchParams.get('before_id');
      if (parsed.origin !== API_ORIGIN || parsed.pathname !== TRANSCRIPT_PATH
          || !candidate || !UUID.test(candidate)
          || keys.length !== 3 || new Set(keys).size !== 3
          || keys.some((key) => !['limit', 'created_on', 'before_id'].includes(key))
          || parsed.searchParams.get('limit') !== String(limit)
          || parsed.searchParams.get('created_on') !== createdOn) {
        throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
      }
      nextBeforeId = candidate;
    }
    return { transcripts, nextBeforeId };
  }

  async deleteTranscript(transcriptId, { signal } = {}) {
    if (typeof transcriptId !== 'string' || !UUID.test(transcriptId)) {
      throw new AssemblyAiClientError('INVALID_TRANSCRIPT_ID');
    }
    const payload = await this.#request(`${TRANSCRIPT_PATH}/${transcriptId}`, {
      method: 'DELETE', signal, allowNotFound: true
    });
    if (payload === null) {
      return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-already-absent' };
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.id !== transcriptId
        || payload.audio_url !== 'http://deleted_by_user' || payload.text !== 'Deleted by user.') {
      throw new AssemblyAiClientError('ASSEMBLYAI_PROTOCOL_ERROR');
    }
    return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
  }
}

export const _test = {
  API_ORIGIN,
  UPLOAD_ORIGIN,
  SPEECH_MODELS,
  MAX_AUDIO_BYTES,
  MAX_TRANSCRIPT_BYTES,
  boundedRetryAfter,
  fixedUploadUrl,
  validTranscriptText
};
