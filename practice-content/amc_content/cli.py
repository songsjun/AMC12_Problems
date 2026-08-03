"""Command-line entry point for source reviews and manifest builds."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import stat
import sys
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from .builder import (
    ContentBuildError,
    build_artifacts,
    load_source_form,
    parse_source_form,
    review_data,
    review_markdown,
)
from .archive import ArchiveInputs, archive_release_json, build_archive_release, write_archive_release
from .canonical import canonical_json
from .approval import (
    approved_question_context_set_markdown,
    compile_approved_question_context_set,
    load_strict_json,
)
from .question_context import (
    archive_question_context_set_markdown,
    build_archive_question_context_set,
    build_question_context,
    build_question_context_set,
    question_context_markdown,
    question_context_set_markdown,
)
from .supplement import (
    compose_supplemented_archive_candidate_set,
    supplemented_archive_candidate_set_markdown,
)
from .validator import (
    ARCHIVE_PRIVATE_MANIFEST_SCHEMA,
    validate_archive_private_manifest,
    validate_archive_public_manifest,
    validate_import_policy,
    validate_private_manifest,
    validate_public_manifest,
)


_AMC_REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
_PRIVATE_CONTEXT_LOCK_NAME = ".amc-question-context.lock"


def _write_text_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(content)
        temporary_path = Path(handle.name)
    temporary_path.replace(path)


def _write_json_atomic(path: Path, value: dict[str, Any]) -> None:
    _write_text_atomic(path, canonical_json(value))


def _review(args: argparse.Namespace) -> int:
    form = load_source_form(args.form, source_root=args.source_root)
    parsed = parse_source_form(form)
    review = review_data(form, parsed)
    _write_json_atomic(args.json_output, review)
    _write_text_atomic(args.markdown_output, review_markdown(review))
    summary = review["summary"]
    print(
        f"reviewed {summary['questionCount']} question(s): "
        f"{summary['errors']} error(s), {summary['warnings']} warning(s); "
        f"report: {args.markdown_output}"
    )
    return 0 if summary["publishable"] else 2


def _build(args: argparse.Namespace) -> int:
    if args.public_output.resolve() == args.private_output.resolve():
        raise ContentBuildError(["public and private output paths must be different"])
    form = load_source_form(args.form, source_root=args.source_root)
    public_manifest, private_manifest, review = build_artifacts(
        form,
        answer_key_path=args.answer_key,
        allow_test_only=args.allow_test_only,
    )
    _write_json_atomic(args.public_output, public_manifest)
    _write_json_atomic(args.private_output, private_manifest)
    if args.review_json_output:
        _write_json_atomic(args.review_json_output, review)
    if args.review_markdown_output:
        _write_text_atomic(args.review_markdown_output, review_markdown(review))
    print(
        f"built {private_manifest['id']} with public contentHash {public_manifest['contentHash']} "
        f"and private manifestHash {private_manifest['manifestHash']}"
    )
    return 0


def _validate(args: argparse.Namespace) -> int:
    try:
        manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"cannot read manifest: {error}", file=sys.stderr)
        return 2
    if not isinstance(manifest, dict):
        print("manifest must be a JSON object", file=sys.stderr)
        return 2
    archive_manifest = manifest.get("schemaVersion") == ARCHIVE_PRIVATE_MANIFEST_SCHEMA or manifest.get("publicationStatus") == "archive-practice"
    errors = (
        validate_archive_private_manifest(manifest) if args.private and archive_manifest
        else validate_archive_public_manifest(manifest) if archive_manifest
        else validate_private_manifest(manifest) if args.private
        else validate_public_manifest(manifest)
    )
    if args.private and not archive_manifest:
        errors.extend(validate_import_policy(manifest, allow_test_only=args.allow_test_only))
    if errors:
        print("manifest validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 2
    print("manifest validation passed")
    return 0


def _build_archive(args: argparse.Namespace) -> int:
    public_manifests, private_manifests, report = build_archive_release(
        ArchiveInputs(
            source_root=args.source_root,
            answer_keys_path=args.answer_keys,
            overrides_path=args.overrides,
            media_manifest_path=args.media_manifest,
            release_version=args.release_version,
        )
    )
    for manifest in public_manifests:
        write_archive_release(args.public_output_dir / f"{manifest['id']}.public.json", manifest)
    for manifest in private_manifests:
        write_archive_release(args.private_output_dir / f"{manifest['id']}.private.json", manifest)
    write_archive_release(args.private_batch_output, archive_release_json(private_manifests))
    write_archive_release(args.report_output, report)
    summary = report["summary"]
    print(
        f"built archive release {args.release_version}: {summary['formCount']} form(s), "
        f"{summary['scoredQuestionCount']} scored question(s), {summary['unscoredQuestionCount']} unscored question(s)"
    )
    return 0


def _build_question_context(args: argparse.Namespace) -> int:
    source_root = args.source_root.resolve()
    protected_inputs: set[Path] = set()
    if args.source_file:
        source_file = args.source_file.resolve()
        if not source_file.is_file():
            raise ContentBuildError([f"source file is missing: {source_file}"])
        protected_inputs.add(source_file)
        try:
            source_path = source_file.relative_to(source_root).as_posix()
        except ValueError as error:
            raise ContentBuildError([f"source path escapes source root: {source_file}"]) from error
        build = lambda: build_question_context(
            source_file,
            number=args.question_number,
            source_path=source_path,
            source_root=source_root,
        )
        label = f"question {args.question_number}"
        render = question_context_markdown
    elif args.form:
        form = load_source_form(args.form, source_root=source_root)
        protected_inputs.add(form.path)
        protected_inputs.update((source_root / entry["path"]).resolve() for entry in form.data["sourceFiles"])
        build = lambda: build_question_context_set(form)
        label = f"form {form.data['id']}"
        render = question_context_set_markdown
    else:
        archive_release = args.archive_private_release.resolve()
        protected_inputs.add(archive_release)
        build = lambda: build_archive_question_context_set(archive_release, source_root=source_root)
        label = "historical archive release"
        render = archive_question_context_set_markdown
    private_root = _validate_private_context_root(args.private_output_root, source_root=source_root)
    with _private_context_lock(private_root):
        json_output, markdown_output = _resolve_private_context_outputs(
            private_output_root=args.private_output_root,
            json_output=args.json_output,
            markdown_output=args.markdown_output,
            source_root=source_root,
            protected_inputs=protected_inputs,
            replace=args.replace,
        )
        context = build()
        _write_context_output_pair_atomic(
            json_output,
            canonical_json(context),
            markdown_output,
            render(context),
            replace=args.replace,
        )
    print(f"built private review context for {label}: {json_output} and {markdown_output}")
    return 0


def _compile_approved_question_context(args: argparse.Namespace) -> int:
    candidate_path = Path(os.path.abspath(args.candidate_set))
    decisions_path = Path(os.path.abspath(args.review_decisions))
    receipts_path = Path(os.path.abspath(args.approval_receipts))
    private_root = _validate_private_context_root(args.private_output_root, source_root=_AMC_REPOSITORY_ROOT)
    with _private_context_lock(private_root):
        json_output, markdown_output = _resolve_private_context_outputs(
            private_output_root=args.private_output_root,
            json_output=args.json_output,
            markdown_output=args.markdown_output,
            source_root=_AMC_REPOSITORY_ROOT,
            protected_inputs={candidate_path, decisions_path, receipts_path},
            replace=args.replace,
        )
        candidate_set = load_strict_json(candidate_path, require_protected=True)
        review_decisions = load_strict_json(decisions_path, require_protected=True)
        approval_receipts = load_strict_json(receipts_path, require_protected=True)
        approved = compile_approved_question_context_set(
            candidate_set,
            review_decisions,
            approval_receipts,
            allow_test_only=args.allow_test_only,
        )
        _write_context_output_pair_atomic(
            json_output,
            canonical_json(approved),
            markdown_output,
            approved_question_context_set_markdown(approved),
            replace=args.replace,
        )
    print(f"compiled explicit reviewed approvals with independent authority receipts: {json_output} and {markdown_output}")
    return 0


def _compose_supplemented_archive_context(args: argparse.Namespace) -> int:
    candidate_path = Path(os.path.abspath(args.archive_candidate_set))
    supplement_path = Path(os.path.abspath(args.supplement_set))
    private_root = _validate_private_context_root(args.private_output_root, source_root=_AMC_REPOSITORY_ROOT)
    with _private_context_lock(private_root):
        json_output, markdown_output = _resolve_private_context_outputs(
            private_output_root=args.private_output_root,
            json_output=args.json_output,
            markdown_output=args.markdown_output,
            source_root=_AMC_REPOSITORY_ROOT,
            protected_inputs={candidate_path, supplement_path},
            replace=args.replace,
        )
        archive_candidate = load_strict_json(candidate_path, require_protected=True)
        supplement_set = load_strict_json(supplement_path, require_protected=True)
        composed = compose_supplemented_archive_candidate_set(archive_candidate, supplement_set)
        _write_context_output_pair_atomic(
            json_output,
            canonical_json(composed),
            markdown_output,
            supplemented_archive_candidate_set_markdown(composed),
            replace=args.replace,
        )
    print(f"composed protected original supplements as unapproved candidates: {json_output} and {markdown_output}")
    return 0


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _validate_private_context_root(private_output_root: Path, *, source_root: Path) -> Path:
    """Validate the private root against caller and code-anchored public roots."""

    lexical_root = Path(os.path.abspath(private_output_root))
    if lexical_root.is_symlink():
        raise ContentBuildError(["private output root must not be a symlink"])
    if not lexical_root.is_dir():
        raise ContentBuildError(["private output root must be an existing directory"])
    private_root = lexical_root.resolve(strict=True)
    mode = stat.S_IMODE(private_root.stat().st_mode)
    if mode != 0o700:
        raise ContentBuildError([f"private output root permissions must be exactly 0700, found {mode:04o}"])
    if private_root.stat().st_uid != os.geteuid():
        raise ContentBuildError(["private output root must be owned by effective uid"])

    resolved_source_root = source_root.resolve()
    if _is_within(private_root, resolved_source_root) or _is_within(resolved_source_root, private_root):
        raise ContentBuildError(["private output root must be disjoint from source_root"])
    if _is_within(private_root, _AMC_REPOSITORY_ROOT) or _is_within(_AMC_REPOSITORY_ROOT, private_root):
        raise ContentBuildError(
            ["private output root must be disjoint from the code-anchored AMC public repository/document root"]
        )
    return private_root


@contextmanager
def _private_context_lock(private_root: Path) -> Iterator[None]:
    """Serialize resolve/build/install across processes sharing a private root."""

    lock_path = private_root / _PRIVATE_CONTEXT_LOCK_NAME
    flags = os.O_CREAT | os.O_RDWR | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(lock_path, flags, 0o600)
    except OSError as error:
        raise ContentBuildError([f"cannot open private context lock: {error}"]) from error
    try:
        lock_stat = os.fstat(descriptor)
        if not stat.S_ISREG(lock_stat.st_mode):
            raise ContentBuildError(["private context lock must be a regular file"])
        os.fchmod(descriptor, 0o600)
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    finally:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_UN)
        finally:
            os.close(descriptor)


def _resolve_private_context_outputs(
    *,
    private_output_root: Path,
    json_output: Path,
    markdown_output: Path,
    source_root: Path,
    protected_inputs: set[Path],
    replace: bool,
) -> tuple[Path, Path]:
    """Resolve and authorize context outputs before reading model-bound data."""

    lexical_root = Path(os.path.abspath(private_output_root))
    private_root = _validate_private_context_root(lexical_root, source_root=source_root)

    resolved_outputs: list[Path] = []
    for label, requested in (("JSON", json_output), ("Markdown", markdown_output)):
        lexical_output = Path(os.path.abspath(requested))
        try:
            relative = lexical_output.relative_to(lexical_root)
        except ValueError as error:
            raise ContentBuildError([f"question-context {label} output must be inside private output root"]) from error
        current = private_root
        for part in relative.parts:
            current = current / part
            if current.is_symlink():
                raise ContentBuildError([f"question-context {label} output path must not contain symlinks"])
        resolved = lexical_output.resolve(strict=False)
        if not _is_within(resolved, private_root) or resolved == private_root:
            raise ContentBuildError([f"question-context {label} output must resolve inside private output root"])
        if resolved == private_root / _PRIVATE_CONTEXT_LOCK_NAME:
            raise ContentBuildError([f"question-context {label} output path is reserved for the private-root lock"])
        if resolved in {path.resolve() for path in protected_inputs}:
            raise ContentBuildError([f"question-context {label} output must not overwrite an input"])
        if resolved.exists():
            if not resolved.is_file():
                raise ContentBuildError([f"question-context {label} output exists and is not a regular file"])
            if not replace:
                raise ContentBuildError([f"question-context {label} output already exists; pass --replace explicitly"])
        resolved_outputs.append(resolved)
    if resolved_outputs[0] == resolved_outputs[1]:
        raise ContentBuildError(["question-context JSON and Markdown output paths must be different"])
    return resolved_outputs[0], resolved_outputs[1]


def _write_context_output_pair_atomic(
    json_path: Path,
    json_content: str,
    markdown_path: Path,
    markdown_content: str,
    *,
    replace: bool,
) -> None:
    """Stage both outputs, then install them with rollback and temp cleanup."""

    outputs = ((json_path, json_content), (markdown_path, markdown_content))
    staged: dict[Path, Path] = {}
    backups: dict[Path, Path] = {}
    installed: list[Path] = []
    try:
        for path, content in outputs:
            path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
                staged[path] = Path(handle.name)
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
        for path, _ in outputs:
            if not replace:
                staged_path = staged[path]
                try:
                    os.link(staged_path, path)
                except FileExistsError as error:
                    raise ContentBuildError([f"question-context output appeared concurrently: {path}"]) from error
                installed.append(path)
                staged_path.unlink()
                del staged[path]
                continue
            if path.exists():
                with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
                    backup = Path(handle.name)
                backup.unlink()
                os.replace(path, backup)
                backups[path] = backup
            staged_path = staged[path]
            os.replace(staged_path, path)
            del staged[path]
            installed.append(path)
    except Exception:
        for path in reversed(installed):
            if path.exists():
                path.unlink()
        for path, backup in backups.items():
            if backup.exists():
                os.replace(backup, path)
        raise
    finally:
        for temporary in [*staged.values(), *backups.values()]:
            if temporary.exists():
                temporary.unlink()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AMC practice content review and release gate")
    subcommands = parser.add_subparsers(dest="command", required=True)

    review = subcommands.add_parser("review", help="parse source and write a non-key review report")
    review.add_argument("--form", type=Path, required=True)
    review.add_argument("--source-root", type=Path, required=True)
    review.add_argument("--json-output", type=Path, required=True)
    review.add_argument("--markdown-output", type=Path, required=True)
    review.set_defaults(handler=_review)

    build = subcommands.add_parser("build", help="build a public/private manifest from approved source and key")
    build.add_argument("--form", type=Path, required=True)
    build.add_argument("--answer-key", type=Path, required=True)
    build.add_argument("--source-root", type=Path, required=True)
    build.add_argument("--public-output", type=Path, required=True)
    build.add_argument("--private-output", type=Path, required=True)
    build.add_argument("--review-json-output", type=Path)
    build.add_argument("--review-markdown-output", type=Path)
    build.add_argument("--allow-test-only", action="store_true")
    build.set_defaults(handler=_build)

    validate = subcommands.add_parser("validate", help="validate an already generated artifact")
    validate.add_argument("--manifest", type=Path, required=True)
    validate.add_argument("--private", action="store_true", help="validate server-side private manifest + import policy")
    validate.add_argument("--allow-test-only", action="store_true")
    validate.set_defaults(handler=_validate)

    archive_build = subcommands.add_parser(
        "build-archive", help="build the separately authorized historical archive-practice release"
    )
    archive_build.add_argument("--source-root", type=Path, required=True)
    archive_build.add_argument("--answer-keys", type=Path, required=True)
    archive_build.add_argument("--overrides", type=Path, required=True)
    archive_build.add_argument("--media-manifest", type=Path, required=True)
    archive_build.add_argument("--release-version", required=True)
    archive_build.add_argument("--public-output-dir", type=Path, required=True)
    archive_build.add_argument("--private-output-dir", type=Path, required=True)
    archive_build.add_argument("--private-batch-output", type=Path, required=True)
    archive_build.add_argument("--report-output", type=Path, required=True)
    archive_build.set_defaults(handler=_build_archive)

    context = subcommands.add_parser(
        "build-question-context",
        help="extract private, unapproved multi-solution candidates for review",
    )
    source = context.add_mutually_exclusive_group(required=True)
    source.add_argument("--source-file", type=Path, help="build one source Markdown file")
    source.add_argument("--form", type=Path, help="build every question in a source-form JSON")
    source.add_argument(
        "--archive-private-release",
        type=Path,
        help="build the 48-form inventory from an exact private archive release",
    )
    context.add_argument("--question-number", type=int, choices=range(1, 26))
    context.add_argument("--source-root", type=Path, required=True)
    context.add_argument("--private-output-root", type=Path, required=True)
    context.add_argument("--json-output", type=Path, required=True)
    context.add_argument("--markdown-output", type=Path, required=True)
    context.add_argument("--replace", action="store_true", help="explicitly replace existing regular output files")
    context.set_defaults(handler=_build_question_context)

    approved = subcommands.add_parser(
        "compile-approved-question-context",
        help="compile exact policy-bound reviews into private AI context; never infers approval",
    )
    approved.add_argument("--candidate-set", type=Path, required=True)
    approved.add_argument("--review-decisions", type=Path, required=True)
    approved.add_argument("--approval-receipts", type=Path, required=True)
    approved.add_argument(
        "--allow-test-only",
        action="store_true",
        help="emit the non-importable private-test-only schema for synthetic candidates",
    )
    approved.add_argument("--private-output-root", type=Path, required=True)
    approved.add_argument("--json-output", type=Path, required=True)
    approved.add_argument("--markdown-output", type=Path, required=True)
    approved.add_argument("--replace", action="store_true", help="explicitly replace existing regular output files")
    approved.set_defaults(handler=_compile_approved_question_context)

    supplemented = subcommands.add_parser(
        "compose-supplemented-archive-context",
        help="bind protected operator-original supplements into an unapproved archive candidate envelope",
    )
    supplemented.add_argument("--archive-candidate-set", type=Path, required=True)
    supplemented.add_argument("--supplement-set", type=Path, required=True)
    supplemented.add_argument("--private-output-root", type=Path, required=True)
    supplemented.add_argument("--json-output", type=Path, required=True)
    supplemented.add_argument("--markdown-output", type=Path, required=True)
    supplemented.add_argument("--replace", action="store_true", help="explicitly replace existing regular output files")
    supplemented.set_defaults(handler=_compose_supplemented_archive_context)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "build-question-context":
        if args.source_file and args.question_number is None:
            parser.error("--question-number is required with --source-file")
        if args.form and args.question_number is not None:
            parser.error("--question-number may only be used with --source-file")
        if args.archive_private_release and args.question_number is not None:
            parser.error("--question-number may only be used with --source-file")
    try:
        return args.handler(args)
    except ContentBuildError as error:
        print("content release gate failed:", file=sys.stderr)
        for message in error.messages:
            print(f"- {message}", file=sys.stderr)
        return 2


if __name__ == "__main__":  # pragma: no cover - exercised via module CLI
    raise SystemExit(main())
