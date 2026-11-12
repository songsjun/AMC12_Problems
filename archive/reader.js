/*
 * Public archive reader.
 *
 * Problem Markdown is repository content, not executable HTML.  Keep the
 * trust boundary here: Marked parses Markdown, DOMPurify returns a strict
 * allow-listed DocumentFragment, and this module only ever inserts DOM nodes.
 */

const ARCHIVE_PAPERS = Object.freeze([
  ...Array.from({ length: 24 }, (_, offset) => 2002 + offset)
    .flatMap((year) => [{ year, variant: 'A' }, { year, variant: 'B' }]),
  { year: 2026, variant: 'A' }
].map(Object.freeze));
const ARCHIVE_YEARS = Object.freeze([...new Set(ARCHIVE_PAPERS.map((paper) => paper.year))]);
const LAST_YEAR = ARCHIVE_YEARS.at(-1);
const PRACTICE_MODES = new Set(['practice', 'batch']);
const MATH_TOKEN_PREFIX = '\uE000AMC12_MATH_';
const MATH_TOKEN_SUFFIX = '\uE001';

const SANITIZE_OPTIONS = Object.freeze({
  ALLOWED_TAGS: [
    'a', 'abbr', 'b', 'blockquote', 'br', 'center', 'code', 'del', 'div', 'img',
    'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p',
    'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
    'th', 'thead', 'tr', 'u', 'ul'
  ],
  ALLOWED_ATTR: ['align', 'alt', 'href', 'src', 'start', 'title'],
  FORBID_ATTR: ['class', 'id', 'name', 'rel', 'style', 'target'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: true,
  RETURN_DOM_FRAGMENT: true
});

export function normalizeProblem(year, variant, number) {
  const parsedYear = Number(year);
  const parsedNumber = Number(number);
  const safeYear = ARCHIVE_YEARS.includes(parsedYear) ? parsedYear : LAST_YEAR;
  const paper = ARCHIVE_PAPERS.find((candidate) => candidate.year === safeYear && candidate.variant === variant)
    ?? ARCHIVE_PAPERS.find((candidate) => candidate.year === safeYear);
  return {
    year: paper.year,
    variant: paper.variant,
    number: Number.isInteger(parsedNumber) && parsedNumber >= 1 && parsedNumber <= 25
      ? parsedNumber
      : 1
  };
}

export function adjacentProblem(year, variant, number, direction) {
  if (direction !== -1 && direction !== 1) throw new TypeError('Navigation direction must be -1 or 1.');
  const current = normalizeProblem(year, variant, number);
  const paperIndex = ARCHIVE_PAPERS.findIndex((paper) => paper.year === current.year && paper.variant === current.variant);
  const problemIndex = paperIndex * 25 + current.number - 1 + direction;
  if (problemIndex < 0 || problemIndex >= ARCHIVE_PAPERS.length * 25) return null;
  return { ...ARCHIVE_PAPERS[Math.floor(problemIndex / 25)], number: problemIndex % 25 + 1 };
}

export function problemPath(year, variant, number) {
  const safe = normalizeProblem(year, variant, number);
  return `${safe.year}_AMC_12${safe.variant}_Problems/Problem_${String(safe.number).padStart(2, '0')}.md`;
}

/** Build a deployment-base-relative Practice destination for one complete AMC 12 paper. */
export function practiceDestination(year, variant, mode) {
  const safe = normalizeProblem(year, variant, 1);
  if (!PRACTICE_MODES.has(mode)) throw new TypeError('Practice mode must be practice or batch.');
  const query = new URLSearchParams({
    form: `amc12-${safe.year}-${safe.variant.toLowerCase()}`,
    mode
  });
  return `practice/?${query}`;
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

/** Resolve only same-origin image URLs from reviewed archive Markdown. */
export function normalizeImageSrc(rawSrc, baseHref = 'https://archive.invalid/') {
  const href = normalizeHref(rawSrc, baseHref);
  if (!href) return null;
  try {
    const destination = new URL(href);
    const base = new URL(baseHref);
    return destination.origin === base.origin ? destination.href : null;
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

function hardenLinks(fragment, baseHref) {
  for (const anchor of fragment.querySelectorAll('a')) {
    const href = normalizeHref(anchor.getAttribute('href'), baseHref);
    if (!href) {
      anchor.removeAttribute('href');
      continue;
    }

    anchor.setAttribute('href', href);
    const destination = new URL(href, baseHref);
    if (destination.origin !== new URL(baseHref).origin) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

function hardenImages(fragment, baseHref) {
  for (const image of fragment.querySelectorAll('img')) {
    const src = normalizeImageSrc(image.getAttribute('src'), baseHref);
    if (!src) {
      image.remove();
      continue;
    }
    image.setAttribute('src', src);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
  }
}

export function createSafeMarkdownFragment(
  markdown,
  { baseHref = globalThis.location?.href || 'https://archive.invalid/' } = {}
) {
  if (!globalThis.marked || !globalThis.DOMPurify) {
    throw new Error('The local archive rendering dependencies did not load.');
  }

  const { text, blocks } = protectMath(markdown);
  const rendered = globalThis.marked.parse(text, { async: false, breaks: false, gfm: true });
  if (typeof rendered !== 'string') throw new Error('Markdown parser returned an unexpected result.');

  const fragment = globalThis.DOMPurify.sanitize(rendered, SANITIZE_OPTIONS);
  hardenLinks(fragment, baseHref);
  hardenImages(fragment, baseHref);
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

export function renderArchiveMarkdown(markdown, { collapsible = false, baseHref } = {}) {
  const fragment = createSafeMarkdownFragment(markdown, { baseHref });
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

export function parseProblemHash(hash) {
  const match = hash.match(/^#(\d{4})([AB])P(\d{1,2})$/);
  if (!match) return null;
  const value = normalizeProblem(match[1], match[2], match[3]);
  return value.year === Number(match[1]) && value.variant === match[2] && value.number === Number(match[3]) ? value : null;
}

/**
 * Bind the Archive entry link to an accessible paper-level Practice chooser.
 * Returning the refresh function keeps state ownership inside the reader while
 * leaving URL construction and dialog behavior independently testable.
 */
export function connectPracticeChooser({
  trigger,
  dialog,
  practiceOption,
  batchOption,
  cancelButton,
  paperLabel,
  getCurrentPaper
}) {
  const elements = [trigger, dialog, practiceOption, batchOption, cancelButton, paperLabel];
  if (elements.some((element) => !element) || typeof getCurrentPaper !== 'function') return () => {};

  const refresh = () => {
    const paper = getCurrentPaper();
    const safe = normalizeProblem(paper?.year, paper?.variant, 1);
    paperLabel.textContent = `Choose how to work on ${safe.year} AMC 12${safe.variant}.`;
    practiceOption.href = practiceDestination(safe.year, safe.variant, 'practice');
    batchOption.href = practiceDestination(safe.year, safe.variant, 'batch');
  };

  const isOpen = () => dialog.open === true || dialog.hasAttribute('open');
  const close = () => {
    if (!isOpen()) return;
    if (typeof dialog.close === 'function') dialog.close('cancel');
    else {
      dialog.removeAttribute('open');
      trigger.focus();
    }
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    refresh();
    if (!isOpen()) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    practiceOption.focus();
  });
  // Arrow keys navigate the Archive behind this dialog. Keep a focused dialog
  // choice from bubbling into that global shortcut handler.
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.stopPropagation();
  });
  cancelButton.addEventListener('click', close);
  dialog.addEventListener('close', () => trigger.focus());

  refresh();
  return refresh;
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
  const practiceChoiceDialog = document.getElementById('practiceChoiceDialog');
  let current = normalizeProblem(LAST_YEAR, 'A', 1);
  let requestNumber = 0;
  const refreshPracticeChooser = connectPracticeChooser({
    trigger: document.getElementById('practiceEntry'),
    dialog: practiceChoiceDialog,
    practiceOption: document.getElementById('practiceModeLink'),
    batchOption: document.getElementById('batchModeLink'),
    cancelButton: document.getElementById('practiceChoiceCancel'),
    paperLabel: document.getElementById('practiceChoiceDescription'),
    getCurrentPaper: () => current
  });

  for (const year of [...ARCHIVE_YEARS].reverse()) {
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
    variantSelect.replaceChildren(...ARCHIVE_PAPERS.filter((paper) => paper.year === current.year).map((paper) => {
      const option = document.createElement('option');
      option.value = paper.variant;
      option.textContent = paper.variant;
      return option;
    }));
    variantSelect.value = current.variant;
    previous.disabled = adjacentProblem(current.year, current.variant, current.number, -1) === null;
    next.disabled = adjacentProblem(current.year, current.variant, current.number, 1) === null;
    refreshPracticeChooser();
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

      content.replaceChildren(renderArchiveMarkdown(markdown, {
        collapsible: !viewerMode,
        baseHref: response.url || new URL(problemPath(current.year, current.variant, current.number), window.location.href).href
      }));
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

  const move = (direction) => {
    const destination = adjacentProblem(current.year, current.variant, current.number, direction);
    if (destination) return loadProblem(destination.year, destination.variant, destination.number);
    return undefined;
  };
  const movePrevious = () => move(-1);
  const moveNext = () => move(1);

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
    // A defensive document-level guard also covers transient focus outside the
    // dialog (for example, before the initial focus task completes).
    if (practiceChoiceDialog?.open || practiceChoiceDialog?.hasAttribute('open')) return;
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
    const requested = parseProblemHash(window.location.hash);
    if (requested && (requested.year !== current.year || requested.variant !== current.variant || requested.number !== current.number)) {
      loadProblem(requested.year, requested.variant, requested.number);
    }
  });
  window.addEventListener('mathjax-ready', () => typesetMath(content));

  const initial = parseProblemHash(window.location.hash) ?? current;
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
