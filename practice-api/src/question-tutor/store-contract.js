import {
  TUTOR_CONTRACT_VERSION,
  TUTOR_MAX_HISTORY_BYTES,
  TUTOR_MAX_REPLY_BYTES,
  TUTOR_MAX_REQUESTS,
  TUTOR_MAX_SUCCESSFUL_TURNS,
  TUTOR_PROMPT_VERSION,
  TUTOR_RESPONSE_SCHEMA,
  assertTutorThreadCapacity,
  buildTutorTurnRequest,
  computeTutorContextHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  isValidTutorContext,
  tutorCanonicalJson,
  tutorSha256
} from './domain.js';
import {
  isRestrictedInferenceOutputText,
  isValidAnalysisScoringSnapshot
} from '../infrastructure/amc-inference-contract.js';
import { canonicalHash } from '../learning-review/canonical.js';

export const TUTOR_MAX_ACTIVE_JOBS_PER_STUDENT = 2;
export const TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION = 20;
export const TUTOR_MAX_LIVE_THREADS_PER_STUDENT = 100;
export const TUTOR_PROVIDER_WORK_PER_DAY = 30;
export const TUTOR_GLOBAL_PROVIDER_WORK_PER_DAY = 1_000;
export const TUTOR_PROVIDER_WORK_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const TUTOR_THREAD_SUMMARY_MAX_LIMIT = 20;
export const TUTOR_SNAPSHOT_SCHEMA = 'amc-tutor-snapshot-v2';
export const TUTOR_THREAD_CREATION_SCHEMA = 'amc-tutor-thread-create-v1';
export const TUTOR_ROOT_THREAD_CREATION_SCHEMA = 'amc-tutor-root-thread-create-v1';

export class TutorStoreError extends Error {
  constructor(code, message = code, { retryAfterSeconds } = {}) {
    super(message);
    this.name = 'TutorStoreError';
    this.code = code;
    if (retryAfterSeconds !== undefined) this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function tutorStoreError(code, message = code) {
  return new TutorStoreError(code, message);
}

export function normalizeTutorProviderBudget(providerBudget = {}) {
  if (!providerBudget || typeof providerBudget !== 'object' || Array.isArray(providerBudget)) {
    throw tutorStoreError('INVALID_TUTOR_PROVIDER_BUDGET');
  }
  const studentLimit = providerBudget.studentLimit ?? TUTOR_PROVIDER_WORK_PER_DAY;
  const globalLimit = providerBudget.globalLimit ?? TUTOR_GLOBAL_PROVIDER_WORK_PER_DAY;
  if (!Number.isSafeInteger(studentLimit) || studentLimit < 1
      || !Number.isSafeInteger(globalLimit) || globalLimit < 1
      || (providerBudget.windowMs !== undefined
        && providerBudget.windowMs !== TUTOR_PROVIDER_WORK_WINDOW_MS)
      || (providerBudget.budgetKind !== undefined
        && providerBudget.budgetKind !== 'PROVIDER_WORK')) {
    throw tutorStoreError('INVALID_TUTOR_PROVIDER_BUDGET');
  }
  return {
    budgetKind: 'PROVIDER_WORK', studentLimit, globalLimit,
    windowMs: TUTOR_PROVIDER_WORK_WINDOW_MS
  };
}

export function tutorProviderBudgetError({ studentAllowed, studentRetryAfterSeconds,
  globalRetryAfterSeconds }) {
  const code = studentAllowed
    ? 'TUTOR_GLOBAL_PROVIDER_WORK_RATE_LIMITED'
    : 'TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED';
  const retryAfterSeconds = studentAllowed
    ? globalRetryAfterSeconds : studentRetryAfterSeconds;
  return new TutorStoreError(code, code, { retryAfterSeconds });
}

export function assertTutorLiveThreadCapacity({ studentQuestionCount, studentCount }) {
  if (studentQuestionCount >= TUTOR_MAX_LIVE_THREADS_PER_STUDENT_QUESTION) {
    throw tutorStoreError('TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED');
  }
  if (studentCount >= TUTOR_MAX_LIVE_THREADS_PER_STUDENT) {
    throw tutorStoreError('TUTOR_STUDENT_THREAD_CAP_REACHED');
  }
}

export function validateTutorSummaryPage({ limit = TUTOR_THREAD_SUMMARY_MAX_LIMIT,
  cursor = null } = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > TUTOR_THREAD_SUMMARY_MAX_LIMIT) {
    throw tutorStoreError('INVALID_TUTOR_SUMMARY_PAGE');
  }
  if (cursor === null) return { limit, cursor: null };
  const updatedAt = cursor?.updatedAt instanceof Date
    ? cursor.updatedAt : new Date(cursor?.updatedAt);
  if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)
      || !Number.isFinite(updatedAt.getTime())
      || typeof cursor.threadId !== 'string'
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        cursor.threadId)) {
    throw tutorStoreError('INVALID_TUTOR_SUMMARY_PAGE');
  }
  return { limit, cursor: { updatedAt, threadId: cursor.threadId } };
}

export function tutorRequestHash(request) {
  return tutorSha256(tutorCanonicalJson(request));
}

export function tutorMessageHash(markdown) {
  return tutorSha256(markdown);
}

export function tutorThreadCreationRequestHash({ studentId, snapshotId, forkedFromThreadId = null,
  forkedFromTurnJobId = null }) {
  return tutorSha256(tutorCanonicalJson({
    schema: TUTOR_THREAD_CREATION_SCHEMA,
    studentId,
    snapshotId,
    forkedFromThreadId,
    forkedFromTurnJobId
  }));
}

export function tutorRootThreadCreationRequestHash({
  studentId, learningSubmissionId, versionNumber, questionNumber
}) {
  return tutorSha256(tutorCanonicalJson({
    schema: TUTOR_ROOT_THREAD_CREATION_SCHEMA,
    studentId,
    learningSubmissionId,
    versionNumber,
    questionNumber
  }));
}

export function buildTutorSnapshotRecord({
  id, studentId, learningSubmissionId, learningSubmissionVersionId, versionNumber,
  formId, formVersion, sourceType, questionNumber, contextSetId, questionContentHash,
  analysisRunId, analysisContractVersion, analysisQuestionInputHash,
  analysisQuestionContextHash, reportId, reportHash, evidenceHash, response, scoring,
  officialSubmissionId, batchResultId, initialDeletionGeneration, contextArtifactSha256,
  contextReleaseHash, promptMarkdown, choices, solutions, createdAt
}) {
  if (!response || !['OFFICIAL_FINAL', 'BATCH_CONFIRMED'].includes(response.answerOrigin)
      || !isValidAnalysisScoringSnapshot(scoring, response.selectedOption)
      || (response.answerOrigin === 'OFFICIAL_FINAL'
        && (!officialSubmissionId || batchResultId !== null))
      || (response.answerOrigin === 'BATCH_CONFIRMED'
        && (officialSubmissionId !== null || !batchResultId))) {
    throw tutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
  }
  const snapshotPayload = {
    learningSubmissionId,
    learningSubmissionVersionId,
    versionNumber,
    formId,
    formVersion,
    contextSetId,
    contextArtifactSha256,
    contextReleaseHash,
    evidenceHash,
    question: {
      questionNumber,
      questionId: `${formId}:q:${questionNumber}`,
      promptMarkdown,
      choices: structuredClone(choices),
      isScored: scoring.isScored,
      officialAnswer: scoring.canonicalAnswer,
      acceptedOptions: structuredClone(scoring.acceptedOptions),
      studentAnswer: response.selectedOption,
      studentReasoning: response.reasoningText || null,
      solutions: structuredClone(solutions)
    }
  };
  const snapshotHash = computeTutorSnapshotHash(snapshotPayload);
  const questionResponseHash = canonicalHash({
    questionNumber,
    selectedOption: response.selectedOption,
    reasoningText: response.reasoningText,
    answerOrigin: response.answerOrigin
  });
  const scoringSnapshotHash = canonicalHash(scoring);
  return validateTutorSnapshotRecord({
    id,
    studentId,
    learningSubmissionId,
    learningSubmissionVersionId,
    versionNumber,
    formId,
    formVersion,
    sourceType,
    questionNumber,
    contextSetId,
    questionContentHash,
    analysisRunId,
    analysisContractVersion,
    analysisQuestionInputHash,
    analysisQuestionContextHash,
    reportId,
    reportHash,
    evidenceHash,
    questionResponseHash,
    scoringSnapshotHash,
    scoringOrigin: response.answerOrigin,
    officialSubmissionId,
    batchResultId,
    initialDeletionGeneration,
    contextArtifactSha256,
    contextReleaseHash,
    payloadSchema: TUTOR_SNAPSHOT_SCHEMA,
    snapshotPayload,
    snapshotHash,
    threadLineageHash: computeTutorThreadLineageHash({
      analysisRunId,
      analysisContractVersion,
      reportId,
      reportHash,
      snapshotHash,
      questionResponseHash,
      scoringSnapshotHash,
      scoringOrigin: response.answerOrigin,
      initialDeletionGeneration
    }),
    createdAt
  });
}

export function tutorForkCreationRequestHash({
  studentId, learningSubmissionId, versionNumber, questionNumber, parentThreadId
}) {
  return canonicalHash({
    schema: 'amc-tutor-fork-create-v1',
    studentId,
    learningSubmissionId,
    versionNumber,
    questionNumber,
    parentThreadId
  });
}

export function tutorThreadTombstoneRequestHash({
  studentId, learningSubmissionId, versionNumber, questionNumber, threadId
}) {
  return canonicalHash({
    schema: 'amc-tutor-thread-tombstone-v1',
    studentId,
    learningSubmissionId,
    versionNumber,
    questionNumber,
    threadId
  });
}

export function buildTutorRootThreadRecord({
  id, studentId, snapshot, creationIdempotencyKeyHash, creationRequestHash, createdAt
}) {
  const validatedSnapshot = validateTutorSnapshotRecord(snapshot);
  return {
    id,
    studentId,
    snapshotId: validatedSnapshot.id,
    learningSubmissionId: validatedSnapshot.learningSubmissionId,
    learningSubmissionVersionId: validatedSnapshot.learningSubmissionVersionId,
    questionNumber: validatedSnapshot.questionNumber,
    snapshotHash: validatedSnapshot.snapshotHash,
    threadLineageHash: validatedSnapshot.threadLineageHash,
    tutorContractVersion: TUTOR_CONTRACT_VERSION,
    contextHash: computeTutorContextHash({
      threadId: id, context: validatedSnapshot.snapshotPayload
    }),
    status: 'OPEN',
    successfulTurnCount: 0,
    requestCount: 0,
    successfulHistoryBytes: 0,
    threadRevision: 0,
    initialDeletionGeneration: validatedSnapshot.initialDeletionGeneration,
    deletionGeneration: validatedSnapshot.initialDeletionGeneration,
    forkedFromThreadId: null,
    forkedFromTurnJobId: null,
    creationIdempotencyKeyHash,
    creationRequestHash,
    createdAt,
    updatedAt: createdAt,
    closedAt: null,
    tombstonedAt: null
  };
}

export function buildTutorForkThreadRecord({
  id, studentId, snapshot, parentThread, parentHeadJob,
  creationIdempotencyKeyHash, creationRequestHash, createdAt
}) {
  if (!parentThread || !parentHeadJob
      || parentThread.studentId !== studentId
      || parentThread.snapshotId !== snapshot?.id
      || parentThread.status === 'TOMBSTONED'
      || parentHeadJob.threadId !== parentThread.id
      || parentHeadJob.status !== 'SUCCEEDED'
      || parentHeadJob.turnNumber !== parentThread.successfulTurnCount) {
    throw tutorStoreError('INVALID_TUTOR_FORK');
  }
  return {
    ...buildTutorRootThreadRecord({
      id, studentId, snapshot, creationIdempotencyKeyHash,
      creationRequestHash, createdAt
    }),
    forkedFromThreadId: parentThread.id,
    forkedFromTurnJobId: parentHeadJob.id
  };
}

export function validateTutorSnapshotRecord(snapshot) {
  if (!snapshot || snapshot.payloadSchema !== TUTOR_SNAPSHOT_SCHEMA
      || !isValidTutorContext(snapshot.snapshotPayload)) {
    throw tutorStoreError('INVALID_TUTOR_SNAPSHOT');
  }
  const context = snapshot.snapshotPayload;
  const question = context.question;
  const scalarMatches = snapshot.learningSubmissionId === context.learningSubmissionId
    && snapshot.learningSubmissionVersionId === context.learningSubmissionVersionId
    && snapshot.versionNumber === context.versionNumber
    && snapshot.formId === context.formId
    && snapshot.formVersion === context.formVersion
    && snapshot.contextSetId === context.contextSetId
    && snapshot.contextArtifactSha256 === context.contextArtifactSha256
    && snapshot.contextReleaseHash === context.contextReleaseHash
    && snapshot.evidenceHash === context.evidenceHash
    && snapshot.questionNumber === question.questionNumber;
  if (!scalarMatches || snapshot.snapshotHash !== computeTutorSnapshotHash(context)) {
    throw tutorStoreError('TUTOR_SNAPSHOT_HASH_MISMATCH');
  }
  const lineageHash = computeTutorThreadLineageHash({
    analysisRunId: snapshot.analysisRunId,
    analysisContractVersion: snapshot.analysisContractVersion,
    reportId: snapshot.reportId,
    reportHash: snapshot.reportHash,
    snapshotHash: snapshot.snapshotHash,
    questionResponseHash: snapshot.questionResponseHash,
    scoringSnapshotHash: snapshot.scoringSnapshotHash,
    scoringOrigin: snapshot.scoringOrigin,
    initialDeletionGeneration: snapshot.initialDeletionGeneration
  });
  if (snapshot.threadLineageHash !== lineageHash) {
    throw tutorStoreError('TUTOR_THREAD_LINEAGE_HASH_MISMATCH');
  }
  return structuredClone(snapshot);
}

export function tutorSnapshotSemanticHash(snapshot) {
  const validated = validateTutorSnapshotRecord(snapshot);
  const { id: ignoredId, createdAt: ignoredCreatedAt, ...semantic } = validated;
  return tutorSha256(tutorCanonicalJson(semantic));
}

export function buildAndValidateTutorRequest({ job, thread, snapshot, priorTurns, message }) {
  validateTutorSnapshotRecord(snapshot);
  if (thread.snapshotHash !== snapshot.snapshotHash
      || thread.threadLineageHash !== snapshot.threadLineageHash
      || thread.tutorContractVersion !== TUTOR_CONTRACT_VERSION
      || thread.contextHash !== computeTutorContextHash({
        threadId: thread.id, context: snapshot.snapshotPayload
      })) {
    throw tutorStoreError('TUTOR_CONTEXT_HASH_MISMATCH');
  }
  const request = buildTutorTurnRequest({
    correlationId: job.correlationId,
    threadId: thread.id,
    turnId: job.id,
    turnNumber: job.turnNumber,
    context: snapshot.snapshotPayload,
    priorTurns,
    message
  });
  if (job.snapshotHash !== request.snapshotHash || job.contextHash !== request.contextHash
      || job.historyHash !== request.historyHash || job.inputHash !== request.inputHash
      || job.threadLineageHash !== thread.threadLineageHash
      || job.tutorContractVersion !== TUTOR_CONTRACT_VERSION
      || job.requestHash !== tutorRequestHash(request)) {
    throw tutorStoreError('TUTOR_REQUEST_HASH_MISMATCH');
  }
  return request;
}

export function validateTutorReply(replyMarkdown, replyHash) {
  if (!isRestrictedInferenceOutputText(replyMarkdown, 1, TUTOR_MAX_REPLY_BYTES)
      || tutorMessageHash(replyMarkdown) !== replyHash) {
    throw tutorStoreError('TUTOR_REPLY_HASH_MISMATCH');
  }
  return Buffer.byteLength(replyMarkdown, 'utf8');
}

function exactTutorRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function validTutorUsage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const expected = ['cachedInputTokens', 'inputTokens', 'outputTokens', 'totalTokens'];
  if (Object.hasOwn(value, 'cacheWriteTokens')) expected.push('cacheWriteTokens');
  if (Object.hasOwn(value, 'reasoningTokens')) expected.push('reasoningTokens');
  if (!exactTutorRecord(value, expected)) return false;
  const bounded = (item) => Number.isSafeInteger(item) && item >= 0 && item <= 100_000_000;
  if (!['inputTokens', 'cachedInputTokens', 'outputTokens', 'totalTokens']
    .every((key) => bounded(value[key]))
      || !['cacheWriteTokens', 'reasoningTokens']
        .every((key) => value[key] === undefined || bounded(value[key]))) return false;
  return value.totalTokens === value.inputTokens + value.outputTokens
    && value.cachedInputTokens <= value.inputTokens
    && (value.cacheWriteTokens === undefined || value.cacheWriteTokens <= value.inputTokens)
    && (value.reasoningTokens === undefined || value.reasoningTokens <= value.outputTokens);
}

export function validateTutorGatewaySuccess({ gatewayResult, request, job, latencyMs }) {
  if (!exactTutorRecord(gatewayResult, ['ok', 'tutorTurn', 'runMetadata'])
      || gatewayResult.ok !== true
      || !exactTutorRecord(gatewayResult.tutorTurn, [
        'schema', 'correlationId', 'inputHash', 'snapshotHash', 'contextHash', 'historyHash',
        'threadId', 'turnId', 'turnNumber', 'replyMarkdown'
      ])
      || !exactTutorRecord(gatewayResult.runMetadata, [
        'provider', 'requestedModel', 'responseModel', 'promptVersion', 'schemaVersion', 'usage'
      ])) throw tutorStoreError('TUTOR_GATEWAY_RESPONSE_MISMATCH');
  const turn = gatewayResult.tutorTurn;
  const metadata = gatewayResult.runMetadata;
  if (turn.schema !== TUTOR_RESPONSE_SCHEMA
      || turn.correlationId !== request.correlationId
      || turn.inputHash !== request.inputHash
      || turn.snapshotHash !== request.snapshotHash
      || turn.contextHash !== request.contextHash
      || turn.historyHash !== request.historyHash
      || turn.threadId !== request.threadId
      || turn.turnId !== request.turnId
      || turn.turnNumber !== request.turnNumber
      || metadata.provider !== 'openai' || metadata.provider !== job.provider
      || metadata.requestedModel !== job.requestedModel
      || !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(metadata.requestedModel)
      || typeof metadata.responseModel !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(metadata.responseModel)
      || metadata.promptVersion !== TUTOR_PROMPT_VERSION
      || metadata.promptVersion !== job.promptVersion
      || metadata.schemaVersion !== TUTOR_RESPONSE_SCHEMA
      || metadata.schemaVersion !== job.responseSchemaVersion
      || !validTutorUsage(metadata.usage)
      || !Number.isSafeInteger(latencyMs) || latencyMs < 0 || latencyMs > 3_600_000) {
    throw tutorStoreError('TUTOR_GATEWAY_RESPONSE_MISMATCH');
  }
  if (!isRestrictedInferenceOutputText(turn.replyMarkdown, 1, TUTOR_MAX_REPLY_BYTES)) {
    throw tutorStoreError('TUTOR_GATEWAY_RESPONSE_MISMATCH');
  }
  const replyHash = tutorMessageHash(turn.replyMarkdown);
  const replyBytes = Buffer.byteLength(turn.replyMarkdown, 'utf8');
  return {
    replyMarkdown: turn.replyMarkdown,
    replyHash,
    replyBytes,
    runMetadata: {
      provider: metadata.provider,
      requestedModel: metadata.requestedModel,
      responseModel: metadata.responseModel,
      promptVersion: metadata.promptVersion,
      responseSchemaVersion: metadata.schemaVersion,
      usage: structuredClone(metadata.usage),
      latencyMs
    }
  };
}

export function projectTutorThreadBundle({ thread, snapshot, jobs, messages }) {
  const question = snapshot.snapshotPayload.question;
  return structuredClone({
    thread: {
      id: thread.id,
      learningSubmissionId: thread.learningSubmissionId,
      versionNumber: snapshot.versionNumber,
      formId: snapshot.formId,
      formVersion: snapshot.formVersion,
      sourceType: snapshot.sourceType,
      questionNumber: thread.questionNumber,
      status: thread.status,
      successfulTurnCount: thread.successfulTurnCount,
      requestCount: thread.requestCount,
      threadRevision: thread.threadRevision,
      forkedFromThreadId: thread.forkedFromThreadId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      closedAt: thread.closedAt
    },
    question: {
      questionNumber: question.questionNumber,
      questionId: question.questionId,
      promptMarkdown: question.promptMarkdown,
      choices: question.choices,
      isScored: question.isScored,
      officialAnswer: question.officialAnswer,
      acceptedOptions: question.acceptedOptions,
      studentAnswer: question.studentAnswer,
      studentReasoning: question.studentReasoning,
      solutionReferences: question.solutions.map((solution) => ({
        solutionId: solution.solutionId,
        title: solution.title,
        methodTags: solution.methodTags,
        qualityFlags: solution.qualityFlags
      }))
    },
    requests: jobs.map((job) => ({
      requestOrdinal: job.requestOrdinal,
      turnNumber: job.turnNumber,
      status: job.status,
      retryAuthorization: job.retryAuthorization,
      outcomeCode: job.outcomeCode,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    })),
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role,
      contentMarkdown: message.contentMarkdown,
      createdAt: message.createdAt
    }))
  });
}

export function projectTutorThreadSummary({
  thread, snapshot, latestJob = null, sourceEntitled = true
}) {
  return structuredClone({
    thread: {
      id: thread.id,
      learningSubmissionId: thread.learningSubmissionId,
      versionNumber: snapshot.versionNumber,
      formId: snapshot.formId,
      formVersion: snapshot.formVersion,
      sourceType: snapshot.sourceType,
      questionNumber: thread.questionNumber,
      status: thread.status,
      successfulTurnCount: thread.successfulTurnCount,
      requestCount: thread.requestCount,
      threadRevision: thread.threadRevision,
      forkedFromThreadId: thread.forkedFromThreadId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      closedAt: thread.closedAt
    },
    sourceEntitled,
    latestRequest: sourceEntitled && latestJob ? {
      requestOrdinal: latestJob.requestOrdinal,
      turnNumber: latestJob.turnNumber,
      status: latestJob.status,
      retryAuthorization: latestJob.retryAuthorization,
      outcomeCode: latestJob.outcomeCode,
      createdAt: latestJob.createdAt,
      completedAt: latestJob.completedAt
    } : null
  });
}

export function nextTutorThreadStatus({ successfulTurnCount, requestCount, successfulHistoryBytes }) {
  return successfulTurnCount >= TUTOR_MAX_SUCCESSFUL_TURNS
    || requestCount >= TUTOR_MAX_REQUESTS
    || successfulHistoryBytes >= TUTOR_MAX_HISTORY_BYTES
    ? 'CAPACITY_REACHED' : 'OPEN';
}

export function assertTutorEnqueueCapacity(thread, message) {
  const reservedReplyBytes = TUTOR_MAX_REPLY_BYTES;
  assertTutorThreadCapacity({
    successfulTurnCount: thread.successfulTurnCount,
    requestCount: thread.requestCount,
    successfulHistoryBytes: thread.successfulHistoryBytes,
    additionalHistoryBytes: Buffer.byteLength(message, 'utf8') + reservedReplyBytes
  });
}

export function tutorDispatchMetadata(metadata = {}) {
  const normalized = {
    provider: metadata.provider || 'openai',
    requestedModel: metadata.requestedModel,
    promptVersion: metadata.promptVersion || TUTOR_PROMPT_VERSION,
    responseSchemaVersion: metadata.responseSchemaVersion || TUTOR_RESPONSE_SCHEMA
  };
  if (normalized.provider !== 'openai'
      || typeof normalized.requestedModel !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(normalized.requestedModel)
      || normalized.promptVersion !== TUTOR_PROMPT_VERSION
      || normalized.responseSchemaVersion !== TUTOR_RESPONSE_SCHEMA) {
    throw tutorStoreError('INVALID_TUTOR_DISPATCH_METADATA');
  }
  return normalized;
}

export function validateTutorQueueOptions({ priority, maxAttempts }) {
  if (!Number.isSafeInteger(priority) || priority < 0 || priority > 100
      || !Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    throw tutorStoreError('INVALID_TUTOR_QUEUE_OPTIONS');
  }
}

export function validateTutorClaimOptions({ workerId, leaseMs }) {
  if (typeof workerId !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(workerId)
      || !Number.isSafeInteger(leaseMs) || leaseMs < 1 || leaseMs > 3_600_000) {
    throw tutorStoreError('INVALID_TUTOR_CLAIM_OPTIONS');
  }
}

export function validateTutorRetryAfterMs(retryAfterMs) {
  if (!Number.isSafeInteger(retryAfterMs) || retryAfterMs < 0 || retryAfterMs > 3_600_000) {
    throw tutorStoreError('INVALID_TUTOR_RETRY_DELAY');
  }
}
