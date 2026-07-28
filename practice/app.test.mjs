import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  API_BASE,
  apiBaseForModuleUrl,
  answerPayload,
  attemptAllowsAnswerEdits,
  attemptCanBeReset,
  canAccessFinalReview,
  extractAttempt,
  fetchFinalReview,
  formatDuration,
  maximumScoreFromSubmission,
  normalizeChoices,
  normalizeLegacyInlineTeX,
  publicFormPath,
  attemptFormPath,
  formCacheKey,
  hasUsedPreliminarySubmission,
  idempotencyHeaderValue,
  safeUrl,
  sameAttemptId,
  scoreFromSubmission,
  resetReplacementFromHistory,
  saveResponseNeedsReconciliation,
  shouldMergeAttemptUpdate,
  solutionEndpointForAttempt,
  submissionPrecondition,
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
  await assert.rejects(fetchFinalReview(client, attempt), { code: 'FINAL_REVIEW_NOT_AVAILABLE' });
  assert.deepEqual(calls, [], 'the client must not make results/solutions calls before final submission');
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
});

test('a reset attempt is reviewable only when the server marks a prior final result available', () => {
  assert.equal(canAccessFinalReview({ id: 'reset-blank', phase: 'RESET', resultsAvailable: false }), false);
  assert.equal(solutionEndpointForAttempt({ id: 'reset-blank', phase: 'RESET', resultsAvailable: false }), null);
  assert.equal(canAccessFinalReview({ id: 'reset-final', phase: 'RESET', resultsAvailable: true }), true);
  assert.equal(solutionEndpointForAttempt({ id: 'reset-final', phase: 'RESET', resultsAvailable: true }), `${API_BASE}/attempts/reset-final/solutions`);
});

test('a paused timer cannot edit answers, matching the server state machine', () => {
  assert.equal(attemptAllowsAnswerEdits({ phase: 'TIMED', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'OVERTIME', clockState: 'RUNNING' }), true);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'TIMED', clockState: 'PAUSED' }), false);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'LIMIT_NOTICE', clockState: 'PAUSED' }), false);
  assert.equal(attemptAllowsAnswerEdits({ phase: 'FINALIZED', clockState: 'PAUSED' }), false);
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
