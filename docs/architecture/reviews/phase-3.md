# Phase 3 review: approved context and post-submission learning reports

## Scope

This stage turns an interactive FINAL learning snapshot into an asynchronous,
per-question learning report. It adds an explicitly reviewed multi-solution
context artifact, a protected importer, durable PostgreSQL analysis work, an
isolated tool-free inference boundary, and a read-only owner report UI. It does
not add batch upload, transcription, or tutor chat; those remain later phases.

Official scoring remains deterministic and commits before any provider work.
Missing, visually incomplete, revoked, or insufficiently approved context
produces an unavailable/unassessable learning state and zero provider calls.

## Verification evidence

- `practice-content`: 106 tests passed, 0 failed. Structural mutation fuzz ran
  4,614 nested JSON mutations with zero validator exceptions.
- The 48-form archive scan covered 5,043 question/solution items. The
  fail-closed visual detector marked 151 questions and 397 solutions, with zero
  misses/extras against the independent image/Asymptote marker oracle. The
  former false-ready witnesses, 2002A question 23 and 2007A question 6, are now
  unavailable to the text-only model.
- `practice-api` against a newly created PostgreSQL 17.9 database: 65 tests
  passed, 0 failed, 0 skipped. The temporary verification databases were
  removed after the runs.
- `practice/npm run verify`: syntax/lint passed; 35 tests passed, 0 failed.
- Isolated AMC inference Gateway: TypeScript check passed; 41 tests passed.
  Its maximum valid, worst-escaped eight-solution fixture serialized to 383,300
  bytes below the fixed 524,288-byte minimum request envelope.
- Legacy Gateway regression evidence: typecheck passed and 57 tests passed.
  Production dependency audits for the API and isolated Gateway reported zero
  known vulnerabilities. `git diff --check` passed in both repositories.

The database suite proves migration replay, immutable release/approval/
authority lineage, owner/form/version bindings, `SKIP LOCKED` claims, lease
reclamation, stale-writer rejection, bounded retry, exact 25-question outcome
coverage, reset-history reads, and unchanged official scores.

## Independent review

The first review rejected the content boundary because plain hashes and
reviewer identifiers were forgeable, malformed children could crash validators,
production artifacts could omit release hashes, and renderer-safety rules made
hundreds of real source fields incompatible with model input. The repair adds
an external protected approval-receipt TCB, exact decision hashes, separate
production/test-only schemas, total validators, and a deliberate split between
bounded quoted model input and restricted renderable output.

Further adversarial review found valid field combinations larger than the
Gateway's original 64 KiB body limit, malformed Unicode and invalid UTC dates,
and 391 visual solutions missed through Asymptote or ordinary AoPS image links.
The final contract rejects disallowed controls/unpaired surrogates and invalid
calendar timestamps, fixes the body envelope at a proved bounded minimum, and
keeps fenced Asymptote, raw/wiki images, linked image targets, and image
reference definitions unavailable without reviewed visual context. Python and
JavaScript now consume the same 23-case visual-reference parity corpus.

The final concurrency review found that a stale process could write through a
reclaimed lease when two processes shared the same configured worker ID. Every
claim now receives a persisted random lease token; heartbeat, retry, and
completion fence on the exact token as well as owner, expiry, and immutable
lineage. A same-worker-ID regression proves that the old token cannot perform
any of those writes. The review also corrected transport classification:
connection refusal and response-stream interruption are transient and use the
bounded retry path, while size, UTF-8, JSON, and protocol violations remain
permanent. Final architecture/security disposition: **APPROVE** for the Phase
3 code boundary, with no remaining blocker or high finding.

## Reflection

Integrity hashes are not authorization. The receipt set is intentionally an
operations trust boundary, not a signature scheme: the compiler can prove
internal consistency, while the production importer must independently load an
owner-only receipt file and a deployment authority allowlist. If approvals ever
cross an untrusted administrative boundary, this TCB must be replaced by a
cryptographic signature/KMS verification flow.

Input safety and output safety are different concerns. Source and student text
may legitimately contain Markdown, HTML-like text, links, or TeX; treating all
of it as forbidden renderer content broke real archive compatibility. The
isolated Gateway instead quotes bounded input as data, exposes no tools,
filesystem, shell, or arbitrary endpoint, and validates model output against a
stricter inactive Markdown/TeX profile before the API validates it again.

A text-only model must not guess at diagrams. Failing closed excludes a
material part of the archive today, but is more honest than comparing reasoning
against invisible Asymptote or image links. A later vision path requires
separately reviewed, hash-bound visual descriptions or image inputs; it must not
silently reinterpret these artifacts.

Retries currently replay the whole submission after one transient question
failure. Attempts are bounded and stale-write safe, but successful provider
calls may repeat. Per-question retry checkpoints are a future efficiency
improvement. Production enablement also remains blocked on real human approval
receipts, provider data-governance verification, a live canary, credential
rotation, and measured model-quality thresholds; fixture success is not proof
of pedagogical quality.
