# Synthetic fixture

This is a deliberately fake, 25-question content fixture used for parser,
artifact, hash, and importer integration tests. It is not an AMC problem set,
must never appear in a production form picker, and carries both
`isSynthetic: true` and `publicationStatus: "test-only"`.

The approved key is valid only because the source questions are synthetic and
the fixture authors explicitly designated each answer. It demonstrates the
approval/key-binding mechanics without suggesting that a community solution is
authoritative.

Build it only with the explicit development switch:

```sh
python3 -m amc_content.cli build \
  --form fixtures/synthetic-25/source-form.json \
  --answer-key fixtures/synthetic-25/approved-answer-key.json \
  --source-root . \
  --public-output /tmp/synthetic-public.json \
  --private-output /tmp/synthetic-private.json \
  --allow-test-only
```

The backend importer must repeat that gate: reject this manifest unless its
development-only `allowTestOnly` setting is explicitly enabled.

`question-context-review-decisions.empty.json` and
`solution-approval-receipts.empty.json` form the zero-approval governance pair.
They exercise the separate approved-context `--allow-test-only` path and are
not authority or review evidence for real content.
