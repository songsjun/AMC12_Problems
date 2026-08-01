import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';
import { conflict } from './errors.js';
import { providerRetentionNotBefore } from './infrastructure/assemblyai-retention-profile.js';
import { analysisInputHash, canonicalHash } from './learning-review/canonical.js';
import { ATTEMPT_MODE, OPEN_REVIEW_STATUS, openReviewReleaseHash } from './open-review/domain.js';

const { Pool } = pg;

const clone = (value) => structuredClone(value);

function number(value) {
  return typeof value === 'number' ? value : Number(value);
}

function transcriptionRetryAt(now, attemptCount, retryAfterSeconds) {
  const seconds = Number.isSafeInteger(retryAfterSeconds)
    ? Math.min(3_600, Math.max(1, retryAfterSeconds))
    : Math.min(300, 2 ** Math.min(8, Math.max(0, attemptCount - 1)));
  return new Date(new Date(now).getTime() + seconds * 1_000);
}

function transcriptionCleanupInputHash(batchId, assetId, deletionGeneration) {
  return createHash('sha256')
    .update(`amc-transcription-cleanup-v1\u0000${batchId}\u0000${assetId}\u0000${deletionGeneration}`)
    .digest('hex');
}

async function consumeStudentBudgetUsing(queryable, {
  studentId, budgetKind, units, limit, windowMs, now
}) {
  const nowMs = new Date(now).getTime();
  const windowStartedAtMs = Math.floor(nowMs / windowMs) * windowMs;
  const retryAfterSeconds = Math.max(1,
    Math.ceil((windowStartedAtMs + windowMs - nowMs) / 1_000));
  if (!Number.isSafeInteger(units) || units < 1 || !Number.isSafeInteger(limit)
      || limit < units || !Number.isSafeInteger(windowMs) || windowMs < 1_000) {
    return { allowed: false, retryAfterSeconds };
  }
  const consumed = await queryable.query(
    `INSERT INTO amc_practice.student_resource_budget_windows
     (student_id, budget_kind, window_started_at, window_ms, used_units, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (student_id, budget_kind, window_started_at) DO UPDATE
       SET used_units = student_resource_budget_windows.used_units + EXCLUDED.used_units,
           updated_at = EXCLUDED.updated_at
       WHERE student_resource_budget_windows.window_ms = EXCLUDED.window_ms
         AND student_resource_budget_windows.used_units + EXCLUDED.used_units <= $7
     RETURNING used_units`,
    [studentId, budgetKind, new Date(windowStartedAtMs), windowMs, units, now, limit]
  );
  if (!consumed.rowCount || number(consumed.rows[0].used_units) > limit) {
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true, retryAfterSeconds: 0, usedUnits: number(consumed.rows[0].used_units) };
}

async function consumeGlobalBudgetUsing(queryable, {
  budgetKind, units, limit, windowMs, now
}) {
  const nowMs = new Date(now).getTime();
  const windowStartedAtMs = Math.floor(nowMs / windowMs) * windowMs;
  const retryAfterSeconds = Math.max(1,
    Math.ceil((windowStartedAtMs + windowMs - nowMs) / 1_000));
  if (!Number.isSafeInteger(units) || units < 1 || !Number.isSafeInteger(limit)
      || limit < units || !Number.isSafeInteger(windowMs) || windowMs < 1_000) {
    return { allowed: false, retryAfterSeconds };
  }
  const consumed = await queryable.query(
    `INSERT INTO amc_practice.global_resource_budget_windows
     (budget_kind, window_started_at, window_ms, used_units, updated_at)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (budget_kind, window_started_at) DO UPDATE
       SET used_units = global_resource_budget_windows.used_units + EXCLUDED.used_units,
           updated_at = EXCLUDED.updated_at
       WHERE global_resource_budget_windows.window_ms = EXCLUDED.window_ms
         AND global_resource_budget_windows.used_units + EXCLUDED.used_units <= $6
     RETURNING used_units`,
    [budgetKind, new Date(windowStartedAtMs), windowMs, units, now, limit]
  );
  if (!consumed.rowCount || number(consumed.rows[0].used_units) > limit) {
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true, retryAfterSeconds: 0, usedUnits: number(consumed.rows[0].used_units) };
}

function mapStudent(row) {
  return row && { id: row.id, displayName: row.display_name, createdAt: row.created_at };
}

function mapAccessCode(row) {
  return row && {
    codeHash: row.code_hash,
    studentId: row.student_id,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at
  };
}

function mapSession(row) {
  return row && {
    id: row.id,
    studentId: row.student_id,
    csrfTokenHash: row.csrf_token_hash,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at
  };
}

function mapAttempt(row) {
  return row && {
    id: row.id,
    studentId: row.student_id,
    attemptMode: row.attempt_mode || ATTEMPT_MODE.TIMED,
    formId: row.form_id,
    formVersion: row.form_version,
    durationMs: number(row.duration_ms),
    phase: row.phase,
    clockState: row.clock_state,
    activeElapsedMs: number(row.active_elapsed_ms),
    clockStartedAt: row.clock_started_at,
    answersRevision: row.answers_revision,
    reasoningRevision: row.reasoning_revision ?? 0,
    stateRevision: number(row.state_revision ?? 0),
    limitReachedAt: row.limit_reached_at,
    finalizedAt: row.finalized_at,
    resetAt: row.reset_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSubmission(row) {
  return row && {
    id: row.id,
    attemptId: row.attempt_id,
    kind: row.kind,
    slot: row.slot,
    trigger: row.trigger,
    activeElapsedMs: number(row.active_elapsed_ms),
    scoringPolicy: row.scoring_policy,
    totalPoints: number(row.total_points),
    maximumPoints: number(row.maximum_points),
    answeredCount: row.answered_count,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
    blankCount: row.blank_count,
    unscoredCount: row.unscored_count ?? 0,
    createdAt: row.created_at
  };
}

function mapLearningSubmission(row) {
  return row && {
    id: row.id,
    studentId: row.student_id,
    attemptId: row.attempt_id,
    officialSubmissionId: row.official_submission_id,
    officialSubmissionKind: row.official_submission_kind,
    openReviewReleaseId: row.open_review_release_id || null,
    attemptMode: row.attempt_mode || ATTEMPT_MODE.TIMED,
    formId: row.form_id,
    formVersion: row.form_version,
    sourceType: row.source_type,
    lifecycleStatus: row.lifecycle_status,
    currentVersion: row.current_version,
    deletionGeneration: row.deletion_generation ?? 0,
    deletedAt: row.deleted_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOpenReviewRelease(row) {
  return row && {
    id: row.id,
    schemaVersion: row.schema_version,
    formId: row.form_id,
    formVersion: row.form_version,
    contextSetId: row.context_set_id,
    releaseHash: row.release_hash,
    manifestHash: row.manifest_hash,
    contentHash: row.content_hash,
    questionBundleHash: row.question_bundle_hash,
    contextArtifactSetHash: row.context_artifact_set_hash,
    approvalAuthorityId: row.approval_authority_id,
    status: row.status,
    transitionAuthorityId: row.transition_authority_id,
    transitionReasonCode: row.transition_reason_code,
    publishedAt: row.published_at,
    supersededAt: row.superseded_at,
    revokedAt: row.revoked_at,
    stateRevision: number(row.state_revision),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLearningVersion(row) {
  return row && {
    id: row.id,
    learningSubmissionId: row.learning_submission_id,
    versionNumber: row.version_number,
    formId: row.form_id,
    formVersion: row.form_version,
    answersRevision: row.answers_revision,
    reasoningRevision: row.reasoning_revision,
    creationReason: row.creation_reason,
    batchId: row.batch_id || null,
    contextStatus: row.context_status,
    contextSetId: row.context_set_id,
    evidenceHash: row.evidence_hash,
    createdAt: row.created_at
  };
}

function mapLearningBatch(row) {
  return row && {
    id: row.id, studentId: row.student_id, attemptId: row.attempt_id,
    learningSubmissionId: row.learning_submission_id, baseVersion: row.base_version,
    formId: row.form_id, formVersion: row.form_version, sourceType: row.source_type || 'INTERACTIVE_FINAL', status: row.status,
    mappingRevision: row.mapping_revision, hasAudio: row.has_audio,
    deletionState: row.deletion_state, deletionGeneration: row.deletion_generation,
    deletedAt: row.deleted_at, submittedAt: row.submitted_at, committedAt: row.committed_at,
    failureCode: row.failure_code,
    committedVersionId: row.committed_version_id, committedVersionNumber: row.committed_version_number,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function mapLearningBatchAsset(row) {
  return row && {
    id: row.id, batchId: row.batch_id, position: row.position,
    displayName: row.display_name, kind: row.kind, contentType: row.content_type,
    declaredBytes: number(row.declared_bytes), observedBytes: row.observed_bytes === null ? null : number(row.observed_bytes),
    sha256: row.sha256, storageKey: row.storage_key, status: row.status,
    uploadAttemptCount: row.upload_attempt_count, uploadIdempotencyKey: row.upload_idempotency_key,
    writingStartedAt: row.writing_started_at, storedAt: row.stored_at,
    normalizedAt: row.normalized_at, purgedAt: row.purged_at,
    lastErrorCode: row.last_error_code, createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function mapLearningBatchEvidence(row) {
  return row && {
    assetId: row.asset_id, batchId: row.batch_id, position: row.position,
    sourceKind: row.source_kind, normalizedText: row.normalized_text,
    normalizedSha256: row.normalized_sha256, durationMs: row.duration_ms,
    transcriptConfidence: row.transcript_confidence === null ? null : number(row.transcript_confidence),
    createdAt: row.created_at, purgedAt: row.purged_at
  };
}

function mapLearningBatchWorkItem(row) {
  return row && {
    id: row.id, batchId: row.batch_id, assetId: row.asset_id, workType: row.work_type,
    status: row.status, priority: row.priority, attemptCount: row.attempt_count,
    inputHash: row.input_hash, deletionGeneration: row.deletion_generation,
    availableAt: row.available_at, leaseOwner: row.lease_owner, leaseToken: row.lease_token,
    leaseExpiresAt: row.lease_expires_at, lastErrorCode: row.last_error_code,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function mapProviderOrphanCleanupJob(row) {
  return row && {
    id: row.id, orphanAuditId: row.orphan_audit_id, batchId: row.batch_id,
    cleanupKind: row.cleanup_kind, provider: row.provider, externalId: row.external_id,
    deletionGeneration: row.deletion_generation, status: row.status,
    attemptCount: row.attempt_count, availableAt: row.available_at,
    leaseOwner: row.lease_owner, leaseToken: row.lease_token,
    leaseExpiresAt: row.lease_expires_at, lastErrorCode: row.last_error_code,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function mapLearningBatchMappingItem(row) {
  return row && {
    id: row.id, batchId: row.batch_id, mappingRevision: row.mapping_revision,
    itemPosition: row.item_position, itemKey: row.item_key,
    candidateQuestionNumbers: row.candidate_question_numbers,
    proposedQuestionNumber: row.proposed_question_number, selectedOption: row.selected_option,
    reasoningSummary: row.reasoning_summary, evidenceText: row.evidence_text,
    confidence: number(row.confidence), ambiguity: row.ambiguity, sourceSpans: row.source_spans,
    gatewayConflictFlags: row.gateway_conflict_flags, requiresConfirmation: row.requires_confirmation,
    confirmationReasons: row.confirmation_reasons, unmapped: row.unmapped,
    purgedAt: row.purged_at, createdAt: row.created_at
  };
}

async function loadLearningBatchBundleUsing(queryable, attemptId, batchId = undefined, { lock = false } = {}) {
  const values = batchId === undefined ? [attemptId] : [attemptId, batchId];
  const batches = await queryable.query(
    `SELECT * FROM amc_practice.learning_batches
     WHERE attempt_id = $1 ${batchId === undefined ? '' : 'AND id = $2'}
     ORDER BY created_at DESC, id ${lock ? 'FOR UPDATE' : ''}`,
    values
  );
  const bundles = [];
  for (const row of batches.rows) {
    const batch = mapLearningBatch(row);
    // `queryable` can be a transaction-scoped pg Client. pg no longer
    // supports overlapping queries on one Client, so keep these reads
    // explicitly sequential (the Pool call path remains correct too).
    const assets = await queryable.query(
      'SELECT * FROM amc_practice.learning_batch_assets WHERE batch_id = $1 ORDER BY position', [batch.id]
    );
    const evidence = await queryable.query(
        `SELECT e.*, a.position FROM amc_practice.learning_batch_evidence e
         JOIN amc_practice.learning_batch_assets a ON a.batch_id = e.batch_id AND a.id = e.asset_id
         WHERE e.batch_id = $1 ORDER BY a.position`, [batch.id]
    );
    const mappingHeader = batch.mappingRevision > 0
      ? await queryable.query(
          `SELECT * FROM amc_practice.learning_batch_mapping_revisions
           WHERE batch_id = $1 AND revision = $2`, [batch.id, batch.mappingRevision])
      : { rowCount: 0, rows: [] };
    const work = await queryable.query(
      'SELECT * FROM amc_practice.learning_batch_work_items WHERE batch_id = $1 ORDER BY created_at, id', [batch.id]
    );
    const resultHeader = await queryable.query(
      'SELECT * FROM amc_practice.learning_batch_results WHERE batch_id = $1', [batch.id]
    );
    const provider = await queryable.query(
      'SELECT * FROM amc_practice.learning_batch_provider_artifacts WHERE batch_id = $1 ORDER BY created_at, id', [batch.id]
    );
    const confirmationHeader = await queryable.query(
        `SELECT * FROM amc_practice.learning_batch_confirmation_revisions
         WHERE batch_id = $1 AND mapping_revision = $2`, [batch.id, batch.mappingRevision]
    );
    let mapping = null;
    if (mappingHeader.rowCount) {
      const header = mappingHeader.rows[0];
      const items = await queryable.query(
        `SELECT * FROM amc_practice.learning_batch_mapping_items
         WHERE batch_id = $1 AND mapping_revision = $2 ORDER BY item_position`,
        [batch.id, batch.mappingRevision]
      );
      mapping = {
        batchId: header.batch_id, revision: header.revision, schemaVersion: header.schema_version,
        evidenceSetHash: header.evidence_set_hash, masterPlanHash: header.master_plan_hash,
        chunkInputHashes: header.chunk_input_hashes, gatewayRunMetadata: header.gateway_run_metadata,
        extractionHash: header.extraction_hash,
        status: header.status, createdAt: header.created_at, confirmedAt: header.confirmed_at,
        items: items.rows.map(mapLearningBatchMappingItem)
      };
    }
    let result = null;
    if (resultHeader.rowCount) {
      const header = resultHeader.rows[0];
      const items = await queryable.query(
        `SELECT * FROM amc_practice.learning_batch_result_items
         WHERE batch_result_id = $1 ORDER BY question_number`, [header.id]
      );
      result = {
        id: header.id, batchId: header.batch_id,
        learningSubmissionVersionId: header.learning_submission_version_id,
        scoringScope: header.scoring_scope, scoringPolicy: header.scoring_policy,
        totalPoints: number(header.total_points), maximumPoints: number(header.maximum_points),
        mappedQuestionCount: header.mapped_question_count, answeredCount: header.answered_count,
        correctCount: header.correct_count, incorrectCount: header.incorrect_count,
        blankCount: header.blank_count, unscoredCount: header.unscored_count,
        createdAt: header.created_at,
        items: items.rows.map((item) => ({
          questionNumber: item.question_number, selectedOption: item.selected_option,
          correctOption: item.correct_option, acceptedOptions: item.accepted_options,
          isScored: item.is_scored, isCorrect: item.is_correct, points: number(item.points)
        }))
      };
    }
    let confirmation = null;
    if (confirmationHeader.rowCount) {
      const header = confirmationHeader.rows[0];
      const responses = await queryable.query(
        `SELECT * FROM amc_practice.learning_batch_confirmation_responses
         WHERE batch_id = $1 AND mapping_revision = $2 ORDER BY question_number`,
        [batch.id, batch.mappingRevision]
      );
      confirmation = {
        batchId: header.batch_id, mappingRevision: header.mapping_revision,
        learningSubmissionVersionId: header.learning_submission_version_id,
        sourceEvidenceHash: header.source_evidence_hash, confirmedAt: header.confirmed_at,
        responses: responses.rows.map((response) => ({
          questionNumber: response.question_number, selectedOption: response.selected_option,
          confirmedReasoningText: response.confirmed_reasoning_text,
          confirmedReasoningHash: response.confirmed_reasoning_hash,
          reasoningOrigin: response.reasoning_origin,
          sourceItemIds: response.canonical_source_item_ids,
          sourceDescriptors: response.source_descriptors,
          sourceEvidenceText: response.reconstructed_source_text,
          sourceSpanHash: response.source_span_hash,
          sourceEvidenceHash: response.source_evidence_hash
        }))
      };
    }
    bundles.push({
      batch,
      assets: assets.rows.map(mapLearningBatchAsset),
      evidence: evidence.rows.map(mapLearningBatchEvidence),
      mapping,
      workItems: work.rows.map(mapLearningBatchWorkItem),
      result,
      confirmation,
      providerArtifacts: provider.rows
    });
  }
  return batchId === undefined ? bundles : (bundles[0] || null);
}

function mapLearningWorkItem(row) {
  return row && {
    id: row.id,
    learningSubmissionVersionId: row.learning_submission_version_id,
    workType: row.work_type,
    status: row.status,
    priority: row.priority,
    attemptCount: row.attempt_count,
    inputHash: row.input_hash,
    deletionGeneration: row.deletion_generation,
    availableAt: row.available_at,
    leaseOwner: row.lease_owner,
    leaseToken: row.lease_token,
    leaseExpiresAt: row.lease_expires_at,
    lastErrorCode: row.last_error_code,
    analysisRunId: row.analysis_run_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAnalysisRun(row) {
  return row && {
    id: row.id,
    learningSubmissionVersionId: row.learning_submission_version_id,
    contextSetId: row.context_set_id,
    versionNumber: row.version_number,
    inputHash: row.input_hash,
    evidenceHash: row.evidence_hash,
    deletionGeneration: row.deletion_generation,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lastErrorCode: row.last_error_code
  };
}

function mapQuestionAnalysis(row) {
  return row && {
    questionNumber: row.question_number,
    status: row.status,
    providerInvoked: row.provider_invoked,
    reasoningVerdict: row.reasoning_verdict,
    summaryMarkdown: row.summary_markdown,
    strengths: row.strengths,
    gaps: row.gaps,
    suggestions: row.suggestions,
    solutionComparisons: row.solution_comparisons,
    confidence: row.confidence === null ? null : number(row.confidence),
    outcomeCode: row.outcome_code,
    runMetadata: row.run_metadata,
    errorClass: row.error_class,
    retryable: row.retryable,
    questionInputHash: row.question_input_hash,
    questionContextHash: row.question_context_hash,
    createdAt: row.created_at
  };
}

function mapLearningReport(row) {
  return row && {
    id: row.id,
    analysisRunId: row.analysis_run_id,
    learningSubmissionVersionId: row.learning_submission_version_id,
    status: row.status,
    generatedAt: row.generated_at,
    summary: row.summary,
    reportHash: row.report_hash
  };
}

async function loadApprovedContextSet(queryable, id) {
  const header = await queryable.query('SELECT * FROM amc_practice.approved_context_sets WHERE id = $1', [id]);
  if (!header.rowCount) return null;
  const questions = await queryable.query(
    `SELECT * FROM amc_practice.approved_context_questions
     WHERE context_set_id = $1 ORDER BY question_number`, [id]
  );
  const solutions = await queryable.query(
    `SELECT * FROM amc_practice.approved_context_solutions
     WHERE context_set_id = $1 ORDER BY question_number, solution_position`, [id]
  );
  const byQuestion = new Map();
  for (const row of questions.rows) {
    byQuestion.set(row.question_number, {
      questionNumber: row.question_number,
      questionContentHash: row.question_content_hash,
      promptMarkdown: row.prompt_markdown,
      choices: row.choices,
      visualContext: row.visual_context,
      modelEligibleSolutionCount: number(row.model_eligible_solution_count),
      solutions: []
    });
  }
  for (const row of solutions.rows) {
    byQuestion.get(row.question_number)?.solutions.push({
      solutionPosition: row.solution_position,
      artifactSolutionId: row.artifact_solution_id,
      title: row.title,
      bodyMarkdown: row.body_markdown,
      bodySha256: row.body_sha256,
      sourceRef: {
        path: row.source_path,
        sha256: row.source_sha256,
        headingLine: row.source_heading_line,
        endLine: row.source_end_line
      },
      reviewerId: row.reviewer_id,
      reviewedAt: row.reviewed_at,
      rightsStatus: row.rights_status,
      qualityFlags: row.quality_flags,
      methodTags: row.method_tags,
      modelEligibility: {
        eligible: row.model_eligible,
        reason: row.model_ineligibility_reason
      },
      decisionRecordHash: row.decision_record_hash,
      authorityReceipt: {
        receiptId: row.authority_receipt_id,
        authorityId: row.authority_receipt_authority_id,
        issuedAt: row.authority_receipt_issued_at,
        status: row.authority_receipt_status
      }
    });
  }
  const row = header.rows[0];
  return {
    id: row.id,
    schemaVersion: row.schema_version,
    artifactSetHash: row.artifact_set_hash,
    archiveWrapperSetHash: row.archive_wrapper_set_hash,
    candidateSchemaVersion: row.candidate_schema_version,
    candidateSetHash: row.candidate_set_hash,
    decisionSetHash: row.decision_set_hash,
    approvalAuthorityId: row.approval_authority_id,
    approvalReceiptSetHash: row.approval_receipt_set_hash,
    formId: row.form_id,
    formVersion: row.form_version,
    contextContentHash: row.context_content_hash,
    releaseBinding: {
      questionBundleHash: row.release_question_bundle_hash,
      contentHash: row.release_content_hash,
      manifestHash: row.release_manifest_hash
    },
    active: row.active,
    importedAt: row.imported_at,
    supersededAt: row.superseded_at,
    questions: [...byQuestion.values()]
  };
}

async function lockTranscriptionAggregate(client, input, { activeRequired = true } = {}) {
  const result = await client.query(
    `SELECT w.*, b.student_id, b.status AS batch_status, b.deletion_state, b.deletion_generation AS batch_generation,
            a.status AS asset_status, a.storage_key, a.position AS asset_position,
            p.id AS artifact_id, p.status AS artifact_status, p.external_id,
            p.submitted_at AS provider_submitted_at, p.delete_attempt_count,
            p.upload_call_id, p.upload_call_started_at, p.upload_url_hash,
            p.submit_call_id, p.submit_call_started_at, p.provider_retention_not_before,
            p.reconciliation_attempt_count, p.poll_attempt_count, p.poll_started_at
     FROM amc_practice.learning_batch_work_items w
     JOIN amc_practice.learning_batches b ON b.id = w.batch_id
     JOIN amc_practice.learning_batch_assets a ON a.batch_id = b.id AND a.id = w.asset_id
     JOIN amc_practice.learning_batch_provider_artifacts p
       ON p.batch_id = b.id AND p.asset_id = a.id AND p.provider = 'assemblyai'
     JOIN amc_practice.learning_submissions s
       ON s.id = b.learning_submission_id AND s.student_id = b.student_id
      AND s.attempt_id = b.attempt_id AND s.form_id = b.form_id AND s.form_version = b.form_version
      AND s.source_type = b.source_type
     JOIN amc_practice.attempts t
       ON t.id = b.attempt_id AND t.student_id = b.student_id
      AND t.form_id = b.form_id AND t.form_version = b.form_version
      AND t.attempt_mode = s.attempt_mode
     WHERE w.id = $1 AND w.work_type = 'TRANSCRIBE_AUDIO' AND w.status = 'RUNNING'
       AND w.lease_token = $2 AND w.deletion_generation = $3
       AND b.deletion_generation = $3 AND w.lease_expires_at > $4
       AND amc_practice.learning_entitlement_allows(
         s.id, CASE WHEN $5::boolean THEN 'EXISTING_WORK' ELSE 'CLEANUP' END
       )
       AND ($5::boolean = false OR (b.status = 'PROCESSING' AND b.deletion_state = 'ACTIVE'
         AND s.current_version = b.base_version))
     FOR UPDATE OF w, b, a, p`,
    [input.workItemId, input.leaseToken, input.deletionGeneration, input.now, activeRequired]
  );
  return result.rows[0] || null;
}

function mapFormHeader(row) {
  return row && {
    id: row.form_id,
    version: row.version,
    title: row.title,
    durationMs: number(row.duration_ms),
    published: row.published,
    testOnly: row.test_only,
    publishedAt: row.published_at,
    publicationStatus: row.publication_status,
    sourceSchemaVersion: row.source_schema_version,
    sourceManifestHash: row.source_manifest_hash,
    contentHash: row.content_hash,
    questionBundleHash: row.question_bundle_hash,
    provenance: row.provenance,
    scoringPolicy: row.scoring_policy,
    manifestHash: row.manifest_hash,
    importedAt: row.imported_at,
    practiceKind: row.source_schema_version === 'amc-practice-archive-form-v1' ? 'archive' : 'standard',
    archiveNotice: row.provenance?.archiveNotice || null,
    scoredQuestionCount: row.scored_question_count === undefined ? undefined : Number(row.scored_question_count),
    questions: []
  };
}

function mapQuestion(row) {
  return {
    number: row.question_number,
    promptMarkdown: row.prompt_markdown,
    choices: row.choices,
    correctOption: row.correct_option,
    acceptedOptions: Array.isArray(row.accepted_options) && row.accepted_options.length
      ? row.accepted_options
      : (row.correct_option ? [row.correct_option] : []),
    isScored: row.is_scored !== false,
    solutionMarkdown: row.solution_markdown
  };
}

async function getFormUsing(queryable, id, version = undefined) {
  const header = version === undefined
    ? await queryable.query(
      `SELECT * FROM amc_practice.form_revisions
       WHERE form_id = $1
       ORDER BY published DESC, published_at DESC NULLS LAST, imported_at DESC LIMIT 1`, [id])
    : await queryable.query(
      'SELECT * FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2', [id, version]);
  if (!header.rowCount) return null;
  const form = mapFormHeader(header.rows[0]);
  const questions = await queryable.query(
    `SELECT question_number, prompt_markdown, choices, correct_option, accepted_options, is_scored, solution_markdown
     FROM amc_practice.form_questions WHERE form_id = $1 AND form_version = $2 ORDER BY question_number`,
    [form.id, form.version]
  );
  form.questions = questions.rows.map(mapQuestion);
  return form;
}

async function importFormUsing(client, form, { publish = false, allowTestOnlyPublish = false } = {}) {
  const shouldPublish = Boolean(publish && (form.publishEligible || (form.developmentPublishEligible && allowTestOnlyPublish)));
  const existingResult = await client.query(
    'SELECT manifest_hash, published, published_at, imported_at FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2 FOR UPDATE',
    [form.id, form.version]
  );
  if (existingResult.rowCount) {
    const existing = existingResult.rows[0];
    if (existing.manifest_hash !== form.manifestHash) {
      throw conflict('FORM_VERSION_IMMUTABLE', 'A form version cannot be changed after import.');
    }
  }
  if (shouldPublish) {
    // The caller already holds the logical-form advisory lock. Clear a prior
    // revision *before* setting/inserting this one as published so the
    // database's partial unique index is valid throughout the transaction.
    // Historical attempts remain pinned to their immutable revision.
    await client.query(
      `UPDATE amc_practice.form_revisions
       SET published = false
       WHERE form_id = $1 AND version <> $2 AND published = true`,
      [form.id, form.version]
    );
  }
  if (existingResult.rowCount) {
    const existing = existingResult.rows[0];
    if (shouldPublish && !existing.published) {
      await client.query(
        'UPDATE amc_practice.form_revisions SET published = true, published_at = now() WHERE form_id = $1 AND version = $2',
        [form.id, form.version]
      );
    }
  } else {
    await client.query(
      `INSERT INTO amc_practice.form_revisions
       (form_id, version, title, duration_ms, published, test_only, published_at, publication_status,
        source_schema_version, source_manifest_hash, content_hash, question_bundle_hash, provenance, scoring_policy, manifest_hash)
       VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $5 THEN now() ELSE NULL END, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14)`,
      [form.id, form.version, form.title, form.durationMs, shouldPublish, form.testOnly, form.publicationStatus,
        form.sourceSchemaVersion, form.sourceManifestHash, form.contentHash, form.questionBundleHash,
        form.provenance ? JSON.stringify(form.provenance) : null, JSON.stringify(form.scoringPolicy), form.manifestHash]
    );
    for (const question of form.questions) {
      await client.query(
        `INSERT INTO amc_practice.form_questions
         (form_id, form_version, question_number, prompt_markdown, choices, correct_option, accepted_options, is_scored, solution_markdown)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9)`,
        [form.id, form.version, question.number, question.promptMarkdown, JSON.stringify(question.choices), question.correctOption,
          JSON.stringify(question.acceptedOptions || (question.correctOption ? [question.correctOption] : [])),
          question.isScored !== false, question.solutionMarkdown]
      );
    }
  }
  return getFormUsing(client, form.id, form.version);
}

/** PostgreSQL implementation of the same store contract used by MemoryStore. */
export class PostgresStore {
  constructor({ connectionString, pool = undefined, max = 10 }) {
    if (!connectionString && !pool) throw new Error('AMC12_DATABASE_URL is required for PostgreSQL storage.');
    this.pool = pool || new Pool({ connectionString, max, application_name: 'amc12-practice-api' });
  }

  async close() {
    await this.pool.end();
  }

  async consumeStudentResourceBudget(input) {
    return consumeStudentBudgetUsing(this.pool, input);
  }

  async consumeGlobalResourceBudget(input) {
    return consumeGlobalBudgetUsing(this.pool, input);
  }

  async addStudent({ id = randomUUID(), displayName, createdAt }) {
    const result = await this.pool.query(
      `INSERT INTO amc_practice.students(id, display_name, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING *`, [id, displayName, createdAt]
    );
    return mapStudent(result.rows[0]);
  }

  async getStudent(id) {
    const result = await this.pool.query('SELECT * FROM amc_practice.students WHERE id = $1', [id]);
    return mapStudent(result.rows[0]);
  }

  async putAccessCode(record) {
    const result = await this.pool.query(
      `INSERT INTO amc_practice.access_codes(code_hash, student_id, expires_at, revoked_at, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code_hash) DO UPDATE SET student_id = EXCLUDED.student_id, expires_at = EXCLUDED.expires_at, revoked_at = EXCLUDED.revoked_at
       RETURNING *`,
      [record.codeHash, record.studentId, record.expiresAt, record.revokedAt, record.createdAt]
    );
    return mapAccessCode(result.rows[0]);
  }

  async getAccessCode(codeHash) {
    const result = await this.pool.query('SELECT * FROM amc_practice.access_codes WHERE code_hash = $1', [codeHash]);
    return mapAccessCode(result.rows[0]);
  }

  async createSession(session) {
    const result = await this.pool.query(
      `INSERT INTO amc_practice.sessions(id, student_id, csrf_token_hash, created_at, expires_at, revoked_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [session.id, session.studentId, session.csrfTokenHash, session.createdAt, session.expiresAt, session.revokedAt]
    );
    return mapSession(result.rows[0]);
  }

  async getSession(id) {
    const result = await this.pool.query('SELECT * FROM amc_practice.sessions WHERE id = $1', [id]);
    return mapSession(result.rows[0]);
  }

  async revokeSession(id, revokedAt) {
    const result = await this.pool.query(
      'UPDATE amc_practice.sessions SET revoked_at = $2 WHERE id = $1 AND revoked_at IS NULL RETURNING *', [id, revokedAt]
    );
    return mapSession(result.rows[0]);
  }

  async importForm(form, { publish = false, allowTestOnlyPublish = false } = {}) {
    const [stored] = await this.importForms([form], { publish, allowTestOnlyPublish });
    return stored;
  }

  /** Prevalidated release import with one database transaction for every form. */
  async importForms(forms, { publish = false, allowTestOnlyPublish = false } = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Serialize publication changes for each logical form. Acquire every
      // batch lock in a deterministic order before locking any revision row;
      // two overlapping batches therefore cannot deadlock by taking A/B in
      // opposite orders, and two versions of one form cannot both observe a
      // vacant published slot.
      const publishedBundleHashes = [...new Set(forms
        .filter((form) => publish
          && (form.publishEligible || (form.developmentPublishEligible && allowTestOnlyPublish)))
        .map((form) => form.questionBundleHash))].sort();
      for (const bundleHash of publishedBundleHashes) {
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtext('amc_open_delivery_bundle'), hashtext($1))",
          [bundleHash]
        );
      }
      const formIds = [...new Set(forms.map((form) => form.id))].sort();
      for (const formId of formIds) {
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtext('amc_practice_form_publication'), hashtext($1))",
          [formId]
        );
      }
      const stored = [];
      for (const form of forms) {
        stored.push(await importFormUsing(client, form, { publish, allowTestOnlyPublish }));
      }
      await client.query('COMMIT');
      return stored;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async importApprovedContextSets({ forms, archiveSetHash, authorityId, receiptSetHash, importedAt }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const imported = [];
      const lockOrder = forms
        .map((artifact) => [artifact.formBinding.id, artifact.formBinding.version])
        .sort(([leftId, leftVersion], [rightId, rightVersion]) => leftId.localeCompare(rightId) || leftVersion.localeCompare(rightVersion));
      for (const [formId, formVersion] of lockOrder) {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [formId, formVersion]);
      }
      for (const artifact of forms) {
        const binding = artifact.formBinding;
        const form = await client.query(
          `SELECT question_bundle_hash, content_hash, manifest_hash
           FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2 FOR SHARE`,
          [binding.id, binding.version]
        );
        if (!form.rowCount) throw Object.assign(new Error('Approved context form revision is not imported.'), { code: 'FORM_REVISION_NOT_FOUND' });
        const release = binding.releaseBinding;
        if (!release || release.questionBundleHash !== form.rows[0].question_bundle_hash
            || release.contentHash !== form.rows[0].content_hash || release.manifestHash !== form.rows[0].manifest_hash) {
          throw Object.assign(new Error('Approved context release hashes do not match the immutable form revision.'), { code: 'CONTEXT_RELEASE_MISMATCH' });
        }
        const storedQuestions = await client.query(
          `SELECT question_number, prompt_markdown, choices FROM amc_practice.form_questions
           WHERE form_id = $1 AND form_version = $2 ORDER BY question_number`, [binding.id, binding.version]
        );
        if (storedQuestions.rowCount !== artifact.questions.length) throw Object.assign(new Error('Approved context question count mismatch.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
        for (const question of artifact.questions) {
          const stored = storedQuestions.rows.find((row) => row.question_number === question.number);
          const choices = stored && Object.fromEntries(stored.choices.map((choice) => [choice.option, choice.textMarkdown]));
          if (!stored || stored.prompt_markdown !== question.promptMarkdown
              || JSON.stringify(choices) !== JSON.stringify(question.choices)) {
            throw Object.assign(new Error('Approved context prompt/choices do not match the form revision.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
          }
        }
        const duplicate = await client.query(
          `SELECT id, archive_wrapper_set_hash FROM amc_practice.approved_context_sets
           WHERE artifact_set_hash = $1 FOR UPDATE`, [artifact.setHash]
        );
        if (duplicate.rowCount) {
          if (archiveSetHash && duplicate.rows[0].archive_wrapper_set_hash === null) {
            await client.query(
              'UPDATE amc_practice.approved_context_sets SET archive_wrapper_set_hash = $2 WHERE id = $1',
              [duplicate.rows[0].id, archiveSetHash]
            );
          } else if (archiveSetHash && duplicate.rows[0].archive_wrapper_set_hash !== archiveSetHash) {
            throw Object.assign(new Error('Approved context artifact is already bound to a different archive wrapper.'), {
              code: 'CONTEXT_ARCHIVE_LINEAGE_CONFLICT'
            });
          }
          imported.push(await loadApprovedContextSet(client, duplicate.rows[0].id));
          continue;
        }
        await client.query(
          `UPDATE amc_practice.approved_context_sets SET active = false, superseded_at = $3
           WHERE form_id = $1 AND form_version = $2 AND active`, [binding.id, binding.version, importedAt]
        );
        const contextSetId = randomUUID();
        await client.query(
          `INSERT INTO amc_practice.approved_context_sets
           (id, schema_version, artifact_set_hash, archive_wrapper_set_hash, candidate_schema_version, candidate_set_hash,
            decision_set_hash, approval_authority_id, approval_receipt_set_hash, form_id, form_version, context_content_hash,
            release_question_bundle_hash, release_content_hash, release_manifest_hash, active, imported_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,true,$16)`,
          [contextSetId, artifact.schemaVersion, artifact.setHash, archiveSetHash, binding.candidateSchemaVersion,
            binding.candidateSetHash, artifact.reviewDecisionBinding.decisionSetHash, authorityId, receiptSetHash,
            binding.id, binding.version, binding.contextContentHash,
            release.questionBundleHash, release.contentHash, release.manifestHash, importedAt]
        );
        const readyQuestions = artifact.questions.filter((question) => question.contextReady
          && question.approvedSolutions.filter((solution) => solution.modelEligibility.eligible).length >= 2);
        for (const question of readyQuestions) {
          await client.query(
            `INSERT INTO amc_practice.approved_context_questions
             (context_set_id, form_id, form_version, question_number, question_content_hash,
              prompt_markdown, choices, approved_solution_count, model_eligible_solution_count, visual_context)
             VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb)`,
            [contextSetId, binding.id, binding.version, question.number, question.questionContentHash,
              question.promptMarkdown, JSON.stringify(question.choices), question.approvedSolutions.length,
              question.availability.modelEligibleSolutionCount, JSON.stringify(question.visualContext)]
          );
          for (const [index, solution] of question.approvedSolutions.entries()) {
            await client.query(
              `INSERT INTO amc_practice.approved_context_solutions
               (context_set_id, question_number, solution_position, artifact_solution_id, title,
                body_markdown, body_sha256, source_path, source_sha256, source_heading_line,
                source_end_line, reviewer_id, reviewed_at, rights_status, quality_flags, method_tags,
                model_eligible, model_ineligibility_reason, decision_record_hash,
                authority_receipt_id, authority_receipt_authority_id,
                authority_receipt_issued_at, authority_receipt_status)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,
                 $17,$18,$19,$20,$21,$22,$23)`,
              [contextSetId, question.number, index + 1, solution.solutionId, solution.title,
                solution.bodyMarkdown, solution.bodySha256, solution.sourceRef.path, solution.sourceRef.sha256,
                solution.sourceRef.headingLine, solution.sourceRef.endLine, solution.approval.reviewerId,
                solution.approval.reviewedAt, solution.approval.rightsStatus,
                JSON.stringify(solution.approval.qualityFlags), JSON.stringify(solution.approval.methodTags),
                solution.modelEligibility.eligible, solution.modelEligibility.reason, solution.approval.decisionRecordHash,
                solution.approval.authorityReceipt.receiptId, solution.approval.authorityReceipt.authorityId,
                solution.approval.authorityReceipt.issuedAt,
                solution.approval.authorityReceipt.status]
            );
          }
        }
        if (readyQuestions.length) {
          const blocked = await client.query(
            `SELECT v.id, v.learning_submission_id, v.version_number, v.evidence_hash,
                    w.id AS work_id, w.deletion_generation
             FROM amc_practice.learning_submission_versions v
             JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
             JOIN amc_practice.learning_work_items w
               ON w.learning_submission_version_id = v.id AND w.work_type = 'ANALYZE_SUBMISSION'
             WHERE v.form_id = $1 AND v.form_version = $2 AND v.context_status = 'CONTEXT_UNAVAILABLE'
               AND s.lifecycle_status = 'COMMITTED' AND w.status = 'BLOCKED_CONTEXT'
             FOR UPDATE OF v, w`, [binding.id, binding.version]
          );
          for (const row of blocked.rows) {
            const inputHash = analysisInputHash(row.evidence_hash, artifact.setHash);
            const runId = randomUUID();
            await client.query(
              `UPDATE amc_practice.learning_submission_versions
               SET context_status = 'CONTEXT_READY', context_set_id = $2 WHERE id = $1`, [row.id, contextSetId]
            );
            await client.query(
              `INSERT INTO amc_practice.learning_analysis_runs
               (id, learning_submission_version_id, context_set_id, version_number, input_hash,
                evidence_hash, deletion_generation, status, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,'QUEUED',$8)`,
              [runId, row.id, contextSetId, row.version_number, inputHash, row.evidence_hash, row.deletion_generation, importedAt]
            );
            await client.query(
              `UPDATE amc_practice.learning_work_items
               SET status = 'QUEUED', input_hash = $2, analysis_run_id = $3, available_at = $4,
                   last_error_code = NULL, updated_at = $4
               WHERE id = $1`, [row.work_id, inputHash, runId, importedAt]
            );
          }
        }
        imported.push(await loadApprovedContextSet(client, contextSetId));
      }
      await client.query('COMMIT');
      return imported;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async claimLearningAnalysisWork({ workerId, now, leaseMs }) {
    const claimed = await this.claimNextAiWork({
      workerId, now, leaseMs, acceptedKinds: ['INTERACTIVE_ANALYSIS']
    });
    return claimed?.job || null;
  }

  async claimNextAiWork({
    workerId, now, leaseMs, acceptedKinds = ['INTERACTIVE_ANALYSIS', 'BATCH_EXTRACTION'], maxBatchConcurrent = 1
  }) {
    const accepted = new Set(acceptedKinds);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Every Gateway-consuming worker claims through this short global
      // dispatcher lock. Processing happens after COMMIT, so the lock only
      // serializes fair priority selection, not provider latency.
      await client.query("SELECT pg_advisory_xact_lock(hashtext('amc_ai_dispatcher'), 0)");
      const reclaimedInteractive = await client.query(
        `UPDATE amc_practice.learning_work_items
         SET status = 'QUEUED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             available_at = $1, last_error_code = 'LEASE_EXPIRED', updated_at = $1
         WHERE status = 'RUNNING' AND lease_expires_at <= $1 RETURNING analysis_run_id`, [now]
      );
      const reclaimedRunIds = reclaimedInteractive.rows.map((row) => row.analysis_run_id).filter(Boolean);
      if (reclaimedRunIds.length) {
        await client.query(
          `UPDATE amc_practice.learning_analysis_runs
           SET status = 'QUEUED', started_at = NULL, last_error_code = 'LEASE_EXPIRED'
           WHERE id = ANY($1::uuid[])`, [reclaimedRunIds]
        );
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             available_at = $1, last_error_code = 'LEASE_EXPIRED', updated_at = $1
         WHERE work_type = 'BATCH_EXTRACTION' AND status = 'RUNNING' AND lease_expires_at <= $1`, [now]
      );
      const selected = await client.query(
        `SELECT * FROM (
           SELECT 'INTERACTIVE_ANALYSIS'::text AS kind, w.id, w.priority, w.available_at, w.created_at
           FROM amc_practice.learning_work_items w
           JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
           JOIN amc_practice.learning_submission_versions v ON v.id = w.learning_submission_version_id
           JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
           JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = s.student_id
             AND a.attempt_mode = s.attempt_mode
           WHERE $2::boolean AND w.status = 'QUEUED' AND w.available_at <= $1
             AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
             AND r.status = 'QUEUED' AND v.context_status = 'CONTEXT_READY'
             AND v.context_set_id = r.context_set_id AND w.input_hash = r.input_hash
             AND w.deletion_generation = r.deletion_generation
           UNION ALL
           SELECT 'BATCH_EXTRACTION'::text AS kind, w.id, w.priority, w.available_at, w.created_at
           FROM amc_practice.learning_batch_work_items w
           JOIN amc_practice.learning_batches b ON b.id = w.batch_id
           JOIN amc_practice.learning_submissions s
            ON s.id = b.learning_submission_id AND s.student_id = b.student_id
            AND s.attempt_id = b.attempt_id AND s.form_id = b.form_id AND s.form_version = b.form_version
            AND s.source_type = b.source_type
           JOIN amc_practice.attempts batch_attempt
             ON batch_attempt.id = b.attempt_id AND batch_attempt.student_id = b.student_id
            AND batch_attempt.form_id = b.form_id AND batch_attempt.form_version = b.form_version
            AND batch_attempt.attempt_mode = s.attempt_mode
           WHERE $3::boolean AND w.work_type = 'BATCH_EXTRACTION' AND w.status = 'QUEUED'
             AND w.available_at <= $1 AND b.status = 'PROCESSING' AND b.deletion_state = 'ACTIVE'
             AND b.deletion_generation = w.deletion_generation
             AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
             AND s.current_version = b.base_version
             AND (SELECT count(*) FROM amc_practice.learning_batch_work_items running
                  WHERE running.work_type = 'BATCH_EXTRACTION' AND running.status = 'RUNNING') < $4
             AND (SELECT count(*) FROM amc_practice.learning_batch_assets a WHERE a.batch_id = b.id)
               = (SELECT count(*) FROM amc_practice.learning_batch_evidence e
                  WHERE e.batch_id = b.id AND e.normalized_text IS NOT NULL)
         ) candidates
         ORDER BY priority DESC, available_at, created_at, id LIMIT 1`,
        [now, accepted.has('INTERACTIVE_ANALYSIS'), accepted.has('BATCH_EXTRACTION'), maxBatchConcurrent]
      );
      if (!selected.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      const candidate = selected.rows[0];
      const leaseToken = randomUUID();
      if (candidate.kind === 'BATCH_EXTRACTION') {
        const claimed = await client.query(
          `UPDATE amc_practice.learning_batch_work_items
           SET status = 'RUNNING', attempt_count = attempt_count + 1, lease_owner = $2,
               lease_token = $3, lease_expires_at = $1::timestamptz + ($4::text || ' milliseconds')::interval,
               updated_at = $1
           WHERE id = $5 AND status = 'QUEUED' RETURNING *`,
          [now, workerId, leaseToken, leaseMs, candidate.id]
        );
        if (!claimed.rowCount) throw new Error('Unified dispatcher lost its serialized batch candidate.');
        const workItem = mapLearningBatchWorkItem(claimed.rows[0]);
        const batchRow = await client.query(
          `SELECT b.* FROM amc_practice.learning_batches b
           WHERE b.id = $1 FOR SHARE`, [workItem.batchId]
        );
        const batch = mapLearningBatch(batchRow.rows[0]);
        const assets = await client.query(
          'SELECT * FROM amc_practice.learning_batch_assets WHERE batch_id = $1 ORDER BY position', [batch.id]
        );
        const evidence = await client.query(
          `SELECT e.*, a.position FROM amc_practice.learning_batch_evidence e
           JOIN amc_practice.learning_batch_assets a ON a.batch_id = e.batch_id AND a.id = e.asset_id
           WHERE e.batch_id = $1 ORDER BY a.position`, [batch.id]
        );
        await client.query('COMMIT');
        return {
          kind: 'BATCH_EXTRACTION',
          job: {
            workItem, batch,
            assets: assets.rows.map(mapLearningBatchAsset),
            evidence: evidence.rows.map(mapLearningBatchEvidence),
            studentId: batch.studentId,
            attemptId: batch.attemptId
          }
        };
      }
      const claimed = await client.query(
        `UPDATE amc_practice.learning_work_items
         SET status = 'RUNNING', attempt_count = attempt_count + 1, lease_owner = $2,
             lease_token = $3, lease_expires_at = $1::timestamptz + ($4::text || ' milliseconds')::interval,
             updated_at = $1
         WHERE id = $5 AND status = 'QUEUED' RETURNING *`,
        [now, workerId, leaseToken, leaseMs, candidate.id]
      );
      if (!claimed.rowCount) throw new Error('Unified dispatcher lost its serialized interactive candidate.');
      const workItem = mapLearningWorkItem(claimed.rows[0]);
      const joined = await client.query(
        `SELECT r.id AS run_id, r.learning_submission_version_id, r.context_set_id AS run_context_set_id,
                r.version_number AS run_version_number, r.input_hash AS run_input_hash,
                r.evidence_hash AS run_evidence_hash, r.deletion_generation AS run_deletion_generation,
                r.created_at AS run_created_at, r.started_at AS run_started_at,
                v.id AS version_id, v.learning_submission_id, v.version_number,
                v.form_id, v.form_version, v.context_set_id, v.evidence_hash,
                s.id AS submission_id, s.student_id, s.attempt_id,
                s.current_version, s.lifecycle_status, s.form_id AS submission_form_id,
                s.form_version AS submission_form_version
         FROM amc_practice.learning_analysis_runs r
         JOIN amc_practice.learning_submission_versions v ON v.id = r.learning_submission_version_id
         JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
         WHERE r.id = $1`, [workItem.analysisRunId]
      );
      const row = joined.rows[0];
      await client.query(
        `UPDATE amc_practice.learning_analysis_runs
         SET status = 'RUNNING', started_at = COALESCE(started_at, $2), last_error_code = NULL WHERE id = $1`,
        [workItem.analysisRunId, now]
      );
      const version = {
        id: row.version_id, learningSubmissionId: row.learning_submission_id,
        versionNumber: row.version_number, formId: row.form_id, formVersion: row.form_version,
        contextSetId: row.context_set_id, evidenceHash: row.evidence_hash
      };
      const run = {
        id: row.run_id, learningSubmissionVersionId: row.learning_submission_version_id,
        contextSetId: row.run_context_set_id, versionNumber: row.run_version_number,
        inputHash: row.run_input_hash, evidenceHash: row.run_evidence_hash,
        deletionGeneration: row.run_deletion_generation, status: 'RUNNING',
        createdAt: row.run_created_at, startedAt: row.run_started_at || now,
        completedAt: null, lastErrorCode: null
      };
      const submission = {
        id: row.submission_id, studentId: row.student_id, attemptId: row.attempt_id,
        currentVersion: row.current_version, lifecycleStatus: row.lifecycle_status,
        formId: row.submission_form_id, formVersion: row.submission_form_version
      };
      const responses = await client.query(
          `SELECT question_number, selected_option, reasoning_text, reasoning_origin
           FROM amc_practice.learning_question_responses
           WHERE learning_submission_version_id = $1 ORDER BY question_number`, [version.id]
      );
      const formQuestions = await client.query(
          `SELECT question_number, correct_option FROM amc_practice.form_questions
           WHERE form_id = $1 AND form_version = $2 ORDER BY question_number`, [version.formId, version.formVersion]
      );
      const contextSet = await loadApprovedContextSet(client, version.contextSetId);
      const official = new Map(formQuestions.rows.map((question) => [question.question_number, question.correct_option]));
      const contexts = new Map(contextSet.questions.map((question) => [question.questionNumber, question]));
      await client.query('COMMIT');
      return {
        kind: 'INTERACTIVE_ANALYSIS',
        job: {
          workItem, run, version, submission,
          questions: responses.rows.map((response) => ({
            questionNumber: response.question_number, selectedOption: response.selected_option,
            reasoningText: response.reasoning_text, reasoningOrigin: response.reasoning_origin,
            officialAnswer: official.get(response.question_number),
            context: contexts.get(response.question_number) || null
          }))
        }
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async claimNextTranscriptionWork({ workerId, now, leaseMs }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('amc_transcription_dispatcher'), 0)");
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             available_at = $1, last_error_code = 'LEASE_EXPIRED', updated_at = $1
         WHERE work_type = 'TRANSCRIBE_AUDIO' AND status = 'RUNNING' AND lease_expires_at <= $1`,
        [now]
      );
      const selected = await client.query(
        `SELECT w.id, w.attempt_count, w.created_at AS work_created_at,
                b.student_id, p.status AS artifact_status, p.external_id, p.submitted_at,
                p.upload_call_id, p.upload_url_hash, p.provider_retention_not_before,
                p.submit_call_id, p.submit_call_started_at, p.reconciliation_attempt_count,
                p.poll_attempt_count, p.poll_started_at,
                a.id AS asset_id, a.status AS asset_status, a.storage_key
         FROM amc_practice.learning_batch_work_items w
         JOIN amc_practice.learning_batches b ON b.id = w.batch_id
         JOIN amc_practice.learning_batch_assets a ON a.batch_id = b.id AND a.id = w.asset_id
         JOIN amc_practice.learning_batch_provider_artifacts p
           ON p.batch_id = b.id AND p.asset_id = a.id AND p.provider = 'assemblyai'
         JOIN amc_practice.learning_submissions s
           ON s.id = b.learning_submission_id AND s.student_id = b.student_id
          AND s.attempt_id = b.attempt_id AND s.form_id = b.form_id AND s.form_version = b.form_version
          AND s.source_type = b.source_type
         JOIN amc_practice.attempts t
           ON t.id = b.attempt_id AND t.student_id = b.student_id
          AND t.form_id = b.form_id AND t.form_version = b.form_version
          AND t.attempt_mode = s.attempt_mode
         LEFT JOIN amc_practice.student_provider_dispatch_state dispatch
           ON dispatch.student_id = b.student_id
         WHERE w.work_type = 'TRANSCRIBE_AUDIO' AND w.status = 'QUEUED' AND w.available_at <= $1
           AND w.deletion_generation = b.deletion_generation
           AND amc_practice.learning_entitlement_allows(s.id,
             CASE WHEN b.deletion_state <> 'ACTIVE' OR b.status = 'FAILED'
                    OR p.status IN ('DELETE_PENDING','DELETION_EVIDENCED',
                      'PROVIDER_RETENTION_PENDING','PROVIDER_RETENTION_DELETION_CONFIRMED')
                  THEN 'CLEANUP' ELSE 'EXISTING_WORK' END)
           AND (
             (b.deletion_state = 'ACTIVE' AND s.current_version = b.base_version
               AND ((b.status = 'PROCESSING' AND (
                   (p.status = 'INTENT_RECORDED' AND a.status = 'STORED' AND a.storage_key IS NOT NULL)
                   OR (p.status IN ('UPLOAD_MAY_HAVE_DELIVERED','UPLOAD_RESPONSE_PERSISTED')
                     AND a.status = 'STORED')
                   OR (p.status = 'SUBMIT_MAY_HAVE_DELIVERED'
                     AND a.status IN ('STORED','PURGE_PENDING','PURGED'))
                   OR (p.status = 'ACTIVE' AND a.status = 'STORED')
                   OR (p.status = 'DELETE_PENDING' AND a.status IN ('PURGE_PENDING','PURGED'))))
                 OR (b.status = 'FAILED' AND p.status = 'DELETE_PENDING'
                   AND a.status IN ('PURGE_PENDING','PURGED'))
                 OR (b.status = 'FAILED' AND p.status = 'SUBMIT_MAY_HAVE_DELIVERED'
                   AND a.status IN ('STORED','PURGE_PENDING','PURGED'))
                 OR (b.status = 'FAILED' AND p.status = 'DELETION_EVIDENCED'
                   AND a.status = 'PURGE_PENDING')
                 OR (b.status = 'FAILED' AND p.status IN (
                   'PROVIDER_RETENTION_PENDING','PROVIDER_RETENTION_DELETION_CONFIRMED'
                 )
                   AND a.status = 'PURGE_PENDING')))
             OR (b.deletion_state IN (
                 'DELETE_REQUESTED','LOCAL_PURGED','PROVIDER_DELETE_PENDING','PROVIDER_RETENTION_PENDING'
               )
               AND ((p.status = 'DELETE_PENDING' AND a.status IN ('PURGE_PENDING','PURGED'))
                 OR (p.status = 'SUBMIT_MAY_HAVE_DELIVERED'
                   AND a.status IN ('STORED','PURGE_PENDING','PURGED'))
                 OR (p.status IN ('DELETION_EVIDENCED','PROVIDER_RETENTION_PENDING',
                       'PROVIDER_RETENTION_DELETION_CONFIRMED')
                   AND a.status = 'PURGE_PENDING')))
           )
         ORDER BY w.priority DESC, COALESCE(dispatch.transcription_claim_count, 0),
                  w.available_at, w.created_at, w.id
         FOR UPDATE OF w, b, a, p SKIP LOCKED LIMIT 1`, [now]
      );
      if (!selected.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      const row = selected.rows[0];
      const leaseToken = randomUUID();
      const claimed = await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'RUNNING', attempt_count = attempt_count + 1, lease_owner = $2,
             lease_token = $3, lease_expires_at = $1::timestamptz + ($4::text || ' milliseconds')::interval,
             updated_at = $1
         WHERE id = $5 AND status = 'QUEUED' RETURNING deletion_generation`,
        [now, workerId, leaseToken, leaseMs, row.id]
      );
      await client.query(
        `INSERT INTO amc_practice.student_provider_dispatch_state
         (student_id, transcription_claim_count, updated_at)
         VALUES ($1,1,$2)
         ON CONFLICT (student_id) DO UPDATE
           SET transcription_claim_count = student_provider_dispatch_state.transcription_claim_count + 1,
               updated_at = EXCLUDED.updated_at`,
        [row.student_id, now]
      );
      await client.query('COMMIT');
      const phase = row.artifact_status === 'INTENT_RECORDED'
        ? 'upload'
        : ['UPLOAD_MAY_HAVE_DELIVERED','UPLOAD_RESPONSE_PERSISTED'].includes(row.artifact_status)
          ? 'await_upload_retention'
          : row.artifact_status === 'SUBMIT_MAY_HAVE_DELIVERED'
            ? 'reconcile' : row.artifact_status === 'ACTIVE' ? 'poll'
              : ['DELETION_EVIDENCED','PROVIDER_RETENTION_PENDING',
                'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(row.artifact_status)
                ? 'purge_resolved_orphan' : 'delete';
      return {
        phase,
        workItemId: row.id,
        attemptCount: number(row.attempt_count) + 1,
        workCreatedAt: row.work_created_at,
        leaseToken,
        deletionGeneration: claimed.rows[0].deletion_generation,
        assetId: row.asset_id,
        assetStorageKey: row.storage_key,
        localPurgePending: row.asset_status === 'PURGE_PENDING',
        providerTranscriptId: row.external_id,
        providerTranscriptPersistedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
        uploadCallId: row.upload_call_id,
        uploadUrlSha256: row.upload_url_hash,
        providerRetentionNotBefore: row.provider_retention_not_before,
        submitCallId: row.submit_call_id,
        submitCallStartedAt: row.submit_call_started_at,
        reconciliationAttemptCount: row.reconciliation_attempt_count,
        pollAttemptCount: row.poll_attempt_count,
        pollStartedAt: row.poll_started_at
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async authorizeTranscriptionProviderCall(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, input, {
        activeRequired: !['DELETE', 'RECONCILE'].includes(input.phase)
      });
      let allowed = false;
      if (row && input.phase === 'UPLOAD') {
        allowed = row.artifact_status === 'UPLOAD_MAY_HAVE_DELIVERED'
          && row.upload_call_id === input.uploadCallId
          && row.asset_status === 'STORED' && typeof row.storage_key === 'string';
      } else if (row && input.phase === 'SUBMIT') {
        allowed = row.artifact_status === 'SUBMIT_MAY_HAVE_DELIVERED'
          && row.upload_call_id === input.uploadCallId
          && row.submit_call_id === input.submitCallId
          && row.upload_url_hash === input.uploadUrlSha256;
      } else if (row && input.phase === 'RECONCILE') {
        allowed = row.artifact_status === 'SUBMIT_MAY_HAVE_DELIVERED'
          && row.submit_call_id === input.submitCallId
          && row.upload_url_hash === input.uploadUrlSha256;
      } else if (row && input.phase === 'POLL') {
        allowed = row.artifact_status === 'ACTIVE' && row.external_id === input.providerTranscriptId;
      } else if (row && input.phase === 'DELETE') {
        allowed = row.artifact_status === 'DELETE_PENDING' && row.external_id === input.providerTranscriptId
          && (row.deletion_state === 'ACTIVE'
            ? ['PROCESSING', 'FAILED'].includes(row.batch_status)
            : ['DELETE_REQUESTED', 'LOCAL_PURGED', 'PROVIDER_DELETE_PENDING',
              'PROVIDER_RETENTION_PENDING'].includes(row.deletion_state));
      }
      if (allowed && input.providerBudget) {
        await client.query('SAVEPOINT provider_budget');
        const student = Number.isSafeInteger(input.providerBudget.studentLimit)
          ? await consumeStudentBudgetUsing(client, {
            studentId: row.student_id, budgetKind: 'PROVIDER_WORK', units: 1,
            limit: input.providerBudget.studentLimit, windowMs: input.providerBudget.windowMs, now: input.now
          }) : { allowed: true, retryAfterSeconds: 0 };
        const global = await consumeGlobalBudgetUsing(client, {
          budgetKind: input.providerBudget.budgetKind || 'PROVIDER_WORK', units: 1,
          limit: input.providerBudget.globalLimit, windowMs: input.providerBudget.windowMs, now: input.now
        });
        if (!student.allowed || !global.allowed) {
          await client.query('ROLLBACK TO SAVEPOINT provider_budget');
          const retryAfterSeconds = Math.max(student.retryAfterSeconds || 1, global.retryAfterSeconds || 1);
          await client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'QUEUED', available_at = $2::timestamptz
                   + ($3::text || ' seconds')::interval,
                 lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'PROVIDER_BUDGET_EXHAUSTED', updated_at = $2
             WHERE id = $1`, [input.workItemId, input.now, retryAfterSeconds]
          );
          allowed = false;
        } else {
          await client.query('RELEASE SAVEPOINT provider_budget');
        }
      }
      if (allowed && input.phase === 'POLL') {
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts
           SET poll_attempt_count = poll_attempt_count + 1,
               poll_started_at = COALESCE(poll_started_at, $2), updated_at = $2
           WHERE id = $1`, [row.artifact_id, input.now]
        );
      }
      await client.query('COMMIT');
      return allowed;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async beginTranscriptionUploadCall(input) {
    const expectedNotBefore = providerRetentionNotBefore(
      new Date(input.startedAt), input.retentionProfile
    );
    if (expectedNotBefore.getTime() !== new Date(input.providerRetentionNotBefore).getTime()) {
      throw new Error('AssemblyAI provider retention not-before does not match the verified profile.');
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.startedAt });
      if (!row || row.artifact_status !== 'INTENT_RECORDED' || row.external_id !== null
          || row.asset_status !== 'STORED' || typeof row.storage_key !== 'string') {
        await client.query('ROLLBACK');
        return null;
      }
      const callId = randomUUID();
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'UPLOAD_MAY_HAVE_DELIVERED', upload_call_id = $2,
             upload_call_started_at = $3, provider_retention_not_before = $4,
             retention_profile = $5, retention_policy_delay_ms = $6,
             upload_request_max_duration_ms = $7, retention_processing_slack_ms = $8,
             retention_window_elapsed_at = NULL, updated_at = $3
         WHERE id = $1`,
        [row.artifact_id, callId, input.startedAt, input.providerRetentionNotBefore,
          input.retentionProfile.name, input.retentionProfile.policyDelayMs,
          input.retentionProfile.uploadRequestMaxDurationMs,
          input.retentionProfile.processingSlackMs]
      );
      const auditId = randomUUID();
      await client.query(
        `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
         (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
          deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
          retention_not_before, evidence_code, created_at, evidenced_at)
         VALUES ($1,NULL,'PROVIDER_RETENTION_PENDING','assemblyai',$2,$3,$4,$5,$6,
           NULL,NULL,NULL,$7,NULL,$8,NULL)`,
        [auditId, row.batch_id, row.asset_id, input.workItemId, input.deletionGeneration,
          callId, input.providerRetentionNotBefore, input.startedAt]
      );
      await client.query(
        `INSERT INTO amc_practice.learning_batch_provider_orphan_cleanup_jobs
         (id, orphan_audit_id, batch_id, cleanup_kind, provider, external_id, status,
          attempt_count, available_at, lease_owner, lease_token, lease_expires_at,
          last_error_code, created_at, updated_at)
         VALUES ($1,$2,$3,'OBSERVE_RETENTION_WINDOW','assemblyai',NULL,'QUEUED',0,$4,
           NULL,NULL,NULL,NULL,$5,$5)`,
        [randomUUID(), auditId, row.batch_id, input.providerRetentionNotBefore, input.startedAt]
      );
      await client.query('COMMIT');
      return { callId };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async recordTranscriptionUploadResponse(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.returnedAt });
      if (!row || row.artifact_status !== 'UPLOAD_MAY_HAVE_DELIVERED'
          || row.upload_call_id !== input.uploadCallId) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'UPLOAD_RESPONSE_PERSISTED', upload_url_hash = $2, updated_at = $3
         WHERE id = $1`, [row.artifact_id, input.uploadUrlSha256, input.returnedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async beginTranscriptionSubmitCall(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.startedAt });
      if (!row || row.artifact_status !== 'UPLOAD_RESPONSE_PERSISTED'
          || row.upload_call_id !== input.uploadCallId
          || row.upload_url_hash !== input.uploadUrlSha256) {
        await client.query('ROLLBACK');
        return null;
      }
      const callId = randomUUID();
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'SUBMIT_MAY_HAVE_DELIVERED', submit_call_id = $2,
             submit_call_started_at = $3, updated_at = $3 WHERE id = $1`,
        [row.artifact_id, callId, input.startedAt]
      );
      await client.query('COMMIT');
      return { callId };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async deferAmbiguousUploadUntilRetention(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, input, { activeRequired: false });
      if (!row || !['UPLOAD_MAY_HAVE_DELIVERED','UPLOAD_RESPONSE_PERSISTED'].includes(row.artifact_status)
          || row.upload_call_id !== input.uploadCallId) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'PROVIDER_RETENTION_PENDING', updated_at = $2 WHERE id = $1`,
        [row.artifact_id, input.now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET status = CASE WHEN status = 'STORED' THEN 'PURGE_PENDING' ELSE status END,
             updated_at = $2 WHERE id = $1`, [row.asset_id, input.now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = CASE WHEN EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_assets a
               WHERE a.id = $3 AND a.status = 'PURGE_PENDING'
             ) THEN 'QUEUED' ELSE 'FAILED' END,
             available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = 'UPLOAD_CALL_OUTCOME_AMBIGUOUS', updated_at = $2
         WHERE id = $1`, [input.workItemId, input.now, row.asset_id]
      );
      await client.query(
        `UPDATE amc_practice.learning_batches
         SET status = 'FAILED', failure_code = 'UPLOAD_CALL_OUTCOME_AMBIGUOUS', updated_at = $2
         WHERE id = $1 AND status = 'PROCESSING'`, [row.batch_id, input.now]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async markAmbiguousSubmitForReconciliation(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, input, { activeRequired: false });
      if (!row || row.artifact_status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || row.submit_call_id !== input.submitCallId) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $3, updated_at = $4 WHERE id = $1`,
        [input.workItemId, transcriptionRetryAt(input.now, row.attempt_count, input.retryAfterSeconds),
          input.errorCode || 'SUBMIT_CALL_OUTCOME_AMBIGUOUS', input.now]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async recordAmbiguousSubmitReconciliation(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client,
        { ...input, now: input.reconciledAt }, { activeRequired: false });
      if (!row || row.artifact_status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || row.submit_call_id !== input.submitCallId
          || row.upload_url_hash !== input.uploadUrlSha256) {
        await client.query('ROLLBACK');
        return false;
      }
      const transcriptIds = [...new Set(input.providerTranscriptIds || [])].sort();
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET reconciliation_attempt_count = reconciliation_attempt_count + 1,
             last_reconciliation_at = $2, updated_at = $2 WHERE id = $1`,
        [row.artifact_id, input.reconciledAt]
      );
      const queueOrphanTranscript = async (externalId, errorCode) => {
        const auditId = randomUUID();
        const inserted = await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
            deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
            retention_not_before, evidence_code, created_at, evidenced_at)
           VALUES ($1,NULL,'ORPHAN_TRANSCRIPT_DELETE_PENDING','assemblyai',$2,$3,$4,$5,$6,$7,
             NULL,$8,NULL,NULL,$9,NULL)
           ON CONFLICT DO NOTHING RETURNING id`,
          [auditId, row.batch_id, row.asset_id, input.workItemId, input.deletionGeneration,
            input.submitCallId, externalId, errorCode, input.reconciledAt]
        );
        let orphanAuditId = inserted.rows[0]?.id;
        if (!orphanAuditId) {
          const existing = await client.query(
            `SELECT id FROM amc_practice.learning_batch_provider_orphan_audit
             WHERE provider = 'assemblyai' AND event = 'ORPHAN_TRANSCRIPT_DELETE_PENDING'
               AND external_id = $1`, [externalId]
          );
          orphanAuditId = existing.rows[0]?.id;
        }
        if (orphanAuditId) await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_cleanup_jobs
           (id, orphan_audit_id, batch_id, cleanup_kind, provider, external_id, status,
            attempt_count, available_at, lease_owner, lease_token, lease_expires_at,
            last_error_code, created_at, updated_at)
           VALUES ($1,$2,$3,'DELETE_TRANSCRIPT','assemblyai',$4,'QUEUED',0,$5,
             NULL,NULL,NULL,$6,$5,$5)
           ON CONFLICT (orphan_audit_id) DO NOTHING`,
          [randomUUID(), orphanAuditId, row.batch_id, externalId, input.reconciledAt, errorCode]
        );
      };
      if (input.scanComplete !== true) {
        for (const externalId of transcriptIds) {
          await queueOrphanTranscript(externalId, 'RECONCILIATION_SCAN_INCOMPLETE');
        }
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts
           SET status = 'RECONCILE_BLOCKED_MANUAL', updated_at = $2 WHERE id = $1`,
          [row.artifact_id, input.reconciledAt]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_work_items
           SET status = 'FAILED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
               last_error_code = 'RECONCILIATION_SCAN_INCOMPLETE', updated_at = $2 WHERE id = $1`,
          [input.workItemId, input.reconciledAt]
        );
        await client.query(
          `UPDATE amc_practice.learning_batches
           SET status = 'FAILED', failure_code = 'RECONCILIATION_SCAN_INCOMPLETE', updated_at = $2
           WHERE id = $1`, [row.batch_id, input.reconciledAt]
        );
        await client.query('COMMIT');
        return true;
      }
      if (!transcriptIds.length) {
        const manual = new Date(input.reconciledAt).getTime()
          >= new Date(row.submit_call_started_at).getTime() + input.manualAfterMs;
        if (manual) {
          await client.query(
            `UPDATE amc_practice.learning_batch_provider_artifacts
             SET status = 'RECONCILE_BLOCKED_MANUAL', updated_at = $2 WHERE id = $1`,
            [row.artifact_id, input.reconciledAt]
          );
          await client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'FAILED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'SUBMIT_RECONCILIATION_BLOCKED_MANUAL', updated_at = $2 WHERE id = $1`,
            [input.workItemId, input.reconciledAt]
          );
          await client.query(
            `UPDATE amc_practice.learning_batches
             SET status = 'FAILED', failure_code = 'SUBMIT_RECONCILIATION_BLOCKED_MANUAL', updated_at = $2
             WHERE id = $1`, [row.batch_id, input.reconciledAt]
          );
        } else {
          await client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
                 lease_expires_at = NULL, last_error_code = 'SUBMIT_RECONCILIATION_PENDING', updated_at = $3
             WHERE id = $1`,
            [input.workItemId, transcriptionRetryAt(input.reconciledAt, row.attempt_count), input.reconciledAt]
          );
        }
        await client.query('COMMIT');
        return true;
      }
      const [primaryId, ...extraIds] = transcriptIds;
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET external_id = $2, submitted_at = submit_call_started_at, status = 'DELETE_PENDING',
             provider_retention_not_before = NULL, retention_profile = NULL,
             retention_policy_delay_ms = NULL, upload_request_max_duration_ms = NULL,
             retention_processing_slack_ms = NULL, retention_window_elapsed_at = NULL,
             updated_at = $3 WHERE id = $1`,
        [row.artifact_id, primaryId, input.reconciledAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET status = CASE WHEN status = 'STORED' THEN 'PURGE_PENDING' ELSE status END,
             updated_at = $2 WHERE id = $1`, [row.asset_id, input.reconciledAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = 'AMBIGUOUS_SUBMIT_MATCH_DELETE_REQUIRED',
             updated_at = $2 WHERE id = $1`, [input.workItemId, input.reconciledAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batches
         SET status = 'FAILED', failure_code = 'AMBIGUOUS_SUBMIT_RECONCILED_FOR_DELETE', updated_at = $2
         WHERE id = $1`, [row.batch_id, input.reconciledAt]
      );
      const uploadSource = await client.query(
        `SELECT pending.id, pending.retention_not_before,
                COALESCE((SELECT elapsed.id
                  FROM amc_practice.learning_batch_provider_orphan_audit elapsed
                  WHERE elapsed.source_audit_id = pending.id
                    AND elapsed.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'), pending.id)
                  AS binding_source_id
         FROM amc_practice.learning_batch_provider_orphan_audit pending
         WHERE pending.provider = 'assemblyai' AND pending.event = 'PROVIDER_RETENTION_PENDING'
           AND pending.provider_call_id = $1`, [row.upload_call_id]
      );
      if (uploadSource.rowCount) {
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
            deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
            retention_not_before, evidence_code, created_at, evidenced_at)
           VALUES ($1,$2,'UPLOAD_CALL_BOUND_TO_TRANSCRIPT','assemblyai',$3,$4,$5,$6,$7,$8,$9,
             NULL,$10,'provider-transcript-bound-for-delete',$11,$11)`,
          [randomUUID(), uploadSource.rows[0].binding_source_id, row.batch_id, row.asset_id, input.workItemId,
            input.deletionGeneration, row.upload_call_id, primaryId, input.uploadUrlSha256,
            uploadSource.rows[0].retention_not_before, input.reconciledAt]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
           SET status = 'SUPERSEDED', lease_owner = NULL, lease_token = NULL,
               lease_expires_at = NULL, last_error_code = NULL, updated_at = $2
           WHERE orphan_audit_id = $1
             AND status IN ('QUEUED','RUNNING','MANUAL_VERIFICATION_REQUIRED')`,
          [uploadSource.rows[0].id, input.reconciledAt]
        );
      }
      for (const externalId of extraIds) {
        await queueOrphanTranscript(externalId, 'AMBIGUOUS_SUBMIT_MULTIPLE_MATCHES');
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async recordSubmitted(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.submittedAt });
      if (!row || row.artifact_status !== 'SUBMIT_MAY_HAVE_DELIVERED'
          || row.submit_call_id !== input.submitCallId
          || row.upload_url_hash !== input.uploadUrlSha256 || row.external_id !== null) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET external_id = $2, upload_url_hash = $3, submitted_at = $4,
             status = 'ACTIVE', provider_retention_not_before = NULL,
             retention_profile = NULL, retention_policy_delay_ms = NULL,
             upload_request_max_duration_ms = NULL, retention_processing_slack_ms = NULL,
             retention_window_elapsed_at = NULL,
             poll_attempt_count = 0, poll_started_at = $4, updated_at = $4 WHERE id = $1`,
        [row.artifact_id, input.providerTranscriptId, input.uploadUrlSha256, input.submittedAt]
      );
      const source = await client.query(
        `SELECT pending.id, pending.retention_not_before,
                COALESCE((SELECT elapsed.id
                  FROM amc_practice.learning_batch_provider_orphan_audit elapsed
                  WHERE elapsed.source_audit_id = pending.id
                    AND elapsed.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'), pending.id)
                  AS binding_source_id
         FROM amc_practice.learning_batch_provider_orphan_audit pending
         WHERE pending.provider = 'assemblyai' AND pending.event = 'PROVIDER_RETENTION_PENDING'
           AND pending.provider_call_id = $1`, [row.upload_call_id]
      );
      if (source.rowCount) {
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
            deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
            retention_not_before, evidence_code, created_at, evidenced_at)
           VALUES ($1,$2,'UPLOAD_CALL_BOUND_TO_TRANSCRIPT','assemblyai',$3,$4,$5,$6,$7,$8,$9,
             NULL,$10,'provider-transcript-bound-for-delete',$11,$11)`,
          [randomUUID(), source.rows[0].binding_source_id, row.batch_id, row.asset_id, input.workItemId,
            input.deletionGeneration, row.upload_call_id, input.providerTranscriptId,
            input.uploadUrlSha256, source.rows[0].retention_not_before, input.submittedAt]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
           SET status = 'SUPERSEDED', lease_owner = NULL, lease_token = NULL,
               lease_expires_at = NULL, last_error_code = NULL, updated_at = $2
           WHERE orphan_audit_id = $1
             AND status IN ('QUEUED','RUNNING','MANUAL_VERIFICATION_REQUIRED')`,
          [source.rows[0].id, input.submittedAt]
        );
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = NULL, updated_at = $2 WHERE id = $1`,
        [input.workItemId, input.submittedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordSubmissionFailure(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.failedAt });
      if (!row || row.artifact_status !== 'INTENT_RECORDED') {
        await client.query('ROLLBACK');
        return false;
      }
      if (input.orphanDisposition === 'PROVIDER_RETENTION_PENDING') {
        const auditId = randomUUID();
        const inserted = await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, event, provider, batch_id, asset_id, work_item_id, deletion_generation,
            external_id, upload_url_hash, error_code, retention_not_before,
            evidence_code, created_at, evidenced_at)
           VALUES ($1,'PROVIDER_RETENTION_PENDING','assemblyai',$2,$3,$4,$5,NULL,$6,$7,$8,NULL,$9,NULL)
           ON CONFLICT DO NOTHING RETURNING id`,
          [auditId, row.batch_id, row.asset_id, input.workItemId, input.deletionGeneration,
            input.uploadUrlSha256, input.errorCode, input.providerRetentionNotBefore, input.failedAt]
        );
        let orphanAuditId = inserted.rows[0]?.id;
        if (!orphanAuditId) {
          const existing = await client.query(
            `SELECT id FROM amc_practice.learning_batch_provider_orphan_audit
             WHERE provider = 'assemblyai' AND event = 'PROVIDER_RETENTION_PENDING'
               AND upload_url_hash = $1`, [input.uploadUrlSha256]
          );
          orphanAuditId = existing.rows[0]?.id;
        }
        if (!orphanAuditId) throw new Error('Provider orphan audit idempotency resolution failed.');
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_cleanup_jobs
           (id, orphan_audit_id, batch_id, cleanup_kind, provider, external_id, status,
            attempt_count, available_at, lease_owner, lease_token, lease_expires_at,
            last_error_code, created_at, updated_at)
           VALUES ($1,$2,$3,'OBSERVE_RETENTION_WINDOW','assemblyai',NULL,'QUEUED',0,$4,
             NULL,NULL,NULL,$5,$6,$6)
           ON CONFLICT (orphan_audit_id) DO NOTHING`,
          [randomUUID(), orphanAuditId, row.batch_id, input.providerRetentionNotBefore,
            input.errorCode, input.failedAt]
        );
      }
      const retry = input.retryable === true;
      const availableAt = transcriptionRetryAt(input.failedAt, row.attempt_count, input.retryAfterSeconds);
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = $2, available_at = $3, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $4, updated_at = $5 WHERE id = $1`,
        [input.workItemId, retry ? 'QUEUED' : 'FAILED', availableAt, input.errorCode, input.failedAt]
      );
      if (!retry) {
        await client.query(
          `UPDATE amc_practice.learning_batches
           SET status = 'FAILED', failure_code = $2, updated_at = $3 WHERE id = $1`,
          [row.batch_id, input.errorCode, input.failedAt]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordPollPending(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.polledAt });
      if (!row || row.artifact_status !== 'ACTIVE' || row.external_id !== input.providerTranscriptId) {
        await client.query('ROLLBACK');
        return false;
      }
      const availableAt = transcriptionRetryAt(input.polledAt, row.attempt_count);
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = NULL, updated_at = $3 WHERE id = $1`,
        [input.workItemId, availableAt, input.polledAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async persistNormalizedTranscriptAndScheduleDeletion(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.completedAt });
      if (!row || row.artifact_status !== 'ACTIVE' || row.external_id !== input.providerTranscriptId
          || row.asset_status !== 'STORED') {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `INSERT INTO amc_practice.learning_batch_evidence
         (asset_id, batch_id, source_kind, normalized_text, normalized_sha256,
          duration_ms, transcript_confidence, created_at, purged_at)
         VALUES ($1,$2,'AUDIO_TRANSCRIPT',$3,$4,$5,$6,$7,NULL)`,
        [row.asset_id, row.batch_id, input.transcriptText, input.transcriptSha256,
          Math.max(1, Math.round(input.audioDurationSeconds * 1_000)), input.confidence, input.completedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET status = 'PURGE_PENDING', normalized_at = $2, updated_at = $2 WHERE id = $1`,
        [row.asset_id, input.completedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'DELETE_PENDING', updated_at = $2 WHERE id = $1`,
        [row.artifact_id, input.completedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = NULL, updated_at = $2 WHERE id = $1`,
        [input.workItemId, input.completedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async failTranscriptionAndScheduleDeletion(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.failedAt });
      if (!row || row.artifact_status !== 'ACTIVE' || row.external_id !== input.providerTranscriptId) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET status = 'PURGE_PENDING', updated_at = $2 WHERE id = $1 AND status = 'STORED'`,
        [row.asset_id, input.failedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'DELETE_PENDING', updated_at = $2 WHERE id = $1`,
        [row.artifact_id, input.failedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $3, updated_at = $2 WHERE id = $1`,
        [input.workItemId, input.failedAt, input.errorCode]
      );
      await client.query(
        `UPDATE amc_practice.learning_batches
         SET status = 'FAILED', failure_code = $2, updated_at = $3 WHERE id = $1`,
        [row.batch_id, input.errorCode, input.failedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordPollFailure(input) {
    if (input.scheduleDeletion) return this.failTranscriptionAndScheduleDeletion(input);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.failedAt });
      if (!row || row.artifact_status !== 'ACTIVE' || row.external_id !== input.providerTranscriptId) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $3, updated_at = $4 WHERE id = $1`,
        [input.workItemId, transcriptionRetryAt(input.failedAt, row.attempt_count, input.retryAfterSeconds),
          input.errorCode, input.failedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordLocalAudioPurged(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.purgedAt }, { activeRequired: false });
      if (!row || row.artifact_status !== 'DELETE_PENDING'
          || row.external_id !== input.providerTranscriptId || row.asset_status !== 'PURGE_PENDING') {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET storage_key = NULL, status = 'PURGED', purged_at = $2, updated_at = $2 WHERE id = $1`,
        [row.asset_id, input.purgedAt]
      );
      if (input.localObjectFound === false) {
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, event, provider, batch_id, asset_id, work_item_id, deletion_generation,
            external_id, upload_url_hash, error_code, retention_not_before,
            evidence_code, created_at, evidenced_at)
           VALUES ($1,'LOCAL_AUDIO_ALREADY_ABSENT','local',$2,$3,$4,$5,NULL,NULL,NULL,NULL,
             'idempotent-local-purge-replay',$6,$6)`,
          [randomUUID(), row.batch_id, row.asset_id, input.workItemId,
            input.deletionGeneration, input.purgedAt]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordResolvedOrphanLocalAudioPurged(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(
        client, { ...input, now: input.purgedAt }, { activeRequired: false }
      );
      if (!row || !['DELETION_EVIDENCED','PROVIDER_RETENTION_PENDING',
        'PROVIDER_RETENTION_DELETION_CONFIRMED'].includes(row.artifact_status)
          || (row.artifact_status === 'DELETION_EVIDENCED'
            ? row.external_id !== input.providerTranscriptId
            : input.providerTranscriptId !== null || row.external_id !== null)
          || row.asset_status !== 'PURGE_PENDING') {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET storage_key = NULL, status = 'PURGED', purged_at = $2, updated_at = $2 WHERE id = $1`,
        [row.asset_id, input.purgedAt]
      );
      if (input.localObjectFound === false) {
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
           (id, event, provider, batch_id, asset_id, work_item_id, deletion_generation,
            external_id, upload_url_hash, error_code, retention_not_before,
            evidence_code, created_at, evidenced_at)
           VALUES ($1,'LOCAL_AUDIO_ALREADY_ABSENT','local',$2,$3,$4,$5,NULL,NULL,NULL,NULL,
             'idempotent-local-purge-replay',$6,$6)`,
          [randomUUID(), row.batch_id, row.asset_id, input.workItemId,
            input.deletionGeneration, input.purgedAt]
        );
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'FAILED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             last_error_code = $3, updated_at = $2
         WHERE id = $1`, [input.workItemId, input.purgedAt,
          row.artifact_status === 'DELETION_EVIDENCED'
            ? 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED' : 'UPLOAD_CALL_OUTCOME_AMBIGUOUS']
      );
      await client.query(
        `UPDATE amc_practice.learning_batches b
         SET deletion_state = 'COMPLETE', updated_at = $2
         WHERE b.id = $1 AND b.deletion_state IN ('PROVIDER_DELETE_PENDING','PROVIDER_RETENTION_PENDING')
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_assets a
             WHERE a.batch_id = b.id AND a.status NOT IN ('PURGED','REJECTED')
           )
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_provider_artifacts p
             WHERE p.batch_id = b.id
               AND p.status NOT IN ('DELETION_EVIDENCED','PROVIDER_RETENTION_DELETION_CONFIRMED')
           )
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs pending
             WHERE pending.batch_id = b.id AND pending.status NOT IN ('SUCCEEDED','SUPERSEDED')
           )`, [row.batch_id, input.purgedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordDeletionEvidence(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.evidencedAt }, { activeRequired: false });
      if (!row || row.artifact_status !== 'DELETE_PENDING'
          || row.external_id !== input.providerTranscriptId || row.asset_status !== 'PURGED') {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET status = 'DELETION_EVIDENCED', deletion_evidence_code = $2,
             deletion_evidenced_at = $3, last_delete_error_code = NULL, updated_at = $3
         WHERE id = $1`, [row.artifact_id, input.evidenceType, input.evidencedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'SUCCEEDED', lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = NULL, updated_at = $2 WHERE id = $1`,
        [input.workItemId, input.evidencedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items extraction
         SET status = 'QUEUED', available_at = $2, updated_at = $2
         WHERE extraction.batch_id = $1 AND extraction.work_type = 'BATCH_EXTRACTION'
           AND extraction.status = 'BLOCKED_DEPENDENCY'
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_work_items audio
             WHERE audio.batch_id = extraction.batch_id AND audio.work_type = 'TRANSCRIBE_AUDIO'
               AND audio.status <> 'SUCCEEDED'
           )`, [row.batch_id, input.evidencedAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batches b
         SET deletion_state = 'COMPLETE', updated_at = $2
         WHERE b.id = $1 AND b.deletion_state IN ('PROVIDER_DELETE_PENDING','PROVIDER_RETENTION_PENDING')
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_provider_artifacts p
             WHERE p.batch_id = b.id
               AND p.status NOT IN ('DELETION_EVIDENCED','PROVIDER_RETENTION_DELETION_CONFIRMED')
           )
           AND NOT EXISTS (
             SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
             WHERE j.batch_id = b.id AND j.status NOT IN ('SUCCEEDED','SUPERSEDED')
           )`, [row.batch_id, input.evidencedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordDeletionRetry(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const row = await lockTranscriptionAggregate(client, { ...input, now: input.attemptedAt }, { activeRequired: false });
      if (!row || row.artifact_status !== 'DELETE_PENDING'
          || row.external_id !== input.providerTranscriptId) {
        await client.query('ROLLBACK');
        return false;
      }
      const availableAt = transcriptionRetryAt(input.attemptedAt, row.attempt_count, input.retryAfterSeconds);
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_artifacts
         SET delete_attempt_count = delete_attempt_count + 1, last_delete_attempt_at = $2,
             last_delete_error_code = $3, next_delete_attempt_at = $4, updated_at = $2 WHERE id = $1`,
        [row.artifact_id, input.attemptedAt, input.errorCode, availableAt]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $3, updated_at = $4 WHERE id = $1`,
        [input.workItemId, availableAt, input.errorCode, input.attemptedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordProviderOrphanAudit(event) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const uploadHash = event.uploadUrlSha256 || null;
      const externalId = event.providerTranscriptId || null;
      const createdAt = event.createdAt || event.attemptedAt || event.detectedAt
        || event.evidencedAt || new Date();
      let batchId = event.batchId || null;
      let assetId = event.assetId || null;
      if (event.workItemId) {
        const aggregate = await client.query(
          `SELECT batch_id, asset_id FROM amc_practice.learning_batch_work_items WHERE id = $1`,
          [event.workItemId]
        );
        batchId ||= aggregate.rows[0]?.batch_id || null;
        assetId ||= aggregate.rows[0]?.asset_id || null;
      }
      const evidenceCode = event.event.endsWith('EVIDENCED')
        ? (event.evidenceType || event.evidenceCode || null)
        : event.event === 'LOCAL_AUDIO_ALREADY_ABSENT'
          ? 'idempotent-local-purge-replay' : null;
      const auditId = randomUUID();
      const inserted = await client.query(
        `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
         (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
          deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
          retention_not_before, evidence_code, created_at, evidenced_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT DO NOTHING RETURNING id, batch_id, asset_id, deletion_generation,
           provider_call_id, external_id, upload_url_hash, retention_not_before, created_at`,
        [auditId, event.sourceAuditId || null, event.event, event.provider, batchId, assetId,
          event.workItemId || null, event.deletionGeneration, event.providerCallId || null, externalId, uploadHash,
          event.errorCode || null, event.providerRetentionNotBefore || null, evidenceCode,
          createdAt, event.evidencedAt || null]
      );
      let audit = inserted.rows[0];
      const pending = ['PROVIDER_RETENTION_PENDING', 'ORPHAN_TRANSCRIPT_DELETE_PENDING']
        .includes(event.event);
      if (!audit && pending) {
        const existing = await client.query(
          `SELECT id, batch_id, asset_id, deletion_generation, provider_call_id, external_id, upload_url_hash,
                  retention_not_before, created_at
           FROM amc_practice.learning_batch_provider_orphan_audit
           WHERE provider = $1 AND event = $2
             AND (($3::text IS NOT NULL AND external_id = $3)
               OR ($4::char(64) IS NOT NULL AND upload_url_hash = $4)
               OR ($5::uuid IS NOT NULL AND provider_call_id = $5))`,
          [event.provider, event.event, externalId, uploadHash, event.providerCallId || null]
        );
        audit = existing.rows[0];
      }
      if (!audit) {
        await client.query('COMMIT');
        return true;
      }
      if (event.event === 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED' && event.providerCallId) {
        const resolved = await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts
           SET external_id = $2, submitted_at = submit_call_started_at,
               status = 'DELETION_EVIDENCED', provider_retention_not_before = NULL,
               retention_profile = NULL, retention_policy_delay_ms = NULL,
               upload_request_max_duration_ms = NULL, retention_processing_slack_ms = NULL,
               retention_window_elapsed_at = NULL,
               deletion_evidence_code = $3, deletion_evidenced_at = $4, updated_at = $4
           WHERE submit_call_id = $1 AND status = 'SUBMIT_MAY_HAVE_DELIVERED'
           RETURNING batch_id, asset_id, upload_call_id, upload_url_hash`,
          [event.providerCallId, externalId, evidenceCode, event.evidencedAt || createdAt]
        );
        if (resolved.rowCount) {
          const uploadSource = await client.query(
            `SELECT pending.id, pending.retention_not_before,
                    COALESCE((SELECT elapsed.id
                      FROM amc_practice.learning_batch_provider_orphan_audit elapsed
                      WHERE elapsed.source_audit_id = pending.id
                        AND elapsed.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'), pending.id)
                      AS binding_source_id
             FROM amc_practice.learning_batch_provider_orphan_audit pending
             WHERE pending.provider = 'assemblyai' AND pending.event = 'PROVIDER_RETENTION_PENDING'
               AND pending.provider_call_id = $1`, [resolved.rows[0].upload_call_id]
          );
          if (uploadSource.rowCount) {
            await client.query(
              `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
               (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
                deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
                retention_not_before, evidence_code, created_at, evidenced_at)
               VALUES ($1,$2,'UPLOAD_CALL_BOUND_TO_TRANSCRIPT','assemblyai',$3,$4,$5,$6,$7,$8,$9,
                 NULL,$10,'provider-transcript-bound-for-delete',$11,$11)
               ON CONFLICT DO NOTHING`,
              [randomUUID(), uploadSource.rows[0].binding_source_id, resolved.rows[0].batch_id,
                resolved.rows[0].asset_id, event.workItemId || null, event.deletionGeneration,
                resolved.rows[0].upload_call_id, externalId, resolved.rows[0].upload_url_hash,
                uploadSource.rows[0].retention_not_before, event.evidencedAt || createdAt]
            );
            await client.query(
              `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
               SET status = 'SUPERSEDED', lease_owner = NULL, lease_token = NULL,
                   lease_expires_at = NULL, last_error_code = NULL, updated_at = $2
               WHERE orphan_audit_id = $1
                 AND status IN ('QUEUED','RUNNING','MANUAL_VERIFICATION_REQUIRED')`,
              [uploadSource.rows[0].id, event.evidencedAt || createdAt]
            );
          }
          await client.query(
            `UPDATE amc_practice.learning_batch_assets
             SET status = CASE WHEN status = 'STORED' THEN 'PURGE_PENDING' ELSE status END,
                 updated_at = $2 WHERE id = $1`,
            [resolved.rows[0].asset_id, event.evidencedAt || createdAt]
          );
          if (event.workItemId) await client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = CASE WHEN EXISTS (
                   SELECT 1 FROM amc_practice.learning_batch_assets a
                   WHERE a.id = $3 AND a.status = 'PURGE_PENDING'
                 ) THEN 'QUEUED' ELSE 'FAILED' END,
                 available_at = $2,
                 lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updated_at = $2
             WHERE id = $1`, [event.workItemId, event.evidencedAt || createdAt, resolved.rows[0].asset_id]
          );
          await client.query(
            `UPDATE amc_practice.learning_batches
             SET status = 'FAILED', failure_code = 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updated_at = $2
             WHERE id = $1 AND status = 'PROCESSING'`,
            [resolved.rows[0].batch_id, event.evidencedAt || createdAt]
          );
        }
      }
      if (pending) {
        const cleanupKind = event.event === 'PROVIDER_RETENTION_PENDING'
          ? 'OBSERVE_RETENTION_WINDOW' : 'DELETE_TRANSCRIPT';
        await client.query(
          `INSERT INTO amc_practice.learning_batch_provider_orphan_cleanup_jobs
           (id, orphan_audit_id, batch_id, cleanup_kind, provider, external_id, status,
            attempt_count, available_at, lease_owner, lease_token, lease_expires_at,
            last_error_code, created_at, updated_at)
           VALUES ($1,$2,$3,$4,'assemblyai',$5,'QUEUED',0,$6,NULL,NULL,NULL,$7,$8,$8)
           ON CONFLICT (orphan_audit_id) DO NOTHING`,
          [randomUUID(), audit.id, audit.batch_id, cleanupKind, audit.external_id,
            cleanupKind === 'OBSERVE_RETENTION_WINDOW' ? audit.retention_not_before : audit.created_at,
            event.errorCode || null, audit.created_at]
        );
        if (audit.batch_id) {
          await client.query(
            `UPDATE amc_practice.learning_batches
             SET deletion_state = CASE WHEN $4 = 'PROVIDER_RETENTION_PENDING'
                    THEN 'PROVIDER_RETENTION_PENDING' ELSE 'PROVIDER_DELETE_PENDING' END,
                 updated_at = $2
             WHERE id = $1 AND deletion_state IN ('LOCAL_PURGED','COMPLETE')
               AND EXISTS (
                 SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs pending
                 WHERE pending.orphan_audit_id = $3 AND pending.status NOT IN ('SUCCEEDED','SUPERSEDED')
               )`,
            [audit.batch_id, createdAt, audit.id, event.event]
          );
        }
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async claimNextProviderOrphanCleanup({ workerId, now, leaseMs }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
         SET status = 'QUEUED', available_at = $1, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = 'LEASE_EXPIRED', updated_at = $1
         WHERE status = 'RUNNING' AND lease_expires_at <= $1`, [now]
      );
      const selected = await client.query(
        `SELECT j.*, a.deletion_generation
         FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
         JOIN amc_practice.learning_batch_provider_orphan_audit a ON a.id = j.orphan_audit_id
         WHERE j.status = 'QUEUED' AND j.available_at <= $1
         ORDER BY j.available_at, j.created_at, j.id
         FOR UPDATE OF j SKIP LOCKED LIMIT 1`, [now]
      );
      if (!selected.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      const leaseToken = randomUUID();
      const leaseExpiresAt = new Date(new Date(now).getTime() + leaseMs);
      const updated = await client.query(
        `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
         SET status = 'RUNNING', attempt_count = attempt_count + 1, lease_owner = $2,
             lease_token = $3, lease_expires_at = $4, updated_at = $5
         WHERE id = $1 RETURNING *`,
        [selected.rows[0].id, workerId, leaseToken, leaseExpiresAt, now]
      );
      await client.query('COMMIT');
      return mapProviderOrphanCleanupJob({
        ...updated.rows[0], deletion_generation: selected.rows[0].deletion_generation
      });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async authorizeProviderOrphanCall({ jobId, leaseToken, externalId, now, providerBudget }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const authorized = await client.query(
        `SELECT j.*, b.student_id
         FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
         LEFT JOIN amc_practice.learning_batches b ON b.id = j.batch_id
         WHERE j.id = $1 AND j.cleanup_kind = 'DELETE_TRANSCRIPT' AND j.status = 'RUNNING'
           AND j.lease_token = $2 AND j.external_id = $3 AND j.lease_expires_at > $4
         FOR UPDATE OF j`,
        [jobId, leaseToken, externalId, now]
      );
      const row = authorized.rows[0];
      if (!row || !providerBudget) {
        await client.query('COMMIT');
        return Boolean(row);
      }
      await client.query('SAVEPOINT provider_orphan_budget');
      const student = row.student_id && Number.isSafeInteger(providerBudget.studentLimit)
        ? await consumeStudentBudgetUsing(client, {
          studentId: row.student_id, budgetKind: 'PROVIDER_WORK', units: 1,
          limit: providerBudget.studentLimit, windowMs: providerBudget.windowMs, now
        }) : { allowed: true, retryAfterSeconds: 0 };
      const global = await consumeGlobalBudgetUsing(client, {
        budgetKind: providerBudget.budgetKind || 'PROVIDER_WORK', units: 1,
        limit: providerBudget.globalLimit, windowMs: providerBudget.windowMs, now
      });
      if (!student.allowed || !global.allowed) {
        await client.query('ROLLBACK TO SAVEPOINT provider_orphan_budget');
        const retryAfterSeconds = Math.max(student.retryAfterSeconds || 1, global.retryAfterSeconds || 1);
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
           SET status = 'QUEUED', available_at = $2::timestamptz
                 + ($3::text || ' seconds')::interval,
               lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
               last_error_code = 'PROVIDER_BUDGET_EXHAUSTED', updated_at = $2
           WHERE id = $1`, [jobId, now, retryAfterSeconds]
        );
        await client.query('COMMIT');
        return false;
      }
      await client.query('RELEASE SAVEPOINT provider_orphan_budget');
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async completeProviderOrphanCleanup({ jobId, leaseToken, evidenceType, now }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const locked = await client.query(
        `SELECT j.*, a.event AS source_event, a.batch_id AS source_batch_id,
                a.asset_id, a.work_item_id, a.deletion_generation, a.external_id AS source_external_id,
                a.upload_url_hash, a.retention_not_before, a.provider_call_id
         FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
         JOIN amc_practice.learning_batch_provider_orphan_audit a ON a.id = j.orphan_audit_id
         WHERE j.id = $1 FOR UPDATE OF j`, [jobId]
      );
      const row = locked.rows[0];
      if (!row || row.status !== 'RUNNING' || row.lease_token !== leaseToken
          || new Date(row.lease_expires_at).getTime() <= new Date(now).getTime()) {
        await client.query('ROLLBACK');
        return false;
      }
      const isRetentionWindow = row.cleanup_kind === 'OBSERVE_RETENTION_WINDOW';
      const validEvidence = isRetentionWindow
        ? evidenceType === 'provider-retention-window-elapsed'
          && new Date(row.available_at).getTime() <= new Date(now).getTime()
        : ['provider-delete-response', 'provider-already-absent'].includes(evidenceType);
      if (!validEvidence) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
         (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
          deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
          retention_not_before, evidence_code, created_at, evidenced_at)
         VALUES ($1,$2,$3,'assemblyai',$4,$5,$6,$7,$8,$9,$10,NULL,$11,$12,$13,$13)`,
        [randomUUID(), row.orphan_audit_id,
          isRetentionWindow ? 'PROVIDER_RETENTION_WINDOW_ELAPSED'
            : 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED',
          row.source_batch_id, row.asset_id, row.work_item_id, row.deletion_generation,
          row.provider_call_id, row.source_external_id, row.upload_url_hash,
          row.retention_not_before, evidenceType, now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
         SET status = $3, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = NULL, updated_at = $2
         WHERE id = $1`, [jobId, now,
          isRetentionWindow ? 'MANUAL_VERIFICATION_REQUIRED' : 'SUCCEEDED']
      );
      if (!isRetentionWindow && row.provider_call_id && row.work_item_id) {
        const resolved = await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts p
           SET external_id = $2, submitted_at = submit_call_started_at,
               status = 'DELETION_EVIDENCED', provider_retention_not_before = NULL,
               retention_profile = NULL, retention_policy_delay_ms = NULL,
               upload_request_max_duration_ms = NULL, retention_processing_slack_ms = NULL,
               retention_window_elapsed_at = NULL,
               deletion_evidence_code = $3, deletion_evidenced_at = $4, updated_at = $4
           FROM amc_practice.learning_batch_work_items w
           WHERE p.batch_id = w.batch_id AND p.asset_id = w.asset_id
             AND w.id = $1 AND p.submit_call_id = $5
             AND p.status = 'SUBMIT_MAY_HAVE_DELIVERED'
           RETURNING p.batch_id, p.asset_id, p.upload_call_id, p.upload_url_hash`,
          [row.work_item_id, row.source_external_id, evidenceType, now, row.provider_call_id]
        );
        if (resolved.rowCount) {
          const uploadSource = await client.query(
            `SELECT pending.id, pending.retention_not_before,
                    COALESCE((SELECT elapsed.id
                      FROM amc_practice.learning_batch_provider_orphan_audit elapsed
                      WHERE elapsed.source_audit_id = pending.id
                        AND elapsed.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'), pending.id)
                      AS binding_source_id
             FROM amc_practice.learning_batch_provider_orphan_audit pending
             WHERE pending.provider = 'assemblyai' AND pending.event = 'PROVIDER_RETENTION_PENDING'
               AND pending.provider_call_id = $1`, [resolved.rows[0].upload_call_id]
          );
          if (uploadSource.rowCount) {
            await client.query(
              `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
               (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
                deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
                retention_not_before, evidence_code, created_at, evidenced_at)
               VALUES ($1,$2,'UPLOAD_CALL_BOUND_TO_TRANSCRIPT','assemblyai',$3,$4,$5,$6,$7,$8,$9,
                 NULL,$10,'provider-transcript-bound-for-delete',$11,$11)
               ON CONFLICT DO NOTHING`,
              [randomUUID(), uploadSource.rows[0].binding_source_id, resolved.rows[0].batch_id,
                resolved.rows[0].asset_id, row.work_item_id, row.deletion_generation,
                resolved.rows[0].upload_call_id, row.source_external_id,
                resolved.rows[0].upload_url_hash, uploadSource.rows[0].retention_not_before, now]
            );
            await client.query(
              `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
               SET status = 'SUPERSEDED', lease_owner = NULL, lease_token = NULL,
                   lease_expires_at = NULL, last_error_code = NULL, updated_at = $2
               WHERE orphan_audit_id = $1
                 AND status IN ('QUEUED','RUNNING','MANUAL_VERIFICATION_REQUIRED')`,
              [uploadSource.rows[0].id, now]
            );
          }
          await client.query(
            `UPDATE amc_practice.learning_batch_assets
             SET status = CASE WHEN status = 'STORED' THEN 'PURGE_PENDING' ELSE status END,
                 updated_at = $2 WHERE id = $1`,
            [resolved.rows[0].asset_id, now]
          );
          await client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = CASE WHEN EXISTS (
                   SELECT 1 FROM amc_practice.learning_batch_assets a
                   WHERE a.id = $3 AND a.status = 'PURGE_PENDING'
                 ) THEN 'QUEUED' ELSE 'FAILED' END,
                 available_at = $2,
                 lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updated_at = $2
             WHERE id = $1`, [row.work_item_id, now, resolved.rows[0].asset_id]
          );
          await client.query(
            `UPDATE amc_practice.learning_batches
             SET status = 'FAILED', failure_code = 'AMBIGUOUS_SUBMIT_PROVIDER_DELETED', updated_at = $2
             WHERE id = $1 AND status = 'PROCESSING'`,
            [resolved.rows[0].batch_id, now]
          );
        }
      }
      if (row.source_batch_id) {
        await client.query(
          `UPDATE amc_practice.learning_batches b
           SET deletion_state = 'COMPLETE', updated_at = $2
           WHERE b.id = $1 AND b.deletion_state IN (
             'PROVIDER_DELETE_PENDING','PROVIDER_RETENTION_PENDING'
           )
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_assets a
               WHERE a.batch_id = b.id AND a.status NOT IN ('PURGED','REJECTED')
             )
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_provider_artifacts p
               WHERE p.batch_id = b.id
                 AND p.status NOT IN ('DELETION_EVIDENCED','PROVIDER_RETENTION_DELETION_CONFIRMED')
             )
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs pending
               WHERE pending.batch_id = b.id AND pending.status NOT IN ('SUCCEEDED','SUPERSEDED')
             )`, [row.source_batch_id, now]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async confirmProviderRetentionDeletion({
    jobId, verificationAuthority, verificationReferenceHash, now
  }) {
    if (typeof verificationAuthority !== 'string'
        || verificationAuthority.length < 3 || verificationAuthority.length > 200
        || typeof verificationReferenceHash !== 'string'
        || !/^[0-9a-f]{64}$/.test(verificationReferenceHash)) return false;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const locked = await client.query(
        `SELECT j.*, pending.batch_id AS source_batch_id, pending.asset_id,
                pending.work_item_id, pending.deletion_generation,
                pending.provider_call_id, pending.upload_url_hash,
                pending.retention_not_before, elapsed.id AS elapsed_audit_id,
                elapsed.evidenced_at AS retention_window_elapsed_at
         FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs j
         JOIN amc_practice.learning_batch_provider_orphan_audit pending
           ON pending.id = j.orphan_audit_id AND pending.event = 'PROVIDER_RETENTION_PENDING'
         JOIN amc_practice.learning_batch_provider_orphan_audit elapsed
           ON elapsed.source_audit_id = pending.id
          AND elapsed.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'
         WHERE j.id = $1 AND j.cleanup_kind = 'OBSERVE_RETENTION_WINDOW'
           AND j.status = 'MANUAL_VERIFICATION_REQUIRED'
         FOR UPDATE OF j`, [jobId]
      );
      if (!locked.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      const row = locked.rows[0];
      if (row.work_item_id) {
        const aggregate = await client.query(
          `SELECT p.status AS artifact_status, p.upload_call_id AS artifact_upload_call_id
           FROM amc_practice.learning_batch_work_items w
           JOIN amc_practice.learning_batch_provider_artifacts p
             ON p.batch_id = w.batch_id AND p.asset_id = w.asset_id
           WHERE w.id = $1 FOR UPDATE OF w, p`, [row.work_item_id]
        );
        if (!aggregate.rowCount
            || aggregate.rows[0].artifact_status !== 'PROVIDER_RETENTION_PENDING'
            || aggregate.rows[0].artifact_upload_call_id !== row.provider_call_id) {
          await client.query('ROLLBACK');
          return false;
        }
      }
      await client.query(
        `INSERT INTO amc_practice.learning_batch_provider_orphan_audit
         (id, source_audit_id, event, provider, batch_id, asset_id, work_item_id,
          deletion_generation, provider_call_id, external_id, upload_url_hash, error_code,
          retention_not_before, evidence_code, verification_authority,
          verification_reference_hash, created_at, evidenced_at)
         VALUES ($1,$2,'PROVIDER_RETENTION_DELETION_CONFIRMED','assemblyai',$3,$4,$5,$6,$7,
           NULL,$8,NULL,$9,'independent-provider-deletion-confirmation',$10,$11,$12,$12)`,
        [randomUUID(), row.elapsed_audit_id, row.source_batch_id, row.asset_id,
          row.work_item_id, row.deletion_generation, row.provider_call_id,
          row.upload_url_hash, row.retention_not_before, verificationAuthority,
          verificationReferenceHash, now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
         SET status = 'SUCCEEDED', last_error_code = NULL, updated_at = $2 WHERE id = $1`,
        [jobId, now]
      );
      if (row.work_item_id && row.provider_call_id) {
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts p
           SET status = 'PROVIDER_RETENTION_DELETION_CONFIRMED',
               retention_verification_code = 'independent-provider-deletion-confirmation',
               retention_window_elapsed_at = $5,
               retention_verified_at = $3, updated_at = $3
           FROM amc_practice.learning_batch_work_items w
           WHERE p.batch_id = w.batch_id AND p.asset_id = w.asset_id
             AND w.id = $1 AND w.deletion_generation = $2
             AND p.upload_call_id = $4 AND p.status = 'PROVIDER_RETENTION_PENDING'`,
          [row.work_item_id, row.deletion_generation, now, row.provider_call_id,
            row.retention_window_elapsed_at]
        );
      }
      if (row.source_batch_id) {
        await client.query(
          `UPDATE amc_practice.learning_batches b
           SET deletion_state = 'COMPLETE', updated_at = $2
           WHERE b.id = $1 AND b.deletion_state = 'PROVIDER_RETENTION_PENDING'
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_assets a
               WHERE a.batch_id = b.id AND a.status NOT IN ('PURGED','REJECTED')
             )
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_provider_artifacts p
               WHERE p.batch_id = b.id
                 AND p.status NOT IN ('DELETION_EVIDENCED','PROVIDER_RETENTION_DELETION_CONFIRMED')
             )
             AND NOT EXISTS (
               SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs pending
               WHERE pending.batch_id = b.id AND pending.status NOT IN ('SUCCEEDED','SUPERSEDED')
             )`, [row.source_batch_id, now]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async failProviderOrphanCleanup({ jobId, leaseToken, errorCode, retryAfterSeconds, now }) {
    const availableAt = transcriptionRetryAt(now, 1, retryAfterSeconds);
    const failed = await this.pool.query(
      `UPDATE amc_practice.learning_batch_provider_orphan_cleanup_jobs
       SET status = 'QUEUED', available_at = CASE
             WHEN $4::integer IS NULL THEN $3::timestamptz + LEAST(300, power(2, LEAST(8, GREATEST(0, attempt_count - 1)))) * interval '1 second'
             ELSE $5::timestamptz END,
           lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
           last_error_code = $6, updated_at = $3::timestamptz
       WHERE id = $1 AND status = 'RUNNING' AND lease_token = $2 AND lease_expires_at > $3::timestamptz`,
      [jobId, leaseToken, now, Number.isSafeInteger(retryAfterSeconds) ? retryAfterSeconds : null,
        availableAt, errorCode]
    );
    return failed.rowCount === 1;
  }

  async observePrivateStorageInventory({ objects, partials, now, graceMs, inventoryComplete = true }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const referencedRows = await client.query(
        `SELECT storage_key FROM amc_practice.learning_batch_assets WHERE storage_key IS NOT NULL`
      );
      const referenced = new Set(referencedRows.rows.map((row) => row.storage_key));
      const observed = [
        ...objects.map((value) => ({ kind: 'OBJECT', identity: value.storageKey, ...value })),
        ...partials.map((value) => ({ kind: 'PARTIAL', identity: value.name, ...value }))
      ];
      const seen = [];
      const deletable = [];
      for (const item of observed) {
        seen.push([item.kind, item.identity]);
        if (item.kind === 'OBJECT' && referenced.has(item.identity)) {
          await client.query(
            `DELETE FROM amc_practice.private_storage_reconciliation_candidates
             WHERE storage_kind = $1 AND storage_identity = $2 AND status = 'OBSERVED'`,
            [item.kind, item.identity]
          );
          continue;
        }
        const existing = await client.query(
          `SELECT * FROM amc_practice.private_storage_reconciliation_candidates
           WHERE storage_kind = $1 AND storage_identity = $2 FOR UPDATE`, [item.kind, item.identity]
        );
        const row = existing.rows[0];
        if (!row || number(row.observed_size) !== item.size || number(row.observed_mtime_ms) !== item.mtimeMs
            || row.status === 'DELETED') {
          await client.query(
            `INSERT INTO amc_practice.private_storage_reconciliation_candidates
             (storage_kind, storage_identity, observed_size, observed_mtime_ms, first_seen_at,
              last_seen_at, observation_count, status, deletion_token, deletion_authorized_at, deleted_at)
             VALUES ($1,$2,$3,$4,$5,$5,1,'OBSERVED',NULL,NULL,NULL)
             ON CONFLICT (storage_kind, storage_identity) DO UPDATE
             SET observed_size = EXCLUDED.observed_size, observed_mtime_ms = EXCLUDED.observed_mtime_ms,
                 first_seen_at = EXCLUDED.first_seen_at, last_seen_at = EXCLUDED.last_seen_at,
                 observation_count = 1, status = 'OBSERVED', deletion_token = NULL,
                 deletion_authorized_at = NULL, deleted_at = NULL`,
            [item.kind, item.identity, item.size, item.mtimeMs, now]
          );
          continue;
        }
        if (row.status === 'DELETING') {
          if (new Date(now).getTime() - new Date(row.deletion_authorized_at).getTime() >= graceMs) {
            await client.query(
              `UPDATE amc_practice.private_storage_reconciliation_candidates
               SET status = 'OBSERVED', deletion_token = NULL, deletion_authorized_at = NULL,
                   last_seen_at = $3, observation_count = observation_count + 1
               WHERE storage_kind = $1 AND storage_identity = $2`, [item.kind, item.identity, now]
            );
            deletable.push({ kind: item.kind,
              ...(item.kind === 'OBJECT' ? { storageKey: item.identity } : { name: item.identity }),
              size: item.size, mtimeMs: item.mtimeMs });
          }
          continue;
        }
        if (row.status !== 'OBSERVED') continue;
        const updated = await client.query(
          `UPDATE amc_practice.private_storage_reconciliation_candidates
           SET last_seen_at = $3, observation_count = observation_count + 1
           WHERE storage_kind = $1 AND storage_identity = $2 RETURNING *`,
          [item.kind, item.identity, now]
        );
        const candidate = updated.rows[0];
        if (candidate.observation_count >= 2
            && new Date(now).getTime() - new Date(candidate.first_seen_at).getTime() >= graceMs) {
          deletable.push({ kind: item.kind,
            ...(item.kind === 'OBJECT' ? { storageKey: item.identity } : { name: item.identity }),
            size: item.size, mtimeMs: item.mtimeMs });
        }
      }
      if (inventoryComplete) {
        const seenKeys = new Set(seen.map(([kind, identity]) => `${kind}:${identity}`));
        const unresolved = await client.query(
          `SELECT * FROM amc_practice.private_storage_reconciliation_candidates
           WHERE status IN ('OBSERVED','DELETING') FOR UPDATE`
        );
        for (const candidate of unresolved.rows) {
          if (seenKeys.has(`${candidate.storage_kind}:${candidate.storage_identity}`)) continue;
          if (candidate.status === 'OBSERVED') {
            await client.query(
              `DELETE FROM amc_practice.private_storage_reconciliation_candidates
               WHERE storage_kind = $1 AND storage_identity = $2`,
              [candidate.storage_kind, candidate.storage_identity]
            );
          } else {
            await client.query(
              `UPDATE amc_practice.private_storage_reconciliation_candidates
               SET status = 'DELETED', deleted_at = $3
               WHERE storage_kind = $1 AND storage_identity = $2`,
              [candidate.storage_kind, candidate.storage_identity, now]
            );
            await client.query(
              `INSERT INTO amc_practice.private_storage_reconciliation_events
               (id, storage_kind, storage_identity, event, observed_size, observed_mtime_ms, occurred_at)
               VALUES ($1,$2,$3,'ORPHAN_DELETED',$4,$5,$6)`,
              [randomUUID(), candidate.storage_kind, candidate.storage_identity,
                candidate.observed_size, candidate.observed_mtime_ms, now]
            );
          }
        }
      }
      const candidateCount = await client.query(
        `SELECT count(*)::integer AS count FROM amc_practice.private_storage_reconciliation_candidates
         WHERE status <> 'DELETED'`
      );
      await client.query('COMMIT');
      return { deletable, referencedCount: referenced.size, candidateCount: candidateCount.rows[0].count };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async authorizePrivateStorageDeletion({ kind, storageKey, name, size, mtimeMs, now }) {
    const identity = kind === 'OBJECT' ? storageKey : name;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('amc_private_storage'), hashtext($1))", [identity]
      );
      if (kind === 'OBJECT') {
        const referenced = await client.query(
          `SELECT 1 FROM amc_practice.learning_batch_assets WHERE storage_key = $1 LIMIT 1`, [identity]
        );
        if (referenced.rowCount) {
          await client.query('ROLLBACK');
          return null;
        }
      }
      const deletionToken = randomUUID();
      const updated = await client.query(
        `UPDATE amc_practice.private_storage_reconciliation_candidates
         SET status = 'DELETING', deletion_token = $5, deletion_authorized_at = $6
         WHERE storage_kind = $1 AND storage_identity = $2 AND status = 'OBSERVED'
           AND observed_size = $3 AND observed_mtime_ms = $4 RETURNING storage_identity`,
        [kind, identity, size, mtimeMs, deletionToken, now]
      );
      await client.query('COMMIT');
      return updated.rowCount ? deletionToken : null;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async recordPrivateStorageDeletion({ kind, identity, size, mtimeMs, deletionToken, deleted, deletedAt }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await client.query(
        `UPDATE amc_practice.private_storage_reconciliation_candidates
         SET status = $6, deleted_at = CASE WHEN $7::boolean THEN $8::timestamptz ELSE NULL END,
             deletion_token = CASE WHEN $7::boolean THEN deletion_token ELSE NULL END,
             deletion_authorized_at = CASE WHEN $7::boolean THEN deletion_authorized_at ELSE NULL END
         WHERE storage_kind = $1 AND storage_identity = $2 AND observed_size = $3
           AND observed_mtime_ms = $4 AND status = 'DELETING' AND deletion_token = $5
         RETURNING storage_identity`,
        [kind, identity, size, mtimeMs, deletionToken, deleted ? 'DELETED' : 'OBSERVED', deleted, deletedAt]
      );
      if (!updated.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `INSERT INTO amc_practice.private_storage_reconciliation_events
         (id, storage_kind, storage_identity, event, observed_size, observed_mtime_ms, occurred_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), kind, identity, deleted ? 'ORPHAN_DELETED' : 'DELETE_TARGET_CHANGED',
          size, mtimeMs, deletedAt]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async expireLearningBatchReservations({ now, writingTtlMs, draftTtlMs, limit }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('amc_batch_reconciler'), 0)");
      const reset = await client.query(
        `UPDATE amc_practice.learning_batch_assets a
         SET status = 'RESERVED', writing_started_at = NULL, upload_idempotency_key = NULL,
             last_error_code = 'WRITING_LEASE_EXPIRED', updated_at = $1
         FROM amc_practice.learning_batches b
         WHERE a.batch_id = b.id AND b.status = 'DRAFT' AND b.deletion_state = 'ACTIVE'
           AND a.status = 'WRITING'
           AND a.writing_started_at <= $1::timestamptz - ($2::text || ' milliseconds')::interval`, [now, writingTtlMs]
      );
      const expired = await client.query(
        `SELECT id, deletion_generation FROM amc_practice.learning_batches
         WHERE status = 'DRAFT' AND deletion_state = 'ACTIVE'
           AND created_at <= $1::timestamptz - ($2::text || ' milliseconds')::interval
         ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT $3`, [now, draftTtlMs, limit]
      );
      const purges = [];
      for (const batch of expired.rows) {
        const generation = batch.deletion_generation + 1;
        const assets = await client.query(
          `SELECT storage_key FROM amc_practice.learning_batch_assets
           WHERE batch_id = $1 AND storage_key IS NOT NULL`, [batch.id]
        );
        await client.query(
          `UPDATE amc_practice.learning_batches
           SET deletion_state = 'DELETE_REQUESTED', deletion_generation = $2,
               deleted_at = $3, updated_at = $3 WHERE id = $1`, [batch.id, generation, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_assets
           SET status = CASE WHEN storage_key IS NULL THEN 'REJECTED' ELSE 'PURGE_PENDING' END,
               writing_started_at = NULL, upload_idempotency_key = NULL,
               last_error_code = CASE WHEN storage_key IS NULL THEN 'DRAFT_RESERVATION_EXPIRED' ELSE last_error_code END,
               purged_at = CASE WHEN storage_key IS NULL THEN $2 ELSE purged_at END, updated_at = $2
           WHERE batch_id = $1`, [batch.id, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_quota_reservations
           SET status = 'RELEASED', released_at = $2
           WHERE batch_id = $1 AND status <> 'RELEASED'`, [batch.id, now]
        );
        purges.push({ batchId: batch.id, deletionGeneration: generation,
          storageKeys: assets.rows.map((row) => row.storage_key) });
      }
      await client.query('COMMIT');
      return { writingResetCount: reset.rowCount, purges };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async completeExpiredLearningBatchPurge({ batchId, deletionGeneration, now }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const locked = await client.query(
        `SELECT id FROM amc_practice.learning_batches
         WHERE id = $1 AND status = 'DRAFT' AND deletion_state = 'DELETE_REQUESTED'
           AND deletion_generation = $2 FOR UPDATE`, [batchId, deletionGeneration]
      );
      if (!locked.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_batch_assets
         SET storage_key = NULL, status = CASE WHEN observed_bytes IS NULL THEN 'REJECTED' ELSE 'PURGED' END,
             purged_at = $2, updated_at = $2 WHERE batch_id = $1`, [batchId, now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batch_evidence
         SET normalized_text = NULL, purged_at = $2 WHERE batch_id = $1`, [batchId, now]
      );
      await client.query(
        `UPDATE amc_practice.learning_batches
         SET deletion_state = 'COMPLETE', updated_at = $2 WHERE id = $1`, [batchId, now]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async heartbeatBatchExtractionWork({ workItemId, workerId, leaseToken, now, leaseMs }) {
    const result = await this.pool.query(
      `UPDATE amc_practice.learning_batch_work_items w
       SET lease_expires_at = $4::timestamptz + ($5::text || ' milliseconds')::interval, updated_at = $4
       FROM amc_practice.learning_batches b
       WHERE w.batch_id = b.id AND w.id = $1 AND w.work_type = 'BATCH_EXTRACTION'
         AND w.status = 'RUNNING' AND w.lease_owner = $2 AND w.lease_token = $3
         AND w.lease_expires_at > $4 AND w.deletion_generation = b.deletion_generation
         AND b.status = 'PROCESSING' AND b.deletion_state = 'ACTIVE'
       RETURNING w.id`, [workItemId, workerId, leaseToken, now, leaseMs]
    );
    return result.rowCount === 1;
  }

  async authorizeBatchExtractionProviderCall(input) {
    const authorized = await this.pool.query(
      `SELECT 1
       FROM amc_practice.learning_batch_work_items w
       JOIN amc_practice.learning_batches b ON b.id = w.batch_id
       JOIN amc_practice.learning_submissions s
         ON s.id = b.learning_submission_id AND s.student_id = b.student_id
        AND s.attempt_id = b.attempt_id AND s.form_id = b.form_id AND s.form_version = b.form_version
        AND s.source_type = b.source_type
       JOIN amc_practice.attempts a
         ON a.id = b.attempt_id AND a.student_id = b.student_id
        AND a.form_id = b.form_id AND a.form_version = b.form_version
        AND a.attempt_mode = s.attempt_mode
       WHERE w.id = $1 AND w.work_type = 'BATCH_EXTRACTION' AND w.status = 'RUNNING'
         AND w.lease_owner = $2 AND w.lease_token = $3 AND w.input_hash = $4
         AND w.deletion_generation = $5 AND b.deletion_generation = $5
         AND w.lease_expires_at > $6 AND b.status = 'PROCESSING'
         AND b.deletion_state = 'ACTIVE'
         AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
         AND s.current_version = b.base_version`,
      [input.workItemId, input.workerId, input.leaseToken, input.inputHash,
        input.deletionGeneration, input.now]
    );
    return authorized.rowCount === 1;
  }

  async failBatchExtractionWork(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const failed = await client.query(
        `UPDATE amc_practice.learning_batch_work_items w
         SET status = $8, available_at = $9, lease_owner = NULL, lease_token = NULL,
             lease_expires_at = NULL, last_error_code = $7, updated_at = $4
         FROM amc_practice.learning_batches b
         WHERE w.batch_id = b.id AND w.id = $1 AND w.work_type = 'BATCH_EXTRACTION'
           AND w.status = 'RUNNING' AND w.lease_owner = $2 AND w.lease_token = $3
           AND w.lease_expires_at > $4 AND w.input_hash = $5
           AND w.deletion_generation = $6 AND b.deletion_generation = $6
           AND b.status = 'PROCESSING' AND b.deletion_state = 'ACTIVE'
         RETURNING w.batch_id`,
        [input.workItemId, input.workerId, input.expectedLeaseToken, input.now,
          input.expectedInputHash, input.expectedDeletionGeneration, input.errorCode,
          input.retry ? 'QUEUED' : 'FAILED', input.availableAt]
      );
      if (!failed.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      if (!input.retry) {
        await client.query(
          `UPDATE amc_practice.learning_batches
           SET status = 'FAILED', failure_code = $2, updated_at = $3 WHERE id = $1`,
          [failed.rows[0].batch_id, input.errorCode, input.now]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async heartbeatLearningAnalysisWork({ workItemId, workerId, leaseToken, now, leaseMs }) {
    const result = await this.pool.query(
      `UPDATE amc_practice.learning_work_items
       SET lease_expires_at = $3::timestamptz + ($4::text || ' milliseconds')::interval, updated_at = $3
       WHERE id = $1 AND status = 'RUNNING' AND lease_owner = $2 AND lease_token = $5 AND lease_expires_at > $3
       RETURNING id`, [workItemId, workerId, now, leaseMs, leaseToken]
    );
    return result.rowCount === 1;
  }

  async authorizeLearningAnalysisProviderCall(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const core = await client.query(
        `SELECT v.form_id, v.form_version, v.context_status, v.context_set_id,
                s.current_version, q.selected_option, q.reasoning_text,
                fq.correct_option, fr.question_bundle_hash, fr.content_hash, fr.manifest_hash
         FROM amc_practice.learning_work_items w
         JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
         JOIN amc_practice.learning_submission_versions v ON v.id = w.learning_submission_version_id
         JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
         JOIN amc_practice.attempts a
           ON a.id = s.attempt_id AND a.student_id = s.student_id
          AND a.form_id = s.form_id AND a.form_version = s.form_version
          AND a.attempt_mode = s.attempt_mode
         JOIN amc_practice.form_revisions fr ON fr.form_id = v.form_id AND fr.version = v.form_version
         JOIN amc_practice.form_questions fq
           ON fq.form_id = v.form_id AND fq.form_version = v.form_version
          AND fq.question_number = $14
         JOIN amc_practice.learning_question_responses q
           ON q.learning_submission_version_id = v.id AND q.question_number = $14
         LEFT JOIN amc_practice.learning_batches b ON b.id = v.batch_id
         WHERE w.id = $1 AND r.id = $2 AND w.status = 'RUNNING' AND w.lease_owner = $3
           AND w.lease_token = $4 AND w.lease_expires_at > $13
           AND w.input_hash = $5 AND r.input_hash = $5
           AND w.deletion_generation = $6 AND r.deletion_generation = $6
           AND w.learning_submission_version_id = $7 AND v.id = $7
           AND v.version_number = $8 AND r.version_number = $8
           AND v.evidence_hash = $9 AND r.evidence_hash = $9
           AND s.student_id = $10 AND a.student_id = $10
           AND s.current_version = $11
           AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
           AND v.context_status = 'CONTEXT_READY'
           AND v.context_set_id = $12 AND r.context_set_id = $12 AND r.status = 'RUNNING'
           AND (v.batch_id IS NULL OR (b.deletion_state = 'ACTIVE' AND b.deletion_generation = $6))`,
        [input.workItemId, input.analysisRunId, input.workerId, input.leaseToken,
          input.inputHash, input.deletionGeneration, input.versionId, input.versionNumber,
          input.evidenceHash, input.expectedStudentId, input.expectedSubmissionCurrentVersion,
          input.expectedContextSetId, input.now, input.questionNumber]
      );
      const row = core.rows[0];
      if (!row || row.correct_option !== input.officialAnswer) {
        await client.query('ROLLBACK');
        return false;
      }
      const responseHash = canonicalHash({
        questionNumber: input.questionNumber,
        selectedOption: row.selected_option,
        reasoningText: row.reasoning_text
      });
      const contextSet = await loadApprovedContextSet(client, input.expectedContextSetId);
      const question = contextSet?.questions
        .find((candidate) => candidate.questionNumber === input.questionNumber);
      const liveEligible = (question?.solutions || [])
        .filter((solution) => solution.modelEligibility?.eligible === true
          && solution.authorityReceipt?.status === 'active')
        .map((solution) => ({
          artifactSolutionId: solution.artifactSolutionId,
          bodySha256: solution.bodySha256,
          sourceSha256: solution.sourceRef.sha256,
          decisionRecordHash: solution.decisionRecordHash,
          authorityReceiptId: solution.authorityReceipt.receiptId
        }));
      const authorized = Boolean(contextSet && question
        && contextSet.formId === row.form_id && contextSet.formVersion === row.form_version
        && contextSet.releaseBinding?.questionBundleHash === row.question_bundle_hash
        && contextSet.releaseBinding?.contentHash === row.content_hash
        && contextSet.releaseBinding?.manifestHash === row.manifest_hash
        && question.questionContentHash === input.questionContextHash
        && responseHash === input.questionResponseHash && liveEligible.length >= 2
        && JSON.stringify(liveEligible) === JSON.stringify(input.eligibleSolutions));
      await client.query('COMMIT');
      return authorized;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async completeLearningAnalysisWork(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const valid = await client.query(
        `SELECT w.id, v.id AS version_id
         FROM amc_practice.learning_work_items w
         JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
         JOIN amc_practice.learning_submission_versions v ON v.id = w.learning_submission_version_id
         JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
         JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = $7
           AND a.attempt_mode = s.attempt_mode
         WHERE w.id = $1 AND r.id = $2 AND w.status = 'RUNNING' AND w.lease_owner = $3
           AND w.lease_token = $10
           AND r.status = 'RUNNING' AND w.learning_submission_version_id = v.id
           AND w.lease_expires_at > $4 AND w.input_hash = $5 AND r.input_hash = $5
           AND w.deletion_generation = $8 AND r.deletion_generation = $8
           AND v.version_number = $6
           AND s.student_id = $7
           AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
           AND v.context_set_id = $9 AND r.context_set_id = $9
         FOR UPDATE OF w, r, v, s`,
        [input.workItemId, input.analysisRunId, input.workerId, input.now, input.expectedInputHash,
          input.expectedVersionNumber, input.expectedStudentId, input.expectedDeletionGeneration,
          input.expectedContextSetId, input.expectedLeaseToken]
      );
      if (!valid.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      const responseNumbers = await client.query(
        `SELECT question_number FROM amc_practice.learning_question_responses
         WHERE learning_submission_version_id = $1 ORDER BY question_number`, [valid.rows[0].version_id]
      );
      const outcomeNumbers = input.outcomes.map((outcome) => outcome.questionNumber);
      if (outcomeNumbers.length !== responseNumbers.rowCount || new Set(outcomeNumbers).size !== outcomeNumbers.length
          || outcomeNumbers.some((number, index) => number !== responseNumbers.rows[index].question_number)) {
        throw Object.assign(new Error('Analysis outcomes must cover every response exactly once in question order.'), {
          code: 'INVALID_ANALYSIS_OUTCOMES'
        });
      }
      for (const outcome of input.outcomes) {
        await client.query(
          `INSERT INTO amc_practice.learning_question_analyses
           (analysis_run_id, question_number, status, provider_invoked, reasoning_verdict,
            summary_markdown, strengths, gaps, suggestions, solution_comparisons, confidence,
            outcome_code, run_metadata, error_class, retryable,
            question_input_hash, question_context_hash, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13::jsonb,$14,$15,$16,$17,$18)`,
          [input.analysisRunId, outcome.questionNumber, outcome.status, outcome.providerInvoked,
            outcome.reasoningVerdict, outcome.summaryMarkdown, JSON.stringify(outcome.strengths),
            JSON.stringify(outcome.gaps), JSON.stringify(outcome.suggestions),
            JSON.stringify(outcome.solutionComparisons), outcome.confidence, outcome.outcomeCode,
            outcome.runMetadata === null ? null : JSON.stringify(outcome.runMetadata), outcome.errorClass,
            outcome.retryable, outcome.questionInputHash, outcome.questionContextHash, input.now]
        );
      }
      await client.query(
        `INSERT INTO amc_practice.learning_reports
         (id, analysis_run_id, learning_submission_version_id, status, generated_at, summary, report_hash)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
        [randomUUID(), input.analysisRunId, valid.rows[0].version_id, input.report.status,
          input.report.generatedAt, JSON.stringify(input.report.summary), input.report.reportHash]
      );
      await client.query(
        `UPDATE amc_practice.learning_analysis_runs
         SET status = $2, completed_at = $3, last_error_code = NULL WHERE id = $1`,
        [input.analysisRunId, input.report.status, input.now]
      );
      const workStatus = input.report.status === 'PARTIAL' ? 'PARTIAL' : input.report.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED';
      await client.query(
        `UPDATE amc_practice.learning_work_items
         SET status = $2, lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             last_error_code = $3, updated_at = $4 WHERE id = $1`,
        [input.workItemId, workStatus, input.report.status === 'FAILED' ? 'ANALYSIS_FAILED' : null, input.now]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async retryLearningAnalysisWork(input) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const valid = await client.query(
        `SELECT w.id
         FROM amc_practice.learning_work_items w
         JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
         JOIN amc_practice.learning_submission_versions v ON v.id = w.learning_submission_version_id
         JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id
         JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = $7
           AND a.attempt_mode = s.attempt_mode
         WHERE w.id = $1 AND r.id = $2 AND w.status = 'RUNNING' AND w.lease_owner = $3
           AND w.lease_token = $10
           AND r.status = 'RUNNING' AND w.lease_expires_at > $4
           AND w.input_hash = $5 AND r.input_hash = $5
           AND w.deletion_generation = $8 AND r.deletion_generation = $8
           AND v.version_number = $6
           AND s.student_id = $7
           AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
           AND v.context_set_id = $9 AND r.context_set_id = $9
         FOR UPDATE OF w, r, v, s`,
        [input.workItemId, input.analysisRunId, input.workerId, input.now, input.expectedInputHash,
          input.expectedVersionNumber, input.expectedStudentId, input.expectedDeletionGeneration,
          input.expectedContextSetId, input.expectedLeaseToken]
      );
      if (!valid.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE amc_practice.learning_work_items
         SET status = 'QUEUED', available_at = $2, lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             last_error_code = $3, updated_at = $4 WHERE id = $1`,
        [input.workItemId, input.availableAt, input.lastErrorCode, input.now]
      );
      await client.query(
        `UPDATE amc_practice.learning_analysis_runs
         SET status = 'QUEUED', started_at = NULL, last_error_code = $2 WHERE id = $1`,
        [input.analysisRunId, input.lastErrorCode]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async getForm(id, version = undefined) {
    return getFormUsing(this.pool, id, version);
  }

  async listForms({ includeUnpublished = false } = {}) {
    const result = await this.pool.query(
      `WITH current_revisions AS (
         SELECT DISTINCT ON (form_id) *
         FROM amc_practice.form_revisions
         ${includeUnpublished ? '' : 'WHERE published = true'}
         ORDER BY form_id, published DESC, published_at DESC NULLS LAST, imported_at DESC
       )
       SELECT f.*, (
         SELECT count(*)::integer
         FROM amc_practice.form_questions q
         WHERE q.form_id = f.form_id AND q.form_version = f.version
       ) AS question_count,
       (
         SELECT count(*)::integer
         FROM amc_practice.form_questions q
         WHERE q.form_id = f.form_id AND q.form_version = f.version AND q.is_scored = true
       ) AS scored_question_count
       FROM current_revisions f
       ORDER BY f.form_id`,
    );
    return result.rows.map((row) => ({ ...mapFormHeader(row), questions: Array.from({ length: row.question_count }) }));
  }

  async findOrCreateActiveAttempt({ studentId, form, now }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Lock on the logical student/form pair before checking for an active
      // attempt; this closes the no-row-yet race without relying on retries.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [studentId, form.id]);
      const existing = await client.query(
        `SELECT * FROM amc_practice.attempts WHERE student_id = $1 AND form_id = $2
         AND attempt_mode = 'TIMED' AND phase NOT IN ('FINALIZED', 'RESET')
         ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
        [studentId, form.id]
      );
      if (existing.rowCount) {
        await client.query('COMMIT');
        return { attempt: mapAttempt(existing.rows[0]), created: false };
      }
      const attempt = await insertAttempt(client, { studentId, form, now });
      await client.query('COMMIT');
      return { attempt, created: true };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async getAttempt(id) {
    const result = await this.pool.query('SELECT * FROM amc_practice.attempts WHERE id = $1', [id]);
    return mapAttempt(result.rows[0]);
  }

  async listAttemptsForStudent(studentId) {
    const result = await this.pool.query(
      `SELECT * FROM amc_practice.attempts
       WHERE student_id = $1 AND attempt_mode = 'TIMED' ORDER BY created_at DESC`, [studentId]
    );
    return result.rows.map(mapAttempt);
  }

  async listDeadlineCandidates(now) {
    const result = await this.pool.query(
      `SELECT id FROM amc_practice.attempts
       WHERE attempt_mode = 'TIMED' AND phase = 'TIMED'
       AND clock_state = 'RUNNING' AND clock_started_at IS NOT NULL
       AND clock_started_at + ((duration_ms - active_elapsed_ms) * interval '1 millisecond') <= $1`,
      [now]
    );
    return result.rows.map((row) => row.id);
  }

  async publishOpenReviewRelease({
    formId, formVersion, contextSetId, authorityId, reasonCode, now, releaseId = randomUUID()
  }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const form = await getFormUsing(client, formId, formVersion);
      const context = await loadApprovedContextSet(client, contextSetId);
      if (!form) throw Object.assign(new Error('Open review form revision is missing.'), { code: 'FORM_REVISION_NOT_FOUND' });
      if (!context) throw Object.assign(new Error('Approved context set is missing.'), { code: 'OPEN_REVIEW_CONTEXT_INVALID' });
      const existing = await client.query(
        'SELECT * FROM amc_practice.open_review_releases WHERE form_id = $1 AND form_version = $2',
        [formId, formVersion]
      );
      if (existing.rowCount) {
        if (existing.rows[0].context_set_id !== contextSetId) {
          throw Object.assign(new Error('Exact form revision already has another open review release.'), {
            code: 'OPEN_REVIEW_RELEASE_EXISTS'
          });
        }
        await client.query('COMMIT');
        return mapOpenReviewRelease(existing.rows[0]);
      }
      const releaseHash = openReviewReleaseHash({ form, context });
      const inserted = await client.query(
        `INSERT INTO amc_practice.open_review_releases
         (id, schema_version, form_id, form_version, context_set_id, release_hash,
          manifest_hash, content_hash, question_bundle_hash, context_artifact_set_hash,
          approval_authority_id, status, transition_authority_id, transition_reason_code,
          published_at, state_revision, created_at, updated_at)
         VALUES ($1,'amc-open-review-release-v1',$2,$3,$4,$5,$6,$7,$8,$9,$10,'ACTIVE',$11,$12,$13,0,$13,$13)
         RETURNING *`,
        [releaseId, formId, formVersion, contextSetId, releaseHash, form.manifestHash,
          form.contentHash, form.questionBundleHash, context.artifactSetHash,
          context.approvalAuthorityId, authorityId, reasonCode, now]
      );
      await client.query('COMMIT');
      return mapOpenReviewRelease(inserted.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      if (error?.code === '23505'
          && ['amc_one_active_open_review_release_idx', 'amc_one_active_open_review_bundle_idx']
            .includes(error.constraint)) {
        throw Object.assign(new Error('The question bundle already has an active open review release.'), {
          code: 'OPEN_REVIEW_ACTIVE_CONFLICT'
        });
      }
      if (error?.code === '23505'
          && ['amc_open_review_release_exact_unique', 'open_review_releases_release_hash_key']
            .includes(error.constraint)) {
        throw Object.assign(new Error('Exact form revision already has an open review release.'), {
          code: 'OPEN_REVIEW_RELEASE_EXISTS'
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async transitionOpenReviewRelease({ releaseId, nextStatus, authorityId, reasonCode, now }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const identity = await client.query(
        `SELECT form_id, form_version, question_bundle_hash
         FROM amc_practice.open_review_releases WHERE id = $1`, [releaseId]
      );
      if (!identity.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('amc_open_delivery_bundle'), hashtext($1))",
        [identity.rows[0].question_bundle_hash]
      );
      await client.query(
        `SELECT 1 FROM amc_practice.form_revisions
         WHERE form_id = $1 AND version = $2 FOR UPDATE`,
        [identity.rows[0].form_id, identity.rows[0].form_version]
      );
      const release = await client.query(
        'SELECT * FROM amc_practice.open_review_releases WHERE id = $1 FOR UPDATE', [releaseId]
      );
      const current = release.rows[0];
      const allowed = (current.status === OPEN_REVIEW_STATUS.ACTIVE
          && [OPEN_REVIEW_STATUS.SUPERSEDED_VALID, OPEN_REVIEW_STATUS.REVOKED].includes(nextStatus))
        || (current.status === OPEN_REVIEW_STATUS.SUPERSEDED_VALID && nextStatus === OPEN_REVIEW_STATUS.REVOKED);
      if (!allowed) throw Object.assign(new Error('Invalid open review release transition.'), {
        code: 'OPEN_REVIEW_TRANSITION_INVALID'
      });
      const transitioned = await client.query(
        `UPDATE amc_practice.open_review_releases
         SET status = $2, transition_authority_id = $3, transition_reason_code = $4,
             superseded_at = CASE WHEN $2 = 'SUPERSEDED_VALID' THEN $5 ELSE superseded_at END,
             revoked_at = CASE WHEN $2 = 'REVOKED' THEN $5 ELSE NULL END,
             state_revision = state_revision + 1, updated_at = $5
         WHERE id = $1 RETURNING *`,
        [releaseId, nextStatus, authorityId, reasonCode, now]
      );
      if (nextStatus === OPEN_REVIEW_STATUS.REVOKED) {
        await client.query(
          `UPDATE amc_practice.learning_work_items work
           SET status = 'CANCELLED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
               last_error_code = 'OPEN_REVIEW_REVOKED', updated_at = $2
           FROM amc_practice.learning_submission_versions version
           JOIN amc_practice.learning_submissions submission
             ON submission.id = version.learning_submission_id
           WHERE submission.open_review_release_id = $1
             AND work.learning_submission_version_id = version.id
             AND work.status IN ('BLOCKED_CONTEXT','QUEUED','RUNNING')`, [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_analysis_runs run
           SET status = 'CANCELLED', completed_at = $2, last_error_code = 'OPEN_REVIEW_REVOKED'
           FROM amc_practice.learning_submission_versions version
           JOIN amc_practice.learning_submissions submission
             ON submission.id = version.learning_submission_id
           WHERE submission.open_review_release_id = $1
             AND run.learning_submission_version_id = version.id
             AND run.status IN ('QUEUED','RUNNING')`, [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_work_items work
           SET status = 'CANCELLED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
               last_error_code = 'OPEN_REVIEW_REVOKED', updated_at = $2
           FROM amc_practice.learning_batches batch
           JOIN amc_practice.learning_submissions submission
             ON submission.id = batch.learning_submission_id
           WHERE submission.open_review_release_id = $1 AND work.batch_id = batch.id
             AND work.work_type = 'BATCH_EXTRACTION'
             AND work.status IN ('BLOCKED_DEPENDENCY','QUEUED','RUNNING')`, [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batches batch
           SET status = 'FAILED', failure_code = 'OPEN_REVIEW_REVOKED', updated_at = $2
           FROM amc_practice.learning_submissions submission
           WHERE submission.id = batch.learning_submission_id
             AND submission.open_review_release_id = $1
             AND batch.status IN ('PROCESSING','NEEDS_CONFIRMATION')`, [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_provider_artifacts artifact
           SET status = CASE
                 WHEN artifact.status = 'ACTIVE' THEN 'DELETE_PENDING'
                 WHEN artifact.status IN ('UPLOAD_MAY_HAVE_DELIVERED','UPLOAD_RESPONSE_PERSISTED')
                   THEN 'PROVIDER_RETENTION_PENDING'
                 ELSE artifact.status END,
               updated_at = $2
           FROM amc_practice.learning_batches batch
           JOIN amc_practice.learning_submissions submission
             ON submission.id = batch.learning_submission_id
           WHERE artifact.batch_id = batch.id AND submission.open_review_release_id = $1
             AND artifact.status IN ('ACTIVE','UPLOAD_MAY_HAVE_DELIVERED','UPLOAD_RESPONSE_PERSISTED')`,
          [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_assets asset
           SET status = 'PURGE_PENDING', updated_at = $2
           FROM amc_practice.learning_batch_provider_artifacts artifact
           JOIN amc_practice.learning_batches batch ON batch.id = artifact.batch_id
           JOIN amc_practice.learning_submissions submission
             ON submission.id = batch.learning_submission_id
           WHERE asset.batch_id = artifact.batch_id AND asset.id = artifact.asset_id
             AND submission.open_review_release_id = $1 AND asset.status = 'STORED'
             AND artifact.status IN ('DELETE_PENDING','PROVIDER_RETENTION_PENDING')`, [releaseId, now]
        );
        await client.query(
          `UPDATE amc_practice.learning_batch_work_items work
           SET status = CASE WHEN artifact.status = 'INTENT_RECORDED' THEN 'CANCELLED' ELSE 'QUEUED' END,
               available_at = $2, lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
               last_error_code = CASE WHEN artifact.status = 'INTENT_RECORDED'
                 THEN 'OPEN_REVIEW_REVOKED' ELSE 'OPEN_REVIEW_REVOKED_CLEANUP' END,
               updated_at = $2
           FROM amc_practice.learning_batch_provider_artifacts artifact
           JOIN amc_practice.learning_batches batch ON batch.id = artifact.batch_id
           JOIN amc_practice.learning_submissions submission
             ON submission.id = batch.learning_submission_id
           WHERE work.batch_id = artifact.batch_id AND work.asset_id = artifact.asset_id
             AND work.work_type = 'TRANSCRIBE_AUDIO' AND submission.open_review_release_id = $1
             AND artifact.status IN ('INTENT_RECORDED','SUBMIT_MAY_HAVE_DELIVERED',
               'DELETE_PENDING','PROVIDER_RETENTION_PENDING')`, [releaseId, now]
        );
      }
      await client.query('COMMIT');
      return mapOpenReviewRelease(transitioned.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async listActiveOpenReviewReleases() {
    const result = await this.pool.query(
      `SELECT * FROM amc_practice.open_review_releases
       WHERE status = 'ACTIVE' ORDER BY form_id, published_at DESC`
    );
    return result.rows.map(mapOpenReviewRelease);
  }

  async getOpenReviewRelease(id) {
    const result = await this.pool.query(
      'SELECT * FROM amc_practice.open_review_releases WHERE id = $1', [id]
    );
    return mapOpenReviewRelease(result.rows[0]);
  }

  async listOpenReviewWorkspaces(studentId) {
    const result = await this.pool.query(
      `SELECT to_jsonb(attempt.*) AS attempt, to_jsonb(submission.*) AS submission,
              release.status AS release_status,
              CASE WHEN version.creation_reason = 'OPEN_REVIEW_ANCHOR' THEN 'AWAITING_BATCH'
                ELSE COALESCE(work.status, 'BLOCKED_CONTEXT') END AS analysis_status
       FROM amc_practice.attempts attempt
       JOIN amc_practice.learning_submissions submission ON submission.attempt_id = attempt.id
       JOIN amc_practice.open_review_releases release ON release.id = submission.open_review_release_id
       JOIN amc_practice.learning_submission_versions version
         ON version.learning_submission_id = submission.id
        AND version.version_number = submission.current_version
       LEFT JOIN amc_practice.learning_work_items work
         ON work.learning_submission_version_id = version.id
        AND work.work_type = 'ANALYZE_SUBMISSION'
       WHERE attempt.student_id = $1 AND attempt.attempt_mode = 'OPEN_REVIEW'
       ORDER BY attempt.created_at DESC`, [studentId]
    );
    return result.rows.map((row) => ({
      attempt: mapAttempt(row.attempt),
      learningSubmission: mapLearningSubmission(row.submission),
      releaseStatus: row.release_status,
      analysisStatus: row.analysis_status
    }));
  }

  async listLearningHistoryRecords(studentId, { limit, cursor = null }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const result = await client.query(
      `WITH page AS MATERIALIZED (
         SELECT * FROM amc_practice.learning_submissions
         WHERE student_id = $1
           AND ($2::timestamptz IS NULL OR (updated_at, id) < ($2::timestamptz, $3::uuid))
         ORDER BY updated_at DESC, id DESC
         LIMIT $4
       )
       SELECT submission.*, to_jsonb(attempt.*) AS attempt, form.title,
              to_jsonb(release.*) AS release, to_jsonb(current_version.*) AS current_version_record,
              to_jsonb(current_work.*) AS work_item_record, to_jsonb(current_report.*) AS report_record,
              submission.updated_at AS pagination_at,
              GREATEST(
                submission.updated_at,
                COALESCE((SELECT max(v.created_at) FROM amc_practice.learning_submission_versions v
                  WHERE v.learning_submission_id = submission.id), submission.updated_at),
                COALESCE((SELECT max(w.updated_at) FROM amc_practice.learning_work_items w
                  JOIN amc_practice.learning_submission_versions v
                    ON v.id = w.learning_submission_version_id
                  WHERE v.learning_submission_id = submission.id), submission.updated_at),
                COALESCE((SELECT max(r.generated_at) FROM amc_practice.learning_reports r
                  JOIN amc_practice.learning_submission_versions v
                    ON v.id = r.learning_submission_version_id
                  WHERE v.learning_submission_id = submission.id), submission.updated_at),
                COALESCE((SELECT max(batch.updated_at) FROM amc_practice.learning_batches batch
                  WHERE batch.learning_submission_id = submission.id), submission.updated_at)
              ) AS activity_at
       FROM page submission
       JOIN amc_practice.attempts attempt
         ON attempt.id = submission.attempt_id AND attempt.student_id = submission.student_id
       JOIN amc_practice.form_revisions form
         ON form.form_id = submission.form_id AND form.version = submission.form_version
       JOIN amc_practice.learning_submission_versions current_version
         ON current_version.learning_submission_id = submission.id
        AND current_version.version_number = submission.current_version
       LEFT JOIN amc_practice.learning_work_items current_work
         ON current_work.learning_submission_version_id = current_version.id
        AND current_work.work_type = 'ANALYZE_SUBMISSION'
       LEFT JOIN amc_practice.learning_reports current_report
         ON current_report.learning_submission_version_id = current_version.id
       LEFT JOIN amc_practice.open_review_releases release
         ON release.id = submission.open_review_release_id
       ORDER BY submission.updated_at DESC, submission.id DESC`,
      [studentId, cursor?.updatedAt || null, cursor?.submissionId || null, limit + 1]
    );
      if (!result.rowCount) {
        await client.query('COMMIT');
        return [];
      }
      const summaries = await client.query(
      `SELECT version.*, to_jsonb(work.*) AS work_item, to_jsonb(report.*) AS report,
              to_jsonb(batch.*) AS batch,
              (SELECT count(*)::integer
                 FROM amc_practice.learning_question_responses response
                WHERE response.learning_submission_version_id = version.id) AS response_count,
              COALESCE((SELECT array_agg(response.question_number ORDER BY response.question_number)
                 FROM amc_practice.learning_question_responses response
                WHERE response.learning_submission_version_id = version.id), ARRAY[]::smallint[]) AS question_numbers,
              CASE
                WHEN version.batch_id IS NOT NULL THEN EXISTS (
                  SELECT 1 FROM amc_practice.learning_batch_results batch_result
                   WHERE batch_result.learning_submission_version_id = version.id)
                WHEN version.version_number = 1 AND submission.official_submission_id IS NOT NULL THEN EXISTS (
                  SELECT 1 FROM amc_practice.submission_answers answer
                   WHERE answer.submission_id = submission.official_submission_id)
                ELSE false
              END AS has_result
       FROM amc_practice.learning_submission_versions version
       JOIN amc_practice.learning_submissions submission
         ON submission.id = version.learning_submission_id
       LEFT JOIN amc_practice.learning_work_items work
         ON work.learning_submission_version_id = version.id
        AND work.work_type = 'ANALYZE_SUBMISSION'
       LEFT JOIN amc_practice.learning_reports report
         ON report.learning_submission_version_id = version.id
       LEFT JOIN amc_practice.learning_batches batch ON batch.id = version.batch_id
       WHERE version.learning_submission_id = ANY($1::uuid[])
       ORDER BY version.learning_submission_id, version.version_number`,
      [result.rows.map((row) => row.id)]
    );
      const versionsBySubmission = new Map();
      for (const row of summaries.rows) {
        const values = versionsBySubmission.get(row.learning_submission_id) || [];
        values.push({
          version: mapLearningVersion(row),
          responses: [], responseCount: row.response_count, questionNumbers: row.question_numbers,
          workItems: row.work_item ? [mapLearningWorkItem(row.work_item)] : [],
          resultItems: [], hasResult: row.has_result,
          report: mapLearningReport(row.report), batch: mapLearningBatch(row.batch)
        });
        versionsBySubmission.set(row.learning_submission_id, values);
      }
      const records = result.rows.map((row) => ({
        submission: mapLearningSubmission(row),
        attempt: mapAttempt(row.attempt),
        form: { id: row.form_id, version: row.form_version, title: row.title },
        release: mapOpenReviewRelease(row.release),
        currentVersion: mapLearningVersion(row.current_version_record),
        workItem: mapLearningWorkItem(row.work_item_record),
        report: mapLearningReport(row.report_record),
        activityAt: row.activity_at,
        paginationAt: row.pagination_at,
        versions: versionsBySubmission.get(row.id) || []
      }));
      await client.query('COMMIT');
      return records;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async getLearningHistoryRecord(studentId, submissionId) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const header = await client.query(
      `SELECT submission.*, to_jsonb(attempt.*) AS attempt, to_jsonb(release.*) AS release
       FROM amc_practice.learning_submissions submission
       JOIN amc_practice.attempts attempt
         ON attempt.id = submission.attempt_id AND attempt.student_id = submission.student_id
       LEFT JOIN amc_practice.open_review_releases release
         ON release.id = submission.open_review_release_id
       WHERE submission.student_id = $1 AND submission.id = $2`, [studentId, submissionId]
    );
      if (!header.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      const submission = mapLearningSubmission(header.rows[0]);
      // A pg Client executes one statement at a time. Keep the snapshot reads
      // explicit and sequential rather than implying cross-connection
      // parallelism inside this transaction.
      const form = await getFormUsing(client, submission.formId, submission.formVersion);
      const versionRows = await client.query(
        `SELECT * FROM amc_practice.learning_submission_versions
         WHERE learning_submission_id = $1 ORDER BY version_number`, [submission.id]);
      const responseRows = await client.query(
        `SELECT response.* FROM amc_practice.learning_question_responses response
         JOIN amc_practice.learning_submission_versions version
           ON version.id = response.learning_submission_version_id
         WHERE version.learning_submission_id = $1 ORDER BY version.version_number, response.question_number`,
        [submission.id]);
      const workRows = await client.query(
        `SELECT work.* FROM amc_practice.learning_work_items work
         JOIN amc_practice.learning_submission_versions version
           ON version.id = work.learning_submission_version_id
         WHERE version.learning_submission_id = $1 ORDER BY version.version_number, work.created_at`,
        [submission.id]);
      const runRows = await client.query(
        `SELECT run.* FROM amc_practice.learning_analysis_runs run
         JOIN amc_practice.learning_submission_versions version
           ON version.id = run.learning_submission_version_id
         WHERE version.learning_submission_id = $1`, [submission.id]);
      const analysisRows = await client.query(
        `SELECT analysis.*, run.learning_submission_version_id
         FROM amc_practice.learning_question_analyses analysis
         JOIN amc_practice.learning_analysis_runs run ON run.id = analysis.analysis_run_id
         JOIN amc_practice.learning_submission_versions version
           ON version.id = run.learning_submission_version_id
         WHERE version.learning_submission_id = $1 ORDER BY analysis.question_number`, [submission.id]);
      const reportRows = await client.query(
        `SELECT report.* FROM amc_practice.learning_reports report
         JOIN amc_practice.learning_submission_versions version
           ON version.id = report.learning_submission_version_id
         WHERE version.learning_submission_id = $1`, [submission.id]);
      const batchRows = await client.query(
        'SELECT * FROM amc_practice.learning_batches WHERE learning_submission_id = $1', [submission.id]);
      const officialResultRows = await client.query(
        `SELECT question_number, selected_option, correct_option, accepted_options,
                is_scored, is_correct, points
         FROM amc_practice.submission_answers
         WHERE submission_id = $1 ORDER BY question_number`, [submission.officialSubmissionId]);
      const batchResultRows = await client.query(
        `SELECT result.learning_submission_version_id, item.*
         FROM amc_practice.learning_batch_results result
         JOIN amc_practice.learning_batch_result_items item ON item.batch_result_id = result.id
         JOIN amc_practice.learning_submission_versions version
           ON version.id = result.learning_submission_version_id
         WHERE version.learning_submission_id = $1
         ORDER BY version.version_number, item.question_number`, [submission.id]);
      if (!form) throw new Error('Learning history submission lost its pinned form revision.');
      const responsesByVersion = new Map();
    for (const row of responseRows.rows) {
      const values = responsesByVersion.get(row.learning_submission_version_id) || [];
      values.push({
        learningSubmissionVersionId: row.learning_submission_version_id,
        formId: row.form_id, formVersion: row.form_version,
        questionNumber: row.question_number, selectedOption: row.selected_option,
        reasoningText: row.reasoning_text, answerOrigin: row.answer_origin,
        reasoningOrigin: row.reasoning_origin, createdAt: row.created_at
      });
      responsesByVersion.set(row.learning_submission_version_id, values);
    }
    const workByVersion = new Map();
    for (const row of workRows.rows) {
      const values = workByVersion.get(row.learning_submission_version_id) || [];
      values.push(mapLearningWorkItem(row));
      workByVersion.set(row.learning_submission_version_id, values);
    }
    const runByVersion = new Map(runRows.rows.map((row) =>
      [row.learning_submission_version_id, mapAnalysisRun(row)]));
    const analysesByVersion = new Map();
    for (const row of analysisRows.rows) {
      const values = analysesByVersion.get(row.learning_submission_version_id) || [];
      values.push(mapQuestionAnalysis(row));
      analysesByVersion.set(row.learning_submission_version_id, values);
    }
    const reportByVersion = new Map(reportRows.rows.map((row) =>
      [row.learning_submission_version_id, mapLearningReport(row)]));
    const batchById = new Map(batchRows.rows.map((row) => [row.id, mapLearningBatch(row)]));
    const mapResultItem = (row) => ({
      questionNumber: row.question_number,
      selectedOption: row.selected_option,
      correctOption: row.correct_option,
      acceptedOptions: Array.isArray(row.accepted_options) && row.accepted_options.length
        ? row.accepted_options : (row.correct_option ? [row.correct_option] : []),
      isScored: row.is_scored !== false,
      isCorrect: row.is_correct,
      points: number(row.points)
    });
    const officialResultItems = officialResultRows.rows.map(mapResultItem);
    const batchResultsByVersion = new Map();
    for (const row of batchResultRows.rows) {
      const values = batchResultsByVersion.get(row.learning_submission_version_id) || [];
      values.push(mapResultItem(row));
      batchResultsByVersion.set(row.learning_submission_version_id, values);
    }
      const record = {
        submission,
        attempt: mapAttempt(header.rows[0].attempt),
        release: mapOpenReviewRelease(header.rows[0].release),
        form,
        versions: versionRows.rows.map((row) => {
          const version = mapLearningVersion(row);
          return {
            version,
            responses: responsesByVersion.get(version.id) || [],
            workItems: workByVersion.get(version.id) || [],
            analysisRun: runByVersion.get(version.id) || null,
            analyses: analysesByVersion.get(version.id) || [],
            resultItems: version.batchId
              ? batchResultsByVersion.get(version.id) || []
              : (version.versionNumber === 1 ? officialResultItems : []),
            report: reportByVersion.get(version.id) || null,
            batch: version.batchId ? batchById.get(version.batchId) || null : null
          };
        })
      };
      await client.query('COMMIT');
      return record;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async findOrCreateOpenReviewWorkspace({
    studentId, releaseId, idempotencyKey, requestHash, now
  }) {
    const client = await this.pool.connect();
    const scope = `open-review-release:${releaseId}:workspace`;
    try {
      await client.query('BEGIN');
      const replay = await client.query(
        `SELECT request_hash, response_body FROM amc_practice.idempotency_records
         WHERE student_id = $1 AND scope = $2 AND key = $3 FOR UPDATE`,
        [studentId, scope, idempotencyKey]
      );
      if (replay.rowCount) {
        if (replay.rows[0].request_hash !== requestHash) {
          throw Object.assign(new Error('Idempotency key was reused.'), { code: 'IDEMPOTENCY_KEY_REUSED' });
        }
        const bundle = await client.query(
          `SELECT to_jsonb(attempt.*) AS attempt, to_jsonb(submission.*) AS submission
           FROM amc_practice.attempts attempt
           JOIN amc_practice.learning_submissions submission ON submission.attempt_id = attempt.id
           WHERE attempt.id = $1 AND attempt.student_id = $2`,
          [replay.rows[0].response_body.attemptId, studentId]
        );
        if (!bundle.rowCount) throw new Error('Open review idempotency record lost its aggregate.');
        await client.query('COMMIT');
        return { attempt: mapAttempt(bundle.rows[0].attempt),
          learningSubmission: mapLearningSubmission(bundle.rows[0].submission), created: false };
      }
      const releaseIdentity = await client.query(
        `SELECT form_id, form_version, question_bundle_hash
         FROM amc_practice.open_review_releases WHERE id = $1`, [releaseId]
      );
      if (!releaseIdentity.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
        [studentId, releaseIdentity.rows[0].form_id]);
      // A missing idempotency row cannot itself be locked.  Serialize the
      // student's workspace identity first, then re-read so two concurrent
      // first requests with the same key both replay the committed aggregate
      // instead of racing the idempotency primary key.
      const serializedReplay = await client.query(
        `SELECT request_hash, response_body FROM amc_practice.idempotency_records
         WHERE student_id = $1 AND scope = $2 AND key = $3 FOR UPDATE`,
        [studentId, scope, idempotencyKey]
      );
      if (serializedReplay.rowCount) {
        if (serializedReplay.rows[0].request_hash !== requestHash) {
          throw Object.assign(new Error('Idempotency key was reused.'), { code: 'IDEMPOTENCY_KEY_REUSED' });
        }
        const bundle = await client.query(
          `SELECT to_jsonb(attempt.*) AS attempt, to_jsonb(submission.*) AS submission
           FROM amc_practice.attempts attempt
           JOIN amc_practice.learning_submissions submission ON submission.attempt_id = attempt.id
           WHERE attempt.id = $1 AND attempt.student_id = $2`,
          [serializedReplay.rows[0].response_body.attemptId, studentId]
        );
        if (!bundle.rowCount) throw new Error('Open review idempotency record lost its aggregate.');
        await client.query('COMMIT');
        return { attempt: mapAttempt(bundle.rows[0].attempt),
          learningSubmission: mapLearningSubmission(bundle.rows[0].submission), created: false };
      }
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('amc_open_delivery_bundle'), hashtext($1))",
        [releaseIdentity.rows[0].question_bundle_hash]
      );
      await client.query(
        `SELECT 1 FROM amc_practice.form_revisions WHERE form_id = $1 AND version = $2 FOR UPDATE`,
        [releaseIdentity.rows[0].form_id, releaseIdentity.rows[0].form_version]
      );
      const releaseResult = await client.query(
        `SELECT * FROM amc_practice.open_review_releases
         WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE`, [releaseId]
      );
      if (!releaseResult.rowCount) {
        await client.query('COMMIT');
        return null;
      }
      const release = mapOpenReviewRelease(releaseResult.rows[0]);
      let aggregate = await client.query(
        `SELECT to_jsonb(attempt.*) AS attempt, to_jsonb(submission.*) AS submission
         FROM amc_practice.attempts attempt
         JOIN amc_practice.learning_submissions submission ON submission.attempt_id = attempt.id
         WHERE attempt.student_id = $1 AND attempt.form_id = $2 AND attempt.form_version = $3
           AND attempt.attempt_mode = 'OPEN_REVIEW' FOR UPDATE OF attempt, submission`,
        [studentId, release.formId, release.formVersion]
      );
      const created = !aggregate.rowCount;
      if (!aggregate.rowCount) {
        const form = await getFormUsing(client, release.formId, release.formVersion);
        const attemptId = randomUUID();
        const submissionId = randomUUID();
        const versionId = randomUUID();
        const evidenceHash = canonicalHash({
          schema: 'amc-open-review-anchor-v1', releaseHash: release.releaseHash, studentId
        });
        const attempt = await client.query(
          `INSERT INTO amc_practice.attempts
           (id, student_id, form_id, form_version, duration_ms, attempt_mode, phase, clock_state,
            active_elapsed_ms, clock_started_at, answers_revision, reasoning_revision, state_revision,
            limit_reached_at, finalized_at, reset_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,'OPEN_REVIEW','OPEN_REVIEW','PAUSED',0,NULL,0,0,0,NULL,NULL,NULL,$6,$6)
           RETURNING *`, [attemptId, studentId, release.formId, release.formVersion, form.durationMs, now]
        );
        const submission = await client.query(
          `INSERT INTO amc_practice.learning_submissions
           (id, student_id, attempt_id, official_submission_id, official_submission_kind,
            form_id, form_version, source_type, lifecycle_status, current_version,
            attempt_mode, open_review_release_id, deletion_generation, deleted_at, created_at, updated_at)
           VALUES ($1,$2,$3,NULL,NULL,$4,$5,'OPEN_REVIEW','COMMITTED',1,'OPEN_REVIEW',$6,0,NULL,$7,$7)
           RETURNING *`, [submissionId, studentId, attemptId, release.formId, release.formVersion, release.id, now]
        );
        await client.query(
          `INSERT INTO amc_practice.learning_submission_versions
           (id, learning_submission_id, version_number, form_id, form_version,
            answers_revision, reasoning_revision, creation_reason, batch_id,
            context_status, context_set_id, evidence_hash, created_at)
           VALUES ($1,$2,1,$3,$4,0,0,'OPEN_REVIEW_ANCHOR',NULL,'CONTEXT_READY',$5,$6,$7)`,
          [versionId, submissionId, release.formId, release.formVersion, release.contextSetId, evidenceHash, now]
        );
        await client.query(
          `INSERT INTO amc_practice.learning_question_responses
           (learning_submission_version_id, form_id, form_version, question_number,
            selected_option, answer_origin, reasoning_text, reasoning_origin, created_at)
           SELECT $1, form_id, form_version, question_number,
                  NULL, 'OPEN_REVIEW_BLANK', '', 'NONE', $4
           FROM amc_practice.form_questions
           WHERE form_id = $2 AND form_version = $3 ORDER BY question_number`,
          [versionId, release.formId, release.formVersion, now]
        );
        aggregate = { rows: [{ attempt: attempt.rows[0], submission: submission.rows[0] }] };
      }
      const attempt = mapAttempt(aggregate.rows[0].attempt);
      const submission = mapLearningSubmission(aggregate.rows[0].submission);
      await client.query(
        `INSERT INTO amc_practice.idempotency_records
         (student_id, scope, key, request_hash, response_status, response_body, created_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
        [studentId, scope, idempotencyKey, requestHash, created ? 201 : 200,
          JSON.stringify({ attemptId: attempt.id }), now]
      );
      await client.query('COMMIT');
      return { attempt, learningSubmission: submission, created };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async withAttemptLock(attemptId, work) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Take the same logical lock as findOrCreateActiveAttempt before the
      // row lock. Reset therefore cannot race a new-attempt request into the
      // partial unique index, and lock ordering stays deadlock-free.
      const identity = await client.query('SELECT student_id, form_id FROM amc_practice.attempts WHERE id = $1', [attemptId]);
      if (!identity.rowCount) {
        await client.query('COMMIT');
        return await work(null);
      }
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [identity.rows[0].student_id, identity.rows[0].form_id]);
      const result = await client.query('SELECT * FROM amc_practice.attempts WHERE id = $1 FOR UPDATE', [attemptId]);
      if (!result.rowCount) {
        await client.query('COMMIT');
        return await work(null);
      }
      const tx = new PostgresAttemptTransaction(client, mapAttempt(result.rows[0]));
      const output = await work(tx);
      await client.query('COMMIT');
      return output;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
}

async function insertAttempt(client, { studentId, form, now }) {
  const id = randomUUID();
  const inserted = await client.query(
    `INSERT INTO amc_practice.attempts
     (id, student_id, form_id, form_version, duration_ms, attempt_mode, phase, clock_state,
      active_elapsed_ms, clock_started_at, answers_revision, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'TIMED', 'TIMED', 'RUNNING', 0, $6, 0, $6, $6) RETURNING *`,
    [id, studentId, form.id, form.version, form.durationMs, now]
  );
  for (const question of form.questions) {
    await client.query(
      'INSERT INTO amc_practice.attempt_answers(attempt_id, question_number, selected_option, updated_at) VALUES ($1, $2, NULL, $3)',
      [id, question.number, now]
    );
  }
  await client.query(
    `INSERT INTO amc_practice.timer_events(attempt_id, event_type, occurred_at, metadata)
     VALUES ($1, 'START', $2, '{}'::jsonb)`, [id, now]
  );
  return mapAttempt(inserted.rows[0]);
}

class PostgresAttemptTransaction {
  constructor(client, attempt) {
    this.client = client;
    this.attempt = attempt;
  }

  async consumeStudentResourceBudget(input) {
    return consumeStudentBudgetUsing(this.client, input);
  }

  async consumeGlobalResourceBudget(input) {
    return consumeGlobalBudgetUsing(this.client, input);
  }

  async getAttempt() {
    return clone(this.attempt);
  }

  async saveAttempt(attempt) {
    const result = await this.client.query(
      `UPDATE amc_practice.attempts
       SET phase = $2, clock_state = $3, active_elapsed_ms = $4, clock_started_at = $5,
           answers_revision = $6, reasoning_revision = $7, state_revision = $8, limit_reached_at = $9,
           finalized_at = $10, reset_at = $11, updated_at = $12
       WHERE id = $1 RETURNING *`,
      [attempt.id, attempt.phase, attempt.clockState, attempt.activeElapsedMs, attempt.clockStartedAt,
        attempt.answersRevision, attempt.reasoningRevision || 0, attempt.stateRevision, attempt.limitReachedAt,
        attempt.finalizedAt, attempt.resetAt, attempt.updatedAt]
    );
    this.attempt = mapAttempt(result.rows[0]);
    return clone(this.attempt);
  }

  async getAnswers() {
    const result = await this.client.query(
      'SELECT question_number, selected_option FROM amc_practice.attempt_answers WHERE attempt_id = $1 ORDER BY question_number', [this.attempt.id]
    );
    return result.rows.map((row) => ({ questionNumber: row.question_number, selectedOption: row.selected_option }));
  }

  async saveAnswers(answers) {
    for (const answer of answers) {
      await this.client.query(
        `INSERT INTO amc_practice.attempt_answers(attempt_id, question_number, selected_option, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (attempt_id, question_number) DO UPDATE SET selected_option = EXCLUDED.selected_option, updated_at = EXCLUDED.updated_at`,
        [this.attempt.id, answer.questionNumber, answer.selectedOption]
      );
    }
    return answers;
  }

  async getReasoningNotes() {
    const result = await this.client.query(
      `SELECT question_number, reasoning_text, updated_at
       FROM amc_practice.attempt_reasoning_notes
       WHERE attempt_id = $1 ORDER BY question_number`,
      [this.attempt.id]
    );
    return result.rows.map((row) => ({
      questionNumber: row.question_number,
      reasoningText: row.reasoning_text,
      updatedAt: row.updated_at
    }));
  }

  async saveReasoningNotes(updates, updatedAt) {
    for (const update of updates) {
      if (update.reasoningText === '') {
        await this.client.query(
          `DELETE FROM amc_practice.attempt_reasoning_notes
           WHERE attempt_id = $1 AND question_number = $2`,
          [this.attempt.id, update.questionNumber]
        );
      } else {
        await this.client.query(
          `INSERT INTO amc_practice.attempt_reasoning_notes
           (attempt_id, question_number, reasoning_text, updated_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (attempt_id, question_number) DO UPDATE
           SET reasoning_text = EXCLUDED.reasoning_text, updated_at = EXCLUDED.updated_at`,
          [this.attempt.id, update.questionNumber, update.reasoningText, updatedAt]
        );
      }
    }
    return this.getReasoningNotes();
  }

  async listSubmissions() {
    const result = await this.client.query(
      'SELECT * FROM amc_practice.submissions WHERE attempt_id = $1 ORDER BY created_at, id', [this.attempt.id]
    );
    return result.rows.map(mapSubmission);
  }

  async getSubmission(submissionId) {
    const result = await this.client.query(
      'SELECT * FROM amc_practice.submissions WHERE attempt_id = $1 AND id = $2', [this.attempt.id, submissionId]
    );
    return mapSubmission(result.rows[0]);
  }

  async createSubmission(submission, snapshots) {
    try {
      const result = await this.client.query(
        `INSERT INTO amc_practice.submissions
         (id, attempt_id, kind, slot, trigger, active_elapsed_ms, scoring_policy, total_points, maximum_points,
          answered_count, correct_count, incorrect_count, blank_count, unscored_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [submission.id, submission.attemptId, submission.kind, submission.slot, submission.trigger, submission.activeElapsedMs,
          JSON.stringify(submission.scoringPolicy), submission.totalPoints, submission.maximumPoints, submission.answeredCount,
          submission.correctCount, submission.incorrectCount, submission.blankCount, submission.unscoredCount || 0, submission.createdAt]
      );
      for (const snapshot of snapshots) {
        await this.client.query(
          `INSERT INTO amc_practice.submission_answers
           (submission_id, question_number, selected_option, correct_option, accepted_options, is_scored, is_correct, points)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)`,
          [submission.id, snapshot.questionNumber, snapshot.selectedOption, snapshot.correctOption,
            JSON.stringify(snapshot.acceptedOptions || (snapshot.correctOption ? [snapshot.correctOption] : [])),
            snapshot.isScored !== false, snapshot.isCorrect, snapshot.points]
        );
      }
      return mapSubmission(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        throw conflict('SUBMISSION_SLOT_USED', 'This attempt already used that submission slot.');
      }
      throw error;
    }
  }

  async getSubmissionAnswers(submissionId) {
    const result = await this.client.query(
      `SELECT question_number, selected_option, correct_option, accepted_options, is_scored, is_correct, points
       FROM amc_practice.submission_answers WHERE submission_id = $1 ORDER BY question_number`, [submissionId]
    );
    return result.rows.map((row) => ({
      questionNumber: row.question_number,
      selectedOption: row.selected_option,
      correctOption: row.correct_option,
      acceptedOptions: Array.isArray(row.accepted_options) && row.accepted_options.length
        ? row.accepted_options
        : (row.correct_option ? [row.correct_option] : []),
      isScored: row.is_scored !== false,
      isCorrect: row.is_correct,
      points: number(row.points)
    }));
  }

  async getLearningSubmissionBundle() {
    const parent = await this.client.query(
      'SELECT * FROM amc_practice.learning_submissions WHERE attempt_id = $1',
      [this.attempt.id]
    );
    if (!parent.rowCount) return null;
    const submission = mapLearningSubmission(parent.rows[0]);
    const versionResult = await this.client.query(
      `SELECT * FROM amc_practice.learning_submission_versions
       WHERE learning_submission_id = $1 AND version_number = $2`,
      [submission.id, submission.currentVersion]
    );
    if (!versionResult.rowCount) throw new Error(`Learning submission ${submission.id} has no current version.`);
    const version = mapLearningVersion(versionResult.rows[0]);
    const responseResult = await this.client.query(
        `SELECT learning_submission_version_id, form_id, form_version, question_number,
                selected_option, answer_origin, reasoning_text, reasoning_origin, created_at
         FROM amc_practice.learning_question_responses
         WHERE learning_submission_version_id = $1 ORDER BY question_number`,
        [version.id]
    );
    const workResult = await this.client.query(
        `SELECT * FROM amc_practice.learning_work_items
         WHERE learning_submission_version_id = $1 ORDER BY created_at, id`,
        [version.id]
    );
    return {
      submission,
      version,
      responses: responseResult.rows.map((row) => ({
        learningSubmissionVersionId: row.learning_submission_version_id,
        formId: row.form_id,
        formVersion: row.form_version,
        questionNumber: row.question_number,
        selectedOption: row.selected_option,
        reasoningText: row.reasoning_text,
        answerOrigin: row.answer_origin,
        reasoningOrigin: row.reasoning_origin,
        createdAt: row.created_at
      })),
      workItems: workResult.rows.map(mapLearningWorkItem)
    };
  }

  async getApprovedContextSetForForm(formId, formVersion) {
    const result = await this.client.query(
      `SELECT id FROM amc_practice.approved_context_sets
       WHERE form_id = $1 AND form_version = $2 AND active
         AND EXISTS (SELECT 1 FROM amc_practice.approved_context_questions q WHERE q.context_set_id = approved_context_sets.id)
       LIMIT 1`, [formId, formVersion]
    );
    return result.rowCount ? loadApprovedContextSet(this.client, result.rows[0].id) : null;
  }

  async getApprovedContextSetById(contextSetId) {
    return loadApprovedContextSet(this.client, contextSetId);
  }

  async getLearningEntitlement({ purpose = 'EXISTING_WORK' } = {}) {
    const result = await this.client.query(
      `SELECT submission.*, to_jsonb(release.*) AS release,
              amc_practice.learning_entitlement_allows(submission.id, $2) AS allowed
       FROM amc_practice.learning_submissions submission
       LEFT JOIN amc_practice.open_review_releases release
         ON release.id = submission.open_review_release_id
       WHERE submission.attempt_id = $1`, [this.attempt.id, purpose]
    );
    if (!result.rowCount) return null;
    const submission = mapLearningSubmission(result.rows[0]);
    const release = submission.openReviewReleaseId ? mapOpenReviewRelease(result.rows[0].release) : null;
    return { allowed: result.rows[0].allowed, sourceType: submission.sourceType, release, submission };
  }

  async getLearningReportBundle() {
    const bundle = await this.getLearningSubmissionBundle();
    if (!bundle) return null;
    const runResult = await this.client.query(
      'SELECT * FROM amc_practice.learning_analysis_runs WHERE learning_submission_version_id = $1',
      [bundle.version.id]
    );
    if (!runResult.rowCount) return { ...bundle, analysisRun: null, analyses: [], report: null };
    const run = mapAnalysisRun(runResult.rows[0]);
    const analyses = await this.client.query(
      'SELECT * FROM amc_practice.learning_question_analyses WHERE analysis_run_id = $1 ORDER BY question_number',
      [run.id]
    );
    const report = await this.client.query(
      'SELECT * FROM amc_practice.learning_reports WHERE learning_submission_version_id = $1',
      [bundle.version.id]
    );
    return {
      ...bundle,
      analysisRun: run,
      analyses: analyses.rows.map(mapQuestionAnalysis),
      report: mapLearningReport(report.rows[0])
    };
  }

  async createLearningSubmission({ submission, version, responses, workItem, analysisRun = null }) {
    await this.client.query(
      `INSERT INTO amc_practice.learning_submissions
       (id, student_id, attempt_id, official_submission_id, official_submission_kind, form_id, form_version,
        source_type, lifecycle_status, current_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [submission.id, submission.studentId, submission.attemptId, submission.officialSubmissionId,
        submission.officialSubmissionKind || 'FINAL', submission.formId, submission.formVersion,
        submission.sourceType, submission.lifecycleStatus,
        submission.currentVersion, submission.createdAt, submission.updatedAt]
    );
    await this.client.query(
      `INSERT INTO amc_practice.learning_submission_versions
       (id, learning_submission_id, version_number, form_id, form_version,
        answers_revision, reasoning_revision, creation_reason, context_status, context_set_id, evidence_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [version.id, version.learningSubmissionId, version.versionNumber, version.formId, version.formVersion,
        version.answersRevision, version.reasoningRevision, version.creationReason, version.contextStatus,
        version.contextSetId, version.evidenceHash, version.createdAt]
    );
    for (const response of responses) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_question_responses
         (learning_submission_version_id, form_id, form_version, question_number,
          selected_option, answer_origin, reasoning_text, reasoning_origin, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [response.learningSubmissionVersionId, response.formId, response.formVersion,
          response.questionNumber, response.selectedOption, response.answerOrigin, response.reasoningText,
          response.reasoningOrigin, response.createdAt]
      );
    }
    if (analysisRun) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_analysis_runs
         (id, learning_submission_version_id, context_set_id, version_number, input_hash,
          evidence_hash, deletion_generation, status, created_at, started_at, completed_at, last_error_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [analysisRun.id, analysisRun.learningSubmissionVersionId, analysisRun.contextSetId,
          analysisRun.versionNumber, analysisRun.inputHash, analysisRun.evidenceHash,
          analysisRun.deletionGeneration, analysisRun.status, analysisRun.createdAt,
          analysisRun.startedAt, analysisRun.completedAt, analysisRun.lastErrorCode]
      );
    }
    await this.client.query(
      `INSERT INTO amc_practice.learning_work_items
       (id, learning_submission_version_id, work_type, status, priority, attempt_count,
        input_hash, deletion_generation, available_at, lease_owner, lease_token, lease_expires_at,
        last_error_code, created_at, updated_at, analysis_run_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [workItem.id, workItem.learningSubmissionVersionId, workItem.workType, workItem.status,
        workItem.priority, workItem.attemptCount, workItem.inputHash, workItem.deletionGeneration,
        workItem.availableAt, workItem.leaseOwner, workItem.leaseToken, workItem.leaseExpiresAt, workItem.lastErrorCode,
        workItem.createdAt, workItem.updatedAt, workItem.analysisRunId || null]
    );
    return this.getLearningSubmissionBundle();
  }

  async getLearningBatchBundle(batchId) {
    return loadLearningBatchBundleUsing(this.client, this.attempt.id, batchId);
  }

  async listLearningBatchBundles() {
    return loadLearningBatchBundleUsing(this.client, this.attempt.id);
  }

  async createLearningBatch({
    batch, assets, reservations, studentQuotaBytes, globalQuotaBytes, activeBatchLimit
  }) {
    const entitled = await this.client.query(
      `SELECT source_type, amc_practice.learning_entitlement_allows(id, 'NEW_BATCH') AS allowed
       FROM amc_practice.learning_submissions WHERE id = $1 AND attempt_id = $2 FOR UPDATE`,
      [batch.learningSubmissionId, this.attempt.id]
    );
    if (!entitled.rowCount || !entitled.rows[0].allowed || entitled.rows[0].source_type !== batch.sourceType) {
      throw Object.assign(new Error('Learning submission cannot create a batch.'), {
        code: 'LEARNING_ENTITLEMENT_DENIED'
      });
    }
    await this.client.query(
      "SELECT pg_advisory_xact_lock(hashtext('amc_batch_quota'), hashtext('global'))"
    );
    await this.client.query(
      "SELECT pg_advisory_xact_lock(hashtext('amc_batch_quota_student'), hashtext($1))",
      [batch.studentId]
    );
    const quota = await this.client.query(
      `SELECT COALESCE(sum(reserved_bytes), 0) AS global_bytes,
              COALESCE(sum(reserved_bytes) FILTER (WHERE student_id = $1), 0) AS student_bytes
       FROM amc_practice.learning_batch_quota_reservations
       WHERE status IN ('RESERVED', 'CONSUMED')`, [batch.studentId]
    );
    const requestedBytes = reservations.reduce((sum, reservation) => sum + reservation.reservedBytes, 0);
    const active = await this.client.query(
      `SELECT count(*)::integer AS count FROM amc_practice.learning_batches
       WHERE student_id = $1 AND deletion_state = 'ACTIVE' AND status NOT IN ('COMMITTED', 'FAILED')`,
      [batch.studentId]
    );
    if (active.rows[0].count >= activeBatchLimit) {
      throw Object.assign(new Error('Student active batch limit exceeded.'), { code: 'BATCH_ACTIVE_LIMIT' });
    }
    if (number(quota.rows[0].student_bytes) + requestedBytes > studentQuotaBytes
        || number(quota.rows[0].global_bytes) + requestedBytes > globalQuotaBytes) {
      throw Object.assign(new Error('Persistent private upload quota exceeded.'), { code: 'BATCH_QUOTA_EXCEEDED' });
    }
    await this.client.query(
      `INSERT INTO amc_practice.learning_batches
       (id, student_id, attempt_id, learning_submission_id, base_version, form_id, form_version, source_type,
        status, mapping_revision, has_audio, deletion_state, deletion_generation, deleted_at,
        submitted_at, committed_at, failure_code, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [batch.id, batch.studentId, batch.attemptId, batch.learningSubmissionId, batch.baseVersion,
        batch.formId, batch.formVersion, batch.sourceType, batch.status, batch.mappingRevision, batch.hasAudio,
        batch.deletionState, batch.deletionGeneration, batch.deletedAt, batch.submittedAt,
        batch.committedAt, batch.failureCode, batch.createdAt, batch.updatedAt]
    );
    for (const asset of assets) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_assets
         (id, batch_id, position, display_name, kind, content_type, declared_bytes, observed_bytes,
          sha256, storage_key, status, upload_attempt_count, upload_idempotency_key,
          writing_started_at, stored_at, normalized_at, purged_at, last_error_code, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [asset.id, asset.batchId, asset.position, asset.displayName, asset.kind, asset.contentType,
          asset.declaredBytes, asset.observedBytes, asset.sha256, asset.storageKey, asset.status,
          asset.uploadAttemptCount, asset.uploadIdempotencyKey, asset.writingStartedAt, asset.storedAt,
          asset.normalizedAt, asset.purgedAt, asset.lastErrorCode, asset.createdAt, asset.updatedAt]
      );
    }
    for (const reservation of reservations) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_quota_reservations
         (asset_id, batch_id, student_id, reserved_bytes, status, created_at, consumed_at, released_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [reservation.assetId, reservation.batchId, reservation.studentId, reservation.reservedBytes,
          reservation.status, reservation.createdAt, reservation.consumedAt, reservation.releasedAt]
      );
    }
    return this.getLearningBatchBundle(batch.id);
  }

  async beginLearningBatchAssetUpload({ batchId, assetId, uploadIdempotencyKey, now }) {
    const selected = await this.client.query(
      `SELECT b.id AS batch_record_id, b.attempt_id, b.status AS batch_status,
              b.deletion_state, b.deletion_generation, a.*
       FROM amc_practice.learning_batches b
       JOIN amc_practice.learning_batch_assets a ON a.batch_id = b.id
       JOIN amc_practice.learning_submissions s
         ON s.id = b.learning_submission_id AND s.source_type = b.source_type
       WHERE b.id = $1 AND a.id = $2 AND b.attempt_id = $3
         AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
       FOR UPDATE OF b, a`, [batchId, assetId, this.attempt.id]
    );
    if (!selected.rowCount) return null;
    const row = selected.rows[0];
    const asset = mapLearningBatchAsset(row);
    if (row.deletion_state !== 'ACTIVE' || row.batch_status !== 'DRAFT') {
      throw Object.assign(new Error('Batch does not accept uploads.'), { code: 'BATCH_NOT_UPLOADABLE' });
    }
    if (asset.uploadIdempotencyKey && asset.uploadIdempotencyKey !== uploadIdempotencyKey) {
      throw Object.assign(new Error('Asset upload idempotency key was reused.'), { code: 'IDEMPOTENCY_KEY_REUSED' });
    }
    if (['STORED', 'NORMALIZED'].includes(asset.status)) {
      return { replay: true, asset, deletionGeneration: row.deletion_generation };
    }
    if (asset.status === 'WRITING') {
      throw Object.assign(new Error('Asset upload is already in progress.'), { code: 'UPLOAD_IN_PROGRESS' });
    }
    if (asset.status !== 'RESERVED') {
      throw Object.assign(new Error('Asset upload cannot be retried.'), { code: 'BATCH_NOT_UPLOADABLE' });
    }
    const updated = await this.client.query(
      `UPDATE amc_practice.learning_batch_assets
       SET status = 'WRITING', upload_idempotency_key = $3,
           upload_attempt_count = upload_attempt_count + 1, writing_started_at = $4,
           last_error_code = NULL, updated_at = $4
       WHERE batch_id = $1 AND id = $2 RETURNING *`, [batchId, assetId, uploadIdempotencyKey, now]
    );
    return { replay: false, asset: mapLearningBatchAsset(updated.rows[0]), deletionGeneration: row.deletion_generation };
  }

  async completeLearningBatchAssetUpload({
    batchId, assetId, uploadIdempotencyKey, deletionGeneration, stored, normalizedText, now
  }) {
    const locked = await this.client.query(
      `SELECT b.status AS batch_status, b.deletion_state, b.deletion_generation, a.*
       FROM amc_practice.learning_batches b
       JOIN amc_practice.learning_batch_assets a ON a.batch_id = b.id
       JOIN amc_practice.learning_submissions s
         ON s.id = b.learning_submission_id AND s.source_type = b.source_type
       WHERE b.id = $1 AND a.id = $2 AND b.attempt_id = $3
         AND amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK')
       FOR UPDATE OF b, a`, [batchId, assetId, this.attempt.id]
    );
    if (!locked.rowCount) return false;
    const row = locked.rows[0];
    if (row.deletion_state !== 'ACTIVE' || row.deletion_generation !== deletionGeneration
        || row.status !== 'WRITING' || row.upload_idempotency_key !== uploadIdempotencyKey) return false;
    await this.client.query(
      "SELECT pg_advisory_xact_lock(hashtext('amc_private_storage'), hashtext($1))",
      [stored.storageKey]
    );
    const deleting = await this.client.query(
      `SELECT 1 FROM amc_practice.private_storage_reconciliation_candidates
       WHERE storage_kind = 'OBJECT' AND storage_identity = $1 AND status = 'DELETING'`,
      [stored.storageKey]
    );
    if (deleting.rowCount) return false;
    const status = row.kind === 'TEXT' ? 'NORMALIZED' : 'STORED';
    const updated = await this.client.query(
      `UPDATE amc_practice.learning_batch_assets
       SET observed_bytes = $3, sha256 = $4, storage_key = $5, status = $6,
           writing_started_at = NULL, stored_at = $7::timestamptz,
           normalized_at = CASE WHEN kind = 'TEXT' THEN $7::timestamptz ELSE NULL END,
           updated_at = $7::timestamptz
       WHERE batch_id = $1 AND id = $2 RETURNING *`,
      [batchId, assetId, stored.observedBytes, stored.sha256, stored.storageKey, status, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_quota_reservations
       SET status = 'CONSUMED', consumed_at = $2
       WHERE asset_id = $1 AND status = 'RESERVED'`, [assetId, now]
    );
    if (row.kind === 'TEXT') {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_evidence
         (asset_id, batch_id, source_kind, normalized_text, normalized_sha256,
          duration_ms, transcript_confidence, created_at, purged_at)
         VALUES ($1,$2,'TEXT_UPLOAD',$3,$4,NULL,NULL,$5,NULL)`,
        [assetId, batchId, normalizedText, stored.sha256, now]
      );
    }
    await this.client.query('UPDATE amc_practice.learning_batches SET updated_at = $2 WHERE id = $1', [batchId, now]);
    return mapLearningBatchAsset(updated.rows[0]);
  }

  async failLearningBatchAssetUpload({ batchId, assetId, uploadIdempotencyKey, errorCode, now }) {
    const result = await this.client.query(
      `UPDATE amc_practice.learning_batch_assets a
       SET status = 'RESERVED', writing_started_at = NULL, upload_idempotency_key = NULL,
           last_error_code = $4, updated_at = $5
       FROM amc_practice.learning_batches b
       WHERE a.batch_id = b.id AND b.id = $1 AND a.id = $2 AND b.attempt_id = $3
         AND a.status = 'WRITING' AND a.upload_idempotency_key = $6
       RETURNING a.id`,
      [batchId, assetId, this.attempt.id, errorCode, now, uploadIdempotencyKey]
    );
    return Boolean(result.rowCount);
  }

  async submitLearningBatch({ batchId, workItems, now }) {
    const bundle = await loadLearningBatchBundleUsing(this.client, this.attempt.id, batchId, { lock: true });
    if (!bundle) return null;
    const entitlement = await this.client.query(
      `SELECT amc_practice.learning_entitlement_allows(learning_submission_id, 'EXISTING_WORK') AS allowed
       FROM amc_practice.learning_batches WHERE id = $1`, [batchId]
    );
    if (!entitlement.rows[0]?.allowed) return null;
    if (bundle.batch.status !== 'DRAFT' || bundle.batch.deletionState !== 'ACTIVE'
        || bundle.assets.some((asset) => !['NORMALIZED', 'STORED'].includes(asset.status))) {
      throw Object.assign(new Error('Every reserved asset must be uploaded.'), { code: 'BATCH_NOT_SUBMITTABLE' });
    }
    await this.client.query(
      `UPDATE amc_practice.learning_batches
       SET status = 'PROCESSING', submitted_at = $2, updated_at = $2 WHERE id = $1`, [batchId, now]
    );
    for (const item of workItems) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_work_items
         (id, batch_id, asset_id, work_type, status, priority, attempt_count, input_hash,
          deletion_generation, available_at, lease_owner, lease_token, lease_expires_at,
          last_error_code, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [item.id, item.batchId, item.assetId, item.workType, item.status, item.priority,
          item.attemptCount, item.inputHash, item.deletionGeneration, item.availableAt,
          item.leaseOwner, item.leaseToken, item.leaseExpiresAt, item.lastErrorCode,
          item.createdAt, item.updatedAt]
      );
    }
    for (const asset of bundle.assets.filter((candidate) => candidate.kind === 'AUDIO')) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_provider_artifacts
         (id, batch_id, asset_id, provider, artifact_type, external_id, upload_url_hash,
          submitted_at, status, deletion_evidence_code, delete_attempt_count,
          last_delete_attempt_at, last_delete_error_code, next_delete_attempt_at,
          provider_retention_not_before, retention_verification_code, retention_verified_at,
          created_at, updated_at, deletion_evidenced_at)
         VALUES ($1,$2,$3,'assemblyai','TRANSCRIPT',NULL,NULL,NULL,'INTENT_RECORDED',
           NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,$4,$4,NULL)`,
        [randomUUID(), batchId, asset.id, now]
      );
    }
    return this.getLearningBatchBundle(batchId);
  }

  async saveLearningBatchMapping({ batchId, mapping, workerFence, now }) {
    const updated = await this.client.query(
      `UPDATE amc_practice.learning_batches
       SET mapping_revision = $2, status = $3, updated_at = $4
       WHERE id = $1 AND attempt_id = $5 AND deletion_state = 'ACTIVE'
         AND status = 'PROCESSING' AND mapping_revision = $2 - 1
         AND deletion_generation = $9
         AND amc_practice.learning_entitlement_allows(learning_submission_id, 'EXISTING_WORK')
         AND EXISTS (
           SELECT 1 FROM amc_practice.learning_batch_work_items w
           WHERE w.batch_id = learning_batches.id AND w.work_type = 'BATCH_EXTRACTION'
             AND w.status = 'RUNNING' AND w.lease_owner = $6 AND w.lease_token = $7
             AND w.input_hash = $8 AND w.deletion_generation = $9
             AND w.lease_expires_at > $4
         )
       RETURNING id`, [batchId, mapping.revision, mapping.status, now, this.attempt.id,
        workerFence?.workerId, workerFence?.leaseToken, workerFence?.inputHash, workerFence?.deletionGeneration]
    );
    if (!updated.rowCount) return false;
    await this.client.query(
      `INSERT INTO amc_practice.learning_batch_mapping_revisions
       (batch_id, revision, schema_version, evidence_set_hash, master_plan_hash,
        chunk_input_hashes, gateway_run_metadata, extraction_hash, status, created_at, confirmed_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11)`,
      [batchId, mapping.revision, mapping.schemaVersion, mapping.evidenceSetHash,
        mapping.masterPlanHash, JSON.stringify(mapping.chunkInputHashes), JSON.stringify(mapping.gatewayRunMetadata),
        mapping.extractionHash, mapping.status, mapping.createdAt, mapping.confirmedAt]
    );
    for (const item of mapping.items) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_mapping_items
         (id, batch_id, mapping_revision, item_position, item_key, candidate_question_numbers,
          proposed_question_number, selected_option, reasoning_summary, evidence_text, confidence,
          ambiguity, source_spans, gateway_conflict_flags, requires_confirmation,
          confirmation_reasons, unmapped, purged_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15,$16::jsonb,$17,NULL,$18)`,
        [item.id, batchId, mapping.revision, item.itemPosition, item.itemKey,
          JSON.stringify(item.candidateQuestionNumbers), item.proposedQuestionNumber, item.selectedOption,
          item.reasoningSummary, item.evidenceText, item.confidence, item.ambiguity,
          JSON.stringify(item.sourceSpans), JSON.stringify(item.gatewayConflictFlags),
          item.requiresConfirmation, JSON.stringify(item.confirmationReasons), item.unmapped, item.createdAt]
      );
    }
    await this.client.query(
      `UPDATE amc_practice.learning_batch_work_items
       SET status = 'SUCCEEDED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL, updated_at = $2
       WHERE batch_id = $1 AND work_type = 'BATCH_EXTRACTION'
         AND lease_owner = $3 AND lease_token = $4`,
      [batchId, now, workerFence?.workerId, workerFence?.leaseToken]
    );
    return true;
  }

  async commitLearningBatch({ batchId, expectedMappingRevision, aggregate, now }) {
    const locked = await this.client.query(
      `SELECT b.*, s.current_version, s.lifecycle_status, s.source_type AS submission_source_type,
              release.context_set_id AS release_context_set_id,
              amc_practice.learning_entitlement_allows(s.id, 'EXISTING_WORK') AS entitled,
              s.student_id AS submission_student_id, s.form_id AS submission_form_id,
              s.form_version AS submission_form_version
       FROM amc_practice.learning_batches b
       JOIN amc_practice.learning_submissions s ON s.id = b.learning_submission_id
       LEFT JOIN amc_practice.open_review_releases release ON release.id = s.open_review_release_id
       WHERE b.id = $1 AND b.attempt_id = $2 FOR UPDATE OF b, s`, [batchId, this.attempt.id]
    );
    if (!locked.rowCount) throw Object.assign(new Error('Batch commit conflict.'), { code: 'BATCH_COMMIT_CONFLICT' });
    const row = locked.rows[0];
    if (row.current_version !== row.base_version) {
      throw Object.assign(new Error('Batch base version is stale.'), { code: 'BATCH_BASE_VERSION_STALE' });
    }
    if (!row.entitled || row.source_type !== row.submission_source_type
        || (row.source_type === 'OPEN_REVIEW' && aggregate.version.contextSetId !== row.release_context_set_id)
        || row.lifecycle_status !== 'COMMITTED' || row.student_id !== row.submission_student_id
        || row.form_id !== row.submission_form_id || row.form_version !== row.submission_form_version
        || row.deletion_state !== 'ACTIVE' || row.status !== 'NEEDS_CONFIRMATION'
        || row.mapping_revision !== expectedMappingRevision
        || aggregate.version.learningSubmissionId !== row.learning_submission_id
        || aggregate.version.batchId !== batchId
        || aggregate.version.versionNumber !== row.current_version + 1
        || aggregate.version.formId !== row.form_id || aggregate.version.formVersion !== row.form_version
        || aggregate.responses.some((response) => response.learningSubmissionVersionId !== aggregate.version.id
          || response.formId !== row.form_id || response.formVersion !== row.form_version)
        || aggregate.confirmation?.batchId !== batchId
        || aggregate.confirmation?.mappingRevision !== expectedMappingRevision
        || aggregate.confirmation?.learningSubmissionVersionId !== aggregate.version.id
        || aggregate.result.batchId !== batchId
        || aggregate.result.learningSubmissionVersionId !== aggregate.version.id) {
      throw Object.assign(new Error('Batch commit conflict.'), { code: 'BATCH_COMMIT_CONFLICT' });
    }
    await this.client.query(
      `INSERT INTO amc_practice.learning_submission_versions
       (id, learning_submission_id, version_number, form_id, form_version, answers_revision,
        reasoning_revision, creation_reason, context_status, context_set_id, evidence_hash, created_at, batch_id)
       VALUES ($1,$2,$3,$4,$5,NULL,NULL,$6,$7,$8,$9,$10,$11)`,
      [aggregate.version.id, aggregate.version.learningSubmissionId, aggregate.version.versionNumber,
        aggregate.version.formId, aggregate.version.formVersion, aggregate.version.creationReason,
        aggregate.version.contextStatus, aggregate.version.contextSetId, aggregate.version.evidenceHash,
        aggregate.version.createdAt, batchId]
    );
    for (const response of aggregate.responses) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_question_responses
         (learning_submission_version_id, form_id, form_version, question_number,
          selected_option, answer_origin, reasoning_text, reasoning_origin, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [response.learningSubmissionVersionId, response.formId, response.formVersion,
          response.questionNumber, response.selectedOption, response.answerOrigin,
          response.reasoningText, response.reasoningOrigin, response.createdAt]
      );
    }
    const confirmation = aggregate.confirmation;
    await this.client.query(
      `INSERT INTO amc_practice.learning_batch_confirmation_revisions
       (batch_id, mapping_revision, learning_submission_version_id, source_evidence_hash, confirmed_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [confirmation.batchId, confirmation.mappingRevision,
        confirmation.learningSubmissionVersionId, confirmation.sourceEvidenceHash,
        confirmation.confirmedAt]
    );
    for (const response of confirmation.responses) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_confirmation_responses
         (batch_id, mapping_revision, question_number, selected_option,
          confirmed_reasoning_text, confirmed_reasoning_hash, reasoning_origin,
          canonical_source_item_ids, source_descriptors, reconstructed_source_text,
          source_span_hash, source_evidence_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12)`,
        [confirmation.batchId, confirmation.mappingRevision, response.questionNumber,
          response.selectedOption, response.confirmedReasoningText, response.confirmedReasoningHash,
          response.reasoningOrigin, JSON.stringify(response.sourceItemIds),
          JSON.stringify(response.sourceDescriptors), response.sourceEvidenceText,
          response.sourceSpanHash, response.sourceEvidenceHash]
      );
    }
    if (aggregate.analysisRun) {
      const run = aggregate.analysisRun;
      await this.client.query(
        `INSERT INTO amc_practice.learning_analysis_runs
         (id, learning_submission_version_id, context_set_id, version_number, input_hash,
          evidence_hash, deletion_generation, status, created_at, started_at, completed_at, last_error_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [run.id, run.learningSubmissionVersionId, run.contextSetId, run.versionNumber,
          run.inputHash, run.evidenceHash, run.deletionGeneration, run.status, run.createdAt,
          run.startedAt, run.completedAt, run.lastErrorCode]
      );
    }
    const work = aggregate.workItem;
    await this.client.query(
      `INSERT INTO amc_practice.learning_work_items
       (id, learning_submission_version_id, work_type, status, priority, attempt_count,
        input_hash, deletion_generation, available_at, lease_owner, lease_token, lease_expires_at,
        last_error_code, created_at, updated_at, analysis_run_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [work.id, work.learningSubmissionVersionId, work.workType, work.status, work.priority,
        work.attemptCount, work.inputHash, work.deletionGeneration, work.availableAt,
        work.leaseOwner, work.leaseToken, work.leaseExpiresAt, work.lastErrorCode,
        work.createdAt, work.updatedAt, work.analysisRunId || null]
    );
    const result = aggregate.result;
    await this.client.query(
      `INSERT INTO amc_practice.learning_batch_results
       (id, batch_id, learning_submission_version_id, scoring_scope, scoring_policy,
        total_points, maximum_points, mapped_question_count, answered_count, correct_count,
        incorrect_count, blank_count, unscored_count, created_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [result.id, batchId, result.learningSubmissionVersionId, result.scoringScope,
        JSON.stringify(result.scoringPolicy), result.totalPoints, result.maximumPoints,
        result.mappedQuestionCount, result.answeredCount, result.correctCount,
        result.incorrectCount, result.blankCount, result.unscoredCount, result.createdAt]
    );
    for (const item of result.items) {
      await this.client.query(
        `INSERT INTO amc_practice.learning_batch_result_items
         (batch_result_id, question_number, selected_option, correct_option, accepted_options,
          is_scored, is_correct, points)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8)`,
        [result.id, item.questionNumber, item.selectedOption, item.correctOption,
          JSON.stringify(item.acceptedOptions), item.isScored, item.isCorrect, item.points]
      );
    }
    await this.client.query(
      `UPDATE amc_practice.learning_submissions
       SET current_version = $2, updated_at = $3 WHERE id = $1`,
      [row.learning_submission_id, aggregate.version.versionNumber, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_mapping_revisions
       SET status = 'COMMITTED', confirmed_at = $3
       WHERE batch_id = $1 AND revision = $2`, [batchId, expectedMappingRevision, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batches
       SET status = 'COMMITTED', committed_version_id = $2, committed_version_number = $3,
           committed_at = $4, updated_at = $4 WHERE id = $1`,
      [batchId, aggregate.version.id, aggregate.version.versionNumber, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_work_items
       SET status = 'CANCELLED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL, updated_at = $2
       WHERE batch_id = $1 AND status NOT IN ('SUCCEEDED', 'FAILED', 'CANCELLED')`, [batchId, now]
    );
    return this.getLearningBatchBundle(batchId);
  }

  async requestLearningBatchDeletion({ batchId, now }) {
    const bundle = await loadLearningBatchBundleUsing(this.client, this.attempt.id, batchId, { lock: true });
    if (!bundle) return null;
    if (bundle.batch.deletionState === 'ACTIVE') {
      const deletionGeneration = bundle.batch.deletionGeneration + 1;
      await this.client.query(
        `UPDATE amc_practice.learning_batches
         SET deletion_state = 'DELETE_REQUESTED', deletion_generation = deletion_generation + 1,
             deleted_at = $2, updated_at = $2 WHERE id = $1`, [batchId, now]
      );
      for (const item of bundle.workItems) {
        const provider = item.workType === 'TRANSCRIBE_AUDIO'
          ? bundle.providerArtifacts.find((candidate) => candidate.asset_id === item.assetId) : null;
        if (provider?.external_id && provider.status !== 'DELETION_EVIDENCED') {
          await this.client.query(
            `UPDATE amc_practice.learning_batch_provider_artifacts
             SET status = 'DELETE_PENDING', updated_at = $2 WHERE id = $1`, [provider.id, now]
          );
          await this.client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'QUEUED', input_hash = $2, deletion_generation = $3, available_at = $4,
                 lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'USER_DELETION_REQUESTED', updated_at = $4 WHERE id = $1`,
            [item.id, transcriptionCleanupInputHash(batchId, item.assetId, deletionGeneration),
              deletionGeneration, now]
          );
        } else if (provider?.status === 'SUBMIT_MAY_HAVE_DELIVERED') {
          await this.client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'QUEUED', input_hash = $2, deletion_generation = $3, available_at = $4,
                 lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
                 last_error_code = 'USER_DELETION_RECONCILIATION_REQUIRED', updated_at = $4
             WHERE id = $1`,
            [item.id, transcriptionCleanupInputHash(batchId, item.assetId, deletionGeneration),
              deletionGeneration, now]
          );
        } else if (!['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(item.status)) {
          if (provider?.status === 'INTENT_RECORDED') {
            await this.client.query(
              `DELETE FROM amc_practice.learning_batch_provider_artifacts
               WHERE id = $1 AND external_id IS NULL AND status = 'INTENT_RECORDED'`, [provider.id]
            );
          }
          await this.client.query(
            `UPDATE amc_practice.learning_batch_work_items
             SET status = 'CANCELLED', lease_owner = NULL, lease_token = NULL,
                 lease_expires_at = NULL, updated_at = $2 WHERE id = $1`, [item.id, now]
          );
        }
      }
    }
    return this.getLearningBatchBundle(batchId);
  }

  async completeLearningBatchLocalPurge({ batchId, expectedDeletionGeneration, now }) {
    const locked = await this.client.query(
      `SELECT id FROM amc_practice.learning_batches
       WHERE id = $1 AND attempt_id = $2 AND deletion_state <> 'ACTIVE'
         AND deletion_generation = $3 FOR UPDATE`,
      [batchId, this.attempt.id, expectedDeletionGeneration]
    );
    if (!locked.rowCount) return false;
    await this.client.query(
      `UPDATE amc_practice.learning_batch_assets
       SET storage_key = NULL,
           status = CASE WHEN observed_bytes IS NULL THEN 'REJECTED' ELSE 'PURGED' END,
           writing_started_at = NULL, purged_at = $2, updated_at = $2
       WHERE batch_id = $1`, [batchId, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_quota_reservations
       SET status = 'RELEASED', released_at = $2
       WHERE batch_id = $1 AND status <> 'RELEASED'`, [batchId, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_evidence
       SET normalized_text = NULL, purged_at = $2 WHERE batch_id = $1`, [batchId, now]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batch_mapping_items
       SET evidence_text = NULL, reasoning_summary = NULL, purged_at = $2 WHERE batch_id = $1`, [batchId, now]
    );
    const provider = await this.client.query(
      `SELECT EXISTS (
         SELECT 1 FROM amc_practice.learning_batch_provider_artifacts
         WHERE batch_id = $1 AND status NOT IN ('DELETION_EVIDENCED', 'PROVIDER_RETENTION_DELETION_CONFIRMED')
       ) OR EXISTS (
         SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs
         WHERE batch_id = $1 AND status NOT IN ('SUCCEEDED','SUPERSEDED')
       ) AS pending,
       EXISTS (
         SELECT 1 FROM amc_practice.learning_batch_provider_artifacts
         WHERE batch_id = $1 AND status = 'PROVIDER_RETENTION_PENDING'
       ) OR EXISTS (
         SELECT 1 FROM amc_practice.learning_batch_provider_orphan_cleanup_jobs
         WHERE batch_id = $1 AND cleanup_kind = 'OBSERVE_RETENTION_WINDOW'
           AND status NOT IN ('SUCCEEDED','SUPERSEDED')
       ) AS retention_pending`, [batchId]
    );
    await this.client.query(
      `UPDATE amc_practice.learning_batches
       SET deletion_state = $2, updated_at = $3 WHERE id = $1`,
      [batchId, provider.rows[0].retention_pending ? 'PROVIDER_RETENTION_PENDING'
        : provider.rows[0].pending ? 'PROVIDER_DELETE_PENDING' : 'COMPLETE', now]
    );
    return true;
  }

  async addTimerEvent(event) {
    await this.client.query(
      `INSERT INTO amc_practice.timer_events(attempt_id, event_type, occurred_at, metadata)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [this.attempt.id, event.type, event.occurredAt, JSON.stringify(event.metadata || {})]
    );
  }

  async getIdempotency(studentId, scope, key) {
    const result = await this.client.query(
      `SELECT request_hash, response_status, response_body, created_at
       FROM amc_practice.idempotency_records WHERE student_id = $1 AND scope = $2 AND key = $3`,
      [studentId, scope, key]
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return { studentId, scope, key, requestHash: row.request_hash, responseStatus: row.response_status, responseBody: row.response_body, createdAt: row.created_at };
  }

  async putIdempotency(record) {
    const inserted = await this.client.query(
      `INSERT INTO amc_practice.idempotency_records
       (student_id, scope, key, request_hash, response_status, response_body, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       ON CONFLICT (student_id, scope, key) DO NOTHING
       RETURNING request_hash, response_status, response_body, created_at`,
      [record.studentId, record.scope, record.key, record.requestHash, record.responseStatus, JSON.stringify(record.responseBody), record.createdAt]
    );
    const row = inserted.rows[0] || (await this.client.query(
      `SELECT request_hash, response_status, response_body, created_at
       FROM amc_practice.idempotency_records WHERE student_id = $1 AND scope = $2 AND key = $3`,
      [record.studentId, record.scope, record.key]
    )).rows[0];
    return {
      studentId: record.studentId,
      scope: record.scope,
      key: record.key,
      requestHash: row.request_hash,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      createdAt: row.created_at
    };
  }

  async createResetAttempt({ studentId, form, now }) {
    return insertAttempt(this.client, { studentId, form, now });
  }
}
