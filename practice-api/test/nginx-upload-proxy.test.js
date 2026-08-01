import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const NGINX_DIR = path.join(REPO_ROOT, 'deploy/nginx');
const UPLOAD_SUFFIX =
  'attempts/00000000-0000-4000-8000-000000000001/' +
  'learning-batches/00000000-0000-4000-8000-000000000002/' +
  'assets/00000000-0000-4000-8000-000000000003/body';

const nginxAvailable = spawnSync('nginx', ['-v'], { encoding: 'utf8' }).status === 0;

async function reservePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

async function startUpstream() {
  const requests = [];
  const server = http.createServer((request, response) => {
    let bytes = 0;
    request.on('data', (chunk) => {
      bytes += chunk.length;
    });
    request.on('end', () => {
      requests.push({ method: request.method, url: request.url, bytes });
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ bytes }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    port: server.address().port,
    requests,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  };
}

async function waitForPort(port, child) {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`nginx exited before accepting traffic (exit ${child.exitCode})`);
    }
    const connected = await new Promise((resolve) => {
      const socket = net.connect({ host: '127.0.0.1', port });
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
      socket.setTimeout(100, () => {
        socket.destroy();
        resolve(false);
      });
    });
    if (connected) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('nginx did not start within 5 seconds');
}

async function startNginx({ fragment, wrapper, frontPort, tempDirectory }) {
  const confDirectory = path.join(tempDirectory, 'conf');
  const runDirectory = path.join(tempDirectory, 'run');
  await mkdir(confDirectory, { recursive: true });
  await mkdir(runDirectory, { recursive: true });
  const fragmentPath = path.join(confDirectory, 'site.conf');
  const mainPath = path.join(confDirectory, 'nginx.conf');
  await writeFile(fragmentPath, fragment, 'utf8');
  await writeFile(
    mainPath,
    `pid ${path.join(runDirectory, 'nginx.pid')};\n` +
      `error_log ${path.join(runDirectory, 'master-error.log')} notice;\n` +
      'events {}\n' +
      wrapper(fragmentPath, runDirectory),
    'utf8'
  );

  const syntax = spawnSync('nginx', ['-t', '-p', `${tempDirectory}/`, '-c', mainPath], {
    encoding: 'utf8'
  });
  assert.equal(syntax.status, 0, `${syntax.stdout}\n${syntax.stderr}`);

  const child = spawn('nginx', ['-p', `${tempDirectory}/`, '-c', mainPath, '-g', 'daemon off;'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let diagnostics = '';
  child.stdout.on('data', (chunk) => {
    diagnostics += chunk;
  });
  child.stderr.on('data', (chunk) => {
    diagnostics += chunk;
  });
  try {
    await waitForPort(frontPort, child);
  } catch (error) {
    child.kill('SIGQUIT');
    throw new Error(`${error.message}\n${diagnostics}`);
  }
  return async () => {
    if (child.exitCode !== null) return;
    child.kill('SIGQUIT');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 2_000))
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  };
}

function httpWrapper(fragmentPath, runDirectory) {
  return (
    'http {\n' +
    `  client_body_temp_path ${path.join(runDirectory, 'client-body')};\n` +
    `  proxy_temp_path ${path.join(runDirectory, 'proxy')};\n` +
    `  include ${fragmentPath};\n` +
    '}\n'
  );
}

function portalWrapper(fragmentPath, runDirectory) {
  return (
    'http {\n' +
    `  client_body_temp_path ${path.join(runDirectory, 'client-body')};\n` +
    `  proxy_temp_path ${path.join(runDirectory, 'proxy')};\n` +
    "  map $http_cf_connecting_ip $amc12_portal_client_ip { default $remote_addr; }\n" +
    "  map $http_x_forwarded_proto $amc12_portal_forwarded_proto { default $scheme; }\n" +
    "  map $http_x_forwarded_port $amc12_portal_forwarded_port { default $server_port; }\n" +
    '  server {\n' +
    `    include ${fragmentPath};\n` +
    '  }\n' +
    '}\n'
  );
}

const cases = [
  {
    name: 'workspace proxy',
    file: 'workspace-amc12-static.conf',
    uploadPath: `/api/amc12/${UPLOAD_SUFFIX}`,
    jsonPath: '/api/amc12/sessions/test',
    privatePath: '/private-uploads/should-never-be-public.txt',
    wrapper: httpWrapper,
    transform(source, frontPort, upstreamPort, tempDirectory) {
      return source
        .replace('listen 8084;', `listen 127.0.0.1:${frontPort};`)
        .replace(
          'root /Users/ss/Workspaces/education/AMC12_Problems;',
          `root ${path.join(tempDirectory, 'public')};`
        )
        .replaceAll('proxy_pass http://127.0.0.1:8090;', `proxy_pass http://127.0.0.1:${upstreamPort};`)
        .replace('access_log logs/amc12-access.log;', `access_log ${path.join(tempDirectory, 'access.log')};`)
        .replace('error_log logs/amc12-error.log;', `error_log ${path.join(tempDirectory, 'error.log')};`);
    }
  },
  {
    name: 'portal proxy',
    file: 'portal-amc12-locations.conf',
    uploadPath: `/amc12/api/amc12/${UPLOAD_SUFFIX}`,
    jsonPath: '/amc12/api/amc12/sessions/test',
    wrapper: portalWrapper,
    transform(source, frontPort, upstreamPort) {
      return (
        `listen 127.0.0.1:${frontPort};\n` +
        source
          .replace('proxy_pass http://127.0.0.1:8084/;', `proxy_pass http://127.0.0.1:${upstreamPort}/;`)
          .replace('proxy_pass http://127.0.0.1:8084;', `proxy_pass http://127.0.0.1:${upstreamPort};`)
      );
    }
  },
  {
    name: 'Homebrew edge proxy',
    file: 'homebrew-amc12-proxy.conf',
    uploadPath: `/api/amc12/${UPLOAD_SUFFIX}`,
    jsonPath: '/api/amc12/sessions/test',
    wrapper: httpWrapper,
    transform(source, frontPort, upstreamPort, tempDirectory) {
      return source
        .replace('listen       8080;', `listen       127.0.0.1:${frontPort};`)
        .replace('proxy_pass         http://127.0.0.1:8084;', `proxy_pass         http://127.0.0.1:${upstreamPort};`)
        .replace('proxy_pass http://127.0.0.1:8084;', `proxy_pass http://127.0.0.1:${upstreamPort};`)
        .replace(
          'access_log /opt/homebrew/var/log/nginx/amc12-access.log;',
          `access_log ${path.join(tempDirectory, 'access.log')};`
        )
        .replace(
          'error_log  /opt/homebrew/var/log/nginx/amc12-error.log;',
          `error_log  ${path.join(tempDirectory, 'error.log')};`
        );
    }
  }
];

for (const proxyCase of cases) {
  test(
    `${proxyCase.name} keeps JSON at 64 KiB while streaming the exact upload route`,
    { skip: nginxAvailable ? false : 'nginx is not installed' },
    async (t) => {
      const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'amc12-nginx-test-'));
      t.after(() => rm(tempDirectory, { recursive: true, force: true }));
      await mkdir(path.join(tempDirectory, 'public'), { recursive: true });
      if (proxyCase.privatePath) {
        await mkdir(path.join(tempDirectory, 'public/private-uploads'), { recursive: true });
        await writeFile(
          path.join(tempDirectory, 'public/private-uploads/should-never-be-public.txt'),
          'private-canary',
          'utf8'
        );
      }
      const upstream = await startUpstream();
      t.after(() => upstream.close());
      const frontPort = await reservePort();
      const source = await readFile(path.join(NGINX_DIR, proxyCase.file), 'utf8');
      assert.match(source, /client_max_body_size 64k;/);
      assert.match(source, /client_max_body_size 25m;/);
      assert.match(source, /proxy_request_buffering off;/);
      const fragment = proxyCase.transform(source, frontPort, upstream.port, tempDirectory);
      const stop = await startNginx({
        fragment,
        wrapper: proxyCase.wrapper,
        frontPort,
        tempDirectory
      });
      t.after(stop);

      const rejected = await fetch(`http://127.0.0.1:${frontPort}${proxyCase.jsonPath}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload: 'x'.repeat(128 * 1024) })
      });
      assert.equal(rejected.status, 413);

      const body = Buffer.alloc(2 * 1024 * 1024, 0x61);
      const accepted = await fetch(`http://127.0.0.1:${frontPort}${proxyCase.uploadPath}`, {
        method: 'PUT',
        headers: { 'content-type': 'audio/mpeg' },
        body
      });
      assert.equal(accepted.status, 200);
      assert.equal((await accepted.json()).bytes, body.length);
      assert.equal(upstream.requests.length, 1, 'oversized JSON must not reach the upstream');
      assert.equal(upstream.requests[0].bytes, body.length);
      if (proxyCase.privatePath) {
        const privateCanary = await fetch(`http://127.0.0.1:${frontPort}${proxyCase.privatePath}`);
        assert.equal(privateCanary.status, 404);
        assert.doesNotMatch(await privateCanary.text(), /private-canary/u);
      }
    }
  );
}
