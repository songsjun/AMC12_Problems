import {
  INFERENCE_SAFETY_PROFILE, canonicalInferenceJson, inferenceSha256,
  isBoundedInferenceInputText, isRestrictedInferenceOutputText
} from './amc-inference-contract.js';

export const PAPER_REQUEST_SCHEMA = 'amc-paper-assessment-request-v1';
export const PAPER_RESPONSE_SCHEMA = 'amc-paper-assessment-v1';
export const PAPER_TASK = 'paper_assessment_v1';
export const PAPER_PROMPT_VERSION = 'amc-paper-assessment-prompt-v1';
export const PAPER_CONTEXT_HASH_SCHEMA = 'amc-paper-context-hash-v1';
export const PAPER_INPUT_HASH_SCHEMA = 'amc-paper-input-hash-v1';
export const PAPER_PATH = '/v1/assess-paper';
export const PAPER_SAFETY_PROFILE = INFERENCE_SAFETY_PROFILE;
const HASH = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const TAG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const REVIEWER_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}$/;
const OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const UNAVAILABLE_ANALYSIS_SUMMARIES = Object.freeze({
  CONTEXT_UNAVAILABLE: 'Approved comparison context is unavailable for this question.',
  APPROVED_SOLUTIONS_UNAVAILABLE: 'Approved comparison context is unavailable for this question.',
  VISUAL_CONTEXT_UNAVAILABLE: 'This question depends on visual context that is not available in a model-safe form.'
});

export function computePaperContextHash(request) {
  return inferenceSha256(canonicalInferenceJson({
    schema: PAPER_CONTEXT_HASH_SCHEMA,
    form_id: request.paper.form_id,
    form_version: request.paper.form_version,
    questions: request.paper.questions.map((question) => ({
      question_number: question.question_number,
      context_status: question.context_status,
      prompt_markdown: question.prompt_markdown,
      choices: question.choices,
      scoring: {
        is_scored: question.scoring.is_scored,
        canonical_answer: question.scoring.canonical_answer,
        accepted_options: question.scoring.accepted_options
      },
      solutions: question.solutions
    }))
  }));
}

export function computePaperInputHash(request) {
  return inferenceSha256(canonicalInferenceJson({
    schema: PAPER_INPUT_HASH_SCHEMA,
    context_hash: request.context_hash,
    questions: request.paper.questions.map((question) => ({
      question_number: question.question_number,
      student_answer: question.scoring.student_answer,
      student_answer_status: question.scoring.student_answer_status,
      evidence_mode: question.evidence_mode,
      student_reasoning: question.student_reasoning,
      question_analysis: question.question_analysis
    }))
  }));
}

function exact(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join('\0') === [...keys].sort().join('\0');
}

function outputString(value, minimum, maximum) {
  return isRestrictedInferenceOutputText(value, minimum, maximum);
}

function outputList(value, minimum, maximum, bytes) {
  return Array.isArray(value) && value.length >= minimum && value.length <= maximum
    && value.every((item) => outputString(item, 1, bytes));
}

function inputList(value, minimum, maximum, bytes) {
  return Array.isArray(value) && value.length >= minimum && value.length <= maximum
    && value.every((item) => isBoundedInferenceInputText(item, 1, bytes));
}
function strictUtcTimestamp(value) {
  const match = typeof value === 'string'
    ? value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?Z$/)
    : null;
  if (!match) return false;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59;
}

function validPaperQuestion(question, expectedNumber) {
  if (!exact(question, [
    'question_number', 'context_status', 'prompt_markdown', 'choices', 'scoring',
    'evidence_mode', 'student_reasoning', 'solutions', 'question_analysis'
  ]) || question.question_number !== expectedNumber
      || !['AVAILABLE', 'UNAVAILABLE'].includes(question.context_status)
      || !['REASONING', 'ANSWER_ONLY', 'NONE'].includes(question.evidence_mode)
      || !isBoundedInferenceInputText(question.student_reasoning, 0, 12_000)
      || !Array.isArray(question.choices) || !Array.isArray(question.solutions)
      || !exact(question.scoring, [
        'is_scored', 'canonical_answer', 'accepted_options', 'student_answer', 'student_answer_status'
      ]) || !exact(question.question_analysis, [
        'status', 'outcome_code', 'reasoning_verdict', 'summary', 'strengths', 'gaps', 'suggestions'
      ])) return false;
  if (question.context_status === 'AVAILABLE') {
    if (!isBoundedInferenceInputText(question.prompt_markdown, 1, 16_384)
        || question.choices.length !== 5 || question.solutions.length < 2
        || question.solutions.length > 8) return false;
  } else if (question.prompt_markdown !== null || question.choices.length || question.solutions.length) return false;
  if (question.choices.some((choice, index) => !exact(choice, ['label', 'text_markdown'])
      || choice.label !== OPTIONS[index]
      || !isBoundedInferenceInputText(choice.text_markdown, 1, 2_048))) return false;
  const solutionIds = new Set();
  for (const solution of question.solutions) {
    if (!exact(solution, [
      'solution_id', 'approval_status', 'title', 'markdown', 'body_sha256', 'source_sha256',
      'reviewer_id', 'reviewed_at', 'rights_status', 'method_tags', 'quality_flags'
    ])
        || !ID.test(solution.solution_id) || solutionIds.has(solution.solution_id)
        || solution.approval_status !== 'APPROVED'
        || !isBoundedInferenceInputText(solution.title, 1, 256)
        || !isBoundedInferenceInputText(solution.markdown, 1, 16_384)
        || typeof solution.body_sha256 !== 'string' || !HASH.test(solution.body_sha256)
        || solution.body_sha256 !== inferenceSha256(solution.markdown)
        || typeof solution.source_sha256 !== 'string' || !HASH.test(solution.source_sha256)
        || typeof solution.reviewer_id !== 'string' || !REVIEWER_ID.test(solution.reviewer_id)
        || !strictUtcTimestamp(solution.reviewed_at)
        || solution.rights_status !== 'approved-for-ai-use'
        || !Array.isArray(solution.method_tags) || solution.method_tags.length < 1
        || solution.method_tags.length > 32 || new Set(solution.method_tags).size !== solution.method_tags.length
        || solution.method_tags.some((tag) => typeof tag !== 'string' || !TAG.test(tag))
        || !Array.isArray(solution.quality_flags) || solution.quality_flags.length > 32
        || new Set(solution.quality_flags).size !== solution.quality_flags.length
        || solution.quality_flags.some((tag) => typeof tag !== 'string' || !TAG.test(tag))) return false;
    solutionIds.add(solution.solution_id);
  }
  const scoring = question.scoring;
  if (typeof scoring.is_scored !== 'boolean'
      || !(scoring.student_answer === null || OPTIONS.includes(scoring.student_answer))
      || !Array.isArray(scoring.accepted_options)) return false;
  if (scoring.is_scored) {
    if (question.context_status === 'AVAILABLE') {
      if (!OPTIONS.includes(scoring.canonical_answer) || scoring.accepted_options.length < 1
          || scoring.accepted_options.length > OPTIONS.length
          || !scoring.accepted_options.includes(scoring.canonical_answer)) return false;
      let previous = -1;
      for (const option of scoring.accepted_options) {
        const position = OPTIONS.indexOf(option);
        if (position < 0 || position <= previous) return false;
        previous = position;
      }
    } else if (scoring.canonical_answer !== null || scoring.accepted_options.length) return false;
    const answerStatus = scoring.student_answer === null ? 'BLANK'
      : question.context_status === 'AVAILABLE'
        ? scoring.accepted_options.includes(scoring.student_answer) ? 'ACCEPTED' : 'NOT_ACCEPTED'
        : ['ACCEPTED', 'NOT_ACCEPTED'].includes(scoring.student_answer_status)
          ? scoring.student_answer_status : null;
    if (scoring.student_answer_status !== answerStatus) return false;
  } else if (scoring.canonical_answer !== null || scoring.accepted_options.length
      || scoring.student_answer_status !== 'UNSCORED') return false;
  const analysis = question.question_analysis;
  if (question.context_status === 'UNAVAILABLE') {
    const expectedEvidenceMode = scoring.student_answer === null ? 'NONE' : 'ANSWER_ONLY';
    return question.student_reasoning === '' && question.evidence_mode === expectedEvidenceMode
      && analysis.status === 'UNASSESSABLE'
      && typeof analysis.outcome_code === 'string'
      && Object.hasOwn(UNAVAILABLE_ANALYSIS_SUMMARIES, analysis.outcome_code)
      && analysis.reasoning_verdict === null
      && analysis.summary === UNAVAILABLE_ANALYSIS_SUMMARIES[analysis.outcome_code]
      && Array.isArray(analysis.strengths) && analysis.strengths.length === 0
      && Array.isArray(analysis.gaps) && analysis.gaps.length === 0
      && Array.isArray(analysis.suggestions) && analysis.suggestions.length === 0;
  }
  if ((question.evidence_mode === 'REASONING') !== (question.student_reasoning.trim().length > 0)
      || (question.evidence_mode === 'ANSWER_ONLY' && scoring.student_answer === null)
      || (question.evidence_mode === 'NONE' && scoring.student_answer !== null)) return false;
  return ['SUCCEEDED', 'UNASSESSABLE', 'FAILED'].includes(analysis.status)
    && (analysis.outcome_code === null
      || (typeof analysis.outcome_code === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(analysis.outcome_code)))
    && (analysis.reasoning_verdict === null || outputString(analysis.reasoning_verdict, 1, 2_000))
    && outputString(analysis.summary, 1, 2_000)
    && inputList(analysis.strengths, 0, 5, 600)
    && inputList(analysis.gaps, 0, 5, 600) && inputList(analysis.suggestions, 0, 5, 600);
}

function sortedEvidence(value, questionMap) {
  return Array.isArray(value) && value.length >= 1 && value.length <= 25
    && value.every((item, index) => Number.isSafeInteger(item) && questionMap.has(item)
      && (index === 0 || item > value[index - 1]));
}

export function validatePaperAssessment(value, request) {
  if (!exact(value, [
    'schema', 'correlation_id', 'input_hash', 'context_hash', 'summary', 'strengths',
    'growth_areas', 'priority_actions', 'limitations', 'confidence'
  ]) || value.schema !== PAPER_RESPONSE_SCHEMA || value.correlation_id !== request.correlation_id
      || value.input_hash !== request.input_hash || value.context_hash !== request.context_hash
      || !outputString(value.summary, 1, 1_600) || !Array.isArray(value.strengths)
      || value.strengths.length > 5 || !Array.isArray(value.growth_areas)
      || value.growth_areas.length > 5 || !Array.isArray(value.priority_actions)
      || value.priority_actions.length < 1 || value.priority_actions.length > 4
      || !outputList(value.limitations, 1, 8, 600) || !Number.isFinite(value.confidence)
      || value.confidence < 0 || value.confidence > 1) return false;
  const questionMap = new Map(request.paper.questions.map((question) => [question.question_number, question]));
  const insight = (item) => exact(item, [
    'title', 'analysis', 'evidence_basis', 'evidence_question_numbers'
  ]) && outputString(item.title, 1, 180) && outputString(item.analysis, 1, 800)
    && ['METHOD', 'ANSWER_PATTERN'].includes(item.evidence_basis)
    && sortedEvidence(item.evidence_question_numbers, questionMap)
    && item.evidence_question_numbers.every((number) => {
      const question = questionMap.get(number);
      return item.evidence_basis === 'METHOD'
        ? question.evidence_mode === 'REASONING' && question.question_analysis.status === 'SUCCEEDED'
        : question.context_status === 'AVAILABLE'
          && question.question_analysis.status === 'SUCCEEDED'
          && question.scoring.is_scored && question.scoring.student_answer !== null;
    });
  if (![...value.strengths, ...value.growth_areas].every(insight)) return false;
  return value.priority_actions.every((item, index) => exact(item, [
    'priority', 'title', 'rationale', 'next_step', 'evidence_basis', 'evidence_question_numbers'
  ]) && item.priority === index + 1 && outputString(item.title, 1, 180)
    && outputString(item.rationale, 1, 800) && outputString(item.next_step, 1, 800)
    && ['METHOD', 'ANSWER_PATTERN', 'COVERAGE_PATTERN'].includes(item.evidence_basis)
    && sortedEvidence(item.evidence_question_numbers, questionMap)
    && (item.evidence_basis !== 'METHOD' || item.evidence_question_numbers.every((number) => {
      const question = questionMap.get(number);
      return question.evidence_mode === 'REASONING' && question.question_analysis.status === 'SUCCEEDED';
    })) && (item.evidence_basis !== 'ANSWER_PATTERN' || item.evidence_question_numbers.every((number) => {
      const question = questionMap.get(number);
      return question.context_status === 'AVAILABLE'
        && question.question_analysis.status === 'SUCCEEDED'
        && question.scoring.is_scored && question.scoring.student_answer !== null;
    })));
}

export function validatePaperRequest(request) {
  if (!exact(request, [
    'schema', 'task', 'correlation_id', 'input_hash', 'context_hash', 'safety_id', 'paper'
  ]) || request.schema !== PAPER_REQUEST_SCHEMA || request.task !== PAPER_TASK
      || request.safety_id !== PAPER_SAFETY_PROFILE || !exact(request.paper, ['form_id', 'form_version', 'questions'])
      || typeof request.correlation_id !== 'string' || !ID.test(request.correlation_id)
      || typeof request.input_hash !== 'string' || !HASH.test(request.input_hash)
      || typeof request.context_hash !== 'string' || !HASH.test(request.context_hash)
      || !isBoundedInferenceInputText(request.paper.form_id, 1, 128)
      || !isBoundedInferenceInputText(request.paper.form_version, 1, 128)
      || !Array.isArray(request.paper.questions) || request.paper.questions.length !== 25
      || request.paper.questions.some((question, index) => !validPaperQuestion(question, index + 1))) return false;
  try {
    return request.context_hash === computePaperContextHash(request)
      && request.input_hash === computePaperInputHash(request)
      && Buffer.byteLength(JSON.stringify(request), 'utf8') <= 524_288;
  } catch { return false; }
}
