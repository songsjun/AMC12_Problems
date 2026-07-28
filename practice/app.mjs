/*
 * AMC 12 practice client
 *
 * This is deliberately a framework-free, same-origin client.  The server owns
 * the clock, grading, answer key, solutions, and attempt state; this module
 * only mirrors state for display and makes idempotent requests.
 */

export function apiBaseForModuleUrl(moduleUrl, { browser = true } = {}) {
  // A direct host serves /practice/ -> /api/amc12/. The education portal also
  // mounts this archive at /amc12/, where its existing proxy strips that
  // prefix. Resolving relative to this module keeps both same-origin routes
  // working without a hard-coded host or a public runtime secret.
  if (!browser || String(moduleUrl).startsWith('file:')) return '/api/amc12';
  return new URL('../api/amc12', moduleUrl).pathname.replace(/\/$/, '');
}

export const API_BASE = apiBaseForModuleUrl(import.meta.url, { browser: typeof window !== 'undefined' });
export const DEFAULT_DURATION_MS = 75 * 60 * 1000;
export const OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', payload = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function finiteNumber(value, fallback = null) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function unwrapData(payload) {
  if (isRecord(payload) && isRecord(payload.data)) return payload.data;
  return payload || {};
}

export function extractAttempt(payload) {
  const root = unwrapData(payload);
  if (isRecord(root.attempt)) return root.attempt;
  if (isRecord(root.newAttempt)) return root.newAttempt;
  if (isRecord(root.retryAttempt)) return root.retryAttempt;
  return root;
}

export function extractReplacementAttempt(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.newAttempt, root.retryAttempt, root.replacementAttempt, root.nextAttempt, null);
}

export function normalizePhase(attempt) {
  return String(firstDefined(attempt?.phase, attempt?.status, '')).toUpperCase();
}

export function normalizeClockState(attempt) {
  return String(firstDefined(attempt?.clockState, attempt?.clock?.state, '')).toUpperCase();
}

export function sameAttemptId(left, right) {
  return Boolean(left?.id) && Boolean(right?.id) && String(left.id) === String(right.id);
}

export function stateRevisionFromAttempt(attempt) {
  const revision = finiteNumber(firstDefined(attempt?.stateRevision, attempt?.state?.revision));
  return revision !== null && Number.isSafeInteger(revision) && revision >= 0 ? revision : null;
}

export function answerRevisionFromAttempt(attempt) {
  const revision = finiteNumber(firstDefined(attempt?.answersRevision, attempt?.answerRevision));
  return revision !== null && Number.isSafeInteger(revision) && revision >= 0 ? revision : null;
}

/**
 * The server increments stateRevision for every persisted attempt transition.
 * A delayed same-attempt response must never roll a newer answer save, deadline
 * decision, reset, or final submission back in the browser. Date/revision
 * fallbacks retain graceful compatibility during a rolling deployment.
 */
export function shouldMergeAttemptUpdate(current, candidate) {
  if (!current || !candidate || !sameAttemptId(current, candidate)) return true;
  const currentStateRevision = stateRevisionFromAttempt(current);
  const candidateStateRevision = stateRevisionFromAttempt(candidate);
  if (currentStateRevision !== null && candidateStateRevision !== null) {
    if (candidateStateRevision !== currentStateRevision) return candidateStateRevision > currentStateRevision;
    const currentAnswersRevision = answerRevisionFromAttempt(current);
    const candidateAnswersRevision = answerRevisionFromAttempt(candidate);
    return !(currentAnswersRevision !== null && candidateAnswersRevision !== null
      && candidateAnswersRevision < currentAnswersRevision);
  }
  const currentUpdatedAt = timestampMs(current.updatedAt);
  const candidateUpdatedAt = timestampMs(candidate.updatedAt);
  if (currentUpdatedAt && candidateUpdatedAt && candidateUpdatedAt < currentUpdatedAt) return false;
  const currentAnswersRevision = answerRevisionFromAttempt(current);
  const candidateAnswersRevision = answerRevisionFromAttempt(candidate);
  return !(currentAnswersRevision !== null && candidateAnswersRevision !== null
    && candidateAnswersRevision < currentAnswersRevision);
}

export function saveResponseNeedsReconciliation(current, candidate) {
  return sameAttemptId(current, candidate) && !shouldMergeAttemptUpdate(current, candidate);
}

export function canAccessFinalReview(attempt) {
  // A reset after final submission creates a new attempt but must not erase
  // the student's immutable historical final result. The API marks only that
  // narrowly scoped case as resultsAvailable; a reset-before-final remains
  // ineligible and cannot reveal a key or solution.
  return normalizePhase(attempt) === 'FINALIZED'
    || (normalizePhase(attempt) === 'RESET' && attempt?.resultsAvailable === true);
}

export function solutionEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/solutions`;
}

export function resultsEndpointForAttempt(attempt) {
  if (!canAccessFinalReview(attempt) || !attempt?.id) return null;
  return `${API_BASE}/attempts/${encodeURIComponent(String(attempt.id))}/results`;
}

/**
 * This gate is intentionally exported and tested.  No pre-final attempt may
 * make a results/solutions request, even if a stale response includes fields
 * resembling a solution.
 */
export async function fetchFinalReview(api, attempt) {
  const resultsPath = resultsEndpointForAttempt(attempt);
  const solutionsPath = solutionEndpointForAttempt(attempt);
  if (!resultsPath || !solutionsPath) {
    throw new ApiError('Final review is available only after final submission.', {
      status: 409,
      code: 'FINAL_REVIEW_NOT_AVAILABLE'
    });
  }
  const [results, solutions] = await Promise.all([api.get(resultsPath), api.get(solutionsPath)]);
  return { results, solutions };
}

export function extractForms(payload) {
  const root = unwrapData(payload);
  const forms = firstDefined(root.forms, root.items, Array.isArray(root) ? root : null);
  return Array.isArray(forms) ? forms : [];
}

export function extractAttemptHistory(payload) {
  const root = unwrapData(payload);
  const attempts = firstDefined(root.attempts, root.items, Array.isArray(root) ? root : null);
  return Array.isArray(attempts) ? attempts : [];
}

/**
 * A reset is atomic on the server but its response can still be lost after
 * commit. Find only the successor for the same immutable form revision; an
 * unrelated resumable test must never be opened as a recovery side effect.
 */
export function resetReplacementFromHistory(attempts, priorAttempt) {
  if (!Array.isArray(attempts) || !priorAttempt?.id) return null;
  const priorId = String(priorAttempt.id);
  const formId = firstDefined(priorAttempt.formId, priorAttempt.form?.id, null);
  const version = firstDefined(priorAttempt.formVersion, priorAttempt.form?.version, null);
  if (!formId) return null;
  return attempts
    .filter((attempt) => {
      if (!attempt?.id || String(attempt.id) === priorId) return false;
      if (String(firstDefined(attempt.formId, attempt.form?.id, '')) !== String(formId)) return false;
      const candidateVersion = firstDefined(attempt.formVersion, attempt.form?.version, null);
      if (version !== null && version !== undefined && candidateVersion !== null && candidateVersion !== undefined
        && String(candidateVersion) !== String(version)) return false;
      return ['TIMED', 'LIMIT_NOTICE', 'OVERTIME'].includes(normalizePhase(attempt));
    })
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt))[0] || null;
}

export function formCacheKey(formId, formVersion = null) {
  return `${String(formId ?? '')}\u0000${formVersion === null || formVersion === undefined ? '' : String(formVersion)}`;
}

export function publicFormPath(formId, formVersion = null) {
  const path = `${API_BASE}/forms/${encodeURIComponent(String(formId))}`;
  return formVersion === null || formVersion === undefined || formVersion === ''
    ? path
    : `${path}/versions/${encodeURIComponent(String(formVersion))}`;
}

export function attemptFormPath(attemptId) {
  return `${API_BASE}/attempts/${encodeURIComponent(String(attemptId))}/form`;
}

export function extractQuestions(payload, attempt = null) {
  const root = unwrapData(payload);
  const candidates = [
    root.questions,
    root.form?.questions,
    attempt?.questions,
    attempt?.form?.questions,
    root.attempt?.questions,
    root.attempt?.form?.questions
  ];
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function normalizeQuestion(question, index = 0) {
  const number = finiteNumber(firstDefined(question?.number, question?.questionNumber, question?.position), index + 1);
  return {
    number,
    promptMarkdown: String(firstDefined(question?.promptMarkdown, question?.prompt, question?.stemMarkdown, question?.text, '')),
    choices: normalizeChoices(question?.choices, question?.options),
    media: Array.isArray(question?.media) ? question.media : []
  };
}

export function normalizeChoices(choices, options) {
  const source = choices ?? options ?? {};
  if (Array.isArray(source)) {
    return source.map((choice, index) => ({
      option: String(firstDefined(choice?.option, choice?.label, choice?.key, OPTIONS[index], '')).toUpperCase(),
      markdown: String(firstDefined(choice?.textMarkdown, choice?.markdown, choice?.text, choice?.contentMarkdown, choice?.content, choice ?? ''))
    })).filter((choice) => OPTIONS.includes(choice.option));
  }
  if (isRecord(source)) {
    return OPTIONS.filter((option) => source[option] !== undefined && source[option] !== null)
      .map((option) => ({ option, markdown: String(source[option]) }));
  }
  return [];
}

export function answerMapFromAttempt(attempt) {
  const raw = firstDefined(attempt?.answers, attempt?.answerDraft, attempt?.currentAnswers, {});
  const answers = new Map();
  if (Array.isArray(raw)) {
    for (const answer of raw) {
      const number = finiteNumber(firstDefined(answer?.questionNumber, answer?.number, answer?.question?.number));
      const option = firstDefined(answer?.selectedOption, answer?.option, answer?.answer, null);
      if (number !== null) answers.set(number, option ? String(option).toUpperCase() : null);
    }
  } else if (isRecord(raw)) {
    for (const [number, answer] of Object.entries(raw)) {
      const position = finiteNumber(number);
      const option = isRecord(answer) ? firstDefined(answer.selectedOption, answer.option, answer.answer, null) : answer;
      if (position !== null) answers.set(position, option ? String(option).toUpperCase() : null);
    }
  }
  return answers;
}

export function answerPayload(answerMap) {
  return [...answerMap.entries()]
    .map(([questionNumber, selectedOption]) => ({
      questionNumber: Number(questionNumber),
      selectedOption: selectedOption && OPTIONS.includes(String(selectedOption).toUpperCase())
        ? String(selectedOption).toUpperCase()
        : null
    }))
    .sort((left, right) => left.questionNumber - right.questionNumber);
}

export function extractRevision(attempt) {
  return finiteNumber(firstDefined(
    attempt?.answerRevision,
    attempt?.answersRevision,
    attempt?.revision,
    attempt?.answerState?.revision
  ));
}

export function elapsedMsFromAttempt(attempt) {
  const milliseconds = finiteNumber(firstDefined(
    attempt?.elapsedActiveMs,
    attempt?.elapsedMs,
    attempt?.activeElapsedMs,
    attempt?.clock?.elapsedActiveMs,
    attempt?.timer?.elapsedMs
  ));
  if (milliseconds !== null) return Math.max(0, milliseconds);
  const seconds = finiteNumber(firstDefined(
    attempt?.elapsedActiveSeconds,
    attempt?.elapsedSeconds,
    attempt?.clock?.elapsedActiveSeconds,
    attempt?.timer?.elapsedSeconds
  ));
  return seconds === null ? 0 : Math.max(0, seconds * 1000);
}

export function durationMsFromAttempt(attempt) {
  const milliseconds = finiteNumber(firstDefined(
    attempt?.durationMs,
    attempt?.timeLimitMs,
    attempt?.clock?.durationMs,
    attempt?.form?.durationMs
  ));
  if (milliseconds !== null && milliseconds > 0) return milliseconds;
  const seconds = finiteNumber(firstDefined(
    attempt?.durationSeconds,
    attempt?.timeLimitSeconds,
    attempt?.clock?.durationSeconds,
    attempt?.form?.durationSeconds
  ));
  return seconds !== null && seconds > 0 ? seconds * 1000 : DEFAULT_DURATION_MS;
}

export function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor((finiteNumber(milliseconds, 0) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatScore(value) {
  const score = finiteNumber(value);
  if (score === null) return '—';
  return Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function scoreFromSubmission(submission) {
  return firstDefined(
    submission?.score?.totalPoints,
    submission?.score?.points,
    submission?.totalScore,
    submission?.points,
    submission?.result?.score?.totalPoints,
    submission?.result?.score,
    null
  );
}

export function maximumScoreFromSubmission(submission) {
  return firstDefined(
    submission?.score?.maximumPoints,
    submission?.maximumScore,
    submission?.result?.score?.maximumPoints,
    null
  );
}

export function submissionsFrom(value) {
  const root = unwrapData(value);
  const candidates = [root.submissions, root.result?.submissions, root.results?.submissions, root.attempt?.submissions];
  return candidates.find(Array.isArray) || [];
}

export function latestSubmissionOfKind(attempt, kind) {
  const expected = String(kind).toUpperCase();
  return submissionsFrom(attempt)
    .filter((submission) => String(firstDefined(submission?.kind, submission?.type, '')).toUpperCase() === expected)
    .sort((left, right) => timestampMs(right) - timestampMs(left))[0] || null;
}

/** The manual checkpoint and the automatic 75-minute snapshot share one slot. */
export function hasUsedPreliminarySubmission(attempt) {
  return Boolean(
    latestSubmissionOfKind(attempt, 'CHECKPOINT')
    || latestSubmissionOfKind(attempt, 'DEADLINE')
  );
}

/**
 * A score-producing mutation must name the exact answer sheet and attempt
 * state the student reviewed. This prevents a stale browser tab from scoring
 * a different tab's unseen answer sheet.
 */
export function submissionPrecondition(attempt) {
  const expectedAnswersRevision = answerRevisionFromAttempt(attempt);
  const expectedStateRevision = stateRevisionFromAttempt(attempt);
  if (expectedAnswersRevision === null || expectedStateRevision === null) return null;
  return { expectedAnswersRevision, expectedStateRevision };
}

export function timestampMs(value) {
  const raw = firstDefined(value?.createdAt, value?.submittedAt, value?.occurredAt, value?.at, value);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const parsed = Date.parse(String(raw || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDateTime(value) {
  const milliseconds = timestampMs(value);
  if (!milliseconds) return 'Saved submission';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(milliseconds));
}

export function idempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const random = Math.random().toString(36).slice(2);
  return `amc-${Date.now().toString(36)}-${random}`;
}

/**
 * Keep a caller-provided mutation key stable across retries.  In particular,
 * resetAttempt deliberately supplies one key twice when its first response is
 * lost, so generating a fresh key here would turn a retry into a second reset.
 */
export function idempotencyHeaderValue(idempotency, generate = idempotencyKey) {
  if (!idempotency) return null;
  return typeof idempotency === 'string' ? idempotency : generate();
}

export function safeUrl(value, baseUrl = globalThis.location?.href || globalThis.location?.origin || 'http://localhost/') {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    if (url.protocol === 'data:' && /^data:image\/(?:png|gif|jpe?g|webp);/i.test(value)) return url.href;
  } catch {
    // A malformed URL is rendered as text rather than as a link or image.
  }
  return null;
}

class ApiClient {
  constructor({ onCsrfToken, onUnauthorized } = {}) {
    this.onCsrfToken = onCsrfToken;
    this.onUnauthorized = onUnauthorized;
    this.csrfToken = null;
  }

  setCsrfToken(token) {
    this.csrfToken = token || null;
  }

  async request(path, { method = 'GET', body, idempotency = false, signal } = {}) {
    const headers = { Accept: 'application/json', 'Cache-Control': 'no-store' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (this.csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = this.csrfToken;
    const mutationKey = !['GET', 'HEAD', 'OPTIONS'].includes(method)
      ? idempotencyHeaderValue(idempotency)
      : null;
    if (mutationKey) headers['Idempotency-Key'] = mutationKey;

    let response;
    try {
      response = await fetch(path.startsWith('/') ? path : `${API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'include',
        cache: 'no-store',
        redirect: 'error',
        signal
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to reach the practice service. Check your connection and try again.', {
        code: 'NETWORK_ERROR',
        payload: error
      });
    }

    const headerToken = response.headers.get('x-csrf-token') || response.headers.get('x-amc12-csrf-token');
    if (headerToken) this.captureCsrfToken(headerToken);

    let payload = null;
    const contentType = response.headers.get('content-type') || '';
    try {
      if (response.status !== 204) payload = contentType.includes('json') ? await response.json() : await response.text();
    } catch {
      payload = null;
    }

    if (isRecord(payload)) {
      const token = firstDefined(payload.csrfToken, payload.data?.csrfToken, payload.auth?.csrfToken);
      if (token) this.captureCsrfToken(token);
    }

    if (!response.ok) {
      const errorDetails = isRecord(payload) ? firstDefined(payload.error, payload) : {};
      const message = String(firstDefined(errorDetails?.message, payload?.message, `Request failed (${response.status}).`));
      const error = new ApiError(message, {
        status: response.status,
        code: String(firstDefined(errorDetails?.code, payload?.code, 'REQUEST_FAILED')),
        payload
      });
      if (response.status === 401) this.onUnauthorized?.(error);
      throw error;
    }
    return payload;
  }

  captureCsrfToken(token) {
    this.csrfToken = token;
    this.onCsrfToken?.(token);
  }

  get(path) { return this.request(path); }
  post(path, body = {}, options = {}) { return this.request(path, { method: 'POST', body, idempotency: true, ...options }); }
  put(path, body = {}, options = {}) { return this.request(path, { method: 'PUT', body, idempotency: true, ...options }); }
}

const state = {
  student: null,
  forms: [],
  attemptHistory: [],
  attempt: null,
  questions: [],
  answers: new Map(),
  dirtyAnswers: new Set(),
  answerRevision: null,
  attemptEpoch: 0,
  currentQuestionIndex: 0,
  saveQueue: Promise.resolve(),
  pendingSaveCount: 0,
  lastSaveError: null,
  timerBaseMs: 0,
  timerSyncedAt: 0,
  timerInterval: null,
  pollInterval: null,
  polling: false,
  deadlineRefreshInFlight: false,
  deadlineRefreshNotBefore: 0,
  localDeadlineLocked: false,
  modal: null,
  lastFocused: null,
  formCache: new Map(),
  resultPayload: null,
  solutionsPayload: null
};

let elements = null;
let api = null;
// The MathJax bundle can finish after the UI has rendered its first question.
// Keep readiness separately so the event is not lost when it fires before the
// DOMContentLoaded bootstrap handler has populated `elements`.
let mathJaxReady = typeof window !== 'undefined' && Boolean(window.MathJax?.typesetPromise);

function getElements() {
  const byId = (id) => document.getElementById(id);
  return {
    loadingView: byId('loading-view'), loginView: byId('login-view'), dashboardView: byId('dashboard-view'),
    practiceView: byId('practice-view'), resultsView: byId('results-view'),
    userName: byId('user-name'), dashboardButton: byId('dashboard-button'), logoutButton: byId('logout-button'),
    globalStatus: byId('global-status'), globalError: byId('global-error'), globalErrorMessage: byId('global-error-message'),
    globalErrorDismiss: byId('global-error-dismiss'), loginForm: byId('login-form'), loginAccessCode: byId('login-access-code'),
    loginSubmit: byId('login-submit'), loginError: byId('login-error'), formsList: byId('forms-list'), formsEmpty: byId('forms-empty'),
    refreshForms: byId('refresh-forms-button'), formLabel: byId('form-label'), attemptTitle: byId('attempt-title'),
    attemptState: byId('attempt-state'), timerValue: byId('timer-value'), timerLimit: byId('timer-limit'),
    timerCard: document.querySelector('.timer-card'), pauseButton: byId('pause-button'), resumeButton: byId('resume-button'),
    saveStatus: byId('save-status'), practiceResetButton: byId('practice-reset-button'), checkpointButton: byId('checkpoint-button'), finalButton: byId('final-button'),
    questionNav: byId('question-nav'), answeredCount: byId('answered-count'), questionPosition: byId('question-position'),
    questionSaveIndicator: byId('question-save-indicator'), questionContent: byId('question-content'), answerForm: byId('answer-form'),
    answerOptions: byId('answer-options'), previousQuestion: byId('previous-question'), clearAnswerButton: byId('clear-answer-button'), nextQuestion: byId('next-question'),
    resultsSummary: byId('results-summary'), finalScore: byId('final-score'), scoreDetails: byId('score-details'),
    submissionHistory: byId('submission-history'), resultsQuestions: byId('results-questions'), solutionsList: byId('solutions-list'),
    expandSolutions: byId('expand-solutions-button'), resetButton: byId('reset-button'), resultsDashboardButton: byId('results-dashboard-button'),
    modalBackdrop: byId('modal-backdrop'), modal: byId('modal'), modalTitle: byId('modal-title'), modalMessage: byId('modal-message'),
    modalActions: byId('modal-actions'), modalClose: byId('modal-close')
  };
}

function showOnly(view) {
  const views = [elements.loadingView, elements.loginView, elements.dashboardView, elements.practiceView, elements.resultsView];
  views.forEach((candidate) => { candidate.hidden = candidate !== view; });
  if (view !== elements.practiceView) stopAttemptSync();
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function appendText(node, value) {
  node.appendChild(document.createTextNode(String(value ?? '')));
}

function setButtonBusy(button, busy, label = null) {
  if (!button) return;
  if (busy) {
    button.dataset.originalLabel ??= button.textContent;
    button.disabled = true;
    if (label) button.textContent = label;
  } else {
    button.disabled = false;
    if (button.dataset.originalLabel) {
      button.textContent = button.dataset.originalLabel;
      delete button.dataset.originalLabel;
    }
  }
}

function showStatus(message, { persistent = false } = {}) {
  if (!message) {
    elements.globalStatus.hidden = true;
    elements.globalStatus.textContent = '';
    return;
  }
  elements.globalStatus.textContent = message;
  elements.globalStatus.hidden = false;
  if (!persistent) {
    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => showStatus(''), 4500);
  }
}

function showError(message, { persistent = false } = {}) {
  elements.globalErrorMessage.textContent = message;
  elements.globalError.hidden = false;
  if (!persistent) {
    window.clearTimeout(showError.timeout);
    showError.timeout = window.setTimeout(() => hideError(), 8500);
  }
}

function hideError() {
  elements.globalError.hidden = true;
  elements.globalErrorMessage.textContent = '';
}

function clearLoginError() {
  elements.loginError.hidden = true;
  elements.loginError.textContent = '';
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.hidden = false;
}

function updateHeader() {
  const signedIn = Boolean(state.student);
  elements.userName.hidden = !signedIn;
  elements.dashboardButton.hidden = !signedIn;
  elements.logoutButton.hidden = !signedIn;
  elements.userName.textContent = signedIn ? String(firstDefined(state.student.displayName, state.student.name, state.student.id, 'Student')) : '';
}

function setStudent(payload) {
  const root = unwrapData(payload);
  const student = firstDefined(root.student, root.user, null);
  state.student = isRecord(student) ? student : null;
  const token = firstDefined(root.csrfToken, root.auth?.csrfToken, null);
  if (token) api.setCsrfToken(token);
  updateHeader();
}

function setCsrfToken(token) {
  if (token) api.setCsrfToken(token);
}

function localSignOut({ message = null } = {}) {
  state.student = null;
  state.forms = [];
  state.attemptHistory = [];
  clearAttemptState();
  api.setCsrfToken(null);
  updateHeader();
  showOnly(elements.loginView);
  clearLoginError();
  if (message) showLoginError(message);
  window.setTimeout(() => elements.loginAccessCode.focus(), 0);
}

function clearAttemptState() {
  stopAttemptSync();
  // A response or save from a prior attempt must never be applied to a newly
  // opened attempt.  Resetting the queue lets the replacement start promptly;
  // the old closures retain their epoch and become harmless no-ops.
  state.attemptEpoch += 1;
  state.saveQueue = Promise.resolve();
  state.attempt = null;
  state.questions = [];
  state.answers = new Map();
  state.dirtyAnswers = new Set();
  state.answerRevision = null;
  state.currentQuestionIndex = 0;
  state.pendingSaveCount = 0;
  state.lastSaveError = null;
  state.deadlineRefreshInFlight = false;
  state.deadlineRefreshNotBefore = 0;
  state.localDeadlineLocked = false;
  state.resultPayload = null;
  state.solutionsPayload = null;
}

function handleUnauthorized() {
  if (!state.student) return;
  localSignOut({ message: 'Your session has expired. Sign in again to continue.' });
}

function handleError(error, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError && error.status === 401) return;
  const message = error instanceof ApiError ? error.message : fallback;
  showError(message || fallback);
}

async function handleAttemptMutationError(error, fallback) {
  if (error instanceof ApiError && state.attempt && error.code === 'ANSWER_REVISION_CONFLICT') {
    await reconcileAfterRevisionConflict();
    return;
  }
  if (error instanceof ApiError && state.attempt && ['LIMIT_NOTICE_REQUIRED', 'INVALID_STATE'].includes(error.code)) {
    await reconcileStateConflict(error);
    return;
  }
  handleError(error, fallback);
}

function isAttemptActive(attempt = state.attempt) {
  const phase = normalizePhase(attempt);
  return ['TIMED', 'LIMIT_NOTICE', 'OVERTIME'].includes(phase);
}

export function attemptAllowsAnswerEdits(attempt) {
  return ['TIMED', 'OVERTIME'].includes(normalizePhase(attempt)) && normalizeClockState(attempt) === 'RUNNING';
}

/**
 * The server remains authoritative, but the browser must stop accepting a
 * click as soon as its server-synchronized display clock reaches 75 minutes.
 * It then immediately reconciles with the server instead of waiting for the
 * ordinary background poll. Overtime deliberately stays editable.
 */
export function timedLimitLocallyReached(attempt, elapsedMs) {
  if (normalizePhase(attempt) !== 'TIMED' || normalizeClockState(attempt) !== 'RUNNING') return false;
  const elapsed = finiteNumber(elapsedMs);
  return elapsed !== null && elapsed >= durationMsFromAttempt(attempt);
}

export function attemptCanBeReset(attempt) {
  return Boolean(attempt?.id) && ['TIMED', 'LIMIT_NOTICE', 'OVERTIME', 'FINALIZED'].includes(normalizePhase(attempt));
}

function canEditAnswers(attempt = state.attempt) {
  if (!attemptAllowsAnswerEdits(attempt)) return false;
  const elapsed = sameAttemptId(attempt, state.attempt) ? currentElapsedMs() : elapsedMsFromAttempt(attempt);
  return !timedLimitLocallyReached(attempt, elapsed);
}

function attemptContext() {
  if (!state.attempt?.id) return null;
  return { id: String(state.attempt.id), epoch: state.attemptEpoch };
}

function isCurrentAttemptContext(context) {
  return Boolean(context)
    && context.epoch === state.attemptEpoch
    && String(state.attempt?.id || '') === context.id;
}

function mergeAttemptResult(payload, { preferLocalAnswers = true } = {}) {
  const candidate = extractAttempt(payload);
  if (!isRecord(candidate) || !candidate.id) return { attempt: state.attempt, applied: false };
  // Ignore an in-flight response for a different attempt. This is important
  // when a student opens/reset another test before a poll or mutation returns.
  if (state.attempt?.id && !sameAttemptId(state.attempt, candidate)) return { attempt: state.attempt, applied: false };
  if (state.attempt?.id && saveResponseNeedsReconciliation(state.attempt, candidate)) return { attempt: state.attempt, applied: false };
  state.attempt = candidate;
  const serverAnswers = answerMapFromAttempt(candidate);
  if (!preferLocalAnswers || state.dirtyAnswers.size === 0) {
    state.answers = serverAnswers;
  } else {
    for (const [number, option] of serverAnswers) {
      if (!state.dirtyAnswers.has(number)) state.answers.set(number, option);
    }
  }
  const revision = extractRevision(candidate);
  if (revision !== null) state.answerRevision = revision;
  syncTimer(candidate);
  return { attempt: candidate, applied: true };
}

function mergeAttempt(payload, options = {}) {
  return mergeAttemptResult(payload, options).attempt;
}

function extractFormId(attempt = state.attempt) {
  return firstDefined(attempt?.formId, attempt?.form?.id, attempt?.examFormId, attempt?.revisionId, null);
}

function extractFormVersion(attempt = state.attempt) {
  return firstDefined(attempt?.formVersion, attempt?.form?.version, attempt?.examFormVersion, null);
}

function formFromPayload(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.form, root.examForm, isRecord(root) && root.id && (root.questions || root.title) ? root : null);
}

function formForAttempt(attempt = state.attempt) {
  const id = extractFormId(attempt);
  const version = extractFormVersion(attempt);
  const embedded = firstDefined(attempt?.form, attempt?.examForm, null);
  if (isRecord(embedded) && Array.isArray(embedded.questions)
      && (version === null || version === undefined || String(embedded.version) === String(version))) return embedded;
  const cacheKey = formCacheKey(id, version);
  if (id && state.formCache.has(cacheKey)) return state.formCache.get(cacheKey);
  return state.forms.find((form) => String(form.id) === String(id)
    && (version === null || version === undefined || String(form.version) === String(version))) || embedded || null;
}

async function ensureQuestions(payload = null) {
  const candidates = extractQuestions(payload, state.attempt);
  if (candidates.length) {
    state.questions = candidates.map(normalizeQuestion).sort((left, right) => left.number - right.number);
    return state.questions;
  }
  const form = formForAttempt();
  if (form?.questions?.length) {
    state.questions = form.questions.map(normalizeQuestion).sort((left, right) => left.number - right.number);
    return state.questions;
  }
  const formId = extractFormId();
  const formVersion = extractFormVersion();
  if (!formId) throw new ApiError('This attempt has no linked form.', { code: 'FORM_NOT_FOUND' });
  // This owner-scoped route pins the content revision captured by the
  // attempt, even if a newer revision is published or this old revision is no
  // longer publicly listed. Never substitute the latest public form here.
  const response = state.attempt?.id
    ? await api.get(attemptFormPath(state.attempt.id))
    : await api.get(publicFormPath(formId, formVersion));
  const loadedForm = formFromPayload(response);
  if (!loadedForm) throw new ApiError('The practice form could not be loaded.', { code: 'FORM_NOT_FOUND' });
  if (String(loadedForm.id) !== String(formId)
      || (formVersion !== null && formVersion !== undefined && String(loadedForm.version) !== String(formVersion))) {
    throw new ApiError('The practice form revision does not match this saved attempt.', { code: 'FORM_VERSION_MISMATCH' });
  }
  state.formCache.set(formCacheKey(formId, firstDefined(loadedForm.version, formVersion)), loadedForm);
  const questions = extractQuestions(response, state.attempt);
  if (!questions.length) throw new ApiError('The practice form contains no questions.', { code: 'FORM_EMPTY' });
  state.questions = questions.map(normalizeQuestion).sort((left, right) => left.number - right.number);
  return state.questions;
}

function syncTimer(attempt) {
  state.timerBaseMs = elapsedMsFromAttempt(attempt);
  state.timerSyncedAt = Date.now();
}

function currentElapsedMs() {
  if (!state.attempt) return 0;
  const running = normalizeClockState(state.attempt) === 'RUNNING';
  return state.timerBaseMs + (running ? Math.max(0, Date.now() - state.timerSyncedAt) : 0);
}

function renderTimer() {
  if (!state.attempt) return;
  const elapsed = currentElapsedMs();
  const duration = durationMsFromAttempt(state.attempt);
  const phase = normalizePhase(state.attempt);
  const clock = normalizeClockState(state.attempt);
  const localTimedLimit = timedLimitLocallyReached(state.attempt, elapsed);
  elements.timerValue.textContent = formatDuration(elapsed);
  elements.timerValue.dateTime = `PT${Math.floor(elapsed / 1000)}S`;
  elements.timerLimit.textContent = `of ${formatDuration(duration)}`;
  elements.timerCard.classList.toggle('is-paused', clock === 'PAUSED');
  elements.timerCard.classList.toggle('is-limit', phase === 'LIMIT_NOTICE' || phase === 'OVERTIME' || localTimedLimit);
  if (localTimedLimit) {
    if (!state.localDeadlineLocked) {
      // Disable the currently visible radios before the reconciliation GET
      // returns. `canEditAnswers()` applies the same guard to an event that
      // races this one-second display tick.
      state.localDeadlineLocked = true;
      if (!elements.practiceView.hidden) renderCurrentQuestion();
    }
    requestDeadlineReconciliation();
  } else {
    state.localDeadlineLocked = false;
  }
}

function startAttemptSync() {
  stopAttemptSync();
  renderTimer();
  state.timerInterval = window.setInterval(renderTimer, 1000);
  state.pollInterval = window.setInterval(() => {
    if (!document.hidden) refreshAttempt({ quiet: true });
  }, 15000);
}

function stopAttemptSync() {
  if (state.timerInterval) window.clearInterval(state.timerInterval);
  if (state.pollInterval) window.clearInterval(state.pollInterval);
  state.timerInterval = null;
  state.pollInterval = null;
  state.polling = false;
}

function attemptStateText(attempt = state.attempt) {
  const phase = normalizePhase(attempt);
  const clock = normalizeClockState(attempt);
  if (phase === 'TIMED' && clock === 'PAUSED') return 'Timer paused';
  if (phase === 'TIMED') return 'Timed practice in progress';
  if (phase === 'LIMIT_NOTICE') return 'The 75-minute time limit has been reached';
  if (phase === 'OVERTIME') return 'Continuing after the 75-minute time limit';
  if (phase === 'FINALIZED') return 'Final submission complete';
  if (phase === 'RESET') return 'This attempt has been reset';
  return 'Practice attempt';
}

function renderAttemptHeader() {
  const form = formForAttempt();
  const phase = normalizePhase(state.attempt);
  const clock = normalizeClockState(state.attempt);
  const title = firstDefined(form?.title, state.attempt?.formTitle, state.attempt?.title, 'AMC 12 practice test');
  const label = firstDefined(form?.paper, form?.label, state.attempt?.formLabel, 'AMC 12 practice');
  elements.formLabel.textContent = String(label);
  elements.attemptTitle.textContent = String(title);
  elements.attemptState.textContent = attemptStateText();
  elements.pauseButton.hidden = clock !== 'RUNNING' || !isAttemptActive();
  elements.resumeButton.hidden = clock !== 'PAUSED' || !isAttemptActive();
  elements.pauseButton.disabled = phase === 'LIMIT_NOTICE';
  elements.resumeButton.disabled = phase === 'LIMIT_NOTICE';
  const checkpoint = latestSubmissionOfKind(state.attempt, 'CHECKPOINT');
  const deadline = latestSubmissionOfKind(state.attempt, 'DEADLINE');
  elements.checkpointButton.disabled = !isAttemptActive() || hasUsedPreliminarySubmission(state.attempt) || phase === 'LIMIT_NOTICE';
  elements.checkpointButton.textContent = checkpoint ? 'Score checked' : deadline ? 'Time-limit score saved' : 'Check score';
  elements.finalButton.disabled = !isAttemptActive();
  elements.finalButton.textContent = phase === 'LIMIT_NOTICE' ? 'Stop and submit' : 'Submit final answers';
  elements.practiceResetButton.disabled = !attemptCanBeReset(state.attempt);
  renderTimer();
}

function renderSaveStatus() {
  const hasError = Boolean(state.lastSaveError);
  const saving = state.pendingSaveCount > 0;
  const text = hasError ? 'Answers not saved — try again before submitting' : saving ? 'Saving answers…' : 'All changes saved';
  [elements.saveStatus, elements.questionSaveIndicator].forEach((node) => {
    node.textContent = node === elements.questionSaveIndicator && !saving && !hasError ? '' : text;
    node.classList.toggle('is-saving', saving);
    node.classList.toggle('is-error', hasError);
  });
}

function renderQuestionNavigation() {
  clearNode(elements.questionNav);
  const current = state.questions[state.currentQuestionIndex];
  const answered = state.questions.filter((question) => Boolean(state.answers.get(question.number))).length;
  elements.answeredCount.textContent = `${answered} of ${state.questions.length} answered`;
  for (const [index, question] of state.questions.entries()) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(question.number);
    button.title = `Question ${question.number}${state.answers.get(question.number) ? ', answered' : ''}`;
    if (current?.number === question.number) button.setAttribute('aria-current', 'step');
    if (state.answers.get(question.number)) button.classList.add('is-answered');
    button.addEventListener('click', () => goToQuestion(index, { focus: true }));
    item.appendChild(button);
    elements.questionNav.appendChild(item);
  }
}

function appendInlineMarkdown(parent, source) {
  const value = String(source ?? '');
  const token = /(!?\[[^\]]*\]\([^\s)]+(?:\s+"[^"]*")?\)|`[^`]*`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let cursor = 0;
  for (const match of value.matchAll(token)) {
    if (match.index > cursor) appendText(parent, value.slice(cursor, match.index));
    const raw = match[0];
    const image = raw.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);
    const link = raw.match(/^\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)$/);
    if (image) {
      const url = safeUrl(image[2]);
      if (url) {
        const element = document.createElement('img');
        element.src = url;
        element.alt = image[1];
        element.loading = 'lazy';
        parent.appendChild(element);
      } else appendText(parent, raw);
    } else if (link) {
      const url = safeUrl(link[2]);
      if (url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        appendText(anchor, link[1]);
        parent.appendChild(anchor);
      } else appendText(parent, raw);
    } else if (raw.startsWith('`')) {
      const code = document.createElement('code');
      appendText(code, raw.slice(1, -1));
      parent.appendChild(code);
    } else {
      const tag = raw.startsWith('**') || raw.startsWith('__') ? 'strong' : 'em';
      const element = document.createElement(tag);
      appendText(element, raw.slice(tag === 'strong' ? 2 : 1, tag === 'strong' ? -2 : -1));
      parent.appendChild(element);
    }
    cursor = match.index + raw.length;
  }
  if (cursor < value.length) appendText(parent, value.slice(cursor));
}

/** A deliberately small, safe Markdown renderer for API-provided prompt/solution text. */
function renderMarkdown(container, markdown) {
  clearNode(container);
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  let index = 0;
  const appendParagraph = (paragraphLines) => {
    if (!paragraphLines.length) return;
    const paragraph = document.createElement('p');
    paragraphLines.forEach((line, lineIndex) => {
      if (lineIndex) paragraph.appendChild(document.createElement('br'));
      appendInlineMarkdown(paragraph, line);
    });
    container.appendChild(paragraph);
  };
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const displayStart = line.trim().startsWith('$$');
    if (displayStart) {
      const mathLines = [];
      const trimmed = line.trim();
      if (trimmed.length > 4 && trimmed.endsWith('$$')) {
        mathLines.push(trimmed.slice(2, -2));
        index += 1;
      } else {
        mathLines.push(trimmed.slice(2));
        index += 1;
        while (index < lines.length && !lines[index].trim().endsWith('$$')) {
          mathLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) {
          const closing = lines[index].trim();
          mathLines.push(closing.slice(0, -2));
          index += 1;
        }
      }
      const math = document.createElement('div');
      math.className = 'math-display';
      appendText(math, `\\[${mathLines.join('\n')}\\]`);
      container.appendChild(math);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 2, 6);
      const element = document.createElement(`h${level}`);
      appendInlineMarkdown(element, heading[2]);
      container.appendChild(element);
      index += 1;
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      const blockquote = document.createElement('blockquote');
      appendInlineMarkdown(blockquote, quote[1]);
      container.appendChild(blockquote);
      index += 1;
      continue;
    }
    const listMatch = line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if (listMatch) {
      const ordered = /^\s*\d+\. /.test(line);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const current = lines[index].match(/^\s*([-*+] |\d+\. )(.*)$/);
        if (!current || /^\s*\d+\. /.test(lines[index]) !== ordered) break;
        const item = document.createElement('li');
        appendInlineMarkdown(item, current[2]);
        list.appendChild(item);
        index += 1;
      }
      container.appendChild(list);
      continue;
    }
    const paragraphLines = [];
    while (index < lines.length && lines[index].trim()) {
      if (paragraphLines.length && (lines[index].trim().startsWith('$$') || /^(#{1,4})\s+/.test(lines[index]) || /^>\s?/.test(lines[index]) || /^\s*([-*+] |\d+\. )/.test(lines[index]))) break;
      paragraphLines.push(lines[index]);
      index += 1;
    }
    appendParagraph(paragraphLines);
  }
}

function mathJaxTypesetter() {
  if (typeof window === 'undefined' || !window.MathJax?.typesetPromise) return null;
  mathJaxReady = true;
  return window.MathJax.typesetPromise.bind(window.MathJax);
}

function typesetMath(nodes) {
  const typesetter = mathJaxTypesetter();
  if (typesetter) {
    typesetter(nodes).catch(() => {
      // Rendering text fallback is preferable to failing the test UI.
    });
  }
}

function typesetVisiblePracticeMath() {
  if (!elements) return;
  const nodes = [
    elements.questionContent,
    elements.answerOptions,
    elements.resultsQuestions,
    elements.solutionsList
  ].filter(Boolean);
  typesetMath(nodes);
}

function goToQuestion(index, { focus = false } = {}) {
  if (index < 0 || index >= state.questions.length) return;
  state.currentQuestionIndex = index;
  renderQuestionNavigation();
  renderCurrentQuestion({ focus });
}

function renderCurrentQuestion({ focus = false } = {}) {
  const question = state.questions[state.currentQuestionIndex];
  if (!question) {
    elements.questionPosition.textContent = 'Question unavailable';
    clearNode(elements.questionContent);
    clearNode(elements.answerOptions);
    return;
  }
  elements.questionPosition.textContent = `Question ${question.number} of ${state.questions.length}`;
  renderMarkdown(elements.questionContent, question.promptMarkdown);
  clearNode(elements.answerOptions);
  const legend = document.createElement('legend');
  legend.textContent = 'Choose one answer';
  elements.answerOptions.appendChild(legend);
  const selected = state.answers.get(question.number) || null;
  const enabled = canEditAnswers();
  elements.clearAnswerButton.disabled = !enabled || selected === null;
  elements.clearAnswerButton.setAttribute('aria-label', `Clear answer for question ${question.number}`);
  const choices = question.choices.length ? question.choices : OPTIONS.map((option) => ({ option, markdown: option }));
  for (const choice of choices) {
    const id = `answer-${question.number}-${choice.option}`;
    const label = document.createElement('label');
    label.className = 'option-label';
    if (choice.option === selected) label.classList.add('is-selected');
    label.htmlFor = id;
    const input = document.createElement('input');
    input.id = id;
    input.name = `question-${question.number}`;
    input.type = 'radio';
    input.value = choice.option;
    input.checked = choice.option === selected;
    input.disabled = !enabled;
    const key = document.createElement('span');
    key.className = 'option-key';
    key.textContent = choice.option;
    const content = document.createElement('span');
    content.className = 'option-content';
    appendInlineMarkdown(content, choice.markdown);
    label.append(input, key, content);
    elements.answerOptions.appendChild(label);
  }
  elements.previousQuestion.disabled = state.currentQuestionIndex === 0;
  elements.nextQuestion.disabled = state.currentQuestionIndex >= state.questions.length - 1;
  elements.nextQuestion.textContent = state.currentQuestionIndex >= state.questions.length - 1 ? 'Last question' : 'Next';
  renderSaveStatus();
  typesetMath([elements.questionContent, elements.answerOptions]);
  if (focus) {
    elements.questionContent.tabIndex = -1;
    elements.questionContent.focus();
  }
}

function updateQuestionAnswer(questionNumber, option) {
  if (!canEditAnswers()) {
    if (timedLimitLocallyReached(state.attempt, currentElapsedMs())) {
      showStatus('The 75-minute limit has been reached. Confirm whether to submit or continue.');
      requestDeadlineReconciliation();
    } else {
      showStatus('Resume the timer before changing an answer.');
    }
    renderCurrentQuestion();
    return;
  }
  const normalized = OPTIONS.includes(String(option).toUpperCase()) ? String(option).toUpperCase() : null;
  state.answers.set(questionNumber, normalized);
  state.dirtyAnswers.add(questionNumber);
  state.lastSaveError = null;
  renderQuestionNavigation();
  renderCurrentQuestion();
  queueAnswerSave();
}

function queueAnswerSave() {
  const context = attemptContext();
  if (!context || !canEditAnswers()) return;
  // Capture the answer sheet and its owner now. Later queue entries retain
  // their own snapshots, while the revision is read when each entry starts so
  // rapid changes still serialize against the newest server revision.
  const snapshot = new Map(state.answers);
  state.pendingSaveCount += 1;
  renderSaveStatus();
  state.saveQueue = state.saveQueue
    .catch(() => undefined)
    .then(async () => {
      if (!isCurrentAttemptContext(context)) return;
      try {
        const response = await api.put(`${API_BASE}/attempts/${encodeURIComponent(context.id)}/answers`, {
          answers: answerPayload(snapshot),
          ...(state.answerRevision !== null ? { revision: state.answerRevision } : {})
        });
        if (!isCurrentAttemptContext(context)) return;
        const priorPhase = normalizePhase(state.attempt);
        const merged = mergeAttemptResult(response, { preferLocalAnswers: true });
        if (!merged.applied) {
          // A newer poll/mutation has already won. Do not mark this snapshot
          // clean merely because its local option still happens to match: the
          // server may have a different answer from another tab. Reconcile
          // before final submission can use the wrong persisted choice.
          await reconcileAfterRevisionConflict(context);
          return;
        }
        for (const [number, sentOption] of snapshot) {
          if (state.answers.get(number) === sentOption) state.dirtyAnswers.delete(number);
        }
        state.lastSaveError = null;
        if (normalizePhase(state.attempt) !== priorPhase) reconcilePracticeStateAfterServerUpdate();
      } catch (error) {
        if (!isCurrentAttemptContext(context)) return;
        if (error instanceof ApiError && error.code === 'ANSWER_REVISION_CONFLICT') {
          await reconcileAfterRevisionConflict(context);
        } else if (error instanceof ApiError && ['LIMIT_NOTICE_REQUIRED', 'INVALID_STATE'].includes(error.code)) {
          await reconcileStateConflict(error, context);
        } else {
          state.lastSaveError = error;
          handleError(error, 'Your answer could not be saved.');
        }
      } finally {
        if (!isCurrentAttemptContext(context)) return;
        state.pendingSaveCount = Math.max(0, state.pendingSaveCount - 1);
        renderSaveStatus();
      }
    });
}

async function reconcileAfterRevisionConflict(context = attemptContext()) {
  if (!context) return;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    mergeAttempt(response, { preferLocalAnswers: false });
    state.dirtyAnswers.clear();
    state.lastSaveError = null;
    reconcilePracticeStateAfterServerUpdate();
    showError('Answers changed in another session. The server’s latest answers are now shown; choose an option again to make a new change.');
  } catch (error) {
    if (!isCurrentAttemptContext(context)) return;
    state.lastSaveError = error;
    handleError(error, 'Could not reconcile answer changes.');
  }
}

async function reconcileStateConflict(error, context = attemptContext()) {
  if (!context) return;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    mergeAttempt(response, { preferLocalAnswers: false });
    state.dirtyAnswers.clear();
    state.lastSaveError = null;
    reconcilePracticeStateAfterServerUpdate();
    if (error.code !== 'LIMIT_NOTICE_REQUIRED') {
      showError('This attempt changed in another session. The server’s latest state is now shown.');
    }
  } catch (refreshError) {
    if (!isCurrentAttemptContext(context)) return;
    state.lastSaveError = refreshError;
    handleError(refreshError, 'Could not refresh the latest attempt state.');
  }
}

function reconcilePracticeStateAfterServerUpdate() {
  if (elements.practiceView.hidden || !state.attempt) return;
  if (canAccessFinalReview(state.attempt)) {
    showResults();
    return;
  }
  renderAttemptHeader();
  renderQuestionNavigation();
  renderCurrentQuestion();
  if (normalizePhase(state.attempt) === 'LIMIT_NOTICE') openLimitNotice();
}

async function flushAnswerSaves() {
  await state.saveQueue;
  if (state.lastSaveError) {
    throw new ApiError('Answers are not fully saved. Please retry the failed save before submitting.', {
      code: 'ANSWER_SAVE_FAILED', payload: state.lastSaveError
    });
  }
}

function submissionRequestPayload(body = {}) {
  const precondition = submissionPrecondition(state.attempt);
  if (!precondition) {
    throw new ApiError('The attempt version is unavailable. Refresh before submitting.', {
      code: 'ATTEMPT_REVISION_MISSING'
    });
  }
  return { ...body, ...precondition };
}

function requestDeadlineReconciliation() {
  const context = attemptContext();
  const now = Date.now();
  if (!context || state.deadlineRefreshInFlight || now < state.deadlineRefreshNotBefore) return;
  // The ordinary poll intentionally runs at a relaxed cadence. Crossing the
  // displayed 75-minute boundary is different: issue one immediate, separate
  // GET so a slow existing poll cannot leave answer controls writable.
  state.deadlineRefreshInFlight = true;
  state.deadlineRefreshNotBefore = now + 5_000;
  void refreshAttempt({ quiet: true, urgent: true }).finally(() => {
    if (isCurrentAttemptContext(context)) state.deadlineRefreshInFlight = false;
  });
}

async function refreshAttempt({ quiet = false, urgent = false } = {}) {
  const context = attemptContext();
  if (!context || (state.polling && !urgent)) return;
  if (!urgent) state.polling = true;
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(context.id)}`);
    if (!isCurrentAttemptContext(context)) return;
    const priorPhase = normalizePhase(state.attempt);
    const attempt = mergeAttempt(response, { preferLocalAnswers: true });
    if (canAccessFinalReview(attempt)) {
      await showResults();
      return;
    }
    renderAttemptHeader();
    renderQuestionNavigation();
    renderCurrentQuestion();
    if (normalizePhase(attempt) === 'LIMIT_NOTICE' && priorPhase !== 'LIMIT_NOTICE') openLimitNotice();
  } catch (error) {
    if (isCurrentAttemptContext(context) && !quiet) handleError(error, 'Could not refresh this attempt.');
  } finally {
    if (!urgent && isCurrentAttemptContext(context)) state.polling = false;
  }
}

async function loadForms({ quiet = false } = {}) {
  setButtonBusy(elements.refreshForms, true, 'Refreshing…');
  try {
    const response = await api.get(`${API_BASE}/forms`);
    state.forms = extractForms(response);
    for (const form of state.forms) if (form?.id) state.formCache.set(formCacheKey(form.id, form.version), form);
    try {
      const historyResponse = await api.get(`${API_BASE}/attempts`);
      state.attemptHistory = extractAttemptHistory(historyResponse);
    } catch (historyError) {
      // Form selection remains useful if a deployment is rolling out history
      // separately; a normal user-facing error is shown only for the form API.
      state.attemptHistory = [];
      if (!quiet && !(historyError instanceof ApiError && historyError.status === 404)) {
        showStatus('Saved attempt history is temporarily unavailable.');
      }
    }
    renderForms();
  } catch (error) {
    if (!quiet) handleError(error, 'Could not load practice forms.');
  } finally {
    setButtonBusy(elements.refreshForms, false);
  }
}

function activeAttemptForForm(form) {
  const historyAttempt = state.attemptHistory
    .filter((attempt) => String(attempt?.formId) === String(form?.id) && isAttemptActive(attempt))
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt))[0];
  if (historyAttempt) return historyAttempt;
  const direct = firstDefined(form?.activeAttempt, form?.resumeAttempt, form?.attemptInProgress, null);
  if (isRecord(direct)) return direct;
  const attempts = Array.isArray(form?.attempts) ? form.attempts : [];
  return attempts.find((attempt) => isAttemptActive(attempt)) || null;
}

function historyForForm(form) {
  const candidates = [
    ...state.attemptHistory.filter((attempt) => String(attempt?.formId) === String(form?.id)),
    ...(Array.isArray(form?.attempts) ? form.attempts : [])
  ];
  const seen = new Set();
  return candidates
    .filter((attempt) => attempt?.id && !seen.has(attempt.id) && seen.add(attempt.id))
    .sort((left, right) => timestampMs(right.createdAt) - timestampMs(left.createdAt));
}

function renderForms() {
  clearNode(elements.formsList);
  elements.formsEmpty.hidden = state.forms.length > 0;
  for (const form of state.forms) {
    const card = document.createElement('article');
    card.className = 'form-card';
    const label = document.createElement('p');
    label.className = 'eyebrow';
    label.textContent = String(firstDefined(form.paper, form.label, 'AMC 12'));
    const title = document.createElement('h2');
    title.textContent = String(firstDefined(form.title, form.name, form.id, 'Practice form'));
    const meta = document.createElement('p');
    meta.className = 'form-meta';
    const count = finiteNumber(firstDefined(form.questionCount, form.questions?.length), 25);
    const duration = finiteNumber(form.durationMs) || (finiteNumber(firstDefined(form.durationSeconds, form.duration, null)) || 0) * 1000;
    meta.textContent = `${count} questions${duration ? ` · ${formatDuration(duration)} active time` : ''}`;
    const formHistory = historyForForm(form);
    const activeAttempt = activeAttemptForForm(form);
    const history = document.createElement('p');
    history.className = 'form-history';
    const historicalAttempts = finiteNumber(firstDefined(form.attemptCount, formHistory.length, form.history?.length, form.attempts?.length), 0);
    history.textContent = historicalAttempts > 0 ? `${historicalAttempts} saved attempt${historicalAttempts === 1 ? '' : 's'}` : 'No saved attempts yet';
    const actions = document.createElement('div');
    actions.className = 'form-card-actions';
    if (activeAttempt?.id) {
      const resume = document.createElement('button');
      resume.type = 'button'; resume.className = 'button button-primary'; resume.textContent = 'Resume';
      resume.addEventListener('click', () => resumeAttempt(activeAttempt.id));
      actions.appendChild(resume);
    } else {
      const start = document.createElement('button');
      start.type = 'button'; start.className = 'button button-primary'; start.textContent = 'Start practice';
      start.addEventListener('click', () => confirmStartNew(form));
      actions.appendChild(start);
    }
    card.append(label, title, meta, history, actions);
    const previousResults = formHistory.filter((attempt) => Boolean(attempt.resultsAvailable) || normalizePhase(attempt) === 'FINALIZED');
    if (previousResults.length) {
      const details = document.createElement('details');
      details.className = 'form-history-details';
      const summary = document.createElement('summary');
      summary.textContent = `View ${previousResults.length} prior final result${previousResults.length === 1 ? '' : 's'}`;
      const list = document.createElement('div');
      list.className = 'form-history-list';
      for (const attempt of previousResults) {
        const row = document.createElement('div');
        row.className = 'form-history-row';
        const description = document.createElement('span');
        const score = scoreFromSubmission(firstDefined(attempt.finalSubmission, attempt.latestSubmission, null));
        description.textContent = `${formatDateTime(firstDefined(attempt.finalizedAt, attempt.createdAt))}${score !== null ? ` · Score ${formatScore(score)}` : ''}`;
        const view = document.createElement('button');
        view.type = 'button'; view.className = 'button button-secondary'; view.textContent = 'View result';
        view.addEventListener('click', () => resumeAttempt(attempt.id, attempt));
        row.append(description, view);
        list.appendChild(row);
      }
      details.append(summary, list);
      card.appendChild(details);
    }
    elements.formsList.appendChild(card);
  }
}

async function confirmStartNew(form) {
  openModal({
    title: 'Start a new practice test?',
    paragraphs: [
      `${String(firstDefined(form.title, form.name, 'This form'))} has 25 questions and a 75-minute active timer.`,
      'Pausing stops active time. You may check one in-progress score, then submit final answers when you are ready.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Start practice', className: 'button button-primary', handler: () => startAttempt(form) }
    ]
  });
}

async function startAttempt(form) {
  const formId = form?.id;
  if (!formId) return showError('This form is missing an identifier.');
  try {
    const response = await api.post(`${API_BASE}/attempts`, { formId });
    hideModal({ force: true });
    await openAttempt(response, form);
  } catch (error) {
    handleError(error, 'Could not start this practice test.');
  }
}

async function resumeAttempt(attemptId, historySummary = null) {
  try {
    const response = await api.get(`${API_BASE}/attempts/${encodeURIComponent(String(attemptId))}`);
    if (historySummary?.resultsAvailable === true && isRecord(response?.attempt)) {
      response.attempt = { ...response.attempt, resultsAvailable: true };
    }
    await openAttempt(response);
  } catch (error) {
    handleError(error, 'Could not resume this practice test.');
  }
}

async function openAttempt(payload, knownForm = null) {
  clearAttemptState();
  if (knownForm?.id) state.formCache.set(formCacheKey(knownForm.id, knownForm.version), knownForm);
  const attempt = mergeAttempt(payload, { preferLocalAnswers: false });
  if (!attempt?.id) throw new ApiError('The practice service did not return an attempt.', { code: 'INVALID_ATTEMPT' });
  // Historical final results must remain recoverable even when a later form
  // version is unpublished. Results and solutions are owner-gated API data;
  // they do not require re-fetching the public form first.
  if (canAccessFinalReview(attempt)) {
    await showResults();
    return;
  }
  await ensureQuestions(payload);
  if (!state.questions.length) throw new ApiError('This practice form contains no accessible questions.', { code: 'FORM_EMPTY' });
  const firstUnanswered = state.questions.findIndex((question) => !state.answers.get(question.number));
  state.currentQuestionIndex = firstUnanswered >= 0 ? firstUnanswered : 0;
  showOnly(elements.practiceView);
  renderAttemptHeader();
  renderQuestionNavigation();
  renderCurrentQuestion();
  startAttemptSync();
  document.getElementById('main-content').focus();
  if (normalizePhase(attempt) === 'LIMIT_NOTICE') openLimitNotice();
}

async function pauseAttempt() {
  try {
    await flushAnswerSaves();
    setButtonBusy(elements.pauseButton, true, 'Pausing…');
    const response = await api.post(`${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/pause`);
    mergeAttempt(response, { preferLocalAnswers: true });
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('Timer paused.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not pause the timer.');
  } finally {
    setButtonBusy(elements.pauseButton, false);
  }
}

async function resumeTimer() {
  try {
    setButtonBusy(elements.resumeButton, true, 'Resuming…');
    const response = await api.post(`${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/resume`);
    mergeAttempt(response, { preferLocalAnswers: true });
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('Timer resumed.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not resume the timer.');
  } finally {
    setButtonBusy(elements.resumeButton, false);
  }
}

function checkpointSummary(submission) {
  if (!submission) return 'The server saved your score checkpoint.';
  const score = formatScore(scoreFromSubmission(submission));
  const details = [];
  const correct = finiteNumber(firstDefined(submission.score?.correctCount, submission.correctCount, submission.result?.score?.correctCount, submission.result?.correctCount));
  const blank = finiteNumber(firstDefined(submission.score?.blankCount, submission.blankCount, submission.unansweredCount, submission.result?.score?.blankCount, submission.result?.blankCount));
  if (correct !== null) details.push(`${correct} correct`);
  if (blank !== null) details.push(`${blank} unanswered`);
  return `Score: ${score}${details.length ? ` (${details.join(', ')})` : ''}. Answers remain editable; solutions stay hidden until final submission.`;
}

function findRecentSubmission(payload, preferredKinds = []) {
  const submissions = submissionsFrom(payload);
  for (const kind of preferredKinds) {
    const matched = submissions.filter((submission) => String(firstDefined(submission.kind, submission.type, '')).toUpperCase() === kind);
    if (matched.length) return matched.sort((left, right) => timestampMs(right) - timestampMs(left))[0];
  }
  const root = unwrapData(payload);
  return firstDefined(root.submission, root.checkpoint, root.deadlineSubmission, submissions.sort((left, right) => timestampMs(right) - timestampMs(left))[0], null);
}

function confirmCheckpoint() {
  if (elements.checkpointButton.disabled) return;
  openModal({
    title: 'Check your in-progress score?',
    paragraphs: [
      'This saves one score checkpoint using your current answers. You can keep working afterward.',
      'Solutions and per-question correct answers remain unavailable until your final submission.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Check score', className: 'button button-primary', handler: submitCheckpoint }
    ]
  });
}

async function submitCheckpoint() {
  try {
    await flushAnswerSaves();
    const response = await api.post(
      `${API_BASE}/attempts/${encodeURIComponent(String(state.attempt.id))}/checkpoint`,
      submissionRequestPayload()
    );
    mergeAttempt(response, { preferLocalAnswers: true });
    renderAttemptHeader();
    const submission = findRecentSubmission(response, ['CHECKPOINT']);
    openModal({
      title: 'Checkpoint saved',
      paragraphs: [checkpointSummary(submission)],
      actions: [{ label: 'Continue answering', className: 'button button-primary', close: true }]
    });
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not save a score checkpoint.');
  }
}

function confirmFinalSubmission() {
  if (elements.finalButton.disabled) return;
  if (normalizePhase(state.attempt) === 'LIMIT_NOTICE') {
    openLimitNotice();
    return;
  }
  const unanswered = state.questions.filter((question) => !state.answers.get(question.number)).length;
  openModal({
    title: 'Submit final answers?',
    paragraphs: [
      unanswered ? `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.` : 'All questions have an answer selected.',
      'Final submission ends this attempt. Your final score, answer review, and solutions will then be available.'
    ],
    actions: [
      { label: 'Keep working', className: 'button button-secondary', close: true },
      { label: 'Submit final answers', className: 'button button-danger', handler: finalizeAttempt }
    ]
  });
}

async function finalizeAttempt() {
  try {
    await flushAnswerSaves();
    const id = encodeURIComponent(String(state.attempt.id));
    const response = normalizePhase(state.attempt) === 'LIMIT_NOTICE'
      ? await api.post(`${API_BASE}/attempts/${id}/deadline-decision`, submissionRequestPayload({ decision: 'finalize' }))
      : await api.post(`${API_BASE}/attempts/${id}/final`, submissionRequestPayload());
    hideModal({ force: true });
    mergeAttempt(response, { preferLocalAnswers: false });
    if (!canAccessFinalReview(state.attempt)) {
      await refreshAttempt();
      return;
    }
    await showResults();
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not submit final answers.');
  }
}

function openLimitNotice() {
  if (!state.attempt || normalizePhase(state.attempt) !== 'LIMIT_NOTICE') return;
  if (state.modal?.type === 'limit-notice') return;
  const deadline = latestSubmissionOfKind(state.attempt, 'DEADLINE');
  const checkpoint = latestSubmissionOfKind(state.attempt, 'CHECKPOINT');
  const summary = deadline || checkpoint ? checkpointSummary(deadline || checkpoint) : 'The server has saved your time-limit checkpoint.';
  openModal({
    type: 'limit-notice',
    title: '75 minutes have elapsed',
    paragraphs: [
      summary,
      'Would you like to stop and make your final submission, or continue answering after the time limit?'
    ],
    dismissible: false,
    actions: [
      { label: 'Reset attempt', className: 'button button-secondary', handler: confirmReset },
      { label: 'Continue answering', className: 'button button-secondary', handler: continueAfterLimit },
      { label: 'Stop and submit final answers', className: 'button button-danger', handler: finalizeAttempt }
    ]
  });
}

async function continueAfterLimit() {
  try {
    const id = encodeURIComponent(String(state.attempt.id));
    const response = await api.post(
      `${API_BASE}/attempts/${id}/deadline-decision`,
      submissionRequestPayload({ decision: 'continue' })
    );
    mergeAttempt(response, { preferLocalAnswers: true });
    hideModal({ force: true });
    renderAttemptHeader();
    renderCurrentQuestion();
    showStatus('You can continue answering. Your final submission remains available when you are ready.');
  } catch (error) {
    await handleAttemptMutationError(error, 'Could not continue this attempt.');
  }
}

function openModal({ type = 'general', title, paragraphs = [], actions = [], dismissible = true }) {
  hideModal({ force: true, restoreFocus: false });
  state.lastFocused = document.activeElement;
  state.modal = { type, dismissible };
  elements.modalTitle.textContent = title;
  clearNode(elements.modalMessage);
  for (const paragraphText of paragraphs) {
    const paragraph = document.createElement('p');
    appendText(paragraph, paragraphText);
    elements.modalMessage.appendChild(paragraph);
  }
  clearNode(elements.modalActions);
  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = action.className || 'button button-secondary';
    button.textContent = action.label;
    button.addEventListener('click', async () => {
      if (action.close) {
        hideModal();
        return;
      }
      if (!action.handler) return;
      setButtonBusy(button, true, 'Working…');
      try {
        await action.handler();
      } finally {
        if (!elements.modalBackdrop.hidden) setButtonBusy(button, false);
      }
    });
    elements.modalActions.appendChild(button);
  }
  elements.modalClose.hidden = !dismissible;
  elements.modalBackdrop.hidden = false;
  window.setTimeout(() => (elements.modalActions.querySelector('button') || elements.modalClose).focus(), 0);
}

function hideModal({ force = false, restoreFocus = true } = {}) {
  if (!state.modal) return;
  if (!state.modal.dismissible && !force) return;
  elements.modalBackdrop.hidden = true;
  state.modal = null;
  if (restoreFocus && state.lastFocused?.focus) state.lastFocused.focus();
  state.lastFocused = null;
}

function modalFocusableElements() {
  return [...elements.modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function normalizedResult(payload) {
  const root = unwrapData(payload);
  return firstDefined(root.result, root.results, root, {});
}

function resultQuestionRows(result) {
  const candidates = [result?.questionResults, result?.questions, result?.answers, result?.items];
  return candidates.find(Array.isArray) || [];
}

function normalizeSolutionRows(payload) {
  const root = unwrapData(payload);
  const source = firstDefined(root.solutions, root.items, root.questions, root.form?.questions, []);
  if (!Array.isArray(source)) return [];
  return source.map((solution, index) => ({
    number: finiteNumber(firstDefined(solution?.questionNumber, solution?.number), index + 1),
    markdown: String(firstDefined(solution?.solutionMarkdown, solution?.markdown, solution?.solution, solution?.content, '')),
    title: String(firstDefined(solution?.title, `Question ${finiteNumber(firstDefined(solution?.questionNumber, solution?.number), index + 1)} solution`))
  })).sort((left, right) => left.number - right.number);
}

function renderResults(resultPayload, solutionsPayload) {
  const result = normalizedResult(resultPayload);
  const finalSubmission = firstDefined(result.finalSubmission, result.submission, null);
  const score = firstDefined(scoreFromSubmission(finalSubmission), result.score, result.totalScore, result.points, null);
  const total = firstDefined(maximumScoreFromSubmission(finalSubmission), result.maxScore, result.maximumScore, result.totalPossible, null);
  const correct = finiteNumber(firstDefined(finalSubmission?.score?.correctCount, result.correctCount, result.summary?.correctCount, result.counts?.correct));
  const incorrect = finiteNumber(firstDefined(finalSubmission?.score?.incorrectCount, result.incorrectCount, result.summary?.incorrectCount, result.counts?.incorrect));
  const blank = finiteNumber(firstDefined(finalSubmission?.score?.blankCount, result.blankCount, result.unansweredCount, result.summary?.blankCount, result.counts?.blank));
  elements.finalScore.textContent = total !== null && total !== undefined ? `${formatScore(score)} / ${formatScore(total)}` : formatScore(score);
  const detailParts = [];
  if (correct !== null) detailParts.push(`${correct} correct`);
  if (incorrect !== null) detailParts.push(`${incorrect} incorrect`);
  if (blank !== null) detailParts.push(`${blank} unanswered`);
  elements.scoreDetails.textContent = detailParts.join(' · ') || 'Final score recorded by the server.';
  elements.resultsSummary.textContent = `Submitted ${formatDateTime(firstDefined(finalSubmission?.createdAt, finalSubmission?.submittedAt, result.submittedAt, state.attempt?.finalizedAt))}.`;
  renderSubmissionHistory(firstDefined(result.submissions, submissionsFrom(state.attempt)) || []);
  renderResultQuestions(resultQuestionRows(finalSubmission || result));
  renderSolutions(normalizeSolutionRows(solutionsPayload));
}

function humanSubmissionKind(submission) {
  const kind = String(firstDefined(submission?.kind, submission?.type, 'SUBMISSION')).toUpperCase();
  return ({ CHECKPOINT: 'Score checkpoint', DEADLINE: '75-minute checkpoint', FINAL: 'Final submission' })[kind] || kind.toLowerCase();
}

function renderSubmissionHistory(submissions) {
  clearNode(elements.submissionHistory);
  if (!submissions.length) {
    const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'No submission history is available.';
    elements.submissionHistory.appendChild(empty); return;
  }
  const sorted = [...submissions].sort((left, right) => timestampMs(left) - timestampMs(right));
  for (const submission of sorted) {
    const row = document.createElement('article'); row.className = 'submission-row';
    const type = document.createElement('span'); type.className = 'submission-type'; type.textContent = humanSubmissionKind(submission);
    const score = document.createElement('strong'); score.textContent = `Score ${formatScore(scoreFromSubmission(submission))}`;
    const date = document.createElement('span'); date.textContent = formatDateTime(submission);
    const note = document.createElement('span'); note.className = 'submission-note';
    const elapsed = finiteNumber(firstDefined(submission.activeElapsedMs, submission.elapsedActiveMs, submission.elapsedMs));
    note.textContent = elapsed !== null ? `${formatDuration(elapsed)} active time` : '';
    row.append(type, score, date, note);
    elements.submissionHistory.appendChild(row);
  }
}

function renderResultQuestions(rows) {
  clearNode(elements.resultsQuestions);
  if (!rows.length) {
    const note = document.createElement('p'); note.className = 'muted'; note.textContent = 'Detailed answer review is unavailable for this result.';
    elements.resultsQuestions.appendChild(note); return;
  }
  const sorted = [...rows].sort((left, right) => finiteNumber(firstDefined(left.questionNumber, left.number), 0) - finiteNumber(firstDefined(right.questionNumber, right.number), 0));
  for (const row of sorted) {
    const number = finiteNumber(firstDefined(row.questionNumber, row.number), 0);
    const selected = firstDefined(row.selectedOption, row.answer, row.submittedOption, null);
    const correct = firstDefined(row.correctOption, row.correctAnswer, row.answerKey, null);
    const isCorrect = row.isCorrect === true || String(row.outcome || '').toUpperCase() === 'CORRECT';
    const card = document.createElement('article');
    card.className = `result-question ${isCorrect ? 'is-correct' : 'is-incorrect'}`;
    const title = document.createElement('p'); title.textContent = `Question ${number}`;
    const answer = document.createElement('p'); answer.className = 'result-answer'; answer.textContent = `Your answer: ${selected || 'Blank'}`;
    const expected = document.createElement('p'); expected.className = 'correct-answer'; expected.textContent = `Correct answer: ${correct || '—'}`;
    card.append(title, answer, expected);
    elements.resultsQuestions.appendChild(card);
  }
}

function renderSolutions(solutions) {
  clearNode(elements.solutionsList);
  if (!solutions.length) {
    const note = document.createElement('p'); note.className = 'muted'; note.textContent = 'Solutions are not available for this final submission.';
    elements.solutionsList.appendChild(note); return;
  }
  for (const solution of solutions) {
    const details = document.createElement('details'); details.className = 'solution-item';
    const summary = document.createElement('summary'); summary.textContent = solution.title;
    const body = document.createElement('div'); body.className = 'solution-body';
    renderMarkdown(body, solution.markdown);
    details.addEventListener('toggle', () => {
      if (details.open) typesetMath([body]);
    });
    details.append(summary, body);
    elements.solutionsList.appendChild(details);
  }
  typesetMath([elements.solutionsList]);
}

async function showResults() {
  if (!canAccessFinalReview(state.attempt)) {
    showError('Final results are not available until final submission.');
    return;
  }
  stopAttemptSync();
  showOnly(elements.resultsView);
  elements.finalScore.textContent = 'Loading…';
  elements.scoreDetails.textContent = 'Retrieving your final score and solutions.';
  clearNode(elements.submissionHistory); clearNode(elements.resultsQuestions); clearNode(elements.solutionsList);
  try {
    // The exported fetchFinalReview guards this request; do not bypass it.
    const review = await fetchFinalReview(api, state.attempt);
    state.resultPayload = review.results;
    state.solutionsPayload = review.solutions;
    renderResults(review.results, review.solutions);
    document.getElementById('main-content').focus();
  } catch (error) {
    elements.finalScore.textContent = 'Unavailable';
    elements.scoreDetails.textContent = 'Could not load final review. Use “My tests” and reopen this attempt to retry.';
    handleError(error, 'Could not load final results.');
  }
}

function confirmReset() {
  const active = isAttemptActive(state.attempt);
  openModal({
    title: 'Start a new attempt?',
    paragraphs: [
      active
        ? 'Your current answers are saved first. This attempt will then close and remain in your history.'
        : 'Your final submission and its answers remain in your history.',
      'A fresh attempt will start with an empty answer sheet and a new timer.'
    ],
    actions: [
      { label: 'Cancel', className: 'button button-secondary', close: true },
      { label: 'Start new attempt', className: 'button button-primary', handler: resetAttempt }
    ]
  });
}

function resetMayHaveCommitted(error) {
  return !(error instanceof ApiError)
    || error.code === 'NETWORK_ERROR'
    || error.code === 'INVALID_STATE'
    || error.status >= 500;
}

async function recoverUncertainReset(oldAttempt) {
  try {
    const historyResponse = await api.get(`${API_BASE}/attempts`);
    const attempts = extractAttemptHistory(historyResponse);
    state.attemptHistory = attempts;
    const replacement = resetReplacementFromHistory(attempts, oldAttempt);
    if (replacement?.id) {
      hideModal({ force: true });
      await resumeAttempt(replacement.id, replacement);
      showStatus('The reset completed. Your new attempt has been recovered.');
      return true;
    }
    const prior = attempts.find((attempt) => String(attempt?.id || '') === String(oldAttempt?.id || ''));
    if (normalizePhase(prior) === 'RESET') {
      await showDashboard();
      showStatus('The prior attempt was reset. Start a new attempt when you are ready.');
      return true;
    }
  } catch {
    // Preserve the original mutation error below; recovery is best effort.
  }
  return false;
}

async function resetAttempt() {
  const oldAttempt = state.attempt;
  try {
    await flushAnswerSaves();
    const path = `${API_BASE}/attempts/${encodeURIComponent(String(oldAttempt.id))}/reset`;
    // Reuse one key for the network retry. If the first request committed but
    // its response vanished, the second request returns the original atomic
    // RESET + replacement response rather than creating ambiguous state.
    const key = idempotencyKey();
    let response;
    try {
      response = await api.post(path, {}, { idempotency: key });
    } catch (firstError) {
      let error = firstError;
      if (firstError instanceof ApiError && firstError.code === 'NETWORK_ERROR') {
        try {
          response = await api.post(path, {}, { idempotency: key });
        } catch (retryError) {
          error = retryError;
        }
      }
      if (response === undefined) {
        if (resetMayHaveCommitted(error) && await recoverUncertainReset(oldAttempt)) return;
        throw error;
      }
    }
    hideModal({ force: true });
    const replacement = extractReplacementAttempt(response);
    if (replacement?.id) {
      await openAttempt({ attempt: replacement });
      showStatus('A new practice attempt is ready. Your prior submission remains saved.');
      return;
    }
    const returned = extractAttempt(response);
    if (returned?.id && isAttemptActive(returned)) {
      await openAttempt(response);
      showStatus('Your practice attempt has been reset.');
      return;
    }
    // A backend may persist RESET only and expect the normal start flow.
    await showDashboard();
    showStatus('The prior attempt was reset. Start a new attempt when you are ready.');
  } catch (error) {
    handleError(error, 'Could not reset this attempt.');
  }
}

async function showDashboard() {
  hideModal({ force: true });
  stopAttemptSync();
  showOnly(elements.dashboardView);
  await loadForms();
  document.getElementById('main-content').focus();
}

async function logout() {
  try {
    await api.post(`${API_BASE}/auth/logout`, {});
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) handleError(error, 'Could not sign out cleanly.');
  } finally {
    localSignOut();
  }
}

function expandAllSolutions() {
  const details = [...elements.solutionsList.querySelectorAll('details')];
  const shouldOpen = details.some((item) => !item.open);
  details.forEach((item) => { item.open = shouldOpen; });
  elements.expandSolutions.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
  if (shouldOpen) typesetMath([elements.solutionsList]);
}

function bindEvents() {
  elements.globalErrorDismiss.addEventListener('click', hideError);
  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearLoginError();
    const accessCode = elements.loginAccessCode.value.trim();
    if (!accessCode) {
      showLoginError('Enter your access code.');
      elements.loginAccessCode.focus();
      return;
    }
    setButtonBusy(elements.loginSubmit, true, 'Signing in…');
    try {
      const response = await api.post(`${API_BASE}/auth/login`, { accessCode });
      setStudent(response);
      elements.loginForm.reset();
      await showDashboard();
    } catch (error) {
      showLoginError(error instanceof ApiError ? error.message : 'Could not sign in.');
    } finally {
      setButtonBusy(elements.loginSubmit, false);
    }
  });
  elements.dashboardButton.addEventListener('click', showDashboard);
  elements.resultsDashboardButton.addEventListener('click', showDashboard);
  elements.logoutButton.addEventListener('click', logout);
  elements.refreshForms.addEventListener('click', () => loadForms());
  elements.pauseButton.addEventListener('click', pauseAttempt);
  elements.resumeButton.addEventListener('click', resumeTimer);
  elements.practiceResetButton.addEventListener('click', confirmReset);
  elements.checkpointButton.addEventListener('click', confirmCheckpoint);
  elements.finalButton.addEventListener('click', confirmFinalSubmission);
  elements.previousQuestion.addEventListener('click', () => goToQuestion(state.currentQuestionIndex - 1, { focus: true }));
  elements.nextQuestion.addEventListener('click', () => goToQuestion(state.currentQuestionIndex + 1, { focus: true }));
  elements.clearAnswerButton.addEventListener('click', () => {
    const question = state.questions[state.currentQuestionIndex];
    if (question) updateQuestionAnswer(question.number, null);
  });
  elements.answerForm.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'radio' || !input.checked) return;
    const question = state.questions[state.currentQuestionIndex];
    if (question) updateQuestionAnswer(question.number, input.value);
  });
  elements.resetButton.addEventListener('click', confirmReset);
  elements.expandSolutions.addEventListener('click', expandAllSolutions);
  elements.modalClose.addEventListener('click', () => hideModal());
  elements.modalBackdrop.addEventListener('click', (event) => { if (event.target === elements.modalBackdrop) hideModal(); });
  document.addEventListener('keydown', (event) => {
    if (state.modal && event.key === 'Tab') {
      const focusable = modalFocusableElements();
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key === 'Escape' && state.modal?.dismissible) hideModal();
    if (event.key === 'ArrowLeft' && !state.modal && !elements.practiceView.hidden && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); goToQuestion(state.currentQuestionIndex - 1, { focus: true });
    }
    if (event.key === 'ArrowRight' && !state.modal && !elements.practiceView.hidden && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); goToQuestion(state.currentQuestionIndex + 1, { focus: true });
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !elements.practiceView.hidden) refreshAttempt({ quiet: true });
  });
}

async function bootstrap() {
  elements = getElements();
  api = new ApiClient({ onCsrfToken: setCsrfToken, onUnauthorized: handleUnauthorized });
  bindEvents();
  // If MathJax completed before this module registered its ready listener,
  // queue a pass after bootstrap.  If it completes later, the ready listener
  // below re-typesets the already rendered current question/results instead.
  if (mathJaxReady || mathJaxTypesetter()) {
    mathJaxReady = true;
    window.setTimeout(typesetVisiblePracticeMath, 0);
  }
  try {
    const response = await api.get(`${API_BASE}/auth/me`);
    setStudent(response);
    if (!state.student) {
      localSignOut();
      return;
    }
    await showDashboard();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      localSignOut();
      return;
    }
    localSignOut({ message: 'The practice service is unavailable. Try again shortly.' });
  }
}

if (typeof document !== 'undefined') {
  window.addEventListener('mathjax-ready', () => {
    mathJaxReady = true;
    // A slow local font/module load may have made the initial render a no-op.
    // Re-typeset the visible containers so no first question is left as raw
    // TeX merely because MathJax became ready a moment later.
    typesetVisiblePracticeMath();
  });
  document.addEventListener('DOMContentLoaded', bootstrap);
}
