import { createHash } from 'node:crypto';
import { ARCHIVE_RELEASE_BATCH_SCHEMA, ARCHIVE_RELEASE_FORM_IDS, LEGACY_ARCHIVE_RELEASE_FORM_IDS } from '../src/manifest.js';

function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function canonicalHash(value) {
  return createHash('sha256').update(`${canonicalJson(value)}\n`, 'utf8').digest('hex');
}

export function sealArchiveManifest(manifest) {
  const publicProjection = {
    schemaVersion: 'amc-practice-public-form-v1', id: manifest.id, version: manifest.version, title: manifest.title,
    publicationStatus: manifest.publicationStatus, isSynthetic: manifest.isSynthetic, durationSeconds: manifest.durationSeconds,
    scoringPolicyVersion: manifest.scoringPolicyVersion, scoringPolicy: manifest.scoringPolicy,
    questionBundleHash: manifest.questionBundleHash, archiveNotice: manifest.archiveNotice,
    questions: manifest.questions.map(({ number, promptMarkdown, choices, isScored }) => ({ number, promptMarkdown, choices, isScored }))
  };
  publicProjection.contentHash = canonicalHash(publicProjection);
  manifest.contentHash = publicProjection.contentHash;
  delete manifest.manifestHash;
  manifest.manifestHash = canonicalHash(manifest);
  return manifest;
}

/** A hash-valid archive-v1 fixture, suitable for importer contract tests. */
export function archiveManifestFixture({
  year = 2025,
  variant = 'a',
  version = 'archive-r1',
  unscoredQuestionNumber = 25,
  alternativeQuestionNumber = 12
} = {}) {
  const early = year <= 2006;
  const policyVersion = early ? 'amc12-archive-2002-2006-v1' : 'amc12-archive-2007-plus-v1';
  const questions = Array.from({ length: 25 }, (_, index) => {
    const number = index + 1;
    const isScored = number !== unscoredQuestionNumber;
    const hasAlternative = isScored && number === alternativeQuestionNumber;
    const correctOption = isScored ? (hasAlternative ? 'D' : 'A') : null;
    return {
      number,
      sourceRef: { path: `archive/${year}-${variant}/Problem_${String(number).padStart(2, '0')}.md`, sha256: 'a'.repeat(64) },
      promptMarkdown: `Archive question ${number}`,
      choices: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
      correctOption,
      acceptedOptions: isScored ? (hasAlternative ? ['D', 'E'] : [correctOption]) : [],
      isScored,
      solutionMarkdown: `Written solution ${number}`
    };
  });
  const scoredQuestionCount = questions.filter((question) => question.isScored).length;
  const manifest = {
    schemaVersion: 'amc-practice-archive-form-v1',
    id: `amc12-${year}-${variant}`,
    version,
    title: `Archive fixture ${year} ${variant.toUpperCase()}`,
    publicationStatus: 'archive-practice',
    isSynthetic: false,
    durationSeconds: 4500,
    scoringPolicyVersion: policyVersion,
    scoringPolicy: {
      version: policyVersion,
      correct: 6,
      blank: early ? 2.5 : 1.5,
      incorrect: 0,
      questionCount: 25,
      scoredQuestionCount,
      maxScore: 6 * scoredQuestionCount
    },
    questionBundleHash: 'b'.repeat(64),
    archiveNotice: 'Archive-practice score.',
    questions,
    provenance: {
      releaseAuthorization: {
        status: 'authorized-archive-practice', authorizedBy: 'test', authorizedAt: '2026-07-27', evidence: 'test fixture'
      },
      answerKey: {
        catalogHash: 'c'.repeat(64),
        catalogSchemaVersion: 'amc-practice-historical-answer-keys-v1',
        sourceUrl: 'https://example.test/source',
        canonicalAnswerKeyUrl: 'https://example.test/key'
      },
      media: {
        manifestSchemaVersion: 'amc12-historical-media-v1',
        manifestSha256: 'd'.repeat(64),
        assetIds: []
      },
      sourceRepairs: []
    }
  };
  return sealArchiveManifest(manifest);
}

/** Exact production-shaped legacy/extended release, without a database. */
export function archiveReleaseFixture({ version = 'archive-r1', include2026 = false } = {}) {
  return {
    schemaVersion: ARCHIVE_RELEASE_BATCH_SCHEMA,
    forms: (include2026 ? ARCHIVE_RELEASE_FORM_IDS : LEGACY_ARCHIVE_RELEASE_FORM_IDS).map((id) => {
      const [, yearText, variant] = /^amc12-(\d{4})-([ab])$/.exec(id);
      const year = Number(yearText);
      return archiveManifestFixture({
        year,
        variant,
        version,
        unscoredQuestionNumber: year === 2025 && variant === 'a' ? 25 : null,
        alternativeQuestionNumber: year === 2012 && variant === 'b' ? 12 : null
      });
    })
  };
}
