#!/usr/bin/env python3
"""Convert a saved AoPS revision API response without rewriting its mathematics.

Downloads and diagram rendering are separate operations. This converter retains
all solution sections, saves the original wiki source, and emits isolated
Asymptote jobs for the existing networkless Docker renderer.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from batch_convert import handle_templates, handle_wiki_links  # noqa: E402
from build_historical_media import renderable_asy_source, UNSAFE_ASY  # noqa: E402


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def convert(source: str, number: int, contest: str, staging: Path) -> tuple[str, list[dict], dict]:
    body = re.split(r"(?im)^==+\s*See\s+also\s*==+\s*$", source, maxsplit=1)[0]
    tokens: list[str] = []
    jobs: list[dict] = []
    math_bodies: list[str] = []
    file_references: list[str] = []

    def freeze(value: str) -> str:
        token = f"AOPSPRESERVEDTOKEN{len(tokens):06d}END"
        if token in source:
            raise ValueError("source collides with reserved conversion token")
        tokens.append(value)
        return token

    def diagram(match: re.Match) -> str:
        index = len(jobs) + 1
        code = match[1].strip() + "\n"
        if UNSAFE_ASY.search(code):
            raise ValueError(f"unsafe Asymptote in problem {number}, diagram {index}")
        name = f"problem-{number:02d}-diagram-{index:02d}"
        (staging / "sources" / f"{name}.asy").write_text(renderable_asy_source(code), encoding="utf-8")
        jobs.append({"id": name, "kind": "asymptote", "input": f"{name}.asy", "output": f"media/{name}.svg"})
        return freeze(f"\n\n![AoPS diagram {index}](../{contest.replace(' ', '_')}_Problems/media/{name}.svg)\n\n")

    body = re.sub(r"(?is)<asy\b[^>]*>(.*?)</asy\s*>", diagram, body)

    def math(match: re.Match) -> str:
        content = match[2].strip()
        math_bodies.append(content)
        display = match[1].lower() == "cmath" or "\n" in content
        return freeze(f"\n\n$$\n{content}\n$$\n\n" if display else f"${content}$")

    body = re.sub(r"(?is)<(imath|cmath|math)\b[^>]*>(.*?)</\1\s*>", math, body)
    body = re.sub(r"(?s)<!--.*?-->", "", body)

    def image(match: re.Match) -> str:
        filename = match[1].strip().replace(" ", "_")
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*\.(?:png|jpe?g|gif|svg)", filename, re.IGNORECASE):
            raise ValueError(f"unsupported image filename: {filename}")
        file_references.append(filename)
        return freeze(f"![AoPS illustration](../{contest.replace(' ', '_')}_Problems/media/{filename})")

    body = re.sub(r"(?i)\[\[(?:File|Image):([^|\]]+)(?:\|[^\]]*)?\]\]", image, body)
    body = handle_wiki_links(handle_templates(body, number))
    body = re.sub(r"\[(https?://[^\s\]]+)\s+([^\]]+)\]", r"[\2](\1)", body)
    body = re.sub(r"(?m)^(={2,6})\s*(.+?)\s*\1\s*$", lambda m: f"{'#' * len(m[1])} {m[2]}", body)
    body = re.sub(r"'''(.+?)'''", r"**\1**", body)
    body = re.sub(r"''(.+?)''", r"*\1*", body)
    body = re.sub(r"(?m)^\*\s+", "- ", body)
    body = re.sub(r"(?m)^#\s+", "1. ", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    for index, token in enumerate(tokens):
        body = body.replace(f"AOPSPRESERVEDTOKEN{index:06d}END", token)
    markdown = f"# {contest} Problem {number}\n\n{body.strip()}\n"
    if not all(value in markdown for value in math_bodies):
        raise ValueError(f"mathematics changed during conversion of problem {number}")
    return markdown, jobs, {
        "mathExpressionCount": len(math_bodies),
        "mathExpressionsSha256": digest(json.dumps(math_bodies, ensure_ascii=False)),
        "diagramCount": len(jobs),
        "imageFiles": file_references,
        "solutionSectionCount": len(re.findall(r"(?im)^==+\s*(?:video\s+)?solution\b", source)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--staging", required=True, type=Path)
    args = parser.parse_args()
    document = json.loads(args.snapshot.read_text(encoding="utf-8"))
    pages = document["query"]["pages"]
    args.output.mkdir(parents=True, exist_ok=True)
    (args.staging / "sources").mkdir(parents=True, exist_ok=True)
    (args.staging / "downloads").mkdir(parents=True, exist_ok=True)
    jobs, records, numbers = [], [], set()
    for page in pages:
        revision = page["revisions"][0]
        source = revision["slots"]["main"]["content"]
        match = re.fullmatch(r"(2026 AMC 12A) Problems/Problem (\d+)", page["title"])
        url = "https://artofproblemsolving.com/wiki/index.php?title=" + quote(page["title"].replace(" ", "_"))
        raw = f"Title: {page['title']}\n\nURL Source: {url}&oldid={revision['revid']}&action=raw\n\nPublished Time: {revision['timestamp']}\n\nMarkdown Content:\n{source}"
        record = {"title": page["title"], "pageId": page["pageid"], "revisionId": revision["revid"], "revisionTimestamp": revision["timestamp"], "sourceUrl": url, "wikiSourceSha256": digest(source)}
        if match:
            number = int(match[2])
            if number not in range(1, 26) or number in numbers:
                raise ValueError("invalid or duplicate problem number")
            numbers.add(number)
            stem = f"Problem_{number:02d}"
            markdown, new_jobs, audit = convert(source, number, match[1], args.staging)
            (args.output / f"{stem}.md").write_text(markdown, encoding="utf-8")
            jobs.extend(new_jobs)
            record.update(audit, markdownSha256=digest(markdown))
        else:
            stem = {"2026 AMC 12A Answer Key": "Answer_Key", "2026 AMC 12A Problems": "Problems"}[page["title"]]
        (args.output / f"{stem}.raw.txt").write_text(raw, encoding="utf-8")
        records.append(record)
    if numbers != set(range(1, 26)):
        raise ValueError("snapshot must include all 25 problems")
    retrieved_at = datetime.fromtimestamp(args.snapshot.stat().st_mtime, timezone.utc).isoformat().replace("+00:00", "Z")
    (args.output / "source-manifest.json").write_text(json.dumps({"schemaVersion": "amc12-aops-source-snapshot-v1", "retrievedAt": retrieved_at, "snapshotSha256": hashlib.sha256(args.snapshot.read_bytes()).hexdigest(), "conversion": "source-preserving-math-and-all-solutions-v1", "pages": records}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (args.staging / "jobs.json").write_text(json.dumps(jobs, indent=2) + "\n", encoding="utf-8")
    print(f"Converted {len(numbers)} problems; prepared {len(jobs)} diagram jobs.")


if __name__ == "__main__":
    main()
