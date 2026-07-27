/* Local MathJax configuration for the public archive. */
window.MathJax = {
  loader: { load: [] },
  tex: {
    // tex-svg-full contains these extensions locally.  Deliberately omit the
    // html, require, autoload, configmacros, and setoptions extensions so
    // unreviewed source cannot request components or inject HTML through TeX.
    packages: {
      '[-]': ['autoload', 'configmacros', 'html', 'require', 'setoptions']
    },
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams'
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
