-- Phase 2 learning evidence is intentionally separate from immutable official
-- contest submissions.  This migration contains no provider-specific fields;
-- external work is represented only as durable application intent.

ALTER TABLE amc_practice.attempts
  ADD COLUMN IF NOT EXISTS reasoning_revision integer NOT NULL DEFAULT 0
    CHECK (reasoning_revision >= 0);

CREATE TABLE IF NOT EXISTS amc_practice.attempt_reasoning_notes (
  attempt_id uuid NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  reasoning_text text NOT NULL
    CHECK (octet_length(reasoning_text) <= 8000),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (attempt_id, question_number),
  FOREIGN KEY (attempt_id, question_number)
    REFERENCES amc_practice.attempt_answers(attempt_id, question_number)
    ON DELETE RESTRICT
);

-- Composite candidate keys let the database prove that the official final
-- belongs to the same attempt and that the attempt belongs to the student.
-- PostgreSQL permits a redundant unique key even though each id is already a
-- primary key; it is required as the exact target of the composite FKs below.
ALTER TABLE amc_practice.attempts
  ADD CONSTRAINT amc_attempts_id_student_form_unique
    UNIQUE (id, student_id, form_id, form_version);

ALTER TABLE amc_practice.submissions
  ADD CONSTRAINT amc_submissions_id_attempt_unique UNIQUE (id, attempt_id),
  ADD CONSTRAINT amc_submissions_id_attempt_kind_unique UNIQUE (id, attempt_id, kind);

CREATE TABLE IF NOT EXISTS amc_practice.learning_submissions (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL,
  attempt_id uuid NOT NULL UNIQUE,
  official_submission_id uuid NOT NULL UNIQUE,
  official_submission_kind text NOT NULL DEFAULT 'FINAL'
    CHECK (official_submission_kind = 'FINAL'),
  form_id text NOT NULL,
  form_version text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('INTERACTIVE_FINAL')),
  lifecycle_status text NOT NULL CHECK (lifecycle_status IN ('COMMITTED', 'DELETED')),
  current_version integer NOT NULL CHECK (current_version >= 1),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT amc_learning_submission_attempt_form_fk
  FOREIGN KEY (attempt_id, student_id, form_id, form_version)
    REFERENCES amc_practice.attempts(id, student_id, form_id, form_version) ON DELETE RESTRICT,
  CONSTRAINT amc_learning_submission_official_final_fk
  FOREIGN KEY (official_submission_id, attempt_id, official_submission_kind)
    REFERENCES amc_practice.submissions(id, attempt_id, kind) ON DELETE RESTRICT,
  CONSTRAINT amc_learning_submission_form_fk
  FOREIGN KEY (form_id, form_version)
    REFERENCES amc_practice.form_revisions(form_id, version) ON DELETE RESTRICT,
  UNIQUE (id, form_id, form_version)
);
CREATE INDEX IF NOT EXISTS amc_learning_submissions_student_idx
  ON amc_practice.learning_submissions(student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS amc_practice.learning_submission_versions (
  id uuid PRIMARY KEY,
  learning_submission_id uuid NOT NULL,
  version_number integer NOT NULL CHECK (version_number >= 1),
  form_id text NOT NULL,
  form_version text NOT NULL,
  answers_revision integer NOT NULL CHECK (answers_revision >= 0),
  reasoning_revision integer NOT NULL CHECK (reasoning_revision >= 0),
  creation_reason text NOT NULL CHECK (creation_reason IN ('FINAL_COMMIT', 'BACKFILL')),
  context_status text NOT NULL CHECK (context_status IN ('CONTEXT_UNAVAILABLE', 'CONTEXT_READY')),
  context_set_id uuid,
  evidence_hash char(64) NOT NULL CHECK (evidence_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  FOREIGN KEY (learning_submission_id, form_id, form_version)
    REFERENCES amc_practice.learning_submissions(id, form_id, form_version)
    ON DELETE RESTRICT,
  UNIQUE (learning_submission_id, version_number),
  UNIQUE (id, form_id, form_version)
);

-- Parent.current_version is part of the aggregate invariant. The constraint
-- must be deferred because the parent row is inserted immediately before v1
-- in the same final-submission transaction.
ALTER TABLE amc_practice.learning_submissions
  ADD CONSTRAINT amc_learning_submission_current_version_fk
  FOREIGN KEY (id, current_version)
  REFERENCES amc_practice.learning_submission_versions(learning_submission_id, version_number)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS amc_practice.learning_question_responses (
  learning_submission_version_id uuid NOT NULL,
  form_id text NOT NULL,
  form_version text NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  selected_option char(1)
    CHECK (selected_option IS NULL OR selected_option IN ('A', 'B', 'C', 'D', 'E')),
  answer_origin text NOT NULL CHECK (answer_origin = 'OFFICIAL_FINAL'),
  reasoning_text text NOT NULL
    CHECK (octet_length(reasoning_text) <= 8000),
  reasoning_origin text NOT NULL CHECK (reasoning_origin IN ('DURING_ATTEMPT', 'NONE')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (learning_submission_version_id, question_number),
  FOREIGN KEY (learning_submission_version_id, form_id, form_version)
    REFERENCES amc_practice.learning_submission_versions(id, form_id, form_version)
    ON DELETE RESTRICT,
  FOREIGN KEY (form_id, form_version, question_number)
    REFERENCES amc_practice.form_questions(form_id, form_version, question_number)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS amc_practice.learning_work_items (
  id uuid PRIMARY KEY,
  learning_submission_version_id uuid NOT NULL,
  work_type text NOT NULL CHECK (work_type IN ('ANALYZE_SUBMISSION')),
  status text NOT NULL CHECK (
    status IN ('BLOCKED_CONTEXT', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED', 'CANCELLED')
  ),
  priority smallint NOT NULL DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  input_hash char(64) NOT NULL CHECK (input_hash ~ '^[0-9a-f]{64}$'),
  deletion_generation integer NOT NULL DEFAULT 0 CHECK (deletion_generation >= 0),
  available_at timestamptz NOT NULL,
  lease_owner text,
  lease_expires_at timestamptz,
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (learning_submission_version_id, work_type),
  FOREIGN KEY (learning_submission_version_id)
    REFERENCES amc_practice.learning_submission_versions(id) ON DELETE RESTRICT,
  CHECK (
    (status = 'RUNNING' AND lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR (status <> 'RUNNING' AND lease_owner IS NULL AND lease_expires_at IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS amc_learning_work_ready_idx
  ON amc_practice.learning_work_items(priority DESC, available_at, created_at)
  WHERE status = 'QUEUED';
