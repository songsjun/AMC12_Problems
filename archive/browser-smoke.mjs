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
  ['.md', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml']
]);

const latestPaperSmokeHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<script defer src="/archive/mathjax-config.js"></script>
<script defer src="/practice/vendor/mathjax/tex-svg-full.js"></script>
<script defer src="/archive/vendor/marked/marked.umd.js"></script>
<script defer src="/archive/vendor/dompurify/purify.min.js"></script>
</head><body><output id="result">RUNNING</output>
<script type="module">
import { renderArchiveMarkdown } from '/archive/reader.js';
const result = document.getElementById('result');
try {
  if (document.readyState !== 'complete') await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  await window.MathJax.startup.promise;
  const rows = [];
  for (let number = 1; number <= 25; number += 1) {
    const url = new URL('/2026_AMC_12A_Problems/Problem_' + String(number).padStart(2, '0') + '.md', location.href);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Problem ' + number + ' returned ' + response.status);
    const article = document.createElement('article');
    article.append(renderArchiveMarkdown(await response.text(), { baseHref: url.href }));
    document.body.append(article);
    await window.MathJax.typesetPromise([article]);
    const images = [...article.querySelectorAll('img')];
    await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    })));
    const mathErrors = [...article.querySelectorAll('[data-mml-node="merror"], mjx-merror, merror')].map((node) => node.textContent);
    const brokenImages = images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'));
    rows.push({ number, mathCount: article.querySelectorAll('mjx-container').length, mathErrors, imageCount: images.length, brokenImages });
    window.MathJax.typesetClear([article]);
    article.remove();
  }
  const failures = rows.filter((row) => !row.mathCount || row.mathErrors.length || row.brokenImages.length);
  result.textContent = JSON.stringify({ questionCount: rows.length, mathCount: rows.reduce((sum, row) => sum + row.mathCount, 0), imageCount: rows.reduce((sum, row) => sum + row.imageCount, 0), failures });
  result.dataset.testStatus = failures.length ? 'fail' : 'pass';
} catch (error) {
  result.textContent = String(error.stack || error);
  result.dataset.testStatus = 'fail';
}
</script></body></html>`;

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  if (pathname === '/archive/test/latest-paper-smoke.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(latestPaperSmokeHtml);
    return;
  }
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

  const diagramOutput = await runChrome(
    `http://127.0.0.1:${address.port}/index.html#2025AP5`,
    ['--virtual-time-budget=5000']
  );
  if (!diagramOutput.includes('problem-05-nested-squares.svg')) {
    throw new Error('Archive page did not preserve the reviewed local problem diagram.');
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

  const latestOutput = await runChrome(
    `http://127.0.0.1:${address.port}/index.html`,
    ['--virtual-time-budget=5000']
  );
  if (!latestOutput.includes('2026 AMC 12A Problem 1') || !latestOutput.includes('form=amc12-2026-a')) {
    throw new Error('Archive default did not open the latest 2026A paper and its practice destination.');
  }
  const variantOptions = latestOutput.match(/<select id="variantSelect">([\s\S]*?)<\/select>/)?.[1];
  if (!variantOptions?.includes('<option value="A">A</option>') || variantOptions.includes('value="B"')) {
    throw new Error('The latest paper offered an unavailable 2026B variant.');
  }

  const latestEndOutput = await runChrome(
    `http://127.0.0.1:${address.port}/viewer.html#2026AP25`,
    ['--virtual-time-budget=5000']
  );
  if (!latestEndOutput.includes('2026 AMC 12A Problem 25')
    || !/<button\b[^>]*id="nextProblem"[^>]*\bdisabled/.test(latestEndOutput)) {
    throw new Error('The latest paper did not stop navigation at Problem 25.');
  }

  const fullPaperOutput = await runChrome(
    `http://127.0.0.1:${address.port}/archive/test/latest-paper-smoke.html`,
    ['--virtual-time-budget=60000']
  );
  const fullPaperResult = fullPaperOutput.match(/<output id="result"[^>]*>([\s\S]*?)<\/output>/)?.[1];
  if (!fullPaperOutput.includes('data-test-status="pass"')) {
    throw new Error('The 2026A paper has a formula or image rendering failure: ' + fullPaperResult);
  }
  console.log('2026A complete-paper render check: ' + fullPaperResult);
  console.log('Archive browser security smoke test passed.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}
