-- A public catalog must never expose two versions of the same logical form.
-- Older application code performed "publish new, then retire old", which
-- could leave two rows published when two release workers raced. First repair
-- any legacy duplicate deterministically, then make the invariant database
-- enforced. The import path takes ordered transaction advisory locks as well,
-- so ordinary concurrent imports serialize instead of relying on this index
-- to reject one after partially doing work.
--
-- This migration may run while an older API worker is still draining. Hold a
-- DML-conflicting table lock through both the repair and index creation so an
-- old "publish then retire" transaction cannot introduce a fresh duplicate
-- between those two statements.
LOCK TABLE amc_practice.form_revisions IN SHARE ROW EXCLUSIVE MODE;

WITH ranked_published_revisions AS (
  SELECT
    form_id,
    version,
    row_number() OVER (
      PARTITION BY form_id
      ORDER BY published_at DESC NULLS LAST, imported_at DESC, version DESC
    ) AS publication_rank
  FROM amc_practice.form_revisions
  WHERE published = true
)
UPDATE amc_practice.form_revisions AS revision
SET published = false
FROM ranked_published_revisions AS ranked
WHERE revision.form_id = ranked.form_id
  AND revision.version = ranked.version
  AND ranked.publication_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS amc_one_published_form_revision_idx
  ON amc_practice.form_revisions(form_id)
  WHERE published = true;
