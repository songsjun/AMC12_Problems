-- Human-approved model context and derived learning reports remain isolated
-- from immutable official scoring data. Provider payloads/errors are never
-- stored raw; every derived row is bound to exact content, approval, and evidence.

CREATE TABLE amc_practice.approved_context_sets (
  id uuid PRIMARY KEY,
  schema_version text NOT NULL CHECK (schema_version = 'amc-approved-question-context-set-v1'),
  artifact_set_hash char(64) NOT NULL UNIQUE CHECK (artifact_set_hash ~ '^[0-9a-f]{64}$'),
  archive_wrapper_set_hash char(64) CHECK (archive_wrapper_set_hash IS NULL OR archive_wrapper_set_hash ~ '^[0-9a-f]{64}$'),
  candidate_schema_version text NOT NULL CHECK (candidate_schema_version IN (
    'amc-question-context-candidate-set-v1', 'amc-question-context-archive-candidate-set-v1'
  )),
  candidate_set_hash char(64) NOT NULL CHECK (candidate_set_hash ~ '^[0-9a-f]{64}$'),
  decision_set_hash char(64) NOT NULL CHECK (decision_set_hash ~ '^[0-9a-f]{64}$'),
  approval_authority_id text NOT NULL CHECK (char_length(approval_authority_id) BETWEEN 3 AND 128),
  approval_receipt_set_hash char(64) NOT NULL CHECK (approval_receipt_set_hash ~ '^[0-9a-f]{64}$'),
  form_id text NOT NULL,
  form_version text NOT NULL,
  context_content_hash char(64) NOT NULL CHECK (context_content_hash ~ '^[0-9a-f]{64}$'),
  release_question_bundle_hash char(64) NOT NULL CHECK (release_question_bundle_hash ~ '^[0-9a-f]{64}$'),
  release_content_hash char(64) NOT NULL CHECK (release_content_hash ~ '^[0-9a-f]{64}$'),
  release_manifest_hash char(64) NOT NULL CHECK (release_manifest_hash ~ '^[0-9a-f]{64}$'),
  active boolean NOT NULL DEFAULT true,
  imported_at timestamptz NOT NULL,
  superseded_at timestamptz,
  FOREIGN KEY (form_id, form_version)
    REFERENCES amc_practice.form_revisions(form_id, version) ON DELETE RESTRICT,
  CONSTRAINT amc_approved_context_identity_unique UNIQUE (id, form_id, form_version),
  CONSTRAINT amc_approved_context_authority_unique UNIQUE (id, approval_authority_id),
  CHECK ((active AND superseded_at IS NULL) OR (NOT active AND superseded_at IS NOT NULL))
);
CREATE UNIQUE INDEX amc_one_active_approved_context_idx
  ON amc_practice.approved_context_sets(form_id, form_version) WHERE active;

CREATE TABLE amc_practice.approved_context_questions (
  context_set_id uuid NOT NULL REFERENCES amc_practice.approved_context_sets(id) ON DELETE RESTRICT,
  form_id text NOT NULL,
  form_version text NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  question_content_hash char(64) NOT NULL CHECK (question_content_hash ~ '^[0-9a-f]{64}$'),
  prompt_markdown text NOT NULL CHECK (octet_length(prompt_markdown) BETWEEN 1 AND 16384),
  choices jsonb NOT NULL,
  approved_solution_count smallint NOT NULL CHECK (approved_solution_count BETWEEN 2 AND 8),
  model_eligible_solution_count smallint NOT NULL CHECK (model_eligible_solution_count BETWEEN 2 AND 8),
  visual_context jsonb NOT NULL CHECK (
    visual_context = '{"required": false, "modelAvailable": true, "reason": null}'::jsonb
  ),
  CHECK (model_eligible_solution_count <= approved_solution_count),
  PRIMARY KEY (context_set_id, question_number),
  CONSTRAINT amc_approved_context_question_set_fk
  FOREIGN KEY (context_set_id, form_id, form_version)
    REFERENCES amc_practice.approved_context_sets(id, form_id, form_version) ON DELETE RESTRICT,
  FOREIGN KEY (form_id, form_version, question_number)
    REFERENCES amc_practice.form_questions(form_id, form_version, question_number) ON DELETE RESTRICT
);

CREATE TABLE amc_practice.approved_context_solutions (
  context_set_id uuid NOT NULL,
  question_number smallint NOT NULL,
  solution_position smallint NOT NULL CHECK (solution_position BETWEEN 1 AND 8),
  artifact_solution_id text NOT NULL CHECK (char_length(artifact_solution_id) BETWEEN 1 AND 96),
  title text NOT NULL CHECK (octet_length(title) BETWEEN 1 AND 256),
  body_markdown text NOT NULL CHECK (octet_length(body_markdown) BETWEEN 1 AND 16384),
  body_sha256 char(64) NOT NULL CHECK (body_sha256 ~ '^[0-9a-f]{64}$'),
  source_path text NOT NULL,
  source_sha256 char(64) NOT NULL CHECK (source_sha256 ~ '^[0-9a-f]{64}$'),
  source_heading_line integer NOT NULL CHECK (source_heading_line >= 1),
  source_end_line integer NOT NULL CHECK (source_end_line >= source_heading_line),
  reviewer_id text NOT NULL CHECK (char_length(reviewer_id) BETWEEN 3 AND 128),
  reviewed_at text NOT NULL CHECK (
    reviewed_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,6})?Z$'
  ),
  rights_status text NOT NULL CHECK (rights_status = 'approved-for-ai-use'),
  quality_flags jsonb NOT NULL,
  method_tags jsonb NOT NULL,
  model_eligible boolean NOT NULL,
  model_ineligibility_reason text,
  decision_record_hash char(64) NOT NULL CHECK (decision_record_hash ~ '^[0-9a-f]{64}$'),
  authority_receipt_id text NOT NULL CHECK (char_length(authority_receipt_id) BETWEEN 3 AND 128),
  authority_receipt_authority_id text NOT NULL CHECK (char_length(authority_receipt_authority_id) BETWEEN 3 AND 128),
  authority_receipt_issued_at text NOT NULL CHECK (
    authority_receipt_issued_at ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,6})?Z$'
  ),
  authority_receipt_status text NOT NULL CHECK (authority_receipt_status = 'active'),
  PRIMARY KEY (context_set_id, question_number, solution_position),
  UNIQUE (context_set_id, question_number, artifact_solution_id),
  UNIQUE (context_set_id, authority_receipt_id),
  CHECK ((model_eligible AND model_ineligibility_reason IS NULL)
    OR (NOT model_eligible AND model_ineligibility_reason = 'solution-visual-context-unavailable')),
  FOREIGN KEY (context_set_id, question_number)
    REFERENCES amc_practice.approved_context_questions(context_set_id, question_number) ON DELETE RESTRICT,
  FOREIGN KEY (context_set_id, authority_receipt_authority_id)
    REFERENCES amc_practice.approved_context_sets(id, approval_authority_id) ON DELETE RESTRICT
);

ALTER TABLE amc_practice.learning_submission_versions
  ADD CONSTRAINT amc_learning_version_context_set_fk
    FOREIGN KEY (context_set_id) REFERENCES amc_practice.approved_context_sets(id) ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_version_run_lineage_unique
    UNIQUE (id, context_set_id, version_number, evidence_hash);

CREATE TABLE amc_practice.learning_analysis_runs (
  id uuid PRIMARY KEY,
  learning_submission_version_id uuid NOT NULL UNIQUE
    REFERENCES amc_practice.learning_submission_versions(id) ON DELETE RESTRICT,
  context_set_id uuid NOT NULL REFERENCES amc_practice.approved_context_sets(id) ON DELETE RESTRICT,
  version_number integer NOT NULL CHECK (version_number >= 1),
  input_hash char(64) NOT NULL CHECK (input_hash ~ '^[0-9a-f]{64}$'),
  evidence_hash char(64) NOT NULL CHECK (evidence_hash ~ '^[0-9a-f]{64}$'),
  deletion_generation integer NOT NULL CHECK (deletion_generation >= 0),
  status text NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETE', 'PARTIAL', 'UNASSESSABLE', 'FAILED', 'CANCELLED')),
  created_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) BETWEEN 1 AND 100),
  CONSTRAINT amc_analysis_run_version_lineage_fk
  FOREIGN KEY (learning_submission_version_id, context_set_id, version_number, evidence_hash)
    REFERENCES amc_practice.learning_submission_versions(id, context_set_id, version_number, evidence_hash)
    ON DELETE RESTRICT,
  CONSTRAINT amc_analysis_run_id_version_unique UNIQUE (id, learning_submission_version_id)
);

ALTER TABLE amc_practice.learning_work_items
  ADD COLUMN analysis_run_id uuid,
  ADD COLUMN lease_token uuid,
  ADD CONSTRAINT amc_learning_work_analysis_run_fk
    FOREIGN KEY (analysis_run_id) REFERENCES amc_practice.learning_analysis_runs(id) ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_work_run_version_fk
    FOREIGN KEY (analysis_run_id, learning_submission_version_id)
    REFERENCES amc_practice.learning_analysis_runs(id, learning_submission_version_id) ON DELETE RESTRICT;
-- A pre-migration RUNNING row has no unforgeable token. Requeue it rather
-- than grandfathering the unsafe owner-id-only lease across this boundary.
UPDATE amc_practice.learning_analysis_runs r
SET status = 'QUEUED', started_at = NULL, last_error_code = 'LEASE_FENCE_MIGRATION'
FROM amc_practice.learning_work_items w
WHERE w.analysis_run_id = r.id AND w.status = 'RUNNING';
UPDATE amc_practice.learning_work_items
SET status = 'QUEUED', lease_owner = NULL, lease_token = NULL, lease_expires_at = NULL,
    available_at = clock_timestamp(), last_error_code = 'LEASE_FENCE_MIGRATION',
    updated_at = clock_timestamp()
WHERE status = 'RUNNING';
ALTER TABLE amc_practice.learning_work_items
  DROP CONSTRAINT learning_work_items_check,
  ADD CONSTRAINT amc_learning_work_lease_fence_check CHECK (
    (status = 'RUNNING' AND lease_owner IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR (status <> 'RUNNING' AND lease_owner IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL)
  );
CREATE UNIQUE INDEX amc_learning_work_analysis_run_unique
  ON amc_practice.learning_work_items(analysis_run_id) WHERE analysis_run_id IS NOT NULL;

CREATE TABLE amc_practice.learning_question_analyses (
  analysis_run_id uuid NOT NULL REFERENCES amc_practice.learning_analysis_runs(id) ON DELETE RESTRICT,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  status text NOT NULL CHECK (status IN ('SUCCEEDED', 'UNASSESSABLE', 'FAILED')),
  provider_invoked boolean NOT NULL,
  reasoning_verdict text CHECK (reasoning_verdict IS NULL OR reasoning_verdict IN (
    'CORRECT_AND_WELL_JUSTIFIED', 'CORRECT_WITH_REASONING_GAPS', 'INCORRECT_CONCEPTUAL',
    'INCORRECT_EXECUTION', 'INCORRECT_UNCLASSIFIED', 'ANSWER_ONLY', 'NO_ATTEMPT'
  )),
  summary_markdown text NOT NULL,
  strengths jsonb NOT NULL,
  gaps jsonb NOT NULL,
  suggestions jsonb NOT NULL,
  solution_comparisons jsonb NOT NULL,
  confidence double precision CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  outcome_code text CHECK (outcome_code IS NULL OR char_length(outcome_code) BETWEEN 1 AND 100),
  run_metadata jsonb,
  error_class text CHECK (error_class IS NULL OR error_class IN ('permanent', 'rate_limit', 'transient')),
  retryable boolean NOT NULL DEFAULT false,
  question_input_hash char(64) NOT NULL CHECK (question_input_hash ~ '^[0-9a-f]{64}$'),
  question_context_hash char(64) CHECK (question_context_hash IS NULL OR question_context_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (analysis_run_id, question_number),
  CHECK (
    (status = 'SUCCEEDED' AND provider_invoked AND reasoning_verdict IS NOT NULL AND confidence IS NOT NULL
      AND outcome_code IS NULL AND run_metadata IS NOT NULL AND error_class IS NULL AND NOT retryable)
    OR (status = 'UNASSESSABLE' AND NOT provider_invoked AND reasoning_verdict IS NULL AND confidence IS NULL
      AND outcome_code IS NOT NULL AND run_metadata IS NULL AND error_class IS NULL AND NOT retryable)
    OR (status = 'FAILED' AND provider_invoked AND reasoning_verdict IS NULL AND confidence IS NULL
      AND outcome_code IS NOT NULL AND run_metadata IS NULL AND error_class IS NOT NULL)
  )
);

CREATE TABLE amc_practice.learning_reports (
  id uuid PRIMARY KEY,
  analysis_run_id uuid NOT NULL UNIQUE REFERENCES amc_practice.learning_analysis_runs(id) ON DELETE RESTRICT,
  learning_submission_version_id uuid NOT NULL UNIQUE
    REFERENCES amc_practice.learning_submission_versions(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('COMPLETE', 'PARTIAL', 'UNASSESSABLE', 'FAILED')),
  generated_at timestamptz NOT NULL,
  summary jsonb NOT NULL,
  report_hash char(64) NOT NULL CHECK (report_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT amc_learning_report_run_version_fk
  FOREIGN KEY (analysis_run_id, learning_submission_version_id)
    REFERENCES amc_practice.learning_analysis_runs(id, learning_submission_version_id) ON DELETE RESTRICT
);
CREATE INDEX amc_learning_reports_version_idx
  ON amc_practice.learning_reports(learning_submission_version_id, generated_at DESC);
