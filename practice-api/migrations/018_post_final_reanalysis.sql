-- Post-final reasoning is new learning evidence, never a mutation of the
-- official contest submission. Each explicit rerun receives a new immutable
-- learning version and keeps the existing one-run/one-report-per-version
-- lineage intact.

ALTER TABLE amc_practice.student_resource_budget_windows
  DROP CONSTRAINT student_resource_budget_windows_budget_kind_check,
  ADD CONSTRAINT amc_student_resource_budget_kind_check CHECK (budget_kind IN (
    'AUTHENTICATED_REQUEST', 'UPLOAD_BYTES', 'PROVIDER_WORK',
    'PROVIDER_AUDIO_BYTES', 'LEARNING_REANALYSIS'
  ));
ALTER TABLE amc_practice.global_resource_budget_windows
  DROP CONSTRAINT global_resource_budget_windows_budget_kind_check,
  ADD CONSTRAINT amc_global_resource_budget_kind_check CHECK (budget_kind IN (
    'PROVIDER_WORK', 'PROVIDER_AUDIO_BYTES', 'PROVIDER_CLEANUP', 'LEARNING_REANALYSIS'
  ));

ALTER TABLE amc_practice.learning_submission_versions
  DROP CONSTRAINT amc_learning_version_creation_reason_check,
  ADD CONSTRAINT amc_learning_version_creation_reason_check CHECK (
    (creation_reason IN ('FINAL_COMMIT', 'BACKFILL') AND batch_id IS NULL
      AND answers_revision IS NOT NULL AND reasoning_revision IS NOT NULL)
    OR (creation_reason = 'POST_FINAL_REASONING_COMMIT' AND batch_id IS NULL
      AND version_number >= 2
      AND answers_revision IS NOT NULL AND reasoning_revision >= 1
      AND ((context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
        OR (context_status = 'CONTEXT_UNAVAILABLE' AND context_set_id IS NULL)))
    OR (creation_reason = 'MANUAL_REANALYSIS_COMMIT' AND batch_id IS NULL
      AND version_number >= 2
      AND answers_revision IS NOT NULL AND reasoning_revision IS NOT NULL
      AND context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
    OR (creation_reason = 'OPEN_REVIEW_ANCHOR' AND batch_id IS NULL
      AND version_number = 1 AND answers_revision = 0 AND reasoning_revision = 0
      AND context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
    OR (creation_reason = 'BATCH_REVIEW_ANCHOR' AND batch_id IS NULL
      AND version_number = 1 AND answers_revision = 0 AND reasoning_revision = 0
      AND ((context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
        OR (context_status = 'CONTEXT_UNAVAILABLE' AND context_set_id IS NULL)))
    OR (creation_reason = 'BATCH_COMMIT' AND batch_id IS NOT NULL
      AND answers_revision IS NULL AND reasoning_revision IS NULL)
  );

ALTER TABLE amc_practice.learning_question_responses
  DROP CONSTRAINT amc_learning_response_origin_check,
  ADD CONSTRAINT amc_learning_response_origin_check CHECK (
    (answer_origin IN ('OPEN_REVIEW_BLANK', 'BATCH_REVIEW_BLANK')
      AND selected_option IS NULL AND reasoning_text = '' AND reasoning_origin = 'NONE')
    OR (answer_origin = 'OFFICIAL_FINAL'
      AND reasoning_origin IN ('DURING_ATTEMPT', 'POST_FINAL_UPDATE', 'NONE'))
    OR (answer_origin = 'BATCH_CONFIRMED'
      AND reasoning_origin IN ('BATCH_CONFIRMED_EVIDENCE', 'BATCH_CONFIRMATION_EDIT'))
  );

-- Fail closed before installing the lineage trigger. Every historical
-- OFFICIAL_FINAL response must already equal its immutable official snapshot.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM amc_practice.learning_question_responses response
    JOIN amc_practice.learning_submission_versions version
      ON version.id = response.learning_submission_version_id
    JOIN amc_practice.learning_submissions submission
      ON submission.id = version.learning_submission_id
    LEFT JOIN amc_practice.submission_answers official
      ON official.submission_id = submission.official_submission_id
     AND official.question_number = response.question_number
    WHERE response.answer_origin = 'OFFICIAL_FINAL'
      AND (official.submission_id IS NULL
        OR official.selected_option IS DISTINCT FROM response.selected_option)
  ) THEN
    RAISE EXCEPTION 'cannot enforce official learning response lineage: historical mismatch exists'
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE FUNCTION amc_practice.validate_official_learning_response()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  official_option char(1);
  version_reason text;
BEGIN
  IF NEW.answer_origin <> 'OFFICIAL_FINAL' THEN RETURN NEW; END IF;
  SELECT official.selected_option, version.creation_reason
    INTO official_option, version_reason
  FROM amc_practice.learning_submission_versions version
  JOIN amc_practice.learning_submissions submission
    ON submission.id = version.learning_submission_id
   AND submission.source_type = 'INTERACTIVE_FINAL'
  JOIN amc_practice.submission_answers official
    ON official.submission_id = submission.official_submission_id
   AND official.question_number = NEW.question_number
  WHERE version.id = NEW.learning_submission_version_id;
  IF NOT FOUND OR official_option IS DISTINCT FROM NEW.selected_option THEN
    RAISE EXCEPTION 'learning response must equal its immutable official answer';
  END IF;
  IF NEW.reasoning_origin = 'POST_FINAL_UPDATE'
      AND version_reason NOT IN ('POST_FINAL_REASONING_COMMIT', 'MANUAL_REANALYSIS_COMMIT') THEN
    RAISE EXCEPTION 'post-final reasoning belongs only to a post-final evidence snapshot';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_validate_official_learning_response
  BEFORE INSERT ON amc_practice.learning_question_responses
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_official_learning_response();

CREATE FUNCTION amc_practice.reject_official_submission_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'official submissions are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER amc_official_submissions_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.submissions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_official_submission_mutation();

CREATE FUNCTION amc_practice.reject_learning_response_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'learning question responses are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER amc_learning_responses_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_question_responses
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_learning_response_mutation();

CREATE FUNCTION amc_practice.reject_learning_analysis_snapshot_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'learning analysis snapshots are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER amc_learning_reports_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_reports
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_learning_analysis_snapshot_mutation();
CREATE TRIGGER amc_learning_question_analyses_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_question_analyses
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_learning_analysis_snapshot_mutation();

CREATE FUNCTION amc_practice.validate_reanalysis_version_snapshot()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  previous amc_practice.learning_submission_versions%ROWTYPE;
  expected_count integer;
  response_count integer;
  reasoning_diff_count integer;
BEGIN
  IF NEW.creation_reason NOT IN ('POST_FINAL_REASONING_COMMIT', 'MANUAL_REANALYSIS_COMMIT') THEN
    RETURN NULL;
  END IF;
  SELECT * INTO previous
  FROM amc_practice.learning_submission_versions
  WHERE learning_submission_id = NEW.learning_submission_id
    AND version_number = NEW.version_number - 1;
  IF NOT FOUND OR NEW.answers_revision IS DISTINCT FROM previous.answers_revision THEN
    RAISE EXCEPTION 'reanalysis must follow the previous immutable official-answer version';
  END IF;
  SELECT count(*) INTO expected_count
  FROM amc_practice.form_questions
  WHERE form_id = NEW.form_id AND form_version = NEW.form_version;
  SELECT count(*) INTO response_count
  FROM amc_practice.learning_question_responses
  WHERE learning_submission_version_id = NEW.id;
  IF response_count <> expected_count THEN
    RAISE EXCEPTION 'reanalysis must snapshot every exact-form question';
  END IF;
  SELECT count(*) INTO reasoning_diff_count
  FROM amc_practice.learning_question_responses current_response
  FULL JOIN amc_practice.learning_question_responses previous_response
    ON previous_response.learning_submission_version_id = previous.id
   AND previous_response.question_number = current_response.question_number
  WHERE current_response.learning_submission_version_id = NEW.id
    AND ROW(current_response.question_number, current_response.selected_option,
      current_response.answer_origin, current_response.reasoning_text,
      current_response.reasoning_origin)
      IS DISTINCT FROM ROW(previous_response.question_number, previous_response.selected_option,
      previous_response.answer_origin, previous_response.reasoning_text,
      previous_response.reasoning_origin);
  IF NEW.creation_reason = 'MANUAL_REANALYSIS_COMMIT' THEN
    IF NEW.reasoning_revision IS DISTINCT FROM previous.reasoning_revision
        OR NEW.evidence_hash IS DISTINCT FROM previous.evidence_hash
        OR reasoning_diff_count <> 0 THEN
      RAISE EXCEPTION 'manual reanalysis must preserve the exact evidence snapshot';
    END IF;
  ELSIF NEW.reasoning_revision <> previous.reasoning_revision + 1
      OR NEW.evidence_hash IS NOT DISTINCT FROM previous.evidence_hash
      OR reasoning_diff_count = 0 THEN
    RAISE EXCEPTION 'post-final reasoning commit must contain changed reasoning evidence';
  END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER amc_validate_reanalysis_version_snapshot
  AFTER INSERT ON amc_practice.learning_submission_versions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_reanalysis_version_snapshot();

CREATE FUNCTION amc_practice.guard_learning_version_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.context_status = 'CONTEXT_UNAVAILABLE' AND OLD.context_set_id IS NULL
      AND NEW.context_status = 'CONTEXT_READY' AND NEW.context_set_id IS NOT NULL
      AND ROW(NEW.id, NEW.learning_submission_id, NEW.version_number, NEW.form_id,
        NEW.form_version, NEW.answers_revision, NEW.reasoning_revision, NEW.creation_reason,
        NEW.evidence_hash, NEW.created_at, NEW.batch_id)
        IS NOT DISTINCT FROM ROW(OLD.id, OLD.learning_submission_id, OLD.version_number,
        OLD.form_id, OLD.form_version, OLD.answers_revision, OLD.reasoning_revision,
        OLD.creation_reason, OLD.evidence_hash, OLD.created_at, OLD.batch_id) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'learning versions are immutable except for one context repair'
    USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER amc_learning_versions_immutable
  BEFORE UPDATE OR DELETE ON amc_practice.learning_submission_versions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_learning_version_mutation();

CREATE OR REPLACE FUNCTION amc_practice.validate_learning_version_source()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  submission_source text;
  pinned_context uuid;
  batch_anchor_context uuid;
  exact_context boolean;
BEGIN
  SELECT s.source_type, release.context_set_id
    INTO submission_source, pinned_context
  FROM amc_practice.learning_submissions s
  LEFT JOIN amc_practice.open_review_releases release ON release.id = s.open_review_release_id
  WHERE s.id = NEW.learning_submission_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'learning submission parent is missing'; END IF;
  IF submission_source = 'OPEN_REVIEW' THEN
    IF NEW.creation_reason NOT IN ('OPEN_REVIEW_ANCHOR','BATCH_COMMIT')
        OR NEW.context_set_id IS DISTINCT FROM pinned_context THEN
      RAISE EXCEPTION 'open review versions must use their release-pinned context';
    END IF;
  ELSIF submission_source = 'BATCH_REVIEW' THEN
    IF NEW.creation_reason = 'BATCH_REVIEW_ANCHOR' THEN
      IF TG_OP = 'UPDATE' AND OLD.creation_reason = 'BATCH_REVIEW_ANCHOR' THEN
        IF ROW(NEW.context_status, NEW.context_set_id)
            IS DISTINCT FROM ROW(OLD.context_status, OLD.context_set_id) THEN
          RAISE EXCEPTION 'batch review anchor context lineage is immutable';
        END IF;
      ELSIF NEW.context_status = 'CONTEXT_READY' AND NEW.context_set_id IS NOT NULL THEN
        SELECT amc_practice.batch_review_context_is_complete(
          NEW.form_id, NEW.form_version, NEW.context_set_id
        ) INTO exact_context;
        IF NOT exact_context THEN
          RAISE EXCEPTION 'batch review anchor requires a complete active exact context';
        END IF;
      ELSE
        RAISE EXCEPTION 'new batch review anchor must pin a complete active context';
      END IF;
    ELSIF NEW.creation_reason = 'BATCH_COMMIT' THEN
      SELECT version.context_set_id INTO batch_anchor_context
      FROM amc_practice.learning_submission_versions version
      WHERE version.learning_submission_id = NEW.learning_submission_id
        AND version.version_number = 1
        AND version.creation_reason = 'BATCH_REVIEW_ANCHOR';
      IF NOT FOUND THEN
        RAISE EXCEPTION 'batch review commit requires its version-one anchor';
      END IF;
      IF NEW.context_set_id IS DISTINCT FROM batch_anchor_context THEN
        RAISE EXCEPTION 'batch review commit context must equal its version-one anchor context';
      END IF;
      IF NEW.context_status = 'CONTEXT_READY' THEN
        SELECT amc_practice.batch_review_pinned_context_is_complete(
          NEW.form_id, NEW.form_version, NEW.context_set_id
        ) INTO exact_context;
        IF NOT exact_context THEN
          RAISE EXCEPTION 'batch review version context does not match its pinned exact form revision';
        END IF;
      ELSIF NEW.context_status <> 'CONTEXT_UNAVAILABLE' OR NEW.context_set_id IS NOT NULL THEN
        RAISE EXCEPTION 'batch review unavailable context must remain unbound';
      END IF;
    ELSE
      RAISE EXCEPTION 'batch review submissions only accept anchor and batch versions';
    END IF;
  ELSIF submission_source = 'INTERACTIVE_FINAL' THEN
    IF NEW.creation_reason IN ('OPEN_REVIEW_ANCHOR','BATCH_REVIEW_ANCHOR') THEN
      RAISE EXCEPTION 'timed learning submissions cannot use a review anchor';
    ELSIF NEW.creation_reason IN ('POST_FINAL_REASONING_COMMIT', 'MANUAL_REANALYSIS_COMMIT')
        AND NEW.context_status = 'CONTEXT_READY' THEN
      SELECT EXISTS (
        SELECT 1 FROM amc_practice.approved_context_sets context
        WHERE context.id = NEW.context_set_id
          AND context.form_id = NEW.form_id AND context.form_version = NEW.form_version
          AND context.active AND context.sealed
      ) INTO exact_context;
      IF NOT exact_context THEN
        RAISE EXCEPTION 'reanalysis requires active approved exact-form context';
      END IF;
    ELSIF NEW.creation_reason = 'POST_FINAL_REASONING_COMMIT'
        AND NEW.context_status = 'CONTEXT_UNAVAILABLE' AND NEW.context_set_id IS NULL THEN
      NULL;
    ELSIF NEW.creation_reason IN ('POST_FINAL_REASONING_COMMIT', 'MANUAL_REANALYSIS_COMMIT') THEN
      RAISE EXCEPTION 'invalid reanalysis context state';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
