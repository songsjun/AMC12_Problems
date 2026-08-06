import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../migrations/018_post_final_reanalysis.sql', import.meta.url);

test('migration 018 preserves historical anchors and makes learning snapshots append-only', async () => {
  const sql = await readFile(migrationUrl, 'utf8');

  assert.match(sql,
    /creation_reason = 'BATCH_REVIEW_ANCHOR'[\s\S]*?CONTEXT_READY[\s\S]*?CONTEXT_UNAVAILABLE/,
    'the 017-era unbound batch-review anchor remains a legal historical row');
  assert.match(sql,
    /reasoning_origin = 'POST_FINAL_UPDATE'[\s\S]*?version_reason NOT IN \('POST_FINAL_REASONING_COMMIT', 'MANUAL_REANALYSIS_COMMIT'\)/,
    'a pure rerun may retain the provenance of an earlier post-final reasoning change');
  assert.match(sql,
    /amc_learning_versions_immutable[\s\S]*?BEFORE UPDATE OR DELETE ON amc_practice\.learning_submission_versions/);
  assert.match(sql,
    /amc_learning_reports_append_only[\s\S]*?BEFORE UPDATE OR DELETE ON amc_practice\.learning_reports/);
  assert.match(sql,
    /amc_learning_question_analyses_append_only[\s\S]*?BEFORE UPDATE OR DELETE ON amc_practice\.learning_question_analyses/);
});
