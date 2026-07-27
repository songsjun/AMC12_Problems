import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { startDeadlineWorker } from './deadline-worker.js';
import { runMigrations } from './migrate.js';
import { PostgresStore } from './postgres-store.js';
import { PracticeService } from './service.js';

const config = loadConfig();
if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');

const store = new PostgresStore({ connectionString: config.databaseUrl });
await runMigrations(store.pool);
const service = new PracticeService({
  store,
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
