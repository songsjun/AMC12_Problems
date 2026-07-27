-- Safe for an instance which received the initial schema before pipeline
-- provenance support was added. Fresh instances receive these in 001 too.
ALTER TABLE amc_practice.form_revisions
  ADD COLUMN IF NOT EXISTS publication_status text,
  ADD COLUMN IF NOT EXISTS source_schema_version text,
  ADD COLUMN IF NOT EXISTS source_manifest_hash char(64),
  ADD COLUMN IF NOT EXISTS content_hash char(64),
  ADD COLUMN IF NOT EXISTS question_bundle_hash char(64),
  ADD COLUMN IF NOT EXISTS provenance jsonb;

ALTER TABLE amc_practice.attempts
  ADD COLUMN IF NOT EXISTS state_revision bigint NOT NULL DEFAULT 0
    CHECK (state_revision >= 0);
