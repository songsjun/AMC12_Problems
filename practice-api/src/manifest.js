import { createHash } from 'node:crypto';
import { OPTIONS, DEFAULT_DURATION_MS, isOption, roundPoints } from './domain.js';
import { badRequest } from './errors.js';

const DEFAULT_LEGACY_POLICY = Object.freeze({
  id: 'amc-legacy',
  version: '1',
  correctPoints: 6,
  blankPoints: 1.5,
  incorrectPoints: 0
});

function isScoreValue(value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= 1_000
    && value === Number(value.toFixed(4));
}

function asNonEmptyString(value, name, max = 200_000) {
  if (typeof value !== 'string' || value.trim() === '' || value.length > max) {
    throw badRequest('INVALID_MANIFEST', `${name} must be a non-empty string no longer than ${max} characters.`);
  }
  return value;
}

function asSafePositiveInteger(value, name, max = 10_000) {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    throw badRequest('INVALID_MANIFEST', `${name} must be an integer from 1 to ${max}.`);
  }
  return value;
}

function normalizeChoices(choices, questionNumber) {
  let normalized;
  if (Array.isArray(choices)) {
    normalized = choices.map((choice) => ({
      option: choice?.option,
      textMarkdown: choice?.textMarkdown ?? choice?.text
    }));
  } else if (choices && typeof choices === 'object') {
    normalized = OPTIONS.map((option) => ({ option, textMarkdown: choices[option] }));
  } else {
    throw badRequest('INVALID_MANIFEST', `Question ${questionNumber} choices must be an A-E object or array.`);
  }
  if (normalized.length !== OPTIONS.length || normalized.some((choice, index) => choice.option !== OPTIONS[index])) {
    throw badRequest('INVALID_MANIFEST', `Question ${questionNumber} must define exactly A-E choices in order.`);
  }
  return normalized.map((choice) => ({
    option: choice.option,
    textMarkdown: asNonEmptyString(choice.textMarkdown, `Question ${questionNumber} choice ${choice.option}`)
  }));
}

function normalizePolicy(policy) {
  const candidate = policy || DEFAULT_LEGACY_POLICY;
  const numbers = ['correctPoints', 'blankPoints', 'incorrectPoints'];
  for (const key of numbers) {
    if (!isScoreValue(candidate[key])) {
      throw badRequest('INVALID_MANIFEST', `scoringPolicy.${key} must be a finite number from 0 to 1000 with at most four decimal places.`);
    }
  }
  return {
    id: asNonEmptyString(candidate.id || 'amc-legacy', 'scoringPolicy.id', 100),
    version: asNonEmptyString(String(candidate.version || '1'), 'scoringPolicy.version', 100),
    correctPoints: candidate.correctPoints,
    blankPoints: candidate.blankPoints,
    incorrectPoints: candidate.incorrectPoints
  };
}

function sha256Canonical(value) {
  return createHash('sha256').update(`${canonicalJson(value)}\n`, 'utf8').digest('hex');
}

// Matches practice-content/amc_content/canonical.py: UTF-8 JSON, sorted keys,
// compact separators, and one final newline. The private v1 contract uses this
// exact hash for both the public projection and the private manifest.
function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  throw badRequest('INVALID_MANIFEST', 'Private manifest cannot contain undefined values.');
}

function isLowerSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

function strictPrivatePolicy(input, questionCount) {
  const policy = input.scoringPolicy;
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 scoringPolicy must be an object.');
  }
  const version = asNonEmptyString(input.scoringPolicyVersion, 'scoringPolicyVersion', 100);
  if (policy.version !== version) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 scoringPolicy.version must equal scoringPolicyVersion.');
  }
  for (const key of ['correct', 'blank', 'incorrect', 'maxScore']) {
    if (!isScoreValue(policy[key])) {
      throw badRequest('INVALID_MANIFEST', `Private v1 scoringPolicy.${key} must be a finite number from 0 to 1000 with at most four decimal places.`);
    }
  }
  if (policy.questionCount !== questionCount || questionCount !== 25) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 scoringPolicy.questionCount and questions must both equal 25.');
  }
  if (roundPoints(policy.maxScore) !== roundPoints(policy.correct * questionCount)) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 scoringPolicy.maxScore must equal correct × questionCount.');
  }
  return {
    id: version,
    version,
    correctPoints: policy.correct,
    blankPoints: policy.blank,
    incorrectPoints: policy.incorrect,
    questionCount,
    maxScore: policy.maxScore
  };
}

function normalizePrivateV1(input) {
  const required = [
    'schemaVersion', 'id', 'version', 'title', 'publicationStatus', 'isSynthetic', 'durationSeconds',
    'scoringPolicyVersion', 'scoringPolicy', 'questionBundleHash', 'contentHash', 'manifestHash', 'provenance', 'questions'
  ];
  const missing = required.filter((key) => input[key] === undefined);
  if (missing.length) throw badRequest('INVALID_MANIFEST', `Private v1 manifest is missing: ${missing.join(', ')}.`);
  if (input.schemaVersion !== 'amc-practice-private-form-v1') {
    throw badRequest('INVALID_MANIFEST', 'Unsupported private manifest schemaVersion.');
  }
  const publicationStatus = input.publicationStatus;
  if (!['review-required', 'approved', 'test-only'].includes(publicationStatus)) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 publicationStatus must be review-required, approved, or test-only.');
  }
  if (typeof input.isSynthetic !== 'boolean' || (input.isSynthetic && publicationStatus !== 'test-only')
    || (publicationStatus === 'approved' && input.isSynthetic)) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 synthetic/publication status combination is invalid.');
  }
  if (input.durationSeconds !== 4_500) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 durationSeconds must be exactly 4500.');
  }
  for (const key of ['questionBundleHash', 'contentHash', 'manifestHash']) {
    if (!isLowerSha256(input[key])) throw badRequest('INVALID_MANIFEST', `Private v1 ${key} must be a lowercase SHA-256 hash.`);
  }
  if (!input.provenance || typeof input.provenance !== 'object' || Array.isArray(input.provenance)) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 provenance must be an object.');
  }
  if (!Array.isArray(input.questions) || input.questions.length !== 25) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 manifest must contain exactly 25 questions.');
  }
  const questions = input.questions.map((question, index) => {
    const number = index + 1;
    if (!question || typeof question !== 'object' || Array.isArray(question) || question.number !== number) {
      throw badRequest('INVALID_MANIFEST', `Private v1 question ${number} must occur in sequential order.`);
    }
    const allowed = new Set(['number', 'sourceRef', 'promptMarkdown', 'choices', 'correctOption', 'solutionMarkdown']);
    const unexpected = Object.keys(question).filter((key) => !allowed.has(key));
    if (unexpected.length) {
      throw badRequest('INVALID_MANIFEST', `Private v1 question ${number} has unsupported fields: ${unexpected.join(', ')}.`);
    }
    const sourceRef = question.sourceRef;
    if (!sourceRef || typeof sourceRef !== 'object' || Array.isArray(sourceRef)
      || Object.keys(sourceRef).some((key) => !['path', 'sha256'].includes(key))
      || !asNonEmptyString(sourceRef.path, `Private v1 question ${number} sourceRef.path`, 1000)
      || !isLowerSha256(sourceRef.sha256)) {
      throw badRequest('INVALID_MANIFEST', `Private v1 question ${number} needs a source path and lowercase SHA-256.`);
    }
    if (!isOption(question.correctOption)) {
      throw badRequest('INVALID_MANIFEST', `Private v1 question ${number} correctOption must be A-E.`);
    }
    return {
      number,
      promptMarkdown: asNonEmptyString(question.promptMarkdown, `Private v1 question ${number} promptMarkdown`),
      choices: normalizeChoices(question.choices, number),
      correctOption: question.correctOption,
      solutionMarkdown: asNonEmptyString(question.solutionMarkdown, `Private v1 question ${number} solutionMarkdown`)
    };
  });
  const expectedPrivateHash = sha256Canonical(Object.fromEntries(Object.entries(input).filter(([key]) => key !== 'manifestHash')));
  if (input.manifestHash !== expectedPrivateHash) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 manifestHash does not match canonical private content.');
  }
  const publicProjection = {
    schemaVersion: 'amc-practice-public-form-v1',
    id: input.id,
    version: input.version,
    title: input.title,
    publicationStatus: input.publicationStatus,
    isSynthetic: input.isSynthetic,
    durationSeconds: input.durationSeconds,
    scoringPolicyVersion: input.scoringPolicyVersion,
    scoringPolicy: input.scoringPolicy,
    questionBundleHash: input.questionBundleHash,
    questions: input.questions.map((question) => ({
      number: question.number,
      promptMarkdown: question.promptMarkdown,
      choices: question.choices
    }))
  };
  publicProjection.contentHash = sha256Canonical(publicProjection);
  if (input.contentHash !== publicProjection.contentHash) {
    throw badRequest('INVALID_MANIFEST', 'Private v1 contentHash does not match its canonical public projection.');
  }
  return {
    id: asNonEmptyString(input.id, 'id', 160),
    version: asNonEmptyString(input.version, 'version', 100),
    title: asNonEmptyString(input.title, 'title', 300),
    durationMs: input.durationSeconds * 1_000,
    // `published` is always runtime state. Approved content is publication
    // eligible; a test-only fixture gets a distinct dev-only eligibility bit.
    publishEligible: publicationStatus === 'approved',
    developmentPublishEligible: publicationStatus === 'test-only',
    published: false,
    testOnly: input.isSynthetic || publicationStatus === 'test-only',
    publicationStatus,
    sourceSchemaVersion: input.schemaVersion,
    contentHash: input.contentHash,
    questionBundleHash: input.questionBundleHash,
    sourceManifestHash: input.manifestHash,
    provenance: structuredClone(input.provenance),
    scoringPolicy: strictPrivatePolicy(input, questions.length),
    questions,
    manifestHash: input.manifestHash
  };
}

/**
 * Normalizes the content-pipeline contract. `published` deliberately defaults
 * to false: importer callers must explicitly opt in to publishing verified data.
 */
export function normalizeManifest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('INVALID_MANIFEST', 'Manifest must be a JSON object.');
  }
  if (input.schemaVersion === 'amc-practice-private-form-v1') return normalizePrivateV1(input);
  const id = asNonEmptyString(input.id ?? input.formId, 'id', 160);
  const version = asNonEmptyString(String(input.version ?? '1'), 'version', 100);
  const title = asNonEmptyString(input.title ?? id, 'title', 300);
  const durationMinutes = input.durationMinutes;
  const durationMs = input.durationMs ?? (durationMinutes === undefined ? DEFAULT_DURATION_MS : durationMinutes * 60_000);
  if (!Number.isSafeInteger(durationMs) || durationMs < 60_000 || durationMs > 24 * 60 * 60 * 1000) {
    throw badRequest('INVALID_MANIFEST', 'durationMs/durationMinutes must be from one minute to 24 hours.');
  }
  if (!Array.isArray(input.questions) || input.questions.length === 0 || input.questions.length > 100) {
    throw badRequest('INVALID_MANIFEST', 'questions must be an array with 1-100 entries.');
  }
  const seen = new Set();
  const questions = input.questions.map((question) => {
    if (!question || typeof question !== 'object') throw badRequest('INVALID_MANIFEST', 'Each question must be an object.');
    const number = asSafePositiveInteger(question.number, 'question.number', 100);
    if (seen.has(number)) throw badRequest('INVALID_MANIFEST', `Question number ${number} is duplicated.`);
    seen.add(number);
    const correctOption = question.correctOption;
    if (!isOption(correctOption)) throw badRequest('INVALID_MANIFEST', `Question ${number} correctOption must be A-E.`);
    return {
      number,
      promptMarkdown: asNonEmptyString(question.promptMarkdown ?? question.prompt, `Question ${number} promptMarkdown`),
      choices: normalizeChoices(question.choices, number),
      correctOption,
      solutionMarkdown: asNonEmptyString(question.solutionMarkdown ?? question.solution, `Question ${number} solutionMarkdown`)
    };
  }).sort((a, b) => a.number - b.number);
  return {
    id,
    version,
    title,
    durationMs,
    publishEligible: input.published === true && input.testOnly !== true && input.isSynthetic !== true,
    developmentPublishEligible: input.testOnly === true || input.isSynthetic === true,
    published: false,
    testOnly: input.testOnly === true || input.isSynthetic === true,
    publicationStatus: input.publicationStatus || (input.published === true ? 'approved' : 'draft'),
    sourceSchemaVersion: input.schemaVersion || 'generic-content-form-v1',
    contentHash: input.contentHash || null,
    questionBundleHash: input.questionBundleHash || null,
    sourceManifestHash: input.manifestHash || null,
    provenance: input.provenance && typeof input.provenance === 'object' ? structuredClone(input.provenance) : null,
    scoringPolicy: normalizePolicy(input.scoringPolicy),
    questions
  };
}

export function manifestHash(manifest) {
  // Normalized property order is deterministic by construction.
  return createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
}

export function manifestToStoredForm(input) {
  const manifest = normalizeManifest(input);
  return { ...manifest, manifestHash: manifest.manifestHash || manifestHash(manifest) };
}

export { DEFAULT_LEGACY_POLICY };
