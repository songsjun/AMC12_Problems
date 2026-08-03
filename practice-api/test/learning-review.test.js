import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildApp } from '../src/app.js';
import { ApiError } from '../src/errors.js';
import { ApprovedContextImporter, validateApprovedContextArtifact } from '../src/learning-review/artifact.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import {
  approvedArchiveContextArtifact,
  approvedContextArtifact,
  approvalReceiptsForArtifact,
  FakeInferenceClient,
  learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';
import { cookiesFromResponse, makeService } from './helpers.js';

function precondition(attempt) {
  return { expectedAnswersRevision: attempt.answersRevision, expectedStateRevision: attempt.stateRevision };
}

async function setup(mutateForm = () => {}) {
  const context = await makeService();
  const form = learningReviewForm();
  mutateForm(form);
  await context.store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  return { ...context, form };
}

function validateArtifact(artifact) {
  return validateApprovedContextArtifact(artifact, {
    approvalReceipts: approvalReceiptsForArtifact(artifact),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
}

function importArtifact(context, artifact) {
  return new ApprovedContextImporter({
    store: context.store, clock: context.clock.now,
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceiptsForArtifact(artifact));
}

function providerAuthorizationInput(claimed, question, workerId, now) {
  const eligibleSolutions = question.context.solutions
    .filter((solution) => solution.modelEligibility?.eligible === true
      && solution.authorityReceipt?.status === 'active')
    .map((solution) => ({
      artifactSolutionId: solution.artifactSolutionId,
      bodySha256: solution.bodySha256,
      sourceSha256: solution.sourceRef.sha256,
      decisionRecordHash: solution.decisionRecordHash,
      authorityReceiptId: solution.authorityReceipt.receiptId
    }));
  return {
    workItemId: claimed.workItem.id,
    analysisRunId: claimed.run.id,
    workerId,
    leaseToken: claimed.workItem.leaseToken,
    inputHash: claimed.workItem.inputHash,
    deletionGeneration: claimed.workItem.deletionGeneration,
    versionId: claimed.version.id,
    versionNumber: claimed.version.versionNumber,
    evidenceHash: claimed.version.evidenceHash,
    expectedStudentId: claimed.submission.studentId,
    expectedSubmissionCurrentVersion: claimed.submission.currentVersion,
    expectedContextSetId: claimed.version.contextSetId,
    questionNumber: question.questionNumber,
    questionResponseHash: canonicalHash({
      questionNumber: question.questionNumber,
      selectedOption: question.selectedOption,
      reasoningText: question.reasoningText,
      answerOrigin: question.answerOrigin
    }),
    questionContextHash: question.context.questionContentHash,
    isScored: question.scoring.isScored,
    canonicalAnswer: question.scoring.canonicalAnswer,
    acceptedOptions: question.scoring.acceptedOptions,
    studentAnswerIsCorrect: question.scoring.studentAnswerIsCorrect,
    selectedOption: question.scoring.selectedOption,
    eligibleSolutions,
    now
  };
}

async function finalizedWithReasoning(context, notes, answers = []) {
  const created = await context.service.createAttempt(context.student.id, context.form.id);
  let attempt = created.attempt;
  if (answers.length) {
    await context.service.putAnswers(context.student.id, attempt.id, {
      revision: attempt.answersRevision,
      answers
    });
    attempt = await context.service.getAttempt(context.student.id, attempt.id);
  }
  if (notes.length) {
    await context.service.putReasoning(context.student.id, attempt.id, `reasoning-${attempt.id}`, {
      revision: 0,
      notes
    });
    attempt = await context.service.getAttempt(context.student.id, attempt.id);
  }
  const finalized = await context.service.final(
    context.student.id,
    attempt.id,
    `final-${attempt.id}`,
    precondition(attempt)
  );
  return { attemptId: attempt.id, finalized };
}

async function apiSession(app) {
  const response = await app.inject({ method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode: 'student-access-code' } });
  return { cookie: cookiesFromResponse(response), csrf: response.json().csrfToken };
}

test('approved context validator rejects tamper, answer-key fields, and stale release lineage', async () => {
  const { form } = await setup();
  const valid = approvedContextArtifact(form, { readyNumbers: [1, 2] });
  assert.equal(validateArtifact(valid).forms.length, 1);

  for (const [name, mutate, pattern] of [
    ['hash tamper', (value) => { value.questions[0].promptMarkdown += 'tamper'; }, /questionContentHash|contextContentHash|setHash/],
    ['unknown answer', (value) => { value.questions[0].correctOption = 'A'; }, /exactly/],
    ['unpaired surrogate', (value) => { value.questions[0].approvedSolutions[0].bodyMarkdown = 'bad\uD800scalar'; }, /UTF-8 byte bound/],
    ['control character', (value) => { value.questions[0].approvedSolutions[0].bodyMarkdown = 'bad\u0001scalar'; }, /UTF-8 byte bound/],
    ['invalid calendar date', (value) => { value.questions[0].approvedSolutions[0].approval.reviewedAt = '2026-02-30T00:00:00Z'; }, /valid UTC/],
    ['invalid hour', (value) => { value.questions[0].approvedSolutions[0].approval.reviewedAt = '2026-01-01T24:00:00Z'; }, /valid UTC/],
    ['release mismatch', (value) => { value.formBinding.releaseBinding.contentHash = '0'.repeat(64); }, /setHash|stale/]
  ]) {
    const candidate = structuredClone(valid);
    mutate(candidate);
    assert.throws(() => validateArtifact(candidate), pattern, name);
  }
});

test('approved context import treats JSON object member order as non-semantic', async () => {
  const context = await setup();
  const artifact = approvedContextArtifact(context.form, { readyNumbers: [1, 2] });
  for (const question of artifact.questions) {
    question.choices = Object.fromEntries(Object.entries(question.choices).reverse());
  }
  assert.equal(validateArtifact(artifact).forms.length, 1);
  const imported = await importArtifact(context, artifact);
  assert.equal(imported.length, 1);
  assert.equal(imported[0].questions.length, 2);
});

test('independent approval authority receipts cannot be forged, revoked, duplicated, or replaced by test-only context', async () => {
  const { form } = await setup();
  const valid = approvedContextArtifact(form, { readyNumbers: [1] });
  const receipts = approvalReceiptsForArtifact(valid);
  assert.throws(() => validateApprovedContextArtifact(valid, {
    approvalReceipts: receipts, trustedAuthorityIds: new Set(['approval-authority:other'])
  }), /allowlist/);

  const forgedArtifact = structuredClone(valid);
  forgedArtifact.questions[0].approvedSolutions[0].approval.authorityReceipt.receiptId = 'receipt:forged:1';
  forgedArtifact.setHash = (await import('../src/learning-review/canonical.js')).canonicalHash(forgedArtifact, ['setHash']);
  assert.throws(() => validateApprovedContextArtifact(forgedArtifact, {
    approvalReceipts: receipts, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }), /independent authority receipt/);

  const revoked = structuredClone(receipts);
  revoked.receipts[0].status = 'revoked';
  revoked.receiptSetHash = (await import('../src/learning-review/canonical.js')).canonicalHash(revoked, ['receiptSetHash']);
  const revokedArtifact = structuredClone(valid);
  revokedArtifact.approvalAuthorityBinding.receiptSetHash = revoked.receiptSetHash;
  revokedArtifact.setHash = (await import('../src/learning-review/canonical.js')).canonicalHash(revokedArtifact, ['setHash']);
  assert.throws(() => validateApprovedContextArtifact(revokedArtifact, {
    approvalReceipts: revoked, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }), /active independent authority receipt/);

  const duplicated = structuredClone(receipts);
  duplicated.receipts.push({ ...duplicated.receipts[0], receiptId: 'receipt:duplicate:1', status: 'revoked' });
  duplicated.receiptSetHash = (await import('../src/learning-review/canonical.js')).canonicalHash(duplicated, ['receiptSetHash']);
  assert.throws(() => validateApprovedContextArtifact(valid, {
    approvalReceipts: duplicated, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }), /more than one receipt/);

  const testOnly = structuredClone(valid);
  testOnly.schemaVersion = 'amc-approved-question-context-test-set-v1';
  testOnly.audience = 'private-test-only';
  testOnly.formBinding.releaseBinding = null;
  assert.throws(() => validateApprovedContextArtifact(testOnly, {
    approvalReceipts: receipts, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }), /never production-importable/);
});

test('archive wrapper validation preserves lineage when a single artifact was already imported', async () => {
  const context = await setup();
  const single = approvedContextArtifact(context.form, { readyNumbers: [1] });
  const first = await importArtifact(context, single);
  const archive = approvedArchiveContextArtifact([{ form: context.form, readyNumbers: [1] }]);
  assert.equal(validateArtifact(archive).archiveSetHash, archive.setHash);
  const imported = await importArtifact(context, archive);
  assert.notEqual(imported[0].id, first[0].id, 'candidate-schema lineage produces a distinct approval artifact');
  assert.equal(imported[0].archiveWrapperSetHash, archive.setHash);
});

test('import stores only ready questions, queues new finals, analyzes independently, and GET is owner-scoped pure read', async () => {
  const context = await setup();
  const artifact = approvedContextArtifact(context.form, { readyNumbers: [1] });
  const imported = await importArtifact(context, artifact);
  assert.equal(imported.length, 1);
  assert.equal(imported[0].questions.length, 1);
  assert.equal(imported[0].questions[0].solutions.length, 2);

  const { attemptId, finalized } = await finalizedWithReasoning(context, [
    { questionNumber: 1, reasoningText: 'Use a direct algebraic count.' },
    { questionNumber: 2, reasoningText: 'Try a method without approved context.' }
  ]);
  assert.equal(finalized.learningSubmission.status, 'CONTEXT_READY');
  assert.equal(finalized.learningSubmission.analysisStatus, 'QUEUED');
  const scoreBefore = (await context.service.getResults(context.student.id, attemptId)).finalSubmission.score;

  const firstLease = await context.store.claimLearningAnalysisWork({
    workerId: 'memory-worker-observer', now: context.clock.now(), leaseMs: 1_000
  });
  assert.ok(firstLease);
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'RUNNING');
  context.clock.advance(1_001);

  const client = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'memory-worker-001', clock: context.clock.now
  });
  const outcome = await worker.runOnce();
  assert.deepEqual(outcome, { processed: true, status: 'PARTIAL', providerCalls: 1 });
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].question.solutions.length, 2);
  const analyses = [...context.store.questionAnalyses.values()][0];
  assert.equal(analyses.length, 25);
  assert.equal(analyses[0].status, 'SUCCEEDED');
  assert.equal(analyses[0].runMetadata.promptVersion, 'amc-question-analysis-prompt-v2');
  assert.equal(analyses[0].errorClass, null);
  assert.equal(analyses[1].outcomeCode, 'CONTEXT_UNAVAILABLE');
  assert.equal(analyses[1].providerInvoked, false);
  assert.equal(analyses[2].outcomeCode, 'BLANK_REASONING');
  assert.equal(analyses[2].providerInvoked, false);

  const before = structuredClone({
    work: context.store.learningWorkItems,
    reports: context.store.learningReports,
    analyses: context.store.questionAnalyses
  });
  const report = await context.service.getLearningReport(context.student.id, attemptId);
  assert.equal(report.status, 'PARTIAL');
  assert.equal(report.questions.length, 25);
  assert.equal(report.questions[0].solutionComparisons.length, 2);
  assert.deepEqual(report.questions[0].solutionComparisons.map((item) => item.methodTags), [['algebra'], ['casework']]);
  assert.equal(/solution-00|provider|prompt|model|raw/i.test(JSON.stringify(report)), false);
  assert.deepEqual({
    work: context.store.learningWorkItems,
    reports: context.store.learningReports,
    analyses: context.store.questionAnalyses
  }, before, 'GET must not mutate or enqueue work');
  assert.deepEqual((await context.service.getResults(context.student.id, attemptId)).finalSubmission.score, scoreBefore);

  await context.service.reset(context.student.id, attemptId, `reset-${attemptId}`);
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'PARTIAL');

  const other = await context.service.seedAccessCode({ code: 'learning-other-code', displayName: 'Other' });
  await assert.rejects(
    () => context.service.getLearningReport(other.id, attemptId),
    (error) => error instanceof ApiError && error.code === 'ATTEMPT_NOT_FOUND'
  );
});

test('visual context gates provider calls and a mixed context sends only model-eligible solutions', async () => {
  const blockedBase = await makeService();
  const blockedForm = learningReviewForm();
  blockedForm.questions[0].promptMarkdown += ' ![figure](private.png)';
  await blockedBase.store.importForm(blockedForm, { publish: true, allowTestOnlyPublish: true });
  const blocked = { ...blockedBase, form: blockedForm };
  const unavailable = approvedContextArtifact(blocked.form, {
    readyNumbers: [1], visualQuestionNumbers: [1]
  });
  const unavailableImport = await importArtifact(blocked, unavailable);
  assert.equal(unavailableImport[0].questions.length, 0);
  const blockedFinal = await finalizedWithReasoning(blocked, [{ questionNumber: 1, reasoningText: 'Needs the omitted diagram.' }]);
  assert.equal(blockedFinal.finalized.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const blockedClient = new FakeInferenceClient();
  const blockedWorker = new LearningReviewWorker({
    store: blocked.store, inferenceClient: blockedClient, workerId: 'visual-blocked-worker', clock: blocked.clock.now
  });
  assert.deepEqual(await blockedWorker.runOnce(), { processed: false });
  assert.equal(blockedClient.calls.length, 0);

  const mixed = await setup();
  const imported = await importArtifact(mixed, approvedContextArtifact(mixed.form, {
    readyNumbers: [1], extraVisualSolutionNumbers: [1]
  }));
  assert.equal(imported[0].questions[0].solutions.length, 3);
  assert.equal(imported[0].questions[0].modelEligibleSolutionCount, 2);
  await finalizedWithReasoning(mixed, [{ questionNumber: 1, reasoningText: 'A complete nonvisual derivation.' }]);
  const mixedClient = new FakeInferenceClient();
  const mixedWorker = new LearningReviewWorker({
    store: mixed.store, inferenceClient: mixedClient, workerId: 'visual-filter-worker', clock: mixed.clock.now
  });
  await mixedWorker.runOnce();
  assert.equal(mixedClient.calls.length, 1);
  assert.deepEqual(mixedClient.calls[0].question.solutions.map((item) => item.solution_id), ['solution-001', 'solution-002']);
});

test('Asymptote and linked-image source forms are deterministically unavailable visual context', () => {
  for (const syntax of ['\n```asy\ndraw((0,0)--(1,1));\n```', '\n~~~asy\ndraw(circle((0,0),1));\n~~~',
    '[asy]draw((0,0)--(1,1));[/asy]', '\\begin{asy} draw((0,0)--(1,1)); \\end{asy}',
    '[diagram](assets/figure.PNG?revision=2)',
    '[Image:figure.png](https://artofproblemsolving.com/wiki/index.php/Image:figure.png)',
    '[[File:figure.svg|thumb]]', '\n[diagram]: assets/figure.webp?revision=2']) {
    const form = learningReviewForm();
    form.questions[0].promptMarkdown += syntax;
    const artifact = approvedContextArtifact(form, { readyNumbers: [1] });
    assert.equal(artifact.questions[0].visualContext.required, true, syntax);
    assert.equal(artifact.questions[0].contextReady, false, syntax);
    assert.equal(validateArtifact(artifact).forms[0].questions[0].availability.reason,
      'question-visual-context-unavailable');
  }
});

test('approved importer matches the shared Python/JavaScript visual-reference parity vectors', () => {
  const fixture = JSON.parse(readFileSync(
    new URL('../../practice-content/fixtures/visual-reference-parity.json', import.meta.url), 'utf8'
  ));
  assert.equal(fixture.schemaVersion, 'amc-visual-reference-parity-v1');
  const form = learningReviewForm();
  for (const vector of fixture.vectors) {
    const candidate = structuredClone(form);
    candidate.questions[0].promptMarkdown = vector.text;
    const artifact = approvedContextArtifact(candidate, { readyNumbers: [1] });
    assert.equal(artifact.questions[0].visualContext.required, vector.expected, vector.name);
    assert.doesNotThrow(() => validateArtifact(artifact), vector.name);
  }
});

test('retryable provider failures use bounded backoff and persist no terminal report before retry succeeds', async () => {
  const context = await setup();
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
  const { attemptId } = await finalizedWithReasoning(context, [{ questionNumber: 1, reasoningText: 'Retry this reasoning.' }]);
  let fail = true;
  const successful = new FakeInferenceClient();
  const client = {
    calls: [],
    async analyze(request, options) {
      this.calls.push(structuredClone(request));
      if (fail) throw Object.assign(new Error('redacted'), {
        code: 'GATEWAY_CAPACITY', retryable: true, errorClass: 'rate_limit'
      });
      return successful.analyze(request, options);
    }
  };
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'retry-bounded-worker',
    clock: context.clock.now, maxAttempts: 3, retryBaseMs: 5_000, retryMaxMs: 20_000
  });
  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'RETRY_QUEUED', providerCalls: 1 });
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'QUEUED');
  assert.equal(context.store.learningReports.size, 0);
  assert.deepEqual(await worker.runOnce(), { processed: false });
  context.clock.advance(5_000);
  fail = false;
  assert.equal((await worker.runOnce()).status, 'PARTIAL');
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'PARTIAL');
});

test('shutdown aborts an in-flight learning Gateway call without persisting a stale outcome', async () => {
  const context = await setup();
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
  const { attemptId } = await finalizedWithReasoning(context, [{
    questionNumber: 1, reasoningText: 'This analysis is intentionally slow.'
  }]);
  const workerId = 'shutdown-learning-worker';
  const claimed = await context.store.claimLearningAnalysisWork({
    workerId, now: context.clock.now(), leaseMs: 120_000
  });
  let enteredResolve;
  const entered = new Promise((resolve) => { enteredResolve = resolve; });
  const client = {
    async analyze(_request, { signal }) {
      enteredResolve();
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), {
          code: 'GATEWAY_ABORTED', retryable: true, errorClass: 'transient'
        })), { once: true });
      });
    }
  };
  const controller = new AbortController();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId, clock: context.clock.now
  });
  const processing = worker.processClaimed(claimed, { signal: controller.signal });
  await entered;
  controller.abort();
  assert.deepEqual(await processing, { processed: false, shuttingDown: true });
  assert.equal(context.store.learningReports.size, 0);
  assert.equal(context.store.questionAnalyses.size, 0);
  const version = context.store.learningVersions
    .get(context.store.learningSubmissions.get(attemptId).id)[0];
  assert.equal(context.store.learningWorkItems.get(version.id)[0].status, 'RUNNING',
    'shutdown leaves the lease recoverable instead of writing terminal or retry state');
});

test('retryable failures become terminal after the configured maximum attempt count', async () => {
  const context = await setup();
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
  const { attemptId } = await finalizedWithReasoning(context, [{ questionNumber: 1, reasoningText: 'Always retry.' }]);
  const client = {
    calls: [],
    async analyze(request) {
      this.calls.push(structuredClone(request));
      throw Object.assign(new Error('redacted'), {
        code: 'GATEWAY_UNAVAILABLE', retryable: true, errorClass: 'transient'
      });
    }
  };
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'retry-exhaust-worker',
    clock: context.clock.now, maxAttempts: 2, retryBaseMs: 100, retryMaxMs: 100
  });
  assert.equal((await worker.runOnce()).status, 'RETRY_QUEUED');
  context.clock.advance(100);
  assert.equal((await worker.runOnce()).status, 'PARTIAL');
  context.clock.advance(10_000);
  assert.deepEqual(await worker.runOnce(), { processed: false });
  assert.equal(client.calls.length, 2);
  const report = await context.service.getLearningReport(context.student.id, attemptId);
  assert.equal(report.status, 'PARTIAL');
  assert.equal(report.summary.failedCount, 1);
});

test('blocked finals make zero provider calls and approved import internally repairs exact revision', async () => {
  const context = await setup();
  const { attemptId, finalized } = await finalizedWithReasoning(context, [
    { questionNumber: 1, reasoningText: 'A complete attempt.' }
  ]);
  assert.equal(finalized.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const client = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'memory-worker-002', clock: context.clock.now
  });
  assert.deepEqual(await worker.runOnce(), { processed: false });
  assert.equal(client.calls.length, 0);
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'CONTEXT_UNAVAILABLE');

  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
  assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'QUEUED');
  assert.equal((await worker.runOnce()).processed, true);
  assert.equal(client.calls.length, 1);
});

test('per-question provider authorization rejects post-claim lineage and solution-eligibility changes', async () => {
  for (const scenario of ['current-version', 'attempt-phase', 'solution-eligibility']) {
    const context = await setup();
    await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
    const { attemptId } = await finalizedWithReasoning(context, [
      { questionNumber: 1, reasoningText: 'Authorization must use the durable approved context.' }
    ]);
    const workerId = `reauthorize-${scenario}`;
    const claimed = await context.store.claimLearningAnalysisWork({
      workerId, now: context.clock.now(), leaseMs: 120_000
    });
    if (scenario === 'current-version') {
      context.store.learningSubmissions.get(attemptId).currentVersion += 1;
    } else if (scenario === 'attempt-phase') {
      context.store.attempts.get(attemptId).phase = 'ACTIVE';
    } else {
      const contextSet = context.store.approvedContextSets.get(claimed.version.contextSetId);
      contextSet.questions[0].solutions[0].modelEligibility.eligible = false;
    }
    const client = new FakeInferenceClient();
    const result = await new LearningReviewWorker({
      store: context.store, inferenceClient: client, workerId, clock: context.clock.now
    }).processClaimed(claimed);
    assert.deepEqual(result, { processed: false, staleLease: true }, scenario);
    assert.equal(client.calls.length, 0, scenario);
  }
});

test('v2 requests derive accepted-alternative, nonaccepted, and blank answer status from the immutable final snapshot', async () => {
  const context = await setup((form) => {
    Object.assign(form.questions[0], { correctOption: 'D', acceptedOptions: ['D', 'E'], isScored: true });
  });
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1, 2, 3] }));
  await finalizedWithReasoning(context, [
    { questionNumber: 1, reasoningText: 'An accepted alternative derivation.' },
    { questionNumber: 2, reasoningText: 'A nonaccepted derivation.' },
    { questionNumber: 3, reasoningText: 'A blank-answer derivation.' }
  ], [
    { questionNumber: 1, selectedOption: 'E' },
    { questionNumber: 2, selectedOption: 'A' }
  ]);
  const client = new FakeInferenceClient();
  const result = await new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'v2-answer-status-worker', clock: context.clock.now
  }).runOnce();
  assert.equal(result.providerCalls, 3);
  assert.deepEqual(client.calls.slice(0, 3).map((request) => ({
    schema: request.schema,
    task: request.task,
    scoring: request.question.scoring,
    answer: request.question.student_answer,
    status: request.question.student_answer_status
  })), [
    {
      schema: 'amc-inference-request-v2', task: 'question_analysis_v2',
      scoring: { is_scored: true, canonical_answer: 'D', accepted_options: ['D', 'E'] },
      answer: 'E', status: 'ACCEPTED'
    },
    {
      schema: 'amc-inference-request-v2', task: 'question_analysis_v2',
      scoring: { is_scored: true, canonical_answer: 'B', accepted_options: ['B'] },
      answer: 'A', status: 'NOT_ACCEPTED'
    },
    {
      schema: 'amc-inference-request-v2', task: 'question_analysis_v2',
      scoring: { is_scored: true, canonical_answer: 'C', accepted_options: ['C'] },
      answer: null, status: 'BLANK'
    }
  ]);
});

test('unscored questions bypass blank-reasoning and missing-context checks with zero provider calls', async () => {
  const context = await setup((form) => {
    for (const question of form.questions.slice(0, 3)) {
      Object.assign(question, { correctOption: null, acceptedOptions: [], isScored: false });
    }
  });
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1, 2, 3] }));
  await finalizedWithReasoning(context, [
    { questionNumber: 2, reasoningText: 'Nonblank but deliberately unscored.' },
    { questionNumber: 3, reasoningText: 'Context will disappear after claim.' }
  ], [
    { questionNumber: 2, selectedOption: 'A' },
    { questionNumber: 3, selectedOption: 'B' }
  ]);
  const workerId = 'unscored-provider-zero-worker';
  const claimed = await context.store.claimLearningAnalysisWork({
    workerId, now: context.clock.now(), leaseMs: 120_000
  });
  assert.equal(await context.store.authorizeLearningAnalysisProviderCall(
    providerAuthorizationInput(claimed, claimed.questions[0], workerId, context.clock.now())
  ), false, 'the provider authorization boundary itself rejects unscored snapshots');
  claimed.questions[2].context = null;
  const client = new FakeInferenceClient();
  const result = await new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId, clock: context.clock.now
  }).processClaimed(claimed);
  assert.equal(result.providerCalls, 0);
  assert.equal(client.calls.length, 0);
  const outcomes = context.store.questionAnalyses.get(claimed.run.id);
  assert.deepEqual(outcomes.slice(0, 3).map((outcome) => outcome.outcomeCode), [
    'QUESTION_UNSCORED', 'QUESTION_UNSCORED', 'QUESTION_UNSCORED'
  ]);
  assert.equal(outcomes.slice(0, 3).every((outcome) => outcome.providerInvoked === false), true);
});

test('invalid scoring snapshots and legacy v1 queued runs never reach the provider', async () => {
  const invalid = await setup();
  await importArtifact(invalid, approvedContextArtifact(invalid.form, { readyNumbers: [1] }));
  await finalizedWithReasoning(invalid, [
    { questionNumber: 1, reasoningText: 'This claim will carry a corrupt scoring snapshot.' }
  ], [{ questionNumber: 1, selectedOption: 'A' }]);
  const invalidWorkerId = 'invalid-scoring-worker';
  const claimed = await invalid.store.claimLearningAnalysisWork({
    workerId: invalidWorkerId, now: invalid.clock.now(), leaseMs: 120_000
  });
  claimed.questions[0].scoring.acceptedOptions = ['B'];
  const invalidClient = new FakeInferenceClient();
  const invalidResult = await new LearningReviewWorker({
    store: invalid.store, inferenceClient: invalidClient,
    workerId: invalidWorkerId, clock: invalid.clock.now
  }).processClaimed(claimed);
  assert.equal(invalidResult.providerCalls, 0);
  assert.equal(invalidClient.calls.length, 0);
  assert.equal(invalid.store.questionAnalyses.get(claimed.run.id)[0].outcomeCode, 'SCORING_SNAPSHOT_INVALID');

  const missing = await setup();
  await importArtifact(missing, approvedContextArtifact(missing.form, { readyNumbers: [1] }));
  await finalizedWithReasoning(missing, [
    { questionNumber: 1, reasoningText: 'This claim is missing one scoring field.' }
  ], [{ questionNumber: 1, selectedOption: 'A' }]);
  const missingWorkerId = 'missing-scoring-field-worker';
  const missingClaim = await missing.store.claimLearningAnalysisWork({
    workerId: missingWorkerId, now: missing.clock.now(), leaseMs: 120_000
  });
  delete missingClaim.questions[0].scoring.acceptedOptions;
  const missingClient = new FakeInferenceClient();
  const missingResult = await new LearningReviewWorker({
    store: missing.store, inferenceClient: missingClient,
    workerId: missingWorkerId, clock: missing.clock.now
  }).processClaimed(missingClaim);
  assert.equal(missingResult.processed, true);
  assert.equal(missingResult.providerCalls, 0);
  assert.equal(missingClient.calls.length, 0);
  assert.equal(
    missing.store.questionAnalyses.get(missingClaim.run.id)[0].outcomeCode,
    'SCORING_SNAPSHOT_INVALID'
  );

  const legacy = await setup();
  await importArtifact(legacy, approvedContextArtifact(legacy.form, { readyNumbers: [1] }));
  const { attemptId } = await finalizedWithReasoning(legacy, [
    { questionNumber: 1, reasoningText: 'A legacy run must stay isolated.' }
  ]);
  const submission = legacy.store.learningSubmissions.get(attemptId);
  const version = legacy.store.learningVersions.get(submission.id)[0];
  legacy.store.analysisRuns.get(version.id).analysisContractVersion = 'amc-analysis-contract-v1';
  assert.equal(await legacy.store.claimLearningAnalysisWork({
    workerId: 'legacy-v1-isolation-worker', now: legacy.clock.now(), leaseMs: 120_000
  }), null);
});

test('provider authorization re-reads and rejects drift in every final scoring field', async () => {
  const scenarios = [
    ['isScored', (snapshot) => { snapshot.isScored = false; }],
    ['canonicalAnswer', (snapshot) => { snapshot.correctOption = 'B'; }],
    ['acceptedOptions', (snapshot) => { snapshot.acceptedOptions = ['A', 'B']; }],
    ['studentAnswerIsCorrect', (snapshot) => { snapshot.isCorrect = false; }],
    ['selectedOption', (snapshot) => { snapshot.selectedOption = 'B'; }]
  ];
  for (const [name, mutate] of scenarios) {
    const context = await setup();
    await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
    const { attemptId } = await finalizedWithReasoning(context, [
      { questionNumber: 1, reasoningText: `Authorization drift scenario ${name}.` }
    ], [{ questionNumber: 1, selectedOption: 'A' }]);
    const workerId = `scoring-drift-${name}`;
    const claimed = await context.store.claimLearningAnalysisWork({
      workerId, now: context.clock.now(), leaseMs: 120_000
    });
    const submission = context.store.learningSubmissions.get(attemptId);
    const snapshot = context.store.submissionAnswers.get(submission.officialSubmissionId)[0];
    mutate(snapshot);
    const client = new FakeInferenceClient();
    const result = await new LearningReviewWorker({
      store: context.store, inferenceClient: client, workerId, clock: context.clock.now
    }).processClaimed(claimed);
    assert.deepEqual(result, { processed: false, staleLease: true }, name);
    assert.equal(client.calls.length, 0, name);
  }
});

test('blank reasoning is deterministic UNASSESSABLE while rich student markup remains valid input', async () => {
  const context = await setup();
  await importArtifact(context, approvedContextArtifact(context.form, {
    readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1)
  }));
  const { attemptId } = await finalizedWithReasoning(context, [
    { questionNumber: 1, reasoningText: '<custom-tag>unsupported</custom-tag>' }
  ]);
  const client = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: client, workerId: 'memory-worker-003', clock: context.clock.now
  });
  assert.equal((await worker.runOnce()).status, 'PARTIAL');
  assert.equal(client.calls.length, 1);
  const internal = [...context.store.questionAnalyses.values()][0];
  assert.equal(internal[0].status, 'SUCCEEDED');
  assert.equal(internal[1].outcomeCode, 'BLANK_REASONING');
  const report = await context.service.getLearningReport(context.student.id, attemptId);
  assert.equal(report.status, 'PARTIAL');
});

test('all assessable questions reach COMPLETE/PARTIAL/FAILED without changing official score', async () => {
  const allQuestions = Array.from({ length: 25 }, (_, index) => index + 1);
  for (const [failQuestions, expectedStatus] of [[[], 'COMPLETE'], [[2], 'PARTIAL'], [allQuestions, 'FAILED']]) {
    const context = await setup();
    await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: allQuestions }));
    const notes = Array.from({ length: 25 }, (_, index) => ({
      questionNumber: index + 1,
      reasoningText: `Reasoning for question ${index + 1}.`
    }));
    const { attemptId } = await finalizedWithReasoning(context, notes);
    const scoreBefore = (await context.service.getResults(context.student.id, attemptId)).finalSubmission.score;
    const client = new FakeInferenceClient({ failQuestions });
    const result = await new LearningReviewWorker({
      store: context.store, inferenceClient: client,
      workerId: failQuestions.length ? 'memory-worker-fail' : 'memory-worker-complete',
      clock: context.clock.now
    }).runOnce();
    assert.equal(result.status, expectedStatus);
    assert.equal(client.calls.length, 25);
    if (expectedStatus === 'FAILED') {
      const internal = [...context.store.questionAnalyses.values()][0];
      assert.equal(internal.every((analysis) => analysis.errorClass === 'permanent' && analysis.retryable === false), true);
      assert.equal((await context.service.getLearningReport(context.student.id, attemptId)).status, 'FAILED');
    }
    assert.deepEqual((await context.service.getResults(context.student.id, attemptId)).finalSubmission.score, scoreBefore);
  }
});

test('expired lease token fences an old process even when the new process reuses the same worker id', async () => {
  const context = await setup();
  await importArtifact(context, approvedContextArtifact(context.form, { readyNumbers: [1] }));
  await finalizedWithReasoning(context, [{ questionNumber: 1, reasoningText: 'Lease test reasoning.' }]);
  const first = await context.store.claimLearningAnalysisWork({
    workerId: 'lease-worker-shared', now: context.clock.now(), leaseMs: 1_000
  });
  assert.ok(first);
  context.clock.advance(1_001);
  const second = await context.store.claimLearningAnalysisWork({
    workerId: 'lease-worker-shared', now: context.clock.now(), leaseMs: 120_000
  });
  assert.equal(second.workItem.id, first.workItem.id);
  assert.equal(second.workItem.attemptCount, 2);
  assert.notEqual(second.workItem.leaseToken, first.workItem.leaseToken);
  assert.equal(await context.store.heartbeatLearningAnalysisWork({
    workItemId: first.workItem.id, workerId: 'lease-worker-shared', leaseToken: first.workItem.leaseToken,
    now: context.clock.now(), leaseMs: 120_000
  }), false);
  assert.equal(await context.store.completeLearningAnalysisWork({
    workItemId: first.workItem.id,
    analysisRunId: first.run.id,
    workerId: 'lease-worker-shared',
    expectedLeaseToken: first.workItem.leaseToken,
    expectedInputHash: first.workItem.inputHash,
    expectedDeletionGeneration: first.workItem.deletionGeneration,
    expectedVersionNumber: first.version.versionNumber,
    expectedStudentId: first.submission.studentId,
    expectedContextSetId: first.version.contextSetId,
    outcomes: [],
    report: { status: 'FAILED', generatedAt: context.clock.now(), summary: {}, reportHash: '0'.repeat(64) },
    now: context.clock.now()
  }), false);
  assert.equal(await context.store.retryLearningAnalysisWork({
    workItemId: first.workItem.id, analysisRunId: first.run.id, workerId: 'lease-worker-shared',
    expectedLeaseToken: first.workItem.leaseToken,
    expectedInputHash: first.workItem.inputHash,
    expectedDeletionGeneration: first.workItem.deletionGeneration,
    expectedVersionNumber: first.version.versionNumber,
    expectedStudentId: first.submission.studentId,
    expectedContextSetId: first.version.contextSetId,
    availableAt: context.clock.now(), now: context.clock.now(), lastErrorCode: 'GATEWAY_CAPACITY'
  }), false);
  assert.equal(await context.store.heartbeatLearningAnalysisWork({
    workItemId: second.workItem.id, workerId: 'lease-worker-shared', leaseToken: second.workItem.leaseToken,
    now: context.clock.now(), leaseMs: 120_000
  }), true);
  assert.equal(await context.store.retryLearningAnalysisWork({
    workItemId: second.workItem.id, analysisRunId: second.run.id, workerId: 'lease-worker-shared',
    expectedLeaseToken: second.workItem.leaseToken,
    expectedInputHash: second.workItem.inputHash,
    expectedDeletionGeneration: second.workItem.deletionGeneration,
    expectedVersionNumber: second.version.versionNumber,
    expectedStudentId: second.submission.studentId,
    expectedContextSetId: second.version.contextSetId,
    availableAt: context.clock.now(), now: context.clock.now(), lastErrorCode: 'RETRY_TEST'
  }), true);
});

test('learning-report HTTP endpoint is no-store, pre-final gated, and does not enqueue work', async () => {
  const context = await setup();
  const config = {
    basePath: '/api/amc12', bodyLimit: 64 * 1024,
    sessionSecret: 'test-cookie-secret-that-is-long-enough-for-cookie-signing',
    sessionTtlMs: 12 * 60 * 60 * 1000, cookieName: 'amc_session', csrfCookieName: 'amc_csrf',
    cookiePath: '/api/amc12', secureCookies: false, trustedProxy: 'loopback', corsOrigin: null
  };
  const app = await buildApp({ service: context.service, config, logger: false });
  const session = await apiSession(app);
  const attempt = await context.service.createAttempt(context.student.id, context.form.id);
  const before = structuredClone(context.store.learningWorkItems);
  const response = await app.inject({
    method: 'GET', url: `/api/amc12/attempts/${attempt.attempt.id}/learning-report`,
    headers: { cookie: session.cookie }
  });
  assert.equal(response.statusCode, 409);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.deepEqual(context.store.learningWorkItems, before);
  const current = await context.service.getAttempt(context.student.id, attempt.attempt.id);
  await context.service.final(context.student.id, attempt.attempt.id, `http-report-final-${attempt.attempt.id}`, precondition(current));
  const finalizedBefore = structuredClone(context.store.learningWorkItems);
  const finalizedResponse = await app.inject({
    method: 'GET', url: `/api/amc12/attempts/${attempt.attempt.id}/learning-report`,
    headers: { cookie: session.cookie }
  });
  assert.equal(finalizedResponse.statusCode, 200);
  assert.equal(finalizedResponse.headers['cache-control'], 'no-store');
  assert.equal(finalizedResponse.json().status, 'CONTEXT_UNAVAILABLE');
  assert.deepEqual(context.store.learningWorkItems, finalizedBefore);
  await app.close();
});
