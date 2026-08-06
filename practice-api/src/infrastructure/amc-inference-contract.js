import { createHash } from 'node:crypto';

export const ANALYSIS_CONTRACT_VERSION = 'amc-analysis-contract-v3';
export const INFERENCE_REQUEST_SCHEMA = 'amc-inference-request-v3';
export const INFERENCE_TASK = 'question_analysis_v3';
export const INFERENCE_RESPONSE_SCHEMA = 'amc-question-analysis-v3';
export const INFERENCE_PROMPT_VERSION = 'amc-question-analysis-prompt-v3';
export const INFERENCE_CONTEXT_HASH_SCHEMA = 'amc-question-context-hash-v3';
export const INFERENCE_INPUT_HASH_SCHEMA = 'amc-student-input-hash-v3';
export const INFERENCE_SAFETY_PROFILE = 'amc-math-safe-v1';
export const STUDENT_RESPONSE_MODES = Object.freeze({
  ANSWER_ONLY: 'ANSWER_ONLY',
  REASONING: 'REASONING'
});
export const ANSWER_ONLY_ASSESSABILITY_REASON =
  'Only the selected answer is available; no student reasoning was provided.';
export const ANSWER_ONLY_ACCEPTED_SUMMARY =
  'The selected answer is accepted, but no student reasoning was provided to evaluate.';
export const ANSWER_ONLY_NOT_ACCEPTED_SUMMARY =
  'The selected answer is not accepted, and no student reasoning was provided to evaluate.';
export const ANSWER_ONLY_GAP =
  "No student reasoning was provided, so the student's method cannot be evaluated.";
export const ANSWER_ONLY_COMPARISON_PREFIX =
  'No student reasoning was provided, so alignment with this solution cannot be assessed.';
export const ANSWER_ONLY_SUGGESTION =
  'Write the steps that led to the selected answer, then compare them with the approved methods below.';

export const ANALYSIS_CONTRACTS = Object.freeze({
  'amc-analysis-contract-v2': Object.freeze({
    analysisContractVersion: 'amc-analysis-contract-v2',
    requestSchema: 'amc-inference-request-v2',
    task: 'question_analysis_v2',
    responseSchema: 'amc-question-analysis-v2',
    promptVersion: 'amc-question-analysis-prompt-v2',
    contextHashSchema: 'amc-question-context-hash-v2',
    inputHashSchema: 'amc-student-input-hash-v2',
    path: '/v2/analyze-question'
  }),
  [ANALYSIS_CONTRACT_VERSION]: Object.freeze({
    analysisContractVersion: ANALYSIS_CONTRACT_VERSION,
    requestSchema: INFERENCE_REQUEST_SCHEMA,
    task: INFERENCE_TASK,
    responseSchema: INFERENCE_RESPONSE_SCHEMA,
    promptVersion: INFERENCE_PROMPT_VERSION,
    contextHashSchema: INFERENCE_CONTEXT_HASH_SCHEMA,
    inputHashSchema: INFERENCE_INPUT_HASH_SCHEMA,
    path: '/v3/analyze-question'
  })
});
export const SUPPORTED_ANALYSIS_CONTRACT_VERSIONS = Object.freeze(Object.keys(ANALYSIS_CONTRACTS));

export function analysisContractForVersion(version) {
  return ANALYSIS_CONTRACTS[version] || null;
}

export function analysisContractForRequest(request) {
  return Object.values(ANALYSIS_CONTRACTS).find((contract) =>
    request?.schema === contract.requestSchema && request?.task === contract.task) || null;
}

const OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const ACTIVE_MARKDOWN_OR_LINK = /(?:!\[[^\]]*\]\s*(?:\(|\[)|\[[^\]]+\]\s*(?:\(|\[)|^\s*\[[^\]]+\]:|\b[a-z][a-z0-9+.-]{0,31}:\S|www\.|<[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+>)/imu;
const RAW_HTML = /(?:<!--|<![^>]*>|<\?[^>]*>|<\/?[A-Za-z][A-Za-z0-9-]*(?:[\s/][^<>]*)?>)/iu;
const DANGEROUS_TEX = /\\(?:catcode|class|csname|cssId|def|edef|endcsname|every|expandafter|href|htmlClass|htmlData|htmlId|htmlStyle|immediate|include|includegraphics|input|loop|newcommand|openin|openout|read|renewcommand|repeat|require|setOptions|special|style|url|usepackage|write|write18)\b/iu;
const INVALID_TEXT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/u;

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

export function isBoundedInferenceInputText(value, minimumBytes, maximumBytes) {
  if (typeof value !== 'string' || INVALID_TEXT.test(value) || hasUnpairedSurrogate(value)) return false;
  const bytes = Buffer.byteLength(value, 'utf8');
  return bytes >= minimumBytes && bytes <= maximumBytes;
}

export function isRestrictedInferenceOutputText(value, minimumBytes, maximumBytes) {
  return isBoundedInferenceInputText(value, minimumBytes, maximumBytes)
    && !ACTIVE_MARKDOWN_OR_LINK.test(value) && !RAW_HTML.test(value) && !DANGEROUS_TEX.test(value);
}

// This is deliberately byte-for-byte compatible with the gateway's frozen
// canonicalStableJson implementation. It is separate from the approved
// artifact canonicalizer, whose schema includes a trailing newline.
export function canonicalInferenceJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON rejects non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalInferenceJson).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => {
      if (value[key] === undefined) throw new TypeError('Canonical JSON rejects undefined.');
      return `${JSON.stringify(key)}:${canonicalInferenceJson(value[key])}`;
    }).join(',')}}`;
  }
  throw new TypeError('Canonical JSON accepts only JSON values.');
}

export function inferenceSha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function deriveStudentAnswerStatus(studentAnswer, acceptedOptions) {
  if (studentAnswer === null) return 'BLANK';
  return acceptedOptions.includes(studentAnswer) ? 'ACCEPTED' : 'NOT_ACCEPTED';
}

/** Mirrors the Gateway's mechanically constrained ANSWER_ONLY result. */
export function buildAnswerOnlyAnalysis(request) {
  if (request?.question?.student_response_mode !== STUDENT_RESPONSE_MODES.ANSWER_ONLY) {
    throw new TypeError('Answer-only analysis requires ANSWER_ONLY response mode.');
  }
  return {
    schema: INFERENCE_RESPONSE_SCHEMA,
    correlation_id: request.correlation_id,
    input_hash: request.input_hash,
    context_hash: request.context_hash,
    assessability: {
      status: 'PARTIALLY_ASSESSABLE',
      reasons: [ANSWER_ONLY_ASSESSABILITY_REASON]
    },
    classification: 'ANSWER_ONLY',
    summary: request.question.student_answer_status === 'ACCEPTED'
      ? ANSWER_ONLY_ACCEPTED_SUMMARY : ANSWER_ONLY_NOT_ACCEPTED_SUMMARY,
    strengths: [],
    gaps: [ANSWER_ONLY_GAP],
    suggestions: [ANSWER_ONLY_SUGGESTION],
    solution_comparisons: request.question.solutions.map((solution, index) => ({
      solution_id: solution.solution_id,
      alignment: 'NOT_COMPARABLE',
      observation: `${ANSWER_ONLY_COMPARISON_PREFIX} Approved solution ${index + 1} includes reviewed method tags such as: ${solution.method_tags.slice(0, 3).join(', ')}.`
    })),
    confidence: 1
  };
}

export function isValidAnalysisScoringSnapshot(value, responseSelectedOption) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).sort().join(',') !== [
        'acceptedOptions', 'canonicalAnswer', 'isScored', 'selectedOption', 'studentAnswerIsCorrect'
      ].sort().join(',')
      || value.selectedOption !== responseSelectedOption
      || !(value.selectedOption === null || OPTIONS.includes(value.selectedOption))
      || typeof value.isScored !== 'boolean' || !Array.isArray(value.acceptedOptions)) return false;
  if (!value.isScored) {
    return value.canonicalAnswer === null && value.acceptedOptions.length === 0
      && value.studentAnswerIsCorrect === null;
  }
  if (!OPTIONS.includes(value.canonicalAnswer) || value.acceptedOptions.length < 1
      || value.acceptedOptions.length > OPTIONS.length) return false;
  let previous = -1;
  for (const option of value.acceptedOptions) {
    const position = OPTIONS.indexOf(option);
    if (position < 0 || position <= previous) return false;
    previous = position;
  }
  if (!value.acceptedOptions.includes(value.canonicalAnswer)) return false;
  const expectedCorrect = value.selectedOption === null
    ? null : value.acceptedOptions.includes(value.selectedOption);
  return value.studentAnswerIsCorrect === expectedCorrect;
}

export function computeInferenceContextHash(request) {
  const contract = analysisContractForRequest(request);
  if (!contract) throw new TypeError('Unknown analysis inference contract.');
  const question = request.question;
  return inferenceSha256(canonicalInferenceJson({
    schema: contract.contextHashSchema,
    question_id: question.question_id,
    prompt_markdown: question.prompt_markdown,
    choices: question.choices,
    scoring: question.scoring,
    solutions: question.solutions
  }));
}

export function computeInferenceInputHash(request) {
  const contract = analysisContractForRequest(request);
  if (!contract) throw new TypeError('Unknown analysis inference contract.');
  const input = {
    schema: contract.inputHashSchema,
    context_hash: request.context_hash,
    student_answer: request.question.student_answer,
    student_answer_status: request.question.student_answer_status,
    student_reasoning: request.question.student_reasoning
  };
  if (contract.analysisContractVersion === ANALYSIS_CONTRACT_VERSION) {
    input.student_response_mode = request.question.student_response_mode;
  }
  return inferenceSha256(canonicalInferenceJson(input));
}
