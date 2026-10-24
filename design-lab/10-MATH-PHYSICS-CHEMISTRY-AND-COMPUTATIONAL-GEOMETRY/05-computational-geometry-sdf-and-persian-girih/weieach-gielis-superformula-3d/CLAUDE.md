# Superformula explorer — guide for Claude

An interactive visualizer for Gielis' superformula: two parameter sets combine
into a 3D supershape (spherical product), with presets for the shape
categories in `shape-categories.md`, a randomize button (`randomSet`,
skewed toward well-formed shapes), copy/download buttons that export both
sets as JSON (`valuesJSON`), and a 2D preview of Set 1.

It is a standalone project. It has nothing to do with nijimu or any other
repo in `../`: don't read from them, sync with them, or describe it as their
tool.

## Layout

- `index.html`: the whole app, with its markup, CSS and script in one file.
- `shape-categories.md`: categories, parameter ranges and sample configs.
  This is the reference the presets come from.
- `README.md`: the public description.

## Running it

There's no build step and no package manager. Open `index.html` directly, or
serve the folder. The `static` entry in `.claude/launch.json` is a tiny
inline Node static server on `$PORT` (5190 if unset) for the preview pane.
It is Node, not `python3 -m http.server`, because the preview launcher's
Python is not allowed to read the Desktop folder.

## Deploying

It is a static site on Vercel (project `superformula-explorer`, production
URL https://superformula-explorer.vercel.app). From this folder run
`npx vercel@latest deploy --prod`; `.vercel/` links the folder to the
project. `.vercelignore` keeps `.claude/` and `CLAUDE.md` out of the upload.

## How it works

- `P.A` (Set 1) and `P.B` (Set 2) hold `{m, n1, n2, n3, a, b}`. Every slider,
 preset or randomize action edits `P` and calls `sync()`, which updates the
 controls and redraws the 2D curve (`draw2`) and the mesh (`build`).
 Randomize all also calls `randomTint()`, which picks a new wash from
 `TINT_HUES`.
- The formula tile is KaTeX (display-style fractions). Each variable is
  wrapped in `\htmlClass{v v-<key>}` (KaTeX `trust` allows only that
  command). While a slider is held or nudged with the keyboard, `lightVar(k)`
  marks the matching spans `.hot` and adds `.focus` to `#formula`, which eases
  everything else to a dim colour (colour, not opacity, so the hot spans can
  stay at full ink). Release removes only `.focus`.
- Shared GLSL: `FLOW_NOISE` (simplex `snoise` plus `uFlowTime`, driven by
  `flowTime` from the render loop and frozen under `prefers-reduced-motion`)
  and `FLOW_PALETTE` (`grainHash`, `sfHex`). They hold only functions; the
  mesh declares its own varyings/uniforms.
- The mesh is liquid foil (after a silver-foil reference), not streaks.
  `FOIL_FIELD`'s `foilField` is a smooth, lightly domain-warped noise
  (mostly one octave) stretched so folds run horizontally. A stronger warp
  or finer octave folds it into thin creases that read as veins. `mat.onBeforeCompile` evaluates it per
  vertex in object space (seamless) plus three finite-difference samples (a
  wide 0.05 step, which low-passes it) for its gradient (`vRipple`, view space), and `FOIL_PALETTE`'s `foilColor`
  maps it to one continuous soft-grey-to-silvery-white gradient (wide,
  overlapping ramps, no thresholds or contour lines, which band), with a
  faint warm-grey region (`vWarm`). The fragment shader tilts the normal
  against `vRipple` (strength `flowRipple`) so reflections bend over the
  folds. Don't take that gradient with `dFdx`/`dFdy` of a varying: it is
  linear per triangle, so the grid shows as zebra stripes. Higher field
  frequency or ripple strength quickly turns it into crumpled tinfoil. It
  also adds static film grain after `dithering_fragment`.
  The base is one shared `MeshPhysicalMaterial` (metalness 1, roughness
  0.36, clearcoat 0.6 / 0.5, a trace of bump/roughness grain from
  `grainTexture()`, which is why the grid has UVs), lit only by
  `S.environment`, a PMREM of `studioEnvironment()`: a gradient dome with a
  dark horizon band and softboxes baked in as Gaussian lobes. Keep the env
  scene opaque: r128's PMREM stores RGBE, so transparent or blended objects
  in it corrupt the map. The renderer uses sRGB output and ACES tone
  mapping, so CSS colours fed to three.js go through `convertSRGBToLinear()`.
  The stage behind it is the same solid colour as the tiles (`--tile`).
- Primary buttons are plain `--primary` (white) with `--on-primary` text.
- `sf(angle, set)` is the formula. It clamps r at 50, per the practical
  notes in the reference.
- `build()` samples θ ∈ [−π, π] (`NU` = 640) by φ ∈ [−π/2, π/2]
  (`NV` = 320), about 206k vertices, and normalises the shape to fit. The
  formula is z-up, so positions are written as (x, z, y) to stand the profile
  along three.js's y axis.
- The geometry (`geo`) is created once: index, UVs and the θ/φ trig tables
  are fixed, and `build()` only rewrites positions in place. Normals come
  from `gridNormals()` (cross product of central differences on the grid,
  wrapping θ across the seam) rather than `computeVertexNormals`, which was
  ~4× slower at this size. A rebuild is ~11 ms, which keeps slider drags
  smooth; check that before raising `NU`/`NV` further.
- three.js is **r128**, loaded as the global `THREE` build from cdnjs.
  Newer releases dropped that build. Moving to a newer version means
  switching to ES modules and an import map, so do it on purpose, not as a
  side effect.

## Conventions

- Keep it a single dependency-free HTML file unless there's a real reason not to.
- Colours are CSS variables. Theme-independent tokens (`--accent`,
  `--accent-hover`, `--on-accent`, `--ease-out`) sit in a plain `:root` block;
  the rest are defined twice: `:root,[data-theme=dark]` and
  `[data-theme=light]`. `--accent` is for fills; `--accent-fg` is the accent
  as a foreground (curve, focus rings, hover text), deeper in light theme so
  it stays visible on white. `--secondary` fills preset tags, secondary
  buttons and the dialog's input (graphite in dark, white in light). The
  JSON field uses the panel colour (`--tile`). Light-theme layering, darkest
  to lightest: page `--bg`, tiles, dialog and JSON field `--tile`, then white
  `--secondary` controls. Use tokens rather than hex values in rules. A tiny script in `<head>` picks the theme before paint
  (saved `sf-theme` in localStorage, else the system preference). The header
  toggle (`#themeToggle`) is hidden with CSS for now but still wired up; it
  calls `applyTheme()`, which also recolours the mesh material and
  redraws the 2D canvases, since those read `--mesh`, `--axis` and `--curve`
  via `css()` rather than CSS.
- The look follows the Nothing app: black/graphite tiles (`.tile`) on a grid
  with `--gutter` (6px) gaps and `--radius` (20px) corners. Panels nested in a
  tile (the stage insets) sit one gutter from its edge with radius
  `--radius − --gutter`, and have no border. Labels are Space Mono uppercase, and the lavender accent is used
  for the 2D curve, focus rings and hovers.
- Dark theme only: a `.tint` layer (`mix-blend-mode: multiply`,
 `pointer-events: none`, max z-index) washes the whole UI. It holds two
 panes: the settled colour (`--tint-prev`) and the incoming one. On
 Randomize all, `slideTint` (Anime.js) brings the incoming pane in from
 the upper left, rotated −18°, so the new wash slides in on a diagonal.
 The hue is one of `TINT_HUES` (same OKLCH lightness and chroma).
 `--accent` follows that hue. The modal dialog is in the top layer, so
 `.tint-dialog` repeats the panes and reads the same `--sx`/`--sy`. The
 light theme has no overlay: its tokens are that tint multiplied into the
 neutral bases in `LIGHT_BASE` (`paintTint`).
- Controls are built in JS from `specs`. Preset tags carry an inline-SVG
  icon from `presetIcon()`: both sets drawn with `sf`, Set 1 solid over a
  faded Set 2 (Set 1 alone collides, e.g. Sphere and Cylinder).
- Respect `prefers-reduced-motion`, which already disables the auto-rotate.

## Known rough edges

- `sf` returns 0 when the inner sum is 0, where clamping to 50 would match
  the reference's advice.
