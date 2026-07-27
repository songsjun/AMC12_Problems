import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!existsSync(chrome)) throw new Error(`Chrome is required for this smoke test: ${chrome}`);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.md', 'text/plain; charset=utf-8']
]);

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const metadata = await stat(target);
    if (!metadata.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': mimeTypes.get(path.extname(target)) || 'application/octet-stream' });
    response.end(await readFile(target));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const url = `http://127.0.0.1:${address.port}/archive/test/security-smoke.html`;

try {
  const runChrome = (targetUrl, extraArguments = []) => new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--dump-dom', ...extraArguments, targetUrl
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(`Chrome exited ${code}: ${stderr}`)));
  });

  const output = await runChrome(url);
  if (!output.includes('data-test-status="pass"') || !output.includes('>PASS<')) {
    throw new Error(`Browser smoke test did not pass. Output:\n${output}`);
  }

  const archiveOutput = await runChrome(
    `http://127.0.0.1:${address.port}/index.html#2025AP1`,
    ['--virtual-time-budget=5000']
  );
  if (!archiveOutput.includes('2025 AMC 12A Problem 1') || !archiveOutput.includes('<details>') || !archiveOutput.includes('Solution 1')) {
    throw new Error('Archive page did not preserve its problem and collapsible solution rendering.');
  }

  const historicalOutput = await runChrome(
    `http://127.0.0.1:${address.port}/index.html#2022AP24`,
    ['--virtual-time-budget=5000']
  );
  if (!historicalOutput.includes('2022 AMC 12A Problem 24') || !historicalOutput.includes('<ol>')) {
    throw new Error('Archive sanitizer did not preserve allow-listed historical list content.');
  }

  const viewerOutput = await runChrome(
    `http://127.0.0.1:${address.port}/viewer.html#2025AP1`,
    ['--virtual-time-budget=5000']
  );
  if (!viewerOutput.includes('2025 AMC 12A Problem 1') || !viewerOutput.includes('Solution 1')) {
    throw new Error('Standalone viewer did not preserve its problem rendering.');
  }
  console.log('Archive browser security smoke test passed.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}
