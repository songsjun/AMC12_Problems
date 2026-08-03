/*
 * AMC 12 practice client
 *
 * This is deliberately a framework-free, same-origin client.  The server owns
 * the clock, grading, answer key, solutions, and attempt state; this module
 * only mirrors state for display and makes idempotent requests.
 */

export function apiBaseForModuleUrl(moduleUrl, { browser = true } = {}) {
  // A direct host serves /practice/ -> /api/amc12/. The education portal also
  // mounts this archive at /amc12/, where its existing proxy strips that
  // prefix. Resolving relative to this module keeps both same-origin routes
  // working without a hard-coded host or a public runtime secret.
  if (!browser || String(moduleUrl).startsWith('file:')) return '/api/amc12';
  return new URL('../api/amc12', moduleUrl).pathname.replace(/\/$/, '');
}

export const API_BASE = apiBaseForModuleUrl(import.meta.url, { browser: typeof window !== 'undefined' });
export const DEFAULT_DURATION_MS = 75 * 60 * 1000;
export const OPTIONS = ['A', 'B', 'C', 'D', 'E'];
export const MAX_REASONING_NOTE_BYTES = 8_000;
export const MAX_REASONING_BATCH_TEXT_BYTES = 48_000;
// Leave headroom below a 64 KiB reverse-proxy body limit for headers added by
// future envelope versions. The value is checked against the exact JSON body,
// including JSON escaping rather than only the source text.
export const MAX_REASONING_REQUEST_BYTES = 60_000;
export const LEARNING_REPORT_POLL_MS = 5_000;
export const MAX_LEARNING_REPORT_POLLS = 12;
export const MAX_BATCH_FILES = 10;
export const MAX_BATCH_BYTES = 100 * 1024 * 1024;
export const MAX_TEXT_FILE_BYTES = 256 * 1024;
export const MAX_AUDIO_FILE_BYTES = 25 * 1024 * 1024;
export const BATCH_POLL_MS = 3_000;
export const TUTOR_POLL_MS = 2_500;

const BATCH_TEXT_TYPES = new Set(['text/plain', 'text/markdown']);
const BATCH_AUDIO_TYPES = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac']);
const TUTOR_PENDING_STATUSES = new Set(['QUEUED', 'RUNNING', 'RETRY_WAIT']);
const TUTOR_RETRYABLE_TERMINAL_STATUSES = new Set(['FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED']);

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', payload = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function finiteNumber(value, fallback = null) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function unwrapData(payload) {
  if (isRecord(payload) && isRecord(payload.data)) return payload.data;
  return payload || {};
}

function opaquePathPart(value) {
  return encodeURIComponent(String(value));
}

export function learningHistoryPath({ cursor = null, limit = 20 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return `${API_BASE}/learning-history?${params}`;
}

export function learningHistorySubmissionPath(submissionId) {
  return `${API_BASE}/learning-history/${opaquePathPart(submissionId)}`;
}

export function learningHistoryReportPath(submissionId, versionNumber) {
  return `${learningHistorySubmissionPath(submissionId)}/versions/${opaquePathPart(versionNumber)}/report`;
}

export function learningHistoryQuestionPath(submissionId, versionNumber, questionNumber) {
  return `${learningHistorySubmissionPath(submissionId)}/versions/${opaquePathPart(versionNumber)}/questions/${opaquePathPart(questionNumber)}`;
}

export function tutorThreadsPath({ submissionId, versionNumber, questionNumber }) {
  return `${learningHistoryQuestionPath(submissionId, versionNumber, questionNumber)}/tutor-threads`;
}

export function tutorThreadListPath(identity, { limit = 10, cursor = null } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return `${tutorThreadsPath(identity)}?${params}`;
}

export function tutorThreadPath(identity, threadId) {
  return `${tutorThreadsPath(identity)}/${opaquePathPart(threadId)}`;
}

export function validTutorMessage(value) {
  return typeof value === 'string' && value.trim().length > 0 && !value.includes('\u0000')
    && new TextEncoder().encode(value).byteLength <= 2_048;
}

export async function createTutorThreadRequest(apiClient, identity, { generateKey = idempotencyKey } = {}) {
  const key = generateKey();
  return retryIdempotentNetworkMutation(
    () => apiClient.post(tutorThreadsPath(identity), {}, { idempotency: key })
  );
}

export async function sendTutorMessageRequest(apiClient, identity, threadId, message,
  { generateKey = idempotencyKey } = {}) {
  if (!validTutorMessage(message)) {
    throw new ApiError('Tutor messages must contain 1-2048 UTF-8 bytes.', { code: 'INVALID_TUTOR_MESSAGE' });
  }
  const key = generateKey();
  return retryIdempotentNetworkMutation(
    () => apiClient.post(`${tutorThreadPath(identity, threadId)}/messages`, { message }, { idempotency: key })
  );
}

export async function retryTutorRequestRequest(apiClient, identity, threadId, requestOrdinal,
  { generateKey = idempotencyKey } = {}) {
  if (!Number.isSafeInteger(requestOrdinal) || requestOrdinal < 1 || requestOrdinal > 32) {
    throw new ApiError('Tutor request ordinal is invalid.', { code: 'INVALID_TUTOR_REQUEST_ORDINAL' });
  }
  const key = generateKey();
  return retryIdempotentNetworkMutation(() => apiClient.post(
    `${tutorThreadPath(identity, threadId)}/requests/${opaquePathPart(requestOrdinal)}/retries`, {},
    { idempotency: key }
  ));
}

export async function forkTutorThreadRequest(apiClient, identity, threadId,
  { generateKey = idempotencyKey } = {}) {
  const key = generateKey();
  return retryIdempotentNetworkMutation(
    () => apiClient.post(`${tutorThreadPath(identity, threadId)}/forks`, {}, { idempotency: key })
  );
}

export async function deleteTutorThreadRequest(apiClient, identity, threadId,
  { generateKey = idempotencyKey } = {}) {
  const key = generateKey();
  return retryIdempotentNetworkMutation(
    () => apiClient.delete(tutorThreadPath(identity, threadId), { idempotency: key })
  );
}

export function tutorRequestIsPending(request) {
  return TUTOR_PENDING_STATUSES.has(String(request?.status || '').toUpperCase());
}

export function tutorRequestMayRetry(request) {
  return Number.isSafeInteger(request?.requestOrdinal)
    && TUTOR_RETRYABLE_TERMINAL_STATUSES.has(String(request?.status || '').toUpperCase());
}

export function tutorBundleMatchesIdentity(bundle, identity, threadId = null) {
  return Boolean(bundle?.thread?.id && identity
    && String(bundle.thread.learningSubmissionId) === String(identity.submissionId)
    && Number(bundle.thread.versionNumber) === Number(identity.versionNumber)
    && Number(bundle.thread.questionNumber) === Number(identity.questionNumber)
    && (threadId === null || String(bundle.thread.id) === String(threadId)));
}

function publicTutorThread(thread) {
  if (!thread?.id) return null;
  return {
    id: String(thread.id),
    learningSubmissionId: String(thread.learningSubmissionId || ''),
    versionNumber: finiteNumber(thread.versionNumber),
    formId: String(thread.formId || ''),
    formVersion: String(thread.formVersion || ''),
    sourceType: String(thread.sourceType || ''),
    questionNumber: finiteNumber(thread.questionNumber),
    status: String(thread.status || ''),
    successfulTurnCount: finiteNumber(thread.successfulTurnCount, 0),
    requestCount: finiteNumber(thread.requestCount, 0),
    threadRevision: finiteNumber(thread.threadRevision, 0),
    forkedFromThreadId: thread.forkedFromThreadId == null ? null : String(thread.forkedFromThreadId),
    createdAt: thread.createdAt || null,
    updatedAt: thread.updatedAt || null,
    closedAt: thread.closedAt || null
  };
}

function publicTutorLatestRequest(request) {
  if (!request || !Number.isSafeInteger(request.requestOrdinal)) return null;
  return {
    requestOrdinal: request.requestOrdinal,
    turnNumber: finiteNumber(request.turnNumber),
    status: String(request.status || ''),
    retryAuthorization: request.retryAuthorization == null ? null : String(request.retryAuthorization),
    outcomeCode: request.outcomeCode == null ? null : String(request.outcomeCode),
    createdAt: request.createdAt || null,
    completedAt: request.completedAt || null
  };
}

export function normalizeTutorThreadSummary(value) {
  const thread = publicTutorThread(value?.thread);
  if (!thread) return null;
  const sourceEntitled = value?.sourceEntitled === true;
  return {
    thread,
    sourceEntitled,
    latestRequest: sourceEntitled ? publicTutorLatestRequest(value.latestRequest) : null
  };
}

export function tutorSummaryFromBundle(bundle) {
  const requests = Array.isArray(bundle?.requests) ? bundle.requests : [];
  const latestRequest = [...requests].filter((request) => Number.isSafeInteger(request?.requestOrdinal))
    .sort((left, right) => right.requestOrdinal - left.requestOrdinal)[0] || null;
  return normalizeTutorThreadSummary({ thread: bundle?.thread, latestRequest, sourceEntitled: true });
}

export function firstEntitledTutorThreadId(summaries) {
  return (Array.isArray(summaries) ? summaries : [])
    .find((summary) => summary?.sourceEntitled === true)?.thread?.id || null;
}

export function tutorThreadRowModel(summary, index, selectedThreadId = null) {
  const ordinal = Number(index) + 1;
  const sourceEntitled = summary?.sourceEntitled === true;
  const status = String(summary?.latestRequest?.status || summary?.thread?.status || 'unknown')
    .toLowerCase().replaceAll('_', ' ');
  return {
    canOpen: sourceEntitled,
    current: String(summary?.thread?.id) === String(selectedThreadId),
    openLabel: `Open discussion ${ordinal}: ${status}`,
    deleteLabel: `Delete discussion ${ordinal}`,
    visibleLabel: `Discussion ${ordinal} · ${status}`,
    unavailableText: sourceEntitled ? null : 'Source unavailable—delete to free capacity.'
  };
}

export function applyTutorThreadTombstone(target, threadId) {
  const normalizedThreadId = String(threadId || '');
  if (!normalizedThreadId) return { deletedSelectedThread: false, nextThreadId: null };
  target.tutorLoadSequence = finiteNumber(target.tutorLoadSequence, 0) + 1;
  target.tutorListSequence = finiteNumber(target.tutorListSequence, 0) + 1;
  if (!(target.deletedTutorThreadIds instanceof Set)) target.deletedTutorThreadIds = new Set();
  target.deletedTutorThreadIds.add(normalizedThreadId);
  target.tutorThreads = (Array.isArray(target.tutorThreads) ? target.tutorThreads : [])
    .filter((item) => String(item?.thread?.id) !== normalizedThreadId);
  const deletedSelectedThread = String(target.tutorSelectedThreadId) === normalizedThreadId;
  if (deletedSelectedThread) {
    target.tutorSelectedThreadId = null;
    target.tutorThread = null;
    target.tutorForkRequired = false;
  }
  return {
    deletedSelectedThread,
    nextThreadId: deletedSelectedThread ? firstEntitledTutorThreadId(target.tutorThreads) : null
  };
}

export function tutorFullGetSourceUnavailable(error) {
  const code = String(error?.code || '').toUpperCase();
  return [403, 404].includes(Number(error?.status))
    || ['TUTOR_SOURCE_UNAVAILABLE', 'SOURCE_UNAVAILABLE', 'SOURCE_NOT_ENTITLED'].includes(code);
}

export function tutorSummaryMatchesIdentity(summary, identity) {
  return tutorBundleMatchesIdentity(summary, identity);
}

export function tutorListPageContextMatches(request, current) {
  return Boolean(request && current?.visible
    && request.listSequence === current.listSequence
    && String(request.cursor) === String(current.cursor));
}

export function batchPollContextMatches(context, { attemptId, batchId, epoch, visible }) {
  return Boolean(context && visible
    && String(context.attemptId) === String(attemptId)
    && String(context.batchId) === String(batchId)
    && context.epoch === epoch);
}

export function batchMutationContextMatches(context, { attemptId, activeBatchId, epoch, visible }) {
  return Boolean(context && visible && context.epoch === epoch
    && String(context.attemptId) === String(attemptId)
    && (context.batchId === null || String(context.batchId) === String(activeBatchId)));
}

export function batchReviewOpenContextMatches(context, current) {
  return Boolean(context && current
    && context.sequence === current.sequence
    && String(context.studentId) === String(current.studentId));
}

export function numberedBatchMappingItems(mapping) {
  return Array.isArray(mapping?.items)
    ? mapping.items.map((item, itemIndex) => ({ item, itemIndex })) : [];
}

export function tutorPollContextMatches(context, current) {
  return Boolean(context && current?.visible && context.epoch === current.epoch
    && String(context.submissionId) === String(current.submissionId)
    && Number(context.versionNumber) === Number(current.versionNumber)
    && Number(context.questionNumber) === Number(current.questionNumber)
    && String(context.threadId) === String(current.threadId));
}

export function tutorThreadLoadContextMatches(context, current) {
  return Boolean(context && !current?.deleted
    && context.loadSequence === current?.loadSequence
    && tutorPollContextMatches(context, {
      ...current, threadId: current.selectedThreadId
    }));
}

export function resetLearningTutorState(target) {
  target.learningHistoryEpoch = finiteNumber(target.learningHistoryEpoch, 0) + 1;
  target.learningHistoryItems = [];
  target.learningHistoryNextCursor = null;
  target.learningHistorySubmission = null;
  target.learningHistoryVersion = null;
  target.learningHistoryReport = null;
  target.learningHistoryQuestion = null;
  target.learningHistoryReportPollCount = 0;
  resetTutorConversationState(target, { clearSummaries: true });
  return target;
}

export function resetTutorConversationState(target, { clearSummaries = false } = {}) {
  target.tutorLoadSequence = finiteNumber(target.tutorLoadSequence, 0) + 1;
  target.tutorSelectedThreadId = null;
  target.tutorForkRequired = false;
  target.tutorThread = null;
  if (clearSummaries) {
    target.tutorListSequence = finiteNumber(target.tutorListSequence, 0) + 1;
    target.deletedTutorThreadIds = new Set();
    target.tutorThreads = [];
    target.tutorNextCursor = null;
  }
  return target;
}

function batchContentType(file) {
  const declared = String(file?.type || '').split(';', 1)[0].trim().toLowerCase();
  if (BATCH_TEXT_TYPES.has(declared) || BATCH_AUDIO_TYPES.has(declared)) return declared;
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.txt')) return 'text/plain';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'text/markdown';
  if (name.endsWith('.mp3')) return 'audio/mpeg';
  if (name.endsWith('.m4a') || name.endsWith('.mp4')) return 'audio/mp4';
  if (name.endsWith('.wav')) return 'audio/wav';
  if (name.endsWith('.ogg') || name.endsWith('.oga')) return 'audio/ogg';
  if (name.endsWith('.flac')) return 'audio/flac';
  return null;
}

export function batchFileDescriptors(files) {
  const list = Array.from(files || []);
  if (list.length < 1 || list.length > MAX_BATCH_FILES) {
    throw new ApiError(`Choose 1-${MAX_BATCH_FILES} text or audio files.`, { code: 'INVALID_BATCH_FILES' });
  }
  let total = 0;
  const descriptors = list.map((file) => {
    const contentType = batchContentType(file);
    const displayName = String(file?.name || '');
    const declaredBytes = Number(file?.size);
    const kind = BATCH_TEXT_TYPES.has(contentType) ? 'TEXT'
      : (BATCH_AUDIO_TYPES.has(contentType) ? 'AUDIO' : null);
    if (!kind) throw new ApiError(`${displayName || 'This file'} has an unsupported type.`, { code: 'UNSUPPORTED_MEDIA_TYPE' });
    if (!displayName || displayName.length > 255 || /[\u0000-\u001f\u007f]/u.test(displayName)
        || new TextEncoder().encode(displayName).byteLength > 512) {
      throw new ApiError('Each file needs a safe name no longer than 512 UTF-8 bytes.', { code: 'INVALID_FILE_NAME' });
    }
    const maximum = kind === 'TEXT' ? MAX_TEXT_FILE_BYTES : MAX_AUDIO_FILE_BYTES;
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 1 || declaredBytes > maximum) {
      throw new ApiError(`${displayName} exceeds the ${kind === 'TEXT' ? '256 KiB' : '25 MiB'} file limit.`, { code: 'FILE_SIZE_LIMIT' });
    }
    total += declaredBytes;
    return { displayName, kind, contentType, declaredBytes };
  });
  if (total > MAX_BATCH_BYTES) {
    throw new ApiError('The selected files exceed the 100 MiB batch limit.', { code: 'BATCH_SIZE_LIMIT' });
  }
  return descriptors;
}

export function batchConfirmationPayload(mapping, decisions, { confirmed = false } = {}) {
  if (!confirmed) throw new ApiError('Review every extracted item and explicitly confirm the mapping.', {
    code: 'EXPLICIT_CONFIRMATION_REQUIRED'
  });
  if (!mapping || !Number.isSafeInteger(mapping.revision) || !Array.isArray(mapping.items)) {
    throw new ApiError('The extracted mapping is unavailable or stale.', { code: 'INVALID_BATCH_MAPPING' });
  }
  const decisionMap = decisions instanceof Map ? decisions : new Map(
    Array.isArray(decisions) ? decisions.map((item) => [item.itemId, item]) : []
  );
  const discardedItemIds = [];
  const grouped = new Map();
  for (const [itemIndex, item] of mapping.items.entries()) {
    const decision = decisionMap.get(item.id);
    if (!decision || !['MAP', 'DISCARD'].includes(decision.action)) {
      throw new ApiError('Choose a question or discard every extracted item.', { code: 'INCOMPLETE_MAPPING_CONFIRMATION' });
    }
    if (decision.action === 'DISCARD') {
      discardedItemIds.push(item.id);
      continue;
    }
    const questionNumber = Number(decision.questionNumber);
    const selectedOption = decision.selectedOption === '' || decision.selectedOption === undefined
      ? null : String(decision.selectedOption).toUpperCase();
    const reasoningText = String(decision.reasoningText ?? '');
    if (!Number.isSafeInteger(questionNumber) || questionNumber < 1 || questionNumber > 25
        || !(selectedOption === null || OPTIONS.includes(selectedOption))
        || new TextEncoder().encode(reasoningText).byteLength > MAX_REASONING_NOTE_BYTES) {
      throw new ApiError('Each mapped item needs a valid question, answer A-E or blank, and approach within 8000 bytes.', {
        code: 'INVALID_MAPPING_CONFIRMATION'
      });
    }
    const existing = grouped.get(questionNumber);
    if (existing && existing.selectedOption !== selectedOption) {
      throw new ApiError(`Items assigned to question ${questionNumber} must use the same answer.`, {
        code: 'CONFLICTING_MAPPING_CONFIRMATION'
      });
    }
    if (existing) {
      existing.sourceItemIds.push(item.id);
      if (reasoningText && !existing.reasoningParts.includes(reasoningText)) existing.reasoningParts.push(reasoningText);
    } else {
      grouped.set(questionNumber, {
        questionNumber, selectedOption, sourceItemIds: [item.id], reasoningParts: reasoningText ? [reasoningText] : []
      });
    }
  }
  const responses = [...grouped.values()].sort((left, right) => left.questionNumber - right.questionNumber)
    .map(({ reasoningParts, ...response }) => ({ ...response, reasoningText: reasoningParts.join('\n') }));
  if (!responses.length) throw new ApiError('At least one extracted item must be mapped to a question.', {
    code: 'INVALID_MAPPING_CONFIRMATION'
  });
  if (responses.some((response) => new TextEncoder().encode(response.reasoningText).byteLength > MAX_REASONING_NOTE_BYTES)) {
    throw new ApiError('Combined approach text for one question exceeds 8000 bytes.', { code: 'INVALID_MAPPING_CONFIRMATION' });
  }
  return { mappingRevision: mapping.revision, responses, discardedItemIds };
}

export async function retryIdempotentNetworkMutation(operation) {
  try {
    return await operation();
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'NETWORK_ERROR') throw error;
    return operation();
  }
}

export async function submitLearningBatchFiles(apiClient, attemptId, files, {
  generateKey = idempotencyKey,
  onProgress = () => {}
} = {}) {
  const selected = Array.from(files || []);
  const descriptors = batchFileDescriptors(selected);
  const root = `${API_BASE}/attempts/${opaquePathPart(attemptId)}/learning-batches`;
  const createKey = generateKey();
  onProgress({ phase: 'CREATING', completed: 0, total: selected.length });
  const created = await retryIdempotentNetworkMutation(
    () => apiClient.post(root, { files: descriptors }, { idempotency: createKey })
  );
  const batch = unwrapData(created).batch;
  if (!batch?.id || !Array.isArray(batch.assets) || batch.assets.length !== selected.length) {
    throw new ApiError('The server returned an invalid batch reservation.', { code: 'INVALID_BATCH_RESPONSE' });
  }
  const assets = [...batch.assets].sort((left, right) => left.position - right.position);
  for (let index = 0; index < selected.length; index += 1) {
    onProgress({ phase: 'UPLOADING', completed: index, total: selected.length, displayName: descriptors[index].displayName });
    const uploadKey = generateKey();
    await retryIdempotentNetworkMutation(() => apiClient.putBinary(
      `${root}/${opaquePathPart(batch.id)}/assets/${opaquePathPart(assets[index].id)}/body`,
      selected[index], { idempotency: uploadKey }
    ));
  }
  onProgress({ phase: 'SUBMITTING', completed: selected.length, total: selected.length });
  const submitKey = generateKey();
  const submitted = await retryIdempotentNetworkMutation(
    () => apiClient.post(`${root}/${opaquePathPart(batch.id)}/submit`, {}, { idempotency: submitKey })
  );
  onProgress({ phase: 'PROCESSING', completed: selected.length, total: selected.length });
  return unwrapData(submitted).batch || batch;
}

export function extractAttempt(payload) {
  const root = unwrapData(payload);
  if (isRecord(root.attempt)) return root.attempt;
  if (isRecord(root.newAttempt)) return root.newAttempt;
  if (isRecord(root.retryAttempt)) return root.retryAttempt;
  return root;
}

export function extractReplacementAttempt(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.newAttempt, root.retryAttempt, root.replacementAttempt, root.nextAttempt, null);
}

export function normalizePhase(attempt) {
  return String(firstDefined(attempt?.phase, attempt?.status, '')).toUpperCase();
}

export function normalizeClockState(attempt) {
  return String(firstDefined(attempt?.clockState, attempt?.clock?.state, '')).toUpperCase();
}

export function sameAttemptId(left, right) {
  return Boolean(left?.id) && Boolean(right?.id) && String(left.id) === String(right.id);
}

export function stateRevisionFromAttempt(attempt) {
  const revision = finiteNumber(firstDefined(attempt?.stateRevision, attempt?.state?.revision));
  return revision !== null && Number.isSafeInteger(revision) && revision >= 0 ? revision : null;
}

export function answerRevisionFromAttempt(attempt) {
  const revision = finiteNumber(firstDefined(attempt?.answersRevision, attempt?.answerRevision));
  return revision !== null && Number.isSafeInteger(revision) && revision >= 0 ? revision : null;
}

/**
 * The server increments stateRevision for every persisted attempt transition.
 * A delayed same-attempt response must never roll a newer answer save, deadline
 * decision, reset, or final submission back in the browser. Date/revision
 * fallbacks retain graceful compatibility during a rolling deployment.
 */
export function shouldMergeAttemptUpdate(current, candidate) {
  if (!current || !candidate || !sameAttemptId(current, candidate)) return true;
  const currentStateRevision = stateRevisionFromAttempt(current);
  const candidateStateRevision = stateRevisionFromAttempt(candidate);
  if (currentStateRevision !== null && candidateStateRevision !== null) {
    if (candidateStateRevision !== currentStateRevision) return candidateStateRevision > currentStateRevision;
    const currentAnswersRevision = answerRevisionFromAttempt(current);
    const candidateAnswersRevision = answerRevisionFromAttempt(candidate);
    return !(currentAnswersRevision !== null && candidateAnswersRevision !== null
      && candidateAnswersRevision < currentAnswersRevision);
  }
  const currentUpdatedAt = timestampMs(current.updatedAt);
  const candidateUpdatedAt = timestampMs(candidate.updatedAt);
  if (currentUpdatedAt && candidateUpdatedAt && candidateUpdatedAt < currentUpdatedAt) return false;
  const currentAnswersRevision = answerRevisionFromAttempt(current);
  const candidateAnswersRevision = answerRevisionFromAttempt(candidate);
  return !(currentAnswersRevision !== null && candidateAnswersRevision !== null
    && candidateAnswersRevision < currentAnswersRevision);
}

export function saveResponseNeedsReconciliation(current, candidate) {
  return sameAttemptId(current, candidate) && !shouldMergeAttemptUpdate(current, candidate);
}

export function canAccessFinalReview(attempt) {
  // A reset after final submission creates a new attempt but must not erase
  // the student's immutable historical final result. The API marks only that
  // narrowly scoped case as resultsAvailable; a reset-before-final remains
  // ineligible and cannot reveal a key or solution.
  return normalizePhase(attempt) === 'FINALIZED'
    || (normalizePhase(attempt) === 'RESET' && attempt?.resultsAvailable === true);
}

export function batchIntakeAvailableForForm(form) {
  return form?.batchIntakeAvailable === true;
}

export function batchReviewAvailableForForm(form) {
  return form?.batchReviewAvailable === true;
}

export function batchReviewWorkspacePath(formId, formVersion) {
  if (!formId || formVersion === null || formVersion === undefined || formVersion === '') return null;
  return `${API_BASE}/forms/${opaquePathPart(formId)}/versions/${opaquePathPart(formVersion)}/batch-review-workspace`;
}

export function normalizeBatchReviewWorkspace(payload, form) {
  const workspace = unwrapData(payload).workspace;
  const expectedFormId = firstDefined(form?.id, form?.formId, null);
  const expectedFormVersion = firstDefined(form?.version, form?.formVersion, null);
  if (!workspace?.id
      || workspace.attemptMode !== 'BATCH_REVIEW'
      || String(workspace.formId || '') !== String(expectedFormId || '')
      || expectedFormVersion === null || expectedFormVersion === undefined
      || String(workspace.formVersion ?? '') !== String(expectedFormVersion)
      || workspace.protectedAccessStatus !== 'AVAILABLE'
      || workspace.lifecycleStatus !== 'ACTIVE') {
    throw new ApiError('The service returned an invalid batch-review workspace.', {
      code: 'INVALID_BATCH_REVIEW_WORKSPACE'
    });
  }
  return workspace;
}

export async function createBatchReviewWorkspaceRequest(apiClient, form,
  { generateKey = idempotencyKey } = {}) {
  const path = batchReviewWorkspacePath(form?.id, form?.version);
  if (!path || !batchReviewAvailableForForm(form)) {
    throw new ApiError('Batch submission is not available yet.', {
      status: 503,
      code: 'BATCH_REVIEW_UNAVAILABLE'
    });
  }
  const key = generateKey();
  const response = await retryIdempotentNetworkMutation(
    () => apiClient.post(path, {}, { idempotency: key })
  );
  return normalizeBatchReviewWorkspace(response, form);
}

export async function createTimedAttemptRequest(apiClient, form, { attemptHistoryLoaded = false } = {}) {
  if (attemptHistoryLoaded !== true) {
    throw new ApiError('Saved-attempt history must load before starting timed practice.', {
      status: 409,
      code: 'ATTEMPT_HISTORY_NOT_READY'
    });
  }
  if (!form?.id) throw new ApiError('This form is missing an identifier.', { code: 'FORM_ID_REQUIRED' });
  return apiClient.post(`${API_BASE}/attempts`, { formId: form.id });
}

export function batchReviewWorkspaceIntakeAvailable(workspace) {
  return workspace?.batchReviewAvailable === true
    && workspace?.batchIntakeAvailable === true
    && workspace?.protectedAccessStatus === 'AVAILABLE';
}

/**
 * Results can be opened without passing through the dashboard mode chooser.
 * Resolve intake capability from the server's form-list snapshot for the
 * exact revision owned by the attempt; missing, stale, or loosely typed data
 * must fail closed. Detailed/embedded form payloads intentionally do not
 * override this deployment capability.
 */
export function batchIntakeAvailableForAttempt(attempt, forms) {
  const formId = extractFormId(attempt);
  const formVersion = extractFormVersion(attempt);
  if (!formId || formVersion === null || formVersion === undefined || !Array.isArray(forms)) return false;
  const form = forms.find((candidate) => String(candidate?.id || '') === String(formId)
    && String(candidate?.version ?? '') === String(formVersion));
  return batchIntakeAvailableForForm(form);
}

export function focusSafeVisibleTarget(...candidates) {
  const target = candidates.find((candidate) => candidate
    && typeof candidate.focus === 'function'
    && candidate.disabled !== true
    && candidate.hidden !== true
    && candidate.isConnected !== false
    && !candidate.closest?.('[hidden]')) || null;
  target?.focus();
  return target;
}

export function parsePracticeEntryIntent(value, expectedOrigin = null) {
  let parsed;
  try {
    parsed = new URL(String(value), expectedOrigin || 'http://practice.invalid');
  } catch {
    return null;
  }
  if (expectedOrigin && parsed.origin !== expectedOrigin) return null;
  const keys = [...parsed.searchParams.keys()];
  if (keys.length !== 2 || keys.filter((key) => key === 'form').length !== 1
      || keys.filter((key) => key === 'mode').length !== 1) return null;
  const formId = parsed.searchParams.get('form');
  const mode = parsed.searchParams.get('mode');
  if (!/^amc12-\d{4}-[ab]$/.test(String(formId || '')) || !['practice', 'batch'].includes(mode)) return null;
  return { formId, mode };
}

export function consumePracticeEntryIntent(target, forms) {
  const intent = target?.practiceEntryIntent;
  if (!intent) return null;
  target.practiceEntryIntent = null;
  const form = (Array.isArray(forms) ? forms : [])
    .find((candidate) => String(candidate?.id || '') === intent.formId) || null;
  return { intent, form };
}

export function beginModalAction(target, invocation, controls) {
  if (!target || target.modal !== invocation || invocation?.busy === true) return null;
  const snapshots = (Array.isArray(controls) ? controls : [])
    .filter(Boolean).map((control) => ({ control, disabled: control.disabled === true }));
  invocation.busy = true;
  snapshots.forEach(({ control }) => { control.disabled = true; });
  let finished = false;
  return () => {
    if (finished) return false;
    finished = true;
    if (target.modal !== invocation) return false;
    invocation.busy = false;
    snapshots.forEach(({ control, disabled }) => { control.disabled = disabled; });
    return true;
  };
}

export function solutionEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/solutions`;
}

export function resultsEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/results`;
}

export function learningSubmissionEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/learning-submission`;
}

export function learningReportEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/learning-report`;
}

export async function fetchLearningReport(api, attempt) {
  const path = learningReportEndpointForAttempt(attempt);
  if (!path) {
    throw new ApiError('Learning reports are available only after final submission.', {
      status: 409,
      code: 'FINAL_REVIEW_NOT_AVAILABLE'
    });
  }
  // This endpoint is intentionally read-only: refreshing a report must never
  // enqueue provider work or mutate the immutable learning submission.
  return api.get(path);
}

/**
 * This gate is intentionally exported and tested.  No pre-final attempt may
 * make a results/solutions request, even if a stale response includes fields
 * resembling a solution.
 */
export async function fetchFinalReview(api, attempt) {
  const resultsPath = resultsEndpointForAttempt(attempt);
  const solutionsPath = solutionEndpointForAttempt(attempt);
  if (!resultsPath || !solutionsPath) {
    throw new ApiError('Final review is available only after final submission.', {
      status: 409,
      code: 'FINAL_REVIEW_NOT_AVAILABLE'
    });
  }
  const [results, solutions] = await Promise.all([api.get(resultsPath), api.get(solutionsPath)]);
  return { results, solutions };
}

export function extractForms(payload) {
  const root = unwrapData(payload);
  const forms = firstDefined(root.forms, root.items, Array.isArray(root) ? root : null);
  return Array.isArray(forms) ? forms : [];
}

export function extractAttemptHistory(payload) {
  const root = unwrapData(payload);
  const attempts = firstDefined(root.attempts, root.items, Array.isArray(root) ? root : null);
  return Array.isArray(attempts) ? attempts : [];
}

/**
 * A reset is atomic on the server but its response can still be lost after
 * commit. Find only the successor for the same immutable form revision; an
 * unrelated resumable test must never be opened as a recovery side effect.
 */
export function resetReplacementFromHistory(attempts, priorAttempt) {
  if (!Array.isArray(attempts) || !priorAttempt?.id) return null;
  const priorId = String(priorAttempt.id);
  const formId = firstDefined(priorAttempt.formId, priorAttempt.form?.id, null);
  const version = firstDefined(priorAttempt.formVersion, priorAttempt.form?.version, null);
  if (!formId) return null;
  return attempts
    .filter((attempt) => {
      if (!attempt?.id || String(attempt.id) === priorId) return false;
      if (String(firstDefined(attempt.formId, attempt.form?.id, '')) !== String(formId)) return false;
      const candidateVersion = firstDefined(attempt.formVersion, attempt.form?.version, null);
      if (version !== null && version !== undefined && candidateVersion !== null && candidateVersion !== undefined
        && String(candidateVersion) !== String(version)) return false;
      return ['TIMED', 'LIMIT_NOTICE', 'OVERTIME'].includes(normalizePhase(attempt));
    })
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt))[0] || null;
}

export function formCacheKey(formId, formVersion = null) {
  return `${String(formId ?? '')}\u0000${formVersion === null || formVersion === undefined ? '' : String(formVersion)}`;
}

export function publicFormPath(formId, formVersion = null) {
  const path = `${API_BASE}/forms/${encodeURIComponent(String(formId))}`;
  return formVersion === null || formVersion === undefined || formVersion === ''
    ? path
    : `${path}/versions/${encodeURIComponent(String(formVersion))}`;
}

export function attemptFormPath(attemptId) {
  return `${API_BASE}/attempts/${encodeURIComponent(String(attemptId))}/form`;
}

export function extractQuestions(payload, attempt = null) {
  const root = unwrapData(payload);
  const candidates = [
    root.questions,
    root.form?.questions,
    attempt?.questions,
    attempt?.form?.questions,
    root.attempt?.questions,
    root.attempt?.form?.questions
  ];
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function normalizeQuestion(question, index = 0) {
  const number = finiteNumber(firstDefined(question?.number, question?.questionNumber, question?.position), index + 1);
  return {
    number,
    promptMarkdown: String(firstDefined(question?.promptMarkdown, question?.prompt, question?.stemMarkdown, question?.text, '')),
    choices: normalizeChoices(question?.choices, question?.options),
    isScored: question?.isScored !== false,
    media: Array.isArray(question?.media) ? question.media : []
  };
}

export function normalizeChoices(choices, options) {
  const source = choices ?? options ?? {};
  if (Array.isArray(source)) {
    return source.map((choice, index) => ({
      option: String(firstDefined(choice?.option, choice?.label, choice?.key, OPTIONS[index], '')).toUpperCase(),
      markdown: String(firstDefined(choice?.textMarkdown, choice?.markdown, choice?.text, choice?.contentMarkdown, choice?.content, choice ?? ''))
    })).filter((choice) => OPTIONS.includes(choice.option));
  }
  if (isRecord(source)) {
    return OPTIONS.filter((option) => source[option] !== undefined && source[option] !== null)
      .map((option) => ({ option, markdown: String(source[option]) }));
  }
  return [];
}

export function answerMapFromAttempt(attempt) {
  const raw = firstDefined(attempt?.answers, attempt?.answerDraft, attempt?.currentAnswers, {});
  const answers = new Map();
  if (Array.isArray(raw)) {
    for (const answer of raw) {
      const number = finiteNumber(firstDefined(answer?.questionNumber, answer?.number, answer?.question?.number));
      const option = firstDefined(answer?.selectedOption, answer?.option, answer?.answer, null);
      if (number !== null) answers.set(number, option ? String(option).toUpperCase() : null);
    }
  } else if (isRecord(raw)) {
    for (const [number, answer] of Object.entries(raw)) {
      const position = finiteNumber(number);
      const option = isRecord(answer) ? firstDefined(answer.selectedOption, answer.option, answer.answer, null) : answer;
      if (position !== null) answers.set(position, option ? String(option).toUpperCase() : null);
    }
  }
  return answers;
}

export function answerPayload(answerMap) {
  return [...answerMap.entries()]
    .map(([questionNumber, selectedOption]) => ({
      questionNumber: Number(questionNumber),
      selectedOption: selectedOption && OPTIONS.includes(String(selectedOption).toUpperCase())
        ? String(selectedOption).toUpperCase()
        : null
    }))
    .sort((left, right) => left.questionNumber - right.questionNumber);
}

export function reasoningNotesPath(attemptId) {
  return `${API_BASE}/attempts/${encodeURIComponent(String(attemptId))}/reasoning-notes`;
}

export function reasoningNotesPayload(reasoningMap) {
  return [...reasoningMap.entries()]
    .map(([questionNumber, reasoningText]) => ({
      questionNumber: Number(questionNumber),
      reasoningText: typeof reasoningText === 'string' && reasoningText.trim() ? reasoningText : null
    }))
    .filter((note) => Number.isSafeInteger(note.questionNumber) && note.questionNumber > 0)
    .sort((left, right) => left.questionNumber - right.questionNumber);
}

export function normalizeReasoningNotes(payload) {
  const unwrapped = unwrapData(payload);
  // The route contract is `{ reasoning: envelope }`; accepting the historical
  // bare envelope keeps rolling deployments compatible in either direction.
  const root = isRecord(unwrapped.reasoning) ? unwrapped.reasoning : unwrapped;
  const source = Array.isArray(root.notes) ? root.notes : [];
  const notes = new Map();
  for (const note of source) {
    const questionNumber = finiteNumber(firstDefined(note?.questionNumber, note?.number));
    if (!Number.isSafeInteger(questionNumber) || questionNumber < 1) continue;
    notes.set(questionNumber, note?.reasoningText === null || note?.reasoningText === undefined
      ? ''
      : String(note.reasoningText));
  }
  const reasoningRevision = finiteNumber(root.reasoningRevision);
  const stateRevision = finiteNumber(root.stateRevision);
  return {
    attemptId: root.attemptId === null || root.attemptId === undefined ? null : String(root.attemptId),
    reasoningRevision: Number.isSafeInteger(reasoningRevision) && reasoningRevision >= 0 ? reasoningRevision : null,
    stateRevision: Number.isSafeInteger(stateRevision) && stateRevision >= 0 ? stateRevision : null,
    editable: root.editable === true,
    notes
  };
}

export function preserveDirtyReasoningNotes(serverNotes, localNotes, dirtyQuestionNumbers) {
  const merged = new Map(serverNotes);
  for (const questionNumber of dirtyQuestionNumbers) {
    if (localNotes.has(questionNumber)) merged.set(questionNumber, localNotes.get(questionNumber));
  }
  return merged;
}

export function reasoningEnvelopeMatchesAttempt(envelope, attemptId) {
  return Boolean(attemptId)
    && Boolean(envelope?.attemptId)
    && String(envelope.attemptId) === String(attemptId);
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(String(value)).byteLength;
}

export function reasoningRequestBodyBytes(revision, reasoningMap) {
  return utf8ByteLength(JSON.stringify({ revision, notes: reasoningNotesPayload(reasoningMap) }));
}

export function reasoningSaveBatches(reasoningMap, dirtyQuestionNumbers, revision, {
  maxNoteBytes = MAX_REASONING_NOTE_BYTES,
  maxTextBytes = MAX_REASONING_BATCH_TEXT_BYTES,
  maxBodyBytes = MAX_REASONING_REQUEST_BYTES
} = {}) {
  if (!Number.isSafeInteger(revision) || revision < 0) {
    throw new ApiError('The reasoning version is unavailable. Refresh before saving.', {
      code: 'REASONING_REVISION_MISSING'
    });
  }
  const encoder = new TextEncoder();
  const batches = [];
  let batch = new Map();
  let batchBytes = 0;
  const sortedNumbers = [...dirtyQuestionNumbers].sort((left, right) => Number(left) - Number(right));
  for (const questionNumber of sortedNumbers) {
    const text = String(reasoningMap.get(questionNumber) ?? '');
    const textBytes = encoder.encode(text).byteLength;
    if (textBytes > maxNoteBytes) {
      throw new ApiError(`Question ${questionNumber}'s approach is too long to save.`, {
        code: 'REASONING_NOTE_TOO_LARGE',
        payload: { questionNumber: Number(questionNumber), actualBytes: textBytes, maxBytes: maxNoteBytes }
      });
    }
    const candidate = new Map(batch);
    candidate.set(questionNumber, text);
    const exceedsBatch = batch.size > 0 && (
      batchBytes + textBytes > maxTextBytes
      || reasoningRequestBodyBytes(revision, candidate) > maxBodyBytes
    );
    if (exceedsBatch) {
      batches.push(batch);
      batch = new Map();
      batchBytes = 0;
    }
    batch.set(questionNumber, text);
    batchBytes += textBytes;
    if (batchBytes > maxTextBytes || reasoningRequestBodyBytes(revision, batch) > maxBodyBytes) {
      throw new ApiError(`Question ${questionNumber}'s approach cannot fit in a safe save request.`, {
        code: 'REASONING_REQUEST_TOO_LARGE',
        payload: { questionNumber: Number(questionNumber), maxBodyBytes, maxTextBytes }
      });
    }
  }
  if (batch.size) batches.push(batch);
  return batches;
}

export function isReasoningRevisionConflict(error) {
  return error instanceof ApiError && error.code === 'REASONING_REVISION_CONFLICT';
}

export function reasoningCapabilityNeedsReload(previousAttempt, nextAttempt) {
  if (!sameAttemptId(previousAttempt, nextAttempt)) return false;
  return !attemptAllowsReasoningEdits(previousAttempt) && attemptAllowsReasoningEdits(nextAttempt);
}

export function attemptSwitchNeedsReasoningFlush(currentAttemptId, nextAttemptId, dirtyCount, pendingCount = 0) {
  if (!currentAttemptId || String(currentAttemptId) === String(nextAttemptId || '')) return false;
  return Number(dirtyCount) > 0 || Number(pendingCount) > 0;
}

export function learningAnalysisProjection(payload) {
  const root = unwrapData(payload);
  const projection = firstDefined(
    root.learningSubmission,
    root.result?.learningSubmission,
    root.results?.learningSubmission,
    root.finalSubmission?.learningSubmission,
    null
  );
  if (!isRecord(projection)) return null;
  const analysisStatus = String(firstDefined(projection.analysisStatus, projection.analysis?.status, '')).toUpperCase();
  const status = String(firstDefined(projection.status, '')).toUpperCase();
  if (!analysisStatus && !status) return null;
  return { analysisStatus, status };
}

export function learningAnalysisDisplayStatus(projection) {
  const contextStatus = String(firstDefined(projection?.status, '')).toUpperCase();
  const analysisStatus = String(firstDefined(projection?.analysisStatus, '')).toUpperCase();
  return contextStatus === 'CONTEXT_UNAVAILABLE' ? contextStatus : (analysisStatus || contextStatus);
}

const LEARNING_REPORT_STATUSES = new Set([
  'CONTEXT_UNAVAILABLE', 'QUEUED', 'RUNNING', 'COMPLETE', 'PARTIAL', 'UNASSESSABLE', 'FAILED'
]);
const LEARNING_QUESTION_STATUSES = new Set(['SUCCEEDED', 'UNASSESSABLE', 'FAILED']);

function reportString(value, maximumLength = 20_000) {
  return typeof value === 'string' ? value.slice(0, maximumLength) : '';
}

function reportStringList(value) {
  return Array.isArray(value)
    ? value.slice(0, 25).map((item) => reportString(item, 2_000)).filter(Boolean)
    : [];
}

function reportCount(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 100 ? value : 0;
}

function normalizeLearningReportSummary(value) {
  if (!isRecord(value)) {
    return { totalQuestions: 0, analyzedCount: 0, unassessableCount: 0, failedCount: 0 };
  }
  const summary = {
    totalQuestions: reportCount(value.totalQuestions),
    analyzedCount: reportCount(value.analyzedCount),
    unassessableCount: reportCount(value.unassessableCount),
    failedCount: reportCount(value.failedCount)
  };
  const classified = summary.analyzedCount + summary.unassessableCount + summary.failedCount;
  if (classified > summary.totalQuestions) {
    return { totalQuestions: 0, analyzedCount: 0, unassessableCount: 0, failedCount: 0 };
  }
  return summary;
}

export function normalizeLearningReport(payload) {
  const unwrapped = unwrapData(payload);
  const root = isRecord(unwrapped.report) ? unwrapped.report : unwrapped;
  if (!isRecord(root)) return null;
  const rawStatus = String(root.status || '').toUpperCase();
  if (!LEARNING_REPORT_STATUSES.has(rawStatus)) return null;
  const questions = Array.isArray(root.questions) ? root.questions : [];
  return {
    // Identity and pin values are retained only for response validation and
    // diagnostics. Rendering uses the explicit pedagogical fields below.
    learningSubmissionId: root.learningSubmissionId == null ? null : String(root.learningSubmissionId),
    version: Number.isSafeInteger(finiteNumber(root.version)) ? finiteNumber(root.version) : null,
    status: rawStatus,
    generatedAt: root.generatedAt || null,
    summary: normalizeLearningReportSummary(root.summary),
    pins: isRecord(root.pins) ? root.pins : null,
    questions: questions.slice(0, 50).map((question) => {
      const questionNumber = finiteNumber(question?.questionNumber);
      if (!Number.isSafeInteger(questionNumber) || questionNumber < 1) return null;
      const questionStatus = String(question?.status || '').toUpperCase();
      const comparisons = Array.isArray(question?.solutionComparisons) ? question.solutionComparisons : [];
      return {
        questionNumber,
        status: LEARNING_QUESTION_STATUSES.has(questionStatus) ? questionStatus : 'UNASSESSABLE',
        reasoningVerdict: reportString(question?.reasoningVerdict, 2_000),
        summaryMarkdown: reportString(question?.summaryMarkdown),
        strengths: reportStringList(question?.strengths),
        gaps: reportStringList(question?.gaps),
        suggestions: reportStringList(question?.suggestions),
        solutionComparisons: comparisons.slice(0, 25).map((comparison) => ({
          // solutionId is deliberately omitted: ordinal labels are sufficient
          // for students and do not expose an internal content identifier.
          methodTags: reportStringList(comparison?.methodTags),
          alignment: reportString(comparison?.alignment, 1_000),
          analysisMarkdown: reportString(comparison?.analysisMarkdown)
        })),
        confidence: typeof question?.confidence === 'number'
          && Number.isFinite(question.confidence)
          && question.confidence >= 0
          && question.confidence <= 1
          ? question.confidence
          : null
      };
    }).filter(Boolean).sort((left, right) => left.questionNumber - right.questionNumber)
  };
}

export function learningReportApprovedSolutionCount(report) {
  return Array.isArray(report?.questions)
    ? report.questions.reduce((count, question) => count + (question.solutionComparisons?.length || 0), 0)
    : 0;
}

export function learningReportShouldPoll(status) {
  return ['QUEUED', 'RUNNING'].includes(String(status || '').toUpperCase());
}

export function learningReportStatusMessage(status) {
  return ({
    CONTEXT_UNAVAILABLE: 'Learning analysis is unavailable because the reference solutions have not yet been approved. Your objective score is final and unaffected.',
    QUEUED: 'Your learning analysis is queued. Your objective score is already final.',
    RUNNING: 'Your learning analysis is in progress. Your objective score is already final.',
    COMPLETE: 'Your learning analysis is complete.',
    PARTIAL: 'A partial learning analysis is available. Some questions could not be assessed.',
    UNASSESSABLE: 'There was not enough written reasoning to assess your approach reliably. Add more detail about what you tried on a future attempt.',
    FAILED: 'The learning analysis could not be completed. Refresh only checks its current status and does not restart AI processing.'
  })[String(status || '').toUpperCase()] || 'Checking for your learning analysis…';
}

export function learningReportContextMatches(context, attemptId, attemptEpoch, resultsVisible = true) {
  return Boolean(context)
    && Boolean(attemptId)
    && context.id === String(attemptId)
    && context.epoch === attemptEpoch
    && resultsVisible === true;
}

export function extractRevision(attempt) {
  return finiteNumber(firstDefined(
    attempt?.answerRevision,
    attempt?.answersRevision,
    attempt?.revision,
    attempt?.answerState?.revision
  ));
}

export function elapsedMsFromAttempt(attempt) {
  const milliseconds = finiteNumber(firstDefined(
    attempt?.elapsedActiveMs,
    attempt?.elapsedMs,
    attempt?.activeElapsedMs,
    attempt?.clock?.elapsedActiveMs,
    attempt?.timer?.elapsedMs
  ));
  if (milliseconds !== null) return Math.max(0, milliseconds);
  const seconds = finiteNumber(firstDefined(
    attempt?.elapsedActiveSeconds,
    attempt?.elapsedSeconds,
    attempt?.clock?.elapsedActiveSeconds,
    attempt?.timer?.elapsedSeconds
  ));
  return seconds === null ? 0 : Math.max(0, seconds * 1000);
}

export function durationMsFromAttempt(attempt) {
  const milliseconds = finiteNumber(firstDefined(
    attempt?.durationMs,
    attempt?.timeLimitMs,
    attempt?.clock?.durationMs,
    attempt?.form?.durationMs
  ));
  if (milliseconds !== null && milliseconds > 0) return milliseconds;
  const seconds = finiteNumber(firstDefined(
    attempt?.durationSeconds,
    attempt?.timeLimitSeconds,
    attempt?.clock?.durationSeconds,
    attempt?.form?.durationSeconds
  ));
  return seconds !== null && seconds > 0 ? seconds * 1000 : DEFAULT_DURATION_MS;
}

export function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor((finiteNumber(milliseconds, 0) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatScore(value) {
  const score = finiteNumber(value);
  if (score === null) return '—';
  return Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function scoreFromSubmission(submission) {
  return firstDefined(
    submission?.score?.totalPoints,
    submission?.score?.points,
    submission?.totalScore,
    submission?.points,
    submission?.result?.score?.totalPoints,
    submission?.result?.score,
    null
  );
}

export function maximumScoreFromSubmission(submission) {
  return firstDefined(
    submission?.score?.maximumPoints,
    submission?.maximumScore,
    submission?.result?.score?.maximumPoints,
    null
  );
}

export function submissionsFrom(value) {
  const root = unwrapData(value);
  const candidates = [root.submissions, root.result?.submissions, root.results?.submissions, root.attempt?.submissions];
  return candidates.find(Array.isArray) || [];
}

export function latestSubmissionOfKind(attempt, kind) {
  const expected = String(kind).toUpperCase();
  return submissionsFrom(attempt)
    .filter((submission) => String(firstDefined(submission?.kind, submission?.type, '')).toUpperCase() === expected)
    .sort((left, right) => timestampMs(right) - timestampMs(left))[0] || null;
}

/** The manual checkpoint and the automatic 75-minute snapshot share one slot. */
export function hasUsedPreliminarySubmission(attempt) {
  return Boolean(
    latestSubmissionOfKind(attempt, 'CHECKPOINT')
    || latestSubmissionOfKind(attempt, 'DEADLINE')
  );
}

/**
 * A score-producing mutation must name the exact answer sheet and attempt
 * state the student reviewed. This prevents a stale browser tab from scoring
 * a different tab's unseen answer sheet.
 */
export function submissionPrecondition(attempt) {
  const expectedAnswersRevision = answerRevisionFromAttempt(attempt);
  const expectedStateRevision = stateRevisionFromAttempt(attempt);
  if (expectedAnswersRevision === null || expectedStateRevision === null) return null;
  return { expectedAnswersRevision, expectedStateRevision };
}

export function timestampMs(value) {
  const raw = firstDefined(value?.createdAt, value?.submittedAt, value?.occurredAt, value?.at, value);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const parsed = Date.parse(String(raw || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDateTime(value) {
  const milliseconds = timestampMs(value);
  if (!milliseconds) return 'Saved submission';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(milliseconds));
}

export function idempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const random = Math.random().toString(36).slice(2);
  return `amc-${Date.now().toString(36)}-${random}`;
}

/**
 * Keep a caller-provided mutation key stable across retries.  In particular,
 * resetAttempt deliberately supplies one key twice when its first response is
 * lost, so generating a fresh key here would turn a retry into a second reset.
 */
export function idempotencyHeaderValue(idempotency, generate = idempotencyKey) {
  if (!idempotency) return null;
  return typeof idempotency === 'string' ? idempotency : generate();
}

export function safeUrl(value, baseUrl = globalThis.location?.href || globalThis.location?.origin || 'http://localhost/') {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    if (url.protocol === 'data:' && /^data:image\/(?:png|gif|jpe?g|webp);/i.test(value)) return url.href;
  } catch {
    // A malformed URL is rendered as text rather than as a link or image.
  }
  return null;
}

class ApiClient {
  constructor({ onCsrfToken, onUnauthorized } = {}) {
    this.onCsrfToken = onCsrfToken;
    this.onUnauthorized = onUnauthorized;
    this.csrfToken = null;
  }

  setCsrfToken(token) {
    this.csrfToken = token || null;
  }

  async request(path, { method = 'GET', body, rawBody, contentType: requestContentType,
    idempotency = false, signal } = {}) {
    const headers = { Accept: 'application/json', 'Cache-Control': 'no-store' };
    if (rawBody !== undefined) headers['Content-Type'] = requestContentType || 'application/octet-stream';
    else if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (this.csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = this.csrfToken;
    const mutationKey = !['GET', 'HEAD', 'OPTIONS'].includes(method)
      ? idempotencyHeaderValue(idempotency)
      : null;
    if (mutationKey) headers['Idempotency-Key'] = mutationKey;

    let response;
    try {
      response = await fetch(path.startsWith('/') ? path : `${API_BASE}${path}`, {
        method,
        headers,
        body: rawBody !== undefined ? rawBody : (body === undefined ? undefined : JSON.stringify(body)),
        credentials: 'include',
        cache: 'no-store',
        redirect: 'error',
        signal
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to reach the practice service. Check your connection and try again.', {
        code: 'NETWORK_ERROR',
        payload: error
      });
    }

    const headerToken = response.headers.get('x-csrf-token') || response.headers.get('x-amc12-csrf-token');
    if (headerToken) this.captureCsrfToken(headerToken);

    let payload = null;
    const contentType = response.headers.get('content-type') || '';
    try {
      if (response.status !== 204) payload = contentType.includes('json') ? await response.json() : await response.text();
    } catch {
      payload = null;
    }

    if (isRecord(payload)) {
      const token = firstDefined(payload.csrfToken, payload.data?.csrfToken, payload.auth?.csrfToken);
      if (token) this.captureCsrfToken(token);
    }

    if (!response.ok) {
      const errorDetails = isRecord(payload) ? firstDefined(payload.error, payload) : {};
      const message = String(firstDefined(errorDetails?.message, payload?.message, `Request failed (${response.status}).`));
      const error = new ApiError(message, {
        status: response.status,
        code: String(firstDefined(errorDetails?.code, payload?.code, 'REQUEST_FAILED')),
        payload
      });
      if (response.status === 401) this.onUnauthorized?.(error);
      throw error;
    }
    return payload;
  }

  captureCsrfToken(token) {
    this.csrfToken = token;
    this.onCsrfToken?.(token);
  }

  get(path) { return this.request(path); }
  post(path, body = {}, options = {}) { return this.request(path, { method: 'POST', body, idempotency: true, ...options }); }
  put(path, body = {}, options = {}) { return this.request(path, { method: 'PUT', body, idempotency: true, ...options }); }
  putBinary(path, rawBody, options = {}) {
    return this.request(path, {
      method: 'PUT', rawBody, contentType: 'application/octet-stream', idempotency: true, ...options
    });
  }
  delete(path, options = {}) { return this.request(path, { method: 'DELETE', ...options }); }
}

const state = {
  student: null,
  forms: [],
  attemptHistory: [],
  attemptHistoryLoaded: false,
  attemptHistoryLoadError: false,
  practiceEntryIntent: null,
  attempt: null,
  questions: [],
  answers: new Map(),
  dirtyAnswers: new Set(),
  answerRevision: null,
  reasoningNotes: new Map(),
  dirtyReasoning: new Set(),
  reasoningRevision: null,
  reasoningEditable: false,
  reasoningLoaded: false,
  reasoningSaveQueue: Promise.resolve(),
  reasoningDebounceTimer: null,
  reasoningSaveRequested: false,
  pendingReasoningSaveCount: 0,
  lastReasoningSaveError: null,
  reasoningLoadError: null,
  attemptEpoch: 0,
  currentQuestionIndex: 0,
  saveQueue: Promise.resolve(),
  pendingSaveCount: 0,
  lastSaveError: null,
  timerBaseMs: 0,
  timerSyncedAt: 0,
  timerInterval: null,
  pollInterval: null,
  polling: false,
  deadlineRefreshInFlight: false,
  deadlineRefreshNotBefore: 0,
  localDeadlineLocked: false,
  modal: null,
  lastFocused: null,
  formCache: new Map(),
  resultPayload: null,
  solutionsPayload: null,
  learningSubmission: null,
  learningReport: null,
  learningReportLoadError: null,
  learningReportPollTimer: null,
  learningReportPollCount: 0,
  learningReportRequestInFlight: false,
  resultsViewMode: null,
  batchReviewWorkspace: null,
  batchReviewOpenSequence: 0,
  batchReviewOpenPromise: null,
  batchEpoch: 0,
  batchPollTimer: null,
  activeBatchId: null,
  learningHistoryEpoch: 0,
  learningHistoryItems: [],
  learningHistoryNextCursor: null,
  learningHistorySubmission: null,
  learningHistoryVersion: null,
  learningHistoryReport: null,
  learningHistoryQuestion: null,
  learningHistoryReportPollTimer: null,
  learningHistoryReportPollCount: 0,
  tutorPollTimer: null,
  tutorLoadSequence: 0,
  tutorListSequence: 0,
  tutorSelectedThreadId: null,
  deletedTutorThreadIds: new Set(),
  tutorForkRequired: false,
  tutorThreads: [],
  tutorNextCursor: null,
  tutorThread: null
};

let elements = null;
let api = null;
// The MathJax bundle can finish after the UI has rendered its first question.
// Keep readiness separately so the event is not lost when it fires before the
// DOMContentLoaded bootstrap handler has populated `elements`.
let mathJaxReady = typeof window !== 'undefined' && Boolean(window.MathJax?.typesetPromise);

function getElements() {
  const byId = (id) => document.getElementById(id);
  return {
    loadingView: byId('loading-view'), loginView: byId('login-view'), dashboardView: byId('dashboard-view'),
    practiceView: byId('practice-view'), resultsView: byId('results-view'), learningHistoryView: byId('learning-history-view'),
    userName: byId('user-name'), learningHistoryButton: byId('learning-history-button'), dashboardButton: byId('dashboard-button'), logoutButton: byId('logout-button'),
    globalStatus: byId('global-status'), globalError: byId('global-error'), globalErrorMessage: byId('global-error-message'),
    globalErrorDismiss: byId('global-error-dismiss'), loginForm: byId('login-form'), loginAccessCode: byId('login-access-code'),
    loginSubmit: byId('login-submit'), loginError: byId('login-error'), formsList: byId('forms-list'), formsEmpty: byId('forms-empty'),
    refreshForms: byId('refresh-forms-button'), formLabel: byId('form-label'), attemptTitle: byId('attempt-title'),
    attemptState: byId('attempt-state'), timerValue: byId('timer-value'), timerLimit: byId('timer-limit'),
    timerCard: document.querySelector('.timer-card'), pauseButton: byId('pause-button'), resumeButton: byId('resume-button'),
    saveStatus: byId('save-status'), practiceResetButton: byId('practice-reset-button'), checkpointButton: byId('checkpoint-button'), finalButton: byId('final-button'),
    questionNav: byId('question-nav'), answeredCount: byId('answered-count'), questionPosition: byId('question-position'),
    questionSaveIndicator: byId('question-save-indicator'), questionContent: byId('question-content'), answerForm: byId('answer-form'),
    answerOptions: byId('answer-options'), previousQuestion: byId('previous-question'), clearAnswerButton: byId('clear-answer-button'), nextQuestion: byId('next-question'),
    reasoningInput: byId('reasoning-input'), reasoningSaveStatus: byId('reasoning-save-status'), saveReasoningButton: byId('save-reasoning-button'), reloadReasoningButton: byId('reload-reasoning-button'),
    resultsEyebrow: byId('results-eyebrow'), resultsTitle: byId('results-title'), resultsSummary: byId('results-summary'),
    timedResultOnly: [...document.querySelectorAll('[data-timed-result-only]')],
    finalScore: byId('final-score'), scoreDetails: byId('score-details'),
    analysisSummary: byId('analysis-summary'), analysisStatus: byId('analysis-status'), analysisMeta: byId('analysis-meta'),
    analysisReportSummary: byId('analysis-report-summary'), analysisQuestions: byId('analysis-questions'), refreshAnalysisButton: byId('refresh-analysis-button'),
    submissionHistory: byId('submission-history'), resultsQuestions: byId('results-questions'), solutionsList: byId('solutions-list'),
    expandSolutions: byId('expand-solutions-button'), resetButton: byId('reset-button'), resultsDashboardButton: byId('results-dashboard-button'),
    batchLearningSection: byId('batch-learning-section'), batchUploadForm: byId('batch-upload-form'),
    batchFiles: byId('batch-files'), batchSelectedFiles: byId('batch-selected-files'),
    batchSubmitButton: byId('batch-submit-button'), batchStatus: byId('batch-status'), batchWorkspace: byId('batch-workspace'),
    learningHistoryBackButton: byId('learning-history-back-button'), refreshLearningHistoryButton: byId('refresh-learning-history-button'),
    learningHistoryStatus: byId('learning-history-status'), learningHistoryList: byId('learning-history-list'),
    learningHistoryLoadMore: byId('learning-history-load-more'),
    learningHistoryDetail: byId('learning-history-detail'), learningHistoryDetailTitle: byId('learning-history-detail-title'),
    learningHistoryDetailSource: byId('learning-history-detail-source'), closeLearningHistoryDetail: byId('close-learning-history-detail'),
    learningHistoryVersions: byId('learning-history-versions'), learningVersionReport: byId('learning-version-report'),
    learningVersionReportMeta: byId('learning-version-report-meta'), learningVersionReportStatus: byId('learning-version-report-status'),
    learningVersionReportSummary: byId('learning-version-report-summary'), learningVersionQuestions: byId('learning-version-questions'),
    closeLearningVersionReport: byId('close-learning-version-report'), learningQuestionDetail: byId('learning-question-detail'),
    learningQuestionMeta: byId('learning-question-meta'), learningQuestionTitle: byId('learning-question-title'),
    learningQuestionPrompt: byId('learning-question-prompt'), learningQuestionChoices: byId('learning-question-choices'),
    learningQuestionResponse: byId('learning-question-response'), learningQuestionAnalysis: byId('learning-question-analysis'),
    closeLearningQuestion: byId('close-learning-question'), tutorStatus: byId('tutor-status'),
    tutorThreadList: byId('tutor-thread-list'), tutorThread: byId('tutor-thread'), tutorMessages: byId('tutor-messages'),
    tutorLoadMore: byId('tutor-load-more'),
    tutorRequests: byId('tutor-requests'), createTutorThread: byId('create-tutor-thread'), forkTutorThread: byId('fork-tutor-thread'),
    deleteTutorThread: byId('delete-tutor-thread'), tutorMessageForm: byId('tutor-message-form'), tutorMessage: byId('tutor-message'),
    sendTutorMessage: byId('send-tutor-message'),
    modalBackdrop: byId('modal-backdrop'), modal: byId('modal'), modalTitle: byId('modal-title'), modalMessage: byId('modal-message'),
    modalActions: byId('modal-actions'), modalClose: byId('modal-close')
  };
}

function showOnly(view) {
  const views = [elements.loadingView, elements.loginView, elements.dashboardView, elements.practiceView,
    elements.resultsView, elements.learningHistoryView];
  views.forEach((candidate) => { candidate.hidden = candidate !== view; });
  if (view !== elements.practiceView) stopAttemptSync();
  if (view !== elements.resultsView) stopLearningReportPolling();
  if (view !== elements.resultsView) stopBatchPolling();
  if (view !== elements.learningHistoryView) purgeTutorWorkspace({ clearSummaries: true });
}

function configureResultsView(mode, { form = null, workspace = null } = {}) {
  const timed = mode === 'TIMED_RESULT';
  state.resultsViewMode = mode;
  elements.timedResultOnly.forEach((node) => { node.hidden = !timed; });
  elements.resultsEyebrow.textContent = timed ? 'Final submission' : 'Batch review workspace';
  elements.resultsTitle.textContent = timed
    ? 'Your results'
    : String(firstDefined(form?.title, workspace?.form?.title, 'Batch file submission'));
  if (!timed) {
    elements.resultsSummary.textContent = `Exact form version ${String(workspace?.formVersion ?? form?.version ?? '—')}. Upload answers and approaches without starting a timed attempt.`;
  }
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function appendText(node, value) {
  node.appendChild(document.createTextNode(String(value ?? '')));
}

function setButtonBusy(button, busy, label = null) {
  if (!button) return;
  if (busy) {
    button.dataset.originalLabel ??= button.textContent;
    button.disabled = true;
    if (label) button.textContent = label;
  } else {
    button.disabled = false;
    if (button.dataset.originalLabel) {
      button.textContent = button.dataset.originalLabel;
      delete button.dataset.originalLabel;
    }
  }
}

function showStatus(message, { persistent = false } = {}) {
  if (!message) {
    elements.globalStatus.hidden = true;
    elements.globalStatus.textContent = '';
    return;
  }
  elements.globalStatus.textContent = message;
  elements.globalStatus.hidden = false;
  if (!persistent) {
    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => showStatus(''), 4500);
  }
}

function showError(message, { persistent = false } = {}) {
  elements.globalErrorMessage.textContent = message;
  elements.globalError.hidden = false;
  if (!persistent) {
    window.clearTimeout(showError.timeout);
    showError.timeout = window.setTimeout(() => hideError(), 8500);
  }
}

function hideError() {
  elements.globalError.hidden = true;
  elements.globalErrorMessage.textContent = '';
}

function clearLoginError() {
  elements.loginError.hidden = true;
  elements.loginError.textContent = '';
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.hidden = false;
}

function updateHeader() {
  const signedIn = Boolean(state.student);
  elements.userName.hidden = !signedIn;
  elements.learningHistoryButton.hidden = !signedIn;
  elements.dashboardButton.hidden = !signedIn;
  elements.logoutButton.hidden = !signedIn;
  elements.userName.textContent = signedIn ? String(firstDefined(state.student.displayName, state.student.name, state.student.id, 'Student')) : '';
}

function setStudent(payload) {
  const root = unwrapData(payload);
  const student = firstDefined(root.student, root.user, null);
  state.student = isRecord(student) ? student : null;
  const token = firstDefined(root.csrfToken, root.auth?.csrfToken, null);
  if (token) api.setCsrfToken(token);
  updateHeader();
}

function setCsrfToken(token) {
  if (token) api.setCsrfToken(token);
}

function clearSensitiveDom() {
  for (const node of [
    elements.formsList, elements.questionNav, elements.questionContent, elements.answerOptions,
    elements.submissionHistory, elements.resultsQuestions, elements.solutionsList,
    elements.analysisReportSummary, elements.analysisQuestions, elements.batchSelectedFiles, elements.batchWorkspace,
    elements.learningHistoryList, elements.learningHistoryVersions, elements.learningVersionReportSummary,
    elements.learningVersionQuestions, elements.learningQuestionPrompt, elements.learningQuestionChoices,
    elements.learningQuestionResponse, elements.learningQuestionAnalysis, elements.tutorThreadList,
    elements.tutorMessages, elements.tutorRequests, elements.modalMessage, elements.modalActions
  ]) {
    if (node) clearNode(node);
  }
  for (const node of [
    elements.formLabel, elements.attemptTitle, elements.attemptState, elements.saveStatus,
    elements.questionPosition, elements.questionSaveIndicator, elements.reasoningSaveStatus,
    elements.resultsEyebrow, elements.resultsTitle, elements.resultsSummary, elements.finalScore, elements.scoreDetails, elements.analysisStatus,
    elements.analysisMeta, elements.batchStatus, elements.learningHistoryStatus,
    elements.learningHistoryDetailSource, elements.learningVersionReportMeta,
    elements.learningVersionReportStatus, elements.learningQuestionMeta, elements.tutorStatus,
    elements.learningHistoryDetailTitle, elements.learningQuestionTitle, elements.modalTitle
  ]) {
    if (node) node.textContent = '';
  }
  elements.reasoningInput.value = '';
  elements.batchUploadForm.reset();
  elements.tutorMessageForm.reset();
  elements.loginForm.reset();
  setButtonBusy(elements.batchSubmitButton, false);
  setButtonBusy(elements.tutorLoadMore, false);
  setButtonBusy(elements.createTutorThread, false);
  setButtonBusy(elements.sendTutorMessage, false);
  setButtonBusy(elements.forkTutorThread, false);
  elements.analysisSummary.hidden = true;
  elements.tutorThread.hidden = true;
  elements.learningHistoryDetail.hidden = true;
  elements.learningVersionReport.hidden = true;
  elements.learningQuestionDetail.hidden = true;
}

function localSignOut({ message = null } = {}) {
  hideModal({ force: true });
  stopLearningHistoryReportPolling();
  stopTutorPolling({ invalidate: false });
  state.student = null;
  state.forms = [];
  state.attemptHistory = [];
  state.attemptHistoryLoaded = false;
  state.attemptHistoryLoadError = false;
  state.formCache.clear();
  clearAttemptState();
  resetLearningTutorState(state);
  clearSensitiveDom();
  api.setCsrfToken(null);
  updateHeader();
  showOnly(elements.loginView);
  showStatus('');
  hideError();
  clearLoginError();
  if (message) showLoginError(message);
  window.setTimeout(() => elements.loginAccessCode.focus(), 0);
}

function clearAttemptState() {
  stopAttemptSync();
  stopLearningReportPolling();
  if (state.reasoningDebounceTimer) window.clearTimeout(state.reasoningDebounceTimer);
  // A response or save from a prior attempt must never be applied to a newly
  // opened attempt.  Resetting the queue lets the replacement start promptly;
  // the old closures retain their epoch and become harmless no-ops.
  state.attemptEpoch += 1;
  state.saveQueue = Promise.resolve();
  state.attempt = null;
  state.questions = [];
  state.answers = new Map();
  state.dirtyAnswers = new Set();
  state.answerRevision = null;
  state.reasoningNotes = new Map();
  state.dirtyReasoning = new Set();
  state.reasoningRevision = null;
  state.reasoningEditable = false;
  state.reasoningLoaded = false;
  state.reasoningSaveQueue = Promise.resolve();
  state.reasoningDebounceTimer = null;
  state.reasoningSaveRequested = false;
  state.pendingReasoningSaveCount = 0;
  state.lastReasoningSaveError = null;
  state.reasoningLoadError = null;
  state.currentQuestionIndex = 0;
  state.pendingSaveCount = 0;
  state.lastSaveError = null;
  state.deadlineRefreshInFlight = false;
  state.deadlineRefreshNotBefore = 0;
  state.localDeadlineLocked = false;
  state.resultPayload = null;
  state.solutionsPayload = null;
  state.learningSubmission = null;
  state.learningReport = null;
  state.learningReportLoadError = null;
  state.learningReportPollCount = 0;
  state.learningReportRequestInFlight = false;
  state.batchReviewOpenSequence += 1;
  state.batchReviewWorkspace = null;
  state.resultsViewMode = null;
  stopBatchPolling();
  state.activeBatchId = null;
}

function handleUnauthorized() {
  if (!state.student) return;
  localSignOut({ message: 'Your session has expired. Sign in again to continue.' });
}

function handleError(error, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError && error.status === 401) return;
  const message = error instanceof ApiError ? error.message : fallback;
  showError(message || fallback);
}

async function handleAttemptMutationError(error, fallback) {
  if (error instanceof ApiError && state.attempt && error.code === 'ANSWER_REVISION_CONFLICT') {
    await reconcileAfterRevisionConflict();
    return;
  }
  if (error instanceof ApiError && state.attempt && ['LIMIT_NOTICE_REQUIRED', 'INVALID_STATE'].includes(error.code)) {
    await reconcileStateConflict(error);
    return;
  }
  handleError(error, fallback);
}

function isAttemptActive(attempt = state.attempt) {
  const phase = normalizePhase(attempt);
  return ['TIMED', 'LIMIT_NOTICE', 'OVERTIME'].includes(phase);
}

export function attemptAllowsAnswerEdits(attempt) {
  return ['TIMED', 'OVERTIME'].includes(normalizePhase(attempt)) && normalizeClockState(attempt) === 'RUNNING';
}

export function attemptAllowsReasoningEdits(attempt) {
  return attemptAllowsAnswerEdits(attempt);
}

/**
 * The server remains authoritative, but the browser must stop accepting a
 * click as soon as its server-synchronized display clock reaches 75 minutes.
 * It then immediately reconciles with the server instead of waiting for the
 * ordinary background poll. Overtime deliberately stays editable.
 */
export function timedLimitLocallyReached(attempt, elapsedMs) {
  if (normalizePhase(attempt) !== 'TIMED' || normalizeClockState(attempt) !== 'RUNNING') return false;
  const elapsed = finiteNumber(elapsedMs);
  return elapsed !== null && elapsed >= durationMsFromAttempt(attempt);
}

export function attemptCanBeReset(attempt) {
  return Boolean(attempt?.id) && ['TIMED', 'LIMIT_NOTICE', 'OVERTIME', 'FINALIZED'].includes(normalizePhase(attempt));
}

function canEditAnswers(attempt = state.attempt) {
  if (!attemptAllowsAnswerEdits(attempt)) return false;
  const elapsed = sameAttemptId(attempt, state.attempt) ? currentElapsedMs() : elapsedMsFromAttempt(attempt);
  return !timedLimitLocallyReached(attempt, elapsed);
}

function canEditReasoning(attempt = state.attempt) {
  return state.reasoningLoaded && state.reasoningEditable && canEditAnswers(attempt);
}

function attemptContext() {
  if (!state.attempt?.id) return null;
  return { id: String(state.attempt.id), epoch: state.attemptEpoch };
}

function isCurrentAttemptContext(context) {
  return Boolean(context)
    && context.epoch === state.attemptEpoch
    && String(state.attempt?.id || '') === context.id;
}

function mergeAttemptResult(payload, { preferLocalAnswers = true } = {}) {
  const candidate = extractAttempt(payload);
  if (!isRecord(candidate) || !candidate.id) return { attempt: state.attempt, applied: false };
  // Ignore an in-flight response for a different attempt. This is important
  // when a student opens/reset another test before a poll or mutation returns.
  if (state.attempt?.id && !sameAttemptId(state.attempt, candidate)) return { attempt: state.attempt, applied: false };
  if (state.attempt?.id && saveResponseNeedsReconciliation(state.attempt, candidate)) return { attempt: state.attempt, applied: false };
  state.attempt = candidate;
  const serverAnswers = answerMapFromAttempt(candidate);
  if (!preferLocalAnswers || state.dirtyAnswers.size === 0) {
    state.answers = serverAnswers;
  } else {
    for (const [number, option] of serverAnswers) {
      if (!state.dirtyAnswers.has(number)) state.answers.set(number, option);
    }
  }
  const revision = extractRevision(candidate);
  if (revision !== null) state.answerRevision = revision;
  syncTimer(candidate);
  return { attempt: candidate, applied: true };
}

function mergeAttempt(payload, options = {}) {
  return mergeAttemptResult(payload, options).attempt;
}

function extractFormId(attempt = state.attempt) {
  return firstDefined(attempt?.formId, attempt?.form?.id, attempt?.examFormId, attempt?.revisionId, null);
}

function extractFormVersion(attempt = state.attempt) {
  return firstDefined(attempt?.formVersion, attempt?.form?.version, attempt?.examFormVersion, null);
}

function formFromPayload(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.form, root.examForm, isRecord(root) && root.id && (root.questions || root.title) ? root : null);
}

function formForAttempt(attempt = state.attempt) {
  const id = extractFormId(attempt);
  const version = extractFormVersion(attempt);
  const embedded = firstDefined(attempt?.form, attempt?.examForm, null);
  if (isRecord(embedded) && Array.isArray(embedded.questions)
      && (version === null || version === undefined || String(embedded.version) === String(version))) return embedded;
  const cacheKey = formCacheKey(id, version);
  if (id && state.formCache.has(cacheKey)) return state.formCache.get(cacheKey);
  return state.forms.find((form) => String(form.id) === String(id)
    && (version === null || version === undefined || String(form.version) === String(version))) || embedded || null;
}

async function ensureQuestions(payload = null) {
  const candidates = extractQuestions(payload, state.attempt);
  if (candidates.length) {
    state.questions = candidates.map(normalizeQuestion).sort((left, right) => left.number - right.number);
    return state.questions;
  }
  const form = formForAttempt();
  if (form?.questions?.length) {
    state.questions = form.questions.map(normalizeQuestion).sort((left, right) => left.number - right.number);
    return state.questions;
  }
  const formId = extractFormId();
  const formVersion = extractFormVersion();
  if (!formId) throw new ApiError('This attempt has no linked form.', { code: 'FORM_NOT_FOUND' });
  // This owner-scoped route pins the content revision captured by the
  // attempt, even if a newer revision is published or this old revision is no
  // longer publicly listed. Never substitute the latest public form here.
  const response = state.attempt?.id
    ? await api.get(attemptFormPath(state.attempt.id))
    : await api.get(publicFormPath(formId, formVersion));
  const loadedForm = formFromPayload(response);
  if (!loadedForm) throw new ApiError('The practice form could not be loaded.', { code: 'FORM_NOT_FOUND' });
  if (String(loadedForm.id) !== String(formId)
      || (formVersion !== null && formVersion !== undefined && String(loadedForm.version) !== String(formVersion))) {
    throw new ApiError('The practice form revision does not match this saved attempt.', { code: 'FORM_VERSION_MISMATCH' });
  }
  state.formCache.set(formCacheKey(formId, firstDefined(loadedForm.version, formVersion)), loadedForm);
  const questions = extractQuestions(response, state.attempt);
  if (!questions.length) throw new ApiError('The practice form contains no questions.', { code: 'FORM_EMPTY' });
  state.questions = questions.map(normalizeQuestion).sort((left, right) => left.number - right.number);
  return state.questions;
}

function syncTimer(attempt) {
  state.timerBaseMs = elapsedMsFromAttempt(attempt);
  state.timerSyncedAt = Date.now();
}

function currentElapsedMs() {
  if (!state.attempt) return 0;
  const running = normalizeClockState(state.attempt) === 'RUNNING';
  return state.timerBaseMs + (running ? Math.max(0, Date.now() - state.timerSyncedAt) : 0);
}

function renderTimer() {
  if (!state.attempt) return;
  const elapsed = currentElapsedMs();
  const duration = durationMsFromAttempt(state.attempt);
  const phase = normalizePhase(state.attempt);
  const clock = normalizeClockState(state.attempt);
  const localTimedLimit = timedLimitLocallyReached(state.attempt, elapsed);
  elements.timerValue.textContent = formatDuration(elapsed);
  elements.timerValue.dateTime = `PT${Math.floor(elapsed / 1000)}S`;
  elements.timerLimit.textContent = `of ${formatDuration(duration)}`;
  elements.timerCard.classList.toggle('is-paused', clock === 'PAUSED');
  elements.timerCard.classList.toggle('is-limit', phase === 'LIMIT_NOTICE' || phase === 'OVERTIME' || localTimedLimit);
  if (localTimedLimit) {
    if (!state.localDeadlineLocked) {
      // Disable the currently visible radios before the reconciliation GET
      // returns. `canEditAnswers()` applies the same guard to an event that
      // races this one-second display tick.
      state.localDeadlineLocked = true;
      if (!elements.practiceView.hidden) renderCurrentQuestion();
    }
    requestDeadlineReconciliation();
  } else {
    state.localDeadlineLocked = false;
  }
}

function startAttemptSync() {
  stopAttemptSync();
  renderTimer();
  state.timerInterval = window.setInterval(renderTimer, 1000);
  state.pollInterval = window.setInterval(() => {
    if (!document.hidden) refreshAttempt({ quiet: true });
  }, 15000);
}

function stopAttemptSync() {
  if (state.timerInterval) window.clearInterval(state.timerInterval);
  if (state.pollInterval) window.clearInterval(state.pollInterval);
  state.timerInterval = null;
  state.pollInterval = null;
  state.polling = false;
}

function stopLearningReportPolling() {
  if (state.learningReportPollTimer) window.clearTimeout(state.learningReportPollTimer);
  state.learningReportPollTimer = null;
}

function attemptStateText(attempt = state.attempt) {
  const phase = normalizePhase(attempt);
  const clock = normalizeClockState(attempt);
  if (phase === 'TIMED' && clock === 'PAUSED') return 'Timer paused';
  if (phase === 'TIMED') return 'Timed practice in progress';
  if (phase === 'LIMIT_NOTICE') return 'The 75-minute time limit has been reached';
  if (phase === 'OVERTIME') return 'Continuing after the 75-minute time limit';
  if (phase === 'FINALIZED') return 'Final submission complete';
  if (phase === 'RESET') return 'This attempt has been reset';
  return 'Practice attempt';
}

function renderAttemptHeader() {
  const form = formForAttempt();
  const phase = normalizePhase(state.attempt);
  const clock = normalizeClockState(state.attempt);
  const title = firstDefined(form?.title, state.attempt?.formTitle, state.attempt?.title, 'AMC 12 practice test');
  const label = firstDefined(
    form?.paper,
    form?.label,
    form?.practiceKind === 'archive' ? 'AMC 12 archive practice' : undefined,
    state.attempt?.formLabel,
    'AMC 12 practice'
  );
  elements.formLabel.textContent = String(label);
  elements.attemptTitle.textContent = String(title);
  elements.attemptState.textContent = attemptStateText();
  elements.pauseButton.hidden = clock !== 'RUNNING' || !isAttemptActive();
  elements.resumeButton.hidden = clock !== 'PAUSED' || !isAttemptActive();
  elements.pauseButton.disabled = phase === 'LIMIT_NOTICE';
  elements.resumeButton.disabled = phase === 'LIMIT_NOTICE';
  const checkpoint = latestSubmissionOfKind(state.attempt, 'CHECKPOINT');
  const deadline = latestSubmissionOfKind(state.attempt, 'DEADLINE');
  elements.checkpointButton.disabled = !isAttemptActive() || hasUsedPreliminarySubmission(state.attempt) || phase === 'LIMIT_NOTICE';
  elements.checkpointButton.textContent = checkpoint ? 'Score checked' : deadline ? 'Time-limit score saved' : 'Check score';
  elements.finalButton.disabled = !isAttemptActive();
  elements.finalButton.textContent = phase === 'LIMIT_NOTICE' ? 'Stop and submit' : 'Submit final answers';
  elements.practiceResetButton.disabled = !attemptCanBeReset(state.attempt);
  renderTimer();
}

function renderSaveStatus() {
  const hasError = Boolean(state.lastSaveError || state.lastReasoningSaveError);
  const saving = state.pendingSaveCount > 0 || state.pendingReasoningSaveCount > 0;
  const text = hasError ? 'Changes not saved — retry before submitting' : saving ? 'Saving changes…' : 'All changes saved';
  [elements.saveStatus, elements.questionSaveIndicator].forEach((node) => {
    node.textContent = node === elements.questionSaveIndicator && !saving && !hasError ? '' : text;
    node.classList.toggle('is-saving', saving);
    node.classList.toggle('is-error', hasError);
  });
  renderReasoningSaveStatus();
}

function renderReasoningSaveStatus() {
  if (!elements?.reasoningSaveStatus) return;
  const saving = state.pendingReasoningSaveCount > 0;
  const hasError = Boolean(state.lastReasoningSaveError);
  elements.reasoningSaveStatus.textContent = state.reasoningLoadError
    ? 'Notes unavailable'
    : hasError
      ? 'Not saved'
      : saving
        ? 'Saving…'
        : state.dirtyReasoning.size > 0
          ? 'Unsaved changes'
          : '';
  elements.reasoningSaveStatus.classList.toggle('is-saving', saving);
  elements.reasoningSaveStatus.classList.toggle('is-error', hasError || Boolean(state.reasoningLoadError));
  elements.reloadReasoningButton.hidden = !state.reasoningLoadError;
  elements.reloadReasoningButton.disabled = saving;
}

function renderQuestionNavigation() {
  clearNode(elements.questionNav);
  const current = state.questions[state.currentQuestionIndex];
  const answered = state.questions.filter((question) => Boolean(state.answers.get(question.number))).length;
  elements.answeredCount.textContent = `${answered} of ${state.questions.length} answered`;
  for (const [index, question] of state.questions.entries()) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(question.number);
    button.title = `Question ${question.number}${state.answers.get(question.number) ? ', answered' : ''}`;
    if (current?.number === question.number) button.setAttribute('aria-current', 'step');
    if (state.answers.get(question.number)) button.classList.add('is-answered');
    button.addEventListener('click', () => goToQuestion(index, { focus: true }));
    item.appendChild(button);
    elements.questionNav.appendChild(item);
  }
}

// Historical AoPS conversions occasionally lose only the surrounding math
// delimiters, leaving otherwise valid commands such as \clubsuit,
// \overline{AB}, or \frac{1}{2} in ordinary prose. Keep authored math spans
// untouched, but place a narrow whitelist of these orphaned fragments into
// MathJax inline delimiters. This is presentation recovery only: it neither
// changes the stored question nor interprets HTML.
const LEGACY_TEX_COMMANDS = new Set([
  'angle', 'arctan', 'Bbb', 'bigg', 'bigstar', 'bigtriangleup', 'binom', 'blacksquare', 'boxed',
  'cdot', 'cdotsof', 'clubsuit', 'cong', 'cos', 'dbinom', 'dfrac', 'diamond', 'diamondsuit',
  'div', 'doteq', 'dotsc', 'ell', 'equiv', 'fbox', 'frac', 'framebox', 'gcd', 'ge', 'geq', 'geqslant',
  'heartsuit', 'hdots', 'implies', 'in', 'infty', 'le', 'leq', 'leqslant', 'lfloor', 'log',
  'lcm', 'Longleftrightarrow', 'Longrightarrow', 'Leftrightarrow', 'lvert', 'mbox', 'mid', 'mod',
  'odot', 'operatorname', 'overarc', 'overbrace', 'overleftrightarrow', 'overline', 'parallel',
  'perp', 'phi', 'pi', 'pm', 'prod', 'pmod', 'quad', 'qquad', 'rfloor', 'rm', 'rvert', 'sin',
  'spadesuit', 'sqrt', 'sum', 'tan', 'textrm', 'text', 'textbf', 'textdollar', 'theta', 'times',
  'triangle', 'triangles', 'underline', 'underbrace', 'uparrow', 'vdots', 'mathbf', 'mathrm'
]);

const LEGACY_TEX_RENAMES = new Map([
  ['Bbb', 'mathbb'],
  ['bigtriangleup', 'triangle'],
  ['cdotsof', 'cdots'],
  ['dotsc', 'cdots'],
  ['gcd', 'operatorname{gcd}'],
  ['hdots', 'cdots'],
  ['lcm', 'operatorname{lcm}'],
  ['mbox', 'text'],
  ['overarc', 'widehat'],
  ['rm', 'mathrm'],
  ['triangles', 'triangle'],
  ['textdollar', '$']
]);

const LEGACY_TEX_BINARY_ARGUMENTS = new Set(['binom', 'dbinom', 'dfrac', 'frac']);
const LEGACY_TEX_SINGLE_ARGUMENTS = new Set(['sqrt', 'underline']);

function isEscapedCharacter(value, index) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) slashCount += 1;
  return slashCount % 2 === 1;
}

function matchingInlineDelimiter(value, start, delimiter) {
  for (let index = start; index <= value.length - delimiter.length; index += 1) {
    if (value.startsWith(delimiter, index) && !isEscapedCharacter(value, index)) {
      // A lone ``$`` cannot close a display ``$$`` span, and a display marker
      // cannot silently close an inline span. Treat malformed legacy markup
      // as ordinary text instead of allowing MathJax to consume a paragraph.
      if (delimiter === '$' && value.startsWith('$$', index)) continue;
      if (delimiter === '$$' && !value.startsWith('$$', index)) continue;
      return index;
    }
  }
  return -1;
}

function consumeLegacyTexAtom(value, start) {
  let cursor = start;
  while (cursor < value.length && /[ \t]/.test(value[cursor])) cursor += 1;
  if (cursor >= value.length) return null;
  if (value[cursor] === '{') {
    let depth = 0;
    for (let index = cursor; index < value.length; index += 1) {
      if (value[index] === '{' && !isEscapedCharacter(value, index)) depth += 1;
      if (value[index] === '}' && !isEscapedCharacter(value, index)) {
        depth -= 1;
        if (depth === 0) return { source: value.slice(cursor, index + 1), end: index + 1, grouped: true };
      }
    }
    return null;
  }
  if (value[cursor] === '\\') {
    const command = /^\\[A-Za-z]+/.exec(value.slice(cursor));
    if (command) return { source: command[0], end: cursor + command[0].length, grouped: false };
  }
  if (/[A-Za-z0-9]/.test(value[cursor])) {
    return { source: value[cursor], end: cursor + 1, grouped: false };
  }
  return null;
}

/**
 * Recover a small class of unwrapped legacy TeX without touching valid math
 * spans or ordinary Markdown. Exported for a data-free regression test.
 */
export function normalizeLegacyInlineTeX(source) {
  const value = String(source ?? '');
  const pieces = [];
  let cursor = 0;
  while (cursor < value.length) {
    if (value[cursor] === '$' && !isEscapedCharacter(value, cursor)) {
      const delimiter = value.startsWith('$$', cursor) ? '$$' : '$';
      const closing = matchingInlineDelimiter(value, cursor + delimiter.length, delimiter);
      if (closing >= 0) {
        pieces.push(value.slice(cursor, closing + delimiter.length));
        cursor = closing + delimiter.length;
        continue;
      }
      // Preserve a malformed historical currency/math marker as literal text.
      // MathJax's escaped-dollar handling then cannot swallow following prose.
      pieces.push(delimiter === '$$' ? '\\$\\$' : '\\$');
      cursor += delimiter.length;
      continue;
    }
    if (value.startsWith('\\(', cursor) || value.startsWith('\\[', cursor)) {
      const closingDelimiter = value[cursor + 1] === '(' ? '\\)' : '\\]';
      const closing = value.indexOf(closingDelimiter, cursor + 2);
      if (closing >= 0) {
        pieces.push(value.slice(cursor, closing + closingDelimiter.length));
        cursor = closing + closingDelimiter.length;
        continue;
      }
    }
    if (value[cursor] === '\\' && !isEscapedCharacter(value, cursor)) {
      const command = /^\\([A-Za-z]+)((?:(?:\s*\{[^{}]*\}|\s*\[[^\[\]]*\]))*)((?:[_^](?:\{[^{}]*\}|[A-Za-z0-9]))*)/.exec(value.slice(cursor));
      if (command && LEGACY_TEX_COMMANDS.has(command[1])) {
        const name = LEGACY_TEX_RENAMES.get(command[1]) ?? command[1];
        let suffix = command[2] + command[3];
        let end = cursor + command[0].length;
        const argumentCount = LEGACY_TEX_BINARY_ARGUMENTS.has(command[1]) ? 2
          : (LEGACY_TEX_SINGLE_ARGUMENTS.has(command[1]) ? 1 : 0);
        if (!command[2] && argumentCount) {
          const atoms = [];
          for (let index = 0; index < argumentCount; index += 1) {
            const atom = consumeLegacyTexAtom(value, end);
            if (!atom) break;
            atoms.push(atom.grouped ? atom.source : `{${atom.source}}`);
            end = atom.end;
          }
          if (atoms.length === argumentCount) suffix += atoms.join('');
          else end = cursor + command[0].length;
        }
        const tex = name === '$' ? '\\$' : '\\' + name + suffix;
        pieces.push('\\(' + tex + '\\)');
        cursor = end;
        continue;
      }
    }
    pieces.push(value[cursor]);
    cursor += 1;
  }
  return pieces.join('');
}

function appendLegacyAwareText(parent, source) {
  appendText(parent, normalizeLegacyInlineTeX(source));
}

function appendInlineMarkdown(parent, source, { allowExternalResources = true } = {}) {
  const value = String(source ?? '');
  const token = /(!?\[[^\]]*\]\([^\s)]+(?:\s+"[^"]*")?\)|`[^`]*`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let cursor = 0;
  for (const match of value.matchAll(token)) {
    if (match.index > cursor) appendLegacyAwareText(parent, value.slice(cursor, match.index));
    const raw = match[0];
    const image = raw.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);
    const link = raw.match(/^\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);
    if (image) {
      if (!allowExternalResources) {
        appendLegacyAwareText(parent, raw);
        cursor = match.index + raw.length;
        continue;
      }
      const url = safeUrl(image[2]);
      if (url) {
        const element = document.createElement('img');
        element.src = url;
        element.alt = image[1];
        element.loading = 'lazy';
        parent.appendChild(element);
      } else appendLegacyAwareText(parent, raw);
    } else if (link) {
      if (!allowExternalResources) {
        appendLegacyAwareText(parent, raw);
        cursor = match.index + raw.length;
        continue;
      }
      const url = safeUrl(link[2]);
      if (url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        appendLegacyAwareText(anchor, link[1]);
        parent.appendChild(anchor);
      } else appendLegacyAwareText(parent, raw);
    } else if (raw.startsWith('`')) {
      const code = document.createElement('code');
      appendText(code, raw.slice(1, -1));
      parent.appendChild(code);
    } else {
      const tag = raw.startsWith('**') || raw.startsWith('__') ? 'strong' : 'em';
      const element = document.createElement(tag);
      appendLegacyAwareText(element, raw.slice(tag === 'strong' ? 2 : 1, tag === 'strong' ? -2 : -1));
      parent.appendChild(element);
    }
    cursor = match.index + raw.length;
  }
  if (cursor < value.length) appendLegacyAwareText(parent, value.slice(cursor));
}

// Restricted Markdown is used for student and AI-authored text. MathJax parses
// TeX after the Markdown DOM exists, so HTML escaping alone is insufficient:
// commands supplied by optional MathJax packages can otherwise create links,
// resource loads, or caller-chosen DOM attributes.
const RESTRICTED_TEX_COMMAND = /\\(?:href|url|includegraphics|require|class|cssId|style|htmlClass|htmlId|htmlStyle|htmlData|color|textcolor|colorbox|fcolorbox|newcommand|renewcommand|providecommand|newenvironment|renewenvironment|DeclareMathOperator|def|edef|gdef|xdef|let|futurelet|global|csname)\b/giu;

export function sanitizeRestrictedTeX(value) {
  return String(value ?? '').replace(RESTRICTED_TEX_COMMAND, '\\operatorname{unsupported}');
}

/** A deliberately small, safe Markdown renderer for API-provided prompt/solution text. */
function renderMarkdown(container, markdown, { allowExternalResources = true } = {}) {
  clearNode(container);
  if (allowExternalResources) delete container.dataset.restrictedMath;
  else container.dataset.restrictedMath = 'true';
  const source = allowExternalResources ? String(markdown ?? '') : sanitizeRestrictedTeX(markdown);
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let index = 0;
  const appendParagraph = (paragraphLines) => {
    if (!paragraphLines.length) return;
    const paragraph = document.createElement('p');
    paragraphLines.forEach((line, lineIndex) => {
      if (lineIndex) paragraph.appendChild(document.createElement('br'));
      appendInlineMarkdown(paragraph, line, { allowExternalResources });
    });
    container.appendChild(paragraph);
  };
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const displayStart = line.trim().startsWith('$$');
    if (displayStart) {
      const mathLines = [];
      const trimmed = line.trim();
      if (trimmed.length > 4 && trimmed.endsWith('$$')) {
        mathLines.push(trimmed.slice(2, -2));
        index += 1;
      } else {
        mathLines.push(trimmed.slice(2));
        index += 1;
        while (index < lines.length && !lines[index].trim().endsWith('$$')) {
          mathLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) {
          const closing = lines[index].trim();
          mathLines.push(closing.slice(0, -2));
          index += 1;
        }
      }
      const math = document.createElement('div');
      math.className = 'math-display';
      appendText(math, `\\[${mathLines.join('\n')}\\]`);
      container.appendChild(math);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 2, 6);
      const element = document.createElement(`h${level}`);
      appendInlineMarkdown(element, heading[2], { allowExternalResources });
      container.appendChild(element);
      index += 1;
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      const blockquote = document.createElement('blockquote');
      appendInlineMarkdown(blockquote, quote[1], { allowExternalResources });
      container.appendChild(blockquote);
      index += 1;
      continue;
    }
    const listMatch = line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if (listMatch) {
      const ordered = /^\s*\d+\. /.test(line);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const current = lines[index].match(/^\s*([-*+] |\d+\. )(.*)$/);
        if (!current || /^\s*\d+\. /.test(lines[index]) !== ordered) break;
        const item = document.createElement('li');
        appendInlineMarkdown(item, current[2], { allowExternalResources });
        list.appendChild(item);
        index += 1;
      }
      container.appendChild(list);
      continue;
    }
    const paragraphLines = [];
    while (index < lines.length && lines[index].trim()) {
      if (paragraphLines.length && (lines[index].trim().startsWith('$$') || /^(#{1,4})\s+/.test(lines[index]) || /^>\s?/.test(lines[index]) || /^\s*([-*+] |\d+\. )/.test(lines[index]))) break;
      paragraphLines.push(lines[index]);
      index += 1;
    }
    appendParagraph(paragraphLines);
  }
}

function mathJaxTypesetter() {
  if (typeof window === 'undefined' || !window.MathJax?.typesetPromise) return null;
  mathJaxReady = true;
  return window.MathJax.typesetPromise.bind(window.MathJax);
}

export function scrubRestrictedMathDom(container) {
  if (!container?.querySelectorAll) return;
  for (const element of container.querySelectorAll('a, img, image, foreignObject, iframe, object, embed')) {
    if (String(element.localName).toLowerCase() === 'a') {
      const text = element.ownerDocument?.createTextNode?.(element.textContent || '');
      if (text) element.replaceWith(text);
      else element.remove();
    } else {
      element.remove();
    }
  }
  for (const element of container.querySelectorAll('*')) {
    for (const attribute of Array.from(element.attributes || [])) {
      const name = String(attribute.name).toLowerCase();
      const value = String(attribute.value || '').trim();
      if (name.startsWith('on') || name === 'srcset' || name === 'formaction'
          || ((name === 'href' || name === 'xlink:href' || name === 'src') && !value.startsWith('#'))
          || (name === 'style' && /(?:url\s*\(|expression\s*\(|@import)/iu.test(value))) {
        element.removeAttribute(attribute.name);
      }
    }
  }
}

function restrictedMathContainers(nodes) {
  const restricted = new Set();
  for (const node of nodes || []) {
    if (node?.dataset?.restrictedMath === 'true') restricted.add(node);
    for (const descendant of node?.querySelectorAll?.('[data-restricted-math="true"]') || []) restricted.add(descendant);
  }
  return [...restricted];
}

function typesetMath(nodes) {
  const typesetter = mathJaxTypesetter();
  if (typesetter) {
    const restricted = restrictedMathContainers(nodes);
    typesetter(nodes)
      .then(() => restricted.forEach(scrubRestrictedMathDom))
      .catch(() => {
        // Rendering text fallback is preferable to failing the test UI.
      });
  }
}

function typesetVisiblePracticeMath() {
  if (!elements) return;
  const nodes = [
    elements.questionContent,
    elements.answerOptions,
    elements.resultsQuestions,
    elements.solutionsList,
    elements.analysisReportSummary,
    elements.analysisQuestions,
    elements.learningVersionReportSummary,
    elements.learningVersionQuestions,
    elements.learningQuestionPrompt,
    elements.learningQuestionChoices,
    elements.learningQuestionResponse,
    elements.learningQuestionAnalysis,
    elements.tutorMessages
  ].filter(Boolean);
  typesetMath(nodes);
}

function goToQuestion(index, { focus = false } = {}) {
  if (index < 0 || index >= state.questions.length) return;
  if (index !== state.currentQuestionIndex) queueReasoningSave({ immediate: true });
  state.currentQuestionIndex = index;
  renderQuestionNavigation();
  renderCurrentQuestion({ focus });
}

function renderCurrentQuestion({ focus = false } = {}) {
  const question = state.questions[state.currentQuestionIndex];
  if (!question) {
    elements.questionPosition.textContent = 'Question unavailable';
    clearNode(elements.questionContent);
    clearNode(elements.answerOptions);
    elements.reasoningInput.value = '';
    elements.reasoningInput.disabled = true;
    elements.saveReasoningButton.disabled = true;
    return;
  }
  elements.questionPosition.textContent = `Question ${question.number} of ${state.questions.length}`;
  renderMarkdown(elements.questionContent, question.promptMarkdown);
  clearNode(elements.answerOptions);
  const legend = document.createElement('legend');
  legend.textContent = 'Choose one answer';
  elements.answerOptions.appendChild(legend);
  if (!question.isScored) {
    const notice = document.createElement('p');
    notice.className = 'archive-question-note';
    notice.textContent = 'This archived item is not included in the score.';
    elements.answerOptions.appendChild(notice);
  }
  const selected = state.answers.get(question.number) || null;
  const enabled = canEditAnswers();
  elements.clearAnswerButton.disabled = !enabled || selected === null;
  elements.clearAnswerButton.setAttribute('aria-label', `Clear answer for question ${question.number}`);
  const choices = question.choices.length ? question.choices : OPTIONS.map((option) => ({ option, markdown: option }));
  for (const choice of choices) {
    const id = `answer-${question.number}-${choice.option}`;
    const label = document.createElement('label');
    label.className = 'option-label';
    if (choice.option === selected) label.classList.add('is-selected');
    label.htmlFor = id;
    const input = document.createElement('input');
    input.id = id;
    input.name = `question-${question.number}`;
    input.type = 'radio';
    input.value = choice.option;
    input.checked = choice.option === selected;
    input.disabled = !enabled;
    const key = document.createElement('span');
    key.className = 'option-key';
    key.textContent = choice.option;
    const content = document.createElement('span');
    content.className = 'option-content';
    appendInlineMarkdown(content, choice.markdown);
    label.append(input, key, content);
    elements.answerOptions.appendChild(label);
  }
  elements.previousQuestion.disabled = state.currentQuestionIndex === 0;
  elements.nextQuestion.disabled = state.currentQuestionIndex >= state.questions.length - 1;
  elements.nextQuestion.textContent = state.currentQuestionIndex >= state.questions.length - 1 ? 'Last question' : 'Next';
  const reasoningEnabled = canEditReasoning();
  const reasoningText = state.reasoningNotes.get(question.number) || '';
  if (elements.reasoningInput.value !== reasoningText) elements.reasoningInput.value = reasoningText;
  elements.reasoningInput.disabled = !reasoningEnabled;
  elements.reasoningInput.setAttribute('aria-label', `Your optional approach for question ${question.number}`);
  elements.saveReasoningButton.disabled = !reasoningEnabled
    || !state.dirtyReasoning.has(question.number)
    || state.pendingReasoningSaveCount > 0;
  renderSaveStatus();
  typesetMath([elements.questionContent, elements.answerOptions]);
  if (focus) {
    elements.questionContent.tabIndex = -1;
    elements.questionContent.focus();
  }
}

function updateCurrentReasoning(value) {
  const question = state.questions[state.currentQuestionIndex];
  if (!question || !canEditReasoning()) return;
  state.reasoningNotes.set(question.number, String(value));
  state.dirtyReasoning.add(question.number);
  state.lastReasoningSaveError = null;
  elements.saveReasoningButton.disabled = false;
  renderSaveStatus();
  queueReasoningSave();
}

function updateQuestionAnswer(questionNumber, option) {
  if (!canEditAnswers()) {
    if (timedLimitLocallyReached(state.attempt, currentElapsedMs())) {
      showStatus('The 75-minute limit has been reached. Confirm whether to submit or continue.');
      requestDeadlineReconciliation();
    } else {
      showStatus('Resume the timer before changing an answer.');
    }
    renderCurrentQuestion();
    return;
  }
  const normalized = OPTIONS.includes(String(option).toUpperCase()) ? String(option).toUpperCase() : null;
  state.answers.set(questionNumber, normalized);
  state.dirtyAnswers.add(questionNumber);
  state.lastSaveError = null;
  renderQuestionNavigation();
  renderCurrentQuestion();
  queueAnswerSave();
}

function queueAnswerSave() {
  const context = attemptContext();
  if (!context || !canEditAnswers()) return;
  // Capture the answer sheet and its owner now. Later queue entries retain
  // their own snapshots, while the revision is read when each entry starts so
  // rapid changes still serialize against the newest server revision.
  const snapshot = new Map(state.answers);
  state.pendingSaveCount += 1;
  renderSaveStatus();
  state.saveQueue = state.saveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!isCurrentAttemptContext(context)) return;
      try {
        const response = await api.put(`${API_BASE}/attempts/${encodeURIComponent(context.id)}/answers`, {
          answers: answerPayload(snapshot),
          ...(state.answerRevision !== null ? { revision: state.answerRevision } : {})
        });
        if (!isCurrentAttemptContext(context)) return;
        const priorPhase = normalizePhase(state.attempt);
        const merged = mergeAttemptResult(response, { preferLocalAnswers: true });
        if (!merged.applied) {
          // A newer poll/mutation has already won. Do not mark this snapshot
          // clean merely because its local option still happens to match: the
          // server may have a different answer from another tab. Reconcile
          // before final submission can use the wrong persisted choice.
          await reconcileAfterRevisionConflict(context);
          return;
        }
        for (const [number, sentOption] of snapshot) {
          if (state.answers.get(number) === sentOption) state.dirtyAnswers.delete(number);
        }
        state.lastSaveError = null;
        if (normalizePhase(state.attempt) !== priorPhase) reconcilePracticeStateAfterServerUpdate();
      } catch (error) {
        if (!isCurrentAttemptContext(context)) return;
        if (error instanceof ApiError && error.code === 'ANSWER_REVISION_CONFLICT') {
          await reconcileAfterRevisionConflict(context);
        } else if (error instanceof ApiError && ['LIMIT_NOTICE_REQUIRED', 'INVALID_STATE'].includes(error.code)) {
          await reconcileStateConflict(error, context);
        } else {
          state.lastSaveError = error;
          handleError(error, 'Your answer could not be saved.');
        }
      } finally {
        if (!isCurrentAttemptContext(context)) return;
        state.pendingSaveCount = Math.max(0, state.pendingSaveCount - 1);
        renderSaveStatus();
      }
    });
}

function mergeReasoningEnvelope(payload, { preserveLocal = true } = {}) {
  const envelope = normalizeReasoningNotes(payload);
  if (!reasoningEnvelopeMatchesAttempt(envelope, state.attempt?.id)) return false;
  const localNotes = state.reasoningNotes;
  state.reasoningNotes = preserveLocal
    ? preserveDirtyReasoningNotes(envelope.notes, localNotes, state.dirtyReasoning)
    : new Map(envelope.notes);
  if (envelope.reasoningRevision !== null) state.reasoningRevision = envelope.reasoningRevision;
  state.reasoningEditable = envelope.editable;
  state.reasoningLoaded = envelope.reasoningRevision !== null;
  const currentStateRevision = stateRevisionFromAttempt(state.attempt);
  if (envelope.stateRevision !== null
      && (currentStateRevision === null || envelope.stateRevision >= currentStateRevision)) {
    state.attempt = { ...state.attempt, stateRevision: envelope.stateRevision };
  }
  return true;
}

async function loadReasoningNotes({ preserveLocal = true, quiet = false } = {}) {
  const context = attemptContext();
  if (!context) return false;
  try {
    const response = await api.get(reasoningNotesPath(context.id));
    if (!isCurrentAttemptContext(context)) return false;
    if (!mergeReasoningEnvelope(response, { preserveLocal })) {
      throw new ApiError('The reasoning notes belong to a different attempt.', { code: 'REASONING_ATTEMPT_MISMATCH' });
    }
    state.lastReasoningSaveError = null;
    state.reasoningLoadError = null;
    return true;
  } catch (error) {
    if (!isCurrentAttemptContext(context)) return false;
    state.reasoningLoaded = false;
    state.reasoningEditable = false;
    state.reasoningLoadError = error;
    if (!quiet) handleError(error, 'Could not load your saved approaches.');
    return false;
  }
}

async function reloadReasoningNotes() {
  const loaded = await loadReasoningNotes({ preserveLocal: true });
  if (loaded) {
    renderCurrentQuestion();
    showStatus('Saved approaches reloaded.');
  } else {
    renderSaveStatus();
  }
  return loaded;
}

function queueReasoningSave({ immediate = false } = {}) {
  if (state.reasoningDebounceTimer) {
    window.clearTimeout(state.reasoningDebounceTimer);
    state.reasoningDebounceTimer = null;
  }
  if (!state.dirtyReasoning.size || !state.reasoningLoaded || !state.reasoningEditable) return state.reasoningSaveQueue;
  if (state.pendingReasoningSaveCount > 0) {
    state.reasoningSaveRequested = true;
    renderSaveStatus();
    return state.reasoningSaveQueue;
  }
  if (!immediate) {
    state.reasoningDebounceTimer = window.setTimeout(() => {
      state.reasoningDebounceTimer = null;
      enqueueReasoningSave();
    }, 700);
    return state.reasoningSaveQueue;
  }
  return enqueueReasoningSave();
}

function enqueueReasoningSave() {
  const context = attemptContext();
  if (!context || !state.dirtyReasoning.size || !state.reasoningLoaded || !state.reasoningEditable) return state.reasoningSaveQueue;
  if (state.pendingReasoningSaveCount > 0) {
    state.reasoningSaveRequested = true;
    return state.reasoningSaveQueue;
  }
  let batches;
  try {
    batches = reasoningSaveBatches(state.reasoningNotes, state.dirtyReasoning, state.reasoningRevision);
  } catch (error) {
    state.lastReasoningSaveError = error;
    renderSaveStatus();
    handleError(error, 'Your approach could not be saved. Your text is still in this browser.');
    return state.reasoningSaveQueue;
  }
  state.reasoningSaveRequested = false;
  state.pendingReasoningSaveCount += 1;
  renderSaveStatus();
  state.reasoningSaveQueue = state.reasoningSaveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!isCurrentAttemptContext(context)) return;
      try {
        for (let snapshot of batches) {
          let response;
          for (let attemptNumber = 0; attemptNumber < 2; attemptNumber += 1) {
            try {
              const requestBody = {
                revision: state.reasoningRevision,
                notes: reasoningNotesPayload(snapshot)
              };
              if (reasoningRequestBodyBytes(requestBody.revision, snapshot) > MAX_REASONING_REQUEST_BYTES) {
                throw new ApiError('The approach save request is too large.', { code: 'REASONING_REQUEST_TOO_LARGE' });
              }
              response = await api.put(reasoningNotesPath(context.id), requestBody);
              break;
            } catch (error) {
              const conflict = isReasoningRevisionConflict(error);
              if (!conflict || attemptNumber > 0) throw error;
              const refreshed = await api.get(reasoningNotesPath(context.id));
              if (!isCurrentAttemptContext(context)) return;
              if (!mergeReasoningEnvelope(refreshed, { preserveLocal: true })) {
                throw new ApiError('The reasoning notes belong to a different attempt.', {
                  code: 'REASONING_ATTEMPT_MISMATCH'
                });
              }
              snapshot = new Map([...snapshot.keys()].map((questionNumber) => [
                questionNumber,
                state.reasoningNotes.get(questionNumber) || ''
              ]));
            }
          }
          if (!isCurrentAttemptContext(context) || !response) return;
          if (!mergeReasoningEnvelope(response, { preserveLocal: true })) return;
          for (const [questionNumber, sentText] of snapshot) {
            if (state.reasoningNotes.get(questionNumber) === sentText) state.dirtyReasoning.delete(questionNumber);
          }
        }
        state.lastReasoningSaveError = null;
      } catch (error) {
        if (!isCurrentAttemptContext(context)) return;
        state.lastReasoningSaveError = error;
        handleError(error, 'Your approach could not be saved. Your text is still in this browser.');
      } finally {
        if (!isCurrentAttemptContext(context)) return;
        state.pendingReasoningSaveCount = Math.max(0, state.pendingReasoningSaveCount - 1);
        renderSaveStatus();
        if (!elements.practiceView.hidden) renderCurrentQuestion();
        if (state.reasoningSaveRequested && !state.lastReasoningSaveError && state.dirtyReasoning.size) {
          queueReasoningSave();
        }
      }
    });
  return state.reasoningSaveQueue;
}

async function reconcileAfterRevisionConflict(context = attemptContext()) {
  if (!context) return;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    mergeAttempt(response, { preferLocalAnswers: false });
    state.dirtyAnswers.clear();
    state.lastSaveError = null;
    reconcilePracticeStateAfterServerUpdate();
    showError('Answers changed in another session. The server’s latest answers are now shown; choose an option again to make a new change.');
  } catch (error) {
    if (!isCurrentAttemptContext(context)) return;
    state.lastSaveError = error;
    handleError(error, 'Could not reconcile answer changes.');
  }
}

async function reconcileStateConflict(error, context = attemptContext()) {
  if (!context) return;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    mergeAttempt(response, { preferLocalAnswers: false });
    state.dirtyAnswers.clear();
    state.lastSaveError = null;
    reconcilePracticeStateAfterServerUpdate();
    if (error.code !== 'LIMIT_NOTICE_REQUIRED') {
      showError('This attempt changed in another session. The server’s latest state is now shown.');
    }
  } catch (refreshError) {
    if (!isCurrentAttemptContext(context)) return;
    state.lastSaveError = refreshError;
    handleError(refreshError, 'Could not refresh the latest attempt state.');
  }
}

function reconcilePracticeStateAfterServerUpdate() {
  if (elements.practiceView.hidden || !state.attempt) return;
  if (canAccessFinalReview(state.attempt)) {
    showResults();
    return;
  }
  renderAttemptHeader();
  renderQuestionNavigation();
  renderCurrentQuestion();
  if (normalizePhase(state.attempt) === 'LIMIT_NOTICE') openLimitNotice();
}

async function flushAnswerSaves() {
  await state.saveQueue;
  if (state.lastSaveError) {
    throw new ApiError('Answers are not fully saved. Please retry the failed save before submitting.', {
      code: 'ANSWER_SAVE_FAILED', payload: state.lastSaveError
    });
  }
}

async function flushReasoningSaves() {
  if (state.reasoningDebounceTimer) {
    window.clearTimeout(state.reasoningDebounceTimer);
    state.reasoningDebounceTimer = null;
  }
  // A student can continue typing while one request is in flight. Drain the
  // coalesced follow-up snapshot as well; do not mistake the first request's
  // completion for a fully persisted editor.
  for (let pass = 0; pass < 3 && state.dirtyReasoning.size && !state.lastReasoningSaveError; pass += 1) {
    if (state.reasoningDebounceTimer) {
      window.clearTimeout(state.reasoningDebounceTimer);
      state.reasoningDebounceTimer = null;
    }
    enqueueReasoningSave();
    await state.reasoningSaveQueue;
  }
  if (state.dirtyReasoning.size || (state.lastReasoningSaveError && state.reasoningLoaded)) {
    throw new ApiError('Your approach notes are not fully saved. Retry the save before submitting.', {
      code: 'REASONING_SAVE_FAILED', payload: state.lastReasoningSaveError
    });
  }
}

async function flushPracticeEdits() {
  await flushAnswerSaves();
  await flushReasoningSaves();
}

function discardLocalReasoningDraft() {
  if (state.reasoningDebounceTimer) window.clearTimeout(state.reasoningDebounceTimer);
  state.reasoningDebounceTimer = null;
  state.reasoningSaveRequested = false;
  state.dirtyReasoning.clear();
  state.lastReasoningSaveError = null;
  renderSaveStatus();
}

async function reloadReasoningDiscardingLocal() {
  discardLocalReasoningDraft();
  const loaded = await loadReasoningNotes({ preserveLocal: false });
  if (loaded && !elements.practiceView.hidden) renderCurrentQuestion();
  return loaded;
}

function reopenLimitNoticeIfNeeded() {
  if (normalizePhase(state.attempt) === 'LIMIT_NOTICE') openLimitNotice();
}

function offerUnsavedReasoningRecovery({ actionLabel, onDiscard }) {
  openModal({
    type: 'reasoning-recovery',
    title: 'Approach notes are not saved',
    paragraphs: [
      'Your selected answers are separate, but one or more local approach notes could not be saved.',
      'Keep them in this browser and retry, reload the server copy, or explicitly discard the local notes to continue.'
    ],
    dismissible: false,
    actions: [
      {
        label: 'Keep local notes', className: 'button button-secondary', handler: () => {
          hideModal({ force: true });
          reopenLimitNoticeIfNeeded();
        }
      },
      {
        label: 'Reload saved notes', className: 'button button-secondary', handler: async () => {
          hideModal({ force: true });
          await reloadReasoningDiscardingLocal();
          reopenLimitNoticeIfNeeded();
        }
      },
      {
        label: `Discard notes and ${actionLabel}`,
        className: 'button button-danger',
        handler: async () => {
          discardLocalReasoningDraft();
          hideModal({ force: true });
          await onDiscard();
        }
      }
    ]
  });
}

async function flushBeforeAttemptSwitch(nextAttemptId, onDiscard) {
  const switchesAttempt = Boolean(state.attempt?.id)
    && String(state.attempt.id) !== String(nextAttemptId || '');
  const needsReasoningFlush = attemptSwitchNeedsReasoningFlush(
    state.attempt?.id,
    nextAttemptId,
    state.dirtyReasoning.size,
    state.pendingReasoningSaveCount
  );
  const needsAnswerFlush = switchesAttempt && (state.dirtyAnswers.size > 0 || state.pendingSaveCount > 0);
  if (!needsReasoningFlush && !needsAnswerFlush) return true;
  try {
    await flushPracticeEdits();
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'REASONING_SAVE_FAILED') {
      offerUnsavedReasoningRecovery({ actionLabel: 'switch tests', onDiscard });
      return false;
    }
    handleError(error, 'Could not save changes before switching tests.');
    return false;
  }
}

function submissionRequestPayload(body = {}) {
  const precondition = submissionPrecondition(state.attempt);
  if (!precondition) {
    throw new ApiError('The attempt version is unavailable. Refresh before submitting.', {
      code: 'ATTEMPT_REVISION_MISSING'
    });
  }
  return { ...body, ...precondition };
}

function requestDeadlineReconciliation() {
  const context = attemptContext();
  const now = Date.now();
  if (!context || state.deadlineRefreshInFlight || now < state.deadlineRefreshNotBefore) return;
  // The ordinary poll intentionally runs at a relaxed cadence. Crossing the
  // displayed 75-minute boundary is different: issue one immediate, separate
  // GET so a slow existing poll cannot leave answer controls writable.
  state.deadlineRefreshInFlight = true;
  state.deadlineRefreshNotBefore = now + 5_000;
  void refreshAttempt({ quiet: true, urgent: true }).finally(() => {
    if (isCurrentAttemptContext(context)) state.deadlineRefreshInFlight = false;
  });
}

async function refreshAttempt({ quiet = false, urgent = false } = {}) {
  const context = attemptContext();
  if (!context || (state.polling && !urgent)) return;
  if (!urgent) state.polling = true;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    const priorPhase = normalizePhase(state.attempt);
    const previousAttempt = state.attempt;
    const attempt = mergeAttempt(response, { preferLocalAnswers: true });
    if (reasoningCapabilityNeedsReload(previousAttempt, attempt)) {
      await loadReasoningNotes({ preserveLocal: true, quiet: true });
    }
    if (canAccessFinalReview(attempt)) {
      await showResults();
      return;
    }
    renderAttemptHeader();
    renderQuestionNavigation();
    renderCurrentQuestion();
    if (normalizePhase(attempt) === 'LIMIT_NOTICE' && priorPhase !== 'LIMIT_NOTICE') openLimitNotice();
  } catch (error) {
    if (isCurrentAttemptContext(context) && !quiet) handleError(error, 'Could not refresh this attempt.');
  } finally {
    if (!urgent && isCurrentAttemptContext(context)) state.polling = false;
  }
}

async function loadForms({ quiet = false } = {}) {
  setButtonBusy(elements.refreshForms, true, 'Refreshing…');
  state.attemptHistoryLoaded = false;
  state.attemptHistoryLoadError = false;
  // Remove every timed start/resume handler immediately. Existing form data
  // is also withdrawn until a fresh exact-version form snapshot arrives, so
  // a stale revision cannot remain an actionable batch entry during refresh.
  state.forms = [];
  renderForms();
  elements.formsEmpty.hidden = true;
  try {
    const response = await api.get(`${API_BASE}/forms`);
    state.forms = extractForms(response);
    for (const form of state.forms) if (form?.id) state.formCache.set(formCacheKey(form.id, form.version), form);
    renderForms();
    // A batch deep link is pinned directly to the exact version in this form
    // snapshot. Start it without making availability depend on the unrelated
    // timed-attempt history service; the history request may finish alongside
    // workspace creation and refresh the dashboard if it remains visible.
    const historyRequest = api.get(`${API_BASE}/attempts`)
      .then((historyResponse) => ({ historyResponse, historyError: null }))
      .catch((historyError) => ({ historyResponse: null, historyError }));
    if (state.practiceEntryIntent?.mode === 'batch') await applyPracticeEntryIntent();
    const { historyResponse, historyError } = await historyRequest;
    if (!historyError) {
      state.attemptHistory = extractAttemptHistory(historyResponse);
      state.attemptHistoryLoaded = true;
      state.attemptHistoryLoadError = false;
    } else {
      // Form selection remains useful if a deployment is rolling out history
      // separately; a normal user-facing error is shown only for the form API.
      state.attemptHistory = [];
      state.attemptHistoryLoadError = true;
      if (!quiet && !(historyError instanceof ApiError && historyError.status === 404)) {
        showStatus('Saved attempt history is temporarily unavailable.');
      }
    }
    renderForms();
    await applyPracticeEntryIntent();
  } catch (error) {
    state.attemptHistoryLoadError = true;
    renderForms();
    if (!quiet) handleError(error, 'Could not load practice forms.');
  } finally {
    setButtonBusy(elements.refreshForms, false);
  }
}

async function applyPracticeEntryIntent() {
  if (!state.practiceEntryIntent) return;
  if (state.practiceEntryIntent.mode === 'practice' && !state.attemptHistoryLoaded) {
    showStatus('The requested practice choice is waiting for saved-attempt history. Refresh to try again.', { persistent: true });
    return;
  }
  showStatus('');
  const selection = consumePracticeEntryIntent(state, state.forms);
  if (!selection?.form) {
    showError('The requested AMC 12 test is not currently available. Choose a test from this page.');
    return;
  }
  const { intent, form } = selection;
  if (intent.mode === 'batch') {
    await openBatchSubmissionForForm(form);
    return;
  }
  const activeAttempt = activeAttemptForForm(form);
  if (activeAttempt?.id) {
    await resumeAttempt(activeAttempt.id);
    return;
  }
  confirmTimedPractice(form);
}

function activeAttemptForForm(form) {
  const historyAttempt = state.attemptHistory
    .filter((attempt) => String(attempt?.formId) === String(form?.id) && isAttemptActive(attempt))
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt))[0];
  if (historyAttempt) return historyAttempt;
  const direct = firstDefined(form?.activeAttempt, form?.resumeAttempt, form?.attemptInProgress, null);
  if (isRecord(direct)) return direct;
  const attempts = Array.isArray(form?.attempts) ? form.attempts : [];
  return attempts.find((attempt) => isAttemptActive(attempt)) || null;
}

function historyForForm(form) {
  const candidates = [
    ...state.attemptHistory.filter((attempt) => String(attempt?.formId) === String(form?.id)),
    ...(Array.isArray(form?.attempts) ? form.attempts : [])
  ];
  const seen = new Set();
  return candidates
    .filter((attempt) => attempt?.id && !seen.has(attempt.id) && seen.add(attempt.id))
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt));
}

function renderForms() {
  clearNode(elements.formsList);
  elements.formsEmpty.hidden = state.forms.length > 0;
  for (const form of state.forms) {
    const card = document.createElement('article');
    card.className = 'form-card';
    const label = document.createElement('p');
    label.className = 'eyebrow';
    label.textContent = String(firstDefined(
      form.paper,
      form.label,
      form.practiceKind === 'archive' ? 'AMC 12 archive practice' : undefined,
      'AMC 12'
    ));
    const title = document.createElement('h2');
    title.textContent = String(firstDefined(form.title, form.name, form.id, 'Practice form'));
    const meta = document.createElement('p');
    meta.className = 'form-meta';
    const count = finiteNumber(firstDefined(form.questionCount, form.questions?.length), 25);
    const duration = finiteNumber(form.durationMs) || (finiteNumber(firstDefined(form.durationSeconds, form.duration, null)) || 0) * 1000;
    const scoredCount = finiteNumber(form.scoredQuestionCount, count);
    meta.textContent = `${count} questions${duration ? ` · ${formatDuration(duration)} active time` : ''}${scoredCount < count ? ` · ${scoredCount} scored` : ''}`;
    const timedActionsAvailable = state.attemptHistoryLoaded === true;
    const formHistory = timedActionsAvailable ? historyForForm(form) : [];
    const activeAttempt = timedActionsAvailable ? activeAttemptForForm(form) : null;
    const history = document.createElement('p');
    history.className = 'form-history';
    const historicalAttempts = finiteNumber(firstDefined(form.attemptCount, formHistory.length, form.history?.length, form.attempts?.length), 0);
    history.textContent = !timedActionsAvailable
      ? (state.attemptHistoryLoadError ? 'Saved timed attempts unavailable' : 'Checking saved timed attempts…')
      : historicalAttempts > 0
        ? `${historicalAttempts} saved attempt${historicalAttempts === 1 ? '' : 's'}`
        : 'No saved attempts yet';
    const actions = document.createElement('div');
    actions.className = 'form-card-actions';
    if (!timedActionsAvailable) {
      if (batchReviewAvailableForForm(form)) {
        const batch = document.createElement('button');
        batch.type = 'button'; batch.className = 'button button-secondary'; batch.textContent = 'Batch submit files';
        batch.addEventListener('click', () => openBatchSubmissionForForm(form));
        actions.appendChild(batch);
      }
      const timedPending = document.createElement('button');
      timedPending.type = 'button'; timedPending.className = 'button button-primary'; timedPending.disabled = true;
      timedPending.textContent = state.attemptHistoryLoadError ? 'Timed practice unavailable' : 'Checking timed practice…';
      actions.appendChild(timedPending);
    } else if (activeAttempt?.id) {
      const resume = document.createElement('button');
      resume.type = 'button'; resume.className = 'button button-primary'; resume.textContent = 'Resume';
      resume.addEventListener('click', () => resumeAttempt(activeAttempt.id));
      actions.appendChild(resume);
      if (batchReviewAvailableForForm(form)) {
        const batch = document.createElement('button');
        batch.type = 'button'; batch.className = 'button button-secondary'; batch.textContent = 'Batch submit files';
        batch.addEventListener('click', () => openBatchSubmissionForForm(form));
        actions.appendChild(batch);
      }
    } else {
      const start = document.createElement('button');
      start.type = 'button'; start.className = 'button button-primary'; start.textContent = 'Start practice';
      start.setAttribute('aria-label', `Choose practice method for ${title.textContent}`);
      start.addEventListener('click', () => choosePracticeMode(form));
      actions.appendChild(start);
    }
    card.append(label, title, meta);
    if (form.archiveNotice) {
      const notice = document.createElement('p');
      notice.className = 'archive-form-note';
      notice.textContent = String(form.archiveNotice);
      card.appendChild(notice);
    }
    card.append(history, actions);
    const previousResults = formHistory.filter((attempt) => Boolean(attempt.resultsAvailable) || normalizePhase(attempt) === 'FINALIZED');
    if (previousResults.length) {
      const details = document.createElement('details');
      details.className = 'form-history-details';
      const summary = document.createElement('summary');
      summary.textContent = `View ${previousResults.length} prior final result${previousResults.length === 1 ? '' : 's'}`;
      const list = document.createElement('div');
      list.className = 'form-history-list';
      for (const attempt of previousResults) {
        const row = document.createElement('div');
        row.className = 'form-history-row';
        const description = document.createElement('span');
        const score = scoreFromSubmission(firstDefined(attempt.finalSubmission, attempt.latestSubmission, null));
        description.textContent = `${formatDateTime(firstDefined(attempt.finalizedAt, attempt.createdAt))}${score !== null ? ` · Score ${formatScore(score)}` : ''}`;
        const view = document.createElement('button');
        view.type = 'button'; view.className = 'button button-secondary'; view.textContent = 'View result';
        view.addEventListener('click', () => resumeAttempt(attempt.id, attempt));
        row.append(description, view);
        list.appendChild(row);
      }
      details.append(summary, list);
      card.appendChild(details);
    }
    elements.formsList.appendChild(card);
  }
}

function choosePracticeMode(form) {
  const count = finiteNumber(firstDefined(form.questionCount, form.questions?.length), 25);
  const scoredCount = finiteNumber(form.scoredQuestionCount, count);
  const duration = finiteNumber(form.durationMs)
    || (finiteNumber(firstDefined(form.durationSeconds, form.duration, null)) || 0) * 1000;
  const formTitle = String(firstDefined(form.title, form.name, 'This form'));
  const batchReviewAvailable = batchReviewAvailableForForm(form);
  const archiveDetail = form?.archiveNotice
    ? String(form.archiveNotice)
    : (scoredCount < count ? `${count - scoredCount} archived item${count - scoredCount === 1 ? ' is' : 's are'} not scored.` : null);
  openModal({
    type: 'practice-mode',
    title: 'Choose how to submit your work',
    paragraphs: [
      `${formTitle} has ${count} questions${duration ? ` and a ${formatDuration(duration)} active timer` : ''}.`,
      'Pausing stops active time. You may check one in-progress score, then submit final answers when you are ready.',
      'Choose the question-by-question test, or submit answers and approaches from text or audio files in an independent workspace for this exact test version.',
      batchReviewAvailable
        ? 'Batch submission does not start a timer and does not require a prior completed test.'
        : 'Batch submission is not available yet.',
      ...(archiveDetail ? [archiveDetail] : [])
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      {
        label: batchReviewAvailable ? 'Batch submit files' : 'Batch submit files (not available yet)',
        className: 'button button-secondary',
        disabled: !batchReviewAvailable,
        handler: () => openBatchSubmissionForForm(form)
      },
      { label: 'Question-by-question test', className: 'button button-primary', handler: () => startAttempt(form) }
    ]
  });
}

function confirmTimedPractice(form) {
  const count = finiteNumber(firstDefined(form.questionCount, form.questions?.length), 25);
  const duration = finiteNumber(form.durationMs)
    || (finiteNumber(firstDefined(form.durationSeconds, form.duration, null)) || 0) * 1000;
  openModal({
    type: 'timed-practice-confirmation',
    title: 'Start a new question-by-question test?',
    paragraphs: [
      `${String(firstDefined(form.title, form.name, 'This form'))} has ${count} questions${duration ? ` and a ${formatDuration(duration)} active timer` : ''}.`,
      'Pausing stops active time. You may check one in-progress score, then submit final answers when you are ready.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Start test', className: 'button button-primary', handler: () => startAttempt(form) }
    ]
  });
}

async function openBatchSubmissionForForm(form) {
  if (!batchReviewAvailableForForm(form)) {
    showError('Batch submission is not available yet.');
    return false;
  }
  if (state.batchReviewOpenPromise) return state.batchReviewOpenPromise;
  const returnFocus = state.lastFocused;
  const main = document.getElementById('main-content');
  hideModal({ force: true, restoreFocus: false });
  clearAttemptState();
  const openContext = {
    sequence: state.batchReviewOpenSequence,
    studentId: String(firstDefined(state.student?.id, state.student?.studentId, ''))
  };
  showOnly(elements.loadingView);
  const openPromise = (async () => {
    try {
      const workspace = await createBatchReviewWorkspaceRequest(api, form);
      if (!batchReviewOpenContextMatches(openContext, {
        sequence: state.batchReviewOpenSequence,
        studentId: String(firstDefined(state.student?.id, state.student?.studentId, ''))
      })) return false;
      state.batchReviewWorkspace = workspace;
      configureResultsView('BATCH_REVIEW', { form, workspace });
      stopBatchPolling();
      state.activeBatchId = null;
      setButtonBusy(elements.batchSubmitButton, false);
      elements.batchUploadForm.reset();
      clearNode(elements.batchWorkspace);
      clearNode(elements.batchSelectedFiles);
      showOnly(elements.resultsView);
      syncBatchIntakeControls();
      setBatchStatus(workspace.analysisContextStatus === 'UNAVAILABLE'
        ? 'You can submit files now. Detailed AI reports and Tutor chat will remain pending until approved solution context is available.'
        : 'Choose text or audio files containing your answers and approaches.');
      void loadLatestLearningBatch();
      elements.batchLearningSection.scrollIntoView({ block: 'start', behavior: 'smooth' });
      focusSafeVisibleTarget(elements.batchFiles, main);
      return true;
    } catch (error) {
      if (openContext.sequence !== state.batchReviewOpenSequence) return false;
      showOnly(elements.dashboardView);
      handleError(error, 'Could not open this batch submission workspace.');
      focusSafeVisibleTarget(returnFocus, main);
      return false;
    }
  })();
  state.batchReviewOpenPromise = openPromise;
  try {
    return await openPromise;
  } finally {
    if (state.batchReviewOpenPromise === openPromise) state.batchReviewOpenPromise = null;
  }
}

async function startAttempt(form) {
  const formId = form?.id;
  if (!formId) return showError('This form is missing an identifier.');
  try {
    const response = await createTimedAttemptRequest(api, form, {
      attemptHistoryLoaded: state.attemptHistoryLoaded
    });
    hideModal({ force: true });
    await openAttempt(response, form);
  } catch (error) {
    handleError(error, 'Could not start this practice test.');
  }
}

async function resumeAttempt(attemptId, historySummary = null, { skipSwitchFlush = false } = {}) {
  if (!skipSwitchFlush) {
    const canSwitch = await flushBeforeAttemptSwitch(attemptId, () => resumeAttempt(
      attemptId,
      historySummary,
      { skipSwitchFlush: true }
    ));
    if (!canSwitch) return false;
  }
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(String(attemptId))}`);
    if (historySummary?.resultsAvailable === true && isRecord(response?.attempt)) {
      response.attempt = { ...response.attempt, resultsAvailable: true };
    }
    return await openAttempt(response);
  } catch (error) {
    handleError(error, 'Could not resume this practice test.');
    return false;
  }
}

async function openAttempt(payload, knownForm = null, { skipSwitchFlush = false } = {}) {
  const targetAttempt = extractAttempt(payload);
  if (!skipSwitchFlush) {
    const canSwitch = await flushBeforeAttemptSwitch(targetAttempt?.id, () => openAttempt(
      payload,
      knownForm,
      { skipSwitchFlush: true }
    ));
    if (!canSwitch) return false;
  }
  clearAttemptState();
  if (knownForm?.id) state.formCache.set(formCacheKey(knownForm.id, knownForm.version), knownForm);
  const attempt = mergeAttempt(payload, { preferLocalAnswers: false });
  if (!attempt?.id) throw new ApiError('The practice service did not return an attempt.', { code: 'INVALID_ATTEMPT' });
  // Historical final results must remain recoverable even when a later form
  // version is unpublished. Results and solutions are owner-gated API data;
  // they do not require re-fetching the public form first.
  if (canAccessFinalReview(attempt)) {
    return showResults();
  }
  await ensureQuestions(payload);
  if (!state.questions.length) throw new ApiError('This practice form contains no accessible questions.', { code: 'FORM_EMPTY' });
  await loadReasoningNotes({ preserveLocal: false });
  const firstUnanswered = state.questions.findIndex((question) => !state.answers.get(question.number));
  state.currentQuestionIndex = firstUnanswered >= 0 ? firstUnanswered : 0;
  showOnly(elements.practiceView);
  renderAttemptHeader();
  renderQuestionNavigation();
  renderCurrentQuestion();
  startAttemptSync();
  document.getElementById('main-content').focus();
  if (normalizePhase(attempt) === 'LIMIT_NOTICE') openLimitNotice();
  return true;
}

async function pauseAttempt() {
  try {
    await flushPracticeEdits();
    setButtonBusy(elements.pauseButton, true, 'Pausing…');
    const response = await api.post(`${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/pause`);
    mergeAttempt(response, { preferLocalAnswers: true });
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('Timer paused.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not pause the timer.');
  } finally {
    setButtonBusy(elements.pauseButton, false);
  }
}

async function resumeTimer() {
  try {
    setButtonBusy(elements.resumeButton, true, 'Resuming…');
    const previousAttempt = state.attempt;
    const response = await api.post(`${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/resume`);
    const resumedAttempt = mergeAttempt(response, { preferLocalAnswers: true });
    if (reasoningCapabilityNeedsReload(previousAttempt, resumedAttempt)) {
      await loadReasoningNotes({ preserveLocal: true, quiet: true });
    }
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('Timer resumed.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not resume the timer.');
  } finally {
    setButtonBusy(elements.resumeButton, false);
  }
}

function checkpointSummary(submission) {
  if (!submission) return 'The server saved your score checkpoint.';
  const score = formatScore(scoreFromSubmission(submission));
  const details = [];
  const correct = finiteNumber(firstDefined(submission.score?.correctCount, submission.correctCount, submission.result?.score?.correctCount, submission.result?.correctCount));
  const blank = finiteNumber(firstDefined(submission.score?.blankCount, submission.blankCount, submission.unansweredCount, submission.result?.score?.blankCount, submission.result?.blankCount));
  if (correct !== null) details.push(`${correct} correct`);
  if (blank !== null) details.push(`${blank} unanswered`);
  return `Score: ${score}${details.length ? ` (${details.join(', ')})` : ''}. Answers remain editable; solutions stay hidden until final submission.`;
}

function findRecentSubmission(payload, preferredKinds = []) {
  const submissions = submissionsFrom(payload);
  for (const kind of preferredKinds) {
    const matched = submissions.filter((submission) => String(firstDefined(submission.kind, submission.type, '')).toUpperCase() === kind);
    if (matched.length) return matched.sort((left, right) => timestampMs(right) - timestampMs(left))[0];
  }
  const root = unwrapData(payload);
  return firstDefined(root.submission, root.checkpoint, root.deadlineSubmission, submissions.sort((left, right) => timestampMs(right) - timestampMs(left))[0], null);
}

function confirmCheckpoint() {
  if (elements.checkpointButton.disabled) return;
  openModal({
    title: 'Check your in-progress score?',
    paragraphs: [
      'This saves one score checkpoint using your current answers. You can keep working afterward.',
      'Solutions and per-question correct answers remain unavailable until your final submission.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Check score', className: 'button button-primary', handler: submitCheckpoint }
    ]
  });
}

async function submitCheckpoint() {
  try {
    await flushPracticeEdits();
    const response = await api.post(
      `${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/checkpoint`,
      submissionRequestPayload()
    );
    mergeAttempt(response, { preferLocalAnswers: true });
    renderAttemptHeader();
    const submission = findRecentSubmission(response, ['CHECKPOINT']);
    openModal({
      title: 'Checkpoint saved',
      paragraphs: [checkpointSummary(submission)],
      actions: [{ label: 'Continue answering', className: 'button button-primary', close: true }]
    });
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not save a score checkpoint.');
  }
}

function confirmFinalSubmission() {
  if (elements.finalButton.disabled) return;
  if (normalizePhase(state.attempt) === 'LIMIT_NOTICE') {
    openLimitNotice();
    return;
  }
  const unanswered = state.questions.filter((question) => !state.answers.get(question.number)).length;
  openModal({
    title: 'Submit final answers?',
    paragraphs: [
      unanswered ? `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.` : 'All questions have an answer selected.',
      'Final submission ends this attempt. Your final score, answer review, and solutions will then be available.'
    ],
    actions: [
      { label: 'Keep working', className: 'button button-secondary', close: true },
      { label: 'Submit final answers', className: 'button button-danger', handler: finalizeAttempt }
    ]
  });
}

async function finalizeAttempt({ skipReasoningFlush = false } = {}) {
  try {
    await flushAnswerSaves();
    if (!skipReasoningFlush) await flushReasoningSaves();
    const id = encodeURIComponent(String(state.attempt.id));
    const response = normalizePhase(state.attempt) === 'LIMIT_NOTICE'
      ? await api.post(`${API_BASE}/attempts/${id}/deadline-decision`, submissionRequestPayload({ decision: 'finalize' }))
      : await api.post(`${API_BASE}/attempts/${id}/final`, submissionRequestPayload());
    state.learningSubmission = learningAnalysisProjection(response) || state.learningSubmission;
    hideModal({ force: true });
    mergeAttempt(response, { preferLocalAnswers: false });
    if (!canAccessFinalReview(state.attempt)) {
      await refreshAttempt();
      return;
    }
    await showResults();
  } catch (error) {
    if (error instanceof ApiError && error.code === 'REASONING_SAVE_FAILED') {
      offerUnsavedReasoningRecovery({
        actionLabel: 'submit final answers',
        onDiscard: () => finalizeAttempt({ skipReasoningFlush: true })
      });
      return;
    }
    await handleAttemptMutationError(error, 'Could not submit final answers.');
  }
}

function openLimitNotice() {
  if (!state.attempt || normalizePhase(state.attempt) !== 'LIMIT_NOTICE') return;
  if (state.modal?.type === 'limit-notice') return;
  const deadline = latestSubmissionOfKind(state.attempt, 'DEADLINE');
  const checkpoint = latestSubmissionOfKind(state.attempt, 'CHECKPOINT');
  const summary = deadline || checkpoint ? checkpointSummary(deadline || checkpoint) : 'The server has saved your time-limit checkpoint.';
  openModal({
    type: 'limit-notice',
    title: '75 minutes have elapsed',
    paragraphs: [
      summary,
      'Would you like to stop and make your final submission, or continue answering after the time limit?'
    ],
    dismissible: false,
    actions: [
      { label: 'Reset attempt', className: 'button button-secondary', handler: confirmReset },
      { label: 'Continue answering', className: 'button button-secondary', handler: continueAfterLimit },
      { label: 'Stop and submit final answers', className: 'button button-danger', handler: finalizeAttempt }
    ]
  });
}

async function continueAfterLimit() {
  try {
    const id = encodeURIComponent(String(state.attempt.id));
    const previousAttempt = state.attempt;
    const response = await api.post(
      `${API_BASE}/attempts/${id}/deadline-decision`,
      submissionRequestPayload({ decision: 'continue' })
    );
    const overtimeAttempt = mergeAttempt(response, { preferLocalAnswers: true });
    if (reasoningCapabilityNeedsReload(previousAttempt, overtimeAttempt)) {
      await loadReasoningNotes({ preserveLocal: true, quiet: true });
    }
    hideModal({ force: true });
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('You can continue answering. Your final submission remains available when you are ready.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not continue this attempt.');
  }
}

function openModal({ type = 'general', title, paragraphs = [], actions = [], dismissible = true }) {
  hideModal({ force: true, restoreFocus: false });
  state.lastFocused = document.activeElement;
  const invocation = { type, dismissible, busy: false };
  state.modal = invocation;
  elements.modalTitle.textContent = title;
  clearNode(elements.modalMessage);
  for (const paragraphText of paragraphs) {
    const paragraph = document.createElement('p');
    appendText(paragraph, paragraphText);
    elements.modalMessage.appendChild(paragraph);
  }
  clearNode(elements.modalActions);
  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = action.className || 'button button-secondary';
    button.textContent = action.label;
    button.disabled = action.disabled === true;
    if (!button.disabled) {
      button.addEventListener('click', async () => {
        if (action.close) {
          hideModal();
          return;
        }
        if (!action.handler) return;
        const finishAction = beginModalAction(state, invocation, [
          ...elements.modalActions.querySelectorAll('button'), elements.modalClose
        ]);
        if (!finishAction) return;
        const originalLabel = button.textContent;
        button.textContent = 'Working…';
        try {
          await action.handler();
        } finally {
          if (finishAction()) button.textContent = originalLabel;
        }
      });
    }
    elements.modalActions.appendChild(button);
  }
  elements.modalClose.disabled = false;
  elements.modalClose.hidden = !dismissible;
  elements.modalBackdrop.hidden = false;
  window.setTimeout(() => {
    if (state.modal !== invocation) return;
    const initial = elements.modalActions.querySelector('button:not([disabled])')
      || (!elements.modalClose.hidden && !elements.modalClose.disabled ? elements.modalClose : null);
    initial?.focus();
  }, 0);
}

function hideModal({ force = false, restoreFocus = true } = {}) {
  if (!state.modal) return;
  if ((!state.modal.dismissible || state.modal.busy) && !force) return;
  elements.modalBackdrop.hidden = true;
  state.modal = null;
  if (restoreFocus && state.lastFocused?.focus) state.lastFocused.focus();
  state.lastFocused = null;
}

function modalFocusableElements() {
  return [...elements.modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function normalizedResult(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.result, root.results, root, {});
}

function resultQuestionRows(result) {
  const candidates = [result?.questionResults, result?.questions, result?.answers, result?.items];
  return candidates.find(Array.isArray) || [];
}

function normalizeSolutionRows(payload) {
  const root = unwrapData(payload);
  const source = firstDefined(root.solutions, root.items, root.questions, root.form?.questions, []);
  if (!Array.isArray(source)) return [];
  return source.map((solution, index) => ({
    number: finiteNumber(firstDefined(solution?.questionNumber, solution?.number), index + 1),
    markdown: String(firstDefined(solution?.solutionMarkdown, solution?.markdown, solution?.solution, solution?.content, '')),
    title: String(firstDefined(solution?.title, `Question ${finiteNumber(firstDefined(solution?.questionNumber, solution?.number), index + 1)} solution`))
  })).sort((left, right) => left.number - right.number);
}

function renderResults(resultPayload, solutionsPayload) {
  const result = normalizedResult(resultPayload);
  state.learningSubmission = learningAnalysisProjection(resultPayload) || state.learningSubmission;
  const finalSubmission = firstDefined(result.finalSubmission, result.submission, null);
  const score = firstDefined(scoreFromSubmission(finalSubmission), result.score, result.totalScore, result.points, null);
  const total = firstDefined(maximumScoreFromSubmission(finalSubmission), result.maxScore, result.maximumScore, result.totalPossible, null);
  const correct = finiteNumber(firstDefined(finalSubmission?.score?.correctCount, result.correctCount, result.summary?.correctCount, result.counts?.correct));
  const incorrect = finiteNumber(firstDefined(finalSubmission?.score?.incorrectCount, result.incorrectCount, result.summary?.incorrectCount, result.counts?.incorrect));
  const blank = finiteNumber(firstDefined(finalSubmission?.score?.blankCount, result.blankCount, result.unansweredCount, result.summary?.blankCount, result.counts?.blank));
  const unscored = finiteNumber(firstDefined(finalSubmission?.score?.unscoredCount, result.unscoredCount, result.summary?.unscoredCount, result.counts?.unscored));
  elements.finalScore.textContent = total !== null && total !== undefined ? `${formatScore(score)} / ${formatScore(total)}` : formatScore(score);
  const detailParts = [];
  if (correct !== null) detailParts.push(`${correct} correct`);
  if (incorrect !== null) detailParts.push(`${incorrect} incorrect`);
  if (blank !== null) detailParts.push(`${blank} unanswered`);
  if (unscored !== null && unscored > 0) detailParts.push(`${unscored} not scored`);
  elements.scoreDetails.textContent = detailParts.join(' · ') || 'Final score recorded by the server.';
  elements.resultsSummary.textContent = `Submitted ${formatDateTime(firstDefined(finalSubmission?.createdAt, finalSubmission?.submittedAt, result.submittedAt, state.attempt?.finalizedAt))}.`;
  renderSubmissionHistory(firstDefined(result.submissions, submissionsFrom(state.attempt)) || []);
  renderResultQuestions(resultQuestionRows(finalSubmission || result));
  renderSolutions(normalizeSolutionRows(solutionsPayload));
  renderLearningAnalysisStatus();
}

function renderLearningAnalysisStatus() {
  if (!elements?.analysisSummary) return;
  const projectedStatus = ({
    BLOCKED_CONTEXT: 'CONTEXT_UNAVAILABLE',
    PENDING: 'QUEUED',
    PROCESSING: 'RUNNING',
    COMPLETED: 'COMPLETE'
  })[learningAnalysisDisplayStatus(state.learningSubmission)];
  const report = state.learningReport;
  const status = report?.status || projectedStatus || '';
  elements.analysisSummary.hidden = false;
  elements.analysisStatus.textContent = state.learningReportLoadError
    ? 'The report status could not be refreshed. Your objective score and answer review above are unaffected.'
    : learningReportStatusMessage(status);
  elements.refreshAnalysisButton.disabled = state.learningReportRequestInFlight;
  elements.refreshAnalysisButton.textContent = state.learningReportRequestInFlight ? 'Refreshing…' : 'Refresh analysis';
  clearNode(elements.analysisReportSummary);
  clearNode(elements.analysisQuestions);

  if (!report) {
    elements.analysisMeta.textContent = '';
    return;
  }
  const approvedCount = learningReportApprovedSolutionCount(report);
  const meta = [`${approvedCount} approved solution reference${approvedCount === 1 ? '' : 's'} reviewed`];
  if (report.generatedAt) meta.push(`Generated ${formatDateTime(report.generatedAt)}`);
  elements.analysisMeta.textContent = meta.join(' · ');

  if (['COMPLETE', 'PARTIAL', 'UNASSESSABLE', 'FAILED'].includes(report.status)) {
    const summary = report.summary;
    elements.analysisReportSummary.textContent = [
      `${summary.analyzedCount} analyzed`,
      `${summary.unassessableCount} unassessable`,
      `${summary.failedCount} failed`,
      `${summary.totalQuestions} total`
    ].join(' · ');
  }
  if (!['COMPLETE', 'PARTIAL', 'UNASSESSABLE'].includes(report.status)) return;
  for (const question of report.questions) renderLearningReportQuestion(question);
  typesetMath([elements.analysisReportSummary, elements.analysisQuestions]);
}

function appendLearningFeedbackList(container, title, items) {
  if (!items.length) return;
  const section = document.createElement('section');
  const heading = document.createElement('h4');
  heading.textContent = title;
  const list = document.createElement('ul');
  for (const item of items) {
    const row = document.createElement('li');
    row.textContent = item;
    list.appendChild(row);
  }
  section.append(heading, list);
  container.appendChild(section);
}

function renderLearningReportQuestion(question) {
  const card = document.createElement('article');
  card.className = 'analysis-question';
  const heading = document.createElement('div');
  heading.className = 'analysis-question-heading';
  const title = document.createElement('h3');
  title.textContent = `Question ${question.questionNumber}`;
  const status = document.createElement('span');
  status.className = 'analysis-question-status';
  status.textContent = question.status.toLowerCase().replaceAll('_', ' ');
  heading.append(title, status);
  card.appendChild(heading);

  if (question.status === 'UNASSESSABLE') {
    const notice = document.createElement('p');
    notice.className = 'muted';
    notice.textContent = 'The submitted reasoning did not contain enough detail for a reliable approach assessment.';
    card.appendChild(notice);
  }
  if (question.reasoningVerdict) {
    const verdict = document.createElement('p');
    verdict.className = 'analysis-verdict';
    verdict.textContent = question.reasoningVerdict;
    card.appendChild(verdict);
  }
  if (question.summaryMarkdown) {
    const summary = document.createElement('div');
    summary.className = 'analysis-question-summary';
    renderMarkdown(summary, question.summaryMarkdown, { allowExternalResources: false });
    card.appendChild(summary);
  }
  appendLearningFeedbackList(card, 'What worked', question.strengths);
  appendLearningFeedbackList(card, 'Gaps to address', question.gaps);
  appendLearningFeedbackList(card, 'Suggestions', question.suggestions);

  if (question.solutionComparisons.length) {
    const comparisons = document.createElement('section');
    comparisons.className = 'analysis-comparisons';
    const comparisonsHeading = document.createElement('h4');
    comparisonsHeading.textContent = `Compared with ${question.solutionComparisons.length} approved solution${question.solutionComparisons.length === 1 ? '' : 's'}`;
    comparisons.appendChild(comparisonsHeading);
    question.solutionComparisons.forEach((comparison, index) => {
      const comparisonCard = document.createElement('div');
      comparisonCard.className = 'analysis-comparison';
      const comparisonTitle = document.createElement('p');
      const details = [
        `Approved solution ${index + 1}`,
        comparison.alignment ? `Alignment: ${comparison.alignment}` : '',
        comparison.methodTags.length ? `Methods: ${comparison.methodTags.join(', ')}` : ''
      ].filter(Boolean);
      comparisonTitle.textContent = details.join(' · ');
      comparisonCard.appendChild(comparisonTitle);
      if (comparison.analysisMarkdown) {
        const body = document.createElement('div');
        renderMarkdown(body, comparison.analysisMarkdown, { allowExternalResources: false });
        comparisonCard.appendChild(body);
      }
      comparisons.appendChild(comparisonCard);
    });
    card.appendChild(comparisons);
  }
  elements.analysisQuestions.appendChild(card);
}

function learningReportContext() {
  if (!canAccessFinalReview(state.attempt) || !state.attempt?.id) return null;
  return { id: String(state.attempt.id), epoch: state.attemptEpoch };
}

function isCurrentLearningReportContext(context) {
  return learningReportContextMatches(
    context,
    state.attempt?.id,
    state.attemptEpoch,
    Boolean(elements?.resultsView && !elements.resultsView.hidden)
  );
}

function scheduleLearningReportPoll(context) {
  stopLearningReportPolling();
  if (!isCurrentLearningReportContext(context)
      || !learningReportShouldPoll(state.learningReport?.status)
      || state.learningReportPollCount >= MAX_LEARNING_REPORT_POLLS) return;
  state.learningReportPollCount += 1;
  state.learningReportPollTimer = window.setTimeout(() => {
    state.learningReportPollTimer = null;
    if (isCurrentLearningReportContext(context)) void loadLearningReport({ context, quiet: true });
  }, LEARNING_REPORT_POLL_MS);
}

async function loadLearningReport({ context = learningReportContext(), quiet = false } = {}) {
  if (!context || !isCurrentLearningReportContext(context) || state.learningReportRequestInFlight) return false;
  state.learningReportRequestInFlight = true;
  renderLearningAnalysisStatus();
  try {
    const response = await fetchLearningReport(api, state.attempt);
    if (!isCurrentLearningReportContext(context)) return false;
    const report = normalizeLearningReport(response);
    if (!report) throw new ApiError('The learning report response was invalid.', { code: 'INVALID_LEARNING_REPORT' });
    state.learningReport = report;
    state.learningReportLoadError = null;
    if (learningReportShouldPoll(report.status)) scheduleLearningReportPoll(context);
    else stopLearningReportPolling();
    return true;
  } catch (error) {
    if (!isCurrentLearningReportContext(context)) return false;
    state.learningReportLoadError = error;
    if (learningReportShouldPoll(state.learningReport?.status)) scheduleLearningReportPoll(context);
    else stopLearningReportPolling();
    return false;
  } finally {
    if (isCurrentLearningReportContext(context)) {
      state.learningReportRequestInFlight = false;
      renderLearningAnalysisStatus();
      if (!quiet && state.learningReportLoadError) elements.refreshAnalysisButton.focus();
    }
  }
}

function stopBatchPolling({ invalidate = true } = {}) {
  if (state.batchPollTimer) window.clearTimeout(state.batchPollTimer);
  state.batchPollTimer = null;
  if (invalidate) state.batchEpoch += 1;
}

function currentBatchOwner() {
  return state.resultsViewMode === 'BATCH_REVIEW' ? state.batchReviewWorkspace : state.attempt;
}

function currentBatchOwnerId() {
  return currentBatchOwner()?.id || null;
}

function currentBatchContext(batchId = state.activeBatchId) {
  const ownerId = currentBatchOwnerId();
  if (!ownerId || !batchId) return null;
  return { attemptId: String(ownerId), batchId: String(batchId), epoch: state.batchEpoch };
}

function isCurrentBatchContext(context) {
  return batchPollContextMatches(context, {
    attemptId: currentBatchOwnerId(),
    batchId: state.activeBatchId,
    epoch: state.batchEpoch,
    visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
  });
}

function batchCollectionPath(attemptId = currentBatchOwnerId()) {
  return `${API_BASE}/attempts/${opaquePathPart(attemptId)}/learning-batches`;
}

function batchItemPath(batchId) {
  return `${batchCollectionPath()}/${opaquePathPart(batchId)}`;
}

const BATCH_INTAKE_UNAVAILABLE_MESSAGE = 'Batch submission is not available yet.';

function currentBatchIntakeAvailable() {
  if (state.resultsViewMode === 'BATCH_REVIEW') {
    return batchReviewWorkspaceIntakeAvailable(state.batchReviewWorkspace);
  }
  return batchIntakeAvailableForAttempt(state.attempt, state.forms);
}

function setBatchStatus(message = '') {
  const parts = [];
  if (!currentBatchIntakeAvailable()) parts.push(BATCH_INTAKE_UNAVAILABLE_MESSAGE);
  if (message) parts.push(String(message));
  elements.batchStatus.textContent = parts.join(' ');
}

function syncBatchIntakeControls() {
  const available = currentBatchIntakeAvailable();
  elements.batchFiles.disabled = !available;
  elements.batchSubmitButton.disabled = !available;
  if (!available) {
    elements.batchUploadForm.reset();
    clearNode(elements.batchSelectedFiles);
  }
  setBatchStatus();
  return available;
}

function renderSelectedBatchFiles() {
  if (!currentBatchIntakeAvailable()) {
    syncBatchIntakeControls();
    return;
  }
  clearNode(elements.batchSelectedFiles);
  const files = Array.from(elements.batchFiles.files || []);
  if (!files.length) return;
  try {
    const descriptors = batchFileDescriptors(files);
    descriptors.forEach((descriptor) => {
      const row = document.createElement('div');
      row.className = 'batch-selected-file';
      const name = document.createElement('span');
      name.textContent = descriptor.displayName;
      const detail = document.createElement('span');
      detail.className = 'muted';
      detail.textContent = `${descriptor.kind.toLowerCase()} · ${formatFileBytes(descriptor.declaredBytes)}`;
      row.append(name, detail);
      elements.batchSelectedFiles.appendChild(row);
    });
  } catch (error) {
    const note = document.createElement('p');
    note.className = 'form-error';
    note.textContent = error.message;
    elements.batchSelectedFiles.appendChild(note);
  }
}

function formatFileBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return 'unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function statusPill(value) {
  const pill = document.createElement('span');
  pill.className = 'status-pill';
  const status = String(value || 'UNKNOWN').toUpperCase();
  pill.dataset.status = status;
  pill.textContent = status.toLowerCase().replaceAll('_', ' ');
  return pill;
}

function appendBatchMapping(batch, container) {
  const mapping = batch.mapping;
  const form = document.createElement('form');
  form.className = 'mapping-form';
  const callout = document.createElement('p');
  callout.className = 'confirmation-callout';
  callout.textContent = 'AI suggestions below are not accepted automatically. Review every answer and approach, assign it to the correct question or discard it, then explicitly confirm.';
  form.appendChild(callout);

  for (const { item, itemIndex } of numberedBatchMappingItems(mapping)) {
    const card = document.createElement('article');
    card.className = 'mapping-item';
    card.dataset.itemId = item.id;
    const header = document.createElement('div');
    header.className = 'mapping-item-header';
    const title = document.createElement('h3');
    title.textContent = `Extracted item ${itemIndex + 1}`;
    const warning = document.createElement('span');
    warning.className = 'muted';
    warning.textContent = item.requiresConfirmation ? 'Needs careful review' : 'AI suggestion';
    header.append(title, warning);
    card.appendChild(header);
    const evidence = document.createElement('blockquote');
    evidence.textContent = String(item.evidenceText || 'No evidence preview was returned.');
    card.appendChild(evidence);
    if (Array.isArray(item.confirmationReasons) && item.confirmationReasons.length) {
      const reasons = document.createElement('p');
      reasons.className = 'muted';
      reasons.textContent = `Review flags: ${item.confirmationReasons.map((reason) =>
        String(reason).toLowerCase().replaceAll('_', ' ')).join(', ')}.`;
      card.appendChild(reasons);
    }

    const discardLabel = document.createElement('label');
    discardLabel.className = 'mapping-discard';
    const discard = document.createElement('input');
    discard.type = 'checkbox';
    discard.className = 'mapping-discard-input';
    discard.checked = !Number.isSafeInteger(item.proposedQuestionNumber);
    discardLabel.append(discard, document.createTextNode('Discard this extracted item'));
    card.appendChild(discardLabel);

    const grid = document.createElement('div');
    grid.className = 'mapping-grid';
    const questionField = document.createElement('div');
    questionField.className = 'field';
    const questionId = `batch-${batch.id}-question-${item.id}`;
    const questionLabel = document.createElement('label');
    questionLabel.htmlFor = questionId;
    questionLabel.textContent = 'Question';
    const questionSelect = document.createElement('select');
    questionSelect.id = questionId;
    questionSelect.className = 'mapping-question';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose question';
    questionSelect.appendChild(placeholder);
    for (let number = 1; number <= 25; number += 1) {
      const option = document.createElement('option');
      option.value = String(number);
      option.textContent = `Question ${number}${number === item.proposedQuestionNumber ? ' — AI suggestion' : ''}`;
      option.selected = number === item.proposedQuestionNumber;
      questionSelect.appendChild(option);
    }
    questionField.append(questionLabel, questionSelect);

    const answerField = document.createElement('div');
    answerField.className = 'field';
    const answerId = `batch-${batch.id}-answer-${item.id}`;
    const answerLabel = document.createElement('label');
    answerLabel.htmlFor = answerId;
    answerLabel.textContent = 'Answer';
    const answerSelect = document.createElement('select');
    answerSelect.id = answerId;
    answerSelect.className = 'mapping-answer';
    for (const [value, label] of [['', 'Blank / no answer'], ...OPTIONS.map((option) => [option, option])]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = value === String(item.selectedOption || '');
      answerSelect.appendChild(option);
    }
    answerField.append(answerLabel, answerSelect);

    const reasoningField = document.createElement('div');
    reasoningField.className = 'field mapping-reasoning';
    const reasoningId = `batch-${batch.id}-reasoning-${item.id}`;
    const reasoningLabel = document.createElement('label');
    reasoningLabel.htmlFor = reasoningId;
    reasoningLabel.textContent = 'Your approach (review and edit)';
    const reasoning = document.createElement('textarea');
    reasoning.id = reasoningId;
    reasoning.className = 'mapping-reasoning-input';
    reasoning.rows = 4;
    reasoning.maxLength = MAX_REASONING_NOTE_BYTES;
    reasoning.value = String(item.reasoningSummary || '');
    reasoningField.append(reasoningLabel, reasoning);
    grid.append(questionField, answerField, reasoningField);
    card.appendChild(grid);

    const syncDiscard = () => {
      questionSelect.disabled = discard.checked;
      answerSelect.disabled = discard.checked;
      reasoning.disabled = discard.checked;
    };
    discard.addEventListener('change', syncDiscard);
    syncDiscard();
    form.appendChild(card);
  }

  const confirm = document.createElement('button');
  confirm.type = 'submit';
  confirm.className = 'button button-primary';
  confirm.textContent = 'Confirm reviewed mapping';
  const intakeAvailable = currentBatchIntakeAvailable();
  if (!intakeAvailable) {
    const unavailable = document.createElement('p');
    unavailable.id = `batch-${batch.id}-confirmation-unavailable`;
    unavailable.className = 'muted';
    unavailable.textContent = `${BATCH_INTAKE_UNAVAILABLE_MESSAGE} You can still review or delete this existing file submission.`;
    confirm.disabled = true;
    confirm.setAttribute('aria-describedby', unavailable.id);
    form.appendChild(unavailable);
  }
  form.appendChild(confirm);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentBatchIntakeAvailable()) {
      syncBatchIntakeControls();
      return;
    }
    const context = currentBatchContext(batch.id);
    if (!context || !isCurrentBatchContext(context)) return;
    const decisions = new Map();
    for (const card of form.querySelectorAll('.mapping-item')) {
      const discarded = card.querySelector('.mapping-discard-input').checked;
      decisions.set(card.dataset.itemId, discarded ? { action: 'DISCARD' } : {
        action: 'MAP',
        questionNumber: Number(card.querySelector('.mapping-question').value),
        selectedOption: card.querySelector('.mapping-answer').value,
        reasoningText: card.querySelector('.mapping-reasoning-input').value
      });
    }
    setButtonBusy(confirm, true, 'Confirming…');
    try {
      const payload = batchConfirmationPayload(mapping, decisions, { confirmed: true });
      const confirmKey = idempotencyKey();
      const response = await retryIdempotentNetworkMutation(
        () => api.post(`${batchItemPath(batch.id)}/confirm`, payload, { idempotency: confirmKey })
      );
      const confirmed = unwrapData(response).batch;
      if (!batchMutationContextMatches(context, {
        attemptId: currentBatchOwnerId(),
        activeBatchId: state.activeBatchId,
        epoch: state.batchEpoch,
        visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
      })) return;
      if (!confirmed?.id || String(confirmed.id) !== String(batch.id)
          || String(confirmed.attemptId) !== context.attemptId) {
        throw new ApiError('The confirmation response was invalid.', { code: 'INVALID_BATCH_RESPONSE' });
      }
      stopBatchPolling();
      state.activeBatchId = confirmed.id;
      renderBatchWorkspace(confirmed);
      showStatus('The reviewed mapping was committed. Its result and analysis now appear in Learning history.');
    } catch (error) {
      if (!batchMutationContextMatches(context, {
        attemptId: currentBatchOwnerId(),
        activeBatchId: state.activeBatchId,
        epoch: state.batchEpoch,
        visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
      })) return;
      handleError(error, 'Could not confirm this mapping.');
    } finally {
      if (batchMutationContextMatches(context, {
        attemptId: currentBatchOwnerId(),
        activeBatchId: state.activeBatchId,
        epoch: state.batchEpoch,
        visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
      })) setButtonBusy(confirm, false);
    }
  });
  container.appendChild(form);
}

function renderBatchWorkspace(batch) {
  clearNode(elements.batchWorkspace);
  if (!batch) return;
  const card = document.createElement('article');
  card.className = 'batch-card';
  const header = document.createElement('div');
  header.className = 'batch-card-header';
  const heading = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = 'File submission';
  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = `${batch.assets?.length || 0} file${batch.assets?.length === 1 ? '' : 's'} · Updated ${formatDateTime(batch.updatedAt)}`;
  heading.append(title, meta);
  header.append(heading, statusPill(batch.status));
  card.appendChild(header);

  if (Array.isArray(batch.assets) && batch.assets.length) {
    const assets = document.createElement('ul');
    for (const asset of batch.assets) {
      const row = document.createElement('li');
      row.textContent = `${asset.displayName} — ${String(asset.status || '').toLowerCase().replaceAll('_', ' ')}`;
      assets.appendChild(row);
    }
    card.appendChild(assets);
  }
  if (batch.status === 'PROCESSING') {
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'Audio transcription and answer decomposition are running. This page refreshes automatically.';
    card.appendChild(note);
  } else if (batch.status === 'NEEDS_CONFIRMATION' && batch.mapping) {
    appendBatchMapping(batch, card);
  } else if (batch.status === 'COMMITTED') {
    const score = document.createElement('p');
    score.className = 'analysis-verdict';
    score.textContent = batch.result
      ? `Mapped-question score: ${formatScore(batch.result.totalPoints)} / ${formatScore(batch.result.maximumPoints)} (${batch.result.mappedQuestionCount} mapped).`
      : 'The batch is committed. Its protected result is currently unavailable.';
    const history = document.createElement('button');
    history.type = 'button';
    history.className = 'button button-secondary';
    history.textContent = 'View analysis in Learning history';
    history.addEventListener('click', () => showLearningHistory({ submissionId: batch.learningSubmissionId }));
    card.append(score, history);
  } else if (batch.status === 'FAILED') {
    const note = document.createElement('p');
    note.className = 'form-error';
    note.textContent = `Processing failed${batch.failureCode ? ` (${batch.failureCode})` : ''}. Your confirmed learning record is unchanged; choose the files again to start a new batch.`;
    card.appendChild(note);
  }
  if (['DRAFT', 'FAILED', 'NEEDS_CONFIRMATION'].includes(batch.status)
      && String(batch.deletionState || 'ACTIVE') === 'ACTIVE') {
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'button button-danger'; remove.textContent = 'Delete file submission';
    remove.addEventListener('click', () => confirmDeleteLearningBatch(batch));
    card.appendChild(remove);
  }
  elements.batchWorkspace.appendChild(card);
}

function confirmDeleteLearningBatch(batch) {
  openModal({
    title: 'Delete this file submission?',
    paragraphs: ['Private uploaded files, pending extraction, and unconfirmed mapping will be purged. This does not change any confirmed learning record.'],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Delete files', className: 'button button-danger', handler: () => deleteLearningBatch(batch) }
    ]
  });
}

async function deleteLearningBatch(batch) {
  const context = currentBatchContext(batch?.id);
  if (!context || !isCurrentBatchContext(context)) return;
  const key = idempotencyKey();
  try {
    const response = await retryIdempotentNetworkMutation(
      () => api.delete(batchItemPath(batch.id), { idempotency: key })
    );
    if (!batchMutationContextMatches(context, {
      attemptId: currentBatchOwnerId(),
      activeBatchId: state.activeBatchId,
      epoch: state.batchEpoch,
      visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
    })) return;
    hideModal({ force: true });
    stopBatchPolling();
    state.activeBatchId = null;
    renderBatchWorkspace(unwrapData(response).batch || null);
    showStatus('The private file submission was deleted.');
  } catch (error) {
    if (!batchMutationContextMatches(context, {
      attemptId: currentBatchOwnerId(),
      activeBatchId: state.activeBatchId,
      epoch: state.batchEpoch,
      visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
    })) return;
    handleError(error, 'Could not delete this file submission.');
  }
}

function scheduleBatchPoll(context) {
  if (state.batchPollTimer) window.clearTimeout(state.batchPollTimer);
  if (!isCurrentBatchContext(context)) return;
  state.batchPollTimer = window.setTimeout(() => {
    state.batchPollTimer = null;
    if (isCurrentBatchContext(context)) void loadLearningBatch(context);
  }, BATCH_POLL_MS);
}

async function loadLearningBatch(context) {
  if (!isCurrentBatchContext(context)) return;
  try {
    const response = await api.get(batchItemPath(context.batchId));
    if (!isCurrentBatchContext(context)) return;
    const batch = unwrapData(response).batch;
    if (!batch?.id || String(batch.id) !== String(context.batchId)
        || String(batch.attemptId) !== String(context.attemptId)) {
      throw new ApiError('The batch response was invalid.', { code: 'INVALID_BATCH_RESPONSE' });
    }
    renderBatchWorkspace(batch);
    if (['DRAFT', 'PROCESSING'].includes(batch.status)) scheduleBatchPoll(context);
  } catch (error) {
    if (!isCurrentBatchContext(context)) return;
    setBatchStatus('Could not refresh file processing. Use Learning history or reopen this workspace to retry.');
    scheduleBatchPoll(context);
  }
}

async function loadLatestLearningBatch() {
  const ownerId = currentBatchOwnerId();
  if (!ownerId || elements.resultsView.hidden) return;
  const requestedAttemptId = String(ownerId);
  const requestedEpoch = state.batchEpoch;
  try {
    const response = await api.get(batchCollectionPath());
    if (String(currentBatchOwnerId() || '') !== requestedAttemptId || elements.resultsView.hidden
        || state.batchEpoch !== requestedEpoch) return;
    const batches = Array.isArray(unwrapData(response).batches) ? unwrapData(response).batches : [];
    const batch = [...batches].filter((item) => !item.deletedAt
        && String(item.attemptId) === requestedAttemptId)
      .sort((left, right) => timestampMs(right.updatedAt) - timestampMs(left.updatedAt))[0];
    if (!batch) return;
    stopBatchPolling();
    state.activeBatchId = batch.id;
    renderBatchWorkspace(batch);
    if (['DRAFT', 'PROCESSING'].includes(batch.status)) scheduleBatchPoll(currentBatchContext(batch.id));
  } catch {
    if (String(currentBatchOwnerId() || '') !== requestedAttemptId || elements.resultsView.hidden
        || state.batchEpoch !== requestedEpoch) return;
    setBatchStatus('Existing file submissions could not be loaded. Your confirmed learning record is unaffected.');
  }
}

async function submitBatchUpload(event) {
  event.preventDefault();
  if (!currentBatchIntakeAvailable()) {
    syncBatchIntakeControls();
    return;
  }
  const files = Array.from(elements.batchFiles.files || []);
  try {
    batchFileDescriptors(files);
  } catch (error) {
    handleError(error, 'Choose valid text or audio files first.');
    return;
  }
  stopBatchPolling();
  state.activeBatchId = null;
  const ownerId = currentBatchOwnerId();
  const context = {
    attemptId: String(ownerId || ''),
    batchId: null,
    epoch: state.batchEpoch
  };
  if (!context.attemptId) return;
  setButtonBusy(elements.batchSubmitButton, true, 'Uploading…');
  setBatchStatus();
  try {
    const batch = await submitLearningBatchFiles(api, ownerId, files, {
      onProgress(progress) {
        if (!batchMutationContextMatches(context, {
          attemptId: currentBatchOwnerId(),
          activeBatchId: state.activeBatchId,
          epoch: state.batchEpoch,
          visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
        })) return;
        const messages = {
          CREATING: 'Creating a private upload reservation…',
          UPLOADING: `Uploading ${progress.displayName || 'file'} (${progress.completed + 1} of ${progress.total})…`,
          SUBMITTING: 'Submitting files for transcription and decomposition…',
          PROCESSING: 'Files uploaded. Processing has started.'
        };
        setBatchStatus(messages[progress.phase] || '');
      }
    });
    if (!batchMutationContextMatches(context, {
      attemptId: currentBatchOwnerId(),
      activeBatchId: state.activeBatchId,
      epoch: state.batchEpoch,
      visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
    })) return;
    if (!batch?.id || String(batch.attemptId) !== context.attemptId) {
      throw new ApiError('The batch response was invalid.', { code: 'INVALID_BATCH_RESPONSE' });
    }
    setButtonBusy(elements.batchSubmitButton, false);
    stopBatchPolling();
    state.activeBatchId = batch.id;
    renderBatchWorkspace(batch);
    elements.batchUploadForm.reset();
    clearNode(elements.batchSelectedFiles);
    if (['DRAFT', 'PROCESSING'].includes(batch.status)) scheduleBatchPoll(currentBatchContext(batch.id));
  } catch (error) {
    if (!batchMutationContextMatches(context, {
      attemptId: currentBatchOwnerId(),
      activeBatchId: state.activeBatchId,
      epoch: state.batchEpoch,
      visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
    })) return;
    handleError(error, 'Could not upload this file submission.');
    setBatchStatus('Upload did not finish. Reopen this workspace to inspect any durable server-side progress before retrying.');
  } finally {
    if (batchMutationContextMatches(context, {
      attemptId: currentBatchOwnerId(),
      activeBatchId: state.activeBatchId,
      epoch: state.batchEpoch,
      visible: Boolean(elements?.resultsView && !elements.resultsView.hidden)
    })) {
      setButtonBusy(elements.batchSubmitButton, false);
      if (!currentBatchIntakeAvailable()) syncBatchIntakeControls();
    }
  }
}

export function normalizeLearningHistory(payload) {
  const root = unwrapData(payload);
  const source = Array.isArray(root.items) ? root.items : [];
  return {
    items: source.slice(0, 100).filter(isRecord).map((item) => ({
      submissionId: String(item.submissionId || ''),
      attemptId: String(item.attemptId || ''),
      title: item.title == null ? null : String(item.title),
      sourceType: String(item.sourceType || ''),
      currentVersion: finiteNumber(item.currentVersion),
      lifecycleStatus: String(item.lifecycleStatus || ''),
      protectedAccessStatus: String(item.protectedAccessStatus || ''),
      latestAnalysisStatus: String(item.latestAnalysisStatus || ''),
      latestReportStatus: item.latestReportStatus == null ? null : String(item.latestReportStatus),
      lastActivityAt: item.lastActivityAt || null,
      versions: Array.isArray(item.versions) ? item.versions.slice(0, 100).filter(isRecord).map((version) => ({
        versionNumber: finiteNumber(version.versionNumber),
        creationReason: String(version.creationReason || ''),
        contextStatus: String(version.contextStatus || ''),
        responseCount: finiteNumber(version.responseCount, 0),
        mappedQuestionCount: version.mappedQuestionCount == null ? null : finiteNumber(version.mappedQuestionCount, 0),
        questionNumbers: learningVersionQuestionNumbers(version),
        batchLineage: isRecord(version.batchLineage) ? {
          batchId: String(version.batchLineage.batchId || ''),
          sourceType: String(version.batchLineage.sourceType || ''),
          status: String(version.batchLineage.status || ''),
          committedAt: version.batchLineage.committedAt || null
        } : null,
        analysisStatus: String(version.analysisStatus || ''),
        resultStatus: String(version.resultStatus || ''),
        reportStatus: version.reportStatus == null ? null : String(version.reportStatus),
        createdAt: version.createdAt || null,
        lastActivityAt: version.lastActivityAt || null
      })).filter((version) => Number.isSafeInteger(version.versionNumber) && version.versionNumber > 0) : []
    })).filter((item) => item.submissionId),
    nextCursor: typeof root.nextCursor === 'string' && root.nextCursor ? root.nextCursor : null
  };
}

export function learningVersionQuestionNumbers(version) {
  return [...new Set((Array.isArray(version?.questionNumbers) ? version.questionNumbers : [])
    .map(Number).filter((number) => Number.isSafeInteger(number) && number >= 1 && number <= 100))]
    .sort((left, right) => left - right);
}

function stopLearningHistoryReportPolling() {
  if (state.learningHistoryReportPollTimer) window.clearTimeout(state.learningHistoryReportPollTimer);
  state.learningHistoryReportPollTimer = null;
  state.learningHistoryReportPollCount = 0;
}

function stopTutorPolling({ invalidate = true } = {}) {
  if (state.tutorPollTimer) window.clearTimeout(state.tutorPollTimer);
  state.tutorPollTimer = null;
  if (invalidate) state.learningHistoryEpoch += 1;
}

function clearTutorConversationDom({ clearSummaries = false, clearStatus = true } = {}) {
  if (!elements) return;
  clearNode(elements.tutorMessages);
  clearNode(elements.tutorRequests);
  elements.tutorMessageForm.reset();
  elements.tutorThread.hidden = true;
  elements.forkTutorThread.hidden = true;
  elements.tutorMessage.disabled = true;
  setButtonBusy(elements.sendTutorMessage, false);
  elements.sendTutorMessage.disabled = true;
  setButtonBusy(elements.forkTutorThread, false);
  if (clearSummaries) {
    clearNode(elements.tutorThreadList);
    elements.tutorLoadMore.hidden = true;
    setButtonBusy(elements.tutorLoadMore, false);
    setButtonBusy(elements.createTutorThread, false);
    elements.createTutorThread.disabled = true;
  }
  if (clearStatus) elements.tutorStatus.textContent = '';
}

function purgeTutorWorkspace({ clearSummaries = false, clearStatus = true } = {}) {
  stopTutorPolling({ invalidate: false });
  resetTutorConversationState(state, { clearSummaries });
  clearTutorConversationDom({ clearSummaries, clearStatus });
}

function historyContext(extra = {}) {
  return {
    epoch: state.learningHistoryEpoch,
    submissionId: state.learningHistorySubmission?.submissionId || null,
    versionNumber: state.learningHistoryVersion?.versionNumber || null,
    questionNumber: state.learningHistoryQuestion?.question?.questionNumber || null,
    ...extra
  };
}

function historyContextMatches(context, { requireQuestion = false } = {}) {
  if (!context || elements?.learningHistoryView?.hidden || context.epoch !== state.learningHistoryEpoch) return false;
  if (context.submissionId && String(context.submissionId) !== String(state.learningHistorySubmission?.submissionId)) return false;
  if (context.versionNumber && Number(context.versionNumber) !== Number(state.learningHistoryVersion?.versionNumber)) return false;
  if (requireQuestion && Number(context.questionNumber) !== Number(state.learningHistoryQuestion?.question?.questionNumber)) return false;
  return true;
}

function humanSourceType(value) {
  return ({ INTERACTIVE_FINAL: 'Interactive final', OPEN_REVIEW: 'Open review' })[String(value || '').toUpperCase()]
    || String(value || 'Learning submission').toLowerCase().replaceAll('_', ' ');
}

function humanVersionReason(value) {
  return ({ FINAL_SUBMISSION: 'Interactive final', BACKFILL: 'Interactive final', BATCH_COMMIT: 'Confirmed file batch', OPEN_REVIEW_ANCHOR: 'Open-review workspace' })[String(value || '').toUpperCase()]
    || String(value || 'Version').toLowerCase().replaceAll('_', ' ');
}

function hideLearningHistoryPanels(panel = null) {
  if (panel !== elements.learningQuestionDetail) {
    purgeTutorWorkspace({ clearSummaries: true });
  }
  for (const candidate of [elements.learningHistoryDetail, elements.learningVersionReport, elements.learningQuestionDetail]) {
    candidate.hidden = candidate !== panel;
  }
  elements.learningHistoryList.hidden = panel !== null;
  elements.learningHistoryLoadMore.hidden = panel !== null || !state.learningHistoryNextCursor;
}

function renderLearningHistoryList(items) {
  clearNode(elements.learningHistoryList);
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No finalized or confirmed learning submissions are available yet.';
    elements.learningHistoryList.appendChild(empty);
    return;
  }
  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'history-card';
    const header = document.createElement('div');
    header.className = 'history-card-header';
    const heading = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = item.title || 'Unavailable learning submission';
    const source = document.createElement('p');
    source.className = 'muted';
    source.textContent = humanSourceType(item.sourceType);
    heading.append(title, source);
    header.append(heading, statusPill(item.latestReportStatus || item.latestAnalysisStatus));
    const meta = document.createElement('div');
    meta.className = 'history-card-meta';
    for (const text of [
      `${item.versions.length} version${item.versions.length === 1 ? '' : 's'}`,
      `Updated ${formatDateTime(item.lastActivityAt)}`,
      item.protectedAccessStatus ? `Access: ${item.protectedAccessStatus.toLowerCase().replaceAll('_', ' ')}` : ''
    ].filter(Boolean)) {
      const span = document.createElement('span'); span.textContent = text; meta.appendChild(span);
    }
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'button button-secondary';
    open.textContent = 'View versions and reports';
    open.addEventListener('click', () => openLearningHistorySubmission(item.submissionId));
    card.append(header, meta, open);
    elements.learningHistoryList.appendChild(card);
  }
}

function renderLearningHistoryVersions(record) {
  elements.learningHistoryDetailTitle.textContent = record.title || 'Learning submission';
  elements.learningHistoryDetailSource.textContent = `${humanSourceType(record.sourceType)} · ${record.versions?.length || 0} version${record.versions?.length === 1 ? '' : 's'}`;
  clearNode(elements.learningHistoryVersions);
  for (const version of record.versions || []) {
    const card = document.createElement('article');
    card.className = 'history-version';
    const header = document.createElement('div');
    header.className = 'history-version-header';
    const heading = document.createElement('h3');
    heading.textContent = `Version ${version.versionNumber} · ${humanVersionReason(version.creationReason)}`;
    header.append(heading, statusPill(version.reportStatus || version.analysisStatus));
    const meta = document.createElement('div');
    meta.className = 'history-version-meta';
    for (const text of [
      `${finiteNumber(version.responseCount, 0)} submitted question${version.responseCount === 1 ? '' : 's'}`,
      `Saved ${formatDateTime(version.createdAt)}`,
      version.batchLineage ? 'Student-confirmed AI mapping' : ''
    ].filter(Boolean)) {
      const span = document.createElement('span'); span.textContent = text; meta.appendChild(span);
    }
    card.append(header, meta);
    if (version.creationReason !== 'OPEN_REVIEW_ANCHOR' && learningVersionQuestionNumbers(version).length) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-secondary';
      button.textContent = 'Open result and analysis report';
      button.addEventListener('click', () => openLearningHistoryVersion(version));
      card.appendChild(button);
    } else {
      const note = document.createElement('p'); note.className = 'muted';
      note.textContent = 'This blank workspace anchor has no submitted questions yet.';
      card.appendChild(note);
    }
    elements.learningHistoryVersions.appendChild(card);
  }
}

async function showLearningHistory({ submissionId = null } = {}) {
  hideModal({ force: true });
  stopAttemptSync();
  stopBatchPolling();
  purgeTutorWorkspace({ clearSummaries: true });
  stopLearningHistoryReportPolling();
  state.learningHistoryEpoch += 1;
  state.learningHistorySubmission = null;
  state.learningHistoryVersion = null;
  state.learningHistoryQuestion = null;
  state.learningHistoryNextCursor = null;
  showOnly(elements.learningHistoryView);
  hideLearningHistoryPanels();
  clearNode(elements.learningHistoryList);
  elements.learningHistoryStatus.textContent = 'Loading learning history…';
  const epoch = state.learningHistoryEpoch;
  try {
    const response = await api.get(learningHistoryPath());
    if (elements.learningHistoryView.hidden || epoch !== state.learningHistoryEpoch) return;
    const history = normalizeLearningHistory(response);
    state.learningHistoryItems = history.items;
    state.learningHistoryNextCursor = history.nextCursor;
    renderLearningHistoryList(history.items);
    elements.learningHistoryLoadMore.hidden = !history.nextCursor;
    elements.learningHistoryStatus.textContent = history.nextCursor ? 'Showing the 20 most recent submissions.' : '';
    if (submissionId) await openLearningHistorySubmission(submissionId);
    document.getElementById('main-content').focus();
  } catch (error) {
    if (epoch !== state.learningHistoryEpoch) return;
    elements.learningHistoryStatus.textContent = 'Learning history could not be loaded.';
    handleError(error, 'Could not load learning history.');
  }
}

async function loadMoreLearningHistory() {
  const cursor = state.learningHistoryNextCursor;
  if (!cursor || elements.learningHistoryView.hidden) return;
  const epoch = state.learningHistoryEpoch;
  setButtonBusy(elements.learningHistoryLoadMore, true, 'Loading…');
  try {
    const response = await api.get(learningHistoryPath({ cursor }));
    if (epoch !== state.learningHistoryEpoch || elements.learningHistoryView.hidden) return;
    const page = normalizeLearningHistory(response);
    const existing = new Set(state.learningHistoryItems.map((item) => item.submissionId));
    state.learningHistoryItems.push(...page.items.filter((item) => !existing.has(item.submissionId)));
    state.learningHistoryNextCursor = page.nextCursor;
    renderLearningHistoryList(state.learningHistoryItems);
    elements.learningHistoryLoadMore.hidden = !page.nextCursor;
    elements.learningHistoryStatus.textContent = page.nextCursor ? 'More older submissions are available.' : 'All submissions are shown.';
  } catch (error) {
    if (epoch === state.learningHistoryEpoch) handleError(error, 'Could not load older submissions.');
  } finally {
    setButtonBusy(elements.learningHistoryLoadMore, false);
  }
}

async function openLearningHistorySubmission(submissionId) {
  purgeTutorWorkspace({ clearSummaries: true });
  stopLearningHistoryReportPolling();
  state.learningHistoryEpoch += 1;
  const epoch = state.learningHistoryEpoch;
  elements.learningHistoryStatus.textContent = 'Loading submission versions…';
  try {
    const rawRecord = unwrapData(await api.get(learningHistorySubmissionPath(submissionId)));
    const record = normalizeLearningHistory({ items: [rawRecord] }).items[0];
    if (elements.learningHistoryView.hidden || epoch !== state.learningHistoryEpoch) return;
    if (!record || String(record.submissionId || '') !== String(submissionId)) {
      throw new ApiError('The learning-history response did not match this submission.', { code: 'INVALID_LEARNING_HISTORY_RESPONSE' });
    }
    state.learningHistorySubmission = record;
    state.learningHistoryVersion = null;
    state.learningHistoryQuestion = null;
    renderLearningHistoryVersions(record);
    hideLearningHistoryPanels(elements.learningHistoryDetail);
    elements.learningHistoryStatus.textContent = '';
  } catch (error) {
    if (epoch !== state.learningHistoryEpoch) return;
    handleError(error, 'Could not open this learning submission.');
  }
}

function renderHistoryReport(report, version) {
  elements.learningVersionReportMeta.textContent = `Version ${version.versionNumber} · ${humanVersionReason(version.creationReason)}`;
  elements.learningVersionReportStatus.textContent = learningReportStatusMessage(report.status);
  clearNode(elements.learningVersionReportSummary);
  clearNode(elements.learningVersionQuestions);
  const summary = document.createElement('p');
  summary.textContent = [
    `${report.summary.analyzedCount} analyzed`, `${report.summary.unassessableCount} unassessable`,
    `${report.summary.failedCount} failed`, `${report.summary.totalQuestions} total`
  ].join(' · ');
  elements.learningVersionReportSummary.appendChild(summary);
  const analyses = new Map(report.questions.map((question) => [question.questionNumber, question]));
  for (const questionNumber of learningVersionQuestionNumbers(version)) {
    const question = analyses.get(questionNumber);
    const card = document.createElement('article');
    card.className = 'analysis-question';
    const header = document.createElement('div');
    header.className = 'analysis-question-heading';
    const title = document.createElement('h3'); title.textContent = `Question ${questionNumber}`;
    header.append(title, statusPill(question?.status || report.status));
    card.appendChild(header);
    if (question?.reasoningVerdict) {
      const verdict = document.createElement('p'); verdict.className = 'analysis-verdict'; verdict.textContent = question.reasoningVerdict; card.appendChild(verdict);
    }
    if (question?.summaryMarkdown) {
      const body = document.createElement('div');
      renderMarkdown(body, question.summaryMarkdown, { allowExternalResources: false });
      card.appendChild(body);
    }
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'button button-secondary'; open.textContent = 'Review question and discuss';
    open.addEventListener('click', () => openLearningHistoryQuestion(questionNumber));
    card.appendChild(open);
    elements.learningVersionQuestions.appendChild(card);
  }
  typesetMath([elements.learningVersionReportSummary, elements.learningVersionQuestions]);
}

function scheduleHistoryReportPoll(context) {
  if (state.learningHistoryReportPollTimer) window.clearTimeout(state.learningHistoryReportPollTimer);
  if (!historyContextMatches(context) || !learningReportShouldPoll(state.learningHistoryReport?.status)
      || state.learningHistoryReportPollCount >= MAX_LEARNING_REPORT_POLLS) return;
  state.learningHistoryReportPollCount += 1;
  state.learningHistoryReportPollTimer = window.setTimeout(() => {
    state.learningHistoryReportPollTimer = null;
    if (historyContextMatches(context)) void loadHistoryReport(context);
  }, LEARNING_REPORT_POLL_MS);
}

async function loadHistoryReport(context) {
  if (!historyContextMatches(context)) return;
  try {
    const response = await api.get(learningHistoryReportPath(context.submissionId, context.versionNumber));
    if (!historyContextMatches(context)) return;
    const report = normalizeLearningReport(response);
    if (!report || String(report.learningSubmissionId) !== String(context.submissionId)
        || Number(report.version) !== Number(context.versionNumber)) {
      throw new ApiError('The analysis report did not match the selected version.', { code: 'INVALID_LEARNING_REPORT' });
    }
    state.learningHistoryReport = report;
    renderHistoryReport(report, state.learningHistoryVersion);
    if (learningReportShouldPoll(report.status)) scheduleHistoryReportPoll(context);
  } catch (error) {
    if (!historyContextMatches(context)) return;
    elements.learningVersionReportStatus.textContent = 'The report could not be refreshed. The submitted response remains available.';
    if (learningReportShouldPoll(state.learningHistoryReport?.status)) scheduleHistoryReportPoll(context);
  }
}

async function openLearningHistoryVersion(version) {
  purgeTutorWorkspace({ clearSummaries: true });
  stopLearningHistoryReportPolling();
  state.learningHistoryEpoch += 1;
  state.learningHistoryVersion = version;
  state.learningHistoryQuestion = null;
  state.learningHistoryReport = {
    learningSubmissionId: state.learningHistorySubmission.submissionId,
    version: version.versionNumber,
    status: ['QUEUED', 'RUNNING'].includes(version.analysisStatus) ? version.analysisStatus : 'QUEUED',
    generatedAt: null,
    summary: { totalQuestions: version.responseCount || 0, analyzedCount: 0, unassessableCount: 0, failedCount: 0 },
    questions: []
  };
  hideLearningHistoryPanels(elements.learningVersionReport);
  renderHistoryReport(state.learningHistoryReport, version);
  const context = historyContext();
  await loadHistoryReport(context);
}

function appendRestrictedMarkdownSection(container, title, markdown) {
  const section = document.createElement('section');
  const heading = document.createElement('h3'); heading.textContent = title;
  const body = document.createElement('div');
  renderMarkdown(body, markdown || 'Not provided.', { allowExternalResources: false });
  section.append(heading, body);
  container.appendChild(section);
}

function renderHistoryQuestion(record) {
  const number = record.question.questionNumber;
  elements.learningQuestionMeta.textContent = `Version ${record.versionNumber} · ${record.title || 'AMC 12'}`;
  elements.learningQuestionTitle.textContent = `Question ${number}`;
  clearNode(elements.learningQuestionPrompt);
  renderMarkdown(elements.learningQuestionPrompt, record.question.promptMarkdown);
  clearNode(elements.learningQuestionChoices);
  for (const choice of record.question.choices || []) {
    const row = document.createElement('div'); row.className = 'history-question-choice';
    const label = document.createElement('strong'); label.textContent = `${choice.option}. `;
    row.appendChild(label);
    const body = document.createElement('div'); renderMarkdown(body, choice.textMarkdown); row.appendChild(body);
    elements.learningQuestionChoices.appendChild(row);
  }
  clearNode(elements.learningQuestionResponse);
  const responseTitle = document.createElement('h3'); responseTitle.textContent = 'Your submitted response';
  const answer = document.createElement('p'); answer.textContent = `Answer: ${record.response.selectedOption || 'Blank'}`;
  elements.learningQuestionResponse.append(responseTitle, answer);
  appendRestrictedMarkdownSection(elements.learningQuestionResponse, 'Your approach', record.response.reasoningText || 'No approach was submitted.');
  if (record.protected?.result) {
    const result = document.createElement('p');
    result.textContent = record.protected.result.isScored === false ? 'This question was not scored.'
      : `Result: ${record.protected.result.isCorrect === true ? 'Correct' : (record.protected.result.isCorrect === false ? 'Incorrect' : 'Blank')} · ${formatScore(record.protected.result.points)} points`;
    elements.learningQuestionResponse.appendChild(result);
  }
  clearNode(elements.learningQuestionAnalysis);
  const analysis = record.protected?.analysis;
  if (analysis) {
    if (analysis.reasoningVerdict) {
      const verdict = document.createElement('p'); verdict.className = 'analysis-verdict'; verdict.textContent = analysis.reasoningVerdict;
      elements.learningQuestionAnalysis.appendChild(verdict);
    }
    if (analysis.summaryMarkdown) appendRestrictedMarkdownSection(elements.learningQuestionAnalysis, 'Analysis', analysis.summaryMarkdown);
    appendLearningFeedbackList(elements.learningQuestionAnalysis, 'What worked', analysis.strengths || []);
    appendLearningFeedbackList(elements.learningQuestionAnalysis, 'Gaps to address', analysis.gaps || []);
    appendLearningFeedbackList(elements.learningQuestionAnalysis, 'Suggestions', analysis.suggestions || []);
    for (const [index, comparison] of (analysis.solutionComparisons || []).entries()) {
      appendRestrictedMarkdownSection(elements.learningQuestionAnalysis,
        `Approved solution ${index + 1}${comparison.methodTags?.length ? ` · ${comparison.methodTags.join(', ')}` : ''}`,
        comparison.analysisMarkdown);
    }
  } else {
    const note = document.createElement('p'); note.className = 'muted';
    note.textContent = record.protected ? 'Analysis for this question is not available yet.' : 'Protected result and analysis are currently withheld.';
    elements.learningQuestionAnalysis.appendChild(note);
  }
  elements.createTutorThread.disabled = record.protected?.analysis?.status !== 'SUCCEEDED';
  typesetMath([elements.learningQuestionPrompt, elements.learningQuestionChoices,
    elements.learningQuestionResponse, elements.learningQuestionAnalysis]);
}

async function openLearningHistoryQuestion(questionNumber) {
  purgeTutorWorkspace({ clearSummaries: true });
  state.learningHistoryEpoch += 1;
  const context = {
    epoch: state.learningHistoryEpoch,
    submissionId: state.learningHistorySubmission.submissionId,
    versionNumber: state.learningHistoryVersion.versionNumber,
    questionNumber
  };
  elements.learningVersionReportStatus.textContent = `Loading question ${questionNumber}…`;
  try {
    const record = unwrapData(await api.get(learningHistoryQuestionPath(
      context.submissionId, context.versionNumber, questionNumber
    )));
    if (elements.learningHistoryView.hidden || context.epoch !== state.learningHistoryEpoch) return;
    if (String(record.submissionId) !== String(context.submissionId)
        || Number(record.versionNumber) !== Number(context.versionNumber)
        || Number(record.question?.questionNumber) !== Number(questionNumber)) {
      throw new ApiError('The question response did not match this report.', { code: 'INVALID_LEARNING_HISTORY_RESPONSE' });
    }
    state.learningHistoryQuestion = record;
    renderHistoryQuestion(record);
    hideLearningHistoryPanels(elements.learningQuestionDetail);
    await loadTutorThreads(historyContext());
  } catch (error) {
    if (context.epoch !== state.learningHistoryEpoch) return;
    handleError(error, 'Could not open this submitted question.');
  }
}

function currentTutorIdentity() {
  const question = state.learningHistoryQuestion;
  if (!question) return null;
  return {
    submissionId: question.submissionId,
    versionNumber: question.versionNumber,
    questionNumber: question.question.questionNumber
  };
}

function renderTutorThreads(threads) {
  clearNode(elements.tutorThreadList);
  for (const [index, summary] of threads.entries()) {
    const model = tutorThreadRowModel(summary, index, state.tutorSelectedThreadId);
    const row = document.createElement('article');
    row.className = 'tutor-thread-card';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'button button-secondary tutor-thread-open';
    open.textContent = model.visibleLabel;
    open.setAttribute('aria-label', model.openLabel);
    open.setAttribute('aria-current', model.current ? 'true' : 'false');
    open.disabled = !model.canOpen;
    open.addEventListener('click', () => loadTutorThread(summary.thread.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button button-danger';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', model.deleteLabel);
    remove.addEventListener('click', () => confirmDeleteTutorThread(summary.thread.id));
    row.append(open, remove);
    if (model.unavailableText) {
      const unavailable = document.createElement('p');
      unavailable.id = `tutor-source-unavailable-${index}`;
      unavailable.className = 'muted tutor-source-unavailable';
      unavailable.textContent = model.unavailableText;
      open.setAttribute('aria-describedby', unavailable.id);
      row.appendChild(unavailable);
    }
    elements.tutorThreadList.appendChild(row);
  }
  elements.tutorLoadMore.hidden = !state.tutorNextCursor;
}

function upsertTutorSummaryFromBundle(bundle) {
  const identity = currentTutorIdentity();
  const summary = tutorSummaryFromBundle(bundle);
  if (!tutorSummaryMatchesIdentity(summary, identity)
      || state.deletedTutorThreadIds.has(String(summary?.thread?.id))) {
    throw new ApiError('The Tutor summary did not match this question.', { code: 'INVALID_TUTOR_RESPONSE' });
  }
  state.tutorThreads = [summary, ...state.tutorThreads.filter((item) => item.thread.id !== summary.thread.id)]
    .sort((left, right) => timestampMs(right.thread.updatedAt) - timestampMs(left.thread.updatedAt)
      || left.thread.id.localeCompare(right.thread.id));
  return summary;
}

function renderTutorThread(bundle) {
  upsertTutorSummaryFromBundle(bundle);
  state.tutorThread = bundle;
  state.tutorForkRequired = bundle.thread.status === 'CAPACITY_REACHED';
  elements.tutorThread.hidden = false;
  renderTutorThreads(state.tutorThreads);
  clearNode(elements.tutorMessages);
  for (const message of bundle.messages || []) {
    const card = document.createElement('article'); card.className = 'tutor-message';
    const role = String(message.role || '').toUpperCase(); card.dataset.role = role;
    const label = document.createElement('p'); label.className = 'tutor-message-label';
    label.textContent = role === 'ASSISTANT' ? 'AI tutor' : 'You';
    const body = document.createElement('div');
    renderMarkdown(body, message.contentMarkdown, { allowExternalResources: false });
    card.append(label, body); elements.tutorMessages.appendChild(card);
  }
  clearNode(elements.tutorRequests);
  for (const request of bundle.requests || []) {
    const row = document.createElement('div'); row.className = 'tutor-request';
    const label = document.createElement('span'); label.textContent = `Request ${request.requestOrdinal}`;
    row.append(label, statusPill(request.status));
    if (request.outcomeCode && request.status !== 'SUCCEEDED') {
      const outcome = document.createElement('span'); outcome.className = 'muted';
      outcome.textContent = String(request.outcomeCode).toLowerCase().replaceAll('_', ' '); row.appendChild(outcome);
    }
    if (tutorRequestMayRetry(request)) {
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'button button-secondary';
      retry.textContent = 'Retry request'; retry.addEventListener('click', () => retryTutorRequest(request.requestOrdinal, retry));
      row.appendChild(retry);
    }
    elements.tutorRequests.appendChild(row);
  }
  const { pending, atCapacity } = syncTutorComposerAvailability(bundle);
  elements.tutorStatus.textContent = pending ? 'AI is working on the latest request…'
    : (atCapacity ? 'This discussion reached its safe context limit. Fork it to continue from the latest successful answer.' : '');
  typesetMath([elements.tutorMessages]);
}

function syncTutorComposerAvailability(bundle = state.tutorThread) {
  const pending = (bundle?.requests || []).some(tutorRequestIsPending);
  const atCapacity = state.tutorForkRequired || bundle?.thread?.status === 'CAPACITY_REACHED';
  elements.forkTutorThread.hidden = !atCapacity;
  const unavailable = !bundle || pending || atCapacity || bundle.thread.status !== 'OPEN';
  elements.tutorMessage.disabled = unavailable;
  elements.sendTutorMessage.disabled = unavailable;
  return { pending, atCapacity };
}

function currentTutorPollContext(threadId) {
  const identity = currentTutorIdentity();
  return identity && String(state.tutorSelectedThreadId) === String(threadId)
    && !state.deletedTutorThreadIds.has(String(threadId)) ? {
    ...identity, threadId, epoch: state.learningHistoryEpoch, loadSequence: state.tutorLoadSequence
  } : null;
}

function isCurrentTutorPollContext(context) {
  const identity = currentTutorIdentity();
  return tutorThreadLoadContextMatches(context, {
    ...identity,
    selectedThreadId: state.tutorSelectedThreadId,
    epoch: state.learningHistoryEpoch,
    loadSequence: state.tutorLoadSequence,
    deleted: state.deletedTutorThreadIds.has(String(context?.threadId)),
    visible: Boolean(identity && elements?.learningQuestionDetail && !elements.learningQuestionDetail.hidden)
  });
}

function scheduleTutorPoll(context) {
  if (state.tutorPollTimer) window.clearTimeout(state.tutorPollTimer);
  if (!isCurrentTutorPollContext(context)) return;
  state.tutorPollTimer = window.setTimeout(() => {
    state.tutorPollTimer = null;
    if (isCurrentTutorPollContext(context)) void loadTutorThread(context.threadId, { quiet: true, context });
  }, TUTOR_POLL_MS);
}

async function loadTutorThreads(context = historyContext()) {
  if (!historyContextMatches(context, { requireQuestion: true })) return;
  const identity = currentTutorIdentity();
  purgeTutorWorkspace({ clearSummaries: true, clearStatus: false });
  elements.tutorStatus.textContent = 'Loading discussions…';
  const listSequence = state.tutorListSequence;
  renderTutorThreads([]);
  elements.tutorLoadMore.hidden = true;
  try {
    const response = unwrapData(await api.get(tutorThreadListPath(identity)));
    if (!historyContextMatches(context, { requireQuestion: true })
        || listSequence !== state.tutorListSequence) return;
    state.tutorThreads = Array.isArray(response.items)
      ? response.items.map(normalizeTutorThreadSummary)
        .filter((summary) => tutorSummaryMatchesIdentity(summary, identity)
          && !state.deletedTutorThreadIds.has(String(summary.thread.id))) : [];
    state.tutorNextCursor = typeof response.nextCursor === 'string' && response.nextCursor
      ? response.nextCursor : null;
    const eligible = state.learningHistoryQuestion?.protected?.analysis?.status === 'SUCCEEDED';
    elements.createTutorThread.disabled = !eligible;
    renderTutorThreads(state.tutorThreads);
    elements.tutorStatus.textContent = state.tutorThreads.length ? 'Choose a discussion or start a new one.'
      : (eligible ? 'No discussion has been started for this question.'
        : 'AI discussion becomes available after this question has a completed analysis.');
    const initialThreadId = firstEntitledTutorThreadId(state.tutorThreads);
    if (initialThreadId) await loadTutorThread(initialThreadId);
    else if (state.tutorThreads.length) {
      elements.tutorStatus.textContent = 'Source unavailable—delete a discussion to free capacity or start a new one.';
    }
  } catch (error) {
    if (!historyContextMatches(context, { requireQuestion: true })
        || listSequence !== state.tutorListSequence) return;
    state.tutorThreads = [];
    state.tutorNextCursor = null;
    if (error.status === 404) elements.createTutorThread.disabled = true;
    renderTutorThreads([]);
    elements.tutorStatus.textContent = error.status === 404
      ? 'AI discussion is not available for this report yet.' : 'Discussions could not be loaded.';
  }
}

async function loadMoreTutorThreads() {
  const identity = currentTutorIdentity();
  const cursor = state.tutorNextCursor;
  const listSequence = state.tutorListSequence;
  const pageContext = { cursor, listSequence };
  const context = historyContext();
  if (!identity || !cursor || !historyContextMatches(context, { requireQuestion: true })) return;
  setButtonBusy(elements.tutorLoadMore, true, 'Loading…');
  try {
    const response = unwrapData(await api.get(tutorThreadListPath(identity, { cursor })));
    if (!historyContextMatches(context, { requireQuestion: true })
        || !tutorListPageContextMatches(pageContext, {
          cursor: state.tutorNextCursor, listSequence: state.tutorListSequence, visible: true
        })) return;
    const page = Array.isArray(response.items) ? response.items.map(normalizeTutorThreadSummary)
      .filter((summary) => tutorSummaryMatchesIdentity(summary, identity)
        && !state.deletedTutorThreadIds.has(String(summary.thread.id))) : [];
    const seen = new Set(state.tutorThreads.map((summary) => summary.thread.id));
    state.tutorThreads.push(...page.filter((summary) => !seen.has(summary.thread.id)));
    state.tutorNextCursor = typeof response.nextCursor === 'string' && response.nextCursor
      ? response.nextCursor : null;
    renderTutorThreads(state.tutorThreads);
    elements.tutorStatus.textContent = state.tutorNextCursor
      ? 'More earlier discussions are available.' : 'All discussions are shown.';
  } catch (error) {
    if (historyContextMatches(context, { requireQuestion: true })
        && listSequence === state.tutorListSequence) {
      handleError(error, 'Could not load earlier discussions.');
    }
  } finally {
    setButtonBusy(elements.tutorLoadMore, false);
    if (listSequence === state.tutorListSequence) {
      elements.tutorLoadMore.hidden = !state.tutorNextCursor;
    }
  }
}

async function loadTutorThread(threadId, { quiet = false, context = null } = {}) {
  const identity = currentTutorIdentity();
  const summary = state.tutorThreads.find((item) => String(item.thread.id) === String(threadId));
  if (!identity || state.deletedTutorThreadIds.has(String(threadId))
      || (summary && summary.sourceEntitled !== true)) return;
  if (!context) {
    if (state.tutorPollTimer) window.clearTimeout(state.tutorPollTimer);
    state.tutorPollTimer = null;
    state.tutorLoadSequence += 1;
    state.tutorSelectedThreadId = String(threadId);
    state.tutorThread = null;
    clearTutorConversationDom({ clearStatus: false });
    context = currentTutorPollContext(threadId);
  }
  if (!isCurrentTutorPollContext(context)) return;
  try {
    const response = unwrapData(await api.get(tutorThreadPath(identity, threadId)));
    if (!isCurrentTutorPollContext(context)) return;
    if (!tutorBundleMatchesIdentity(response.thread, identity, threadId)) {
      throw new ApiError('The Tutor response did not match this discussion.', { code: 'INVALID_TUTOR_RESPONSE' });
    }
    const bundle = response.thread;
    renderTutorThread(bundle);
    if ((bundle.requests || []).some(tutorRequestIsPending)) scheduleTutorPoll(currentTutorPollContext(threadId));
  } catch (error) {
    if (!isCurrentTutorPollContext(context)) return;
    if (tutorFullGetSourceUnavailable(error)) {
      const unavailable = state.tutorThreads.find((item) => String(item.thread.id) === String(threadId));
      if (unavailable) {
        unavailable.sourceEntitled = false;
        unavailable.latestRequest = null;
      }
      purgeTutorWorkspace({ clearSummaries: false });
      renderTutorThreads(state.tutorThreads);
      elements.tutorStatus.textContent = 'Source unavailable—delete to free capacity.';
      return;
    }
    if (quiet) {
      elements.tutorStatus.textContent = 'Tutor status could not be refreshed; retrying…';
      scheduleTutorPoll(context);
      return;
    }
    handleError(error, 'Could not load this discussion.');
  }
}

async function createTutorThread() {
  const identity = currentTutorIdentity();
  if (!identity || elements.createTutorThread.disabled) return;
  setButtonBusy(elements.createTutorThread, true, 'Starting…');
  const context = historyContext();
  const loadSequence = state.tutorLoadSequence;
  try {
    const response = unwrapData(await createTutorThreadRequest(api, identity));
    if (!historyContextMatches(context, { requireQuestion: true })
        || loadSequence !== state.tutorLoadSequence) return;
    if (!tutorBundleMatchesIdentity(response.thread, identity)) {
      throw new ApiError('The Tutor response was invalid.', { code: 'INVALID_TUTOR_RESPONSE' });
    }
    state.tutorLoadSequence += 1;
    state.tutorSelectedThreadId = response.thread.thread.id;
    renderTutorThread(response.thread);
    elements.tutorStatus.textContent = 'Discussion ready. Ask about this question below.';
  } catch (error) {
    if (historyContextMatches(context, { requireQuestion: true })) handleError(error, 'Could not start a discussion for this question.');
  } finally {
    setButtonBusy(elements.createTutorThread, false);
    elements.createTutorThread.disabled = state.learningHistoryQuestion?.protected?.analysis?.status !== 'SUCCEEDED';
  }
}

async function sendTutorMessage(event) {
  event.preventDefault();
  const identity = currentTutorIdentity();
  const threadId = state.tutorThread?.thread?.id;
  const message = elements.tutorMessage.value.trim();
  if (!identity || !threadId || !message) return;
  const context = currentTutorPollContext(threadId);
  if (!context) return;
  setButtonBusy(elements.sendTutorMessage, true, 'Sending…');
  try {
    const response = unwrapData(await sendTutorMessageRequest(api, identity, threadId, message));
    if (!isCurrentTutorPollContext(context)) return;
    if (!tutorBundleMatchesIdentity(response.thread, identity, threadId)) {
      throw new ApiError('The Tutor response did not match this discussion.', { code: 'INVALID_TUTOR_RESPONSE' });
    }
    elements.tutorMessageForm.reset();
    renderTutorThread(response.thread);
    scheduleTutorPoll(currentTutorPollContext(threadId));
  } catch (error) {
    if (!isCurrentTutorPollContext(context)) return;
    if (error instanceof ApiError && error.code === 'TUTOR_FORK_REQUIRED') {
      state.tutorForkRequired = true;
      elements.tutorStatus.textContent = 'This discussion reached its limit. Fork it to continue.';
    }
    handleError(error, 'Could not send this Tutor message.');
  } finally {
    setButtonBusy(elements.sendTutorMessage, false);
    syncTutorComposerAvailability();
  }
}

async function retryTutorRequest(requestOrdinal, button) {
  const identity = currentTutorIdentity();
  const threadId = state.tutorThread?.thread?.id;
  if (!identity || !threadId) return;
  const context = currentTutorPollContext(threadId);
  if (!context) return;
  setButtonBusy(button, true, 'Retrying…');
  try {
    const response = unwrapData(await retryTutorRequestRequest(api, identity, threadId, requestOrdinal));
    if (!isCurrentTutorPollContext(context)) return;
    if (!tutorBundleMatchesIdentity(response.thread, identity, threadId)) {
      throw new ApiError('The Tutor response did not match this discussion.', { code: 'INVALID_TUTOR_RESPONSE' });
    }
    renderTutorThread(response.thread);
    scheduleTutorPoll(currentTutorPollContext(threadId));
  } catch (error) {
    if (isCurrentTutorPollContext(context)) handleError(error, 'Could not retry this Tutor request.');
  } finally {
    setButtonBusy(button, false);
  }
}

async function forkTutorThread() {
  const identity = currentTutorIdentity();
  const threadId = state.tutorThread?.thread?.id;
  if (!identity || !threadId) return;
  const context = currentTutorPollContext(threadId);
  if (!context) return;
  setButtonBusy(elements.forkTutorThread, true, 'Forking…');
  try {
    const response = unwrapData(await forkTutorThreadRequest(api, identity, threadId));
    if (!isCurrentTutorPollContext(context)) return;
    if (!tutorBundleMatchesIdentity(response.thread, identity)) {
      throw new ApiError('The Tutor fork response was invalid.', { code: 'INVALID_TUTOR_RESPONSE' });
    }
    state.tutorLoadSequence += 1;
    state.tutorSelectedThreadId = response.thread.thread.id;
    renderTutorThread(response.thread);
    elements.tutorStatus.textContent = 'A new discussion was forked from the latest successful Tutor answer.';
  } catch (error) {
    if (isCurrentTutorPollContext(context)) handleError(error, 'Could not fork this discussion.');
  } finally {
    setButtonBusy(elements.forkTutorThread, false);
  }
}

function confirmDeleteTutorThread(threadId) {
  const normalizedThreadId = String(threadId || '');
  const visible = state.tutorThreads.some((item) => String(item.thread.id) === normalizedThreadId)
    || String(state.tutorThread?.thread?.id) === normalizedThreadId;
  if (!normalizedThreadId || !visible || state.deletedTutorThreadIds.has(normalizedThreadId)) return;
  openModal({
    title: 'Delete this discussion?',
    paragraphs: ['The discussion will no longer appear in your learning history. This action cannot be undone.'],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Delete discussion', className: 'button button-danger', handler: () => deleteTutorThread(normalizedThreadId) }
    ]
  });
}

async function deleteTutorThread(threadId) {
  const identity = currentTutorIdentity();
  if (!identity || !threadId) return;
  const normalizedThreadId = String(threadId);
  const context = historyContext();
  try {
    await deleteTutorThreadRequest(api, identity, normalizedThreadId);
    if (!historyContextMatches(context, { requireQuestion: true })) return;
    hideModal({ force: true });
    stopTutorPolling({ invalidate: false });
    const { deletedSelectedThread, nextThreadId } = applyTutorThreadTombstone(state, normalizedThreadId);
    if (deletedSelectedThread) {
      clearTutorConversationDom();
    } else if ((state.tutorThread?.requests || []).some(tutorRequestIsPending)) {
      scheduleTutorPoll(currentTutorPollContext(state.tutorThread.thread.id));
    }
    renderTutorThreads(state.tutorThreads);
    elements.tutorStatus.textContent = 'Discussion deleted.';
    if (nextThreadId) await loadTutorThread(nextThreadId);
  } catch (error) {
    if (historyContextMatches(context, { requireQuestion: true })) handleError(error, 'Could not delete this discussion.');
  }
}

function humanSubmissionKind(submission) {
  const kind = String(firstDefined(submission?.kind, submission?.type, 'SUBMISSION')).toUpperCase();
  return ({ CHECKPOINT: 'Score checkpoint', DEADLINE: '75-minute checkpoint', FINAL: 'Final submission' })[kind] || kind.toLowerCase();
}

function renderSubmissionHistory(submissions) {
  clearNode(elements.submissionHistory);
  if (!submissions.length) {
    const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'No submission history is available.';
    elements.submissionHistory.appendChild(empty); return;
  }
  const sorted = [...submissions].sort((left, right) => timestampMs(left) - timestampMs(right));
  for (const submission of sorted) {
    const row = document.createElement('article'); row.className = 'submission-row';
    const type = document.createElement('span'); type.className = 'submission-type'; type.textContent = humanSubmissionKind(submission);
    const score = document.createElement('strong'); score.textContent = `Score ${formatScore(scoreFromSubmission(submission))}`;
    const date = document.createElement('span'); date.textContent = formatDateTime(submission);
    const note = document.createElement('span'); note.className = 'submission-note';
    const elapsed = finiteNumber(firstDefined(submission.activeElapsedMs, submission.elapsedActiveMs, submission.elapsedMs));
    note.textContent = elapsed !== null ? `${formatDuration(elapsed)} active time` : '';
    row.append(type, score, date, note);
    elements.submissionHistory.appendChild(row);
  }
}

function renderResultQuestions(rows) {
  clearNode(elements.resultsQuestions);
  if (!rows.length) {
    const note = document.createElement('p'); note.className = 'muted'; note.textContent = 'Detailed answer review is unavailable for this result.';
    elements.resultsQuestions.appendChild(note); return;
  }
  const sorted = [...rows].sort((left, right) => finiteNumber(firstDefined(left.questionNumber, left.number), 0) - finiteNumber(firstDefined(right.questionNumber, right.number), 0));
  for (const row of sorted) {
    const number = finiteNumber(firstDefined(row.questionNumber, row.number), 0);
    const selected = firstDefined(row.selectedOption, row.answer, row.submittedOption, null);
    const correct = firstDefined(row.correctOption, row.correctAnswer, row.answerKey, null);
    const accepted = Array.isArray(row.acceptedOptions)
      ? row.acceptedOptions.filter((option) => OPTIONS.includes(option))
      : (correct && OPTIONS.includes(correct) ? [correct] : []);
    const isScored = row.isScored !== false;
    const isCorrect = row.isCorrect === true || String(row.outcome || '').toUpperCase() === 'CORRECT';
    const card = document.createElement('article');
    card.className = `result-question ${!isScored ? 'is-unscored' : isCorrect ? 'is-correct' : 'is-incorrect'}`;
    const title = document.createElement('p'); title.textContent = `Question ${number}`;
    const answer = document.createElement('p'); answer.className = 'result-answer'; answer.textContent = `Your answer: ${selected || 'Blank'}`;
    const expected = document.createElement('p'); expected.className = 'correct-answer'; expected.textContent = !isScored
      ? 'Not included in this archive score'
      : accepted.length > 1
        ? `Accepted answers: ${accepted.join(' or ')}`
        : `Correct answer: ${correct || accepted[0] || '—'}`;
    card.append(title, answer, expected);
    elements.resultsQuestions.appendChild(card);
  }
}

function renderSolutions(solutions) {
  clearNode(elements.solutionsList);
  if (!solutions.length) {
    const note = document.createElement('p'); note.className = 'muted'; note.textContent = 'Solutions are not available for this final submission.';
    elements.solutionsList.appendChild(note); return;
  }
  for (const solution of solutions) {
    const details = document.createElement('details'); details.className = 'solution-item';
    const summary = document.createElement('summary'); summary.textContent = solution.title;
    const body = document.createElement('div'); body.className = 'solution-body';
    renderMarkdown(body, solution.markdown);
    details.addEventListener('toggle', () => {
      if (details.open) typesetMath([body]);
    });
    details.append(summary, body);
    elements.solutionsList.appendChild(details);
  }
  typesetMath([elements.solutionsList]);
}

async function showResults() {
  if (!canAccessFinalReview(state.attempt)) {
    showError('Final results are not available until final submission.');
    return false;
  }
  stopAttemptSync();
  stopLearningReportPolling();
  state.learningReportPollCount = 0;
  state.learningReportLoadError = null;
  state.batchReviewOpenSequence += 1;
  state.batchReviewWorkspace = null;
  configureResultsView('TIMED_RESULT');
  stopBatchPolling();
  state.activeBatchId = null;
  // A prior owner-less upload completion is fenced by batchEpoch when the
  // results view is re-entered; its detached operation must not leave the
  // shared upload control disabled for the current result.
  setButtonBusy(elements.batchSubmitButton, false);
  elements.batchUploadForm.reset();
  showOnly(elements.resultsView);
  elements.finalScore.textContent = 'Loading…';
  elements.scoreDetails.textContent = 'Retrieving your final score and solutions.';
  clearNode(elements.submissionHistory); clearNode(elements.resultsQuestions); clearNode(elements.solutionsList);
  clearNode(elements.batchWorkspace); clearNode(elements.batchSelectedFiles);
  syncBatchIntakeControls();
  renderLearningAnalysisStatus();
  try {
    // The exported fetchFinalReview guards this request; do not bypass it.
    const learningPath = learningSubmissionEndpointForAttempt(state.attempt);
    const learningRequest = learningPath ? api.get(learningPath).catch(() => null) : Promise.resolve(null);
    const [review, learningResponse] = await Promise.all([fetchFinalReview(api, state.attempt), learningRequest]);
    state.resultPayload = review.results;
    state.solutionsPayload = review.solutions;
    state.learningSubmission = learningAnalysisProjection(learningResponse)
      || learningAnalysisProjection(review.results)
      || state.learningSubmission;
    // Objective grading is authoritative and renders before the optional AI
    // report request starts. A report outage can therefore never replace or
    // delay the student's score, answer review, or approved solutions.
    renderResults(review.results, review.solutions);
    void loadLearningReport({ quiet: true });
    void loadLatestLearningBatch();
    document.getElementById('main-content').focus();
    return true;
  } catch (error) {
    elements.finalScore.textContent = 'Unavailable';
    elements.scoreDetails.textContent = 'Could not load final review. Use “My tests” and reopen this attempt to retry.';
    handleError(error, 'Could not load final results.');
    return false;
  }
}

function confirmReset() {
  const active = isAttemptActive(state.attempt);
  openModal({
    title: 'Start a new attempt?',
    paragraphs: [
      active
        ? 'Your current answers are saved first. This attempt will then close and remain in your history.'
        : 'Your final submission and its answers remain in your history.',
      'A fresh attempt will start with an empty answer sheet and a new timer.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Start new attempt', className: 'button button-primary', handler: resetAttempt }
    ]
  });
}

function resetMayHaveCommitted(error) {
  return !(error instanceof ApiError)
    || error.code === 'NETWORK_ERROR'
    || error.code === 'INVALID_STATE'
    || error.status >= 500;
}

async function recoverUncertainReset(oldAttempt) {
  try {
    const historyResponse = await api.get(`${API_BASE}/attempts`);
    const attempts = extractAttemptHistory(historyResponse);
    state.attemptHistory = attempts;
    const replacement = resetReplacementFromHistory(attempts, oldAttempt);
    if (replacement?.id) {
      hideModal({ force: true });
      await resumeAttempt(replacement.id, replacement);
      showStatus('The reset completed. Your new attempt has been recovered.');
      return true;
    }
    const prior = attempts.find((attempt) => String(attempt?.id || '') === String(oldAttempt?.id || ''));
    if (normalizePhase(prior) === 'RESET') {
      await showDashboard();
      showStatus('The prior attempt was reset. Start a new attempt when you are ready.');
      return true;
    }
  } catch {
    // Preserve the original mutation error below; recovery is best effort.
  }
  return false;
}

async function resetAttempt({ skipReasoningFlush = false } = {}) {
  const oldAttempt = state.attempt;
  try {
    await flushAnswerSaves();
    if (!skipReasoningFlush) await flushReasoningSaves();
    const path = `${API_BASE}/attempts/${encodeURIComponent(String(oldAttempt.id))}/reset`;
    // Reuse one key for the network retry. If the first request committed but
    // its response vanished, the second request returns the original atomic
    // RESET + replacement response rather than creating ambiguous state.
    const key = idempotencyKey();
    let response;
    try {
      response = await api.post(path, {}, { idempotency: key });
    } catch (firstError) {
      let error = firstError;
      if (firstError instanceof ApiError && firstError.code === 'NETWORK_ERROR') {
        try {
          response = await api.post(path, {}, { idempotency: key });
        } catch (retryError) {
          error = retryError;
        }
      }
      if (response === undefined) {
        if (resetMayHaveCommitted(error) && await recoverUncertainReset(oldAttempt)) return;
        throw error;
      }
    }
    hideModal({ force: true });
    const replacement = extractReplacementAttempt(response);
    if (replacement?.id) {
      await openAttempt({ attempt: replacement });
      showStatus('A new practice attempt is ready. Your prior submission remains saved.');
      return;
    }
    const returned = extractAttempt(response);
    if (returned?.id && isAttemptActive(returned)) {
      await openAttempt(response);
      showStatus('Your practice attempt has been reset.');
      return;
    }
    // A backend may persist RESET only and expect the normal start flow.
    await showDashboard();
    showStatus('The prior attempt was reset. Start a new attempt when you are ready.');
  } catch (error) {
    if (error instanceof ApiError && error.code === 'REASONING_SAVE_FAILED') {
      offerUnsavedReasoningRecovery({
        actionLabel: 'reset the attempt',
        onDiscard: () => resetAttempt({ skipReasoningFlush: true })
      });
      return;
    }
    handleError(error, 'Could not reset this attempt.');
  }
}

async function showDashboard({ skipSwitchFlush = false } = {}) {
  if (!skipSwitchFlush && !elements.practiceView.hidden) {
    const canSwitch = await flushBeforeAttemptSwitch(null, () => showDashboard({ skipSwitchFlush: true }));
    if (!canSwitch) return;
  }
  state.batchReviewOpenSequence += 1;
  state.batchReviewWorkspace = null;
  if (state.resultsViewMode === 'BATCH_REVIEW') state.resultsViewMode = null;
  hideModal({ force: true });
  stopAttemptSync();
  showOnly(elements.dashboardView);
  await loadForms();
  if (!elements.dashboardView.hidden && !state.modal) document.getElementById('main-content').focus();
}

async function logout() {
  try {
    await api.post(`${API_BASE}/auth/logout`, {});
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) handleError(error, 'Could not sign out cleanly.');
  } finally {
    localSignOut();
  }
}

function expandAllSolutions() {
  const details = [...elements.solutionsList.querySelectorAll('details')];
  const shouldOpen = details.some((item) => !item.open);
  details.forEach((item) => { item.open = shouldOpen; });
  elements.expandSolutions.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
  if (shouldOpen) typesetMath([elements.solutionsList]);
}

function bindEvents() {
  elements.globalErrorDismiss.addEventListener('click', hideError);
  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearLoginError();
    const accessCode = elements.loginAccessCode.value.trim();
    if (!accessCode) {
      showLoginError('Enter your access code.');
      elements.loginAccessCode.focus();
      return;
    }
    setButtonBusy(elements.loginSubmit, true, 'Signing in…');
    try {
      const response = await api.post(`${API_BASE}/auth/login`, { accessCode });
      setStudent(response);
      elements.loginForm.reset();
      await showDashboard();
    } catch (error) {
      showLoginError(error instanceof ApiError ? error.message : 'Could not sign in.');
    } finally {
      setButtonBusy(elements.loginSubmit, false);
    }
  });
  elements.dashboardButton.addEventListener('click', () => showDashboard());
  elements.resultsDashboardButton.addEventListener('click', () => showDashboard());
  elements.learningHistoryButton.addEventListener('click', () => showLearningHistory());
  elements.learningHistoryBackButton.addEventListener('click', () => showDashboard());
  elements.refreshLearningHistoryButton.addEventListener('click', () => showLearningHistory({
    submissionId: state.learningHistorySubmission?.submissionId || null
  }));
  elements.learningHistoryLoadMore.addEventListener('click', loadMoreLearningHistory);
  elements.closeLearningHistoryDetail.addEventListener('click', () => {
    purgeTutorWorkspace({ clearSummaries: true }); stopLearningHistoryReportPolling();
    state.learningHistorySubmission = null; state.learningHistoryVersion = null; state.learningHistoryQuestion = null;
    hideLearningHistoryPanels();
  });
  elements.closeLearningVersionReport.addEventListener('click', () => {
    purgeTutorWorkspace({ clearSummaries: true }); stopLearningHistoryReportPolling();
    state.learningHistoryVersion = null; state.learningHistoryQuestion = null;
    hideLearningHistoryPanels(elements.learningHistoryDetail);
  });
  elements.closeLearningQuestion.addEventListener('click', () => {
    purgeTutorWorkspace({ clearSummaries: true });
    state.learningHistoryQuestion = null;
    hideLearningHistoryPanels(elements.learningVersionReport);
  });
  elements.logoutButton.addEventListener('click', logout);
  elements.refreshForms.addEventListener('click', () => loadForms());
  elements.pauseButton.addEventListener('click', pauseAttempt);
  elements.resumeButton.addEventListener('click', resumeTimer);
  elements.practiceResetButton.addEventListener('click', confirmReset);
  elements.checkpointButton.addEventListener('click', confirmCheckpoint);
  elements.finalButton.addEventListener('click', confirmFinalSubmission);
  elements.previousQuestion.addEventListener('click', () => goToQuestion(state.currentQuestionIndex - 1, { focus: true }));
  elements.nextQuestion.addEventListener('click', () => goToQuestion(state.currentQuestionIndex + 1, { focus: true }));
  elements.clearAnswerButton.addEventListener('click', () => {
    const question = state.questions[state.currentQuestionIndex];
    if (question) updateQuestionAnswer(question.number, null);
  });
  elements.answerForm.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'radio' || !input.checked) return;
    const question = state.questions[state.currentQuestionIndex];
    if (question) updateQuestionAnswer(question.number, input.value);
  });
  elements.reasoningInput.addEventListener('input', (event) => updateCurrentReasoning(event.target.value));
  elements.reasoningInput.addEventListener('blur', () => queueReasoningSave({ immediate: true }));
  elements.saveReasoningButton.addEventListener('click', () => queueReasoningSave({ immediate: true }));
  elements.reloadReasoningButton.addEventListener('click', reloadReasoningNotes);
  elements.resetButton.addEventListener('click', confirmReset);
  elements.refreshAnalysisButton.addEventListener('click', () => loadLearningReport());
  elements.batchFiles.addEventListener('change', renderSelectedBatchFiles);
  elements.batchUploadForm.addEventListener('submit', submitBatchUpload);
  elements.createTutorThread.addEventListener('click', createTutorThread);
  elements.tutorLoadMore.addEventListener('click', loadMoreTutorThreads);
  elements.tutorMessageForm.addEventListener('submit', sendTutorMessage);
  elements.forkTutorThread.addEventListener('click', forkTutorThread);
  elements.deleteTutorThread.addEventListener('click', () => {
    confirmDeleteTutorThread(state.tutorThread?.thread?.id);
  });
  elements.expandSolutions.addEventListener('click', expandAllSolutions);
  elements.modalClose.addEventListener('click', () => hideModal());
  elements.modalBackdrop.addEventListener('click', (event) => { if (event.target === elements.modalBackdrop) hideModal(); });
  document.addEventListener('keydown', (event) => {
    if (state.modal && event.key === 'Tab') {
      const focusable = modalFocusableElements();
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key === 'Escape' && state.modal?.dismissible) hideModal();
    if (event.key === 'ArrowLeft' && !state.modal && !elements.practiceView.hidden && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); goToQuestion(state.currentQuestionIndex - 1, { focus: true });
    }
    if (event.key === 'ArrowRight' && !state.modal && !elements.practiceView.hidden && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); goToQuestion(state.currentQuestionIndex + 1, { focus: true });
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !elements.practiceView.hidden) refreshAttempt({ quiet: true });
  });
}

async function bootstrap() {
  elements = getElements();
  api = new ApiClient({ onCsrfToken: setCsrfToken, onUnauthorized: handleUnauthorized });
  bindEvents();
  const requestedUrl = new URL(window.location.href);
  state.practiceEntryIntent = parsePracticeEntryIntent(requestedUrl.href, requestedUrl.origin);
  if (requestedUrl.searchParams.has('form') || requestedUrl.searchParams.has('mode')) {
    window.history.replaceState(window.history.state, '', `${requestedUrl.pathname}${requestedUrl.hash}`);
  }
  // If MathJax completed before this module registered its ready listener,
  // queue a pass after bootstrap.  If it completes later, the ready listener
  // below re-typesets the already rendered current question/results instead.
  if (mathJaxReady || mathJaxTypesetter()) {
    mathJaxReady = true;
    window.setTimeout(typesetVisiblePracticeMath, 0);
  }
  try {
    const response = await api.get(`${API_BASE}/auth/me`);
    setStudent(response);
    if (!state.student) {
      localSignOut();
      return;
    }
    await showDashboard();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      localSignOut();
      return;
    }
    localSignOut({ message: 'The practice service is unavailable. Try again shortly.' });
  }
}

if (typeof document !== 'undefined') {
  window.addEventListener('mathjax-ready', () => {
    mathJaxReady = true;
    // A slow local font/module load may have made the initial render a no-op.
    // Re-typeset the visible containers so no first question is left as raw
    // TeX merely because MathJax became ready a moment later.
    typesetVisiblePracticeMath();
  });
  document.addEventListener('DOMContentLoaded', bootstrap);
}
