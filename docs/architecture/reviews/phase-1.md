# Phase 1 review: private question-context candidates

## Scope

This stage adds a separate candidate compiler for all structurally identifiable written solutions. It does not alter the existing first-solution parser or public/private released form artifacts, and it cannot produce an approved solution.

## Verification evidence

- `python3 -m unittest discover -s tests -v`: 85 passed.
- Question-context-specific tests: 23 passed.
- `python3 -m compileall -q amc_content tests`: passed.
- Three new JSON Schema documents parse successfully; runtime strict validators reject unknown/missing/tampered and malformed values.
- `git diff --check`: passed.
- Exact archive inventory: 48 released forms, 1,200 questions, 3,803 candidates, 40 quarantined, 0 approved; released prompt/choices/source references and form/version/content/manifest/question-bundle hashes remain bound exactly.
- Existing manifest regression tests retain the original public `contentHash`, private `manifestHash`, and first-solution behavior.

## Independent review

The first architecture review rejected the implementation for missing H4 solutions, lacking an archive-revision binding, and lacking a total strict validation contract. The implementation now parses H2–H4 structural siblings, builds against the exact released archive private batch (including overrides/mirrored media), surfaces parser issues, publishes strict candidate/set schemas, and validates before output.

The first security review rejected unrestricted output paths and active source Markdown in the reviewer document. The implementation now requires a disjoint `0700` private root, rejects the code-anchored repository/nginx document root and symlink paths, renders every source-controlled string as collision-safe literal Markdown, and keeps JSON authoritative.

Second reviews found malformed-child crashes, missing exact 25-question validation, caller-narrowed source-root bypass, and a no-replace race. The final implementation uses total validators, exact ordered questions 1–25, a code-anchored public-root exclusion, a private-root `fcntl` process lock, atomic `os.link` no-clobber installation, pair rollback, concurrency tests, and source-race tests. Final architecture and security dispositions: **APPROVE**, each with zero blocker, major, or in-scope minor finding.

## Reflection

The initial extraction count looked convincing while still missing legal H4 sections and failing to prove that candidates matched the revision a student actually answered. Corpus-wide counts are useful only after structural edge cases and release identity are fixed.

The reviewer Markdown is also an attack surface: a private file can still trigger remote loads or visually forge approval when opened. Treating all source text as literal data and treating JSON as the sole authority is safer than relying on reviewer caution.

Finally, file permissions and `exists()` checks are not concurrency controls. The final boundary combines a known forbidden public root, a private root, cross-process serialization, and kernel-level no-clobber semantics. Even with these controls, all 3,843 extracted sections remain unapproved community material; mathematical correctness, pedagogy, and rights review are deliberately outside automation.
