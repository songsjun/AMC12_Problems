-- 016 intentionally made exact-form readiness authoritative at workspace
-- creation. Historical reports and Tutor conversations, however, are reads
-- against immutable submission/context lineage: superseding the published
-- form must not revoke them. NEW_BATCH remains the single authorization for
-- every pre-commit intake mutation; CLEANUP remains available after rollout
-- withdrawal.

-- A workspace pins the context that existed at creation. Superseding that
-- context may change current readiness, but cannot change the immutable
-- methods against which an already-authorized workspace is assessed.
CREATE FUNCTION amc_practice.batch_review_pinned_context_is_complete(
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
      AND context.sealed AND revision.content_sealed AND revision.published_at IS NOT NULL
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

-- A batch is the immutable cause of exactly one learning version. Fail the
-- migration closed if a pre-017 writer has already violated that invariant;
-- silently choosing one of two versions would destroy audit lineage.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM amc_practice.learning_submission_versions version
    WHERE version.batch_id IS NOT NULL
    GROUP BY version.batch_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'cannot enforce one learning version per batch: duplicate batch lineage exists'
      USING ERRCODE = '23505';
  END IF;
END;
$$;

CREATE UNIQUE INDEX amc_learning_version_one_per_batch_idx
  ON amc_practice.learning_submission_versions(batch_id)
  WHERE batch_id IS NOT NULL;

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
  ELSIF NEW.creation_reason IN ('OPEN_REVIEW_ANCHOR','BATCH_REVIEW_ANCHOR') THEN
    RAISE EXCEPTION 'timed learning submissions cannot use a review anchor';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION amc_practice.learning_entitlement_allows(
  target_submission_id uuid,
  purpose text
) RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM amc_practice.learning_submissions submission
    JOIN amc_practice.attempts attempt
      ON attempt.id = submission.attempt_id AND attempt.student_id = submission.student_id
     AND attempt.form_id = submission.form_id AND attempt.form_version = submission.form_version
     AND attempt.attempt_mode = submission.attempt_mode
    JOIN amc_practice.form_revisions form
      ON form.form_id = submission.form_id AND form.version = submission.form_version
     AND form.content_sealed
    LEFT JOIN amc_practice.submissions official
      ON submission.source_type = 'INTERACTIVE_FINAL'
     AND official.id = submission.official_submission_id
     AND official.attempt_id = submission.attempt_id AND official.kind = 'FINAL'
    LEFT JOIN amc_practice.open_review_releases release
      ON submission.source_type = 'OPEN_REVIEW'
     AND release.id = submission.open_review_release_id
     AND release.form_id = submission.form_id AND release.form_version = submission.form_version
    WHERE submission.id = target_submission_id
      AND purpose IN ('NEW_BATCH', 'EXISTING_WORK', 'CLEANUP')
      AND (purpose = 'CLEANUP' OR submission.lifecycle_status = 'COMMITTED')
      AND (
        (submission.source_type = 'INTERACTIVE_FINAL'
          AND submission.attempt_mode = 'TIMED'
          AND submission.official_submission_kind = 'FINAL'
          AND official.id IS NOT NULL
          AND attempt.phase IN ('FINALIZED', 'RESET')
          AND release.id IS NULL
          AND (purpose <> 'NEW_BATCH' OR (
            form.published AND EXISTS (
              SELECT 1 FROM amc_practice.approved_context_sets context
              WHERE context.form_id = form.form_id AND context.form_version = form.version
                AND context.active AND context.sealed
                AND amc_practice.batch_review_context_is_complete(
                  form.form_id, form.version, context.id)
            )
          )))
        OR
        (submission.source_type = 'OPEN_REVIEW'
          AND submission.attempt_mode = 'OPEN_REVIEW'
          AND attempt.phase = 'OPEN_REVIEW'
          AND official.id IS NULL
          AND release.id IS NOT NULL
          AND (purpose = 'CLEANUP'
            OR (purpose = 'NEW_BATCH' AND release.status = 'ACTIVE')
            OR (purpose = 'EXISTING_WORK'
              AND release.status IN ('ACTIVE', 'SUPERSEDED_VALID'))))
        OR
        (submission.source_type = 'BATCH_REVIEW'
          AND submission.attempt_mode = 'BATCH_REVIEW'
          AND attempt.phase = 'BATCH_REVIEW'
          AND official.id IS NULL
          AND release.id IS NULL
          AND (purpose IN ('EXISTING_WORK', 'CLEANUP') OR (
            purpose = 'NEW_BATCH' AND form.published AND EXISTS (
              SELECT 1 FROM amc_practice.approved_context_sets context
              WHERE context.form_id = form.form_id AND context.form_version = form.version
                AND context.active AND context.sealed
                AND amc_practice.batch_review_context_is_complete(
                  form.form_id, form.version, context.id)
            )
          )))
      )
  );
$$;
