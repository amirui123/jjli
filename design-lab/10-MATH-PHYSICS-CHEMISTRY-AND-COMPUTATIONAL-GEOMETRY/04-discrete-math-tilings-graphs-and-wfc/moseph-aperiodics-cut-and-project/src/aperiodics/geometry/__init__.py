"""Exact 2-D geometry. See `primitives` for the flattening contract."""

from .bounds import Bounds, union_all
from .primitives import (
    DEFAULT_TOL, TAU, Arc, Circle, Cubic, Geometry, Line, Path, Polyline,
    Raster, Text, arc_to_cubics, polygon,
)
from .transform import Affine

__all__ = [
    "Affine", "Arc", "Bounds", "Circle", "Cubic", "DEFAULT_TOL", "Geometry",
    "Line", "Path", "Polyline", "Raster", "TAU", "Text", "arc_to_cubics",
    "polygon", "union_all",
]
