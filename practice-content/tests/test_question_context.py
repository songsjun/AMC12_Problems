from __future__ import annotations

import json
import os
import copy
import multiprocessing
import re
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from amc_content.builder import ContentBuildError, build_artifacts, load_source_form
from amc_content.canonical import canonical_hash, canonical_json, sha256_text
from amc_content.cli import _resolve_private_context_outputs, _write_context_output_pair_atomic, build_parser, main
from amc_content.parser import parse_problem_markdown
from amc_content.question_context import (
    archive_question_context_set_markdown,
    build_archive_question_context_set,
    build_question_context,
    build_question_context_set,
    extract_written_solution_sections,
    question_context_markdown,
    question_context_set_markdown,
    validate_archive_question_context_set,
    validate_question_context,
    validate_question_context_set,
)


CONTENT_ROOT = Path(__file__).resolve().parents[1]
AMC_ROOT = CONTENT_ROOT.parent
FIXTURE = CONTENT_ROOT / "fixtures" / "synthetic-25"


def _source_with_solutions(solutions: str) -> str:
    return rf"""# Demo Problem 1

## Problem
What is the test value?

$\textbf{{(A) }} 1 \qquad \textbf{{(B) }} 2 \qquad \textbf{{(C) }} 3 \qquad \textbf{{(D) }} 4 \qquad \textbf{{(E) }} 5$

{solutions}
"""


def _run_context_cli_after_barrier(barrier, results, argv: list[str]) -> None:
    """Process target used to exercise the private-root flock."""

    barrier.wait(timeout=20)
    results.put(main(argv))


class WrittenSolutionExtractionTests(unittest.TestCase):
    def _write(self, directory: str, solutions: str) -> Path:
        source = Path(directory) / "Problem_01.md"
        source.write_text(_source_with_solutions(solutions), encoding="utf-8")
        return source

    def test_extracts_h2_solutions_and_h3_children_in_source_order(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = self._write(
                directory,
                """## Solution 1 (Algebra)
First body.

## Solutions
Container preamble is metadata and not a solution.

### Solution 2 (Geometry)
Second body.

### Note
Community maintenance note.

### Video Solution
https://example.invalid/video

### Solution 3 (Casework)
Third body.

## Video Solution by Example
https://example.invalid/h2-video

## See Also
External material.

## Solution by Alcumus
Fourth body.
""",
            )
            sections = extract_written_solution_sections(source, source_path="fixture/Problem_01.md")

        self.assertEqual(
            [section.title for section in sections],
            ["Solution 1 (Algebra)", "Solution 2 (Geometry)", "Solution 3 (Casework)", "Solution by Alcumus"],
        )
        self.assertEqual([section.heading_level for section in sections], [2, 3, 3, 2])
        self.assertEqual([section.source_order for section in sections], [1, 2, 3, 4])
        combined = "\n".join(section.body_markdown for section in sections)
        self.assertNotIn("Container preamble", combined)
        self.assertNotIn("Community maintenance", combined)
        self.assertNotIn("example.invalid", combined)
        self.assertNotIn("External material", combined)

    def test_splits_singular_h2_wrapper_and_legacy_direct_h3_solutions(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = self._write(
                directory,
                """### Solution 0 (legacy direct child)
Direct H3 body.

## Solution
### Solution 1
First wrapped body.
### Solution 2
Second wrapped body.

## Solution 3
Ordinary H2 body.
""",
            )
            sections = extract_written_solution_sections(source)

        self.assertEqual(
            [section.title for section in sections],
            ["Solution 0 (legacy direct child)", "Solution 1", "Solution 2", "Solution 3"],
        )
        self.assertEqual([section.heading_level for section in sections], [3, 3, 3, 2])
        self.assertNotIn("Solution", [section.title for section in sections])

    def test_real_h4_solutions_use_markdown_sibling_boundaries(self) -> None:
        mixed = extract_written_solution_sections(
            AMC_ROOT / "2020_AMC_12A_Problems" / "Problem_16.md",
            source_path="2020_AMC_12A_Problems/Problem_16.md",
        )
        self.assertEqual(mixed[0].title, "Solution 1")
        self.assertEqual(mixed[0].heading_level, 4)
        self.assertEqual(mixed[1].title, "Solution 2")
        self.assertNotIn("Solution 2", mixed[0].body_markdown)

        nested = extract_written_solution_sections(
            AMC_ROOT / "2004_AMC_12A_Problems" / "Problem_21.md",
            source_path="2004_AMC_12A_Problems/Problem_21.md",
        )
        self.assertEqual([section.title for section in nested[:3]], ["Solution 1", "Solution 1a", "Solution 2"])
        self.assertEqual([section.heading_level for section in nested[:3]], [3, 4, 3])
        self.assertNotIn("Solution 1a", nested[0].body_markdown)

    def test_ignores_fenced_headings_and_removes_nested_video_metadata_editorial(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = self._write(
                directory,
                """## Solution 1
Proof starts.

```text
## Solution inside a fence
### Video Solution inside a fence
```

### Video Solution
https://example.invalid/video

### Note
Editor metadata.

### Another note
More metadata.

### Useful derivation
This detail remains part of Solution 1.

## Solution 2
Second proof.
""",
            )
            sections = extract_written_solution_sections(source)

        self.assertEqual([section.title for section in sections], ["Solution 1", "Solution 2"])
        self.assertIn("## Solution inside a fence", sections[0].body_markdown)
        self.assertIn("Useful derivation", sections[0].body_markdown)
        self.assertNotIn("example.invalid", sections[0].body_markdown)
        self.assertNotIn("Editor metadata", sections[0].body_markdown)
        self.assertNotIn("More metadata", sections[0].body_markdown)
        self.assertEqual(len(sections[0].excluded_source_ranges), 3)
        emitted = sections[0].as_dict()
        self.assertEqual(emitted["bodySha256"], sha256_text(sections[0].body_markdown))
        self.assertTrue(all(item["kind"] == "excluded-heading" for item in emitted["excludedSourceRanges"]))

    def test_quarantine_rules_are_explicit_and_never_approve(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = self._write(
                directory,
                """## Solution 1 (Cheese)
Guess from the choices.
## Solution 2 (Rigid solving, no cheese)
A complete derivation.
## Solution 3 (does not actually work)
A broken derivation.
## Solution 4 (Worst possible solution)
An intentionally poor method.
## Solution 5 (Fakesolve)
Pattern matching only.
## Solution 6 (Algebra)
A normal derivation.
## Solution for Certain China Testpapers
This solves a modified prompt.
""",
            )
            sections = extract_written_solution_sections(source)

        self.assertEqual(
            [section.review_status for section in sections],
            [
                "quarantined",
                "candidate",
                "quarantined",
                "quarantined",
                "quarantined",
                "candidate",
                "quarantined",
            ],
        )
        self.assertIn("title-says-cheese", sections[0].quarantine_reasons)
        self.assertNotIn("title-says-cheese", sections[1].quarantine_reasons)
        self.assertIn("title-says-does-not-work", sections[2].quarantine_reasons)
        self.assertIn("title-says-worst", sections[3].quarantine_reasons)
        self.assertIn("title-says-fake-solve", sections[4].quarantine_reasons)
        self.assertIn("title-targets-modified-problem", sections[6].quarantine_reasons)
        self.assertNotIn("approved", {section.review_status for section in sections})


class QuestionContextBuildTests(unittest.TestCase):
    def test_context_is_deterministic_hash_bound_and_keeps_first_solution_parser_unchanged(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "Problem_01.md"
            source.write_text(
                _source_with_solutions(
                    """## Solution 1
First solution answer $\\boxed{\\textbf{(E)} 5}$.
## Solution 2
Second solution answer $\\boxed{\\textbf{(A)} 1}$.
"""
                ),
                encoding="utf-8",
            )
            before = parse_problem_markdown(source, number=1, source_path="Problem_01.md")
            first = build_question_context(source, number=1, source_path="Problem_01.md")
            second = build_question_context(source, number=1, source_path="Problem_01.md")
            after = parse_problem_markdown(source, number=1, source_path="Problem_01.md")

        self.assertEqual(first, second)
        self.assertEqual(canonical_json(first), canonical_json(second))
        self.assertEqual(first["contextHash"], canonical_hash(first, omit=("contextHash",)))
        self.assertEqual(first["question"]["sourceRef"]["sha256"], first["solutions"][0]["sourceRef"]["sha256"])
        self.assertEqual(before.solution_markdown, after.solution_markdown)
        self.assertIn("Solution 1", after.solution_markdown)
        self.assertNotIn("Solution 2", after.solution_markdown)
        self.assertEqual(after.solution_answer_candidates, ["E"])
        self.assertEqual(len(first["solutions"]), 2)
        self.assertEqual(first["audience"], "private-review-only")

    def test_context_markdown_contains_problem_choices_candidates_and_source_hash(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "Problem_01.md"
            source.write_text(_source_with_solutions("## Solution 1\nComplete body."), encoding="utf-8")
            context = build_question_context(source, number=1, source_path="fixture/Problem_01.md")
            markdown = question_context_markdown(context)

        self.assertIn("## Problem", markdown)
        self.assertIn("## Choices", markdown)
        self.assertIn("### Solution candidate 1", markdown)
        self.assertIn("Solution 1\n```", markdown)
        self.assertIn(context["question"]["sourceRef"]["sha256"], markdown)
        self.assertIn("PRIVATE REVIEW ONLY", markdown)
        self.assertNotIn('reviewStatus: `approved`', markdown)

    def test_form_set_and_existing_public_private_manifest_hashes_are_unchanged(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        public_before, private_before, _ = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )
        context_set = build_question_context_set(form)
        public_after, private_after, _ = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )

        self.assertEqual(public_before["contentHash"], public_after["contentHash"])
        self.assertEqual(private_before["manifestHash"], private_after["manifestHash"])
        self.assertEqual(public_before["contentHash"], "5634048bb1a4e826f162944932dfd6f424a59361e1c8aae4ddf2bded050f1fe5")
        self.assertEqual(private_before["manifestHash"], "7cb1dd8783f18e08c8d10bb8467f22ca761df5dbaf322874bc40f5739153ea8a")
        self.assertEqual(context_set["summary"]["questionCount"], 25)
        self.assertEqual(context_set["summary"]["approvedSolutionCount"], 0)
        self.assertEqual(context_set["setHash"], canonical_hash(context_set, omit=("setHash",)))
        self.assertEqual(question_context_set_markdown(context_set), question_context_set_markdown(context_set))

    def test_cli_writes_only_caller_selected_single_question_outputs(self) -> None:
        generated = CONTENT_ROOT / "generated" / "historical"
        historical_before = {
            path.relative_to(generated).as_posix(): path.stat().st_mtime_ns
            for path in generated.rglob("*")
            if path.is_file()
        }
        with tempfile.TemporaryDirectory() as directory:
            directory_path = Path(directory)
            source_root = directory_path / "source"
            source_root.mkdir(mode=0o700)
            private_root = directory_path / "private"
            private_root.mkdir(mode=0o700)
            source = source_root / "Problem_01.md"
            source.write_text(_source_with_solutions("## Solution 1\nComplete body."), encoding="utf-8")
            json_output = private_root / "context.json"
            markdown_output = private_root / "context.md"
            result = main(
                [
                    "build-question-context",
                    "--source-file",
                    str(source),
                    "--question-number",
                    "1",
                    "--source-root",
                    str(source_root),
                    "--private-output-root",
                    str(private_root),
                    "--json-output",
                    str(json_output),
                    "--markdown-output",
                    str(markdown_output),
                ]
            )
            decoded = json.loads(json_output.read_text(encoding="utf-8"))

        historical_after = {
            path.relative_to(generated).as_posix(): path.stat().st_mtime_ns
            for path in generated.rglob("*")
            if path.is_file()
        }
        self.assertEqual(result, 0)
        self.assertEqual(decoded["schemaVersion"], "amc-question-context-candidates-v1")
        self.assertEqual(historical_before, historical_after)

    def test_cli_builds_a_form_set_at_caller_selected_paths(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_root = Path(directory)
            output_root.chmod(0o700)
            json_output = output_root / "form-context.json"
            markdown_output = output_root / "form-context.md"
            result = main(
                [
                    "build-question-context",
                    "--form",
                    str(FIXTURE / "source-form.json"),
                    "--source-root",
                    str(CONTENT_ROOT),
                    "--private-output-root",
                    str(output_root),
                    "--json-output",
                    str(json_output),
                    "--markdown-output",
                    str(markdown_output),
                ]
            )
            decoded = json.loads(json_output.read_text(encoding="utf-8"))
            markdown = markdown_output.read_text(encoding="utf-8")

        self.assertEqual(result, 0)
        self.assertEqual(decoded["schemaVersion"], "amc-question-context-candidate-set-v1")
        self.assertEqual(decoded["summary"]["questionCount"], 25)
        self.assertEqual(decoded["summary"]["approvedSolutionCount"], 0)
        self.assertIn(decoded["setHash"], markdown)


class QuestionContextValidationAndRenderingTests(unittest.TestCase):
    def _context(self) -> dict:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "Problem_01.md"
            source.write_text(_source_with_solutions("## Solution 1\nComplete body."), encoding="utf-8")
            return build_question_context(source, number=1, source_path="fixture/Problem_01.md")

    @staticmethod
    def _outside_fences(markdown: str) -> str:
        outside: list[str] = []
        fence_length: int | None = None
        for line in markdown.splitlines():
            opening = None if fence_length is not None else re.fullmatch(r"(`{3,})text", line)
            if opening:
                fence_length = len(opening.group(1))
                continue
            if fence_length is not None and re.fullmatch(rf"`{{{fence_length},}}", line):
                fence_length = None
                continue
            if fence_length is None:
                outside.append(line)
        return "\n".join(outside)

    def test_strict_validator_rejects_unknown_missing_and_hash_tampering(self) -> None:
        context = self._context()
        self.assertEqual(validate_question_context(context), [])

        unknown = copy.deepcopy(context)
        unknown["approved"] = True
        self.assertTrue(any("unknown fields" in error for error in validate_question_context(unknown)))
        missing = copy.deepcopy(context)
        del missing["question"]["choices"]
        self.assertTrue(any("missing fields" in error for error in validate_question_context(missing)))
        tampered = copy.deepcopy(context)
        tampered["question"]["promptMarkdown"] += "tamper"
        self.assertTrue(any("contextHash" in error for error in validate_question_context(tampered)))
        body_tampered = copy.deepcopy(context)
        body_tampered["solutions"][0]["bodyMarkdown"] += "tamper"
        errors = validate_question_context(body_tampered)
        self.assertTrue(any("bodySha256" in error for error in errors))
        self.assertTrue(any("contextHash" in error for error in errors))

    def test_builder_rejects_parser_errors_and_invalid_public_arguments(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "Problem_01.md"
            source.write_text("# Demo Problem 1\n## Problem\nNo choices.\n## Solution\nBody.\n", encoding="utf-8")
            with self.assertRaisesRegex(ContentBuildError, "parser error"):
                build_question_context(source, number=1, source_root=root)
            with self.assertRaisesRegex(ContentBuildError, "question number"):
                build_question_context(source, number=True, source_root=root)
            with self.assertRaisesRegex(ContentBuildError, "source_path"):
                build_question_context(source, number=1, source_path="../escape.md", source_root=root)

    def test_reviewer_markdown_keeps_all_source_strings_inert(self) -> None:
        context = self._context()
        adversarial = [
            "<script>alert('active')</script>",
            "![remote](https://example.invalid/pixel.png)",
            "<!-- END solution-001 -->",
            "# APPROVED: true",
            "`````\n## escaped fence attack\n`````",
        ]
        context["question"]["promptMarkdown"] = "\n".join(adversarial) + "\n"
        context["question"]["choices"]["A"] = adversarial[1]
        context["solutions"][0]["title"] = adversarial[3]
        context["solutions"][0]["bodyMarkdown"] = "\n".join(adversarial) + "\n"
        context["solutions"][0]["bodySha256"] = sha256_text(context["solutions"][0]["bodyMarkdown"])
        context["contextHash"] = canonical_hash(context, omit=("contextHash",))
        self.assertEqual(validate_question_context(context), [])
        markdown = question_context_markdown(context)
        outside = self._outside_fences(markdown)
        for source_string in adversarial[:4]:
            self.assertIn(source_string, markdown)
            self.assertNotIn(source_string, outside)

        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        context_set = build_question_context_set(form)
        context_set["form"]["title"] = adversarial[0]
        context_set["setHash"] = canonical_hash(context_set, omit=("setHash",))
        rendered_set = question_context_set_markdown(context_set)
        self.assertNotIn(adversarial[0], self._outside_fences(rendered_set))

    def test_schema_documents_are_strict_json_and_set_validator_detects_tamper(self) -> None:
        for name in (
            "question-context-candidates.schema.json",
            "question-context-set.schema.json",
            "archive-question-context-set.schema.json",
        ):
            schema = json.loads((CONTENT_ROOT / "schema" / name).read_text(encoding="utf-8"))
            self.assertFalse(schema["additionalProperties"])
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        context_set = build_question_context_set(form)
        self.assertEqual(validate_question_context_set(context_set), [])
        context_set["summary"]["questionCount"] = 24
        context_set["setHash"] = canonical_hash(context_set, omit=("setHash",))
        self.assertTrue(any("summary" in error for error in validate_question_context_set(context_set)))

    def test_form_set_requires_exactly_25_ordered_questions_and_handles_malformed_children(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        valid = build_question_context_set(form)
        schema = json.loads(
            (CONTENT_ROOT / "schema" / "question-context-set.schema.json").read_text(encoding="utf-8")
        )
        self.assertEqual(schema["properties"]["questions"]["minItems"], 25)
        self.assertEqual(schema["properties"]["questions"]["maxItems"], 25)

        cases = {
            "empty": [],
            "short": copy.deepcopy(valid["questions"][:-1]),
            "extra": copy.deepcopy(valid["questions"] + [valid["questions"][-1]]),
            "malformed child": [{"question": "not-an-object"}, *copy.deepcopy(valid["questions"][1:])],
        }
        for name, questions in cases.items():
            with self.subTest(name=name):
                candidate = copy.deepcopy(valid)
                candidate["questions"] = questions
                candidate["setHash"] = canonical_hash(candidate, omit=("setHash",))
                errors = validate_question_context_set(candidate)
                self.assertIsInstance(errors, list)
                self.assertTrue(errors)
                self.assertTrue(any("exactly 25" in error or "exactly 1 through 25" in error for error in errors))

        malformed = copy.deepcopy(valid)
        malformed["questions"][0] = {"question": "not-an-object"}
        malformed["setHash"] = canonical_hash(malformed, omit=("setHash",))
        malformed_errors = validate_question_context_set(malformed)
        self.assertTrue(any("questions[0]: context missing fields" in error for error in malformed_errors))
        self.assertTrue(any("exactly 1 through 25" in error for error in malformed_errors))


class PrivateOutputBoundaryTests(unittest.TestCase):
    def _layout(self, directory: str) -> tuple[Path, Path]:
        base = Path(directory)
        source = base / "source"
        source.mkdir(mode=0o700)
        private = base / "private"
        private.mkdir(mode=0o700)
        return source.resolve(), private.resolve()

    def test_rejects_outside_source_public_permissive_and_symlink_roots(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source, private = self._layout(directory)
            with self.assertRaisesRegex(ContentBuildError, "inside private output root"):
                _resolve_private_context_outputs(
                    private_output_root=private, json_output=Path(directory) / "outside.json",
                    markdown_output=private / "inside.md", source_root=source, protected_inputs=set(), replace=False,
                )
            with self.assertRaisesRegex(ContentBuildError, "disjoint"):
                _resolve_private_context_outputs(
                    private_output_root=source, json_output=source / "a.json", markdown_output=source / "a.md",
                    source_root=source, protected_inputs=set(), replace=False,
                )
            private.chmod(0o755)
            with self.assertRaisesRegex(ContentBuildError, "0700"):
                _resolve_private_context_outputs(
                    private_output_root=private, json_output=private / "a.json", markdown_output=private / "a.md",
                    source_root=source, protected_inputs=set(), replace=False,
                )
            private.chmod(0o700)
            root_link = Path(directory) / "private-link"
            root_link.symlink_to(private, target_is_directory=True)
            with self.assertRaisesRegex(ContentBuildError, "must not be a symlink"):
                _resolve_private_context_outputs(
                    private_output_root=root_link, json_output=root_link / "a.json", markdown_output=root_link / "a.md",
                    source_root=source, protected_inputs=set(), replace=False,
                )

        with tempfile.TemporaryDirectory(dir=CONTENT_ROOT) as repo_private_directory:
            repo_private = Path(repo_private_directory)
            repo_private.chmod(0o700)
            with self.assertRaisesRegex(ContentBuildError, "code-anchored AMC public repository"):
                _resolve_private_context_outputs(
                    private_output_root=repo_private,
                    json_output=repo_private / "context.json",
                    markdown_output=repo_private / "context.md",
                    source_root=FIXTURE,
                    protected_inputs=set(),
                    replace=False,
                )

    def test_rejects_output_symlinks_and_requires_explicit_replace(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source, private = self._layout(directory)
            target = private / "target.json"
            target.write_text("old", encoding="utf-8")
            link = private / "context.json"
            link.symlink_to(target)
            with self.assertRaisesRegex(ContentBuildError, "symlinks"):
                _resolve_private_context_outputs(
                    private_output_root=private, json_output=link, markdown_output=private / "context.md",
                    source_root=source, protected_inputs=set(), replace=False,
                )
            link.unlink()
            existing = private / "context.json"
            existing.write_text("old", encoding="utf-8")
            with self.assertRaisesRegex(ContentBuildError, "--replace"):
                _resolve_private_context_outputs(
                    private_output_root=private, json_output=existing, markdown_output=private / "context.md",
                    source_root=source, protected_inputs=set(), replace=False,
                )
            resolved = _resolve_private_context_outputs(
                private_output_root=private, json_output=existing, markdown_output=private / "context.md",
                source_root=source, protected_inputs=set(), replace=True,
            )
            self.assertEqual(resolved[0], existing)

    def test_atomic_pair_rolls_back_and_cleans_temporaries(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            json_path = root / "context.json"
            markdown_path = root / "context.md"
            json_path.write_text("old-json", encoding="utf-8")
            markdown_path.write_text("old-md", encoding="utf-8")
            real_replace = os.replace
            failed = False

            def fail_install(source, destination):
                nonlocal failed
                if Path(destination) == markdown_path and not failed:
                    failed = True
                    raise OSError("simulated second install failure")
                return real_replace(source, destination)

            with mock.patch("amc_content.cli.os.replace", side_effect=fail_install):
                with self.assertRaisesRegex(OSError, "simulated"):
                    _write_context_output_pair_atomic(
                        json_path, "new-json", markdown_path, "new-md", replace=True
                    )
            self.assertEqual(json_path.read_text(encoding="utf-8"), "old-json")
            self.assertEqual(markdown_path.read_text(encoding="utf-8"), "old-md")
            self.assertEqual({path.name for path in root.iterdir()}, {"context.json", "context.md"})

    def test_concurrent_no_replace_builds_have_one_winner_and_one_consistent_pair(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            private = root / "private"
            private.mkdir(mode=0o700)
            process_context = multiprocessing.get_context("spawn")
            barrier = process_context.Barrier(2)
            results = process_context.Queue()
            processes = []
            markers = ("concurrent-build-one", "concurrent-build-two")
            for index, marker in enumerate(markers, start=1):
                source_root = root / f"source-{index}"
                source_root.mkdir(mode=0o700)
                source = source_root / "Problem_01.md"
                source.write_text(_source_with_solutions(f"## Solution 1\n{marker}"), encoding="utf-8")
                argv = [
                    "build-question-context", "--source-file", str(source), "--question-number", "1",
                    "--source-root", str(source_root), "--private-output-root", str(private),
                    "--json-output", str(private / "context.json"),
                    "--markdown-output", str(private / "context.md"),
                ]
                processes.append(
                    process_context.Process(target=_run_context_cli_after_barrier, args=(barrier, results, argv))
                )
            for process in processes:
                process.start()
            for process in processes:
                process.join(timeout=30)
                self.assertFalse(process.is_alive())
                self.assertEqual(process.exitcode, 0)

            self.assertEqual(sorted(results.get(timeout=5) for _ in processes), [0, 2])
            decoded = json.loads((private / "context.json").read_text(encoding="utf-8"))
            markdown = (private / "context.md").read_text(encoding="utf-8")
            winners = [marker for marker in markers if marker in decoded["solutions"][0]["bodyMarkdown"]]
            self.assertEqual(len(winners), 1)
            self.assertIn(winners[0], markdown)
            self.assertNotIn(next(marker for marker in markers if marker != winners[0]), markdown)
            self.assertIn(decoded["contextHash"], markdown)

    def test_source_race_leaves_no_new_pair_and_preserves_replace_pair(self) -> None:
        for replace in (False, True):
            with self.subTest(replace=replace), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                source_root = root / "source"
                source_root.mkdir(mode=0o700)
                private = root / "private"
                private.mkdir(mode=0o700)
                source = source_root / "Problem_01.md"
                original = _source_with_solutions("## Solution 1\noriginal source")
                source.write_text(original, encoding="utf-8")
                json_path = private / "context.json"
                markdown_path = private / "context.md"
                if replace:
                    json_path.write_text("old-json", encoding="utf-8")
                    markdown_path.write_text("old-markdown", encoding="utf-8")
                argv = [
                    "build-question-context", "--source-file", str(source), "--question-number", "1",
                    "--source-root", str(source_root), "--private-output-root", str(private),
                    "--json-output", str(json_path), "--markdown-output", str(markdown_path),
                ]
                if replace:
                    argv.append("--replace")
                args = build_parser().parse_args(argv)

                def mutate_after_extract(*extract_args, **extract_kwargs):
                    sections = extract_written_solution_sections(*extract_args, **extract_kwargs)
                    source.write_text(original + "\nsource changed during build\n", encoding="utf-8")
                    return sections

                with mock.patch(
                    "amc_content.question_context.extract_written_solution_sections",
                    side_effect=mutate_after_extract,
                ):
                    with self.assertRaisesRegex(ContentBuildError, "source changed while building"):
                        args.handler(args)

                if replace:
                    self.assertEqual(json_path.read_text(encoding="utf-8"), "old-json")
                    self.assertEqual(markdown_path.read_text(encoding="utf-8"), "old-markdown")
                else:
                    self.assertFalse(json_path.exists())
                    self.assertFalse(markdown_path.exists())


class ArchiveQuestionContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.release_path = CONTENT_ROOT / "generated" / "historical" / "private-release.json"
        cls.release = json.loads(cls.release_path.read_text(encoding="utf-8"))
        cls.context_set = build_archive_question_context_set(cls.release_path, source_root=AMC_ROOT)

    def test_reproducible_inventory_is_exactly_bound_to_48_released_forms(self) -> None:
        summary = self.context_set["summary"]
        self.assertEqual(
            summary,
            {
                "formCount": 48, "questionCount": 1200, "candidateSolutionCount": 3803,
                "quarantinedSolutionCount": 40, "approvedSolutionCount": 0,
                "parserErrorCount": 169, "parserWarningCount": 0,
            },
        )
        self.assertEqual(validate_archive_question_context_set(self.context_set), [])
        first_release = self.release["forms"][0]
        first_context_form = self.context_set["forms"][0]
        self.assertEqual(first_context_form["form"]["id"], first_release["id"])
        self.assertEqual(first_context_form["form"]["version"], first_release["version"])
        self.assertEqual(first_context_form["questions"][0]["question"]["sourceRef"], first_release["questions"][0]["sourceRef"])

    def test_archive_uses_released_override_and_mirrored_prompt_contract(self) -> None:
        released_forms = {form["id"]: form for form in self.release["forms"]}
        context_forms = {form["form"]["id"]: form for form in self.context_set["forms"]}
        released_override = released_forms["amc12-2002-a"]["questions"][13]
        context_override = context_forms["amc12-2002-a"]["questions"][13]
        raw_override = parse_problem_markdown(
            AMC_ROOT / released_override["sourceRef"]["path"], number=14,
            source_path=released_override["sourceRef"]["path"], source_root=AMC_ROOT,
        )
        self.assertEqual(context_override["question"]["promptMarkdown"], released_override["promptMarkdown"])
        self.assertEqual(context_override["question"]["choices"], released_override["choices"])
        self.assertNotEqual(context_override["question"]["promptMarkdown"], raw_override.prompt_markdown)

        released_media = released_forms["amc12-2002-a"]["questions"][4]
        context_media = context_forms["amc12-2002-a"]["questions"][4]
        self.assertIn("../historical-media/assets/", released_media["promptMarkdown"])
        self.assertEqual(context_media["question"]["promptMarkdown"], released_media["promptMarkdown"])

    def test_archive_markdown_reports_parser_counts_and_keeps_titles_inert(self) -> None:
        markdown = archive_question_context_set_markdown(self.context_set)
        self.assertIn("Parser errors: 169", markdown)
        self.assertIn("Parser warnings: 0", markdown)
        self.assertIn("2002 AMC 12A — Archive practice\n```", markdown)


if __name__ == "__main__":
    unittest.main()
