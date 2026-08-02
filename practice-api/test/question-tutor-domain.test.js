import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  TutorDomainError,
  assertTutorThreadCapacity,
  buildTutorTurnRequest,
  computeTutorContextHash,
  computeTutorContextReleaseHash,
  computeTutorHistoryHash,
  computeTutorInputHash,
  computeTutorSnapshotHash,
  computeTutorThreadLineageHash,
  isTutorJobTransitionAllowed,
  isValidTutorContext,
  tutorCanonicalJson,
  tutorLeaseExpiryStatus,
  tutorSha256
} from '../src/question-tutor/domain.js';

const fixtureUrl = new URL('./fixtures/tutor-contract-v2.json', import.meta.url);

async function golden() {
  return JSON.parse(await readFile(fixtureUrl, 'utf8'));
}

function turnInput(request) {
  return {
    correlationId: request.correlationId,
    threadId: request.threadId,
    turnId: request.turnId,
    turnNumber: request.turnNumber,
    context: request.context,
    priorTurns: request.priorTurns,
    message: request.message
  };
}

function priorTurns(count) {
  return Array.from({ length: count }, (_, index) => ({
    turnNumber: index + 1,
    userMessage: `User question ${index + 1}`,
    assistantReply: `Safe answer ${index + 1}.`
  }));
}

test('checked-in Tutor v2 golden is byte-identical and freezes all four Gateway hashes', async () => {
  const bytes = await readFile(fixtureUrl);
  assert.equal(tutorSha256(bytes), '97b2c1d24220154af696ae6ff34a9443b5559fa38cd75c4b653c2eac5ef2877f');
  const { request } = JSON.parse(bytes.toString('utf8'));
  assert.equal(computeTutorSnapshotHash(request.context), request.snapshotHash);
  assert.equal(computeTutorContextHash(request), request.contextHash);
  assert.equal(computeTutorHistoryHash(request), request.historyHash);
  assert.equal(computeTutorInputHash(request), request.inputHash);
  assert.deepEqual(buildTutorTurnRequest(turnInput(request)), request);
});

test('Tutor canonical JSON matches Gateway semantics without a trailing newline', () => {
  assert.equal(tutorCanonicalJson({ z: 1, a: ['x', true, null] }), '{"a":["x",true,null],"z":1}');
  assert.equal(tutorSha256(tutorCanonicalJson({ a: 1 })), tutorSha256('{"a":1}'));
  assert.throws(() => tutorCanonicalJson({ missing: undefined }), /rejects undefined/i);
  assert.throws(() => tutorCanonicalJson({ invalid: Number.NaN }), /non-finite/i);
});

test('same immutable snapshot forks to a distinct thread context hash', async () => {
  const { request } = await golden();
  const fork = { threadId: 'tutor-thread-fork-001', context: request.context };
  assert.equal(computeTutorSnapshotHash(fork.context), request.snapshotHash);
  assert.notEqual(computeTutorContextHash(fork), request.contextHash);
  assert.equal(
    computeTutorContextHash(fork),
    computeTutorContextHash({ threadId: fork.threadId, context: structuredClone(request.context) })
  );
});

test('strict context accepts alternative and unscored snapshots but rejects drift and coercion', async () => {
  const { request } = await golden();
  const alternative = structuredClone(request.context);
  Object.assign(alternative.question, {
    officialAnswer: 'D', acceptedOptions: ['D', 'E'], studentAnswer: 'E'
  });
  assert.equal(isValidTutorContext(alternative), true);

  const unscored = structuredClone(request.context);
  Object.assign(unscored.question, {
    isScored: false, officialAnswer: null, acceptedOptions: [], studentAnswer: 'A'
  });
  assert.equal(isValidTutorContext(unscored), true);

  for (const mutate of [
    (value) => { value.question.acceptedOptions = ['E', 'D']; },
    (value) => { value.question.acceptedOptions = ['D', 'D']; },
    (value) => { delete value.question.isScored; },
    (value) => { value.formVersion = 2; },
    (value) => { value.formVersion = 'review\nv1'; },
    (value) => { value.question.official_answer = value.question.officialAnswer; }
  ]) {
    const invalid = structuredClone(alternative);
    mutate(invalid);
    assert.equal(isValidTutorContext(invalid), false);
  }

  const literal = structuredClone(request.context);
  literal.formVersion = '复习-v1';
  assert.equal(isValidTutorContext(literal), true);
});

test('context release and internal thread lineage are separate frozen hash domains', async () => {
  const { request } = await golden();
  const releaseLineage = {
    sourceType: 'INTERACTIVE_FINAL',
    formId: request.context.formId,
    formVersion: request.context.formVersion,
    manifestHash: '1'.repeat(64),
    contentHash: '2'.repeat(64),
    questionBundleHash: '3'.repeat(64),
    contextSetId: request.context.contextSetId,
    contextArtifactSha256: request.context.contextArtifactSha256,
    approvalAuthorityId: 'review-authority-001',
    approvalReceiptSetHash: '4'.repeat(64),
    openReviewReleaseHash: null
  };
  const contextReleaseHash = computeTutorContextReleaseHash(releaseLineage);
  assert.equal(contextReleaseHash, 'c0e19c39c282787e00d51d96f7c07c1db11bee6844fb0b07c0351a5e6a4f6e92');
  const threadLineage = {
    analysisRunId: 'analysis-run-001',
    analysisContractVersion: 'amc-analysis-contract-v2',
    reportId: 'learning-report-001',
    reportHash: '5'.repeat(64),
    snapshotHash: request.snapshotHash,
    questionResponseHash: '6'.repeat(64),
    scoringSnapshotHash: '7'.repeat(64),
    scoringOrigin: 'OFFICIAL_FINAL',
    initialDeletionGeneration: 0
  };
  const lineageHash = computeTutorThreadLineageHash(threadLineage);
  assert.equal(lineageHash, '1e1446429ec6e82cfa4e8dc1ce7ac578927186204859fd59f935791dedf9ce8c');
  assert.notEqual(lineageHash, request.snapshotHash);
  assert.notEqual(computeTutorThreadLineageHash({ ...threadLineage, reportHash: '8'.repeat(64) }), lineageHash);
  assert.throws(
    () => computeTutorContextReleaseHash({ ...releaseLineage, openReviewReleaseHash: '9'.repeat(64) }),
    (error) => error instanceof TutorDomainError && error.code === 'INVALID_CONTEXT_RELEASE_LINEAGE'
  );
});

test('turns one through nine carry complete history and turn ten requires an explicit fork', async () => {
  const { request } = await golden();
  const first = buildTutorTurnRequest({
    ...turnInput(request), turnId: 'tutor-turn-001', turnNumber: 1, priorTurns: [], message: 'Start here.'
  });
  assert.equal(first.priorTurns.length, 0);

  const ninth = buildTutorTurnRequest({
    ...turnInput(request), turnId: 'tutor-turn-009', turnNumber: 9,
    priorTurns: priorTurns(8), message: 'This is the final in-thread turn.'
  });
  assert.deepEqual(ninth.priorTurns.map((turn) => turn.turnNumber), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.throws(
    () => buildTutorTurnRequest({
      ...turnInput(request), turnId: 'tutor-turn-010', turnNumber: 10,
      priorTurns: priorTurns(9), message: 'Do not silently slide the window.'
    }),
    (error) => error instanceof TutorDomainError && error.code === 'FORK_REQUIRED'
  );
  assert.throws(
    () => buildTutorTurnRequest({
      ...turnInput(request), turnId: 'tutor-turn-009', turnNumber: 9,
      priorTurns: priorTurns(7), message: 'Missing a successful turn.'
    }),
    (error) => error instanceof TutorDomainError && error.code === 'INCOMPLETE_TUTOR_HISTORY'
  );
});

test('turn hashes bind context, full successful history, current message, and identity', async () => {
  const { request } = await golden();
  const baseline = buildTutorTurnRequest(turnInput(request));
  for (const mutate of [
    (value) => { value.context.question.studentAnswer = 'D'; },
    (value) => { value.context.question.solutions[0].title = 'Changed'; },
    (value) => { value.priorTurns[0].assistantReply = 'Changed reply.'; },
    (value) => { value.message = 'Changed message.'; },
    (value) => { value.turnId = 'tutor-turn-other'; }
  ]) {
    const input = turnInput(request);
    input.context = structuredClone(input.context);
    input.priorTurns = structuredClone(input.priorTurns);
    mutate(input);
    if (isValidTutorContext(input.context)) {
      assert.notEqual(buildTutorTurnRequest(input).inputHash, baseline.inputHash);
    } else {
      assert.throws(() => buildTutorTurnRequest(input), /INVALID_TUTOR_CONTEXT/);
    }
  }
});

test('thread capacity fails closed at turn, request, and byte limits', () => {
  assert.equal(assertTutorThreadCapacity({
    successfulTurnCount: 8, requestCount: 31, successfulHistoryBytes: 50_000,
    additionalHistoryBytes: 1_200
  }), true);
  for (const input of [
    { successfulTurnCount: 9, requestCount: 9, successfulHistoryBytes: 1 },
    { successfulTurnCount: 1, requestCount: 32, successfulHistoryBytes: 1 },
    { successfulTurnCount: 1, requestCount: 1, successfulHistoryBytes: 51_000, additionalHistoryBytes: 201 }
  ]) {
    assert.throws(
      () => assertTutorThreadCapacity(input),
      (error) => error instanceof TutorDomainError && error.code === 'FORK_REQUIRED'
    );
  }
});

test('job transitions preserve delivery-unknown and retry safety', () => {
  const queued = {
    status: 'QUEUED', providerInvoked: false, deliveryDisposition: 'NOT_DISPATCHED', retryable: false
  };
  assert.equal(isTutorJobTransitionAllowed(queued, 'RUNNING'), true);
  assert.equal(isTutorJobTransitionAllowed(queued, 'SUCCEEDED'), false);
  const beforeDispatch = { ...queued, status: 'RUNNING', retryable: true };
  assert.equal(tutorLeaseExpiryStatus(beforeDispatch), 'RETRY_WAIT');
  assert.equal(isTutorJobTransitionAllowed(beforeDispatch, 'RETRY_WAIT'), true);
  const unknown = {
    status: 'RUNNING', providerInvoked: true,
    deliveryDisposition: 'MAY_HAVE_BEEN_DELIVERED', retryable: false
  };
  assert.equal(tutorLeaseExpiryStatus(unknown), 'DELIVERY_UNKNOWN');
  assert.equal(isTutorJobTransitionAllowed(unknown, 'DELIVERY_UNKNOWN'), true);
  assert.equal(isTutorJobTransitionAllowed(unknown, 'RETRY_WAIT'), false);
  assert.equal(isTutorJobTransitionAllowed({ ...unknown, status: 'DELIVERY_UNKNOWN' }, 'RUNNING'), false);
  const knownNoResult = {
    status: 'RUNNING', providerInvoked: true, deliveryDisposition: 'KNOWN_NO_RESULT', retryable: true
  };
  assert.equal(isTutorJobTransitionAllowed(knownNoResult, 'RETRY_WAIT'), true);
  assert.equal(tutorLeaseExpiryStatus(knownNoResult), 'RETRY_WAIT');
  assert.equal(tutorLeaseExpiryStatus({ ...knownNoResult, retryable: false }), 'FAILED');
  assert.equal(isTutorJobTransitionAllowed(knownNoResult, 'SUCCEEDED'), false);
  assert.equal(isTutorJobTransitionAllowed({ ...knownNoResult, status: 'RETRY_WAIT' }, 'RUNNING'), true);
  assert.equal(isTutorJobTransitionAllowed({
    ...knownNoResult, status: 'RETRY_WAIT', retryable: false
  }, 'RUNNING'), false);
  assert.equal(isTutorJobTransitionAllowed({
    ...knownNoResult, providerInvoked: true, deliveryDisposition: 'NOT_DISPATCHED'
  }, 'RETRY_WAIT'), false, 'an internally contradictory delivery tuple fails closed');
  assert.equal(tutorLeaseExpiryStatus({ ...unknown, deliveryDisposition: 'DELIVERED_RESULT' }), 'DELIVERY_UNKNOWN');
});
