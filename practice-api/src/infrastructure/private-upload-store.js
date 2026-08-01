import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  opendir,
  realpath,
  statfs,
  unlink
} from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { ApiError, badRequest } from '../errors.js';
import { MAX_AUDIO_FILE_BYTES, MAX_TEXT_FILE_BYTES } from '../batch-ingest/domain.js';
import { isBoundedInferenceInputText } from './amc-inference-contract.js';

const STORAGE_KEY = /^objects\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.blob$/i;
const PARTIAL_NAME = /^\.[0-9a-f-]+\.[0-9a-f-]+\.partial$/i;

function contained(root, candidate) {
  const path = resolve(candidate);
  return path === root || path.startsWith(`${root}${sep}`);
}

function mode(stat) {
  return stat.mode & 0o777;
}

function storageError(statusCode, code, message) {
  return new ApiError(statusCode, code, message);
}

function validateAudioMagic(contentType, leading) {
  const ascii = leading.toString('ascii');
  if (contentType === 'audio/mpeg') {
    return ascii.startsWith('ID3') || (leading.length >= 2 && leading[0] === 0xFF && (leading[1] & 0xE0) === 0xE0);
  }
  if (contentType === 'audio/mp4') return leading.length >= 12 && ascii.slice(4, 8) === 'ftyp';
  if (contentType === 'audio/wav' || contentType === 'audio/x-wav') {
    return leading.length >= 12 && ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WAVE';
  }
  if (contentType === 'audio/ogg') return ascii.startsWith('OggS');
  if (contentType === 'audio/flac') return ascii.startsWith('fLaC');
  return false;
}

function uploadMaximum(kind) {
  return kind === 'TEXT' ? MAX_TEXT_FILE_BYTES : MAX_AUDIO_FILE_BYTES;
}

async function exactPrivateDirectory(path) {
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || mode(stat) !== 0o700
      || (typeof process.getuid === 'function' && stat.uid !== process.getuid())) {
    throw new Error(`Private upload directory must be an owner-controlled 0700 directory: ${path}`);
  }
  return stat;
}

export class PrivateUploadStore {
  constructor({
    root,
    forbiddenRoots = [],
    minimumFreeBytes = 0,
    highWatermarkPercent = 95,
    statfsImpl = statfs
  }) {
    if (typeof root !== 'string' || !isAbsolute(root)) throw new Error('Private upload root must be an absolute path.');
    if (!Number.isSafeInteger(minimumFreeBytes) || minimumFreeBytes < 0
        || !Number.isFinite(highWatermarkPercent) || highWatermarkPercent <= 0 || highWatermarkPercent > 100) {
      throw new Error('Private upload disk limits are invalid.');
    }
    this.root = resolve(root);
    this.objectsRoot = join(this.root, 'objects');
    this.forbiddenRoots = forbiddenRoots.map((path) => resolve(path));
    this.minimumFreeBytes = minimumFreeBytes;
    this.highWatermarkPercent = highWatermarkPercent;
    this.statfsImpl = statfsImpl;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      if ((await lstat(this.root)).isSymbolicLink()) throw new Error('Private upload root cannot be a symlink or alias.');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const parent = await realpath(dirname(this.root));
    this.root = join(parent, basename(this.root));
    this.objectsRoot = join(this.root, 'objects');
    for (const configuredForbidden of this.forbiddenRoots) {
      const forbidden = await realpath(configuredForbidden).catch(() => configuredForbidden);
      if (contained(forbidden, this.root) || contained(this.root, forbidden)) {
        throw new Error('Private upload root must be disjoint from every static or source root.');
      }
    }
    try {
      await mkdir(this.root, { mode: 0o700 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const actualRoot = await realpath(this.root);
    if (actualRoot !== this.root) throw new Error('Private upload root cannot be a symlink or alias.');
    await exactPrivateDirectory(this.root);
    try {
      await mkdir(this.objectsRoot, { mode: 0o700 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    await exactPrivateDirectory(this.objectsRoot);
    await this.#assertBoundary();
    this.initialized = true;
  }

  async #assertBoundary() {
    const [actualRoot, actualObjectsRoot] = await Promise.all([
      realpath(this.root),
      realpath(this.objectsRoot)
    ]);
    if (actualRoot !== this.root || actualObjectsRoot !== this.objectsRoot) {
      throw new Error('Private upload directories cannot be replaced by symlinks or aliases.');
    }
    await Promise.all([exactPrivateDirectory(this.root), exactPrivateDirectory(this.objectsRoot)]);
  }

  async #syncObjectsDirectory() {
    const directory = await open(this.objectsRoot, constants.O_RDONLY | constants.O_DIRECTORY);
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }

  async assertCapacity(reservedBytes) {
    await this.init();
    await this.#assertBoundary();
    if (!Number.isSafeInteger(reservedBytes) || reservedBytes < 1 || reservedBytes > MAX_AUDIO_FILE_BYTES) {
      throw badRequest('INVALID_UPLOAD_RESERVATION', 'Upload reservation bytes are invalid.');
    }
    const status = await this.statfsImpl(this.root);
    const blockSize = Number(status.bsize);
    const total = Number(status.blocks) * blockSize;
    const free = Number(status.bavail) * blockSize;
    const usedPercent = total > 0 ? ((total - Number(status.bfree) * blockSize) / total) * 100 : 100;
    if (!Number.isSafeInteger(free) || free - reservedBytes < this.minimumFreeBytes
        || usedPercent >= this.highWatermarkPercent) {
      throw storageError(503, 'PRIVATE_STORAGE_PRESSURE', 'Private upload storage is temporarily unavailable.');
    }
  }

  #path(storageKey) {
    if (typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) {
      throw badRequest('INVALID_STORAGE_KEY', 'Private storage key is invalid.');
    }
    const path = resolve(this.root, storageKey);
    if (!contained(this.objectsRoot, path)) throw badRequest('INVALID_STORAGE_KEY', 'Private storage key is invalid.');
    return path;
  }

  async write({ stream, expectedBytes, kind, contentType }) {
    await this.init();
    const maximum = uploadMaximum(kind);
    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function'
        || !['TEXT', 'AUDIO'].includes(kind) || !Number.isSafeInteger(expectedBytes)
        || expectedBytes < 1 || expectedBytes > maximum) {
      throw badRequest('INVALID_UPLOAD', 'The prepared upload contract is invalid.');
    }
    await this.assertCapacity(expectedBytes);
    const id = randomUUID();
    const storageKey = `objects/${id}.blob`;
    const finalPath = this.#path(storageKey);
    const partialPath = join(this.objectsRoot, `.${id}.${randomUUID()}.partial`);
    let handle;
    let installed = false;
    let observedBytes = 0;
    const hash = createHash('sha256');
    const textChunks = [];
    let leading = Buffer.alloc(0);
    try {
      handle = await open(partialPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      await chmod(partialPath, 0o600);
      for await (const value of stream) {
        const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
        observedBytes += chunk.length;
        if (observedBytes > expectedBytes || observedBytes > maximum) {
          throw storageError(413, 'FILE_SIZE_LIMIT', 'Uploaded bytes exceed the persistent reservation.');
        }
        hash.update(chunk);
        if (kind === 'TEXT') textChunks.push(chunk);
        if (kind === 'AUDIO' && leading.length < 32) {
          leading = Buffer.concat([leading, chunk.subarray(0, 32 - leading.length)]);
        }
        let offset = 0;
        while (offset < chunk.length) {
          const { bytesWritten } = await handle.write(chunk, offset, chunk.length - offset);
          if (bytesWritten <= 0) throw new Error('Private upload write made no progress.');
          offset += bytesWritten;
        }
      }
      if (observedBytes !== expectedBytes) {
        throw badRequest('UPLOAD_LENGTH_MISMATCH', 'Uploaded bytes do not match the persistent reservation.');
      }
      let normalizedText = null;
      if (kind === 'TEXT') {
        try {
          normalizedText = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(textChunks));
        } catch {
          throw storageError(415, 'INVALID_TEXT_ENCODING', 'Text uploads must be strict UTF-8.');
        }
        if (!isBoundedInferenceInputText(normalizedText, 1, MAX_TEXT_FILE_BYTES) || normalizedText.trim() === '') {
          throw storageError(415, 'INVALID_TEXT_CONTENT', 'Text uploads contain unsupported control or replacement characters.');
        }
      } else if (!validateAudioMagic(contentType, leading)) {
        throw storageError(415, 'AUDIO_MAGIC_MISMATCH', 'Audio bytes do not match the declared supported media type.');
      }
      await handle.sync();
      await handle.close();
      handle = null;
      await link(partialPath, finalPath);
      installed = true;
      await unlink(partialPath);
      await this.#syncObjectsDirectory();
      const stat = await lstat(finalPath);
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600 || stat.size !== observedBytes) {
        throw new Error('Installed private upload failed its post-write invariant.');
      }
      return { storageKey, observedBytes, sha256: hash.digest('hex'), normalizedText };
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      await unlink(partialPath).catch(() => {});
      if (installed) await unlink(finalPath).catch(() => {});
      throw error;
    }
  }

  async read(storageKey, maximumBytes) {
    await this.init();
    await this.#assertBoundary();
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || maximumBytes > MAX_AUDIO_FILE_BYTES) {
      throw badRequest('INVALID_READ_LIMIT', 'Private upload read limit is invalid.');
    }
    const path = this.#path(storageKey);
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || mode(stat) !== 0o600 || stat.size < 1 || stat.size > maximumBytes) {
        throw new Error('Private upload file invariant failed.');
      }
      const chunks = [];
      let position = 0;
      while (position < stat.size) {
        const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, stat.size - position));
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
        if (bytesRead < 1) throw new Error('Private upload read made no progress.');
        chunks.push(buffer.subarray(0, bytesRead));
        position += bytesRead;
      }
      const finalStat = await handle.stat();
      if (finalStat.size !== stat.size || mode(finalStat) !== 0o600) {
        throw new Error('Private upload changed during its bounded read.');
      }
      return Buffer.concat(chunks, stat.size);
    } finally {
      await handle.close();
    }
  }

  async open(storageKey, { maximumBytes = MAX_AUDIO_FILE_BYTES, signal } = {}) {
    await this.init();
    await this.#assertBoundary();
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || maximumBytes > MAX_AUDIO_FILE_BYTES) {
      throw badRequest('INVALID_READ_LIMIT', 'Private upload read limit is invalid.');
    }
    const handle = await open(this.#path(storageKey), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || mode(stat) !== 0o600 || stat.size < 1 || stat.size > maximumBytes) {
        throw new Error('Private upload file invariant failed.');
      }
      return {
        body: handle.createReadStream({ autoClose: true, signal }),
        contentLength: stat.size
      };
    } catch (error) {
      await handle.close().catch(() => {});
      throw error;
    }
  }

  async delete(storageKey) {
    await this.init();
    await this.#assertBoundary();
    const path = this.#path(storageKey);
    try {
      const stat = await lstat(path);
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600) {
        throw new Error('Private upload deletion target is not a private regular file.');
      }
      await unlink(path);
      await this.#syncObjectsDirectory();
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  async exists(storageKey) {
    await this.init();
    await this.#assertBoundary();
    try {
      const stat = await lstat(this.#path(storageKey));
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600) {
        throw new Error('Private upload lookup target is not a private regular file.');
      }
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return false;
    }
  }

  async inventory({ maxEntries = 10_000 } = {}) {
    await this.init();
    await this.#assertBoundary();
    if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 100_000) {
      throw badRequest('INVALID_INVENTORY_LIMIT', 'Private upload inventory limit is invalid.');
    }
    const storageKeys = [];
    const objects = [];
    const partials = [];
    let partialCount = 0;
    let unexpectedCount = 0;
    let scannedCount = 0;
    let truncated = false;
    const directory = await opendir(this.objectsRoot);
    for await (const entry of directory) {
      if (scannedCount >= maxEntries) {
        truncated = true;
        break;
      }
      scannedCount += 1;
      if (PARTIAL_NAME.test(entry.name)) {
        partialCount += 1;
        const stat = await lstat(join(this.objectsRoot, entry.name)).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (stat?.isFile() && !stat.isSymbolicLink() && mode(stat) === 0o600) {
          partials.push({ name: entry.name, size: stat.size, mtimeMs: stat.mtimeMs });
        } else if (stat) unexpectedCount += 1;
        continue;
      }
      const storageKey = `objects/${entry.name}`;
      if (!STORAGE_KEY.test(storageKey)) {
        unexpectedCount += 1;
        continue;
      }
      const stat = await lstat(join(this.objectsRoot, entry.name));
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600) {
        unexpectedCount += 1;
        continue;
      }
      storageKeys.push(storageKey);
      objects.push({ storageKey, size: stat.size, mtimeMs: stat.mtimeMs });
    }
    storageKeys.sort();
    objects.sort((left, right) => left.storageKey.localeCompare(right.storageKey));
    partials.sort((left, right) => left.name.localeCompare(right.name));
    return { storageKeys, objects, partials, partialCount, unexpectedCount, scannedCount, truncated };
  }

  async deleteObjectIfUnchanged({ storageKey, size, mtimeMs }) {
    await this.init();
    await this.#assertBoundary();
    const path = this.#path(storageKey);
    try {
      const stat = await lstat(path);
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600
          || stat.size !== size || stat.mtimeMs !== mtimeMs) return false;
      await unlink(path);
      await this.#syncObjectsDirectory();
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  async deletePartialIfUnchanged({ name, size, mtimeMs }) {
    await this.init();
    await this.#assertBoundary();
    if (typeof name !== 'string' || !PARTIAL_NAME.test(name)) {
      throw badRequest('INVALID_STORAGE_KEY', 'Private partial storage key is invalid.');
    }
    const path = join(this.objectsRoot, name);
    try {
      const stat = await lstat(path);
      if (!stat.isFile() || stat.isSymbolicLink() || mode(stat) !== 0o600
          || stat.size !== size || stat.mtimeMs !== mtimeMs) return false;
      await unlink(path);
      await this.#syncObjectsDirectory();
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
}
