# 2025 AMC 12A source status

This catalog is a **review-required candidate**, not an online exam form. It
exists so that source quality can be measured and repaired consistently.

Run the review from `practice-content`:

```sh
python3 -m amc_content.cli review \
  --form forms/2025-amc-12a/source-form.json \
  --source-root .. \
  --json-output reports/2025-amc-12a-source-review.json \
  --markdown-output reports/2025-amc-12a-source-review.md
```

Do not rename `approved-answer-key.template.json` to
`approved-answer-key.json` until every review error is resolved. The template
has deliberately invalid/draft values; the build rejects it. The correct key
must be separately approved and bound to the review's `questionBundleHash`.

Known blockers in the converted Markdown include:

- `Problem_25.md` has an extra `(F)` choice and editorial material describing a
  disputed/corrected question version.
- Several prompts contain only `[Asymptote diagram - not rendered in Markdown]`
  plus source code, not a reviewed image that an exam client can render.
- `Problem_22.md` contains a second problem variant heading before its source
  solutions.

The review report is checked in under `../../reports/` to make this non-release
decision auditable. It does not establish any answer letter as correct.
