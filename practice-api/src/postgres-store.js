import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { conflict } from './errors.js';

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
    leaseExpiresAt: row.lease_expires_at,
    lastErrorCode: row.last_error_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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

  async createLearningSubmission({ submission, version, responses, workItem }) {
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
    await this.client.query(
      `INSERT INTO amc_practice.learning_work_items
       (id, learning_submission_version_id, work_type, status, priority, attempt_count,
        input_hash, deletion_generation, available_at, lease_owner, lease_expires_at,
        last_error_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [workItem.id, workItem.learningSubmissionVersionId, workItem.workType, workItem.status,
        workItem.priority, workItem.attemptCount, workItem.inputHash, workItem.deletionGeneration,
        workItem.availableAt, workItem.leaseOwner, workItem.leaseExpiresAt, workItem.lastErrorCode,
        workItem.createdAt, workItem.updatedAt]
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
