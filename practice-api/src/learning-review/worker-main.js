import { hostname } from 'node:os';
import { dirname, resolve } from 'node:path';
import { AiWorkDispatcher } from '../ai-work-dispatcher.js';
import { PrivateStorageReconciler } from '../batch-ingest/private-storage-reconciler.js';
import { ProviderOrphanCleanupWorker } from '../batch-ingest/provider-orphan-cleanup-worker.js';
import { BatchTranscriptionWorker } from '../batch-ingest/transcription-worker.js';
import { BatchExtractionWorker } from '../batch-ingest/worker.js';
import { AmcBatchDecompositionClient } from '../infrastructure/amc-batch-decomposition-client.js';
import { AmcInferenceClient } from '../infrastructure/amc-inference-client.js';
import { AssemblyAiPrerecordedClient } from '../infrastructure/assemblyai-prerecorded.js';
import { loadAssemblyAiRetentionProfile } from '../infrastructure/assemblyai-retention-profile.js';
import { PrivateUploadStore } from '../infrastructure/private-upload-store.js';
import { runMigrations } from '../migrate.js';
import { PostgresStore } from '../postgres-store.js';
import { PracticeService } from '../service.js';
import { TranscriptionWorkerPort } from './transcription-worker-port.js';
import { LearningReviewWorker } from './worker.js';

function integer(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be an integer.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} is outside the supported range.`);
  }
  return value;
}

function childWorkerId(base, role) {
  return `${base.slice(0, 99 - role.length)}:${role}`;
}

const databaseUrl = process.env.AMC12_DATABASE_URL;
const token = process.env.AMC12_INFERENCE_TOKEN;
const assemblyAiKey = process.env.AMC12_ASSEMBLYAI_API_KEY;
const privateRoot = process.env.AMC12_PRIVATE_UPLOAD_ROOT;
const authPepper = process.env.AMC12_AUTH_PEPPER;
if (!databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
if (!token || token.length < 32) throw new Error('AMC12_INFERENCE_TOKEN must contain at least 32 characters.');
if (!assemblyAiKey || assemblyAiKey.length < 20) throw new Error('AMC12_ASSEMBLYAI_API_KEY is required.');
if (!privateRoot) throw new Error('AMC12_PRIVATE_UPLOAD_ROOT is required.');
if (!authPepper || authPepper.length < 32) throw new Error('AMC12_AUTH_PEPPER must contain at least 32 characters.');

const pollMs = integer('AMC12_LEARNING_WORKER_POLL_MS', 1_000, 100, 60_000);
const leaseMs = integer('AMC12_LEARNING_WORKER_LEASE_MS', 120_000, 10_000, 600_000);
const concurrency = integer('AMC12_AI_WORKER_CONCURRENCY', 2, 2, 32);
const maxBatchConcurrent = integer('AMC12_BATCH_MAX_CONCURRENT', 1, 1, 31);
if (maxBatchConcurrent >= concurrency) {
  throw new Error('AMC12_BATCH_MAX_CONCURRENT must reserve at least one interactive AI slot.');
}
const workerId = process.env.AMC12_LEARNING_WORKER_ID || `${hostname()}:${process.pid}:learning`;
const transcriptionWorkerId = childWorkerId(workerId, 'transcription');
const orphanCleanupWorkerId = childWorkerId(workerId, 'provider-orphan');
const store = new PostgresStore({ connectionString: databaseUrl });
await runMigrations(store.pool);
const privateUploadStore = new PrivateUploadStore({
  root: resolve(privateRoot),
  forbiddenRoots: [resolve(process.cwd()), dirname(resolve(process.cwd()))],
  minimumFreeBytes: integer('AMC12_PRIVATE_MINIMUM_FREE_BYTES', 512 * 1024 * 1024, 1, Number.MAX_SAFE_INTEGER)
});
await privateUploadStore.init();
const service = new PracticeService({
  store,
  privateUploadStore,
  authPepper,
  sessionTtlMs: 12 * 60 * 60 * 1_000,
  batchStudentQuotaBytes: integer('AMC12_BATCH_STUDENT_QUOTA_BYTES', 250 * 1024 * 1024, 1, Number.MAX_SAFE_INTEGER),
  batchGlobalQuotaBytes: integer('AMC12_BATCH_GLOBAL_QUOTA_BYTES', 10 * 1024 * 1024 * 1024, 1, Number.MAX_SAFE_INTEGER),
  batchActiveLimit: integer('AMC12_BATCH_ACTIVE_LIMIT', 3, 1, 100)
});
const gatewayOrigin = process.env.AMC12_INFERENCE_ORIGIN || 'http://127.0.0.1:4110';
const gatewayTimeoutMs = integer('AMC12_INFERENCE_TIMEOUT_MS', 65_000, 1_000, 180_000);
const interactiveWorker = new LearningReviewWorker({
  store,
  inferenceClient: new AmcInferenceClient({
    origin: gatewayOrigin,
    token,
    timeoutMs: gatewayTimeoutMs,
    maxResponseBytes: integer('AMC12_INFERENCE_MAX_RESPONSE_BYTES', 64 * 1024, 2_048, 1024 * 1024)
  }),
  workerId,
  leaseMs,
  maxAttempts: integer('AMC12_LEARNING_MAX_ATTEMPTS', 3, 1, 10),
  retryBaseMs: integer('AMC12_LEARNING_RETRY_BASE_MS', 5_000, 100, 600_000),
  retryMaxMs: integer('AMC12_LEARNING_RETRY_MAX_MS', 60_000, 100, 3_600_000)
});
const batchWorker = new BatchExtractionWorker({
  store,
  service,
  gatewayClient: new AmcBatchDecompositionClient({
    origin: gatewayOrigin,
    token,
    timeoutMs: gatewayTimeoutMs,
    maxResponseBytes: integer('AMC12_BATCH_INFERENCE_MAX_RESPONSE_BYTES', 128 * 1024, 16_384, 1024 * 1024)
  }),
  workerId,
  leaseMs,
  maxAttempts: integer('AMC12_BATCH_MAX_ATTEMPTS', 3, 1, 10),
  retryBaseMs: integer('AMC12_BATCH_RETRY_BASE_MS', 5_000, 100, 600_000),
  retryMaxMs: integer('AMC12_BATCH_RETRY_MAX_MS', 60_000, 100, 3_600_000)
});
const dispatcher = new AiWorkDispatcher({
  store, interactiveWorker, batchWorker, workerId, leaseMs, concurrency, maxBatchConcurrent,
  onError: (error) => console.error(JSON.stringify({
    event: 'ai_work_handler_error', code: error?.code || 'WORKER_FAILED'
  }))
});
const assemblyAiTimeoutMs = integer('AMC12_ASSEMBLYAI_TIMEOUT_MS', 120_000, 1_000, 180_000);
const assemblyAiRetentionProfile = loadAssemblyAiRetentionProfile(process.env, {
  uploadRequestMaxDurationMs: assemblyAiTimeoutMs
});
const assemblyAiClient = new AssemblyAiPrerecordedClient({
  apiKey: assemblyAiKey,
  timeoutMs: assemblyAiTimeoutMs
});
const transcriptionPort = new TranscriptionWorkerPort({
  client: assemblyAiClient,
  store,
  assetReader: privateUploadStore,
  orphanAudit: { record: (event) => store.recordProviderOrphanAudit(event) },
  retentionProfile: assemblyAiRetentionProfile,
  providerCallsPerStudentPerDay: integer(
    'AMC12_TRANSCRIPTION_PROVIDER_CALLS_PER_STUDENT_DAY', 200, 1, 100_000
  ),
  globalProviderCallsPerDay: integer(
    'AMC12_TRANSCRIPTION_GLOBAL_PROVIDER_CALLS_PER_DAY', 10_000, 1, 10_000_000
  ),
  globalCleanupCallsPerDay: integer(
    'AMC12_TRANSCRIPTION_GLOBAL_CLEANUP_CALLS_PER_DAY', 100_000, 1, 10_000_000
  )
});
const transcriptionWorker = new BatchTranscriptionWorker({
  store, port: transcriptionPort, workerId: transcriptionWorkerId, leaseMs,
  maxBusinessAttempts: integer('AMC12_TRANSCRIPTION_MAX_BUSINESS_ATTEMPTS', 20, 1, 1_000),
  maxBusinessAgeMs: integer(
    'AMC12_TRANSCRIPTION_MAX_BUSINESS_AGE_MS', 24 * 60 * 60 * 1_000,
    60_000, 30 * 24 * 60 * 60 * 1_000
  )
});
const orphanCleanupWorker = new ProviderOrphanCleanupWorker({
  store, client: assemblyAiClient, workerId: orphanCleanupWorkerId, leaseMs,
  globalCleanupCallsPerDay: integer(
    'AMC12_TRANSCRIPTION_GLOBAL_CLEANUP_CALLS_PER_DAY', 100_000, 1, 10_000_000
  )
});
const reconciler = new PrivateStorageReconciler({
  store,
  privateUploadStore,
  graceMs: integer('AMC12_STORAGE_ORPHAN_GRACE_MS', 60 * 60 * 1_000, 60_000, 7 * 24 * 60 * 60 * 1_000),
  writingTtlMs: integer('AMC12_WRITING_TTL_MS', 30 * 60 * 1_000, 60_000, 24 * 60 * 60 * 1_000),
  draftTtlMs: integer('AMC12_DRAFT_TTL_MS', 24 * 60 * 60 * 1_000, 60_000, 30 * 24 * 60 * 60 * 1_000),
  maxEntries: integer('AMC12_STORAGE_RECONCILE_MAX_ENTRIES', 10_000, 1, 100_000),
  cleanupLimit: integer('AMC12_STORAGE_RECONCILE_CLEANUP_LIMIT', 100, 1, 1_000)
});

let stopping = false;
let aiRunning = false;
let transcriptionRunning = false;
let orphanCleanupRunning = false;
let reconcileRunning = false;
const providerAbort = new AbortController();

async function tickAi() {
  if (stopping || aiRunning) return;
  aiRunning = true;
  try {
    await dispatcher.tick({ signal: providerAbort.signal });
  } catch (error) {
    console.error(JSON.stringify({ event: 'ai_dispatcher_error', code: error?.code || 'WORKER_FAILED' }));
  } finally {
    aiRunning = false;
  }
}

async function tickTranscription() {
  if (stopping || transcriptionRunning) return;
  transcriptionRunning = true;
  try {
    while (!stopping && (await transcriptionWorker.runOnce({ signal: providerAbort.signal })).processed) {}
  } catch (error) {
    if (!stopping) console.error(JSON.stringify({ event: 'transcription_worker_error', code: error?.code || 'WORKER_FAILED' }));
  } finally {
    transcriptionRunning = false;
  }
}

async function tickOrphanCleanup() {
  if (stopping || orphanCleanupRunning) return;
  orphanCleanupRunning = true;
  try {
    while (!stopping) {
      const result = await orphanCleanupWorker.runOnce({ signal: providerAbort.signal });
      if (!result.processed) break;
      if (result.status === 'RETRY_SCHEDULED') {
        console.warn(JSON.stringify({ event: 'provider_orphan_cleanup_retry_scheduled' }));
      }
    }
  } catch (error) {
    if (!stopping) console.error(JSON.stringify({
      event: 'provider_orphan_cleanup_worker_error', code: error?.code || 'WORKER_FAILED'
    }));
  } finally {
    orphanCleanupRunning = false;
  }
}

async function tickReconciler() {
  if (stopping || reconcileRunning) return;
  reconcileRunning = true;
  try {
    const summary = await reconciler.runOnce();
    if (summary.cleanupBacklogPossible || summary.unexpectedCount > 0) {
      console.warn(JSON.stringify({ event: 'private_storage_reconcile_attention', ...summary }));
    }
  } catch (error) {
    if (!stopping) console.error(JSON.stringify({ event: 'private_storage_reconciler_error', code: error?.code || 'WORKER_FAILED' }));
  } finally {
    reconcileRunning = false;
  }
}

const aiTimer = setInterval(() => { void tickAi(); }, pollMs);
const transcriptionTimer = setInterval(() => { void tickTranscription(); }, pollMs);
const orphanCleanupTimer = setInterval(() => { void tickOrphanCleanup(); },
  integer('AMC12_PROVIDER_ORPHAN_POLL_MS', 5_000, 100, 60_000));
const reconcileTimer = setInterval(() => { void tickReconciler(); },
  integer('AMC12_STORAGE_RECONCILE_INTERVAL_MS', 60_000, 10_000, 24 * 60 * 60 * 1_000));
void tickAi();
void tickTranscription();
void tickOrphanCleanup();
void tickReconciler();

async function shutdown() {
  if (stopping) return;
  stopping = true;
  clearInterval(aiTimer);
  clearInterval(transcriptionTimer);
  clearInterval(orphanCleanupTimer);
  clearInterval(reconcileTimer);
  providerAbort.abort();
  await dispatcher.drain();
  while (transcriptionRunning || orphanCleanupRunning || reconcileRunning) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
  await store.close();
}

process.once('SIGINT', () => { void shutdown(); });
process.once('SIGTERM', () => { void shutdown(); });
