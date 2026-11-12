from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "media"))
from ingest_aops_snapshot import convert


class AopsSnapshotIngestionTests(unittest.TestCase):
    def test_coefficients_math_styles_and_all_solutions_survive_conversion(self):
        source = r"""==Problem==
Find <imath>3\cdot 5\cdot 7</imath>.
<imath>\mathbf{(A)} 12\qquad\mathbf{(B)} 15</imath>
==Solution 1==
<cmath>21\cdot4=84</cmath>
==Solution 2==
<imath>a+b
=c</imath>
==Video Solution==
https://youtu.be/example
==See also==
navigation footer
"""
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "sources").mkdir()
            markdown, jobs, audit = convert(source, 25, "2026 AMC 12A", root)
        self.assertIn(r"$3\cdot 5\cdot 7$", markdown)
        self.assertIn(r"\mathbf{(A)} 12\qquad\mathbf{(B)} 15", markdown)
        self.assertIn(r"21\cdot4=84", markdown)
        self.assertIn("$$\na+b\n=c\n$$", markdown)
        self.assertIn("## Solution 1", markdown)
        self.assertIn("## Solution 2", markdown)
        self.assertIn("https://youtu.be/example", markdown)
        self.assertNotIn("navigation footer", markdown)
        self.assertEqual(jobs, [])
        self.assertEqual(audit["mathExpressionCount"], 4)

    def test_complete_diagram_source_is_isolated_without_math_rewriting(self):
        source = '==Problem==\n<asy>\npair A=(3,4);\nlabel("$3x$",A);\n</asy>\n==Solution==\nDone.'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "sources").mkdir()
            markdown, jobs, _ = convert(source, 2, "2026 AMC 12A", root)
            rendered_source = (root / "sources" / jobs[0]["input"]).read_text()
        self.assertIn('pair A=(3,4);\nlabel("$3x$",A);', rendered_source)
        self.assertIn("../2026_AMC_12A_Problems/media/problem-02-diagram-01.svg", markdown)
        self.assertNotIn("pair A", markdown)

    def test_source_cannot_request_host_or_container_process_execution(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "sources").mkdir()
            with self.assertRaisesRegex(ValueError, "unsafe Asymptote"):
                convert('==Problem==\n<asy>system("example");</asy>', 1, "2026 AMC 12A", root)


if __name__ == "__main__":
    unittest.main()
