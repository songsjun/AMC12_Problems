import { randomUUID } from 'node:crypto';
import { badRequest, conflict, notFound, tooManyRequests, unauthorized } from '../errors.js';
import { isBoundedInferenceInputText } from '../infrastructure/amc-inference-contract.js';
import { TutorDomainError } from './domain.js';
import { normalizeTutorProviderBudget, TutorStoreError } from './store-contract.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,199}$/;

function canonicalInteger(value, name, maximum) {
  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !/^[1-9][0-9]*$/.test(text)) {
    throw badRequest('VALIDATION_ERROR', `${name} must be a canonical positive integer.`);
  }
  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw badRequest('VALIDATION_ERROR', `${name} is outside the supported range.`);
  }
  return parsed;
}

function canonicalUuid(value, name) {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw badRequest('VALIDATION_ERROR', `${name} must be a canonical lowercase UUID.`);
  }
  return value;
}

function requireIdempotencyKey(value) {
  if (typeof value !== 'string' || !IDEMPOTENCY_KEY.test(value)) {
    throw badRequest('IDEMPOTENCY_KEY_REQUIRED',
      'Idempotency-Key must contain 8-200 safe characters.');
  }
  return value;
}

function mapTutorError(error) {
  if (!(error instanceof TutorStoreError) && !(error instanceof TutorDomainError)) throw error;
  if (['TUTOR_SESSION_NOT_LIVE'].includes(error.code)) {
    throw unauthorized('SESSION_EXPIRED', 'Sign in again to continue.');
  }
  if (['TUTOR_THREAD_NOT_FOUND', 'TUTOR_SNAPSHOT_NOT_FOUND', 'TUTOR_SOURCE_NOT_LIVE',
    'TUTOR_SOURCE_LINEAGE_MISMATCH', 'TUTOR_ROOT_NOT_AVAILABLE',
    'TUTOR_RETRY_NOT_ALLOWED'].includes(error.code)) {
    throw notFound('TUTOR_RESOURCE_NOT_FOUND', 'The Tutor resource was not found.');
  }
  if (['INVALID_TUTOR_MESSAGE', 'INVALID_TUTOR_QUEUE_OPTIONS', 'INVALID_TUTOR_FORK'].includes(error.code)) {
    throw badRequest('VALIDATION_ERROR', 'The Tutor request is invalid.');
  }
  if (error.code === 'IDEMPOTENCY_KEY_REUSED') {
    throw conflict('IDEMPOTENCY_KEY_REUSED', 'The idempotency key was used for another request.');
  }
  if (error.code === 'FORK_REQUIRED') {
    throw conflict('TUTOR_FORK_REQUIRED', 'Start a fork to continue this conversation.');
  }
  if (error.code === 'TUTOR_STUDENT_CAPACITY_REACHED') {
    throw conflict('TUTOR_CAPACITY_REACHED', 'Wait for an active Tutor request to finish.');
  }
  if (['TUTOR_STUDENT_QUESTION_THREAD_CAP_REACHED',
    'TUTOR_STUDENT_THREAD_CAP_REACHED'].includes(error.code)) {
    throw conflict('TUTOR_THREAD_CAP_REACHED',
      'Delete an unneeded Tutor discussion before starting another one.');
  }
  if (['TUTOR_STUDENT_PROVIDER_WORK_RATE_LIMITED',
    'TUTOR_GLOBAL_PROVIDER_WORK_RATE_LIMITED'].includes(error.code)) {
    const retryAfterSeconds = Number.isSafeInteger(error.retryAfterSeconds)
      ? Math.min(86_400, Math.max(1, error.retryAfterSeconds)) : 60;
    throw tooManyRequests('TUTOR_PROVIDER_WORK_RATE_LIMITED',
      'The Tutor provider-work budget is exhausted. Please try again later.',
      retryAfterSeconds);
  }
  if (['TUTOR_THREAD_BUSY', 'TUTOR_THREAD_NOT_AVAILABLE'].includes(error.code)) {
    throw conflict(error.code, 'The Tutor thread cannot accept this request now.');
  }
  throw error;
}

function scope(input) {
  return {
    studentId: canonicalUuid(input.studentId, 'studentId'),
    authorizedSessionId: input.authorizedSessionId,
    learningSubmissionId: canonicalUuid(input.learningSubmissionId, 'submissionId'),
    versionNumber: canonicalInteger(input.versionNumber, 'versionNumber', 1_000_000),
    questionNumber: canonicalInteger(input.questionNumber, 'questionNumber', 25)
  };
}

function matchesScope(bundle, expected) {
  return Boolean(bundle
    && bundle.thread.learningSubmissionId === expected.learningSubmissionId
    && bundle.thread.versionNumber === expected.versionNumber
    && bundle.thread.questionNumber === expected.questionNumber);
}

function parseThreadListQuery(query = {}) {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw badRequest('VALIDATION_ERROR', 'Tutor thread query must be an object.');
  }
  if (Object.keys(query).some((key) => !['limit', 'cursor'].includes(key))) {
    throw badRequest('VALIDATION_ERROR', 'Tutor thread query contains unsupported fields.');
  }
  const rawLimit = query.limit === undefined ? '10' : query.limit;
  if (typeof rawLimit !== 'string' || !/^[1-9][0-9]?$/.test(rawLimit)
      || Number(rawLimit) > 20) {
    throw badRequest('VALIDATION_ERROR', 'limit must be an integer string between 1 and 20.');
  }
  const limit = Number(rawLimit);
  if (query.cursor === undefined) return { limit, cursor: null };
  if (typeof query.cursor !== 'string' || query.cursor.length < 8 || query.cursor.length > 512
      || !/^[A-Za-z0-9_-]+$/.test(query.cursor)) {
    throw badRequest('INVALID_TUTOR_CURSOR', 'Tutor thread cursor is invalid.');
  }
  try {
    const decoded = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'));
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)
        || Object.keys(decoded).sort().join(',') !== 'threadId,updatedAt,v'
        || decoded.v !== 1 || typeof decoded.updatedAt !== 'string'
        || new Date(decoded.updatedAt).toISOString() !== decoded.updatedAt
        || typeof decoded.threadId !== 'string' || !UUID.test(decoded.threadId)) {
      throw new Error('invalid');
    }
    const canonical = Buffer.from(JSON.stringify({
      v: 1, updatedAt: decoded.updatedAt, threadId: decoded.threadId
    })).toString('base64url');
    if (canonical !== query.cursor) throw new Error('non-canonical');
    return { limit, cursor: decoded };
  } catch {
    throw badRequest('INVALID_TUTOR_CURSOR', 'Tutor thread cursor is invalid.');
  }
}

function threadListCursor(summary) {
  return Buffer.from(JSON.stringify({
    v: 1,
    updatedAt: new Date(summary.thread.updatedAt).toISOString(),
    threadId: summary.thread.id
  })).toString('base64url');
}

export class QuestionTutorApplicationService {
  constructor({ store, providerBudget, clock = () => new Date() }) {
    this.store = store;
    this.providerBudget = normalizeTutorProviderBudget(providerBudget);
    this.clock = clock;
  }

  async createRootThread(input) {
    const expected = scope(input);
    const idempotencyKey = requireIdempotencyKey(input.idempotencyKey);
    try {
      const created = await this.store.createTutorRootThread({
        ...expected,
        idempotencyKey,
        snapshotId: randomUUID(),
        threadId: randomUUID(),
        now: this.clock()
      });
      const bundle = await this.store.getTutorThreadBundle(expected.studentId, created.thread.id);
      if (!matchesScope(bundle, expected)) {
        throw new TutorStoreError('TUTOR_SOURCE_NOT_LIVE');
      }
      return { thread: bundle, replayed: created.replayed === true };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async listThreads(input) {
    const expected = scope(input);
    const { limit, cursor } = parseThreadListQuery(input.query);
    try {
      const records = await this.store.listTutorThreadSummaries(
        expected.studentId, expected.learningSubmissionId,
        expected.versionNumber, expected.questionNumber,
        { limit, cursor }
      );
      const items = records.slice(0, limit);
      return {
        items,
        nextCursor: records.length > limit ? threadListCursor(items.at(-1)) : null
      };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async getThread(input) {
    const expected = scope(input);
    const threadId = canonicalUuid(input.threadId, 'threadId');
    try {
      const bundle = await this.store.getTutorThreadBundle(expected.studentId, threadId);
      if (!matchesScope(bundle, expected)) {
        throw notFound('TUTOR_RESOURCE_NOT_FOUND', 'The Tutor resource was not found.');
      }
      return { thread: bundle };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async sendMessage(input) {
    const expected = scope(input);
    const threadId = canonicalUuid(input.threadId, 'threadId');
    const idempotencyKey = requireIdempotencyKey(input.idempotencyKey);
    if (!isBoundedInferenceInputText(input.message, 1, 2_048) || !input.message.trim()) {
      throw badRequest('VALIDATION_ERROR', 'message must contain 1-2048 UTF-8 bytes of text.');
    }
    await this.getThread({ ...expected, threadId });
    try {
      const enqueued = await this.store.enqueueTutorTurn({
        studentId: expected.studentId,
        threadId,
        authorizedSessionId: expected.authorizedSessionId,
        idempotencyKey,
        correlationId: `tutor-${randomUUID()}`,
        jobId: randomUUID(),
        messageId: randomUUID(),
        message: input.message,
        providerBudget: this.providerBudget,
        now: this.clock()
      });
      return {
        thread: (await this.getThread({ ...expected, threadId })).thread,
        acceptedRequest: {
          requestOrdinal: enqueued.job.requestOrdinal,
          status: enqueued.job.status,
          replayed: enqueued.replayed === true
        }
      };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async forkThread(input) {
    const expected = scope(input);
    const parentThreadId = canonicalUuid(input.threadId, 'threadId');
    const idempotencyKey = requireIdempotencyKey(input.idempotencyKey);
    await this.getThread({ ...expected, threadId: parentThreadId });
    try {
      const created = await this.store.createTutorForkFromHead({
        ...expected,
        parentThreadId,
        authorizedSessionId: expected.authorizedSessionId,
        idempotencyKey,
        threadId: randomUUID(),
        now: this.clock()
      });
      const bundle = await this.store.getTutorThreadBundle(expected.studentId, created.thread.id);
      if (!matchesScope(bundle, expected)) throw new TutorStoreError('TUTOR_SOURCE_NOT_LIVE');
      return { thread: bundle, replayed: created.replayed === true };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async retryRequest(input) {
    const expected = scope(input);
    const threadId = canonicalUuid(input.threadId, 'threadId');
    const requestOrdinal = canonicalInteger(input.requestOrdinal, 'requestOrdinal', 32);
    const idempotencyKey = requireIdempotencyKey(input.idempotencyKey);
    await this.getThread({ ...expected, threadId });
    try {
      const retried = await this.store.retryTutorTurnByOrdinal({
        ...expected,
        threadId,
        requestOrdinal,
        authorizedSessionId: expected.authorizedSessionId,
        idempotencyKey,
        correlationId: `tutor-${randomUUID()}`,
        jobId: randomUUID(),
        providerBudget: this.providerBudget,
        now: this.clock()
      });
      return {
        thread: (await this.getThread({ ...expected, threadId })).thread,
        acceptedRequest: {
          requestOrdinal: retried.job.requestOrdinal,
          status: retried.job.status,
          replayed: retried.replayed === true
        }
      };
    } catch (error) {
      return mapTutorError(error);
    }
  }

  async tombstoneThread(input) {
    const expected = scope(input);
    const threadId = canonicalUuid(input.threadId, 'threadId');
    const idempotencyKey = requireIdempotencyKey(input.idempotencyKey);
    try {
      const removed = await this.store.tombstoneTutorThreadByPath({
        ...expected, threadId, idempotencyKey, now: this.clock()
      });
      if (!removed) {
        throw notFound('TUTOR_RESOURCE_NOT_FOUND', 'The Tutor resource was not found.');
      }
    } catch (error) {
      return mapTutorError(error);
    }
  }
}
