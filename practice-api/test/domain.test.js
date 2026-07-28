import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASES, scoreSubmission, publicForm } from '../src/domain.js';
import { normalizeManifest } from '../src/manifest.js';
import { fixtureManifest } from './helpers.js';

test('legacy policy scoring snapshots every answer including blanks', () => {
  const form = normalizeManifest(fixtureManifest);
  const result = scoreSubmission({
    form,
    answers: [
      { questionNumber: 1, selectedOption: 'A' },
      { questionNumber: 2, selectedOption: 'E' },
      { questionNumber: 3, selectedOption: null }
    ],
    activeElapsedMs: 1234
  });
  assert.equal(result.totalPoints, 7.5);
  assert.equal(result.correctCount, 1);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.blankCount, 1);
  assert.deepEqual(result.snapshots.map((item) => item.points), [6, 0, 1.5]);
  assert.deepEqual(result.snapshots.map((item) => item.correctOption), ['A', 'B', 'C']);
});

test('public form projection never contains answer-key or solution fields', () => {
  const form = normalizeManifest(fixtureManifest);
  const response = JSON.stringify(publicForm(form));
  assert.equal(response.includes('correctOption'), false);
  assert.equal(response.includes('acceptedOptions'), false);
  assert.equal(response.includes('solutionMarkdown'), false);
  assert.equal(response.includes('Fixture solution'), false);
});

test('synthetic/test-only manifests are normalized as test-only and default policy is versioned', () => {
  const synthetic = normalizeManifest({ ...fixtureManifest, id: 'synthetic', isSynthetic: true, scoringPolicy: undefined });
  assert.equal(synthetic.testOnly, true);
  assert.deepEqual(synthetic.scoringPolicy, {
    id: 'amc-legacy', version: '1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0
  });
  assert.notEqual(PHASES.TIMED, PHASES.FINALIZED);
});

test('archive scoring preserves accepted alternatives and excludes documented unscored items', () => {
  const form = {
    scoringPolicy: { id: 'archive-test', version: '1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0 },
    questions: [
      { number: 1, correctOption: 'D', acceptedOptions: ['D', 'E'], isScored: true },
      { number: 2, correctOption: null, acceptedOptions: [], isScored: false },
      { number: 3, correctOption: 'A', acceptedOptions: ['A'], isScored: true }
    ]
  };
  const result = scoreSubmission({
    form,
    answers: [
      { questionNumber: 1, selectedOption: 'E' },
      { questionNumber: 2, selectedOption: 'C' },
      { questionNumber: 3, selectedOption: null }
    ],
    activeElapsedMs: 1
  });
  assert.equal(result.totalPoints, 7.5);
  assert.equal(result.maximumPoints, 12);
  assert.equal(result.correctCount, 1);
  assert.equal(result.blankCount, 1);
  assert.equal(result.unscoredCount, 1);
  assert.deepEqual(result.snapshots.map((item) => item.isScored), [true, false, true]);
  assert.equal(result.snapshots[1].isCorrect, null);
  assert.equal(result.snapshots[1].points, 0);
});

test('historical archive blank scoring preserves the 2002-2006 policy boundary', () => {
  const questions = Array.from({ length: 25 }, (_, index) => ({
    number: index + 1, correctOption: 'A', acceptedOptions: ['A'], isScored: true
  }));
  const early = scoreSubmission({
    form: {
      scoringPolicy: { id: 'amc12-archive-2002-2006-v1', version: 'amc12-archive-2002-2006-v1', correctPoints: 6, blankPoints: 2.5, incorrectPoints: 0 },
      questions
    },
    answers: [], activeElapsedMs: 0
  });
  const later = scoreSubmission({
    form: {
      scoringPolicy: { id: 'amc12-archive-2007-plus-v1', version: 'amc12-archive-2007-plus-v1', correctPoints: 6, blankPoints: 1.5, incorrectPoints: 0 },
      questions
    },
    answers: [], activeElapsedMs: 0
  });
  assert.equal(early.totalPoints, 62.5);
  assert.equal(later.totalPoints, 37.5);
  assert.equal(early.maximumPoints, 150);
  assert.equal(later.maximumPoints, 150);
});
