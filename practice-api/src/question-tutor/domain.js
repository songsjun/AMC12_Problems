import {
  canonicalInferenceJson,
  inferenceSha256,
  isBoundedInferenceInputText,
  isRestrictedInferenceOutputText
} from '../infrastructure/amc-inference-contract.js';

export const TUTOR_CONTRACT_VERSION = 'amc-tutor-contract-v2';
export const TUTOR_REQUEST_SCHEMA = 'amc-tutor-turn-request-v2';
export const TUTOR_TASK = 'question_tutor_turn_v2';
export const TUTOR_RESPONSE_SCHEMA = 'amc-tutor-turn-v2';
export const TUTOR_PROMPT_VERSION = 'amc-question-tutor-prompt-v2';
export const TUTOR_SNAPSHOT_HASH_SCHEMA = 'amc-tutor-snapshot-hash-v2';
export const TUTOR_CONTEXT_HASH_SCHEMA = 'amc-tutor-context-hash-v2';
export const TUTOR_HISTORY_HASH_SCHEMA = 'amc-tutor-history-hash-v2';
export const TUTOR_INPUT_HASH_SCHEMA = 'amc-tutor-input-hash-v2';
export const TUTOR_CONTEXT_RELEASE_HASH_SCHEMA = 'amc-tutor-context-release-lineage-v1';
export const TUTOR_THREAD_LINEAGE_HASH_SCHEMA = 'amc-tutor-thread-lineage-hash-v1';
export const TUTOR_MAX_SUCCESSFUL_TURNS = 9;
export const TUTOR_MAX_REQUESTS = 32;
export const TUTOR_MAX_HISTORY_BYTES = 51_200;
export const TUTOR_MAX_CONTEXT_TEXT_BYTES = 160_000;
export const TUTOR_MAX_REQUEST_BODY_BYTES = 524_288;
export const TUTOR_MAX_REPLY_BYTES = 4_096;

const HASH = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const REVIEWER_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}$/;
const TAG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const INVALID_LINEAGE_TEXT = /[\u0000-\u001F\u007F\uFFFD]/u;
const OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const SOURCE_TYPES = new Set(['INTERACTIVE_FINAL', 'OPEN_REVIEW', 'BATCH_REVIEW']);
const SCORING_ORIGINS = new Set(['OFFICIAL_FINAL', 'BATCH_CONFIRMED']);
const ANALYSIS_CONTRACTS = new Set(['amc-analysis-contract-v1', 'amc-analysis-contract-v2']);
const JOB_STATUSES = new Set([
  'QUEUED', 'RUNNING', 'RETRY_WAIT', 'SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED'
]);
const TERMINAL_JOB_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED']);
const DISPOSITIONS = new Set([
  'NOT_DISPATCHED', 'MAY_HAVE_BEEN_DELIVERED', 'KNOWN_NO_RESULT', 'DELIVERED_RESULT'
]);

export class TutorDomainError extends Error {
  constructor(code) {
    super(code);
    this.name = 'TutorDomainError';
    this.code = code;
  }
}

function exactRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function validId(value) {
  return typeof value === 'string' && ID.test(value);
}

function validHash(value) {
  return typeof value === 'string' && HASH.test(value);
}

function validFormVersion(value) {
  return isBoundedInferenceInputText(value, 1, 100) && !INVALID_LINEAGE_TEXT.test(value);
}

function validOption(value) {
  return typeof value === 'string' && OPTIONS.includes(value);
}

function validPositiveInteger(value, maximum = 1_000_000) {
  return Number.isSafeInteger(value) && value >= 1 && value <= maximum;
}

function validNonnegativeInteger(value, maximum = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= 0 && value <= maximum;
}

function validTimestamp(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,6})?Z$/);
  if (!match) return false;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59;
}

function validTagArray(value, minimum) {
  return Array.isArray(value) && value.length >= minimum && value.length <= 32
    && new Set(value).size === value.length
    && value.every((item) => typeof item === 'string' && TAG.test(item));
}

function validAcceptedOptions(value, isScored, officialAnswer) {
  if (!isScored) return officialAnswer === null && Array.isArray(value) && value.length === 0;
  if (!validOption(officialAnswer) || !Array.isArray(value) || value.length < 1
      || value.length > OPTIONS.length || !value.includes(officialAnswer)) return false;
  let previous = -1;
  for (const option of value) {
    const position = OPTIONS.indexOf(option);
    if (position < 0 || position <= previous) return false;
    previous = position;
  }
  return true;
}

function validSolution(solution) {
  return exactRecord(solution, [
    'solutionId', 'approvalStatus', 'modelEligible', 'title', 'markdown', 'bodySha256',
    'sourceSha256', 'reviewerId', 'reviewedAt', 'rightsStatus', 'authorityReceiptId',
    'authorityReceiptStatus', 'methodTags', 'qualityFlags'
  ]) && validId(solution.solutionId)
    && solution.approvalStatus === 'APPROVED' && solution.modelEligible === true
    && isBoundedInferenceInputText(solution.title, 1, 256)
    && isBoundedInferenceInputText(solution.markdown, 1, 16_384)
    && validHash(solution.bodySha256) && solution.bodySha256 === inferenceSha256(solution.markdown)
    && validHash(solution.sourceSha256)
    && typeof solution.reviewerId === 'string' && REVIEWER_ID.test(solution.reviewerId)
    && validTimestamp(solution.reviewedAt)
    && solution.rightsStatus === 'approved-for-ai-use'
    && validId(solution.authorityReceiptId) && solution.authorityReceiptStatus === 'active'
    && validTagArray(solution.methodTags, 1) && validTagArray(solution.qualityFlags, 0);
}

function textBytes(values) {
  return values.reduce((sum, value) => sum + (value === null ? 0 : Buffer.byteLength(value, 'utf8')), 0);
}

export function tutorCanonicalJson(value) {
  return canonicalInferenceJson(value);
}

export function tutorSha256(value) {
  return inferenceSha256(value);
}

export function computeTutorSnapshotHash(context) {
  return inferenceSha256(canonicalInferenceJson({ schema: TUTOR_SNAPSHOT_HASH_SCHEMA, context }));
}

export function computeTutorContextHash({ threadId, context }) {
  return inferenceSha256(canonicalInferenceJson({ schema: TUTOR_CONTEXT_HASH_SCHEMA, threadId, context }));
}

export function computeTutorHistoryHash({ threadId, contextHash, priorTurns }) {
  return inferenceSha256(canonicalInferenceJson({
    schema: TUTOR_HISTORY_HASH_SCHEMA, threadId, contextHash, priorTurns
  }));
}

export function computeTutorInputHash({
  correlationId, threadId, turnId, turnNumber, contextHash, historyHash, message
}) {
  return inferenceSha256(canonicalInferenceJson({
    schema: TUTOR_INPUT_HASH_SCHEMA,
    correlationId,
    threadId,
    turnId,
    turnNumber,
    contextHash,
    historyHash,
    message
  }));
}

export function computeTutorContextReleaseHash(lineage) {
  if (!exactRecord(lineage, [
    'sourceType', 'formId', 'formVersion', 'manifestHash', 'contentHash', 'questionBundleHash',
    'contextSetId', 'contextArtifactSha256', 'approvalAuthorityId', 'approvalReceiptSetHash',
    'openReviewReleaseHash'
  ]) || !SOURCE_TYPES.has(lineage.sourceType) || !validId(lineage.formId)
      || !validFormVersion(lineage.formVersion)
      || !validHash(lineage.manifestHash) || !validHash(lineage.contentHash)
      || !validHash(lineage.questionBundleHash) || !validId(lineage.contextSetId)
      || !validHash(lineage.contextArtifactSha256)
      || typeof lineage.approvalAuthorityId !== 'string' || !REVIEWER_ID.test(lineage.approvalAuthorityId)
      || !validHash(lineage.approvalReceiptSetHash)
      || (lineage.sourceType === 'OPEN_REVIEW' && !validHash(lineage.openReviewReleaseHash))
      || (lineage.sourceType !== 'OPEN_REVIEW' && lineage.openReviewReleaseHash !== null)) {
    throw new TutorDomainError('INVALID_CONTEXT_RELEASE_LINEAGE');
  }
  return inferenceSha256(canonicalInferenceJson({
    schema: TUTOR_CONTEXT_RELEASE_HASH_SCHEMA,
    ...lineage
  }));
}

export function computeTutorThreadLineageHash(lineage) {
  if (!exactRecord(lineage, [
    'analysisRunId', 'analysisContractVersion', 'reportId', 'reportHash', 'snapshotHash',
    'questionResponseHash', 'scoringSnapshotHash', 'scoringOrigin', 'initialDeletionGeneration'
  ]) || !validId(lineage.analysisRunId) || !ANALYSIS_CONTRACTS.has(lineage.analysisContractVersion)
      || !validId(lineage.reportId) || !validHash(lineage.reportHash)
      || !validHash(lineage.snapshotHash) || !validHash(lineage.questionResponseHash)
      || !validHash(lineage.scoringSnapshotHash) || !SCORING_ORIGINS.has(lineage.scoringOrigin)
      || !validNonnegativeInteger(lineage.initialDeletionGeneration)) {
    throw new TutorDomainError('INVALID_THREAD_LINEAGE');
  }
  return inferenceSha256(canonicalInferenceJson({
    schema: TUTOR_THREAD_LINEAGE_HASH_SCHEMA,
    ...lineage
  }));
}

export function isValidTutorContext(context) {
  if (!exactRecord(context, [
    'learningSubmissionId', 'learningSubmissionVersionId', 'versionNumber', 'formId', 'formVersion',
    'contextSetId', 'contextArtifactSha256', 'contextReleaseHash', 'evidenceHash', 'question'
  ]) || !validId(context.learningSubmissionId) || !validId(context.learningSubmissionVersionId)
      || !validPositiveInteger(context.versionNumber) || !validId(context.formId)
      || !validFormVersion(context.formVersion)
      || !validId(context.contextSetId) || !validHash(context.contextArtifactSha256)
      || !validHash(context.contextReleaseHash) || !validHash(context.evidenceHash)
      || !exactRecord(context.question, [
        'questionNumber', 'questionId', 'promptMarkdown', 'choices', 'isScored', 'officialAnswer',
        'acceptedOptions', 'studentAnswer', 'studentReasoning', 'solutions'
      ])) return false;
  const question = context.question;
  if (!validPositiveInteger(question.questionNumber, 25) || !validId(question.questionId)
      || !isBoundedInferenceInputText(question.promptMarkdown, 1, 16_384)
      || !Array.isArray(question.choices) || question.choices.length !== OPTIONS.length
      || typeof question.isScored !== 'boolean'
      || !validAcceptedOptions(question.acceptedOptions, question.isScored, question.officialAnswer)
      || !(question.studentAnswer === null || validOption(question.studentAnswer))
      || !(question.studentReasoning === null
        || isBoundedInferenceInputText(question.studentReasoning, 1, 12_000))
      || !Array.isArray(question.solutions) || question.solutions.length < 2
      || question.solutions.length > 8) return false;
  if (question.choices.some((choice, index) => !exactRecord(choice, ['label', 'textMarkdown'])
      || choice.label !== OPTIONS[index]
      || !isBoundedInferenceInputText(choice.textMarkdown, 1, 2_048))) return false;
  const solutionIds = new Set();
  for (const solution of question.solutions) {
    if (!validSolution(solution) || solutionIds.has(solution.solutionId)) return false;
    solutionIds.add(solution.solutionId);
  }
  const contextText = [
    question.promptMarkdown,
    ...question.choices.map((choice) => choice.textMarkdown),
    question.studentReasoning,
    ...question.solutions.flatMap((solution) => [
      solution.title, solution.markdown, ...solution.methodTags, ...solution.qualityFlags
    ])
  ];
  return textBytes(contextText) <= TUTOR_MAX_CONTEXT_TEXT_BYTES;
}

function assertPriorTurns(priorTurns, turnNumber) {
  if (!Array.isArray(priorTurns) || priorTurns.length !== turnNumber - 1) {
    throw new TutorDomainError('INCOMPLETE_TUTOR_HISTORY');
  }
  for (let index = 0; index < priorTurns.length; index += 1) {
    const turn = priorTurns[index];
    if (!exactRecord(turn, ['turnNumber', 'userMessage', 'assistantReply'])
        || turn.turnNumber !== index + 1
        || !isBoundedInferenceInputText(turn.userMessage, 1, 2_048)
        || !isRestrictedInferenceOutputText(turn.assistantReply, 1, 4_096)) {
      throw new TutorDomainError('INVALID_TUTOR_HISTORY');
    }
  }
}

export function assertTutorThreadCapacity({
  successfulTurnCount, requestCount, successfulHistoryBytes, additionalHistoryBytes = 0
}) {
  if (!validNonnegativeInteger(successfulTurnCount, TUTOR_MAX_SUCCESSFUL_TURNS)
      || !validNonnegativeInteger(requestCount, TUTOR_MAX_REQUESTS)
      || !validNonnegativeInteger(successfulHistoryBytes, TUTOR_MAX_HISTORY_BYTES)
      || !validNonnegativeInteger(additionalHistoryBytes, TUTOR_MAX_HISTORY_BYTES)) {
    throw new TutorDomainError('INVALID_TUTOR_CAPACITY_STATE');
  }
  if (successfulTurnCount >= TUTOR_MAX_SUCCESSFUL_TURNS || requestCount >= TUTOR_MAX_REQUESTS
      || successfulHistoryBytes + additionalHistoryBytes > TUTOR_MAX_HISTORY_BYTES) {
    throw new TutorDomainError('FORK_REQUIRED');
  }
  return true;
}

export function buildTutorTurnRequest({
  correlationId, threadId, turnId, turnNumber, context, priorTurns, message
}) {
  if (!validId(correlationId) || !validId(threadId) || !validId(turnId)
      || !validPositiveInteger(turnNumber)) throw new TutorDomainError('INVALID_TUTOR_TURN_IDENTITY');
  if (turnNumber > TUTOR_MAX_SUCCESSFUL_TURNS) throw new TutorDomainError('FORK_REQUIRED');
  if (!isValidTutorContext(context)) throw new TutorDomainError('INVALID_TUTOR_CONTEXT');
  if (!isBoundedInferenceInputText(message, 1, 2_048)) throw new TutorDomainError('INVALID_TUTOR_MESSAGE');
  assertPriorTurns(priorTurns, turnNumber);
  if (textBytes([message, ...priorTurns.flatMap((turn) => [turn.userMessage, turn.assistantReply])])
      > TUTOR_MAX_HISTORY_BYTES) throw new TutorDomainError('FORK_REQUIRED');
  const request = {
    schema: TUTOR_REQUEST_SCHEMA,
    task: TUTOR_TASK,
    correlationId,
    inputHash: '0'.repeat(64),
    snapshotHash: computeTutorSnapshotHash(context),
    contextHash: computeTutorContextHash({ threadId, context }),
    historyHash: '0'.repeat(64),
    safetyId: 'amc-math-safe-v1',
    threadId,
    turnId,
    turnNumber,
    context: structuredClone(context),
    priorTurns: structuredClone(priorTurns),
    message
  };
  request.historyHash = computeTutorHistoryHash(request);
  request.inputHash = computeTutorInputHash(request);
  if (Buffer.byteLength(JSON.stringify(request), 'utf8') > TUTOR_MAX_REQUEST_BODY_BYTES) {
    throw new TutorDomainError('TUTOR_REQUEST_TOO_LARGE');
  }
  return request;
}

export function isTutorJobTransitionAllowed(job, nextStatus) {
  if (!job || typeof job !== 'object' || Array.isArray(job)
      || !JOB_STATUSES.has(job.status) || !JOB_STATUSES.has(nextStatus)
      || typeof job.providerInvoked !== 'boolean' || !DISPOSITIONS.has(job.deliveryDisposition)
      || typeof job.retryable !== 'boolean' || TERMINAL_JOB_STATUSES.has(job.status)) return false;
  const safeNoResult = (!job.providerInvoked && job.deliveryDisposition === 'NOT_DISPATCHED')
    || (job.providerInvoked && job.deliveryDisposition === 'KNOWN_NO_RESULT');
  if (job.status === 'QUEUED') {
    return ['RUNNING', 'CANCELLED'].includes(nextStatus)
      && !job.providerInvoked && job.deliveryDisposition === 'NOT_DISPATCHED';
  }
  if (job.status === 'RETRY_WAIT') {
    if (nextStatus === 'RUNNING') return safeNoResult && job.retryable;
    return nextStatus === 'CANCELLED' && safeNoResult;
  }
  if (job.status !== 'RUNNING') return false;
  if (nextStatus === 'SUCCEEDED') {
    return job.providerInvoked && job.deliveryDisposition === 'DELIVERED_RESULT' && !job.retryable;
  }
  if (nextStatus === 'RETRY_WAIT') {
    return job.retryable && safeNoResult;
  }
  if (nextStatus === 'DELIVERY_UNKNOWN') {
    return job.providerInvoked && job.deliveryDisposition === 'MAY_HAVE_BEEN_DELIVERED';
  }
  if (nextStatus === 'FAILED') {
    return !job.retryable && safeNoResult;
  }
  return nextStatus === 'CANCELLED' && safeNoResult;
}

export function tutorLeaseExpiryStatus(job) {
  if (!job || typeof job !== 'object' || Array.isArray(job)
      || job.status !== 'RUNNING' || typeof job.providerInvoked !== 'boolean'
      || !DISPOSITIONS.has(job.deliveryDisposition) || typeof job.retryable !== 'boolean') {
    throw new TutorDomainError('INVALID_TUTOR_LEASE_STATE');
  }
  if (!job.providerInvoked && job.deliveryDisposition === 'NOT_DISPATCHED') return 'RETRY_WAIT';
  if (job.providerInvoked && job.deliveryDisposition === 'KNOWN_NO_RESULT') {
    return job.retryable ? 'RETRY_WAIT' : 'FAILED';
  }
  return 'DELIVERY_UNKNOWN';
}
