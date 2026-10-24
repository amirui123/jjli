# Audit: Inside-out spread colouring (stage 100)

Stage card: `docs/stages/100-logistic-mandelbrot-inside-out-spread-colouring.md`.
Decisions: `docs/audits/2026-10-02-orbit-spread-colouring.md`, "Decisions for
the implementation card". Worker: Claude Fable 5.1, 2026-10-03, run worktree on
`autometta/100-logistic-mandelbrot-inside-out-spread-colouring` from `dev`
at `44b70b90e`. Every command below ran in the foreground from the run
worktree. Evidence paths are under the git-ignored
`e2e/artifacts/inside-out-spread/`.

## What was built

- **Scalar.** Every bounded cell carries its centre height h0(c) and its
  spread. `sampleAttractorCell` (`src/sims/logistic-mandelbrot/model.ts`)
  measures both in the same walk as the multiplier, from the end of the plot
  window: exactly q iterates for a detected period q (an exact cycle mean), or
  `SPREAD_WINDOW_ITERATIONS` = 1024 iterates when no period is detected
  (audit decision 1). The spread is the RMS deviation about the centre
  (decision 4), accumulated with Welford's update so a near-constant orbit's
  spread does not cancel to float noise. Plotted samples, period, escape
  classification and the multiplier are untouched; the multiplier loop simply
  gained two accumulators. An escaped cell zeroes the measure.
- **Colour.** `src/app/orbitColour.ts` exports
  `spreadPaletteCoordinate(height, centre, bands, phase)` =
  fract(bands·|height − centre| − phase) and its GLSL twin, spliced into the
  point, sheet and ground shaders (three call sites, one definition). The
  stage 98 multiplier mapping, its clamp and the steady neutral constant are
  gone from the module and from every shader source. `classifyAttraction`
  and its three constants stay: the field still records escaped / resolved /
  unresolved, and only the escaped class changes what is drawn.
- **Points and sheets.** The `a_interior` vertex attribute became
  `a_centre`: the live cloud and the hybrid sheets upload each point's column
  centre, and the Inside-out branch reads the palette at the spread
  coordinate of the vertex's own height (`position.z` for points,
  `a_position.z` for the sheet). Bounded cells with no period are coloured the
  same way; the neutral branch is deleted. Cycle, Period and Mono branches
  are untouched. The hybrid sheet's per-vertex scalar channel
  (`OrbitSurfaceCells.interiors`, a pass-through in `orbitSurface.ts`, which
  this card could not edit) now carries the centre; the orbit3d-local
  `interiors` array still holds the multiplier for the analytic component
  catalogue. Where the analytic classifier replaces a cell's window with the
  exact cycle, the centre and spread are recomputed from that cycle
  (`measureCycleSpread`).
- **Ground.** The attraction field texture is RGBA32F per ground texel:
  (centre, spread, classification, period). The ground shader colours every
  bounded texel at `spreadPaletteCoordinate(spread, 0, bands, phase)` =
  fract(bands·spread − phase) and leaves escaped texels on the escape-time
  texture. Cache rules are unchanged from stage 98: keyed on
  `warmupIterations:sampleCount`, released and rebuilt only when those
  change, never for time, palette, reverse, exposure, bands or geometry
  (`data-orbit3d-attraction-builds` stays at 1 through all of criterion 6).
  The 1024-iterate window is a constant, not a parameter, so it does not
  join the key.
- **Docs.** `colourMode` and `cycleBands` info strings and the essay describe
  the mode as it now is, including that a period-1 sheet sits at distance
  zero and takes one colour that changes with the phase.

## GPU channel decision

The period shader's metadata target was RGBA32F with x = period, y =
multiplier, z = escape flag, w unused. The escape flag now shares the period
channel as a negative sentinel (x = −1 for an escaped or out-of-range cell,
mirroring the CPU sampler's `ESCAPED = −1`), which frees z for the centre and
w for the spread. The alternative, a second render target, would have added
one RGBA32F texture of the sampler's size (up to 16 MB at the cloud's
1024×1024 base grid), a second attachment on every period pass and a second
`readPixels`. Measured cost of the chosen layout: zero extra VRAM, no extra
readback; the readback loop gained one branch per cell. The sampler's
per-cell work rose by the 1024-iterate window on unresolved cells only,
which card 99 priced at +4.4% of sampler iterations; the measured build
times are in "Cost" below. The spread window is a uniform
(`u_spreadWindow`) rather than a literal so the loop compiles like the
warmup loop.

Float32 precision: the renderer stores the centre in a float32 texel and the
shader sums in float32 with Welford's update; the measured GPU centre at
c = −1.9 is within 0.0165 of the 10^6-iterate float64 reference, inside the
estimator's own 0.0763 worst case (audit A2).

## CPU and GPU agreement on the centre

`centre-samples.json` (production GPU sampler in the page, production CPU
sampler in node, both at warmup 1500 and 8 samples; expected values are
closed forms, one float64 cycle after 3000 iterates for the 1/3 bulb, or a
10^6-iterate float64 run for c = −1.9):

| Cell | Expected centre / spread | CPU | GPU | Tolerance |
|---|---|---|---|---|
| c = 0 (q = 1) | 0 / 0 | 0.00000 / 0.00000 | 0.00000 / 0.00000 | 1e-3 |
| c = −0.5 (q = 1) | −0.36603 / 0 | −0.36603 / 0.00000 | −0.36603 / 0.00000 | 1e-3 |
| c = −1 (q = 2) | −0.5 / 0.5 | −0.50000 / 0.50000 | −0.50000 / 0.50000 | 1e-3 |
| c = −0.8 (q = 2) | −0.5 / 0.22361 | −0.50000 / 0.22361 | −0.50000 / 0.22361 | 1e-3 |
| 1/3 bulb centre (q = 3) | −0.26164 / 0.28773 | −0.26164 / 0.28773 | −0.26164 / 0.28773 | 1e-3 |
| c = −1.9 (no period) | −0.39149 / 1.16415 | −0.38690 / 1.16642 | −0.37503 / 1.17672 | 0.1 vs reference, 0.16 CPU vs GPU |
| c = 1 | escaped | escaped | escaped | flag, not centre |

Periodic cells agree between paths to better than 1e-5. The chaotic column's
CPU and GPU centres differ by 0.0119 (0.0178 lap at 1.5 bands) and its
spreads by 0.0103, inside the audit's 0.16 bound for two independent
1024-iterate estimates; against the reference the CPU centre is 0.0046 off
and the GPU centre 0.0165 off (bound 0.1). The ground field
(`attraction-texels.json`, read at the actual texel centres and compared
with the CPU sampler at those centres) agrees the same way: periodic texels
to 1e-5, the chaotic texel at Re = −1.89893 within 0.0234 on the centre and
0.0181 on the spread. Along Im(c) = 0 all 307 cardioid texels have spread
below 1e-3 and all 164 period-2 texels between Re = −1.24 and −0.76 have
centre −0.5 and spread sqrt(−(Re(c) + 3/4)) within 1e-3.

## Cost against the unchanged baseline

Same headless Chromium (Metal ANGLE), 1280×720, Extreme profile as loaded,
cloud geometry, Inside-out at speed 0.1, 7,419,976 points on both trees.
The baseline is the unchanged tree (`git archive HEAD` at `44b70b90e`)
served on port 5174 as described under "Serving the baseline". Three matched
samples each: cloud build is wall-clock from navigation to
`data-orbit3d-build="complete"` on three fresh page loads, field build is the
renderer's `data-orbit3d-attraction-build-ms` on each load, and render
timing is three runs of 90 requestAnimationFrame intervals on the last load.
`render-timing.json` holds the run that is cited; the earlier standalone
grep run (`logs/controls-and-cache.log`) is quoted for the spread.

| Measure | Baseline (full-spec run) | Current (full-spec run) | Baseline (grep run) | Current (grep run) |
|---|---|---|---|---|
| Cloud build ms | 676, 666, 674 (median 674) | 850, 741, 716 (median 741, +10%) | 747, 676, 678 (median 678) | 633, 647, 673 (median 647, −5%) |
| Field build ms | 53.4, 50.7, 53.1 (median 53.1) | 58.3, 57.6, 59.3 (median 58.3, +10%) | 52.6, 54.3, 51.8 (median 52.6) | 53.9, 54.5, 56.6 (median 54.5, +4%) |
| Render median ms | 53.5, 53.7, 53.5 | 53.5, 53.5, 53.5 (0%) | 53.4, 53.4, 53.3 | 53.4, 53.4, 53.4 (0%) |

The field build, which is purely the GPU sampler over 699,392 texels plus
readback and upload, moved by +4% to +10% across the two runs against card
99's +4.4% prediction; the cloud build, which also includes JS reservoir
and buffer work, swung from −5% to +10% between runs, so its difference is
within run-to-run noise. Render time is unchanged: the per-vertex work is one
`abs` and one subtraction more than before and the ground reads one texel
either way. Nothing approaches the 20% bar and no quality setting changed.

## Commands and results

| Criterion | Command | Result |
|---|---|---|
| 1 red baseline | `npm run build:test && ORBIT_SPREAD=1 node --test src/app/orbitSpread.contract.test.cjs` on the unchanged tree | 1 pass, 6 fail: `spreadPaletteCoordinate is not a function` ×2, `NaN is not within` for the centre at the period-1, period-2, period-3 and no-period cells; the escaped-cell test passed. Matches the card's authoring verification. |
| 1 regression | `npm run verify` | typecheck, 388 tests (381 pass, 7 skipped frozen, 0 fail), build: green. `logs/verify.log` |
| 1 gate | `scripts/check-contract-test-gate.sh --worktree` | exit 0 |
| 1 frozen unit contract | `npm run build:test && ORBIT_SPREAD=1 node --test src/app/orbitSpread.contract.test.cjs` | 7 pass, 0 skipped, 0 fail |
| 1 frozen e2e contract | `INSIDE_OUT_CYCLING=1 npx playwright test e2e/inside-out-cycling.contract.spec.ts --workers=1` | 4 pass, 50.0 s; motion 6.29 (cloud) and 2.19 (hybrid) at speed 0.1, 0 at speed 0. `logs/contract-run.log` |
| 1 smoke | `npx playwright test e2e/smoke.spec.ts --grep 'logistic-Mandelbrot\|cyclic Magma\|Magma\|magma' --workers=1` | 6 pass, 40.1 s, none skipped. `logs/smoke.log` |
| 2 | `npx playwright test e2e/inside-out-cycling.spec.ts --grep 'centre' --workers=1` | 2 pass (`logs/centre.log`, run together with `multiplier`: 3 pass). `centre-samples.json`, `attraction-texels.json`, `attraction-field-planes.png` |
| 3 | `--grep 'spread'` | 2 pass. `spread-lookups.json` (38 probe cases, every Inside-out case within 1/255 of the oracle), `real-route-period2-sheets.{json,png}` (sheets over c = −1 at z = 0 and z = −1: hues −63.8° and −50.4°, 13.4° apart, both lit and chromatic, same coordinate 0.75). `logs/spread-phase.log` |
| 4 | `--grep 'phase and ground'` | 3 pass. `phase-lookups.json` (96 cases over phases 0, 0.25, 0.5, 1 × both directions × point, sheet, ground; max channel error 0.5/255; ground fed with real field texels at their centres: cardioid Re = −0.19971 spread 0, bulb (−1.04932, 0.09961) spread 0.55442, chaotic Re = −1.89893 spread 1.16115; the cardioid texel reads the palette at fract(−phase) at every phase), `ground-real-route-speed0.{json,png}` (speed 0, pre-ink ground: four cardioid texels one hue, −49.4° against the coordinate-0 hue −53.9°; the period-2 bulb texel differs), `ground-exterior-comparison.json`, `ground-diagnostic-{inside-out,period}.png` (three exterior pixels identical between modes and lit, two differing exterior escape times, two interior period-2 pixels differing by 100+ per channel). `logs/spread-phase.log` |
| 5 | `--grep 'chaotic'` | 1 pass. `chaotic-lookups.json`: c = −1.9 reads period 0, bounded, centre −0.37503 from the production sampler; 30 point and sheet probes at period 0 over five heights and three phases all within 1/255 of the oracle, none within 6/255 of the old neutral, at least three mutually distinct colours across heights and a phase-dependent colour at every height; the production shader sources contain no `INSIDE_OUT_NEUTRAL` or `insideOutCoordinate` and at least four occurrences of `spreadPaletteCoordinate(` (three calls plus the spliced definition). `logs/spread-phase-chaotic.log` |
| 6 | `--grep 'controls and cache'` | 2 pass, 1.2 min. `controls-*.png`, `render-timing.json` (see "Cost"). `logs/controls-and-cache.log` |
| 7 | `--grep 'direction of travel'` | 4 pass. `reverse-sequence/` (see below). `logs/direction-of-travel.log`, `logs/direction-of-travel-curtain.log` |
| all | `npx playwright test e2e/inside-out-cycling.spec.ts --workers=1` | 15 pass, 2.8 min, `logs/spec-run.log` (unchanged baseline served on 5174 for the timing test) |

### Serving the baseline

Playwright's config reuses whatever already listens on port 5173, so a run
only measures the tree that server serves. The timing test's baseline is the
unchanged tree unpacked with `git archive HEAD` (at `44b70b90e`) into the
ignored `build/inside-out-100-baseline/`, with `node_modules` symlinked from
the run worktree, served by `npx vite --port 5174 --strictPort` from that
directory inside a detached tmux session (`inside-out-100-baseline`) so no
shell command stayed outstanding:

```sh
rm -rf build/inside-out-100-baseline && mkdir -p build/inside-out-100-baseline
git archive HEAD | tar -x -C build/inside-out-100-baseline
ln -s "$(pwd)/node_modules" build/inside-out-100-baseline/node_modules
tmux new-session -d -s inside-out-100-baseline \
  "cd $(pwd)/build/inside-out-100-baseline && npx vite --port 5174 --strictPort"
curl -s http://localhost:5174/src/app/orbit3d.ts | grep -c insideOutCoordinate   # 3 = baseline
grep -c insideOutCoordinate src/app/orbit3d.ts                                     # 0 = current
tmux kill-session -t inside-out-100-baseline                                       # when done
```

Before every timing run the two trees were told apart by that count. The
session was left running at the end of the worker phase so the verifier can
reuse it; `lsof -t -iTCP:5174 -sTCP:LISTEN` finds the server if the session
is gone.

### Criterion 7: direction of travel (`reverse-sequence/`)

Four views, each four frames one second apart forward then reverse, palette
cyclic Magma, 1.5 bands, speed 0.1, camera parked (azimuth and distance
asserted identical on every frame). `<view>-sequence.json` records the
production phase per frame and the coordinate of a fixed distance of 0.5
from a column's centre:

| View | Frames | Camera (azimuth, distance) | Forward phase | Reverse phase | Forward coordinate steps | Reverse coordinate steps |
|---|---|---|---|---|---|---|
| cloud, default view | `cloud-default-{forward,reverse}-{0..3}.png` | 2.4635, 5.098 | 0.196 → 0.624 | 0.247 → 0.818 (wrapping down) | −0.139, −0.144, −0.145 | +0.140, +0.145, +0.144 |
| hybrid, default view | `hybrid-default-*.png` | 2.4635, 5.098 | 0.543 → 0.881 | 0.971 → 0.633 | −0.109, −0.114, −0.114 | +0.108, +0.115, +0.114 |
| "Bifurcation curtain" preset | `bifurcation-curtain-*.png` | 3.1808, 3.7 (side pose) | 0.438 → 0.830 | 0.067 → 0.675 (wrapping down) | −0.129, −0.130, −0.133 | +0.127, +0.130, +0.135 |
| period-2 bulb with ground (dolly ×4 toward c = −1) | `period2-bulb-ground-*.png` | 2.4635, 2.798 | 0.265 → 0.672 | 0.202 → 0.788 (wrapping down) | −0.128, −0.138, −0.141 | +0.136, +0.138, +0.140 |

A fixed colour sits at distance (coordinate + phase)/bands, so a falling
coordinate at fixed distance means the colour moves to larger distance,
away from each column's centre in both directions, and reverse brings it
back. Frame-to-frame OKLab motion is 0.94 to 8.38 per step (threshold 0.3)
and every sequence sums above 1. The verifier records from the frames
whether bands leave each column's centre upward and downward in forward
mode and return in reverse, whether the chaotic band carries colour, and
whether the ground stays subdued; from the worker's own look at
`bifurcation-curtain-forward-0.png` the chaotic section of the curtain shows
horizontal colour bands stacked up its height while the period-1 and
period-2 sheets read as one pale tone each, and in
`period2-bulb-ground-forward-0.png` the ground stays dark with a dim flat
tint under the cardioid.

## Changes outside the seven named deliverables

None. The allowed supporting files (`simView.ts`, `controls.ts`,
`tsconfig.test.json`, `kernel.test.cjs`, `gpu-parity.test.cjs`) did not
need editing: `orbitColour.ts` was already in the test build's include list,
and the kernel test's measure object gains the new fields when the sampler
writes them. `orbitSurface.ts` is untouched; its `interiors` channel is used
as the per-vertex scalar pass-through described above.

## Stage 98 tests retired or rewritten (audit section G)

- `src/app/orbitColour.test.cjs`: the multiplier coordinate, its clamp test
  and the GLSL regex are replaced by seven tests of
  `spreadPaletteCoordinate` (arithmetic, loop closure without clamp, mirror
  and shift invariance, forward travel to larger distance, the ground's
  zero-centre form), the classification test now states both bounded
  classes are coloured, and the GLSL test pins the new expression and
  rejects any clamp or neutral.
- `e2e/inside-out-cycling.spec.ts`: "point and sheet palette colour ignores
  height and follows the multiplier" and "point, sheet and ground palette
  lookups follow fract(bands*m − phase)" are retired; "the ground attraction
  field classifies and measures at its texel centres" is rewritten around the
  centre and spread; the unresolved-neutral probe in "exterior ground keeps
  escape-time colouring" now expects palette colour. "CPU and GPU production
  sampling recover the analytic cycle multipliers", "two sheets over a
  period-2 point share hue in the real route" (now at c = −1, where the
  agreement is exact), "the shared phase reverses sign once and pins at
  speed zero", the controls test, the timing gate (widened to cloud and
  field build times) and the direction-of-travel tests (widened to four
  views) are kept in substance.

## Limitations and open points

- **Palette flatness.** The shipped cyclic Magma at gamma 1.65 and contrast
  2.4 is one colour, (40, 16, 60), for coordinates outside about
  [0.14, 0.56] of the lap, so only about 40% of each lap is visible as a
  band and the rest reads as the seam colour. The tests therefore assert
  coordinates everywhere and colours only inside that band. This is the
  default the card keeps; the interestingness run that follows owns any
  retune.
- **Crisis seams.** The exact centre jumps at the chaotic band's own crises
  (audit B, 16 seams above 5% of a lap on the antenna); they show as
  vertical lines in the curtain and are not smoothed here, per the card.
- **Prebaked clouds.** The ELPC v1 bake format carries no column centre, so
  a prebaked cloud binds `a_centre` as a constant 0 and Inside-out there
  bands by |height|. No bake exists in this checkout; the bake script was
  out of scope.
- **Real-route ground exactness.** With the cloud drawn, a ground pixel's
  view ray crosses sheets over other c, so the 2/255 ground checks run on
  the production ground program fed with the renderer's own field texels at
  their actual centres; the live-page checks at speed 0 are hue-level (the
  cardioid one colour at the coordinate-0 hue, the bulb different).
- **Timing noise.** The cloud build figure includes JS work and varied by
  ±10% between two runs of the same comparison; the render figure sits on
  the frame interval of 53 ms and did not move.
- **CPU fallback.** The ground field's CPU path and the CPU cloud build
  were not exercised in a browser (every run had the GPU sampler); both use
  the same `sampleAttractorCell` measure the frozen contract covers.
- **Preset reset.** Applying a kernel preset through the controls restores
  every kernel default first, including auto-rotate; the curtain sequence
  re-parks the camera after selecting the preset. That is existing control
  behaviour, not changed here.
