import { hostname } from 'node:os';
import { AmcInferenceClient } from '../infrastructure/amc-inference-client.js';
import { runMigrations } from '../migrate.js';
import { PostgresStore } from '../postgres-store.js';
import { LearningReviewWorker } from './worker.js';

function integer(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be an integer.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new Error(`${name} is outside the supported range.`);
  return value;
}

const databaseUrl = process.env.AMC12_DATABASE_URL;
const token = process.env.AMC12_INFERENCE_TOKEN;
if (!databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
if (!token) throw new Error('AMC12_INFERENCE_TOKEN is required.');
const pollMs = integer('AMC12_LEARNING_WORKER_POLL_MS', 1_000, 100, 60_000);
const leaseMs = integer('AMC12_LEARNING_WORKER_LEASE_MS', 120_000, 10_000, 600_000);
const workerId = process.env.AMC12_LEARNING_WORKER_ID || `${hostname()}:${process.pid}:learning`;
const store = new PostgresStore({ connectionString: databaseUrl });
await runMigrations(store.pool);
const inferenceClient = new AmcInferenceClient({
  origin: process.env.AMC12_INFERENCE_ORIGIN || 'http://127.0.0.1:4110',
  token,
  timeoutMs: integer('AMC12_INFERENCE_TIMEOUT_MS', 65_000, 1_000, 180_000),
  maxResponseBytes: integer('AMC12_INFERENCE_MAX_RESPONSE_BYTES', 64 * 1024, 2_048, 1024 * 1024)
});
const worker = new LearningReviewWorker({
  store, inferenceClient, workerId, leaseMs,
  maxAttempts: integer('AMC12_LEARNING_MAX_ATTEMPTS', 3, 1, 10),
  retryBaseMs: integer('AMC12_LEARNING_RETRY_BASE_MS', 5_000, 100, 600_000),
  retryMaxMs: integer('AMC12_LEARNING_RETRY_MAX_MS', 60_000, 100, 3_600_000)
});
let stopping = false;
let running = false;

async function tick() {
  if (stopping || running) return;
  running = true;
  try {
    while (!stopping && (await worker.runOnce()).processed) {}
  } catch (error) {
    console.error(JSON.stringify({ event: 'learning_worker_error', code: error?.code || 'WORKER_FAILED' }));
  } finally {
    running = false;
  }
}

const timer = setInterval(() => { void tick(); }, pollMs);
void tick();

async function shutdown() {
  if (stopping) return;
  stopping = true;
  clearInterval(timer);
  while (running) await new Promise((resolve) => setTimeout(resolve, 25));
  await store.close();
}

process.once('SIGINT', () => { void shutdown(); });
process.once('SIGTERM', () => { void shutdown(); });
