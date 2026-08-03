# Operator-delegated AI-assisted approved context → API import contract

This document is the handoff for adding v2 support to
`practice-api/src/learning-review/artifact.js`, MemoryStore, PostgreSQLStore,
and a new forward-only migration. It does not authorize a loose import. V1
must remain strict and unchanged; v2 is a separate allowlisted branch.

## Identity matrix

| Role | Human v1 | Operator-delegated AI-assisted v2 |
| --- | --- | --- |
| Single production set | `amc-approved-question-context-set-v1` | `amc-approved-question-context-set-v2` |
| Archive wrapper | `amc-approved-question-context-archive-set-v1` | `amc-approved-question-context-archive-set-v2` |
| Synthetic/non-production | `amc-approved-question-context-test-set-v1` | `amc-approved-question-context-test-set-v2` |
| Approval policy | `amc-explicit-human-solution-approval-v1` | `amc-operator-delegated-ai-assisted-solution-approval-v1` |
| Review decision schema | `amc-question-context-review-decisions-v1` | `amc-question-context-review-decisions-v2` |
| Candidate schemas | source/archive v1 | source/archive v1, or `amc-question-context-supplemented-archive-candidate-set-v1` |
| Receipt schema | `amc-solution-approval-receipt-set-v1` | unchanged v1 receipt schema |

Both test schemas and either `private-test-only` audience remain rejected in
production.

## V2-only strict fields

Every v2 single set and archive wrapper adds exactly:

```json
{
  "reviewGovernance": {
    "reviewMethod": "operator-delegated-ai-assisted",
    "operatorAuthorization": {
      "authorizationId": "opaque-id",
      "authorizedBy": "opaque-operator-id",
      "authorizedAt": "RFC3339 UTC",
      "scope": "solution-correctness-pedagogy-and-rights-review",
      "statement": "operator-delegates-ai-assisted-solution-review",
      "rightsAttestation": "operator-attests-rights-for-reviewed-source-ai-use"
    }
  }
}
```

`reviewDecisionBinding.schemaVersion` is v2. Each v2 approved solution adds
`candidateProvenance` and adds three fields to `approval`:

```json
{
  "candidateProvenance": {
    "origin": "source-markdown",
    "sourcePath": "safe/relative/path.md",
    "sourceSha256": "sha256"
  },
  "approval": {
    "reviewMethod": "operator-delegated-ai-assisted",
    "reviewModel": {
      "provider": "provider-id",
      "model": "model-id",
      "runId": "opaque-review-run-id"
    },
    "operatorAuthorizationId": "opaque-id"
  }
}
```

Supplement provenance is the alternative strict shape:

```json
{
  "origin": "operator-original-supplement",
  "supplementId": "supplement-...",
  "supplementSetHash": "sha256",
  "supplementRecordHash": "sha256",
  "authorId": "opaque-id",
  "createdAt": "RFC3339 UTC",
  "rightsStatus": "operator-attested-original-and-authorized-for-ai-use",
  "rightsAuthorizationId": "opaque-id"
}
```

Its `solutionId` must use `solution-9NN`; its logical `sourceRef` must be
`protected-supplements/<supplementId>.json` with SHA-256 equal to
`supplementRecordHash`. A source-Markdown provenance must match the ordinary
solution source path/hash and that source must still match the question.

The v2 canonical decision projection is the v1 projection plus, in this exact
key/value semantics:

- `reviewMethod`;
- complete `reviewModel`;
- `operatorAuthorizationId`;
- complete root `operatorAuthorization` (projected from review governance, not
  duplicated as a decision-record field);
- complete `candidateProvenance`;
- `questionContentHash`.

The importer must recompute that projection before looking up the trusted
receipt. The embedded receipt must exactly match one active receipt from the
separately loaded trusted receipt set. In v2, receipt `authorityId` must differ
from every `reviewerId` and from `operatorAuthorization.authorizedBy`; every
`reviewerId` must also differ from `operatorAuthorization.authorizedBy`.
For supplement provenance, `reviewerId` must additionally differ from
`candidateProvenance.authorId`. These are semantic runtime checks rather than
portable JSON Schema assertions because they compare nested values.
The compiled v2 artifact is not self-authenticating: its validator/importer
must require the separately protected receipt set, verify the root
`receiptSetHash` and authority binding, and find exactly one active external
receipt for every recomputed decision hash. Recomputing artifact hashes cannot
replace that external authority check.

## `artifact.js` changes

Implement two explicit validators or a policy descriptor selected only after
an exact schema/policy/audience tuple match. Do not make the v1 strict-key
lists accept optional v2 fields.

The v2 branch must additionally verify:

1. wrapper and every child have identical `reviewGovernance`, authority
   binding, decision-set hash, candidate-set hash, and release lineage;
2. complete operator authorization, authorization id, method, model/run,
   reviewer, question content hash, and provenance participate in
   `decisionRecordHash`;
3. a supplemental source follows the reserved id/path/hash rules above;
4. source provenance and `sourceRef` agree;
5. candidate schema `supplemented-archive...-v1` is legal only for v2 archive;
6. existing text/visual/count/readiness/hash checks remain identical;
7. v2 test artifacts fail before receipt/import work;
8. unknown keys, mixed v1/v2 fields, policy/schema swaps, authorization/model
   tampering, reviewer/operator/authority identity reuse, supplement
   author/reviewer identity reuse, and wrapper/child drift fail closed.

## Persistence changes

Migration 006 currently constrains `approved_context_sets.schema_version` to
single-set v1 and `candidate_schema_version` to the two original candidates.
A forward-only migration must replace those checks with explicit allowlists
that add single-set v2 and the supplemented archive candidate. Archive wrapper
schemas are not stored in `schema_version`; `archive_wrapper_set_hash` remains
the wrapper lineage.

Do not discard v2 audit fields. Add immutable columns (names may follow local
convention, semantics may not):

### `approved_context_sets`

- `approval_policy_version text NOT NULL`;
- `review_schema_version text NOT NULL`;
- `review_governance jsonb` (null only for v1; exact v2 object for v2).

### `approved_context_solutions`

- `candidate_provenance jsonb` (null only for v1; exact v2 object for v2);
- `review_method text` (null only for v1; exact v2 constant for v2);
- `review_model jsonb` (null only for v1; exact provider/model/run object for
  v2);
- `operator_authorization_id text` (null only for v1; must equal the context
  set governance authorization id for v2).

Use a named table constraint to keep each row wholly v1 or wholly v2; never
allow a partial mixture. Existing immutability triggers from migrations 008
and 014 must include every new header/solution lineage field. PostgreSQL import
must insert the new values, and `loadApprovedContextSet` must return them so
worker/tutor snapshots do not erase provenance. MemoryStore must preserve the
same projection.

The app validator remains the semantic/hash authority; PostgreSQL adds shape,
non-null pairing, enum, and length checks. JSONB alone is not sufficient
validation.

## Required acceptance tests before enabling v2 import

- all current v1 artifact/import/Memory/PostgreSQL tests remain byte/behavior
  compatible;
- a real v2 archive wrapper imports in MemoryStore and PostgreSQLStore and
  round-trips every governance/provenance field;
- v2 test-only, mixed-policy, unknown-field, altered model/run,
  altered authorization, stale question hash, forged supplement provenance,
  reused reviewer/authority id, missing/revoked/duplicate receipt, and
  wrapper/child drift cases are rejected in both stores;
- importing the same artifact is idempotent; a different wrapper binding still
  conflicts as today;
- rollback keeps the old binary compatible with v1 rows. Do not deploy the
  migration until the new binary can read both v1 and v2 rows; do not deploy v2
  artifacts until migration and binary are both active.
