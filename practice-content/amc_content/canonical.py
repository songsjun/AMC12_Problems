"""Canonical JSON and text hashing used for immutable content revisions."""

from __future__ import annotations

import hashlib
import json
import math
from decimal import Decimal
from typing import Any, Iterable


# Scores are rendered and stored to four decimal places by the API. Keeping the
# release artifact in that same finite decimal domain avoids Python/ECMAScript
# JSON number spelling differences (for example 6.0 vs 6 or 1e-06 vs 0.000001).
MAX_CANONICAL_DECIMAL_PLACES = 4


def normalize_markdown(value: str) -> str:
    """Normalize transport-only whitespace without changing Markdown meaning."""

    value = value.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in value.split("\n")]
    return "\n".join(lines).strip() + "\n"


def _canonical_number(value: float) -> int | float:
    if not math.isfinite(value):
        raise ValueError("canonical JSON cannot contain NaN or infinity")
    decimal = Decimal(str(value))
    if -decimal.as_tuple().exponent > MAX_CANONICAL_DECIMAL_PLACES:
        raise ValueError(
            f"canonical JSON numbers may use at most {MAX_CANONICAL_DECIMAL_PLACES} decimal places"
        )
    if decimal == decimal.to_integral_value():
        # Python emits 6.0 for a float while ECMAScript emits 6. Converting an
        # integral float before serializing gives both runtimes the same bytes.
        return int(decimal)
    return float(decimal)


def _canonical_value(value: Any) -> Any:
    if isinstance(value, float):
        return _canonical_number(value)
    if isinstance(value, dict):
        return {key: _canonical_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_canonical_value(item) for item in value]
    if isinstance(value, tuple):
        return [_canonical_value(item) for item in value]
    return value


def canonical_json(value: Any) -> str:
    """Return deterministic cross-runtime JSON suitable for release hashes."""

    return json.dumps(
        _canonical_value(value),
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    ) + "\n"


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_hash(value: Any, *, omit: Iterable[str] = ()) -> str:
    """Hash a shallow copy of a mapping excluding self-referential hash fields."""

    if isinstance(value, dict):
        omitted = set(omit)
        value = {key: item for key, item in value.items() if key not in omitted}
    return sha256_text(canonical_json(value))
