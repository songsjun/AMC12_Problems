from __future__ import annotations

import copy
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from amc_content.builder import ContentBuildError, build_artifacts, load_source_form, parse_source_form, review_data
from amc_content.canonical import canonical_json
from amc_content.parser import parse_problem_markdown
from amc_content.validator import (
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
