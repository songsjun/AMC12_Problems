# Current AMC 12 content release

Published and verified on 2026-11-12 at 22:51 UTC.

- New form: `amc12-2026-a@archive-2026-11-12-r1`.
- Public archive: <https://amc12.kapy.ca/#2026AP1>.
- Practice entry: <https://amc12.kapy.ca/practice/?form=amc12-2026-a&mode=practice>.
- Source: AoPS MediaWiki revisions downloaded at `2026-11-12T22:35:37.049606Z`.
- Local source: `2026_AMC_12A_Problems/`, including 25 raw/Markdown pairs,
  the answer-key and full-paper sources, source revision hashes, and media provenance.
- Archive content: all source solution sections and video links before the
  navigation footer, with 19 rendered Asymptote diagrams and one original PNG.
- Practice content: 25 scored questions, the existing post-final first-solution
  projection, and the sourced AoPS key (revision `297613`).
- The existing 48 forms remain at `archive-2026-08-03-r3`. Every existing
  version, content hash, and manifest hash matched the database before and after import.

The release identity is
`20261112T224922Z-9f649b73f2ca-954cdf2b326f`. Its owner-only retained package is:

```text
/Users/ss/ServiceRuntime/amc12-content/releases/20261112T224922Z-9f649b73f2ca-954cdf2b326f/
```

That directory contains the exact 49-form private import batch, original
48-form batch, source snapshot, source manifest, independent content review,
test log, import result, database verification, and previous static entry files.
The source manifest binds 187 files to base commit
`9f649b73f2ca`. It records the dirty workspace and explicitly excludes the
pre-existing launchd/start-script edits. The content deployment preceded the
Git commit.

New form hashes:

```text
contentHash  b9e9392c24c7e1296af51a8f9a1d179d10fd268ee326a42e792a8e94c4a1ff30
manifestHash 972fbd86317ce0e3c482d985797608a9e36de23bf3eaa488d8e102ac9baae755
source files 954cdf2b326f1f471bcfe296c02f71dfeba3b446f7e47aaa81467dd3a3e39e56
```

The actual static origin remains nginx on `127.0.0.1:8084`, serving this
workspace root. The actual API remains Node PID `1676`, listening only on
`127.0.0.1:8090`, with its protected environment in
`/etc/kapy/amc12-practice.env`. The importer used the service's Node
`/Users/ss/ServiceRuntime/node/v24.22.1/bin/node`, a staged copy of the importer,
and dependencies installed with `npm ci`. It imported all 49 forms in one
transaction. No new migration was added. No API, worker, nginx, or tunnel
restart was needed.

Verification covered 120 Python tests, 8 staged API release-contract tests,
27 service/manifest regressions, 11 archive unit tests, and the media verifier.
The complete new paper rendered 2169 MathJax expressions and 20 images with
zero formula errors or broken images. An independent source comparison
preserved the formula order and multiplicity, 192 headings, 44 video links,
all question/choice text, and the original wiki source bytes. The live site's
first and last questions, solution sections, navigation, and practice sign-in
gate were observed in Chrome. No authenticated student attempt was created.

The later Git integration retained the remote `2026_AMC_12B_Problems/README`
placeholder from `c8a8dad`. The builder skips unsupported paper directories
only when they contain README files alone. Unsupported directories with any
question source still fail. The five catalog-extension tests passed after
this integration; the published question and media bytes did not change.

For a rollback of this addition, restore `index.html`, `viewer.html`, and
`archive/reader.js` from this package's `rollback-static/` directory with
atomic file replacement. Unpublish only the new revision in a transaction:

```sql
UPDATE amc_practice.form_revisions
SET published = false
WHERE form_id = 'amc12-2026-a'
  AND version = 'archive-2026-11-12-r1';
```

Retain the source/media and saved attempts. This rollback does not require
restoring a database backup or changing the old 48 revisions.
