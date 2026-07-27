# Public archive runtime dependencies

The archive deliberately has no runtime CDN dependencies.  These files are
copied unchanged from the exact npm packages below, retain their upstream
licenses, and are pinned in both reader pages with SHA-384 Subresource
Integrity (SRI).  The package tarball integrity records make the extraction
reproducible.

| Runtime | Version | npm tarball integrity | Local asset |
| --- | --- | --- | --- |
| Marked | 18.0.7 | `sha512-iDVQ5ldaiKXn6b2JroX5kgRfmwgqolW7NpaEzTl1k/2Zh1njIEN9yniyLV/mOvWwtsE8OGgkjsCYvijuPk1dtA==` | `vendor/marked/marked.umd.js` |
| DOMPurify | 3.4.12 | `sha512-zQvGet8Z2sWbQhCmfFz/T5QWH2oBmjnqK3qvOjaqaNLrLEF912WamU+ohnTp0TCep/MFVHpdJuCZEdFOdTnEFg==` | `vendor/dompurify/purify.min.js` |
| MathJax SVG | 3.2.2 | `sha512-Bt+SSVU8eBG27zChVewOicYs7Xsdt40qm4+UpHyX7k0/O9NliPc+x77k1/FEsPsjKPZGJvtRZM1vO+geW0OhGw==` | `../practice/vendor/mathjax/tex-svg-full.js` |

`npm run verify` validates every page's SRI value against the checked-in
asset, checks that no remote script or inline handler remains, runs the
Markdown/link unit tests, and executes a browser XSS smoke test.  When
updating a dependency, re-extract only the declared package version, review
its license and integrity, update the table and SRI, then run that command.
