# Audit 106: Tail refinement at maximum, with sparse persisted choices

Stage card: `docs/stages/106-logistic-mandelbrot-tail-refinement-default.md`.
Worker: GPT-5.6 Sol, 2026-10-08. The run worktree was served on port 5173.
The dispatch base at `4f982833e` was archived and served on port 5174 for
criteria 2 to 6. Evidence is under the git-ignored
`e2e/artifacts/tail-default/`.

## Rules as built

- Stored parameter blobs are format 2. `__format: 2` is the first key and
  only schema-named values that differ from their descriptor defaults follow,
  in schema order. Undefined values and unknown keys are not stored.
- A blob is legacy unless its marker is the number 2. Legacy
  logistic-Mandelbrot blobs drop `tailRefinement` only when its value is the
  retired default 0; every other legacy value is kept. Current blobs are
  copied without migration. Inputs are never mutated.
- Both control-panel save paths use the sparse encoder. Restore migrates a
  legacy blob before applying schema values, and the marker is never treated
  as a parameter. Reset still clears the values blob.
- Tail refinement now defaults to its slider maximum, 0.6. On the GPU path 0
  is off. On the CPU fallback, 0 selects the automatic 0.3 share, positive
  values up to 0.3 are honoured, and higher finite values are capped at 0.3. The
  real-slice rule remains 0 on both paths.
- Existing browser suites explicitly store format 2 blobs. Their shared
  frozen parameters pin Tail refinement to 0 so their authored scenes do not
  silently move with the new default.

## Acceptance results

1. **Regression and frozen contracts: partial because of one inherited
   baseline contradiction.** `npm run verify` passed: 427 tests, 394 passed,
   33 intentionally skipped, 0 failed, followed by a successful production
   build. `scripts/check-contract-test-gate.sh --worktree` exited 0.
   Persistence passed 6/6, refinement levels 6/6, packing 7/7 and hierarchy
   4/4. The frozen cycling contract passed 4/4; the named smoke selection
   passed 7/7; packed cells passed 12/12; and the named cycling selection
   passed 16/16. The inherited refinement-level suite passed 13/13 against
   its own card-105 baseline (`1c2abeb57`), including its strict assertion
   that card 105 is denser than that older tree. Against this card's required
   dispatch baseline, its prebake check passes but the same strict assertion
   cannot: current and baseline Tail-refinement-0.6 luma are both exactly
   3.515236139854033, so `current > baseline` is false. The card also forbids
   changing that assertion. No frozen block or non-CPU assertion was edited.
2. **Default and build parity: pass.** The clean control snapshot reads Tail
   refinement 0.6 and Boundary detail 1; the imported descriptor reports
   default 0.6 and maximum 0.6; Reset returns Tail refinement to 0.6. Across
   three matched samples, the tree default and the dispatch baseline at
   explicit 0.6 were identical: 11,265,160 points, 927,497 base cells,
   244,790 level-1 sub-cells, 495,651 level-2 sub-cells, 1,484,432 total
   refined sub-cells, 1,408,145 slots, a 5,760,000-row refinement budget and
   mean luma 13.853319. Evidence: `e2e/artifacts/tail-default/default.json`.
3. **Legacy migration and explicit choices: pass.** A real blob captured from
   the served baseline contained `tailRefinement: 0`, `cycleBands: 1.5` and no
   marker. Loaded unchanged on the current tree it produced Tail refinement
   0.6 and Colour bands 1.5. Legacy 0.3 stayed 0.3; marked 0 stayed off. One
   changed control produced only its key after the marker. Reset immediately
   removed the blob and restored stable controls to defaults. The deliberate
   cascade reveal restarts Plotted iterations at 1 and advances it towards 96,
   so that transient control is not an instantaneous value-96 Reset assertion.
   Evidence: `e2e/artifacts/tail-default/legacy.json`.
4. **CPU cap: pass.** At Balanced, the default, explicit 0.3 and explicit 0.6
   each used 720,000 refinement rows, 103,134 base cells and 881,616 points.
   Explicit 0.1 used 240,000 rows and 401,616 points. Every build stayed below
   the 2,400,000-point budget. Three matched default builds had medians of
   3,081 ms on both trees, ratio 1.000. Evidence:
   `e2e/artifacts/tail-default/cpu.json`.
5. **Cost at shipped defaults: pass.** Three matched samples used the same
   browser and machine. Current-default versus baseline-explicit-0.6 build
   medians differed by 1.36%; GPU frame medians differed by 0.05%; bytes and
   points were exact. Evidence: `e2e/artifacts/tail-default/cost.json`.
6. **Operator evidence: pass.** Literal screenshot paths are listed below.
   On worker inspection the 0.6 views have visibly denser fine cascade tails
   and chaotic speckle than the old default. The Mandelbrot plane retains its
   base lattice and shows no new gaps; this is also supported by identical
   927,497 base-cell counts. Aesthetic quality remains the operator's call.

The exact whole-file command, `npx playwright test e2e/tail-default.spec.ts
--workers=1`, passed 5/5. Because the required filename itself contains
`tail-default`, Playwright's `--grep 'default'` command selects all five tests;
it still passes with no empty selection. The `legacy`, `cpu`, `cost` and
`evidence` grep names each select their intended test.

## Cost at the shipped defaults

Medians are from three matched headless loads. The headed requestAnimationFrame
interval is the median of three timing runs in one headed Chromium launch.

| Measure | Tree under test, default 0.6 | Served baseline, explicit 0.6 | Served baseline, old default 0 |
|---|---:|---:|---:|
| Cloud build wall-clock | 1,673 ms | 1,696 ms | 1,156 ms |
| GPU frame time | 25.775 ms | 25.764 ms | 6.263 ms |
| Headless frame interval | 27.0 ms | 26.9 ms | 8.3 ms |
| Headed display-link interval | 27.0 ms | 27.0 ms | 8.3 ms |
| Build bytes | 434,366,012 | 434,366,012 | 223,911,368 |
| Points | 11,265,160 | 11,265,160 | 5,505,160 |
| 60 Hz pacing implied by GPU time | misses 16.7 ms; at least 2 display frames | misses 16.7 ms; at least 2 display frames | fits within 1 display frame |

Against the old default, 0.6 raised median build time by 44.7%, GPU frame time
by 311.6%, build bytes by 94.0% and points by 104.6%. The headed result was
about 37 fps at 0.6 versus a 120 Hz-class 8.3 ms interval at 0 on this machine.

## Recommendation

Do not retain 0.6 as the desktop default on the measurements alone. It makes
the fine tails visibly denser, but doubles the submitted point count and build
storage, makes the build about 45% slower, and moves GPU rendering from safely
inside a 16.7 ms frame to about 25.8 ms. If the denser result is aesthetically
essential, keep 0.6 as the user-selectable maximum and measure a lower default
as the quality-cost compromise. The operator decides whether the visual gain
justifies the missed 60 Hz frame budget.

## Evidence paths

- Default view, tree default 0.6:
  `e2e/artifacts/tail-default/default-current-default.png`
- Default view, served baseline old default 0:
  `e2e/artifacts/tail-default/default-baseline-old-default.png`
- Default view, served baseline explicit 0.6:
  `e2e/artifacts/tail-default/default-baseline-explicit-0.6.png`
- Card-104 real-axis pose, tree default 0.6:
  `e2e/artifacts/tail-default/real-axis-current-default.png`
- Card-104 real-axis pose, served baseline old default 0:
  `e2e/artifacts/tail-default/real-axis-baseline-old-default.png`
- Machine-readable screenshot record:
  `e2e/artifacts/tail-default/evidence.json`

## Unresolved limitations

- The inherited refinement-level Tail-density assertion encodes a historical
  card-105-versus-card-104 comparison. It passes against that historical base
  but is logically impossible against this card's identical dispatch base.
  Resolving this requires the orchestrator to clarify the baseline contract or
  author a replacement assertion; the worker did not mutate it.
- The visual verdict is from one GPU, viewport and opening camera. The saved
  real-axis pose is more diagnostic than the opening view, but neither proves
  appearance across devices.
- GPU and display-link timing are machine-local and load-sensitive. The exact
  build identity and point/byte counts are deterministic; timing ratios are
  measured evidence, not a universal performance claim.
