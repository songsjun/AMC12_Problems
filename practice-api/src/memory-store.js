import { randomUUID } from 'node:crypto';

const clone = (value) => structuredClone(value);
const formKey = (id, version) => `${id}\u0000${version}`;
const idempotencyKey = (studentId, scope, key) => `${studentId}\u0000${scope}\u0000${key}`;

/**
 * Deterministic test/local adapter. It deliberately implements the same
 * transaction-shaped API as PostgreSQL so service tests exercise locking and
 * immutable submission behavior rather than a different code path.
 */
export class MemoryStore {
  constructor() {
    this.students = new Map();
    this.accessCodes = new Map();
    this.sessions = new Map();
    this.forms = new Map();
    this.attempts = new Map();
    this.answers = new Map();
    this.submissions = new Map();
    this.submissionAnswers = new Map();
    this.events = new Map();
    this.idempotency = new Map();
    this.attemptLocks = new Map();
    this.globalLock = Promise.resolve();
  }

  async close() {}

  async addStudent({ id = randomUUID(), displayName, createdAt = new Date() }) {
    const student = { id, displayName, createdAt };
    this.students.set(id, clone(student));
    return clone(student);
  }

  async getStudent(id) {
    const student = this.students.get(id);
    return student ? clone(student) : null;
  }

  async putAccessCode({ codeHash, studentId, expiresAt = null, revokedAt = null, createdAt = new Date() }) {
    const record = { codeHash, studentId, expiresAt, revokedAt, createdAt };
    this.accessCodes.set(codeHash, clone(record));
    return clone(record);
  }

  async getAccessCode(codeHash) {
    const record = this.accessCodes.get(codeHash);
    return record ? clone(record) : null;
  }

  async createSession(session) {
    this.sessions.set(session.id, clone(session));
    return clone(session);
  }

  async getSession(id) {
    const session = this.sessions.get(id);
    return session ? clone(session) : null;
  }

  async revokeSession(id, revokedAt = new Date()) {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.revokedAt = revokedAt;
    this.sessions.set(id, clone(session));
    return clone(session);
  }

  async importForm(form, { publish = false, allowTestOnlyPublish = false } = {}) {
    return this.#withGlobalLock(() => this.#importFormUnlocked(form, { publish, allowTestOnlyPublish }));
  }

  /** Import a prevalidated release atomically, matching PostgreSQL's batch transaction. */
  async importForms(forms, { publish = false, allowTestOnlyPublish = false } = {}) {
    return this.#withGlobalLock(async () => {
      const previousForms = new Map([...this.forms].map(([key, value]) => [key, clone(value)]));
      try {
        const stored = [];
        for (const form of forms) {
          stored.push(await this.#importFormUnlocked(form, { publish, allowTestOnlyPublish }));
        }
        return stored;
      } catch (error) {
        this.forms = previousForms;
        throw error;
      }
    });
  }

  async #importFormUnlocked(form, { publish = false, allowTestOnlyPublish = false } = {}) {
    const key = formKey(form.id, form.version);
    const existing = this.forms.get(key);
    if (existing && existing.manifestHash !== form.manifestHash) {
      const error = new Error('A form version cannot be changed after import.');
      error.code = 'FORM_VERSION_IMMUTABLE';
      throw error;
    }
    const shouldPublish = Boolean(publish && (form.publishEligible || (form.developmentPublishEligible && allowTestOnlyPublish)));
    if (shouldPublish) {
      // Only one revision is the student-facing current form. Existing
      // attempts stay pinned to their immutable revision and remain readable
      // through the owner-scoped attempt endpoint.
      for (const [candidateKey, candidate] of this.forms) {
        if (candidate.id === form.id && candidateKey !== key && candidate.published) {
          this.forms.set(candidateKey, { ...candidate, published: false });
        }
      }
    }
    const stored = {
      ...clone(form),
      published: Boolean(existing?.published || shouldPublish),
      importedAt: existing?.importedAt || new Date(),
      publishedAt: existing?.publishedAt || (shouldPublish ? new Date() : null)
    };
    this.forms.set(key, stored);
    return clone(stored);
  }

  async getForm(id, version = undefined) {
    if (version !== undefined) {
      const form = this.forms.get(formKey(id, version));
      return form ? clone(form) : null;
    }
    const candidates = [...this.forms.values()].filter((form) => form.id === id);
    candidates.sort((left, right) => {
      if (left.published !== right.published) return left.published ? -1 : 1;
      const rightTime = new Date(right.publishedAt || right.importedAt || 0).getTime();
      const leftTime = new Date(left.publishedAt || left.importedAt || 0).getTime();
      return rightTime - leftTime || String(right.version).localeCompare(String(left.version), undefined, { numeric: true });
    });
    return candidates[0] ? clone(candidates[0]) : null;
  }

  async listForms({ includeUnpublished = false } = {}) {
    const currentById = new Map();
    for (const form of this.forms.values()) {
      if (!includeUnpublished && !form.published) continue;
      const current = currentById.get(form.id);
      if (!current
        || (form.published && !current.published)
        || (form.published === current.published
          && new Date(form.publishedAt || form.importedAt || 0) > new Date(current.publishedAt || current.importedAt || 0))) {
        currentById.set(form.id, form);
      }
    }
    return [...currentById.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(clone);
  }

  async findOrCreateActiveAttempt({ studentId, form, now }) {
    return this.#withGlobalLock(async () => {
      const active = [...this.attempts.values()]
        .filter((attempt) => attempt.studentId === studentId && attempt.formId === form.id
          && attempt.phase !== 'FINALIZED' && attempt.phase !== 'RESET')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (active) return { attempt: clone(active), created: false };
      const attempt = this.#newAttempt({ studentId, form, now });
      this.attempts.set(attempt.id, clone(attempt));
      this.answers.set(attempt.id, form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null })));
      this.submissions.set(attempt.id, []);
      this.events.set(attempt.id, [{ type: 'START', occurredAt: now }]);
      return { attempt: clone(attempt), created: true };
    });
  }

  async createResetAttempt({ studentId, form, now }, { alreadyLocked = false } = {}) {
    const create = async () => this.#createResetAttemptUnlocked({ studentId, form, now });
    return alreadyLocked ? create() : this.#withGlobalLock(create);
  }

  async #createResetAttemptUnlocked({ studentId, form, now }) {
    const attempt = this.#newAttempt({ studentId, form, now });
    this.attempts.set(attempt.id, clone(attempt));
    this.answers.set(attempt.id, form.questions.map((question) => ({ questionNumber: question.number, selectedOption: null })));
    this.submissions.set(attempt.id, []);
    this.events.set(attempt.id, [{ type: 'START', occurredAt: now, metadata: { reset: true } }]);
    return clone(attempt);
  }

  #newAttempt({ studentId, form, now }) {
    return {
      id: randomUUID(),
      studentId,
      formId: form.id,
      formVersion: form.version,
      durationMs: form.durationMs,
      phase: 'TIMED',
      clockState: 'RUNNING',
      activeElapsedMs: 0,
      clockStartedAt: now,
      answersRevision: 0,
      stateRevision: 0,
      limitReachedAt: null,
      finalizedAt: null,
      resetAt: null,
      createdAt: now,
      updatedAt: now
    };
  }

  async getAttempt(id) {
    const attempt = this.attempts.get(id);
    return attempt ? clone(attempt) : null;
  }

  async listAttemptsForStudent(studentId) {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(clone);
  }

  async listDeadlineCandidates(now) {
    const nowMs = new Date(now).getTime();
    return [...this.attempts.values()]
      .filter((attempt) => attempt.phase === 'TIMED' && attempt.clockState === 'RUNNING' && attempt.clockStartedAt
        && new Date(attempt.clockStartedAt).getTime() + (attempt.durationMs - attempt.activeElapsedMs) <= nowMs)
      .map((attempt) => attempt.id);
  }

  async withAttemptLock(attemptId, work) {
    // Match PostgreSQL's advisory(student, form) -> attempt-row lock order.
    // A single global mutex is sufficient for the deterministic in-memory
    // adapter and prevents reset/create from interleaving between phases.
    return this.#withGlobalLock(() => this.#withAttemptLockOnly(attemptId, work));
  }

  async #withAttemptLockOnly(attemptId, work) {
    const previous = this.attemptLocks.get(attemptId) || Promise.resolve();
    let release;
    const current = new Promise((resolve) => { release = resolve; });
    const queued = previous.then(() => current);
    this.attemptLocks.set(attemptId, queued);
    await previous;
    try {
      if (!this.attempts.has(attemptId)) return work(null);
      return await work(new MemoryAttemptTransaction(this, attemptId));
    } finally {
      release();
      if (this.attemptLocks.get(attemptId) === queued) this.attemptLocks.delete(attemptId);
    }
  }

  async #withGlobalLock(work) {
    const previous = this.globalLock;
    let release;
    this.globalLock = new Promise((resolve) => { release = resolve; });
    await previous;
    try {
      return await work();
    } finally {
      release();
    }
  }
}

class MemoryAttemptTransaction {
  constructor(store, attemptId) {
    this.store = store;
    this.attemptId = attemptId;
  }

  async getAttempt() {
    const attempt = this.store.attempts.get(this.attemptId);
    return attempt ? clone(attempt) : null;
  }

  async saveAttempt(attempt) {
    this.store.attempts.set(this.attemptId, clone(attempt));
    return clone(attempt);
  }

  async getAnswers() {
    return clone(this.store.answers.get(this.attemptId) || []);
  }

  async saveAnswers(answers) {
    this.store.answers.set(this.attemptId, clone(answers));
    return clone(answers);
  }

  async listSubmissions() {
    return clone(this.store.submissions.get(this.attemptId) || []);
  }

  async getSubmission(submissionId) {
    return (this.store.submissions.get(this.attemptId) || []).find((item) => item.id === submissionId) || null;
  }

  async createSubmission(submission, snapshots) {
    const items = this.store.submissions.get(this.attemptId) || [];
    if (items.some((item) => item.slot === submission.slot)) {
      const error = new Error('Submission slot already exists.');
      error.code = 'SUBMISSION_SLOT_USED';
      throw error;
    }
    items.push(clone(submission));
    this.store.submissions.set(this.attemptId, items);
    this.store.submissionAnswers.set(submission.id, clone(snapshots));
    return clone(submission);
  }

  async getSubmissionAnswers(submissionId) {
    return clone(this.store.submissionAnswers.get(submissionId) || []);
  }

  async addTimerEvent(event) {
    const events = this.store.events.get(this.attemptId) || [];
    events.push(clone(event));
    this.store.events.set(this.attemptId, events);
  }

  async getIdempotency(studentId, scope, key) {
    const record = this.store.idempotency.get(idempotencyKey(studentId, scope, key));
    return record ? clone(record) : null;
  }

  async putIdempotency(record) {
    const key = idempotencyKey(record.studentId, record.scope, record.key);
    const existing = this.store.idempotency.get(key);
    if (existing) return clone(existing);
    this.store.idempotency.set(key, clone(record));
    return clone(record);
  }

  async createResetAttempt({ studentId, form, now }) {
    return this.store.createResetAttempt({ studentId, form, now }, { alreadyLocked: true });
  }
}
