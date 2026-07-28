# 2025 AMC 12A adapted-Q25 source status

This catalog is a **review-required candidate**, not an online exam form. Its
Question 25 is an explicitly labelled ordered-pairs adaptation, so the catalog
must not be represented as an exact archival AMC 12A form. It exists so that
source quality can be measured and repaired consistently.

Run the review from `practice-content`:

```sh
python3 -m amc_content.cli review \
  --form forms/2025-amc-12a/source-form.json \
  --source-root .. \
  --json-output reports/2025-amc-12a-source-review.json \
  --markdown-output reports/2025-amc-12a-source-review.md
```

The source-structure and rendering repairs are reflected in the checked-in
review report under `../../reports/`. A clean source review only means the
question prompts and local media can be parsed consistently; it does not make
the form releasable.

`first-solution-answer-key.provisional.json` records the option obtained by
reading each current first solution. It is intentionally marked
`notForScoring`; it is not accepted by the importer and must not be renamed to
`approved-answer-key.json`.

Do not rename `approved-answer-key.template.json` to
`approved-answer-key.json`. The template has deliberately invalid/draft
values; the build rejects it. A formal key still needs independent review,
explicit approval, and the review's matching `questionBundleHash`. Content
rights also remain `review-required` in `source-form.json`.
