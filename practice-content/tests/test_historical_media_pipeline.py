from __future__ import annotations

import base64
from io import BytesIO
import json
from pathlib import Path
import struct
import sys
import tempfile
import unittest
import zlib


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
MEDIA_TOOL_DIR = REPOSITORY_ROOT / "practice-content" / "media"
sys.path.insert(0, str(MEDIA_TOOL_DIR))

import build_historical_media as media  # noqa: E402
import render_media as renderer  # noqa: E402


class HistoricalMediaPipelineTests(unittest.TestCase):
    def test_checked_in_manifest_matches_the_archive_emitted_media_inventory(self) -> None:
        output_root = REPOSITORY_ROOT / "practice-content" / "media" / "historical"
        manifest = json.loads((output_root / "media-manifest.json").read_text(encoding="utf-8"))
        discovered, media_inventory = media.discover_media_inventory(REPOSITORY_ROOT)

        self.assertEqual(manifest["schemaVersion"], media.SCHEMA_VERSION)
        self.assertEqual((output_root / "media-report.md").read_text(encoding="utf-8"), media.report_markdown(manifest))
        self.assertEqual(manifest["sourceFormCount"], 48)
        self.assertEqual(manifest["sourceQuestionCount"], 1200)
        self.assertEqual(manifest["mediaInventory"], media_inventory)
        self.assertEqual(manifest["promptAsymptoteInventory"], media_inventory)
        self.assertEqual([asset["id"] for asset in manifest["assets"]], [asset["id"] for asset in discovered])
        self.assertEqual(len(manifest["assets"]), len(discovered))
        self.assertEqual(len(manifest["assets"]), 345)
        self.assertEqual(sum(asset["kind"] == "asymptote" for asset in manifest["assets"]), 283)
        self.assertEqual(sum(asset["kind"] == "aops-file" for asset in manifest["assets"]), 55)
        self.assertEqual(sum(asset["kind"] == "local-image" for asset in manifest["assets"]), 7)
        self.assertEqual(len({asset["output"] for asset in manifest["assets"]}), 344)
        self.assertEqual(media_inventory["localImageCount"], 7)
        self.assertEqual(manifest["retiredManagedOutputs"], media.retired_managed_outputs_document())
        self.assertEqual(
            manifest["retiredManagedOutputs"],
            {
                "private": [
                    "assets/2020-amc-12a/problem-16-asy-01.svg",
                    "assets/2020-amc-12b/problem-11-solution-asy-04.svg",
                    "assets/2022-amc-12b/problem-18-asy-07.svg",
                    "assets/2022-amc-12b/problem-18-solution-asy-05.svg",
                ],
                "public": ["historical-media/assets/2020-amc-12a/problem-16-asy-01.svg"],
            },
        )

        for asset in manifest["assets"]:
            source = asset["source"]
            self.assertTrue(source["markdownPath"].endswith(".md"))
            self.assertIn(source["markdownScope"], {"prompt", "solution"})
            self.assertIn(source["placement"], {"markdown", "requiredMedia"})
            if source["placement"] == "markdown":
                self.assertGreater(source["markdownBlockIndex"], 0)
            else:
                self.assertEqual(source["markdownScope"], "prompt")
                self.assertEqual(source["markdownBlockIndex"], 0)
                self.assertGreater(source["requiredMediaIndex"], 0)

        for scope, expected_fence_count in {"prompt": 165, "solution": 197}.items():
            scope_inventory = media_inventory["scopes"][scope]
            self.assertEqual(scope_inventory["asymptoteFenceCount"], expected_fence_count)
            self.assertEqual(scope_inventory["closedAsymptoteFenceCount"], expected_fence_count)
            self.assertEqual(scope_inventory["renderedAsymptoteFenceCount"], expected_fence_count)
            self.assertFalse(scope_inventory["unresolvedAsymptoteFences"])
        self.assertEqual(media_inventory["scopes"]["prompt"]["localImageCount"], 6)
        self.assertEqual(media_inventory["scopes"]["solution"]["localImageCount"], 1)
        self.assertEqual({asset["source"]["markdownScope"] for asset in manifest["assets"]}, {"prompt", "solution"})

        local_assets = [asset for asset in manifest["assets"] if asset["kind"] == "local-image"]
        self.assertEqual(
            [asset["id"] for asset in local_assets],
            [
                "2025-amc-12a-q05-local-01",
                "2025-amc-12a-q08-local-01",
                "2025-amc-12a-q08-solution-local-01",
                "2025-amc-12a-q10-local-01",
                "2025-amc-12a-q14-local-01",
                "2025-amc-12a-q20-local-01",
                "2025-amc-12a-q24-local-01",
            ],
        )
        expected_local_sources = {
            ("2025_AMC_12A_Problems/Problem_05.md", "prompt", "problem-05-nested-squares.svg"),
            ("2025_AMC_12A_Problems/Problem_08.md", "prompt", "problem-08-cyclic-pentagon.svg"),
            ("2025_AMC_12A_Problems/Problem_08.md", "solution", "problem-08-scaled-construction.svg"),
            ("2025_AMC_12A_Problems/Problem_10.md", "prompt", "problem-10-concentric-arcs.svg"),
            ("2025_AMC_12A_Problems/Problem_14.md", "prompt", "problem-14-tangent-ellipses.svg"),
            ("2025_AMC_12A_Problems/Problem_20.md", "prompt", "problem-20-pentahedron.svg"),
            ("2025_AMC_12A_Problems/Problem_24.md", "prompt", "problem-24-twelve-circles.svg"),
        }
        self.assertEqual(
            {
                (asset["source"]["markdownPath"], asset["source"]["markdownScope"], Path(asset["source"]["localSourcePath"]).name)
                for asset in local_assets
            },
            expected_local_sources,
        )
        for asset in local_assets:
            source = asset["source"]
            self.assertEqual(source["markdownReference"], f"../{source['localSourcePath']}")
            self.assertEqual(source["markdownSyntax"], "markdown-image")
            self.assertEqual(source["placement"], "markdown")
            self.assertGreater(source["markdownBlockIndex"], 0)
            self.assertEqual(source["sourceSha256"], media.sha256_file(REPOSITORY_ROOT / source["localSourcePath"]))
            self.assertEqual(asset["outputSha256"], source["sourceSha256"])
            self.assertNotEqual(asset["replacement"]["sourceMarkdownUrl"], source["markdownReference"])
            self.assertTrue(asset["replacement"]["sourceMarkdownUrl"].startswith("../historical-media/assets/"))

        q10_diagram = next(asset for asset in manifest["assets"] if asset["id"] == "2025-amc-12b-q10-asy-01")
        self.assertEqual(q10_diagram["source"]["rawPath"], "2025_AMC_12B_Problems/Problem_10.raw.txt")
        self.assertEqual(q10_diagram["source"]["extraction"], "raw-diagram-heading-v1")
        self.assertEqual(q10_diagram["source"]["renderTransform"], "q10-explicit-midpoint-ticks-v1")
        self.assertEqual(q10_diagram["replacement"]["publicUrl"], "/historical-media/assets/2025-amc-12b/problem-10-asy-01.svg")

        q8_diagram = next(asset for asset in manifest["assets"] if asset["id"] == "2016-amc-12a-q08-asy-01")
        self.assertEqual(q8_diagram["source"]["extraction"], "raw-asy-tag-v1")
        self.assertEqual(q8_diagram["source"]["markdownContainerIndex"], 1)
        self.assertEqual(q8_diagram["source"]["markdownFenceIndexes"], [1, 2, 3, 4, 5])
        self.assertEqual(
            [
                asset["id"]
                for asset in manifest["assets"]
                if asset["source"].get("markdownPath") == "2016_AMC_12A_Problems/Problem_08.md"
                and asset["source"].get("markdownScope") == "prompt"
                and asset["source"].get("markdownContainerIndex") == 1
            ],
            ["2016-amc-12a-q08-asy-01"],
        )

        raw_fallbacks = {
            asset["id"]: asset["source"]
            for asset in manifest["assets"]
            if asset["source"].get("extraction") == "raw-anchored-asy-v1"
        }
        self.assertEqual(
            set(raw_fallbacks),
            {"2009-amc-12a-q10-asy-01", "2009-amc-12a-q11-asy-01", "2012-amc-12b-q19-asy-01"},
        )
        self.assertEqual(raw_fallbacks["2012-amc-12b-q19-asy-01"]["sourceRepair"], "repair-2012b-q19-inline-comments-v1")

        q9_solution = next(asset for asset in manifest["assets"] if asset["id"] == "2020-amc-12a-q09-solution-asy-01")
        self.assertIn("repair-2020a-q09-inline-comments-v1", q9_solution["source"]["renderTransforms"])
        self.assertIn(r"$y=\cos\left(\frac x2\right)$", media.asymptote_source_for_asset(q9_solution, REPOSITORY_ROOT))

        parenthesized_remote = next(
            asset for asset in manifest["assets"] if asset["id"] == "2019-amc-12b-q20-solution-aops-01"
        )
        self.assertEqual(parenthesized_remote["source"]["markdownPath"], "2019_AMC_12B_Problems/Problem_20.md")
        self.assertEqual(parenthesized_remote["source"]["markdownScope"], "solution")
        self.assertEqual(parenthesized_remote["source"]["placement"], "markdown")
        self.assertEqual(
            parenthesized_remote["source"]["markdownReference"],
            "https://artofproblemsolving.com/wiki/index.php/File:Desmos-graph_(1).png",
        )

        # This is the archive-builder contract that previously failed for all
        # AoPS assets because their source metadata lacked markdownPath.
        from amc_content.archive import _validate_media

        grouped = _validate_media(manifest, media_path=output_root / "media-manifest.json")
        self.assertIn(("2002_AMC_12A_Problems/Problem_11.md", "solution"), grouped)

    def test_every_manifest_asset_has_a_verified_private_and_public_copy(self) -> None:
        output_root = REPOSITORY_ROOT / "practice-content" / "media" / "historical"
        status, failures = media.verify_manifest(output_root, REPOSITORY_ROOT)
        self.assertEqual(status, 0, "\n".join(failures))

        manifest = json.loads((output_root / "media-manifest.json").read_text(encoding="utf-8"))
        for asset in manifest["assets"]:
            replacement = asset["replacement"]
            self.assertEqual(asset["status"], "success")
            self.assertTrue((REPOSITORY_ROOT / replacement["localPath"]).is_file())
            self.assertTrue(replacement["publicUrl"].startswith("/historical-media/assets/"))
            self.assertTrue(replacement["sourceMarkdownUrl"].startswith("../historical-media/assets/"))
            if asset["kind"] == "local-image":
                source_path, source_mime_type = media.local_image_source_for_asset(asset, REPOSITORY_ROOT)
                self.assertEqual(asset["mimeType"], source_mime_type)
                self.assertEqual(asset["outputSha256"], media.sha256_file(source_path))
        for relative in manifest["retiredManagedOutputs"]["private"]:
            self.assertFalse((output_root / relative).exists())
        for relative in manifest["retiredManagedOutputs"]["public"]:
            self.assertFalse((REPOSITORY_ROOT / relative).exists())

        renderer = manifest["renderer"]
        self.assertEqual(renderer["debianSnapshot"], media.RENDERER_DEBIAN_SNAPSHOT)
        self.assertTrue(renderer["imageId"].startswith("sha256:"))

    def test_local_image_discovery_is_scope_complete_and_rejects_unsafe_paths(self) -> None:
        """Every emitted source-local image must become a hash-bound placement."""

        assets, _inventory = media.discover_media_inventory(REPOSITORY_ROOT)
        discovered = {
            (
                asset["source"]["markdownPath"],
                asset["source"]["markdownScope"],
                asset["source"]["markdownReference"],
            )
            for asset in assets
            if asset["kind"] == "local-image"
        }
        expected: set[tuple[str, str, str]] = set()
        for location in media.iter_source_locations(REPOSITORY_ROOT):
            markdown_path = media.relative_to_root(location.markdown_path, REPOSITORY_ROOT)
            for scope in sorted(media.MARKDOWN_SCOPES):
                markdown = media.markdown_scope_for_location(location, REPOSITORY_ROOT, scope)
                for reference, _syntax in media.local_image_references_in_markdown(markdown):
                    expected.add((markdown_path, scope, reference))
        self.assertEqual(discovered, expected)
        self.assertEqual(len(expected), 7)

        valid = "../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg"
        local_path, source = media.resolve_local_image_reference(
            valid,
            markdown_path="2025_AMC_12A_Problems/Problem_05.md",
            repo_root=REPOSITORY_ROOT,
        )
        self.assertEqual(local_path, valid.removeprefix("../"))
        self.assertTrue(source.is_file())
        for unsafe in (
            "../2025_AMC_12A_Problems/media/../Problem_05.md",
            "../2025_AMC_12B_Problems/media/problem-05-nested-squares.svg",
            "../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg?cache=1",
            "https://example.test/diagram.svg",
            "/2025_AMC_12A_Problems/media/problem-05-nested-squares.svg",
        ):
            with self.assertRaises(ValueError, msg=unsafe):
                media.resolve_local_image_reference(
                    unsafe,
                    markdown_path="2025_AMC_12A_Problems/Problem_05.md",
                    repo_root=REPOSITORY_ROOT,
                )

    def test_retirement_only_removes_prior_manifest_outputs_and_preserves_unknown_files(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "repository"
            output_root = root / "practice-content" / "media" / "historical"
            public_root = root / "historical-media"
            private_assets = output_root / "assets"
            public_assets = public_root / "assets"
            private_assets.mkdir(parents=True)
            public_assets.mkdir(parents=True)

            old_output = "assets/retired/old.svg"
            current_output = "assets/current/current.svg"
            private_old = output_root / old_output
            public_old = root / media.replacement_for_output(old_output)["localPath"]
            private_old.parent.mkdir(parents=True)
            public_old.parent.mkdir(parents=True)
            private_old.write_text("old private", encoding="utf-8")
            public_old.write_text("old public", encoding="utf-8")
            private_unknown = private_assets / "unknown.svg"
            public_unknown = public_assets / "unknown.svg"
            private_unknown.write_text("unknown private", encoding="utf-8")
            public_unknown.write_text("unknown public", encoding="utf-8")
            private_current = output_root / current_output
            private_current.parent.mkdir(parents=True)
            private_current.write_text("current", encoding="utf-8")

            prior = {
                "assets": [
                    {"output": old_output, "replacement": media.replacement_for_output(old_output)},
                    # A malformed predecessor entry must not authorize any
                    # deletion outside the explicit managed assets roots.
                    {"output": "../outside.svg", "replacement": media.replacement_for_output("../outside.svg")},
                ]
            }
            current = [
                {
                    "id": "current",
                    "output": current_output,
                    "replacement": media.replacement_for_output(current_output),
                    "status": "success",
                }
            ]
            retired = media.retired_managed_output_paths(
                prior,
                current,
                {"retiredManagedOutputs": media.retired_managed_outputs_document()},
                output_root=output_root,
                repo_root=root,
                public_root=public_root,
            )
            self.assertIn(old_output, retired.private)
            self.assertIn(media.replacement_for_output(old_output)["localPath"], retired.public)
            media.remove_retired_private_outputs(output_root, retired.private)
            media.copy_public_assets(
                current,
                output_root,
                root,
                public_root,
                retired_public_paths=retired.public,
            )

            self.assertFalse(private_old.exists())
            self.assertFalse(public_old.exists())
            self.assertTrue(private_unknown.is_file())
            self.assertTrue(public_unknown.is_file())
            self.assertTrue((public_root / "assets" / "current" / "current.svg").is_file())

    def test_svg_validation_rejects_active_and_external_content(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "unsafe.svg"
            path.write_text("<svg><script>alert(1)</script></svg>", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "blocked <script>"):
                media.validate_svg(path)

            path.write_text('<svg><use href="https://example.test/asset.svg#x" /></svg>', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "non-fragment href reference"):
                media.validate_svg(path)

            path.write_text('<svg><image href="data:image/svg+xml;base64,PHN2Zy8+" /></svg>', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "non-fragment href reference"):
                media.validate_svg(path)
            with self.assertRaisesRegex(ValueError, "non-fragment href reference"):
                renderer.validate_svg(path)

            path.write_text('<svg><image href="data:image/jpeg;base64,not!base64" /></svg>', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "non-fragment href reference"):
                media.validate_svg(path)
            with self.assertRaisesRegex(ValueError, "non-fragment href reference"):
                renderer.validate_svg(path)

    def test_both_svg_validators_accept_only_wrapped_self_contained_raster_data(self) -> None:
        def chunk(kind: bytes, payload: bytes) -> bytes:
            return (
                struct.pack(">I", len(payload))
                + kind
                + payload
                + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
            )

        png = (
            b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00\xff"))
            + chunk(b"IEND", b"")
        )
        jpeg_buffer = BytesIO()
        renderer.Image.new("RGB", (1, 1), (0, 0, 0)).save(jpeg_buffer, format="JPEG")
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "embedded.svg"
            for kind, payload in (("png", png), ("jpeg", jpeg_buffer.getvalue())):
                encoded = base64.b64encode(payload).decode("ascii")
                wrapped = "\n".join((encoded[:20], encoded[20:]))
                path.write_text(
                    f'<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/{kind};base64,{wrapped}" /></svg>',
                    encoding="utf-8",
                )
                media.validate_svg(path)
                renderer.validate_svg(path)

    def test_markdown_visual_discovery_keeps_balanced_parentheses_and_ignores_link_titles(self) -> None:
        reference = "https://artofproblemsolving.com/wiki/index.php/File:Desmos-graph_(1).png"
        markdown = f'[diagram]({reference} "caption")'
        self.assertEqual(list(media.markdown_link_destinations(markdown)), [(0, reference)])
        self.assertEqual(media.visual_references_in_markdown(markdown), [(reference, "markdown-link")])
        with self.assertRaisesRegex(ValueError, "HTML image markup is unsupported"):
            media.visual_references_in_markdown('<img src="https://artofproblemsolving.com/wiki/images/example.png">')

    def test_png_validation_rejects_a_signature_only_fake(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "fake.png"
            path.write_bytes(b"\x89PNG\r\n\x1a\n" + b"not-a-valid-png")
            with self.assertRaisesRegex(ValueError, "missing or empty PNG|truncated PNG chunk"):
                media.validate_png(path)


if __name__ == "__main__":
    unittest.main()
