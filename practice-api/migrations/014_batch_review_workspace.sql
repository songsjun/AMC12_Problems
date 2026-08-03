-- BATCH_REVIEW is an untimed, student-owned workspace for a published exact
-- form revision.  Creation intentionally does not require approved context:
-- the immutable v1 anchor contains no student work and no analysis job.  A
-- confirmed batch creates a later immutable learning version; that version is
-- either pinned to the exact context available at commit time or remains
-- BLOCKED_CONTEXT until the approved-context importer repairs it.

ALTER TABLE amc_practice.attempts
  DROP CONSTRAINT amc_attempt_mode_check,
  DROP CONSTRAINT amc_attempt_mode_state_check,
  ADD CONSTRAINT amc_attempt_mode_check
    CHECK (attempt_mode IN ('TIMED', 'OPEN_REVIEW', 'BATCH_REVIEW')),
  ADD CONSTRAINT amc_attempt_mode_state_check CHECK (
    (attempt_mode = 'TIMED'
      AND phase IN ('TIMED', 'LIMIT_NOTICE', 'OVERTIME', 'FINALIZED', 'RESET')
      AND ((clock_state = 'RUNNING' AND clock_started_at IS NOT NULL)
        OR (clock_state = 'PAUSED' AND clock_started_at IS NULL))
      AND (
        (phase = 'TIMED' AND limit_reached_at IS NULL
          AND finalized_at IS NULL AND reset_at IS NULL)
        OR (phase = 'LIMIT_NOTICE' AND clock_state = 'PAUSED'
          AND limit_reached_at IS NOT NULL AND finalized_at IS NULL AND reset_at IS NULL)
        OR (phase = 'OVERTIME' AND limit_reached_at IS NOT NULL
          AND finalized_at IS NULL AND reset_at IS NULL)
        OR (phase = 'FINALIZED' AND clock_state = 'PAUSED'
          AND finalized_at IS NOT NULL AND reset_at IS NULL)
        OR (phase = 'RESET' AND clock_state = 'PAUSED' AND reset_at IS NOT NULL)
      ))
    OR
    (attempt_mode IN ('OPEN_REVIEW', 'BATCH_REVIEW')
      AND phase = attempt_mode
      AND clock_state = 'PAUSED'
      AND clock_started_at IS NULL
      AND active_elapsed_ms = 0
      AND answers_revision = 0
      AND reasoning_revision = 0
      AND state_revision = 0
      AND limit_reached_at IS NULL
      AND finalized_at IS NULL
      AND reset_at IS NULL)
  );

-- TIMED and BATCH_REVIEW deliberately coexist for the same exact revision.
-- Only duplicate batch workspaces for the same student/revision are collapsed.
CREATE UNIQUE INDEX amc_one_batch_review_workspace_idx
  ON amc_practice.attempts(student_id, form_id, form_version)
  WHERE attempt_mode = 'BATCH_REVIEW';

ALTER TABLE amc_practice.learning_submissions
  DROP CONSTRAINT amc_learning_submission_source_check,
  DROP CONSTRAINT amc_learning_submission_source_xor_check,
  ADD CONSTRAINT amc_learning_submission_source_check CHECK (
    source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW', 'BATCH_REVIEW')
  ),
  ADD CONSTRAINT amc_learning_submission_source_xor_check CHECK (
    (source_type = 'INTERACTIVE_FINAL' AND attempt_mode = 'TIMED'
      AND official_submission_id IS NOT NULL AND official_submission_kind = 'FINAL'
      AND open_review_release_id IS NULL)
    OR
    (source_type = 'OPEN_REVIEW' AND attempt_mode = 'OPEN_REVIEW'
      AND official_submission_id IS NULL AND official_submission_kind IS NULL
      AND open_review_release_id IS NOT NULL)
    OR
    (source_type = 'BATCH_REVIEW' AND attempt_mode = 'BATCH_REVIEW'
      AND official_submission_id IS NULL AND official_submission_kind IS NULL
      AND open_review_release_id IS NULL)
  );

ALTER TABLE amc_practice.learning_batches
  DROP CONSTRAINT learning_batches_source_type_check,
  ADD CONSTRAINT learning_batches_source_type_check
    CHECK (source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW', 'BATCH_REVIEW'));

ALTER TABLE amc_practice.learning_submission_versions
  DROP CONSTRAINT amc_learning_version_creation_reason_check,
  ADD CONSTRAINT amc_learning_version_creation_reason_check CHECK (
    (creation_reason IN ('FINAL_COMMIT', 'BACKFILL') AND batch_id IS NULL
      AND answers_revision IS NOT NULL AND reasoning_revision IS NOT NULL)
    OR (creation_reason = 'OPEN_REVIEW_ANCHOR' AND batch_id IS NULL
      AND version_number = 1 AND answers_revision = 0 AND reasoning_revision = 0
      AND context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
    OR (creation_reason = 'BATCH_REVIEW_ANCHOR' AND batch_id IS NULL
      AND version_number = 1 AND answers_revision = 0 AND reasoning_revision = 0
      AND context_status = 'CONTEXT_UNAVAILABLE' AND context_set_id IS NULL)
    OR (creation_reason = 'BATCH_COMMIT' AND batch_id IS NOT NULL
      AND answers_revision IS NULL AND reasoning_revision IS NULL)
  );

ALTER TABLE amc_practice.learning_question_responses
  DROP CONSTRAINT amc_learning_response_origin_check,
  ADD CONSTRAINT amc_learning_response_origin_check CHECK (
    (answer_origin IN ('OPEN_REVIEW_BLANK', 'BATCH_REVIEW_BLANK')
      AND selected_option IS NULL AND reasoning_text = '' AND reasoning_origin = 'NONE')
    OR (answer_origin = 'OFFICIAL_FINAL' AND reasoning_origin IN ('DURING_ATTEMPT', 'NONE'))
    OR (answer_origin = 'BATCH_CONFIRMED'
      AND reasoning_origin IN ('BATCH_CONFIRMED_EVIDENCE', 'BATCH_CONFIRMATION_EDIT'))
  );

ALTER TABLE amc_practice.learning_tutor_snapshots
  DROP CONSTRAINT learning_tutor_snapshots_source_type_check,
  ADD CONSTRAINT learning_tutor_snapshots_source_type_check
    CHECK (source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW', 'BATCH_REVIEW'));

CREATE FUNCTION amc_practice.batch_review_context_is_complete(
  target_form_id text,
  target_form_version text,
  target_context_set_id uuid
) RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM amc_practice.approved_context_sets context
    JOIN amc_practice.form_revisions revision
      ON revision.form_id = target_form_id AND revision.version = target_form_version
    WHERE context.id = target_context_set_id
      AND context.form_id = target_form_id AND context.form_version = target_form_version
      AND context.active
      AND revision.published_at IS NOT NULL
      AND context.release_manifest_hash = revision.manifest_hash
      AND context.release_content_hash = revision.content_hash
      AND context.release_question_bundle_hash = revision.question_bundle_hash
      AND 25 = (
        SELECT count(*) FROM amc_practice.form_questions form_question
        WHERE form_question.form_id = target_form_id
          AND form_question.form_version = target_form_version
      )
      AND NOT EXISTS (
        SELECT 1 FROM amc_practice.form_questions form_question
        WHERE form_question.form_id = target_form_id
          AND form_question.form_version = target_form_version
          AND NOT EXISTS (
            SELECT 1 FROM amc_practice.approved_context_questions question
            WHERE question.context_set_id = context.id
              AND question.form_id = target_form_id
              AND question.form_version = target_form_version
              AND question.question_number = form_question.question_number
              AND question.model_eligible_solution_count >= 2
              AND (SELECT count(*)
                FROM amc_practice.approved_context_solutions solution
                WHERE solution.context_set_id = question.context_set_id
                  AND solution.question_number = question.question_number
                  AND solution.model_eligible
                  AND solution.authority_receipt_status = 'active') >= 2
          )
      )
  );
$$;

-- Preserve the OPEN_REVIEW/TIMED delivery fence.  BATCH_REVIEW is independent
-- of that fence but requires an already-published exact form revision.
CREATE OR REPLACE FUNCTION amc_practice.guard_attempt_delivery_mode()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE bundle_hash char(64);
BEGIN
  SELECT question_bundle_hash INTO bundle_hash FROM amc_practice.form_revisions
    WHERE form_id = NEW.form_id AND version = NEW.form_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'attempt form revision is missing'; END IF;
  PERFORM pg_advisory_xact_lock(
    hashtext('amc_open_delivery_bundle'), hashtext(bundle_hash)
  );
  PERFORM 1 FROM amc_practice.form_revisions
    WHERE form_id = NEW.form_id AND version = NEW.form_version FOR UPDATE;
  IF NEW.attempt_mode = 'TIMED' THEN
    IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases r
      WHERE (r.form_id = NEW.form_id AND r.form_version = NEW.form_version)
        OR r.question_bundle_hash = bundle_hash) THEN
      RAISE EXCEPTION 'open review delivery fence forbids timed attempt';
    END IF;
  ELSIF NEW.attempt_mode = 'OPEN_REVIEW' THEN
    IF NOT EXISTS (SELECT 1 FROM amc_practice.open_review_releases r
      WHERE r.form_id = NEW.form_id AND r.form_version = NEW.form_version AND r.status = 'ACTIVE') THEN
      RAISE EXCEPTION 'active open review release is required';
    END IF;
  ELSIF NEW.attempt_mode = 'BATCH_REVIEW' THEN
    IF NOT EXISTS (SELECT 1 FROM amc_practice.form_revisions revision
      WHERE revision.form_id = NEW.form_id AND revision.version = NEW.form_version
        AND revision.published = true) THEN
      RAISE EXCEPTION 'batch review requires an exact published form revision';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported attempt delivery mode';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION amc_practice.validate_learning_version_source()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  submission_source text;
  pinned_context uuid;
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
      IF NEW.context_set_id IS NOT NULL OR NEW.context_status <> 'CONTEXT_UNAVAILABLE' THEN
        RAISE EXCEPTION 'batch review anchor cannot pin analysis context';
      END IF;
    ELSIF NEW.creation_reason = 'BATCH_COMMIT' THEN
      IF NEW.context_status = 'CONTEXT_READY' THEN
        SELECT amc_practice.batch_review_context_is_complete(
          NEW.form_id, NEW.form_version, NEW.context_set_id
        ) INTO exact_context;
        IF NOT exact_context THEN
          RAISE EXCEPTION 'batch review version context does not match its exact form revision';
        END IF;
      ELSIF NEW.context_status <> 'CONTEXT_UNAVAILABLE' OR NEW.context_set_id IS NOT NULL THEN
        RAISE EXCEPTION 'batch review unavailable context must remain unbound';
      END IF;
    ELSE
      RAISE EXCEPTION 'batch review submissions only accept anchor and batch versions';
    END IF;
  ELSIF NEW.creation_reason IN ('OPEN_REVIEW_ANCHOR','BATCH_REVIEW_ANCHOR') THEN
    RAISE EXCEPTION 'timed learning submissions cannot use a review anchor';
  END IF;
  RETURN NEW;
END;
$$;

-- Migration 008 did not need context_status in this trigger's UPDATE list
-- because OPEN_REVIEW is always context-ready. Context-late BATCH_REVIEW does.
DROP TRIGGER amc_validate_learning_version_source
  ON amc_practice.learning_submission_versions;
CREATE TRIGGER amc_validate_learning_version_source
  BEFORE INSERT OR UPDATE OF learning_submission_id, creation_reason, context_status, context_set_id
  ON amc_practice.learning_submission_versions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_learning_version_source();

CREATE OR REPLACE FUNCTION amc_practice.reject_open_review_anchor_work()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM amc_practice.learning_submission_versions version
    WHERE version.id = NEW.learning_submission_version_id
      AND version.creation_reason IN ('OPEN_REVIEW_ANCHOR','BATCH_REVIEW_ANCHOR')
  ) THEN
    RAISE EXCEPTION 'blank review anchor versions cannot have analysis work';
  END IF;
  RETURN NEW;
END;
$$;

-- Published form content becomes immutable as soon as a BATCH_REVIEW anchor
-- references it.  This protects exact-revision recovery independently of
-- whichever approved context is imported later.
CREATE OR REPLACE FUNCTION amc_practice.guard_released_form_revision()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_form_id text; target_form_version text;
BEGIN
  target_form_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.form_id ELSE NEW.form_id END;
  target_form_version := CASE WHEN TG_OP = 'DELETE' THEN OLD.version ELSE NEW.version END;
  IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = target_form_id AND release.form_version = target_form_version)
     OR EXISTS (SELECT 1 FROM amc_practice.learning_submissions submission
      WHERE submission.source_type = 'BATCH_REVIEW'
        AND submission.form_id = target_form_id AND submission.form_version = target_form_version) THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'review-pinned form revision is immutable';
    ELSIF ROW(NEW.form_id, NEW.version, NEW.title, NEW.duration_ms,
        NEW.test_only,
        NEW.source_schema_version, NEW.source_manifest_hash, NEW.content_hash,
        NEW.question_bundle_hash, NEW.provenance, NEW.scoring_policy, NEW.manifest_hash,
        NEW.imported_at)
        IS DISTINCT FROM ROW(OLD.form_id, OLD.version, OLD.title, OLD.duration_ms,
        OLD.test_only,
        OLD.source_schema_version, OLD.source_manifest_hash, OLD.content_hash,
        OLD.question_bundle_hash, OLD.provenance, OLD.scoring_policy, OLD.manifest_hash,
        OLD.imported_at) THEN
      RAISE EXCEPTION 'review-pinned form revision is immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION amc_practice.guard_released_form_question()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE protected boolean;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE (release.form_id = OLD.form_id AND release.form_version = OLD.form_version)
         OR (release.form_id = NEW.form_id AND release.form_version = NEW.form_version))
      OR EXISTS (SELECT 1 FROM amc_practice.learning_submissions submission
      WHERE submission.source_type = 'BATCH_REVIEW'
        AND ((submission.form_id = OLD.form_id AND submission.form_version = OLD.form_version)
          OR (submission.form_id = NEW.form_id AND submission.form_version = NEW.form_version))) INTO protected;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = OLD.form_id AND release.form_version = OLD.form_version)
      OR EXISTS (SELECT 1 FROM amc_practice.learning_submissions submission
      WHERE submission.source_type = 'BATCH_REVIEW'
        AND submission.form_id = OLD.form_id AND submission.form_version = OLD.form_version) INTO protected;
  ELSE
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = NEW.form_id AND release.form_version = NEW.form_version)
      OR EXISTS (SELECT 1 FROM amc_practice.learning_submissions submission
      WHERE submission.source_type = 'BATCH_REVIEW'
        AND submission.form_id = NEW.form_id AND submission.form_version = NEW.form_version) INTO protected;
  END IF;
  IF protected THEN RAISE EXCEPTION 'review-pinned form questions are immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- Context only becomes protected once a concrete BATCH_COMMIT version pins it;
-- merely creating an empty workspace must not reserve the active context.
CREATE OR REPLACE FUNCTION amc_practice.guard_released_context_set()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_context_id uuid;
BEGIN
  target_context_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
  IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = target_context_id)
     OR EXISTS (
       SELECT 1 FROM amc_practice.learning_submission_versions version
       JOIN amc_practice.learning_submissions submission
         ON submission.id = version.learning_submission_id
       WHERE submission.source_type = 'BATCH_REVIEW'
         AND version.context_set_id = target_context_id
     ) THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'review-pinned context lineage is immutable';
    ELSIF ROW(NEW.id, NEW.schema_version, NEW.artifact_set_hash,
        NEW.candidate_schema_version, NEW.candidate_set_hash, NEW.decision_set_hash,
        NEW.approval_authority_id, NEW.approval_receipt_set_hash, NEW.form_id,
        NEW.form_version, NEW.context_content_hash, NEW.release_question_bundle_hash,
        NEW.release_content_hash, NEW.release_manifest_hash, NEW.imported_at)
        IS DISTINCT FROM ROW(OLD.id, OLD.schema_version, OLD.artifact_set_hash,
        OLD.candidate_schema_version, OLD.candidate_set_hash, OLD.decision_set_hash,
        OLD.approval_authority_id, OLD.approval_receipt_set_hash, OLD.form_id,
        OLD.form_version, OLD.context_content_hash, OLD.release_question_bundle_hash,
        OLD.release_content_hash, OLD.release_manifest_hash, OLD.imported_at) THEN
      RAISE EXCEPTION 'review-pinned context lineage is immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION amc_practice.guard_released_context_child()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE protected boolean;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id IN (OLD.context_set_id, NEW.context_set_id))
      OR EXISTS (
        SELECT 1 FROM amc_practice.learning_submission_versions version
        JOIN amc_practice.learning_submissions submission
          ON submission.id = version.learning_submission_id
        WHERE submission.source_type = 'BATCH_REVIEW'
          AND version.context_set_id IN (OLD.context_set_id, NEW.context_set_id)
      ) INTO protected;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = OLD.context_set_id)
      OR EXISTS (
        SELECT 1 FROM amc_practice.learning_submission_versions version
        JOIN amc_practice.learning_submissions submission
          ON submission.id = version.learning_submission_id
        WHERE submission.source_type = 'BATCH_REVIEW'
          AND version.context_set_id = OLD.context_set_id
      ) INTO protected;
  ELSE
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = NEW.context_set_id)
      OR EXISTS (
        SELECT 1 FROM amc_practice.learning_submission_versions version
        JOIN amc_practice.learning_submissions submission
          ON submission.id = version.learning_submission_id
        WHERE submission.source_type = 'BATCH_REVIEW'
          AND version.context_set_id = NEW.context_set_id
      ) INTO protected;
  END IF;
  IF protected THEN RAISE EXCEPTION 'review-pinned context content is immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- One fail-closed entitlement predicate is shared by HTTP and every durable
-- worker phase.  Context readiness is intentionally absent here: it governs
-- analysis/Tutor, not ownership of an already-created upload workspace.
CREATE OR REPLACE FUNCTION amc_practice.learning_entitlement_allows(
  target_submission_id uuid,
  purpose text
) RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM amc_practice.learning_submissions s
    JOIN amc_practice.attempts a
      ON a.id = s.attempt_id AND a.student_id = s.student_id
     AND a.form_id = s.form_id AND a.form_version = s.form_version
     AND a.attempt_mode = s.attempt_mode
    JOIN amc_practice.form_revisions form
      ON form.form_id = s.form_id AND form.version = s.form_version
    LEFT JOIN amc_practice.submissions official
      ON s.source_type = 'INTERACTIVE_FINAL'
     AND official.id = s.official_submission_id
     AND official.attempt_id = s.attempt_id AND official.kind = 'FINAL'
    LEFT JOIN amc_practice.open_review_releases release
      ON s.source_type = 'OPEN_REVIEW'
     AND release.id = s.open_review_release_id
     AND release.form_id = s.form_id AND release.form_version = s.form_version
    WHERE s.id = target_submission_id
      AND purpose IN ('NEW_BATCH', 'EXISTING_WORK', 'CLEANUP')
      AND (purpose = 'CLEANUP' OR s.lifecycle_status = 'COMMITTED')
      AND (
        (s.source_type = 'INTERACTIVE_FINAL'
          AND s.attempt_mode = 'TIMED'
          AND s.official_submission_kind = 'FINAL'
          AND official.id IS NOT NULL
          AND a.phase IN ('FINALIZED', 'RESET')
          AND release.id IS NULL)
        OR
        (s.source_type = 'OPEN_REVIEW'
          AND s.attempt_mode = 'OPEN_REVIEW'
          AND a.phase = 'OPEN_REVIEW'
          AND official.id IS NULL
          AND release.id IS NOT NULL
          AND (purpose = 'CLEANUP'
            OR (purpose = 'NEW_BATCH' AND release.status = 'ACTIVE')
            OR (purpose = 'EXISTING_WORK' AND release.status IN ('ACTIVE', 'SUPERSEDED_VALID'))))
        OR
        (s.source_type = 'BATCH_REVIEW'
          AND s.attempt_mode = 'BATCH_REVIEW'
          AND a.phase = 'BATCH_REVIEW'
          AND official.id IS NULL
          AND release.id IS NULL
          AND form.published_at IS NOT NULL)
      )
  );
$$;
