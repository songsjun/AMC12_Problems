#!/usr/bin/env python3
"""Container-only renderer for historical AMC media.

This program intentionally accepts only a precomputed job list.  It never
opens the network, and its caller mounts source inputs read-only.  The host
orchestrator uses Docker restrictions in addition to these checks.
"""

from __future__ import annotations

import argparse
import base64
import binascii
import hashlib
from io import BytesIO
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Any
import xml.etree.ElementTree as ET
import re

from PIL import Image, UnidentifiedImageError


MAX_RASTER_PIXELS = 20_000_000
MAX_RENDER_BYTES = 20 * 1024 * 1024
BLOCKED_SVG_ELEMENTS = frozenset({"embed", "foreignobject", "iframe", "object", "script"})
SVG_REFERENCE_ATTRIBUTES = frozenset({"href", "src"})
EMBEDDED_RASTER_DATA_URI = re.compile(
    r"^data:image/(?P<kind>png|jpeg);base64,(?P<payload>[A-Za-z0-9+/= \t\r\n]+)$"
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_relative_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute() or ".." in path.parts or not value:
        raise ValueError(f"unsafe relative path: {value!r}")
    return path


def validate_svg(path: Path) -> None:
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError("SVG output is missing or empty")
    if path.stat().st_size > MAX_RENDER_BYTES:
        raise ValueError("SVG output exceeds size limit")
    try:
        payload = path.read_bytes()
        if b"<!doctype" in payload.lower() or b"<!entity" in payload.lower():
            raise ValueError("SVG output must not contain a DTD or entity declaration")
        root = ET.fromstring(payload)
    except ET.ParseError as error:
        raise ValueError(f"invalid SVG XML: {error}") from error
    if root.tag.rsplit("}", 1)[-1].lower() != "svg":
        raise ValueError("SVG root element is not <svg>")
    for element in root.iter():
        element_name = element.tag.rsplit("}", 1)[-1].lower()
        if element_name in BLOCKED_SVG_ELEMENTS:
            raise ValueError(f"SVG output contains blocked <{element_name}> element")
        for attribute, value in element.attrib.items():
            attribute_name = attribute.rsplit("}", 1)[-1].lower()
            reference = value.strip()
            if attribute_name not in SVG_REFERENCE_ATTRIBUTES or not reference or reference.startswith("#"):
                continue
            validate_embedded_raster_reference(reference, attribute_name)


def validate_embedded_raster_reference(reference: str, attribute_name: str) -> None:
    """Allow only bounded, strictly decoded self-contained PNG/JPEG data URIs."""

    match = EMBEDDED_RASTER_DATA_URI.fullmatch(reference)
    if not match or not match.group("payload"):
        raise ValueError(f"SVG output contains a non-fragment {attribute_name} reference")
    encoded = re.sub(r"[ \t\r\n]", "", match.group("payload"))
    if len(encoded) > ((MAX_RENDER_BYTES + 2) // 3) * 4:
        raise ValueError("embedded SVG raster exceeds size limit")
    try:
        payload = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("embedded SVG raster is not strict base64") from error
    if len(payload) > MAX_RENDER_BYTES:
        raise ValueError("embedded SVG raster exceeds size limit")
    expected_format = "PNG" if match.group("kind") == "png" else "JPEG"
    Image.MAX_IMAGE_PIXELS = MAX_RASTER_PIXELS
    try:
        with Image.open(BytesIO(payload)) as image:
            if image.format != expected_format:
                raise ValueError("embedded SVG raster MIME type does not match its bytes")
            if image.width * image.height > MAX_RASTER_PIXELS:
                raise ValueError("embedded SVG raster pixel count exceeds limit")
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError(f"embedded SVG raster is invalid: {error}") from error


def validate_png(path: Path) -> None:
    if not path.is_file() or path.stat().st_size < 16:
        raise ValueError("PNG output is missing or empty")
    if path.stat().st_size > MAX_RENDER_BYTES:
        raise ValueError("PNG output exceeds size limit")
    with path.open("rb") as handle:
        if handle.read(8) != b"\x89PNG\r\n\x1a\n":
            raise ValueError("PNG signature is invalid")
    try:
        with Image.open(path) as image:
            if image.width * image.height > MAX_RASTER_PIXELS:
                raise ValueError("PNG pixel count exceeds limit")
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError(f"invalid PNG: {error}") from error


def render_asymptote(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="amc-asy-") as temporary_dir:
        environment = {
            "HOME": temporary_dir,
            "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "TMPDIR": temporary_dir,
        }
        result = subprocess.run(
            # ``-render=0`` keeps graph3/solids output in vector SVG mode.
            # Without it headless Asymptote can return success after trying to
            # initialize an unavailable OpenGL display, leaving no file.
            ["asy", "-render=0", "-f", "svg", "-o", str(destination), str(source)],
            cwd=temporary_dir,
            env=environment,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=45,
            check=False,
        )
    if result.returncode:
        details = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"Asymptote exited {result.returncode}: {details[-1500:]}")
    validate_svg(destination)


def convert_raster(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.MAX_IMAGE_PIXELS = MAX_RASTER_PIXELS
    try:
        with Image.open(source) as image:
            if image.width * image.height > MAX_RASTER_PIXELS:
                raise ValueError("source image pixel count exceeds limit")
            image.seek(0)  # An animated GIF is intentionally represented by frame one.
            rendered = image.convert("RGBA")
            rendered.save(destination, format="PNG", optimize=False)
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError(f"cannot decode raster source: {error}") from error
    validate_png(destination)


def render_job(job: dict[str, Any], sources: Path, downloads: Path, output: Path) -> dict[str, Any]:
    job_id = str(job["id"])
    try:
        destination = output / safe_relative_path(str(job["output"]))
        if job["kind"] == "asymptote":
            source = sources / safe_relative_path(str(job["input"]))
            render_asymptote(source, destination)
            mime_type = "image/svg+xml"
        elif job["kind"] == "raster":
            source = downloads / safe_relative_path(str(job["input"]))
            convert_raster(source, destination)
            mime_type = "image/png"
        else:
            raise ValueError(f"unsupported renderer job kind: {job['kind']!r}")
        return {
            "id": job_id,
            "mimeType": mime_type,
            "output": str(safe_relative_path(str(job["output"]))),
            "sha256": sha256_file(destination),
            "status": "success",
        }
    except (OSError, RuntimeError, ValueError, subprocess.TimeoutExpired) as error:
        return {"id": job_id, "message": str(error), "status": "failed"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--jobs", required=True, type=Path)
    parser.add_argument("--sources", required=True, type=Path)
    parser.add_argument("--downloads", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    jobs = json.loads(args.jobs.read_text(encoding="utf-8"))
    if not isinstance(jobs, list):
        raise SystemExit("jobs document must be a JSON array")
    args.output.mkdir(parents=True, exist_ok=True)
    results = [render_job(job, args.sources, args.downloads, args.output) for job in jobs]
    result_path = args.output / "render-results.json"
    result_path.write_text(
        json.dumps({"schemaVersion": "amc12-media-render-results-v1", "results": results}, indent=2, sort_keys=True)
        + "\n",
        encoding="utf-8",
    )
    failed = sum(result["status"] != "success" for result in results)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
