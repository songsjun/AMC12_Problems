import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = ['index.html', 'viewer.html'];

function fail(message) {
  throw new Error(`Archive security verification failed: ${message}`);
}

function sha384(contents) {
  return `sha384-${createHash('sha384').update(contents).digest('base64')}`;
}

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  if (/https?:\/\/[^"']+/i.test(html)) fail(`${file} still references a remote asset`);
  if (/\son[a-z]+\s*=/i.test(html)) fail(`${file} contains an inline event handler`);

  const scriptTags = [...html.matchAll(/<script\b([^>]*)>/gi)];
  if (!scriptTags.length) fail(`${file} has no reader scripts`);
  for (const [, attributes] of scriptTags) {
    const src = attributes.match(/\bsrc="([^"]+)"/i)?.[1];
    const integrity = attributes.match(/\bintegrity="([^"]+)"/i)?.[1];
    if (!src || !integrity) fail(`${file} has a script without local src and SRI`);
    if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) fail(`${file} has a non-local script`);
    const asset = await readFile(path.join(root, src));
    if (sha384(asset) !== integrity) fail(`${file} has stale SRI for ${src}`);
  }

  const stylesheet = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/i)?.[0];
  const stylesheetHref = stylesheet?.match(/\bhref="([^"]+)"/i)?.[1];
  const stylesheetIntegrity = stylesheet?.match(/\bintegrity="([^"]+)"/i)?.[1];
  if (!stylesheetHref || !stylesheetIntegrity) fail(`${file} stylesheet must be local and SRI-pinned`);
  const stylesheetContents = await readFile(path.join(root, stylesheetHref));
  if (sha384(stylesheetContents) !== stylesheetIntegrity) fail(`${file} has stale SRI for ${stylesheetHref}`);
}

const reader = await readFile(path.join(root, 'archive/reader.js'), 'utf8');
if (reader.includes('.innerHTML')) fail('reader directly writes innerHTML');
if (!reader.includes('DOMPurify.sanitize') || !reader.includes('RETURN_DOM_FRAGMENT')) {
  fail('reader must use DOMPurify to return a DOM fragment');
}
const mathjaxConfig = await readFile(path.join(root, 'archive/mathjax-config.js'), 'utf8');
if (!mathjaxConfig.includes("'html', 'require'")) fail('MathJax high-risk TeX extensions are not explicitly disabled');

const nginx = await readFile(path.join(root, 'deploy/nginx/workspace-amc12-static.conf'), 'utf8');
for (const route of ['/index.html', '/viewer.html']) {
  if (!nginx.includes(`location = ${route}`)) fail(`${route} has no explicit archive route`);
}
if (!nginx.includes("script-src 'self'")) fail('archive CSP does not restrict scripts to self');
if (!nginx.includes('location ~* \\.svg$')) fail('reviewed SVG files have no dedicated static location');
if (!nginx.includes('default_type image/svg+xml')) fail('reviewed SVG files have no explicit image MIME type');
if (!nginx.includes("default-src 'none'; base-uri 'none'; object-src 'none'; script-src 'none'")) {
  fail('reviewed SVG files have no restrictive direct-navigation CSP');
}
if (!nginx.includes('X-Content-Type-Options "nosniff" always')) {
  fail('reviewed SVG files have no nosniff response header');
}

console.log('Archive static security verification passed.');
