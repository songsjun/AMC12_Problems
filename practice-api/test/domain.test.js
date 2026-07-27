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
