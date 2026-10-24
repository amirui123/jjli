# Logistic-Mandelbrot: is it actually a better picture

- **Date:** 2026-09-11
- **Stage:** `91-logistic-mandelbrot-detail-adjudication`
- **Base:** `dev` at `1a4c7cb4`, i.e. cards 88 (`3600fdaa`) and 89 (`b5f8c6b6`) landed
- **Type:** adjudication. No behaviour changed, no code was touched. This card
  looks at the pictures.

## Headline

Mixed, and the mixed part matters.

**The zoom works.** It goes where you point it (1.88 px of drift on a feature
167 px off centre across a 2.46x zoom, where the old behaviour would have
carried that feature 244.7 px away), it stays where you put it (0.0000 drift
over 15 s, at the shipped defaults and with continuous spin off), and it keeps
looking like a surface as it closes — until the last stop.

**There is more detail in the bulbs and the swirls,** and it is real: the
cascade that used to be one flat grey comb is now period-coloured, so structures
that were indistinguishable are now distinguishable. That is the operator's
question answered yes.

**And the maximum-zoom frame is worse than what it replaced.** At the clamp
(`distance 0.35`) the cardioid sheet is no longer a stippled lattice you can see
structure through; it is a near-flat pale field with 76.2% of its pixels above
luma 200, against 0.012% before. The tan leaf and the fine swirl filigree that
were legible in card 87's frame 04 are gone from the frame at the identical
camera pose. Defect 3 was over-corrected: the stipple is fixed, and the fix has
introduced illegibility of the opposite kind at exactly the distance the
operator was complaining about. It is three seconds of scrolling away on the
shipped defaults, so it is not a corner case.

**The opening view is unchanged,** which is card 88's criterion 7 working as
designed, and also means a visitor who never touches the camera sees none of
this.

## Measurement conditions

All after frames come from one Chromium session on this machine,
`--use-angle=metal --enable-gpu`, viewport 1440x900 CSS at `devicePixelRatio` 1,
`prefers-reduced-motion: no-preference`, route `#/logistic-mandelbrot`, every
control at its kernel default except where a frame says otherwise. Frames are
downscaled to 1200 px wide from the 1440 px captures, which is card 87's own
processing; no other processing. Every after frame reported:

```
data-renderer               webgl2
data-render-size            2429x1518
data-simulation-renderer    gpu-orbit3d
data-orbit3d-sampler        gpu-sampled     <- the live GPU path, not a bake
data-orbit3d-boundary-detail active
data-orbit3d-point-budget   16000000
data-orbit3d-points         13359496        <- card 87 measured 13235784
```

The point count is up 123,712 (+0.93%) on card 87's reading at the same budget
and the same render size. Nothing here attributes that rise to a particular
change; it is recorded because it is the one build statistic that moved.

### Camera poses are matched with card 87's own instrument

Card 87 read the camera out of the view-projection matrix the app uploads, not
out of the DOM. This card used the same wrapper on
`WebGL2RenderingContext.prototype.uniformMatrix4fv`, pass-through and
argument-recording only, so the page runs the shipped bundle unmodified: row
four of `P * V` is `(f_x, f_y, f_z, distance)`, giving
`az = atan2(f_x, f_z)` and `el = asin(-f_y)` in card 87's convention, and the
distance in the `w` slot.

That instrument is what makes the comparison a comparison. The ambient orbit
advances azimuth continuously, so each after frame was held until the azimuth
came round to card 87's recorded value before the shutter, rather than shot when
the camera happened to be nearby. Where that meant waiting a full revolution at
`distance 0.35`, it waited. Every matched pair below agrees to within 0.0018 rad
of azimuth (0.10 degrees) and to the printed precision in elevation, and pairs
01, 02, 03, 04 agree exactly in distance.

### Two differences in conditions, stated rather than glossed

**Serving path.** Card 87 read a Vite dev server. These frames were captured
against `npm run build` output served by `vite preview`, because this worktree's
`node_modules` is a symlink into the primary checkout and the shared dependency
cache made the dev server issue a full page reload mid-capture — which silently
resets the camera, and did so on the first attempt. Two of five frames in that
attempt were written at `distance 5.09828` while the log claimed a zoom. The
capture now asserts the expected distance before it writes a PNG, and the
production bundle removes the reload entirely. Minification does not change
float arithmetic or shader source, so this is judged immaterial to the picture;
it is recorded because it is a difference from card 87's conditions.

**The sweep beam phase is not controllable.** The bright beam is driven by
elapsed time, not by the camera, and card 87 did not record its phase. It sits
in a different place in the before and after frames of pairs 01, 03 and 05. No
claim below rests on the beam, and the crops were chosen to avoid it.

## Frames

All in `docs/images/`. Before frames are card 87's, unmodified. Sampler path is
`gpu-sampled` (`data-orbit3d-sampler`) through `gpu-orbit3d` for every frame on
both sides, at `data-render-size 2429x1518` and point budget 16,000,000.

| pair | before (card 87) | after (this card) | parameters | before camera | after camera |
|---|---|---|---|---|---|
| 01 default opening view | `2026-09-11-logistic-mandelbrot-zoom-01-default-view.png` | `2026-09-11-logistic-mandelbrot-detail-after-01-default-view.png` | kernel defaults, no camera input since load, cascade reveal complete | `d = 5.09828`, `az = 0.6769`, `el = 0.4353` | `d = 5.098284025042152`, `az = 0.6756`, `el = 0.4353` |
| 02 maximum zoom-in | `2026-09-11-logistic-mandelbrot-zoom-02-max-zoom-in.png` | `2026-09-11-logistic-mandelbrot-detail-after-02-max-zoom-in.png` | kernel defaults; 25 wheel steps of `deltaY = -100` at the canvas centre, clamp saturated | `d = 0.35000`, `az = 0.6807`, `el = 0.4353` | `d = 0.35000`, `az = 0.6813`, `el = 0.4353` |
| 03 period-2 bulb close-up | `2026-09-11-logistic-mandelbrot-zoom-03-period-2-bulb.png` | `2026-09-11-logistic-mandelbrot-detail-after-03-period-2-bulb.png` | kernel defaults; reset camera, right-button pan of `(-79, -39)` CSS px, then 9 wheel steps of `deltaY = -100` at the canvas centre | `d = 1.32168`, `az = -0.6781`, `el = 0.4353` | `d = 1.3216801034368068`, `az = -0.6781`, `el = 0.4353` |
| 04 10 s after a zoom, no further input | `2026-09-11-logistic-mandelbrot-zoom-04-hold-10s.png` | `2026-09-11-logistic-mandelbrot-detail-after-04-hold-10s.png` | kernel defaults; zoomed to the clamp, then untouched | `d = 0.35000`, `az = 1.0240`, `el = 0.4353` | `d = 0.35000`, `az = 1.0249`, `el = 0.4353` |
| 05 the same, **non-default** | `2026-09-11-logistic-mandelbrot-zoom-05-spin-off-10s.png` | `2026-09-11-logistic-mandelbrot-detail-after-05-spin-off-10s.png` | **"Continuous camera spin" unticked**, every other control at its kernel default; zoomed to the clamp, then untouched | `d = 4.48252`, `az = -0.3795`, `el = 0.3053` | `d = 0.35000`, `az = -0.3813`, `el = 0.3061` |

Pair 05 is matched on inputs, on elapsed time and on viewing angle, and
deliberately **not** on distance, because the distance is the quantity being
measured: on dev the camera reeled itself back out to `4.48252` over 10 s and on
this tree it holds the `0.35000` the user chose. Everything else about that pair
is matched to within 0.0018 rad of azimuth and 0.0008 rad of elevation.

### Matched crops

Four 400x400 crops, cut from the matched frames above at identical rectangles in
the shared 1200x750 space, so each pair is the same region of the same pose.

| crop | cut from | rectangle | files |
|---|---|---|---|
| bulb ring at the opening distance | pair 01 | `(400, 300) 400x400` | `...-detail-crop-bulb-ring-before.png` / `-after.png` |
| cascade comb beside the period-2 bulb | pair 03 | `(180, 0) 400x400` | `...-detail-crop-bulb-closeup-before.png` / `-after.png` |
| swirl curtain at maximum zoom | pair 02 | `(800, 0) 400x400` | `...-detail-crop-cascade-curtain-before.png` / `-after.png` |
| sheet interior at maximum zoom | pair 04 | `(380, 110) 400x400` | `...-detail-crop-sheet-swirls-before.png` / `-after.png` |

All file names are prefixed `2026-09-11-logistic-mandelbrot`.

### Pixel statistics

Luma is Rec. 709 on the 1200x750 frame. `|lap|` is the mean absolute 4-neighbour
Laplacian, a scale-free texture measure. **Read `|lap|` with care:** the before
frames' dot lattice is itself high-frequency, so a high before-`|lap|` measures
stipple as readily as it measures structure. It is reported because its collapse
is the numeric signature of the sheet going opaque, not as a detail score.

| frame or crop | mean luma | % pixels > 200 | % pixels < 12 | mean \|lap\| |
|---|---|---|---|---|
| 01 default view | 14.39 -> 13.62 | 2.278 -> 1.728 | 82.216 -> 82.380 | 3.895 -> 4.001 |
| 02 max zoom-in | 42.07 -> 180.09 | 4.934 -> 41.223 | 27.344 -> 0.785 | 35.554 -> 2.746 |
| 03 period-2 bulb | 36.43 -> 96.95 | 2.500 -> 26.319 | 52.872 -> 34.796 | 12.895 -> 6.002 |
| 04 hold 10 s | 33.51 -> 202.66 | 0.012 -> 76.238 | 19.247 -> 0.062 | 40.050 -> 2.185 |
| 05 spin off 10 s | 12.40 -> 120.05 | 2.147 -> 25.124 | 80.374 -> 12.028 | 4.600 -> 3.000 |
| crop: bulb ring (01) | 65.53 -> 62.81 | 11.873 -> 9.526 | 23.211 -> 23.749 | 16.171 -> 16.488 |
| crop: cascade comb (03) | 34.16 -> 100.23 | 1.258 -> 23.303 | 58.189 -> 26.750 | 16.151 -> 8.920 |
| crop: swirl curtain (02) | 28.14 -> 112.46 | 3.134 -> 19.003 | 54.856 -> 4.348 | 18.512 -> 4.484 |
| crop: sheet interior (04) | 40.05 -> 220.44 | 0.000 -> 100.000 | 3.313 -> 0.000 | 37.111 -> 1.156 |

The single most telling row is the last: at maximum zoom, every pixel of a
400x400 window on the sheet interior is now above luma 200, where none of them
were before.

---

## Question 1: does the zoom work now?

**It goes where you point it. Yes.** Measured on this tree, not inferred from
the test. A world point at `(-0.55, 0.30, 0.20)` was projected through the live
view-projection matrix to screen `(859.3, 356.7)` — 167 px from the canvas
centre — the cursor was placed there, and six wheel steps of `deltaY = -100`
took the camera `5.098284 -> 2.072808`, a magnification of 2.4596x. The same
world point reprojected to `(860.5, 358.2)`: **1.88 px of drift**, most of it the
ambient orbit turning during the six-step gesture. Target-anchored behaviour, the
dev behaviour card 87 measured, would have carried that point 244.7 px across the
screen.

**It stays where you put it. Yes.** After that gesture and 15 s of no input, the
distance read `2.0728076013223196` — bit-identical, not merely within tolerance.
The ambient motion is alive and only the distance is pinned: pair 02 and pair 04
were both shot at `d = 0.35000` with the internal azimuth at 10.1061 and 10.4497
rad respectively, so the camera kept turning across that hold without the
distance moving at all. With continuous spin unticked, the
configuration card 87 measured going `0.35 -> 1.93 -> 4.48` over 10 s, this tree
read `0.35000` at +10 s and `0.35000` at +15 s. Pair 05 is that result as a
picture.

**It keeps looking like a surface as it closes. Partly, and it fails at the last
stop.** From the opening distance down to roughly the boundary-detail band the
answer is an unqualified yes, and pair 03 at `d = 1.32168` is the proof: the
sheet edge is a continuous opaque rim where card 87's frame at the same pose
showed a translucent dot lattice with moiré across it. But at the clamp the
sheet stops reading as a surface and starts reading as fog. The mechanism is
arithmetic, not opinion: `u_pointSize` is `2.2154` at this viewport
(`src/app/orbit3d.ts:3219`), `u_cameraZoomOffset` is `5.098284 - 0.35 = 4.748284`
(`:3221-3223`), and `gl_PointSize = clamp(baseSize * max(1, 1 + offset / w), 1.8,
32)` (`:215-216`). Every point nearer than eye-depth `w = 0.353` saturates the 32 px
ceiling, so the whole near face of the sheet is drawn as 32x32 splats — 13.36
million of them.

**Side taken: the zoom works.** Two of the three properties hold outright and
the third holds across all but the final stop of the clamp range. That is a
working zoom with a known endpoint defect, not a broken one.

## Question 2: is there more detail in the bulbs and swirls?

**Yes, in the cascade and the bulb skirts; no, on the interior of the sheet at
maximum zoom. On balance, more.**

The decisive evidence is the cascade-comb crop from pair 03 — same camera pose,
same distance `1.32168`, same 400x400 rectangle. In the before crop the cascade
above the bulb is a comb of grey and white spikes with a handful of pale leaves;
almost all of it is one value. In the after crop the same spikes are
individually coloured — teal, pink, mauve, olive, tan — and resolve into
distinct leaf and swirl shapes. That is not a denser picture of the same thing.
It is the same computed orbits, now classified instead of discarded: card 87
named this as defect 1, "every period above 7 is one flat grey", and card 89's
census moved the period-8 window from `{0: 2000}` to `{8: 1975, 16: 25}` and the
period-16 window from `{0: 2000}` to `{16: 1957, 32: 43}`. The crop is that
census showing up on screen. Structures that could not be told apart can now be
told apart, which is the only definition of "more detail" worth using.

The swirl-curtain crop from pair 02 says the same thing at maximum zoom: leaves
that were near-black silhouettes are now period-coloured, and material that sat
below the black point in the before crop (`54.9%` of it under luma 12, now
`4.3%`) is visible. Some of the gain there is defect 2's threshold change rather
than defect 1: `data-orbit3d-boundary-detail-opacity` read `0` at the opening
distance and `1` at `1.32168` and at `0.35`, where on dev's `0.9 / 0.95`
thresholds it would have read `0` at both. The 5x boundary tier is now actually
drawn at distances a user reaches.

Against that, the sheet-interior crop from pair 04 is a straight loss. The tan
leaf, the hairline swirls and the concentric rings that were legible through the
lattice are gone; the window is uniformly above luma 200. Some of what was lost
there was aliasing — the concentric rings are moiré between the sample grid and
the pixel grid, and losing them is a gain — but the leaf and the filigree were
structure, and they are no longer visible.

**Side taken: yes, there is more detail.** The gain is new information across
the cascade and the bulb skirts at every distance from the opening view inward;
the loss is confined to the interior of one sheet at one distance, and it is
occlusion by an over-large splat rather than information removed from the data.
The gain is larger, and it is of a better kind.

## Question 3: is it a better picture?

Separately from either answer above, and not because it is busier. The test used
here is whether a viewer can tell two things apart that they could not tell apart
before — not whether there is more on screen.

Pair by pair:

- **Pair 01, the opening view: not better, and not worse.** Mean luma 14.39 ->
  13.62, `|lap|` 3.895 -> 4.001, near-black area unchanged to a tenth of a
  percent. The bulb-ring crop is the same picture twice. The one visible change
  is that the bright cyan streaks above the cardioid have dimmed into coloured
  filigree. That is a hue change and not an energy change, which is worth being
  precise about because the opposite is the natural assumption: `v_energy` is
  `clamp(period / u_sampleCount, 0.02, 1.0)` (`src/app/orbit3d.ts:136-138`), and
  with `u_sampleCount` still 8 every period card 89 unlocked is `>= 8`, so the
  quotient saturates at `1.0` and those cells keep exactly the full energy they
  had as period-0 cells. What changed is that they stopped being painted the
  near-white period-0 grey `vec3(0.44, 0.47, 0.53)` (`:147-148`) and started
  taking a saturated period hue (`:89-98`), which carries less luma through the
  same accumulation. Honest reading:
  the opening frame lost its brightest accent and gained a little colour, and a
  visitor who never touches the camera sees no improvement at all.
- **Pair 03, the bulb close-up: clearly better.** Colour now carries period, so
  the cascade reads as a structured comb instead of grey hair.
- **Pair 05, spin off at the clamp: dramatically better,** and the best frame in
  the set — dense period-differentiated cascade against a still-black background,
  because at that viewing angle the sheet is edge-on and does not blanket the
  frame. It is also the frame the old build could not produce at all, since the
  camera reeled itself out before you could look.
- **Pairs 02 and 04, the clamp on the shipped defaults: worse.** Flat, pale,
  and with less to look at than the frame it replaced.

**Side taken: yes, it is a better picture — everywhere except the last stop of
the zoom, where it is worse than what it replaced.** The improvement is real and
it is of the right kind, and it sits in the middle of the range, which is where
the operator's question lives. The regression is equally real, it is reachable in
three seconds of scrolling from the default view, and it should be fixed before
this is shown to anyone as the answer to "more detail close up".

One thing the frames settle that is worth saying plainly: they **corroborate
card 87's "not a defect" finding on the sample pitch**, which is why card 90 was
retired. At the clamp the sheet is a smooth continuum, not a sample-limited
lattice. There are already more points than the splat size can draw without
merging them. A finer domain would put more points behind the same dots.

---

## Scorecard against card 87's ranked defects

| # | defect | verdict | evidence |
|---|---|---|---|
| 1 | Period window is 8 samples, so every period above 7 is one flat grey | **fixed** | Cascade-comb crop, pair 03, identical pose: grey/white comb -> individually period-coloured strands. Detection ceiling 7 -> 32; census `{0: 2000}` -> `{8: 1975, 16: 25}` and `{0: 2000}` -> `{16: 1957, 32: 43}`. Side effect in frame 01: former period-0 cells keep full energy (`clamp(q / 8, 0.02, 1.0)` saturates for every `q >= 8`, `src/app/orbit3d.ts:136-138`) but swap the near-white period-0 grey at `:147-148` for a saturated period hue at `:89-98`, so the opening view's brightest accent dims (% pixels > 200: 2.278 -> 1.728) |
| 2 | Boundary detail is maxed, and its 5x tier is hidden above `distance 0.9` | **fixed** | `data-orbit3d-boundary-detail-opacity` measured `0` at `d = 5.09828`, `1` at `d = 1.32168` and `1` at `d = 0.35000`; thresholds now `2.8 / 2.85` at `src/app/orbit3d.ts:645-646`. On dev's `0.9 / 0.95` the tier was at zero opacity in card 87's frames 03 and 02 alike. Visible as the extra fine filigree in the swirl-curtain crop |
| 3 | Point size is a screen-space constant with no depth term | **partly fixed, and over-corrected** | Stipple gone: sheet-interior crop, pair 04, goes from a full dot lattice to a continuous surface, and the moiré in card 87's frames 02 and 03 is absent. But the same crop goes from 0.000% to 100.000% of pixels above luma 200 and `\|lap\|` 37.111 -> 1.156; whole-frame 04 is 76.238% above luma 200. At `d = 0.35` every point nearer than eye-depth `0.353` saturates the 32 px ceiling at `src/app/orbit3d.ts:215-216`. The named defect is fixed; a new one of the same class is introduced at the same distances |
| 4 | Zoom is anchored on the orbit target, not the cursor | **fixed** | Measured on this tree: a feature 167 px off centre drifted 1.88 px across a 2.4596x zoom (`5.098284 -> 2.072808`). Target-anchored behaviour would have moved it 244.7 px |
| 5 | `syncCameraToSweep` pulls the camera back out with continuous spin off | **fixed** | Pair 05: card 87 measured `0.35 -> 1.93 -> 4.48` over 10 s in that configuration; this tree reads `0.35000` at +10 s and `0.35000` at +15 s, with the viewing angle still choreographed (`az -0.3813`, `el 0.3061`, against card 87's `-0.3795` and `0.3053`). At the shipped defaults the distance is bit-identical across 15 s idle |
| — | **Not a defect: the sample pitch itself** | **untouched, and the frames agree it should be** | Card 90 was retired unimplemented on this finding. Pairs 02 and 04 show the sheet as a smooth continuum at the clamp, not a sample-limited lattice, so the binding constraint is splat size, not cell count |

Card 87 ranked five defects. Three are fixed outright, one is fixed and
over-corrected, one is fixed. The item the audit explicitly declined to rank as a
defect stayed untouched and the frames support that call.

---

## Recommendation for what comes next

**One further card: cap the depth-scaled point size so the sheet stops going
opaque at the clamp.** Not done here; this card adjudicates.

The target is `src/app/orbit3d.ts:215-216` and the uniform feeding it at
`:3221-3223`. The growth term is linear in `1 / w` and reaches the 32 px ceiling
for everything nearer than eye-depth `0.353` at the clamp, which is the whole
near face of the sheet. A sub-linear term, a lower ceiling, or a depth-aware
alpha that lets a splat grow without also going fully opaque would all address
it; which one is the card's job to decide and to measure, because the ceiling has
to stay high enough to keep defect 3's fix — pair 03 and pair 05 are what would
be lost by simply reverting it.

Its acceptance criterion should be a re-shoot of pair 04 at `d = 0.35000`,
`az = 1.0240`, `el = 0.4353`, judged against both of that pair's existing frames:
the tan leaf and the swirl filigree legible again, as in card 87's before frame,
**and** no dot lattice, as in this card's after frame. The rig for that shot is
the one described under *Measurement conditions*, and the two reference frames are
already committed. A single number to gate on: whole-frame pixels above luma 200
back under about 20%, against 76.238% now and 0.012% before.

**This recommendation is not to turn on a windowed sample domain.** There is no
card 90 control to turn on — card 90 was retired unimplemented — and nothing in
these frames argues for reopening it. The evidence points the other way, as
recorded in the scorecard's last row.

A second, smaller thing, noted rather than recommended as a card in its own
right: card 88's verifier found that `playwright.config.ts` sets no
`launchOptions.args`, so the repo's own e2e harness runs WebGL2 sims without
`--use-angle=metal --enable-gpu` on this machine. This card hit the same wall
from the other side — every capture script here has to carry those flags by hand.
It belongs in whatever card touches the harness next.
