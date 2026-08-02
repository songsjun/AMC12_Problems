-- Analysis contract v2 is a drained maintenance-window cutover. A RUNNING row may already have
-- crossed the v1 provider boundary, so relabelling it would destroy the exact
-- contract needed to interpret its result. Operators must stop workers and
-- every old API process that can write analysis runs/work, then allow or
-- explicitly resolve every active analysis lease before migration.
-- The lock closes the check/use race with a concurrent old worker claim. It is
-- not a substitute for stopping old API/worker binaries before the migration.
LOCK TABLE amc_practice.learning_work_items, amc_practice.learning_analysis_runs
  IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM amc_practice.learning_analysis_runs WHERE status = 'RUNNING'
  ) OR EXISTS (
    SELECT 1 FROM amc_practice.learning_work_items
    WHERE work_type = 'ANALYZE_SUBMISSION' AND status = 'RUNNING'
  ) THEN
    RAISE EXCEPTION 'analysis contract v2 migration requires all analysis work to be drained'
      USING ERRCODE = '55006';
  END IF;
END
$$;

-- This immutable predicate is shared by every authoritative scoring snapshot.
-- It intentionally accepts only the two canonical forms:
--   scored   => canonical A-E, 1..5 unique A-E options in A-E order, containing canonical
--   unscored => null canonical and an empty option array
CREATE OR REPLACE FUNCTION amc_practice.valid_amc_scoring(
  scored boolean,
  canonical_answer text,
  accepted jsonb
) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  candidate text;
  previous_position integer := 0;
  candidate_position integer;
  canonical_seen boolean := false;
BEGIN
  IF scored IS NULL OR accepted IS NULL OR jsonb_typeof(accepted) <> 'array' THEN
    RETURN false;
  END IF;
  IF NOT scored THEN
    RETURN canonical_answer IS NULL AND accepted = '[]'::jsonb;
  END IF;
  IF canonical_answer IS NULL OR canonical_answer !~ '^[A-E]$'
      OR jsonb_array_length(accepted) NOT BETWEEN 1 AND 5 THEN
    RETURN false;
  END IF;
  FOR candidate IN SELECT value FROM jsonb_array_elements_text(accepted)
  LOOP
    IF candidate IS NULL OR candidate !~ '^[A-E]$' THEN
      RETURN false;
    END IF;
    candidate_position := strpos('ABCDE', candidate);
    IF candidate_position <= previous_position THEN
      RETURN false;
    END IF;
    previous_position := candidate_position;
    canonical_seen := canonical_seen OR candidate = canonical_answer;
  END LOOP;
  RETURN canonical_seen;
END
$$;

ALTER TABLE amc_practice.form_questions
  ADD CONSTRAINT amc_form_question_scoring_v2_check
  CHECK (amc_practice.valid_amc_scoring(is_scored, correct_option::text, accepted_options))
  NOT VALID;
ALTER TABLE amc_practice.form_questions
  VALIDATE CONSTRAINT amc_form_question_scoring_v2_check;

ALTER TABLE amc_practice.submission_answers
  ADD CONSTRAINT amc_submission_answer_scoring_v2_check
  CHECK (
    amc_practice.valid_amc_scoring(is_scored, correct_option::text, accepted_options)
    AND (
      (is_scored AND (
        (selected_option IS NULL AND is_correct IS NULL)
        OR (selected_option IS NOT NULL AND is_correct IS NOT NULL
          AND is_correct = (accepted_options ? selected_option::text))
      ))
      OR (NOT is_scored AND is_correct IS NULL AND points = 0)
    )
  ) NOT VALID;
ALTER TABLE amc_practice.submission_answers
  VALIDATE CONSTRAINT amc_submission_answer_scoring_v2_check;

ALTER TABLE amc_practice.learning_batch_result_items
  ADD CONSTRAINT amc_batch_result_item_scoring_v2_check
  CHECK (
    amc_practice.valid_amc_scoring(is_scored, correct_option::text, accepted_options)
    AND (
      (is_scored AND (
        (selected_option IS NULL AND is_correct IS NULL)
        OR (selected_option IS NOT NULL AND is_correct IS NOT NULL
          AND is_correct = (accepted_options ? selected_option::text))
      ))
      OR (NOT is_scored AND is_correct IS NULL AND points = 0)
    )
  ) NOT VALID;
ALTER TABLE amc_practice.learning_batch_result_items
  VALIDATE CONSTRAINT amc_batch_result_item_scoring_v2_check;

-- These are the post-submission authorities read at claim and immediately
-- before provider dispatch. Keep the exact rows append-only so authorization
-- cannot race a mutable answer key or result item.
CREATE FUNCTION amc_practice.reject_analysis_scoring_snapshot_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'analysis scoring snapshots are append-only'
    USING ERRCODE = '55000';
END
$$;

CREATE TRIGGER amc_submission_answers_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.submission_answers
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_analysis_scoring_snapshot_mutation();

CREATE TRIGGER amc_learning_batch_results_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_batch_results
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_analysis_scoring_snapshot_mutation();

CREATE TRIGGER amc_learning_batch_result_items_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_batch_result_items
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_analysis_scoring_snapshot_mutation();

ALTER TABLE amc_practice.learning_analysis_runs
  ADD COLUMN analysis_contract_version text;

UPDATE amc_practice.learning_analysis_runs
SET analysis_contract_version = CASE
  WHEN status = 'QUEUED' THEN 'amc-analysis-contract-v2'
  ELSE 'amc-analysis-contract-v1'
END;

ALTER TABLE amc_practice.learning_analysis_runs
  ALTER COLUMN analysis_contract_version SET DEFAULT 'amc-analysis-contract-v2',
  ALTER COLUMN analysis_contract_version SET NOT NULL,
  ADD CONSTRAINT amc_analysis_run_contract_version_check
    CHECK (analysis_contract_version IN ('amc-analysis-contract-v1', 'amc-analysis-contract-v2'));
