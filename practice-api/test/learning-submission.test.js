import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/errors.js';
import { cookiesFromResponse, fixtureManifest, makeApp, makeService } from './helpers.js';

const MINUTE = 60_000;

function precondition(attempt) {
  return {
    expectedAnswersRevision: attempt.answersRevision,
    expectedStateRevision: attempt.stateRevision
  };
}

async function expectApiError(work, code) {
  await assert.rejects(work, (error) => error instanceof ApiError && error.code === code);
}

async function login(app, accessCode = 'student-access-code') {
  const response = await app.inject({
    method: 'POST',
    url: '/api/amc12/auth/login',
    payload: { accessCode }
  });
  assert.equal(response.statusCode, 200);
  return {
    cookie: cookiesFromResponse(response),
    csrf: response.json().csrfToken
  };
}

function authenticated(session, options) {
  return {
    ...options,
    headers: { cookie: session.cookie, ...(options.headers || {}) }
  };
}

function expandedManifest(questionCount = 7) {
  return {
    ...structuredClone(fixtureManifest),
    id: `fixture-amc12-expanded-${questionCount}`,
    questions: Array.from({ length: questionCount }, (_, index) => ({
      ...structuredClone(fixtureManifest.questions[index % fixtureManifest.questions.length]),
      number: index + 1,
      promptMarkdown: `Expanded fixture prompt ${index + 1}`,
      solutionMarkdown: `Expanded fixture solution ${index + 1}`
    }))
  };
}

test('partial reasoning updates are versioned, idempotent, strict, and snapshotted without changing the score', async () => {
  const { service, store, student } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const attemptId = created.attempt.id;
  const answered = await service.putAnswers(student.id, attemptId, {
    revision: 0,
    answers: [
      { questionNumber: 1, selectedOption: 'A' },
      { questionNumber: 2, selectedOption: 'C' }
    ]
  });
  const first = await service.putReasoning(student.id, attemptId, 'reasoning-save-0001', {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'Use a direct count.' },
      { questionNumber: 2, reasoningText: 'This attempt was uncertain.' }
    ]
  });
  assert.deepEqual(first.notes.map((note) => note.questionNumber), [1, 2]);
  assert.equal(first.editable, true);
  assert.equal(first.reasoningRevision, 1);
  assert.equal(first.stateRevision, answered.stateRevision + 1);

  const replay = await service.putReasoning(student.id, attemptId, 'reasoning-save-0001', {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'Use a direct count.' },
      { questionNumber: 2, reasoningText: 'This attempt was uncertain.' }
    ]
  });
  assert.deepEqual(replay, first);
  const firstIdempotencyRecord = [...store.idempotency.values()]
    .find((record) => record.scope.endsWith(':put-reasoning'));
  assert.ok(firstIdempotencyRecord);
  assert.equal(JSON.stringify(firstIdempotencyRecord.responseBody).includes('Use a direct count.'), false);
  assert.equal(firstIdempotencyRecord.responseBody.responseKind, 'CURRENT_REASONING_ENVELOPE');
  await expectApiError(() => service.putReasoning(student.id, attemptId, 'reasoning-save-0001', {
    revision: 1,
    notes: [{ questionNumber: 1, reasoningText: 'A different request.' }]
  }), 'IDEMPOTENCY_KEY_REUSED');

  const second = await service.putReasoning(student.id, attemptId, 'reasoning-save-0002', {
    revision: 1,
    notes: [
      { questionNumber: 2, reasoningText: '   ' },
      { questionNumber: 3, reasoningText: '令 x 为所求。' }
    ]
  });
  assert.equal(second.reasoningRevision, 2);
  const reasoning = await service.getReasoning(student.id, attemptId);
  assert.deepEqual(reasoning.notes.map((note) => [note.questionNumber, note.reasoningText]), [
    [1, 'Use a direct count.'],
    [3, '令 x 为所求。']
  ]);
  await expectApiError(() => service.putReasoning(student.id, attemptId, 'reasoning-save-0003', {
    revision: 1,
    notes: [{ questionNumber: 1, reasoningText: 'stale' }]
  }), 'REASONING_REVISION_CONFLICT');

  const beforeFinal = await service.getAttempt(student.id, attemptId);
  const finalized = await service.final(student.id, attemptId, 'reasoning-final-001', precondition(beforeFinal));
  assert.equal(finalized.submission.score.totalPoints, 7.5);
  assert.deepEqual(finalized.learningSubmission, {
    id: finalized.learningSubmission.id,
    sourceKind: 'INTERACTIVE_FINAL',
    version: 1,
    status: 'CONTEXT_UNAVAILABLE',
    officialSubmissionId: finalized.submission.id,
    evidenceHash: finalized.learningSubmission.evidenceHash,
    analysisStatus: 'BLOCKED_CONTEXT'
  });
  assert.match(finalized.learningSubmission.evidenceHash, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(finalized.learningSubmission).includes('reasoningText'), false);

  const bundle = store.learningSubmissions.get(attemptId);
  const version = store.learningVersions.get(bundle.id)[0];
  const responses = store.learningResponses.get(version.id);
  assert.equal(responses.length, fixtureManifest.questions.length);
  assert.deepEqual(responses.map((response) => [
    response.questionNumber,
    response.selectedOption,
    response.reasoningText,
    response.answerOrigin,
    response.reasoningOrigin
  ]), [
    [1, 'A', 'Use a direct count.', 'OFFICIAL_FINAL', 'DURING_ATTEMPT'],
    [2, 'C', '', 'OFFICIAL_FINAL', 'NONE'],
    [3, null, '令 x 为所求。', 'OFFICIAL_FINAL', 'DURING_ATTEMPT']
  ]);

  // The same official answer sheet scores identically when no reasoning is
  // present, proving the new evidence path cannot influence deterministic scoring.
  const comparison = await service.createAttempt(student.id, fixtureManifest.id);
  const comparisonAnswers = await service.putAnswers(student.id, comparison.attempt.id, {
    revision: 0,
    answers: [
      { questionNumber: 1, selectedOption: 'A' },
      { questionNumber: 2, selectedOption: 'C' }
    ]
  });
  const comparisonFinal = await service.final(
    student.id, comparison.attempt.id, 'comparison-final-001', precondition(comparisonAnswers)
  );
  assert.deepEqual(comparisonFinal.submission.score, finalized.submission.score);
});

test('reasoning validation, ownership, running-phase rules, and release gates fail closed', async () => {
  const { service, store, student, clock } = await makeService();
  const other = await service.seedAccessCode({ code: 'other-reasoning-code', displayName: 'Other Student' });
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const id = created.attempt.id;
  await expectApiError(() => service.getReasoning(other.id, id), 'ATTEMPT_NOT_FOUND');
  await expectApiError(() => service.getLearningSubmission(student.id, id), 'LEARNING_SUBMISSION_NOT_AVAILABLE');
  await expectApiError(() => service.putReasoning(student.id, id, 'invalid-note-0001', {
    revision: 0,
    extra: true,
    notes: [{ questionNumber: 1, reasoningText: 'x' }]
  }), 'VALIDATION_ERROR');
  await expectApiError(() => service.putReasoning(student.id, id, 'invalid-note-0002', {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'x' },
      { questionNumber: 1, reasoningText: 'y' }
    ]
  }), 'VALIDATION_ERROR');
  await expectApiError(() => service.putReasoning(student.id, id, 'invalid-note-0003', {
    revision: 0,
    notes: [{ questionNumber: 99, reasoningText: 'x' }]
  }), 'VALIDATION_ERROR');
  await expectApiError(() => service.putReasoning(student.id, id, 'invalid-note-0004', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'x\u0000y' }]
  }), 'VALIDATION_ERROR');
  await expectApiError(() => service.putReasoning(student.id, id, 'invalid-note-0005', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: '界'.repeat(2_667) }]
  }), 'VALIDATION_ERROR');

  await service.pause(student.id, id, 'pause-reasoning-1');
  await expectApiError(() => service.putReasoning(student.id, id, 'paused-note-0001', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'paused' }]
  }), 'INVALID_STATE');
  await service.resume(student.id, id, 'resume-reasoning-1');
  clock.advance(75 * MINUTE);
  await expectApiError(() => service.putReasoning(student.id, id, 'late-note-000001', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'too late' }]
  }), 'LIMIT_NOTICE_REQUIRED');
  const atLimit = await service.getAttempt(student.id, id);
  assert.equal(atLimit.phase, 'LIMIT_NOTICE');
  assert.equal(store.learningSubmissions.has(id), false, 'deadline preliminary must not create learning evidence');
  assert.equal((await service.getReasoning(student.id, id)).notes.length, 0);
  await expectApiError(() => service.getLearningSubmission(student.id, id), 'LEARNING_SUBMISSION_NOT_AVAILABLE');
  const deadlineFinal = await service.deadlineDecision(
    student.id, id, 'finalize', 'reasoning-deadline-final', precondition(atLimit)
  );
  assert.equal(deadlineFinal.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  assert.equal(store.learningResponses.get(
    store.learningVersions.get(deadlineFinal.learningSubmission.id)[0].id
  ).length, fixtureManifest.questions.length);
  await expectApiError(() => service.getLearningSubmission(other.id, id), 'ATTEMPT_NOT_FOUND');
});

test('reasoning byte limits accept exact UTF-8 boundaries and reject one byte over', async () => {
  const manifest = expandedManifest();
  const { service, student } = await makeService({ manifest });
  const created = await service.createAttempt(student.id, manifest.id);
  const exactEightThousand = `${'界'.repeat(2_666)}aa`;
  assert.equal(Buffer.byteLength(exactEightThousand, 'utf8'), 8_000);
  const exact = await service.putReasoning(student.id, created.attempt.id, 'bytes-exact-8000', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: exactEightThousand }]
  });
  assert.equal(exact.reasoningRevision, 1);
  assert.equal(Buffer.byteLength(exact.notes[0].reasoningText, 'utf8'), 8_000);
  const deleted = await service.putReasoning(student.id, created.attempt.id, 'bytes-delete-null', {
    revision: 1,
    notes: [{ questionNumber: 1, reasoningText: null }]
  });
  assert.equal(deleted.notes.length, 0);
  await expectApiError(() => service.putReasoning(student.id, created.attempt.id, 'bytes-over-8001', {
    revision: 2,
    notes: [{ questionNumber: 1, reasoningText: `${exactEightThousand}b` }]
  }), 'VALIDATION_ERROR');
  await expectApiError(() => service.putReasoning(student.id, created.attempt.id, 'note-unknown-field', {
    revision: 2,
    notes: [{ questionNumber: 1, reasoningText: 'x', ignored: true }]
  }), 'VALIDATION_ERROR');

  const exactTotal = await service.putReasoning(student.id, created.attempt.id, 'bytes-total-48000', {
    revision: 2,
    notes: Array.from({ length: 6 }, (_, index) => ({
      questionNumber: index + 1,
      reasoningText: 'x'.repeat(8_000)
    }))
  });
  assert.equal(exactTotal.reasoningRevision, 3);
  assert.equal(exactTotal.notes.reduce((sum, note) => sum + Buffer.byteLength(note.reasoningText, 'utf8'), 0), 48_000);
  await expectApiError(() => service.putReasoning(student.id, created.attempt.id, 'bytes-total-48001', {
    revision: 3,
    notes: [
      ...Array.from({ length: 6 }, (_, index) => ({
        questionNumber: index + 1,
        reasoningText: 'y'.repeat(8_000)
      })),
      { questionNumber: 7, reasoningText: 'z' }
    ]
  }), 'VALIDATION_ERROR');
  assert.equal((await service.getReasoning(student.id, created.attempt.id)).reasoningRevision, 3);
});

test('official final and learning snapshot roll back together and concurrent retries create one aggregate', async () => {
  const { service, store, student } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const originalWithAttemptLock = store.withAttemptLock.bind(store);
  store.withAttemptLock = (attemptId, work) => originalWithAttemptLock(attemptId, async (tx) => {
    if (tx) tx.createLearningSubmission = async () => { throw new Error('injected-learning-write-failure'); };
    return work(tx);
  });
  await assert.rejects(
    () => service.final(student.id, created.attempt.id, 'rollback-final-001', precondition(created.attempt)),
    /injected-learning-write-failure/
  );
  store.withAttemptLock = originalWithAttemptLock;
  const afterFailure = await service.getAttempt(student.id, created.attempt.id);
  assert.equal(afterFailure.phase, 'TIMED');
  assert.equal(afterFailure.submissions.length, 0);
  assert.equal(store.learningSubmissions.has(created.attempt.id), false);
  assert.equal((store.events.get(created.attempt.id) || []).some((event) => event.type === 'FINAL'), false);

  const [left, right] = await Promise.all([
    service.final(student.id, created.attempt.id, 'retry-final-same', precondition(afterFailure)),
    service.final(student.id, created.attempt.id, 'retry-final-same', precondition(afterFailure))
  ]);
  assert.deepEqual(right, left);
  assert.equal((store.submissions.get(created.attempt.id) || []).filter((entry) => entry.kind === 'FINAL').length, 1);
  assert.equal(store.learningVersions.get(left.learningSubmission.id).length, 1);
  assert.equal(store.learningWorkItems.get(store.learningVersions.get(left.learningSubmission.id)[0].id).length, 1);
});

test('owner-scoped status reconciles one historical final after reset without changing its official score', async () => {
  const { service, store, student } = await makeService();
  const created = await service.createAttempt(student.id, fixtureManifest.id);
  const final = await service.final(student.id, created.attempt.id, 'historic-final-001', precondition(created.attempt));
  const officialBefore = structuredClone(store.submissions.get(created.attempt.id));
  const previousLearning = store.learningSubmissions.get(created.attempt.id);
  const previousVersion = store.learningVersions.get(previousLearning.id)[0];
  store.learningSubmissions.delete(created.attempt.id);
  store.learningVersions.delete(previousLearning.id);
  store.learningResponses.delete(previousVersion.id);
  store.learningWorkItems.delete(previousVersion.id);
  const reset = await service.reset(student.id, created.attempt.id, 'historic-reset-01');
  assert.equal(reset.previousAttempt.phase, 'RESET');

  await expectApiError(
    () => service.getLearningSubmission(student.id, created.attempt.id),
    'LEARNING_SUBMISSION_REPAIR_PENDING'
  );
  assert.equal(store.learningSubmissions.has(created.attempt.id), false, 'public GET must remain read-only');
  const reconciliation = await service.reconcileFinalLearningSubmission(created.attempt.id);
  assert.equal(reconciliation.created, true);
  const idempotentReconciliation = await service.reconcileFinalLearningSubmission(created.attempt.id);
  assert.equal(idempotentReconciliation.created, false);
  assert.deepEqual(idempotentReconciliation.learningSubmission, reconciliation.learningSubmission);
  const backfilled = await service.getLearningSubmission(student.id, created.attempt.id);
  assert.equal(backfilled.officialSubmissionId, final.submission.id);
  assert.equal(backfilled.analysisStatus, 'BLOCKED_CONTEXT');
  assert.deepEqual(store.submissions.get(created.attempt.id), officialBefore);
  const backfilledVersion = store.learningVersions.get(backfilled.id)[0];
  assert.equal(backfilledVersion.creationReason, 'BACKFILL');
});

test('reasoning and learning-status HTTP routes require CSRF/ownership semantics and are no-store', async (t) => {
  const { app, service, store } = await makeApp();
  t.after(() => app.close());
  const session = await login(app);
  let response = await app.inject(authenticated(session, {
    method: 'POST',
    url: '/api/amc12/attempts',
    headers: { 'x-csrf-token': session.csrf },
    payload: { formId: fixtureManifest.id }
  }));
  const attempt = response.json().attempt;

  response = await app.inject(authenticated(session, {
    method: 'PUT',
    url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`,
    payload: { revision: 0, notes: [{ questionNumber: 1, reasoningText: 'HTTP note' }] }
  }));
  assert.equal(response.statusCode, 403);
  response = await app.inject(authenticated(session, {
    method: 'PUT',
    url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`,
    headers: { 'x-csrf-token': session.csrf },
    payload: { revision: 0, notes: [{ questionNumber: 1, reasoningText: 'HTTP note' }] }
  }));
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'IDEMPOTENCY_KEY_REQUIRED');
  response = await app.inject(authenticated(session, {
    method: 'PUT',
    url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'http-reasoning-001' },
    payload: { revision: 0, notes: [{ questionNumber: 1, reasoningText: 'HTTP note' }] }
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.deepEqual(Object.keys(response.json()).sort(), [
    'attemptId', 'editable', 'notes', 'reasoningRevision', 'stateRevision'
  ].sort());
  assert.equal(JSON.stringify([...store.idempotency.values()]).includes('HTTP note'), false);

  response = await app.inject(authenticated(session, {
    method: 'PUT',
    url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'http-oversized-note' },
    payload: { revision: 1, notes: [{ questionNumber: 1, reasoningText: 'x'.repeat(70_000) }] }
  }));
  assert.equal(response.statusCode, 413);
  assert.equal(response.json().error.code, 'PAYLOAD_TOO_LARGE');
  assert.equal(response.body.includes('xxxx'), false);

  response = await app.inject(authenticated(session, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.json().notes[0].reasoningText, 'HTTP note');
  response = await app.inject(authenticated(session, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}/learning-submission`
  }));
  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error.code, 'LEARNING_SUBMISSION_NOT_AVAILABLE');
  assert.equal(response.headers['cache-control'], 'no-store');

  const current = await app.inject(authenticated(session, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}`
  }));
  response = await app.inject(authenticated(session, {
    method: 'POST',
    url: `/api/amc12/attempts/${attempt.id}/final`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'http-learning-final-1' },
    payload: precondition(current.json().attempt)
  }));
  assert.equal(response.statusCode, 200);
  assert.deepEqual(Object.keys(response.json().learningSubmission).sort(), [
    'analysisStatus', 'evidenceHash', 'id', 'officialSubmissionId', 'sourceKind', 'status', 'version'
  ].sort());
  response = await app.inject(authenticated(session, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}/learning-submission`
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.json().learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');

  await service.seedAccessCode({ code: 'http-other-student', displayName: 'HTTP Other Student' });
  const otherSession = await login(app, 'http-other-student');
  response = await app.inject(authenticated(otherSession, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`
  }));
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'ATTEMPT_NOT_FOUND');
  response = await app.inject(authenticated(otherSession, {
    method: 'PUT',
    url: `/api/amc12/attempts/${attempt.id}/reasoning-notes`,
    headers: { 'x-csrf-token': otherSession.csrf, 'idempotency-key': 'cross-owner-reasoning' },
    payload: { revision: 1, notes: [{ questionNumber: 1, reasoningText: 'steal' }] }
  }));
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'ATTEMPT_NOT_FOUND');
  response = await app.inject(authenticated(otherSession, {
    method: 'POST',
    url: `/api/amc12/attempts/${attempt.id}/final`,
    headers: { 'x-csrf-token': otherSession.csrf, 'idempotency-key': 'cross-owner-final-001' },
    payload: { expectedAnswersRevision: 0, expectedStateRevision: 0 }
  }));
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'ATTEMPT_NOT_FOUND');
  response = await app.inject(authenticated(otherSession, {
    method: 'GET', url: `/api/amc12/attempts/${attempt.id}/learning-submission`
  }));
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'ATTEMPT_NOT_FOUND');
});

test('reasoning writes have an authenticated-student rate limit independent of the IP-wide limit', async (t) => {
  const { app, service } = await makeApp({ reasoningWritesPerMinute: 2 });
  t.after(() => app.close());
  const session = await login(app);
  let response = await app.inject(authenticated(session, {
    method: 'POST',
    url: '/api/amc12/attempts',
    headers: { 'x-csrf-token': session.csrf },
    payload: { formId: fixtureManifest.id }
  }));
  const id = response.json().attempt.id;
  for (let revision = 0; revision < 2; revision += 1) {
    response = await app.inject(authenticated(session, {
      method: 'PUT',
      url: `/api/amc12/attempts/${id}/reasoning-notes`,
      headers: {
        'x-csrf-token': session.csrf,
        'idempotency-key': `rate-reasoning-${revision}`
      },
      payload: { revision, notes: [{ questionNumber: 1, reasoningText: `revision ${revision}` }] }
    }));
    assert.equal(response.statusCode, 200);
  }
  response = await app.inject(authenticated(session, {
    method: 'PUT',
    url: `/api/amc12/attempts/${id}/reasoning-notes`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'rate-reasoning-blocked' },
    payload: { revision: 2, notes: [{ questionNumber: 1, reasoningText: 'must not persist' }] }
  }));
  assert.equal(response.statusCode, 429);
  assert.equal(response.json().error.code, 'REASONING_RATE_LIMITED');

  await service.seedAccessCode({ code: 'rate-second-student', displayName: 'Rate Second Student' });
  const secondSession = await login(app, 'rate-second-student');
  response = await app.inject(authenticated(secondSession, {
    method: 'POST',
    url: '/api/amc12/attempts',
    headers: { 'x-csrf-token': secondSession.csrf },
    payload: { formId: fixtureManifest.id }
  }));
  assert.equal(response.statusCode, 201);
  const secondAttemptId = response.json().attempt.id;
  response = await app.inject(authenticated(secondSession, {
    method: 'PUT',
    url: `/api/amc12/attempts/${secondAttemptId}/reasoning-notes`,
    headers: { 'x-csrf-token': secondSession.csrf, 'idempotency-key': 'rate-second-independent' },
    payload: { revision: 0, notes: [{ questionNumber: 1, reasoningText: 'independent' }] }
  }));
  assert.equal(response.statusCode, 200);
});
