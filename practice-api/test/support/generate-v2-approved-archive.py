#!/usr/bin/env python3
"""Generate one production v2 archive child through the real content compiler.

The release JSON is read from stdin.  The helper deliberately builds the full
48-form/1200-question candidate inventory required by the production archive
contract, while selecting exactly one 25-question form for approval.  Every
selected question receives two source-provenance candidates.
"""

from __future__ import annotations

import json
import sys
from hashlib import sha256
from pathlib import Path
from typing import Any


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPOSITORY_ROOT / "practice-content"))

from amc_content.approval import (  # noqa: E402
    compile_approved_question_context_set,
    decision_record_hash,
)
from amc_content.canonical import canonical_hash, sha256_text  # noqa: E402
from amc_content.question_context import (  # noqa: E402
    validate_archive_question_context_set,
)
from amc_content.supplement import (  # noqa: E402
    compose_supplemented_archive_candidate_set,
    supplemental_candidate_index,
)


AUTHORITY_ID = "approval-authority:fixture"
OPERATOR_ID = "operator:v2-fixture-owner"
AUTHORIZATION_ID = "authorization:v2-fixture-review"


def candidate_solution(question: dict[str, Any], position: int) -> dict[str, Any]:
    source_ref = question["sourceRef"]
    body = (
        f"Approved v2 method {position} for question {question['number']}: "
        f"derive the result with {'algebra' if position == 1 else 'casework'} and verify each step.\n"
    )
    return {
        "solutionId": f"solution-{position:03d}",
        "sourceOrder": position,
        "title": f"V2 method {position}",
        "headingLevel": 2,
        "bodyMarkdown": body,
        "bodySha256": sha256_text(body),
        "reviewStatus": "candidate",
        "quarantineReasons": [],
        "excludedSourceRanges": [],
        "sourceRef": {
            "path": source_ref["path"],
            "sha256": source_ref["sha256"],
            "headingLine": position,
            "endLine": position,
        },
    }


def candidate_context(manifest: dict[str, Any], question: dict[str, Any]) -> dict[str, Any]:
    release_binding = {
        "formId": manifest["id"],
        "formVersion": manifest["version"],
        "questionBundleHash": manifest["questionBundleHash"],
        "contentHash": manifest["contentHash"],
        "manifestHash": manifest["manifestHash"],
    }
    value = {
        "schemaVersion": "amc-question-context-candidates-v1",
        "classificationPolicyVersion": "amc-written-solution-title-review-v1",
        "audience": "private-review-only",
        "question": {
            "number": question["number"],
            "sourceRef": question["sourceRef"],
            "promptMarkdown": question["promptMarkdown"],
            "choices": question["choices"],
            "sourceReviewIssues": [],
        },
        "solutions": [candidate_solution(question, 1), candidate_solution(question, 2)],
        "releaseBinding": release_binding,
        "disclaimer": "Private source candidates awaiting delegated review.",
    }
    value["contextHash"] = canonical_hash(value)
    return value


def context_summary(contexts: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "questionCount": len(contexts),
        "candidateSolutionCount": sum(
            solution["reviewStatus"] == "candidate"
            for context in contexts
            for solution in context["solutions"]
        ),
        "quarantinedSolutionCount": 0,
        "approvedSolutionCount": 0,
        "parserErrorCount": 0,
        "parserWarningCount": 0,
    }


def archive_candidate(release: dict[str, Any]) -> dict[str, Any]:
    forms = []
    for manifest in release["forms"]:
        contexts = [candidate_context(manifest, question) for question in manifest["questions"]]
        forms.append({
            "form": {
                "id": manifest["id"],
                "version": manifest["version"],
                "title": manifest["title"],
                "questionBundleHash": manifest["questionBundleHash"],
                "contentHash": manifest["contentHash"],
                "manifestHash": manifest["manifestHash"],
            },
            "summary": context_summary(contexts),
            "questions": contexts,
        })
    all_contexts = [context for form in forms for context in form["questions"]]
    release_bytes = json.dumps(release, sort_keys=True, separators=(",", ":")).encode("utf-8")
    value = {
        "schemaVersion": "amc-question-context-archive-candidate-set-v1",
        "classificationPolicyVersion": "amc-written-solution-title-review-v1",
        "audience": "private-review-only",
        "archiveRelease": {
            "batchSchemaVersion": release["schemaVersion"],
            "releaseVersion": release["forms"][0]["version"],
            "sourcePath": "test-support/generated-archive-release.json",
            "sourceSha256": sha256(release_bytes).hexdigest(),
        },
        "summary": {"formCount": len(forms), **context_summary(all_contexts)},
        "forms": forms,
        "disclaimer": "Production-shaped private archive candidates; no solution is pre-approved.",
    }
    value["setHash"] = canonical_hash(value)
    errors = validate_archive_question_context_set(value)
    if errors:
        raise RuntimeError("invalid generated archive candidate: " + "; ".join(errors))
    return value


def with_original_supplement(candidate: dict[str, Any], target_id: str) -> dict[str, Any]:
    target = next(form for form in candidate["forms"] if form["form"]["id"] == target_id)
    context = target["questions"][0]
    body = "An operator-commissioned original alternative using a parity invariant.\n"
    rights_authorization = {
        "authorizationId": "authorization:v2-fixture-supplement-rights",
        "authorizedBy": OPERATOR_ID,
        "authorizedAt": "2026-08-03T11:00:00Z",
        "statement": "operator-attests-original-supplement-and-authorizes-ai-use",
    }
    record = {
        "supplementId": "supplement-v2-fixture-q01",
        "solutionId": "solution-900",
        "formId": target["form"]["id"],
        "formVersion": target["form"]["version"],
        "questionNumber": 1,
        "questionContentHash": canonical_hash({
            key: context["question"][key]
            for key in ("number", "sourceRef", "promptMarkdown", "choices")
        }),
        "releaseBinding": {
            key: target["form"][key]
            for key in ("questionBundleHash", "contentHash", "manifestHash")
        },
        "title": "Operator-original parity method",
        "bodyMarkdown": body,
        "bodySha256": sha256_text(body),
        "provenance": {
            "origin": "operator-commissioned-original",
            "authorId": "author:v2-fixture-independent",
            "createdAt": "2026-08-03T11:05:00Z",
            "rightsStatus": "operator-attested-original-and-authorized-for-ai-use",
            "rightsAuthorizationId": rights_authorization["authorizationId"],
        },
    }
    record["supplementRecordHash"] = canonical_hash(record)
    supplement_set = {
        "schemaVersion": "amc-original-solution-supplement-set-v1",
        "audience": "private-candidate-supplement-input",
        "provenancePolicyVersion": "amc-operator-original-solution-provenance-v1",
        "operatorAuthorization": rights_authorization,
        "archiveCandidateBinding": {
            "schemaVersion": candidate["schemaVersion"],
            "setHash": candidate["setHash"],
            "archiveRelease": candidate["archiveRelease"],
        },
        "supplements": [record],
    }
    supplement_set["supplementSetHash"] = canonical_hash(supplement_set)
    return compose_supplemented_archive_candidate_set(candidate, supplement_set)


def review_documents(candidate: dict[str, Any], target_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    base = candidate.get("baseCandidateSet", candidate)
    target = next(form for form in base["forms"] if form["form"]["id"] == target_id)
    supplements = supplemental_candidate_index(candidate) if "supplementSet" in candidate else {}
    authorization = {
        "authorizationId": AUTHORIZATION_ID,
        "authorizedBy": OPERATOR_ID,
        "authorizedAt": "2026-08-03T12:00:00Z",
        "scope": "solution-correctness-pedagogy-and-rights-review",
        "statement": "operator-delegates-ai-assisted-solution-review",
        "rightsAttestation": "operator-attests-rights-for-reviewed-source-ai-use",
    }
    records = []
    for context in target["questions"]:
        question = context["question"]
        question_projection = {
            key: question[key] for key in ("number", "sourceRef", "promptMarkdown", "choices")
        }
        solutions = context["solutions"]
        if question["number"] == 1 and supplements:
            solutions = [solutions[0], supplements[(
                target["form"]["id"], target["form"]["version"], 1, "solution-900"
            )]]
        for solution in solutions:
            record = {
                "formId": target["form"]["id"],
                "formVersion": target["form"]["version"],
                "questionNumber": question["number"],
                "solutionId": solution["solutionId"],
                "decision": "approved",
                "bodySha256": solution["bodySha256"],
                "sourceRef": {
                    "path": solution["sourceRef"]["path"],
                    "sha256": solution["sourceRef"]["sha256"],
                },
                "reviewerId": "reviewer:v2-fixture-independent",
                "reviewedAt": "2026-08-03T12:10:00Z",
                "rightsStatus": "approved-for-ai-use",
                "qualityFlags": [],
                "methodTags": ["algebra" if solution["solutionId"] == "solution-001" else "casework"],
                "reviewMethod": "operator-delegated-ai-assisted",
                "reviewModel": {
                    "provider": "openai-codex",
                    "model": "gpt-5.6-codex",
                    "runId": f"v2-review-q{question['number']:02d}-{solution['solutionId']}",
                },
                "operatorAuthorizationId": AUTHORIZATION_ID,
                "candidateProvenance": solution.get("candidateProvenance", {
                    "origin": "source-markdown",
                    "sourcePath": solution["sourceRef"]["path"],
                    "sourceSha256": solution["sourceRef"]["sha256"],
                }),
                "questionContentHash": canonical_hash(question_projection),
            }
            records.append(record)
    decisions = {
        "schemaVersion": "amc-question-context-review-decisions-v2",
        "audience": "private-operator-delegated-ai-assisted-review-input",
        "approvalPolicyVersion": "amc-operator-delegated-ai-assisted-solution-approval-v1",
        "candidateSetBinding": {
            "schemaVersion": candidate["schemaVersion"],
            "setHash": candidate["setHash"],
            "forms": [{"id": target["form"]["id"], "version": target["form"]["version"]}],
        },
        "operatorAuthorization": authorization,
        "decisions": records,
    }
    for record in records:
        record["decisionRecordHash"] = decision_record_hash(record, decisions)
    decisions["decisionSetHash"] = canonical_hash(decisions)
    receipts = {
        "schemaVersion": "amc-solution-approval-receipt-set-v1",
        "audience": "private-approval-authority-allowlist",
        "authorityId": AUTHORITY_ID,
        "receipts": [
            {
                "receiptId": f"receipt:v2-fixture-{index:03d}",
                "authorityId": AUTHORITY_ID,
                "decisionRecordHash": record["decisionRecordHash"],
                "issuedAt": "2026-08-03T12:20:00Z",
                "status": "active",
            }
            for index, record in enumerate(records, start=1)
        ],
    }
    receipts["receiptSetHash"] = canonical_hash(receipts)
    return decisions, receipts


def main() -> None:
    target_id = sys.argv[1] if len(sys.argv) > 1 else "amc12-2012-b"
    release = json.load(sys.stdin)
    candidate = with_original_supplement(archive_candidate(release), target_id)
    decisions, receipts = review_documents(candidate, target_id)
    artifact = compile_approved_question_context_set(candidate, decisions, receipts)
    json.dump({"artifact": artifact, "approvalReceipts": receipts}, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    main()
