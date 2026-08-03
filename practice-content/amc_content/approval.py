"""Compile explicitly reviewed solution context for private AI use.

Candidate extraction and approval are intentionally separate trust domains.
This module never infers approval: every emitted solution must have one exact,
hash-bound review decision in a separately supplied document and one active
receipt from an independent approval authority.

The original human-review v1 contract remains immutable.  A separate v2
contract records operator-delegated, AI-assisted review honestly; it must
never be described as human review.
"""

from __future__ import annotations

import json
import os
import re
import stat
from datetime import datetime
from pathlib import Path
from typing import Any

from .builder import ContentBuildError
from .canonical import canonical_hash, sha256_text
from .question_context import (
    _sha256_error,
    _strict_keys,
    validate_archive_question_context_set,
    validate_question_context_set,
)
from .supplement import (
    SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA,
    supplemental_candidate_index,
    validate_supplemented_archive_candidate_set,
)


REVIEW_DECISIONS_SCHEMA = "amc-question-context-review-decisions-v1"
AI_ASSISTED_REVIEW_DECISIONS_SCHEMA = "amc-question-context-review-decisions-v2"
APPROVAL_RECEIPT_SET_SCHEMA = "amc-solution-approval-receipt-set-v1"
APPROVED_CONTEXT_SET_SCHEMA = "amc-approved-question-context-set-v1"
APPROVED_TEST_CONTEXT_SET_SCHEMA = "amc-approved-question-context-test-set-v1"
APPROVED_ARCHIVE_SET_SCHEMA = "amc-approved-question-context-archive-set-v1"
APPROVAL_POLICY_VERSION = "amc-explicit-human-solution-approval-v1"
AI_ASSISTED_APPROVAL_POLICY_VERSION = "amc-operator-delegated-ai-assisted-solution-approval-v1"
AI_ASSISTED_APPROVED_CONTEXT_SET_SCHEMA = "amc-approved-question-context-set-v2"
AI_ASSISTED_APPROVED_TEST_CONTEXT_SET_SCHEMA = "amc-approved-question-context-test-set-v2"
AI_ASSISTED_APPROVED_ARCHIVE_SET_SCHEMA = "amc-approved-question-context-archive-set-v2"
AI_ASSISTED_REVIEW_METHOD = "operator-delegated-ai-assisted"
AI_ASSISTED_AUTHORIZATION_SCOPE = "solution-correctness-pedagogy-and-rights-review"
AI_ASSISTED_AUTHORIZATION_STATEMENT = "operator-delegates-ai-assisted-solution-review"
AI_ASSISTED_RIGHTS_ATTESTATION = "operator-attests-rights-for-reviewed-source-ai-use"
MINIMUM_APPROVED_SOLUTIONS = 2
MAX_APPROVAL_INPUT_BYTES = 64 * 1024 * 1024
MAX_MODEL_PROMPT_BYTES = 16_384
MAX_MODEL_CHOICE_BYTES = 2_048
MAX_MODEL_SOLUTION_TITLE_BYTES = 256
MAX_MODEL_SOLUTION_BODY_BYTES = 16_384
MAX_MODEL_SOLUTIONS = 8

_SOLUTION_ID_RE = re.compile(r"solution-[0-9]{3}")
_SUPPLEMENT_SOLUTION_ID_RE = re.compile(r"solution-9[0-9]{2}")
_SUPPLEMENT_ID_RE = re.compile(r"supplement-[a-z0-9][a-z0-9-]{2,63}")
_REVIEWER_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}")
_TAG_RE = re.compile(r"[a-z0-9][a-z0-9-]{0,63}")
_UTC_TIMESTAMP_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z")
_VISUAL_REFERENCE_RE = re.compile(
    r"!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])"
    r"|<(?:img|picture|svg)\b|\\includegraphics\b"
    r"|^[ \t]*(?:`{3,}|~{3,})[ \t]*asy\b|\[asy\]|\\begin[ \t]*\{asy\}"
    r"|\[\[(?:File|Image):[^\]\n]+\]\]"
    r"|\[[^\]\n]*\]\([^\)\n]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\)\s]*)?|[/=?](?:File|Image):)[^\)\n]*\)"
    r"|^[ \t]*\[[^\]\n]+\]:[ \t]*<?[^\s>]*(?:\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#][^\s>]*)?|[/=?](?:File|Image):)[^\s>]*>?",
    re.IGNORECASE | re.MULTILINE,
)
_REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def _is_ai_assisted_policy(value: Any) -> bool:
    return isinstance(value, dict) and (
        value.get("schemaVersion") == AI_ASSISTED_REVIEW_DECISIONS_SCHEMA
        or value.get("approvalPolicyVersion") == AI_ASSISTED_APPROVAL_POLICY_VERSION
    )


def _review_schema_for_policy(policy: Any) -> str | None:
    if policy == APPROVAL_POLICY_VERSION:
        return REVIEW_DECISIONS_SCHEMA
    if policy == AI_ASSISTED_APPROVAL_POLICY_VERSION:
        return AI_ASSISTED_REVIEW_DECISIONS_SCHEMA
    return None


def _approved_schema_for_policy(policy: Any, *, test_only: bool) -> str | None:
    if policy == APPROVAL_POLICY_VERSION:
        return APPROVED_TEST_CONTEXT_SET_SCHEMA if test_only else APPROVED_CONTEXT_SET_SCHEMA
    if policy == AI_ASSISTED_APPROVAL_POLICY_VERSION:
        return AI_ASSISTED_APPROVED_TEST_CONTEXT_SET_SCHEMA if test_only else AI_ASSISTED_APPROVED_CONTEXT_SET_SCHEMA
    return None


def _approved_archive_schema_for_policy(policy: Any) -> str | None:
    if policy == APPROVAL_POLICY_VERSION:
        return APPROVED_ARCHIVE_SET_SCHEMA
    if policy == AI_ASSISTED_APPROVAL_POLICY_VERSION:
        return AI_ASSISTED_APPROVED_ARCHIVE_SET_SCHEMA
    return None


def _unicode_scalar_errors(value: Any, path: str) -> list[str]:
    """Reject malformed Unicode anywhere before a validator computes hashes."""

    errors: list[str] = []
    if isinstance(value, str):
        if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
            errors.append(f"{path} contains an unpaired UTF-16 surrogate")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            errors.extend(_unicode_scalar_errors(item, f"{path}[{index}]"))
    elif isinstance(value, dict):
        for key, item in value.items():
            if isinstance(key, str):
                errors.extend(_unicode_scalar_errors(key, f"{path}.<key>"))
                child = f"{path}.{key}"
            else:
                child = f"{path}.<non-string-key>"
            errors.extend(_unicode_scalar_errors(item, child))
    return errors


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _validate_protected_input(path: Path, descriptor_stat: os.stat_result) -> None:
    lexical = Path(os.path.abspath(path))
    parent = lexical.parent
    try:
        parent_stat = parent.stat(follow_symlinks=False)
    except OSError as error:
        raise ContentBuildError([f"cannot inspect protected approval input parent {parent}: {error}"]) from error
    if stat.S_ISLNK(parent_stat.st_mode) or not stat.S_ISDIR(parent_stat.st_mode):
        raise ContentBuildError([f"protected approval input parent must be a real directory: {parent}"])
    for label, inspected in (("input", descriptor_stat), ("parent", parent_stat)):
        if inspected.st_uid != os.geteuid():
            raise ContentBuildError([f"protected approval {label} must be owned by effective uid"])
        if stat.S_IMODE(inspected.st_mode) & 0o077:
            raise ContentBuildError([f"protected approval {label} must not grant group/world permissions"])
    resolved_parent = parent.resolve(strict=True)
    resolved_path = resolved_parent / lexical.name
    forbidden = (_REPOSITORY_ROOT, _REPOSITORY_ROOT / "static", _REPOSITORY_ROOT / "public")
    if any(_is_within(resolved_path, root.resolve()) for root in forbidden if root.exists()):
        raise ContentBuildError(["protected approval inputs must be outside repository/static/public roots"])


def load_strict_json(path: Path, *, require_protected: bool = False) -> dict[str, Any]:
    """Load bounded UTF-8 JSON while rejecting duplicate object keys."""

    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_NONBLOCK", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise ContentBuildError([f"cannot securely open approval input {path}: {error}"]) from error
    try:
        inspected = os.fstat(descriptor)
        if not stat.S_ISREG(inspected.st_mode):
            raise ContentBuildError([f"approval input must be a regular file: {path}"])
        if inspected.st_size > MAX_APPROVAL_INPUT_BYTES:
            raise ContentBuildError([f"approval input exceeds {MAX_APPROVAL_INPUT_BYTES} bytes: {path}"])
        if require_protected:
            _validate_protected_input(path, inspected)
        chunks: list[bytes] = []
        total = 0
        while total <= MAX_APPROVAL_INPUT_BYTES:
            chunk = os.read(descriptor, min(1024 * 1024, MAX_APPROVAL_INPUT_BYTES + 1 - total))
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
        if total > MAX_APPROVAL_INPUT_BYTES:
            raise ContentBuildError([f"approval input exceeds {MAX_APPROVAL_INPUT_BYTES} bytes: {path}"])
        raw = b"".join(chunks)
    except OSError as error:
        raise ContentBuildError([f"cannot securely read approval input {path}: {error}"]) from error
    finally:
        os.close(descriptor)
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        raise ContentBuildError([f"approval input is not valid UTF-8: {path}"]) from error

    def reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON object key: {key}")
            result[key] = value
        return result

    try:
        decoded = json.loads(text, object_pairs_hook=reject_duplicates)
    except (json.JSONDecodeError, ValueError) as error:
        raise ContentBuildError([f"approval input is invalid strict JSON {path}: {error}"]) from error
    if not isinstance(decoded, dict):
        raise ContentBuildError([f"approval input must be a JSON object: {path}"])
    unicode_errors = _unicode_scalar_errors(decoded, "approvalInput")
    if unicode_errors:
        raise ContentBuildError([f"approval input is invalid strict JSON {path}: {error}" for error in unicode_errors])
    return decoded


def decision_record_projection(record: dict[str, Any], decisions: dict[str, Any]) -> dict[str, Any]:
    binding = decisions["candidateSetBinding"]
    projection = {
        "approvalPolicyVersion": decisions["approvalPolicyVersion"],
        "candidateSchemaVersion": binding["schemaVersion"],
        "candidateSetHash": binding["setHash"],
        "formId": record["formId"],
        "formVersion": record["formVersion"],
        "questionNumber": record["questionNumber"],
        "solutionId": record["solutionId"],
        "decision": record["decision"],
        "bodySha256": record["bodySha256"],
        "sourceRef": record["sourceRef"],
        "reviewerId": record["reviewerId"],
        "reviewedAt": record["reviewedAt"],
        "rightsStatus": record["rightsStatus"],
        "qualityFlags": record["qualityFlags"],
        "methodTags": record["methodTags"],
    }
    if _is_ai_assisted_policy(decisions):
        projection.update(
            {
                "reviewMethod": record["reviewMethod"],
                "reviewModel": record["reviewModel"],
                "operatorAuthorizationId": record["operatorAuthorizationId"],
                "operatorAuthorization": decisions["operatorAuthorization"],
                "candidateProvenance": record["candidateProvenance"],
                "questionContentHash": record["questionContentHash"],
            }
        )
    return projection


def decision_record_hash(record: dict[str, Any], decisions: dict[str, Any]) -> str:
    return canonical_hash(decision_record_projection(record, decisions))


def validate_approval_receipt_set(receipts: Any, *, decisions: dict[str, Any] | None = None) -> list[str]:
    unicode_errors = _unicode_scalar_errors(receipts, "approvalReceipts")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        receipts,
        required={"schemaVersion", "audience", "authorityId", "receipts", "receiptSetHash"},
        path="approvalReceipts",
    )
    if errors or not isinstance(receipts, dict):
        return errors
    if receipts.get("schemaVersion") != APPROVAL_RECEIPT_SET_SCHEMA:
        errors.append(f"approvalReceipts.schemaVersion must be {APPROVAL_RECEIPT_SET_SCHEMA}")
    if receipts.get("audience") != "private-approval-authority-allowlist":
        errors.append("approvalReceipts.audience must be private-approval-authority-allowlist")
    authority_id = receipts.get("authorityId")
    if not isinstance(authority_id, str) or _REVIEWER_ID_RE.fullmatch(authority_id) is None:
        errors.append("approvalReceipts.authorityId is invalid")
    records = receipts.get("receipts")
    if not isinstance(records, list):
        errors.append("approvalReceipts.receipts must be an array")
        records = []
    elif len(records) > 10_000:
        errors.append("approvalReceipts.receipts must contain at most 10000 records")
    seen_receipts: set[str] = set()
    active_by_decision: dict[str, int] = {}
    total_by_decision: dict[str, int] = {}
    for index, receipt in enumerate(records):
        path = f"approvalReceipts.receipts[{index}]"
        errors.extend(_strict_keys(
            receipt,
            required={"receiptId", "authorityId", "decisionRecordHash", "issuedAt", "status"},
            path=path,
        ))
        if not isinstance(receipt, dict):
            continue
        receipt_id = receipt.get("receiptId")
        if not isinstance(receipt_id, str) or _REVIEWER_ID_RE.fullmatch(receipt_id) is None:
            errors.append(f"{path}.receiptId is invalid")
        elif receipt_id in seen_receipts:
            errors.append(f"{path}.receiptId is duplicated")
        else:
            seen_receipts.add(receipt_id)
        if receipt.get("authorityId") != authority_id:
            errors.append(f"{path}.authorityId does not match receipt set")
        hash_error = _sha256_error(receipt.get("decisionRecordHash"), f"{path}.decisionRecordHash")
        if hash_error:
            errors.append(hash_error)
        if not _valid_utc_timestamp(receipt.get("issuedAt")):
            errors.append(f"{path}.issuedAt must be a valid UTC RFC3339 timestamp")
        status_value = receipt.get("status")
        if not isinstance(status_value, str) or status_value not in {"active", "revoked"}:
            errors.append(f"{path}.status must be active or revoked")
        if receipt.get("status") == "active" and isinstance(receipt.get("decisionRecordHash"), str):
            decision_hash = receipt["decisionRecordHash"]
            active_by_decision[decision_hash] = active_by_decision.get(decision_hash, 0) + 1
        if isinstance(receipt.get("decisionRecordHash"), str):
            decision_hash = receipt["decisionRecordHash"]
            total_by_decision[decision_hash] = total_by_decision.get(decision_hash, 0) + 1
    hash_error = _sha256_error(receipts.get("receiptSetHash"), "approvalReceipts.receiptSetHash")
    if hash_error:
        errors.append(hash_error)
    elif receipts.get("receiptSetHash") != canonical_hash(receipts, omit=("receiptSetHash",)):
        errors.append("approvalReceipts.receiptSetHash does not match canonical content")
    if decisions is not None and isinstance(decisions, dict):
        decision_records = decisions.get("decisions")
        if isinstance(decision_records, list):
            for index, decision in enumerate(decision_records):
                if not isinstance(decision, dict):
                    continue
                decision_hash = decision.get("decisionRecordHash")
                if (
                    not isinstance(decision_hash, str)
                    or total_by_decision.get(decision_hash, 0) != 1
                    or active_by_decision.get(decision_hash, 0) != 1
                ):
                    errors.append(
                        f"reviewDecisions.decisions[{index}] must have exactly one active approval-authority receipt"
                    )
            if _is_ai_assisted_policy(decisions):
                reviewer_ids = {
                    reviewer_id
                    for record in decision_records
                    if isinstance(record, dict)
                    and isinstance((reviewer_id := record.get("reviewerId")), str)
                }
                authorization = decisions.get("operatorAuthorization")
                authorized_by = authorization.get("authorizedBy") if isinstance(authorization, dict) else None
                if isinstance(authority_id, str) and (
                    authority_id in reviewer_ids or authority_id == authorized_by
                ):
                    errors.append(
                        "approvalReceipts.authorityId must identify an authority distinct from the AI-assisted "
                        "reviewer and authorizing operator"
                    )
    return errors


def _safe_relative_path(value: Any, path: str) -> str | None:
    if not isinstance(value, str) or not value:
        return f"{path} must be non-empty"
    if Path(value).is_absolute() or "\\" in value or ".." in Path(value).parts:
        return f"{path} must be a safe relative POSIX path"
    return None


def _validate_tags(value: Any, path: str, *, require_one: bool) -> list[str]:
    if not isinstance(value, list):
        return [f"{path} must be an array"]
    errors: list[str] = []
    if require_one and not value:
        errors.append(f"{path} must contain at least one tag")
    if len(value) > 32:
        errors.append(f"{path} must contain at most 32 tags")
    if any(not isinstance(item, str) or _TAG_RE.fullmatch(item) is None for item in value):
        errors.append(f"{path} entries must be lowercase kebab-case tags of at most 64 characters")
    if len(value) != len(set(item for item in value if isinstance(item, str))):
        errors.append(f"{path} must not contain duplicate tags")
    return errors


def _valid_utc_timestamp(value: Any) -> bool:
    if not isinstance(value, str) or _UTC_TIMESTAMP_RE.fullmatch(value) is None:
        return False
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def _contains_visual_reference(value: Any) -> bool:
    return isinstance(value, str) and _VISUAL_REFERENCE_RE.search(value) is not None


def _model_text_errors(value: Any, path: str, *, maximum_bytes: int) -> list[str]:
    if not isinstance(value, str) or not value:
        return [f"{path} must be non-empty"]
    errors: list[str] = []
    if re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]", value):
        errors.append(f"{path} contains a disallowed control or Unicode replacement character")
    if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
        errors.append(f"{path} contains an unpaired UTF-16 surrogate")
    try:
        size = len(value.encode("utf-8"))
    except UnicodeEncodeError:
        errors.append(f"{path} is not valid Unicode text")
        return errors
    if size > maximum_bytes:
        errors.append(f"{path} must be at most {maximum_bytes} UTF-8 bytes, found {size}")
    return errors


def _candidate_form_records(candidate_set: dict[str, Any]) -> list[dict[str, Any]]:
    if candidate_set.get("schemaVersion") == "amc-question-context-candidate-set-v1":
        return [{"form": candidate_set["form"], "questions": candidate_set["questions"]}]
    if candidate_set.get("schemaVersion") == SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA:
        return candidate_set["baseCandidateSet"]["forms"]
    return candidate_set["forms"]


def _candidate_archive_release(candidate_set: dict[str, Any]) -> dict[str, Any]:
    if candidate_set.get("schemaVersion") == SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA:
        return candidate_set["baseCandidateSet"]["archiveRelease"]
    return candidate_set["archiveRelease"]


def _validate_candidate_set(candidate_set: Any) -> list[str]:
    if not isinstance(candidate_set, dict):
        return ["candidateSet must be an object"]
    if candidate_set.get("schemaVersion") == "amc-question-context-candidate-set-v1":
        return validate_question_context_set(candidate_set)
    if candidate_set.get("schemaVersion") == "amc-question-context-archive-candidate-set-v1":
        return validate_archive_question_context_set(candidate_set)
    if candidate_set.get("schemaVersion") == SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA:
        return validate_supplemented_archive_candidate_set(candidate_set)
    return ["candidateSet.schemaVersion is unsupported"]


def _candidate_index(candidate_set: dict[str, Any]) -> dict[tuple[str, str, int, str], dict[str, Any]]:
    result: dict[tuple[str, str, int, str], dict[str, Any]] = {}
    for form_record in _candidate_form_records(candidate_set):
        form = form_record["form"]
        for context in form_record["questions"]:
            number = context["question"]["number"]
            for solution in context["solutions"]:
                result[(form["id"], form["version"], number, solution["solutionId"])] = solution
    if candidate_set.get("schemaVersion") == SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA:
        result.update(supplemental_candidate_index(candidate_set))
    return result


def _candidate_provenance(candidate: dict[str, Any]) -> dict[str, Any]:
    if isinstance(candidate.get("candidateProvenance"), dict):
        return candidate["candidateProvenance"]
    source_ref = candidate["sourceRef"]
    return {
        "origin": "source-markdown",
        "sourcePath": source_ref["path"],
        "sourceSha256": source_ref["sha256"],
    }


def _validate_candidate_provenance(value: Any, path: str) -> list[str]:
    if not isinstance(value, dict):
        return [f"{path} must be an object"]
    origin = value.get("origin")
    if origin == "source-markdown":
        errors = _strict_keys(value, required={"origin", "sourcePath", "sourceSha256"}, path=path)
        path_error = _safe_relative_path(value.get("sourcePath"), f"{path}.sourcePath")
        if path_error:
            errors.append(path_error)
        hash_error = _sha256_error(value.get("sourceSha256"), f"{path}.sourceSha256")
        if hash_error:
            errors.append(hash_error)
        return errors
    if origin == "operator-original-supplement":
        errors = _strict_keys(
            value,
            required={
                "origin", "supplementId", "supplementSetHash", "supplementRecordHash", "authorId",
                "createdAt", "rightsStatus", "rightsAuthorizationId",
            },
            path=path,
        )
        for key in ("supplementSetHash", "supplementRecordHash"):
            hash_error = _sha256_error(value.get(key), f"{path}.{key}")
            if hash_error:
                errors.append(hash_error)
        supplement_id = value.get("supplementId")
        if not isinstance(supplement_id, str) or _SUPPLEMENT_ID_RE.fullmatch(supplement_id) is None:
            errors.append(f"{path}.supplementId is invalid")
        for key in ("authorId", "rightsAuthorizationId"):
            if not isinstance(value.get(key), str) or _REVIEWER_ID_RE.fullmatch(value[key]) is None:
                errors.append(f"{path}.{key} is invalid")
        if not _valid_utc_timestamp(value.get("createdAt")):
            errors.append(f"{path}.createdAt is invalid")
        if value.get("rightsStatus") != "operator-attested-original-and-authorized-for-ai-use":
            errors.append(f"{path}.rightsStatus is unsupported")
        return errors
    return [f"{path}.origin is unsupported"]


def _validate_operator_authorization(value: Any, path: str) -> list[str]:
    errors = _strict_keys(
        value,
        required={"authorizationId", "authorizedBy", "authorizedAt", "scope", "statement", "rightsAttestation"},
        path=path,
    )
    if not isinstance(value, dict):
        return errors
    for key in ("authorizationId", "authorizedBy"):
        item = value.get(key)
        if not isinstance(item, str) or _REVIEWER_ID_RE.fullmatch(item) is None:
            errors.append(f"{path}.{key} is invalid")
    if not _valid_utc_timestamp(value.get("authorizedAt")):
        errors.append(f"{path}.authorizedAt must be a valid UTC RFC3339 timestamp")
    if value.get("scope") != AI_ASSISTED_AUTHORIZATION_SCOPE:
        errors.append(f"{path}.scope is unsupported")
    if value.get("statement") != AI_ASSISTED_AUTHORIZATION_STATEMENT:
        errors.append(f"{path}.statement is unsupported")
    if value.get("rightsAttestation") != AI_ASSISTED_RIGHTS_ATTESTATION:
        errors.append(f"{path}.rightsAttestation is unsupported")
    return errors


def _validate_review_model(value: Any, path: str) -> list[str]:
    errors = _strict_keys(value, required={"provider", "model", "runId"}, path=path)
    if not isinstance(value, dict):
        return errors
    for key, maximum_bytes in (("provider", 128), ("model", 256), ("runId", 256)):
        errors.extend(_model_text_errors(value.get(key), f"{path}.{key}", maximum_bytes=maximum_bytes))
    return errors


def _validate_review_governance(value: Any, path: str) -> list[str]:
    errors = _strict_keys(value, required={"reviewMethod", "operatorAuthorization"}, path=path)
    if not isinstance(value, dict):
        return errors
    if value.get("reviewMethod") != AI_ASSISTED_REVIEW_METHOD:
        errors.append(f"{path}.reviewMethod must be {AI_ASSISTED_REVIEW_METHOD}")
    errors.extend(_validate_operator_authorization(value.get("operatorAuthorization"), f"{path}.operatorAuthorization"))
    return errors


def validate_review_decisions(
    decisions: Any,
    *,
    candidate_set: dict[str, Any] | None = None,
) -> list[str]:
    """Strictly validate one supported review policy and exact bindings."""

    unicode_errors = _unicode_scalar_errors(decisions, "reviewDecisions")
    if unicode_errors:
        return unicode_errors
    if not isinstance(decisions, dict):
        return ["reviewDecisions must be an object"]
    schema_version = decisions.get("schemaVersion")
    ai_assisted = schema_version == AI_ASSISTED_REVIEW_DECISIONS_SCHEMA
    root_required = {
        "schemaVersion", "audience", "approvalPolicyVersion", "candidateSetBinding",
        "decisions", "decisionSetHash",
    }
    if ai_assisted:
        root_required.add("operatorAuthorization")
    errors = _strict_keys(
        decisions,
        required=root_required,
        path="reviewDecisions",
    )
    if schema_version not in (REVIEW_DECISIONS_SCHEMA, AI_ASSISTED_REVIEW_DECISIONS_SCHEMA):
        errors.append("reviewDecisions.schemaVersion is unsupported")
    expected_audience = (
        "private-operator-delegated-ai-assisted-review-input" if ai_assisted
        else "private-human-review-input"
    )
    if decisions.get("audience") != expected_audience:
        errors.append(f"reviewDecisions.audience must be {expected_audience}")
    expected_policy = AI_ASSISTED_APPROVAL_POLICY_VERSION if ai_assisted else APPROVAL_POLICY_VERSION
    if decisions.get("approvalPolicyVersion") != expected_policy:
        errors.append("reviewDecisions approval policy/schema pairing is unsupported")
    operator_authorization = decisions.get("operatorAuthorization")
    if ai_assisted:
        errors.extend(_validate_operator_authorization(operator_authorization, "reviewDecisions.operatorAuthorization"))

    binding = decisions.get("candidateSetBinding")
    errors.extend(
        _strict_keys(
            binding,
            required={"schemaVersion", "setHash", "forms"},
            path="reviewDecisions.candidateSetBinding",
        )
    )
    selected_forms: set[tuple[str, str]] = set()
    if isinstance(binding, dict):
        binding_schema = binding.get("schemaVersion")
        supported_binding_schemas = {
            "amc-question-context-candidate-set-v1",
            "amc-question-context-archive-candidate-set-v1",
        }
        if ai_assisted:
            supported_binding_schemas.add(SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA)
        if not isinstance(binding_schema, str) or binding_schema not in supported_binding_schemas:
            errors.append("reviewDecisions.candidateSetBinding.schemaVersion is unsupported")
        hash_error = _sha256_error(binding.get("setHash"), "reviewDecisions.candidateSetBinding.setHash")
        if hash_error:
            errors.append(hash_error)
        forms = binding.get("forms")
        if not isinstance(forms, list) or not forms or len(forms) > 48:
            errors.append("reviewDecisions.candidateSetBinding.forms must contain 1 through 48 forms")
        else:
            for index, form in enumerate(forms):
                path = f"reviewDecisions.candidateSetBinding.forms[{index}]"
                errors.extend(_strict_keys(form, required={"id", "version"}, path=path))
                if not isinstance(form, dict):
                    continue
                form_id = form.get("id")
                version = form.get("version")
                if not isinstance(form_id, str) or not form_id or not isinstance(version, str) or not version:
                    errors.append(f"{path} id/version must be non-empty strings")
                    continue
                key = (form_id, version)
                if key in selected_forms:
                    errors.append(f"{path} duplicates selected form {form_id}@{version}")
                selected_forms.add(key)

    records = decisions.get("decisions")
    seen: set[tuple[str, str, int, str]] = set()
    if not isinstance(records, list):
        errors.append("reviewDecisions.decisions must be an array")
        records = []
    elif len(records) > 10_000:
        errors.append("reviewDecisions.decisions must contain at most 10000 records")
    for index, record in enumerate(records):
        path = f"reviewDecisions.decisions[{index}]"
        record_required = {
            "formId", "formVersion", "questionNumber", "solutionId", "decision", "bodySha256", "sourceRef",
            "reviewerId", "reviewedAt", "rightsStatus", "qualityFlags", "methodTags", "decisionRecordHash",
        }
        if ai_assisted:
            record_required.update({
                "reviewMethod", "reviewModel", "operatorAuthorizationId", "candidateProvenance", "questionContentHash",
            })
        errors.extend(
            _strict_keys(
                record,
                required=record_required,
                path=path,
            )
        )
        if not isinstance(record, dict):
            continue
        form_id = record.get("formId")
        form_version = record.get("formVersion")
        if not isinstance(form_id, str) or not form_id:
            errors.append(f"{path}.formId must be non-empty")
        if not isinstance(form_version, str) or not form_version:
            errors.append(f"{path}.formVersion must be non-empty")
        if isinstance(form_id, str) and isinstance(form_version, str) and (form_id, form_version) not in selected_forms:
            errors.append(f"{path} references a form not selected in candidateSetBinding")
        number = record.get("questionNumber")
        if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 26):
            errors.append(f"{path}.questionNumber must be an integer from 1 through 25")
        solution_id = record.get("solutionId")
        if not isinstance(solution_id, str) or _SOLUTION_ID_RE.fullmatch(solution_id) is None:
            errors.append(f"{path}.solutionId must match solution-NNN")
        if isinstance(number, int) and not isinstance(number, bool) and isinstance(solution_id, str):
            key = (str(form_id), str(form_version), number, solution_id)
            if key in seen:
                errors.append(f"{path} duplicates approval for {form_id}@{form_version} question {number} {solution_id}")
            seen.add(key)
        if record.get("decision") != "approved":
            errors.append(f"{path}.decision must be approved; omission represents no approval")
        hash_error = _sha256_error(record.get("bodySha256"), f"{path}.bodySha256")
        if hash_error:
            errors.append(hash_error)
        source_ref = record.get("sourceRef")
        errors.extend(_strict_keys(source_ref, required={"path", "sha256"}, path=f"{path}.sourceRef"))
        if isinstance(source_ref, dict):
            path_error = _safe_relative_path(source_ref.get("path"), f"{path}.sourceRef.path")
            if path_error:
                errors.append(path_error)
            hash_error = _sha256_error(source_ref.get("sha256"), f"{path}.sourceRef.sha256")
            if hash_error:
                errors.append(hash_error)
        reviewer_id = record.get("reviewerId")
        if not isinstance(reviewer_id, str) or _REVIEWER_ID_RE.fullmatch(reviewer_id) is None:
            errors.append(f"{path}.reviewerId has an invalid opaque identifier")
        if not _valid_utc_timestamp(record.get("reviewedAt")):
            errors.append(f"{path}.reviewedAt must be a valid UTC RFC3339 timestamp")
        if record.get("rightsStatus") != "approved-for-ai-use":
            errors.append(f"{path}.rightsStatus must be approved-for-ai-use")
        errors.extend(_validate_tags(record.get("qualityFlags"), f"{path}.qualityFlags", require_one=False))
        errors.extend(_validate_tags(record.get("methodTags"), f"{path}.methodTags", require_one=True))
        if ai_assisted:
            if record.get("reviewMethod") != AI_ASSISTED_REVIEW_METHOD:
                errors.append(f"{path}.reviewMethod must be {AI_ASSISTED_REVIEW_METHOD}")
            errors.extend(_validate_review_model(record.get("reviewModel"), f"{path}.reviewModel"))
            authorized_by = (
                operator_authorization.get("authorizedBy")
                if isinstance(operator_authorization, dict) else None
            )
            if reviewer_id == authorized_by:
                errors.append(f"{path}.reviewerId must differ from the authorizing operator")
            authorization_id = (
                operator_authorization.get("authorizationId")
                if isinstance(operator_authorization, dict) else None
            )
            if record.get("operatorAuthorizationId") != authorization_id:
                errors.append(f"{path}.operatorAuthorizationId does not match review authorization")
            errors.extend(_validate_candidate_provenance(record.get("candidateProvenance"), f"{path}.candidateProvenance"))
            if (
                isinstance(record.get("candidateProvenance"), dict)
                and record["candidateProvenance"].get("origin") == "operator-original-supplement"
            ):
                if not isinstance(solution_id, str) or _SUPPLEMENT_SOLUTION_ID_RE.fullmatch(solution_id) is None:
                    errors.append(f"{path}.solutionId must use reserved solution-9NN for a supplement")
                if reviewer_id == record["candidateProvenance"].get("authorId"):
                    errors.append(f"{path}.reviewerId must differ from the supplement author")
            hash_error = _sha256_error(record.get("questionContentHash"), f"{path}.questionContentHash")
            if hash_error:
                errors.append(hash_error)
        record_hash_error = _sha256_error(record.get("decisionRecordHash"), f"{path}.decisionRecordHash")
        if record_hash_error:
            errors.append(record_hash_error)
        else:
            try:
                expected_record_hash = decision_record_hash(record, decisions)
            except (KeyError, TypeError, ValueError):
                errors.append(f"{path}.decisionRecordHash cannot be computed from malformed decision fields")
            else:
                if record.get("decisionRecordHash") != expected_record_hash:
                    errors.append(f"{path}.decisionRecordHash does not match canonical decision record")

    hash_error = _sha256_error(decisions.get("decisionSetHash"), "reviewDecisions.decisionSetHash")
    if hash_error:
        errors.append(hash_error)
    elif decisions.get("decisionSetHash") != canonical_hash(decisions, omit=("decisionSetHash",)):
        errors.append("reviewDecisions.decisionSetHash does not match canonical content")

    if candidate_set is None:
        return errors
    candidate_errors = _validate_candidate_set(candidate_set)
    if candidate_errors:
        errors.extend(f"candidateSet: {error}" for error in candidate_errors)
        return errors
    if isinstance(binding, dict):
        available_forms = {
            (record["form"]["id"], record["form"]["version"])
            for record in _candidate_form_records(candidate_set)
        }
        if binding.get("schemaVersion") != candidate_set["schemaVersion"]:
            errors.append("reviewDecisions candidate schemaVersion binding does not match candidate set")
        if binding.get("setHash") != candidate_set["setHash"]:
            errors.append("reviewDecisions candidate setHash binding does not match candidate set")
        unknown_selected = selected_forms - available_forms
        if unknown_selected:
            errors.append("reviewDecisions selects an unknown form id/version")
        if candidate_set["schemaVersion"] == "amc-question-context-candidate-set-v1" and selected_forms != available_forms:
            errors.append("single-form candidate decisions must select its exact form id/version")

    candidates = _candidate_index(candidate_set)
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            continue
        form_id = record.get("formId")
        form_version = record.get("formVersion")
        number = record.get("questionNumber")
        solution_id = record.get("solutionId")
        if (
            not isinstance(form_id, str) or not isinstance(form_version, str)
            or isinstance(number, bool) or not isinstance(number, int)
            or not isinstance(solution_id, str)
        ):
            continue
        key = (form_id, form_version, number, solution_id)
        candidate = candidates.get(key)  # type: ignore[arg-type]
        path = f"reviewDecisions.decisions[{index}]"
        if candidate is None:
            errors.append(f"{path} references an unknown question/solution")
            continue
        if candidate["reviewStatus"] == "quarantined":
            errors.append(f"{path} cannot approve a quarantined solution")
        if record.get("bodySha256") != candidate["bodySha256"]:
            errors.append(f"{path}.bodySha256 does not match candidate solution")
        source_ref = record.get("sourceRef")
        if not isinstance(source_ref, dict) or source_ref.get("path") != candidate["sourceRef"]["path"]:
            errors.append(f"{path}.sourceRef.path does not match candidate solution")
        if not isinstance(source_ref, dict) or source_ref.get("sha256") != candidate["sourceRef"]["sha256"]:
            errors.append(f"{path}.sourceRef.sha256 does not match candidate solution")
        if ai_assisted and record.get("candidateProvenance") != _candidate_provenance(candidate):
            errors.append(f"{path}.candidateProvenance does not match candidate solution")
        if ai_assisted:
            expected_question_hash = next(
                canonical_hash(_question_content_projection(context))
                for form_record in _candidate_form_records(candidate_set)
                if form_record["form"]["id"] == form_id and form_record["form"]["version"] == form_version
                for context in form_record["questions"]
                if context["question"]["number"] == number
            )
            if record.get("questionContentHash") != expected_question_hash:
                errors.append(f"{path}.questionContentHash does not match exact candidate question")
    return errors


def _question_content_projection(context: dict[str, Any]) -> dict[str, Any]:
    question = context["question"]
    return {
        "number": question["number"],
        "sourceRef": question["sourceRef"],
        "promptMarkdown": question["promptMarkdown"],
        "choices": question["choices"],
    }


def compile_approved_question_context_set(
    candidate_set: dict[str, Any],
    review_decisions: dict[str, Any],
    approval_receipts: dict[str, Any],
    *,
    allow_test_only: bool = False,
) -> dict[str, Any]:
    """Compile one form set, or an archive wrapper containing selected forms."""

    errors = validate_review_decisions(review_decisions, candidate_set=candidate_set)
    errors.extend(validate_approval_receipt_set(approval_receipts, decisions=review_decisions))
    if errors:
        raise ContentBuildError([f"approval compilation failed: {error}" for error in errors])
    decision_index = {
        (record["formId"], record["formVersion"], record["questionNumber"], record["solutionId"]): record
        for record in review_decisions["decisions"]
    }
    candidate_index = _candidate_index(candidate_set)
    receipt_index = {
        receipt["decisionRecordHash"]: receipt
        for receipt in approval_receipts["receipts"]
        if receipt["status"] == "active"
    }
    selected = {
        (form["id"], form["version"])
        for form in review_decisions["candidateSetBinding"]["forms"]
    }
    approval_policy = review_decisions["approvalPolicyVersion"]
    review_schema = review_decisions["schemaVersion"]
    review_governance = None
    if approval_policy == AI_ASSISTED_APPROVAL_POLICY_VERSION:
        review_governance = {
            "reviewMethod": AI_ASSISTED_REVIEW_METHOD,
            "operatorAuthorization": review_decisions["operatorAuthorization"],
        }
    compiled = [
        _compile_approved_form(
            form_record,
            candidate_set_hash=candidate_set["setHash"],
            candidate_schema_version=candidate_set["schemaVersion"],
            decision_set_hash=review_decisions["decisionSetHash"],
            approval_policy=approval_policy,
            review_schema=review_schema,
            review_governance=review_governance,
            decision_index=decision_index,
            candidate_index=candidate_index,
            approval_authority_binding={
                "schemaVersion": APPROVAL_RECEIPT_SET_SCHEMA,
                "authorityId": approval_receipts["authorityId"],
                "receiptSetHash": approval_receipts["receiptSetHash"],
            },
            receipt_index=receipt_index,
            approval_receipts=approval_receipts,
            allow_test_only=allow_test_only,
        )
        for form_record in _candidate_form_records(candidate_set)
        if (form_record["form"]["id"], form_record["form"]["version"]) in selected
    ]
    if candidate_set["schemaVersion"] == "amc-question-context-candidate-set-v1":
        return compiled[0]
    result: dict[str, Any] = {
        "schemaVersion": _approved_archive_schema_for_policy(approval_policy),
        "audience": "private-ai-context-only",
        "approvalPolicyVersion": approval_policy,
        "candidateSetBinding": {
            "schemaVersion": candidate_set["schemaVersion"],
            "setHash": candidate_set["setHash"],
            "archiveRelease": _candidate_archive_release(candidate_set),
        },
        "reviewDecisionBinding": {
            "schemaVersion": review_schema,
            "decisionSetHash": review_decisions["decisionSetHash"],
        },
        "approvalAuthorityBinding": {
            "schemaVersion": APPROVAL_RECEIPT_SET_SCHEMA,
            "authorityId": approval_receipts["authorityId"],
            "receiptSetHash": approval_receipts["receiptSetHash"],
        },
        "summary": {
            "formCount": len(compiled),
            "questionCount": sum(form["summary"]["questionCount"] for form in compiled),
            "approvedSolutionCount": sum(form["summary"]["approvedSolutionCount"] for form in compiled),
            "contextReadyQuestionCount": sum(form["summary"]["contextReadyQuestionCount"] for form in compiled),
            "unavailableQuestionCount": sum(form["summary"]["unavailableQuestionCount"] for form in compiled),
        },
        "forms": compiled,
        "disclaimer": (
            "Private archive AI context containing only operator-delegated AI-assisted reviewed solutions "
            "with independent authority receipts and no answer keys."
            if review_governance is not None else
            "Private archive AI context containing only explicitly approved solutions and no answer keys."
        ),
    }
    if review_governance is not None:
        result["reviewGovernance"] = review_governance
    result["setHash"] = canonical_hash(result)
    output_errors = validate_approved_archive_context_set(
        result, approval_receipts=approval_receipts
    )
    if output_errors:
        raise ContentBuildError([f"invalid approved archive context set: {error}" for error in output_errors])
    return result


def _compile_approved_form(
    form_record: dict[str, Any],
    *,
    candidate_set_hash: str,
    candidate_schema_version: str,
    decision_set_hash: str,
    approval_policy: str,
    review_schema: str,
    review_governance: dict[str, Any] | None,
    decision_index: dict[tuple[str, str, int, str], dict[str, Any]],
    candidate_index: dict[tuple[str, str, int, str], dict[str, Any]],
    approval_authority_binding: dict[str, Any],
    receipt_index: dict[str, dict[str, Any]],
    approval_receipts: dict[str, Any],
    allow_test_only: bool,
) -> dict[str, Any]:
    form = form_record["form"]
    output_questions: list[dict[str, Any]] = []
    for context in form_record["questions"]:
        question = context["question"]
        approved: list[dict[str, Any]] = []
        solution_candidates = [
            candidate
            for (candidate_form_id, candidate_form_version, candidate_number, _), candidate in candidate_index.items()
            if candidate_form_id == form["id"]
            and candidate_form_version == form["version"]
            and candidate_number == question["number"]
        ]
        for solution in sorted(solution_candidates, key=lambda item: item["solutionId"]):
            decision = decision_index.get(
                (form["id"], form["version"], question["number"], solution["solutionId"])
            )
            if decision is None:
                continue
            receipt = receipt_index[decision["decisionRecordHash"]]
            visual = _contains_visual_reference(solution["bodyMarkdown"])
            approval = {
                "reviewerId": decision["reviewerId"],
                "reviewedAt": decision["reviewedAt"],
                "rightsStatus": decision["rightsStatus"],
                "qualityFlags": decision["qualityFlags"],
                "methodTags": decision["methodTags"],
                "decisionRecordHash": decision["decisionRecordHash"],
                "authorityReceipt": {
                    key: receipt[key]
                    for key in ("receiptId", "authorityId", "issuedAt", "status")
                },
            }
            if review_governance is not None:
                approval.update(
                    {
                        "reviewMethod": decision["reviewMethod"],
                        "reviewModel": decision["reviewModel"],
                        "operatorAuthorizationId": decision["operatorAuthorizationId"],
                    }
                )
            approved_solution = {
                    "solutionId": solution["solutionId"],
                    "title": solution["title"],
                    "bodyMarkdown": solution["bodyMarkdown"],
                    "bodySha256": solution["bodySha256"],
                    "sourceRef": solution["sourceRef"],
                    "modelEligibility": {
                        "eligible": not visual,
                        "reason": "solution-visual-context-unavailable" if visual else None,
                    },
                    "approval": approval,
                }
            if review_governance is not None:
                approved_solution["candidateProvenance"] = _candidate_provenance(solution)
            approved.append(approved_solution)
        question_visual = _contains_visual_reference(question["promptMarkdown"]) or any(
            _contains_visual_reference(value) for value in question["choices"].values()
        )
        eligible_count = sum(solution["modelEligibility"]["eligible"] for solution in approved)
        ready = not question_visual and eligible_count >= MINIMUM_APPROVED_SOLUTIONS
        reason = (
            "question-visual-context-unavailable" if question_visual
            else None if ready
            else "fewer-than-two-model-eligible-approved-solutions"
        )
        projection = _question_content_projection(context)
        output_questions.append(
            {
                **projection,
                "questionContentHash": canonical_hash(projection),
                "visualContext": {
                    "required": question_visual,
                    "modelAvailable": not question_visual,
                    "reason": "question-visual-context-unavailable" if question_visual else None,
                },
                "contextReady": ready,
                "availability": {
                    "status": "ready" if ready else "unavailable",
                    "approvedSolutionCount": len(approved),
                    "modelEligibleSolutionCount": eligible_count,
                    "requiredSolutionCount": MINIMUM_APPROVED_SOLUTIONS,
                    "reason": reason,
                },
                "approvedSolutions": approved,
            }
        )
    ready_count = sum(question["contextReady"] for question in output_questions)
    form_projection = {
        "id": form["id"],
        "version": form["version"],
        "questions": [_question_content_projection(context) for context in form_record["questions"]],
    }
    release_binding = None
    if all(key in form for key in ("questionBundleHash", "contentHash", "manifestHash")):
        release_binding = {
            "questionBundleHash": form["questionBundleHash"],
            "contentHash": form["contentHash"],
            "manifestHash": form["manifestHash"],
        }
    if release_binding is None and not allow_test_only:
        raise ContentBuildError([
            "production approved context requires non-null releaseBinding; use --allow-test-only for synthetic input"
        ])
    result: dict[str, Any] = {
        "schemaVersion": _approved_schema_for_policy(approval_policy, test_only=release_binding is None),
        "audience": "private-ai-context-only" if release_binding is not None else "private-test-only",
        "approvalPolicyVersion": approval_policy,
        "formBinding": {
            "id": form["id"],
            "version": form["version"],
            "candidateSchemaVersion": candidate_schema_version,
            "candidateSetHash": candidate_set_hash,
            "contextContentHash": canonical_hash(form_projection),
            "releaseBinding": release_binding,
        },
        "reviewDecisionBinding": {
            "schemaVersion": review_schema,
            "decisionSetHash": decision_set_hash,
        },
        "approvalAuthorityBinding": approval_authority_binding,
        "summary": {
            "questionCount": len(output_questions),
            "approvedSolutionCount": sum(len(question["approvedSolutions"]) for question in output_questions),
            "contextReadyQuestionCount": ready_count,
            "unavailableQuestionCount": len(output_questions) - ready_count,
            "minimumApprovedSolutionsPerQuestion": MINIMUM_APPROVED_SOLUTIONS,
        },
        "questions": output_questions,
        "disclaimer": (
            "Private AI context compiled only from exact operator-delegated AI-assisted reviews "
            "and independent authority receipts. It is not human review and intentionally contains no answer key "
            "or correct option."
            if review_governance is not None else
            "Private AI context compiled only from exact human approvals. "
            "It intentionally contains no answer key or correct option."
        ),
    }
    if review_governance is not None:
        result["reviewGovernance"] = review_governance
    result["setHash"] = canonical_hash(result)
    output_errors = (
        validate_approved_question_context_set(result, approval_receipts=approval_receipts)
        if release_binding is not None
        else validate_approved_question_context_test_set(result, approval_receipts=approval_receipts)
    )
    if output_errors:
        raise ContentBuildError([f"invalid approved context set: {error}" for error in output_errors])
    return result


def validate_approved_question_context_set(
    context_set: Any,
    *,
    approval_receipts: Any | None = None,
) -> list[str]:
    """Validate production context against separately supplied receipts for v2."""

    return _validate_approved_question_context_set(
        context_set, test_only=False, approval_receipts=approval_receipts
    )


def validate_approved_question_context_test_set(
    context_set: Any,
    *,
    approval_receipts: Any | None = None,
) -> list[str]:
    """Validate synthetic context against separately supplied receipts for v2."""

    return _validate_approved_question_context_set(
        context_set, test_only=True, approval_receipts=approval_receipts
    )


def _validate_approved_question_context_set(
    context_set: Any,
    *,
    test_only: bool,
    approval_receipts: Any | None,
) -> list[str]:
    """Strictly validate an approved model-context artifact and all hashes."""

    unicode_errors = _unicode_scalar_errors(context_set, "approvedContextSet")
    if unicode_errors:
        return unicode_errors
    if not isinstance(context_set, dict):
        return ["approvedContextSet must be an object"]
    approval_policy = context_set.get("approvalPolicyVersion")
    ai_assisted = approval_policy == AI_ASSISTED_APPROVAL_POLICY_VERSION
    root_required = {
        "schemaVersion", "audience", "approvalPolicyVersion", "formBinding",
        "reviewDecisionBinding", "approvalAuthorityBinding", "summary", "questions", "disclaimer", "setHash",
    }
    if ai_assisted:
        root_required.add("reviewGovernance")
    errors = _strict_keys(
        context_set,
        required=root_required,
        path="approvedContextSet",
    )
    expected_schema = _approved_schema_for_policy(approval_policy, test_only=test_only)
    expected_audience = "private-test-only" if test_only else "private-ai-context-only"
    if expected_schema is None or context_set.get("schemaVersion") != expected_schema:
        errors.append("approvedContextSet.schemaVersion/approvalPolicyVersion pairing is unsupported")
    if context_set.get("audience") != expected_audience:
        errors.append(f"approvedContextSet.audience must be {expected_audience}")
    if approval_policy not in (APPROVAL_POLICY_VERSION, AI_ASSISTED_APPROVAL_POLICY_VERSION):
        errors.append("approvedContextSet.approvalPolicyVersion is unsupported")
    if not isinstance(context_set.get("disclaimer"), str) or not context_set["disclaimer"]:
        errors.append("approvedContextSet.disclaimer must be non-empty")
    if ai_assisted:
        errors.extend(_validate_review_governance(context_set.get("reviewGovernance"), "approvedContextSet.reviewGovernance"))

    form = context_set.get("formBinding")
    errors.extend(
        _strict_keys(
            form,
            required={
                "id", "version", "candidateSchemaVersion", "candidateSetHash",
                "contextContentHash", "releaseBinding",
            },
            path="approvedContextSet.formBinding",
        )
    )
    if isinstance(form, dict):
        for key in ("id", "version"):
            if not isinstance(form.get(key), str) or not form[key]:
                errors.append(f"approvedContextSet.formBinding.{key} must be non-empty")
        candidate_schema = form.get("candidateSchemaVersion")
        supported_candidate_schemas = {
            "amc-question-context-candidate-set-v1", "amc-question-context-archive-candidate-set-v1",
        }
        if ai_assisted:
            supported_candidate_schemas.add(SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA)
        if not isinstance(candidate_schema, str) or candidate_schema not in supported_candidate_schemas:
            errors.append("approvedContextSet.formBinding.candidateSchemaVersion is unsupported")
        for key in ("candidateSetHash", "contextContentHash"):
            hash_error = _sha256_error(form.get(key), f"approvedContextSet.formBinding.{key}")
            if hash_error:
                errors.append(hash_error)
        release_binding = form.get("releaseBinding")
        if release_binding is None and not test_only:
            errors.append("approvedContextSet.formBinding.releaseBinding is required for production")
        elif release_binding is not None and test_only:
            errors.append("approvedContextSet test-only releaseBinding must be null")
        elif release_binding is not None:
            errors.extend(
                _strict_keys(
                    release_binding,
                    required={"questionBundleHash", "contentHash", "manifestHash"},
                    path="approvedContextSet.formBinding.releaseBinding",
                )
            )
            if isinstance(release_binding, dict):
                for key in ("questionBundleHash", "contentHash", "manifestHash"):
                    hash_error = _sha256_error(
                        release_binding.get(key), f"approvedContextSet.formBinding.releaseBinding.{key}"
                    )
                    if hash_error:
                        errors.append(hash_error)
    review = context_set.get("reviewDecisionBinding")
    errors.extend(
        _strict_keys(
            review,
            required={"schemaVersion", "decisionSetHash"},
            path="approvedContextSet.reviewDecisionBinding",
        )
    )
    if isinstance(review, dict):
        if review.get("schemaVersion") != _review_schema_for_policy(approval_policy):
            errors.append("approvedContextSet.reviewDecisionBinding.schemaVersion is unsupported")
        hash_error = _sha256_error(review.get("decisionSetHash"), "approvedContextSet.reviewDecisionBinding.decisionSetHash")
        if hash_error:
            errors.append(hash_error)
    authority = context_set.get("approvalAuthorityBinding")
    errors.extend(_strict_keys(
        authority,
        required={"schemaVersion", "authorityId", "receiptSetHash"},
        path="approvedContextSet.approvalAuthorityBinding",
    ))
    if isinstance(authority, dict):
        if authority.get("schemaVersion") != APPROVAL_RECEIPT_SET_SCHEMA:
            errors.append("approvedContextSet approval authority schemaVersion is unsupported")
        if not isinstance(authority.get("authorityId"), str) or _REVIEWER_ID_RE.fullmatch(authority["authorityId"]) is None:
            errors.append("approvedContextSet approval authorityId is invalid")
        hash_error = _sha256_error(authority.get("receiptSetHash"), "approvedContextSet.approvalAuthorityBinding.receiptSetHash")
        if hash_error:
            errors.append(hash_error)
        if ai_assisted:
            governance = context_set.get("reviewGovernance")
            authorization = governance.get("operatorAuthorization") if isinstance(governance, dict) else None
            authorized_by = authorization.get("authorizedBy") if isinstance(authorization, dict) else None
            if authority.get("authorityId") == authorized_by:
                errors.append(
                    "approvedContextSet approval authority must differ from the authorizing operator"
                )

    trusted_receipt_records: list[dict[str, Any]] | None = None
    if ai_assisted:
        if approval_receipts is None:
            errors.append(
                "approvedContextSet v2 validation requires the separately supplied trusted approval receipt set"
            )
        else:
            receipt_errors = validate_approval_receipt_set(approval_receipts)
            errors.extend(f"trustedApprovalReceipts: {error}" for error in receipt_errors)
            if isinstance(approval_receipts, dict):
                if isinstance(authority, dict) and (
                    approval_receipts.get("authorityId") != authority.get("authorityId")
                    or approval_receipts.get("receiptSetHash") != authority.get("receiptSetHash")
                ):
                    errors.append(
                        "approvedContextSet approval authority binding does not match the separately supplied "
                        "trusted receipt set"
                    )
                receipt_values = approval_receipts.get("receipts")
                if isinstance(receipt_values, list):
                    trusted_receipt_records = [
                        receipt for receipt in receipt_values if isinstance(receipt, dict)
                    ]

    questions = context_set.get("questions")
    if not isinstance(questions, list):
        errors.append("approvedContextSet.questions must be an array")
        questions = []
    if len(questions) != 25:
        errors.append("approvedContextSet.questions must contain exactly 25 questions")
    numbers: list[int] = []
    for index, question in enumerate(questions):
        path = f"approvedContextSet.questions[{index}]"
        errors.extend(
            _strict_keys(
                question,
                required={
                    "number", "sourceRef", "promptMarkdown", "choices", "questionContentHash",
                    "visualContext", "contextReady", "availability", "approvedSolutions",
                },
                path=path,
            )
        )
        if not isinstance(question, dict):
            continue
        number = question.get("number")
        if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 26):
            errors.append(f"{path}.number must be an integer from 1 through 25")
        else:
            numbers.append(number)
        source_ref = question.get("sourceRef")
        errors.extend(_strict_keys(source_ref, required={"path", "sha256"}, path=f"{path}.sourceRef"))
        if isinstance(source_ref, dict):
            path_error = _safe_relative_path(source_ref.get("path"), f"{path}.sourceRef.path")
            if path_error:
                errors.append(path_error)
            hash_error = _sha256_error(source_ref.get("sha256"), f"{path}.sourceRef.sha256")
            if hash_error:
                errors.append(hash_error)
        errors.extend(_model_text_errors(
            question.get("promptMarkdown"), f"{path}.promptMarkdown", maximum_bytes=MAX_MODEL_PROMPT_BYTES
        ))
        choices = question.get("choices")
        if not isinstance(choices, dict) or set(choices) != set("ABCDE"):
            errors.append(f"{path}.choices must define exactly A through E")
        else:
            for label, value in choices.items():
                errors.extend(_model_text_errors(
                    value, f"{path}.choices.{label}", maximum_bytes=MAX_MODEL_CHOICE_BYTES
                ))
        projection = {
            "number": question.get("number"), "sourceRef": source_ref,
            "promptMarkdown": question.get("promptMarkdown"), "choices": choices,
        }
        if question.get("questionContentHash") != canonical_hash(projection):
            errors.append(f"{path}.questionContentHash does not match question content")
        question_visual = _contains_visual_reference(question.get("promptMarkdown")) or (
            isinstance(choices, dict) and any(_contains_visual_reference(value) for value in choices.values())
        )
        visual_context = question.get("visualContext")
        errors.extend(_strict_keys(
            visual_context,
            required={"required", "modelAvailable", "reason"},
            path=f"{path}.visualContext",
        ))
        expected_visual = {
            "required": question_visual,
            "modelAvailable": not question_visual,
            "reason": "question-visual-context-unavailable" if question_visual else None,
        }
        if isinstance(visual_context, dict) and visual_context != expected_visual:
            errors.append(f"{path}.visualContext does not match question visual references")

        solutions = question.get("approvedSolutions")
        if not isinstance(solutions, list):
            errors.append(f"{path}.approvedSolutions must be an array")
            solutions = []
        elif len(solutions) > MAX_MODEL_SOLUTIONS:
            errors.append(f"{path}.approvedSolutions must contain at most {MAX_MODEL_SOLUTIONS} solutions")
        solution_ids: set[str] = set()
        for solution_index, solution in enumerate(solutions):
            solution_path = f"{path}.approvedSolutions[{solution_index}]"
            solution_required = {
                "solutionId", "title", "bodyMarkdown", "bodySha256", "sourceRef",
                "modelEligibility", "approval",
            }
            if ai_assisted:
                solution_required.add("candidateProvenance")
            errors.extend(
                _strict_keys(
                    solution,
                    required=solution_required,
                    path=solution_path,
                )
            )
            if not isinstance(solution, dict):
                continue
            solution_id = solution.get("solutionId")
            if not isinstance(solution_id, str) or _SOLUTION_ID_RE.fullmatch(solution_id) is None:
                errors.append(f"{solution_path}.solutionId must match solution-NNN")
            elif solution_id in solution_ids:
                errors.append(f"{solution_path}.solutionId is duplicated")
            else:
                solution_ids.add(solution_id)
            if ai_assisted:
                errors.extend(_validate_candidate_provenance(
                    solution.get("candidateProvenance"), f"{solution_path}.candidateProvenance"
                ))
                if (
                    isinstance(solution.get("candidateProvenance"), dict)
                    and solution["candidateProvenance"].get("origin") == "operator-original-supplement"
                    and (not isinstance(solution_id, str) or _SUPPLEMENT_SOLUTION_ID_RE.fullmatch(solution_id) is None)
                ):
                    errors.append(f"{solution_path}.solutionId must use reserved solution-9NN for a supplement")
            errors.extend(_model_text_errors(
                solution.get("title"), f"{solution_path}.title", maximum_bytes=MAX_MODEL_SOLUTION_TITLE_BYTES
            ))
            body = solution.get("bodyMarkdown")
            errors.extend(_model_text_errors(
                body, f"{solution_path}.bodyMarkdown", maximum_bytes=MAX_MODEL_SOLUTION_BODY_BYTES
            ))
            if not isinstance(body, str) or solution.get("bodySha256") != sha256_text(body):
                errors.append(f"{solution_path}.bodySha256 does not match bodyMarkdown")
            solution_ref = solution.get("sourceRef")
            errors.extend(
                _strict_keys(
                    solution_ref,
                    required={"path", "sha256", "headingLine", "endLine"},
                    path=f"{solution_path}.sourceRef",
                )
            )
            if isinstance(solution_ref, dict):
                safe_question_ref = source_ref if isinstance(source_ref, dict) else {}
                provenance = solution.get("candidateProvenance")
                is_supplement = (
                    ai_assisted and isinstance(provenance, dict)
                    and provenance.get("origin") == "operator-original-supplement"
                )
                if is_supplement:
                    expected_path = f"protected-supplements/{provenance.get('supplementId')}.json"
                    if (
                        solution_ref.get("path") != expected_path
                        or solution_ref.get("sha256") != provenance.get("supplementRecordHash")
                    ):
                        errors.append(f"{solution_path}.sourceRef does not match protected supplement provenance")
                elif (
                    ai_assisted and isinstance(provenance, dict)
                    and provenance.get("origin") == "source-markdown"
                    and (
                        solution_ref.get("path") != provenance.get("sourcePath")
                        or solution_ref.get("sha256") != provenance.get("sourceSha256")
                    )
                ):
                    errors.append(f"{solution_path}.sourceRef does not match source candidate provenance")
                elif (
                    solution_ref.get("path") != safe_question_ref.get("path")
                    or solution_ref.get("sha256") != safe_question_ref.get("sha256")
                ):
                    errors.append(f"{solution_path}.sourceRef does not match question source")
                heading = solution_ref.get("headingLine")
                end = solution_ref.get("endLine")
                if isinstance(heading, bool) or not isinstance(heading, int) or heading < 1 or isinstance(end, bool) or not isinstance(end, int) or end < heading:
                    errors.append(f"{solution_path}.sourceRef has invalid line bounds")
            model_eligibility = solution.get("modelEligibility")
            errors.extend(_strict_keys(
                model_eligibility,
                required={"eligible", "reason"},
                path=f"{solution_path}.modelEligibility",
            ))
            solution_visual = _contains_visual_reference(body)
            expected_eligibility = {
                "eligible": not solution_visual,
                "reason": "solution-visual-context-unavailable" if solution_visual else None,
            }
            if isinstance(model_eligibility, dict) and model_eligibility != expected_eligibility:
                errors.append(f"{solution_path}.modelEligibility does not match solution visual references")
            approval = solution.get("approval")
            approval_required = {
                "reviewerId", "reviewedAt", "rightsStatus", "qualityFlags", "methodTags",
                "decisionRecordHash", "authorityReceipt",
            }
            if ai_assisted:
                approval_required.update({"reviewMethod", "reviewModel", "operatorAuthorizationId"})
            errors.extend(
                _strict_keys(
                    approval,
                    required=approval_required,
                    path=f"{solution_path}.approval",
                )
            )
            if isinstance(approval, dict):
                reviewer_id = approval.get("reviewerId")
                if not isinstance(reviewer_id, str) or _REVIEWER_ID_RE.fullmatch(reviewer_id) is None:
                    errors.append(f"{solution_path}.approval.reviewerId is invalid")
                if not _valid_utc_timestamp(approval.get("reviewedAt")):
                    errors.append(f"{solution_path}.approval.reviewedAt is invalid")
                if approval.get("rightsStatus") != "approved-for-ai-use":
                    errors.append(f"{solution_path}.approval.rightsStatus is invalid")
                errors.extend(_validate_tags(approval.get("qualityFlags"), f"{solution_path}.approval.qualityFlags", require_one=False))
                errors.extend(_validate_tags(approval.get("methodTags"), f"{solution_path}.approval.methodTags", require_one=True))
                if ai_assisted:
                    if approval.get("reviewMethod") != AI_ASSISTED_REVIEW_METHOD:
                        errors.append(f"{solution_path}.approval.reviewMethod must be {AI_ASSISTED_REVIEW_METHOD}")
                    errors.extend(_validate_review_model(approval.get("reviewModel"), f"{solution_path}.approval.reviewModel"))
                    governance = context_set.get("reviewGovernance")
                    authorization = governance.get("operatorAuthorization") if isinstance(governance, dict) else None
                    authorization_id = authorization.get("authorizationId") if isinstance(authorization, dict) else None
                    authorized_by = authorization.get("authorizedBy") if isinstance(authorization, dict) else None
                    if reviewer_id == authorized_by:
                        errors.append(
                            f"{solution_path}.approval.reviewerId must differ from the authorizing operator"
                        )
                    authority_id = authority.get("authorityId") if isinstance(authority, dict) else None
                    if reviewer_id == authority_id:
                        errors.append(
                            f"{solution_path}.approval.reviewerId must differ from the receipt authority"
                        )
                    provenance = solution.get("candidateProvenance")
                    if (
                        isinstance(provenance, dict)
                        and provenance.get("origin") == "operator-original-supplement"
                        and reviewer_id == provenance.get("authorId")
                    ):
                        errors.append(
                            f"{solution_path}.approval.reviewerId must differ from the supplement author"
                        )
                    if approval.get("operatorAuthorizationId") != authorization_id:
                        errors.append(f"{solution_path}.approval.operatorAuthorizationId does not match review governance")
                decision_projection = {
                    "approvalPolicyVersion": context_set.get("approvalPolicyVersion"),
                    "candidateSchemaVersion": form.get("candidateSchemaVersion") if isinstance(form, dict) else None,
                    "candidateSetHash": form.get("candidateSetHash") if isinstance(form, dict) else None,
                    "formId": form.get("id") if isinstance(form, dict) else None,
                    "formVersion": form.get("version") if isinstance(form, dict) else None,
                    "questionNumber": question.get("number"),
                    "solutionId": solution.get("solutionId"),
                    "decision": "approved",
                    "bodySha256": solution.get("bodySha256"),
                    "sourceRef": {
                        "path": solution_ref.get("path") if isinstance(solution_ref, dict) else None,
                        "sha256": solution_ref.get("sha256") if isinstance(solution_ref, dict) else None,
                    },
                    "reviewerId": approval.get("reviewerId"),
                    "reviewedAt": approval.get("reviewedAt"),
                    "rightsStatus": approval.get("rightsStatus"),
                    "qualityFlags": approval.get("qualityFlags"),
                    "methodTags": approval.get("methodTags"),
                }
                if ai_assisted:
                    decision_projection.update(
                        {
                            "reviewMethod": approval.get("reviewMethod"),
                            "reviewModel": approval.get("reviewModel"),
                            "operatorAuthorizationId": approval.get("operatorAuthorizationId"),
                            "operatorAuthorization": authorization,
                            "candidateProvenance": solution.get("candidateProvenance"),
                            "questionContentHash": question.get("questionContentHash"),
                        }
                    )
                expected_decision_hash = canonical_hash(decision_projection)
                if approval.get("decisionRecordHash") != expected_decision_hash:
                    errors.append(f"{solution_path}.approval.decisionRecordHash does not match approval content")
                receipt = approval.get("authorityReceipt")
                errors.extend(_strict_keys(
                    receipt,
                    required={"receiptId", "authorityId", "issuedAt", "status"},
                    path=f"{solution_path}.approval.authorityReceipt",
                ))
                if isinstance(receipt, dict):
                    if not isinstance(receipt.get("receiptId"), str) or _REVIEWER_ID_RE.fullmatch(receipt["receiptId"]) is None:
                        errors.append(f"{solution_path}.approval.authorityReceipt.receiptId is invalid")
                    if receipt.get("authorityId") != (authority.get("authorityId") if isinstance(authority, dict) else None):
                        errors.append(f"{solution_path}.approval.authorityReceipt.authorityId does not match set")
                    if not _valid_utc_timestamp(receipt.get("issuedAt")):
                        errors.append(f"{solution_path}.approval.authorityReceipt.issuedAt is invalid")
                    if receipt.get("status") != "active":
                        errors.append(f"{solution_path}.approval.authorityReceipt.status must be active")
                    if ai_assisted and trusted_receipt_records is not None:
                        trusted_matches = [
                            trusted
                            for trusted in trusted_receipt_records
                            if trusted.get("decisionRecordHash") == expected_decision_hash
                        ]
                        if len(trusted_matches) != 1 or trusted_matches[0].get("status") != "active":
                            errors.append(
                                f"{solution_path}.approval must have exactly one active receipt in the "
                                "separately supplied trusted receipt set"
                            )
                        else:
                            trusted_projection = {
                                key: trusted_matches[0].get(key)
                                for key in ("receiptId", "authorityId", "issuedAt", "status")
                            }
                            if receipt != trusted_projection:
                                errors.append(
                                    f"{solution_path}.approval.authorityReceipt does not match the separately "
                                    "supplied trusted receipt"
                                )

        eligible_count = sum(
            solution.get("modelEligibility", {}).get("eligible") is True
            for solution in solutions if isinstance(solution, dict) and isinstance(solution.get("modelEligibility"), dict)
        )
        ready = not question_visual and eligible_count >= MINIMUM_APPROVED_SOLUTIONS
        if question.get("contextReady") is not ready:
            errors.append(f"{path}.contextReady does not match approved solution count")
        availability = question.get("availability")
        errors.extend(
            _strict_keys(
                availability,
                required={
                    "status", "approvedSolutionCount", "modelEligibleSolutionCount",
                    "requiredSolutionCount", "reason",
                },
                path=f"{path}.availability",
            )
        )
        if isinstance(availability, dict):
            expected_reason = (
                "question-visual-context-unavailable" if question_visual
                else None if ready
                else "fewer-than-two-model-eligible-approved-solutions"
            )
            expected = {
                "status": "ready" if ready else "unavailable",
                "approvedSolutionCount": len(solutions),
                "modelEligibleSolutionCount": eligible_count,
                "requiredSolutionCount": MINIMUM_APPROVED_SOLUTIONS,
                "reason": expected_reason,
            }
            if availability != expected:
                errors.append(f"{path}.availability does not match approved solution count")
    if numbers != list(range(1, 26)):
        errors.append("approvedContextSet question numbers must be exactly 1 through 25 in order")

    summary = context_set.get("summary")
    errors.extend(
        _strict_keys(
            summary,
            required={
                "questionCount", "approvedSolutionCount", "contextReadyQuestionCount",
                "unavailableQuestionCount", "minimumApprovedSolutionsPerQuestion",
            },
            path="approvedContextSet.summary",
        )
    )
    if isinstance(summary, dict):
        ready_count = sum(question.get("contextReady") is True for question in questions if isinstance(question, dict))
        expected_summary = {
            "questionCount": len(questions),
            "approvedSolutionCount": sum(
                len(question.get("approvedSolutions", []))
                for question in questions if isinstance(question, dict) and isinstance(question.get("approvedSolutions"), list)
            ),
            "contextReadyQuestionCount": ready_count,
            "unavailableQuestionCount": len(questions) - ready_count,
            "minimumApprovedSolutionsPerQuestion": MINIMUM_APPROVED_SOLUTIONS,
        }
        if summary != expected_summary:
            errors.append("approvedContextSet.summary does not match questions")
    if isinstance(form, dict) and questions:
        form_projection = {
            "id": form.get("id"),
            "version": form.get("version"),
            "questions": [
                {
                    "number": question.get("number"), "sourceRef": question.get("sourceRef"),
                    "promptMarkdown": question.get("promptMarkdown"), "choices": question.get("choices"),
                }
                for question in questions if isinstance(question, dict)
            ],
        }
        if form.get("contextContentHash") != canonical_hash(form_projection):
            errors.append("approvedContextSet.formBinding.contextContentHash does not match question content")
    if context_set.get("setHash") != canonical_hash(context_set, omit=("setHash",)):
        errors.append("approvedContextSet.setHash does not match canonical content")
    return errors


def validate_approved_archive_context_set(
    context_set: Any,
    *,
    approval_receipts: Any | None = None,
) -> list[str]:
    """Validate an archive wrapper against separately supplied receipts for v2."""

    unicode_errors = _unicode_scalar_errors(context_set, "approvedArchiveContextSet")
    if unicode_errors:
        return unicode_errors
    if not isinstance(context_set, dict):
        return ["approvedArchiveContextSet must be an object"]
    approval_policy = context_set.get("approvalPolicyVersion")
    ai_assisted = approval_policy == AI_ASSISTED_APPROVAL_POLICY_VERSION
    root_required = {
        "schemaVersion", "audience", "approvalPolicyVersion", "candidateSetBinding",
        "reviewDecisionBinding", "approvalAuthorityBinding", "summary", "forms", "disclaimer", "setHash",
    }
    if ai_assisted:
        root_required.add("reviewGovernance")
    errors = _strict_keys(
        context_set,
        required=root_required,
        path="approvedArchiveContextSet",
    )
    if context_set.get("schemaVersion") != _approved_archive_schema_for_policy(approval_policy):
        errors.append("approvedArchiveContextSet.schemaVersion/approvalPolicyVersion pairing is unsupported")
    if context_set.get("audience") != "private-ai-context-only":
        errors.append("approvedArchiveContextSet.audience must be private-ai-context-only")
    if approval_policy not in (APPROVAL_POLICY_VERSION, AI_ASSISTED_APPROVAL_POLICY_VERSION):
        errors.append("approvedArchiveContextSet.approvalPolicyVersion is unsupported")
    if not isinstance(context_set.get("disclaimer"), str) or not context_set["disclaimer"]:
        errors.append("approvedArchiveContextSet.disclaimer must be non-empty")
    if ai_assisted:
        errors.extend(_validate_review_governance(
            context_set.get("reviewGovernance"), "approvedArchiveContextSet.reviewGovernance"
        ))
    candidate_binding = context_set.get("candidateSetBinding")
    errors.extend(
        _strict_keys(
            candidate_binding,
            required={"schemaVersion", "setHash", "archiveRelease"},
            path="approvedArchiveContextSet.candidateSetBinding",
        )
    )
    if isinstance(candidate_binding, dict):
        supported_archive_candidates = {"amc-question-context-archive-candidate-set-v1"}
        if ai_assisted:
            supported_archive_candidates.add(SUPPLEMENTED_ARCHIVE_CANDIDATE_SCHEMA)
        candidate_schema = candidate_binding.get("schemaVersion")
        if not isinstance(candidate_schema, str) or candidate_schema not in supported_archive_candidates:
            errors.append("approvedArchiveContextSet candidate schemaVersion is unsupported")
        hash_error = _sha256_error(candidate_binding.get("setHash"), "approvedArchiveContextSet.candidateSetBinding.setHash")
        if hash_error:
            errors.append(hash_error)
        release = candidate_binding.get("archiveRelease")
        errors.extend(
            _strict_keys(
                release,
                required={"batchSchemaVersion", "releaseVersion", "sourcePath", "sourceSha256"},
                path="approvedArchiveContextSet.candidateSetBinding.archiveRelease",
            )
        )
        if isinstance(release, dict):
            if release.get("batchSchemaVersion") != "amc-practice-archive-release-batch-v1":
                errors.append("approvedArchiveContextSet archive batch schema is unsupported")
            for key in ("releaseVersion", "sourcePath"):
                if not isinstance(release.get(key), str) or not release[key]:
                    errors.append(f"approvedArchiveContextSet archiveRelease.{key} must be non-empty")
            hash_error = _sha256_error(release.get("sourceSha256"), "approvedArchiveContextSet archiveRelease.sourceSha256")
            if hash_error:
                errors.append(hash_error)
    review_binding = context_set.get("reviewDecisionBinding")
    errors.extend(
        _strict_keys(
            review_binding,
            required={"schemaVersion", "decisionSetHash"},
            path="approvedArchiveContextSet.reviewDecisionBinding",
        )
    )
    if isinstance(review_binding, dict):
        if review_binding.get("schemaVersion") != _review_schema_for_policy(approval_policy):
            errors.append("approvedArchiveContextSet review schemaVersion is unsupported")
        hash_error = _sha256_error(review_binding.get("decisionSetHash"), "approvedArchiveContextSet.reviewDecisionBinding.decisionSetHash")
        if hash_error:
            errors.append(hash_error)
    authority_binding = context_set.get("approvalAuthorityBinding")
    errors.extend(_strict_keys(
        authority_binding,
        required={"schemaVersion", "authorityId", "receiptSetHash"},
        path="approvedArchiveContextSet.approvalAuthorityBinding",
    ))
    if isinstance(authority_binding, dict):
        if authority_binding.get("schemaVersion") != APPROVAL_RECEIPT_SET_SCHEMA:
            errors.append("approvedArchiveContextSet authority schemaVersion is unsupported")
        if not isinstance(authority_binding.get("authorityId"), str) or _REVIEWER_ID_RE.fullmatch(authority_binding["authorityId"]) is None:
            errors.append("approvedArchiveContextSet authorityId is invalid")
        hash_error = _sha256_error(authority_binding.get("receiptSetHash"), "approvedArchiveContextSet.approvalAuthorityBinding.receiptSetHash")
        if hash_error:
            errors.append(hash_error)
    if ai_assisted:
        if approval_receipts is None:
            errors.append(
                "approvedArchiveContextSet v2 validation requires the separately supplied trusted approval "
                "receipt set"
            )
        else:
            receipt_errors = validate_approval_receipt_set(approval_receipts)
            errors.extend(f"trustedApprovalReceipts: {error}" for error in receipt_errors)
            if isinstance(approval_receipts, dict) and isinstance(authority_binding, dict) and (
                approval_receipts.get("authorityId") != authority_binding.get("authorityId")
                or approval_receipts.get("receiptSetHash") != authority_binding.get("receiptSetHash")
            ):
                errors.append(
                    "approvedArchiveContextSet authority binding does not match the separately supplied trusted "
                    "receipt set"
                )
    forms = context_set.get("forms")
    if not isinstance(forms, list) or not forms or len(forms) > 48:
        errors.append("approvedArchiveContextSet.forms must contain 1 through 48 form sets")
        forms = []
    seen: set[tuple[str, str]] = set()
    for index, form_set in enumerate(forms):
        child_errors = validate_approved_question_context_set(
            form_set, approval_receipts=approval_receipts
        )
        errors.extend(f"approvedArchiveContextSet.forms[{index}]: {error}" for error in child_errors)
        if not isinstance(form_set, dict):
            continue
        form = form_set.get("formBinding")
        if not isinstance(form, dict):
            continue
        key = (str(form.get("id")), str(form.get("version")))
        if key in seen:
            errors.append(f"approvedArchiveContextSet.forms[{index}] duplicates form id/version")
        seen.add(key)
        if isinstance(candidate_binding, dict) and form.get("candidateSetHash") != candidate_binding.get("setHash"):
            errors.append(f"approvedArchiveContextSet.forms[{index}] candidateSetHash does not match wrapper")
        if isinstance(review_binding, dict):
            child_review = form_set.get("reviewDecisionBinding")
            if not isinstance(child_review, dict) or child_review.get("decisionSetHash") != review_binding.get("decisionSetHash"):
                errors.append(f"approvedArchiveContextSet.forms[{index}] decisionSetHash does not match wrapper")
        child_authority = form_set.get("approvalAuthorityBinding")
        if isinstance(authority_binding, dict) and (
            not isinstance(child_authority, dict) or child_authority != authority_binding
        ):
            errors.append(f"approvedArchiveContextSet.forms[{index}] approval authority binding does not match wrapper")
        if ai_assisted and form_set.get("reviewGovernance") != context_set.get("reviewGovernance"):
            errors.append(f"approvedArchiveContextSet.forms[{index}] review governance does not match wrapper")
        if form.get("releaseBinding") is None:
            errors.append(f"approvedArchiveContextSet.forms[{index}] must preserve archive release hashes")
    summary = context_set.get("summary")
    errors.extend(
        _strict_keys(
            summary,
            required={
                "formCount", "questionCount", "approvedSolutionCount",
                "contextReadyQuestionCount", "unavailableQuestionCount",
            },
            path="approvedArchiveContextSet.summary",
        )
    )
    if isinstance(summary, dict):
        def child_summary_value(form_set: Any, key: str) -> int:
            if not isinstance(form_set, dict):
                return 0
            child_summary = form_set.get("summary")
            if not isinstance(child_summary, dict):
                return 0
            value = child_summary.get(key)
            return value if isinstance(value, int) and not isinstance(value, bool) else 0

        expected = {
            "formCount": len(forms),
            "questionCount": sum(child_summary_value(form, "questionCount") for form in forms),
            "approvedSolutionCount": sum(child_summary_value(form, "approvedSolutionCount") for form in forms),
            "contextReadyQuestionCount": sum(child_summary_value(form, "contextReadyQuestionCount") for form in forms),
            "unavailableQuestionCount": sum(child_summary_value(form, "unavailableQuestionCount") for form in forms),
        }
        if summary != expected:
            errors.append("approvedArchiveContextSet.summary does not match forms")
    if context_set.get("setHash") != canonical_hash(context_set, omit=("setHash",)):
        errors.append("approvedArchiveContextSet.setHash does not match canonical content")
    return errors


def _literal_markdown(value: str) -> str:
    longest = max((len(run) for run in re.findall(r"`+", value)), default=0)
    fence = "`" * max(3, longest + 1)
    return f"{fence}text\n{value.rstrip()}\n{fence}"


def approved_question_context_set_markdown(context_set: dict[str, Any]) -> str:
    """Render a private companion document with every supplied string inert."""

    if context_set.get("schemaVersion") in (
        APPROVED_ARCHIVE_SET_SCHEMA,
        AI_ASSISTED_APPROVED_ARCHIVE_SET_SCHEMA,
    ):
        lines = [
            "# Approved archive question context set", "",
            "> **PRIVATE AI CONTEXT ONLY.** No answer keys are present.", "",
            f"- Set hash: `{context_set['setHash']}`",
            f"- Selected forms: {context_set['summary']['formCount']}", "",
        ]
        for form in context_set["forms"]:
            lines.extend(["---", "", approved_question_context_set_markdown(form).rstrip(), ""])
        return "\n".join(lines).rstrip() + "\n"

    lines = [
        "# Approved question context set",
        "",
        "> **PRIVATE AI CONTEXT ONLY.** No answer key is present.",
        "",
        f"- Set hash: `{context_set['setHash']}`",
        f"- Ready questions: {context_set['summary']['contextReadyQuestionCount']}",
        f"- Unavailable questions: {context_set['summary']['unavailableQuestionCount']}",
        "",
        "## Form id (literal)", "", _literal_markdown(context_set["formBinding"]["id"]), "",
        "## Form version (literal)", "", _literal_markdown(context_set["formBinding"]["version"]), "",
    ]
    for question in context_set["questions"]:
        lines.extend(
            [
                f"## Question {question['number']}", "",
                f"- Context status: `{question['availability']['status']}`",
                f"- Approved solution count: {question['availability']['approvedSolutionCount']}",
                "", "Prompt (literal):", "", _literal_markdown(question["promptMarkdown"]), "",
            ]
        )
        for option in "ABCDE":
            lines.extend([f"Choice {option} (literal):", "", _literal_markdown(question["choices"][option]), ""])
        for solution in question["approvedSolutions"]:
            lines.extend(
                [
                    f"### {solution['solutionId']}", "", "Title (literal):", "",
                    _literal_markdown(solution["title"]), "", "Body (literal):", "",
                    _literal_markdown(solution["bodyMarkdown"]), "",
                ]
            )
    return "\n".join(lines).rstrip() + "\n"
