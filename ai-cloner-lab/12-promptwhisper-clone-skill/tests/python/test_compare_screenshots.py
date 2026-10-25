import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "clone-any-website" / "scripts" / "compare-screenshots.py"


class ComparatorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.directory = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def image(self, name, size=(3, 3), color=(0, 0, 0), pixel=None):
        path = self.directory / name
        image = Image.new("RGB", size, color)
        if pixel:
            image.putpixel(pixel[0], pixel[1])
        image.save(path)
        return path

    def run_compare(self, first, second, *args):
        result = subprocess.run([sys.executable, str(SCRIPT), str(first), str(second), *map(str, args)], text=True, capture_output=True, check=False)
        payload = json.loads(result.stdout) if result.stdout else None
        return result, payload

    def test_identical_images_pass(self):
        first = self.image("a.png")
        result, payload = self.run_compare(first, first, "--max-mae", 0)
        self.assertEqual(result.returncode, 0)
        self.assertTrue(payload["passed"])

    def test_single_pixel_and_threshold(self):
        first = self.image("a.png")
        second = self.image("b.png", pixel=((1, 1), (10, 0, 0)))
        _, below = self.run_compare(first, second, "--pixel-threshold", 16)
        _, above = self.run_compare(first, second, "--pixel-threshold", 5)
        self.assertEqual(below["mismatched_pixels"], 0)
        self.assertEqual(above["mismatched_pixels"], 1)

    def test_mask_excludes_changed_region_and_empty_mask_errors(self):
        first = self.image("a.png")
        second = self.image("b.png", pixel=((1, 1), (255, 255, 255)))
        mask = Image.new("L", (3, 3), 255)
        mask.putpixel((1, 1), 0)
        mask_path = self.directory / "mask.png"
        mask.save(mask_path)
        result, payload = self.run_compare(first, second, "--mask", mask_path)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(payload["mismatch_ratio"], 0)
        empty = self.directory / "empty.png"
        Image.new("L", (3, 3), 0).save(empty)
        result, _ = self.run_compare(first, second, "--mask", empty)
        self.assertEqual(result.returncode, 2)

    def test_crop_and_explicit_resize(self):
        first = self.image("a.png", (4, 4))
        second = self.image("b.png", (2, 2))
        result, payload = self.run_compare(first, second, "--reference-crop", 0, 0, 2, 2)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(payload["size"], {"width": 2, "height": 2})
        result, payload = self.run_compare(first, second, "--resize-reference-to-candidate")
        self.assertEqual(result.returncode, 0)
        self.assertTrue(payload["preprocessing"]["reference_resized_to_candidate"])

    def test_size_mismatch_is_invalid(self):
        result, _ = self.run_compare(self.image("a.png", (3, 3)), self.image("b.png", (2, 2)))
        self.assertEqual(result.returncode, 2)

    def test_unconfigured_gate_is_null(self):
        first = self.image("a.png")
        result, payload = self.run_compare(first, first)
        self.assertEqual(result.returncode, 0)
        self.assertIsNone(payload["passed"])

    def test_gate_failure_exits_one_and_invalid_argument_exits_two(self):
        first = self.image("a.png")
        second = self.image("b.png", color=(255, 255, 255))
        result, payload = self.run_compare(first, second, "--max-mae", 0)
        self.assertEqual(result.returncode, 1)
        self.assertFalse(payload["passed"])
        result, _ = self.run_compare(first, second, "--pixel-threshold", 999)
        self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main()
