import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  normalizeHref,
  normalizeImageSrc,
  normalizeProblem,
  practiceDestination,
  problemPath,
  protectMath
} from './reader.js';

test('problem paths are constrained to the fixed archive corpus', () => {
  assert.deepEqual(normalizeProblem('2025', 'B', '25'), { year: 2025, variant: 'B', number: 25 });
  assert.deepEqual(normalizeProblem('../2025', 'Z', '0'), { year: 2025, variant: 'A', number: 1 });
  assert.equal(problemPath(2002, 'A', 1), '2002_AMC_12A_Problems/Problem_01.md');
});

test('practice destinations identify a complete paper with a constrained same-origin query', () => {
  assert.equal(practiceDestination(2024, 'B', 'practice'), 'practice/?form=amc12-2024-b&mode=practice');
  assert.equal(practiceDestination('2023', 'A', 'batch'), 'practice/?form=amc12-2023-a&mode=batch');
  assert.equal(practiceDestination('../2025', 'Z', 'practice'), 'practice/?form=amc12-2025-a&mode=practice');
  assert.throws(() => practiceDestination(2025, 'A', 'unsafe'), {
    name: 'TypeError', message: 'Practice mode must be practice or batch.'
  });
  assert.doesNotMatch(practiceDestination(2025, 'B', 'batch'), /problem|number/i);
});

test('practice destinations preserve root and portal subpath deployments', () => {
  const destination = practiceDestination(2025, 'B', 'batch');
  assert.equal(
    new URL(destination, 'https://kapy.ca/').href,
    'https://kapy.ca/practice/?form=amc12-2025-b&mode=batch'
  );
  assert.equal(
    new URL(destination, 'https://portal.kapy.ca/amc12/').href,
    'https://portal.kapy.ca/amc12/practice/?form=amc12-2025-b&mode=batch'
  );
});

test('archive root declares a labelled modal chooser with two paper-level choices and cancel', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="practiceEntry"[^>]*aria-haspopup="dialog"[^>]*aria-controls="practiceChoiceDialog"/s);
  assert.match(html, /<dialog[^>]*id="practiceChoiceDialog"[^>]*aria-labelledby="practiceChoiceTitle"[^>]*aria-describedby="practiceChoiceDescription"/s);
  assert.match(html, /id="practiceModeLink"[^>]*mode=practice/);
  assert.match(html, /id="batchModeLink"[^>]*mode=batch/);
  assert.match(html, /Add text or audio to this paper's existing completed result\./);
  assert.match(html, /id="practiceChoiceCancel"[^>]*type="button"/);
  const reader = await readFile(new URL('./reader.js', import.meta.url), 'utf8');
  assert.match(reader, /if \(practiceChoiceDialog\?\.open \|\| practiceChoiceDialog\?\.hasAttribute\('open'\)\) return;/,
    'an open chooser must precede Archive arrow-key navigation');
});

test('only HTTP(S) destinations survive link normalization', () => {
  assert.equal(normalizeHref('https://example.com/path'), 'https://example.com/path');
  assert.equal(normalizeHref('/local/path', 'https://archive.example/root/'), 'https://archive.example/local/path');
  assert.equal(normalizeHref('#section', 'https://archive.example/root/'), 'https://archive.example/root/#section');
  assert.equal(normalizeHref('javascript:alert(1)'), null);
  assert.equal(normalizeHref('java\nscript:alert(1)'), null);
  assert.equal(normalizeHref('data:text/html,boom'), null);
  assert.equal(normalizeHref('mailto:test@example.com'), null);
});

test('reviewed images are same-origin and resolve from the fetched source file', () => {
  const sourceBase = 'https://kapy.ca/amc12/2025_AMC_12A_Problems/Problem_05.md';
  assert.equal(
    normalizeImageSrc('../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg', sourceBase),
    'https://kapy.ca/amc12/2025_AMC_12A_Problems/media/problem-05-nested-squares.svg'
  );
  assert.equal(normalizeImageSrc('https://example.com/figure.svg', sourceBase), null);
  assert.equal(normalizeImageSrc('javascript:alert(1)', sourceBase), null);
});

test('math protection retains inline and display TeX without exposing it to Markdown HTML parsing', () => {
  const input = 'Inline $x < y$\n\n$$\\frac{1}{2}$$\n\nplain';
  const { text, blocks } = protectMath(input);
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks.map((block) => ({ content: block.content, display: block.display })), [
    { content: 'x < y', display: false },
    { content: '\\frac{1}{2}', display: true }
  ]);
  assert.equal(text.includes('$'), false);
  assert.match(text, /AMC12_MATH_0/);
});

test('an unclosed display block remains visible source text rather than being discarded', () => {
  const input = 'Before\n$$\nx < y';
  const { text, blocks } = protectMath(input);
  assert.equal(blocks.length, 0);
  assert.equal(text, input);
});

test('a real archive problem retains its headings and TeX blocks through protection', async () => {
  const markdown = await readFile(new URL('../2025_AMC_12A_Problems/Problem_01.md', import.meta.url), 'utf8');
  const { text, blocks } = protectMath(markdown);
  assert.match(text, /^# 2025 AMC 12A Problem 1/m);
  assert.ok(blocks.length >= 10);
  assert.ok(blocks.some((block) => block.display));
});
