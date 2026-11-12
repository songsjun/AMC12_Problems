# AMC practice-content pipeline

This directory is the content release gate for the online AMC practice
experience.  It deliberately treats the existing AoPS-derived Markdown as
**unreviewed source material**, not as an answer key or a publishable exam.

The pipeline produces two different artifacts:

| Artifact | Contains | Safe audience |
| --- | --- | --- |
| `public-form.json` | prompts, choices, and public content hash | authenticated exam client before final submission |
| `private-form.json` | the exact backend-import contract, including source references, `correctOption`, and the currently released first-solution `solutionMarkdown` | server-side importer only; never static-host or send before final submission |

An additional, isolated `build-question-context` command produces private
**review artifacts** containing all structurally identified written solution
candidates. It does not change either manifest above, and its output has no
`approved` state. Obvious title warnings such as `cheese`, `fakesolve`,
`does not actually work`, and `worst` are quarantined automatically; every
other solution remains only a candidate until one supported explicit review
policy and an independent approval authority authorize it in a later
content-governance step. Human review v1 and operator-delegated AI-assisted
review v2 are separate contracts and must never be mislabeled as each other.

The private artifact has the compatibility fields expected by the AMC backend:

```json
{
  "id": "amc12-2025-a",
  "version": "1",
  "title": "2025 AMC 12A",
  "durationSeconds": 4500,
  "scoringPolicyVersion": "amc12-2025-practice-v1",
  "scoringPolicy": {"correct": 6, "blank": 1.5, "incorrect": 0},
  "questions": [{
    "number": 1,
    "promptMarkdown": "...",
    "choices": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
    "correctOption": "A",
    "solutionMarkdown": "..."
  }]
}
```

`sourceRef`, `publicationStatus`, integrity hashes, provenance, and schema
version are additive fields.  Importers must preserve the required fields and
may use the additive fields for auditing.

`id` is the stable form identity and `version` is its immutable content
revision. The backend must key exam-form history by `(id, version)`; never
replace the contents of an existing pair. A content, answer-key, or scoring
change gets a new `version`, not an overwritten import.

## Safety and release rules

1. **Never derive `correctOption` from a community solution.** The parser only
   reports answer-looking text as an explicitly unverified review signal.
2. A build requires a separately supplied
   `amc-practice-approved-answer-key-v1` JSON document with an explicit
   approval record (including two distinct reviewers) and a `questionBundleHash` matching the parsed prompts and
   choices. It cannot silently use the source Markdown.
   Real `forms/*/approved-answer-key.json` files are deliberately ignored by
   Git; keep them in a protected release/import environment rather than this
   static-content checkout. The checked-in fixture key is synthetic only.
3. Builds fail on anything other than exactly 25 A–E questions, missing
   solutions, source-path/hash problems, or an unrendered required image/diagram.
4. The importer must reject manifests with `publicationStatus: "test-only"` or
   `isSynthetic: true` unless its own explicit development-only flag is set.
   That check belongs in the importer as a second gate; the CLI requires
   `--allow-test-only` for such a build as well.
5. Serve only `public-form.json` before a student has finalized an attempt.
   `private-form.json`, raw Markdown URLs, answer keys, and solutions belong in
   private storage/API paths only.
6. Score values must be finite numbers from 0 through 1000 with at most four
   decimal places. The builder rejects `NaN`, infinity, and over-precise values
   before hashing, and canonicalizes integral floats such as `6.0` to `6` so
   Python and the Node importer calculate identical artifact hashes.

The scoring policy bundled in the test fixture is versioned and deliberately
limited to that fixture/pilot: correct = 6, blank = 1.5, incorrect = 0. Do not
reuse it for another historical form without an explicit content review.

## Historical archive-practice release

The checked-in 2002–2025 AMC 12 collection has a deliberately separate
`archive-practice` release path. It is for online practice, not an assertion of
an official contest result. Its inputs are all auditable and are kept out of
the public/static path before an attempt is final:

- `historical-answer-keys.json` is the 48-form answer-letter catalog, with a
  source and canonical answer-key URL for each form. The corresponding first
  written solution is preserved for post-submission reading and used as a
  cross-check/review signal. When that first solution has an explicit final
  boxed option, the archive build requires it to agree with the catalog (and
  records aggregate cross-check counts in the private release report). An
  answer-looking phrase alone is never silently treated as a trustworthy key.
- `historical-overrides.json` contains the narrowly scoped repairs for damaged
  source conversions, each with its reason and source evidence.
- `media/historical/media-manifest.json` pins every required prompt visual to
  a verified, same-origin file under `../historical-media/assets/`. It covers
  both timed prompts and post-final first solutions; no remote image or
  Asymptote source is allowed into either emitted scope.

One adapted 2025 AMC 12A item (Question 25) has no safely matchable option in
the historical record. It remains readable in the form but is explicitly
unscored; that form's maximum is therefore 144 rather than 150.

Archive scores also retain the contest-era blank-answer rule: 2002--2006
forms award 2.5 points for a blank, while 2007--2025 forms award 1.5 points.
The generated policy version is saved with every submission, rather than being
recomputed from a current UI default.

Build an archive release only after the media verifier succeeds:

```sh
cd AMC12_Problems/practice-content

PYTHONPATH=. python3 -m amc_content.cli build-archive \
  --source-root .. \
  --answer-keys historical-answer-keys.json \
  --overrides historical-overrides.json \
  --media-manifest media/historical/media-manifest.json \
  --release-version archive-YYYY-MM-DD-rN \
  --public-output-dir generated/historical/public \
  --private-output-dir generated/historical/private \
  --private-batch-output generated/historical/private-release.json \
  --report-output generated/historical/report.json
```

The generated batch is private input for the dedicated API importer; do not
put it under the static site root. The public projection has no answer letters
or solutions.

## Layout

The 2026 AMC 12A addition extends the collection to 49 forms. Its original
AoPS revision sources, all community solution sections, video links, and local
diagrams are saved in `../2026_AMC_12A_Problems/`. The practice API keeps its
existing post-final first-solution projection. The public archive contains the
complete source solutions.

The release validator accepts either the complete legacy 48-form collection
or that exact collection plus 2026A. The addition can use a new version and
key/media provenance while the existing 48 immutable revisions stay intact.
Do not replace those revisions with a newly rebuilt common version merely to
add the new paper; existing attempts and approved contexts bind their hashes.

`media/ingest_aops_snapshot.py` converts a saved MediaWiki revision API response
without rewriting mathematics. It emits isolated diagram-renderer jobs and
keeps every solution before the source navigation footer. The source manifest
records the exact page revisions and hashes.

```text
amc_content/             Standard-library parser, validator, and CLI
historical-*.json        Auditable archive answer catalog and source repairs
media/historical/        Checked-in verified media manifest (private build input)
../historical-media/     Same-origin static mirrors used by archive prompts
forms/2025-amc-12a/      Non-publishable source catalog and answer-key template
fixtures/synthetic-25/   Fully approved, explicitly synthetic test-only fixture
schema/                  JSON Schema contracts for public/private/key artifacts
reports/                 Checked-in source-quality review reports
tests/                   Unit and integration tests
```

The storage/API adapter contract is in [BACKEND_IMPORT_CONTRACT.md](BACKEND_IMPORT_CONTRACT.md).
It bridges this canonical `durationSeconds`/`publicationStatus`/`correct`
format to the API's `durationMs`/`published`/`correctPoints` fields without
changing content semantics.
The separate [V2_APPROVED_CONTEXT_IMPORT_CONTRACT.md](V2_APPROVED_CONTEXT_IMPORT_CONTRACT.md)
lists the fail-closed API validator, Memory/PostgreSQL projection, and migration
work required before operator-delegated AI-assisted v2 artifacts can be imported.

The source paths in a source form are relative to the `AMC12_Problems`
repository root, not to this directory.

## Commands

All commands use only Python's standard library.

```sh
cd AMC12_Problems/practice-content

# Inspect source without an answer key. This is the first command for a new form.
python3 -m amc_content.cli review \
  --form forms/2025-amc-12a/source-form.json \
  --source-root .. \
  --json-output reports/2025-amc-12a-source-review.json \
  --markdown-output reports/2025-amc-12a-source-review.md

# Rebuild and validate the synthetic integration fixture.
python3 -m amc_content.cli build \
  --form fixtures/synthetic-25/source-form.json \
  --answer-key fixtures/synthetic-25/approved-answer-key.json \
  --source-root . \
  --public-output /tmp/amc-public.json \
  --private-output /tmp/amc-private.json \
  --allow-test-only

python3 -m unittest discover -s tests -v
```

Build a single-question candidate context under a dedicated private root. The
root must already exist, have mode `0700`, be disjoint from the source tree,
and must not be a symlink:

```sh
install -d -m 700 /var/tmp/amc-private-context

python3 -m amc_content.cli build-question-context \
  --source-file ../2025_AMC_12A_Problems/Problem_01.md \
  --question-number 1 \
  --source-root .. \
  --private-output-root /var/tmp/amc-private-context \
  --json-output /var/tmp/amc-private-context/amc-q1-context.json \
  --markdown-output /var/tmp/amc-private-context/amc-q1-context.md
```

Use `--form forms/2025-amc-12a/source-form.json` instead of
`--source-file/--question-number` to build a complete form candidate set. The
command refuses source-tree/public-like output roots, group/world permission
bits, symlinks, and existing outputs. Replacing both outputs requires an
explicit `--replace`. To create a reproducible inventory bound to all 48 exact
published archive revisions (including released prompt overrides and mirrored
media), use `--archive-private-release generated/historical/private-release.json`.
These artifacts must remain private and cannot be used as student AI context
before a separate review records explicit approvals. JSON is authoritative;
the companion Markdown renders all community/source text inside collision-safe
literal fences so HTML, images, headings, and fake review markers stay inert.

## Explicit human approval for AI context

Candidate extraction never approves content. As of this release, production
has **0 approved solutions** and therefore **0 context-ready questions**. The
compiler has no automatic-approval mode: a separately authored
`amc-question-context-review-decisions-v1` document can select a solution only
when a separately provisioned approval authority also supplies exactly one
active receipt for that decision.

Every decision binds the approval policy, candidate schema/set hash, exact form
id/version, question number, `solutionId`, `bodySha256`, and source
path/SHA-256. It also records an opaque `reviewerId`, UTC `reviewedAt`,
`rightsStatus` fixed to `approved-for-ai-use`, explicit `qualityFlags`, and
`methodTags`. Its `decisionRecordHash` is the canonical hash of that complete
projection. Unknown, duplicate, quarantined, stale, partially bound, or
locally rewritten decisions fail the complete build.

The receipt input has schema `amc-solution-approval-receipt-set-v1` and audience
`private-approval-authority-allowlist`. Each receipt binds the externally
issued `receiptId`, `authorityId`, exact `decisionRecordHash`, issue time, and
active/revoked state. A decision is accepted only when the supplied trusted set
contains exactly one receipt for its hash and that receipt is active; an
active-plus-revoked pair is rejected rather than interpreted by ordering. The
compiled root binds `authorityId` and `receiptSetHash`, and every solution
retains the active receipt identity. Omitting a solution means it is not
approved.

Compile decisions only into an existing, non-symlink private root with mode
`0700`:

```sh
install -d -m 700 /var/tmp/amc-approved-context

python3 -m amc_content.cli compile-approved-question-context \
  --candidate-set /protected/review/archive-candidates.json \
  --review-decisions /protected/review/human-decisions.json \
  --approval-receipts /protected/authority/approval-receipts.json \
  --private-output-root /var/tmp/amc-approved-context \
  --json-output /var/tmp/amc-approved-context/approved.json \
  --markdown-output /var/tmp/amc-approved-context/approved.md
```

All three compiler inputs are security-sensitive. Each must be a regular file
owned by the effective uid with no group/world permission bits, in an immediate
parent directory with the same owner/permission restrictions, and outside this
repository and public/static roots. The descriptor-safe reader rejects
symlinks and FIFOs, reads the inode it opened (not a later path replacement),
and enforces a 64 MiB maximum both from `fstat` and while streaming. The private
output root likewise must be an existing owner-controlled `0700` directory.

These receipts are an allowlist boundary, not a digital-signature scheme. In a
real deployment, generate and provision the receipt set under a distinct
approval-authority/service identity; do not let the content checkout or build
job author it. The production API importer must independently load its trusted
receipt allowlist from protected configuration and compare the compiled
`authorityId`, `receiptSetHash`, receipt identity/status, and decision hash.
Hash recomputation alone proves integrity, not who authorized the receipt.

For a single-form candidate, the JSON output is
`amc-approved-question-context-set-v1`. For the production 48-form archive,
the decisions file explicitly selects one or more exact form revisions and the
output is `amc-approved-question-context-archive-set-v1`, whose `forms` are
individually importable single-form approved sets. Each archive form preserves
the release `questionBundleHash`, `contentHash`, and `manifestHash`; the wrapper
also binds the exact archive candidate `setHash` and release source hash.

A question is `contextReady: true` only with at least two explicit approvals;
zero or one produces `status: unavailable` and an exact approved count. A
prompt/choice containing a Markdown image, raw HTML/SVG image, TeX
`includegraphics`, fenced Asymptote (` ```asy ` / ` ~~~asy `), `[asy]`,
`\begin{asy}`, image-extension link/reference target, or AoPS/wiki
`File:`/`Image:` link is conservatively marked `visualContext.required: true`
and unavailable to the text-only model.
An approved solution with such a reference remains auditable but is marked
`modelEligibility.eligible: false` and does not count toward the two-solution
threshold. Model-bound text is also checked by UTF-8 byte length, not character
count: prompt 16,384 bytes; each choice 2,048; solution title 256; solution body
16,384; and at most eight approved solutions. The schemas annotate these
enforced limits with `x-maxUtf8Bytes`. Disallowed controls and malformed
Unicode (including replacement characters and unpaired surrogates) are
rejected before hashing. These limits match the inference gateway, preventing
a compiler-approved ready context from failing gateway request validation. The
artifact copies prompt and A–E choices byte-for-byte but deliberately has no
`correctOption`, accepted-answer list, or answer-key field. The companion
Markdown is for private inspection only and renders every supplied Markdown
string inside a collision-safe literal fence.

The checked-in `fixtures/synthetic-25/question-context-review-decisions.empty.json`
and `solution-approval-receipts.empty.json` are a deterministic test-only pair
with zero approvals. Synthetic candidates have no immutable release hashes, so
compilation fails by default. Tests must opt in with `--allow-test-only`, which
emits the distinct `amc-approved-question-context-test-set-v1` /
`private-test-only` contract with a null release binding. The production
validator/importer rejects that contract; production
`amc-approved-question-context-set-v1` always requires a non-null release
binding. These fixtures are not review evidence. Real decisions and receipts
belong in separately protected storage, not this repository or a public/static
root.

## Operator-delegated AI-assisted review v2

The original human-review v1 contract remains supported without relaxed keys,
audiences, hashes, or meanings. When the operator delegates review to Codex or
another model-assisted reviewer, use
`amc-question-context-review-decisions-v2` with policy
`amc-operator-delegated-ai-assisted-solution-approval-v1`. Do not put such a
decision in human-v1 or describe it as teacher/human approval.

V2 requires a root `operatorAuthorization` and, on every decision, the exact
`reviewMethod`, `reviewerId`, provider/model/run identity,
`operatorAuthorizationId`, and `candidateProvenance`. Those fields participate
in `decisionRecordHash`, as does the complete root `operatorAuthorization`;
the complete authorization and per-solution review lineage are copied into the
v2 compiled artifact. The same separately supplied
v1 receipt allowlist remains mandatory. The reviewer/compiler cannot create a
receipt or automatically approve a candidate. The authorizing operator,
mathematical reviewer, and receipt authority must be three pairwise-distinct
identities. For an operator-original supplement, its recorded author must also
be distinct from the mathematical reviewer who approves that solution.
The Python v2 approved-artifact validators require that receipt set as an
explicit `approval_receipts=` input; validating an artifact without the
separately protected authority evidence is deliberately an error. V1 artifact
bytes and validation behavior remain unchanged.
`rightsStatus` is supported by the operator's separately recorded
`rightsAttestation`; it is not a claim that the reviewing model established
copyright or licensing rights.

The v2 production schemas are `amc-approved-question-context-set-v2` and
`amc-approved-question-context-archive-set-v2`. Synthetic tests use the
distinct non-importable `amc-approved-question-context-test-set-v2`. Existing
importers that understand only approved-context v1 must reject v2 until their
trusted schema allowlist and persistence projection are explicitly upgraded;
never down-convert v2 to human-v1.

Any prompt/choice repair changes the question context and candidate-set hash.
Old decisions and their receipts then fail binding validation even when a
solution body itself did not change. This is intentional: solution correctness
must be reconsidered against the repaired problem.

### Protected original supplement candidates

Do not edit an already published archive form merely to add a second reference
method. Put separately authored solutions in an owner-only
`amc-original-solution-supplement-set-v1` file outside this repository. Each
record binds the exact archive candidate/release, form id/version, release
hashes, question content hash, body/record hashes, original author identity,
creation time, and the operator's originality/AI-use rights attestation.

Compose it with the base archive inventory under an existing `0700` private
root:

```sh
python3 -m amc_content.cli compose-supplemented-archive-context \
  --archive-candidate-set /protected/review/archive-candidates.json \
  --supplement-set /protected/review/original-supplements.json \
  --private-output-root /var/tmp/amc-approved-context \
  --json-output /var/tmp/amc-approved-context/supplemented-candidates.json \
  --markdown-output /var/tmp/amc-approved-context/supplemented-candidates.md
```

Both inputs must pass the same protected-file rules as review decisions. The
resulting `amc-question-context-supplemented-archive-candidate-set-v1` hash
covers the complete base and supplement sets. Reserved `solution-9NN`
supplements remain unapproved candidates. They require an exact v2 review
decision and exactly one active independent authority receipt before the
compiler includes them. Their explicit original/rights provenance is preserved
in the compiled v2 solution, and the supplement author cannot act as its
mathematical reviewer. The composition changes no published form,
source, `contentHash`, or `manifestHash`.

`review` has no key input and never creates an importable private manifest.
`build` verifies both artifacts after generation and is idempotent: canonical
JSON hashes make an equivalent build byte-for-byte stable.

## Releasing a real form

The existing `2025_AMC_12A_Problems` conversion is intentionally not released.
Its source structure and local media have been repaired, but it still lacks
content-rights clearance and an independently approved answer key. Its Question
25 is explicitly an adapted ordered-pairs review candidate, so this catalog must
not be represented as an exact archival AMC form. Its generated review report is
evidence for repair, not approval.

To release an actual form:

1. Copy the source catalog into `forms/<form-id>/` and run `review`.
2. Repair or replace every source listed as an error with a licensed, renderable
   prompt/image source. Keep source files immutable once reviewed.
3. Have two reviewers compare each option against an authoritative exam copy.
   Record source and sign-off in `approved-answer-key.json`; do not copy answer
   letters from the solution parser. Fill its `questionBundleHash` from the
   review output after the prompt/choice review is frozen.
4. Record content-rights clearance in `contentRights`, then set
   `publicationStatus` to `approved` only after all 25 questions, media,
   solutions, key, and scoring policy have been reviewed. Bump `id`/revision for
   any content change.
5. Run `build`, verify its canonical hashes, store the private artifact in the
   protected import path, and retain the public artifact separately.
6. Make the backend import transaction reject synthetic/test-only manifests in
   production, compare `contentHash`/`manifestHash`, and persist both hashes on
   the exam-form revision.

## Problematic source handling

The parser leaves a source untouched and blocks publication instead of guessing:

- Asymptote placeholders/code are errors until converted to an actual reviewed
  image with a stable source reference.
- A sixth option, duplicate option, missing option, or option text that cannot
  be isolated is an error.
- A second `Problem` heading or unknown section before a solution is an error;
  it can otherwise expose editorial text or a different prompt.
- Only the first level-two solution section is retained as candidate
  `solutionMarkdown`; later community solutions and editorial material remain
  in the source archive and are never sent by the practice API. Answer-looking
  text is a review signal only and never populates an answer key.
