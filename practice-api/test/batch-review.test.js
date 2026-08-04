import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { buildApp } from '../src/app.js';
import { segmentBatchGatewaySources } from '../src/batch-ingest/domain.js';
import { isCompleteBatchReviewContext } from '../src/batch-review/domain.js';
import { ApiError } from '../src/errors.js';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { ApprovedContextImporter, validateApprovedContextArtifact } from '../src/learning-review/artifact.js';
import { canonicalHash, canonicalJson } from '../src/learning-review/canonical.js';
import { LearningReviewWorker } from '../src/learning-review/worker.js';
import { MemoryStore } from '../src/memory-store.js';
import { PracticeService } from '../src/service.js';
import { archiveReleaseFixture } from './archive-fixture.js';
import {
  approvedContextArtifact,
  approvalReceiptsForArtifact,
  FakeInferenceClient,
  learningReviewForm,
  pythonV2ApprovedArchiveFixture,
  TRUSTED_APPROVAL_AUTHORITIES
} from './learning-review-fixture.js';

const NOW = new Date('2026-08-21T12:00:00.000Z');
const ALL_QUESTIONS = Array.from({ length: 25 }, (_, index) => index + 1);
const APP_CONFIG = {
  basePath: '/api/amc12', bodyLimit: 64 * 1024,
  sessionSecret: 'batch-review-test-cookie-secret-that-is-long-enough',
  sessionTtlMs: 12 * 60 * 60 * 1000,
  cookieName: 'amc_session', csrfCookieName: 'amc_csrf', cookiePath: '/api/amc12',
  secureCookies: false, trustedProxy: 'loopback', corsOrigin: null, reasoningWritesPerMinute: 30
};

function cookies(response) {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values])
    .map((value) => value.split(';')[0]).join('; ');
}

async function fixture(t, { enabled = true, contextReady = true } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'amc-batch-review-'));
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  const privateUploadStore = new PrivateUploadStore({ root, highWatermarkPercent: 100 });
  await privateUploadStore.init();
  const store = new MemoryStore();
  const service = new PracticeService({
    store,
    privateUploadStore,
    authPepper: 'batch-review-test-pepper-that-is-long-enough-for-tests',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    allowTestOnlyImport: true,
    allowTestOnlyPublish: true,
    batchIntakeEnabled: true,
    batchReviewEnabled: enabled,
    clock: () => new Date(NOW)
  });
  const form = learningReviewForm();
  await store.importForm(form, { publish: true, allowTestOnlyPublish: true });
  let approvedContext = null;
  if (contextReady) {
    const artifact = approvedContextArtifact(form, { readyNumbers: ALL_QUESTIONS });
    [approvedContext] = await new ApprovedContextImporter({
      store, clock: () => new Date(NOW), trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
    }).import(artifact, approvalReceiptsForArtifact(artifact));
  }
  const student = await service.seedAccessCode({
    code: 'batch-review-student-code', displayName: 'Batch Review Student'
  });
  return { store, service, form, student, privateUploadStore, approvedContext };
}

function decompositionOutput(prepared) {
  return prepared.plan.chunks.map((chunk, index) => {
    const segments = segmentBatchGatewaySources(chunk.sources);
    const segment = segments[0];
    return {
      schema: 'amc-batch-decomposition-v1',
      correlationId: prepared.plan.correlationId,
      inputHash: chunk.inputHash,
      planHash: chunk.planHash,
      chunkId: chunk.chunkId,
      items: index === 0 ? [{
        itemKey: 'student-q1',
        candidateQuestionNumbers: [1],
        proposedQuestionNumber: 1,
        answer: 'A',
        reasoningSummary: 'The student used a direct algebraic calculation.',
        confidence: 0.98,
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
      }] : [],
      unmappedSpans: index === 0 ? [] : segments.map((item) => ({
        segmentId: item.segmentId,
        assetId: item.assetId,
        startByte: item.startByte,
        endByte: item.endByte,
        sha256: item.sha256,
        reason: 'NO_QUESTION_MATCH'
      }))
    };
  });
}

function gatewayMetadata(prepared) {
  return prepared.plan.chunks.map((chunk) => ({
    chunkId: chunk.chunkId,
    inputHash: chunk.inputHash,
    provider: 'openai',
    requestedModel: 'gpt-5.6-terra',
    responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1',
    schemaVersion: 'amc-batch-decomposition-v1',
    usage: {
      inputTokens: 500, cachedInputTokens: 50, outputTokens: 100,
      totalTokens: 600, reasoningTokens: 20
    }
  }));
}

async function prepareQuestionOneBatch(context, workspaceId, prefix) {
  const text = 'Question 1: A. I used a direct algebraic calculation.';
  const size = Buffer.byteLength(text);
  const created = await context.service.createLearningBatch(
    context.student.id, workspaceId, `${prefix}-create`,
    { files: [{ displayName: 'answers.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: size }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, workspaceId, created.batch.id, created.batch.assets[0].id,
    `${prefix}-upload`, Readable.from([text]), size
  );
  await context.service.submitLearningBatch(
    context.student.id, workspaceId, created.batch.id, `${prefix}-submit`
  );
  const claimed = await context.store.claimNextAiWork({
    workerId: `${prefix}-extractor`, now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  const prepared = await context.service.prepareLearningBatchDecomposition(
    context.student.id, workspaceId, created.batch.id
  );
  const decomposed = await context.service.recordLearningBatchDecomposition(
    context.student.id, workspaceId, created.batch.id,
    {
      masterPlanHash: prepared.plan.masterPlanHash,
      outputs: decompositionOutput(prepared),
      runMetadata: gatewayMetadata(prepared),
      workerFence: {
        workerId: claimed.job.workItem.leaseOwner,
        leaseToken: claimed.job.workItem.leaseToken,
        inputHash: claimed.job.workItem.inputHash,
        deletionGeneration: claimed.job.workItem.deletionGeneration
      }
    }
  );
  const item = decomposed.batch.mapping.items.find((candidate) => !candidate.unmapped);
  return { batchId: created.batch.id, decomposed, item };
}

async function confirmPreparedQuestionOneBatch(context, workspaceId, prefix, prepared) {
  return context.service.confirmLearningBatch(
    context.student.id, workspaceId, prepared.batchId, `${prefix}-confirm`,
    {
      mappingRevision: prepared.decomposed.batch.mapping.revision,
      responses: [{
        questionNumber: 1,
        selectedOption: 'A',
        reasoningText: prepared.item.evidenceText,
        sourceItemIds: [prepared.item.id]
      }],
      discardedItemIds: prepared.decomposed.batch.mapping.items
        .filter((candidate) => candidate.unmapped).map((candidate) => candidate.id)
    }
  );
}

async function commitQuestionOneBatch(context, workspaceId, prefix) {
  const prepared = await prepareQuestionOneBatch(context, workspaceId, prefix);
  return confirmPreparedQuestionOneBatch(context, workspaceId, prefix, prepared);
}

test('batch review migration freezes the context-late anchor and revalidates context-status repair', async () => {
  const sql = await readFile(new URL('../migrations/014_batch_review_workspace.sql', import.meta.url), 'utf8');
  assert.match(sql, /attempt_mode IN \('TIMED', 'OPEN_REVIEW', 'BATCH_REVIEW'\)/);
  assert.match(sql, /creation_reason = 'BATCH_REVIEW_ANCHOR'[\s\S]*context_status = 'CONTEXT_UNAVAILABLE'[\s\S]*context_set_id IS NULL/);
  assert.match(sql, /UPDATE OF learning_submission_id, creation_reason, context_status, context_set_id/);
  assert.match(sql, /AND 25 = \([\s\S]*SELECT count\(\*\) FROM amc_practice\.form_questions/);
  assert.match(sql, /revision\.published = true/);
  assert.match(sql, /revision\.published_at IS NOT NULL/);
});

test('approved-context v2 migration keeps explicit row pairing and immutable audit lineage', async () => {
  const sql = await readFile(new URL('../migrations/015_approved_context_v2.sql', import.meta.url), 'utf8');
  assert.match(sql, /amc_approved_context_v1_v2_header_pairing/);
  assert.match(sql, /amc_approved_context_solution_v1_v2_pairing/);
  assert.match(sql, /amc_approved_context_solution_v2_provenance/);
  assert.match(sql, /approval_policy_version[\s\S]*review_schema_version[\s\S]*review_governance/);
  assert.match(sql, /candidate_provenance[\s\S]*review_method[\s\S]*review_model[\s\S]*operator_authorization_id/);
  assert.match(sql, /UPDATE OF context_set_id, context_schema_version,[\s\S]*reviewer_id, candidate_provenance/);
  assert.match(sql, /NEW\.reviewer_id = NEW\.candidate_provenance->>'authorId'/);
  assert.match(sql, /approved context audit lineage is immutable after import/);
  assert.match(sql, /sealed[\s\S]*declared_question_count/);
  assert.match(sql, /approved context seal child counts are inconsistent/);
  assert.match(sql, /approved context content is immutable after insert/);
  assert.match(sql, /runtime context reference requires a sealed context/);
  assert.match(sql, /amc_published_form_has_timestamp/);
  assert.match(sql, /content_sealed[\s\S]*sealed form questions are immutable/);
  assert.match(sql, /choice\.value \?& ARRAY\['option', 'textMarkdown'\]/);
  assert.ok(sql.includes("(choice.value->>'textMarkdown') !~ '[^[:space:]]'"));
  assert.ok(sql.includes("question.prompt_markdown !~ '[^[:space:]]'"));
  assert.match(sql, /pg_advisory_xact_lock\(hashtext\(NEW\.form_id\), hashtext\(NEW\.form_version\)\)/);
  assert.match(sql, /learning_submissions submission[\s\S]*source_type = 'BATCH_REVIEW'/);
  assert.match(sql, /NEW\.approval_policy_version[\s\S]*NEW\.review_schema_version[\s\S]*NEW\.review_governance/);
  assert.match(sql, /DROP TRIGGER amc_guard_released_context_solution[\s\S]*CREATE TRIGGER amc_guard_released_context_solution/);
});

test('readiness migrations gate exact-form creation while preserving historical read and Tutor access', async () => {
  const readiness = await readFile(
    new URL('../migrations/016_batch_review_readiness_gate.sql', import.meta.url), 'utf8'
  );
  const historical = await readFile(
    new URL('../migrations/017_batch_review_historical_access.sql', import.meta.url), 'utf8'
  );
  assert.match(readiness,
    /batch_review_context_is_complete\([\s\S]*revision\.form_id, revision\.version, context\.id/);
  assert.match(readiness, /new batch review anchor must pin a complete active context/);
  assert.match(readiness, /pg_advisory_xact_lock\(hashtext\(NEW\.form_id\), hashtext\(NEW\.form_version\)\)/);
  assert.match(historical, /purpose IN \('EXISTING_WORK', 'CLEANUP'\)/);
  assert.match(historical, /purpose = 'NEW_BATCH' AND form\.published/);
  assert.match(historical,
    /SELECT version\.context_set_id INTO batch_anchor_context[\s\S]*version_number = 1[\s\S]*creation_reason = 'BATCH_REVIEW_ANCHOR'/);
  assert.match(historical,
    /NEW\.context_set_id IS DISTINCT FROM batch_anchor_context[\s\S]*commit context must equal its version-one anchor context/);
  assert.match(historical,
    /GROUP BY version\.batch_id[\s\S]*HAVING count\(\*\) > 1[\s\S]*ERRCODE = '23505'/);
  assert.match(historical,
    /CREATE UNIQUE INDEX amc_learning_version_one_per_batch_idx[\s\S]*WHERE batch_id IS NOT NULL/);
});

test('batch review context completeness requires the AMC12 25-question invariant', () => {
  const form = { ...learningReviewForm(), published: true, publishedAt: NOW };
  const context = {
    active: true,
    sealed: true,
    formId: form.id,
    formVersion: form.version,
    releaseBinding: {
      manifestHash: form.manifestHash,
      contentHash: form.contentHash,
      questionBundleHash: form.questionBundleHash
    },
    questions: form.questions.map((question) => ({
      questionNumber: question.number,
      modelEligibleSolutionCount: 2,
      solutions: [1, 2].map(() => ({
        modelEligibility: { eligible: true },
        authorityReceipt: { status: 'active' }
      }))
    }))
  };
  assert.equal(isCompleteBatchReviewContext(form, context), true);
  assert.equal(isCompleteBatchReviewContext(
    { ...form, questions: form.questions.slice(0, 24) },
    { ...context, questions: context.questions.slice(0, 24) }
  ), false);
});

test('batch review entry is independently fail-closed in config projection and service', async (t) => {
  const context = await fixture(t, { enabled: false });
  const forms = await context.service.listForms();
  assert.equal(forms[0].batchIntakeAvailable, true);
  assert.equal(forms[0].batchReviewAvailable, false);
  await assert.rejects(
    () => context.service.createBatchReviewWorkspace(
      context.student.id, context.form.id, context.form.version, 'disabled-batch-review'
    ),
    (error) => error instanceof ApiError
      && error.statusCode === 503 && error.code === 'BATCH_REVIEW_UNAVAILABLE'
  );
});

test('a disabled API gate cannot strand already accepted batch-review extraction work', async (t) => {
  const context = await fixture(t);
  const workspace = await context.service.createBatchReviewWorkspace(
    context.student.id, context.form.id, context.form.version, 'worker-drain-workspace'
  );
  const text = 'Question 1: A. I used a direct algebraic calculation.';
  const size = Buffer.byteLength(text);
  const created = await context.service.createLearningBatch(
    context.student.id, workspace.workspace.id, 'worker-drain-create',
    { files: [{ displayName: 'answer.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: size }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, workspace.workspace.id, created.batch.id, created.batch.assets[0].id,
    'worker-drain-upload', Readable.from([text]), size
  );
  await context.service.submitLearningBatch(
    context.student.id, workspace.workspace.id, created.batch.id, 'worker-drain-submit'
  );

  const workerService = new PracticeService({
    store: context.store,
    privateUploadStore: context.privateUploadStore,
    authPepper: 'batch-review-test-pepper-that-is-long-enough-for-tests',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    batchIntakeEnabled: false,
    batchReviewEnabled: false,
    clock: () => new Date(NOW)
  });
  const claimed = await context.store.claimNextAiWork({
    workerId: 'worker-drain-extractor', now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  const prepared = await workerService.prepareLearningBatchDecomposition(
    context.student.id, workspace.workspace.id, created.batch.id
  );
  const recorded = await workerService.recordLearningBatchDecomposition(
    context.student.id, workspace.workspace.id, created.batch.id,
    {
      masterPlanHash: prepared.plan.masterPlanHash,
      outputs: decompositionOutput(prepared),
      runMetadata: gatewayMetadata(prepared),
      workerFence: {
        workerId: claimed.job.workItem.leaseOwner,
        leaseToken: claimed.job.workItem.leaseToken,
        inputHash: claimed.job.workItem.inputHash,
        deletionGeneration: claimed.job.workItem.deletionGeneration
      }
    }
  );
  assert.equal(recorded.batch.status, 'NEEDS_CONFIRMATION');
  await assert.rejects(
    () => workerService.confirmLearningBatch(
      context.student.id, workspace.workspace.id, created.batch.id, 'worker-drain-confirm',
      {
        mappingRevision: recorded.batch.mapping.revision,
        responses: [],
        discardedItemIds: recorded.batch.mapping.items.map((item) => item.id)
      }
    ),
    (error) => error instanceof ApiError && error.statusCode === 503
      && error.code === 'BATCH_INTAKE_UNAVAILABLE'
  );
});

test('missing exact approved context is unavailable in catalog and workspace creation is zero-write', async (t) => {
  const context = await fixture(t, { contextReady: false });
  const [catalogForm] = await context.service.listForms();
  assert.equal(catalogForm.batchIntakeAvailable, false);
  assert.equal(catalogForm.batchReviewAvailable, false);
  assert.equal((await context.service.getPublicForm(context.form.id)).batchIntakeAvailable, false);
  assert.equal((await context.service.getPublicFormVersion(
    context.form.id, context.form.version
  )).batchReviewAvailable, false);

  const before = {
    attempts: context.store.attempts.size,
    submissions: context.store.learningSubmissions.size,
    versions: context.store.learningVersions.size,
    idempotency: context.store.idempotency.size
  };
  await assert.rejects(
    () => context.service.createBatchReviewWorkspace(
      context.student.id, context.form.id, context.form.version, 'no-context-direct'
    ),
    (error) => error instanceof ApiError && error.statusCode === 503
      && error.code === 'BATCH_REVIEW_UNAVAILABLE'
  );
  assert.deepEqual({
    attempts: context.store.attempts.size,
    submissions: context.store.learningSubmissions.size,
    versions: context.store.learningVersions.size,
    idempotency: context.store.idempotency.size
  }, before);

  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login',
    payload: { accessCode: 'batch-review-student-code' }
  });
  for (const url of [
    '/api/amc12/forms',
    `/api/amc12/forms/${context.form.id}`,
    `/api/amc12/forms/${context.form.id}/versions/${context.form.version}`
  ]) {
    const catalogResponse = await app.inject({
      method: 'GET', url, headers: { cookie: cookies(login) }
    });
    assert.equal(catalogResponse.statusCode, 200);
    assert.equal(catalogResponse.headers['cache-control'], 'no-store');
  }
  const response = await app.inject({
    method: 'POST',
    url: `/api/amc12/forms/${context.form.id}/versions/${context.form.version}/batch-review-workspace`,
    headers: {
      cookie: cookies(login), 'x-csrf-token': login.json().csrfToken,
      'idempotency-key': 'no-context-http'
    },
    payload: {}
  });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'BATCH_REVIEW_UNAVAILABLE');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.deepEqual({
    attempts: context.store.attempts.size,
    submissions: context.store.learningSubmissions.size,
    versions: context.store.learningVersions.size,
    idempotency: context.store.idempotency.size
  }, before);
});

test('readiness rejects partial, one-eligible, inactive, unsealed, wrong-lineage, and unpublished states', async (t) => {
  const context = await fixture(t, { contextReady: false });
  const importer = new ApprovedContextImporter({
    store: context.store, clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  const available = async () => (await context.service.listForms())
    .find((form) => form.id === context.form.id)?.batchReviewAvailable === true;
  assert.equal(await available(), false, 'no context');

  const partial = approvedContextArtifact(context.form, { readyNumbers: [1] });
  await importer.import(partial, approvalReceiptsForArtifact(partial));
  assert.equal(await available(), false, 'partial context');

  const oneEligible = approvedContextArtifact(context.form, {
    readyNumbers: ALL_QUESTIONS, visualSolutionNumbers: [1], solutionIdentityOffset: 100
  });
  await importer.import(oneEligible, approvalReceiptsForArtifact(oneEligible));
  assert.equal(await available(), false, 'one eligible solution on one question');

  const full = approvedContextArtifact(context.form, {
    readyNumbers: ALL_QUESTIONS, solutionIdentityOffset: 200
  });
  const [stored] = await importer.import(full, approvalReceiptsForArtifact(full));
  assert.equal(await available(), true, 'complete exact context');
  const mutableStored = context.store.approvedContextSets.get(stored.id);
  mutableStored.active = false;
  assert.equal(await available(), false, 'inactive context');
  mutableStored.active = true;
  mutableStored.sealed = false;
  assert.equal(await available(), false, 'unsealed context');
  mutableStored.sealed = true;
  const exactManifestHash = mutableStored.releaseBinding.manifestHash;
  mutableStored.releaseBinding.manifestHash = '0'.repeat(64);
  assert.equal(await available(), false, 'wrong release lineage');
  mutableStored.releaseBinding.manifestHash = exactManifestHash;
  context.store.forms.get(`${context.form.id}\u0000${context.form.version}`).published = false;
  assert.equal(await available(), false, 'unpublished exact revision');
});

test('MemoryStore quarantines an unsealed form revision and will not overwrite it', async (t) => {
  const context = await fixture(t);
  const key = `${context.form.id}\u0000${context.form.version}`;
  context.store.forms.get(key).contentSealed = false;
  assert.equal(await context.store.getForm(context.form.id, context.form.version), null);
  assert.equal((await context.store.listForms({ includeUnpublished: true }))
    .some((form) => form.id === context.form.id), false);
  await assert.rejects(
    () => context.store.importForm(context.form, { publish: true, allowTestOnlyPublish: true }),
    (error) => error?.code === 'FORM_REVISION_NOT_SEALED'
  );
});

test('ready published exact form creates a context-pinned batch workspace and enables Tutor', async (t) => {
  const context = await fixture(t);
  const timed = await context.service.createAttempt(context.student.id, context.form.id);
  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login',
    payload: { accessCode: 'batch-review-student-code' }
  });
  const cookie = cookies(login);
  const csrf = login.json().csrfToken;
  const path = `/api/amc12/forms/${context.form.id}/versions/${context.form.version}/batch-review-workspace`;

  const noCsrf = await app.inject({
    method: 'POST', url: path,
    headers: { cookie, 'idempotency-key': 'batch-review-workspace-api' }, payload: {}
  });
  assert.equal(noCsrf.statusCode, 403);
  const created = await app.inject({
    method: 'POST', url: path,
    headers: {
      cookie, 'x-csrf-token': csrf,
      'idempotency-key': 'batch-review-workspace-api'
    },
    payload: {}
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.headers['cache-control'], 'no-store');
  const workspace = created.json().workspace;
  assert.equal(workspace.attemptMode, 'BATCH_REVIEW');
  assert.equal(workspace.formId, context.form.id);
  assert.equal(workspace.formVersion, context.form.version);
  assert.equal(workspace.lifecycleStatus, 'COMMITTED');
  assert.equal(workspace.protectedAccessStatus, 'AVAILABLE');
  assert.equal(workspace.analysisStatus, 'AWAITING_BATCH');
  assert.equal(workspace.analysisContextStatus, 'READY');
  assert.equal(workspace.batchReviewAvailable, true);
  assert.equal(workspace.form.questions.length, 25);
  assert.equal(/correctOption|acceptedOptions|solutionMarkdown|approvedSolutions/.test(created.body), false);
  assert.notEqual(workspace.id, timed.attempt.id, 'TIMED and BATCH_REVIEW coexist for one exact form');

  const replay = await app.inject({
    method: 'POST', url: path,
    headers: {
      cookie, 'x-csrf-token': csrf,
      'idempotency-key': 'batch-review-workspace-api'
    },
    payload: {}
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().workspace.id, workspace.id);
  const resumed = await context.service.createBatchReviewWorkspace(
    context.student.id, context.form.id, context.form.version, 'batch-review-second-key'
  );
  assert.equal(resumed.created, false);
  assert.equal(resumed.workspace.id, workspace.id);

  const attempt = context.store.attempts.get(workspace.id);
  const learning = context.store.learningSubmissions.get(workspace.id);
  const [anchor] = context.store.learningVersions.get(learning.id);
  assert.equal(attempt.phase, 'BATCH_REVIEW');
  assert.equal(attempt.clockState, 'PAUSED');
  assert.equal(attempt.activeElapsedMs, 0);
  assert.deepEqual(context.store.answers.get(attempt.id), []);
  assert.deepEqual(context.store.reasoningNotes.get(attempt.id), []);
  assert.deepEqual(context.store.submissions.get(attempt.id), []);
  assert.deepEqual(context.store.events.get(attempt.id), []);
  assert.equal(anchor.creationReason, 'BATCH_REVIEW_ANCHOR');
  assert.equal(anchor.contextStatus, 'CONTEXT_READY');
  assert.equal(anchor.contextSetId, context.approvedContext.id);
  assert.deepEqual(context.store.learningWorkItems.get(anchor.id), []);
  assert.ok(context.store.learningResponses.get(anchor.id).every((response) =>
    response.selectedOption === null && response.reasoningText === ''
      && response.answerOrigin === 'BATCH_REVIEW_BLANK' && response.reasoningOrigin === 'NONE'));
  const anchorQuestionResponses = await Promise.all(ALL_QUESTIONS.map((questionNumber) => app.inject({
    method: 'GET',
    url: `/api/amc12/learning-history/${learning.id}/versions/1/questions/${questionNumber}`,
    headers: { cookie }
  })));
  assert.ok(anchorQuestionResponses.every((response) => response.statusCode === 404));
  assert.ok(anchorQuestionResponses.every((response) =>
    !/officialAnswer|acceptedOptions|result/.test(response.body)),
  'a blank BATCH_REVIEW anchor cannot be used as a 25-question answer-key oracle');

  const other = await context.service.seedAccessCode({
    code: 'batch-review-bola-code', displayName: 'Other Student'
  });
  await assert.rejects(
    () => context.service.getBatchReviewWorkspace(other.id, workspace.id),
    (error) => error instanceof ApiError && error.statusCode === 404
      && error.code === 'ATTEMPT_NOT_FOUND'
  );

  const text = 'Question 1: A. I used a direct algebraic calculation.';
  const size = Buffer.byteLength(text);
  const batch = await context.service.createLearningBatch(
    context.student.id, workspace.id, 'batch-review-create-batch',
    { files: [{ displayName: 'answers.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: size }] }
  );
  await context.service.uploadLearningBatchAsset(
    context.student.id, workspace.id, batch.batch.id, batch.batch.assets[0].id,
    'batch-review-upload-body', Readable.from([text]), size
  );
  await context.service.submitLearningBatch(
    context.student.id, workspace.id, batch.batch.id, 'batch-review-submit'
  );
  const claimed = await context.store.claimNextAiWork({
    workerId: 'batch-review-extraction-worker', now: new Date(NOW), leaseMs: 120_000,
    acceptedKinds: ['BATCH_EXTRACTION']
  });
  assert.equal(claimed.kind, 'BATCH_EXTRACTION');
  const prepared = await context.service.prepareLearningBatchDecomposition(
    context.student.id, workspace.id, batch.batch.id
  );
  const decomposed = await context.service.recordLearningBatchDecomposition(
    context.student.id, workspace.id, batch.batch.id,
    {
      masterPlanHash: prepared.plan.masterPlanHash,
      outputs: decompositionOutput(prepared),
      runMetadata: gatewayMetadata(prepared),
      workerFence: {
        workerId: claimed.job.workItem.leaseOwner,
        leaseToken: claimed.job.workItem.leaseToken,
        inputHash: claimed.job.workItem.inputHash,
        deletionGeneration: claimed.job.workItem.deletionGeneration
      }
    }
  );
  const item = decomposed.batch.mapping.items.find((candidate) => !candidate.unmapped);
  const committed = await context.service.confirmLearningBatch(
    context.student.id, workspace.id, batch.batch.id, 'batch-review-confirm',
    {
      mappingRevision: decomposed.batch.mapping.revision,
      responses: [{
        questionNumber: 1,
        selectedOption: 'A',
        reasoningText: item.evidenceText,
        sourceItemIds: [item.id]
      }],
      discardedItemIds: decomposed.batch.mapping.items
        .filter((candidate) => candidate.unmapped).map((candidate) => candidate.id)
    }
  );
  assert.equal(committed.batch.status, 'COMMITTED');
  assert.equal(committed.batch.sourceType, 'BATCH_REVIEW');
  assert.equal(committed.batch.result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  const committedQuestionResponses = await Promise.all(ALL_QUESTIONS.map((questionNumber) => app.inject({
    method: 'GET',
    url: `/api/amc12/learning-history/${learning.id}/versions/2/questions/${questionNumber}`,
    headers: { cookie }
  })));
  assert.equal(committedQuestionResponses[0].statusCode, 200);
  assert.ok(committedQuestionResponses.slice(1).every((response) => response.statusCode === 404));
  assert.ok(committedQuestionResponses.slice(1).every((response) =>
    !/officialAnswer|acceptedOptions|result/.test(response.body)),
  'only the mapped BATCH_COMMIT response is individually readable');
  const queuedWorkspace = await context.service.getBatchReviewWorkspace(context.student.id, workspace.id);
  assert.equal(queuedWorkspace.analysisStatus, 'QUEUED');
  assert.equal(queuedWorkspace.analysisContextStatus, 'READY');
  const queuedReport = await context.service.getLearningReport(context.student.id, workspace.id);
  assert.equal(queuedReport.status, 'QUEUED');
  const loginResult = await context.service.login('batch-review-student-code');
  await assert.rejects(
    () => context.service.createTutorRootThread(
      context.student.id, loginResult.session.id, learning.id, '2', '1', 'batch-review-tutor-blocked'
    ),
    (error) => error instanceof ApiError && error.statusCode === 404
      && error.code === 'TUTOR_RESOURCE_NOT_FOUND'
  );

  const inference = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store,
    inferenceClient: inference,
    workerId: 'batch-review-analysis-worker',
    clock: () => new Date(NOW)
  });
  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'COMPLETE', providerCalls: 1 });
  const report = await context.service.getLearningReport(context.student.id, workspace.id);
  assert.equal(report.status, 'COMPLETE');
  assert.equal(report.questions[0].solutionComparisons.length, 2);
  const tutor = await context.service.createTutorRootThread(
    context.student.id, loginResult.session.id, learning.id, '2', '1', 'batch-review-tutor-ready'
  );
  assert.equal(tutor.thread.thread.sourceType, 'BATCH_REVIEW');
  assert.equal(tutor.thread.question.solutionReferences.length, 2);

  const successor = structuredClone(context.form);
  Object.assign(successor, {
    version: 'review-v2', title: 'Learning review fixture successor',
    contentHash: '7'.repeat(64), questionBundleHash: '8'.repeat(64),
    manifestHash: '9'.repeat(64), sourceManifestHash: '9'.repeat(64)
  });
  await context.store.importForm(successor, { publish: true, allowTestOnlyPublish: true });
  const successorArtifact = approvedContextArtifact(successor, { readyNumbers: ALL_QUESTIONS });
  await new ApprovedContextImporter({
    store: context.store, clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(successorArtifact, approvalReceiptsForArtifact(successorArtifact));
  assert.equal((await context.store.getForm(context.form.id, context.form.version)).published, false);
  assert.equal((await context.service.getBatchReviewWorkspace(context.student.id, workspace.id)).formVersion,
    context.form.version, 'an existing workspace follows its ever-published pinned revision');
  assert.equal((await context.service.getLearningHistoryReport(
    context.student.id, learning.id, '2'
  )).status, 'COMPLETE');
  const successorTutor = await context.service.createTutorRootThread(
    context.student.id, loginResult.session.id, learning.id, '2', '1', 'batch-review-tutor-after-successor'
  );
  assert.equal(successorTutor.thread.thread.formVersion, context.form.version);
  await assert.rejects(
    () => context.service.createBatchReviewWorkspace(
      context.student.id, context.form.id, context.form.version, 'superseded-new-workspace'
    ),
    (error) => error instanceof ApiError && error.statusCode === 404
      && error.code === 'BATCH_REVIEW_NOT_FOUND'
  );
  const successorWorkspace = await context.service.createBatchReviewWorkspace(
    context.student.id, successor.id, successor.version, 'successor-workspace'
  );
  assert.equal(successorWorkspace.created, true);
  assert.equal(successorWorkspace.workspace.formVersion, successor.version);
});

test('an existing workspace is read/delete-only while exact context is partial, then resumes after repair', async (t) => {
  const context = await fixture(t);
  const created = await context.service.createBatchReviewWorkspace(
    context.student.id, context.form.id, context.form.version, 'partial-context-workspace'
  );
  const prepared = await prepareQuestionOneBatch(
    context, created.workspace.id, 'partial-context-batch'
  );
  const partial = approvedContextArtifact(context.form, { readyNumbers: [1] });
  await new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(partial, approvalReceiptsForArtifact(partial));

  const replay = await context.service.createBatchReviewWorkspace(
    context.student.id, context.form.id, context.form.version, 'partial-context-workspace'
  );
  assert.equal(replay.created, false);
  assert.equal(replay.workspace.id, created.workspace.id);
  assert.equal(replay.workspace.batchIntakeAvailable, false,
    'a lost successful response remains replayable but cannot restore intake authority');
  await assert.rejects(
    () => context.service.createBatchReviewWorkspace(
      context.student.id, context.form.id, context.form.version, 'partial-context-new-key'
    ),
    (error) => error instanceof ApiError && error.statusCode === 503
      && error.code === 'BATCH_REVIEW_UNAVAILABLE'
  );

  await assert.rejects(
    () => confirmPreparedQuestionOneBatch(
      context, created.workspace.id, 'partial-context-batch', prepared
    ),
    (error) => error instanceof ApiError && error.statusCode === 503
      && error.code === 'BATCH_REVIEW_UNAVAILABLE'
  );
  await assert.rejects(
    () => context.service.createLearningBatch(
      context.student.id, created.workspace.id, 'partial-context-new-input',
      { files: [{
        displayName: 'blocked.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: 1
      }] }
    ),
    (error) => error instanceof ApiError && error.statusCode === 503
      && error.code === 'BATCH_REVIEW_UNAVAILABLE'
  );
  const learning = context.store.learningSubmissions.get(created.workspace.id);
  const current = context.store.learningVersions.get(learning.id).at(-1);
  assert.equal(current.creationReason, 'BATCH_REVIEW_ANCHOR');
  assert.equal(current.contextStatus, 'CONTEXT_READY');
  assert.equal(current.contextSetId, context.approvedContext.id,
    'workspace creation pins immutable original context lineage');
  assert.equal(context.store.analysisRuns.has(current.id), false);
  const blocked = await context.service.getBatchReviewWorkspace(context.student.id, created.workspace.id);
  assert.equal(blocked.analysisContextStatus, 'UNAVAILABLE');
  assert.equal(blocked.batchIntakeAvailable, false);
  assert.equal(blocked.batchReviewAvailable, false);
  const inference = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: inference,
    workerId: 'partial-context-worker', clock: () => new Date(NOW)
  });
  assert.deepEqual(await worker.runOnce(), { processed: false });
  assert.equal(inference.calls.length, 0);

  const full = approvedContextArtifact(context.form, {
    readyNumbers: ALL_QUESTIONS,
    solutionIdentityOffset: 100,
    solutionBodyLabel: 'repair'
  });
  await new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(full, approvalReceiptsForArtifact(full));
  const committed = await confirmPreparedQuestionOneBatch(
    context, created.workspace.id, 'partial-context-batch-repaired', prepared
  );
  assert.equal(committed.batch.status, 'COMMITTED');
  const committedVersion = context.store.learningVersions.get(learning.id).at(-1);
  assert.equal(committedVersion.contextStatus, 'CONTEXT_READY');
  assert.equal(committedVersion.contextSetId, current.contextSetId,
    'a repaired readiness gate cannot silently rebind the workspace context lineage');
  assert.equal(context.store.analysisRuns.get(committedVersion.id).status, 'QUEUED');
});

test('duplicate active context import is idempotent and does not duplicate analysis work', async (t) => {
  const context = await fixture(t);
  const created = await context.service.createBatchReviewWorkspace(
    context.student.id, context.form.id, context.form.version, 'duplicate-repair-workspace'
  );
  const artifact = approvedContextArtifact(context.form, { readyNumbers: ALL_QUESTIONS });
  const importer = new ApprovedContextImporter({
    store: context.store,
    clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  const [stored] = await importer.import(artifact, approvalReceiptsForArtifact(artifact));

  await commitQuestionOneBatch(context, created.workspace.id, 'duplicate-repair-batch');
  const learning = context.store.learningSubmissions.get(created.workspace.id);
  const current = context.store.learningVersions.get(learning.id).at(-1);
  assert.equal(current.contextStatus, 'CONTEXT_READY');
  assert.equal(current.contextSetId, stored.id);
  assert.equal(context.store.analysisRuns.get(current.id).status, 'QUEUED');

  const [replayed] = await importer.import(artifact, approvalReceiptsForArtifact(artifact));
  assert.equal(replayed.id, stored.id);
  assert.equal(current.contextStatus, 'CONTEXT_READY');
  assert.equal(current.contextSetId, stored.id);
  assert.equal(context.store.analysisRuns.get(current.id).status, 'QUEUED');
  assert.equal([...context.store.analysisRuns.values()]
    .filter((run) => run.learningSubmissionVersionId === current.id).length, 1);
});

test('an r3 archive release exposes batch review for only the one exact context-ready form', async (t) => {
  const context = await fixture(t, { contextReady: false });
  const release = archiveReleaseFixture({ version: 'r3' });
  await context.service.importArchiveRelease(release, { publish: true });
  let archiveForms = (await context.service.listForms())
    .filter((form) => form.version === 'r3');
  assert.equal(archiveForms.length, 48);
  assert.equal(archiveForms.filter((form) => form.batchReviewAvailable).length, 0);

  const targetId = 'amc12-2002-b';
  const { artifact, approvalReceipts } = pythonV2ApprovedArchiveFixture(release, { targetId });
  await new ApprovedContextImporter({
    store: context.store, clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  }).import(artifact, approvalReceipts);
  archiveForms = (await context.service.listForms()).filter((form) => form.version === 'r3');
  assert.deepEqual(archiveForms.filter((form) => form.batchReviewAvailable)
    .map((form) => form.id), [targetId]);
  assert.deepEqual(archiveForms.filter((form) => form.batchIntakeAvailable)
    .map((form) => form.id), [targetId]);
  assert.equal((await context.service.getPublicFormVersion(targetId, 'r3')).batchReviewAvailable, true);
  const unavailable = archiveForms.find((form) => form.id !== targetId);
  assert.equal((await context.service.getPublicFormVersion(
    unavailable.id, unavailable.version
  )).batchReviewAvailable, false);

  const app = await buildApp({ service: context.service, config: APP_CONFIG, logger: false });
  t.after(async () => { await app.close(); });
  const login = await app.inject({
    method: 'POST', url: '/api/amc12/auth/login',
    payload: { accessCode: 'batch-review-student-code' }
  });
  const headers = {
    cookie: cookies(login), 'x-csrf-token': login.json().csrfToken
  };
  const catalog = await app.inject({
    method: 'GET', url: '/api/amc12/forms', headers: { cookie: headers.cookie }
  });
  assert.equal(catalog.statusCode, 200);
  assert.equal(catalog.headers['cache-control'], 'no-store');
  assert.deepEqual(catalog.json().forms
    .filter((form) => form.version === 'r3' && form.batchReviewAvailable)
    .map((form) => form.id), [targetId]);

  const beforeFailedCreate = context.store.attempts.size;
  const denied = await app.inject({
    method: 'POST',
    url: `/api/amc12/forms/${unavailable.id}/versions/r3/batch-review-workspace`,
    headers: { ...headers, 'idempotency-key': 'r3-unavailable-form' }, payload: {}
  });
  assert.equal(denied.statusCode, 503);
  assert.equal(denied.headers['cache-control'], 'no-store');
  assert.equal(context.store.attempts.size, beforeFailedCreate);
  const created = await app.inject({
    method: 'POST',
    url: `/api/amc12/forms/${targetId}/versions/r3/batch-review-workspace`,
    headers: { ...headers, 'idempotency-key': 'r3-ready-form' }, payload: {}
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.json().workspace.formId, targetId);
  assert.equal(created.json().workspace.analysisContextStatus, 'READY');
});

test('real Python v2 archive context enables exact-form batch review and preserves governance through Tutor', async (t) => {
  const context = await fixture(t);
  const release = archiveReleaseFixture({ version: 'archive-python-v2-r1' });
  await context.service.importArchiveRelease(release, { publish: true });
  const targetManifest = release.forms.find((form) => form.id === 'amc12-2012-b');
  assert.ok(targetManifest);
  const memoryRoundTrip = await context.store.getForm(targetManifest.id, targetManifest.version);
  assert.equal(memoryRoundTrip.publishEligible, true);
  assert.equal(memoryRoundTrip.developmentPublishEligible, false);
  const { artifact, approvalReceipts } = pythonV2ApprovedArchiveFixture(release);
  assert.equal(artifact.schemaVersion, 'amc-approved-question-context-archive-set-v2');
  assert.equal(artifact.candidateSetBinding.schemaVersion,
    'amc-question-context-supplemented-archive-candidate-set-v1');
  assert.equal(artifact.forms.length, 1);
  assert.equal(artifact.forms[0].questions.length, 25);
  assert.ok(artifact.forms[0].questions.every((question) => question.approvedSolutions.length === 2));
  const canonicalArtifact = JSON.parse(canonicalJson(artifact));
  const canonicalReceipts = JSON.parse(canonicalJson(approvalReceipts));
  const canonicalValidated = validateApprovedContextArtifact(canonicalArtifact, {
    approvalReceipts: canonicalReceipts,
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  assert.equal(canonicalValidated.forms[0].questions.length, 25);
  assert.ok(canonicalValidated.forms[0].questions.every((question) => question.contextReady));
  const importer = new ApprovedContextImporter({
    store: context.store, clock: () => new Date(NOW),
    trustedAuthorityIds: TRUSTED_APPROVAL_AUTHORITIES
  });
  const [stored] = await importer.import(artifact, approvalReceipts);
  const [replayed] = await importer.import(artifact, approvalReceipts);
  assert.equal(replayed.id, stored.id);
  assert.equal(stored.schemaVersion, 'amc-approved-question-context-set-v2');
  assert.equal(stored.sealed, true);
  assert.equal(stored.declaredQuestionCount, 25);
  assert.equal(stored.approvalPolicyVersion,
    'amc-operator-delegated-ai-assisted-solution-approval-v1');
  assert.deepEqual(stored.reviewGovernance, artifact.reviewGovernance);
  assert.deepEqual(stored.questions[0].solutions[0].candidateProvenance,
    artifact.forms[0].questions[0].approvedSolutions[0].candidateProvenance);
  assert.deepEqual(stored.questions[0].solutions[0].reviewModel,
    artifact.forms[0].questions[0].approvedSolutions[0].approval.reviewModel);
  const supplement = stored.questions[0].solutions.find((solution) =>
    solution.candidateProvenance.origin === 'operator-original-supplement');
  assert.equal(supplement.artifactSolutionId, 'solution-900');
  assert.equal(supplement.sourceRef.path,
    `protected-supplements/${supplement.candidateProvenance.supplementId}.json`);
  assert.equal(supplement.sourceRef.sha256, supplement.candidateProvenance.supplementRecordHash);
  const created = await context.service.createBatchReviewWorkspace(
    context.student.id, targetManifest.id, targetManifest.version, 'v2-archive-workspace'
  );
  await commitQuestionOneBatch(context, created.workspace.id, 'v2-archive-batch');
  const learning = context.store.learningSubmissions.get(created.workspace.id);
  const version = context.store.learningVersions.get(learning.id).at(-1);
  await assert.rejects(
    () => context.store.importApprovedContextSets({
      ...canonicalValidated,
      archiveSetHash: '0'.repeat(64),
      importedAt: new Date(NOW)
    }),
    (error) => error?.code === 'CONTEXT_ARCHIVE_LINEAGE_CONFLICT'
  );
  assert.equal(version.contextStatus, 'CONTEXT_READY');
  assert.equal(version.contextSetId, stored.id);
  assert.equal(context.store.analysisRuns.get(version.id).status, 'QUEUED');

  const inference = new FakeInferenceClient();
  const worker = new LearningReviewWorker({
    store: context.store, inferenceClient: inference,
    workerId: 'python-v2-analysis-worker', clock: () => new Date(NOW)
  });
  assert.deepEqual(await worker.runOnce(), { processed: true, status: 'COMPLETE', providerCalls: 1 });
  assert.equal((await context.service.getLearningReport(
    context.student.id, created.workspace.id
  )).status, 'COMPLETE');
  const login = await context.service.login('batch-review-student-code');
  const tutor = await context.service.createTutorRootThread(
    context.student.id, login.session.id, learning.id, '2', '1', 'python-v2-tutor-root'
  );
  assert.equal(tutor.thread.question.solutionReferences.length, 2);

  for (const [name, mutate] of [
    ['test audience', (value) => {
      value.schemaVersion = 'amc-approved-question-context-test-set-v2';
      value.audience = 'private-test-only';
    }],
    ['mixed v1 policy', (value) => {
      value.approvalPolicyVersion = 'amc-explicit-human-solution-approval-v1';
    }],
    ['unknown field', (value) => { value.untrusted = true; }],
    ['model tamper', (value) => {
      value.forms[0].questions[0].approvedSolutions[0].approval.reviewModel.runId = 'tampered-run';
    }],
    ['authorization tamper', (value) => {
      value.forms[0].questions[0].approvedSolutions[0].approval.operatorAuthorizationId = 'authorization:other';
    }],
    ['question hash tamper', (value) => {
      value.forms[0].questions[0].questionContentHash = '0'.repeat(64);
    }],
    ['forged supplement provenance', (value) => {
      value.forms[0].questions[0].approvedSolutions[0].candidateProvenance = {
        origin: 'operator-original-supplement', supplementId: 'supplement-forged',
        supplementSetHash: '1'.repeat(64), supplementRecordHash: '2'.repeat(64),
        authorId: 'operator:forged', createdAt: '2026-08-03T12:00:00Z',
        rightsStatus: 'operator-attested-original-and-authorized-for-ai-use',
        rightsAuthorizationId: 'authorization:forged'
      };
    }],
    ['wrapper child drift', (value) => {
      value.forms[0].reviewGovernance.operatorAuthorization.authorizedBy = 'operator:drifted';
      value.forms[0].setHash = canonicalHash(value.forms[0], ['setHash']);
      value.setHash = canonicalHash(value, ['setHash']);
    }],
    ['wrapper and child authorizedBy receipt-binding tamper', (value) => {
      value.reviewGovernance.operatorAuthorization.authorizedBy = 'operator:tampered-owner';
      value.forms[0].reviewGovernance.operatorAuthorization.authorizedBy = 'operator:tampered-owner';
      value.forms[0].setHash = canonicalHash(value.forms[0], ['setHash']);
      value.setHash = canonicalHash(value, ['setHash']);
    }],
    ['wrapper and child authorizedAt receipt-binding tamper', (value) => {
      value.reviewGovernance.operatorAuthorization.authorizedAt = '2026-08-03T12:00:01Z';
      value.forms[0].reviewGovernance.operatorAuthorization.authorizedAt = '2026-08-03T12:00:01Z';
      value.forms[0].setHash = canonicalHash(value.forms[0], ['setHash']);
      value.setHash = canonicalHash(value, ['setHash']);
    }],
    ['supplement reviewer is its author', (value) => {
      const supplementSolution = value.forms[0].questions[0].approvedSolutions.find((solution) =>
        solution.candidateProvenance.origin === 'operator-original-supplement');
      supplementSolution.approval.reviewerId = supplementSolution.candidateProvenance.authorId;
    }]
  ]) {
    const invalid = structuredClone(artifact);
    mutate(invalid);
    await assert.rejects(() => importer.import(invalid, approvalReceipts),
      (error) => error instanceof ApiError && error.code === 'INVALID_APPROVED_CONTEXT', name);
  }
});
