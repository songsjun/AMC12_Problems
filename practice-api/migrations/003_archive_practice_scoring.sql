-- Archive practice releases can faithfully preserve two historical edge cases:
-- a documented unscored item and a documented set of accepted options.  The
-- original single-answer columns stay canonical for ordinary AMC forms.
ALTER TABLE amc_practice.form_questions
  ADD COLUMN IF NOT EXISTS is_scored boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accepted_options jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE amc_practice.form_questions
  ALTER COLUMN correct_option DROP NOT NULL;

UPDATE amc_practice.form_questions
SET accepted_options = jsonb_build_array(correct_option)
WHERE is_scored = true
  AND correct_option IS NOT NULL
  AND accepted_options = '[]'::jsonb;

ALTER TABLE amc_practice.submissions
  ADD COLUMN IF NOT EXISTS unscored_count smallint NOT NULL DEFAULT 0
    CHECK (unscored_count >= 0);

ALTER TABLE amc_practice.submission_answers
  ADD COLUMN IF NOT EXISTS is_scored boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accepted_options jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE amc_practice.submission_answers
  ALTER COLUMN correct_option DROP NOT NULL;

UPDATE amc_practice.submission_answers
SET accepted_options = jsonb_build_array(correct_option)
WHERE is_scored = true
  AND correct_option IS NOT NULL
  AND accepted_options = '[]'::jsonb;
