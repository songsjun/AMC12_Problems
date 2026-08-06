import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

test('loopback proxy is the safe default for the loopback-only listener and can be disabled for direct binding', () => {
  const base = { AMC12_SESSION_SECRET: 'x'.repeat(40), AMC12_AUTH_PEPPER: 'y'.repeat(40) };
  assert.equal(loadConfig(base).trustedProxy, 'loopback');
  assert.equal(loadConfig({ ...base, AMC12_TRUST_PROXY: 'false' }).trustedProxy, false);
  assert.equal(loadConfig({ ...base, AMC12_TRUST_PROXY: '10.0.0.0/8' }).trustedProxy, '10.0.0.0/8');
  assert.equal(loadConfig(base).reasoningWritesPerMinute, 30);
  assert.equal(loadConfig(base).reanalysisEnabled, false);
  assert.equal(loadConfig(base).reanalysisPerStudentPerDay, 10);
  assert.equal(loadConfig(base).reanalysisGlobalPerDay, 1_000);
  assert.equal(loadConfig(base).reanalysisMaxVersions, 25);
  assert.equal(loadConfig({ ...base, AMC12_REANALYSIS_ENABLED: 'true' }).reanalysisEnabled, true);
  assert.equal(loadConfig({ ...base, AMC12_REANALYSIS_ENABLED: 'TRUE' }).reanalysisEnabled, false);
  assert.equal(loadConfig(base).tutorEnabled, false);
  assert.equal(loadConfig({ ...base, AMC12_TUTOR_ENABLED: 'true' }).tutorEnabled, true);
  assert.equal(loadConfig(base).batchIntakeEnabled, false);
  assert.equal(loadConfig(base).batchReviewEnabled, false);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_INTAKE_ENABLED: 'true' }).batchIntakeEnabled, true);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_REVIEW_ENABLED: 'true' }).batchReviewEnabled, true);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_REVIEW_ENABLED: 'TRUE' }).batchReviewEnabled, false);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_INTAKE_ENABLED: 'TRUE' }).batchIntakeEnabled, false);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_INTAKE_ENABLED: '1' }).batchIntakeEnabled, false);
  assert.equal(loadConfig(base).studentRequestsPerMinute, 120);
  assert.equal(loadConfig(base).batchUploadBytesPerHour, 250 * 1024 * 1024);
  assert.equal(loadConfig(base).batchProviderWorkPerDay, 30);
  assert.equal(loadConfig(base).batchProviderAudioBytesPerDay, 250 * 1024 * 1024);
  assert.equal(loadConfig(base).batchGlobalProviderWorkPerDay, 1_000);
  assert.equal(loadConfig(base).batchGlobalProviderAudioBytesPerDay, 10 * 1024 * 1024 * 1024);
  assert.equal(loadConfig({ ...base, AMC12_REASONING_WRITES_PER_MINUTE: '12' }).reasoningWritesPerMinute, 12);
  assert.equal(loadConfig({ ...base, AMC12_REANALYSIS_PER_STUDENT_PER_DAY: '4' }).reanalysisPerStudentPerDay, 4);
  assert.equal(loadConfig({ ...base, AMC12_REANALYSIS_GLOBAL_PER_DAY: '40' }).reanalysisGlobalPerDay, 40);
  assert.equal(loadConfig({ ...base, AMC12_REANALYSIS_MAX_VERSIONS: '8' }).reanalysisMaxVersions, 8);
  assert.equal(loadConfig({ ...base, AMC12_STUDENT_REQUESTS_PER_MINUTE: '7' }).studentRequestsPerMinute, 7);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_UPLOAD_BYTES_PER_HOUR: '1234' }).batchUploadBytesPerHour, 1234);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_PROVIDER_WORK_PER_DAY: '9' }).batchProviderWorkPerDay, 9);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_PROVIDER_AUDIO_BYTES_PER_DAY: '5678' }).batchProviderAudioBytesPerDay, 5678);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_GLOBAL_PROVIDER_WORK_PER_DAY: '44' }).batchGlobalProviderWorkPerDay, 44);
  assert.equal(loadConfig({ ...base, AMC12_BATCH_GLOBAL_PROVIDER_AUDIO_BYTES_PER_DAY: '9876' }).batchGlobalProviderAudioBytesPerDay, 9876);
  assert.throws(() => loadConfig({ ...base, AMC12_REASONING_WRITES_PER_MINUTE: '0' }), /positive integer/);
  assert.throws(() => loadConfig({ ...base, AMC12_STUDENT_REQUESTS_PER_MINUTE: '0' }), /positive integer/);
});

test('test-only import and publish flags are independent and production disables both', () => {
  const base = { AMC12_SESSION_SECRET: 'x'.repeat(40), AMC12_AUTH_PEPPER: 'y'.repeat(40) };
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true' }).allowTestOnlyImport, true);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true' }).allowTestOnlyPublish, false);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true', AMC12_ALLOW_TEST_ONLY_PUBLISH: 'true' }).allowTestOnlyPublish, true);
  const production = loadConfig({
    ...base,
    NODE_ENV: 'production',
    AMC12_PRIVATE_UPLOAD_ROOT: '/var/lib/amc12-private',
    AMC12_ALLOW_TEST_ONLY_IMPORT: 'true',
    AMC12_ALLOW_TEST_ONLY_PUBLISH: 'true'
  });
  assert.equal(production.allowTestOnlyImport, false);
  assert.equal(production.allowTestOnlyPublish, false);
  assert.equal(production.batchIntakeEnabled, false);
  assert.equal(production.batchReviewEnabled, false);
  assert.equal(loadConfig({
    ...base,
    NODE_ENV: 'production',
    AMC12_PRIVATE_UPLOAD_ROOT: '/var/lib/amc12-private',
    AMC12_BATCH_INTAKE_ENABLED: 'true'
  }).batchIntakeEnabled, true);
  assert.equal(loadConfig(base).allowGenericManifestImport, false);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_GENERIC_MANIFEST_IMPORT: 'true' }).allowGenericManifestImport, true);
  assert.equal(loadConfig({
    ...base, NODE_ENV: 'production', AMC12_PRIVATE_UPLOAD_ROOT: '/var/lib/amc12-private',
    AMC12_ALLOW_GENERIC_MANIFEST_IMPORT: 'true'
  }).allowGenericManifestImport, false);
  assert.throws(() => loadConfig({ ...base, NODE_ENV: 'production' }), /AMC12_PRIVATE_UPLOAD_ROOT/);
});
