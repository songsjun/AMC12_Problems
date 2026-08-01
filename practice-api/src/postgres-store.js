import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { conflict } from './errors.js';
import { analysisInputHash } from './learning-review/canonical.js';

const { Pool } = pg;

const clone = (value) => structuredClone(value);

function number(value) {
  return typeof value === 'number' ? value : Number(value);
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
    formId: row.form_id,
    formVersion: row.form_version,
    sourceType: row.source_type,
    lifecycleStatus: row.lifecycle_status,
    currentVersion: row.current_version,
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
    contextStatus: row.context_status,
    contextSetId: row.context_set_id,
    evidenceHash: row.evidence_hash,
    createdAt: row.created_at
  };
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
             JOIN amc_practice.learning_submissions s
               ON s.id = v.learning_submission_id AND s.current_version = v.version_number
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
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const reclaimed = await client.query(
        `UPDATE amc_practice.learning_work_items
         SET status = 'QUEUED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
             available_at = $1, last_error_code = 'LEASE_EXPIRED', updated_at = $1
         WHERE status = 'RUNNING' AND lease_expires_at <= $1
         RETURNING analysis_run_id`, [now]
      );
      const reclaimedIds = reclaimed.rows.map((row) => row.analysis_run_id).filter(Boolean);
      if (reclaimedIds.length) {
        await client.query(
          `UPDATE amc_practice.learning_analysis_runs
           SET status = 'QUEUED', started_at = NULL, last_error_code = 'LEASE_EXPIRED'
           WHERE id = ANY($1::uuid[])`, [reclaimedIds]
        );
      }
      const leaseToken = randomUUID();
      const claimed = await client.query(
        `WITH candidate AS (
           SELECT w.id
           FROM amc_practice.learning_work_items w
           JOIN amc_practice.learning_analysis_runs r ON r.id = w.analysis_run_id
           JOIN amc_practice.learning_submission_versions v ON v.id = w.learning_submission_version_id
           JOIN amc_practice.learning_submissions s
             ON s.id = v.learning_submission_id AND s.current_version = v.version_number
           JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = s.student_id
           WHERE w.status = 'QUEUED' AND w.available_at <= $1 AND s.lifecycle_status = 'COMMITTED'
             AND r.status = 'QUEUED'
             AND a.phase IN ('FINALIZED','RESET') AND v.context_status = 'CONTEXT_READY'
             AND v.context_set_id = r.context_set_id AND w.input_hash = r.input_hash
             AND w.deletion_generation = r.deletion_generation
           ORDER BY w.priority DESC, w.available_at, w.created_at
           FOR UPDATE OF w SKIP LOCKED LIMIT 1
         )
         UPDATE amc_practice.learning_work_items w
         SET status = 'RUNNING', attempt_count = attempt_count + 1, lease_owner = $2, lease_token = $4,
             lease_expires_at = $1 + ($3::text || ' milliseconds')::interval, updated_at = $1
         FROM candidate WHERE w.id = candidate.id RETURNING w.*`, [now, workerId, leaseMs, leaseToken]
      );
      if (!claimed.rowCount) {
        await client.query('COMMIT');
        return null;
      }
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
        id: row.version_id,
        learningSubmissionId: row.learning_submission_id,
        versionNumber: row.version_number,
        formId: row.form_id,
        formVersion: row.form_version,
        contextSetId: row.context_set_id,
        evidenceHash: row.evidence_hash
      };
      const run = {
        id: row.run_id,
        learningSubmissionVersionId: row.learning_submission_version_id,
        contextSetId: row.run_context_set_id,
        versionNumber: row.run_version_number,
        inputHash: row.run_input_hash,
        evidenceHash: row.run_evidence_hash,
        deletionGeneration: row.run_deletion_generation,
        status: 'RUNNING',
        createdAt: row.run_created_at,
        startedAt: row.run_started_at || now,
        completedAt: null,
        lastErrorCode: null
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
        workItem,
        run,
        version,
        submission,
        questions: responses.rows.map((response) => ({
          questionNumber: response.question_number,
          selectedOption: response.selected_option,
          reasoningText: response.reasoning_text,
          reasoningOrigin: response.reasoning_origin,
          officialAnswer: official.get(response.question_number),
          context: contexts.get(response.question_number) || null
        }))
      };
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
       SET lease_expires_at = $3 + ($4::text || ' milliseconds')::interval, updated_at = $3
       WHERE id = $1 AND status = 'RUNNING' AND lease_owner = $2 AND lease_token = $5 AND lease_expires_at > $3
       RETURNING id`, [workItemId, workerId, now, leaseMs, leaseToken]
    );
    return result.rowCount === 1;
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
         JOIN amc_practice.learning_submissions s
           ON s.id = v.learning_submission_id AND s.current_version = $6
         JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = $7
         WHERE w.id = $1 AND r.id = $2 AND w.status = 'RUNNING' AND w.lease_owner = $3
           AND w.lease_token = $10
           AND r.status = 'RUNNING' AND w.learning_submission_version_id = v.id
           AND w.lease_expires_at > $4 AND w.input_hash = $5 AND r.input_hash = $5
           AND w.deletion_generation = $8 AND r.deletion_generation = $8
           AND s.student_id = $7 AND s.lifecycle_status = 'COMMITTED'
           AND a.phase IN ('FINALIZED','RESET') AND v.context_set_id = $9 AND r.context_set_id = $9
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
         JOIN amc_practice.learning_submissions s ON s.id = v.learning_submission_id AND s.current_version = $6
         JOIN amc_practice.attempts a ON a.id = s.attempt_id AND a.student_id = $7
         WHERE w.id = $1 AND r.id = $2 AND w.status = 'RUNNING' AND w.lease_owner = $3
           AND w.lease_token = $10
           AND r.status = 'RUNNING' AND w.lease_expires_at > $4
           AND w.input_hash = $5 AND r.input_hash = $5
           AND w.deletion_generation = $8 AND r.deletion_generation = $8
           AND s.student_id = $7 AND s.lifecycle_status = 'COMMITTED'
           AND a.phase IN ('FINALIZED','RESET') AND v.context_set_id = $9 AND r.context_set_id = $9
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
         AND phase NOT IN ('FINALIZED', 'RESET') ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
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
      'SELECT * FROM amc_practice.attempts WHERE student_id = $1 ORDER BY created_at DESC', [studentId]
    );
    return result.rows.map(mapAttempt);
  }

  async listDeadlineCandidates(now) {
    const result = await this.pool.query(
      `SELECT id FROM amc_practice.attempts
       WHERE phase = 'TIMED' AND clock_state = 'RUNNING' AND clock_started_at IS NOT NULL
       AND clock_started_at + ((duration_ms - active_elapsed_ms) * interval '1 millisecond') <= $1`,
      [now]
    );
    return result.rows.map((row) => row.id);
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
     (id, student_id, form_id, form_version, duration_ms, phase, clock_state, active_elapsed_ms, clock_started_at, answers_revision, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'TIMED', 'RUNNING', 0, $6, 0, $6, $6) RETURNING *`,
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
    const [responseResult, workResult] = await Promise.all([
      this.client.query(
        `SELECT learning_submission_version_id, form_id, form_version, question_number,
                selected_option, answer_origin, reasoning_text, reasoning_origin, created_at
         FROM amc_practice.learning_question_responses
         WHERE learning_submission_version_id = $1 ORDER BY question_number`,
        [version.id]
      ),
      this.client.query(
        `SELECT * FROM amc_practice.learning_work_items
         WHERE learning_submission_version_id = $1 ORDER BY created_at, id`,
        [version.id]
      )
    ]);
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
