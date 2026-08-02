/*
 * Local MathJax configuration. Keep this separate from index.html so the
 * practice page can enforce script-src 'self' without unsafe-inline.
 */
window.MathJax = {
  tex: {
    // tex-svg-full ships every extension in one local file, but only these
    // parser packages are activated. In particular, autoload/require/html/
    // action/bbox and textmacros stay unavailable, so TeX cannot create URLs,
    // images, caller-chosen classes/ids/styles, or dynamically load packages.
    // The remaining extensions are the small set used by the AMC archive.
    packages: ['base', 'ams', 'boldsymbol', 'cancel', 'color', 'mathtools', 'newcommand', 'noundefined'],
    // AMC source Markdown has historically used both $...$ and \(...\)
    // delimiters.  A literal dollar must be written as \$ in reviewed
    // content; processEscapes preserves that literal rather than treating it
    // as the start of mathematics.  An unmatched currency dollar (for
    // example "$5") remains ordinary text.
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    processEscapes: true,
    processRefs: false,
    displayMath: [['\\[', '\\]'], ['$$', '$$']],
    maxMacros: 1_000,
    maxBuffer: 20 * 1024
  },
  svg: { fontCache: 'global' },
  options: {
    enableMenu: false,
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  startup: {
    ready() {
      window.MathJax.startup.defaultReady();
      window.dispatchEvent(new Event('mathjax-ready'));
    }
  }
};
