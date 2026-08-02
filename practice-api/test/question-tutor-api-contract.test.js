import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../src/app.js';
import { forbidden, tooManyRequests } from '../src/errors.js';
import { cookiesFromResponse } from './helpers.js';

const config = {
  basePath: '/api/amc12', bodyLimit: 64 * 1024,
  trustedProxy: false, corsOrigin: null,
  sessionSecret: 'question-tutor-api-test-secret-that-is-long-enough',
  sessionTtlMs: 3_600_000, secureCookies: false,
  cookieName: 'amc_session', csrfCookieName: 'amc_csrf', cookiePath: '/api/amc12',
  tutorEnabled: true
};

function fixture() {
  const studentId = randomUUID();
  const submissionId = randomUUID();
  const threadId = randomUUID();
  const calls = [];
  const thread = {
    thread: {
      id: threadId, learningSubmissionId: submissionId,
      versionNumber: 1, questionNumber: 2, status: 'OPEN'
    },
    question: {}, requests: [], messages: []
  };
  const service = {
    async login() {
      return {
        session: { id: 'durable-session-id', csrfTokenHash: 'hash' },
        sessionToken: 'opaque-session-token-that-is-long-enough',
        csrfToken: 'csrf-token', student: { id: studentId, displayName: 'Student' }
      };
    },
    async authenticateSession() {
      return {
        session: { id: 'durable-session-id', csrfTokenHash: 'hash' },
        student: { id: studentId, displayName: 'Student' }
      };
    },
    async consumeStudentRequestBudget() {},
    assertCsrf(_session, token) {
      if (token !== 'csrf-token') throw forbidden('CSRF_INVALID', 'CSRF validation failed.');
    },
    async createTutorRootThread(...args) {
      calls.push(['root', args]);
      return { thread, replayed: false };
    },
    async listTutorThreads(...args) {
      calls.push(['list', args]);
      return { items: [{ thread: thread.thread, latestRequest: null }], nextCursor: null };
    },
    async getTutorThread(...args) {
      calls.push(['get', args]);
      return { thread };
    },
    async sendTutorMessage(...args) {
      calls.push(['message', args]);
      return {
        thread,
        acceptedRequest: { requestOrdinal: 1, status: 'QUEUED', replayed: false }
      };
    },
    async forkTutorThread(...args) {
      calls.push(['fork', args]);
      return { thread, replayed: false };
    },
    async retryTutorRequest(...args) {
      calls.push(['retry', args]);
      return {
        thread,
        acceptedRequest: { requestOrdinal: 2, status: 'QUEUED', replayed: false }
      };
    },
    async tombstoneTutorThread(...args) { calls.push(['delete', args]); }
  };
  return { service, calls, studentId, submissionId, threadId };
}

async function login(app) {
  const response = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login', payload: { accessCode: 'test-access' }
  });
  return { cookie: cookiesFromResponse(response), csrf: response.json().csrfToken };
}

test('Tutor HTTP boundary is auth/CSRF/no-store and accepts no client context fields', async (t) => {
  const f = fixture();
  const app = await buildApp({ service: f.service, config, logger: false });
  t.after(() => app.close());
  const collection = `/api/amc12/learning-history/${f.submissionId}/versions/1/questions/2/tutor-threads`;

  let response = await app.inject({ method: 'GET', url: collection });
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['cache-control'], 'no-store');
  const session = await login(app);

  response = await app.inject({
    method: 'POST', url: collection, headers: {
      cookie: session.cookie, 'idempotency-key': 'root-http-request-0001'
    }, payload: {}
  });
  assert.equal(response.statusCode, 403);

  const mutationHeaders = {
    cookie: session.cookie,
    'x-csrf-token': session.csrf,
    'idempotency-key': 'root-http-request-0001'
  };
  response = await app.inject({
    method: 'POST', url: collection, headers: mutationHeaders,
    payload: { solutions: ['client supplied'] }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(f.calls.some(([name]) => name === 'root'), false);

  response = await app.inject({ method: 'POST', url: collection, headers: mutationHeaders, payload: {} });
  assert.equal(response.statusCode, 201);
  assert.equal(response.headers['cache-control'], 'no-store');
  const rootArgs = f.calls.find(([name]) => name === 'root')[1];
  assert.deepEqual(rootArgs, [
    f.studentId, 'durable-session-id', f.submissionId, '1', '2', 'root-http-request-0001'
  ]);

  response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/messages`,
    headers: { ...mutationHeaders, 'idempotency-key': 'message-http-request-0001' },
    payload: { message: 'Why is the invariant preserved?', provider: 'forged' }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(f.calls.some(([name]) => name === 'message'), false);

  response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/messages`,
    headers: { ...mutationHeaders, 'idempotency-key': 'message-http-request-0001' },
    payload: { message: 'Why is the invariant preserved?' }
  });
  assert.equal(response.statusCode, 202);
  assert.equal(response.headers['cache-control'], 'no-store');
  const messageArgs = f.calls.find(([name]) => name === 'message')[1];
  assert.equal(messageArgs.at(-1), 'Why is the invariant preserved?');
  assert.equal(messageArgs.includes('forged'), false);

  response = await app.inject({
    method: 'GET', url: `${collection}?limit=10`, headers: { cookie: session.cookie }
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(f.calls.find(([name]) => name === 'list')[1].at(-1).limit, '10');
  response = await app.inject({
    method: 'GET', url: `${collection}/${f.threadId}`, headers: { cookie: session.cookie }
  });
  assert.equal(response.statusCode, 200);

  response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/forks`,
    headers: { ...mutationHeaders, 'idempotency-key': 'fork-http-request-0001' },
    payload: { parentTurnJobId: randomUUID() }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(f.calls.some(([name]) => name === 'fork'), false);
  response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/forks`,
    headers: { ...mutationHeaders, 'idempotency-key': 'fork-http-request-0001' }, payload: {}
  });
  assert.equal(response.statusCode, 201);
  assert.equal(response.headers['cache-control'], 'no-store');

  response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/requests/1/retries`,
    headers: { ...mutationHeaders, 'idempotency-key': 'retry-http-request-0001' }, payload: {}
  });
  assert.equal(response.statusCode, 202);
  assert.equal(response.headers['cache-control'], 'no-store');
  const retryArgs = f.calls.find(([name]) => name === 'retry')[1];
  assert.equal(retryArgs.at(-2), '1');
  assert.equal(retryArgs.at(-1), 'retry-http-request-0001');

  response = await app.inject({
    method: 'DELETE', url: `${collection}/${f.threadId}`,
    headers: { ...mutationHeaders, 'idempotency-key': 'delete-http-request-0001' },
    payload: { model: 'forged' }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(f.calls.some(([name]) => name === 'delete'), false);

  response = await app.inject({
    method: 'DELETE', url: `${collection}/${f.threadId}`,
    headers: { ...mutationHeaders, 'idempotency-key': 'delete-http-request-0001' }
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(f.calls.find(([name]) => name === 'delete')[1].at(-1),
    'delete-http-request-0001');
});

test('Tutor routes stay absent until the coordinated release flag is enabled', async (t) => {
  const f = fixture();
  const app = await buildApp({
    service: f.service, config: { ...config, tutorEnabled: false }, logger: false
  });
  t.after(() => app.close());
  const response = await app.inject({
    method: 'GET',
    url: `/api/amc12/learning-history/${f.submissionId}/versions/1/questions/2/tutor-threads`
  });
  assert.equal(response.statusCode, 404);
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('Tutor provider-work exhaustion returns a bounded Retry-After without cacheable details', async (t) => {
  const f = fixture();
  f.service.sendTutorMessage = async () => {
    throw tooManyRequests('TUTOR_PROVIDER_WORK_RATE_LIMITED',
      'The Tutor provider-work budget is exhausted. Please try again later.', 86_400);
  };
  const app = await buildApp({ service: f.service, config, logger: false });
  t.after(() => app.close());
  const session = await login(app);
  const collection = `/api/amc12/learning-history/${f.submissionId}/versions/1/questions/2/tutor-threads`;
  const response = await app.inject({
    method: 'POST', url: `${collection}/${f.threadId}/messages`,
    headers: {
      cookie: session.cookie, 'x-csrf-token': session.csrf,
      'idempotency-key': 'message-budget-http-0001'
    },
    payload: { message: 'Can we discuss another method?' }
  });
  assert.equal(response.statusCode, 429);
  assert.equal(response.headers['retry-after'], '86400');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.deepEqual(response.json(), {
    error: {
      code: 'TUTOR_PROVIDER_WORK_RATE_LIMITED',
      message: 'The Tutor provider-work budget is exhausted. Please try again later.',
      details: { retryAfterSeconds: 86_400 }
    }
  });
});
