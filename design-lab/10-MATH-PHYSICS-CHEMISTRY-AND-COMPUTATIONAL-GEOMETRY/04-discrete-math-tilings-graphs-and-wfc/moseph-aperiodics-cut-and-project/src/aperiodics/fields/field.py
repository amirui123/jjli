"""Composable scalar and vector fields — `deformations.py` grown up.

The original returned bare closures (`circular`, `sweep`, `circular_ripple`) that
mapped a position to a weight. The shape was right; what was missing was algebra,
so every new variation meant writing another closure.

Two changes:

* **Fields are vectorised.** A field maps a complex *array* to a float array.
  Calling a Python closure once per vertex costs seconds at 100k vertices; one
  numpy expression costs milliseconds.
* **Fields compose.** `radial(...) * ripple(...) + 0.2` is a field, as are
  `.clamp()`, `.remap()` and `.abs()`.

Amounts coming out of a field are interpreted in **median edge lengths** by
`deform`, so the same number means the same thing at any scale or generation.
"""

from __future__ import annotations

import cmath
import math
from typing import Callable

import numpy as np

ArrayLike = np.ndarray | complex


def _as_array(z: ArrayLike) -> np.ndarray:
    return np.asarray(z, dtype=complex)


class Field:
    """A scalar field over the plane: complex array in, float array out."""

    def __init__(self, fn: Callable[[np.ndarray], np.ndarray], name: str = "field"):
        self.fn = fn
        self.name = name

    def __call__(self, z: ArrayLike) -> np.ndarray:
        return np.asarray(self.fn(_as_array(z)), dtype=float)

    def __repr__(self) -> str:
        return f"<Field {self.name}>"

    # -- algebra ---------------------------------------------------------

    def _binary(self, other, op, sym: str) -> Field:
        if isinstance(other, Field):
            return Field(lambda z: op(self(z), other(z)), f"({self.name}{sym}{other.name})")
        return Field(lambda z: op(self(z), other), f"({self.name}{sym}{other})")

    def __add__(self, o): return self._binary(o, lambda a, b: a + b, "+")
    def __radd__(self, o): return self.__add__(o)
    def __sub__(self, o): return self._binary(o, lambda a, b: a - b, "-")
    def __rsub__(self, o): return Field(lambda z: o - self(z), f"({o}-{self.name})")
    def __mul__(self, o): return self._binary(o, lambda a, b: a * b, "*")
    def __rmul__(self, o): return self.__mul__(o)
    def __truediv__(self, o): return self._binary(o, lambda a, b: a / b, "/")
    def __neg__(self): return Field(lambda z: -self(z), f"(-{self.name})")

    def abs(self) -> Field:
        return Field(lambda z: np.abs(self(z)), f"abs({self.name})")

    def clamp(self, lo: float, hi: float) -> Field:
        return Field(lambda z: np.clip(self(z), lo, hi), f"clamp({self.name})")

    def remap(self, lo: float, hi: float, *, from_range: tuple[float, float] | None = None
              ) -> Field:
        """Rescale into [lo, hi]. Without `from_range`, uses the sampled extent."""
        def f(z: np.ndarray) -> np.ndarray:
            v = self(z)
            a, b = from_range if from_range else (float(v.min()), float(v.max()))
            return np.full_like(v, lo) if b - a < 1e-15 else lo + (v - a) * (hi - lo) / (b - a)
        return Field(f, f"remap({self.name})")

    def warp(self, xf: Callable[[np.ndarray], np.ndarray]) -> Field:
        """Sample this field somewhere else."""
        return Field(lambda z: self(xf(_as_array(z))), f"warp({self.name})")

    def power(self, k: float) -> Field:
        """Raise to a power, keeping sign. `k>1` accelerates, `k<1` eases off."""
        return Field(lambda z: np.sign(self(z)) * np.abs(self(z)) ** k,
                     f"pow({self.name},{k:g})")

    def smoothstep(self) -> Field:
        """Ease a 0..1 field with 3t^2-2t^3, so it starts and ends flat."""
        def f(z: np.ndarray) -> np.ndarray:
            v = np.clip(self(z), 0.0, 1.0)
            return v * v * (3 - 2 * v)
        return Field(f, f"smoothstep({self.name})")

    def quantise(self, steps: int) -> Field:
        """Snap to `steps` discrete levels — terraces rather than a ramp."""
        return Field(lambda z: np.round(self(z) * steps) / steps,
                     f"quantise({self.name},{steps})")

    def polar(self, angle: Field | float) -> VField:
        """Read this field as a magnitude and `angle` (degrees) as a direction.

        The two-valued case: displacement given as magnitude and bearing rather
        than as a direction field scaled by an amount.
        """
        def f(z: np.ndarray) -> np.ndarray:
            a = angle(z) if isinstance(angle, Field) else np.full(z.shape, float(angle))
            return self(z) * np.exp(1j * np.radians(a))
        name = angle.name if isinstance(angle, Field) else f"{angle:g}deg"
        return VField(f, f"polar({self.name},{name})")

    def sample_grid(self, bounds, nx: int = 64, ny: int = 64):
        """Sample onto a regular grid. Returns (xs, ys, values) for contouring."""
        xs = np.linspace(bounds.xmin, bounds.xmax, nx)
        ys = np.linspace(bounds.ymin, bounds.ymax, ny)
        gx, gy = np.meshgrid(xs, ys)
        return xs, ys, self(gx + 1j * gy)


class VField:
    """A vector field: complex array in, complex array out (a direction each)."""

    def __init__(self, fn: Callable[[np.ndarray], np.ndarray], name: str = "vfield"):
        self.fn = fn
        self.name = name

    def __call__(self, z: ArrayLike) -> np.ndarray:
        return np.asarray(self.fn(_as_array(z)), dtype=complex)

    def __repr__(self) -> str:
        return f"<VField {self.name}>"

    def normalised(self) -> VField:
        def f(z: np.ndarray) -> np.ndarray:
            v = self(z)
            m = np.abs(v)
            return np.divide(v, m, out=np.zeros_like(v), where=m > 1e-15)
        return VField(f, f"unit({self.name})")

    def rotated(self, angle: float) -> VField:
        r = complex(math.cos(angle), math.sin(angle))
        return VField(lambda z: self(z) * r, f"rot({self.name})")

    def __mul__(self, o):
        if isinstance(o, Field):
            return VField(lambda z: self(z) * o(z), f"({self.name}*{o.name})")
        return VField(lambda z: self(z) * o, f"({self.name}*{o})")

    __rmul__ = __mul__


# -- scalar sources ---------------------------------------------------------

def const(value: float) -> Field:
    return Field(lambda z: np.full(z.shape, float(value)), f"const({value:g})")


def radial(centre: complex = 0j, scale: float = 1.0) -> Field:
    """Distance from `centre`, divided by `scale`."""
    return Field(lambda z: np.abs(z - centre) / scale, "radial")


def sweep(start: float, end: float, v0: float = 0.0, v1: float = 1.0,
          axis: str = "x") -> Field:
    """Linear ramp along an axis. The original `sweep`, minus the debug print
    in the hot loop and the `is 'x'` string identity comparison."""
    if axis not in ("x", "y"):
        raise ValueError("axis must be 'x' or 'y'")
    span = end - start
    if abs(span) < 1e-15:
        return const(v0)

    def f(z: np.ndarray) -> np.ndarray:
        base = z.real if axis == "x" else z.imag
        return v0 + (v1 - v0) * (base - start) / span
    return Field(f, f"sweep({axis})")


def ripple(freq: float, phase: float = 0.0, axis: str = "x",
           amplitude: float = 1.0) -> Field:
    if axis not in ("x", "y"):
        raise ValueError("axis must be 'x' or 'y'")

    def f(z: np.ndarray) -> np.ndarray:
        base = z.real if axis == "x" else z.imag
        return amplitude * np.sin(freq * base + phase)
    return Field(f, f"ripple({axis})")


def radial_ripple(freq: float, phase: float = 0.0, centre: complex = 0j,
                  amplitude: float = 1.0) -> Field:
    """Concentric waves. The original `circular_ripple`."""
    return Field(lambda z: amplitude * np.sin(np.abs(z - centre) * freq + phase),
                 "radial_ripple")


def angular(k: float = 1.0, phase: float = 0.0, centre: complex = 0j,
            amplitude: float = 1.0) -> Field:
    """k-fold rotational variation about `centre`. Petals, sectors, spokes."""
    return Field(lambda z: amplitude * np.sin(k * np.angle(z - centre) + phase),
                 f"angular({k:g})")


def wave(freq: float, angle: float = 0.0, phase: float = 0.0,
         amplitude: float = 1.0, centre: complex = 0j) -> Field:
    """A plane wave travelling in any direction, not just along an axis.

    `angle` is the direction of travel in degrees, `freq` is cycles per unit
    length. Sums of several of these at evenly spaced angles are the other route
    to quasiperiodicity, from the Fourier side rather than the grid side.
    """
    k = 2 * math.pi * freq * cmath.exp(1j * math.radians(angle))

    def f(z: np.ndarray) -> np.ndarray:
        d = z - centre
        return amplitude * np.sin(d.real * k.real + d.imag * k.imag + phase)
    return Field(f, f"wave({freq:g}@{angle:g})")


def waves(n: int, freq: float, phase: float = 0.0, amplitude: float = 1.0,
          centre: complex = 0j, spread: float = 180.0) -> Field:
    """`n` plane waves at evenly spaced angles, summed and normalised.

    n=5 gives a five-fold quasiperiodic interference pattern — the same object
    the multigrid builds, approached from the other side.
    """
    parts = [wave(freq, spread * i / n, phase, 1.0, centre) for i in range(n)]
    total = parts[0]
    for p in parts[1:]:
        total = total + p
    return Field(lambda z: total(z) * (amplitude / n), f"waves({n},{freq:g})")


def spiral(freq: float, twist: float = 1.0, centre: complex = 0j,
           amplitude: float = 1.0) -> Field:
    """Radial wave sheared by angle — an Archimedean spiral of values."""
    def f(z: np.ndarray) -> np.ndarray:
        d = z - centre
        return amplitude * np.sin(freq * np.abs(d) + twist * np.angle(d))
    return Field(f, f"spiral({freq:g},{twist:g})")


def distance_to(points, scale: float = 1.0) -> Field:
    """Distance to the nearest of a set of points."""
    pts = np.asarray(list(points), dtype=complex)

    def f(z: np.ndarray) -> np.ndarray:
        flat = z.ravel()[:, None]
        d = np.abs(flat - pts[None, :]).min(axis=1)
        return (d / scale).reshape(z.shape)
    return Field(f, "distance_to")


def value_noise(scale: float = 50.0, seed: int = 0, octaves: int = 1) -> Field:
    """Smooth pseudo-random field. Bilinear value noise, no extra dependency."""
    rng = np.random.default_rng(seed)
    size = 256
    grids = [rng.random((size, size)) for _ in range(max(1, octaves))]

    # Octave amplitudes halve; dividing by their total keeps the result inside
    # the same range whatever the octave count, which is what lets `--strength`
    # remain the only magnitude control.
    total_amp = sum(0.5 ** i for i in range(len(grids)))

    def f(z: np.ndarray) -> np.ndarray:
        out = np.zeros(z.shape, dtype=float)
        amp, sc = 1.0, scale
        for g in grids:
            u, v = z.real / sc, z.imag / sc
            i0, j0 = np.floor(u).astype(int), np.floor(v).astype(int)
            fu, fv = u - i0, v - j0
            su, sv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
            a = g[i0 % size, j0 % size]
            b = g[(i0 + 1) % size, j0 % size]
            c = g[i0 % size, (j0 + 1) % size]
            d = g[(i0 + 1) % size, (j0 + 1) % size]
            out += amp * ((a * (1 - su) + b * su) * (1 - sv)
                          + (c * (1 - su) + d * su) * sv)
            amp, sc = amp / 2, sc / 2
        return (out / total_amp) * 2 - 1
    return Field(f, f"noise({scale:g})")


def linear_radial(max_r: float, start: float, end: float,
                  centre: complex = 0j) -> Field:
    """Ramp from `start` at the centre to `end` at `max_r`. The original
    `circular` — which, despite the name, was a radial ramp rather than a wave."""
    return Field(lambda z: start + np.abs(z - centre) / max_r * (end - start),
                 "linear_radial")


# -- vector sources ---------------------------------------------------------

def direction(d: complex) -> VField:
    return VField(lambda z: np.full(z.shape, complex(d)), f"dir({d})")


def outward(centre: complex = 0j) -> VField:
    """Unit vectors pointing away from `centre`."""
    return VField(lambda z: z - centre, "outward").normalised()


def tangential(centre: complex = 0j) -> VField:
    """Unit vectors perpendicular to the radius — swirl."""
    return VField(lambda z: (z - centre) * 1j, "tangential").normalised()


def gradient(field: Field, h: float = 1e-4) -> VField:
    """Numerical gradient of a scalar field, as a direction."""
    def f(z: np.ndarray) -> np.ndarray:
        dx = (field(z + h) - field(z - h)) / (2 * h)
        dy = (field(z + 1j * h) - field(z - 1j * h)) / (2 * h)
        return dx + 1j * dy
    return VField(f, f"grad({field.name})")
