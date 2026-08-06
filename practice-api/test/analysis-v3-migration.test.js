import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../migrations/019_analysis_contract_v3.sql', import.meta.url);

test('migration 019 adds v3 without relabelling queued or running v2 work', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /SET DEFAULT 'amc-analysis-contract-v3'/);
  assert.match(sql, /'amc-analysis-contract-v1', 'amc-analysis-contract-v2', 'amc-analysis-contract-v3'/);
  assert.match(sql, /learning_tutor_snapshots_analysis_contract_version_check/);
  assert.doesNotMatch(sql, /UPDATE\s+amc_practice\.learning_analysis_runs/i);
  assert.doesNotMatch(sql, /status\s*=\s*'RUNNING'/i);
});
