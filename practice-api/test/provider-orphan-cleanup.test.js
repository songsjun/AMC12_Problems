import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderOrphanCleanupWorker } from '../src/batch-ingest/provider-orphan-cleanup-worker.js';
import { MemoryStore } from '../src/memory-store.js';

const TRANSCRIPT_ID = '6ea68fd3-f953-42c1-9742-976c447fb463';
const UPLOAD_HASH = 'a'.repeat(64);

function deletePending(overrides = {}) {
  return {
    event: 'ORPHAN_TRANSCRIPT_DELETE_PENDING',
    provider: 'assemblyai',
    providerTranscriptId: TRANSCRIPT_ID,
    deletionGeneration: 0,
    errorCode: 'ASSEMBLYAI_UNAVAILABLE',
    attemptedAt: new Date('2026-08-01T12:00:00.000Z'),
    ...overrides
  };
}

function uploadPending(overrides = {}) {
  return {
    event: 'PROVIDER_RETENTION_PENDING',
    provider: 'assemblyai',
    uploadUrlSha256: UPLOAD_HASH,
    deletionGeneration: 0,
    errorCode: 'ASSEMBLYAI_UNAVAILABLE',
    providerRetentionNotBefore: new Date('2026-08-03T12:00:00.000Z'),
    detectedAt: new Date('2026-08-01T12:00:00.000Z'),
    ...overrides
  };
}

test('unbound transcript cleanup leases the exact id and appends provider response evidence', async () => {
  const store = new MemoryStore();
  await store.recordProviderOrphanAudit(deletePending());
  const pendingBefore = structuredClone(store.learningBatchProviderOrphanAudit[0]);
  const deletedIds = [];
  const authorizationBudgets = [];
  const originalAuthorize = store.authorizeProviderOrphanCall.bind(store);
  store.authorizeProviderOrphanCall = async (input) => {
    authorizationBudgets.push(input.providerBudget);
    return originalAuthorize(input);
  };
  const worker = new ProviderOrphanCleanupWorker({
    store,
    client: {
      async deleteTranscript(transcriptId) {
        deletedIds.push(transcriptId);
        return { transcriptId, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
      }
    },
    workerId: 'provider-orphan-worker',
    clock: () => new Date('2026-08-01T12:00:01.000Z')
  });

  assert.deepEqual(await worker.runOnce(), {
    processed: true, status: 'provider-delete-response'
  });
  assert.deepEqual(deletedIds, [TRANSCRIPT_ID]);
  assert.deepEqual(authorizationBudgets, [{
    studentLimit: null, globalLimit: 100_000,
    windowMs: 24 * 60 * 60 * 1_000, budgetKind: 'PROVIDER_CLEANUP'
  }]);
  assert.equal([...store.studentResourceBudgetWindows.values()].length, 0,
    'privacy cleanup never waits on a student business quota');
  assert.equal([...store.globalResourceBudgetWindows.values()][0].budgetKind, 'PROVIDER_CLEANUP');
  assert.deepEqual(store.learningBatchProviderOrphanAudit[0], pendingBefore,
    'append-only pending event must never be rewritten');
  const evidence = store.learningBatchProviderOrphanAudit[1];
  assert.equal(evidence.event, 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED');
  assert.equal(evidence.externalId, TRANSCRIPT_ID);
  assert.equal(evidence.evidenceCode, 'provider-delete-response');
  assert.equal(evidence.sourceAuditId, pendingBefore.id);
  assert.equal([...store.learningBatchProviderOrphanCleanupJobs.values()][0].status, 'SUCCEEDED');
});

test('provider DELETE commit loss retries the persisted exact id and records 404 as already absent', async () => {
  const store = new MemoryStore();
  await store.recordProviderOrphanAudit(deletePending());
  let now = new Date('2026-08-01T12:00:01.000Z');
  let providerCalls = 0;
  const originalComplete = store.completeProviderOrphanCleanup.bind(store);
  store.completeProviderOrphanCleanup = async (input) => {
    if (providerCalls === 1) throw new Error('injected commit loss before durable evidence');
    return originalComplete(input);
  };
  const requestedIds = [];
  const worker = new ProviderOrphanCleanupWorker({
    store,
    client: {
      async deleteTranscript(transcriptId) {
        requestedIds.push(transcriptId);
        providerCalls += 1;
        return {
          transcriptId,
          deletionEvidenced: true,
          evidenceType: providerCalls === 1 ? 'provider-delete-response' : 'provider-already-absent'
        };
      }
    },
    workerId: 'provider-orphan-worker',
    clock: () => now
  });

  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'RETRY_SCHEDULED' });
  assert.equal(store.learningBatchProviderOrphanAudit.length, 1);
  now = new Date('2026-08-01T12:00:03.000Z');
  assert.deepEqual(await worker.runOnce(), {
    processed: true, status: 'provider-already-absent'
  });
  assert.deepEqual(requestedIds, [TRANSCRIPT_ID, TRANSCRIPT_ID]);
  const evidence = store.learningBatchProviderOrphanAudit[1];
  assert.equal(evidence.evidenceCode, 'provider-already-absent');
  assert.equal(evidence.sourceAuditId, store.learningBatchProviderOrphanAudit[0].id);
});

test('upload-only orphan waits for configured retention window and records no provider or physical-delete claim', async () => {
  const store = new MemoryStore();
  await store.recordProviderOrphanAudit(uploadPending());
  let now = new Date('2026-08-03T11:59:59.999Z');
  let providerCalls = 0;
  let providerAuthorizations = 0;
  const originalAuthorize = store.authorizeProviderOrphanCall.bind(store);
  store.authorizeProviderOrphanCall = async (input) => {
    providerAuthorizations += 1;
    return originalAuthorize(input);
  };
  const worker = new ProviderOrphanCleanupWorker({
    store,
    client: { async deleteTranscript() { providerCalls += 1; throw new Error('must not call provider'); } },
    workerId: 'provider-orphan-worker',
    clock: () => now
  });

  assert.deepEqual(await worker.runOnce(), { processed: false });
  now = new Date('2026-08-03T12:00:00.000Z');
  assert.deepEqual(await worker.runOnce(), {
    processed: true, status: 'provider-retention-window-elapsed'
  });
  assert.equal(providerCalls, 0);
  assert.equal(providerAuthorizations, 0);
  const [pending, evidence] = store.learningBatchProviderOrphanAudit;
  assert.equal(pending.evidencedAt, undefined);
  assert.equal(evidence.event, 'PROVIDER_RETENTION_WINDOW_ELAPSED');
  assert.equal(evidence.evidenceCode, 'provider-retention-window-elapsed');
  assert.equal(evidence.sourceAuditId, pending.id);
  assert.notEqual(evidence.evidenceCode, 'provider-delete-response');
  assert.equal([...store.learningBatchProviderOrphanCleanupJobs.values()][0].status,
    'MANUAL_VERIFICATION_REQUIRED');
});

test('expired cleanup leases are reclaimed and stale tokens cannot authorize or complete', async () => {
  const store = new MemoryStore();
  const startedAt = new Date('2026-08-01T12:00:00.000Z');
  await store.recordProviderOrphanAudit(deletePending({ attemptedAt: startedAt }));
  const first = await store.claimNextProviderOrphanCleanup({
    workerId: 'provider-orphan-a', now: startedAt, leaseMs: 10_000
  });
  assert.equal(await store.authorizeProviderOrphanCall({
    jobId: first.id, leaseToken: 'wrong-token', externalId: TRANSCRIPT_ID,
    now: new Date('2026-08-01T12:00:01.000Z')
  }), false);
  const reclaimedAt = new Date('2026-08-01T12:00:11.000Z');
  const second = await store.claimNextProviderOrphanCleanup({
    workerId: 'provider-orphan-b', now: reclaimedAt, leaseMs: 10_000
  });
  assert.notEqual(second.leaseToken, first.leaseToken);
  assert.equal(second.attemptCount, 2);
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: first.id, leaseToken: first.leaseToken,
    evidenceType: 'provider-delete-response', now: reclaimedAt
  }), false);
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: second.id, leaseToken: second.leaseToken,
    evidenceType: 'provider-already-absent', now: new Date('2026-08-01T12:00:12.000Z')
  }), true);
});

test('retention-window elapsed remains pending until independent deletion confirmation', async () => {
  const store = new MemoryStore();
  const attemptId = '00000000-0000-4000-8000-000000000010';
  const batchId = '00000000-0000-4000-8000-000000000020';
  store.attempts.set(attemptId, { id: attemptId });
  store.learningBatches.set(batchId, {
    id: batchId, attemptId, deletionState: 'DELETE_REQUESTED', deletionGeneration: 1
  });
  await store.recordProviderOrphanAudit(uploadPending({
    batchId, deletionGeneration: 1,
    providerRetentionNotBefore: new Date('2026-08-05T12:00:00.000Z')
  }));
  await store.withAttemptLock(attemptId, (tx) => tx.completeLearningBatchLocalPurge({
    batchId, expectedDeletionGeneration: 1, now: new Date('2026-08-01T12:00:00.000Z')
  }));
  assert.equal(store.learningBatches.get(batchId).deletionState, 'PROVIDER_RETENTION_PENDING');

  const worker = new ProviderOrphanCleanupWorker({
    store,
    client: { async deleteTranscript() { throw new Error('TTL must not call provider'); } },
    workerId: 'provider-orphan-worker',
    clock: () => now
  });
  let now = new Date('2026-08-03T12:00:00.000Z');
  assert.equal((await worker.runOnce()).processed, false, '48 hours cannot complete deletion');
  assert.equal(store.learningBatches.get(batchId).deletionState, 'PROVIDER_RETENTION_PENDING');
  now = new Date('2026-08-04T12:00:00.000Z');
  assert.equal((await worker.runOnce()).processed, false, '72 hours cannot complete deletion');
  assert.equal(store.learningBatches.get(batchId).deletionState, 'PROVIDER_RETENTION_PENDING');
  now = new Date('2026-08-05T12:00:00.000Z');
  assert.equal((await worker.runOnce()).processed, true);
  assert.equal(store.learningBatches.get(batchId).deletionState, 'PROVIDER_RETENTION_PENDING');
  const job = [...store.learningBatchProviderOrphanCleanupJobs.values()][0];
  assert.equal(job.status, 'MANUAL_VERIFICATION_REQUIRED');
  assert.equal(await store.confirmProviderRetentionDeletion({
    jobId: job.id,
    verificationAuthority: 'assemblyai-support-ticket-operator',
    verificationReferenceHash: 'c'.repeat(64),
    now: new Date('2026-08-05T12:00:01.000Z')
  }), true);
  assert.equal(store.learningBatches.get(batchId).deletionState, 'COMPLETE');
  const confirmation = store.learningBatchProviderOrphanAudit.at(-1);
  assert.equal(confirmation.event, 'PROVIDER_RETENTION_DELETION_CONFIRMED');
  assert.equal(confirmation.evidenceCode, 'independent-provider-deletion-confirmation');
});
