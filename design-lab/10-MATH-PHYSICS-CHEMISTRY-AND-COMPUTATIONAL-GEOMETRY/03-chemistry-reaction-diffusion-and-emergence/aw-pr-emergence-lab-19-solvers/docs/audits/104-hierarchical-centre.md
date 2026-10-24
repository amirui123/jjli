# Audit: hierarchical Inside-out centres (stage 104)

Stage: `docs/stages/104-logistic-mandelbrot-hierarchical-centre.md`.
Worker: Claude Fable 5.1, 2026-10-07, attempt 4, resumed from attempt 3's
preserved tree `909dacedc0e27b91de87f5e39bc08db1d6756c77` (itself attempt 2's
implementation plus a partial draft of this audit). The implementation diff
was reviewed against `b6a4f9c6d` (card 103's landing) rather than re-derived;
this attempt changed only the evidence pose in `e2e/inside-out-cycling.spec.ts`
and rewrote this audit. Every number and path below was generated again in
this attempt. Paths beginning `e2e/artifacts/hierarchical-centre/` and
`logs/` are git-ignored evidence in the run worktree, not tracked deliverables.

## Rule and data paths

`cycleHierarchy(heights, p)` in `src/app/orbitHierarchy.ts` enumerates every
divisor s >= 2 of p. The group of cycle index k is {k + j p/s mod p : j < s},
its parent is the group's mean height, and a proposal's cost is the mean over
k of (h_k - parent(k))². The smallest cost wins; costs within 1e-12 relative
go to the larger s (the loop runs s ascending and a tie replaces). The
function returns one parent per cycle index with sample 0 at index 0. Period
1 returns its own height; period 0 and a heights array shorter than the
period throw a `RangeError`.

The CPU oracle (`sampleAttractorCell`) fills the optional
`AttractorCellMeasure.sampleCentres` from the detection window it already
holds: the first `period` entries of the plotted samples when the window fits
the plot, otherwise the appended detection tail, so periods longer than the
plot window still group a complete cycle aligned to plotted sample 0. No
period fills every entry with the running-window mean; an escaped cell zeroes
the buffer. `centre`, `spread`, the multiplier and the classification are
untouched (the card 100 frozen block passes unchanged, 7/7).

Both cloud builders write each point's `centres` attribute from the per-sample
centre: the CPU build from `measure.sampleCentres[k]`, the GPU build from
`OrbitSampleResult.sampleCentres[k * cellCount + cell]`. The hybrid build
carries per-sample centres through analytic cycle replacement
(`cycleHierarchy` over the exact cycle), contour samples, `writePointSite`
and the parity block's `overwriteLiveCloudSlot`. The sheet builder in
`orbitSurface.ts` sorts cycle ranks by height and applies that permutation to
both heights and centres, so each rank vertex's `a_centre` is its own parent;
refined and transition vertices take the same path. The surface shader is
unchanged. Geometry, packing (card 103's layout), camera and defaults are
unchanged.

The ELPC loader (`deriveQuantizedCentres`) groups the first p quantized
heights when p is at most the stored sample count, rounds each parent to u16
and expands sample-major; a period above the sample count or none keeps the
window mean. No format change and no rebake.

`orbit3dReadPoints(first, count)` and `orbit3dReadSurface()` on the
diagnostic canvas read live GPU attributes with `getBufferSubData` (positions,
periods, centres and, for a packed cloud, sample indices; the surface adds its
grid size). They keep no CPU copies and restore the previous array-buffer
binding. `webglRenderer.ts` changed only to expose and clear these two hooks.

## GPU mechanism

The metadata shader (`PERIOD_FRAGMENT_SHADER`) runs the same divisor search
over its existing in-shader detection window when `u_sampleCentres` is set,
with double-single sums, products and scalar division so the 1e-12 relative
tie threshold survives float32 storage. It writes three extra attachments
alongside the unchanged RGBA32F column metadata: a 2D RGBA32F hierarchy
texture (the chosen multiplicity) and layers 0 and 1 of an RGBA32F centre
texture array holding the parents of plotted samples 0-7. At the default eight
samples this adds no draw pass. Above eight samples a second program
(`CENTRE_FRAGMENT_SHADER`) writes one further layer per four samples, reusing
the stored multiplicity; when the period exceeds the plot window it
reconstructs only the unplotted part of the first cycle from the final sampled
state, never repeating warmup or the spread walk.

For N padded texels and B = ceil(sampleCount / 4) batches, temporary GPU
storage grows by 16 N (1 + max(2, B)) bytes (48 N bytes at eight samples),
readback adds B RGBA32F `readPixels` of the centre array, and the CPU result
adds 4 × cellCount × sampleCount bytes (`samplerBytes` includes it). Targets
are released after each call.

The ground calls the new `sampleMetadata` entry point, which skips the
hierarchy attachments and every per-point readback (the ground never used the
samples). `sampler-windows.json` records that `sample` and `sampleMetadata`
return identical `periods`, `interiors`, `centres`, `spreads` and `escaped`
arrays over the test cells, so the ground field and its classification are
unchanged in value.

## Numerical agreement (criterion 2)

Evidence: `e2e/artifacts/hierarchical-centre/sampler.json`. Warmup 1500,
eight plotted samples, production CPU and GPU samplers. The independent
float64 reference iterates its own cycle, enumerates every divisor proposal
itself and aligns its phase to the plotted first sample. Errors are maxima
over the eight samples.

| c | Period | CPU vs reference | GPU vs CPU | min and max of \|centre − column mean\| |
|---|---:|---:|---:|---|
| −0.5 | 1 | 1.43e-8 | 2.98e-8 | 0 |
| −1 | 2 | 0 | 0 | 0 |
| −1.3 | 4 | 1.26e-8 | 2.98e-8 | 0.714 |
| −1.26 | 4 | 6.53e-9 | 2.24e-7 | 0.709 |
| −1.375 | 8 | 7.10e-8 | 1.34e-7 | 0.441 to 1.012 |
| −1.14 + 0.245i | 6 | 5.97e-8 | 1.49e-8 | 0.644 |
| −0.12 + 0.74i | 3 | 3.51e-9 | 0 | 0 |
| −1.9 | none | 3.50e-9 | 1.19e-2 | 0 |
| −1.4 (found by the test's scan) | 32 | 6.58e-8 | 3.72e-7 | 0.348 to 1.070 |

Every periodic error is below 1e-3 and the chaotic CPU/GPU difference is below
0.1 (two finite running windows of diverging chaotic trajectories). Periods
4, 8 and 6 sit more than 0.3 from the column mean at every sample; periods
1, 2 and 3 keep the column mean. At c = −1.3 the parents are −1.2241 and
0.2042 against a column mean of −0.5100; at −1.26 they are −1.2105 and 0.2065
(the card's authoring figures). `sampler-windows.json` repeats the comparison
at 1, 12, 64 and 96 samples (CPU vs reference at most 7.10e-8; GPU vs CPU at
most 3.72e-7 periodic, 1.33e-2 chaotic) and holds the metadata-only equality.
The escaped-cell check zeroes populated buffers on both paths.

## Cloud and sheet readback (criteria 3 and 4)

`cloud-gpu.json` (balanced, cloud, GPU path: 163,720 packed points) and
`cloud-cpu.json` (`?orbit3dSampler=cpu`: 340,848 points) hold the diagnostic
readback filtered in-page to stored points within half a cell (2.34e-3) of
c = −1.3 and c = −1 on the real axis. GPU: eight points in two cells, heights
−1.3016 and −1.1479 carry centre −1.2248, heights 0.0159 and 0.3923 carry
0.2041; both period-2 points carry −0.5000. CPU: −1.2978/−1.1493 → −1.2236,
0.0226/0.3861 → 0.2043, period 2 → −0.5000. `sheet.json` (hybrid, surface
opacity 1) reads the surface mesh's centre buffer: the four rank vertices over
c = −1.3 (half cell 5.86e-3) carry −1.2251 twice and 0.2041 twice, the two
over c = −1 carry −0.5000. All within the 2e-3 bar.

## Colour (criterion 5)

`colour.json`: `probeShaderColours` over 13 cases built from the production
sampler's heights and per-sample centres (point and surface stages for the
four period-4 branches at c = −1.3 and the two period-2 branches at c = −1,
plus the interior ground texel) at bands 1.5, phase 0. Maximum channel error
against `spreadPaletteCoordinate(height, parent, 1.5, 0)` is 0.46/255; each
pair of period-4 branches matches its partner; both period-2 branches read the
0.5-distance colour. The ground texel at c = −1.3013 reads period 4, centre
−0.5102, spread 0.7285 (the column figures, within 1e-3 of the CPU oracle),
so the ground still reads `fract(bands × spread − phase)` from the column
spread. The existing spread, chaotic and phase-and-ground tests pass unedited.

## Prebaked derive and cost (criterion 6)

`prebakedCentre.test.cjs` adds two tests (64-sample period-4 at −1.3 and
period-6 at −1.14 + 0.245i whose parents match `cycleHierarchy` within 1e-4
after dequantization, period 2 at −0.5 at every sample; a chaotic window and
a period-8 cell baked with four samples keep the window mean) and passes
under `npm test` (`logs/verify.log`).

Cost against card 103 (`b6a4f9c6d` unpacked with `git archive` into the
ignored `build/hierarchical-centre-104-baseline/`, served on port 5174 from
the detached tmux session `hierarchical-centre-104-baseline`; the tree under
test served on 5173 from `hierarchical-centre-104-current`). Shipped defaults
at `balanced` with the camera parked, three matched loads per tree, GPU-timer
render timing on each load. Four complete runs: `cost-run0.json` and
`cost-run2.json` standalone (`logs/pw-hierarchy-cost.log`,
`logs/pw-hierarchy-cost-run2.log`), `cost-run1.json` and `cost-run3.json`
from the two whole-spec runs (`cost.json` is run 3). Points 1,465,224 on both
trees in every run.

| Run | Cloud build ms, current | Cloud build ms, baseline | Field build ms, current | Field build ms, baseline | Render median ms, current / baseline |
|---|---|---|---|---|---|
| 0 | 755, 731, 896 (median 755, +17%) | 632, 645, 651 (645) | 47.3, 41.8, 43.0 (43.0, −28%) | 58.0, 59.7, 61.0 (59.7) | 6.10, 6.11, 6.19 / 6.11, 6.10, 6.10 |
| 1 | 796, 771, 774 (774, +16%) | 650, 666, 711 (666) | 47.9, 44.5, 44.9 (44.9, −26%) | 58.8, 60.8, 65.6 (60.8) | 6.30, 6.20, 6.37 / 6.29, 6.20, 6.26 |
| 2 | 799, 885, 788 (799, +16%) | 690, 701, 678 (690) | 43.4, 40.6, 48.2 (43.4, −31%) | 62.5, 63.8, 59.5 (62.5) | 6.20, 6.18, 6.20 / 6.13, 6.21, 6.19 |
| 3 | 827, 745, 759 (759, +16%) | 646, 661, 657 (657) | 53.6, 42.8, 42.4 (42.8, −30%) | 60.8, 60.7, 64.2 (60.8) | 6.12, 6.35, 6.11 / 6.10, 6.18, 6.11 |

The cloud build is consistently 16-17% slower, inside the 20% bar plus the
test's 50 ms slack but not run-to-run noise: at eight samples the metadata
pass gains the divisor search and three extra RGBA32F attachments, the
readback gains two full-size RGBA32F `readPixels` (one per sample batch) and
the JS cloud assembly scatters one more float per point. The field build is
26-31% faster because the ground's metadata-only call no longer reads back
samples it discarded; its values are identical (previous section). Render
time is unchanged by construction (same attributes, same shaders) and the
medians agree within 0.2 ms.

## Evidence sequences (criterion 7)

`e2e/artifacts/hierarchical-centre/<view>-{forward,reverse}-{0..3}.png` and
`<view>-sequence.json` for `real-axis-cloud`, `real-axis-hybrid`,
`bifurcation-curtain` and `period6-satellite`: four frames one second apart in
forward mode, then four in reverse, cyclic Magma, speed 0.1, bands 1.5 (the
curtain preset's shipped 4), camera azimuth and distance asserted identical on
every frame. Phase steps are +0.110 to +0.117 forward and −0.110 to −0.117
reverse per view, the fixed-distance palette coordinate moves the opposite
way each step, and frame-to-frame motion is 0.56 to 8.89 (bar 0.3).

Pose: the real-axis views zoom 20 wheel steps at the default-camera projection
of c = −1.36 (the period-4 to period-8 junction) at height 0.2, which brings
the camera to its 0.35 minimum distance with that point held under the
pointer, then right-drag the anchor to 92% of the canvas height so the frame
holds the period-2 bulb's tip at lower left, the period-4 bulb's sheets (about
300 px tall) at centre right and the period-8 bulb above them with the chaotic
points beyond. The period-6 view zooms the same way at −1.14 + 0.245i and
drags the anchor to the centre, placing the satellite's root on the period-2
bulb's upper sheet at centre left. Attempt 2's pose (a right-drag before a
12-step zoom) landed on the period-2 bulb with the cascade at the frame edge,
because a pan moves screen content 1:1 only at the orbit target's depth. The
curtain is the preset's side view at distance 3.7.

What the worker saw, for the verifier to confirm or refute from the files: in
`real-axis-hybrid-forward-0.png` the period-4 sheets carry their own gradient
rather than continuing the period-2 sheet's, the period-2 bulb and the
cardioid look as in card 100's sequences, and in
`bifurcation-curtain-forward-0.png` the chaotic band is banded in colour while
the period-1 and period-2 curves stay pale (the Magma flat region, card 101's
question). Whether this looks good is the operator's judgement.

## Commands and results (criterion 1)

| Step | Command | Result |
|---|---|---|
| Red baseline | `npm run build:test && ORBIT_HIERARCHY=1 node --test src/app/orbitHierarchy.contract.test.cjs` with the implementation files restored to HEAD | 4 tests, 0 pass, 4 fail: three `card 104: cycleHierarchy is not implemented`, one `c = -1.3 sample 0 0 is not within 0.001 of -1.2241435050964355` (`logs/red-baseline.log`) |
| Regression | `npm run verify` | exit 0: typecheck, 410 tests (392 pass, 18 skipped, 0 fail), build (`logs/verify.log`) |
| Gate | `scripts/check-contract-test-gate.sh --worktree` | exit 0 (`logs/gate.log`) |
| Frozen blocks | `ORBIT_HIERARCHY=1`, `ORBIT_SPREAD=1`, `ORBIT_PACKING=1` node suites | 4/4, 7/7, 7/7, 0 skipped (`logs/ORBIT_*.log`) |
| Frozen Playwright | `INSIDE_OUT_CYCLING=1 npx playwright test e2e/inside-out-cycling.contract.spec.ts --workers=1` | 4 passed (`logs/pw-contract.log`) |
| Whole spec | `npx playwright test e2e/inside-out-cycling.spec.ts --workers=1` with the baseline on 5174 | 26 passed in 3.8 min, run twice (before and after the pose change; `logs/pw-inside-out-full.log` is the final run) |
| Packed cells | `npx playwright test e2e/packed-cells.spec.ts --grep 'base grid\|shader contract\|prebaked' --workers=1` | 6 passed (`logs/pw-packed-cells.log`). The first run failed on `public/baked/lm-tiny.elpc missing`: the bake is machine-local and lived in card 103's worktree, so it was rebuilt here with card 103's command (`node scripts/bake-orbit3d.mjs --points 2e5 --warmup 2000 --samples 8 --out public/baked/lm-tiny.elpc`: 26,015 cells × 8, 2,081,216 bytes; prebaked points 208,120 and 26,015, lit 0.7728 and 0.4971, matching card 103) |
| Criteria 2-5 | `--grep 'hierarchy: (sampler\|cloud\|sheet\|colour)'` | 6 passed (`logs/pw-hierarchy-core.log`) |
| Criterion 6 | `--grep 'hierarchy: cost'` | passed twice standalone, twice in the whole spec |
| Criterion 7 | `--grep 'hierarchy: evidence'` | 4 passed (`logs/pw-hierarchy-evidence.log`) |

## Changes outside the nine named deliverables

- `src/app/webglRenderer.ts`: the two diagnostic hooks only.
- `tsconfig.test.json` needed no change; `orbitHierarchy.ts` was already in
  its include list from the card's authoring commit.
- The attempt-1 to attempt-3 restores staged the tree through `git checkout
  <sha> -- .`; the index was reset so the deliverable is a plain dirty
  working tree.

## Limitations

- The ground still reads the column RMS spread, not a hierarchical distance.
- A bake whose period exceeds its sample count falls back to the window mean.
- No detected period means a running-window estimate, not proof of chaos; CPU
  and GPU chaotic trajectories diverge and their finite-window means differ by
  about 0.012 at c = −1.9.
- The cloud build is 16-17% slower than card 103 at eight samples, from the
  extra attachments and readback described above.
- The evidence pose is reproducible but hand-tuned; a different viewport would
  need a different drag target.
