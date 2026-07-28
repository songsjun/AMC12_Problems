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
_H3_RE = re.compile(r"^###\s+(.+?)\s*$")
_PROBLEM_HEADING_RE = re.compile(r"^problems?(?:\s+\d+)?$", re.IGNORECASE)
_CHOICE_RE = re.compile(
    r"""
    (?:
        # Most converted source uses a TeX text-style command around either
        # just the `(A)` label or the whole `(A) choice` fragment.  The
        # closing brace is deliberately not consumed here: `_extract_choices`
        # needs to distinguish those two layouts before it cuts the value.
        \\(?:textbf|mathrm|textrm|text|bf|rm)\s*(?:\$\s*)?\{
            \s*\(\s*(?P<styled>[A-Za-z])\s*\)
        |
        # Older AoPS pages instead write `({\\mathrm {A}})`.  This complete
        # label is safe to consume because its type-setting brace ends before
        # the option value begins.
        \(\s*\\(?:textbf|mathrm|textrm|text|bf|rm)\s*\{
            \s*(?P<outer>[A-Za-z])\s*\}\s*\)
        |
        # A handful of old pages omit parentheses for option A but retain the
        # normal `(B)` through `(E)` sequence. Require a visible choice-row
        # separator so ordinary bold variables never become answer markers.
        \\(?:textbf|mathrm|textrm|text|bf|rm)\s*\{
            \s*(?P<bare>[A-Za-z])\s*\}(?=\s*(?:[-—]|\\qquad|\\quad))
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)
_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)")
_HTML_IMAGE_RE = re.compile(r"<img\b[^>]*?\bsrc\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)
# AoPS-derived Markdown sometimes carries a visual as a normal-looking wiki
# link, e.g. ``[File:diagram.png](https://.../File:diagram.png)``.  Markdown
# itself does not mark that as an image, but treating it as a harmless text
# link would release an incomplete question.  Keep it in the same media gate
# as ordinary image syntax so archive importers must mirror it first.
_AOPS_MEDIA_LINK_RE = re.compile(
    r"\[(?:file|image):[^\]]+\]\(([^)\s]+)(?:\s+[^)]*)?\)",
    re.IGNORECASE,
)
# Converted wiki syntax may discard the `File:` label and leave a visual link
# such as `[300px|center](.../index.php/File:diagram.png)`.  The destination,
# rather than the visible label, identifies it as required question media.
_AOPS_WIKI_IMAGE_LINK_RE = re.compile(
    r"\[[^\]]*\]\((https?://artofproblemsolving\.com/wiki/index\.php/(?:file|image):[^)\s]+)(?:\s+[^)]*)?\)",
    re.IGNORECASE,
)
_ASY_FENCE_RE = re.compile(r"^```\s*(?:asy|asymptote)\b", re.IGNORECASE | re.MULTILINE)
_FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")


def _headings_outside_fences(lines: list[str], heading_pattern: re.Pattern[str]):
    """Yield requested Markdown headings while ignoring literal source code blocks.

    A few historical Asymptote snippets contain lines beginning with ``##``.
    Treating those as Markdown headings truncates a question before its option
    row, which is worse than reporting an unrendered diagram: it silently
    changes what a student would be asked.  Fence tracking is intentionally
    small and Markdown-compatible (matching backtick/tilde fences only).
    """

    active_fence: tuple[str, int] | None = None
    for index, line in enumerate(lines):
        fence_match = _FENCE_RE.match(line)
        if fence_match:
            marker = fence_match.group(1)
            if active_fence is None:
                active_fence = (marker[0], len(marker))
            elif marker[0] == active_fence[0] and len(marker) >= active_fence[1]:
                active_fence = None
            continue
        if active_fence is not None:
            continue
        match = heading_pattern.match(line)
        if match:
            yield index, match


def _h2_headings_outside_fences(lines: list[str]):
    """Yield level-two headings while ignoring literal source code blocks."""

    yield from _headings_outside_fences(lines, _H2_RE)


def _h3_headings_outside_fences(lines: list[str]):
    """Yield level-three headings while ignoring literal source code blocks."""

    yield from _headings_outside_fences(lines, _H3_RE)


def _heading_kind(heading: str) -> str:
    """Classify a level-two heading that occurs after a problem heading."""

    normalized = heading.strip().lower()
    if _PROBLEM_HEADING_RE.fullmatch(normalized) or normalized.startswith("problem "):
        return "problem"
    if normalized in {"diagram", "graph"} or normalized.startswith("figure"):
        return "question-support"
    # A video can be useful archival material but is never the canonical
    # written explanation sent to the post-submission practice view.  Some
    # converted files put it before Solution 1, so it needs its own kind
    # rather than matching the generic "solution" test below.
    if "video" in normalized:
        return "video"
    # Notes such as "Note Regarding Solutions" are source metadata, not a
    # second student prompt.  Keep them out of the question without treating a
    # known archival disclaimer as a malformed exam question.
    if normalized.startswith("note") or normalized in {"a brief note", "hints and method of attack"}:
        return "metadata"
    if "solution" in normalized or normalized.startswith("answer"):
        return "solution"
    if normalized.startswith(("why ", "see also", "related")):
        return "editorial"
    return "unknown"


def _find_problem_bounds(lines: list[str], issues: list[Issue]) -> tuple[int | None, int | None, int | None]:
    """Return (problem_heading, prompt_end, first_written_solution) indexes."""

    problem_start: int | None = None
    for index, match in _h2_headings_outside_fences(lines):
        if _PROBLEM_HEADING_RE.fullmatch(match.group(1).strip()):
            problem_start = index
            break

    if problem_start is None:
        issues.append(Issue("missing-problem-heading", "Expected a level-two `Problem` heading."))
        return None, None, None

    prompt_end = len(lines)
    prompt_boundary_found = False
    first_solution_start: int | None = None
    for index, match in _h2_headings_outside_fences(lines):
        if index <= problem_start:
            continue
        kind = _heading_kind(match.group(1))
        if kind == "question-support" and not prompt_boundary_found:
            continue
        if kind == "solution":
            if first_solution_start is None:
                first_solution_start = index
            if not prompt_boundary_found:
                prompt_end = index
                prompt_boundary_found = True
            continue
        if kind == "video":
            # Do not expose pre-solution video links in the question prompt;
            # keep scanning for a written solution section instead.
            if not prompt_boundary_found:
                prompt_end = index
                prompt_boundary_found = True
            continue
        if kind == "metadata":
            # Do not leak a community-maintenance note into the timed prompt;
            # unlike editorial material, it is not a source ambiguity by
            # itself.  Continue looking for a written explanation.
            if not prompt_boundary_found:
                prompt_end = index
                prompt_boundary_found = True
            continue
        # Once the student prompt has ended, later non-solution H2 headings
        # cannot change its bounds or become the selected explanation. Continue
        # only to find a genuine written solution heading.
        if prompt_boundary_found:
            continue
        if kind == "problem":
            prompt_end = index
            prompt_boundary_found = True
            issues.append(
                Issue(
                    "additional-problem-heading",
                    "Found another Problem heading before the source solutions; the prompt is ambiguous.",
                    line=index + 1,
                )
            )
            continue
        if kind == "editorial":
            prompt_end = index
            prompt_boundary_found = True
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
        prompt_end = index
        prompt_boundary_found = True
        issues.append(
            Issue(
                "unknown-heading-before-solution",
                f"Unclassified level-two heading `{match.group(1)}` before solutions.",
                line=index + 1,
            )
        )

    if first_solution_start is None:
        issues.append(Issue("missing-solution-heading", "Expected at least one level-two solution heading."))
    # The caller deliberately retains only the first H2 solution section for
    # student display. Later source headings may contain alternate solutions,
    # raw diagram code, or unreviewed editorial material.
    return problem_start, prompt_end, first_solution_start


def _first_h2_section(lines: list[str], start: int) -> list[str]:
    """Return one H2 section, including its heading and excluding the next H2.

    Source files commonly contain several solutions. The candidate private
    artifact carries only the first section for review as the student-facing
    explanation; every subsequent H2 is a boundary, including headings such
    as ``Solution 1.1``. This selection never substitutes for editorial
    review or answer-key approval.
    """

    end = len(lines)
    for index, _ in _h2_headings_outside_fences(lines):
        if index > start:
            end = index
            break
    heading_match = _H2_RE.match(lines[start])
    heading = heading_match.group(1).strip().lower() if heading_match else ""
    if heading == "solutions":
        # A plural H2 is an AoPS container, not itself a written solution. It
        # often holds several H3 alternatives, and later community variants
        # can be inconsistent. Keep the first actual written subsolution only
        # (while preserving any H4 detail inside it), matching the stated
        # first-solution display policy.
        h3_solutions = [
            index
            for index, match in _h3_headings_outside_fences(lines)
            if start < index < end and _heading_kind(match.group(1)) == "solution"
        ]
        if h3_solutions:
            first = h3_solutions[0]
            next_h3 = next((index for index in h3_solutions[1:] if index > first), end)
            return lines[first:next_h3]
    return lines[start:end]


def _choice_letter(marker: re.Match[str]) -> str:
    """Return the A--E marker captured by either supported legacy layout."""

    return (marker.group("styled") or marker.group("outer") or marker.group("bare")).upper()


def _choice_run(body: str) -> tuple[list[re.Match[str]], list[Issue]]:
    """Locate a contiguous A... choice run without assuming it is valid."""

    issues: list[Issue] = []
    markers = list(_CHOICE_RE.finditer(body))
    if not markers:
        return [], [Issue("missing-choice-markers", "Could not find LaTex A–E choice markers.")]

    best: list[re.Match[str]] = []
    for start, marker in enumerate(markers):
        if _choice_letter(marker) != "A":
            continue
        run = [marker]
        expected = ord("B")
        for next_marker in markers[start + 1 :]:
            letter = _choice_letter(next_marker)
            if letter != chr(expected):
                break
            run.append(next_marker)
            expected += 1
        if len(run) > len(best):
            best = run

    if not best:
        return [], [Issue("choice-order-invalid", "Could not find choices beginning with A in alphabetical order.")]
    letters = "".join(_choice_letter(marker) for marker in best)
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
    value = re.sub(r"^(?:(?:\\qquad|\\quad|~)\s*)+", "", value).strip()
    if not math_block:
        # Some converted rows open a fresh inline math span for every label
        # and leave an extra closing ``$`` after the final ``\\qquad``. It is
        # row punctuation, not part of the choice value (for example,
        # ``\\textbf{(E) }135 \\qquad$$``). Strip it before normalizing the
        # actual value, otherwise the final option and the timed prompt both
        # receive malformed TeX.
        value = re.sub(r"(?:(?:\\qquad|\\quad|~)\s*)+(?:\$\s*)+$", "", value).strip()
        # The next independently-delimited option often starts with a dollar
        # delimiter on a new line. Its opener is included in the preceding
        # value slice because the marker itself begins after that delimiter.
        # Remove only terminal delimiter runs; interior math remains.
        value = re.sub(r"(?:\$\s*)+$", "", value).strip()
    # A line-break command immediately before the next label's opening `$`
    # belongs to the option-row layout, not to this choice.
    value = re.sub(r"\\\\\s*\$$", "", value).strip()
    if not math_block and value.startswith("$"):
        # Older pages often put only the `(A)` label in one math span and its
        # value in the next one: ``$\\mathrm{(A)}$\\ $\\text{one}$``. The
        # first dollar is the label's closing delimiter, not part of the
        # choice. Normalize the remaining fragment into one safe math span.
        value = value[1:].lstrip()
        value = re.sub(r"^\\\s+", "", value).strip()
        if value.startswith("$"):
            # The value itself is already a math fragment. Some legacy rows
            # omit its closing delimiter because the next label opens a new
            # span; complete it deterministically rather than nesting `$$`.
            return value if value.count("$") % 2 == 0 else f"{value}$"
        if value.endswith("$"):
            value = value[:-1].rstrip()
        return f"${value}$" if value else ""
    # A legacy ``\\mathrm{(A) \\ 48 }`` layout keeps the value inside the
    # typesetting command. The caller removes the matching outer brace; this
    # remaining TeX-space escape is presentation-only and should not become a
    # malformed leading command in the structured option.
    value = re.sub(r"^\\\s+", "", value).strip()
    if math_block:
        value = value.strip().strip("$").strip()
        return f"${value}$" if value else ""
    return value


def _matching_brace(text: str, opening: int) -> int | None:
    """Return the index of the closing brace paired with ``opening``."""

    if opening < 0 or opening >= len(text) or text[opening] != "{":
        return None
    depth = 1
    for index in range(opening + 1, len(text)):
        if text[index] == "{":
            depth += 1
        elif text[index] == "}":
            depth -= 1
            if depth == 0:
                return index
    return None


def _styled_marker_value_bounds(body: str, marker: re.Match[str], next_start: int) -> tuple[int, int]:
    """Find a choice's value bounds without swallowing a legacy style brace.

    ``\\textbf{(A) } 1`` has a style command around the label only, while
    ``\\mathrm{(A) \\ 1 }`` has one around label *and* value. Both appear in
    the archive. Using the matching brace lets us support each form without
    guessing from whitespace or accidentally retaining a literal ``}`` in a
    student-visible option.
    """

    start = marker.end()
    if marker.group("styled") is None:
        return start, next_start

    opening = body.find("{", marker.start(), marker.end())
    closing = _matching_brace(body, opening)
    if closing is None or closing >= next_start:
        return start, next_start

    style_tail = body[start:closing]
    # ``\\mathrm{(A) \\ }`` is a label-only command: TeX's escaped space is
    # not the option value. Conversely ``\\mathrm{(A) \\ 48 }`` retains 48
    # after removing formatting-only spacing.
    visible_tail = re.sub(r"(?:\\\s+|~|\s)+", "", style_tail)
    if visible_tail:
        # The option's payload lives inside the style command.
        return start, closing
    # The style command contains only `(A)`; skip its closing brace and retain
    # the ordinary value that follows it.
    return closing + 1, next_start


def _final_non_math_choice_end(body: str, marker_end: int) -> int:
    """Return the end of the final independently-delimited choice row.

    Historical exports commonly put each option in its own inline math span.
    The final option is sometimes followed immediately by a `## Diagram`
    rather than a blank paragraph, so using the next blank line would absorb
    the diagram into choice E. In this layout every option row is line-local;
    retaining only the marker's line removes the option row without deleting
    following question support.
    """

    line_end = body.find("\n", marker_end)
    return len(body) if line_end < 0 else line_end


def _extract_choices(body: str, issues: list[Issue]) -> tuple[str, dict[str, str]]:
    run, run_issues = _choice_run(body)
    issues.extend(run_issues)
    if not run:
        return normalize_markdown(body), {}

    # A normal AoPS option row is one inline math block that starts directly
    # before A and ends directly after E. Preserve that mathematical context for
    # each individual option in the structured artifact.
    before = body[: run[0].start()].rstrip()
    if before.endswith("$$"):
        opening_math = len(before) - 2
        closing_math = body.find("$$", run[-1].end())
        math_block = closing_math >= run[-1].end()
        closing_width = 2
    elif before.endswith("$"):
        opening_math = len(before) - 1
        closing_math = body.find("$", run[-1].end())
        # A single `$` at every option label means five independent inline
        # spans, not one option row. Only call it a shared math block when no
        # extra dollar delimiter occurs between the A and E labels.
        math_block = (
            closing_math >= run[-1].end()
            and "$" not in body[run[0].end() : run[-1].start()]
        )
        closing_width = 1
    else:
        opening_math = -1
        closing_math = -1
        math_block = False
        closing_width = 0
    choices: dict[str, str] = {}
    final_choice_end = len(body)
    for index, marker in enumerate(run):
        if index + 1 < len(run):
            next_start = run[index + 1].start()
        elif math_block:
            next_start = closing_math
        else:
            next_start = _final_non_math_choice_end(body, marker.end())
            final_choice_end = next_start
        # Limit final choice to the closing math delimiter / immediately trailing
        # whitespace; prompt text after a malformed row should not become E.
        value_start, value_end = _styled_marker_value_bounds(body, marker, next_start)
        raw = body[value_start:value_end]
        letter = _choice_letter(marker)
        choices[letter] = _trim_choice(raw, math_block=math_block)

    if math_block:
        # Remove the now-empty outer delimiters surrounding the old answer row.
        prompt = body[:opening_math] + body[closing_math + closing_width :]
    else:
        # In independently-delimited rows the opening dollar immediately before
        # choice A is not part of the question. Remove the complete choice E
        # line too (rather than just its label), which prevents a duplicate
        # final option from appearing below the timed stem.
        prompt_start = run[0].start()
        while prompt_start > 0 and body[prompt_start - 1] == "$":
            prompt_start -= 1
        prompt = body[:prompt_start] + body[final_choice_end:]
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

    seen_references: set[str] = set()
    for match in (
        list(_IMAGE_RE.finditer(prompt))
        + list(_HTML_IMAGE_RE.finditer(prompt))
        + list(_AOPS_MEDIA_LINK_RE.finditer(prompt))
        + list(_AOPS_WIKI_IMAGE_LINK_RE.finditer(prompt))
    ):
        reference = match.group(1)
        if reference in seen_references:
            continue
        seen_references.add(reference)
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
        solution = normalize_markdown("\n".join(_first_h2_section(lines, solution_start)))
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
