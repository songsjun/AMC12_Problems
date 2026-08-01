"""Compile explicitly human-approved solution context for private AI use.

Candidate extraction and approval are intentionally separate trust domains.
This module never infers approval: every emitted solution must have one exact,
hash-bound human decision in a separately supplied document.
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


REVIEW_DECISIONS_SCHEMA = "amc-question-context-review-decisions-v1"
APPROVAL_RECEIPT_SET_SCHEMA = "amc-solution-approval-receipt-set-v1"
APPROVED_CONTEXT_SET_SCHEMA = "amc-approved-question-context-set-v1"
APPROVED_TEST_CONTEXT_SET_SCHEMA = "amc-approved-question-context-test-set-v1"
APPROVED_ARCHIVE_SET_SCHEMA = "amc-approved-question-context-archive-set-v1"
APPROVAL_POLICY_VERSION = "amc-explicit-human-solution-approval-v1"
MINIMUM_APPROVED_SOLUTIONS = 2
MAX_APPROVAL_INPUT_BYTES = 64 * 1024 * 1024
MAX_MODEL_PROMPT_BYTES = 16_384
MAX_MODEL_CHOICE_BYTES = 2_048
MAX_MODEL_SOLUTION_TITLE_BYTES = 256
MAX_MODEL_SOLUTION_BODY_BYTES = 16_384
MAX_MODEL_SOLUTIONS = 8

_SOLUTION_ID_RE = re.compile(r"solution-[0-9]{3}")
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
    return {
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
    return candidate_set["forms"]


def _validate_candidate_set(candidate_set: Any) -> list[str]:
    if not isinstance(candidate_set, dict):
        return ["candidateSet must be an object"]
    if candidate_set.get("schemaVersion") == "amc-question-context-candidate-set-v1":
        return validate_question_context_set(candidate_set)
    if candidate_set.get("schemaVersion") == "amc-question-context-archive-candidate-set-v1":
        return validate_archive_question_context_set(candidate_set)
    return ["candidateSet.schemaVersion is unsupported"]


def _candidate_index(candidate_set: dict[str, Any]) -> dict[tuple[str, str, int, str], dict[str, Any]]:
    result: dict[tuple[str, str, int, str], dict[str, Any]] = {}
    for form_record in _candidate_form_records(candidate_set):
        form = form_record["form"]
        for context in form_record["questions"]:
            number = context["question"]["number"]
            for solution in context["solutions"]:
                result[(form["id"], form["version"], number, solution["solutionId"])] = solution
    return result


def validate_review_decisions(
    decisions: Any,
    *,
    candidate_set: dict[str, Any] | None = None,
) -> list[str]:
    """Strictly validate human decisions and, when supplied, exact bindings."""

    unicode_errors = _unicode_scalar_errors(decisions, "reviewDecisions")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        decisions,
        required={
            "schemaVersion", "audience", "approvalPolicyVersion", "candidateSetBinding",
            "decisions", "decisionSetHash",
        },
        path="reviewDecisions",
    )
    if errors or not isinstance(decisions, dict):
        return errors
    if decisions.get("schemaVersion") != REVIEW_DECISIONS_SCHEMA:
        errors.append(f"reviewDecisions.schemaVersion must be {REVIEW_DECISIONS_SCHEMA}")
    if decisions.get("audience") != "private-human-review-input":
        errors.append("reviewDecisions.audience must be private-human-review-input")
    if decisions.get("approvalPolicyVersion") != APPROVAL_POLICY_VERSION:
        errors.append("reviewDecisions.approvalPolicyVersion is unsupported")

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
        if not isinstance(binding_schema, str) or binding_schema not in {
            "amc-question-context-candidate-set-v1",
            "amc-question-context-archive-candidate-set-v1",
        }:
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
        errors.extend(
            _strict_keys(
                record,
                required={
                    "formId", "formVersion", "questionNumber", "solutionId", "decision", "bodySha256", "sourceRef",
                    "reviewerId", "reviewedAt", "rightsStatus", "qualityFlags", "methodTags", "decisionRecordHash",
                },
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
    receipt_index = {
        receipt["decisionRecordHash"]: receipt
        for receipt in approval_receipts["receipts"]
        if receipt["status"] == "active"
    }
    selected = {
        (form["id"], form["version"])
        for form in review_decisions["candidateSetBinding"]["forms"]
    }
    compiled = [
        _compile_approved_form(
            form_record,
            candidate_set_hash=candidate_set["setHash"],
            candidate_schema_version=candidate_set["schemaVersion"],
            decision_set_hash=review_decisions["decisionSetHash"],
            decision_index=decision_index,
            approval_authority_binding={
                "schemaVersion": APPROVAL_RECEIPT_SET_SCHEMA,
                "authorityId": approval_receipts["authorityId"],
                "receiptSetHash": approval_receipts["receiptSetHash"],
            },
            receipt_index=receipt_index,
            allow_test_only=allow_test_only,
        )
        for form_record in _candidate_form_records(candidate_set)
        if (form_record["form"]["id"], form_record["form"]["version"]) in selected
    ]
    if candidate_set["schemaVersion"] == "amc-question-context-candidate-set-v1":
        return compiled[0]
    result: dict[str, Any] = {
        "schemaVersion": APPROVED_ARCHIVE_SET_SCHEMA,
        "audience": "private-ai-context-only",
        "approvalPolicyVersion": APPROVAL_POLICY_VERSION,
        "candidateSetBinding": {
            "schemaVersion": candidate_set["schemaVersion"],
            "setHash": candidate_set["setHash"],
            "archiveRelease": candidate_set["archiveRelease"],
        },
        "reviewDecisionBinding": {
            "schemaVersion": REVIEW_DECISIONS_SCHEMA,
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
        "disclaimer": "Private archive AI context containing only explicitly approved solutions and no answer keys.",
    }
    result["setHash"] = canonical_hash(result)
    output_errors = validate_approved_archive_context_set(result)
    if output_errors:
        raise ContentBuildError([f"invalid approved archive context set: {error}" for error in output_errors])
    return result


def _compile_approved_form(
    form_record: dict[str, Any],
    *,
    candidate_set_hash: str,
    candidate_schema_version: str,
    decision_set_hash: str,
    decision_index: dict[tuple[str, str, int, str], dict[str, Any]],
    approval_authority_binding: dict[str, Any],
    receipt_index: dict[str, dict[str, Any]],
    allow_test_only: bool,
) -> dict[str, Any]:
    form = form_record["form"]
    output_questions: list[dict[str, Any]] = []
    for context in form_record["questions"]:
        question = context["question"]
        approved: list[dict[str, Any]] = []
        for solution in context["solutions"]:
            decision = decision_index.get(
                (form["id"], form["version"], question["number"], solution["solutionId"])
            )
            if decision is None:
                continue
            receipt = receipt_index[decision["decisionRecordHash"]]
            visual = _contains_visual_reference(solution["bodyMarkdown"])
            approved.append(
                {
                    "solutionId": solution["solutionId"],
                    "title": solution["title"],
                    "bodyMarkdown": solution["bodyMarkdown"],
                    "bodySha256": solution["bodySha256"],
                    "sourceRef": solution["sourceRef"],
                    "modelEligibility": {
                        "eligible": not visual,
                        "reason": "solution-visual-context-unavailable" if visual else None,
                    },
                    "approval": {
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
                    },
                }
            )
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
        "schemaVersion": APPROVED_CONTEXT_SET_SCHEMA if release_binding is not None else APPROVED_TEST_CONTEXT_SET_SCHEMA,
        "audience": "private-ai-context-only" if release_binding is not None else "private-test-only",
        "approvalPolicyVersion": APPROVAL_POLICY_VERSION,
        "formBinding": {
            "id": form["id"],
            "version": form["version"],
            "candidateSchemaVersion": candidate_schema_version,
            "candidateSetHash": candidate_set_hash,
            "contextContentHash": canonical_hash(form_projection),
            "releaseBinding": release_binding,
        },
        "reviewDecisionBinding": {
            "schemaVersion": REVIEW_DECISIONS_SCHEMA,
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
            "Private AI context compiled only from exact human approvals. "
            "It intentionally contains no answer key or correct option."
        ),
    }
    result["setHash"] = canonical_hash(result)
    output_errors = (
        validate_approved_question_context_set(result)
        if release_binding is not None
        else validate_approved_question_context_test_set(result)
    )
    if output_errors:
        raise ContentBuildError([f"invalid approved context set: {error}" for error in output_errors])
    return result


def validate_approved_question_context_set(context_set: Any) -> list[str]:
    """Validate production-importable context; test-only artifacts always fail."""

    return _validate_approved_question_context_set(context_set, test_only=False)


def validate_approved_question_context_test_set(context_set: Any) -> list[str]:
    """Validate an explicitly synthetic artifact that production importers reject."""

    return _validate_approved_question_context_set(context_set, test_only=True)


def _validate_approved_question_context_set(context_set: Any, *, test_only: bool) -> list[str]:
    """Strictly validate an approved model-context artifact and all hashes."""

    unicode_errors = _unicode_scalar_errors(context_set, "approvedContextSet")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        context_set,
        required={
            "schemaVersion", "audience", "approvalPolicyVersion", "formBinding",
            "reviewDecisionBinding", "approvalAuthorityBinding", "summary", "questions", "disclaimer", "setHash",
        },
        path="approvedContextSet",
    )
    if errors or not isinstance(context_set, dict):
        return errors
    expected_schema = APPROVED_TEST_CONTEXT_SET_SCHEMA if test_only else APPROVED_CONTEXT_SET_SCHEMA
    expected_audience = "private-test-only" if test_only else "private-ai-context-only"
    if context_set.get("schemaVersion") != expected_schema:
        errors.append(f"approvedContextSet.schemaVersion must be {expected_schema}")
    if context_set.get("audience") != expected_audience:
        errors.append(f"approvedContextSet.audience must be {expected_audience}")
    if context_set.get("approvalPolicyVersion") != APPROVAL_POLICY_VERSION:
        errors.append("approvedContextSet.approvalPolicyVersion is unsupported")
    if not isinstance(context_set.get("disclaimer"), str) or not context_set["disclaimer"]:
        errors.append("approvedContextSet.disclaimer must be non-empty")

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
        if not isinstance(candidate_schema, str) or candidate_schema not in {
            "amc-question-context-candidate-set-v1", "amc-question-context-archive-candidate-set-v1",
        }:
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
        if review.get("schemaVersion") != REVIEW_DECISIONS_SCHEMA:
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
            errors.extend(
                _strict_keys(
                    solution,
                    required={
                        "solutionId", "title", "bodyMarkdown", "bodySha256", "sourceRef",
                        "modelEligibility", "approval",
                    },
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
                if solution_ref.get("path") != safe_question_ref.get("path") or solution_ref.get("sha256") != safe_question_ref.get("sha256"):
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
            errors.extend(
                _strict_keys(
                    approval,
                    required={
                        "reviewerId", "reviewedAt", "rightsStatus", "qualityFlags", "methodTags",
                        "decisionRecordHash", "authorityReceipt",
                    },
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


def validate_approved_archive_context_set(context_set: Any) -> list[str]:
    """Strictly validate a selected-form wrapper compiled from the archive."""

    unicode_errors = _unicode_scalar_errors(context_set, "approvedArchiveContextSet")
    if unicode_errors:
        return unicode_errors
    errors = _strict_keys(
        context_set,
        required={
            "schemaVersion", "audience", "approvalPolicyVersion", "candidateSetBinding",
            "reviewDecisionBinding", "approvalAuthorityBinding", "summary", "forms", "disclaimer", "setHash",
        },
        path="approvedArchiveContextSet",
    )
    if errors or not isinstance(context_set, dict):
        return errors
    if context_set.get("schemaVersion") != APPROVED_ARCHIVE_SET_SCHEMA:
        errors.append(f"approvedArchiveContextSet.schemaVersion must be {APPROVED_ARCHIVE_SET_SCHEMA}")
    if context_set.get("audience") != "private-ai-context-only":
        errors.append("approvedArchiveContextSet.audience must be private-ai-context-only")
    if context_set.get("approvalPolicyVersion") != APPROVAL_POLICY_VERSION:
        errors.append("approvedArchiveContextSet.approvalPolicyVersion is unsupported")
    if not isinstance(context_set.get("disclaimer"), str) or not context_set["disclaimer"]:
        errors.append("approvedArchiveContextSet.disclaimer must be non-empty")
    candidate_binding = context_set.get("candidateSetBinding")
    errors.extend(
        _strict_keys(
            candidate_binding,
            required={"schemaVersion", "setHash", "archiveRelease"},
            path="approvedArchiveContextSet.candidateSetBinding",
        )
    )
    if isinstance(candidate_binding, dict):
        if candidate_binding.get("schemaVersion") != "amc-question-context-archive-candidate-set-v1":
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
        if review_binding.get("schemaVersion") != REVIEW_DECISIONS_SCHEMA:
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
    forms = context_set.get("forms")
    if not isinstance(forms, list) or not forms or len(forms) > 48:
        errors.append("approvedArchiveContextSet.forms must contain 1 through 48 form sets")
        forms = []
    seen: set[tuple[str, str]] = set()
    for index, form_set in enumerate(forms):
        child_errors = validate_approved_question_context_set(form_set)
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

    if context_set.get("schemaVersion") == APPROVED_ARCHIVE_SET_SCHEMA:
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
