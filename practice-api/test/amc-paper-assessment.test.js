import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { AmcInferenceClient } from '../src/infrastructure/amc-inference-client.js';
import {
  PAPER_CONTEXT_HASH_SCHEMA,
  PAPER_INPUT_HASH_SCHEMA,
  PAPER_PATH,
  PAPER_PROMPT_VERSION,
  PAPER_REQUEST_SCHEMA,
  PAPER_RESPONSE_SCHEMA,
  PAPER_TASK,
  computePaperContextHash,
  computePaperInputHash
} from '../src/infrastructure/amc-paper-assessment-contract.js';

const TOKEN = 'gateway-token-that-is-long-enough-1234567890';
const LABELS = ['A', 'B', 'C', 'D', 'E'];

function availableContext(number) {
  return {
    context_status: 'AVAILABLE',
    prompt_markdown: `Paper assessment prompt ${number}.`,
    choices: LABELS.map((label) => ({
      label,
      text_markdown: `Choice ${label} for question ${number}`
    })),
    solutions: [1, 2].map((solutionNumber) => {
      const markdown = `Use approved method ${solutionNumber} for question ${number}.`;
      return {
        solution_id: `q${number}-solution-${solutionNumber}`,
        approval_status: 'APPROVED',
        title: `Question ${number} method ${solutionNumber}`,
        markdown,
        body_sha256: createHash('sha256').update(markdown).digest('hex'),
        source_sha256: String(solutionNumber + 3).repeat(64),
        reviewer_id: `reviewer:paper-${solutionNumber}`,
        reviewed_at: `2026-08-0${solutionNumber}T12:00:00Z`,
        rights_status: 'approved-for-ai-use',
        method_tags: [solutionNumber === 1 ? 'algebra' : 'casework'],
        quality_flags: []
      };
    })
  };
}

function questionFixture(number) {
  const canonicalAnswer = LABELS[(number - 1) % LABELS.length];
  const isFirst = number === 1;
  const isSecond = number === 2;
  const unavailable = number === 25;
  const studentAnswer = isFirst ? canonicalAnswer : isSecond ? 'A' : null;
  const answerStatus = studentAnswer === null ? 'BLANK'
    : studentAnswer === canonicalAnswer ? 'ACCEPTED' : 'NOT_ACCEPTED';
  const reasoning = isFirst ? `Student reasoning for question ${number}.` : '';
  const analysisSucceeded = isFirst || isSecond;
  return {
    question_number: number,
    ...(unavailable ? {
      context_status: 'UNAVAILABLE',
      prompt_markdown: null,
      choices: [],
      solutions: []
    } : availableContext(number)),
    scoring: {
      is_scored: true,
      canonical_answer: unavailable ? null : canonicalAnswer,
      accepted_options: unavailable ? [] : [canonicalAnswer],
      student_answer: studentAnswer,
      student_answer_status: answerStatus
    },
    evidence_mode: reasoning ? 'REASONING' : studentAnswer === null ? 'NONE' : 'ANSWER_ONLY',
    student_reasoning: reasoning,
    question_analysis: analysisSucceeded ? {
      status: 'SUCCEEDED',
      outcome_code: null,
      reasoning_verdict: isFirst ? 'CORRECT_WITH_REASONING_GAPS' : 'ANSWER_ONLY',
      summary: `Question ${number} analysis.`,
      strengths: isFirst ? ['A valid first step.'] : [],
      gaps: isFirst ? ['One justification is missing.'] : [],
      suggestions: ['Write a complete solution.']
    } : {
      status: 'UNASSESSABLE',
      outcome_code: unavailable ? 'CONTEXT_UNAVAILABLE' : 'BLANK_REASONING',
      reasoning_verdict: null,
      summary: unavailable
        ? 'Approved comparison context is unavailable for this question.'
        : 'No written reasoning was submitted for this question.',
      strengths: [],
      gaps: [],
      suggestions: []
    }
  };
}

export function paperRequestFixture() {
  const request = {
    schema: PAPER_REQUEST_SCHEMA,
    task: PAPER_TASK,
    correlation_id: 'paper:analysis-run-fixture-0001',
    input_hash: '0'.repeat(64),
    context_hash: '0'.repeat(64),
    safety_id: 'amc-math-safe-v1',
    paper: {
      form_id: 'fixture-learning-review-amc12',
      form_version: 'review-v1',
      questions: Array.from({ length: 25 }, (_, index) => questionFixture(index + 1))
    }
  };
  request.context_hash = computePaperContextHash(request);
  request.input_hash = computePaperInputHash(request);
  return request;
}

function assessmentFixture(request) {
  return {
    schema: PAPER_RESPONSE_SCHEMA,
    correlation_id: request.correlation_id,
    input_hash: request.input_hash,
    context_hash: request.context_hash,
    summary: 'The response shows one supported method and one incorrect selected answer.',
    strengths: [{
      title: 'Useful algebraic start',
      analysis: 'The reasoning on question 1 contains a valid first step.',
      evidence_basis: 'METHOD',
      evidence_question_numbers: [1]
    }],
    growth_areas: [{
      title: 'Check selected answers',
      analysis: 'The selected answer on question 2 is not accepted.',
      evidence_basis: 'ANSWER_PATTERN',
      evidence_question_numbers: [2]
    }],
    priority_actions: [{
      priority: 1,
      title: 'Increase written coverage',
      rationale: 'Most questions do not contain assessable written work.',
      next_step: 'Write at least one checkable step for each attempted question.',
      evidence_basis: 'COVERAGE_PATTERN',
      evidence_question_numbers: [3, 25]
    }],
    limitations: ['Only one question contains assessable reasoning.'],
    confidence: 0.82
  };
}

function successResponse(request, mutate = () => {}) {
  const payload = {
    ok: true,
    assessment: assessmentFixture(request),
    runMetadata: {
      provider: 'openai',
      requestedModel: 'gpt-5.6-terra',
      responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: PAPER_PROMPT_VERSION,
      schemaVersion: PAPER_RESPONSE_SCHEMA,
      usage: {
        inputTokens: 2400,
        cachedInputTokens: 300,
        outputTokens: 600,
        totalTokens: 3000,
        reasoningTokens: 100
      }
    }
  };
  mutate(payload);
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

function rehash(request) {
  request.context_hash = computePaperContextHash(request);
  request.input_hash = computePaperInputHash(request);
  return request;
}

test('paper assessment contract identifiers and fixed Gateway transport are frozen', async () => {
  assert.deepEqual([
    PAPER_REQUEST_SCHEMA,
    PAPER_TASK,
    PAPER_RESPONSE_SCHEMA,
    PAPER_PROMPT_VERSION,
    PAPER_CONTEXT_HASH_SCHEMA,
    PAPER_INPUT_HASH_SCHEMA,
    PAPER_PATH
  ], [
    'amc-paper-assessment-request-v1',
    'paper_assessment_v1',
    'amc-paper-assessment-v1',
    'amc-paper-assessment-prompt-v1',
    'amc-paper-context-hash-v1',
    'amc-paper-input-hash-v1',
    '/v1/assess-paper'
  ]);
  const request = paperRequestFixture();
  const calls = [];
  const client = new AmcInferenceClient({
    origin: 'http://127.0.0.1:4110',
    token: TOKEN,
    fetchImpl: async (...input) => {
      calls.push(input);
      return successResponse(request);
    }
  });

  const result = await client.assessPaper(request);

  assert.deepEqual(result.assessment, assessmentFixture(request));
  assert.equal(result.runMetadata.promptVersion, PAPER_PROMPT_VERSION);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'http://127.0.0.1:4110/v1/assess-paper');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].redirect, 'manual');
  assert.equal(calls[0][1].headers.authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(JSON.parse(calls[0][1].body), request);
});

test('assessPaper rejects malformed 25-question requests locally after semantic hashes are recomputed', async (t) => {
  const cases = [
    ['requires exactly 25 questions', (request) => { request.paper.questions.pop(); }],
    ['requires unique ordered question numbers', (request) => { request.paper.questions[1].question_number = 1; }],
    ['requires every available question to carry all comparison context', (request) => {
      request.paper.questions[0].solutions.pop();
    }],
    ['forbids prompt and solutions when context is unavailable', (request) => {
      Object.assign(request.paper.questions[24], availableContext(25));
      request.paper.questions[24].context_status = 'UNAVAILABLE';
    }],
    ['forbids reasoning when context is unavailable', (request) => {
      request.paper.questions[24].evidence_mode = 'REASONING';
      request.paper.questions[24].student_reasoning = 'UNAVAILABLE_REASONING_CANARY_6f35c7d9';
    }],
    ['requires the fixed unavailable-context analysis summary', (request) => {
      request.paper.questions[24].question_analysis.summary = 'Arbitrary unavailable analysis.';
    }],
    ['forbids analysis claims when context is unavailable', (request) => {
      request.paper.questions[24].question_analysis.strengths = ['Invented unavailable strength.'];
    }],
    ['requires answer status to agree with immutable scoring', (request) => {
      request.paper.questions[1].scoring.student_answer_status = 'ACCEPTED';
    }],
    ['requires evidence mode to agree with the submitted evidence', (request) => {
      request.paper.questions[2].evidence_mode = 'REASONING';
    }],
    ['rejects unknown members', (request) => { request.paper.questions[0].answer_key = 'A'; }]
  ];

  for (const [name, mutate] of cases) {
    await t.test(name, async () => {
      const request = paperRequestFixture();
      mutate(request);
      rehash(request);
      let transports = 0;
      const client = new AmcInferenceClient({
        token: TOKEN,
        fetchImpl: async () => {
          transports += 1;
          return successResponse(request);
        }
      });
      await assert.rejects(
        () => client.assessPaper(request),
        (error) => error.code === 'INVALID_LOCAL_REQUEST'
      );
      assert.equal(transports, 0);
    });
  }
});

test('assessPaper fails closed when model evidence is ineligible or the success envelope drifts', async (t) => {
  const request = paperRequestFixture();
  const cases = [
    ['METHOD cites context-unavailable analysis', (payload) => {
      payload.assessment.strengths[0].evidence_question_numbers = [25];
    }],
    ['ANSWER_PATTERN cites a blank response', (payload) => {
      payload.assessment.growth_areas[0].evidence_question_numbers = [3];
    }],
    ['evidence numbers are duplicated', (payload) => {
      payload.assessment.priority_actions[0].evidence_question_numbers = [3, 3];
    }],
    ['evidence numbers are unsorted', (payload) => {
      payload.assessment.priority_actions[0].evidence_question_numbers = [25, 3];
    }],
    ['evidence numbers are outside the submitted paper', (payload) => {
      payload.assessment.priority_actions[0].evidence_question_numbers = [26];
    }],
    ['renderable output contains an active link', (payload) => {
      payload.assessment.summary = '[unsafe](https://example.test)';
    }],
    ['response contains an unknown member', (payload) => {
      payload.assessment.unreviewed_claim = 'not allowed';
    }],
    ['metadata does not bind the paper contract', (payload) => {
      payload.runMetadata.promptVersion = 'amc-question-analysis-prompt-v3';
    }]
  ];

  for (const [name, mutate] of cases) {
    await t.test(name, async () => {
      let transports = 0;
      const client = new AmcInferenceClient({
        token: TOKEN,
        fetchImpl: async () => {
          transports += 1;
          return successResponse(request, mutate);
        }
      });
      await assert.rejects(
        () => client.assessPaper(request),
        (error) => error.code === 'GATEWAY_PROTOCOL_ERROR'
      );
      assert.equal(transports, 1);
    });
  }
});

test('ANSWER_PATTERN excludes unavailable and failed questions from insights and priority actions', async (t) => {
  const unavailable = paperRequestFixture();
  Object.assign(unavailable.paper.questions[24].scoring, {
    student_answer: 'A',
    student_answer_status: 'NOT_ACCEPTED'
  });
  unavailable.paper.questions[24].evidence_mode = 'ANSWER_ONLY';
  rehash(unavailable);

  const failed = paperRequestFixture();
  Object.assign(failed.paper.questions[1].question_analysis, {
    status: 'FAILED',
    outcome_code: 'GATEWAY_TIMEOUT',
    reasoning_verdict: null,
    summary: 'Analysis is temporarily unavailable for this question.',
    strengths: [], gaps: [], suggestions: []
  });
  rehash(failed);

  for (const [name, request, evidenceQuestionNumber] of [
    ['unavailable question', unavailable, 25],
    ['failed question analysis', failed, 2]
  ]) {
    for (const placement of ['growth insight', 'priority action']) {
      await t.test(`${name} in ${placement}`, async () => {
        const client = new AmcInferenceClient({
          token: TOKEN,
          fetchImpl: async () => successResponse(request, (payload) => {
            payload.assessment.growth_areas[0].evidence_question_numbers = [1];
            if (placement === 'growth insight') {
              payload.assessment.growth_areas[0].evidence_question_numbers = [evidenceQuestionNumber];
            } else {
              Object.assign(payload.assessment.priority_actions[0], {
                evidence_basis: 'ANSWER_PATTERN',
                evidence_question_numbers: [evidenceQuestionNumber]
              });
            }
          })
        });
        await assert.rejects(
          () => client.assessPaper(request),
          (error) => error.code === 'GATEWAY_PROTOCOL_ERROR'
        );
      });
    }
  }
});
