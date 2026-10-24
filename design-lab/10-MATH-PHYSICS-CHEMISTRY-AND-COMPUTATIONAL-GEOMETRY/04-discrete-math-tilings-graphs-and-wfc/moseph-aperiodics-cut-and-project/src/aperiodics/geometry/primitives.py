"""Exact 2-D primitives.

Points are Python `complex`. Rotation is multiplication, translation is addition,
and every construction here leans on that. Promote to numpy only in bulk paths.

The rule that shapes the whole package: **primitives stay exact until something
demands otherwise**. A circle is a circle all the way to the SVG writer, which
emits `<circle>`. `flatten(tol)` is the explicit, opt-in bridge to the polyline
world (vpype, vsketch, G-code) — never taken implicitly.
"""

from __future__ import annotations

import cmath
import math
from dataclasses import dataclass, replace
from typing import Protocol, runtime_checkable

import numpy as np

from .bounds import Bounds, union_all
from .transform import Affine

TAU = 2 * math.pi

#: Default flattening tolerance, in user units (mm). Half a plotter pen width.
DEFAULT_TOL = 0.05


@runtime_checkable
class Geometry(Protocol):
    """Anything drawable. Implementations are immutable."""

    closed: bool

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        """Point sequence approximating this shape, as a complex array.

        For closed shapes the first point is *not* repeated at the end.
        """

    def bounds(self) -> Bounds: ...

    def transform(self, xf: Affine) -> Geometry: ...


def _arc_segments(radius: float, sweep: float, tol: float) -> int:
    """Segment count so the sagitta of each chord stays within `tol`."""
    sweep = abs(sweep)
    if radius <= 0 or sweep <= 0:
        return 1
    ratio = tol / radius
    if ratio >= 1.0:  # tolerance exceeds the radius; a couple of chords will do
        return max(1, math.ceil(sweep / (TAU / 4)))
    step = 2 * math.acos(1 - ratio)
    return max(1, math.ceil(sweep / step))


@dataclass(frozen=True)
class Polyline:
    """An open or closed sequence of straight segments. The workhorse."""

    points: tuple[complex, ...]
    closed: bool = False

    def __post_init__(self) -> None:
        object.__setattr__(self, "points", tuple(complex(p) for p in self.points))

    @classmethod
    def of(cls, points, closed: bool = False) -> Polyline:
        return cls(tuple(points), closed)

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        return np.array(self.points, dtype=complex)

    def bounds(self) -> Bounds:
        return Bounds.of(self.points)

    def transform(self, xf: Affine) -> Polyline:
        return replace(self, points=tuple(xf(p) for p in self.points))

    def length(self) -> float:
        pts = self.flatten()
        if len(pts) < 2:
            return 0.0
        d = float(np.abs(np.diff(pts)).sum())
        if self.closed:
            d += abs(pts[0] - pts[-1])
        return d

    def reversed(self) -> Polyline:
        return replace(self, points=tuple(reversed(self.points)))


@dataclass(frozen=True)
class Line:
    a: complex
    b: complex
    closed: bool = False

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        return np.array([self.a, self.b], dtype=complex)

    def bounds(self) -> Bounds:
        return Bounds.of([self.a, self.b])

    def transform(self, xf: Affine) -> Line:
        return Line(xf(self.a), xf(self.b))

    def length(self) -> float:
        return abs(self.b - self.a)

    def reversed(self) -> Line:
        return Line(self.b, self.a)

    @property
    def start(self) -> complex:
        return self.a

    @property
    def end(self) -> complex:
        return self.b


@dataclass(frozen=True)
class Circle:
    centre: complex
    r: float
    closed: bool = True

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        n = max(3, _arc_segments(self.r, TAU, tol))
        th = np.linspace(0, TAU, n, endpoint=False)
        return self.centre + self.r * np.exp(1j * th)

    def bounds(self) -> Bounds:
        return Bounds(self.centre.real - self.r, self.centre.imag - self.r,
                      self.centre.real + self.r, self.centre.imag + self.r)

    def transform(self, xf: Affine) -> Circle:
        if not xf.is_conformal:
            raise ValueError(
                "non-conformal transform would turn this Circle into an ellipse; "
                "flatten() it first, or keep the transform a similarity"
            )
        return Circle(xf(self.centre), self.r * xf.scale_factor)

    def point_at(self, angle: float) -> complex:
        return self.centre + self.r * cmath.exp(1j * angle)


@dataclass(frozen=True)
class Arc:
    """Circular arc from `a0` to `a1` (radians), swept in the given direction."""

    centre: complex
    r: float
    a0: float
    a1: float
    ccw: bool = True
    closed: bool = False

    @property
    def sweep(self) -> float:
        """Signed angular extent, in (-2pi, 2pi)."""
        d = (self.a1 - self.a0) % TAU
        if not self.ccw:
            d = d - TAU if d != 0 else 0.0
        return d

    @property
    def start(self) -> complex:
        return self.point_at(0.0)

    @property
    def end(self) -> complex:
        return self.point_at(1.0)

    def point_at(self, t: float) -> complex:
        return self.centre + self.r * cmath.exp(1j * (self.a0 + t * self.sweep))

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        n = _arc_segments(self.r, self.sweep, tol)
        t = np.linspace(0.0, 1.0, n + 1)
        return self.centre + self.r * np.exp(1j * (self.a0 + t * self.sweep))

    def bounds(self) -> Bounds:
        # Endpoints, plus any axis extreme the sweep actually passes through.
        pts = [self.start, self.end]
        lo = self.a0 if self.sweep >= 0 else self.a0 + self.sweep
        span = abs(self.sweep)
        for k in range(4):
            ang = k * math.pi / 2
            if ((ang - lo) % TAU) <= span:
                pts.append(self.centre + self.r * cmath.exp(1j * ang))
        return Bounds.of(pts)

    def transform(self, xf: Affine) -> Arc:
        if not xf.is_conformal:
            raise ValueError(
                "non-conformal transform would turn this Arc into an elliptical arc; "
                "flatten() it first, or keep the transform a similarity"
            )
        # Track the endpoints through the transform and re-derive the angles, so
        # rotation and reflection are both handled without special-casing.
        c = xf(self.centre)
        s, e = xf(self.start) - c, xf(self.end) - c
        ccw = self.ccw if xf.determinant > 0 else not self.ccw
        return Arc(c, self.r * xf.scale_factor,
                   math.atan2(s.imag, s.real), math.atan2(e.imag, e.real), ccw)

    def reversed(self) -> Arc:
        return Arc(self.centre, self.r, self.a1, self.a0, not self.ccw)

    @classmethod
    def through(cls, start: complex, end: complex, centre: complex,
                ccw: bool = True) -> Arc:
        s, e = start - centre, end - centre
        return cls(centre, abs(s), math.atan2(s.imag, s.real),
                   math.atan2(e.imag, e.real), ccw)


def arc_to_cubics(a: "Arc") -> list["Cubic"]:
    """An arc as cubic Béziers, exact to well under a micron.

    Not a nicety. The plotter's SVG reader has a known bug with **arcs inside a
    transformed group**, and every file here is exactly that when a motif is on:
    the content sits under `scale(1,-1)` and a rhombus's arcs are exact `A`
    commands. Curves avoid it entirely, so the copy that goes over the wire is
    converted while the file on disk keeps its arcs.

    One cubic per 45 degrees or less, with the standard control distance
    `4/3 * tan(d/4)`. Measured over arcs from 0.1 to nearly a full turn, the
    worst point is 4.2e-6 of the radius off the true circle — a fifth of a
    micron on a 50 mm arc, and several orders below anything a pen can hold.
    """
    sweep = a.sweep
    if abs(sweep) < 1e-12 or a.r <= 0:
        return []
    steps = max(1, int(math.ceil(abs(sweep) / (math.pi / 4))))
    step = sweep / steps
    # Signed, so it carries the direction and the control points need no
    # further sign handling.
    k = 4 / 3 * math.tan(step / 4)
    out: list[Cubic] = []
    for i in range(steps):
        t0 = a.a0 + i * step
        p0 = a.centre + a.r * cmath.exp(1j * t0)
        p1 = a.centre + a.r * cmath.exp(1j * (t0 + step))
        # i * (p - centre) is the tangent in the direction of increasing angle.
        out.append(Cubic(p0, p0 + k * 1j * (p0 - a.centre),
                         p1 - k * 1j * (p1 - a.centre), p1))
    return out


@dataclass(frozen=True)
class Cubic:
    p0: complex
    c0: complex
    c1: complex
    p1: complex
    closed: bool = False

    def point_at(self, t: float) -> complex:
        u = 1 - t
        return (u**3 * self.p0 + 3 * u**2 * t * self.c0
                + 3 * u * t**2 * self.c1 + t**3 * self.p1)

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        # Segment count from the control polygon's deviation from the chord —
        # a standard conservative bound, cheaper than adaptive subdivision and
        # entirely adequate at plotter tolerances.
        dev = max(abs(self.c0 - self.p0), abs(self.c1 - self.p1))
        n = max(1, math.ceil(math.sqrt(3 * dev / (4 * tol)) * 2)) if dev > 0 else 1
        n = min(n, 512)
        t = np.linspace(0.0, 1.0, n + 1)
        u = 1 - t
        return (u**3 * self.p0 + 3 * u**2 * t * self.c0
                + 3 * u * t**2 * self.c1 + t**3 * self.p1)

    def bounds(self) -> Bounds:
        # Control-polygon hull; conservative, and never wrong.
        return Bounds.of([self.p0, self.c0, self.c1, self.p1])

    def transform(self, xf: Affine) -> Cubic:
        return Cubic(xf(self.p0), xf(self.c0), xf(self.c1), xf(self.p1))

    @property
    def start(self) -> complex:
        return self.p0

    @property
    def end(self) -> complex:
        return self.p1

    def reversed(self) -> Cubic:
        return Cubic(self.p1, self.c1, self.c0, self.p0)


@dataclass(frozen=True)
class Path:
    """A run of segments, for mixed line/arc/curve shapes.

    Segments are assumed contiguous; nothing enforces it, because §2.3a of the
    plan says validity is never assumed.
    """

    segments: tuple[Line | Arc | Cubic, ...]
    closed: bool = False

    def __post_init__(self) -> None:
        object.__setattr__(self, "segments", tuple(self.segments))

    @classmethod
    def of(cls, segments, closed: bool = False) -> Path:
        return cls(tuple(segments), closed)

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        if not self.segments:
            return np.empty(0, dtype=complex)
        chunks = [self.segments[0].flatten(tol)]
        for seg in self.segments[1:]:
            chunks.append(seg.flatten(tol)[1:])  # drop the shared join point
        pts = np.concatenate(chunks)
        if self.closed and len(pts) > 1 and abs(pts[0] - pts[-1]) < 1e-12:
            pts = pts[:-1]
        return pts

    def bounds(self) -> Bounds:
        return union_all(s.bounds() for s in self.segments)

    def transform(self, xf: Affine) -> Path:
        return Path(tuple(s.transform(xf) for s in self.segments), self.closed)

    @property
    def start(self) -> complex:
        return self.segments[0].start

    @property
    def end(self) -> complex:
        return self.segments[-1].end

    def reversed(self) -> Path:
        return Path(tuple(s.reversed() for s in reversed(self.segments)), self.closed)


@dataclass(frozen=True)
class Raster:
    """An image placed over a rectangle of the drawing.

    For things that are genuinely continuous — a field, a photograph — where
    drawing thousands of little rectangles is both slower and uglier than one
    picture. Carries a data URI so the SVG stays a single file.
    """

    box: Bounds
    href: str
    opacity: float = 1.0
    closed: bool = False

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        b = self.box
        return np.array([complex(b.xmin, b.ymin), complex(b.xmax, b.ymin),
                         complex(b.xmax, b.ymax), complex(b.xmin, b.ymax)],
                        dtype=complex)

    def bounds(self) -> Bounds:
        return self.box

    def transform(self, xf: Affine) -> Raster:
        # Only the corners move: a raster is axis-aligned by construction, so a
        # rotation would need resampling rather than a new box.
        return Raster(Bounds.of(xf(p) for p in self.flatten()), self.href,
                      self.opacity)


@dataclass(frozen=True)
class Text:
    """A text label. Not plottable line work — put it in its own layer.

    Needed for legends and annotation. It carries a position and a size in mm;
    the writer emits an SVG `<text>`, and `flatten` returns just the anchor so
    that bounds and generic handling still work.
    """

    at: complex
    text: str
    size: float = 4.0
    anchor: str = "middle"
    closed: bool = False

    def flatten(self, tol: float = DEFAULT_TOL) -> np.ndarray:
        return np.array([self.at], dtype=complex)

    def bounds(self) -> Bounds:
        # Approximate: half the size per character, which is close enough for
        # laying out a legend and cheap enough not to need font metrics.
        w = 0.5 * self.size * len(self.text)
        dx = {"start": 0.0, "middle": w / 2, "end": w}.get(self.anchor, w / 2)
        return Bounds(self.at.real - dx, self.at.imag - self.size * 0.3,
                      self.at.real - dx + w, self.at.imag + self.size)

    def transform(self, xf: Affine) -> Text:
        return Text(xf(self.at), self.text, self.size * xf.scale_factor, self.anchor)


def polygon(points, ) -> Polyline:
    """Closed polyline. The common output of a tiling face."""
    return Polyline(tuple(points), closed=True)
