import { canonicalHash } from '../learning-review/canonical.js';

export const ATTEMPT_MODE = Object.freeze({ TIMED: 'TIMED', OPEN_REVIEW: 'OPEN_REVIEW' });
export const OPEN_REVIEW_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  SUPERSEDED_VALID: 'SUPERSEDED_VALID',
  REVOKED: 'REVOKED'
});

export function openReviewReleaseHash({ form, context }) {
  return canonicalHash({
    schemaVersion: 'amc-open-review-release-v1',
    formId: form.id,
    formVersion: form.version,
    manifestHash: form.manifestHash,
    contentHash: form.contentHash,
    questionBundleHash: form.questionBundleHash,
    contextSetId: context.id,
    contextArtifactSetHash: context.artifactSetHash,
    approvalAuthorityId: context.approvalAuthorityId
  });
}

function publicOpenReviewForm(form) {
  return {
    id: form.id,
    version: form.version,
    title: form.title,
    durationMs: null,
    questionCount: form.questions.length,
    practiceKind: 'open-review',
    archiveNotice: form.archiveNotice || null,
    questions: form.questions.map((question) => ({
      number: question.number,
      promptMarkdown: question.promptMarkdown,
      isScored: question.isScored !== false,
      choices: question.choices.map(({ option, textMarkdown }) => ({ option, textMarkdown }))
    }))
  };
}

export function publicOpenReviewRelease(release, form, { includeForm = false } = {}) {
  const result = {
    id: release.id,
    formId: release.formId,
    formVersion: release.formVersion,
    title: form.title,
    questionCount: form.questions.length,
    status: release.status,
    publishedAt: release.publishedAt
  };
  if (includeForm) result.form = publicOpenReviewForm(form);
  return result;
}

function protectedAccessStatus(releaseStatus) {
  if (releaseStatus === OPEN_REVIEW_STATUS.ACTIVE) return 'AVAILABLE';
  if (releaseStatus === OPEN_REVIEW_STATUS.SUPERSEDED_VALID) return 'AVAILABLE_FOR_EXISTING_WORK';
  if (releaseStatus === OPEN_REVIEW_STATUS.REVOKED) return 'PROTECTED_RESULTS_WITHHELD';
  return 'UNKNOWN';
}

export function publicOpenReviewWorkspace(attempt, learningSubmission, form = null, {
  releaseStatus = null,
  analysisStatus = undefined
} = {}) {
  const result = {
    id: attempt.id,
    attemptMode: ATTEMPT_MODE.OPEN_REVIEW,
    releaseId: learningSubmission.openReviewReleaseId,
    learningSubmissionId: learningSubmission.id,
    formId: attempt.formId,
    formVersion: attempt.formVersion,
    currentVersion: learningSubmission.currentVersion,
    lifecycleStatus: learningSubmission.lifecycleStatus,
    releaseStatus,
    protectedAccessStatus: protectedAccessStatus(releaseStatus),
    analysisStatus: analysisStatus === undefined
      ? (learningSubmission.currentVersion === 1 ? 'AWAITING_BATCH' : null)
      : analysisStatus,
    createdAt: attempt.createdAt,
    updatedAt: learningSubmission.updatedAt
  };
  if (form) result.form = publicOpenReviewForm(form);
  return result;
}
