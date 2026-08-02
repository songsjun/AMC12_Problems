import {
  TUTOR_MAX_REQUEST_BODY_BYTES,
  TUTOR_PROMPT_VERSION,
  TUTOR_RESPONSE_SCHEMA,
  buildTutorTurnRequest,
  tutorCanonicalJson
} from './domain.js';
import { validateTutorGatewaySuccess } from './store-contract.js';

const FIXED_PATH = '/v1/tutor-turn';
const ERROR_CODE = /^[A-Z][A-Z0-9_]{0,99}$/;
const MODEL = /^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/;
const MAX_GATEWAY_RESPONSE_BYTES = 256 * 1024;

export const TUTOR_RESULT_CERTAINTY = Object.freeze({
  KNOWN_NO_RESULT: 'KNOWN_NO_RESULT',
  DELIVERY_UNKNOWN: 'DELIVERY_UNKNOWN'
});

export class TutorGatewayClientError extends Error {
  constructor(code, {
    certainty = TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN,
    retryable = false,
    errorClass = 'transient',
    retryAfterMs = 0
  } = {}) {
    super(code);
    this.name = 'TutorGatewayClientError';
    this.code = code;
    this.certainty = certainty;
    this.retryable = retryable;
    this.errorClass = errorClass;
    this.retryAfterMs = retryAfterMs;
  }
}

function clientError(code, options) {
  return new TutorGatewayClientError(code, options);
}

function fixedLoopbackEndpoint(origin) {
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error('AMC12_TUTOR_GATEWAY_ORIGIN must be a loopback HTTP origin.');
  }
  if (parsed.protocol !== 'http:'
      || !['127.0.0.1', '[::1]'].includes(parsed.hostname)
      || parsed.username || parsed.password || parsed.search || parsed.hash
      || !['', '/'].includes(parsed.pathname)) {
    throw new Error('AMC12_TUTOR_GATEWAY_ORIGIN must be a loopback HTTP origin.');
  }
  return new URL(FIXED_PATH, parsed).href;
}

function exactRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

export function validateLocalTutorRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) return false;
  let rebuilt;
  let serialized;
  try {
    rebuilt = buildTutorTurnRequest({
      correlationId: request.correlationId,
      threadId: request.threadId,
      turnId: request.turnId,
      turnNumber: request.turnNumber,
      context: request.context,
      priorTurns: request.priorTurns,
      message: request.message
    });
    serialized = JSON.stringify(request);
  } catch {
    return false;
  }
  return Buffer.byteLength(serialized, 'utf8') <= TUTOR_MAX_REQUEST_BODY_BYTES
    && tutorCanonicalJson(rebuilt) === tutorCanonicalJson(request);
}

async function boundedJson(response, maximumBytes) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maximumBytes) {
    throw clientError('TUTOR_GATEWAY_RESPONSE_TOO_LARGE');
  }
  if (!response.body) throw clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
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
        throw clientError('TUTOR_GATEWAY_RESPONSE_TOO_LARGE');
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof TutorGatewayClientError) throw error;
    throw clientError('TUTOR_GATEWAY_READ_FAILED');
  }
  try {
    const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  } catch {
    throw clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
  }
}

function gatewayFailure(payload) {
  const keys = ['ok', 'error', 'retryable', 'errorClass'];
  if (payload && Object.hasOwn(payload, 'retryAfterSeconds')) keys.push('retryAfterSeconds');
  if (!exactRecord(payload, keys) || payload.ok !== false
      || typeof payload.error !== 'string' || !ERROR_CODE.test(payload.error)
      || typeof payload.retryable !== 'boolean'
      || !['delivery_unknown', 'permanent', 'rate_limit', 'transient'].includes(payload.errorClass)
      || (payload.retryAfterSeconds !== undefined
        && (!Number.isSafeInteger(payload.retryAfterSeconds)
          || payload.retryAfterSeconds < 1 || payload.retryAfterSeconds > 3_600))) {
    return clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
  }
  if (payload.errorClass === 'delivery_unknown') {
    if (payload.error !== 'DELIVERY_UNKNOWN' || payload.retryable
        || payload.retryAfterSeconds !== undefined) {
      return clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
    }
    return clientError(payload.error, {
      certainty: TUTOR_RESULT_CERTAINTY.DELIVERY_UNKNOWN,
      retryable: false,
      errorClass: 'transient'
    });
  }
  const semanticsValid = (payload.errorClass === 'permanent' && !payload.retryable)
    || (payload.errorClass === 'rate_limit' && payload.retryable)
    || (payload.errorClass === 'transient' && payload.retryable);
  if (payload.error === 'DELIVERY_UNKNOWN' || !semanticsValid
      || (payload.retryAfterSeconds !== undefined && payload.errorClass !== 'rate_limit')) {
    return clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
  }
  return clientError(payload.error, {
    certainty: TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT,
    retryable: payload.retryable,
    errorClass: payload.errorClass,
    retryAfterMs: (payload.retryAfterSeconds || 0) * 1_000
  });
}

export class AmcTutorGatewayClient {
  #endpoint;
  #token;
  #requestedModel;
  #timeoutMs;
  #maxResponseBytes;
  #fetchImpl;

  constructor({
    origin = 'http://127.0.0.1:4110', token, requestedModel,
    timeoutMs = 65_000, maxResponseBytes = 32 * 1024,
    fetchImpl = globalThis.fetch
  }) {
    if (typeof token !== 'string' || token.length < 32) {
      throw new Error('AMC12_TUTOR_GATEWAY_TOKEN must contain at least 32 characters.');
    }
    if (typeof requestedModel !== 'string' || !MODEL.test(requestedModel)) {
      throw new Error('AMC12_TUTOR_GATEWAY_MODEL is invalid.');
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 180_000) {
      throw new Error('Invalid Tutor Gateway timeout.');
    }
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 2_048
        || maxResponseBytes > MAX_GATEWAY_RESPONSE_BYTES) {
      throw new Error('Invalid Tutor Gateway response bound.');
    }
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
    this.#endpoint = fixedLoopbackEndpoint(origin);
    this.#token = token;
    this.#requestedModel = requestedModel;
    this.#timeoutMs = timeoutMs;
    this.#maxResponseBytes = maxResponseBytes;
    this.#fetchImpl = fetchImpl;
  }

  get timeoutMs() {
    return this.#timeoutMs;
  }

  dispatchMetadata() {
    return {
      provider: 'openai',
      requestedModel: this.#requestedModel,
      promptVersion: TUTOR_PROMPT_VERSION,
      responseSchemaVersion: TUTOR_RESPONSE_SCHEMA
    };
  }

  async tutorTurn(request, { signal } = {}) {
    if (!validateLocalTutorRequest(request)) {
      throw clientError('INVALID_LOCAL_TUTOR_REQUEST', {
        certainty: TUTOR_RESULT_CERTAINTY.KNOWN_NO_RESULT,
        retryable: false,
        errorClass: 'permanent'
      });
    }
    const body = JSON.stringify(request);
    const timeout = AbortSignal.timeout(this.#timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await this.#fetchImpl(this.#endpoint, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          authorization: `Bearer ${this.#token}`,
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body,
        signal: combined
      });
    } catch {
      if (signal?.aborted) throw clientError('TUTOR_GATEWAY_REQUEST_ABORTED');
      if (timeout.aborted) throw clientError('TUTOR_GATEWAY_TIMEOUT');
      throw clientError('TUTOR_GATEWAY_UNAVAILABLE');
    }
    if (response.status >= 300 && response.status < 400) {
      throw clientError('TUTOR_GATEWAY_REDIRECT_REJECTED');
    }
    const payload = await boundedJson(response, this.#maxResponseBytes);
    if (!response.ok) throw gatewayFailure(payload);
    try {
      validateTutorGatewaySuccess({
        gatewayResult: payload,
        request,
        job: {
          provider: 'openai',
          requestedModel: this.#requestedModel,
          promptVersion: TUTOR_PROMPT_VERSION,
          responseSchemaVersion: TUTOR_RESPONSE_SCHEMA
        },
        latencyMs: 0
      });
    } catch {
      throw clientError('TUTOR_GATEWAY_PROTOCOL_ERROR');
    }
    return structuredClone(payload);
  }
}
