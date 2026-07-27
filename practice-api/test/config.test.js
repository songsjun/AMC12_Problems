import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

test('loopback proxy is the safe default for the loopback-only listener and can be disabled for direct binding', () => {
  const base = { AMC12_SESSION_SECRET: 'x'.repeat(40), AMC12_AUTH_PEPPER: 'y'.repeat(40) };
  assert.equal(loadConfig(base).trustedProxy, 'loopback');
  assert.equal(loadConfig({ ...base, AMC12_TRUST_PROXY: 'false' }).trustedProxy, false);
  assert.equal(loadConfig({ ...base, AMC12_TRUST_PROXY: '10.0.0.0/8' }).trustedProxy, '10.0.0.0/8');
});

test('test-only import and publish flags are independent and production disables both', () => {
  const base = { AMC12_SESSION_SECRET: 'x'.repeat(40), AMC12_AUTH_PEPPER: 'y'.repeat(40) };
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true' }).allowTestOnlyImport, true);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true' }).allowTestOnlyPublish, false);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_TEST_ONLY_IMPORT: 'true', AMC12_ALLOW_TEST_ONLY_PUBLISH: 'true' }).allowTestOnlyPublish, true);
  const production = loadConfig({
    ...base,
    NODE_ENV: 'production',
    AMC12_ALLOW_TEST_ONLY_IMPORT: 'true',
    AMC12_ALLOW_TEST_ONLY_PUBLISH: 'true'
  });
  assert.equal(production.allowTestOnlyImport, false);
  assert.equal(production.allowTestOnlyPublish, false);
  assert.equal(loadConfig(base).allowGenericManifestImport, false);
  assert.equal(loadConfig({ ...base, AMC12_ALLOW_GENERIC_MANIFEST_IMPORT: 'true' }).allowGenericManifestImport, true);
  assert.equal(loadConfig({ ...base, NODE_ENV: 'production', AMC12_ALLOW_GENERIC_MANIFEST_IMPORT: 'true' }).allowGenericManifestImport, false);
});
