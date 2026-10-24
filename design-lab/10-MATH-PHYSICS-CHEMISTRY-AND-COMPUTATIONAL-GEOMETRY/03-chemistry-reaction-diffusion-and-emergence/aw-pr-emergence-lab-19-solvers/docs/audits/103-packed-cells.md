# Audit 103: packed cells for the orbit cloud

Stage card `docs/stages/103-logistic-mandelbrot-packed-cells.md`, worker
Claude Fable 5.1, attempt 3, 2026-10-07. Worktree
`emergence-lab-run-103-logistic-mandelbrot-packed-cells` at `f8ac7ddab`
(dispatch base, `dev` as cut), tree under test served on port 5173 from the
worktree (tmux session `packed-cells-103-dev`) and the unchanged tree served
from `build/packed-cells-103-baseline/` on port 5174 by the audit 100 recipe
(tmux session `packed-cells-103-baseline`); both sessions were left running
for the verifier. Evidence under the git-ignored `e2e/artifacts/packed-cells/`:
JSON per test, PNGs, `logs/`, and `grep-runs/` holding the JSON of the
per-criterion runs that the whole-spec run later overwrote. Every figure below
is from this attempt; nothing is cited from attempts 1 or 2.

**Result: every criterion's command passes in this attempt's runs, and the
whole spec passes 12 of 12 (`logs/spec-run.log`, 5.5 min).** The layout and
its evidence are attempt 1's, accepted by the attempt-1 verifier on criteria
1, 3, 5, 7 and 8 and amended by re-brief 1 on criteria 2, 4 and 6. The work
of attempts 2 and 3 is criterion 9: warm render time is measured by three
methods on both trees and the tree under test is cheaper by every one of
them (GPU frame time 0.19 to 0.23 of the baseline's, real-display frame
interval 0.31, headless interval 0.31 to 0.62). The attempt-1 figure of 1.25
to 1.72 times was the headless requestAnimationFrame interval, which this
attempt shows to be the compositor's pacing and not the frame's cost; the
section "Cost" has the measurements and the reasoning the verifier is asked
to judge.

## What changed since attempt 1

- `src/app/orbitSampler.ts`: the GPU builder packs a tier in grid order and
  only repacks it in `admissionOrder` when the slot cap binds (`packItems`);
  per-cell row counts are read once into byte arrays, and the write pass
  walks stored cells rather than rows. Layout counts are unchanged except
  that grid-order packing uses slightly more slots (183,153 against 180,804
  at extreme) because neighbouring cells, not shuffled ones, share slots.
- `src/app/orbitPacking.ts`: `SlotPacker.placePacked` returns the placement
  as one integer for the builders' per-cell loops; the admission shuffle's
  generator is inlined. Behaviour is unchanged; the frozen test passes 7/7.
- `e2e/harness/insideOut.ts`: `frameTiming` measures GPU frame time and the
  frame interval together (see "The timing helper").
- `e2e/harness/packedCells.ts`: `mainThreadLoad`, the renderer main thread's
  task time over a window from the DevTools Performance domain.
- `e2e/packed-cells.spec.ts`: criteria 2 and 4 assert the re-brief 1 text;
  the cost test records three render measures, a pacing control at lighter
  presets, the main-thread load and one headed launch for both trees.
- `e2e/inside-out-cycling.spec.ts`: the timing test's report names the
  render method and the interval next to the render figure; its thresholds
  and the retired equality are as the card states.

## The layout as built

Sample-major, `sampleCount` rows by `slotCount` slots, point index
`row * slotCount + slot`. A cell occupies `distinctPointCount(period,
sampleCount)` consecutive rows of one slot (its orbit samples 0..n-1 in
order); periodic cells share slots through the best-fit `SlotPacker`
(`src/app/orbitPacking.ts`); a cell with no detected period fills a slot
alone. Tiers are slot ranges: base, then the detail-0 refinement tier, then
the boundary-detail tier; each tier is packed with its own packer so tier
boundaries are slot-aligned and `u_boundaryDetailBaseCellCount` is the slot
count of the tiers below the raised one. Rows nothing occupies carry
`a_sampleIndex = sampleCount` and are hidden.

Admission: a tier first packs its bounded cells (or surviving sub-cells) in
grid order; if that exceeds the tier's slot cap, it is repacked in
`admissionOrder` (seeds below) and cut where the cap binds, so the kept set
is a spatially uniform prefix and never a row-major truncation. Nothing is
swapped out afterwards. The CPU builder packs the base tier in
`admissionOrder` from the start and the refinement tier in its own order.
At 8 samples no tier's cap binds at any preset (see "Layout by preset").

| Name | Kind | Meaning |
|---|---|---|
| `a_sampleIndex` | float attribute | orbit sample index of the point within its cell; `sampleCount` on a hidden row; constant 0 on a stacked cloud (disabled attribute array) |
| `u_visibleIterations` | float uniform | the point is hidden when `a_sampleIndex >= u_visibleIterations`; set to the renderer's visible iteration count every frame |
| `u_stackedEnergy` | float uniform | 1 for a stacked cloud (prebaked, hybrid fallback): energy keeps the `period / sampleCount` factor; 0 for a packed cloud: energy is `a_weight` times the tier opacity |
| `u_cellCount` | float uniform (existing) | now the slot count; density culls per slot, which keeps every culled cell's orbit whole because a cell never spans slots |
| `data-orbit3d-layout` | dataset | `packed` for both live builders, `stacked` for the prebaked and hybrid-fallback clouds |

All six attribute buffers are float32 in the packed layout (a one-byte
stride made ANGLE convert buffers every frame on Metal; attempt 1 measured
and removed it). Stacked clouds are unchanged: `applyPrebaked` binds the
quantized layout and the hybrid fallback the float layout, both with a
constant sample index of 0, the draw-range prefix for Plotted iterations and
`u_stackedEnergy = 1`.

Diagnostics: `?orbit3dSampler=cpu` forces the CPU path for a build and
reports `data-orbit3d-sampler="cpu-sampled"` (read in
`src/app/webglRenderer.ts` the way the surface and ground diagnostics are;
`src/app/simView.ts` needed no change); the canvas carries
`orbit3dReadSampleIndices(count)`, a `getBufferSubData` read of the uploaded
sample-index buffer for the first `count` slots of every row. Dataset
attributes: `data-orbit3d-candidate-cells`, `-bounded-candidates`,
`-base-cells`, `-base-rows`, `-slots`, `-refined-sub-cells`, `-refined-rows`,
`-visible-points`, `-layout`, `-build-bytes`, `-sampler-bytes`.

## Planner constants

| Constant | Value | Role |
|---|---|---|
| `estimatePackedRowsPerCell(S)` | `min(S, 1.45 + S / 48)`: 1.62 at 8, 1.78 at 16, 2.78 at 64 | rows per bounded cell when sizing the candidate grid |
| `SURVIVING_CELL_ESTIMATE` | 0.22 (unchanged) | bounded share of candidates |
| base row budget | `(1 - refineFraction) * pointBudget` | cap on the base tier's rows; `baseSlotCap` is that over `sampleCount` |
| candidate grid | `min(pool, baseRowBudget / (rowsPerCell * 0.22))` | the whole pool at every preset and setting |
| `REFINE_CANDIDATE_OVERSAMPLE` | 2 | refinement candidate cap = `remainderRows * 2 / (subCells * sampleCount)`, remainder = budget minus the expected base rows |
| admission seeds | `0x103` (base), `0x10301` (GPU refinement), `0x10302` (CPU refinement) | `admissionOrder` prefixes decide what is kept when a tier's slots bind |
| `MAX_SAMPLE_JOBS_PER_CALL` | 2^22 | refinement jobs above this are sampled in batches, never dropped |

Measured at 8 samples, warmup 1500: 927,497 bounded cells of 3,686,400
(25.2%) pack into 183,153 slots and 1,446,428 rows, 1.56 rows a cell.

## Layout by preset and setting (criterion 2)

Boundary detail 0, cloud geometry, camera parked. "Unchanged points" is the
served baseline's `data-orbit3d-points` at the same settings where measured
(`plane-coverage.json`, `refinement-capacity.json`). Files:
`base-grid-{gpu,cpu}-{preset}.json`, `logs/chunk-a1.log`,
`logs/chunk-a2-balanced.log`, `logs/chunk-b.log`, `logs/spec-run.log`.

| Path, preset | Tail | Candidate cells | Bounded | Base cells | Base rows | Slots | Refined sub-cells | Points | Unchanged points |
|---|---|---|---|---|---|---|---|---|---|
| GPU extreme | 0 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 183,153 | 0 | 1,465,224 | 7,419,976 |
| GPU extreme | 0.3 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 409,782 | 244,790 | 3,278,256 | not measured |
| GPU extreme | 0.6 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 409,782 | 244,790 | 3,278,256 | 4,980,440 |
| GPU ultra | 0 | 1,638,720 | 412,384 | 412,384 | 643,267 | 81,451 | 0 | 651,608 | 3,299,072 |
| GPU ultra | 0.3 and 0.6 | 1,638,720 | 412,384 | 412,384 | 643,267 | 179,154 | 106,029 | 1,433,232 | not measured |
| CPU balanced | 0 (= 0.3), 0.3, 0.6 | 409,440 | 103,134 | 103,134 | 161,612 | 42,606 | 25,179 | 340,848 | not measured |
| CPU ultra | 0 (= 0.3), 0.3, 0.6 | 1,638,720 | 412,381 | 412,381 | 643,247 | 177,948 | 105,989 | 1,423,584 | not measured |

Base cells equal bounded candidates on every row, the candidate grid is the
preset's pool (within 2% of 1920², 1280² and 640²), the layout is `packed`,
points never exceed `data-orbit3d-point-budget` (9,600,000 at extreme,
4,800,000 at ultra, 2,400,000 at balanced, detail 0), and refined sub-cells
are non-decreasing from 0 to 0.3 to 0.6. GPU `performance`, `balanced` and
`high` at detail 0 were measured on the baseline only (297,384; 825,096;
1,856,864 points).

Refined sub-cells are identical at 0.3 and 0.6 on both paths. The planner
caps the base tier at `(1 - f)` of the budget and hands the rest to
refinement; since the base tier never reaches its cap (about 15% of the
budget at 8 samples), the remainder is the same at every slider value, and
the refinement candidate cap exceeds the number of tail candidates, all of
which are refined. Re-brief 1 withdrew "larger at 0.6 than at 0.3" for this
reason. Making the slider spend capacity is the follow-up card the audit
recommends: a second refinement level over level-1 survivors that are still
tails, or a subdivision that widens with the capacity.

## Boundary detail: refinement capacity (criterion 4)

Tail 0, boundary detail 1, GPU, `refinement-capacity.json`. Baseline refined
sub-cells derived as `points(detail 1) / 8 - points(detail 0) / 8`. Build
times are the whole-spec run, with the per-criterion run in brackets.

| Preset | Current refined sub-cells | Current points | Baseline refined sub-cells | Baseline points (detail 1 / 0) | Ratio | Build ms current / baseline |
|---|---|---|---|---|---|---|
| performance | 55,435 | 303,176 | 55,435 | 740,864 / 297,384 | 1.00 | 295 / 262 (295 / 277) |
| balanced | 111,087 | 715,672 | 111,087 | 1,713,792 / 825,096 | 1.00 | 320 / 340 (307 / 312) |
| high | 212,464 | 1,488,680 | 212,464 | 3,556,576 / 1,856,864 | 1.00 | 395 / 425 (416 / 438) |
| ultra | 352,049 | 2,545,536 | 352,049 | 6,115,464 / 3,299,072 | 1.00 | 568 / 604 (578 / 597) |
| extreme | 743,991 | 5,505,160 | 743,991 | 13,371,904 / 7,419,976 | 1.00 | 932 / 996 (996 / 1,004) |

Both trees refine every boundary-detail candidate: the candidate pool
(escape-edge cells plus tails) is smaller than either tree's candidate cap,
and the baseline's refinement capacity already held them all. The card's
original premise that the baseline was capacity-bound does not hold at 8
samples; re-brief 1 set the bar at a ratio of at least 1.00 at every preset,
which holds. The freed budget (the tree under test submits 5.5M of a 16M
budget at these settings) stays unspent until refinement can go deeper.

## Plane coverage (criterion 3)

Pose: the camera tilted to its top-down clamp by a pointer drag, then dollied
40 wheel steps at the viewport centre (the default orbit target,
c = (-0.5, 0), inside the cardioid) to the zoom clamp: distance 0.35, azimuth
2.4635. Rectangle: 240 by 240 px at (520, 240) of a 1280 by 720 canvas. Lit
threshold: 8-bit luma 40. `plane-coverage.json`, `logs/chunk-b.log`.

| Frame | Lit fraction |
|---|---|
| current GPU extreme, tail 0 (`plane-current-gpu-extreme-tail0.png`) | 0.3430 |
| current GPU extreme, tail 0.6 (`plane-current-gpu-extreme-tail0.6.png`) | 0.3430 (ratio 1.000) |
| baseline GPU extreme, tail 0 (`plane-baseline-gpu-extreme-tail0.png`) | 0.3426 |
| baseline GPU extreme, tail 0.6 (`plane-baseline-gpu-extreme-tail0.6.png`) | 0.2068 (ratio 0.604) |
| current CPU ultra, tail 0.3 (`plane-current-cpu-ultra-tail0.3.png`) | 0.1856 |
| current CPU ultra, tail 0.6 (`plane-current-cpu-ultra-tail0.6.png`) | 0.1856 (ratio 1.000) |

The tree under test keeps the lattice at 0.6 on both paths; the baseline
loses 40% of its lit cores, which is the thinning the card set out to remove.

## Plotted iterations and density (criterion 5)

GPU extreme, tail 0.3, detail 0 (`plotted.json`, `logs/chunk-a1.log`):
visible points 3,257,343 at plotted 8 = 1,446,428 base rows plus 1,810,915
refined rows; 1,172,287 at plotted 1 = 927,497 base cells plus 244,790
refined sub-cells; submitted points 3,278,256 at both. Cardioid rectangle
(criterion-3 pose): lit 0.3430 at plotted 1 and at 8
(`plotted-cardioid-plotted{1,8}.png`). Chaotic band rectangle, default pose,
60 by 160 px around c = (-1.78, 0) at height 0: lit 0.0907 at plotted 1
against 0.4985 at 8 (`plotted-chaotic-plotted{1,8}.png`). Point density 0.5
leaves visible points unchanged at 1,172,287.

## Shader contract (criterion 6)

`probeShaderColours` with an energy pass-through fragment on the production
point vertex shader (`shader-contract.json`): sample index 8 at 8 visible
draws nothing (0), 7 at 8 draws (255), 3 at 3 draws nothing, 2 at 3 draws;
stacked energy off, periods 1 and 4 at weight 1 both read 255; stacked energy
on, period 1 reads 32/255 (1/8) and period 4 reads 128/255 (4/8), four times
the period-1 point as re-brief 1 corrected. Buffer readback of the first
4,096 slots of a GPU balanced build, every row: 32,768 occupied rows, 0
hidden, 18,291 cells, values in 0..8, every slot's occupied rows contiguous
from row 0 with sample indices restarting at 0 at each cell, 0 violations.

## Brightness (criterion 7)

Default view, detail 0, tail 0, plotted 8, three matched loads each
(`brightness.json`, `brightness-*.png`), frame mean 8-bit luma (the three
loads of a tree read identically):

| Geometry, colour | Current | Baseline | Difference |
|---|---|---|---|
| cloud, Inside-out | 11.434 | 11.369 | +0.57% |
| cloud, Period | 12.680 | 12.656 | +0.19% |
| hybrid, Inside-out | 8.629 | 8.625 | +0.05% |
| hybrid, Period | 9.970 | 9.965 | +0.05% |

Hybrid `data-orbit3d-band-points` 306,984 and `data-orbit3d-hybrid-cloud-points`
473,704 on both trees. The live parity cloud is packed (1,465,224 points
against the baseline's 7,419,976).

## Prebaked path (criterion 8)

`public/baked/lm-tiny.elpc`, baked in the run worktree with the card's
command: 26,015 cells by 8 samples, 2,081,216 bytes, manifest id
"0.2M pts · 8 samples" (`prebaked.json`). `data-orbit3d-sampler="prebaked"`,
`data-orbit3d-layout="stacked"`, points 208,120 at plotted 8 and 26,015 at
plotted 1, lit fraction over the cardioid rectangle 0.773 and 0.497
(`prebaked-plotted{8,1}.png`).

## Cost (criterion 9)

Shipped defaults with the camera parked and the reveal off (boundary detail
1, tail 0, speed 0.1, 4 bands, edge glow 0.2), extreme, three matched loads
each; timing on the last load, three runs of 15 warm-up plus 90 frames.
Two complete runs of the cost test are reported: the per-criterion run
(`grep-runs/cost.json`, `logs/chunk-cost.log`) and the whole-spec run
(`cost.json`, `logs/spec-run.log`), the same code both times.

### The timing helper: what changed and why

Attempt 1's `frameTiming` returned the median, mean and 90th percentile of
90 requestAnimationFrame intervals after 15 warm-up frames, and read 1.25 to
1.56 times the baseline on the tree under test (the attempt-1 verifier read
1.72) while the tree submits 41% of the baseline's vertices and no more
fragments per pixel. The helper in `e2e/harness/insideOut.ts` now takes two
figures per frame:

- the GPU time of the frame's draw calls, from one
  `EXT_disjoint_timer_query_webgl2` `TIME_ELAPSED_EXT` query per frame. For
  the duration of the measurement the helper wraps the WebGL2 draw entry
  points on the context prototype so that the sim canvas's first draw call
  after a tick begins the query; the helper's own rAF callback ends it. The
  renderer schedules frames with requestAnimationFrame
  (`src/app/renderer.ts`), and the helper registers its callback later, so
  within every frame the sim's draws are issued before the helper's callback
  runs. Results are collected as they become available and the wrappers are
  restored when the run ends; a disjoint event is reported if the GPU
  signals one (none did);
- the requestAnimationFrame interval, as before.

`medianMs` is the GPU time where the extension exists (`method:
"gpu-timer"`) and the interval otherwise (`method: "interval"`); the
interval is always reported as `intervalMedianMs` and `intervalP90Ms`. The
helper lives in the test harness and runs the same code against both
origins; it does not know which tree it is measuring. The cost test adds, on
the same page and over the same window, the renderer main thread's task time
from the DevTools Performance domain (`mainThreadLoad` in
`e2e/harness/packedCells.ts`), a pacing control at lighter presets on both
trees, and one headed launch (a real display link) for both trees.

### Render time: three measures on both trees

| Measure | Current | Baseline | Ratio |
|---|---|---|---|
| GPU frame time, headless, whole-spec run | 11.74 / 12.18 / 11.67 ms (p90 13.4 to 13.9) | 52.24 / 52.22 / 52.23 (p90 52.3 to 52.4) | 0.225 |
| GPU frame time, headless, per-criterion run | 9.78 / 9.92 / 9.79 | 52.20 / 52.24 / 52.24 | 0.187 |
| GPU frame time, headed, whole-spec run | 11.55 / 11.99 / 12.04 | 52.22 / 52.21 / 52.23 | 0.230 |
| GPU frame time, headed, per-criterion run | 11.08 / 10.93 / 12.01 | 52.22 / 52.23 / 52.24 | 0.212 |
| rAF interval, headed (display link), whole-spec run | 16.7 / 16.7 / 16.7 (p90 17.8 to 18.1) | 53.6 / 53.6 / 53.5 (p90 55.4 to 55.8) | 0.312 |
| rAF interval, headed, per-criterion run | 16.8 / 16.7 / 16.8 | 53.5 / 53.5 / 53.5 | 0.314 |
| rAF interval, headless, whole-spec run | 16.7 / 16.7 / 16.7 (p90 17.2 to 17.3) | 53.8 / 53.5 / 53.5 (p90 53.7 to 55.9) | 0.312 |
| rAF interval, headless, per-criterion run | 33.6 / 23.9 / 33.2 (p90 128 to 136) | 53.4 / 53.5 / 53.5 (p90 54.0 to 54.6) | 0.62 |

The GPU figure is the same in all four of its rows on each tree, in headless
and headed Chromium and in both runs: about 10 to 12 ms on the tree under
test and 52.2 ms on the baseline. Under a real display link both trees pace
to it: the baseline's interval is its GPU time rounded up to the next
display frames (52.2 ms of GPU work, 53.5 ms between frames), and the tree
under test runs at the 60 Hz frame of 16.7 ms with 12 ms of GPU work inside
it. The headless interval is the one measure that moved between the two
runs on identical code: 16.7 ms in the whole-spec run, 24 to 34 ms median
with a 90th percentile of 128 to 136 ms in the per-criterion run, and 95 to
133 ms in the cycling suite's timing test (`logs/cycling.log`,
`e2e/artifacts/inside-out-spread/render-timing.json`, GPU time 10 to 18 ms
on that run). On the baseline it reads 53.5 ms in every run because the
baseline's GPU time is above whatever floor headless pacing applies.

### Pacing control: the baseline at lighter presets, same helper

The same params at `balanced` and `high`, headless, one timing run each
(`cost.json` and `grep-runs/cost.json`, field `pacing`):

| Run | Preset | Tree | Points | GPU frame ms | Headless interval median (p90) |
|---|---|---|---|---|---|
| per-criterion | balanced | current | 715,672 | 1.89 | 83.2 (140.9) |
| per-criterion | balanced | baseline | 1,713,792 | 10.44 | 53.4 (138.1) |
| per-criterion | high | current | 1,488,680 | 4.21 | 91.0 (146.8) |
| per-criterion | high | baseline | 3,556,576 | 12.79 | 17.0 (78.3) |
| whole-spec | balanced | current | 715,672 | 1.90 | 16.7 (17.0) |
| whole-spec | balanced | baseline | 1,713,792 | 12.08 | 16.7 (16.9) |
| whole-spec | high | current | 1,488,680 | 4.15 | 16.7 (16.8) |
| whole-spec | high | baseline | 3,556,576 | 11.98 | 16.7 (17.1) |

When the baseline's own GPU time is 10 to 13 ms, its headless interval reads
53.4 ms, 17 ms or 16.7 ms depending on the run, with 90th percentiles up to
138 ms, exactly as the tree under test's does at extreme. The floor is a
property of headless Chromium's frame pacing on this machine once the GPU
finishes early, not of the tree under test, and the baseline's 53.5 ms at
extreme is not a pacing floor: it is its GPU time, which the display-link
interval and the GPU timer agree on to within 2.5%.

### Main thread

`mainThreadLoad` over the three timing runs (315 frames): whole-spec run,
current 365 ms of task time in 5,323 ms (6.9%, 1.16 ms a frame), baseline
281 ms in 17,549 ms (1.6%, 0.89 ms a frame), ratio 1.34; per-criterion run,
current 877 ms in 17,458 ms (2.8 ms a frame), baseline 222 ms (0.7 ms a
frame). The current tree's main thread is idle for over 90% of every
interval in every run, so no interval is script-bound. A DevTools sampling
profile over 4 s of warm rendering on each tree (200 µs interval, outside
the test) put every JavaScript function under 0.2 ms a frame on both trees
and the difference in native "(program)" time (2.8 against 1.2 ms a frame
in the erratic-pacing condition); removing the eleven static dataset writes
from the frame changed nothing measurable (2.68 against 3.03 ms a frame,
within run-to-run noise), and the writes cost 2.4 µs a frame when timed in
the page. The residual native cost tracks the pacing condition (1.16 ms a
frame in the regular run) and is left as a limitation.

### Build time and bytes

| Measure | Current | Baseline | Ratio |
|---|---|---|---|
| Cloud build ms, whole-spec run | 960 / 966 / 962 (median 962) | 1,020 / 1,012 / 981 (median 1,012) | 0.951 |
| Cloud build ms, per-criterion run | 1,082 / 1,032 / 1,115 (median 1,082) | 1,128 / 1,022 / 997 (median 1,022) | 1.059 |
| Build bytes | 223,911,368 | budget 16,000,000 times 24 = 384,000,000 | 0.583 |
| Points submitted | 5,505,160 | 13,371,904 | 0.41 |
| Refined sub-cells | 743,991 | 743,991 | 1.00 |

Build time is within 20% of the baseline's in both runs, so no explanation
under the card's build-time rule is needed. Attempt 1 attributed its 1.24
times to the admission shuffle over 3.7M candidates and a two-pass row
write; the grid-order packer shuffles only when a cap binds and the write
pass walks stored cells, and the rise is gone. Build
bytes count the cloud's attribute arrays and layout tables; the sampler's
readback buffers are reported separately as `data-orbit3d-sampler-bytes`.
The cycling suite's timing test at detail 0 (`logs/cycling.log`): cloud
build 605 / 625 / 623 against 616 / 631 / 605 ms, field build 57.6 / 59.4 /
58.9 against 51.0 / 53.8 / 53.7 ms, GPU render 10.2 / 14.2 / 18.5 against
52.1 / 52.0 / 52.1 ms; it passes its unchanged thresholds.

## Commands and results

| Criterion | Command | Result |
|---|---|---|
| 1 red baseline | `npm run build:test && ORBIT_PACKING=1 node --test src/app/orbitPacking.contract.test.cjs` in `build/packed-cells-103-baseline/` (the unchanged tree) | 7 fail: `card 103: SlotPacker is not implemented` (4), `admissionOrder`, `distinctPointCount`, `estimatePackedRowsPerCell` (1 each) |
| 1 regression | `npm run verify` | typecheck, 408 tests (390 pass, 18 skipped, 0 fail), build green; run again after the last edit with the same result |
| 1 gate | `scripts/check-contract-test-gate.sh --worktree` | exit 0 |
| 1 frozen contract | `ORBIT_PACKING=1 node --test src/app/orbitPacking.contract.test.cjs` | 7 pass, 0 fail, 0 skipped |
| 1 smoke | `npx playwright test e2e/smoke.spec.ts --grep 'logistic-Mandelbrot\|Logistic Mandelbrot\|cyclic Magma\|orbit camera' --workers=1` | 7 pass, 39.7 s (`logs/smoke.log`) |
| 1 cycling | `npx playwright test e2e/inside-out-cycling.spec.ts --grep 'spread\|chaotic\|controls and cache' --workers=1` with the baseline served | 5 pass, 2.1 min (`logs/cycling.log`) |
| 1 cycling contract | `INSIDE_OUT_CYCLING=1 npx playwright test e2e/inside-out-cycling.contract.spec.ts --workers=1` | 4 pass, 1.2 min (`logs/contract-run.log`) |
| 2 | `--grep 'base grid'` | 4 pass (`logs/chunk-a1.log` GPU, `logs/chunk-a2-balanced.log` and `logs/chunk-b.log` CPU) |
| 3 | `--grep 'plane coverage'` | 1 pass (`logs/chunk-b.log`) |
| 4 | `--grep 'refinement capacity'` | 1 pass (`logs/chunk-b.log`) |
| 5 | `--grep 'plotted'` | 1 pass (`logs/chunk-a1.log`) |
| 6 | `--grep 'shader contract'` | 1 pass (`logs/chunk-a1.log`) |
| 7 | `--grep 'brightness'` | 1 pass, 4.9 min (`logs/chunk-c.log`) |
| 8 | bake as the card states, then `--grep 'prebaked'` | 1 pass (`logs/chunk-a1.log`) |
| 9 | `--grep 'cost'` | 1 pass, 1.8 min (`logs/chunk-cost.log`); `--grep 'evidence'` 1 pass (`logs/chunk-c.log`) |
| all | `npx playwright test e2e/packed-cells.spec.ts --workers=1` | 12 pass, 5.5 min (`logs/spec-run.log`) |

The per-criterion commands were run as `npx playwright test
e2e/packed-cells.spec.ts --grep '<key>' --workers=1`, grouped where a group
fits the harness's foreground limit (the log names say which). The whole-spec
run was launched in a detached tmux session (`packed-cells-103-spec`, since
closed) and waited for in the foreground until its exit, because a single
foreground command in this harness is capped at ten minutes. The baseline
was served the whole time; both servers were left up for the verifier.

## Evidence for the operator (criterion 9)

- `e2e/artifacts/packed-cells/evidence-cardioid-current-tail0.png`,
  `evidence-cardioid-current-tail0.6.png`,
  `evidence-cardioid-baseline-tail0.png`,
  `evidence-cardioid-baseline-tail0.6.png`: the criterion-3 pose on both
  trees (lit fractions 0.343, 0.343, 0.343, 0.207).
- `evidence-curtain-current-tail0.6.png`, `evidence-curtain-baseline-tail0.6.png`:
  the "Bifurcation curtain" preset at tail 0.6 (1,891,904 packed points
  against 7,200,000 stacked). The preset sets the real-axis slice, which
  disables tail refinement on both trees, so these frames compare the packed
  and stacked real-axis clouds rather than refined tails.
- `evidence.json` records the dataset of each frame.

## Unresolved limitations

- The bake stays stacked (ELPC v1 unchanged); compacting it at load is the
  follow-up the card names.
- The resolution pool still caps the plane at 1920²; at 8 samples the base
  tier uses about 15% of the budget at every preset, so the remainder is
  unspent until refinement can go deeper.
- Tail refinement above 0 is inert on the GPU path and 0.3 equals 0.6 on the
  CPU path, for the reason given under "Layout by preset"; a follow-up card
  is needed to make the slider spend capacity.
- The renderer main thread spends 0.3 to 2 ms a frame more native time than
  the baseline's, varying with the headless pacing condition; it is not in
  script and not in the dataset writes, and it is under 10% of a display
  frame.
- The headless requestAnimationFrame interval is not a stable render-time
  measure on this machine when the GPU finishes early; the GPU timer and the
  headed interval are, and the cost test asserts on those.
