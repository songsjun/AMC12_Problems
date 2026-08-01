import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { PrivateStorageReconciler } from '../src/batch-ingest/private-storage-reconciler.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { MemoryStore } from '../src/memory-store.js';

async function privateFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'amc-reconciler-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const privateUploadStore = new PrivateUploadStore({ root, highWatermarkPercent: 100 });
  await privateUploadStore.init();
  return { root, privateUploadStore, store: new MemoryStore() };
}

test('unknown objects need two DB observations plus mtime grace; a newly installed object is never deleted', async (t) => {
  const context = await privateFixture(t);
  const content = 'unbound-but-maybe-just-committed';
  const stored = await context.privateUploadStore.write({
    stream: Readable.from([content]), expectedBytes: Buffer.byteLength(content),
    kind: 'TEXT', contentType: 'text/plain'
  });
  let now = new Date('2026-08-01T12:00:00.000Z');
  const reconciler = new PrivateStorageReconciler({
    store: context.store, privateUploadStore: context.privateUploadStore,
    graceMs: 60_000, writingTtlMs: 60_000, draftTtlMs: 120_000,
    clock: () => now
  });
  const first = await reconciler.runOnce();
  assert.equal(first.deletedObjectCount, 0);
  assert.equal(await context.privateUploadStore.exists(stored.storageKey), true);
  now = new Date('2026-08-01T12:00:30.000Z');
  assert.equal((await reconciler.runOnce()).deletedObjectCount, 0);
  now = new Date('2026-08-01T12:01:01.000Z');
  const deleted = await reconciler.runOnce();
  assert.equal(deleted.deletedObjectCount, 1);
  assert.equal(await context.privateUploadStore.exists(stored.storageKey), false);
  assert.equal(context.store.privateStorageReconciliationAudit.at(-1).event, 'ORPHAN_DELETED');
});

test('DELETING token fences an ambiguous upload finalize between final DB authorization and unlink', async (t) => {
  const context = await privateFixture(t);
  const content = 'ambiguous-finalize-race';
  const stored = await context.privateUploadStore.write({
    stream: Readable.from([content]), expectedBytes: Buffer.byteLength(content),
    kind: 'TEXT', contentType: 'text/plain'
  });
  const objects = (await context.privateUploadStore.inventory()).objects;
  const firstAt = new Date('2026-08-01T12:00:00.000Z');
  await context.store.observePrivateStorageInventory({ objects, partials: [], now: firstAt, graceMs: 60_000 });
  const secondAt = new Date('2026-08-01T12:01:01.000Z');
  const decision = await context.store.observePrivateStorageInventory({ objects, partials: [], now: secondAt, graceMs: 60_000 });
  const deletionToken = await context.store.authorizePrivateStorageDeletion({ ...decision.deletable[0], now: secondAt });
  assert.match(deletionToken, /^[0-9a-f-]{36}$/i);

  const attemptId = '11111111-1111-4111-8111-111111111111';
  const studentId = '22222222-2222-4222-8222-222222222222';
  const batchId = '33333333-3333-4333-8333-333333333333';
  const assetId = '44444444-4444-4444-8444-444444444444';
  context.store.attempts.set(attemptId, { id: attemptId, studentId });
  context.store.learningBatches.set(batchId, {
    id: batchId, attemptId, studentId, learningSubmissionId: 'learning',
    status: 'DRAFT', deletionState: 'ACTIVE', deletionGeneration: 0
  });
  context.store.learningBatchAssets.set(batchId, [{
    id: assetId, batchId, kind: 'TEXT', position: 1, status: 'WRITING',
    uploadIdempotencyKey: 'ambiguous-upload', writingStartedAt: firstAt,
    observedBytes: null, storageKey: null
  }]);
  context.store.learningBatchEvidence.set(batchId, []);
  context.store.learningBatchQuota.set(assetId, { assetId, batchId, studentId, status: 'RESERVED' });
  const committed = await context.store.withAttemptLock(attemptId, (tx) => tx.completeLearningBatchAssetUpload({
    batchId, assetId, uploadIdempotencyKey: 'ambiguous-upload', deletionGeneration: 0,
    stored, normalizedText: content, now: secondAt
  }));
  assert.equal(committed, false, 'a DELETING candidate cannot become newly referenced after authorization');
  const candidate = decision.deletable[0];
  const deleted = await context.privateUploadStore.deleteObjectIfUnchanged(candidate);
  await context.store.recordPrivateStorageDeletion({
    kind: candidate.kind, identity: candidate.storageKey, size: candidate.size,
    mtimeMs: candidate.mtimeMs, deletionToken, deleted, deletedAt: secondAt
  });
  assert.equal(deleted, true);
});

test('DELETING crash recovery retries visible objects, accepts complete absence, and distrusts truncated absence', async (t) => {
  const context = await privateFixture(t);
  const content = 'deleting-crash-recovery';
  const stored = await context.privateUploadStore.write({
    stream: Readable.from([content]), expectedBytes: Buffer.byteLength(content),
    kind: 'TEXT', contentType: 'text/plain'
  });
  const [object] = (await context.privateUploadStore.inventory()).objects;
  const firstAt = new Date('2026-08-01T12:00:00.000Z');
  await context.store.observePrivateStorageInventory({
    objects: [object], partials: [], now: firstAt, graceMs: 60_000
  });
  const eligibleAt = new Date('2026-08-01T12:01:01.000Z');
  const eligible = await context.store.observePrivateStorageInventory({
    objects: [object], partials: [], now: eligibleAt, graceMs: 60_000
  });
  const token = await context.store.authorizePrivateStorageDeletion({
    ...eligible.deletable[0], now: eligibleAt
  });
  assert.ok(token);

  const truncatedAt = new Date('2026-08-01T12:01:30.000Z');
  await context.store.observePrivateStorageInventory({
    objects: [], partials: [], now: truncatedAt, graceMs: 60_000, inventoryComplete: false
  });
  assert.equal(context.store.privateStorageCandidates.get(`OBJECT:${stored.storageKey}`).status, 'DELETING',
    'a truncated inventory is never accepted as absence evidence');

  let now = new Date('2026-08-01T12:02:02.000Z');
  const reconciler = new PrivateStorageReconciler({
    store: context.store, privateUploadStore: context.privateUploadStore,
    graceMs: 60_000, writingTtlMs: 60_000, draftTtlMs: 120_000, clock: () => now
  });
  assert.equal((await reconciler.runOnce()).deletedObjectCount, 1,
    'a visible stale DELETING candidate is reauthorized and retried after grace');
  assert.equal(context.store.privateStorageCandidates.get(`OBJECT:${stored.storageKey}`).status, 'DELETED');

  const second = await context.privateUploadStore.write({
    stream: Readable.from([content]), expectedBytes: Buffer.byteLength(content),
    kind: 'TEXT', contentType: 'text/plain'
  });
  const secondObject = (await context.privateUploadStore.inventory()).objects
    .find((candidate) => candidate.storageKey === second.storageKey);
  now = new Date('2026-08-01T13:00:00.000Z');
  await context.store.observePrivateStorageInventory({
    objects: [secondObject], partials: [], now, graceMs: 60_000
  });
  now = new Date('2026-08-01T13:01:01.000Z');
  const secondEligible = await context.store.observePrivateStorageInventory({
    objects: [secondObject], partials: [], now, graceMs: 60_000
  });
  await context.store.authorizePrivateStorageDeletion({ ...secondEligible.deletable[0], now });
  await context.privateUploadStore.delete(second.storageKey);
  now = new Date('2026-08-01T13:01:02.000Z');
  await context.store.observePrivateStorageInventory({
    objects: [], partials: [], now, graceMs: 60_000, inventoryComplete: true
  });
  assert.equal(context.store.privateStorageCandidates.get(`OBJECT:${second.storageKey}`).status, 'DELETED',
    'a complete inventory closes crash-after-unlink without requiring another unlink');
  assert.equal(context.store.privateStorageReconciliationAudit.at(-1).event, 'ORPHAN_DELETED');
});

test('expired WRITING and DRAFT reservations are reset, tombstoned, released, and summarized', async (t) => {
  const context = await privateFixture(t);
  const attemptId = '51111111-1111-4111-8111-111111111111';
  const batchId = '53333333-3333-4333-8333-333333333333';
  const assetId = '54444444-4444-4444-8444-444444444444';
  const createdAt = new Date('2026-08-01T10:00:00.000Z');
  context.store.attempts.set(attemptId, { id: attemptId, studentId: 'student' });
  context.store.learningBatches.set(batchId, {
    id: batchId, attemptId, studentId: 'student', status: 'DRAFT',
    deletionState: 'ACTIVE', deletionGeneration: 0, createdAt
  });
  context.store.learningBatchAssets.set(batchId, [{
    id: assetId, batchId, status: 'WRITING', storageKey: null, observedBytes: null,
    writingStartedAt: createdAt, uploadIdempotencyKey: 'expired-writing'
  }]);
  context.store.learningBatchQuota.set(assetId, {
    assetId, batchId, studentId: 'student', status: 'RESERVED', reservedBytes: 10
  });
  const reconciler = new PrivateStorageReconciler({
    store: context.store, privateUploadStore: context.privateUploadStore,
    graceMs: 60_000, writingTtlMs: 60_000, draftTtlMs: 120_000,
    clock: () => new Date('2026-08-01T12:00:00.000Z')
  });
  const summary = await reconciler.runOnce();
  assert.equal(summary.writingResetCount, 1);
  assert.equal(summary.expiredBatchCount, 1);
  assert.equal(context.store.learningBatches.get(batchId).deletionState, 'COMPLETE');
  assert.equal(context.store.learningBatchQuota.get(assetId).status, 'RELEASED');
  assert.equal(context.store.learningBatchAssets.get(batchId)[0].status, 'REJECTED');
});
