# Historical AMC 12 local media pipeline

This directory creates local, verifiable image assets for every **archive-
emitted prompt and first-solution** diagram in the 48 archived AMC 12 forms.
It does not alter source Markdown or publish a form. The private build output
lives below this directory, while the verified public copies live at the repository root in
`historical-media/assets/` so they are served by the normal static site rather
than the Nginx-denied `practice-content/` path.

Each manifest source is scoped as `prompt` or `solution`. A plain Asymptote
fence is placed by its scope-local `markdownBlockIndex`; an old `<asy>` wrapper
that the converter split into several fences is placed once by
`markdownContainerIndex` plus its complete `markdownFenceIndexes` list. This
prevents a single finished diagram from appearing multiple times. Remote AoPS
references retain their exact scoped `markdownReference`. For every item,
`replacement.localPath` points to the public local file, `replacement.publicUrl`
is its same-origin root URL, and `replacement.sourceMarkdownUrl` is
`../historical-media/...`, which works beneath both the direct static mount and
the portal's `/amc12/practice/` mount.

Discovery starts from exactly the Markdown that archive emits, including
approved `promptMarkdown`/`solutionMarkdown` overrides. Raw
`Problem_XX.raw.txt` files are used only where an intact `<asy>` wrapper (or a
small hash-bound recovery profile) provides the canonical renderer source.

## Security model

- The host script writes private build output under
  `practice-content/media/historical/` and atomically stages verified public
  copies under the repository-owned `historical-media/assets/` path.
- AoPS file pages and downloads must use HTTPS, the exact
  `artofproblemsolving.com` host, and a `/wiki/images/` original-image URL.
- Remote downloads are capped at 20 MiB and signature-checked as PNG, GIF, or
  JPEG. They are converted to deterministic local PNG output in the container.
- Asymptote source is rejected when it contains process/file-operation calls.
- SVG output must be XML without DTD/entity declarations, active-content
  elements, or non-fragment external references. The only exception is a
  bounded, strictly decoded self-contained PNG/JPEG `data:` image emitted by
  Asymptote's headless 3D renderer; SVG/HTML data and all external URLs remain
  blocked.
- Rendering is Docker-only: no host package installation, no container network,
  read-only root filesystem, dropped Linux capabilities, no-new-privileges,
  PID/memory limits, read-only inputs, and a small temporary filesystem.
- The manifest records every source raw path, source/download hash, output hash,
  status, and any failure. The verifier fails if a listed item is missing,
  malformed, hash-mismatched, or non-successful.

The renderer base image is a pinned Debian digest. Its Dockerfile installs
Asymptote plus the TeX packages needed for text labels and Pillow for safe raster
normalization; nothing is installed on the host.

## Build

Run from the `AMC12_Problems` repository root:

```sh
python3 practice-content/media/build_historical_media.py --build-image
```

This writes generated inputs under `historical/staging/`, private rendered
assets under `historical/assets/`, public copies under
`../../historical-media/assets/`, and these auditable outputs:

- `historical/media-manifest.json`
- `historical/media-report.md`

Re-run after changing a raw source or the renderer. The only automatically
deleted path is the pipeline-owned `historical/staging/` directory; existing
assets are overwritten only when a job renders the same explicit asset path.
The private `historical/downloads/` cache preserves verified source-image bytes
and resolved URLs between reruns, so a repeat build does not unnecessarily
request AoPS again. It is intentionally ignored by Git; the rendered outputs,
manifest, and report are the tracked release artifacts.

## Verify

```sh
python3 practice-content/media/build_historical_media.py --verify
```

The command validates every manifest item, checks SVG XML or PNG signatures,
and compares both the private and public-copy SHA-256 values with the manifest.
It exits nonzero on any failure, so it is suitable for CI before content
publication.

## Current discovery scope

The exact placement and renderer-job counts are generated in
`historical/media-report.md`, rather than maintained manually in this README.
The pipeline fails closed if a closed prompt or solution fence lacks an asset,
if an unreplaceable HTML image is found, or if a source-recovery hash/anchor no
longer matches. The audited 2025 AMC 12B Problem 10 raw Diagram extraction and
its visible midpoint-tick compatibility transform are recorded in the manifest.
