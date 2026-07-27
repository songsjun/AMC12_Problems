import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ApiError } from '../src/errors.js';
import { normalizeManifest } from '../src/manifest.js';
import { makeService } from './helpers.js';

const execFileAsync = promisify(execFile);
const contentRoot = fileURLToPath(new URL('../../practice-content/', import.meta.url));

async function buildActualPrivateFixture() {
  const directory = await mkdtemp(`${tmpdir()}/amc-content-contract-`);
  const privateOutput = `${directory}/private-form.json`;
  try {
    await execFileAsync('python3', [
      '-m', 'amc_content.cli', 'build',
      '--form', 'fixtures/synthetic-25/source-form.json',
      '--answer-key', 'fixtures/synthetic-25/approved-answer-key.json',
      '--source-root', '.',
      '--public-output', `${directory}/public-form.json`,
      '--private-output', privateOutput,
      '--allow-test-only'
    ], { cwd: contentRoot });
    return { directory, manifest: JSON.parse(await readFile(privateOutput, 'utf8')) };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

test('real practice-content private v1 artifact validates canonical hashes and maps without losing audit fields', async (t) => {
  const built = await buildActualPrivateFixture();
  t.after(() => rm(built.directory, { recursive: true, force: true }));
  const normalized = normalizeManifest(built.manifest);
  assert.equal(normalized.id, built.manifest.id);
  assert.equal(normalized.version, built.manifest.version);
  assert.equal(normalized.durationMs, built.manifest.durationSeconds * 1_000);
  assert.equal(normalized.published, false);
  assert.equal(normalized.publishEligible, false);
  assert.equal(normalized.developmentPublishEligible, true);
  assert.equal(normalized.scoringPolicy.id, built.manifest.scoringPolicyVersion);
  assert.equal(normalized.scoringPolicy.correctPoints, built.manifest.scoringPolicy.correct);
  assert.equal(normalized.scoringPolicy.questionCount, built.manifest.scoringPolicy.questionCount);
  assert.equal(normalized.scoringPolicy.maxScore, built.manifest.scoringPolicy.maxScore);
  assert.equal(normalized.manifestHash, built.manifest.manifestHash);
  assert.equal(normalized.sourceManifestHash, built.manifest.manifestHash);
  assert.equal(normalized.contentHash, built.manifest.contentHash);
  assert.deepEqual(normalized.provenance, built.manifest.provenance);
  assert.equal(normalized.questions.length, 25);

  const productionLike = await makeService();
  await assert.rejects(
    () => productionLike.service.importManifest(built.manifest, { publish: false }),
    (error) => error instanceof ApiError && error.code === 'TEST_FORM_IMPORT_FORBIDDEN'
  );
  const devImportOnly = await makeService({ allowTestOnlyImport: true });
  await devImportOnly.service.importManifest(built.manifest, { publish: false });
  assert.equal((await devImportOnly.store.listForms()).some((form) => form.id === built.manifest.id), false);
  const devPublish = await makeService({ allowTestOnlyImport: true, allowTestOnlyPublish: true });
  await devPublish.service.importManifest(built.manifest, { publish: true });
  const stored = await devPublish.store.getForm(built.manifest.id, built.manifest.version);
  assert.equal(stored.manifestHash, built.manifest.manifestHash);
  assert.equal(stored.sourceManifestHash, built.manifest.manifestHash);
  assert.deepEqual(stored.provenance, built.manifest.provenance);
  assert.equal((await devPublish.store.listForms()).some((form) => form.id === built.manifest.id), true);
});

test('private v1 importer rejects canonical-hash tampering before any storage write', async (t) => {
  const built = await buildActualPrivateFixture();
  t.after(() => rm(built.directory, { recursive: true, force: true }));
  const tampered = structuredClone(built.manifest);
  tampered.questions[0].promptMarkdown = `${tampered.questions[0].promptMarkdown}\nTampered`;
  assert.throws(
    () => normalizeManifest(tampered),
    (error) => error instanceof ApiError && error.code === 'INVALID_MANIFEST' && /manifestHash/.test(error.message)
  );
});
