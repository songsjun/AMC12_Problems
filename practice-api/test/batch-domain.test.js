import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  MAX_AUDIO_FILE_BYTES,
  MAX_BATCH_BYTES,
  MAX_GATEWAY_CHUNK_SOURCE_BYTES,
  MAX_GATEWAY_CHUNK_SOURCES,
  MAX_GATEWAY_VIRTUAL_SOURCE_BYTES,
  MAX_MAPPING_ITEMS,
  MAX_TEXT_FILE_BYTES,
  batchSha256,
  buildBatchQuestionCatalog,
  buildDecompositionPlan,
  computeBatchGatewayInputHash,
  computeBatchGatewayPlanHash,
  normalizeBatchFileDescriptors,
  normalizeBatchGatewayRunMetadata,
  normalizeMappingConfirmation,
  publicBatchProjection,
  scoreBatchPractice,
  segmentBatchGatewaySources,
  validateDecompositionOutputs,
  validateNormalizedEvidenceText
} from '../src/batch-ingest/domain.js';
import { learningReviewForm } from './learning-review-fixture.js';

const form = learningReviewForm();
const questionCatalog = buildBatchQuestionCatalog(form);

function publicSpan(segment) {
  return Object.fromEntries(['segmentId', 'assetId', 'startByte', 'endByte', 'sha256']
    .map((key) => [key, segment[key]]));
}

function outputForPlan(plan, itemFactory = (segment, index) => ({
  itemKey: `item-${index + 1}`,
  candidateQuestionNumbers: [index + 1],
  proposedQuestionNumber: index + 1,
  answer: index % 2 ? 'B' : 'A',
  reasoningSummary: `Method summary ${index + 1}.`,
  confidence: 0.95,
  ambiguity: 'NONE',
  spans: [publicSpan(segment)],
  conflictFlags: [],
  requiresConfirmation: false
})) {
  let itemIndex = 0;
  return plan.chunks.map((chunk) => {
    const segments = segmentBatchGatewaySources(chunk.sources);
    return {
      schema: 'amc-batch-decomposition-v1',
      correlationId: plan.correlationId,
      inputHash: chunk.inputHash,
      planHash: chunk.planHash,
      chunkId: chunk.chunkId,
      items: segments.map((segment) => itemFactory(segment, itemIndex++)),
      unmappedSpans: []
    };
  });
}

function decompositionFixture() {
  const evidence = [
    {
      assetId: 'd282f7aa-8cb5-49db-8447-d948f1a834a9', position: 1, sourceKind: 'TEXT_UPLOAD',
      normalizedText: 'Q1: A because one.', normalizedSha256: batchSha256('Q1: A because one.'),
      transcriptConfidence: null
    },
    {
      assetId: 'e392f7aa-8cb5-49db-8447-d948f1a834a9', position: 2, sourceKind: 'TEXT_UPLOAD',
      normalizedText: 'Q2: B because two.', normalizedSha256: batchSha256('Q2: B because two.'),
      transcriptConfidence: null
    }
  ];
  const plan = buildDecompositionPlan(evidence, { correlationId: 'batch-correlation-0001', questionCatalog });
  return { evidence, plan, outputs: outputForPlan(plan) };
}

test('batch file reservations enforce independent file/count/media/aggregate ceilings', () => {
  const normalized = normalizeBatchFileDescriptors([
    { displayName: 'work.md', kind: 'TEXT', contentType: 'text/markdown; charset=utf-8', declaredBytes: MAX_TEXT_FILE_BYTES },
    { displayName: 'voice.mp3', kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: MAX_AUDIO_FILE_BYTES }
  ]);
  assert.equal(normalized.totalBytes, MAX_TEXT_FILE_BYTES + MAX_AUDIO_FILE_BYTES);
  assert.equal(normalized.hasAudio, true);
  assert.throws(() => normalizeBatchFileDescriptors(Array.from({ length: 11 }, (_, index) => ({
    displayName: `${index}.txt`, kind: 'TEXT', contentType: 'text/plain', declaredBytes: 1
  }))), (error) => error.code === 'INVALID_BATCH_FILES');
  assert.throws(() => normalizeBatchFileDescriptors([
    { displayName: 'large.txt', kind: 'TEXT', contentType: 'text/plain', declaredBytes: MAX_TEXT_FILE_BYTES + 1 }
  ]), (error) => error.code === 'FILE_SIZE_LIMIT');
  assert.throws(() => normalizeBatchFileDescriptors(Array.from({ length: 5 }, (_, index) => ({
    displayName: `${index}.mp3`, kind: 'AUDIO', contentType: 'audio/mpeg', declaredBytes: MAX_AUDIO_FILE_BYTES
  }))), (error) => error.code === 'BATCH_SIZE_LIMIT');
  assert.equal(MAX_BATCH_BYTES, 100 * 1024 * 1024);
});

test('question catalog accepts only the real canonical 25-question A-E array', () => {
  assert.equal(questionCatalog.length, 25);
  assert.deepEqual(questionCatalog[0].choiceExcerpts[0], { label: 'A', text: 'Choice A for 1' });
  const legacyObject = structuredClone(form);
  legacyObject.questions[0].choices = { A: 'legacy', B: 'legacy', C: 'legacy', D: 'legacy', E: 'legacy' };
  assert.throws(() => buildBatchQuestionCatalog(legacyObject), (error) => error.code === 'INVALID_QUESTION_CATALOG');
  const wrongOrder = structuredClone(form);
  [wrongOrder.questions[0].choices[0], wrongOrder.questions[0].choices[1]]
    = [wrongOrder.questions[0].choices[1], wrongOrder.questions[0].choices[0]];
  assert.throws(() => buildBatchQuestionCatalog(wrongOrder), (error) => error.code === 'INVALID_QUESTION_CATALOG');
});

test('API hashing and segmentation stay byte-for-byte aligned with the copied Gateway fixture', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/batch-contract-v1.json', import.meta.url), 'utf8'));
  assert.equal(computeBatchGatewayPlanHash(fixture.request), fixture.request.planHash);
  assert.equal(computeBatchGatewayInputHash(fixture.request), fixture.request.inputHash);
  assert.deepEqual(publicSpan(segmentBatchGatewaySources(fixture.request.sources)[0]),
    fixture.expectedOutput.items[0].spans[0]);
});

test('Gateway run metadata is bounded and bound by index to exact chunk lineage', () => {
  const fixture = decompositionFixture();
  const chunk = fixture.plan.chunks[0];
  const valid = [{
    chunkId: chunk.chunkId, inputHash: chunk.inputHash,
    provider: 'openai', requestedModel: 'gpt-5.6-terra', responseModel: 'gpt-5.6-terra-2026-07-15',
    promptVersion: 'amc-batch-decomposition-prompt-v1', schemaVersion: 'amc-batch-decomposition-v1',
    usage: { inputTokens: 10, cachedInputTokens: 2, outputTokens: 5, totalTokens: 15, reasoningTokens: 1 }
  }];
  assert.deepEqual(normalizeBatchGatewayRunMetadata(valid, fixture.plan.chunks), valid);
  for (const mutate of [
    (value) => { value[0].inputHash = '0'.repeat(64); },
    (value) => { value[0].requestedModel = 'x'.repeat(129); },
    (value) => { value[0].usage.totalTokens = 16; },
    (value) => { value[0].secret = 'must-not-persist'; }
  ]) {
    const invalid = structuredClone(valid);
    mutate(invalid);
    assert.throws(() => normalizeBatchGatewayRunMetadata(invalid, fixture.plan.chunks),
      (error) => error.code === 'INVALID_GATEWAY_RUN_METADATA');
  }
});

test('trusted code creates deterministic bounded virtual sources without truncating ten worst-case text files', () => {
  const evidence = Array.from({ length: 10 }, (_, index) => {
    const text = `${'\\'.repeat(MAX_TEXT_FILE_BYTES - 4)}😀`;
    return {
      assetId: `${String(index + 1).padStart(8, '0')}-8cb5-49db-8447-d948f1a834a9`,
      position: index + 1, sourceKind: 'TEXT_UPLOAD', normalizedText: text,
      normalizedSha256: batchSha256(text), transcriptConfidence: null
    };
  });
  const left = buildDecompositionPlan(evidence, { correlationId: 'worst-escaped-ten-text-files', questionCatalog });
  const right = buildDecompositionPlan(evidence, { correlationId: 'worst-escaped-ten-text-files', questionCatalog });
  assert.deepEqual(left, right);
  assert.equal(left.totalBytes, 10 * MAX_TEXT_FILE_BYTES);
  for (const item of evidence) {
    assert.equal(left.virtualSources.filter((source) => source.originalAssetId === item.assetId)
      .map((source) => source.content).join(''), item.normalizedText);
  }
  assert.equal(left.virtualSources.every((source) => Buffer.byteLength(source.content) <= MAX_GATEWAY_VIRTUAL_SOURCE_BYTES), true);
  assert.equal(left.chunks.every((chunk) => chunk.sources.length <= MAX_GATEWAY_CHUNK_SOURCES
    && chunk.sources.reduce((sum, source) => sum + Buffer.byteLength(source.content), 0)
      <= MAX_GATEWAY_CHUNK_SOURCE_BYTES), true);
  assert.ok(left.chunks.length > 10);
});

test('decomposition readiness is recomputed from exact durable spans and canonicalized across output order', () => {
  const fixture = decompositionFixture();
  const accepted = validateDecompositionOutputs(fixture.outputs, fixture);
  accepted.items.forEach((item, index) => { item.id = `7132ce28-f359-43e3-936c-c82d704c814${index}`; });
  assert.equal(accepted.ready, false);
  assert.deepEqual(accepted.items.map((item) => item.evidenceText), ['Q1: A because one.', 'Q2: B because two.']);
  assert.equal(accepted.items.every((item) =>
    item.confirmationReasons.includes('MODEL_DERIVED_REQUIRES_CONFIRMATION')), true);

  const reordered = structuredClone(fixture.outputs);
  reordered[0].items.reverse();
  const reorderedAccepted = validateDecompositionOutputs(reordered, fixture);
  assert.equal(reorderedAccepted.extractionHash, accepted.extractionHash);
  assert.deepEqual(reorderedAccepted.items.map((item) => item.itemKey), accepted.items.map((item) => item.itemKey));

  const lowOutputs = structuredClone(fixture.outputs);
  lowOutputs[0].items[0].confidence = 0.899999;
  const low = validateDecompositionOutputs(lowOutputs, fixture);
  assert.equal(low.ready, false);
  assert.ok(low.items[0].confirmationReasons.includes('LOW_CONFIDENCE'));

  const conflictOutputs = structuredClone(fixture.outputs);
  conflictOutputs[0].items[1].candidateQuestionNumbers = [1];
  conflictOutputs[0].items[1].proposedQuestionNumber = 1;
  const conflicted = validateDecompositionOutputs(conflictOutputs, fixture);
  assert.equal(conflicted.ready, false);
  assert.equal(conflicted.items.every((item) => item.confirmationReasons.includes('QUESTION_CONFLICT')), true);
});

test('API rejects forged, missing, duplicate, or unbound spans and exposes unmapped evidence for confirmation', () => {
  const fixture = decompositionFixture();
  const forged = structuredClone(fixture.outputs);
  forged[0].items[0].spans[0].sha256 = '0'.repeat(64);
  assert.throws(() => validateDecompositionOutputs(forged, fixture),
    (error) => error.code === 'INVALID_EVIDENCE_SPAN');

  const missing = structuredClone(fixture.outputs);
  missing[0].items.pop();
  assert.throws(() => validateDecompositionOutputs(missing, fixture),
    (error) => error.code === 'INVALID_EVIDENCE_COVERAGE');

  const unboundPlan = structuredClone(fixture.plan);
  unboundPlan.virtualSources = [];
  assert.throws(() => validateDecompositionOutputs(fixture.outputs, { ...fixture, plan: unboundPlan }),
    (error) => error.code === 'INVALID_EVIDENCE_SPAN');

  const malformedPlan = structuredClone(fixture.plan);
  malformedPlan.chunks[0].sources = null;
  assert.throws(() => validateDecompositionOutputs(fixture.outputs, { ...fixture, plan: malformedPlan }),
    (error) => error.code === 'INVALID_DECOMPOSITION_PLAN');

  const unmapped = structuredClone(fixture.outputs);
  const removed = unmapped[0].items.pop();
  unmapped[0].unmappedSpans.push(removed.spans[0]);
  const result = validateDecompositionOutputs(unmapped, fixture);
  assert.equal(result.ready, false);
  assert.equal(result.items.at(-1).unmapped, true);
  assert.ok(result.items.at(-1).confirmationReasons.includes('QUESTION_UNASSIGNED_OR_AMBIGUOUS'));
});

test('unknown audio transcript confidence is legal input and always forces explicit confirmation', () => {
  const text = 'Question 1 is A after checking the cases.';
  const evidence = [{
    assetId: 'a182f7aa-8cb5-49db-8447-d948f1a834a9', position: 1, sourceKind: 'AUDIO_TRANSCRIPT',
    normalizedText: text, normalizedSha256: batchSha256(text), transcriptConfidence: null
  }];
  const plan = buildDecompositionPlan(evidence, { correlationId: 'audio-unknown-confidence', questionCatalog });
  const result = validateDecompositionOutputs(outputForPlan(plan), { plan, evidence });
  assert.equal(result.ready, false);
  assert.ok(result.items[0].confirmationReasons.includes('TRANSCRIPTION_UNCERTAINTY'));
});

test('more than 8000 bytes of exact evidence cannot be silently truncated into canonical reasoning', () => {
  const text = 'x'.repeat(8192);
  const evidence = [{
    assetId: 'b182f7aa-8cb5-49db-8447-d948f1a834a9', position: 1, sourceKind: 'TEXT_UPLOAD',
    normalizedText: text, normalizedSha256: batchSha256(text), transcriptConfidence: null
  }];
  const plan = buildDecompositionPlan(evidence, { correlationId: 'reasoning-edit-required', questionCatalog });
  const output = outputForPlan(plan, () => null);
  const segments = segmentBatchGatewaySources(plan.chunks[0].sources);
  output[0].items = [{
    itemKey: 'long-reasoning', candidateQuestionNumbers: [1], proposedQuestionNumber: 1,
    answer: 'A', reasoningSummary: 'Long reasoning.', confidence: 0.99, ambiguity: 'NONE',
    spans: segments.map(publicSpan), conflictFlags: [], requiresConfirmation: false
  }];
  const result = validateDecompositionOutputs(output, { plan, evidence });
  assert.equal(result.items[0].evidenceText, text);
  assert.ok(result.items[0].confirmationReasons.includes('REASONING_REQUIRES_EDIT'));
});

test('more than 100 mapped or unmapped evidence items fails with a stable fragmentation error', () => {
  const text = 'z'.repeat((MAX_MAPPING_ITEMS + 1) * 1024);
  const evidence = [{
    assetId: 'c182f7aa-8cb5-49db-8447-d948f1a834a9', position: 1, sourceKind: 'TEXT_UPLOAD',
    normalizedText: text, normalizedSha256: batchSha256(text), transcriptConfidence: null
  }];
  const plan = buildDecompositionPlan(evidence, { correlationId: 'too-many-mapping-items', questionCatalog });
  const outputs = plan.chunks.map((chunk) => ({
    schema: 'amc-batch-decomposition-v1', correlationId: plan.correlationId,
    inputHash: chunk.inputHash, planHash: chunk.planHash, chunkId: chunk.chunkId,
    items: [], unmappedSpans: segmentBatchGatewaySources(chunk.sources).map(publicSpan)
  }));
  assert.throws(() => validateDecompositionOutputs(outputs, { plan, evidence }),
    (error) => error.code === 'DECOMPOSITION_TOO_FRAGMENTED');
});

test('normalized evidence and model summaries reject prohibited C0, replacement, and malformed Unicode', () => {
  for (const invalid of ['bad\u0001text', 'bad\uFFFDtext', 'bad\uD800text']) {
    assert.throws(() => validateNormalizedEvidenceText(invalid), (error) => error.code === 'INVALID_NORMALIZED_EVIDENCE');
  }
  assert.equal(validateNormalizedEvidenceText('line one\nline two\t😀'), 'line one\nline two\t😀');
  const fixture = decompositionFixture();
  fixture.outputs[0].items[0].reasoningSummary = 'bad\uFFFDreasoning';
  assert.throws(() => validateDecompositionOutputs(fixture.outputs, fixture),
    (error) => error.code === 'INVALID_DECOMPOSITION_RESULT');
});

test('student confirmation is a complete canonical decision over every decomposition item', () => {
  const mappingItems = [
    { id: '7132ce28-f359-43e3-936c-c82d704c8140', itemPosition: 2,
      evidenceText: 'exact source evidence', sourceSpans: [{ assetId: 'asset-a', assetPosition: 1,
        segmentId: 'segment-b', startByte: 10, endByte: 31, sha256: 'a'.repeat(64),
        sourceKind: 'TEXT_UPLOAD', sourceConfidence: null }] },
    { id: '7132ce28-f359-43e3-936c-c82d704c8141', itemPosition: 1,
      evidenceText: 'discarded source evidence', sourceSpans: [{ assetId: 'asset-b', assetPosition: 2,
        segmentId: 'segment-a', startByte: 0, endByte: 25, sha256: 'b'.repeat(64),
        sourceKind: 'TEXT_UPLOAD', sourceConfidence: null }] }
  ];
  const confirmed = normalizeMappingConfirmation({
    mappingRevision: 3,
    responses: [{ questionNumber: 2, selectedOption: 'C', reasoningText: 'student correction',
      sourceItemIds: [mappingItems[0].id] }],
    discardedItemIds: [mappingItems[1].id]
  }, { mappingRevision: 3, mappingItems, formQuestionNumbers: [1, 2, 3] });
  assert.equal(confirmed.responses[0].selectedOption, 'C');
  assert.equal(confirmed.responses[0].reasoningOrigin, 'BATCH_CONFIRMATION_EDIT');
  assert.deepEqual(confirmed.discardedItemIds, [mappingItems[1].id]);
  const exact = normalizeMappingConfirmation({
    mappingRevision: 3,
    responses: [{ questionNumber: 2, selectedOption: 'C', reasoningText: 'exact source evidence',
      sourceItemIds: [mappingItems[0].id] }],
    discardedItemIds: [mappingItems[1].id]
  }, { mappingRevision: 3, mappingItems, formQuestionNumbers: [1, 2, 3] });
  assert.equal(exact.responses[0].reasoningOrigin, 'BATCH_CONFIRMED_EVIDENCE');
  assert.match(exact.sourceEvidenceHash, /^[a-f0-9]{64}$/);
  const canonicalOrder = normalizeMappingConfirmation({
    mappingRevision: 3,
    responses: [{
      questionNumber: 2, selectedOption: 'C',
      reasoningText: 'discarded source evidence\nexact source evidence',
      sourceItemIds: [mappingItems[0].id, mappingItems[1].id]
    }],
    discardedItemIds: []
  }, { mappingRevision: 3, mappingItems, formQuestionNumbers: [1, 2, 3] });
  assert.deepEqual(canonicalOrder.responses[0].sourceItemIds,
    [mappingItems[1].id, mappingItems[0].id], 'server orders by persisted itemPosition, not random UUID');
  assert.equal(canonicalOrder.responses[0].reasoningOrigin, 'BATCH_CONFIRMED_EVIDENCE');
  assert.deepEqual(canonicalOrder.responses[0].sourceDescriptors[0].spans.map((span) => span.segmentId),
    ['segment-a']);
  assert.throws(() => normalizeMappingConfirmation({
    mappingRevision: 3,
    responses: [{ questionNumber: 2, selectedOption: 'C', reasoningText: 'x'.repeat(8_001),
      sourceItemIds: [mappingItems[0].id] }],
    discardedItemIds: [mappingItems[1].id]
  }, { mappingRevision: 3, mappingItems, formQuestionNumbers: [1, 2, 3] }),
  (error) => error.code === 'INVALID_MAPPING_CONFIRMATION');
  assert.throws(() => normalizeMappingConfirmation({
    mappingRevision: 3,
    responses: [{ questionNumber: 2, selectedOption: 'C', reasoningText: '', sourceItemIds: [mappingItems[0].id] }],
    discardedItemIds: []
  }, { mappingRevision: 3, mappingItems, formQuestionNumbers: [1, 2, 3] }),
  (error) => error.code === 'INCOMPLETE_MAPPING_CONFIRMATION');
});

test('batch result is mapped-question-only and public candidate projection separates evidence from model summary', () => {
  const scoringForm = structuredClone(form);
  scoringForm.questions[2].isScored = false;
  const result = scoreBatchPractice({ form: scoringForm, responses: [
    { questionNumber: 1, selectedOption: 'A' },
    { questionNumber: 2, selectedOption: null },
    { questionNumber: 3, selectedOption: 'A' }
  ] });
  assert.equal(result.scoringScope, 'MAPPED_QUESTIONS_ONLY');
  assert.equal(result.totalPoints, 7.5);
  assert.equal(result.maximumPoints, 12);
  assert.equal(result.correctCount, 1);
  assert.equal(result.blankCount, 1);
  assert.equal(result.unscoredCount, 1);

  const projection = publicBatchProjection({
    batch: {
      id: 'batch', attemptId: 'attempt', learningSubmissionId: 'learning', baseVersion: 1,
      committedVersionNumber: null, formId: form.id, formVersion: form.version, status: 'NEEDS_CONFIRMATION',
      mappingRevision: 1, deletionGeneration: 0, deletionState: 'ACTIVE',
      createdAt: 'now', updatedAt: 'now', submittedAt: 'now', committedAt: null, deletedAt: null
    },
    assets: [],
    mapping: { revision: 1, status: 'NEEDS_CONFIRMATION', items: [{
      id: 'item', candidateQuestionNumbers: [1], proposedQuestionNumber: 1, selectedOption: 'A',
      evidenceText: 'student exact words', reasoningSummary: 'model summary', confidence: 0.8,
      requiresConfirmation: true, confirmationReasons: ['LOW_CONFIDENCE']
    }] },
    result: null
  });
  assert.equal(projection.mapping.items[0].evidenceText, 'student exact words');
  assert.equal(projection.mapping.items[0].reasoningSummary, 'model summary');
  assert.equal('reasoningText' in projection.mapping.items[0], false);
});
