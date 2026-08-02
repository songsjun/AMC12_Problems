import test from 'node:test';
import assert from 'node:assert/strict';
import { AiWorkDispatcher } from '../src/ai-work-dispatcher.js';

function fixture({ tutorClaims = [], aiClaims = [] } = {}) {
  const workerId = 'shared-tutor-dispatcher';
  const calls = [];
  const store = {
    async claimTutorTurnJob(input) {
      calls.push(['claim-tutor', input]);
      return tutorClaims.shift() || null;
    },
    async claimNextAiWork(input) {
      calls.push(['claim-ai', input]);
      return aiClaims.shift() || null;
    }
  };
  const tutorWorker = {
    workerId,
    async processClaimed(claim, { signal }) {
      calls.push(['process-tutor', claim, signal]);
      return { processed: true, kind: 'TUTOR_TURN' };
    }
  };
  const interactiveWorker = {
    workerId,
    async processClaimed(job, { signal }) {
      calls.push(['process-analysis', job, signal]);
      return { processed: true, kind: 'INTERACTIVE_ANALYSIS' };
    }
  };
  const batchWorker = {
    workerId,
    async processClaimed(job, { signal }) {
      calls.push(['process-batch', job, signal]);
      return { processed: true, kind: 'BATCH_EXTRACTION' };
    }
  };
  return {
    workerId, store, tutorWorker, interactiveWorker, batchWorker, calls,
    tutorClaims, aiClaims
  };
}

test('unified dispatcher gives a waiting Tutor turn strict precedence over other AI work', async () => {
  const f = fixture({
    tutorClaims: [{ job: { id: 'tutor-job' }, request: { turnId: 'tutor-job' } }],
    aiClaims: [{ kind: 'INTERACTIVE_ANALYSIS', job: { id: 'analysis-job' } }]
  });
  const dispatcher = new AiWorkDispatcher({
    store: f.store, tutorWorker: f.tutorWorker,
    interactiveWorker: f.interactiveWorker, batchWorker: f.batchWorker,
    workerId: f.workerId, concurrency: 2, maxBatchConcurrent: 1
  });
  assert.deepEqual(await dispatcher.runOnce(), { processed: true, kind: 'TUTOR_TURN' });
  assert.deepEqual(f.calls.map(([name]) => name), ['claim-tutor', 'process-tutor']);
  assert.deepEqual(await dispatcher.runOnce(), { processed: true, kind: 'INTERACTIVE_ANALYSIS' });
  assert.deepEqual(f.calls.map(([name]) => name), [
    'claim-tutor', 'process-tutor', 'claim-tutor', 'claim-ai', 'process-analysis'
  ]);
});

test('unified dispatcher bounds Tutor concurrency so analysis cannot be starved', async () => {
  const f = fixture({
    tutorClaims: [
      { job: { id: 'tutor-job-1' }, request: { turnId: 'tutor-job-1' } },
      { job: { id: 'tutor-job-2' }, request: { turnId: 'tutor-job-2' } }
    ],
    aiClaims: [{ kind: 'INTERACTIVE_ANALYSIS', job: { id: 'analysis-job' } }]
  });
  let releaseTutor;
  let releaseAnalysis;
  f.tutorWorker.processClaimed = async () => new Promise((resolve) => { releaseTutor = resolve; });
  f.interactiveWorker.processClaimed = async () => new Promise((resolve) => { releaseAnalysis = resolve; });
  const dispatcher = new AiWorkDispatcher({
    store: f.store, tutorWorker: f.tutorWorker,
    interactiveWorker: f.interactiveWorker, batchWorker: f.batchWorker,
    workerId: f.workerId, concurrency: 2, maxBatchConcurrent: 1,
    maxTutorConcurrent: 1
  });
  assert.deepEqual(await dispatcher.tick(), { claimed: 2, active: 2 });
  assert.deepEqual(f.calls.map(([name]) => name), ['claim-tutor', 'claim-ai']);
  assert.equal(f.tutorClaims.length, 1, 'the second Tutor job stays durable for a later slot');
  releaseTutor({ processed: true });
  releaseAnalysis({ processed: true });
  await dispatcher.drain();
});

test('Tutor-only dispatcher does not fall through to the non-Tutor Store queue', async () => {
  const f = fixture();
  delete f.store.claimNextAiWork;
  const dispatcher = new AiWorkDispatcher({
    store: f.store, tutorWorker: f.tutorWorker,
    workerId: f.workerId, concurrency: 1, maxBatchConcurrent: 1
  });
  assert.deepEqual(await dispatcher.runOnce(), { processed: false });
  assert.deepEqual(f.calls.map(([name]) => name), ['claim-tutor']);
});

test('dispatcher rejects a Tutor worker with a different lease identity', () => {
  const f = fixture();
  f.tutorWorker.workerId = 'different-worker';
  assert.throws(() => new AiWorkDispatcher({
    store: f.store, tutorWorker: f.tutorWorker,
    workerId: f.workerId, concurrency: 1, maxBatchConcurrent: 1
  }), /share one worker identity/);
  f.tutorWorker.workerId = f.workerId;
  assert.throws(() => new AiWorkDispatcher({
    store: f.store, tutorWorker: f.tutorWorker,
    interactiveWorker: f.interactiveWorker, workerId: f.workerId,
    concurrency: 2, maxBatchConcurrent: 1, maxTutorConcurrent: 2
  }), /reserve at least one non-Tutor slot/);
});
