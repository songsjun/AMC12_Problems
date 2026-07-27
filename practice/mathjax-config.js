/*
 * Local MathJax configuration. Keep this separate from index.html so the
 * practice page can enforce script-src 'self' without unsafe-inline.
 */
window.MathJax = {
  tex: {
    // AMC source Markdown has historically used both $...$ and \(...\)
    // delimiters.  A literal dollar must be written as \$ in reviewed
    // content; processEscapes preserves that literal rather than treating it
    // as the start of mathematics.  An unmatched currency dollar (for
    // example "$5") remains ordinary text.
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    processEscapes: true,
    displayMath: [['\\[', '\\]'], ['$$', '$$']]
  },
  svg: { fontCache: 'global' },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
  startup: {
    ready() {
      window.MathJax.startup.defaultReady();
      window.dispatchEvent(new Event('mathjax-ready'));
    }
  }
};
