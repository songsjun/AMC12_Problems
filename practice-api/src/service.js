import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  CLOCK_STATES,
  PHASES,
  SUBMISSION_KINDS,
  assertMutableAnswerPhase,
  assertSelectedOption,
  canEditAnswers,
  elapsedAt,
  publicAttempt,
  publicForm,
  publicFormSummary,
  publicSubmission,
  scoreSubmission
} from './domain.js';
import {
  ARCHIVE_MANIFEST_SCHEMA,
  ARCHIVE_RELEASE_FORM_IDS,
  manifestToStoredForm,
  PRIVATE_MANIFEST_SCHEMA,
  validateArchiveReleaseBatch
} from './manifest.js';
import { badRequest, conflict, forbidden, notFound, tooManyRequests, unauthorized } from './errors.js';
import { newOpaqueToken } from './config.js';
import { analysisInputHash } from './learning-review/canonical.js';
import { publicLearningReport } from './learning-review/report.js';
import { BatchPracticeService } from './batch-ingest/service.js';

const PRELIMINARY_SLOT = 'PRELIMINARY';
const FINAL_SLOT = 'FINAL';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ARCHIVE_RELEASE_FORM_ID_SET = new Set(ARCHIVE_RELEASE_FORM_IDS);
const MAX_REASONING_NOTE_BYTES = 8_000;
const MAX_REASONING_REQUEST_BYTES = 48_000;

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

function assertOnlyKeys(value, allowed, name) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw badRequest('VALIDATION_ERROR', `${name} contains unsupported fields: ${unknown.join(', ')}.`);
  }
}

function normalizeReasoningUpdate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('VALIDATION_ERROR', 'Request body must be an object.');
  }
  assertOnlyKeys(input, new Set(['revision', 'notes']), 'Request body');
  if (!Number.isSafeInteger(input.revision) || input.revision < 0) {
    throw badRequest('VALIDATION_ERROR', 'revision must be a non-negative integer.');
  }
  if (!Array.isArray(input.notes) || input.notes.length === 0 || input.notes.length > 100) {
    throw badRequest('VALIDATION_ERROR', 'notes must contain 1-100 partial reasoning updates.');
  }
  const seen = new Set();
  let totalBytes = 0;
  const notes = input.notes.map((note) => {
    if (!note || typeof note !== 'object' || Array.isArray(note)) {
      throw badRequest('VALIDATION_ERROR', 'Each reasoning note must be an object.');
    }
    assertOnlyKeys(note, new Set(['questionNumber', 'reasoningText']), 'Reasoning note');
    if (!Number.isSafeInteger(note.questionNumber)) {
      throw badRequest('VALIDATION_ERROR', 'Each reasoning note must name an integer questionNumber.');
    }
    if (seen.has(note.questionNumber)) {
      throw badRequest('VALIDATION_ERROR', 'Each question may appear only once per reasoning request.');
    }
    seen.add(note.questionNumber);
    if (note.reasoningText !== null && typeof note.reasoningText !== 'string') {
      throw badRequest('VALIDATION_ERROR', 'reasoningText must be a string or null.');
    }
    if (typeof note.reasoningText === 'string' && note.reasoningText.includes('\u0000')) {
      throw badRequest('VALIDATION_ERROR', 'reasoningText cannot contain NUL characters.');
    }
    const reasoningText = note.reasoningText === null || note.reasoningText.trim() === '' ? '' : note.reasoningText;
    const byteLength = Buffer.byteLength(reasoningText, 'utf8');
    if (byteLength > MAX_REASONING_NOTE_BYTES) {
      throw badRequest('VALIDATION_ERROR', `Each reasoningText is limited to ${MAX_REASONING_NOTE_BYTES} UTF-8 bytes.`);
    }
    totalBytes += byteLength;
    return { questionNumber: note.questionNumber, reasoningText };
  });
  if (totalBytes > MAX_REASONING_REQUEST_BYTES) {
    throw badRequest('VALIDATION_ERROR', `A reasoning update is limited to ${MAX_REASONING_REQUEST_BYTES} UTF-8 bytes.`);
  }
  return { revision: input.revision, notes };
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
    privateUploadStore = null,
    batchStudentQuotaBytes,
    batchGlobalQuotaBytes,
    batchActiveLimit,
    batchRequestLimitPerMinute = 120,
    batchUploadByteBudget,
    batchProviderWorkBudget,
    batchProviderAudioByteBudget,
    batchGlobalProviderWorkBudget,
    batchGlobalProviderAudioByteBudget,
    clock = () => new Date()
  }) {
    this.store = store;
    this.authPepper = authPepper;
    this.sessionTtlMs = sessionTtlMs;
    this.allowTestOnlyImport = allowTestOnlyImport;
    this.allowTestOnlyPublish = allowTestOnlyImport && allowTestOnlyPublish;
    this.allowGenericManifestImport = allowGenericManifestImport;
    this.clock = clock;
    this.batchRequestLimitPerMinute = batchRequestLimitPerMinute;
    this.batchPractice = new BatchPracticeService({
      store,
      privateUploadStore,
      clock,
      ...(batchStudentQuotaBytes === undefined ? {} : { studentQuotaBytes: batchStudentQuotaBytes }),
      ...(batchGlobalQuotaBytes === undefined ? {} : { globalQuotaBytes: batchGlobalQuotaBytes }),
      ...(batchActiveLimit === undefined ? {} : { activeBatchLimit: batchActiveLimit }),
      ...(batchUploadByteBudget === undefined ? {} : { uploadByteBudget: batchUploadByteBudget }),
      ...(batchProviderWorkBudget === undefined ? {} : { providerWorkBudget: batchProviderWorkBudget }),
      ...(batchProviderAudioByteBudget === undefined ? {} : { providerAudioByteBudget: batchProviderAudioByteBudget }),
      ...(batchGlobalProviderWorkBudget === undefined
        ? {} : { globalProviderWorkBudget: batchGlobalProviderWorkBudget }),
      ...(batchGlobalProviderAudioByteBudget === undefined
        ? {} : { globalProviderAudioByteBudget: batchGlobalProviderAudioByteBudget })
    });
  }

  async consumeStudentRequestBudget(studentId) {
    const result = await this.store.consumeStudentResourceBudget({
      studentId,
      budgetKind: 'AUTHENTICATED_REQUEST',
      units: 1,
      limit: this.batchRequestLimitPerMinute,
      windowMs: 60_000,
      now: this.now()
    });
    if (!result.allowed) {
      throw tooManyRequests('STUDENT_REQUEST_RATE_LIMITED',
        'Too many authenticated requests. Please try again later.', result.retryAfterSeconds);
    }
    return result;
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
    const [form] = await this.importManifests([manifest], { publish });
    return form;
  }

  /**
   * Standard (private-v1 or explicitly allowed development generic) imports.
   * Historical archive forms are deliberately excluded: they are a complete,
   * release-authorized collection and must use importArchiveRelease below.
   */
  async importManifests(manifests, { publish = false } = {}) {
    if (!Array.isArray(manifests) || manifests.length === 0 || manifests.length > 100) {
      throw badRequest('INVALID_MANIFEST_BATCH', 'A manifest batch must contain 1-100 forms.');
    }
    const forms = manifests.map((manifest) => manifestToStoredForm(manifest));
    if (forms.some((form) => form.sourceSchemaVersion === ARCHIVE_MANIFEST_SCHEMA
      || ARCHIVE_RELEASE_FORM_ID_SET.has(form.id))) {
      throw forbidden(
        'ARCHIVE_RELEASE_REQUIRED',
        'Historical AMC 12 archive forms must be imported through the complete archive release workflow.'
      );
    }
    const seenRevisions = new Set();
    for (const form of forms) {
      const revision = `${form.id}\u0000${form.version}`;
      if (seenRevisions.has(revision)) {
        throw badRequest('DUPLICATE_FORM_REVISION', 'A manifest batch cannot contain the same form revision twice.');
      }
      seenRevisions.add(revision);
      this.#assertImportableForm(form, { publish });
    }
    return this.store.importForms(forms, { publish, allowTestOnlyPublish: this.allowTestOnlyPublish });
  }

  /**
   * The only service-level path for archive-v1. The batch validator verifies
   * all 48 reserved IDs, one common release version, and shared key/media
   * provenance before any storage call; the store then imports the complete
   * collection in one transaction.
   */
  async importArchiveRelease(payload, { publish = false } = {}) {
    if (typeof publish !== 'boolean') {
      throw badRequest('VALIDATION_ERROR', 'publish must be boolean.');
    }
    const manifests = validateArchiveReleaseBatch(payload);
    const forms = manifests.map((manifest) => manifestToStoredForm(manifest));
    for (const form of forms) this.#assertArchiveReleaseForm(form, { publish });
    return this.store.importForms(forms, { publish, allowTestOnlyPublish: false });
  }

  #assertImportableForm(form, { publish }) {
    const reviewedSchema = form.sourceSchemaVersion === PRIVATE_MANIFEST_SCHEMA;
    const archiveSchema = form.sourceSchemaVersion === ARCHIVE_MANIFEST_SCHEMA;
    if (archiveSchema || ARCHIVE_RELEASE_FORM_ID_SET.has(form.id)) {
      throw forbidden(
        'ARCHIVE_RELEASE_REQUIRED',
        'Historical AMC 12 archive forms must be imported through the complete archive release workflow.'
      );
    }
    if (!reviewedSchema && !this.allowGenericManifestImport) {
      throw forbidden(
        'GENERIC_FORM_IMPORT_FORBIDDEN',
        'Only reviewed private v1 manifests may be imported in this environment.'
      );
    }
    if (form.testOnly && !this.allowTestOnlyImport) {
      throw forbidden('TEST_FORM_IMPORT_FORBIDDEN', 'Synthetic or test-only forms require an explicit development-only import setting.');
    }
    if (reviewedSchema
      && !form.testOnly && form.publicationStatus !== 'approved') {
      throw forbidden('FORM_IMPORT_NOT_APPROVED', 'Private practice content must be approved before it can be imported.');
    }
    if (form.testOnly && publish && !this.allowTestOnlyPublish) {
      throw forbidden('TEST_FORM_PUBLISH_FORBIDDEN', 'Synthetic or test-only forms cannot be published in this environment.');
    }
    if (publish && !form.publishEligible && !(form.developmentPublishEligible && this.allowTestOnlyPublish)) {
      throw forbidden('FORM_NOT_PUBLISHABLE', 'This manifest is not approved for publication.');
    }
  }

  #assertArchiveReleaseForm(form, { publish }) {
    if (form.sourceSchemaVersion !== ARCHIVE_MANIFEST_SCHEMA
      || form.practiceKind !== 'archive'
      || !ARCHIVE_RELEASE_FORM_ID_SET.has(form.id)
      || form.testOnly
      || form.publicationStatus !== 'archive-practice'
      || !form.publishEligible
      || form.developmentPublishEligible) {
      throw forbidden('ARCHIVE_FORM_INVALID', 'Archive practice content must use its validated archive-practice release contract.');
    }
    if (publish && !form.publishEligible) {
      throw forbidden('FORM_NOT_PUBLISHABLE', 'This archive release is not eligible for publication.');
    }
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
    // ``findOrCreateActiveAttempt`` deliberately serializes creation only.
    // Once it returns an existing row, take its attempt lock before replying:
    // the deadline worker may have been unavailable while the student was
    // away, so reopening the form itself must reconcile the 75-minute state
    // and create the one required deadline snapshot.
    return this.store.withAttemptLock(result.attempt.id, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const pinnedForm = await this.#getAttemptForm(attempt);
      const now = this.now();
      const reconciled = await this.#reconcileDeadline(tx, attempt, pinnedForm, now);
      return {
        created: result.created,
        attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now)
      };
    });
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

  async getReasoning(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const form = await this.#getAttemptForm(attempt);
      const reconciled = await this.#reconcileDeadline(tx, attempt, form, this.now());
      return this.#reasoningEnvelope(tx, reconciled.attempt);
    });
  }

  async putReasoning(studentId, attemptId, idempotencyKey, input) {
    const normalized = normalizeReasoningUpdate(input);
    return this.#idempotentAttemptMutation(
      studentId,
      attemptId,
      'put-reasoning',
      idempotencyKey,
      normalized,
      async (tx, attempt, form, now) => {
        const reconciled = await this.#reconcileDeadline(tx, attempt, form, now);
        assertMutableAnswerPhase(reconciled.attempt);
        const currentRevision = reconciled.attempt.reasoningRevision || 0;
        if (normalized.revision !== currentRevision) {
          throw conflict('REASONING_REVISION_CONFLICT', 'Reasoning changed in another tab. Reload before saving.', {
            currentRevision
          });
        }
        const validNumbers = new Set(form.questions.map((question) => question.number));
        if (normalized.notes.some((note) => !validNumbers.has(note.questionNumber))) {
          throw badRequest('VALIDATION_ERROR', 'Each reasoning note must name a question in this form.');
        }
        await tx.saveReasoningNotes(normalized.notes, now);
        reconciled.attempt.reasoningRevision = currentRevision + 1;
        markAttemptChanged(reconciled.attempt, now);
        await tx.saveAttempt(reconciled.attempt);
        await tx.addTimerEvent({
          type: 'REASONING_SAVE',
          occurredAt: now,
          metadata: {
            revision: reconciled.attempt.reasoningRevision,
            questionNumbers: normalized.notes.map((note) => note.questionNumber)
          }
        });
        return this.#reasoningEnvelope(tx, reconciled.attempt);
      },
      {
        // Idempotency records are long-lived control metadata. Student prose
        // remains only in the reasoning table and is reconstructed under the
        // owner-scoped attempt lock on replay.
        responseForStorage: (response) => ({
          attemptId: response.attemptId,
          reasoningRevision: response.reasoningRevision,
          stateRevision: response.stateRevision,
          editable: response.editable,
          responseKind: 'CURRENT_REASONING_ENVELOPE'
        }),
        replay: (tx, currentAttempt) => this.#reasoningEnvelope(tx, currentAttempt)
      }
    );
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
      const finalized = await this.#finalize(tx, reconciled.attempt, form, now, 'STUDENT_FINAL');
      return {
        attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
        submission: publicSubmission(finalized.submission),
        learningSubmission: this.#publicLearningSubmission(finalized.learning)
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
        const finalized = await this.#finalize(tx, reconciled.attempt, form, now, 'DEADLINE_FINAL');
        return {
          attempt: publicAttempt(reconciled.attempt, await tx.getAnswers(), await tx.listSubmissions(), now),
          submission: publicSubmission(finalized.submission),
          learningSubmission: this.#publicLearningSubmission(finalized.learning)
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

  async getLearningSubmission(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const submissions = await tx.listSubmissions();
      const finalSubmission = submissions.find((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      if (!finalSubmission || ![PHASES.FINALIZED, PHASES.RESET].includes(attempt.phase)) {
        throw conflict('LEARNING_SUBMISSION_NOT_AVAILABLE', 'Learning analysis is available after final submission.');
      }
      const learning = await tx.getLearningSubmissionBundle();
      if (!learning) {
        throw conflict(
          'LEARNING_SUBMISSION_REPAIR_PENDING',
          'This historical final is awaiting learning-submission reconciliation.'
        );
      }
      return this.#publicLearningSubmission(learning);
    });
  }

  async getLearningReport(studentId, attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      assertOwned(attempt, studentId);
      const submissions = await tx.listSubmissions();
      const hasFinal = submissions.some((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      if (!hasFinal || ![PHASES.FINALIZED, PHASES.RESET].includes(attempt.phase)) {
        throw conflict('LEARNING_REPORT_NOT_AVAILABLE', 'Learning report is available after final submission.');
      }
      const bundle = await tx.getLearningReportBundle();
      if (!bundle) {
        throw conflict('LEARNING_SUBMISSION_REPAIR_PENDING', 'This final is awaiting learning-submission reconciliation.');
      }
      return publicLearningReport({
        ...bundle,
        workItem: bundle.workItems.find((item) => item.workType === 'ANALYZE_SUBMISSION') || null
      });
    });
  }

  /** Maintenance/worker entrypoint. It is deliberately not exposed as HTTP. */
  async reconcileFinalLearningSubmission(attemptId) {
    ensureAttemptId(attemptId);
    return this.store.withAttemptLock(attemptId, async (tx) => {
      const attempt = await tx?.getAttempt();
      if (!attempt) return { processed: false, created: false, reason: 'ATTEMPT_NOT_FOUND' };
      const submissions = await tx.listSubmissions();
      const finalSubmission = submissions.find((submission) => submission.kind === SUBMISSION_KINDS.FINAL);
      if (!finalSubmission || ![PHASES.FINALIZED, PHASES.RESET].includes(attempt.phase)) {
        return { processed: false, created: false, reason: 'FINAL_NOT_AVAILABLE' };
      }
      const existing = await tx.getLearningSubmissionBundle();
      if (existing) {
        return { processed: true, created: false, learningSubmission: this.#publicLearningSubmission(existing) };
      }
      const form = await this.#getAttemptForm(attempt);
      const learning = await this.#createLearningSubmission(
        tx, attempt, form, finalSubmission, this.now(), 'BACKFILL'
      );
      await tx.addTimerEvent({
        type: 'LEARNING_SUBMISSION_BACKFILL',
        occurredAt: this.now(),
        metadata: { learningSubmissionId: learning.submission.id, version: learning.version.versionNumber }
      });
      return { processed: true, created: true, learningSubmission: this.#publicLearningSubmission(learning) };
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
            acceptedOptions: question.acceptedOptions || (question.correctOption ? [question.correctOption] : []),
            isScored: question.isScored !== false,
            solutionMarkdown: question.solutionMarkdown
          }))
        }
      };
    });
  }

  async createLearningBatch(studentId, attemptId, idempotencyKey, input) {
    return this.batchPractice.create(studentId, attemptId, idempotencyKey, input);
  }

  async listLearningBatches(studentId, attemptId) {
    return this.batchPractice.list(studentId, attemptId);
  }

  async getLearningBatch(studentId, attemptId, batchId) {
    return this.batchPractice.get(studentId, attemptId, batchId);
  }

  async uploadLearningBatchAsset(studentId, attemptId, batchId, assetId, idempotencyKey, stream, contentLength) {
    return this.batchPractice.upload(
      studentId, attemptId, batchId, assetId, idempotencyKey, stream, contentLength
    );
  }

  async submitLearningBatch(studentId, attemptId, batchId, idempotencyKey) {
    return this.batchPractice.submit(studentId, attemptId, batchId, idempotencyKey);
  }

  /** Worker/test seam. Provider adapters submit only frozen Gateway output through this method. */
  async prepareLearningBatchDecomposition(studentId, attemptId, batchId) {
    return this.batchPractice.prepareDecomposition(studentId, attemptId, batchId);
  }

  /** Worker/test seam; intentionally not exposed as an HTTP endpoint. */
  async recordLearningBatchDecomposition(studentId, attemptId, batchId, input) {
    return this.batchPractice.recordDecomposition(studentId, attemptId, batchId, input);
  }

  async confirmLearningBatch(studentId, attemptId, batchId, idempotencyKey, input) {
    return this.batchPractice.confirm(studentId, attemptId, batchId, idempotencyKey, input);
  }

  async deleteLearningBatch(studentId, attemptId, batchId, idempotencyKey) {
    return this.batchPractice.delete(studentId, attemptId, batchId, idempotencyKey);
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
      unscoredCount: score.unscoredCount,
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
    const learning = await this.#createLearningSubmission(tx, attempt, form, submission, now, 'FINAL_COMMIT');
    await tx.addTimerEvent({
      type: 'FINAL',
      occurredAt: now,
      metadata: {
        submissionId: submission.id,
        learningSubmissionId: learning.submission.id,
        trigger
      }
    });
    return { submission, learning };
  }

  async #createLearningSubmission(tx, attempt, form, officialSubmission, now, creationReason) {
    const existing = await tx.getLearningSubmissionBundle();
    if (existing) return existing;
    const officialAnswers = await tx.getSubmissionAnswers(officialSubmission.id);
    const officialByNumber = new Map(officialAnswers.map((answer) => [answer.questionNumber, answer.selectedOption]));
    const reasoningByNumber = new Map((await tx.getReasoningNotes())
      .map((note) => [note.questionNumber, note.reasoningText]));
    const evidence = form.questions.map((question) => ({
      questionNumber: question.number,
      selectedOption: officialByNumber.get(question.number) ?? null,
      reasoningText: reasoningByNumber.get(question.number) || '',
      reasoningOrigin: reasoningByNumber.has(question.number) ? 'DURING_ATTEMPT' : 'NONE'
    }));
    if (officialAnswers.length !== form.questions.length) {
      throw new Error(`Final submission ${officialSubmission.id} does not snapshot every form question.`);
    }
    const evidenceHash = createHash('sha256').update(stableJson({
      sourceKind: 'INTERACTIVE_FINAL',
      formId: form.id,
      formVersion: form.version,
      officialSubmissionId: officialSubmission.id,
      answersRevision: attempt.answersRevision,
      reasoningRevision: attempt.reasoningRevision || 0,
      responses: evidence
    })).digest('hex');
    const submission = {
      id: randomUUID(),
      studentId: attempt.studentId,
      attemptId: attempt.id,
      officialSubmissionId: officialSubmission.id,
      officialSubmissionKind: 'FINAL',
      formId: form.id,
      formVersion: form.version,
      sourceType: 'INTERACTIVE_FINAL',
      lifecycleStatus: 'COMMITTED',
      currentVersion: 1,
      createdAt: now,
      updatedAt: now
    };
    const approvedContext = await tx.getApprovedContextSetForForm(form.id, form.version);
    const contextReady = Boolean(approvedContext?.questions?.length);
    const workInputHash = contextReady
      ? analysisInputHash(evidenceHash, approvedContext.artifactSetHash)
      : evidenceHash;
    const version = {
      id: randomUUID(),
      learningSubmissionId: submission.id,
      versionNumber: 1,
      formId: form.id,
      formVersion: form.version,
      answersRevision: attempt.answersRevision,
      reasoningRevision: attempt.reasoningRevision || 0,
      creationReason,
      contextStatus: contextReady ? 'CONTEXT_READY' : 'CONTEXT_UNAVAILABLE',
      contextSetId: contextReady ? approvedContext.id : null,
      evidenceHash,
      createdAt: now
    };
    const responses = evidence.map((response) => ({
      learningSubmissionVersionId: version.id,
      formId: form.id,
      formVersion: form.version,
      ...response,
      answerOrigin: 'OFFICIAL_FINAL',
      createdAt: now
    }));
    const workItem = {
      id: randomUUID(),
      learningSubmissionVersionId: version.id,
      workType: 'ANALYZE_SUBMISSION',
      status: contextReady ? 'QUEUED' : 'BLOCKED_CONTEXT',
      priority: 50,
      attemptCount: 0,
      inputHash: workInputHash,
      deletionGeneration: 0,
      availableAt: now,
      leaseOwner: null,
      leaseToken: null,
      leaseExpiresAt: null,
      lastErrorCode: contextReady ? null : 'QUESTION_CONTEXT_UNAVAILABLE',
      createdAt: now,
      updatedAt: now
    };
    const analysisRun = contextReady ? {
      id: randomUUID(),
      learningSubmissionVersionId: version.id,
      contextSetId: approvedContext.id,
      versionNumber: version.versionNumber,
      inputHash: workInputHash,
      evidenceHash,
      deletionGeneration: workItem.deletionGeneration,
      status: 'QUEUED',
      createdAt: now,
      startedAt: null,
      completedAt: null,
      lastErrorCode: null
    } : null;
    if (analysisRun) workItem.analysisRunId = analysisRun.id;
    return tx.createLearningSubmission({ submission, version, responses, workItem, analysisRun });
  }

  async #reasoningEnvelope(tx, attempt) {
    return {
      attemptId: attempt.id,
      reasoningRevision: attempt.reasoningRevision || 0,
      stateRevision: attempt.stateRevision || 0,
      editable: canEditAnswers(attempt),
      notes: (await tx.getReasoningNotes()).map(({ questionNumber, reasoningText, updatedAt }) => ({
        questionNumber,
        reasoningText,
        updatedAt
      }))
    };
  }

  #publicLearningSubmission(bundle) {
    const analysis = bundle.workItems.find((item) => item.workType === 'ANALYZE_SUBMISSION');
    return {
      id: bundle.submission.id,
      sourceKind: bundle.submission.sourceType,
      version: bundle.version.versionNumber,
      status: bundle.version.contextStatus,
      officialSubmissionId: bundle.submission.officialSubmissionId,
      evidenceHash: bundle.version.evidenceHash,
      analysisStatus: analysis?.status || 'BLOCKED_CONTEXT'
    };
  }

  async #idempotentAttemptMutation(studentId, attemptId, action, idempotencyKey, body, work, options = {}) {
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
        return options.replay ? options.replay(tx, attempt, existing.responseBody) : existing.responseBody;
      }
      const form = await this.#getAttemptForm(attempt);
      const responseBody = await work(tx, attempt, form, this.now());
      const record = {
        studentId,
        scope,
        key,
        requestHash: hash,
        responseStatus: 200,
        responseBody: options.responseForStorage ? options.responseForStorage(responseBody) : responseBody,
        createdAt: this.now()
      };
      const stored = await tx.putIdempotency(record);
      if (stored.requestHash !== hash) {
        throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different request.');
      }
      return options.responseForStorage ? responseBody : stored.responseBody;
    });
  }
}
