const DEFAULT_GRACE_MS = 60 * 60 * 1_000;
const DEFAULT_WRITING_TTL_MS = 30 * 60 * 1_000;
const DEFAULT_DRAFT_TTL_MS = 24 * 60 * 60 * 1_000;

export class PrivateStorageReconciler {
  constructor({
    store,
    privateUploadStore,
    graceMs = DEFAULT_GRACE_MS,
    writingTtlMs = DEFAULT_WRITING_TTL_MS,
    draftTtlMs = DEFAULT_DRAFT_TTL_MS,
    maxEntries = 10_000,
    cleanupLimit = 100,
    clock = () => new Date()
  }) {
    if (!store || !privateUploadStore
        || !Number.isSafeInteger(graceMs) || graceMs < 60_000
        || !Number.isSafeInteger(writingTtlMs) || writingTtlMs < 60_000
        || !Number.isSafeInteger(draftTtlMs) || draftTtlMs < writingTtlMs
        || !Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 100_000
        || !Number.isSafeInteger(cleanupLimit) || cleanupLimit < 1 || cleanupLimit > 1_000) {
      throw new Error('Private storage reconciler configuration is invalid.');
    }
    this.store = store;
    this.privateUploadStore = privateUploadStore;
    this.graceMs = graceMs;
    this.writingTtlMs = writingTtlMs;
    this.draftTtlMs = draftTtlMs;
    this.maxEntries = maxEntries;
    this.cleanupLimit = cleanupLimit;
    this.clock = clock;
  }

  async runOnce() {
    const now = this.clock();
    const inventory = await this.privateUploadStore.inventory({ maxEntries: this.maxEntries });
    const observed = await this.store.observePrivateStorageInventory({
      objects: inventory.objects,
      partials: inventory.partials,
      now,
      graceMs: this.graceMs,
      inventoryComplete: inventory.truncated !== true
    });
    let deletedObjectCount = 0;
    let deletedPartialCount = 0;
    for (const candidate of observed.deletable) {
      const deletionToken = await this.store.authorizePrivateStorageDeletion({ ...candidate, now });
      if (!deletionToken) continue;
      const deleted = candidate.kind === 'OBJECT'
        ? await this.privateUploadStore.deleteObjectIfUnchanged(candidate)
        : await this.privateUploadStore.deletePartialIfUnchanged(candidate);
      if (!deleted) continue;
      await this.store.recordPrivateStorageDeletion({
        kind: candidate.kind,
        identity: candidate.kind === 'OBJECT' ? candidate.storageKey : candidate.name,
        size: candidate.size,
        mtimeMs: candidate.mtimeMs,
        deletionToken,
        deleted,
        deletedAt: now
      });
      if (deleted && candidate.kind === 'OBJECT') deletedObjectCount += 1;
      else if (deleted) deletedPartialCount += 1;
    }

    const expired = await this.store.expireLearningBatchReservations({
      now,
      writingTtlMs: this.writingTtlMs,
      draftTtlMs: this.draftTtlMs,
      limit: this.cleanupLimit
    });
    let expiredBatchCount = 0;
    for (const purge of expired.purges) {
      for (const storageKey of purge.storageKeys) await this.privateUploadStore.delete(storageKey);
      if (await this.store.completeExpiredLearningBatchPurge({
        batchId: purge.batchId,
        deletionGeneration: purge.deletionGeneration,
        now
      })) expiredBatchCount += 1;
    }
    return {
      scannedCount: inventory.scannedCount,
      inventoryTruncated: inventory.truncated,
      unexpectedCount: inventory.unexpectedCount,
      partialCount: inventory.partialCount,
      referencedCount: observed.referencedCount,
      candidateBacklog: observed.candidateCount,
      deletionEligibleCount: observed.deletable.length,
      deletedObjectCount,
      deletedPartialCount,
      writingResetCount: expired.writingResetCount,
      expiredBatchCount,
      cleanupBacklogPossible: inventory.truncated || expired.purges.length >= this.cleanupLimit
    };
  }
}

export const _test = { DEFAULT_GRACE_MS, DEFAULT_WRITING_TTL_MS, DEFAULT_DRAFT_TTL_MS };
