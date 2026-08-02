import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_PRIORITY_STARVATION_MAX_WAIT_MS,
  compareAiWorkWithinKind
} from '../src/ai-work-policy.js';

const now = new Date('2026-08-01T12:10:00.000Z');

function item(id, { priority, readyAgoMs, createdAgoMs = readyAgoMs }) {
  return {
    id, priority,
    availableAt: new Date(now.getTime() - readyAgoMs),
    createdAt: new Date(now.getTime() - createdAgoMs)
  };
}

test('class-local scheduling preserves priority inside the normal latency window', () => {
  const low = item('low', { priority: 40, readyAgoMs: 10_000 });
  const high = item('high', { priority: 50, readyAgoMs: 1_000 });
  assert.ok(compareAiWorkWithinKind(high, low, now) < 0);
});

test('an overdue low-priority item outranks a continuous fresh high-priority arrival', () => {
  const overdue = item('overdue', {
    priority: 40, readyAgoMs: AI_PRIORITY_STARVATION_MAX_WAIT_MS
  });
  const fresh = item('fresh', { priority: 50, readyAgoMs: 1_000 });
  assert.ok(compareAiWorkWithinKind(overdue, fresh, now) < 0);
});

test('overdue FIFO uses creation time before priority when readiness ties', () => {
  const olderLow = item('older-low', {
    priority: 40, readyAgoMs: AI_PRIORITY_STARVATION_MAX_WAIT_MS,
    createdAgoMs: AI_PRIORITY_STARVATION_MAX_WAIT_MS + 10_000
  });
  const newerHigh = item('newer-high', {
    priority: 50, readyAgoMs: AI_PRIORITY_STARVATION_MAX_WAIT_MS,
    createdAgoMs: AI_PRIORITY_STARVATION_MAX_WAIT_MS + 5_000
  });
  assert.ok(compareAiWorkWithinKind(olderLow, newerHigh, now) < 0);
});
