CREATE INDEX IF NOT EXISTS amc_learning_submissions_history_page_idx
  ON amc_practice.learning_submissions(student_id, updated_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS amc_learning_batches_submission_activity_idx
  ON amc_practice.learning_batches(learning_submission_id, updated_at DESC);
