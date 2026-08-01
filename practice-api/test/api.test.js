import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';
import { PracticeService } from '../src/service.js';
import { cookiesFromResponse, fixtureManifest, makeApp } from './helpers.js';

async function login(app) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/amc12/auth/login',
    payload: { accessCode: 'student-access-code' }
  });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  return { cookie: cookiesFromResponse(response), csrf: body.csrfToken, student: body.student };
}

function requestWithSession(session, options = {}) {
  return {
    ...options,
    headers: {
      cookie: session.cookie,
      ...(options.headers || {})
    }
  };
}

test('Fastify API authenticates, enforces CSRF, redacts keys, and exposes results only after final', async (t) => {
  const { app } = await makeApp();
  t.after(() => app.close());

  let response = await app.inject({ method: 'GET', url: '/api/amc12/forms' });
  assert.equal(response.statusCode, 401);
  const session = await login(app);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: '/api/amc12/auth/me' }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().csrfToken, session.csrf);

  response = await app.inject(requestWithSession(session, { method: 'GET', url: '/api/amc12/forms' }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().forms[0].id, fixtureManifest.id);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/forms/${fixtureManifest.id}` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.includes('correctOption'), false);
  assert.equal(response.body.includes('Fixture solution'), false);

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/attempts', payload: { formId: fixtureManifest.id }
  }));
  assert.equal(response.statusCode, 403);
  assert.equal(response.json().error.code, 'CSRF_INVALID');

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/attempts',
    headers: { 'x-csrf-token': session.csrf }, payload: { formId: fixtureManifest.id }
  }));
  assert.equal(response.statusCode, 201);
  const attemptId = response.json().attempt.id;

  response = await app.inject(requestWithSession(session, {
    method: 'PUT', url: `/api/amc12/attempts/${attemptId}/answers`,
    headers: { 'x-csrf-token': session.csrf },
    payload: { revision: 0, answers: [{ questionNumber: 1, selectedOption: 'A' }] }
  }));
  assert.equal(response.statusCode, 200);
  let attempt = response.json().attempt;
  assert.equal(attempt.answersRevision, 1);

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${attemptId}/checkpoint`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'api-checkpoint-missing-precondition' },
    payload: {}
  }));
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${attemptId}/checkpoint`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'api-checkpoint-001' },
    payload: { expectedAnswersRevision: attempt.answersRevision, expectedStateRevision: attempt.stateRevision }
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().submission.score.totalPoints, 9);
  attempt = response.json().attempt;
  assert.equal(response.body.includes('correctOption'), false);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${attemptId}/solutions` }));
  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error.code, 'SOLUTIONS_NOT_AVAILABLE');

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${attemptId}/final`,
    headers: { 'x-csrf-token': session.csrf, 'idempotency-key': 'api-final-0001' },
    payload: { expectedAnswersRevision: attempt.answersRevision, expectedStateRevision: attempt.stateRevision }
  }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().attempt.phase, 'FINALIZED');
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${attemptId}/results` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().finalSubmission.answers[0].correctOption, 'A');
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${attemptId}/solutions` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().form.questions[0].solutionMarkdown, 'Fixture solution one');
});

test('API idempotency, reset history, and CSRF rejection survive the full HTTP flow', async (t) => {
  const { app } = await makeApp();
  t.after(() => app.close());
  const session = await login(app);
  const headers = { 'x-csrf-token': session.csrf };
  let response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/attempts', headers, payload: { formId: fixtureManifest.id }
  }));
  const id = response.json().attempt.id;
  const finalHeaders = { ...headers, 'idempotency-key': 'http-final-0001' };
  const finalPayload = { expectedAnswersRevision: 0, expectedStateRevision: 0 };
  const firstFinal = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${id}/final`, headers: finalHeaders, payload: finalPayload
  }));
  const secondFinal = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${id}/final`, headers: finalHeaders, payload: finalPayload
  }));
  assert.equal(firstFinal.statusCode, 200);
  assert.equal(secondFinal.statusCode, 200);
  assert.deepEqual(secondFinal.json(), firstFinal.json());

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: `/api/amc12/attempts/${id}/reset`,
    headers: { ...headers, 'idempotency-key': 'http-reset-0001' }, payload: {}
  }));
  assert.equal(response.statusCode, 201);
  assert.equal(response.json().attempt.phase, 'TIMED');
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${id}` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().attempt.phase, 'RESET');
  assert.equal(response.json().attempt.resultsAvailable, true);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${id}/solutions` }));
  assert.equal(response.statusCode, 200);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: '/api/amc12/attempts' }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().attempts.length, 2);

  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/auth/logout', headers: { 'x-csrf-token': 'not-the-right-csrf-token' }, payload: {}
  }));
  assert.equal(response.statusCode, 403);
  response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/auth/logout', headers, payload: {}
  }));
  assert.equal(response.statusCode, 204);
  response = await app.inject(requestWithSession(session, { method: 'GET', url: '/api/amc12/auth/me' }));
  assert.equal(response.statusCode, 401, 'the pre-logout signed cookie must be server-side revoked');
});

test('catalog exposes one current revision while attempt-scoped content pins a later-unpublished revision', async (t) => {
  const { app, service } = await makeApp();
  t.after(() => app.close());
  const session = await login(app);
  const headers = { 'x-csrf-token': session.csrf };
  let response = await app.inject(requestWithSession(session, {
    method: 'POST', url: '/api/amc12/attempts', headers, payload: { formId: fixtureManifest.id }
  }));
  const attemptId = response.json().attempt.id;
  const revised = structuredClone(fixtureManifest);
  revised.version = '2026-test-2';
  revised.title = 'Fixture AMC 12A revised';
  revised.questions[0].promptMarkdown = 'A different later revision prompt';
  await service.importManifest(revised, { publish: true });

  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/forms/${fixtureManifest.id}` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().form.version, '2026-test-2');
  response = await app.inject(requestWithSession(session, { method: 'GET', url: '/api/amc12/forms' }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().forms.filter((form) => form.id === fixtureManifest.id).length, 1);
  assert.equal(response.json().forms.find((form) => form.id === fixtureManifest.id).version, '2026-test-2');
  response = await app.inject(requestWithSession(session, { method: 'GET', url: `/api/amc12/attempts/${attemptId}/form` }));
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().form.version, fixtureManifest.version);
  assert.equal(response.json().form.questions[0].promptMarkdown, fixtureManifest.questions[0].promptMarkdown);
  assert.equal(response.body.includes('correctOption'), false);
  response = await app.inject(requestWithSession(session, {
    method: 'GET', url: `/api/amc12/forms/${fixtureManifest.id}/versions/${fixtureManifest.version}`
  }));
  assert.equal(response.statusCode, 404, 'an old revision is not publicly listed after a newer publication');
});

test('loopback proxy uses nginx-provided client IP for login rate-limit isolation', async (t) => {
  const { app } = await makeApp();
  t.after(() => app.close());
  const invalidLogin = (ip) => app.inject({
    method: 'POST',
    url: '/api/amc12/auth/login',
    remoteAddress: '127.0.0.1',
    headers: { 'x-forwarded-for': ip },
    payload: { accessCode: 'wrong-access-code' }
  });
  for (let index = 0; index < 10; index += 1) {
    assert.equal((await invalidLogin('198.51.100.10')).statusCode, 401);
  }
  const limited = await invalidLogin('198.51.100.10');
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.json().error.code, 'RATE_LIMITED');
  assert.equal((await invalidLogin('198.51.100.11')).statusCode, 401);
});

test('authenticated student request budget follows identity across IPs and returns Retry-After', async (t) => {
  const { app, service, store, clock, config } = await makeApp();
  t.after(() => app.close());
  const session = await login(app);
  service.batchRequestLimitPerMinute = 1;
  const secondService = new PracticeService({
    store,
    authPepper: 'test-pepper-that-is-long-enough-for-a-safe-local-test-suite',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    batchRequestLimitPerMinute: 1,
    clock: clock.now
  });
  const secondApp = await buildApp({ service: secondService, config, logger: false });
  t.after(() => secondApp.close());

  const first = await app.inject(requestWithSession(session, {
    method: 'GET', url: '/api/amc12/forms',
    remoteAddress: '127.0.0.1', headers: { 'x-forwarded-for': '198.51.100.20' }
  }));
  assert.equal(first.statusCode, 200);
  const second = await secondApp.inject(requestWithSession(session, {
    method: 'GET', url: '/api/amc12/forms',
    remoteAddress: '127.0.0.1', headers: { 'x-forwarded-for': '198.51.100.21' }
  }));
  assert.equal(second.statusCode, 429);
  assert.equal(second.json().error.code, 'STUDENT_REQUEST_RATE_LIMITED');
  assert.match(second.headers['retry-after'], /^\d+$/);
  assert.ok(Number(second.headers['retry-after']) >= 1);
});

test('invalid attempt identifiers are rejected before a storage adapter can leak database errors', async (t) => {
  const { app } = await makeApp();
  t.after(() => app.close());
  const session = await login(app);
  const response = await app.inject(requestWithSession(session, {
    method: 'GET', url: '/api/amc12/attempts/not-a-uuid'
  }));
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'INVALID_ATTEMPT_ID');
  assert.equal(response.body.includes('22P02'), false);
});
