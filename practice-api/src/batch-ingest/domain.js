import { createHash, randomUUID } from 'node:crypto';
import { badRequest, conflict } from '../errors.js';
import { isBoundedInferenceInputText, isRestrictedInferenceOutputText } from '../infrastructure/amc-inference-contract.js';
import { analysisInputHash } from '../learning-review/canonical.js';

export const MAX_BATCH_FILES = 10;
export const MAX_TEXT_FILE_BYTES = 256 * 1024;
export const MAX_AUDIO_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_BATCH_BYTES = 100 * 1024 * 1024;
export const MAX_AUDIO_DURATION_MS = 60 * 60 * 1000;
export const MAX_AUDIO_TRANSCRIPT_BYTES = 2 * 1024 * 1024;
export const MAX_BATCH_NORMALIZED_EVIDENCE_BYTES = 20 * 1024 * 1024;
export const MAX_BATCH_REASONING_BYTES = 8_000;
export const MAX_MAPPING_ITEMS = 100;
export const MAPPING_CONFIDENCE_THRESHOLD = 0.90;
export const MAX_GATEWAY_VIRTUAL_SOURCE_BYTES = 131_072;
export const MAX_GATEWAY_CHUNK_SOURCE_BYTES = 180_000;
export const MAX_GATEWAY_CHUNK_SOURCES = 10;
export const MAX_GATEWAY_SEGMENT_BYTES = 1_024;

export const BATCH_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PROCESSING: 'PROCESSING',
  NEEDS_CONFIRMATION: 'NEEDS_CONFIRMATION',
  COMMITTED: 'COMMITTED',
  FAILED: 'FAILED'
});

export const BATCH_DELETION_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  DELETE_REQUESTED: 'DELETE_REQUESTED',
  LOCAL_PURGED: 'LOCAL_PURGED',
  PROVIDER_DELETE_PENDING: 'PROVIDER_DELETE_PENDING',
  PROVIDER_DELETION_EVIDENCED: 'PROVIDER_DELETION_EVIDENCED',
  COMPLETE: 'COMPLETE'
});

export const ASSET_STATUS = Object.freeze({
  RESERVED: 'RESERVED',
  WRITING: 'WRITING',
  STORED: 'STORED',
  NORMALIZED: 'NORMALIZED',
  PURGE_PENDING: 'PURGE_PENDING',
  PURGED: 'PURGED',
  REJECTED: 'REJECTED'
});

export const BATCH_WORK_TYPE = Object.freeze({
  TRANSCRIBE_AUDIO: 'TRANSCRIBE_AUDIO',
  BATCH_EXTRACTION: 'BATCH_EXTRACTION',
  PURGE_LOCAL_ASSET: 'PURGE_LOCAL_ASSET'
});

export const BATCH_WORK_STATUS = Object.freeze({
  BLOCKED_DEPENDENCY: 'BLOCKED_DEPENDENCY',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
});

const TEXT_TYPES = new Set(['text/plain', 'text/markdown']);
const AUDIO_TYPES = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac']);
const OPTION = new Set(['A', 'B', 'C', 'D', 'E']);
const HASH = /^[a-f0-9]{64}$/;
const ITEM_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMBIGUITY = new Set(['NONE', 'QUESTION_MAPPING', 'ANSWER_CONFLICT', 'TRANSCRIPTION_UNCERTAINTY']);
const CONFLICT_FLAG = new Set([
  'LOW_CONFIDENCE', 'QUESTION_UNASSIGNED', 'QUESTION_CONFLICT', 'ANSWER_CONFLICT',
  'TRANSCRIPTION_UNCERTAINTY', 'REASONING_REQUIRES_EDIT', 'CROSS_CHUNK_CONFLICT',
  'MODEL_DERIVED_REQUIRES_CONFIRMATION'
]);

function exactObject(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest('VALIDATION_ERROR', `${label} must be an object.`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw badRequest('VALIDATION_ERROR', `${label} has an invalid shape.`);
  }
  return value;
}

function hasUnpairedSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true;
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) {
      return true;
    }
  }
  return false;
}

function boundedStudentText(value, maximumBytes, { allowEmpty = true } = {}) {
  return typeof value === 'string' && (allowEmpty || value.length > 0)
    && isBoundedInferenceInputText(value, allowEmpty ? 0 : 1, maximumBytes);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function batchSha256(value) {
  const input = typeof value === 'string' || ArrayBuffer.isView(value) ? value : stableJson(value);
  return createHash('sha256').update(input).digest('hex');
}

function normalizeContentType(value) {
  if (typeof value !== 'string') return '';
  return value.split(';', 1)[0].trim().toLowerCase();
}

function safeDisplayName(value) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 255
    && Buffer.byteLength(value, 'utf8') <= 512 && !/[\u0000-\u001f\u007f]/u.test(value)
    && !hasUnpairedSurrogate(value);
}

export function normalizeBatchFileDescriptors(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_BATCH_FILES) {
    throw badRequest('INVALID_BATCH_FILES', `A batch must reserve 1-${MAX_BATCH_FILES} files.`);
  }
  let totalBytes = 0;
  const files = input.map((file, index) => {
    exactObject(file, ['displayName', 'kind', 'contentType', 'declaredBytes'], `files[${index}]`);
    if (!safeDisplayName(file.displayName)) {
      throw badRequest('INVALID_FILE_NAME', 'Each displayName must be 1-255 safe display characters.');
    }
    if (!['TEXT', 'AUDIO'].includes(file.kind)) {
      throw badRequest('INVALID_FILE_KIND', 'Each file kind must be TEXT or AUDIO.');
    }
    const contentType = normalizeContentType(file.contentType);
    const allowed = file.kind === 'TEXT' ? TEXT_TYPES : AUDIO_TYPES;
    if (!allowed.has(contentType)) {
      throw badRequest('UNSUPPORTED_MEDIA_TYPE', `The declared ${file.kind.toLowerCase()} media type is not supported.`);
    }
    const maximum = file.kind === 'TEXT' ? MAX_TEXT_FILE_BYTES : MAX_AUDIO_FILE_BYTES;
    if (!Number.isSafeInteger(file.declaredBytes) || file.declaredBytes < 1 || file.declaredBytes > maximum) {
      throw badRequest('FILE_SIZE_LIMIT', `${file.kind} files must contain 1-${maximum} bytes.`);
    }
    totalBytes += file.declaredBytes;
    return { displayName: file.displayName, kind: file.kind, contentType, declaredBytes: file.declaredBytes };
  });
  if (totalBytes > MAX_BATCH_BYTES) {
    throw badRequest('BATCH_SIZE_LIMIT', `A batch may reserve at most ${MAX_BATCH_BYTES} bytes.`);
  }
  return { files, totalBytes, hasAudio: files.some((file) => file.kind === 'AUDIO') };
}

export function validateNormalizedEvidenceText(value, { sourceKind = 'TEXT_UPLOAD' } = {}) {
  const maximum = sourceKind === 'TEXT_UPLOAD' ? MAX_TEXT_FILE_BYTES : MAX_AUDIO_TRANSCRIPT_BYTES;
  if (!['TEXT_UPLOAD', 'AUDIO_TRANSCRIPT'].includes(sourceKind)
      || !boundedStudentText(value, maximum, { allowEmpty: false }) || value.trim() === '') {
    throw badRequest(
      'INVALID_NORMALIZED_EVIDENCE',
      `Normalized ${sourceKind.toLowerCase()} evidence must be non-empty safe UTF-8 text no larger than ${maximum} bytes.`
    );
  }
  return value;
}

export function evidenceSetHash(evidence) {
  return batchSha256(evidence
    .map((item) => ({ assetId: item.assetId, position: item.position, normalizedSha256: item.normalizedSha256 }))
    .sort((left, right) => left.position - right.position || left.assetId.localeCompare(right.assetId)));
}

function normalizeOption(value, label) {
  if (value !== null && !OPTION.has(value)) {
    throw badRequest('INVALID_BATCH_MAPPING', `${label} must be null or A-E.`);
  }
  return value;
}

function lastUtf8Boundary(bytes, start, proposedEnd) {
  let end = proposedEnd;
  while (end > start && end < bytes.length && (bytes[end] & 0xC0) === 0x80) end -= 1;
  return end > start ? end : proposedEnd;
}

function boundedExcerpt(value, maximumBytes, label) {
  if (typeof value !== 'string' || !isBoundedInferenceInputText(value, 1, Buffer.byteLength(value, 'utf8'))) {
    throw badRequest('INVALID_QUESTION_CATALOG', `${label} contains invalid inference input text.`);
  }
  const bytes = Buffer.from(value, 'utf8');
  if (bytes.length <= maximumBytes) return value;
  const end = lastUtf8Boundary(bytes, 0, maximumBytes);
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, end));
}

export function buildBatchQuestionCatalog(form) {
  if (!form || typeof form !== 'object' || typeof form.id !== 'string' || typeof form.version !== 'string'
      || !Array.isArray(form.questions) || form.questions.length !== 25) {
    throw badRequest('INVALID_QUESTION_CATALOG', 'Batch decomposition requires the exact 25-question pinned form.');
  }
  return form.questions.map((question, index) => {
    if (question.number !== index + 1 || !Array.isArray(question.choices) || question.choices.length !== 5) {
      throw badRequest('INVALID_QUESTION_CATALOG', 'The pinned question catalog must contain ordered questions 1-25.');
    }
    const choiceExcerpts = ['A', 'B', 'C', 'D', 'E'].map((label, choiceIndex) => {
      const choice = exactObject(
        question.choices[choiceIndex], ['option', 'textMarkdown'], `Question ${question.number} choice ${label}`
      );
      if (choice.option !== label) {
        throw badRequest('INVALID_QUESTION_CATALOG', 'Question choices must be the canonical ordered A-E array.');
      }
      return { label, text: boundedExcerpt(choice.textMarkdown, 256, `Question ${question.number} choice ${label}`) };
    });
    return {
      questionNumber: question.number,
      questionId: `q-${batchSha256({ formId: form.id, version: form.version, questionNumber: question.number }).slice(0, 32)}`,
      promptExcerpt: boundedExcerpt(question.promptMarkdown, 512, `Question ${question.number} prompt`),
      choiceExcerpts
    };
  });
}

export function segmentBatchGatewaySources(sources) {
  const segments = [];
  for (const [sourceIndex, source] of sources.entries()) {
    const bytes = Buffer.from(source.content, 'utf8');
    let startByte = 0;
    let sequence = 1;
    while (startByte < bytes.length) {
      const proposedEnd = Math.min(bytes.length, startByte + MAX_GATEWAY_SEGMENT_BYTES);
      let endByte = proposedEnd;
      if (proposedEnd !== bytes.length) {
        endByte = lastUtf8Boundary(bytes, startByte, proposedEnd);
        const preferredMinimum = startByte + Math.floor(MAX_GATEWAY_SEGMENT_BYTES / 2);
        for (let cursor = endByte - 1; cursor >= preferredMinimum; cursor -= 1) {
          if (bytes[cursor] === 0x0A || bytes[cursor] === 0x20 || bytes[cursor] === 0x09) {
            endByte = cursor + 1;
            break;
          }
        }
      }
      const selected = bytes.subarray(startByte, endByte);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(selected);
      const sha256 = batchSha256(text);
      segments.push({
        segmentId: `seg-${String(sourceIndex + 1).padStart(2, '0')}-${String(sequence).padStart(3, '0')}-${sha256.slice(0, 16)}`,
        assetId: source.assetId, startByte, endByte, sha256, text,
        sourceKind: source.kind, sourceConfidence: source.sourceConfidence
      });
      startByte = endByte;
      sequence += 1;
    }
  }
  return segments;
}

export function computeBatchGatewayPlanHash({ chunkId, sources }) {
  const segments = segmentBatchGatewaySources(sources).map(({ segmentId, assetId, startByte, endByte, sha256 }) => ({
    segmentId, assetId, startByte, endByte, sha256
  }));
  return batchSha256({ schema: 'amc-batch-segment-plan-v1', chunkId, segments });
}

export function computeBatchGatewayInputHash(request) {
  return batchSha256({
    schema: 'amc-batch-decomposition-input-hash-v1', safetyId: request.safetyId,
    chunkId: request.chunkId, planHash: request.planHash,
    questionCatalog: request.questionCatalog, sources: request.sources
  });
}

function validGatewayUsage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const expected = ['cachedInputTokens', 'inputTokens', 'outputTokens', 'totalTokens'];
  if (Object.hasOwn(value, 'cacheWriteTokens')) expected.push('cacheWriteTokens');
  if (Object.hasOwn(value, 'reasoningTokens')) expected.push('reasoningTokens');
  try {
    exactObject(value, expected, 'Gateway usage');
  } catch {
    return false;
  }
  const bounded = (item) => Number.isSafeInteger(item) && item >= 0 && item <= 100_000_000;
  return ['inputTokens', 'cachedInputTokens', 'outputTokens', 'totalTokens'].every((key) => bounded(value[key]))
    && ['cacheWriteTokens', 'reasoningTokens'].every((key) => value[key] === undefined || bounded(value[key]))
    && value.totalTokens === value.inputTokens + value.outputTokens
    && value.cachedInputTokens <= value.inputTokens
    && (value.cacheWriteTokens === undefined || value.cacheWriteTokens <= value.inputTokens)
    && (value.reasoningTokens === undefined || value.reasoningTokens <= value.outputTokens);
}

export function normalizeBatchGatewayRunMetadata(input, chunks) {
  if (!Array.isArray(input) || !Array.isArray(chunks) || input.length !== chunks.length) {
    throw badRequest('INVALID_GATEWAY_RUN_METADATA', 'Each planned chunk requires exact Gateway run metadata.');
  }
  return input.map((value, index) => {
    try {
      exactObject(value, [
        'chunkId', 'inputHash', 'provider', 'requestedModel', 'responseModel',
        'promptVersion', 'schemaVersion', 'usage'
      ], `runMetadata[${index}]`);
    } catch {
      throw badRequest('INVALID_GATEWAY_RUN_METADATA', 'Gateway run metadata has an invalid shape.');
    }
    const chunk = chunks[index];
    if (value.chunkId !== chunk.chunkId || value.inputHash !== chunk.inputHash
        || value.provider !== 'openai'
        || typeof value.requestedModel !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(value.requestedModel)
        || typeof value.responseModel !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(value.responseModel)
        || value.promptVersion !== 'amc-batch-decomposition-prompt-v1'
        || value.schemaVersion !== 'amc-batch-decomposition-v1'
        || !validGatewayUsage(value.usage)) {
      throw badRequest('INVALID_GATEWAY_RUN_METADATA', 'Gateway run metadata is invalid or lost its chunk lineage.');
    }
    return structuredClone(value);
  });
}

export function buildDecompositionPlan(evidence, { correlationId, questionCatalog }) {
  if (!CORRELATION_ID.test(correlationId) || !Array.isArray(questionCatalog) || questionCatalog.length !== 25
      || !Array.isArray(evidence) || evidence.length < 1 || evidence.length > MAX_BATCH_FILES) {
    throw badRequest('INVALID_DECOMPOSITION_PLAN', 'A decomposition plan needs a correlation ID, pinned catalog, and 1-10 evidence assets.');
  }
  const seenAssets = new Set();
  let totalBytes = 0;
  const virtualSources = [];
  const positions = new Set();
  for (const source of [...evidence].sort((left, right) => left.position - right.position || left.assetId.localeCompare(right.assetId))) {
    if (!UUID.test(source.assetId) || seenAssets.has(source.assetId)
        || !Number.isSafeInteger(source.position) || source.position < 1 || source.position > MAX_BATCH_FILES
        || positions.has(source.position) || !['TEXT_UPLOAD', 'AUDIO_TRANSCRIPT'].includes(source.sourceKind)) {
      throw badRequest('INVALID_DECOMPOSITION_PLAN', 'Evidence assets must have unique IDs and known source kinds.');
    }
    seenAssets.add(source.assetId);
    positions.add(source.position);
    validateNormalizedEvidenceText(source.normalizedText, { sourceKind: source.sourceKind });
    if ((source.sourceKind === 'TEXT_UPLOAD' && source.transcriptConfidence !== null)
        || (source.sourceKind === 'AUDIO_TRANSCRIPT' && source.transcriptConfidence !== null
          && (!Number.isFinite(source.transcriptConfidence)
            || source.transcriptConfidence < 0 || source.transcriptConfidence > 1))) {
      throw badRequest('INVALID_DECOMPOSITION_PLAN', 'Transcript confidence is null for text and null or 0-1 for audio evidence.');
    }
    if (source.normalizedSha256 !== batchSha256(source.normalizedText)) {
      throw badRequest('INVALID_DECOMPOSITION_PLAN', 'Normalized evidence hashes must match their text.');
    }
    const bytes = Buffer.from(source.normalizedText, 'utf8');
    totalBytes += bytes.length;
    let baseByte = 0;
    let slicePosition = 1;
    while (baseByte < bytes.length) {
      const proposed = Math.min(baseByte + MAX_GATEWAY_VIRTUAL_SOURCE_BYTES, bytes.length);
      const endByte = lastUtf8Boundary(bytes, baseByte, proposed);
      virtualSources.push({
        assetId: `${source.assetId}.s${String(slicePosition).padStart(3, '0')}`,
        kind: source.sourceKind === 'TEXT_UPLOAD' ? 'text' : 'transcript',
        sourceConfidence: source.transcriptConfidence ?? null,
        content: new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(baseByte, endByte)),
        originalAssetId: source.assetId, originalPosition: source.position, baseByte
      });
      baseByte = endByte;
      slicePosition += 1;
    }
  }
  if (totalBytes > MAX_BATCH_NORMALIZED_EVIDENCE_BYTES) {
    throw badRequest('NORMALIZED_BATCH_SIZE_LIMIT', `Normalized batch evidence exceeds ${MAX_BATCH_NORMALIZED_EVIDENCE_BYTES} bytes.`);
  }
  const sourceGroups = [];
  let pending = [];
  let pendingBytes = 0;
  const flush = () => {
    if (!pending.length) return;
    sourceGroups.push(pending);
    pending = [];
    pendingBytes = 0;
  };
  for (const source of virtualSources) {
    const sourceBytes = Buffer.byteLength(source.content, 'utf8');
    if (pending.length >= MAX_GATEWAY_CHUNK_SOURCES || pendingBytes + sourceBytes > MAX_GATEWAY_CHUNK_SOURCE_BYTES) flush();
    pending.push(source);
    pendingBytes += sourceBytes;
  }
  flush();
  const chunks = sourceGroups.map((group, index) => {
    const chunkId = `chunk-${String(index + 1).padStart(4, '0')}`;
    const sources = group.map(({ assetId, kind, sourceConfidence, content }) => ({ assetId, kind, sourceConfidence, content }));
    const request = {
      schema: 'amc-batch-decomposition-request-v1', task: 'batch_decomposition_v1',
      correlationId, inputHash: '0'.repeat(64),
      planHash: computeBatchGatewayPlanHash({ chunkId, sources }), chunkId,
      safetyId: 'amc-math-safe-v1', questionCatalog, sources
    };
    request.inputHash = computeBatchGatewayInputHash(request);
    return request;
  });
  const planEvidenceHash = evidenceSetHash(evidence);
  const masterPlanHash = batchSha256({
    schema: 'amc-batch-master-plan-v1', evidenceSetHash: planEvidenceHash,
    chunks: chunks.map(({ chunkId, inputHash }) => ({ chunkId, inputHash }))
  });
  return {
    schema: 'amc-batch-master-plan-v1', correlationId, evidenceSetHash: planEvidenceHash,
    masterPlanHash, totalBytes, virtualSources, chunks
  };
}

function verifyGatewaySpan(span, expectedSegments, label) {
  exactObject(span, ['segmentId', 'assetId', 'startByte', 'endByte', 'sha256'], label);
  const expected = expectedSegments.get(span.segmentId);
  if (!expected || !['segmentId', 'assetId', 'startByte', 'endByte', 'sha256']
    .every((key) => span[key] === expected[key])) {
    throw badRequest('INVALID_EVIDENCE_SPAN', `${label} does not exactly match the frozen Gateway segment plan.`);
  }
  return expected;
}

function globalSpan(expected, virtualSource, evidenceById, chunkId) {
  if (!virtualSource) throw badRequest('INVALID_EVIDENCE_SPAN', 'A Gateway span lost its planned virtual source binding.');
  const evidence = evidenceById.get(virtualSource.originalAssetId);
  if (!evidence) throw badRequest('INVALID_EVIDENCE_SPAN', 'A virtual source lost its durable evidence binding.');
  const startByte = virtualSource.baseByte + expected.startByte;
  const endByte = virtualSource.baseByte + expected.endByte;
  const bytes = Buffer.from(evidence.normalizedText, 'utf8').subarray(startByte, endByte);
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (batchSha256(text) !== expected.sha256) {
    throw badRequest('INVALID_EVIDENCE_SPAN', 'A Gateway span no longer matches durable normalized evidence.');
  }
  return {
    chunkId, segmentId: expected.segmentId, virtualAssetId: expected.assetId,
    assetId: virtualSource.originalAssetId, assetPosition: virtualSource.originalPosition,
    startByte, endByte, sha256: expected.sha256, text,
    sourceKind: expected.sourceKind, sourceConfidence: expected.sourceConfidence
  };
}

export function validateDecompositionOutputs(outputs, { plan, evidence }) {
  if (!plan || typeof plan !== 'object' || !CORRELATION_ID.test(plan.correlationId)
      || !HASH.test(plan.evidenceSetHash) || !HASH.test(plan.masterPlanHash)
      || !Array.isArray(plan.chunks) || plan.chunks.length < 1
      || !Array.isArray(plan.virtualSources) || !Array.isArray(evidence)) {
    throw badRequest('INVALID_DECOMPOSITION_PLAN', 'The trusted decomposition plan is malformed.');
  }
  for (const chunk of plan.chunks) {
    if (!chunk || typeof chunk !== 'object' || !CORRELATION_ID.test(chunk.chunkId)
        || !HASH.test(chunk.planHash) || !HASH.test(chunk.inputHash)
        || !Array.isArray(chunk.questionCatalog) || chunk.questionCatalog.length !== 25
        || !Array.isArray(chunk.sources) || chunk.sources.length < 1) {
      throw badRequest('INVALID_DECOMPOSITION_PLAN', 'The trusted decomposition plan contains a malformed chunk.');
    }
  }
  if (!Array.isArray(outputs) || outputs.length !== plan.chunks.length) {
    throw badRequest('INVALID_DECOMPOSITION_RESULT', 'Every decomposition chunk must return exactly one result.');
  }
  const chunkById = new Map(plan.chunks.map((chunk) => [chunk.chunkId, chunk]));
  const virtualById = new Map(plan.virtualSources.map((source) => [source.assetId, source]));
  const evidenceById = new Map(evidence.map((source) => [source.assetId, source]));
  const allowedQuestions = new Set(plan.chunks[0].questionCatalog.map((question) => question.questionNumber));
  const seenChunks = new Set();
  const seenGlobalSegments = new Set();
  const seenItemKeys = new Set();
  const items = [];
  for (const [outputIndex, output] of outputs.entries()) {
    exactObject(output, ['schema', 'correlationId', 'inputHash', 'planHash', 'chunkId', 'items', 'unmappedSpans'],
      `outputs[${outputIndex}]`);
    const expectedChunk = chunkById.get(output.chunkId);
    if (!expectedChunk || seenChunks.has(output.chunkId) || output.schema !== 'amc-batch-decomposition-v1'
        || output.correlationId !== plan.correlationId || output.planHash !== expectedChunk.planHash
        || output.inputHash !== expectedChunk.inputHash || !Array.isArray(output.items) || !Array.isArray(output.unmappedSpans)) {
      throw badRequest('INVALID_DECOMPOSITION_RESULT', 'A decomposition result has invalid chunk or lineage metadata.');
    }
    seenChunks.add(output.chunkId);
    const expectedSegmentsInOrder = segmentBatchGatewaySources(expectedChunk.sources);
    const expectedSegments = new Map(expectedSegmentsInOrder.map((segment) => [segment.segmentId, segment]));
    const segmentOrder = new Map(expectedSegmentsInOrder.map((segment, index) => [segment.segmentId, index]));
    const seenLocalSegments = new Set();
    for (const [itemIndex, item] of output.items.entries()) {
      exactObject(item, [
        'itemKey', 'candidateQuestionNumbers', 'proposedQuestionNumber', 'answer', 'reasoningSummary',
        'confidence', 'ambiguity', 'spans', 'conflictFlags', 'requiresConfirmation'
      ], `outputs[${outputIndex}].items[${itemIndex}]`);
      if (!ITEM_KEY.test(item.itemKey) || seenItemKeys.has(item.itemKey)) {
        throw badRequest('INVALID_DECOMPOSITION_RESULT', 'Decomposition item keys must be globally unique bounded IDs.');
      }
      seenItemKeys.add(item.itemKey);
      if (!Array.isArray(item.candidateQuestionNumbers) || item.candidateQuestionNumbers.length < 1
          || item.candidateQuestionNumbers.length > 5
          || item.candidateQuestionNumbers.some((number, index) => !Number.isSafeInteger(number)
            || !allowedQuestions.has(number) || (index > 0 && number <= item.candidateQuestionNumbers[index - 1]))
          || !(item.proposedQuestionNumber === null || (Number.isSafeInteger(item.proposedQuestionNumber)
            && item.candidateQuestionNumbers.includes(item.proposedQuestionNumber)))) {
        throw badRequest('INVALID_DECOMPOSITION_RESULT', 'Question candidates are invalid for the pinned form.');
      }
      normalizeOption(item.answer, 'answer');
      if (!(item.reasoningSummary === null || isRestrictedInferenceOutputText(item.reasoningSummary, 1, 300))
          || (item.answer === null && item.reasoningSummary === null)
          || !Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1
          || !AMBIGUITY.has(item.ambiguity) || !Array.isArray(item.spans) || item.spans.length < 1
          || item.spans.length > 8 || !Array.isArray(item.conflictFlags)
          || new Set(item.conflictFlags).size !== item.conflictFlags.length
          || item.conflictFlags.some((flag) => !CONFLICT_FLAG.has(flag)) || typeof item.requiresConfirmation !== 'boolean') {
        throw badRequest('INVALID_DECOMPOSITION_RESULT', 'A decomposition item has invalid answer, summary, confidence, or flags.');
      }
      const localSegments = item.spans.map((span, spanIndex) => verifyGatewaySpan(
        span, expectedSegments, `outputs[${outputIndex}].items[${itemIndex}].spans[${spanIndex}]`
      ));
      for (const segment of localSegments) {
        const key = `${output.chunkId}\u0000${segment.segmentId}`;
        if (seenLocalSegments.has(segment.segmentId) || seenGlobalSegments.has(key)) {
          throw badRequest('INVALID_EVIDENCE_COVERAGE', 'A Gateway segment may occur exactly once in its chunk.');
        }
        seenLocalSegments.add(segment.segmentId);
        seenGlobalSegments.add(key);
      }
      const spans = localSegments
        .sort((left, right) => segmentOrder.get(left.segmentId) - segmentOrder.get(right.segmentId))
        .map((segment) => globalSpan(segment, virtualById.get(segment.assetId), evidenceById, output.chunkId));
      const evidenceText = [...spans]
        .sort((left, right) => left.assetPosition - right.assetPosition || left.startByte - right.startByte)
        .map((span) => span.text).join('');
      items.push({
        itemKey: item.itemKey, chunkId: output.chunkId,
        candidateQuestionNumbers: [...item.candidateQuestionNumbers], proposedQuestionNumber: item.proposedQuestionNumber,
        selectedOption: item.answer, evidenceText, reasoningSummary: item.reasoningSummary,
        confidence: item.confidence, ambiguity: item.ambiguity, spans,
        gatewayConflictFlags: [...item.conflictFlags], gatewayRequiresConfirmation: item.requiresConfirmation
      });
      if (items.length > MAX_MAPPING_ITEMS) {
        throw badRequest(
          'DECOMPOSITION_TOO_FRAGMENTED',
          `Decomposition produced more than ${MAX_MAPPING_ITEMS} evidence items; split the batch and retry.`
        );
      }
    }
    for (const [spanIndex, spanValue] of output.unmappedSpans.entries()) {
      const segment = verifyGatewaySpan(spanValue, expectedSegments, `outputs[${outputIndex}].unmappedSpans[${spanIndex}]`);
      const key = `${output.chunkId}\u0000${segment.segmentId}`;
      if (seenLocalSegments.has(segment.segmentId) || seenGlobalSegments.has(key)) {
        throw badRequest('INVALID_EVIDENCE_COVERAGE', 'An unmapped segment may occur exactly once in its chunk.');
      }
      seenLocalSegments.add(segment.segmentId);
      seenGlobalSegments.add(key);
      const span = globalSpan(segment, virtualById.get(segment.assetId), evidenceById, output.chunkId);
      items.push({
        itemKey: `unmapped-${batchSha256(key).slice(0, 32)}`, chunkId: output.chunkId,
        candidateQuestionNumbers: [], proposedQuestionNumber: null, selectedOption: null,
        evidenceText: span.text, reasoningSummary: null, confidence: 0, ambiguity: 'QUESTION_MAPPING', spans: [span],
        gatewayConflictFlags: ['QUESTION_UNASSIGNED'], gatewayRequiresConfirmation: true, unmapped: true
      });
      if (items.length > MAX_MAPPING_ITEMS) {
        throw badRequest(
          'DECOMPOSITION_TOO_FRAGMENTED',
          `Decomposition produced more than ${MAX_MAPPING_ITEMS} evidence items; split the batch and retry.`
        );
      }
    }
    if (seenLocalSegments.size !== expectedSegments.size) {
      throw badRequest('INVALID_EVIDENCE_COVERAGE', 'A chunk result must account for every Gateway segment exactly once.');
    }
  }
  if (seenChunks.size !== chunkById.size) {
    throw badRequest('INVALID_DECOMPOSITION_RESULT', 'Every planned chunk must be returned exactly once.');
  }
  items.sort((left, right) => {
    const leftSpan = left.spans[0];
    const rightSpan = right.spans[0];
    return leftSpan.assetPosition - rightSpan.assetPosition || leftSpan.startByte - rightSpan.startByte
      || left.chunkId.localeCompare(right.chunkId) || left.itemKey.localeCompare(right.itemKey);
  });
  const proposed = new Map();
  for (const item of items) {
    if (item.proposedQuestionNumber !== null) {
      const current = proposed.get(item.proposedQuestionNumber) || [];
      current.push(item);
      proposed.set(item.proposedQuestionNumber, current);
    }
  }
  for (const item of items) {
    const reasons = new Set(item.gatewayConflictFlags.map((flag) =>
      flag === 'MODEL_DERIVED_REQUIRES_CONFIRMATION' ? flag : `GATEWAY_${flag}`));
    // Spans prove which durable student bytes were supplied to the model, but
    // they cannot prove that a model-derived answer or question mapping is
    // entailed by those bytes. A student must confirm every extracted item.
    reasons.add('MODEL_DERIVED_REQUIRES_CONFIRMATION');
    if (item.candidateQuestionNumbers.length !== 1 || item.proposedQuestionNumber === null
        || item.candidateQuestionNumbers[0] !== item.proposedQuestionNumber) reasons.add('QUESTION_UNASSIGNED_OR_AMBIGUOUS');
    if (item.confidence < MAPPING_CONFIDENCE_THRESHOLD) reasons.add('LOW_CONFIDENCE');
    if (item.ambiguity !== 'NONE') reasons.add(item.ambiguity);
    if (item.gatewayRequiresConfirmation) reasons.add('GATEWAY_REQUIRES_CONFIRMATION');
    if (Buffer.byteLength(item.evidenceText, 'utf8') > MAX_BATCH_REASONING_BYTES) reasons.add('REASONING_REQUIRES_EDIT');
    const sameQuestion = item.proposedQuestionNumber === null ? [] : proposed.get(item.proposedQuestionNumber);
    if (sameQuestion?.length > 1) {
      reasons.add('QUESTION_CONFLICT');
      if (new Set(sameQuestion.map((candidate) => candidate.chunkId)).size > 1) reasons.add('CROSS_CHUNK_CONFLICT');
    }
    const transcriptUncertain = item.spans.some((span) => span.sourceKind === 'transcript'
      && (span.sourceConfidence === null || span.sourceConfidence < MAPPING_CONFIDENCE_THRESHOLD));
    if (transcriptUncertain) reasons.add('TRANSCRIPTION_UNCERTAINTY');
    item.confirmationReasons = [...reasons].sort();
    item.requiresConfirmation = reasons.size > 0;
  }
  const extractionHash = batchSha256({
    schema: 'amc-batch-validated-extraction-v1', masterPlanHash: plan.masterPlanHash,
    items: items.map((item) => ({
      itemKey: item.itemKey, chunkId: item.chunkId,
      candidateQuestionNumbers: item.candidateQuestionNumbers,
      proposedQuestionNumber: item.proposedQuestionNumber,
      selectedOption: item.selectedOption, evidenceText: item.evidenceText,
      reasoningSummary: item.reasoningSummary, confidence: item.confidence, ambiguity: item.ambiguity,
      spans: item.spans.map(({ chunkId, segmentId, virtualAssetId, assetId, assetPosition,
        startByte, endByte, sha256, sourceKind, sourceConfidence }) => ({
        chunkId, segmentId, virtualAssetId, assetId, assetPosition, startByte, endByte, sha256,
        sourceKind, sourceConfidence
      })),
      gatewayConflictFlags: item.gatewayConflictFlags,
      gatewayRequiresConfirmation: item.gatewayRequiresConfirmation,
      confirmationReasons: item.confirmationReasons,
      requiresConfirmation: item.requiresConfirmation,
      unmapped: item.unmapped === true
    }))
  });
  return {
    schema: 'amc-batch-decomposition-v1', evidenceSetHash: plan.evidenceSetHash,
    extractionHash, ready: items.every((item) => !item.requiresConfirmation), items
  };
}

export function normalizeMappingConfirmation(input, { mappingRevision, mappingItems, formQuestionNumbers }) {
  exactObject(input, ['mappingRevision', 'responses', 'discardedItemIds'], 'Confirmation');
  if (input.mappingRevision !== mappingRevision) {
    throw conflict('MAPPING_REVISION_CONFLICT', 'The mapping changed. Review the latest mapping before confirming.');
  }
  if (!Array.isArray(input.responses) || input.responses.length < 1 || input.responses.length > 100
      || !Array.isArray(input.discardedItemIds)) {
    throw badRequest('INVALID_MAPPING_CONFIRMATION', 'Confirmation must include 1-100 responses and discardedItemIds.');
  }
  const itemIds = new Set(mappingItems.map((item) => item.id));
  const seenItems = new Set();
  const seenQuestions = new Set();
  const allowedQuestions = new Set(formQuestionNumbers);
  const itemById = new Map(mappingItems.map((item) => [item.id, item]));
  const responses = input.responses.map((response, index) => {
    exactObject(response, ['questionNumber', 'selectedOption', 'reasoningText', 'sourceItemIds'], `responses[${index}]`);
    if (!Number.isSafeInteger(response.questionNumber) || !allowedQuestions.has(response.questionNumber)
        || seenQuestions.has(response.questionNumber)) {
      throw badRequest('INVALID_MAPPING_CONFIRMATION', 'Confirmed responses must name unique questions in the pinned form.');
    }
    seenQuestions.add(response.questionNumber);
    normalizeOption(response.selectedOption, 'selectedOption');
    if (!boundedStudentText(response.reasoningText, MAX_BATCH_REASONING_BYTES)
        || !Array.isArray(response.sourceItemIds) || response.sourceItemIds.length < 1
        || new Set(response.sourceItemIds).size !== response.sourceItemIds.length) {
      throw badRequest('INVALID_MAPPING_CONFIRMATION', 'Each confirmed response needs bounded reasoning and unique source item IDs.');
    }
    for (const id of response.sourceItemIds) {
      if (!UUID.test(id) || !itemIds.has(id) || seenItems.has(id)) {
        throw badRequest('INVALID_MAPPING_CONFIRMATION', 'Every source item must be assigned exactly once or discarded.');
      }
      seenItems.add(id);
    }
    const sourceItems = response.sourceItemIds.map((id) => itemById.get(id))
      .sort((left, right) => left.itemPosition - right.itemPosition);
    const canonicalSources = sourceItems.map((item) => {
      if (!Number.isSafeInteger(item?.itemPosition) || item.itemPosition < 1
          || typeof item.evidenceText !== 'string' || item.evidenceText.length === 0
          || !Array.isArray(item.sourceSpans) || item.sourceSpans.length < 1) {
        throw conflict('BATCH_EVIDENCE_UNAVAILABLE', 'Confirmed source evidence is no longer available.');
      }
      const spans = item.sourceSpans.map((span) => ({
        assetId: span.assetId,
        assetPosition: span.assetPosition,
        segmentId: span.segmentId,
        startByte: span.startByte,
        endByte: span.endByte,
        sha256: span.sha256,
        sourceKind: span.sourceKind,
        sourceConfidence: span.sourceConfidence
      })).sort((left, right) => left.assetPosition - right.assetPosition
        || left.startByte - right.startByte || left.endByte - right.endByte
        || left.segmentId.localeCompare(right.segmentId));
      return {
        itemId: item.id,
        itemPosition: item.itemPosition,
        evidenceText: item.evidenceText,
        evidenceTextSha256: batchSha256(item.evidenceText),
        spans
      };
    });
    const sourceItemIds = canonicalSources.map((item) => item.itemId);
    const sourceEvidenceText = canonicalSources.map((item) => item.evidenceText).join('\n');
    const sourceDescriptors = canonicalSources.map(({ evidenceText, ...descriptor }) => descriptor);
    const sourceSpanHash = batchSha256({
      schema: 'amc-batch-confirmed-span-set-v1', sourceDescriptors
    });
    return {
      questionNumber: response.questionNumber,
      selectedOption: response.selectedOption,
      reasoningText: response.reasoningText,
      reasoningOrigin: response.reasoningText === sourceEvidenceText
        ? 'BATCH_CONFIRMED_EVIDENCE' : 'BATCH_CONFIRMATION_EDIT',
      confirmedReasoningHash: batchSha256(response.reasoningText),
      sourceItemIds,
      sourceDescriptors,
      sourceEvidenceText,
      sourceSpanHash,
      sourceEvidenceHash: batchSha256({
        schema: 'amc-batch-confirmed-source-v1', sourceSpanHash, sourceEvidenceText
      })
    };
  }).sort((left, right) => left.questionNumber - right.questionNumber);
  const discarded = new Set();
  for (const id of input.discardedItemIds) {
    if (!UUID.test(id) || !itemIds.has(id) || seenItems.has(id) || discarded.has(id)) {
      throw badRequest('INVALID_MAPPING_CONFIRMATION', 'Every source item must be assigned exactly once or discarded.');
    }
    discarded.add(id);
  }
  if (seenItems.size + discarded.size !== itemIds.size) {
    throw badRequest('INCOMPLETE_MAPPING_CONFIRMATION', 'Confirmation must decide every extracted evidence item.');
  }
  const discardedItemIds = [...discarded].sort();
  return {
    responses,
    discardedItemIds,
    sourceEvidenceHash: batchSha256({
      schema: 'amc-batch-confirmation-source-set-v1', mappingRevision,
      responses: responses.map((response) => ({
        questionNumber: response.questionNumber,
        sourceItemIds: response.sourceItemIds,
        sourceSpanHash: response.sourceSpanHash,
        sourceEvidenceHash: response.sourceEvidenceHash
      })),
      discardedItemIds
    })
  };
}

export function scoreBatchPractice({ form, responses }) {
  const responseByQuestion = new Map(responses.map((response) => [response.questionNumber, response]));
  const policy = form.scoringPolicy;
  const questions = form.questions.filter((question) => responseByQuestion.has(question.number));
  const items = questions.map((question) => {
    const response = responseByQuestion.get(question.number);
    const acceptedOptions = question.acceptedOptions || (question.correctOption ? [question.correctOption] : []);
    const isScored = question.isScored !== false;
    const isCorrect = !isScored || response.selectedOption === null
      ? null
      : acceptedOptions.includes(response.selectedOption);
    const points = !isScored ? 0
      : response.selectedOption === null ? Number(policy.blankPoints)
        : isCorrect ? Number(policy.correctPoints) : Number(policy.incorrectPoints);
    return {
      questionNumber: question.number,
      selectedOption: response.selectedOption,
      correctOption: question.correctOption,
      acceptedOptions,
      isScored,
      isCorrect,
      points
    };
  });
  const scored = items.filter((item) => item.isScored);
  return {
    scoringScope: 'MAPPED_QUESTIONS_ONLY',
    scoringPolicy: policy,
    totalPoints: items.reduce((sum, item) => sum + item.points, 0),
    maximumPoints: scored.length * Number(policy.correctPoints),
    mappedQuestionCount: items.length,
    answeredCount: scored.filter((item) => item.selectedOption !== null).length,
    correctCount: scored.filter((item) => item.isCorrect === true).length,
    incorrectCount: scored.filter((item) => item.isCorrect === false).length,
    blankCount: scored.filter((item) => item.selectedOption === null).length,
    unscoredCount: items.filter((item) => !item.isScored).length,
    items
  };
}

export function createBatchLearningAggregate({
  batch, currentVersion, confirmation, form, approvedContext, now
}) {
  if (batch.baseVersion !== currentVersion.versionNumber) {
    throw conflict('BATCH_BASE_VERSION_STALE', 'Learning evidence changed after this batch began. Start a new batch.');
  }
  const versionNumber = currentVersion.versionNumber + 1;
  const evidenceHash = batchSha256({
    sourceKind: 'BATCH_UPLOAD',
    batchId: batch.id,
    mappingRevision: batch.mappingRevision,
    formId: batch.formId,
    formVersion: batch.formVersion,
    responses: confirmation.responses
  });
  const contextReady = Boolean(approvedContext?.questions?.length);
  const inputHash = contextReady ? analysisInputHash(evidenceHash, approvedContext.artifactSetHash) : evidenceHash;
  const version = {
    id: randomUUID(),
    learningSubmissionId: batch.learningSubmissionId,
    versionNumber,
    formId: batch.formId,
    formVersion: batch.formVersion,
    answersRevision: null,
    reasoningRevision: null,
    creationReason: 'BATCH_COMMIT',
    batchId: batch.id,
    contextStatus: contextReady ? 'CONTEXT_READY' : 'CONTEXT_UNAVAILABLE',
    contextSetId: contextReady ? approvedContext.id : null,
    evidenceHash,
    createdAt: now
  };
  const responses = confirmation.responses.map((response) => ({
    learningSubmissionVersionId: version.id,
    formId: batch.formId,
    formVersion: batch.formVersion,
    questionNumber: response.questionNumber,
    selectedOption: response.selectedOption,
    answerOrigin: 'BATCH_CONFIRMED',
    reasoningText: response.reasoningText,
    reasoningOrigin: response.reasoningOrigin,
    createdAt: now
  }));
  const workItem = {
    id: randomUUID(), learningSubmissionVersionId: version.id, workType: 'ANALYZE_SUBMISSION',
    status: contextReady ? 'QUEUED' : 'BLOCKED_CONTEXT', priority: 40, attemptCount: 0,
    inputHash, deletionGeneration: batch.deletionGeneration, availableAt: now,
    leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
    lastErrorCode: contextReady ? null : 'QUESTION_CONTEXT_UNAVAILABLE', createdAt: now, updatedAt: now
  };
  const analysisRun = contextReady ? {
    id: randomUUID(), learningSubmissionVersionId: version.id, contextSetId: approvedContext.id,
    versionNumber, inputHash, evidenceHash, deletionGeneration: batch.deletionGeneration,
    status: 'QUEUED', createdAt: now, startedAt: null, completedAt: null, lastErrorCode: null
  } : null;
  if (analysisRun) workItem.analysisRunId = analysisRun.id;
  return {
    version,
    responses,
    confirmation: {
      batchId: batch.id,
      mappingRevision: batch.mappingRevision,
      learningSubmissionVersionId: version.id,
      sourceEvidenceHash: confirmation.sourceEvidenceHash,
      confirmedAt: now,
      responses: confirmation.responses.map((response) => ({
        questionNumber: response.questionNumber,
        selectedOption: response.selectedOption,
        confirmedReasoningText: response.reasoningText,
        confirmedReasoningHash: response.confirmedReasoningHash,
        reasoningOrigin: response.reasoningOrigin,
        sourceItemIds: response.sourceItemIds,
        sourceDescriptors: response.sourceDescriptors,
        sourceEvidenceText: response.sourceEvidenceText,
        sourceSpanHash: response.sourceSpanHash,
        sourceEvidenceHash: response.sourceEvidenceHash
      }))
    },
    workItem,
    analysisRun,
    result: { id: randomUUID(), batchId: batch.id, learningSubmissionVersionId: version.id,
      createdAt: now, ...scoreBatchPractice({ form, responses: confirmation.responses }) }
  };
}

export function publicBatchProjection(bundle, { redactProtectedResult = false } = {}) {
  const deleted = bundle.batch.deletedAt !== null;
  return {
    id: bundle.batch.id,
    attemptId: bundle.batch.attemptId,
    learningSubmissionId: bundle.batch.learningSubmissionId,
    baseVersion: bundle.batch.baseVersion,
    committedVersion: bundle.batch.committedVersionNumber,
    formId: bundle.batch.formId,
    formVersion: bundle.batch.formVersion,
    sourceType: bundle.batch.sourceType || 'INTERACTIVE_FINAL',
    status: bundle.batch.status,
    failureCode: bundle.batch.failureCode,
    mappingRevision: bundle.batch.mappingRevision,
    deletionGeneration: bundle.batch.deletionGeneration,
    deletionState: bundle.batch.deletionState,
    createdAt: bundle.batch.createdAt,
    updatedAt: bundle.batch.updatedAt,
    submittedAt: bundle.batch.submittedAt,
    committedAt: bundle.batch.committedAt,
    deletedAt: bundle.batch.deletedAt,
    assets: deleted ? [] : bundle.assets.map((asset) => ({
      id: asset.id,
      position: asset.position,
      displayName: asset.displayName,
      kind: asset.kind,
      contentType: asset.contentType,
      declaredBytes: asset.declaredBytes,
      observedBytes: asset.observedBytes,
      sha256: asset.sha256,
      status: asset.status
    })),
    mapping: deleted || !bundle.mapping ? null : {
      revision: bundle.mapping.revision,
      status: bundle.mapping.status,
      items: bundle.mapping.items.map((item) => ({
        id: item.id,
        candidateQuestionNumbers: item.candidateQuestionNumbers,
        proposedQuestionNumber: item.proposedQuestionNumber,
        selectedOption: item.selectedOption,
        evidenceText: item.evidenceText,
        reasoningSummary: item.reasoningSummary,
        confidence: item.confidence,
        requiresConfirmation: item.requiresConfirmation,
        confirmationReasons: item.confirmationReasons
      }))
    },
    confirmation: !bundle.confirmation ? null : {
      mappingRevision: bundle.confirmation.mappingRevision,
      sourceEvidenceHash: bundle.confirmation.sourceEvidenceHash,
      confirmedAt: bundle.confirmation.confirmedAt,
      responses: bundle.confirmation.responses.map((response) => ({
        questionNumber: response.questionNumber,
        selectedOption: response.selectedOption,
        reasoningText: response.confirmedReasoningText,
        reasoningOrigin: response.reasoningOrigin,
        sourceItemIds: response.sourceItemIds,
        sourceEvidenceHash: response.sourceEvidenceHash
      }))
    },
    result: redactProtectedResult || !bundle.result ? null : {
      scoringScope: bundle.result.scoringScope,
      scoringPolicy: bundle.result.scoringPolicy,
      totalPoints: bundle.result.totalPoints,
      maximumPoints: bundle.result.maximumPoints,
      mappedQuestionCount: bundle.result.mappedQuestionCount,
      answeredCount: bundle.result.answeredCount,
      correctCount: bundle.result.correctCount,
      incorrectCount: bundle.result.incorrectCount,
      blankCount: bundle.result.blankCount,
      unscoredCount: bundle.result.unscoredCount,
      createdAt: bundle.result.createdAt,
      items: bundle.result.items
    },
    ...(redactProtectedResult && bundle.result
      ? { resultWithheldReason: 'OPEN_REVIEW_REVOKED' }
      : {})
  };
}
