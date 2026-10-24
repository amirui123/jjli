# Audit 107: a wider extreme candidate pool

Stage card: `docs/stages/107-logistic-mandelbrot-extreme-pool.md`. Worker:
Claude Fable 5.1, attempt 2, 2026-10-08, run worktree
`emergence-lab-run-107-logistic-mandelbrot-extreme-pool` on branch
`autometta/107-logistic-mandelbrot-extreme-pool`, dispatch base `dev` at
`fc28fdbe8`. Attempt 1's working tree was restored from the preserved commit
`50f3f0d8` (branch `wip/107-logistic-mandelbrot-extreme-pool-attempt-1`) as
the re-brief asked; its measurements of criteria 2, 3, 5, 6, 7 and 8 are
reproduced here to the digit. Evidence lives under the git-ignored
`e2e/artifacts/extreme-pool/` (`logs/` holds every command's output,
`scratch/` the probes that found the frame-time mechanism).

## Summary

`RESOLUTION_TARGETS.extreme` is 2560 by 2560. On a 1280 by 720 canvas the
candidate grid is 3413 by 1920 (6,552,960 cells, 1.7776 times the served
baseline's 2560 by 1440), the base tier packs 1,648,446 bounded cells into
2,568,535 rows (1.7758 times the baseline's, against the card's 2.57M
estimate), the two tail levels keep their 5.76M rows to within 0.02%, and
every build stays under its budget. The cardioid lattice is 1.75 times as
lit as the baseline's at card 103's pose and visibly finer in the evidence
frames.

Attempt 1 failed criterion 4 on one bar: at the desktop default (boundary
detail 1, Tail refinement 0.6) the GPU frame took 65.3 ms against the
baseline's 25.8 ms, 2.53 times, for the same 8.36M points the baseline-sized
cloud draws at 34 ms. This attempt found the mechanism and removed it. The
cost is the bytes of attribute buffers bound to one point draw: above a
threshold between 415 MB and 446 MB on this GPU (Apple M2 Max, ANGLE on
Metal) every rasterised point costs about twice as much, whatever the draw
actually reads. The detail-1 cloud on the wider pool is 492 MB of
attributes, and the raised tier, hidden at the opening pose, sat in the same
buffers as the lower tiers. The renderer now keeps the raised tier in its
own buffer set and draws it only while the camera is close enough to show
it, so the opening pose binds the lower tiers' 268 MB alone. The frame is
34.2 ms against 25.8 ms, 1.32 times (bar 1.5), with every published count,
byte figure and pixel of the hidden-tier frame unchanged.

Criterion 1's three failing tests were repaired where the pool legitimately
changes what they assume (card 105's `budget` test at `extreme` 0.3, the
cycling suite's period-2 sheet probe) or where the dispatch base already
made them impossible (card 106's `legacy` test); "Deliverable 4" names the
lines. All eight criteria hold; "Commands and results" has the runs.

## What changed

Over the dispatch base:

- `src/app/resolutionPreset.ts`: `extreme: 2560 * 2560`, with a comment that
  says what the pool feeds and why it is this size. The other four presets
  and `DEFAULT_RESOLUTION` are unchanged; the frozen contract reads 3 tests,
  2 pass, 1 fail on the unchanged tree (`logs/red-baseline.log`, the pool
  assertion: actual 3,686,400, expected 6,553,600) and 3 pass, 0 fail, 0
  skipped after the change (`logs/contract-green.log`).
- `src/app/orbit3d.ts`: the raised boundary-detail tier is uploaded into its
  own six attribute buffers and VAO (`PointBufferSet`, `detailBuffers`,
  `detailVao`, `detailPointCount`; `applyLiveCloud`, `uploadPointBlock`,
  `releaseDetailBlock`, `bindPointAttributes`, the draw branch
  `detailStoredApart`, `readPointAttribute`). See "Why the GPU frame doubled,
  and the fix". The builder's output, the planner, the shader, the layout
  statistics the canvas publishes and the hidden-tier pixels are unchanged.
- `src/app/orbitSampler.ts`: unchanged (see Deliverable 2).
- `e2e/harness/packedCells.ts`: `PRESET_TARGETS` is the production
  `RESOLUTION_TARGETS`, imported from `src/app/resolutionPreset.ts`, and the
  `ResolutionPreset` type is re-exported from there.
- `e2e/extreme-pool.spec.ts` (new): the seven tests of criteria 2 to 8,
  describe titles `layout`, `plane`, `cost`, `boundary detail`, `cpu`,
  `prebaked`, `evidence`. Over attempt 1 the cost test also times the frame
  with the raised tier shown (card 104's real-axis pose) and records page
  incidents (see "Unresolved limitations").
- Re-pointed and repaired tests: see "Deliverable 4".
- `src/app/controls.ts`, `tsconfig.test.json`: unchanged.

## Deliverable 2: the planner, the sampler and the renderer

The planner and the sampler needed nothing. The lines checked, on the
dispatch base:

- `src/app/orbit3d.ts` 707-710, `pointBudgetFor` (4462-4468 on the base)
  and `surfaceGridSizeFor`: the ceilings are `performance`, `balanced`,
  `high` and `ultra` only, each times 1.01; anything above
  `ULTRA_CELL_CEILING` (1,654,784 cells) is `extreme`. A 3413 by 1920 grid
  classifies as `extreme` for both the point budget
  (`data-orbit3d-point-budget` reads 9,600,000 at detail 0 and 16,000,000
  at detail 1 in every row below) and the surface grid (768).
- `orbitCloudBuildPlan`: `candidateCells = min(inputWidth * inputHeight,
  desiredCells)` with `desiredCells = ceil(baseRowBudget / (rowsPerCell *
  0.22))`. At Tail refinement 0.6 the base row budget is 3,840,000,
  `estimatePackedRowsPerCell(8)` is 1.6167, so `desiredCells` is 10,796,626
  and the pool of 6,552,960 is the smaller; at 0 the budget is 9,600,000
  and `desiredCells` is 26,991,565. The grid reaches the whole pool at
  every setting, which `data-orbit3d-candidate-cells` confirms (6,552,960 in
  every `extreme` row). `sampleWidth = round(sqrt(6,552,960 * 3413 / 1920))
  = 3413`, `sampleHeight = ceil(6,552,960 / 3413) = 1920`.
- `src/app/renderer.ts` `computeGridSize` and `gridMaxDim` (871, 886):
  `extreme` is a floor as well as a ceiling, and a grid side is clamped to
  `min(MAX_TEXTURE_SIZE, 4096)`. 3413 is under 4096, so the 1280 by 720
  canvas is not clamped (see "Unresolved limitations" for wider canvases).
- `src/app/orbitSampler.ts` 1030 (`MAX_SAMPLE_JOBS_PER_CALL = 1 << 22`) and
  1587-1604 (`sampleInBatches`): the base sweep is handed to
  `sampleInBatches`, which splits 6,552,960 jobs into calls of 4,194,304
  and 2,358,656 and returns null, never a partial result, if a call fails.
  The limit is not raised. The classification pass indexes the per-cell
  masks by `first + local` across batches, and `data-orbit3d-base-cells`
  equals `data-orbit3d-bounded-candidates` (1,648,446) in every row, so no
  job was dropped.
- `src/app/orbitSampler.ts` 720-733 (`createTargets`): width is
  `min(MAX_TEXTURE_SIZE, jobs)`, height `ceil(jobs / width)`, and the check
  throws when `height > MAX_TEXTURE_SIZE` or the sample layers exceed
  `MAX_ARRAY_TEXTURE_LAYERS`. `layout.json` records `maxTextureSize` 16384
  from this machine's WebGL2 context, so the two base batches are 16384 by
  256 and 16384 by 144 pixels with `ceil(8 / 4) = 2` layers, far inside both
  limits.
- The build's CPU arrays are sized to `maxSlots` (the point budget over the
  sample count) and to the candidate grid, never to candidates times
  `sampleCount`; the sampler's readback arrays are per batch and are
  reported as `data-orbit3d-sampler-bytes`.

The renderer did need a change, for the reason the next section measures.

## Why the GPU frame doubled, and the fix

Attempt 1 bracketed a threshold between 399 MB and 446 MB of resident
attribute buffers but could not say what about the buffers mattered. Three
probes in `e2e/scratch-gpu-offset.spec.ts` (run in this attempt, then
removed from the tree; results under `scratch/`, logs `logs/scratch-*.log`)
separated the hypotheses, all on the wider pool at Tail refinement 0.6 with
the GPU timer of card 103's helper:

| Probe | What changed | Frame before | Frame after | Reads |
|---|---|---|---|---|
| `scratch/in-app-current.json` | detail 1 (492 MB bound): the eight hidden-tier row draws re-issued through a `drawArrays` wrapper that advanced every attribute pointer by the row's offset and drew from vertex 0, so no draw started past 2^27 bytes | 65.37 ms | 66.39 ms (65.33 restored) | the draw's starting offset is not the cause |
| `scratch/dummy-buffer.json` | detail 0 (268 MB bound): a 230 MB buffer allocated on the same context and never bound to an attribute | 34.10 ms | 34.13 ms (34.13 released) | total allocation on the context is not the cause |
| `scratch/grow-all.json` | detail 0: the six bound buffers re-allocated at 1.84 times their size with the data kept in the prefix, the draws and the data they read unchanged (267,581,952 to 492,350,808 bytes) | 35.49 ms | 67.78 ms | the bytes bound to the draw are the cause |
| `scratch/grow-positions-only.json` | detail 0: only the positions buffer grown (to 351,870,268 bytes bound) | 34.74 ms | 35.41 ms | |
| `scratch/grow-scalars-only.json` | detail 0: only the five scalar buffers grown (to 408,062,492 bytes bound) | 34.31 ms | 34.23 ms | |
| `scratch/grow-all-x1.3.json` | detail 0: all six at 1.3 times (347,856,544 bytes) | 34.19 ms | 34.24 ms | |
| `scratch/grow-all-x1.55.json` | detail 0: all six at 1.55 times (414,752,032 bytes) | 34.19 ms | 34.20 ms | the threshold is above 415 MB |

With attempt 1's measurement of 57.9 ms at Tail refinement 0.45 (446 MB of
attributes), the threshold on this GPU lies between 415 MB and 446 MB of
attribute buffers bound to one draw. Above it each rasterised point costs
about twice as much; the draw's range, its starting offset and the
context's other allocations do not matter. A standalone probe
(`scratch/micro-offset.json`) that timed 2M-point draws at offsets up to
168 MB into a 192 MB buffer on a 64 by 64 target was inconclusive (6.6 to
13.8 ms with no step at any offset) because blend overdraw on so small a
target dominated it; it is recorded, not relied on. The mechanism inside
ANGLE's Metal backend was not identified.

The fix follows from the probes. The builder lays every tier out in one
sample-major block, lower tiers first and the raised tier after them in
each row. `applyLiveCloud` now splits that block at upload: slots
`[0, boundaryDetailBaseSlots)` of every row go to the main buffers as a
block `boundaryDetailBaseSlots` wide, which is byte for byte the cloud a
detail-0 build at the same settings uploads, and the raised tier's slots go
to a second set of six buffers and a second VAO as a block of their own
(`uploadPointBlock`, per-row `bufferSubData` from the builder's arrays, no
CPU copy). The draw submits the lower tiers' block in one contiguous
`drawArrays` with `u_cellCount` at its own width and nothing raised in it,
and binds the raised tier's VAO for a second draw, with `u_cellCount` at
the raised width and `u_boundaryDetailBaseCellCount` at 0 so every point
takes the fade opacity, only while the tier is shown or fading
(`detailStoredApart` branch). At the opening pose, distance 5.1 against the
show distance of 2.8, the frame binds 268 MB and draws exactly the vertices
it drew before with the same `cellId` per vertex, so the hidden-tier pixels
are unchanged. A build without a raised tier (detail 0, the CPU fallback,
the stacked hybrid fallback, a prebaked cloud) releases the second set and
takes the previous code paths unchanged; `readPoints` reads across both
blocks so the hierarchy hook still reaches every point;
`data-orbit3d-points`, `-slots`, `-detail-base-slots`, `-build-bytes` and
`-sampler-bytes` are the same figures as before.

Measured after the change (`scratch/in-app-current.json` from the second
scratch run, `logs/scratch-in-app-after-split.log`): detail 1 at 0.6 on the
tree under test 34.24 ms, against 65.37 ms before and 34.15 ms for the
detail-0 cloud of the same 8.36M points. The cost criterion's figures are
below.

## Deliverable 3: the harness follows the production targets

`PRESET_TARGETS` in `e2e/harness/packedCells.ts` is `RESOLUTION_TARGETS`
itself. The `base grid` tests of `packed-cells.spec.ts` assert
`data-orbit3d-candidate-cells` within 2% of the target: 6,552,960 against
6,553,600 is 0.01%.

## Deliverable 4: re-pointed comparisons and repaired expectations

The card names four tests to re-point. Attempt 1 found four more places
where the two trees are compared at `extreme` by an exact count or a tight
bound that the wider pool legitimately changes, and this attempt repaired
the three expectations the re-brief lists. Every assertion is kept unless
the row says otherwise; only the preset moves, or the expectation is
restated in terms of the rule it was checking. The lines are after the
edit.

| File | Lines | Test | Change | Why the pool changes it |
|---|---|---|---|---|
| `e2e/refine-levels.spec.ts` | 394 | `defaults` | `extreme` to `ultra` (card-listed) | exact points, base cells, slots and luma within 1% |
| `e2e/refine-levels.spec.ts` | 516 | `cost` | `extreme` to `ultra` (card-listed) | build time and warm render within 20%, build bytes equal |
| `e2e/refine-levels.spec.ts` | 445 | `boundary detail` | `extreme` to `ultra` | raised-tier sub-cells within 1% of the baseline's; this card's criterion 5 expects 1.5 to 1.9 and measures 1.73 |
| `e2e/refine-levels.spec.ts` | 148-157 | `budget › gpu extreme` | the `level 2 present` assertion restated as the rule: level 2 may be empty only when level 1 packed the whole share (budget minus level-1 rows under two slots' worth); otherwise the old assertion holds | at 0.3 on the wider pool level 1 alone needs 3,260,155 rows against the 2,880,000 the slider grants, fills 360,000 slots (387,832 sub-cells, 2,879,991 rows) and leaves level 2 none; `logs/refine-levels-chunk1.log` |
| `e2e/tail-default.spec.ts` | 167, 171 | `default` | `extreme` to `ultra` (card-listed) | `buildSignature` equality and luma within 1% |
| `e2e/tail-default.spec.ts` | 333, 358 | `cost` | `extreme` to `ultra` (card-listed) | build within 10%, points and build bytes equal, GPU frame within 10% |
| `e2e/tail-default.spec.ts` | 197-205 | `legacy` | the pre-106 blob is written as that version wrote it (every parameter, no marker, Tail refinement at its retired default of 0, cycleBands 1.5) instead of harvested from the served baseline; both assertions on the blob and every migration assertion kept | independent of the pool: a baseline cut after card 106 stores the sparse format itself, so `tailRefinement` is absent from what it writes (attempt 1 read `undefined` against 0 on both trees) |
| `e2e/packed-cells.spec.ts` | 186-189 (and the message on 199) | `plane coverage` | `extreme` to `ultra` | the "lattice resolved" ceiling of 0.6 on the lit fraction; the tree under test reads 0.6012 at `extreme` (`plane.json`) |
| `e2e/packed-cells.spec.ts` | 401 | `brightness` | `extreme` to `ultra` | frame luma within 5% of the baseline; attempt 1 measured 9.0% brighter at `extreme` (the denser plane) |
| `e2e/packed-cells.spec.ts` | 502, 520, 569 | `cost` | `extreme` to `ultra` | warm render and real-display interval within 20% of the baseline |
| `e2e/inside-out-cycling.spec.ts` | 980 (`compareBuildCosts`, the init script) | `controls and cache` timing test and `hierarchy: cost cloud` | the helper pins `el:resolution` to `ultra` | it opened the desktop default and asserts points no greater than the baseline's, build and render within 20%, and exact point equality |
| `e2e/inside-out-cycling.spec.ts` | 373-377 | `spread › two sheets over a period-2 point share hue in the real route` | the test pins `el:resolution` to `ultra` before opening; every assertion kept | the denser hybrid cloud at `extreme` bleaches the lower sheet's already near-white sample under the chroma floor (0.0146 against 0.0261 on the baseline, floor 0.02, as attempt 1's chroma probe measured; its artefacts did not survive that worktree, so the figures are quoted here); at `ultra` both trees read 0.0547 |

The four rows marked only "extreme to ultra" without "card-listed" and the
three repairs are outside the card's enumerated list and are deliberate:
without them criterion 1's suites cannot pass on any tree with a wider
pool, for the reasons in the table, and each keeps the property the test
was written to check. No production file and no frozen block was touched
for them. Comparisons that remain at `extreme` on purpose: tests that read
one tree only (`base grid`, `budget`, `plotted`, `tail density`'s own-tree
ratios), the prebaked tests (that path is unchanged and reads identically
on both trees), the layout tables (which assert only the budget), and every
evidence test.

## Serving the baseline

The unchanged tree is `git archive fc28fdbe8` (the dispatch base) unpacked
into the ignored `build/extreme-pool-107-baseline/` with `node_modules`
linked from the run worktree, served by `npx vite --port 5174 --strictPort`
in the detached tmux session `extreme-pool-107-baseline`; the tree under
test is served the same way on port 5173 in `extreme-pool-107-current`. The
bake (criterion 7) is linked into the baseline tree's `public/baked` with a
relative symlink. The trees are told apart by
`curl -s http://localhost:517N/src/app/resolutionPreset.ts | grep -c '2560 \* 2560'`:
1 on 5173, 0 on 5174. Both sessions were left running for the verifier.

Both ports were held when this attempt began, by a tmux session
`lm-review` created for attempt 1's review (5173 serving the main checkout,
5174 the superseded attempt-1 worktree). That review was over, the card pins
these ports, so the session was closed before the servers above started.

One deviation from the audit 100 recipe, forced by this machine on the day
(see "Unresolved limitations" for the measurements): in this machine's
Chromium every page served by a plain `npx vite` lost its HMR websocket 7
to 63 seconds after opening, whereupon Vite's dev client reloaded the page
under the test, resetting the camera and destroying any `page.evaluate` in
flight. Both servers were therefore restarted with `--config` pointing at
`build/vite.nohmr.config.mjs` (in the ignored `build/`, not a
deliverable). Its only effect is a middleware that serves the dev client
module `/@vite/client` with its lost-connection branch disabled (the
string `if (payload.event === "vite:ws:disconnect") {` becomes `if (false)
{`), so a dropped socket is ignored rather than answered with a reload;
the client logs nothing but `[vite] connected.`, and the application
served is unchanged. Refusing the upgrade instead was tried first and
rejected: it stops the reloads but the client then logs two console
errors, which card 100's `controls and cache` test counts. Every result
cited below from `refine-levels-tail-density-rerun.log`,
`smoke-rerun-manual-zoom.log`, `tail-default.log`, `cycling-chunkA.log`,
`cycling-chunkB.log` and `extreme-pool-full.log` was taken on servers
without reloads: the first four on the upgrade-refusing variant, which
none of those suites notices, and the cycling chunks on the patched-client
variant, which is the one left running. The earlier chunks were taken on
plain servers and are kept where a reload could only have failed them,
not passed them. The verifier should serve both trees the same way if a page's
console shows `[vite] server connection lost`:

```sh
npx vite --config build/vite.nohmr.config.mjs --port 5173 --strictPort
```

The config file is reproduced here in full, since `build/` does not
travel with the tree:

```js
export default {
  plugins: [{
    name: "ignore-hmr-disconnect",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== "GET" || !request.url?.startsWith("/@vite/client")) return next();
        const result = await server.transformRequest("/@vite/client");
        const needle = 'if (payload.event === "vite:ws:disconnect") {';
        if (!result || !result.code.includes(needle)) return next();
        response.setHeader("Content-Type", "text/javascript");
        response.setHeader("Cache-Control", "no-cache");
        response.end(result.code.replace(needle, "if (false) {"));
      });
    },
  }],
};
```

## Layout at `extreme` on both trees (criterion 2)

GPU path, camera pinned, cloud geometry. "Current" is the tree under test.
Rows and sub-cells are `data-orbit3d-*` as published; build ms are single
loads of the whole-spec run (`layout.json`, `boundary-detail.json`,
`cost.json`; `logs/layout.log`, `logs/boundary-detail.log`, `logs/cost.log`).

| Tree | Detail | Tail | Candidate cells | Bounded | Base cells | Base rows | Row budget | L1 sub-cells / rows | L2 sub-cells / rows | Raised sub-cells | Points | Slots | Build bytes | Sampler bytes | Build ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| current | 0 | 0.6 | 6,552,960 | 1,648,446 | 1,648,446 | 2,568,535 | 5,760,000 | 439,091 / 3,260,155 | 313,104 / 2,495,401 | 0 | 8,361,936 | 1,045,242 | 349,513,564 | 742,460,892 | 1,373 |
| baseline | 0 | 0.6 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 5,760,000 | 244,790 / 1,810,915 | 495,651 / 3,945,778 | 0 | 7,225,224 | 903,153 | 291,494,085 | 479,521,440 | 1,090 |
| current | 1 | 0.6 | 6,552,960 | 1,648,446 | 1,648,446 | 2,568,535 | 5,760,000 | 439,091 / 3,260,155 | 313,104 / 2,495,401 | 1,285,771 | 15,364,128 | 1,920,516 | 595,874,923 | 939,807,392 | 2,075 (cost median; the boundary-detail load read 6,280 once) |
| baseline | 1 | 0.6 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 5,760,000 | 244,790 / 1,810,915 | 495,651 / 3,945,778 | 743,991 | 11,265,160 | 1,408,145 | 434,366,012 | 601,945,140 | 1,625 (cost median; 1,705 in the boundary-detail load) |
| current | 0 | 0 | 6,552,960 | 1,648,446 | 1,648,446 | 2,568,535 | 0 | 0 | 0 | 0 | 2,601,936 | 325,242 | 143,968,686 | 635,637,120 | 1,057 |
| baseline | 0 | 0 | 3,686,400 | 927,497 | 927,497 | 1,446,428 | 0 | 0 | 0 | 0 | 1,465,224 | 183,153 | 81,039,441 | 357,580,800 | 670 |

Point budgets: 9,600,000 at detail 0 and 16,000,000 at detail 1 on both
trees; `data-orbit3d-layout` is `packed` and `data-orbit3d-sampler` is
`gpu-sampled` in every row. `detailBaseSlots` equals the slot count at
detail 0 (1,045,242 current, 903,153 baseline). On the tree under test the
detail-1 row's 1,920,516 slots are now two GPU blocks, 1,045,242 lower-tier
slots and 875,274 raised slots; the published slot count is their sum.

Ratios, current over baseline: candidate cells 1.7776, bounded cells and
base cells 1.7773, base rows 1.7758, level-1 plus level-2 rows 0.9998
(5,755,556 against 5,756,693), raised sub-cells 1.7282, points 1.157 at
detail 0 and 1.364 at detail 1. The bounded share is 25.16% on both trees
and the base tier packs 1.558 rows a bounded cell against the baseline's
1.559, which is why the card's scaled estimate (2.57M rows) lands on the
measurement (2,568,535). The base tier uses 325,242 of the 480,000 slots
its cap allows at 0.6.

At `ultra`, Tail refinement 0.6 and 0, the two trees are identical in
candidate cells (1,638,720), base cells (412,384), refined sub-cells
(370,197 and 0), points (3,531,608 and 651,608) and slots (441,451 and
81,451), and also in build bytes (140,401,861 and 36,033,952) and sampler
bytes (215,949,645 and 158,955,840).

Level 1 is larger on the tree under test (439,091 sub-cells against
244,790, from 476,307 jobs, 52,923 candidates, under the candidate cap at
both settings) because the wider grid has 1.78 times the tail cells. At 0.6
its 3,260,155 rows fit under the 5,760,000 budget and level 2 takes the
2,495,401 rows left (against the baseline's 3,945,778); the sum is the
budget on both trees. At 0.3 the same survivors need more rows than the
2,880,000 the slider grants, so level 1 fills all 360,000 of that share's
slots (387,832 sub-cells, 2,879,991 rows) and level 2 gets no slots, where
the baseline packs 134,002 level-2 sub-cells in 1,066,508 rows. The
slider's 0.3 setting therefore has no second level at `extreme` on the
wider pool; it reappears at 0.6. This is the unchanged refinement rule
meeting a larger tail pool; card 105's `budget` test now states the rule
(see Deliverable 4) and the "Recommendation" names it as a decision.

## Plane coverage (criterion 3)

Card 103's pose: top-down clamp, then 40 wheel steps at the viewport
centre (the default orbit target, c = (-0.5, 0)), distance 0.35, azimuth
2.4635; rectangle 240 by 240 px at (520, 240) of a 1280 by 720 canvas;
8-bit luma threshold 40; splat growth 0; Tail refinement 0.6; boundary
detail 0 (`plane.json`, `logs/plane.log`).

| Frame | Preset | Lit fraction |
|---|---|---|
| `plane-current-extreme.png` | extreme | 0.6012 |
| `plane-baseline-extreme.png` | extreme | 0.3430 |
| `plane-current-ultra.png` | ultra | 0.1856 |
| `plane-baseline-ultra.png` | ultra | 0.1856 |

Ratios: extreme 1.7527 (bar: at least 1.15); ultra 1.0000 (bar: within
2%). The baseline's 0.3430 is card 103's 0.3430 to four places. In the
frames the baseline's cardioid interior is a dotted lattice and the tree
under test's reads as a near-continuous sheet with the lattice still
visible; there are no gaps in either.

## Cost at the desktop default (criterion 4)

GPU `extreme`, boundary detail 1, Tail refinement 0.6, cycle speed 0.1, 4
bands, edge glow 0.2, camera pinned; three matched loads per tree in fresh
contexts, interleaved, with card 103's timing helper on each load (one run
of 15 warm-up plus 90 frames, GPU time from
`EXT_disjoint_timer_query_webgl2`, no disjoint events); one headed launch
for both trees with three timing runs each. Two complete runs are
reported: the whole-spec run (`cost.json`, `logs/extreme-pool-full.log`)
and the per-criterion run before it (`logs/cost.log`), the same code both
times.

| Measure | Current | Baseline | Ratio | Bar |
|---|---|---|---|---|
| Cloud build wall-clock, ms (whole-spec run) | 2,037 / 2,405 / 2,075 (median 2,075) | 1,613 / 1,786 / 1,625 (median 1,625) | 1.277 | at most 2.2: holds |
| Cloud build wall-clock, ms (per-criterion run) | 4,296 / 2,126 / 2,308 (median 2,308; the first load was cold) | 1,694 / 1,774 / 1,660 (median 1,694) | 1.362 | holds |
| GPU frame time, headless, ms (whole-spec run) | 34.24 / 35.40 / 34.38 (median 34.38) | 25.83 / 25.93 / 25.86 (median 25.86) | 1.329 | at most 1.5: holds |
| GPU frame time, headless, ms (per-criterion run) | 35.41 / 35.38 / 34.22 | 25.96 / 26.18 / 25.88 | 1.363 | holds |
| GPU frame time, headed, ms (whole-spec run) | 34.27 / 34.21 / 34.20 | 25.78 / 25.79 / 25.79 | 1.33 | recorded |
| Headed display-link rAF interval, ms (p90) (whole-spec run) | 35.5 / 35.4 / 36.7 (35.8 / 35.7 / 38.2) | 27.0 / 27.0 / 27.0 (27.2 to 27.3) | 1.315 | recorded, no bar |
| Headed display-link rAF interval, ms (per-criterion run) | 35.5 / 36.8 / 36.7 | 27.6 / 27.4 / 27.4 | 1.339 | recorded, no bar |
| Headless rAF interval, ms (p90) (whole-spec run) | 35.4 / 36.7 / 35.6 (35.7 / 38.1 / 35.9) | 27.0 / 27.1 / 27.0 (27.3) | 1.318 | recorded |
| Build bytes | 595,874,923 | 434,366,012 | 1.372 | at most 1.5: holds |
| Sampler bytes | 939,807,392 | 601,945,140 | 1.561 | at most 1.9: holds |
| Points | 15,364,128 | 11,265,160 | 1.364 | |
| Display frames at 60 Hz implied by the GPU time | 3 (34.2 ms misses 16.7 ms; 2.05 frames) | 2 (25.8 ms misses 16.7 ms) | | |

Both trees miss a 16.7 ms display frame at these settings; the baseline
did so already on card 106 (25.775 ms there). Under the display link the
tree under test paces at about 36 ms (28 frames a second) and the baseline
at 27 ms (37). Attempt 1's 65.3 ms is gone: the frame now costs what the
same 8.36M submitted points cost at boundary detail 0 (34.1 ms), 1.32 times
the baseline's for 1.16 times the points, 4.1 against 3.6 ms per million.

### Where the frame time goes now

The same helper at boundary detail 0 and with the raised tier shown
(`cost.json`, fields `breakdown` and `shown`, whole-spec run):

| Tree | Pose | Detail | Tail | Points in the buffers | Points submitted | Bound attribute bytes | GPU ms | rAF interval ms | Build ms |
|---|---|---|---|---|---|---|---|---|---|
| baseline | opening | 0 | 0 | 1,465,224 | 1,465,224 | 46.9 MB | 6.37 | 8.3 | 651 |
| current | opening | 0 | 0 | 2,601,936 | 2,601,936 | 83.3 MB | 11.86 | 14.4 | 1,044 |
| baseline | opening | 0 | 0.6 | 7,225,224 | 7,225,224 | 231.2 MB | 25.80 | 27.0 | 1,129 |
| current | opening | 0 | 0.6 | 8,361,936 | 8,361,936 | 267.6 MB | 34.14 | 35.4 | 1,378 |
| baseline | opening | 1 | 0.6 | 11,265,160 | 7,225,224 | 360.5 MB (one block) | 25.86 | 27.0 | 1,625 |
| current | opening | 1 | 0.6 | 15,364,128 | 8,361,936 | 267.6 MB (lower tiers' block; the raised tier's 224.1 MB is not bound) | 34.38 | 35.6 | 2,075 |
| baseline | real-axis zoom, tier shown | 1 | 0.6 | 11,265,160 | 11,265,160 | 360.5 MB | 5.91 (5.58 per-criterion) | 8.3 | |
| current | real-axis zoom, tier shown | 1 | 0.6 | 15,364,128 | 15,364,128 | 267.6 MB and 224.1 MB in two draws | 8.13 (8.13) | 8.3 | |

Bound bytes are 32 a point (six Float32 attributes). The raised tier is
hidden at the opening pose on both trees (`data-orbit3d-camera-distance`
5.098 against the show distance of 2.8), so both submit the points they
submit at detail 0, and on the tree under test the frame now costs the
same as at detail 0. With the tier shown at card 104's real-axis pose
(distance 0.35, the zoom clamp), both trees draw every point they hold and
the frame is short because few of them are on screen: 8.1 ms against 5.9
ms, inside a 60 Hz frame on both. The two-draw frame on the tree under test
binds 268 MB and 224 MB in turn, each under the threshold.

### The kernel's own grid arrays (Deliverable 6)

`LogisticMandelbrotKernel.init` (`kernel.ts` 360-406) allocates `state`
(`cells * CHANNEL_COUNT`, two Float32 channels) and `samples` (`cells *
sampleCount`). The orbit3d renderer is a direct-rendering backend
(`webglRenderer.ts` 1452, `supportsDirectRendering`), and
`Renderer.reinitGrid` (`renderer.ts` 804) calls `kernel.init(1, 1, ...)`
for direct backends, so the kernel's arrays are 8 bytes and 32 bytes at 8
samples whatever the pool. Had `init` been given the full grid: 2560 by
1440 cells would take 29.5 MB of `state` plus 118.0 MB of `samples`
(147.5 MB), and 3413 by 1920 would take 52.4 MB plus 209.7 MB (262.1 MB).
The arrays the pool actually grows are the builder's candidate-grid arrays
(`baseCoordinates`, 16 bytes a cell, 104.8 MB; the escape, tail and
rows-per-cell masks, 3 bytes a cell, 19.7 MB), counted in
`data-orbit3d-build-bytes`, and the sampler's per-batch readback, counted
in `data-orbit3d-sampler-bytes`.

## Boundary detail keeps its gating (criterion 5)

GPU `extreme`, boundary detail 1, Tail refinement 0.6
(`boundary-detail.json`, `logs/boundary-detail.log`):
`data-orbit3d-boundary-detail` is `active`; `-detail-base-slots` is
1,045,242, equal to `data-orbit3d-slots` on the tree under test at the same
settings with boundary detail 0; `-refined-detail-sub-cells` is 1,285,771
against the baseline's 743,991, a ratio of 1.7282 (bar 1.5 to 1.9). Points
15,364,128 of the 16,000,000 detail budget. The gate is now also a storage
boundary: the 1,045,242 slots below it are the main buffers and the 875,274
above it the raised tier's.

## The CPU fallback at `extreme` (criterion 6)

`?orbit3dSampler=cpu`, `extreme`, no `tailRefinement` key, boundary detail
0, camera pinned, one sample each (`cpu.json`, `logs/cpu.log`; the
whole-spec run's figures, with the per-criterion run's build times in
brackets):

| Tree | Build ms | Candidate cells | Bounded | Base rows | Row budget | L1 sub-cells / rows | L2 sub-cells / rows | Points | Build bytes |
|---|---|---|---|---|---|---|---|---|---|
| current | 15,900 (15,406) | 6,552,960 | 1,648,445 | 2,568,535 | 2,880,000 | 387,791 / 2,879,996 | 0 / 0 | 5,448,536 | 381,588,760 |
| baseline | 14,208 (13,152) | 3,686,400 | 927,510 | 1,446,532 | 2,880,000 | 244,841 / 1,811,379 | 134,228 / 1,068,308 | 4,326,536 | 357,405,660 |

The build completes in 15.9 s (test timeout 900 s), the candidate grid is
the whole pool (within 0.01% of 2560 by 2560), `data-orbit3d-sampler` is
`cpu-sampled`, and `data-orbit3d-refine-row-budget` is 2,880,000, exactly
`floor(9,600,000 * 0.3)`. The fallback reads the missing key as its
automatic share of 0.3. The tree under test took 1.12 times the baseline's
build time (1.17 in the per-criterion run; 13.7 s on attempt 1). One
qualitative change: with 1.78 times the tail candidates, level 1 alone
fills the 360,000 slots that share allows (2,879,996 of 2,880,000 rows), so
level 2 gets no slots on the CPU path at `extreme`, where the baseline
packs 134,228 level-2 sub-cells.

Should the fallback cap its pool at `ultra`? Not on cost: 15.9 s against
14.2 s, and the ultra fallback took 6.6 s on card 105, so the cap would
save about ten seconds on a path that is already a fallback. The reason to
consider it is the lost second level, which a cap would restore (card 105
measured 83,061 level-2 sub-cells at CPU `ultra`) at the price of the finer
base lattice. Recommendation: do not cap; if the operator wants the second
level on the fallback, the lever is the fallback's automatic share, which
is a kernel default and out of this card's scope.

## The prebaked path is unchanged (criterion 7)

`public/baked/lm-tiny.elpc` baked in the run worktree with `npm run
build:test && node scripts/bake-orbit3d.mjs --points 2e5 --warmup 2000
--samples 8 --out public/baked/lm-tiny.elpc` (`logs/bake.log`: 26,015
cells, 8 samples, 208,120 points, 2 MB) and linked into the baseline tree.
Selected through Model source as `0.2M pts · 8 samples` on both trees
(`prebaked.json`, `logs/prebaked.log`): `data-orbit3d-sampler` is
`prebaked`, `data-orbit3d-layout` is `stacked`, and `data-orbit3d-points`
is 208,120, the bake's 26,015 cells times 8 at Plotted iterations 8, on
both. Frames `prebaked-current.png` and `prebaked-baseline.png`.

## Evidence for the operator (criterion 8)

Shipped defaults (boundary detail 1, Tail refinement 0.6, 4 bands, edge
glow 0.2) with the camera and the colour phase pinned so the two trees are
framed alike, `extreme`, GPU (`evidence.json`, `logs/evidence.log`):

| Frame | Tree | Pose | Lit fraction (card 103 rectangle) |
|---|---|---|---|
| `e2e/artifacts/extreme-pool/evidence-cardioid-current.png` | current | card 103 cardioid pose, distance 0.35, azimuth 2.4635 | 0.6606 |
| `e2e/artifacts/extreme-pool/evidence-cardioid-baseline.png` | baseline | the same | 0.3735 |
| `e2e/artifacts/extreme-pool/evidence-real-axis-current.png` | current | card 104 real-axis pose: 20 wheel steps toward c = -1.36 at height 0.2, then the right-drag to (0.5, 0.92) | |
| `e2e/artifacts/extreme-pool/evidence-real-axis-baseline.png` | baseline | the same | |

What the worker sees: in the cardioid frames the lattice on the tree under
test is visibly finer (the dots sit closer and the cardioid interior reads
as a sheet with a fine weave rather than a dotted field), the period-2 bulb
at the top right is denser in the same way, and neither frame shows gaps.
In the real-axis frames the sheets of the period-4 and period-8 bulbs are
the same on both trees, and the chaotic veil to the right and the speckle
between the bulbs are denser on the tree under test. The GPU frame time at
the shipped defaults and the opening pose is 34.2 ms on the tree under test
and 25.8 ms on the baseline (criterion 4). Whether it looks good is the
operator's call.

## Commands and results (criterion 1)

Every log is under `e2e/artifacts/extreme-pool/logs/`.

| Command | Result | Log |
|---|---|---|
| `npm run build:test && EXTREME_POOL=1 node --test src/app/resolutionPreset.contract.test.cjs` on the unchanged tree (the baseline archive) | 3 tests, 2 pass, 1 fail (the pool assertion) | `red-baseline.log` |
| the same after the change | 3 pass, 0 fail, 0 skipped | `contract-green.log` |
| `npm run verify` | typecheck clean; 427 tests, 394 pass, 33 skipped, 0 fail; `vite build` succeeds | `verify.log` |
| `scripts/check-contract-test-gate.sh --worktree` | exit 0 | `gate.log` |
| `PARAM_PERSISTENCE=1 node --test src/app/paramPersistence.contract.test.cjs` | 6 pass | `contract-paramPersistence.log` |
| `ORBIT_LEVELS=1 node --test src/app/orbitRefineLevels.contract.test.cjs` | 6 pass | `contract-orbitRefineLevels.log` |
| `ORBIT_PACKING=1 node --test src/app/orbitPacking.contract.test.cjs` | 7 pass | `contract-orbitPacking.log` |
| `ORBIT_HIERARCHY=1 node --test src/app/orbitHierarchy.contract.test.cjs` | 4 pass | `contract-orbitHierarchy.log` |
| `INSIDE_OUT_CYCLING=1 npx playwright test e2e/inside-out-cycling.contract.spec.ts --workers=1` | 4 passed | `cycling-contract.log` |
| `npx playwright test e2e/smoke.spec.ts --grep 'logistic-Mandelbrot\|Logistic Mandelbrot\|cyclic Magma\|orbit camera' --workers=1` | 7 tests: 6 passed and `manual zoom holds after ambient motion resumes: spin=true` failed on the plain server (azimuth 2.32 rad off: the page reloaded mid-test, see "Unresolved limitations"); rerun on the stable server, that test and its `spin=false` twin pass (2 passed) | `smoke.log`, `smoke-rerun-manual-zoom.log` |
| `npx playwright test e2e/packed-cells.spec.ts --workers=1` (baseline served) | 12 passed, run as two greps covering every test: `base grid\|plane coverage\|refinement capacity\|plotted\|shader contract` (8 passed) and `brightness\|prebaked\|cost\|evidence` (4 passed) | `packed-cells-chunk1.log`, `packed-cells-chunk2.log` |
| `npx playwright test e2e/refine-levels.spec.ts --workers=1` (baseline served) | 13 passed, run as three greps covering every test: `budget\|layout table\|geometry` (7 passed, `budget › gpu extreme` under the restated rule: level 1 2,879,991 of 2,880,000 rows at 0.3, level 2 empty; 313,104 level-2 sub-cells at 0.6), `tail density\|defaults\|boundary detail\|prebaked` (3 passed and `tail density` failed on the plain server with its 0.3 load's camera reset to the opening pose by a reload; rerun on the stable server, 1 passed with every pose at distance 0.35: rectangle means 2.648, 3.615, 3.919 at 0, 0.3, 0.6 against the baseline's 3.515 at 0.6), `cost\|evidence` (2 passed) | `refine-levels-chunk1.log`, `refine-levels-chunk2.log`, `refine-levels-tail-density-rerun.log`, `refine-levels-chunk3.log` |
| `npx playwright test e2e/tail-default.spec.ts --workers=1` (baseline served, stable server) | 5 passed, including `legacy` with the synthesised pre-106 blob and `cost` at `ultra` | `tail-default.log` |
| `npx playwright test e2e/inside-out-cycling.spec.ts --grep 'spread\|chaotic\|controls and cache\|hierarchy' --workers=1` (baseline served, patched-client servers) | 17 passed, run as two greps covering every matched test: `spread\|chaotic\|controls and cache` (6 passed, the period-2 sheet probe at `ultra`) and `hierarchy` (11 passed). On the upgrade-refusing servers the first grep had read 5 passed and `controls and cache` failed on the two websocket console errors that variant provokes, which is why the served client is patched instead | `cycling-chunkA.log`, `cycling-chunkB.log` |
| `npx playwright test e2e/extreme-pool.spec.ts --grep '<key>' --workers=1`, keys `layout`, `plane`, `cost`, `boundary detail`, `cpu`, `prebaked`, `evidence` | 1 passed each | `layout.log`, `plane.log`, `cost.log`, `boundary-detail.log`, `cpu.log`, `prebaked.log`, `evidence.log` |
| `npx playwright test e2e/extreme-pool.spec.ts --workers=1` (stable server) | 7 passed, 3.2 min, no incidents; the JSON files and frames under `e2e/artifacts/extreme-pool/` are this run's. An earlier whole-spec run on the plain servers also passed 7 of 7, with one recorded incident taken again | `extreme-pool-full.log` |

The browser suites longer than ten minutes were run as greps because the
worker's foreground commands are capped there; each grep set covers every
test of its file and the logs are listed above.

## Authoring estimates against measurement

| Estimate in the card | Measured |
|---|---|
| 1.78 times the candidates | 1.7776 (6,552,960 against 3,686,400) |
| base tier about 2.57M rows at 0.6, under its 3.84M cap | 2,568,535 rows in 325,242 slots, under the 480,000-slot cap |
| refinement keeps the 5.76M rows the slider grants | 5,755,556 against the baseline's 5,756,693 |
| total under the budget | 8,361,936 of 9,600,000 at detail 0; 15,364,128 of 16,000,000 at detail 1 |
| a 2560 by 2560 sweep is two sampler calls | 4,194,304 plus 2,358,656 jobs, 16384 by 256 and 16384 by 144 pixels |
| raised tier grows with the pool | 1.7282 |
| plane at least 15% more lit | 75% more lit |
| build time at most 2.2 times | 1.296 (1.362 in the per-criterion run) |
| GPU frame time at most 1.5 times | 1.325 (1.363), after the raised tier moved to its own buffers; 2.53 before |
| build bytes at most 1.5 times | 1.372 |
| sampler bytes at most 1.9 times | 1.561 |

## Recommendation

The pool change does what the card asked of the plane: 1.78 times the
candidates, a base lattice 1.33 times finer on each axis, a cardioid
rectangle 1.75 times as lit, no gaps, the budget respected, the tail
levels' rows unchanged, and the raised tier 1.73 times larger; build time,
build bytes and sampler bytes land inside their bars, and the CPU fallback
and the prebaked path behave. With the raised tier in its own buffers the
desktop default's frame is 34.2 ms against 25.8 ms, 1.32 times for 1.16
times the points, and the frame with the tier shown is 8.1 ms against 6.2.

On these measurements the wider pool can stay the desktop default. What it
costs a desktop visitor at the shipped settings: about a third more build
time (2.1 s against 1.6 s), 1.37 times the build arrays (596 MB), 1.56
times the sampler readback held during the build (940 MB), and a frame that
spans three 60 Hz display frames where the baseline's spans two (about 28
against 37 frames a second under the display link). Neither tree is inside
a 16.7 ms frame at these settings; that was card 106's finding and is
unchanged. The operator decides whether the finer plane is worth the slower
frame; if not, the lever is Tail refinement or boundary detail rather than
the pool, since the pool's own cost at detail 0 and Tail refinement 0 is
11.8 ms.

Two consequences need a decision if the pool stays:

1. At Tail refinement 0.3 (and on the CPU fallback's automatic share) level
   1 fills the whole share and level 2 is empty at `extreme`. If the second
   level matters at the lower settings, the refinement rule would need to
   reserve rows for it (a split of the budget between the levels rather
   than "level 2 takes what level 1 leaves"), which is a refinement-rule
   change and a card of its own. Card 105's `budget` test now states the
   rule as it is.
2. In hybrid geometry at `extreme` the period-2 bulb's lower sheet at
   c = -1 reads nearly white under the denser cloud (chroma 0.015 against
   0.026); the cycling suite's probe reads it at `ultra`. If the hybrid
   cloud's weight or the tone map's handling of stacked light over a sheet
   should follow the pool, that is colouring work outside this card.

The threshold itself is worth keeping in mind for any future tier: a packed
cloud whose bound attributes pass about 415 MB on this GPU (13M points at
32 bytes) halves its frame rate, and the baseline tree's detail budget of
16M points would have reached it with a pool only slightly wider than 1920
by 1920. The split keeps each draw's bound bytes to one tier group; a
third group would be the same pattern.

## Unresolved limitations

- The frame-time threshold is measured on one machine (Apple M2 Max, ANGLE
  on Metal, Chromium headless and headed) and bracketed to between 415 MB
  and 446 MB of attribute buffers bound to a draw; its mechanism inside the
  driver is not identified. A machine with a different GPU or driver may
  place it elsewhere or not at all. The two-block layout costs nothing
  where the threshold is absent.
- With the raised tier shown, the draw-density hash now runs over the
  raised tier's own slot indices rather than their indices in the combined
  layout, so at a draw density below 1 a different, equally fair subset of
  raised sub-cells is culled than before. At the default density of 1
  nothing is culled.
- `gridMaxDim()` clamps a grid side to 4096. At 2560 by 2560 a canvas wider
  than about 2.56 to 1 loses pool to the clamp (a 32 to 9 canvas would get
  4096 by 1229, 77% of the pool); at 1920 by 1920 the clamp bit only above
  4.55 to 1. Not measured here; the 1280 by 720 canvas is unaffected.
- At Tail refinement 0.3 on the GPU path, and at the automatic share on
  the CPU fallback, there is no second level at `extreme` (level 1 fills
  that share's slots), where the baseline had 134,002 and 134,228 level-2
  sub-cells.
- Peak renderer memory during a detail-1 build is not measured as process
  RSS; the published figures are 596 MB of build arrays and 940 MB of
  sampler readback held at once, and the GPU holds 492 MB of attributes
  across the two blocks.
- During this attempt's browser runs on plainly served trees, pages
  reloaded themselves: the console read `[vite] server connection lost.
  Polling for restart...` and the Vite dev client navigated to the same
  URL, destroying any `page.evaluate` in flight ("Execution context was
  destroyed, most likely because of a navigation") and resetting the
  camera (card 105's `tail density` test twice recorded a pose at the
  opening distance 5.098 instead of the dollied 0.35, once passing by
  luck; the smoke test's manual-zoom check read an azimuth 2.32 rad off).
  An idle gallery page lost its socket 63 s after connecting with the
  server on Node 26.5.0, 21 s after with Node 22.15.0, 48 s after with
  `server.hmr: false` (which in Vite 6.4.2 leaves the socket up), 57 s
  after with the server pinging the socket every 2 s, and 62 s after with
  the server bound to 127.0.0.1 instead of `::1`
  (`logs/scratch-ws-idle*.log`); heavy pages lost it within seconds. A
  Node 26 `WebSocket` client holding the same `vite-hmr` socket against
  the same server stayed open for 95 s and closed cleanly on request
  (`build/ws-probe.mjs`), neither dev server logged a restart, no Chromium
  crash report was written, and the machine had 95% of its 96 GB free, so
  the close originates inside Playwright 1.60's Chromium on this machine
  (headless and headed alike) and its cause was not identified. Serving
  the dev client with its lost-connection reload disabled (see "Serving
  the baseline") removes the symptom: the same idle page then stayed put
  for 100 s with nothing in its console but `[vite] connected.`. The new
  spec also records any post-load navigation, crash or page error in its
  reports' `incidents` field and takes an interrupted load again once in a
  fresh context; the earlier cards' suites have no such guard.
- The evidence frames pin the colour phase (cycle speed 0) so both trees
  are framed alike; the shipped cycle speed is 0.1.
- The `brightness` test of `packed-cells.spec.ts` compares the trees at
  `ultra`; attempt 1 recorded the 9.0% brighter frame at `extreme`, which
  is the denser plane, not a colouring change.
- `src/app/controls.ts`'s Extreme label ("Extreme (slowest, huge point
  cloud)") was left as it is; it already states the cost qualitatively.
