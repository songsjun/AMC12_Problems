import { createHash } from 'node:crypto';

const CONTEXT_HASH_SCHEMA = 'amc-question-context-hash-v1';
const INPUT_HASH_SCHEMA = 'amc-student-input-hash-v1';
const ACTIVE_MARKDOWN_OR_LINK = /(?:!\[[^\]]*\]\s*(?:\(|\[)|\[[^\]]+\]\s*(?:\(|\[)|^\s*\[[^\]]+\]:|\b[a-z][a-z0-9+.-]{0,31}:\S|www\.|<[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+>)/imu;
const RAW_HTML = /(?:<!--|<![^>]*>|<\?[^>]*>|<\/?[A-Za-z][A-Za-z0-9-]*(?:[\s/][^<>]*)?>)/iu;
const DANGEROUS_TEX = /\\(?:catcode|class|csname|cssId|def|edef|endcsname|every|expandafter|href|htmlClass|htmlData|htmlId|htmlStyle|immediate|include|includegraphics|input|loop|newcommand|openin|openout|read|renewcommand|repeat|require|setOptions|special|style|url|usepackage|write|write18)\b/iu;
const INVALID_TEXT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/u;

function hasUnpairedSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true;
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) {
      return true;
    }
  }
  return false;
}

export function isBoundedInferenceInputText(value, minimumBytes, maximumBytes) {
  if (typeof value !== 'string' || INVALID_TEXT.test(value) || hasUnpairedSurrogate(value)) return false;
  const bytes = Buffer.byteLength(value, 'utf8');
  return bytes >= minimumBytes && bytes <= maximumBytes;
}

export function isRestrictedInferenceOutputText(value, minimumBytes, maximumBytes) {
  return isBoundedInferenceInputText(value, minimumBytes, maximumBytes)
    && !ACTIVE_MARKDOWN_OR_LINK.test(value) && !RAW_HTML.test(value) && !DANGEROUS_TEX.test(value);
}

// This is deliberately byte-for-byte compatible with the gateway's frozen
// canonicalStableJson implementation. It is separate from the approved
// artifact canonicalizer, whose schema includes a trailing newline.
export function canonicalInferenceJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON rejects non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalInferenceJson).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => {
      if (value[key] === undefined) throw new TypeError('Canonical JSON rejects undefined.');
      return `${JSON.stringify(key)}:${canonicalInferenceJson(value[key])}`;
    }).join(',')}}`;
  }
  throw new TypeError('Canonical JSON accepts only JSON values.');
}

export function inferenceSha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function computeInferenceContextHash(request) {
  const question = request.question;
  return inferenceSha256(canonicalInferenceJson({
    schema: CONTEXT_HASH_SCHEMA,
    question_id: question.question_id,
    prompt_markdown: question.prompt_markdown,
    choices: question.choices,
    official_answer: question.official_answer,
    solutions: question.solutions
  }));
}

export function computeInferenceInputHash(request) {
  return inferenceSha256(canonicalInferenceJson({
    schema: INPUT_HASH_SCHEMA,
    context_hash: request.context_hash,
    student_answer: request.question.student_answer,
    student_reasoning: request.question.student_reasoning
  }));
}
