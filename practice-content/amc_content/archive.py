"""Build auditable, self-hosted AMC archive-practice release artifacts.

This path is deliberately separate from the formal ``approved`` pipeline.
Historical source pages and answer keys are valuable for practice, but they do
not satisfy the current two-reviewer contract used for a newly approved form.
The generated ``archive-practice`` manifest therefore records its distinct
release authority, answer-key provenance, source repairs, and mirrored media
without claiming it is an official contest score.
"""

from __future__ import annotations

import json
import re
import tempfile
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .builder import ContentBuildError
from .canonical import canonical_hash, canonical_json, normalize_markdown, sha256_bytes
from .parser import parse_problem_markdown
from .validator import (
    archive_public_projection as validator_archive_public_projection,
    validate_archive_private_manifest,
    validate_archive_public_manifest,
)


ARCHIVE_MANIFEST_SCHEMA = "amc-practice-archive-form-v1"
ARCHIVE_KEY_SCHEMA = "amc-practice-historical-answer-keys-v1"
ARCHIVE_OVERRIDES_SCHEMA = "amc-practice-historical-overrides-v1"
ARCHIVE_MEDIA_SCHEMA = "amc12-historical-media-v1"
ARCHIVE_NOTICE = (
    "Archive practice: scores use a cross-checked historical answer-key catalog and are not official contest scores."
)
UNSCORED_NOTICE = (
    "> **Archive scoring note:** This source item is an adapted archival version whose answer cannot be "
    "safely matched to the historical answer key. It is shown for practice reading but is not included in the score.\n\n"
)

_FORM_DIR_RE = re.compile(r"^(?P<year>\d{4})_AMC_12(?P<variant>[AB])_Problems$")

# AMC changed the blank-answer value after the 2006 contest.  This belongs in
# the release artifact (rather than in a UI convention) so every saved
# submission carries the exact policy that was in force for that paper.
_EARLY_SCORING_POLICY_VERSION = "amc12-archive-2002-2006-v1"
_LATE_SCORING_POLICY_VERSION = "amc12-archive-2007-plus-v1"
# Historical conversions use both a quoted placeholder-plus-fence and a bare
# Asymptote fence.  Treat them as one logical question visual, including when
# a single question happens to contain both representations.
_ASY_MEDIA_RE = re.compile(
    r"(?ms)(?:^>\s*\[Asymptote diagram[^\n]*\]\s*\n)?^\s*```(?:asy|asymptote)\b.*?^```\s*",
    re.IGNORECASE,
)
_ASY_OPEN_FENCE_RE = re.compile(r"(?im)^\s*```(?:asy|asymptote)\b")
_ASY_CONTAINER_TAG_RE = re.compile(r"</?asy(?:\s[^>]*)?>", re.IGNORECASE)
# A historical converter sometimes wrapped one logical Asymptote program in
# ``<asy>`` while splitting the program across several Markdown fences.  That
# must be replaced as *one* visual: replacing every fence with the full
# rendered program repeats the diagram and leaves comments/source debris.
_ASY_CONTAINER_BLOCK_RE = re.compile(r"(?is)<asy(?:\s[^>]*)?>(?P<content>.*?)</asy\s*>")
# AoPS wiki exports can make the image dimensions the visible text, e.g.
# ``[300px|center](https://.../index.php/File:diagram.png)``.  A file name
# may itself contain parentheses, so matching a Markdown link with ``[^)]``
# would truncate valid URLs such as ``Desmos-graph_(1).png``.  The scoped link
# scanner below handles balanced parentheses and compares the complete URL to
# the media manifest's exact ``markdownReference``.
_AOPS_VISUAL_URL_RE = re.compile(
    r"^https?://artofproblemsolving\.com/"
    r"(?:wiki/index\.php/(?:file|image):\S+|wiki/images/\S+)$",
    re.IGNORECASE,
)
# A small number of converted archive pages refer to an SVG checked into the
# source form's ``media/`` directory.  Those diagrams are valid source input,
# but they must be mirrored just like AoPS files before a release can expose
# them.  Keep the accepted spelling deliberately narrow: it prevents a media
# manifest from using a convenient-looking Markdown reference to read an
# arbitrary repository file (or a sibling directory via ``..``).
_LOCAL_SOURCE_MEDIA_REFERENCE_RE = re.compile(
    r"^\.\./(?P<path>20\d{2}_AMC_12[AB]_Problems/media/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:svg|png|jpe?g|gif))$",
    re.IGNORECASE,
)
_LOCAL_SOURCE_MARKDOWN_IMAGE_RE = re.compile(
    r"!\[[^\]]*\]\(\.\./20\d{2}_AMC_12[AB]_Problems/media/[^)\s]+(?:\s+[^)]*)?\)",
    re.IGNORECASE,
)
_REMOTE_MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\((?:https?:)?//[^)\s]+(?:\s+[^)]*)?\)", re.IGNORECASE)
_REMOTE_HTML_IMAGE_RE = re.compile(r"<img\b[^>]*?\bsrc\s*=\s*[\"'](?:https?:)?//[^\"']+[\"']", re.IGNORECASE)
# Archive release rendering emits one deliberately small image grammar:
# ``![Archived diagram](../historical-media/assets/...)``.  Raw HTML images
# and reference-style images have different resolution rules in Markdown/HTML
# renderers, so accepting them here would create a second path around the
# per-scope immutable media manifest.  Reject them rather than trying to
# duplicate every renderer's reference and sanitization semantics.  A
# reference definition is independently rejected so shortcut images
# (``![label]``) cannot resolve either; this lets ordinary TeX factorials such
# as ``n![n+1]`` remain ordinary math rather than false-positive images.
_RAW_HTML_IMAGE_TAG_RE = re.compile(r"<img\b", re.IGNORECASE)
_REFERENCE_STYLE_MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]\r\n]*\][ \t]*\[[^\]\r\n]*\]")
_MARKDOWN_CONTAINER_PREFIX_RE = re.compile(
    # A reference definition may appear in a nested quote/list container.
    # This expression lands immediately before the block's real text.
    r"(?m)^[ \t]*(?:(?:>[ \t]*)|(?:(?:[-*+]|\d{1,9}[.)])[ \t]+))*",
)
_BOXED_CONTENT_RE = re.compile(
    # One nested TeX formatting group is enough for the archive's common
    # ``\\boxed{\\text{(B)}}`` / ``\\boxed{\\textbf{(B)} 11}`` forms. Some
    # older first solutions use TeX's equivalent ``\\fbox{\\textrm{A}}``.
    # Crucially, do not scan past the matching brace: a later discussion of
    # choice (E) must not be mistaken for a framed answer B.
    r"\\(?:boxed|fbox)\s*\{(?P<content>(?:[^{}\n]|\{[^{}\n]*\})*)\}",
    re.IGNORECASE,
)
_PARENTHESIZED_OPTION_RE = re.compile(r"\(\s*([A-E])\s*\)", re.IGNORECASE)
_BARE_OPTION_RE = re.compile(r"(?<![A-Za-z])([A-E])(?![A-Za-z])", re.IGNORECASE)
_PROMPT_DISCLOSURE_PATTERNS = (
    (
        "a solution heading",
        re.compile(r"(?im)^\s*#{1,6}\s*(?:video\s+)?solution\b"),
    ),
    (
        "a raw inline solution marker",
        re.compile(r"(?i)(?:^\s*solution(?:\s+\d+(?:\.\d+)?)?\s*==|==\s*solution\b)"),
    ),
    (
        "a modified-testpaper section",
        re.compile(r"(?i)\bmodified\s+problem\s+in\s+certain\s+china\s+testpapers\b"),
    ),
    (
        "a boxed multiple-choice answer",
        re.compile(r"\\boxed\s*\{[^\n}]{0,120}?\(\s*[A-E]\s*\)"),
    ),
)


@dataclass(frozen=True)
class ArchiveInputs:
    source_root: Path
    answer_keys_path: Path
    overrides_path: Path
    media_manifest_path: Path
    release_version: str


def _load_object(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise ContentBuildError([f"missing {label}: {path}"]) from error
    except (OSError, json.JSONDecodeError) as error:
        raise ContentBuildError([f"cannot read {label} {path}: {error}"]) from error
    if not isinstance(value, dict):
        raise ContentBuildError([f"{label} must be a JSON object: {path}"])
    return value


def _safe_relative(root: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError as error:
        raise ContentBuildError([f"source path escapes source root: {path}"]) from error


def _expect_choices(value: Any, context: str) -> dict[str, str]:
    if not isinstance(value, dict) or set(value) != {"A", "B", "C", "D", "E"}:
        raise ContentBuildError([f"{context} must define exactly choices A through E"])
    if any(not isinstance(item, str) or not item.strip() for item in value.values()):
        raise ContentBuildError([f"{context} has an empty choice"])
    return {option: normalize_markdown(item).strip() for option, item in value.items()}


def _form_directories(root: Path) -> list[tuple[int, str, Path]]:
    forms: list[tuple[int, str, Path]] = []
    for directory in sorted(root.glob("*_AMC_12[AB]_Problems")):
        match = _FORM_DIR_RE.fullmatch(directory.name)
        if not match:
            continue
        forms.append((int(match.group("year")), match.group("variant"), directory))
    if len(forms) != 48:
        raise ContentBuildError([f"expected all 48 AMC 12 archive directories, found {len(forms)}"])
    return forms


def _validate_key_catalog(catalog: dict[str, Any]) -> dict[str, dict[str, Any]]:
    if catalog.get("schemaVersion") != ARCHIVE_KEY_SCHEMA:
        raise ContentBuildError([f"historical answer-key schema must be {ARCHIVE_KEY_SCHEMA}"])
    forms = catalog.get("forms")
    if not isinstance(forms, list) or len(forms) != 48:
        raise ContentBuildError(["historical answer-key catalog must contain exactly 48 forms"])
    by_id: dict[str, dict[str, Any]] = {}
    for record in forms:
        if not isinstance(record, dict) or not isinstance(record.get("formId"), str):
            raise ContentBuildError(["historical answer-key catalog has an invalid form record"])
        answers = record.get("answers")
        if not isinstance(answers, list) or len(answers) != 25:
            raise ContentBuildError([f"historical answer-key {record['formId']} must have 25 answers"])
        if any(answer not in {"A", "B", "C", "D", "E", None} for answer in answers):
            raise ContentBuildError([f"historical answer-key {record['formId']} has an invalid option"])
        if record["formId"] in by_id:
            raise ContentBuildError([f"historical answer-key duplicates {record['formId']}"])
        if not isinstance(record.get("sourceUrl"), str) or not isinstance(record.get("canonicalAnswerKeyUrl"), str):
            raise ContentBuildError([f"historical answer-key {record['formId']} lacks source provenance"])
        raw_accepted = record.get("acceptedOptions", {})
        if not isinstance(raw_accepted, dict):
            raise ContentBuildError([f"historical answer-key {record['formId']} acceptedOptions must be an object"])
        accepted_options: dict[int, list[str]] = {}
        for raw_number, options in raw_accepted.items():
            try:
                number = int(raw_number)
            except (TypeError, ValueError) as error:
                raise ContentBuildError([f"historical answer-key {record['formId']} has an invalid acceptedOptions question number"]) from error
            if str(number) != str(raw_number) or number not in range(1, 26):
                raise ContentBuildError([f"historical answer-key {record['formId']} has an invalid acceptedOptions question number"])
            if (
                not isinstance(options, list)
                or not options
                or any(option not in {"A", "B", "C", "D", "E"} for option in options)
                or len(set(options)) != len(options)
                or answers[number - 1] not in options
            ):
                raise ContentBuildError(
                    [f"historical answer-key {record['formId']} acceptedOptions for question {number} must be unique A-E options including the canonical answer"]
                )
            accepted_options[number] = sorted(options)
        # Keep a normalized internal mapping so emitted manifests do not rely
        # on JSON object key spelling or option ordering.
        record = {**record, "acceptedOptions": accepted_options}
        by_id[record["formId"]] = record
    return by_id


def _validate_overrides(document: dict[str, Any]) -> dict[str, dict[str, Any]]:
    if document.get("schemaVersion") != ARCHIVE_OVERRIDES_SCHEMA:
        raise ContentBuildError([f"historical override schema must be {ARCHIVE_OVERRIDES_SCHEMA}"])
    overrides = document.get("overrides")
    if not isinstance(overrides, dict):
        raise ContentBuildError(["historical overrides must contain an overrides object"])
    result: dict[str, dict[str, Any]] = {}
    for path, override in overrides.items():
        if not isinstance(path, str) or not isinstance(override, dict):
            raise ContentBuildError(["historical overrides must use source paths and object values"])
        for key in ("promptMarkdown", "solutionMarkdown"):
            if key in override and (not isinstance(override[key], str) or not override[key].strip()):
                raise ContentBuildError([f"override {path} {key} must be non-empty text"])
        for key in ("promptReplacements", "solutionReplacements"):
            if key not in override:
                continue
            replacements = override[key]
            if not isinstance(replacements, list) or not replacements:
                raise ContentBuildError([f"override {path} {key} must be a non-empty list"])
            for index, replacement in enumerate(replacements, start=1):
                if (
                    not isinstance(replacement, dict)
                    or set(replacement) != {"from", "to"}
                    or not isinstance(replacement["from"], str)
                    or not replacement["from"]
                    or not isinstance(replacement["to"], str)
                    or not replacement["to"]
                    or replacement["from"] == replacement["to"]
                ):
                    raise ContentBuildError(
                        [f"override {path} {key} entry {index} must have distinct non-empty from/to text"]
                    )
        if "choices" in override:
            _expect_choices(override["choices"], f"override {path} choices")
        if "correctOption" in override and override["correctOption"] not in {"A", "B", "C", "D", "E", None}:
            raise ContentBuildError([f"override {path} has invalid correctOption"])
        result[path] = override
    return result


def _validate_media(document: dict[str, Any], *, media_path: Path) -> dict[tuple[str, str], list[dict[str, Any]]]:
    """Validate every placement and group it by emitted Markdown scope.

    The media builder records an entry for every individual Asymptote fence,
    every *container-level* Asymptote diagram, and every emitted AoPS visual.
    A container is one logical program whose old conversion split it over
    several fences; it must have one image placement, not one duplicate image
    per fence. Grouping by ``(markdownPath, markdownScope)`` prevents a
    post-submission solution asset from being appended to a timed prompt, and
    makes missing placement metadata a release-blocking error.
    """

    if document.get("schemaVersion") != ARCHIVE_MEDIA_SCHEMA:
        raise ContentBuildError([f"media manifest schema must be {ARCHIVE_MEDIA_SCHEMA}"])
    assets = document.get("assets")
    if not isinstance(assets, list):
        raise ContentBuildError(["media manifest assets must be a list"])
    by_scope: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    public_root = media_path.resolve().parents[3]
    seen_ids: set[str] = set()
    seen_placements: set[tuple[str, str, str, str | int, str]] = set()
    for asset in assets:
        if not isinstance(asset, dict) or asset.get("status") != "success":
            raise ContentBuildError(["media manifest contains an unsuccessful asset"])
        asset_id = asset.get("id")
        if not isinstance(asset_id, str) or not asset_id or asset_id in seen_ids:
            raise ContentBuildError([f"media manifest has an invalid or duplicate asset id: {asset_id!r}"])
        seen_ids.add(asset_id)
        kind = asset.get("kind")
        if kind not in {"asymptote", "aops-file", "remote-image", "local-image"}:
            raise ContentBuildError([f"media asset {asset_id} has an unsupported kind: {kind!r}"])
        source = asset.get("source")
        replacement = asset.get("replacement")
        if not isinstance(source, dict) or not isinstance(replacement, dict):
            raise ContentBuildError(["media asset requires source and replacement metadata"])
        markdown_path = source.get("markdownPath")
        scope = source.get("markdownScope")
        placement = source.get("placement", "markdown")
        block_index = source.get("markdownBlockIndex")
        container_index = source.get("markdownContainerIndex")
        container_fence_indexes = source.get("markdownFenceIndexes")
        if (
            not isinstance(markdown_path, str)
            or not markdown_path.endswith(".md")
            or markdown_path.startswith("/")
            or "\\" in markdown_path
            or ".." in Path(markdown_path).parts
            or scope not in {"prompt", "solution"}
            or placement not in {"markdown", "requiredMedia"}
            or not isinstance(block_index, int)
            or block_index < 0
        ):
            raise ContentBuildError([f"media asset {asset_id} lacks a safe Markdown scope/placement mapping"])
        if placement == "markdown" and block_index < 1:
            raise ContentBuildError([f"media asset {asset_id} needs a positive markdownBlockIndex"])
        required_media_index = source.get("requiredMediaIndex")
        if placement == "requiredMedia" and (
            scope != "prompt" or block_index != 0 or not isinstance(required_media_index, int) or required_media_index < 1
        ):
            raise ContentBuildError([f"media asset {asset_id} has an invalid requiredMedia placement"])
        if kind in {"aops-file", "remote-image", "local-image"} and not isinstance(
            source.get("markdownReference"), str
        ):
            raise ContentBuildError([f"media asset {asset_id} lacks its original Markdown reference"])
        if kind == "local-image":
            reference = source.get("markdownReference")
            local_source_path = source.get("localSourcePath")
            source_hash = source.get("sourceSha256")
            reference_match = (
                _LOCAL_SOURCE_MEDIA_REFERENCE_RE.fullmatch(reference)
                if isinstance(reference, str)
                else None
            )
            if (
                reference_match is None
                or not isinstance(local_source_path, str)
                or reference_match.group("path") != local_source_path
                or not isinstance(source_hash, str)
            ):
                raise ContentBuildError([f"media asset {asset_id} lacks safe local-image source provenance"])
            # A historical question may only inherit an image from its own
            # form directory. This makes a same-origin relative reference
            # auditable rather than a general cross-tree file access token.
            if local_source_path.split("/", 1)[0] != markdown_path.split("/", 1)[0]:
                raise ContentBuildError([f"media asset {asset_id} local image belongs to a different form directory"])
            local_source_file = (public_root / local_source_path).resolve()
            try:
                local_source_file.relative_to(public_root)
            except ValueError as error:
                raise ContentBuildError([f"media asset {asset_id} local image source escapes the repository"]) from error
            if not local_source_file.is_file() or sha256_bytes(local_source_file.read_bytes()) != source_hash:
                raise ContentBuildError([f"media asset {asset_id} local image source hash mismatch"])
        if kind == "asymptote" and placement == "markdown" and not isinstance(source.get("markdownBlockIndex"), int):
            raise ContentBuildError([f"media asset {asset_id} lacks its Asymptote markdownBlockIndex"])
        if container_index is not None:
            if (
                kind != "asymptote"
                or placement != "markdown"
                or not isinstance(container_index, int)
                or container_index < 1
                or not isinstance(container_fence_indexes, list)
                or any(not isinstance(index, int) or index < 1 for index in container_fence_indexes)
                or len(set(container_fence_indexes)) != len(container_fence_indexes)
            ):
                raise ContentBuildError([f"media asset {asset_id} has an invalid Asymptote container placement"])
            placement_index: str | int = f"container:{container_index}"
        else:
            placement_index = required_media_index if placement == "requiredMedia" else block_index
        placement_key = (markdown_path, scope, kind, placement_index, placement)
        if placement_key in seen_placements:
            raise ContentBuildError([f"media manifest duplicates placement {placement_key}"])
        seen_placements.add(placement_key)
        url = replacement.get("sourceMarkdownUrl")
        local_path = replacement.get("localPath")
        if not isinstance(url, str) or not isinstance(local_path, str):
            raise ContentBuildError(["media asset requires replacement paths"])
        # The browser-facing URL must be a same-origin relative path, and the
        # filesystem path must remain under the checked-in public asset tree.
        # This prevents a malformed manifest from silently re-introducing a
        # remote question dependency or reading a file outside this release.
        if not url.startswith("../historical-media/assets/") or "://" in url or "\\" in url:
            raise ContentBuildError([f"media asset has an unsafe sourceMarkdownUrl: {url}"])
        if not local_path.startswith("historical-media/assets/") or "\\" in local_path:
            raise ContentBuildError([f"media asset has an unsafe localPath: {local_path}"])
        # Do not merely constrain the browser URL to a broad prefix.  It must
        # be the exact relative spelling of the hash-checked local file;
        # otherwise a ``../`` suffix could make the public Markdown request a
        # different same-origin file from the one verified below.
        if url != f"../{local_path}":
            raise ContentBuildError([f"media asset sourceMarkdownUrl must match its localPath: {url}"])
        local_file = (public_root / local_path).resolve()
        try:
            local_file.relative_to((public_root / "historical-media" / "assets").resolve())
        except ValueError as error:
            raise ContentBuildError([f"media asset localPath escapes public assets: {local_path}"]) from error
        if not local_file.is_file():
            raise ContentBuildError([f"mirrored media file is missing: {local_path}"])
        expected_hash = asset.get("outputSha256")
        if not isinstance(expected_hash, str) or sha256_bytes(local_file.read_bytes()) != expected_hash:
            raise ContentBuildError([f"mirrored media hash mismatch: {local_path}"])
        by_scope[(markdown_path, scope)].append(asset)
    for key, entries in by_scope.items():
        by_scope[key] = sorted(
            {item["id"]: item for item in entries}.values(),
            key=lambda item: (
                item.get("kind", ""),
                item.get("source", {}).get("markdownBlockIndex", item.get("source", {}).get("blockIndex", 0)),
                item["id"],
            ),
        )
    return by_scope


def _markdown_link_destination(value: str) -> str:
    """Return a Markdown link's destination before an optional title.

    Parentheses in the URL itself have already been balanced by
    ``_markdown_link_tokens``.  Only top-level whitespace starts a title.
    """

    # Marked/CommonMark permit horizontal whitespace immediately inside the
    # destination parentheses.  Strip it before looking for a title; otherwise
    # a leading space makes this helper return an empty destination and hides a
    # browser-fetched image from the manifest gate.
    value = value.strip()
    depth = 0
    for index, character in enumerate(value):
        if character == "(":
            depth += 1
        elif character == ")" and depth:
            depth -= 1
        elif character.isspace() and depth == 0:
            return value[:index]
    return value


def _markdown_link_label_end(markdown: str, label_start: int) -> int | None:
    """Find the matching end of a Markdown link label.

    A plain ``str.find("]")`` is not safe here: CommonMark labels may contain
    escaped brackets and balanced nested brackets.  The media gate must parse
    those forms because a renderer can still fetch their image destination.
    """

    depth = 1
    cursor = label_start + 1
    while cursor < len(markdown):
        character = markdown[cursor]
        if character == "\\" and cursor + 1 < len(markdown):
            cursor += 2
            continue
        if character == "[":
            depth += 1
        elif character == "]":
            depth -= 1
            if depth == 0:
                return cursor
        cursor += 1
    return None


def _has_markdown_reference_definition(markdown: str) -> bool:
    """Detect any reference definition without confusing ordinary prose.

    Reference labels may span lines and use escaped or nested brackets, and a
    definition may sit in quote/list containers.  Use the same balanced-label
    scanner as image links after removing only the container prefix.  This
    distinguishes a real ``[label]:`` definition from source prose such as
    ``the interval [0, pi]:`` while keeping shortcut images fail-closed.
    """

    for container in _MARKDOWN_CONTAINER_PREFIX_RE.finditer(markdown):
        label_start = container.end()
        if label_start >= len(markdown) or markdown[label_start] != "[":
            continue
        label_end = _markdown_link_label_end(markdown, label_start)
        if label_end is not None and label_end + 1 < len(markdown) and markdown[label_end + 1] == ":":
            return True
    return False


def _markdown_link_tokens(markdown: str) -> list[tuple[int, int, str]]:
    """Return ``(start, end, destination)`` for simple balanced Markdown links.

    This deliberately small scanner is more predictable than a general
    Markdown parser for the trusted archive source. It supports ordinary and
    image links, escaped/balanced labels, and balanced parentheses in file
    names. It does not interpret HTML or reference-style links; image forms
    of those are independently rejected by the emitted-media safety gate.
    """

    tokens: list[tuple[int, int, str]] = []
    index = 0
    while index < len(markdown):
        token_start = index
        label_start = index
        if markdown[index] == "!" and index + 1 < len(markdown) and markdown[index + 1] == "[":
            label_start = index + 1
        elif markdown[index] != "[":
            index += 1
            continue
        label_end = _markdown_link_label_end(markdown, label_start)
        if label_end is None or label_end + 1 >= len(markdown) or markdown[label_end + 1] != "(":
            index = label_start + 1
            continue
        cursor = label_end + 2
        nested_parentheses = 0
        closing: int | None = None
        while cursor < len(markdown):
            character = markdown[cursor]
            if character == "\\" and cursor + 1 < len(markdown):
                cursor += 2
                continue
            if character == "(":
                nested_parentheses += 1
            elif character == ")":
                if nested_parentheses == 0:
                    closing = cursor
                    break
                nested_parentheses -= 1
            cursor += 1
        if closing is None:
            index = label_end + 1
            continue
        destination = _markdown_link_destination(markdown[label_end + 2 : closing])
        if destination:
            tokens.append((token_start, closing + 1, destination))
        index = closing + 1
    return tokens


def _markdown_image_tokens(markdown: str) -> list[tuple[int, int, str]]:
    """Return balanced Markdown image tokens without trusting prior ``[`` text.

    The generic link scanner intentionally also recognizes ordinary links.
    That is useful for legacy AoPS visual syntax, but a damaged TeX interval
    such as ``$[0,1$`` can otherwise begin a bogus ordinary link which reaches
    forward to a subsequent ``![diagram](...)``.  The resulting token starts
    at ``[`` rather than ``!``, so a caller that is specifically enforcing the
    image-media contract could accidentally skip the browser-fetched image.

    Scan image openers independently.  We deliberately preserve the same
    balanced-parenthesis and destination rules as ``_markdown_link_tokens``;
    the two scanners differ only in their starting grammar.
    """

    tokens: list[tuple[int, int, str]] = []
    index = 0
    while index < len(markdown):
        image_start = markdown.find("![", index)
        if image_start < 0:
            break
        label_end = _markdown_link_label_end(markdown, image_start + 1)
        if label_end is None or label_end + 1 >= len(markdown) or markdown[label_end + 1] != "(":
            index = image_start + 2
            continue
        cursor = label_end + 2
        nested_parentheses = 0
        closing: int | None = None
        while cursor < len(markdown):
            character = markdown[cursor]
            if character == "\\" and cursor + 1 < len(markdown):
                cursor += 2
                continue
            if character == "(":
                nested_parentheses += 1
            elif character == ")":
                if nested_parentheses == 0:
                    closing = cursor
                    break
                nested_parentheses -= 1
            cursor += 1
        if closing is None:
            index = label_end + 1
            continue
        destination = _markdown_link_destination(markdown[label_end + 2 : closing])
        if destination:
            tokens.append((image_start, closing + 1, destination))
        index = closing + 1
    return tokens


def _aops_visual_link_tokens(markdown: str) -> list[tuple[int, int, str]]:
    return [token for token in _markdown_link_tokens(markdown) if _AOPS_VISUAL_URL_RE.fullmatch(token[2])]


def _local_source_visual_link_tokens(markdown: str) -> list[tuple[int, int, str]]:
    """Return archive source-local *image* links that require mirroring.

    A normal Markdown citation may legally point to a sibling source document.
    Only the explicit image syntax is a browser-fetched visual and therefore
    belongs to the immutable media manifest.
    """

    return [
        token
        for token in _markdown_image_tokens(markdown)
        if _LOCAL_SOURCE_MEDIA_REFERENCE_RE.fullmatch(token[2])
    ]


def _replace_media(
    markdown: str,
    assets: list[dict[str, Any]],
    *,
    source_path: str,
    scope: str = "prompt",
) -> tuple[str, list[str]]:
    """Swap one emitted Markdown scope's visuals for local image Markdown."""

    markdown = normalize_markdown(markdown)
    placed_assets = [asset for asset in assets if asset.get("source", {}).get("placement", "markdown") == "markdown"]
    container_assets = sorted(
        (
            asset
            for asset in placed_assets
            if asset.get("kind") == "asymptote"
            and asset.get("source", {}).get("markdownContainerIndex") is not None
        ),
        key=lambda item: item.get("source", {}).get("markdownContainerIndex", 0),
    )
    fence_assets = sorted(
        (
            asset
            for asset in placed_assets
            if asset.get("kind") == "asymptote"
            and asset.get("source", {}).get("markdownContainerIndex") is None
        ),
        key=lambda item: item.get("source", {}).get("markdownBlockIndex", item.get("source", {}).get("blockIndex", 0)),
    )
    remote = sorted(
        (asset for asset in placed_assets if asset.get("kind") in {"aops-file", "remote-image"}),
        key=lambda item: item.get("source", {}).get("markdownBlockIndex", item["id"]),
    )
    local_images = sorted(
        (asset for asset in placed_assets if asset.get("kind") == "local-image"),
        key=lambda item: item.get("source", {}).get("markdownBlockIndex", item["id"]),
    )
    used: list[str] = []

    def image_markdown(asset: dict[str, Any]) -> str:
        return f"![Archived diagram]({asset['replacement']['sourceMarkdownUrl']})\n"

    # Work from the original source spans. A container may surround several
    # fences, or may itself occur inside one fence. Replacing its whole span
    # exactly once avoids rendering a complete diagram repeatedly for every
    # fragment while also removing any converter comments between fragments.
    all_containers = list(_ASY_CONTAINER_BLOCK_RE.finditer(markdown))
    all_fences = list(_ASY_MEDIA_RE.finditer(markdown))
    containers_by_index: dict[int, dict[str, Any]] = {}
    for asset in container_assets:
        index = asset.get("source", {}).get("markdownContainerIndex")
        if not isinstance(index, int) or index in containers_by_index:
            raise ContentBuildError([f"{source_path}: invalid duplicate Asymptote {scope} container media placement"])
        containers_by_index[index] = asset
    fences_by_index: dict[int, dict[str, Any]] = {}
    for asset in fence_assets:
        index = asset.get("source", {}).get("markdownBlockIndex")
        if not isinstance(index, int) or index in fences_by_index:
            raise ContentBuildError([f"{source_path}: invalid duplicate Asymptote {scope} fence media placement"])
        fences_by_index[index] = asset

    replacements: list[tuple[int, int, str]] = []
    covered_fence_indexes: set[int] = set()
    for container_index, container in enumerate(all_containers, start=1):
        asset = containers_by_index.get(container_index)
        if asset is None:
            continue
        start, end = container.span()
        # Converter output is not always properly nested: in a few archival
        # files an ``<asy>`` starts before a Markdown fence and closes inside
        # it (or vice versa).  A fence that merely *intersects* the logical
        # container is still part of that one diagram.  Replace the union of
        # their spans, otherwise a closing fence/container tag survives as
        # literal source next to the locally mirrored image.
        intersecting_fences = [
            (fence_index, fence)
            for fence_index, fence in enumerate(all_fences, start=1)
            if fence.start() < end and start < fence.end()
        ]
        actual_fence_indexes = [fence_index for fence_index, _fence in intersecting_fences]
        if intersecting_fences:
            start = min([start, *(fence.start() for _index, fence in intersecting_fences)])
            end = max([end, *(fence.end() for _index, fence in intersecting_fences)])
        recorded_fence_indexes = asset.get("source", {}).get("markdownFenceIndexes")
        if recorded_fence_indexes != actual_fence_indexes:
            raise ContentBuildError(
                [
                    f"{source_path}: Asymptote {scope} container {container_index} "
                    "does not match its fenced media placement provenance"
                ]
            )
        if covered_fence_indexes.intersection(actual_fence_indexes):
            raise ContentBuildError([f"{source_path}: overlapping Asymptote {scope} container media placements"])
        covered_fence_indexes.update(actual_fence_indexes)
        used.append(asset["id"])
        replacements.append((start, end, image_markdown(asset)))

    for fence_index, fence in enumerate(all_fences, start=1):
        if fence_index in covered_fence_indexes:
            continue
        asset = fences_by_index.get(fence_index)
        if asset is None:
            raise ContentBuildError([f"{source_path}: more Asymptote {scope} blocks than mirrored media assets"])
        used.append(asset["id"])
        replacements.append((*fence.span(), image_markdown(asset)))

    if replacements:
        pieces: list[str] = []
        cursor = 0
        for start, end, replacement in sorted(replacements, key=lambda item: item[0]):
            if start < cursor or end < start:
                raise ContentBuildError([f"{source_path}: overlapping Asymptote {scope} media replacements"])
            pieces.extend((markdown[cursor:start], replacement))
            cursor = end
        pieces.append(markdown[cursor:])
        markdown = "".join(pieces)

    remote_links = _aops_visual_link_tokens(markdown)
    if len(remote_links) > len(remote):
        raise ContentBuildError([f"{source_path}: more remote {scope} visuals than mirrored assets"])
    remote_replacements: list[tuple[int, int, str]] = []
    for remote_index, (start, end, url) in enumerate(remote_links):
        asset = remote[remote_index]
        expected_index = remote_index + 1
        recorded_index = asset.get("source", {}).get("markdownBlockIndex")
        reference = asset.get("source", {}).get("markdownReference")
        if recorded_index is not None and recorded_index != expected_index:
            raise ContentBuildError(
                [f"{source_path}: remote {scope} visual {expected_index} does not match media placement {recorded_index}"]
            )
        if isinstance(reference, str) and reference != url:
            raise ContentBuildError([f"{source_path}: remote {scope} visual reference differs from its media manifest"])
        used.append(asset["id"])
        remote_replacements.append(
            (start, end, f"![Archived diagram]({asset['replacement']['sourceMarkdownUrl']})")
        )
    if remote_replacements:
        pieces: list[str] = []
        cursor = 0
        for start, end, replacement in remote_replacements:
            pieces.extend((markdown[cursor:start], replacement))
            cursor = end
        pieces.append(markdown[cursor:])
        markdown = "".join(pieces)

    local_links = _local_source_visual_link_tokens(markdown)
    if len(local_links) > len(local_images):
        raise ContentBuildError([f"{source_path}: more source-local {scope} visuals than mirrored assets"])
    local_replacements: list[tuple[int, int, str]] = []
    for local_index, (start, end, reference) in enumerate(local_links):
        asset = local_images[local_index]
        expected_index = local_index + 1
        recorded_index = asset.get("source", {}).get("markdownBlockIndex")
        recorded_reference = asset.get("source", {}).get("markdownReference")
        if recorded_index is not None and recorded_index != expected_index:
            raise ContentBuildError(
                [
                    f"{source_path}: source-local {scope} visual {expected_index} "
                    f"does not match media placement {recorded_index}"
                ]
            )
        if recorded_reference != reference:
            raise ContentBuildError(
                [f"{source_path}: source-local {scope} visual reference differs from its media manifest"]
            )
        used.append(asset["id"])
        local_replacements.append(
            (start, end, f"![Archived diagram]({asset['replacement']['sourceMarkdownUrl']})")
        )
    if local_replacements:
        pieces = []
        cursor = 0
        for start, end, replacement in local_replacements:
            pieces.extend((markdown[cursor:start], replacement))
            cursor = end
        pieces.append(markdown[cursor:])
        markdown = "".join(pieces)
    if (
        _ASY_OPEN_FENCE_RE.search(markdown)
        or _ASY_CONTAINER_TAG_RE.search(markdown)
        or _aops_visual_link_tokens(markdown)
        or _local_source_visual_link_tokens(markdown)
    ):
        raise ContentBuildError([f"{source_path}: unresolved {scope} media remains after replacement"])
    return normalize_markdown(markdown), used


def _assert_timed_prompt_is_safe(prompt: str, *, source_path: str) -> None:
    """Fail closed if conversion debris would disclose an answer pre-final.

    Historical Markdown mixes H2, H3, and raw MediaWiki-style headings. The
    parser/overrides reconstruct known cases, but this final emitted-prompt
    gate prevents a newly discovered conversion variant from publishing a
    written solution or alternate testpaper answer to a timed attempt.
    """

    for label, pattern in _PROMPT_DISCLOSURE_PATTERNS:
        if pattern.search(prompt):
            raise ContentBuildError([f"{source_path}: timed prompt contains {label}"])


def _assert_timed_math_is_well_formed(markdown: str, *, source_path: str, scope: str) -> None:
    """Reject unmatched TeX dollar delimiters before publishing timed text.

    MathJax treats an unmatched ``$`` as the beginning of a math span and can
    then consume the rest of a question or answer choice. Historical imports
    have several such damaged fragments, so this small structural gate makes
    every repair explicit instead of relying on browser recovery. Escaped
    currency (``\\$``) is intentionally ignored.
    """

    open_delimiter: tuple[str, int] | None = None
    index = 0
    while index < len(markdown):
        if markdown[index] != "$":
            index += 1
            continue
        slash_count = 0
        previous = index - 1
        while previous >= 0 and markdown[previous] == "\\":
            slash_count += 1
            previous -= 1
        if slash_count % 2:
            index += 1
            continue
        delimiter = "$$" if markdown.startswith("$$", index) else "$"
        if open_delimiter is None:
            open_delimiter = (delimiter, index)
        elif open_delimiter[0] != delimiter:
            raise ContentBuildError(
                [
                    f"{source_path}: timed {scope} mixes {open_delimiter[0]} and {delimiter} "
                    f"math delimiters near character {index}"
                ]
            )
        else:
            open_delimiter = None
        index += len(delimiter)
    if open_delimiter is not None:
        raise ContentBuildError(
            [
                f"{source_path}: timed {scope} has an unclosed {open_delimiter[0]} "
                f"math delimiter near character {open_delimiter[1]}"
            ]
        )


def _assert_emitted_media_is_safe(markdown: str, *, source_path: str, scope: str) -> None:
    """Reject source-diagram remnants and remote images after replacement.

    Prompt media matters for a fair timed question, but solutions need the
    same gate: a post-final explanation with a dead remote diagram or literal
    Asymptote source is still an unreadable solution.  Ordinary citation links
    are allowed; only image/known visual syntax is prohibited here.
    """

    if _aops_visual_link_tokens(markdown):
        raise ContentBuildError([f"{source_path}: emitted {scope} contains an AoPS visual link"])
    if _LOCAL_SOURCE_MARKDOWN_IMAGE_RE.search(markdown):
        raise ContentBuildError([f"{source_path}: emitted {scope} contains a direct source-local image"])
    remaining = (
        ("an Asymptote fence", _ASY_OPEN_FENCE_RE),
        ("an Asymptote container", _ASY_CONTAINER_TAG_RE),
        ("a remote Markdown image", _REMOTE_MARKDOWN_IMAGE_RE),
        ("a remote HTML image", _REMOTE_HTML_IMAGE_RE),
    )
    for label, pattern in remaining:
        if pattern.search(markdown):
            raise ContentBuildError([f"{source_path}: emitted {scope} contains {label}"])


def _assert_emitted_images_are_manifest_bound(
    markdown: str,
    assets: list[dict[str, Any]],
    *,
    source_path: str,
    scope: str,
) -> None:
    """Require every browser-fetched Markdown image to be a scoped asset.

    The source-local-image regression showed that merely rejecting remote
    URLs is insufficient: a relative URL can still bypass the immutable
    media manifest. The replacement path therefore has a positive contract,
    not just a block list. Any image in emitted prompt/solution Markdown must
    equal a replacement URL declared for that exact source scope.
    """

    if _RAW_HTML_IMAGE_TAG_RE.search(markdown):
        raise ContentBuildError(
            [f"{source_path}: emitted {scope} contains a raw HTML image outside the media manifest contract"]
        )
    if (
        _REFERENCE_STYLE_MARKDOWN_IMAGE_RE.search(markdown)
        or _has_markdown_reference_definition(markdown)
    ):
        raise ContentBuildError(
            [
                f"{source_path}: emitted {scope} contains a reference-style image "
                "outside the media manifest contract"
            ]
        )

    allowed_urls = {
        replacement.get("sourceMarkdownUrl")
        for asset in assets
        if isinstance(asset, dict)
        and isinstance((replacement := asset.get("replacement")), dict)
        and isinstance(replacement.get("sourceMarkdownUrl"), str)
    }
    for _start, _end, destination in _markdown_image_tokens(markdown):
        if destination not in allowed_urls:
            raise ContentBuildError(
                [f"{source_path}: emitted {scope} image is not bound to a scoped media manifest asset"]
            )


def _append_required_media(prompt: str, override: dict[str, Any], assets: list[dict[str, Any]], *, source_path: str) -> tuple[str, list[str]]:
    required = override.get("requiredMedia", [])
    if not required:
        return prompt, []
    if not isinstance(required, list):
        raise ContentBuildError([f"override {source_path} requiredMedia must be a list"])
    existing_urls = set(re.findall(r"!\[[^\]]*\]\(([^)\s]+)", prompt))
    additions: list[str] = []
    used: list[str] = []
    required_assets = {
        asset.get("source", {}).get("requiredMediaIndex"): asset
        for asset in assets
        if asset.get("source", {}).get("placement") == "requiredMedia"
    }
    if len(required_assets) != len([asset for asset in assets if asset.get("source", {}).get("placement") == "requiredMedia"]):
        raise ContentBuildError([f"override {source_path} has duplicate or missing requiredMedia asset indexes"])
    markdown_assets_by_reference: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for asset in assets:
        source = asset.get("source", {})
        reference = source.get("markdownReference")
        if source.get("placement", "markdown") == "markdown" and isinstance(reference, str):
            markdown_assets_by_reference[reference].append(asset)
    for index, _item in enumerate(required, start=1):
        if not isinstance(_item, dict):
            raise ContentBuildError([f"override {source_path} requiredMedia entry {index} must be an object"])
        asset = required_assets.get(index)
        required_source_url = _item.get("sourceUrl")
        already_placed = (
            isinstance(required_source_url, str)
            and any(
                candidate.get("replacement", {}).get("sourceMarkdownUrl") in existing_urls
                for candidate in markdown_assets_by_reference.get(required_source_url, [])
            )
        )
        if already_placed:
            # Some historical repairs add ``requiredMedia`` defensively even
            # though the source Markdown already contains the same visual.
            # It has already been replaced in situ; appending it would show a
            # duplicate diagram.  Retain any duplicate manifest placement in
            # provenance as fulfilled without rendering it a second time.
            if asset is not None:
                used.append(asset["id"])
            continue
        if asset is None:
            raise ContentBuildError([f"override {source_path} requires media that was not mirrored"])
        url = asset["replacement"]["sourceMarkdownUrl"]
        if url in existing_urls:
            raise ContentBuildError([f"override {source_path} required media was unexpectedly placed in Markdown"])
        additions.append(f"![Archived diagram]({url})")
        used.append(asset["id"])
    if additions:
        prompt = normalize_markdown(f"{prompt}\n\n" + "\n\n".join(additions))
    return prompt, used


def _apply_scoped_replacements(
    markdown: str,
    replacements: Any,
    *,
    source_path: str,
    scope: str,
) -> str:
    """Apply only audited, uniquely-targeted display repairs.

    Some source prompts contain a diagram fence. Replacing the whole prompt to
    fix one broken legacy TeX fragment would make the media discovery input
    diverge from the student-facing artifact, potentially dropping the
    diagram. These small replacements run *after* local-media substitution
    and must each match exactly once, so they cannot silently affect a later
    sentence or a different visual.
    """

    if replacements is None:
        return markdown
    if not isinstance(replacements, list):
        raise ContentBuildError([f"{source_path}: {scope} replacements are not a list"])
    for index, replacement in enumerate(replacements, start=1):
        if not isinstance(replacement, dict):
            raise ContentBuildError([f"{source_path}: invalid {scope} replacement {index}"])
        original = replacement.get("from")
        replacement_text = replacement.get("to")
        if (
            not isinstance(original, str)
            or not original
            or not isinstance(replacement_text, str)
            or not replacement_text
            or original == replacement_text
        ):
            raise ContentBuildError([f"{source_path}: invalid {scope} replacement {index}"])
        matches = markdown.count(original)
        if matches != 1:
            raise ContentBuildError(
                [f"{source_path}: {scope} replacement {index} expected one source fragment, found {matches}"]
            )
        markdown = markdown.replace(original, replacement_text, 1)
    return normalize_markdown(markdown)


def _archive_public_projection(private_manifest: dict[str, Any]) -> dict[str, Any]:
    return validator_archive_public_projection(private_manifest)


def _form_id(year: int, variant: str) -> str:
    return f"amc12-{year}-{variant.lower()}"


def _archive_scoring_policy(year: int, scored_question_count: int) -> dict[str, Any]:
    """Return the contest-era policy for a historical AMC 12 form.

    AMC 12 papers from 2002 through 2006 award 2.5 points for a blank
    response.  Starting in 2007, a blank earns 1.5 points.  Correct answers
    remain six points and an incorrect answer earns zero in both eras.
    ``scored_question_count`` can be below 25 only for a documented archive
    exception, such as 2025A #25, which is intentionally excluded from the
    practice score.
    """

    if year < 2002 or year > 2025:
        raise ContentBuildError([f"unsupported AMC 12 archive scoring year: {year}"])
    if scored_question_count not in range(0, 26):
        raise ContentBuildError([f"invalid archive scored-question count: {scored_question_count}"])
    early = year <= 2006
    version = _EARLY_SCORING_POLICY_VERSION if early else _LATE_SCORING_POLICY_VERSION
    blank = 2.5 if early else 1.5
    return {
        "version": version,
        "correct": 6,
        "blank": blank,
        "incorrect": 0,
        "questionCount": 25,
        "scoredQuestionCount": scored_question_count,
        "maxScore": scored_question_count * 6,
    }


def _archive_notice(year: int) -> str:
    blank = "2.5" if year <= 2006 else "1.5"
    return f"{ARCHIVE_NOTICE} This {year} form uses its contest-era scoring: 6 points correct, {blank} points blank, 0 incorrect."


def _last_boxed_solution_option(solution: str) -> str | None:
    """Return the option explicitly framed at the end of a first solution.

    This is a cross-check, not an alternative scoring authority: historical
    community solutions can omit an option letter or contain intermediate
    framed values.  When an explicit final framed option is present, however,
    disagreeing with the checked-in answer catalog is an actionable source
    mismatch and must block a release rather than silently teaching/marking
    two different answers.
    """

    candidates: list[str] = []
    for boxed in _BOXED_CONTENT_RE.finditer(solution):
        content = boxed.group("content")
        option = _PARENTHESIZED_OPTION_RE.search(content) or _BARE_OPTION_RE.search(content)
        if option:
            candidates.append(option.group(1).upper())
    return candidates[-1] if candidates else None


def build_archive_release(inputs: ArchiveInputs) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    """Build all 48 private/public archive artifacts and an auditable report."""

    source_root = inputs.source_root.resolve()
    catalog = _load_object(inputs.answer_keys_path, "historical answer-key catalog")
    keys = _validate_key_catalog(catalog)
    overrides = _validate_overrides(_load_object(inputs.overrides_path, "historical overrides"))
    media_document = _load_object(inputs.media_manifest_path, "historical media manifest")
    media_by_scope = _validate_media(media_document, media_path=inputs.media_manifest_path)
    catalog_hash = canonical_hash(catalog)
    media_hash = sha256_bytes(inputs.media_manifest_path.read_bytes())

    public_manifests: list[dict[str, Any]] = []
    private_manifests: list[dict[str, Any]] = []
    report_forms: list[dict[str, Any]] = []
    used_overrides: set[str] = set()

    for year, variant, directory in _form_directories(source_root):
        form_id = _form_id(year, variant)
        key_record = keys.get(form_id)
        if key_record is None:
            raise ContentBuildError([f"historical answer-key catalog is missing {form_id}"])
        questions: list[dict[str, Any]] = []
        used_assets: list[str] = []
        repaired_questions: list[int] = []
        solution_cross_check = {"explicitBoxedMatches": 0, "noExplicitBoxedOption": 0, "unscoredExplicitBoxedOption": 0}
        # This private release report retains the result of reading the first
        # available solution. It is deliberately audit data, not a second
        # scoring source: only a clearly framed final option is extracted,
        # then it must agree with the curated historical answer-key catalog.
        first_solution_answer_audit: list[dict[str, Any]] = []
        for number in range(1, 26):
            source_file = directory / f"Problem_{number:02d}.md"
            if not source_file.is_file():
                raise ContentBuildError([f"missing source problem: {source_file}"])
            source_path = _safe_relative(source_root, source_file)
            parsed = parse_problem_markdown(
                source_file,
                number=number,
                source_path=source_path,
                source_root=source_root,
            )
            override = overrides.get(source_path, {})
            if override:
                used_overrides.add(source_path)
                repaired_questions.append(number)
                if "correctOption" in override and override["correctOption"] != key_record["answers"][number - 1]:
                    raise ContentBuildError([f"override/key mismatch: {source_path}"])
            elif parsed.errors:
                unexpected = [issue for issue in parsed.errors if issue.code not in {"unrendered-asymptote", "remote-media-unpinned"}]
                if unexpected:
                    rendered = "; ".join(f"{issue.code}: {issue.message}" for issue in unexpected)
                    raise ContentBuildError([f"{source_path}: unresolved parser errors: {rendered}"])

            prompt = normalize_markdown(override.get("promptMarkdown", parsed.prompt_markdown))
            choices = _expect_choices(override.get("choices", parsed.choices), f"{source_path} choices")
            solution = normalize_markdown(override.get("solutionMarkdown", parsed.solution_markdown))
            if not prompt.strip() or not solution.strip():
                raise ContentBuildError([f"{source_path}: repaired archive question requires non-empty prompt and solution"])
            prompt_assets = media_by_scope.get((source_path, "prompt"), [])
            solution_assets = media_by_scope.get((source_path, "solution"), [])
            prompt, automatic_assets = _replace_media(prompt, prompt_assets, source_path=source_path, scope="prompt")
            prompt, required_assets = _append_required_media(prompt, override, prompt_assets, source_path=source_path)
            solution, solution_automatic_assets = _replace_media(
                solution,
                solution_assets,
                source_path=source_path,
                scope="solution",
            )
            prompt = _apply_scoped_replacements(
                prompt,
                override.get("promptReplacements"),
                source_path=source_path,
                scope="prompt",
            )
            solution = _apply_scoped_replacements(
                solution,
                override.get("solutionReplacements"),
                source_path=source_path,
                scope="solution",
            )
            _assert_emitted_media_is_safe(prompt, source_path=source_path, scope="prompt")
            _assert_emitted_media_is_safe(solution, source_path=source_path, scope="solution")
            _assert_emitted_images_are_manifest_bound(
                prompt,
                prompt_assets,
                source_path=source_path,
                scope="prompt",
            )
            _assert_emitted_images_are_manifest_bound(
                solution,
                solution_assets,
                source_path=source_path,
                scope="solution",
            )
            _assert_timed_prompt_is_safe(prompt, source_path=source_path)
            _assert_timed_math_is_well_formed(prompt, source_path=source_path, scope="prompt")
            for option, choice in choices.items():
                _assert_timed_math_is_well_formed(choice, source_path=source_path, scope=f"choice {option}")
            used_here = automatic_assets + required_assets + solution_automatic_assets
            used_assets.extend(used_here)
            unresolved_assets = (
                {asset["id"] for asset in prompt_assets + solution_assets} - set(used_here)
            )
            if unresolved_assets:
                raise ContentBuildError(
                    [f"{source_path}: mirrored media was not placed in its emitted prompt or solution: {', '.join(sorted(unresolved_assets))}"]
                )

            correct_option = key_record["answers"][number - 1]
            is_scored = correct_option is not None
            accepted_options = key_record["acceptedOptions"].get(number, [correct_option] if is_scored else [])
            boxed_option = _last_boxed_solution_option(solution)
            if boxed_option is None:
                solution_cross_check["noExplicitBoxedOption"] += 1
                answer_audit_status = "no-explicit-framed-option"
            elif not is_scored:
                solution_cross_check["unscoredExplicitBoxedOption"] += 1
                answer_audit_status = "unscored-question"
            elif boxed_option not in accepted_options:
                raise ContentBuildError(
                    [
                        f"{source_path}: first solution's final boxed option {boxed_option} "
                        f"does not match the historical answer catalog ({'/'.join(accepted_options)})"
                    ]
                )
            else:
                solution_cross_check["explicitBoxedMatches"] += 1
                answer_audit_status = "matches-answer-catalog"
            first_solution_answer_audit.append(
                {
                    "questionNumber": number,
                    "sourcePath": source_path,
                    "extractedFinalOption": boxed_option,
                    "catalogAcceptedOptions": accepted_options,
                    "status": answer_audit_status,
                }
            )
            if not is_scored:
                solution = normalize_markdown(UNSCORED_NOTICE + solution)
            question: dict[str, Any] = {
                "number": number,
                "sourceRef": {"path": source_path, "sha256": parsed.source_sha256},
                "promptMarkdown": prompt,
                "choices": choices,
                "correctOption": correct_option,
                "acceptedOptions": accepted_options,
                "isScored": is_scored,
                "solutionMarkdown": solution,
            }
            questions.append(question)

        bundle = {
            "questions": [
                {
                    "number": question["number"],
                    "sourceRef": question["sourceRef"],
                    "promptMarkdown": question["promptMarkdown"],
                    "choices": question["choices"],
                    "isScored": question["isScored"],
                }
                for question in questions
            ]
        }
        scored_count = sum(question["isScored"] for question in questions)
        scoring_policy = _archive_scoring_policy(year, scored_count)
        private_manifest: dict[str, Any] = {
            "schemaVersion": ARCHIVE_MANIFEST_SCHEMA,
            "id": form_id,
            "version": inputs.release_version,
            "title": f"{year} AMC 12{variant} — Archive practice",
            "publicationStatus": "archive-practice",
            "isSynthetic": False,
            "durationSeconds": 4_500,
            "scoringPolicyVersion": scoring_policy["version"],
            "scoringPolicy": scoring_policy,
            "questionBundleHash": canonical_hash(bundle),
            "archiveNotice": _archive_notice(year),
            "questions": questions,
            "provenance": {
                "releaseAuthorization": {
                    "status": "authorized-archive-practice",
                    "authorizedBy": "workspace-owner",
                    "authorizedAt": "2026-07-27",
                    "evidence": "Platform owner requested publication of all historical AMC 12 papers for online practice.",
                },
                "answerKey": {
                    "catalogSchemaVersion": catalog["schemaVersion"],
                    "catalogHash": catalog_hash,
                    "sourceUrl": key_record["sourceUrl"],
                    "canonicalAnswerKeyUrl": key_record["canonicalAnswerKeyUrl"],
                    "retrievedAt": key_record.get("retrievedAt"),
                    "notApprovedForScoring": bool(catalog.get("notApprovedForScoring")),
                },
                "media": {
                    "manifestSchemaVersion": media_document["schemaVersion"],
                    "manifestSha256": media_hash,
                    "assetIds": sorted(set(used_assets)),
                },
                "sourceRepairs": [
                    {
                        "path": path,
                        "repairReason": overrides[path].get("repairReason"),
                        "evidence": overrides[path].get("evidence", []),
                    }
                    for path in sorted(used_overrides)
                    if path.startswith(f"{directory.name}/")
                ],
            },
        }
        public_manifest = _archive_public_projection(private_manifest)
        private_manifest["contentHash"] = public_manifest["contentHash"]
        private_manifest["manifestHash"] = canonical_hash(private_manifest)
        validation_errors = validate_archive_public_manifest(public_manifest) + validate_archive_private_manifest(private_manifest)
        if validation_errors:
            raise ContentBuildError([f"{form_id}: archive artifact validation failed: {error}" for error in validation_errors])
        private_manifests.append(private_manifest)
        public_manifests.append(public_manifest)
        report_forms.append(
            {
                "id": form_id,
                "year": year,
                "variant": variant,
                "questionCount": 25,
                "scoredQuestionCount": scored_count,
                "repairedQuestionNumbers": repaired_questions,
                "mediaAssetIds": sorted(set(used_assets)),
                "firstSolutionCrossCheck": solution_cross_check,
                "firstSolutionAnswerAudit": first_solution_answer_audit,
                "contentHash": public_manifest["contentHash"],
                "manifestHash": private_manifest["manifestHash"],
            }
        )

    unexpected_overrides = sorted(set(overrides) - used_overrides)
    if unexpected_overrides:
        raise ContentBuildError([f"overrides do not map to archive source files: {', '.join(unexpected_overrides)}"])
    report = {
        "schemaVersion": "amc-practice-archive-release-report-v1",
        "releaseVersion": inputs.release_version,
        "summary": {
            "formCount": len(private_manifests),
            "questionCount": len(private_manifests) * 25,
            "scoredQuestionCount": sum(item["scoredQuestionCount"] for item in report_forms),
            "unscoredQuestionCount": len(private_manifests) * 25 - sum(item["scoredQuestionCount"] for item in report_forms),
            "repairedQuestionCount": sum(len(item["repairedQuestionNumbers"]) for item in report_forms),
            "firstSolutionExplicitBoxedMatchCount": sum(item["firstSolutionCrossCheck"]["explicitBoxedMatches"] for item in report_forms),
            "firstSolutionWithoutExplicitBoxedOptionCount": sum(item["firstSolutionCrossCheck"]["noExplicitBoxedOption"] for item in report_forms),
        },
        "answerKeyCatalogHash": catalog_hash,
        "mediaManifestSha256": media_hash,
        "forms": report_forms,
    }
    return public_manifests, private_manifests, report


def write_archive_release(path: Path, value: dict[str, Any]) -> None:
    """Write a release artifact atomically so import never sees partial JSON."""

    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(canonical_json(value))
        temporary = Path(handle.name)
    temporary.replace(path)


def archive_release_json(manifests: list[dict[str, Any]]) -> dict[str, Any]:
    """A compact, deterministic batch-import payload containing private forms."""

    return {"schemaVersion": "amc-practice-archive-release-batch-v1", "forms": manifests}
