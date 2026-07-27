"""Build review reports and private/public form artifacts from reviewed source."""

from __future__ import annotations

import json
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .canonical import canonical_hash, canonical_json
from .model import ParsedProblem
from .parser import parse_problem_markdown
from .validator import (
    EXPECTED_OPTIONS,
    public_projection,
    score_value_error,
    score_values_equal,
    validate_private_manifest,
    validate_public_manifest,
)


SOURCE_FORM_SCHEMA = "amc-practice-source-form-v1"
ANSWER_KEY_SCHEMA = "amc-practice-approved-answer-key-v1"


class ContentBuildError(ValueError):
    """Raised when a source form cannot cross the content release gate."""

    def __init__(self, messages: list[str]):
        self.messages = messages
        super().__init__("\n".join(messages))


@dataclass
class SourceForm:
    data: dict[str, Any]
    path: Path
    source_root: Path


def _source_form_reference(form: SourceForm) -> str:
    """Use a repository-relative provenance path so hashes survive checkout moves."""

    try:
        return form.path.relative_to(form.source_root).as_posix()
    except ValueError:
        # The source form itself should normally live inside the source root. A
        # stable filename is safer than embedding a machine-specific absolute
        # path if a caller supplied it from elsewhere.
        return form.path.name


def _load_json(path: Path) -> dict[str, Any]:
    try:
        decoded = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise ContentBuildError([f"missing JSON file: {path}"]) from error
    except OSError as error:
        raise ContentBuildError([f"cannot read JSON file {path}: {error}"]) from error
    except json.JSONDecodeError as error:
        raise ContentBuildError([f"invalid JSON in {path}: {error}"]) from error
    if not isinstance(decoded, dict):
        raise ContentBuildError([f"JSON document must be an object: {path}"])
    return decoded


def _source_form_errors(data: dict[str, Any]) -> list[str]:
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
        "contentRights",
        "sourceFiles",
    }
    missing = sorted(required - set(data))
    if missing:
        errors.append(f"source form missing fields: {', '.join(missing)}")
    if data.get("schemaVersion") != SOURCE_FORM_SCHEMA:
        errors.append(f"source form schemaVersion must be {SOURCE_FORM_SCHEMA}")
    if not isinstance(data.get("id"), str) or not data.get("id").strip():
        errors.append("source form id must be a non-empty stable form identifier")
    if not isinstance(data.get("version"), str) or not data.get("version").strip():
        errors.append("source form version must be a non-empty immutable revision identifier")
    if not isinstance(data.get("title"), str) or not data.get("title").strip():
        errors.append("source form title must be a non-empty string")
    if data.get("publicationStatus") not in {"review-required", "approved", "test-only"}:
        errors.append("source form publicationStatus must be review-required, approved, or test-only")
    if not isinstance(data.get("isSynthetic"), bool):
        errors.append("source form isSynthetic must be boolean")
    elif data.get("isSynthetic") and data.get("publicationStatus") != "test-only":
        errors.append("synthetic source forms must have publicationStatus test-only")
    if data.get("durationSeconds") != 75 * 60:
        errors.append("source form durationSeconds must be 4500")
    rights = data.get("contentRights")
    if (
        not isinstance(rights, dict)
        or not isinstance(rights.get("status"), str)
        or not rights["status"].strip()
        or not isinstance(rights.get("evidence"), str)
        or not rights["evidence"].strip()
    ):
        errors.append("source form contentRights requires status and evidence")
    elif data.get("publicationStatus") == "approved" and rights.get("status") != "approved":
        errors.append("approved source forms require contentRights.status approved")
    elif data.get("isSynthetic") and rights.get("status") != "synthetic":
        errors.append("synthetic source forms require contentRights.status synthetic")
    policy = data.get("scoringPolicy")
    if not isinstance(policy, dict):
        errors.append("source form scoringPolicy must be an object")
    else:
        if policy.get("version") != data.get("scoringPolicyVersion"):
            errors.append("source form scoringPolicy.version must match scoringPolicyVersion")
        if policy.get("questionCount") != 25:
            errors.append("source form scoringPolicy.questionCount must be 25")
        for key in ("correct", "blank", "incorrect", "maxScore"):
            issue = score_value_error(policy.get(key))
            if issue:
                errors.append(f"source form scoringPolicy.{key} {issue}")
        if score_value_error(policy.get("correct")) is None and score_value_error(policy.get("maxScore")) is None and not score_values_equal(policy.get("maxScore"), policy.get("correct") * 25):
            errors.append("source form scoringPolicy.maxScore must equal correct times 25")
    if not isinstance(data.get("sourceFiles"), list) or len(data.get("sourceFiles", [])) != 25:
        errors.append("sourceFiles must list exactly 25 questions")
    elif isinstance(data.get("sourceFiles"), list):
        entries = data["sourceFiles"]
        if any(
            not isinstance(entry, dict)
            or not isinstance(entry.get("number"), int)
            or isinstance(entry.get("number"), bool)
            or not isinstance(entry.get("path"), str)
            for entry in entries
        ):
            errors.append("each sourceFiles entry requires number and relative path")
        else:
            numbers = [entry["number"] for entry in entries]
            if sorted(numbers) != list(range(1, 26)):
                errors.append("sourceFiles numbers must be unique and exactly 1 through 25")
    return errors


def load_source_form(path: Path, *, source_root: Path) -> SourceForm:
    data = _load_json(path)
    errors = _source_form_errors(data)
    if errors:
        raise ContentBuildError(errors)
    return SourceForm(data=data, path=path.resolve(), source_root=source_root.resolve())


def _safe_source_path(source_root: Path, relative_path: str) -> Path:
    candidate = (source_root / relative_path).resolve()
    try:
        candidate.relative_to(source_root.resolve())
    except ValueError as error:
        raise ContentBuildError([f"source path escapes source root: {relative_path}"]) from error
    return candidate


def parse_source_form(form: SourceForm) -> list[ParsedProblem]:
    parsed: list[ParsedProblem] = []
    errors: list[str] = []
    for entry in sorted(form.data["sourceFiles"], key=lambda item: item["number"]):
        number = entry["number"]
        relative_path = entry["path"]
        try:
            source_file = _safe_source_path(form.source_root, relative_path)
            if not source_file.is_file():
                raise ContentBuildError([f"source file is missing: {relative_path}"])
            parsed.append(
                parse_problem_markdown(
                    source_file,
                    number=number,
                    source_path=relative_path,
                    source_root=form.source_root,
                )
            )
        except (OSError, UnicodeDecodeError, ContentBuildError) as error:
            errors.extend(getattr(error, "messages", [str(error)]))
    if errors:
        raise ContentBuildError(errors)
    return parsed


def question_bundle_hash(parsed: list[ParsedProblem]) -> str:
    """Bind an approved answer key to exactly the reviewed prompts and choices."""

    bundle = [
        {
            "number": question.number,
            "sourceRef": {"path": question.source_path, "sha256": question.source_sha256},
            "promptMarkdown": question.prompt_markdown,
            "choices": question.choices,
        }
        for question in sorted(parsed, key=lambda item: item.number)
    ]
    return canonical_hash({"questions": bundle})


def review_data(form: SourceForm, parsed: list[ParsedProblem]) -> dict[str, Any]:
    issue_counter = Counter(issue.severity for question in parsed for issue in question.issues)
    return {
        "schemaVersion": "amc-practice-source-review-v1",
        "form": {
            "id": form.data["id"],
            "version": form.data["version"],
            "title": form.data["title"],
            "publicationStatus": form.data["publicationStatus"],
            "isSynthetic": form.data["isSynthetic"],
            "sourceFormPath": _source_form_reference(form),
        },
        "questionBundleHash": question_bundle_hash(parsed),
        "summary": {
            "questionCount": len(parsed),
            "errors": issue_counter["error"],
            "warnings": issue_counter["warning"],
            "info": issue_counter["info"],
            "publishable": issue_counter["error"] == 0,
        },
        "questions": [question.as_review_dict() for question in sorted(parsed, key=lambda item: item.number)],
        "disclaimer": (
            "Any unverifiedSolutionAnswerCandidates are parser review signals from community solution text. "
            "They are not an approved answer key and must not be imported as correct options."
        ),
    }


def review_markdown(review: dict[str, Any]) -> str:
    summary = review["summary"]
    form = review["form"]
    lines = [
        f"# Source review: {form['title']}",
        "",
        f"- Form id: `{form['id']}`",
        f"- Form version: `{form['version']}`",
        f"- Publication status: `{form['publicationStatus']}`",
        f"- Question bundle hash: `{review['questionBundleHash']}`",
        f"- Publishable: **{'yes' if summary['publishable'] else 'no'}**",
        f"- Issues: {summary['errors']} error(s), {summary['warnings']} warning(s), {summary['info']} info item(s)",
        "",
        "> Unverified solution answer candidates below are signals for a human reviewer only. They are never an answer key.",
        "",
        "| # | Choices | Media | Candidate letters (unverified) | Issues |",
        "| --- | --- | --- | --- | --- |",
    ]
    for question in review["questions"]:
        choices = ", ".join(question["choices"].keys()) or "—"
        media = ", ".join(item.get("status", item.get("kind", "media")) for item in question["media"]) or "—"
        candidates = ", ".join(question["unverifiedSolutionAnswerCandidates"]) or "—"
        issues = "; ".join(
            f"{item['severity']}:{item['code']}" for item in question["issues"]
        ) or "—"
        lines.append(f"| {question['number']} | {choices} | {media} | {candidates} | {issues} |")
    lines.extend(["", "## Required next action", ""])
    if summary["publishable"]:
        lines.append(
            "Obtain a separately approved answer-key JSON whose `questionBundleHash` matches this report before building."
        )
    else:
        lines.append(
            "Repair every error above, rerun this report, then obtain an independently approved answer-key JSON."
        )
    return "\n".join(lines) + "\n"


def _answer_key_errors(answer_key: dict[str, Any], *, form: SourceForm, bundle_hash: str) -> list[str]:
    errors: list[str] = []
    required = {"schemaVersion", "formId", "formVersion", "answerKeyVersion", "questionBundleHash", "approval", "answers"}
    missing = sorted(required - set(answer_key))
    if missing:
        errors.append(f"approved answer key missing fields: {', '.join(missing)}")
        return errors
    if answer_key.get("schemaVersion") != ANSWER_KEY_SCHEMA:
        errors.append(f"approved answer key schemaVersion must be {ANSWER_KEY_SCHEMA}")
    if not isinstance(answer_key.get("answerKeyVersion"), str) or not answer_key.get("answerKeyVersion").strip():
        errors.append("approved answer key answerKeyVersion must be a non-empty string")
    if answer_key.get("formId") != form.data["id"]:
        errors.append("approved answer key formId does not match source form id")
    if answer_key.get("formVersion") != form.data["version"]:
        errors.append("approved answer key formVersion does not match source form version")
    if answer_key.get("questionBundleHash") != bundle_hash:
        errors.append("approved answer key questionBundleHash does not match reviewed prompts/choices")
    approval = answer_key.get("approval")
    if not isinstance(approval, dict) or approval.get("status") != "approved":
        errors.append("answer key requires an explicit approval.status of approved")
    elif any(not isinstance(approval.get(key), str) or not approval[key].strip() for key in ("approvedBy", "approvedAt", "evidence")):
        errors.append("approved answer key requires approval.approvedBy, approvedAt, and evidence")
    elif (
        not isinstance(approval.get("reviewedBy"), list)
        or len(approval["reviewedBy"]) < 2
        or any(not isinstance(reviewer, str) or not reviewer.strip() for reviewer in approval["reviewedBy"])
        or len(set(approval["reviewedBy"])) != len(approval["reviewedBy"])
    ):
        errors.append("approved answer key requires at least two distinct non-empty approval.reviewedBy reviewers")
    answers = answer_key.get("answers")
    if not isinstance(answers, list) or len(answers) != 25:
        errors.append("approved answer key must contain exactly 25 answers")
    elif isinstance(answers, list):
        if any(
            not isinstance(answer, dict)
            or not isinstance(answer.get("number"), int)
            or isinstance(answer.get("number"), bool)
            or answer.get("correctOption") not in EXPECTED_OPTIONS
            for answer in answers
        ):
            errors.append("every approved answer must have integer number and correctOption A through E")
        else:
            numbers = [answer["number"] for answer in answers]
            if sorted(numbers) != list(range(1, 26)):
                errors.append("approved answer key answer numbers must be unique and exactly 1 through 25")
    return errors


def _form_release_errors(form: SourceForm, parsed: list[ParsedProblem]) -> list[str]:
    errors: list[str] = []
    if len(parsed) != 25:
        errors.append("parsed source did not yield 25 questions")
    for question in parsed:
        for issue in question.errors:
            errors.append(f"question {question.number}: {issue.code}: {issue.message}")
    return errors


def build_artifacts(
    form: SourceForm,
    *,
    answer_key_path: Path,
    allow_test_only: bool = False,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    """Build `(public_manifest, private_manifest, review)` after all release gates."""

    # ``SourceForm`` is intentionally a lightweight data holder so callers can
    # inspect it, but artifacts must never trust that it has not been mutated
    # after ``load_source_form`` validated it.  Re-run the source boundary
    # checks before we calculate hashes or project public JSON; otherwise an
    # invalid number could escape as an implementation ``ValueError`` instead
    # of a reviewable release-gate failure.
    source_errors = _source_form_errors(form.data)
    if source_errors:
        raise ContentBuildError(source_errors)

    status = form.data.get("publicationStatus")
    if (form.data.get("isSynthetic") or status == "test-only") and not allow_test_only:
        raise ContentBuildError(["test-only/synthetic forms require --allow-test-only to build"])
    if status not in {"approved", "test-only"}:
        raise ContentBuildError(["source form must have publicationStatus approved before it can be built"])
    parsed = parse_source_form(form)
    release_errors = _form_release_errors(form, parsed)
    if release_errors:
        raise ContentBuildError(release_errors)
    bundle_hash = question_bundle_hash(parsed)
    answer_key = _load_json(answer_key_path)
    key_errors = _answer_key_errors(answer_key, form=form, bundle_hash=bundle_hash)
    if key_errors:
        raise ContentBuildError(key_errors)
    keys_by_number = {answer["number"]: answer["correctOption"] for answer in answer_key["answers"]}

    common = {
        "id": form.data["id"],
        "version": form.data["version"],
        "title": form.data["title"],
        "publicationStatus": form.data["publicationStatus"],
        "isSynthetic": form.data["isSynthetic"],
        "durationSeconds": form.data["durationSeconds"],
        "scoringPolicyVersion": form.data["scoringPolicyVersion"],
        "scoringPolicy": form.data["scoringPolicy"],
        "questionBundleHash": bundle_hash,
    }
    private_questions = [
        {
            "number": question.number,
            "sourceRef": {"path": question.source_path, "sha256": question.source_sha256},
            "promptMarkdown": question.prompt_markdown,
            "choices": question.choices,
            "correctOption": keys_by_number[question.number],
            "solutionMarkdown": question.solution_markdown,
        }
        for question in sorted(parsed, key=lambda item: item.number)
    ]
    private_manifest: dict[str, Any] = {
        "schemaVersion": "amc-practice-private-form-v1",
        **common,
        "questions": private_questions,
        "provenance": {
            "sourceForm": _source_form_reference(form),
            "sourceFormSchemaVersion": form.data["schemaVersion"],
            "formVersion": form.data["version"],
            "answerKeySchemaVersion": answer_key["schemaVersion"],
            "answerKeyVersion": answer_key["answerKeyVersion"],
            "answerKeyApproval": answer_key["approval"],
            "contentRights": form.data["contentRights"],
        },
    }
    public_manifest = public_projection(private_manifest)
    private_manifest["contentHash"] = public_manifest["contentHash"]
    private_manifest["manifestHash"] = canonical_hash(private_manifest, omit=("manifestHash",))

    errors = validate_public_manifest(public_manifest) + validate_private_manifest(private_manifest)
    if errors:
        raise ContentBuildError([f"generated manifest invalid: {error}" for error in errors])
    return public_manifest, private_manifest, review_data(form, parsed)


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(canonical_json(value), encoding="utf-8")
