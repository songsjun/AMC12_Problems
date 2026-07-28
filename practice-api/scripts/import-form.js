#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { runMigrations } from '../src/migrate.js';
import { ARCHIVE_MANIFEST_SCHEMA, ARCHIVE_RELEASE_FORM_IDS } from '../src/manifest.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';

const [file, ...flags] = process.argv.slice(2);
if (!file || flags.some((flag) => !['--publish', '--allow-test-only-import', '--allow-test-only-publish', '--allow-generic-manifest-import'].includes(flag))) {
  console.error('Usage: npm run import-form -- path/to/form.manifest.json [--publish] [--allow-test-only-import] [--allow-test-only-publish] [--allow-generic-manifest-import]');
  process.exitCode = 2;
} else {
  // Archive publication is intentionally a complete, atomic 48-form release.
  // Do this check before reading deployment configuration or connecting to the
  // database so this generic CLI can neither import archive-v1 directly nor
  // replace a reserved historical ID with a private-v1 lookalike.
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  if (manifest?.schemaVersion === ARCHIVE_MANIFEST_SCHEMA
    || (typeof manifest?.id === 'string' && ARCHIVE_RELEASE_FORM_IDS.includes(manifest.id))) {
    throw new Error('Historical AMC 12 archive forms must be imported only with import-archive-release.js --publish.');
  }
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
  const store = new PostgresStore({ connectionString: config.databaseUrl });
  try {
    await runMigrations(store.pool);
    const allowTestOnlyImport = !config.production && (config.allowTestOnlyImport || flags.includes('--allow-test-only-import'));
    const allowTestOnlyPublish = !config.production && allowTestOnlyImport
      && (config.allowTestOnlyPublish || flags.includes('--allow-test-only-publish'));
    const allowGenericManifestImport = !config.production
      && (config.allowGenericManifestImport || flags.includes('--allow-generic-manifest-import'));
    const service = new PracticeService({
      store,
      authPepper: config.authPepper,
      sessionTtlMs: config.sessionTtlMs,
      allowTestOnlyImport,
      allowTestOnlyPublish,
      allowGenericManifestImport
    });
    const form = await service.importManifest(manifest, { publish: flags.includes('--publish') });
    console.log(JSON.stringify({ id: form.id, version: form.version, published: form.published, testOnly: form.testOnly }, null, 2));
  } finally {
    await store.close();
  }
}
