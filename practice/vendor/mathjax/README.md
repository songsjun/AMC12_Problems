# Vendored MathJax

This directory contains the minimal self-hosted MathJax SVG runtime required
by the practice UI:

- `tex-svg-full.js`
- `output/svg/fonts/tex.js`

It was extracted unchanged from the npm package `mathjax@3.2.2` (Apache-2.0;
full package integrity
`sha512-Bt+SSVU8eBG27zChVewOicYs7Xsdt40qm4+UpHyX7k0/O9NliPc+x77k1/FEsPsjKPZGJvtRZM1vO+geW0OhGw==`).
The page pins `tex-svg-full.js` with this SHA-384 SRI value:

```text
sha384-4kE/rQ11E8xT9QgrCBTyvenkuPfQo8rXYQvJZuMgxyPOoUfpatjQPlgdv6V5yhUK
```

`LICENSE` is retained from the upstream package. Do not replace these files
from a CDN at runtime. When upgrading, re-extract the exact package version,
review the license and package integrity, update the SRI hash in
`../../index.html`, and verify that local font-loader paths still work under
the practice CSP.
