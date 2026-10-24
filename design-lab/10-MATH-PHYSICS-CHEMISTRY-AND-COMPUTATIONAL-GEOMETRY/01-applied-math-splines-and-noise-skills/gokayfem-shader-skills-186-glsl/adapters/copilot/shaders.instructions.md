---
applyTo: "**/*.glsl,**/*.frag,**/*.fs"
---

Copy this file into your repository's `.github/instructions/`. For agent mode, also install the skill with
`gh skill install gokayfem/shader-skills shader-art-coding`.

- Write Shadertoy-compatible GLSL ES 3.00 with `mainImage(out vec4 fragColor, in vec2 fragCoord)`.
- Prefer the `shader-art-coding` library functions (SDFs, noise, raymarching, shading, tonemapping) over hand-written
  copies, and bundle with `scripts/glsl_tools.py bundle`.
- No `#version`, custom uniforms, `?:` on structs, or `fract(sin(...))` hashes.
- Debug with `#define DEBUG_MODE 0` (0 final, 1 distance, 2 normals, 3 ids, 4 steps, 5 masks, 6 lighting terms).
- Light in linear color; tonemap per sample, then encode once with the exact sRGB curve, then dither.
