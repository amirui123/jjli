# Logistic-Mandelbrot: letting a splat grow without going opaque

- **Date:** 2026-09-11
- **Stage:** `92-logistic-mandelbrot-point-size-cap`
- **Base:** `dev` at `972de52f`, i.e. cards 88, 89 and 91 landed
- **Change:** one coherent change to the point pass in `src/app/orbit3d.ts`:
  the depth growth of a splat and the intensity it keeps while it grows.

## Headline

The near face of the sheet at the zoom clamp goes from 76.238% of the frame
above luma 200 to **0.007%**, and the sheet-interior crop from 100.000% to
**0.000%**, with no dot lattice: the crop's mean absolute Laplacian reads
3.155, against 37.111 for card 87's stippled frame and 1.156 for card 91's
blown-out one. The tan leaf and the swirl filigree are back.

## The shape chosen, and why

**Square-root growth with the splat's flux conserved.** Two lines of the point
vertex shader and one multiply in the point fragment shader.

Card 91 named three candidates. The measurement that decided between them is
that the 32 px size is not, on its own, the wrong number. Linear growth in
`1 / w` holds a splat's *world* size fixed, so the ratio of splat width to
sample pitch is the same at the clamp as at the opening view. The frame went
pale for a different reason, and it went blurry for a third:

- **Brightness.** The point pass blends `ONE, ONE` into a canvas created with
  `alpha: false`, so a splat's contribution is whatever light its fragments
  emit, summed. Holding the per-pixel intensity constant while the footprint
  grows 209x multiplies the light the sheet emits by 209. That is the
  saturation, and it is arithmetic, not sampling. It also disposes of the
  "depth-aware alpha" candidate in the form the card offered it: the alpha
  channel never reaches the screen, so the only way for a splat to go less
  opaque is to emit less.
- **Blur.** At the opening distance the samples are denser than the pixel
  grid, so a 2.2 px splat already over-covers its neighbours several times
  over. Scale-invariant growth preserves that over-coverage exactly, which is
  invisible while the splat is a dot and is a 16 px blur kernel in the saved
  frame once the same ratio means 32 px. The operator's reading of the clamp
  screenshot as a gaussian blur is the correct one.

So the fix treats the two separately:

```glsl
const float POINT_GROWTH_EXPONENT = 0.5;
const float POINT_FLUX_EXPONENT = 2.0;

float sizedPoint = clamp(baseSize * pow(max(1.0, depthScale), POINT_GROWTH_EXPONENT), 1.8, 32.0);
float footprintGain = max(1.0, sizedPoint / unzoomedSize);
v_spread = pow(footprintGain, -POINT_FLUX_EXPONENT);
```

with the fragment stage multiplying its accumulated light by `v_spread`.

A flux exponent of 2.0 is exact conservation: a splat twice as wide is a
quarter as bright per pixel, so the sheet emits the same light whatever the
camera distance. That is also the physically correct law, since the apparent
surface brightness of an emitting surface does not depend on how far away it
is. It makes the photometry of the point pass zoom-invariant, which is why the
gate lands at 0.007% rather than somewhere just under it: there is no tuned
constant holding it there.

The growth exponent is where the measuring went. The sample pitch in card 87's
before crop reads 2 px (x) and 4 px (y) in the 1200-wide frame from its
autocorrelation peaks, i.e. 4 to 8 device pixels at the clamp. Square-root
growth puts the splat at `2.2154 * sqrt(14.45) = 8.42` device pixels there,
still a little wider than the pitch it has to close and about a quarter of the
32 px it was. The 32 px ceiling is kept as a backstop and is no longer the
operative term: reaching it now needs a magnification of 209x, and the clamp
offers 14.45x.

A lower ceiling on its own was rejected on the arithmetic above. It leaves the
flux term untouched, so a 12 px ceiling still accumulates roughly 30x the light
of the unzoomed splat while giving back part of card 88's fix.

## Measurement conditions

Card 91's rig, unchanged: one Chromium session on this machine with
`--use-angle=metal --enable-gpu`, viewport 1440x900 CSS at `devicePixelRatio`
1, `prefers-reduced-motion: no-preference`, route `#/logistic-mandelbrot`,
production bundle over `vite preview`, every control at its kernel default,
frames downscaled to 1200 px wide. The pose is read from the view-projection
matrix through card 87's instrument (a pass-through wrapper on
`uniformMatrix4fv`; row four of `P * V` is `(f_x, f_y, f_z, distance)`), and
each frame is held until the ambient orbit brings the azimuth back to the value
the matched frame recorded. Every frame below reported `data-orbit3d-sampler
gpu-sampled`, `data-render-size 2429x1518`, `data-orbit3d-points 13359496` and
`data-orbit3d-point-budget 16000000`, the same readings card 91 recorded.

The luma statistic is card 91's: Rec. 709 luma on the 1200x750 frame, and the
same `(380, 110) 400x400` sheet-interior crop. The measurement code was checked
against card 91's committed frames before it was used on new ones, and
reproduces its published figures to the printed digit. Shooting card 91's pair
04 on this rig **before** the change read 76.632% above luma 200 whole-frame
and 100.000% on the crop, against its published 76.238% and 100.000%, so the
rig is the same rig.

## Frames

| frame | pose | file |
|---|---|---|
| 04, 10 s after a zoom to the clamp | `d = 0.35000`, `az = 1.0232`, `el = 0.4353` | `docs/images/2026-09-11-logistic-mandelbrot-point-size-04-hold-10s.png` |
| the same, sheet-interior crop | `(380, 110) 400x400` | `docs/images/2026-09-11-logistic-mandelbrot-point-size-crop-sheet-swirls.png` |
| 01, default opening view | `d = 5.09828`, `az = 0.6744`, `el = 0.4353` | `docs/images/2026-09-11-logistic-mandelbrot-point-size-01-default-view.png` |
| 03, period-2 bulb close-up | `d = 1.26538`, `az = -0.6780`, `el = 0.4353` | `docs/images/2026-09-11-logistic-mandelbrot-point-size-03-period-2-bulb.png` |

The pair-04 pose is the card's target `d = 0.35000`, `az = 1.0240`,
`el = 0.4353` to within 0.0008 rad of azimuth, inside card 91's own 0.0018 rad
tolerance and nearer the target than card 91's own after frame (1.0249). The
distance is the clamp exactly, not a little further out.

## The numbers

Whole frame, then the sheet-interior crop, against both references.

| frame or crop | card 87 before | card 91 after | this card |
|---|---|---|---|
| 04 whole frame, % pixels > 200 | 0.012 | 76.238 | **0.007** |
| 04 whole frame, mean luma | 33.51 | 202.66 | 41.85 |
| 04 whole frame, mean \|lap\| | 40.050 | 2.185 | 4.444 |
| crop, % pixels > 200 | 0.000 | 100.000 | **0.000** |
| crop, mean luma | 40.05 | 220.44 | 47.17 |
| crop, mean \|lap\| | 37.111 | 1.156 | **3.155** |

The gate is 20% of the frame above luma 200. The frame reads 0.007%.

Continuity, numerically rather than by eye: the crop's autocorrelation decays
monotonically over 24 lags in both axes, as card 91's no-lattice reference does.
Card 87's crop has local maxima at lag 2 in x (209.7 against 170.6 at lag 1)
and lag 4 in y (193.0), which is the lattice. Nothing periodic survives in the
new crop, and its `|lap|` of 3.155 sits between card 91's continuous 1.156 and
well below the 10 the card calls the continuity line.

## The other two distances

**The default view does not move, by construction.** `u_cameraZoomOffset` is
`max(0, 5.098284 - distance)`, which is 0 at the opening distance, so
`depthScale` is 1, `footprintGain` is 1 and `v_spread` is 1: every splat is
the splat card 88 shipped, at the size and brightness it shipped. The re-shot
frame reads 2.328% of pixels above luma 200 against card 91's 1.728%, a
difference of 0.600 percentage points inside the card's 1-point tolerance, and
the residue is the sweep beam, whose phase card 91 recorded as not
controllable. Mean luma 14.49 against 13.63, `|lap|` 3.580 against 4.001.

**The intermediate view keeps card 89's colour and loses card 91's wash.** The
period-2 bulb close-up shot at `d = 1.26538` (nine wheel steps landed 4.3%
nearer than card 91's `1.32168`, which makes it the slightly harder test of the
two) reads 0.089% above luma 200 and mean luma 33.54, against card 91's 26.319%
and 96.95 at that pose. The picture is the one card 91 praised without the
part it complained about: the cascade comb is still individually period
coloured, the bulb rim is still a continuous sheet rather than a dot lattice
with moiré, and the hues are saturated teal, tan and mauve instead of washed
toward white. It is close to card 87's brightness at that distance (mean 36.43)
with card 89's classification, which is what conserving the flux predicts.

## What the frame looks like

Judged by eye against card 87's frame at the same pose: the tan leaf at the top of the frame is there with its shading, the
hairline swirl filigree along the sheet is there, the cascade beyond the sheet
edge is period coloured, and the sheet reads as a continuous translucent
surface rather than either a dot lattice or a pale field. What is gone from
card 87's frame is the concentric ring pattern across the sheet interior, which
card 91 identified as moiré between the sample grid and the pixel grid; losing
an aliasing artefact by drawing a continuous surface is the intended outcome
of card 88, not a loss of structure.

## What this does not do

The clamp frame is dimmer than card 91's, because conserving the flux makes it
so. If a brighter near face is wanted for its own sake, the knob is
`POINT_FLUX_EXPONENT` below 2.0, which brightens the near field while leaving
everything at the opening distance untouched; 1.8 was measured at 45.73 mean
luma and 0.007% above 200, i.e. still nowhere near the gate. It was not taken,
because zoom-invariant surface brightness is a rule that needs no tuning and
the frame is legible without it.

## The regression assertion, and the harness it runs on

`e2e/smoke.spec.ts` gains one test beside card 88's zoom test: zoom to the
clamp, screenshot the canvas, and require fewer than 25% of its pixels above
luma 200. The gate is 20% with margin, and it discriminates by a wide margin:
the same rig read 76.632% on this tree before the change and 0.007% after.

Two things the test has to do to be stable are worth recording. It pauses
before the shutter, because a frame drawing 13 M points takes long enough that
an element screenshot waits for stability it never reaches; the paused canvas
keeps the last composited frame, which is the one being measured. And it reads
the frame back on a blank second page, because the sim page's main thread
starves an in-page histogram for the same reason.

The test passes under the repo's Playwright config, against both the dev
server and the production bundle. Card 88's two zoom tests, untouched by this
card, are flaky in this worktree at roughly one run in two, in both serving
paths and in both directions: the failure is always the canvas element going
away mid-test (`Execution context was destroyed`, or the locator never
resolving again), never an assertion about the camera. Each of them was
observed passing on this tree. That is the harness gap card 88's verifier and
card 91 both flagged, `playwright.config.ts` setting no `launchOptions.args`
where WebGL2 on this machine wants `--use-angle=metal --enable-gpu`, and it
belongs to the harness card card 91 recommended rather than to this one.

## Attempt 2: the harness gap closed

Attempt 1's e2e assertion (above) was correct but only passed when the
verifier launched Chromium by hand with `--use-angle=metal --enable-gpu`; run
exactly as `npx playwright test e2e/smoke.spec.ts` against the checked-in
config, which set no `launchOptions.args`, Chromium fell back to SwiftShader
and the same pose read 40% of the frame above luma 200 against the 2% the
GPU path measured, failing the 20% gate. `playwright.config.ts` now sets
`use.launchOptions.args` to `["--use-angle=metal", "--enable-gpu"]`, guarded
on `process.platform === "darwin"` so a Linux CI runner is not handed a Metal
flag. No shader, threshold, frame or figure above changed for this attempt.
With the flag in place, `npx playwright test e2e/smoke.spec.ts` run against
the repo config passes this card's regression test and card 88's zoom test
(`spin=true` outright; `spin=false` after a re-run, the same pre-existing
canvas-teardown flake documented above, reproduced here in isolation as a
15.6-minute run that timed out during teardown and passed cleanly in 16.4s on
retry). One other test in the file, `Kuramoto defaults to the softened
cyclic phase palette`, fails identically with and without the new flags
(`.controls__colour select` not found) and is unrelated to this card's
change.
