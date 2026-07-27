"""Conservative parser for the repository's AoPS-derived problem Markdown.

The parser is intentionally a release gate, not a best-effort scraper.  When a
source is ambiguous it returns a review issue and leaves the caller to repair
the source rather than guessing a prompt, diagram, or answer.
"""

from __future__ import annotations

import re
from pathlib import Path

from .canonical import normalize_markdown, sha256_bytes
from .model import Issue, ParsedProblem


_H1_RE = re.compile(r"^#\s+(.+?)\s*$")
_H2_RE = re.compile(r"^##\s+(.+?)\s*$")
_PROBLEM_HEADING_RE = re.compile(r"^problem(?:\s+\d+)?$", re.IGNORECASE)
_CHOICE_RE = re.compile(
    r"\\textbf\s*\{\s*\(\s*([A-Za-z])\s*\)\s*[^}]*\}", re.IGNORECASE
)
_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)")
_HTML_IMAGE_RE = re.compile(r"<img\b[^>]*?\bsrc\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)
_ASY_FENCE_RE = re.compile(r"^```\s*(?:asy|asymptote)\b", re.IGNORECASE | re.MULTILINE)


def _heading_kind(heading: str) -> str:
    """Classify a level-two heading that occurs after a problem heading."""

    normalized = heading.strip().lower()
    if _PROBLEM_HEADING_RE.fullmatch(normalized) or normalized.startswith("problem "):
        return "problem"
    if normalized == "diagram" or normalized.startswith("figure"):
        return "question-support"
    if "solution" in normalized or normalized.startswith("answer"):
        return "solution"
    if normalized.startswith(("why ", "see also", "related")):
        return "editorial"
    return "unknown"


def _find_problem_bounds(lines: list[str], issues: list[Issue]) -> tuple[int | None, int | None, int | None]:
    """Return (problem_heading, prompt_end, solution_bundle_start) line indexes."""

    problem_start: int | None = None
    for index, line in enumerate(lines):
        match = _H2_RE.match(line)
        if match and _PROBLEM_HEADING_RE.fullmatch(match.group(1).strip()):
            problem_start = index
            break

    if problem_start is None:
        issues.append(Issue("missing-problem-heading", "Expected a level-two `Problem` heading."))
        return None, None, None

    prompt_end = len(lines)
    boundary: int | None = None
    has_solution_heading = False
    for index in range(problem_start + 1, len(lines)):
        match = _H2_RE.match(lines[index])
        if not match:
            continue
        kind = _heading_kind(match.group(1))
        # Once a prompt boundary has been found, later solution/video/editorial
        # headings belong to the solution bundle. They must not be misreported
        # as defects in the prompt itself. Keep scanning only to establish that
        # an actual solution heading exists after a non-solution boundary.
        if boundary is not None:
            if kind == "solution":
                has_solution_heading = True
            continue
        if kind == "question-support":
            continue
        if kind == "solution":
            has_solution_heading = True
            boundary = index
            prompt_end = index
            continue
        if kind == "problem":
            boundary = index
            prompt_end = index
            issues.append(
                Issue(
                    "additional-problem-heading",
                    "Found another Problem heading before the source solutions; the prompt is ambiguous.",
                    line=index + 1,
                )
            )
            continue
        if kind == "editorial":
            boundary = index
            prompt_end = index
            issues.append(
                Issue(
                    "editorial-before-solution",
                    "Editorial/correction material appears before solutions and requires a source review.",
                    line=index + 1,
                )
            )
            continue
        # A source rendering notice is itself a release blocker: it signals that
        # a reviewer cannot rely on this Markdown as an exam prompt. Other
        # unknown headings can likewise hide source material.
        if "render" in match.group(1).lower() and "problem" in match.group(1).lower():
            issues.append(
                Issue(
                    "source-rendering-notice",
                    "Source reports a rendering problem; verify the rendered prompt.",
                    "error",
                    index + 1,
                )
            )
            continue
        boundary = index
        prompt_end = index
        issues.append(
            Issue(
                "unknown-heading-before-solution",
                f"Unclassified level-two heading `{match.group(1)}` before solutions.",
                line=index + 1,
            )
        )

    if not has_solution_heading:
        issues.append(Issue("missing-solution-heading", "Expected at least one level-two solution heading."))
    # Once the prompt ends, retain all source material as an unreviewed solution
    # bundle. A reviewer can decide which explanation(s) are suitable to show.
    return problem_start, prompt_end, boundary


def _choice_run(body: str) -> tuple[list[re.Match[str]], list[Issue]]:
    """Locate a contiguous A... choice run without assuming it is valid."""

    issues: list[Issue] = []
    markers = list(_CHOICE_RE.finditer(body))
    if not markers:
        return [], [Issue("missing-choice-markers", "Could not find LaTex A–E choice markers.")]

    best: list[re.Match[str]] = []
    for start, marker in enumerate(markers):
        if marker.group(1).upper() != "A":
            continue
        run = [marker]
        expected = ord("B")
        for next_marker in markers[start + 1 :]:
            letter = next_marker.group(1).upper()
            if letter != chr(expected):
                break
            run.append(next_marker)
            expected += 1
        if len(run) > len(best):
            best = run

    if not best:
        return [], [Issue("choice-order-invalid", "Could not find choices beginning with A in alphabetical order.")]
    letters = "".join(marker.group(1).upper() for marker in best)
    if letters != "ABCDE":
        issues.append(
            Issue(
                "choice-count-invalid",
                f"Expected exactly A–E choices, found contiguous choice labels `{letters}`.",
            )
        )
    return best, issues


def _trim_choice(value: str, *, math_block: bool) -> str:
    value = value.strip()
    # Separators belong to the old single-line answer layout, not to a choice.
    value = re.sub(r"(?:(?:\\qquad|\\quad|~)\s*)+$", "", value).strip()
    if math_block:
        value = value.strip().strip("$").strip()
        return f"${value}$" if value else ""
    return value


def _extract_choices(body: str, issues: list[Issue]) -> tuple[str, dict[str, str]]:
    run, run_issues = _choice_run(body)
    issues.extend(run_issues)
    if not run:
        return normalize_markdown(body), {}

    # A normal AoPS option row is one inline math block that starts directly
    # before A and ends directly after E. Preserve that mathematical context for
    # each individual option in the structured artifact.
    before = body[: run[0].start()].rstrip()
    opening_math = len(before) - 1 if before.endswith("$") else -1
    closing_math = body.find("$", run[-1].end()) if opening_math >= 0 else -1
    math_block = opening_math >= 0 and closing_math >= run[-1].end()
    choices: dict[str, str] = {}
    for index, marker in enumerate(run):
        if index + 1 < len(run):
            end = run[index + 1].start()
        elif math_block:
            end = closing_math
        else:
            # Non-math option rows are uncommon in the converted corpus. Stop at
            # their first blank line instead of accidentally absorbing prompt
            # prose that follows a malformed choice row.
            paragraph_end = body.find("\n\n", marker.end())
            end = paragraph_end if paragraph_end >= 0 else len(body)
        # Limit final choice to the closing math delimiter / immediately trailing
        # whitespace; prompt text after a malformed row should not become E.
        raw = body[marker.end() : end]
        letter = marker.group(1).upper()
        choices[letter] = _trim_choice(raw, math_block=math_block)

    prompt = body[: run[0].start()] + body[run[-1].end() :]
    if math_block:
        # Remove the now-empty outer delimiters surrounding the old answer row.
        prompt = body[:opening_math] + body[closing_math + 1 :]
    prompt = normalize_markdown(prompt)

    if set(choices) != set("ABCDE"):
        issues.append(Issue("choices-not-a-through-e", "Structured choices are not exactly A through E."))
    for letter, value in choices.items():
        if not value.strip():
            issues.append(Issue("empty-choice", f"Choice {letter} has no extracted text."))
    return prompt, choices


def _collect_media(prompt: str, *, source_file: Path, source_root: Path, issues: list[Issue]) -> list[dict[str, str]]:
    media: list[dict[str, str]] = []
    if "[Asymptote diagram - not rendered" in prompt or _ASY_FENCE_RE.search(prompt):
        issues.append(
            Issue(
                "unrendered-asymptote",
                "Prompt contains an Asymptote placeholder/code block rather than a renderable reviewed image.",
            )
        )

    for match in list(_IMAGE_RE.finditer(prompt)) + list(_HTML_IMAGE_RE.finditer(prompt)):
        reference = match.group(1)
        entry = {"kind": "image", "reference": reference}
        if re.match(r"https?://", reference, re.IGNORECASE):
            entry["status"] = "remote-unpinned"
            issues.append(
                Issue(
                    "remote-media-unpinned",
                    f"Prompt image `{reference}` is remote and must be mirrored/reviewed before release.",
                )
            )
        else:
            target = (source_file.parent / reference).resolve()
            try:
                target.relative_to(source_root.resolve())
            except ValueError:
                entry["status"] = "outside-source-root"
                issues.append(Issue("media-outside-source-root", f"Image `{reference}` escapes the source root."))
            else:
                entry["status"] = "present" if target.is_file() else "missing"
                if not target.is_file():
                    issues.append(Issue("missing-media-file", f"Prompt image `{reference}` does not exist."))
        media.append(entry)
    return media


def _solution_answer_candidates(solution: str) -> list[str]:
    """Find *review signals* only; callers must never use these as a key."""

    candidates: set[str] = set()
    patterns = (
        r"\\boxed\s*\{[^\n]{0,120}?\(\s*([A-E])\s*\)",
        r"(?:answer(?:\s+choice)?\s*(?:is|:|=)?\s*)(?:\\boxed\s*\{)?\s*\(?\s*([A-E])\s*\)?",
    )
    for pattern in patterns:
        candidates.update(match.upper() for match in re.findall(pattern, solution, flags=re.IGNORECASE))
    return sorted(candidates)


def parse_problem_markdown(
    source_file: Path,
    *,
    number: int,
    source_path: str | None = None,
    source_root: Path | None = None,
) -> ParsedProblem:
    """Parse one source file while preserving enough provenance for review."""

    source_file = source_file.resolve()
    source_root = (source_root or source_file.parent).resolve()
    raw = source_file.read_bytes()
    text = raw.decode("utf-8")
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    issues: list[Issue] = []

    title = next((match.group(1) for line in lines if (match := _H1_RE.match(line))), None)
    if title is None:
        issues.append(Issue("missing-title", "Expected a level-one source title.", "warning"))
    elif not re.search(rf"\bProblem\s+0*{number}\b", title, re.IGNORECASE):
        issues.append(
            Issue(
                "title-number-mismatch",
                f"Source title `{title}` does not identify expected problem {number}.",
                "warning",
            )
        )

    problem_start, prompt_end, solution_start = _find_problem_bounds(lines, issues)
    prompt = ""
    choices: dict[str, str] = {}
    solution = ""
    if problem_start is not None and prompt_end is not None:
        prompt_body = "\n".join(lines[problem_start + 1 : prompt_end])
        prompt, choices = _extract_choices(prompt_body, issues)
        if not prompt.strip():
            issues.append(Issue("empty-prompt", "No prompt text remains after extracting choices."))
    if solution_start is not None:
        solution = normalize_markdown("\n".join(lines[solution_start:]))
    else:
        solution = ""

    if not solution.strip():
        issues.append(Issue("missing-solution-bundle", "No source solution bundle was extracted."))
    media = _collect_media(prompt, source_file=source_file, source_root=source_root, issues=issues)
    candidates = _solution_answer_candidates(solution)
    if candidates:
        issues.append(
            Issue(
                "unverified-solution-answer-candidates",
                "Solution text contains answer-looking option letters; these are review signals, never a key.",
                "info",
            )
        )

    return ParsedProblem(
        number=number,
        source_path=source_path or source_file.name,
        source_sha256=sha256_bytes(raw),
        prompt_markdown=prompt,
        choices=choices,
        solution_markdown=solution,
        media=media,
        solution_answer_candidates=candidates,
        issues=issues,
    )
