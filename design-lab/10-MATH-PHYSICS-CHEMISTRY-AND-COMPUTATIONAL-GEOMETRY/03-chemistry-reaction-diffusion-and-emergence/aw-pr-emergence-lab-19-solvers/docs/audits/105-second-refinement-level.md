# Audit 105: a second refinement level, and a slider that spends a budget

Stage card: `docs/stages/105-logistic-mandelbrot-second-refinement-level.md`.
Worker: Claude Fable 5.1, 2026-10-07, run worktree
`emergence-lab-run-105-logistic-mandelbrot-second-refinement-level` on branch
`autometta/105-logistic-mandelbrot-second-refinement-level`, dispatch base
`dev` at `1c2abeb57`. Every figure below was measured on this machine with
the tree under test served on port 5173 and the unchanged tree served on
port 5174 (see "Serving the baseline"). Artefacts are under the git-ignored
`e2e/artifacts/refine-levels/`; paths below are relative to that directory
unless they start with `e2e/`, `src/` or `docs/`.

## The rule as built

Both live builders now refine the cascade tails twice, and the Tail
refinement slider sets the rows refinement may spend instead of taking every
row the base tier leaves.

- **Row budget.** `refinementRowBudget(pointBudget, f)` is
  `floor(pointBudget * clamp(f, 0, 0.6))`, where `f` is
  `resolveOrbitRefinement`'s value: the slider on the GPU path (0 is off),
  the automatic 0.3 on the CPU path when the slider is 0. The planner
  (`orbitCloudBuildPlan` in `src/app/orbit3d.ts`) returns it as
  `refineRowBudget`; it is computed from the detail-0 point budget even when
  the raised boundary-detail tier lifts the GPU budget to 16M. The base tier
  keeps card 103's row budget `(1 - f) * pointBudget` and its admission; rows
  neither tier spends stay unused.
- **Level 1** is the tails tier as before: base cells with
  `isRefineCandidate(period, 1)` (period 0 or at least 8), reservoir-capped
  at `candidateCapFor(refineRowBudget, 9)`, subdivided 3 by 3 with
  `subCellCentres` from the base cell's own centre and size, sampled at
  `refineWarmup`, packed with `SlotPacker` into at most
  `floor(refineRowBudget / sampleCount)` slots, weight `refinePointWeight(1)`
  = 0.15 (which `REFINE_POINT_WEIGHT` now aliases).
- **Level 2** takes `splitLevelRows(refineRowBudget, level1Rows).level2`
  rows, where `level1Rows` is what level 1 actually packed. Its candidates
  are the level-1 jobs that sampled bounded with `isRefineCandidate(period,
  2)` (period 0 or at least 16), reservoir-capped at
  `candidateCapFor(level2Rows, 9)`; each is subdivided 3 by 3 with
  `subCellCentres` from the level-1 job's own centre and a third of the base
  cell on each axis, sampled at `refineWarmup`, packed into at most
  `min(floor(level2Rows / sampleCount), refineSlotCap - level1Slots)` slots
  with weight `refinePointWeight(2)` = 0.06. The slot cap keeps the two
  levels inside `floor(refineRowBudget / sampleCount)` slots together, so
  the point count (slots times samples) never exceeds the point budget. No
  builder computes a level-2 coordinate from a base-grid index: the GPU
  builder subdivides `level1.coordinates`, the CPU builder subdivides
  `level1Coordinates`, both the arrays the sampler was given.
- **Admission.** When a level's survivors exceed its slots they are admitted
  in `admissionOrder` with a per-level seed. Level 1 keeps
  `REFINEMENT_ADMISSION_SEED = 0x103_01` (GPU) and
  `CPU_REFINEMENT_ADMISSION_SEED = 0x103_02` (CPU). Level 2 uses new seeds:
  `LEVEL2_ADMISSION_SEED = 0x105_01` in `src/app/orbitSampler.ts` and
  `CPU_LEVEL2_ADMISSION_SEED = 0x105_02` in `src/app/orbit3d.ts`. The GPU
  builder packs survivors in job order and only repacks in admission order
  when the cap binds (card 103's `packItems`); the CPU builder visits level-2
  jobs in admission order from the start, as it does for level 1.
- **Boundary distance.** A level-2 point's boundary attribute is looked up
  from the base cell that contains it (`parents[job]`, carried from the
  level-1 job's base cell), exactly as a level-1 point's is.
- **Slot layout.** Base, level 1, level 2, then the raised tier. With
  boundary detail active, `boundaryDetailBaseSlots` (bound to
  `u_boundaryDetailBaseCellCount`) is base + level 1 + level 2, so a fully
  gated draw submits the genuine detail-0 cloud. The raised tier's
  candidates (tails plus both sides of the escape edge), its 5 by 5
  subdivision, warmup 20,000, weight 0.05 and its capacity rule (the slots
  left under the raised budget) are unchanged; only its slot offset moved
  up by level 2's slots.
- **Stats and hook.** `Orbit3DStats` gains `refineRowBudget`,
  `refinedL1SubCells`, `refinedL1Rows`, `refinedL2SubCells`,
  `refinedL2Rows`, `refinedDetailSubCells` and `detailBaseSlots` (the value
  bound to the gate uniform; the slot count when the raised tier is
  inactive). `refinedSubCells` and `refinedRows` stay the sum over every
  refinement tier. The renderer publishes them as
  `data-orbit3d-refine-row-budget`, `-refined-l1-sub-cells`,
  `-refined-l1-rows`, `-refined-l2-sub-cells`, `-refined-l2-rows`,
  `-refined-detail-sub-cells` and `-detail-base-slots`, and installs
  `orbit3dReadRefineJobs(level, count)` on the canvas alongside
  `orbit3dReadSampleIndices`. The hook returns `{ total, jobs }`: `total` is
  the number of jobs the level sampled in the last build and `jobs` holds,
  for the first `min(count, total)`, `{ re, im, parentRe, parentIm,
  parentWidth, parentHeight }` read from the job records the builders keep
  (`OrbitCloudBuffers.refineJobs`), never recomputed. It returns
  `{ total: 0, jobs: [] }` while building and for a prebaked cloud. On the
  GPU path every job is sampled, so `total` is candidates times 9; on the
  CPU path jobs are sampled lazily in admission order and sampling stops
  when the level's slots are full, so `total` can be below candidates times
  9 and is listed in sampling order.
- **Kernel info.** The `tailRefinement` descriptor in
  `src/sims/logistic-mandelbrot/kernel.ts` now says the setting is the share
  of the point budget spent re-sampling cascade tails at two levels, that 0
  is off on the GPU path and automatic (0.3) on the CPU fallback, and that
  the base grid does not change with it. No default changed.

Constants unchanged: `REFINE_SUBDIVISION = 3`, `REFINE_WARMUP_MULTIPLIER
= 4` (capped at 2,000), `REFINE_CANDIDATE_OVERSAMPLE = 2`,
`BOUNDARY_DETAIL_SUBDIVISION = 5`, `BOUNDARY_DETAIL_WARMUP = 20_000`,
`BOUNDARY_DETAIL_POINT_WEIGHT = 0.05`, the point budgets and the
surviving-cell estimate. `REFINE_PERIOD_THRESHOLD` is gone: both builders
ask `isRefineCandidate(period, 1)`, which is the same predicate for a
bounded cell.

## Authoring estimate against measurement

The card's figures came from a 480 by 480 `sampleAttractorCell` sweep
scaled by 16 to the 1920 by 1920 extreme pool. Measured on the GPU path at
`extreme`, boundary detail 0 (`budget-gpu-extreme.json`,
`layout-table-gpu.json`):

| Quantity | Authoring estimate | Measured |
|---|---|---|
| Bounded cells (= base cells) | 926,976 | 927,497 |
| Base rows | 1.44M | 1,446,428 |
| Level-1 candidates | not stated | 29,983 (all admitted; cap 80,000 at 0.3) |
| Level-1 jobs, surviving sub-cells, rows | 211,872 sub-cells, 1.47M rows | 269,847 jobs, 244,790 sub-cells (90.7% survive), 1,810,915 rows |
| Level-2 candidates sampled | not stated | 29,697 at 0.3 (cap-bound), 109,697 at 0.6 (cap-bound) |
| Level-2 demand | 690,944 sub-cells, 5.39M rows | at least 987,273 jobs: the reservoir filled its 109,697-candidate cap at 0.6, so the pool is larger than the cap. At `balanced`, where the pool is exhausted, 88% of level-2 jobs survive at about 7.9 rows each; the extreme demand is therefore above 870,000 sub-cells and 6.8M rows |
| Refinement rows granted, `extreme` | 2.88M at 0.3, 5.76M at 0.6 | 2,880,000 and 5,760,000 |
| Refinement rows granted, `ultra` | 1.44M and 2.88M | 1,440,000 and 2,880,000 |

Level 1 fits whole at every setting above 0 on every preset (its rows are
at most 1,810,915 against a smallest grant of 300,000 at `performance`,
where its demand is 60,092). Level 2 is capacity-bound at 0.3 and 0.6 on
`extreme`, `ultra` and `high`, and at 0.3 on `balanced`; at `performance`
and at `balanced` 0.6 the level-2 pool fits whole, so the slider saturates
there (see the table). Criterion 2's premise holds on the two presets it
names, with the level-2 demand above the estimate rather than below it.

## Layout by preset and setting

Cloud geometry, camera parked, both trees (`layout-table-gpu.json`,
`layout-table-cpu.json`, `logs/layout-table.log`). "Level-2 cand." is the
hook's level-2 `total` over 9 (the candidates the reservoir admitted); on
the CPU path the hook total is the jobs sampled before the level's slots
filled, so it is given as jobs. "Baseline" is the served unchanged tree's
`data-orbit3d-points` and `-refined-sub-cells` at the same settings; with
boundary detail 1 its raised-tier count is its refined sub-cells at detail
1 minus at detail 0, which this tree reports directly as
`-refined-detail-sub-cells`. Build ms are single loads, current / baseline,
taken while no other suite ran.

| Path, preset | Detail | Tail | Base cells | Row budget | L1 sub-cells / rows | L2 cand. | L2 sub-cells / rows | Raised | Points | Baseline points / refined | Build ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GPU performance | 0 | 0 | 37,173 | 0 | 0 / 0 | 0 | 0 / 0 | 0 | 59,256 | 59,256 / 0 | 274 / 202 |
| GPU performance | 0 | 0.3 | 37,173 | 300,000 | 8,856 / 60,092 | 3,627 | 26,853 / 207,778 | 0 | 327,576 | 119,504 / 8,856 | 215 / 190 |
| GPU performance | 0 | 0.6 | 37,173 | 600,000 | 8,856 / 60,092 | 3,627 | 26,853 / 207,778 | 0 | 327,576 | 119,504 / 8,856 | 208 / 184 |
| GPU performance | 1 | 0 | 37,173 | 0 | 0 / 0 | 0 | 0 / 0 | 55,435 | 303,176 | 303,176 / 55,435 | 220 / 216 |
| GPU performance | 1 | 0.3 | 37,173 | 300,000 | 8,856 / 60,092 | 3,627 | 26,853 / 207,778 | 55,435 | 571,496 | 363,424 / 64,291 | 254 / 267 |
| GPU performance | 1 | 0.6 | 37,173 | 600,000 | 8,856 / 60,092 | 3,627 | 26,853 / 207,778 | 55,435 | 571,496 | 363,424 / 64,291 | 237 / 222 |
| GPU balanced | 0 | 0 | 103,137 | 0 | 0 / 0 | 0 | 0 / 0 | 0 | 163,720 | 163,720 / 0 | 210 / 214 |
| GPU balanced | 0 | 0.3 | 103,137 | 720,000 | 25,240 / 179,696 | 11,315 | 68,475 / 539,569 | 0 | 883,720 | 343,752 / 25,240 | 292 / 223 |
| GPU balanced | 0 | 0.6 | 103,137 | 1,440,000 | 25,240 / 179,696 | 11,315 | 89,576 / 705,970 | 0 | 1,050,432 | 343,752 / 25,240 | 280 / 222 |
| GPU balanced | 1 | 0 | 103,137 | 0 | 0 / 0 | 0 | 0 / 0 | 111,087 | 715,672 | 715,672 / 111,087 | 296 / 294 |
| GPU balanced | 1 | 0.3 | 103,137 | 720,000 | 25,240 / 179,696 | 11,315 | 68,475 / 539,569 | 111,087 | 1,435,672 | 895,704 / 136,327 | 384 / 297 |
| GPU balanced | 1 | 0.6 | 103,137 | 1,440,000 | 25,240 / 179,696 | 11,315 | 89,576 / 705,970 | 111,087 | 1,602,384 | 895,704 / 136,327 | 337 / 287 |
| GPU high | 0 | 0 | 232,108 | 0 | 0 / 0 | 0 | 0 / 0 | 0 | 368,280 | 368,280 / 0 | 271 / 281 |
| GPU high | 0 | 0.3 | 232,108 | 1,020,000 | 59,244 / 431,021 | 16,361 | 74,273 / 588,038 | 0 | 1,388,280 | 799,936 / 59,244 | 365 / 302 |
| GPU high | 0 | 0.6 | 232,108 | 2,040,000 | 59,244 / 431,021 | 28,258 | 203,091 / 1,607,620 | 0 | 2,408,280 | 799,936 / 59,244 | 468 / 316 |
| GPU high | 1 | 0 | 232,108 | 0 | 0 / 0 | 0 | 0 / 0 | 212,464 | 1,488,680 | 1,488,680 / 212,464 | 422 / 420 |
| GPU high | 1 | 0.3 | 232,108 | 1,020,000 | 59,244 / 431,021 | 16,361 | 74,273 / 588,038 | 212,464 | 2,508,680 | 1,920,336 / 271,708 | 496 / 453 |
| GPU high | 1 | 0.6 | 232,108 | 2,040,000 | 59,244 / 431,021 | 28,258 | 203,091 / 1,607,620 | 212,464 | 3,528,680 | 1,920,336 / 271,708 | 562 / 459 |
| GPU ultra | 0 | 0 | 412,384 | 0 | 0 / 0 | 0 | 0 / 0 | 0 | 651,608 | 651,608 / 0 | 374 / 373 |
| GPU ultra | 0 | 0.3 | 412,384 | 1,440,000 | 106,029 / 780,671 | 18,315 | 82,882 / 658,072 | 0 | 2,091,608 | 1,433,232 / 106,029 | 476 / 408 |
| GPU ultra | 0 | 0.6 | 412,384 | 2,880,000 | 106,029 / 780,671 | 51,922 | 264,168 / 2,097,321 | 0 | 3,531,608 | 1,433,232 / 106,029 | 624 / 444 |
| GPU ultra | 1 | 0 | 412,384 | 0 | 0 / 0 | 0 | 0 / 0 | 352,049 | 2,545,536 | 2,545,536 / 352,049 | 631 / 641 |
| GPU ultra | 1 | 0.3 | 412,384 | 1,440,000 | 106,029 / 780,671 | 18,315 | 82,882 / 658,072 | 352,049 | 3,985,536 | 3,327,160 / 458,078 | 738 / 679 |
| GPU ultra | 1 | 0.6 | 412,384 | 2,880,000 | 106,029 / 780,671 | 51,922 | 264,168 / 2,097,321 | 352,049 | 5,425,536 | 3,327,160 / 458,078 | 837 / 661 |
| GPU extreme | 0 | 0 | 927,497 | 0 | 0 / 0 | 0 | 0 / 0 | 0 | 1,465,224 | 1,465,224 / 0 | 664 / 699 |
| GPU extreme | 0 | 0.3 | 927,497 | 2,880,000 | 244,790 / 1,810,915 | 29,697 | 134,002 / 1,066,508 | 0 | 4,345,224 | 3,278,256 / 244,790 | 931 / 773 |
| GPU extreme | 0 | 0.6 | 927,497 | 5,760,000 | 244,790 / 1,810,915 | 109,697 | 495,651 / 3,945,778 | 0 | 7,225,224 | 3,278,256 / 244,790 | 1,180 / 799 |
| GPU extreme | 1 | 0 | 927,497 | 0 | 0 / 0 | 0 | 0 / 0 | 743,991 | 5,505,160 | 5,505,160 / 743,991 | 1,130 / 1,123 |
| GPU extreme | 1 | 0.3 | 927,497 | 2,880,000 | 244,790 / 1,810,915 | 29,697 | 134,002 / 1,066,508 | 743,991 | 8,385,160 | 7,318,192 / 988,781 | 1,412 / 1,178 |
| GPU extreme | 1 | 0.6 | 927,497 | 5,760,000 | 244,790 / 1,810,915 | 109,697 | 495,651 / 3,945,778 | 743,991 | 11,265,160 | 7,318,192 / 988,781 | 1,603 / 1,238 |
| CPU balanced | 0 | 0 (= 0.3) | 103,134 | 720,000 | 25,179 / 179,226 | 77,933 jobs | 68,569 / 540,347 | 0 | 881,616 | 340,848 / 25,179 | 3,569 / 1,525 |
| CPU balanced | 0 | 0.3 | 103,134 | 720,000 | 25,179 / 179,226 | 77,933 jobs | 68,569 / 540,347 | 0 | 881,616 | 340,848 / 25,179 | 3,032 / 1,535 |
| CPU balanced | 0 | 0.6 | 103,134 | 1,440,000 | 25,179 / 179,226 | 101,502 jobs | 89,339 / 704,073 | 0 | 1,045,464 | 340,848 / 25,179 | 4,020 / 1,488 |
| CPU high | 0 | 0 (= 0.3) | 232,086 | 1,020,000 | 59,095 / 429,816 | 81,932 jobs | 74,500 / 589,876 | 0 | 1,383,408 | 793,232 / 59,095 | 4,533 / 3,019 |
| CPU high | 0 | 0.3 | 232,086 | 1,020,000 | 59,095 / 429,816 | 81,932 jobs | 74,500 / 589,876 | 0 | 1,383,408 | 793,232 / 59,095 | 4,534 / 3,048 |
| CPU high | 0 | 0.6 | 232,086 | 2,040,000 | 59,095 / 429,816 | 223,050 jobs | 203,359 / 1,609,447 | 0 | 2,403,408 | 793,232 / 59,095 | 8,096 / 3,062 |
| CPU ultra | 0 | 0 (= 0.3) | 412,381 | 1,440,000 | 105,989 / 780,329 | 89,552 jobs | 83,061 / 659,341 | 0 | 2,083,248 | 1,423,584 / 105,989 | 6,582 / 4,557 |
| CPU ultra | 0 | 0.3 | 412,381 | 1,440,000 | 105,989 / 780,329 | 89,552 jobs | 83,061 / 659,341 | 0 | 2,083,248 | 1,423,584 / 105,989 | 6,571 / 4,547 |
| CPU ultra | 0 | 0.6 | 412,381 | 2,880,000 | 105,989 / 780,329 | 285,026 jobs | 264,310 / 2,098,638 | 0 | 3,523,248 | 1,423,584 / 105,989 | 11,592 / 4,543 |

What the table shows:

- The base grid is the preset's pool at every setting (base cells equal
  bounded candidates, within 2% of 1920², 1280², 960², 640² and 384²) and
  does not move with the slider on either path.
- Level 1 is identical at 0.3 and 0.6 on every preset: its sub-cells equal
  the baseline's refined sub-cells at detail 0 (244,790 at extreme, 106,029
  at ultra, and so on), so the detail-0 cloud of the unchanged tree is this
  tree's base plus level 1.
- Level 2 grows from 0.3 to 0.6 on `extreme` (134,002 to 495,651 sub-cells),
  `ultra` (82,882 to 264,168), `high` (74,273 to 203,091) and `balanced`
  (68,475 to 89,576), and is capacity-bound there (rows within 7,000 of the
  rows level 1 left). At `performance` the whole level-2 pool (3,627
  candidates, 26,853 sub-cells) fits at 0.3, so 0.6 adds nothing; at
  `balanced` 0.6 the pool fits as well (11,315 candidates, both settings).
- Points never exceed the point budget (9.6M, 4.8M, 3.4M, 2.4M, 1M at
  detail 0; 16M at detail 1), and the two levels together stay within the
  row budget at every row (the budget suite asserts this on `extreme`,
  `ultra` and CPU `ultra`).
- With boundary detail 1 the raised tier's count is the same as the
  baseline's derived raised-tier count on every preset (55,435; 111,087;
  212,464; 352,049; 743,991), and levels 1 and 2 are identical to their
  detail-0 figures.
- The CPU path reads 0 as 0.3 and matches the GPU path within the sampler's
  float differences (base cells 412,381 against 412,384 at ultra).

## Criterion results

The commands were `npx playwright test e2e/refine-levels.spec.ts --grep
'<key>' --workers=1` with both servers up; logs under `logs/`.

### 2. Budget (`logs/budget.log`, `budget-{gpu-extreme,gpu-ultra,cpu-ultra}.json`)

3 pass. At every case and setting `data-orbit3d-refine-row-budget` equals
`floor(point budget * t)` (CPU: t = 0.3 at 0), level-1 plus level-2 rows
stay within it, base cells are constant to the cell, and points stay
within the point budget:

| Case | Tail | Row budget | L1 rows | L2 rows | L1 + L2 | L2 sub-cells | Points |
|---|---|---|---|---|---|---|---|
| GPU extreme | 0 | 0 | 0 | 0 | 0 | 0 | 1,465,224 |
| GPU extreme | 0.3 | 2,880,000 | 1,810,915 | 1,066,508 | 2,877,423 | 134,002 | 4,345,224 |
| GPU extreme | 0.6 | 5,760,000 | 1,810,915 | 3,945,778 | 5,756,693 | 495,651 | 7,225,224 |
| GPU ultra | 0 | 0 | 0 | 0 | 0 | 0 | 651,608 |
| GPU ultra | 0.3 | 1,440,000 | 780,671 | 658,072 | 1,438,743 | 82,882 | 2,091,608 |
| GPU ultra | 0.6 | 2,880,000 | 780,671 | 2,097,321 | 2,877,992 | 264,168 | 3,531,608 |
| CPU ultra | 0 | 1,440,000 | 780,329 | 659,341 | 1,439,670 | 83,061 | 2,083,248 |
| CPU ultra | 0.3 | 1,440,000 | 780,329 | 659,341 | 1,439,670 | 83,061 | 2,083,248 |
| CPU ultra | 0.6 | 2,880,000 | 780,329 | 2,098,638 | 2,878,967 | 264,310 | 3,523,248 |

### 3. Geometry (`logs/geometry.log`, `geometry-{gpu,cpu}-balanced.json`)

2 pass, GPU and CPU `balanced` at 0.6. The hook read 4,096 jobs of each
level (totals: GPU 30,843 level-1 and 101,835 level-2 jobs; CPU 30,816 and
101,502) and the whole level-1 list for the parent lookup. Every level-2
parent is 0.001172332942555686 by 0.001388888888888889, a third of every
level-1 parent's 0.0035169988276670576 by 0.004166666666666667 (the 640 by
480 base cell); every job of either level lies inside its parent's
rectangle and sits at an offset of exactly -1/3, 0 or 1/3 of the parent's
size on each axis (all nine offsets occur, none off the lattice within
1e-9 relative); and all 4,096 level-2 parents matched a level-1 job's
position within 1e-12. Zero violations on either path.

### 4. Tail density (`logs/tail-density.log`, `tail-density.json`, `tail-density-*.png`)

1 pass. GPU `extreme`, boundary detail 0, splat growth 0, card 104's
real-axis pose (dolly 20 steps toward c = -1.36 at height 0.2, then the
right-drag to (0.5, 0.92); the camera settles at the zoom clamp, distance
0.35, azimuth 2.4635). Rectangle: 440 by 520 px at (720, 40) of the 1280
by 720 canvas, to the right of the period-4 bulb's sheet, over the period-8
and deeper tails and the chaotic points beyond them (chosen from
`probe-pose-gpu-extreme-tail{0,0.3,0.6}.png`). Mean 8-bit luma inside it:

| Frame | Mean luma in the rectangle | Whole-frame mean | Points |
|---|---|---|---|
| current, tail 0 (`tail-density-current-tail0.png`) | 2.1934 | 8.024 | 1,465,224 |
| current, tail 0.3 (`tail-density-current-tail0.3.png`) | 3.1672 (1.444 times 0) | 9.720 | 4,345,224 |
| current, tail 0.6 (`tail-density-current-tail0.6.png`) | 3.5152 (1.110 times 0.3) | 10.394 | 7,225,224 |
| baseline, tail 0.6 (`tail-density-baseline-tail0.6.png`) | 3.0313 (current 0.6 is 1.160 times this) | 9.445 | 3,278,256 |

The plane: card 103's cardioid pose (top-down clamp, 40 wheel steps at the
centre, distance 0.35), its 240 by 240 px rectangle at (520, 240) and its
luma-40 threshold give a lit fraction of 0.343003 at tail 0 and 0.343003 at
0.6 on the tree under test (ratio 1.000;
`tail-density-plane-current-tail{0,0.6}.png`).

### 5. Defaults (`logs/defaults.log`, `defaults.json`, `defaults-*.png`)

1 pass (the log also holds a cost run: the cost test's original title
contained "defaults" and matched the grep; it was renamed afterwards). GPU
path, `extreme`, Tail refinement 0, boundary detail 1, camera parked at
the default view, three fresh contexts per tree. In cloud and hybrid
geometry, Inside-out and Period: `data-orbit3d-points` 5,505,160,
`-base-cells` 927,497, `-refined-sub-cells` 743,991 and `-slots` 688,145
on both trees exactly; `-refined-l2-sub-cells` 0 (and `-refined-l1-sub-cells`
0); hybrid `-band-points` 306,984 and `-hybrid-cloud-points` 958,392 on
both. Frame mean luma, three samples each, current / baseline: cloud
Inside-out 11.42588 / 11.42588, cloud Period 12.68043 / 12.68043, hybrid
Inside-out 8.63538 / 8.63538, hybrid Period 9.96979 / 9.96979; every sample
was identical to the baseline's to the last digit, well inside 1%.

### 6. Boundary detail (`logs/boundary-detail.log`, `boundary-detail.json`)

1 pass. GPU `extreme`, boundary detail 1, Tail refinement 0.3:
`data-orbit3d-boundary-detail` is `active`; `-refined-detail-sub-cells` is
743,991. The baseline's refined sub-cells are 988,781 at detail 1 and
244,790 at detail 0 at these settings, difference 743,991: ratio 1.000.
`-detail-base-slots` is 543,153, equal to `data-orbit3d-slots` on the tree
under test at the same settings with detail 0 (543,153), so the gate sits
above level 2 (level-2 sub-cells 134,002 at both detail settings). The
detail-1 cloud submits 8,385,160 points of the 16M raised budget.

### 7. Prebaked (`logs/prebaked.log`, `prebaked.json`, `prebaked-{current,baseline}.png`)

1 pass. `public/baked/lm-tiny.elpc` was baked with the card's command
(26,015 cells, 8 samples, manifest id `0.2M pts · 8 samples`; the baker is
unchanged and the same files were copied into the baseline tree). Selected
through Model source, both trees report `data-orbit3d-sampler="prebaked"`,
`data-orbit3d-layout="stacked"` and `data-orbit3d-points` 208,120 =
26,015 times 8 at Plotted iterations 8; the tree under test reports
`-refined-l2-sub-cells` 0 and `-detail-base-slots` equal to its 26,015 slots.

### 8. Cost (`logs/cost.log`, `grep-runs/cost.json`) and evidence (`logs/evidence.log`, `evidence.json`)

The per-criterion runs' JSON files are copied under `grep-runs/`; the
whole-spec run at the end rewrites the top-level copies, with identical
counts and luma figures and its own timings. The cost table below is the
standalone run (`grep-runs/cost.json`, `logs/cost.log`).

1 pass each. Cost: GPU `extreme`, three fresh contexts per tree per case,
cloud build as wall-clock from navigation to `data-orbit3d-build="complete"`,
warm render as the median of three runs of 90 requestAnimationFrame
intervals after 15 warm-up frames (`frameTiming`), with the GPU time of the
frame's draw calls from the same helper (`EXT_disjoint_timer_query_webgl2`)
alongside; run alone, nothing else on the GPU.

| Case | Measure | Current | Baseline | Ratio |
|---|---|---|---|---|
| Shipped defaults (detail 1, tail 0) | Build ms | 1,230 / 1,171 / 1,153 (median 1,171) | 1,088 / 1,152 / 1,125 (median 1,125) | 1.041 |
| | rAF interval median ms | 8.30 / 8.30 / 8.30 | 8.30 / 8.30 / 8.30 | 1.000 |
| | GPU frame ms | 6.29 / 6.35 / 6.37 | 6.29 / 6.29 / 6.31 | 1.010 |
| | Build bytes | 223,911,368 | 223,911,368 | equal |
| | Points | 5,505,160 | 5,505,160 | equal |
| Tail 0.6, detail 0 | Build ms | 1,241 / 1,130 / 1,231 (median 1,231) | 757 / 794 / 822 (median 794) | 1.550 |
| | rAF interval median ms | 27.10 / 27.10 / 27.00 | 15.90 / 15.90 / 15.90 | 1.704 |
| | GPU frame ms | 25.83 / 25.86 / 25.82 | 14.67 / 14.69 / 14.70 | 1.759 |
| | Build bytes | 291,494,085 | 143,529,798 | 2.031 |
| | Sampler bytes | 479,521,440 | 383,755,959 | 1.250 |
| | Points | 7,225,224 | 3,278,256 | 2.204 |

At the shipped defaults the build is the baseline's build: same tiers,
same counts, same bytes, build time within 4% and render time within 1%.
At 0.6 the rise is the second level: 3,945,778 level-2 rows in 360,000
slots add 2,880,000 submitted points (hidden rows included) to the
baseline's 3,278,256, and the GPU frame time follows the submitted points
sub-linearly (1.76 times for 2.20 times the points; the level-2 points are
small and weigh 0.06). The build takes 437 ms longer: 987,273 level-2 jobs
at warmup 2,000 through the GPU sampler, their packing, and the larger
attribute upload. Build bytes double because the attribute arrays scale
with the slots (903,153 against 409,782) and the level-2 tables are added.
The earlier contended run swept in by the `defaults` grep gave the same
ratios (1.011, 1.000, 1.003 at the defaults; 1.45, 1.69, 1.76 at 0.6), and
the whole-spec run (`cost.json`, `logs/spec-run.log`) gave 1.028, 0.988 and
0.994 at the defaults and 1.50, 1.70 and 1.76 at 0.6, with build bytes and
points identical in every run.

Evidence frames: `evidence-real-axis-current-tail0.png`,
`evidence-real-axis-current-tail0.3.png`,
`evidence-real-axis-current-tail0.6.png`,
`evidence-real-axis-baseline-tail0.6.png` (the criterion-4 pose; rectangle
means 2.193, 3.167, 3.515 and 3.031 as above),
`evidence-cardioid-current-tail0.6.png` and
`evidence-cardioid-baseline-tail0.6.png` (card 103's cardioid pose at 0.6;
lit fractions 0.343003 on both trees). In the real-axis frames the speckle
of tail points to the right of the period-4 sheet and along the chaotic
veil thickens from 0 to 0.3 to 0.6, and the baseline's 0.6 frame sits
between the current 0 and 0.3 frames; in the cardioid frames the lattice
is continuous on both trees with no gaps. Whether it looks good is the
operator's call. The evidence test also raises the slider from the drawer
on a `balanced` build and sees level-2 sub-cells appear after the rebuild.

### 1. Regression and frozen contracts

| Check | Command | Result |
|---|---|---|
| Red baseline | `npm run build:test && ORBIT_LEVELS=1 node --test src/app/orbitRefineLevels.contract.test.cjs` on the unchanged tree | 6 fail, each `card 105: <helper> is not implemented` (the stub) |
| Verify gate | `npm run verify` | typecheck, 425 tests (392 pass, 33 skipped, 0 fail), build green (`logs/verify.log`) |
| Contract gate | `scripts/check-contract-test-gate.sh --worktree` | exit 0 |
| Frozen levels contract | `npm run build:test && ORBIT_LEVELS=1 node --test src/app/orbitRefineLevels.contract.test.cjs` | 6 pass, 0 fail, 0 skipped |
| Frozen packing contract | `ORBIT_PACKING=1 node --test src/app/orbitPacking.contract.test.cjs` | 7 pass |
| Frozen hierarchy contract | `ORBIT_HIERARCHY=1 node --test src/app/orbitHierarchy.contract.test.cjs` | 4 pass |
| Smoke | `npx playwright test e2e/smoke.spec.ts --grep 'logistic-Mandelbrot\|Logistic Mandelbrot\|cyclic Magma\|orbit camera' --workers=1` | 7 pass, 40.5 s (`logs/smoke.log`) |
| Card 103 suite | `npx playwright test e2e/packed-cells.spec.ts --workers=1`, baseline served | first run 11 pass, 1 fail (`logs/packed-cells-run1.log`, see below); after the assertion update: see the row at the end of this table |
| Cycling | `npx playwright test e2e/inside-out-cycling.spec.ts --grep 'spread\|chaotic\|controls and cache' --workers=1`, baseline served | 6 pass, 57.6 s (`logs/cycling.log`) |
| Cycling contract | `INSIDE_OUT_CYCLING=1 npx playwright test e2e/inside-out-cycling.contract.spec.ts --workers=1` | 4 pass, 48.3 s (`logs/cycling-contract.log`) |
| Card 103 suite, rerun | as above | 12 pass, 5.2 min (`logs/packed-cells.log`); the plane-coverage baseline fractions are 0.343003 at 0 and at 0.6 |
| Whole new spec | `npx playwright test e2e/refine-levels.spec.ts --workers=1`, baseline served | 13 pass, 6.7 min (`logs/spec-run.log`), launched in the detached tmux session `refine-levels-105-spec` and waited for in the foreground; its JSON files are the top-level copies |

The card 103 assertion updated (deliverable 5): `plane coverage` asserted
`base6.fraction / base0.fraction < 0.8`, "baseline thins at 0.6". Card 103's
baseline was the stacked tree, which lost 40% of its lit cores at 0.6; the
baseline this card serves is cut after card 103, is packed, and under the
new rule the slider never touches the base grid on either tree, so its
cardioid lattice at 0.6 equals its lattice at 0 (lit fractions 0.343003
and 0.343003). The assertion now reads "baseline keeps its lattice at 0.6",
within 2% relative, and the test title says "and on the served baseline"
instead of "and thins on the baseline". No other 103 assertion asserted
the old rule: `base grid` asks for refined sub-cells non-decreasing from 0
to 0.3 to 0.6 (now 0, 378,792, 740,441 at extreme), `plotted` asks for
visible points equal to base rows plus refined rows, and `refinement
capacity` runs at tail 0, where this card changes nothing; all pass as
written.

## Memory

CPU-side build arrays stay sized to the point budget or to the candidate
grid; the level-2 tier adds no array sized to candidates times
`sampleCount`. The arrays this card adds on the CPU path are the level-1
candidate centres (16 bytes per candidate slot), the level-1 job record
(coordinates 16, parent index 4, sampled index 4 and tail mask 1 byte per
job) and the level-2 record (candidates 4 bytes each; coordinates 16,
parent index 4, sampled index 4 and admission order 4 bytes per job). The
measured excess of `data-orbit3d-build-bytes` over the baseline's at the
same setting, which also reflects the level-1 candidate cap now deriving
from the row budget, is:

| CPU preset | Tail | Current bytes | Baseline bytes | Excess |
|---|---|---|---|---|
| balanced | 0 and 0.3 | 84,680,768 | 80,858,712 | 3,822,056 |
| balanced | 0.6 | 85,160,768 | 80,858,712 | 4,302,056 |
| high | 0 and 0.3 | 123,873,125 | 117,713,716 | 6,159,409 |
| high | 0.6 | 127,501,017 | 117,713,716 | 9,787,301 |
| ultra | 0 and 0.3 | 177,326,640 | 169,298,016 | 8,028,624 |
| ultra | 0.6 | 186,749,556 | 169,298,016 | 17,451,540 |

On the GPU path the raised tier's accounting is untouched (build bytes are
equal at the shipped defaults); levels 1 and 2 count their packer tables,
rows per job, base-cell parents, level-2 parent indices and the level-1
next-level mask in `buildBytes`, and their job coordinates in
`samplerBytes` through the sampler's result, as the raised tier's always
were. The job records are retained for the hook while the cloud is live
(at extreme 0.6: 269,847 level-1 and 987,273 level-2 jobs, about 29 MB
including coordinates); they are released on the next rebuild.

## Should the default change?

Not in this card. What the measurements say for the operator and for
stage 106:

- The slider now does something on the GPU path. From 0 to 0.3 at
  `extreme` the cascade-tail rectangle gains 44% mean luminance and the
  tail cloud gains 378,792 sub-cells; from 0.3 to 0.6 it gains a further
  11% and 361,649 sub-cells, all of them level 2. The plane is unchanged
  throughout.
- The cost of 0.3 at the shipped detail 1: 8,385,160 points against
  5,505,160 and a build of 1,412 ms against 1,130 ms on this machine (the
  layout table's single loads). Render time was measured only at detail 0,
  where 2.20 times the points cost 1.76 times the GPU frame; the same
  scaling puts the detail-1 frame at about 1.4 times the shipped frame at
  0.3 and about 1.7 times at 0.6 (11,265,160 points). The shipped frame is
  6.3 ms of GPU time on this machine, so both would stay under a 60 Hz
  frame here.
- 0.6 is not better than 0.3 everywhere: at `performance` the level-2 pool
  fits at 0.3, at `balanced` it fits at 0.6, so above 0.3 the upper presets
  gain and the lower ones do not.
- On the CPU path the automatic 0.3 now costs 1.4 to 2.0 times the baseline
  build (balanced 3.0 s against 1.5 s, ultra 6.6 s against 4.5 s) and 0.6
  costs 2.5 times (ultra 11.6 s).

A default of 0.3 on the GPU path is supported by these numbers at the
price of about a quarter more build time and about 1.4 times the render
time at the shipped detail; 0.6 buys a further 11% in the tails at
`extreme` for about 1.7 times the render time. The operator decides; stage
106 is queued for it.

## Serving the baseline

The unchanged tree is `git archive 1c2abeb57` unpacked into the ignored
`build/refine-levels-105-baseline/` with `node_modules` symlinked from the
run worktree, served by `npx vite --port 5174 --strictPort` from a detached
tmux session `refine-levels-105-baseline`; the tree under test is served
by `npx vite --port 5173 --strictPort` from `refine-levels-105-current`.
`curl -s http://localhost:5174/src/app/orbitRefineLevels.ts | grep -c 'is
not implemented'` prints 5 on the baseline and 0 on the tree under test.
`public/baked/lm-tiny.elpc` and `index.json` were copied into the baseline
tree so the prebaked criterion reads the same bake on both. Both servers
were left up for the verifier.

## Unresolved limitations

- The level-2 pool saturates below the slider's maximum on the small
  presets: `performance` at 0.3 and `balanced` at 0.6 admit every level-2
  candidate, so the slider's upper half is inert there (level 1 was already
  whole at every setting). A third level or a widening subdivision is out of
  scope.
- Level 2's candidate reservoir is capped at twice its rows over 72, as
  level 1's is, so at 0.3 on `extreme` 29,697 of a pool above 109,697
  candidates are sampled; the stored set is a uniform subset of a uniform
  subset. The cap is what keeps the build time at 0.3 within 1.2 times the
  baseline's.
- On the CPU path `orbit3dReadRefineJobs(level, count).total` is the jobs
  sampled before the level's slots filled, which is not a multiple of 9 and
  not the candidate count; the GPU path samples every job.
- The hook's job records stay allocated while the cloud is live (about 29
  MB at extreme 0.6).
- Render time at Tail refinement above 0 with boundary detail 1 was not
  measured; the figures above extrapolate from detail 0.
- The headless requestAnimationFrame interval agreed with the GPU timer in
  every run here (8.3 ms at the defaults on both trees), unlike card 103's
  experience; the GPU timer is still reported alongside in `cost.json`.
