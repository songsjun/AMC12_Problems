import test from 'node:test';
import assert from 'node:assert/strict';
import { AssemblyAiClientError } from '../src/infrastructure/assemblyai-prerecorded.js';
import { BatchTranscriptionWorker } from '../src/batch-ingest/transcription-worker.js';
import { TranscriptionWorkerPort } from '../src/learning-review/transcription-worker-port.js';

const RETENTION_PROFILE = Object.freeze({
  name: 'CONFIGURED_TTL', policyDelayMs: 72 * 60 * 60 * 1_000,
  uploadRequestMaxDurationMs: 120_000, processingSlackMs: 72 * 60 * 60 * 1_000
});

const TRANSCRIPT_ID = '9ea68fd3-f953-42c1-9742-976c447fb463';
const NOW = new Date('2026-08-01T12:00:00Z');
const submitJob = {
  workItemId: 'work-0001', leaseToken: 'lease-0001', deletionGeneration: 0, assetStorageKey: 'private-key'
};
const durableJob = {
  workItemId: 'work-0001', leaseToken: 'lease-0002', deletionGeneration: 0,
  providerTranscriptId: TRANSCRIPT_ID, providerTranscriptPersistedAt: '2026-08-01T11:59:00Z'
};
const reconcileJob = {
  workItemId: 'work-0001', leaseToken: 'lease-reconcile', deletionGeneration: 0,
  submitCallId: 'submit-call-0001', submitCallStartedAt: '2026-08-01T12:00:00Z',
  uploadUrlSha256: 'a'.repeat(64)
};
const NOOP_ORPHAN_AUDIT = { async record() {} };

function storeSpy(overrides = {}) {
  const calls = [];
  const method = (name) => async (value) => { calls.push([name, value]); return true; };
  return {
    calls,
    authorizeTranscriptionProviderCall: async () => true,
    beginTranscriptionUploadCall: async (value) => { calls.push(['beginTranscriptionUploadCall', value]); return { callId: 'upload-call-0001' }; },
    recordTranscriptionUploadResponse: method('recordTranscriptionUploadResponse'),
    beginTranscriptionSubmitCall: async (value) => { calls.push(['beginTranscriptionSubmitCall', value]); return { callId: 'submit-call-0001' }; },
    deferAmbiguousUploadUntilRetention: method('deferAmbiguousUploadUntilRetention'),
    markAmbiguousSubmitForReconciliation: method('markAmbiguousSubmitForReconciliation'),
    recordAmbiguousSubmitReconciliation: method('recordAmbiguousSubmitReconciliation'),
    recordSubmitted: method('recordSubmitted'),
    recordSubmissionFailure: method('recordSubmissionFailure'),
    recordPollPending: method('recordPollPending'),
    failTranscriptionAndScheduleDeletion: method('failTranscriptionAndScheduleDeletion'),
    persistNormalizedTranscriptAndScheduleDeletion: method('persistNormalizedTranscriptAndScheduleDeletion'),
    recordPollFailure: method('recordPollFailure'),
    recordLocalAudioPurged: method('recordLocalAudioPurged'),
    recordDeletionEvidence: method('recordDeletionEvidence'),
    recordDeletionRetry: method('recordDeletionRetry'),
    ...overrides
  };
}

test('submit durably records transcript id and upload URL hash, then exits without polling', async () => {
  const calls = [];
  const client = {
    async upload() { calls.push('upload'); return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' }; },
    async submit() { calls.push('submit'); return { transcriptId: TRANSCRIPT_ID, status: 'queued' }; },
    async getTranscript() { calls.push('poll'); throw new Error('must not poll'); }
  };
  const store = storeSpy();
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client, store, orphanAudit: NOOP_ORPHAN_AUDIT, clock: () => NOW,
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.deepEqual(await worker.submitOnce(submitJob), { processed: true, status: 'SUBMITTED' });
  assert.deepEqual(calls, ['upload', 'submit']);
  assert.deepEqual(store.calls.map(([name]) => name), [
    'beginTranscriptionUploadCall', 'recordTranscriptionUploadResponse',
    'beginTranscriptionSubmitCall', 'recordSubmitted'
  ]);
  const persisted = store.calls.find(([name]) => name === 'recordSubmitted')[1];
  assert.equal(persisted.providerTranscriptId, TRANSCRIPT_ID);
  assert.equal(persisted.submitCallId, 'submit-call-0001');
  assert.match(persisted.uploadUrlSha256, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(persisted).includes('cdn.assemblyai.com'), false);
});

test('poll requires a reloaded durable transcript id and persists normalized text before deletion is eligible', async () => {
  const store = storeSpy();
  const client = {
    async getTranscript() {
      return { status: 'completed', text: 'Q1 answer A because...', confidence: 0.88, audioDurationSeconds: 42 };
    }
  };
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client, store, orphanAudit: NOOP_ORPHAN_AUDIT, assetReader: { open() {} }, clock: () => NOW
  });
  await assert.rejects(
    () => worker.pollOnce({ ...durableJob, providerTranscriptPersistedAt: undefined }),
    /durable poll/
  );
  assert.deepEqual(await worker.pollOnce(durableJob), {
    processed: true, status: 'TRANSCRIPT_STORED_DELETE_PENDING'
  });
  assert.equal(store.calls[0][0], 'persistNormalizedTranscriptAndScheduleDeletion');
  assert.equal(store.calls[0][1].transcriptText, 'Q1 answer A because...');
  assert.match(store.calls[0][1].transcriptSha256, /^[0-9a-f]{64}$/);
  assert.equal(store.calls[0][1].transcriptionUncertain, true);
  assert.equal(store.calls.some(([name]) => name === 'recordDeletionEvidence'), false);
});

test('queued polling is retryable; terminal provider error and over-60-minute audio still schedule deletion', async () => {
  for (const [transcript, expectedCode] of [
    [{ status: 'error' }, 'ASSEMBLYAI_TRANSCRIPTION_FAILED'],
    [{ status: 'completed', text: 'too long', confidence: 0.7, audioDurationSeconds: 3_601 }, 'AUDIO_DURATION_EXCEEDED'],
    [{ status: 'completed', text: 'missing duration', confidence: 0.7, audioDurationSeconds: null }, 'AUDIO_DURATION_EXCEEDED']
  ]) {
    const store = storeSpy();
    const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
      client: { async getTranscript() { return transcript; } }, store, orphanAudit: NOOP_ORPHAN_AUDIT,
      assetReader: { open() {} }, clock: () => NOW
    });
    assert.equal((await worker.pollOnce(durableJob)).status, 'FAILED_DELETE_PENDING');
    assert.equal(store.calls[0][0], 'failTranscriptionAndScheduleDeletion');
    assert.equal(store.calls[0][1].errorCode, expectedCode);
  }

  const pendingStore = storeSpy();
  const pending = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: { async getTranscript() { return { status: 'processing' }; } }, store: pendingStore,
    orphanAudit: NOOP_ORPHAN_AUDIT,
    assetReader: { open() {} }
  });
  assert.equal((await pending.pollOnce(durableJob)).status, 'POLL_PENDING');
  assert.equal(pendingStore.calls[0][0], 'recordPollPending');
});

test('provider deletion success is audited and failure remains visibly retryable', async () => {
  const authorizationCalls = [];
  const successStore = storeSpy({
    async authorizeTranscriptionProviderCall(input) { authorizationCalls.push(input); return true; }
  });
  const success = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: { async deleteTranscript() {
      return { transcriptId: TRANSCRIPT_ID, deletionEvidenced: true, evidenceType: 'provider-delete-response' };
    } },
    store: successStore, orphanAudit: NOOP_ORPHAN_AUDIT, assetReader: { open() {} }, clock: () => NOW
  });
  assert.equal((await success.deleteOnce(durableJob)).status, 'DELETION_EVIDENCED');
  assert.equal(successStore.calls[0][0], 'recordDeletionEvidence');
  assert.equal(successStore.calls[0][1].evidenceType, 'provider-delete-response');
  assert.equal(authorizationCalls[0].providerBudget.budgetKind, 'PROVIDER_CLEANUP');
  assert.equal(authorizationCalls[0].providerBudget.studentLimit, null);

  const retryStore = storeSpy();
  const retry = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async deleteTranscript() {
        throw new AssemblyAiClientError('ASSEMBLYAI_RATE_LIMITED', {
          retryable: true, errorClass: 'rate_limit', retryAfterSeconds: 9
        });
      }
    },
    store: retryStore, orphanAudit: NOOP_ORPHAN_AUDIT, assetReader: { open() {} }, clock: () => NOW
  });
  assert.equal((await retry.deleteOnce(durableJob)).status, 'DELETION_RETRY');
  assert.deepEqual(
    Object.fromEntries(Object.entries(retryStore.calls[0][1]).filter(([key]) =>
      ['errorCode', 'retryable', 'errorClass', 'retryAfterSeconds'].includes(key))),
    { errorCode: 'ASSEMBLYAI_RATE_LIMITED', retryable: true, errorClass: 'rate_limit', retryAfterSeconds: 9 }
  );
});

test('submit failure never retries blindly and enters hash-bound reconciliation', async () => {
  const store = storeSpy();
  const auditCalls = [];
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload() { return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' }; },
      async submit() { throw new AssemblyAiClientError('ASSEMBLYAI_UNAVAILABLE', { retryable: true, errorClass: 'transient' }); }
    },
    store, orphanAudit: { async record(value) { auditCalls.push(value); } }, clock: () => NOW,
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.equal((await worker.submitOnce(submitJob)).status, 'SUBMIT_RECONCILIATION_PENDING');
  const failure = store.calls.find(([name]) => name === 'markAmbiguousSubmitForReconciliation')[1];
  assert.equal(failure.submitCallId, 'submit-call-0001');
  assert.equal(failure.errorCode, 'ASSEMBLYAI_UNAVAILABLE');
  assert.equal(JSON.stringify(store.calls).includes('cdn.assemblyai.com'), false);
  assert.deepEqual(auditCalls, []);
});

test('upload failure after the pre-call barrier waits for configured retention window without a blind retry', async () => {
  const store = storeSpy();
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: { async upload() {
      throw new AssemblyAiClientError('ASSEMBLYAI_UNAVAILABLE', { retryable: true, errorClass: 'transient' });
    } },
    store, orphanAudit: NOOP_ORPHAN_AUDIT, clock: () => NOW,
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.deepEqual(await worker.submitOnce(submitJob), { processed: true, status: 'UPLOAD_RETENTION_PENDING' });
  assert.deepEqual(store.calls.map(([name]) => name), [
    'beginTranscriptionUploadCall', 'deferAmbiguousUploadUntilRetention'
  ]);
  assert.equal(store.calls[0][1].providerRetentionNotBefore.toISOString(), '2026-08-07T12:02:00.000Z');
  assert.deepEqual(store.calls[0][1].retentionProfile, RETENTION_PROFILE);
});

test('upload response near timeout cannot shorten the pre-call retention not-before', async () => {
  const store = storeSpy();
  let now = NOW;
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload() {
        now = new Date(NOW.getTime() + RETENTION_PROFILE.uploadRequestMaxDurationMs - 1);
        return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' };
      },
      async submit() { return { transcriptId: TRANSCRIPT_ID, status: 'queued' }; }
    },
    store, orphanAudit: NOOP_ORPHAN_AUDIT, clock: () => now,
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.equal((await worker.submitOnce(submitJob)).status, 'SUBMITTED');
  assert.equal(store.calls[0][1].startedAt.toISOString(), NOW.toISOString());
  assert.equal(store.calls[0][1].providerRetentionNotBefore.toISOString(),
    '2026-08-07T12:02:00.000Z');
});

test('stale aggregate fence durably queues exact-id cleanup without an unfenced provider DELETE', async () => {
  const store = storeSpy({ recordSubmitted: async () => false });
  const auditCalls = [];
  let deletes = 0;
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload() { return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' }; },
      async submit() { return { transcriptId: TRANSCRIPT_ID, status: 'queued' }; },
      async deleteTranscript() {
        deletes += 1;
        return { deletionEvidenced: true, evidenceType: 'provider-delete-response' };
      }
    },
    store,
    orphanAudit: { async record(value) { auditCalls.push(value); } },
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.deepEqual(await worker.submitOnce(submitJob), {
    processed: false, staleWrite: true, orphanHandled: true
  });
  assert.equal(deletes, 0);
  assert.equal(auditCalls[0].event, 'ORPHAN_TRANSCRIPT_DELETE_PENDING');
  assert.equal(auditCalls[0].providerTranscriptId, TRANSCRIPT_ID);
  assert.equal(auditCalls[0].providerCallId, 'submit-call-0001');
  assert.equal(auditCalls[0].errorCode, 'TRANSCRIPT_NOT_BOUND');
});

test('recordSubmitted throw also durably queues cleanup and never invokes an unfenced DELETE', async () => {
  const store = storeSpy({ async recordSubmitted() { throw new Error('commit acknowledgement unknown'); } });
  const auditCalls = [];
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload() { return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' }; },
      async submit() { return { transcriptId: TRANSCRIPT_ID, status: 'queued' }; },
      async deleteTranscript() { throw new Error('must be delegated to durable orphan cleanup'); }
    },
    store,
    orphanAudit: { async record(value) { auditCalls.push(value); } },
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } }
  });
  assert.equal((await worker.submitOnce(submitJob)).orphanHandled, true);
  assert.equal(auditCalls[0].event, 'ORPHAN_TRANSCRIPT_DELETE_PENDING');
  assert.equal(auditCalls[0].errorCode, 'TRANSCRIPT_NOT_BOUND');
  assert.equal(auditCalls[0].providerCallId, 'submit-call-0001');
});

test('provider authorization is rechecked before every external call and upload-submit race becomes durable orphan evidence', async () => {
  const auditCalls = [];
  let authorizationCount = 0;
  const submitStore = storeSpy({
    async authorizeTranscriptionProviderCall() {
      authorizationCount += 1;
      return authorizationCount === 1;
    }
  });
  const providerCalls = [];
  const submitWorker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async upload() {
        providerCalls.push('upload');
        return { uploadUrl: 'https://cdn.assemblyai.com/upload/f756988d-47e2-4ca3-96ce-04bb168f8f2a' };
      },
      async submit() { providerCalls.push('submit'); throw new Error('must not submit'); }
    },
    store: submitStore,
    orphanAudit: { async record(event) { auditCalls.push(event); } },
    assetReader: { async open() { return { body: new Uint8Array([1]), contentLength: 1 }; } },
    clock: () => NOW
  });
  assert.deepEqual(await submitWorker.submitOnce(submitJob), {
    processed: false, staleWrite: true, orphanHandled: true
  });
  assert.deepEqual(providerCalls, ['upload']);
  assert.deepEqual(auditCalls, []);

  for (const [phase, invoke] of [
    ['poll', (worker) => worker.pollOnce(durableJob)],
    ['delete', (worker) => worker.deleteOnce(durableJob)]
  ]) {
    let calls = 0;
    const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
      client: {
        async getTranscript() { calls += 1; throw new Error('must not poll'); },
        async deleteTranscript() { calls += 1; throw new Error('must not delete'); }
      },
      store: storeSpy({ authorizeTranscriptionProviderCall: async () => false }),
      orphanAudit: NOOP_ORPHAN_AUDIT,
      assetReader: { open() {} }
    });
    assert.deepEqual(await invoke(worker), { processed: false, staleWrite: true }, phase);
    assert.equal(calls, 0, phase);
  }
});

test('provider DELETE commit-loss retries exact id and 404 is recorded as already-absent evidence', async () => {
  let deleteCalls = 0;
  const evidence = [];
  let firstCommit = true;
  const store = storeSpy({
    async recordDeletionEvidence(value) {
      if (firstCommit) {
        firstCommit = false;
        throw new Error('commit acknowledgement lost');
      }
      evidence.push(value);
      return true;
    }
  });
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async deleteTranscript() {
        deleteCalls += 1;
        return deleteCalls === 1
          ? { transcriptId: TRANSCRIPT_ID, deletionEvidenced: true, evidenceType: 'provider-delete-response' }
          : { transcriptId: TRANSCRIPT_ID, deletionEvidenced: true, evidenceType: 'provider-already-absent' };
      }
    },
    store, orphanAudit: NOOP_ORPHAN_AUDIT, assetReader: { open() {} }, clock: () => NOW
  });
  assert.equal((await worker.deleteOnce(durableJob)).status, 'DELETION_RETRY');
  assert.equal((await worker.deleteOnce(durableJob)).status, 'DELETION_EVIDENCED');
  assert.equal(deleteCalls, 2);
  assert.equal(evidence[0].evidenceType, 'provider-already-absent');
});

test('poll business attempts and age expire to cleanup while delete retries remain outside that cap', async () => {
  const jobs = [
    { ...durableJob, phase: 'poll', pollAttemptCount: 2, pollStartedAt: '2026-08-01T11:59:30Z' },
    { ...durableJob, phase: 'poll', pollAttemptCount: 0, pollStartedAt: '2026-08-01T10:00:00Z' },
    { ...durableJob, phase: 'delete', pollAttemptCount: 9_999, pollStartedAt: '2026-07-01T00:00:00Z' }
  ];
  const calls = [];
  const worker = new BatchTranscriptionWorker({
    store: { async claimNextTranscriptionWork() { return jobs.shift() || null; } },
    port: {
      async expireActiveTranscription() { calls.push('expire'); return { processed: true, status: 'FAILED_DELETE_PENDING' }; },
      async pollOnce() { calls.push('poll'); throw new Error('business-expired polls must not call provider'); },
      async deleteOnce() { calls.push('delete'); return { processed: true, status: 'DELETION_RETRY' }; }
    },
    workerId: 'poll-business-limit-worker', clock: () => NOW,
    maxBusinessAttempts: 2, maxBusinessAgeMs: 60_000
  });
  assert.equal((await worker.runOnce()).status, 'FAILED_DELETE_PENDING');
  assert.equal((await worker.runOnce()).status, 'FAILED_DELETE_PENDING');
  assert.equal((await worker.runOnce()).status, 'DELETION_RETRY');
  assert.deepEqual(calls, ['expire', 'expire', 'delete']);
});

test('incomplete reconciliation pagination reauthorizes every page and can never report absence', async () => {
  let authorizations = 0;
  let listCalls = 0;
  const store = storeSpy({
    async authorizeTranscriptionProviderCall() { authorizations += 1; return true; }
  });
  const worker = new TranscriptionWorkerPort({
    retentionProfile: RETENTION_PROFILE,
    client: {
      async listTranscripts() {
        listCalls += 1;
        return {
          transcripts: [],
          nextBeforeId: '8ea68fd3-f953-42c1-9742-976c447fb463'
        };
      }
    },
    store, orphanAudit: NOOP_ORPHAN_AUDIT, assetReader: { open() {} }, clock: () => NOW
  });
  assert.deepEqual(await worker.reconcileOnce(reconcileJob), {
    processed: true, status: 'RECONCILIATION_BLOCKED_MANUAL'
  });
  assert.equal(listCalls, 30, 'ten bounded pages are scanned for each of the three UTC dates');
  assert.equal(authorizations, listCalls, 'the durable call/hash/lease fence is checked per page');
  const recorded = store.calls.find(([name]) => name === 'recordAmbiguousSubmitReconciliation')[1];
  assert.equal(recorded.scanComplete, false);
  assert.deepEqual(recorded.providerTranscriptIds, []);
});
