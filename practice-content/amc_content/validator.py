"""Validation for artifacts consumed by the practice backend.

The JSON Schemas in ``schema/`` are a portable contract; these checks add
cross-field and hash validation that is difficult to express in JSON Schema.
"""

from __future__ import annotations

from decimal import Decimal
import math
import re
from typing import Any

from .canonical import MAX_CANONICAL_DECIMAL_PLACES, canonical_hash


EXPECTED_OPTIONS = {"A", "B", "C", "D", "E"}
EXPECTED_QUESTION_NUMBERS = list(range(1, 26))
ARCHIVE_PRIVATE_MANIFEST_SCHEMA = "amc-practice-archive-form-v1"
ARCHIVE_PUBLIC_MANIFEST_SCHEMA = "amc-practice-public-form-v1"
ARCHIVE_PUBLICATION_STATUS = "archive-practice"
_ARCHIVE_AMC12_ID_RE = re.compile(r"^amc12-(?P<year>\d{4})-[ab]$")
_EARLY_ARCHIVE_POLICY_VERSION = "amc12-archive-2002-2006-v1"
_LATE_ARCHIVE_POLICY_VERSION = "amc12-archive-2007-plus-v1"
LEGACY_ARCHIVE_FORM_IDS = frozenset(
    f"amc12-{year}-{variant}" for year in range(2002, 2026) for variant in ("a", "b")
)
ARCHIVE_FORM_IDS = LEGACY_ARCHIVE_FORM_IDS | {"amc12-2026-a"}


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


def _archive_type_errors(manifest: dict[str, Any], *, private: bool) -> list[str]:
    """Validate the distinct archive-practice envelope without weakening v1.

    Archive releases intentionally have a different authorization and scoring
    contract from the two-reviewer private-v1 flow. Keeping the checks here
    separate means a historical exception (for example, a documented
    unscored item) cannot accidentally become valid input for an approved
    contemporary form.
    """

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
        "archiveNotice",
    }
    if private:
        required.update({"manifestHash", "provenance"})
    missing = sorted(required - set(manifest))
    if missing:
        errors.append(f"archive manifest missing required fields: {', '.join(missing)}")
    if not isinstance(manifest.get("id"), str) or not manifest.get("id").strip():
        errors.append("archive id must be a non-empty string")
    if not isinstance(manifest.get("version"), str) or not manifest.get("version").strip():
        errors.append("archive version must be a non-empty immutable form revision identifier")
    if not isinstance(manifest.get("title"), str) or not manifest.get("title").strip():
        errors.append("archive title must be a non-empty string")
    if manifest.get("durationSeconds") != 75 * 60:
        errors.append("archive durationSeconds must be exactly 4500 for an AMC timed form")
    if manifest.get("isSynthetic") is not False:
        errors.append("archive forms must be non-synthetic")
    if manifest.get("publicationStatus") != ARCHIVE_PUBLICATION_STATUS:
        errors.append("archive publicationStatus must be archive-practice")
    if not isinstance(manifest.get("archiveNotice"), str) or not manifest["archiveNotice"].strip():
        errors.append("archiveNotice must be non-empty text")
    if private:
        provenance = manifest.get("provenance")
        if not isinstance(provenance, dict):
            errors.append("archive private manifest provenance must be an object")
        else:
            authorization = provenance.get("releaseAuthorization")
            if not isinstance(authorization, dict) or authorization.get("status") != "authorized-archive-practice":
                errors.append("archive provenance requires authorized-archive-practice releaseAuthorization")
            answer_key = provenance.get("answerKey")
            if not isinstance(answer_key, dict) or not isinstance(answer_key.get("catalogHash"), str):
                errors.append("archive provenance requires answerKey catalog metadata")
            media = provenance.get("media")
            if not isinstance(media, dict) or not isinstance(media.get("assetIds"), list):
                errors.append("archive provenance requires media asset metadata")
    else:
        leaked_top_level = sorted(
            {"manifestHash", "provenance", "answerKey", "answerKeyApproval", "correctOptions", "solutions"}
            & set(manifest)
        )
        if leaked_top_level:
            errors.append(f"public archive manifest leaks private top-level fields: {', '.join(leaked_top_level)}")
    return errors


def _archive_scoring_errors(manifest: dict[str, Any], questions: Any) -> list[str]:
    policy = manifest.get("scoringPolicy")
    errors: list[str] = []
    if not isinstance(policy, dict):
        return ["archive scoringPolicy must be an object"]
    for key in ("correct", "blank", "incorrect", "questionCount", "scoredQuestionCount", "maxScore"):
        if key not in policy:
            errors.append(f"archive scoringPolicy missing {key}")
    for key in ("correct", "blank", "incorrect", "maxScore"):
        if key in policy:
            issue = score_value_error(policy[key])
            if issue:
                errors.append(f"archive scoringPolicy.{key} {issue}")
    if policy.get("questionCount") != 25:
        errors.append("archive scoringPolicy.questionCount must be 25")
    scored_count = None
    if not isinstance(questions, list):
        errors.append("archive questions must be a list before scoring can be validated")
    elif any(not isinstance(question, dict) or not isinstance(question.get("isScored"), bool) for question in questions):
        errors.append("archive questions must declare boolean isScored before scoring can be validated")
    else:
        scored_count = sum(question["isScored"] for question in questions)
        if policy.get("scoredQuestionCount") != scored_count:
            errors.append("archive scoringPolicy.scoredQuestionCount must equal the number of scored questions")
    if scored_count is not None and score_value_error(policy.get("correct")) is None and score_value_error(policy.get("maxScore")) is None:
        if not score_values_equal(policy.get("maxScore"), Decimal(str(policy["correct"])) * scored_count):
            errors.append("archive scoringPolicy.maxScore must equal correct points times scoredQuestionCount")
    version = manifest.get("scoringPolicyVersion")
    if not isinstance(version, str) or not version:
        errors.append("archive scoringPolicyVersion must be a non-empty string")
    elif policy.get("version") != version:
        errors.append("archive scoringPolicy.version must equal scoringPolicyVersion")
    # The archive builder emits canonical AMC 12 ids.  Tie their scoring
    # policy to the historical scoring-era boundary so a future manifest
    # cannot silently give a 2002--2006 blank response the post-2006 value.
    # Non-canonical ids remain usable for isolated contract fixtures; all
    # production archive ids are checked here and again by the Node importer.
    form_id = manifest.get("id")
    id_match = _ARCHIVE_AMC12_ID_RE.fullmatch(form_id) if isinstance(form_id, str) else None
    if id_match:
        year = int(id_match.group("year"))
        if form_id not in ARCHIVE_FORM_IDS:
            errors.append("archive AMC 12 id must be a 2002–2025 A/B paper or 2026 A")
        else:
            early = year <= 2006
            expected_blank = 2.5 if early else 1.5
            expected_version = _EARLY_ARCHIVE_POLICY_VERSION if early else _LATE_ARCHIVE_POLICY_VERSION
            if not score_values_equal(policy.get("correct"), 6):
                errors.append("archive AMC 12 scoringPolicy.correct must be 6")
            if not score_values_equal(policy.get("incorrect"), 0):
                errors.append("archive AMC 12 scoringPolicy.incorrect must be 0")
            if not score_values_equal(policy.get("blank"), expected_blank):
                errors.append(f"archive AMC 12 scoringPolicy.blank must be {expected_blank} for {year}")
            if version != expected_version:
                errors.append(f"archive AMC 12 scoringPolicyVersion must be {expected_version} for {year}")
    return errors


def _archive_question_errors(question: Any, expected_number: int, *, private: bool) -> list[str]:
    if not isinstance(question, dict):
        return [f"archive question {expected_number} must be an object"]
    errors: list[str] = []
    required = {"number", "promptMarkdown", "choices", "isScored"}
    if private:
        required.update({"sourceRef", "correctOption", "acceptedOptions", "solutionMarkdown"})
    missing = required - set(question)
    if missing:
        errors.append(f"archive question {expected_number} missing {', '.join(sorted(missing))}")
    if question.get("number") != expected_number:
        errors.append(f"expected archive question number {expected_number}, got {question.get('number')!r}")
    if not isinstance(question.get("promptMarkdown"), str) or not question.get("promptMarkdown").strip():
        errors.append(f"archive question {expected_number} promptMarkdown must be non-empty")
    allowed = {"number", "promptMarkdown", "choices", "isScored"}
    if private:
        allowed.update({"sourceRef", "correctOption", "acceptedOptions", "solutionMarkdown"})
    unexpected = sorted(set(question) - allowed)
    if unexpected:
        errors.append(f"archive question {expected_number} has unsupported fields: {', '.join(unexpected)}")
    choices = question.get("choices")
    if not isinstance(choices, dict) or set(choices) != EXPECTED_OPTIONS:
        errors.append(f"archive question {expected_number} choices must be exactly A through E")
    elif any(not isinstance(value, str) or not value.strip() for value in choices.values()):
        errors.append(f"archive question {expected_number} has an empty choice")
    if not isinstance(question.get("isScored"), bool):
        errors.append(f"archive question {expected_number} isScored must be boolean")
    if private:
        source_ref = question.get("sourceRef")
        if (
            not isinstance(source_ref, dict)
            or not isinstance(source_ref.get("path"), str)
            or not isinstance(source_ref.get("sha256"), str)
            or len(source_ref["sha256"]) != 64
            or any(character not in "0123456789abcdef" for character in source_ref["sha256"])
        ):
            errors.append(f"archive question {expected_number} sourceRef requires path and lowercase SHA-256")
        if not isinstance(question.get("solutionMarkdown"), str) or not question.get("solutionMarkdown").strip():
            errors.append(f"archive question {expected_number} solutionMarkdown must be non-empty")
        is_scored = question.get("isScored")
        accepted = question.get("acceptedOptions")
        if is_scored is True:
            if question.get("correctOption") not in EXPECTED_OPTIONS:
                errors.append(f"archive question {expected_number} correctOption must be A through E when scored")
            if (
                not isinstance(accepted, list)
                or not accepted
                or any(option not in EXPECTED_OPTIONS for option in accepted)
                or len(set(accepted)) != len(accepted)
                or question.get("correctOption") not in accepted
            ):
                errors.append(f"archive question {expected_number} acceptedOptions must be unique A-E options including correctOption")
        elif is_scored is False:
            if question.get("correctOption") is not None:
                errors.append(f"archive question {expected_number} must use null correctOption when unscored")
            if accepted != []:
                errors.append(f"archive question {expected_number} must use empty acceptedOptions when unscored")
    else:
        leaked = sorted({"correctOption", "acceptedOptions", "solutionMarkdown", "sourceRef"} & set(question))
        if leaked:
            errors.append(f"public archive question {expected_number} leaks private fields: {', '.join(leaked)}")
    return errors


def archive_public_projection(private_manifest: dict[str, Any]) -> dict[str, Any]:
    """Create the redacted archive projection used for its content hash."""

    copied_keys = (
        "id",
        "version",
        "title",
        "publicationStatus",
        "isSynthetic",
        "durationSeconds",
        "scoringPolicyVersion",
        "scoringPolicy",
        "questionBundleHash",
        "archiveNotice",
    )
    projection: dict[str, Any] = {key: private_manifest[key] for key in copied_keys if key in private_manifest}
    projection["schemaVersion"] = ARCHIVE_PUBLIC_MANIFEST_SCHEMA
    questions = private_manifest.get("questions", [])
    projection["questions"] = [
        {key: question[key] for key in ("number", "promptMarkdown", "choices", "isScored") if key in question}
        if isinstance(question, dict) else question
        for question in questions
    ] if isinstance(questions, list) else []
    projection["contentHash"] = canonical_hash(projection, omit=("contentHash",))
    return projection


def validate_archive_public_manifest(manifest: dict[str, Any]) -> list[str]:
    """Validate a redacted archive-practice public manifest."""

    errors = _archive_type_errors(manifest, private=False)
    if manifest.get("schemaVersion") != ARCHIVE_PUBLIC_MANIFEST_SCHEMA:
        errors.append(f"archive public schemaVersion must be {ARCHIVE_PUBLIC_MANIFEST_SCHEMA}")
    questions = manifest.get("questions")
    errors.extend(_archive_scoring_errors(manifest, questions))
    if not isinstance(questions, list) or len(questions) != 25:
        errors.append("archive public manifest must contain exactly 25 questions")
    elif isinstance(questions, list):
        for expected_number, question in zip(EXPECTED_QUESTION_NUMBERS, questions):
            errors.extend(_archive_question_errors(question, expected_number, private=False))
    try:
        expected_hash = canonical_hash(manifest, omit=("contentHash",))
        if manifest.get("contentHash") != expected_hash:
            errors.append("archive public contentHash does not match canonical content")
    except ValueError as error:
        errors.append(f"archive public content cannot be canonicalized: {error}")
    return errors


def validate_archive_private_manifest(manifest: dict[str, Any]) -> list[str]:
    """Validate a full archive-practice import manifest and redacted hash."""

    errors = _archive_type_errors(manifest, private=True)
    if manifest.get("schemaVersion") != ARCHIVE_PRIVATE_MANIFEST_SCHEMA:
        errors.append(f"archive private schemaVersion must be {ARCHIVE_PRIVATE_MANIFEST_SCHEMA}")
    questions = manifest.get("questions")
    errors.extend(_archive_scoring_errors(manifest, questions))
    if not isinstance(questions, list) or len(questions) != 25:
        errors.append("archive private manifest must contain exactly 25 questions")
    elif isinstance(questions, list):
        for expected_number, question in zip(EXPECTED_QUESTION_NUMBERS, questions):
            errors.extend(_archive_question_errors(question, expected_number, private=True))
    try:
        projection = archive_public_projection(manifest)
        if manifest.get("contentHash") != projection["contentHash"]:
            errors.append("archive private contentHash does not match its public projection")
        expected_manifest_hash = canonical_hash(manifest, omit=("manifestHash",))
        if manifest.get("manifestHash") != expected_manifest_hash:
            errors.append("archive private manifestHash does not match canonical private content")
    except ValueError as error:
        errors.append(f"archive private content cannot be canonicalized: {error}")
    return errors


def validate_import_policy(manifest: dict[str, Any], *, allow_test_only: bool = False) -> list[str]:
    """Policy gate an importer should apply *in addition* to schema validation."""

    if (manifest.get("publicationStatus") == "test-only" or manifest.get("isSynthetic")) and not allow_test_only:
        return ["test-only or synthetic manifests require an explicit development import flag"]
    if manifest.get("publicationStatus") != "approved" and not allow_test_only:
        return ["only approved manifests may be imported outside development"]
    return []
