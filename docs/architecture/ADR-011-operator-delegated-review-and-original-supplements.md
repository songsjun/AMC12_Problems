# ADR-011: Record operator-delegated AI-assisted review honestly

## Status

Accepted

## Context

ADR-003 introduced a deliberately strict human-review v1 contract. The
operator has now delegated solution review to Codex. Treating that work as
human review would make the audit record false, even if the mathematical
review were careful. Some exact archive questions also have fewer than two
usable text-only solution candidates. Editing the released Markdown to add a
solution would change the published source/release identity and blur rights
provenance.

The relevant threats are false reviewer attribution, model/version ambiguity,
prompt-injected source text influencing authority, stale approval after a stem
repair, self-authorization by the reviewer, and a supplemental solution being
smuggled directly into model context without candidate review.

## Decision

Keep `amc-explicit-human-solution-approval-v1` and all v1 schemas byte- and
behavior-compatible. Add a parallel policy,
`amc-operator-delegated-ai-assisted-solution-approval-v1`, represented by the
v2 review and compiled-context schemas.

Every v2 decision records:

- `reviewMethod: operator-delegated-ai-assisted`;
- the reviewer identity and UTC review time;
- exact provider, model, and run identity;
- a binding to an operator authorization that states the review scope and the
  operator's separate rights attestation (the model does not attest rights);
- exact candidate provenance, body/source hashes, candidate-set hash, exact
  form revision, and question number.

The complete operator authorization is retained in the decision set and the
compiled artifact, and is part of every v2 decision-hash projection. Each
compiled solution repeats the method, model/run, reviewer, authorization id,
and provenance. No v2 artifact is described as human-approved. The v1 receipt
schema remains the independent allowlist boundary: a decision still needs
exactly one active receipt for its exact decision hash. Review code cannot mint
a receipt or infer approval. Binding the complete authorization prevents an
attacker from changing `authorizedBy`, time, scope, statement, or rights
attestation while retaining an existing receipt. A compiled v2 artifact is not
self-authenticating: both the Python validator and the API importer require the
separately protected receipt set and match its authority, set hash, active
decision hash, and embedded receipt projection.

The authorizing operator, mathematical reviewer, and receipt authority are
pairwise-distinct identities. A supplement's recorded author is additionally
ineligible to act as the mathematical reviewer for that same supplemental
solution. These separation checks remain semantic runtime requirements because
portable JSON Schema cannot compare values across those nested records.

An exact stem/choice repair changes the question context hash and enclosing
candidate-set hash. Consequently all prior decisions fail their candidate-set
binding; no approval or receipt is inherited by a repaired question.

Original supplemental solutions use a separate protected input,
`amc-original-solution-supplement-set-v1`. Each record binds:

- the original archive candidate-set hash and release source hash;
- exact form id/version and release `questionBundleHash`, `contentHash`, and
  `manifestHash`;
- question content hash, supplement body hash, and record hash;
- an operator-commissioned-original author identity, creation time, explicit
  rights attestation, and rights-authorization id.

The supplement file is read with the same descriptor-safe, owner-only input
rules as decisions and receipts. Composition emits
`amc-question-context-supplemented-archive-candidate-set-v1`, whose hash covers
the complete base candidate set and complete supplement set. Supplements are
assigned the reserved `solution-9NN` candidate range and remain `candidate`.
They enter approved context only through a v2 decision with matching explicit
supplement provenance and an independent active authority receipt; the
supplement author cannot supply that mathematical review.

Published form/source hashes are preserved as release bindings; composition
does not edit or republish a form. The eventual API importer must explicitly
add v2 schema support before these artifacts are production-importable. Until
then, fail closed rather than down-convert v2 to human-v1.

## Alternatives considered

1. Reuse human-v1 and put `ai-assisted` in `methodTags`. Rejected because the
   root audience, policy name, schema title, and disclaimer would still assert
   human review, and model/operator authorization would not be hash-required.
2. Let the approval authority accept a model output directly. Rejected because
   it collapses reviewer and authority trust domains and creates automatic
   approval in practice.
3. Append supplemental text to released problem Markdown. Rejected because it
   changes source hashes, obscures original authorship/rights, and couples
   model-context coverage to the student-facing form release.
4. Store a supplement next to an approved artifact without including it in the
   candidate hash. Rejected because removal or replacement would not invalidate
   decisions.

## Consequences

- Audit records state what actually happened and retain model/run lineage.
- Existing human-v1 inputs and outputs remain valid and strict; v2 fields are
  rejected as unknown in v1.
- Operator authorization and rights attestation are evidence, not proof that a
  mathematical claim is correct or that a rights claim is legally sufficient.
- The receipt allowlist is still not a digital signature. Distinct deployment
  identity and protected provisioning remain required.
- Supplements increase candidate coverage without changing a published form,
  but require a new composed candidate hash and fresh review/receipt work.
- A single compromised model can still make correlated mathematical mistakes;
  high-impact or ambiguous items should receive an independent second review.
