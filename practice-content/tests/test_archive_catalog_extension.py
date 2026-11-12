from __future__ import annotations

import copy
from pathlib import Path
import tempfile
import unittest

from amc_content.archive import (
    _archive_release_authorization,
    _form_directories,
    _validate_key_catalog,
)
from amc_content.builder import ContentBuildError
from amc_content.validator import ARCHIVE_FORM_IDS, LEGACY_ARCHIVE_FORM_IDS


class ArchiveCatalogExtensionTests(unittest.TestCase):
    def _catalog(self, form_ids=LEGACY_ARCHIVE_FORM_IDS):
        return {
            "schemaVersion": "amc-practice-historical-answer-keys-v1",
            "forms": [
                {
                    "formId": form_id,
                    "answers": ["A"] * 25,
                    "sourceUrl": "https://example.test/source",
                    "canonicalAnswerKeyUrl": "https://example.test/key",
                }
                for form_id in sorted(form_ids)
            ],
        }

    def _make_directories(self, root, form_ids):
        for form_id in form_ids:
            _, year, variant = form_id.split("-")
            (root / f"{year}_AMC_12{variant.upper()}_Problems").mkdir()

    def test_complete_legacy_and_2026a_extension_are_accepted(self):
        for form_ids in (LEGACY_ARCHIVE_FORM_IDS, ARCHIVE_FORM_IDS):
            with self.subTest(count=len(form_ids)), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self._make_directories(root, form_ids)
                self.assertEqual(len(_form_directories(root)), len(form_ids))
                self.assertEqual(set(_validate_key_catalog(self._catalog(form_ids))), set(form_ids))

    def test_2026b_unknown_and_missing_legacy_paper_are_rejected(self):
        for form_ids in (
            LEGACY_ARCHIVE_FORM_IDS | {"amc12-2026-b"},
            LEGACY_ARCHIVE_FORM_IDS | {"amc12-2027-a"},
            ARCHIVE_FORM_IDS - {"amc12-2002-a"},
        ):
            with self.subTest(ids=form_ids), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self._make_directories(root, form_ids)
                with self.assertRaises(ContentBuildError):
                    _form_directories(root)
                with self.assertRaises(ContentBuildError):
                    _validate_key_catalog(self._catalog(form_ids))

    def test_duplicate_answer_catalog_record_is_rejected(self):
        catalog = self._catalog()
        catalog["forms"][1] = copy.deepcopy(catalog["forms"][0])
        with self.assertRaisesRegex(ContentBuildError, "duplicates"):
            _validate_key_catalog(catalog)

    def test_readme_only_future_paper_is_not_a_published_archive_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._make_directories(root, ARCHIVE_FORM_IDS)
            placeholder = root / "2026_AMC_12B_Problems"
            placeholder.mkdir()
            (placeholder / "README").write_text("\n", encoding="utf-8")
            self.assertEqual(len(_form_directories(root)), 49)
            (placeholder / "Problem_01.md").write_text("incomplete source", encoding="utf-8")
            with self.assertRaises(ContentBuildError):
                _form_directories(root)

    def test_new_authorization_uses_the_current_user_request(self):
        addition = _archive_release_authorization(2026, "A")
        self.assertEqual(addition["authorizedAt"], "2026-11-12")
        self.assertIn("2026 AMC 12A", addition["evidence"])
        self.assertEqual(_archive_release_authorization(2025, "A")["authorizedAt"], "2026-07-27")


if __name__ == "__main__":
    unittest.main()
