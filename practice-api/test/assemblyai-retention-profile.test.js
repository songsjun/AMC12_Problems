import assert from 'node:assert/strict';
import test from 'node:test';
import {
  loadAssemblyAiRetentionProfile, providerRetentionNotBefore
} from '../src/infrastructure/assemblyai-retention-profile.js';

const verifiedEnv = {
  AMC12_ASSEMBLYAI_RETENTION_PROFILE: 'CONFIGURED_TTL',
  AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED: 'true',
  AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS: '72',
  AMC12_ASSEMBLYAI_RETENTION_PROCESSING_SLACK_HOURS: '96'
};

test('retention profile is explicit and fail-closed', () => {
  for (const removed of Object.keys(verifiedEnv)) {
    const env = { ...verifiedEnv };
    delete env[removed];
    assert.throws(
      () => loadAssemblyAiRetentionProfile(env, { uploadRequestMaxDurationMs: 180_000 }),
      /AMC12_ASSEMBLYAI_RETENTION/
    );
  }
  assert.throws(
    () => loadAssemblyAiRetentionProfile({
      ...verifiedEnv, AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED: 'false'
    }, { uploadRequestMaxDurationMs: 180_000 }),
    /must explicitly attest/
  );
  for (const [name, hours] of [['NO_TTL_OR_BAA', '47'], ['BAA_DEFAULT', '71']]) {
    assert.throws(() => loadAssemblyAiRetentionProfile({
      ...verifiedEnv,
      AMC12_ASSEMBLYAI_RETENTION_PROFILE: name,
      AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS: hours
    }, { uploadRequestMaxDurationMs: 180_000 }), /must be at least/);
  }
});

test('not-before includes the full request duration, policy delay, and explicit processing slack', () => {
  const profile = loadAssemblyAiRetentionProfile(verifiedEnv, {
    uploadRequestMaxDurationMs: 180_000
  });
  const startedAt = new Date('2026-08-01T12:00:00.000Z');
  const notBefore = providerRetentionNotBefore(startedAt, profile);
  assert.equal(notBefore.toISOString(), '2026-08-08T12:03:00.000Z');
  assert.ok(notBefore.getTime() > startedAt.getTime() + 72 * 60 * 60 * 1_000,
    '72 hours alone is never enough to reach the retention gate');
});
