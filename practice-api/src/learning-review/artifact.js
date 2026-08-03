import { createHash } from 'node:crypto';
import { badRequest } from '../errors.js';
import { canonicalHash, canonicalJson } from './canonical.js';

export const APPROVED_SET_SCHEMA = 'amc-approved-question-context-set-v1';
export const APPROVED_TEST_SET_SCHEMA = 'amc-approved-question-context-test-set-v1';
export const APPROVED_ARCHIVE_SCHEMA = 'amc-approved-question-context-archive-set-v1';
export const APPROVED_SET_SCHEMA_V2 = 'amc-approved-question-context-set-v2';
export const APPROVED_TEST_SET_SCHEMA_V2 = 'amc-approved-question-context-test-set-v2';
export const APPROVED_ARCHIVE_SCHEMA_V2 = 'amc-approved-question-context-archive-set-v2';
export const APPROVAL_RECEIPT_SET_SCHEMA = 'amc-solution-approval-receipt-set-v1';
const SINGLE_CANDIDATE_SCHEMA = 'amc-question-context-candidate-set-v1';
const ARCHIVE_CANDIDATE_SCHEMA = 'amc-question-context-archive-candidate-set-v1';
const SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA = 'amc-question-context-supplemented-archive-candidate-set-v1';
const APPROVAL_POLICY = 'amc-explicit-human-solution-approval-v1';
const APPROVAL_POLICY_V2 = 'amc-operator-delegated-ai-assisted-solution-approval-v1';
const REVIEW_SCHEMA = 'amc-question-context-review-decisions-v1';
const REVIEW_SCHEMA_V2 = 'amc-question-context-review-decisions-v2';
const REVIEW_METHOD_V2 = 'operator-delegated-ai-assisted';
const HASH = /^[a-f0-9]{64}$/;
const SOLUTION_ID = /^solution-[0-9]{3}$/;
const SUPPLEMENT_SOLUTION_ID = /^solution-9[0-9]{2}$/;
const SUPPLEMENT_ID = /^supplement-[a-z0-9][a-z0-9-]{2,63}$/;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}$/;
const TAG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const UTC_TIMESTAMP = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,6})?Z$/;
const VISUAL_REFERENCE = /!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])|<(?:img|picture|svg)\b|\\includegraphics\b|^[ \t]*(?:`{3,}|~{3,})[ \t]*asy\b|\[asy\]|\\begin[ \t]*\{asy\}|\[\[(?:File|Image):[^\]\n]+\]\]|\[[^\]\n]*\]\([^\)\n]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\)\s]*)?|[\/=?](?:File|Image):)[^\)\n]*\)|^[ \t]*\[[^\]\n]+\]:[ \t]*<?[^\s>]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\s>]*)?|[\/=?](?:File|Image):)[^\s>]*>?/imu;
const INVALID_TEXT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/u;

const POLICY_V1 = Object.freeze({
  version: 1,
  approvalPolicyVersion: APPROVAL_POLICY,
  reviewSchemaVersion: REVIEW_SCHEMA,
  singleSchemaVersion: APPROVED_SET_SCHEMA,
  archiveSchemaVersion: APPROVED_ARCHIVE_SCHEMA,
  testSchemaVersion: APPROVED_TEST_SET_SCHEMA
});
const POLICY_V2 = Object.freeze({
  version: 2,
  approvalPolicyVersion: APPROVAL_POLICY_V2,
  reviewSchemaVersion: REVIEW_SCHEMA_V2,
  singleSchemaVersion: APPROVED_SET_SCHEMA_V2,
  archiveSchemaVersion: APPROVED_ARCHIVE_SCHEMA_V2,
  testSchemaVersion: APPROVED_TEST_SET_SCHEMA_V2
});

// Parsed canonical JSON deliberately sorts object keys. Object member order is
// not semantic, so every equality check at this trust boundary must use the
// same order-independent representation as the signed/hash-bound artifacts.
function semanticJsonEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function hasUnpairedSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true;
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) return true;
  }
  return false;
}

function fail(message) {
  throw badRequest('INVALID_APPROVED_CONTEXT', message);
}

function record(value, path, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${path} must be an object.`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${path} must contain exactly: ${expected.join(', ')}.`);
  }
  return value;
}

function hash(value, path) {
  if (typeof value !== 'string' || !HASH.test(value)) fail(`${path} must be a lowercase SHA-256.`);
  return value;
}

function text(value, path, maximumBytes) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') < 1
      || Buffer.byteLength(value, 'utf8') > maximumBytes || INVALID_TEXT.test(value) || hasUnpairedSurrogate(value)) {
    fail(`${path} is invalid or outside its UTF-8 byte bound.`);
  }
  return value;
}

function timestamp(value, path) {
  const match = typeof value === 'string' ? value.match(UTC_TIMESTAMP) : null;
  const year = match ? Number(match[1]) : 0;
  const month = match ? Number(match[2]) : 0;
  const day = match ? Number(match[3]) : 0;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (!match || month < 1 || month > 12 || day < 1 || day > days[month - 1]
      || Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6]) > 59) {
    fail(`${path} must be a valid UTC RFC3339 timestamp.`);
  }
  return value;
}

function opaqueId(value, path) {
  if (typeof value !== 'string' || !OPAQUE_ID.test(value)) fail(`${path} is invalid.`);
  return value;
}

function safePath(value, path) {
  text(value, path, 1_024);
  if (value.startsWith('/') || value.includes('\\') || value.split('/').includes('..')) fail(`${path} is unsafe.`);
  return value;
}

function validateReviewModel(value, path) {
  record(value, path, ['provider', 'model', 'runId']);
  text(value.provider, `${path}.provider`, 128);
  text(value.model, `${path}.model`, 256);
  text(value.runId, `${path}.runId`, 256);
  return value;
}

function validateReviewGovernance(value, path, trustedReceipts) {
  record(value, path, ['reviewMethod', 'operatorAuthorization']);
  if (value.reviewMethod !== REVIEW_METHOD_V2) fail(`${path}.reviewMethod is unsupported.`);
  const authorization = record(value.operatorAuthorization, `${path}.operatorAuthorization`, [
    'authorizationId', 'authorizedBy', 'authorizedAt', 'scope', 'statement', 'rightsAttestation'
  ]);
  opaqueId(authorization.authorizationId, `${path}.operatorAuthorization.authorizationId`);
  opaqueId(authorization.authorizedBy, `${path}.operatorAuthorization.authorizedBy`);
  timestamp(authorization.authorizedAt, `${path}.operatorAuthorization.authorizedAt`);
  if (authorization.scope !== 'solution-correctness-pedagogy-and-rights-review'
      || authorization.statement !== 'operator-delegates-ai-assisted-solution-review'
      || authorization.rightsAttestation !== 'operator-attests-rights-for-reviewed-source-ai-use') {
    fail(`${path}.operatorAuthorization has unsupported delegated-review semantics.`);
  }
  if (authorization.authorizedBy === trustedReceipts.authorityId) {
    fail(`${path}.operatorAuthorization.authorizedBy must be independent from the receipt authority.`);
  }
  return value;
}

function validateCandidateProvenance(value, path, { solution, questionSource, candidateSchemaVersion }) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${path} must be an object.`);
  if (value.origin === 'source-markdown') {
    record(value, path, ['origin', 'sourcePath', 'sourceSha256']);
    safePath(value.sourcePath, `${path}.sourcePath`);
    hash(value.sourceSha256, `${path}.sourceSha256`);
    if (value.sourcePath !== solution.sourceRef.path || value.sourceSha256 !== solution.sourceRef.sha256
        || value.sourcePath !== questionSource.path || value.sourceSha256 !== questionSource.sha256) {
      fail(`${path} does not match the solution and question source.`);
    }
    return value;
  }
  if (value.origin === 'operator-original-supplement') {
    if (candidateSchemaVersion !== SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA) {
      fail(`${path} supplement provenance requires the supplemented archive candidate schema.`);
    }
    record(value, path, [
      'origin', 'supplementId', 'supplementSetHash', 'supplementRecordHash',
      'authorId', 'createdAt', 'rightsStatus', 'rightsAuthorizationId'
    ]);
    if (typeof value.supplementId !== 'string' || !SUPPLEMENT_ID.test(value.supplementId)) {
      fail(`${path}.supplementId is invalid.`);
    }
    hash(value.supplementSetHash, `${path}.supplementSetHash`);
    hash(value.supplementRecordHash, `${path}.supplementRecordHash`);
    opaqueId(value.authorId, `${path}.authorId`);
    timestamp(value.createdAt, `${path}.createdAt`);
    opaqueId(value.rightsAuthorizationId, `${path}.rightsAuthorizationId`);
    if (value.rightsStatus !== 'operator-attested-original-and-authorized-for-ai-use') {
      fail(`${path}.rightsStatus is invalid.`);
    }
    if (!SUPPLEMENT_SOLUTION_ID.test(solution.solutionId)
        || solution.sourceRef.path !== `protected-supplements/${value.supplementId}.json`
        || solution.sourceRef.sha256 !== value.supplementRecordHash) {
      fail(`${path} does not satisfy reserved supplement id/path/hash invariants.`);
    }
    return value;
  }
  fail(`${path}.origin is unsupported.`);
}

function tags(value, path, { minimum = 0 } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > 32
      || value.some((item) => typeof item !== 'string' || !TAG.test(item))
      || new Set(value).size !== value.length) fail(`${path} must contain unique approved tags.`);
  return [...value];
}

function bodyHash(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hasVisualReference(value) {
  return typeof value === 'string' && VISUAL_REFERENCE.test(value);
}

export function validateApprovalReceiptSet(payload, { trustedAuthorityIds } = {}) {
  const trusted = trustedAuthorityIds instanceof Set ? trustedAuthorityIds : new Set(trustedAuthorityIds || []);
  if (!trusted.size) fail('At least one trusted approval authority must be configured outside the artifact.');
  record(payload, 'approvalReceipts', ['schemaVersion', 'audience', 'authorityId', 'receipts', 'receiptSetHash']);
  if (payload.schemaVersion !== APPROVAL_RECEIPT_SET_SCHEMA
      || payload.audience !== 'private-approval-authority-allowlist') {
    fail('Approval receipt set identity is unsupported.');
  }
  const authorityId = opaqueId(payload.authorityId, 'approvalReceipts.authorityId');
  if (!trusted.has(authorityId)) fail('Approval receipt authority is not in the trusted deployment allowlist.');
  if (!Array.isArray(payload.receipts) || payload.receipts.length > 10_000) {
    fail('approvalReceipts.receipts must contain at most 10000 records.');
  }
  const receiptIds = new Set();
  const byDecisionHash = new Map();
  for (const [index, receipt] of payload.receipts.entries()) {
    const path = `approvalReceipts.receipts[${index}]`;
    record(receipt, path, ['receiptId', 'authorityId', 'decisionRecordHash', 'issuedAt', 'status']);
    opaqueId(receipt.receiptId, `${path}.receiptId`);
    if (receiptIds.has(receipt.receiptId)) fail(`${path}.receiptId is duplicated.`);
    receiptIds.add(receipt.receiptId);
    if (receipt.authorityId !== authorityId) fail(`${path}.authorityId does not match the receipt set.`);
    hash(receipt.decisionRecordHash, `${path}.decisionRecordHash`);
    if (byDecisionHash.has(receipt.decisionRecordHash)) {
      fail(`${path}.decisionRecordHash has more than one receipt; active/revoked records cannot coexist.`);
    }
    timestamp(receipt.issuedAt, `${path}.issuedAt`);
    if (!['active', 'revoked'].includes(receipt.status)) fail(`${path}.status must be active or revoked.`);
    byDecisionHash.set(receipt.decisionRecordHash, receipt);
  }
  if (hash(payload.receiptSetHash, 'approvalReceipts.receiptSetHash') !== canonicalHash(payload, ['receiptSetHash'])) {
    fail('approvalReceipts.receiptSetHash is stale.');
  }
  return { authorityId, receiptSetHash: payload.receiptSetHash, byDecisionHash };
}

function validateAuthorityBinding(value, path, trustedReceipts) {
  record(value, path, ['schemaVersion', 'authorityId', 'receiptSetHash']);
  if (value.schemaVersion !== APPROVAL_RECEIPT_SET_SCHEMA
      || value.authorityId !== trustedReceipts.authorityId
      || value.receiptSetHash !== trustedReceipts.receiptSetHash) {
    fail(`${path} does not match the independently loaded trusted receipt set.`);
  }
  return value;
}

function decisionProjection({ artifact, form, question, solution, approval, policy }) {
  const projection = {
    approvalPolicyVersion: artifact.approvalPolicyVersion,
    candidateSchemaVersion: form.candidateSchemaVersion,
    candidateSetHash: form.candidateSetHash,
    formId: form.id,
    formVersion: form.version,
    questionNumber: question.number,
    solutionId: solution.solutionId,
    decision: 'approved',
    bodySha256: solution.bodySha256,
    sourceRef: { path: solution.sourceRef.path, sha256: solution.sourceRef.sha256 },
    reviewerId: approval.reviewerId,
    reviewedAt: approval.reviewedAt,
    rightsStatus: approval.rightsStatus,
    qualityFlags: approval.qualityFlags,
    methodTags: approval.methodTags
  };
  if (policy.version === 2) {
    Object.assign(projection, {
      reviewMethod: approval.reviewMethod,
      reviewModel: approval.reviewModel,
      operatorAuthorizationId: approval.operatorAuthorizationId,
      operatorAuthorization: artifact.reviewGovernance.operatorAuthorization,
      candidateProvenance: solution.candidateProvenance,
      questionContentHash: question.questionContentHash
    });
  }
  return projection;
}

function validateSolution(solution, path, {
  artifact, form, question, questionSource, trustedReceipts, policy, reviewGovernance
}) {
  const solutionKeys = [
    'solutionId', 'title', 'bodyMarkdown', 'bodySha256', 'sourceRef', 'modelEligibility', 'approval'
  ];
  if (policy.version === 2) solutionKeys.push('candidateProvenance');
  record(solution, path, solutionKeys);
  if (typeof solution.solutionId !== 'string' || !SOLUTION_ID.test(solution.solutionId)) fail(`${path}.solutionId is invalid.`);
  text(solution.title, `${path}.title`, 256);
  text(solution.bodyMarkdown, `${path}.bodyMarkdown`, 16_384);
  if (hash(solution.bodySha256, `${path}.bodySha256`) !== bodyHash(solution.bodyMarkdown)) {
    fail(`${path}.bodySha256 does not match bodyMarkdown.`);
  }
  const source = record(solution.sourceRef, `${path}.sourceRef`, ['path', 'sha256', 'headingLine', 'endLine']);
  safePath(source.path, `${path}.sourceRef.path`);
  hash(source.sha256, `${path}.sourceRef.sha256`);
  if (!Number.isSafeInteger(source.headingLine) || !Number.isSafeInteger(source.endLine)
      || source.headingLine < 1 || source.endLine < source.headingLine) fail(`${path}.sourceRef line range is invalid.`);
  if (policy.version === 2) {
    validateCandidateProvenance(solution.candidateProvenance, `${path}.candidateProvenance`, {
      solution, questionSource, candidateSchemaVersion: form.candidateSchemaVersion
    });
  } else if (source.path !== questionSource.path || source.sha256 !== questionSource.sha256) {
    fail(`${path}.sourceRef does not match its question.`);
  }
  const modelEligibility = record(solution.modelEligibility, `${path}.modelEligibility`, ['eligible', 'reason']);
  const visual = hasVisualReference(solution.bodyMarkdown);
  const expectedEligibility = {
    eligible: !visual,
    reason: visual ? 'solution-visual-context-unavailable' : null
  };
  if (!semanticJsonEqual(modelEligibility, expectedEligibility)) {
    fail(`${path}.modelEligibility does not match solution visual references.`);
  }
  const approvalKeys = [
    'reviewerId', 'reviewedAt', 'rightsStatus', 'qualityFlags', 'methodTags',
    'decisionRecordHash', 'authorityReceipt'
  ];
  if (policy.version === 2) approvalKeys.push('reviewMethod', 'reviewModel', 'operatorAuthorizationId');
  const approval = record(solution.approval, `${path}.approval`, approvalKeys);
  opaqueId(approval.reviewerId, `${path}.approval.reviewerId`);
  timestamp(approval.reviewedAt, `${path}.approval.reviewedAt`);
  if (approval.rightsStatus !== 'approved-for-ai-use') fail(`${path}.approval.rightsStatus is invalid.`);
  tags(approval.qualityFlags, `${path}.approval.qualityFlags`);
  tags(approval.methodTags, `${path}.approval.methodTags`, { minimum: 1 });
  if (policy.version === 2) {
    if (approval.reviewMethod !== REVIEW_METHOD_V2) fail(`${path}.approval.reviewMethod is unsupported.`);
    validateReviewModel(approval.reviewModel, `${path}.approval.reviewModel`);
    opaqueId(approval.operatorAuthorizationId, `${path}.approval.operatorAuthorizationId`);
    const authorization = reviewGovernance.operatorAuthorization;
    if (approval.operatorAuthorizationId !== authorization.authorizationId) {
      fail(`${path}.approval.operatorAuthorizationId does not match review governance.`);
    }
    if (approval.reviewerId === trustedReceipts.authorityId
        || approval.reviewerId === authorization.authorizedBy) {
      fail(`${path}.approval reviewer, operator, and receipt authority must be independent.`);
    }
    if (solution.candidateProvenance.origin === 'operator-original-supplement'
        && approval.reviewerId === solution.candidateProvenance.authorId) {
      fail(`${path}.approval reviewer must differ from the supplement author.`);
    }
  }
  const expectedDecisionHash = canonicalHash(decisionProjection({
    artifact, form, question, solution, approval, policy
  }));
  if (hash(approval.decisionRecordHash, `${path}.approval.decisionRecordHash`) !== expectedDecisionHash) {
    fail(`${path}.approval.decisionRecordHash does not match the canonical approval decision.`);
  }
  const embeddedReceipt = record(approval.authorityReceipt, `${path}.approval.authorityReceipt`, [
    'receiptId', 'authorityId', 'issuedAt', 'status'
  ]);
  opaqueId(embeddedReceipt.receiptId, `${path}.approval.authorityReceipt.receiptId`);
  opaqueId(embeddedReceipt.authorityId, `${path}.approval.authorityReceipt.authorityId`);
  timestamp(embeddedReceipt.issuedAt, `${path}.approval.authorityReceipt.issuedAt`);
  const trustedReceipt = trustedReceipts.byDecisionHash.get(expectedDecisionHash);
  if (!trustedReceipt || trustedReceipt.status !== 'active'
      || embeddedReceipt.status !== 'active'
      || Object.keys(embeddedReceipt).some((key) => embeddedReceipt[key] !== trustedReceipt[key])) {
    fail(`${path}.approval.authorityReceipt does not exactly match one active independent authority receipt.`);
  }
  return solution;
}

function validateQuestion(question, index, {
  artifact, form, trustedReceipts, policy, reviewGovernance
}) {
  const path = `approvedSet.questions[${index}]`;
  record(question, path, [
    'number', 'sourceRef', 'promptMarkdown', 'choices', 'questionContentHash',
    'visualContext', 'contextReady', 'availability', 'approvedSolutions'
  ]);
  if (question.number !== index + 1) fail(`${path}.number must be ${index + 1}.`);
  const source = record(question.sourceRef, `${path}.sourceRef`, ['path', 'sha256']);
  safePath(source.path, `${path}.sourceRef.path`);
  hash(source.sha256, `${path}.sourceRef.sha256`);
  text(question.promptMarkdown, `${path}.promptMarkdown`, 16_384);
  const choices = record(question.choices, `${path}.choices`, ['A', 'B', 'C', 'D', 'E']);
  for (const option of ['A', 'B', 'C', 'D', 'E']) text(choices[option], `${path}.choices.${option}`, 2_048);
  const projection = { number: question.number, sourceRef: source, promptMarkdown: question.promptMarkdown, choices };
  if (hash(question.questionContentHash, `${path}.questionContentHash`) !== canonicalHash(projection)) {
    fail(`${path}.questionContentHash is stale.`);
  }
  const questionVisual = hasVisualReference(question.promptMarkdown)
    || Object.values(choices).some(hasVisualReference);
  const visualContext = record(question.visualContext, `${path}.visualContext`, ['required', 'modelAvailable', 'reason']);
  const expectedVisual = {
    required: questionVisual,
    modelAvailable: !questionVisual,
    reason: questionVisual ? 'question-visual-context-unavailable' : null
  };
  if (!semanticJsonEqual(visualContext, expectedVisual)) {
    fail(`${path}.visualContext does not match question visual references.`);
  }
  if (!Array.isArray(question.approvedSolutions) || question.approvedSolutions.length > 8) {
    fail(`${path}.approvedSolutions is invalid.`);
  }
  const ids = new Set();
  question.approvedSolutions.forEach((solution, solutionIndex) => {
    validateSolution(solution, `${path}.approvedSolutions[${solutionIndex}]`, {
      artifact, form, question, questionSource: source, trustedReceipts, policy, reviewGovernance
    });
    if (ids.has(solution.solutionId)) fail(`${path} has duplicate solutionId.`);
    ids.add(solution.solutionId);
  });
  const eligibleCount = question.approvedSolutions.filter((solution) => solution.modelEligibility.eligible).length;
  const ready = !questionVisual && eligibleCount >= 2;
  if (question.contextReady !== ready) fail(`${path}.contextReady disagrees with model-eligible solution count.`);
  const availability = record(question.availability, `${path}.availability`, [
    'status', 'approvedSolutionCount', 'modelEligibleSolutionCount', 'requiredSolutionCount', 'reason'
  ]);
  const expectedReason = questionVisual
    ? 'question-visual-context-unavailable'
    : (ready ? null : 'fewer-than-two-model-eligible-approved-solutions');
  const expected = {
    status: ready ? 'ready' : 'unavailable',
    approvedSolutionCount: question.approvedSolutions.length,
    modelEligibleSolutionCount: eligibleCount,
    requiredSolutionCount: 2,
    reason: expectedReason
  };
  if (!semanticJsonEqual(availability, expected)) fail(`${path}.availability is inconsistent.`);
  return question;
}

function validateSingle(value, trustedReceipts, expectedCandidateSchema, policy) {
  const rootKeys = [
    'schemaVersion', 'audience', 'approvalPolicyVersion', 'formBinding', 'reviewDecisionBinding',
    'approvalAuthorityBinding', 'summary', 'questions', 'disclaimer', 'setHash'
  ];
  if (policy.version === 2) rootKeys.push('reviewGovernance');
  record(value, 'approvedSet', rootKeys);
  if (value.schemaVersion !== policy.singleSchemaVersion || value.audience !== 'private-ai-context-only'
      || value.approvalPolicyVersion !== policy.approvalPolicyVersion) {
    fail('Approved set identity/policy is unsupported.');
  }
  const reviewGovernance = policy.version === 2
    ? validateReviewGovernance(value.reviewGovernance, 'approvedSet.reviewGovernance', trustedReceipts)
    : null;
  const form = record(value.formBinding, 'approvedSet.formBinding', [
    'id', 'version', 'candidateSchemaVersion', 'candidateSetHash', 'contextContentHash', 'releaseBinding'
  ]);
  text(form.id, 'approvedSet.formBinding.id', 160);
  text(form.version, 'approvedSet.formBinding.version', 100);
  if (form.candidateSchemaVersion !== expectedCandidateSchema) {
    fail('Approved set candidateSchemaVersion does not match its import envelope.');
  }
  hash(form.candidateSetHash, 'approvedSet.formBinding.candidateSetHash');
  hash(form.contextContentHash, 'approvedSet.formBinding.contextContentHash');
  const release = record(form.releaseBinding, 'approvedSet.formBinding.releaseBinding', [
    'questionBundleHash', 'contentHash', 'manifestHash'
  ]);
  hash(release.questionBundleHash, 'approvedSet release questionBundleHash');
  hash(release.contentHash, 'approvedSet release contentHash');
  hash(release.manifestHash, 'approvedSet release manifestHash');
  const review = record(value.reviewDecisionBinding, 'approvedSet.reviewDecisionBinding', ['schemaVersion', 'decisionSetHash']);
  if (review.schemaVersion !== policy.reviewSchemaVersion) fail('Approved set review schema is unsupported.');
  hash(review.decisionSetHash, 'approvedSet decisionSetHash');
  validateAuthorityBinding(value.approvalAuthorityBinding, 'approvedSet.approvalAuthorityBinding', trustedReceipts);
  if (!Array.isArray(value.questions) || value.questions.length !== 25) fail('Approved set must contain exactly 25 questions.');
  value.questions.forEach((question, index) => validateQuestion(question, index, {
    artifact: value, form, trustedReceipts, policy, reviewGovernance
  }));
  const formProjection = {
    id: form.id,
    version: form.version,
    questions: value.questions.map(({ number, sourceRef, promptMarkdown, choices }) => ({
      number, sourceRef, promptMarkdown, choices
    }))
  };
  if (form.contextContentHash !== canonicalHash(formProjection)) fail('Approved set contextContentHash is stale.');
  const summary = record(value.summary, 'approvedSet.summary', [
    'questionCount', 'approvedSolutionCount', 'contextReadyQuestionCount',
    'unavailableQuestionCount', 'minimumApprovedSolutionsPerQuestion'
  ]);
  const ready = value.questions.filter((question) => question.contextReady).length;
  const expectedSummary = {
    questionCount: 25,
    approvedSolutionCount: value.questions.reduce((sum, question) => sum + question.approvedSolutions.length, 0),
    contextReadyQuestionCount: ready,
    unavailableQuestionCount: 25 - ready,
    minimumApprovedSolutionsPerQuestion: 2
  };
  if (!semanticJsonEqual(summary, expectedSummary)) fail('Approved set summary is inconsistent.');
  text(value.disclaimer, 'approvedSet.disclaimer', 1_000);
  if (hash(value.setHash, 'approvedSet.setHash') !== canonicalHash(value, ['setHash'])) fail('Approved set setHash is stale.');
  return value;
}

export function validateApprovedContextArtifact(payload, { approvalReceipts, trustedAuthorityIds } = {}) {
  if ([APPROVED_TEST_SET_SCHEMA, APPROVED_TEST_SET_SCHEMA_V2].includes(payload?.schemaVersion)
      || payload?.audience === 'private-test-only') {
    fail('Test-only approved context is never production-importable.');
  }
  let policy;
  let envelope;
  if (payload?.schemaVersion === APPROVED_SET_SCHEMA
      && payload?.audience === 'private-ai-context-only'
      && payload?.approvalPolicyVersion === APPROVAL_POLICY) {
    policy = POLICY_V1;
    envelope = 'single';
  } else if (payload?.schemaVersion === APPROVED_ARCHIVE_SCHEMA
      && payload?.audience === 'private-ai-context-only'
      && payload?.approvalPolicyVersion === APPROVAL_POLICY) {
    policy = POLICY_V1;
    envelope = 'archive';
  } else if (payload?.schemaVersion === APPROVED_SET_SCHEMA_V2
      && payload?.audience === 'private-ai-context-only'
      && payload?.approvalPolicyVersion === APPROVAL_POLICY_V2) {
    policy = POLICY_V2;
    envelope = 'single';
  } else if (payload?.schemaVersion === APPROVED_ARCHIVE_SCHEMA_V2
      && payload?.audience === 'private-ai-context-only'
      && payload?.approvalPolicyVersion === APPROVAL_POLICY_V2) {
    policy = POLICY_V2;
    envelope = 'archive';
  } else {
    fail('Approved context schema, audience, and policy tuple is unsupported.');
  }
  const trustedReceipts = validateApprovalReceiptSet(approvalReceipts, { trustedAuthorityIds });
  if (envelope === 'single') {
    return {
      archiveSetHash: null,
      authorityId: trustedReceipts.authorityId,
      receiptSetHash: trustedReceipts.receiptSetHash,
      forms: [validateSingle(payload, trustedReceipts, SINGLE_CANDIDATE_SCHEMA, policy)]
    };
  }
  const archiveKeys = [
    'schemaVersion', 'audience', 'approvalPolicyVersion', 'candidateSetBinding', 'reviewDecisionBinding',
    'approvalAuthorityBinding', 'summary', 'forms', 'disclaimer', 'setHash'
  ];
  if (policy.version === 2) archiveKeys.push('reviewGovernance');
  record(payload, 'approvedArchive', archiveKeys);
  if (payload.schemaVersion !== policy.archiveSchemaVersion || payload.audience !== 'private-ai-context-only'
      || payload.approvalPolicyVersion !== policy.approvalPolicyVersion) {
    fail('Approved archive identity/policy is unsupported.');
  }
  const wrapperGovernance = policy.version === 2
    ? validateReviewGovernance(payload.reviewGovernance, 'approvedArchive.reviewGovernance', trustedReceipts)
    : null;
  const candidate = record(payload.candidateSetBinding, 'approvedArchive.candidateSetBinding', [
    'schemaVersion', 'setHash', 'archiveRelease'
  ]);
  const supportedCandidateSchemas = policy.version === 2
    ? [ARCHIVE_CANDIDATE_SCHEMA, SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA]
    : [ARCHIVE_CANDIDATE_SCHEMA];
  if (!supportedCandidateSchemas.includes(candidate.schemaVersion)) {
    fail('Approved archive candidate schema is unsupported.');
  }
  hash(candidate.setHash, 'approvedArchive.candidateSetBinding.setHash');
  const release = record(candidate.archiveRelease, 'approvedArchive.archiveRelease', [
    'batchSchemaVersion', 'releaseVersion', 'sourcePath', 'sourceSha256'
  ]);
  if (release.batchSchemaVersion !== 'amc-practice-archive-release-batch-v1') fail('Approved archive release schema is unsupported.');
  text(release.releaseVersion, 'approvedArchive.releaseVersion', 100);
  safePath(release.sourcePath, 'approvedArchive.sourcePath');
  hash(release.sourceSha256, 'approvedArchive.sourceSha256');
  const review = record(payload.reviewDecisionBinding, 'approvedArchive.reviewDecisionBinding', ['schemaVersion', 'decisionSetHash']);
  if (review.schemaVersion !== policy.reviewSchemaVersion) fail('Approved archive review schema is unsupported.');
  hash(review.decisionSetHash, 'approvedArchive.decisionSetHash');
  validateAuthorityBinding(payload.approvalAuthorityBinding, 'approvedArchive.approvalAuthorityBinding', trustedReceipts);
  if (!Array.isArray(payload.forms) || payload.forms.length < 1 || payload.forms.length > 48) {
    fail('Approved archive must select 1-48 forms.');
  }
  const forms = payload.forms.map((form) => validateSingle(
    form, trustedReceipts, candidate.schemaVersion, policy
  ));
  const identities = new Set();
  for (const form of forms) {
    const identity = `${form.formBinding.id}\u0000${form.formBinding.version}`;
    if (identities.has(identity)) fail('Approved archive contains a duplicate form revision.');
    identities.add(identity);
    if (form.formBinding.candidateSetHash !== candidate.setHash
        || form.reviewDecisionBinding.decisionSetHash !== review.decisionSetHash
        || !semanticJsonEqual(form.approvalAuthorityBinding, payload.approvalAuthorityBinding)
        || (policy.version === 2
          && !semanticJsonEqual(form.reviewGovernance, wrapperGovernance))) {
      fail('Approved archive child lineage does not match wrapper.');
    }
  }
  const summary = record(payload.summary, 'approvedArchive.summary', [
    'formCount', 'questionCount', 'approvedSolutionCount', 'contextReadyQuestionCount', 'unavailableQuestionCount'
  ]);
  const expected = {
    formCount: forms.length,
    questionCount: forms.reduce((sum, form) => sum + form.summary.questionCount, 0),
    approvedSolutionCount: forms.reduce((sum, form) => sum + form.summary.approvedSolutionCount, 0),
    contextReadyQuestionCount: forms.reduce((sum, form) => sum + form.summary.contextReadyQuestionCount, 0),
    unavailableQuestionCount: forms.reduce((sum, form) => sum + form.summary.unavailableQuestionCount, 0)
  };
  if (!semanticJsonEqual(summary, expected)) fail('Approved archive summary is inconsistent.');
  text(payload.disclaimer, 'approvedArchive.disclaimer', 1_000);
  if (hash(payload.setHash, 'approvedArchive.setHash') !== canonicalHash(payload, ['setHash'])) {
    fail('Approved archive setHash is stale.');
  }
  return {
    archiveSetHash: payload.setHash,
    authorityId: trustedReceipts.authorityId,
    receiptSetHash: trustedReceipts.receiptSetHash,
    forms
  };
}

export class ApprovedContextImporter {
  constructor({ store, trustedAuthorityIds, clock = () => new Date() }) {
    this.store = store;
    this.trustedAuthorityIds = trustedAuthorityIds instanceof Set
      ? new Set(trustedAuthorityIds)
      : new Set(trustedAuthorityIds || []);
    if (!this.trustedAuthorityIds.size) throw new Error('ApprovedContextImporter requires a trusted authority allowlist.');
    this.clock = clock;
  }

  async import(payload, approvalReceipts) {
    const validated = validateApprovedContextArtifact(payload, {
      approvalReceipts,
      trustedAuthorityIds: this.trustedAuthorityIds
    });
    return this.store.importApprovedContextSets({ ...validated, importedAt: this.clock() });
  }
}
