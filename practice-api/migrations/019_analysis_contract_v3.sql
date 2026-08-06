-- Contract v3 adds explicit answer-only analysis without changing the frozen
-- v2 wire semantics. Existing v2 work is not relabelled: v3 workers are dual
-- stack and authorize each provider call against the run's durable contract.
-- The default advances to v3 so an omitted value cannot silently create new
-- v2 semantics. Both current and rollback binaries explicitly write their
-- contract version, and the widened allowlist therefore keeps a v2 rollback
-- able to enqueue and drain v2 work without relabelling any durable row.
ALTER TABLE amc_practice.learning_analysis_runs
  DROP CONSTRAINT amc_analysis_run_contract_version_check,
  ALTER COLUMN analysis_contract_version SET DEFAULT 'amc-analysis-contract-v3',
  ADD CONSTRAINT amc_analysis_run_contract_version_check
    CHECK (analysis_contract_version IN (
      'amc-analysis-contract-v1', 'amc-analysis-contract-v2', 'amc-analysis-contract-v3'
    ));

-- Tutor snapshots preserve the exact analysis contract of their source run,
-- including new v3 reports and historical v1/v2 reports.
ALTER TABLE amc_practice.learning_tutor_snapshots
  DROP CONSTRAINT learning_tutor_snapshots_analysis_contract_version_check,
  ADD CONSTRAINT learning_tutor_snapshots_analysis_contract_version_check
    CHECK (analysis_contract_version IN (
      'amc-analysis-contract-v1', 'amc-analysis-contract-v2', 'amc-analysis-contract-v3'
    ));
