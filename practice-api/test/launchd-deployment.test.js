import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(TEST_DIR, '../..');
const LAUNCHD_DIR = join(REPOSITORY_ROOT, 'deploy/launchd');
const API_PLIST_PATH = join(LAUNCHD_DIR, 'com.kapy.education.amc12-practice-api.plist');
const WORKER_PLIST_PATH = join(LAUNCHD_DIR, 'com.kapy.education.amc12-learning-worker.plist');
const NEWSYSLOG_PROFILE_PATH = join(LAUNCHD_DIR, 'newsyslog-amc12-learning-worker.conf.example');
const README_PATH = join(LAUNCHD_DIR, 'README.md');
const EXPECTED_NODE = '/Users/ss/.nvm/versions/node/v24.14.0/bin/node';
const EXPECTED_WORKING_DIRECTORY =
  '/Users/ss/Workspaces/education/AMC12_Problems/practice-api';

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function parserResult(path) {
  const plutil = run('plutil', ['-convert', 'json', '-o', '-', '--', path]);
  if (!plutil.error && plutil.status === 0) return plutil;
  const python = run('python3', [
    '-c',
    'import json, plistlib, sys; print(json.dumps(plistlib.load(open(sys.argv[1], "rb"))))',
    path
  ]);
  if (!python.error && python.status === 0) return python;
  assert.fail(`no strict plist parser succeeded:\nplutil: ${plutil.stderr}\npython3: ${python.stderr}`);
}

function parsePlist(path) {
  const parsed = JSON.parse(parserResult(path).stdout);
  assert.equal(Object.getPrototypeOf(parsed), Object.prototype);
  return parsed;
}

function assertSupervisedUnit(plist, { label, processType, minimumThrottle, exitTimeOut }) {
  assert.equal(plist.Label, label);
  assert.equal(plist.RunAtLoad, true);
  assert.equal(plist.KeepAlive, true);
  assert.ok(Number.isInteger(plist.ThrottleInterval));
  assert.ok(plist.ThrottleInterval >= minimumThrottle);
  assert.equal(plist.ExitTimeOut, exitTimeOut);
  assert.equal(plist.ProcessType, processType);
  assert.equal(plist.Umask, 63, 'decimal 63 is the required octal 077 umask');
  assert.equal(plist.UserName, 'ss');
  assert.equal(plist.WorkingDirectory, EXPECTED_WORKING_DIRECTORY);
  assert.equal(plist.EnvironmentVariables.NODE_ENV, 'production');
  assert.match(plist.EnvironmentVariables.PATH, /^\/Users\/ss\/.nvm\/versions\/node\/v24\.14\.0\/bin:/);
}

test('launchd plists pass plutil lint when plutil is available', (t) => {
  const probe = run('plutil', ['-help']);
  if (probe.error?.code === 'ENOENT') {
    t.skip('plutil is unavailable on this non-macOS test host');
    return;
  }
  for (const path of [API_PLIST_PATH, WORKER_PLIST_PATH]) {
    const lint = run('plutil', ['-lint', '--', path]);
    assert.equal(lint.status, 0, `${path}: ${lint.stderr || lint.stdout}`);
  }
});

test('API and worker plists parse strictly and define independently supervised units', () => {
  const api = parsePlist(API_PLIST_PATH);
  const worker = parsePlist(WORKER_PLIST_PATH);
  assertSupervisedUnit(api, {
    label: 'com.kapy.education.amc12-practice-api', processType: 'Interactive',
    minimumThrottle: 10, exitTimeOut: 30
  });
  assertSupervisedUnit(worker, {
    label: 'com.kapy.education.amc12-learning-worker', processType: 'Background',
    minimumThrottle: 30, exitTimeOut: 240
  });
  assert.deepEqual(api.ProgramArguments, [
    EXPECTED_NODE,
    '--env-file=/etc/kapy/amc12-practice.env',
    `${EXPECTED_WORKING_DIRECTORY}/src/server.js`
  ]);
  assert.deepEqual(worker.ProgramArguments, [
    EXPECTED_NODE,
    '--env-file=/etc/kapy/amc12-learning-worker.env',
    `${EXPECTED_WORKING_DIRECTORY}/src/learning-review/worker-main.js`
  ]);
  assert.notEqual(api.ProgramArguments[1], worker.ProgramArguments[1]);
  assert.notEqual(api.ProgramArguments[2], worker.ProgramArguments[2]);
  assert.deepEqual([api.StandardOutPath, api.StandardErrorPath], [
    '/var/log/kapy/amc12-practice-api.stdout.log',
    '/var/log/kapy/amc12-practice-api.stderr.log'
  ]);
  assert.deepEqual([worker.StandardOutPath, worker.StandardErrorPath], [
    '/var/log/kapy/amc12-learning-worker.stdout.log',
    '/var/log/kapy/amc12-learning-worker.stderr.log'
  ]);
  assert.notEqual(api.StandardOutPath, worker.StandardOutPath);
  assert.notEqual(api.StandardErrorPath, worker.StandardErrorPath);
});

test('API plist has no provider configuration and neither plist embeds secret-shaped values', async () => {
  const apiText = await readFile(API_PLIST_PATH, 'utf8');
  const workerText = await readFile(WORKER_PLIST_PATH, 'utf8');
  const api = parsePlist(API_PLIST_PATH);
  const worker = parsePlist(WORKER_PLIST_PATH);
  const forbiddenApiNames = [
    'AMC12_ASSEMBLYAI_API_KEY', 'AMC12_INFERENCE_TOKEN',
    'AMC12_INFERENCE_ORIGIN', 'OPENAI_API_KEY'
  ];
  for (const name of forbiddenApiNames) {
    assert.equal(Object.hasOwn(api.EnvironmentVariables, name), false, `${name} leaked into API environment`);
  }
  assert.deepEqual(Object.keys(worker.EnvironmentVariables).sort(), ['NODE_ENV', 'PATH']);
  for (const text of [apiText, workerText]) {
    assert.doesNotMatch(text, /<key>(?:AMC12_(?:ASSEMBLYAI_API_KEY|INFERENCE_TOKEN|DATABASE_URL|AUTH_PEPPER|SESSION_SECRET)|OPENAI_API_KEY)<\/key>/);
    assert.doesNotMatch(text, /<string>[a-f0-9]{32,}<\/string>/i);
    assert.doesNotMatch(text, /<string>(?:sk-|Bearer\s+)[A-Za-z0-9._-]{16,}<\/string>/);
  }
});

test('fixed paths exist and worker exposes its bounded cooperative shutdown steps', async () => {
  const api = parsePlist(API_PLIST_PATH);
  const worker = parsePlist(WORKER_PLIST_PATH);
  await access(EXPECTED_NODE, constants.X_OK);
  await access(api.WorkingDirectory, constants.R_OK);
  await access(api.ProgramArguments.at(-1), constants.R_OK);
  await access(worker.ProgramArguments.at(-1), constants.R_OK);
  const workerSource = await readFile(worker.ProgramArguments.at(-1), 'utf8');
  assert.match(workerSource, /process\.once\('SIGTERM'/);
  assert.match(workerSource, /providerAbort\.abort\(\)/);
  assert.match(workerSource, /await dispatcher\.drain\(\)/);
  assert.match(workerSource, /await store\.close\(\)/);
  assert.match(workerSource, /boolean\('AMC12_TUTOR_ENABLED', false\)/);
  assert.match(workerSource, /AMC12_INFERENCE_MODEL is required when Tutor is enabled/);
  assert.match(workerSource, /maxTutorConcurrent/);
});

test('runbook defines env isolation, TCB limitation, alerts, and bounded recovery drills', async () => {
  const readme = await readFile(README_PATH, 'utf8');
  assert.match(readme, /\/etc\/kapy\/amc12-practice\.env/);
  assert.match(readme, /\/etc\/kapy\/amc12-learning-worker\.env/);
  assert.match(readme, /must not contain `AMC12_ASSEMBLYAI_API_KEY`, `AMC12_INFERENCE_TOKEN`/);
  assert.match(readme, /AMC12_ASSEMBLYAI_RETENTION_PROFILE_VERIFIED=true/);
  assert.match(readme, /AMC12_BATCH_REVIEW_ENABLED=false/);
  assert.match(readme, /both `AMC12_BATCH_REVIEW_ENABLED=true` and\s+`AMC12_BATCH_INTAKE_ENABLED=true` must be literal/);
  assert.match(readme, /all 25 questions in approved context/);
  assert.match(readme, /AMC12_INFERENCE_MODEL=gpt-5\.4-mini/);
  assert.match(readme, /pins both to `gpt-5\.4-mini`/);
  assert.equal([...readme.matchAll(/AMC12_TUTOR_ENABLED=true/g)].length, 2);
  assert.match(readme, /AMC12_TUTOR_MAX_CONCURRENT=1/);
  assert.match(readme, /coordinated, default-off release gate/);
  assert.match(readme, /learning_tutor_turn_jobs/);
  assert.match(readme, /oldest ready Tutor work exceeds 2\/5 minutes/);
  assert.match(readme, /global_resource_budget_windows/);
  assert.match(readme, /ai_dispatch_fairness_state/);
  assert.match(readme, /fails closed without an explicit verified profile/);
  assert.match(readme, /cannot make batch deletion `COMPLETE`/);
  assert.match(readme, /same trusted computing base \(TCB\)/);
  assert.match(readme, /not a security boundary/);
  assert.equal(
    [...readme.matchAll(/AMC12_PRIVATE_UPLOAD_ROOT=\/var\/lib\/kapy\/amc12-private-uploads/g)].length,
    2,
    'API and worker env examples must wire the same explicit private root'
  );
  assert.match(readme, /private root must be an absolute `0700` directory disjoint from the Git/);
  assert.match(readme, /a symlink must\s+not make one tree a parent or child of another/);
  assert.match(readme, /does not bootstrap a\s+real system LaunchDaemon/);
  assert.match(readme, /launchd redirects these streams but does not provide retention or rotation/);
  assert.match(readme, /propagates one\s+shutdown `AbortSignal`/);
  assert.match(readme, /shutdown abort\s+does not persist a terminal result or stale retry decision/);
  assert.match(readme, /slow-Gateway abort tests/);
  assert.match(readme, /learning_batch_provider_orphan_cleanup_jobs/);
  assert.match(readme, /launchctl kill SIGTERM system\/com\.kapy\.education\.amc12-learning-worker/);
  assert.match(readme, /launchctl kill SIGKILL system\/com\.kapy\.education\.amc12-learning-worker/);
});

test('worker log rotation profile is bounded, private, and only used during a stopped job', async () => {
  const [profile, readme] = await Promise.all([
    readFile(NEWSYSLOG_PROFILE_PATH, 'utf8'), readFile(README_PATH, 'utf8')
  ]);
  const rows = profile.split(/\r?\n/).map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  assert.equal(rows.length, 2);
  for (const row of rows) {
    const fields = row.split(/\s+/);
    assert.equal(fields.length, 7, row);
    assert.match(fields[0], /^\/var\/log\/kapy\/amc12-learning-worker\.(?:stdout|stderr)\.log$/);
    assert.equal(fields[1], 'ss:staff');
    assert.equal(fields[2], '600');
    assert.ok(Number(fields[3]) >= 7);
    assert.ok(Number(fields[4]) <= 10 * 1024, 'size rotation must happen by 10 MiB');
    assert.equal(fields[5], '$D0', 'age must be bounded by a daily rotation opportunity');
    assert.match(fields[6], /N/, 'newsyslog must not signal an unrelated process');
    assert.match(fields[6], /Z/, 'archives must be compressed');
  }
  assert.match(profile, /Do NOT install this example in \/etc\/newsyslog\.d/);
  assert.match(readme, /literal `AMC12_BATCH_INTAKE_ENABLED=false`/);
  assert.match(readme, /launchctl bootout system\/com\.kapy\.education\.amc12-learning-worker/);
  assert.match(readme, /newsyslog -F -f/);
  assert.match(readme, /log directory itself remains `root:staff 0750`/);
  assert.doesNotMatch(readme, /chown ss:staff \/var\/log\/kapy\/amc12-learning-worker\.\*\.log\*/);
  assert.match(readme, /available space is below either 10% or 5 GiB/);
  assert.match(readme, /expired running leases increase\s+across two polls/);
  assert.match(readme, /Do not delete uploads, edit queue\s+rows, reset the fairness cursor/);
  assert.match(readme, /two polling windows show no increasing expired\s+leases/);
});
