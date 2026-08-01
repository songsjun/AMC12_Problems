import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdtemp, mkdir, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PrivateUploadStore } from '../src/infrastructure/private-upload-store.js';
import { MAX_AUDIO_FILE_BYTES, batchSha256 } from '../src/batch-ingest/domain.js';

async function fixture(t, options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'amc-private-upload-'));
  await t.test('fixture root is owner-only', async () => {
    assert.equal((await stat(root)).mode & 0o777, 0o700);
  });
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  const store = new PrivateUploadStore({ root, minimumFreeBytes: 0, highWatermarkPercent: 100, ...options });
  await store.init();
  return { root, store };
}

test('private store streams strict text to an atomic random 0600 object and supports bounded read/delete', async (t) => {
  const { root, store } = await fixture(t);
  const text = 'Question 1\nUse algebra 😀';
  const stored = await store.write({
    stream: Readable.from([Buffer.from(text.slice(0, 10)), Buffer.from(text.slice(10))]),
    expectedBytes: Buffer.byteLength(text), kind: 'TEXT', contentType: 'text/plain'
  });
  assert.match(stored.storageKey, /^objects\/[0-9a-f-]+\.blob$/);
  assert.equal(stored.sha256, batchSha256(text));
  assert.equal(stored.normalizedText, text);
  assert.equal((await stat(join(root, stored.storageKey))).mode & 0o777, 0o600);
  assert.equal((await store.read(stored.storageKey, 1024)).toString(), text);
  await assert.rejects(() => store.read(stored.storageKey, 0), (error) => error.code === 'INVALID_READ_LIMIT');
  await assert.rejects(() => store.read(stored.storageKey, MAX_AUDIO_FILE_BYTES + 1),
    (error) => error.code === 'INVALID_READ_LIMIT');
  assert.equal(await store.exists(stored.storageKey), true);
  assert.equal((await readdir(join(root, 'objects'))).some((name) => name.endsWith('.partial')), false);
  assert.equal(await store.delete(stored.storageKey), true);
  assert.equal(await store.delete(stored.storageKey), false);
  assert.equal(await store.exists(stored.storageKey), false);
});

test('private store accepts supported audio magic without buffering the audio body', async (t) => {
  const { store } = await fixture(t);
  const audio = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(128, 7)]);
  const stored = await store.write({
    stream: Readable.from([audio.subarray(0, 2), audio.subarray(2)]), expectedBytes: audio.length,
    kind: 'AUDIO', contentType: 'audio/mpeg'
  });
  assert.equal(stored.observedBytes, audio.length);
  assert.equal(stored.normalizedText, null);
});

test('length, UTF-8/control, media-magic, and disconnect failures leave no partial or final object', async (t) => {
  const { root, store } = await fixture(t);
  const attempts = [
    () => store.write({ stream: Readable.from(['short']), expectedBytes: 6, kind: 'TEXT', contentType: 'text/plain' }),
    () => store.write({ stream: Readable.from([Buffer.from([0xC3, 0x28])]), expectedBytes: 2, kind: 'TEXT', contentType: 'text/plain' }),
    () => store.write({ stream: Readable.from(['bad\uFFFD']), expectedBytes: Buffer.byteLength('bad\uFFFD'), kind: 'TEXT', contentType: 'text/plain' }),
    () => store.write({ stream: Readable.from(['not mp3']), expectedBytes: 7, kind: 'AUDIO', contentType: 'audio/mpeg' }),
    () => store.write({ stream: Readable.from((async function* broken() { yield Buffer.from('abc'); throw new Error('disconnect'); })()),
      expectedBytes: 6, kind: 'TEXT', contentType: 'text/plain' })
  ];
  for (const attempt of attempts) await assert.rejects(attempt);
  assert.deepEqual(await readdir(join(root, 'objects')), []);
});

test('private root rejects symlinks/static overlap and disk pressure fails before file creation', async (t) => {
  const parent = await mkdtemp(join(tmpdir(), 'amc-private-parent-'));
  t.after(async () => { await rm(parent, { recursive: true, force: true }); });
  const target = join(parent, 'target');
  await mkdir(target, { mode: 0o700 });
  const alias = join(parent, 'alias');
  await symlink(target, alias);
  await assert.rejects(() => new PrivateUploadStore({ root: alias }).init(), /symlink|alias/);
  await assert.rejects(() => new PrivateUploadStore({ root: target, forbiddenRoots: [parent] }).init(), /disjoint/);

  const pressureRoot = join(parent, 'pressure');
  const pressure = new PrivateUploadStore({
    root: pressureRoot, minimumFreeBytes: 100, highWatermarkPercent: 90,
    statfsImpl: async () => ({ bsize: 1, blocks: 1000, bfree: 50, bavail: 50 })
  });
  await pressure.init();
  await assert.rejects(
    () => pressure.write({ stream: Readable.from(['hello']), expectedBytes: 5, kind: 'TEXT', contentType: 'text/plain' }),
    (error) => error.code === 'PRIVATE_STORAGE_PRESSURE' && error.statusCode === 503
  );
  assert.deepEqual(await readdir(join(pressureRoot, 'objects')), []);
});

test('every operation rejects directory replacement and exists rejects a symlink with a valid object name', async (t) => {
  const { root, store } = await fixture(t);
  const objects = join(root, 'objects');
  const objectsReal = join(root, 'objects-real');
  await rename(objects, objectsReal);
  await symlink(objectsReal, objects, 'dir');
  await assert.rejects(() => store.exists('objects/11111111-1111-4111-8111-111111111111.blob'), /symlink|alias/);
  await assert.rejects(() => store.delete('objects/11111111-1111-4111-8111-111111111111.blob'), /symlink|alias/);
  await assert.rejects(() => store.write({
    stream: Readable.from(['x']), expectedBytes: 1, kind: 'TEXT', contentType: 'text/plain'
  }), /symlink|alias/);

  await rm(objects);
  await rename(objectsReal, objects);
  const outside = join(root, 'outside');
  await writeFile(outside, 'secret', { mode: 0o600 });
  const aliasKey = 'objects/22222222-2222-4222-8222-222222222222.blob';
  await symlink(outside, join(root, aliasKey));
  await assert.rejects(() => store.exists(aliasKey), /regular file/);
  await assert.rejects(() => store.delete(aliasKey), /regular file/);
});

test('bounded inventory returns only valid private random keys and counts partial or unexpected entries', async (t) => {
  const { root, store } = await fixture(t);
  const stored = await store.write({
    stream: Readable.from(['evidence']), expectedBytes: 8, kind: 'TEXT', contentType: 'text/plain'
  });
  await writeFile(join(root, 'objects', '.33333333-3333-4333-8333-333333333333.44444444-4444-4444-8444-444444444444.partial'),
    'partial', { mode: 0o600 });
  await writeFile(join(root, 'objects', 'unexpected.txt'), 'unexpected', { mode: 0o600 });
  const inventory = await store.inventory({ maxEntries: 10 });
  assert.deepEqual(inventory.storageKeys, [stored.storageKey]);
  assert.equal(inventory.partialCount, 1);
  assert.equal(inventory.unexpectedCount, 1);
  assert.equal(inventory.scannedCount, 3);
  assert.equal(inventory.truncated, false);
  await assert.rejects(() => store.inventory({ maxEntries: 0 }), (error) => error.code === 'INVALID_INVENTORY_LIMIT');
});
