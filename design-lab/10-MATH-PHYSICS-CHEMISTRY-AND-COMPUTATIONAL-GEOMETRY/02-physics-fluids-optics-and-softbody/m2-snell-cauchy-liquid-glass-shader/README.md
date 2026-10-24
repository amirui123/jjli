# Liquid Glass — Screen-Space Refraction · WebGL2 vs CSS

<!-- LINKS:BEGIN — üretildi: scripts/sync-repo-links.py · elle düzenleme -->
**▶ [Live demo](https://m2-md.github.io/liquid-glass-refraction-shader/)** · [Source](https://github.com/m2-md/liquid-glass-refraction-shader)
<!-- LINKS:END -->

> Screen-space refraction in WebGL2: simulated index of refraction (IOR), chromatic dispersion, and Fresnel reflections compared against CSS backdrop-filter and SVG feDisplacementMap.

The working code for the article "Blur Is Not Refraction: Liquid Glass, IOR and
Chromatic Dispersion in WebGL2". Raw WebGL2 (GLSL ES 3.00), TypeScript, Vite,
vitest. No Three.js, no post-processing library; the math on every line is
written by hand.

The same liquid glass panel is built twice:

- **The WebGL path** — the backdrop is drawn into an FBO, and the panel samples
  that texture by bending it with `refract()`. IOR is a real material constant,
  dispersion is a separate `eta` per channel, the edge glow is Schlick–Fresnel.
- **The CSS path** — an absolutely positioned `<div>` on top of the same canvas,
  `backdrop-filter: blur(2px) url(#liquid-glass)` and an SVG
  `feDisplacementMap` map generated at runtime.

The backdrop is drawn on the same WebGL canvas **in both modes**; the only thing
that changes is how the panel is built. That is what makes the comparison fair.

## What is in here

- **Two-pass frame flow** (`src/fbo.ts`, `src/renderer.ts`) — the backdrop is
  drawn into the FBO once, copied to the screen with `blitFramebuffer`, and the
  copy the glass reads is kept at a separate scale if you ask for it.
  `CLAMP_TO_EDGE` is required: the refracted sample runs past the texture.
- **The glass shader** (`src/shaders/glass.frag.glsl`) — 2D `sdRoundedBox`, a
  quarter-circle bevel profile, a normal from the gradient, a `refract()`-based
  screen-space offset, dispersion by spectrum sweep, Schlick–Fresnel, three view
  modes (glass / normal / fringe).
- **The panel's own quad** (`src/shaders/panel.vert.glsl`) — no attributes, the
  four corners come from `gl_VertexID`. Fragment cost is proportional to the
  area of the **panel**, not of the screen.
- **The CSS twin** (`src/displacement-map.ts`, `src/css-glass.ts`) — the
  displacement map is generated from the TypeScript twins of the **same**
  `sdRoundedBox` / `glassNormal` functions used by the shader, and bound to
  `feImage` as a PNG data URL.
- **The GPU clock** (`src/gpu-timer.ts`) — `EXT_disjoint_timer_query_webgl2`; a
  query queue, a `GPU_DISJOINT_EXT` check, NO `gl.finish()`. If the extension is
  missing, the HUD and the measurement output say so plainly and fall back to
  the median rAF delta.
- **The pure logic layer** (`src/optics.ts`, `src/sdf2d.ts`, `src/stats.ts`,
  `src/viewport.ts`, `src/vram.ts`, `src/coverage.ts`, `src/fringe.ts`) — the
  TypeScript mirror of the GLSL; browserless, tested with vitest.

## Install

```bash
npm install
```

## Tests (browserless, deterministic)

```bash
npm test
```

**84 tests green** (10 files): optics (15), 2D SDF and normals (12), viewport
clamps (9), median/percentile (8), frame statistics + measurement mode (9),
shader source (7), coverage (7), displacement map (6), fringe decoding (6),
VRAM math (5). No test file references `document`, `window`, `navigator`,
`WebGL2RenderingContext` or `performance`.

## Type check and build

```bash
npx tsc --noEmit   # 0 errors
npm run build      # tsc && vite build -> dist/
```

GLSL is not compiled here; only the browser shows you that the shader really
compiles.

## Demo (NOT `file://`)

```bash
npm run dev
# http://localhost:5173/
```

The defaults are modest: a 960×540 CSS stage (not fullscreen), a resolution
scale of 0.75, 3 dispersion samples, a backdrop texture scale of 1.0.

| Control                 | Values                                          | Default    |
| ----------------------- | ----------------------------------------------- | ---------- |
| Path                    | no panel / WebGL / CSS blur / displace / RGB    | WebGL      |
| View mode               | glass / normal / fringe                         | glass      |
| IOR                     | 1.0 – 2.5                                       | 1.52       |
| Spread (`spread`)       | 0 – 0.4                                         | 0.15       |
| Dispersion samples      | 1 / 3 / 8                                       | 3          |
| Bevel width             | 4 – 80 px                                       | 34         |
| Thickness               | 1 – 20                                          | 6          |
| Refraction depth        | 0 – 220 px                                      | 90         |
| Backdrop texture scale  | 1.00 / 0.50 / 0.25                              | 1.00       |
| Resolution scale        | 0.5 / 0.75 / 1.0                                | 0.75       |
| Pause/Resume            | —                                               | running    |

What you will see:

- **The WebGL path:** the pattern in the middle of the panel does not budge
  (normal `(0,0,1)`, refraction zero), and the offset grows toward the edge.
  There is a Fresnel glow at the edge.
- **`normal` mode:** where the bevel starts and ends shows up as color; the
  plateau is flat blue (`(0,0,1)`), the bevel tilts sideways.
- **`fringe` mode:** the backdrop is not drawn, everything outside the panel is
  black; the bevel region climbs toward red. The red channel encodes the
  inter-channel separation with a `32 px` ceiling.
- **Turn the spread up** and you get an orange/blue fringe at the edge; going
  from 3 samples to 8 softens it.
- **Set IOR = 1.0** and the offset disappears entirely: no refraction, flat
  glass.
- **The CSS paths:** the panel is in the same place, at the same size. In
  `css-rgb` you can see the channel separation at the edge.

### Heat guardrails

`devicePixelRatio` is clamped to 2 (`src/viewport.ts`), the resolution scale is
in the user's hands, and the total backing buffer is capped at 2.1 Mpx. The loop
stops on its own when the tab goes to the background; the `Pause` button really
does cancel `requestAnimationFrame` (stop it, not throttle it).

## How the two paths were matched

`feDisplacementMap`'s `scale` is a number in pixels; the `uDepth = 90` +
`thickness = 6` on the WebGL side comes from physics. The two are in different
units, so they were matched numerically: on the flat part of the bevel (180–208
px from the panel center) the ratio between `refractOffsetPx` and the CSS offset
comes out at **62**. The `scale="62"` in the filter is the result of that
calculation, not eyeballing.

The same calculation for dispersion: at `spread = 0.15` the offsets of the red
and blue ends deviate ±9% from the center, hence `scale="56" / "62" / "68"` in
the three-branch filter.

The map itself is **not** a normal map, it is a displacement map directly: since
the refracted sample moves opposite to the normal, both channels are encoded
negated (`-n.x`, `-n.y`), and the coordinates are computed in SVG's y-down
frame. Miss one of those signs and the CSS panel bends exactly opposite to the
WebGL panel, and the comparison quietly becomes meaningless.

## Deterministic measurement mode

```
http://localhost:5173/?measure=1
```

In this mode the demo stops being interactive: the backing buffer is locked to
960×540, the time step is fixed at `frame / 60`, interaction is off. 30 warmup +
180 measurement frames per configuration. 13 runs in total, 2376 frames: about
20 seconds on a 120 Hz display, ~40 at 60 Hz. When it finishes, **one line**
lands on the console.

The line below is not a made-up format sample, it is from a real run (headless
Chrome, Apple M2 Pro/ANGLE Metal, 960×540). Every field, `frameMsP95` included,
sits here in raw form. The tables in the article were assembled from three runs
like this one; the last digits wobble a little from run to run:

```
MEASURE {"version":1,"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.0.0 Safari/537.36","dpr":1,"backing":{"w":960,"h":540},"vsyncMs":8.3,"timerExt":true,"cssFilterUrlSyntaxSupported":true,"panel":{"w":420,"h":260,"radius":40,"coveragePct":20.8},"dispersion":[{"samples":1,"texelFetches":1,"gpuMsMedian":0.131,"frameMsMedian":8.3,"vsyncBound":true},{"samples":3,"texelFetches":3,"gpuMsMedian":0.1635,"frameMsMedian":8.3,"vsyncBound":true},{"samples":8,"texelFetches":8,"gpuMsMedian":0.217,"frameMsMedian":8.3,"vsyncBound":true}],"msPerSample":0.01229,"msPerSampleMethod":"gpu","backdropScale":[{"scale":1,"gpuMsMedian":0.1642,"frameMsMedian":8.3,"vsyncBound":true,"vramBytes":2073600},{"scale":0.5,"gpuMsMedian":0.195,"frameMsMedian":8.3,"vsyncBound":true,"vramBytes":2592000},{"scale":0.25,"gpuMsMedian":0.201,"frameMsMedian":8.3,"vsyncBound":true,"vramBytes":2203200}],"fringe":[{"spread":0.00805,"maxSeparationPx":0.251},{"spread":0.15,"maxSeparationPx":5.5216}],"fringeQuantizationPx":0.1255,"paths":[{"label":"baseline","frameMsMedian":8.3,"frameMsP95":9.005,"droppedFrames":0,"gpuMsMedian":0.1085,"vsyncBound":true},{"label":"webgl-glass","frameMsMedian":8.3,"frameMsP95":9,"droppedFrames":0,"gpuMsMedian":0.1601,"vsyncBound":true},{"label":"css-blur","frameMsMedian":8.3,"frameMsP95":9.005,"droppedFrames":0,"gpuMsMedian":null,"vsyncBound":true,"gpuMsNote":"compositor — not measurable"},{"label":"css-displace","frameMsMedian":8.3,"frameMsP95":9.005,"droppedFrames":0,"gpuMsMedian":null,"vsyncBound":true,"gpuMsNote":"compositor — not measurable"},{"label":"css-rgb","frameMsMedian":8.3,"frameMsP95":9,"droppedFrames":0,"gpuMsMedian":null,"vsyncBound":true,"gpuMsNote":"compositor — not measurable"}]}
```

| Phase | What is measured                                                       |
| ----- | ---------------------------------------------------------------------- |
| A     | dispersion samples 1 / 3 / 8 → GPU ms, frame ms, added cost per sample  |
| B     | backdrop texture scale 1.0 / 0.5 / 0.25 → GPU ms, frame ms, VRAM        |
| C     | fringe: `spread` 0.00805 (physical) and 0.15 → max separation via `readPixels` |
| D     | five paths: baseline / webgl-glass / css-blur / css-displace / css-rgb  |

The contracts:

- **On CSS rows `gpuMsMedian` is always `null`**, with
  `gpuMsNote: "compositor — not measurable"` next to it. `backdrop-filter` is not
  our draw call; we cannot get a clock into it. Writing a number there would be
  worse than not measuring.
- **If `timerExt: false`** comes back, every `gpuMs*` field stays `null` and
  `msPerSample` is computed from the rAF delta; `msPerSampleMethod: "frame"`
  says so plainly.
- **The vsync ceiling is not assumed to be 60 Hz.** At the start of the run the
  display's real frame period is measured with an empty rAF window (`vsyncMs`),
  and each row's `vsyncBound` flag is set against it. On a 120 Hz display the
  ceiling is 8.3 ms; a fixed 16.7 ms threshold would wrongly count every row as
  "not bound".
- **The tab has to be in the foreground.** If
  `document.visibilityState !== "visible"`, the run is aborted and
  `MEASURE {"error":"hidden"}` is printed.
- The fringe quantization is `32 / 255 ≈ 0.125 px`; it is written into the JSON
  as `fringeQuantizationPx`. The measurement of the physical spread comes out
  just above that step — the instrument is coarse, and it says so.

The numbers are specific to the machine. The table in the article is the story
of a single machine.

## File layout

```
index.html                     stage + CSS panel + SVG filter defs + controls
src/
  main.ts                      bootstrap, controls, loop, ?measure=1 branch
  renderer.ts                  WebGL2 setup, FBO flow, panel draw
  measure.ts                   deterministic run list, MEASURE {json}
  hud.ts                       FPS / frame ms / GPU ms / coverage / VRAM
  gpu-timer.ts                 EXT_disjoint_timer_query_webgl2 wrapper
  gl.ts                        compile/link + error output with line numbers
  fbo.ts                       RGBA8 render target + CLAMP_TO_EDGE
  optics.ts                    refract / IOR / Abbe / Schlick — the GLSL twin
  sdf2d.ts                     sdRoundedBox / glassHeight / glassNormal twin
  displacement-map.ts          SVG feDisplacementMap map (pure generation)
  css-glass.ts                 filter binding + backdrop-filter mode + support test
  fringe.ts                    fringe decoding (R channel -> pixels)
  coverage.ts                  rounded rectangle area, coverage percent
  vram.ts                      byte math for the backdrop targets
  viewport.ts                  dpr clamp, scale, pixel budget
  stats.ts                     median + percentile
  style.css                    stage, the .glass rule, HUD, controls
  shaders/
    glass.frag.glsl            the whole glass (SDF + refract + dispersion + Fresnel)
    panel.vert.glsl            panel quad from gl_VertexID
    backdrop.frag.glsl         sharp-edged backdrop pattern
    blit.vert.glsl             fullscreen triangle from gl_VertexID
test/                          10 files, 84 tests (browserless)
```

## License

MIT — see `LICENSE`.
