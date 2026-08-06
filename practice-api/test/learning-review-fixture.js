import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { canonicalHash } from '../src/learning-review/canonical.js';

const H = {
  content: '1'.repeat(64), bundle: '2'.repeat(64), manifest: '3'.repeat(64),
  source: '4'.repeat(64), decision: '5'.repeat(64), candidate: '6'.repeat(64)
};

export const APPROVAL_AUTHORITY_ID = 'approval-authority:fixture';
export const TRUSTED_APPROVAL_AUTHORITIES = new Set([APPROVAL_AUTHORITY_ID]);
const VISUAL_REFERENCE = /!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])|<(?:img|picture|svg)\b|\\includegraphics\b|^[ \t]*(?:`{3,}|~{3,})[ \t]*asy\b|\[asy\]|\\begin[ \t]*\{asy\}|\[\[(?:File|Image):[^\]\n]+\]\]|\[[^\]\n]*\]\([^\)\n]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\)\s]*)?|[\/=?](?:File|Image):)[^\)\n]*\)|^[ \t]*\[[^\]\n]+\]:[ \t]*<?[^\s>]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\s>]*)?|[\/=?](?:File|Image):)[^\s>]*>?/imu;

export function learningReviewForm() {
  return {
    id: 'fixture-learning-review-amc12', version: 'review-v1', title: 'Learning review fixture',
    durationMs: 75 * 60 * 1000, published: false, testOnly: true, publicationStatus: 'test-only',
    sourceSchemaVersion: 'amc-practice-private-form-v1', sourceManifestHash: H.manifest,
    contentHash: H.content, questionBundleHash: H.bundle, provenance: { fixture: true },
    scoringPolicy: { id: 'fixture', version: '1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0 },
    manifestHash: H.manifest, publishEligible: false, developmentPublishEligible: true,
    questions: Array.from({ length: 25 }, (_, index) => ({
      number: index + 1,
      promptMarkdown: `Safe fixture prompt ${index + 1}.`,
      choices: ['A', 'B', 'C', 'D', 'E'].map((option) => ({ option, textMarkdown: `Choice ${option} for ${index + 1}` })),
      correctOption: ['A', 'B', 'C', 'D', 'E'][index % 5],
      acceptedOptions: [['A', 'B', 'C', 'D', 'E'][index % 5]],
      isScored: true,
      solutionMarkdown: `Legacy first solution ${index + 1}`
    }))
  };
}

function solution(form, question, index, candidateSchemaVersion, {
  visual = false,
  identityOffset = 0,
  bodyLabel = ''
} = {}) {
  const identity = index + identityOffset;
  const solutionId = `solution-${String(identity).padStart(3, '0')}`;
  const bodyMarkdown = visual
    ? `Approved method ${identity}${bodyLabel ? ` ${bodyLabel}` : ''} needs ![diagram](private.png).\n`
    : `Approved safe method ${identity}${bodyLabel ? ` ${bodyLabel}` : ''} for question ${question.number}.\n`;
  const sourceRef = {
    path: `fixture/Problem_${String(question.number).padStart(2, '0')}.md`,
    sha256: H.source,
    headingLine: index * 10,
    endLine: index * 10 + 5
  };
  const approval = {
    reviewerId: `reviewer:fixture-${index}`,
    reviewedAt: `2026-08-0${index}T12:00:00Z`,
    rightsStatus: 'approved-for-ai-use', qualityFlags: [],
    methodTags: [index === 1 ? 'algebra' : 'casework']
  };
  const bodySha256 = createHash('sha256').update(bodyMarkdown).digest('hex');
  const decisionRecordHash = canonicalHash({
    approvalPolicyVersion: 'amc-explicit-human-solution-approval-v1',
    candidateSchemaVersion,
    candidateSetHash: H.candidate,
    formId: form.id,
    formVersion: form.version,
    questionNumber: question.number,
    solutionId,
    decision: 'approved',
    bodySha256,
    sourceRef: { path: sourceRef.path, sha256: sourceRef.sha256 },
    reviewerId: approval.reviewerId,
    reviewedAt: approval.reviewedAt,
    rightsStatus: approval.rightsStatus,
    qualityFlags: approval.qualityFlags,
    methodTags: approval.methodTags
  });
  const authorityReceipt = {
    receiptId: `receipt:${form.id}:${question.number}:${identity}`,
    authorityId: APPROVAL_AUTHORITY_ID,
    issuedAt: `2026-08-1${index}T12:00:00Z`,
    status: 'active'
  };
  return {
    solutionId, title: `Approved method ${identity}${bodyLabel ? ` ${bodyLabel}` : ''}`,
    bodyMarkdown, bodySha256, sourceRef,
    modelEligibility: {
      eligible: !visual,
      reason: visual ? 'solution-visual-context-unavailable' : null
    },
    approval: { ...approval, decisionRecordHash, authorityReceipt }
  };
}

function receiptSet(receipts) {
  const value = {
    schemaVersion: 'amc-solution-approval-receipt-set-v1',
    audience: 'private-approval-authority-allowlist',
    authorityId: APPROVAL_AUTHORITY_ID,
    receipts: structuredClone(receipts)
  };
  value.receiptSetHash = canonicalHash(value);
  return value;
}

function buildForm(form, {
  readyNumbers = [1], candidateSchemaVersion = 'amc-question-context-candidate-set-v1',
  visualQuestionNumbers = [], visualSolutionNumbers = [], extraVisualSolutionNumbers = [],
  solutionIdentityOffset = 0, solutionBodyLabel = ''
} = {}) {
  const approved = new Set(readyNumbers);
  const visualQuestions = new Set(visualQuestionNumbers);
  const visualSolutions = new Set(visualSolutionNumbers);
  const extraVisualSolutions = new Set(extraVisualSolutionNumbers);
  const questions = form.questions.map((inputQuestion) => {
    const question = structuredClone(inputQuestion);
    const alreadyVisual = VISUAL_REFERENCE.test(question.promptMarkdown);
    if (visualQuestions.has(question.number) && !alreadyVisual) question.promptMarkdown += ' ![figure](private.png)';
    const sourceRef = { path: `fixture/Problem_${String(question.number).padStart(2, '0')}.md`, sha256: H.source };
    const choices = Object.fromEntries(question.choices.map((choice) => [choice.option, choice.textMarkdown]));
    const projection = { number: question.number, sourceRef, promptMarkdown: question.promptMarkdown, choices };
    const approvedSolutions = approved.has(question.number)
      ? [solution(form, question, 1, candidateSchemaVersion, {
        identityOffset: solutionIdentityOffset, bodyLabel: solutionBodyLabel
      }), solution(form, question, 2, candidateSchemaVersion, {
        visual: visualSolutions.has(question.number),
        identityOffset: solutionIdentityOffset, bodyLabel: solutionBodyLabel
      })]
      : [];
    if (approved.has(question.number) && extraVisualSolutions.has(question.number)) {
      approvedSolutions.push(solution(form, question, 3, candidateSchemaVersion, {
        visual: true, identityOffset: solutionIdentityOffset, bodyLabel: solutionBodyLabel
      }));
    }
    const questionVisual = visualQuestions.has(question.number) || alreadyVisual;
    const eligibleCount = approvedSolutions.filter((item) => item.modelEligibility.eligible).length;
    const contextReady = !questionVisual && eligibleCount >= 2;
    return {
      ...projection,
      questionContentHash: canonicalHash(projection),
      visualContext: {
        required: questionVisual,
        modelAvailable: !questionVisual,
        reason: questionVisual ? 'question-visual-context-unavailable' : null
      },
      contextReady,
      availability: {
        status: contextReady ? 'ready' : 'unavailable',
        approvedSolutionCount: approvedSolutions.length,
        modelEligibleSolutionCount: eligibleCount,
        requiredSolutionCount: 2,
        reason: questionVisual ? 'question-visual-context-unavailable'
          : (contextReady ? null : 'fewer-than-two-model-eligible-approved-solutions')
      },
      approvedSolutions
    };
  });
  const formProjection = {
    id: form.id, version: form.version,
    questions: questions.map(({ number, sourceRef, promptMarkdown, choices }) => ({ number, sourceRef, promptMarkdown, choices }))
  };
  const readyCount = questions.filter((question) => question.contextReady).length;
  return {
    schemaVersion: 'amc-approved-question-context-set-v1', audience: 'private-ai-context-only',
    approvalPolicyVersion: 'amc-explicit-human-solution-approval-v1',
    formBinding: {
      id: form.id, version: form.version, candidateSchemaVersion,
      candidateSetHash: H.candidate, contextContentHash: canonicalHash(formProjection),
      releaseBinding: {
        questionBundleHash: form.questionBundleHash, contentHash: form.contentHash, manifestHash: form.manifestHash
      }
    },
    reviewDecisionBinding: { schemaVersion: 'amc-question-context-review-decisions-v1', decisionSetHash: H.decision },
    approvalAuthorityBinding: null,
    summary: {
      questionCount: 25,
      approvedSolutionCount: questions.reduce((sum, question) => sum + question.approvedSolutions.length, 0),
      contextReadyQuestionCount: readyCount, unavailableQuestionCount: 25 - readyCount,
      minimumApprovedSolutionsPerQuestion: 2
    },
    questions, disclaimer: 'Private fixture with no answer key.'
  };
}

function receiptsFromForms(forms) {
  return forms.flatMap((form) => form.questions.flatMap((question) =>
    question.approvedSolutions.map((item) => ({
      ...item.approval.authorityReceipt,
      decisionRecordHash: item.approval.decisionRecordHash
    }))));
}

function bindAuthority(form, approvalReceipts) {
  form.approvalAuthorityBinding = {
    schemaVersion: approvalReceipts.schemaVersion,
    authorityId: approvalReceipts.authorityId,
    receiptSetHash: approvalReceipts.receiptSetHash
  };
  form.setHash = canonicalHash(form);
  return form;
}

export function approvedContextArtifact(form, options = {}) {
  const artifact = buildForm(form, options);
  const approvalReceipts = receiptSet(receiptsFromForms([artifact]));
  return bindAuthority(artifact, approvalReceipts);
}

export function approvalReceiptsForArtifact(artifact) {
  const forms = [
    'amc-approved-question-context-archive-set-v1',
    'amc-approved-question-context-archive-set-v2'
  ].includes(artifact.schemaVersion)
    ? artifact.forms : [artifact];
  return receiptSet(receiptsFromForms(forms));
}

/** Build a production v2 wrapper with the real practice-content Python compiler. */
export function pythonV2ApprovedArchiveFixture(release, { targetId = 'amc12-2012-b' } = {}) {
  const script = fileURLToPath(new URL('./support/generate-v2-approved-archive.py', import.meta.url));
  return JSON.parse(execFileSync('python3', [script, targetId], {
    input: JSON.stringify(release), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
  }));
}

export function approvedArchiveContextArtifact(forms) {
  const artifacts = forms.map(({ form, readyNumbers, visualQuestionNumbers, visualSolutionNumbers, extraVisualSolutionNumbers }) => buildForm(form, {
    readyNumbers, visualQuestionNumbers, visualSolutionNumbers, extraVisualSolutionNumbers,
    candidateSchemaVersion: 'amc-question-context-archive-candidate-set-v1'
  }));
  const approvalReceipts = receiptSet(receiptsFromForms(artifacts));
  artifacts.forEach((artifact) => bindAuthority(artifact, approvalReceipts));
  const artifact = {
    schemaVersion: 'amc-approved-question-context-archive-set-v1', audience: 'private-ai-context-only',
    approvalPolicyVersion: 'amc-explicit-human-solution-approval-v1',
    candidateSetBinding: {
      schemaVersion: 'amc-question-context-archive-candidate-set-v1', setHash: H.candidate,
      archiveRelease: {
        batchSchemaVersion: 'amc-practice-archive-release-batch-v1', releaseVersion: 'fixture-archive-v1',
        sourcePath: 'fixtures/archive-release.json', sourceSha256: H.source
      }
    },
    reviewDecisionBinding: { schemaVersion: 'amc-question-context-review-decisions-v1', decisionSetHash: H.decision },
    approvalAuthorityBinding: structuredClone(artifacts[0].approvalAuthorityBinding),
    summary: {
      formCount: artifacts.length,
      questionCount: artifacts.reduce((sum, item) => sum + item.summary.questionCount, 0),
      approvedSolutionCount: artifacts.reduce((sum, item) => sum + item.summary.approvedSolutionCount, 0),
      contextReadyQuestionCount: artifacts.reduce((sum, item) => sum + item.summary.contextReadyQuestionCount, 0),
      unavailableQuestionCount: artifacts.reduce((sum, item) => sum + item.summary.unavailableQuestionCount, 0)
    },
    forms: artifacts, disclaimer: 'Private approved archive fixture.'
  };
  artifact.setHash = canonicalHash(artifact);
  return artifact;
}

export class FakeInferenceClient {
  constructor({ failQuestions = [], failureCode = 'PROVIDER_FAILED' } = {}) {
    this.calls = [];
    this.failQuestions = new Set(failQuestions);
    this.failureCode = failureCode;
  }

  async analyze(request) {
    this.calls.push(structuredClone(request));
    const number = Number(request.question.question_id.split(':')[1]);
    if (this.failQuestions.has(number)) throw Object.assign(new Error('redacted'), { code: this.failureCode });
    const v3 = request.schema === 'amc-inference-request-v3';
    return {
      analysis: {
        schema: v3 ? 'amc-question-analysis-v3' : 'amc-question-analysis-v2',
        correlation_id: request.correlation_id,
        input_hash: request.input_hash, context_hash: request.context_hash,
        assessability: { status: 'ASSESSABLE', reasons: ['Reasoning can be assessed.'] },
        classification: request.question.student_response_mode === 'ANSWER_ONLY'
          ? 'ANSWER_ONLY' : 'CORRECT_WITH_REASONING_GAPS',
        summary: `Safe analysis for question ${number}.`,
        strengths: ['A useful start.'], gaps: ['One justification is missing.'],
        suggestions: ['State the missing justification.'],
        solution_comparisons: request.question.solutions.map((item) => ({
          solution_id: item.solution_id, alignment: 'PARTIALLY_ALIGNS',
          observation: 'The approach overlaps with this approved method.'
        })), confidence: 0.8
      },
      runMetadata: {
        provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
        promptVersion: v3 ? 'amc-question-analysis-prompt-v3' : 'amc-question-analysis-prompt-v2',
        schemaVersion: v3 ? 'amc-question-analysis-v3' : 'amc-question-analysis-v2',
        usage: { inputTokens: 800, cachedInputTokens: 120, outputTokens: 200, totalTokens: 1000, reasoningTokens: 50 }
      }
    };
  }
}
