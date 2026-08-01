#!/usr/bin/env node
import { loadConfig } from '../src/config.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { readProtectedJson } from '../src/learning-review/protected-json.js';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';

const [file, receiptsFile, ...flags] = process.argv.slice(2);
if (!file || !receiptsFile || flags.length) {
  console.error('Usage: npm run import-approved-context -- /protected/approved-context.json /protected/authority-receipts.json');
  process.exitCode = 2;
} else {
  const [payload, approvalReceipts] = await Promise.all([
    readProtectedJson(file),
    readProtectedJson(receiptsFile)
  ]);
  const config = loadConfig();
  if (!config.databaseUrl) throw new Error('AMC12_DATABASE_URL is required.');
  const store = new PostgresStore({ connectionString: config.databaseUrl });
  try {
    await runMigrations(store.pool);
    const trustedAuthorityIds = new Set((process.env.AMC12_APPROVAL_AUTHORITY_IDS || '')
      .split(',').map((value) => value.trim()).filter(Boolean));
    if (!trustedAuthorityIds.size) throw new Error('AMC12_APPROVAL_AUTHORITY_IDS must list at least one trusted authority.');
    const imported = await new ApprovedContextImporter({ store, trustedAuthorityIds }).import(payload, approvalReceipts);
    console.log(JSON.stringify({
      imported: imported.map((context) => ({
        id: context.id,
        formId: context.formId,
        formVersion: context.formVersion,
        artifactSetHash: context.artifactSetHash,
        readyQuestionCount: context.questions.length
      }))
    }, null, 2));
  } finally {
    await store.close();
  }
}
