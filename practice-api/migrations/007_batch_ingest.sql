-- Batch ingest is a private evidence-acquisition aggregate.  This first
-- migration deliberately binds every batch to an exact owned FINAL learning
-- submission.  A future OPEN_REVIEW migration may add a second entitlement
-- source, but must not weaken this composite FINAL lineage.

ALTER TABLE amc_practice.learning_submissions
  ADD CONSTRAINT amc_learning_submission_batch_lineage_unique
    UNIQUE (id, student_id, attempt_id, form_id, form_version);

CREATE TABLE amc_practice.learning_batches (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES amc_practice.students(id) ON DELETE RESTRICT,
  attempt_id uuid NOT NULL,
  learning_submission_id uuid NOT NULL,
  base_version integer NOT NULL CHECK (base_version >= 1),
  form_id text NOT NULL,
  form_version text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'DRAFT', 'PROCESSING', 'NEEDS_CONFIRMATION', 'COMMITTED', 'FAILED'
  )),
  mapping_revision integer NOT NULL DEFAULT 0 CHECK (mapping_revision >= 0),
  has_audio boolean NOT NULL,
  deletion_state text NOT NULL DEFAULT 'ACTIVE' CHECK (deletion_state IN (
    'ACTIVE', 'DELETE_REQUESTED', 'LOCAL_PURGED', 'PROVIDER_DELETE_PENDING',
    'PROVIDER_RETENTION_PENDING', 'PROVIDER_DELETION_EVIDENCED', 'COMPLETE'
  )),
  deletion_generation integer NOT NULL DEFAULT 0 CHECK (deletion_generation >= 0),
  deleted_at timestamptz,
  submitted_at timestamptz,
  committed_at timestamptz,
  failure_code text CHECK (failure_code IS NULL OR char_length(failure_code) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT amc_learning_batch_final_lineage_fk
  FOREIGN KEY (learning_submission_id, student_id, attempt_id, form_id, form_version)
    REFERENCES amc_practice.learning_submissions(id, student_id, attempt_id, form_id, form_version)
    ON DELETE RESTRICT,
  CONSTRAINT amc_learning_batch_base_version_fk
  FOREIGN KEY (learning_submission_id, base_version)
    REFERENCES amc_practice.learning_submission_versions(learning_submission_id, version_number)
    ON DELETE RESTRICT,
  CONSTRAINT amc_learning_batch_id_student_unique UNIQUE (id, student_id),
  CONSTRAINT amc_learning_batch_id_lineage_unique
    UNIQUE (id, learning_submission_id, form_id, form_version),
  CHECK (
    (deletion_state = 'ACTIVE' AND deleted_at IS NULL)
    OR (deletion_state <> 'ACTIVE' AND deleted_at IS NOT NULL)
  ),
  CHECK ((status = 'DRAFT' AND submitted_at IS NULL) OR (status <> 'DRAFT' AND submitted_at IS NOT NULL)),
  CHECK ((status = 'COMMITTED' AND committed_at IS NOT NULL) OR (status <> 'COMMITTED' AND committed_at IS NULL)),
  CHECK ((status = 'FAILED' AND failure_code IS NOT NULL) OR (status <> 'FAILED' AND failure_code IS NULL))
);
CREATE INDEX amc_learning_batches_student_idx
  ON amc_practice.learning_batches(student_id, created_at DESC);
CREATE INDEX amc_learning_batches_active_idx
  ON amc_practice.learning_batches(student_id, updated_at)
  WHERE deletion_state = 'ACTIVE' AND status NOT IN ('COMMITTED', 'FAILED');

CREATE TABLE amc_practice.learning_batch_assets (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  position smallint NOT NULL CHECK (position BETWEEN 1 AND 10),
  display_name text NOT NULL CHECK (octet_length(display_name) BETWEEN 1 AND 512),
  kind text NOT NULL CHECK (kind IN ('TEXT', 'AUDIO')),
  content_type text NOT NULL CHECK (octet_length(content_type) BETWEEN 1 AND 100),
  declared_bytes bigint NOT NULL CHECK (declared_bytes BETWEEN 1 AND 26214400),
  observed_bytes bigint CHECK (observed_bytes IS NULL OR observed_bytes BETWEEN 1 AND 26214400),
  sha256 char(64) CHECK (sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
  storage_key text UNIQUE CHECK (storage_key IS NULL OR char_length(storage_key) BETWEEN 1 AND 200),
  status text NOT NULL CHECK (status IN (
    'RESERVED', 'WRITING', 'STORED', 'NORMALIZED', 'PURGE_PENDING', 'PURGED', 'REJECTED'
  )),
  upload_attempt_count integer NOT NULL DEFAULT 0 CHECK (upload_attempt_count >= 0),
  upload_idempotency_key text CHECK (
    upload_idempotency_key IS NULL OR char_length(upload_idempotency_key) BETWEEN 8 AND 128
  ),
  writing_started_at timestamptz,
  stored_at timestamptz,
  normalized_at timestamptz,
  purged_at timestamptz,
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (batch_id, position),
  UNIQUE (batch_id, id),
  CHECK (
    (kind = 'TEXT' AND declared_bytes <= 262144 AND content_type IN ('text/plain', 'text/markdown'))
    OR (kind = 'AUDIO' AND declared_bytes <= 26214400
      AND content_type IN ('audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac'))
  ),
  CHECK (
    (status IN ('RESERVED', 'WRITING', 'REJECTED') AND observed_bytes IS NULL AND sha256 IS NULL AND storage_key IS NULL)
    OR (status IN ('STORED', 'NORMALIZED', 'PURGE_PENDING')
      AND observed_bytes = declared_bytes AND sha256 IS NOT NULL AND storage_key IS NOT NULL)
    OR (status = 'PURGED' AND observed_bytes = declared_bytes AND sha256 IS NOT NULL AND storage_key IS NULL)
  ),
  CHECK ((status = 'WRITING' AND writing_started_at IS NOT NULL)
    OR (status <> 'WRITING' AND writing_started_at IS NULL))
);

CREATE TABLE amc_practice.learning_batch_quota_reservations (
  asset_id uuid PRIMARY KEY REFERENCES amc_practice.learning_batch_assets(id) ON DELETE RESTRICT,
  batch_id uuid NOT NULL,
  student_id uuid NOT NULL,
  reserved_bytes bigint NOT NULL CHECK (reserved_bytes BETWEEN 1 AND 26214400),
  status text NOT NULL CHECK (status IN ('RESERVED', 'CONSUMED', 'RELEASED')),
  created_at timestamptz NOT NULL,
  consumed_at timestamptz,
  released_at timestamptz,
  FOREIGN KEY (batch_id, student_id)
    REFERENCES amc_practice.learning_batches(id, student_id) ON DELETE RESTRICT,
  FOREIGN KEY (batch_id, asset_id)
    REFERENCES amc_practice.learning_batch_assets(batch_id, id) ON DELETE RESTRICT,
  CHECK (
    (status = 'RESERVED' AND consumed_at IS NULL AND released_at IS NULL)
    OR (status = 'CONSUMED' AND consumed_at IS NOT NULL AND released_at IS NULL)
    OR (status = 'RELEASED' AND released_at IS NOT NULL)
  )
);
-- The 10-file/100-MiB batch ceiling plus configured per-student/global byte
-- ceilings are aggregate invariants.  API transactions take global/student
-- advisory locks and sum these durable RESERVED/CONSUMED rows; a single-row
-- CHECK cannot prove those cross-row limits.
CREATE INDEX amc_learning_batch_quota_active_idx
  ON amc_practice.learning_batch_quota_reservations(student_id, batch_id)
  WHERE status IN ('RESERVED', 'CONSUMED');

-- Distributed abuse/cost windows are independent from storage reservations:
-- they bound request frequency, newly accepted upload bytes, and provider work
-- across IP addresses and across every API/worker process sharing PostgreSQL.
CREATE TABLE amc_practice.student_resource_budget_windows (
  student_id uuid NOT NULL REFERENCES amc_practice.students(id) ON DELETE RESTRICT,
  budget_kind text NOT NULL CHECK (budget_kind IN (
    'AUTHENTICATED_REQUEST', 'UPLOAD_BYTES', 'PROVIDER_WORK', 'PROVIDER_AUDIO_BYTES'
  )),
  window_started_at timestamptz NOT NULL,
  window_ms integer NOT NULL CHECK (window_ms BETWEEN 1000 AND 604800000),
  used_units bigint NOT NULL CHECK (used_units >= 0),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (student_id, budget_kind, window_started_at)
);
CREATE INDEX amc_student_resource_budget_expiry_idx
  ON amc_practice.student_resource_budget_windows(window_started_at, budget_kind);

CREATE TABLE amc_practice.global_resource_budget_windows (
  budget_kind text NOT NULL CHECK (budget_kind IN (
    'PROVIDER_WORK', 'PROVIDER_AUDIO_BYTES', 'PROVIDER_CLEANUP'
  )),
  window_started_at timestamptz NOT NULL,
  window_ms integer NOT NULL CHECK (window_ms BETWEEN 1000 AND 604800000),
  used_units bigint NOT NULL CHECK (used_units >= 0),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (budget_kind, window_started_at)
);
CREATE INDEX amc_global_resource_budget_expiry_idx
  ON amc_practice.global_resource_budget_windows(window_started_at, budget_kind);

-- Durable least-served scheduling prevents one student's large audio batch
-- from monopolizing every transcription claim across worker processes.
CREATE TABLE amc_practice.student_provider_dispatch_state (
  student_id uuid PRIMARY KEY REFERENCES amc_practice.students(id) ON DELETE RESTRICT,
  transcription_claim_count bigint NOT NULL DEFAULT 0 CHECK (transcription_claim_count >= 0),
  updated_at timestamptz NOT NULL
);

CREATE TABLE amc_practice.learning_batch_evidence (
  asset_id uuid PRIMARY KEY REFERENCES amc_practice.learning_batch_assets(id) ON DELETE RESTRICT,
  batch_id uuid NOT NULL,
  source_kind text NOT NULL CHECK (source_kind IN ('TEXT_UPLOAD', 'AUDIO_TRANSCRIPT')),
  normalized_text text CHECK (normalized_text IS NULL OR octet_length(normalized_text) BETWEEN 1 AND 2097152),
  normalized_sha256 char(64) NOT NULL CHECK (normalized_sha256 ~ '^[0-9a-f]{64}$'),
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms BETWEEN 1 AND 3600000),
  transcript_confidence double precision CHECK (
    transcript_confidence IS NULL OR (transcript_confidence >= 0 AND transcript_confidence <= 1)
  ),
  created_at timestamptz NOT NULL,
  purged_at timestamptz,
  FOREIGN KEY (batch_id, asset_id)
    REFERENCES amc_practice.learning_batch_assets(batch_id, id) ON DELETE RESTRICT,
  CHECK ((normalized_text IS NOT NULL AND purged_at IS NULL)
    OR (normalized_text IS NULL AND purged_at IS NOT NULL)),
  CHECK ((source_kind = 'TEXT_UPLOAD' AND duration_ms IS NULL AND transcript_confidence IS NULL
      AND (normalized_text IS NULL OR octet_length(normalized_text) <= 262144))
    OR (source_kind = 'AUDIO_TRANSCRIPT' AND duration_ms IS NOT NULL))
);

CREATE TABLE amc_practice.learning_batch_provider_artifacts (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL UNIQUE,
  provider text NOT NULL CHECK (provider = 'assemblyai'),
  artifact_type text NOT NULL CHECK (artifact_type = 'TRANSCRIPT'),
  external_id text CHECK (external_id IS NULL OR char_length(external_id) BETWEEN 1 AND 200),
  upload_url_hash char(64) CHECK (upload_url_hash IS NULL OR upload_url_hash ~ '^[0-9a-f]{64}$'),
  submitted_at timestamptz,
  status text NOT NULL CHECK (status IN (
    'INTENT_RECORDED', 'ACTIVE', 'DELETE_PENDING', 'DELETION_EVIDENCED',
    'UPLOAD_MAY_HAVE_DELIVERED', 'UPLOAD_RESPONSE_PERSISTED',
    'SUBMIT_MAY_HAVE_DELIVERED', 'RECONCILE_BLOCKED_MANUAL',
    'PROVIDER_RETENTION_PENDING', 'PROVIDER_RETENTION_DELETION_CONFIRMED'
  )),
  upload_call_id uuid,
  upload_call_started_at timestamptz,
  submit_call_id uuid,
  submit_call_started_at timestamptz,
  reconciliation_attempt_count integer NOT NULL DEFAULT 0 CHECK (reconciliation_attempt_count >= 0),
  last_reconciliation_at timestamptz,
  poll_attempt_count integer NOT NULL DEFAULT 0 CHECK (poll_attempt_count >= 0),
  poll_started_at timestamptz,
  deletion_evidence_code text CHECK (
    deletion_evidence_code IS NULL OR char_length(deletion_evidence_code) BETWEEN 1 AND 100
  ),
  delete_attempt_count integer NOT NULL DEFAULT 0 CHECK (delete_attempt_count >= 0),
  last_delete_attempt_at timestamptz,
  last_delete_error_code text CHECK (
    last_delete_error_code IS NULL OR char_length(last_delete_error_code) BETWEEN 1 AND 100
  ),
  next_delete_attempt_at timestamptz,
  provider_retention_not_before timestamptz,
  retention_profile text CHECK (retention_profile IS NULL OR retention_profile IN (
    'CONFIGURED_TTL', 'BAA_DEFAULT', 'NO_TTL_OR_BAA'
  )),
  retention_policy_delay_ms bigint CHECK (
    retention_policy_delay_ms IS NULL OR retention_policy_delay_ms BETWEEN 3600000 AND 31536000000
  ),
  upload_request_max_duration_ms bigint CHECK (
    upload_request_max_duration_ms IS NULL OR upload_request_max_duration_ms BETWEEN 1000 AND 180000
  ),
  retention_processing_slack_ms bigint CHECK (
    retention_processing_slack_ms IS NULL OR retention_processing_slack_ms BETWEEN 3600000 AND 2592000000
  ),
  retention_window_elapsed_at timestamptz,
  retention_verification_code text CHECK (
    retention_verification_code IS NULL OR char_length(retention_verification_code) BETWEEN 1 AND 100
  ),
  retention_verified_at timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  deletion_evidenced_at timestamptz,
  FOREIGN KEY (batch_id, asset_id)
    REFERENCES amc_practice.learning_batch_assets(batch_id, id) ON DELETE RESTRICT,
  CHECK (
    (status = 'INTENT_RECORDED' AND external_id IS NULL AND upload_call_id IS NULL
      AND submit_call_id IS NULL AND provider_retention_not_before IS NULL
      AND retention_profile IS NULL AND retention_policy_delay_ms IS NULL
      AND upload_request_max_duration_ms IS NULL AND retention_processing_slack_ms IS NULL
      AND retention_window_elapsed_at IS NULL
      AND retention_verification_code IS NULL AND retention_verified_at IS NULL)
    OR (status = 'UPLOAD_MAY_HAVE_DELIVERED' AND external_id IS NULL
      AND upload_call_id IS NOT NULL AND upload_call_started_at IS NOT NULL
      AND upload_url_hash IS NULL AND submit_call_id IS NULL AND provider_retention_not_before IS NOT NULL)
    OR (status = 'UPLOAD_RESPONSE_PERSISTED' AND external_id IS NULL
      AND upload_call_id IS NOT NULL AND upload_call_started_at IS NOT NULL
      AND upload_url_hash IS NOT NULL AND submit_call_id IS NULL AND provider_retention_not_before IS NOT NULL)
    OR (status IN ('SUBMIT_MAY_HAVE_DELIVERED','RECONCILE_BLOCKED_MANUAL') AND external_id IS NULL
      AND upload_call_id IS NOT NULL AND upload_url_hash IS NOT NULL
      AND submit_call_id IS NOT NULL AND submit_call_started_at IS NOT NULL
      AND provider_retention_not_before IS NOT NULL)
    OR (status = 'PROVIDER_RETENTION_PENDING' AND external_id IS NULL
      AND (upload_url_hash IS NOT NULL OR upload_call_id IS NOT NULL)
      AND provider_retention_not_before IS NOT NULL
      AND retention_verification_code IS NULL AND retention_verified_at IS NULL)
    OR (status = 'PROVIDER_RETENTION_DELETION_CONFIRMED' AND external_id IS NULL
      AND (upload_url_hash IS NOT NULL OR upload_call_id IS NOT NULL)
      AND provider_retention_not_before IS NOT NULL AND retention_verification_code IS NOT NULL
      AND retention_window_elapsed_at IS NOT NULL AND retention_verified_at IS NOT NULL)
    OR (status IN ('ACTIVE', 'DELETE_PENDING', 'DELETION_EVIDENCED') AND external_id IS NOT NULL
      AND provider_retention_not_before IS NULL AND retention_verification_code IS NULL AND retention_verified_at IS NULL)
  ),
  CHECK ((provider_retention_not_before IS NULL
      AND retention_profile IS NULL AND retention_policy_delay_ms IS NULL
      AND upload_request_max_duration_ms IS NULL AND retention_processing_slack_ms IS NULL)
    OR (provider_retention_not_before IS NOT NULL
      AND retention_profile IS NOT NULL AND retention_policy_delay_ms IS NOT NULL
      AND upload_request_max_duration_ms IS NOT NULL AND retention_processing_slack_ms IS NOT NULL
      AND provider_retention_not_before = upload_call_started_at
        + (upload_request_max_duration_ms + retention_policy_delay_ms
          + retention_processing_slack_ms) * interval '1 millisecond')),
  CHECK (retention_profile IS NULL
    OR (retention_profile = 'CONFIGURED_TTL' AND retention_policy_delay_ms >= 3600000)
    OR (retention_profile = 'NO_TTL_OR_BAA' AND retention_policy_delay_ms >= 172800000)
    OR (retention_profile = 'BAA_DEFAULT' AND retention_policy_delay_ms >= 259200000)),
  CHECK (retention_window_elapsed_at IS NULL
    OR (provider_retention_not_before IS NOT NULL
      AND retention_window_elapsed_at >= provider_retention_not_before)),
  CHECK ((status = 'PROVIDER_RETENTION_DELETION_CONFIRMED'
      AND retention_verification_code = 'independent-provider-deletion-confirmation'
      AND retention_verified_at IS NOT NULL)
    OR (status <> 'PROVIDER_RETENTION_DELETION_CONFIRMED'
      AND retention_verification_code IS NULL AND retention_verified_at IS NULL)),
  CHECK ((status = 'DELETION_EVIDENCED' AND deletion_evidence_code IS NOT NULL AND deletion_evidenced_at IS NOT NULL)
    OR (status <> 'DELETION_EVIDENCED' AND deletion_evidence_code IS NULL AND deletion_evidenced_at IS NULL)),
  CHECK ((external_id IS NOT NULL AND submitted_at IS NOT NULL)
    OR (external_id IS NULL AND submitted_at IS NULL))
);
CREATE UNIQUE INDEX amc_learning_batch_provider_external_unique
  ON amc_practice.learning_batch_provider_artifacts(provider, external_id)
  WHERE external_id IS NOT NULL;

-- Provider orphans are deliberately append-only and independent from the
-- successful per-asset artifact. One asset may create multiple upload-only
-- orphans across retries. Retention-window elapsed is an attestation that a
-- configured not-before has passed; only a later independent confirmation is
-- deletion evidence.
CREATE TABLE amc_practice.learning_batch_provider_orphan_audit (
  id uuid PRIMARY KEY,
  source_audit_id uuid UNIQUE
    REFERENCES amc_practice.learning_batch_provider_orphan_audit(id) ON DELETE RESTRICT,
  event text NOT NULL CHECK (event IN (
    'PROVIDER_RETENTION_PENDING', 'PROVIDER_RETENTION_WINDOW_ELAPSED',
    'PROVIDER_RETENTION_DELETION_CONFIRMED',
    'UPLOAD_CALL_BOUND_TO_TRANSCRIPT',
    'ORPHAN_TRANSCRIPT_DELETE_PENDING', 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED',
    'LOCAL_AUDIO_ALREADY_ABSENT'
  )),
  provider text NOT NULL CHECK (provider IN ('assemblyai', 'local')),
  batch_id uuid,
  asset_id uuid,
  work_item_id uuid,
  deletion_generation integer NOT NULL CHECK (deletion_generation >= 0),
  provider_call_id uuid,
  external_id text CHECK (external_id IS NULL OR char_length(external_id) BETWEEN 1 AND 200),
  upload_url_hash char(64) CHECK (upload_url_hash IS NULL OR upload_url_hash ~ '^[0-9a-f]{64}$'),
  error_code text CHECK (error_code IS NULL OR char_length(error_code) BETWEEN 1 AND 100),
  retention_not_before timestamptz,
  evidence_code text CHECK (evidence_code IS NULL OR char_length(evidence_code) BETWEEN 1 AND 100),
  verification_authority text CHECK (
    verification_authority IS NULL OR char_length(verification_authority) BETWEEN 3 AND 200
  ),
  verification_reference_hash char(64) CHECK (
    verification_reference_hash IS NULL OR verification_reference_hash ~ '^[0-9a-f]{64}$'
  ),
  created_at timestamptz NOT NULL,
  evidenced_at timestamptz,
  CHECK (external_id IS NOT NULL OR upload_url_hash IS NOT NULL
    OR provider_call_id IS NOT NULL OR provider = 'local'),
  CHECK ((event = 'PROVIDER_RETENTION_DELETION_CONFIRMED'
      AND verification_authority IS NOT NULL AND verification_reference_hash IS NOT NULL)
    OR (event <> 'PROVIDER_RETENTION_DELETION_CONFIRMED'
      AND verification_authority IS NULL AND verification_reference_hash IS NULL)),
  CHECK (source_audit_id IS NULL OR event IN (
    'PROVIDER_RETENTION_WINDOW_ELAPSED', 'PROVIDER_RETENTION_DELETION_CONFIRMED',
    'UPLOAD_CALL_BOUND_TO_TRANSCRIPT',
    'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED'
  )),
  CHECK (
    (event = 'PROVIDER_RETENTION_PENDING' AND source_audit_id IS NULL AND external_id IS NULL
      AND (provider_call_id IS NOT NULL OR upload_url_hash IS NOT NULL)
      AND retention_not_before IS NOT NULL
      AND evidence_code IS NULL AND evidenced_at IS NULL
      AND verification_authority IS NULL AND verification_reference_hash IS NULL)
    OR (event = 'PROVIDER_RETENTION_WINDOW_ELAPSED' AND external_id IS NULL
      AND (provider_call_id IS NOT NULL OR upload_url_hash IS NOT NULL)
      AND retention_not_before IS NOT NULL
      AND evidence_code = 'provider-retention-window-elapsed' AND evidenced_at IS NOT NULL
      AND verification_authority IS NULL AND verification_reference_hash IS NULL)
    OR (event = 'PROVIDER_RETENTION_DELETION_CONFIRMED' AND external_id IS NULL
      AND (provider_call_id IS NOT NULL OR upload_url_hash IS NOT NULL)
      AND retention_not_before IS NOT NULL
      AND evidence_code = 'independent-provider-deletion-confirmation' AND evidenced_at IS NOT NULL
      AND verification_authority IS NOT NULL AND verification_reference_hash IS NOT NULL)
    OR (event = 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT' AND external_id IS NOT NULL
      AND provider_call_id IS NOT NULL AND retention_not_before IS NOT NULL
      AND evidence_code = 'provider-transcript-bound-for-delete' AND evidenced_at IS NOT NULL)
    OR (event = 'ORPHAN_TRANSCRIPT_DELETE_PENDING' AND source_audit_id IS NULL
      AND external_id IS NOT NULL AND upload_url_hash IS NULL AND retention_not_before IS NULL
      AND evidence_code IS NULL AND evidenced_at IS NULL)
    OR (event = 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED' AND external_id IS NOT NULL
      AND upload_url_hash IS NULL AND retention_not_before IS NULL
      AND evidence_code IN ('provider-delete-response','provider-already-absent')
      AND evidenced_at IS NOT NULL)
    OR (event = 'LOCAL_AUDIO_ALREADY_ABSENT' AND provider = 'local' AND source_audit_id IS NULL
      AND external_id IS NULL AND upload_url_hash IS NULL
      AND evidence_code = 'idempotent-local-purge-replay' AND evidenced_at IS NOT NULL)
  )
);
CREATE UNIQUE INDEX amc_learning_batch_provider_orphan_upload_pending_unique
  ON amc_practice.learning_batch_provider_orphan_audit(provider, provider_call_id)
  WHERE event = 'PROVIDER_RETENTION_PENDING';
CREATE UNIQUE INDEX amc_learning_batch_provider_orphan_transcript_pending_unique
  ON amc_practice.learning_batch_provider_orphan_audit(provider, external_id)
  WHERE event = 'ORPHAN_TRANSCRIPT_DELETE_PENDING';
CREATE INDEX amc_learning_batch_provider_orphan_batch_idx
  ON amc_practice.learning_batch_provider_orphan_audit(batch_id, created_at);

CREATE FUNCTION amc_practice.reject_provider_orphan_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'learning_batch_provider_orphan_audit is append-only';
END;
$$;

CREATE TRIGGER amc_learning_batch_provider_orphan_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_batch_provider_orphan_audit
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_provider_orphan_audit_mutation();

CREATE FUNCTION amc_practice.validate_provider_orphan_evidence_source()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  source_event text;
BEGIN
  IF NEW.source_audit_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT event INTO source_event
    FROM amc_practice.learning_batch_provider_orphan_audit
    WHERE id = NEW.source_audit_id;
  IF (NEW.event = 'PROVIDER_RETENTION_WINDOW_ELAPSED'
        AND source_event <> 'PROVIDER_RETENTION_PENDING')
      OR (NEW.event = 'UPLOAD_CALL_BOUND_TO_TRANSCRIPT'
        AND source_event NOT IN ('PROVIDER_RETENTION_PENDING','PROVIDER_RETENTION_WINDOW_ELAPSED'))
      OR (NEW.event = 'PROVIDER_RETENTION_DELETION_CONFIRMED'
        AND source_event <> 'PROVIDER_RETENTION_WINDOW_ELAPSED')
      OR (NEW.event = 'ORPHAN_TRANSCRIPT_DELETION_EVIDENCED'
        AND source_event <> 'ORPHAN_TRANSCRIPT_DELETE_PENDING') THEN
    RAISE EXCEPTION 'provider orphan evidence source event mismatch';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER amc_learning_batch_provider_orphan_evidence_source
  BEFORE INSERT ON amc_practice.learning_batch_provider_orphan_audit
  FOR EACH ROW EXECUTE FUNCTION amc_practice.validate_provider_orphan_evidence_source();

CREATE TABLE amc_practice.learning_batch_provider_orphan_cleanup_jobs (
  id uuid PRIMARY KEY,
  orphan_audit_id uuid NOT NULL UNIQUE
    REFERENCES amc_practice.learning_batch_provider_orphan_audit(id) ON DELETE RESTRICT,
  batch_id uuid REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  cleanup_kind text NOT NULL CHECK (cleanup_kind IN ('DELETE_TRANSCRIPT', 'OBSERVE_RETENTION_WINDOW')),
  provider text NOT NULL CHECK (provider = 'assemblyai'),
  external_id text CHECK (external_id IS NULL OR char_length(external_id) BETWEEN 1 AND 200),
  status text NOT NULL CHECK (status IN (
    'QUEUED', 'RUNNING', 'MANUAL_VERIFICATION_REQUIRED', 'SUCCEEDED', 'SUPERSEDED'
  )),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at timestamptz NOT NULL,
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK ((cleanup_kind = 'DELETE_TRANSCRIPT' AND external_id IS NOT NULL)
    OR (cleanup_kind = 'OBSERVE_RETENTION_WINDOW' AND external_id IS NULL)),
  CHECK ((status = 'RUNNING' AND lease_owner IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR (status <> 'RUNNING' AND lease_owner IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL))
);
CREATE INDEX amc_learning_batch_provider_orphan_cleanup_ready_idx
  ON amc_practice.learning_batch_provider_orphan_cleanup_jobs(available_at, created_at)
  WHERE status = 'QUEUED';

CREATE TABLE amc_practice.private_storage_reconciliation_candidates (
  storage_kind text NOT NULL CHECK (storage_kind IN ('OBJECT', 'PARTIAL')),
  storage_identity text NOT NULL CHECK (char_length(storage_identity) BETWEEN 1 AND 220),
  observed_size bigint NOT NULL CHECK (observed_size >= 0),
  observed_mtime_ms double precision NOT NULL CHECK (observed_mtime_ms >= 0),
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  observation_count integer NOT NULL CHECK (observation_count >= 1),
  status text NOT NULL CHECK (status IN ('OBSERVED', 'DELETING', 'DELETED')),
  deletion_token uuid,
  deletion_authorized_at timestamptz,
  deleted_at timestamptz,
  PRIMARY KEY (storage_kind, storage_identity),
  CHECK ((status = 'OBSERVED' AND deletion_token IS NULL AND deletion_authorized_at IS NULL AND deleted_at IS NULL)
    OR (status = 'DELETING' AND deletion_token IS NOT NULL AND deletion_authorized_at IS NOT NULL AND deleted_at IS NULL)
    OR (status = 'DELETED' AND deletion_token IS NOT NULL AND deletion_authorized_at IS NOT NULL AND deleted_at IS NOT NULL))
);

CREATE TABLE amc_practice.private_storage_reconciliation_events (
  id uuid PRIMARY KEY,
  storage_kind text NOT NULL CHECK (storage_kind IN ('OBJECT', 'PARTIAL')),
  storage_identity text NOT NULL CHECK (char_length(storage_identity) BETWEEN 1 AND 220),
  event text NOT NULL CHECK (event IN ('ORPHAN_DELETED', 'DELETE_TARGET_CHANGED')),
  observed_size bigint NOT NULL CHECK (observed_size >= 0),
  observed_mtime_ms double precision NOT NULL CHECK (observed_mtime_ms >= 0),
  occurred_at timestamptz NOT NULL
);

CREATE TABLE amc_practice.learning_batch_mapping_revisions (
  batch_id uuid NOT NULL REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  revision integer NOT NULL CHECK (revision >= 1),
  schema_version text NOT NULL CHECK (schema_version = 'amc-batch-decomposition-v1'),
  evidence_set_hash char(64) NOT NULL CHECK (evidence_set_hash ~ '^[0-9a-f]{64}$'),
  master_plan_hash char(64) NOT NULL CHECK (master_plan_hash ~ '^[0-9a-f]{64}$'),
  chunk_input_hashes jsonb NOT NULL CHECK (jsonb_typeof(chunk_input_hashes) = 'array'),
  gateway_run_metadata jsonb NOT NULL CHECK (jsonb_typeof(gateway_run_metadata) = 'array'),
  extraction_hash char(64) NOT NULL CHECK (extraction_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('NEEDS_CONFIRMATION', 'COMMITTED')),
  created_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  PRIMARY KEY (batch_id, revision),
  CHECK ((status = 'COMMITTED' AND confirmed_at IS NOT NULL) OR status <> 'COMMITTED')
);

CREATE TABLE amc_practice.learning_batch_mapping_items (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL,
  mapping_revision integer NOT NULL,
  item_position smallint NOT NULL CHECK (item_position BETWEEN 1 AND 100),
  item_key text NOT NULL CHECK (char_length(item_key) BETWEEN 1 AND 96),
  candidate_question_numbers jsonb NOT NULL,
  proposed_question_number smallint CHECK (proposed_question_number IS NULL OR proposed_question_number BETWEEN 1 AND 100),
  selected_option char(1) CHECK (selected_option IS NULL OR selected_option IN ('A', 'B', 'C', 'D', 'E')),
  reasoning_summary text CHECK (reasoning_summary IS NULL OR octet_length(reasoning_summary) <= 1200),
  evidence_text text CHECK (evidence_text IS NULL OR octet_length(evidence_text) BETWEEN 1 AND 20971520),
  confidence double precision NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  ambiguity text NOT NULL CHECK (ambiguity IN (
    'NONE', 'QUESTION_MAPPING', 'ANSWER_CONFLICT', 'TRANSCRIPTION_UNCERTAINTY'
  )),
  source_spans jsonb NOT NULL,
  gateway_conflict_flags jsonb NOT NULL,
  requires_confirmation boolean NOT NULL,
  confirmation_reasons jsonb NOT NULL,
  unmapped boolean NOT NULL,
  purged_at timestamptz,
  created_at timestamptz NOT NULL,
  UNIQUE (batch_id, mapping_revision, item_position),
  UNIQUE (batch_id, mapping_revision, item_key),
  FOREIGN KEY (batch_id, mapping_revision)
    REFERENCES amc_practice.learning_batch_mapping_revisions(batch_id, revision) ON DELETE RESTRICT,
  CHECK ((evidence_text IS NOT NULL AND purged_at IS NULL)
    OR (evidence_text IS NULL AND purged_at IS NOT NULL))
);

CREATE TABLE amc_practice.learning_batch_work_items (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  asset_id uuid,
  work_type text NOT NULL CHECK (work_type IN ('TRANSCRIBE_AUDIO', 'BATCH_EXTRACTION', 'PURGE_LOCAL_ASSET')),
  status text NOT NULL CHECK (status IN (
    'BLOCKED_DEPENDENCY', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'
  )),
  priority smallint NOT NULL CHECK (priority BETWEEN 0 AND 100),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  input_hash char(64) NOT NULL CHECK (input_hash ~ '^[0-9a-f]{64}$'),
  deletion_generation integer NOT NULL CHECK (deletion_generation >= 0),
  available_at timestamptz NOT NULL,
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (batch_id, asset_id, work_type),
  FOREIGN KEY (batch_id, asset_id)
    REFERENCES amc_practice.learning_batch_assets(batch_id, id) ON DELETE RESTRICT,
  CHECK (
    (status = 'RUNNING' AND lease_owner IS NOT NULL AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR (status <> 'RUNNING' AND lease_owner IS NULL AND lease_token IS NULL AND lease_expires_at IS NULL)
  ),
  CHECK ((work_type IN ('TRANSCRIBE_AUDIO', 'PURGE_LOCAL_ASSET') AND asset_id IS NOT NULL)
    OR (work_type = 'BATCH_EXTRACTION' AND asset_id IS NULL))
);
CREATE UNIQUE INDEX amc_learning_batch_one_extraction_work_idx
  ON amc_practice.learning_batch_work_items(batch_id, work_type)
  WHERE work_type = 'BATCH_EXTRACTION';
CREATE INDEX amc_learning_batch_work_ready_idx
  ON amc_practice.learning_batch_work_items(priority DESC, available_at, created_at)
  WHERE status = 'QUEUED';

ALTER TABLE amc_practice.learning_submission_versions
  ALTER COLUMN answers_revision DROP NOT NULL,
  ALTER COLUMN reasoning_revision DROP NOT NULL,
  DROP CONSTRAINT learning_submission_versions_creation_reason_check,
  ADD COLUMN batch_id uuid,
  ADD CONSTRAINT amc_learning_version_batch_lineage_fk
  FOREIGN KEY (batch_id, learning_submission_id, form_id, form_version)
    REFERENCES amc_practice.learning_batches(id, learning_submission_id, form_id, form_version)
    ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_version_creation_reason_check CHECK (
    (creation_reason IN ('FINAL_COMMIT', 'BACKFILL') AND batch_id IS NULL
      AND answers_revision IS NOT NULL AND reasoning_revision IS NOT NULL)
    OR (creation_reason = 'BATCH_COMMIT' AND batch_id IS NOT NULL
      AND answers_revision IS NULL AND reasoning_revision IS NULL)
  ),
  ADD CONSTRAINT amc_learning_version_batch_lineage_unique
    UNIQUE (id, learning_submission_id, version_number, batch_id),
  ADD CONSTRAINT amc_learning_version_id_batch_unique UNIQUE (id, batch_id);

ALTER TABLE amc_practice.learning_batches
  ADD COLUMN committed_version_id uuid,
  ADD COLUMN committed_version_number integer CHECK (committed_version_number IS NULL OR committed_version_number >= 1),
  ADD CONSTRAINT amc_learning_batch_committed_version_fk
  FOREIGN KEY (committed_version_id, learning_submission_id, committed_version_number, id)
    REFERENCES amc_practice.learning_submission_versions(id, learning_submission_id, version_number, batch_id)
    ON DELETE RESTRICT,
  ADD CONSTRAINT amc_learning_batch_committed_fields_check CHECK (
    (status = 'COMMITTED' AND committed_version_id IS NOT NULL AND committed_version_number IS NOT NULL)
    OR (status <> 'COMMITTED' AND committed_version_id IS NULL AND committed_version_number IS NULL)
  );

ALTER TABLE amc_practice.learning_question_responses
  DROP CONSTRAINT learning_question_responses_answer_origin_check,
  DROP CONSTRAINT learning_question_responses_reasoning_origin_check,
  ADD CONSTRAINT amc_learning_response_answer_origin_check
    CHECK (answer_origin IN ('OFFICIAL_FINAL', 'BATCH_CONFIRMED')),
  ADD CONSTRAINT amc_learning_response_reasoning_origin_check
    CHECK (reasoning_origin IN (
      'DURING_ATTEMPT', 'NONE', 'BATCH_CONFIRMED_EVIDENCE', 'BATCH_CONFIRMATION_EDIT'
    ));

CREATE TABLE amc_practice.learning_batch_confirmation_revisions (
  batch_id uuid NOT NULL,
  mapping_revision integer NOT NULL,
  learning_submission_version_id uuid NOT NULL UNIQUE,
  source_evidence_hash char(64) NOT NULL CHECK (source_evidence_hash ~ '^[0-9a-f]{64}$'),
  confirmed_at timestamptz NOT NULL,
  PRIMARY KEY (batch_id, mapping_revision),
  FOREIGN KEY (batch_id, mapping_revision)
    REFERENCES amc_practice.learning_batch_mapping_revisions(batch_id, revision) ON DELETE RESTRICT,
  FOREIGN KEY (learning_submission_version_id, batch_id)
    REFERENCES amc_practice.learning_submission_versions(id, batch_id) ON DELETE RESTRICT
);

CREATE TABLE amc_practice.learning_batch_confirmation_responses (
  batch_id uuid NOT NULL,
  mapping_revision integer NOT NULL,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  selected_option char(1) CHECK (selected_option IS NULL OR selected_option IN ('A','B','C','D','E')),
  confirmed_reasoning_text text NOT NULL CHECK (octet_length(confirmed_reasoning_text) <= 8000),
  confirmed_reasoning_hash char(64) NOT NULL CHECK (confirmed_reasoning_hash ~ '^[0-9a-f]{64}$'),
  reasoning_origin text NOT NULL CHECK (
    reasoning_origin IN ('BATCH_CONFIRMED_EVIDENCE', 'BATCH_CONFIRMATION_EDIT')
  ),
  canonical_source_item_ids jsonb NOT NULL CHECK (
    jsonb_typeof(canonical_source_item_ids) = 'array' AND jsonb_array_length(canonical_source_item_ids) >= 1
  ),
  source_descriptors jsonb NOT NULL CHECK (
    jsonb_typeof(source_descriptors) = 'array' AND jsonb_array_length(source_descriptors) >= 1
  ),
  reconstructed_source_text text NOT NULL CHECK (octet_length(reconstructed_source_text) BETWEEN 1 AND 20971520),
  source_span_hash char(64) NOT NULL CHECK (source_span_hash ~ '^[0-9a-f]{64}$'),
  source_evidence_hash char(64) NOT NULL CHECK (source_evidence_hash ~ '^[0-9a-f]{64}$'),
  PRIMARY KEY (batch_id, mapping_revision, question_number),
  CHECK (jsonb_array_length(canonical_source_item_ids) = jsonb_array_length(source_descriptors)),
  FOREIGN KEY (batch_id, mapping_revision)
    REFERENCES amc_practice.learning_batch_confirmation_revisions(batch_id, mapping_revision)
    ON DELETE RESTRICT
);

CREATE FUNCTION amc_practice.reject_batch_confirmation_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'learning batch confirmations are append-only';
END;
$$;

CREATE TRIGGER amc_learning_batch_confirmation_revision_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_batch_confirmation_revisions
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_batch_confirmation_mutation();
CREATE TRIGGER amc_learning_batch_confirmation_response_append_only
  BEFORE UPDATE OR DELETE ON amc_practice.learning_batch_confirmation_responses
  FOR EACH ROW EXECUTE FUNCTION amc_practice.reject_batch_confirmation_mutation();

CREATE TABLE amc_practice.learning_batch_results (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL UNIQUE REFERENCES amc_practice.learning_batches(id) ON DELETE RESTRICT,
  learning_submission_version_id uuid NOT NULL UNIQUE
    REFERENCES amc_practice.learning_submission_versions(id) ON DELETE RESTRICT,
  scoring_scope text NOT NULL CHECK (scoring_scope = 'MAPPED_QUESTIONS_ONLY'),
  scoring_policy jsonb NOT NULL,
  total_points numeric(12,4) NOT NULL,
  maximum_points numeric(12,4) NOT NULL,
  mapped_question_count smallint NOT NULL CHECK (mapped_question_count BETWEEN 1 AND 100),
  answered_count smallint NOT NULL CHECK (answered_count >= 0),
  correct_count smallint NOT NULL CHECK (correct_count >= 0),
  incorrect_count smallint NOT NULL CHECK (incorrect_count >= 0),
  blank_count smallint NOT NULL CHECK (blank_count >= 0),
  unscored_count smallint NOT NULL CHECK (unscored_count >= 0),
  created_at timestamptz NOT NULL,
  CONSTRAINT amc_learning_batch_result_version_fk
  FOREIGN KEY (learning_submission_version_id, batch_id)
    REFERENCES amc_practice.learning_submission_versions(id, batch_id) ON DELETE RESTRICT
);

CREATE TABLE amc_practice.learning_batch_result_items (
  batch_result_id uuid NOT NULL REFERENCES amc_practice.learning_batch_results(id) ON DELETE RESTRICT,
  question_number smallint NOT NULL CHECK (question_number BETWEEN 1 AND 100),
  selected_option char(1) CHECK (selected_option IS NULL OR selected_option IN ('A', 'B', 'C', 'D', 'E')),
  correct_option char(1) CHECK (correct_option IS NULL OR correct_option IN ('A', 'B', 'C', 'D', 'E')),
  accepted_options jsonb NOT NULL,
  is_scored boolean NOT NULL,
  is_correct boolean,
  points numeric(12,4) NOT NULL,
  PRIMARY KEY (batch_result_id, question_number),
  CHECK ((is_scored AND correct_option IS NOT NULL AND ((selected_option IS NULL AND is_correct IS NULL)
      OR (selected_option IS NOT NULL AND is_correct IS NOT NULL)))
    OR (NOT is_scored AND is_correct IS NULL))
);
