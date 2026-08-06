import { createHash, randomUUID } from 'node:crypto';
import { providerRetentionNotBefore } from './infrastructure/assemblyai-retention-profile.js';
import { analysisInputHash, canonicalHash, canonicalJson } from './learning-review/canonical.js';
import {
  ANALYSIS_CONTRACT_VERSION,
  isValidAnalysisScoringSnapshot
} from './infrastructure/amc-inference-contract.js';
import { ATTEMPT_MODE, OPEN_REVIEW_STATUS, openReviewReleaseHash } from './open-review/domain.js';
import {
  BATCH_REVIEW_ANCHOR_REASON,
  BATCH_REVIEW_BLANK_ORIGIN,
  BATCH_REVIEW_PHASE,
  BATCH_REVIEW_SOURCE_TYPE,
  batchReviewAnchorHash,
  isCompleteBatchReviewContext
} from './batch-review/domain.js';
import {
  TUTOR_MAX_ACTIVE_JOBS_PER_STUDENT,
  TutorStoreError,
  assertTutorLiveThreadCapacity,
  assertTutorEnqueueCapacity,
  buildAndValidateTutorRequest,
  buildTutorForkThreadRecord,
  buildTutorRootThreadRecord,
  buildTutorSnapshotRecord,
  nextTutorThreadStatus,
  normalizeTutorProviderBudget,
  projectTutorThreadBundle,
  projectTutorThreadSummary,
  tutorDispatchMetadata,
  tutorForkCreationRequestHash,
  tutorMessageHash,
  tutorProviderBudgetError,
  tutorRequestHash,
  tutorRootThreadCreationRequestHash,
  tutorSnapshotSemanticHash,
  tutorThreadTombstoneRequestHash,
  validateTutorSummaryPage,
  tutorThreadCreationRequestHash,
  validateTutorClaimOptions,
  validateTutorGatewaySuccess,
  validateTutorQueueOptions,
  validateTutorRetryAfterMs,
  validateTutorSnapshotRecord
} from './question-tutor/store-contract.js';
import {
  TUTOR_CONTRACT_VERSION,
  TUTOR_MAX_HISTORY_BYTES,
  buildTutorTurnRequest,
  computeTutorContextHash,
  computeTutorContextReleaseHash,
  tutorLeaseExpiryStatus,
  tutorSha256
} from './question-tutor/domain.js';
import { compareAiWorkWithinKind } from './ai-work-policy.js';

const clone = (value) => structuredClone(value);
const cloneMap = (map) => new Map([...map].map(([key, value]) => [key, clone(value)]));
const formKey = (id, version) => `${id}\u0000${version}`;
const idempotencyKey = (studentId, scope, key) => `${studentId}\u0000${scope}\u0000${key}`;

function completeActiveBatchReviewContext(store, form) {
  if (!form?.contentSealed) return null;
  const contextId = store.activeContextSetByForm.get(formKey(form.id, form.version));
  const context = contextId && store.approvedContextSets.get(contextId);
  return isCompleteBatchReviewContext(form, context) ? context : null;
}

function validLearningEntitlement(store, learning, {
  cleanup = false, purpose = 'EXISTING_WORK'
} = {}) {
  const attempt = learning && store.attempts.get(learning.attemptId);
  if (!learning || !attempt
      || attempt.studentId !== learning.studentId
      || attempt.formId !== learning.formId || attempt.formVersion !== learning.formVersion
      || (!cleanup && learning.lifecycleStatus !== 'COMMITTED')) return false;
  if (learning.sourceType === 'INTERACTIVE_FINAL') {
    const official = (store.submissions.get(attempt.id) || [])
      .find((submission) => submission.id === learning.officialSubmissionId);
    const form = store.forms.get(formKey(learning.formId, learning.formVersion));
    return Boolean(attempt.attemptMode === ATTEMPT_MODE.TIMED
      && ['FINALIZED', 'RESET'].includes(attempt.phase)
      && (learning.attemptMode || ATTEMPT_MODE.TIMED) === ATTEMPT_MODE.TIMED
      && learning.officialSubmissionKind === 'FINAL'
      && official?.attemptId === attempt.id && official.kind === 'FINAL'
      && (purpose !== 'NEW_BATCH'
        || (form?.published === true && completeActiveBatchReviewContext(store, form))));
  }
  if (learning.sourceType === BATCH_REVIEW_SOURCE_TYPE) {
    const form = store.forms.get(formKey(learning.formId, learning.formVersion));
    return Boolean(attempt.attemptMode === ATTEMPT_MODE.BATCH_REVIEW
      && attempt.phase === BATCH_REVIEW_PHASE
      && learning.attemptMode === ATTEMPT_MODE.BATCH_REVIEW
      && learning.officialSubmissionId === null && learning.officialSubmissionKind === null
      && learning.openReviewReleaseId === null
      && Boolean(form?.publishedAt)
      && (cleanup || purpose === 'EXISTING_WORK'
        || (form.published === true && completeActiveBatchReviewContext(store, form))));
  }
  if (learning.sourceType !== 'OPEN_REVIEW' || attempt.attemptMode !== ATTEMPT_MODE.OPEN_REVIEW
      || attempt.phase !== 'OPEN_REVIEW' || learning.attemptMode !== ATTEMPT_MODE.OPEN_REVIEW
      || learning.officialSubmissionId !== null || learning.officialSubmissionKind !== null) return false;
  const release = store.openReviewReleases.get(learning.openReviewReleaseId);
  return Boolean(release && release.formId === learning.formId && release.formVersion === learning.formVersion
    && (cleanup || [OPEN_REVIEW_STATUS.ACTIVE, OPEN_REVIEW_STATUS.SUPERSEDED_VALID].includes(release.status)));
}

function memoryTutorSource(store, snapshot) {
  const submission = [...store.learningSubmissions.values()]
    .find((candidate) => candidate.id === snapshot.learningSubmissionId);
  const version = (store.learningVersions.get(snapshot.learningSubmissionId) || [])
    .find((candidate) => candidate.id === snapshot.learningSubmissionVersionId);
  const run = [...store.analysisRuns.values()]
    .find((candidate) => candidate.id === snapshot.analysisRunId);
  const analysis = (store.questionAnalyses.get(snapshot.analysisRunId) || [])
    .find((candidate) => candidate.questionNumber === snapshot.questionNumber);
  const report = [...store.learningReports.values()]
    .find((candidate) => candidate.id === snapshot.reportId);
  const response = (store.learningResponses.get(snapshot.learningSubmissionVersionId) || [])
    .find((candidate) => candidate.questionNumber === snapshot.questionNumber
      && candidate.answerOrigin === snapshot.scoringOrigin);
  const storedContext = store.approvedContextSets.get(snapshot.contextSetId);
  const context = storedContext?.sealed ? storedContext : null;
  const question = context?.questions
    .find((candidate) => candidate.questionNumber === snapshot.questionNumber);
  const form = version && store.forms.get(formKey(version.formId, version.formVersion));
  const batch = version?.batchId ? store.learningBatches.get(version.batchId) : null;
  return { submission, version, run, analysis, report, response, context, question, form, batch };
}

function memoryTutorCommittedBatchAuthorityMatches({ submission, version, batch, batchResult }) {
  return Boolean(version?.batchId
    && batch?.id === version.batchId
    && batch.studentId === submission?.studentId
    && batch.learningSubmissionId === submission?.id
    && batch.attemptId === submission?.attemptId
    && batch.formId === submission?.formId
    && batch.formVersion === submission?.formVersion
    && batch.sourceType === submission?.sourceType
    && batch.status === 'COMMITTED'
    && batch.committedVersionId === version.id
    && batch.committedVersionNumber === version.versionNumber
    && batchResult?.batchId === version.batchId
    && batchResult.learningSubmissionVersionId === version.id);
}

function memoryTutorEligibleSolutions(question) {
  return (question?.solutions || [])
    .filter((solution) => solution.modelEligibility?.eligible === true
      && solution.authorityReceipt?.status === 'active')
    .map((solution) => ({
      solutionId: solution.artifactSolutionId,
      approvalStatus: 'APPROVED', modelEligible: true,
      title: solution.title, markdown: solution.bodyMarkdown,
      bodySha256: solution.bodySha256, sourceSha256: solution.sourceRef.sha256,
      reviewerId: solution.reviewerId, reviewedAt: solution.reviewedAt,
      rightsStatus: solution.rightsStatus,
      authorityReceiptId: solution.authorityReceipt.receiptId,
      authorityReceiptStatus: solution.authorityReceipt.status,
      methodTags: clone(solution.methodTags), qualityFlags: clone(solution.qualityFlags)
    }));
}

function memoryTutorContextReleaseHash(store, submission, context) {
  const release = submission?.sourceType === 'OPEN_REVIEW'
    ? store.openReviewReleases.get(submission.openReviewReleaseId) : null;
  if (!submission || !context?.releaseBinding) return null;
  return computeTutorContextReleaseHash({
    sourceType: submission.sourceType,
    formId: submission.formId,
    formVersion: submission.formVersion,
    manifestHash: context.releaseBinding.manifestHash,
    contentHash: context.releaseBinding.contentHash,
    questionBundleHash: context.releaseBinding.questionBundleHash,
    contextSetId: context.id,
    contextArtifactSha256: context.artifactSetHash,
    approvalAuthorityId: context.approvalAuthorityId,
    approvalReceiptSetHash: context.approvalReceiptSetHash,
    openReviewReleaseHash: release?.releaseHash || null
  });
}

function assertMemoryTutorSourceIsLive(store, snapshot) {
  const source = memoryTutorSource(store, snapshot);
  const {
    submission, version, run, analysis, report, response, context, question, form, batch
  } = source;
  const scoring = submission && version && response
    ? analysisScoringSnapshot(store, submission, version, response) : null;
  const batchResult = version?.batchId ? store.learningBatchResults.get(version.batchId) : null;
  const batchAuthorityMatches = memoryTutorCommittedBatchAuthorityMatches({
    submission, version, batch, batchResult
  });
  const scoringAuthorityMatches = snapshot.scoringOrigin === 'OFFICIAL_FINAL'
    ? snapshot.officialSubmissionId === submission?.officialSubmissionId
      && snapshot.batchResultId === null && !version?.batchId
    : snapshot.scoringOrigin === 'BATCH_CONFIRMED'
      ? snapshot.officialSubmissionId === null
      && batchResult?.id === snapshot.batchResultId
      && batchResult?.learningSubmissionVersionId === version?.id
      : false;
  const payloadQuestion = snapshot.snapshotPayload?.question;
  const choices = question && (Array.isArray(question.choices)
    ? Object.fromEntries(question.choices.map((choice) => [choice.option, choice.textMarkdown]))
    : question.choices);
  const expectedSolutions = memoryTutorEligibleSolutions(question);
  const responseHash = response && canonicalHash({
    questionNumber: response.questionNumber, selectedOption: response.selectedOption,
    reasoningText: response.reasoningText, answerOrigin: response.answerOrigin
  });
  const authoritativeReleaseHash = memoryTutorContextReleaseHash(store, submission, context);
  if (!submission || submission.studentId !== snapshot.studentId
      || snapshot.sourceType !== submission.sourceType
      || submission.lifecycleStatus !== 'COMMITTED'
      || submission.deletionGeneration !== snapshot.initialDeletionGeneration
      || !validLearningEntitlement(store, submission)
      || !version || version.learningSubmissionId !== submission.id
      || version.versionNumber !== snapshot.versionNumber
      || version.formId !== snapshot.formId || version.formVersion !== snapshot.formVersion
      || version.contextSetId !== snapshot.contextSetId || version.evidenceHash !== snapshot.evidenceHash
      || !run || run.learningSubmissionVersionId !== version.id
      || run.contextSetId !== snapshot.contextSetId || run.versionNumber !== snapshot.versionNumber
      || run.evidenceHash !== snapshot.evidenceHash
      || run.analysisContractVersion !== snapshot.analysisContractVersion
      || run.deletionGeneration !== snapshot.initialDeletionGeneration
      || !['COMPLETE', 'PARTIAL'].includes(run.status)
      || !analysis || analysis.status !== 'SUCCEEDED'
      || analysis.questionInputHash !== snapshot.analysisQuestionInputHash
      || analysis.questionContextHash !== snapshot.analysisQuestionContextHash
      || !report || report.analysisRunId !== run.id
      || report.learningSubmissionVersionId !== version.id || report.reportHash !== snapshot.reportHash
      || !['COMPLETE', 'PARTIAL'].includes(report.status) || report.status !== run.status
      || !response || !context || context.artifactSetHash !== snapshot.contextArtifactSha256
      || context.formId !== snapshot.formId || context.formVersion !== snapshot.formVersion
      || !form || form.manifestHash !== context.releaseBinding?.manifestHash
      || form.contentHash !== context.releaseBinding?.contentHash
      || form.questionBundleHash !== context.releaseBinding?.questionBundleHash
      || !question || question.questionContentHash !== snapshot.questionContentHash
      || responseHash !== snapshot.questionResponseHash
      || !scoring || canonicalHash(scoring) !== snapshot.scoringSnapshotHash
      || !scoringAuthorityMatches
      || (snapshot.scoringOrigin === 'BATCH_CONFIRMED' && !batchAuthorityMatches)
      || payloadQuestion.promptMarkdown !== question.promptMarkdown
      || payloadQuestion.questionId !== `${snapshot.formId}:q:${snapshot.questionNumber}`
      || authoritativeReleaseHash !== snapshot.contextReleaseHash
      || JSON.stringify(payloadQuestion.choices) !== JSON.stringify(
        ['A', 'B', 'C', 'D', 'E'].map((label) => ({ label, textMarkdown: choices[label] })))
      || payloadQuestion.studentAnswer !== response.selectedOption
      || payloadQuestion.studentReasoning !== (response.reasoningText || null)
      || payloadQuestion.isScored !== scoring.isScored
      || payloadQuestion.officialAnswer !== scoring.canonicalAnswer
      || JSON.stringify(payloadQuestion.acceptedOptions) !== JSON.stringify(scoring.acceptedOptions)
      || JSON.stringify(payloadQuestion.solutions) !== JSON.stringify(expectedSolutions)) {
    throw new TutorStoreError('TUTOR_SOURCE_NOT_LIVE');
  }
  return source;
}

function buildMemoryTutorRootSnapshot(store, input, createdAt) {
  const submission = [...store.learningSubmissions.values()].find((candidate) =>
    candidate.id === input.learningSubmissionId && candidate.studentId === input.studentId);
  const version = (store.learningVersions.get(input.learningSubmissionId) || [])
    .find((candidate) => candidate.versionNumber === input.versionNumber);
  const run = version && [...store.analysisRuns.values()]
    .find((candidate) => candidate.learningSubmissionVersionId === version.id);
  const analysis = run && (store.questionAnalyses.get(run.id) || [])
    .find((candidate) => candidate.questionNumber === input.questionNumber);
  const report = version && store.learningReports.get(version.id);
  const response = version && (store.learningResponses.get(version.id) || [])
    .find((candidate) => candidate.questionNumber === input.questionNumber
      && ['OFFICIAL_FINAL', 'BATCH_CONFIRMED'].includes(candidate.answerOrigin));
  const storedContext = version && store.approvedContextSets.get(version.contextSetId);
  const context = storedContext?.sealed ? storedContext : null;
  const question = context?.questions
    .find((candidate) => candidate.questionNumber === input.questionNumber);
  const form = version && store.forms.get(formKey(version.formId, version.formVersion));
  const scoring = submission && version && response
    ? analysisScoringSnapshot(store, submission, version, response) : null;
  const solutions = memoryTutorEligibleSolutions(question);
  const batch = version?.batchId ? store.learningBatches.get(version.batchId) : null;
  const batchResult = version?.batchId ? store.learningBatchResults.get(version.batchId) : null;
  const batchAuthorityMatches = memoryTutorCommittedBatchAuthorityMatches({
    submission, version, batch, batchResult
  });
  if (!submission || submission.lifecycleStatus !== 'COMMITTED'
      || !validLearningEntitlement(store, submission)
      || !version || version.learningSubmissionId !== submission.id
      || version.formId !== submission.formId || version.formVersion !== submission.formVersion
      || !run || !['COMPLETE', 'PARTIAL'].includes(run.status)
      || run.learningSubmissionVersionId !== version.id
      || run.contextSetId !== version.contextSetId || run.versionNumber !== version.versionNumber
      || run.evidenceHash !== version.evidenceHash
      || run.deletionGeneration !== submission.deletionGeneration
      || !analysis || analysis.status !== 'SUCCEEDED'
      || !analysis.questionInputHash || !analysis.questionContextHash
      || !report || report.analysisRunId !== run.id
      || report.learningSubmissionVersionId !== version.id
      || !['COMPLETE', 'PARTIAL'].includes(report.status) || report.status !== run.status
      || !response || !scoring || !isValidAnalysisScoringSnapshot(scoring, response.selectedOption)
      || !context || context.formId !== version.formId || context.formVersion !== version.formVersion
      || !form || form.manifestHash !== context.releaseBinding?.manifestHash
      || form.contentHash !== context.releaseBinding?.contentHash
      || form.questionBundleHash !== context.releaseBinding?.questionBundleHash
      || !question || solutions.length < 2
      || (response.answerOrigin === 'OFFICIAL_FINAL'
        && (version.batchId || !submission.officialSubmissionId))
      || (response.answerOrigin === 'BATCH_CONFIRMED' && !batchAuthorityMatches)) {
    throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
  }
  const choices = ['A', 'B', 'C', 'D', 'E'].map((label) => ({
    label,
    textMarkdown: Array.isArray(question.choices)
      ? question.choices.find((choice) => choice.option === label)?.textMarkdown
      : question.choices[label]
  }));
  const snapshot = buildTutorSnapshotRecord({
    id: input.snapshotId,
    studentId: input.studentId,
    learningSubmissionId: submission.id,
    learningSubmissionVersionId: version.id,
    versionNumber: version.versionNumber,
    formId: version.formId,
    formVersion: version.formVersion,
    sourceType: submission.sourceType,
    questionNumber: input.questionNumber,
    contextSetId: version.contextSetId,
    questionContentHash: question.questionContentHash,
    analysisRunId: run.id,
    analysisContractVersion: run.analysisContractVersion,
    analysisQuestionInputHash: analysis.questionInputHash,
    analysisQuestionContextHash: analysis.questionContextHash,
    reportId: report.id,
    reportHash: report.reportHash,
    evidenceHash: version.evidenceHash,
    response: {
      selectedOption: response.selectedOption,
      reasoningText: response.reasoningText,
      answerOrigin: response.answerOrigin
    },
    scoring,
    officialSubmissionId: response.answerOrigin === 'OFFICIAL_FINAL'
      ? submission.officialSubmissionId : null,
    batchResultId: response.answerOrigin === 'BATCH_CONFIRMED' ? batchResult.id : null,
    initialDeletionGeneration: submission.deletionGeneration,
    contextArtifactSha256: context.artifactSetHash,
    contextReleaseHash: memoryTutorContextReleaseHash(store, submission, context),
    promptMarkdown: question.promptMarkdown,
    choices,
    solutions,
    createdAt
  });
  assertMemoryTutorSourceIsLive(store, snapshot);
  return snapshot;
}

function memoryTutorThreadAggregate(store, threadId) {
  const thread = store.tutorThreads.get(threadId);
  const snapshot = thread && store.tutorSnapshots.get(thread.snapshotId);
  const jobs = [...store.tutorTurnJobs.values()]
    .filter((job) => job.threadId === threadId)
    .sort((left, right) => left.requestOrdinal - right.requestOrdinal);
  const messages = [...store.tutorMessages.values()]
    .filter((message) => message.threadId === threadId);
  return { thread, snapshot, jobs, messages };
}

function memoryTutorAggregateMatchesPath(aggregate, {
  studentId, learningSubmissionId, versionNumber, questionNumber
}) {
  return Boolean(aggregate.thread && aggregate.snapshot
    && aggregate.thread.studentId === studentId
    && aggregate.thread.learningSubmissionId === learningSubmissionId
    && aggregate.thread.questionNumber === questionNumber
    && aggregate.snapshot.versionNumber === versionNumber);
}

function tutorPriorTurns(jobs, messages, successfulTurnCount) {
  const byId = new Map(messages.map((message) => [message.id, message]));
  const successful = jobs.filter((job) => job.status === 'SUCCEEDED'
      && job.turnNumber <= successfulTurnCount)
    .sort((left, right) => left.turnNumber - right.turnNumber);
  if (successful.length !== successfulTurnCount) throw new TutorStoreError('INCOMPLETE_TUTOR_HISTORY');
  return successful.map((job, index) => {
    const request = byId.get(job.requestMessageId);
    const response = byId.get(job.responseMessageId);
    if (job.turnNumber !== index + 1 || !request || request.role !== 'USER'
        || !response || response.role !== 'ASSISTANT'
        || request.contentSha256 !== tutorMessageHash(request.contentMarkdown)
        || response.contentSha256 !== tutorMessageHash(response.contentMarkdown)
        || response.contentSha256 !== job.replySha256) {
      throw new TutorStoreError('INCOMPLETE_TUTOR_HISTORY');
    }
    return {
      turnNumber: job.turnNumber,
      userMessage: request.contentMarkdown,
      assistantReply: response.contentMarkdown
    };
  });
}

function validMemoryTutorWorkerFence(store, aggregate, input, now) {
  const { thread, snapshot } = aggregate;
  const job = store.tutorTurnJobs.get(input.jobId);
  const session = job && store.sessions.get(job.authorizedSessionId);
  if (!job || job.threadId !== thread?.id || job.status !== 'RUNNING'
      || job.leaseOwner !== input.workerId || job.leaseToken !== input.leaseToken
      || new Date(job.leaseExpiresAt).getTime() <= new Date(now).getTime()
      || job.deletionGeneration !== input.expectedDeletionGeneration
      || thread.deletionGeneration !== input.expectedDeletionGeneration
      || !session || session.studentId !== job.studentId || session.revokedAt
      || new Date(session.expiresAt).getTime() <= new Date(now).getTime()
      || !snapshot || snapshot.initialDeletionGeneration !== thread.initialDeletionGeneration) return null;
  try {
    assertMemoryTutorSourceIsLive(store, snapshot);
  } catch {
    return null;
  }
  return job;
}

function analysisScoringSnapshot(store, submission, version, response) {
  let item = null;
  if (response?.answerOrigin === 'BATCH_CONFIRMED' && version?.batchId) {
    const result = store.learningBatchResults.get(version.batchId);
    if (result?.learningSubmissionVersionId !== version.id) return null;
    item = result.items.find((candidate) => candidate.questionNumber === response.questionNumber) || null;
  } else if (response?.answerOrigin === 'OFFICIAL_FINAL' && !version?.batchId
      && submission?.officialSubmissionId) {
    item = (store.submissionAnswers.get(submission.officialSubmissionId) || [])
      .find((candidate) => candidate.questionNumber === response.questionNumber) || null;
  }
  return item && {
    isScored: item.isScored,
    canonicalAnswer: item.correctOption,
    acceptedOptions: clone(item.acceptedOptions),
    studentAnswerIsCorrect: item.isCorrect,
    selectedOption: item.selectedOption
  };
}

function validBatchEntitlement(store, batch, learning, options = {}) {
  const attempt = batch && store.attempts.get(batch.attemptId);
  return Boolean(batch && learning && attempt
    && attempt.studentId === batch.studentId
    && attempt.formId === batch.formId && attempt.formVersion === batch.formVersion
    && learning.id === batch.learningSubmissionId
    && learning.studentId === batch.studentId && learning.attemptId === batch.attemptId
    && learning.formId === batch.formId && learning.formVersion === batch.formVersion
    && learning.sourceType === batch.sourceType
    && validLearningEntitlement(store, learning, options));
}

function validBatchMutationEntitlement(store, batch, learning, { cleanup = false } = {}) {
  if (cleanup) return validBatchEntitlement(store, batch, learning, { cleanup: true, purpose: 'CLEANUP' });
  return validBatchEntitlement(store, batch, learning, { purpose: 'EXISTING_WORK' })
    && (learning?.sourceType !== BATCH_REVIEW_SOURCE_TYPE
      || validBatchEntitlement(store, batch, learning, { purpose: 'NEW_BATCH' }));
}

function retryAvailableAt(now, attemptCount, retryAfterSeconds) {
  const seconds = Number.isSafeInteger(retryAfterSeconds)
    ? Math.min(3_600, Math.max(1, retryAfterSeconds))
    : Math.min(300, 2 ** Math.min(8, Math.max(0, attemptCount - 1)));
  return new Date(new Date(now).getTime() + seconds * 1_000);
}

function transcriptionCleanupInputHash(batchId, assetId, deletionGeneration) {
  return createHash('sha256')
    .update(`amc-transcription-cleanup-v1\u0000${batchId}\u0000${assetId}\u0000${deletionGeneration}`)
    .digest('hex');
}

function consumeMemoryStudentBudget(store, { studentId, budgetKind, units, limit, windowMs, now }) {
  const nowMs = new Date(now).getTime();
  const windowStartedAtMs = Math.floor(nowMs / windowMs) * windowMs;
  const key = `${studentId}\u0000${budgetKind}\u0000${windowStartedAtMs}`;
  const existing = store.studentResourceBudgetWindows.get(key) || {
    studentId, budgetKind, windowStartedAt: new Date(windowStartedAtMs),
    windowMs, usedUnits: 0, updatedAt: now
  };
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStartedAtMs + windowMs - nowMs) / 1_000));
  if (!Number.isSafeInteger(units) || units < 1 || !Number.isSafeInteger(limit) || limit < units
      || existing.usedUnits + units > limit) {
    return { allowed: false, retryAfterSeconds };
  }
  existing.usedUnits += units;
  existing.updatedAt = now;
  store.studentResourceBudgetWindows.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0, usedUnits: existing.usedUnits };
}

function consumeMemoryGlobalBudget(store, { budgetKind, units, limit, windowMs, now }) {
  const nowMs = new Date(now).getTime();
  const windowStartedAtMs = Math.floor(nowMs / windowMs) * windowMs;
  const key = `${budgetKind}\u0000${windowStartedAtMs}`;
  const existing = store.globalResourceBudgetWindows.get(key) || {
    budgetKind, windowStartedAt: new Date(windowStartedAtMs),
    windowMs, usedUnits: 0, updatedAt: now
  };
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStartedAtMs + windowMs - nowMs) / 1_000));
  if (!Number.isSafeInteger(units) || units < 1 || !Number.isSafeInteger(limit) || limit < units
      || existing.usedUnits + units > limit) {
    return { allowed: false, retryAfterSeconds };
  }
  existing.usedUnits += units;
  existing.updatedAt = now;
  store.globalResourceBudgetWindows.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0, usedUnits: existing.usedUnits };
}

function consumeMemoryTutorProviderBudget(store, { studentId, providerBudget, now }) {
  const limits = normalizeTutorProviderBudget(providerBudget);
  const studentCheckpoint = cloneMap(store.studentResourceBudgetWindows);
  const globalCheckpoint = cloneMap(store.globalResourceBudgetWindows);
  const student = consumeMemoryStudentBudget(store, {
    studentId, budgetKind: limits.budgetKind, units: 1,
    limit: limits.studentLimit, windowMs: limits.windowMs, now
  });
  const global = consumeMemoryGlobalBudget(store, {
    budgetKind: limits.budgetKind, units: 1,
    limit: limits.globalLimit, windowMs: limits.windowMs, now
  });
  if (student.allowed && global.allowed) return;
  store.studentResourceBudgetWindows = studentCheckpoint;
  store.globalResourceBudgetWindows = globalCheckpoint;
  throw tutorProviderBudgetError({
    studentAllowed: student.allowed,
    studentRetryAfterSeconds: student.retryAfterSeconds,
    globalRetryAfterSeconds: global.retryAfterSeconds
  });
}

function assertMemoryTutorThreadCapacity(store, {
  studentId, learningSubmissionVersionId, questionNumber
}) {
  const live = [...store.tutorThreads.values()].filter((thread) =>
    thread.studentId === studentId && thread.status !== 'TOMBSTONED');
  assertTutorLiveThreadCapacity({
    studentQuestionCount: live.filter((thread) =>
      thread.learningSubmissionVersionId === learningSubmissionVersionId
        && thread.questionNumber === questionNumber).length,
    studentCount: live.length
  });
}

function transcriptionAggregate(store, workItemId) {
  for (const [batchId, items] of store.learningBatchWorkItems) {
    const work = items.find((item) => item.id === workItemId && item.workType === 'TRANSCRIBE_AUDIO');
    if (!work) continue;
    const batch = store.learningBatches.get(batchId);
    const asset = (store.learningBatchAssets.get(batchId) || [])
      .find((candidate) => candidate.id === work.assetId);
    const artifact = (store.learningBatchProviderArtifacts.get(batchId) || [])
      .find((candidate) => candidate.assetId === work.assetId);
    const learning = batch && [...store.learningSubmissions.values()]
      .find((candidate) => candidate.id === batch.learningSubmissionId);
    return { batch, asset, artifact, learning, work };
  }
  return null;
}

function retentionBindingSource(store, pending) {
  return store.learningBatchProviderOrphanAudit.find((candidate) =>
    candidate.sourceAuditId === pending.id
      && candidate.event === 'PROVIDER_RETENTION_WINDOW_ELAPSED') || pending;
}

function activeRetentionCleanup(store, pending) {
  return [...store.learningBatchProviderOrphanCleanupJobs.values()]
    .find((job) => job.orphanAuditId === pending.id
      && ['QUEUED', 'RUNNING', 'MANUAL_VERIFICATION_REQUIRED'].includes(job.status));
}

function validTranscriptionLeaseFence(aggregate, input, now) {
  return Boolean(aggregate && aggregate.asset && aggregate.artifact
    && aggregate.work.status === 'RUNNING' && aggregate.work.leaseToken === input.leaseToken
    && aggregate.work.deletionGeneration === input.deletionGeneration
    && aggregate.batch.deletionGeneration === input.deletionGeneration
    && new Date(aggregate.work.leaseExpiresAt).getTime() > new Date(now).getTime());
}

function validTranscriptionFence(store, aggregate, input, now) {
  return validTranscriptionLeaseFence(aggregate, input, now)
    && validBatchMutationEntitlement(store, aggregate.batch, aggregate.learning)
    && aggregate.batch.status === 'PROCESSING' && aggregate.batch.deletionState === 'ACTIVE';
}

/**
 * Deterministic test/local adapter. It deliberately implements the same
 * transaction-shaped API as PostgreSQL so service tests exercise locking and
 * immutable submission behavior rather than a different code path.
 */
export class MemoryStore {
  constructor() {
    this.students = new Map();
    this.accessCodes = new Map();
    this.sessions = new Map();
    this.forms = new Map();
    this.attempts = new Map();
    this.answers = new Map();
    this.reasoningNotes = new Map();
    this.submissions = new Map();
    this.submissionAnswers = new Map();
    this.learningSubmissions = new Map();
    this.learningVersions = new Map();
    this.learningResponses = new Map();
    this.learningWorkItems = new Map();
    this.approvedContextSets = new Map();
    this.activeContextSetByForm = new Map();
    this.openReviewReleases = new Map();
    this.openReviewReleaseEvents = [];
    this.analysisRuns = new Map();
    this.questionAnalyses = new Map();
    this.learningReports = new Map();
    this.learningBatches = new Map();
    this.learningBatchAssets = new Map();
    this.learningBatchQuota = new Map();
    this.learningBatchEvidence = new Map();
    this.learningBatchMappings = new Map();
    this.learningBatchWorkItems = new Map();
    this.learningBatchResults = new Map();
    this.learningBatchConfirmations = new Map();
    this.studentResourceBudgetWindows = new Map();
    this.globalResourceBudgetWindows = new Map();
    this.studentProviderDispatchState = new Map();
    this.learningBatchProviderArtifacts = new Map();
    this.learningBatchProviderOrphanAudit = [];
    this.learningBatchProviderOrphanCleanupJobs = new Map();
    this.tutorSnapshots = new Map();
    this.tutorThreads = new Map();
    this.tutorMessages = new Map();
    this.tutorTurnJobs = new Map();
    this.privateStorageCandidates = new Map();
    this.privateStorageReconciliationAudit = [];
    this.events = new Map();
    this.idempotency = new Map();
    this.attemptLocks = new Map();
    this.aiDispatchState = { lastClaimedKind: null, revision: 0 };
    this.globalLock = Promise.resolve();
  }

  async close() {}

  async consumeStudentResourceBudget(input) {
    return this.#withGlobalLock(() => consumeMemoryStudentBudget(this, input));
  }

  async consumeGlobalResourceBudget(input) {
    return this.#withGlobalLock(() => consumeMemoryGlobalBudget(this, input));
  }

  async addStudent({ id = randomUUID(), displayName, createdAt = new Date() }) {
    const student = { id, displayName, createdAt };
    this.students.set(id, clone(student));
    return clone(student);
  }

  async getStudent(id) {
    const student = this.students.get(id);
    return student ? clone(student) : null;
  }

  async putAccessCode({ codeHash, studentId, expiresAt = null, revokedAt = null, createdAt = new Date() }) {
    const record = { codeHash, studentId, expiresAt, revokedAt, createdAt };
    this.accessCodes.set(codeHash, clone(record));
    return clone(record);
  }

  async getAccessCode(codeHash) {
    const record = this.accessCodes.get(codeHash);
    return record ? clone(record) : null;
  }

  async createSession(session) {
    this.sessions.set(session.id, clone(session));
    return clone(session);
  }

  async getSession(id) {
    const session = this.sessions.get(id);
    return session ? clone(session) : null;
  }

  async revokeSession(id, revokedAt = new Date()) {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.revokedAt = revokedAt;
    this.sessions.set(id, clone(session));
    return clone(session);
  }

  async importForm(form, { publish = false, allowTestOnlyPublish = false } = {}) {
    return this.#withGlobalLock(() => this.#importFormUnlocked(form, { publish, allowTestOnlyPublish }));
  }

  /** Import a prevalidated release atomically, matching PostgreSQL's batch transaction. */
  async importForms(forms, { publish = false, allowTestOnlyPublish = false } = {}) {
    return this.#withGlobalLock(async () => {
      const previousForms = new Map([...this.forms].map(([key, value]) => [key, clone(value)]));
      try {
        const stored = [];
        for (const form of forms) {
          stored.push(await this.#importFormUnlocked(form, { publish, allowTestOnlyPublish }));
        }
        return stored;
      } catch (error) {
        this.forms = previousForms;
        throw error;
      }
    });
  }

  async #importFormUnlocked(form, { publish = false, allowTestOnlyPublish = false } = {}) {
    const key = formKey(form.id, form.version);
    const existing = this.forms.get(key);
    if (existing && !existing.contentSealed) {
      throw Object.assign(new Error('Form revision exists only as unsealed staging content.'), {
        code: 'FORM_REVISION_NOT_SEALED'
      });
    }
    if (existing && existing.manifestHash !== form.manifestHash) {
      const error = new Error('A form version cannot be changed after import.');
      error.code = 'FORM_VERSION_IMMUTABLE';
      throw error;
    }
    const shouldPublish = Boolean(publish && (form.publishEligible || (form.developmentPublishEligible && allowTestOnlyPublish)));
    if (shouldPublish && [...this.openReviewReleases.values()].some((release) =>
      (release.formId === form.id && release.formVersion === form.version)
        || release.questionBundleHash === form.questionBundleHash)) {
      throw Object.assign(new Error('Open review delivery fence forbids timed publication.'), {
        code: 'OPEN_REVIEW_DELIVERY_CONFLICT'
      });
    }
    if (shouldPublish) {
      // Only one revision is the student-facing current form. Existing
      // attempts stay pinned to their immutable revision and remain readable
      // through the owner-scoped attempt endpoint.
      for (const [candidateKey, candidate] of this.forms) {
        if (candidate.id === form.id && candidateKey !== key && candidate.published) {
          this.forms.set(candidateKey, { ...candidate, published: false });
        }
      }
    }
    const stored = {
      ...clone(form),
      contentSealed: true,
      declaredQuestionCount: form.questions.length,
      published: Boolean(existing?.published || shouldPublish),
      importedAt: existing?.importedAt || new Date(),
      publishedAt: existing?.publishedAt || (shouldPublish ? new Date() : null)
    };
    this.forms.set(key, stored);
    return clone(stored);
  }

  async getForm(id, version = undefined) {
    if (version !== undefined) {
      const form = this.forms.get(formKey(id, version));
      return form?.contentSealed ? {
        ...clone(form), batchReviewContextReady: this.#batchReviewContextReady(form)
      } : null;
    }
    const candidates = [...this.forms.values()]
      .filter((form) => form.id === id && form.contentSealed);
    candidates.sort((left, right) => {
      if (left.published !== right.published) return left.published ? -1 : 1;
      const rightTime = new Date(right.publishedAt || right.importedAt || 0).getTime();
      const leftTime = new Date(left.publishedAt || left.importedAt || 0).getTime();
      return rightTime - leftTime || String(right.version).localeCompare(String(left.version), undefined, { numeric: true });
    });
    return candidates[0] ? {
      ...clone(candidates[0]), batchReviewContextReady: this.#batchReviewContextReady(candidates[0])
    } : null;
  }

  #batchReviewContextReady(form) {
    return Boolean(this.#completeActiveBatchReviewContext(form));
  }

  #completeActiveBatchReviewContext(form) {
    if (!form?.contentSealed) return null;
    const contextId = this.activeContextSetByForm.get(formKey(form.id, form.version));
    const context = contextId && this.approvedContextSets.get(contextId);
    return isCompleteBatchReviewContext(form, context) ? context : null;
  }

  async listForms({ includeUnpublished = false } = {}) {
    const currentById = new Map();
    for (const form of this.forms.values()) {
      if (!form.contentSealed) continue;
      if (!includeUnpublished && !form.published) continue;
      const current = currentById.get(form.id);
      if (!current
        || (form.published && !current.published)
        || (form.published === current.published
          && new Date(form.publishedAt || form.importedAt || 0) > new Date(current.publishedAt || current.importedAt || 0))) {
        currentById.set(form.id, form);
      }
    }
    return [...currentById.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((form) => ({
        ...clone(form), batchReviewContextReady: this.#batchReviewContextReady(form)
      }));
  }

  async findOrCreateActiveAttempt({ studentId, form, now }) {
    return this.#withGlobalLock(async () => {
      if (!form?.contentSealed) return null;
      if ([...this.openReviewReleases.values()].some((release) =>
        (release.formId === form.id && release.formVersion === form.version)
          || release.questionBundleHash === form.questionBundleHash)) {
        throw Object.assign(new Error('Open review delivery fence forbids timed attempt.'), {
          code: 'OPEN_REVIEW_DELIVERY_CONFLICT'
        });
      }
      const active = [...this.attempts.values()]
        .filter((attempt) => attempt.studentId === studentId && attempt.formId === form.id
          && attempt.attemptMode === ATTEMPT_MODE.TIMED
          && attempt.phase !== 'FINALIZED' && attempt.phase !== 'RESET')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (active) return { attempt: clone(active), created: false };
      const attempt = this.#newAttempt({ studentId, form, now });
      this.attempts.set(attempt.id, clone(attempt));
      this.answers.set(attempt.id, form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null })));
      this.reasoningNotes.set(attempt.id, []);
      this.submissions.set(attempt.id, []);
      this.events.set(attempt.id, [{ type: 'START', occurredAt: now }]);
      return { attempt: clone(attempt), created: true };
    });
  }

  async createResetAttempt({ studentId, form, now }, { alreadyLocked = false } = {}) {
    const create = async () => this.#createResetAttemptUnlocked({ studentId, form, now });
    return alreadyLocked ? create() : this.#withGlobalLock(create);
  }

  async #createResetAttemptUnlocked({ studentId, form, now }) {
    const attempt = this.#newAttempt({ studentId, form, now });
    this.attempts.set(attempt.id, clone(attempt));
    this.answers.set(attempt.id, form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null })));
    this.reasoningNotes.set(attempt.id, []);
    this.submissions.set(attempt.id, []);
    this.events.set(attempt.id, [{ type: 'START', occurredAt: now, metadata: { reset: true } }]);
    return clone(attempt);
  }

  #newAttempt({ studentId, form, now }) {
    return {
      id: randomUUID(),
      studentId,
      attemptMode: ATTEMPT_MODE.TIMED,
      formId: form.id,
      formVersion: form.version,
      durationMs: form.durationMs,
      phase: 'TIMED',
      clockState: 'RUNNING',
      activeElapsedMs: 0,
      clockStartedAt: now,
      answersRevision: 0,
      reasoningRevision: 0,
      stateRevision: 0,
      limitReachedAt: null,
      finalizedAt: null,
      resetAt: null,
      createdAt: now,
      updatedAt: now
    };
  }

  async getAttempt(id) {
    const attempt = this.attempts.get(id);
    return attempt ? clone(attempt) : null;
  }

  async listAttemptsForStudent(studentId) {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.studentId === studentId && attempt.attemptMode === ATTEMPT_MODE.TIMED)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(clone);
  }

  async listDeadlineCandidates(now) {
    const nowMs = new Date(now).getTime();
    return [...this.attempts.values()]
      .filter((attempt) => attempt.attemptMode === ATTEMPT_MODE.TIMED
        && attempt.phase === 'TIMED' && attempt.clockState === 'RUNNING' && attempt.clockStartedAt
        && new Date(attempt.clockStartedAt).getTime() + (attempt.durationMs - attempt.activeElapsedMs) <= nowMs)
      .map((attempt) => attempt.id);
  }

  async publishOpenReviewRelease({
    formId, formVersion, contextSetId, authorityId, reasonCode, now, releaseId = randomUUID()
  }) {
    return this.#withGlobalLock(async () => {
      if (typeof authorityId !== 'string' || authorityId.length < 3 || authorityId.length > 128
          || typeof reasonCode !== 'string' || reasonCode.length < 3 || reasonCode.length > 100) {
        throw Object.assign(new Error('Open review release authority metadata is invalid.'), {
          code: 'OPEN_REVIEW_AUTHORITY_INVALID'
        });
      }
      const form = this.forms.get(formKey(formId, formVersion));
      const context = this.approvedContextSets.get(contextSetId);
      if (!form?.contentSealed) throw Object.assign(new Error('Open review form revision is missing.'), { code: 'FORM_REVISION_NOT_FOUND' });
      if (!context) throw Object.assign(new Error('Approved context set is missing.'), { code: 'OPEN_REVIEW_CONTEXT_INVALID' });
      const exact = [...this.openReviewReleases.values()].find((release) =>
        release.formId === formId && release.formVersion === formVersion);
      if (exact) {
        if (exact.contextSetId !== contextSetId) {
          throw Object.assign(new Error('Exact form revision already has another open review release.'), {
            code: 'OPEN_REVIEW_RELEASE_EXISTS'
          });
        }
        return clone(exact);
      }
      if (form.published || [...this.forms.values()].some((candidate) =>
        candidate.published && candidate.questionBundleHash === form.questionBundleHash)) {
        throw Object.assign(new Error('Published timed question bundle cannot enter open review.'), {
        code: 'OPEN_REVIEW_TIMED_CONFLICT'
      });
      }
      if (!context.sealed || !context.active || context.formId !== formId || context.formVersion !== formVersion
          || context.releaseBinding?.manifestHash !== form.manifestHash
          || context.releaseBinding?.contentHash !== form.contentHash
          || context.releaseBinding?.questionBundleHash !== form.questionBundleHash
          || context.questions.length !== form.questions.length
          || context.questions.some((question) => question.modelEligibleSolutionCount < 2)) {
        throw Object.assign(new Error('Approved context is incomplete or stale for open review.'), {
          code: 'OPEN_REVIEW_CONTEXT_INVALID'
        });
      }
      if ([...this.attempts.values()].some((attempt) => attempt.attemptMode === ATTEMPT_MODE.TIMED
            && this.forms.get(formKey(attempt.formId, attempt.formVersion))?.questionBundleHash === form.questionBundleHash)) {
        throw Object.assign(new Error('The question bundle is already bound to another delivery mode.'), {
          code: 'OPEN_REVIEW_DELIVERY_CONFLICT'
        });
      }
      const release = {
        id: releaseId,
        schemaVersion: 'amc-open-review-release-v1',
        formId,
        formVersion,
        contextSetId,
        releaseHash: openReviewReleaseHash({ form, context }),
        manifestHash: form.manifestHash,
        contentHash: form.contentHash,
        questionBundleHash: form.questionBundleHash,
        contextArtifactSetHash: context.artifactSetHash,
        approvalAuthorityId: context.approvalAuthorityId,
        status: OPEN_REVIEW_STATUS.ACTIVE,
        transitionAuthorityId: authorityId,
        transitionReasonCode: reasonCode,
        publishedAt: now,
        supersededAt: null,
        revokedAt: null,
        stateRevision: 0,
        createdAt: now,
        updatedAt: now
      };
      if ([...this.openReviewReleases.values()].some((candidate) =>
        candidate.questionBundleHash === form.questionBundleHash
          && candidate.status === OPEN_REVIEW_STATUS.ACTIVE)) {
        throw Object.assign(new Error('The question bundle already has an active open review release.'), {
          code: 'OPEN_REVIEW_ACTIVE_CONFLICT'
        });
      }
      this.openReviewReleases.set(release.id, release);
      this.openReviewReleaseEvents.push({
        releaseId: release.id, eventType: 'PUBLISHED', previousStatus: null,
        nextStatus: release.status, authorityId, reasonCode, occurredAt: now
      });
      return clone(release);
    });
  }

  async transitionOpenReviewRelease({ releaseId, nextStatus, authorityId, reasonCode, now }) {
    return this.#withGlobalLock(async () => {
      const release = this.openReviewReleases.get(releaseId);
      if (!release) return null;
      const allowed = (release.status === OPEN_REVIEW_STATUS.ACTIVE
          && [OPEN_REVIEW_STATUS.SUPERSEDED_VALID, OPEN_REVIEW_STATUS.REVOKED].includes(nextStatus))
        || (release.status === OPEN_REVIEW_STATUS.SUPERSEDED_VALID && nextStatus === OPEN_REVIEW_STATUS.REVOKED);
      if (!allowed) throw Object.assign(new Error('Invalid open review release transition.'), {
        code: 'OPEN_REVIEW_TRANSITION_INVALID'
      });
      if (typeof authorityId !== 'string' || authorityId.length < 3 || authorityId.length > 128
          || typeof reasonCode !== 'string' || reasonCode.length < 3 || reasonCode.length > 100
          || new Date(now).getTime() <= new Date(release.updatedAt).getTime()) {
        throw Object.assign(new Error('Open review transition metadata or timing is invalid.'), {
          code: 'OPEN_REVIEW_TRANSITION_INVALID'
        });
      }
      const previousStatus = release.status;
      Object.assign(release, {
        status: nextStatus,
        transitionAuthorityId: authorityId,
        transitionReasonCode: reasonCode,
        supersededAt: nextStatus === OPEN_REVIEW_STATUS.SUPERSEDED_VALID ? now : release.supersededAt,
        revokedAt: nextStatus === OPEN_REVIEW_STATUS.REVOKED ? now : null,
        stateRevision: release.stateRevision + 1,
        updatedAt: now
      });
      this.openReviewReleaseEvents.push({
        releaseId, eventType: nextStatus === OPEN_REVIEW_STATUS.REVOKED ? 'REVOKED' : 'SUPERSEDED',
        previousStatus, nextStatus, authorityId, reasonCode, occurredAt: now
      });
      if (nextStatus === OPEN_REVIEW_STATUS.REVOKED) this.#cancelRevokedOpenReviewWork(releaseId, now);
      return clone(release);
    });
  }

  #cancelRevokedOpenReviewWork(releaseId, now) {
    const submissions = [...this.learningSubmissions.values()]
      .filter((submission) => submission.openReviewReleaseId === releaseId);
    const submissionIds = new Set(submissions.map((submission) => submission.id));
    for (const [versionId, items] of this.learningWorkItems) {
      const version = [...this.learningVersions.values()].flat().find((candidate) => candidate.id === versionId);
      if (!version || !submissionIds.has(version.learningSubmissionId)) continue;
      for (const item of items) {
        if (['QUEUED', 'RUNNING', 'BLOCKED_CONTEXT'].includes(item.status)) Object.assign(item, {
          status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: 'OPEN_REVIEW_REVOKED', updatedAt: now
        });
      }
      const run = this.analysisRuns.get(versionId);
      if (run && ['QUEUED', 'RUNNING'].includes(run.status)) Object.assign(run, {
        status: 'CANCELLED', completedAt: now, lastErrorCode: 'OPEN_REVIEW_REVOKED'
      });
    }
    for (const batch of this.learningBatches.values()) {
      if (!submissionIds.has(batch.learningSubmissionId) || batch.sourceType !== 'OPEN_REVIEW') continue;
      if (['PROCESSING', 'NEEDS_CONFIRMATION'].includes(batch.status)) Object.assign(batch, {
        status: 'FAILED', failureCode: 'OPEN_REVIEW_REVOKED', updatedAt: now
      });
      for (const item of this.learningBatchWorkItems.get(batch.id) || []) {
        if (item.workType === 'BATCH_EXTRACTION' && ['BLOCKED_DEPENDENCY', 'QUEUED', 'RUNNING'].includes(item.status)) {
          Object.assign(item, { status: 'CANCELLED', leaseOwner: null, leaseToken: null,
            leaseExpiresAt: null, lastErrorCode: 'OPEN_REVIEW_REVOKED', updatedAt: now });
          continue;
        }
        if (item.workType !== 'TRANSCRIBE_AUDIO') continue;
        const artifact = (this.learningBatchProviderArtifacts.get(batch.id) || [])
          .find((candidate) => candidate.assetId === item.assetId);
        const asset = (this.learningBatchAssets.get(batch.id) || [])
          .find((candidate) => candidate.id === item.assetId);
        if (!artifact || !asset) continue;
        if (artifact.status === 'ACTIVE') artifact.status = 'DELETE_PENDING';
        if (['UPLOAD_MAY_HAVE_DELIVERED', 'UPLOAD_RESPONSE_PERSISTED'].includes(artifact.status)) {
          artifact.status = 'PROVIDER_RETENTION_PENDING';
        }
        if (['DELETE_PENDING', 'PROVIDER_RETENTION_PENDING'].includes(artifact.status)
            && asset.status === 'STORED') Object.assign(asset, { status: 'PURGE_PENDING', updatedAt: now });
        artifact.updatedAt = now;
        if (['SUBMIT_MAY_HAVE_DELIVERED', 'DELETE_PENDING', 'PROVIDER_RETENTION_PENDING'].includes(artifact.status)) {
          Object.assign(item, { status: 'QUEUED', availableAt: now, leaseOwner: null, leaseToken: null,
            leaseExpiresAt: null, lastErrorCode: 'OPEN_REVIEW_REVOKED_CLEANUP', updatedAt: now });
        } else if (artifact.status === 'INTENT_RECORDED') {
          Object.assign(item, { status: 'CANCELLED', leaseOwner: null, leaseToken: null,
            leaseExpiresAt: null, lastErrorCode: 'OPEN_REVIEW_REVOKED', updatedAt: now });
        }
      }
    }
  }

  async listActiveOpenReviewReleases() {
    return [...this.openReviewReleases.values()]
      .filter((release) => release.status === OPEN_REVIEW_STATUS.ACTIVE)
      .sort((left, right) => left.formId.localeCompare(right.formId))
      .map(clone);
  }

  async getOpenReviewRelease(id) {
    const release = this.openReviewReleases.get(id);
    return release ? clone(release) : null;
  }

  async listOpenReviewWorkspaces(studentId) {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.studentId === studentId && attempt.attemptMode === ATTEMPT_MODE.OPEN_REVIEW)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((attempt) => {
        const learningSubmission = this.learningSubmissions.get(attempt.id);
        const version = (this.learningVersions.get(learningSubmission.id) || [])
          .find((candidate) => candidate.versionNumber === learningSubmission.currentVersion);
        const analysis = (this.learningWorkItems.get(version?.id) || [])
          .find((item) => item.workType === 'ANALYZE_SUBMISSION');
        const release = this.openReviewReleases.get(learningSubmission.openReviewReleaseId);
        return {
          attempt: clone(attempt),
          learningSubmission: clone(learningSubmission),
          releaseStatus: release?.status || null,
          analysisStatus: version?.creationReason === 'OPEN_REVIEW_ANCHOR'
            ? 'AWAITING_BATCH' : (analysis?.status || 'BLOCKED_CONTEXT')
        };
      });
  }

  async listBatchReviewWorkspaces(studentId) {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.studentId === studentId
        && attempt.attemptMode === ATTEMPT_MODE.BATCH_REVIEW)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((attempt) => {
        const learningSubmission = this.learningSubmissions.get(attempt.id);
        const version = (this.learningVersions.get(learningSubmission.id) || [])
          .find((candidate) => candidate.versionNumber === learningSubmission.currentVersion);
        const analysis = (this.learningWorkItems.get(version?.id) || [])
          .find((item) => item.workType === 'ANALYZE_SUBMISSION');
        const activeContextId = this.activeContextSetByForm.get(
          formKey(attempt.formId, attempt.formVersion)
        );
        const activeContext = activeContextId
          ? this.approvedContextSets.get(activeContextId) : null;
        const form = this.forms.get(formKey(attempt.formId, attempt.formVersion));
        const contextReady = form?.contentSealed
          ? isCompleteBatchReviewContext(form, activeContext) : false;
        return {
          attempt: clone(attempt),
          learningSubmission: clone(learningSubmission),
          analysisStatus: version?.creationReason === BATCH_REVIEW_ANCHOR_REASON
            ? 'AWAITING_BATCH' : (analysis?.status || 'BLOCKED_CONTEXT'),
          analysisContextStatus: contextReady ? 'READY' : 'UNAVAILABLE'
        };
      });
  }

  async listLearningHistoryRecords(studentId, { limit, cursor = null }) {
    const records = [];
    for (const submission of this.learningSubmissions.values()) {
      if (submission.studentId !== studentId) continue;
      const attempt = this.attempts.get(submission.attemptId);
      const form = this.forms.get(formKey(submission.formId, submission.formVersion));
      if (!attempt || !form?.contentSealed) continue;
      const versions = [...(this.learningVersions.get(submission.id) || [])]
        .sort((left, right) => left.versionNumber - right.versionNumber);
      const currentVersion = versions.find((item) => item.versionNumber === submission.currentVersion);
      if (!currentVersion) continue;
      const workItem = (this.learningWorkItems.get(currentVersion.id) || [])
        .find((item) => item.workType === 'ANALYZE_SUBMISSION') || null;
      const report = this.learningReports.get(currentVersion.id) || null;
      const release = submission.openReviewReleaseId
        ? this.openReviewReleases.get(submission.openReviewReleaseId) || null : null;
      const versionRecords = versions.map((version) => {
        const batch = version.batchId ? this.learningBatches.get(version.batchId) || null : null;
        const batchResult = version.batchId ? this.learningBatchResults.get(version.batchId) || null : null;
        const officialItems = !version.batchId && submission.sourceType === 'INTERACTIVE_FINAL'
          && submission.officialSubmissionId
          ? this.submissionAnswers.get(submission.officialSubmissionId) || [] : [];
        return {
          version: clone(version),
          responses: clone(this.learningResponses.get(version.id) || []),
          workItems: clone(this.learningWorkItems.get(version.id) || []),
          resultItems: clone(batchResult?.items || officialItems),
          report: clone(this.learningReports.get(version.id) || null),
          batch: clone(batch)
        };
      });
      const activityCandidates = [submission.updatedAt, ...versions.map((item) => item.createdAt)];
      for (const version of versions) {
        activityCandidates.push(...(this.learningWorkItems.get(version.id) || []).map((item) => item.updatedAt));
        const candidateReport = this.learningReports.get(version.id);
        if (candidateReport) activityCandidates.push(candidateReport.generatedAt);
        const batch = version.batchId ? this.learningBatches.get(version.batchId) : null;
        if (batch) activityCandidates.push(batch.updatedAt);
      }
      const activityAt = activityCandidates.filter(Boolean)
        .sort((left, right) => new Date(right) - new Date(left))[0];
      records.push({ submission: clone(submission), attempt: clone(attempt),
        form: { id: form.id, version: form.version, title: form.title },
        release: clone(release), currentVersion: clone(currentVersion),
        workItem: clone(workItem), report: clone(report), activityAt,
        paginationAt: submission.updatedAt, versions: versionRecords });
    }
    records.sort((left, right) => {
      const time = new Date(right.paginationAt) - new Date(left.paginationAt);
      return time || right.submission.id.localeCompare(left.submission.id);
    });
    const filtered = cursor ? records.filter((item) => {
      const time = new Date(item.paginationAt).getTime();
      const cursorTime = new Date(cursor.updatedAt).getTime();
      return time < cursorTime || (time === cursorTime && item.submission.id < cursor.submissionId);
    }) : records;
    return filtered.slice(0, limit + 1);
  }

  async getLearningHistoryRecord(studentId, submissionId) {
    const submission = [...this.learningSubmissions.values()]
      .find((item) => item.id === submissionId && item.studentId === studentId);
    if (!submission) return null;
    const attempt = this.attempts.get(submission.attemptId);
    const form = this.forms.get(formKey(submission.formId, submission.formVersion));
    if (!attempt || !form) return null;
    const release = submission.openReviewReleaseId
      ? this.openReviewReleases.get(submission.openReviewReleaseId) || null : null;
    const versions = [...(this.learningVersions.get(submission.id) || [])]
      .sort((left, right) => left.versionNumber - right.versionNumber)
      .map((version) => {
        const analysisRun = this.analysisRuns.get(version.id) || null;
        const batchResult = version.batchId ? this.learningBatchResults.get(version.batchId) || null : null;
        const officialItems = !version.batchId && submission.sourceType === 'INTERACTIVE_FINAL'
          && submission.officialSubmissionId
          ? this.submissionAnswers.get(submission.officialSubmissionId) || [] : [];
        return {
          version: clone(version),
          responses: clone(this.learningResponses.get(version.id) || []),
          workItems: clone(this.learningWorkItems.get(version.id) || []),
          analysisRun: clone(analysisRun),
          analyses: clone(analysisRun ? this.questionAnalyses.get(analysisRun.id) || [] : []),
          resultItems: clone(batchResult?.items || officialItems),
          report: clone(this.learningReports.get(version.id) || null),
          batch: clone(version.batchId ? this.learningBatches.get(version.batchId) || null : null)
        };
      });
    return { submission: clone(submission), attempt: clone(attempt), form: clone(form),
      release: clone(release), versions };
  }

  async findOrCreateOpenReviewWorkspace({ studentId, releaseId, idempotencyKey: key, requestHash, now }) {
    return this.#withGlobalLock(async () => {
      const release = this.openReviewReleases.get(releaseId);
      if (!release) return null;
      const scope = `open-review-release:${releaseId}:workspace`;
      const storedIdempotency = this.idempotency.get(idempotencyKey(studentId, scope, key));
      if (storedIdempotency) {
        if (storedIdempotency.requestHash !== requestHash) {
          throw Object.assign(new Error('Idempotency key was reused.'), { code: 'IDEMPOTENCY_KEY_REUSED' });
        }
        const attempt = this.attempts.get(storedIdempotency.responseBody.attemptId);
        return { attempt: clone(attempt), learningSubmission: clone(this.learningSubmissions.get(attempt.id)), created: false };
      }
      if (release.status !== OPEN_REVIEW_STATUS.ACTIVE) return null;
      let attempt = [...this.attempts.values()].find((candidate) => candidate.studentId === studentId
        && candidate.formId === release.formId && candidate.formVersion === release.formVersion
        && candidate.attemptMode === ATTEMPT_MODE.OPEN_REVIEW);
      let learningSubmission = attempt && this.learningSubmissions.get(attempt.id);
      const created = !attempt;
      if (!attempt) {
        const form = this.forms.get(formKey(release.formId, release.formVersion));
        const context = this.approvedContextSets.get(release.contextSetId);
        attempt = {
          id: randomUUID(), studentId, attemptMode: ATTEMPT_MODE.OPEN_REVIEW,
          formId: release.formId, formVersion: release.formVersion, durationMs: form.durationMs,
          phase: 'OPEN_REVIEW', clockState: 'PAUSED', activeElapsedMs: 0, clockStartedAt: null,
          answersRevision: 0, reasoningRevision: 0, stateRevision: 0,
          limitReachedAt: null, finalizedAt: null, resetAt: null, createdAt: now, updatedAt: now
        };
        const version = {
          id: randomUUID(), learningSubmissionId: randomUUID(), versionNumber: 1,
          formId: release.formId, formVersion: release.formVersion,
          answersRevision: 0, reasoningRevision: 0, creationReason: 'OPEN_REVIEW_ANCHOR', batchId: null,
          contextStatus: 'CONTEXT_READY', contextSetId: context.id,
          evidenceHash: canonicalHash({ schema: 'amc-open-review-anchor-v1', releaseHash: release.releaseHash, studentId }),
          createdAt: now
        };
        learningSubmission = {
          id: version.learningSubmissionId, studentId, attemptId: attempt.id,
          officialSubmissionId: null, officialSubmissionKind: null,
          openReviewReleaseId: release.id, attemptMode: ATTEMPT_MODE.OPEN_REVIEW,
          formId: release.formId, formVersion: release.formVersion, sourceType: 'OPEN_REVIEW',
          lifecycleStatus: 'COMMITTED', currentVersion: 1, deletionGeneration: 0,
          deletedAt: null, createdAt: now, updatedAt: now
        };
        this.attempts.set(attempt.id, attempt);
        this.answers.set(attempt.id, []);
        this.reasoningNotes.set(attempt.id, []);
        this.submissions.set(attempt.id, []);
        this.events.set(attempt.id, []);
        this.learningSubmissions.set(attempt.id, learningSubmission);
        this.learningVersions.set(learningSubmission.id, [version]);
        this.learningResponses.set(version.id, form.questions.map((question) => ({
          learningSubmissionVersionId: version.id, formId: release.formId, formVersion: release.formVersion,
          questionNumber: question.number, selectedOption: null, answerOrigin: 'OPEN_REVIEW_BLANK',
          reasoningText: '', reasoningOrigin: 'NONE', createdAt: now
        })));
        this.learningWorkItems.set(version.id, []);
      }
      const record = {
        studentId, scope, key, requestHash, responseStatus: created ? 201 : 200,
        responseBody: { attemptId: attempt.id }, createdAt: now
      };
      this.idempotency.set(idempotencyKey(studentId, scope, key), record);
      return { attempt: clone(attempt), learningSubmission: clone(learningSubmission), created };
    });
  }

  async findOrCreateBatchReviewWorkspace({
    studentId, formId, formVersion, idempotencyKey: key, requestHash, now
  }) {
    return this.#withGlobalLock(async () => {
      const scope = `batch-review-form:${formId}:${formVersion}:workspace`;
      const storedIdempotency = this.idempotency.get(idempotencyKey(studentId, scope, key));
      if (storedIdempotency) {
        if (storedIdempotency.requestHash !== requestHash) {
          throw Object.assign(new Error('Idempotency key was reused.'), { code: 'IDEMPOTENCY_KEY_REUSED' });
        }
        const attempt = this.attempts.get(storedIdempotency.responseBody.attemptId);
        const learningSubmission = attempt && this.learningSubmissions.get(attempt.id);
        if (!attempt || !learningSubmission || attempt.studentId !== studentId
            || attempt.formId !== formId || attempt.formVersion !== formVersion
            || attempt.attemptMode !== ATTEMPT_MODE.BATCH_REVIEW
            || attempt.phase !== BATCH_REVIEW_PHASE
            || learningSubmission.studentId !== studentId
            || learningSubmission.attemptId !== attempt.id
            || learningSubmission.formId !== formId
            || learningSubmission.formVersion !== formVersion
            || learningSubmission.attemptMode !== ATTEMPT_MODE.BATCH_REVIEW
            || learningSubmission.sourceType !== BATCH_REVIEW_SOURCE_TYPE
            || learningSubmission.lifecycleStatus !== 'COMMITTED'
            || learningSubmission.officialSubmissionId !== null
            || learningSubmission.officialSubmissionKind !== null
            || learningSubmission.openReviewReleaseId !== null) {
          throw new Error('Batch review idempotency record lost its aggregate.');
        }
        return { attempt: clone(attempt), learningSubmission: clone(learningSubmission), created: false };
      }
      const form = this.forms.get(formKey(formId, formVersion));
      if (!form?.contentSealed || form.published !== true) return null;
      const readyContext = this.#completeActiveBatchReviewContext(form);
      if (!readyContext) {
        throw Object.assign(new Error('Batch review requires a complete active approved context.'), {
          code: 'BATCH_REVIEW_CONTEXT_NOT_READY'
        });
      }
      let attempt = [...this.attempts.values()].find((candidate) => candidate.studentId === studentId
        && candidate.formId === formId && candidate.formVersion === formVersion
        && candidate.attemptMode === ATTEMPT_MODE.BATCH_REVIEW);
      let learningSubmission = attempt && this.learningSubmissions.get(attempt.id);
      const created = !attempt;
      if (!attempt) {
        attempt = {
          id: randomUUID(), studentId, attemptMode: ATTEMPT_MODE.BATCH_REVIEW,
          formId, formVersion, durationMs: form.durationMs,
          phase: BATCH_REVIEW_PHASE, clockState: 'PAUSED', activeElapsedMs: 0,
          clockStartedAt: null, answersRevision: 0, reasoningRevision: 0, stateRevision: 0,
          limitReachedAt: null, finalizedAt: null, resetAt: null, createdAt: now, updatedAt: now
        };
        const version = {
          id: randomUUID(), learningSubmissionId: randomUUID(), versionNumber: 1,
          formId, formVersion, answersRevision: 0, reasoningRevision: 0,
          creationReason: BATCH_REVIEW_ANCHOR_REASON, batchId: null,
          contextStatus: 'CONTEXT_READY', contextSetId: readyContext.id,
          evidenceHash: batchReviewAnchorHash({ studentId, form, context: readyContext }),
          createdAt: now
        };
        learningSubmission = {
          id: version.learningSubmissionId, studentId, attemptId: attempt.id,
          officialSubmissionId: null, officialSubmissionKind: null, openReviewReleaseId: null,
          attemptMode: ATTEMPT_MODE.BATCH_REVIEW, formId, formVersion,
          sourceType: BATCH_REVIEW_SOURCE_TYPE,
          lifecycleStatus: 'COMMITTED', currentVersion: 1, deletionGeneration: 0,
          deletedAt: null, createdAt: now, updatedAt: now
        };
        this.attempts.set(attempt.id, attempt);
        this.answers.set(attempt.id, []);
        this.reasoningNotes.set(attempt.id, []);
        this.submissions.set(attempt.id, []);
        this.events.set(attempt.id, []);
        this.learningSubmissions.set(attempt.id, learningSubmission);
        this.learningVersions.set(learningSubmission.id, [version]);
        this.learningResponses.set(version.id, form.questions.map((question) => ({
          learningSubmissionVersionId: version.id, formId, formVersion,
          questionNumber: question.number, selectedOption: null,
          answerOrigin: BATCH_REVIEW_BLANK_ORIGIN,
          reasoningText: '', reasoningOrigin: 'NONE', createdAt: now
        })));
        this.learningWorkItems.set(version.id, []);
      }
      if (!learningSubmission || attempt.studentId !== studentId
          || attempt.formId !== formId || attempt.formVersion !== formVersion
          || attempt.attemptMode !== ATTEMPT_MODE.BATCH_REVIEW
          || attempt.phase !== BATCH_REVIEW_PHASE
          || learningSubmission.studentId !== studentId
          || learningSubmission.attemptId !== attempt.id
          || learningSubmission.formId !== formId
          || learningSubmission.formVersion !== formVersion
          || learningSubmission.attemptMode !== ATTEMPT_MODE.BATCH_REVIEW
          || learningSubmission.sourceType !== BATCH_REVIEW_SOURCE_TYPE
          || learningSubmission.lifecycleStatus !== 'COMMITTED'
          || learningSubmission.officialSubmissionId !== null
          || learningSubmission.officialSubmissionKind !== null
          || learningSubmission.openReviewReleaseId !== null) {
        throw new Error('Batch review workspace lost its learning anchor.');
      }
      this.idempotency.set(idempotencyKey(studentId, scope, key), {
        studentId, scope, key, requestHash, responseStatus: created ? 201 : 200,
        responseBody: { attemptId: attempt.id }, createdAt: now
      });
      return { attempt: clone(attempt), learningSubmission: clone(learningSubmission), created };
    });
  }

  async importApprovedContextSets({ forms, archiveSetHash, authorityId, receiptSetHash, importedAt }) {
    return this.#withGlobalLock(async () => {
      const checkpoint = this.#transactionCheckpoint();
      try {
        const imported = [];
        for (const artifact of forms) {
          const binding = artifact.formBinding;
          const storedForm = this.forms.get(formKey(binding.id, binding.version));
          if (!storedForm?.contentSealed) throw Object.assign(new Error('Approved context form revision is not imported.'), { code: 'FORM_REVISION_NOT_FOUND' });
          const release = binding.releaseBinding;
          if (!release || release.questionBundleHash !== storedForm.questionBundleHash
              || release.contentHash !== storedForm.contentHash || release.manifestHash !== storedForm.manifestHash) {
            throw Object.assign(new Error('Approved context release hashes do not match the immutable form revision.'), { code: 'CONTEXT_RELEASE_MISMATCH' });
          }
          if (storedForm.questions.length !== artifact.questions.length) {
            throw Object.assign(new Error('Approved context question count mismatch.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
          }
          for (const question of artifact.questions) {
            const storedQuestion = storedForm.questions.find((item) => item.number === question.number);
            if (!storedQuestion) {
              throw Object.assign(new Error('Approved context question does not exist in the form revision.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
            }
            const choices = Object.fromEntries(storedQuestion.choices.map((choice) => [choice.option, choice.textMarkdown]));
            if (storedQuestion.promptMarkdown !== question.promptMarkdown
                || canonicalJson(choices) !== canonicalJson(question.choices)) {
              throw Object.assign(new Error('Approved context prompt/choices do not match the form revision.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
            }
          }
          const existing = [...this.approvedContextSets.values()].find((item) => item.artifactSetHash === artifact.setHash);
          if (existing) {
            if (!existing.sealed) {
              throw Object.assign(new Error('Approved context artifact exists only as an unsealed staging row.'), {
                code: 'CONTEXT_NOT_SEALED'
              });
            }
            if ((archiveSetHash || null) !== existing.archiveWrapperSetHash) {
              throw Object.assign(new Error('Approved context artifact is already bound to a different archive wrapper.'), {
                code: 'CONTEXT_ARCHIVE_LINEAGE_CONFLICT'
              });
            }
            imported.push(clone(existing));
            if (existing.active && existing.questions.length) {
              this.#repairBlockedForContext(existing, importedAt);
            }
            continue;
          }
          const currentId = this.activeContextSetByForm.get(formKey(binding.id, binding.version));
          if (currentId) {
            const current = this.approvedContextSets.get(currentId);
            current.active = false;
            current.supersededAt = importedAt;
          }
          const contextSet = {
            id: randomUUID(),
            schemaVersion: artifact.schemaVersion,
            artifactSetHash: artifact.setHash,
            archiveWrapperSetHash: archiveSetHash,
            candidateSchemaVersion: binding.candidateSchemaVersion,
            candidateSetHash: binding.candidateSetHash,
            decisionSetHash: artifact.reviewDecisionBinding.decisionSetHash,
            approvalPolicyVersion: artifact.approvalPolicyVersion,
            reviewSchemaVersion: artifact.reviewDecisionBinding.schemaVersion,
            reviewGovernance: clone(artifact.reviewGovernance || null),
            sealed: true,
            approvalAuthorityId: authorityId,
            approvalReceiptSetHash: receiptSetHash,
            formId: binding.id,
            formVersion: binding.version,
            contextContentHash: binding.contextContentHash,
            releaseBinding: clone(release),
            active: true,
            importedAt,
            supersededAt: null,
            questions: artifact.questions.filter((question) => question.contextReady
                && question.approvedSolutions.filter((solution) => solution.modelEligibility.eligible).length >= 2)
              .map((question) => ({
                questionNumber: question.number,
                questionContentHash: question.questionContentHash,
                promptMarkdown: question.promptMarkdown,
                choices: clone(question.choices),
                visualContext: clone(question.visualContext),
                modelEligibleSolutionCount: question.availability.modelEligibleSolutionCount,
                solutions: question.approvedSolutions.map((solution, index) => ({
                  solutionPosition: index + 1,
                  artifactSolutionId: solution.solutionId,
                  title: solution.title,
                  bodyMarkdown: solution.bodyMarkdown,
                  bodySha256: solution.bodySha256,
                  sourceRef: clone(solution.sourceRef),
                  reviewerId: solution.approval.reviewerId,
                  reviewedAt: solution.approval.reviewedAt,
                  rightsStatus: solution.approval.rightsStatus,
                  qualityFlags: clone(solution.approval.qualityFlags),
                  methodTags: clone(solution.approval.methodTags),
                  modelEligibility: clone(solution.modelEligibility),
                  decisionRecordHash: solution.approval.decisionRecordHash,
                  candidateProvenance: clone(solution.candidateProvenance || null),
                  reviewMethod: solution.approval.reviewMethod || null,
                  reviewModel: clone(solution.approval.reviewModel || null),
                  operatorAuthorizationId: solution.approval.operatorAuthorizationId || null,
                  authorityReceipt: clone(solution.approval.authorityReceipt)
                }))
              }))
          };
          contextSet.declaredQuestionCount = contextSet.questions.length;
          this.approvedContextSets.set(contextSet.id, clone(contextSet));
          this.activeContextSetByForm.set(formKey(binding.id, binding.version), contextSet.id);
          imported.push(clone(contextSet));
          if (contextSet.questions.length) this.#repairBlockedForContext(contextSet, importedAt);
        }
        return imported;
      } catch (error) {
        this.#restoreTransactionCheckpoint(checkpoint);
        throw error;
      }
    });
  }

  #repairBlockedForContext(contextSet, now) {
    if (!contextSet.sealed) return;
    const form = this.forms.get(formKey(contextSet.formId, contextSet.formVersion));
    const batchContextReady = isCompleteBatchReviewContext(form, contextSet);
    for (const submission of this.learningSubmissions.values()) {
      if (submission.formId !== contextSet.formId || submission.formVersion !== contextSet.formVersion
          || submission.lifecycleStatus !== 'COMMITTED') continue;
      if (submission.sourceType === BATCH_REVIEW_SOURCE_TYPE && !batchContextReady) continue;
      for (const version of this.learningVersions.get(submission.id) || []) {
        if (version.contextStatus !== 'CONTEXT_UNAVAILABLE' || this.analysisRuns.has(version.id)) continue;
        const workItem = (this.learningWorkItems.get(version.id) || [])
          .find((item) => item.workType === 'ANALYZE_SUBMISSION' && item.status === 'BLOCKED_CONTEXT');
        if (!workItem) continue;
        const inputHash = analysisInputHash(version.evidenceHash, contextSet.artifactSetHash);
        const run = {
          id: randomUUID(), learningSubmissionVersionId: version.id, contextSetId: contextSet.id,
          versionNumber: version.versionNumber, inputHash, evidenceHash: version.evidenceHash,
          deletionGeneration: workItem.deletionGeneration, status: 'QUEUED', createdAt: now,
          analysisContractVersion: ANALYSIS_CONTRACT_VERSION,
          startedAt: null, completedAt: null, lastErrorCode: null
        };
        version.contextStatus = 'CONTEXT_READY';
        version.contextSetId = contextSet.id;
        Object.assign(workItem, {
          status: 'QUEUED', inputHash, analysisRunId: run.id, availableAt: now,
          leaseOwner: null, leaseToken: null, leaseExpiresAt: null, lastErrorCode: null, updatedAt: now
        });
        this.analysisRuns.set(version.id, clone(run));
      }
    }
  }

  async claimLearningAnalysisWork({ workerId, now, leaseMs }) {
    const claimed = await this.claimNextAiWork({
      workerId, now, leaseMs, acceptedKinds: ['INTERACTIVE_ANALYSIS']
    });
    return claimed?.job || null;
  }

  async claimNextAiWork({
    workerId, now, leaseMs, acceptedKinds = ['INTERACTIVE_ANALYSIS', 'BATCH_EXTRACTION'], maxBatchConcurrent = 1
  }) {
    return this.#withGlobalLock(async () => {
      const accepted = new Set(acceptedKinds);
      const nowMs = new Date(now).getTime();
      for (const items of this.learningWorkItems.values()) {
        for (const item of items) {
          if (item.status === 'RUNNING' && new Date(item.leaseExpiresAt).getTime() <= nowMs) {
            Object.assign(item, {
              status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
              availableAt: now, updatedAt: now
            });
            const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === item.analysisRunId);
            if (run) Object.assign(run, { status: 'QUEUED', startedAt: null, lastErrorCode: 'LEASE_EXPIRED' });
          }
        }
      }
      for (const items of this.learningBatchWorkItems.values()) {
        for (const item of items) {
          if (item.workType === 'BATCH_EXTRACTION' && item.status === 'RUNNING'
              && new Date(item.leaseExpiresAt).getTime() <= nowMs) {
            Object.assign(item, {
              status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
              availableAt: now, lastErrorCode: 'LEASE_EXPIRED', updatedAt: now
            });
          }
        }
      }
      const candidates = [];
      if (accepted.has('INTERACTIVE_ANALYSIS')) {
        for (const item of [...this.learningWorkItems.values()].flat()) {
          const run = [...this.analysisRuns.values()]
            .find((candidate) => candidate.id === item.analysisRunId);
          if (item.status === 'QUEUED' && new Date(item.availableAt).getTime() <= nowMs
              && run?.analysisContractVersion === ANALYSIS_CONTRACT_VERSION) {
            candidates.push({ kind: 'INTERACTIVE_ANALYSIS', item });
          }
        }
      }
      const runningBatchCount = [...this.learningBatchWorkItems.values()].flat()
        .filter((item) => item.workType === 'BATCH_EXTRACTION' && item.status === 'RUNNING').length;
      if (accepted.has('BATCH_EXTRACTION') && runningBatchCount < maxBatchConcurrent) {
        for (const item of [...this.learningBatchWorkItems.values()].flat()) {
          if (item.workType === 'BATCH_EXTRACTION' && item.status === 'QUEUED'
              && new Date(item.availableAt).getTime() <= nowMs) {
            candidates.push({ kind: 'BATCH_EXTRACTION', item });
          }
        }
      }
      const candidateKinds = new Set(candidates.map((candidate) => candidate.kind));
      const rotateKinds = candidateKinds.size > 1;
      candidates.sort((left, right) => {
        if (rotateKinds && left.kind !== right.kind) {
          const preferredKind = this.aiDispatchState.lastClaimedKind === 'INTERACTIVE_ANALYSIS'
            ? 'BATCH_EXTRACTION' : 'INTERACTIVE_ANALYSIS';
          return left.kind === preferredKind ? -1 : 1;
        }
        return compareAiWorkWithinKind(left.item, right.item, now);
      });
      for (const candidate of candidates) {
        const item = candidate.item;
        if (candidate.kind === 'BATCH_EXTRACTION') {
          const batch = this.learningBatches.get(item.batchId);
          const assets = this.learningBatchAssets.get(item.batchId) || [];
          const evidence = this.learningBatchEvidence.get(item.batchId) || [];
          const learning = batch && [...this.learningSubmissions.values()]
            .find((submission) => submission.id === batch.learningSubmissionId);
          if (!validBatchMutationEntitlement(this, batch, learning)
              || batch.status !== 'PROCESSING' || batch.deletionState !== 'ACTIVE'
              || batch.deletionGeneration !== item.deletionGeneration
              || learning.currentVersion !== batch.baseVersion
              || assets.length !== evidence.length || evidence.some((value) => value.normalizedText === null)) {
            Object.assign(item, {
              status: 'CANCELLED', lastErrorCode: 'STALE_WORK', updatedAt: now,
              leaseOwner: null, leaseToken: null, leaseExpiresAt: null
            });
            continue;
          }
          Object.assign(item, {
            status: 'RUNNING', attemptCount: item.attemptCount + 1, leaseOwner: workerId,
            leaseToken: randomUUID(), leaseExpiresAt: new Date(nowMs + leaseMs), updatedAt: now
          });
          this.aiDispatchState = {
            lastClaimedKind: 'BATCH_EXTRACTION', revision: this.aiDispatchState.revision + 1
          };
          return clone({
            kind: 'BATCH_EXTRACTION',
            job: { workItem: item, batch, assets, evidence, studentId: batch.studentId, attemptId: batch.attemptId }
          });
        }
        const version = [...this.learningVersions.values()].flat()
          .find((value) => value.id === item.learningSubmissionVersionId);
        const submission = version && [...this.learningSubmissions.values()]
          .find((value) => value.id === version.learningSubmissionId);
        const attempt = submission && this.attempts.get(submission.attemptId);
        const run = version && this.analysisRuns.get(version.id);
        const contextSet = version && this.approvedContextSets.get(version.contextSetId);
        if (!version || !submission || !attempt || !run || !contextSet
            || !validLearningEntitlement(this, submission)
            || version.contextStatus !== 'CONTEXT_READY' || version.contextSetId !== run.contextSetId
            || run.analysisContractVersion !== ANALYSIS_CONTRACT_VERSION
            || run.status !== 'QUEUED' || item.analysisRunId !== run.id
            || item.inputHash !== run.inputHash || item.deletionGeneration !== run.deletionGeneration) {
          Object.assign(item, {
            status: 'CANCELLED', lastErrorCode: 'STALE_WORK', updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
          if (run) Object.assign(run, { status: 'CANCELLED', lastErrorCode: 'STALE_WORK', completedAt: now });
          continue;
        }
        Object.assign(item, {
          status: 'RUNNING', attemptCount: item.attemptCount + 1, leaseOwner: workerId,
          leaseToken: randomUUID(), leaseExpiresAt: new Date(nowMs + leaseMs), updatedAt: now
        });
        Object.assign(run, { status: 'RUNNING', startedAt: run.startedAt || now, lastErrorCode: null });
        this.aiDispatchState = {
          lastClaimedKind: 'INTERACTIVE_ANALYSIS', revision: this.aiDispatchState.revision + 1
        };
        const responses = this.learningResponses.get(version.id) || [];
        const contexts = new Map(contextSet.questions.map((question) => [question.questionNumber, question]));
        return clone({
          kind: 'INTERACTIVE_ANALYSIS',
          job: {
            workItem: item, run, version, submission,
            questions: responses.map((response) => {
              const scoring = analysisScoringSnapshot(this, submission, version, response);
              return {
                ...response,
                scoring,
                scoringSnapshotValid: isValidAnalysisScoringSnapshot(scoring, response.selectedOption),
                context: contexts.get(response.questionNumber) || null
              };
            })
          }
        });
      }
      return null;
    });
  }

  async claimNextTranscriptionWork({ workerId, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const nowMs = new Date(now).getTime();
      for (const items of this.learningBatchWorkItems.values()) {
        for (const work of items) {
          if (work.workType === 'TRANSCRIBE_AUDIO' && work.status === 'RUNNING'
              && new Date(work.leaseExpiresAt).getTime() <= nowMs) {
            Object.assign(work, {
              status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
              availableAt: now, lastErrorCode: 'LEASE_EXPIRED', updatedAt: now
            });
          }
        }
      }
      const candidates = [...this.learningBatchWorkItems.values()].flat()
        .filter((work) => work.workType === 'TRANSCRIBE_AUDIO' && work.status === 'QUEUED'
          && new Date(work.availableAt).getTime() <= nowMs)
        .sort((left, right) => {
          const leftAggregate = transcriptionAggregate(this, left.id);
          const rightAggregate = transcriptionAggregate(this, right.id);
          const leftClaims = this.studentProviderDispatchState.get(leftAggregate?.batch?.studentId)
            ?.transcriptionClaimCount || 0;
          const rightClaims = this.studentProviderDispatchState.get(rightAggregate?.batch?.studentId)
            ?.transcriptionClaimCount || 0;
          return right.priority - left.priority || leftClaims - rightClaims
          || new Date(left.availableAt) - new Date(right.availableAt)
          || new Date(left.createdAt) - new Date(right.createdAt)
          || left.id.localeCompare(right.id);
        });
      for (const work of candidates) {
        const aggregate = transcriptionAggregate(this, work.id);
        const cleanup = aggregate?.batch?.deletionState !== 'ACTIVE'
          || aggregate?.batch?.status === 'FAILED'
          || ['SUBMIT_MAY_HAVE_DELIVERED', 'DELETE_PENDING', 'DELETION_EVIDENCED', 'PROVIDER_RETENTION_PENDING',
            'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(aggregate?.artifact?.status);
        if (!aggregate || !validBatchMutationEntitlement(
          this, aggregate.batch, aggregate.learning, { cleanup }
        )
            || (!cleanup && (aggregate.batch.status !== 'PROCESSING' || aggregate.batch.deletionState !== 'ACTIVE'))
            || (!cleanup && aggregate.learning.currentVersion !== aggregate.batch.baseVersion)
            || aggregate.batch.deletionGeneration !== work.deletionGeneration
            || !['STORED', 'PURGE_PENDING', 'PURGED'].includes(aggregate.asset?.status)
            || !aggregate.artifact) {
          Object.assign(work, {
            status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: 'STALE_WORK', updatedAt: now
          });
          continue;
        }
        let phase;
        if (aggregate.artifact.status === 'INTENT_RECORDED') phase = 'upload';
        else if (['UPLOAD_MAY_HAVE_DELIVERED', 'UPLOAD_RESPONSE_PERSISTED'].includes(aggregate.artifact.status)) {
          phase = 'await_upload_retention';
        }
        else if (aggregate.artifact.status === 'SUBMIT_MAY_HAVE_DELIVERED') phase = 'reconcile';
        else if (aggregate.artifact.status === 'ACTIVE') phase = 'poll';
        else if (aggregate.artifact.status === 'DELETE_PENDING') phase = 'delete';
        else if (['DELETION_EVIDENCED', 'PROVIDER_RETENTION_PENDING',
          'PROVIDER_RETENTION_DELETION_CONFIRMED']
          .includes(aggregate.artifact.status)
            && aggregate.asset.status === 'PURGE_PENDING') phase = 'purge_resolved_orphan';
        else {
          Object.assign(work, {
            status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: 'STALE_WORK', updatedAt: now
          });
          continue;
        }
        const leaseToken = randomUUID();
        Object.assign(work, {
          status: 'RUNNING', attemptCount: work.attemptCount + 1, leaseOwner: workerId,
          leaseToken, leaseExpiresAt: new Date(nowMs + leaseMs), updatedAt: now
        });
        const dispatch = this.studentProviderDispatchState.get(aggregate.batch.studentId) || {
          studentId: aggregate.batch.studentId, transcriptionClaimCount: 0, updatedAt: now
        };
        dispatch.transcriptionClaimCount += 1;
        dispatch.updatedAt = now;
        this.studentProviderDispatchState.set(aggregate.batch.studentId, dispatch);
        return clone({
          phase,
          workItemId: work.id,
          attemptCount: work.attemptCount,
          workCreatedAt: work.createdAt,
          leaseToken,
          deletionGeneration: work.deletionGeneration,
          assetId: aggregate.asset.id,
          assetStorageKey: aggregate.asset.storageKey,
          localPurgePending: aggregate.asset.status === 'PURGE_PENDING',
          providerTranscriptId: aggregate.artifact.externalId,
          providerTranscriptPersistedAt: aggregate.artifact.submittedAt
            ? new Date(aggregate.artifact.submittedAt).toISOString() : null,
          uploadCallId: aggregate.artifact.uploadCallId || null,
          uploadUrlSha256: aggregate.artifact.uploadUrlHash || null,
          providerRetentionNotBefore: aggregate.artifact.providerRetentionNotBefore || null,
          submitCallId: aggregate.artifact.submitCallId || null,
          submitCallStartedAt: aggregate.artifact.submitCallStartedAt || null,
          reconciliationAttemptCount: aggregate.artifact.reconciliationAttemptCount || 0,
          pollAttemptCount: aggregate.artifact.pollAttemptCount || 0,
          pollStartedAt: aggregate.artifact.pollStartedAt || null
        });
      }
      return null;
    });
  }

  async beginTranscriptionUploadCall(input) {
    return this.#withGlobalLock(async () => {
      const expectedNotBefore = providerRetentionNotBefore(
        new Date(input.startedAt), input.retentionProfile
      );
      if (expectedNotBefore.getTime() !== new Date(input.providerRetentionNotBefore).getTime()) {
        throw new Error('AssemblyAI provider retention not-before does not match the verified profile.');
      }
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.startedAt)
          || value.artifact.status !== 'INTENT_RECORDED' || value.artifact.externalId !== null) return null;
      const callId = randomUUID();
      Object.assign(value.artifact, {
        status: 'UPLOAD_MAY_HAVE_DELIVERED', uploadCallId: callId,
        uploadCallStartedAt: input.startedAt, providerRetentionNotBefore: input.providerRetentionNotBefore,
        retentionProfile: input.retentionProfile.name,
        retentionPolicyDelayMs: input.retentionProfile.policyDelayMs,
        uploadRequestMaxDurationMs: input.retentionProfile.uploadRequestMaxDurationMs,
        retentionProcessingSlackMs: input.retentionProfile.processingSlackMs,
        retentionWindowElapsedAt: null,
        updatedAt: input.startedAt
      });
      const audit = {
        id: randomUUID(), event: 'PROVIDER_RETENTION_PENDING', provider: 'assemblyai',
        batchId: value.batch.id, assetId: value.asset.id, workItemId: value.work.id,
        deletionGeneration: input.deletionGeneration, providerCallId: callId,
        uploadUrlSha256: null, externalId: null,
        providerRetentionNotBefore: input.providerRetentionNotBefore,
        errorCode: null, createdAt: input.startedAt, evidencedAt: null
      };
      this.learningBatchProviderOrphanAudit.push(audit);
      const cleanup = {
        id: randomUUID(), orphanAuditId: audit.id, batchId: value.batch.id,
        cleanupKind: 'OBSERVE_RETENTION_WINDOW', provider: 'assemblyai', externalId: null,
        deletionGeneration: input.deletionGeneration, status: 'QUEUED', attemptCount: 0,
        availableAt: input.providerRetentionNotBefore, leaseOwner: null, leaseToken: null,
        leaseExpiresAt: null, lastErrorCode: null, createdAt: input.startedAt, updatedAt: input.startedAt
      };
      this.learningBatchProviderOrphanCleanupJobs.set(cleanup.id, cleanup);
      return { callId };
    });
  }

  async recordTranscriptionUploadResponse(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.returnedAt)
          || value.artifact.status !== 'UPLOAD_MAY_HAVE_DELIVERED'
          || value.artifact.uploadCallId !== input.uploadCallId) return false;
      Object.assign(value.artifact, {
        status: 'UPLOAD_RESPONSE_PERSISTED', uploadUrlHash: input.uploadUrlSha256,
        updatedAt: input.returnedAt
      });
      return true;
    });
  }

  async beginTranscriptionSubmitCall(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.startedAt)
          || value.artifact.status !== 'UPLOAD_RESPONSE_PERSISTED'
          || value.artifact.uploadCallId !== input.uploadCallId
          || value.artifact.uploadUrlHash !== input.uploadUrlSha256) return null;
      const callId = randomUUID();
      Object.assign(value.artifact, {
        status: 'SUBMIT_MAY_HAVE_DELIVERED', submitCallId: callId,
        submitCallStartedAt: input.startedAt, updatedAt: input.startedAt
      });
      return { callId };
    });
  }

  async deferAmbiguousUploadUntilRetention(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.now)
          || !['UPLOAD_MAY_HAVE_DELIVERED', 'UPLOAD_RESPONSE_PERSISTED'].includes(value.artifact.status)
          || value.artifact.uploadCallId !== input.uploadCallId) return false;
      Object.assign(value.artifact, { status: 'PROVIDER_RETENTION_PENDING', updatedAt: input.now });
      if (value.asset.status === 'STORED') {
        Object.assign(value.asset, { status: 'PURGE_PENDING', updatedAt: input.now });
      }
      Object.assign(value.work, {
        status: value.asset.status === 'PURGE_PENDING' ? 'QUEUED' : 'FAILED', availableAt: input.now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: 'UPLOAD_CALL_OUTCOME_AMBIGUOUS', updatedAt: input.now
      });
      if (value.batch.status === 'PROCESSING') Object.assign(value.batch, {
        status: 'FAILED', failureCode: 'UPLOAD_CALL_OUTCOME_AMBIGUOUS', updatedAt: input.now
      });
      return true;
    });
  }

  async markAmbiguousSubmitForReconciliation(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.now)
          || value.artifact.status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || value.artifact.submitCallId !== input.submitCallId) return false;
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: retryAvailableAt(input.now, value.work.attemptCount),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode || 'SUBMIT_CALL_OUTCOME_AMBIGUOUS', updatedAt: input.now
      });
      return true;
    });
  }

  async authorizeTranscriptionProviderCall(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.now)
          || !validBatchMutationEntitlement(this, value.batch, value.learning, {
            cleanup: ['DELETE', 'RECONCILE'].includes(input.phase)
          })) return false;
      let allowed = false;
      if (input.phase === 'DELETE') {
        allowed = value.artifact.status === 'DELETE_PENDING'
          && value.artifact.externalId === input.providerTranscriptId
          && (value.batch.deletionState === 'ACTIVE'
            ? ['PROCESSING', 'FAILED'].includes(value.batch.status)
            : ['DELETE_REQUESTED', 'LOCAL_PURGED', 'PROVIDER_DELETE_PENDING',
              'PROVIDER_RETENTION_PENDING'].includes(value.batch.deletionState));
      } else if (input.phase === 'RECONCILE') {
        allowed = value.artifact.status === 'SUBMIT_MAY_HAVE_DELIVERED'
          && value.artifact.submitCallId === input.submitCallId
          && value.artifact.uploadUrlHash === input.uploadUrlSha256;
      } else if (value.batch.status !== 'PROCESSING' || value.batch.deletionState !== 'ACTIVE'
          || value.learning.currentVersion !== value.batch.baseVersion) return false;
      else if (input.phase === 'UPLOAD') {
        allowed = value.artifact.status === 'UPLOAD_MAY_HAVE_DELIVERED'
          && value.artifact.uploadCallId === input.uploadCallId
          && value.asset.status === 'STORED' && typeof value.asset.storageKey === 'string';
      } else if (input.phase === 'SUBMIT') {
        allowed = value.artifact.status === 'SUBMIT_MAY_HAVE_DELIVERED'
          && value.artifact.uploadCallId === input.uploadCallId
          && value.artifact.submitCallId === input.submitCallId
          && value.artifact.uploadUrlHash === input.uploadUrlSha256;
      } else {
        allowed = input.phase === 'POLL' && value.artifact.status === 'ACTIVE'
          && value.artifact.externalId === input.providerTranscriptId;
      }
      if (!allowed || !input.providerBudget) {
        if (allowed && input.phase === 'POLL') {
          value.artifact.pollAttemptCount = (value.artifact.pollAttemptCount || 0) + 1;
          value.artifact.pollStartedAt ||= input.now;
          value.artifact.updatedAt = input.now;
        }
        return allowed;
      }
      const studentCheckpoint = cloneMap(this.studentResourceBudgetWindows);
      const globalCheckpoint = cloneMap(this.globalResourceBudgetWindows);
      const student = Number.isSafeInteger(input.providerBudget.studentLimit)
        ? consumeMemoryStudentBudget(this, {
          studentId: value.batch.studentId, budgetKind: 'PROVIDER_WORK', units: 1,
          limit: input.providerBudget.studentLimit, windowMs: input.providerBudget.windowMs, now: input.now
        }) : { allowed: true, retryAfterSeconds: 0 };
      const global = consumeMemoryGlobalBudget(this, {
        budgetKind: input.providerBudget.budgetKind || 'PROVIDER_WORK', units: 1,
        limit: input.providerBudget.globalLimit, windowMs: input.providerBudget.windowMs, now: input.now
      });
      if (student.allowed && global.allowed) {
        if (input.phase === 'POLL') {
          value.artifact.pollAttemptCount = (value.artifact.pollAttemptCount || 0) + 1;
          value.artifact.pollStartedAt ||= input.now;
          value.artifact.updatedAt = input.now;
        }
        return true;
      }
      this.studentResourceBudgetWindows = studentCheckpoint;
      this.globalResourceBudgetWindows = globalCheckpoint;
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: new Date(new Date(input.now).getTime()
          + Math.max(student.retryAfterSeconds || 1, global.retryAfterSeconds || 1) * 1_000),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: 'PROVIDER_BUDGET_EXHAUSTED', updatedAt: input.now
      });
      return false;
    });
  }

  async recordSubmitted(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.submittedAt)
          || value.artifact.status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || value.artifact.submitCallId !== input.submitCallId
          || value.artifact.uploadUrlHash !== input.uploadUrlSha256
          || value.artifact.externalId !== null) return false;
      Object.assign(value.artifact, {
        externalId: input.providerTranscriptId, uploadUrlHash: input.uploadUrlSha256,
        status: 'ACTIVE', submittedAt: input.submittedAt, providerRetentionNotBefore: null,
        retentionProfile: null, retentionPolicyDelayMs: null,
        uploadRequestMaxDurationMs: null, retentionProcessingSlackMs: null,
        retentionWindowElapsedAt: null,
        pollAttemptCount: 0, pollStartedAt: input.submittedAt,
        updatedAt: input.submittedAt
      });
      const source = this.learningBatchProviderOrphanAudit.find((audit) =>
        audit.providerCallId === value.artifact.uploadCallId && audit.event === 'PROVIDER_RETENTION_PENDING');
      if (source) {
        const bindingSource = retentionBindingSource(this, source);
        this.learningBatchProviderOrphanAudit.push({
          id: randomUUID(), sourceAuditId: bindingSource.id, event: 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT',
          provider: 'assemblyai', batchId: value.batch.id, assetId: value.asset.id,
          workItemId: value.work.id, deletionGeneration: input.deletionGeneration,
          providerCallId: value.artifact.uploadCallId, externalId: input.providerTranscriptId,
          uploadUrlSha256: input.uploadUrlSha256,
          providerRetentionNotBefore: source.providerRetentionNotBefore,
          evidenceCode: 'provider-transcript-bound-for-delete', createdAt: input.submittedAt,
          evidencedAt: input.submittedAt
        });
        const cleanup = activeRetentionCleanup(this, source);
        if (cleanup) Object.assign(cleanup, {
          status: 'SUPERSEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: null, updatedAt: input.submittedAt
        });
      }
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: input.submittedAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null, lastErrorCode: null,
        updatedAt: input.submittedAt
      });
      return true;
    });
  }

  async recordSubmissionFailure(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.failedAt)
          || value.artifact.status !== 'INTENT_RECORDED') return false;
      if (input.orphanDisposition === 'PROVIDER_RETENTION_PENDING') {
        const audit = clone({
          id: randomUUID(), event: input.orphanDisposition, provider: 'assemblyai',
          workItemId: value.work.id, batchId: value.batch.id, assetId: value.asset.id,
          deletionGeneration: input.deletionGeneration, uploadUrlSha256: input.uploadUrlSha256,
          providerRetentionNotBefore: input.providerRetentionNotBefore,
          externalId: null, errorCode: input.errorCode, createdAt: input.failedAt,
          evidencedAt: null
        });
        this.learningBatchProviderOrphanAudit.push(audit);
        const cleanup = {
          id: randomUUID(), orphanAuditId: audit.id, batchId: value.batch.id,
          cleanupKind: 'OBSERVE_RETENTION_WINDOW', provider: 'assemblyai', externalId: null,
          deletionGeneration: input.deletionGeneration, status: 'QUEUED', attemptCount: 0,
          availableAt: input.providerRetentionNotBefore, leaseOwner: null, leaseToken: null,
          leaseExpiresAt: null, lastErrorCode: null, createdAt: input.failedAt, updatedAt: input.failedAt
        };
        this.learningBatchProviderOrphanCleanupJobs.set(cleanup.id, cleanup);
      }
      const retry = input.retryable === true;
      Object.assign(value.work, {
        status: retry ? 'QUEUED' : 'FAILED',
        availableAt: retryAvailableAt(input.failedAt, value.work.attemptCount, input.retryAfterSeconds),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode, updatedAt: input.failedAt
      });
      if (!retry) Object.assign(value.batch, { status: 'FAILED', failureCode: input.errorCode, updatedAt: input.failedAt });
      return true;
    });
  }

  async recordAmbiguousSubmitReconciliation(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.reconciledAt)
          || !validBatchEntitlement(this, value.batch, value.learning, { cleanup: true })
          || value.artifact.status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || value.artifact.submitCallId !== input.submitCallId
          || value.artifact.uploadUrlHash !== input.uploadUrlSha256) return false;
      value.artifact.reconciliationAttemptCount = (value.artifact.reconciliationAttemptCount || 0) + 1;
      value.artifact.lastReconciliationAt = input.reconciledAt;
      const transcriptIds = [...new Set(input.providerTranscriptIds || [])].sort();
      if (input.scanComplete !== true) {
        for (const externalId of transcriptIds) {
          const audit = {
            id: randomUUID(), event: 'ORPHAN_TRANSCRIPT_DELETE_PENDING', provider: 'assemblyai',
            batchId: value.batch.id, assetId: value.asset.id, workItemId: value.work.id,
            deletionGeneration: input.deletionGeneration, externalId, providerTranscriptId: externalId,
            uploadUrlSha256: null, errorCode: 'RECONCILIATION_SCAN_INCOMPLETE',
            createdAt: input.reconciledAt, evidencedAt: null
          };
          this.learningBatchProviderOrphanAudit.push(audit);
          const cleanup = {
            id: randomUUID(), orphanAuditId: audit.id, batchId: value.batch.id,
            cleanupKind: 'DELETE_TRANSCRIPT', provider: 'assemblyai', externalId,
            deletionGeneration: input.deletionGeneration, status: 'QUEUED', attemptCount: 0,
            availableAt: input.reconciledAt, leaseOwner: null, leaseToken: null,
            leaseExpiresAt: null, lastErrorCode: audit.errorCode,
            createdAt: input.reconciledAt, updatedAt: input.reconciledAt
          };
          this.learningBatchProviderOrphanCleanupJobs.set(cleanup.id, cleanup);
        }
        Object.assign(value.artifact, {
          status: 'RECONCILE_BLOCKED_MANUAL', updatedAt: input.reconciledAt
        });
        Object.assign(value.work, {
          status: 'FAILED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: 'RECONCILIATION_SCAN_INCOMPLETE', updatedAt: input.reconciledAt
        });
        Object.assign(value.batch, {
          status: 'FAILED', failureCode: 'RECONCILIATION_SCAN_INCOMPLETE', updatedAt: input.reconciledAt
        });
        return true;
      }
      if (!transcriptIds.length) {
        const manual = new Date(input.reconciledAt).getTime()
          >= new Date(value.artifact.submitCallStartedAt).getTime() + input.manualAfterMs;
        Object.assign(value.work, {
          status: manual ? 'FAILED' : 'QUEUED',
          availableAt: retryAvailableAt(input.reconciledAt, value.work.attemptCount),
          leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: manual ? 'SUBMIT_RECONCILIATION_BLOCKED_MANUAL' : 'SUBMIT_RECONCILIATION_PENDING',
          updatedAt: input.reconciledAt
        });
        if (manual) {
          Object.assign(value.artifact, { status: 'RECONCILE_BLOCKED_MANUAL', updatedAt: input.reconciledAt });
          Object.assign(value.batch, {
            status: 'FAILED', failureCode: 'SUBMIT_RECONCILIATION_BLOCKED_MANUAL', updatedAt: input.reconciledAt
          });
        }
        return true;
      }
      const [primaryId, ...extraIds] = transcriptIds;
      Object.assign(value.artifact, {
        externalId: primaryId, submittedAt: value.artifact.submitCallStartedAt,
        status: 'DELETE_PENDING', providerRetentionNotBefore: null,
        retentionProfile: null, retentionPolicyDelayMs: null,
        uploadRequestMaxDurationMs: null, retentionProcessingSlackMs: null,
        retentionWindowElapsedAt: null, updatedAt: input.reconciledAt
      });
      if (value.asset.status === 'STORED') {
        Object.assign(value.asset, { status: 'PURGE_PENDING', updatedAt: input.reconciledAt });
      }
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: input.reconciledAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: 'AMBIGUOUS_SUBMIT_MATCH_DELETE_REQUIRED', updatedAt: input.reconciledAt
      });
      Object.assign(value.batch, {
        status: 'FAILED', failureCode: 'AMBIGUOUS_SUBMIT_RECONCILED_FOR_DELETE', updatedAt: input.reconciledAt
      });
      const uploadSource = this.learningBatchProviderOrphanAudit.find((audit) =>
        audit.providerCallId === value.artifact.uploadCallId && audit.event === 'PROVIDER_RETENTION_PENDING');
      if (uploadSource) {
        const bindingSource = retentionBindingSource(this, uploadSource);
        this.learningBatchProviderOrphanAudit.push({
          id: randomUUID(), sourceAuditId: bindingSource.id, event: 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT',
          provider: 'assemblyai', batchId: value.batch.id, assetId: value.asset.id,
          workItemId: value.work.id, deletionGeneration: input.deletionGeneration,
          providerCallId: value.artifact.uploadCallId, externalId: primaryId,
          uploadUrlSha256: input.uploadUrlSha256,
          providerRetentionNotBefore: uploadSource.providerRetentionNotBefore,
          evidenceCode: 'provider-transcript-bound-for-delete', createdAt: input.reconciledAt,
          evidencedAt: input.reconciledAt
        });
        const uploadCleanup = activeRetentionCleanup(this, uploadSource);
        if (uploadCleanup) Object.assign(uploadCleanup, {
          status: 'SUPERSEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: null, updatedAt: input.reconciledAt
        });
      }
      for (const externalId of extraIds) {
        const audit = {
          id: randomUUID(), event: 'ORPHAN_TRANSCRIPT_DELETE_PENDING', provider: 'assemblyai',
          batchId: value.batch.id, assetId: value.asset.id, workItemId: value.work.id,
          deletionGeneration: input.deletionGeneration, externalId, providerTranscriptId: externalId,
          uploadUrlSha256: null, errorCode: 'AMBIGUOUS_SUBMIT_MULTIPLE_MATCHES',
          createdAt: input.reconciledAt, evidencedAt: null
        };
        this.learningBatchProviderOrphanAudit.push(audit);
        const job = {
          id: randomUUID(), orphanAuditId: audit.id, batchId: value.batch.id,
          cleanupKind: 'DELETE_TRANSCRIPT', provider: 'assemblyai', externalId,
          deletionGeneration: input.deletionGeneration, status: 'QUEUED', attemptCount: 0,
          availableAt: input.reconciledAt, leaseOwner: null, leaseToken: null,
          leaseExpiresAt: null, lastErrorCode: audit.errorCode,
          createdAt: input.reconciledAt, updatedAt: input.reconciledAt
        };
        this.learningBatchProviderOrphanCleanupJobs.set(job.id, job);
      }
      return true;
    });
  }

  async recordPollPending(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.polledAt)
          || value.artifact.status !== 'ACTIVE' || value.artifact.externalId !== input.providerTranscriptId) return false;
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: retryAvailableAt(input.polledAt, value.work.attemptCount),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, updatedAt: input.polledAt
      });
      return true;
    });
  }

  async persistNormalizedTranscriptAndScheduleDeletion(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.completedAt)
          || value.artifact.status !== 'ACTIVE' || value.artifact.externalId !== input.providerTranscriptId
          || value.asset.status !== 'STORED') return false;
      const evidence = this.learningBatchEvidence.get(value.batch.id) || [];
      if (evidence.some((candidate) => candidate.assetId === value.asset.id)) return false;
      evidence.push({
        assetId: value.asset.id, batchId: value.batch.id, position: value.asset.position,
        sourceKind: 'AUDIO_TRANSCRIPT', normalizedText: input.transcriptText,
        normalizedSha256: input.transcriptSha256,
        durationMs: Math.max(1, Math.round(input.audioDurationSeconds * 1_000)),
        transcriptConfidence: input.confidence, transcriptionUncertain: input.transcriptionUncertain,
        createdAt: input.completedAt, purgedAt: null
      });
      this.learningBatchEvidence.set(value.batch.id, evidence);
      Object.assign(value.asset, { status: 'PURGE_PENDING', normalizedAt: input.completedAt, updatedAt: input.completedAt });
      Object.assign(value.artifact, { status: 'DELETE_PENDING', updatedAt: input.completedAt });
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: input.completedAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, updatedAt: input.completedAt
      });
      return true;
    });
  }

  async failTranscriptionAndScheduleDeletion(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.failedAt)
          || value.artifact.status !== 'ACTIVE' || value.artifact.externalId !== input.providerTranscriptId) return false;
      if (value.asset.status === 'STORED') Object.assign(value.asset, { status: 'PURGE_PENDING', updatedAt: input.failedAt });
      Object.assign(value.artifact, { status: 'DELETE_PENDING', updatedAt: input.failedAt });
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: input.failedAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode, updatedAt: input.failedAt
      });
      Object.assign(value.batch, { status: 'FAILED', failureCode: input.errorCode, updatedAt: input.failedAt });
      return true;
    });
  }

  async recordPollFailure(input) {
    if (input.scheduleDeletion) return this.failTranscriptionAndScheduleDeletion(input);
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionFence(this, value, input, input.failedAt)
          || value.artifact.status !== 'ACTIVE' || value.artifact.externalId !== input.providerTranscriptId) return false;
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: retryAvailableAt(input.failedAt, value.work.attemptCount, input.retryAfterSeconds),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode, updatedAt: input.failedAt
      });
      return true;
    });
  }

  async recordLocalAudioPurged(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.purgedAt)
          || !validBatchEntitlement(this, value.batch, value.learning, { cleanup: true })
          || value.artifact.status !== 'DELETE_PENDING'
          || value.artifact.externalId !== input.providerTranscriptId
          || value.asset.status !== 'PURGE_PENDING') return false;
      Object.assign(value.asset, {
        storageKey: null, status: 'PURGED', purgedAt: input.purgedAt, updatedAt: input.purgedAt
      });
      if (input.localObjectFound === false) {
        this.learningBatchProviderOrphanAudit.push({
          id: randomUUID(), event: 'LOCAL_AUDIO_ALREADY_ABSENT', provider: 'local',
          workItemId: value.work.id, batchId: value.batch.id, assetId: value.asset.id,
          deletionGeneration: input.deletionGeneration,
          evidenceCode: 'idempotent-local-purge-replay',
          createdAt: input.purgedAt, evidencedAt: input.purgedAt
        });
      }
      return true;
    });
  }

  async recordResolvedOrphanLocalAudioPurged(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.purgedAt)
          || !validBatchEntitlement(this, value.batch, value.learning, { cleanup: true })
          || !['DELETION_EVIDENCED', 'PROVIDER_RETENTION_PENDING',
            'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(value.artifact.status)
          || (value.artifact.status === 'DELETION_EVIDENCED'
            ? value.artifact.externalId !== input.providerTranscriptId
            : input.providerTranscriptId !== null || value.artifact.externalId !== null)
          || value.asset.status !== 'PURGE_PENDING') return false;
      Object.assign(value.asset, {
        storageKey: null, status: 'PURGED', purgedAt: input.purgedAt, updatedAt: input.purgedAt
      });
      if (input.localObjectFound === false) {
        this.learningBatchProviderOrphanAudit.push({
          id: randomUUID(), event: 'LOCAL_AUDIO_ALREADY_ABSENT', provider: 'local',
          workItemId: value.work.id, batchId: value.batch.id, assetId: value.asset.id,
          deletionGeneration: input.deletionGeneration,
          evidenceCode: 'idempotent-local-purge-replay',
          createdAt: input.purgedAt, evidencedAt: input.purgedAt
        });
      }
      const failureCode = value.artifact.status === 'DELETION_EVIDENCED'
        ? 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED' : 'UPLOAD_CALL_OUTCOME_AMBIGUOUS';
      Object.assign(value.work, {
        status: 'FAILED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: failureCode, updatedAt: input.purgedAt
      });
      const providerDone = (this.learningBatchProviderArtifacts.get(value.batch.id) || [])
        .every((artifact) => ['DELETION_EVIDENCED', 'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(artifact.status));
      const orphanDone = [...this.learningBatchProviderOrphanCleanupJobs.values()]
        .filter((job) => job.batchId === value.batch.id)
        .every((job) => ['SUCCEEDED', 'SUPERSEDED'].includes(job.status));
      const localDone = (this.learningBatchAssets.get(value.batch.id) || [])
        .every((asset) => ['PURGED', 'REJECTED'].includes(asset.status));
      if (['PROVIDER_DELETE_PENDING', 'PROVIDER_RETENTION_PENDING'].includes(value.batch.deletionState)
          && providerDone && orphanDone && localDone) {
        Object.assign(value.batch, { deletionState: 'COMPLETE', updatedAt: input.purgedAt });
      }
      return true;
    });
  }

  async recordDeletionEvidence(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.evidencedAt)
          || !validBatchEntitlement(this, value.batch, value.learning, { cleanup: true })
          || value.artifact.status !== 'DELETE_PENDING'
          || value.artifact.externalId !== input.providerTranscriptId
          || value.asset.status !== 'PURGED') return false;
      Object.assign(value.artifact, {
        status: 'DELETION_EVIDENCED', deletionEvidenceCode: input.evidenceType,
        deletionEvidencedAt: input.evidencedAt, updatedAt: input.evidencedAt,
        lastDeleteErrorCode: null
      });
      Object.assign(value.work, {
        status: 'SUCCEEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, updatedAt: input.evidencedAt
      });
      const workItems = this.learningBatchWorkItems.get(value.batch.id) || [];
      const allAudioDone = workItems
        .filter((item) => item.workType === 'TRANSCRIBE_AUDIO')
        .every((item) => item.status === 'SUCCEEDED');
      if (allAudioDone) {
        const extraction = workItems.find((item) => item.workType === 'BATCH_EXTRACTION');
        if (extraction?.status === 'BLOCKED_DEPENDENCY') {
          Object.assign(extraction, { status: 'QUEUED', availableAt: input.evidencedAt, updatedAt: input.evidencedAt });
        }
      }
      if (['PROVIDER_DELETE_PENDING', 'PROVIDER_RETENTION_PENDING'].includes(value.batch.deletionState)) {
        const allProviderDeleted = (this.learningBatchProviderArtifacts.get(value.batch.id) || [])
          .every((artifact) => ['DELETION_EVIDENCED', 'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(artifact.status));
        const allOrphansDone = [...this.learningBatchProviderOrphanCleanupJobs.values()]
          .filter((job) => job.batchId === value.batch.id)
          .every((job) => ['SUCCEEDED', 'SUPERSEDED'].includes(job.status));
        if (allProviderDeleted && allOrphansDone) {
          Object.assign(value.batch, { deletionState: 'COMPLETE', updatedAt: input.evidencedAt });
        }
      }
      return true;
    });
  }

  async recordDeletionRetry(input) {
    return this.#withGlobalLock(async () => {
      const value = transcriptionAggregate(this, input.workItemId);
      if (!validTranscriptionLeaseFence(value, input, input.attemptedAt)
          || !validBatchEntitlement(this, value.batch, value.learning, { cleanup: true })
          || value.artifact.status !== 'DELETE_PENDING'
          || value.artifact.externalId !== input.providerTranscriptId) return false;
      Object.assign(value.artifact, {
        deleteAttemptCount: (value.artifact.deleteAttemptCount || 0) + 1,
        lastDeleteAttemptAt: input.attemptedAt, lastDeleteErrorCode: input.errorCode,
        nextDeleteAttemptAt: retryAvailableAt(input.attemptedAt, value.work.attemptCount, input.retryAfterSeconds),
        updatedAt: input.attemptedAt
      });
      Object.assign(value.work, {
        status: 'QUEUED', availableAt: value.artifact.nextDeleteAttemptAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode, updatedAt: input.attemptedAt
      });
      return true;
    });
  }

  async recordProviderOrphanAudit(event) {
    return this.#withGlobalLock(async () => {
      const aggregate = event.workItemId ? transcriptionAggregate(this, event.workItemId) : null;
      const externalId = event.providerTranscriptId || null;
      const uploadHash = event.uploadUrlSha256 || null;
      const duplicate = this.learningBatchProviderOrphanAudit.find((candidate) =>
        candidate.event === event.event && candidate.provider === event.provider
          && ((externalId !== null && candidate.externalId === externalId)
            || (uploadHash !== null && candidate.uploadUrlSha256 === uploadHash)));
      if (duplicate) {
        if (['PROVIDER_RETENTION_PENDING', 'ORPHAN_TRANSCRIPT_DELETE_PENDING'].includes(event.event)
            && ![...this.learningBatchProviderOrphanCleanupJobs.values()]
              .some((job) => job.orphanAuditId === duplicate.id)) {
          const cleanupKind = event.event === 'PROVIDER_RETENTION_PENDING'
            ? 'OBSERVE_RETENTION_WINDOW' : 'DELETE_TRANSCRIPT';
          const cleanupId = randomUUID();
          this.learningBatchProviderOrphanCleanupJobs.set(cleanupId, {
            id: cleanupId, orphanAuditId: duplicate.id, batchId: duplicate.batchId,
            cleanupKind, provider: 'assemblyai', externalId: duplicate.externalId,
            deletionGeneration: duplicate.deletionGeneration, status: 'QUEUED', attemptCount: 0,
            availableAt: cleanupKind === 'OBSERVE_RETENTION_WINDOW'
              ? duplicate.providerRetentionNotBefore : duplicate.createdAt,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: duplicate.errorCode || null,
            createdAt: duplicate.createdAt, updatedAt: duplicate.createdAt
          });
          const batch = duplicate.batchId && this.learningBatches.get(duplicate.batchId);
          if (batch && ['LOCAL_PURGED', 'COMPLETE'].includes(batch.deletionState)) {
            Object.assign(batch, {
              deletionState: event.event === 'PROVIDER_RETENTION_PENDING'
                ? 'PROVIDER_RETENTION_PENDING' : 'PROVIDER_DELETE_PENDING',
              updatedAt: duplicate.createdAt
            });
          }
        }
        return true;
      }
      const audit = clone({
        id: randomUUID(), ...event,
        batchId: event.batchId || aggregate?.batch?.id || null,
        assetId: event.assetId || aggregate?.asset?.id || null,
        externalId,
        createdAt: event.createdAt || event.attemptedAt || event.detectedAt || event.evidencedAt || new Date()
      });
      this.learningBatchProviderOrphanAudit.push(audit);
      if (event.event === 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED' && event.providerCallId && aggregate
          && aggregate.artifact.submitCallId === event.providerCallId
          && aggregate.artifact.status === 'SUBMIT_MAY_HAVE_DELIVERED') {
        Object.assign(aggregate.artifact, {
          externalId, submittedAt: aggregate.artifact.submitCallStartedAt,
          status: 'DELETION_EVIDENCED', providerRetentionNotBefore: null,
          retentionProfile: null, retentionPolicyDelayMs: null,
          uploadRequestMaxDurationMs: null, retentionProcessingSlackMs: null,
          retentionWindowElapsedAt: null,
          deletionEvidenceCode: event.evidenceType, deletionEvidencedAt: event.evidencedAt,
          updatedAt: event.evidencedAt
        });
        const uploadSource = this.learningBatchProviderOrphanAudit.find((candidate) =>
          candidate.providerCallId === aggregate.artifact.uploadCallId
            && candidate.event === 'PROVIDER_RETENTION_PENDING');
        const bindingSource = uploadSource && retentionBindingSource(this, uploadSource);
        if (bindingSource && !this.learningBatchProviderOrphanAudit
          .some((candidate) => candidate.sourceAuditId === bindingSource.id)) {
          this.learningBatchProviderOrphanAudit.push({
            id: randomUUID(), sourceAuditId: bindingSource.id,
            event: 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT', provider: 'assemblyai',
            batchId: aggregate.batch.id, assetId: aggregate.asset.id,
            workItemId: aggregate.work.id, deletionGeneration: aggregate.work.deletionGeneration,
            providerCallId: aggregate.artifact.uploadCallId, externalId,
            uploadUrlSha256: aggregate.artifact.uploadUrlHash,
            providerRetentionNotBefore: uploadSource.providerRetentionNotBefore,
            evidenceCode: 'provider-transcript-bound-for-delete',
            createdAt: event.evidencedAt || audit.createdAt,
            evidencedAt: event.evidencedAt || audit.createdAt
          });
          const uploadCleanup = activeRetentionCleanup(this, uploadSource);
          if (uploadCleanup) Object.assign(uploadCleanup, {
            status: 'SUPERSEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: null, updatedAt: event.evidencedAt || audit.createdAt
          });
        }
        if (aggregate.asset.status === 'STORED') {
          Object.assign(aggregate.asset, { status: 'PURGE_PENDING', updatedAt: event.evidencedAt });
        }
        Object.assign(aggregate.work, {
          status: aggregate.asset.status === 'PURGE_PENDING' ? 'QUEUED' : 'FAILED',
          availableAt: event.evidencedAt || audit.createdAt,
          leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updatedAt: event.evidencedAt
        });
        Object.assign(aggregate.batch, {
          status: 'FAILED', failureCode: 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updatedAt: event.evidencedAt
        });
      }
      if (['PROVIDER_RETENTION_PENDING', 'ORPHAN_TRANSCRIPT_DELETE_PENDING'].includes(event.event)) {
        const cleanup = {
          id: randomUUID(), orphanAuditId: audit.id, batchId: audit.batchId,
          cleanupKind: event.event === 'PROVIDER_RETENTION_PENDING'
            ? 'OBSERVE_RETENTION_WINDOW' : 'DELETE_TRANSCRIPT',
          provider: 'assemblyai', externalId: audit.externalId,
          deletionGeneration: event.deletionGeneration, status: 'QUEUED', attemptCount: 0,
          availableAt: event.event === 'PROVIDER_RETENTION_PENDING'
            ? event.providerRetentionNotBefore : audit.createdAt,
          leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
          lastErrorCode: event.errorCode || null, createdAt: audit.createdAt, updatedAt: audit.createdAt
        };
        this.learningBatchProviderOrphanCleanupJobs.set(cleanup.id, cleanup);
        const batch = audit.batchId && this.learningBatches.get(audit.batchId);
        if (batch && ['LOCAL_PURGED', 'COMPLETE'].includes(batch.deletionState)) {
          Object.assign(batch, {
            deletionState: event.event === 'PROVIDER_RETENTION_PENDING'
              ? 'PROVIDER_RETENTION_PENDING' : 'PROVIDER_DELETE_PENDING',
            updatedAt: audit.createdAt
          });
        }
      }
      return true;
    });
  }

  async claimNextProviderOrphanCleanup({ workerId, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const nowMs = new Date(now).getTime();
      for (const job of this.learningBatchProviderOrphanCleanupJobs.values()) {
        if (job.status === 'RUNNING' && new Date(job.leaseExpiresAt).getTime() <= nowMs) {
          Object.assign(job, {
            status: 'QUEUED', availableAt: now, leaseOwner: null, leaseToken: null,
            leaseExpiresAt: null, lastErrorCode: 'LEASE_EXPIRED', updatedAt: now
          });
        }
      }
      const job = [...this.learningBatchProviderOrphanCleanupJobs.values()]
        .filter((candidate) => candidate.status === 'QUEUED'
          && new Date(candidate.availableAt).getTime() <= nowMs)
        .sort((left, right) => new Date(left.availableAt) - new Date(right.availableAt)
          || new Date(left.createdAt) - new Date(right.createdAt) || left.id.localeCompare(right.id))[0];
      if (!job) return null;
      Object.assign(job, {
        status: 'RUNNING', attemptCount: job.attemptCount + 1, leaseOwner: workerId,
        leaseToken: randomUUID(), leaseExpiresAt: new Date(nowMs + leaseMs), updatedAt: now
      });
      return clone(job);
    });
  }

  async authorizeProviderOrphanCall({ jobId, leaseToken, externalId, now, providerBudget }) {
    return this.#withGlobalLock(async () => {
      const job = this.learningBatchProviderOrphanCleanupJobs.get(jobId);
      const allowed = Boolean(job && job.cleanupKind === 'DELETE_TRANSCRIPT' && job.status === 'RUNNING'
        && job.leaseToken === leaseToken && job.externalId === externalId
        && new Date(job.leaseExpiresAt).getTime() > new Date(now).getTime());
      if (!allowed || !providerBudget) return allowed;
      const studentCheckpoint = cloneMap(this.studentResourceBudgetWindows);
      const globalCheckpoint = cloneMap(this.globalResourceBudgetWindows);
      const studentId = job.batchId ? this.learningBatches.get(job.batchId)?.studentId : null;
      const student = studentId && Number.isSafeInteger(providerBudget.studentLimit)
        ? consumeMemoryStudentBudget(this, {
          studentId, budgetKind: 'PROVIDER_WORK', units: 1,
          limit: providerBudget.studentLimit, windowMs: providerBudget.windowMs, now
        }) : { allowed: true, retryAfterSeconds: 0 };
      const global = consumeMemoryGlobalBudget(this, {
        budgetKind: providerBudget.budgetKind || 'PROVIDER_WORK', units: 1,
        limit: providerBudget.globalLimit, windowMs: providerBudget.windowMs, now
      });
      if (student.allowed && global.allowed) return true;
      this.studentResourceBudgetWindows = studentCheckpoint;
      this.globalResourceBudgetWindows = globalCheckpoint;
      Object.assign(job, {
        status: 'QUEUED',
        availableAt: new Date(new Date(now).getTime()
          + Math.max(student.retryAfterSeconds || 1, global.retryAfterSeconds || 1) * 1_000),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: 'PROVIDER_BUDGET_EXHAUSTED', updatedAt: now
      });
      return false;
    });
  }

  async completeProviderOrphanCleanup({ jobId, leaseToken, evidenceType, now }) {
    return this.#withGlobalLock(async () => {
      const job = this.learningBatchProviderOrphanCleanupJobs.get(jobId);
      if (!job || job.status !== 'RUNNING' || job.leaseToken !== leaseToken
          || new Date(job.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
      const source = this.learningBatchProviderOrphanAudit
        .find((event) => event.id === job.orphanAuditId);
      if (!source) return false;
      const isRetentionWindow = job.cleanupKind === 'OBSERVE_RETENTION_WINDOW';
      if (isRetentionWindow && new Date(job.availableAt).getTime() > new Date(now).getTime()) return false;
      if (isRetentionWindow && evidenceType !== 'provider-retention-window-elapsed') return false;
      if (!isRetentionWindow && !['provider-delete-response', 'provider-already-absent'].includes(evidenceType)) return false;
      this.learningBatchProviderOrphanAudit.push({
        id: randomUUID(),
        event: isRetentionWindow ? 'PROVIDER_RETENTION_WINDOW_ELAPSED'
          : 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED',
        provider: 'assemblyai', batchId: job.batchId, assetId: source.assetId || null,
        workItemId: source.workItemId || null, deletionGeneration: job.deletionGeneration,
        providerCallId: source.providerCallId || null,
        externalId: job.externalId, uploadUrlSha256: source.uploadUrlSha256 || null,
        providerRetentionNotBefore: source.providerRetentionNotBefore || null,
        evidenceCode: isRetentionWindow ? 'provider-retention-window-elapsed' : evidenceType,
        createdAt: now, evidencedAt: now, sourceAuditId: source.id
      });
      Object.assign(job, {
        status: isRetentionWindow ? 'MANUAL_VERIFICATION_REQUIRED' : 'SUCCEEDED',
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: null, updatedAt: now
      });
      if (!isRetentionWindow && source.providerCallId && source.workItemId) {
        const aggregate = transcriptionAggregate(this, source.workItemId);
        if (aggregate?.artifact?.submitCallId === source.providerCallId
            && aggregate.artifact.status === 'SUBMIT_MAY_HAVE_DELIVERED') {
          Object.assign(aggregate.artifact, {
            externalId: job.externalId,
            submittedAt: aggregate.artifact.submitCallStartedAt,
            status: 'DELETION_EVIDENCED',
            providerRetentionNotBefore: null,
            retentionProfile: null, retentionPolicyDelayMs: null,
            uploadRequestMaxDurationMs: null, retentionProcessingSlackMs: null,
            retentionWindowElapsedAt: null,
            deletionEvidenceCode: evidenceType,
            deletionEvidencedAt: now,
            updatedAt: now
          });
          const uploadSource = this.learningBatchProviderOrphanAudit.find((candidate) =>
            candidate.providerCallId === aggregate.artifact.uploadCallId
              && candidate.event === 'PROVIDER_RETENTION_PENDING');
          const bindingSource = uploadSource && retentionBindingSource(this, uploadSource);
          if (bindingSource && !this.learningBatchProviderOrphanAudit
            .some((candidate) => candidate.sourceAuditId === bindingSource.id)) {
            this.learningBatchProviderOrphanAudit.push({
              id: randomUUID(), sourceAuditId: bindingSource.id,
              event: 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT', provider: 'assemblyai',
              batchId: aggregate.batch.id, assetId: aggregate.asset.id,
              workItemId: aggregate.work.id, deletionGeneration: aggregate.work.deletionGeneration,
              providerCallId: aggregate.artifact.uploadCallId, externalId: job.externalId,
              uploadUrlSha256: aggregate.artifact.uploadUrlHash,
              providerRetentionNotBefore: uploadSource.providerRetentionNotBefore,
              evidenceCode: 'provider-transcript-bound-for-delete',
              createdAt: now, evidencedAt: now
            });
            const uploadCleanup = activeRetentionCleanup(this, uploadSource);
            if (uploadCleanup) Object.assign(uploadCleanup, {
              status: 'SUPERSEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
              lastErrorCode: null, updatedAt: now
            });
          }
          if (aggregate.asset.status === 'STORED') {
            Object.assign(aggregate.asset, { status: 'PURGE_PENDING', updatedAt: now });
          }
          Object.assign(aggregate.work, {
            status: aggregate.asset.status === 'PURGE_PENDING' ? 'QUEUED' : 'FAILED',
            availableAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updatedAt: now
          });
          if (aggregate.batch.status === 'PROCESSING') Object.assign(aggregate.batch, {
            status: 'FAILED', failureCode: 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updatedAt: now
          });
        }
      }
      if (job.batchId) {
        const batch = this.learningBatches.get(job.batchId);
        const providerDone = (this.learningBatchProviderArtifacts.get(job.batchId) || [])
          .every((artifact) => ['DELETION_EVIDENCED', 'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(artifact.status));
        const orphanDone = [...this.learningBatchProviderOrphanCleanupJobs.values()]
          .filter((candidate) => candidate.batchId === job.batchId)
          .every((candidate) => ['SUCCEEDED', 'SUPERSEDED'].includes(candidate.status));
        const localDone = (this.learningBatchAssets.get(job.batchId) || [])
          .every((asset) => ['PURGED', 'REJECTED'].includes(asset.status));
        if (['PROVIDER_DELETE_PENDING', 'PROVIDER_RETENTION_PENDING'].includes(batch?.deletionState)
            && providerDone && orphanDone && localDone) {
          Object.assign(batch, { deletionState: 'COMPLETE', updatedAt: now });
        }
      }
      return true;
    });
  }

  async confirmProviderRetentionDeletion({
    jobId, verificationAuthority, verificationReferenceHash, now
  }) {
    return this.#withGlobalLock(async () => {
      if (typeof verificationAuthority !== 'string'
          || verificationAuthority.length < 3 || verificationAuthority.length > 200
          || typeof verificationReferenceHash !== 'string'
          || !/^[0-9a-f]{64}$/.test(verificationReferenceHash)) return false;
      const job = this.learningBatchProviderOrphanCleanupJobs.get(jobId);
      if (!job || job.cleanupKind !== 'OBSERVE_RETENTION_WINDOW'
          || job.status !== 'MANUAL_VERIFICATION_REQUIRED') return false;
      const pending = this.learningBatchProviderOrphanAudit
        .find((event) => event.id === job.orphanAuditId);
      const elapsed = this.learningBatchProviderOrphanAudit.find((event) =>
        event.sourceAuditId === pending?.id && event.event === 'PROVIDER_RETENTION_WINDOW_ELAPSED');
      if (!pending || !elapsed) return false;
      const aggregate = pending.workItemId ? transcriptionAggregate(this, pending.workItemId) : null;
      if (aggregate && (aggregate.artifact?.status !== 'PROVIDER_RETENTION_PENDING'
          || aggregate.artifact.uploadCallId !== pending.providerCallId)) return false;
      this.learningBatchProviderOrphanAudit.push({
        id: randomUUID(), sourceAuditId: elapsed.id,
        event: 'PROVIDER_RETENTION_DELETION_CONFIRMED', provider: 'assemblyai',
        batchId: pending.batchId || null, assetId: pending.assetId || null,
        workItemId: pending.workItemId || null, deletionGeneration: pending.deletionGeneration,
        providerCallId: pending.providerCallId || null, externalId: null,
        uploadUrlSha256: pending.uploadUrlSha256 || null,
        providerRetentionNotBefore: pending.providerRetentionNotBefore,
        evidenceCode: 'independent-provider-deletion-confirmation',
        verificationAuthority, verificationReferenceHash,
        createdAt: now, evidencedAt: now
      });
      Object.assign(job, { status: 'SUCCEEDED', lastErrorCode: null, updatedAt: now });
      if (pending.workItemId && pending.providerCallId) {
        if (aggregate?.artifact?.status === 'PROVIDER_RETENTION_PENDING'
            && aggregate.artifact.uploadCallId === pending.providerCallId) {
          Object.assign(aggregate.artifact, {
            status: 'PROVIDER_RETENTION_DELETION_CONFIRMED',
            retentionVerificationCode: 'independent-provider-deletion-confirmation',
            retentionWindowElapsedAt: elapsed.evidencedAt,
            retentionVerifiedAt: now, updatedAt: now
          });
        }
      }
      if (job.batchId) {
        const batch = this.learningBatches.get(job.batchId);
        const providerDone = (this.learningBatchProviderArtifacts.get(job.batchId) || [])
          .every((artifact) => ['DELETION_EVIDENCED',
            'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(artifact.status));
        const orphanDone = [...this.learningBatchProviderOrphanCleanupJobs.values()]
          .filter((candidate) => candidate.batchId === job.batchId)
          .every((candidate) => ['SUCCEEDED', 'SUPERSEDED'].includes(candidate.status));
        const localDone = (this.learningBatchAssets.get(job.batchId) || [])
          .every((asset) => ['PURGED', 'REJECTED'].includes(asset.status));
        if (batch?.deletionState === 'PROVIDER_RETENTION_PENDING'
            && providerDone && orphanDone && localDone) {
          Object.assign(batch, { deletionState: 'COMPLETE', updatedAt: now });
        }
      }
      return true;
    });
  }

  async failProviderOrphanCleanup({ jobId, leaseToken, errorCode, retryAfterSeconds, now }) {
    return this.#withGlobalLock(async () => {
      const job = this.learningBatchProviderOrphanCleanupJobs.get(jobId);
      if (!job || job.status !== 'RUNNING' || job.leaseToken !== leaseToken
          || new Date(job.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
      Object.assign(job, {
        status: 'QUEUED', availableAt: retryAvailableAt(now, job.attemptCount, retryAfterSeconds),
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: errorCode, updatedAt: now
      });
      return true;
    });
  }

  async observePrivateStorageInventory({ objects, partials, now, graceMs, inventoryComplete = true }) {
    return this.#withGlobalLock(async () => {
      const referenced = new Set([...this.learningBatchAssets.values()].flat()
        .map((asset) => asset.storageKey).filter(Boolean));
      const observedKeys = new Set();
      const deletable = [];
      const observe = (kind, identity, size, mtimeMs, referencedNow) => {
        const key = `${kind}:${identity}`;
        observedKeys.add(key);
        if (referencedNow) {
          this.privateStorageCandidates.delete(key);
          return;
        }
        const fingerprint = `${size}:${mtimeMs}`;
        const existing = this.privateStorageCandidates.get(key);
        if (!existing || existing.fingerprint !== fingerprint || existing.status === 'DELETED') {
          this.privateStorageCandidates.set(key, {
            key, kind, identity, size, mtimeMs, fingerprint,
            firstSeenAt: now, lastSeenAt: now, observations: 1, status: 'OBSERVED',
            deletionToken: null, deletionAuthorizedAt: null, deletedAt: null
          });
          return;
        }
        if (existing.status === 'DELETING') {
          if (new Date(now).getTime() - new Date(existing.deletionAuthorizedAt).getTime() >= graceMs) {
            Object.assign(existing, {
              status: 'OBSERVED', deletionToken: null, deletionAuthorizedAt: null,
              lastSeenAt: now, observations: existing.observations + 1
            });
            deletable.push({
              kind, ...(kind === 'OBJECT' ? { storageKey: identity } : { name: identity }), size, mtimeMs
            });
          }
          return;
        }
        existing.lastSeenAt = now;
        existing.observations += 1;
        if (existing.observations >= 2
            && new Date(now).getTime() - new Date(existing.firstSeenAt).getTime() >= graceMs) {
          deletable.push({ kind, ...(kind === 'OBJECT' ? { storageKey: identity } : { name: identity }), size, mtimeMs });
        }
      };
      for (const object of objects) observe('OBJECT', object.storageKey, object.size, object.mtimeMs,
        referenced.has(object.storageKey));
      for (const partial of partials) observe('PARTIAL', partial.name, partial.size, partial.mtimeMs, false);
      for (const [key, candidate] of this.privateStorageCandidates) {
        if (observedKeys.has(key) || !inventoryComplete) continue;
        if (candidate.status === 'OBSERVED') this.privateStorageCandidates.delete(key);
        else if (candidate.status === 'DELETING') {
          Object.assign(candidate, { status: 'DELETED', deletedAt: now });
          this.privateStorageReconciliationAudit.push({
            id: randomUUID(), event: 'ORPHAN_DELETED', storageKind: candidate.kind,
            storageIdentity: candidate.identity, size: candidate.size,
            mtimeMs: candidate.mtimeMs, occurredAt: now
          });
        }
      }
      return {
        deletable: clone(deletable), referencedCount: referenced.size,
        candidateCount: [...this.privateStorageCandidates.values()].filter((value) => value.status !== 'DELETED').length
      };
    });
  }

  async authorizePrivateStorageDeletion({ kind, identity: suppliedIdentity, storageKey, name, size, mtimeMs, now }) {
    return this.#withGlobalLock(async () => {
      const identity = suppliedIdentity || (kind === 'OBJECT' ? storageKey : name);
      const candidate = this.privateStorageCandidates.get(`${kind}:${identity}`);
      const referenced = kind === 'OBJECT' && [...this.learningBatchAssets.values()].flat()
        .some((asset) => asset.storageKey === identity);
      if (!candidate || candidate.status !== 'OBSERVED' || referenced
          || candidate.size !== size || candidate.mtimeMs !== mtimeMs) return null;
      const deletionToken = randomUUID();
      Object.assign(candidate, { status: 'DELETING', deletionToken, deletionAuthorizedAt: now });
      return deletionToken;
    });
  }

  async recordPrivateStorageDeletion({ kind, identity, size, mtimeMs, deletionToken, deleted, deletedAt }) {
    return this.#withGlobalLock(async () => {
      const key = `${kind}:${identity}`;
      const candidate = this.privateStorageCandidates.get(key);
      if (!candidate || candidate.status !== 'DELETING' || candidate.deletionToken !== deletionToken
          || candidate.size !== size || candidate.mtimeMs !== mtimeMs) return false;
      Object.assign(candidate, deleted ? { status: 'DELETED', deletedAt }
        : { status: 'OBSERVED', deletionToken: null, deletionAuthorizedAt: null });
      this.privateStorageReconciliationAudit.push({
        id: randomUUID(), event: deleted ? 'ORPHAN_DELETED' : 'DELETE_TARGET_CHANGED',
        storageKind: kind, storageIdentity: identity, size, mtimeMs, occurredAt: deletedAt
      });
      return true;
    });
  }

  async expireLearningBatchReservations({ now, writingTtlMs, draftTtlMs, limit }) {
    return this.#withGlobalLock(async () => {
      const nowMs = new Date(now).getTime();
      let writingResetCount = 0;
      const purges = [];
      for (const batch of [...this.learningBatches.values()]
        .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))) {
        if (purges.length >= limit || batch.deletionState !== 'ACTIVE' || batch.status !== 'DRAFT') continue;
        const assets = this.learningBatchAssets.get(batch.id) || [];
        for (const asset of assets) {
          if (asset.status === 'WRITING' && asset.writingStartedAt
              && nowMs - new Date(asset.writingStartedAt).getTime() >= writingTtlMs) {
            Object.assign(asset, {
              status: 'RESERVED', writingStartedAt: null, uploadIdempotencyKey: null,
              lastErrorCode: 'WRITING_LEASE_EXPIRED', updatedAt: now
            });
            writingResetCount += 1;
          }
        }
        if (nowMs - new Date(batch.createdAt).getTime() < draftTtlMs) continue;
        Object.assign(batch, {
          deletionState: 'DELETE_REQUESTED', deletionGeneration: batch.deletionGeneration + 1,
          deletedAt: now, updatedAt: now
        });
        const storageKeys = [];
        for (const asset of assets) {
          if (asset.storageKey) {
            storageKeys.push(asset.storageKey);
            Object.assign(asset, { status: 'PURGE_PENDING', updatedAt: now });
          } else {
            Object.assign(asset, {
              status: 'REJECTED', writingStartedAt: null, uploadIdempotencyKey: null,
              lastErrorCode: 'DRAFT_RESERVATION_EXPIRED', purgedAt: now, updatedAt: now
            });
          }
          const reservation = this.learningBatchQuota.get(asset.id);
          if (reservation && reservation.status !== 'RELEASED') {
            Object.assign(reservation, { status: 'RELEASED', releasedAt: now });
          }
        }
        purges.push({ batchId: batch.id, deletionGeneration: batch.deletionGeneration, storageKeys });
      }
      return { writingResetCount, purges: clone(purges) };
    });
  }

  async completeExpiredLearningBatchPurge({ batchId, deletionGeneration, now }) {
    return this.#withGlobalLock(async () => {
      const batch = this.learningBatches.get(batchId);
      if (!batch || batch.deletionState !== 'DELETE_REQUESTED'
          || batch.deletionGeneration !== deletionGeneration) return false;
      for (const asset of this.learningBatchAssets.get(batchId) || []) {
        if (asset.status === 'PURGE_PENDING') {
          Object.assign(asset, { storageKey: null, status: 'PURGED', purgedAt: now, updatedAt: now });
        }
      }
      batch.deletionState = 'COMPLETE';
      batch.updatedAt = now;
      return true;
    });
  }

  async heartbeatBatchExtractionWork({ workItemId, workerId, leaseToken, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningBatchWorkItems.values()].flat()
        .find((candidate) => candidate.id === workItemId && candidate.workType === 'BATCH_EXTRACTION');
      const batch = item && this.learningBatches.get(item.batchId);
      if (!item || !batch || item.status !== 'RUNNING' || item.leaseOwner !== workerId
          || item.leaseToken !== leaseToken || item.deletionGeneration !== batch.deletionGeneration
          || batch.status !== 'PROCESSING' || batch.deletionState !== 'ACTIVE'
          || new Date(item.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
      item.leaseExpiresAt = new Date(new Date(now).getTime() + leaseMs);
      item.updatedAt = now;
      return true;
    });
  }

  async authorizeBatchExtractionProviderCall(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningBatchWorkItems.values()].flat()
        .find((candidate) => candidate.id === input.workItemId
          && candidate.workType === 'BATCH_EXTRACTION');
      const batch = item && this.learningBatches.get(item.batchId);
      const learning = batch && [...this.learningSubmissions.values()]
        .find((candidate) => candidate.id === batch.learningSubmissionId);
      return Boolean(item && batch && learning
        && item.status === 'RUNNING' && item.leaseOwner === input.workerId
        && item.leaseToken === input.leaseToken && item.inputHash === input.inputHash
        && item.deletionGeneration === input.deletionGeneration
        && item.deletionGeneration === batch.deletionGeneration
        && new Date(item.leaseExpiresAt).getTime() > new Date(input.now).getTime()
        && batch.status === 'PROCESSING' && batch.deletionState === 'ACTIVE'
        && learning.currentVersion === batch.baseVersion
        && validBatchMutationEntitlement(this, batch, learning));
    });
  }

  async failBatchExtractionWork(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningBatchWorkItems.values()].flat()
        .find((candidate) => candidate.id === input.workItemId && candidate.workType === 'BATCH_EXTRACTION');
      const batch = item && this.learningBatches.get(item.batchId);
      if (!item || !batch || item.status !== 'RUNNING' || item.leaseOwner !== input.workerId
          || item.leaseToken !== input.expectedLeaseToken || item.inputHash !== input.expectedInputHash
          || item.deletionGeneration !== input.expectedDeletionGeneration
          || item.deletionGeneration !== batch.deletionGeneration
          || batch.status !== 'PROCESSING' || batch.deletionState !== 'ACTIVE'
          || new Date(item.leaseExpiresAt).getTime() <= new Date(input.now).getTime()) return false;
      Object.assign(item, {
        status: input.retry ? 'QUEUED' : 'FAILED', availableAt: input.availableAt,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.errorCode, updatedAt: input.now
      });
      if (!input.retry) Object.assign(batch, { status: 'FAILED', failureCode: input.errorCode, updatedAt: input.now });
      return true;
    });
  }

  async heartbeatLearningAnalysisWork({ workItemId, workerId, leaseToken, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === workItemId);
      if (!item || item.status !== 'RUNNING' || item.leaseOwner !== workerId || item.leaseToken !== leaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
      item.leaseExpiresAt = new Date(new Date(now).getTime() + leaseMs);
      item.updatedAt = now;
      return true;
    });
  }

  async authorizeLearningAnalysisProviderCall(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat()
        .find((candidate) => candidate.id === input.workItemId);
      const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === input.analysisRunId);
      const version = run && [...this.learningVersions.values()].flat()
        .find((candidate) => candidate.id === input.versionId
          && candidate.id === run.learningSubmissionVersionId);
      const submission = version && [...this.learningSubmissions.values()]
        .find((candidate) => candidate.id === version.learningSubmissionId);
      const attempt = submission && this.attempts.get(submission.attemptId);
      const storedContextSet = version && this.approvedContextSets.get(version.contextSetId);
      const contextSet = storedContextSet?.sealed ? storedContextSet : null;
      const contextQuestion = contextSet?.questions
        .find((candidate) => candidate.questionNumber === input.questionNumber);
      const storedForm = version && this.forms.get(formKey(version.formId, version.formVersion));
      const form = storedForm?.contentSealed ? storedForm : null;
      const response = version && (this.learningResponses.get(version.id) || [])
        .find((candidate) => candidate.questionNumber === input.questionNumber);
      const scoring = version && submission
        ? analysisScoringSnapshot(this, submission, version, response) : null;
      const batch = version?.batchId ? this.learningBatches.get(version.batchId) : null;
      const liveEligible = (contextQuestion?.solutions || [])
        .filter((solution) => solution.modelEligibility?.eligible === true
          && solution.authorityReceipt?.status === 'active')
        .map((solution) => ({
          artifactSolutionId: solution.artifactSolutionId,
          bodySha256: solution.bodySha256,
          sourceSha256: solution.sourceRef.sha256,
          decisionRecordHash: solution.decisionRecordHash,
          authorityReceiptId: solution.authorityReceipt.receiptId
        }));
      const responseHash = response && canonicalHash({
        questionNumber: response.questionNumber,
        selectedOption: response.selectedOption,
        reasoningText: response.reasoningText,
        answerOrigin: response.answerOrigin
      });
      return Boolean(item && run && version && submission && attempt && contextSet
        && contextQuestion && form && response && scoring
        && item.status === 'RUNNING' && item.leaseOwner === input.workerId
        && item.leaseToken === input.leaseToken && item.analysisRunId === run.id
        && item.learningSubmissionVersionId === version.id
        && item.inputHash === input.inputHash && run.inputHash === input.inputHash
        && run.analysisContractVersion === ANALYSIS_CONTRACT_VERSION
        && item.deletionGeneration === input.deletionGeneration
        && run.deletionGeneration === input.deletionGeneration
        && new Date(item.leaseExpiresAt).getTime() > new Date(input.now).getTime()
        && run.status === 'RUNNING' && run.versionNumber === input.versionNumber
        && version.versionNumber === input.versionNumber
        && version.evidenceHash === input.evidenceHash && run.evidenceHash === input.evidenceHash
        && submission.studentId === input.expectedStudentId
        && submission.currentVersion === input.expectedSubmissionCurrentVersion
        && validLearningEntitlement(this, submission) && attempt.studentId === input.expectedStudentId
        && attempt.formId === version.formId && attempt.formVersion === version.formVersion
        && submission.formId === version.formId && submission.formVersion === version.formVersion
        && version.contextStatus === 'CONTEXT_READY'
        && version.contextSetId === input.expectedContextSetId
        && run.contextSetId === input.expectedContextSetId
        && contextSet.formId === version.formId && contextSet.formVersion === version.formVersion
        && contextSet.releaseBinding?.questionBundleHash === form.questionBundleHash
        && contextSet.releaseBinding?.contentHash === form.contentHash
        && contextSet.releaseBinding?.manifestHash === form.manifestHash
        && contextQuestion.questionContentHash === input.questionContextHash
        && isValidAnalysisScoringSnapshot(scoring, response.selectedOption)
        && input.isScored === true && scoring.isScored === true
        && scoring.isScored === input.isScored
        && scoring.canonicalAnswer === input.canonicalAnswer
        && JSON.stringify(scoring.acceptedOptions) === JSON.stringify(input.acceptedOptions)
        && scoring.studentAnswerIsCorrect === input.studentAnswerIsCorrect
        && scoring.selectedOption === input.selectedOption
        && responseHash === input.questionResponseHash
        && liveEligible.length >= 2
        && JSON.stringify(liveEligible) === JSON.stringify(input.eligibleSolutions)
        && (!batch || (batch.deletionState === 'ACTIVE'
          && batch.deletionGeneration === input.deletionGeneration)));
    });
  }

  async completeLearningAnalysisWork(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === input.workItemId);
      const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === input.analysisRunId);
      const version = run && [...this.learningVersions.values()].flat().find((candidate) => candidate.id === run.learningSubmissionVersionId);
      const submission = version && [...this.learningSubmissions.values()].find((candidate) => candidate.id === version.learningSubmissionId);
      const attempt = submission && this.attempts.get(submission.attemptId);
      if (!item || !run || !version || !submission || !attempt || item.status !== 'RUNNING'
          || item.leaseOwner !== input.workerId || item.leaseToken !== input.expectedLeaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(input.now).getTime()
          || item.inputHash !== input.expectedInputHash || item.deletionGeneration !== input.expectedDeletionGeneration
          || run.inputHash !== input.expectedInputHash || run.id !== item.analysisRunId || run.status !== 'RUNNING'
          || item.learningSubmissionVersionId !== version.id || run.contextSetId !== version.contextSetId
          || run.versionNumber !== version.versionNumber || run.evidenceHash !== version.evidenceHash
          || version.versionNumber !== input.expectedVersionNumber || submission.studentId !== input.expectedStudentId
          || !validLearningEntitlement(this, submission) || attempt.studentId !== input.expectedStudentId
          || version.contextSetId !== input.expectedContextSetId) return false;
      const responseNumbers = (this.learningResponses.get(version.id) || []).map((response) => response.questionNumber);
      const outcomeNumbers = input.outcomes.map((outcome) => outcome.questionNumber);
      if (outcomeNumbers.length !== responseNumbers.length || new Set(outcomeNumbers).size !== outcomeNumbers.length
          || outcomeNumbers.some((number, index) => number !== responseNumbers[index])) {
        throw Object.assign(new Error('Analysis outcomes must cover every response exactly once in question order.'), {
          code: 'INVALID_ANALYSIS_OUTCOMES'
        });
      }
      this.questionAnalyses.set(run.id, clone(input.outcomes));
      this.learningReports.set(version.id, clone({
        id: randomUUID(), analysisRunId: run.id, learningSubmissionVersionId: version.id, ...input.report
      }));
      Object.assign(run, { status: input.report.status, completedAt: input.now, lastErrorCode: null });
      Object.assign(item, {
        status: input.report.status === 'PARTIAL' ? 'PARTIAL' : input.report.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED',
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.report.status === 'FAILED' ? 'ANALYSIS_FAILED' : null,
        updatedAt: input.now
      });
      return true;
    });
  }

  async retryLearningAnalysisWork(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === input.workItemId);
      const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === input.analysisRunId);
      const version = run && [...this.learningVersions.values()].flat().find((candidate) => candidate.id === run.learningSubmissionVersionId);
      const submission = version && [...this.learningSubmissions.values()].find((candidate) => candidate.id === version.learningSubmissionId);
      const attempt = submission && this.attempts.get(submission.attemptId);
      if (!item || !run || !version || !submission || !attempt || item.status !== 'RUNNING'
          || item.leaseOwner !== input.workerId || item.leaseToken !== input.expectedLeaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(input.now).getTime()
          || item.inputHash !== input.expectedInputHash || item.deletionGeneration !== input.expectedDeletionGeneration
          || run.inputHash !== input.expectedInputHash || run.id !== item.analysisRunId || run.status !== 'RUNNING'
          || version.versionNumber !== input.expectedVersionNumber || submission.studentId !== input.expectedStudentId
          || !validLearningEntitlement(this, submission) || attempt.studentId !== input.expectedStudentId
          || version.contextSetId !== input.expectedContextSetId
          || run.contextSetId !== input.expectedContextSetId) return false;
      Object.assign(item, {
        status: 'QUEUED', availableAt: input.availableAt, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.lastErrorCode, updatedAt: input.now
      });
      Object.assign(run, { status: 'QUEUED', startedAt: null, lastErrorCode: input.lastErrorCode });
      return true;
    });
  }

  async createTutorRootThread({
    studentId, authorizedSessionId, learningSubmissionId, versionNumber, questionNumber,
    idempotencyKey: rawIdempotencyKey, snapshotId, threadId, now = new Date()
  }) {
    return this.#withGlobalLock(async () => {
      const session = this.sessions.get(authorizedSessionId);
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
      }
      const creationIdempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const creationRequestHash = tutorRootThreadCreationRequestHash({
        studentId, learningSubmissionId, versionNumber, questionNumber
      });
      const replay = [...this.tutorThreads.values()].find((candidate) =>
        candidate.studentId === studentId
          && candidate.creationIdempotencyKeyHash === creationIdempotencyKeyHash);
      if (replay) {
        if (replay.creationRequestHash !== creationRequestHash) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        const replaySnapshot = this.tutorSnapshots.get(replay.snapshotId);
        if (!replaySnapshot || !['OPEN', 'CAPACITY_REACHED'].includes(replay.status)
            || replaySnapshot.studentId !== studentId
            || replaySnapshot.learningSubmissionId !== learningSubmissionId
            || replaySnapshot.versionNumber !== versionNumber
            || replaySnapshot.questionNumber !== questionNumber) {
          throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
        }
        try {
          validateTutorSnapshotRecord(replaySnapshot);
          assertMemoryTutorSourceIsLive(this, replaySnapshot);
        } catch (error) {
          if (error instanceof TutorStoreError) {
            throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
          }
          throw error;
        }
        return clone({ snapshot: replaySnapshot, thread: replay, replayed: true });
      }

      let derivedSnapshot;
      try {
        derivedSnapshot = buildMemoryTutorRootSnapshot(this, {
          studentId, learningSubmissionId, versionNumber, questionNumber, snapshotId
        }, now);
      } catch (error) {
        if (error instanceof TutorStoreError) {
          throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
        }
        throw error;
      }
      const semanticSnapshot = [...this.tutorSnapshots.values()].find((candidate) =>
        candidate.learningSubmissionVersionId === derivedSnapshot.learningSubmissionVersionId
          && candidate.questionNumber === derivedSnapshot.questionNumber
          && candidate.analysisRunId === derivedSnapshot.analysisRunId
          && candidate.reportId === derivedSnapshot.reportId);
      let snapshot = derivedSnapshot;
      if (semanticSnapshot) {
        if (tutorSnapshotSemanticHash(semanticSnapshot)
            !== tutorSnapshotSemanticHash(derivedSnapshot)) {
          throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
        }
        snapshot = semanticSnapshot;
      } else if (this.tutorSnapshots.has(snapshotId)) {
        throw new TutorStoreError('TUTOR_SNAPSHOT_ID_CONFLICT');
      }
      assertMemoryTutorThreadCapacity(this, {
        studentId,
        learningSubmissionVersionId: snapshot.learningSubmissionVersionId,
        questionNumber: snapshot.questionNumber
      });
      if (this.tutorThreads.has(threadId)) {
        throw new TutorStoreError('TUTOR_THREAD_ID_CONFLICT');
      }
      const thread = buildTutorRootThreadRecord({
        id: threadId,
        studentId,
        snapshot,
        creationIdempotencyKeyHash,
        creationRequestHash,
        createdAt: now
      });
      // All validation and collision checks happen before either map changes,
      // making the pair one deterministic MemoryStore unit of work.
      if (!semanticSnapshot) this.tutorSnapshots.set(snapshot.id, clone(snapshot));
      this.tutorThreads.set(thread.id, clone(thread));
      return clone({ snapshot, thread, replayed: false });
    });
  }

  async createTutorSnapshot(snapshot) {
    return this.#withGlobalLock(async () => {
      const validated = validateTutorSnapshotRecord(snapshot);
      assertMemoryTutorSourceIsLive(this, validated);
      const existing = this.tutorSnapshots.get(validated.id);
      if (existing) {
        if (tutorSnapshotSemanticHash(existing) !== tutorSnapshotSemanticHash(validated)) {
          throw new TutorStoreError('TUTOR_SNAPSHOT_IMMUTABLE');
        }
        return clone(existing);
      }
      const duplicate = [...this.tutorSnapshots.values()].find((candidate) =>
        candidate.learningSubmissionVersionId === validated.learningSubmissionVersionId
          && candidate.questionNumber === validated.questionNumber
          && candidate.analysisRunId === validated.analysisRunId
          && candidate.reportId === validated.reportId);
      if (duplicate) {
        if (tutorSnapshotSemanticHash(duplicate) !== tutorSnapshotSemanticHash(validated)) {
          throw new TutorStoreError('TUTOR_SNAPSHOT_IMMUTABLE');
        }
        return clone(duplicate);
      }
      this.tutorSnapshots.set(validated.id, clone(validated));
      return clone(validated);
    });
  }

  async createTutorThread({
    id = randomUUID(), studentId, snapshotId, idempotencyKey: rawIdempotencyKey,
    forkedFromThreadId = null, forkedFromTurnJobId = null, now = new Date()
  }) {
    return this.#withGlobalLock(async () => {
      const idempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const requestHash = tutorThreadCreationRequestHash({
        studentId, snapshotId, forkedFromThreadId, forkedFromTurnJobId
      });
      const replay = [...this.tutorThreads.values()].find((candidate) =>
        candidate.studentId === studentId
          && candidate.creationIdempotencyKeyHash === idempotencyKeyHash);
      const snapshot = this.tutorSnapshots.get(snapshotId);
      if (!snapshot || snapshot.studentId !== studentId) throw new TutorStoreError('TUTOR_SNAPSHOT_NOT_FOUND');
      validateTutorSnapshotRecord(snapshot);
      assertMemoryTutorSourceIsLive(this, snapshot);
      if (replay) {
        if (!['OPEN', 'CAPACITY_REACHED'].includes(replay.status)) {
          throw new TutorStoreError('TUTOR_THREAD_NOT_AVAILABLE');
        }
        if (replay.creationRequestHash !== requestHash) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        return clone(replay);
      }
      if (this.tutorThreads.has(id)) throw new TutorStoreError('TUTOR_THREAD_ID_CONFLICT');
      if ((forkedFromThreadId === null) !== (forkedFromTurnJobId === null)) {
        throw new TutorStoreError('INVALID_TUTOR_FORK');
      }
      if (forkedFromThreadId) {
        const parent = this.tutorThreads.get(forkedFromThreadId);
        const parentJob = this.tutorTurnJobs.get(forkedFromTurnJobId);
        if (!parent || !parentJob || parent.studentId !== studentId
            || parent.snapshotId !== snapshotId || parent.status === 'TOMBSTONED'
            || parentJob.threadId !== parent.id || parentJob.status !== 'SUCCEEDED'
            || parentJob.turnNumber !== parent.successfulTurnCount) {
          throw new TutorStoreError('INVALID_TUTOR_FORK');
        }
      }
      const thread = {
        id, studentId, snapshotId,
        learningSubmissionId: snapshot.learningSubmissionId,
        learningSubmissionVersionId: snapshot.learningSubmissionVersionId,
        questionNumber: snapshot.questionNumber,
        snapshotHash: snapshot.snapshotHash,
        threadLineageHash: snapshot.threadLineageHash,
        tutorContractVersion: TUTOR_CONTRACT_VERSION,
        contextHash: computeTutorContextHash({ threadId: id, context: snapshot.snapshotPayload }),
        status: 'OPEN', successfulTurnCount: 0, requestCount: 0,
        successfulHistoryBytes: 0, threadRevision: 0,
        initialDeletionGeneration: snapshot.initialDeletionGeneration,
        deletionGeneration: snapshot.initialDeletionGeneration,
        forkedFromThreadId, forkedFromTurnJobId,
        creationIdempotencyKeyHash: idempotencyKeyHash,
        creationRequestHash: requestHash,
        createdAt: now, updatedAt: now, closedAt: null, tombstonedAt: null
      };
      this.tutorThreads.set(id, clone(thread));
      return clone(thread);
    });
  }

  async createTutorForkFromHead({
    studentId, authorizedSessionId, learningSubmissionId, versionNumber,
    questionNumber, parentThreadId, idempotencyKey: rawIdempotencyKey,
    threadId, now = new Date()
  }) {
    return this.#withGlobalLock(async () => {
      const session = this.sessions.get(authorizedSessionId);
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_SESSION_NOT_LIVE');
      }
      const creationIdempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const creationRequestHash = tutorForkCreationRequestHash({
        studentId, learningSubmissionId, versionNumber, questionNumber, parentThreadId
      });
      const replay = [...this.tutorThreads.values()].find((candidate) =>
        candidate.studentId === studentId
          && candidate.creationIdempotencyKeyHash === creationIdempotencyKeyHash);
      if (replay) {
        if (replay.creationRequestHash !== creationRequestHash) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        const replayAggregate = memoryTutorThreadAggregate(this, replay.id);
        if (!memoryTutorAggregateMatchesPath(replayAggregate, {
          studentId, learningSubmissionId, versionNumber, questionNumber
        }) || !['OPEN', 'CAPACITY_REACHED'].includes(replay.status)
            || replay.forkedFromThreadId !== parentThreadId) {
          throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
        }
        try {
          validateTutorSnapshotRecord(replayAggregate.snapshot);
          assertMemoryTutorSourceIsLive(this, replayAggregate.snapshot);
        } catch (error) {
          if (error instanceof TutorStoreError) {
            throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
          }
          throw error;
        }
        return clone({ thread: replay, replayed: true });
      }

      const parent = memoryTutorThreadAggregate(this, parentThreadId);
      if (!memoryTutorAggregateMatchesPath(parent, {
        studentId, learningSubmissionId, versionNumber, questionNumber
      }) || parent.thread.status === 'TOMBSTONED') {
        throw new TutorStoreError('TUTOR_ROOT_NOT_AVAILABLE');
      }
      validateTutorSnapshotRecord(parent.snapshot);
      assertMemoryTutorSourceIsLive(this, parent.snapshot);
      tutorPriorTurns(parent.jobs, parent.messages, parent.thread.successfulTurnCount);
      const parentHeadJob = parent.jobs.find((job) => job.status === 'SUCCEEDED'
        && job.turnNumber === parent.thread.successfulTurnCount);
      if (!parentHeadJob || parent.thread.successfulTurnCount < 1) {
        throw new TutorStoreError('INVALID_TUTOR_FORK');
      }
      assertMemoryTutorThreadCapacity(this, {
        studentId,
        learningSubmissionVersionId: parent.snapshot.learningSubmissionVersionId,
        questionNumber: parent.snapshot.questionNumber
      });
      if (this.tutorThreads.has(threadId)) {
        throw new TutorStoreError('TUTOR_THREAD_ID_CONFLICT');
      }
      const thread = buildTutorForkThreadRecord({
        id: threadId, studentId, snapshot: parent.snapshot,
        parentThread: parent.thread, parentHeadJob,
        creationIdempotencyKeyHash, creationRequestHash, createdAt: now
      });
      this.tutorThreads.set(thread.id, clone(thread));
      return clone({ thread, replayed: false });
    });
  }

  async getTutorThreadBundle(studentId, threadId) {
    const aggregate = memoryTutorThreadAggregate(this, threadId);
    if (!aggregate.thread || aggregate.thread.studentId !== studentId
        || aggregate.thread.status === 'TOMBSTONED') return null;
    try {
      validateTutorSnapshotRecord(aggregate.snapshot);
      assertMemoryTutorSourceIsLive(this, aggregate.snapshot);
    } catch {
      return null;
    }
    return projectTutorThreadBundle({
      ...aggregate,
      messages: aggregate.messages.sort((left, right) =>
        new Date(left.createdAt) - new Date(right.createdAt) || left.id.localeCompare(right.id))
    });
  }

  async listTutorThreadBundles(studentId, learningSubmissionId, versionNumber, questionNumber) {
    const bundles = [];
    for (const thread of this.tutorThreads.values()) {
      const aggregate = memoryTutorThreadAggregate(this, thread.id);
      if (thread.status === 'TOMBSTONED'
          || !memoryTutorAggregateMatchesPath(aggregate, {
            studentId, learningSubmissionId, versionNumber, questionNumber
          })) continue;
      try {
        validateTutorSnapshotRecord(aggregate.snapshot);
        assertMemoryTutorSourceIsLive(this, aggregate.snapshot);
      } catch (error) {
        if (error instanceof TutorStoreError) continue;
        throw error;
      }
      bundles.push(projectTutorThreadBundle({
        ...aggregate,
        messages: aggregate.messages.sort((left, right) =>
          new Date(left.createdAt) - new Date(right.createdAt) || left.id.localeCompare(right.id))
      }));
    }
    return clone(bundles.sort((left, right) =>
      new Date(right.thread.updatedAt) - new Date(left.thread.updatedAt)
        || left.thread.id.localeCompare(right.thread.id)));
  }

  async listTutorThreadSummaries(studentId, learningSubmissionId, versionNumber,
    questionNumber, page = {}) {
    const { limit, cursor } = validateTutorSummaryPage(page);
    const candidates = [];
    for (const thread of this.tutorThreads.values()) {
      const aggregate = memoryTutorThreadAggregate(this, thread.id);
      if (thread.status === 'TOMBSTONED'
          || !memoryTutorAggregateMatchesPath(aggregate, {
            studentId, learningSubmissionId, versionNumber, questionNumber
          })) continue;
      const updatedAtMs = new Date(thread.updatedAt).getTime();
      if (cursor) {
        const cursorMs = cursor.updatedAt.getTime();
        if (updatedAtMs > cursorMs
            || (updatedAtMs === cursorMs && thread.id >= cursor.threadId)) continue;
      }
      try {
        validateTutorSnapshotRecord(aggregate.snapshot);
      } catch {
        continue;
      }
      let sourceEntitled = false;
      try {
        assertMemoryTutorSourceIsLive(this, aggregate.snapshot);
        sourceEntitled = true;
      } catch (error) {
        if (!(error instanceof TutorStoreError)) throw error;
      }
      candidates.push({
        thread, snapshot: aggregate.snapshot, sourceEntitled,
        latestJob: sourceEntitled ? aggregate.jobs.at(-1) || null : null
      });
    }
    candidates.sort((left, right) =>
      new Date(right.thread.updatedAt) - new Date(left.thread.updatedAt)
        || right.thread.id.localeCompare(left.thread.id));
    return candidates.slice(0, limit + 1).map(projectTutorThreadSummary);
  }

  async enqueueTutorTurn({
    studentId, threadId, authorizedSessionId, idempotencyKey: rawIdempotencyKey,
    message, correlationId, jobId, messageId, priority = 100, maxAttempts = 3,
    providerBudget, now = new Date()
  }) {
    validateTutorQueueOptions({ priority, maxAttempts });
    return this.#withGlobalLock(async () => {
      const aggregate = memoryTutorThreadAggregate(this, threadId);
      const { thread, snapshot, jobs, messages } = aggregate;
      if (!thread || thread.studentId !== studentId) throw new TutorStoreError('TUTOR_THREAD_NOT_FOUND');
      const session = this.sessions.get(authorizedSessionId);
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_SESSION_NOT_LIVE');
      }
      if (!['OPEN', 'CAPACITY_REACHED'].includes(thread.status)) {
        throw new TutorStoreError('TUTOR_THREAD_NOT_AVAILABLE');
      }
      validateTutorSnapshotRecord(snapshot);
      assertMemoryTutorSourceIsLive(this, snapshot);
      const idempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const replay = jobs.find((candidate) => candidate.idempotencyKeyHash === idempotencyKeyHash);
      if (replay) {
        const priorTurns = tutorPriorTurns(jobs, messages, replay.turnNumber - 1);
        const replayMessage = this.tutorMessages.get(replay.requestMessageId);
        const candidate = buildTutorTurnRequest({
          correlationId: replay.correlationId, threadId, turnId: replay.id,
          turnNumber: replay.turnNumber,
          context: snapshot.snapshotPayload, priorTurns, message
        });
        if (!replayMessage || replayMessage.contentMarkdown !== message
            || replay.requestHash !== tutorRequestHash(candidate)) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        return clone({ job: replay, message: replayMessage, request: candidate, replayed: true });
      }
      if (thread.status !== 'OPEN') throw new TutorStoreError('FORK_REQUIRED');
      assertTutorEnqueueCapacity(thread, message);
      if (jobs.some((job) => ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(job.status))) {
        throw new TutorStoreError('TUTOR_THREAD_BUSY');
      }
      const activeForStudent = [...this.tutorTurnJobs.values()].filter((job) =>
        job.studentId === studentId && ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(job.status)).length;
      if (activeForStudent >= TUTOR_MAX_ACTIVE_JOBS_PER_STUDENT) {
        throw new TutorStoreError('TUTOR_STUDENT_CAPACITY_REACHED');
      }
      const turnNumber = thread.successfulTurnCount + 1;
      const requestOrdinal = thread.requestCount + 1;
      const actualJobId = jobId || randomUUID();
      const actualMessageId = messageId || randomUUID();
      if (this.tutorTurnJobs.has(actualJobId) || this.tutorMessages.has(actualMessageId)) {
        throw new TutorStoreError('TUTOR_TURN_ID_CONFLICT');
      }
      const priorTurns = tutorPriorTurns(jobs, messages, thread.successfulTurnCount);
      const request = buildTutorTurnRequest({
        correlationId, threadId, turnId: actualJobId, turnNumber,
        context: snapshot.snapshotPayload, priorTurns, message
      });
      const requestMessage = {
        id: actualMessageId, threadId, studentId, role: 'USER',
        contentMarkdown: message, contentSha256: tutorMessageHash(message),
        sourceTurnJobId: null, createdAt: now
      };
      const job = {
        id: actualJobId, threadId, studentId, requestMessageId: actualMessageId,
        requestOrdinal, turnNumber, retryOfJobId: null, retryAuthorization: null,
        responseMessageId: null, replySha256: null, authorizedSessionId,
        idempotencyKeyHash, requestHash: tutorRequestHash(request), correlationId,
        snapshotHash: request.snapshotHash, contextHash: request.contextHash,
        historyHash: request.historyHash, inputHash: request.inputHash,
        threadLineageHash: thread.threadLineageHash,
        tutorContractVersion: TUTOR_CONTRACT_VERSION,
        status: 'QUEUED', priority, attemptCount: 0, maxAttempts,
        availableAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        providerInvoked: false, deliveryDisposition: 'NOT_DISPATCHED',
        provider: null, requestedModel: null, responseModel: null,
        promptVersion: null, responseSchemaVersion: null, usage: null, latencyMs: null,
        outcomeCode: null, errorClass: null, retryable: false,
        deletionGeneration: thread.deletionGeneration,
        createdAt: now, startedAt: null, completedAt: null, updatedAt: now
      };
      buildAndValidateTutorRequest({ job, thread, snapshot, priorTurns, message });
      consumeMemoryTutorProviderBudget(this, { studentId, providerBudget, now });
      this.tutorMessages.set(actualMessageId, clone(requestMessage));
      this.tutorTurnJobs.set(actualJobId, clone(job));
      thread.requestCount = requestOrdinal;
      thread.threadRevision += 1;
      thread.status = nextTutorThreadStatus(thread);
      thread.updatedAt = now;
      return clone({ job, message: requestMessage, request, replayed: false });
    });
  }

  async retryTutorTurnExplicitly({
    studentId, threadId, previousJobId, authorizedSessionId,
    idempotencyKey: rawIdempotencyKey, correlationId, jobId, priority = 100,
    maxAttempts = 3, providerBudget, now = new Date()
  }) {
    validateTutorQueueOptions({ priority, maxAttempts });
    return this.#withGlobalLock(async () => {
      const aggregate = memoryTutorThreadAggregate(this, threadId);
      const { thread, snapshot, jobs, messages } = aggregate;
      const previous = this.tutorTurnJobs.get(previousJobId);
      const session = this.sessions.get(authorizedSessionId);
      if (!thread || thread.studentId !== studentId || !previous
          || previous.threadId !== threadId
          || !['FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED'].includes(previous.status)) {
        throw new TutorStoreError('TUTOR_RETRY_NOT_ALLOWED');
      }
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_SESSION_NOT_LIVE');
      }
      if (!['OPEN', 'CAPACITY_REACHED'].includes(thread.status)) {
        throw new TutorStoreError('TUTOR_THREAD_NOT_AVAILABLE');
      }
      validateTutorSnapshotRecord(snapshot);
      assertMemoryTutorSourceIsLive(this, snapshot);
      const idempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const replay = jobs.find((candidate) => candidate.idempotencyKeyHash === idempotencyKeyHash);
      if (replay) {
        const replayMessage = this.tutorMessages.get(replay.requestMessageId);
        const request = replayMessage && buildAndValidateTutorRequest({
          job: replay, thread, snapshot,
          priorTurns: tutorPriorTurns(jobs, messages, replay.turnNumber - 1),
          message: replayMessage.contentMarkdown
        });
        if (!request || replay.retryOfJobId !== previousJobId
            || replay.requestHash !== tutorRequestHash(request)) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        return clone({ job: replay, request, replayed: true });
      }
      if (thread.status !== 'OPEN' || previous.turnNumber !== thread.successfulTurnCount + 1) {
        throw new TutorStoreError('FORK_REQUIRED');
      }
      if (jobs.some((candidate) => candidate.retryOfJobId === previousJobId)
          || jobs.some((candidate) => ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(candidate.status))) {
        throw new TutorStoreError('TUTOR_THREAD_BUSY');
      }
      const activeForStudent = [...this.tutorTurnJobs.values()].filter((candidate) =>
        candidate.studentId === studentId
          && ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(candidate.status)).length;
      if (activeForStudent >= TUTOR_MAX_ACTIVE_JOBS_PER_STUDENT) {
        throw new TutorStoreError('TUTOR_STUDENT_CAPACITY_REACHED');
      }
      const requestMessage = this.tutorMessages.get(previous.requestMessageId);
      assertTutorEnqueueCapacity(thread, requestMessage.contentMarkdown);
      const actualJobId = jobId || randomUUID();
      if (this.tutorTurnJobs.has(actualJobId)) throw new TutorStoreError('TUTOR_TURN_ID_CONFLICT');
      const requestOrdinal = thread.requestCount + 1;
      const priorTurns = tutorPriorTurns(jobs, messages, thread.successfulTurnCount);
      const request = buildTutorTurnRequest({
        correlationId, threadId, turnId: actualJobId, turnNumber: previous.turnNumber,
        context: snapshot.snapshotPayload, priorTurns, message: requestMessage.contentMarkdown
      });
      const job = {
        ...clone(previous), id: actualJobId, requestOrdinal,
        retryOfJobId: previous.id, retryAuthorization: 'STUDENT_EXPLICIT',
        authorizedSessionId, idempotencyKeyHash, correlationId,
        requestHash: tutorRequestHash(request), historyHash: request.historyHash,
        inputHash: request.inputHash, status: 'QUEUED', attemptCount: 0, maxAttempts,
        priority, availableAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        providerInvoked: false, deliveryDisposition: 'NOT_DISPATCHED',
        provider: null, requestedModel: null, responseModel: null,
        promptVersion: null, responseSchemaVersion: null, usage: null, latencyMs: null,
        outcomeCode: null, errorClass: null, retryable: false,
        responseMessageId: null, replySha256: null,
        deletionGeneration: thread.deletionGeneration,
        createdAt: now, startedAt: null, completedAt: null, updatedAt: now
      };
      buildAndValidateTutorRequest({
        job, thread, snapshot, priorTurns, message: requestMessage.contentMarkdown
      });
      consumeMemoryTutorProviderBudget(this, { studentId, providerBudget, now });
      this.tutorTurnJobs.set(actualJobId, clone(job));
      thread.requestCount = requestOrdinal;
      thread.threadRevision += 1;
      thread.status = nextTutorThreadStatus(thread);
      thread.updatedAt = now;
      return clone({ job, request, replayed: false });
    });
  }

  async retryTutorTurnByOrdinal({
    studentId, learningSubmissionId, versionNumber, questionNumber,
    threadId, requestOrdinal: previousRequestOrdinal, authorizedSessionId,
    idempotencyKey: rawIdempotencyKey, correlationId, jobId,
    priority = 100, maxAttempts = 3, providerBudget, now = new Date()
  }) {
    validateTutorQueueOptions({ priority, maxAttempts });
    return this.#withGlobalLock(async () => {
      const aggregate = memoryTutorThreadAggregate(this, threadId);
      const { thread, snapshot, jobs, messages } = aggregate;
      const previous = jobs.find((candidate) =>
        candidate.requestOrdinal === previousRequestOrdinal);
      if (!memoryTutorAggregateMatchesPath(aggregate, {
        studentId, learningSubmissionId, versionNumber, questionNumber
      }) || !previous
          || !['FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED'].includes(previous.status)) {
        throw new TutorStoreError('TUTOR_RETRY_NOT_ALLOWED');
      }
      const session = this.sessions.get(authorizedSessionId);
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_SESSION_NOT_LIVE');
      }
      if (!['OPEN', 'CAPACITY_REACHED'].includes(thread.status)) {
        throw new TutorStoreError('TUTOR_THREAD_NOT_AVAILABLE');
      }
      validateTutorSnapshotRecord(snapshot);
      assertMemoryTutorSourceIsLive(this, snapshot);
      const idempotencyKeyHash = tutorSha256(rawIdempotencyKey);
      const replay = jobs.find((candidate) =>
        candidate.idempotencyKeyHash === idempotencyKeyHash);
      if (replay) {
        const replayMessage = this.tutorMessages.get(replay.requestMessageId);
        const request = replayMessage && buildAndValidateTutorRequest({
          job: replay, thread, snapshot,
          priorTurns: tutorPriorTurns(jobs, messages, replay.turnNumber - 1),
          message: replayMessage.contentMarkdown
        });
        if (!request || replay.retryOfJobId !== previous.id
            || replay.requestHash !== tutorRequestHash(request)) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        return clone({ job: replay, request, replayed: true });
      }
      if (thread.status !== 'OPEN' || previous.turnNumber !== thread.successfulTurnCount + 1) {
        throw new TutorStoreError('FORK_REQUIRED');
      }
      if (jobs.some((candidate) => candidate.retryOfJobId === previous.id)
          || jobs.some((candidate) => ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(candidate.status))) {
        throw new TutorStoreError('TUTOR_THREAD_BUSY');
      }
      const activeForStudent = [...this.tutorTurnJobs.values()].filter((candidate) =>
        candidate.studentId === studentId
          && ['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(candidate.status)).length;
      if (activeForStudent >= TUTOR_MAX_ACTIVE_JOBS_PER_STUDENT) {
        throw new TutorStoreError('TUTOR_STUDENT_CAPACITY_REACHED');
      }
      const requestMessage = this.tutorMessages.get(previous.requestMessageId);
      if (!requestMessage) throw new TutorStoreError('INCOMPLETE_TUTOR_HISTORY');
      assertTutorEnqueueCapacity(thread, requestMessage.contentMarkdown);
      const actualJobId = jobId || randomUUID();
      if (this.tutorTurnJobs.has(actualJobId)) {
        throw new TutorStoreError('TUTOR_TURN_ID_CONFLICT');
      }
      const nextRequestOrdinal = thread.requestCount + 1;
      const priorTurns = tutorPriorTurns(jobs, messages, thread.successfulTurnCount);
      const request = buildTutorTurnRequest({
        correlationId, threadId, turnId: actualJobId, turnNumber: previous.turnNumber,
        context: snapshot.snapshotPayload, priorTurns,
        message: requestMessage.contentMarkdown
      });
      const job = {
        ...clone(previous), id: actualJobId, requestOrdinal: nextRequestOrdinal,
        retryOfJobId: previous.id, retryAuthorization: 'STUDENT_EXPLICIT',
        authorizedSessionId, idempotencyKeyHash, correlationId,
        requestHash: tutorRequestHash(request), historyHash: request.historyHash,
        inputHash: request.inputHash, status: 'QUEUED', attemptCount: 0, maxAttempts,
        priority, availableAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        providerInvoked: false, deliveryDisposition: 'NOT_DISPATCHED',
        provider: null, requestedModel: null, responseModel: null,
        promptVersion: null, responseSchemaVersion: null, usage: null, latencyMs: null,
        outcomeCode: null, errorClass: null, retryable: false,
        responseMessageId: null, replySha256: null,
        deletionGeneration: thread.deletionGeneration,
        createdAt: now, startedAt: null, completedAt: null, updatedAt: now
      };
      buildAndValidateTutorRequest({
        job, thread, snapshot, priorTurns, message: requestMessage.contentMarkdown
      });
      consumeMemoryTutorProviderBudget(this, { studentId, providerBudget, now });
      this.tutorTurnJobs.set(actualJobId, clone(job));
      thread.requestCount = nextRequestOrdinal;
      thread.threadRevision += 1;
      thread.status = nextTutorThreadStatus(thread);
      thread.updatedAt = now;
      return clone({ job, request, replayed: false });
    });
  }

  async claimTutorTurnJob({ workerId, leaseMs, now = new Date() }) {
    validateTutorClaimOptions({ workerId, leaseMs });
    return this.#withGlobalLock(async () => {
      const nowMs = new Date(now).getTime();
      for (const job of this.tutorTurnJobs.values()) {
        if (job.status !== 'RUNNING' || new Date(job.leaseExpiresAt).getTime() > nowMs) continue;
        const expiry = tutorLeaseExpiryStatus(job);
        if (expiry === 'DELIVERY_UNKNOWN') {
          Object.assign(job, {
            status: 'DELIVERY_UNKNOWN', retryable: false, outcomeCode: 'DELIVERY_UNKNOWN',
            errorClass: 'transient',
            completedAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
        } else if (expiry === 'RETRY_WAIT' && job.attemptCount < job.maxAttempts) {
          Object.assign(job, {
            status: 'RETRY_WAIT', retryable: true, availableAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
        } else {
          Object.assign(job, {
            status: 'FAILED', retryable: false,
            outcomeCode: 'ATTEMPTS_EXHAUSTED', errorClass: 'transient',
            completedAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
        }
      }
      const candidates = [...this.tutorTurnJobs.values()]
        .filter((job) => ['QUEUED', 'RETRY_WAIT'].includes(job.status))
        .sort((left, right) => {
          const leftDue = new Date(left.availableAt).getTime() <= nowMs ? 0 : 1;
          const rightDue = new Date(right.availableAt).getTime() <= nowMs ? 0 : 1;
          return leftDue - rightDue || right.priority - left.priority
          || new Date(left.availableAt) - new Date(right.availableAt)
          || new Date(left.createdAt) - new Date(right.createdAt)
          || left.id.localeCompare(right.id);
        });
      for (const job of candidates) {
        const aggregate = memoryTutorThreadAggregate(this, job.threadId);
        const { thread, snapshot, jobs, messages } = aggregate;
        const session = this.sessions.get(job.authorizedSessionId);
        const threadIsLive = Boolean(thread && snapshot
          && ['OPEN', 'CAPACITY_REACHED'].includes(thread.status)
          && thread.deletionGeneration === job.deletionGeneration);
        const sessionIsLive = Boolean(session && session.studentId === job.studentId
          && !session.revokedAt && new Date(session.expiresAt).getTime() > nowMs);
        let sourceIsLive = false;
        if (threadIsLive && sessionIsLive) {
          try {
            assertMemoryTutorSourceIsLive(this, snapshot);
            sourceIsLive = true;
          } catch (error) {
            if (!(error instanceof TutorStoreError)) throw error;
          }
        }
        if (!threadIsLive || !sessionIsLive || !sourceIsLive) {
          Object.assign(job, {
            status: 'CANCELLED', retryable: false, outcomeCode: 'CANCELLED',
            errorClass: 'permanent', completedAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
          continue;
        }
        if (new Date(job.availableAt).getTime() > nowMs
            || job.attemptCount >= job.maxAttempts) continue;
        const requestMessage = this.tutorMessages.get(job.requestMessageId);
        if (!requestMessage) throw new TutorStoreError('INCOMPLETE_TUTOR_HISTORY');
        const priorTurns = tutorPriorTurns(jobs, messages, job.turnNumber - 1);
        const request = buildAndValidateTutorRequest({
          job, thread, snapshot, priorTurns, message: requestMessage.contentMarkdown
        });
        const leaseToken = randomUUID();
        Object.assign(job, {
          status: 'RUNNING', attemptCount: job.attemptCount + 1,
          leaseOwner: workerId, leaseToken,
          leaseExpiresAt: new Date(nowMs + leaseMs), startedAt: job.startedAt || now,
          providerInvoked: false, deliveryDisposition: 'NOT_DISPATCHED', retryable: false,
          provider: null, requestedModel: null, responseModel: null,
          promptVersion: null, responseSchemaVersion: null, usage: null, latencyMs: null,
          outcomeCode: null, errorClass: null, updatedAt: now
        });
        return clone({ job, thread, snapshot, request });
      }
      return null;
    });
  }

  async markTutorTurnDispatched(input) {
    return this.#withGlobalLock(async () => {
      const now = input.now || new Date();
      const aggregate = memoryTutorThreadAggregate(this, input.threadId
        || this.tutorTurnJobs.get(input.jobId)?.threadId);
      const job = validMemoryTutorWorkerFence(this, aggregate, input, now);
      if (!job || job.providerInvoked || job.deliveryDisposition !== 'NOT_DISPATCHED') return false;
      const requestMessage = this.tutorMessages.get(job.requestMessageId);
      const priorTurns = tutorPriorTurns(aggregate.jobs, aggregate.messages, job.turnNumber - 1);
      buildAndValidateTutorRequest({
        job, thread: aggregate.thread, snapshot: aggregate.snapshot,
        priorTurns, message: requestMessage.contentMarkdown
      });
      const metadata = tutorDispatchMetadata(input);
      Object.assign(job, {
        providerInvoked: true, deliveryDisposition: 'MAY_HAVE_BEEN_DELIVERED',
        ...metadata, updatedAt: now
      });
      return true;
    });
  }

  async recordTutorKnownNoResult(input) {
    validateTutorRetryAfterMs(input.retryAfterMs);
    return this.#withGlobalLock(async () => {
      const now = input.now || new Date();
      const aggregate = memoryTutorThreadAggregate(this,
        this.tutorTurnJobs.get(input.jobId)?.threadId);
      const job = validMemoryTutorWorkerFence(this, aggregate, input, now);
      if (!job || !job.providerInvoked
          || job.deliveryDisposition !== 'MAY_HAVE_BEEN_DELIVERED') return false;
      const retry = input.retryable !== false && job.attemptCount < job.maxAttempts;
      Object.assign(job, {
        status: retry ? 'RETRY_WAIT' : 'FAILED',
        deliveryDisposition: 'KNOWN_NO_RESULT', retryable: retry,
        availableAt: new Date(new Date(now).getTime() + input.retryAfterMs),
        outcomeCode: input.outcomeCode || (retry ? null : 'KNOWN_NO_RESULT'),
        errorClass: input.errorClass || 'transient',
        completedAt: retry ? null : now, updatedAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null
      });
      return true;
    });
  }

  async recordTutorDeliveryUnknown(input) {
    return this.#withGlobalLock(async () => {
      const now = input.now || new Date();
      const aggregate = memoryTutorThreadAggregate(this,
        this.tutorTurnJobs.get(input.jobId)?.threadId);
      const job = validMemoryTutorWorkerFence(this, aggregate, input, now);
      if (!job || !job.providerInvoked
          || job.deliveryDisposition !== 'MAY_HAVE_BEEN_DELIVERED') return false;
      Object.assign(job, {
        status: 'DELIVERY_UNKNOWN', retryable: false, outcomeCode: 'DELIVERY_UNKNOWN',
        errorClass: input.errorClass || 'transient', completedAt: now, updatedAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null
      });
      return true;
    });
  }

  async completeTutorTurnJob(input) {
    return this.#withGlobalLock(async () => {
      const now = input.now || new Date();
      const aggregate = memoryTutorThreadAggregate(this,
        this.tutorTurnJobs.get(input.jobId)?.threadId);
      const job = validMemoryTutorWorkerFence(this, aggregate, input, now);
      if (!job || !job.providerInvoked
          || job.deliveryDisposition !== 'MAY_HAVE_BEEN_DELIVERED') return false;
      const requestMessage = this.tutorMessages.get(job.requestMessageId);
      const priorTurns = tutorPriorTurns(aggregate.jobs, aggregate.messages, job.turnNumber - 1);
      const request = buildAndValidateTutorRequest({
        job, thread: aggregate.thread, snapshot: aggregate.snapshot,
        priorTurns, message: requestMessage.contentMarkdown
      });
      const validated = validateTutorGatewaySuccess({
        gatewayResult: input.gatewayResult, request, job, latencyMs: input.latencyMs
      });
      const historyBytes = aggregate.thread.successfulHistoryBytes
        + Buffer.byteLength(requestMessage.contentMarkdown, 'utf8') + validated.replyBytes;
      if (historyBytes > TUTOR_MAX_HISTORY_BYTES) throw new TutorStoreError('FORK_REQUIRED');
      const metadata = validated.runMetadata;
      const assistantMessageId = input.assistantMessageId || randomUUID();
      if (this.tutorMessages.has(assistantMessageId)) {
        throw new TutorStoreError('TUTOR_MESSAGE_ID_CONFLICT');
      }
      const assistant = {
        id: assistantMessageId, threadId: job.threadId, studentId: job.studentId,
        role: 'ASSISTANT', contentMarkdown: validated.replyMarkdown,
        contentSha256: validated.replyHash, sourceTurnJobId: job.id, createdAt: now
      };
      Object.assign(job, {
        status: 'SUCCEEDED', responseMessageId: assistantMessageId,
        replySha256: validated.replyHash, deliveryDisposition: 'DELIVERED_RESULT',
        responseModel: metadata.responseModel, usage: clone(metadata.usage),
        latencyMs: metadata.latencyMs, retryable: false,
        outcomeCode: null, errorClass: null, completedAt: now, updatedAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null
      });
      this.tutorMessages.set(assistantMessageId, clone(assistant));
      aggregate.thread.successfulTurnCount += 1;
      aggregate.thread.successfulHistoryBytes = historyBytes;
      aggregate.thread.threadRevision += 1;
      aggregate.thread.status = nextTutorThreadStatus(aggregate.thread);
      aggregate.thread.updatedAt = now;
      return clone({ job, message: assistant, thread: aggregate.thread });
    });
  }

  async tombstoneTutorThread({ studentId, threadId, now = new Date() }) {
    return this.#withGlobalLock(async () => {
      const aggregate = memoryTutorThreadAggregate(this, threadId);
      const { thread } = aggregate;
      if (!thread || thread.studentId !== studentId) return false;
      if (thread.status === 'TOMBSTONED') return true;
      for (const job of aggregate.jobs) {
        if (!['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(job.status)) continue;
        if (job.providerInvoked && job.deliveryDisposition === 'MAY_HAVE_BEEN_DELIVERED') {
          Object.assign(job, {
            status: 'DELIVERY_UNKNOWN', retryable: false, outcomeCode: 'DELIVERY_UNKNOWN',
            completedAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
        } else {
          Object.assign(job, {
            status: 'CANCELLED', retryable: false, outcomeCode: 'CANCELLED',
            completedAt: now, updatedAt: now,
            leaseOwner: null, leaseToken: null, leaseExpiresAt: null
          });
        }
      }
      thread.status = 'TOMBSTONED';
      thread.deletionGeneration += 1;
      thread.threadRevision += 1;
      thread.tombstonedAt = now;
      thread.updatedAt = now;
      return true;
    });
  }

  async tombstoneTutorThreadByPath({
    studentId, authorizedSessionId, learningSubmissionId, versionNumber,
    questionNumber, threadId, idempotencyKey: rawIdempotencyKey,
    now = new Date()
  }) {
    return this.#withGlobalLock(async () => {
      const session = this.sessions.get(authorizedSessionId);
      if (!session || session.studentId !== studentId || session.revokedAt
          || new Date(session.expiresAt).getTime() <= new Date(now).getTime()) {
        throw new TutorStoreError('TUTOR_SESSION_NOT_LIVE');
      }
      const keyHash = tutorSha256(rawIdempotencyKey);
      const scope = 'question-tutor-thread-tombstone-v1';
      const recordKey = idempotencyKey(studentId, scope, keyHash);
      const requestHash = tutorThreadTombstoneRequestHash({
        studentId, learningSubmissionId, versionNumber, questionNumber, threadId
      });
      const replay = this.idempotency.get(recordKey);
      if (replay) {
        if (replay.requestHash !== requestHash) {
          throw new TutorStoreError('IDEMPOTENCY_KEY_REUSED');
        }
        return true;
      }
      const aggregate = memoryTutorThreadAggregate(this, threadId);
      if (!memoryTutorAggregateMatchesPath(aggregate, {
        studentId, learningSubmissionId, versionNumber, questionNumber
      })) return false;
      if (aggregate.thread.status !== 'TOMBSTONED') {
        for (const job of aggregate.jobs) {
          if (!['QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(job.status)) continue;
          if (job.providerInvoked && job.deliveryDisposition === 'MAY_HAVE_BEEN_DELIVERED') {
            Object.assign(job, {
              status: 'DELIVERY_UNKNOWN', retryable: false,
              outcomeCode: 'DELIVERY_UNKNOWN', errorClass: 'transient',
              completedAt: now, updatedAt: now,
              leaseOwner: null, leaseToken: null, leaseExpiresAt: null
            });
          } else {
            Object.assign(job, {
              status: 'CANCELLED', retryable: false,
              outcomeCode: 'CANCELLED', errorClass: 'permanent',
              completedAt: now, updatedAt: now,
              leaseOwner: null, leaseToken: null, leaseExpiresAt: null
            });
          }
        }
        Object.assign(aggregate.thread, {
          status: 'TOMBSTONED',
          deletionGeneration: aggregate.thread.deletionGeneration + 1,
          threadRevision: aggregate.thread.threadRevision + 1,
          tombstonedAt: now, updatedAt: now
        });
      }
      this.idempotency.set(recordKey, {
        studentId, scope, key: keyHash, requestHash,
        responseStatus: 204, responseBody: { threadId }, createdAt: now
      });
      return true;
    });
  }

  async withAttemptLock(attemptId, work) {
    // Match PostgreSQL's advisory(student, form) -> attempt-row lock order.
    // A single global mutex is sufficient for the deterministic in-memory
    // adapter and prevents reset/create from interleaving between phases.
    return this.#withGlobalLock(() => this.#withAttemptLockOnly(attemptId, work));
  }

  async #withAttemptLockOnly(attemptId, work) {
    const previous = this.attemptLocks.get(attemptId) || Promise.resolve();
    let release;
    const current = new Promise((resolve) => { release = resolve; });
    const queued = previous.then(() => current);
    this.attemptLocks.set(attemptId, queued);
    await previous;
    try {
      if (!this.attempts.has(attemptId)) return work(null);
      // Work on the live maps while the global mutex prevents observers, then
      // restore a full transaction checkpoint on failure. This gives the
      // deterministic adapter PostgreSQL-equivalent all-or-nothing behavior,
      // including failures after official scoring but before learning intent.
      const checkpoint = this.#transactionCheckpoint();
      try {
        return await work(new MemoryAttemptTransaction(this, attemptId));
      } catch (error) {
        this.#restoreTransactionCheckpoint(checkpoint);
        throw error;
      }
    } finally {
      release();
      if (this.attemptLocks.get(attemptId) === queued) this.attemptLocks.delete(attemptId);
    }
  }

  async #withGlobalLock(work) {
    const previous = this.globalLock;
    let release;
    this.globalLock = new Promise((resolve) => { release = resolve; });
    await previous;
    try {
      return await work();
    } finally {
      release();
    }
  }

  #transactionCheckpoint() {
    return {
      attempts: cloneMap(this.attempts),
      answers: cloneMap(this.answers),
      reasoningNotes: cloneMap(this.reasoningNotes),
      submissions: cloneMap(this.submissions),
      submissionAnswers: cloneMap(this.submissionAnswers),
      learningSubmissions: cloneMap(this.learningSubmissions),
      learningVersions: cloneMap(this.learningVersions),
      learningResponses: cloneMap(this.learningResponses),
      learningWorkItems: cloneMap(this.learningWorkItems),
      approvedContextSets: cloneMap(this.approvedContextSets),
      activeContextSetByForm: cloneMap(this.activeContextSetByForm),
      openReviewReleases: cloneMap(this.openReviewReleases),
      openReviewReleaseEvents: clone(this.openReviewReleaseEvents),
      analysisRuns: cloneMap(this.analysisRuns),
      questionAnalyses: cloneMap(this.questionAnalyses),
      learningReports: cloneMap(this.learningReports),
      learningBatches: cloneMap(this.learningBatches),
      learningBatchAssets: cloneMap(this.learningBatchAssets),
      learningBatchQuota: cloneMap(this.learningBatchQuota),
      learningBatchEvidence: cloneMap(this.learningBatchEvidence),
      learningBatchMappings: cloneMap(this.learningBatchMappings),
      learningBatchWorkItems: cloneMap(this.learningBatchWorkItems),
      learningBatchResults: cloneMap(this.learningBatchResults),
      learningBatchConfirmations: cloneMap(this.learningBatchConfirmations),
      studentResourceBudgetWindows: cloneMap(this.studentResourceBudgetWindows),
      globalResourceBudgetWindows: cloneMap(this.globalResourceBudgetWindows),
      studentProviderDispatchState: cloneMap(this.studentProviderDispatchState),
      learningBatchProviderArtifacts: cloneMap(this.learningBatchProviderArtifacts),
      learningBatchProviderOrphanAudit: clone(this.learningBatchProviderOrphanAudit),
      learningBatchProviderOrphanCleanupJobs: cloneMap(this.learningBatchProviderOrphanCleanupJobs),
      tutorSnapshots: cloneMap(this.tutorSnapshots),
      tutorThreads: cloneMap(this.tutorThreads),
      tutorMessages: cloneMap(this.tutorMessages),
      tutorTurnJobs: cloneMap(this.tutorTurnJobs),
      privateStorageCandidates: cloneMap(this.privateStorageCandidates),
      privateStorageReconciliationAudit: clone(this.privateStorageReconciliationAudit),
      events: cloneMap(this.events),
      idempotency: cloneMap(this.idempotency),
      aiDispatchState: clone(this.aiDispatchState)
    };
  }

  #restoreTransactionCheckpoint(checkpoint) {
    for (const [name, value] of Object.entries(checkpoint)) this[name] = value;
  }
}

class MemoryAttemptTransaction {
  constructor(store, attemptId) {
    this.store = store;
    this.attemptId = attemptId;
  }

  async getAttempt() {
    const attempt = this.store.attempts.get(this.attemptId);
    return attempt ? clone(attempt) : null;
  }

  async saveAttempt(attempt) {
    this.store.attempts.set(this.attemptId, clone(attempt));
    return clone(attempt);
  }

  async getAnswers() {
    return clone(this.store.answers.get(this.attemptId) || []);
  }

  async saveAnswers(answers) {
    this.store.answers.set(this.attemptId, clone(answers));
    return clone(answers);
  }

  async getReasoningNotes() {
    return clone(this.store.reasoningNotes.get(this.attemptId) || []);
  }

  async saveReasoningNotes(updates, updatedAt) {
    const byNumber = new Map((this.store.reasoningNotes.get(this.attemptId) || [])
      .map((note) => [note.questionNumber, note]));
    for (const update of updates) {
      if (update.reasoningText === '') {
        byNumber.delete(update.questionNumber);
      } else {
        byNumber.set(update.questionNumber, {
          questionNumber: update.questionNumber,
          reasoningText: update.reasoningText,
          updatedAt
        });
      }
    }
    const notes = [...byNumber.values()].sort((left, right) => left.questionNumber - right.questionNumber);
    this.store.reasoningNotes.set(this.attemptId, clone(notes));
    return clone(notes);
  }

  async listSubmissions() {
    return clone(this.store.submissions.get(this.attemptId) || []);
  }

  async getSubmission(submissionId) {
    return (this.store.submissions.get(this.attemptId) || []).find((item) => item.id === submissionId) || null;
  }

  async createSubmission(submission, snapshots) {
    const items = this.store.submissions.get(this.attemptId) || [];
    if (items.some((item) => item.slot === submission.slot)) {
      const error = new Error('Submission slot already exists.');
      error.code = 'SUBMISSION_SLOT_USED';
      throw error;
    }
    items.push(clone(submission));
    this.store.submissions.set(this.attemptId, items);
    this.store.submissionAnswers.set(submission.id, clone(snapshots));
    return clone(submission);
  }

  async getSubmissionAnswers(submissionId) {
    return clone(this.store.submissionAnswers.get(submissionId) || []);
  }

  async getLearningSubmissionBundle() {
    const submission = this.store.learningSubmissions.get(this.attemptId);
    if (!submission) return null;
    const versions = this.store.learningVersions.get(submission.id) || [];
    const version = versions.find((candidate) => candidate.versionNumber === submission.currentVersion);
    if (!version) throw new Error(`Learning submission ${submission.id} has no current version.`);
    const run = this.store.analysisRuns.get(version.id) || null;
    return clone({
      submission,
      version,
      responses: this.store.learningResponses.get(version.id) || [],
      workItems: this.store.learningWorkItems.get(version.id) || [],
      analysisRun: run,
      analyses: run ? this.store.questionAnalyses.get(run.id) || [] : [],
      report: this.store.learningReports.get(version.id) || null
    });
  }

  async getApprovedContextSetForForm(formId, formVersion) {
    const id = this.store.activeContextSetByForm.get(formKey(formId, formVersion));
    const context = id ? this.store.approvedContextSets.get(id) : null;
    return context?.sealed && context.questions?.length ? clone(context) : null;
  }

  async getCompleteApprovedContextSetForForm(formId, formVersion) {
    const form = this.store.forms.get(formKey(formId, formVersion));
    const id = this.store.activeContextSetByForm.get(formKey(formId, formVersion));
    const context = id ? this.store.approvedContextSets.get(id) : null;
    return context?.sealed && isCompleteBatchReviewContext(form, context) ? clone(context) : null;
  }

  async withApprovedContextFormLock(_formId, _formVersion, work) {
    // withAttemptLock already owns the adapter's global transaction mutex, so
    // context import and confirmation cannot interleave in memory.
    return work();
  }

  async getApprovedContextSetById(contextSetId) {
    const context = this.store.approvedContextSets.get(contextSetId);
    return context?.sealed && context.questions?.length ? clone(context) : null;
  }

  async getLearningEntitlement({ purpose = 'EXISTING_WORK' } = {}) {
    const submission = this.store.learningSubmissions.get(this.attemptId);
    if (!submission) return null;
    const release = submission.sourceType === 'OPEN_REVIEW'
      ? this.store.openReviewReleases.get(submission.openReviewReleaseId) : null;
    const cleanup = purpose === 'CLEANUP';
    const allowed = ['NEW_BATCH', 'EXISTING_WORK', 'CLEANUP'].includes(purpose)
      && validLearningEntitlement(this.store, submission, { cleanup, purpose })
      && (submission.sourceType !== 'OPEN_REVIEW'
        || (cleanup
          || (purpose === 'NEW_BATCH'
          ? release?.status === OPEN_REVIEW_STATUS.ACTIVE
          : [OPEN_REVIEW_STATUS.ACTIVE, OPEN_REVIEW_STATUS.SUPERSEDED_VALID].includes(release?.status))));
    return clone({
      allowed,
      sourceType: submission.sourceType,
      release: release || null,
      contextSetId: release?.contextSetId || null,
      submission
    });
  }

  async getLearningReportBundle() {
    return this.getLearningSubmissionBundle();
  }

  async createLearningSubmission({ submission, version, responses, workItem, analysisRun = null }) {
    if (this.store.learningSubmissions.has(this.attemptId)) {
      const error = new Error('A learning submission already exists for this attempt.');
      error.code = 'LEARNING_SUBMISSION_EXISTS';
      throw error;
    }
    if (submission.attemptId !== this.attemptId
      || version.learningSubmissionId !== submission.id
      || responses.some((response) => response.learningSubmissionVersionId !== version.id)
      || workItem.learningSubmissionVersionId !== version.id) {
      throw new Error('Invalid learning submission aggregate.');
    }
    this.store.learningSubmissions.set(this.attemptId, clone(submission));
    this.store.learningVersions.set(submission.id, [clone(version)]);
    this.store.learningResponses.set(version.id, clone(responses));
    this.store.learningWorkItems.set(version.id, [clone(workItem)]);
    if (analysisRun) this.store.analysisRuns.set(version.id, clone(analysisRun));
    return this.getLearningSubmissionBundle();
  }

  #learningBatchBundle(batchId) {
    const batch = this.store.learningBatches.get(batchId);
    if (!batch || batch.attemptId !== this.attemptId) return null;
    const revisions = this.store.learningBatchMappings.get(batchId) || [];
    const mapping = revisions.find((candidate) => candidate.revision === batch.mappingRevision) || null;
    return clone({
      batch,
      assets: this.store.learningBatchAssets.get(batchId) || [],
      evidence: this.store.learningBatchEvidence.get(batchId) || [],
      mapping,
      workItems: this.store.learningBatchWorkItems.get(batchId) || [],
      result: this.store.learningBatchResults.get(batchId) || null,
      confirmation: this.store.learningBatchConfirmations.get(batchId) || null,
      providerArtifacts: this.store.learningBatchProviderArtifacts.get(batchId) || []
    });
  }

  async getLearningBatchBundle(batchId) {
    return this.#learningBatchBundle(batchId);
  }

  async listLearningBatchBundles() {
    return [...this.store.learningBatches.values()]
      .filter((batch) => batch.attemptId === this.attemptId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((batch) => this.#learningBatchBundle(batch.id));
  }

  async createLearningBatch({
    batch, assets, reservations, studentQuotaBytes, globalQuotaBytes, activeBatchLimit
  }) {
    const learning = this.store.learningSubmissions.get(this.attemptId);
    if (!learning || batch.attemptId !== this.attemptId || batch.learningSubmissionId !== learning.id
        || batch.sourceType !== learning.sourceType
        || !validBatchEntitlement(this.store, batch, learning, { purpose: 'NEW_BATCH' })
        || assets.length !== reservations.length || assets.some((asset) => asset.batchId !== batch.id)
        || reservations.some((reservation) => reservation.batchId !== batch.id
          || reservation.studentId !== batch.studentId)) {
      throw new Error('Invalid learning batch aggregate.');
    }
    const activeReservations = [...this.store.learningBatchQuota.values()]
      .filter((reservation) => reservation.status !== 'RELEASED');
    const activeBatchCount = [...this.store.learningBatches.values()]
      .filter((candidate) => candidate.studentId === batch.studentId
        && candidate.deletionState === 'ACTIVE'
        && !['COMMITTED', 'FAILED'].includes(candidate.status)).length;
    if (activeBatchCount >= activeBatchLimit) {
      throw Object.assign(new Error('Student active batch limit exceeded.'), { code: 'BATCH_ACTIVE_LIMIT' });
    }
    const requestedBytes = reservations.reduce((sum, reservation) => sum + reservation.reservedBytes, 0);
    const studentBytes = activeReservations
      .filter((reservation) => reservation.studentId === batch.studentId)
      .reduce((sum, reservation) => sum + reservation.reservedBytes, 0);
    const globalBytes = activeReservations.reduce((sum, reservation) => sum + reservation.reservedBytes, 0);
    if (studentBytes + requestedBytes > studentQuotaBytes || globalBytes + requestedBytes > globalQuotaBytes) {
      const error = new Error('Persistent private upload quota exceeded.');
      error.code = 'BATCH_QUOTA_EXCEEDED';
      throw error;
    }
    this.store.learningBatches.set(batch.id, clone(batch));
    this.store.learningBatchAssets.set(batch.id, clone(assets));
    this.store.learningBatchEvidence.set(batch.id, []);
    this.store.learningBatchMappings.set(batch.id, []);
    this.store.learningBatchWorkItems.set(batch.id, []);
    this.store.learningBatchProviderArtifacts.set(batch.id, []);
    for (const reservation of reservations) this.store.learningBatchQuota.set(reservation.assetId, clone(reservation));
    return this.#learningBatchBundle(batch.id);
  }

  async beginLearningBatchAssetUpload({ batchId, assetId, uploadIdempotencyKey, now }) {
    const batch = this.store.learningBatches.get(batchId);
    const learning = batch && this.store.learningSubmissions.get(this.attemptId);
    const assets = this.store.learningBatchAssets.get(batchId) || [];
    const asset = assets.find((candidate) => candidate.id === assetId);
    if (!batch || batch.attemptId !== this.attemptId || !asset
        || !validBatchMutationEntitlement(this.store, batch, learning)) return null;
    if (batch.deletionState !== 'ACTIVE' || batch.status !== 'DRAFT') {
      const error = new Error('Batch does not accept uploads.');
      error.code = 'BATCH_NOT_UPLOADABLE';
      throw error;
    }
    if (asset.uploadIdempotencyKey && asset.uploadIdempotencyKey !== uploadIdempotencyKey) {
      const error = new Error('Asset upload idempotency key was reused.');
      error.code = 'IDEMPOTENCY_KEY_REUSED';
      throw error;
    }
    if (['STORED', 'NORMALIZED'].includes(asset.status)) {
      return { replay: true, asset: clone(asset), deletionGeneration: batch.deletionGeneration };
    }
    if (asset.status === 'WRITING') {
      const error = new Error('Asset upload is already in progress.');
      error.code = 'UPLOAD_IN_PROGRESS';
      throw error;
    }
    if (asset.status !== 'RESERVED') {
      const error = new Error('Asset upload cannot be retried in its current state.');
      error.code = 'BATCH_NOT_UPLOADABLE';
      throw error;
    }
    Object.assign(asset, {
      status: 'WRITING', uploadIdempotencyKey, uploadAttemptCount: asset.uploadAttemptCount + 1,
      writingStartedAt: now, lastErrorCode: null, updatedAt: now
    });
    return { replay: false, asset: clone(asset), deletionGeneration: batch.deletionGeneration };
  }

  async completeLearningBatchAssetUpload({
    batchId, assetId, uploadIdempotencyKey, deletionGeneration, stored, normalizedText, now
  }) {
    const batch = this.store.learningBatches.get(batchId);
    const learning = batch && this.store.learningSubmissions.get(this.attemptId);
    const assets = this.store.learningBatchAssets.get(batchId) || [];
    const asset = assets.find((candidate) => candidate.id === assetId);
    if (!batch || !asset || batch.attemptId !== this.attemptId || batch.deletionState !== 'ACTIVE'
        || !validBatchMutationEntitlement(this.store, batch, learning)
        || batch.deletionGeneration !== deletionGeneration || asset.status !== 'WRITING'
        || asset.uploadIdempotencyKey !== uploadIdempotencyKey
        || this.store.privateStorageCandidates.get(`OBJECT:${stored.storageKey}`)?.status === 'DELETING') return false;
    Object.assign(asset, {
      observedBytes: stored.observedBytes, sha256: stored.sha256, storageKey: stored.storageKey,
      status: asset.kind === 'TEXT' ? 'NORMALIZED' : 'STORED', writingStartedAt: null,
      storedAt: now, normalizedAt: asset.kind === 'TEXT' ? now : null, updatedAt: now
    });
    const reservation = this.store.learningBatchQuota.get(asset.id);
    Object.assign(reservation, { status: 'CONSUMED', consumedAt: now });
    if (asset.kind === 'TEXT') {
      const evidence = this.store.learningBatchEvidence.get(batch.id) || [];
      evidence.push({
        assetId: asset.id, batchId: batch.id, position: asset.position, sourceKind: 'TEXT_UPLOAD',
        normalizedText, normalizedSha256: stored.sha256, durationMs: null,
        transcriptConfidence: null, createdAt: now, purgedAt: null
      });
      this.store.learningBatchEvidence.set(batch.id, evidence);
    }
    batch.updatedAt = now;
    return clone(asset);
  }

  async failLearningBatchAssetUpload({ batchId, assetId, uploadIdempotencyKey, errorCode, now }) {
    const batch = this.store.learningBatches.get(batchId);
    const asset = (this.store.learningBatchAssets.get(batchId) || []).find((candidate) => candidate.id === assetId);
    if (!batch || !asset || batch.attemptId !== this.attemptId || asset.status !== 'WRITING'
        || asset.uploadIdempotencyKey !== uploadIdempotencyKey) return false;
    Object.assign(asset, {
      status: 'RESERVED', writingStartedAt: null, uploadIdempotencyKey: null,
      lastErrorCode: errorCode, updatedAt: now
    });
    return true;
  }

  async submitLearningBatch({ batchId, workItems, now }) {
    const batch = this.store.learningBatches.get(batchId);
    const learning = batch && this.store.learningSubmissions.get(this.attemptId);
    const assets = this.store.learningBatchAssets.get(batchId) || [];
    if (!batch || batch.attemptId !== this.attemptId
        || !validBatchMutationEntitlement(this.store, batch, learning)) return null;
    if (batch.status !== 'DRAFT' || batch.deletionState !== 'ACTIVE'
        || assets.some((asset) => !['NORMALIZED', 'STORED'].includes(asset.status))) {
      const error = new Error('Every reserved asset must be uploaded before submission.');
      error.code = 'BATCH_NOT_SUBMITTABLE';
      throw error;
    }
    batch.status = 'PROCESSING';
    batch.submittedAt = now;
    batch.updatedAt = now;
    this.store.learningBatchWorkItems.set(batch.id, clone(workItems));
    this.store.learningBatchProviderArtifacts.set(batch.id, assets
      .filter((asset) => asset.kind === 'AUDIO')
      .map((asset) => ({
        id: randomUUID(), batchId: batch.id, assetId: asset.id, provider: 'assemblyai',
        artifactType: 'TRANSCRIPT', externalId: null, uploadUrlHash: null,
        status: 'INTENT_RECORDED', submittedAt: null,
        uploadCallId: null, uploadCallStartedAt: null,
        submitCallId: null, submitCallStartedAt: null,
        reconciliationAttemptCount: 0, lastReconciliationAt: null,
        pollAttemptCount: 0, pollStartedAt: null,
        deletionEvidenceCode: null, deleteAttemptCount: 0, lastDeleteAttemptAt: null,
        lastDeleteErrorCode: null, nextDeleteAttemptAt: null,
        providerRetentionNotBefore: null, retentionProfile: null,
        retentionPolicyDelayMs: null, uploadRequestMaxDurationMs: null,
        retentionProcessingSlackMs: null, retentionWindowElapsedAt: null,
        retentionVerificationCode: null, retentionVerifiedAt: null,
        createdAt: now, updatedAt: now, deletionEvidencedAt: null
      })));
    return this.#learningBatchBundle(batch.id);
  }

  async saveLearningBatchMapping({ batchId, mapping, workerFence, now }) {
    const batch = this.store.learningBatches.get(batchId);
    const learning = batch && this.store.learningSubmissions.get(this.attemptId);
    const work = (this.store.learningBatchWorkItems.get(batchId) || [])
      .find((item) => item.workType === 'BATCH_EXTRACTION');
    if (!batch || batch.attemptId !== this.attemptId || batch.deletionState !== 'ACTIVE'
        || !validBatchMutationEntitlement(this.store, batch, learning)
        || batch.status !== 'PROCESSING' || mapping.revision !== batch.mappingRevision + 1
        || !work || work.status !== 'RUNNING' || work.leaseOwner !== workerFence?.workerId
        || work.leaseToken !== workerFence?.leaseToken || work.inputHash !== workerFence?.inputHash
        || work.deletionGeneration !== workerFence?.deletionGeneration
        || work.deletionGeneration !== batch.deletionGeneration
        || new Date(work.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
    const revisions = this.store.learningBatchMappings.get(batch.id) || [];
    revisions.push(clone(mapping));
    this.store.learningBatchMappings.set(batch.id, revisions);
    batch.mappingRevision = mapping.revision;
    batch.status = mapping.status;
    batch.updatedAt = now;
    Object.assign(work, {
      status: 'SUCCEEDED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null, updatedAt: now
    });
    return true;
  }

  async commitLearningBatch({ batchId, expectedMappingRevision, aggregate, now }) {
    const batch = this.store.learningBatches.get(batchId);
    const learning = this.store.learningSubmissions.get(this.attemptId);
    const revisions = this.store.learningBatchMappings.get(batchId) || [];
    const mapping = revisions.find((candidate) => candidate.revision === expectedMappingRevision);
    if (!batch || !learning || !mapping || batch.attemptId !== this.attemptId
        || !validBatchMutationEntitlement(this.store, batch, learning)
        || batch.learningSubmissionId !== learning.id || learning.currentVersion !== batch.baseVersion
        || learning.lifecycleStatus !== 'COMMITTED' || learning.studentId !== batch.studentId
        || learning.formId !== batch.formId || learning.formVersion !== batch.formVersion
        || batch.deletionState !== 'ACTIVE' || batch.status !== 'NEEDS_CONFIRMATION'
        || batch.mappingRevision !== expectedMappingRevision || aggregate.version.batchId !== batch.id
        || aggregate.version.learningSubmissionId !== learning.id
        || aggregate.version.versionNumber !== learning.currentVersion + 1
        || aggregate.version.formId !== batch.formId || aggregate.version.formVersion !== batch.formVersion
        || (learning.sourceType === 'OPEN_REVIEW'
          && aggregate.version.contextSetId
            !== this.store.openReviewReleases.get(learning.openReviewReleaseId)?.contextSetId)
        || aggregate.responses.some((response) => response.learningSubmissionVersionId !== aggregate.version.id
          || response.formId !== batch.formId || response.formVersion !== batch.formVersion)
        || aggregate.confirmation?.batchId !== batch.id
        || aggregate.confirmation?.mappingRevision !== expectedMappingRevision
        || aggregate.confirmation?.learningSubmissionVersionId !== aggregate.version.id
        || aggregate.result.batchId !== batch.id
        || aggregate.result.learningSubmissionVersionId !== aggregate.version.id) {
      const error = new Error('Batch commit preconditions changed.');
      error.code = learning && learning.currentVersion !== batch?.baseVersion
        ? 'BATCH_BASE_VERSION_STALE' : 'BATCH_COMMIT_CONFLICT';
      throw error;
    }
    const versions = this.store.learningVersions.get(learning.id) || [];
    if (versions.some((version) => version.versionNumber === aggregate.version.versionNumber)) {
      throw new Error('Learning version already exists.');
    }
    versions.push(clone(aggregate.version));
    this.store.learningVersions.set(learning.id, versions);
    this.store.learningResponses.set(aggregate.version.id, clone(aggregate.responses));
    this.store.learningWorkItems.set(aggregate.version.id, [clone(aggregate.workItem)]);
    if (aggregate.analysisRun) this.store.analysisRuns.set(aggregate.version.id, clone(aggregate.analysisRun));
    this.store.learningBatchResults.set(batch.id, clone(aggregate.result));
    this.store.learningBatchConfirmations.set(batch.id, clone(aggregate.confirmation));
    Object.assign(learning, { currentVersion: aggregate.version.versionNumber, updatedAt: now });
    Object.assign(mapping, { status: 'COMMITTED', confirmedAt: now });
    Object.assign(batch, {
      status: 'COMMITTED', committedVersionId: aggregate.version.id,
      committedVersionNumber: aggregate.version.versionNumber, committedAt: now, updatedAt: now
    });
    for (const item of this.store.learningBatchWorkItems.get(batch.id) || []) {
      if (!['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(item.status)) {
        Object.assign(item, { status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null, updatedAt: now });
      }
    }
    return this.#learningBatchBundle(batch.id);
  }

  async commitLearningReanalysis({
    expectedCurrentVersion, version, responses, workItem, analysisRun = null, now
  }) {
    const learning = this.store.learningSubmissions.get(this.attemptId);
    const versions = learning ? this.store.learningVersions.get(learning.id) || [] : [];
    const current = versions.find((candidate) => candidate.versionNumber === expectedCurrentVersion);
    const currentResponses = current ? this.store.learningResponses.get(current.id) || [] : [];
    if (!learning || !current || learning.sourceType !== 'INTERACTIVE_FINAL'
        || learning.lifecycleStatus !== 'COMMITTED'
        || learning.currentVersion !== expectedCurrentVersion
        || version.learningSubmissionId !== learning.id
        || version.versionNumber !== expectedCurrentVersion + 1
        || version.formId !== learning.formId || version.formVersion !== learning.formVersion
        || responses.length !== currentResponses.length
        || responses.some((response) => response.learningSubmissionVersionId !== version.id
          || response.formId !== learning.formId || response.formVersion !== learning.formVersion)
        || workItem.learningSubmissionVersionId !== version.id
        || (analysisRun && (analysisRun.learningSubmissionVersionId !== version.id
          || workItem.analysisRunId !== analysisRun.id))) {
      const error = new Error('Learning reanalysis version conflict.');
      error.code = 'LEARNING_VERSION_CONFLICT';
      throw error;
    }
    if (current.batchId || current.creationReason === 'BATCH_COMMIT'
        || currentResponses.some((response) => response.answerOrigin !== 'OFFICIAL_FINAL')) {
      const error = new Error('Learning reanalysis source is unsupported.');
      error.code = 'LEARNING_REANALYSIS_SOURCE_UNSUPPORTED';
      throw error;
    }
    const oldWorks = (this.store.learningWorkItems.get(current.id) || [])
      .filter((item) => item.workType === 'ANALYZE_SUBMISSION');
    const oldWork = oldWorks[0];
    const oldRun = this.store.analysisRuns.get(current.id) || null;
    if (oldWorks.length !== 1
        || Boolean(oldWork.analysisRunId) !== Boolean(oldRun)
        || (oldRun && oldWork.analysisRunId !== oldRun.id)) {
      const error = new Error('Learning reanalysis version conflict.');
      error.code = 'LEARNING_VERSION_CONFLICT';
      throw error;
    }
    if (oldWork?.status === 'RUNNING') {
      const error = new Error('Learning analysis is already running.');
      error.code = 'LEARNING_ANALYSIS_IN_PROGRESS';
      throw error;
    }
    if (oldWork && ['BLOCKED_CONTEXT', 'QUEUED'].includes(oldWork.status)) {
      Object.assign(oldWork, {
        status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: 'SUPERSEDED_BY_EVIDENCE_REVISION', updatedAt: now
      });
      if (oldRun && oldRun.status === 'QUEUED') {
        Object.assign(oldRun, {
          status: 'CANCELLED', completedAt: now,
          lastErrorCode: 'SUPERSEDED_BY_EVIDENCE_REVISION'
        });
      }
    }
    versions.push(clone(version));
    this.store.learningVersions.set(learning.id, versions);
    this.store.learningResponses.set(version.id, clone(responses));
    this.store.learningWorkItems.set(version.id, [clone(workItem)]);
    if (analysisRun) this.store.analysisRuns.set(version.id, clone(analysisRun));
    Object.assign(learning, { currentVersion: version.versionNumber, updatedAt: now });
    return this.getLearningSubmissionBundle();
  }

  async requestLearningBatchDeletion({ batchId, now }) {
    const batch = this.store.learningBatches.get(batchId);
    if (!batch || batch.attemptId !== this.attemptId) return null;
    if (batch.deletionState === 'COMPLETE') return this.#learningBatchBundle(batch.id);
    if (batch.deletionState === 'ACTIVE') {
      batch.deletionState = 'DELETE_REQUESTED';
      batch.deletionGeneration += 1;
      batch.deletedAt = now;
      batch.updatedAt = now;
      for (const item of this.store.learningBatchWorkItems.get(batch.id) || []) {
        const artifact = item.workType === 'TRANSCRIBE_AUDIO'
          ? (this.store.learningBatchProviderArtifacts.get(batch.id) || [])
            .find((candidate) => candidate.assetId === item.assetId)
          : null;
        if (artifact?.externalId && artifact.status !== 'DELETION_EVIDENCED') {
          Object.assign(artifact, { status: 'DELETE_PENDING', updatedAt: now });
          Object.assign(item, {
            status: 'QUEUED', deletionGeneration: batch.deletionGeneration,
            inputHash: transcriptionCleanupInputHash(batch.id, item.assetId, batch.deletionGeneration),
            availableAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: 'USER_DELETION_REQUESTED', updatedAt: now
          });
        } else if (artifact?.status === 'SUBMIT_MAY_HAVE_DELIVERED') {
          Object.assign(item, {
            status: 'QUEUED', deletionGeneration: batch.deletionGeneration,
            inputHash: transcriptionCleanupInputHash(batch.id, item.assetId, batch.deletionGeneration),
            availableAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
            lastErrorCode: 'USER_DELETION_RECONCILIATION_REQUIRED', updatedAt: now
          });
        } else if (!['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(item.status)) {
          if (artifact?.status === 'INTENT_RECORDED') {
            this.store.learningBatchProviderArtifacts.set(batch.id,
              (this.store.learningBatchProviderArtifacts.get(batch.id) || [])
                .filter((candidate) => candidate.id !== artifact.id));
          }
          Object.assign(item, {
            status: 'CANCELLED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null, updatedAt: now
          });
        }
      }
    }
    return this.#learningBatchBundle(batch.id);
  }

  async completeLearningBatchLocalPurge({ batchId, expectedDeletionGeneration, now }) {
    const batch = this.store.learningBatches.get(batchId);
    if (!batch || batch.attemptId !== this.attemptId || batch.deletionState === 'ACTIVE'
        || batch.deletionGeneration !== expectedDeletionGeneration) return false;
    for (const asset of this.store.learningBatchAssets.get(batch.id) || []) {
      Object.assign(asset, {
        storageKey: null,
        status: asset.observedBytes === null ? 'REJECTED' : 'PURGED',
        writingStartedAt: null,
        purgedAt: now,
        updatedAt: now
      });
      const reservation = this.store.learningBatchQuota.get(asset.id);
      if (reservation && reservation.status !== 'RELEASED') {
        Object.assign(reservation, { status: 'RELEASED', releasedAt: now });
      }
    }
    for (const evidence of this.store.learningBatchEvidence.get(batch.id) || []) {
      Object.assign(evidence, { normalizedText: null, purgedAt: now });
    }
    for (const revision of this.store.learningBatchMappings.get(batch.id) || []) {
      for (const item of revision.items) {
        Object.assign(item, { evidenceText: null, reasoningSummary: null, purgedAt: now });
      }
    }
    const providerPending = (this.store.learningBatchProviderArtifacts.get(batch.id) || [])
      .some((artifact) => !['DELETION_EVIDENCED', 'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(artifact.status));
    const orphanPending = [...this.store.learningBatchProviderOrphanCleanupJobs.values()]
      .some((job) => job.batchId === batch.id && !['SUCCEEDED', 'SUPERSEDED'].includes(job.status));
    const retentionPending = (this.store.learningBatchProviderArtifacts.get(batch.id) || [])
      .some((artifact) => artifact.status === 'PROVIDER_RETENTION_PENDING')
      || [...this.store.learningBatchProviderOrphanCleanupJobs.values()]
        .some((job) => job.batchId === batch.id
          && job.cleanupKind === 'OBSERVE_RETENTION_WINDOW'
          && !['SUCCEEDED', 'SUPERSEDED'].includes(job.status));
    batch.deletionState = retentionPending ? 'PROVIDER_RETENTION_PENDING'
      : providerPending || orphanPending ? 'PROVIDER_DELETE_PENDING' : 'COMPLETE';
    batch.updatedAt = now;
    return true;
  }

  async addTimerEvent(event) {
    const events = this.store.events.get(this.attemptId) || [];
    events.push(clone(event));
    this.store.events.set(this.attemptId, events);
  }

  async getIdempotency(studentId, scope, key) {
    const record = this.store.idempotency.get(idempotencyKey(studentId, scope, key));
    return record ? clone(record) : null;
  }

  async consumeStudentResourceBudget(input) {
    return consumeMemoryStudentBudget(this.store, input);
  }

  async consumeGlobalResourceBudget(input) {
    return consumeMemoryGlobalBudget(this.store, input);
  }

  async putIdempotency(record) {
    const key = idempotencyKey(record.studentId, record.scope, record.key);
    const existing = this.store.idempotency.get(key);
    if (existing) return clone(existing);
    this.store.idempotency.set(key, clone(record));
    return clone(record);
  }

  async createResetAttempt({ studentId, form, now }) {
    return this.store.createResetAttempt({ studentId, form, now }, { alreadyLocked: true });
  }
}
