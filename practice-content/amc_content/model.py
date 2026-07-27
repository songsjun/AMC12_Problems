"""Small typed data model shared by the content parser and builder."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


Severity = Literal["error", "warning", "info"]


@dataclass(frozen=True)
class Issue:
    code: str
    message: str
    severity: Severity = "error"
    line: int | None = None

    def as_dict(self) -> dict[str, object]:
        result: dict[str, object] = {
            "code": self.code,
            "message": self.message,
            "severity": self.severity,
        }
        if self.line is not None:
            result["line"] = self.line
        return result


@dataclass
class ParsedProblem:
    number: int
    source_path: str
    source_sha256: str
    prompt_markdown: str
    choices: dict[str, str]
    solution_markdown: str
    media: list[dict[str, str]] = field(default_factory=list)
    solution_answer_candidates: list[str] = field(default_factory=list)
    issues: list[Issue] = field(default_factory=list)

    @property
    def errors(self) -> list[Issue]:
        return [issue for issue in self.issues if issue.severity == "error"]

    def as_review_dict(self) -> dict[str, object]:
        return {
            "number": self.number,
            "sourceRef": {"path": self.source_path, "sha256": self.source_sha256},
            "promptMarkdown": self.prompt_markdown,
            "choices": self.choices,
            "hasSolution": bool(self.solution_markdown.strip()),
            "media": self.media,
            "unverifiedSolutionAnswerCandidates": self.solution_answer_candidates,
            "issues": [issue.as_dict() for issue in self.issues],
        }
