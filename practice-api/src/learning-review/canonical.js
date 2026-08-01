import { createHash } from 'node:crypto';

export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Canonical JSON rejects non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  throw new Error('Canonical JSON rejects undefined values.');
}

export function canonicalHash(value, omitted = []) {
  const omit = new Set(omitted);
  const projected = value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter(([key]) => !omit.has(key)))
    : value;
  return createHash('sha256').update(`${canonicalJson(projected)}\n`, 'utf8').digest('hex');
}

export function analysisInputHash(evidenceHash, contextSetHash) {
  return canonicalHash({ evidenceHash, contextSetHash });
}
