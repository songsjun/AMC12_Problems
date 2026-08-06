import {
  ANALYSIS_CONTRACT_VERSION,
  INFERENCE_SAFETY_PROFILE,
  STUDENT_RESPONSE_MODES,
  analysisContractForRequest,
  buildAnswerOnlyAnalysis,
  canonicalInferenceJson,
  computeInferenceContextHash,
  computeInferenceInputHash,
  deriveStudentAnswerStatus,
  inferenceSha256,
  isBoundedInferenceInputText,
  isRestrictedInferenceOutputText
} from './amc-inference-contract.js';

const HASH = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const REVIEWER_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}$/;
const TAG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const REASONING_CLASSIFICATIONS = new Set([
  'CORRECT_AND_WELL_JUSTIFIED', 'CORRECT_WITH_REASONING_GAPS', 'INCORRECT_CONCEPTUAL',
  'INCORRECT_EXECUTION', 'INCORRECT_UNCLASSIFIED'
]);
const ALIGNMENTS = new Set(['ALIGNS', 'PARTIALLY_ALIGNS', 'DIFFERS', 'NOT_COMPARABLE']);
const MAX_INFERENCE_REQUEST_BODY_BYTES = 524_288;

export class InferenceClientError extends Error {
  constructor(code, { retryable = false, errorClass = 'permanent' } = {}) {
    super(code);
    this.name = 'InferenceClientError';
    this.code = code;
    this.retryable = retryable;
    this.errorClass = errorClass;
  }
}

function fixedLoopbackOrigin(origin) {
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
  return parsed.origin;
}

async function boundedJson(response, maximumBytes) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maximumBytes) throw new InferenceClientError('GATEWAY_RESPONSE_TOO_LARGE');
  if (!response.body) throw new InferenceClientError('GATEWAY_PROTOCOL_ERROR');
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
        throw new InferenceClientError('GATEWAY_RESPONSE_TOO_LARGE');
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof InferenceClientError) throw error;
    throw new InferenceClientError('GATEWAY_READ_FAILED', { retryable: true, errorClass: 'transient' });
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))));
  } catch {
    throw new InferenceClientError('GATEWAY_PROTOCOL_ERROR');
  }
}

function exactRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function stringArray(value, min, max, maximumBytes) {
  return Array.isArray(value) && value.length >= min && value.length <= max
    && value.every((item) => isRestrictedInferenceOutputText(item, 1, maximumBytes));
}

function validTagArray(value, min = 0) {
  return Array.isArray(value) && value.length >= min && value.length <= 32
    && new Set(value).size === value.length && value.every((item) => typeof item === 'string' && TAG.test(item));
}

function strictUtcTimestamp(value) {
  const match = typeof value === 'string'
    ? value.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,6})?Z$/)
    : null;
  if (!match) return false;
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59;
}

function validateLocalRequest(request) {
  try {
    if (Buffer.byteLength(JSON.stringify(request), 'utf8') > MAX_INFERENCE_REQUEST_BODY_BYTES) return false;
  } catch {
    return false;
  }
  const contract = analysisContractForRequest(request);
  const v3 = contract?.analysisContractVersion === ANALYSIS_CONTRACT_VERSION;
  const questionKeys = [
    'question_id', 'prompt_markdown', 'choices', 'scoring', 'student_answer',
    'student_answer_status', 'student_reasoning', 'solutions'
  ];
  if (v3) questionKeys.push('student_response_mode');
  if (!contract
      || !exactRecord(request, ['schema', 'task', 'correlation_id', 'input_hash', 'context_hash', 'safety_id', 'question'])
      || request.safety_id !== INFERENCE_SAFETY_PROFILE || !ID.test(request.correlation_id)
      || !HASH.test(request.input_hash) || !HASH.test(request.context_hash)
      || !exactRecord(request.question, questionKeys) || !ID.test(request.question.question_id)
      || !(request.question.student_answer === null || ['A', 'B', 'C', 'D', 'E'].includes(request.question.student_answer))
      || !isBoundedInferenceInputText(request.question.prompt_markdown, 1, 16_384)
      || !Array.isArray(request.question.choices) || request.question.choices.length !== 5
      || !Array.isArray(request.question.solutions) || request.question.solutions.length < 2
      || request.question.solutions.length > 8) return false;
  if (v3) {
    const answerOnly = request.question.student_response_mode === STUDENT_RESPONSE_MODES.ANSWER_ONLY;
    const reasoning = request.question.student_response_mode === STUDENT_RESPONSE_MODES.REASONING;
    if ((!answerOnly && !reasoning)
        || !isBoundedInferenceInputText(request.question.student_reasoning, 0, 12_000)
        || (answerOnly && (request.question.student_answer === null || request.question.student_reasoning !== ''))
        || (reasoning && request.question.student_reasoning.trim() === '')) return false;
  } else if (!isBoundedInferenceInputText(request.question.student_reasoning, 1, 12_000)
      || request.question.student_reasoning.trim() === '') return false;
  const labels = ['A', 'B', 'C', 'D', 'E'];
  const scoring = request.question.scoring;
  if (!exactRecord(scoring, ['is_scored', 'canonical_answer', 'accepted_options'])
      || scoring.is_scored !== true || !labels.includes(scoring.canonical_answer)
      || !Array.isArray(scoring.accepted_options) || scoring.accepted_options.length < 1
      || scoring.accepted_options.length > labels.length
      || !scoring.accepted_options.includes(scoring.canonical_answer)) return false;
  let previous = -1;
  for (const option of scoring.accepted_options) {
    const position = labels.indexOf(option);
    if (position < 0 || position <= previous) return false;
    previous = position;
  }
  if (!['BLANK', 'ACCEPTED', 'NOT_ACCEPTED'].includes(request.question.student_answer_status)
      || request.question.student_answer_status !== deriveStudentAnswerStatus(
        request.question.student_answer, scoring.accepted_options
      )) return false;
  if (request.question.choices.some((choice, index) => !exactRecord(choice, ['label', 'text_markdown'])
      || choice.label !== labels[index] || !isBoundedInferenceInputText(choice.text_markdown, 1, 2_048))) return false;
  const solutionIds = new Set();
  for (const solution of request.question.solutions) {
    if (!exactRecord(solution, [
      'solution_id', 'approval_status', 'title', 'markdown', 'body_sha256', 'source_sha256',
      'reviewer_id', 'reviewed_at', 'rights_status', 'method_tags', 'quality_flags'
    ]) || !ID.test(solution.solution_id) || solutionIds.has(solution.solution_id)
        || solution.approval_status !== 'APPROVED' || !isBoundedInferenceInputText(solution.title, 1, 256)
        || !isBoundedInferenceInputText(solution.markdown, 1, 16_384) || !HASH.test(solution.body_sha256)
        || solution.body_sha256 !== inferenceSha256(solution.markdown) || !HASH.test(solution.source_sha256)
        || typeof solution.reviewer_id !== 'string' || !REVIEWER_ID.test(solution.reviewer_id)
        || !strictUtcTimestamp(solution.reviewed_at)
        || solution.rights_status !== 'approved-for-ai-use' || !validTagArray(solution.method_tags, 1)
        || !validTagArray(solution.quality_flags)) return false;
    solutionIds.add(solution.solution_id);
  }
  try {
    return computeInferenceContextHash(request) === request.context_hash
      && computeInferenceInputHash(request) === request.input_hash;
  } catch {
    return false;
  }
}

function validateAnalysis(value, request, contract) {
  if (!exactRecord(value, [
    'schema', 'correlation_id', 'input_hash', 'context_hash', 'assessability', 'classification',
    'summary', 'strengths', 'gaps', 'suggestions', 'solution_comparisons', 'confidence'
  ])) return false;
  if (value.schema !== contract.responseSchema || value.correlation_id !== request.correlation_id
      || value.input_hash !== request.input_hash || value.context_hash !== request.context_hash
      || !(REASONING_CLASSIFICATIONS.has(value.classification)
        || (contract.analysisContractVersion === ANALYSIS_CONTRACT_VERSION && value.classification === 'ANSWER_ONLY'))
      || !isRestrictedInferenceOutputText(value.summary, 1, 1_200)
      || !stringArray(value.strengths, 0, 5, 600) || !stringArray(value.gaps, 0, 5, 600)
      || !stringArray(value.suggestions, 1, 5, 600) || !Number.isFinite(value.confidence)
      || value.confidence < 0 || value.confidence > 1) return false;
  if (contract.analysisContractVersion === ANALYSIS_CONTRACT_VERSION
      && (request.question.student_response_mode === STUDENT_RESPONSE_MODES.ANSWER_ONLY
      ? value.classification !== 'ANSWER_ONLY'
      : value.classification === 'ANSWER_ONLY')) return false;
  if (request.question.student_answer_status === 'ACCEPTED' && value.classification.startsWith('INCORRECT_')) return false;
  if (request.question.student_answer_status === 'NOT_ACCEPTED' && value.classification.startsWith('CORRECT_')) return false;
  if (!exactRecord(value.assessability, ['status', 'reasons'])
      || !['ASSESSABLE', 'PARTIALLY_ASSESSABLE', 'NOT_ASSESSABLE'].includes(value.assessability.status)
      || !stringArray(value.assessability.reasons, 1, 4, 400)) return false;
  if (!Array.isArray(value.solution_comparisons)) return false;
  if (value.solution_comparisons.length !== request.question.solutions.length) return false;
  const comparedIds = new Set();
  for (const [index, comparison] of value.solution_comparisons.entries()) {
    if (!exactRecord(comparison, ['solution_id', 'alignment', 'observation'])
        || comparison.solution_id !== request.question.solutions[index]?.solution_id || comparedIds.has(comparison.solution_id)
        || !ALIGNMENTS.has(comparison.alignment) || !isRestrictedInferenceOutputText(comparison.observation, 1, 600)) return false;
    comparedIds.add(comparison.solution_id);
  }
  if (contract.analysisContractVersion === ANALYSIS_CONTRACT_VERSION
      && request.question.student_response_mode === STUDENT_RESPONSE_MODES.ANSWER_ONLY) {
    try {
      return canonicalInferenceJson(value) === canonicalInferenceJson(buildAnswerOnlyAnalysis(request));
    } catch {
      return false;
    }
  }
  return true;
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

function validateRunMetadata(value, contract) {
  if (!exactRecord(value, ['provider', 'requestedModel', 'responseModel', 'promptVersion', 'schemaVersion', 'usage'])
      || value.provider !== 'openai'
      || typeof value.requestedModel !== 'string' || typeof value.responseModel !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(value.requestedModel)
      || !/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(value.responseModel)
      || value.promptVersion !== contract.promptVersion
      || value.schemaVersion !== contract.responseSchema) return false;
  if (!value.usage || typeof value.usage !== 'object' || Array.isArray(value.usage)) return false;
  const allowedUsageKeys = ['cachedInputTokens', 'inputTokens', 'outputTokens', 'totalTokens'];
  if (Object.hasOwn(value.usage, 'cacheWriteTokens')) allowedUsageKeys.push('cacheWriteTokens');
  if (Object.hasOwn(value.usage, 'reasoningTokens')) allowedUsageKeys.push('reasoningTokens');
  allowedUsageKeys.sort();
  const usageKeys = Object.keys(value.usage).sort();
  if (usageKeys.length !== allowedUsageKeys.length
      || usageKeys.some((key, index) => key !== allowedUsageKeys[index])) return false;
  const bounded = (item) => Number.isSafeInteger(item) && item >= 0 && item <= 100_000_000;
  if (!['inputTokens', 'cachedInputTokens', 'outputTokens', 'totalTokens'].every(
    (key) => bounded(value.usage[key])
  ) || !['cacheWriteTokens', 'reasoningTokens'].every((key) => value.usage[key] === undefined
    || bounded(value.usage[key]))) return false;
  return value.usage.totalTokens === value.usage.inputTokens + value.usage.outputTokens
    && value.usage.cachedInputTokens <= value.usage.inputTokens
    && (value.usage.cacheWriteTokens === undefined || value.usage.cacheWriteTokens <= value.usage.inputTokens)
    && (value.usage.reasoningTokens === undefined || value.usage.reasoningTokens <= value.usage.outputTokens);
}

function gatewayFailure(payload, status) {
  const expectedKeys = ['ok', 'error', 'retryable', 'errorClass'];
  if (payload && Object.hasOwn(payload, 'retryAfterSeconds')) expectedKeys.push('retryAfterSeconds');
  if (exactRecord(payload, expectedKeys) && payload.ok === false
      && typeof payload.error === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(payload.error)
      && typeof payload.retryable === 'boolean'
      && ['permanent', 'rate_limit', 'transient'].includes(payload.errorClass)
      && (payload.retryAfterSeconds === undefined
        || (Number.isSafeInteger(payload.retryAfterSeconds) && payload.retryAfterSeconds >= 1 && payload.retryAfterSeconds <= 3_600))) {
    return new InferenceClientError(payload.error, {
      retryable: payload.retryable,
      errorClass: payload.errorClass
    });
  }
  return new InferenceClientError(fallbackStatusCode(status));
}

export class AmcInferenceClient {
  #token;

  constructor({
    origin = 'http://127.0.0.1:4110',
    token,
    timeoutMs = 65_000,
    maxResponseBytes = 64 * 1024,
    fetchImpl = globalThis.fetch
  }) {
    if (typeof token !== 'string' || token.length < 32) throw new Error('AMC12_INFERENCE_TOKEN must contain at least 32 characters.');
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 180_000) throw new Error('Invalid inference timeout.');
    this.origin = fixedLoopbackOrigin(origin);
    this.#token = token;
    this.timeoutMs = timeoutMs;
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 2_048 || maxResponseBytes > 1024 * 1024) {
      throw new Error('Invalid inference response bound.');
    }
    this.maxResponseBytes = maxResponseBytes;
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
    this.fetchImpl = fetchImpl;
  }

  async analyze(request, { signal } = {}) {
    const contract = analysisContractForRequest(request);
    if (!contract || !validateLocalRequest(request)) {
      throw new InferenceClientError('INVALID_LOCAL_REQUEST');
    }
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await this.fetchImpl(new URL(contract.path, this.origin).href, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          authorization: `Bearer ${this.#token}`,
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(request),
        signal: combined
      });
    } catch (error) {
      if (signal?.aborted) throw new InferenceClientError('REQUEST_ABORTED', { retryable: true, errorClass: 'transient' });
      if (timeout.aborted) throw new InferenceClientError('GATEWAY_TIMEOUT', { retryable: true, errorClass: 'transient' });
      throw new InferenceClientError('GATEWAY_UNAVAILABLE', { retryable: true, errorClass: 'transient' });
    }
    if (response.status >= 300 && response.status < 400) throw new InferenceClientError('GATEWAY_REDIRECT_REJECTED');
    const payload = await boundedJson(response, this.maxResponseBytes);
    if (!response.ok) throw gatewayFailure(payload, response.status);
    if (!exactRecord(payload, ['ok', 'analysis', 'runMetadata']) || payload.ok !== true
        || !validateAnalysis(payload.analysis, request, contract)
        || !validateRunMetadata(payload.runMetadata, contract)) {
      throw new InferenceClientError('GATEWAY_PROTOCOL_ERROR');
    }
    return { analysis: payload.analysis, runMetadata: payload.runMetadata };
  }
}
