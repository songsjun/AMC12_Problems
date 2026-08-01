import { buildApp } from '../src/app.js';
import { MemoryStore } from '../src/memory-store.js';
import { PracticeService } from '../src/service.js';

export class FakeClock {
  constructor(value = '2026-01-02T03:04:05.000Z') {
    this.value = new Date(value);
  }

  now = () => new Date(this.value);

  advance(milliseconds) {
    this.value = new Date(this.value.getTime() + milliseconds);
    return this.now();
  }
}

export const fixtureManifest = {
  id: 'fixture-amc12a',
  version: '2026-test-1',
  title: 'Fixture AMC 12A',
  published: true,
  durationMinutes: 75,
  scoringPolicy: {
    id: 'amc-legacy',
    version: '1',
    correctPoints: 6,
    blankPoints: 1.5,
    incorrectPoints: 0
  },
  questions: [
    {
      number: 1,
      promptMarkdown: 'Fixture prompt one',
      choices: { A: 'one A', B: 'one B', C: 'one C', D: 'one D', E: 'one E' },
      correctOption: 'A',
      solutionMarkdown: 'Fixture solution one'
    },
    {
      number: 2,
      promptMarkdown: 'Fixture prompt two',
      choices: { A: 'two A', B: 'two B', C: 'two C', D: 'two D', E: 'two E' },
      correctOption: 'B',
      solutionMarkdown: 'Fixture solution two'
    },
    {
      number: 3,
      promptMarkdown: 'Fixture prompt three',
      choices: { A: 'three A', B: 'three B', C: 'three C', D: 'three D', E: 'three E' },
      correctOption: 'C',
      solutionMarkdown: 'Fixture solution three'
    }
  ]
};

export async function makeService({
  clock = new FakeClock(),
  manifest = fixtureManifest,
  allowTestOnlyImport = false,
  allowTestOnlyPublish = false,
  // Generic test fixtures are deliberately opt-in at the service boundary;
  // this helper makes that intent explicit for non-production unit tests.
  allowGenericManifestImport = true
} = {}) {
  const store = new MemoryStore();
  const service = new PracticeService({
    store,
    authPepper: 'test-pepper-that-is-long-enough-for-a-safe-local-test-suite',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    allowTestOnlyImport,
    allowTestOnlyPublish,
    allowGenericManifestImport,
    clock: clock.now
  });
  await service.importManifest(manifest, { publish: true });
  const student = await service.seedAccessCode({ code: 'student-access-code', displayName: 'Student One' });
  return { store, service, clock, student };
}

export async function makeApp(options = {}) {
  const context = await makeService(options);
  const config = {
    basePath: '/api/amc12',
    bodyLimit: 64 * 1024,
    sessionSecret: 'test-cookie-secret-that-is-long-enough-for-cookie-signing',
    sessionTtlMs: 12 * 60 * 60 * 1000,
    cookieName: 'amc_session',
    csrfCookieName: 'amc_csrf',
    cookiePath: '/api/amc12',
    secureCookies: false,
    trustedProxy: 'loopback',
    corsOrigin: null,
    reasoningWritesPerMinute: options.reasoningWritesPerMinute
  };
  const app = await buildApp({ service: context.service, config, logger: false });
  return { ...context, app, config };
}

export function cookiesFromResponse(response) {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values]).map((value) => value.split(';')[0]).join('; ');
}
