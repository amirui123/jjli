import importlib.util
import tempfile
import unittest
from pathlib import Path

from PIL import Image


SCRIPT = Path(__file__).resolve().parents[2] / "clone-any-website" / "scripts" / "calibrate-variance.py"
SPEC = importlib.util.spec_from_file_location("calibrate_variance", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class VarianceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.directory = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def save(self, name, size=(2, 2), color=(0, 0, 0)):
        path = self.directory / name
        Image.new("RGB", size, color).save(path)
        return path

    def test_calibration_reports_all_pairs_and_recommendations(self):
        result = MODULE.calculate([self.save("a.png"), self.save("b.png", color=(10, 0, 0)), self.save("c.png", color=(20, 0, 0))], 5)
        self.assertEqual(result["sample_count"], 3)
        self.assertEqual(result["pair_count"], 3)
        self.assertTrue(result["recommendation_only"])
        self.assertGreaterEqual(result["recommended_min_mae_gate"], result["max_pairwise_mae"])

    def test_fewer_than_two_and_size_mismatch_are_errors(self):
        first = self.save("a.png")
        with self.assertRaisesRegex(ValueError, "At least two"):
            MODULE.calculate([first], 16)
        with self.assertRaisesRegex(ValueError, "sizes differ"):
            MODULE.calculate([first, self.save("b.png", size=(3, 3))], 16)


if __name__ == "__main__":
    unittest.main()
