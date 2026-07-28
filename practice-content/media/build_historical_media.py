#!/usr/bin/env python3
"""Build verified local media for the historical AMC 12 question stems.

Renderable Asymptote is taken from the exact Markdown prompt consumed by the
form parser, because older raw AoPS pages sometimes contain bare Asymptote
statements that the converter placed in a fenced prompt block.  A narrowly
audited raw-source override covers the one malformed 2025B prompt diagram.
AoPS file pages are downloaded only from the expected host and original-image
path; Asymptote then runs in a networkless, read-only Docker container.
"""

from __future__ import annotations

import argparse
import base64
import binascii
from dataclasses import dataclass
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys
import time
from typing import Any, Iterable
import unicodedata
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener
import xml.etree.ElementTree as ET
from uuid import uuid4
import zlib


CONTENT_PACKAGE_ROOT = Path(__file__).resolve().parents[1]
if str(CONTENT_PACKAGE_ROOT) not in sys.path:
    sys.path.insert(0, str(CONTENT_PACKAGE_ROOT))
from amc_content.canonical import normalize_markdown
from amc_content.parser import parse_problem_markdown


SCHEMA_VERSION = "amc12-historical-media-v1"
USER_AGENT = "AMC12PracticeMedia/1.0 (+local archival practice build)"
MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024
AOPS_REQUEST_INTERVAL_SECONDS = 1.0
MAX_RENDER_BYTES = 20 * 1024 * 1024
MAX_RASTER_PIXELS = 20_000_000
RENDERER_DEBIAN_SNAPSHOT = "20251020T000000Z"
FORM_PATTERN = re.compile(r"^(?P<year>20\d{2})_AMC_12(?P<edition>[AB])_Problems$")
PROBLEM_PATTERN = re.compile(r"^Problem_(?P<number>\d{2})\.raw\.txt$")
SOLUTION_HEADING = re.compile(
    r"==+\s*solution(?:\s|=|$)|^#{1,6}\s+solution(?:\s|$)", re.IGNORECASE | re.MULTILINE
)
RAW_SECTION_HEADING = re.compile(r"(?m)^==+[^=\n].*?==+\s*$")
ASY_BLOCK = re.compile(r"(?is)<asy(?:\s[^>]*)?>(.*?)</asy\s*>")
ASY_FENCE_OPENING = re.compile(r"^\s*(?P<marker>`{3,}|~{3,})\s*(?:asy|asymptote)\b[^\n]*$", re.IGNORECASE)
FENCE_CLOSING = re.compile(r"^\s*(?P<marker>`{3,}|~{3,})\s*$")
ASY_CONTAINER_OPENING = re.compile(r"<asy(?:\s[^>]*)?>", re.IGNORECASE)
ASY_CONTAINER_CLOSING = re.compile(r"</asy\s*>", re.IGNORECASE)
IMAGE_EMBED = re.compile(r"(?is)\[\[\s*(?:file|image)\s*:\s*([^\]|]+)(?:\|[^\]]*)?\]\]")
# The archive builder treats an AoPS File/Image page as a required visual even
# when the visible link text is a size/alignment hint rather than ``File:``.
# Keep discovery anchored to the destination so the exact original Markdown
# URL can be recorded and later replaced without relying on list order.
MARKDOWN_LINK_OPENING = re.compile(r"\[[^\]]*\]\(")
HTML_IMAGE_REFERENCE = re.compile(
    r"(?is)<img\b[^>]*?\bsrc\s*=\s*['\"](?P<url>[^'\"\s>]+)['\"]"
)
UNSAFE_ASY = re.compile(
    r"(?i)\b(?:system|exec|run|open|read|write|delete|rename|cd|pipe|load|save)\s*\("
)
DIAGRAM_HEADING = re.compile(r"==+\s*diagram\s*==+", re.IGNORECASE)
DIAGRAM_ATTRIBUTION = re.compile(r"\s+~[A-Za-z][A-Za-z0-9_]*(?=\s|$)")
Q10_PATHTICKS = re.compile(
    r"add\(pathticks\((?P<segment>A--E|E--B),\s*1,\s*\.5,\s*0,\s*10,\s*"
    r"red\+linewidth\(1\.25\)\)\);"
)
BLOCKED_SVG_ELEMENTS = frozenset({"embed", "foreignobject", "iframe", "object", "script"})
SVG_REFERENCE_ATTRIBUTES = frozenset({"href", "src"})
# SVG writers may wrap long base64 attributes across XML whitespace.  Permit
# only ASCII XML whitespace there, then remove it before strict base64 decode.
EMBEDDED_RASTER_DATA_URI = re.compile(
    r"^data:image/(?P<kind>png|jpeg);base64,(?P<payload>[A-Za-z0-9+/= \t\r\n]+)$"
)
ASY_COMPATIBILITY_PROFILE = "amc12-asy-compat-v1"
MARKDOWN_SCOPES = frozenset({"prompt", "solution"})
LOCAL_IMAGE_MIME_TYPES = {
    ".png": "image/png",
    ".svg": "image/svg+xml",
}
# Archive source images must be direct, repository-relative spellings.  Do
# not accept URL encoding, query strings, fragments, Windows separators, or
# arbitrary same-origin paths: the manifest needs to bind the exact source
# object that the Markdown named, not merely a browser-resolved equivalent.
SAFE_LOCAL_SOURCE_PATH = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*(?:/[A-Za-z0-9][A-Za-z0-9._-]*)*$")
LOCAL_SOURCE_REFERENCE_PREFIX = "../"
HISTORICAL_OVERRIDES_NAME = "practice-content/historical-overrides.json"
# These five files were declared by the immediately preceding development
# manifests but became orphaned as the source-recovery inventory was narrowed.
# Keep the one-time retirement record in the checked-in manifest so a release
# can prove both that they were deliberately managed and that they are absent.
# It is intentionally minimal: private render outputs and public static copies
# are separate filesystem roots, so a file is listed only where it existed.
RETIRED_MANAGED_OUTPUTS: dict[str, tuple[str, ...]] = {
    "private": (
        "assets/2020-amc-12a/problem-16-asy-01.svg",
        "assets/2020-amc-12b/problem-11-solution-asy-04.svg",
        "assets/2022-amc-12b/problem-18-asy-07.svg",
        "assets/2022-amc-12b/problem-18-solution-asy-05.svg",
    ),
    "public": ("historical-media/assets/2020-amc-12a/problem-16-asy-01.svg",),
}
ASY_COMPATIBILITY_PRELUDE = r"""// Generated compatibility prelude; the source block below remains unchanged.
import graph;
import geometry;
import math;
pair origin=(0,0);
real markscalefactor=1;
path rightanglemark(pair A, pair O, pair B, real scale=0.18) {
  pair OA=(A-O)/length(A-O);
  pair OB=(B-O)/length(B-O);
  return O+scale*OA--O+scale*(OA+OB)--O+scale*OB;
}
pair foot(pair P, pair A, pair B) {
  pair AB=B-A;
  return A+dot(P-A,AB)/dot(AB,AB)*AB;
}
// Minimal, audited replacements for the drawing helpers bundled in AoPS's
// old ``olympiad.asy`` snippets.  They use only Debian Asymptote primitives;
// source that imports olympiad is rewritten explicitly to use this prelude.
pen pathpen=black;
pen pointpen=black;
path CR(pair O, real r) { return circle(O,r); }
path CP(pair O, pair A) { return circle(O,length(A-O)); }
pair IP(path first, path second) { return intersectionpoints(first,second)[0]; }
pair OP(path first, path second) {
  pair[] points=intersectionpoints(first,second);
  return points.length > 1 ? points[1] : points[0];
}
pair MP(string text, pair P, pair direction=plain.N, pen style=defaultpen) {
  label(text,P,direction,style);
  return P;
}
void D(path value, pen style=pathpen) { draw(value,style); }
pair D(pair value, pen style=pointpen) { dot(value,style); return value; }
pair D(string text, pair value, pair direction=plain.N, pen style=defaultpen) {
  return MP(text,value,direction,style);
}
// The sole emitted TrigMacros diagram draws its own x/y axes immediately
// afterwards.  Its setup helper therefore needs no drawing side effect here;
// preserving the named parameters keeps that diagram source portable.
void rr_cartesian_axes(real xMin, real xMax, real yMin, real yMax,
                       bool complexplane=false, bool usegrid=true) {}
pair waypoint(path value, real position) { return point(value,reltime(value,position)); }
path anglemark(pair A, pair O, pair B, real radius=0.2) { return arc(A,O,B,radius); }
void MA(string text, pair A, pair O, pair B, real radius=0.2) {
  path mark=anglemark(A,O,B,radius);
  draw(mark);
  label(text,point(mark,0.5));
}
picture pathticks(path value, int count, real position, real spacing, real length, pen style=black) {
  picture result;
  pair center=point(value,position);
  pair tangent=unit(dir(value,position));
  pair normal=rotate(90)*tangent;
  for(int index=0; index < count; ++index) {
    real displacement=(index-(count-1)/2.0)*spacing/10;
    draw(result,center+displacement*tangent-length/20*normal--center+displacement*tangent+length/20*normal,style);
  }
  return result;
}
"""

# These entries cover diagrams which the old Markdown converter did not retain
# inside an ``<asy>`` tag.  They are deliberately explicit instead of applying
# a broad "Diagram heading" heuristic to every historical raw source.  This
# one corresponds to the requiredMedia entry in historical-overrides.json.
MANUAL_ASY_DIAGRAMS: dict[str, dict[str, str]] = {
    "2025_AMC_12B_Problems/Problem_10.raw.txt": {
        "extraction": "raw-diagram-heading-v1",
        "renderTransform": "q10-explicit-midpoint-ticks-v1",
    },
}
# A very small number of old conversions put an otherwise complete Asymptote
# program in a Markdown fence together with answer choices/prose.  The raw
# AoPS page still holds the intended program, but it does not use an ``<asy>``
# wrapper, so there is no generic raw-to-Markdown mapping to rely on.  These
# profiles are deliberately keyed by the exact emitted placement and bind the
# entire raw page plus unique extraction anchors.  A changed source therefore
# fails closed instead of silently selecting a different diagram.
RAW_ASY_FALLBACKS: dict[tuple[str, str, int], dict[str, str]] = {
    (
        "2009_AMC_12A_Problems/Problem_10.md",
        "prompt",
        1,
    ): {
        "rawSourceSha256": "065856b873798d3e86a660abc3c45fdc27196789a9a26de1208c84546daeb745",
        "rawAnchorStart": "unitsize(4mm);",
        "rawAnchorEnd": r"\textbf{(A)}\ 11",
        "sourceSha256": "423acf576e1d3876a80bf563215c2e1a6b68249c8057f98dbb27c19e9b15d9ee",
    },
    (
        "2009_AMC_12A_Problems/Problem_11.md",
        "prompt",
        1,
    ): {
        "rawSourceSha256": "69faf30373ea761c4c14f2bd43cafb73e2a7c5b206c2b689085feb563d507073",
        "rawAnchorStart": (
            "unitsize(3mm); defaultpen(linewidth(.8pt)+fontsize(8pt)); "
            "path d=(1/2,0)--(0,sqrt(3)/2)--(-1/2,0)--(0,-sqrt(3)/2)--cycle; "
            "marker m=marker("
        ),
        "rawAnchorEnd": r"\textbf{(A)}\ 401",
        "sourceSha256": "ab535afddb2a6a1e6d5829f44ab5c6ea5e4a22b04f958407bd1d76eb26a63f12",
    },
    (
        "2012_AMC_12B_Problems/Problem_19.md",
        "prompt",
        1,
    ): {
        "rawSourceSha256": "04032167ea277fffa9aeff063bb876932cf41026dce6247a2240cbe8798574c1",
        "rawAnchorStart": "import three;",
        "rawAnchorEnd": r"\textbf{(A)}",
        "sourceSha256": "6cf91e9713a73a623c89ce8b502db75563d573a0586e6bd14f870d0318453dae",
    },
}

# Old AoPS exports sometimes collapsed a code comment and the code following
# it onto one physical line.  Asymptote then treats the rest of the program as
# a comment and creates an empty SVG.  Only the exact source placement+hashes
# below may be repaired.  Every replacement is required exactly once and each
# profile verifies its post-repair hash in ``apply_source_repair``.
SOURCE_REPAIR_PLACEMENTS: dict[tuple[str, str, int], str] = {
    ("2004_AMC_12A_Problems/Problem_08.md", "prompt", 1): "repair-2004a-q08-inline-comments-v1",
    ("2006_AMC_12B_Problems/Problem_15.md", "prompt", 1): "repair-2006b-q15-leading-comment-v1",
    ("2011_AMC_12A_Problems/Problem_25.md", "solution", 1): "repair-2011a-q25-inline-comment-v1",
    ("2012_AMC_12B_Problems/Problem_19.md", "prompt", 1): "repair-2012b-q19-inline-comments-v1",
    ("2013_AMC_12A_Problems/Problem_19.md", "solution", 1): "repair-2013a-q19-leading-comment-v1",
    ("2014_AMC_12B_Problems/Problem_19.md", "prompt", 1): "repair-2014b-q19-inline-comment-v1",
    ("2015_AMC_12A_Problems/Problem_25.md", "prompt", 1): "repair-2015a-q25-inline-comments-v1",
    ("2016_AMC_12A_Problems/Problem_15.md", "solution", 1): "repair-2016a-q15-inline-comments-v1",
    ("2023_AMC_12B_Problems/Problem_21.md", "prompt", 1): "repair-2023b-q21-leading-comment-v1",
    ("2024_AMC_12B_Problems/Problem_19.md", "prompt", 1): "repair-2024b-q19-leading-comment-v1",
    ("2025_AMC_12B_Problems/Problem_15.md", "prompt", 1): "repair-2025b-q15-inline-comments-v1",
    ("2022_AMC_12A_Problems/Problem_13.md", "solution", 1): "repair-2022a-q13-remove-trigmacros-import-v1",
    ("2022_AMC_12A_Problems/Problem_05.md", "prompt", 1): "repair-2022a-q05-inline-comments-v1",
    ("2020_AMC_12A_Problems/Problem_09.md", "solution", 1): "repair-2020a-q09-inline-comments-v1",
    ("2020_AMC_12A_Problems/Problem_24.md", "solution", 1): "repair-2020a-q24-solution-1-inline-comment-v1",
    ("2023_AMC_12B_Problems/Problem_13.md", "solution", 1): "repair-2023b-q13-inline-comment-v1",
}
SOURCE_REPAIR_PROFILES: dict[str, dict[str, Any]] = {
    "repair-2004a-q08-inline-comments-v1": {
        "sourceSha256": "31bd756a76943f7b7c4f4ed87050118e17ac2951650b03e8170c83df936fc9b6",
        "replacements": (
            ("//Variable Declarations ", "\n"),
            ("//Variable Definitions ", "\n"),
            ("//Initial Diagram ", "\n"),
            ("//Side labels ", "\n"),
        ),
        "resultSha256": "4a784db59061a4a3af033d2da2ea9de9aabfe024d62aacb21110e85a3806191e",
    },
    "repair-2006b-q15-leading-comment-v1": {
        "sourceSha256": "96db9c3b38cfc899f243f638769a9056253de5a15c7d4b1d1534ffc9ee4c00b8",
        "replacements": (("// from amc10 problem series ", ""),),
        "resultSha256": "c3dafc84fb94308177f0fe590eccfc6e12096dd81a6825423f5c3e85af9c3728",
    },
    "repair-2011a-q25-inline-comment-v1": {
        "sourceSha256": "49f06115491217088f5b7718b84fcfcb22496ee976113d66f915973b6ad20f17",
        "replacements": (("// A=IP(c1,O--O+5*dir(120)); A=IP", "// A=IP(c1,O--O+5*dir(120));\nA=IP"),),
        "resultSha256": "dbc8f3aec20e5741edeffe4b6af79076904d2d9ca0c7797dc634970fd987c25b",
    },
    "repair-2012b-q19-inline-comments-v1": {
        "sourceSha256": "6cf91e9713a73a623c89ce8b502db75563d573a0586e6bd14f870d0318453dae",
        "replacements": (
            ("// P[0] = P[4] for convenience triple[] Pp", "// P[0] = P[4] for convenience\ntriple[] Pp"),
            ("// draw octahedron triple pt", "// draw octahedron\ntriple pt"),
            ("// draw cube for(int i", "// draw cube\nfor(int i"),
        ),
        "resultSha256": "d9ba3a5c9e91f94a583af16aa9f02b348506906a10d33925dbfd309308a36cda",
    },
    "repair-2013a-q19-leading-comment-v1": {
        "sourceSha256": "f17d19b88d9cabc9fb90813726293bf9d215c5db460b7c27571e974b3649b63f",
        "replacements": (("//Made by samrocksnature ", ""),),
        "resultSha256": "a6566f2f6f2285eef3485383d2f3a5630727972238058a9a66acc5ee0661a669",
    },
    "repair-2014b-q19-inline-comment-v1": {
        "sourceSha256": "3e5eb527ee0909657e26f0af56022fdb270610349df53980e77489d73f1cbd4a",
        "replacements": (
            (
                "//triple f(pair t) {return (t.x*cos(t.y),t.x*sin(t.y),t.x^(1/n)*sin(t.y/n));} triple f(pair t)",
                "//triple f(pair t) {return (t.x*cos(t.y),t.x*sin(t.y),t.x^(1/n)*sin(t.y/n));}\ntriple f(pair t)",
            ),
        ),
        "resultSha256": "38ef2f116b027cf2ac0b2cf51f185001654b7063e8fac319d84a15fe47397447",
    },
    "repair-2015a-q25-inline-comments-v1": {
        "sourceSha256": "e173643008bf5a7b4d74d3880804a141d8d8f8fc4d170b4356b0a5cde5d61f18",
        "replacements": (
            ("// define a bunch of arrays and starting points pair[]", "// define a bunch of arrays and starting points\npair[]"),
            ("// draw the big circles and the bottom line path arc1", "// draw the big circles and the bottom line\npath arc1"),
            ("// will be taken in the right order for(int", "// will be taken in the right order\nfor(int"),
            ("// Draw the remaining 63 circles } for(int", "// Draw the remaining 63 circles\n} for(int"),
        ),
        "resultSha256": "7b317b9cbbb9ceb9520ba05abb5fce9e4a7b7d1afc71768458a758638d8c912b",
    },
    "repair-2016a-q15-inline-comments-v1": {
        "sourceSha256": "554b2fc17a90fe18dc32e31a409005c43d1e6c87b0782359bb8b0720c7e90444",
        "replacements": (
            ("//Variable Declarations ", "\n"),
            ("//Variable Definitions ", "\n"),
            ("//Initial Diagram ", "\n"),
            ("//Added lines ", "\n"),
            ("//Angle marks ", "\n"),
        ),
        "resultSha256": "ee8c66e81154feca7414fb91b914a331aed0a22fa0c4b6379b550cbb222428f6",
    },
    "repair-2023b-q21-leading-comment-v1": {
        "sourceSha256": "2f024276b22af3057602069f5cc1b6dc9db1d30d04aa44991b8ad677d1a71452",
        "replacements": (("// Please make the graph better if you have time. ", ""),),
        "resultSha256": "48c9c504aca923a0c5472ce445c5aa81e6ef561d8b832d0ac8fcd9f9dae61bb8",
    },
    "repair-2024b-q19-leading-comment-v1": {
        "sourceSha256": "f46e20bef077b89afe6d39425956caf48620ac10a9e4998300fce5e7df6fc156",
        "replacements": (("// Credit to shihan for this diagram. ", ""),),
        "resultSha256": "db75fee8348528052f485ef1573ea1c67bb9aca7306abf5bb7e5e28de2410670",
    },
    "repair-2025b-q15-inline-comments-v1": {
        "sourceSha256": "f642e6c1a114d5b31e621b293a091d1033a6a9c4d3b9eecfdce96b65e959c5c4",
        "replacements": (("// colored surfaces ", "\n"), ("// black outlines ", "\n")),
        "resultSha256": "b341402814b1b356d5c6e313863c4aa706822f8f93d164d328cc2e1762bbc229",
    },
    "repair-2022a-q13-remove-trigmacros-import-v1": {
        "sourceSha256": "4c7f2c4229a5a89b759fd01cdfc1b17943d7dd8a2c9a88d3c5359e47c3ba8411",
        "replacements": (("import TrigMacros; ", ""),),
        "resultSha256": "1e4b41b2befbdf9f86034168f5232b0fd00af5134eede9c7bc6f7a52fc5f75eb",
    },
    "repair-2022a-q05-inline-comments-v1": {
        "sourceSha256": "8db3395787b5ec18e77f3de4dffb571b3eea285d1a20496f29a8d20e6308cc3e",
        "replacements": (
            ("//Draws the horizontal gridlines void horizontalLines()", "//Draws the horizontal gridlines\nvoid horizontalLines()"),
            ("//Draws the vertical ticks void verticalTicks()", "//Draws the vertical ticks\nvoid verticalTicks()"),
        ),
        "resultSha256": "c82f2258e88629dcca898372ccf381c27cd8dae588a1d2b40eaae2722ec120a6",
    },
    "repair-2020a-q09-inline-comments-v1": {
        "sourceSha256": "1fda3d37590b2458ccdf3b48084693d0567ed7efe4033d006a6d2f73f3958807",
        "replacements": (
            ("//Draws the horizontal gridlines void horizontalLines()", "//Draws the horizontal gridlines\nvoid horizontalLines()"),
            ("//Draws the vertical gridlines void verticalLines()", "//Draws the vertical gridlines\nvoid verticalLines()"),
            ("//Draws the horizontal ticks void horizontalTicks()", "//Draws the horizontal ticks\nvoid horizontalTicks()"),
            ("//Draws the vertical ticks void verticalTicks()", "//Draws the vertical ticks\nvoid verticalTicks()"),
            ("$y=\\cos\\left(\\frac \\right)$", "$y=\\cos\\left(\\frac x2\\right)$"),
        ),
        "resultSha256": "2570e3cd7c641b974b11ad182e34bb87a1c7f3bc9b612a971b8fee82d8236b79",
    },
    "repair-2020a-q24-solution-1-inline-comment-v1": {
        "sourceSha256": "0b75d12715c50166d604d63bb240f06a114f60487b4a85c012f0d10428dcd235",
        "replacements": (("//draw(A--A+C--C, p); label(\"$A$\"", "//draw(A--A+C--C, p);\nlabel(\"$A$\""),),
        "resultSha256": "9efafacbebebd70edf0d9181b8b5582c915ac6f5d1faa7e50cd51781e47969ed",
    },
    "repair-2023b-q13-inline-comment-v1": {
        "sourceSha256": "b9cae04c0c659ebae408c5fb616cd482d385917357ae37f05cc04f0002ae2b0e",
        "replacements": (("// Dotted vertices dot(A)", "// Dotted vertices\ndot(A)"),),
        "resultSha256": "0a47c2f24b1270039f014ba0df882170f7c2cabc68cb8259f754caea5eb7cd27",
    },
}
# This is not an Asymptote diagram.  The corrupted conversion placed prompt
# text and solutions inside an unclosed ``asy`` fence; historical-overrides
# reconstructs the textual question and deliberately requires no figure.
NON_RENDERABLE_ASY_FENCE_RESOLUTIONS: dict[str, str] = {
    "2003_AMC_12B_Problems/Problem_24.md": "covered-by-historical-override-no-diagram",
    "2021_AMC_12B_Problems/Problem_21.md": "covered-by-historical-override-no-diagram",
}
_last_aops_request_at = 0.0


@dataclass(frozen=True)
class SourceLocation:
    form_slug: str
    form_name: str
    markdown_path: Path
    number: int
    raw_path: Path


@dataclass(frozen=True)
class AsymptoteFence:
    block_index: int
    closed: bool
    end_line: int | None
    line: int
    source: str


@dataclass(frozen=True)
class AsymptoteContainer:
    container_index: int
    closed: bool
    end_line: int | None
    fence_indexes: tuple[int, ...]
    line: int


@dataclass(frozen=True)
class ManagedOutputPaths:
    """Private render and public-copy paths explicitly owned by this pipeline."""

    private: frozenset[str]
    public: frozenset[str]


class HrefParser(HTMLParser):
    """Find original AoPS wiki image links without trusting page JavaScript."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        for key, value in attrs:
            if key.lower() == "href" and value:
                self.hrefs.append(value)


class RejectRedirects(HTTPRedirectHandler):
    """Refuse every HTTP redirect instead of trusting urllib's final URL."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
        raise HTTPError(req.full_url, code, f"redirect refused: {newurl}", headers, fp)


NO_REDIRECT_OPENER = build_opener(RejectRedirects)


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def split_question_stem(raw_text: str) -> str:
    """Return only the source before the first solution heading.

    A few historical raw files lost line breaks during ingestion, so MediaWiki
    solution headings are also detected mid-line.  This is intentionally much
    narrower than a generic word search.
    """

    match = SOLUTION_HEADING.search(raw_text)
    return raw_text[: match.start()] if match else raw_text


def iter_source_locations(repo_root: Path) -> Iterable[SourceLocation]:
    for form_path in sorted(repo_root.glob("*_AMC_12[AB]_Problems")):
        form_match = FORM_PATTERN.match(form_path.name)
        if not form_match:
            continue
        form_slug = f"{form_match.group('year')}-amc-12{form_match.group('edition').lower()}"
        for raw_path in sorted(form_path.glob("Problem_*.raw.txt")):
            problem_match = PROBLEM_PATTERN.match(raw_path.name)
            if not problem_match:
                continue
            markdown_path = raw_path.with_suffix("").with_suffix(".md")
            if not markdown_path.is_file():
                raise ValueError(f"missing converted Markdown for media source: {markdown_path}")
            yield SourceLocation(
                form_slug=form_slug,
                form_name=form_path.name,
                markdown_path=markdown_path,
                number=int(problem_match.group("number")),
                raw_path=raw_path,
            )


def relative_to_root(path: Path, repo_root: Path) -> str:
    return path.resolve().relative_to(repo_root.resolve()).as_posix()


def normalized_asy_source(source: str) -> str:
    return source.strip() + "\n"


def load_historical_overrides(repo_root: Path) -> dict[str, dict[str, Any]]:
    """Load the same prompt/solution repairs consumed by ``archive.py``.

    Media has to be discovered from the *emitted* archival text.  Scanning a
    pre-repair Markdown file would create assets that no release question can
    place, while missing an image introduced by a repair.  The archive module
    validates the full override schema during release; this lightweight reader
    is intentionally fail-closed about the fields that affect media scope.
    """

    path = repo_root / HISTORICAL_OVERRIDES_NAME
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"cannot read historical overrides: {error}") from error
    overrides = document.get("overrides")
    if document.get("schemaVersion") != "amc-practice-historical-overrides-v1" or not isinstance(overrides, dict):
        raise ValueError("historical overrides have an unsupported schema")
    checked: dict[str, dict[str, Any]] = {}
    for source_path, override in overrides.items():
        if not isinstance(source_path, str) or not isinstance(override, dict):
            raise ValueError("historical overrides must map source paths to objects")
        for field in ("promptMarkdown", "solutionMarkdown"):
            value = override.get(field)
            if value is not None and (not isinstance(value, str) or not value.strip()):
                raise ValueError(f"historical override {source_path} has an invalid {field}")
        checked[source_path] = override
    return checked


def markdown_scope_for_location(
    location: SourceLocation,
    repo_root: Path,
    scope: str,
    *,
    overrides: dict[str, dict[str, Any]] | None = None,
) -> str:
    """Return archive-emitted Markdown for one question scope.

    ``markdownBlockIndex`` values in the manifest are always relative to this
    returned scope, never to the full source file.  That makes prompt and
    post-submission solution replacement independently deterministic.
    """

    if scope not in MARKDOWN_SCOPES:
        raise ValueError(f"unsupported Markdown scope: {scope!r}")
    parsed = parse_problem_markdown(
        location.markdown_path,
        number=location.number,
        source_path=relative_to_root(location.markdown_path, repo_root),
        source_root=repo_root,
    )
    overrides = overrides if overrides is not None else load_historical_overrides(repo_root)
    override = overrides.get(relative_to_root(location.markdown_path, repo_root), {})
    field = f"{scope}Markdown"
    value = override.get(field, getattr(parsed, f"{scope}_markdown"))
    if not isinstance(value, str):
        raise ValueError(f"archive {scope} Markdown is not text for {location.markdown_path}")
    return normalize_markdown(value)


def prompt_markdown_for_location(location: SourceLocation, repo_root: Path) -> str:
    """Backward-compatible prompt helper used by existing callers/tests."""

    return markdown_scope_for_location(location, repo_root, "prompt")


def raw_scope_text(raw_text: str, scope: str) -> str:
    """Return the raw AoPS section corresponding to archive's chosen scope.

    Raw pages retain all community solutions, but the archive deliberately
    emits only the first written solution section.  This narrow section split
    is used only to pair complete ``<asy>`` wrappers with their fragmented
    Markdown conversion; standalone Markdown fences remain independently
    auditable source records.
    """

    if scope == "prompt":
        return split_question_stem(raw_text)
    if scope != "solution":
        raise ValueError(f"unsupported raw scope: {scope!r}")
    start = SOLUTION_HEADING.search(raw_text)
    if not start:
        return ""
    next_heading = RAW_SECTION_HEADING.search(raw_text, start.end())
    end = next_heading.start() if next_heading else len(raw_text)
    return raw_text[start.start() : end]


def extract_asymptote_fences(markdown: str) -> list[AsymptoteFence]:
    """Extract fenced Asymptote blocks without treating source lines as Markdown.

    The parser already identifies which text is student-prompt content.  This
    small fence scanner then preserves code exactly, supports either backtick
    or tilde markers, and records an unclosed block rather than absorbing it
    as a supposedly valid diagram.
    """

    lines = markdown.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    blocks: list[AsymptoteFence] = []
    index = 0
    while index < len(lines):
        opening = ASY_FENCE_OPENING.match(lines[index])
        if not opening:
            index += 1
            continue
        marker = opening.group("marker")
        marker_character = marker[0]
        marker_length = len(marker)
        opening_line = index + 1
        index += 1
        source_lines: list[str] = []
        closed = False
        closing_line: int | None = None
        while index < len(lines):
            closing = FENCE_CLOSING.match(lines[index])
            if (
                closing
                and closing.group("marker")[0] == marker_character
                and len(closing.group("marker")) >= marker_length
            ):
                closed = True
                closing_line = index + 1
                index += 1
                break
            source_lines.append(lines[index])
            index += 1
        blocks.append(
            AsymptoteFence(
                block_index=len(blocks) + 1,
                closed=closed,
                end_line=closing_line,
                line=opening_line,
                source=normalized_asy_source("\n".join(source_lines)),
            )
        )
    return blocks


def extract_asymptote_containers(markdown: str, fences: list[AsymptoteFence]) -> list[AsymptoteContainer]:
    """Find legacy ``<asy>`` wrappers and the fenced snippets they contain.

    The converter commonly splits one original `<asy>` block into several
    fenced pieces, leaving the outer wrapper in place.  Those fragments cannot
    be rendered independently (labels/functions lose their shared context),
    so a canonical raw block replaces each closed wrapper as one SVG.
    """

    lines = markdown.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    containers: list[AsymptoteContainer] = []
    opening_line: int | None = None
    for index, line in enumerate(lines, start=1):
        if opening_line is None:
            opening = ASY_CONTAINER_OPENING.search(line)
            if not opening:
                continue
            opening_line = index
            closing = ASY_CONTAINER_CLOSING.search(line, opening.end())
            if not closing:
                continue
        else:
            closing = ASY_CONTAINER_CLOSING.search(line)
        if opening_line is not None and closing:
            containers.append(
                AsymptoteContainer(
                    container_index=len(containers) + 1,
                    closed=True,
                    end_line=index,
                    fence_indexes=tuple(
                        fence.block_index
                        for fence in fences
                        if fence.end_line is not None and fence.line <= index and fence.end_line >= opening_line
                    ),
                    line=opening_line,
                )
            )
            opening_line = None
    if opening_line is not None:
        containers.append(
            AsymptoteContainer(
                container_index=len(containers) + 1,
                closed=False,
                end_line=None,
                fence_indexes=tuple(
                    fence.block_index for fence in fences if fence.end_line is None or fence.end_line >= opening_line
                ),
                line=opening_line,
            )
        )
    return containers


def markdown_location_for_source(source_metadata: dict[str, Any], repo_root: Path) -> SourceLocation:
    """Build a parser location from immutable manifest source metadata."""

    markdown_path = repo_root / source_metadata["markdownPath"]
    raw_path = source_metadata.get("rawPath")
    if not markdown_path.is_file():
        raise ValueError(f"Markdown source is missing: {markdown_path}")
    number_match = re.search(r"Problem_(\d+)\.md$", markdown_path.name)
    if not number_match:
        raise ValueError(f"cannot determine problem number from {markdown_path.name}")
    return SourceLocation(
        form_slug="",
        form_name="",
        markdown_path=markdown_path,
        number=int(number_match.group(1)),
        raw_path=repo_root / raw_path if isinstance(raw_path, str) else markdown_path.with_suffix(".raw.txt"),
    )


def markdown_fence_source_for_asset(asset: dict[str, Any], repo_root: Path) -> str:
    """Reconstruct the exact scoped fenced source in a manifest entry."""

    source_metadata = asset["source"]
    location = markdown_location_for_source(source_metadata, repo_root)
    scope = source_metadata.get("markdownScope")
    if scope not in MARKDOWN_SCOPES:
        raise ValueError("manifest Asymptote source lacks a valid markdownScope")
    fences = extract_asymptote_fences(markdown_scope_for_location(location, repo_root, scope))
    block_index = int(source_metadata["markdownBlockIndex"])
    try:
        fence = fences[block_index - 1]
    except IndexError as error:
        raise ValueError(f"Markdown Asymptote fence {block_index} is no longer present") from error
    if not fence.closed:
        raise ValueError(f"Markdown Asymptote fence {block_index} is unclosed")
    if fence.line != int(source_metadata["line"]):
        raise ValueError("Markdown Asymptote fence moved from its manifest-recorded line")
    if fence.end_line != int(source_metadata["markdownEndLine"]):
        raise ValueError("Markdown Asymptote fence closing line moved from its manifest-recorded line")
    return fence.source


def validate_raw_asy_markdown_mapping(source_metadata: dict[str, Any], repo_root: Path) -> None:
    """Ensure a raw canonical SVG still replaces the same scoped wrapper."""

    location = markdown_location_for_source(source_metadata, repo_root)
    scope = source_metadata.get("markdownScope")
    if scope not in MARKDOWN_SCOPES:
        raise ValueError("manifest raw Asymptote source lacks a valid markdownScope")
    markdown = markdown_scope_for_location(location, repo_root, scope)
    fences = extract_asymptote_fences(markdown)
    containers = extract_asymptote_containers(markdown, fences)
    container_index = int(source_metadata["markdownContainerIndex"])
    try:
        container = containers[container_index - 1]
    except IndexError as error:
        raise ValueError(f"Markdown Asymptote container {container_index} is no longer present") from error
    expected_fences = tuple(int(index) for index in source_metadata["markdownFenceIndexes"])
    if not container.closed or container.fence_indexes != expected_fences:
        raise ValueError("Markdown Asymptote container no longer covers the manifest-recorded fences")
    if container.line != int(source_metadata["markdownContainerLine"]):
        raise ValueError("Markdown Asymptote container moved from its manifest-recorded line")
    if container.end_line != int(source_metadata["markdownContainerEndLine"]):
        raise ValueError("Markdown Asymptote container closing line moved from its manifest-recorded line")


def extract_manual_diagram_source(raw_text: str, raw_path: str) -> str:
    """Extract an individually approved raw ``Diagram`` section.

    The 2025 AMC 12B Q10 raw source has no closing ``<asy>`` tag: the diagram
    begins after a MediaWiki Diagram heading, ends before Solution 1, and has
    a contributor attribution after the code.  Any change to that layout
    intentionally stops the build rather than silently rendering prose.
    """

    if raw_path not in MANUAL_ASY_DIAGRAMS:
        raise ValueError(f"no approved manual diagram extraction for {raw_path}")
    heading = DIAGRAM_HEADING.search(raw_text)
    if not heading:
        raise ValueError("approved Diagram heading is missing")
    solution = SOLUTION_HEADING.search(raw_text, heading.end())
    if not solution:
        raise ValueError("approved Diagram section has no following Solution heading")
    source = raw_text[heading.end() : solution.start()]
    attribution = DIAGRAM_ATTRIBUTION.search(source)
    if not attribution:
        raise ValueError("approved Diagram section has no contributor attribution boundary")
    source = source[: attribution.start()]
    if not source.strip():
        raise ValueError("approved Diagram section is empty")
    return normalized_asy_source(source)


def raw_fallback_for_placement(markdown_path: str, scope: str, block_index: int) -> dict[str, str] | None:
    """Return an explicitly approved raw recovery profile for one fence."""

    return RAW_ASY_FALLBACKS.get((markdown_path, scope, block_index))


def extract_anchored_raw_asy_source(raw_text: str, source_metadata: dict[str, Any]) -> str:
    """Extract one hash-bound legacy program from an otherwise non-``<asy>`` raw page.

    This recovery is intentionally more strict than a regular expression: the
    complete raw page hash, both anchors, their individual cardinality, their
    ordering, and the resulting normalized source hash are all manifest data.
    """

    expected_raw_hash = source_metadata.get("rawSourceSha256")
    start_anchor = source_metadata.get("rawAnchorStart")
    end_anchor = source_metadata.get("rawAnchorEnd")
    expected_source_hash = source_metadata.get("sha256")
    if not all(isinstance(value, str) and value for value in (expected_raw_hash, start_anchor, end_anchor)):
        raise ValueError("raw anchored Asymptote source lacks immutable extraction metadata")
    if sha256_bytes(raw_text.encode("utf-8")) != expected_raw_hash:
        raise ValueError("raw page no longer matches the approved anchored Asymptote recovery")
    start_count = raw_text.count(start_anchor)
    end_count = raw_text.count(end_anchor)
    if start_count != 1 or end_count != 1:
        raise ValueError(
            "approved raw Asymptote anchors are no longer unique "
            f"(start={start_count}, end={end_count})"
        )
    start = raw_text.index(start_anchor)
    end = raw_text.index(end_anchor)
    if end <= start:
        raise ValueError("approved raw Asymptote anchors are not in source order")
    source = normalized_asy_source(raw_text[start:end])
    if not isinstance(expected_source_hash, str) or sha256_bytes(source.encode("utf-8")) != expected_source_hash:
        raise ValueError("anchored raw Asymptote extraction no longer matches its manifest source hash")
    return source


def source_repair_for_placement(source_metadata: dict[str, Any]) -> str | None:
    """Return the only approved collapsed-comment repair for this placement."""

    markdown_path = source_metadata.get("markdownPath")
    scope = source_metadata.get("markdownScope")
    block_index = source_metadata.get("markdownBlockIndex")
    if not isinstance(markdown_path, str) or scope not in MARKDOWN_SCOPES or not isinstance(block_index, int):
        return None
    return SOURCE_REPAIR_PLACEMENTS.get((markdown_path, scope, block_index))


def apply_source_repair(source: str, profile_name: str) -> str:
    """Apply one hash-guarded recovery for a collapsed legacy comment line."""

    profile = SOURCE_REPAIR_PROFILES.get(profile_name)
    if profile is None:
        raise ValueError(f"unsupported Asymptote source repair: {profile_name}")
    expected_source_hash = profile["sourceSha256"]
    if sha256_bytes(source.encode("utf-8")) != expected_source_hash:
        raise ValueError(f"source repair {profile_name} does not match its approved input hash")
    transformed = source
    replacements = profile["replacements"]
    if not isinstance(replacements, tuple):
        raise ValueError(f"source repair {profile_name} has invalid replacement metadata")
    for needle, replacement in replacements:
        if transformed.count(needle) != 1:
            raise ValueError(f"source repair {profile_name} expected exactly one {needle!r}")
        transformed = transformed.replace(needle, replacement, 1)
    transformed = normalized_asy_source(transformed)
    if sha256_bytes(transformed.encode("utf-8")) != profile["resultSha256"]:
        raise ValueError(f"source repair {profile_name} did not produce its approved output hash")
    return transformed


def transform_manual_diagram_source(source: str, transform: str | None) -> str:
    """Apply a narrowly documented renderer-compatibility transform.

    Legacy Asymptote's ``pathticks`` helper is absent from the isolated Debian
    renderer.  Q10 uses exactly two calls solely to show the two halves of the
    short side are congruent.  Replace those calls with two equivalent red
    ticks at known positions on A--B; all mathematical source statements stay
    otherwise unchanged.  Failing closed on a source-layout change keeps this
    transform auditable.
    """

    if transform is None:
        return source
    if transform != "q10-explicit-midpoint-ticks-v1":
        raise ValueError(f"unsupported manual diagram transform: {transform}")
    matches = list(Q10_PATHTICKS.finditer(source))
    if [match.group("segment") for match in matches] != ["A--E", "E--B"]:
        raise ValueError("Q10 expected exactly the A--E and E--B pathticks calls")
    transformed = Q10_PATHTICKS.sub("", source)
    return normalized_asy_source(
        transformed
        + "// Compatibility replacement for the two equal-length pathticks calls.\n"
        + "draw((-0.08,0.75)--(0.08,0.75),red+linewidth(1.25));\n"
        + "draw((-0.08,0.25)--(0.08,0.25),red+linewidth(1.25));\n"
    )


def asymptote_source_for_asset(asset: dict[str, Any], repo_root: Path) -> str:
    """Reconstruct and integrity-check the source represented by an asset."""

    source_metadata = asset["source"]
    extraction = source_metadata.get("extraction")
    if extraction == "markdown-asy-fence-v1":
        source = markdown_fence_source_for_asset(asset, repo_root)
    else:
        raw_path = repo_root / source_metadata["rawPath"]
        raw_text = raw_path.read_text(encoding="utf-8", errors="replace")
        if extraction == "raw-diagram-heading-v1":
            source = extract_manual_diagram_source(raw_text, source_metadata["rawPath"])
        elif extraction == "raw-anchored-asy-v1":
            # The replacement must still target a closed emitted Markdown
            # fence, even though its renderer input is recovered from raw.
            markdown_fence_source_for_asset(asset, repo_root)
            source = extract_anchored_raw_asy_source(raw_text, source_metadata)
        else:
            scope = source_metadata.get("markdownScope")
            if scope not in MARKDOWN_SCOPES:
                raise ValueError("manifest raw Asymptote source lacks a valid markdownScope")
            matches = list(ASY_BLOCK.finditer(raw_scope_text(raw_text, scope)))
            block_index = int(source_metadata["blockIndex"])
            try:
                source = normalized_asy_source(matches[block_index - 1].group(1))
            except IndexError as error:
                raise ValueError(f"Asymptote block {block_index} is no longer present") from error
        if extraction == "raw-asy-tag-v1":
            validate_raw_asy_markdown_mapping(source_metadata, repo_root)
    if sha256_bytes(source.encode("utf-8")) != source_metadata["sha256"]:
        raise ValueError("raw Asymptote source no longer matches the asset manifest entry")
    rendered_source = apply_render_transforms(source, source_metadata)
    if sha256_bytes(rendered_source.encode("utf-8")) != source_metadata.get("renderedSourceSha256"):
        raise ValueError("transformed Asymptote source no longer matches the asset manifest entry")
    if sha256_bytes(renderable_asy_source(rendered_source).encode("utf-8")) != source_metadata.get(
        "rendererInputSha256"
    ):
        raise ValueError("Asymptote renderer input no longer matches the asset manifest entry")
    return rendered_source


def renderable_asy_source(source: str) -> str:
    """Add only portable definitions missing from older AoPS snippets."""

    return ASY_COMPATIBILITY_PRELUDE + "\n" + normalized_asy_source(source)


def strip_markdown_math_delimiters(source: str) -> str:
    """Undo the converter's illegal ``$...$`` wrapping of Asymptote tokens.

    The historical Markdown converter occasionally interpreted fragments of
    diagram source as TeX.  It inserted dollar delimiters around identifiers,
    numeric literals, and expressions (for example ``int $i = 0$``), while
    leaving valid label strings such as ``label(\"$A$\", ...)`` intact.  `$`
    has no meaning in executable Asymptote outside a quoted string, so this
    tiny lexer removes it only in code, preserving double/single quoted text
    and comments byte-for-byte.  The exact transform and hashes are recorded
    for every affected asset.
    """

    output: list[str] = []
    index = 0
    quote_character: str | None = None
    line_comment = False
    block_comment = False
    changed = False
    while index < len(source):
        character = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""
        if line_comment:
            output.append(character)
            if character == "\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            output.append(character)
            if character == "*" and following == "/":
                output.append(following)
                index += 2
                block_comment = False
            else:
                index += 1
            continue
        if quote_character is not None:
            output.append(character)
            if character == "\\" and following:
                output.append(following)
                index += 2
                continue
            if character == quote_character:
                quote_character = None
            index += 1
            continue
        if character == "/" and following == "/":
            output.extend((character, following))
            index += 2
            line_comment = True
            continue
        if character == "/" and following == "*":
            output.extend((character, following))
            index += 2
            block_comment = True
            continue
        if character in {'"', "'"}:
            output.append(character)
            quote_character = character
            index += 1
            continue
        if character == "$":
            changed = True
            index += 1
            continue
        output.append(character)
        index += 1
    return "".join(output) if changed else source


OLYMPIAD_IMPORT = re.compile(r"\bimport\s+olympiad\s*;")


def remove_olympiad_import(source: str) -> str:
    """Remove only executable ``import olympiad;`` statements.

    AoPS source commonly places the import and diagram program on one physical
    line.  Matching whole lines therefore misses the actual failing cases;
    matching blindly risks changing a label/comment.  This companion lexer to
    ``strip_markdown_math_delimiters`` scans quoted strings and both comment
    forms unchanged, recognizing the import statement solely in code state.
    """

    output: list[str] = []
    index = 0
    quote_character: str | None = None
    line_comment = False
    block_comment = False
    changed = False
    while index < len(source):
        character = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""
        if line_comment:
            output.append(character)
            if character == "\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            output.append(character)
            if character == "*" and following == "/":
                output.append(following)
                index += 2
                block_comment = False
            else:
                index += 1
            continue
        if quote_character is not None:
            output.append(character)
            if character == "\\" and following:
                output.append(following)
                index += 2
                continue
            if character == quote_character:
                quote_character = None
            index += 1
            continue
        if character == "/" and following == "/":
            output.extend((character, following))
            index += 2
            line_comment = True
            continue
        if character == "/" and following == "*":
            output.extend((character, following))
            index += 2
            block_comment = True
            continue
        if character in {'"', "'"}:
            output.append(character)
            quote_character = character
            index += 1
            continue
        match = OLYMPIAD_IMPORT.match(source, index)
        if match:
            output.append("\n")
            index = match.end()
            changed = True
            continue
        output.append(character)
        index += 1
    return "".join(output) if changed else source


def render_transforms_for_source(source: str, source_metadata: dict[str, Any]) -> list[str]:
    """Return the deterministic, narrowly scoped source repairs in use."""

    transforms: list[str] = []
    source_repair = source_metadata.get("sourceRepair")
    if source_repair:
        if not isinstance(source_repair, str):
            raise ValueError("sourceRepair must be a repair identifier")
        # Run it during discovery as well, so a profile/source mismatch fails
        # before it is ever recorded in a manifest.
        apply_source_repair(source, source_repair)
        transforms.append(source_repair)
    after_source_repair = apply_source_repair(source, source_repair) if source_repair else source
    if source_metadata.get("renderTransform"):
        transforms.append(str(source_metadata["renderTransform"]))
    after_manual = transform_manual_diagram_source(after_source_repair, source_metadata.get("renderTransform"))
    if strip_markdown_math_delimiters(after_manual) != after_manual:
        transforms.append("strip-markdown-math-delimiters-v1")
    if remove_olympiad_import(after_manual) != after_manual:
        transforms.append("replace-olympiad-import-with-compatibility-prelude-v1")
    return transforms


def apply_render_transforms(source: str, source_metadata: dict[str, Any]) -> str:
    """Apply only transforms explicitly recorded in a manifest source entry."""

    transforms = source_metadata.get("renderTransforms", [])
    if not isinstance(transforms, list) or any(not isinstance(item, str) for item in transforms):
        raise ValueError("renderTransforms must be an array of transform identifiers")
    source_repair = source_metadata.get("sourceRepair")
    if source_repair is not None and not isinstance(source_repair, str):
        raise ValueError("sourceRepair must be a repair identifier")
    if source_repair and source_repair not in transforms:
        raise ValueError("sourceRepair is not recorded in renderTransforms")
    transformed = apply_source_repair(source, source_repair) if source_repair else source
    transformed = transform_manual_diagram_source(transformed, source_metadata.get("renderTransform"))
    if "strip-markdown-math-delimiters-v1" in transforms:
        transformed = strip_markdown_math_delimiters(transformed)
    if "replace-olympiad-import-with-compatibility-prelude-v1" in transforms:
        transformed = remove_olympiad_import(transformed)
    unknown = set(transforms) - {
        "strip-markdown-math-delimiters-v1",
        "replace-olympiad-import-with-compatibility-prelude-v1",
        str(source_metadata.get("renderTransform", "")),
        source_repair or "",
    }
    if unknown:
        raise ValueError(f"unsupported Asymptote render transforms: {', '.join(sorted(unknown))}")
    return normalized_asy_source(transformed)


def asset_id(location: SourceLocation, kind: str, ordinal: int, *, scope: str = "prompt") -> str:
    if scope not in MARKDOWN_SCOPES:
        raise ValueError(f"unsupported asset Markdown scope: {scope!r}")
    scope_prefix = "" if scope == "prompt" else f"{scope}-"
    return f"{location.form_slug}-q{location.number:02d}-{scope_prefix}{kind}-{ordinal:02d}"


def replacement_for_output(output: str) -> dict[str, str]:
    """Describe the public, same-origin location of a generated media file.

    ``sourceMarkdownUrl`` deliberately remains relative.  It works when a
    prompt is presented below the portal's ``/amc12/practice/`` mount as well
    as when the static root is served directly; ``publicUrl`` is available to
    API/static-deployment code that wants a root-relative URL instead.
    """

    return {
        "localPath": f"historical-media/{output}",
        "publicUrl": f"/historical-media/{output}",
        "sourceMarkdownUrl": f"../historical-media/{output}",
    }


def planned_asymptote_asset(
    location: SourceLocation,
    ordinal: int,
    source: str,
    source_metadata: dict[str, Any],
    *,
    scope: str,
) -> dict[str, Any]:
    """Make one deterministic Asymptote render job description."""

    scope_suffix = "" if scope == "prompt" else f"-{scope}"
    output = f"assets/{location.form_slug}/problem-{location.number:02d}{scope_suffix}-asy-{ordinal:02d}.svg"
    metadata = {"markdownScope": scope, **source_metadata}
    # Archive validation deliberately requires every visual to declare whether
    # it replaces Markdown in-place or is an append-only requiredMedia item.
    # Most diagrams are in-place; the audited raw Q10 extraction provides its
    # explicit requiredMedia placement in ``source_metadata``.
    metadata.setdefault("placement", "markdown")
    source_repair = source_repair_for_placement(metadata)
    if source_repair:
        metadata["sourceRepair"] = source_repair
    transforms = render_transforms_for_source(source, metadata)
    metadata["renderTransforms"] = transforms
    rendered_source = apply_render_transforms(source, metadata)
    return {
        "id": asset_id(location, "asy", ordinal, scope=scope),
        "kind": "asymptote",
        "source": {
            "compatibilityProfile": ASY_COMPATIBILITY_PROFILE,
            **metadata,
            "rendererInputSha256": sha256_bytes(renderable_asy_source(rendered_source).encode("utf-8")),
            "renderedSourceSha256": sha256_bytes(rendered_source.encode("utf-8")),
            "sha256": sha256_bytes(source.encode("utf-8")),
        },
        "output": output,
        "replacement": replacement_for_output(output),
        "status": "planned",
        "unsafeSource": bool(UNSAFE_ASY.search(source)),
    }


def normalized_aops_reference(reference: str) -> str:
    """Turn an emitted AoPS URL into a safe HTTPS fetch URL without losing its original reference."""

    try:
        parsed = urlsplit(reference)
        port = parsed.port
    except ValueError as error:
        raise ValueError(f"invalid AoPS Markdown reference: {reference!r}") from error
    if (
        parsed.scheme not in {"http", "https"}
        or parsed.hostname != "artofproblemsolving.com"
        or parsed.username is not None
        or parsed.password is not None
        or port not in {None, 80, 443}
    ):
        raise ValueError(f"Markdown reference is not an AoPS URL: {reference!r}")
    # AoPS exports occasionally insert a left-to-right mark into File titles.
    # It is invisible in Markdown but cannot be encoded in an HTTP request;
    # remove only Unicode format controls while retaining the original exact
    # markdownReference for replacement provenance.
    clean_path = "".join(character for character in parsed.path if unicodedata.category(character) != "Cf")
    clean_query = "".join(character for character in parsed.query if unicodedata.category(character) != "Cf")
    return urlunsplit(("https", "artofproblemsolving.com", clean_path, clean_query, ""))


def markdown_link_destinations(markdown: str) -> Iterable[tuple[int, str]]:
    """Yield Markdown destinations without truncating balanced URL parentheses.

    AoPS file names can contain literal parentheses (for example
    ``Desmos-graph_(1).png``).  A regular expression ending at the first `)`
    silently fetches a different/nonexistent file, so this deliberately small
    scanner follows Markdown's balanced-parenthesis destination rule.
    """

    for opening in MARKDOWN_LINK_OPENING.finditer(markdown):
        index = opening.end()
        depth = 1
        destination: list[str] = []
        while index < len(markdown):
            character = markdown[index]
            if character == "\\" and index + 1 < len(markdown):
                destination.extend((character, markdown[index + 1]))
                index += 2
                continue
            if character == "(":
                depth += 1
            elif character == ")":
                depth -= 1
                if depth == 0:
                    break
            destination.append(character)
            index += 1
        if depth == 0:
            destination_text = "".join(destination).strip()
            # A Markdown link may include an optional title after its URL.
            # Parentheses in the URL were handled above; at top level only,
            # whitespace begins the title.  Keep this in step with archive's
            # replacement scanner so discovery cannot mirror a URL that the
            # archive later considers a different reference.
            nested_parentheses = 0
            for title_start, character in enumerate(destination_text):
                if character == "(":
                    nested_parentheses += 1
                elif character == ")" and nested_parentheses:
                    nested_parentheses -= 1
                elif character.isspace() and nested_parentheses == 0:
                    destination_text = destination_text[:title_start]
                    break
            if destination_text:
                yield opening.start(), destination_text


def _character_is_escaped(value: str, index: int) -> bool:
    """Return whether a Markdown punctuation character has an odd slash prefix."""

    slash_count = 0
    cursor = index - 1
    while cursor >= 0 and value[cursor] == "\\":
        slash_count += 1
        cursor -= 1
    return slash_count % 2 == 1


def markdown_image_references_in_markdown(markdown: str) -> list[tuple[str, str]]:
    """Return emitted Markdown image destinations in source order.

    ``markdown_link_destinations`` deliberately handles ordinary links too;
    this narrow wrapper retains only actual, unescaped ``![](...)`` image
    syntax.  Archive replacement needs the original destination spelling, so
    it is never normalized here.
    """

    images: list[tuple[str, str]] = []
    for bracket_index, reference in markdown_link_destinations(markdown):
        marker_index = bracket_index - 1
        if (
            marker_index >= 0
            and markdown[marker_index] == "!"
            and not _character_is_escaped(markdown, marker_index)
        ):
            images.append((reference, "markdown-image"))
    return images


def resolve_local_image_reference(
    reference: str,
    *,
    markdown_path: str,
    repo_root: Path,
) -> tuple[str, Path]:
    """Resolve one strict repository-local Markdown image reference.

    The archive is served below two different static mounts, so the source
    uses ``../<repo-relative form/media path>``.  Accept only that exact
    spelling and only an image owned by the same historical form; otherwise a
    harmless-looking relative URL could become an unreviewed same-origin
    dependency or escape through a symlink/traversal trick.
    """

    if not isinstance(reference, str) or not reference.startswith(LOCAL_SOURCE_REFERENCE_PREFIX):
        raise ValueError(f"local Markdown image must begin with {LOCAL_SOURCE_REFERENCE_PREFIX!r}: {reference!r}")
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or parsed.path != reference:
        raise ValueError(f"local Markdown image reference is not a plain path: {reference!r}")
    local_source_path = reference.removeprefix(LOCAL_SOURCE_REFERENCE_PREFIX)
    candidate_relative = Path(local_source_path)
    if (
        not local_source_path
        or "\\" in local_source_path
        or not SAFE_LOCAL_SOURCE_PATH.fullmatch(local_source_path)
        or candidate_relative.is_absolute()
        or any(part in {".", ".."} for part in candidate_relative.parts)
    ):
        raise ValueError(f"local Markdown image path is unsafe: {reference!r}")
    markdown_relative = Path(markdown_path)
    if (
        not markdown_path.endswith(".md")
        or markdown_relative.is_absolute()
        or len(markdown_relative.parts) < 2
        or any(part in {".", ".."} for part in markdown_relative.parts)
    ):
        raise ValueError(f"local image has an unsafe Markdown source path: {markdown_path!r}")
    form_directory = markdown_relative.parts[0]
    if len(candidate_relative.parts) < 3 or candidate_relative.parts[:2] != (form_directory, "media"):
        raise ValueError(f"local Markdown image must stay in {form_directory}/media: {reference!r}")
    source_file = repo_root / candidate_relative
    # A source symlink could make a checked-in relative spelling point outside
    # the reviewed source tree after discovery.  Reject it rather than relying
    # solely on the final resolved-path check.
    current = repo_root
    for component in candidate_relative.parts:
        current = current / component
        if current.is_symlink():
            raise ValueError(f"local Markdown image source must not traverse a symlink: {local_source_path!r}")
    if not source_file.is_file():
        raise ValueError(f"local Markdown image source is missing: {local_source_path!r}")
    try:
        source_file.resolve().relative_to(repo_root.resolve())
    except ValueError as error:
        raise ValueError(f"local Markdown image source escapes the repository: {local_source_path!r}") from error
    if source_file.suffix.lower() not in LOCAL_IMAGE_MIME_TYPES:
        raise ValueError(f"local Markdown image has an unsupported type: {local_source_path!r}")
    return local_source_path, source_file


def validate_local_image(path: Path) -> str:
    """Validate one supported local image without invoking a host decoder."""

    mime_type = LOCAL_IMAGE_MIME_TYPES.get(path.suffix.lower())
    if mime_type is None:
        raise ValueError(f"unsupported local image extension: {path.suffix!r}")
    if mime_type == "image/svg+xml":
        validate_svg(path)
    else:
        validate_png(path)
    return mime_type


def local_image_source_for_asset(asset: dict[str, Any], repo_root: Path) -> tuple[Path, str]:
    """Reconstruct and verify a manifest-bound local image source."""

    source = asset.get("source")
    if not isinstance(source, dict):
        raise ValueError("local image asset source is not an object")
    markdown_path = source.get("markdownPath")
    reference = source.get("markdownReference")
    declared_path = source.get("localSourcePath")
    expected_hash = source.get("sourceSha256")
    if not isinstance(markdown_path, str) or not isinstance(reference, str):
        raise ValueError("local image asset lacks Markdown source metadata")
    local_source_path, source_file = resolve_local_image_reference(
        reference,
        markdown_path=markdown_path,
        repo_root=repo_root,
    )
    if declared_path != local_source_path:
        raise ValueError("local image source path does not match its Markdown reference")
    if not isinstance(expected_hash, str) or sha256_file(source_file) != expected_hash:
        raise ValueError("local image source hash does not match the manifest")
    return source_file, validate_local_image(source_file)


def is_aops_visual_reference(reference: str) -> bool:
    """Return whether a Markdown destination is an allowed AoPS visual URL."""

    try:
        normalized_aops_reference(reference)
    except ValueError:
        return False
    parsed = urlsplit(reference)
    page_title = unquote(parsed.path.rsplit("/", 1)[-1])
    return bool(
        parsed.path.startswith("/wiki/images/")
        or (
            parsed.path.startswith("/wiki/index.php/")
            and page_title.lower().startswith(("file:", "image:"))
        )
    )


def local_image_references_in_markdown(markdown: str) -> list[tuple[str, str]]:
    """Return strict local image references and reject every unknown image URL.

    AoPS visuals have their own download path.  Any other Markdown image must
    be a repository-local ``../form/media/...`` reference.  Failing here
    avoids silently leaving an arbitrary same-origin source visual in the
    student-facing archive output.
    """

    local: list[tuple[str, str]] = []
    for reference, syntax in markdown_image_references_in_markdown(markdown):
        if reference.startswith(LOCAL_SOURCE_REFERENCE_PREFIX):
            local.append((reference, syntax))
        elif not is_aops_visual_reference(reference):
            raise ValueError(f"unsupported Markdown image reference: {reference!r}")
    return local


def visual_references_in_markdown(markdown: str) -> list[tuple[str, str]]:
    """Return every emitted AoPS visual reference, including HTML image tags.

    HTML image markup is deliberately not left for a browser to fetch.  It is
    either an AoPS visual that is mirrored exactly like a Markdown link, or a
    release-blocking unsupported source.  The returned order is source order
    within the current Markdown scope.
    """

    matches: list[tuple[int, str, str]] = []
    for position, reference in markdown_link_destinations(markdown):
        if is_aops_visual_reference(reference):
            matches.append((position, reference, "markdown-link"))
    for match in HTML_IMAGE_REFERENCE.finditer(markdown):
        reference = match.group("url")
        # Archive replacement intentionally handles Markdown destinations
        # only.  Do not advertise an HTML image as mirrored until archive has
        # an equivalent exact replacement path; blocking here prevents a later
        # safety gate from discovering an unhandled external visual.
        raise ValueError(f"HTML image markup is unsupported until it has an archive replacement: {reference!r}")
    return [(reference, syntax) for _position, reference, syntax in sorted(matches)]


def planned_remote_asset(
    location: SourceLocation,
    ordinal: int,
    *,
    scope: str,
    markdown_path: str,
    markdown_reference: str,
    markdown_syntax: str,
    raw_path: str,
    required_media_index: int | None = None,
) -> dict[str, Any]:
    """Describe a scope-local AoPS visual using its exact Markdown URL."""

    fetch_url = normalized_aops_reference(markdown_reference)
    path = urlsplit(fetch_url).path
    scope_suffix = "" if scope == "prompt" else f"-{scope}"
    output = f"assets/{location.form_slug}/problem-{location.number:02d}{scope_suffix}-aops-{ordinal:02d}.png"
    source: dict[str, Any] = {
        "markdownBlockIndex": ordinal if required_media_index is None else 0,
        "markdownPath": markdown_path,
        "markdownReference": markdown_reference,
        "markdownSyntax": markdown_syntax,
        "markdownScope": scope,
        "placement": "markdown",
        "rawPath": raw_path,
    }
    if required_media_index is not None:
        source.update({"placement": "requiredMedia", "requiredMediaIndex": required_media_index})
    if path.startswith("/wiki/index.php/"):
        title = unquote(path.rsplit("/", 1)[-1])
        if not title.lower().startswith(("file:", "image:")):
            raise ValueError(f"AoPS file-page URL lacks File/Image title: {markdown_reference!r}")
        filename = title.split(":", 1)[1]
        source.update({"filename": filename, "pageUrl": fetch_url})
        kind = "aops-file"
    elif path.startswith("/wiki/images/"):
        source["downloadUrl"] = fetch_url
        kind = "remote-image"
    else:
        raise ValueError(f"AoPS Markdown URL is not a permitted image reference: {markdown_reference!r}")
    return {
        "id": asset_id(location, "aops", ordinal, scope=scope),
        "kind": kind,
        "source": source,
        "output": output,
        "replacement": replacement_for_output(output),
        "status": "planned",
    }


def planned_local_image_asset(
    location: SourceLocation,
    ordinal: int,
    *,
    scope: str,
    markdown_path: str,
    markdown_reference: str,
    markdown_syntax: str,
    raw_path: str,
    repo_root: Path,
) -> dict[str, Any]:
    """Describe one hash-bound repository-local Markdown image placement."""

    local_source_path, source_file = resolve_local_image_reference(
        markdown_reference,
        markdown_path=markdown_path,
        repo_root=repo_root,
    )
    # Validate before the source is staged or copied.  SVG validation rejects
    # active/external content; PNG validation checks framing, CRCs, and size.
    validate_local_image(source_file)
    extension = source_file.suffix.lower()
    scope_suffix = "" if scope == "prompt" else f"-{scope}"
    output = f"assets/{location.form_slug}/problem-{location.number:02d}{scope_suffix}-local-{ordinal:02d}{extension}"
    return {
        "id": asset_id(location, "local", ordinal, scope=scope),
        "kind": "local-image",
        "source": {
            "localSourcePath": local_source_path,
            "markdownBlockIndex": ordinal,
            "markdownPath": markdown_path,
            "markdownReference": markdown_reference,
            "markdownScope": scope,
            "markdownSyntax": markdown_syntax,
            "placement": "markdown",
            "rawPath": raw_path,
            "sourceSha256": sha256_file(source_file),
        },
        "output": output,
        "replacement": replacement_for_output(output),
        "status": "planned",
    }


def _alias_reused_renders(assets: list[dict[str, Any]]) -> None:
    """Reuse byte-identical renderer inputs while retaining one entry per placement.

    A source placement remains a distinct manifest item even when its SVG/PNG
    is shared.  ``renderAliasOf`` therefore preserves archive replacement
    cardinality and provenance, while the one physical output is rendered and
    validated only once.
    """

    primary_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    for asset in assets:
        source = asset["source"]
        if asset["kind"] == "asymptote":
            key = ("asymptote", str(source["rendererInputSha256"]))
        elif asset["kind"] == "aops-file":
            key = ("aops-file", str(source["pageUrl"]))
        elif asset["kind"] == "remote-image":
            key = ("remote-image", str(source["downloadUrl"]))
        elif asset["kind"] == "local-image":
            # Hash plus output type is a safe copy alias: it proves identical
            # bytes while avoiding an SVG/PNG suffix mismatch in the shared
            # immutable output path.
            key = ("local-image", f"{source['sourceSha256']}:{Path(asset['output']).suffix.lower()}")
        else:
            raise ValueError(f"unsupported media kind for render aliasing: {asset['kind']!r}")
        primary = primary_by_key.get(key)
        if primary is None:
            primary_by_key[key] = asset
            continue
        asset["output"] = primary["output"]
        asset["replacement"] = replacement_for_output(asset["output"])
        asset["renderAliasOf"] = primary["id"]


def discover_media_inventory(repo_root: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Discover all archive-emitted prompt and solution media, fail-closed.

    Every closed Asymptote fence receives an entry scoped to ``prompt`` or
    ``solution``.  Fragmented `<asy>` wrappers intentionally create aliases
    to one canonical raw render: archive replacement still has exactly one
    asset per fenced block, but does not render a partial program repeatedly.
    """

    assets: list[dict[str, Any]] = []
    overrides = load_historical_overrides(repo_root)
    scope_state: dict[str, dict[str, Any]] = {
        scope: {
            "asymptoteFenceCount": 0,
            "closedAsymptoteFenceCount": 0,
            "localImageCount": 0,
            "renderedAsymptoteFenceCount": 0,
            "resolvedWithoutMediaAsymptoteFences": [],
            "unclosedAsymptoteFences": [],
            "unresolvedAsymptoteFences": [],
        }
        for scope in sorted(MARKDOWN_SCOPES)
    }
    expected_closed_references: set[tuple[str, str, int]] = set()
    rendered_fence_references: set[tuple[str, str, int]] = set()

    for location in iter_source_locations(repo_root):
        raw_text = location.raw_path.read_text(encoding="utf-8", errors="replace")
        raw_ref = relative_to_root(location.raw_path, repo_root)
        markdown_ref = relative_to_root(location.markdown_path, repo_root)
        override = overrides.get(markdown_ref, {})
        for scope in ("prompt", "solution"):
            markdown = markdown_scope_for_location(location, repo_root, scope, overrides=overrides)
            fences = extract_asymptote_fences(markdown)
            containers = extract_asymptote_containers(markdown, fences)
            state = scope_state[scope]
            state["asymptoteFenceCount"] += len(fences)
            state["closedAsymptoteFenceCount"] += sum(fence.closed for fence in fences)
            expected_closed_references.update(
                (markdown_ref, scope, fence.block_index) for fence in fences if fence.closed
            )

            raw_blocks = list(ASY_BLOCK.finditer(raw_scope_text(raw_text, scope)))
            renderable_containers = [
                container for container in containers if container.closed and container.fence_indexes
            ]
            covered_fence_indexes: set[int] = set()
            asy_ordinal = 0
            if raw_blocks and len(raw_blocks) == len(renderable_containers):
                for raw_block_index, (raw_block, container) in enumerate(
                    zip(raw_blocks, renderable_containers), start=1
                ):
                    source = normalized_asy_source(raw_block.group(1))
                    # One original <asy> container represents one diagram.
                    # The converter may have split it into several Markdown
                    # fences, but replacing each fence would display the same
                    # completed SVG multiple times.  Archive consumes the
                    # complete container/fence list as one placement.
                    first_fence_index = container.fence_indexes[0]
                    asy_ordinal += 1
                    assets.append(
                        planned_asymptote_asset(
                            location,
                            asy_ordinal,
                            source,
                            {
                                "blockIndex": raw_block_index,
                                "extraction": "raw-asy-tag-v1",
                                "line": fences[first_fence_index - 1].line,
                                "markdownBlockIndex": first_fence_index,
                                "markdownContainerEndLine": container.end_line,
                                "markdownContainerIndex": container.container_index,
                                "markdownContainerLine": container.line,
                                "markdownEndLine": fences[first_fence_index - 1].end_line,
                                "markdownFenceIndexes": list(container.fence_indexes),
                                "markdownPath": markdown_ref,
                                "rawPath": raw_ref,
                            },
                            scope=scope,
                        )
                    )
                    rendered_fence_references.update(
                        (markdown_ref, scope, markdown_block_index)
                        for markdown_block_index in container.fence_indexes
                    )
                    covered_fence_indexes.update(container.fence_indexes)
            elif raw_blocks and renderable_containers:
                state["unresolvedAsymptoteFences"].append(
                    {
                        "markdownPath": markdown_ref,
                        "markdownScope": scope,
                        "reason": "raw-asy-to-markdown-container-mapping-is-ambiguous",
                        "status": "unresolved",
                    }
                )

            for fence in fences:
                reference = (markdown_ref, scope, fence.block_index)
                if scope == "prompt" and markdown_ref in NON_RENDERABLE_ASY_FENCE_RESOLUTIONS:
                    state["resolvedWithoutMediaAsymptoteFences"].append(
                        {
                            "line": fence.line,
                            "markdownBlockIndex": fence.block_index,
                            "markdownPath": markdown_ref,
                            "markdownScope": scope,
                            "reason": NON_RENDERABLE_ASY_FENCE_RESOLUTIONS[markdown_ref],
                            "status": "resolved",
                        }
                    )
                    continue
                if not fence.closed:
                    if scope == "prompt" and raw_ref in MANUAL_ASY_DIAGRAMS:
                        state["unclosedAsymptoteFences"].append(
                            {
                                "line": fence.line,
                                "markdownBlockIndex": fence.block_index,
                                "markdownPath": markdown_ref,
                                "markdownScope": scope,
                                "reason": "rendered-via-approved-raw-diagram-override",
                                "status": "resolved",
                            }
                        )
                    else:
                        entry = {
                            "line": fence.line,
                            "markdownBlockIndex": fence.block_index,
                            "markdownPath": markdown_ref,
                            "markdownScope": scope,
                            "reason": "unclosed-asymptote-fence-without-approved-resolution",
                            "status": "unresolved",
                        }
                        state["unclosedAsymptoteFences"].append(entry)
                        state["unresolvedAsymptoteFences"].append(entry)
                    continue
                if fence.block_index in covered_fence_indexes:
                    continue
                asy_ordinal += 1
                source = fence.source
                source_metadata: dict[str, Any] = {
                    "blockIndex": fence.block_index,
                    "extraction": "markdown-asy-fence-v1",
                    "line": fence.line,
                    "markdownBlockIndex": fence.block_index,
                    "markdownEndLine": fence.end_line,
                    "markdownPath": markdown_ref,
                    "rawPath": raw_ref,
                }
                raw_fallback = raw_fallback_for_placement(markdown_ref, scope, fence.block_index)
                if raw_fallback is not None:
                    # Keep the original fence's position/provenance for
                    # archive replacement, but feed the renderer only the
                    # page-hash-bound raw program defined above.
                    source_metadata.update({"extraction": "raw-anchored-asy-v1", **raw_fallback})
                    source = extract_anchored_raw_asy_source(
                        raw_text,
                        {**source_metadata, "sha256": raw_fallback["sourceSha256"]},
                    )
                assets.append(
                    planned_asymptote_asset(
                        location,
                        asy_ordinal,
                        source,
                        source_metadata,
                        scope=scope,
                    )
                )
                rendered_fence_references.add(reference)

            # Q10's source fence is intentionally unclosed.  The repair is
            # appended by archive's requiredMedia contract, not fence-replaced.
            if scope == "prompt" and raw_ref in MANUAL_ASY_DIAGRAMS:
                manual_diagram = MANUAL_ASY_DIAGRAMS[raw_ref]
                source = extract_manual_diagram_source(raw_text, raw_ref)
                asy_ordinal += 1
                assets.append(
                    planned_asymptote_asset(
                        location,
                        asy_ordinal,
                        source,
                        {
                            "blockIndex": asy_ordinal,
                            "extraction": manual_diagram["extraction"],
                            "markdownBlockIndex": 0,
                            "markdownPath": markdown_ref,
                            "placement": "requiredMedia",
                            "requiredMediaIndex": 1,
                            "rawPath": raw_ref,
                            "renderTransform": manual_diagram["renderTransform"],
                        },
                        scope=scope,
                    )
                )

            references = visual_references_in_markdown(markdown)
            for ordinal, (reference, syntax) in enumerate(references, start=1):
                assets.append(
                    planned_remote_asset(
                        location,
                        ordinal,
                        scope=scope,
                        markdown_path=markdown_ref,
                        markdown_reference=reference,
                        markdown_syntax=syntax,
                        raw_path=raw_ref,
                    )
                )
            local_references = local_image_references_in_markdown(markdown)
            state["localImageCount"] += len(local_references)
            for ordinal, (reference, syntax) in enumerate(local_references, start=1):
                assets.append(
                    planned_local_image_asset(
                        location,
                        ordinal,
                        scope=scope,
                        markdown_path=markdown_ref,
                        markdown_reference=reference,
                        markdown_syntax=syntax,
                        raw_path=raw_ref,
                        repo_root=repo_root,
                    )
                )

        # RequiredMedia is deliberately outside emitted Markdown; preserve it
        # as a scope-labelled append-only asset for archive's repair pathway.
        required_media = override.get("requiredMedia", [])
        if required_media:
            if not isinstance(required_media, list):
                raise ValueError(f"override {markdown_ref} requiredMedia must be an array")
            existing_prompt_aops = sum(
                asset["source"].get("markdownScope") == "prompt"
                and asset["kind"] in {"aops-file", "remote-image"}
                for asset in assets
                if asset["id"].startswith(f"{location.form_slug}-q{location.number:02d}-")
            )
            for required_index, item in enumerate(required_media, start=1):
                if not isinstance(item, dict):
                    raise ValueError(f"override {markdown_ref} has invalid requiredMedia entry")
                if "sourceUrl" not in item:
                    # The sole source-less requiredMedia record is Q10's
                    # audited raw Diagram extraction above.  It is not a
                    # remote fetch and must not be mistaken for one.
                    if raw_ref in MANUAL_ASY_DIAGRAMS and item.get("placement") == "prompt":
                        continue
                    raise ValueError(f"override {markdown_ref} requiredMedia lacks sourceUrl")
                if not isinstance(item["sourceUrl"], str):
                    raise ValueError(f"override {markdown_ref} has invalid requiredMedia sourceUrl")
                required_fetch_url = normalized_aops_reference(item["sourceUrl"])
                already_placed = any(
                    asset["source"].get("markdownScope") == "prompt"
                    and asset["source"].get("placement") != "requiredMedia"
                    and asset["kind"] in {"aops-file", "remote-image"}
                    and normalized_aops_reference(asset["source"]["markdownReference"]) == required_fetch_url
                    for asset in assets
                    if asset["id"].startswith(f"{location.form_slug}-q{location.number:02d}-")
                )
                if already_placed:
                    # Archive recognizes the normal scoped placement as
                    # satisfying this override requirement.  Do not mirror
                    # and display an otherwise identical diagram twice.
                    continue
                assets.append(
                    planned_remote_asset(
                        location,
                        existing_prompt_aops + required_index,
                        scope="prompt",
                        markdown_path=markdown_ref,
                        markdown_reference=item["sourceUrl"],
                        markdown_syntax="required-media",
                        raw_path=raw_ref,
                        required_media_index=required_index,
                    )
                )

    for markdown_path, scope, block_index in sorted(expected_closed_references - rendered_fence_references):
        state = scope_state[scope]
        resolved = {
            (entry["markdownPath"], entry["markdownScope"], int(entry["markdownBlockIndex"]))
            for entry in state["resolvedWithoutMediaAsymptoteFences"]
        }
        if (markdown_path, scope, block_index) in resolved:
            continue
        state["unresolvedAsymptoteFences"].append(
            {
                "markdownBlockIndex": block_index,
                "markdownPath": markdown_path,
                "markdownScope": scope,
                "reason": "closed-asymptote-fence-has-no-rendering-asset",
                "status": "unresolved",
            }
        )
    for scope, state in scope_state.items():
        state["renderedAsymptoteFenceCount"] = sum(
            1 for _path, reference_scope, _block in rendered_fence_references if reference_scope == scope
        )

    _alias_reused_renders(assets)
    prompt = scope_state["prompt"]
    inventory = {
        "scopes": scope_state,
        # Retain these names during the archive migration so old diagnostic
        # tooling still reports the prompt gate it was built around.
        "closedPromptAsymptoteFenceCount": prompt["closedAsymptoteFenceCount"],
        "localImageCount": sum(scope["localImageCount"] for scope in scope_state.values()),
        "promptAsymptoteFenceCount": prompt["asymptoteFenceCount"],
        "renderedPromptAsymptoteFenceCount": prompt["renderedAsymptoteFenceCount"],
        "resolvedWithoutMediaPromptAsymptoteFences": prompt["resolvedWithoutMediaAsymptoteFences"],
        "unclosedPromptAsymptoteFences": prompt["unclosedAsymptoteFences"],
        "unresolvedPromptAsymptoteFences": prompt["unresolvedAsymptoteFences"],
    }
    return assets, inventory


def discover_assets(repo_root: Path) -> list[dict[str, Any]]:
    """Compatibility wrapper for callers that only need renderable assets."""

    return discover_media_inventory(repo_root)[0]


def source_file_for_asset(asset: dict[str, Any]) -> str:
    output_name = Path(asset["output"]).name
    return f"{asset['id']}-{output_name.removesuffix('.svg')}.asy"


def safe_url(url: str) -> bool:
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError:
        return False
    if (
        parsed.scheme != "https"
        or parsed.hostname != "artofproblemsolving.com"
        or parsed.username is not None
        or parsed.password is not None
        or port not in {None, 443}
    ):
        return False
    decoded_path = parsed.path
    if not decoded_path.startswith("/wiki/images/") or ".." in decoded_path.split("/"):
        return False
    extension = Path(decoded_path).suffix.lower()
    return extension in {".png", ".gif", ".jpg", ".jpeg"}


def safe_page_url(url: str) -> bool:
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError:
        return False
    return bool(
        parsed.scheme == "https"
        and parsed.hostname == "artofproblemsolving.com"
        and parsed.username is None
        and parsed.password is None
        and port in {None, 443}
        and parsed.path.startswith("/wiki/index.php/")
        and ".." not in parsed.path.split("/")
    )


def original_image_url(page_url: str, html: str) -> str:
    if not safe_page_url(page_url):
        raise ValueError("AoPS page URL is outside the permitted page path")
    parser = HrefParser()
    parser.feed(html)
    parser.close()
    candidates = [urljoin(page_url, href) for href in parser.hrefs]
    originals = [url for url in candidates if safe_url(url) and "/wiki/images/thumb/" not in urlsplit(url).path]
    if not originals:
        raise ValueError("AoPS file page did not expose a permitted original image URL")
    return originals[0]


def fetch_limited(request: Request) -> tuple[bytes, str | None]:
    """Fetch politely, honouring bounded server-directed 429 retries."""

    global _last_aops_request_at
    for attempt in range(4):
        try:
            wait_seconds = AOPS_REQUEST_INTERVAL_SECONDS - (time.monotonic() - _last_aops_request_at)
            if wait_seconds > 0:
                time.sleep(wait_seconds)
            _last_aops_request_at = time.monotonic()
            # urllib normally follows 30x redirects automatically.  Refusing
            # them means every fetched byte remains at the host/path checked by
            # the caller, rather than silently crossing an untrusted redirect.
            with NO_REDIRECT_OPENER.open(request, timeout=45) as response:
                declared = response.headers.get("Content-Length")
                if declared and int(declared) > MAX_DOWNLOAD_BYTES:
                    raise ValueError(f"remote response exceeds {MAX_DOWNLOAD_BYTES} byte limit")
                raw = response.read(MAX_DOWNLOAD_BYTES + 1)
                if len(raw) > MAX_DOWNLOAD_BYTES:
                    raise ValueError(f"remote response exceeds {MAX_DOWNLOAD_BYTES} byte limit")
                return raw, response.headers.get_content_charset()
        except HTTPError as error:
            if error.code != 429 or attempt == 3:
                raise
            retry_after = error.headers.get("Retry-After", "")
            try:
                delay = float(retry_after)
            except ValueError:
                delay = 2.0 * (attempt + 1)
            time.sleep(min(max(delay, 1.0), 15.0))
    raise AssertionError("unreachable retry loop")


def download_bytes(url: str) -> bytes:
    if not safe_url(url):
        raise ValueError("AoPS image URL is outside the permitted original-image path")
    request = Request(url, headers={"Accept": "image/*", "User-Agent": USER_AGENT})
    raw, _ = fetch_limited(request)
    return raw


def fetch_page(page_url: str) -> str:
    if not safe_page_url(page_url):
        raise ValueError("AoPS page URL is outside the permitted page path")
    request = Request(
        page_url,
        headers={"Accept": "text/html", "User-Agent": "Mozilla/5.0 AMC12PracticeMedia/1.0"},
    )
    raw, charset = fetch_limited(request)
    if len(raw) > MAX_DOWNLOAD_BYTES:
        raise ValueError("AoPS file page exceeds size limit")
    return raw.decode(charset or "utf-8", errors="replace")


def detect_raster_type(payload: bytes) -> str:
    if payload.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if payload.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if payload.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    raise ValueError("download is not a permitted PNG, GIF, or JPEG image")


def prepare_sources_and_downloads(
    assets: list[dict[str, Any]], repo_root: Path, staging: Path, download_cache: Path
) -> list[dict[str, Any]]:
    sources_root = staging / "sources"
    downloads_root = staging / "downloads"
    jobs: list[dict[str, Any]] = []
    for asset in assets:
        # Aliases are placement records, not additional renderer jobs.  Their
        # success/hash are copied from the verified primary result below.
        if asset.get("renderAliasOf"):
            continue
        if asset["kind"] == "asymptote":
            try:
                source = asymptote_source_for_asset(asset, repo_root)
                if asset["unsafeSource"]:
                    asset["status"] = "blocked-unsafe-asymptote"
                    asset["error"] = "source includes a prohibited file or process operation"
                    continue
                source_relative = Path(asset["source"]["rawPath"]).with_suffix("").with_suffix("")
                target = sources_root / source_relative.parent / source_file_for_asset(asset)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(renderable_asy_source(source), encoding="utf-8")
                asset["stagingInput"] = target.relative_to(sources_root).as_posix()
                jobs.append(
                    {
                        "id": asset["id"],
                        "input": asset["stagingInput"],
                        "kind": "asymptote",
                        "output": asset["output"],
                    }
                )
            except Exception as error:  # Source drift must be a reported release blocker.
                asset["status"] = "source-extraction-failed"
                asset["error"] = str(error)
            continue

        if asset["kind"] == "local-image":
            try:
                mime_type, output_hash = copy_local_image_asset(asset, repo_root, staging.parent)
                asset["status"] = "success"
                asset["mimeType"] = mime_type
                asset["outputSha256"] = output_hash
            except Exception as error:  # A local source drift is a release blocker too.
                asset["status"] = "local-copy-failed"
                asset["error"] = str(error)
            continue

        source = asset["source"]
        try:
            cache_target = download_cache / f"{asset['id']}.source"
            metadata_target = download_cache / f"{asset['id']}.metadata.json"
            if asset["kind"] == "aops-file":
                expected_cache_identity = {
                    "filename": source["filename"],
                    "pageUrl": source["pageUrl"],
                }
            elif asset["kind"] == "remote-image":
                expected_cache_identity = {"downloadUrl": source["downloadUrl"]}
            else:
                raise ValueError(f"unsupported remote media kind: {asset['kind']!r}")
            cache_is_current = False
            if cache_target.is_file() and metadata_target.is_file():
                metadata = json.loads(metadata_target.read_text(encoding="utf-8"))
                cache_is_current = all(metadata.get(key) == value for key, value in expected_cache_identity.items())
            if cache_is_current:
                payload = cache_target.read_bytes()
                if metadata.get("downloadSha256") != sha256_bytes(payload):
                    raise ValueError("cached image hash does not match cached metadata")
                image_url = metadata.get("downloadUrl")
                if not isinstance(image_url, str) or not safe_url(image_url):
                    raise ValueError("cached image URL is outside the permitted original-image path")
            else:
                # A cache key is intentionally stable by asset id, so it must
                # also bind immutable source identity.  Old or mismatched
                # metadata is never reused after a source edit.
                if asset["kind"] == "aops-file":
                    page_html = fetch_page(source["pageUrl"])
                    image_url = original_image_url(source["pageUrl"], page_html)
                else:
                    image_url = source["downloadUrl"]
                payload = download_bytes(image_url)
                download_cache.mkdir(parents=True, exist_ok=True)
                cache_target.write_bytes(payload)
                metadata = {
                    **expected_cache_identity,
                    "downloadSha256": sha256_bytes(payload),
                    "downloadUrl": image_url,
                }
                metadata_target.write_text(canonical_json(metadata), encoding="utf-8")
            source_type = detect_raster_type(payload)
            download_relative = Path(asset["id"]).with_suffix(f".source.{source_type}")
            target = downloads_root / download_relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
            asset["source"]["downloadUrl"] = image_url
            asset["source"]["downloadSha256"] = sha256_bytes(payload)
            asset["source"]["mimeType"] = f"image/{source_type if source_type != 'jpeg' else 'jpeg'}"
            asset["stagingInput"] = download_relative.as_posix()
            jobs.append(
                {
                    "id": asset["id"],
                    "input": asset["stagingInput"],
                    "kind": "raster",
                    "output": asset["output"],
                }
            )
        except Exception as error:  # Network/source errors must be recorded, never hidden.
            asset["status"] = "download-failed"
            asset["error"] = str(error)
    return jobs


def build_renderer(image_tag: str, media_dir: Path) -> None:
    command = [
        "docker",
        "build",
        "--pull=false",
        "--tag",
        image_tag,
        "--file",
        str(media_dir / "Dockerfile"),
        str(media_dir),
    ]
    subprocess.run(command, check=True)


def require_renderer(image_tag: str) -> None:
    result = subprocess.run(
        ["docker", "image", "inspect", image_tag], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False
    )
    if result.returncode:
        raise RuntimeError(f"Docker image {image_tag!r} does not exist; rerun with --build-image")


def renderer_provenance(image_tag: str, media_dir: Path) -> dict[str, str]:
    """Record the exact locally built renderer and its locked build inputs."""

    result = subprocess.run(
        ["docker", "image", "inspect", "--format", "{{.Id}}", image_tag],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    image_id = result.stdout.strip()
    if result.returncode or not image_id:
        raise RuntimeError(f"could not inspect Docker image {image_tag!r}")
    return {
        "debianSnapshot": RENDERER_DEBIAN_SNAPSHOT,
        "dockerfileSha256": sha256_file(media_dir / "Dockerfile"),
        "imageId": image_id,
        "imageTag": image_tag,
        "rendererScriptSha256": sha256_file(media_dir / "render_media.py"),
    }


def run_renderer(image_tag: str, staging: Path, output_root: Path) -> tuple[int, str]:
    assets_root = output_root / "assets"
    assets_root.mkdir(parents=True, exist_ok=True)
    command = [
        "docker",
        "run",
        "--rm",
        "--network",
        "none",
        "--read-only",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--pids-limit",
        "256",
        "--memory",
        "1g",
        "--tmpfs",
        "/tmp:rw,nosuid,nodev,noexec,size=256m",
        "--user",
        f"{os.getuid()}:{os.getgid()}",
        "--volume",
        f"{staging.resolve()}:/input:ro",
        "--volume",
        f"{output_root.resolve()}:/output:rw",
        image_tag,
        "--jobs",
        "/input/jobs.json",
        "--sources",
        "/input/sources",
        "--downloads",
        "/input/downloads",
        "--output",
        "/output",
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
    return result.returncode, result.stdout


def read_render_results(output_root: Path) -> dict[str, dict[str, Any]]:
    result_path = output_root / "render-results.json"
    if not result_path.is_file():
        return {}
    raw = json.loads(result_path.read_text(encoding="utf-8"))
    return {str(result["id"]): result for result in raw.get("results", [])}


def validate_svg(path: Path) -> None:
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError("missing or empty SVG")
    if path.stat().st_size > MAX_RENDER_BYTES:
        raise ValueError("SVG exceeds size limit")
    payload = path.read_bytes()
    if b"<!doctype" in payload.lower() or b"<!entity" in payload.lower():
        raise ValueError("SVG must not contain a DTD or entity declaration")
    root = ET.fromstring(payload)
    if root.tag.rsplit("}", 1)[-1].lower() != "svg":
        raise ValueError("SVG root is not <svg>")
    for element in root.iter():
        element_name = element.tag.rsplit("}", 1)[-1].lower()
        if element_name in BLOCKED_SVG_ELEMENTS:
            raise ValueError(f"SVG contains blocked <{element_name}> element")
        for attribute, value in element.attrib.items():
            attribute_name = attribute.rsplit("}", 1)[-1].lower()
            reference = value.strip()
            if attribute_name not in SVG_REFERENCE_ATTRIBUTES or not reference or reference.startswith("#"):
                continue
            validate_svg_embedded_raster_reference(reference, attribute_name)


def validate_svg_embedded_raster_reference(reference: str, attribute_name: str) -> None:
    """Allow only bounded, self-contained PNG/JPEG image data in rendered SVG.

    Asymptote's headless 3D renderer may embed a JPEG snapshot in an SVG.
    Treating every data URI as safe would permit SVG/HTML payloads or unbounded
    data, so allow precisely the two raster media types after strict base64
    decoding and structural validation.
    """

    match = EMBEDDED_RASTER_DATA_URI.fullmatch(reference)
    if not match or not match.group("payload"):
        raise ValueError(f"SVG contains a non-fragment {attribute_name} reference")
    encoded = re.sub(r"[ \t\r\n]", "", match.group("payload"))
    # Base64 expansion is at most 4/3; reject before decoding to prevent a
    # crafted SVG from causing disproportionate host-memory use.
    if len(encoded) > ((MAX_RENDER_BYTES + 2) // 3) * 4:
        raise ValueError("embedded SVG raster exceeds size limit")
    try:
        payload = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("embedded SVG raster is not strict base64") from error
    if len(payload) > MAX_RENDER_BYTES:
        raise ValueError("embedded SVG raster exceeds size limit")
    if match.group("kind") == "png":
        validate_png_payload(payload)
    else:
        validate_jpeg_payload(payload)


def validate_jpeg_payload(payload: bytes) -> None:
    """Check a bounded JPEG's framing and dimensions without executing a decoder."""

    if len(payload) < 8 or not payload.startswith(b"\xff\xd8") or not payload.endswith(b"\xff\xd9"):
        raise ValueError("embedded JPEG has an invalid signature or terminator")
    offset = 2
    width = height = None
    saw_scan = False
    sof_markers = {
        0xC0,
        0xC1,
        0xC2,
        0xC3,
        0xC5,
        0xC6,
        0xC7,
        0xC9,
        0xCA,
        0xCB,
        0xCD,
        0xCE,
        0xCF,
    }
    while offset < len(payload):
        if payload[offset] != 0xFF:
            raise ValueError("embedded JPEG has malformed marker framing")
        while offset < len(payload) and payload[offset] == 0xFF:
            offset += 1
        if offset >= len(payload):
            raise ValueError("embedded JPEG is truncated")
        marker = payload[offset]
        offset += 1
        if marker == 0xD9:
            break
        if marker in {0x01, *range(0xD0, 0xD8)}:
            continue
        if offset + 2 > len(payload):
            raise ValueError("embedded JPEG segment is truncated")
        length = int.from_bytes(payload[offset : offset + 2], "big")
        if length < 2 or offset + length > len(payload):
            raise ValueError("embedded JPEG segment length is invalid")
        segment = payload[offset + 2 : offset + length]
        if marker in sof_markers:
            if len(segment) < 6:
                raise ValueError("embedded JPEG frame header is truncated")
            height = int.from_bytes(segment[1:3], "big")
            width = int.from_bytes(segment[3:5], "big")
            if not width or not height or width * height > MAX_RASTER_PIXELS:
                raise ValueError("embedded JPEG dimensions are invalid or exceed the pixel limit")
        if marker == 0xDA:
            saw_scan = True
            break
        offset += length
    if width is None or height is None or not saw_scan:
        raise ValueError("embedded JPEG lacks a frame or image scan")


def validate_png_payload(payload: bytes) -> None:
    """Validate a PNG byte sequence shared by standalone and embedded images."""

    if len(payload) < 45:
        raise ValueError("missing or empty PNG")
    if len(payload) > MAX_RENDER_BYTES:
        raise ValueError("PNG exceeds size limit")
    if payload[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("invalid PNG signature")
    offset = 8
    saw_idat = False
    saw_ihdr = False
    saw_iend = False
    while offset < len(payload):
        if offset + 12 > len(payload):
            raise ValueError("truncated PNG chunk")
        length = struct.unpack(">I", payload[offset : offset + 4])[0]
        chunk_type = payload[offset + 4 : offset + 8]
        data_end = offset + 8 + length
        crc_end = data_end + 4
        if crc_end > len(payload):
            raise ValueError("PNG chunk exceeds file length")
        data = payload[offset + 8 : data_end]
        expected_crc = struct.unpack(">I", payload[data_end:crc_end])[0]
        actual_crc = zlib.crc32(chunk_type)
        actual_crc = zlib.crc32(data, actual_crc) & 0xFFFFFFFF
        if actual_crc != expected_crc:
            raise ValueError("PNG chunk CRC does not match")
        if not saw_ihdr:
            if chunk_type != b"IHDR" or length != 13:
                raise ValueError("PNG must begin with a 13-byte IHDR chunk")
            width, height = struct.unpack(">II", data[:8])
            if not width or not height or width * height > MAX_RASTER_PIXELS:
                raise ValueError("PNG dimensions are invalid or exceed the pixel limit")
            saw_ihdr = True
        elif chunk_type == b"IDAT":
            saw_idat = True
        elif chunk_type == b"IEND":
            if length != 0 or crc_end != len(payload):
                raise ValueError("PNG IEND chunk is malformed or not final")
            saw_iend = True
            break
        offset = crc_end
    if not saw_ihdr or not saw_idat or not saw_iend:
        raise ValueError("PNG lacks a required IHDR, IDAT, or IEND chunk")


def validate_png(path: Path) -> None:
    if not path.is_file() or path.stat().st_size < 45:
        raise ValueError("missing or empty PNG")
    if path.stat().st_size > MAX_RENDER_BYTES:
        raise ValueError("PNG exceeds size limit")
    validate_png_payload(path.read_bytes())


def copy_local_image_asset(asset: dict[str, Any], repo_root: Path, output_root: Path) -> tuple[str, str]:
    """Atomically copy a verified local image into the owned private output.

    This is intentionally a validation-bound copy rather than a host image
    conversion.  Supported local SVG/PNG files are checked before copying,
    copied to a same-directory temporary file, checked again, then atomically
    replaced.  The source hash is compared after the copy so a concurrent
    source edit cannot be mistaken for a reviewed release asset.
    """

    source_file, mime_type = local_image_source_for_asset(asset, repo_root)
    output_relative = asset.get("output")
    if not isinstance(output_relative, str):
        raise ValueError("local image asset has an invalid output path")
    if Path(output_relative).suffix.lower() != source_file.suffix.lower():
        raise ValueError("local image output suffix does not match its source type")
    destination = _managed_asset_path(output_root, output_root / "assets", output_relative)
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(
        f".{destination.stem}.local-copy-{uuid4().hex}{destination.suffix.lower()}"
    )
    try:
        shutil.copyfile(source_file, temporary)
        copied_mime_type = validate_local_image(temporary)
        if copied_mime_type != mime_type:
            raise ValueError("local image copy changed its media type")
        output_hash = sha256_file(temporary)
        if output_hash != asset["source"]["sourceSha256"]:
            raise ValueError("local image copy does not match the manifest source hash")
        os.replace(temporary, destination)
        # Validate the final path too, so the manifest's post-copy hash and
        # the actual private output are bound before public staging begins.
        if validate_local_image(destination) != mime_type or sha256_file(destination) != output_hash:
            raise ValueError("local image final output validation failed")
        return mime_type, output_hash
    finally:
        if temporary.exists() or temporary.is_symlink():
            temporary.unlink()


def safe_output_path(root: Path, relative: str) -> Path:
    path = Path(relative)
    if not relative or path.is_absolute() or ".." in path.parts:
        raise ValueError(f"unsafe relative output path: {relative!r}")
    return root / path


def retired_managed_outputs_document() -> dict[str, list[str]]:
    """Return the small, auditable one-time generated-output retirement list."""

    return {root: list(paths) for root, paths in RETIRED_MANAGED_OUTPUTS.items()}


def _managed_asset_path(root: Path, assets_root: Path, relative: str) -> Path:
    """Resolve one pipeline-owned asset path without allowing an escape.

    The renderer has two different owned roots: its private ``assets`` output
    and the public static ``assets`` mirror.  This helper deliberately does
    not accept arbitrary output-root descendants, does not follow a symlink
    outside its root, and is used again immediately before every unlink.
    """

    if not isinstance(relative, str) or "\\" in relative:
        raise ValueError(f"unsafe managed asset path: {relative!r}")
    candidate = safe_output_path(root, relative)
    root_resolved = root.resolve()
    assets_resolved = assets_root.resolve()
    try:
        assets_resolved.relative_to(root_resolved)
        candidate.relative_to(assets_root)
        candidate.resolve().relative_to(assets_resolved)
    except ValueError as error:
        raise ValueError(f"managed asset path escapes its assets root: {relative!r}") from error
    return candidate


def _managed_output_paths_from_assets(
    assets: Any,
    *,
    output_root: Path,
    repo_root: Path,
    public_root: Path,
    strict: bool,
) -> ManagedOutputPaths:
    """Return only asset paths explicitly and safely declared by a manifest.

    A previous manifest may be absent or damaged; in non-strict mode invalid
    entries simply cannot authorize deletion.  The current discovery is
    strict, because a malformed current entry must block a release rather
    than make a stale file look safe to retire.
    """

    if not isinstance(assets, list):
        if strict:
            raise ValueError("manifest assets is not an array")
        return ManagedOutputPaths(frozenset(), frozenset())
    private: set[str] = set()
    public: set[str] = set()
    for asset in assets:
        try:
            if not isinstance(asset, dict):
                raise ValueError("manifest asset is not an object")
            output = asset.get("output")
            replacement = asset.get("replacement")
            if not isinstance(output, str) or not isinstance(replacement, dict):
                raise ValueError("manifest asset lacks an output/replacement mapping")
            if replacement != replacement_for_output(output):
                raise ValueError("manifest replacement does not derive from its output")
            _managed_asset_path(output_root, output_root / "assets", output)
            public_path = replacement["localPath"]
            _managed_asset_path(repo_root, public_root / "assets", public_path)
        except (KeyError, TypeError, ValueError):
            if strict:
                raise
            continue
        private.add(output)
        public.add(public_path)
    return ManagedOutputPaths(frozenset(private), frozenset(public))


def _retired_output_paths_from_document(
    document: dict[str, Any],
    *,
    output_root: Path,
    repo_root: Path,
    public_root: Path,
) -> ManagedOutputPaths:
    """Validate the fixed one-time retirement declaration in a release manifest."""

    retired = document.get("retiredManagedOutputs")
    expected = retired_managed_outputs_document()
    if retired != expected:
        raise ValueError("manifest retiredManagedOutputs does not match the audited retirement declaration")
    private = retired["private"]
    public = retired["public"]
    if len(private) != len(set(private)) or len(public) != len(set(public)):
        raise ValueError("manifest retiredManagedOutputs contains duplicate paths")
    for path in private:
        _managed_asset_path(output_root, output_root / "assets", path)
    for path in public:
        _managed_asset_path(repo_root, public_root / "assets", path)
    return ManagedOutputPaths(frozenset(private), frozenset(public))


def retired_managed_output_paths(
    previous_manifest: dict[str, Any] | None,
    current_assets: list[dict[str, Any]],
    retirement_document: dict[str, Any],
    *,
    output_root: Path,
    repo_root: Path,
    public_root: Path,
) -> ManagedOutputPaths:
    """Compute exactly which formerly managed files can be retired safely.

    Generic retirement is a set difference between a previous manifest and
    the current discovery.  The audited one-time list covers only the five
    orphaned files that predate this cleanup mechanism.  Both sources are
    rejected if they overlap a current output, so a rebuild can never delete
    a current asset just because its historical placement changed.
    """

    previous = _managed_output_paths_from_assets(
        previous_manifest.get("assets") if isinstance(previous_manifest, dict) else [],
        output_root=output_root,
        repo_root=repo_root,
        public_root=public_root,
        strict=False,
    )
    current = _managed_output_paths_from_assets(
        current_assets,
        output_root=output_root,
        repo_root=repo_root,
        public_root=public_root,
        strict=True,
    )
    audited = _retired_output_paths_from_document(
        retirement_document,
        output_root=output_root,
        repo_root=repo_root,
        public_root=public_root,
    )
    if audited.private & current.private or audited.public & current.public:
        raise ValueError("retired managed outputs overlap the current discovery")
    return ManagedOutputPaths(
        frozenset((previous.private - current.private) | audited.private),
        frozenset((previous.public - current.public) | audited.public),
    )


def remove_retired_private_outputs(output_root: Path, paths: Iterable[str]) -> None:
    """Remove only retired private render files; unknown paths are untouched."""

    for relative in sorted(set(paths)):
        path = _managed_asset_path(output_root, output_root / "assets", relative)
        if path.is_symlink() or path.is_file():
            path.unlink()
        elif path.exists():
            raise ValueError(f"retired private output is not a file: {relative!r}")


def _remove_retired_public_outputs_from_stage(
    stage_assets: Path,
    live_assets: Path,
    repo_root: Path,
    public_root: Path,
    paths: Iterable[str],
) -> None:
    """Remove retired known files from a staged public tree before its swap."""

    for relative in sorted(set(paths)):
        public_path = _managed_asset_path(repo_root, public_root / "assets", relative)
        stage_relative = public_path.relative_to(live_assets)
        parent = stage_assets
        for component in stage_relative.parts[:-1]:
            parent = parent / component
            if parent.is_symlink():
                raise ValueError(f"retired public output has a symlinked staging parent: {relative!r}")
        staged_path = stage_assets / stage_relative
        if staged_path.is_symlink() or staged_path.is_file():
            staged_path.unlink()
        elif staged_path.exists():
            raise ValueError(f"retired public output is not a file: {relative!r}")


def validate_archive_placement_metadata(asset: dict[str, Any]) -> None:
    """Enforce the scope/placement contract consumed by the archive builder."""

    source = asset.get("source")
    if not isinstance(source, dict):
        raise ValueError("media source is not an object")
    markdown_path = source.get("markdownPath")
    scope = source.get("markdownScope")
    placement = source.get("placement")
    block_index = source.get("markdownBlockIndex")
    if (
        not isinstance(markdown_path, str)
        or not markdown_path.endswith(".md")
        or markdown_path.startswith("/")
        or "\\" in markdown_path
        or ".." in Path(markdown_path).parts
        or scope not in MARKDOWN_SCOPES
        or placement not in {"markdown", "requiredMedia"}
        or not isinstance(block_index, int)
        or block_index < 0
    ):
        raise ValueError("media source lacks a safe archive Markdown scope/placement mapping")
    required_media_index = source.get("requiredMediaIndex")
    if placement == "markdown" and block_index < 1:
        raise ValueError("markdown media source needs a positive markdownBlockIndex")
    if placement == "requiredMedia" and (
        scope != "prompt" or block_index != 0 or not isinstance(required_media_index, int) or required_media_index < 1
    ):
        raise ValueError("requiredMedia source has an invalid archive placement")
    kind = asset.get("kind")
    if kind in {"aops-file", "remote-image", "local-image"} and not isinstance(source.get("markdownReference"), str):
        raise ValueError("image media source lacks its original Markdown reference")
    if kind == "local-image":
        local_source_path = source.get("localSourcePath")
        source_hash = source.get("sourceSha256")
        raw_path = source.get("rawPath")
        markdown_reference = source.get("markdownReference")
        if (
            not isinstance(local_source_path, str)
            or not SAFE_LOCAL_SOURCE_PATH.fullmatch(local_source_path)
            or Path(local_source_path).is_absolute()
            or any(part in {".", ".."} for part in Path(local_source_path).parts)
            or markdown_reference != f"{LOCAL_SOURCE_REFERENCE_PREFIX}{local_source_path}"
            or source.get("markdownSyntax") != "markdown-image"
            or not isinstance(source_hash, str)
            or re.fullmatch(r"[0-9a-f]{64}", source_hash) is None
            or not isinstance(raw_path, str)
            or raw_path.startswith("/")
            or "\\" in raw_path
            or any(part in {".", ".."} for part in Path(raw_path).parts)
        ):
            raise ValueError("local image source lacks safe, hash-bound provenance")


def scoped_asymptote_placement_key(source: dict[str, Any]) -> tuple[str, str, str, int]:
    """Return the unique archive replacement key for one Asymptote asset.

    Plain Markdown fences are individual placements.  A converted legacy
    ``<asy>`` wrapper is instead one container placement even when it spans
    several fences; archive replaces the wrapper once with one SVG.
    """

    markdown_path = source.get("markdownPath")
    scope = source.get("markdownScope")
    if not isinstance(markdown_path, str) or scope not in MARKDOWN_SCOPES:
        raise ValueError("Asymptote source lacks a valid scoped Markdown path")
    container_index = source.get("markdownContainerIndex")
    if container_index is not None:
        if not isinstance(container_index, int) or container_index < 1:
            raise ValueError("Asymptote container source lacks a valid container index")
        fence_indexes = source.get("markdownFenceIndexes")
        if not isinstance(fence_indexes, list) or not fence_indexes or any(
            not isinstance(index, int) or index < 1 for index in fence_indexes
        ):
            raise ValueError("Asymptote container source lacks valid fence indexes")
        return markdown_path, scope, "container", container_index
    block_index = source.get("markdownBlockIndex")
    if not isinstance(block_index, int) or block_index < 1:
        raise ValueError("Asymptote source lacks a valid Markdown fence index")
    return markdown_path, scope, "fence", block_index


def verify_manifest(
    output_root: Path,
    repo_root: Path,
    *,
    require_public: bool = True,
    check_retired_outputs: bool = True,
) -> tuple[int, list[str]]:
    manifest_path = output_root / "media-manifest.json"
    if not manifest_path.is_file():
        return 1, [f"manifest is missing: {manifest_path}"]
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    failures: list[str] = []
    renderer = manifest.get("renderer")
    media_dir = Path(__file__).resolve().parent
    if not isinstance(renderer, dict):
        failures.append("manifest lacks renderer provenance")
    elif (
        renderer.get("debianSnapshot") != RENDERER_DEBIAN_SNAPSHOT
        or renderer.get("dockerfileSha256") != sha256_file(media_dir / "Dockerfile")
        or renderer.get("rendererScriptSha256") != sha256_file(media_dir / "render_media.py")
        or not isinstance(renderer.get("imageId"), str)
        or not renderer["imageId"].startswith("sha256:")
    ):
        failures.append("manifest renderer provenance does not match the checked-in locked renderer inputs")
    discovered_assets: list[dict[str, Any]] = []
    manifest_assets = manifest.get("assets")
    try:
        discovered_assets, current_inventory = discover_media_inventory(repo_root)
        if not isinstance(manifest_assets, list):
            raise ValueError("manifest assets is not an array")
        if [asset.get("id") for asset in manifest_assets] != [asset["id"] for asset in discovered_assets]:
            failures.append("manifest asset IDs no longer match the current source discovery")
        for expected, actual in zip(discovered_assets, manifest_assets):
            if actual.get("kind") != expected["kind"]:
                failures.append(f"{expected['id']}: manifest media kind no longer matches discovery")
            for key in ("output", "replacement", "renderAliasOf"):
                if actual.get(key) != expected.get(key):
                    failures.append(f"{expected['id']}: manifest {key} no longer matches discovery")
            expected_source = expected["source"]
            actual_source = actual.get("source")
            if not isinstance(actual_source, dict) or any(
                actual_source.get(key) != value for key, value in expected_source.items()
            ):
                failures.append(f"{expected['id']}: manifest source provenance no longer matches discovery")
        if manifest.get("mediaInventory") != current_inventory:
            failures.append("manifest media inventory no longer matches current source discovery")
        for scope in MARKDOWN_SCOPES:
            if current_inventory["scopes"][scope]["unresolvedAsymptoteFences"]:
                failures.append(f"current source discovery has unresolved {scope} Asymptote fences")
    except (KeyError, OSError, ValueError) as error:
        failures.append(f"could not verify source discovery: {error}")
    public_root = manifest.get("publicRoot")
    if public_root != "historical-media":
        failures.append("manifest publicRoot is not the expected historical-media static root")
    if check_retired_outputs:
        try:
            retired = retired_managed_output_paths(
                None,
                manifest_assets if isinstance(manifest_assets, list) else [],
                manifest,
                output_root=output_root,
                repo_root=repo_root,
                public_root=repo_root / "historical-media",
            )
            for relative in retired.private:
                private_path = _managed_asset_path(output_root, output_root / "assets", relative)
                if private_path.exists() or private_path.is_symlink():
                    failures.append(f"retired private managed output still exists: {relative}")
            if require_public:
                for relative in retired.public:
                    public_path = _managed_asset_path(repo_root, repo_root / "historical-media" / "assets", relative)
                    if public_path.exists() or public_path.is_symlink():
                        failures.append(f"retired public managed output still exists: {relative}")
        except (KeyError, TypeError, ValueError) as error:
            failures.append(f"could not verify retired managed outputs: {error}")
    seen_ids: set[str] = set()
    output_owners: dict[str, str] = {}
    assets_by_id = {
        asset.get("id"): asset for asset in manifest.get("assets", []) if isinstance(asset.get("id"), str)
    }
    expected_asymptote_blocks = {
        scoped_asymptote_placement_key(asset["source"])
        for asset in discovered_assets
        if asset["kind"] == "asymptote" and int(asset["source"].get("markdownBlockIndex", 0)) > 0
    }
    expected_local_blocks = {
        (
            asset["source"].get("markdownPath"),
            asset["source"].get("markdownScope"),
            asset["source"].get("markdownBlockIndex"),
            asset["source"].get("markdownReference"),
        )
        for asset in discovered_assets
        if asset["kind"] == "local-image"
    }
    seen_asymptote_blocks: set[tuple[str, str, str, int]] = set()
    seen_remote_blocks: set[tuple[str, str, int, str]] = set()
    seen_local_blocks: set[tuple[str | None, str | None, int | None, str | None]] = set()
    for asset in manifest.get("assets", []):
        asset_id_value = asset.get("id")
        if not isinstance(asset_id_value, str) or asset_id_value in seen_ids:
            failures.append(f"invalid or duplicate asset id: {asset_id_value!r}")
            continue
        seen_ids.add(asset_id_value)
        try:
            output_relative = asset["output"]
            if not isinstance(output_relative, str):
                raise ValueError("invalid output path")
            output_owner = output_owners.get(output_relative)
            if output_owner is None:
                if asset.get("renderAliasOf") is not None:
                    raise ValueError("primary output cannot declare renderAliasOf")
                output_owners[output_relative] = asset_id_value
            elif asset.get("renderAliasOf") != output_owner:
                raise ValueError("duplicate output path must be a direct alias of its primary asset")
            elif assets_by_id.get(output_owner, {}).get("output") != output_relative:
                raise ValueError("render alias primary does not own its output path")
            output = safe_output_path(output_root, output_relative)
        except (KeyError, ValueError) as error:
            failures.append(f"{asset_id_value}: {error}")
            continue
        if asset.get("status") != "success":
            failures.append(f"{asset_id_value}: non-success status {asset.get('status')!r}")
            continue
        try:
            source = asset.get("source")
            validate_archive_placement_metadata(asset)
            if not isinstance(source, dict):
                raise ValueError("media source lacks a valid Markdown source object")
            if asset.get("kind") == "asymptote":
                block_index = source.get("markdownBlockIndex")
                if not isinstance(block_index, int):
                    raise ValueError("Asymptote source lacks an integer markdownBlockIndex")
                if block_index > 0:
                    block = scoped_asymptote_placement_key(source)
                    if block in seen_asymptote_blocks:
                        raise ValueError("duplicate or invalid scoped Asymptote markdown block")
                    seen_asymptote_blocks.add(block)
            if asset.get("kind") == "asymptote":
                # Reconstructing it verifies both the exact raw/fenced source
                # hash and the recorded Markdown placement mapping.
                asymptote_source_for_asset(asset, repo_root)
            elif asset.get("kind") in {"aops-file", "remote-image"}:
                reference = source.get("markdownReference")
                block_index = source.get("markdownBlockIndex")
                if not isinstance(reference, str) or not isinstance(block_index, int):
                    raise ValueError("remote media source lacks Markdown placement metadata")
                if block_index > 0:
                    remote_block = (source.get("rawPath"), source["markdownScope"], block_index, reference)
                    if not isinstance(remote_block[0], str) or remote_block in seen_remote_blocks:
                        raise ValueError("duplicate or invalid scoped remote-media Markdown block")
                    seen_remote_blocks.add(remote_block)
                if asset["kind"] == "aops-file":
                    if not safe_page_url(str(source.get("pageUrl", ""))) or not safe_url(str(source.get("downloadUrl", ""))):
                        raise ValueError("AoPS file source URL metadata is not permitted")
                elif not safe_url(str(source.get("downloadUrl", ""))):
                    raise ValueError("remote image URL metadata is not permitted")
            elif asset.get("kind") == "local-image":
                reference = source.get("markdownReference")
                block_index = source.get("markdownBlockIndex")
                if not isinstance(reference, str) or not isinstance(block_index, int):
                    raise ValueError("local image source lacks Markdown placement metadata")
                local_block = (source.get("markdownPath"), source.get("markdownScope"), block_index, reference)
                if local_block in seen_local_blocks:
                    raise ValueError("duplicate or invalid scoped local-image Markdown block")
                seen_local_blocks.add(local_block)
                source_file, source_mime_type = local_image_source_for_asset(asset, repo_root)
                if Path(output_relative).suffix.lower() != source_file.suffix.lower():
                    raise ValueError("local image output suffix differs from its verified source")
                if asset.get("mimeType") != source_mime_type:
                    raise ValueError("local image output MIME type differs from its verified source")
            else:
                raise ValueError(f"unsupported media kind: {asset.get('kind')!r}")
            if output.suffix.lower() == ".svg":
                validate_svg(output)
            elif output.suffix.lower() == ".png":
                validate_png(output)
            else:
                raise ValueError("unexpected output extension")
            digest = sha256_file(output)
            if digest != asset.get("outputSha256"):
                raise ValueError("output hash does not match manifest")
            replacement = asset.get("replacement", {})
            if replacement != replacement_for_output(output_relative):
                raise ValueError("replacement paths do not derive from the output path")
            if require_public:
                public_relative = replacement["localPath"]
                public_output = safe_output_path(repo_root, public_relative)
                if output.suffix.lower() == ".svg":
                    validate_svg(public_output)
                else:
                    validate_png(public_output)
                if sha256_file(public_output) != digest:
                    raise ValueError("public copy hash does not match private output")
        except (KeyError, OSError, TypeError, ValueError, ET.ParseError) as error:
            failures.append(f"{asset_id_value}: {error}")
    if seen_asymptote_blocks != expected_asymptote_blocks:
        failures.append("manifest scoped Asymptote placements are not unique and complete")
    if seen_local_blocks != expected_local_blocks:
        failures.append("manifest scoped local-image placements are not unique and complete")
    return (1 if failures else 0), failures


def report_markdown(manifest: dict[str, Any]) -> str:
    assets = manifest["assets"]
    inventory = manifest.get("mediaInventory", {})
    counts: dict[str, int] = {}
    for asset in assets:
        counts[asset["status"]] = counts.get(asset["status"], 0) + 1
    lines = [
        "# Historical AMC 12 media build report",
        "",
        f"- Schema: `{manifest['schemaVersion']}`",
        f"- Source forms scanned: {manifest['sourceFormCount']}",
        f"- Questions scanned: {manifest['sourceQuestionCount']}",
        f"- Media placements: {len(assets)}",
        f"- Physical media outputs: {len({asset['output'] for asset in assets})}",
        f"- Asymptote placements: {sum(asset['kind'] == 'asymptote' for asset in assets)}",
        f"- AoPS raster placements: {sum(asset['kind'] in {'aops-file', 'remote-image'} for asset in assets)}",
        f"- Repository-local image placements: {sum(asset['kind'] == 'local-image' for asset in assets)}",
        "",
        "## Result counts",
        "",
    ]
    for status, count in sorted(counts.items()):
        lines.append(f"- `{status}`: {count}")
    for scope in ("prompt", "solution"):
        scope_inventory = inventory.get("scopes", {}).get(scope, {})
        lines.extend(
            [
                "",
                f"## {scope.title()} media scope",
                "",
                f"- Asymptote fences discovered: {scope_inventory.get('asymptoteFenceCount', 'n/a')}",
                f"- Closed fences represented by assets: {scope_inventory.get('renderedAsymptoteFenceCount', 'n/a')}",
                f"- Repository-local images represented by assets: {scope_inventory.get('localImageCount', 'n/a')}",
            ]
        )
    failures = [asset for asset in assets if asset["status"] != "success"]
    if failures:
        lines.extend(["", "## Failed or blocked assets", ""])
        for asset in failures:
            lines.append(f"- `{asset['id']}` — `{asset['status']}`: {asset.get('error', 'no detail')}")
    else:
        lines.extend(["", "All discovered archive prompt/solution media rendered or mirrored successfully."])
    resolutions = [
        resolution
        for scope in inventory.get("scopes", {}).values()
        for resolution in (
            list(scope.get("resolvedWithoutMediaAsymptoteFences", []))
            + list(scope.get("unclosedAsymptoteFences", []))
        )
    ]
    if resolutions:
        lines.extend(["", "## Prompt fence resolutions", ""])
        for resolution in resolutions:
            lines.append(
                "- `{markdownPath}` fence `{markdownBlockIndex}` — `{reason}`".format(**resolution)
            )
    unresolved = [
        resolution
        for scope in inventory.get("scopes", {}).values()
        for resolution in scope.get("unresolvedAsymptoteFences", [])
    ]
    if unresolved:
        lines.extend(["", "## Unresolved prompt fences", ""])
        for resolution in unresolved:
            lines.append(
                "- `{markdownPath}` fence `{markdownBlockIndex}` — `{reason}`".format(**resolution)
            )
    return "\n".join(lines) + "\n"


def write_outputs(output_root: Path, manifest: dict[str, Any]) -> None:
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "media-manifest.json").write_text(canonical_json(manifest), encoding="utf-8")
    (output_root / "media-report.md").write_text(report_markdown(manifest), encoding="utf-8")


def load_previous_manifest(output_root: Path) -> dict[str, Any] | None:
    """Read a prior manifest solely as a conservative retirement authority."""

    path = output_root / "media-manifest.json"
    if not path.is_file():
        return None
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        # A broken old manifest must never authorize deletion.  The new build
        # still has its explicit audited migration list and can be verified
        # independently once it has been written.
        return None
    return document if isinstance(document, dict) else None


def copy_public_assets(
    assets: list[dict[str, Any]],
    output_root: Path,
    repo_root: Path,
    public_root: Path,
    *,
    retired_public_paths: Iterable[str] = (),
) -> None:
    """Publish a fully staged asset directory only after private verification.

    The static ``assets`` directory is swapped as a unit.  Existing unrelated
    files below it are copied into the stage first.  Only paths that a prior
    manifest (or the tiny audited migration list) explicitly marked as managed
    and retired are removed from the stage, so this pipeline neither deletes
    unknown public files nor exposes a partial set when a renderer or copy
    operation fails.
    """

    try:
        public_root.relative_to(repo_root)
    except ValueError as error:
        raise ValueError("--public-root must remain inside --repo-root") from error
    if public_root == repo_root:
        raise ValueError("--public-root cannot be the repository root")
    public_root.mkdir(parents=True, exist_ok=True)
    live_assets = public_root / "assets"
    stage_assets = public_root / f".assets-stage-{uuid4().hex}"
    backup_assets = public_root / f".assets-backup-{uuid4().hex}"
    moved_live_assets = False
    try:
        if live_assets.exists():
            if not live_assets.is_dir():
                raise ValueError(f"public assets path is not a directory: {live_assets}")
            shutil.copytree(live_assets, stage_assets, symlinks=True)
        else:
            stage_assets.mkdir()
        _remove_retired_public_outputs_from_stage(
            stage_assets,
            live_assets,
            repo_root,
            public_root,
            retired_public_paths,
        )
        for asset in assets:
            if asset.get("status") != "success":
                raise ValueError(f"cannot publish non-success asset: {asset.get('id')!r}")
            private_output = safe_output_path(output_root, asset["output"])
            replacement = asset["replacement"]
            public_path = safe_output_path(repo_root, replacement["localPath"])
            if not public_path.is_relative_to(live_assets):
                raise ValueError(f"replacement escapes public assets root: {public_path}")
            staged_path = stage_assets / public_path.relative_to(live_assets)
            staged_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(private_output, staged_path)
        if live_assets.exists():
            os.replace(live_assets, backup_assets)
            moved_live_assets = True
        os.replace(stage_assets, live_assets)
        if moved_live_assets:
            # The new directory is already atomically live.  A best-effort
            # cleanup failure must not turn that successful publication into
            # an exception that invites an unsafe rollback of valid assets.
            try:
                shutil.rmtree(backup_assets)
            except OSError:
                pass
    except Exception:
        if moved_live_assets and not live_assets.exists() and backup_assets.exists():
            os.replace(backup_assets, live_assets)
        if stage_assets.exists():
            shutil.rmtree(stage_assets)
        raise


def migrate_staging_downloads(staging: Path, download_cache: Path) -> None:
    """Preserve prior successful downloads before replacing owned staging input."""

    legacy_downloads = staging / "downloads"
    if not legacy_downloads.is_dir():
        return
    for legacy_file in legacy_downloads.glob("*.source.*"):
        asset_id = legacy_file.name.split(".source.", 1)[0]
        if not asset_id:
            continue
        target = download_cache / f"{asset_id}.source"
        if not target.exists():
            download_cache.mkdir(parents=True, exist_ok=True)
            shutil.copy2(legacy_file, target)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    parser.add_argument("--output-root", type=Path, default=Path("practice-content/media/historical"))
    parser.add_argument(
        "--public-root",
        type=Path,
        default=Path("historical-media"),
        help="repository-relative static root used by replacement.publicUrl",
    )
    parser.add_argument("--image-tag", default="amc12-historical-media-renderer:bookworm")
    parser.add_argument("--build-image", action="store_true", help="build the isolated renderer image before processing")
    parser.add_argument("--verify", action="store_true", help="only validate the existing manifest and media files")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    output_root = args.output_root if args.output_root.is_absolute() else repo_root / args.output_root
    output_root = output_root.resolve()
    public_root = args.public_root if args.public_root.is_absolute() else repo_root / args.public_root
    public_root = public_root.resolve()
    if args.verify:
        status, failures = verify_manifest(output_root, repo_root)
        for failure in failures:
            print(f"VERIFY FAILED: {failure}", file=sys.stderr)
        if not failures:
            print(f"Verified {output_root / 'media-manifest.json'}")
        return status
    if not (repo_root / "practice-content").is_dir():
        raise SystemExit(f"--repo-root must be the AMC12_Problems repository: {repo_root}")
    # Capture the old manifest before writing the new release.  It is used
    # only to retire paths that it itself declared and the new discovery no
    # longer declares; an unreadable document authorizes no generic removal.
    previous_manifest = load_previous_manifest(output_root)
    media_dir = Path(__file__).resolve().parent
    if args.build_image:
        build_renderer(args.image_tag, media_dir)
    require_renderer(args.image_tag)
    renderer = renderer_provenance(args.image_tag, media_dir)
    assets, media_inventory = discover_media_inventory(repo_root)
    locations = list(iter_source_locations(repo_root))
    staging = output_root / "staging"
    download_cache = output_root / "downloads"
    # These are generated, owned paths.  Removing only this explicitly named
    # staging directory prevents stale inputs from changing a later build.
    if staging.exists():
        migrate_staging_downloads(staging, download_cache)
        shutil.rmtree(staging)
    staging.mkdir(parents=True)
    jobs = prepare_sources_and_downloads(assets, repo_root, staging, download_cache)
    (staging / "jobs.json").write_text(canonical_json(jobs), encoding="utf-8")
    exit_code, renderer_output = run_renderer(args.image_tag, staging, output_root)
    if renderer_output.strip():
        print(renderer_output, file=sys.stderr)
    results = read_render_results(output_root)
    assets_by_id = {asset["id"]: asset for asset in assets}
    for asset in assets:
        alias_of = asset.get("renderAliasOf")
        if alias_of:
            primary = assets_by_id.get(alias_of)
            if primary is None:
                asset["status"] = "renderer-alias-missing-primary"
                asset["error"] = f"render alias primary {alias_of!r} does not exist"
            elif primary.get("status") == "success":
                asset["status"] = "success"
                asset["mimeType"] = primary["mimeType"]
                asset["outputSha256"] = primary["outputSha256"]
            else:
                asset["status"] = "renderer-alias-primary-not-success"
                asset["error"] = f"render alias primary {alias_of!r} has status {primary.get('status')!r}"
            asset.pop("stagingInput", None)
            asset.pop("unsafeSource", None)
            continue
        result = results.get(asset["id"])
        if result:
            asset["status"] = result["status"]
            if result["status"] == "success":
                asset["mimeType"] = result["mimeType"]
                asset["outputSha256"] = result["sha256"]
            else:
                asset["error"] = result.get("message", "renderer failed")
        elif asset["status"] == "planned":
            asset["status"] = "renderer-not-run"
            asset["error"] = "no renderer result was written"
        asset.pop("stagingInput", None)
        asset.pop("unsafeSource", None)
    manifest = {
        "assets": assets,
        "mediaInventory": media_inventory,
        # Kept for older diagnostic consumers while all new checks use the
        # scope-complete mediaInventory above.
        "promptAsymptoteInventory": media_inventory,
        "publicRoot": relative_to_root(public_root, repo_root),
        "renderer": renderer,
        "retiredManagedOutputs": retired_managed_outputs_document(),
        "schemaVersion": SCHEMA_VERSION,
        "sourceFormCount": len({location.form_name for location in locations}),
        "sourceQuestionCount": len(locations),
    }
    write_outputs(output_root, manifest)
    private_verify_status, failures = verify_manifest(
        output_root,
        repo_root,
        require_public=False,
        check_retired_outputs=False,
    )
    for failure in failures:
        print(f"VERIFY FAILED: {failure}", file=sys.stderr)
    if exit_code or private_verify_status:
        return 1
    retired_paths = retired_managed_output_paths(
        previous_manifest,
        assets,
        manifest,
        output_root=output_root,
        repo_root=repo_root,
        public_root=public_root,
    )
    remove_retired_private_outputs(output_root, retired_paths.private)
    private_retirement_verify_status, failures = verify_manifest(output_root, repo_root, require_public=False)
    for failure in failures:
        print(f"VERIFY FAILED: {failure}", file=sys.stderr)
    if private_retirement_verify_status:
        return 1
    copy_public_assets(
        assets,
        output_root,
        repo_root,
        public_root,
        retired_public_paths=retired_paths.public,
    )
    verify_status, failures = verify_manifest(output_root, repo_root)
    for failure in failures:
        print(f"VERIFY FAILED: {failure}", file=sys.stderr)
    if verify_status:
        return 1
    print(f"Built and verified {len(assets)} local media assets in {output_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
