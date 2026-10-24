"""Axis-aligned bounds over complex-valued points."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class Bounds:
    xmin: float
    ymin: float
    xmax: float
    ymax: float

    @property
    def width(self) -> float:
        return self.xmax - self.xmin

    @property
    def height(self) -> float:
        return self.ymax - self.ymin

    @property
    def centre(self) -> complex:
        return complex((self.xmin + self.xmax) / 2, (self.ymin + self.ymax) / 2)

    @property
    def is_empty(self) -> bool:
        return not (self.xmax >= self.xmin and self.ymax >= self.ymin)

    @classmethod
    def empty(cls) -> Bounds:
        return cls(math.inf, math.inf, -math.inf, -math.inf)

    @classmethod
    def of(cls, points: Iterable[complex] | np.ndarray) -> Bounds:
        arr = np.asarray(list(points) if not isinstance(points, np.ndarray) else points)
        if arr.size == 0:
            return cls.empty()
        xs, ys = arr.real, arr.imag
        return cls(float(xs.min()), float(ys.min()), float(xs.max()), float(ys.max()))

    def union(self, other: Bounds) -> Bounds:
        if self.is_empty:
            return other
        if other.is_empty:
            return self
        return Bounds(
            min(self.xmin, other.xmin), min(self.ymin, other.ymin),
            max(self.xmax, other.xmax), max(self.ymax, other.ymax),
        )

    def expand(self, margin: float) -> Bounds:
        if self.is_empty:
            return self
        return Bounds(self.xmin - margin, self.ymin - margin,
                      self.xmax + margin, self.ymax + margin)

    def contains(self, p: complex) -> bool:
        return self.xmin <= p.real <= self.xmax and self.ymin <= p.imag <= self.ymax

    def overlaps(self, other: Bounds) -> bool:
        """Do the two boxes share any area? Touching counts.

        Used to decide what a crop can drop. Touching has to count, or an item
        lying exactly along the crop edge — which a tiling gives you plenty
        of — would vanish.
        """
        if self.is_empty or other.is_empty:
            return False
        return (self.xmin <= other.xmax and other.xmin <= self.xmax
                and self.ymin <= other.ymax and other.ymin <= self.ymax)


def union_all(bs: Iterable[Bounds]) -> Bounds:
    out = Bounds.empty()
    for b in bs:
        out = out.union(b)
    return out
