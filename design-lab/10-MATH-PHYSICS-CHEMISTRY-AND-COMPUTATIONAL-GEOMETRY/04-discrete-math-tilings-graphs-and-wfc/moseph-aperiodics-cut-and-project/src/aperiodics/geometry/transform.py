"""Affine transforms acting on complex-valued points.

A general 2-D affine is stored as the usual six coefficients::

    x' = a x + c y + e
    y' = b x + d y + f

`Affine` also tracks whether it is a *similarity* (uniform scale, rotation,
translation, no reflection or shear). Similarities are the common case here —
every substitution and multigrid construction is built from them — and they map
circles to circles and arcs to arcs, so exact primitives survive them. Anything
else has to fall back to flattening; `Circle.transform` raises rather than
silently returning a wrong circle.
"""

from __future__ import annotations

import cmath
import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Affine:
    a: float = 1.0
    b: float = 0.0
    c: float = 0.0
    d: float = 1.0
    e: float = 0.0
    f: float = 0.0

    def __call__(self, z: complex) -> complex:
        x, y = z.real, z.imag
        return complex(self.a * x + self.c * y + self.e, self.b * x + self.d * y + self.f)

    def __matmul__(self, other: Affine) -> Affine:
        """`(self @ other)(z) == self(other(z))`."""
        return Affine(
            a=self.a * other.a + self.c * other.b,
            b=self.b * other.a + self.d * other.b,
            c=self.a * other.c + self.c * other.d,
            d=self.b * other.c + self.d * other.d,
            e=self.a * other.e + self.c * other.f + self.e,
            f=self.b * other.e + self.d * other.f + self.f,
        )

    # -- constructors ----------------------------------------------------

    @classmethod
    def identity(cls) -> Affine:
        return cls()

    @classmethod
    def translate(cls, offset: complex) -> Affine:
        return cls(e=offset.real, f=offset.imag)

    @classmethod
    def scale(cls, sx: float, sy: float | None = None) -> Affine:
        return cls(a=sx, d=sx if sy is None else sy)

    @classmethod
    def rotate(cls, angle: float, about: complex = 0j) -> Affine:
        r = cmath.exp(1j * angle)
        rot = cls(a=r.real, b=r.imag, c=-r.imag, d=r.real)
        if about == 0:
            return rot
        return cls.translate(about) @ rot @ cls.translate(-about)

    @classmethod
    def reflect(cls, angle: float = 0.0) -> Affine:
        """Reflection in the line through the origin at `angle`."""
        c2, s2 = math.cos(2 * angle), math.sin(2 * angle)
        return cls(a=c2, b=s2, c=s2, d=-c2)

    @classmethod
    def similarity(cls, scale: complex = 1 + 0j, offset: complex = 0j) -> Affine:
        """`z -> scale * z + offset` — the workhorse for tilings."""
        return cls(a=scale.real, b=scale.imag, c=-scale.imag, d=scale.real,
                   e=offset.real, f=offset.imag)

    # -- properties ------------------------------------------------------

    @property
    def determinant(self) -> float:
        return self.a * self.d - self.b * self.c

    @property
    def is_similarity(self) -> bool:
        """True when this is scale+rotation+translation, without reflection."""
        return math.isclose(self.a, self.d, abs_tol=1e-12) and math.isclose(
            self.b, -self.c, abs_tol=1e-12
        )

    @property
    def is_conformal(self) -> bool:
        """True when circles map to circles — similarity or reflection."""
        if self.is_similarity:
            return True
        return math.isclose(self.a, -self.d, abs_tol=1e-12) and math.isclose(
            self.b, self.c, abs_tol=1e-12
        )

    @property
    def scale_factor(self) -> float:
        """Uniform length scaling. Only meaningful when `is_conformal`."""
        return math.sqrt(abs(self.determinant))

    def inverse(self) -> Affine:
        det = self.determinant
        if abs(det) < 1e-15:
            raise ValueError("affine is singular; cannot invert")
        return Affine(
            a=self.d / det, b=-self.b / det, c=-self.c / det, d=self.a / det,
            e=(self.c * self.f - self.d * self.e) / det,
            f=(self.b * self.e - self.a * self.f) / det,
        )
