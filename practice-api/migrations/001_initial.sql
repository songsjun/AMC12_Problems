-- AMC practice is intentionally isolated from every existing education table.
CREATE SCHEMA IF NOT EXISTS amc_practice;

CREATE TABLE IF NOT EXISTS amc_practice.schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amc_practice.students (
  id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amc_practice.access_codes (
  code_hash text PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES amc_practice.students(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS amc_access_codes_student_idx ON amc_practice.access_codes(student_id);

CREATE TABLE IF NOT EXISTS amc_practice.sessions (
  id text PRIMARY KEY CHECK (char_length(id) >= 16),
  student_id uuid NOT NULL REFERENCES amc_practice.students(id),
  csrf_token_hash text NOT NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS amc_sessions_student_idx ON amc_practice.sessions(student_id);
CREATE INDEX IF NOT EXISTS amc_sessions_expires_idx ON amc_practice.sessions(expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS amc_practice.form_revisions (
  form_id text NOT NULL CHECK (char_length(form_id) BETWEEN 1 AND 160),
  version text NOT NULL CHECK (char_length(version) BETWEEN 1 AND 100),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  duration_ms bigint NOT NULL CHECK (duration_ms BETWEEN 60000 AND 86400000),
  published boolean NOT NULL DEFAULT false,
  test_only boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  publication_status text,
  source_schema_version text,
  source_manifest_hash char(64),
  content_hash char(64),
  question_bundle_hash char(64),
  provenance jsonb,
  scoring_policy jsonb NOT NULL,
  manifest_hash char(64) NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (form_id, version)
);
CREATE INDEX IF NOT EXISTS amc_published_forms_idx ON amc_practice.form_revisions(form_id, version) WHERE published;

CREATE TABLE IF NOT EXISTS amc_practice.form_questions (
  form_id text NOT NULL,
  form_version text NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  prompt_markdown text NOT NULL,
  choices jsonb NOT NULL,
  correct_option char(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D', 'E')),
  solution_markdown text NOT NULL,
  PRIMARY KEY (form_id, form_version, question_number),
  FOREIGN KEY (form_id, form_version) REFERENCES amc_practice.form_revisions(form_id, version) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS amc_practice.attempts (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES amc_practice.students(id),
  form_id text NOT NULL,
  form_version text NOT NULL,
  duration_ms bigint NOT NULL CHECK (duration_ms BETWEEN 60000 AND 86400000),
  phase text NOT NULL CHECK (phase IN ('TIMED', 'LIMIT_NOTICE', 'OVERTIME', 'FINALIZED', 'RESET')),
  clock_state text NOT NULL CHECK (clock_state IN ('RUNNING', 'PAUSED')),
  active_elapsed_ms bigint NOT NULL CHECK (active_elapsed_ms >= 0),
  clock_started_at timestamptz,
  answers_revision integer NOT NULL DEFAULT 0 CHECK (answers_revision >= 0),
  state_revision bigint NOT NULL DEFAULT 0 CHECK (state_revision >= 0),
  limit_reached_at timestamptz,
  finalized_at timestamptz,
  reset_at timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  FOREIGN KEY (form_id, form_version) REFERENCES amc_practice.form_revisions(form_id, version) ON DELETE RESTRICT,
  CHECK ((clock_state = 'RUNNING' AND clock_started_at IS NOT NULL) OR (clock_state = 'PAUSED' AND clock_started_at IS NULL))
);
-- One recoverable active attempt per student/form. The reset endpoint changes
-- the old row before inserting the new one in the same transaction.
CREATE UNIQUE INDEX IF NOT EXISTS amc_one_active_attempt_idx
  ON amc_practice.attempts(student_id, form_id)
  WHERE phase NOT IN ('FINALIZED', 'RESET');
CREATE INDEX IF NOT EXISTS amc_deadline_candidates_idx
  ON amc_practice.attempts(phase, clock_state, clock_started_at)
  WHERE phase = 'TIMED' AND clock_state = 'RUNNING';

CREATE TABLE IF NOT EXISTS amc_practice.attempt_answers (
  attempt_id uuid NOT NULL REFERENCES amc_practice.attempts(id) ON DELETE RESTRICT,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  selected_option char(1) CHECK (selected_option IS NULL OR selected_option IN ('A', 'B', 'C', 'D', 'E')),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (attempt_id, question_number)
);

CREATE TABLE IF NOT EXISTS amc_practice.submissions (
  id uuid PRIMARY KEY,
  attempt_id uuid NOT NULL REFERENCES amc_practice.attempts(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('CHECKPOINT', 'DEADLINE', 'FINAL')),
  slot text NOT NULL CHECK (slot IN ('PRELIMINARY', 'FINAL')),
  trigger text NOT NULL,
  active_elapsed_ms bigint NOT NULL CHECK (active_elapsed_ms >= 0),
  scoring_policy jsonb NOT NULL,
  total_points numeric(12,4) NOT NULL,
  maximum_points numeric(12,4) NOT NULL,
  answered_count smallint NOT NULL CHECK (answered_count >= 0),
  correct_count smallint NOT NULL CHECK (correct_count >= 0),
  incorrect_count smallint NOT NULL CHECK (incorrect_count >= 0),
  blank_count smallint NOT NULL CHECK (blank_count >= 0),
  created_at timestamptz NOT NULL,
  UNIQUE (attempt_id, slot)
);
CREATE INDEX IF NOT EXISTS amc_submissions_attempt_idx ON amc_practice.submissions(attempt_id, created_at);

CREATE TABLE IF NOT EXISTS amc_practice.submission_answers (
  submission_id uuid NOT NULL REFERENCES amc_practice.submissions(id) ON DELETE RESTRICT,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  selected_option char(1) CHECK (selected_option IS NULL OR selected_option IN ('A', 'B', 'C', 'D', 'E')),
  correct_option char(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean,
  points numeric(12,4) NOT NULL,
  PRIMARY KEY (submission_id, question_number)
);

CREATE TABLE IF NOT EXISTS amc_practice.timer_events (
  id bigserial PRIMARY KEY,
  attempt_id uuid NOT NULL REFERENCES amc_practice.attempts(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS amc_timer_events_attempt_idx ON amc_practice.timer_events(attempt_id, occurred_at);

CREATE TABLE IF NOT EXISTS amc_practice.idempotency_records (
  student_id uuid NOT NULL REFERENCES amc_practice.students(id),
  scope text NOT NULL CHECK (char_length(scope) BETWEEN 1 AND 300),
  key text NOT NULL CHECK (char_length(key) BETWEEN 8 AND 128),
  request_hash char(64) NOT NULL,
  response_status smallint NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  PRIMARY KEY (student_id, scope, key)
);
CREATE INDEX IF NOT EXISTS amc_idempotency_cleanup_idx ON amc_practice.idempotency_records(created_at);
