import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../migrations/019_analysis_contract_v3.sql', import.meta.url);
const postgresStoreUrl = new URL('../src/postgres-store.js', import.meta.url);
const importScriptUrl = new URL('../scripts/import-approved-context.js', import.meta.url);

test('migration 019 adds v3 without relabelling queued or running v2 work', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /SET DEFAULT 'amc-analysis-contract-v3'/);
  assert.match(sql, /'amc-analysis-contract-v1', 'amc-analysis-contract-v2', 'amc-analysis-contract-v3'/);
  assert.match(sql, /learning_tutor_snapshots_analysis_contract_version_check/);
  assert.doesNotMatch(sql, /UPDATE\s+amc_practice\.learning_analysis_runs/i);
  assert.doesNotMatch(sql, /status\s*=\s*'RUNNING'/i);
});

test('context repair only wakes the current version and import validates trust before migration', async () => {
  const [storeSource, importSource] = await Promise.all([
    readFile(postgresStoreUrl, 'utf8'), readFile(importScriptUrl, 'utf8')
  ]);
  const repairStart = storeSource.indexOf('async function repairBlockedLearningVersions');
  const repairEnd = storeSource.indexOf('\nasync function lockTranscriptionAggregate', repairStart);
  const repair = storeSource.slice(repairStart, repairEnd);
  assert.match(repair, /v\.version_number = s\.current_version/);

  const trustCheck = importSource.indexOf('if (!trustedAuthorityIds.size)');
  const migrationCall = importSource.indexOf('await runMigrations(store.pool)');
  assert.ok(trustCheck > 0);
  assert.ok(migrationCall > trustCheck,
    'an invalid authority configuration must fail before touching the migration ledger');
});
