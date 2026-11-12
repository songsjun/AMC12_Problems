import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ApiError } from '../src/errors.js';
import { ARCHIVE_RELEASE_FORM_IDS, LEGACY_ARCHIVE_RELEASE_FORM_IDS, normalizeManifest, validateArchiveReleaseBatch } from '../src/manifest.js';
import { archiveManifestFixture, archiveReleaseFixture, sealArchiveManifest } from './archive-fixture.js';

const execFileAsync = promisify(execFile);
const archiveImporter = fileURLToPath(new URL('../scripts/import-archive-release.js', import.meta.url));
const genericImporter = fileURLToPath(new URL('../scripts/import-form.js', import.meta.url));

function expectArchiveError(work, code) {
  assert.throws(work, (error) => error instanceof ApiError && error.code === code);
}

test('archive release contract accepts exactly the complete, uniform archive-v1 collection', () => {
  const release = archiveReleaseFixture({ version: 'archive-2026-07-28-r1' });
  const forms = validateArchiveReleaseBatch(release);
  assert.equal(forms.length, 48);
  assert.deepEqual(new Set(forms.map((form) => form.id)), new Set(LEGACY_ARCHIVE_RELEASE_FORM_IDS));
  assert.deepEqual(new Set(forms.map((form) => form.version)), new Set(['archive-2026-07-28-r1']));
});

test('the exact 49-form extension preserves the legacy revisions and allows independent 2026A provenance', () => {
  const legacy = archiveReleaseFixture({ version: 'archive-existing-r3' });
  const legacyBytes = JSON.stringify(legacy.forms);
  const addition = archiveManifestFixture({ year: 2026, version: 'archive-2026a-r1', unscoredQuestionNumber: null });
  addition.provenance.answerKey.catalogHash = 'e'.repeat(64);
  addition.provenance.media.manifestSha256 = 'f'.repeat(64);
  addition.provenance.releaseAuthorization.authorizedAt = '2026-11-12';
  sealArchiveManifest(addition);
  const expanded = { ...legacy, forms: [addition, ...legacy.forms] };
  const forms = validateArchiveReleaseBatch(expanded);
  assert.equal(forms.length, 49);
  assert.deepEqual(new Set(forms.map((form) => form.id)), new Set(ARCHIVE_RELEASE_FORM_IDS));
  assert.equal(JSON.stringify(forms.slice(1)), legacyBytes);
  assert.equal(normalizeManifest(addition).scoringPolicy.blankPoints, 1.5);

  for (const [field, code] of [
    ['version', 'MIXED_ARCHIVE_RELEASE_VERSION'],
    ['catalogHash', 'MIXED_ARCHIVE_ANSWER_KEY_CATALOG'],
    ['manifestSha256', 'MIXED_ARCHIVE_MEDIA_MANIFEST']
  ]) {
    const mixed = structuredClone(expanded);
    const changed = mixed.forms[4];
    if (field === 'version') changed.version = 'different-legacy-version';
    if (field === 'catalogHash') changed.provenance.answerKey.catalogHash = '9'.repeat(64);
    if (field === 'manifestSha256') changed.provenance.media.manifestSha256 = '8'.repeat(64);
    sealArchiveManifest(changed);
    expectArchiveError(() => validateArchiveReleaseBatch(mixed), code);
  }
});

test('the extended release rejects an absent legacy paper, duplicate, 2026B, and unknown ids', () => {
  for (const id of ['amc12-2026-b', 'amc12-2027-a']) {
    const invalid = archiveReleaseFixture({ include2026: true });
    invalid.forms.at(-1).id = id;
    sealArchiveManifest(invalid.forms.at(-1));
    expectArchiveError(() => validateArchiveReleaseBatch(invalid), 'INVALID_ARCHIVE_RELEASE');
    expectArchiveError(() => normalizeManifest(invalid.forms.at(-1)), 'INVALID_MANIFEST');
  }
  const partial = archiveReleaseFixture({ include2026: true });
  partial.forms.shift();
  expectArchiveError(() => validateArchiveReleaseBatch(partial), 'INVALID_ARCHIVE_RELEASE');
  const duplicate = archiveReleaseFixture({ include2026: true });
  duplicate.forms[1] = structuredClone(duplicate.forms[0]);
  expectArchiveError(() => validateArchiveReleaseBatch(duplicate), 'DUPLICATE_ARCHIVE_FORM');
});

test('archive release contract rejects partial, duplicate, unexpected-schema, and mixed-version batches before storage', () => {
  const partial = archiveReleaseFixture();
  partial.forms.pop();
  expectArchiveError(() => validateArchiveReleaseBatch(partial), 'INVALID_ARCHIVE_RELEASE');

  const duplicate = archiveReleaseFixture();
  duplicate.forms[1] = structuredClone(duplicate.forms[0]);
  expectArchiveError(() => validateArchiveReleaseBatch(duplicate), 'DUPLICATE_ARCHIVE_FORM');

  const nonArchive = archiveReleaseFixture();
  nonArchive.forms[0].schemaVersion = 'amc-practice-private-form-v1';
  expectArchiveError(() => validateArchiveReleaseBatch(nonArchive), 'INVALID_ARCHIVE_RELEASE');

  const mixedVersion = archiveReleaseFixture();
  mixedVersion.forms[20].version = 'archive-r2';
  sealArchiveManifest(mixedVersion.forms[20]);
  expectArchiveError(() => validateArchiveReleaseBatch(mixedVersion), 'MIXED_ARCHIVE_RELEASE_VERSION');
});

test('archive release contract rejects a substituted form id even when the batch has 48 entries', () => {
  const release = archiveReleaseFixture();
  release.forms[0].id = 'amc12-2026-a';
  sealArchiveManifest(release.forms[0]);
  expectArchiveError(() => validateArchiveReleaseBatch(release), 'INVALID_ARCHIVE_RELEASE');
});

test('archive release contract rejects answer-key or media provenance mixed across forms', () => {
  const mixedCatalog = archiveReleaseFixture();
  mixedCatalog.forms[7].provenance.answerKey.catalogHash = 'e'.repeat(64);
  sealArchiveManifest(mixedCatalog.forms[7]);
  expectArchiveError(() => validateArchiveReleaseBatch(mixedCatalog), 'MIXED_ARCHIVE_ANSWER_KEY_CATALOG');

  const mixedCatalogSchema = archiveReleaseFixture();
  mixedCatalogSchema.forms[8].provenance.answerKey.catalogSchemaVersion = 'other-answer-key-schema-v1';
  sealArchiveManifest(mixedCatalogSchema.forms[8]);
  expectArchiveError(() => validateArchiveReleaseBatch(mixedCatalogSchema), 'MIXED_ARCHIVE_ANSWER_KEY_SCHEMA');

  const mixedMedia = archiveReleaseFixture();
  mixedMedia.forms[11].provenance.media.manifestSha256 = 'f'.repeat(64);
  sealArchiveManifest(mixedMedia.forms[11]);
  expectArchiveError(() => validateArchiveReleaseBatch(mixedMedia), 'MIXED_ARCHIVE_MEDIA_MANIFEST');
});

test('the dedicated archive importer requires an explicit and exclusive --publish flag', async () => {
  await assert.rejects(
    () => execFileAsync(process.execPath, [archiveImporter, 'release.json']),
    (error) => error.code === 2 && /--publish/.test(error.stderr)
  );
});

test('the generic form importer rejects archive-v1 and private-v1 historical-ID bypasses before a database', async (t) => {
  const directory = await mkdtemp(`${tmpdir()}/amc-archive-cli-`);
  const archivePath = `${directory}/archive-form.json`;
  const disguisedPath = `${directory}/private-lookalike.json`;
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(archivePath, JSON.stringify({ schemaVersion: 'amc-practice-archive-form-v1' }));
  await writeFile(disguisedPath, JSON.stringify({
    schemaVersion: 'amc-practice-private-form-v1', id: 'amc12-2025-a'
  }));
  for (const path of [archivePath, disguisedPath]) {
    await assert.rejects(
      () => execFileAsync(process.execPath, [genericImporter, path, '--publish']),
      (error) => error.code === 1
        && /import-archive-release\.js --publish/.test(error.stderr)
        && !/AMC12_DATABASE_URL/.test(error.stderr)
    );
  }
});
