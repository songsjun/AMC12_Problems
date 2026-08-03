-- Persist the complete operator-delegated AI-assisted review lineage without
-- weakening the existing human-review v1 contract. The application validator
-- remains the canonical/hash authority; these checks prevent mixed-version or
-- partially populated audit rows from entering PostgreSQL by another writer.

-- Publication eligibility is immutable manifest-derived data, not transient
-- publication state. Persist both bits so PostgreSQL and MemoryStore return
-- the same form contract after an import/read/re-publish round trip.
ALTER TABLE amc_practice.form_revisions
  ADD COLUMN publish_eligible boolean,
  ADD COLUMN development_publish_eligible boolean,
  ADD COLUMN content_sealed boolean,
  ADD COLUMN declared_question_count smallint;

LOCK TABLE amc_practice.form_revisions, amc_practice.form_questions IN SHARE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM amc_practice.form_revisions revision
    LEFT JOIN LATERAL (
      SELECT count(*) AS question_count,
             min(question_number) AS first_question_number,
             max(question_number) AS last_question_number
      FROM amc_practice.form_questions question
      WHERE question.form_id = revision.form_id AND question.form_version = revision.version
    ) questions ON true
    WHERE questions.question_count = 0
       OR questions.first_question_number <> 1
       OR questions.last_question_number <> questions.question_count
  ) THEN
    RAISE EXCEPTION 'cannot seal a historical form revision with missing question positions';
  END IF;
  IF EXISTS (
    SELECT 1 FROM amc_practice.form_questions question
    WHERE question.prompt_markdown !~ '[^[:space:]]'
      OR question.solution_markdown !~ '[^[:space:]]'
      OR CASE
      WHEN jsonb_typeof(question.choices) <> 'array' THEN true
      ELSE jsonb_array_length(question.choices) <> 5 OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(question.choices) WITH ORDINALITY choice(value, position)
        WHERE jsonb_typeof(choice.value) <> 'object'
          OR NOT (choice.value ?& ARRAY['option', 'textMarkdown']::text[])
          OR choice.value - ARRAY['option', 'textMarkdown']::text[] <> '{}'::jsonb
          OR choice.value->>'option' <> chr(64 + choice.position::integer)
          OR jsonb_typeof(choice.value->'textMarkdown') <> 'string'
          OR (choice.value->>'textMarkdown') !~ '[^[:space:]]'
      )
    END
  ) THEN
    RAISE EXCEPTION 'cannot seal a historical form revision with malformed choices';
  END IF;
  IF EXISTS (SELECT 1 FROM amc_practice.form_revisions
      WHERE published AND published_at IS NULL) THEN
    RAISE EXCEPTION 'cannot upgrade a published form without its first-publication timestamp';
  END IF;
END;
$$;

UPDATE amc_practice.form_revisions
SET publish_eligible = NOT test_only
      AND publication_status IN ('approved', 'archive-practice'),
    development_publish_eligible = test_only,
    content_sealed = true,
    declared_question_count = (
      SELECT count(*) FROM amc_practice.form_questions question
      WHERE question.form_id = form_revisions.form_id
        AND question.form_version = form_revisions.version
    );

ALTER TABLE amc_practice.form_revisions
  ALTER COLUMN publish_eligible SET NOT NULL,
  ALTER COLUMN development_publish_eligible SET NOT NULL,
  ALTER COLUMN content_sealed SET NOT NULL,
  ALTER COLUMN content_sealed SET DEFAULT false,
  ALTER COLUMN declared_question_count SET NOT NULL,
  ALTER COLUMN declared_question_count SET DEFAULT 1,
  ADD CONSTRAINT amc_form_declared_question_count_check CHECK (
    declared_question_count BETWEEN 1 AND 100
  ),
  ADD CONSTRAINT amc_form_publication_eligibility_exclusive CHECK (
    NOT (publish_eligible AND development_publish_eligible)
  ),
  ADD CONSTRAINT amc_published_form_has_eligibility CHECK (
    NOT published OR publish_eligible OR development_publish_eligible
  ),
  ADD CONSTRAINT amc_published_form_has_timestamp CHECK (
    NOT published OR (content_sealed AND published_at IS NOT NULL)
  );

CREATE OR REPLACE FUNCTION amc_practice.guard_released_form_revision()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  actual_question_count integer;
  first_question_number integer;
  last_question_number integer;
  invalid_question_count integer;
BEGIN
  IF TG_OP = 'UPDATE'
      AND ROW(OLD.form_id, OLD.version) IS DISTINCT FROM ROW(NEW.form_id, NEW.version) THEN
    IF ROW(OLD.form_id, OLD.version) < ROW(NEW.form_id, NEW.version) THEN
      PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.version));
      PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.version));
    ELSE
      PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.version));
      PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.version));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.version));
  ELSE
    PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.version));
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.content_sealed OR NEW.published OR NEW.published_at IS NOT NULL THEN
      RAISE EXCEPTION 'form revision must begin as unsealed unpublished staging';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'form revision header is immutable after insert';
  END IF;
  IF ROW(NEW.form_id, NEW.version, NEW.title, NEW.duration_ms,
      NEW.test_only, NEW.publication_status,
      NEW.publish_eligible, NEW.development_publish_eligible,
      NEW.source_schema_version, NEW.source_manifest_hash, NEW.content_hash,
      NEW.question_bundle_hash, NEW.provenance, NEW.scoring_policy, NEW.manifest_hash,
      NEW.imported_at, NEW.declared_question_count)
      IS DISTINCT FROM ROW(OLD.form_id, OLD.version, OLD.title, OLD.duration_ms,
      OLD.test_only, OLD.publication_status,
      OLD.publish_eligible, OLD.development_publish_eligible,
      OLD.source_schema_version, OLD.source_manifest_hash, OLD.content_hash,
      OLD.question_bundle_hash, OLD.provenance, OLD.scoring_policy, OLD.manifest_hash,
      OLD.imported_at, OLD.declared_question_count) THEN
    RAISE EXCEPTION 'sealed form revision content identity is immutable';
  END IF;
  IF OLD.content_sealed THEN
    IF NOT NEW.content_sealed THEN
      RAISE EXCEPTION 'sealed form revision cannot be unsealed';
    END IF;
    IF NEW.published_at IS DISTINCT FROM OLD.published_at
        AND NOT (OLD.published_at IS NULL AND NEW.published_at IS NOT NULL
          AND NOT OLD.published AND NEW.published) THEN
      RAISE EXCEPTION 'sealed form publication timestamp is immutable after first publication';
    END IF;
    RETURN NEW;
  END IF;
  IF NOT NEW.content_sealed
      OR (NEW.published AND NEW.published_at IS NULL)
      OR (NOT NEW.published AND NEW.published_at IS NOT NULL) THEN
    RAISE EXCEPTION 'form revision may only transition from staging to sealed';
  END IF;
  SELECT count(*), min(question_number), max(question_number)
    INTO actual_question_count, first_question_number, last_question_number
  FROM amc_practice.form_questions question
  WHERE question.form_id = NEW.form_id AND question.form_version = NEW.version;
  IF actual_question_count <> NEW.declared_question_count
      OR first_question_number <> 1
      OR last_question_number <> NEW.declared_question_count THEN
    RAISE EXCEPTION 'form revision seal question count mismatch';
  END IF;
  SELECT count(*) INTO invalid_question_count
  FROM amc_practice.form_questions question
  WHERE question.form_id = NEW.form_id AND question.form_version = NEW.version
    AND (question.prompt_markdown !~ '[^[:space:]]'
      OR question.solution_markdown !~ '[^[:space:]]'
      OR CASE
      WHEN jsonb_typeof(question.choices) <> 'array' THEN true
      ELSE jsonb_array_length(question.choices) <> 5 OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(question.choices) WITH ORDINALITY choice(value, position)
        WHERE jsonb_typeof(choice.value) <> 'object'
          OR NOT (choice.value ?& ARRAY['option', 'textMarkdown']::text[])
          OR choice.value - ARRAY['option', 'textMarkdown']::text[] <> '{}'::jsonb
          OR choice.value->>'option' <> chr(64 + choice.position::integer)
          OR jsonb_typeof(choice.value->'textMarkdown') <> 'string'
          OR (choice.value->>'textMarkdown') !~ '[^[:space:]]'
      )
    END);
  IF invalid_question_count <> 0 THEN
    RAISE EXCEPTION 'form revision seal contains malformed choices';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER amc_guard_released_form_revision ON amc_practice.form_revisions;
CREATE TRIGGER amc_guard_released_form_revision
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.form_revisions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_form_revision();

ALTER TABLE amc_practice.approved_context_sets
  DROP CONSTRAINT approved_context_sets_schema_version_check,
  DROP CONSTRAINT approved_context_sets_candidate_schema_version_check,
  DROP CONSTRAINT approved_context_sets_check,
  ADD COLUMN approval_policy_version text,
  ADD COLUMN review_schema_version text,
  ADD COLUMN review_governance jsonb,
  ADD COLUMN sealed boolean,
  ADD COLUMN declared_question_count smallint;

-- Delivery/runtime aggregates and approved-context staging may bind only a
-- fully assembled form revision. This is database enforcement for direct SQL
-- writers; application reads also filter on content_sealed.
CREATE FUNCTION amc_practice.require_sealed_form_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  form_is_sealed boolean;
  target_form_id text;
  target_form_version text;
BEGIN
  target_form_id := NEW.form_id;
  target_form_version := NEW.form_version;
  SELECT content_sealed INTO form_is_sealed
  FROM amc_practice.form_revisions
  WHERE form_id = target_form_id AND version = target_form_version;
  IF form_is_sealed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'runtime reference requires a sealed form revision';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER amc_attempt_requires_sealed_form
  BEFORE INSERT OR UPDATE OF form_id, form_version ON amc_practice.attempts
  FOR EACH ROW EXECUTE FUNCTION amc_practice.require_sealed_form_reference();
CREATE TRIGGER amc_open_review_requires_sealed_form
  BEFORE INSERT OR UPDATE OF form_id, form_version ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.require_sealed_form_reference();
CREATE TRIGGER amc_approved_context_requires_sealed_form
  BEFORE INSERT OR UPDATE OF form_id, form_version ON amc_practice.approved_context_sets
  FOR EACH ROW EXECUTE FUNCTION amc_practice.require_sealed_form_reference();

-- A sealed context authenticates the exact prompt/choice/scoring source it
-- was approved against. That source is pinned even before a learner or an
-- open-review release references it, and both OLD and NEW identities matter
-- when rejecting a row move.
CREATE OR REPLACE FUNCTION amc_practice.guard_released_form_question()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_is_sealed boolean;
BEGIN
  -- Approved-context import takes the same exact-form lock before it reads the
  -- form and holds it through seal/commit. Direct SQL writers therefore cannot
  -- slip a question mutation between seal validation and transaction commit.
  IF TG_OP = 'UPDATE'
      AND ROW(OLD.form_id, OLD.form_version)
        IS DISTINCT FROM ROW(NEW.form_id, NEW.form_version) THEN
    IF ROW(OLD.form_id, OLD.form_version) < ROW(NEW.form_id, NEW.form_version) THEN
      PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.form_version));
      PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.form_version));
    ELSE
      PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.form_version));
      PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.form_version));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM pg_advisory_xact_lock(hashtext(OLD.form_id), hashtext(OLD.form_version));
  ELSE
    PERFORM pg_advisory_xact_lock(hashtext(NEW.form_id), hashtext(NEW.form_version));
  END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    RAISE EXCEPTION 'form questions are immutable after insert';
  END IF;
  SELECT content_sealed INTO parent_is_sealed
  FROM amc_practice.form_revisions
  WHERE form_id = NEW.form_id AND version = NEW.form_version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'form question parent revision is missing';
  END IF;
  IF parent_is_sealed THEN
    RAISE EXCEPTION 'sealed form questions are immutable';
  END IF;
  RETURN NEW;
END;
$$;

-- Existing v1 aggregates must already satisfy the same structural invariants
-- before they are grandfathered as sealed. Abort instead of blessing drift.
LOCK TABLE amc_practice.form_questions,
  amc_practice.approved_context_questions,
  amc_practice.approved_context_solutions IN SHARE MODE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM amc_practice.approved_context_sets context
    LEFT JOIN amc_practice.form_revisions revision
      ON revision.form_id = context.form_id AND revision.version = context.form_version
    WHERE revision.form_id IS NULL
      OR NOT revision.content_sealed
      OR context.release_manifest_hash IS DISTINCT FROM revision.manifest_hash
      OR context.release_content_hash IS DISTINCT FROM revision.content_hash
      OR context.release_question_bundle_hash IS DISTINCT FROM revision.question_bundle_hash
  ) THEN
    RAISE EXCEPTION 'cannot seal historical approved context with stale form lineage';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM amc_practice.approved_context_questions question
    WHERE question.approved_solution_count <> (
      SELECT count(*) FROM amc_practice.approved_context_solutions solution
      WHERE solution.context_set_id = question.context_set_id
        AND solution.question_number = question.question_number
    ) OR question.model_eligible_solution_count <> (
      SELECT count(*) FROM amc_practice.approved_context_solutions solution
      WHERE solution.context_set_id = question.context_set_id
        AND solution.question_number = question.question_number
        AND solution.model_eligible
    ) OR 1 <> (
      SELECT min(solution.solution_position)
      FROM amc_practice.approved_context_solutions solution
      WHERE solution.context_set_id = question.context_set_id
        AND solution.question_number = question.question_number
    ) OR question.approved_solution_count <> (
      SELECT max(solution.solution_position)
      FROM amc_practice.approved_context_solutions solution
      WHERE solution.context_set_id = question.context_set_id
        AND solution.question_number = question.question_number
    ) OR NOT EXISTS (
      SELECT 1
      FROM amc_practice.form_questions form_question
      WHERE form_question.form_id = question.form_id
        AND form_question.form_version = question.form_version
        AND form_question.question_number = question.question_number
        AND form_question.prompt_markdown = question.prompt_markdown
        AND question.choices = (
          SELECT jsonb_object_agg(choice->>'option', choice->'textMarkdown')
          FROM jsonb_array_elements(form_question.choices) choice
        )
    )
  ) THEN
    RAISE EXCEPTION 'cannot seal historical approved context with inconsistent child counts';
  END IF;
END;
$$;

UPDATE amc_practice.approved_context_sets
SET approval_policy_version = 'amc-explicit-human-solution-approval-v1',
    review_schema_version = 'amc-question-context-review-decisions-v1',
    sealed = true,
    declared_question_count = (
      SELECT count(*) FROM amc_practice.approved_context_questions question
      WHERE question.context_set_id = approved_context_sets.id
    )
WHERE schema_version = 'amc-approved-question-context-set-v1';

ALTER TABLE amc_practice.approved_context_sets
  ALTER COLUMN approval_policy_version SET NOT NULL,
  ALTER COLUMN approval_policy_version SET DEFAULT 'amc-explicit-human-solution-approval-v1',
  ALTER COLUMN review_schema_version SET NOT NULL,
  ALTER COLUMN review_schema_version SET DEFAULT 'amc-question-context-review-decisions-v1',
  ALTER COLUMN sealed SET NOT NULL,
  ALTER COLUMN declared_question_count SET NOT NULL,
  ADD CONSTRAINT amc_approved_context_declared_question_count_check CHECK (
    declared_question_count BETWEEN 0 AND 100
  ),
  ADD CONSTRAINT amc_approved_context_sealed_lifecycle_check CHECK (
    (NOT sealed AND NOT active AND superseded_at IS NULL)
    OR (sealed AND (
      (active AND superseded_at IS NULL)
      OR (NOT active AND superseded_at IS NOT NULL AND superseded_at >= imported_at)
    ))
  ),
  ADD CONSTRAINT amc_approved_context_schema_version_check CHECK (
    schema_version IN (
      'amc-approved-question-context-set-v1',
      'amc-approved-question-context-set-v2'
    )
  ),
  ADD CONSTRAINT amc_approved_context_candidate_schema_check CHECK (
    candidate_schema_version IN (
      'amc-question-context-candidate-set-v1',
      'amc-question-context-archive-candidate-set-v1',
      'amc-question-context-supplemented-archive-candidate-set-v1'
    )
  ),
  ADD CONSTRAINT amc_approved_context_v1_v2_header_pairing CHECK (
    (schema_version = 'amc-approved-question-context-set-v1'
      AND approval_policy_version = 'amc-explicit-human-solution-approval-v1'
      AND review_schema_version = 'amc-question-context-review-decisions-v1'
      AND review_governance IS NULL
      AND ((archive_wrapper_set_hash IS NULL
          AND candidate_schema_version = 'amc-question-context-candidate-set-v1')
        OR (archive_wrapper_set_hash IS NOT NULL
          AND candidate_schema_version = 'amc-question-context-archive-candidate-set-v1')))
    OR
    (schema_version = 'amc-approved-question-context-set-v2'
      AND approval_policy_version = 'amc-operator-delegated-ai-assisted-solution-approval-v1'
      AND review_schema_version = 'amc-question-context-review-decisions-v2'
      AND jsonb_typeof(review_governance) = 'object'
      AND review_governance ?& ARRAY['reviewMethod', 'operatorAuthorization']::text[]
      AND review_governance->>'reviewMethod' = 'operator-delegated-ai-assisted'
      AND review_governance - ARRAY['reviewMethod', 'operatorAuthorization']::text[] = '{}'::jsonb
      AND jsonb_typeof(review_governance->'operatorAuthorization') = 'object'
      AND (review_governance->'operatorAuthorization') ?&
        ARRAY['authorizationId', 'authorizedBy', 'authorizedAt', 'scope', 'statement', 'rightsAttestation']::text[]
      AND (review_governance->'operatorAuthorization')
        - ARRAY['authorizationId', 'authorizedBy', 'authorizedAt', 'scope', 'statement', 'rightsAttestation']::text[]
        = '{}'::jsonb
      AND char_length(review_governance->'operatorAuthorization'->>'authorizationId') BETWEEN 3 AND 128
      AND char_length(review_governance->'operatorAuthorization'->>'authorizedBy') BETWEEN 3 AND 128
      AND review_governance->'operatorAuthorization'->>'scope'
        = 'solution-correctness-pedagogy-and-rights-review'
      AND review_governance->'operatorAuthorization'->>'statement'
        = 'operator-delegates-ai-assisted-solution-review'
      AND review_governance->'operatorAuthorization'->>'rightsAttestation'
        = 'operator-attests-rights-for-reviewed-source-ai-use'
      AND approval_authority_id <>
        review_governance->'operatorAuthorization'->>'authorizedBy'
      AND ((archive_wrapper_set_hash IS NULL
          AND candidate_schema_version = 'amc-question-context-candidate-set-v1')
        OR (archive_wrapper_set_hash IS NOT NULL
          AND candidate_schema_version IN (
            'amc-question-context-archive-candidate-set-v1',
            'amc-question-context-supplemented-archive-candidate-set-v1'
          ))))
  ),
  ADD CONSTRAINT amc_approved_context_id_schema_unique UNIQUE (id, schema_version);

-- The migration-owned v1 backfill is the only permitted mutation of already
-- pinned solution rows. Remove and restore the generic child guard within this
-- same migration transaction; application writers never observe the gap.
DROP TRIGGER amc_guard_released_context_solution
  ON amc_practice.approved_context_solutions;

ALTER TABLE amc_practice.approved_context_solutions
  ADD COLUMN context_schema_version text,
  ADD COLUMN candidate_provenance jsonb,
  ADD COLUMN review_method text,
  ADD COLUMN review_model jsonb,
  ADD COLUMN operator_authorization_id text;

UPDATE amc_practice.approved_context_solutions solution
SET context_schema_version = context.schema_version
FROM amc_practice.approved_context_sets context
WHERE context.id = solution.context_set_id;

ALTER TABLE amc_practice.approved_context_solutions
  ALTER COLUMN context_schema_version SET NOT NULL,
  ALTER COLUMN context_schema_version SET DEFAULT 'amc-approved-question-context-set-v1',
  ADD CONSTRAINT amc_approved_context_solution_schema_fk
    FOREIGN KEY (context_set_id, context_schema_version)
    REFERENCES amc_practice.approved_context_sets(id, schema_version) ON DELETE RESTRICT,
  ADD CONSTRAINT amc_approved_context_solution_v1_v2_pairing CHECK (
    (context_schema_version = 'amc-approved-question-context-set-v1'
      AND candidate_provenance IS NULL
      AND review_method IS NULL
      AND review_model IS NULL
      AND operator_authorization_id IS NULL)
    OR
    (context_schema_version = 'amc-approved-question-context-set-v2'
      AND jsonb_typeof(candidate_provenance) = 'object'
      AND review_method = 'operator-delegated-ai-assisted'
      AND jsonb_typeof(review_model) = 'object'
      AND review_model ?& ARRAY['provider', 'model', 'runId']::text[]
      AND review_model - ARRAY['provider', 'model', 'runId']::text[] = '{}'::jsonb
      AND octet_length(review_model->>'provider') BETWEEN 1 AND 128
      AND octet_length(review_model->>'model') BETWEEN 1 AND 256
      AND octet_length(review_model->>'runId') BETWEEN 1 AND 256
      AND char_length(operator_authorization_id) BETWEEN 3 AND 128)
  ),
  ADD CONSTRAINT amc_approved_context_solution_v2_provenance CHECK (
    context_schema_version = 'amc-approved-question-context-set-v1'
    OR (candidate_provenance ? 'origin' AND (
      (candidate_provenance->>'origin' = 'source-markdown'
        AND candidate_provenance ?& ARRAY['origin', 'sourcePath', 'sourceSha256']::text[]
        AND candidate_provenance - ARRAY['origin', 'sourcePath', 'sourceSha256']::text[] = '{}'::jsonb
        AND candidate_provenance->>'sourcePath' = source_path
        AND candidate_provenance->>'sourceSha256' = source_sha256)
      OR
      (candidate_provenance->>'origin' = 'operator-original-supplement'
        AND candidate_provenance ?&
          ARRAY['origin', 'supplementId', 'supplementSetHash', 'supplementRecordHash',
            'authorId', 'createdAt', 'rightsStatus', 'rightsAuthorizationId']::text[]
        AND candidate_provenance
          - ARRAY['origin', 'supplementId', 'supplementSetHash', 'supplementRecordHash',
            'authorId', 'createdAt', 'rightsStatus', 'rightsAuthorizationId']::text[] = '{}'::jsonb
        AND artifact_solution_id ~ '^solution-9[0-9]{2}$'
        AND source_path = 'protected-supplements/'
          || (candidate_provenance->>'supplementId') || '.json'
        AND source_sha256 = candidate_provenance->>'supplementRecordHash'
        AND candidate_provenance->>'rightsStatus'
          = 'operator-attested-original-and-authorized-for-ai-use')
    ))
  );

CREATE FUNCTION amc_practice.validate_v2_solution_governance()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  governance jsonb;
  header_schema text;
  header_candidate_schema text;
  authority_id text;
BEGIN
  SELECT schema_version, candidate_schema_version, review_governance, approval_authority_id
    INTO header_schema, header_candidate_schema, governance, authority_id
  FROM amc_practice.approved_context_sets
  WHERE id = NEW.context_set_id;
  IF NOT FOUND OR header_schema <> NEW.context_schema_version THEN
    RAISE EXCEPTION 'approved context solution schema does not match its header';
  END IF;
  IF header_schema = 'amc-approved-question-context-set-v2'
      AND NEW.operator_authorization_id IS DISTINCT FROM
        governance->'operatorAuthorization'->>'authorizationId' THEN
    RAISE EXCEPTION 'v2 solution authorization does not match context governance';
  END IF;
  IF header_schema = 'amc-approved-question-context-set-v2'
      AND (NEW.reviewer_id = authority_id
        OR NEW.reviewer_id = governance->'operatorAuthorization'->>'authorizedBy') THEN
    RAISE EXCEPTION 'v2 reviewer, operator, and receipt authority must be independent';
  END IF;
  IF NEW.candidate_provenance->>'origin' = 'operator-original-supplement'
      AND header_candidate_schema <>
        'amc-question-context-supplemented-archive-candidate-set-v1' THEN
    RAISE EXCEPTION 'supplement provenance requires the supplemented archive candidate schema';
  END IF;
  IF NEW.candidate_provenance->>'origin' = 'operator-original-supplement'
      AND NEW.reviewer_id = NEW.candidate_provenance->>'authorId' THEN
    RAISE EXCEPTION 'v2 supplement reviewer must differ from supplement author';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER amc_validate_v2_solution_governance
  BEFORE INSERT OR UPDATE OF context_set_id, context_schema_version,
    operator_authorization_id, reviewer_id, candidate_provenance
  ON amc_practice.approved_context_solutions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_v2_solution_governance();

-- Context children are assembled only while their header is unsealed. Once
-- the aggregate seals, no child row may be inserted, updated, or deleted.
-- The pin check on INSERT remains as defense in depth for legacy/direct rows.
CREATE OR REPLACE FUNCTION amc_practice.guard_released_context_child()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  context_is_sealed boolean;
  context_is_pinned boolean;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    RAISE EXCEPTION 'approved context content is immutable after insert';
  END IF;
  SELECT sealed INTO context_is_sealed
  FROM amc_practice.approved_context_sets
  WHERE id = NEW.context_set_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'approved context child header is missing';
  END IF;
  IF context_is_sealed THEN
    RAISE EXCEPTION 'sealed approved context content is immutable';
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM amc_practice.open_review_releases release
    WHERE release.context_set_id = NEW.context_set_id
  ) OR EXISTS (
    SELECT 1 FROM amc_practice.learning_submission_versions version
    JOIN amc_practice.learning_submissions submission
      ON submission.id = version.learning_submission_id
    WHERE submission.source_type = 'BATCH_REVIEW'
      AND version.context_set_id = NEW.context_set_id
  ) INTO context_is_pinned;
  IF context_is_pinned THEN
    RAISE EXCEPTION 'review-pinned context content is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER amc_guard_released_context_solution
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.approved_context_solutions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_context_child();

-- A header begins as an invisible unsealed staging row, may seal exactly once
-- after structural child validation, then may only move ACTIVE -> superseded.
CREATE OR REPLACE FUNCTION amc_practice.guard_released_context_set()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  actual_question_count integer;
  invalid_question_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.sealed OR NEW.active OR NEW.superseded_at IS NOT NULL THEN
      RAISE EXCEPTION 'approved context must begin as an unsealed inactive staging row';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'approved context header is immutable after insert';
  END IF;
  IF ROW(NEW.id, NEW.schema_version, NEW.artifact_set_hash,
      NEW.archive_wrapper_set_hash,
      NEW.candidate_schema_version, NEW.candidate_set_hash, NEW.decision_set_hash,
      NEW.approval_authority_id, NEW.approval_receipt_set_hash, NEW.form_id,
      NEW.form_version, NEW.context_content_hash, NEW.release_question_bundle_hash,
      NEW.release_content_hash, NEW.release_manifest_hash, NEW.imported_at,
      NEW.approval_policy_version, NEW.review_schema_version, NEW.review_governance,
      NEW.declared_question_count)
      IS DISTINCT FROM ROW(OLD.id, OLD.schema_version, OLD.artifact_set_hash,
      OLD.archive_wrapper_set_hash,
      OLD.candidate_schema_version, OLD.candidate_set_hash, OLD.decision_set_hash,
      OLD.approval_authority_id, OLD.approval_receipt_set_hash, OLD.form_id,
      OLD.form_version, OLD.context_content_hash, OLD.release_question_bundle_hash,
      OLD.release_content_hash, OLD.release_manifest_hash, OLD.imported_at,
      OLD.approval_policy_version, OLD.review_schema_version, OLD.review_governance,
      OLD.declared_question_count) THEN
    RAISE EXCEPTION 'approved context audit lineage is immutable after import';
  END IF;
  IF OLD.sealed THEN
    IF NOT OLD.active THEN
      RAISE EXCEPTION 'superseded approved context lifecycle is terminal';
    END IF;
    IF NOT NEW.sealed OR NEW.active OR NEW.superseded_at IS NULL
        OR OLD.superseded_at IS NOT NULL OR NEW.superseded_at < OLD.imported_at THEN
      RAISE EXCEPTION 'approved context lifecycle transition is invalid';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT NEW.sealed OR NOT NEW.active OR NEW.superseded_at IS NOT NULL THEN
    RAISE EXCEPTION 'approved context may only transition from staging to sealed active';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM amc_practice.form_revisions revision
    WHERE revision.form_id = NEW.form_id AND revision.version = NEW.form_version
      AND revision.content_sealed
      AND revision.manifest_hash = NEW.release_manifest_hash
      AND revision.content_hash IS NOT DISTINCT FROM NEW.release_content_hash
      AND revision.question_bundle_hash IS NOT DISTINCT FROM NEW.release_question_bundle_hash
  ) THEN
    RAISE EXCEPTION 'approved context seal has stale form lineage';
  END IF;
  SELECT count(*) INTO actual_question_count
  FROM amc_practice.approved_context_questions question
  WHERE question.context_set_id = NEW.id;
  IF actual_question_count <> NEW.declared_question_count THEN
    RAISE EXCEPTION 'approved context seal question count mismatch';
  END IF;
  SELECT count(*) INTO invalid_question_count
  FROM amc_practice.approved_context_questions question
  WHERE question.context_set_id = NEW.id
    AND (
      question.approved_solution_count <> (
        SELECT count(*) FROM amc_practice.approved_context_solutions solution
        WHERE solution.context_set_id = question.context_set_id
          AND solution.question_number = question.question_number
      )
      OR question.model_eligible_solution_count <> (
        SELECT count(*) FROM amc_practice.approved_context_solutions solution
        WHERE solution.context_set_id = question.context_set_id
          AND solution.question_number = question.question_number
          AND solution.model_eligible
      )
      OR 1 <> (
        SELECT min(solution.solution_position)
        FROM amc_practice.approved_context_solutions solution
        WHERE solution.context_set_id = question.context_set_id
          AND solution.question_number = question.question_number
      )
      OR question.approved_solution_count <> (
        SELECT max(solution.solution_position)
        FROM amc_practice.approved_context_solutions solution
        WHERE solution.context_set_id = question.context_set_id
          AND solution.question_number = question.question_number
      )
      OR NOT EXISTS (
        SELECT 1
        FROM amc_practice.form_questions form_question
        WHERE form_question.form_id = question.form_id
          AND form_question.form_version = question.form_version
          AND form_question.question_number = question.question_number
          AND form_question.prompt_markdown = question.prompt_markdown
          AND question.choices = (
            SELECT jsonb_object_agg(choice->>'option', choice->'textMarkdown')
            FROM jsonb_array_elements(form_question.choices) choice
          )
      )
    );
  IF invalid_question_count <> 0 THEN
    RAISE EXCEPTION 'approved context seal child counts are inconsistent';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER amc_guard_released_context_set
  ON amc_practice.approved_context_sets;
CREATE TRIGGER amc_guard_released_context_set
  BEFORE INSERT OR UPDATE OR DELETE ON amc_practice.approved_context_sets
  FOR EACH ROW EXECUTE FUNCTION amc_practice.guard_released_context_set();

-- No runtime/release lineage may pin an unsealed staging aggregate.
CREATE FUNCTION amc_practice.require_sealed_context_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE context_is_sealed boolean;
BEGIN
  IF NEW.context_set_id IS NULL THEN RETURN NEW; END IF;
  SELECT sealed INTO context_is_sealed
  FROM amc_practice.approved_context_sets WHERE id = NEW.context_set_id;
  IF context_is_sealed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'runtime context reference requires a sealed context';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER amc_learning_version_requires_sealed_context
  BEFORE INSERT OR UPDATE OF context_set_id
  ON amc_practice.learning_submission_versions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.require_sealed_context_reference();
CREATE TRIGGER amc_open_review_requires_sealed_context
  BEFORE INSERT OR UPDATE OF context_set_id
  ON amc_practice.open_review_releases
  FOR EACH ROW EXECUTE FUNCTION amc_practice.require_sealed_context_reference();

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
     AND form.content_sealed
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

CREATE OR REPLACE FUNCTION amc_practice.batch_review_context_is_complete(
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
      AND context.active AND context.sealed
      AND revision.content_sealed
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
