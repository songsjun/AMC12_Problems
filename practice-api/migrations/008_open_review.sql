-- OPEN_REVIEW is an untimed learning workspace which deliberately reuses the
-- owner/attempt aggregate identity.  It is not an unstarted contest attempt:
-- database constraints permanently exclude timer, official submission, and
-- mutable-answer state from this mode.

ALTER TABLE amc_practice.attempts
  ADD COLUMN attempt_mode text NOT NULL DEFAULT 'TIMED';

ALTER TABLE amc_practice.attempts
  DROP CONSTRAINT IF EXISTS attempts_phase_check,
  DROP CONSTRAINT IF EXISTS attempts_check,
  ADD CONSTRAINT amc_attempt_mode_check
    CHECK (attempt_mode IN ('TIMED', 'OPEN_REVIEW')),
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
    (attempt_mode = 'OPEN_REVIEW'
      AND phase = 'OPEN_REVIEW'
      AND clock_state = 'PAUSED'
      AND clock_started_at IS NULL
      AND active_elapsed_ms = 0
      AND answers_revision = 0
      AND reasoning_revision = 0
      AND state_revision = 0
      AND limit_reached_at IS NULL
      AND finalized_at IS NULL
      AND reset_at IS NULL)
  ),
  ADD CONSTRAINT amc_attempts_mode_lineage_unique
    UNIQUE (id, student_id, form_id, form_version, attempt_mode);

DROP INDEX IF EXISTS amc_practice.amc_one_active_attempt_idx;
CREATE UNIQUE INDEX amc_one_active_timed_attempt_idx
  ON amc_practice.attempts(student_id, form_id)
  WHERE attempt_mode = 'TIMED' AND phase NOT IN ('FINALIZED', 'RESET');
CREATE UNIQUE INDEX amc_one_open_review_workspace_idx
  ON amc_practice.attempts(student_id, form_id, form_version)
  WHERE attempt_mode = 'OPEN_REVIEW';

CREATE TABLE amc_practice.open_review_releases (
  id uuid PRIMARY KEY,
  schema_version text NOT NULL CHECK (schema_version = 'amc-open-review-release-v1'),
  form_id text NOT NULL,
  form_version text NOT NULL,
  context_set_id uuid NOT NULL,
  release_hash char(64) NOT NULL UNIQUE CHECK (release_hash ~ '^[0-9a-f]{64}$'),
  manifest_hash char(64) NOT NULL CHECK (manifest_hash ~ '^[0-9a-f]{64}$'),
  content_hash char(64) NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  question_bundle_hash char(64) NOT NULL CHECK (question_bundle_hash ~ '^[0-9a-f]{64}$'),
  context_artifact_set_hash char(64) NOT NULL CHECK (context_artifact_set_hash ~ '^[0-9a-f]{64}$'),
  approval_authority_id text NOT NULL CHECK (char_length(approval_authority_id) BETWEEN 3 AND 128),
  status text NOT NULL CHECK (status IN ('ACTIVE', 'SUPERSEDED_VALID', 'REVOKED')),
  transition_authority_id text NOT NULL CHECK (char_length(transition_authority_id) BETWEEN 3 AND 128),
  transition_reason_code text NOT NULL CHECK (char_length(transition_reason_code) BETWEEN 3 AND 100),
  published_at timestamptz NOT NULL,
  superseded_at timestamptz,
  revoked_at timestamptz,
  state_revision bigint NOT NULL DEFAULT 0 CHECK (state_revision >= 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT amc_open_review_release_form_fk
    FOREIGN KEY (form_id, form_version)
      REFERENCES amc_practice.form_revisions(form_id, version) ON DELETE RESTRICT,
  CONSTRAINT amc_open_review_release_context_fk
    FOREIGN KEY (context_set_id, form_id, form_version)
      REFERENCES amc_practice.approved_context_sets(id, form_id, form_version) ON DELETE RESTRICT,
  CONSTRAINT amc_open_review_release_context_authority_fk
    FOREIGN KEY (context_set_id, approval_authority_id)
      REFERENCES amc_practice.approved_context_sets(id, approval_authority_id) ON DELETE RESTRICT,
  CONSTRAINT amc_open_review_release_exact_unique UNIQUE (form_id, form_version),
  CONSTRAINT amc_open_review_release_lineage_unique UNIQUE (id, form_id, form_version),
  CHECK (created_at = published_at),
  CHECK (
    (status = 'ACTIVE' AND state_revision = 0 AND superseded_at IS NULL AND revoked_at IS NULL
      AND updated_at = published_at)
    OR (status = 'SUPERSEDED_VALID' AND state_revision >= 1
      AND superseded_at IS NOT NULL AND superseded_at = updated_at
      AND superseded_at > published_at AND revoked_at IS NULL)
    OR (status = 'REVOKED' AND state_revision >= 1
      AND revoked_at IS NOT NULL AND revoked_at = updated_at AND revoked_at > published_at
      AND (superseded_at IS NULL OR superseded_at <= revoked_at))
  )
);
CREATE UNIQUE INDEX amc_one_active_open_review_release_idx
  ON amc_practice.open_review_releases(form_id) WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX amc_one_active_open_review_bundle_idx
  ON amc_practice.open_review_releases(question_bundle_hash) WHERE status = 'ACTIVE';

CREATE FUNCTION amc_practice.guard_released_form_revision()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  target_form_id text;
  target_form_version text;
BEGIN
  target_form_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.form_id ELSE NEW.form_id END;
  target_form_version := CASE WHEN TG_OP = 'DELETE' THEN OLD.version ELSE NEW.version END;
  IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = target_form_id AND release.form_version = target_form_version) THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'released open review form revision is immutable';
    ELSIF ROW(NEW.form_id, NEW.version, NEW.title, NEW.duration_ms,
        NEW.published, NEW.test_only, NEW.published_at, NEW.publication_status,
        NEW.source_schema_version, NEW.source_manifest_hash, NEW.content_hash,
        NEW.question_bundle_hash, NEW.provenance, NEW.scoring_policy, NEW.manifest_hash,
        NEW.imported_at)
        IS DISTINCT FROM ROW(OLD.form_id, OLD.version, OLD.title, OLD.duration_ms,
        OLD.published, OLD.test_only, OLD.published_at, OLD.publication_status,
        OLD.source_schema_version, OLD.source_manifest_hash, OLD.content_hash,
        OLD.question_bundle_hash, OLD.provenance, OLD.scoring_policy, OLD.manifest_hash,
        OLD.imported_at) THEN
      RAISE EXCEPTION 'released open review form revision is immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_released_form_revision
  BEFORE UPDATE OR DELETE ON amc_practice.form_revisions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_form_revision();

CREATE FUNCTION amc_practice.guard_released_form_question()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE released boolean;
BEGIN
  -- On UPDATE both sides matter: checking only NEW would permit moving a row
  -- out of a released revision into an unreleased one.
  IF TG_OP = 'UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE (release.form_id = OLD.form_id AND release.form_version = OLD.form_version)
         OR (release.form_id = NEW.form_id AND release.form_version = NEW.form_version)) INTO released;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = OLD.form_id AND release.form_version = OLD.form_version) INTO released;
  ELSE
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.form_id = NEW.form_id AND release.form_version = NEW.form_version) INTO released;
  END IF;
  IF released THEN
    RAISE EXCEPTION 'released open review form questions are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_released_form_question
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.form_questions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_form_question();

CREATE FUNCTION amc_practice.guard_released_context_set()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_context_id uuid;
BEGIN
  target_context_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
  IF EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = target_context_id) THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'released open review context lineage is immutable';
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
      RAISE EXCEPTION 'released open review context lineage is immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_released_context_set
  BEFORE UPDATE OR DELETE ON amc_practice.approved_context_sets
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_context_set();

CREATE FUNCTION amc_practice.guard_released_context_child()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE released boolean;
BEGIN
  -- Protect both the source and destination of an UPDATE.  Otherwise an
  -- approved question/solution could be moved out of a released context.
  IF TG_OP = 'UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id IN (OLD.context_set_id, NEW.context_set_id)) INTO released;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = OLD.context_set_id) INTO released;
  ELSE
    SELECT EXISTS (SELECT 1 FROM amc_practice.open_review_releases release
      WHERE release.context_set_id = NEW.context_set_id) INTO released;
  END IF;
  IF released THEN
    RAISE EXCEPTION 'released open review context content is immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_released_context_question
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.approved_context_questions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_context_child();
CREATE TRIGGER amc_guard_released_context_solution
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.approved_context_solutions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_context_child();

CREATE TABLE amc_practice.open_review_release_events (
  id bigserial PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES amc_practice.open_review_releases(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('PUBLISHED', 'SUPERSEDED', 'REVOKED')),
  previous_status text CHECK (previous_status IS NULL OR previous_status IN ('ACTIVE', 'SUPERSEDED_VALID')),
  next_status text NOT NULL CHECK (next_status IN ('ACTIVE', 'SUPERSEDED_VALID', 'REVOKED')),
  authority_id text NOT NULL CHECK (char_length(authority_id) BETWEEN 3 AND 128),
  reason_code text NOT NULL CHECK (char_length(reason_code) BETWEEN 3 AND 100),
  occurred_at timestamptz NOT NULL,
  UNIQUE (release_id, next_status)
);

CREATE FUNCTION amc_practice.reject_open_review_release_event_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'open review release events are append-only';
END;
$$;
CREATE TRIGGER amc_open_review_release_events_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.open_review_release_events
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_release_event_mutation();

CREATE FUNCTION amc_practice.validate_open_review_release()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  revision amc_practice.form_revisions%ROWTYPE;
  context amc_practice.approved_context_sets%ROWTYPE;
  question_count integer;
  ready_count integer;
BEGIN
  IF NEW.status <> 'ACTIVE' OR NEW.state_revision <> 0 OR NEW.superseded_at IS NOT NULL
      OR NEW.revoked_at IS NOT NULL OR NEW.created_at <> NEW.published_at
      OR NEW.updated_at <> NEW.published_at THEN
    RAISE EXCEPTION 'open review release must begin in the canonical ACTIVE state';
  END IF;
  PERFORM pg_advisory_xact_lock(
    hashtext('amc_open_delivery_bundle'), hashtext(NEW.question_bundle_hash)
  );
  SELECT * INTO revision FROM amc_practice.form_revisions
   WHERE form_id = NEW.form_id AND version = NEW.form_version FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'open review form revision is missing'; END IF;
  IF revision.published THEN RAISE EXCEPTION 'published timed revision cannot enter open review'; END IF;
  IF EXISTS (SELECT 1 FROM amc_practice.form_revisions published
      WHERE published.published = true
        AND published.question_bundle_hash = NEW.question_bundle_hash) THEN
    RAISE EXCEPTION 'published timed question bundle cannot enter open review';
  END IF;
  IF revision.manifest_hash <> NEW.manifest_hash
      OR revision.content_hash IS DISTINCT FROM NEW.content_hash
      OR revision.question_bundle_hash IS DISTINCT FROM NEW.question_bundle_hash THEN
    RAISE EXCEPTION 'open review release hashes do not match form revision';
  END IF;
  SELECT * INTO context FROM amc_practice.approved_context_sets
   WHERE id = NEW.context_set_id AND form_id = NEW.form_id AND form_version = NEW.form_version FOR SHARE;
  IF NOT FOUND OR NOT context.active THEN
    RAISE EXCEPTION 'open review requires the active approved context set';
  END IF;
  IF context.artifact_set_hash <> NEW.context_artifact_set_hash
      OR context.approval_authority_id <> NEW.approval_authority_id
      OR context.release_manifest_hash <> NEW.manifest_hash
      OR context.release_content_hash <> NEW.content_hash
      OR context.release_question_bundle_hash <> NEW.question_bundle_hash THEN
    RAISE EXCEPTION 'open review approved context lineage is stale';
  END IF;
  SELECT count(*) INTO question_count FROM amc_practice.form_questions
   WHERE form_id = NEW.form_id AND form_version = NEW.form_version;
  SELECT count(*) INTO ready_count
  FROM amc_practice.approved_context_questions question
  WHERE question.context_set_id = NEW.context_set_id
    AND question.model_eligible_solution_count >= 2
    AND (SELECT count(*) FROM amc_practice.approved_context_solutions solution
         WHERE solution.context_set_id = question.context_set_id
           AND solution.question_number = question.question_number
           AND solution.model_eligible = true) >= 2;
  IF question_count = 0 OR ready_count <> question_count THEN
    RAISE EXCEPTION 'every open review question requires at least two model-eligible solutions';
  END IF;
  IF EXISTS (
    SELECT 1 FROM amc_practice.attempts a
    JOIN amc_practice.form_revisions attempted
      ON attempted.form_id = a.form_id AND attempted.version = a.form_version
    WHERE a.attempt_mode = 'TIMED'
      AND ((a.form_id = NEW.form_id AND a.form_version = NEW.form_version)
        OR attempted.question_bundle_hash = NEW.question_bundle_hash)
  ) THEN RAISE EXCEPTION 'timed delivery already exists for this question bundle'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_validate_open_review_release
  BEFORE INSERT ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_open_review_release();

CREATE FUNCTION amc_practice.guard_open_review_release_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW.schema_version, NEW.form_id, NEW.form_version, NEW.context_set_id,
      NEW.release_hash, NEW.manifest_hash, NEW.content_hash, NEW.question_bundle_hash,
      NEW.context_artifact_set_hash, NEW.approval_authority_id, NEW.published_at, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.schema_version, OLD.form_id, OLD.form_version, OLD.context_set_id,
      OLD.release_hash, OLD.manifest_hash, OLD.content_hash, OLD.question_bundle_hash,
      OLD.context_artifact_set_hash, OLD.approval_authority_id, OLD.published_at, OLD.created_at) THEN
    RAISE EXCEPTION 'open review release lineage is immutable';
  END IF;
  IF NOT ((OLD.status = 'ACTIVE' AND NEW.status IN ('SUPERSEDED_VALID', 'REVOKED'))
      OR (OLD.status = 'SUPERSEDED_VALID' AND NEW.status = 'REVOKED')) THEN
    RAISE EXCEPTION 'invalid open review release transition';
  END IF;
  IF NEW.state_revision <> OLD.state_revision + 1 OR NEW.updated_at <= OLD.updated_at THEN
    RAISE EXCEPTION 'open review transition revision is invalid';
  END IF;
  IF NEW.status = 'SUPERSEDED_VALID'
      AND (NEW.superseded_at IS DISTINCT FROM NEW.updated_at OR NEW.revoked_at IS NOT NULL) THEN
    RAISE EXCEPTION 'open review supersession timing is invalid';
  END IF;
  IF NEW.status = 'REVOKED'
      AND (NEW.revoked_at IS DISTINCT FROM NEW.updated_at
        OR NEW.superseded_at IS DISTINCT FROM OLD.superseded_at) THEN
    RAISE EXCEPTION 'open review revocation timing is invalid';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_open_review_release_update
  BEFORE UPDATE ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_open_review_release_update();

CREATE FUNCTION amc_practice.record_open_review_release_event()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO amc_practice.open_review_release_events
    (release_id, event_type, previous_status, next_status, authority_id, reason_code, occurred_at)
  VALUES (NEW.id,
    CASE NEW.status WHEN 'ACTIVE' THEN 'PUBLISHED' WHEN 'SUPERSEDED_VALID' THEN 'SUPERSEDED' ELSE 'REVOKED' END,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
    NEW.status, NEW.transition_authority_id, NEW.transition_reason_code, NEW.updated_at);
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_record_open_review_release_insert
  AFTER INSERT ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.record_open_review_release_event();
CREATE TRIGGER amc_record_open_review_release_update
  AFTER UPDATE ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.record_open_review_release_event();

CREATE FUNCTION amc_practice.guard_form_delivery_mode()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.published AND (TG_OP = 'INSERT' OR NOT OLD.published) THEN
    PERFORM pg_advisory_xact_lock(
      hashtext('amc_open_delivery_bundle'), hashtext(NEW.question_bundle_hash)
    );
    PERFORM 1 FROM amc_practice.form_revisions
      WHERE form_id = NEW.form_id AND version = NEW.version FOR UPDATE;
    IF EXISTS (
      SELECT 1 FROM amc_practice.open_review_releases r
      WHERE (r.form_id = NEW.form_id AND r.form_version = NEW.version)
        OR r.question_bundle_hash = NEW.question_bundle_hash
    ) THEN RAISE EXCEPTION 'open review delivery fence forbids timed publication'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_form_delivery_mode
  BEFORE INSERT OR UPDATE OF published ON amc_practice.form_revisions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_form_delivery_mode();

CREATE FUNCTION amc_practice.guard_attempt_delivery_mode()
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
  ELSIF NOT EXISTS (SELECT 1 FROM amc_practice.open_review_releases r
    WHERE r.form_id = NEW.form_id AND r.form_version = NEW.form_version AND r.status = 'ACTIVE') THEN
    RAISE EXCEPTION 'active open review release is required';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_attempt_delivery_mode
  BEFORE INSERT ON amc_practice.attempts
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_attempt_delivery_mode();

CREATE FUNCTION amc_practice.guard_attempt_identity_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.attempt_mode, NEW.form_id, NEW.form_version)
    IS DISTINCT FROM ROW(OLD.attempt_mode, OLD.form_id, OLD.form_version) THEN
    RAISE EXCEPTION 'attempt delivery identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_attempt_identity_update
  BEFORE UPDATE ON amc_practice.attempts
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_attempt_identity_update();

CREATE FUNCTION amc_practice.reject_open_review_official_child()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM amc_practice.attempts
      WHERE id = NEW.attempt_id AND attempt_mode <> 'TIMED') THEN
    RAISE EXCEPTION 'open review attempts cannot have timed answer/reasoning, official, or timer records';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_reject_open_review_submission
  BEFORE INSERT OR UPDATE OF attempt_id ON amc_practice.submissions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_official_child();
CREATE TRIGGER amc_reject_open_review_timer_event
  BEFORE INSERT OR UPDATE OF attempt_id ON amc_practice.timer_events
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_official_child();
CREATE TRIGGER amc_reject_open_review_attempt_answer
  BEFORE INSERT OR UPDATE OF attempt_id ON amc_practice.attempt_answers
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_official_child();
CREATE TRIGGER amc_reject_open_review_attempt_reasoning
  BEFORE INSERT OR UPDATE OF attempt_id ON amc_practice.attempt_reasoning_notes
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_official_child();

ALTER TABLE amc_practice.learning_batches
  DROP CONSTRAINT amc_learning_batch_final_lineage_fk;
ALTER TABLE amc_practice.learning_submissions
  DROP CONSTRAINT amc_learning_submission_batch_lineage_unique;

ALTER TABLE amc_practice.learning_submissions
  ALTER COLUMN official_submission_id DROP NOT NULL,
  ALTER COLUMN official_submission_kind DROP NOT NULL,
  ALTER COLUMN official_submission_kind DROP DEFAULT,
  DROP CONSTRAINT IF EXISTS learning_submissions_official_submission_kind_check,
  DROP CONSTRAINT IF EXISTS learning_submissions_source_type_check,
  ADD COLUMN attempt_mode text NOT NULL DEFAULT 'TIMED',
  ADD COLUMN open_review_release_id uuid,
  ADD COLUMN deletion_generation integer NOT NULL DEFAULT 0 CHECK (deletion_generation >= 0),
  ADD COLUMN deleted_at timestamptz,
  ADD CONSTRAINT amc_learning_submission_source_check CHECK (source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW')),
  ADD CONSTRAINT amc_learning_submission_source_xor_check CHECK (
    (source_type = 'INTERACTIVE_FINAL' AND attempt_mode = 'TIMED'
      AND official_submission_id IS NOT NULL AND official_submission_kind = 'FINAL'
      AND open_review_release_id IS NULL)
    OR
    (source_type = 'OPEN_REVIEW' AND attempt_mode = 'OPEN_REVIEW'
      AND official_submission_id IS NULL AND official_submission_kind IS NULL
      AND open_review_release_id IS NOT NULL)
  ),
  ADD CONSTRAINT amc_learning_submission_mode_fk
    FOREIGN KEY (attempt_id, student_id, form_id, form_version, attempt_mode)
      REFERENCES amc_practice.attempts(id, student_id, form_id, form_version, attempt_mode) ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_submission_release_fk
    FOREIGN KEY (open_review_release_id, form_id, form_version)
      REFERENCES amc_practice.open_review_releases(id, form_id, form_version) ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_submission_lifecycle_deletion_check CHECK (
    (lifecycle_status = 'COMMITTED' AND deleted_at IS NULL)
    OR (lifecycle_status = 'DELETED' AND deleted_at IS NOT NULL)
  ),
  ADD CONSTRAINT amc_learning_submission_batch_lineage_unique
    UNIQUE (id, student_id, attempt_id, form_id, form_version, source_type);

ALTER TABLE amc_practice.learning_batches
  ADD COLUMN source_type text NOT NULL DEFAULT 'INTERACTIVE_FINAL'
    CHECK (source_type IN ('INTERACTIVE_FINAL', 'OPEN_REVIEW')),
  ADD CONSTRAINT amc_learning_batch_source_lineage_fk
    FOREIGN KEY (learning_submission_id, student_id, attempt_id, form_id, form_version, source_type)
      REFERENCES amc_practice.learning_submissions(id, student_id, attempt_id, form_id, form_version, source_type)
      ON DELETE RESTRICT;

CREATE FUNCTION amc_practice.guard_learning_submission_source_identity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW.student_id, NEW.attempt_id, NEW.official_submission_id,
      NEW.official_submission_kind, NEW.form_id, NEW.form_version, NEW.source_type,
      NEW.attempt_mode, NEW.open_review_release_id, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.student_id, OLD.attempt_id, OLD.official_submission_id,
      OLD.official_submission_kind, OLD.form_id, OLD.form_version, OLD.source_type,
      OLD.attempt_mode, OLD.open_review_release_id, OLD.created_at) THEN
    RAISE EXCEPTION 'learning submission source identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_learning_submission_source_identity
  BEFORE UPDATE ON amc_practice.learning_submissions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_learning_submission_source_identity();

CREATE FUNCTION amc_practice.guard_learning_batch_source_identity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW.student_id, NEW.attempt_id, NEW.learning_submission_id,
      NEW.base_version, NEW.form_id, NEW.form_version, NEW.source_type, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.student_id, OLD.attempt_id, OLD.learning_submission_id,
      OLD.base_version, OLD.form_id, OLD.form_version, OLD.source_type, OLD.created_at) THEN
    RAISE EXCEPTION 'learning batch source identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_guard_learning_batch_source_identity
  BEFORE UPDATE ON amc_practice.learning_batches
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_learning_batch_source_identity();

ALTER TABLE amc_practice.learning_submission_versions
  DROP CONSTRAINT amc_learning_version_creation_reason_check,
  ADD CONSTRAINT amc_learning_version_creation_reason_check CHECK (
    (creation_reason IN ('FINAL_COMMIT', 'BACKFILL') AND batch_id IS NULL
      AND answers_revision IS NOT NULL AND reasoning_revision IS NOT NULL)
    OR (creation_reason = 'OPEN_REVIEW_ANCHOR' AND batch_id IS NULL
      AND version_number = 1 AND answers_revision = 0 AND reasoning_revision = 0
      AND context_status = 'CONTEXT_READY' AND context_set_id IS NOT NULL)
    OR (creation_reason = 'BATCH_COMMIT' AND batch_id IS NOT NULL
      AND answers_revision IS NULL AND reasoning_revision IS NULL)
  );

ALTER TABLE amc_practice.learning_question_responses
  DROP CONSTRAINT amc_learning_response_answer_origin_check,
  DROP CONSTRAINT amc_learning_response_reasoning_origin_check,
  ADD CONSTRAINT amc_learning_response_origin_check CHECK (
    (answer_origin = 'OPEN_REVIEW_BLANK' AND selected_option IS NULL
      AND reasoning_text = '' AND reasoning_origin = 'NONE')
    OR (answer_origin = 'OFFICIAL_FINAL' AND reasoning_origin IN ('DURING_ATTEMPT', 'NONE'))
    OR (answer_origin = 'BATCH_CONFIRMED'
      AND reasoning_origin IN ('BATCH_CONFIRMED_EVIDENCE', 'BATCH_CONFIRMATION_EDIT'))
  );

CREATE FUNCTION amc_practice.validate_learning_version_source()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  submission_source text;
  pinned_context uuid;
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
  ELSIF NEW.creation_reason = 'OPEN_REVIEW_ANCHOR' THEN
    RAISE EXCEPTION 'timed learning submissions cannot use an open review anchor';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_validate_learning_version_source
  BEFORE INSERT OR UPDATE OF learning_submission_id, creation_reason, context_set_id
  ON amc_practice.learning_submission_versions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_learning_version_source();

CREATE FUNCTION amc_practice.reject_open_review_anchor_work()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM amc_practice.learning_submission_versions version
    WHERE version.id = NEW.learning_submission_version_id
      AND version.creation_reason = 'OPEN_REVIEW_ANCHOR'
  ) THEN
    RAISE EXCEPTION 'open review anchor versions cannot have analysis work';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER amc_reject_open_review_anchor_work_item
  BEFORE INSERT OR UPDATE OF learning_submission_version_id
  ON amc_practice.learning_work_items
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_anchor_work();
CREATE TRIGGER amc_reject_open_review_anchor_analysis_run
  BEFORE INSERT OR UPDATE OF learning_submission_version_id
  ON amc_practice.learning_analysis_runs
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_open_review_anchor_work();

-- One database predicate is shared by every worker phase.  Its two source
-- branches are deliberately mutually exclusive; cleanup ignores revocation
-- and parent deletion, but still proves exact immutable lineage.
CREATE FUNCTION amc_practice.learning_entitlement_allows(
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
      )
  );
$$;
