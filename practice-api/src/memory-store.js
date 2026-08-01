import { randomUUID } from 'node:crypto';
import { analysisInputHash } from './learning-review/canonical.js';

const clone = (value) => structuredClone(value);
const cloneMap = (map) => new Map([...map].map(([key, value]) => [key, clone(value)]));
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
    this.reasoningNotes = new Map();
    this.submissions = new Map();
    this.submissionAnswers = new Map();
    this.learningSubmissions = new Map();
    this.learningVersions = new Map();
    this.learningResponses = new Map();
    this.learningWorkItems = new Map();
    this.approvedContextSets = new Map();
    this.activeContextSetByForm = new Map();
    this.analysisRuns = new Map();
    this.questionAnalyses = new Map();
    this.learningReports = new Map();
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
      this.reasoningNotes.set(attempt.id, []);
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
    this.reasoningNotes.set(attempt.id, []);
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
      reasoningRevision: 0,
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

  async importApprovedContextSets({ forms, archiveSetHash, authorityId, receiptSetHash, importedAt }) {
    return this.#withGlobalLock(async () => {
      const checkpoint = this.#transactionCheckpoint();
      try {
        const imported = [];
        for (const artifact of forms) {
          const binding = artifact.formBinding;
          const storedForm = this.forms.get(formKey(binding.id, binding.version));
          if (!storedForm) throw Object.assign(new Error('Approved context form revision is not imported.'), { code: 'FORM_REVISION_NOT_FOUND' });
          const release = binding.releaseBinding;
          if (!release || release.questionBundleHash !== storedForm.questionBundleHash
              || release.contentHash !== storedForm.contentHash || release.manifestHash !== storedForm.manifestHash) {
            throw Object.assign(new Error('Approved context release hashes do not match the immutable form revision.'), { code: 'CONTEXT_RELEASE_MISMATCH' });
          }
          if (storedForm.questions.length !== artifact.questions.length) {
            throw Object.assign(new Error('Approved context question count mismatch.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
          }
          for (const question of artifact.questions) {
            const storedQuestion = storedForm.questions.find((item) => item.number === question.number);
            if (!storedQuestion) {
              throw Object.assign(new Error('Approved context question does not exist in the form revision.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
            }
            const choices = Object.fromEntries(storedQuestion.choices.map((choice) => [choice.option, choice.textMarkdown]));
            if (storedQuestion.promptMarkdown !== question.promptMarkdown
                || JSON.stringify(choices) !== JSON.stringify(question.choices)) {
              throw Object.assign(new Error('Approved context prompt/choices do not match the form revision.'), { code: 'CONTEXT_CONTENT_MISMATCH' });
            }
          }
          const existing = [...this.approvedContextSets.values()].find((item) => item.artifactSetHash === artifact.setHash);
          if (existing) {
            if (archiveSetHash && existing.archiveWrapperSetHash === null) {
              existing.archiveWrapperSetHash = archiveSetHash;
            } else if (archiveSetHash && existing.archiveWrapperSetHash !== archiveSetHash) {
              throw Object.assign(new Error('Approved context artifact is already bound to a different archive wrapper.'), {
                code: 'CONTEXT_ARCHIVE_LINEAGE_CONFLICT'
              });
            }
            imported.push(clone(existing));
            continue;
          }
          const currentId = this.activeContextSetByForm.get(formKey(binding.id, binding.version));
          if (currentId) {
            const current = this.approvedContextSets.get(currentId);
            current.active = false;
            current.supersededAt = importedAt;
          }
          const contextSet = {
            id: randomUUID(),
            schemaVersion: artifact.schemaVersion,
            artifactSetHash: artifact.setHash,
            archiveWrapperSetHash: archiveSetHash,
            candidateSchemaVersion: binding.candidateSchemaVersion,
            candidateSetHash: binding.candidateSetHash,
            decisionSetHash: artifact.reviewDecisionBinding.decisionSetHash,
            approvalAuthorityId: authorityId,
            approvalReceiptSetHash: receiptSetHash,
            formId: binding.id,
            formVersion: binding.version,
            contextContentHash: binding.contextContentHash,
            releaseBinding: clone(release),
            active: true,
            importedAt,
            supersededAt: null,
            questions: artifact.questions.filter((question) => question.contextReady
                && question.approvedSolutions.filter((solution) => solution.modelEligibility.eligible).length >= 2)
              .map((question) => ({
                questionNumber: question.number,
                questionContentHash: question.questionContentHash,
                promptMarkdown: question.promptMarkdown,
                choices: clone(question.choices),
                visualContext: clone(question.visualContext),
                modelEligibleSolutionCount: question.availability.modelEligibleSolutionCount,
                solutions: question.approvedSolutions.map((solution, index) => ({
                  solutionPosition: index + 1,
                  artifactSolutionId: solution.solutionId,
                  title: solution.title,
                  bodyMarkdown: solution.bodyMarkdown,
                  bodySha256: solution.bodySha256,
                  sourceRef: clone(solution.sourceRef),
                  reviewerId: solution.approval.reviewerId,
                  reviewedAt: solution.approval.reviewedAt,
                  rightsStatus: solution.approval.rightsStatus,
                  qualityFlags: clone(solution.approval.qualityFlags),
                  methodTags: clone(solution.approval.methodTags),
                  modelEligibility: clone(solution.modelEligibility),
                  decisionRecordHash: solution.approval.decisionRecordHash,
                  authorityReceipt: clone(solution.approval.authorityReceipt)
                }))
              }))
          };
          this.approvedContextSets.set(contextSet.id, clone(contextSet));
          this.activeContextSetByForm.set(formKey(binding.id, binding.version), contextSet.id);
          imported.push(clone(contextSet));
          if (contextSet.questions.length) this.#repairBlockedForContext(contextSet, importedAt);
        }
        return imported;
      } catch (error) {
        this.#restoreTransactionCheckpoint(checkpoint);
        throw error;
      }
    });
  }

  #repairBlockedForContext(contextSet, now) {
    for (const submission of this.learningSubmissions.values()) {
      if (submission.formId !== contextSet.formId || submission.formVersion !== contextSet.formVersion
          || submission.lifecycleStatus !== 'COMMITTED') continue;
      const version = (this.learningVersions.get(submission.id) || [])
        .find((item) => item.versionNumber === submission.currentVersion);
      if (!version || version.contextStatus !== 'CONTEXT_UNAVAILABLE') continue;
      const workItem = (this.learningWorkItems.get(version.id) || [])
        .find((item) => item.workType === 'ANALYZE_SUBMISSION' && item.status === 'BLOCKED_CONTEXT');
      if (!workItem) continue;
      const inputHash = analysisInputHash(version.evidenceHash, contextSet.artifactSetHash);
      const run = {
        id: randomUUID(), learningSubmissionVersionId: version.id, contextSetId: contextSet.id,
        versionNumber: version.versionNumber, inputHash, evidenceHash: version.evidenceHash,
        deletionGeneration: workItem.deletionGeneration, status: 'QUEUED', createdAt: now,
        startedAt: null, completedAt: null, lastErrorCode: null
      };
      version.contextStatus = 'CONTEXT_READY';
      version.contextSetId = contextSet.id;
      Object.assign(workItem, {
        status: 'QUEUED', inputHash, analysisRunId: run.id, availableAt: now,
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null, lastErrorCode: null, updatedAt: now
      });
      this.analysisRuns.set(version.id, clone(run));
    }
  }

  async claimLearningAnalysisWork({ workerId, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const nowMs = new Date(now).getTime();
      for (const items of this.learningWorkItems.values()) {
        for (const item of items) {
          if (item.status === 'RUNNING' && new Date(item.leaseExpiresAt).getTime() <= nowMs) {
            Object.assign(item, { status: 'QUEUED', leaseOwner: null, leaseToken: null, leaseExpiresAt: null, availableAt: now, updatedAt: now });
            const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === item.analysisRunId);
            if (run) Object.assign(run, { status: 'QUEUED', startedAt: null, lastErrorCode: 'LEASE_EXPIRED' });
          }
        }
      }
      const candidates = [...this.learningWorkItems.values()].flat()
        .filter((item) => item.status === 'QUEUED' && new Date(item.availableAt).getTime() <= nowMs)
        .sort((left, right) => right.priority - left.priority || new Date(left.createdAt) - new Date(right.createdAt));
      for (const item of candidates) {
        const version = [...this.learningVersions.values()].flat().find((candidate) => candidate.id === item.learningSubmissionVersionId);
        const submission = version && [...this.learningSubmissions.values()].find((candidate) => candidate.id === version.learningSubmissionId);
        const attempt = submission && this.attempts.get(submission.attemptId);
        const run = version && this.analysisRuns.get(version.id);
        const contextSet = version && this.approvedContextSets.get(version.contextSetId);
        if (!version || !submission || !attempt || !run || !contextSet
            || submission.currentVersion !== version.versionNumber || submission.lifecycleStatus !== 'COMMITTED'
            || !['FINALIZED', 'RESET'].includes(attempt.phase) || attempt.studentId !== submission.studentId
            || submission.formId !== version.formId || submission.formVersion !== version.formVersion
            || version.contextStatus !== 'CONTEXT_READY' || version.contextSetId !== run.contextSetId
            || run.learningSubmissionVersionId !== version.id || run.versionNumber !== version.versionNumber
            || run.evidenceHash !== version.evidenceHash || run.status !== 'QUEUED'
            || item.learningSubmissionVersionId !== version.id || item.analysisRunId !== run.id
            || item.inputHash !== run.inputHash || item.deletionGeneration !== run.deletionGeneration) {
          Object.assign(item, { status: 'CANCELLED', lastErrorCode: 'STALE_WORK', updatedAt: now, leaseOwner: null, leaseToken: null, leaseExpiresAt: null });
          if (run) Object.assign(run, { status: 'CANCELLED', lastErrorCode: 'STALE_WORK', completedAt: now });
          continue;
        }
        Object.assign(item, {
          status: 'RUNNING', attemptCount: item.attemptCount + 1, leaseOwner: workerId, leaseToken: randomUUID(),
          leaseExpiresAt: new Date(nowMs + leaseMs), updatedAt: now
        });
        Object.assign(run, { status: 'RUNNING', startedAt: run.startedAt || now, lastErrorCode: null });
        const responses = this.learningResponses.get(version.id) || [];
        const form = this.forms.get(formKey(version.formId, version.formVersion));
        const contexts = new Map(contextSet.questions.map((question) => [question.questionNumber, question]));
        return clone({
          workItem: item, run, version, submission,
          questions: responses.map((response) => {
            const formQuestion = form.questions.find((question) => question.number === response.questionNumber);
            return { ...response, officialAnswer: formQuestion.correctOption, context: contexts.get(response.questionNumber) || null };
          })
        });
      }
      return null;
    });
  }

  async heartbeatLearningAnalysisWork({ workItemId, workerId, leaseToken, now, leaseMs }) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === workItemId);
      if (!item || item.status !== 'RUNNING' || item.leaseOwner !== workerId || item.leaseToken !== leaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(now).getTime()) return false;
      item.leaseExpiresAt = new Date(new Date(now).getTime() + leaseMs);
      item.updatedAt = now;
      return true;
    });
  }

  async completeLearningAnalysisWork(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === input.workItemId);
      const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === input.analysisRunId);
      const version = run && [...this.learningVersions.values()].flat().find((candidate) => candidate.id === run.learningSubmissionVersionId);
      const submission = version && [...this.learningSubmissions.values()].find((candidate) => candidate.id === version.learningSubmissionId);
      const attempt = submission && this.attempts.get(submission.attemptId);
      if (!item || !run || !version || !submission || !attempt || item.status !== 'RUNNING'
          || item.leaseOwner !== input.workerId || item.leaseToken !== input.expectedLeaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(input.now).getTime()
          || item.inputHash !== input.expectedInputHash || item.deletionGeneration !== input.expectedDeletionGeneration
          || run.inputHash !== input.expectedInputHash || run.id !== item.analysisRunId || run.status !== 'RUNNING'
          || item.learningSubmissionVersionId !== version.id || run.contextSetId !== version.contextSetId
          || run.versionNumber !== version.versionNumber || run.evidenceHash !== version.evidenceHash
          || submission.currentVersion !== input.expectedVersionNumber || submission.studentId !== input.expectedStudentId
          || submission.lifecycleStatus !== 'COMMITTED' || attempt.studentId !== input.expectedStudentId
          || !['FINALIZED', 'RESET'].includes(attempt.phase) || version.contextSetId !== input.expectedContextSetId) return false;
      const responseNumbers = (this.learningResponses.get(version.id) || []).map((response) => response.questionNumber);
      const outcomeNumbers = input.outcomes.map((outcome) => outcome.questionNumber);
      if (outcomeNumbers.length !== responseNumbers.length || new Set(outcomeNumbers).size !== outcomeNumbers.length
          || outcomeNumbers.some((number, index) => number !== responseNumbers[index])) {
        throw Object.assign(new Error('Analysis outcomes must cover every response exactly once in question order.'), {
          code: 'INVALID_ANALYSIS_OUTCOMES'
        });
      }
      this.questionAnalyses.set(run.id, clone(input.outcomes));
      this.learningReports.set(version.id, clone({
        id: randomUUID(), analysisRunId: run.id, learningSubmissionVersionId: version.id, ...input.report
      }));
      Object.assign(run, { status: input.report.status, completedAt: input.now, lastErrorCode: null });
      Object.assign(item, {
        status: input.report.status === 'PARTIAL' ? 'PARTIAL' : input.report.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED',
        leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.report.status === 'FAILED' ? 'ANALYSIS_FAILED' : null,
        updatedAt: input.now
      });
      return true;
    });
  }

  async retryLearningAnalysisWork(input) {
    return this.#withGlobalLock(async () => {
      const item = [...this.learningWorkItems.values()].flat().find((candidate) => candidate.id === input.workItemId);
      const run = [...this.analysisRuns.values()].find((candidate) => candidate.id === input.analysisRunId);
      const version = run && [...this.learningVersions.values()].flat().find((candidate) => candidate.id === run.learningSubmissionVersionId);
      const submission = version && [...this.learningSubmissions.values()].find((candidate) => candidate.id === version.learningSubmissionId);
      const attempt = submission && this.attempts.get(submission.attemptId);
      if (!item || !run || !version || !submission || !attempt || item.status !== 'RUNNING'
          || item.leaseOwner !== input.workerId || item.leaseToken !== input.expectedLeaseToken
          || new Date(item.leaseExpiresAt).getTime() <= new Date(input.now).getTime()
          || item.inputHash !== input.expectedInputHash || item.deletionGeneration !== input.expectedDeletionGeneration
          || run.inputHash !== input.expectedInputHash || run.id !== item.analysisRunId || run.status !== 'RUNNING'
          || submission.currentVersion !== input.expectedVersionNumber || submission.studentId !== input.expectedStudentId
          || submission.lifecycleStatus !== 'COMMITTED' || attempt.studentId !== input.expectedStudentId
          || !['FINALIZED', 'RESET'].includes(attempt.phase) || version.contextSetId !== input.expectedContextSetId
          || run.contextSetId !== input.expectedContextSetId) return false;
      Object.assign(item, {
        status: 'QUEUED', availableAt: input.availableAt, leaseOwner: null, leaseToken: null, leaseExpiresAt: null,
        lastErrorCode: input.lastErrorCode, updatedAt: input.now
      });
      Object.assign(run, { status: 'QUEUED', startedAt: null, lastErrorCode: input.lastErrorCode });
      return true;
    });
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
      // Work on the live maps while the global mutex prevents observers, then
      // restore a full transaction checkpoint on failure. This gives the
      // deterministic adapter PostgreSQL-equivalent all-or-nothing behavior,
      // including failures after official scoring but before learning intent.
      const checkpoint = this.#transactionCheckpoint();
      try {
        return await work(new MemoryAttemptTransaction(this, attemptId));
      } catch (error) {
        this.#restoreTransactionCheckpoint(checkpoint);
        throw error;
      }
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

  #transactionCheckpoint() {
    return {
      attempts: cloneMap(this.attempts),
      answers: cloneMap(this.answers),
      reasoningNotes: cloneMap(this.reasoningNotes),
      submissions: cloneMap(this.submissions),
      submissionAnswers: cloneMap(this.submissionAnswers),
      learningSubmissions: cloneMap(this.learningSubmissions),
      learningVersions: cloneMap(this.learningVersions),
      learningResponses: cloneMap(this.learningResponses),
      learningWorkItems: cloneMap(this.learningWorkItems),
      approvedContextSets: cloneMap(this.approvedContextSets),
      activeContextSetByForm: cloneMap(this.activeContextSetByForm),
      analysisRuns: cloneMap(this.analysisRuns),
      questionAnalyses: cloneMap(this.questionAnalyses),
      learningReports: cloneMap(this.learningReports),
      events: cloneMap(this.events),
      idempotency: cloneMap(this.idempotency)
    };
  }

  #restoreTransactionCheckpoint(checkpoint) {
    for (const [name, value] of Object.entries(checkpoint)) this[name] = value;
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

  async getReasoningNotes() {
    return clone(this.store.reasoningNotes.get(this.attemptId) || []);
  }

  async saveReasoningNotes(updates, updatedAt) {
    const byNumber = new Map((this.store.reasoningNotes.get(this.attemptId) || [])
      .map((note) => [note.questionNumber, note]));
    for (const update of updates) {
      if (update.reasoningText === '') {
        byNumber.delete(update.questionNumber);
      } else {
        byNumber.set(update.questionNumber, {
          questionNumber: update.questionNumber,
          reasoningText: update.reasoningText,
          updatedAt
        });
      }
    }
    const notes = [...byNumber.values()].sort((left, right) => left.questionNumber - right.questionNumber);
    this.store.reasoningNotes.set(this.attemptId, clone(notes));
    return clone(notes);
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

  async getLearningSubmissionBundle() {
    const submission = this.store.learningSubmissions.get(this.attemptId);
    if (!submission) return null;
    const versions = this.store.learningVersions.get(submission.id) || [];
    const version = versions.find((candidate) => candidate.versionNumber === submission.currentVersion);
    if (!version) throw new Error(`Learning submission ${submission.id} has no current version.`);
    const run = this.store.analysisRuns.get(version.id) || null;
    return clone({
      submission,
      version,
      responses: this.store.learningResponses.get(version.id) || [],
      workItems: this.store.learningWorkItems.get(version.id) || [],
      analysisRun: run,
      analyses: run ? this.store.questionAnalyses.get(run.id) || [] : [],
      report: this.store.learningReports.get(version.id) || null
    });
  }

  async getApprovedContextSetForForm(formId, formVersion) {
    const id = this.store.activeContextSetByForm.get(formKey(formId, formVersion));
    const context = id ? this.store.approvedContextSets.get(id) : null;
    return context?.questions?.length ? clone(context) : null;
  }

  async getLearningReportBundle() {
    return this.getLearningSubmissionBundle();
  }

  async createLearningSubmission({ submission, version, responses, workItem, analysisRun = null }) {
    if (this.store.learningSubmissions.has(this.attemptId)) {
      const error = new Error('A learning submission already exists for this attempt.');
      error.code = 'LEARNING_SUBMISSION_EXISTS';
      throw error;
    }
    if (submission.attemptId !== this.attemptId
      || version.learningSubmissionId !== submission.id
      || responses.some((response) => response.learningSubmissionVersionId !== version.id)
      || workItem.learningSubmissionVersionId !== version.id) {
      throw new Error('Invalid learning submission aggregate.');
    }
    this.store.learningSubmissions.set(this.attemptId, clone(submission));
    this.store.learningVersions.set(submission.id, [clone(version)]);
    this.store.learningResponses.set(version.id, clone(responses));
    this.store.learningWorkItems.set(version.id, [clone(workItem)]);
    if (analysisRun) this.store.analysisRuns.set(version.id, clone(analysisRun));
    return this.getLearningSubmissionBundle();
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
