from __future__ import annotations

import copy
import json
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

from amc_content.builder import ContentBuildError, build_artifacts, load_source_form, parse_source_form, review_data
from amc_content.canonical import canonical_hash, canonical_json, normalize_markdown, sha256_bytes
from amc_content.archive import (
    _archive_scoring_policy,
    _append_required_media,
    _assert_emitted_images_are_manifest_bound,
    _apply_scoped_replacements,
    _assert_emitted_media_is_safe,
    _assert_timed_math_is_well_formed,
    _assert_timed_prompt_is_safe,
    _last_boxed_solution_option,
    _replace_media,
    _validate_media,
)
from amc_content.parser import parse_problem_markdown
from amc_content.validator import (
    archive_public_projection,
    validate_archive_private_manifest,
    validate_archive_public_manifest,
    validate_import_policy,
    validate_private_manifest,
    validate_public_manifest,
)


CONTENT_ROOT = Path(__file__).resolve().parents[1]
AMC_ROOT = CONTENT_ROOT.parent
FIXTURE = CONTENT_ROOT / "fixtures" / "synthetic-25"


class ParserTests(unittest.TestCase):
    def _parse(self, content: str, *, number: int = 1):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "Problem_01.md"
            source.write_text(content, encoding="utf-8")
            return parse_problem_markdown(source, number=number, source_path="Problem_01.md", source_root=Path(directory))

    def test_parser_separates_prompt_choices_and_solution(self) -> None:
        parsed = self._parse(
            """# Demo Problem 1

## Problem
What is the test value?

$\\textbf{(A) } 1 \\qquad \\textbf{(B) } 2 \\qquad \\textbf{(C) } 3 \\qquad \\textbf{(D) } 4 \\qquad \\textbf{(E) } 5$

## Solution 1
The explanation is intentionally separate. The answer is $\\boxed{\\textbf{(E)} 5}$.
"""
        )
        self.assertEqual(parsed.choices, {"A": "$1$", "B": "$2$", "C": "$3$", "D": "$4$", "E": "$5$"})
        self.assertIn("What is the test value?", parsed.prompt_markdown)
        self.assertNotIn("Solution", parsed.prompt_markdown)
        self.assertIn("Solution 1", parsed.solution_markdown)
        self.assertIn("E", parsed.solution_answer_candidates)
        self.assertFalse(parsed.errors)

    def test_parser_exposes_only_first_solution_h2_section(self) -> None:
        parsed = self._parse(
            """# Demo Problem 1

## Problem
What is the test value?

$\\textbf{(A) } 1 \\qquad \\textbf{(B) } 2 \\qquad \\textbf{(C) } 3 \\qquad \\textbf{(D) } 4 \\qquad \\textbf{(E) } 5$

## Solution 1
First explanation. The answer is $\\boxed{\\textbf{(E)} 5}$.

### First-solution detail
This remains part of the first solution.

## Solution 1.1
This alternate explanation must not be exposed. The answer is $\\boxed{\\textbf{(C)} 3}$.

## Solution 2
This later explanation must not be exposed either.
"""
        )
        self.assertIn("Solution 1", parsed.solution_markdown)
        self.assertIn("First-solution detail", parsed.solution_markdown)
        self.assertNotIn("Solution 1.1", parsed.solution_markdown)
        self.assertNotIn("alternate explanation", parsed.solution_markdown)
        self.assertNotIn("Solution 2", parsed.solution_markdown)
        self.assertEqual(parsed.solution_answer_candidates, ["E"])

    def test_parser_uses_only_first_h3_solution_inside_plural_solutions_container(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1

## Problem
What is the test value?

$\textbf{(A) } 1 \qquad \textbf{(B) } 2 \qquad \textbf{(C) } 3 \qquad \textbf{(D) } 4 \qquad \textbf{(E) } 5$

## Solutions
### Solution 1
The first written explanation gives $\boxed{\textbf{(B)} 2}$.

### Solution 2
This later community alternative must not be published. It says $\boxed{\textbf{(C)} 3}$.
"""
        )
        self.assertIn("Solution 1", parsed.solution_markdown)
        self.assertIn("first written explanation", parsed.solution_markdown)
        self.assertNotIn("Solution 2", parsed.solution_markdown)
        self.assertNotIn("later community", parsed.solution_markdown)
        self.assertEqual(parsed.solution_answer_candidates, ["B"])

    def test_parser_skips_a_video_heading_before_the_first_written_solution(self) -> None:
        parsed = self._parse(
            """# Demo Problem 1

## Problem
What is the test value?

$\\textbf{(A) } 1 \\qquad \\textbf{(B) } 2 \\qquad \\textbf{(C) } 3 \\qquad \\textbf{(D) } 4 \\qquad \\textbf{(E) } 5$

## Video Solution
https://example.invalid/video

## Solution 1
The written explanation is the student-facing one. The answer is $\\boxed{\\textbf{(B)} 2}$.
"""
        )
        self.assertNotIn("example.invalid", parsed.prompt_markdown)
        self.assertIn("written explanation", parsed.solution_markdown)
        self.assertNotIn("Video Solution", parsed.solution_markdown)
        self.assertEqual(parsed.solution_answer_candidates, ["B"])
        self.assertFalse(parsed.errors)

    def test_parser_blocks_extra_option_and_unrendered_diagram(self) -> None:
        parsed = self._parse(
            """# Demo Problem 1
## Problem
> [Asymptote diagram - not rendered in Markdown]
```asy
draw((0, 0)--(1, 1));
```
$\\textbf{(A) } 1 \\qquad \\textbf{(B) } 2 \\qquad \\textbf{(C) } 3 \\qquad \\textbf{(D) } 4 \\qquad \\textbf{(E) } 5 \\qquad \\textbf{(F) } 6$
## Solution 1
Fixture explanation.
"""
        )
        codes = {issue.code for issue in parsed.errors}
        self.assertIn("choice-count-invalid", codes)
        self.assertIn("choices-not-a-through-e", codes)
        self.assertIn("unrendered-asymptote", codes)

    def test_parser_blocks_second_problem_variant_before_solution(self) -> None:
        parsed = self._parse(
            """# Demo Problem 1
## Problem
Prompt.
$\\textbf{(A) } 1 \\qquad \\textbf{(B) } 2 \\qquad \\textbf{(C) } 3 \\qquad \\textbf{(D) } 4 \\qquad \\textbf{(E) } 5$
## Problem 1 (translated variant)
Different prompt.
## Solution 1
Explanation.
"""
        )
        self.assertIn("additional-problem-heading", {issue.code for issue in parsed.errors})

    def test_parser_normalizes_legacy_choice_macros_without_losing_values(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problems
Choose the correct value.

$\mathrm{(A) \ 1 }\qquad \textrm{(B) \ 2 }\qquad \text{(C) \ 3 }\qquad (\mathrm{D})\ 4\qquad \textbf{E}\qquad 5$

## Solution
The answer is $\boxed{(D)}$.
"""
        )
        self.assertEqual(parsed.choices, {"A": "$1$", "B": "$2$", "C": "$3$", "D": "$4$", "E": "$5$"})
        self.assertIn("Choose the correct value.", parsed.prompt_markdown)
        self.assertFalse(parsed.errors)

    def test_2026a_q25_mathbf_choices_preserve_values_and_solution_boundary(self) -> None:
        # AoPS 2026 AMC 12A Q25, revision 297600: the source uses mathbf labels.
        prompt = (
            "Let $m$ be a positive integer such that there are at least $50$ positive integers $x$ "
            "less than $m$ for which $x^2-1$ is a multiple of $m$. "
            "What is the sum of the digits of the least possible value of $m$?"
        )
        for choices in (
            r"$\mathbf{(A)} 12\qquad\mathbf{(B)} 15\qquad\mathbf{(C)} 16\qquad\mathbf{(D)} 18\qquad\mathbf{(E)} 22$",
            r"$(\mathbf{A}) 12\qquad(\mathbf{B}) 15\qquad(\mathbf{C}) 16\qquad(\mathbf{D}) 18\qquad(\mathbf{E}) 22$",
            r"$\mathbf{A}\qquad 12\qquad\mathbf{(B)} 15\qquad\mathbf{(C)} 16\qquad\mathbf{(D)} 18\qquad\mathbf{(E)} 22$",
        ):
            with self.subTest(choices=choices):
                parsed = self._parse(
                    "# 2026 AMC 12A Problem 25\n\n## Problem\n" + prompt + "\n\n" + choices
                    + "\n\n## Solution 1\nLet $p^k$ be the largest power of a prime $p$ that divides $x^2-1$.\n",
                    number=25,
                )
                self.assertFalse(parsed.errors)
                self.assertEqual(parsed.choices, dict(zip("ABCDE", ("$12$", "$15$", "$16$", "$18$", "$22$"))))
                self.assertEqual(parsed.prompt_markdown.strip(), prompt)
                self.assertNotIn("largest power", parsed.prompt_markdown)
                self.assertIn("largest power", parsed.solution_markdown)

    def test_parser_removes_an_entire_independently_delimited_final_choice_row(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problem
Which value is shown in the diagram?

$\textbf{(A) }1 \qquad
$\textbf{(B) }2 \qquad$
$\textbf{(C) }3 \qquad$
$\textbf{(D) }4 \qquad$
$\textbf{(E) }5 \qquad$$
## Diagram
Diagram support remains part of the prompt.

## Solution
The answer is $\boxed{\text{(E)}}$.
"""
        )
        self.assertEqual(parsed.choices, {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"})
        self.assertIn("Diagram support remains", parsed.prompt_markdown)
        self.assertNotIn(r"\textbf{(E)}", parsed.prompt_markdown)
        self.assertNotIn("5 \\qquad", parsed.prompt_markdown)

    def test_parser_does_not_leave_the_last_separately_delimited_choice_in_prompt(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problem
Choose a quantity.

$\mathrm{(A)}$\ $\text{one} \qquad\mathrm{(B)}$\ $\text{two} \qquad\mathrm{(C)}$\ $\text{three} \qquad\mathrm{(D)}$\ $\text{four} \qquad\mathrm{(E)}$\ $\text{five}$
## Solution
The answer is $\boxed{\text{(E)}}$.
"""
        )
        self.assertEqual(parsed.choices["E"], r"$\text{five}$")
        self.assertNotIn(r"\text{five}", parsed.prompt_markdown)

    def test_parser_ignores_h2_text_inside_asymptote_fence_and_blocks_media(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problem
```asy
// This is source code, not a Markdown section.
## 1 || 2
draw((0,0)--(1,1));
```
$\textbf{(A) } 1 \qquad \textbf{(B) } 2 \qquad \textbf{(C) } 3 \qquad \textbf{(D) } 4 \qquad \textbf{(E) } 5$

## Graph
Archive graph caption.

## Solution
The answer is $\boxed{\textbf{(A)}}$.
"""
        )
        self.assertEqual(set(parsed.choices), set("ABCDE"))
        self.assertNotIn("unknown-heading-before-solution", {issue.code for issue in parsed.errors})
        self.assertIn("unrendered-asymptote", {issue.code for issue in parsed.errors})

    def test_parser_blocks_aops_file_link_used_as_prompt_media(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problem
[File:diagram.png](https://example.invalid/wiki/File:diagram.png)
$\textbf{(A) } 1 \qquad \textbf{(B) } 2 \qquad \textbf{(C) } 3 \qquad \textbf{(D) } 4 \qquad \textbf{(E) } 5$
## Solution
Explanation.
"""
        )
        self.assertEqual(parsed.media[0]["status"], "remote-unpinned")
        self.assertIn("remote-media-unpinned", {issue.code for issue in parsed.errors})

    def test_parser_blocks_aops_wiki_image_when_export_loses_file_label(self) -> None:
        parsed = self._parse(
            r"""# Demo Problem 1
## Problem
[300px|center](https://artofproblemsolving.com/wiki/index.php/File:diagram.png)
$\textbf{(A) } 1 \qquad \textbf{(B) } 2 \qquad \textbf{(C) } 3 \qquad \textbf{(D) } 4 \qquad \textbf{(E) } 5$
## Solution
Explanation.
"""
        )
        self.assertEqual(parsed.media[0]["reference"], "https://artofproblemsolving.com/wiki/index.php/File:diagram.png")
        self.assertEqual(parsed.media[0]["status"], "remote-unpinned")
        self.assertIn("remote-media-unpinned", {issue.code for issue in parsed.errors})

    def test_historical_plural_solution_container_does_not_publish_later_wrong_option_label(self) -> None:
        source = AMC_ROOT / "2006_AMC_12A_Problems" / "Problem_17.md"
        parsed = parse_problem_markdown(
            source,
            number=17,
            source_path="2006_AMC_12A_Problems/Problem_17.md",
            source_root=AMC_ROOT,
        )
        self.assertIn("Solution 1", parsed.solution_markdown)
        self.assertIn("5}{9}", parsed.solution_markdown)
        self.assertNotIn("Solution 6", parsed.solution_markdown)
        self.assertNotIn("answer choice $\\boxed{C}$", parsed.solution_markdown)


class ArchiveMediaReplacementTests(unittest.TestCase):
    def test_scoped_display_replacement_requires_one_exact_fragment(self) -> None:
        self.assertEqual(
            _apply_scoped_replacements(
                "The relation $A\\perp B$ is shown.",
                [{"from": "$A\\perp B$", "to": "$A\\perp C$"}],
                source_path="fixture/Problem_01.md",
                scope="prompt",
            ).strip(),
            "The relation $A\\perp C$ is shown.",
        )
        with self.assertRaisesRegex(ContentBuildError, "expected one source fragment, found 0"):
            _apply_scoped_replacements(
                "Unrelated text.",
                [{"from": "missing", "to": "replacement"}],
                source_path="fixture/Problem_01.md",
                scope="prompt",
            )

    def test_media_manifest_groups_prompt_and_solution_placements_and_allows_hashed_aliases(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "repository"
            media_path = root / "practice-content" / "media" / "historical" / "media-manifest.json"
            asset_path = root / "historical-media" / "assets" / "fixture.svg"
            asset_path.parent.mkdir(parents=True)
            payload = b"<svg xmlns='http://www.w3.org/2000/svg'/>"
            asset_path.write_bytes(payload)
            replacement = {
                "localPath": "historical-media/assets/fixture.svg",
                "publicUrl": "/historical-media/assets/fixture.svg",
                "sourceMarkdownUrl": "../historical-media/assets/fixture.svg",
            }
            media_path.parent.mkdir(parents=True)
            document = {
                "schemaVersion": "amc12-historical-media-v1",
                "assets": [
                    {
                        "id": "prompt-visual", "kind": "aops-file", "status": "success", "outputSha256": sha256_bytes(payload),
                        "source": {
                            "markdownPath": "fixture/Problem_01.md", "markdownScope": "prompt", "markdownBlockIndex": 1,
                            "markdownReference": "https://artofproblemsolving.com/wiki/index.php/File:fixture.svg",
                        },
                        "replacement": replacement,
                    },
                    {
                        "id": "solution-visual", "kind": "asymptote", "status": "success", "outputSha256": sha256_bytes(payload),
                        "renderAliasOf": "prompt-visual",
                        "source": {
                            "markdownPath": "fixture/Problem_01.md", "markdownScope": "solution", "markdownBlockIndex": 1,
                        },
                        "replacement": replacement,
                    },
                    {
                        "id": "required-visual", "kind": "asymptote", "status": "success", "outputSha256": sha256_bytes(payload),
                        "source": {
                            "markdownPath": "fixture/Problem_01.md", "markdownScope": "prompt", "markdownBlockIndex": 0,
                            "placement": "requiredMedia", "requiredMediaIndex": 1,
                        },
                        "replacement": replacement,
                    },
                ],
            }
            media_path.write_text(json.dumps(document), encoding="utf-8")
            grouped = _validate_media(document, media_path=media_path)
            self.assertEqual([asset["id"] for asset in grouped[("fixture/Problem_01.md", "prompt")]], ["prompt-visual", "required-visual"])
            self.assertEqual([asset["id"] for asset in grouped[("fixture/Problem_01.md", "solution")]], ["solution-visual"])
            document["assets"][0]["replacement"] = {
                **replacement,
                "sourceMarkdownUrl": "../historical-media/assets/../../different-file.svg",
            }
            with self.assertRaisesRegex(ContentBuildError, "sourceMarkdownUrl must match its localPath"):
                _validate_media(document, media_path=media_path)

    def test_media_manifest_binds_local_image_reference_to_hashed_source_file(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "repository"
            media_path = root / "practice-content" / "media" / "historical" / "media-manifest.json"
            source_path = root / "2025_AMC_12A_Problems" / "media" / "fixture.svg"
            output_path = root / "historical-media" / "assets" / "fixture-local.svg"
            payload = b"<svg xmlns='http://www.w3.org/2000/svg'/>"
            source_path.parent.mkdir(parents=True)
            output_path.parent.mkdir(parents=True)
            source_path.write_bytes(payload)
            output_path.write_bytes(payload)
            media_path.parent.mkdir(parents=True)
            reference = "../2025_AMC_12A_Problems/media/fixture.svg"
            document = {
                "schemaVersion": "amc12-historical-media-v1",
                "assets": [{
                    "id": "local-visual",
                    "kind": "local-image",
                    "status": "success",
                    "outputSha256": sha256_bytes(payload),
                    "source": {
                        "localSourcePath": "2025_AMC_12A_Problems/media/fixture.svg",
                        "markdownBlockIndex": 1,
                        "markdownPath": "2025_AMC_12A_Problems/Problem_01.md",
                        "markdownReference": reference,
                        "markdownScope": "prompt",
                        "sourceSha256": sha256_bytes(payload),
                    },
                    "replacement": {
                        "localPath": "historical-media/assets/fixture-local.svg",
                        "publicUrl": "/historical-media/assets/fixture-local.svg",
                        "sourceMarkdownUrl": "../historical-media/assets/fixture-local.svg",
                    },
                }],
            }
            grouped = _validate_media(document, media_path=media_path)
            self.assertEqual([asset["id"] for asset in grouped[("2025_AMC_12A_Problems/Problem_01.md", "prompt")]], ["local-visual"])
            document["assets"][0]["source"]["sourceSha256"] = "0" * 64
            with self.assertRaisesRegex(ContentBuildError, "source hash mismatch"):
                _validate_media(document, media_path=media_path)

    def test_replaces_dimension_labeled_aops_wiki_image(self) -> None:
        prompt, used = _replace_media(
            "[300px|center](https://artofproblemsolving.com/wiki/index.php/File:diagram.png)",
            [{
                "id": "fixture-aops",
                "kind": "aops-file",
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.png"},
            }],
            source_path="fixture/Problem_01.md",
        )
        self.assertEqual(prompt.strip(), "![Archived diagram](../historical-media/assets/fixture.png)")
        self.assertEqual(used, ["fixture-aops"])

    def test_replaces_image_syntax_without_leaving_a_double_exclamation_mark(self) -> None:
        prompt, used = _replace_media(
            "![File:diagram.png](https://artofproblemsolving.com/wiki/index.php/File:diagram.png)",
            [{
                "id": "fixture-aops-image",
                "kind": "aops-file",
                "source": {
                    "markdownBlockIndex": 1,
                    "markdownReference": "https://artofproblemsolving.com/wiki/index.php/File:diagram.png",
                },
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.png"},
            }],
            source_path="fixture/Problem_01.md",
        )
        self.assertEqual(prompt.strip(), "![Archived diagram](../historical-media/assets/fixture.png)")
        self.assertEqual(used, ["fixture-aops-image"])

    def test_replaces_manifest_bound_source_local_image(self) -> None:
        reference = "../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg"
        prompt, used = _replace_media(
            f"![Nested squares]({reference})",
            [{
                "id": "fixture-local-image",
                "kind": "local-image",
                "source": {"markdownBlockIndex": 1, "markdownReference": reference},
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture-local.svg"},
            }],
            source_path="2025_AMC_12A_Problems/Problem_05.md",
        )
        self.assertEqual(prompt.strip(), "![Archived diagram](../historical-media/assets/fixture-local.svg)")
        self.assertEqual(used, ["fixture-local-image"])

    def test_replaces_aops_visual_url_with_parentheses_without_truncation(self) -> None:
        source_url = "https://artofproblemsolving.com/wiki/index.php/File:Desmos-graph_(1).png"
        solution, used = _replace_media(
            f"[900px|caption]({source_url})",
            [{
                "id": "fixture-parenthesized-url",
                "kind": "aops-file",
                "source": {"markdownBlockIndex": 1, "markdownReference": source_url},
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/desmos.png"},
            }],
            source_path="fixture/Problem_20.md",
            scope="solution",
        )
        self.assertEqual(solution.strip(), "![Archived diagram](../historical-media/assets/desmos.png)")
        self.assertEqual(used, ["fixture-parenthesized-url"])

    def test_replaces_mixed_quoted_and_bare_asymptote_fences_in_order(self) -> None:
        prompt, used = _replace_media(
            """> [Asymptote diagram - not rendered in Markdown]
```asy
draw((0,0)--(1,1));
```

```asymptote
draw((0,0)--(2,2));
```""",
            [
                {
                    "id": "fixture-asy-01",
                    "kind": "asymptote",
                    "source": {"markdownBlockIndex": 1},
                    "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture-01.svg"},
                },
                {
                    "id": "fixture-asy-02",
                    "kind": "asymptote",
                    "source": {"markdownBlockIndex": 2},
                    "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture-02.svg"},
                },
            ],
            source_path="fixture/Problem_01.md",
        )
        self.assertNotIn("```", prompt)
        self.assertEqual(used, ["fixture-asy-01", "fixture-asy-02"])
        self.assertIn("fixture-01.svg", prompt)
        self.assertIn("fixture-02.svg", prompt)

    def test_replaces_a_multi_fence_solution_asy_container_once_without_comments(self) -> None:
        solution, used = _replace_media(
            """<asy>
// Converter/source comment that must not be student-visible.
```asy
draw((0,0)--(1,1));
```
```asy
label(\"x\", (1,1));
```
</asy>
Explanation after the diagram.""",
            [{
                "id": "solution-asy-container-01",
                "kind": "asymptote",
                "source": {
                    "markdownBlockIndex": 1,
                    "markdownScope": "solution",
                    "markdownContainerIndex": 1,
                    "markdownFenceIndexes": [1, 2],
                },
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/solution.svg"},
            }],
            source_path="fixture/Problem_01.md",
            scope="solution",
        )
        self.assertEqual(used, ["solution-asy-container-01"])
        self.assertNotIn("```", solution)
        self.assertNotIn("<asy>", solution.lower())
        self.assertNotIn("Converter/source comment", solution)
        self.assertEqual(solution.count("solution.svg"), 1)

    def test_replaces_an_asy_container_nested_in_one_fence(self) -> None:
        prompt, used = _replace_media(
            """> [Asymptote diagram - not rendered in Markdown]
```asy
<asy>draw((0,0)--(1,1));</asy>
```
""",
            [{
                "id": "nested-asy-container-01",
                "kind": "asymptote",
                "source": {
                    "markdownBlockIndex": 1,
                    "markdownContainerIndex": 1,
                    "markdownFenceIndexes": [1],
                },
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/nested.svg"},
            }],
            source_path="fixture/Problem_01.md",
        )
        self.assertEqual(used, ["nested-asy-container-01"])
        self.assertNotIn("```", prompt)
        self.assertNotIn("<asy>", prompt.lower())
        self.assertEqual(prompt.strip(), "![Archived diagram](../historical-media/assets/nested.svg)")

    def test_replaces_an_asy_container_that_crosses_a_fence_boundary(self) -> None:
        prompt, used = _replace_media(
            """<asy>
> [Asymptote diagram - not rendered in Markdown]
```asy
draw((0,0)--(1,1));
</asy>
```
Text after the diagram.
""",
            [{
                "id": "cross-boundary-asy-container-01",
                "kind": "asymptote",
                "source": {
                    "markdownBlockIndex": 1,
                    "markdownContainerIndex": 1,
                    "markdownFenceIndexes": [1],
                },
                "replacement": {"sourceMarkdownUrl": "../historical-media/assets/cross-boundary.svg"},
            }],
            source_path="fixture/Problem_01.md",
        )
        self.assertEqual(used, ["cross-boundary-asy-container-01"])
        self.assertNotIn("```", prompt)
        self.assertNotIn("<asy>", prompt.lower())
        self.assertEqual(
            prompt.strip(),
            "![Archived diagram](../historical-media/assets/cross-boundary.svg)\nText after the diagram.",
        )

    def test_emitted_media_gate_rejects_remote_solution_images(self) -> None:
        for markdown in (
            "![diagram](https://example.test/diagram.png)",
            '<img src="https://example.test/diagram.png">',
        ):
            with self.assertRaisesRegex(ContentBuildError, "emitted solution contains"):
                _assert_emitted_media_is_safe(markdown, source_path="fixture/Problem_01.md", scope="solution")

    def test_emitted_media_gate_rejects_direct_source_local_image(self) -> None:
        with self.assertRaisesRegex(ContentBuildError, "direct source-local image"):
            _assert_emitted_media_is_safe(
                "![diagram](../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg)",
                source_path="2025_AMC_12A_Problems/Problem_05.md",
                scope="prompt",
            )

    def test_emitted_images_must_be_bound_to_their_scoped_manifest_assets(self) -> None:
        asset = {
            "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.svg"},
        }
        _assert_emitted_images_are_manifest_bound(
            "![Archived diagram](../historical-media/assets/fixture.svg)",
            [asset],
            source_path="fixture/Problem_01.md",
            scope="prompt",
        )
        with self.assertRaisesRegex(ContentBuildError, "not bound to a scoped media manifest asset"):
            _assert_emitted_images_are_manifest_bound(
                "![Unexpected image](../historical-media/assets/not-in-manifest.svg)",
                [asset],
                source_path="fixture/Problem_01.md",
                scope="prompt",
            )

    def test_emitted_image_binding_cannot_be_hidden_by_an_unclosed_tex_bracket(self) -> None:
        """A damaged ``[`` before an image must not turn it into a plain link."""

        with self.assertRaisesRegex(ContentBuildError, "not bound to a scoped media manifest asset"):
            _assert_emitted_images_are_manifest_bound(
                "Damaged TeX interval $[0,1$ precedes ![unbound](../not-in-manifest.svg)",
                [],
                source_path="fixture/Problem_01.md",
                scope="prompt",
            )

    def test_emitted_image_binding_rejects_raw_html_and_reference_style_images(self) -> None:
        for markdown in (
            '<img src="../not-in-manifest.svg" alt="unbound">',
            "![unbound][diagram]\n\n[diagram]: ../not-in-manifest.svg",
            "![unbound][]\n\n[unbound]: https://example.test/not-in-manifest.svg",
            "![shortcut]\n\n[shortcut]: ../not-in-manifest.svg",
            "![un\\]bound][ref]\n\n[ref]: ../not-in-manifest.svg",
            "![unbound][re\\]f]\n\n[re\\]f]: ../not-in-manifest.svg",
            "![un[bound]][ref]\n\n[ref]: ../not-in-manifest.svg",
            "> ![quoted]\n>\n> [quoted]: ../not-in-manifest.svg",
            "- ![listed]\n\n    [listed]: ../not-in-manifest.svg",
            "- [ref]: ../not-in-manifest.svg\n\n![ref]",
            "* [ref]: ../not-in-manifest.svg\n\n![ref]",
            "+ [ref]: ../not-in-manifest.svg\n\n![ref]",
            "1. [ref]: ../not-in-manifest.svg\n\n![ref]",
            "1) [ref]: ../not-in-manifest.svg\n\n![ref]",
            "> - [ref]: ../not-in-manifest.svg\n>\n> ![ref]",
            "![foo bar]\n\n[foo\nbar]: ../not-in-manifest.svg",
        ):
            with self.assertRaisesRegex(ContentBuildError, "outside the media manifest contract"):
                _assert_emitted_images_are_manifest_bound(
                    markdown,
                    [],
                    source_path="fixture/Problem_01.md",
                    scope="solution",
                )
        _assert_emitted_images_are_manifest_bound(
            "Hence the interval [0, $\\pi$]: is part of the explanation.",
            [],
            source_path="fixture/Problem_24.md",
            scope="solution",
        )

    def test_emitted_image_binding_does_not_mistake_tex_factorials_for_reference_images(self) -> None:
        _assert_emitted_images_are_manifest_bound(
            "$$n![n+1 + (n+2)(n+1)] = 440 \\cdot n!$$",
            [],
            source_path="fixture/Problem_04.md",
            scope="solution",
        )

    def test_emitted_image_binding_handles_escaped_and_nested_inline_image_labels(self) -> None:
        asset = {"replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.svg"}}
        for markdown in (
            "![un\\]bound](../not-in-manifest.svg)",
            "![un[bound]](../not-in-manifest.svg)",
        ):
            with self.assertRaisesRegex(ContentBuildError, "not bound to a scoped media manifest asset"):
                _assert_emitted_images_are_manifest_bound(
                    markdown,
                    [asset],
                    source_path="fixture/Problem_01.md",
                    scope="solution",
                )
        for markdown in (
            "![bound\\]diagram](../historical-media/assets/fixture.svg)",
            "![bound[diagram]](../historical-media/assets/fixture.svg)",
        ):
            _assert_emitted_images_are_manifest_bound(
                markdown,
                [asset],
                source_path="fixture/Problem_01.md",
                scope="solution",
            )

    def test_emitted_image_binding_handles_whitespace_before_inline_destinations(self) -> None:
        asset = {"replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.svg"}}
        with self.assertRaisesRegex(ContentBuildError, "not bound to a scoped media manifest asset"):
            _assert_emitted_images_are_manifest_bound(
                "![unbound]( ../not-in-manifest.svg)",
                [asset],
                source_path="fixture/Problem_01.md",
                scope="prompt",
            )
        _assert_emitted_images_are_manifest_bound(
            "![bound]( ../historical-media/assets/fixture.svg )",
            [asset],
            source_path="fixture/Problem_01.md",
            scope="prompt",
        )

    def test_required_media_does_not_duplicate_a_visual_already_replaced_in_the_prompt(self) -> None:
        prompt, used = _append_required_media(
            "Question text\n\n![Archived diagram](../historical-media/assets/fixture.png)",
            {"requiredMedia": [{"sourceUrl": "https://artofproblemsolving.com/wiki/index.php/File:fixture.png"}]},
            [
                {
                    "id": "markdown-placement",
                    "kind": "aops-file",
                    "source": {
                        "markdownReference": "https://artofproblemsolving.com/wiki/index.php/File:fixture.png",
                        "placement": "markdown",
                    },
                    "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.png"},
                },
                {
                    "id": "required-placement",
                    "kind": "aops-file",
                    "source": {"placement": "requiredMedia", "requiredMediaIndex": 1},
                    "replacement": {"sourceMarkdownUrl": "../historical-media/assets/fixture.png"},
                },
            ],
            source_path="fixture/Problem_01.md",
        )
        self.assertEqual(prompt.count("fixture.png"), 1)
        self.assertEqual(used, ["required-placement"])

    def test_rejects_unclosed_asymptote_fence_after_replacement(self) -> None:
        with self.assertRaisesRegex(ContentBuildError, "unresolved prompt media"):
            _replace_media(
                "```asy\ndraw((0,0)--(1,1));",
                [],
                source_path="fixture/Problem_01.md",
            )

    def test_rejects_solution_or_modified_variant_leak_in_timed_prompt(self) -> None:
        for prompt in (
            "Question text\n### Solution 1\nThe answer is $\\boxed{\\text{(A)}}$.",
            "Question text ==Solution 1== $\\boxed{\\text{(B)}}$",
            "### Modified Problem in Certain China Testpapers\n$\\boxed{\\text{(C)}}$",
        ):
            with self.assertRaisesRegex(ContentBuildError, "timed prompt contains"):
                _assert_timed_prompt_is_safe(prompt, source_path="fixture/Problem_01.md")

    def test_timed_math_gate_rejects_unclosed_or_mixed_dollar_delimiters(self) -> None:
        _assert_timed_math_is_well_formed(r"A price of \$20 is literal currency and $x+1$ is math.", source_path="fixture/Problem_01.md", scope="prompt")
        _assert_timed_math_is_well_formed(
            r"Both $\frac{a}{d}$ and $\dfrac n{20-n}$ are valid TeX fractions.",
            source_path="fixture/Problem_01.md",
            scope="prompt",
        )
        for text, message in (("The price is $20.", "unclosed"), ("$$x+$y$", "mixes")):
            with self.assertRaisesRegex(ContentBuildError, message):
                _assert_timed_math_is_well_formed(text, source_path="fixture/Problem_01.md", scope="prompt")
        for text in (r"then $\frac$ ad is", r"is $\dfrac$ n{20-n}"):
            with self.assertRaisesRegex(ContentBuildError, "fraction command without arguments"):
                _assert_timed_math_is_well_formed(
                    text, source_path="fixture/Problem_01.md", scope="prompt"
                )


class HistoricalFormattingRegressionTests(unittest.TestCase):
    """Regression coverage for narrow archival display repairs.

    These tests intentionally run the historical overrides against the local
    source rather than a checked-in generated release.  That makes a missing
    exact replacement fail before a release build, while keeping media and API
    concerns outside this content-only regression suite.
    """

    _LEGACY_HTML_RE = re.compile(r"</?(?:ol|li|p|u|b)\b[^>]*>", re.IGNORECASE)
    _VALID_TEX_COMMANDS = frozenset(
        """Delta Omega arctan bigl bigr cup dotsc emph equiv ge geq le leq multicolumn not operatorname parallel phantom pmod textrm vdots Gamma beta binom mathbin mathbb lvert rvert sim Rightarrow bigcup lfloor rfloor ln spadesuit underbrace arcsin arccos bullet overrightarrow succ widehat clubsuit cot diamond ell infty otimes prod small gamma mu neq quad widetilde perp diamondsuit hline in mid alpha gcd mathrm ne begin end heartsuit mathcal qquad textdollar underline angle triangle cdot dfrac log pi overline text sqrt frac left right sin cos tan times ldots cdots circ to tfrac dots textit theta omega sum lcm div pm mod""".split()
    )
    _COMMAND_PREFIXES = tuple(
        sorted(
            """operatorname overline overrightarrow underbrace widetilde mathcal mathbb mathrm textrm textit text right left lfloor rfloor ldots cdots dotsc dfrac tfrac frac sqrt cdot times geq leq sin cos tan cot sec csc log ln ge le""".split(),
            key=len,
            reverse=True,
        )
    )
    _SOLUTION_HTML_SOURCES = (
        "2018_AMC_12A_Problems/Problem_04.md",
        "2018_AMC_12A_Problems/Problem_07.md",
        "2020_AMC_12B_Problems/Problem_19.md",
        "2022_AMC_12A_Problems/Problem_04.md",
        "2022_AMC_12A_Problems/Problem_09.md",
        "2022_AMC_12A_Problems/Problem_19.md",
        "2022_AMC_12B_Problems/Problem_18.md",
        "2022_AMC_12B_Problems/Problem_22.md",
        "2024_AMC_12A_Problems/Problem_04.md",
    )

    @staticmethod
    def _number(source_path: str) -> int:
        return int(Path(source_path).stem.rsplit("_", 1)[1])

    @staticmethod
    def _overrides() -> dict:
        return json.loads((CONTENT_ROOT / "historical-overrides.json").read_text(encoding="utf-8"))["overrides"]

    @classmethod
    def _compact_command_merges(cls, markdown: str) -> list[tuple[str, str, str]]:
        matches: list[tuple[str, str, str]] = []
        for match in re.finditer(r"\\\\([A-Za-z]+)", markdown):
            command = match.group(1)
            if command in cls._VALID_TEX_COMMANDS:
                continue
            for prefix in cls._COMMAND_PREFIXES:
                if command.startswith(prefix) and len(command) > len(prefix):
                    matches.append((command, prefix, command[len(prefix):]))
                    break
        return matches

    def _parsed_prompt(self, source_path: str, override: dict) -> tuple[str, dict]:
        parsed = parse_problem_markdown(
            AMC_ROOT / source_path,
            number=self._number(source_path),
            source_path=source_path,
            source_root=AMC_ROOT,
        )
        prompt = normalize_markdown(override.get("promptMarkdown", parsed.prompt_markdown))
        prompt = _apply_scoped_replacements(
            prompt,
            override.get("promptReplacements"),
            source_path=source_path,
            scope="prompt",
        )
        return prompt, override.get("choices", parsed.choices)

    def test_all_timed_content_has_no_high_confidence_compact_tex_command_merges(self) -> None:
        overrides = self._overrides()
        findings: list[str] = []
        for directory in sorted(AMC_ROOT.glob("*_AMC_12[AB]_Problems")):
            for number in range(1, 26):
                source_path = f"{directory.name}/Problem_{number:02d}.md"
                override = overrides.get(source_path, {})
                prompt, choices = self._parsed_prompt(source_path, override)
                for scope, markdown in [("prompt", prompt), *((f"choice {option}", value) for option, value in choices.items())]:
                    for command, prefix, suffix in self._compact_command_merges(markdown):
                        findings.append(f"{source_path} {scope}: \\{command} ({prefix} + {suffix})")
        self.assertEqual(findings, [])

    def test_wiki_only_prompt_markup_is_removed_from_student_content(self) -> None:
        overrides = self._overrides()
        expected = {
            "2012_AMC_12A_Problems/Problem_21.md": "$a\\ge b\\ge c$",
            "2014_AMC_12A_Problems/Problem_16.md": "$(8)(\\dots 8)$",
        }
        for source_path, expected_fragment in expected.items():
            prompt, _ = self._parsed_prompt(source_path, overrides[source_path])
            self.assertIn(expected_fragment, prompt)
            self.assertNotRegex(prompt, r"(?i)<!--|</?onlyinclude\b")

    def test_first_solutions_convert_all_legacy_html_markup_after_media_replacement(self) -> None:
        overrides = self._overrides()
        source_html_paths: set[str] = set()
        for directory in sorted(AMC_ROOT.glob("*_AMC_12[AB]_Problems")):
            for number in range(1, 26):
                source_path = f"{directory.name}/Problem_{number:02d}.md"
                parsed = parse_problem_markdown(
                    AMC_ROOT / source_path,
                    number=number,
                    source_path=source_path,
                    source_root=AMC_ROOT,
                )
                if self._LEGACY_HTML_RE.search(parsed.solution_markdown):
                    source_html_paths.add(source_path)
        self.assertEqual(source_html_paths, set(self._SOLUTION_HTML_SOURCES))

        media_path = CONTENT_ROOT / "media" / "historical" / "media-manifest.json"
        media_by_scope = _validate_media(
            json.loads(media_path.read_text(encoding="utf-8")),
            media_path=media_path,
        )
        for source_path in self._SOLUTION_HTML_SOURCES:
            override = overrides[source_path]
            parsed = parse_problem_markdown(
                AMC_ROOT / source_path,
                number=self._number(source_path),
                source_path=source_path,
                source_root=AMC_ROOT,
            )
            solution = normalize_markdown(override.get("solutionMarkdown", parsed.solution_markdown))
            assets = media_by_scope.get((source_path, "solution"), [])
            solution, _ = _replace_media(solution, assets, source_path=source_path, scope="solution")
            solution = _apply_scoped_replacements(
                solution,
                override.get("solutionReplacements"),
                source_path=source_path,
                scope="solution",
            )
            self.assertNotRegex(solution, self._LEGACY_HTML_RE)
            for asset in assets:
                self.assertIn(asset["replacement"]["sourceMarkdownUrl"], solution)


class ArchiveManifestValidationTests(unittest.TestCase):
    def test_final_boxed_answer_cross_check_does_not_read_a_later_choice_reference(self) -> None:
        self.assertEqual(
            _last_boxed_solution_option(
                "The answer is $\\boxed{B}$. A later sentence discusses whether (E) can be eliminated."
            ),
            "B",
        )
        self.assertEqual(_last_boxed_solution_option("Thus $\\boxed{\\text{(D)}~11}$ is correct."), "D")
        self.assertEqual(_last_boxed_solution_option("Therefore $\\fbox{\\textrm{A}}$ is required."), "A")

    def _private_archive_fixture(self) -> dict:
        questions = []
        for number in range(1, 26):
            is_scored = number != 25
            questions.append(
                {
                    "number": number,
                    "sourceRef": {"path": f"fixture/Problem_{number:02d}.md", "sha256": "a" * 64},
                    "promptMarkdown": f"Question {number}",
                    "choices": {option: option for option in "ABCDE"},
                    "correctOption": "D" if number == 12 else ("A" if is_scored else None),
                    "acceptedOptions": ["D", "E"] if number == 12 else (["A"] if is_scored else []),
                    "isScored": is_scored,
                    "solutionMarkdown": "Written solution."
                }
            )
        private = {
            "schemaVersion": "amc-practice-archive-form-v1",
            "id": "fixture-archive",
            "version": "r1",
            "title": "Fixture archive",
            "publicationStatus": "archive-practice",
            "isSynthetic": False,
            "durationSeconds": 4500,
            "scoringPolicyVersion": "archive-fixture-v1",
            "scoringPolicy": {
                "version": "archive-fixture-v1",
                "correct": 6,
                "blank": 1.5,
                "incorrect": 0,
                "questionCount": 25,
                "scoredQuestionCount": 24,
                "maxScore": 144,
            },
            "questionBundleHash": "b" * 64,
            "archiveNotice": "Archive-practice score.",
            "questions": questions,
            "provenance": {
                "releaseAuthorization": {"status": "authorized-archive-practice"},
                "answerKey": {"catalogHash": "c" * 64},
                "media": {"assetIds": []},
                "sourceRepairs": [],
            },
        }
        public = archive_public_projection(private)
        private["contentHash"] = public["contentHash"]
        private["manifestHash"] = canonical_hash(private)
        return private

    def test_archive_contract_handles_multiple_accepted_answers_and_unscored_item(self) -> None:
        private = self._private_archive_fixture()
        public = archive_public_projection(private)
        self.assertEqual(validate_archive_private_manifest(private), [])
        self.assertEqual(validate_archive_public_manifest(public), [])
        self.assertEqual(private["questions"][11]["acceptedOptions"], ["D", "E"])
        self.assertIsNone(private["questions"][24]["correctOption"])
        self.assertNotIn("correctOption", public["questions"][11])
        self.assertFalse(public["questions"][24]["isScored"])

    def test_historical_blank_policy_changes_after_2006_and_is_enforced_for_canonical_ids(self) -> None:
        self.assertEqual(_archive_scoring_policy(2004, 25)["blank"], 2.5)
        self.assertEqual(_archive_scoring_policy(2004, 25)["version"], "amc12-archive-2002-2006-v1")
        self.assertEqual(_archive_scoring_policy(2007, 25)["blank"], 1.5)
        self.assertEqual(_archive_scoring_policy(2007, 25)["version"], "amc12-archive-2007-plus-v1")

        private = self._private_archive_fixture()
        private["id"] = "amc12-2004-a"
        private["scoringPolicy"] = _archive_scoring_policy(2004, 24)
        private["scoringPolicyVersion"] = private["scoringPolicy"]["version"]
        public = archive_public_projection(private)
        private["contentHash"] = public["contentHash"]
        private["manifestHash"] = canonical_hash(private, omit=("manifestHash",))
        self.assertEqual(validate_archive_private_manifest(private), [])

        private["scoringPolicy"]["blank"] = 1.5
        errors = validate_archive_private_manifest(private)
        self.assertIn("archive AMC 12 scoringPolicy.blank must be 2.5 for 2004", errors)

    def test_2026a_uses_modern_scoring_and_2026b_is_not_released(self) -> None:
        private = self._private_archive_fixture()
        private["id"] = "amc12-2026-a"
        private["scoringPolicy"] = _archive_scoring_policy(2026, 24)
        private["scoringPolicyVersion"] = private["scoringPolicy"]["version"]
        self.assertEqual(private["scoringPolicy"]["blank"], 1.5)
        private["contentHash"] = archive_public_projection(private)["contentHash"]
        private["manifestHash"] = canonical_hash(private, omit=("manifestHash",))
        self.assertEqual(validate_archive_private_manifest(private), [])
        self.assertEqual(validate_archive_public_manifest(archive_public_projection(private)), [])

        private["id"] = "amc12-2026-b"
        self.assertIn(
            "archive AMC 12 id must be a 2002–2025 A/B paper or 2026 A",
            validate_archive_private_manifest(private),
        )


class ArtifactTests(unittest.TestCase):
    def _fixture_form(self):
        return load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)

    def test_synthetic_fixture_builds_only_with_development_flag(self) -> None:
        form = self._fixture_form()
        with self.assertRaises(ContentBuildError) as rejected:
            build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json")
        self.assertIn("allow-test-only", str(rejected.exception))

        public, private, review = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )
        self.assertEqual(review["summary"]["errors"], 0)
        self.assertEqual(validate_public_manifest(public), [])
        self.assertEqual(validate_private_manifest(private), [])
        self.assertEqual(validate_import_policy(private), ["test-only or synthetic manifests require an explicit development import flag"])
        self.assertEqual(validate_import_policy(private, allow_test_only=True), [])
        self.assertNotIn("correctOption", public["questions"][0])
        self.assertNotIn("solutionMarkdown", public["questions"][0])
        self.assertEqual(private["questions"][0]["correctOption"], "A")
        self.assertIn("solutionMarkdown", private["questions"][0])
        self.assertEqual(private["durationSeconds"], 4500)
        self.assertEqual(private["scoringPolicy"], {
            "version": "amc12-2025-practice-v1",
            "correct": 6,
            "blank": 1.5,
            "incorrect": 0,
            "questionCount": 25,
            "maxScore": 150,
            "scope": "Synthetic integration fixture only.",
        })

    def test_approved_key_must_bind_exact_question_bundle(self) -> None:
        form = self._fixture_form()
        key = json.loads((FIXTURE / "approved-answer-key.json").read_text(encoding="utf-8"))
        key["questionBundleHash"] = "0" * 64
        with tempfile.TemporaryDirectory() as directory:
            bad_key = Path(directory) / "bad-key.json"
            bad_key.write_text(json.dumps(key), encoding="utf-8")
            with self.assertRaises(ContentBuildError) as rejected:
                build_artifacts(form, answer_key_path=bad_key, allow_test_only=True)
        self.assertIn("questionBundleHash", str(rejected.exception))

    def test_answer_key_requires_two_distinct_reviewers(self) -> None:
        form = self._fixture_form()
        key = json.loads((FIXTURE / "approved-answer-key.json").read_text(encoding="utf-8"))
        key["approval"]["reviewedBy"] = ["only-one-reviewer"]
        with tempfile.TemporaryDirectory() as directory:
            bad_key = Path(directory) / "bad-key.json"
            bad_key.write_text(json.dumps(key), encoding="utf-8")
            with self.assertRaises(ContentBuildError) as rejected:
                build_artifacts(form, answer_key_path=bad_key, allow_test_only=True)
        self.assertIn("two distinct", str(rejected.exception))

    def test_draft_template_can_never_be_used_as_a_key(self) -> None:
        form = self._fixture_form()
        with self.assertRaises(ContentBuildError) as rejected:
            build_artifacts(
                form,
                answer_key_path=CONTENT_ROOT / "forms" / "2025-amc-12a" / "approved-answer-key.template.json",
                allow_test_only=True,
            )
        self.assertIn("formId", str(rejected.exception))

    def test_canonical_build_is_deterministic(self) -> None:
        form = self._fixture_form()
        first = build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json", allow_test_only=True)
        second = build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json", allow_test_only=True)
        self.assertEqual(first[0], second[0])
        self.assertEqual(first[1], second[1])

    def test_integral_float_scores_canonicalize_for_the_node_importer(self) -> None:
        form = self._fixture_form()
        form.data = copy.deepcopy(form.data)
        form.data["scoringPolicy"]["correct"] = 6.0
        form.data["scoringPolicy"]["maxScore"] = 150.0
        _, private, _ = build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json", allow_test_only=True)
        encoded = canonical_json(private)
        self.assertIn('"correct":6', encoded)
        self.assertNotIn('"correct":6.0', encoded)
        result = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                "import { readFileSync } from 'node:fs'; import { normalizeManifest } from './src/manifest.js'; normalizeManifest(JSON.parse(readFileSync(0, 'utf8')));",
            ],
            cwd=AMC_ROOT / "practice-api",
            input=encoded,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_nonfinite_or_overprecise_scores_cannot_build(self) -> None:
        for value, expected in ((float("nan"), "finite"), (0.000001, "decimal places")):
            form = self._fixture_form()
            form.data = copy.deepcopy(form.data)
            form.data["scoringPolicy"]["blank"] = value
            with self.assertRaises(ContentBuildError) as rejected:
                build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json", allow_test_only=True)
            self.assertIn(expected, str(rejected.exception))

    def test_public_validator_rejects_private_source_reference(self) -> None:
        form = self._fixture_form()
        public, _, _ = build_artifacts(form, answer_key_path=FIXTURE / "approved-answer-key.json", allow_test_only=True)
        public["questions"][0]["sourceRef"] = {"path": "do-not-leak.md", "sha256": "0" * 64}
        self.assertTrue(any("sourceRef" in error for error in validate_public_manifest(public)))


class ExistingSourceReviewTests(unittest.TestCase):
    def test_2025_candidate_has_clean_structure_but_remains_release_blocked(self) -> None:
        form = load_source_form(
            CONTENT_ROOT / "forms" / "2025-amc-12a" / "source-form.json",
            source_root=AMC_ROOT,
        )
        parsed = parse_source_form(form)
        review = review_data(form, parsed)
        self.assertEqual(len(parsed), 25)
        self.assertTrue(review["summary"]["publishable"])
        expected_first_solution_options = [
            "E", "B", "A", "B", "D", "B", "C", "E", "E", "B",
            "A", "B", "D", "D", "C", "D", "A", "C", "E", "C",
            "A", "E", "C", "C", "E",
        ]
        self.assertEqual(
            [question.solution_answer_candidates for question in parsed],
            [[option] for option in expected_first_solution_options],
        )
        # The student-facing explanation is intentionally a single written H2
        # section. In particular, a video link must not become Question 5's
        # selected "solution" merely because it was earlier in the source.
        self.assertNotIn("youtube", parsed[4].solution_markdown.lower())
        self.assertNotIn("Solution 2", parsed[4].solution_markdown)
        problems = {question["number"]: question for question in review["questions"]}
        self.assertEqual(set(problems[25]["choices"]), set("ABCDE"))
        for number in (5, 8, 10, 14, 20, 24):
            self.assertTrue(problems[number]["media"])
            self.assertTrue(all(item["status"] == "present" for item in problems[number]["media"]))
        for entry in form.data["sourceFiles"]:
            source = (AMC_ROOT / entry["path"]).read_text(encoding="utf-8")
            self.assertNotIn("[Asymptote diagram - not rendered", source)
            self.assertNotIn("```asy", source)
            self.assertNotIn(r"\logv", source)
            self.assertNotIn(r"\bullet", source)

        provisional = json.loads(
            (CONTENT_ROOT / "forms" / "2025-amc-12a" / "first-solution-answer-key.provisional.json").read_text(encoding="utf-8")
        )
        self.assertTrue(provisional["notForScoring"])
        self.assertEqual(provisional["status"], "requires-independent-verification")
        self.assertEqual(provisional["questionBundleHash"], review["questionBundleHash"])
        self.assertEqual([answer["number"] for answer in provisional["answers"]], list(range(1, 26)))
        self.assertEqual(
            [answer["provisionalOption"] for answer in provisional["answers"]],
            expected_first_solution_options,
        )

        # A future metadata approval must not accidentally turn this
        # first-solution reading record into a grading key. Simulate the
        # source-form gate having been cleared, then prove the key contract
        # itself still rejects the provisional schema.
        approved_form = copy.deepcopy(form)
        approved_form.data = copy.deepcopy(form.data)
        approved_form.data["publicationStatus"] = "approved"
        approved_form.data["contentRights"]["status"] = "approved"
        with self.assertRaises(ContentBuildError) as rejected_provisional:
            build_artifacts(
                approved_form,
                answer_key_path=CONTENT_ROOT / "forms" / "2025-amc-12a" / "first-solution-answer-key.provisional.json",
            )
        self.assertIn("approved answer key missing fields: approval", str(rejected_provisional.exception))

        with self.assertRaises(ContentBuildError) as rejected:
            build_artifacts(
                form,
                answer_key_path=CONTENT_ROOT / "forms" / "2025-amc-12a" / "approved-answer-key.template.json",
            )
        self.assertIn("publicationStatus approved", str(rejected.exception))


if __name__ == "__main__":
    unittest.main()
