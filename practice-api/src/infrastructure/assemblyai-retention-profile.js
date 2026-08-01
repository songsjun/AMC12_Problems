const PROFILE_NAMES = new Set(['CONFIGURED_TTL', 'BAA_DEFAULT', 'NO_TTL_OR_BAA']);

function requiredInteger(env, name, minimum, maximum) {
  const raw = env[name];
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    throw new Error(`${name} must be explicitly configured as an integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} is outside the supported range.`);
  }
  return value;
}

/**
 * Parses the operator-attested AssemblyAI retention contract used by the
 * prerecorded-audio worker. This is deliberately fail-closed: an API key is
 * not enough authority to upload student audio.
 */
export function loadAssemblyAiRetentionProfile(env, { uploadRequestMaxDurationMs }) {
  const name = env.AMC12_ASSEMBLYAI_RETENTION_PROFILE;
  if (!PROFILE_NAMES.has(name)) {
    throw new Error(
      'AMC12_ASSEMBLYAI_RETENTION_PROFILE must be CONFIGURED_TTL, BAA_DEFAULT, or NO_TTL_OR_BAA.'
    );
  }
  if (!['1', 'true', 'yes', 'on'].includes(
    String(env.AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED || '').toLowerCase()
  )) {
    throw new Error('AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED must explicitly attest the deployed profile.');
  }
  if (!Number.isSafeInteger(uploadRequestMaxDurationMs) || uploadRequestMaxDurationMs < 1_000) {
    throw new Error('AssemblyAI upload request maximum duration is invalid.');
  }
  const policyDelayHours = requiredInteger(
    env, 'AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS', 1, 24 * 365
  );
  const minimumPolicyHours = name === 'NO_TTL_OR_BAA' ? 48 : name === 'BAA_DEFAULT' ? 72 : 1;
  if (policyDelayHours < minimumPolicyHours) {
    throw new Error(
      `AMC12_ASSEMBLYAI_RETENTION_POLICY_HOURS must be at least ${minimumPolicyHours} for ${name}.`
    );
  }
  const processingSlackHours = requiredInteger(
    env, 'AMC12_ASSEMBLYAI_RETENTION_PROCESSING_SLACK_HOURS', 1, 24 * 30
  );
  return Object.freeze({
    name,
    policyDelayMs: policyDelayHours * 60 * 60 * 1_000,
    uploadRequestMaxDurationMs,
    processingSlackMs: processingSlackHours * 60 * 60 * 1_000
  });
}

export function providerRetentionNotBefore(startedAt, profile) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())
      || !profile || !PROFILE_NAMES.has(profile.name)
      || !Number.isSafeInteger(profile.policyDelayMs) || profile.policyDelayMs < 1
      || !Number.isSafeInteger(profile.uploadRequestMaxDurationMs)
      || profile.uploadRequestMaxDurationMs < 1_000
      || !Number.isSafeInteger(profile.processingSlackMs) || profile.processingSlackMs < 1) {
    throw new Error('Verified AssemblyAI retention profile is required before upload.');
  }
  return new Date(startedAt.getTime() + profile.uploadRequestMaxDurationMs
    + profile.policyDelayMs + profile.processingSlackMs);
}

export const _test = { PROFILE_NAMES };
