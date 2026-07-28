#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { runMigrations } from '../src/migrate.js';
import { validateArchiveReleaseBatch } from '../src/manifest.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';

const [file, ...flags] = process.argv.slice(2);
if (!file || flags.length !== 1 || flags[0] !== '--publish') {
  console.error('Usage: node scripts/import-archive-release.js path/to/archive-release.private.json --publish');
  process.exitCode = 2;
} else {
  const payload = JSON.parse(await readFile(file, 'utf8'));
  validateArchiveReleaseBatch(payload);
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
  const store = new PostgresStore({ connectionString: config.databaseUrl });
  try {
    await runMigrations(store.pool);
    const service = new PracticeService({
      store,
      authPepper: config.authPepper,
      sessionTtlMs: config.sessionTtlMs,
      // Archive manifests have their own strict production schema. Generic
      // manifests remain forbidden and no test-only flag is enabled here.
      allowGenericManifestImport: false
    });
    const imported = await service.importArchiveRelease(payload, { publish: true });
    console.log(JSON.stringify({
      imported: imported.length,
      published: imported.filter((form) => form.published).length,
      forms: imported.map((form) => ({ id: form.id, version: form.version, published: form.published }))
    }, null, 2));
  } finally {
    await store.close();
  }
}
