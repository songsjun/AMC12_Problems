import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { QuestionTutorApplicationService } from '../src/question-tutor/application-service.js';
import { TutorDomainError } from '../src/question-tutor/domain.js';
import { TutorStoreError } from '../src/question-tutor/store-contract.js';

function safeBundle(scope, threadId, overrides = {}) {
  return {
    thread: {
      id: threadId,
      learningSubmissionId: scope.learningSubmissionId,
      versionNumber: scope.versionNumber,
      questionNumber: scope.questionNumber,
      status: 'OPEN', requestCount: 0, successfulTurnCount: 0,
      ...overrides
    },
    question: {}, requests: [], messages: []
  };
}

function fixture() {
  const base = {
    studentId: randomUUID(), authorizedSessionId: 'session-hash',
    learningSubmissionId: randomUUID(), versionNumber: '1', questionNumber: '3'
  };
  const bundles = new Map();
  const calls = [];
  const store = {
    async createTutorRootThread(input) {
      calls.push(['root', input]);
      const bundle = safeBundle({ ...base, versionNumber: 1, questionNumber: 3 }, input.threadId);
      bundles.set(input.threadId, bundle);
      return { thread: { id: input.threadId }, replayed: false };
    },
    async getTutorThreadBundle(studentId, threadId) {
      calls.push(['get', { studentId, threadId }]);
      return structuredClone(bundles.get(threadId) || null);
    },
    async listTutorThreadSummaries(studentId, submissionId, versionNumber, questionNumber, options) {
      calls.push(['list', { studentId, submissionId, versionNumber, questionNumber, options }]);
      return [...bundles.values()].map((bundle) => ({
        thread: structuredClone(bundle.thread), latestRequest: bundle.requests.at(-1) || null
      }));
    },
    async enqueueTutorTurn(input) {
      calls.push(['message', input]);
      const bundle = bundles.get(input.threadId);
      bundle.thread.requestCount = 1;
      bundle.requests.push({ requestOrdinal: 1, turnNumber: 1, status: 'QUEUED' });
      bundle.messages.push({ id: input.messageId, role: 'USER', contentMarkdown: input.message });
      return { job: { requestOrdinal: 1, status: 'QUEUED' }, replayed: false };
    },
    async createTutorForkFromHead(input) {
      calls.push(['fork', input]);
      const bundle = safeBundle({ ...base, versionNumber: 1, questionNumber: 3 }, input.threadId);
      bundles.set(input.threadId, bundle);
      return { thread: { id: input.threadId }, replayed: false };
    },
    async retryTutorTurnByOrdinal(input) {
      calls.push(['retry', input]);
      return { job: { requestOrdinal: 2, status: 'QUEUED' }, replayed: false };
    },
    async tombstoneTutorThreadByPath(input) {
      calls.push(['delete', input]);
      bundles.delete(input.threadId);
      return true;
    }
  };
  return {
    base, store, calls, bundles,
    service: new QuestionTutorApplicationService({
      store, clock: () => new Date('2026-08-01T12:00:00.000Z')
    })
  };
}

test('Tutor application service accepts only path identity and builds internal IDs server-side', async () => {
  const f = fixture();
  const created = await f.service.createRootThread({
    ...f.base, idempotencyKey: 'root-request-0001'
  });
  assert.equal(created.thread.thread.learningSubmissionId, f.base.learningSubmissionId);
  const rootInput = f.calls.find(([name]) => name === 'root')[1];
  assert.match(rootInput.snapshotId, /^[0-9a-f-]{36}$/);
  assert.match(rootInput.threadId, /^[0-9a-f-]{36}$/);
  for (const forbidden of ['question', 'solutions', 'snapshotHash', 'model', 'provider']) {
    assert.equal(Object.hasOwn(rootInput, forbidden), false);
  }

  const sent = await f.service.sendMessage({
    ...f.base, threadId: created.thread.thread.id,
    idempotencyKey: 'message-request-0001', message: 'Compare the two approved methods.'
  });
  assert.deepEqual(sent.acceptedRequest, {
    requestOrdinal: 1, status: 'QUEUED', replayed: false
  });
  const messageInput = f.calls.find(([name]) => name === 'message')[1];
  assert.match(messageInput.correlationId, /^tutor-[0-9a-f-]{36}$/);
  assert.equal(messageInput.authorizedSessionId, f.base.authorizedSessionId);
  assert.deepEqual(messageInput.providerBudget, {
    budgetKind: 'PROVIDER_WORK', studentLimit: 30, globalLimit: 1_000,
    windowMs: 24 * 60 * 60 * 1_000
  });
});

test('Tutor application service exposes only bounded cursor-paged thread summaries', async () => {
  const f = fixture();
  const olderId = randomUUID();
  const newerId = randomUUID();
  f.bundles.set(olderId, safeBundle({ ...f.base, versionNumber: 1, questionNumber: 3 }, olderId, {
    updatedAt: '2026-08-01T11:00:00.000Z'
  }));
  f.bundles.set(newerId, safeBundle({ ...f.base, versionNumber: 1, questionNumber: 3 }, newerId, {
    updatedAt: '2026-08-01T12:00:00.000Z'
  }));
  const first = await f.service.listThreads({ ...f.base, query: { limit: '1' } });
  assert.equal(first.items.length, 1);
  assert.equal(typeof first.nextCursor, 'string');
  const call = f.calls.find(([name]) => name === 'list')[1];
  assert.deepEqual(call.options, { limit: 1, cursor: null });
  assert.equal(Object.hasOwn(first.items[0], 'messages'), false);
  await f.service.listThreads({ ...f.base, query: { limit: '1', cursor: first.nextCursor } });
  const secondCall = f.calls.filter(([name]) => name === 'list').at(-1)[1];
  assert.equal(secondCall.options.cursor.threadId, first.items[0].thread.id);
  await assert.rejects(() => f.service.listThreads({ ...f.base, query: { limit: '21' } }),
    (error) => error.statusCode === 400);
  await assert.rejects(() => f.service.listThreads({ ...f.base, query: { all: 'true' } }),
    (error) => error.statusCode === 400);
});

test('Tutor application service enforces path BOLA and never mutates a mismatched thread', async () => {
  const f = fixture();
  const threadId = randomUUID();
  f.bundles.set(threadId, safeBundle({
    ...f.base, learningSubmissionId: randomUUID(), versionNumber: 1, questionNumber: 3
  }, threadId));
  await assert.rejects(() => f.service.sendMessage({
    ...f.base, threadId, idempotencyKey: 'message-request-0002', message: 'Hello.'
  }), (error) => error.statusCode === 404 && error.code === 'TUTOR_RESOURCE_NOT_FOUND');
  assert.equal(f.calls.some(([name]) => name === 'message'), false);
});

test('Tutor application service maps stable domain errors without exposing internals', async () => {
  const f = fixture();
  f.store.createTutorRootThread = async () => {
    throw new TutorStoreError('TUTOR_SOURCE_LINEAGE_MISMATCH', 'sensitive internal detail');
  };
  await assert.rejects(() => f.service.createRootThread({
    ...f.base, idempotencyKey: 'root-request-0003'
  }), (error) => error.statusCode === 404
    && error.code === 'TUTOR_RESOURCE_NOT_FOUND'
    && !error.message.includes('sensitive'));
  await assert.rejects(() => f.service.createRootThread({
    ...f.base, idempotencyKey: 'short'
  }), (error) => error.statusCode === 400 && error.code === 'IDEMPOTENCY_KEY_REQUIRED');

  const threadId = randomUUID();
  f.bundles.set(threadId, safeBundle({ ...f.base, versionNumber: 1, questionNumber: 3 }, threadId));
  f.store.enqueueTutorTurn = async () => { throw new TutorDomainError('FORK_REQUIRED'); };
  await assert.rejects(() => f.service.sendMessage({
    ...f.base, threadId, idempotencyKey: 'message-request-0004', message: 'Continue.'
  }), (error) => error.statusCode === 409 && error.code === 'TUTOR_FORK_REQUIRED');
  await assert.rejects(() => f.service.sendMessage({
    ...f.base, threadId, idempotencyKey: 'message-request-blank', message: ' \n\t '
  }), (error) => error.statusCode === 400 && error.code === 'VALIDATION_ERROR');
});

test('Tutor provider budgets are server-owned and stable Store limits become bounded HTTP 429', async () => {
  const f = fixture();
  const service = new QuestionTutorApplicationService({
    store: f.store,
    providerBudget: { studentLimit: 3, globalLimit: 7 },
    clock: () => new Date('2026-08-01T12:00:00.000Z')
  });
  const threadId = randomUUID();
  f.bundles.set(threadId, safeBundle({
    ...f.base, versionNumber: 1, questionNumber: 3
  }, threadId));
  await service.sendMessage({
    ...f.base, threadId, idempotencyKey: 'message-budget-0001',
    message: 'Can you challenge this invariant?',
    providerBudget: { studentLimit: 999_999, globalLimit: 999_999 }
  });
  assert.deepEqual(f.calls.find(([name]) => name === 'message')[1].providerBudget, {
    budgetKind: 'PROVIDER_WORK', studentLimit: 3, globalLimit: 7,
    windowMs: 24 * 60 * 60 * 1_000
  });

  f.store.enqueueTutorTurn = async () => {
    throw new TutorStoreError('TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED', undefined, {
      retryAfterSeconds: 200_000
    });
  };
  await assert.rejects(() => service.sendMessage({
    ...f.base, threadId, idempotencyKey: 'message-budget-0002', message: 'Try once more.'
  }), (error) => error.statusCode === 429
    && error.code === 'TUTOR_PROVIDER_WORK_RATE_LIMITED'
    && error.details.retryAfterSeconds === 86_400);
});

test('Tutor application service selects fork/retry identities only inside the Store', async () => {
  const f = fixture();
  const parentId = randomUUID();
  f.bundles.set(parentId, safeBundle({ ...f.base, versionNumber: 1, questionNumber: 3 }, parentId));
  const forked = await f.service.forkThread({
    ...f.base, threadId: parentId, idempotencyKey: 'fork-request-0001'
  });
  assert.notEqual(forked.thread.thread.id, parentId);
  const forkInput = f.calls.find(([name]) => name === 'fork')[1];
  assert.equal(Object.hasOwn(forkInput, 'parentTurnJobId'), false);

  const retried = await f.service.retryRequest({
    ...f.base, threadId: parentId, requestOrdinal: '1',
    idempotencyKey: 'retry-request-0001'
  });
  assert.equal(retried.acceptedRequest.requestOrdinal, 2);
  const retryInput = f.calls.find(([name]) => name === 'retry')[1];
  assert.equal(retryInput.requestOrdinal, 1);
  assert.equal(Object.hasOwn(retryInput, 'previousJobId'), false);
  assert.equal(retryInput.providerBudget.budgetKind, 'PROVIDER_WORK');
});

test('Tutor application service performs scoped idempotent delete inside one Store unit', async () => {
  const f = fixture();
  const threadId = randomUUID();
  f.bundles.set(threadId, safeBundle({ ...f.base, versionNumber: 1, questionNumber: 3 }, threadId));
  await assert.rejects(() => f.service.tombstoneThread({ ...f.base, threadId }),
    (error) => error.statusCode === 400 && error.code === 'IDEMPOTENCY_KEY_REQUIRED');
  assert.equal(f.calls.some(([name]) => name === 'delete'), false);
  await f.service.tombstoneThread({
    ...f.base, threadId, idempotencyKey: 'delete-request-0001'
  });
  const deletion = f.calls.find(([name]) => name === 'delete')[1];
  assert.equal(deletion.threadId, threadId);
  assert.equal(deletion.learningSubmissionId, f.base.learningSubmissionId);
  assert.equal(deletion.idempotencyKey, 'delete-request-0001');
  assert.equal(f.calls.filter(([name]) => name === 'get').length, 0,
    'delete must not use a get-then-delete authorization window');
});
