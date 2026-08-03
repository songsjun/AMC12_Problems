-- A globally enabled batch-review flag is only a deployment prerequisite.
-- Student entry additionally requires the current published exact revision to
-- have one active, sealed, structurally complete approved context. Workspace
-- creation pins that immutable context in its v2 anchor; historical unbound
-- anchors remain readable/deletable but cannot accept new input.

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
      AND ((context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
        OR (context_status = 'CONTEXT_UNAVAILABLE' AND context_set_id IS NULL)))
    OR (creation_reason = 'BATCH_COMMIT' AND batch_id IS NOT NULL
      AND answers_revision IS NULL AND reasoning_revision IS NULL)
  );

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

-- Keep the established bundle -> exact-form -> row lock order. Context import
-- takes the same exact-form advisory lock, so either the readiness transition
-- commits first and is observed, or creation commits against the prior ready
-- context before it can be superseded.
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
  PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.form_version));
  PERFORM 1 FROM amc_practice.form_revisions
    WHERE form_id = NEW.form_id AND version = NEW.form_version FOR UPDATE;
  IF NEW.attempt_mode = 'TIMED' THEN
    IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE (release.form_id = NEW.form_id AND release.form_version = NEW.form_version)
        OR release.question_bundle_hash = bundle_hash) THEN
      RAISE EXCEPTION 'open review delivery fence forbids timed attempt';
    END IF;
  ELSIF NEW.attempt_mode = 'OPEN_REVIEW' THEN
    IF NOT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = NEW.form_id AND release.form_version = NEW.form_version
        AND release.status = 'ACTIVE') THEN
      RAISE EXCEPTION 'active open review release is required';
    END IF;
  ELSIF NEW.attempt_mode = 'BATCH_REVIEW' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM amc_practice.form_revisions revision
      JOIN amc_practice.approved_context_sets context
        ON context.form_id = revision.form_id AND context.form_version = revision.version
       AND context.active AND context.sealed
      WHERE revision.form_id = NEW.form_id AND revision.version = NEW.form_version
        AND revision.content_sealed AND revision.published
        AND amc_practice.batch_review_context_is_complete(
          revision.form_id, revision.version, context.id)
    ) THEN
      RAISE EXCEPTION 'batch review requires a ready current published exact form revision';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported attempt delivery mode';
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
          AND (purpose = 'CLEANUP' OR (
            form.published AND EXISTS (
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
