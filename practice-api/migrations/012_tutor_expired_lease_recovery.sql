-- Migration 011 is immutable once recorded. Replace only the Tutor job guard
-- so an expired, never-or-known-not-delivered attempt can reach the bounded
-- ATTEMPTS_EXHAUSTED terminal state without authorizing a stale worker result.

CREATE OR REPLACE FUNCTION amc_practice.guard_tutor_job_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW.thread_id, NEW.student_id, NEW.request_message_id,
      NEW.request_message_role, NEW.request_ordinal, NEW.turn_number, NEW.retry_of_job_id,
      NEW.retry_authorization,
      NEW.authorized_session_id, NEW.idempotency_key_hash, NEW.request_hash,
      NEW.correlation_id, NEW.snapshot_hash, NEW.context_hash, NEW.history_hash,
      NEW.input_hash, NEW.thread_lineage_hash, NEW.tutor_contract_version,
      NEW.priority, NEW.max_attempts, NEW.deletion_generation, NEW.created_at)
    IS DISTINCT FROM ROW(OLD.id, OLD.thread_id, OLD.student_id, OLD.request_message_id,
      OLD.request_message_role, OLD.request_ordinal, OLD.turn_number, OLD.retry_of_job_id,
      OLD.retry_authorization,
      OLD.authorized_session_id, OLD.idempotency_key_hash, OLD.request_hash,
      OLD.correlation_id, OLD.snapshot_hash, OLD.context_hash, OLD.history_hash,
      OLD.input_hash, OLD.thread_lineage_hash, OLD.tutor_contract_version,
      OLD.priority, OLD.max_attempts, OLD.deletion_generation, OLD.created_at) THEN
    RAISE EXCEPTION 'Tutor turn job identity is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status IN ('SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED') THEN
    RAISE EXCEPTION 'Terminal Tutor turn job is immutable' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'RUNNING' AND OLD.lease_expires_at <= clock_timestamp()
      AND (
        NEW.status IN ('RUNNING', 'SUCCEEDED')
        OR (NEW.status = 'FAILED' AND NOT (
          NEW.outcome_code = 'ATTEMPTS_EXHAUSTED'
          AND NEW.error_class = 'transient' AND NOT NEW.retryable
          AND NEW.provider_invoked = OLD.provider_invoked
          AND NEW.delivery_disposition = OLD.delivery_disposition
          AND ((NOT OLD.provider_invoked AND OLD.delivery_disposition = 'NOT_DISPATCHED')
            OR (OLD.provider_invoked AND OLD.delivery_disposition = 'KNOWN_NO_RESULT'))
          AND NEW.lease_owner IS NULL AND NEW.lease_token IS NULL
          AND NEW.lease_expires_at IS NULL AND NEW.completed_at IS NOT NULL
        ))
      ) THEN
    RAISE EXCEPTION 'Expired Tutor lease permits only bounded safe recovery'
      USING ERRCODE = '55000';
  END IF;
  IF NEW.updated_at < OLD.updated_at THEN
    RAISE EXCEPTION 'Tutor turn job time cannot move backwards' USING ERRCODE = '55000';
  END IF;
  PERFORM 1 FROM amc_practice.learning_tutor_threads
  WHERE id = NEW.thread_id AND student_id = NEW.student_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor job thread is missing' USING ERRCODE = '55000';
  END IF;
  IF NEW.status IN ('RUNNING', 'SUCCEEDED') THEN
    PERFORM 1 FROM amc_practice.sessions session
    WHERE session.id = NEW.authorized_session_id AND session.student_id = NEW.student_id
      AND session.revoked_at IS NULL AND session.expires_at > clock_timestamp()
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tutor claim, dispatch, and success require a live session'
        USING ERRCODE = '55000';
    END IF;
  END IF;
  IF NEW.status IN ('RUNNING', 'SUCCEEDED') AND NOT EXISTS (
    SELECT 1
    FROM amc_practice.learning_tutor_threads thread
    WHERE thread.id = NEW.thread_id AND thread.student_id = NEW.student_id
      AND thread.status IN ('OPEN', 'CAPACITY_REACHED')
      AND thread.deletion_generation = NEW.deletion_generation
      AND amc_practice.tutor_source_generation_is_live(
        thread.learning_submission_id, thread.learning_submission_version_id,
        thread.student_id, thread.deletion_generation)
  ) THEN
    RAISE EXCEPTION 'Tutor claim, dispatch, and success require live authorization'
      USING ERRCODE = '55000';
  END IF;
  IF OLD.status IN ('QUEUED', 'RETRY_WAIT') AND NEW.status = 'RUNNING' THEN
    IF NEW.attempt_count <> OLD.attempt_count + 1
        OR OLD.available_at > clock_timestamp() THEN
      RAISE EXCEPTION 'Tutor claim must increment attempt count' USING ERRCODE = '55000';
    END IF;
    IF NEW.provider_invoked OR NEW.delivery_disposition <> 'NOT_DISPATCHED'
        OR NEW.retryable OR NEW.completed_at IS NOT NULL OR NEW.outcome_code IS NOT NULL
        OR NEW.error_class IS NOT NULL OR NEW.provider IS NOT NULL
        OR NEW.requested_model IS NOT NULL OR NEW.response_model IS NOT NULL
        OR NEW.prompt_version IS NOT NULL OR NEW.response_schema_version IS NOT NULL
        OR NEW.usage IS NOT NULL OR NEW.latency_ms IS NOT NULL THEN
      RAISE EXCEPTION 'Tutor claim must start a clean provider attempt' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'QUEUED' AND NEW.status = 'CANCELLED' THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor cancellation cannot change attempt count' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'RETRY_WAIT' AND NEW.status = 'CANCELLED' THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor cancellation cannot change attempt count' USING ERRCODE = '55000';
    END IF;
  ELSIF OLD.status = 'RUNNING' AND NEW.status IN (
      'RUNNING', 'RETRY_WAIT', 'SUCCEEDED', 'FAILED', 'DELIVERY_UNKNOWN', 'CANCELLED') THEN
    IF NEW.attempt_count <> OLD.attempt_count THEN
      RAISE EXCEPTION 'Tutor attempt count changes only on claim' USING ERRCODE = '55000';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid Tutor turn job status transition' USING ERRCODE = '55000';
  END IF;
  IF OLD.status = 'RUNNING' THEN
    IF NOT (
      (NOT OLD.provider_invoked AND OLD.delivery_disposition = 'NOT_DISPATCHED'
        AND ((NOT NEW.provider_invoked AND NEW.delivery_disposition = 'NOT_DISPATCHED')
          OR (NEW.provider_invoked AND NEW.delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED')))
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'MAY_HAVE_BEEN_DELIVERED'
        AND NEW.provider_invoked AND NEW.delivery_disposition IN (
          'MAY_HAVE_BEEN_DELIVERED', 'KNOWN_NO_RESULT', 'DELIVERED_RESULT'))
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'KNOWN_NO_RESULT'
        AND NEW.provider_invoked AND NEW.delivery_disposition = 'KNOWN_NO_RESULT')
      OR (OLD.provider_invoked AND OLD.delivery_disposition = 'DELIVERED_RESULT'
        AND NEW.provider_invoked AND NEW.delivery_disposition = 'DELIVERED_RESULT')
    ) THEN
      RAISE EXCEPTION 'Invalid Tutor delivery transition' USING ERRCODE = '55000';
    END IF;
    IF NOT OLD.provider_invoked AND OLD.delivery_disposition = 'NOT_DISPATCHED'
        AND NEW.provider_invoked AND NEW.status <> 'RUNNING' THEN
      RAISE EXCEPTION 'Tutor dispatch intent must commit before any terminal transition'
        USING ERRCODE = '55000';
    END IF;
    IF NEW.status = 'DELIVERY_UNKNOWN'
        AND (NOT OLD.provider_invoked
          OR OLD.delivery_disposition <> 'MAY_HAVE_BEEN_DELIVERED') THEN
      RAISE EXCEPTION 'Tutor unknown delivery requires a previously persisted dispatch intent'
        USING ERRCODE = '55000';
    END IF;
    IF NEW.status = 'SUCCEEDED'
        AND (NOT OLD.provider_invoked
          OR OLD.delivery_disposition <> 'MAY_HAVE_BEEN_DELIVERED') THEN
      RAISE EXCEPTION 'Tutor success requires a previously persisted dispatch intent'
        USING ERRCODE = '55000';
    END IF;
  END IF;
  IF OLD.status = 'RUNNING' AND NEW.status = 'RUNNING' THEN
    IF NEW.lease_owner IS DISTINCT FROM OLD.lease_owner
        OR NEW.lease_token IS DISTINCT FROM OLD.lease_token
        OR NEW.lease_expires_at < OLD.lease_expires_at THEN
      RAISE EXCEPTION 'Tutor running lease identity is immutable' USING ERRCODE = '55000';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
