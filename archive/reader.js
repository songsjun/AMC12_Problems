/*
 * Public archive reader.
 *
 * Problem Markdown is repository content, not executable HTML.  Keep the
 * trust boundary here: Marked parses Markdown, DOMPurify returns a strict
 * allow-listed DocumentFragment, and this module only ever inserts DOM nodes.
 */

const FIRST_YEAR = 2002;
const LAST_YEAR = 2025;
const VARIANTS = new Set(['A', 'B']);
const MATH_TOKEN_PREFIX = '\uE000AMC12_MATH_';
const MATH_TOKEN_SUFFIX = '\uE001';

const SANITIZE_OPTIONS = Object.freeze({
  ALLOWED_TAGS: [
    'a', 'abbr', 'b', 'blockquote', 'br', 'center', 'code', 'del', 'div',
    'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p',
    'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
    'th', 'thead', 'tr', 'u', 'ul'
  ],
  ALLOWED_ATTR: ['align', 'href', 'start', 'title'],
  FORBID_ATTR: ['class', 'id', 'name', 'rel', 'style', 'target'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: true,
  RETURN_DOM_FRAGMENT: true
});

export function normalizeProblem(year, variant, number) {
  const parsedYear = Number(year);
  const parsedNumber = Number(number);
  return {
    year: Number.isInteger(parsedYear) && parsedYear >= FIRST_YEAR && parsedYear <= LAST_YEAR
      ? parsedYear
      : LAST_YEAR,
    variant: VARIANTS.has(variant) ? variant : 'A',
    number: Number.isInteger(parsedNumber) && parsedNumber >= 1 && parsedNumber <= 25
      ? parsedNumber
      : 1
  };
}

export function problemPath(year, variant, number) {
  const safe = normalizeProblem(year, variant, number);
  return `${safe.year}_AMC_12${safe.variant}_Problems/Problem_${String(safe.number).padStart(2, '0')}.md`;
}

export function normalizeHref(rawHref, baseHref = 'https://archive.invalid/') {
  if (typeof rawHref !== 'string') return null;

  const value = rawHref.trim();
  if (!value) return null;

  // Browser URL parsers can accept controls and whitespace within a scheme.
  // Reject a non-HTTP scheme before resolving the original value.
  const compact = value.replace(/[\u0000-\u0020\u007f]/g, '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(compact) && !/^https?:/i.test(compact)) {
    return null;
  }

  try {
    const url = new URL(value, baseHref);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Turn source $...$ / $$...$$ sections into text-only sentinels before
 * Markdown parsing.  They are restored after sanitization so TeX can never be
 * interpreted as HTML by the Markdown parser.
 */
export function protectMath(markdown) {
  const blocks = [];
  const output = [];
  const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
  let inDisplay = false;
  let displayLines = [];
  let rawDisplayLines = [];

  const addBlock = (content, display) => {
    const token = `${MATH_TOKEN_PREFIX}${blocks.length}${MATH_TOKEN_SUFFIX}`;
    blocks.push({ token, content, display });
    output.push(token);
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (inDisplay) {
      rawDisplayLines.push(line);
      if (trimmed === '$$' || (trimmed.endsWith('$$') && trimmed !== '$$')) {
        const closingContent = trimmed.endsWith('$$') && trimmed !== '$$'
          ? trimmed.slice(0, -2)
          : '';
        if (closingContent) displayLines.push(closingContent);
        addBlock(displayLines.join('\n'), true);
        inDisplay = false;
        displayLines = [];
        rawDisplayLines = [];
      } else {
        displayLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith('$$')) {
      if (trimmed.endsWith('$$') && trimmed.length > 4) {
        addBlock(trimmed.slice(2, -2), true);
      } else if (trimmed === '$$') {
        inDisplay = true;
        displayLines = [];
        rawDisplayLines = [line];
      } else {
        inDisplay = true;
        displayLines = [trimmed.slice(2)];
        rawDisplayLines = [line];
      }
      continue;
    }

    output.push(line.replace(/(?<!\$)\$(?!\$)((?:[^$\n]|\\\$)+?)\$(?!\$)/g, (_match, content) => {
      const token = `${MATH_TOKEN_PREFIX}${blocks.length}${MATH_TOKEN_SUFFIX}`;
      blocks.push({ token, content, display: false });
      return token;
    }));
  }

  // Do not silently discard malformed source.  Leaving an unclosed display
  // block as escaped text is both safe and more useful to content editors.
  if (inDisplay) output.push(...rawDisplayLines);

  return { text: output.join('\n'), blocks };
}

function restoreMath(fragment, blocks) {
  if (!blocks.length) return;

  const tokens = new Map(blocks.map((block) => [block.token, block]));
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  for (const textNode of textNodes) {
    const value = textNode.nodeValue;
    if (!value || !value.includes(MATH_TOKEN_PREFIX)) continue;

    const replacement = document.createDocumentFragment();
    let cursor = 0;
    let matched = false;
    const matcher = new RegExp(`${MATH_TOKEN_PREFIX}(\\d+)${MATH_TOKEN_SUFFIX}`, 'g');
    let match;

    while ((match = matcher.exec(value))) {
      const token = match[0];
      const block = tokens.get(token);
      if (!block) continue;
      matched = true;
      if (match.index > cursor) replacement.append(document.createTextNode(value.slice(cursor, match.index)));
      const delimiters = block.display ? ['\\[', '\\]'] : ['\\(', '\\)'];
      replacement.append(document.createTextNode(`${delimiters[0]}${block.content}${delimiters[1]}`));
      cursor = match.index + token.length;
    }

    if (matched) {
      if (cursor < value.length) replacement.append(document.createTextNode(value.slice(cursor)));
      textNode.replaceWith(replacement);
    }
  }
}

function hardenLinks(fragment) {
  const baseHref = window.location.href;
  for (const anchor of fragment.querySelectorAll('a')) {
    const href = normalizeHref(anchor.getAttribute('href'), baseHref);
    if (!href) {
      anchor.removeAttribute('href');
      continue;
    }

    anchor.setAttribute('href', href);
    const destination = new URL(href, baseHref);
    if (destination.origin !== window.location.origin) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

export function createSafeMarkdownFragment(markdown) {
  if (!globalThis.marked || !globalThis.DOMPurify) {
    throw new Error('The local archive rendering dependencies did not load.');
  }

  const { text, blocks } = protectMath(markdown);
  const rendered = globalThis.marked.parse(text, { async: false, breaks: false, gfm: true });
  if (typeof rendered !== 'string') throw new Error('Markdown parser returned an unexpected result.');

  const fragment = globalThis.DOMPurify.sanitize(rendered, SANITIZE_OPTIONS);
  hardenLinks(fragment);
  restoreMath(fragment, blocks);
  return fragment;
}

function headingTitle(node) {
  return node.textContent.trim();
}

function makeCollapsible(fragment) {
  const result = document.createDocumentFragment();
  let heading = null;
  let sectionNodes = [];

  const flush = () => {
    if (!heading) return;
    const title = headingTitle(heading);
    const lower = title.toLowerCase();

    if (lower === 'problem') {
      result.append(heading, ...sectionNodes);
    } else if (!lower.startsWith('see also')) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      const body = document.createElement('div');
      summary.textContent = title;
      body.className = 'section-body';
      body.append(heading, ...sectionNodes);
      details.append(summary, body);
      result.append(details);
    }

    heading = null;
    sectionNodes = [];
  };

  for (const node of [...fragment.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H2') {
      flush();
      heading = node;
    } else if (heading) {
      sectionNodes.push(node);
    } else {
      result.append(node);
    }
  }
  flush();
  return result;
}

export function renderArchiveMarkdown(markdown, { collapsible = false } = {}) {
  const fragment = createSafeMarkdownFragment(markdown);
  return collapsible ? makeCollapsible(fragment) : fragment;
}

function clearAndShowMessage(element, className, message) {
  const box = document.createElement('div');
  box.className = className;
  box.textContent = message;
  element.replaceChildren(box);
}

async function typesetMath(element) {
  if (!window.MathJax?.typesetPromise) return;
  try {
    window.MathJax.typesetClear?.([element]);
    await window.MathJax.typesetPromise([element]);
  } catch {
    // A malformed historical TeX expression should not take down the reader.
  }
}

function aopsUrl(year, variant, number) {
  return `https://artofproblemsolving.com/wiki/index.php/${year}_AMC_12${variant}_Problems/Problem_${number}`;
}

function setStatus(status, year, variant, number, viewerMode) {
  const link = document.createElement('a');
  link.href = aopsUrl(year, variant, number);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = viewerMode ? 'View on AoPS →' : 'View on AoPS ↗';
  status.replaceChildren(
    document.createTextNode(`${year} AMC 12${variant} Problem ${number}${viewerMode ? ' | ' : ' · '}`),
    link,
    document.createTextNode(viewerMode ? ' | Arrow keys: ← prev / → next' : ' · '),
    ...(viewerMode ? [] : [
      Object.assign(document.createElement('span'), { className: 'kbd', textContent: '←' }),
      document.createTextNode(' '),
      Object.assign(document.createElement('span'), { className: 'kbd', textContent: '→' }),
      document.createTextNode(' navigate')
    ])
  );
}

function parseHash() {
  const match = window.location.hash.match(/^#(\d{4})([AB])P(\d{1,2})$/);
  if (!match) return null;
  const value = normalizeProblem(match[1], match[2], match[3]);
  return value.year === Number(match[1]) && value.number === Number(match[3]) ? value : null;
}

function bootstrap() {
  const reader = document.querySelector('[data-archive-reader]');
  if (!reader) return;

  const viewerMode = reader.dataset.archiveMode === 'viewer';
  const content = document.getElementById('content');
  const status = document.getElementById('statusBar');
  const yearSelect = document.getElementById('yearSelect');
  const variantSelect = document.getElementById('variantSelect');
  const problemNav = document.getElementById('problemNav');
  const previous = document.getElementById('previousProblem');
  const next = document.getElementById('nextProblem');
  const toolbar = document.getElementById('toolbar');
  const expand = document.getElementById('expandAll');
  const collapse = document.getElementById('collapseAll');
  let current = normalizeProblem(LAST_YEAR, 'A', 1);
  let requestNumber = 0;

  for (let year = LAST_YEAR; year >= FIRST_YEAR; year -= 1) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.append(option);
  }

  for (let number = 1; number <= 25; number += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(number);
    button.addEventListener('click', () => loadProblem(current.year, current.variant, number));
    problemNav.append(button);
  }

  const updateControls = () => {
    yearSelect.value = String(current.year);
    variantSelect.value = current.variant;
    for (const [index, button] of [...problemNav.querySelectorAll('button')].entries()) {
      button.classList.toggle('active', index + 1 === current.number);
    }
  };

  const setHash = () => {
    const nextHash = `#${current.year}${current.variant}P${current.number}`;
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
  };

  const loadProblem = async (year, variant, number) => {
    current = normalizeProblem(year, variant, number);
    const thisRequest = ++requestNumber;
    updateControls();
    clearAndShowMessage(content, 'loading', 'Loading…');
    if (toolbar) toolbar.hidden = true;

    try {
      const response = await fetch(problemPath(current.year, current.variant, current.number), {
        headers: { Accept: 'text/markdown, text/plain;q=0.9' }
      });
      if (!response.ok) throw new Error('This problem file is not available.');
      const markdown = await response.text();
      if (thisRequest !== requestNumber) return;

      content.replaceChildren(renderArchiveMarkdown(markdown, { collapsible: !viewerMode }));
      if (toolbar) toolbar.hidden = false;
      await typesetMath(content);
      if (thisRequest !== requestNumber) return;
      setStatus(status, current.year, current.variant, current.number, viewerMode);
      setHash();
    } catch {
      if (thisRequest !== requestNumber) return;
      clearAndShowMessage(content, 'error', 'Unable to load this problem. Please choose another one.');
      status.replaceChildren();
    }
  };

  const movePrevious = () => {
    if (current.number > 1) return loadProblem(current.year, current.variant, current.number - 1);
    if (current.variant === 'B') return loadProblem(current.year, 'A', 25);
    if (current.year > FIRST_YEAR) return loadProblem(current.year - 1, 'B', 25);
    return undefined;
  };

  const moveNext = () => {
    if (current.number < 25) return loadProblem(current.year, current.variant, current.number + 1);
    if (current.variant === 'A') return loadProblem(current.year, 'B', 1);
    if (current.year < LAST_YEAR) return loadProblem(current.year + 1, 'A', 1);
    return undefined;
  };

  yearSelect.addEventListener('change', () => loadProblem(yearSelect.value, current.variant, current.number));
  variantSelect.addEventListener('change', () => loadProblem(current.year, variantSelect.value, current.number));
  previous.addEventListener('click', movePrevious);
  next.addEventListener('click', moveNext);
  expand?.addEventListener('click', async () => {
    content.querySelectorAll('details').forEach((details) => { details.open = true; });
    await typesetMath(content);
  });
  collapse?.addEventListener('click', () => {
    content.querySelectorAll('details').forEach((details) => { details.open = false; });
  });
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveNext();
    }
  });
  window.addEventListener('hashchange', () => {
    const requested = parseHash();
    if (requested && (requested.year !== current.year || requested.variant !== current.variant || requested.number !== current.number)) {
      loadProblem(requested.year, requested.variant, requested.number);
    }
  });
  window.addEventListener('mathjax-ready', () => typesetMath(content));

  const initial = parseHash() ?? current;
  loadProblem(initial.year, initial.variant, initial.number);
}

if (typeof document !== 'undefined') {
  let dependencyAttempts = 0;
  const startWhenDependenciesAreReady = () => {
    if (globalThis.marked && globalThis.DOMPurify) {
      bootstrap();
    } else if (dependencyAttempts < 100) {
      dependencyAttempts += 1;
      // Module scripts can finish before an earlier deferred classic script on
      // a slow cache miss.  Wait without introducing an inline script or a
      // third-party fallback.
      window.setTimeout(startWhenDependenciesAreReady, 50);
    } else {
      const content = document.getElementById('content');
      if (content) clearAndShowMessage(content, 'error', 'The local archive reader could not start. Please reload this page.');
    }
  };
  startWhenDependenciesAreReady();
}
