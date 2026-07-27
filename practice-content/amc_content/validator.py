"""Validation for artifacts consumed by the practice backend.

The JSON Schemas in ``schema/`` are a portable contract; these checks add
cross-field and hash validation that is difficult to express in JSON Schema.
"""

from __future__ import annotations

from decimal import Decimal
import math
from typing import Any

from .canonical import MAX_CANONICAL_DECIMAL_PLACES, canonical_hash


EXPECTED_OPTIONS = {"A", "B", "C", "D", "E"}
EXPECTED_QUESTION_NUMBERS = list(range(1, 26))


def score_value_error(value: Any) -> str | None:
    """Return a release-gate error for unsupported score precision/range."""

    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return "must be a finite number"
    if not math.isfinite(float(value)):
        return "must be finite (not NaN or infinity)"
    if value < 0 or value > 1_000:
        return "must be between 0 and 1000"
    if isinstance(value, float) and -Decimal(str(value)).as_tuple().exponent > MAX_CANONICAL_DECIMAL_PLACES:
        return f"must use at most {MAX_CANONICAL_DECIMAL_PLACES} decimal places"
    return None


def score_values_equal(left: Any, right: Any) -> bool:
    try:
        return Decimal(str(left)) == Decimal(str(right))
    except Exception:  # malformed values receive their dedicated diagnostics
        return False


def _type_errors(manifest: dict[str, Any], *, private: bool) -> list[str]:
    errors: list[str] = []
    required = {
        "schemaVersion",
        "id",
        "version",
        "title",
        "publicationStatus",
        "isSynthetic",
        "durationSeconds",
        "scoringPolicyVersion",
        "scoringPolicy",
        "questions",
        "questionBundleHash",
        "contentHash",
    }
    if private:
        required.update({"manifestHash", "provenance"})
    missing = sorted(required - set(manifest))
    if missing:
        errors.append(f"manifest missing required fields: {', '.join(missing)}")
    if not isinstance(manifest.get("id"), str) or not manifest.get("id"):
        errors.append("id must be a non-empty string")
    if not isinstance(manifest.get("version"), str) or not manifest.get("version").strip():
        errors.append("version must be a non-empty immutable form revision identifier")
    if not isinstance(manifest.get("title"), str) or not manifest.get("title"):
        errors.append("title must be a non-empty string")
    if manifest.get("durationSeconds") != 75 * 60:
        errors.append("durationSeconds must be exactly 4500 for an AMC timed form")
    if not isinstance(manifest.get("isSynthetic"), bool):
        errors.append("isSynthetic must be a boolean")
    status = manifest.get("publicationStatus")
    if status not in {"review-required", "approved", "test-only"}:
        errors.append("publicationStatus must be review-required, approved, or test-only")
    if manifest.get("isSynthetic") and status != "test-only":
        errors.append("synthetic forms must have publicationStatus test-only")
    if status == "approved" and manifest.get("isSynthetic"):
        errors.append("approved forms cannot be synthetic")
    if private and not isinstance(manifest.get("provenance"), dict):
        errors.append("private manifest provenance must be an object")
    if not private:
        leaked_top_level = sorted(
            {"manifestHash", "provenance", "answerKey", "answerKeyApproval", "correctOptions", "solutions"}
            & set(manifest)
        )
        if leaked_top_level:
            errors.append(f"public manifest leaks private top-level fields: {', '.join(leaked_top_level)}")
    return errors


def _scoring_errors(manifest: dict[str, Any]) -> list[str]:
    policy = manifest.get("scoringPolicy")
    errors: list[str] = []
    if not isinstance(policy, dict):
        return ["scoringPolicy must be an object"]
    for key in ("correct", "blank", "incorrect", "questionCount", "maxScore"):
        if key not in policy:
            errors.append(f"scoringPolicy missing {key}")
    for key in ("correct", "blank", "incorrect", "maxScore"):
        if key in policy:
            issue = score_value_error(policy[key])
            if issue:
                errors.append(f"scoringPolicy.{key} {issue}")
    if policy.get("questionCount") != 25:
        errors.append("scoringPolicy.questionCount must be 25")
    if score_value_error(policy.get("correct")) is None and score_value_error(policy.get("maxScore")) is None and not score_values_equal(policy.get("maxScore"), Decimal(str(policy["correct"])) * 25):
        errors.append("scoringPolicy.maxScore must equal correct points times 25")
    version = manifest.get("scoringPolicyVersion")
    if not isinstance(version, str) or not version:
        errors.append("scoringPolicyVersion must be a non-empty string")
    elif policy.get("version") != version:
        errors.append("scoringPolicy.version must equal scoringPolicyVersion")
    return errors


def _question_errors(question: Any, expected_number: int, *, private: bool) -> list[str]:
    if not isinstance(question, dict):
        return [f"question {expected_number} must be an object"]
    errors: list[str] = []
    required = {"number", "promptMarkdown", "choices"}
    if private:
        required.update({"sourceRef", "correctOption", "solutionMarkdown"})
    missing = required - set(question)
    if missing:
        errors.append(f"question {expected_number} missing {', '.join(sorted(missing))}")
    if question.get("number") != expected_number:
        errors.append(f"expected question number {expected_number}, got {question.get('number')!r}")
    if not isinstance(question.get("promptMarkdown"), str) or not question.get("promptMarkdown").strip():
        errors.append(f"question {expected_number} promptMarkdown must be non-empty")
    allowed = {"number", "promptMarkdown", "choices"}
    if private:
        allowed.update({"sourceRef", "correctOption", "solutionMarkdown"})
    unexpected = sorted(set(question) - allowed)
    if unexpected:
        errors.append(f"question {expected_number} has unsupported fields: {', '.join(unexpected)}")
    choices = question.get("choices")
    if not isinstance(choices, dict) or set(choices) != EXPECTED_OPTIONS:
        errors.append(f"question {expected_number} choices must be exactly A through E")
    elif any(not isinstance(value, str) or not value.strip() for value in choices.values()):
        errors.append(f"question {expected_number} has an empty choice")
    if private:
        source_ref = question.get("sourceRef")
        if (
            not isinstance(source_ref, dict)
            or not isinstance(source_ref.get("path"), str)
            or not isinstance(source_ref.get("sha256"), str)
            or len(source_ref["sha256"]) != 64
            or any(character not in "0123456789abcdef" for character in source_ref["sha256"])
        ):
            errors.append(f"question {expected_number} sourceRef requires path and lowercase SHA-256")
        if question.get("correctOption") not in EXPECTED_OPTIONS:
            errors.append(f"question {expected_number} correctOption must be A through E")
        if not isinstance(question.get("solutionMarkdown"), str) or not question.get("solutionMarkdown").strip():
            errors.append(f"question {expected_number} solutionMarkdown must be non-empty")
    else:
        leaked = sorted({"correctOption", "solutionMarkdown", "sourceRef"} & set(question))
        if leaked:
            errors.append(f"public question {expected_number} leaks private fields: {', '.join(leaked)}")
    return errors


def public_projection(private_manifest: dict[str, Any]) -> dict[str, Any]:
    """Create the public content projection whose hash is stored in both artifacts."""

    copied_keys = (
        "schemaVersion",
        "id",
        "version",
        "title",
        "publicationStatus",
        "isSynthetic",
        "durationSeconds",
        "scoringPolicyVersion",
        "scoringPolicy",
        "questionBundleHash",
    )
    projection: dict[str, Any] = {key: private_manifest[key] for key in copied_keys if key in private_manifest}
    projection["schemaVersion"] = "amc-practice-public-form-v1"
    projected_questions: list[Any] = []
    questions = private_manifest.get("questions", [])
    if not isinstance(questions, list):
        questions = []
    for question in questions:
        if not isinstance(question, dict):
            # Keep validation total for malformed untrusted JSON rather than
            # raising before it can explain which question is invalid.
            projected_questions.append(question)
            continue
        projected_questions.append(
            {
                key: question[key]
                for key in ("number", "promptMarkdown", "choices")
                if key in question
            }
        )
    projection["questions"] = projected_questions
    projection["contentHash"] = canonical_hash(projection, omit=("contentHash",))
    return projection


def validate_public_manifest(manifest: dict[str, Any]) -> list[str]:
    """Return all violations rather than stopping at the first malformed field."""

    errors = _type_errors(manifest, private=False)
    if manifest.get("schemaVersion") != "amc-practice-public-form-v1":
        errors.append("public schemaVersion must be amc-practice-public-form-v1")
    errors.extend(_scoring_errors(manifest))
    questions = manifest.get("questions")
    if not isinstance(questions, list) or len(questions) != 25:
        errors.append("public manifest must contain exactly 25 questions")
    elif isinstance(questions, list):
        for expected_number, question in zip(EXPECTED_QUESTION_NUMBERS, questions):
            errors.extend(_question_errors(question, expected_number, private=False))
    try:
        expected_hash = canonical_hash(manifest, omit=("contentHash",))
        if manifest.get("contentHash") != expected_hash:
            errors.append("public contentHash does not match canonical content")
    except ValueError as error:
        errors.append(f"public content cannot be canonicalized: {error}")
    return errors


def validate_private_manifest(manifest: dict[str, Any]) -> list[str]:
    errors = _type_errors(manifest, private=True)
    if manifest.get("schemaVersion") != "amc-practice-private-form-v1":
        errors.append("private schemaVersion must be amc-practice-private-form-v1")
    errors.extend(_scoring_errors(manifest))
    questions = manifest.get("questions")
    if not isinstance(questions, list) or len(questions) != 25:
        errors.append("private manifest must contain exactly 25 questions")
    elif isinstance(questions, list):
        for expected_number, question in zip(EXPECTED_QUESTION_NUMBERS, questions):
            errors.extend(_question_errors(question, expected_number, private=True))
    try:
        projection = public_projection(manifest)
        if manifest.get("contentHash") != projection["contentHash"]:
            errors.append("private contentHash does not match its public projection")
        expected_manifest_hash = canonical_hash(manifest, omit=("manifestHash",))
        if manifest.get("manifestHash") != expected_manifest_hash:
            errors.append("private manifestHash does not match canonical private content")
    except ValueError as error:
        errors.append(f"private content cannot be canonicalized: {error}")
    return errors


def validate_import_policy(manifest: dict[str, Any], *, allow_test_only: bool = False) -> list[str]:
    """Policy gate an importer should apply *in addition* to schema validation."""

    if (manifest.get("publicationStatus") == "test-only" or manifest.get("isSynthetic")) and not allow_test_only:
        return ["test-only or synthetic manifests require an explicit development import flag"]
    if manifest.get("publicationStatus") != "approved" and not allow_test_only:
        return ["only approved manifests may be imported outside development"]
    return []
