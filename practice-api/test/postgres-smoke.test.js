import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import { segmentBatchGatewaySources } from '../src/batch-ingest/domain.js';
import { BatchExtractionWorker } from '../src/batch-ingest/worker.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { runMigrations } from '../src/migrate.js';
import { PostgresStore } from '../src/postgres-store.js';
import { PracticeService } from '../src/service.js';
import { ApprovedContextImporter } from '../src/learning-review/artifact.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { canonicalHash } from '../src/learning-review/canonical.js';
import {
  buildTutorTurnRequest,
  computeTutorContextHash,
  computeTutorContextReleaseHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  isValidTutorContext,
  tutorSha256
} from '../src/question-tutor/domain.js';
import { archiveReleaseFixture } from './archive-fixture.js';
import { fixtureManifest } from './helpers.js';
import {
  approvedContextArtifact, approvalReceiptsForArtifact, FakeInferenceClient, learningReviewForm,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

const execFileAsync = promisify(execFile);
const connectionString = process.env.AMC12_TEST_DATABASE_URL;
const contentRoot = fileURLToPath(new URL('../../practice-content/', import.meta.url));
const RETENTION_PROFILE = Object.freeze({
  name: 'CONFIGURED_TTL', policyDelayMs: 72 * 60 * 60 * 1_000,
  uploadRequestMaxDurationMs: 120_000, processingSlackMs: 72 * 60 * 60 * 1_000
});
const RETENTION_OFFSET_MS = RETENTION_PROFILE.policyDelayMs
  + RETENTION_PROFILE.uploadRequestMaxDurationMs + RETENTION_PROFILE.processingSlackMs;

async function generatedSyntheticPrivate() {
  const directory = await mkdtemp(`${tmpdir()}/amc-pg-content-`);
  try {
    const privatePath = `${directory}/private.json`;
    await execFileAsync('python3', [
      '-m', 'amc_content.cli', 'build',
      '--form', 'fixtures/synthetic-25/source-form.json',
      '--answer-key', 'fixtures/synthetic-25/approved-answer-key.json',
      '--source-root', '.',
      '--public-output', `${directory}/public.json`,
      '--private-output', privatePath,
      '--allow-test-only'
    ], { cwd: contentRoot });
    return { directory, manifest: JSON.parse(await readFile(privatePath, 'utf8')) };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

function batchGatewayOutputs(plan) {
  let itemPosition = 0;
  return plan.chunks.map((chunk) => ({
    schema: 'amc-batch-decomposition-v1',
    correlationId: plan.correlationId,
    inputHash: chunk.inputHash,
    planHash: chunk.planHash,
    chunkId: chunk.chunkId,
    items: segmentBatchGatewaySources(chunk.sources).map((segment) => ({
      itemKey: `pg-batch-item-${++itemPosition}`,
      candidateQuestionNumbers: [1],
      proposedQuestionNumber: 1,
      answer: 'A',
      reasoningSummary: 'The student subtracts the same quantity from both sides.',
      confidence: 0.97,
      ambiguity: 'NONE',
      spans: [{
        segmentId: segment.segmentId,
        assetId: segment.assetId,
        startByte: segment.startByte,
        endByte: segment.endByte,
        sha256: segment.sha256
      }],
      conflictFlags: [],
      requiresConfirmation: false
    })),
    unmappedSpans: []
  }));
}

function batchGatewayRunMetadata(plan) {
  return plan.chunks.map((chunk) => ({
    chunkId: chunk.chunkId,
    inputHash: chunk.inputHash,
    provider: 'openai',
    requestedModel: 'gpt-5.6-terra',
    responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1',
    schemaVersion: 'amc-batch-decomposition-v1',
    usage: {
      inputTokens: 800,
      cachedInputTokens: 100,
      outputTokens: 200,
      totalTokens: 1000,
      reasoningTokens: 50
    }
  }));
}

test('PostgreSQL migration rerun plus private/archive import and publication-concurrency smoke test', { skip: !connectionString }, async (t) => {
  const store = new PostgresStore({ connectionString, max: 12 });
  const secondStore = new PostgresStore({ connectionString, max: 4 });
  const built = await generatedSyntheticPrivate();
  const privateUploadStore = new PrivateUploadStore({
    root: `${built.directory}/private-uploads`,
    highWatermarkPercent: 100
  });
  await privateUploadStore.init();
  t.after(async () => {
    await rm(built.directory, { recursive: true, force: true });
    await secondStore.close();
    await store.close();
  });

  await Promise.all(Array.from({ length: 12 }, () => runMigrations(store.pool)));
  const first = await store.pool.query('SELECT filename, applied_at FROM amc_practice.schema_migrations ORDER BY filename');
  await runMigrations(store.pool);
  const second = await store.pool.query('SELECT filename, applied_at FROM amc_practice.schema_migrations ORDER BY filename');
  assert.deepEqual(second.rows, first.rows, 'rerunning must skip recorded migrations');
  assert.deepEqual(first.rows.map((row) => row.filename), [
    '001_initial.sql',
    '002_pipeline_audit_metadata.sql',
    '003_archive_practice_scoring.sql',
    '004_one_published_form_revision.sql',
    '005_learning_submission_core.sql',
    '006_approved_context_learning_reports.sql',
    '007_batch_ingest.sql',
    '008_open_review.sql',
    '009_learning_history_read_model.sql',
    '010_analysis_contract_v2.sql',
    '011_question_tutor_persistence.sql',
    '012_tutor_expired_lease_recovery.sql',
    '013_ai_dispatch_fairness.sql'
  ]);
  assert.deepEqual((await store.pool.query(
    `SELECT last_claimed_kind, revision
     FROM amc_practice.ai_dispatch_fairness_state WHERE singleton = true`
  )).rows, [{ last_claimed_kind: null, revision: '0' }]);

  const tutorTables = await store.pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'amc_practice' AND table_name = ANY($1::text[])
     ORDER BY table_name`, [[
      'learning_tutor_messages', 'learning_tutor_snapshots',
      'learning_tutor_threads', 'learning_tutor_turn_jobs'
    ]]
  );
  assert.deepEqual(tutorTables.rows.map((row) => row.table_name), [
    'learning_tutor_messages', 'learning_tutor_snapshots',
    'learning_tutor_threads', 'learning_tutor_turn_jobs'
  ]);
  const tutorConstraints = await store.pool.query(
    `SELECT conname, convalidated FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname = ANY($1::text[]) ORDER BY conname`, [[
      'amc_tutor_job_owner_unique', 'amc_tutor_job_request_message_fk',
      'amc_tutor_job_response_message_fk',
      'amc_tutor_job_thread_fk',
      'amc_tutor_message_source_job_fk', 'amc_tutor_snapshot_analysis_fk',
      'amc_tutor_snapshot_batch_result_item_fk', 'amc_tutor_snapshot_batch_result_version_fk',
      'amc_tutor_snapshot_context_artifact_fk', 'amc_tutor_snapshot_context_question_fk',
      'amc_tutor_snapshot_identity_unique',
      'amc_tutor_snapshot_official_answer_fk', 'amc_tutor_snapshot_official_submission_fk',
      'amc_tutor_snapshot_report_fk', 'amc_tutor_snapshot_submission_fk',
      'amc_tutor_snapshot_response_fk',
      'amc_tutor_snapshot_version_fk', 'amc_tutor_thread_fork_job_fk',
      'amc_tutor_thread_snapshot_fk'
    ]]
  );
  assert.equal(tutorConstraints.rowCount, 19);
  assert.equal(tutorConstraints.rows.every((row) => row.convalidated === true), true);
  const tutorTriggers = await store.pool.query(
    `SELECT tgname FROM pg_trigger
     WHERE tgrelid IN (
       'amc_practice.learning_tutor_snapshots'::regclass,
       'amc_practice.learning_tutor_threads'::regclass,
       'amc_practice.learning_tutor_messages'::regclass,
       'amc_practice.learning_tutor_turn_jobs'::regclass
     ) AND NOT tgisinternal ORDER BY tgname`
  );
  assert.deepEqual(tutorTriggers.rows.map((row) => row.tgname), [
    'amc_guard_tutor_job_transition', 'amc_guard_tutor_thread_mutation',
    'amc_reject_tutor_job_delete', 'amc_reject_tutor_thread_delete',
    'amc_tutor_messages_append_only', 'amc_tutor_snapshots_append_only',
    'amc_tutor_thread_head_from_job', 'amc_tutor_thread_head_from_message',
    'amc_tutor_thread_head_from_thread',
    'amc_validate_tutor_assistant_message', 'amc_validate_tutor_fork',
    'amc_validate_tutor_job', 'amc_validate_tutor_snapshot_insert'
  ]);

  const analysisV2Schema = await store.pool.query(
    `SELECT column_name, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice' AND table_name = 'learning_analysis_runs'
       AND column_name = 'analysis_contract_version'`
  );
  assert.equal(analysisV2Schema.rowCount, 1);
  assert.equal(analysisV2Schema.rows[0].is_nullable, 'NO');
  assert.match(analysisV2Schema.rows[0].column_default, /amc-analysis-contract-v2/);
  const analysisV2Constraints = await store.pool.query(
    `SELECT conname, convalidated FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname = ANY($1::text[]) ORDER BY conname`, [[
      'amc_form_question_scoring_v2_check',
      'amc_submission_answer_scoring_v2_check',
      'amc_batch_result_item_scoring_v2_check'
    ]]
  );
  assert.equal(analysisV2Constraints.rowCount, 3);
  assert.equal(analysisV2Constraints.rows.every((row) => row.convalidated === true), true);
  const analysisV2Triggers = await store.pool.query(
    `SELECT tgname FROM pg_trigger
     WHERE tgname = ANY($1::text[]) AND NOT tgisinternal ORDER BY tgname`, [[
      'amc_submission_answers_append_only',
      'amc_learning_batch_results_append_only',
      'amc_learning_batch_result_items_append_only'
    ]]
  );
  assert.deepEqual(analysisV2Triggers.rows.map((row) => row.tgname), [
    'amc_learning_batch_result_items_append_only',
    'amc_learning_batch_results_append_only',
    'amc_submission_answers_append_only'
  ]);

  const batchTables = await store.pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'amc_practice'
       AND table_name = ANY($1::text[])
     ORDER BY table_name`, [[
      'learning_batch_assets',
      'learning_batch_confirmation_responses',
      'learning_batch_confirmation_revisions',
      'learning_batch_evidence',
      'learning_batch_mapping_items',
      'learning_batch_mapping_revisions',
      'learning_batch_provider_artifacts',
      'learning_batch_provider_orphan_audit',
      'learning_batch_provider_orphan_cleanup_jobs',
      'learning_batch_quota_reservations',
      'learning_batch_result_items',
      'learning_batch_results',
      'learning_batch_work_items',
      'learning_batches',
      'global_resource_budget_windows',
      'private_storage_reconciliation_candidates',
      'private_storage_reconciliation_events',
      'student_resource_budget_windows',
      'student_provider_dispatch_state'
    ]]
  );
  assert.deepEqual(batchTables.rows.map((row) => row.table_name), [
    'global_resource_budget_windows',
    'learning_batch_assets',
    'learning_batch_confirmation_responses',
    'learning_batch_confirmation_revisions',
    'learning_batch_evidence',
    'learning_batch_mapping_items',
    'learning_batch_mapping_revisions',
    'learning_batch_provider_artifacts',
    'learning_batch_provider_orphan_audit',
    'learning_batch_provider_orphan_cleanup_jobs',
    'learning_batch_quota_reservations',
    'learning_batch_result_items',
    'learning_batch_results',
    'learning_batch_work_items',
    'learning_batches',
    'private_storage_reconciliation_candidates',
    'private_storage_reconciliation_events',
    'student_provider_dispatch_state',
    'student_resource_budget_windows'
  ]);
  const openReviewSchema = await store.pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'amc_practice'
       AND table_name = ANY($1::text[])
     ORDER BY table_name`, [[
      'open_review_releases', 'open_review_release_events'
    ]]
  );
  assert.deepEqual(openReviewSchema.rows.map((row) => row.table_name), [
    'open_review_release_events', 'open_review_releases'
  ]);
  const openReviewColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('attempts', 'attempt_mode'),
         ('learning_batches', 'source_type'),
         ('learning_submissions', 'attempt_mode'),
         ('learning_submissions', 'official_submission_id'),
         ('learning_submissions', 'open_review_release_id'),
         ('learning_submissions', 'deletion_generation'),
         ('learning_submissions', 'deleted_at')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(openReviewColumns.rows, [
    { table_name: 'attempts', column_name: 'attempt_mode', is_nullable: 'NO' },
    { table_name: 'learning_batches', column_name: 'source_type', is_nullable: 'NO' },
    { table_name: 'learning_submissions', column_name: 'attempt_mode', is_nullable: 'NO' },
    { table_name: 'learning_submissions', column_name: 'deleted_at', is_nullable: 'YES' },
    { table_name: 'learning_submissions', column_name: 'deletion_generation', is_nullable: 'NO' },
    { table_name: 'learning_submissions', column_name: 'official_submission_id', is_nullable: 'YES' },
    { table_name: 'learning_submissions', column_name: 'open_review_release_id', is_nullable: 'YES' }
  ]);
  const activeOpenBundleIndex = await store.pool.query(
    `SELECT indexdef FROM pg_indexes
     WHERE schemaname = 'amc_practice' AND indexname = 'amc_one_active_open_review_bundle_idx'`
  );
  assert.equal(activeOpenBundleIndex.rowCount, 1);
  assert.match(activeOpenBundleIndex.rows[0].indexdef, /question_bundle_hash/);
  assert.match(activeOpenBundleIndex.rows[0].indexdef, /WHERE \(status = 'ACTIVE'::text\)/);
  const learningHistoryPageIndex = await store.pool.query(
    `SELECT indexdef FROM pg_indexes
     WHERE schemaname = 'amc_practice'
       AND indexname = 'amc_learning_submissions_history_page_idx'`
  );
  assert.equal(learningHistoryPageIndex.rowCount, 1);
  assert.match(learningHistoryPageIndex.rows[0].indexdef,
    /\(student_id, updated_at DESC, id DESC\)/);
  const learningHistoryBatchActivityIndex = await store.pool.query(
    `SELECT indexdef FROM pg_indexes
     WHERE schemaname = 'amc_practice'
       AND indexname = 'amc_learning_batches_submission_activity_idx'`
  );
  assert.equal(learningHistoryBatchActivityIndex.rowCount, 1);
  assert.match(learningHistoryBatchActivityIndex.rows[0].indexdef,
    /\(learning_submission_id, updated_at DESC\)/);

  const orphanTranscriptId = randomUUID();
  const orphanCreatedAt = new Date('2026-08-01T10:00:00.000Z');
  const orphanNow = new Date('2026-08-01T10:00:01.000Z');
  const orphanEvent = {
    event: 'ORPHAN_TRANSCRIPT_DELETE_PENDING', provider: 'assemblyai',
    providerTranscriptId: orphanTranscriptId, deletionGeneration: 0,
    errorCode: 'ASSEMBLYAI_UNAVAILABLE', attemptedAt: orphanCreatedAt
  };
  await store.recordProviderOrphanAudit(orphanEvent);
  await store.recordProviderOrphanAudit(orphanEvent);
  const orphanJob = await store.claimNextProviderOrphanCleanup({
    workerId: 'postgres-provider-orphan-worker', now: orphanNow, leaseMs: 120_000
  });
  assert.equal(orphanJob.externalId, orphanTranscriptId);
  assert.equal(orphanJob.attemptCount, 1);
  assert.equal(await store.authorizeProviderOrphanCall({
    jobId: orphanJob.id, leaseToken: orphanJob.leaseToken,
    externalId: orphanTranscriptId, now: orphanNow
  }), true);
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: orphanJob.id, leaseToken: orphanJob.leaseToken,
    evidenceType: 'provider-already-absent',
    now: new Date('2026-08-01T10:00:02.000Z')
  }), true);
  const orphanAudit = await store.pool.query(
    `SELECT id, event, source_audit_id, external_id, evidence_code, evidenced_at
     FROM amc_practice.learning_batch_provider_orphan_audit
     WHERE external_id = $1 ORDER BY created_at, event`, [orphanTranscriptId]
  );
  assert.equal(orphanAudit.rowCount, 2, 'duplicate pending writes must share one durable cleanup job');
  const orphanPending = orphanAudit.rows.find((row) => row.event === 'ORPHAN_TRANSCRIPT_DELETE_PENDING');
  const orphanEvidence = orphanAudit.rows.find((row) => row.event === 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED');
  assert.equal(orphanPending.evidenced_at, null, 'append-only pending evidence remains unchanged');
  assert.equal(orphanEvidence.source_audit_id, orphanPending.id);
  assert.equal(orphanEvidence.evidence_code, 'provider-already-absent');

  const uploadOrphanHash = 'b'.repeat(64);
  const uploadDeadline = new Date('2026-08-03T10:00:00.000Z');
  await store.recordProviderOrphanAudit({
    event: 'PROVIDER_RETENTION_PENDING', provider: 'assemblyai',
    uploadUrlSha256: uploadOrphanHash, deletionGeneration: 0,
    errorCode: 'ASSEMBLYAI_UNAVAILABLE', providerRetentionNotBefore: uploadDeadline,
    detectedAt: orphanCreatedAt
  });
  assert.equal(await store.claimNextProviderOrphanCleanup({
    workerId: 'postgres-provider-orphan-worker',
    now: new Date(uploadDeadline.getTime() - 1), leaseMs: 120_000
  }), null);
  const uploadOrphanJob = await store.claimNextProviderOrphanCleanup({
    workerId: 'postgres-provider-orphan-worker', now: uploadDeadline, leaseMs: 120_000
  });
  assert.equal(uploadOrphanJob.cleanupKind, 'OBSERVE_RETENTION_WINDOW');
  assert.equal(await store.authorizeProviderOrphanCall({
    jobId: uploadOrphanJob.id, leaseToken: uploadOrphanJob.leaseToken,
    externalId: orphanTranscriptId, now: uploadDeadline
  }), false, 'retention-window observation must never authorize a provider DELETE');
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: uploadOrphanJob.id, leaseToken: uploadOrphanJob.leaseToken,
    evidenceType: 'provider-delete-response', now: uploadDeadline
  }), false, 'retention-window completion rejects a physical-delete claim');
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: uploadOrphanJob.id, leaseToken: uploadOrphanJob.leaseToken,
    evidenceType: 'provider-retention-window-elapsed', now: uploadDeadline
  }), true);
  const uploadEvidence = await store.pool.query(
    `SELECT event, evidence_code FROM amc_practice.learning_batch_provider_orphan_audit
     WHERE source_audit_id = $1`, [uploadOrphanJob.orphanAuditId]
  );
  assert.deepEqual(uploadEvidence.rows, [{
    event: 'PROVIDER_RETENTION_WINDOW_ELAPSED',
    evidence_code: 'provider-retention-window-elapsed'
  }]);
  const manualJob = await store.pool.query(
    `SELECT status FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs WHERE id = $1`,
    [uploadOrphanJob.id]
  );
  assert.equal(manualJob.rows[0].status, 'MANUAL_VERIFICATION_REQUIRED');
  assert.equal(await store.confirmProviderRetentionDeletion({
    jobId: uploadOrphanJob.id,
    verificationAuthority: 'assemblyai-support-ticket-operator',
    verificationReferenceHash: 'c'.repeat(64),
    now: new Date(uploadDeadline.getTime() + 1)
  }), true);
  const confirmedRetention = await store.pool.query(
    `SELECT event, evidence_code, verification_authority
     FROM amc_practice.learning_batch_provider_orphan_audit
     WHERE event = 'PROVIDER_RETENTION_DELETION_CONFIRMED'
       AND verification_reference_hash = $1`, ['c'.repeat(64)]
  );
  assert.deepEqual(confirmedRetention.rows, [{
    event: 'PROVIDER_RETENTION_DELETION_CONFIRMED',
    evidence_code: 'independent-provider-deletion-confirmation',
    verification_authority: 'assemblyai-support-ticket-operator'
  }]);

  const batchColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable, data_type
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('learning_batches', 'failure_code'),
         ('learning_batches', 'committed_version_id'),
         ('learning_batches', 'committed_version_number'),
         ('learning_batch_mapping_revisions', 'gateway_run_metadata'),
         ('learning_batch_mapping_items', 'unmapped'),
         ('learning_batch_mapping_items', 'purged_at'),
         ('learning_submission_versions', 'batch_id'),
         ('learning_submission_versions', 'answers_revision'),
         ('learning_submission_versions', 'reasoning_revision')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(batchColumns.rows, [
    {
      table_name: 'learning_batch_mapping_items', column_name: 'purged_at',
      is_nullable: 'YES', data_type: 'timestamp with time zone'
    },
    {
      table_name: 'learning_batch_mapping_items', column_name: 'unmapped',
      is_nullable: 'NO', data_type: 'boolean'
    },
    {
      table_name: 'learning_batch_mapping_revisions', column_name: 'gateway_run_metadata',
      is_nullable: 'NO', data_type: 'jsonb'
    },
    {
      table_name: 'learning_batches', column_name: 'committed_version_id',
      is_nullable: 'YES', data_type: 'uuid'
    },
    {
      table_name: 'learning_batches', column_name: 'committed_version_number',
      is_nullable: 'YES', data_type: 'integer'
    },
    {
      table_name: 'learning_batches', column_name: 'failure_code',
      is_nullable: 'YES', data_type: 'text'
    },
    {
      table_name: 'learning_submission_versions', column_name: 'answers_revision',
      is_nullable: 'YES', data_type: 'integer'
    },
    {
      table_name: 'learning_submission_versions', column_name: 'batch_id',
      is_nullable: 'YES', data_type: 'uuid'
    },
    {
      table_name: 'learning_submission_versions', column_name: 'reasoning_revision',
      is_nullable: 'YES', data_type: 'integer'
    }
  ]);

  const batchLineageConstraints = await store.pool.query(
    `SELECT conname, pg_get_constraintdef(oid) AS definition
     FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname = ANY($1::text[])
     ORDER BY conname`, [[
      'amc_learning_batch_base_version_fk',
      'amc_learning_batch_committed_version_fk',
      'amc_learning_batch_source_lineage_fk',
      'amc_learning_batch_result_version_fk',
      'amc_learning_version_batch_lineage_fk'
    ]]
  );
  assert.deepEqual(batchLineageConstraints.rows.map((row) => row.conname), [
    'amc_learning_batch_base_version_fk',
    'amc_learning_batch_committed_version_fk',
    'amc_learning_batch_result_version_fk',
    'amc_learning_batch_source_lineage_fk',
    'amc_learning_version_batch_lineage_fk'
  ]);
  assert.equal(batchLineageConstraints.rows.every((row) => row.definition.includes('FOREIGN KEY')), true);

  const learningColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('attempts', 'reasoning_revision'),
         ('learning_submissions', 'official_submission_kind'),
         ('learning_submission_versions', 'creation_reason'),
         ('learning_submission_versions', 'context_status'),
         ('learning_submission_versions', 'context_set_id'),
         ('learning_question_responses', 'answer_origin'),
         ('learning_question_responses', 'reasoning_origin'),
         ('learning_work_items', 'input_hash'),
         ('learning_work_items', 'deletion_generation'),
         ('learning_work_items', 'analysis_run_id'),
         ('learning_question_analyses', 'run_metadata'),
         ('learning_question_analyses', 'error_class'),
         ('learning_question_analyses', 'retryable')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(learningColumns.rows, [
    { table_name: 'attempts', column_name: 'reasoning_revision', is_nullable: 'NO' },
    { table_name: 'learning_question_analyses', column_name: 'error_class', is_nullable: 'YES' },
    { table_name: 'learning_question_analyses', column_name: 'retryable', is_nullable: 'NO' },
    { table_name: 'learning_question_analyses', column_name: 'run_metadata', is_nullable: 'YES' },
    { table_name: 'learning_question_responses', column_name: 'answer_origin', is_nullable: 'NO' },
    { table_name: 'learning_question_responses', column_name: 'reasoning_origin', is_nullable: 'NO' },
    { table_name: 'learning_submission_versions', column_name: 'context_set_id', is_nullable: 'YES' },
    { table_name: 'learning_submission_versions', column_name: 'context_status', is_nullable: 'NO' },
    { table_name: 'learning_submission_versions', column_name: 'creation_reason', is_nullable: 'NO' },
    { table_name: 'learning_submissions', column_name: 'official_submission_kind', is_nullable: 'YES' },
    { table_name: 'learning_work_items', column_name: 'analysis_run_id', is_nullable: 'YES' },
    { table_name: 'learning_work_items', column_name: 'deletion_generation', is_nullable: 'NO' },
    { table_name: 'learning_work_items', column_name: 'input_hash', is_nullable: 'NO' }
  ]);
  const learningConstraints = await store.pool.query(
    `SELECT conname, condeferrable, condeferred, pg_get_constraintdef(oid) AS definition
     FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname IN (
         'amc_attempts_id_student_form_unique',
         'amc_attempts_mode_lineage_unique',
         'amc_learning_submission_current_version_fk'
       )
     ORDER BY conname`
  );
  assert.deepEqual(learningConstraints.rows, [
    {
      conname: 'amc_attempts_id_student_form_unique',
      condeferrable: false,
      condeferred: false,
      definition: 'UNIQUE (id, student_id, form_id, form_version)'
    },
    {
      conname: 'amc_attempts_mode_lineage_unique',
      condeferrable: false,
      condeferred: false,
      definition: 'UNIQUE (id, student_id, form_id, form_version, attempt_mode)'
    },
    {
      conname: 'amc_learning_submission_current_version_fk',
      condeferrable: true,
      condeferred: true,
      definition: 'FOREIGN KEY (id, current_version) REFERENCES amc_practice.learning_submission_versions(learning_submission_id, version_number) DEFERRABLE INITIALLY DEFERRED'
    }
  ]);
  const analysisLineageConstraints = await store.pool.query(
    `SELECT conname, pg_get_constraintdef(oid) AS definition
     FROM pg_constraint
     WHERE connamespace = 'amc_practice'::regnamespace
       AND conname = ANY($1::text[])
     ORDER BY conname`, [[
      'amc_analysis_run_version_lineage_fk',
      'amc_approved_context_question_set_fk',
      'amc_learning_report_run_version_fk',
      'amc_learning_work_run_version_fk'
    ]]
  );
  assert.deepEqual(analysisLineageConstraints.rows.map((row) => row.conname), [
    'amc_analysis_run_version_lineage_fk',
    'amc_approved_context_question_set_fk',
    'amc_learning_report_run_version_fk',
    'amc_learning_work_run_version_fk'
  ]);
  assert.equal(analysisLineageConstraints.rows.every((row) => row.definition.includes('FOREIGN KEY')), true);

  const archiveColumns = await store.pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'amc_practice'
       AND (table_name, column_name) IN (
         ('form_questions', 'is_scored'),
         ('form_questions', 'accepted_options'),
         ('form_questions', 'correct_option'),
         ('submissions', 'unscored_count'),
         ('submission_answers', 'is_scored'),
         ('submission_answers', 'accepted_options'),
         ('submission_answers', 'correct_option')
       )
     ORDER BY table_name, column_name`
  );
  assert.deepEqual(archiveColumns.rows, [
    { table_name: 'form_questions', column_name: 'accepted_options', is_nullable: 'NO' },
    { table_name: 'form_questions', column_name: 'correct_option', is_nullable: 'YES' },
    { table_name: 'form_questions', column_name: 'is_scored', is_nullable: 'NO' },
    { table_name: 'submission_answers', column_name: 'accepted_options', is_nullable: 'NO' },
    { table_name: 'submission_answers', column_name: 'correct_option', is_nullable: 'YES' },
    { table_name: 'submission_answers', column_name: 'is_scored', is_nullable: 'NO' },
    { table_name: 'submissions', column_name: 'unscored_count', is_nullable: 'NO' }
  ]);
  const publishedIndex = await store.pool.query(
    `SELECT indexdef
     FROM pg_indexes
     WHERE schemaname = 'amc_practice' AND indexname = 'amc_one_published_form_revision_idx'`
  );
  assert.equal(publishedIndex.rowCount, 1);
  assert.match(publishedIndex.rows[0].indexdef, /CREATE UNIQUE INDEX/);
  assert.match(publishedIndex.rows[0].indexdef, /WHERE \(published = true\)/);

  const service = new PracticeService({
    store, privateUploadStore,
    authPepper: 'postgres-test-pepper-that-is-long-enough-for-safe-hmac-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true,
    batchIntakeEnabled: true
  });
  const secondService = new PracticeService({
    store: secondStore, privateUploadStore,
    authPepper: 'postgres-test-pepper-that-is-long-enough-for-safe-hmac-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true,
    batchIntakeEnabled: true
  });
  // The source fixture has a stable revision; importing it repeatedly is safe
  // because the canonical source manifest hash is immutable.
  const imported = await service.importManifest(built.manifest, { publish: true });
  assert.equal(imported.id, built.manifest.id);
  assert.equal(imported.version, built.manifest.version);
  const audit = await store.pool.query(
    `SELECT published, test_only, source_manifest_hash, content_hash, question_bundle_hash, provenance
     FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2`,
    [built.manifest.id, built.manifest.version]
  );
  assert.equal(audit.rows[0].published, true);
  assert.equal(audit.rows[0].test_only, true);
  assert.equal(audit.rows[0].source_manifest_hash, built.manifest.manifestHash);
  assert.equal(audit.rows[0].content_hash, built.manifest.contentHash);
  assert.equal(audit.rows[0].question_bundle_hash, built.manifest.questionBundleHash);
  assert.deepEqual(audit.rows[0].provenance, built.manifest.provenance);

  // Archive v1 only enters through the complete 48-form release workflow.
  // Keep this batch unpublished so the smoke test cannot change a current
  // historical catalog revision in a shared test database.
  const archiveRelease = archiveReleaseFixture({ version: `archive-pg-smoke-${randomUUID()}` });
  const importedArchive = await service.importArchiveRelease(archiveRelease, { publish: false });
  assert.equal(importedArchive.length, 48);
  assert.equal(importedArchive.every((form) => form.published === false && form.practiceKind === 'archive'), true);
  const archive = archiveRelease.forms.find((form) => form.id === 'amc12-2025-a');
  assert.ok(archive);
  const archiveAudit = await store.pool.query(
    `SELECT publication_status, source_schema_version, source_manifest_hash, content_hash, question_bundle_hash, provenance
     FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2`,
    [archive.id, archive.version]
  );
  assert.deepEqual(archiveAudit.rows[0], {
    publication_status: 'archive-practice',
    source_schema_version: 'amc-practice-archive-form-v1',
    source_manifest_hash: archive.manifestHash,
    content_hash: archive.contentHash,
    question_bundle_hash: archive.questionBundleHash,
    provenance: { ...archive.provenance, archiveNotice: archive.archiveNotice }
  });
  const archiveQuestions = await store.pool.query(
    `SELECT question_number, correct_option, accepted_options, is_scored
     FROM amc_practice.form_questions WHERE form_id = $1 AND form_version = $2 ORDER BY question_number`,
    [archive.id, archive.version]
  );
  assert.equal(archiveQuestions.rowCount, 25);
  assert.deepEqual(archiveQuestions.rows[11], {
    question_number: 12, correct_option: 'A', accepted_options: ['A'], is_scored: true
  });
  assert.deepEqual(archiveQuestions.rows[24], {
    question_number: 25, correct_option: null, accepted_options: [], is_scored: false
  });
  const alternativeArchive = archiveRelease.forms.find((form) => form.id === 'amc12-2012-b');
  assert.ok(alternativeArchive);
  const alternativeQuestion = await store.pool.query(
    `SELECT question_number, correct_option, accepted_options, is_scored
     FROM amc_practice.form_questions WHERE form_id = $1 AND form_version = $2 AND question_number = 12`,
    [alternativeArchive.id, alternativeArchive.version]
  );
  assert.deepEqual(alternativeQuestion.rows[0], {
    question_number: 12, correct_option: 'D', accepted_options: ['D', 'E'], is_scored: true
  });

  // Exercise the real catalog SQL, not just the in-memory adapter. A CTE does
  // not retain PostgreSQL's base-table functional-dependency shortcut, so the
  // question count must be computed without an under-specified GROUP BY.
  const catalog = await service.listForms();
  const listed = catalog.find((form) => form.id === built.manifest.id && form.version === built.manifest.version);
  assert.deepEqual(listed, {
    id: built.manifest.id,
    version: built.manifest.version,
    title: built.manifest.title,
    durationMs: 4_500_000,
    questionCount: 25,
    practiceKind: 'standard',
    archiveNotice: null,
    scoredQuestionCount: 25,
    batchIntakeAvailable: true
  });

  const student = await service.seedAccessCode({
    code: `pg-smoke-${randomUUID()}`,
    displayName: 'Postgres smoke student'
  });
  const budgetAt = new Date('2026-08-01T09:00:30.000Z');
  const studentBudgetRace = await Promise.all([
    store.consumeStudentResourceBudget({
      studentId: student.id, budgetKind: 'AUTHENTICATED_REQUEST', units: 1,
      limit: 1, windowMs: 60_000, now: budgetAt
    }),
    secondStore.consumeStudentResourceBudget({
      studentId: student.id, budgetKind: 'AUTHENTICATED_REQUEST', units: 1,
      limit: 1, windowMs: 60_000, now: budgetAt
    })
  ]);
  assert.equal(studentBudgetRace.filter((result) => result.allowed).length, 1,
    'independent PostgreSQL pools share one atomic per-student window');
  const globalBudgetRace = await Promise.all([
    store.consumeGlobalResourceBudget({
      budgetKind: 'PROVIDER_WORK', units: 1, limit: 1, windowMs: 60_000, now: budgetAt
    }),
    secondStore.consumeGlobalResourceBudget({
      budgetKind: 'PROVIDER_WORK', units: 1, limit: 1, windowMs: 60_000, now: budgetAt
    })
  ]);
  assert.equal(globalBudgetRace.filter((result) => result.allowed).length, 1,
    'independent PostgreSQL pools share one atomic global provider window');
  const attempt = await service.createAttempt(student.id, built.manifest.id);
  const reasoning = await service.putReasoning(student.id, attempt.attempt.id, 'postgres-reasoning-001', {
    revision: 0,
    notes: [
      { questionNumber: 1, reasoningText: 'PostgreSQL reasoning snapshot' },
      { questionNumber: 2, reasoningText: null }
    ]
  });
  assert.equal(reasoning.reasoningRevision, 1);
  const reasoningIdempotency = await store.pool.query(
    `SELECT response_body FROM amc_practice.idempotency_records
     WHERE student_id = $1 AND scope = $2 AND key = $3`,
    [student.id, `attempt:${attempt.attempt.id}:put-reasoning`, 'postgres-reasoning-001']
  );
  assert.equal(reasoningIdempotency.rowCount, 1);
  assert.equal(JSON.stringify(reasoningIdempotency.rows[0].response_body).includes('PostgreSQL reasoning snapshot'), false);
  assert.equal(reasoningIdempotency.rows[0].response_body.responseKind, 'CURRENT_REASONING_ENVELOPE');
  const currentAttempt = await service.getAttempt(student.id, attempt.attempt.id);
  const final = await service.final(student.id, attempt.attempt.id, 'postgres-final-0001', {
    expectedAnswersRevision: currentAttempt.answersRevision,
    expectedStateRevision: currentAttempt.stateRevision
  });
  assert.equal(final.attempt.phase, 'FINALIZED');
  assert.equal(final.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const results = await service.getResults(student.id, attempt.attempt.id);
  assert.equal(results.finalSubmission.answers.length, 25);
  const learningRows = await store.pool.query(
    `SELECT ls.official_submission_id, ls.official_submission_kind,
            lsv.creation_reason, lsv.context_status, lsv.evidence_hash,
            count(lqr.*)::integer AS response_count,
            count(lqr.*) FILTER (WHERE lqr.reasoning_origin = 'DURING_ATTEMPT')::integer AS reasoning_count,
            min(lwi.status) AS analysis_status,
            min(lwi.input_hash) AS input_hash
     FROM amc_practice.learning_submissions ls
     JOIN amc_practice.learning_submission_versions lsv
       ON lsv.learning_submission_id = ls.id AND lsv.version_number = ls.current_version
     JOIN amc_practice.learning_question_responses lqr
       ON lqr.learning_submission_version_id = lsv.id
     JOIN amc_practice.learning_work_items lwi
       ON lwi.learning_submission_version_id = lsv.id
     WHERE ls.attempt_id = $1
     GROUP BY ls.official_submission_id, ls.official_submission_kind,
              lsv.creation_reason, lsv.context_status, lsv.evidence_hash`,
    [attempt.attempt.id]
  );
  assert.deepEqual(learningRows.rows[0], {
    official_submission_id: final.submission.id,
    official_submission_kind: 'FINAL',
    creation_reason: 'FINAL_COMMIT',
    context_status: 'CONTEXT_UNAVAILABLE',
    evidence_hash: final.learningSubmission.evidenceHash,
    response_count: 25,
    reasoning_count: 1,
    analysis_status: 'BLOCKED_CONTEXT',
    input_hash: final.learningSubmission.evidenceHash
  });

  // The deferred parent->current-version FK is checked at COMMIT, not merely
  // by application convention.
  const currentVersionClient = await store.pool.connect();
  try {
    await currentVersionClient.query('BEGIN');
    await currentVersionClient.query(
      'UPDATE amc_practice.learning_submissions SET current_version = 2 WHERE attempt_id = $1',
      [attempt.attempt.id]
    );
    await assert.rejects(
      () => currentVersionClient.query('COMMIT'),
      (error) => error.code === '23503'
        && error.constraint === 'amc_learning_submission_current_version_fk'
    );
  } finally {
    await currentVersionClient.query('ROLLBACK').catch(() => {});
    currentVersionClient.release();
  }

  // Force a failure after both the official and learning rows have been
  // written. PostgresStore must roll back the complete unit of work.
  const rollbackStudent = await service.seedAccessCode({
    code: `pg-rollback-${randomUUID()}`,
    displayName: 'Postgres rollback student'
  });
  const rollbackAttempt = await service.createAttempt(rollbackStudent.id, built.manifest.id);
  const originalWithAttemptLock = store.withAttemptLock.bind(store);
  store.withAttemptLock = (attemptId, work) => originalWithAttemptLock(attemptId, async (tx) => {
    if (tx) {
      const originalCreate = tx.createLearningSubmission.bind(tx);
      tx.createLearningSubmission = async (aggregate) => {
        await originalCreate(aggregate);
        throw new Error('postgres-injected-after-learning-write');
      };
    }
    return work(tx);
  });
  await assert.rejects(
    () => service.final(rollbackStudent.id, rollbackAttempt.attempt.id, 'postgres-rollback-final', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    }),
    /postgres-injected-after-learning-write/
  );
  store.withAttemptLock = originalWithAttemptLock;
  const rolledBack = await store.pool.query(
    `SELECT a.phase,
            (SELECT count(*)::integer FROM amc_practice.submissions s WHERE s.attempt_id = a.id) AS official_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = a.id) AS learning_count
     FROM amc_practice.attempts a WHERE a.id = $1`,
    [rollbackAttempt.attempt.id]
  );
  assert.deepEqual(rolledBack.rows[0], { phase: 'TIMED', official_count: 0, learning_count: 0 });

  // Preliminary score paths must never create a learning aggregate.
  const checkpointStudent = await service.seedAccessCode({
    code: `pg-checkpoint-${randomUUID()}`,
    displayName: 'Postgres checkpoint student'
  });
  const checkpointAttempt = await service.createAttempt(checkpointStudent.id, built.manifest.id);
  await service.checkpoint(checkpointStudent.id, checkpointAttempt.attempt.id, 'postgres-checkpoint-1', {
    expectedAnswersRevision: 0,
    expectedStateRevision: 0
  });
  const checkpointParity = await store.pool.query(
    `SELECT count(*) FILTER (WHERE s.kind = 'CHECKPOINT')::integer AS preliminary_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count
     FROM amc_practice.submissions s WHERE s.attempt_id = $1`,
    [checkpointAttempt.attempt.id]
  );
  assert.deepEqual(checkpointParity.rows[0], { preliminary_count: 1, learning_count: 0 });

  const deadlineStudent = await service.seedAccessCode({
    code: `pg-deadline-${randomUUID()}`,
    displayName: 'Postgres deadline student'
  });
  const deadlineAttempt = await service.createAttempt(deadlineStudent.id, built.manifest.id);
  await store.pool.query(
    `UPDATE amc_practice.attempts SET clock_started_at = now() - interval '76 minutes'
     WHERE id = $1`,
    [deadlineAttempt.attempt.id]
  );
  assert.equal((await service.processDueAttempt(deadlineAttempt.attempt.id)).processed, true);
  const deadlineParity = await store.pool.query(
    `SELECT count(*) FILTER (WHERE s.kind = 'DEADLINE')::integer AS preliminary_count,
            (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count
     FROM amc_practice.submissions s WHERE s.attempt_id = $1`,
    [deadlineAttempt.attempt.id]
  );
  assert.deepEqual(deadlineParity.rows[0], { preliminary_count: 1, learning_count: 0 });

  // Simulate a pre-feature historical FINAL by allowing the official final
  // transaction to commit while replacing only the new aggregate writer.
  const historicStudent = await service.seedAccessCode({
    code: `pg-historic-${randomUUID()}`,
    displayName: 'Postgres historical student'
  });
  const historicAttempt = await service.createAttempt(historicStudent.id, built.manifest.id);
  const historicWithAttemptLock = store.withAttemptLock.bind(store);
  store.withAttemptLock = (attemptId, work) => historicWithAttemptLock(attemptId, async (tx) => {
    if (tx) {
      tx.createLearningSubmission = async (aggregate) => ({
        submission: aggregate.submission,
        version: aggregate.version,
        responses: aggregate.responses,
        workItems: [aggregate.workItem]
      });
    }
    return work(tx);
  });
  const historicFinal = await service.final(historicStudent.id, historicAttempt.attempt.id, 'historic-final-pg', {
    expectedAnswersRevision: 0,
    expectedStateRevision: 0
  });
  store.withAttemptLock = historicWithAttemptLock;
  assert.equal((await store.pool.query(
    'SELECT count(*)::integer AS count FROM amc_practice.learning_submissions WHERE attempt_id = $1',
    [historicAttempt.attempt.id]
  )).rows[0].count, 0);
  const historicOfficialBefore = await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1',
    [historicFinal.submission.id]
  );
  const historicAnswersBefore = await store.pool.query(
    'SELECT * FROM amc_practice.submission_answers WHERE submission_id = $1 ORDER BY question_number',
    [historicFinal.submission.id]
  );
  const repaired = await service.reconcileFinalLearningSubmission(historicAttempt.attempt.id);
  const repairedAgain = await secondService.reconcileFinalLearningSubmission(historicAttempt.attempt.id);
  assert.equal(repaired.created, true);
  assert.equal(repairedAgain.created, false);
  assert.deepEqual(repairedAgain.learningSubmission, repaired.learningSubmission);
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [historicFinal.submission.id]
  )).rows, historicOfficialBefore.rows);
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submission_answers WHERE submission_id = $1 ORDER BY question_number',
    [historicFinal.submission.id]
  )).rows, historicAnswersBefore.rows);

  // Independent store pools model separate API processes contending on the
  // same attempt row. Different idempotency keys cannot create two finals.
  const raceStudent = await service.seedAccessCode({
    code: `pg-final-race-${randomUUID()}`,
    displayName: 'Postgres final race student'
  });
  const raceAttempt = await service.createAttempt(raceStudent.id, built.manifest.id);
  const racedFinals = await Promise.allSettled([
    service.final(raceStudent.id, raceAttempt.attempt.id, 'pg-final-race-left', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    }),
    secondService.final(raceStudent.id, raceAttempt.attempt.id, 'pg-final-race-right', {
      expectedAnswersRevision: 0,
      expectedStateRevision: 0
    })
  ]);
  assert.equal(racedFinals.filter((result) => result.status === 'fulfilled').length, 1);
  const rejectedRace = racedFinals.find((result) => result.status === 'rejected');
  assert.equal(rejectedRace?.reason?.code, 'INVALID_STATE');
  const raceCounts = await store.pool.query(
    `SELECT
       (SELECT count(*)::integer FROM amc_practice.submissions s WHERE s.attempt_id = $1 AND s.kind = 'FINAL') AS final_count,
       (SELECT count(*)::integer FROM amc_practice.learning_submissions ls WHERE ls.attempt_id = $1) AS learning_count,
       (SELECT count(*)::integer FROM amc_practice.learning_submission_versions lsv
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS version_count,
       (SELECT count(*)::integer FROM amc_practice.learning_question_responses lqr
          JOIN amc_practice.learning_submission_versions lsv ON lsv.id = lqr.learning_submission_version_id
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS response_count,
       (SELECT count(*)::integer FROM amc_practice.learning_work_items lwi
          JOIN amc_practice.learning_submission_versions lsv ON lsv.id = lwi.learning_submission_version_id
          JOIN amc_practice.learning_submissions ls ON ls.id = lsv.learning_submission_id WHERE ls.attempt_id = $1) AS work_count`,
    [raceAttempt.attempt.id]
  );
  assert.deepEqual(raceCounts.rows[0], {
    final_count: 1,
    learning_count: 1,
    version_count: 1,
    response_count: 25,
    work_count: 1
  });

  // Two application processes publishing different versions of the same form
  // must serialize, not leave two rows published. The partial unique index is
  // the final database backstop; ordered advisory locks make both requests
  // complete without a deadlock/retry cycle.
  const publicationService = new PracticeService({
    store,
    authPepper: 'postgres-test-pepper-that-is-long-enough-for-safe-hmac-tests',
    sessionTtlMs: 60 * 60 * 1000,
    allowGenericManifestImport: true
  });
  const concurrentFormId = `pg-publication-race-${randomUUID()}`;
  const versionOne = { ...fixtureManifest, id: concurrentFormId, version: 'race-v1', title: 'Race version one' };
  const versionTwo = { ...fixtureManifest, id: concurrentFormId, version: 'race-v2', title: 'Race version two' };
  await Promise.all([
    publicationService.importManifest(versionOne, { publish: true }),
    publicationService.importManifest(versionTwo, { publish: true })
  ]);
  const concurrentPublished = await store.pool.query(
    `SELECT version FROM amc_practice.form_revisions WHERE form_id = $1 AND published = true`,
    [concurrentFormId]
  );
  assert.equal(concurrentPublished.rowCount, 1);
  assert.ok(['race-v1', 'race-v2'].includes(concurrentPublished.rows[0].version));

  // Both revisions exist, so the simple form FK would accept either one. The
  // four-column attempt FK must reject attaching a learning submission to the
  // revision that this attempt did not actually start with.
  const pinnedStudent = await service.seedAccessCode({
    code: `pg-pinned-negative-${randomUUID()}`,
    displayName: 'Postgres pinned-form negative student'
  });
  const pinnedAttempt = await service.createAttempt(pinnedStudent.id, concurrentFormId);
  const wrongPinnedVersion = pinnedAttempt.attempt.formVersion === 'race-v1' ? 'race-v2' : 'race-v1';
  const wrongFormClient = await store.pool.connect();
  try {
    await wrongFormClient.query('BEGIN');
    const fakeFinalId = randomUUID();
    await wrongFormClient.query(
      `INSERT INTO amc_practice.submissions
       (id, attempt_id, kind, slot, trigger, active_elapsed_ms, scoring_policy,
        total_points, maximum_points, answered_count, correct_count, incorrect_count,
        blank_count, unscored_count, created_at)
       VALUES ($1, $2, 'FINAL', 'FINAL', 'NEGATIVE_FK_TEST', 0, $3::jsonb,
               4.5, 18, 0, 0, 0, 3, 0, now())`,
      [fakeFinalId, pinnedAttempt.attempt.id, JSON.stringify({
        id: 'amc-legacy', version: '1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0
      })]
    );
    await assert.rejects(
      () => wrongFormClient.query(
        `INSERT INTO amc_practice.learning_submissions
         (id, student_id, attempt_id, official_submission_id, official_submission_kind,
          form_id, form_version, source_type, lifecycle_status, current_version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'FINAL', $5, $6,
                 'INTERACTIVE_FINAL', 'COMMITTED', 1, now(), now())`,
        [randomUUID(), pinnedStudent.id, pinnedAttempt.attempt.id, fakeFinalId, concurrentFormId, wrongPinnedVersion]
      ),
      (error) => error.code === '23503'
        && error.constraint === 'amc_learning_submission_attempt_form_fk'
    );
  } finally {
    await wrongFormClient.query('ROLLBACK').catch(() => {});
    wrongFormClient.release();
  }

  // Overlapping batches intentionally list the same form IDs in opposite
  // orders. importForms must acquire its advisory publication locks in sorted
  // order, otherwise these two transactions deadlock (A→B versus B→A).
  const batchFormA = `pg-publication-batch-a-${randomUUID()}`;
  const batchFormB = `pg-publication-batch-b-${randomUUID()}`;
  const batchA1 = { ...fixtureManifest, id: batchFormA, version: 'batch-v1', title: 'Batch A v1' };
  const batchB1 = { ...fixtureManifest, id: batchFormB, version: 'batch-v1', title: 'Batch B v1' };
  const batchA2 = { ...fixtureManifest, id: batchFormA, version: 'batch-v2', title: 'Batch A v2' };
  const batchB2 = { ...fixtureManifest, id: batchFormB, version: 'batch-v2', title: 'Batch B v2' };
  await Promise.all([
    publicationService.importManifests([batchA1, batchB1], { publish: true }),
    publicationService.importManifests([batchB2, batchA2], { publish: true })
  ]);
  const batchPublished = await store.pool.query(
    `SELECT form_id, count(*) FILTER (WHERE published)::integer AS published_count
     FROM amc_practice.form_revisions
     WHERE form_id = ANY($1::text[])
     GROUP BY form_id
     ORDER BY form_id`,
    [[batchFormA, batchFormB]]
  );
  assert.deepEqual(batchPublished.rows, [
    { form_id: batchFormA, published_count: 1 },
    { form_id: batchFormB, published_count: 1 }
  ].sort((left, right) => left.form_id.localeCompare(right.form_id)));

  // The approved-context repair and durable worker path is exercised against
  // real PostgreSQL. Two pools race for one row; SKIP LOCKED permits exactly
  // one claim, an expired lease is reclaimed, and the old owner cannot write.
  const reviewForm = learningReviewForm();
  await store.importForm(reviewForm, { publish: true, allowTestOnlyPublish: true });
  const reviewStudent = await service.seedAccessCode({
    code: `pg-learning-review-${randomUUID()}`,
    displayName: 'Postgres learning review student'
  });
  const reviewAttempt = await service.createAttempt(reviewStudent.id, reviewForm.id);
  await service.putReasoning(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-reasoning-1', {
    revision: 0,
    notes: [{ questionNumber: 1, reasoningText: 'Subtract the same quantity from both sides.' }]
  });
  const reviewCurrent = await service.getAttempt(reviewStudent.id, reviewAttempt.attempt.id);
  const reviewFinal = await service.final(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-final-1', {
    expectedAnswersRevision: reviewCurrent.answersRevision,
    expectedStateRevision: reviewCurrent.stateRevision
  });
  assert.equal(reviewFinal.learningSubmission.analysisStatus, 'BLOCKED_CONTEXT');
  const officialBeforeAnalysis = await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [reviewFinal.submission.id]
  );
  const officialAnswersBeforeAnalysis = await store.pool.query(
    `SELECT * FROM amc_practice.submission_answers
     WHERE submission_id = $1 ORDER BY question_number`, [reviewFinal.submission.id]
  );
  await store.pool.query(
    `UPDATE amc_practice.form_questions
     SET correct_option = 'D', accepted_options = '["D", "E"]'::jsonb
     WHERE form_id = $1 AND form_version = $2 AND question_number = 1`,
    [reviewForm.id, reviewForm.version]
  );

  const approvedArtifact = approvedContextArtifact(reviewForm, { readyNumbers: [1] });
  const importedContext = await new ApprovedContextImporter({
    store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(approvedArtifact, approvalReceiptsForArtifact(approvedArtifact));
  assert.equal(importedContext.length, 1);
  assert.equal(importedContext[0].questions.length, 1);
  assert.equal(importedContext[0].approvalAuthorityId, 'approval-authority:fixture');
  assert.equal(importedContext[0].questions[0].solutions[0].authorityReceipt.status, 'active');
  assert.equal((await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id)).status, 'QUEUED');

  const persistedReady = await store.pool.query(
    `SELECT max(available_at) AS available_at
     FROM amc_practice.learning_work_items
     WHERE learning_submission_version_id IN (
       SELECT id FROM amc_practice.learning_submission_versions
       WHERE learning_submission_id = $1
     ) AND status = 'QUEUED'`,
    [reviewFinal.learningSubmission.id]
  );
  assert.ok(persistedReady.rows[0].available_at);
  const claimedAt = new Date(new Date(persistedReady.rows[0].available_at).getTime() + 1);
  const claims = await Promise.all([
    store.claimLearningAnalysisWork({ workerId: 'pg-worker-shared', now: claimedAt, leaseMs: 1_000 }),
    secondStore.claimLearningAnalysisWork({ workerId: 'pg-worker-shared', now: claimedAt, leaseMs: 1_000 })
  ]);
  assert.equal(claims.filter(Boolean).length, 1);
  const staleClaim = claims.find(Boolean);
  assert.ok(staleClaim);

  const fakeInference = new FakeInferenceClient();
  const reclaimAt = new Date(claimedAt.getTime() + 2_000);
  const reclaimed = await secondStore.claimLearningAnalysisWork({
    workerId: 'pg-worker-shared', now: reclaimAt, leaseMs: 120_000
  });
  assert.ok(reclaimed);
  assert.equal(reclaimed.run.analysisContractVersion, 'amc-analysis-contract-v2');
  assert.deepEqual(reclaimed.questions[0].scoring, {
    isScored: true, canonicalAnswer: 'A', acceptedOptions: ['A'],
    studentAnswerIsCorrect: null, selectedOption: null
  });
  assert.notEqual(reclaimed.workItem.leaseToken, staleClaim.workItem.leaseToken);
  assert.equal(await store.heartbeatLearningAnalysisWork({
    workItemId: staleClaim.workItem.id, workerId: 'pg-worker-shared',
    leaseToken: staleClaim.workItem.leaseToken, now: reclaimAt, leaseMs: 120_000
  }), false);
  assert.equal(await store.completeLearningAnalysisWork({
    workItemId: staleClaim.workItem.id,
    analysisRunId: staleClaim.run.id,
    workerId: 'pg-worker-shared',
    expectedLeaseToken: staleClaim.workItem.leaseToken,
    expectedInputHash: staleClaim.workItem.inputHash,
    expectedDeletionGeneration: staleClaim.workItem.deletionGeneration,
    expectedVersionNumber: staleClaim.version.versionNumber,
    expectedStudentId: staleClaim.submission.studentId,
    expectedContextSetId: staleClaim.version.contextSetId,
    outcomes: [], report: {}, now: reclaimAt
  }), false);
  assert.equal(await store.retryLearningAnalysisWork({
    workItemId: staleClaim.workItem.id, analysisRunId: staleClaim.run.id,
    workerId: 'pg-worker-shared', expectedLeaseToken: staleClaim.workItem.leaseToken,
    expectedInputHash: staleClaim.workItem.inputHash,
    expectedDeletionGeneration: staleClaim.workItem.deletionGeneration,
    expectedVersionNumber: staleClaim.version.versionNumber,
    expectedStudentId: staleClaim.submission.studentId,
    expectedContextSetId: staleClaim.version.contextSetId,
    availableAt: reclaimAt, now: reclaimAt, lastErrorCode: 'STALE_TOKEN_TEST'
  }), false);
  assert.equal(await secondStore.heartbeatLearningAnalysisWork({
    workItemId: reclaimed.workItem.id, workerId: 'pg-worker-shared',
    leaseToken: reclaimed.workItem.leaseToken, now: reclaimAt, leaseMs: 120_000
  }), true);
  assert.equal(await secondStore.retryLearningAnalysisWork({
    workItemId: reclaimed.workItem.id, analysisRunId: reclaimed.run.id,
    workerId: 'pg-worker-shared', expectedLeaseToken: reclaimed.workItem.leaseToken,
    expectedInputHash: reclaimed.workItem.inputHash,
    expectedDeletionGeneration: reclaimed.workItem.deletionGeneration,
    expectedVersionNumber: reclaimed.version.versionNumber,
    expectedStudentId: reclaimed.submission.studentId,
    expectedContextSetId: reclaimed.version.contextSetId,
    availableAt: reclaimAt, now: reclaimAt, lastErrorCode: 'NEW_TOKEN_TEST'
  }), true);
  const worker = new LearningReviewWorker({
    store: secondStore,
    inferenceClient: fakeInference,
    workerId: 'pg-worker-shared',
    leaseMs: 1_000,
    clock: () => reclaimAt
  });
  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'PARTIAL', providerCalls: 1 });
  assert.equal(fakeInference.calls.length, 1);
  assert.deepEqual(fakeInference.calls[0].question.scoring, {
    is_scored: true, canonical_answer: 'A', accepted_options: ['A']
  });
  assert.equal(fakeInference.calls[0].question.student_answer_status, 'BLANK');
  await store.pool.query(
    `UPDATE amc_practice.form_questions
     SET correct_option = 'A', accepted_options = '["A"]'::jsonb
     WHERE form_id = $1 AND form_version = $2 AND question_number = 1`,
    [reviewForm.id, reviewForm.version]
  );
  const learningReport = await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id);
  assert.equal(learningReport.status, 'PARTIAL');
  assert.equal(learningReport.summary.totalQuestions, 25);
  assert.equal(learningReport.summary.analyzedCount, 1);
  assert.equal(learningReport.questions.length, 25);
  assert.equal(JSON.stringify(learningReport).includes('gpt-5.6-terra'), false);
  assert.equal(JSON.stringify(learningReport).includes('reviewer:fixture'), false);
  const internalAnalysis = await store.pool.query(
    `SELECT status, provider_invoked, run_metadata, error_class, retryable
     FROM amc_practice.learning_question_analyses
     WHERE analysis_run_id = $1 ORDER BY question_number`, [staleClaim.run.id]
  );
  assert.equal(internalAnalysis.rowCount, 25);
  assert.deepEqual(internalAnalysis.rows[0], {
    status: 'SUCCEEDED',
    provider_invoked: true,
    run_metadata: {
      provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
      promptVersion: 'amc-question-analysis-prompt-v2', schemaVersion: 'amc-question-analysis-v2',
      usage: { inputTokens: 800, cachedInputTokens: 120, outputTokens: 200, totalTokens: 1000, reasoningTokens: 50 }
    },
    error_class: null,
    retryable: false
  });

  // Exercise Tutor lineage, the deferred success/message cycle, and the
  // delivery state machine against real PostgreSQL before any adapter can
  // accidentally rely on weaker application-only assumptions.
  const tutorLineage = (await store.pool.query(
    `SELECT report.id AS report_id, report.report_hash,
            analysis.question_input_hash, analysis.question_context_hash,
            response.selected_option, response.reasoning_text, response.answer_origin,
            submission.official_submission_id, submission.deletion_generation,
            context.artifact_set_hash, context.approval_authority_id,
            context.approval_receipt_set_hash, context.release_manifest_hash,
            context.release_content_hash, context.release_question_bundle_hash,
            question.question_content_hash
     FROM amc_practice.learning_reports report
     JOIN amc_practice.learning_analysis_runs run ON run.id = report.analysis_run_id
     JOIN amc_practice.learning_submission_versions version
       ON version.id = report.learning_submission_version_id
     JOIN amc_practice.learning_submissions submission
       ON submission.id = version.learning_submission_id
     JOIN amc_practice.learning_question_analyses analysis
       ON analysis.analysis_run_id = run.id AND analysis.question_number = 1
     JOIN amc_practice.learning_question_responses response
       ON response.learning_submission_version_id = version.id AND response.question_number = 1
     JOIN amc_practice.approved_context_sets context ON context.id = version.context_set_id
     JOIN amc_practice.approved_context_questions question
       ON question.context_set_id = context.id AND question.question_number = 1
     WHERE run.id = $1`, [staleClaim.run.id]
  )).rows[0];
  assert.ok(tutorLineage);
  const tutorQuestionSource = reclaimed.questions.find((question) => question.questionNumber === 1);
  const tutorApprovedQuestion = tutorQuestionSource.context;
  const tutorChoiceMap = Array.isArray(tutorApprovedQuestion.choices)
    ? Object.fromEntries(tutorApprovedQuestion.choices.map((choice) => [choice.option, choice.textMarkdown]))
    : tutorApprovedQuestion.choices;
  const tutorContextReleaseHash = computeTutorContextReleaseHash({
    sourceType: 'INTERACTIVE_FINAL', formId: reclaimed.version.formId,
    formVersion: reclaimed.version.formVersion,
    manifestHash: tutorLineage.release_manifest_hash,
    contentHash: tutorLineage.release_content_hash,
    questionBundleHash: tutorLineage.release_question_bundle_hash,
    contextSetId: reclaimed.version.contextSetId,
    contextArtifactSha256: tutorLineage.artifact_set_hash,
    approvalAuthorityId: tutorLineage.approval_authority_id,
    approvalReceiptSetHash: tutorLineage.approval_receipt_set_hash,
    openReviewReleaseHash: null
  });
  const tutorContext = {
    learningSubmissionId: reclaimed.submission.id,
    learningSubmissionVersionId: reclaimed.version.id,
    versionNumber: reclaimed.version.versionNumber,
    formId: reclaimed.version.formId,
    formVersion: reclaimed.version.formVersion,
    contextSetId: reclaimed.version.contextSetId,
    contextArtifactSha256: tutorLineage.artifact_set_hash,
    contextReleaseHash: tutorContextReleaseHash,
    evidenceHash: reclaimed.version.evidenceHash,
    question: {
      questionNumber: 1,
      questionId: `${reclaimed.version.formId}:q:1`,
      promptMarkdown: tutorApprovedQuestion.promptMarkdown,
      choices: ['A', 'B', 'C', 'D', 'E'].map((label) => ({
        label, textMarkdown: tutorChoiceMap[label]
      })),
      isScored: tutorQuestionSource.scoring.isScored,
      officialAnswer: tutorQuestionSource.scoring.canonicalAnswer,
      acceptedOptions: tutorQuestionSource.scoring.acceptedOptions,
      studentAnswer: tutorQuestionSource.selectedOption,
      studentReasoning: tutorQuestionSource.reasoningText || null,
      solutions: tutorApprovedQuestion.solutions
        .filter((solution) => solution.modelEligibility.eligible
          && solution.authorityReceipt.status === 'active')
        .map((solution) => ({
          solutionId: solution.artifactSolutionId,
          approvalStatus: 'APPROVED', modelEligible: true, title: solution.title,
          markdown: solution.bodyMarkdown, bodySha256: solution.bodySha256,
          sourceSha256: solution.sourceRef.sha256, reviewerId: solution.reviewerId,
          reviewedAt: solution.reviewedAt, rightsStatus: solution.rightsStatus,
          authorityReceiptId: solution.authorityReceipt.receiptId,
          authorityReceiptStatus: solution.authorityReceipt.status,
          methodTags: solution.methodTags, qualityFlags: solution.qualityFlags
        }))
    }
  };
  assert.equal(isValidTutorContext(tutorContext), true);
  const tutorSnapshotId = randomUUID();
  const tutorThreadId = randomUUID();
  const tutorJobId = randomUUID();
  const tutorMessageId = randomUUID();
  const tutorReplyMessageId = randomUUID();
  const tutorSnapshotHash = computeTutorSnapshotHash(tutorContext);
  const tutorQuestionResponseHash = canonicalHash({
    questionNumber: 1, selectedOption: tutorQuestionSource.selectedOption,
    reasoningText: tutorQuestionSource.reasoningText,
    answerOrigin: tutorQuestionSource.answerOrigin
  });
  const tutorScoringHash = canonicalHash(tutorQuestionSource.scoring);
  const tutorThreadLineageHash = computeTutorThreadLineageHash({
    analysisRunId: staleClaim.run.id,
    analysisContractVersion: reclaimed.run.analysisContractVersion,
    reportId: tutorLineage.report_id, reportHash: tutorLineage.report_hash,
    snapshotHash: tutorSnapshotHash,
    questionResponseHash: tutorQuestionResponseHash,
    scoringSnapshotHash: tutorScoringHash,
    scoringOrigin: tutorLineage.answer_origin,
    initialDeletionGeneration: tutorLineage.deletion_generation
  });
  // Keep synthetic application timestamps behind the database clock so queue
  // readiness is proved by clock_timestamp(), never by a caller-supplied future value.
  const tutorCreatedAt = new Date(Date.now() - 30_000);
  await store.pool.query(
    `INSERT INTO amc_practice.learning_tutor_snapshots
     (id, student_id, learning_submission_id, learning_submission_version_id,
      version_number, form_id, form_version, source_type, question_number,
      context_set_id, question_content_hash, analysis_run_id, analysis_contract_version,
      analysis_question_input_hash, analysis_question_context_hash, report_id, report_hash,
      evidence_hash, question_response_hash, scoring_snapshot_hash, scoring_origin,
      official_submission_id, batch_result_id, initial_deletion_generation,
      context_artifact_sha256, context_release_hash, payload_schema, snapshot_payload,
      snapshot_hash, thread_lineage_hash, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'INTERACTIVE_FINAL',1,$8,$9,$10,$11,$12,$13,
             $14,$15,$16,$17,$18,$19,$20,NULL,$21,$22,$23,'amc-tutor-snapshot-v2',
             $24::jsonb,$25,$26,$27)`,
    [tutorSnapshotId, reviewStudent.id, reclaimed.submission.id, reclaimed.version.id,
      reclaimed.version.versionNumber, reclaimed.version.formId, reclaimed.version.formVersion,
      reclaimed.version.contextSetId, tutorLineage.question_content_hash, staleClaim.run.id,
      reclaimed.run.analysisContractVersion, tutorLineage.question_input_hash,
      tutorLineage.question_context_hash, tutorLineage.report_id, tutorLineage.report_hash,
      reclaimed.version.evidenceHash, tutorQuestionResponseHash, tutorScoringHash,
      tutorLineage.answer_origin, tutorLineage.official_submission_id,
      tutorLineage.deletion_generation, tutorLineage.artifact_set_hash,
      tutorContextReleaseHash, JSON.stringify(tutorContext), tutorSnapshotHash,
      tutorThreadLineageHash, tutorCreatedAt]
  );
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.learning_tutor_snapshots
       (id, student_id, learning_submission_id, learning_submission_version_id,
        version_number, form_id, form_version, source_type, question_number,
        context_set_id, question_content_hash, analysis_run_id, analysis_contract_version,
        analysis_question_input_hash, analysis_question_context_hash, report_id, report_hash,
        evidence_hash, question_response_hash, scoring_snapshot_hash, scoring_origin,
        official_submission_id, batch_result_id, initial_deletion_generation,
        context_artifact_sha256, context_release_hash, payload_schema, snapshot_payload,
        snapshot_hash, thread_lineage_hash, created_at)
       SELECT $2, student_id, learning_submission_id, learning_submission_version_id,
              version_number, form_id, form_version, source_type, question_number,
              context_set_id, question_content_hash, analysis_run_id, analysis_contract_version,
              analysis_question_input_hash, analysis_question_context_hash, report_id, report_hash,
              evidence_hash, question_response_hash, scoring_snapshot_hash, scoring_origin,
              official_submission_id, batch_result_id, initial_deletion_generation,
              context_artifact_sha256, context_release_hash, payload_schema,
              jsonb_set(snapshot_payload, '{question,studentReasoning}', '"forged"'::jsonb),
              $3, $4, created_at + interval '1 second'
       FROM amc_practice.learning_tutor_snapshots WHERE id = $1`,
      [tutorSnapshotId, randomUUID(), tutorSha256('forged-snapshot'),
        tutorSha256('forged-lineage')]
    ),
    (error) => error.code === '23514'
  );
  const tutorMessage = 'Can you compare my subtraction step with both approved methods?';
  const tutorTurn = buildTutorTurnRequest({
    correlationId: 'pg-tutor-correlation-001', threadId: tutorThreadId,
    turnId: tutorJobId, turnNumber: 1, context: tutorContext, priorTurns: [],
    message: tutorMessage
  });
  const tutorThreadCreation = await store.pool.connect();
  const concurrentSourceDeletion = await store.pool.connect();
  try {
    await tutorThreadCreation.query('BEGIN');
    await tutorThreadCreation.query(
      `INSERT INTO amc_practice.learning_tutor_threads
       (id, student_id, snapshot_id, learning_submission_id, learning_submission_version_id,
        question_number, snapshot_hash, thread_lineage_hash, tutor_contract_version,
        context_hash, status, initial_deletion_generation, deletion_generation,
        creation_idempotency_key_hash, creation_request_hash, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,1,$6,$7,'amc-tutor-contract-v2',$8,'OPEN',$9,$9,$10,$11,$12,$12)`,
      [tutorThreadId, reviewStudent.id, tutorSnapshotId, reclaimed.submission.id,
        reclaimed.version.id, tutorSnapshotHash, tutorThreadLineageHash,
        tutorTurn.contextHash, tutorLineage.deletion_generation,
        tutorSha256('pg-tutor-thread-idempotency'), tutorSha256('pg-tutor-thread-request'),
        tutorCreatedAt]
    );
    await concurrentSourceDeletion.query('BEGIN');
    await concurrentSourceDeletion.query("SET LOCAL lock_timeout = '100ms'");
    await assert.rejects(
      () => concurrentSourceDeletion.query(
        `UPDATE amc_practice.learning_submissions
         SET lifecycle_status = 'DELETED', deletion_generation = deletion_generation + 1,
             deleted_at = $2, updated_at = $2 WHERE id = $1`,
        [reclaimed.submission.id, new Date(tutorCreatedAt.getTime() + 1_000)]
      ),
      (error) => error.code === '55P03'
    );
    await concurrentSourceDeletion.query('ROLLBACK');
    await tutorThreadCreation.query('COMMIT');
    await assert.rejects(
      () => store.pool.query(
        `UPDATE amc_practice.learning_submissions
         SET lifecycle_status = 'DELETED', deletion_generation = deletion_generation + 1,
             deleted_at = $2, updated_at = $2 WHERE id = $1`,
        [reclaimed.submission.id, new Date(tutorCreatedAt.getTime() + 1_000)]
      ),
      (error) => error.code === '55000'
    );
  } catch (error) {
    await tutorThreadCreation.query('ROLLBACK').catch(() => {});
    await concurrentSourceDeletion.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    tutorThreadCreation.release();
    concurrentSourceDeletion.release();
  }
  const orphanTutorMessage = await store.pool.connect();
  try {
    await orphanTutorMessage.query('BEGIN');
    const orphanUserMessage = 'This user message has no durable turn job.';
    await orphanTutorMessage.query(
      `INSERT INTO amc_practice.learning_tutor_messages
       (id, thread_id, student_id, role, content_markdown, content_sha256, created_at)
       VALUES ($1,$2,$3,'USER',$4,$5,$6)`,
      [randomUUID(), tutorThreadId, reviewStudent.id, orphanUserMessage,
        tutorSha256(orphanUserMessage), tutorCreatedAt]
    );
    await assert.rejects(
      () => orphanTutorMessage.query('COMMIT'),
      (error) => error.code === '23514'
    );
    await orphanTutorMessage.query('ROLLBACK');
  } finally {
    orphanTutorMessage.release();
  }
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET successful_turn_count = 1, successful_history_bytes = 1,
           thread_revision = 1, updated_at = updated_at + interval '1 second'
       WHERE id = $1`, [tutorThreadId]
    ),
    (error) => error.code === '55000'
  );
  const tutorQueuedAt = new Date(tutorCreatedAt.getTime() + 1_000);
  const tutorSessionId = `pg-tutor-session-${randomUUID()}`;
  await store.pool.query(
    `INSERT INTO amc_practice.sessions
     (id, student_id, csrf_token_hash, created_at, expires_at, revoked_at)
     VALUES ($1,$2,$3,$4,$5,NULL)`,
    [tutorSessionId, reviewStudent.id, tutorSha256('csrf'), tutorCreatedAt,
      new Date(tutorCreatedAt.getTime() + 3_600_000)]
  );
  const tutorEnqueue = await store.pool.connect();
  try {
    await tutorEnqueue.query('BEGIN');
    await tutorEnqueue.query(
      `INSERT INTO amc_practice.learning_tutor_messages
       (id, thread_id, student_id, role, content_markdown, content_sha256, created_at)
       VALUES ($1,$2,$3,'USER',$4,$5,$6)`,
      [tutorMessageId, tutorThreadId, reviewStudent.id, tutorMessage,
        tutorSha256(tutorMessage), tutorCreatedAt]
    );
    await tutorEnqueue.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET request_count = 1, thread_revision = 1, updated_at = $2 WHERE id = $1`,
      [tutorThreadId, tutorQueuedAt]
    );
    await tutorEnqueue.query(
      `INSERT INTO amc_practice.learning_tutor_turn_jobs
       (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
        authorized_session_id, idempotency_key_hash, request_hash, correlation_id,
        snapshot_hash, context_hash, history_hash, input_hash, thread_lineage_hash,
        tutor_contract_version, status, priority, attempt_count, max_attempts,
        available_at, provider_invoked, delivery_disposition, retryable,
        deletion_generation, created_at, updated_at)
       VALUES ($1,$2,$3,$4,1,1,$5,$6,$7,$8,$9,$10,$11,$12,$13,
               'amc-tutor-contract-v2','QUEUED',100,0,3,$14,false,'NOT_DISPATCHED',false,$15,$14,$14)`,
      [tutorJobId, tutorThreadId, reviewStudent.id, tutorMessageId, tutorSessionId,
        tutorSha256('pg-tutor-turn-idempotency'), tutorSha256(JSON.stringify(tutorTurn)),
        tutorTurn.correlationId, tutorTurn.snapshotHash, tutorTurn.contextHash,
        tutorTurn.historyHash, tutorTurn.inputHash, tutorThreadLineageHash,
        tutorQueuedAt, tutorLineage.deletion_generation]
    );
    await tutorEnqueue.query('COMMIT');
  } catch (error) {
    await tutorEnqueue.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    tutorEnqueue.release();
  }
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.learning_tutor_turn_jobs
       (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
        authorized_session_id, idempotency_key_hash, request_hash, correlation_id,
        snapshot_hash, context_hash, history_hash, input_hash, thread_lineage_hash,
        tutor_contract_version, status, priority, attempt_count, max_attempts,
        available_at, provider_invoked, delivery_disposition, retryable,
        deletion_generation, created_at, updated_at)
       VALUES ($1,$2,$3,$4,1,1,$5,$6,$7,'pg-tutor-illegal-terminal',$8,$9,$10,$11,$12,
               'amc-tutor-contract-v2','SUCCEEDED',100,0,3,$13,false,
               'NOT_DISPATCHED',false,$14,$13,$13)`,
      [randomUUID(), tutorThreadId, reviewStudent.id, tutorMessageId, tutorSessionId,
        tutorSha256('illegal-terminal-idempotency'), tutorSha256('illegal-terminal-request'),
        tutorSnapshotHash, tutorTurn.contextHash, tutorTurn.historyHash,
        tutorSha256('illegal-terminal-input'), tutorThreadLineageHash,
        tutorQueuedAt, tutorLineage.deletion_generation]
    ),
    (error) => error.code === '23514'
  );
  const tutorLeaseToken = randomUUID();
  const tutorClaimedAt = new Date(tutorQueuedAt.getTime() + 1_000);
  const revokedTutor = await store.pool.connect();
  try {
    await revokedTutor.query('BEGIN');
    await revokedTutor.query(
      'UPDATE amc_practice.sessions SET revoked_at = $2 WHERE id = $1',
      [tutorSessionId, tutorClaimedAt]
    );
    await assert.rejects(
      () => revokedTutor.query(
        `UPDATE amc_practice.learning_tutor_turn_jobs
         SET status = 'RUNNING', attempt_count = 1, lease_owner = 'revoked-worker',
             lease_token = $2, lease_expires_at = $3, started_at = $4, updated_at = $4
         WHERE id = $1`,
        [tutorJobId, randomUUID(), new Date(tutorClaimedAt.getTime() + 60_000), tutorClaimedAt]
      ),
      (error) => error.code === '55000'
    );
    await revokedTutor.query('ROLLBACK');
  } finally {
    revokedTutor.release();
  }
  const firstClaim = await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET status = 'RUNNING', attempt_count = 1, lease_owner = 'pg-tutor-worker',
         lease_token = $2, lease_expires_at = $3, started_at = $4, updated_at = $4
     WHERE id = $1 AND status = 'QUEUED'
     RETURNING id`,
    [tutorJobId, tutorLeaseToken, new Date(tutorClaimedAt.getTime() + 60_000), tutorClaimedAt]
  );
  assert.equal(firstClaim.rowCount, 1);
  const tutorDispatchedAt = new Date(tutorClaimedAt.getTime() + 1_000);
  const staleDispatch = await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET provider_invoked = true, delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED',
         provider = 'openai', requested_model = 'gpt-5.6-terra',
         prompt_version = 'amc-question-tutor-prompt-v2',
         response_schema_version = 'amc-tutor-turn-v2', updated_at = $2
     WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()`,
    [tutorJobId, tutorDispatchedAt, randomUUID()]
  );
  assert.equal(staleDispatch.rowCount, 0);
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs
       SET status = 'DELIVERY_UNKNOWN', provider_invoked = true,
           delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED', provider = 'openai',
           requested_model = 'gpt-5.6-terra',
           prompt_version = 'amc-question-tutor-prompt-v2',
           response_schema_version = 'amc-tutor-turn-v2',
           outcome_code = 'DELIVERY_UNKNOWN', lease_owner = NULL, lease_token = NULL,
           lease_expires_at = NULL, completed_at = $2, updated_at = $2
       WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()`,
      [tutorJobId, tutorDispatchedAt, tutorLeaseToken]
    ),
    (error) => error.code === '55000'
  );
  await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET provider_invoked = true, delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED',
         provider = 'openai', requested_model = 'gpt-5.6-terra',
         prompt_version = 'amc-question-tutor-prompt-v2',
         response_schema_version = 'amc-tutor-turn-v2', updated_at = $2
     WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()`,
    [tutorJobId, tutorDispatchedAt, tutorLeaseToken]
  );
  const tutorReply = 'Your invariant is sound: subtracting the same quantity preserves equality.';
  const tutorReplyHash = tutorSha256(tutorReply);
  const tutorHistoryBytes = Buffer.byteLength(tutorMessage) + Buffer.byteLength(tutorReply);
  const tutorCompletedAt = new Date(tutorDispatchedAt.getTime() + 1_000);
  const tutorCompletion = await store.pool.connect();
  try {
    await tutorCompletion.query('BEGIN');
    await tutorCompletion.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs
       SET status = 'SUCCEEDED', delivery_disposition = 'DELIVERED_RESULT',
           response_message_id = $2, reply_sha256 = $3,
           response_model = 'gpt-5.6-terra-2026-07-15',
           usage = '{"inputTokens":800,"outputTokens":120,"totalTokens":920}'::jsonb,
           latency_ms = 250, lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
           completed_at = $4, updated_at = $4
       WHERE id = $1 AND lease_token = $5 AND lease_expires_at > clock_timestamp()`,
      [tutorJobId, tutorReplyMessageId, tutorReplyHash, tutorCompletedAt, tutorLeaseToken]
    );
    await tutorCompletion.query(
      `INSERT INTO amc_practice.learning_tutor_messages
       (id, thread_id, student_id, role, content_markdown, content_sha256,
        source_turn_job_id, created_at)
       VALUES ($1,$2,$3,'ASSISTANT',$4,$5,$6,$7)`,
      [tutorReplyMessageId, tutorThreadId, reviewStudent.id, tutorReply,
        tutorReplyHash, tutorJobId, tutorCompletedAt]
    );
    await tutorCompletion.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET successful_turn_count = 1, successful_history_bytes = $2,
           thread_revision = 2, updated_at = $3 WHERE id = $1`,
      [tutorThreadId, tutorHistoryBytes, new Date(tutorCompletedAt.getTime() + 1_000)]
    );
    await tutorCompletion.query('COMMIT');
  } catch (error) {
    await tutorCompletion.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    tutorCompletion.release();
  }
  assert.deepEqual((await store.pool.query(
    `SELECT job.status, job.delivery_disposition, count(message.id)::integer AS assistant_count
     FROM amc_practice.learning_tutor_turn_jobs job
     JOIN amc_practice.learning_tutor_messages message
       ON message.source_turn_job_id = job.id
     WHERE job.id = $1 GROUP BY job.status, job.delivery_disposition`, [tutorJobId]
  )).rows, [{ status: 'SUCCEEDED', delivery_disposition: 'DELIVERED_RESULT', assistant_count: 1 }]);
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_snapshots SET report_hash = $2 WHERE id = $1`,
      [tutorSnapshotId, tutorSha256('tampered-report')]
    ),
    (error) => error.code === '55000'
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs SET updated_at = updated_at + interval '1 second'
       WHERE id = $1`, [tutorJobId]
    ),
    (error) => error.code === '55000'
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET deletion_generation = deletion_generation + 1,
           thread_revision = thread_revision + 1, updated_at = updated_at + interval '1 second'
       WHERE id = $1`, [tutorThreadId]
    ),
    (error) => error.code === '55000'
  );

  const rootReplay = await store.pool.connect();
  try {
    const rootReplayAt = new Date(tutorCompletedAt.getTime() + 1_500);
    await rootReplay.query('BEGIN');
    await rootReplay.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET request_count = 2, thread_revision = 3, updated_at = $2 WHERE id = $1`,
      [tutorThreadId, rootReplayAt]
    );
    await assert.rejects(
      () => rootReplay.query(
        `INSERT INTO amc_practice.learning_tutor_turn_jobs
         (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
          authorized_session_id, idempotency_key_hash, request_hash, correlation_id,
          snapshot_hash, context_hash, history_hash, input_hash, thread_lineage_hash,
          tutor_contract_version, status, priority, attempt_count, max_attempts,
          available_at, provider_invoked, delivery_disposition, retryable,
          deletion_generation, created_at, updated_at)
         VALUES ($1,$2,$3,$4,2,2,$5,$6,$7,'pg-tutor-root-replay',$8,$9,$10,$11,$12,
                 'amc-tutor-contract-v2','QUEUED',100,0,3,$13,false,
                 'NOT_DISPATCHED',false,$14,$13,$13)`,
        [randomUUID(), tutorThreadId, reviewStudent.id, tutorMessageId, tutorSessionId,
          tutorSha256('root-replay-idempotency'), tutorSha256('root-replay-request'),
          tutorSnapshotHash, tutorTurn.contextHash, tutorSha256('root-replay-history'),
          tutorSha256('root-replay-input'), tutorThreadLineageHash,
          rootReplayAt, tutorLineage.deletion_generation]
      ),
      (error) => error.code === '23505'
        && error.constraint === 'amc_tutor_one_root_job_per_request_idx'
    );
    await rootReplay.query('ROLLBACK');
  } finally {
    rootReplay.release();
  }

  const secondTutorMessageId = randomUUID();
  const secondTutorMessage = 'Could you make that invariant more explicit?';
  const secondTutorQueuedAt = new Date(tutorCompletedAt.getTime() + 2_000);
  const secondTutorJobId = randomUUID();
  const secondTutorTurn = buildTutorTurnRequest({
    correlationId: 'pg-tutor-correlation-002', threadId: tutorThreadId,
    turnId: secondTutorJobId, turnNumber: 2, context: tutorContext,
    priorTurns: [{ turnNumber: 1, userMessage: tutorMessage, assistantReply: tutorReply }],
    message: secondTutorMessage
  });
  const secondTutorEnqueue = await store.pool.connect();
  try {
    await secondTutorEnqueue.query('BEGIN');
    await secondTutorEnqueue.query(
      `INSERT INTO amc_practice.learning_tutor_messages
       (id, thread_id, student_id, role, content_markdown, content_sha256, created_at)
       VALUES ($1,$2,$3,'USER',$4,$5,$6)`,
      [secondTutorMessageId, tutorThreadId, reviewStudent.id, secondTutorMessage,
        tutorSha256(secondTutorMessage), secondTutorQueuedAt]
    );
    await secondTutorEnqueue.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET request_count = 2, thread_revision = 3, updated_at = $2 WHERE id = $1`,
      [tutorThreadId, secondTutorQueuedAt]
    );
    await secondTutorEnqueue.query(
      `INSERT INTO amc_practice.learning_tutor_turn_jobs
       (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
        authorized_session_id, idempotency_key_hash, request_hash, correlation_id,
        snapshot_hash, context_hash, history_hash, input_hash, thread_lineage_hash,
        tutor_contract_version, status, priority, attempt_count, max_attempts,
        available_at, provider_invoked, delivery_disposition, retryable,
        deletion_generation, created_at, updated_at)
       VALUES ($1,$2,$3,$4,2,2,$5,$6,$7,$8,$9,$10,$11,$12,$13,
               'amc-tutor-contract-v2','QUEUED',100,0,3,$14,false,'NOT_DISPATCHED',false,$15,$14,$14)`,
      [secondTutorJobId, tutorThreadId, reviewStudent.id, secondTutorMessageId, tutorSessionId,
        tutorSha256('pg-tutor-turn-idempotency-2'), tutorSha256(JSON.stringify(secondTutorTurn)),
        secondTutorTurn.correlationId, secondTutorTurn.snapshotHash, secondTutorTurn.contextHash,
        secondTutorTurn.historyHash, secondTutorTurn.inputHash, tutorThreadLineageHash,
        secondTutorQueuedAt, tutorLineage.deletion_generation]
    );
    await secondTutorEnqueue.query('COMMIT');
  } catch (error) {
    await secondTutorEnqueue.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    secondTutorEnqueue.release();
  }
  const secondLeaseToken = randomUUID();
  const secondClaimedAt = new Date(secondTutorQueuedAt.getTime() + 1_000);
  const secondClaim = await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET status = 'RUNNING', attempt_count = 1, lease_owner = 'pg-tutor-worker',
         lease_token = $2, lease_expires_at = $3, started_at = $4, updated_at = $4
     WHERE id = $1 AND status = 'QUEUED'
     RETURNING id`,
    [secondTutorJobId, secondLeaseToken,
      new Date(secondClaimedAt.getTime() + 60_000), secondClaimedAt]
  );
  assert.equal(secondClaim.rowCount, 1);
  const secondDispatchedAt = new Date(secondClaimedAt.getTime() + 1_000);
  await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET provider_invoked = true, delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED',
         provider = 'openai', requested_model = 'gpt-5.6-terra',
         prompt_version = 'amc-question-tutor-prompt-v2',
         response_schema_version = 'amc-tutor-turn-v2', updated_at = $2
     WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()`,
    [secondTutorJobId, secondDispatchedAt, secondLeaseToken]
  );
  const incompleteTutorCompletion = await store.pool.connect();
  try {
    const orphanReplyId = randomUUID();
    const orphanReply = 'This reply must roll back without the thread head.';
    const orphanReplyHash = tutorSha256(orphanReply);
    const orphanCompletedAt = new Date(secondDispatchedAt.getTime() + 1_000);
    await incompleteTutorCompletion.query('BEGIN');
    await incompleteTutorCompletion.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs
       SET status = 'SUCCEEDED', delivery_disposition = 'DELIVERED_RESULT',
           response_message_id = $2, reply_sha256 = $3,
           response_model = 'gpt-5.6-terra-2026-07-15',
           usage = '{"inputTokens":800,"outputTokens":80,"totalTokens":880}'::jsonb,
           latency_ms = 200, lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
           completed_at = $4, updated_at = $4
       WHERE id = $1 AND lease_token = $5 AND lease_expires_at > clock_timestamp()`,
      [secondTutorJobId, orphanReplyId, orphanReplyHash, orphanCompletedAt, secondLeaseToken]
    );
    await incompleteTutorCompletion.query(
      `INSERT INTO amc_practice.learning_tutor_messages
       (id, thread_id, student_id, role, content_markdown, content_sha256,
        source_turn_job_id, created_at)
       VALUES ($1,$2,$3,'ASSISTANT',$4,$5,$6,$7)`,
      [orphanReplyId, tutorThreadId, reviewStudent.id, orphanReply,
        orphanReplyHash, secondTutorJobId, orphanCompletedAt]
    );
    await assert.rejects(
      () => incompleteTutorCompletion.query('COMMIT'),
      (error) => error.code === '23514'
    );
    await incompleteTutorCompletion.query('ROLLBACK');
  } finally {
    incompleteTutorCompletion.release();
  }
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs
       SET status = 'FAILED', provider_invoked = false,
           delivery_disposition = 'NOT_DISPATCHED', outcome_code = 'FORGED_ROLLBACK',
           error_class = 'permanent', lease_owner = NULL, lease_token = NULL,
           lease_expires_at = NULL, completed_at = $2, updated_at = $2
       WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()`,
      [secondTutorJobId, new Date(secondDispatchedAt.getTime() + 1_000), secondLeaseToken]
    ),
    (error) => ['23514', '55000'].includes(error.code)
  );
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.learning_tutor_turn_jobs
       (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
        authorized_session_id, idempotency_key_hash, request_hash, correlation_id,
        snapshot_hash, context_hash, history_hash, input_hash, thread_lineage_hash,
        tutor_contract_version, status, priority, attempt_count, max_attempts,
        available_at, provider_invoked, delivery_disposition, retryable,
        deletion_generation, created_at, updated_at)
       VALUES ($1,$2,$3,$4,2,2,$5,$6,$7,'pg-tutor-duplicate',$8,$9,$10,$11,$12,
               'amc-tutor-contract-v2','QUEUED',100,0,3,$13,false,'NOT_DISPATCHED',false,$14,$13,$13)`,
      [randomUUID(), tutorThreadId, reviewStudent.id, secondTutorMessageId, tutorSessionId,
        tutorSha256('duplicate-job-idempotency'), tutorSha256('duplicate-job-request'),
        tutorSnapshotHash, tutorTurn.contextHash, secondTutorTurn.historyHash,
        tutorSha256('duplicate-input'), tutorThreadLineageHash,
        new Date(secondTutorQueuedAt.getTime() + 500), tutorLineage.deletion_generation]
    ),
    (error) => error.code === '23505'
  );
  const secondUnknownAt = new Date(secondDispatchedAt.getTime() + 2_000);
  const deliveryUnknown = await store.pool.query(
    `UPDATE amc_practice.learning_tutor_turn_jobs
     SET status = 'DELIVERY_UNKNOWN', outcome_code = 'DELIVERY_UNKNOWN',
         retryable = false, lease_owner = NULL, lease_token = NULL,
         lease_expires_at = NULL, completed_at = $2, updated_at = $2
     WHERE id = $1 AND lease_token = $3 AND lease_expires_at > clock_timestamp()
     RETURNING id`,
    [secondTutorJobId, secondUnknownAt, secondLeaseToken]
  );
  assert.equal(deliveryUnknown.rowCount, 1);
  const explicitRetryJobId = randomUUID();
  const explicitRetryAt = new Date(secondUnknownAt.getTime() + 1_000);
  const explicitRetryAvailableAt = new Date(Date.now() + 60_000);
  const explicitRetryTurn = buildTutorTurnRequest({
    correlationId: 'pg-tutor-correlation-002-retry', threadId: tutorThreadId,
    turnId: explicitRetryJobId, turnNumber: 2, context: tutorContext,
    priorTurns: [{ turnNumber: 1, userMessage: tutorMessage, assistantReply: tutorReply }],
    message: secondTutorMessage
  });
  const explicitTutorRetry = await store.pool.connect();
  try {
    await explicitTutorRetry.query('BEGIN');
    await explicitTutorRetry.query(
      `UPDATE amc_practice.learning_tutor_threads
       SET request_count = 3, thread_revision = 4, updated_at = $2 WHERE id = $1`,
      [tutorThreadId, explicitRetryAt]
    );
    await explicitTutorRetry.query(
      `INSERT INTO amc_practice.learning_tutor_turn_jobs
       (id, thread_id, student_id, request_message_id, request_ordinal, turn_number,
        retry_of_job_id, retry_authorization, authorized_session_id,
        idempotency_key_hash, request_hash, correlation_id, snapshot_hash, context_hash,
        history_hash, input_hash, thread_lineage_hash, tutor_contract_version,
        status, priority, attempt_count, max_attempts, available_at,
        provider_invoked, delivery_disposition, retryable, deletion_generation,
        created_at, updated_at)
       VALUES ($1,$2,$3,$4,3,2,$5,'STUDENT_EXPLICIT',$6,$7,$8,$9,$10,$11,$12,$13,$14,
               'amc-tutor-contract-v2','QUEUED',100,0,3,$15,false,
               'NOT_DISPATCHED',false,$16,$17,$17)`,
      [explicitRetryJobId, tutorThreadId, reviewStudent.id, secondTutorMessageId,
        secondTutorJobId, tutorSessionId, tutorSha256('pg-tutor-explicit-retry-idempotency'),
        tutorSha256(JSON.stringify(explicitRetryTurn)), explicitRetryTurn.correlationId,
        explicitRetryTurn.snapshotHash, explicitRetryTurn.contextHash,
        explicitRetryTurn.historyHash, explicitRetryTurn.inputHash, tutorThreadLineageHash,
        explicitRetryAvailableAt, tutorLineage.deletion_generation, explicitRetryAt]
    );
    await explicitTutorRetry.query('COMMIT');
  } catch (error) {
    await explicitTutorRetry.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    explicitTutorRetry.release();
  }
  assert.deepEqual((await store.pool.query(
    `SELECT status, request_ordinal, turn_number, retry_of_job_id, retry_authorization
     FROM amc_practice.learning_tutor_turn_jobs WHERE id = $1`, [explicitRetryJobId]
  )).rows, [{
    status: 'QUEUED', request_ordinal: 3, turn_number: 2,
    retry_of_job_id: secondTutorJobId, retry_authorization: 'STUDENT_EXPLICIT'
  }]);
  const forgedEarlyClaimAt = new Date(explicitRetryAvailableAt.getTime() + 1_000);
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.learning_tutor_turn_jobs
       SET status = 'RUNNING', attempt_count = 1, lease_owner = 'forged-early-worker',
           lease_token = $2, lease_expires_at = $3, started_at = $4, updated_at = $4
       WHERE id = $1 AND status = 'QUEUED'`,
      [explicitRetryJobId, randomUUID(),
        new Date(forgedEarlyClaimAt.getTime() + 60_000), forgedEarlyClaimAt]
    ),
    (error) => error.code === '55000'
  );
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [reviewFinal.submission.id]
  )).rows, officialBeforeAnalysis.rows);

  // The FINAL-only text-batch path is exercised against the real PostgreSQL
  // transaction adapter and private filesystem store. The model seam below
  // supplies the frozen Gateway contract; lease lineage is still claimed and
  // enforced by PostgreSQL before the mapping can create immutable version 2.
  const batchText = 'Question 1: A. I subtract the same quantity from both sides, so the equality is preserved.';
  const batchCreated = await service.createLearningBatch(
    reviewStudent.id,
    reviewAttempt.attempt.id,
    `pg-batch-create-${randomUUID()}`,
    {
      files: [{
        displayName: 'student-work.md',
        kind: 'TEXT',
        contentType: 'text/markdown',
        declaredBytes: Buffer.byteLength(batchText)
      }]
    }
  );
  assert.equal(batchCreated.created, true);
  assert.equal(batchCreated.batch.status, 'DRAFT');
  assert.equal(batchCreated.batch.baseVersion, 1);
  assert.equal('storageKey' in batchCreated.batch.assets[0], false);
  await assert.rejects(
    () => service.getLearningBatch(
      checkpointStudent.id, reviewAttempt.attempt.id, batchCreated.batch.id
    ),
    (error) => error.code === 'ATTEMPT_NOT_FOUND'
  );

  const batchUploaded = await service.uploadLearningBatchAsset(
    reviewStudent.id,
    reviewAttempt.attempt.id,
    batchCreated.batch.id,
    batchCreated.batch.assets[0].id,
    `pg-batch-upload-${randomUUID()}`,
    Readable.from([batchText]),
    Buffer.byteLength(batchText)
  );
  assert.equal(batchUploaded.asset.status, 'NORMALIZED');
  assert.equal(batchUploaded.asset.observedBytes, Buffer.byteLength(batchText));

  const batchSubmitted = await service.submitLearningBatch(
    reviewStudent.id,
    reviewAttempt.attempt.id,
    batchCreated.batch.id,
    `pg-batch-submit-${randomUUID()}`
  );
  assert.equal(batchSubmitted.batch.status, 'PROCESSING');

  const batchClaimAt = new Date(Date.now() + 1_000);
  const fairnessBefore = (await store.pool.query(
    `SELECT last_claimed_kind, revision
     FROM amc_practice.ai_dispatch_fairness_state WHERE singleton = true`
  )).rows[0];
  assert.equal(fairnessBefore.last_claimed_kind, 'INTERACTIVE_ANALYSIS');
  const completedInteractive = (await store.pool.query(
    `SELECT w.id AS work_id, w.status AS work_status, w.attempt_count,
            w.updated_at AS work_updated_at, r.id AS run_id,
            r.status AS run_status, r.started_at, r.last_error_code
     FROM amc_practice.learning_work_items w
     JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
     JOIN amc_practice.learning_submission_versions v
       ON v.id = w.learning_submission_version_id
     WHERE v.learning_submission_id = $1 AND v.version_number = 1`,
    [reviewFinal.learningSubmission.id]
  )).rows[0];
  await store.pool.query(
    `UPDATE amc_practice.learning_work_items
     SET status = 'QUEUED', available_at = $2, lease_owner = NULL,
         lease_token = NULL, lease_expires_at = NULL, updated_at = $2
     WHERE id = $1`, [completedInteractive.work_id, new Date(batchClaimAt.getTime() - 1)]
  );
  await store.pool.query(
    `UPDATE amc_practice.learning_analysis_runs
     SET status = 'QUEUED', last_error_code = NULL WHERE id = $1`,
    [completedInteractive.run_id]
  );
  const fairClaims = await Promise.all([
    store.claimNextAiWork({
      workerId: 'pg-fair-worker-a', now: batchClaimAt, leaseMs: 120_000,
      acceptedKinds: ['INTERACTIVE_ANALYSIS', 'BATCH_EXTRACTION'], maxBatchConcurrent: 1
    }),
    secondStore.claimNextAiWork({
      workerId: 'pg-fair-worker-b', now: batchClaimAt, leaseMs: 120_000,
      acceptedKinds: ['INTERACTIVE_ANALYSIS', 'BATCH_EXTRACTION'], maxBatchConcurrent: 1
    })
  ]);
  assert.deepEqual(fairClaims.map((claim) => claim.kind).sort(), [
    'BATCH_EXTRACTION', 'INTERACTIVE_ANALYSIS'
  ]);
  const batchClaim = fairClaims.find((claim) => claim.kind === 'BATCH_EXTRACTION');
  const fairnessAfter = (await store.pool.query(
    `SELECT last_claimed_kind, revision
     FROM amc_practice.ai_dispatch_fairness_state WHERE singleton = true`
  )).rows[0];
  assert.equal(fairnessAfter.last_claimed_kind, 'INTERACTIVE_ANALYSIS');
  assert.equal(Number(fairnessAfter.revision), Number(fairnessBefore.revision) + 2);
  assert.equal(await store.claimNextAiWork({
    workerId: 'pg-fair-worker-cap', now: batchClaimAt, leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION'], maxBatchConcurrent: 1
  }), null, 'durable rotation cannot bypass the global running-batch cap');
  await store.pool.query(
    `UPDATE amc_practice.learning_work_items
     SET status = $2, attempt_count = $3, lease_owner = NULL, lease_token = NULL,
         lease_expires_at = NULL, updated_at = $4 WHERE id = $1`,
    [completedInteractive.work_id, completedInteractive.work_status,
      completedInteractive.attempt_count, completedInteractive.work_updated_at]
  );
  await store.pool.query(
    `UPDATE amc_practice.learning_analysis_runs
     SET status = $2, started_at = $3, last_error_code = $4 WHERE id = $1`,
    [completedInteractive.run_id, completedInteractive.run_status,
      completedInteractive.started_at, completedInteractive.last_error_code]
  );
  assert.equal(batchClaim?.kind, 'BATCH_EXTRACTION');
  assert.equal(batchClaim.job.batch.id, batchCreated.batch.id);
  const batchPlan = await service.prepareLearningBatchDecomposition(
    reviewStudent.id, reviewAttempt.attempt.id, batchCreated.batch.id
  );
  const batchRecorded = await service.recordLearningBatchDecomposition(
    reviewStudent.id,
    reviewAttempt.attempt.id,
    batchCreated.batch.id,
    {
      masterPlanHash: batchPlan.plan.masterPlanHash,
      outputs: batchGatewayOutputs(batchPlan.plan),
      runMetadata: batchGatewayRunMetadata(batchPlan.plan),
      workerFence: {
        workerId: batchClaim.job.workItem.leaseOwner,
        leaseToken: batchClaim.job.workItem.leaseToken,
        inputHash: batchClaim.job.workItem.inputHash,
        deletionGeneration: batchClaim.job.workItem.deletionGeneration
      }
    }
  );
  assert.equal(batchRecorded.batch.status, 'NEEDS_CONFIRMATION');
  assert.ok(batchRecorded.batch.mapping.items[0].confirmationReasons
    .includes('MODEL_DERIVED_REQUIRES_CONFIRMATION'));
  const batchConfirmed = await service.confirmLearningBatch(
    reviewStudent.id, reviewAttempt.attempt.id, batchCreated.batch.id,
    `pg-batch-confirm-${randomUUID()}`,
    {
      mappingRevision: batchRecorded.batch.mapping.revision,
      responses: [{
        questionNumber: 1,
        selectedOption: batchRecorded.batch.mapping.items[0].selectedOption,
        reasoningText: batchRecorded.batch.mapping.items[0].evidenceText,
        sourceItemIds: [batchRecorded.batch.mapping.items[0].id]
      }],
      discardedItemIds: []
    }
  );
  assert.equal(batchConfirmed.batch.status, 'COMMITTED');
  assert.equal(batchConfirmed.batch.committedVersion, 2);
  assert.equal(batchConfirmed.batch.result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  assert.equal(batchConfirmed.batch.result.mappedQuestionCount, 1);
  assert.equal(batchRecorded.batch.mapping.items[0].proposedQuestionNumber, 1);

  const batchDurability = await store.pool.query(
    `SELECT b.status, b.base_version, b.committed_version_number,
            v.creation_reason, v.context_status,
            count(DISTINCT r.question_number)::integer AS response_count,
            br.scoring_scope, br.mapped_question_count,
            mr.gateway_run_metadata
     FROM amc_practice.learning_batches b
     JOIN amc_practice.learning_submission_versions v
       ON v.id = b.committed_version_id AND v.batch_id = b.id
     JOIN amc_practice.learning_question_responses r
       ON r.learning_submission_version_id = v.id
     JOIN amc_practice.learning_batch_results br
       ON br.batch_id = b.id AND br.learning_submission_version_id = v.id
     JOIN amc_practice.learning_batch_mapping_revisions mr
       ON mr.batch_id = b.id AND mr.revision = b.mapping_revision
     WHERE b.id = $1
     GROUP BY b.status, b.base_version, b.committed_version_number,
              v.creation_reason, v.context_status, br.scoring_scope,
              br.mapped_question_count, mr.gateway_run_metadata`,
    [batchCreated.batch.id]
  );
  assert.equal(batchDurability.rowCount, 1);
  const { gateway_run_metadata: durableGatewayMetadata, ...durableBatchRow } = batchDurability.rows[0];
  assert.deepEqual(durableBatchRow, {
    status: 'COMMITTED',
    base_version: 1,
    committed_version_number: 2,
    creation_reason: 'BATCH_COMMIT',
    context_status: 'CONTEXT_READY',
    response_count: 1,
    scoring_scope: 'MAPPED_QUESTIONS_ONLY',
    mapped_question_count: 1
  });
  assert.deepEqual(
    durableGatewayMetadata.map(({ chunkId, inputHash }) => ({ chunkId, inputHash })),
    batchPlan.plan.chunks.map(({ chunkId, inputHash }) => ({ chunkId, inputHash }))
  );
  const batchConfirmationAudit = await store.pool.query(
    `SELECT r.answer_origin, r.reasoning_origin,
            cr.source_evidence_hash AS confirmation_source_hash,
            response.confirmed_reasoning_text, response.confirmed_reasoning_hash,
            response.reasoning_origin AS confirmation_reasoning_origin,
            response.canonical_source_item_ids, response.source_descriptors,
            response.reconstructed_source_text, response.source_span_hash,
            response.source_evidence_hash
     FROM amc_practice.learning_batches b
     JOIN amc_practice.learning_question_responses r
       ON r.learning_submission_version_id = b.committed_version_id
     JOIN amc_practice.learning_batch_confirmation_revisions cr
       ON cr.batch_id = b.id AND cr.mapping_revision = b.mapping_revision
     JOIN amc_practice.learning_batch_confirmation_responses response
       ON response.batch_id = cr.batch_id AND response.mapping_revision = cr.mapping_revision
      AND response.question_number = r.question_number
     WHERE b.id = $1`, [batchCreated.batch.id]
  );
  assert.equal(batchConfirmationAudit.rowCount, 1);
  assert.equal(batchConfirmationAudit.rows[0].answer_origin, 'BATCH_CONFIRMED');
  assert.equal(batchConfirmationAudit.rows[0].reasoning_origin, 'BATCH_CONFIRMED_EVIDENCE');
  assert.equal(batchConfirmationAudit.rows[0].confirmation_reasoning_origin,
    'BATCH_CONFIRMED_EVIDENCE');
  assert.equal(batchConfirmationAudit.rows[0].confirmed_reasoning_text,
    batchRecorded.batch.mapping.items[0].evidenceText);
  assert.equal(batchConfirmationAudit.rows[0].reconstructed_source_text,
    batchRecorded.batch.mapping.items[0].evidenceText);
  assert.match(batchConfirmationAudit.rows[0].confirmed_reasoning_hash, /^[a-f0-9]{64}$/);
  assert.match(batchConfirmationAudit.rows[0].source_span_hash, /^[a-f0-9]{64}$/);
  assert.match(batchConfirmationAudit.rows[0].source_evidence_hash, /^[a-f0-9]{64}$/);
  assert.equal(batchConfirmationAudit.rows[0].confirmation_source_hash,
    batchConfirmed.batch.confirmation.sourceEvidenceHash);
  assert.deepEqual(batchConfirmationAudit.rows[0].canonical_source_item_ids,
    [batchRecorded.batch.mapping.items[0].id]);
  assert.equal(batchConfirmationAudit.rows[0].source_descriptors.length, 1);
  await assert.rejects(
    store.pool.query(
      `UPDATE amc_practice.learning_batch_confirmation_responses
       SET confirmed_reasoning_text = 'tampered' WHERE batch_id = $1`, [batchCreated.batch.id]
    ),
    /append-only/
  );

  await store.pool.query(
    `UPDATE amc_practice.form_questions
     SET correct_option = 'D', accepted_options = '["D", "E"]'::jsonb
     WHERE form_id = $1 AND form_version = $2 AND question_number = 1`,
    [reviewForm.id, reviewForm.version]
  );

  const batchReviewAt = new Date(batchClaimAt.getTime() + 1_000);
  const batchReportWorker = new LearningReviewWorker({
    store: secondStore,
    inferenceClient: fakeInference,
    workerId: 'pg-batch-report-worker',
    leaseMs: 120_000,
    clock: () => batchReviewAt
  });
  const batchAnalysisClaim = await secondStore.claimLearningAnalysisWork({
    workerId: 'pg-batch-report-worker', now: batchReviewAt, leaseMs: 120_000
  });
  assert.deepEqual(batchAnalysisClaim.questions[0].scoring, {
    isScored: true, canonicalAnswer: 'A', acceptedOptions: ['A'],
    studentAnswerIsCorrect: true, selectedOption: 'A'
  });
  batchAnalysisClaim.questions[0].scoring.acceptedOptions = ['A', 'B'];
  const callsBeforeScoringDrift = fakeInference.calls.length;
  assert.deepEqual(await batchReportWorker.processClaimed(batchAnalysisClaim), {
    processed: false, staleLease: true
  }, 'authorization re-reads the exact batch result item and rejects a drifted claimed snapshot');
  assert.equal(fakeInference.calls.length, callsBeforeScoringDrift);
  batchAnalysisClaim.questions[0].scoring.acceptedOptions = ['A'];
  assert.deepEqual(
    await batchReportWorker.processClaimed(batchAnalysisClaim),
    { processed: true, status: 'COMPLETE', providerCalls: 1 }
  );
  assert.deepEqual(fakeInference.calls[1].question.scoring, {
    is_scored: true, canonical_answer: 'A', accepted_options: ['A']
  }, 'PostgreSQL batch analysis uses its exact committed result item instead of form_questions');
  assert.equal(fakeInference.calls[1].question.student_answer_status, 'ACCEPTED');
  await store.pool.query(
    `UPDATE amc_practice.form_questions
     SET correct_option = 'A', accepted_options = '["A"]'::jsonb
     WHERE form_id = $1 AND form_version = $2 AND question_number = 1`,
    [reviewForm.id, reviewForm.version]
  );
  const batchLearning = await service.getLearningSubmission(reviewStudent.id, reviewAttempt.attempt.id);
  assert.equal(batchLearning.version, 2);
  const batchLearningReport = await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id);
  assert.equal(batchLearningReport.status, 'COMPLETE');
  assert.equal(batchLearningReport.summary.analyzedCount, 1);
  assert.equal(batchLearningReport.questions[0].questionNumber, 1);

  // A confirmed batch uses the committed normalized response/result authority,
  // not transient upload rows. Purging those raw rows must leave its Tutor
  // snapshot/thread, immutable learning version, and report intact.
  const batchTutorLineage = (await store.pool.query(
    `SELECT report.id AS report_id, report.report_hash,
            run.id AS analysis_run_id, run.analysis_contract_version,
            analysis.question_input_hash, analysis.question_context_hash,
            response.selected_option, response.reasoning_text, response.answer_origin,
            submission.id AS learning_submission_id, submission.student_id,
            submission.source_type, submission.deletion_generation,
            version.id AS version_id, version.version_number, version.form_id,
            version.form_version, version.context_set_id, version.evidence_hash,
            context.artifact_set_hash, context.approval_authority_id,
            context.approval_receipt_set_hash, context.release_manifest_hash,
            context.release_content_hash, context.release_question_bundle_hash,
            question.question_content_hash, result.id AS batch_result_id
     FROM amc_practice.learning_reports report
     JOIN amc_practice.learning_analysis_runs run ON run.id = report.analysis_run_id
     JOIN amc_practice.learning_submission_versions version
       ON version.id = report.learning_submission_version_id
     JOIN amc_practice.learning_submissions submission
       ON submission.id = version.learning_submission_id
     JOIN amc_practice.learning_question_analyses analysis
       ON analysis.analysis_run_id = run.id AND analysis.question_number = 1
     JOIN amc_practice.learning_question_responses response
       ON response.learning_submission_version_id = version.id
      AND response.question_number = 1 AND response.answer_origin = 'BATCH_CONFIRMED'
     JOIN amc_practice.approved_context_sets context ON context.id = version.context_set_id
     JOIN amc_practice.approved_context_questions question
       ON question.context_set_id = context.id AND question.question_number = 1
     JOIN amc_practice.learning_batch_results result
       ON result.learning_submission_version_id = version.id
     WHERE run.id = $1`, [batchAnalysisClaim.run.id]
  )).rows[0];
  assert.ok(batchTutorLineage);
  const batchTutorQuestionSource = batchAnalysisClaim.questions
    .find((question) => question.questionNumber === 1);
  const batchTutorApprovedQuestion = batchTutorQuestionSource.context;
  const batchTutorChoiceMap = Array.isArray(batchTutorApprovedQuestion.choices)
    ? Object.fromEntries(batchTutorApprovedQuestion.choices
      .map((choice) => [choice.option, choice.textMarkdown]))
    : batchTutorApprovedQuestion.choices;
  const batchTutorContextReleaseHash = computeTutorContextReleaseHash({
    sourceType: batchTutorLineage.source_type,
    formId: batchTutorLineage.form_id,
    formVersion: batchTutorLineage.form_version,
    manifestHash: batchTutorLineage.release_manifest_hash,
    contentHash: batchTutorLineage.release_content_hash,
    questionBundleHash: batchTutorLineage.release_question_bundle_hash,
    contextSetId: batchTutorLineage.context_set_id,
    contextArtifactSha256: batchTutorLineage.artifact_set_hash,
    approvalAuthorityId: batchTutorLineage.approval_authority_id,
    approvalReceiptSetHash: batchTutorLineage.approval_receipt_set_hash,
    openReviewReleaseHash: null
  });
  const batchTutorContext = {
    learningSubmissionId: batchTutorLineage.learning_submission_id,
    learningSubmissionVersionId: batchTutorLineage.version_id,
    versionNumber: batchTutorLineage.version_number,
    formId: batchTutorLineage.form_id,
    formVersion: batchTutorLineage.form_version,
    contextSetId: batchTutorLineage.context_set_id,
    contextArtifactSha256: batchTutorLineage.artifact_set_hash,
    contextReleaseHash: batchTutorContextReleaseHash,
    evidenceHash: batchTutorLineage.evidence_hash,
    question: {
      questionNumber: 1,
      questionId: `${batchTutorLineage.form_id}:q:1`,
      promptMarkdown: batchTutorApprovedQuestion.promptMarkdown,
      choices: ['A', 'B', 'C', 'D', 'E'].map((label) => ({
        label, textMarkdown: batchTutorChoiceMap[label]
      })),
      isScored: batchTutorQuestionSource.scoring.isScored,
      officialAnswer: batchTutorQuestionSource.scoring.canonicalAnswer,
      acceptedOptions: batchTutorQuestionSource.scoring.acceptedOptions,
      studentAnswer: batchTutorLineage.selected_option,
      studentReasoning: batchTutorLineage.reasoning_text || null,
      solutions: batchTutorApprovedQuestion.solutions
        .filter((solution) => solution.modelEligibility.eligible
          && solution.authorityReceipt.status === 'active')
        .map((solution) => ({
          solutionId: solution.artifactSolutionId,
          approvalStatus: 'APPROVED', modelEligible: true, title: solution.title,
          markdown: solution.bodyMarkdown, bodySha256: solution.bodySha256,
          sourceSha256: solution.sourceRef.sha256, reviewerId: solution.reviewerId,
          reviewedAt: solution.reviewedAt, rightsStatus: solution.rightsStatus,
          authorityReceiptId: solution.authorityReceipt.receiptId,
          authorityReceiptStatus: solution.authorityReceipt.status,
          methodTags: solution.methodTags, qualityFlags: solution.qualityFlags
        }))
    }
  };
  assert.equal(isValidTutorContext(batchTutorContext), true);
  const batchTutorSnapshotId = randomUUID();
  const batchTutorThreadId = randomUUID();
  const batchTutorSnapshotHash = computeTutorSnapshotHash(batchTutorContext);
  const batchTutorQuestionResponseHash = canonicalHash({
    questionNumber: 1, selectedOption: batchTutorLineage.selected_option,
    reasoningText: batchTutorLineage.reasoning_text,
    answerOrigin: batchTutorLineage.answer_origin
  });
  const batchTutorScoringHash = canonicalHash(batchTutorQuestionSource.scoring);
  const batchTutorThreadLineageHash = computeTutorThreadLineageHash({
    analysisRunId: batchTutorLineage.analysis_run_id,
    analysisContractVersion: batchTutorLineage.analysis_contract_version,
    reportId: batchTutorLineage.report_id,
    reportHash: batchTutorLineage.report_hash,
    snapshotHash: batchTutorSnapshotHash,
    questionResponseHash: batchTutorQuestionResponseHash,
    scoringSnapshotHash: batchTutorScoringHash,
    scoringOrigin: 'BATCH_CONFIRMED',
    initialDeletionGeneration: batchTutorLineage.deletion_generation
  });
  const batchTutorCreatedAt = new Date(Date.now() - 1_000);
  await store.pool.query(
    `INSERT INTO amc_practice.learning_tutor_snapshots
     (id, student_id, learning_submission_id, learning_submission_version_id,
      version_number, form_id, form_version, source_type, question_number,
      context_set_id, question_content_hash, analysis_run_id, analysis_contract_version,
      analysis_question_input_hash, analysis_question_context_hash, report_id, report_hash,
      evidence_hash, question_response_hash, scoring_snapshot_hash, scoring_origin,
      official_submission_id, batch_result_id, initial_deletion_generation,
      context_artifact_sha256, context_release_hash, payload_schema, snapshot_payload,
      snapshot_hash, thread_lineage_hash, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
             'BATCH_CONFIRMED',NULL,$20,$21,$22,$23,'amc-tutor-snapshot-v2',$24::jsonb,$25,$26,$27)`,
    [batchTutorSnapshotId, batchTutorLineage.student_id,
      batchTutorLineage.learning_submission_id, batchTutorLineage.version_id,
      batchTutorLineage.version_number, batchTutorLineage.form_id,
      batchTutorLineage.form_version, batchTutorLineage.source_type,
      batchTutorLineage.context_set_id, batchTutorLineage.question_content_hash,
      batchTutorLineage.analysis_run_id, batchTutorLineage.analysis_contract_version,
      batchTutorLineage.question_input_hash, batchTutorLineage.question_context_hash,
      batchTutorLineage.report_id, batchTutorLineage.report_hash,
      batchTutorLineage.evidence_hash, batchTutorQuestionResponseHash,
      batchTutorScoringHash, batchTutorLineage.batch_result_id,
      batchTutorLineage.deletion_generation, batchTutorLineage.artifact_set_hash,
      batchTutorContextReleaseHash, JSON.stringify(batchTutorContext),
      batchTutorSnapshotHash, batchTutorThreadLineageHash, batchTutorCreatedAt]
  );
  await store.pool.query(
    `INSERT INTO amc_practice.learning_tutor_threads
     (id, student_id, snapshot_id, learning_submission_id, learning_submission_version_id,
      question_number, snapshot_hash, thread_lineage_hash, tutor_contract_version,
      context_hash, status, initial_deletion_generation, deletion_generation,
      creation_idempotency_key_hash, creation_request_hash, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,1,$6,$7,'amc-tutor-contract-v2',$8,'OPEN',$9,$9,$10,$11,$12,$12)`,
    [batchTutorThreadId, batchTutorLineage.student_id, batchTutorSnapshotId,
      batchTutorLineage.learning_submission_id, batchTutorLineage.version_id,
      batchTutorSnapshotHash, batchTutorThreadLineageHash,
      computeTutorContextHash({ threadId: batchTutorThreadId, context: batchTutorContext }),
      batchTutorLineage.deletion_generation,
      tutorSha256('pg-batch-tutor-thread-idempotency'),
      tutorSha256('pg-batch-tutor-thread-request'), batchTutorCreatedAt]
  );
  const purgedCommittedBatch = await service.deleteLearningBatch(
    reviewStudent.id, reviewAttempt.attempt.id, batchCreated.batch.id,
    `pg-batch-source-purge-${randomUUID()}`
  );
  assert.equal(purgedCommittedBatch.batch.status, 'COMMITTED');
  assert.equal(purgedCommittedBatch.batch.deletionState, 'COMPLETE');
  assert.deepEqual((await store.pool.query(
    `SELECT thread.status, thread.deletion_generation,
            version.id AS version_id, report.id AS report_id,
            batch.deletion_state, asset.status AS asset_status, asset.storage_key
     FROM amc_practice.learning_tutor_threads thread
     JOIN amc_practice.learning_tutor_snapshots snapshot ON snapshot.id = thread.snapshot_id
     JOIN amc_practice.learning_submission_versions version
       ON version.id = snapshot.learning_submission_version_id
     JOIN amc_practice.learning_reports report ON report.id = snapshot.report_id
     JOIN amc_practice.learning_batches batch ON batch.id = $2
     JOIN amc_practice.learning_batch_assets asset ON asset.batch_id = batch.id
     WHERE thread.id = $1`, [batchTutorThreadId, batchCreated.batch.id]
  )).rows, [{
    status: 'OPEN', deletion_generation: batchTutorLineage.deletion_generation,
    version_id: batchTutorLineage.version_id, report_id: batchTutorLineage.report_id,
    deletion_state: 'COMPLETE', asset_status: 'PURGED', storage_key: null
  }]);
  const historyStateSql = `SELECT
      (SELECT count(*)::integer FROM amc_practice.learning_submissions) AS submissions,
      (SELECT count(*)::integer FROM amc_practice.learning_submission_versions) AS versions,
      (SELECT count(*)::integer FROM amc_practice.learning_work_items) AS work_items,
      (SELECT count(*)::integer FROM amc_practice.learning_reports) AS reports,
      (SELECT count(*)::integer FROM amc_practice.learning_analysis_runs) AS runs`;
  const historyStateBefore = await store.pool.query(historyStateSql);
  const providerCallsBeforePgHistoryReads = fakeInference.calls.length;
  const pgHistory = await service.getLearningHistory(
    reviewStudent.id, reviewFinal.learningSubmission.id
  );
  assert.equal(pgHistory.formVersion, reviewForm.version);
  assert.deepEqual(pgHistory.versions.map((version) => version.versionNumber), [1, 2]);
  assert.equal(pgHistory.versions[0].reportStatus, 'PARTIAL');
  assert.equal(pgHistory.versions[1].reportStatus, 'COMPLETE');
  assert.equal(pgHistory.versions[1].resultStatus, 'AVAILABLE');
  const pgHistoryList = await service.listLearningHistory(reviewStudent.id, { limit: '20' });
  assert.deepEqual(pgHistoryList.items[0].versions.map((version) => version.versionNumber), [1, 2]);
  const pgHistoryV1Report = await service.getLearningHistoryReport(
    reviewStudent.id, reviewFinal.learningSubmission.id, '1'
  );
  const pgHistoryV2Report = await service.getLearningHistoryReport(
    reviewStudent.id, reviewFinal.learningSubmission.id, '2'
  );
  assert.equal(pgHistoryV1Report.status, 'PARTIAL');
  assert.equal(pgHistoryV2Report.status, 'COMPLETE');
  const pgHistoryQuestion = await service.getLearningHistoryQuestion(
    reviewStudent.id, reviewFinal.learningSubmission.id, '2', '1'
  );
  assert.equal(pgHistoryQuestion.response.answerOrigin, 'BATCH_CONFIRMED');
  assert.deepEqual(pgHistoryQuestion.protected.result, {
    selectedOption: 'A', correctOption: 'A', acceptedOptions: ['A'],
    isScored: true, isCorrect: true, points: 6
  });
  assert.equal(pgHistoryQuestion.protected.analysis.status, 'SUCCEEDED');
  for (const crossStudentRead of [
    () => service.getLearningHistory(student.id, reviewFinal.learningSubmission.id),
    () => service.getLearningHistoryQuestion(student.id, reviewFinal.learningSubmission.id, '2', '1'),
    () => service.getLearningHistoryReport(student.id, reviewFinal.learningSubmission.id, '2')
  ]) {
    await assert.rejects(
      crossStudentRead,
      (error) => error.statusCode === 404 && error.code === 'LEARNING_HISTORY_NOT_FOUND'
    );
  }
  assert.deepEqual((await store.pool.query(historyStateSql)).rows, historyStateBefore.rows,
    'PostgreSQL history reads do not enqueue work or mutate durable learning state');
  assert.equal(fakeInference.calls.length, providerCallsBeforePgHistoryReads,
    'PostgreSQL history reads make zero provider calls');
  assert.deepEqual((await store.pool.query(
    'SELECT * FROM amc_practice.submissions WHERE id = $1', [reviewFinal.submission.id]
  )).rows, officialBeforeAnalysis.rows,
  'batch commit and batch report must not mutate the official FINAL score');
  assert.deepEqual((await store.pool.query(
    `SELECT * FROM amc_practice.submission_answers
     WHERE submission_id = $1 ORDER BY question_number`, [reviewFinal.submission.id]
  )).rows, officialAnswersBeforeAnalysis.rows,
  'batch commit and analysis must not mutate any official answer row');

  const pgAudio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(48, 6)]);
  const createPgAudioBatch = async (studentId, attemptId, key, count = 1) => {
    const created = await service.createLearningBatch(studentId, attemptId, `${key}-create-${randomUUID()}`, {
      files: Array.from({ length: count }, (_, index) => ({
        displayName: `${key}-${index}.mp3`, kind: 'AUDIO', contentType: 'audio/mpeg',
        declaredBytes: pgAudio.length
      }))
    });
    for (const [index, asset] of created.batch.assets.entries()) {
      await service.uploadLearningBatchAsset(
        studentId, attemptId, created.batch.id, asset.id, `${key}-upload-${index}-${randomUUID()}`,
        Readable.from([pgAudio]), pgAudio.length
      );
    }
    await service.submitLearningBatch(
      studentId, attemptId, created.batch.id, `${key}-submit-${randomUUID()}`
    );
    return created;
  };

  // PostgreSQL parity for crash-after-upload: lease recovery purges local audio
  // immediately, independently of the much later retention-window observation.
  const pgTtlBatch = await createPgAudioBatch(
    reviewStudent.id, reviewAttempt.attempt.id, 'pg-upload-crash'
  );
  const pgTtlAt = new Date(Date.now() + 20_000);
  const pgTtlClaim = await store.claimNextTranscriptionWork({
    workerId: 'pg-upload-crash-worker', now: pgTtlAt, leaseMs: 120_000
  });
  const pgTtlDeadline = new Date(pgTtlAt.getTime() + RETENTION_OFFSET_MS);
  const pgUploadBarrier = await store.beginTranscriptionUploadCall({
    workItemId: pgTtlClaim.workItemId, leaseToken: pgTtlClaim.leaseToken,
    deletionGeneration: pgTtlClaim.deletionGeneration, startedAt: pgTtlAt,
    providerRetentionNotBefore: pgTtlDeadline, retentionProfile: RETENTION_PROFILE
  });
  const pgAmbiguousAt = new Date(pgTtlAt.getTime() + 120_001);
  const pgAmbiguous = await secondStore.claimNextTranscriptionWork({
    workerId: 'pg-upload-ambiguous-recovery', now: pgAmbiguousAt, leaseMs: 120_000
  });
  assert.equal(pgAmbiguous.phase, 'await_upload_retention');
  assert.equal(await secondStore.deferAmbiguousUploadUntilRetention({
    workItemId: pgAmbiguous.workItemId, leaseToken: pgAmbiguous.leaseToken,
    deletionGeneration: pgAmbiguous.deletionGeneration,
    uploadCallId: pgUploadBarrier.callId, now: pgAmbiguousAt
  }), true);
  const pgTtlPurge = await store.claimNextTranscriptionWork({
    workerId: 'pg-upload-retention-local-purge',
    now: new Date(pgAmbiguousAt.getTime() + 1), leaseMs: 120_000
  });
  assert.equal(pgTtlPurge.phase, 'purge_resolved_orphan');
  const pgTtlLocalFound = await privateUploadStore.delete(pgTtlPurge.assetStorageKey);
  assert.equal(await store.recordResolvedOrphanLocalAudioPurged({
    workItemId: pgTtlPurge.workItemId, leaseToken: pgTtlPurge.leaseToken,
    deletionGeneration: pgTtlPurge.deletionGeneration, providerTranscriptId: null,
    localObjectFound: pgTtlLocalFound, purgedAt: new Date(pgAmbiguousAt.getTime() + 2)
  }), true);
  const pgTtlCleanup = await secondStore.claimNextProviderOrphanCleanup({
    workerId: 'pg-upload-retention-cleanup', now: pgTtlDeadline, leaseMs: 120_000
  });
  assert.equal(pgTtlCleanup.cleanupKind, 'OBSERVE_RETENTION_WINDOW');
  assert.equal(await secondStore.completeProviderOrphanCleanup({
    jobId: pgTtlCleanup.id, leaseToken: pgTtlCleanup.leaseToken,
    evidenceType: 'provider-retention-window-elapsed', now: pgTtlDeadline
  }), true);
  const pgTtlState = await store.pool.query(
    `SELECT p.status AS provider_status, a.status AS asset_status, a.storage_key,
            w.status AS work_status, b.status AS batch_status
     FROM amc_practice.learning_batches b
     JOIN amc_practice.learning_batch_assets a ON a.batch_id = b.id
     JOIN amc_practice.learning_batch_provider_artifacts p ON p.asset_id = a.id
     JOIN amc_practice.learning_batch_work_items w
       ON w.batch_id = b.id AND w.asset_id = a.id AND w.work_type = 'TRANSCRIBE_AUDIO'
     WHERE b.id = $1`, [pgTtlBatch.batch.id]
  );
  assert.deepEqual(pgTtlState.rows[0], {
    provider_status: 'PROVIDER_RETENTION_PENDING', asset_status: 'PURGED',
    storage_key: null, work_status: 'FAILED', batch_status: 'FAILED'
  });
  const pgRetentionJob = await store.pool.query(
    `SELECT status FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs
     WHERE batch_id = $1 AND cleanup_kind = 'OBSERVE_RETENTION_WINDOW'`, [pgTtlBatch.batch.id]
  );
  assert.deepEqual(pgRetentionJob.rows, [{ status: 'MANUAL_VERIFICATION_REQUIRED' }]);
  assert.ok(pgUploadBarrier.callId);

  // PostgreSQL parity for deletion racing a crashed submit: a new deletion
  // generation performs bounded hash reconciliation, deletes every match, and
  // supersedes the upload-retention-window observation before deletion can become COMPLETE.
  const pgSubmitBatch = await createPgAudioBatch(
    reviewStudent.id, reviewAttempt.attempt.id, 'pg-submit-crash-delete'
  );
  const pgSubmitAt = new Date(pgTtlDeadline.getTime() + 10_000);
  const pgSubmitClaim = await secondStore.claimNextTranscriptionWork({
    workerId: 'pg-submit-crash-worker', now: pgSubmitAt, leaseMs: 120_000
  });
  const pgUploadUrl = `https://cdn.assemblyai.com/upload/${randomUUID()}`;
  const pgUploadHash = createHash('sha256').update(pgUploadUrl).digest('hex');
  const pgUpload = await secondStore.beginTranscriptionUploadCall({
    workItemId: pgSubmitClaim.workItemId, leaseToken: pgSubmitClaim.leaseToken,
    deletionGeneration: pgSubmitClaim.deletionGeneration, startedAt: pgSubmitAt,
    providerRetentionNotBefore: new Date(pgSubmitAt.getTime() + RETENTION_OFFSET_MS),
    retentionProfile: RETENTION_PROFILE
  });
  assert.equal(await secondStore.recordTranscriptionUploadResponse({
    workItemId: pgSubmitClaim.workItemId, leaseToken: pgSubmitClaim.leaseToken,
    deletionGeneration: pgSubmitClaim.deletionGeneration, uploadCallId: pgUpload.callId,
    uploadUrlSha256: pgUploadHash, returnedAt: pgSubmitAt
  }), true);
  const pgSubmit = await secondStore.beginTranscriptionSubmitCall({
    workItemId: pgSubmitClaim.workItemId, leaseToken: pgSubmitClaim.leaseToken,
    deletionGeneration: pgSubmitClaim.deletionGeneration, uploadCallId: pgUpload.callId,
    uploadUrlSha256: pgUploadHash, startedAt: pgSubmitAt
  });
  const pgDeleted = await service.deleteLearningBatch(
    reviewStudent.id, reviewAttempt.attempt.id, pgSubmitBatch.batch.id,
    `pg-submit-crash-delete-${randomUUID()}`
  );
  assert.equal(pgDeleted.batch.deletionGeneration, 1);
  assert.equal(pgDeleted.batch.deletionState, 'PROVIDER_RETENTION_PENDING',
    'upload ambiguity remains retention-pending until submit reconciliation binds transcript ids');
  const pgReconcileAt = new Date(pgSubmitAt.getTime() + 1_000);
  const pgReconcile = await store.claimNextTranscriptionWork({
    workerId: 'pg-submit-reconcile-worker', now: pgReconcileAt, leaseMs: 120_000
  });
  assert.equal(pgReconcile.phase, 'reconcile');
  assert.equal(pgReconcile.deletionGeneration, 1);
  const pgMatchedTranscriptIds = [randomUUID(), randomUUID()].sort();
  assert.equal(await store.recordAmbiguousSubmitReconciliation({
    workItemId: pgReconcile.workItemId, leaseToken: pgReconcile.leaseToken,
    deletionGeneration: pgReconcile.deletionGeneration, submitCallId: pgSubmit.callId,
    uploadUrlSha256: pgUploadHash, providerTranscriptIds: pgMatchedTranscriptIds,
    scanComplete: true, manualAfterMs: 90 * 24 * 60 * 60 * 1_000,
    reconciledAt: pgReconcileAt
  }), true);
  const pgPrimaryDelete = await secondStore.claimNextTranscriptionWork({
    workerId: 'pg-primary-delete-worker', now: new Date(pgReconcileAt.getTime() + 1), leaseMs: 120_000
  });
  assert.equal(pgPrimaryDelete.phase, 'delete');
  assert.equal(await secondStore.authorizeTranscriptionProviderCall({
    workItemId: pgPrimaryDelete.workItemId, leaseToken: pgPrimaryDelete.leaseToken,
    deletionGeneration: pgPrimaryDelete.deletionGeneration,
    providerTranscriptId: pgPrimaryDelete.providerTranscriptId,
    phase: 'DELETE', now: new Date(pgReconcileAt.getTime() + 2),
    providerBudget: {
      studentLimit: null, globalLimit: 100_000, windowMs: 24 * 60 * 60 * 1_000,
      budgetKind: 'PROVIDER_CLEANUP'
    }
  }), true);
  assert.equal(await secondStore.recordDeletionEvidence({
    workItemId: pgPrimaryDelete.workItemId, leaseToken: pgPrimaryDelete.leaseToken,
    deletionGeneration: pgPrimaryDelete.deletionGeneration,
    providerTranscriptId: pgPrimaryDelete.providerTranscriptId,
    evidenceType: 'provider-delete-response', evidencedAt: new Date(pgReconcileAt.getTime() + 3)
  }), true);
  const pgExtraDelete = await store.claimNextProviderOrphanCleanup({
    workerId: 'pg-extra-delete-worker', now: new Date(pgReconcileAt.getTime() + 4), leaseMs: 120_000
  });
  assert.ok(pgMatchedTranscriptIds.includes(pgExtraDelete.externalId));
  assert.equal(await store.completeProviderOrphanCleanup({
    jobId: pgExtraDelete.id, leaseToken: pgExtraDelete.leaseToken,
    evidenceType: 'provider-delete-response', now: new Date(pgReconcileAt.getTime() + 5)
  }), true);
  const pgDeletionState = await service.getLearningBatch(
    reviewStudent.id, reviewAttempt.attempt.id, pgSubmitBatch.batch.id
  );
  assert.equal(pgDeletionState.batch.deletionState, 'COMPLETE');
  const pgUploadCleanupState = await store.pool.query(
    `SELECT j.status FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
     JOIN amc_practice.learning_batch_provider_orphan_audit a ON a.id = j.orphan_audit_id
     WHERE a.provider_call_id = $1 AND a.event = 'PROVIDER_RETENTION_PENDING'`, [pgUpload.callId]
  );
  assert.deepEqual(pgUploadCleanupState.rows, [{ status: 'SUPERSEDED' }]);

  // Two independent pools share the least-served dispatcher state. The exact
  // first student is intentionally unspecified because UUID order is random.
  const fairStudents = [];
  const fairAttempts = [];
  for (const label of ['A', 'B']) {
    const fairStudent = await service.seedAccessCode({
      code: `pg-fair-${label}-${randomUUID()}`, displayName: `PG fair ${label}`
    });
    const fairAttempt = await service.createAttempt(fairStudent.id, built.manifest.id);
    await service.final(fairStudent.id, fairAttempt.attempt.id, `pg-fair-final-${label}-${randomUUID()}`, {
      expectedAnswersRevision: fairAttempt.attempt.answersRevision,
      expectedStateRevision: fairAttempt.attempt.stateRevision
    });
    fairStudents.push(fairStudent);
    fairAttempts.push(fairAttempt.attempt);
  }
  await createPgAudioBatch(fairStudents[0].id, fairAttempts[0].id, 'pg-fair-a', 2);
  await createPgAudioBatch(fairStudents[1].id, fairAttempts[1].id, 'pg-fair-b', 1);
  const fairClaimStudents = [];
  const fairAt = new Date(pgReconcileAt.getTime() + 60_000);
  for (let index = 0; index < 3; index += 1) {
    const fairStore = index % 2 === 0 ? store : secondStore;
    const claim = await fairStore.claimNextTranscriptionWork({
      workerId: `pg-fair-worker-${index}`, now: new Date(fairAt.getTime() + index), leaseMs: 120_000
    });
    assert.ok(claim);
    const owner = await store.pool.query(
      `SELECT b.student_id
       FROM amc_practice.learning_batch_work_items w
       JOIN amc_practice.learning_batches b ON b.id = w.batch_id
       WHERE w.id = $1`, [claim.workItemId]
    );
    fairClaimStudents.push(owner.rows[0].student_id);
  }
  assert.notEqual(fairClaimStudents[0], fairClaimStudents[1]);
  const fairCounts = [...new Set(fairClaimStudents)].map((studentId) =>
    fairClaimStudents.filter((candidate) => candidate === studentId).length).sort();
  assert.deepEqual(fairCounts, [1, 2]);

  const openCandidate = async (label, questionBundleHash = null) => {
    const form = {
      ...learningReviewForm(),
      id: `pg-open-${label}-${randomUUID()}`,
      version: 'open-v1',
      title: `Postgres open review ${label}`,
      contentHash: createHash('sha256').update(`open-content:${label}:${randomUUID()}`).digest('hex'),
      questionBundleHash: questionBundleHash
        || createHash('sha256').update(`open-bundle:${label}:${randomUUID()}`).digest('hex'),
      manifestHash: createHash('sha256').update(`open-manifest:${label}:${randomUUID()}`).digest('hex')
    };
    form.sourceManifestHash = form.manifestHash;
    await store.importForm(form, { publish: false, allowTestOnlyPublish: true });
    const artifact = approvedContextArtifact(form, {
      readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1)
    });
    const [context] = await new ApprovedContextImporter({
      store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
    }).import(artifact, approvalReceiptsForArtifact(artifact));
    return { form, context };
  };

  // OPEN_REVIEW v1 is created atomically by two independent API processes.
  // It contains no official/timer/work rows, and a missing idempotency row is
  // re-read after the no-row advisory lock so both same-key calls succeed.
  const open = await openCandidate('workspace');
  const openRelease = await store.publishOpenReviewRelease({
    releaseId: randomUUID(), formId: open.form.id, formVersion: open.form.version,
    contextSetId: open.context.id, authorityId: 'operator:postgres-open-review',
    reasonCode: 'POSTGRES_OPEN_RELEASE', now: new Date('2026-08-20T12:00:00.000Z')
  });
  const openStudent = await service.seedAccessCode({
    code: `pg-open-student-${randomUUID()}`, displayName: 'Postgres open review student'
  });
  const officialBeforeOpen = await store.pool.query(
    `SELECT (SELECT count(*)::integer FROM amc_practice.submissions) AS submissions,
            (SELECT count(*)::integer FROM amc_practice.submission_answers) AS answers`
  );
  const workspaceRace = await Promise.all([
    service.createOpenReviewWorkspace(openStudent.id, openRelease.id, 'postgres-open-workspace-race'),
    secondService.createOpenReviewWorkspace(openStudent.id, openRelease.id, 'postgres-open-workspace-race')
  ]);
  assert.equal(workspaceRace.filter((result) => result.created).length, 1);
  assert.equal(new Set(workspaceRace.map((result) => result.workspace.id)).size, 1);
  const openAttemptId = workspaceRace[0].workspace.id;
  const openRows = await store.pool.query(
    `SELECT a.attempt_mode, a.phase, a.clock_state, a.active_elapsed_ms,
            ls.source_type, ls.official_submission_id, ls.official_submission_kind,
            ls.open_review_release_id, lsv.creation_reason, lsv.context_set_id,
            (SELECT count(*)::integer FROM amc_practice.learning_question_responses r
              WHERE r.learning_submission_version_id = lsv.id) AS response_count,
            (SELECT count(*)::integer FROM amc_practice.learning_question_responses r
              WHERE r.learning_submission_version_id = lsv.id
                AND r.answer_origin = 'OPEN_REVIEW_BLANK' AND r.selected_option IS NULL
                AND r.reasoning_origin = 'NONE' AND r.reasoning_text = '') AS blank_count,
            (SELECT count(*)::integer FROM amc_practice.learning_work_items w
              WHERE w.learning_submission_version_id = lsv.id) AS work_count,
            (SELECT count(*)::integer FROM amc_practice.timer_events e
              WHERE e.attempt_id = a.id) AS timer_count
     FROM amc_practice.attempts a
     JOIN amc_practice.learning_submissions ls ON ls.attempt_id = a.id
     JOIN amc_practice.learning_submission_versions lsv
       ON lsv.learning_submission_id = ls.id AND lsv.version_number = 1
     WHERE a.id = $1`, [openAttemptId]
  );
  assert.deepEqual(openRows.rows[0], {
    attempt_mode: 'OPEN_REVIEW', phase: 'OPEN_REVIEW', clock_state: 'PAUSED', active_elapsed_ms: '0',
    source_type: 'OPEN_REVIEW', official_submission_id: null, official_submission_kind: null,
    open_review_release_id: openRelease.id, creation_reason: 'OPEN_REVIEW_ANCHOR',
    context_set_id: open.context.id, response_count: 25, blank_count: 25, work_count: 0, timer_count: 0
  });
  const officialAfterOpen = await store.pool.query(
    `SELECT (SELECT count(*)::integer FROM amc_practice.submissions) AS submissions,
            (SELECT count(*)::integer FROM amc_practice.submission_answers) AS answers`
  );
  assert.deepEqual(officialAfterOpen.rows, officialBeforeOpen.rows);
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.timer_events(attempt_id, event_type, occurred_at, metadata)
       VALUES ($1, 'ILLEGAL_OPEN_TIMER', now(), '{}'::jsonb)`, [openAttemptId]
    ),
    (error) => error.code === 'P0001' && /cannot have .*official.*timer records/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.submissions
       (id, attempt_id, kind, slot, trigger, active_elapsed_ms, scoring_policy,
        total_points, maximum_points, answered_count, correct_count, incorrect_count,
        blank_count, unscored_count, created_at)
       VALUES ($1,$2,'FINAL','FINAL','ILLEGAL_OPEN_FINAL',0,'{}'::jsonb,
               0,0,0,0,0,0,0,now())`, [randomUUID(), openAttemptId]
    ),
    (error) => error.code === 'P0001' && /cannot have .*official.*timer records/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.attempt_answers
       (attempt_id, question_number, selected_option, updated_at)
       VALUES ($1,1,'A',now())`, [openAttemptId]
    ),
    (error) => error.code === 'P0001' && /cannot have timed answer/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      "UPDATE amc_practice.attempts SET attempt_mode = 'TIMED' WHERE id = $1", [openAttemptId]
    ),
    (error) => error.code === 'P0001' && /identity is immutable/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      `INSERT INTO amc_practice.open_review_releases
       (id, schema_version, form_id, form_version, context_set_id, release_hash,
        manifest_hash, content_hash, question_bundle_hash, context_artifact_set_hash,
        approval_authority_id, status, transition_authority_id, transition_reason_code,
        published_at, superseded_at, state_revision, created_at, updated_at)
       VALUES ($1, 'amc-open-review-release-v1', $2, $3, $4, $5, $6, $7, $8, $9,
               $10, 'SUPERSEDED_VALID', 'operator:postgres-open-review', 'ILLEGAL_INITIAL_STATE',
               $11, $11, 1, $11, $11)`,
      [randomUUID(), open.form.id, open.form.version, open.context.id,
        createHash('sha256').update(randomUUID()).digest('hex'), open.form.manifestHash,
        open.form.contentHash, open.form.questionBundleHash, open.context.artifactSetHash,
        open.context.approvalAuthorityId, new Date('2026-08-20T12:00:01.000Z')]
    ),
    (error) => error.code === 'P0001' && /canonical ACTIVE state/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.form_revisions SET title = title || ' mutated'
       WHERE form_id = $1 AND version = $2`, [open.form.id, open.form.version]
    ),
    (error) => error.code === 'P0001' && /form revision is immutable/.test(error.message)
  );

  // Child immutability must guard the OLD lineage as well as NEW. Otherwise
  // an UPDATE could move a released solution into a compatible unreleased
  // context while leaving the release's stored bundle hash unchanged.
  const moveTarget = await openCandidate('move-target', open.form.questionBundleHash);
  const pinnedSolutionsBeforeMove = await store.pool.query(
    `SELECT count(*)::integer AS count,
            string_agg(solution_position::text || ':' || body_sha256, ',' ORDER BY solution_position) AS digest
     FROM amc_practice.approved_context_solutions
     WHERE context_set_id = $1 AND question_number = 1`, [open.context.id]
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.approved_context_solutions
       SET context_set_id = $1, solution_position = 3,
           artifact_solution_id = $2, authority_receipt_id = $3
       WHERE context_set_id = $4 AND question_number = 1 AND solution_position = 1`,
      [moveTarget.context.id, `moved-solution-${randomUUID()}`, `moved-receipt-${randomUUID()}`,
        open.context.id]
    ),
    (error) => error.code === 'P0001' && /context content is immutable/.test(error.message)
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.form_questions
       SET form_id = $1, form_version = $2
       WHERE form_id = $3 AND form_version = $4 AND question_number = 1`,
      [moveTarget.form.id, moveTarget.form.version, open.form.id, open.form.version]
    ),
    (error) => error.code === 'P0001' && /form questions are immutable/.test(error.message)
  );
  const pinnedSolutionsAfterMove = await store.pool.query(
    `SELECT count(*)::integer AS count,
            string_agg(solution_position::text || ':' || body_sha256, ',' ORDER BY solution_position) AS digest
     FROM amc_practice.approved_context_solutions
     WHERE context_set_id = $1 AND question_number = 1`, [open.context.id]
  );
  assert.deepEqual(pinnedSolutionsAfterMove.rows, pinnedSolutionsBeforeMove.rows);
  assert.equal((await store.getOpenReviewRelease(openRelease.id)).questionBundleHash,
    openRelease.questionBundleHash);

  const originalOpenSolutionIds = open.context.questions[0].solutions
    .filter((solution) => solution.modelEligibility.eligible)
    .map((solution) => solution.artifactSolutionId);
  const newerOpenArtifact = approvedContextArtifact(open.form, {
    readyNumbers: Array.from({ length: 25 }, (_, index) => index + 1),
    solutionIdentityOffset: 100,
    solutionBodyLabel: 'newer-active-context'
  });
  const [newerOpenContext] = await new ApprovedContextImporter({
    store, trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(newerOpenArtifact, approvalReceiptsForArtifact(newerOpenArtifact));
  const newerOpenSolutionIds = newerOpenContext.questions[0].solutions
    .filter((solution) => solution.modelEligibility.eligible)
    .map((solution) => solution.artifactSolutionId);
  assert.notDeepEqual(newerOpenSolutionIds, originalOpenSolutionIds);
  assert.deepEqual(newerOpenSolutionIds, ['solution-101', 'solution-102']);
  const activeOpenContext = await store.pool.query(
    `SELECT id FROM amc_practice.approved_context_sets
     WHERE form_id = $1 AND form_version = $2 AND active`, [open.form.id, open.form.version]
  );
  assert.deepEqual(activeOpenContext.rows, [{ id: newerOpenContext.id }]);
  assert.equal((await store.getOpenReviewRelease(openRelease.id)).contextSetId, open.context.id,
    'the release retains its original context id after a newer context becomes active');

  const createOpenTextBatch = async (label, text) => {
    const declaredBytes = Buffer.byteLength(text);
    const created = await service.createLearningBatch(
      openStudent.id, openAttemptId, `${label}-create-${randomUUID()}`,
      { files: [{ displayName: `${label}.md`, kind: 'TEXT', contentType: 'text/markdown', declaredBytes }] }
    );
    await service.uploadLearningBatchAsset(
      openStudent.id, openAttemptId, created.batch.id, created.batch.assets[0].id,
      `${label}-upload-${randomUUID()}`, Readable.from([text]), declaredBytes
    );
    await service.submitLearningBatch(
      openStudent.id, openAttemptId, created.batch.id, `${label}-submit-${randomUUID()}`
    );
    return created.batch.id;
  };
  const openFirstBatchId = await createOpenTextBatch(
    'pg-open-first', 'Question 1: A. I subtracted the same quantity from both sides.'
  );
  const openSecondBatchId = await createOpenTextBatch(
    'pg-open-second', 'Question 2: B. I compared the possible cases.'
  );
  const openWorkAt = new Date('2026-08-20T12:00:01.000Z');
  const openFirstClaim = await store.claimNextAiWork({
    workerId: 'pg-open-first-extractor', now: openWorkAt, leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(openFirstClaim.kind, 'BATCH_EXTRACTION');
  assert.ok([openFirstBatchId, openSecondBatchId].includes(openFirstClaim.job.batch.id));
  const openClaimedBatchId = openFirstClaim.job.batch.id;
  const openRemainingBatchId = openClaimedBatchId === openFirstBatchId
    ? openSecondBatchId : openFirstBatchId;

  const successor = await openCandidate('successor', open.form.questionBundleHash);
  await assert.rejects(
    () => store.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: successor.form.id, formVersion: successor.form.version,
      contextSetId: successor.context.id, authorityId: 'operator:postgres-open-review',
      reasonCode: 'PREMATURE_SUCCESSOR', now: new Date('2026-08-20T12:00:01.500Z')
    }),
    (error) => error.code === 'OPEN_REVIEW_ACTIVE_CONFLICT'
  );

  await store.transitionOpenReviewRelease({
    releaseId: openRelease.id, nextStatus: 'SUPERSEDED_VALID',
    authorityId: 'operator:postgres-open-review', reasonCode: 'POSTGRES_SUCCESSOR_READY',
    now: new Date('2026-08-20T12:00:02.000Z')
  });
  const supersededWorkspace = await service.getOpenReviewWorkspace(openStudent.id, openAttemptId);
  assert.equal(supersededWorkspace.releaseStatus, 'SUPERSEDED_VALID');
  assert.equal(supersededWorkspace.protectedAccessStatus, 'AVAILABLE_FOR_EXISTING_WORK');

  // Work claimed while ACTIVE remains valid under SUPERSEDED_VALID. Claim the
  // sibling before committing v2 so both leases still match base version 1.
  const openPrepared = await service.prepareLearningBatchDecomposition(
    openStudent.id, openAttemptId, openClaimedBatchId
  );
  const openDecomposed = await service.recordLearningBatchDecomposition(
    openStudent.id, openAttemptId, openClaimedBatchId, {
      masterPlanHash: openPrepared.plan.masterPlanHash,
      outputs: batchGatewayOutputs(openPrepared.plan),
      runMetadata: batchGatewayRunMetadata(openPrepared.plan),
      workerFence: {
        workerId: openFirstClaim.job.workItem.leaseOwner,
        leaseToken: openFirstClaim.job.workItem.leaseToken,
        inputHash: openFirstClaim.job.workItem.inputHash,
        deletionGeneration: openFirstClaim.job.workItem.deletionGeneration
      }
    }
  );
  const openSecondClaim = await secondStore.claimNextAiWork({
    workerId: 'pg-open-second-extractor', now: openWorkAt, leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(openSecondClaim.job.batch.id, openRemainingBatchId);
  const mappedOpenItem = openDecomposed.batch.mapping.items.find((item) => !item.unmapped);
  const openCommitted = await service.confirmLearningBatch(
    openStudent.id, openAttemptId, openClaimedBatchId, `pg-open-confirm-${randomUUID()}`, {
      mappingRevision: openDecomposed.batch.mapping.revision,
      responses: [{
        questionNumber: 1, selectedOption: 'A', reasoningText: mappedOpenItem.evidenceText,
        sourceItemIds: [mappedOpenItem.id]
      }],
      discardedItemIds: openDecomposed.batch.mapping.items
        .filter((item) => item.unmapped).map((item) => item.id)
    }
  );
  assert.equal(openCommitted.batch.status, 'COMMITTED');
  assert.equal(openCommitted.batch.result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  assert.equal(openCommitted.batch.result.items.length, 1);
  assert.equal((await service.getLearningSubmission(openStudent.id, openAttemptId)).version, 2);
  assert.equal((await store.pool.query(
    `SELECT context_set_id FROM amc_practice.learning_submission_versions
     WHERE learning_submission_id = $1 AND version_number = 2`,
    [openCommitted.batch.learningSubmissionId]
  )).rows[0].context_set_id, open.context.id,
  'OPEN_REVIEW v2 pins release.contextSetId instead of the newer active context');
  const openInference = new FakeInferenceClient();
  const openAnalysisWorker = new LearningReviewWorker({
    store: secondStore, inferenceClient: openInference,
    workerId: 'pg-open-analysis-worker', leaseMs: 120_000,
    clock: () => new Date('2026-08-20T12:00:02.100Z')
  });
  assert.deepEqual(await openAnalysisWorker.runOnce(),
    { processed: true, status: 'COMPLETE', providerCalls: 1 });
  assert.equal(openInference.calls.length, 1);
  assert.equal(openInference.calls[0].question.solutions.length, 2);
  assert.deepEqual(openInference.calls[0].question.solutions.map((solution) => solution.solution_id),
    originalOpenSolutionIds);
  assert.notDeepEqual(openInference.calls[0].question.solutions.map((solution) => solution.solution_id),
    newerOpenSolutionIds, 'analysis cannot drift to the newer active context for the same form');
  assert.equal((await service.getLearningReport(openStudent.id, openAttemptId)).status, 'COMPLETE');
  const listedOpenWorkspace = (await service.listOpenReviewWorkspaces(openStudent.id))
    .find((workspace) => workspace.id === openAttemptId);
  assert.equal(listedOpenWorkspace.analysisStatus, 'SUCCEEDED');

  const successorRelease = await store.publishOpenReviewRelease({
    releaseId: randomUUID(), formId: successor.form.id, formVersion: successor.form.version,
    contextSetId: successor.context.id, authorityId: 'operator:postgres-open-review',
    reasonCode: 'POSTGRES_SUCCESSOR_RELEASE', now: new Date('2026-08-20T12:00:03.000Z')
  });
  assert.equal(successorRelease.questionBundleHash, openRelease.questionBundleHash,
    'a successor may pin a new exact form/context revision for the same question bundle');
  const supersededPgQuestion = await service.getLearningHistoryQuestion(
    openStudent.id, openCommitted.batch.learningSubmissionId, '2', '1'
  );
  assert.equal(supersededPgQuestion.releaseStatus, 'SUPERSEDED_VALID');
  assert.equal(supersededPgQuestion.protectedAccessStatus, 'AVAILABLE_FOR_EXISTING_WORK');
  assert.equal(supersededPgQuestion.protected.result.isCorrect, true);
  assert.equal(supersededPgQuestion.protected.analysis.status, 'SUCCEEDED');
  const supersededPgReport = await service.getLearningHistoryReport(
    openStudent.id, openCommitted.batch.learningSubmissionId, '2'
  );
  assert.equal(supersededPgReport.status, 'COMPLETE');

  // Force three history reads to establish a REPEATABLE READ snapshot from
  // their release-owning header query, then block on the subsequent form read.
  // pg_stat_activity observes the real relation lock; no production test hook
  // is involved. Revocation commits while all three readers are blocked.
  const historyFormBlocker = await store.pool.connect();
  let snapshotDetailPromise;
  let snapshotQuestionPromise;
  let snapshotReportPromise;
  try {
    await historyFormBlocker.query('BEGIN');
    await historyFormBlocker.query('LOCK TABLE amc_practice.form_questions IN ACCESS EXCLUSIVE MODE');
    snapshotDetailPromise = service.getLearningHistory(
      openStudent.id, openCommitted.batch.learningSubmissionId
    );
    snapshotQuestionPromise = service.getLearningHistoryQuestion(
      openStudent.id, openCommitted.batch.learningSubmissionId, '2', '1'
    );
    snapshotReportPromise = service.getLearningHistoryReport(
      openStudent.id, openCommitted.batch.learningSubmissionId, '2'
    );
    let blockedReaders = 0;
    for (let attempt = 0; attempt < 100 && blockedReaders < 3; attempt += 1) {
      const waiting = await secondStore.pool.query(
        `SELECT count(*)::integer AS count
         FROM pg_stat_activity
         WHERE datname = current_database()
           AND pid <> pg_backend_pid()
           AND wait_event_type = 'Lock'
           AND query ILIKE '%form_questions%'`
      );
      blockedReaders = waiting.rows[0].count;
      if (blockedReaders < 3) await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.equal(blockedReaders, 3,
      'detail, question, and report all establish their snapshot before blocking on form content');
    await store.transitionOpenReviewRelease({
      releaseId: openRelease.id, nextStatus: 'REVOKED',
      authorityId: 'operator:postgres-open-review', reasonCode: 'POSTGRES_CONTENT_REVOCATION',
      now: new Date('2026-08-20T12:00:03.500Z')
    });
    await historyFormBlocker.query('COMMIT');
  } catch (error) {
    await historyFormBlocker.query('ROLLBACK').catch(() => {});
    await Promise.allSettled([
      snapshotDetailPromise, snapshotQuestionPromise, snapshotReportPromise
    ].filter(Boolean));
    throw error;
  } finally {
    historyFormBlocker.release();
  }
  const [snapshotDetail, snapshotQuestion, snapshotReport] = await Promise.all([
    snapshotDetailPromise, snapshotQuestionPromise, snapshotReportPromise
  ]);
  assert.equal(snapshotDetail.releaseStatus, 'SUPERSEDED_VALID');
  assert.equal(snapshotDetail.protectedAccessStatus, 'AVAILABLE_FOR_EXISTING_WORK');
  assert.equal(snapshotDetail.versions[1].reportStatus, 'COMPLETE');
  assert.equal(snapshotQuestion.protected.result.isCorrect, true);
  assert.equal(snapshotQuestion.protected.analysis.status, 'SUCCEEDED');
  assert.equal(snapshotReport.status, 'COMPLETE');
  await assert.rejects(
    () => service.getLearningReport(openStudent.id, openAttemptId),
    (error) => error.code === 'OPEN_REVIEW_REVOKED'
  );
  const revokedOpenWorkspace = await service.getOpenReviewWorkspace(openStudent.id, openAttemptId);
  assert.equal(revokedOpenWorkspace.releaseStatus, 'REVOKED');
  assert.equal(revokedOpenWorkspace.protectedAccessStatus, 'PROTECTED_RESULTS_WITHHELD');
  assert.equal(revokedOpenWorkspace.analysisStatus, 'SUCCEEDED');
  const revokedPgHistory = await service.getLearningHistory(
    openStudent.id, openCommitted.batch.learningSubmissionId
  );
  assert.deepEqual(revokedPgHistory.versions.map((version) => version.versionNumber), [1, 2]);
  assert.equal(revokedPgHistory.versions[1].analysisStatus, 'WITHHELD');
  assert.equal(revokedPgHistory.versions[1].reportStatus, 'WITHHELD');
  const revokedPgQuestion = await service.getLearningHistoryQuestion(
    openStudent.id, openCommitted.batch.learningSubmissionId, '2', '1'
  );
  assert.equal(revokedPgQuestion.response.answerOrigin, 'BATCH_CONFIRMED');
  assert.equal(revokedPgQuestion.protected, null);
  assert.equal(/officialAnswer|acceptedOptions|isCorrect|"points"|solutionComparisons/.test(
    JSON.stringify(revokedPgQuestion)
  ), false);
  await assert.rejects(
    () => service.getLearningHistoryReport(
      openStudent.id, openCommitted.batch.learningSubmissionId, '2'
    ),
    (error) => error.code === 'OPEN_REVIEW_REVOKED'
  );
  assert.equal(await secondStore.authorizeBatchExtractionProviderCall({
    workItemId: openSecondClaim.job.workItem.id,
    workerId: openSecondClaim.job.workItem.leaseOwner,
    leaseToken: openSecondClaim.job.workItem.leaseToken,
    inputHash: openSecondClaim.job.workItem.inputHash,
    deletionGeneration: openSecondClaim.job.workItem.deletionGeneration,
    now: new Date('2026-08-20T12:00:03.600Z')
  }), false);
  const revokedGateway = {
    calls: [],
    async decomposeChunk(...args) {
      this.calls.push(args);
      throw new Error('provider must not run without post-revoke authorization');
    }
  };
  const revokedExtractionWorker = new BatchExtractionWorker({
    store: secondStore, service: secondService, gatewayClient: revokedGateway,
    workerId: 'pg-open-second-extractor', leaseMs: 120_000,
    clock: () => new Date('2026-08-20T12:00:03.600Z')
  });
  assert.deepEqual(await revokedExtractionWorker.processClaimed(openSecondClaim.job),
    { processed: false, staleWrite: true });
  assert.equal(revokedGateway.calls.length, 0,
    'a claim cancelled by committed revoke cannot begin a new provider authorization');
  const revokedOpenBatch = await service.getLearningBatch(
    openStudent.id, openAttemptId, openClaimedBatchId
  );
  assert.equal(revokedOpenBatch.batch.result, null);
  assert.equal(revokedOpenBatch.batch.resultWithheldReason, 'OPEN_REVIEW_REVOKED');
  assert.ok(revokedOpenBatch.batch.confirmation);
  assert.equal(/correctOption|acceptedOptions|isCorrect|"points"/.test(JSON.stringify(revokedOpenBatch)), false);
  const pgOpenEntitlements = await store.withAttemptLock(openAttemptId, async (tx) => ({
    existing: await tx.getLearningEntitlement({ purpose: 'EXISTING_WORK' }),
    cleanup: await tx.getLearningEntitlement({ purpose: 'CLEANUP' })
  }));
  assert.equal(pgOpenEntitlements.existing.allowed, false);
  assert.equal(pgOpenEntitlements.cleanup.allowed, true);
  const deletedOpenBatch = await service.deleteLearningBatch(
    openStudent.id, openAttemptId, openClaimedBatchId, `pg-open-delete-${randomUUID()}`
  );
  assert.equal(deletedOpenBatch.batch.result, null);
  assert.equal(/correctOption|acceptedOptions|isCorrect|"points"/.test(JSON.stringify(deletedOpenBatch)), false);
  const officialAfterOpenLifecycle = await store.pool.query(
    `SELECT (SELECT count(*)::integer FROM amc_practice.submissions) AS submissions,
            (SELECT count(*)::integer FROM amc_practice.submission_answers) AS answers`
  );
  assert.deepEqual(officialAfterOpenLifecycle.rows, officialBeforeOpen.rows,
    'OPEN_REVIEW v1/v2, report, revocation, and cleanup never touch official tables');
  const learningDeletedAt = new Date('2026-08-20T12:00:03.650Z');
  await store.pool.query(
    `UPDATE amc_practice.learning_submissions
     SET lifecycle_status = 'DELETED', deleted_at = $2,
         deletion_generation = deletion_generation + 1, updated_at = $2
     WHERE id = $1`,
    [openCommitted.batch.learningSubmissionId, learningDeletedAt]
  );
  const pgTombstone = await service.getLearningHistory(
    openStudent.id, openCommitted.batch.learningSubmissionId
  );
  assert.equal(pgTombstone.lifecycleStatus, 'DELETED');
  assert.equal(pgTombstone.title, null);
  assert.equal(pgTombstone.formId, null);
  assert.equal(pgTombstone.formVersion, null);
  assert.equal(pgTombstone.protectedAccessStatus, 'RECORD_DELETED');
  assert.ok(pgTombstone.versions.every((version) => version.analysisStatus === 'TOMBSTONED'
    && version.resultStatus === 'TOMBSTONED' && version.reportStatus === 'TOMBSTONED'));
  assert.equal(/"(?:questionNumbers|responseCount|mappedQuestionCount|batchLineage|officialAnswer|reasoningText|analysis)":/.test(
    JSON.stringify(pgTombstone.versions)
  ), false);
  const pgTombstoneList = await service.listLearningHistory(openStudent.id, { limit: '20' });
  const listedPgTombstone = pgTombstoneList.items.find((item) =>
    item.submissionId === openCommitted.batch.learningSubmissionId);
  assert.equal(listedPgTombstone.title, null);
  assert.equal(listedPgTombstone.protectedAccessStatus, 'RECORD_DELETED');
  await assert.rejects(
    () => service.getLearningHistoryQuestion(
      openStudent.id, openCommitted.batch.learningSubmissionId, '2', '1'
    ),
    (error) => error.code === 'LEARNING_HISTORY_DELETED'
  );
  await assert.rejects(
    () => service.getLearningHistoryReport(
      openStudent.id, openCommitted.batch.learningSubmissionId, '2'
    ),
    (error) => error.code === 'LEARNING_HISTORY_DELETED'
  );
  await assert.rejects(
    () => store.pool.query(
      `UPDATE amc_practice.open_review_release_events SET reason_code = 'MUTATED'
       WHERE release_id = $1 AND event_type = 'PUBLISHED'`, [openRelease.id]
    ),
    (error) => error.code === 'P0001' && /append-only/.test(error.message)
  );

  // The database is the final arbiter for release-vs-release races across
  // distinct form IDs that nevertheless contain the same question bundle.
  const activeReleaseRaceBundle = createHash('sha256')
    .update(`active-release-race:${randomUUID()}`).digest('hex');
  const activeReleaseLeft = await openCandidate('active-race-left', activeReleaseRaceBundle);
  const activeReleaseRight = await openCandidate('active-race-right', activeReleaseRaceBundle);
  const activeReleaseRace = await Promise.allSettled([
    store.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: activeReleaseLeft.form.id,
      formVersion: activeReleaseLeft.form.version, contextSetId: activeReleaseLeft.context.id,
      authorityId: 'operator:postgres-open-review', reasonCode: 'ACTIVE_RELEASE_RACE_LEFT',
      now: new Date('2026-08-20T12:00:03.700Z')
    }),
    secondStore.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: activeReleaseRight.form.id,
      formVersion: activeReleaseRight.form.version, contextSetId: activeReleaseRight.context.id,
      authorityId: 'operator:postgres-open-review', reasonCode: 'ACTIVE_RELEASE_RACE_RIGHT',
      now: new Date('2026-08-20T12:00:03.700Z')
    })
  ]);
  assert.equal(activeReleaseRace.filter((result) => result.status === 'fulfilled').length, 1);
  const rejectedActiveRelease = activeReleaseRace.find((result) => result.status === 'rejected');
  assert.equal(rejectedActiveRelease.reason.code, 'OPEN_REVIEW_ACTIVE_CONFLICT');
  assert.equal((await store.pool.query(
    `SELECT count(*)::integer AS count FROM amc_practice.open_review_releases
     WHERE question_bundle_hash = $1 AND status = 'ACTIVE'`, [activeReleaseRaceBundle]
  )).rows[0].count, 1);

  // Every delivery-mode race locks the bundle before a form row. Across two
  // pools exactly one side commits, including clones with different form IDs.
  const attemptRaceBundle = createHash('sha256').update(`attempt-race:${randomUUID()}`).digest('hex');
  const attemptOpen = await openCandidate('attempt-race-open', attemptRaceBundle);
  const attemptTimedForm = {
    ...learningReviewForm(), id: `pg-open-attempt-race-timed-${randomUUID()}`, version: 'timed-v1',
    contentHash: createHash('sha256').update(randomUUID()).digest('hex'),
    questionBundleHash: attemptRaceBundle,
    manifestHash: createHash('sha256').update(randomUUID()).digest('hex')
  };
  attemptTimedForm.sourceManifestHash = attemptTimedForm.manifestHash;
  await store.importForm(attemptTimedForm, { publish: false, allowTestOnlyPublish: true });
  const attemptDeliveryRace = await Promise.allSettled([
    store.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: attemptOpen.form.id, formVersion: attemptOpen.form.version,
      contextSetId: attemptOpen.context.id, authorityId: 'operator:postgres-open-review',
      reasonCode: 'ATTEMPT_RACE_RELEASE', now: new Date('2026-08-20T12:00:04.000Z')
    }),
    secondStore.pool.query(
      `INSERT INTO amc_practice.attempts
       (id, student_id, form_id, form_version, duration_ms, attempt_mode, phase, clock_state,
        active_elapsed_ms, clock_started_at, answers_revision, reasoning_revision, state_revision,
        created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'TIMED','TIMED','RUNNING',0,$6,0,0,0,$6,$6)`,
      [randomUUID(), openStudent.id, attemptTimedForm.id, attemptTimedForm.version,
        attemptTimedForm.durationMs, new Date('2026-08-20T12:00:04.000Z')]
    )
  ]);
  assert.equal(attemptDeliveryRace.filter((result) => result.status === 'fulfilled').length, 1);
  const attemptFenceCount = await store.pool.query(
    `SELECT
       (SELECT count(*)::integer FROM amc_practice.open_review_releases
          WHERE question_bundle_hash = $1) +
       (SELECT count(*)::integer FROM amc_practice.attempts a
          JOIN amc_practice.form_revisions f ON f.form_id = a.form_id AND f.version = a.form_version
          WHERE a.attempt_mode = 'TIMED' AND f.question_bundle_hash = $1) AS count`,
    [attemptRaceBundle]
  );
  assert.equal(attemptFenceCount.rows[0].count, 1);

  const publishRaceBundle = createHash('sha256').update(`publish-race:${randomUUID()}`).digest('hex');
  const publishOpen = await openCandidate('publish-race-open', publishRaceBundle);
  const publishTimedForm = {
    ...learningReviewForm(), id: `pg-open-publish-race-timed-${randomUUID()}`, version: 'timed-v1',
    contentHash: createHash('sha256').update(randomUUID()).digest('hex'),
    questionBundleHash: publishRaceBundle,
    manifestHash: createHash('sha256').update(randomUUID()).digest('hex')
  };
  publishTimedForm.sourceManifestHash = publishTimedForm.manifestHash;
  await store.importForm(publishTimedForm, { publish: false, allowTestOnlyPublish: true });
  const publicationDeliveryRace = await Promise.allSettled([
    store.publishOpenReviewRelease({
      releaseId: randomUUID(), formId: publishOpen.form.id, formVersion: publishOpen.form.version,
      contextSetId: publishOpen.context.id, authorityId: 'operator:postgres-open-review',
      reasonCode: 'PUBLICATION_RACE_RELEASE', now: new Date('2026-08-20T12:00:05.000Z')
    }),
    secondStore.importForm(publishTimedForm, { publish: true, allowTestOnlyPublish: true })
  ]);
  assert.equal(publicationDeliveryRace.filter((result) => result.status === 'fulfilled').length, 1);
  const publicationFenceCount = await store.pool.query(
    `SELECT
       (SELECT count(*)::integer FROM amc_practice.open_review_releases
          WHERE question_bundle_hash = $1) +
       (SELECT count(*)::integer FROM amc_practice.form_revisions
          WHERE published = true AND question_bundle_hash = $1) AS count`,
    [publishRaceBundle]
  );
  assert.equal(publicationFenceCount.rows[0].count, 1);

  const secondHistoryAttempt = await service.createAttempt(reviewStudent.id, reviewForm.id);
  const secondHistoryFinal = await service.final(
    reviewStudent.id, secondHistoryAttempt.attempt.id, `pg-history-second-final-${randomUUID()}`, {
      expectedAnswersRevision: secondHistoryAttempt.attempt.answersRevision,
      expectedStateRevision: secondHistoryAttempt.attempt.stateRevision
    }
  );
  const sameHistoryUpdatedAt = new Date('2026-08-21T12:00:00.000Z');
  await store.pool.query(
    `UPDATE amc_practice.learning_submissions
     SET updated_at = $1
     WHERE id = ANY($2::uuid[])`,
    [sameHistoryUpdatedAt, [reviewFinal.learningSubmission.id, secondHistoryFinal.learningSubmission.id]]
  );
  const historyPageStateBefore = await store.pool.query(historyStateSql);
  const firstHistoryPage = await service.listLearningHistory(reviewStudent.id, { limit: '1' });
  const secondHistoryPage = await service.listLearningHistory(reviewStudent.id, {
    limit: '1', cursor: firstHistoryPage.nextCursor
  });
  assert.equal(firstHistoryPage.items.length, 1);
  assert.equal(secondHistoryPage.items.length, 1);
  assert.equal(secondHistoryPage.nextCursor, null);
  assert.deepEqual(
    [firstHistoryPage.items[0].submissionId, secondHistoryPage.items[0].submissionId],
    [reviewFinal.learningSubmission.id, secondHistoryFinal.learningSubmission.id]
      .sort((left, right) => right.localeCompare(left)),
    'same-timestamp PostgreSQL pages use UUID as the stable, gap-free tie-breaker'
  );
  assert.deepEqual((await store.pool.query(historyStateSql)).rows, historyPageStateBefore.rows);

  const explainClient = await store.pool.connect();
  try {
    await explainClient.query('BEGIN');
    await explainClient.query('SET LOCAL enable_seqscan = off');
    const explain = await explainClient.query(
      `EXPLAIN (FORMAT JSON)
       SELECT id, updated_at
       FROM amc_practice.learning_submissions
       WHERE student_id = $1 AND (updated_at, id) < ($2::timestamptz, $3::uuid)
       ORDER BY updated_at DESC, id DESC LIMIT 2`,
      [reviewStudent.id, sameHistoryUpdatedAt, firstHistoryPage.items[0].submissionId]
    );
    assert.match(JSON.stringify(explain.rows[0]['QUERY PLAN']),
      /amc_learning_submissions_history_page_idx/,
      'the bounded keyset query is backed by the student/updated_at/id index');
    const batchActivityExplain = await explainClient.query(
      `EXPLAIN (FORMAT JSON)
       SELECT max(updated_at)
       FROM amc_practice.learning_batches
       WHERE learning_submission_id = $1`,
      [reviewFinal.learningSubmission.id]
    );
    assert.match(JSON.stringify(batchActivityExplain.rows[0]['QUERY PLAN']),
      /amc_learning_batches_submission_activity_idx/,
      'lastActivityAt uses the submission-scoped batch activity index');
  } finally {
    await explainClient.query('ROLLBACK').catch(() => {});
    explainClient.release();
  }

  await service.reset(reviewStudent.id, reviewAttempt.attempt.id, 'pg-review-reset-1');
  assert.equal((await service.getLearningReport(reviewStudent.id, reviewAttempt.attempt.id)).status, 'COMPLETE');
});
