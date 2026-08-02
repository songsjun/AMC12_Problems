import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  API_BASE,
  ApiError,
  LEARNING_REPORT_POLL_MS,
  MAX_AUDIO_FILE_BYTES,
  MAX_BATCH_FILES,
  MAX_LEARNING_REPORT_POLLS,
  MAX_REASONING_REQUEST_BYTES,
  MAX_TEXT_FILE_BYTES,
  apiBaseForModuleUrl,
  applyTutorThreadTombstone,
  answerPayload,
  attemptAllowsAnswerEdits,
  attemptAllowsReasoningEdits,
  attemptCanBeReset,
  batchConfirmationPayload,
  batchFileDescriptors,
  batchMutationContextMatches,
  batchPollContextMatches,
  canAccessFinalReview,
  createTutorThreadRequest,
  deleteTutorThreadRequest,
  extractAttempt,
  fetchFinalReview,
  fetchLearningReport,
  firstEntitledTutorThreadId,
  forkTutorThreadRequest,
  formatDuration,
  maximumScoreFromSubmission,
  learningAnalysisProjection,
  learningAnalysisDisplayStatus,
  learningHistoryPath,
  learningHistoryQuestionPath,
  learningHistoryReportPath,
  learningHistorySubmissionPath,
  learningVersionQuestionNumbers,
  learningSubmissionEndpointForAttempt,
  learningReportEndpointForAttempt,
  learningReportApprovedSolutionCount,
  learningReportContextMatches,
  learningReportShouldPoll,
  learningReportStatusMessage,
  normalizeChoices,
  normalizeLegacyInlineTeX,
  normalizeLearningHistory,
  normalizeTutorThreadSummary,
  numberedBatchMappingItems,
  normalizeReasoningNotes,
  normalizeLearningReport,
  preserveDirtyReasoningNotes,
  reasoningEnvelopeMatchesAttempt,
  publicFormPath,
  attemptFormPath,
  formCacheKey,
  hasUsedPreliminarySubmission,
  idempotencyHeaderValue,
  safeUrl,
  sameAttemptId,
  scoreFromSubmission,
  resetReplacementFromHistory,
  resetLearningTutorState,
  resetTutorConversationState,
  reasoningNotesPath,
  reasoningNotesPayload,
  reasoningRequestBodyBytes,
  reasoningSaveBatches,
  reasoningCapabilityNeedsReload,
  retryIdempotentNetworkMutation,
  retryTutorRequestRequest,
  attemptSwitchNeedsReasoningFlush,
  isReasoningRevisionConflict,
  saveResponseNeedsReconciliation,
  sanitizeRestrictedTeX,
  scrubRestrictedMathDom,
  shouldMergeAttemptUpdate,
  sendTutorMessageRequest,
  solutionEndpointForAttempt,
  submissionPrecondition,
  submitLearningBatchFiles,
  tutorPollContextMatches,
  tutorBundleMatchesIdentity,
  tutorFullGetSourceUnavailable,
  tutorListPageContextMatches,
  tutorRequestIsPending,
  tutorRequestMayRetry,
  tutorThreadPath,
  tutorThreadListPath,
  tutorThreadLoadContextMatches,
  tutorThreadRowModel,
  tutorThreadsPath,
  tutorSummaryFromBundle,
  tutorSummaryMatchesIdentity,
  validTutorMessage,
  timedLimitLocallyReached
} from './app.mjs';

const practiceDirectory = new URL('.', import.meta.url);

test('MathJax is self-hosted, pinned with SRI, and has its local SVG font asset', () => {
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  const mathJax = readFileSync(new URL('vendor/mathjax/tex-svg-full.js', practiceDirectory));
  const fontPath = fileURLToPath(new URL('vendor/mathjax/output/svg/fonts/tex.js', practiceDirectory));
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.match(html, /src=["']\.\/vendor\/mathjax\/tex-svg-full\.js["']/);
  const hash = createHash('sha384').update(mathJax).digest('base64');
  assert.match(html, new RegExp(`integrity=["']sha384-${hash}["']`));
  assert.equal(readFileSync(fontPath).length > 1_000_000, true);
  assert.equal(existsSync(new URL('mathjax-security-smoke.html', practiceDirectory)), false,
    'browser probes are generated outside the production static tree');
});

test('MathJax accepts AMC dollar delimiters, preserves escaped currency, and retries after ready', () => {
  const config = readFileSync(new URL('mathjax-config.js', practiceDirectory), 'utf8');
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  const syntheticQuestion = readFileSync(new URL('../practice-content/fixtures/synthetic-25/source/Problem_01.md', practiceDirectory), 'utf8');
  assert.match(syntheticQuestion, /\$\\textbf\{\(A\)/, 'fixture exercises a $...$ inline expression');
  assert.match(config, /inlineMath:\s*\[\['\$', '\$'\], \['\\\\\(', '\\\\\)'\]\]/);
  assert.match(config, /processEscapes:\s*true/);
  assert.match(client, /window\.addEventListener\('mathjax-ready'/);
  assert.match(client, /typesetVisiblePracticeMath\(\)/, 'a late MathJax ready event must retry visible TeX');
  const latePass = client.match(/function typesetVisiblePracticeMath\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  for (const target of [
    'learningVersionReportSummary', 'learningVersionQuestions', 'learningQuestionPrompt',
    'learningQuestionChoices', 'learningQuestionResponse', 'learningQuestionAnalysis',
    'tutorMessages'
  ]) assert.match(latePass, new RegExp(`elements\\.${target}\\b`), target);
});

test('restricted MathJax enables only AMC-safe parser packages and bounded expansion', () => {
  const config = readFileSync(new URL('mathjax-config.js', practiceDirectory), 'utf8');
  const sandbox = { window: {} };
  runInNewContext(config, sandbox);
  const mathJax = sandbox.window.MathJax;
  assert.deepEqual([...mathJax.tex.packages], [
    'base', 'ams', 'boldsymbol', 'cancel', 'color', 'mathtools', 'newcommand', 'noundefined'
  ]);
  assert.equal(mathJax.tex.processRefs, false);
  assert.equal(mathJax.tex.maxMacros, 1_000);
  assert.equal(mathJax.tex.maxBuffer, 20 * 1024);
  assert.equal(mathJax.options.enableMenu, false);
  for (const forbidden of ['autoload', 'require', 'html', 'action', 'bbox', 'textmacros']) {
    assert.equal(mathJax.tex.packages.includes(forbidden), false);
  }
});

test('restricted TeX preprocessing neutralizes extension, URL, DOM-attribute, and macro aliases', () => {
  const hostile = String.raw`$\href{https://example.invalid}{x} \url{x} \includegraphics{x}
    \require{html} \class{attacker}{x} \cssId{attacker}{x} \style{color:red}{x} \textcolor{red}{x}
    \newcommand{\x}{y} \def\x{y} \gdef\x{y} \DeclareMathOperator{\x}{x}
    \let\x\href \csname href\endcsname$`;
  const sanitized = sanitizeRestrictedTeX(hostile);
  assert.doesNotMatch(sanitized, /\\(?:href|url|includegraphics|require|class|cssId|style|textcolor|newcommand|def|gdef|DeclareMathOperator|let|csname)\b/iu);
  assert.match(sanitized, /\\operatorname\{unsupported\}/);
  assert.equal(
    sanitizeRestrictedTeX(String.raw`$\frac{1}{2}+\sqrt{3}+\binom{8}{2}+\overline{AB}+\angle ABC$`),
    String.raw`$\frac{1}{2}+\sqrt{3}+\binom{8}{2}+\overline{AB}+\angle ABC$`
  );
});

test('restricted Math DOM scrub unwraps links and removes resource or executable attributes', () => {
  const makeElement = (localName, attributes = [], textContent = '') => ({
    localName,
    attributes: attributes.map(([name, value]) => ({ name, value })),
    textContent,
    removed: false,
    replacement: null,
    ownerDocument: { createTextNode: (value) => ({ nodeType: 3, textContent: value }) },
    replaceWith(value) { this.replacement = value; },
    remove() { this.removed = true; },
    removeAttribute(name) { this.attributes = this.attributes.filter((item) => item.name !== name); }
  });
  const anchor = makeElement('a', [['href', 'https://example.invalid']], 'kept as text');
  const image = makeElement('img', [['src', 'data:image/gif;base64,AAAA']]);
  const hostile = makeElement('span', [
    ['onclick', 'alert(1)'], ['style', 'background-image:url(https://example.invalid)'], ['id', 'ordinary-id']
  ]);
  const glyphUse = makeElement('use', [['xlink:href', '#MJX-TEX-N-31']]);
  const all = [anchor, image, hostile, glyphUse];
  scrubRestrictedMathDom({
    querySelectorAll(selector) {
      return selector === '*' ? all : [anchor, image];
    }
  });
  assert.equal(anchor.replacement.textContent, 'kept as text');
  assert.equal(image.removed, true);
  assert.deepEqual(hostile.attributes, [{ name: 'id', value: 'ordinary-id' }]);
  assert.deepEqual(glyphUse.attributes, [{ name: 'xlink:href', value: '#MJX-TEX-N-31' }],
    'local SVG glyph references required by MathJax remain intact');
});

const chromePath = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].find((candidate) => candidate && existsSync(candidate));

test('browser MathJax smoke renders AMC TeX without dangerous nodes, attributes, or requests', {
  skip: chromePath ? false : 'Chrome/Chromium is unavailable in this environment'
}, () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'amc12-mathjax-smoke-'));
  const page = join(temporaryDirectory, 'probe.html');
  const probe = join(temporaryDirectory, 'probe.js');
  const configUrl = new URL('mathjax-config.js', practiceDirectory).href;
  const bundleUrl = new URL('vendor/mathjax/tex-svg-full.js', practiceDirectory).href;
  try {
    writeFileSync(probe, `
(() => {
  const finish = async () => {
    try {
      await window.MathJax.startup.promise;
      const ordinary = document.getElementById('ordinary');
      const hostile = document.getElementById('hostile');
      const violations = [];
      if (!ordinary.querySelector('mjx-container svg')) violations.push('ordinary AMC TeX did not render');
      if (hostile.querySelector('a, img, image, foreignObject, iframe, object, embed')) {
        violations.push('hostile TeX created a resource-capable element');
      }
      for (const element of hostile.querySelectorAll('*')) {
        for (const attribute of Array.from(element.attributes || [])) {
          const name = attribute.name.toLowerCase();
          const value = attribute.value;
          if (name.startsWith('on')) violations.push('event attribute: ' + name);
          if (['href', 'xlink:href', 'src', 'srcset'].includes(name) && !value.startsWith('#')) {
            violations.push('external attribute: ' + name);
          }
          if (['class', 'id', 'style'].includes(name)
              && /attacker-|example\\.invalid|background-image/iu.test(value)) {
            violations.push('caller-controlled attribute: ' + name);
          }
        }
      }
      if (performance.getEntriesByType('resource').some((entry) => entry.name.includes('example.invalid'))) {
        violations.push('hostile TeX initiated an external resource request');
      }
      document.body.dataset.probe = violations.length ? 'failed' : 'passed';
      document.getElementById('probe-output').textContent = violations.join('\\n') || 'passed';
    } catch (error) {
      document.body.dataset.probe = 'failed';
      document.getElementById('probe-output').textContent = String(error && (error.stack || error));
    }
  };
  window.addEventListener('mathjax-ready', finish, { once: true });
})();
`, 'utf8');
    writeFileSync(page, `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' file:; style-src 'unsafe-inline'; img-src 'none'; connect-src 'none'; font-src 'self' file:">
<title>Restricted MathJax security smoke test</title></head>
<body data-probe="pending">
<div id="ordinary">\\(\\frac{1}{2}+\\sqrt{3}+\\binom{8}{2}+\\overline{AB}+\\angle ABC+\\boldsymbol{x}+\\textcolor{red}{2}+\\cancel{3}+a\\coloneqq b\\)</div>
<div id="hostile">
\\(\\href{https://example.invalid/href}{x}\\) \\(\\url{https://example.invalid/url}\\)
\\(\\includegraphics{https://example.invalid/image.png}\\) \\(\\require{html}\\)
\\(\\class{attacker-class}{x}\\) \\(\\cssId{attacker-id}{x}\\)
\\(\\style{background-image:url(https://example.invalid/style)}{x}\\)
</div><pre id="probe-output">waiting</pre>
<script src="${configUrl}"></script><script src="./probe.js"></script><script src="${bundleUrl}"></script>
</body></html>`, 'utf8');
    const dom = execFileSync(chromePath, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
      '--virtual-time-budget=5000', '--dump-dom', page
    ], { encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'] });
    assert.match(dom, /<body data-probe="passed">/);
    assert.match(dom, /id="ordinary"[^>]*>\s*<mjx-container/);
    assert.match(dom, /id="probe-output">passed<\/pre>/);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test('legacy unwrapped TeX commands become isolated MathJax spans without changing authored math', () => {
  assert.equal(
    normalizeLegacyInlineTeX('Let \\clubsuit(x)=\\frac{1}{2}; $\\sqrt{3}$ stays authored.'),
    'Let \\(\\clubsuit\\)(x)=\\(\\frac{1}{2}\\); $\\sqrt{3}$ stays authored.'
  );
  assert.equal(
    normalizeLegacyInlineTeX('The arc \\overarc{ABC} and \\textdollar are historical source notation.'),
    'The arc \\(\\widehat{ABC}\\) and \\(\\$\\) are historical source notation.'
  );
  assert.equal(
    normalizeLegacyInlineTeX('Use \\frac 18 and \\sqrt3, then pay $20.'),
    'Use \\(\\frac{1}{8}\\) and \\(\\sqrt{3}\\), then pay \\$20.'
  );
});

test('practice deployment keeps scripts and API calls same-origin under CSP', () => {
  const nginx = readFileSync(new URL('../deploy/nginx/workspace-amc12-static.conf', practiceDirectory), 'utf8');
  assert.match(nginx, /location \^~ \/practice\//);
  assert.match(nginx, /script-src 'self'/);
  assert.match(nginx, /connect-src 'self'/);
  assert.match(nginx, /location \^~ \/api\/amc12\//);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8090/);
});

test('pre-final attempts cannot request or expose final review paths', async () => {
  const calls = [];
  const client = {
    async get(path) {
      calls.push(path);
      return {};
    }
  };
  const attempt = { id: 'attempt-1', phase: 'TIMED', clockState: 'RUNNING' };

  assert.equal(canAccessFinalReview(attempt), false);
  assert.equal(solutionEndpointForAttempt(attempt), null);
  assert.equal(learningSubmissionEndpointForAttempt(attempt), null);
  assert.equal(learningReportEndpointForAttempt(attempt), null);
  await assert.rejects(fetchFinalReview(client, attempt), { code: 'FINAL_REVIEW_NOT_AVAILABLE' });
  await assert.rejects(fetchLearningReport(client, attempt), { code: 'FINAL_REVIEW_NOT_AVAILABLE' });
  assert.deepEqual(calls, [], 'the client must not make results/solutions/report calls before final submission');
});

test('only a finalized attempt requests results and solutions', async () => {
  const calls = [];
  const client = {
    async get(path) {
      calls.push(path);
      return { path };
    }
  };
  const attempt = { id: 'attempt-42', phase: 'FINALIZED', clockState: 'PAUSED' };

  const review = await fetchFinalReview(client, attempt);
  assert.deepEqual(calls, [
    `${API_BASE}/attempts/attempt-42/results`,
    `${API_BASE}/attempts/attempt-42/solutions`
  ]);
  assert.equal(review.results.path, calls[0]);
  assert.equal(review.solutions.path, calls[1]);
  assert.equal(
    learningSubmissionEndpointForAttempt(attempt),
    `${API_BASE}/attempts/attempt-42/learning-submission`
  );
  const report = await fetchLearningReport(client, attempt);
  assert.equal(report.path, `${API_BASE}/attempts/attempt-42/learning-report`);
  assert.equal(calls.at(-1), `${API_BASE}/attempts/attempt-42/learning-report`);
});

test('a reset attempt is reviewable only when the server marks a prior final result available', () => {
  assert.equal(canAccessFinalReview({ id: 'reset-blank', phase: 'RESET', resultsAvailable: false }), false);
  assert.equal(solutionEndpointForAttempt({ id: 'reset-blank', phase: 'RESET', resultsAvailable: false }), null);
  assert.equal(canAccessFinalReview({ id: 'reset-final', phase: 'RESET', resultsAvailable: true }), true);
  assert.equal(solutionEndpointForAttempt({ id: 'reset-final', phase: 'RESET', resultsAvailable: true }), `${API_BASE}/attempts/reset-final/solutions`);
  assert.equal(learningReportEndpointForAttempt({ id: 'reset-final', phase: 'RESET', resultsAvailable: true }), `${API_BASE}/attempts/reset-final/learning-report`);
});

test('a paused timer cannot edit answers, matching the server state machine', () => {
  assert.equal(attemptAllowsAnswerEdits({ phase: 'TIMED', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'OVERTIME', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'TIMED', clockState: 'PAUSED' }), false);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'LIMIT_NOTICE', clockState: 'PAUSED' }), false);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'FINALIZED', clockState: 'PAUSED' }), false);
});

test('reasoning notes share the answer-edit state machine and accept an explicit blank', () => {
  assert.equal(attemptAllowsReasoningEdits({ phase: 'TIMED', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsReasoningEdits({ phase: 'OVERTIME', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsReasoningEdits({ phase: 'TIMED', clockState: 'PAUSED' }), false);
  assert.equal(attemptAllowsReasoningEdits({ phase: 'FINALIZED', clockState: 'PAUSED' }), false);
  assert.equal(reasoningNotesPath('attempt / one'), `${API_BASE}/attempts/attempt%20%2F%20one/reasoning-notes`);
  assert.deepEqual(reasoningNotesPayload(new Map([[3, '  '], [1, 'Try parity.']])), [
    { questionNumber: 1, reasoningText: 'Try parity.' },
    { questionNumber: 3, reasoningText: null }
  ]);
});

test('reasoning envelopes accept the API wrapper and bare rolling-deploy response', () => {
  const apiEnvelope = {
    attemptId: 'attempt-1', reasoningRevision: 4, stateRevision: 9, editable: true,
    notes: [{ questionNumber: 1, reasoningText: 'Server note' }, { questionNumber: 2, reasoningText: null }]
  };
  const envelope = normalizeReasoningNotes({ data: { reasoning: apiEnvelope } });
  assert.equal(envelope.attemptId, 'attempt-1');
  assert.equal(envelope.reasoningRevision, 4);
  assert.equal(envelope.stateRevision, 9);
  assert.equal(envelope.editable, true);
  assert.deepEqual([...envelope.notes], [[1, 'Server note'], [2, '']]);
  assert.deepEqual(normalizeReasoningNotes(apiEnvelope), envelope);
  assert.equal(reasoningEnvelopeMatchesAttempt(envelope, 'attempt-1'), true);
  assert.equal(reasoningEnvelopeMatchesAttempt(envelope, 'attempt-2'), false);
  assert.equal(reasoningEnvelopeMatchesAttempt(normalizeReasoningNotes({ reasoningRevision: 1 }), 'attempt-1'), false);
  assert.deepEqual([...preserveDirtyReasoningNotes(
    envelope.notes,
    new Map([[1, 'Unsaved local text'], [3, 'New local text']]),
    new Set([1, 3])
  )], [[1, 'Unsaved local text'], [2, ''], [3, 'New local text']]);
});

test('large dirty reasoning sets split by text and the exact JSON UTF-8 request body', () => {
  const text = 'x'.repeat(8_000);
  const notes = new Map(Array.from({ length: 7 }, (_, index) => [index + 1, text]));
  const batches = reasoningSaveBatches(notes, new Set(notes.keys()), 4);
  assert.deepEqual(batches.map((batch) => batch.size), [6, 1]);
  assert.deepEqual(reasoningNotesPayload(batches[1]), [{ questionNumber: 7, reasoningText: text }]);
  assert.equal(batches.every((batch) => reasoningRequestBodyBytes(4, batch) <= MAX_REASONING_REQUEST_BYTES), true);

  const escaped = '\\\"\u0000\n\t'.repeat(1_600);
  assert.equal(new TextEncoder().encode(escaped).byteLength, 8_000);
  const escapedNotes = new Map(Array.from({ length: 4 }, (_, index) => [index + 1, escaped]));
  const escapedBatches = reasoningSaveBatches(escapedNotes, new Set(escapedNotes.keys()), 99);
  assert.equal(escapedBatches.length > 1, true, 'JSON escaping, not just raw text size, must split requests');
  assert.equal(escapedBatches.every((batch) => reasoningRequestBodyBytes(99, batch) <= MAX_REASONING_REQUEST_BYTES), true);

  const plusOne = new Map(Array.from({ length: 6 }, (_, index) => [index + 1, text]));
  plusOne.set(7, '+');
  assert.deepEqual(reasoningSaveBatches(plusOne, new Set(plusOne.keys()), 4).map((batch) => batch.size), [6, 1]);
});

test('each reasoning note is strictly limited to 8000 UTF-8 bytes for CJK and emoji', () => {
  const cjkAtLimit = '思'.repeat(2_666) + 'ab';
  const emojiAtLimit = '🧠'.repeat(2_000);
  assert.equal(new TextEncoder().encode(cjkAtLimit).byteLength, 8_000);
  assert.equal(new TextEncoder().encode(emojiAtLimit).byteLength, 8_000);
  assert.equal(reasoningSaveBatches(new Map([[1, cjkAtLimit]]), new Set([1]), 0).length, 1);
  assert.equal(reasoningSaveBatches(new Map([[1, emojiAtLimit]]), new Set([1]), 0).length, 1);
  assert.throws(
    () => reasoningSaveBatches(new Map([[1, `${cjkAtLimit}+`]]), new Set([1]), 0),
    (error) => error instanceof ApiError && error.code === 'REASONING_NOTE_TOO_LARGE'
  );
  assert.throws(
    () => reasoningSaveBatches(new Map([[1, `${emojiAtLimit}+`]]), new Set([1]), 0),
    (error) => error instanceof ApiError && error.code === 'REASONING_NOTE_TOO_LARGE'
  );
  assert.throws(
    () => reasoningSaveBatches(new Map([[1, 'x']]), new Set([1]), null),
    (error) => error instanceof ApiError && error.code === 'REASONING_REVISION_MISSING'
  );
});

test('reasoning saves are serialized, retry stale revisions, and flush before final scoring', () => {
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /state\.reasoningSaveQueue = state\.reasoningSaveQueue/);
  assert.equal(isReasoningRevisionConflict(new ApiError('stale', {
    status: 409, code: 'REASONING_REVISION_CONFLICT'
  })), true);
  assert.equal(isReasoningRevisionConflict(new ApiError('other conflict', {
    status: 409, code: 'ATTEMPT_STATE_CONFLICT'
  })), false, 'an unrelated HTTP 409 must never trigger a reasoning retry');
  assert.doesNotMatch(client, /REASONING_REVISION_CONFLICT[^\n]*\|\|[^\n]*status === 409/);
  assert.match(client, /async function finalizeAttempt\([^)]*\)[\s\S]*?await flushAnswerSaves\(\)[\s\S]*?await flushReasoningSaves\(\)[\s\S]*?submissionRequestPayload/);
  assert.match(client, /state\.attempt = \{ \.\.\.state\.attempt, stateRevision: envelope\.stateRevision \}/);
  assert.doesNotMatch(client, /\.innerHTML\s*=/, 'student reasoning must never be injected as raw HTML');
});

test('reasoning capability reloads after pause/resume and limit/overtime transitions', () => {
  assert.equal(reasoningCapabilityNeedsReload(
    { id: 'a', phase: 'TIMED', clockState: 'PAUSED' },
    { id: 'a', phase: 'TIMED', clockState: 'RUNNING' }
  ), true);
  assert.equal(reasoningCapabilityNeedsReload(
    { id: 'a', phase: 'LIMIT_NOTICE', clockState: 'PAUSED' },
    { id: 'a', phase: 'OVERTIME', clockState: 'RUNNING' }
  ), true);
  assert.equal(reasoningCapabilityNeedsReload(
    { id: 'a', phase: 'TIMED', clockState: 'RUNNING' },
    { id: 'a', phase: 'TIMED', clockState: 'RUNNING' }
  ), false);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /async function resumeTimer\(\)[\s\S]*?reasoningCapabilityNeedsReload[\s\S]*?loadReasoningNotes/);
  assert.match(client, /async function continueAfterLimit\(\)[\s\S]*?reasoningCapabilityNeedsReload[\s\S]*?loadReasoningNotes/);
});

test('attempt switches flush local approaches before clear and expose explicit recovery', () => {
  assert.equal(attemptSwitchNeedsReasoningFlush('a', 'b', 1, 0), true);
  assert.equal(attemptSwitchNeedsReasoningFlush('a', 'b', 0, 1), true);
  assert.equal(attemptSwitchNeedsReasoningFlush('a', 'a', 1, 1), false);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /async function resumeAttempt[\s\S]*?flushBeforeAttemptSwitch[\s\S]*?api\.get[\s\S]*?openAttempt/);
  assert.match(client, /async function openAttempt[\s\S]*?flushBeforeAttemptSwitch[\s\S]*?clearAttemptState/);
  assert.match(client, /function offerUnsavedReasoningRecovery[\s\S]*?Reload saved notes[\s\S]*?Discard notes and/);
  assert.match(client, /async function finalizeAttempt[\s\S]*?offerUnsavedReasoningRecovery/);
  assert.match(client, /async function resetAttempt[\s\S]*?offerUnsavedReasoningRecovery/);
  assert.match(client, /reasoningSaveRequested/);
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  assert.match(html, /id="reload-reasoning-button"[^>]*hidden/);
});

test('final learning projections expose analysis state without replacing the objective score', () => {
  assert.deepEqual(learningAnalysisProjection({ learningSubmission: {
    id: 'learning-1', status: 'COMMITTED', analysisStatus: 'PENDING', ignored: '<b>unsafe</b>'
  } }), { status: 'COMMITTED', analysisStatus: 'PENDING' });
  assert.equal(learningAnalysisDisplayStatus({
    status: 'CONTEXT_UNAVAILABLE', analysisStatus: 'BLOCKED_CONTEXT'
  }), 'CONTEXT_UNAVAILABLE');
  assert.equal(learningAnalysisDisplayStatus({ status: 'READY', analysisStatus: 'PENDING' }), 'PENDING');
  assert.equal(learningAnalysisProjection({ result: {} }), null);
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  assert.match(html, /id="final-score"/);
  assert.match(html, /id="analysis-summary"[^>]*hidden/);
});

test('learning reports normalize bare and wrapped response contracts without render-only internals', () => {
  const payload = {
    learningSubmissionId: 'internal-learning-id',
    version: 3,
    status: 'PARTIAL',
    generatedAt: '2026-08-01T12:00:00.000Z',
    summary: { totalQuestions: 1, analyzedCount: 1, unassessableCount: 0, failedCount: 0 },
    pins: { evidenceHash: 'internal-pin' },
    provider: 'must-not-render', model: 'must-not-render', prompt: 'must-not-render', error: 'must-not-render',
    questions: [{
      questionNumber: 2,
      status: 'SUCCEEDED',
      reasoningVerdict: 'Promising setup',
      summaryMarkdown: 'Use **parity**. <img src=x onerror=alert(1)> [outside](https://evil.example)',
      strengths: ['Correct invariant'], gaps: ['Missed an edge case'], suggestions: ['Check endpoints'],
      confidence: 0.75, providerInvoked: true,
      solutionComparisons: [{
        solutionId: 'private-solution-id', methodTags: ['parity'], alignment: 'strong',
        analysisMarkdown: 'The same invariant appears.'
      }]
    }]
  };
  const wrapped = normalizeLearningReport({ data: { report: payload } });
  const bare = normalizeLearningReport(payload);
  assert.deepEqual(wrapped, bare);
  assert.equal(wrapped.status, 'PARTIAL');
  assert.equal(wrapped.questions[0].questionNumber, 2);
  assert.equal(wrapped.questions[0].status, 'SUCCEEDED');
  assert.deepEqual(wrapped.summary, { totalQuestions: 1, analyzedCount: 1, unassessableCount: 0, failedCount: 0 });
  assert.equal(wrapped.questions[0].solutionComparisons[0].solutionId, undefined);
  assert.equal(wrapped.questions[0].providerInvoked, undefined);
  assert.equal(wrapped.provider, undefined);
  assert.equal(wrapped.model, undefined);
  assert.equal(wrapped.prompt, undefined);
  assert.equal(wrapped.error, undefined);
  assert.equal(learningReportApprovedSolutionCount(wrapped), 1);
});

test('learning report statuses distinguish missing context, partial work, weak evidence, and failure', () => {
  for (const status of ['CONTEXT_UNAVAILABLE', 'QUEUED', 'RUNNING', 'COMPLETE', 'PARTIAL', 'UNASSESSABLE', 'FAILED']) {
    assert.equal(normalizeLearningReport({ report: { status, questions: [] } }).status, status);
  }
  assert.equal(normalizeLearningReport({ report: { status: 'UNKNOWN', questions: [] } }), null);
  assert.match(learningReportStatusMessage('CONTEXT_UNAVAILABLE'), /reference solutions have not yet been approved/i);
  assert.match(learningReportStatusMessage('UNASSESSABLE'), /not enough written reasoning/i);
  assert.match(learningReportStatusMessage('FAILED'), /does not restart AI processing/i);
  assert.equal(learningReportShouldPoll('QUEUED'), true);
  assert.equal(learningReportShouldPoll('RUNNING'), true);
  assert.equal(learningReportShouldPoll('PARTIAL'), false);
  assert.equal(LEARNING_REPORT_POLL_MS, 5_000);
  assert.equal(MAX_LEARNING_REPORT_POLLS > 0 && MAX_LEARNING_REPORT_POLLS <= 24, true);
});

test('report polling rejects stale attempts and stops when the results view is left', () => {
  const context = { id: 'attempt-1', epoch: 8 };
  assert.equal(learningReportContextMatches(context, 'attempt-1', 8, true), true);
  assert.equal(learningReportContextMatches(context, 'attempt-2', 8, true), false);
  assert.equal(learningReportContextMatches(context, 'attempt-1', 9, true), false);
  assert.equal(learningReportContextMatches(context, 'attempt-1', 8, false), false);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /state\.learningReportPollCount >= MAX_LEARNING_REPORT_POLLS/);
  assert.match(client, /view !== elements\.resultsView\) stopLearningReportPolling\(\)/);
  assert.match(client, /isCurrentLearningReportContext\(context\)[\s\S]*?loadLearningReport/);
});

test('objective score renders before a read-only report refresh and report Markdown cannot activate links', async () => {
  const methods = [];
  const client = {
    async get(path) {
      methods.push(['GET', path]);
      return { report: { status: 'FAILED', questions: [] } };
    },
    async post() { methods.push(['POST']); },
    async put() { methods.push(['PUT']); }
  };
  await fetchLearningReport(client, { id: 'final / one', phase: 'FINALIZED' });
  assert.deepEqual(methods, [['GET', `${API_BASE}/attempts/final%20%2F%20one/learning-report`]]);

  const source = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(source, /renderResults\(review\.results, review\.solutions\);[\s\S]*?loadLearningReport/);
  assert.match(source, /renderMarkdown\([^;]+allowExternalResources: false/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /solutionId[^\n]*textContent|provider[^\n]*textContent|model[^\n]*textContent|prompt[^\n]*textContent/i);
  assert.match(source, /if \(!allowExternalResources\)[\s\S]*?appendLegacyAwareText\(parent, raw\)/);
});

test('the displayed 75-minute boundary immediately locks timed answers before the next poll', () => {
  const attempt = { phase: 'TIMED', clockState: 'RUNNING', durationMs: 4_500_000 };
  assert.equal(timedLimitLocallyReached(attempt, 4_499_999), false);
  assert.equal(timedLimitLocallyReached(attempt, 4_500_000), true);
  assert.equal(timedLimitLocallyReached({ ...attempt, clockState: 'PAUSED' }, 4_500_000), false);
  assert.equal(timedLimitLocallyReached({ ...attempt, phase: 'OVERTIME' }, 4_500_000), false);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /requestDeadlineReconciliation\(\)/, 'the local boundary must immediately reconcile with the server');
  assert.match(client, /urgent:\s*true/, 'deadline reconciliation must not wait behind the ordinary poll');
});

test('reset is offered for every non-reset lifecycle phase', () => {
  for (const phase of ['TIMED', 'LIMIT_NOTICE', 'OVERTIME', 'FINALIZED']) {
    assert.equal(attemptCanBeReset({ id: 'attempt-reset', phase }), true, phase);
  }
  assert.equal(attemptCanBeReset({ id: 'attempt-reset', phase: 'RESET' }), false);
  assert.equal(attemptCanBeReset({ phase: 'TIMED' }), false);
});

test('answer payload remains sorted and sends explicit blanks', () => {
  const payload = answerPayload(new Map([[25, 'e'], [1, 'A'], [3, null], [2, 'not-an-option']]));
  assert.deepEqual(payload, [
    { questionNumber: 1, selectedOption: 'A' },
    { questionNumber: 2, selectedOption: null },
    { questionNumber: 3, selectedOption: null },
    { questionNumber: 25, selectedOption: 'E' }
  ]);
});

test('the practice UI lets a student restore an answer to a scored blank', () => {
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(html, /id="clear-answer-button"/);
  assert.match(client, /updateQuestionAnswer\(question\.number, null\)/);
  assert.match(client, /clearAnswerButton\.disabled = !enabled \|\| selected === null/);
});

test('a deadline snapshot consumes the same preliminary slot as a manual score check', () => {
  assert.equal(hasUsedPreliminarySubmission({ submissions: [] }), false);
  assert.equal(hasUsedPreliminarySubmission({ submissions: [{ kind: 'CHECKPOINT' }] }), true);
  assert.equal(hasUsedPreliminarySubmission({ submissions: [{ kind: 'DEADLINE' }] }), true);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /checkpointButton\.disabled = !isAttemptActive\(\) \|\| hasUsedPreliminarySubmission\(state\.attempt\)/);
});

test('score-producing mutations carry exact answer and state revisions', () => {
  assert.deepEqual(submissionPrecondition({ answersRevision: 7, stateRevision: 12 }), {
    expectedAnswersRevision: 7,
    expectedStateRevision: 12
  });
  assert.equal(submissionPrecondition({ answersRevision: 7 }), null);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /submissionRequestPayload\(\)/);
  assert.match(client, /submissionRequestPayload\(\{ decision: 'finalize' \}\)/);
  assert.match(client, /ANSWER_REVISION_CONFLICT[\s\S]*?reconcileAfterRevisionConflict/);
});

test('canonical public form choices and nested submission scores normalize correctly', () => {
  assert.deepEqual(normalizeChoices([
    { option: 'A', textMarkdown: '$x$' },
    { option: 'B', textMarkdown: '$y$' }
  ]), [
    { option: 'A', markdown: '$x$' },
    { option: 'B', markdown: '$y$' }
  ]);
  const submission = { score: { totalPoints: 96, maximumPoints: 150 } };
  assert.equal(scoreFromSubmission(submission), 96);
  assert.equal(maximumScoreFromSubmission(submission), 150);
});

test('result rendering distinguishes a single key from documented alternative accepted answers', () => {
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /Accepted answers: \$\{accepted\.join\(' or '\)\}/);
  assert.match(client, /accepted\.length > 1/);
});

test('attempt wrapper and durations handle canonical API values', () => {
  assert.equal(extractAttempt({ attempt: { id: 'a1' } }).id, 'a1');
  assert.equal(formatDuration(4_500_000), '1:15:00');
  assert.equal(formatDuration(75_000), '01:15');
});

test('attempt form fetches and cache entries are pinned to form revision', () => {
  assert.equal(formCacheKey('amc12-2025-a', 'r1'), 'amc12-2025-a\u0000r1');
  assert.notEqual(formCacheKey('amc12-2025-a', 'r1'), formCacheKey('amc12-2025-a', 'r2'));
  assert.equal(publicFormPath('amc12-2025-a', 'r1'), `${API_BASE}/forms/amc12-2025-a/versions/r1`);
  assert.equal(attemptFormPath('attempt-7'), `${API_BASE}/attempts/attempt-7/form`);
});

test('same-origin API base works both at the direct host and portal mount', () => {
  assert.equal(apiBaseForModuleUrl('https://amc12.kapy.ca/practice/app.mjs'), '/api/amc12');
  assert.equal(apiBaseForModuleUrl('https://kapy.ca/amc12/practice/app.mjs'), '/amc12/api/amc12');
  assert.equal(apiBaseForModuleUrl('file:///workspace/practice/app.mjs', { browser: false }), '/api/amc12');
});

test('reviewed local image references preserve the direct and portal mount prefixes', () => {
  const sourceImage = '../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg';
  assert.equal(
    safeUrl(sourceImage, 'https://amc12.kapy.ca/practice/'),
    'https://amc12.kapy.ca/2025_AMC_12A_Problems/media/problem-05-nested-squares.svg'
  );
  assert.equal(
    safeUrl(sourceImage, 'https://kapy.ca/amc12/practice/'),
    'https://kapy.ca/amc12/2025_AMC_12A_Problems/media/problem-05-nested-squares.svg'
  );
  const archiveImage = '../historical-media/assets/2002-amc-12a/problem-25-aops-01.png';
  assert.equal(
    safeUrl(archiveImage, 'https://amc12.kapy.ca/practice/'),
    'https://amc12.kapy.ca/historical-media/assets/2002-amc-12a/problem-25-aops-01.png'
  );
  assert.equal(
    safeUrl(archiveImage, 'https://kapy.ca/amc12/practice/'),
    'https://kapy.ca/amc12/historical-media/assets/2002-amc-12a/problem-25-aops-01.png'
  );
  assert.equal(safeUrl('javascript:alert(1)', 'https://amc12.kapy.ca/practice/'), null);
});

test('a stale response cannot be identified as the newly opened attempt', () => {
  assert.equal(sameAttemptId({ id: 'attempt-old' }, { id: 'attempt-new' }), false);
  assert.equal(sameAttemptId({ id: 7 }, { id: '7' }), true);
  assert.equal(sameAttemptId({ id: 'attempt-current' }, { id: 'attempt-current' }), true);
  assert.equal(sameAttemptId({ id: 'attempt-current' }, {}), false);
});

test('a delayed same-attempt response cannot overwrite a newer saved state', () => {
  const current = {
    id: 'attempt-a', phase: 'OVERTIME', stateRevision: 4, answersRevision: 3,
    updatedAt: '2026-01-02T03:04:10.000Z'
  };
  assert.equal(shouldMergeAttemptUpdate(current, {
    id: 'attempt-a', phase: 'TIMED', stateRevision: 3, answersRevision: 2,
    updatedAt: '2026-01-02T03:04:05.000Z'
  }), false);
  assert.equal(shouldMergeAttemptUpdate(current, {
    id: 'attempt-a', phase: 'OVERTIME', stateRevision: 4, answersRevision: 3,
    updatedAt: '2026-01-02T03:04:10.000Z'
  }), true);
  assert.equal(shouldMergeAttemptUpdate(current, {
    id: 'attempt-a', phase: 'FINALIZED', stateRevision: 5, answersRevision: 3,
    updatedAt: '2026-01-02T03:04:11.000Z'
  }), true);
  assert.equal(saveResponseNeedsReconciliation(current, {
    id: 'attempt-a', phase: 'TIMED', stateRevision: 3, answersRevision: 2,
    updatedAt: '2026-01-02T03:04:05.000Z'
  }), true, 'a stale save response must keep dirty state and reconcile');
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /if \(!merged\.applied\)[\s\S]*?await reconcileAfterRevisionConflict\(context\)/);
});

test('a reset response loss recovers only the server-created successor for the same form revision', () => {
  const oldAttempt = { id: 'old', formId: 'amc12-a', formVersion: 'r1', phase: 'RESET', createdAt: '2026-01-01T00:00:00Z' };
  const replacement = { id: 'new', formId: 'amc12-a', formVersion: 'r1', phase: 'TIMED', createdAt: '2026-01-01T00:01:00Z' };
  assert.equal(resetReplacementFromHistory([
    oldAttempt,
    { id: 'different-form', formId: 'amc12-b', formVersion: 'r1', phase: 'TIMED', createdAt: '2026-01-01T00:02:00Z' },
    { id: 'different-revision', formId: 'amc12-a', formVersion: 'r2', phase: 'TIMED', createdAt: '2026-01-01T00:03:00Z' },
    replacement
  ], oldAttempt)?.id, 'new');
  assert.equal(resetReplacementFromHistory([oldAttempt], oldAttempt), null);
  assert.equal(idempotencyHeaderValue('stable-reset-key', () => 'new-key'), 'stable-reset-key');
  assert.equal(idempotencyHeaderValue(true, () => 'generated-key'), 'generated-key');
  assert.equal(idempotencyHeaderValue(false, () => 'generated-key'), null);
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /idempotency: key/);
  assert.match(client, /recoverUncertainReset\(oldAttempt\)/);
});

test('batch file descriptors enforce the server media, count, and byte boundaries', () => {
  assert.deepEqual(batchFileDescriptors([
    { name: 'answers.md', type: '', size: MAX_TEXT_FILE_BYTES },
    { name: 'thinking.m4a', type: '', size: MAX_AUDIO_FILE_BYTES }
  ]), [
    { displayName: 'answers.md', kind: 'TEXT', contentType: 'text/markdown', declaredBytes: MAX_TEXT_FILE_BYTES },
    { displayName: 'thinking.m4a', kind: 'AUDIO', contentType: 'audio/mp4', declaredBytes: MAX_AUDIO_FILE_BYTES }
  ]);
  assert.equal(MAX_BATCH_FILES, 10);
  assert.throws(() => batchFileDescriptors([]), { code: 'INVALID_BATCH_FILES' });
  assert.throws(() => batchFileDescriptors([{ name: 'unknown.exe', type: '', size: 12 }]), { code: 'UNSUPPORTED_MEDIA_TYPE' });
  assert.throws(() => batchFileDescriptors([{ name: 'too-large.txt', type: 'text/plain', size: MAX_TEXT_FILE_BYTES + 1 }]), {
    code: 'FILE_SIZE_LIMIT'
  });
  assert.throws(() => batchFileDescriptors(Array.from({ length: MAX_BATCH_FILES + 1 }, (_, index) => ({
    name: `${index}.txt`, type: 'text/plain', size: 1
  }))), { code: 'INVALID_BATCH_FILES' });
});

test('batch mapping can never commit without explicit complete student decisions', () => {
  const mapping = {
    revision: 7,
    items: [
      { id: 'item-a', confidence: 1, proposedQuestionNumber: 3 },
      { id: 'item-b', confidence: 1, proposedQuestionNumber: 3 },
      { id: 'item-c', confidence: 1, proposedQuestionNumber: 4 }
    ]
  };
  const decisions = new Map([
    ['item-a', { action: 'MAP', questionNumber: 3, selectedOption: 'B', reasoningText: 'Use parity.' }],
    ['item-b', { action: 'MAP', questionNumber: 3, selectedOption: 'B', reasoningText: 'Check both cases.' }],
    ['item-c', { action: 'DISCARD' }]
  ]);
  assert.throws(() => batchConfirmationPayload(mapping, decisions), { code: 'EXPLICIT_CONFIRMATION_REQUIRED' });
  assert.deepEqual(batchConfirmationPayload(mapping, decisions, { confirmed: true }), {
    mappingRevision: 7,
    responses: [{
      questionNumber: 3,
      selectedOption: 'B',
      sourceItemIds: ['item-a', 'item-b'],
      reasoningText: 'Use parity.\nCheck both cases.'
    }],
    discardedItemIds: ['item-c']
  });
  assert.throws(() => batchConfirmationPayload(mapping, new Map([
    ['item-a', decisions.get('item-a')], ['item-b', decisions.get('item-b')]
  ]), { confirmed: true }), { code: 'INCOMPLETE_MAPPING_CONFIRMATION' });
  const confidenceChanged = structuredClone(mapping);
  confidenceChanged.items.forEach((item) => { item.confidence = 0; });
  assert.deepEqual(
    batchConfirmationPayload(confidenceChanged, decisions, { confirmed: true }),
    batchConfirmationPayload(mapping, decisions, { confirmed: true }),
    'AI confidence is deliberately irrelevant to the student confirmation payload'
  );
});

test('batch mapping rows retain their runtime item index', () => {
  const first = { id: 'item-a' };
  const second = { id: 'item-b' };
  assert.deepEqual(numberedBatchMappingItems({ items: [first, second] }), [
    { item: first, itemIndex: 0 },
    { item: second, itemIndex: 1 }
  ]);
  assert.deepEqual(numberedBatchMappingItems(null), []);
});

test('delayed batch mutation completion cannot cross attempt, epoch, view, or selected batch', async () => {
  const uploadContext = { attemptId: 'attempt-1', batchId: null, epoch: 4 };
  const current = { attemptId: 'attempt-1', activeBatchId: null, epoch: 4, visible: true };
  assert.equal(batchMutationContextMatches(uploadContext, current), true);
  assert.equal(batchMutationContextMatches(uploadContext, { ...current, attemptId: 'attempt-2' }), false);
  assert.equal(batchMutationContextMatches(uploadContext, { ...current, visible: false }), false);

  let resolveUpload;
  let applied = null;
  const delayedUpload = new Promise((resolve) => { resolveUpload = resolve; }).then((batch) => {
    if (batchMutationContextMatches(uploadContext, current)) applied = batch;
  });
  current.epoch += 1;
  resolveUpload({ id: 'stale-batch' });
  await delayedUpload;
  assert.equal(applied, null, 'a response from the prior batch epoch must not update the workspace');

  const confirmContext = { attemptId: 'attempt-1', batchId: 'batch-1', epoch: 8 };
  assert.equal(batchMutationContextMatches(confirmContext, {
    attemptId: 'attempt-1', activeBatchId: 'batch-1', epoch: 8, visible: true
  }), true);
  assert.equal(batchMutationContextMatches(confirmContext, {
    attemptId: 'attempt-1', activeBatchId: 'batch-2', epoch: 8, visible: true
  }), false);
});

test('batch HTTP workflow sends only descriptors, binary assets, and an empty submit decision', async () => {
  const files = [
    { name: 'answers.txt', type: 'text/plain', size: 12, marker: 'student-text' },
    { name: 'reasoning.mp3', type: 'audio/mpeg', size: 34, marker: 'student-audio' }
  ];
  const calls = [];
  const fakeApi = {
    async post(path, body, options) {
      calls.push({ method: 'POST', path, body, options });
      if (path.endsWith('/learning-batches')) {
        return { batch: { id: 'batch-1', assets: [{ id: 'asset-1', position: 1 }, { id: 'asset-2', position: 2 }] } };
      }
      return { batch: { id: 'batch-1', status: 'PROCESSING', assets: [] } };
    },
    async putBinary(path, body, options) {
      calls.push({ method: 'PUT_BINARY', path, body, options });
      return {};
    }
  };
  const keys = ['create-key', 'upload-key-1', 'upload-key-2', 'submit-key'];
  const progress = [];
  const batch = await submitLearningBatchFiles(fakeApi, 'attempt / 7', files, {
    generateKey: () => keys.shift(), onProgress: (item) => progress.push(item.phase)
  });
  assert.equal(batch.status, 'PROCESSING');
  assert.deepEqual(calls.map((call) => [call.method, call.path]), [
    ['POST', `${API_BASE}/attempts/attempt%20%2F%207/learning-batches`],
    ['PUT_BINARY', `${API_BASE}/attempts/attempt%20%2F%207/learning-batches/batch-1/assets/asset-1/body`],
    ['PUT_BINARY', `${API_BASE}/attempts/attempt%20%2F%207/learning-batches/batch-1/assets/asset-2/body`],
    ['POST', `${API_BASE}/attempts/attempt%20%2F%207/learning-batches/batch-1/submit`]
  ]);
  assert.deepEqual(calls[0].body, { files: [
    { displayName: 'answers.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: 12 },
    { displayName: 'reasoning.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: 34 }
  ]});
  assert.equal(calls[1].body, files[0]);
  assert.equal(calls[2].body, files[1]);
  assert.deepEqual(calls[3].body, {});
  assert.deepEqual(calls.map((call) => call.options.idempotency), [
    'create-key', 'upload-key-1', 'upload-key-2', 'submit-key'
  ]);
  assert.deepEqual(progress, ['CREATING', 'UPLOADING', 'UPLOADING', 'SUBMITTING', 'PROCESSING']);
});

test('uncertain mutations retry once with the caller-owned idempotency identity', async () => {
  let attempts = 0;
  const result = await retryIdempotentNetworkMutation(async () => {
    attempts += 1;
    if (attempts === 1) throw new ApiError('lost response', { code: 'NETWORK_ERROR' });
    return { replayed: true };
  });
  assert.deepEqual(result, { replayed: true });
  assert.equal(attempts, 2);
  attempts = 0;
  await assert.rejects(() => retryIdempotentNetworkMutation(async () => {
    attempts += 1;
    throw new ApiError('validation failed', { status: 400, code: 'VALIDATION_ERROR' });
  }), { code: 'VALIDATION_ERROR' });
  assert.equal(attempts, 1, 'definitive failures are never retried automatically');
});

test('learning history paths are scoped, encoded, and normalizers omit render-irrelevant internals', () => {
  assert.equal(learningHistoryPath(), `${API_BASE}/learning-history?limit=20`);
  assert.equal(learningHistorySubmissionPath('submission / 1'), `${API_BASE}/learning-history/submission%20%2F%201`);
  assert.equal(
    learningHistoryReportPath('submission / 1', 2),
    `${API_BASE}/learning-history/submission%20%2F%201/versions/2/report`
  );
  assert.equal(
    learningHistoryQuestionPath('submission / 1', 2, 3),
    `${API_BASE}/learning-history/submission%20%2F%201/versions/2/questions/3`
  );
  const normalized = normalizeLearningHistory({ data: { items: [{
    submissionId: 'submission-1', attemptId: 'attempt-1', title: 'AMC 12A', sourceType: 'INTERACTIVE_FINAL',
    currentVersion: 2, lifecycleStatus: 'ACTIVE', protectedAccessStatus: 'AVAILABLE',
    latestAnalysisStatus: 'SUCCEEDED', latestReportStatus: 'COMPLETE', lastActivityAt: '2026-08-01T00:00:00Z',
    versions: [{ versionNumber: 2, questionNumbers: [3, 1, 3, 0, 101] }],
    provider: 'private', hashes: { private: true }, scoring: { private: true }
  }], nextCursor: 'next-page' } });
  assert.equal(normalized.items[0].provider, undefined);
  assert.equal(normalized.items[0].hashes, undefined);
  assert.equal(normalized.items[0].scoring, undefined);
  assert.deepEqual(learningVersionQuestionNumbers(normalized.items[0].versions[0]), [1, 3]);
  assert.equal(normalized.nextCursor, 'next-page');
});

test('Tutor paths expose only public thread and request ordinals while polling rejects stale context', () => {
  const identity = { submissionId: 'submission / 1', versionNumber: 2, questionNumber: 3 };
  const collection = `${API_BASE}/learning-history/submission%20%2F%201/versions/2/questions/3/tutor-threads`;
  assert.equal(tutorThreadsPath(identity), collection);
  assert.equal(tutorThreadListPath(identity), `${collection}?limit=10`);
  assert.equal(tutorThreadListPath(identity, { cursor: 'cursor_-1' }), `${collection}?limit=10&cursor=cursor_-1`);
  assert.equal(tutorThreadPath(identity, 'thread / 1'), `${collection}/thread%20%2F%201`);
  const bundle = { thread: {
    id: 'thread-1', learningSubmissionId: 'submission / 1', versionNumber: 2, questionNumber: 3
  } };
  assert.equal(tutorBundleMatchesIdentity(bundle, identity, 'thread-1'), true);
  assert.equal(tutorBundleMatchesIdentity(bundle, { ...identity, questionNumber: 4 }, 'thread-1'), false);
  assert.equal(tutorBundleMatchesIdentity(bundle, identity, 'thread-2'), false);
  assert.equal(tutorListPageContextMatches(
    { cursor: 'cursor-1', listSequence: 3 },
    { cursor: 'cursor-1', listSequence: 3, visible: true }
  ), true);
  assert.equal(tutorListPageContextMatches(
    { cursor: 'cursor-1', listSequence: 3 },
    { cursor: 'cursor-1', listSequence: 4, visible: true }
  ), false);
  assert.equal(tutorListPageContextMatches(
    { cursor: 'cursor-1', listSequence: 3 },
    { cursor: 'cursor-2', listSequence: 3, visible: true }
  ), false);
  assert.equal(tutorRequestIsPending({ status: 'QUEUED' }), true);
  assert.equal(tutorRequestIsPending({ status: 'SUCCEEDED' }), false);
  assert.equal(tutorRequestMayRetry({ requestOrdinal: 4, status: 'DELIVERY_UNKNOWN' }), true);
  assert.equal(tutorRequestMayRetry({ requestOrdinal: 4, status: 'RUNNING' }), false);
  const context = { ...identity, threadId: 'thread-1', epoch: 8 };
  assert.equal(tutorPollContextMatches(context, { ...context, visible: true }), true);
  assert.equal(tutorPollContextMatches(context, { ...context, epoch: 9, visible: true }), false);
  assert.equal(tutorPollContextMatches(context, { ...context, threadId: 'thread-2', visible: true }), false);
  assert.equal(tutorPollContextMatches(context, { ...context, visible: false }), false);
  assert.equal(batchPollContextMatches(
    { attemptId: 'attempt-1', batchId: 'batch-1', epoch: 3 },
    { attemptId: 'attempt-1', batchId: 'batch-1', epoch: 3, visible: true }
  ), true);
  assert.equal(batchPollContextMatches(
    { attemptId: 'attempt-1', batchId: 'batch-1', epoch: 3 },
    { attemptId: 'attempt-1', batchId: 'batch-2', epoch: 3, visible: true }
  ), false);

  const loadContext = { ...context, loadSequence: 5 };
  const selected = {
    ...context, selectedThreadId: 'thread-1', loadSequence: 5, deleted: false, visible: true
  };
  assert.equal(tutorThreadLoadContextMatches(loadContext, selected), true);
  assert.equal(tutorThreadLoadContextMatches(loadContext, { ...selected, deleted: true }), false,
    'delete invalidates a delayed full-thread GET or poll');
  assert.equal(tutorThreadLoadContextMatches(loadContext, { ...selected, loadSequence: 6 }), false,
    'a newer selection invalidates an older full-thread response');
  assert.equal(tutorThreadLoadContextMatches(loadContext, { ...selected, selectedThreadId: 'thread-2' }), false);
});

test('Tutor HTTP helpers send only empty decisions, public ordinals, and bounded messages', async () => {
  const calls = [];
  const fakeApi = {
    async post(path, body, options) { calls.push({ method: 'POST', path, body, options }); return { ok: true }; },
    async delete(path, options) { calls.push({ method: 'DELETE', path, options }); return null; }
  };
  const identity = { submissionId: 'submission-1', versionNumber: 2, questionNumber: 3 };
  await createTutorThreadRequest(fakeApi, identity, { generateKey: () => 'create-thread-key' });
  await sendTutorMessageRequest(fakeApi, identity, 'thread-1', 'Why does parity work?', {
    generateKey: () => 'send-message-key'
  });
  await retryTutorRequestRequest(fakeApi, identity, 'thread-1', 4, { generateKey: () => 'retry-request-key' });
  await forkTutorThreadRequest(fakeApi, identity, 'thread-1', { generateKey: () => 'fork-thread-key' });
  await deleteTutorThreadRequest(fakeApi, identity, 'thread-1', { generateKey: () => 'delete-thread-key' });
  const root = tutorThreadsPath(identity);
  assert.deepEqual(calls, [
    { method: 'POST', path: root, body: {}, options: { idempotency: 'create-thread-key' } },
    { method: 'POST', path: `${root}/thread-1/messages`, body: { message: 'Why does parity work?' }, options: { idempotency: 'send-message-key' } },
    { method: 'POST', path: `${root}/thread-1/requests/4/retries`, body: {}, options: { idempotency: 'retry-request-key' } },
    { method: 'POST', path: `${root}/thread-1/forks`, body: {}, options: { idempotency: 'fork-thread-key' } },
    { method: 'DELETE', path: `${root}/thread-1`, options: { idempotency: 'delete-thread-key' } }
  ]);
  assert.equal(validTutorMessage('思'.repeat(682) + 'ab'), true);
  assert.equal(new TextEncoder().encode('思'.repeat(682) + 'ab').byteLength, 2_048);
  assert.equal(validTutorMessage('思'.repeat(683)), false);
  await assert.rejects(() => sendTutorMessageRequest(fakeApi, identity, 'thread-1', '\u0000', {
    generateKey: () => 'unused-key'
  }), { code: 'INVALID_TUTOR_MESSAGE' });
  await assert.rejects(() => retryTutorRequestRequest(fakeApi, identity, 'thread-1', '04', {
    generateKey: () => 'unused-key'
  }), { code: 'INVALID_TUTOR_REQUEST_ORDINAL' });
  assert.equal(calls.length, 5);
});

test('Tutor list summaries are lightweight, identity-scoped projections of full bundles', () => {
  const identity = { submissionId: 'submission-1', versionNumber: 2, questionNumber: 3 };
  const thread = {
    id: 'thread-1', learningSubmissionId: 'submission-1', versionNumber: 2,
    formId: 'form-1', formVersion: 'v1', sourceType: 'INTERACTIVE_FINAL', questionNumber: 3,
    status: 'OPEN', successfulTurnCount: 1, requestCount: 2, threadRevision: 4,
    forkedFromThreadId: null, createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z', closedAt: null,
    privateHash: 'must-not-survive'
  };
  const bundle = {
    thread,
    question: { promptMarkdown: 'server-owned question' },
    messages: [{ role: 'USER', contentMarkdown: 'private conversation' }],
    requests: [
      { requestOrdinal: 1, turnNumber: 1, status: 'FAILED', retryAuthorization: null,
        outcomeCode: 'FAILED', createdAt: '2026-08-01T10:10:00.000Z', completedAt: '2026-08-01T10:11:00.000Z', internalJobId: 'hidden' },
      { requestOrdinal: 2, turnNumber: 1, status: 'SUCCEEDED', retryAuthorization: 'STUDENT_EXPLICIT',
        outcomeCode: null, createdAt: '2026-08-01T10:12:00.000Z', completedAt: '2026-08-01T10:13:00.000Z', internalJobId: 'hidden' }
    ]
  };
  const summary = tutorSummaryFromBundle(bundle);
  assert.equal(tutorSummaryMatchesIdentity(summary, identity), true);
  assert.equal(summary.sourceEntitled, true, 'a successful full-bundle projection is explicitly entitled');
  assert.equal(summary.thread.privateHash, undefined);
  assert.equal(summary.messages, undefined);
  assert.equal(summary.question, undefined);
  assert.equal(summary.requests, undefined);
  assert.equal(summary.latestRequest.requestOrdinal, 2);
  assert.equal(summary.latestRequest.internalJobId, undefined);

  const normalized = normalizeTutorThreadSummary({
    thread, latestRequest: bundle.requests[1], messages: bundle.messages, question: bundle.question,
    nextCursor: 'not-an-item-field', sourceEntitled: true
  });
  assert.deepEqual(normalized, summary);
  assert.equal(tutorSummaryMatchesIdentity(normalized, { ...identity, questionNumber: 4 }), false);

  const unavailable = normalizeTutorThreadSummary({
    thread: { ...thread, id: 'thread-stale' },
    latestRequest: bundle.requests[1],
    sourceEntitled: false,
    authorityReason: 'must-not-survive'
  });
  assert.equal(unavailable.sourceEntitled, false);
  assert.equal(unavailable.latestRequest, null, 'the contract suppresses latestRequest without source entitlement');
  assert.equal(unavailable.authorityReason, undefined);
  assert.equal(firstEntitledTutorThreadId([unavailable, summary]), 'thread-1');
  assert.equal(firstEntitledTutorThreadId([unavailable]), null);
  assert.deepEqual(tutorThreadRowModel(unavailable, 0, 'thread-stale'), {
    canOpen: false,
    current: true,
    openLabel: 'Open discussion 1: open',
    deleteLabel: 'Delete discussion 1',
    visibleLabel: 'Discussion 1 · open',
    unavailableText: 'Source unavailable—delete to free capacity.'
  });
  assert.equal(tutorFullGetSourceUnavailable({ status: 403 }), true,
    'summary entitlement never substitutes for full-GET authorization');
  assert.equal(tutorFullGetSourceUnavailable({ code: 'TUTOR_SOURCE_UNAVAILABLE' }), true);
  assert.equal(tutorFullGetSourceUnavailable({ status: 503, code: 'UPSTREAM_FAILED' }), false);
});

test('a stale unselected Tutor summary can be deleted and tombstones fence delayed pagination', () => {
  const entitled = normalizeTutorThreadSummary({
    thread: { id: 'thread-live', learningSubmissionId: 'submission-1', versionNumber: 1,
      questionNumber: 2, status: 'OPEN' },
    latestRequest: null,
    sourceEntitled: true
  });
  const stale = normalizeTutorThreadSummary({
    thread: { id: 'thread-stale', learningSubmissionId: 'submission-1', versionNumber: 1,
      questionNumber: 2, status: 'CLOSED' },
    latestRequest: { requestOrdinal: 9, status: 'FAILED' },
    sourceEntitled: false
  });
  const target = {
    tutorLoadSequence: 4,
    tutorListSequence: 7,
    deletedTutorThreadIds: new Set(),
    tutorThreads: [entitled, stale],
    tutorSelectedThreadId: 'thread-live',
    tutorThread: { thread: { id: 'thread-live' } },
    tutorForkRequired: false
  };
  const delayedPage = { cursor: 'older', listSequence: target.tutorListSequence };
  const result = applyTutorThreadTombstone(target, 'thread-stale');
  assert.deepEqual(result, { deletedSelectedThread: false, nextThreadId: null });
  assert.deepEqual(target.tutorThreads.map((item) => item.thread.id), ['thread-live']);
  assert.equal(target.deletedTutorThreadIds.has('thread-stale'), true);
  assert.equal(target.tutorSelectedThreadId, 'thread-live', 'deleting an unselected stale row preserves the open thread');
  assert.equal(tutorListPageContextMatches(delayedPage, {
    cursor: 'older', listSequence: target.tutorListSequence, visible: true
  }), false, 'delete increments listSequence so a delayed page cannot resurrect its row');
});

test('logout state reset removes learning/Tutor records and advances all response fences', () => {
  const target = {
    learningHistoryEpoch: 4,
    learningHistoryItems: [{ submissionId: 'sensitive' }],
    learningHistoryNextCursor: 'secret-cursor',
    learningHistorySubmission: { submissionId: 'sensitive' },
    learningHistoryVersion: { versionNumber: 2 },
    learningHistoryReport: { summary: 'sensitive' },
    learningHistoryQuestion: { response: 'sensitive' },
    learningHistoryReportPollCount: 3,
    tutorLoadSequence: 8,
    tutorListSequence: 9,
    tutorSelectedThreadId: 'thread-1',
    deletedTutorThreadIds: new Set(['thread-old']),
    tutorForkRequired: true,
    tutorThreads: [{ thread: { id: 'thread-1' } }],
    tutorNextCursor: 'tutor-secret',
    tutorThread: { messages: [{ contentMarkdown: 'sensitive' }] }
  };
  resetLearningTutorState(target);
  assert.equal(target.learningHistoryEpoch, 5);
  assert.equal(target.tutorLoadSequence, 9);
  assert.equal(target.tutorListSequence, 10);
  assert.deepEqual(target.learningHistoryItems, []);
  assert.equal(target.learningHistorySubmission, null);
  assert.equal(target.learningHistoryQuestion, null);
  assert.deepEqual(target.tutorThreads, []);
  assert.equal(target.tutorThread, null);
  assert.equal(target.tutorSelectedThreadId, null);
  assert.equal(target.deletedTutorThreadIds.size, 0);
});

test('Tutor context purge fences the full bundle while optionally retaining stale summaries for delete', () => {
  const target = {
    tutorLoadSequence: 4,
    tutorListSequence: 7,
    tutorSelectedThreadId: 'thread-live',
    deletedTutorThreadIds: new Set(['thread-old']),
    tutorForkRequired: true,
    tutorThreads: [{ thread: { id: 'thread-live' } }],
    tutorNextCursor: 'older-page',
    tutorThread: { messages: [{ contentMarkdown: 'sensitive Tutor content' }] }
  };
  resetTutorConversationState(target);
  assert.equal(target.tutorLoadSequence, 5);
  assert.equal(target.tutorListSequence, 7);
  assert.equal(target.tutorSelectedThreadId, null);
  assert.equal(target.tutorThread, null);
  assert.equal(target.tutorForkRequired, false);
  assert.equal(target.tutorThreads.length, 1, 'source-unavailable rows remain deletable');
  assert.equal(target.deletedTutorThreadIds.has('thread-old'), true);

  resetTutorConversationState(target, { clearSummaries: true });
  assert.equal(target.tutorLoadSequence, 6);
  assert.equal(target.tutorListSequence, 8);
  assert.deepEqual(target.tutorThreads, []);
  assert.equal(target.tutorNextCursor, null);
  assert.equal(target.deletedTutorThreadIds.size, 0);

  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  assert.match(client, /clearNode\(elements\.tutorMessages\);[\s\S]*?clearNode\(elements\.tutorRequests\)/,
    'purging removes authorized conversation text instead of merely hiding its article');
  assert.match(client, /if \(view !== elements\.learningHistoryView\) purgeTutorWorkspace\(\{ clearSummaries: true \}\)/,
    'leaving learning history purges Tutor state and DOM');
  assert.match(client, /if \(tutorFullGetSourceUnavailable\(error\)\)[\s\S]*?purgeTutorWorkspace\(\{ clearSummaries: false \}\)/,
    'source revocation purges the full bundle but preserves its deletable summary');
});

test('batch, history, report, and Tutor DOM contracts are accessible and keep AI/student Markdown restricted', () => {
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  for (const id of [
    'learning-history-button', 'batch-upload-form', 'batch-files', 'batch-workspace',
    'learning-history-view', 'learning-history-list', 'learning-history-load-more', 'learning-history-versions',
    'learning-version-report', 'learning-question-detail', 'tutor-workspace',
    'tutor-thread-list', 'tutor-load-more', 'tutor-message-form', 'fork-tutor-thread'
  ]) assert.match(html, new RegExp(`id=["']${id}["']`), id);
  assert.match(html, /id="batch-files"[^>]*multiple[^>]*aria-describedby="batch-file-help"/);
  assert.match(html, /id="batch-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="tutor-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /label for="tutor-message"/);
  assert.doesNotMatch(html, /\sonclick=/i);
  assert.doesNotMatch(client, /\.innerHTML\s*=/);
  assert.match(client, /renderMarkdown\(body, message\.contentMarkdown, \{ allowExternalResources: false \}\)/);
  assert.match(client, /renderMarkdown\(body, markdown \|\| 'Not provided\.', \{ allowExternalResources: false \}\)/);
  assert.match(client, /evidence\.textContent = String\(item\.evidenceText/);
  assert.match(client, /sendTutorMessageRequest\(api, identity, threadId, message\)/,
    'the browser sends a Tutor message, not server-owned question/solution/scoring context');
  assert.match(client, /retryTutorRequestRequest\(api, identity, threadId, requestOrdinal\)/,
    'explicit retry uses the public request ordinal and an empty body, never an internal job ID');
  assert.match(client, /batchConfirmationPayload\(mapping, decisions, \{ confirmed: true \}\)/);
  assert.match(client, /api\.get\(tutorThreadListPath\(identity\)\)/);
  assert.match(client, /Array\.isArray\(response\.items\)/);
  assert.doesNotMatch(client, /Array\.isArray\(response\.threads\)/,
    'the collection endpoint is summary-only and never treated as full bundles');
  assert.match(client, /upsertTutorSummaryFromBundle\(bundle\)/,
    'full create/fork/get bundles are reduced before entering the list state');
  assert.match(client, /open\.disabled = !model\.canOpen/);
  assert.match(client, /open\.setAttribute\('aria-label', model\.openLabel\)/);
  assert.match(client, /remove\.setAttribute\('aria-label', model\.deleteLabel\)/);
  assert.match(client, /open\.setAttribute\('aria-describedby', unavailable\.id\)/);
  assert.match(client, /confirmDeleteTutorThread\(summary\.thread\.id\)/,
    'every summary row owns an explicit delete action, including stale unselected rows');
  assert.match(client, /const initialThreadId = firstEntitledTutorThreadId\(state\.tutorThreads\)/,
    'initial selection skips summaries whose source is no longer entitled');
  assert.match(client, /setButtonBusy\(elements\.batchSubmitButton, false\);[\s\S]*?showOnly\(elements\.resultsView\)/,
    're-entering results clears any owner-less stale upload busy state');
  assert.match(client, /elements\.batchUploadForm\.reset\(\);[\s\S]*?showOnly\(elements\.resultsView\)/,
    'a file selected for an older result is not retained for the current attempt');
  assert.match(client, /resetLearningTutorState\(state\);[\s\S]*?clearSensitiveDom\(\)/,
    'logout clears learning state before returning to the shared login view');
});

test('every queried workflow control has one unique DOM target', () => {
  const html = readFileSync(new URL('index.html', practiceDirectory), 'utf8');
  const client = readFileSync(new URL('app.mjs', practiceDirectory), 'utf8');
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs break labels and event routing');
  const available = new Set(ids);
  const queried = [...client.matchAll(/byId\('([^']+)'\)/g)].map((match) => match[1]);
  assert.deepEqual(queried.filter((id) => !available.has(id)), []);
  for (const controlId of ['batch-files', 'tutor-message']) {
    assert.match(html, new RegExp(`<label[^>]+for=["']${controlId}["']`));
  }
});
