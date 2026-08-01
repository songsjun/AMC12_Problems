import {
  batchSha256,
  buildDecompositionPlan,
  computeBatchGatewayInputHash,
  computeBatchGatewayPlanHash,
  validateDecompositionOutputs
} from '../batch-ingest/domain.js';

const FIXED_PATH = '/v1/decompose-batch';
const MAX_REQUEST_BODY_BYTES = 524_288;

export class BatchDecompositionClientError extends Error {
  constructor(code, { retryable = false, errorClass = 'permanent', retryAfterSeconds } = {}) {
    super(code);
    this.name = 'BatchDecompositionClientError';
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

function fixedLoopbackEndpoint(origin) {
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error('AMC12_INFERENCE_ORIGIN must be a loopback HTTP origin.');
  }
  if (parsed.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(parsed.hostname)
      || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw new Error('AMC12_INFERENCE_ORIGIN must be a loopback HTTP origin.');
  }
  return new URL(FIXED_PATH, parsed).href;
}

async function boundedJson(response, maximumBytes, secretCanary) {
  const contentType = response.headers.get('content-type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    await response.body?.cancel();
    throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
  }
  const declared = response.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maximumBytes)) {
    await response.body?.cancel();
    throw new BatchDecompositionClientError(
      /^\d+$/.test(declared) ? 'GATEWAY_RESPONSE_TOO_LARGE' : 'GATEWAY_PROTOCOL_ERROR'
    );
  }
  if (!response.body) throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
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
        throw new BatchDecompositionClientError('GATEWAY_RESPONSE_TOO_LARGE');
      }
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    if (error instanceof BatchDecompositionClientError) throw error;
    throw new BatchDecompositionClientError('GATEWAY_READ_FAILED', {
      retryable: true, errorClass: 'transient'
    });
  } finally {
    reader.releaseLock();
  }
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
  } catch {
    throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
  }
  if (decoded.includes(secretCanary)) {
    throw new BatchDecompositionClientError('GATEWAY_OUTPUT_REJECTED');
  }
  try {
    return JSON.parse(decoded);
  } catch {
    throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
  }
}

function validateUsage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const expected = ['cachedInputTokens', 'inputTokens', 'outputTokens', 'totalTokens'];
  if (Object.hasOwn(value, 'cacheWriteTokens')) expected.push('cacheWriteTokens');
  if (Object.hasOwn(value, 'reasoningTokens')) expected.push('reasoningTokens');
  if (!exactRecord(value, expected)) return false;
  const bounded = (item) => Number.isSafeInteger(item) && item >= 0 && item <= 100_000_000;
  return ['inputTokens', 'cachedInputTokens', 'outputTokens', 'totalTokens'].every((key) => bounded(value[key]))
    && ['cacheWriteTokens', 'reasoningTokens'].every((key) => value[key] === undefined || bounded(value[key]))
    && value.totalTokens === value.inputTokens + value.outputTokens
    && value.cachedInputTokens <= value.inputTokens
    && (value.cacheWriteTokens === undefined || value.cacheWriteTokens <= value.inputTokens)
    && (value.reasoningTokens === undefined || value.reasoningTokens <= value.outputTokens);
}

function validateRunMetadata(value) {
  return exactRecord(value, ['provider', 'requestedModel', 'responseModel', 'promptVersion', 'schemaVersion', 'usage'])
    && value.provider === 'openai'
    && typeof value.requestedModel === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(value.requestedModel)
    && typeof value.responseModel === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(value.responseModel)
    && value.promptVersion === 'amc-batch-decomposition-prompt-v1'
    && value.schemaVersion === 'amc-batch-decomposition-v1'
    && validateUsage(value.usage);
}

function fallbackStatusCode(status) {
  if (status === 400) return 'GATEWAY_REJECTED_REQUEST';
  if (status === 401) return 'GATEWAY_AUTH_FAILED';
  if (status === 429) return 'GATEWAY_CAPACITY';
  if (status === 502) return 'PROVIDER_FAILED';
  if (status === 503) return 'GATEWAY_UNAVAILABLE';
  if (status === 504) return 'GATEWAY_TIMEOUT';
  return 'GATEWAY_HTTP_ERROR';
}

function gatewayFailure(payload, status) {
  const expected = ['ok', 'error', 'retryable', 'errorClass'];
  if (payload && Object.hasOwn(payload, 'retryAfterSeconds')) expected.push('retryAfterSeconds');
  const retryAfterValid = payload?.retryAfterSeconds === undefined
    || (Number.isSafeInteger(payload.retryAfterSeconds) && payload.retryAfterSeconds >= 1
      && payload.retryAfterSeconds <= 3_600 && payload.retryable === true && payload.errorClass === 'rate_limit');
  const classificationValid = payload?.errorClass === 'permanent'
    ? payload.retryable === false
    : payload?.retryable === true;
  if (exactRecord(payload, expected) && payload.ok === false
      && typeof payload.error === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(payload.error)
      && typeof payload.retryable === 'boolean'
      && ['permanent', 'rate_limit', 'transient'].includes(payload.errorClass)
      && classificationValid && retryAfterValid
      && (payload.errorClass !== 'rate_limit' || status === 429)) {
    return new BatchDecompositionClientError(payload.error, {
      retryable: payload.retryable,
      errorClass: payload.errorClass,
      ...(payload.retryAfterSeconds === undefined ? {} : { retryAfterSeconds: payload.retryAfterSeconds })
    });
  }
  return new BatchDecompositionClientError(fallbackStatusCode(status));
}

function validatedChunkContext(request, plan, evidence) {
  try {
    if (!request || typeof request !== 'object' || !plan || typeof plan !== 'object' || !Array.isArray(evidence)) {
      return null;
    }
    const requestBytes = Buffer.byteLength(JSON.stringify(request), 'utf8');
    if (requestBytes > MAX_REQUEST_BODY_BYTES
        || computeBatchGatewayPlanHash(request) !== request.planHash
        || computeBatchGatewayInputHash(request) !== request.inputHash) return null;
    const rebuilt = buildDecompositionPlan(evidence, {
      correlationId: plan.correlationId,
      questionCatalog: request.questionCatalog
    });
    if (batchSha256(rebuilt) !== batchSha256(plan)) return null;
    const rebuiltChunk = rebuilt.chunks.find((chunk) => chunk.chunkId === request.chunkId);
    if (!rebuiltChunk || batchSha256(rebuiltChunk) !== batchSha256(request)) return null;
    const sourceIds = new Set(rebuiltChunk.sources.map((source) => source.assetId));
    return {
      request: rebuiltChunk,
      validationPlan: {
        ...rebuilt,
        chunks: [rebuiltChunk],
        virtualSources: rebuilt.virtualSources.filter((source) => sourceIds.has(source.assetId))
      }
    };
  } catch {
    return null;
  }
}

export class AmcBatchDecompositionClient {
  #token;

  constructor({
    origin = 'http://127.0.0.1:4110',
    token,
    timeoutMs = 65_000,
    maxResponseBytes = 128 * 1024,
    fetchImpl = globalThis.fetch
  }) {
    if (typeof token !== 'string' || token.length < 32) {
      throw new Error('AMC12_INFERENCE_TOKEN must contain at least 32 characters.');
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 180_000) {
      throw new Error('Invalid inference timeout.');
    }
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 16_384
        || maxResponseBytes > 1024 * 1024) throw new Error('Invalid inference response bound.');
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
    this.endpoint = fixedLoopbackEndpoint(origin);
    this.#token = token;
    this.timeoutMs = timeoutMs;
    this.maxResponseBytes = maxResponseBytes;
    this.fetchImpl = fetchImpl;
  }

  async decomposeChunk(request, { plan, evidence, signal } = {}) {
    const local = validatedChunkContext(request, plan, evidence);
    if (!local) throw new BatchDecompositionClientError('INVALID_LOCAL_REQUEST');
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          authorization: `Bearer ${this.#token}`,
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(local.request),
        signal: combined
      });
    } catch {
      if (signal?.aborted) {
        throw new BatchDecompositionClientError('REQUEST_ABORTED', {
          retryable: true, errorClass: 'transient'
        });
      }
      if (timeout.aborted) {
        throw new BatchDecompositionClientError('GATEWAY_TIMEOUT', {
          retryable: true, errorClass: 'transient'
        });
      }
      throw new BatchDecompositionClientError('GATEWAY_UNAVAILABLE', {
        retryable: true, errorClass: 'transient'
      });
    }
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw new BatchDecompositionClientError('GATEWAY_REDIRECT_REJECTED');
    }
    let payload;
    try {
      payload = await boundedJson(response, this.maxResponseBytes, this.#token);
    } catch (error) {
      if (signal?.aborted) {
        throw new BatchDecompositionClientError('REQUEST_ABORTED', {
          retryable: true, errorClass: 'transient'
        });
      }
      if (timeout.aborted) {
        throw new BatchDecompositionClientError('GATEWAY_TIMEOUT', {
          retryable: true, errorClass: 'transient'
        });
      }
      throw error;
    }
    if (!response.ok) throw gatewayFailure(payload, response.status);
    if (!exactRecord(payload, ['ok', 'decomposition', 'runMetadata']) || payload.ok !== true
        || !validateRunMetadata(payload.runMetadata)) {
      throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
    }
    try {
      validateDecompositionOutputs([payload.decomposition], {
        plan: local.validationPlan,
        evidence
      });
    } catch {
      throw new BatchDecompositionClientError('GATEWAY_PROTOCOL_ERROR');
    }
    return { decomposition: payload.decomposition, runMetadata: payload.runMetadata };
  }
}

export const _test = { MAX_REQUEST_BODY_BYTES, fixedLoopbackEndpoint, validateRunMetadata };
