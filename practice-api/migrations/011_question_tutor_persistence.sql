-- Question Tutor is a separate aggregate. It pins a complete Gateway context
-- and application-only analysis/report lineage instead of rebuilding either
-- from mutable current projections.

ALTER TABLE amc_practice.sessions
  ADD CONSTRAINT amc_tutor_session_owner_unique UNIQUE (id, student_id);
ALTER TABLE amc_practice.learning_submissions
  ADD CONSTRAINT amc_tutor_submission_lineage_unique
    UNIQUE (id, student_id, form_id, form_version, source_type),
  ADD CONSTRAINT amc_tutor_submission_scoring_unique
    UNIQUE (id, official_submission_id);
ALTER TABLE amc_practice.learning_submission_versions
  ADD CONSTRAINT amc_tutor_version_lineage_unique
    UNIQUE (id, learning_submission_id, version_number, form_id, form_version, context_set_id, evidence_hash);
ALTER TABLE amc_practice.approved_context_questions
  ADD CONSTRAINT amc_tutor_context_question_lineage_unique
    UNIQUE (context_set_id, question_number, form_id, form_version, question_content_hash);
ALTER TABLE amc_practice.approved_context_sets
  ADD CONSTRAINT amc_tutor_context_artifact_unique UNIQUE (id, artifact_set_hash);
ALTER TABLE amc_practice.learning_analysis_runs
  ADD CONSTRAINT amc_tutor_analysis_lineage_unique
    UNIQUE (id, learning_submission_version_id, context_set_id, version_number, evidence_hash,
      analysis_contract_version, deletion_generation);
ALTER TABLE amc_practice.learning_reports
  ADD CONSTRAINT amc_tutor_report_lineage_unique
    UNIQUE (id, analysis_run_id, learning_submission_version_id, report_hash);
ALTER TABLE amc_practice.learning_question_responses
  ADD CONSTRAINT amc_tutor_response_origin_unique
    UNIQUE (learning_submission_version_id, question_number, answer_origin);
ALTER TABLE amc_practice.learning_batch_results
  ADD CONSTRAINT amc_tutor_batch_result_version_unique
    UNIQUE (id, learning_submission_version_id);

CREATE TABLE amc_practice.learning_tutor_snapshots (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL,
  learning_submission_id uuid NOT NULL,
  learning_submission_version_id uuid NOT NULL,
  version_number integer NOT NULL CHECK (version_number >= 1),
  form_id text NOT NULL,
  form_version text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW')),
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 25),
  context_set_id uuid NOT NULL,
  question_content_hash char(64) NOT NULL CHECK (question_content_hash ~ '^[0-9a-f]{64}$'),
  analysis_run_id uuid NOT NULL,
  analysis_contract_version text NOT NULL
    CHECK (analysis_contract_version IN ('amc-analysis-contract-v1', 'amc-analysis-contract-v2')),
  analysis_question_input_hash char(64) NOT NULL
    CHECK (analysis_question_input_hash ~ '^[0-9a-f]{64}$'),
  analysis_question_context_hash char(64)
    CHECK (analysis_question_context_hash IS NULL OR analysis_question_context_hash ~ '^[0-9a-f]{64}$'),
  report_id uuid NOT NULL,
  report_hash char(64) NOT NULL CHECK (report_hash ~ '^[0-9a-f]{64}$'),
  evidence_hash char(64) NOT NULL CHECK (evidence_hash ~ '^[0-9a-f]{64}$'),
  question_response_hash char(64) NOT NULL CHECK (question_response_hash ~ '^[0-9a-f]{64}$'),
  scoring_snapshot_hash char(64) NOT NULL CHECK (scoring_snapshot_hash ~ '^[0-9a-f]{64}$'),
  scoring_origin text NOT NULL CHECK (scoring_origin IN ('OFFICIAL_FINAL', 'BATCH_CONFIRMED')),
  official_submission_id uuid,
  batch_result_id uuid,
  initial_deletion_generation integer NOT NULL CHECK (initial_deletion_generation >= 0),
  context_artifact_sha256 char(64) NOT NULL CHECK (context_artifact_sha256 ~ '^[0-9a-f]{64}$'),
  context_release_hash char(64) NOT NULL CHECK (context_release_hash ~ '^[0-9a-f]{64}$'),
  payload_schema text NOT NULL CHECK (payload_schema = 'amc-tutor-snapshot-v2'),
  snapshot_payload jsonb NOT NULL CHECK (
    jsonb_typeof(snapshot_payload) = 'object'
    AND jsonb_typeof(snapshot_payload->'question') = 'object'
    AND snapshot_payload ?& ARRAY[
      'learningSubmissionId', 'learningSubmissionVersionId', 'versionNumber', 'formId',
      'formVersion', 'contextSetId', 'contextArtifactSha256', 'contextReleaseHash',
      'evidenceHash', 'question'
    ]
    AND snapshot_payload - ARRAY[
      'learningSubmissionId', 'learningSubmissionVersionId', 'versionNumber', 'formId',
      'formVersion', 'contextSetId', 'contextArtifactSha256', 'contextReleaseHash',
      'evidenceHash', 'question'
    ] = '{}'::jsonb
    AND (snapshot_payload->'question') ?& ARRAY[
      'questionNumber', 'questionId', 'promptMarkdown', 'choices', 'isScored',
      'officialAnswer', 'acceptedOptions', 'studentAnswer', 'studentReasoning', 'solutions'
    ]
    AND (snapshot_payload->'question') - ARRAY[
      'questionNumber', 'questionId', 'promptMarkdown', 'choices', 'isScored',
      'officialAnswer', 'acceptedOptions', 'studentAnswer', 'studentReasoning', 'solutions'
    ] = '{}'::jsonb
    AND octet_length(snapshot_payload::text) <= 262144
    AND (snapshot_payload->>'learningSubmissionId')
      IS NOT DISTINCT FROM learning_submission_id::text
    AND (snapshot_payload->>'learningSubmissionVersionId')
      IS NOT DISTINCT FROM learning_submission_version_id::text
    AND (snapshot_payload->>'versionNumber') IS NOT DISTINCT FROM version_number::text
    AND (snapshot_payload->>'formId') IS NOT DISTINCT FROM form_id
    AND (snapshot_payload->>'formVersion') IS NOT DISTINCT FROM form_version
    AND (snapshot_payload->>'contextSetId') IS NOT DISTINCT FROM context_set_id::text
    AND (snapshot_payload->>'contextArtifactSha256')
      IS NOT DISTINCT FROM context_artifact_sha256::text
    AND (snapshot_payload->>'contextReleaseHash') IS NOT DISTINCT FROM context_release_hash::text
    AND (snapshot_payload->>'evidenceHash') IS NOT DISTINCT FROM evidence_hash::text
    AND (snapshot_payload#>>'{question,questionNumber}')
      IS NOT DISTINCT FROM question_number::text
  ),
  snapshot_hash char(64) NOT NULL CHECK (snapshot_hash ~ '^[0-9a-f]{64}$'),
  thread_lineage_hash char(64) NOT NULL CHECK (thread_lineage_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  CHECK (
    (scoring_origin = 'OFFICIAL_FINAL' AND official_submission_id IS NOT NULL
      AND batch_result_id IS NULL)
    OR (scoring_origin = 'BATCH_CONFIRMED' AND official_submission_id IS NULL
      AND batch_result_id IS NOT NULL)
  ),
  CONSTRAINT amc_tutor_snapshot_submission_fk
    FOREIGN KEY (learning_submission_id, student_id, form_id, form_version, source_type)
      REFERENCES amc_practice.learning_submissions(id, student_id, form_id, form_version, source_type)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_version_fk
    FOREIGN KEY (learning_submission_version_id, learning_submission_id, version_number,
      form_id, form_version, context_set_id, evidence_hash)
      REFERENCES amc_practice.learning_submission_versions(
        id, learning_submission_id, version_number, form_id, form_version, context_set_id, evidence_hash)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_context_question_fk
    FOREIGN KEY (context_set_id, question_number, form_id, form_version, question_content_hash)
      REFERENCES amc_practice.approved_context_questions(
        context_set_id, question_number, form_id, form_version, question_content_hash)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_context_artifact_fk
    FOREIGN KEY (context_set_id, context_artifact_sha256)
      REFERENCES amc_practice.approved_context_sets(id, artifact_set_hash)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_analysis_fk
    FOREIGN KEY (analysis_run_id, learning_submission_version_id, context_set_id,
      version_number, evidence_hash, analysis_contract_version, initial_deletion_generation)
      REFERENCES amc_practice.learning_analysis_runs(
        id, learning_submission_version_id, context_set_id, version_number, evidence_hash,
        analysis_contract_version, deletion_generation)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_question_analysis_fk
    FOREIGN KEY (analysis_run_id, question_number)
      REFERENCES amc_practice.learning_question_analyses(analysis_run_id, question_number)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_response_fk
    FOREIGN KEY (learning_submission_version_id, question_number, scoring_origin)
      REFERENCES amc_practice.learning_question_responses(
        learning_submission_version_id, question_number, answer_origin)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_official_submission_fk
    FOREIGN KEY (learning_submission_id, official_submission_id)
      REFERENCES amc_practice.learning_submissions(id, official_submission_id)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_official_answer_fk
    FOREIGN KEY (official_submission_id, question_number)
      REFERENCES amc_practice.submission_answers(submission_id, question_number)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_batch_result_version_fk
    FOREIGN KEY (batch_result_id, learning_submission_version_id)
      REFERENCES amc_practice.learning_batch_results(id, learning_submission_version_id)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_batch_result_item_fk
    FOREIGN KEY (batch_result_id, question_number)
      REFERENCES amc_practice.learning_batch_result_items(batch_result_id, question_number)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_report_fk
    FOREIGN KEY (report_id, analysis_run_id, learning_submission_version_id, report_hash)
      REFERENCES amc_practice.learning_reports(
        id, analysis_run_id, learning_submission_version_id, report_hash)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_snapshot_identity_unique
    UNIQUE (learning_submission_version_id, question_number, analysis_run_id, report_id),
  CONSTRAINT amc_tutor_snapshot_thread_fk_unique
    UNIQUE (id, student_id, learning_submission_id, learning_submission_version_id,
      question_number, snapshot_hash, thread_lineage_hash, initial_deletion_generation)
);
CREATE INDEX amc_tutor_snapshots_owner_idx
  ON amc_practice.learning_tutor_snapshots(student_id, learning_submission_id,
    learning_submission_version_id, question_number, created_at DESC);

CREATE FUNCTION amc_practice.reject_tutor_append_only_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Tutor persistence records are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER amc_tutor_snapshots_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_tutor_snapshots
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_tutor_append_only_mutation();

CREATE FUNCTION amc_practice.tutor_source_generation_is_live(
  target_submission_id uuid,
  target_version_id uuid,
  target_student_id uuid,
  target_generation integer
) RETURNS boolean
LANGUAGE plpgsql VOLATILE
AS $$
DECLARE
  target_release_id uuid;
BEGIN
  SELECT submission.open_review_release_id
    INTO target_release_id
  FROM amc_practice.learning_submissions submission
  JOIN amc_practice.learning_submission_versions version
    ON version.id = target_version_id
   AND version.learning_submission_id = submission.id
  WHERE submission.id = target_submission_id AND submission.student_id = target_student_id
  FOR SHARE OF submission;
  IF NOT FOUND THEN RETURN false; END IF;
  IF target_release_id IS NOT NULL THEN
    PERFORM 1 FROM amc_practice.open_review_releases
    WHERE id = target_release_id FOR SHARE;
    IF NOT FOUND THEN RETURN false; END IF;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM amc_practice.learning_submissions submission
    JOIN amc_practice.learning_submission_versions version
      ON version.id = target_version_id
     AND version.learning_submission_id = submission.id
    WHERE submission.id = target_submission_id
      AND submission.student_id = target_student_id
      AND submission.lifecycle_status = 'COMMITTED'
      AND amc_practice.learning_entitlement_allows(submission.id, 'EXISTING_WORK')
      AND submission.deletion_generation = target_generation
  );
END;
$$;

CREATE FUNCTION amc_practice.validate_tutor_snapshot_insert()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  response_row record;
  scoring_row record;
  question_row record;
  analysis_row record;
  solution_payload jsonb;
  expected_payload jsonb;
BEGIN
  IF NOT amc_practice.tutor_source_generation_is_live(
      NEW.learning_submission_id, NEW.learning_submission_version_id,
      NEW.student_id, NEW.initial_deletion_generation) THEN
    RAISE EXCEPTION 'Tutor snapshot requires live submission entitlement and generation'
      USING ERRCODE = '23514';
  END IF;

  SELECT selected_option::text AS selected_option, reasoning_text, answer_origin
    INTO response_row
  FROM amc_practice.learning_question_responses
  WHERE learning_submission_version_id = NEW.learning_submission_version_id
    AND question_number = NEW.question_number AND answer_origin = NEW.scoring_origin;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor snapshot response authority is missing' USING ERRCODE = '23514';
  END IF;

  IF NEW.scoring_origin = 'OFFICIAL_FINAL' THEN
    SELECT selected_option::text AS selected_option, correct_option::text AS canonical_answer,
           accepted_options, is_scored
      INTO scoring_row
    FROM amc_practice.submission_answers
    WHERE submission_id = NEW.official_submission_id AND question_number = NEW.question_number;
  ELSE
    SELECT item.selected_option::text AS selected_option,
           item.correct_option::text AS canonical_answer,
           item.accepted_options, item.is_scored
      INTO scoring_row
    FROM amc_practice.learning_batch_result_items item
    WHERE item.batch_result_id = NEW.batch_result_id
      AND item.question_number = NEW.question_number;
  END IF;
  IF NOT FOUND OR scoring_row.selected_option IS DISTINCT FROM response_row.selected_option THEN
    RAISE EXCEPTION 'Tutor snapshot scoring authority is inconsistent' USING ERRCODE = '23514';
  END IF;

  SELECT prompt_markdown, choices INTO question_row
  FROM amc_practice.approved_context_questions
  WHERE context_set_id = NEW.context_set_id AND question_number = NEW.question_number
    AND form_id = NEW.form_id AND form_version = NEW.form_version
    AND question_content_hash = NEW.question_content_hash;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor snapshot question authority is missing' USING ERRCODE = '23514';
  END IF;

  SELECT question_input_hash, question_context_hash INTO analysis_row
  FROM amc_practice.learning_question_analyses
  WHERE analysis_run_id = NEW.analysis_run_id AND question_number = NEW.question_number;
  IF NOT FOUND OR analysis_row.question_input_hash IS DISTINCT FROM NEW.analysis_question_input_hash
      OR analysis_row.question_context_hash IS DISTINCT FROM NEW.analysis_question_context_hash THEN
    RAISE EXCEPTION 'Tutor snapshot analysis hashes are inconsistent' USING ERRCODE = '23514';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
      'solutionId', artifact_solution_id,
      'approvalStatus', 'APPROVED',
      'modelEligible', true,
      'title', title,
      'markdown', body_markdown,
      'bodySha256', body_sha256::text,
      'sourceSha256', source_sha256::text,
      'reviewerId', reviewer_id,
      'reviewedAt', reviewed_at,
      'rightsStatus', rights_status,
      'authorityReceiptId', authority_receipt_id,
      'authorityReceiptStatus', authority_receipt_status,
      'methodTags', method_tags,
      'qualityFlags', quality_flags
    ) ORDER BY solution_position) INTO solution_payload
  FROM amc_practice.approved_context_solutions
  WHERE context_set_id = NEW.context_set_id AND question_number = NEW.question_number
    AND model_eligible AND authority_receipt_status = 'active';

  expected_payload := jsonb_build_object(
    'learningSubmissionId', NEW.learning_submission_id::text,
    'learningSubmissionVersionId', NEW.learning_submission_version_id::text,
    'versionNumber', NEW.version_number,
    'formId', NEW.form_id,
    'formVersion', NEW.form_version,
    'contextSetId', NEW.context_set_id::text,
    'contextArtifactSha256', NEW.context_artifact_sha256::text,
    'contextReleaseHash', NEW.context_release_hash::text,
    'evidenceHash', NEW.evidence_hash::text,
    'question', jsonb_build_object(
      'questionNumber', NEW.question_number,
      'questionId', NEW.form_id || ':q:' || NEW.question_number::text,
      'promptMarkdown', question_row.prompt_markdown,
      'choices', jsonb_build_array(
        jsonb_build_object('label', 'A', 'textMarkdown', question_row.choices->>'A'),
        jsonb_build_object('label', 'B', 'textMarkdown', question_row.choices->>'B'),
        jsonb_build_object('label', 'C', 'textMarkdown', question_row.choices->>'C'),
        jsonb_build_object('label', 'D', 'textMarkdown', question_row.choices->>'D'),
        jsonb_build_object('label', 'E', 'textMarkdown', question_row.choices->>'E')
      ),
      'isScored', scoring_row.is_scored,
      'officialAnswer', scoring_row.canonical_answer,
      'acceptedOptions', scoring_row.accepted_options,
      'studentAnswer', response_row.selected_option,
      'studentReasoning', NULLIF(response_row.reasoning_text, ''),
      'solutions', solution_payload
    )
  );
  IF solution_payload IS NULL OR NEW.snapshot_payload IS DISTINCT FROM expected_payload THEN
    RAISE EXCEPTION 'Tutor snapshot payload differs from authoritative content'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_validate_tutor_snapshot_insert
  BEFORE INSERT ON amc_practice.learning_tutor_snapshots
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_snapshot_insert();

CREATE TABLE amc_practice.learning_tutor_threads (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES amc_practice.students(id) ON DELETE RESTRICT,
  snapshot_id uuid NOT NULL,
  learning_submission_id uuid NOT NULL,
  learning_submission_version_id uuid NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 25),
  snapshot_hash char(64) NOT NULL CHECK (snapshot_hash ~ '^[0-9a-f]{64}$'),
  thread_lineage_hash char(64) NOT NULL CHECK (thread_lineage_hash ~ '^[0-9a-f]{64}$'),
  tutor_contract_version text NOT NULL CHECK (tutor_contract_version = 'amc-tutor-contract-v2'),
  context_hash char(64) NOT NULL CHECK (context_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('OPEN', 'CAPACITY_REACHED', 'CLOSED', 'TOMBSTONED')),
  successful_turn_count smallint NOT NULL DEFAULT 0 CHECK (successful_turn_count BETWEEN 0 AND 9),
  request_count smallint NOT NULL DEFAULT 0 CHECK (request_count BETWEEN 0 AND 32),
  successful_history_bytes integer NOT NULL DEFAULT 0
    CHECK (successful_history_bytes BETWEEN 0 AND 51200),
  thread_revision bigint NOT NULL DEFAULT 0 CHECK (thread_revision >= 0),
  initial_deletion_generation integer NOT NULL CHECK (initial_deletion_generation >= 0),
  deletion_generation integer NOT NULL DEFAULT 0 CHECK (deletion_generation >= 0),
  forked_from_thread_id uuid,
  forked_from_turn_job_id uuid,
  creation_idempotency_key_hash char(64) NOT NULL
    CHECK (creation_idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  creation_request_hash char(64) NOT NULL CHECK (creation_request_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  closed_at timestamptz,
  tombstoned_at timestamptz,
  CONSTRAINT amc_tutor_thread_snapshot_fk
    FOREIGN KEY (snapshot_id, student_id, learning_submission_id,
      learning_submission_version_id, question_number, snapshot_hash, thread_lineage_hash,
      initial_deletion_generation)
      REFERENCES amc_practice.learning_tutor_snapshots(
        id, student_id, learning_submission_id, learning_submission_version_id,
        question_number, snapshot_hash, thread_lineage_hash, initial_deletion_generation)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_thread_fork_shape_check CHECK (
    (forked_from_thread_id IS NULL AND forked_from_turn_job_id IS NULL)
    OR (forked_from_thread_id IS NOT NULL AND forked_from_turn_job_id IS NOT NULL)
  ),
  CONSTRAINT amc_tutor_thread_status_time_check CHECK (
    (status IN ('OPEN', 'CAPACITY_REACHED') AND closed_at IS NULL AND tombstoned_at IS NULL)
    OR (status = 'CLOSED' AND closed_at IS NOT NULL AND tombstoned_at IS NULL)
    OR (status = 'TOMBSTONED' AND tombstoned_at IS NOT NULL)
  ),
  CONSTRAINT amc_tutor_thread_time_order_check CHECK (
    updated_at >= created_at
    AND (closed_at IS NULL OR (closed_at >= created_at AND closed_at <= updated_at))
    AND (tombstoned_at IS NULL OR (tombstoned_at >= created_at AND tombstoned_at <= updated_at))
  ),
  CONSTRAINT amc_tutor_thread_open_capacity_check CHECK (
    status <> 'OPEN'
    OR (successful_turn_count < 9 AND request_count < 32 AND successful_history_bytes < 51200)
  ),
  CONSTRAINT amc_tutor_thread_owner_idempotency_unique
    UNIQUE (student_id, creation_idempotency_key_hash),
  CONSTRAINT amc_tutor_thread_owner_unique UNIQUE (id, student_id),
  CONSTRAINT amc_tutor_thread_job_lineage_unique
    UNIQUE (id, student_id, snapshot_hash, context_hash, thread_lineage_hash, tutor_contract_version),
  CONSTRAINT amc_tutor_thread_fork_parent_unique
    UNIQUE (id, student_id, learning_submission_id, question_number)
);
ALTER TABLE amc_practice.learning_tutor_threads
  ADD CONSTRAINT amc_tutor_thread_fork_parent_fk
    FOREIGN KEY (forked_from_thread_id, student_id, learning_submission_id, question_number)
      REFERENCES amc_practice.learning_tutor_threads(
        id, student_id, learning_submission_id, question_number)
      ON DELETE RESTRICT;
CREATE INDEX amc_tutor_threads_owner_idx
  ON amc_practice.learning_tutor_threads(student_id, updated_at DESC, id);

CREATE FUNCTION amc_practice.guard_tutor_thread_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  persisted_success_count integer;
  persisted_min_turn integer;
  persisted_max_turn integer;
  persisted_history_bytes bigint;
BEGIN
  IF ROW(NEW.id, NEW.student_id, NEW.snapshot_id, NEW.learning_submission_id,
      NEW.learning_submission_version_id, NEW.question_number, NEW.snapshot_hash,
      NEW.thread_lineage_hash, NEW.tutor_contract_version, NEW.context_hash,
      NEW.initial_deletion_generation,
      NEW.forked_from_thread_id, NEW.forked_from_turn_job_id,
      NEW.creation_idempotency_key_hash, NEW.creation_request_hash, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.student_id, OLD.snapshot_id, OLD.learning_submission_id,
      OLD.learning_submission_version_id, OLD.question_number, OLD.snapshot_hash,
      OLD.thread_lineage_hash, OLD.tutor_contract_version, OLD.context_hash,
      OLD.initial_deletion_generation,
      OLD.forked_from_thread_id, OLD.forked_from_turn_job_id,
      OLD.creation_idempotency_key_hash, OLD.creation_request_hash, OLD.created_at) THEN
    RAISE EXCEPTION 'Tutor thread identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF NEW.thread_revision <> OLD.thread_revision + 1
      OR NEW.successful_turn_count < OLD.successful_turn_count
      OR NEW.successful_turn_count > OLD.successful_turn_count + 1
      OR NEW.request_count < OLD.request_count OR NEW.request_count > OLD.request_count + 1
      OR NEW.successful_history_bytes < OLD.successful_history_bytes
      OR NEW.deletion_generation < OLD.deletion_generation
      OR NEW.deletion_generation > OLD.deletion_generation + 1
      OR NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'Invalid Tutor thread revision or monotonic counters' USING ERRCODE = '55000';
  END IF;
  IF NOT (
    NEW.status = OLD.status
    OR (OLD.status = 'OPEN' AND NEW.status IN ('CAPACITY_REACHED', 'CLOSED', 'TOMBSTONED'))
    OR (OLD.status = 'CAPACITY_REACHED' AND NEW.status IN ('CLOSED', 'TOMBSTONED'))
    OR (OLD.status = 'CLOSED' AND NEW.status = 'TOMBSTONED')
  ) THEN
    RAISE EXCEPTION 'Invalid Tutor thread status transition' USING ERRCODE = '55000';
  END IF;
  IF OLD.status IN ('CLOSED', 'TOMBSTONED') AND NEW.status = OLD.status THEN
    RAISE EXCEPTION 'Terminal Tutor thread state is immutable' USING ERRCODE = '55000';
  END IF;
  IF NEW.status = 'TOMBSTONED'
      AND (OLD.status = 'TOMBSTONED'
        OR NEW.deletion_generation <> OLD.deletion_generation + 1) THEN
    RAISE EXCEPTION 'Tutor tombstone must advance deletion generation exactly once'
      USING ERRCODE = '55000';
  END IF;
  IF NEW.status <> 'TOMBSTONED' AND NEW.deletion_generation <> OLD.deletion_generation THEN
    RAISE EXCEPTION 'Tutor deletion generation changes only on tombstone'
      USING ERRCODE = '55000';
  END IF;
  IF NEW.status <> 'TOMBSTONED' AND NOT amc_practice.tutor_source_generation_is_live(
      NEW.learning_submission_id, NEW.learning_submission_version_id,
      NEW.student_id, NEW.deletion_generation) THEN
    RAISE EXCEPTION 'Tutor thread mutation requires live source entitlement and generation'
      USING ERRCODE = '55000';
  END IF;
  IF NEW.status = 'TOMBSTONED' AND EXISTS (
    SELECT 1 FROM amc_practice.learning_tutor_turn_jobs job
    WHERE job.thread_id = OLD.id
      AND job.status IN ('QUEUED', 'RUNNING', 'RETRY_WAIT')
  ) THEN
    RAISE EXCEPTION 'Tutor tombstone requires active work to be resolved first'
      USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'CAPACITY_REACHED' AND NEW.status = 'CAPACITY_REACHED'
      AND NOT (
        NEW.successful_turn_count = OLD.successful_turn_count + 1
        AND NEW.request_count = OLD.request_count
        AND NEW.successful_history_bytes > OLD.successful_history_bytes
        AND EXISTS (
          SELECT 1 FROM amc_practice.learning_tutor_turn_jobs job
          WHERE job.thread_id = OLD.id AND job.student_id = OLD.student_id
            AND job.turn_number = NEW.successful_turn_count AND job.status = 'SUCCEEDED'
        )
      ) THEN
    RAISE EXCEPTION 'Capacity-reached Tutor thread only accepts its committed in-flight result'
      USING ERRCODE = '55000';
  END IF;
  SELECT count(*)::integer, min(job.turn_number)::integer, max(job.turn_number)::integer,
         COALESCE(sum(octet_length(request.content_markdown)
           + octet_length(reply.content_markdown)), 0)::bigint
    INTO persisted_success_count, persisted_min_turn, persisted_max_turn,
         persisted_history_bytes
  FROM amc_practice.learning_tutor_turn_jobs job
  JOIN amc_practice.learning_tutor_messages request ON request.id = job.request_message_id
  JOIN amc_practice.learning_tutor_messages reply ON reply.id = job.response_message_id
  WHERE job.thread_id = OLD.id AND job.student_id = OLD.student_id
    AND job.status = 'SUCCEEDED';
  IF persisted_success_count <> NEW.successful_turn_count
      OR persisted_history_bytes <> NEW.successful_history_bytes
      OR (persisted_success_count > 0 AND (
        persisted_min_turn <> 1 OR persisted_max_turn <> persisted_success_count)) THEN
    RAISE EXCEPTION 'Tutor thread head must equal its contiguous successful history'
      USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_tutor_thread_mutation
  BEFORE UPDATE ON amc_practice.learning_tutor_threads
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_tutor_thread_mutation();
CREATE TRIGGER amc_reject_tutor_thread_delete
  BEFORE DELETE ON amc_practice.learning_tutor_threads
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_tutor_append_only_mutation();

CREATE TABLE amc_practice.learning_tutor_messages (
  id uuid PRIMARY KEY,
  thread_id uuid NOT NULL,
  student_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
  content_markdown text NOT NULL,
  content_sha256 char(64) NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  source_turn_job_id uuid,
  created_at timestamptz NOT NULL,
  CHECK (
    (role = 'USER' AND source_turn_job_id IS NULL
      AND octet_length(content_markdown) BETWEEN 1 AND 2048)
    OR (role = 'ASSISTANT' AND source_turn_job_id IS NOT NULL
      AND octet_length(content_markdown) BETWEEN 1 AND 4096)
  ),
  CONSTRAINT amc_tutor_message_thread_fk
    FOREIGN KEY (thread_id, student_id)
      REFERENCES amc_practice.learning_tutor_threads(id, student_id) ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_message_request_fk_unique UNIQUE (id, thread_id, student_id, role),
  CONSTRAINT amc_tutor_message_response_fk_unique
    UNIQUE (id, thread_id, student_id, role, content_sha256)
);
CREATE UNIQUE INDEX amc_tutor_one_assistant_message_per_job_idx
  ON amc_practice.learning_tutor_messages(source_turn_job_id) WHERE role = 'ASSISTANT';
CREATE INDEX amc_tutor_messages_thread_idx
  ON amc_practice.learning_tutor_messages(thread_id, created_at, id);
CREATE TRIGGER amc_tutor_messages_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_tutor_messages
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_tutor_append_only_mutation();

CREATE TABLE amc_practice.learning_tutor_turn_jobs (
  id uuid PRIMARY KEY,
  thread_id uuid NOT NULL,
  student_id uuid NOT NULL,
  request_message_id uuid NOT NULL,
  request_message_role text NOT NULL DEFAULT 'USER' CHECK (request_message_role = 'USER'),
  request_ordinal smallint NOT NULL CHECK (request_ordinal BETWEEN 1 AND 32),
  turn_number smallint NOT NULL CHECK (turn_number BETWEEN 1 AND 9),
  retry_of_job_id uuid,
  retry_authorization text CHECK (
    (retry_of_job_id IS NULL AND retry_authorization IS NULL)
    OR (retry_of_job_id IS NOT NULL AND retry_authorization = 'STUDENT_EXPLICIT')
  ),
  response_message_id uuid,
  response_message_role text NOT NULL DEFAULT 'ASSISTANT'
    CHECK (response_message_role = 'ASSISTANT'),
  reply_sha256 char(64) CHECK (reply_sha256 IS NULL OR reply_sha256 ~ '^[0-9a-f]{64}$'),
  authorized_session_id text NOT NULL,
  idempotency_key_hash char(64) NOT NULL CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  correlation_id text NOT NULL CHECK (
    char_length(correlation_id) BETWEEN 1 AND 96
    AND correlation_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'
  ),
  snapshot_hash char(64) NOT NULL CHECK (snapshot_hash ~ '^[0-9a-f]{64}$'),
  context_hash char(64) NOT NULL CHECK (context_hash ~ '^[0-9a-f]{64}$'),
  history_hash char(64) NOT NULL CHECK (history_hash ~ '^[0-9a-f]{64}$'),
  input_hash char(64) NOT NULL CHECK (input_hash ~ '^[0-9a-f]{64}$'),
  thread_lineage_hash char(64) NOT NULL CHECK (thread_lineage_hash ~ '^[0-9a-f]{64}$'),
  tutor_contract_version text NOT NULL CHECK (tutor_contract_version = 'amc-tutor-contract-v2'),
  status text NOT NULL CHECK (status IN (
    'QUEUED', 'RUNNING', 'RETRY_WAIT', 'SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED'
  )),
  priority smallint NOT NULL DEFAULT 100 CHECK (priority BETWEEN 0 AND 100),
  attempt_count smallint NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 10),
  max_attempts smallint NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
  available_at timestamptz NOT NULL,
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  provider_invoked boolean NOT NULL DEFAULT false,
  delivery_disposition text NOT NULL DEFAULT 'NOT_DISPATCHED' CHECK (delivery_disposition IN (
    'NOT_DISPATCHED', 'MAY_HAVE_BEEN_DELIVERED', 'KNOWN_NO_RESULT', 'DELIVERED_RESULT'
  )),
  provider text CHECK (provider IS NULL OR provider = 'openai'),
  requested_model text,
  response_model text,
  prompt_version text CHECK (
    prompt_version IS NULL OR prompt_version = 'amc-question-tutor-prompt-v2'),
  response_schema_version text CHECK (
    response_schema_version IS NULL OR response_schema_version = 'amc-tutor-turn-v2'),
  usage jsonb,
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms BETWEEN 0 AND 3600000),
  outcome_code text CHECK (outcome_code IS NULL OR char_length(outcome_code) BETWEEN 1 AND 100),
  error_class text CHECK (error_class IS NULL OR error_class IN ('permanent', 'rate_limit', 'transient')),
  retryable boolean NOT NULL DEFAULT false,
  deletion_generation integer NOT NULL CHECK (deletion_generation >= 0),
  created_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL,
  CHECK (attempt_count <= max_attempts),
  CHECK (retry_of_job_id IS NULL OR retry_of_job_id <> id),
  CHECK (
    (status = 'SUCCEEDED' AND response_message_id IS NOT NULL AND reply_sha256 IS NOT NULL)
    OR (status <> 'SUCCEEDED' AND response_message_id IS NULL AND reply_sha256 IS NULL)
  ),
  CHECK (
    (NOT provider_invoked AND delivery_disposition = 'NOT_DISPATCHED')
    OR (provider_invoked AND delivery_disposition IN (
      'MAY_HAVE_BEEN_DELIVERED', 'KNOWN_NO_RESULT', 'DELIVERED_RESULT'
    ))
  ),
  CHECK (
    (NOT provider_invoked AND provider IS NULL AND requested_model IS NULL
      AND response_model IS NULL AND prompt_version IS NULL
      AND response_schema_version IS NULL AND usage IS NULL AND latency_ms IS NULL)
    OR (provider_invoked AND provider IS NOT NULL AND requested_model IS NOT NULL
      AND prompt_version IS NOT NULL AND response_schema_version IS NOT NULL)
  ),
  CHECK (
    updated_at >= created_at AND available_at >= created_at
    AND (started_at IS NULL OR (started_at >= created_at AND started_at <= updated_at))
    AND (completed_at IS NULL OR (completed_at >= COALESCE(started_at, created_at)
      AND completed_at <= updated_at))
    AND (status <> 'RUNNING' OR lease_expires_at > updated_at)
  ),
  CHECK (
    (status = 'RUNNING' AND lease_owner IS NOT NULL AND lease_token IS NOT NULL
      AND lease_expires_at IS NOT NULL AND completed_at IS NULL
      AND delivery_disposition <> 'DELIVERED_RESULT')
    OR (status <> 'RUNNING' AND lease_owner IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL)
  ),
  CHECK (
    (status = 'QUEUED' AND NOT provider_invoked AND delivery_disposition = 'NOT_DISPATCHED'
      AND NOT retryable AND completed_at IS NULL)
    OR (status = 'RUNNING' AND completed_at IS NULL)
    OR (status = 'RETRY_WAIT' AND retryable AND completed_at IS NULL
      AND ((NOT provider_invoked AND delivery_disposition = 'NOT_DISPATCHED')
        OR (provider_invoked AND delivery_disposition = 'KNOWN_NO_RESULT')))
    OR (status = 'SUCCEEDED' AND provider_invoked AND delivery_disposition = 'DELIVERED_RESULT'
      AND NOT retryable AND completed_at IS NOT NULL AND outcome_code IS NULL
      AND error_class IS NULL AND provider IS NOT NULL AND requested_model IS NOT NULL
      AND response_model IS NOT NULL AND prompt_version IS NOT NULL
      AND response_schema_version IS NOT NULL AND usage IS NOT NULL AND latency_ms IS NOT NULL)
    OR (status = 'FAILED' AND NOT retryable AND completed_at IS NOT NULL
      AND outcome_code IS NOT NULL AND error_class IS NOT NULL
      AND ((NOT provider_invoked AND delivery_disposition = 'NOT_DISPATCHED')
        OR (provider_invoked AND delivery_disposition = 'KNOWN_NO_RESULT')))
    OR (status = 'DELIVERY_UNKNOWN' AND provider_invoked
      AND delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED' AND NOT retryable
      AND completed_at IS NOT NULL AND outcome_code = 'DELIVERY_UNKNOWN')
    OR (status = 'CANCELLED' AND NOT retryable AND completed_at IS NOT NULL
      AND outcome_code = 'CANCELLED'
      AND ((NOT provider_invoked AND delivery_disposition = 'NOT_DISPATCHED')
        OR (provider_invoked AND delivery_disposition = 'KNOWN_NO_RESULT')))
  ),
  CONSTRAINT amc_tutor_job_thread_fk
    FOREIGN KEY (thread_id, student_id, snapshot_hash, context_hash,
      thread_lineage_hash, tutor_contract_version)
      REFERENCES amc_practice.learning_tutor_threads(
        id, student_id, snapshot_hash, context_hash, thread_lineage_hash, tutor_contract_version)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_job_request_message_fk
    FOREIGN KEY (request_message_id, thread_id, student_id, request_message_role)
      REFERENCES amc_practice.learning_tutor_messages(id, thread_id, student_id, role)
      ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_job_response_message_fk
    FOREIGN KEY (response_message_id, thread_id, student_id, response_message_role, reply_sha256)
      REFERENCES amc_practice.learning_tutor_messages(
        id, thread_id, student_id, role, content_sha256)
      ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT amc_tutor_job_session_fk
    FOREIGN KEY (authorized_session_id, student_id)
      REFERENCES amc_practice.sessions(id, student_id) ON DELETE RESTRICT,
  CONSTRAINT amc_tutor_job_identity_unique
    UNIQUE (id, thread_id, student_id, request_message_id, turn_number),
  CONSTRAINT amc_tutor_job_owner_unique
    UNIQUE (id, thread_id, student_id),
  CONSTRAINT amc_tutor_job_response_unique
    UNIQUE (id, thread_id, student_id, response_message_id, reply_sha256),
  CONSTRAINT amc_tutor_job_owner_idempotency_unique
    UNIQUE (student_id, thread_id, idempotency_key_hash)
);
ALTER TABLE amc_practice.learning_tutor_turn_jobs
  ADD CONSTRAINT amc_tutor_job_retry_fk
    FOREIGN KEY (retry_of_job_id, thread_id, student_id, request_message_id, turn_number)
      REFERENCES amc_practice.learning_tutor_turn_jobs(
        id, thread_id, student_id, request_message_id, turn_number)
      ON DELETE RESTRICT;
CREATE UNIQUE INDEX amc_tutor_one_active_job_per_thread_idx
  ON amc_practice.learning_tutor_turn_jobs(thread_id)
  WHERE status IN ('QUEUED', 'RUNNING', 'RETRY_WAIT');
CREATE UNIQUE INDEX amc_tutor_one_job_per_request_ordinal_idx
  ON amc_practice.learning_tutor_turn_jobs(thread_id, request_ordinal);
CREATE UNIQUE INDEX amc_tutor_one_root_job_per_request_idx
  ON amc_practice.learning_tutor_turn_jobs(request_message_id)
  WHERE retry_of_job_id IS NULL;
CREATE UNIQUE INDEX amc_tutor_one_success_per_turn_idx
  ON amc_practice.learning_tutor_turn_jobs(thread_id, turn_number)
  WHERE status = 'SUCCEEDED';
CREATE UNIQUE INDEX amc_tutor_one_child_per_retry_idx
  ON amc_practice.learning_tutor_turn_jobs(retry_of_job_id)
  WHERE retry_of_job_id IS NOT NULL;
CREATE INDEX amc_tutor_job_ready_idx
  ON amc_practice.learning_tutor_turn_jobs(priority DESC, available_at, created_at, id)
  WHERE status IN ('QUEUED', 'RETRY_WAIT');
CREATE INDEX amc_tutor_job_lease_idx
  ON amc_practice.learning_tutor_turn_jobs(lease_expires_at)
  WHERE status = 'RUNNING';
CREATE INDEX amc_tutor_job_student_status_idx
  ON amc_practice.learning_tutor_turn_jobs(student_id, status, created_at);

ALTER TABLE amc_practice.learning_tutor_messages
  ADD CONSTRAINT amc_tutor_message_source_job_fk
    FOREIGN KEY (source_turn_job_id, thread_id, student_id, id, content_sha256)
      REFERENCES amc_practice.learning_tutor_turn_jobs(
        id, thread_id, student_id, response_message_id, reply_sha256)
      ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE amc_practice.learning_tutor_threads
  ADD CONSTRAINT amc_tutor_thread_fork_job_fk
    FOREIGN KEY (forked_from_turn_job_id, forked_from_thread_id, student_id)
      REFERENCES amc_practice.learning_tutor_turn_jobs(id, thread_id, student_id)
      ON DELETE RESTRICT;

CREATE FUNCTION amc_practice.validate_tutor_relations()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'learning_tutor_threads' THEN
    IF NEW.status <> 'OPEN' OR NEW.successful_turn_count <> 0 OR NEW.request_count <> 0
        OR NEW.successful_history_bytes <> 0 OR NEW.thread_revision <> 0
        OR NEW.deletion_generation <> NEW.initial_deletion_generation
        OR NEW.created_at IS DISTINCT FROM NEW.updated_at
        OR NEW.closed_at IS NOT NULL OR NEW.tombstoned_at IS NOT NULL THEN
      RAISE EXCEPTION 'Tutor thread must start as an empty open snapshot'
        USING ERRCODE = '23514';
    END IF;
    IF NOT amc_practice.tutor_source_generation_is_live(
        NEW.learning_submission_id, NEW.learning_submission_version_id,
        NEW.student_id, NEW.initial_deletion_generation) THEN
      RAISE EXCEPTION 'Tutor thread requires live submission entitlement and generation'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.forked_from_turn_job_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM amc_practice.learning_tutor_turn_jobs job
      JOIN amc_practice.learning_tutor_threads parent
        ON parent.id = job.thread_id AND parent.student_id = job.student_id
      WHERE job.id = NEW.forked_from_turn_job_id
        AND job.thread_id = NEW.forked_from_thread_id
        AND job.student_id = NEW.student_id AND job.status = 'SUCCEEDED'
        AND job.turn_number = parent.successful_turn_count
        AND parent.status <> 'TOMBSTONED'
        AND parent.snapshot_id = NEW.snapshot_id
        AND parent.snapshot_hash = NEW.snapshot_hash
        AND parent.thread_lineage_hash = NEW.thread_lineage_hash
    ) THEN
      RAISE EXCEPTION 'Tutor fork must pin the successful parent head' USING ERRCODE = '23514';
    END IF;
  ELSIF TG_TABLE_NAME = 'learning_tutor_messages' THEN
    IF NEW.role = 'ASSISTANT' AND NOT EXISTS (
      SELECT 1 FROM amc_practice.learning_tutor_turn_jobs job
      WHERE job.id = NEW.source_turn_job_id AND job.thread_id = NEW.thread_id
        AND job.student_id = NEW.student_id AND job.status = 'SUCCEEDED'
        AND job.response_message_id = NEW.id AND job.reply_sha256 = NEW.content_sha256
    ) THEN
      RAISE EXCEPTION 'Tutor assistant messages require a successful turn' USING ERRCODE = '23514';
    END IF;
  ELSIF TG_TABLE_NAME = 'learning_tutor_turn_jobs' THEN
    IF NEW.status <> 'QUEUED' OR NEW.attempt_count <> 0 OR NEW.provider_invoked
        OR NEW.delivery_disposition <> 'NOT_DISPATCHED' OR NEW.retryable
        OR NEW.lease_owner IS NOT NULL OR NEW.lease_token IS NOT NULL
        OR NEW.lease_expires_at IS NOT NULL OR NEW.started_at IS NOT NULL
        OR NEW.completed_at IS NOT NULL OR NEW.response_message_id IS NOT NULL
        OR NEW.reply_sha256 IS NOT NULL OR NEW.provider IS NOT NULL
        OR NEW.requested_model IS NOT NULL OR NEW.response_model IS NOT NULL
        OR NEW.prompt_version IS NOT NULL OR NEW.response_schema_version IS NOT NULL
        OR NEW.usage IS NOT NULL OR NEW.latency_ms IS NOT NULL
        OR NEW.outcome_code IS NOT NULL OR NEW.error_class IS NOT NULL
        OR NEW.created_at IS DISTINCT FROM NEW.updated_at THEN
      RAISE EXCEPTION 'Tutor job must start as a clean queued intent' USING ERRCODE = '23514';
    END IF;
    -- Tutor write lock order: thread -> session -> submission -> release.
    PERFORM 1 FROM amc_practice.learning_tutor_threads
    WHERE id = NEW.thread_id AND student_id = NEW.student_id FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tutor job thread is missing' USING ERRCODE = '23514';
    END IF;
    PERFORM 1 FROM amc_practice.sessions session
    WHERE session.id = NEW.authorized_session_id AND session.student_id = NEW.student_id
      AND session.revoked_at IS NULL AND session.expires_at > clock_timestamp()
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tutor job requires a live owner session' USING ERRCODE = '23514';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM amc_practice.learning_tutor_threads thread
      WHERE thread.id = NEW.thread_id AND thread.student_id = NEW.student_id
        AND thread.snapshot_hash = NEW.snapshot_hash AND thread.context_hash = NEW.context_hash
        AND thread.thread_lineage_hash = NEW.thread_lineage_hash
        AND thread.tutor_contract_version = NEW.tutor_contract_version
        AND thread.deletion_generation = NEW.deletion_generation
        AND thread.request_count = NEW.request_ordinal
        AND thread.successful_turn_count + 1 = NEW.turn_number
        AND thread.status IN ('OPEN', 'CAPACITY_REACHED')
        AND amc_practice.tutor_source_generation_is_live(
          thread.learning_submission_id, thread.learning_submission_version_id,
          thread.student_id, thread.deletion_generation)
    ) THEN
      RAISE EXCEPTION 'Tutor job must match the live thread generation and lineage'
        USING ERRCODE = '23514';
    END IF;
    IF NEW.retry_of_job_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM amc_practice.learning_tutor_turn_jobs parent
      WHERE parent.id = NEW.retry_of_job_id AND parent.thread_id = NEW.thread_id
        AND parent.student_id = NEW.student_id AND parent.request_message_id = NEW.request_message_id
        AND parent.turn_number = NEW.turn_number
        AND parent.status IN ('FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED')
    ) THEN
      RAISE EXCEPTION 'Tutor explicit retry must reference one terminal unsuccessful job'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_validate_tutor_fork
  BEFORE INSERT ON amc_practice.learning_tutor_threads
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_relations();
CREATE TRIGGER amc_validate_tutor_assistant_message
  BEFORE INSERT ON amc_practice.learning_tutor_messages
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_relations();
CREATE TRIGGER amc_validate_tutor_job
  BEFORE INSERT ON amc_practice.learning_tutor_turn_jobs
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_relations();

CREATE FUNCTION amc_practice.validate_tutor_thread_head_deferred()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  target_thread_id uuid;
  target_student_id uuid;
  stored_turn_count integer;
  stored_history_bytes integer;
  persisted_success_count integer;
  persisted_min_turn integer;
  persisted_max_turn integer;
  persisted_history_bytes bigint;
  persisted_request_count integer;
  persisted_min_request integer;
  persisted_max_request integer;
BEGIN
  IF TG_TABLE_NAME = 'learning_tutor_threads' THEN
    target_thread_id := NEW.id;
    target_student_id := NEW.student_id;
  ELSE
    target_thread_id := NEW.thread_id;
    target_student_id := NEW.student_id;
  END IF;
  SELECT successful_turn_count, successful_history_bytes
    INTO stored_turn_count, stored_history_bytes
  FROM amc_practice.learning_tutor_threads
  WHERE id = target_thread_id AND student_id = target_student_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT count(*)::integer, min(job.turn_number)::integer, max(job.turn_number)::integer,
         COALESCE(sum(octet_length(request.content_markdown)
           + octet_length(reply.content_markdown)), 0)::bigint
    INTO persisted_success_count, persisted_min_turn, persisted_max_turn,
         persisted_history_bytes
  FROM amc_practice.learning_tutor_turn_jobs job
  JOIN amc_practice.learning_tutor_messages request ON request.id = job.request_message_id
  JOIN amc_practice.learning_tutor_messages reply ON reply.id = job.response_message_id
  WHERE job.thread_id = target_thread_id AND job.student_id = target_student_id
    AND job.status = 'SUCCEEDED';
  IF persisted_success_count <> stored_turn_count
      OR persisted_history_bytes <> stored_history_bytes
      OR (persisted_success_count > 0 AND (
        persisted_min_turn <> 1 OR persisted_max_turn <> persisted_success_count)) THEN
    RAISE EXCEPTION 'Tutor commit must atomically advance one contiguous thread head'
      USING ERRCODE = '23514';
  END IF;
  SELECT count(*)::integer, min(request_ordinal)::integer, max(request_ordinal)::integer
    INTO persisted_request_count, persisted_min_request, persisted_max_request
  FROM amc_practice.learning_tutor_turn_jobs
  WHERE thread_id = target_thread_id AND student_id = target_student_id;
  IF persisted_request_count <> (
      SELECT request_count FROM amc_practice.learning_tutor_threads
      WHERE id = target_thread_id AND student_id = target_student_id)
      OR (persisted_request_count > 0 AND (
        persisted_min_request <> 1 OR persisted_max_request <> persisted_request_count)) THEN
    RAISE EXCEPTION 'Tutor commit must atomically advance one contiguous request ledger'
      USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM amc_practice.learning_tutor_messages message
    WHERE message.thread_id = target_thread_id AND message.student_id = target_student_id
      AND message.role = 'USER'
      AND NOT EXISTS (
        SELECT 1 FROM amc_practice.learning_tutor_turn_jobs job
        WHERE job.thread_id = message.thread_id AND job.student_id = message.student_id
          AND job.request_message_id = message.id
      )
  ) THEN
    RAISE EXCEPTION 'Tutor user messages must commit with their first turn job'
      USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER amc_tutor_thread_head_from_thread
  AFTER INSERT OR UPDATE ON amc_practice.learning_tutor_threads
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_thread_head_deferred();
CREATE CONSTRAINT TRIGGER amc_tutor_thread_head_from_job
  AFTER INSERT OR UPDATE ON amc_practice.learning_tutor_turn_jobs
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_thread_head_deferred();
CREATE CONSTRAINT TRIGGER amc_tutor_thread_head_from_message
  AFTER INSERT ON amc_practice.learning_tutor_messages
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_tutor_thread_head_deferred();

CREATE FUNCTION amc_practice.guard_tutor_job_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW.thread_id, NEW.student_id, NEW.request_message_id,
      NEW.request_message_role, NEW.request_ordinal, NEW.turn_number, NEW.retry_of_job_id,
      NEW.retry_authorization,
      NEW.authorized_session_id, NEW.idempotency_key_hash, NEW.request_hash,
      NEW.correlation_id, NEW.snapshot_hash, NEW.context_hash, NEW.history_hash,
      NEW.input_hash, NEW.thread_lineage_hash, NEW.tutor_contract_version,
      NEW.priority, NEW.max_attempts, NEW.deletion_generation, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.thread_id, OLD.student_id, OLD.request_message_id,
      OLD.request_message_role, OLD.request_ordinal, OLD.turn_number, OLD.retry_of_job_id,
      OLD.retry_authorization,
      OLD.authorized_session_id, OLD.idempotency_key_hash, OLD.request_hash,
      OLD.correlation_id, OLD.snapshot_hash, OLD.context_hash, OLD.history_hash,
      OLD.input_hash, OLD.thread_lineage_hash, OLD.tutor_contract_version,
      OLD.priority, OLD.max_attempts, OLD.deletion_generation, OLD.created_at) THEN
    RAISE EXCEPTION 'Tutor turn job identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status IN ('SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED') THEN
    RAISE EXCEPTION 'Terminal Tutor turn job is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'RUNNING' AND OLD.lease_expires_at <= clock_timestamp()
      AND NEW.status IN ('RUNNING', 'SUCCEEDED', 'FAILED') THEN
    RAISE EXCEPTION 'Expired Tutor lease cannot dispatch or publish a worker result'
      USING ERRCODE = '55000';
  END IF;
  IF NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'Tutor turn job time cannot move backwards' USING ERRCODE = '55000';
  END IF;
  PERFORM 1 FROM amc_practice.learning_tutor_threads
  WHERE id = NEW.thread_id AND student_id = NEW.student_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor job thread is missing' USING ERRCODE = '55000';
  END IF;
  IF NEW.status IN ('RUNNING', 'SUCCEEDED') THEN
    PERFORM 1 FROM amc_practice.sessions session
    WHERE session.id = NEW.authorized_session_id AND session.student_id = NEW.student_id
      AND session.revoked_at IS NULL AND session.expires_at > clock_timestamp()
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tutor claim, dispatch, and success require a live session'
        USING ERRCODE = '55000';
    END IF;
  END IF;
  IF NEW.status IN ('RUNNING', 'SUCCEEDED') AND NOT EXISTS (
    SELECT 1
    FROM amc_practice.learning_tutor_threads thread
    WHERE thread.id = NEW.thread_id AND thread.student_id = NEW.student_id
      AND thread.status IN ('OPEN', 'CAPACITY_REACHED')
      AND thread.deletion_generation = NEW.deletion_generation
      AND amc_practice.tutor_source_generation_is_live(
        thread.learning_submission_id, thread.learning_submission_version_id,
        thread.student_id, thread.deletion_generation)
  ) THEN
    RAISE EXCEPTION 'Tutor claim, dispatch, and success require live authorization'
      USING ERRCODE = '55000';
  END IF;
  IF OLD.status IN ('QUEUED', 'RETRY_WAIT') AND NEW.status = 'RUNNING' THEN
    IF NEW.attempt_count <> OLD.attempt_count + 1
        OR OLD.available_at > clock_timestamp() THEN
      RAISE EXCEPTION 'Tutor claim must increment attempt count' USING ERRCODE = '55000';
    END IF;
    IF NEW.provider_invoked OR NEW.delivery_disposition <> 'NOT_DISPATCHED'
        OR NEW.retryable OR NEW.completed_at IS NOT NULL OR NEW.outcome_code IS NOT NULL
        OR NEW.error_class IS NOT NULL OR NEW.provider IS NOT NULL
        OR NEW.requested_model IS NOT NULL OR NEW.response_model IS NOT NULL
        OR NEW.prompt_version IS NOT NULL OR NEW.response_schema_version IS NOT NULL
        OR NEW.usage IS NOT NULL OR NEW.latency_ms IS NOT NULL THEN
      RAISE EXCEPTION 'Tutor claim must start a clean provider attempt' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'QUEUED' AND NEW.status = 'CANCELLED' THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor cancellation cannot change attempt count' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'RETRY_WAIT' AND NEW.status = 'CANCELLED' THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor cancellation cannot change attempt count' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'RUNNING' AND NEW.status IN (
      'RUNNING', 'RETRY_WAIT', 'SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED') THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor attempt count changes only on claim' USING ERRCODE = '55000';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid Tutor turn job status transition' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'RUNNING' THEN
    IF NOT (
      (NOT OLD.provider_invoked AND OLD.delivery_disposition = 'NOT_DISPATCHED'
        AND ((NOT NEW.provider_invoked AND NEW.delivery_disposition = 'NOT_DISPATCHED')
          OR (NEW.provider_invoked AND NEW.delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED')))
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED'
        AND NEW.provider_invoked AND NEW.delivery_disposition IN (
          'MAY_HAVE_BEEN_DELIVERED', 'KNOWN_NO_RESULT', 'DELIVERED_RESULT'))
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'KNOWN_NO_RESULT'
        AND NEW.provider_invoked AND NEW.delivery_disposition = 'KNOWN_NO_RESULT')
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'DELIVERED_RESULT'
        AND NEW.provider_invoked AND NEW.delivery_disposition = 'DELIVERED_RESULT')
    ) THEN
      RAISE EXCEPTION 'Invalid Tutor delivery transition' USING ERRCODE = '55000';
    END IF;
    IF NOT OLD.provider_invoked AND OLD.delivery_disposition = 'NOT_DISPATCHED'
        AND NEW.provider_invoked AND NEW.status <> 'RUNNING' THEN
      RAISE EXCEPTION 'Tutor dispatch intent must commit before any terminal transition'
        USING ERRCODE = '55000';
    END IF;
    IF NEW.status = 'DELIVERY_UNKNOWN'
        AND (NOT OLD.provider_invoked
          OR OLD.delivery_disposition <> 'MAY_HAVE_BEEN_DELIVERED') THEN
      RAISE EXCEPTION 'Tutor unknown delivery requires a previously persisted dispatch intent'
        USING ERRCODE = '55000';
    END IF;
    IF NEW.status = 'SUCCEEDED'
        AND (NOT OLD.provider_invoked
          OR OLD.delivery_disposition <> 'MAY_HAVE_BEEN_DELIVERED') THEN
      RAISE EXCEPTION 'Tutor success requires a previously persisted dispatch intent'
        USING ERRCODE = '55000';
    END IF;
  END IF;
  IF OLD.status = 'RUNNING' AND NEW.status = 'RUNNING' THEN
    IF NEW.lease_owner IS DISTINCT FROM OLD.lease_owner
        OR NEW.lease_token IS DISTINCT FROM OLD.lease_token
        OR NEW.lease_expires_at < OLD.lease_expires_at THEN
      RAISE EXCEPTION 'Tutor running lease identity is immutable' USING ERRCODE = '55000';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_tutor_job_transition
  BEFORE UPDATE ON amc_practice.learning_tutor_turn_jobs
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_tutor_job_transition();
CREATE TRIGGER amc_reject_tutor_job_delete
  BEFORE DELETE ON amc_practice.learning_tutor_turn_jobs
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_tutor_append_only_mutation();

CREATE FUNCTION amc_practice.guard_tutor_source_deletion()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'learning_submissions' THEN
    IF (NEW.lifecycle_status <> OLD.lifecycle_status
        OR NEW.deletion_generation <> OLD.deletion_generation) AND EXISTS (
      SELECT 1 FROM amc_practice.learning_tutor_threads thread
      WHERE thread.learning_submission_id = OLD.id AND thread.status <> 'TOMBSTONED'
    ) THEN
      RAISE EXCEPTION 'Tutor threads must be tombstoned before deleting their submission source'
        USING ERRCODE = '55000';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_tutor_submission_deletion
  BEFORE UPDATE OF lifecycle_status, deletion_generation
  ON amc_practice.learning_submissions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_tutor_source_deletion();
