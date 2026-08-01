function fail(message) {
  throw Object.assign(new SyntaxError(message), { code: 'INVALID_STRICT_JSON' });
}

function hasUnpairedSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true;
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) return true;
  }
  return false;
}

export function parseStrictJson(text, { maximumDepth = 128 } = {}) {
  if (typeof text !== 'string') fail('Strict JSON input must be text.');
  let offset = 0;

  function whitespace() {
    while (offset < text.length && /[\u0009\u000A\u000D\u0020]/.test(text[offset])) offset += 1;
  }

  function string() {
    if (text[offset] !== '"') fail(`Expected a JSON string at offset ${offset}.`);
    const start = offset;
    offset += 1;
    while (offset < text.length) {
      const character = text[offset];
      if (character === '"') {
        offset += 1;
        let decoded;
        try {
          decoded = JSON.parse(text.slice(start, offset));
        } catch {
          fail(`Invalid JSON string at offset ${start}.`);
        }
        if (hasUnpairedSurrogate(decoded)) fail(`Unpaired Unicode surrogate at offset ${start}.`);
        return decoded;
      }
      if (character === '\\') {
        offset += 1;
        const escape = text[offset];
        if (escape === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(offset + 1, offset + 5))) {
            fail(`Invalid Unicode escape at offset ${offset}.`);
          }
          offset += 5;
          continue;
        }
        if (!['"', '\\', '/', 'b', 'f', 'n', 'r', 't'].includes(escape)) {
          fail(`Invalid JSON escape at offset ${offset}.`);
        }
        offset += 1;
        continue;
      }
      if (character.charCodeAt(0) < 0x20) fail(`Unescaped control character at offset ${offset}.`);
      offset += 1;
    }
    fail(`Unterminated JSON string at offset ${start}.`);
  }

  function value(depth) {
    if (depth > maximumDepth) fail(`Strict JSON exceeds maximum depth ${maximumDepth}.`);
    whitespace();
    const character = text[offset];
    if (character === '"') return string();
    if (character === '{') return object(depth + 1);
    if (character === '[') return array(depth + 1);
    for (const [literal, result] of [['true', true], ['false', false], ['null', null]]) {
      if (text.startsWith(literal, offset)) {
        offset += literal.length;
        return result;
      }
    }
    const number = text.slice(offset).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/);
    if (number) {
      offset += number[0].length;
      const result = Number(number[0]);
      if (!Number.isFinite(result)) fail(`Non-finite JSON number at offset ${offset - number[0].length}.`);
      return result;
    }
    fail(`Invalid JSON value at offset ${offset}.`);
  }

  function object(depth) {
    offset += 1;
    whitespace();
    const result = {};
    const keys = new Set();
    if (text[offset] === '}') {
      offset += 1;
      return result;
    }
    while (offset < text.length) {
      whitespace();
      const key = string();
      if (keys.has(key)) fail(`Duplicate JSON object key: ${key}.`);
      keys.add(key);
      whitespace();
      if (text[offset] !== ':') fail(`Expected ':' at offset ${offset}.`);
      offset += 1;
      const item = value(depth);
      Object.defineProperty(result, key, { value: item, enumerable: true, configurable: true, writable: true });
      whitespace();
      if (text[offset] === '}') {
        offset += 1;
        return result;
      }
      if (text[offset] !== ',') fail(`Expected ',' or '}' at offset ${offset}.`);
      offset += 1;
    }
    fail('Unterminated JSON object.');
  }

  function array(depth) {
    offset += 1;
    whitespace();
    const result = [];
    if (text[offset] === ']') {
      offset += 1;
      return result;
    }
    while (offset < text.length) {
      result.push(value(depth));
      whitespace();
      if (text[offset] === ']') {
        offset += 1;
        return result;
      }
      if (text[offset] !== ',') fail(`Expected ',' or ']' at offset ${offset}.`);
      offset += 1;
    }
    fail('Unterminated JSON array.');
  }

  const parsed = value(0);
  whitespace();
  if (offset !== text.length) fail(`Unexpected trailing JSON content at offset ${offset}.`);
  return parsed;
}
