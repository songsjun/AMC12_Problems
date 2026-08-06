import test from 'node:test';
import assert from 'node:assert/strict';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import {
  approvedContextArtifact,
  approvalReceiptsForArtifact,
  FakeInferenceClient,
  learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';
import { makeService } from './helpers.js';

const QUESTION_NUMBERS = Array.from({ length: 25 }, (_, index) => index + 1);
const UNAVAILABLE_REASONING_CANARY = 'UNAVAILABLE_REASONING_CANARY_6f35c7d9';

function precondition(attempt) {
  return {
    expectedAnswersRevision: attempt.answersRevision,
    expectedStateRevision: attempt.stateRevision
  };
}

class PaperInferenceClient extends FakeInferenceClient {
  constructor({ paperFailure = null } = {}) {
    super();
    this.paperCalls = [];
    this.paperFailure = paperFailure;
  }

  async assessPaper(request) {
    this.paperCalls.push(structuredClone(request));
    if (this.paperFailure) throw Object.assign(new Error('redacted'), this.paperFailure);
    return {
      assessment: {
        schema: 'amc-paper-assessment-v1',
        correlation_id: request.correlation_id,
        input_hash: request.input_hash,
        context_hash: request.context_hash,
        summary: 'The paper contains one assessable method and one answer-only response.',
        strengths: [{
          title: 'Useful initial reasoning',
          analysis: 'Question 1 contains a valid starting step.',
          evidence_basis: 'METHOD',
          evidence_question_numbers: [1]
        }],
        growth_areas: [{
          title: 'Verify selected answers',
          analysis: 'The selected answer on question 2 is not accepted.',
          evidence_basis: 'ANSWER_PATTERN',
          evidence_question_numbers: [2]
        }],
        priority_actions: [{
          priority: 1,
          title: 'Show more checkable work',
          rationale: 'Most questions have no assessable written reasoning.',
          next_step: 'Write at least one checkable step before selecting an answer.',
          evidence_basis: 'COVERAGE_PATTERN',
          evidence_question_numbers: [3, 25]
        }],
        limitations: ['Question 25 has no model-available approved context.'],
        confidence: 0.8
      },
      runMetadata: {
        provider: 'openai',
        requestedModel: 'gpt-5.6-terra',
        responseModel: 'gpt-5.6-terra-2026-07-15',
        promptVersion: 'amc-paper-assessment-prompt-v1',
        schemaVersion: 'amc-paper-assessment-v1',
        usage: {
          inputTokens: 2400,
          cachedInputTokens: 300,
          outputTokens: 600,
          totalTokens: 3000,
          reasoningTokens: 100
        }
      }
    };
  }
}

async function runPaperScenario({ paperFailure = null } = {}) {
  const context = await makeService();
  const form = learningReviewForm();
  Object.assign(form.questions[23], {
    isScored: false,
    correctOption: null,
    acceptedOptions: []
  });
  form.questions[24].promptMarkdown += ' ![figure](private.png)';
  await context.store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  const artifact = approvedContextArtifact(form, {
    readyNumbers: QUESTION_NUMBERS,
    visualQuestionNumbers: [25]
  });
  await new ApprovedContextImporter({
    store: context.store,
    clock: context.clock.now,
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));

  const created = await context.service.createAttempt(context.student.id, form.id);
  await context.service.putAnswers(context.student.id, created.attempt.id, {
    revision: created.attempt.answersRevision,
    answers: [
      { questionNumber: 1, selectedOption: 'A' },
      { questionNumber: 2, selectedOption: 'A' },
      { questionNumber: 25, selectedOption: 'E' }
    ]
  });
  let attempt = await context.service.getAttempt(context.student.id, created.attempt.id);
  await context.service.putReasoning(context.student.id, attempt.id, `reasoning-${attempt.id}`, {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'Use a direct algebraic count.' },
      { questionNumber: 25, reasoningText: UNAVAILABLE_REASONING_CANARY }
    ]
  });
  attempt = await context.service.getAttempt(context.student.id, attempt.id);
  await context.service.final(
    context.student.id,
    attempt.id,
    `final-${attempt.id}`,
    precondition(attempt)
  );

  const client = new PaperInferenceClient({ paperFailure });
  const worker = new LearningReviewWorker({
    store: context.store,
    inferenceClient: client,
    workerId: paperFailure ? 'paper-worker-failure' : 'paper-worker-success',
    clock: context.clock.now
  });
  const workerResult = await worker.runOnce();
  const report = await context.service.getLearningReport(context.student.id, attempt.id);
  const durableReport = [...context.store.learningReports.values()][0];
  const analyses = [...context.store.questionAnalyses.values()][0];
  return { ...context, form, artifact, attempt, client, workerResult, report, durableReport, analyses };
}

test('LearningReviewWorker sends one complete 25-question paper request with unavailable context redacted', async () => {
  const scenario = await runPaperScenario();

  assert.deepEqual(scenario.workerResult, {
    processed: true,
    status: 'PARTIAL',
    providerCalls: 3
  });
  assert.equal(scenario.client.calls.length, 2, 'question 1 reasoning and question 2 answer-only are analyzed');
  assert.equal(scenario.client.paperCalls.length, 1, 'one whole-paper call follows question analysis');

  const request = scenario.client.paperCalls[0];
  assert.equal(request.paper.questions.length, 25);
  assert.deepEqual(request.paper.questions.map((question) => question.question_number), QUESTION_NUMBERS);
  for (const question of request.paper.questions.slice(0, 24)) {
    const approved = scenario.artifact.questions[question.question_number - 1];
    const eligible = approved.approvedSolutions.filter((solution) => solution.modelEligibility.eligible);
    assert.equal(question.context_status, 'AVAILABLE');
    assert.equal(question.prompt_markdown, approved.promptMarkdown);
    assert.deepEqual(
      question.choices.map(({ label, text_markdown: textMarkdown }) => ({ label, textMarkdown })),
      Object.entries(approved.choices).map(([label, textMarkdown]) => ({ label, textMarkdown }))
    );
    assert.deepEqual(
      question.solutions.map((solution) => ({
        id: solution.solution_id,
        title: solution.title,
        markdown: solution.markdown,
        methodTags: solution.method_tags
      })),
      eligible.map((solution) => ({
        id: solution.solutionId,
        title: solution.title,
        markdown: solution.bodyMarkdown,
        methodTags: solution.approval.methodTags
      }))
    );
  }

  const unavailable = request.paper.questions[24];
  assert.deepEqual(request.paper.questions[23].scoring, {
    is_scored: false,
    canonical_answer: null,
    accepted_options: [],
    student_answer: null,
    student_answer_status: 'UNSCORED'
  });
  assert.deepEqual({
    contextStatus: unavailable.context_status,
    prompt: unavailable.prompt_markdown,
    choices: unavailable.choices,
    solutions: unavailable.solutions,
    evidenceMode: unavailable.evidence_mode,
    studentReasoning: unavailable.student_reasoning,
    canonicalAnswer: unavailable.scoring.canonical_answer,
    acceptedOptions: unavailable.scoring.accepted_options,
    questionAnalysis: unavailable.question_analysis
  }, {
    contextStatus: 'UNAVAILABLE',
    prompt: null,
    choices: [],
    solutions: [],
    evidenceMode: 'ANSWER_ONLY',
    studentReasoning: '',
    canonicalAnswer: null,
    acceptedOptions: [],
    questionAnalysis: {
      status: 'UNASSESSABLE',
      outcome_code: 'CONTEXT_UNAVAILABLE',
      reasoning_verdict: null,
      summary: 'Approved comparison context is unavailable for this question.',
      strengths: [], gaps: [], suggestions: []
    }
  });
  assert.equal(JSON.stringify(request).includes(UNAVAILABLE_REASONING_CANARY), false,
    'student reasoning from an unavailable question must never enter the Gateway payload');
  assert.equal(JSON.stringify(unavailable).includes('Safe fixture prompt 25'), false);
  assert.equal(JSON.stringify(unavailable).includes('Approved safe method'), false);

  assert.deepEqual(scenario.report.summary.wholeTestAssessment.evidenceCoverage, {
    totalQuestions: 25,
    answeredCount: 3,
    correctCount: 2,
    incorrectCount: 1,
    blankCount: 21,
    unscoredCount: 1,
    reasoningAnalyzedCount: 1,
    answerOnlyCount: 2,
    contextUnavailableCount: 1,
    failedCount: 0
  });
  assert.equal(scenario.report.summary.wholeTestAssessment.status, 'SUCCEEDED');
  assert.equal(scenario.report.questions.length, 25);
});

test('whole-paper provider failure is fail-soft and leaves the complete question report unchanged', async () => {
  const succeeded = await runPaperScenario();
  const failed = await runPaperScenario({
    paperFailure: { code: 'GATEWAY_TIMEOUT', retryable: true, errorClass: 'transient' }
  });

  assert.equal(failed.client.paperCalls.length, 1);
  assert.deepEqual(failed.workerResult, {
    processed: true,
    status: 'PARTIAL',
    providerCalls: 3
  });
  assert.equal(failed.report.status, succeeded.report.status);
  assert.deepEqual(failed.report.questions, succeeded.report.questions);
  assert.equal(failed.analyses.length, 25);
  assert.deepEqual(
    failed.report.summary.wholeTestAssessment.evidenceCoverage,
    succeeded.report.summary.wholeTestAssessment.evidenceCoverage
  );
  assert.equal(failed.report.summary.wholeTestAssessment.status, 'FAILED');
  assert.equal(failed.report.summary.wholeTestAssessment.summaryMarkdown,
    'Whole-test synthesis is temporarily unavailable; the objective score and question-by-question report are unaffected.');
  assert.deepEqual(failed.report.summary.wholeTestAssessment.strengths, []);
  assert.deepEqual(failed.report.summary.wholeTestAssessment.growthAreas, []);
  assert.deepEqual(failed.report.summary.wholeTestAssessment.priorityActions, []);
  assert.equal(failed.durableReport.status, 'PARTIAL');
});
