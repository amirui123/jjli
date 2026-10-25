#!/usr/bin/env python3
"""Estimate a conservative visual gate floor from repeated target captures.

Recommendations are descriptive only and never modify verification config.
They cannot eliminate variance from all video, particles, physics, or GPU paths.
"""

from __future__ import annotations

import argparse
import itertools
import json
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure pairwise target screenshot variance.")
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--pixel-threshold", type=int, default=16)
    return parser.parse_args()


def load_pillow():
    try:
        from PIL import Image, ImageChops
    except ImportError as error:
        raise ValueError("Pillow is required") from error
    return Image, ImageChops


def pair_metrics(first, second, image_chops, pixel_threshold: int) -> dict[str, float]:
    difference = image_chops.difference(first, second)
    red, green, blue = difference.split()
    maximum = image_chops.lighter(image_chops.lighter(red, green), blue)
    included_pixels = first.width * first.height
    histogram = difference.histogram()
    absolute_total = sum((index % 256) * count for index, count in enumerate(histogram))
    max_histogram = maximum.histogram()
    mismatched_pixels = sum(max_histogram[pixel_threshold + 1 :])
    return {
        "mae": absolute_total / (included_pixels * 3),
        "mismatch_ratio": mismatched_pixels / included_pixels,
    }


def calculate(paths: list[Path], pixel_threshold: int) -> dict:
    if len(paths) < 2:
        raise ValueError("At least two screenshots are required")
    if not 0 <= pixel_threshold <= 255:
        raise ValueError("--pixel-threshold must be between 0 and 255")
    image, image_chops = load_pillow()
    images = []
    for path in paths:
        if not path.is_file():
            raise ValueError(f"Image does not exist: {path}")
        images.append(image.open(path).convert("RGB"))
    sizes = {item.size for item in images}
    if len(sizes) != 1:
        raise ValueError(f"Screenshot sizes differ: {sorted(sizes)}")
    pairs = [pair_metrics(first, second, image_chops, pixel_threshold) for first, second in itertools.combinations(images, 2)]
    maes = [pair["mae"] for pair in pairs]
    ratios = [pair["mismatch_ratio"] for pair in pairs]
    max_mae = max(maes)
    max_ratio = max(ratios)
    return {
        "version": 1,
        "recommendation_only": True,
        "limitations": "A variance floor cannot fully normalize dynamic video, particles, physics, or GPU differences.",
        "pixel_threshold": pixel_threshold,
        "sample_count": len(images),
        "pair_count": len(pairs),
        "mean_pairwise_mae": round(sum(maes) / len(maes), 6),
        "max_pairwise_mae": round(max_mae, 6),
        "mean_pairwise_mismatch_ratio": round(sum(ratios) / len(ratios), 8),
        "max_pairwise_mismatch_ratio": round(max_ratio, 8),
        "recommended_min_mae_gate": round(max_mae * 1.1, 6),
        "recommended_min_mismatch_gate": round(min(1.0, max_ratio * 1.1), 8),
    }


def main() -> int:
    args = parse_args()
    print(json.dumps(calculate(args.images, args.pixel_threshold), indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(2)
