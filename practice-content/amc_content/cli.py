"""Command-line entry point for source reviews and manifest builds."""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path
from typing import Any

from .builder import (
    ContentBuildError,
    build_artifacts,
    load_source_form,
    parse_source_form,
    review_data,
    review_markdown,
)
from .canonical import canonical_json
from .validator import validate_import_policy, validate_private_manifest, validate_public_manifest


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
    errors = validate_private_manifest(manifest) if args.private else validate_public_manifest(manifest)
    if args.private:
        errors.extend(validate_import_policy(manifest, allow_test_only=args.allow_test_only))
    if errors:
        print("manifest validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 2
    print("manifest validation passed")
    return 0


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
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.handler(args)
    except ContentBuildError as error:
        print("content release gate failed:", file=sys.stderr)
        for message in error.messages:
            print(f"- {message}", file=sys.stderr)
        return 2


if __name__ == "__main__":  # pragma: no cover - exercised via module CLI
    raise SystemExit(main())
