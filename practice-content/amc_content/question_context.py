"""Build private, review-only question contexts with all written solutions.

This module is deliberately separate from :mod:`amc_content.parser`'s
student-facing first-solution policy.  Nothing produced here is approved for
student or model use: it is a deterministic review artifact whose candidate
solutions must pass a later human content review.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

from .builder import ContentBuildError, SourceForm, parse_source_form
from .canonical import canonical_hash, normalize_markdown, sha256_bytes, sha256_text
from .model import ParsedProblem
from .parser import parse_problem_markdown
from .validator import validate_archive_private_manifest


QUESTION_CONTEXT_SCHEMA = "amc-question-context-candidates-v1"
QUESTION_CONTEXT_SET_SCHEMA = "amc-question-context-candidate-set-v1"
ARCHIVE_QUESTION_CONTEXT_SET_SCHEMA = "amc-question-context-archive-candidate-set-v1"
CLASSIFICATION_POLICY_VERSION = "amc-written-solution-title-review-v1"

_HEADING_RE = re.compile(r"^(?P<marks>#{2,4})\s+(?P<title>.+?)\s*$")
_FENCE_RE = re.compile(r"^\s*(?P<marker>`{3,}|~{3,})")
_WHITESPACE_RE = re.compile(r"\s+")
_NON_CHEESE_RE = re.compile(r"\b(?:no[ -]?cheese|non[ -]?cheese)\b", re.IGNORECASE)
_QUARANTINE_TITLE_RULES: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("title-says-does-not-work", re.compile(r"\bdoes\s+not\s+(?:actually\s+)?work\b", re.IGNORECASE)),
    ("title-says-fake-solve", re.compile(r"\bfake[ -]?solve\b", re.IGNORECASE)),
    ("title-says-worst", re.compile(r"\bworst\b", re.IGNORECASE)),
    ("title-says-incorrect", re.compile(r"\b(?:incorrect|wrong)\s+solution\b", re.IGNORECASE)),
    ("title-says-joke", re.compile(r"\bjoke\s+solution\b", re.IGNORECASE)),
    (
        "title-targets-modified-problem",
        re.compile(r"\bsolution\s+for\s+certain\s+china\s+testpapers\b", re.IGNORECASE),
    ),
)


@dataclass(frozen=True)
class _Heading:
    index: int
    level: Literal[2, 3, 4]
    title: str


@dataclass(frozen=True)
class WrittenSolutionSection:
    """One source-ordered written solution awaiting human review."""

    source_order: int
    title: str
    heading_level: Literal[2, 3, 4]
    body_markdown: str
    heading_line: int
    end_line: int
    review_status: Literal["candidate", "quarantined"]
    quarantine_reasons: tuple[str, ...]
    excluded_source_ranges: tuple[tuple[int, int, str], ...]
    source_path: str
    source_sha256: str

    def as_dict(self) -> dict[str, Any]:
        return {
            "solutionId": f"solution-{self.source_order:03d}",
            "sourceOrder": self.source_order,
            "title": self.title,
            "headingLevel": self.heading_level,
            "bodyMarkdown": self.body_markdown,
            "bodySha256": sha256_text(self.body_markdown),
            "reviewStatus": self.review_status,
            "quarantineReasons": list(self.quarantine_reasons),
            "excludedSourceRanges": [
                {"headingLine": start, "endLine": end, "kind": kind}
                for start, end, kind in self.excluded_source_ranges
            ],
            "sourceRef": {
                "path": self.source_path,
                "sha256": self.source_sha256,
                "headingLine": self.heading_line,
                "endLine": self.end_line,
            },
        }


def _headings_outside_fences(lines: list[str]) -> list[_Heading]:
    headings: list[_Heading] = []
    active_fence: tuple[str, int] | None = None
    for index, line in enumerate(lines):
        fence_match = _FENCE_RE.match(line)
        if fence_match:
            marker = fence_match.group("marker")
            if active_fence is None:
                active_fence = (marker[0], len(marker))
            elif marker[0] == active_fence[0] and len(marker) >= active_fence[1]:
                active_fence = None
            continue
        if active_fence is not None:
            continue
        match = _HEADING_RE.match(line)
        if match:
            headings.append(
                _Heading(
                    index=index,
                    level=len(match.group("marks")),  # type: ignore[arg-type]
                    title=match.group("title").strip(),
                )
            )
    return headings


def _normalized_title(title: str) -> str:
    return _WHITESPACE_RE.sub(" ", title.strip()).casefold()


def _heading_kind(title: str) -> str:
    normalized = _normalized_title(title)
    if "video" in normalized:
        return "excluded"
    if normalized.startswith(("note", "remark", "sidenote", "editorial", "see also", "related")):
        return "excluded"
    if re.search(r"\b(?:note|remark|editorial)\b", normalized):
        return "excluded"
    if normalized in {"references", "resources", "external links"}:
        return "excluded"
    if normalized == "solutions":
        return "solutions-container"
    if "solution" in normalized or normalized.startswith("answer"):
        return "written-solution"
    return "other"


def _is_written_subsolution(title: str) -> bool:
    """Recognize an H3 solution, without splitting headings like details/diagrams."""

    if _heading_kind(title) != "written-solution":
        return False
    normalized = _normalized_title(title)
    return normalized.startswith(
        ("solution", "alternate solution", "alternative solution", "complete solution", "worked out solution", "answer")
    )


def _quarantine_reasons(title: str, body_markdown: str) -> tuple[str, ...]:
    reasons = [code for code, pattern in _QUARANTINE_TITLE_RULES if pattern.search(title)]
    if re.search(r"\bcheese\b", title, re.IGNORECASE) and not _NON_CHEESE_RE.search(title):
        reasons.append("title-says-cheese")
    if not body_markdown.strip():
        reasons.append("empty-solution-body")
    return tuple(reasons)


def _section(
    lines: list[str],
    *,
    heading: _Heading,
    end_index: int,
    source_order: int,
    source_path: str,
    source_sha256: str,
    body_lines: list[str] | None = None,
    excluded_ranges: tuple[tuple[int, int, str], ...] = (),
) -> WrittenSolutionSection:
    body = normalize_markdown(
        "\n".join(lines[heading.index + 1 : end_index] if body_lines is None else body_lines)
    )
    reasons = _quarantine_reasons(heading.title, body)
    return WrittenSolutionSection(
        source_order=source_order,
        title=heading.title,
        heading_level=heading.level,
        body_markdown=body,
        heading_line=heading.index + 1,
        end_line=max(heading.index + 1, end_index),
        review_status="quarantined" if reasons else "candidate",
        quarantine_reasons=reasons,
        excluded_source_ranges=excluded_ranges,
        source_path=source_path,
        source_sha256=source_sha256,
    )


def extract_written_solution_sections(
    source_file: Path,
    *,
    source_path: str | None = None,
) -> list[WrittenSolutionSection]:
    """Extract source-ordered written solution sections at Markdown H2--H4.

    Video, metadata, and editorial headings are structural boundaries but are
    never returned.  Source order and one-based source line spans are retained.
    The status vocabulary intentionally has no ``approved`` value.
    """

    source_file = source_file.resolve()
    raw = source_file.read_bytes()
    text = raw.decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    headings = _headings_outside_fences(lines)
    source_reference = source_path or source_file.name
    if (
        not source_reference
        or Path(source_reference).is_absolute()
        or "\\" in source_reference
        or ".." in Path(source_reference).parts
    ):
        raise ContentBuildError(["source_path must be a safe non-empty relative POSIX path"])
    source_sha256 = sha256_bytes(raw)
    sections: list[WrittenSolutionSection] = []

    def section_end(position: int) -> int:
        heading = headings[position]
        return next(
            (later.index for later in headings[position + 1 :] if later.level <= heading.level),
            len(lines),
        )

    def is_solution(position: int) -> bool:
        heading = headings[position]
        return (
            heading.level == 2 and _heading_kind(heading.title) == "written-solution"
        ) or (heading.level in {3, 4} and _is_written_subsolution(heading.title))

    def has_excluded_ancestor(position: int) -> bool:
        heading = headings[position]
        for ancestor_position in range(position - 1, -1, -1):
            ancestor = headings[ancestor_position]
            if ancestor.level >= heading.level:
                continue
            if heading.index < section_end(ancestor_position):
                return _heading_kind(ancestor.title) == "excluded" or has_excluded_ancestor(ancestor_position)
        return False

    for position, heading in enumerate(headings):
        if not is_solution(position) or has_excluded_ancestor(position):
            continue
        natural_end = section_end(position)
        descendants = [
            (descendant_position, descendant)
            for descendant_position, descendant in enumerate(headings[position + 1 :], start=position + 1)
            if descendant.index < natural_end
        ]
        nested_solutions = [item for item in descendants if is_solution(item[0]) and not has_excluded_ancestor(item[0])]
        normalized_title = _normalized_title(heading.title)
        if normalized_title in {"solution", "solutions"} and nested_solutions:
            # Old conversions use both singular and plural wrapper headings.
            continue
        body_end = nested_solutions[0][1].index if nested_solutions else natural_end
        excluded_ranges: list[tuple[int, int, str]] = []
        for descendant_position, descendant in descendants:
            if descendant.index >= body_end or _heading_kind(descendant.title) != "excluded":
                continue
            excluded_end = min(section_end(descendant_position), body_end)
            excluded_ranges.append((descendant.index, excluded_end, "excluded-heading"))
        body_lines = [
            line
            for line_index, line in enumerate(lines[heading.index + 1 : body_end], start=heading.index + 1)
            if not any(start <= line_index < end for start, end, _ in excluded_ranges)
        ]
        sections.append(
            _section(
                lines,
                heading=heading,
                end_index=natural_end,
                source_order=len(sections) + 1,
                source_path=source_reference,
                source_sha256=source_sha256,
                body_lines=body_lines,
                excluded_ranges=tuple(
                    (start + 1, max(start + 1, end), kind) for start, end, kind in excluded_ranges
                ),
            )
        )
    return sections


def _strict_keys(
    value: Any,
    *,
    required: set[str],
    optional: set[str] = frozenset(),
    path: str,
) -> list[str]:
    if not isinstance(value, dict):
        return [f"{path} must be an object"]
    errors: list[str] = []
    missing = sorted(required - set(value))
    unknown = sorted(set(value) - required - optional)
    if missing:
        errors.append(f"{path} missing fields: {', '.join(missing)}")
    if unknown:
        errors.append(f"{path} has unknown fields: {', '.join(unknown)}")
    return errors


def _sha256_error(value: Any, path: str) -> str | None:
    if not isinstance(value, str) or re.fullmatch(r"[0-9a-f]{64}", value) is None:
        return f"{path} must be a lowercase SHA-256 hex string"
    return None


def validate_question_context(context: Any) -> list[str]:
    """Strictly validate one candidate context, including semantic hashes."""

    errors = _strict_keys(
        context,
        required={
            "schemaVersion", "classificationPolicyVersion", "audience", "question",
            "solutions", "disclaimer", "contextHash",
        },
        optional={"releaseBinding"},
        path="context",
    )
    if errors or not isinstance(context, dict):
        return errors
    if context.get("schemaVersion") != QUESTION_CONTEXT_SCHEMA:
        errors.append(f"context schemaVersion must be {QUESTION_CONTEXT_SCHEMA}")
    if context.get("classificationPolicyVersion") != CLASSIFICATION_POLICY_VERSION:
        errors.append("context classificationPolicyVersion is unsupported")
    if context.get("audience") != "private-review-only":
        errors.append("context audience must be private-review-only")
    if not isinstance(context.get("disclaimer"), str) or not context["disclaimer"].strip():
        errors.append("context disclaimer must be non-empty")

    question = context.get("question")
    errors.extend(
        _strict_keys(
            question,
            required={"number", "sourceRef", "promptMarkdown", "choices", "sourceReviewIssues"},
            path="context.question",
        )
    )
    if isinstance(question, dict):
        number = question.get("number")
        if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 26):
            errors.append("context.question.number must be an integer from 1 through 25")
        source_ref = question.get("sourceRef")
        errors.extend(_strict_keys(source_ref, required={"path", "sha256"}, path="context.question.sourceRef"))
        if isinstance(source_ref, dict):
            if not isinstance(source_ref.get("path"), str) or not source_ref["path"]:
                errors.append("context.question.sourceRef.path must be non-empty")
            elif Path(source_ref["path"]).is_absolute() or "\\" in source_ref["path"] or ".." in Path(source_ref["path"]).parts:
                errors.append("context.question.sourceRef.path must be a safe relative POSIX path")
            sha_error = _sha256_error(source_ref.get("sha256"), "context.question.sourceRef.sha256")
            if sha_error:
                errors.append(sha_error)
        if not isinstance(question.get("promptMarkdown"), str) or not question["promptMarkdown"].strip():
            errors.append("context.question.promptMarkdown must be non-empty")
        choices = question.get("choices")
        if not isinstance(choices, dict) or set(choices) != set("ABCDE"):
            errors.append("context.question.choices must define exactly A through E")
        elif any(not isinstance(value, str) or not value.strip() for value in choices.values()):
            errors.append("context.question choices must be non-empty strings")
        issues = question.get("sourceReviewIssues")
        if not isinstance(issues, list):
            errors.append("context.question.sourceReviewIssues must be an array")
        else:
            for index, issue in enumerate(issues):
                issue_path = f"context.question.sourceReviewIssues[{index}]"
                errors.extend(
                    _strict_keys(
                        issue,
                        required={"code", "message", "severity"},
                        optional={"line"},
                        path=issue_path,
                    )
                )
                if isinstance(issue, dict) and issue.get("severity") not in {"error", "warning", "info"}:
                    errors.append(f"{issue_path}.severity is invalid")
                if isinstance(issue, dict):
                    if not isinstance(issue.get("code"), str) or not issue["code"]:
                        errors.append(f"{issue_path}.code must be non-empty")
                    if not isinstance(issue.get("message"), str) or not issue["message"]:
                        errors.append(f"{issue_path}.message must be non-empty")
                    if "line" in issue and (
                        isinstance(issue["line"], bool) or not isinstance(issue["line"], int) or issue["line"] < 1
                    ):
                        errors.append(f"{issue_path}.line must be a positive integer")

    solutions = context.get("solutions")
    if not isinstance(solutions, list):
        errors.append("context.solutions must be an array")
    else:
        for index, solution in enumerate(solutions, start=1):
            path = f"context.solutions[{index - 1}]"
            errors.extend(
                _strict_keys(
                    solution,
                    required={
                        "solutionId", "sourceOrder", "title", "headingLevel", "bodyMarkdown",
                        "bodySha256", "reviewStatus", "quarantineReasons", "excludedSourceRanges", "sourceRef",
                    },
                    path=path,
                )
            )
            if not isinstance(solution, dict):
                continue
            if solution.get("solutionId") != f"solution-{index:03d}" or solution.get("sourceOrder") != index:
                errors.append(f"{path} id/order must match source position {index}")
            if not isinstance(solution.get("title"), str) or not solution["title"].strip():
                errors.append(f"{path}.title must be non-empty")
            if solution.get("headingLevel") not in {2, 3, 4}:
                errors.append(f"{path}.headingLevel must be 2, 3, or 4")
            body = solution.get("bodyMarkdown")
            if not isinstance(body, str):
                errors.append(f"{path}.bodyMarkdown must be a string")
            elif solution.get("bodySha256") != sha256_text(body):
                errors.append(f"{path}.bodySha256 does not match bodyMarkdown")
            status = solution.get("reviewStatus")
            reasons = solution.get("quarantineReasons")
            if status not in {"candidate", "quarantined"}:
                errors.append(f"{path}.reviewStatus must be candidate or quarantined")
            if not isinstance(reasons, list) or any(not isinstance(reason, str) or not reason for reason in reasons):
                errors.append(f"{path}.quarantineReasons must be an array of non-empty strings")
            elif (status == "candidate" and reasons) or (status == "quarantined" and not reasons):
                errors.append(f"{path} reviewStatus and quarantineReasons disagree")
            ranges = solution.get("excludedSourceRanges")
            if not isinstance(ranges, list):
                errors.append(f"{path}.excludedSourceRanges must be an array")
            else:
                for range_index, excluded in enumerate(ranges):
                    excluded_path = f"{path}.excludedSourceRanges[{range_index}]"
                    errors.extend(
                        _strict_keys(
                            excluded,
                            required={"headingLine", "endLine", "kind"},
                            path=excluded_path,
                        )
                    )
                    if isinstance(excluded, dict) and (
                        excluded.get("kind") != "excluded-heading"
                        or isinstance(excluded.get("headingLine"), bool)
                        or not isinstance(excluded.get("headingLine"), int)
                        or isinstance(excluded.get("endLine"), bool)
                        or not isinstance(excluded.get("endLine"), int)
                        or excluded.get("headingLine", 0) < 1
                        or excluded.get("endLine", 0) < excluded.get("headingLine", 1)
                    ):
                        errors.append(f"{excluded_path} has an invalid source range")
            source_ref = solution.get("sourceRef")
            errors.extend(
                _strict_keys(
                    source_ref,
                    required={"path", "sha256", "headingLine", "endLine"},
                    path=f"{path}.sourceRef",
                )
            )
            if isinstance(source_ref, dict):
                if not isinstance(source_ref.get("path"), str) or not source_ref["path"]:
                    errors.append(f"{path}.sourceRef.path must be non-empty")
                sha_error = _sha256_error(source_ref.get("sha256"), f"{path}.sourceRef.sha256")
                if sha_error:
                    errors.append(sha_error)
                heading_line = source_ref.get("headingLine")
                end_line = source_ref.get("endLine")
                if (
                    isinstance(heading_line, bool) or not isinstance(heading_line, int) or heading_line < 1
                    or isinstance(end_line, bool) or not isinstance(end_line, int) or end_line < heading_line
                ):
                    errors.append(f"{path}.sourceRef has invalid heading/end lines")
            if isinstance(source_ref, dict) and isinstance(question, dict):
                question_source_ref = question.get("sourceRef")
                if not isinstance(question_source_ref, dict):
                    question_source_ref = {}
                if source_ref.get("path") != question_source_ref.get("path"):
                    errors.append(f"{path}.sourceRef.path does not match question source")
                if source_ref.get("sha256") != question_source_ref.get("sha256"):
                    errors.append(f"{path}.sourceRef.sha256 does not match question source")

    release = context.get("releaseBinding")
    if release is not None:
        errors.extend(
            _strict_keys(
                release,
                required={"formId", "formVersion", "questionBundleHash", "contentHash", "manifestHash"},
                path="context.releaseBinding",
            )
        )
        if isinstance(release, dict):
            if not isinstance(release.get("formId"), str) or not release["formId"]:
                errors.append("context.releaseBinding.formId must be non-empty")
            if not isinstance(release.get("formVersion"), str) or not release["formVersion"]:
                errors.append("context.releaseBinding.formVersion must be non-empty")
            for key in ("questionBundleHash", "contentHash", "manifestHash"):
                sha_error = _sha256_error(release.get(key), f"context.releaseBinding.{key}")
                if sha_error:
                    errors.append(sha_error)
    if context.get("contextHash") != canonical_hash(context, omit=("contextHash",)):
        errors.append("context.contextHash does not match canonical content")
    return errors


def _context_from_parsed(
    parsed: ParsedProblem,
    *,
    source_file: Path,
    released_question: dict[str, Any] | None = None,
    release_binding: dict[str, Any] | None = None,
    allow_released_parser_errors: bool = False,
) -> dict[str, Any]:
    solutions = extract_written_solution_sections(source_file, source_path=parsed.source_path)
    current_source_sha256 = sha256_bytes(source_file.read_bytes())
    if current_source_sha256 != parsed.source_sha256 or any(
        solution.source_sha256 != parsed.source_sha256 for solution in solutions
    ):
        raise ContentBuildError([f"source changed while building question context: {parsed.source_path}"])
    if parsed.errors and not allow_released_parser_errors:
        raise ContentBuildError(
            [f"{parsed.source_path}: parser error {issue.code}: {issue.message}" for issue in parsed.errors]
        )
    prompt = parsed.prompt_markdown if released_question is None else released_question["promptMarkdown"]
    choices = parsed.choices if released_question is None else released_question["choices"]
    context: dict[str, Any] = {
        "schemaVersion": QUESTION_CONTEXT_SCHEMA,
        "classificationPolicyVersion": CLASSIFICATION_POLICY_VERSION,
        "audience": "private-review-only",
        "question": {
            "number": parsed.number,
            "sourceRef": {"path": parsed.source_path, "sha256": parsed.source_sha256},
            "promptMarkdown": prompt,
            "choices": choices,
            "sourceReviewIssues": [issue.as_dict() for issue in parsed.issues],
        },
        "solutions": [solution.as_dict() for solution in solutions],
        "disclaimer": (
            "Every extracted solution is unapproved community source material. "
            "Only a later, explicit human approval may make a solution eligible for student AI context."
        ),
    }
    if release_binding is not None:
        context["releaseBinding"] = release_binding
    context["contextHash"] = canonical_hash(context)
    validation_errors = validate_question_context(context)
    if validation_errors:
        raise ContentBuildError([f"invalid question context: {error}" for error in validation_errors])
    return context


def build_question_context(
    source_file: Path,
    *,
    number: int,
    source_path: str | None = None,
    source_root: Path | None = None,
) -> dict[str, Any]:
    """Build one deterministic, review-only question-context candidate."""

    if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 26):
        raise ContentBuildError(["question number must be an integer from 1 through 25"])
    source_file = source_file.resolve()
    resolved_root = (source_root or source_file.parent).resolve()
    try:
        source_file.relative_to(resolved_root)
    except ValueError as error:
        raise ContentBuildError([f"source file escapes source root: {source_file}"]) from error
    stable_source_path = source_path or source_file.relative_to(resolved_root).as_posix()
    if (
        not stable_source_path
        or Path(stable_source_path).is_absolute()
        or "\\" in stable_source_path
        or ".." in Path(stable_source_path).parts
    ):
        raise ContentBuildError(["source_path must be a safe non-empty relative POSIX path"])
    parsed = parse_problem_markdown(
        source_file,
        number=number,
        source_path=stable_source_path,
        source_root=resolved_root,
    )
    return _context_from_parsed(parsed, source_file=source_file)


def _context_summary(contexts: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "questionCount": len(contexts),
        "candidateSolutionCount": sum(
            solution["reviewStatus"] == "candidate" for context in contexts for solution in context["solutions"]
        ),
        "quarantinedSolutionCount": sum(
            solution["reviewStatus"] == "quarantined" for context in contexts for solution in context["solutions"]
        ),
        "approvedSolutionCount": 0,
        "parserErrorCount": sum(
            issue["severity"] == "error" for context in contexts for issue in context["question"]["sourceReviewIssues"]
        ),
        "parserWarningCount": sum(
            issue["severity"] == "warning" for context in contexts for issue in context["question"]["sourceReviewIssues"]
        ),
    }


def validate_question_context_set(context_set: Any) -> list[str]:
    """Strictly validate one source-form candidate set and its aggregate hash."""

    errors = _strict_keys(
        context_set,
        required={
            "schemaVersion", "classificationPolicyVersion", "audience", "form", "summary",
            "questions", "disclaimer", "setHash",
        },
        path="contextSet",
    )
    if errors or not isinstance(context_set, dict):
        return errors
    if context_set.get("schemaVersion") != QUESTION_CONTEXT_SET_SCHEMA:
        errors.append(f"contextSet schemaVersion must be {QUESTION_CONTEXT_SET_SCHEMA}")
    if context_set.get("classificationPolicyVersion") != CLASSIFICATION_POLICY_VERSION:
        errors.append("contextSet classificationPolicyVersion is unsupported")
    if context_set.get("audience") != "private-review-only":
        errors.append("contextSet audience must be private-review-only")
    errors.extend(
        _strict_keys(
            context_set.get("form"),
            required={"id", "version", "title", "sourceFormPath"},
            path="contextSet.form",
        )
    )
    form = context_set.get("form")
    if isinstance(form, dict):
        for key in ("id", "version", "title", "sourceFormPath"):
            if not isinstance(form.get(key), str) or not form[key]:
                errors.append(f"contextSet.form.{key} must be non-empty")
    summary = context_set.get("summary")
    errors.extend(
        _strict_keys(
            summary,
            required={
                "questionCount", "candidateSolutionCount", "quarantinedSolutionCount",
                "approvedSolutionCount", "parserErrorCount", "parserWarningCount",
            },
            path="contextSet.summary",
        )
    )
    if isinstance(summary, dict):
        for key, value in summary.items():
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                errors.append(f"contextSet.summary.{key} must be a nonnegative integer")
        if summary.get("approvedSolutionCount") != 0:
            errors.append("contextSet.summary.approvedSolutionCount must be zero")
    questions = context_set.get("questions")
    if not isinstance(questions, list):
        errors.append("contextSet.questions must be an array")
    else:
        if len(questions) != 25:
            errors.append("contextSet.questions must contain exactly 25 questions")
        child_errors: list[str] = []
        numbers: list[int] = []
        all_numbers_are_integers = True
        for index, context in enumerate(questions):
            child_errors.extend(f"questions[{index}]: {error}" for error in validate_question_context(context))
            if not isinstance(context, dict):
                all_numbers_are_integers = False
                continue
            question = context.get("question")
            if not isinstance(question, dict):
                all_numbers_are_integers = False
                continue
            number = question.get("number")
            if isinstance(number, bool) or not isinstance(number, int):
                all_numbers_are_integers = False
                continue
            numbers.append(number)
        errors.extend(child_errors)
        if not all_numbers_are_integers or numbers != list(range(1, 26)):
            errors.append("contextSet question numbers must be exactly 1 through 25 in order")
        if not child_errors and isinstance(summary, dict) and summary != _context_summary(questions):
            errors.append("contextSet summary does not match questions")
    if context_set.get("setHash") != canonical_hash(context_set, omit=("setHash",)):
        errors.append("contextSet.setHash does not match canonical content")
    return errors


def build_question_context_set(form: SourceForm) -> dict[str, Any]:
    """Build one deterministic candidate set from a validated source form."""

    parsed_questions = parse_source_form(form)
    contexts: list[dict[str, Any]] = []
    for parsed in sorted(parsed_questions, key=lambda item: item.number):
        source_file = (form.source_root / parsed.source_path).resolve()
        try:
            source_file.relative_to(form.source_root)
        except ValueError as error:
            raise ContentBuildError([f"source path escapes source root: {parsed.source_path}"]) from error
        contexts.append(_context_from_parsed(parsed, source_file=source_file))

    try:
        source_form_path = form.path.relative_to(form.source_root).as_posix()
    except ValueError:
        source_form_path = form.path.name
    result: dict[str, Any] = {
        "schemaVersion": QUESTION_CONTEXT_SET_SCHEMA,
        "classificationPolicyVersion": CLASSIFICATION_POLICY_VERSION,
        "audience": "private-review-only",
        "form": {
            "id": form.data["id"],
            "version": form.data["version"],
            "title": form.data["title"],
            "sourceFormPath": source_form_path,
        },
        "summary": _context_summary(contexts),
        "questions": contexts,
        "disclaimer": (
            "This set is a private review artifact, not a published solution bundle. "
            "It contains no approved solutions."
        ),
    }
    result["setHash"] = canonical_hash(result)
    validation_errors = validate_question_context_set(result)
    if validation_errors:
        raise ContentBuildError([f"invalid question context set: {error}" for error in validation_errors])
    return result


def validate_archive_question_context_set(context_set: Any) -> list[str]:
    """Strictly validate the 48-form released archive candidate inventory."""

    errors = _strict_keys(
        context_set,
        required={
            "schemaVersion", "classificationPolicyVersion", "audience", "archiveRelease",
            "summary", "forms", "disclaimer", "setHash",
        },
        path="archiveContextSet",
    )
    if errors or not isinstance(context_set, dict):
        return errors
    if context_set.get("schemaVersion") != ARCHIVE_QUESTION_CONTEXT_SET_SCHEMA:
        errors.append(f"archiveContextSet schemaVersion must be {ARCHIVE_QUESTION_CONTEXT_SET_SCHEMA}")
    if context_set.get("classificationPolicyVersion") != CLASSIFICATION_POLICY_VERSION:
        errors.append("archiveContextSet classificationPolicyVersion is unsupported")
    if context_set.get("audience") != "private-review-only":
        errors.append("archiveContextSet audience must be private-review-only")
    release = context_set.get("archiveRelease")
    errors.extend(
        _strict_keys(
            release,
            required={"batchSchemaVersion", "releaseVersion", "sourcePath", "sourceSha256"},
            path="archiveContextSet.archiveRelease",
        )
    )
    if isinstance(release, dict):
        if release.get("batchSchemaVersion") != "amc-practice-archive-release-batch-v1":
            errors.append("archiveContextSet.archiveRelease.batchSchemaVersion is unsupported")
        for key in ("releaseVersion", "sourcePath"):
            if not isinstance(release.get(key), str) or not release[key]:
                errors.append(f"archiveContextSet.archiveRelease.{key} must be non-empty")
        sha_error = _sha256_error(release.get("sourceSha256"), "archiveContextSet.archiveRelease.sourceSha256")
        if sha_error:
            errors.append(sha_error)
    summary = context_set.get("summary")
    errors.extend(
        _strict_keys(
            summary,
            required={
                "formCount", "questionCount", "candidateSolutionCount", "quarantinedSolutionCount",
                "approvedSolutionCount", "parserErrorCount", "parserWarningCount",
            },
            path="archiveContextSet.summary",
        )
    )
    if isinstance(summary, dict):
        for key, value in summary.items():
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                errors.append(f"archiveContextSet.summary.{key} must be a nonnegative integer")
        if summary.get("formCount") != 48 or summary.get("questionCount") != 1200:
            errors.append("archiveContextSet summary must describe exactly 48 forms and 1200 questions")
        if summary.get("approvedSolutionCount") != 0:
            errors.append("archiveContextSet.summary.approvedSolutionCount must be zero")
    forms = context_set.get("forms")
    flattened: list[dict[str, Any]] = []
    if not isinstance(forms, list):
        errors.append("archiveContextSet.forms must be an array")
    else:
        if len(forms) != 48:
            errors.append("archiveContextSet must contain exactly 48 forms")
        seen_ids: set[str] = set()
        for form_index, form_record in enumerate(forms):
            path = f"archiveContextSet.forms[{form_index}]"
            errors.extend(_strict_keys(form_record, required={"form", "summary", "questions"}, path=path))
            if not isinstance(form_record, dict):
                continue
            form = form_record.get("form")
            errors.extend(
                _strict_keys(
                    form,
                    required={"id", "version", "title", "questionBundleHash", "contentHash", "manifestHash"},
                    path=f"{path}.form",
                )
            )
            if isinstance(form, dict):
                form_id = form.get("id")
                if not isinstance(form_id, str) or not form_id:
                    errors.append(f"{path}.form.id must be non-empty")
                elif form_id in seen_ids:
                    errors.append(f"{path}.form.id is duplicated")
                else:
                    seen_ids.add(form_id)
                for key in ("version", "title"):
                    if not isinstance(form.get(key), str) or not form[key]:
                        errors.append(f"{path}.form.{key} must be non-empty")
                for key in ("questionBundleHash", "contentHash", "manifestHash"):
                    sha_error = _sha256_error(form.get(key), f"{path}.form.{key}")
                    if sha_error:
                        errors.append(sha_error)
            questions = form_record.get("questions")
            if not isinstance(questions, list) or len(questions) != 25:
                errors.append(f"{path}.questions must contain exactly 25 contexts")
                continue
            child_errors: list[str] = []
            for question_index, context in enumerate(questions):
                child_errors.extend(
                    f"{path}.questions[{question_index}]: {error}" for error in validate_question_context(context)
                )
            errors.extend(child_errors)
            if child_errors:
                continue
            flattened.extend(questions)
            expected_summary = _context_summary(questions)
            if form_record.get("summary") != expected_summary:
                errors.append(f"{path}.summary does not match questions")
            if isinstance(form, dict):
                for context in questions:
                    binding = context.get("releaseBinding", {})
                    expected_binding = {
                        "formId": form.get("id"),
                        "formVersion": form.get("version"),
                        "questionBundleHash": form.get("questionBundleHash"),
                        "contentHash": form.get("contentHash"),
                        "manifestHash": form.get("manifestHash"),
                    }
                    if binding != expected_binding:
                        errors.append(f"{path} question release binding does not match form")
    if isinstance(summary, dict) and forms is not None and not errors:
        aggregate = _context_summary(flattened)
        expected_archive_summary = {"formCount": len(forms), **aggregate}
        if summary != expected_archive_summary:
            errors.append("archiveContextSet summary does not match forms")
    if context_set.get("setHash") != canonical_hash(context_set, omit=("setHash",)):
        errors.append("archiveContextSet.setHash does not match canonical content")
    return errors


def build_archive_question_context_set(
    private_release_path: Path,
    *,
    source_root: Path,
) -> dict[str, Any]:
    """Bind all candidates to an exact, already-built 48-form archive release.

    Released prompts and choices are copied verbatim from the validated private
    archive manifests, so all approved overrides and mirrored prompt media are
    preserved. Raw source is used only for extracting additional candidates and
    must match every released ``sourceRef.sha256``.
    """

    source_root = source_root.resolve()
    private_release_path = private_release_path.resolve()
    try:
        release_source_path = private_release_path.relative_to(source_root).as_posix()
    except ValueError as error:
        raise ContentBuildError(["archive private release must be inside source_root for stable provenance"]) from error
    try:
        release_raw = private_release_path.read_bytes()
        release = json.loads(release_raw.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ContentBuildError([f"cannot read archive private release {private_release_path}: {error}"]) from error
    if not isinstance(release, dict) or release.get("schemaVersion") != "amc-practice-archive-release-batch-v1":
        raise ContentBuildError(["archive private release has an unsupported batch schema"])
    manifests = release.get("forms")
    if not isinstance(manifests, list) or len(manifests) != 48:
        raise ContentBuildError(["archive private release must contain exactly 48 forms"])
    if any(not isinstance(manifest, dict) for manifest in manifests):
        raise ContentBuildError(["archive private release contains a non-object form"])
    release_versions = {manifest.get("version") for manifest in manifests}
    if len(release_versions) != 1 or not all(isinstance(version, str) and version for version in release_versions):
        raise ContentBuildError(["archive private release forms must share one non-empty version"])
    expected_form_ids = {
        f"amc12-{year}-{variant}" for year in range(2002, 2026) for variant in ("a", "b")
    }
    actual_form_ids = {manifest.get("id") for manifest in manifests}
    if actual_form_ids != expected_form_ids:
        raise ContentBuildError(["archive private release must contain the canonical 2002–2025 A/B form ids"])

    form_records: list[dict[str, Any]] = []
    for manifest in manifests:
        validation_errors = validate_archive_private_manifest(manifest)
        if validation_errors:
            form_id = manifest.get("id", "unknown") if isinstance(manifest, dict) else "unknown"
            raise ContentBuildError([f"archive release {form_id} invalid: {error}" for error in validation_errors])
        binding = {
            "formId": manifest["id"],
            "formVersion": manifest["version"],
            "questionBundleHash": manifest["questionBundleHash"],
            "contentHash": manifest["contentHash"],
            "manifestHash": manifest["manifestHash"],
        }
        contexts: list[dict[str, Any]] = []
        for released_question in sorted(manifest["questions"], key=lambda item: item["number"]):
            source_ref = released_question["sourceRef"]
            source_file = (source_root / source_ref["path"]).resolve()
            try:
                source_file.relative_to(source_root)
            except ValueError as error:
                raise ContentBuildError([f"archive source escapes source root: {source_ref['path']}"]) from error
            if not source_file.is_file() or sha256_bytes(source_file.read_bytes()) != source_ref["sha256"]:
                raise ContentBuildError([f"archive source hash mismatch: {source_ref['path']}"])
            parsed = parse_problem_markdown(
                source_file,
                number=released_question["number"],
                source_path=source_ref["path"],
                source_root=source_root,
            )
            contexts.append(
                _context_from_parsed(
                    parsed,
                    source_file=source_file,
                    released_question=released_question,
                    release_binding=binding,
                    allow_released_parser_errors=True,
                )
            )
        form_records.append(
            {
                "form": {
                    "id": manifest["id"],
                    "version": manifest["version"],
                    "title": manifest["title"],
                    "questionBundleHash": manifest["questionBundleHash"],
                    "contentHash": manifest["contentHash"],
                    "manifestHash": manifest["manifestHash"],
                },
                "summary": _context_summary(contexts),
                "questions": contexts,
            }
        )
    all_contexts = [context for form in form_records for context in form["questions"]]
    result: dict[str, Any] = {
        "schemaVersion": ARCHIVE_QUESTION_CONTEXT_SET_SCHEMA,
        "classificationPolicyVersion": CLASSIFICATION_POLICY_VERSION,
        "audience": "private-review-only",
        "archiveRelease": {
            "batchSchemaVersion": release["schemaVersion"],
            "releaseVersion": next(iter(release_versions)),
            "sourcePath": release_source_path,
            "sourceSha256": sha256_bytes(release_raw),
        },
        "summary": {"formCount": len(form_records), **_context_summary(all_contexts)},
        "forms": form_records,
        "disclaimer": "Private review inventory bound to an exact released archive; no solution is approved.",
    }
    result["setHash"] = canonical_hash(result)
    validation_errors = validate_archive_question_context_set(result)
    if validation_errors:
        raise ContentBuildError([f"invalid archive question context set: {error}" for error in validation_errors])
    return result


def _literal_markdown(value: str) -> str:
    """Render source-controlled text inert with a collision-safe code fence."""

    longest = max((len(run) for run in re.findall(r"`+", value)), default=0)
    fence = "`" * max(3, longest + 1)
    terminator = "" if value.endswith("\n") else "\n"
    return f"{fence}text\n{value}{terminator}{fence}"


def question_context_markdown(context: dict[str, Any]) -> str:
    """Render deterministic review Markdown with all source data inert."""

    question = context["question"]
    source_ref = question["sourceRef"]
    lines = [
        f"# Question {question['number']} context candidates",
        "",
        "> **PRIVATE REVIEW ONLY.** Every solution below is unapproved. Candidate does not mean correct.",
        "",
        f"- Context hash: `{context['contextHash']}`",
        f"- Source SHA-256: `{source_ref['sha256']}`",
        f"- Classification policy: `{context['classificationPolicyVersion']}`",
        "",
        "## Source path (literal)",
        "",
        _literal_markdown(source_ref["path"]),
        "",
        "## Problem",
        "",
        _literal_markdown(question["promptMarkdown"]),
        "",
        "## Choices",
        "",
    ]
    for option in sorted(question["choices"]):
        lines.extend([f"### Choice {option} (literal)", "", _literal_markdown(question["choices"][option]), ""])
    issues = question["sourceReviewIssues"]
    lines.extend(["## Parser review issues", ""])
    if not issues:
        lines.extend(["_None._", ""])
    for issue_index, issue in enumerate(issues, start=1):
        lines.extend(
            [
                f"### Parser issue {issue_index} ({issue['severity']})",
                "",
                "Code (literal):",
                "",
                _literal_markdown(issue["code"]),
                "",
                "Message (literal):",
                "",
                _literal_markdown(issue["message"]),
                "",
            ]
        )
    lines.extend(["", "## Written solution candidates", ""])
    if not context["solutions"]:
        lines.extend(["_No written solution candidates were extracted._", ""])
    for solution in context["solutions"]:
        reasons = ", ".join(solution["quarantineReasons"]) or "none"
        source = solution["sourceRef"]
        lines.extend(
            [
                f"### Solution candidate {solution['sourceOrder']}",
                "",
                f"- Review status: `{solution['reviewStatus']}`",
                f"- Quarantine reasons: `{reasons}`",
                f"- Source lines: {source['headingLine']}–{source['endLine']}",
                f"- Body SHA-256: `{solution['bodySha256']}`",
                "",
                "Title (literal):",
                "",
                _literal_markdown(solution["title"]),
                "",
                "Body (literal):",
                "",
                _literal_markdown(solution["bodyMarkdown"]),
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def question_context_set_markdown(context_set: dict[str, Any]) -> str:
    """Render a deterministic form-level review document."""

    form = context_set["form"]
    summary = context_set["summary"]
    lines = [
        "# Question context candidate set",
        "",
        "> **PRIVATE REVIEW ONLY.** This artifact contains no approved solutions.",
        "",
        f"- Set hash: `{context_set['setHash']}`",
        f"- Questions: {summary['questionCount']}",
        f"- Candidate solutions: {summary['candidateSolutionCount']}",
        f"- Quarantined solutions: {summary['quarantinedSolutionCount']}",
        f"- Parser errors: {summary['parserErrorCount']}",
        f"- Parser warnings: {summary['parserWarningCount']}",
        "",
        "## Form id (literal)",
        "",
        _literal_markdown(form["id"]),
        "",
        "## Form version (literal)",
        "",
        _literal_markdown(form["version"]),
        "",
        "## Form title (literal)",
        "",
        _literal_markdown(form["title"]),
        "",
    ]
    for context in context_set["questions"]:
        rendered = question_context_markdown(context)
        # Preserve each standalone canonical question document verbatim. Raw
        # community bodies may themselves contain headings, so a blanket
        # heading rewrite would silently alter source material.
        lines.extend(["---", "", rendered.rstrip(), ""])
    return "\n".join(lines).rstrip() + "\n"


def archive_question_context_set_markdown(context_set: dict[str, Any]) -> str:
    """Render the reproducible 48-form inventory without activating source text."""

    summary = context_set["summary"]
    lines = [
        "# Archive question context candidate inventory",
        "",
        "> **PRIVATE REVIEW ONLY.** All source-controlled text is rendered as literal code.",
        "",
        f"- Set hash: `{context_set['setHash']}`",
        f"- Forms: {summary['formCount']}",
        f"- Questions: {summary['questionCount']}",
        f"- Candidate solutions: {summary['candidateSolutionCount']}",
        f"- Quarantined solutions: {summary['quarantinedSolutionCount']}",
        f"- Parser errors: {summary['parserErrorCount']}",
        f"- Parser warnings: {summary['parserWarningCount']}",
        "",
    ]
    for form_index, form_record in enumerate(context_set["forms"], start=1):
        form = form_record["form"]
        form_summary = form_record["summary"]
        lines.extend(
            [
                "---",
                "",
                f"## Archive form {form_index}",
                "",
                f"- Questions: {form_summary['questionCount']}",
                f"- Parser errors: {form_summary['parserErrorCount']}",
                f"- Parser warnings: {form_summary['parserWarningCount']}",
                "",
                "Form id (literal):",
                "",
                _literal_markdown(form["id"]),
                "",
                "Form version (literal):",
                "",
                _literal_markdown(form["version"]),
                "",
                "Form title (literal):",
                "",
                _literal_markdown(form["title"]),
                "",
            ]
        )
        for context in form_record["questions"]:
            lines.extend([question_context_markdown(context).rstrip(), ""])
    return "\n".join(lines).rstrip() + "\n"
