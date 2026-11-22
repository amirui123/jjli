# Rendering Parity Specification

Delete this file when the target has no canvas, WebGL, WebGPU, or other custom
rendering surface.

## Fixed Reference State

- Target URL and state:
- Viewport, zoom, and DPR:
- Cursor, input, animation time, and readiness condition:
- Reference captures:
- Target self-variance and dynamic masks:

## Measured Frame Contract

Record observable or client-delivered evidence. Mark unknown values instead of
guessing them.

| Layer | Reference value / evidence | Clone implementation | Exact / approximate | Validation |
| --- | --- | --- | --- | --- |
| Canvas and context | | | | |
| Resolution and DPR | | | | |
| Output color space | | | | |
| Tone mapping and exposure | | | | |
| Camera and framing | | | | |
| Lighting | | | | |
| Shadows | | | | |
| Fog and atmosphere | | | | |
| Sky or clear color | | | | |
| Materials and atlases | | | | |
| Authored transforms | | | | |
| Decoration and VFX layers | | | | |
| Postprocessing order | | | | |
| Low-performance branch | | | | |

## Camera and Framing

- Projection, FOV or orthographic bounds:
- Near and far planes:
- Initial position, target, up vector, and world scale:
- Follow frame, distance, offsets, smoothing, and interruption:
- Pointer, wheel, touch, and responsive behavior:
- Camera-relative objects:

## Lighting and Shadows

| Light | Type | Color / intensity | Position or frame | Target | Shadow contract |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

- Shadow map type and size:
- Shadow camera bounds, near, and far:
- Bias, normal bias, radius, and intensity:
- Moving-light frame and stabilization:
- Cast / receive rules:

## Materials and Textures

| Material family | Geometry users | Texture roles | Color space / filtering / wrapping | Lighting model | Fog path |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

- Palette or atlas UV contract:
- Painted light / shadow transform:
- Alpha, side, depth, blending, and render-order rules:
- Custom geometry attributes consumed by shaders:
- Color-space conversion in custom shaders:

## Authored Transform and Layer Integrity

| Layer / entity set | Expected count | Transform source | Coordinate system | Placement rule | Complete |
| --- | --- | --- | --- | --- | --- |
| | | | | | Pending |

- World origin, unit scale, and surface model:
- Values that must not be normalized, projected, or recomputed:
- Collider versus visible-geometry ownership:
- Intentional clean-room substitutions:

## Postprocessing Chain

Order matters. Include neutral or absent passes when their absence is part of
the reference contract.

| Order | Pass | Inputs / buffers | Parameters | Performance branch | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |

- Native antialiasing versus post-process antialiasing:
- Normal, depth, motion, or history-buffer requirements:
- Passes tested and intentionally disabled:

## Shared Entity Rendering

Delete this section when the target has no repeated local, NPC, or remote
entities.

| Entity role | Geometry / rig | Material path | Animation path | Fog / outline / shadow | Intentional difference |
| --- | --- | --- | --- | --- | --- |
| Local | | | | | |
| NPC | | | | | |
| Remote | | | | | |

- Shared decoration stack in multi-client state:
- Per-instance mixer, material, and cleanup ownership:
- Network interpolation boundary versus visual rig:

## Performance Policy

- Measured target DPR and frame-time behavior:
- Visual invariants that every tier preserves:
- Costs reduced on lower tiers:
- Features removed only when the target removes them:
- Runtime metrics or observability:

## Layer-by-Layer Acceptance

| Gate | Reference | Clone | Largest delta | Status |
| --- | --- | --- | --- | --- |
| Background and framing | | | | Pending |
| Scene silhouette and density | | | | Pending |
| Lighting and shadows | | | | Pending |
| Materials and atmosphere | | | | Pending |
| Postprocessing | | | | Pending |
| Local / NPC / remote parity, if present | | | | Pending |
| Lower-performance branch, if present | | | | Pending |

## Unknown or Approximate Rendering

| Subsystem | Evidence | Decision | User-visible risk | Follow-up |
| --- | --- | --- | --- | --- |
| | | | | |
