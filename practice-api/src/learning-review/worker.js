import { setTimeout as delay } from 'node:timers/promises';
import { canonicalHash } from './canonical.js';
import { aggregateReportStatus, reportHash, reportSummary } from './report.js';
import {
  computeInferenceContextHash,
  computeInferenceInputHash,
  isBoundedInferenceInputText
} from '../infrastructure/amc-inference-contract.js';

function deterministicUnassessable(question, code, summary) {
  return {
    questionNumber: question.questionNumber,
    status: 'UNASSESSABLE',
    providerInvoked: false,
    reasoningVerdict: null,
    summaryMarkdown: summary,
    strengths: [],
    gaps: [],
    suggestions: code === 'BLANK_REASONING' ? ['Add the key steps you used so the reasoning can be assessed.'] : [],
    solutionComparisons: [],
    confidence: null,
    outcomeCode: code,
    runMetadata: null,
    errorClass: null,
    retryable: false,
    questionInputHash: canonicalHash({
      selectedOption: question.selectedOption,
      reasoningText: question.reasoningText,
      questionNumber: question.questionNumber
    }),
    questionContextHash: question.context?.questionContentHash || null
  };
}

function requestFor(job, question, eligibleSolutions) {
  const request = {
    schema: 'amc-inference-request-v1',
    task: 'question_analysis_v1',
    correlation_id: `lr:${job.run.id}:${question.questionNumber}`,
    input_hash: '0'.repeat(64),
    context_hash: '0'.repeat(64),
    safety_id: 'amc-math-safe-v1',
    question: {
      question_id: `q:${question.questionNumber}:${question.context.questionContentHash.slice(0, 24)}`,
      prompt_markdown: question.context.promptMarkdown,
      choices: ['A', 'B', 'C', 'D', 'E'].map((label) => ({
        label,
        text_markdown: question.context.choices[label]
      })),
      official_answer: question.officialAnswer,
      student_answer: question.selectedOption,
      student_reasoning: question.reasoningText,
      solutions: eligibleSolutions.map((solution) => ({
        solution_id: solution.artifactSolutionId,
        approval_status: 'APPROVED',
        title: solution.title,
        markdown: solution.bodyMarkdown,
        body_sha256: solution.bodySha256,
        source_sha256: solution.sourceRef.sha256,
        reviewer_id: solution.reviewerId,
        reviewed_at: solution.reviewedAt,
        rights_status: solution.rightsStatus,
        method_tags: solution.methodTags,
        quality_flags: solution.qualityFlags
      }))
    }
  };
  request.context_hash = computeInferenceContextHash(request);
  request.input_hash = computeInferenceInputHash(request);
  return request;
}

function solutionAuthorization(solution) {
  return {
    artifactSolutionId: solution.artifactSolutionId,
    bodySha256: solution.bodySha256,
    sourceSha256: solution.sourceRef.sha256,
    decisionRecordHash: solution.decisionRecordHash,
    authorityReceiptId: solution.authorityReceipt.receiptId
  };
}

function successfulOutcome(question, request, analysis, runMetadata, eligibleSolutions) {
  const methods = new Map(eligibleSolutions.map((solution) => [solution.artifactSolutionId, solution.methodTags]));
  return {
    questionNumber: question.questionNumber,
    status: 'SUCCEEDED',
    providerInvoked: true,
    reasoningVerdict: analysis.classification,
    summaryMarkdown: analysis.summary,
    strengths: analysis.strengths,
    gaps: analysis.gaps,
    suggestions: analysis.suggestions,
    solutionComparisons: analysis.solution_comparisons.map((comparison) => ({
      artifactSolutionId: comparison.solution_id,
      methodTags: methods.get(comparison.solution_id),
      alignment: comparison.alignment,
      analysisMarkdown: comparison.observation
    })),
    confidence: analysis.confidence,
    outcomeCode: null,
    runMetadata,
    errorClass: null,
    retryable: false,
    questionInputHash: request.input_hash,
    questionContextHash: request.context_hash
  };
}

function failedOutcome(question, request, error) {
  return {
    questionNumber: question.questionNumber,
    status: 'FAILED',
    providerInvoked: true,
    reasoningVerdict: null,
    summaryMarkdown: 'Analysis is temporarily unavailable for this question.',
    strengths: [],
    gaps: [],
    suggestions: [],
    solutionComparisons: [],
    confidence: null,
    outcomeCode: typeof error?.code === 'string' ? error.code : 'INFERENCE_FAILED',
    runMetadata: null,
    errorClass: ['permanent', 'rate_limit', 'transient'].includes(error?.errorClass) ? error.errorClass : 'permanent',
    retryable: error?.retryable === true,
    questionInputHash: request.input_hash,
    questionContextHash: request.context_hash
  };
}

export class LearningReviewWorker {
  constructor({
    store, inferenceClient, workerId, leaseMs = 120_000, clock = () => new Date(),
    maxAttempts = 3, retryBaseMs = 5_000, retryMaxMs = 60_000
  }) {
    if (typeof workerId !== 'string' || workerId.length < 8 || workerId.length > 100) throw new Error('workerId must be an 8-100 character opaque id.');
    this.store = store;
    this.inferenceClient = inferenceClient;
    this.workerId = workerId;
    this.leaseMs = leaseMs;
    this.clock = clock;
    if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error('maxAttempts must be 1-10.');
    if (!Number.isSafeInteger(retryBaseMs) || retryBaseMs < 100 || retryBaseMs > 600_000
        || !Number.isSafeInteger(retryMaxMs) || retryMaxMs < retryBaseMs || retryMaxMs > 3_600_000) {
      throw new Error('Learning retry delay bounds are invalid.');
    }
    this.maxAttempts = maxAttempts;
    this.retryBaseMs = retryBaseMs;
    this.retryMaxMs = retryMaxMs;
    this.heartbeatMs = Math.max(250, Math.min(10_000, Math.floor(leaseMs / 3)));
  }

  async #analyzeWithHeartbeat(job, question, eligibleSolutions, request, shutdownSignal) {
    const requestController = new AbortController();
    const heartbeatController = new AbortController();
    const abortForShutdown = () => requestController.abort(shutdownSignal?.reason);
    if (shutdownSignal?.aborted) abortForShutdown();
    else shutdownSignal?.addEventListener('abort', abortForShutdown, { once: true });
    let leaseLost = false;
    const heartbeatLoop = (async () => {
      while (!heartbeatController.signal.aborted) {
        try {
          await delay(this.heartbeatMs, undefined, { signal: heartbeatController.signal });
        } catch {
          return;
        }
        let heartbeat = false;
        try {
          heartbeat = await this.store.heartbeatLearningAnalysisWork({
            workItemId: job.workItem.id,
            workerId: this.workerId,
            leaseToken: job.workItem.leaseToken,
            now: this.clock(),
            leaseMs: this.leaseMs
          });
        } catch {
          heartbeat = false;
        }
        if (!heartbeat) {
          leaseLost = true;
          requestController.abort();
          return;
        }
      }
    })();
    let analysis;
    let inferenceError;
    try {
      const authorized = await this.store.authorizeLearningAnalysisProviderCall({
        workItemId: job.workItem.id,
        analysisRunId: job.run.id,
        workerId: this.workerId,
        leaseToken: job.workItem.leaseToken,
        inputHash: job.workItem.inputHash,
        deletionGeneration: job.workItem.deletionGeneration,
        versionId: job.version.id,
        versionNumber: job.version.versionNumber,
        evidenceHash: job.version.evidenceHash,
        expectedStudentId: job.submission.studentId,
        expectedSubmissionCurrentVersion: job.submission.currentVersion,
        expectedContextSetId: job.version.contextSetId,
        questionNumber: question.questionNumber,
        questionResponseHash: canonicalHash({
          questionNumber: question.questionNumber,
          selectedOption: question.selectedOption,
          reasoningText: question.reasoningText
        }),
        questionContextHash: question.context.questionContentHash,
        officialAnswer: question.officialAnswer,
        eligibleSolutions: eligibleSolutions.map(solutionAuthorization),
        now: this.clock()
      });
      if (!authorized) {
        leaseLost = true;
        requestController.abort();
        throw Object.assign(new Error('Learning analysis authorization was lost.'), { code: 'LEASE_LOST' });
      }
      analysis = await this.inferenceClient.analyze(request, { signal: requestController.signal });
    } catch (error) {
      inferenceError = error;
    } finally {
      shutdownSignal?.removeEventListener('abort', abortForShutdown);
      heartbeatController.abort();
      await heartbeatLoop;
    }
    if (shutdownSignal?.aborted) {
      throw Object.assign(new Error('Learning analysis stopped for worker shutdown.'), {
        code: 'WORKER_SHUTDOWN'
      });
    }
    if (leaseLost) throw Object.assign(new Error('Learning analysis lease was lost.'), { code: 'LEASE_LOST' });
    if (inferenceError) throw inferenceError;
    return analysis;
  }

  async runOnce() {
    const job = await this.store.claimLearningAnalysisWork({
      workerId: this.workerId,
      now: this.clock(),
      leaseMs: this.leaseMs
    });
    if (!job) return { processed: false };
    return this.processClaimed(job);
  }

  async processClaimed(job, { signal } = {}) {
    const outcomes = [];
    for (const question of job.questions) {
      if (signal?.aborted) return { processed: false, shuttingDown: true };
      const heartbeat = await this.store.heartbeatLearningAnalysisWork({
        workItemId: job.workItem.id,
        workerId: this.workerId,
        leaseToken: job.workItem.leaseToken,
        now: this.clock(),
        leaseMs: this.leaseMs
      });
      if (!heartbeat) return { processed: false, staleLease: true };
      if (!question.reasoningText?.trim()) {
        outcomes.push(deterministicUnassessable(question, 'BLANK_REASONING', 'No written reasoning was submitted for this question.'));
        continue;
      }
      if (!isBoundedInferenceInputText(question.reasoningText, 1, 12_000)) {
        outcomes.push(deterministicUnassessable(
          question,
          'REASONING_FORMAT_UNSUPPORTED',
          'The submitted reasoning is invalid or exceeds the supported size.'
        ));
        continue;
      }
      const eligibleSolutions = question.context?.solutions.filter((solution) => solution.modelEligibility?.eligible !== false) || [];
      if (!question.context || question.context.visualContext?.modelAvailable === false || eligibleSolutions.length < 2) {
        outcomes.push(deterministicUnassessable(question, 'CONTEXT_UNAVAILABLE', 'Approved comparison context is unavailable for this question.'));
        continue;
      }
      if (!question.officialAnswer) {
        outcomes.push(deterministicUnassessable(question, 'QUESTION_UNSCORED', 'This question has no official scored answer for analysis.'));
        continue;
      }
      const request = requestFor(job, question, eligibleSolutions);
      try {
        const result = await this.#analyzeWithHeartbeat(
          job, question, eligibleSolutions, request, signal
        );
        outcomes.push(successfulOutcome(question, request, result.analysis, result.runMetadata, eligibleSolutions));
      } catch (error) {
        if (error?.code === 'WORKER_SHUTDOWN' || signal?.aborted) {
          return { processed: false, shuttingDown: true };
        }
        if (error?.code === 'LEASE_LOST') return { processed: false, staleLease: true };
        outcomes.push(failedOutcome(question, request, error));
      }
    }
    if (signal?.aborted) return { processed: false, shuttingDown: true };
    const now = this.clock();
    const retryable = outcomes.find((outcome) => outcome.status === 'FAILED' && outcome.retryable);
    if (retryable && job.workItem.attemptCount < this.maxAttempts) {
      const retryDelay = Math.min(this.retryMaxMs,
        this.retryBaseMs * (2 ** Math.max(0, job.workItem.attemptCount - 1)));
      const retried = await this.store.retryLearningAnalysisWork({
        workItemId: job.workItem.id,
        analysisRunId: job.run.id,
        workerId: this.workerId,
        expectedLeaseToken: job.workItem.leaseToken,
        expectedInputHash: job.workItem.inputHash,
        expectedDeletionGeneration: job.workItem.deletionGeneration,
        expectedVersionNumber: job.version.versionNumber,
        expectedStudentId: job.submission.studentId,
        expectedContextSetId: job.version.contextSetId,
        lastErrorCode: retryable.outcomeCode,
        availableAt: new Date(new Date(now).getTime() + retryDelay),
        now
      });
      return retried
        ? { processed: true, status: 'RETRY_QUEUED', providerCalls: outcomes.filter((item) => item.providerInvoked).length }
        : { processed: false, staleWrite: true };
    }
    const status = aggregateReportStatus(outcomes);
    const summary = reportSummary(outcomes);
    const report = {
      status,
      generatedAt: now,
      summary,
      reportHash: reportHash({
        learningSubmissionVersionId: job.version.id,
        status,
        generatedAt: now,
        summary,
        outcomes
      })
    };
    const completed = await this.store.completeLearningAnalysisWork({
      workItemId: job.workItem.id,
      analysisRunId: job.run.id,
      workerId: this.workerId,
      expectedLeaseToken: job.workItem.leaseToken,
      expectedInputHash: job.workItem.inputHash,
      expectedDeletionGeneration: job.workItem.deletionGeneration,
      expectedVersionNumber: job.version.versionNumber,
      expectedStudentId: job.submission.studentId,
      expectedContextSetId: job.version.contextSetId,
      outcomes,
      report,
      now
    });
    return completed ? { processed: true, status, providerCalls: outcomes.filter((item) => item.providerInvoked).length }
      : { processed: false, staleWrite: true };
  }
}
