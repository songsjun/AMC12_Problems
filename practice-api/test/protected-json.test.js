import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chmod, mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readProtectedJson } from '../src/learning-review/protected-json.js';

const run = promisify(execFile);

async function protectedDirectory() {
  const directory = await mkdtemp(join(tmpdir(), 'amc-protected-json-'));
  await chmod(directory, 0o700);
  return directory;
}

test('protected JSON accepts strict owner-only regular files and rejects duplicate keys and oversize input', async (t) => {
  const directory = await protectedDirectory();
  t.after(() => rm(directory, { recursive: true, force: true }));
  const valid = join(directory, 'valid.json');
  await writeFile(valid, '{"ok":true}', { mode: 0o600 });
  assert.deepEqual(await readProtectedJson(valid), { ok: true });

  const duplicate = join(directory, 'duplicate.json');
  await writeFile(duplicate, '{"decision":"approved","decision":"revoked"}', { mode: 0o600 });
  await assert.rejects(() => readProtectedJson(duplicate), /duplicate/i);

  const oversized = join(directory, 'oversized.json');
  await writeFile(oversized, '{"long":"123456789"}', { mode: 0o600 });
  await assert.rejects(() => readProtectedJson(oversized, { maximumBytes: 16 }), /larger|exceeds/i);

  const surrogate = join(directory, 'surrogate.json');
  await writeFile(surrogate, '{"text":"\\ud800"}', { mode: 0o600 });
  await assert.rejects(() => readProtectedJson(surrogate), /surrogate/i);
  const emoji = join(directory, 'emoji.json');
  await writeFile(emoji, '{"text":"\\ud83d\\ude00"}', { mode: 0o600 });
  assert.deepEqual(await readProtectedJson(emoji), { text: '😀' });
});

test('protected JSON rejects permissive parent/file modes, symlinks, and FIFO without blocking', async (t) => {
  const directory = await protectedDirectory();
  t.after(() => rm(directory, { recursive: true, force: true }));
  const target = join(directory, 'target.json');
  await writeFile(target, '{"ok":true}', { mode: 0o600 });

  await chmod(target, 0o640);
  await assert.rejects(() => readProtectedJson(target), /owner-only/i);
  await chmod(target, 0o600);
  await chmod(directory, 0o750);
  await assert.rejects(() => readProtectedJson(target), /parent.*owner-only/i);
  await chmod(directory, 0o700);

  const link = join(directory, 'link.json');
  await symlink(target, link);
  await assert.rejects(() => readProtectedJson(link));

  const fifo = join(directory, 'receipt.fifo');
  await run('mkfifo', [fifo]);
  await chmod(fifo, 0o600);
  await assert.rejects(
    Promise.race([
      readProtectedJson(fifo),
      new Promise((_, reject) => setTimeout(() => reject(new Error('FIFO read blocked')), 1_000))
    ]),
    /regular file/
  );

  const realParent = join(directory, 'real-parent');
  await mkdir(realParent, { mode: 0o700 });
  const linkedParent = join(directory, 'linked-parent');
  await symlink(realParent, linkedParent);
  const nested = join(realParent, 'payload.json');
  await writeFile(nested, '{"ok":true}', { mode: 0o600 });
  await assert.rejects(() => readProtectedJson(join(linkedParent, 'payload.json')), /real owner-only directory/i);
});
