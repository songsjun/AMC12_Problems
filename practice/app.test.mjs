import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  API_BASE,
  ApiError,
  MAX_REASONING_REQUEST_BYTES,
  apiBaseForModuleUrl,
  answerPayload,
  attemptAllowsAnswerEdits,
  attemptAllowsReasoningEdits,
  attemptCanBeReset,
  canAccessFinalReview,
  extractAttempt,
  fetchFinalReview,
  formatDuration,
  maximumScoreFromSubmission,
  learningAnalysisProjection,
  learningAnalysisDisplayStatus,
  learningSubmissionEndpointForAttempt,
  normalizeChoices,
  normalizeLegacyInlineTeX,
  normalizeReasoningNotes,
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
  reasoningNotesPath,
  reasoningNotesPayload,
  reasoningRequestBodyBytes,
  reasoningSaveBatches,
  reasoningCapabilityNeedsReload,
  attemptSwitchNeedsReasoningFlush,
  isReasoningRevisionConflict,
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
  assert.equal(learningSubmissionEndpointForAttempt(attempt), null);
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
  assert.equal(
    learningSubmissionEndpointForAttempt(attempt),
    `${API_BASE}/attempts/attempt-42/learning-submission`
  );
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
