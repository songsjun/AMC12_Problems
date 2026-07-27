#!/usr/bin/env node
import { loadConfig } from '../src/config.js';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';

const args = process.argv.slice(2);
const get = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const code = process.env.AMC12_NEW_ACCESS_CODE || get('--code');
const displayName = get('--name');
const studentId = get('--student-id');
if (!code || !displayName || args.some((item) => item.startsWith('--') && !['--code', '--name', '--student-id'].includes(item))) {
  console.error('Usage: AMC12_NEW_ACCESS_CODE=... npm run create-access-code -- --name "Student" [--student-id UUID]');
  console.error('Passing --code is supported for local use but exposes the secret in shell history.');
  process.exitCode = 2;
} else {
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
  const store = new PostgresStore({ connectionString: config.databaseUrl });
  try {
    await runMigrations(store.pool);
    const service = new PracticeService({ store, authPepper: config.authPepper, sessionTtlMs: config.sessionTtlMs });
    const student = await service.seedAccessCode({ code, displayName, studentId });
    console.log(JSON.stringify({ student, created: true }, null, 2));
  } finally {
    await store.close();
  }
}
