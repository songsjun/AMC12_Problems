CREATE TABLE amc_practice.ai_dispatch_fairness_state (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  last_claimed_kind text CHECK (last_claimed_kind IN (
    'INTERACTIVE_ANALYSIS', 'BATCH_EXTRACTION'
  )),
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at timestamptz NOT NULL
);

INSERT INTO amc_practice.ai_dispatch_fairness_state
  (singleton, last_claimed_kind, revision, updated_at)
VALUES (true, NULL, 0, now())
ON CONFLICT (singleton) DO NOTHING;

COMMENT ON TABLE amc_practice.ai_dispatch_fairness_state IS
  'Singleton durable class cursor used under the amc_ai_dispatcher advisory lock; eligible analysis and batch claims alternate across worker processes.';
