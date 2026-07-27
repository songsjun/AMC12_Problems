import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES, SUBMISSION_KINDS } from '../src/domain.js';
import { ApiError } from '../src/errors.js';
import { MemoryStore } from '../src/memory-store.js';
import { PracticeService } from '../src/service.js';
import { fixtureManifest, makeService } from './helpers.js';

const MINUTE = 60_000;

async function expectApiError(work, code) {
  await assert.rejects(work, (error) => error instanceof ApiError && error.code === code);
}

function scoringPrecondition(attempt) {
  return {
    expectedAnswersRevision: attempt.answersRevision,
    expectedStateRevision: attempt.stateRevision
  };
}

test('checkpoint is immutable, returns an immediate score, and does not disclose solutions before final', async () => {
  const { service, student } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const id = created.attempt.id;
  const updated = await service.putAnswers(student.id, id, {
    revision: 0,
    answers: [{ questionNumber: 1, selectedOption: 'A' }]
  });
  assert.equal(updated.answersRevision, 1);
  const checkpointInput = scoringPrecondition(updated);
  const checkpoint = await service.checkpoint(student.id, id, 'checkpoint-001', checkpointInput);
  assert.equal(checkpoint.submission.kind, SUBMISSION_KINDS.CHECKPOINT);
  assert.equal(checkpoint.submission.score.totalPoints, 9);
  assert.equal(JSON.stringify(checkpoint).includes('correctOption'), false);
  assert.equal(JSON.stringify(checkpoint).includes('solutionMarkdown'), false);
  await expectApiError(() => service.getSolutions(student.id, id), 'SOLUTIONS_NOT_AVAILABLE');

  const retry = await service.checkpoint(student.id, id, 'checkpoint-001', checkpointInput);
  assert.deepEqual(retry, checkpoint);
  await expectApiError(
    () => service.checkpoint(student.id, id, 'checkpoint-002', scoringPrecondition(checkpoint.attempt)),
    'SUBMISSION_SLOT_USED'
  );
});

test('75-minute deadline creates exactly one snapshot only if no earlier checkpoint', async () => {
  const { service, student, clock } = await makeService();
  const first = await service.createAttempt(student.id, fixtureManifest.id);
  clock.advance(75 * MINUTE);
  const raced = await Promise.all([
    service.processDueAttempt(first.attempt.id),
    service.getAttempt(student.id, first.attempt.id),
    service.processDueAttempt(first.attempt.id)
  ]);
  assert.equal(raced.filter((entry) => entry.processed === true).length, 1);
  const atLimit = await service.getAttempt(student.id, first.attempt.id);
  assert.equal(atLimit.phase, PHASES.LIMIT_NOTICE);
  assert.equal(atLimit.clockState, 'PAUSED');
  assert.equal(atLimit.activeElapsedMs, 75 * MINUTE);
  assert.deepEqual(atLimit.submissions.map((submission) => submission.kind), [SUBMISSION_KINDS.DEADLINE]);

  const final = await service.deadlineDecision(student.id, first.attempt.id, 'finalize', 'decision-001', scoringPrecondition(atLimit));
  assert.equal(final.attempt.phase, PHASES.FINALIZED);
  assert.deepEqual(final.attempt.submissions.map((submission) => submission.kind), [SUBMISSION_KINDS.DEADLINE, SUBMISSION_KINDS.FINAL]);
});

test('an earlier checkpoint consumes preliminary slot and deadline still gives a limit notice', async () => {
  const { service, student, clock } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  await service.checkpoint(student.id, created.attempt.id, 'checkpoint-early', scoringPrecondition(created.attempt));
  clock.advance(75 * MINUTE);
  await service.sweepDeadlines();
  const atLimit = await service.getAttempt(student.id, created.attempt.id);
  assert.equal(atLimit.phase, PHASES.LIMIT_NOTICE);
  assert.deepEqual(atLimit.submissions.map((submission) => submission.kind), [SUBMISSION_KINDS.CHECKPOINT]);
  const continuing = await service.deadlineDecision(
    student.id, created.attempt.id, 'continue', 'continue-001', scoringPrecondition(atLimit)
  );
  assert.equal(continuing.attempt.phase, PHASES.OVERTIME);
  clock.advance(3 * MINUTE);
  const finalized = await service.final(student.id, created.attempt.id, 'final-001', scoringPrecondition(continuing.attempt));
  assert.equal(finalized.attempt.phase, PHASES.FINALIZED);
  assert.equal(finalized.submission.activeElapsedMs, 78 * MINUTE);
});

test('pause freezes active time and answer edits; resume resumes only remaining timed duration', async () => {
  const { service, student, clock } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const id = created.attempt.id;
  clock.advance(10 * MINUTE);
  const paused = await service.pause(student.id, id, 'pause-0001');
  assert.equal(paused.attempt.activeElapsedMs, 10 * MINUTE);
  clock.advance(200 * MINUTE);
  await service.sweepDeadlines();
  let current = await service.getAttempt(student.id, id);
  assert.equal(current.phase, PHASES.TIMED);
  assert.equal(current.activeElapsedMs, 10 * MINUTE);
  await expectApiError(() => service.putAnswers(student.id, id, { answers: [{ questionNumber: 1, selectedOption: 'A' }] }), 'INVALID_STATE');
  await service.resume(student.id, id, 'resume-001');
  clock.advance(65 * MINUTE);
  await service.sweepDeadlines();
  current = await service.getAttempt(student.id, id);
  assert.equal(current.phase, PHASES.LIMIT_NOTICE);
});

test('reset reconciles a passed deadline first and preserves historical finalized result access', async () => {
  const { service, student, clock } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const id = created.attempt.id;
  clock.advance(75 * MINUTE);
  const resetAtLimit = await service.reset(student.id, id, 'reset-limit-1');
  assert.equal(resetAtLimit.previousAttempt.phase, PHASES.RESET);
  assert.deepEqual(resetAtLimit.previousAttempt.submissions.map((item) => item.kind), [SUBMISSION_KINDS.DEADLINE]);
  assert.equal(resetAtLimit.attempt.phase, PHASES.TIMED);
  await expectApiError(() => service.getResults(student.id, id), 'RESULTS_NOT_AVAILABLE');

  const finalId = resetAtLimit.attempt.id;
  await service.final(student.id, finalId, 'final-reset-01', scoringPrecondition(resetAtLimit.attempt));
  const resetFinal = await service.reset(student.id, finalId, 'reset-final-1');
  assert.equal(resetFinal.previousAttempt.resultsAvailable, true);
  const results = await service.getResults(student.id, finalId);
  assert.equal(results.finalSubmission.kind, SUBMISSION_KINDS.FINAL);
  const solutions = await service.getSolutions(student.id, finalId);
  assert.equal(solutions.form.questions[0].correctOption, 'A');
});

test('concurrent reset and create leave exactly one recoverable active attempt', async () => {
  const { service, student } = await makeService();
  const old = await service.createAttempt(student.id, fixtureManifest.id);
  const [resetResult] = await Promise.all([
    service.reset(student.id, old.attempt.id, 'reset-race-001'),
    service.createAttempt(student.id, fixtureManifest.id)
  ]);
  const history = await service.listAttempts(student.id);
  const active = history.filter((attempt) => !['FINALIZED', 'RESET'].includes(attempt.phase));
  assert.equal(active.length, 1);
  const recovered = await service.createAttempt(student.id, fixtureManifest.id);
  assert.equal(recovered.attempt.id, active[0].id);
  assert.equal(resetResult.attempt.id, active[0].id);
});

test('ownership, answer revisions, and separately gated test-only import/publish are enforced', async () => {
  const { service, student } = await makeService();
  const other = await service.seedAccessCode({ code: 'other-access-code', displayName: 'Other Student' });
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  await expectApiError(() => service.getAttempt(other.id, created.attempt.id), 'ATTEMPT_NOT_FOUND');
  await service.putAnswers(student.id, created.attempt.id, { revision: 0, answers: [{ questionNumber: 1, selectedOption: 'A' }] });
  await expectApiError(() => service.putAnswers(student.id, created.attempt.id, { revision: 0, answers: [{ questionNumber: 2, selectedOption: 'B' }] }), 'ANSWER_REVISION_CONFLICT');
  await expectApiError(
    () => service.importManifest({ ...fixtureManifest, id: 'synthetic-form', testOnly: true }, { publish: false }),
    'TEST_FORM_IMPORT_FORBIDDEN'
  );
  const dev = await makeService({ allowTestOnlyImport: true, allowTestOnlyPublish: true });
  await dev.service.importManifest({ ...fixtureManifest, id: 'synthetic-draft', testOnly: true }, { publish: false });
  assert.equal((await dev.store.listForms()).some((form) => form.id === 'synthetic-draft'), false);
  await dev.service.importManifest({ ...fixtureManifest, id: 'synthetic-draft', testOnly: true }, { publish: true });
  assert.equal((await dev.store.listForms()).some((form) => form.id === 'synthetic-draft'), true);
});

test('a stale tab cannot score or finalize another tab’s unseen answer sheet', async () => {
  const { service, student } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const firstSave = await service.putAnswers(student.id, created.attempt.id, {
    revision: created.attempt.answersRevision,
    answers: [{ questionNumber: 1, selectedOption: 'A' }]
  });
  const stalePrecondition = scoringPrecondition(firstSave);
  const secondSave = await service.putAnswers(student.id, created.attempt.id, {
    revision: firstSave.answersRevision,
    answers: [{ questionNumber: 1, selectedOption: 'B' }]
  });
  await expectApiError(
    () => service.final(student.id, created.attempt.id, 'stale-final-0001', stalePrecondition),
    'ANSWER_REVISION_CONFLICT'
  );
  let afterConflict = await service.getAttempt(student.id, created.attempt.id);
  assert.equal(afterConflict.phase, PHASES.TIMED);
  assert.equal(afterConflict.submissions.length, 0);
  assert.equal(afterConflict.answers.find((answer) => answer.questionNumber === 1).selectedOption, 'B');
  const final = await service.final(student.id, created.attempt.id, 'fresh-final-0001', scoringPrecondition(secondSave));
  assert.equal(final.attempt.phase, PHASES.FINALIZED);
});

test('generic manifests require an explicit development-only service gate', async () => {
  const store = new MemoryStore();
  const locked = new PracticeService({
    store,
    authPepper: 'test-pepper-that-is-long-enough-for-a-safe-local-test-suite',
    sessionTtlMs: 60 * MINUTE
  });
  await expectApiError(
    () => locked.importManifest(fixtureManifest, { publish: true }),
    'GENERIC_FORM_IMPORT_FORBIDDEN'
  );
  assert.equal((await store.listForms()).length, 0);
});
