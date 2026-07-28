# AMC practice-content pipeline

This directory is the content release gate for the online AMC practice
experience.  It deliberately treats the existing AoPS-derived Markdown as
**unreviewed source material**, not as an answer key or a publishable exam.

The pipeline produces two different artifacts:

| Artifact | Contains | Safe audience |
| --- | --- | --- |
| `public-form.json` | prompts, choices, and public content hash | authenticated exam client before final submission |
| `private-form.json` | the exact backend-import contract, including source references, `correctOption`, and the reviewed first-solution `solutionMarkdown` | server-side importer only; never static-host or send before final submission |

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

## Layout

```text
amc_content/             Standard-library parser, validator, and CLI
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
