"""A stack of fields, combined — the field side of a ruleset.

A single preset is one shape. Most of the interesting ones are combinations: a
ripple whose amplitude falls off radially, plane-wave interference roughened by
noise, a sweep with terraces cut into it. So a `FieldStack` is an ordered list of
**layers**, each a preset with its own parameters, its own strength, and a mode
saying how it joins what is below it.

The design mirrors `Ruleset` deliberately: same JSON-or-Python shape, same
`load` accepting a built-in name, a path, or inline JSON, and the same rule that
whatever the editor produces goes into an ordinary parameter so it replays from
the CLI. Fields and rules are the two halves of a deformation and there is no
reason for them to be edited through different machinery.

Combining modes
---------------
`add` sums, `multiply` masks, `max`/`min` take the stronger or weaker, and
`replace` ignores what is below. Layers are combined in order, so a stack reads
top to bottom like a short recipe.

The result is renormalised to the same range a single preset occupies, because
`--strength` is the one magnitude control everywhere and a stack of four fields
should not be four times as strong as one.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field as dc_field
from pathlib import Path
from typing import Any

import numpy as np

from .fields import DESCRIPTIONS, Field, FieldParams
from .fields import build_preset
from .fields import names as preset_names

MODES = ("add", "multiply", "max", "min", "replace")

MODE_HELP = {
    "add": "sum with what is below",
    "multiply": "mask what is below — zero here means nothing there",
    "max": "keep whichever is stronger",
    "min": "keep whichever is weaker",
    "replace": "ignore what is below",
}


@dataclass
class Layer:
    """One preset in a stack, with its own parameters."""

    field: str = "radial"
    mode: str = "add"
    strength: float = 1.0
    freq: float = 2.0
    phase: float = 0.0
    angle: float = 0.0
    fold: int = 5
    power: float = 1.0
    seed: int = 0
    #: Offsets this layer's centre, as a fraction of the extent. Two ripples
    #: from different places interfere; two from the same place do not.
    offset_x: float = 0.0
    offset_y: float = 0.0
    enabled: bool = True
    #: Rescale the running stack to +/-1 after this layer is combined. Off by
    #: default: running past the normalised range is often the point, and a
    #: field clamped at every step can never build up.
    normalise: bool = False
    name: str = ""

    def __post_init__(self) -> None:
        if self.field not in preset_names():
            raise ValueError(f"unknown field {self.field!r}; "
                             f"have {preset_names()}")
        if self.mode not in MODES:
            raise ValueError(f"unknown mode {self.mode!r}; have {list(MODES)}")

    def params(self, extent: float) -> FieldParams:
        return FieldParams(freq=self.freq, phase=self.phase, angle=self.angle,
                           fold=self.fold, power=self.power, seed=self.seed,
                           amplitude=1.0, extent=extent,
                           centre=complex(self.offset_x * extent,
                                          self.offset_y * extent))

    def build(self, extent: float) -> Field:
        return build_preset(self.field, self.params(extent)) * self.strength

    def describe(self) -> str:
        return self.name or f"{self.field} ({MODE_HELP[self.mode]})"

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"field": self.field}
        for k, default in (("mode", "add"), ("strength", 1.0), ("freq", 2.0),
                           ("phase", 0.0), ("angle", 0.0), ("fold", 5),
                           ("power", 1.0), ("seed", 0), ("offset_x", 0.0),
                           ("offset_y", 0.0), ("enabled", True),
                           ("normalise", False), ("name", "")):
            if getattr(self, k) != default:
                out[k] = getattr(self, k)
        return out


def _combine(below: np.ndarray, layer: np.ndarray, mode: str) -> np.ndarray:
    if mode == "add":
        return below + layer
    if mode == "multiply":
        return below * layer
    if mode == "max":
        return np.maximum(below, layer)
    if mode == "min":
        return np.minimum(below, layer)
    return layer          # replace


@dataclass
class FieldStack:
    """An ordered list of layers, combined into one field."""

    layers: list[Layer] = dc_field(default_factory=list)
    name: str = ""
    summary: str = ""
    #: Rescale the final result into the normalised range. Off gives the raw
    #: combination, which is what you want when the extreme version is the
    #: point — a field running to +4 with `--strength 1` is a legitimate thing
    #: to ask for, and clamping it silently would hide the answer.
    normalise: bool = True

    def __len__(self) -> int:
        return len(self.layers)

    def active(self) -> list[Layer]:
        return [lay for lay in self.layers if lay.enabled]

    def build(self, extent: float) -> Field:
        """The combined field. An empty stack is a flat 1, not an error."""
        active = self.active()
        if not active:
            return build_preset("flat", FieldParams(extent=extent))
        parts = [(lay.build(extent), lay.mode, lay.normalise) for lay in active]

        def f(z: np.ndarray) -> np.ndarray:
            out = parts[0][0](z)
            if parts[0][2]:
                out = _rescaled(out)
            for field, mode, norm in parts[1:]:
                out = _combine(out, field(z), mode)
                if norm:
                    out = _rescaled(out)
            return out

        combined = Field(f, self.name or "stack")
        return _normalised(combined, extent) if self.normalise else combined

    def build_each(self, extent: float) -> list[Field]:
        """Each layer on its own, for previewing what it contributes."""
        return [lay.build(extent) for lay in self.layers]

    # -- serialisation ---------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"layers": [lay.to_dict() for lay in self.layers]}
        for k in ("name", "summary"):
            if getattr(self, k):
                out[k] = getattr(self, k)
        if not self.normalise:
            out["normalise"] = False
        return out

    def save(self, path: Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2) + "\n")
        return path

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> FieldStack:
        if "layers" not in data:
            raise ValueError("a field stack needs a 'layers' list")
        return cls(layers=[Layer(**lay) for lay in data["layers"]],
                   name=data.get("name", ""), summary=data.get("summary", ""),
                   normalise=bool(data.get("normalise", True)))

    @classmethod
    def load(cls, path: Path) -> FieldStack:
        return cls.from_dict(json.loads(Path(path).read_text()))

    @classmethod
    def single(cls, preset: str, **kw) -> FieldStack:
        """A one-layer stack — what a plain `--field name` means."""
        return cls(layers=[Layer(field=preset, **kw)], name=preset)


def _rescaled(v: np.ndarray) -> np.ndarray:
    """Scale a sampled array so its extreme is 1, in place of a fixed clamp.

    Clamping would flatten the peaks; scaling keeps the shape and only changes
    the size, which is what "normalise" should mean for a field.
    """
    peak = float(np.abs(v).max()) if v.size else 0.0
    return v if peak < 1e-12 else v / peak


def _normalised(field: Field, extent: float, samples: int = 96) -> Field:
    """Scale a field so its extreme is 1, measured over the working area.

    A stack of four layers would otherwise be four times as strong as one, and
    `--strength` would stop meaning anything comparable. Measured once on a grid
    rather than derived, because `multiply` and `max` do not have a tidy
    closed-form range.
    """
    g = np.linspace(-extent, extent, samples)
    gx, gy = np.meshgrid(g, g)
    z = gx + 1j * gy
    z = z[np.abs(z) <= extent]
    if not len(z):
        return field
    peak = float(np.abs(field(z)).max())
    if not np.isfinite(peak) or peak < 1e-12:
        return field
    return Field(lambda w: field(w) / peak, field.name)


# ---------------------------------------------------------------------------
# Built-in stacks
# ---------------------------------------------------------------------------
#
# Starting points that show what combining is for, not a closed list.

BUILTIN: dict[str, FieldStack] = {
    "ripple-fade": FieldStack(
        name="ripple-fade", summary="concentric waves, fading toward the rim",
        layers=[Layer(field="ripple", freq=4),
                Layer(field="radial-in", mode="multiply")]),
    "rough-waves": FieldStack(
        name="rough-waves", summary="quasiperiodic interference, roughened",
        layers=[Layer(field="waves", fold=5, freq=3),
                Layer(field="noise", mode="add", strength=0.4, freq=6, fold=6)]),
    "grain": FieldStack(
        name="grain", summary="a smooth ramp broken up by fine grain",
        layers=[Layer(field="radial"),
                Layer(field="white", mode="multiply", strength=1.0, freq=40)]),
    "islands": FieldStack(
        name="islands", summary="noise cut into terraces",
        layers=[Layer(field="noise", freq=3, fold=6),
                Layer(field="steps", mode="multiply", fold=5)]),
    "beat": FieldStack(
        name="beat", summary="two ripples from different centres, interfering",
        layers=[Layer(field="ripple", freq=5, offset_x=-0.4),
                Layer(field="ripple", freq=5, offset_x=0.4, mode="add")]),
    "spotlight": FieldStack(
        name="spotlight", summary="a wave, masked to the middle",
        layers=[Layer(field="wave", freq=5, angle=30),
                Layer(field="radial-in", mode="multiply", power=2.0)]),
}


def builtin(name: str) -> FieldStack:
    if name not in BUILTIN:
        raise ValueError(f"unknown field stack {name!r}; have {sorted(BUILTIN)}")
    return FieldStack.from_dict(json.loads(json.dumps(BUILTIN[name].to_dict())))


def load_stack(spec: str) -> FieldStack:
    """A preset name, a built-in stack name, a JSON path, or inline JSON."""
    spec = (spec or "").strip()
    if not spec:
        return FieldStack.single("flat")
    if spec in BUILTIN:
        return builtin(spec)
    if spec in preset_names():
        return FieldStack.single(spec)
    if spec.startswith("{"):
        try:
            return FieldStack.from_dict(json.loads(spec))
        except json.JSONDecodeError as exc:
            raise ValueError(f"inline field stack is not valid JSON: {exc}") from None
    path = Path(spec)
    if path.exists():
        return FieldStack.load(path)
    raise ValueError(
        f"{spec!r} is not a field preset ({preset_names()}), a built-in stack "
        f"({sorted(BUILTIN)}), an existing file, or inline JSON")


def catalogue() -> dict[str, Any]:
    """Everything a field editor needs to build itself."""
    return {
        "presets": [{"name": n, "doc": DESCRIPTIONS[n]} for n in preset_names()],
        "modes": MODE_HELP,
        "stacks": [{"name": n, "doc": s.summary, "layers": s.to_dict()["layers"]}
                   for n, s in sorted(BUILTIN.items())],
        "layer_defaults": Layer().to_dict() | {"field": "radial", "mode": "add"},
    }
