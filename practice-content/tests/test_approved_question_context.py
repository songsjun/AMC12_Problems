from __future__ import annotations

import copy
import json
import multiprocessing
import os
import re
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from amc_content.approval import (
    MAX_APPROVAL_INPUT_BYTES,
    _contains_visual_reference,
    approved_question_context_set_markdown,
    compile_approved_question_context_set,
    decision_record_hash,
    load_strict_json,
    validate_approval_receipt_set,
    validate_approved_archive_context_set,
    validate_approved_question_context_set,
    validate_approved_question_context_test_set,
    validate_review_decisions,
)
from amc_content.builder import ContentBuildError, load_source_form
from amc_content.canonical import canonical_hash, canonical_json, sha256_text
from amc_content.cli import main
from amc_content.question_context import build_archive_question_context_set, build_question_context_set
from amc_content.supplement import (
    compose_supplemented_archive_candidate_set,
    question_projection,
    supplemental_candidate_index,
    validate_original_solution_supplement_set,
    validate_supplemented_archive_candidate_set,
)


CONTENT_ROOT = Path(__file__).resolve().parents[1]
AMC_ROOT = CONTENT_ROOT.parent
FIXTURE = CONTENT_ROOT / "fixtures" / "synthetic-25"


def _run_approval_cli_after_barrier(barrier, results, argv: list[str]) -> None:
    barrier.wait(timeout=20)
    results.put(main(argv))


class ApprovedQuestionContextTests(unittest.TestCase):
    def setUp(self) -> None:
        form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        self.candidate = build_question_context_set(form)
        self._add_second_solution(self.candidate, 1)

    @staticmethod
    def _add_second_solution(candidate: dict, number: int) -> None:
        context = candidate["questions"][number - 1]
        second = copy.deepcopy(context["solutions"][0])
        second.update(
            {
                "solutionId": "solution-002",
                "sourceOrder": 2,
                "title": "Solution 2 (alternative method)",
                "bodyMarkdown": "A distinct synthetic alternative derivation.\n",
            }
        )
        second["bodySha256"] = sha256_text(second["bodyMarkdown"])
        context["solutions"].append(second)
        context["contextHash"] = canonical_hash(context, omit=("contextHash",))
        candidate["summary"]["candidateSolutionCount"] += 1
        candidate["setHash"] = canonical_hash(candidate, omit=("setHash",))

    def _decision(self, solution_id: str = "solution-001", *, number: int = 1) -> dict:
        form = self.candidate["form"]
        solution = next(
            solution
            for solution in self.candidate["questions"][number - 1]["solutions"]
            if solution["solutionId"] == solution_id
        )
        return {
            "formId": form["id"],
            "formVersion": form["version"],
            "questionNumber": number,
            "solutionId": solution_id,
            "decision": "approved",
            "bodySha256": solution["bodySha256"],
            "sourceRef": {
                "path": solution["sourceRef"]["path"],
                "sha256": solution["sourceRef"]["sha256"],
            },
            "reviewerId": "reviewer:test-001",
            "reviewedAt": "2026-08-01T12:34:56Z",
            "rightsStatus": "approved-for-ai-use",
            "qualityFlags": [],
            "methodTags": ["algebra"],
        }

    def _decisions(self, records: list[dict]) -> dict:
        value = {
            "schemaVersion": "amc-question-context-review-decisions-v1",
            "audience": "private-human-review-input",
            "approvalPolicyVersion": "amc-explicit-human-solution-approval-v1",
            "candidateSetBinding": {
                "schemaVersion": self.candidate["schemaVersion"],
                "setHash": self.candidate["setHash"],
                "forms": [{"id": self.candidate["form"]["id"], "version": self.candidate["form"]["version"]}],
            },
            "decisions": records,
        }
        for record in records:
            record["decisionRecordHash"] = decision_record_hash(record, value)
        value["decisionSetHash"] = canonical_hash(value)
        return value

    def _ai_assisted_decisions(self, records: list[dict]) -> dict:
        authorization = {
            "authorizationId": "authorization:operator-001",
            "authorizedBy": "operator:workspace-owner-001",
            "authorizedAt": "2026-08-03T12:00:00Z",
            "scope": "solution-correctness-pedagogy-and-rights-review",
            "statement": "operator-delegates-ai-assisted-solution-review",
            "rightsAttestation": "operator-attests-rights-for-reviewed-source-ai-use",
        }
        for index, record in enumerate(records, start=1):
            record.update(
                {
                    "reviewMethod": "operator-delegated-ai-assisted",
                    "reviewModel": {
                        "provider": "openai-codex",
                        "model": "gpt-5.6-codex",
                        "runId": f"review-run-{index:03d}",
                    },
                    "operatorAuthorizationId": authorization["authorizationId"],
                    "candidateProvenance": {
                        "origin": "source-markdown",
                        "sourcePath": record["sourceRef"]["path"],
                        "sourceSha256": record["sourceRef"]["sha256"],
                    },
                    "questionContentHash": canonical_hash({
                        key: self.candidate["questions"][record["questionNumber"] - 1]["question"][key]
                        for key in ("number", "sourceRef", "promptMarkdown", "choices")
                    }),
                }
            )
        value = {
            "schemaVersion": "amc-question-context-review-decisions-v2",
            "audience": "private-operator-delegated-ai-assisted-review-input",
            "approvalPolicyVersion": "amc-operator-delegated-ai-assisted-solution-approval-v1",
            "candidateSetBinding": {
                "schemaVersion": self.candidate["schemaVersion"],
                "setHash": self.candidate["setHash"],
                "forms": [{"id": self.candidate["form"]["id"], "version": self.candidate["form"]["version"]}],
            },
            "operatorAuthorization": authorization,
            "decisions": records,
        }
        for record in records:
            record["decisionRecordHash"] = decision_record_hash(record, value)
        value["decisionSetHash"] = canonical_hash(value)
        return value

    @staticmethod
    def _receipts(decisions: dict) -> dict:
        value = {
            "schemaVersion": "amc-solution-approval-receipt-set-v1",
            "audience": "private-approval-authority-allowlist",
            "authorityId": "authority:synthetic-001",
            "receipts": [
                {
                    "receiptId": f"receipt:synthetic-{index:03d}",
                    "authorityId": "authority:synthetic-001",
                    "decisionRecordHash": record["decisionRecordHash"],
                    "issuedAt": "2026-08-01T13:00:00Z",
                    "status": "active",
                }
                for index, record in enumerate(decisions["decisions"], start=1)
            ],
        }
        value["receiptSetHash"] = canonical_hash(value)
        return value

    def _compile(self, decisions: dict) -> dict:
        return compile_approved_question_context_set(
            self.candidate, decisions, self._receipts(decisions), allow_test_only=True
        )

    @staticmethod
    def _rehash(decisions: dict) -> None:
        decisions["decisionSetHash"] = canonical_hash(decisions, omit=("decisionSetHash",))

    def test_zero_one_and_two_explicit_approvals_control_readiness(self) -> None:
        zero = self._compile(self._decisions([]))
        one = self._compile(self._decisions([self._decision()]))
        two_decisions = self._decisions([self._decision(), self._decision("solution-002")])
        two = self._compile(two_decisions)

        self.assertFalse(zero["questions"][0]["contextReady"])
        self.assertEqual(zero["questions"][0]["availability"]["approvedSolutionCount"], 0)
        self.assertFalse(one["questions"][0]["contextReady"])
        self.assertEqual(one["questions"][0]["availability"]["approvedSolutionCount"], 1)
        self.assertTrue(two["questions"][0]["contextReady"])
        self.assertEqual(two["questions"][0]["availability"]["approvedSolutionCount"], 2)
        self.assertEqual(two["questions"][0]["promptMarkdown"], self.candidate["questions"][0]["question"]["promptMarkdown"])
        self.assertEqual(two["questions"][0]["choices"], self.candidate["questions"][0]["question"]["choices"])
        self.assertNotIn("correctOption", canonical_json(two))
        self.assertNotIn("answerKey", canonical_json(two))
        self.assertEqual(two["schemaVersion"], "amc-approved-question-context-test-set-v1")
        self.assertEqual(two["audience"], "private-test-only")
        self.assertNotIn("reviewGovernance", two)
        self.assertNotIn("reviewModel", two["questions"][0]["approvedSolutions"][0]["approval"])
        self.assertNotIn("candidateProvenance", two["questions"][0]["approvedSolutions"][0])
        self.assertTrue(validate_approved_question_context_set(two))
        self.assertEqual(validate_approved_question_context_test_set(two), [])

    def test_operator_delegated_ai_assisted_policy_is_explicit_and_not_human_v1(self) -> None:
        decisions = self._ai_assisted_decisions(
            [self._decision(), self._decision("solution-002")]
        )
        receipts = self._receipts(decisions)
        approved = compile_approved_question_context_set(
            self.candidate, decisions, receipts, allow_test_only=True
        )

        self.assertEqual(validate_review_decisions(decisions, candidate_set=self.candidate), [])
        self.assertEqual(validate_approval_receipt_set(receipts, decisions=decisions), [])
        self.assertEqual(
            validate_approved_question_context_test_set(
                approved, approval_receipts=receipts
            ),
            [],
        )
        self.assertEqual(approved["schemaVersion"], "amc-approved-question-context-test-set-v2")
        self.assertEqual(
            approved["approvalPolicyVersion"],
            "amc-operator-delegated-ai-assisted-solution-approval-v1",
        )
        self.assertEqual(
            approved["reviewGovernance"]["operatorAuthorization"],
            decisions["operatorAuthorization"],
        )
        for solution in approved["questions"][0]["approvedSolutions"]:
            approval = solution["approval"]
            self.assertEqual(approval["reviewMethod"], "operator-delegated-ai-assisted")
            self.assertEqual(approval["reviewModel"]["provider"], "openai-codex")
            self.assertEqual(approval["reviewerId"], "reviewer:test-001")
            self.assertEqual(
                approval["operatorAuthorizationId"],
                decisions["operatorAuthorization"]["authorizationId"],
            )
            self.assertEqual(approval["authorityReceipt"]["status"], "active")
        self.assertNotIn("human-approved", approved["disclaimer"].casefold())

    def test_ai_assisted_policy_tampering_and_v1_cross_policy_fields_fail_closed(self) -> None:
        decisions = self._ai_assisted_decisions([self._decision()])
        cases = {
            "method": ("reviewMethod", "human", "reviewMethod"),
            "authorization": ("operatorAuthorizationId", "authorization:other-001", "operatorAuthorizationId"),
        }
        for name, (field, value, expected) in cases.items():
            with self.subTest(name=name):
                malformed = copy.deepcopy(decisions)
                malformed["decisions"][0][field] = value
                malformed["decisionSetHash"] = canonical_hash(malformed, omit=("decisionSetHash",))
                errors = validate_review_decisions(malformed, candidate_set=self.candidate)
                self.assertTrue(any(expected in error for error in errors), errors)

        model_tampered = copy.deepcopy(decisions)
        model_tampered["decisions"][0]["reviewModel"]["model"] = "different-model"
        model_tampered["decisionSetHash"] = canonical_hash(model_tampered, omit=("decisionSetHash",))
        errors = validate_review_decisions(model_tampered, candidate_set=self.candidate)
        self.assertTrue(any("decisionRecordHash" in error for error in errors), errors)

        authorization_tampered = copy.deepcopy(decisions)
        authorization_tampered["operatorAuthorization"]["authorizedBy"] = "operator:different-owner-001"
        authorization_tampered["operatorAuthorization"]["authorizedAt"] = "2026-08-03T12:00:01Z"
        authorization_tampered["decisionSetHash"] = canonical_hash(
            authorization_tampered, omit=("decisionSetHash",)
        )
        errors = validate_review_decisions(authorization_tampered, candidate_set=self.candidate)
        self.assertTrue(any("decisionRecordHash" in error for error in errors), errors)

        receipts = self._receipts(decisions)
        approved = compile_approved_question_context_set(
            self.candidate, decisions, receipts, allow_test_only=True
        )
        compiled_authorization_tampered = copy.deepcopy(approved)
        compiled_authorization_tampered["reviewGovernance"]["operatorAuthorization"][
            "authorizedBy"
        ] = "operator:different-owner-001"
        compiled_authorization_tampered["reviewGovernance"]["operatorAuthorization"][
            "authorizedAt"
        ] = "2026-08-03T12:00:01Z"
        attacker_decisions = copy.deepcopy(decisions)
        attacker_decisions["operatorAuthorization"] = copy.deepcopy(
            compiled_authorization_tampered["reviewGovernance"]["operatorAuthorization"]
        )
        for record in attacker_decisions["decisions"]:
            record["decisionRecordHash"] = decision_record_hash(record, attacker_decisions)
        attacker_decisions["decisionSetHash"] = canonical_hash(
            attacker_decisions, omit=("decisionSetHash",)
        )
        attacker_hashes = {
            (record["questionNumber"], record["solutionId"]): record["decisionRecordHash"]
            for record in attacker_decisions["decisions"]
        }
        for question in compiled_authorization_tampered["questions"]:
            for solution in question["approvedSolutions"]:
                solution["approval"]["decisionRecordHash"] = attacker_hashes[
                    (question["number"], solution["solutionId"])
                ]
        compiled_authorization_tampered["setHash"] = canonical_hash(
            compiled_authorization_tampered, omit=("setHash",)
        )
        errors = validate_approved_question_context_test_set(
            compiled_authorization_tampered, approval_receipts=receipts
        )
        self.assertTrue(any("trusted receipt" in error for error in errors), errors)

        stale_stem = copy.deepcopy(decisions)
        stale_stem["decisions"][0]["questionContentHash"] = "0" * 64
        stale_stem["decisions"][0]["decisionRecordHash"] = decision_record_hash(
            stale_stem["decisions"][0], stale_stem
        )
        stale_stem["decisionSetHash"] = canonical_hash(stale_stem, omit=("decisionSetHash",))
        errors = validate_review_decisions(stale_stem, candidate_set=self.candidate)
        self.assertTrue(any("exact candidate question" in error for error in errors), errors)

        human_v1 = self._decisions([self._decision()])
        human_v1["operatorAuthorization"] = decisions["operatorAuthorization"]
        human_v1["decisionSetHash"] = canonical_hash(human_v1, omit=("decisionSetHash",))
        errors = validate_review_decisions(human_v1, candidate_set=self.candidate)
        self.assertTrue(any("unknown fields" in error for error in errors), errors)

        missing_receipts = self._receipts(decisions)
        missing_receipts["receipts"] = []
        missing_receipts["receiptSetHash"] = canonical_hash(missing_receipts, omit=("receiptSetHash",))
        with self.assertRaisesRegex(ContentBuildError, "exactly one active"):
            compile_approved_question_context_set(
                self.candidate, decisions, missing_receipts, allow_test_only=True
            )

        non_independent = self._receipts(decisions)
        non_independent["authorityId"] = decisions["decisions"][0]["reviewerId"]
        for receipt in non_independent["receipts"]:
            receipt["authorityId"] = non_independent["authorityId"]
        non_independent["receiptSetHash"] = canonical_hash(non_independent, omit=("receiptSetHash",))
        errors = validate_approval_receipt_set(non_independent, decisions=decisions)
        self.assertTrue(any("distinct" in error for error in errors), errors)

        self_authorized = copy.deepcopy(decisions)
        self_authorized["decisions"][0]["reviewerId"] = self_authorized["operatorAuthorization"]["authorizedBy"]
        self_authorized["decisions"][0]["decisionRecordHash"] = decision_record_hash(
            self_authorized["decisions"][0], self_authorized
        )
        self_authorized["decisionSetHash"] = canonical_hash(
            self_authorized, omit=("decisionSetHash",)
        )
        self_authorized_receipts = self._receipts(self_authorized)
        errors = validate_review_decisions(self_authorized, candidate_set=self.candidate)
        self.assertTrue(any("authorizing operator" in error for error in errors), errors)
        with self.assertRaisesRegex(ContentBuildError, "authorizing operator"):
            compile_approved_question_context_set(
                self.candidate, self_authorized, self_authorized_receipts, allow_test_only=True
            )

        operator_as_authority = self._receipts(decisions)
        operator_as_authority["authorityId"] = decisions["operatorAuthorization"]["authorizedBy"]
        for receipt in operator_as_authority["receipts"]:
            receipt["authorityId"] = operator_as_authority["authorityId"]
        operator_as_authority["receiptSetHash"] = canonical_hash(
            operator_as_authority, omit=("receiptSetHash",)
        )
        errors = validate_approval_receipt_set(operator_as_authority, decisions=decisions)
        self.assertTrue(any("distinct" in error for error in errors), errors)

    def test_visual_detector_covers_real_asymptote_and_aops_image_link_witnesses(self) -> None:
        asymptote = (AMC_ROOT / "2002_AMC_12A_Problems" / "Problem_23.md").read_text(encoding="utf-8")
        image_link = (AMC_ROOT / "2007_AMC_12A_Problems" / "Problem_06.md").read_text(encoding="utf-8")
        self.assertTrue(_contains_visual_reference(asymptote))
        self.assertTrue(_contains_visual_reference(image_link))
        for visual in (
            "```asy\ndraw((0,0)--(1,1));\n```",
            "~~~asy\ndraw(circle((0,0),1));\n~~~",
            "[asy]draw((0,0)--(1,1));[/asy]",
            r"\begin{asy} draw((0,0)--(1,1)); \end{asy}",
            "[diagram](assets/figure.PNG?revision=2)",
            "[Image:figure.png](https://artofproblemsolving.com/wiki/index.php/Image:figure.png)",
            "[File:figure.svg](https://artofproblemsolving.com/wiki/index.php/File:figure.svg)",
            "[[Image:figure.png|center]]",
            "[[File:figure.svg|thumb]]",
            "[diagram]: assets/figure.webp?revision=2",
        ):
            with self.subTest(visual=visual):
                self.assertTrue(_contains_visual_reference(visual))
        self.assertFalse(_contains_visual_reference(
            "See [the angle-bisector theorem](https://example.test/theorem) for a prose reference."
        ))

    def test_visual_detector_matches_shared_python_javascript_parity_vectors(self) -> None:
        fixture = json.loads((CONTENT_ROOT / "fixtures" / "visual-reference-parity.json").read_text(encoding="utf-8"))
        self.assertEqual(fixture["schemaVersion"], "amc-visual-reference-parity-v1")
        for vector in fixture["vectors"]:
            with self.subTest(name=vector["name"]):
                self.assertIs(_contains_visual_reference(vector["text"]), vector["expected"])

    def test_public_validators_reject_surrogates_and_unhashable_membership_shapes_without_raising(self) -> None:
        decisions = self._decisions([self._decision(), self._decision("solution-002")])
        receipts = self._receipts(decisions)
        approved = self._compile(decisions)

        malformed_receipts = copy.deepcopy(receipts)
        malformed_receipts["receipts"][0]["status"] = {}
        self.assertTrue(validate_approval_receipt_set(malformed_receipts, decisions=decisions))
        malformed_decisions = copy.deepcopy(decisions)
        malformed_decisions["candidateSetBinding"]["schemaVersion"] = []
        self.assertTrue(validate_review_decisions(malformed_decisions, candidate_set=self.candidate))
        malformed_approved = copy.deepcopy(approved)
        malformed_approved["formBinding"]["candidateSchemaVersion"] = {}
        self.assertTrue(validate_approved_question_context_test_set(malformed_approved))

        ai_decisions = self._ai_assisted_decisions([self._decision(), self._decision("solution-002")])
        ai_receipts = self._receipts(ai_decisions)
        malformed_ai_decisions = copy.deepcopy(ai_decisions)
        malformed_ai_decisions["decisions"][0]["reviewerId"] = []
        malformed_ai_decisions["decisions"][0]["decisionRecordHash"] = decision_record_hash(
            malformed_ai_decisions["decisions"][0], malformed_ai_decisions
        )
        malformed_ai_decisions["decisionSetHash"] = canonical_hash(
            malformed_ai_decisions, omit=("decisionSetHash",)
        )
        self.assertTrue(validate_approval_receipt_set(ai_receipts, decisions=malformed_ai_decisions))

        malformed_ai_receipts = copy.deepcopy(ai_receipts)
        malformed_ai_receipts["authorityId"] = []
        for receipt in malformed_ai_receipts["receipts"]:
            receipt["authorityId"] = []
        malformed_ai_receipts["receiptSetHash"] = canonical_hash(
            malformed_ai_receipts, omit=("receiptSetHash",)
        )
        self.assertTrue(validate_approval_receipt_set(malformed_ai_receipts, decisions=ai_decisions))

        for bad_identity in ([], {}):
            malformed_ai_decisions = copy.deepcopy(ai_decisions)
            malformed_ai_decisions["schemaVersion"] = bad_identity
            self.assertTrue(validate_review_decisions(malformed_ai_decisions, candidate_set=self.candidate))

            malformed_ai_approved = compile_approved_question_context_set(
                self.candidate, ai_decisions, ai_receipts, allow_test_only=True
            )
            malformed_ai_approved["approvalPolicyVersion"] = bad_identity
            self.assertTrue(validate_approved_question_context_test_set(malformed_ai_approved))

            malformed_ai_archive = {
                "schemaVersion": "amc-approved-question-context-archive-set-v2",
                "audience": "private-ai-context-only",
                "approvalPolicyVersion": bad_identity,
            }
            self.assertTrue(validate_approved_archive_context_set(malformed_ai_archive))

        surrogate_cases = (
            (validate_review_decisions, copy.deepcopy(decisions), ()),
            (validate_approval_receipt_set, copy.deepcopy(receipts), ()),
            (validate_approved_question_context_test_set, copy.deepcopy(approved), ()),
        )
        surrogate_cases[0][1]["decisions"][0]["methodTags"] = ["bad\ud800tag"]
        surrogate_cases[1][1]["receipts"][0]["receiptId"] = "bad\ud800receipt"
        surrogate_cases[2][1]["questions"][0]["promptMarkdown"] = "bad\ud800prompt"
        for validator, payload, args in surrogate_cases:
            with self.subTest(validator=validator.__name__):
                errors = validator(payload, *args)
                self.assertTrue(any("surrogate" in error for error in errors))

        for validator in (
            validate_review_decisions,
            validate_approval_receipt_set,
            validate_approved_question_context_set,
            validate_approved_question_context_test_set,
            validate_approved_archive_context_set,
        ):
            for payload in (None, [], {}, True, 1, "malformed"):
                with self.subTest(validator=validator.__name__, payload=type(payload).__name__):
                    self.assertIsInstance(validator(payload), list)

    def test_deterministic_and_all_hashes_detect_tampering(self) -> None:
        decisions = self._decisions([self._decision(), self._decision("solution-002")])
        first = self._compile(decisions)
        second = self._compile(decisions)
        self.assertEqual(canonical_json(first), canonical_json(second))

        tampered = copy.deepcopy(first)
        tampered["questions"][0]["promptMarkdown"] += "tamper"
        errors = validate_approved_question_context_test_set(tampered)
        self.assertTrue(any("questionContentHash" in error for error in errors))
        self.assertTrue(any("contextContentHash" in error for error in errors))
        self.assertTrue(any("setHash" in error for error in errors))

    def test_unknown_duplicate_quarantine_and_unbound_approvals_are_rejected(self) -> None:
        cases: list[tuple[str, dict, str]] = []
        unknown = self._decisions([self._decision()])
        unknown["decisions"][0]["solutionId"] = "solution-999"
        self._rehash(unknown)
        cases.append(("unknown", unknown, "unknown question/solution"))

        duplicate = self._decisions([self._decision(), self._decision()])
        cases.append(("duplicate", duplicate, "duplicates approval"))

        wrong_set = self._decisions([])
        wrong_set["candidateSetBinding"]["setHash"] = "0" * 64
        self._rehash(wrong_set)
        cases.append(("set binding", wrong_set, "setHash binding"))

        wrong_form = self._decisions([])
        wrong_form["candidateSetBinding"]["forms"][0]["version"] = "other"
        self._rehash(wrong_form)
        cases.append(("form binding", wrong_form, "unknown form"))

        wrong_body = self._decisions([self._decision()])
        wrong_body["decisions"][0]["bodySha256"] = "0" * 64
        self._rehash(wrong_body)
        cases.append(("body binding", wrong_body, "bodySha256 does not match"))

        wrong_source = self._decisions([self._decision()])
        wrong_source["decisions"][0]["sourceRef"]["sha256"] = "0" * 64
        self._rehash(wrong_source)
        cases.append(("source binding", wrong_source, "sourceRef.sha256 does not match"))

        for name, decisions, expected in cases:
            with self.subTest(name=name):
                self.assertTrue(any(expected in error for error in validate_review_decisions(decisions, candidate_set=self.candidate)))

        quarantined_candidate = copy.deepcopy(self.candidate)
        solution = quarantined_candidate["questions"][0]["solutions"][0]
        solution["reviewStatus"] = "quarantined"
        solution["quarantineReasons"] = ["manual-test-quarantine"]
        context = quarantined_candidate["questions"][0]
        context["contextHash"] = canonical_hash(context, omit=("contextHash",))
        quarantined_candidate["summary"]["candidateSolutionCount"] -= 1
        quarantined_candidate["summary"]["quarantinedSolutionCount"] += 1
        quarantined_candidate["setHash"] = canonical_hash(quarantined_candidate, omit=("setHash",))
        self.candidate = quarantined_candidate
        decisions = self._decisions([self._decision()])
        self.assertTrue(any("quarantined" in error for error in validate_review_decisions(decisions, candidate_set=self.candidate)))

    def test_rights_reviewer_timestamp_tags_and_decision_hash_are_strict(self) -> None:
        mutations = {
            "rights": ("rightsStatus", "unknown", "rightsStatus"),
            "reviewer": ("reviewerId", "x", "reviewerId"),
            "timestamp": ("reviewedAt", "not-a-time", "reviewedAt"),
            "method": ("methodTags", [], "at least one"),
        }
        for name, (field, value, expected) in mutations.items():
            with self.subTest(name=name):
                decisions = self._decisions([self._decision()])
                decisions["decisions"][0][field] = value
                self._rehash(decisions)
                self.assertTrue(any(expected in error for error in validate_review_decisions(decisions, candidate_set=self.candidate)))
        decisions = self._decisions([])
        decisions["decisionSetHash"] = "0" * 64
        self.assertTrue(any("decisionSetHash does not match" in error for error in validate_review_decisions(decisions)))

    def test_authority_receipts_reject_missing_wrong_revoked_duplicate_and_forged_decisions(self) -> None:
        decisions = self._decisions([self._decision()])
        trusted = self._receipts(decisions)

        missing = copy.deepcopy(trusted)
        missing["receipts"] = []
        missing["receiptSetHash"] = canonical_hash(missing, omit=("receiptSetHash",))

        wrong_authority = copy.deepcopy(trusted)
        wrong_authority["receipts"][0]["authorityId"] = "authority:other-001"
        wrong_authority["receiptSetHash"] = canonical_hash(wrong_authority, omit=("receiptSetHash",))

        wrong_decision = copy.deepcopy(trusted)
        wrong_decision["receipts"][0]["decisionRecordHash"] = "0" * 64
        wrong_decision["receiptSetHash"] = canonical_hash(wrong_decision, omit=("receiptSetHash",))

        active_and_revoked = copy.deepcopy(trusted)
        revoked = copy.deepcopy(active_and_revoked["receipts"][0])
        revoked.update({"receiptId": "receipt:synthetic-revoked", "status": "revoked"})
        active_and_revoked["receipts"].append(revoked)
        active_and_revoked["receiptSetHash"] = canonical_hash(active_and_revoked, omit=("receiptSetHash",))

        for name, receipts, expected in (
            ("missing", missing, "exactly one active"),
            ("wrong authority", wrong_authority, "authorityId does not match"),
            ("wrong decision", wrong_decision, "exactly one active"),
            ("active plus revoked", active_and_revoked, "exactly one active"),
        ):
            with self.subTest(name=name):
                errors = validate_approval_receipt_set(receipts, decisions=decisions)
                self.assertTrue(any(expected in error for error in errors), errors)
                with self.assertRaises(ContentBuildError):
                    compile_approved_question_context_set(
                        self.candidate, decisions, receipts, allow_test_only=True
                    )

        forged = copy.deepcopy(decisions)
        forged["decisions"][0]["reviewerId"] = "reviewer:forged-001"
        forged["decisions"][0]["decisionRecordHash"] = decision_record_hash(
            forged["decisions"][0], forged
        )
        forged["decisionSetHash"] = canonical_hash(forged, omit=("decisionSetHash",))
        errors = validate_approval_receipt_set(trusted, decisions=forged)
        self.assertTrue(any("exactly one active" in error for error in errors), errors)

    def test_production_release_gate_and_test_only_importer_contract_are_separate(self) -> None:
        decisions = self._decisions([])
        receipts = self._receipts(decisions)
        with self.assertRaisesRegex(ContentBuildError, "non-null releaseBinding"):
            compile_approved_question_context_set(self.candidate, decisions, receipts)

        synthetic = compile_approved_question_context_set(
            self.candidate, decisions, receipts, allow_test_only=True
        )
        self.assertEqual(validate_approved_question_context_test_set(synthetic), [])
        production_errors = validate_approved_question_context_set(synthetic)
        self.assertTrue(any("schemaVersion" in error for error in production_errors))
        self.assertTrue(any("audience" in error for error in production_errors))

    def test_compiled_output_requires_exact_active_receipt_and_authority_binding(self) -> None:
        decisions = self._decisions([self._decision(), self._decision("solution-002")])
        approved = self._compile(decisions)

        missing_receipt = copy.deepcopy(approved)
        del missing_receipt["questions"][0]["approvedSolutions"][0]["approval"]["authorityReceipt"]
        missing_receipt["setHash"] = canonical_hash(missing_receipt, omit=("setHash",))
        errors = validate_approved_question_context_test_set(missing_receipt)
        self.assertTrue(any("authorityReceipt" in error for error in errors), errors)

        wrong_authority = copy.deepcopy(approved)
        receipt = wrong_authority["questions"][0]["approvedSolutions"][0]["approval"]["authorityReceipt"]
        receipt["authorityId"] = "authority:other-001"
        wrong_authority["setHash"] = canonical_hash(wrong_authority, omit=("setHash",))
        errors = validate_approved_question_context_test_set(wrong_authority)
        self.assertTrue(any("authorityId does not match" in error for error in errors), errors)

        revoked = copy.deepcopy(approved)
        revoked["questions"][0]["approvedSolutions"][0]["approval"]["authorityReceipt"]["status"] = "revoked"
        revoked["setHash"] = canonical_hash(revoked, omit=("setHash",))
        errors = validate_approved_question_context_test_set(revoked)
        self.assertTrue(any("status must be active" in error for error in errors), errors)

    def test_question_and_solution_visuals_block_only_model_ready_context(self) -> None:
        question_candidate = copy.deepcopy(self.candidate)
        question = question_candidate["questions"][0]
        question["question"]["promptMarkdown"] += "\n![diagram](media/q1.svg)\n"
        question["contextHash"] = canonical_hash(question, omit=("contextHash",))
        question_candidate["setHash"] = canonical_hash(question_candidate, omit=("setHash",))
        self.candidate = question_candidate
        question_decisions = self._decisions([self._decision(), self._decision("solution-002")])
        compiled_question = self._compile(question_decisions)
        output_question = compiled_question["questions"][0]
        self.assertEqual(
            output_question["visualContext"],
            {"required": True, "modelAvailable": False, "reason": "question-visual-context-unavailable"},
        )
        self.assertFalse(output_question["contextReady"])
        self.assertEqual(output_question["availability"]["modelEligibleSolutionCount"], 2)
        self.assertEqual(output_question["availability"]["reason"], "question-visual-context-unavailable")

        solution_candidate = copy.deepcopy(question_candidate)
        solution_question = solution_candidate["questions"][0]
        solution_question["question"]["promptMarkdown"] = solution_question["question"]["promptMarkdown"].replace(
            "\n![diagram](media/q1.svg)\n", ""
        )
        second = solution_question["solutions"][1]
        second["bodyMarkdown"] += "\n<img src=\"media/solution.svg\">\n"
        second["bodySha256"] = sha256_text(second["bodyMarkdown"])
        solution_question["contextHash"] = canonical_hash(solution_question, omit=("contextHash",))
        solution_candidate["setHash"] = canonical_hash(solution_candidate, omit=("setHash",))
        self.candidate = solution_candidate
        solution_decisions = self._decisions([self._decision(), self._decision("solution-002")])
        compiled_solution = self._compile(solution_decisions)
        output_question = compiled_solution["questions"][0]
        self.assertFalse(output_question["contextReady"])
        self.assertEqual(output_question["availability"]["approvedSolutionCount"], 2)
        self.assertEqual(output_question["availability"]["modelEligibleSolutionCount"], 1)
        self.assertEqual(
            output_question["approvedSolutions"][1]["modelEligibility"],
            {"eligible": False, "reason": "solution-visual-context-unavailable"},
        )

    def test_model_text_utf8_byte_limits_and_solution_count_match_gateway_contract(self) -> None:
        boundary = copy.deepcopy(self.candidate)
        context = boundary["questions"][0]
        context["question"]["promptMarkdown"] = "汉" * 5_461
        context["question"]["choices"]["A"] = "汉" * 682
        for solution in context["solutions"]:
            solution["title"] = "汉" * 85
            solution["bodyMarkdown"] = "汉" * 5_461
            solution["bodySha256"] = sha256_text(solution["bodyMarkdown"])
        context["contextHash"] = canonical_hash(context, omit=("contextHash",))
        boundary["setHash"] = canonical_hash(boundary, omit=("setHash",))
        self.candidate = boundary
        decisions = self._decisions([self._decision(), self._decision("solution-002")])
        self.assertEqual(validate_approved_question_context_test_set(self._compile(decisions)), [])

        baseline = copy.deepcopy(boundary)
        cases = {
            "prompt": lambda item: item["question"].update({"promptMarkdown": "汉" * 5_462}),
            "choice": lambda item: item["question"]["choices"].update({"A": "汉" * 683}),
            "title": lambda item: item["solutions"][0].update({"title": "汉" * 86}),
            "body": lambda item: item["solutions"][0].update({"bodyMarkdown": "汉" * 5_462}),
            "invalid-codepoint": lambda item: item["question"].update({"promptMarkdown": "bad\x00prompt"}),
        }
        for name, mutate in cases.items():
            with self.subTest(name=name):
                candidate = copy.deepcopy(baseline)
                candidate_context = candidate["questions"][0]
                mutate(candidate_context)
                for solution in candidate_context["solutions"]:
                    solution["bodySha256"] = sha256_text(solution["bodyMarkdown"])
                candidate_context["contextHash"] = canonical_hash(candidate_context, omit=("contextHash",))
                candidate["setHash"] = canonical_hash(candidate, omit=("setHash",))
                self.candidate = candidate
                decisions = self._decisions([self._decision(), self._decision("solution-002")])
                with self.assertRaises(ContentBuildError):
                    self._compile(decisions)

        too_many = copy.deepcopy(baseline)
        too_many_context = too_many["questions"][0]
        template = too_many_context["solutions"][1]
        for number in range(3, 10):
            solution = copy.deepcopy(template)
            solution.update({"solutionId": f"solution-{number:03d}", "sourceOrder": number})
            too_many_context["solutions"].append(solution)
        too_many["summary"]["candidateSolutionCount"] += 7
        too_many_context["contextHash"] = canonical_hash(too_many_context, omit=("contextHash",))
        too_many["setHash"] = canonical_hash(too_many, omit=("setHash",))
        self.candidate = too_many
        decisions = self._decisions(
            [self._decision(f"solution-{number:03d}") for number in range(1, 10)]
        )
        with self.assertRaisesRegex(ContentBuildError, "at most 8"):
            self._compile(decisions)

    def test_validators_are_total_for_malformed_nested_json_values(self) -> None:
        decisions = self._decisions([self._decision()])
        approved = self._compile(decisions)
        malformed_values = (None, True, 7, "not-an-object", [], {})
        for value in malformed_values:
            with self.subTest(validator="review sourceRef", value=repr(value)):
                malformed_decisions = copy.deepcopy(decisions)
                malformed_decisions["decisions"][0]["sourceRef"] = value
                errors = validate_review_decisions(malformed_decisions, candidate_set=self.candidate)
                self.assertIsInstance(errors, list)
                self.assertTrue(errors)
            with self.subTest(validator="approved sourceRef", value=repr(value)):
                malformed_approved = copy.deepcopy(approved)
                malformed_approved["questions"][0]["sourceRef"] = value
                errors = validate_approved_question_context_test_set(malformed_approved)
                self.assertIsInstance(errors, list)
                self.assertTrue(errors)

        for validator in (
            validate_review_decisions,
            validate_approval_receipt_set,
            validate_approved_question_context_set,
            validate_approved_question_context_test_set,
            validate_approved_archive_context_set,
        ):
            for value in (None, True, False, 0, 1.5, "value", [], [None], {}):
                with self.subTest(validator=validator.__name__, root_value=repr(value)):
                    errors = validator(value)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)

    @staticmethod
    def _outside_fences(markdown: str) -> str:
        outside: list[str] = []
        fence_length: int | None = None
        for line in markdown.splitlines():
            opening = None if fence_length is not None else re.fullmatch(r"(`{3,})text", line)
            if opening:
                fence_length = len(opening.group(1))
                continue
            if fence_length is not None and re.fullmatch(rf"`{{{fence_length},}}", line):
                fence_length = None
                continue
            if fence_length is None:
                outside.append(line)
        return "\n".join(outside)

    def test_markdown_keeps_candidate_active_content_inert(self) -> None:
        candidate = copy.deepcopy(self.candidate)
        attacks = ["<script>alert(1)</script>", "![remote](https://example.invalid/x)", "# FAKE APPROVAL", "`````attack"]
        context = candidate["questions"][0]
        context["question"]["promptMarkdown"] = "\n".join(attacks) + "\n"
        context["question"]["choices"]["A"] = attacks[1]
        context["solutions"][0]["title"] = attacks[2]
        context["solutions"][0]["bodyMarkdown"] = "\n".join(attacks) + "\n"
        context["solutions"][0]["bodySha256"] = sha256_text(context["solutions"][0]["bodyMarkdown"])
        context["contextHash"] = canonical_hash(context, omit=("contextHash",))
        candidate["setHash"] = canonical_hash(candidate, omit=("setHash",))
        self.candidate = candidate
        decisions = self._decisions([self._decision()])
        approved = compile_approved_question_context_set(
            candidate, decisions, self._receipts(decisions), allow_test_only=True
        )
        rendered = approved_question_context_set_markdown(approved)
        outside = self._outside_fences(rendered)
        for attack in attacks:
            self.assertIn(attack, rendered)
            self.assertNotIn(attack, outside)

    def test_schema_documents_are_strict_and_strict_json_rejects_duplicate_keys(self) -> None:
        for name in (
            "question-context-review-decisions.schema.json",
            "question-context-review-decisions-v2.schema.json",
            "solution-approval-receipt-set.schema.json",
            "approved-question-context-set.schema.json",
            "approved-question-context-set-v2.schema.json",
            "approved-question-context-test-set.schema.json",
            "approved-question-context-test-set-v2.schema.json",
            "approved-archive-question-context-set.schema.json",
            "approved-archive-question-context-set-v2.schema.json",
            "original-solution-supplement-set.schema.json",
            "supplemented-archive-question-context-set.schema.json",
        ):
            schema = json.loads((CONTENT_ROOT / "schema" / name).read_text(encoding="utf-8"))
            self.assertFalse(schema["additionalProperties"])
        base_form = load_source_form(FIXTURE / "source-form.json", source_root=CONTENT_ROOT)
        base_candidate = build_question_context_set(base_form)
        empty_fixture = load_strict_json(FIXTURE / "question-context-review-decisions.empty.json")
        empty_receipts = load_strict_json(FIXTURE / "solution-approval-receipts.empty.json")
        self.assertEqual(validate_review_decisions(empty_fixture, candidate_set=base_candidate), [])
        self.assertEqual(validate_approval_receipt_set(empty_receipts, decisions=empty_fixture), [])

        production_schema = json.loads(
            (CONTENT_ROOT / "schema" / "approved-question-context-set.schema.json").read_text(encoding="utf-8")
        )
        test_schema = json.loads(
            (CONTENT_ROOT / "schema" / "approved-question-context-test-set.schema.json").read_text(encoding="utf-8")
        )
        self.assertEqual(
            production_schema["$defs"]["formBinding"]["properties"]["releaseBinding"],
            {"$ref": "#/$defs/releaseBinding"},
        )
        self.assertEqual(test_schema["properties"]["formBinding"]["properties"]["releaseBinding"], {"type": "null"})
        authority_receipt = production_schema["$defs"]["authorityReceipt"]
        self.assertEqual(
            authority_receipt["required"], ["receiptId", "authorityId", "issuedAt", "status"]
        )
        self.assertNotIn("decisionRecordHash", authority_receipt["properties"])
        question_schema = production_schema["$defs"]["question"]["properties"]
        self.assertEqual(question_schema["promptMarkdown"]["maxLength"], 16_384)
        self.assertEqual(question_schema["promptMarkdown"]["x-maxUtf8Bytes"], 16_384)
        self.assertEqual(question_schema["choices"]["properties"]["A"]["maxLength"], 2_048)
        self.assertEqual(question_schema["choices"]["properties"]["A"]["x-maxUtf8Bytes"], 2_048)
        self.assertEqual(question_schema["approvedSolutions"]["maxItems"], 8)
        solution_schema = production_schema["$defs"]["solution"]["properties"]
        self.assertEqual(solution_schema["title"]["maxLength"], 256)
        self.assertEqual(solution_schema["title"]["x-maxUtf8Bytes"], 256)
        self.assertEqual(solution_schema["bodyMarkdown"]["maxLength"], 16_384)
        self.assertEqual(solution_schema["bodyMarkdown"]["x-maxUtf8Bytes"], 16_384)
        with tempfile.TemporaryDirectory() as directory:
            duplicate = Path(directory) / "duplicate.json"
            duplicate.write_text('{"schemaVersion":"one","schemaVersion":"two"}', encoding="utf-8")
            with self.assertRaisesRegex(ContentBuildError, "duplicate JSON object key"):
                load_strict_json(duplicate)
            surrogate = Path(directory) / "surrogate.json"
            surrogate.write_text('{"value":"\\ud800"}', encoding="utf-8")
            with self.assertRaisesRegex(ContentBuildError, "surrogate"):
                load_strict_json(surrogate)
            emoji = Path(directory) / "emoji.json"
            emoji.write_text('{"value":"\\ud83d\\ude00"}', encoding="utf-8")
            self.assertEqual(load_strict_json(emoji), {"value": "😀"})

    def test_secure_json_loader_rejects_links_fifo_oversize_and_unprotected_inputs(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            valid = root / "valid.json"
            valid.write_text('{"kind":"original"}', encoding="utf-8")
            valid.chmod(0o600)
            self.assertEqual(load_strict_json(valid, require_protected=True), {"kind": "original"})

            linked = root / "linked.json"
            linked.symlink_to(valid)
            with self.assertRaisesRegex(ContentBuildError, "securely open"):
                load_strict_json(linked)

            fifo = root / "input.fifo"
            os.mkfifo(fifo, 0o600)
            with self.assertRaisesRegex(ContentBuildError, "regular file"):
                load_strict_json(fifo)

            oversized = root / "oversized.json"
            with oversized.open("wb") as handle:
                handle.truncate(MAX_APPROVAL_INPUT_BYTES + 1)
            with self.assertRaisesRegex(ContentBuildError, "exceeds"):
                load_strict_json(oversized)

            real_fstat = os.fstat

            def stale_small_stat(descriptor: int):
                values = list(real_fstat(descriptor))
                values[6] = 0
                return os.stat_result(values)

            with patch("amc_content.approval.os.fstat", side_effect=stale_small_stat):
                with self.assertRaisesRegex(ContentBuildError, "exceeds"):
                    load_strict_json(oversized)

            valid.chmod(0o644)
            with self.assertRaisesRegex(ContentBuildError, "group/world permissions"):
                load_strict_json(valid, require_protected=True)
            valid.chmod(0o600)
            root.chmod(0o755)
            with self.assertRaisesRegex(ContentBuildError, "group/world permissions"):
                load_strict_json(valid, require_protected=True)
            root.chmod(0o700)
            with patch("amc_content.approval.os.geteuid", return_value=os.geteuid() + 1):
                with self.assertRaisesRegex(ContentBuildError, "owned by effective uid"):
                    load_strict_json(valid, require_protected=True)

        with tempfile.TemporaryDirectory(dir=CONTENT_ROOT) as directory:
            repository_input_root = Path(directory)
            repository_input_root.chmod(0o700)
            repository_input = repository_input_root / "approval.json"
            repository_input.write_text("{}", encoding="utf-8")
            repository_input.chmod(0o600)
            with self.assertRaisesRegex(ContentBuildError, "outside repository"):
                load_strict_json(repository_input, require_protected=True)

    def test_secure_json_loader_reads_opened_descriptor_if_path_is_swapped(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "approval.json"
            replacement = root / "replacement.json"
            target.write_text('{"kind":"opened-inode"}', encoding="utf-8")
            replacement.write_text('{"kind":"replacement-path"}', encoding="utf-8")
            real_fstat = os.fstat
            swapped = False

            def swap_after_open(descriptor: int):
                nonlocal swapped
                if not swapped:
                    swapped = True
                    os.replace(replacement, target)
                return real_fstat(descriptor)

            with patch("amc_content.approval.os.fstat", side_effect=swap_after_open):
                decoded = load_strict_json(target)
            self.assertEqual(decoded, {"kind": "opened-inode"})
            self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"kind": "replacement-path"})

    def test_supplement_composition_cli_requires_protected_independent_inputs(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            root.chmod(0o700)
            private = root / "private"
            private.mkdir(mode=0o700)
            candidate = root / "archive-candidate.json"
            supplement = root / "supplements.json"
            candidate.write_text("{}", encoding="utf-8")
            supplement.write_text("{}", encoding="utf-8")
            candidate.chmod(0o600)
            supplement.chmod(0o644)
            result = main([
                "compose-supplemented-archive-context",
                "--archive-candidate-set", str(candidate),
                "--supplement-set", str(supplement),
                "--private-output-root", str(private),
                "--json-output", str(private / "composed.json"),
                "--markdown-output", str(private / "composed.md"),
            ])
            self.assertEqual(result, 2)
            self.assertFalse((private / "composed.json").exists())
            self.assertFalse((private / "composed.md").exists())

    def test_supplement_validators_are_total_and_reject_malformed_unicode(self) -> None:
        for validator in (
            validate_original_solution_supplement_set,
            validate_supplemented_archive_candidate_set,
        ):
            for payload in (None, True, 1, "value", [], {}, {"value": "bad\ud800text"}):
                with self.subTest(validator=validator.__name__, payload=repr(payload)):
                    errors = validator(payload)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)

    def test_cli_private_atomic_no_clobber_and_concurrent_single_winner(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            private = root / "private"
            private.mkdir(mode=0o700)
            candidate_path = root / "candidate.json"
            decisions_path = root / "decisions.json"
            receipts_path = root / "receipts.json"
            decisions = self._decisions([])
            candidate_path.write_text(canonical_json(self.candidate), encoding="utf-8")
            decisions_path.write_text(canonical_json(decisions), encoding="utf-8")
            receipts_path.write_text(canonical_json(self._receipts(decisions)), encoding="utf-8")
            for path in (candidate_path, decisions_path, receipts_path):
                path.chmod(0o600)
            argv = [
                "compile-approved-question-context", "--candidate-set", str(candidate_path),
                "--review-decisions", str(decisions_path), "--approval-receipts", str(receipts_path),
                "--allow-test-only", "--private-output-root", str(private),
                "--json-output", str(private / "approved.json"), "--markdown-output", str(private / "approved.md"),
            ]
            process_context = multiprocessing.get_context("spawn")
            barrier = process_context.Barrier(2)
            results = process_context.Queue()
            processes = [process_context.Process(target=_run_approval_cli_after_barrier, args=(barrier, results, argv)) for _ in range(2)]
            for process in processes:
                process.start()
            for process in processes:
                process.join(timeout=30)
                self.assertFalse(process.is_alive())
                self.assertEqual(process.exitcode, 0)
            self.assertEqual(sorted(results.get(timeout=5) for _ in processes), [0, 2])
            decoded = json.loads((private / "approved.json").read_text(encoding="utf-8"))
            self.assertEqual(validate_approved_question_context_test_set(decoded), [])
            self.assertIn(decoded["setHash"], (private / "approved.md").read_text(encoding="utf-8"))


class ApprovedArchiveQuestionContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.candidate = build_archive_question_context_set(
            CONTENT_ROOT / "generated" / "historical" / "private-release.json",
            source_root=AMC_ROOT,
        )

    def _compile_archive(self) -> tuple[dict, dict, list[dict]]:
        selected = self.candidate["forms"][:2]
        approved_context = next(
            context
            for form in selected
            for context in form["questions"]
            if any(solution["reviewStatus"] == "candidate" for solution in context["solutions"])
        )
        approved_form = next(form for form in selected if approved_context in form["questions"])
        solution = next(
            solution for solution in approved_context["solutions"] if solution["reviewStatus"] == "candidate"
        )
        decision = {
            "formId": approved_form["form"]["id"],
            "formVersion": approved_form["form"]["version"],
            "questionNumber": approved_context["question"]["number"],
            "solutionId": solution["solutionId"],
            "decision": "approved",
            "bodySha256": solution["bodySha256"],
            "sourceRef": {"path": solution["sourceRef"]["path"], "sha256": solution["sourceRef"]["sha256"]},
            "reviewerId": "reviewer:archive-001",
            "reviewedAt": "2026-08-01T12:34:56Z",
            "rightsStatus": "approved-for-ai-use",
            "qualityFlags": [],
            "methodTags": ["archive-review"],
        }
        decisions = {
            "schemaVersion": "amc-question-context-review-decisions-v1",
            "audience": "private-human-review-input",
            "approvalPolicyVersion": "amc-explicit-human-solution-approval-v1",
            "candidateSetBinding": {
                "schemaVersion": self.candidate["schemaVersion"],
                "setHash": self.candidate["setHash"],
                "forms": [{"id": item["form"]["id"], "version": item["form"]["version"]} for item in selected],
            },
            "decisions": [decision],
        }
        decision["decisionRecordHash"] = decision_record_hash(decision, decisions)
        decisions["decisionSetHash"] = canonical_hash(decisions)
        receipts = {
            "schemaVersion": "amc-solution-approval-receipt-set-v1",
            "audience": "private-approval-authority-allowlist",
            "authorityId": "authority:archive-001",
            "receipts": [{
                "receiptId": "receipt:archive-001",
                "authorityId": "authority:archive-001",
                "decisionRecordHash": decision["decisionRecordHash"],
                "issuedAt": "2026-08-01T13:00:00Z",
                "status": "active",
            }],
        }
        receipts["receiptSetHash"] = canonical_hash(receipts)
        approved = compile_approved_question_context_set(self.candidate, decisions, receipts)
        return approved, decisions, selected

    def test_selects_multiple_forms_and_preserves_exact_archive_bindings(self) -> None:
        approved, decisions, selected = self._compile_archive()
        self.assertEqual(approved["schemaVersion"], "amc-approved-question-context-archive-set-v1")
        self.assertEqual(
            approved["disclaimer"],
            "Private archive AI context containing only explicitly approved solutions and no answer keys.",
        )
        self.assertEqual(
            approved["setHash"],
            "6ed38801f3d2e943d3eea669de468105c937a1f4ad6fb190bf0e062d16c755b8",
        )
        self.assertEqual(
            sha256_text(canonical_json(approved)),
            "de12fdf9bd53bacec7fdfba3e6ea37bbb6c8f4f43304f56d57f54c2cc93d8751",
        )
        self.assertEqual(approved["summary"]["formCount"], 2)
        self.assertEqual(approved["summary"]["approvedSolutionCount"], 1)
        self.assertEqual(validate_approved_archive_context_set(approved), [])
        for output, candidate in zip(approved["forms"], selected, strict=True):
            self.assertEqual(output["formBinding"]["candidateSetHash"], self.candidate["setHash"])
            self.assertEqual(
                output["formBinding"]["releaseBinding"],
                {key: candidate["form"][key] for key in ("questionBundleHash", "contentHash", "manifestHash")},
            )
            self.assertEqual(output["questions"][0]["promptMarkdown"], candidate["questions"][0]["question"]["promptMarkdown"])
            self.assertEqual(output["questions"][0]["choices"], candidate["questions"][0]["question"]["choices"])
        tampered = copy.deepcopy(decisions)
        tampered["candidateSetBinding"]["setHash"] = "0" * 64
        tampered["decisionSetHash"] = canonical_hash(tampered, omit=("decisionSetHash",))
        self.assertTrue(any("setHash binding" in error for error in validate_review_decisions(tampered, candidate_set=self.candidate)))

    def test_archive_validator_is_total_for_malformed_child_review_and_summary(self) -> None:
        approved, _, _ = self._compile_archive()
        malformed_values = (None, True, 7, "not-an-object", [], {})
        for field in ("reviewDecisionBinding", "summary"):
            for value in malformed_values:
                with self.subTest(field=field, value=repr(value)):
                    malformed = copy.deepcopy(approved)
                    malformed["forms"][0][field] = value
                    errors = validate_approved_archive_context_set(malformed)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)

    def test_archive_production_children_require_non_null_release_and_matching_authority(self) -> None:
        approved, _, _ = self._compile_archive()
        child = approved["forms"][0]
        self.assertIsInstance(child["formBinding"]["releaseBinding"], dict)
        self.assertEqual(validate_approved_question_context_set(child), [])

        missing_release = copy.deepcopy(approved)
        missing_release["forms"][0]["formBinding"]["releaseBinding"] = None
        missing_release["forms"][0]["setHash"] = canonical_hash(
            missing_release["forms"][0], omit=("setHash",)
        )
        missing_release["setHash"] = canonical_hash(missing_release, omit=("setHash",))
        errors = validate_approved_archive_context_set(missing_release)
        self.assertTrue(any("releaseBinding" in error for error in errors), errors)

        wrong_authority = copy.deepcopy(approved)
        wrong_authority["forms"][0]["approvalAuthorityBinding"]["authorityId"] = "authority:other-001"
        wrong_authority["forms"][0]["setHash"] = canonical_hash(
            wrong_authority["forms"][0], omit=("setHash",)
        )
        wrong_authority["setHash"] = canonical_hash(wrong_authority, omit=("setHash",))
        errors = validate_approved_archive_context_set(wrong_authority)
        self.assertTrue(any("authority" in error for error in errors), errors)

    def test_protected_original_supplement_remains_candidate_and_uses_v2_review_plus_receipt(self) -> None:
        form = next(item for item in self.candidate["forms"] if item["form"]["id"] == "amc12-2002-b")
        context = form["questions"][6]
        authorization = {
            "authorizationId": "authorization:supplement-rights-001",
            "authorizedBy": "operator:workspace-owner-001",
            "authorizedAt": "2026-08-03T12:00:00Z",
            "statement": "operator-attests-original-supplement-and-authorizes-ai-use",
        }
        record = {
            "supplementId": "supplement-2002b-q7-alt",
            "solutionId": "solution-900",
            "formId": form["form"]["id"],
            "formVersion": form["form"]["version"],
            "questionNumber": 7,
            "questionContentHash": canonical_hash(question_projection(context)),
            "releaseBinding": {
                key: form["form"][key]
                for key in ("questionBundleHash", "contentHash", "manifestHash")
            },
            "title": "Synthetic original alternative",
            "bodyMarkdown": "A separately authored synthetic derivation for governance testing.\n",
            "provenance": {
                "origin": "operator-commissioned-original",
                "authorId": "codex:content-review-001",
                "createdAt": "2026-08-03T12:05:00Z",
                "rightsStatus": "operator-attested-original-and-authorized-for-ai-use",
                "rightsAuthorizationId": authorization["authorizationId"],
            },
        }
        record["bodySha256"] = sha256_text(record["bodyMarkdown"])
        record["supplementRecordHash"] = canonical_hash(record)
        supplement_set = {
            "schemaVersion": "amc-original-solution-supplement-set-v1",
            "audience": "private-candidate-supplement-input",
            "provenancePolicyVersion": "amc-operator-original-solution-provenance-v1",
            "operatorAuthorization": authorization,
            "archiveCandidateBinding": {
                "schemaVersion": self.candidate["schemaVersion"],
                "setHash": self.candidate["setHash"],
                "archiveRelease": self.candidate["archiveRelease"],
            },
            "supplements": [record],
        }
        supplement_set["supplementSetHash"] = canonical_hash(supplement_set)
        self.assertEqual(
            validate_original_solution_supplement_set(supplement_set, archive_candidate=self.candidate), []
        )
        for field in ("formId", "formVersion", "questionNumber"):
            for malformed_value in ([], {}):
                with self.subTest(field=field, malformed_value=type(malformed_value).__name__):
                    malformed_supplement_set = copy.deepcopy(supplement_set)
                    malformed_supplement_set["supplements"][0][field] = malformed_value
                    errors = validate_original_solution_supplement_set(
                        malformed_supplement_set, archive_candidate=self.candidate
                    )
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)
        composed = compose_supplemented_archive_candidate_set(self.candidate, supplement_set)
        self.assertEqual(validate_supplemented_archive_candidate_set(composed), [])
        supplemental = supplemental_candidate_index(composed)[
            (form["form"]["id"], form["form"]["version"], 7, "solution-900")
        ]
        self.assertEqual(supplemental["reviewStatus"], "candidate")
        self.assertNotIn("approved", supplemental)

        review_authorization = {
            "authorizationId": "authorization:review-001",
            "authorizedBy": "operator:workspace-owner-001",
            "authorizedAt": "2026-08-03T12:10:00Z",
            "scope": "solution-correctness-pedagogy-and-rights-review",
            "statement": "operator-delegates-ai-assisted-solution-review",
            "rightsAttestation": "operator-attests-rights-for-reviewed-source-ai-use",
        }
        decision = {
            "formId": form["form"]["id"], "formVersion": form["form"]["version"],
            "questionNumber": 7, "solutionId": supplemental["solutionId"], "decision": "approved",
            "bodySha256": supplemental["bodySha256"],
            "sourceRef": {key: supplemental["sourceRef"][key] for key in ("path", "sha256")},
            "reviewerId": "reviewer:supplement-math-001", "reviewedAt": "2026-08-03T12:15:00Z",
            "rightsStatus": "approved-for-ai-use", "qualityFlags": [], "methodTags": ["synthetic-test"],
            "reviewMethod": "operator-delegated-ai-assisted",
            "reviewModel": {"provider": "openai-codex", "model": "gpt-5.6-codex", "runId": "review-run-supplement-001"},
            "operatorAuthorizationId": review_authorization["authorizationId"],
            "candidateProvenance": supplemental["candidateProvenance"],
            "questionContentHash": record["questionContentHash"],
        }
        decisions = {
            "schemaVersion": "amc-question-context-review-decisions-v2",
            "audience": "private-operator-delegated-ai-assisted-review-input",
            "approvalPolicyVersion": "amc-operator-delegated-ai-assisted-solution-approval-v1",
            "candidateSetBinding": {
                "schemaVersion": composed["schemaVersion"], "setHash": composed["setHash"],
                "forms": [{"id": form["form"]["id"], "version": form["form"]["version"]}],
            },
            "operatorAuthorization": review_authorization,
            "decisions": [decision],
        }
        decision["decisionRecordHash"] = decision_record_hash(decision, decisions)
        decisions["decisionSetHash"] = canonical_hash(decisions)
        receipts = {
            "schemaVersion": "amc-solution-approval-receipt-set-v1",
            "audience": "private-approval-authority-allowlist",
            "authorityId": "authority:supplement-001",
            "receipts": [{
                "receiptId": "receipt:supplement-001", "authorityId": "authority:supplement-001",
                "decisionRecordHash": decision["decisionRecordHash"], "issuedAt": "2026-08-03T12:20:00Z",
                "status": "active",
            }],
        }
        receipts["receiptSetHash"] = canonical_hash(receipts)
        approved = compile_approved_question_context_set(composed, decisions, receipts)
        self.assertEqual(approved["schemaVersion"], "amc-approved-question-context-archive-set-v2")
        self.assertEqual(
            validate_approved_archive_context_set(
                approved, approval_receipts=receipts
            ),
            [],
        )
        output = approved["forms"][0]["questions"][6]["approvedSolutions"][0]
        self.assertEqual(output["candidateProvenance"]["origin"], "operator-original-supplement")
        self.assertEqual(output["approval"]["authorityReceipt"]["status"], "active")
        rendered = approved_question_context_set_markdown(approved)
        self.assertIn("# Approved archive question context set", rendered)
        self.assertIn(approved["setHash"], rendered)

        with tempfile.TemporaryDirectory() as directory:
            protected = Path(directory)
            protected.chmod(0o700)
            private = protected / "compiled"
            private.mkdir(mode=0o700)
            candidate_path = protected / "candidate.json"
            decisions_path = protected / "decisions.json"
            receipts_path = protected / "receipts.json"
            for path, value in (
                (candidate_path, composed), (decisions_path, decisions), (receipts_path, receipts)
            ):
                path.write_text(canonical_json(value), encoding="utf-8")
                path.chmod(0o600)
            result = main([
                "compile-approved-question-context",
                "--candidate-set", str(candidate_path),
                "--review-decisions", str(decisions_path),
                "--approval-receipts", str(receipts_path),
                "--private-output-root", str(private),
                "--json-output", str(private / "approved.json"),
                "--markdown-output", str(private / "approved.md"),
            ])
            self.assertEqual(result, 0)
            decoded = json.loads((private / "approved.json").read_text(encoding="utf-8"))
            self.assertEqual(decoded["schemaVersion"], "amc-approved-question-context-archive-set-v2")
            self.assertIn("# Approved archive question context set", (private / "approved.md").read_text(encoding="utf-8"))

        self_reviewed = copy.deepcopy(decisions)
        self_reviewed["decisions"][0]["reviewerId"] = self_reviewed["decisions"][0][
            "candidateProvenance"
        ]["authorId"]
        self_reviewed["decisions"][0]["decisionRecordHash"] = decision_record_hash(
            self_reviewed["decisions"][0], self_reviewed
        )
        self_reviewed["decisionSetHash"] = canonical_hash(
            self_reviewed, omit=("decisionSetHash",)
        )
        self_reviewed_receipts = copy.deepcopy(receipts)
        self_reviewed_receipts["receipts"][0]["decisionRecordHash"] = self_reviewed["decisions"][0][
            "decisionRecordHash"
        ]
        self_reviewed_receipts["receiptSetHash"] = canonical_hash(
            self_reviewed_receipts, omit=("receiptSetHash",)
        )
        errors = validate_review_decisions(self_reviewed, candidate_set=composed)
        self.assertTrue(any("supplement author" in error for error in errors), errors)
        with self.assertRaisesRegex(ContentBuildError, "supplement author"):
            compile_approved_question_context_set(composed, self_reviewed, self_reviewed_receipts)

        stale = copy.deepcopy(supplement_set)
        stale["supplements"][0]["questionContentHash"] = "0" * 64
        stale["supplements"][0]["supplementRecordHash"] = canonical_hash(
            stale["supplements"][0], omit=("supplementRecordHash",)
        )
        stale["supplementSetHash"] = canonical_hash(stale, omit=("supplementSetHash",))
        errors = validate_original_solution_supplement_set(stale, archive_candidate=self.candidate)
        self.assertTrue(any("exact released question" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
