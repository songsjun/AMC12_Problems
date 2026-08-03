import { canonicalHash } from '../learning-review/canonical.js';
import { ATTEMPT_MODE } from '../open-review/domain.js';

export const BATCH_REVIEW_SOURCE_TYPE = 'BATCH_REVIEW';
export const BATCH_REVIEW_PHASE = 'BATCH_REVIEW';
export const BATCH_REVIEW_ANCHOR_REASON = 'BATCH_REVIEW_ANCHOR';
export const BATCH_REVIEW_BLANK_ORIGIN = 'BATCH_REVIEW_BLANK';

export function batchReviewAnchorHash({ studentId, form, context }) {
  return canonicalHash({
    schema: 'amc-batch-review-anchor-v2',
    studentId,
    formId: form.id,
    formVersion: form.version,
    manifestHash: form.manifestHash,
    contentHash: form.contentHash,
    questionBundleHash: form.questionBundleHash,
    contextSetId: context.id,
    contextArtifactSetHash: context.artifactSetHash
  });
}

export function isPinnedBatchReviewContextComplete(form, context) {
  if (!form || !form.publishedAt || !context || context.sealed !== true
      || context.formId !== form.id || context.formVersion !== form.version
      || context.releaseBinding?.manifestHash !== form.manifestHash
      || context.releaseBinding?.contentHash !== form.contentHash
      || context.releaseBinding?.questionBundleHash !== form.questionBundleHash
      || !Array.isArray(form.questions) || form.questions.length !== 25
      || context.questions?.length !== form.questions.length) return false;
  const contextByNumber = new Map(context.questions.map((question) => [question.questionNumber, question]));
  return form.questions.every((formQuestion) => {
    const question = contextByNumber.get(formQuestion.number);
    return question?.modelEligibleSolutionCount >= 2
      && question.solutions.filter((solution) => solution.modelEligibility?.eligible === true
        && solution.authorityReceipt?.status === 'active').length >= 2;
  });
}

export function isCompleteBatchReviewContext(form, context) {
  return context?.active === true && isPinnedBatchReviewContextComplete(form, context);
}

function publicBatchReviewForm(form) {
  return {
    id: form.id,
    version: form.version,
    title: form.title,
    durationMs: null,
    questionCount: form.questions.length,
    practiceKind: 'batch-review',
    archiveNotice: form.archiveNotice || null,
    questions: form.questions.map((question) => ({
      number: question.number,
      promptMarkdown: question.promptMarkdown,
      isScored: question.isScored !== false,
      choices: question.choices.map(({ option, textMarkdown }) => ({ option, textMarkdown }))
    }))
  };
}

export function publicBatchReviewWorkspace(attempt, learningSubmission, form = null, {
  analysisStatus = undefined,
  analysisContextStatus = 'UNAVAILABLE',
  batchIntakeAvailable = false,
  batchReviewAvailable = false
} = {}) {
  const deleted = learningSubmission.lifecycleStatus === 'DELETED';
  const result = {
    id: attempt.id,
    attemptMode: ATTEMPT_MODE.BATCH_REVIEW,
    phase: BATCH_REVIEW_PHASE,
    learningSubmissionId: learningSubmission.id,
    formId: attempt.formId,
    formVersion: attempt.formVersion,
    currentVersion: learningSubmission.currentVersion,
    lifecycleStatus: learningSubmission.lifecycleStatus,
    protectedAccessStatus: deleted ? 'RECORD_DELETED' : 'AVAILABLE',
    analysisStatus: deleted ? 'TOMBSTONED' : (analysisStatus === undefined
      ? (learningSubmission.currentVersion === 1 ? 'AWAITING_BATCH' : null)
      : analysisStatus),
    analysisContextStatus: deleted ? 'UNAVAILABLE' : analysisContextStatus,
    batchIntakeAvailable: batchIntakeAvailable === true,
    batchReviewAvailable: batchReviewAvailable === true,
    createdAt: attempt.createdAt,
    updatedAt: learningSubmission.updatedAt
  };
  if (form && !deleted) result.form = publicBatchReviewForm(form);
  return result;
}
