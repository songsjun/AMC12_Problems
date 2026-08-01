import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

const LOCAL_DEVELOPMENT_SECRET = 'development-only-amc12-practice-secret-change-before-deploy';

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function positiveInteger(value, fallback, name) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

function trustedProxy(value) {
  if (value === undefined || value === '') return 'loopback';
  if (['0', 'false', 'off', 'no'].includes(String(value).toLowerCase())) return false;
  return value;
}

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const sessionSecret = env.AMC12_SESSION_SECRET || (production ? '' : LOCAL_DEVELOPMENT_SECRET);
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('AMC12_SESSION_SECRET must contain at least 32 characters outside local development.');
  }
  const authPepper = env.AMC12_AUTH_PEPPER || sessionSecret;
  if (authPepper.length < 32) throw new Error('AMC12_AUTH_PEPPER must contain at least 32 characters.');
  const sessionHours = positiveInteger(env.AMC12_SESSION_HOURS, 12, 'AMC12_SESSION_HOURS');
  const privateUploadRoot = env.AMC12_PRIVATE_UPLOAD_ROOT
    ? resolve(env.AMC12_PRIVATE_UPLOAD_ROOT) : null;
  if (production && !privateUploadRoot) {
    throw new Error('AMC12_PRIVATE_UPLOAD_ROOT is required in production.');
  }
  return {
    host: env.AMC12_HOST || '127.0.0.1',
    port: positiveInteger(env.AMC12_PORT, 8090, 'AMC12_PORT'),
    basePath: '/api/amc12',
    databaseUrl: env.AMC12_DATABASE_URL,
    nodeEnv: env.NODE_ENV || 'development',
    production,
    sessionSecret,
    authPepper,
    sessionHours,
    sessionTtlMs: sessionHours * 60 * 60 * 1000,
    secureCookies: bool(env.AMC12_SECURE_COOKIES, production),
    // The default listener is loopback-only behind workspace nginx. Nginx must
    // overwrite X-Forwarded-For; a public direct bind must set this to false.
    trustedProxy: trustedProxy(env.AMC12_TRUST_PROXY),
    corsOrigin: env.AMC12_CORS_ORIGIN || null,
    deadlinePollMs: positiveInteger(env.AMC12_DEADLINE_POLL_MS, 5_000, 'AMC12_DEADLINE_POLL_MS'),
    bodyLimit: positiveInteger(env.AMC12_BODY_LIMIT, 64 * 1024, 'AMC12_BODY_LIMIT'),
    reasoningWritesPerMinute: positiveInteger(
      env.AMC12_REASONING_WRITES_PER_MINUTE, 30, 'AMC12_REASONING_WRITES_PER_MINUTE'
    ),
    studentRequestsPerMinute: positiveInteger(
      env.AMC12_STUDENT_REQUESTS_PER_MINUTE, 120, 'AMC12_STUDENT_REQUESTS_PER_MINUTE'
    ),
    privateUploadRoot,
    privateMinimumFreeBytes: positiveInteger(
      env.AMC12_PRIVATE_MINIMUM_FREE_BYTES, 512 * 1024 * 1024, 'AMC12_PRIVATE_MINIMUM_FREE_BYTES'
    ),
    batchStudentQuotaBytes: positiveInteger(
      env.AMC12_BATCH_STUDENT_QUOTA_BYTES, 250 * 1024 * 1024, 'AMC12_BATCH_STUDENT_QUOTA_BYTES'
    ),
    batchGlobalQuotaBytes: positiveInteger(
      env.AMC12_BATCH_GLOBAL_QUOTA_BYTES, 10 * 1024 * 1024 * 1024, 'AMC12_BATCH_GLOBAL_QUOTA_BYTES'
    ),
    batchActiveLimit: positiveInteger(env.AMC12_BATCH_ACTIVE_LIMIT, 3, 'AMC12_BATCH_ACTIVE_LIMIT'),
    batchUploadBytesPerHour: positiveInteger(
      env.AMC12_BATCH_UPLOAD_BYTES_PER_HOUR, 250 * 1024 * 1024,
      'AMC12_BATCH_UPLOAD_BYTES_PER_HOUR'
    ),
    batchProviderWorkPerDay: positiveInteger(
      env.AMC12_BATCH_PROVIDER_WORK_PER_DAY, 30, 'AMC12_BATCH_PROVIDER_WORK_PER_DAY'
    ),
    batchProviderAudioBytesPerDay: positiveInteger(
      env.AMC12_BATCH_PROVIDER_AUDIO_BYTES_PER_DAY, 250 * 1024 * 1024,
      'AMC12_BATCH_PROVIDER_AUDIO_BYTES_PER_DAY'
    ),
    batchGlobalProviderWorkPerDay: positiveInteger(
      env.AMC12_BATCH_GLOBAL_PROVIDER_WORK_PER_DAY, 1_000,
      'AMC12_BATCH_GLOBAL_PROVIDER_WORK_PER_DAY'
    ),
    batchGlobalProviderAudioBytesPerDay: positiveInteger(
      env.AMC12_BATCH_GLOBAL_PROVIDER_AUDIO_BYTES_PER_DAY, 10 * 1024 * 1024 * 1024,
      'AMC12_BATCH_GLOBAL_PROVIDER_AUDIO_BYTES_PER_DAY'
    ),
    developmentAccessCode: production ? null : env.AMC12_DEV_ACCESS_CODE || null,
    developmentStudentName: env.AMC12_DEV_STUDENT_NAME || 'Local student',
    allowTestOnlyImport: !production && bool(env.AMC12_ALLOW_TEST_ONLY_IMPORT, false),
    allowTestOnlyPublish: !production
      && bool(env.AMC12_ALLOW_TEST_ONLY_IMPORT, false)
      && bool(env.AMC12_ALLOW_TEST_ONLY_PUBLISH, false),
    // Generic manifests exist only for local adapter tests and deliberate
    // development experiments. Production content must pass through the
    // reviewed private-v1 pipeline and its canonical hash/approval checks.
    allowGenericManifestImport: !production && bool(env.AMC12_ALLOW_GENERIC_MANIFEST_IMPORT, false),
    cookieName: env.AMC12_SESSION_COOKIE_NAME || 'amc_session',
    csrfCookieName: env.AMC12_CSRF_COOKIE_NAME || 'amc_csrf',
    cookiePath: '/api/amc12'
  };
}

export function newOpaqueToken() {
  return randomBytes(32).toString('base64url');
}
