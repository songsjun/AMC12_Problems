import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { startDeadlineWorker } from './deadline-worker.js';
import { runMigrations } from './migrate.js';
import { PostgresStore } from './postgres-store.js';
import { PracticeService } from './service.js';
import { PrivateUploadStore } from './infrastructure/private-upload-store.js';
import { dirname, resolve } from 'node:path';

const config = loadConfig();
if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');

const store = new PostgresStore({ connectionString: config.databaseUrl });
await runMigrations(store.pool);
const privateUploadStore = config.privateUploadRoot ? new PrivateUploadStore({
  root: config.privateUploadRoot,
  forbiddenRoots: [resolve(process.cwd()), dirname(resolve(process.cwd()))],
  minimumFreeBytes: config.privateMinimumFreeBytes
}) : null;
await privateUploadStore?.init();
const service = new PracticeService({
  store,
  privateUploadStore,
  batchStudentQuotaBytes: config.batchStudentQuotaBytes,
  batchGlobalQuotaBytes: config.batchGlobalQuotaBytes,
  batchActiveLimit: config.batchActiveLimit,
  batchIntakeEnabled: config.batchIntakeEnabled,
  batchReviewEnabled: config.batchReviewEnabled,
  batchRequestLimitPerMinute: config.studentRequestsPerMinute,
  batchUploadByteBudget: config.batchUploadBytesPerHour,
  batchProviderWorkBudget: config.batchProviderWorkPerDay,
  batchProviderAudioByteBudget: config.batchProviderAudioBytesPerDay,
  batchGlobalProviderWorkBudget: config.batchGlobalProviderWorkPerDay,
  batchGlobalProviderAudioByteBudget: config.batchGlobalProviderAudioBytesPerDay,
  authPepper: config.authPepper,
  sessionTtlMs: config.sessionTtlMs,
  allowTestOnlyImport: config.allowTestOnlyImport,
  allowTestOnlyPublish: config.allowTestOnlyPublish,
  allowGenericManifestImport: config.allowGenericManifestImport
});

if (config.developmentAccessCode) {
  await service.seedAccessCode({
    code: config.developmentAccessCode,
    displayName: config.developmentStudentName
  });
}

const app = await buildApp({ service, config, logger: config.nodeEnv === 'development' ? { level: 'info' } : true });
const worker = startDeadlineWorker({ service, intervalMs: config.deadlinePollMs, logger: app.log });

async function shutdown(signal) {
  worker.stop();
  await app.close();
  await store.close();
  process.exitCode = signal ? 0 : 1;
}

process.once('SIGINT', () => { void shutdown('SIGINT'); });
process.once('SIGTERM', () => { void shutdown('SIGTERM'); });

await app.listen({ host: config.host, port: config.port });
