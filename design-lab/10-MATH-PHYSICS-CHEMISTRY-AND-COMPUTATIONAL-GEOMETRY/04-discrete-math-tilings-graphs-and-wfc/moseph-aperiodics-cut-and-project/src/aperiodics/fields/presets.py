"""Named field presets — the *shape* of a deformation, and nothing else.

A field says how strong the deformation is at each point. It knows nothing about
tilings, vertices, or which way anything moves; that is a rule's business. So any
field can be paired with any ruleset, which is the whole point of the split.

Every preset is **normalised**: it produces values in roughly [-1, 1] over the
tiling's extent, and takes its frequencies in *cycles across the extent* rather
than in mm. Two consequences worth having:

* `--strength` is the single magnitude control. The field contributes shape, the
  strength contributes size, and neither secretly does the other's job.
* A field means the same thing on a 40 mm patch and a 400 mm one.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable

import numpy as np

from .field import Field, const

TAU = 2 * math.pi


@dataclass(frozen=True)
class FieldParams:
    """One signature shared by every preset, so the CLI flags are uniform.

    Not every preset uses every parameter — `flat` uses none — and that is fine;
    the alternative is a different flag set per field, which makes sweeping
    across fields impossible.
    """

    freq: float = 1.0
    phase: float = 0.0
    amplitude: float = 1.0
    angle: float = 0.0
    fold: int = 5
    power: float = 1.0
    seed: int = 0
    centre: complex = 0j
    #: Half-width of the region the field is normalised over, in mm. Supplied by
    #: the caller from the tiling, not by the user.
    extent: float = 100.0


def _finish(f: Field, p: FieldParams) -> Field:
    out = f
    if p.power != 1.0:
        out = out.power(p.power)
    if p.amplitude != 1.0:
        out = out * p.amplitude
    return out


def _flat(p: FieldParams) -> Field:
    return const(1.0)


def _radial(p: FieldParams) -> Field:
    return Field(lambda z: np.abs(z - p.centre) / p.extent, "radial")


def _radial_in(p: FieldParams) -> Field:
    return Field(lambda z: 1.0 - np.abs(z - p.centre) / p.extent, "radial-in")


def _ripple(p: FieldParams) -> Field:
    k = TAU * p.freq / p.extent
    return Field(lambda z: np.sin(np.abs(z - p.centre) * k + p.phase), "ripple")


def _wave(p: FieldParams) -> Field:
    k = TAU * p.freq / p.extent
    d = complex(math.cos(math.radians(p.angle)), math.sin(math.radians(p.angle)))

    def f(z: np.ndarray) -> np.ndarray:
        v = z - p.centre
        return np.sin((v.real * d.real + v.imag * d.imag) * k + p.phase)
    return Field(f, "wave")


def _waves(p: FieldParams) -> Field:
    """`fold` plane waves at evenly spaced angles — quasiperiodic interference.

    The same object the multigrid builds, approached from the Fourier side.
    """
    k = TAU * p.freq / p.extent
    dirs = [complex(math.cos(a), math.sin(a))
            for a in (math.pi * i / p.fold + math.radians(p.angle)
                      for i in range(p.fold))]

    def f(z: np.ndarray) -> np.ndarray:
        v = z - p.centre
        return sum(np.sin((v.real * d.real + v.imag * d.imag) * k + p.phase)
                   for d in dirs) / p.fold
    return Field(f, "waves")


def _angular(p: FieldParams) -> Field:
    return Field(lambda z: np.sin(p.fold * np.angle(z - p.centre) + p.phase),
                 "angular")


def _spiral(p: FieldParams) -> Field:
    k = TAU * p.freq / p.extent

    def f(z: np.ndarray) -> np.ndarray:
        v = z - p.centre
        return np.sin(np.abs(v) * k + p.fold * np.angle(v) + p.phase)
    return Field(f, "spiral")


def _sweep(axis: str) -> Callable[[FieldParams], Field]:
    def make(p: FieldParams) -> Field:
        def f(z: np.ndarray) -> np.ndarray:
            v = z - p.centre
            base = v.real if axis == "x" else v.imag
            return base / p.extent
        return Field(f, f"sweep-{axis}")
    return make


def _noise(p: FieldParams) -> Field:
    """Smooth pseudo-random: Perlin-like value noise with smoothstep blending.

    `freq` is features across the extent, so it means the same thing as it does
    for the waves. `fold` is octaves — each one at half the size and half the
    amplitude, which is what turns a soft blur into something with texture.
    """
    from .field import value_noise
    scale = max(p.extent / max(p.freq, 0.05), 1e-6)
    return value_noise(scale=scale, seed=p.seed,
                       octaves=max(1, min(6, p.fold // 2)))


def _white(p: FieldParams) -> Field:
    """Uncorrelated noise: a different value at every point, no smoothing.

    Not useful as a displacement on its own — it is the same as `--noise` — but
    it is useful *multiplied* by something, to break up a field that is too
    clean without changing its shape.
    """
    def f(z: np.ndarray) -> np.ndarray:
        # Hash the quantised position, so the same point always gives the same
        # value: a field has to be a function of position, not of call order.
        q = max(p.extent / max(p.freq, 0.05), 1e-9) / 64.0
        xi = np.floor(z.real / q).astype(np.int64)
        yi = np.floor(z.imag / q).astype(np.int64)
        h = (xi * np.int64(374761393) + yi * np.int64(668265263)
             + np.int64(p.seed) * np.int64(1442695040888963407))
        h = (h ^ (h >> np.int64(13))) * np.int64(1274126177)
        return ((h ^ (h >> np.int64(16))) % 20001) / 10000.0 - 1.0
    return Field(f, "white")


def _steps(p: FieldParams) -> Field:
    """A radial ramp snapped to `fold` levels — terraces rather than a slope."""
    return _radial(p).quantise(max(1, p.fold))


PRESETS: dict[str, Callable[[FieldParams], Field]] = {
    "flat": _flat,
    "radial": _radial,
    "radial-in": _radial_in,
    "ripple": _ripple,
    "wave": _wave,
    "waves": _waves,
    "angular": _angular,
    "spiral": _spiral,
    "sweep-x": _sweep("x"),
    "sweep-y": _sweep("y"),
    "noise": _noise,
    "white": _white,
    "steps": _steps,
}

DESCRIPTIONS = {
    "flat": "constant 1 everywhere; the ruleset acts uniformly",
    "radial": "0 at the centre rising to 1 at the rim",
    "radial-in": "1 at the centre falling to 0 at the rim",
    "ripple": "concentric sine waves; freq = rings across the extent",
    "wave": "a plane wave travelling at --field-angle",
    "waves": "fold plane waves at even angles: quasiperiodic interference",
    "angular": "fold-lobed rotational variation; petals and spokes",
    "spiral": "radial wave sheared by angle",
    "sweep-x": "linear ramp along x, -1 to 1",
    "sweep-y": "linear ramp along y, -1 to 1",
    "noise": "smooth pseudo-random; freq sets the feature size, fold the octaves",
    "white": "uncorrelated grain; useful multiplied into another field",
    "steps": "radial ramp snapped to fold discrete levels",
}


#: Which parameters each preset actually uses. Declared beside the presets
#: because it is a property of the field, not of any editor — and because a
#: control that does nothing is worse than a missing one: it invites you to
#: reason about an effect that is not there.
#:
#: `wave` is the case that makes this worth writing down. A plane wave offset
#: along its direction of travel is *exactly* a phase shift, and offset across
#: it is nothing at all, so `offset` and `phase` are the same control twice.
#: `ripple` genuinely needs both: `offset` moves the centre, `phase` moves the
#: rings.
USES: dict[str, tuple[str, ...]] = {
    "flat": (),
    "radial": ("offset", "power"),
    "radial-in": ("offset", "power"),
    "ripple": ("freq", "phase", "offset", "power"),
    "wave": ("freq", "phase", "angle", "power"),
    "waves": ("freq", "phase", "angle", "fold", "power"),
    "angular": ("fold", "phase", "offset"),
    "spiral": ("freq", "fold", "phase", "offset"),
    "sweep-x": ("offset", "power"),
    "sweep-y": ("offset", "power"),
    "noise": ("freq", "fold", "seed"),
    "white": ("freq", "seed"),
    "steps": ("fold", "offset", "power"),
}

#: What each shared parameter means, for labelling a control.
PARAM_HELP = {
    "freq": "cycles across the tiling",
    "phase": "shifts the pattern along itself",
    "angle": "direction of travel, in degrees",
    "fold": "lobes, wave count, octaves or levels, depending on the field",
    "power": "reshapes the values; above 1 accentuates the extremes",
    "seed": "which random field",
    "offset": "moves the field's centre, as a fraction of the extent",
}


def uses(name: str) -> tuple[str, ...]:
    """The parameters this preset responds to."""
    return USES.get(name, ())


def build_preset(name: str, params: FieldParams) -> Field:
    if name not in PRESETS:
        raise ValueError(f"unknown field {name!r}; have {sorted(PRESETS)}")
    return _finish(PRESETS[name](params), params)


def names() -> list[str]:
    return sorted(PRESETS)
