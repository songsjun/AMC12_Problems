"""Compose protected, operator-original solution supplements with an archive inventory.

Supplements are candidates, never approvals.  The composed envelope binds the
complete original archive candidate set and a separately protected supplement
set; both hashes therefore participate in every later review decision.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from .builder import ContentBuildError
from .canonical import canonical_hash, sha256_text
from .question_context import _sha256_error, _strict_keys, validate_archive_question_context_set


SUPPLEMENT_SET_SCHEMA = "amc-original-solution-supplement-set-v1"
SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA = "amc-question-context-supplemented-archive-candidate-set-v1"
SUPPLEMENT_PROVENANCE_POLICY = "amc-operator-original-solution-provenance-v1"
SUPPLEMENT_RIGHTS_STATEMENT = "operator-attests-original-supplement-and-authorizes-ai-use"
SUPPLEMENT_AUDIENCE = "private-candidate-supplement-input"
_OPAQUE_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}")
_SUPPLEMENT_ID_RE = re.compile(r"supplement-[a-z0-9][a-z0-9-]{2,63}")
_SOLUTION_ID_RE = re.compile(r"solution-9[0-9]{2}")
_UTC_TIMESTAMP_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z")


def _valid_id(value: Any) -> bool:
    return isinstance(value, str) and _OPAQUE_ID_RE.fullmatch(value) is not None


def _valid_timestamp(value: Any) -> bool:
    if not isinstance(value, str) or _UTC_TIMESTAMP_RE.fullmatch(value) is None:
        return False
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def _unicode_errors(value: Any, path: str) -> list[str]:
    errors: list[str] = []
    if isinstance(value, str):
        if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
            errors.append(f"{path} contains an unpaired UTF-16 surrogate")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            errors.extend(_unicode_errors(item, f"{path}[{index}]"))
    elif isinstance(value, dict):
        for key, item in value.items():
            errors.extend(_unicode_errors(key, f"{path}.<key>"))
            errors.extend(_unicode_errors(item, f"{path}.{key}"))
    return errors


def _canonical_matches(value: Any, expected: Any, *, omit: tuple[str, ...]) -> bool:
    try:
        return expected == canonical_hash(value, omit=omit)
    except (TypeError, ValueError, UnicodeEncodeError):
        return False


def _text_errors(value: Any, path: str, maximum_bytes: int) -> list[str]:
    if not isinstance(value, str) or not value:
        return [f"{path} must be non-empty"]
    if re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]", value):
        return [f"{path} contains a disallowed control or Unicode replacement character"]
    try:
        size = len(value.encode("utf-8"))
    except UnicodeEncodeError:
        return [f"{path} is not valid Unicode text"]
    return [] if size <= maximum_bytes else [f"{path} must be at most {maximum_bytes} UTF-8 bytes"]


def question_projection(context: dict[str, Any]) -> dict[str, Any]:
    question = context["question"]
    return {
        "number": question["number"],
        "sourceRef": question["sourceRef"],
        "promptMarkdown": question["promptMarkdown"],
        "choices": question["choices"],
    }


def _archive_index(archive_candidate: dict[str, Any]) -> dict[tuple[str, str, int], tuple[dict[str, Any], dict[str, Any]]]:
    return {
        (form["form"]["id"], form["form"]["version"], context["question"]["number"]): (form, context)
        for form in archive_candidate["forms"]
        for context in form["questions"]
    }


def validate_original_solution_supplement_set(
    supplement_set: Any,
    *,
    archive_candidate: dict[str, Any] | None = None,
) -> list[str]:
    unicode_errors = _unicode_errors(supplement_set, "supplementSet")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        supplement_set,
        required={
            "schemaVersion", "audience", "provenancePolicyVersion", "operatorAuthorization",
            "archiveCandidateBinding", "supplements", "supplementSetHash",
        },
        path="supplementSet",
    )
    if not isinstance(supplement_set, dict):
        return errors
    if supplement_set.get("schemaVersion") != SUPPLEMENT_SET_SCHEMA:
        errors.append(f"supplementSet.schemaVersion must be {SUPPLEMENT_SET_SCHEMA}")
    if supplement_set.get("audience") != SUPPLEMENT_AUDIENCE:
        errors.append(f"supplementSet.audience must be {SUPPLEMENT_AUDIENCE}")
    if supplement_set.get("provenancePolicyVersion") != SUPPLEMENT_PROVENANCE_POLICY:
        errors.append("supplementSet.provenancePolicyVersion is unsupported")

    authorization = supplement_set.get("operatorAuthorization")
    errors.extend(_strict_keys(
        authorization,
        required={"authorizationId", "authorizedBy", "authorizedAt", "statement"},
        path="supplementSet.operatorAuthorization",
    ))
    if isinstance(authorization, dict):
        for key in ("authorizationId", "authorizedBy"):
            if not _valid_id(authorization.get(key)):
                errors.append(f"supplementSet.operatorAuthorization.{key} is invalid")
        if not _valid_timestamp(authorization.get("authorizedAt")):
            errors.append("supplementSet.operatorAuthorization.authorizedAt is invalid")
        if authorization.get("statement") != SUPPLEMENT_RIGHTS_STATEMENT:
            errors.append("supplementSet.operatorAuthorization.statement is unsupported")

    binding = supplement_set.get("archiveCandidateBinding")
    errors.extend(_strict_keys(
        binding,
        required={"schemaVersion", "setHash", "archiveRelease"},
        path="supplementSet.archiveCandidateBinding",
    ))
    if isinstance(binding, dict):
        if binding.get("schemaVersion") != "amc-question-context-archive-candidate-set-v1":
            errors.append("supplementSet archive candidate schema is unsupported")
        hash_error = _sha256_error(binding.get("setHash"), "supplementSet.archiveCandidateBinding.setHash")
        if hash_error:
            errors.append(hash_error)
        release = binding.get("archiveRelease")
        errors.extend(_strict_keys(
            release,
            required={"batchSchemaVersion", "releaseVersion", "sourcePath", "sourceSha256"},
            path="supplementSet.archiveCandidateBinding.archiveRelease",
        ))
        if isinstance(release, dict):
            if release.get("batchSchemaVersion") != "amc-practice-archive-release-batch-v1":
                errors.append("supplementSet archive release schema is unsupported")
            for key in ("releaseVersion", "sourcePath"):
                if not isinstance(release.get(key), str) or not release[key]:
                    errors.append(f"supplementSet.archiveCandidateBinding.archiveRelease.{key} must be non-empty")
            hash_error = _sha256_error(
                release.get("sourceSha256"), "supplementSet.archiveCandidateBinding.archiveRelease.sourceSha256"
            )
            if hash_error:
                errors.append(hash_error)

    records = supplement_set.get("supplements")
    if not isinstance(records, list) or not records or len(records) > 100:
        errors.append("supplementSet.supplements must contain 1 through 100 records")
        records = []
    seen_ids: set[str] = set()
    seen_solution_keys: set[tuple[str, str, int, str]] = set()
    for index, record in enumerate(records):
        path = f"supplementSet.supplements[{index}]"
        errors.extend(_strict_keys(
            record,
            required={
                "supplementId", "solutionId", "formId", "formVersion", "questionNumber",
                "questionContentHash", "releaseBinding", "title", "bodyMarkdown", "bodySha256",
                "provenance", "supplementRecordHash",
            },
            path=path,
        ))
        if not isinstance(record, dict):
            continue
        supplement_id = record.get("supplementId")
        if not isinstance(supplement_id, str) or _SUPPLEMENT_ID_RE.fullmatch(supplement_id) is None:
            errors.append(f"{path}.supplementId is invalid")
        elif supplement_id in seen_ids:
            errors.append(f"{path}.supplementId is duplicated")
        else:
            seen_ids.add(supplement_id)
        solution_id = record.get("solutionId")
        if not isinstance(solution_id, str) or _SOLUTION_ID_RE.fullmatch(solution_id) is None:
            errors.append(f"{path}.solutionId must match solution-9NN")
        number = record.get("questionNumber")
        if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 26):
            errors.append(f"{path}.questionNumber must be 1 through 25")
        for key in ("formId", "formVersion"):
            errors.extend(_text_errors(record.get(key), f"{path}.{key}", 160 if key == "formId" else 100))
        if isinstance(number, int) and not isinstance(number, bool) and isinstance(solution_id, str):
            solution_key = (str(record.get("formId")), str(record.get("formVersion")), number, solution_id)
            if solution_key in seen_solution_keys:
                errors.append(f"{path} duplicates a form/question/solution id")
            seen_solution_keys.add(solution_key)
        for key in ("questionContentHash", "bodySha256", "supplementRecordHash"):
            hash_error = _sha256_error(record.get(key), f"{path}.{key}")
            if hash_error:
                errors.append(hash_error)
        errors.extend(_text_errors(record.get("title"), f"{path}.title", 256))
        errors.extend(_text_errors(record.get("bodyMarkdown"), f"{path}.bodyMarkdown", 16_384))
        if isinstance(record.get("bodyMarkdown"), str) and record.get("bodySha256") != sha256_text(record["bodyMarkdown"]):
            errors.append(f"{path}.bodySha256 does not match bodyMarkdown")
        release = record.get("releaseBinding")
        errors.extend(_strict_keys(
            release,
            required={"questionBundleHash", "contentHash", "manifestHash"},
            path=f"{path}.releaseBinding",
        ))
        if isinstance(release, dict):
            for key in ("questionBundleHash", "contentHash", "manifestHash"):
                hash_error = _sha256_error(release.get(key), f"{path}.releaseBinding.{key}")
                if hash_error:
                    errors.append(hash_error)
        provenance = record.get("provenance")
        errors.extend(_strict_keys(
            provenance,
            required={"origin", "authorId", "createdAt", "rightsStatus", "rightsAuthorizationId"},
            path=f"{path}.provenance",
        ))
        if isinstance(provenance, dict):
            if provenance.get("origin") != "operator-commissioned-original":
                errors.append(f"{path}.provenance.origin is unsupported")
            if not _valid_id(provenance.get("authorId")):
                errors.append(f"{path}.provenance.authorId is invalid")
            if not _valid_timestamp(provenance.get("createdAt")):
                errors.append(f"{path}.provenance.createdAt is invalid")
            if provenance.get("rightsStatus") != "operator-attested-original-and-authorized-for-ai-use":
                errors.append(f"{path}.provenance.rightsStatus is unsupported")
            authorization_id = authorization.get("authorizationId") if isinstance(authorization, dict) else None
            if provenance.get("rightsAuthorizationId") != authorization_id:
                errors.append(f"{path}.provenance.rightsAuthorizationId does not match operator authorization")
        if not _canonical_matches(record, record.get("supplementRecordHash"), omit=("supplementRecordHash",)):
            errors.append(f"{path}.supplementRecordHash does not match canonical content")

    set_hash_error = _sha256_error(supplement_set.get("supplementSetHash"), "supplementSet.supplementSetHash")
    if set_hash_error:
        errors.append(set_hash_error)
    elif not _canonical_matches(
        supplement_set, supplement_set.get("supplementSetHash"), omit=("supplementSetHash",)
    ):
        errors.append("supplementSet.supplementSetHash does not match canonical content")

    if archive_candidate is not None:
        archive_errors = validate_archive_question_context_set(archive_candidate)
        errors.extend(f"archiveCandidate: {error}" for error in archive_errors)
        if not archive_errors and isinstance(binding, dict):
            expected_binding = {
                "schemaVersion": archive_candidate["schemaVersion"],
                "setHash": archive_candidate["setHash"],
                "archiveRelease": archive_candidate["archiveRelease"],
            }
            if binding != expected_binding:
                errors.append("supplementSet.archiveCandidateBinding does not match exact archive candidate set")
            archive_index = _archive_index(archive_candidate)
            for index, record in enumerate(records):
                if not isinstance(record, dict):
                    continue
                form_id = record.get("formId")
                form_version = record.get("formVersion")
                question_number = record.get("questionNumber")
                if (
                    not isinstance(form_id, str)
                    or not isinstance(form_version, str)
                    or isinstance(question_number, bool)
                    or not isinstance(question_number, int)
                ):
                    continue
                key = (form_id, form_version, question_number)
                match = archive_index.get(key)  # type: ignore[arg-type]
                path = f"supplementSet.supplements[{index}]"
                if match is None:
                    errors.append(f"{path} references an unknown exact form/question")
                    continue
                form, context = match
                expected_release = {
                    key: form["form"][key]
                    for key in ("questionBundleHash", "contentHash", "manifestHash")
                }
                if record.get("releaseBinding") != expected_release:
                    errors.append(f"{path}.releaseBinding does not match exact form revision")
                if record.get("questionContentHash") != canonical_hash(question_projection(context)):
                    errors.append(f"{path}.questionContentHash does not match exact released question")
                if any(solution["solutionId"] == record.get("solutionId") for solution in context["solutions"]):
                    errors.append(f"{path}.solutionId collides with an archive-source candidate")
    return errors


def compose_supplemented_archive_candidate_set(
    archive_candidate: dict[str, Any],
    supplement_set: dict[str, Any],
) -> dict[str, Any]:
    errors = validate_original_solution_supplement_set(supplement_set, archive_candidate=archive_candidate)
    if errors:
        raise ContentBuildError([f"supplement composition failed: {error}" for error in errors])
    result = {
        "schemaVersion": SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA,
        "audience": "private-review-only",
        "baseCandidateSet": archive_candidate,
        "supplementSet": supplement_set,
        "disclaimer": (
            "Private review envelope. Operator-original supplements are unapproved candidates and require "
            "an explicit review decision plus an independent active authority receipt."
        ),
    }
    result["setHash"] = canonical_hash(result)
    validation_errors = validate_supplemented_archive_candidate_set(result)
    if validation_errors:
        raise ContentBuildError([f"invalid supplemented archive candidate set: {error}" for error in validation_errors])
    return result


def validate_supplemented_archive_candidate_set(value: Any) -> list[str]:
    unicode_errors = _unicode_errors(value, "supplementedCandidateSet")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        value,
        required={"schemaVersion", "audience", "baseCandidateSet", "supplementSet", "disclaimer", "setHash"},
        path="supplementedCandidateSet",
    )
    if not isinstance(value, dict):
        return errors
    if value.get("schemaVersion") != SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA:
        errors.append(f"supplementedCandidateSet.schemaVersion must be {SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA}")
    if value.get("audience") != "private-review-only":
        errors.append("supplementedCandidateSet.audience must be private-review-only")
    if not isinstance(value.get("disclaimer"), str) or not value["disclaimer"]:
        errors.append("supplementedCandidateSet.disclaimer must be non-empty")
    base = value.get("baseCandidateSet")
    base_errors = validate_archive_question_context_set(base)
    errors.extend(f"baseCandidateSet: {error}" for error in base_errors)
    supplement = value.get("supplementSet")
    if isinstance(base, dict):
        errors.extend(validate_original_solution_supplement_set(supplement, archive_candidate=base))
    else:
        errors.extend(validate_original_solution_supplement_set(supplement))
    set_hash_error = _sha256_error(value.get("setHash"), "supplementedCandidateSet.setHash")
    if set_hash_error:
        errors.append(set_hash_error)
    elif not _canonical_matches(value, value.get("setHash"), omit=("setHash",)):
        errors.append("supplementedCandidateSet.setHash does not match canonical content")
    return errors


def supplemental_candidate_index(value: dict[str, Any]) -> dict[tuple[str, str, int, str], dict[str, Any]]:
    result: dict[tuple[str, str, int, str], dict[str, Any]] = {}
    supplement_set_hash = value["supplementSet"]["supplementSetHash"]
    for record in value["supplementSet"]["supplements"]:
        provenance = {
            "origin": "operator-original-supplement",
            "supplementId": record["supplementId"],
            "supplementSetHash": supplement_set_hash,
            "supplementRecordHash": record["supplementRecordHash"],
            "authorId": record["provenance"]["authorId"],
            "createdAt": record["provenance"]["createdAt"],
            "rightsStatus": record["provenance"]["rightsStatus"],
            "rightsAuthorizationId": record["provenance"]["rightsAuthorizationId"],
        }
        result[(record["formId"], record["formVersion"], record["questionNumber"], record["solutionId"])] = {
            "solutionId": record["solutionId"],
            "sourceOrder": int(record["solutionId"].split("-")[1]),
            "title": record["title"],
            "headingLevel": 2,
            "bodyMarkdown": record["bodyMarkdown"],
            "bodySha256": record["bodySha256"],
            "reviewStatus": "candidate",
            "quarantineReasons": [],
            "excludedSourceRanges": [],
            "sourceRef": {
                "path": f"protected-supplements/{record['supplementId']}.json",
                "sha256": record["supplementRecordHash"],
                "headingLine": 1,
                "endLine": 1,
            },
            "candidateProvenance": provenance,
        }
    return result


def _literal_markdown(value: str) -> str:
    longest = max((len(run) for run in re.findall(r"`+", value)), default=0)
    fence = "`" * max(3, longest + 1)
    return f"{fence}text\n{value.rstrip()}\n{fence}"


def supplemented_archive_candidate_set_markdown(value: dict[str, Any]) -> str:
    """Render only supplement review details, keeping every authored string inert."""

    lines = [
        "# Supplemented archive candidate envelope",
        "",
        "> **PRIVATE REVIEW ONLY.** Supplements are candidates, never approvals.",
        "",
        f"- Envelope hash: `{value['setHash']}`",
        f"- Base candidate hash: `{value['baseCandidateSet']['setHash']}`",
        f"- Supplement set hash: `{value['supplementSet']['supplementSetHash']}`",
        f"- Supplement candidates: {len(value['supplementSet']['supplements'])}",
        "",
    ]
    for record in value["supplementSet"]["supplements"]:
        lines.extend(
            [
                f"## {record['supplementId']}",
                "",
                f"- Question number: {record['questionNumber']}",
                f"- Candidate solution id: `{record['solutionId']}`",
                f"- Question content hash: `{record['questionContentHash']}`",
                f"- Supplement record hash: `{record['supplementRecordHash']}`",
                "",
                "Form id (literal):",
                "",
                _literal_markdown(record["formId"]),
                "",
                "Form version (literal):",
                "",
                _literal_markdown(record["formVersion"]),
                "",
                "Title (literal):",
                "",
                _literal_markdown(record["title"]),
                "",
                "Body (literal):",
                "",
                _literal_markdown(record["bodyMarkdown"]),
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"
