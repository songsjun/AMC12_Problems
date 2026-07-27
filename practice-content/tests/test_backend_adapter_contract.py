"""Reference contract for the backend's private-manifest normalization adapter.

This does not import the API service; it gives both repositories one executable
fixture for the field names that intentionally differ between canonical content
and the API storage model.
"""

from __future__ import annotations

import unittest
from pathlib import Path

from amc_content.builder import build_artifacts, load_source_form
from amc_content.validator import validate_import_policy, validate_private_manifest


CONTENT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE = CONTENT_ROOT / "fixtures" / "synthetic-25"


def reference_normalize_manifest(
    private_manifest: dict[str, object],
    *,
    allow_test_only: bool,
    allow_dev_publish: bool = False,
) -> dict[str, object]:
    """The documented projection the API's ``normalizeManifest`` must preserve."""

    errors = validate_private_manifest(private_manifest)
    errors.extend(validate_import_policy(private_manifest, allow_test_only=allow_test_only))
    if errors:
        raise ValueError("; ".join(errors))
    scoring = private_manifest["scoringPolicy"]
    assert isinstance(scoring, dict)
    questions = private_manifest["questions"]
    assert isinstance(questions, list)
    is_test_only = private_manifest["publicationStatus"] == "test-only" or private_manifest["isSynthetic"]
    development_publish_eligible = bool(is_test_only and allow_test_only)
    return {
        "formId": private_manifest["id"],
        "version": private_manifest["version"],
        "title": private_manifest["title"],
        "durationMs": private_manifest["durationSeconds"] * 1000,
        "published": private_manifest["publicationStatus"] == "approved" or (
            development_publish_eligible and allow_dev_publish
        ),
        "developmentPublishEligible": development_publish_eligible,
        "scoringPolicyVersion": private_manifest["scoringPolicyVersion"],
        "scoring": {
            "correctPoints": scoring["correct"],
            "blankPoints": scoring["blank"],
            "incorrectPoints": scoring["incorrect"],
            "questionCount": scoring["questionCount"],
            "maxScore": scoring["maxScore"],
        },
        "audit": {
            "contentHash": private_manifest["contentHash"],
            "manifestHash": private_manifest["manifestHash"],
            "questionBundleHash": private_manifest["questionBundleHash"],
        },
        "questions": [
            {
                "number": question["number"],
                "promptMarkdown": question["promptMarkdown"],
                "choices": question["choices"],
                "correctOption": question["correctOption"],
                "solutionMarkdown": question["solutionMarkdown"],
                "sourceRef": question["sourceRef"],
            }
            for question in questions
        ],
    }


class BackendAdapterContractTests(unittest.TestCase):
    def test_synthetic_private_manifest_maps_without_becoming_published(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        _, private_manifest, _ = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )
        normalized = reference_normalize_manifest(private_manifest, allow_test_only=True)

        self.assertEqual(normalized["formId"], "synthetic-amc12-25")
        self.assertEqual(normalized["version"], "1")
        self.assertEqual(normalized["durationMs"], 4_500_000)
        self.assertFalse(normalized["published"])
        self.assertTrue(normalized["developmentPublishEligible"])
        self.assertEqual(
            normalized["scoring"],
            {
                "correctPoints": 6,
                "blankPoints": 1.5,
                "incorrectPoints": 0,
                "questionCount": 25,
                "maxScore": 150,
            },
        )
        self.assertEqual(len(normalized["questions"]), 25)
        self.assertEqual(normalized["questions"][0]["correctOption"], "A")
        self.assertIn("solutionMarkdown", normalized["questions"][0])
        self.assertIn("sourceRef", normalized["questions"][0])
        self.assertEqual(len(normalized["audit"]["manifestHash"]), 64)

    def test_test_only_private_manifest_is_rejected_without_development_flag(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        _, private_manifest, _ = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )
        with self.assertRaises(ValueError):
            reference_normalize_manifest(private_manifest, allow_test_only=False)

    def test_explicit_development_publish_requires_a_second_flag(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        _, private_manifest, _ = build_artifacts(
            form,
            answer_key_path=FIXTURE / "approved-answer-key.json",
            allow_test_only=True,
        )
        normalized = reference_normalize_manifest(
            private_manifest,
            allow_test_only=True,
            allow_dev_publish=True,
        )
        self.assertTrue(normalized["developmentPublishEligible"])
        self.assertTrue(normalized["published"])


if __name__ == "__main__":
    unittest.main()
