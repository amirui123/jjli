"""Composable scalar and vector fields, and named presets."""

from .field import (
    Field, VField, angular, const, direction, distance_to, gradient,
    linear_radial, outward, radial, radial_ripple, ripple, spiral, sweep,
    tangential, value_noise, wave, waves,
)
from .presets import (
    DESCRIPTIONS, PARAM_HELP, PRESETS, USES, FieldParams, build_preset, names,
    uses,
)

__all__ = [
    "DESCRIPTIONS", "Field", "FieldParams", "PARAM_HELP", "PRESETS", "USES",
    "VField", "angular",
    "build_preset", "const", "direction", "distance_to", "gradient",
    "linear_radial", "names", "outward", "radial", "radial_ripple", "ripple",
    "spiral", "sweep", "tangential", "uses", "value_noise", "wave", "waves",
]
