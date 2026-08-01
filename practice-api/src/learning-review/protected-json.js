import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { lstat, open } from 'node:fs/promises';
import { parseStrictJson } from './strict-json.js';

const MAXIMUM_BYTES = 64 * 1024 * 1024;

export async function readProtectedJson(path, { maximumBytes = MAXIMUM_BYTES } = {}) {
  if (typeof path !== 'string' || !path) throw new Error('Protected JSON path is required.');
  const effectiveUid = typeof process.geteuid === 'function' ? process.geteuid() : null;
  const parentPath = dirname(resolve(path));
  const parentMetadata = await lstat(parentPath);
  if (!parentMetadata.isDirectory()
      || (effectiveUid !== null && parentMetadata.uid !== effectiveUid)
      || (parentMetadata.mode & 0o077) !== 0) {
    throw new Error('Protected JSON parent must be a real owner-only directory owned by the effective user.');
  }
  const handle = await open(path,
    constants.O_RDONLY | (constants.O_NOFOLLOW || 0) | (constants.O_NONBLOCK || 0));
  try {
    const metadata = await handle.stat();
    if (!metadata.isFile() || metadata.size > maximumBytes) {
      throw new Error(`Protected JSON input must be a regular file no larger than ${maximumBytes} bytes.`);
    }
    if ((effectiveUid !== null && metadata.uid !== effectiveUid) || (metadata.mode & 0o077) !== 0) {
      throw new Error('Protected JSON input must be owner-only and owned by the effective user.');
    }
    const chunks = [];
    let total = 0;
    while (true) {
      const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, maximumBytes + 1 - total));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > maximumBytes) throw new Error(`Protected JSON input exceeds ${maximumBytes} bytes.`);
      chunks.push(buffer.subarray(0, bytesRead));
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, total));
    const payload = parseStrictJson(text);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Protected JSON root must be an object.');
    }
    return payload;
  } finally {
    await handle.close();
  }
}
