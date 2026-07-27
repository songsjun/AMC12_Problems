import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  CLOCK_STATES,
  PHASES,
  SUBMISSION_KINDS,
  assertMutableAnswerPhase,
  assertSelectedOption,
  elapsedAt,
  publicAttempt,
  publicForm,
  publicFormSummary,
  publicSubmission,
  scoreSubmission
} from './domain.js';
import { manifestToStoredForm } from './manifest.js';
import { badRequest, conflict, forbidden, notFound, unauthorized } from './errors.js';
import { newOpaqueToken } from './config.js';

const PRELIMINARY_SLOT = 'PRELIMINARY';
const FINAL_SLOT = 'FINAL';
const PRIVATE_MANIFEST_SCHEMA = 'amc-practice-private-form-v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function hmac(value, pepper) {
  return createHmac('sha256', pepper).update(value).digest('base64url');
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function requestHash(action, body) {
  return createHash('sha256').update(`${action}:${stableJson(body ?? {})}`).digest('hex');
}

function ensureString(value, name, { min = 1, max = 512 } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    throw badRequest('VALIDATION_ERROR', `${name} must be a string with ${min}-${max} characters.`);
  }
  return value;
}

function ensureAttemptId(value) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw badRequest('INVALID_ATTEMPT_ID', 'attemptId must be a UUID.');
  }
  return value;
}

function markAttemptChanged(attempt, now) {
  const previous = Number.isSafeInteger(attempt.stateRevision) && attempt.stateRevision >= 0
    ? attempt.stateRevision
    : 0;
  attempt.stateRevision = previous + 1;
  attempt.updatedAt = now;
}

function normalizeIdempotencyKey(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(value)) {
    throw badRequest('IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key must be an 8-128 character opaque token.');
  }
  return value;
}

function expectedSubmissionRevisions(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('VALIDATION_ERROR', 'Submission preconditions must be an object.');
  }
  const expectedAnswersRevision = input.expectedAnswersRevision;
  const expectedStateRevision = input.expectedStateRevision;
  if (!Number.isSafeInteger(expectedAnswersRevision) || expectedAnswersRevision < 0
      || !Number.isSafeInteger(expectedStateRevision) || expectedStateRevision < 0) {
    throw badRequest(
      'VALIDATION_ERROR',
      'expectedAnswersRevision and expectedStateRevision must be non-negative integers.'
    );
  }
  return { expectedAnswersRevision, expectedStateRevision };
}

function assertExpectedSubmissionRevisions(attempt, input) {
  const expected = expectedSubmissionRevisions(input);
  const currentAnswersRevision = Number.isSafeInteger(attempt.answersRevision) ? attempt.answersRevision : 0;
  const currentStateRevision = Number.isSafeInteger(attempt.stateRevision) ? attempt.stateRevision : 0;
  if (expected.expectedAnswersRevision !== currentAnswersRevision
      || expected.expectedStateRevision !== currentStateRevision) {
    throw conflict(
      'ANSWER_REVISION_CONFLICT',
      'Answers or attempt state changed in another session. Refresh before submitting.',
      { ...expected, currentAnswersRevision, currentStateRevision }
    );
  }
}

function assertOwned(attempt, studentId) {
  if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'The practice attempt was not found.');
  if (attempt.studentId !== studentId) throw notFound('ATTEMPT_NOT_FOUND', 'The practice attempt was not found.');
}

function userStudent(student) {
  return { id: student.id, displayName: student.displayName };
}

export class PracticeService {
  constructor({
    store,
    authPepper,
    sessionTtlMs,
    allowTestOnlyImport = false,
    allowTestOnlyPublish = false,
    allowGenericManifestImport = false,
    clock = () => new Date()
  }) {
    this.store = store;
    this.authPepper = authPepper;
    this.sessionTtlMs = sessionTtlMs;
    this.allowTestOnlyImport = allowTestOnlyImport;
    this.allowTestOnlyPublish = allowTestOnlyImport && allowTestOnlyPublish;
    this.allowGenericManifestImport = allowGenericManifestImport;
    this.clock = clock;
  }

  now() {
    return asDate(this.clock());
  }

  hashAccessCode(code) {
    return hmac(`access-code:${code}`, this.authPepper);
  }

  hashCsrfToken(token) {
    return hmac(`csrf:${token}`, this.authPepper);
  }

  hashSessionToken(token) {
    return hmac(`session:${token}`, this.authPepper);
  }

  async seedAccessCode({ code, displayName, studentId, expiresAt = null }) {
    ensureString(code, 'accessCode', { min: 4, max: 256 });
    ensureString(displayName, 'displayName', { min: 1, max: 200 });
    const student = await this.store.addStudent({ id: studentId, displayName, createdAt: this.now() });
    await this.store.putAccessCode({
      codeHash: this.hashAccessCode(code),
      studentId: student.id,
      expiresAt: expiresAt ? asDate(expiresAt) : null,
      createdAt: this.now()
    });
    return userStudent(student);
  }

  async login(accessCode) {
    ensureString(accessCode, 'accessCode', { min: 4, max: 256 });
    const now = this.now();
    const record = await this.store.getAccessCode(this.hashAccessCode(accessCode));
    if (!record || record.revokedAt || (record.expiresAt && asDate(record.expiresAt) <= now)) {
      throw unauthorized('INVALID_ACCESS_CODE', 'The access code is invalid or expired.');
    }
    const student = await this.store.getStudent(record.studentId);
    if (!student) throw unauthorized('INVALID_ACCESS_CODE', 'The access code is invalid or expired.');
    const csrfToken = newOpaqueToken();
    const sessionToken = newOpaqueToken();
    const session = {
      // Persist only a keyed hash; the opaque browser token is never stored
      // verbatim in PostgreSQL.
      id: this.hashSessionToken(sessionToken),
      studentId: student.id,
      csrfTokenHash: this.hashCsrfToken(csrfToken),
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.sessionTtlMs),
      revokedAt: null
    };
    await this.store.createSession(session);
    return { session, sessionToken, csrfToken, student: userStudent(student) };
  }

  async authenticateSession(sessionId) {
    if (typeof sessionId !== 'string' || sessionId.length < 16) throw unauthorized();
    const session = await this.store.getSession(this.hashSessionToken(sessionId));
    const now = this.now();
    if (!session || session.revokedAt || asDate(session.expiresAt) <= now) throw unauthorized();
    const student = await this.store.getStudent(session.studentId);
    if (!student) throw unauthorized();
    return { session, student: userStudent(student) };
  }

  assertCsrf(session, csrfToken) {
    if (typeof csrfToken !== 'string' || csrfToken.length < 16) {
      throw forbidden('CSRF_INVALID', 'A valid CSRF token is required.');
    }
    const actual = Buffer.from(this.hashCsrfToken(csrfToken));
    const expected = Buffer.from(session.csrfTokenHash);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw forbidden('CSRF_INVALID', 'A valid CSRF token is required.');
    }
  }

  async logout(sessionToken) {
    await this.store.revokeSession(this.hashSessionToken(sessionToken), this.now());
  }

  async importManifest(manifest, { publish = false } = {}) {
    const form = manifestToStoredForm(manifest);
    if (form.sourceSchemaVersion !== PRIVATE_MANIFEST_SCHEMA && !this.allowGenericManifestImport) {
      throw forbidden(
        'GENERIC_FORM_IMPORT_FORBIDDEN',
        'Only reviewed private v1 practice manifests may be imported in this environment.'
      );
    }
    if (form.testOnly && !this.allowTestOnlyImport) {
      throw forbidden('TEST_FORM_IMPORT_FORBIDDEN', 'Synthetic or test-only forms require an explicit development-only import setting.');
    }
    if (form.sourceSchemaVersion === PRIVATE_MANIFEST_SCHEMA
      && !form.testOnly && form.publicationStatus !== 'approved') {
      throw forbidden('FORM_IMPORT_NOT_APPROVED', 'Private practice content must be approved before it can be imported.');
    }
    if (form.testOnly && publish && !this.allowTestOnlyPublish) {
      throw forbidden('TEST_FORM_PUBLISH_FORBIDDEN', 'Synthetic or test-only forms cannot be published in this environment.');
    }
    if (publish && !form.publishEligible && !(form.developmentPublishEligible && this.allowTestOnlyPublish)) {
      throw forbidden('FORM_NOT_PUBLISHABLE', 'This manifest is not approved for publication.');
    }
    return this.store.importForm(form, { publish, allowTestOnlyPublish: this.allowTestOnlyPublish });
  }

  async listForms({ includeUnpublished = false } = {}) {
    const forms = await this.store.listForms({ includeUnpublished });
    return forms.map(publicFormSummary);
  }

  async getPublicForm(formId) {
    const form = await this.store.getForm(formId);
    if (!form || !form.published) throw notFound('FORM_NOT_FOUND', 'The requested practice form was not found.');
    return publicForm(form);
  }

  async getPublicFormVersion(formId, version) {
    ensureString(formId, 'formId', { min: 1, max: 160 });
    ensureString(version, 'version', { min: 1, max: 100 });
    const form = await this.store.getForm(formId, version);
    if (!form || !form.published) throw notFound('FORM_NOT_FOUND', 'The requested practice form was not found.');
    return publicForm(form);
  }

  async getAttemptPublicForm(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      // An attempt pins the exact revision even when a later revision is now
      // published or this old revision is no longer listed publicly.
      return publicForm(await this.#getAttemptForm(attempt));
    });
  }

  async listAttempts(studentId) {
    const records = await this.store.listAttemptsForStudent(studentId);
    const history = [];
    for (const record of records) {
      // Reading an active attempt reconciles a just-crossed deadline before it
      // is advertised to the student as resumable.
      const attempt = await this.getAttempt(studentId, record.id);
      const finalSubmission = attempt.submissions.find((submission) => submission.kind === SUBMISSION_KINDS.FINAL) || null;
      const latestSubmission = attempt.submissions.at(-1) || null;
      const form = await this.store.getForm(attempt.formId, attempt.formVersion);
      history.push({
        id: attempt.id,
        formId: attempt.formId,
        formVersion: attempt.formVersion,
        formTitle: form?.title || attempt.formId,
        phase: attempt.phase,
        clockState: attempt.clockState,
        durationMs: attempt.durationMs,
        activeElapsedMs: attempt.activeElapsedMs,
        remainingMs: attempt.remainingMs,
        createdAt: attempt.createdAt,
        finalizedAt: attempt.finalizedAt,
        resetAt: attempt.resetAt,
        resultsAvailable: attempt.phase === PHASES.FINALIZED || finalSubmission !== null,
        latestSubmission,
        finalSubmission
      });
    }
    return history;
  }

  async createAttempt(studentId, formId) {
    ensureString(formId, 'formId', { min: 1, max: 160 });
    const form = await this.store.getForm(formId);
    if (!form || !form.published) throw notFound('FORM_NOT_FOUND', 'The requested practice form was not found.');
    const result = await this.store.findOrCreateActiveAttempt({ studentId, form, now: this.now() });
    const answers = await this.#getAttemptAnswers(result.attempt.id, form);
    const submissions = await this.#getAttemptSubmissions(result.attempt.id);
    return {
      created: result.created,
      attempt: publicAttempt(result.attempt, answers, submissions, this.now())
    };
  }

  async getAttempt(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const form = await this.#getAttemptForm(attempt);
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, this.now());
      const answers = await tx.getAnswers();
      const submissions = await tx.listSubmissions();
      return publicAttempt(reconciled.attempt, answers, submissions, this.now());
    });
  }

  async putAnswers(studentId, attemptId, input) {
    ensureAttemptId(attemptId);
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw badRequest('VALIDATION_ERROR', 'Request body must be an object.');
    }
    if (!Array.isArray(input.answers) || input.answers.length === 0 || input.answers.length > 100) {
      throw badRequest('VALIDATION_ERROR', 'answers must contain 1-100 answer updates.');
    }
    if (input.revision !== undefined && (!Number.isSafeInteger(input.revision) || input.revision < 0)) {
      throw badRequest('VALIDATION_ERROR', 'revision must be a non-negative integer.');
    }
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const form = await this.#getAttemptForm(attempt);
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, this.now());
      assertMutableAnswerPhase(reconciled.attempt);
      if (input.revision !== undefined && input.revision !== reconciled.attempt.answersRevision) {
        throw conflict('ANSWER_REVISION_CONFLICT', 'The answers changed in another tab. Reload before saving.', {
          currentRevision: reconciled.attempt.answersRevision
        });
      }
      const validNumbers = new Set(form.questions.map((question) => question.number));
      const incomingNumbers = new Set();
      const byNumber = new Map((await tx.getAnswers()).map((answer) => [answer.questionNumber, answer.selectedOption]));
      for (const answer of input.answers) {
        if (!answer || !Number.isSafeInteger(answer.questionNumber) || !validNumbers.has(answer.questionNumber)) {
          throw badRequest('VALIDATION_ERROR', 'Each answer must name a question in this form.');
        }
        if (incomingNumbers.has(answer.questionNumber)) {
          throw badRequest('VALIDATION_ERROR', 'Each question may appear only once per answer request.');
        }
        incomingNumbers.add(answer.questionNumber);
        assertSelectedOption(answer.selectedOption);
        byNumber.set(answer.questionNumber, answer.selectedOption);
      }
      const answers = form.questions.map((question) => ({
        questionNumber: question.number,
        selectedOption: byNumber.get(question.number) ?? null
      }));
      reconciled.attempt.answersRevision += 1;
      markAttemptChanged(reconciled.attempt, this.now());
      await tx.saveAnswers(answers);
      await tx.saveAttempt(reconciled.attempt);
      await tx.addTimerEvent({ type: 'ANSWER_SAVE', occurredAt: this.now(), metadata: { revision: reconciled.attempt.answersRevision } });
      return publicAttempt(reconciled.attempt, answers, await tx.listSubmissions(), this.now());
    });
  }

  async pause(studentId, attemptId, idempotencyKey) {
    return this.#idempotentAttemptMutation(studentId, attemptId, 'pause', idempotencyKey, {}, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      if (reconciled.attempt.phase === PHASES.LIMIT_NOTICE) {
        throw conflict('LIMIT_NOTICE_REQUIRED', 'Choose whether to finalize or continue.');
      }
      if (![PHASES.TIMED, PHASES.OVERTIME].includes(reconciled.attempt.phase) || reconciled.attempt.clockState !== CLOCK_STATES.RUNNING) {
        throw conflict('INVALID_STATE', 'Only a running attempt can be paused.');
      }
      reconciled.attempt.activeElapsedMs = elapsedAt(reconciled.attempt, now);
      reconciled.attempt.clockStartedAt = null;
      reconciled.attempt.clockState = CLOCK_STATES.PAUSED;
      markAttemptChanged(reconciled.attempt, now);
      await tx.saveAttempt(reconciled.attempt);
      await tx.addTimerEvent({ type: 'PAUSE', occurredAt: now });
      return { attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now) };
    });
  }

  async resume(studentId, attemptId, idempotencyKey) {
    return this.#idempotentAttemptMutation(studentId, attemptId, 'resume', idempotencyKey, {}, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      if (reconciled.attempt.phase === PHASES.LIMIT_NOTICE) {
        throw conflict('LIMIT_NOTICE_REQUIRED', 'Choose whether to finalize or continue.');
      }
      if (![PHASES.TIMED, PHASES.OVERTIME].includes(reconciled.attempt.phase) || reconciled.attempt.clockState !== CLOCK_STATES.PAUSED) {
        throw conflict('INVALID_STATE', 'Only a paused attempt can be resumed.');
      }
      reconciled.attempt.clockState = CLOCK_STATES.RUNNING;
      reconciled.attempt.clockStartedAt = now;
      markAttemptChanged(reconciled.attempt, now);
      await tx.saveAttempt(reconciled.attempt);
      await tx.addTimerEvent({ type: 'RESUME', occurredAt: now });
      return { attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now) };
    });
  }

  async checkpoint(studentId, attemptId, idempotencyKey, input) {
    return this.#idempotentAttemptMutation(studentId, attemptId, 'checkpoint', idempotencyKey, input, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      if (reconciled.attempt.phase !== PHASES.TIMED) {
        throw conflict(
          reconciled.attempt.phase === PHASES.LIMIT_NOTICE ? 'LIMIT_NOTICE_REQUIRED' : 'INVALID_STATE',
          reconciled.attempt.phase === PHASES.LIMIT_NOTICE ? 'Choose whether to finalize or continue.' : 'A checkpoint is only available during timed practice.'
        );
      }
      assertExpectedSubmissionRevisions(reconciled.attempt, input);
      const existing = await tx.listSubmissions();
      if (existing.some((submission) => submission.slot === PRELIMINARY_SLOT)) {
        throw conflict('SUBMISSION_SLOT_USED', 'This attempt already has its one allowed preliminary submission.');
      }
      // A checkpoint changes the public submission summary even though the
      // timer phase stays TIMED. Advance the response-state revision so an
      // earlier poll cannot erase the newly visible score from the client.
      markAttemptChanged(reconciled.attempt, now);
      await tx.saveAttempt(reconciled.attempt);
      const submission = await this.#createSubmission(tx, reconciled.attempt, form, SUBMISSION_KINDS.CHECKPOINT, PRELIMINARY_SLOT, 'STUDENT_CHECKPOINT', now);
      await tx.addTimerEvent({ type: 'CHECKPOINT', occurredAt: now, metadata: { submissionId: submission.id } });
      return {
        attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
        submission: publicSubmission(submission)
      };
    });
  }

  async final(studentId, attemptId, idempotencyKey, input) {
    return this.#idempotentAttemptMutation(studentId, attemptId, 'final', idempotencyKey, input, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      if (reconciled.attempt.phase === PHASES.LIMIT_NOTICE) {
        throw conflict('LIMIT_NOTICE_REQUIRED', 'At the 75-minute mark, explicitly choose finalize or continue.');
      }
      if (![PHASES.TIMED, PHASES.OVERTIME].includes(reconciled.attempt.phase)) {
        throw conflict('INVALID_STATE', 'This attempt cannot be finalized.');
      }
      assertExpectedSubmissionRevisions(reconciled.attempt, input);
      const submission = await this.#finalize(tx, reconciled.attempt, form, now, 'STUDENT_FINAL');
      return {
        attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
        submission: publicSubmission(submission)
      };
    });
  }

  async deadlineDecision(studentId, attemptId, decision, idempotencyKey, input) {
    if (!['continue', 'finalize'].includes(decision)) {
      throw badRequest('VALIDATION_ERROR', 'decision must be either continue or finalize.');
    }
    const requestInput = { ...(input || {}), decision };
    return this.#idempotentAttemptMutation(studentId, attemptId, 'deadline-decision', idempotencyKey, requestInput, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      if (reconciled.attempt.phase !== PHASES.LIMIT_NOTICE) {
        throw conflict('INVALID_STATE', 'A deadline decision is only available after the timed limit.');
      }
      assertExpectedSubmissionRevisions(reconciled.attempt, requestInput);
      if (decision === 'finalize') {
        const submission = await this.#finalize(tx, reconciled.attempt, form, now, 'DEADLINE_FINAL');
        return {
          attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
          submission: publicSubmission(submission)
        };
      }
      reconciled.attempt.phase = PHASES.OVERTIME;
      reconciled.attempt.clockState = CLOCK_STATES.RUNNING;
      reconciled.attempt.clockStartedAt = now;
      markAttemptChanged(reconciled.attempt, now);
      await tx.saveAttempt(reconciled.attempt);
      await tx.addTimerEvent({ type: 'CONTINUE_AFTER_LIMIT', occurredAt: now });
      return { attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now) };
    });
  }

  async reset(studentId, attemptId, idempotencyKey) {
    return this.#idempotentAttemptMutation(studentId, attemptId, 'reset', idempotencyKey, {}, async (tx, attempt, form, now) => {
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
      attempt = reconciled.attempt;
      if (attempt.phase === PHASES.RESET) {
        throw conflict('INVALID_STATE', 'This attempt has already been reset.');
      }
      // A reset intentionally preserves every old answer, event, and submission.
      attempt.activeElapsedMs = elapsedAt(attempt, now);
      attempt.clockState = CLOCK_STATES.PAUSED;
      attempt.clockStartedAt = null;
      attempt.phase = PHASES.RESET;
      attempt.resetAt = now;
      markAttemptChanged(attempt, now);
      await tx.saveAttempt(attempt);
      const next = await tx.createResetAttempt({ studentId, form, now });
      await tx.addTimerEvent({ type: 'RESET', occurredAt: now, metadata: { replacementAttemptId: next.id } });
      // createResetAttempt initializes every question to null inside the same
      // transaction/lock; do not recurse into another attempt lock here.
      const nextAnswers = form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null }));
      return {
        previousAttempt: publicAttempt(attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
        attempt: publicAttempt(next, nextAnswers, [], now)
      };
    });
  }

  async getResults(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const form = await this.#getAttemptForm(attempt);
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, this.now());
      const submissions = await tx.listSubmissions();
      const hasFinal = submissions.some((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      if (reconciled.attempt.phase !== PHASES.FINALIZED && !(reconciled.attempt.phase === PHASES.RESET && hasFinal)) {
        throw conflict('RESULTS_NOT_AVAILABLE', 'Results are available after final submission.');
      }
      const detailed = [];
      for (const submission of submissions) {
        detailed.push({
          ...publicSubmission(submission),
          answers: (await tx.getSubmissionAnswers(submission.id)).sort((a, b) => a.questionNumber - b.questionNumber)
        });
      }
      const finalSubmission = detailed.find((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      return {
        attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), submissions, this.now()),
        finalSubmission,
        submissions: detailed
      };
    });
  }

  async getSolutions(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const form = await this.#getAttemptForm(attempt);
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, this.now());
      const submissions = await tx.listSubmissions();
      const hasFinal = submissions.some((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      if (reconciled.attempt.phase !== PHASES.FINALIZED && !(reconciled.attempt.phase === PHASES.RESET && hasFinal)) {
        throw conflict('SOLUTIONS_NOT_AVAILABLE', 'Solutions are available after final submission.');
      }
      return {
        form: {
          id: form.id,
          version: form.version,
          title: form.title,
          questions: form.questions.map((question) => ({
            number: question.number,
            promptMarkdown: question.promptMarkdown,
            choices: question.choices,
            correctOption: question.correctOption,
            solutionMarkdown: question.solutionMarkdown
          }))
        }
      };
    });
  }

  async processDueAttempt(attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      if (!attempt || attempt.phase !== PHASES.TIMED) return { processed: false };
      const form = await this.#getAttemptForm(attempt);
      const result = await this.#reconcileDeadline(tx, attempt, form, this.now());
      return { processed: result.triggered };
    });
  }

  async sweepDeadlines() {
    const candidates = await this.store.listDeadlineCandidates(this.now());
    const results = await Promise.allSettled(candidates.map((id) => this.processDueAttempt(id)));
    return {
      candidates: candidates.length,
      processed: results.filter((result) => result.status === 'fulfilled' && result.value.processed).length,
      failures: results.filter((result) => result.status === 'rejected').length
    };
  }

  async #getAttemptForm(attempt) {
    const form = await this.store.getForm(attempt.formId, attempt.formVersion);
    if (!form) throw new Error(`Attempt ${attempt.id} references a missing form revision.`);
    return form;
  }

  async #getAttemptAnswers(attemptId, form) {
    // New attempts are expected to contain a complete null-filled answer set.
    // This fallback keeps older imports readable without changing scoring.
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const answers = await tx?.getAnswers();
      if (answers?.length) return answers;
      return form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null }));
    });
  }

  async #getAttemptSubmissions(attemptId) {
    return this.store.withAttemptLock(attemptId, async (tx) => tx ? tx.listSubmissions() : []);
  }

  async #reconcileDeadline(tx, attempt, form, now) {
    if (attempt.phase !== PHASES.TIMED || attempt.clockState !== CLOCK_STATES.RUNNING) {
      return { attempt, triggered: false };
    }
    const elapsed = elapsedAt(attempt, now);
    if (elapsed < attempt.durationMs) return { attempt, triggered: false };
    attempt.activeElapsedMs = attempt.durationMs;
    attempt.clockState = CLOCK_STATES.PAUSED;
    attempt.clockStartedAt = null;
    attempt.phase = PHASES.LIMIT_NOTICE;
    attempt.limitReachedAt = now;
    markAttemptChanged(attempt, now);
    await tx.saveAttempt(attempt);
    const submissions = await tx.listSubmissions();
    if (!submissions.some((submission) => submission.slot === PRELIMINARY_SLOT)) {
      const submission = await this.#createSubmission(tx, attempt, form, SUBMISSION_KINDS.DEADLINE, PRELIMINARY_SLOT, 'SYSTEM_DEADLINE', now);
      await tx.addTimerEvent({ type: 'DEADLINE_SNAPSHOT', occurredAt: now, metadata: { submissionId: submission.id } });
    } else {
      await tx.addTimerEvent({ type: 'DEADLINE_NOTICE', occurredAt: now });
    }
    return { attempt, triggered: true };
  }

  async #createSubmission(tx, attempt, form, kind, slot, trigger, now) {
    const answers = await tx.getAnswers();
    const score = scoreSubmission({ form, answers, activeElapsedMs: elapsedAt(attempt, now) });
    const submission = {
      id: randomUUID(),
      attemptId: attempt.id,
      kind,
      slot,
      trigger,
      activeElapsedMs: score.activeElapsedMs,
      scoringPolicy: score.scoringPolicy,
      totalPoints: score.totalPoints,
      maximumPoints: score.maximumPoints,
      answeredCount: score.answeredCount,
      correctCount: score.correctCount,
      incorrectCount: score.incorrectCount,
      blankCount: score.blankCount,
      createdAt: now
    };
    return tx.createSubmission(submission, score.snapshots);
  }

  async #finalize(tx, attempt, form, now, trigger) {
    const existing = await tx.listSubmissions();
    if (existing.some((submission) => submission.slot === FINAL_SLOT)) {
      throw conflict('INVALID_STATE', 'This attempt has already been finalized.');
    }
    if (attempt.clockState === CLOCK_STATES.RUNNING) {
      attempt.activeElapsedMs = elapsedAt(attempt, now);
    }
    attempt.clockState = CLOCK_STATES.PAUSED;
    attempt.clockStartedAt = null;
    attempt.phase = PHASES.FINALIZED;
    attempt.finalizedAt = now;
    markAttemptChanged(attempt, now);
    await tx.saveAttempt(attempt);
    const submission = await this.#createSubmission(tx, attempt, form, SUBMISSION_KINDS.FINAL, FINAL_SLOT, trigger, now);
    await tx.addTimerEvent({ type: 'FINAL', occurredAt: now, metadata: { submissionId: submission.id, trigger } });
    return submission;
  }

  async #idempotentAttemptMutation(studentId, attemptId, action, idempotencyKey, body, work) {
    ensureAttemptId(attemptId);
    const key = normalizeIdempotencyKey(idempotencyKey);
    const scope = `attempt:${attemptId}:${action}`;
    const hash = requestHash(action, body);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const existing = await tx.getIdempotency(studentId, scope, key);
      if (existing) {
        if (existing.requestHash !== hash) {
          throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different request.');
        }
        return existing.responseBody;
      }
      const form = await this.#getAttemptForm(attempt);
      const responseBody = await work(tx, attempt, form, this.now());
      const record = {
        studentId,
        scope,
        key,
        requestHash: hash,
        responseStatus: 200,
        responseBody,
        createdAt: this.now()
      };
      const stored = await tx.putIdempotency(record);
      if (stored.requestHash !== hash) {
        throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different request.');
      }
      return stored.responseBody;
    });
  }
}
