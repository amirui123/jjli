# Logistic-Mandelbrot: what zoom does, and where the resolution ceiling is

- **Date:** 2026-09-11
- **Stage:** `87-logistic-mandelbrot-zoom-diagnostic`
- **Base:** `dev` at `3a0332dd`
- **Type:** diagnostic. No behaviour changed. Cards 88-90 are the repairs.

Every number below is either derived in place from a named `file:line`, or read
off a live page. Where the stage card's Surfacing concern made a claim, it is
marked **confirmed** or **corrected**.

## Measurement conditions

All live readings come from one Chromium session on this machine, `--use-angle=metal
--enable-gpu`, viewport 1440x900 CSS at `devicePixelRatio` 1,
`prefers-reduced-motion: no-preference`, route `#/logistic-mandelbrot`, every
control left at its kernel default ("Kernel preset: Kernel default"). The page
reported:

```
data-renderer               webgl2
data-render-size            2429x1518     <- the compute grid (renderer.ts:778)
data-simulation-renderer    gpu-orbit3d
data-orbit3d-sampler        gpu-sampled   <- the live GPU path, not a bake
data-orbit3d-boundary-detail active
data-orbit3d-point-budget   16000000
data-orbit3d-points         13235784
```

`data-orbit3d-sampler` is `gpu-sampled`, so the escalation clause about
measuring a fallback does not apply: every Part B number below is about the
live path.

### How camera distance was read

`camera.distance` is private and not published to the DOM, so it was read out of
the matrix the app itself uploads. `cameraMatrix` (`src/app/orbit3d.ts:3882`)
builds `P * V` with the projection at `src/app/orbit3d.ts:3914`, whose fourth row
is `(0, 0, -1, 0)`. Row four of the product is therefore `(f_x, f_y, f_z, z·eye)`
— a unit forward vector, and, with the orbit target at the origin, the camera
distance in the `w` slot. `WebGL2RenderingContext.prototype.uniformMatrix4fv` was
wrapped with a pass-through that records its argument and forwards every
parameter untouched; the page runs the shipped bundle unmodified.

The readout was validated against two known states before it was used:

| state | read back | expected |
|---|---|---|
| after `resetCamera` (double-click) | `5.0982842445373535` | `hypot(2.9, 2.15, 3.6) = 5.098284025042152` |
| after one `deltaY = -100` wheel step | `4.388133525848389` | `5.098284 * exp(-100 * 0.0015) = 4.388133726434229` |

Agreement to float32. `f_y` additionally gives elevation and `atan2(f_x, f_z)`
gives azimuth, both of which are used below.

---

# Part A — what zoom does

## A0. The one piece of state a scroll gesture changes

**A user's scroll gesture multiplies `Orbit3DPointCloud.camera.distance` by a
clamped factor, and changes nothing else in the world, the sampler or the
build.**

The chain, with no branch in it:

1. `src/app/fractalCanvas.ts:262` — the `wheel` listener registered by
   `attachLogisticMandelbrotCanvasInteractions`. It computes
   `factor = Math.exp(ev.deltaY * sensitivity)` (`:270`) and calls
   `options.dolly(Math.min(1.35, Math.max(1 / 1.35, factor)))` (`:271`).
   `sensitivity` is `0.012` under `ctrlKey` (trackpad pinch), `0.08` for
   `DOM_DELTA_LINE`, `0.0015` otherwise.
2. Pinch takes the same exit: `src/app/fractalCanvas.ts:205` calls
   `options.dolly(Math.min(1.25, Math.max(0.8, beforeDistance / afterDistance)))`
   from the two-pointer branch of `pointermove`.
3. `src/app/renderer.ts:391` — `dollyOrbit3d(factor)` calls
   `pauseOrbit3dAutoRotate()` then `this.backend.orbit3dDolly?.(factor)`.
4. `src/app/orbit3d.ts:1282` — `dolly(factor)`:

   ```ts
   this.camera.distance = Math.min(
     CAMERA_MAX_DISTANCE,
     Math.max(CAMERA_MIN_DISTANCE, this.camera.distance * factor),
   );
   ```

   `CAMERA_MIN_DISTANCE = 0.35` (`:635`), `CAMERA_MAX_DISTANCE = 12` (`:637`).

**Confirmed**, as the Surfacing concern read it. `dolly` touches `camera.distance`
and nothing else — not `camera.target`, not `azimuth`, not `elevation`, not the
sampler domain, not the point size, not the build key.

## A1. The usable magnification range

| quantity | value | source |
|---|---|---|
| default camera distance | `hypot(2.9, 2.15, 3.6) = 5.098284` | `DEFAULT_CAMERA_EYE = [2.9, 2.15, -3.6]` at `src/app/orbit3d.ts:645`, via `defaultCameraState` at `:3853` |
| cloud bounding radius | `1.856922` | `ORBIT3D_BOUNDING_RADIUS` at `src/app/orbit3d.ts:726` |
| `CAMERA_MIN_DISTANCE` | `0.35` | `src/app/orbit3d.ts:635` |
| `CAMERA_NEAR_PLANE` | `0.05` | `src/app/orbit3d.ts:633` |

`ORBIT3D_BOUNDING_RADIUS` derives as

```
hypot( max(|(-2 - -0.5)| , |(1 - -0.5)|) * 0.78,      = 1.5  * 0.78   = 1.17
       max(SAMPLE_CLIP 2, |MARKER_PLANE_ORBIT_VALUE 2.08|) * 0.56
                                                      = 2.08 * 0.56   = 1.1648
       max(|IM_MIN|, |IM_MAX|) * 0.85 )               = 1.0  * 0.85   = 0.85
     = sqrt(1.3689 + 1.35676 + 0.7225) = 1.856922
```

from `WORLD_RE_SCALE 0.78`, `WORLD_ORBIT_SCALE 0.56`, `WORLD_IM_SCALE 0.85`
(`src/app/orbit3d.ts:648-650`) and the sampler domain at
`src/sims/logistic-mandelbrot/model.ts:17-20`.

Three ratios, and they answer different questions:

- **To the point the camera enters the cloud:** `5.098284 / 1.856922 = 2.7456x`.
  Below `d = 1.857` the eye is inside the cloud's bounding sphere, so the object
  is no longer being approached, it is being penetrated.
- **To the hard clamp:** `5.098284 / 0.35 = 14.567x`. This is the full travel of
  the control.
- **Inside the cloud:** `1.856922 / 0.35 = 5.305x` of the 14.567x total range is
  spent with the eye already inside the point set.

The near plane at `0.05` is not what ends the zoom; the clamp at `0.35` is,
and there are still `0.35 / 0.05 = 7` near-plane lengths of unused travel
below it. Live confirmation: 25 wheel steps of `deltaY = -100` from the
default (17.86 steps would reach it exactly, so the clamp is saturated) read
back `0.3499999940395355` and stayed there. Frame 02 is that view, and it shows
the camera deep inside the sheets, with one sheet filling most of the lower-left
of the frame and its individual sample points resolved as a visible dot lattice.

**Practically, the usable range is 2.75x.** Everything past that is travel
inside an object whose resolution stopped improving at the first pixel — see
Part B.

## A2. Does any zoom gesture cause a resample?

**No. No camera state is a build input at all.**

`orbit3dBuildKey` (`src/app/webglRenderer.ts:2750`) is the only thing compared
against the cached key before a rebuild (`:1449`, `if (buildKey !== this.orbit3dBuildKey)`).
Its eleven terms in full:

| term | movable by a camera gesture? |
|---|---|
| `width`, `height` (the compute grid) | no — set by `reinitGrid`, `src/app/renderer.ts:772` |
| `viewportWidth`, `viewportHeight` | zeroed unless `geometryMode === "hybrid"`; the default is `cloud` |
| `"hybrid"` / `"cloud"` | no — a kernel param |
| `warmupIterations` | no — a kernel param |
| `sampleCount` | no — a kernel param |
| `tailRefinement` | no — a kernel param |
| `boundaryDetail` | no — a kernel param |
| `realSliceOnly` | no — a kernel param |
| `modelSource` | no — a kernel param |

Nothing a wheel, a pinch, a drag or a pan can reach appears in the key. The
sampler's c-plane rectangle is likewise fixed: `buildGpuOrbitCloud` lays out its
coordinates from `RE_MIN/RE_MAX/IM_MIN/IM_MAX` directly
(`src/app/orbitSampler.ts:643-650`), which are module constants
(`src/sims/logistic-mandelbrot/model.ts:17-20`). The sampled rectangle is always
the whole `[-2, 1] x [-1, 1]` domain whatever the camera is doing.

**Confirmed**, and stronger than the Surfacing concern put it: it is not just
that no camera term is in the key, it is that the sampled region is a compile-time
constant.

Live confirmation: a `MutationObserver` on the canvas element recorded every
change to `data-orbit3d-build` and `data-orbit3d-points` across a session
containing 25 wheel-zoom steps, a right-button pan, eight orbit drags and three
`resetCamera` double-clicks. `data-orbit3d-build` never left `complete`.
`data-orbit3d-points` changed exactly eight times, all in the first 16.6 s, all
in equal increments of `1,654,473` — that is the cascade reveal walking
`plottedIterations` from 1 to 8 (`src/app/renderer.ts:593-602`), not a rebuild.

**The contrast case.** The 2D fractals do resample on zoom because their zoom is
a *kernel parameter*: `src/app/fractalCanvas.ts:447` calls
`schedulePreview(zoomAroundCursor(base, ev.clientX, ev.clientY, clamped))`, which
commits a new `zoom`/`centerX`/`centerY` into the param set and re-renders the
plane at the new scale. The orbit3d zoom moves a camera through a fixed point
cloud instead. That difference is the whole of the operator's "it never worked
properly".

## A3. Is the zoom anchored on the cursor or on the orbit target?

**On the orbit target.** The wheel listener at `src/app/fractalCanvas.ts:262-273`
reads `ev.deltaY`, `ev.ctrlKey` and `ev.deltaMode` from the event and never reads
`ev.clientX` or `ev.clientY`. `dolly` (`src/app/orbit3d.ts:1282`) scales
`camera.distance` about `camera.target`, which `cameraEye`
(`src/app/orbit3d.ts:3873`) uses as the origin of the spherical camera. The
target only moves under `pan` (`src/app/orbit3d.ts:1230`), and is clamped to
`+/-CAMERA_PAN_LIMIT = 1.6` per axis (`:636`).

So the magnified point is always the screen centre, never the point under the
pointer. Compare the fractal handler eleven lines further down the same file,
`src/app/fractalCanvas.ts:447`, which passes `ev.clientX, ev.clientY` into
`zoomAroundCursor` (`:398`). The two zooms sit in one file and only one of them
is cursor-anchored.

Consequence for the operator's complaint: to inspect a bulb you must first find
it, pan it to the centre against a camera that is rotating underneath you, and
only then zoom. Frame 03 was captured that way and it took a computed pan
delta to land on it.

## A4. Does the camera hold the distance the user chose?

**Yes. At the shipped defaults the camera holds the chosen distance exactly and
indefinitely. This corrects the Surfacing concern.**

Procedure: `resetCamera`, then 25 wheel steps of `deltaY = -100` at ~180 ms
spacing (saturating the `0.35` clamp), then no further input of any kind.
Distance read out of the uploaded view-projection matrix:

| t after last wheel event | camera distance | azimuth `atan2(f_x, f_z)` | elevation `asin(-f_y)` |
|---|---|---|---|
| 1 s | `0.3499999940395355` | `-0.6781` | `0.4353` |
| 5 s | `0.3499999940395355` | `-0.6186` | `0.4353` |
| 10 s | `0.3499999940395355` | `-0.3686` | `0.4353` |
| 15 s | `0.3499999940395355` | `-0.1186` | `0.4353` |

The full trace, sampled every 500 ms from the moment the gesture ended, holds
`0.35` at every one of 31 readings. Azimuth is flat for the first 4.0 s and then
advances linearly: `(-0.11858 - -0.66856) / 11.0 s = 0.05000 rad/s`, which is
`ORBIT_AUTO_ROTATE_RADIANS_PER_SECOND = 0.05` (`src/app/renderer.ts:49`) to four
figures. Elevation never moves at all. Frame 04 is the 10 s capture: the camera
is still inside the cloud, at the distance the gesture left it.

**The parameter defaults that put it on that path.** `advanceOrbit3dCamera`
(`src/app/renderer.ts:637`):

```ts
if (this.orbitAutoRotateHold > 0) { ...; return; }          // :638
if (!this.orbitAutoRotateEnabled) return;                   // :642
if (!booleanParam(this.params, "autoRotate", true)) return; // :643
const continuousSpin = booleanParam(this.params, "continuousSpin", false);   // :649
if (!continuousSpin && booleanParam(this.params, "realAxisSweep", false)) {
  this.backend.orbit3dSyncCameraToSweep?.(...);             // :663
  return;
}
this.backend.orbit3dOrbit?.(ORBIT_AUTO_ROTATE_RADIANS_PER_SECOND * dt, 0);   // :673
```

The shipped defaults are `autoRotate: true`
(`src/sims/logistic-mandelbrot/kernel.ts:198`), `continuousSpin: true` (`:205`),
`realAxisSweep: true` (`:213`). Because `continuousSpin` is `true`, the
`syncCameraToSweep` branch at `:663` is never taken and control falls through to
`:673`, which calls `orbit` (`src/app/orbit3d.ts:1217`) — azimuth and elevation
only, never `distance`. All three defaults were read back off the live control
panel, not assumed: the "Continuous camera spin" and "Auto rotate" checkboxes
were both checked and "Light beam sweep" was checked.

The 4 s flat section is `ORBIT_AUTO_ROTATE_RESUME_SECONDS = 4`
(`src/app/renderer.ts:51`), set by `pauseOrbit3dAutoRotate` (`:676`) on every
camera input. It delays the resumption of the spin; it does not gate the
distance, because nothing on the default path writes the distance.

**Where the Surfacing concern's reading is right, and what it is right about.**
`syncCameraToSweep` (`src/app/orbit3d.ts:1255-1280`) does exactly what the
concern says — it drives `this.camera.distance` toward a choreographed value at
up to `maxDelta * 2` per frame, and it drives elevation and azimuth too. It is
simply not reachable at the shipped defaults. It becomes reachable the moment a
user unticks "Continuous camera spin", which is a one-click, plausible thing to
do (the tooltip offers it as the calmer option). Measured, same procedure, with
only that one box unticked:

| t after last wheel event | camera distance | elevation |
|---|---|---|
| 1 s | `0.35000` | `0.4353` |
| 5 s | `1.92542` | `0.3645` |
| 10 s | `4.48252` | `0.3053` |
| 15 s | `4.20286` | `0.2462` |

Frame 05 is the 10 s capture in that configuration: the camera has been pulled
from inside the cloud back out to `4.48` and the whole object is in frame again.
So the defect card 88 was written against is real, reachable and severe — but it
is a **conditional** defect gated on one non-default checkbox, not the default
behaviour. A card 88 written as "the camera always drags you back out" would be
repairing something the default path does not do.

---

# Part B — the resolution ceiling

The shipped desktop default resolves like this:
`qualityProfileFor` sets `defaultPreset = "extreme"` for this slug
(`src/app/qualityProfiles.ts:97`) and `computeScale = 1.5` (`:118`);
`RESOLUTION_TARGETS.extreme = 1920 * 1920 = 3,686,400`
(`src/app/resolutionPreset.ts:26`); `computeGridSize`
(`src/app/renderer.ts:838-846`) scales the CSS rect by `computeScale` and then,
uniquely for `extreme`, scales *up* as well as down to hit the target area
exactly. At 1440x900 CSS that gives `2429 x 1518 = 3,687,222` cells, which is the
`data-render-size` the live page reported.

## B1. Live c-plane sample pitch at the shipped desktop default

```
cellCount        = 2429 * 1518                = 3,687,222
                   > ULTRA_CELL_CEILING 1,654,784      (orbit3d.ts:548, :3551-3556)
pointBudget      = POINT_BUDGETS.extreme      = 9,600,000        (orbit3d.ts:549-556)
sampleCount      = DEFAULT_KERNEL_SAMPLES     = 8                (kernel.ts:55, :272)
maxSurvivingCells= floor(9,600,000 / 8)       = 1,200,000        (orbit3d.ts:3574)
tailRefinement   = 0 (default)  -> refineActive = false          (kernel.ts:164, orbit3d.ts:3579)
baseSlotCap      = maxSurvivingCells          = 1,200,000        (orbit3d.ts:3580-3582)
desiredCells     = ceil(1,200,000 / 0.22)     = 5,454,546        (orbit3d.ts:3583, :565)
candidateCells   = min(3,687,222, 5,454,546)  = 3,687,222        (orbit3d.ts:3584)
```

**The compute grid is the binding constraint, not the point budget.** The budget
wants 5,454,546 candidate cells and the grid can only offer 3,687,222, so the
`Math.min` at `:3584` selects the grid. Quoting `POINT_BUDGETS.extreme` as the
thing that sets the pitch would be wrong by a factor of `sqrt(5,454,546 /
3,687,222) = 1.216` in each axis.

Because `candidateCells` then equals `inputWidth * inputHeight` exactly and
`aspect = inputWidth / inputHeight`, `sqrt(candidateCells * aspect)` collapses to
`inputWidth`, so the sample grid is the compute grid:

```
sampleWidth  = min(2429, round(sqrt(3,687,222 * 2429/1518))) = min(2429, 2429) = 2429   (orbit3d.ts:3586-3591)
sampleHeight = min(1518, ceil(3,687,222 / 2429))             = min(1518, 1518) = 1518
```

**Pitch:**

```
Re: (RE_MAX - RE_MIN) / 2429 = 3 / 2429 = 1.23508e-3
Im: (IM_MAX - IM_MIN) / 1518 = 2 / 1518 = 1.31752e-3
```

**1.235e-3 in units of Re.** Domain constants at
`src/sims/logistic-mandelbrot/model.ts:17-20`; `cellCoordinate` puts a sample at
each cell centre (`:80-88`).

Sanity check against the live page: survivors plus refined sub-cells came to
`13,235,784 / 8 = 1,654,473` cells, which is `44.9%` of the 3,687,222 grid cells
and comfortably under both `baseSlotCap` 1,200,000 for the base tier and
`gpuMaxSurvivingCells` 2,000,000 overall — neither cap was reached, which is what
"the grid binds" predicts.

## B2. The same pitch with Boundary detail at maximum

**Identical: 1.23508e-3. Boundary detail is already at its maximum in the shipped
default, and it does not move the base pitch in any case.**

Two separate findings, both of which matter to cards 88-90:

**(a) The default is the maximum.** The `boundaryDetail` descriptor at
`src/sims/logistic-mandelbrot/kernel.ts:176-184` reads `default: 1, min: 0,
max: 1`. The live control panel confirmed the slider sitting at `1`, and the page
reported `data-orbit3d-boundary-detail: active` with
`data-orbit3d-point-budget: 16000000`. There is no unspent boundary-detail
headroom to unlock: `gpuPointBudget = floor(9,600,000 + (16,000,000 - 9,600,000)
* 1) = 16,000,000` (`orbit3d.ts:3610-3615`) is already the ceiling.

**(b) It never moved the base pitch anyway.** `sampleWidth`/`sampleHeight` are
computed from `baseSlotCap` (`orbit3d.ts:3583-3591`), and `baseSlotCap` is
derived before `boundaryDetail` is read at `:3603`. The control buys a *second
tier*, not a finer grid:

```
gpuMaxSurvivingCells   = floor(16,000,000 / 8)                 = 2,000,000   (:3616-3619)
gpuRefineSubdivision   = BOUNDARY_DETAIL_SUBDIVISION           = 5           (:587, :3622)
gpuRefineCandidateCap  = max(64, ceil((2,000,000 - 1,200,000) * 2 / 25))
                       = max(64, 64,000)                       = 64,000      (:3625-3632)
```

So at most **64,000 parent cells** — `64,000 / 3,687,222 = 1.74%` of the grid —
are re-sampled on a 5x5 sub-grid at `BOUNDARY_DETAIL_WARMUP = 20,000` iterations
(`:588`). Inside those 1.74% of cells the pitch is

```
3 / 2429 / 5 = 2.47015e-4 in Re
```

and everywhere else it stays at `1.23508e-3`. The parents are chosen by
reservoir sampling over cells that are period-0, period `>= REFINE_PERIOD_THRESHOLD
8`, or on the escape edge (`src/app/orbitSampler.ts:672-689`).

**And those refined points are invisible until the camera is almost at the
clamp.** `updateBoundaryDetailFade` (`src/app/orbit3d.ts:3373-3399`) only sets
`boundaryDetailTierVisible` when `camera.distance <= BOUNDARY_DETAIL_SHOW_DISTANCE
= 0.9` (`:641`), and clears it at `>= 0.95` (`:642`). Its return value becomes
`u_boundaryDetailOpacity` (`:3203-3213`), which the point vertex shader applies
to every point whose `cellId >= u_boundaryDetailBaseCellCount`
(`src/app/orbit3d.ts:140-143`). From the default distance of `5.098284` the user
must dolly in by a factor of `5.665` — around 13 wheel steps — before the finer
tier appears at all, and by then the eye is `1.857 / 0.9 = 2.06` bounding radii
inside the cloud. The 5x speedup in pitch exists; it is spent in a place almost
nobody arrives at.

## B3. The highest orbit period the shipped default can label

**7. `MAX_DETECTABLE_PERIOD` is 32, so the shipped default is short by 25.**

`estimatePeriod` (`src/sims/logistic-mandelbrot/model.ts:97-121`):

```ts
const limit = Math.min(maxPeriod, count - 1);   // :104
```

`maxPeriod` defaults to `MAX_DETECTABLE_PERIOD = 32` (`:31`, `:101`) and `count`
is the sample-window length. At the shipped default `sampleCount` is
`DEFAULT_KERNEL_SAMPLES = 8` (`src/sims/logistic-mandelbrot/kernel.ts:55`,
descriptor at `:272-281`), so

```
limit = Math.min(32, 8 - 1) = 7
```

**`count - 1` wins, not `MAX_DETECTABLE_PERIOD`.** The constant is inert at the
shipped default; it only binds once `sampleCount >= 33`. The GPU path agrees
exactly — `src/app/orbitSampler.ts:209-210` writes
`for (int q = 1; q <= 32; q += 1) { if (q >= u_sampleCount) break; ... }`, which
is the same `q <= 7` at `u_sampleCount = 8`.

**What the excess-period cells are coloured as instead.** `estimatePeriod`
returns `0` for any cell whose true period is 8 or more (and for genuinely
chaotic cells) — the two are indistinguishable in the output. In the default
`period` colour mode the point vertex shader at `src/app/orbit3d.ts:145-147`
does:

```glsl
int p = int(period + 0.5);
vec3 hue = p <= 0 ? vec3(0.44, 0.47, 0.53) : periodHue(p);
```

so every period-8-and-above cell takes the flat grey `(0.44, 0.47, 0.53)` while
periods 1-7 each take a distinct categorical hue from `periodHue`
(`src/app/orbit3d.ts:88-97`, which itself has seven entries before the wheel
repeats). Worse for the operator's complaint, those same cells are the *brightest*
things on screen: `src/app/orbit3d.ts:135-137` gives a resolved period-`q` cell
`v_energy = clamp(q / 8, 0.02, 1.0)` but gives a period-0 cell `v_energy = 1.0`.
A period-2 bulb therefore renders at a quarter of the energy of the undifferentiated
grey mass surrounding it.

This is the single largest reason "the bulbs and swirls have no detail close up":
the entire period-doubling cascade from 8 onward — which is exactly the fine
structure the operator is zooming in to see — is collapsed into one flat grey at
full brightness. Frame 03 shows it: the large period-1 and period-2 sheets
carry distinct hues, the small period-3..7 lobes are picked out in rose, amber
and green, and the fine structure between and below them is undifferentiated
grey.

## B4. ELPC u16 position step vs the baker's finest sub-cell pitch

**The quantisation floor is well below the finest pitch the baker produces: it is
not the limit, by a factor of 11.3.**

*Quantisation step.* `scripts/bake-orbit3d.mjs:382-383`:

```js
const q16 = (value, min, max) =>
  Math.max(0, Math.min(65535, Math.round(((value - min) / (max - min)) * 65535)));
```

called as `q16(re, RE_MIN, RE_MAX)` at `:408` over the fixed domain at
`src/sims/logistic-mandelbrot/model.ts:17-18`. One code step is

```
(RE_MAX - RE_MIN) / 65535 = 3 / 65535 = 4.57771e-5 in Re
```

*Level-2 sub-cell pitch at the default `--refine-fraction`.*
`scripts/bake-orbit3d.mjs:114-117` gives `--points 6,000,000`, `--samples 64`,
`--refine-fraction 0.35`:

```
basePoints    = 6,000,000 * (1 - 0.35)                = 3,900,000        (:277)
baseCellTarget= ceil(3,900,000 / 64 / 0.22)           = 276,989          (:281)
aspect        = 3 / 2                                 = 1.5              (:282)
gridWidth     = round(sqrt(276,989 * 1.5))            = 645              (:283)
gridHeight    = ceil(276,989 / 645)                   = 430              (:284)
cellW         = 3 / 645                               = 4.65116e-3       (:285)
level-1 pitch = cellW / REFINE_SUBDIVISION 3          = 1.55039e-3       (:53, :198-209, :343)
level-2 pitch = cellW / 3 / 3                         = 5.16796e-4       (:359, which passes cellW/3 back into subdivisionJobs)
```

*Comparison.*

```
5.16796e-4 / 4.57771e-5 = 11.289
```

**The format's floor is 11.3x finer than anything the baker writes into it.** A
bake could go two further refinement levels deep (`5.168e-4 / 9 = 5.74e-5`,
still above the floor) before u16 quantisation started costing it anything. The
ELPC v1 position format is not the constraint on baked resolution; the point
budget and the refinement depth are.

Note also that the bake's *base* pitch of `4.651e-3` is `3.77x` coarser than the
live path's `1.235e-3`, because the baker spends its cells on 64 samples each
where the live path spends them on 8. The prebaked cloud is denser in orbit
samples and sparser in the c-plane — the opposite trade from the one the
operator's complaint asks for.

---

# Ranked defects between the operator and "more detail in the bulbs and swirls"

Ranked by how much visible detail the fix unlocks, not by cost. The ranking
criterion is: how many currently-indistinguishable structures become
distinguishable on screen, weighted by how much of the frame they occupy at the
distances a user actually reaches.

**1. The period window is 8 samples, so every period above 7 is one flat grey.**
`src/sims/logistic-mandelbrot/kernel.ts:55` (`DEFAULT_KERNEL_SAMPLES = 8`) feeding
`Math.min(maxPeriod, count - 1)` at `src/sims/logistic-mandelbrot/model.ts:104`.
Mechanism: `estimatePeriod` returns 0 for periods 8..32, the shader paints
period-0 flat grey at `src/app/orbit3d.ts:146`, and `:135` gives those cells full
energy while resolved cells get `q/8`. Ranked first because it is the only defect
that removes structure that has *already been computed correctly* — the orbit is
right, the classification throws it away — and because the affected cells are the
majority of the non-trivial area of the object at every distance, near and far.
Raising `sampleCount` costs cells (`maxSurvivingCells = pointBudget / sampleCount`,
`src/app/orbit3d.ts:3574`), so this trades against defect 2 and the trade needs
measuring, not assuming.

**2. Boundary detail is already maxed, and its 5x tier is hidden above `distance
0.9`.** `src/app/orbit3d.ts:641-642` (`BOUNDARY_DETAIL_SHOW_DISTANCE 0.9`,
`HIDE 0.95`) gating `u_boundaryDetailOpacity` through
`updateBoundaryDetailFade` (`:3373`) and the shader's `cellId >=
u_boundaryDetailBaseCellCount` test (`:140-143`). Mechanism: the one mechanism in
the build that actually produces a finer pitch (2.470e-4 over 1.74% of cells) is
drawn at zero opacity until the camera is 5.665x closer than its default, i.e.
already deep inside the cloud. Ranked second because the detail exists, is paid
for on every build, and a threshold change reveals it — but it covers only 1.74%
of cells, so it cannot carry the frame the way defect 1 does.

**3. Point size is a screen-space constant with no depth term.**
`src/app/orbit3d.ts:3179`, `Math.min(3, Math.max(1.8, width / 650))`, uploaded to
`gl_PointSize` at `:209`. At the 1440 CSS width measured here that is a constant
`2.215` px for every point at every depth. Mechanism: zooming in spreads the same
points further apart on screen without growing them, so sheets that read as solid
surfaces at the default distance dissolve into a visible dot lattice as you
approach — clearly so in frame 02 and in the moiré across the sheets in frame 03.
Ranked third: it does not remove information, it degrades the legibility of
information that is present, and it degrades it worst at exactly the distances
the operator is complaining about.

**4. The zoom is anchored on the orbit target, not the cursor.**
`src/app/fractalCanvas.ts:262-273` never reads `ev.clientX`/`ev.clientY`; contrast
`:447`. Mechanism: to inspect any feature the user must pan it to the screen
centre first, against a camera that resumes rotating 4 s later
(`src/app/renderer.ts:51, :673`). Ranked fourth because it unlocks no new detail
at all — it changes how much work reaching the existing detail costs. Ranked
above defect 5 because every user hits it on every inspection.

**5. `syncCameraToSweep` pulls the camera back out, but only with "Continuous
camera spin" off.** `src/app/orbit3d.ts:1255-1280` reached from
`src/app/renderer.ts:649-665`. Measured: `0.35 -> 1.93 -> 4.48` over 10 s in that
configuration, versus a flat `0.35` at the shipped defaults. Ranked fifth because
it is off the default path — but it is ranked at all, rather than dropped,
because when a user does hit it the zoom becomes completely unusable rather than
merely limited, and because it also drags elevation (`0.4353 -> 0.2462`), so the
user loses their viewing angle as well as their distance.

**Not a defect: the sample pitch itself.** At 1.235e-3 in Re the live grid is
already finer than the 2.215 px point size can draw without overlap at the
default distance, and finer than the bake's 4.651e-3. Raising the grid would not
show the operator more; it would put more points behind the same dots. The
ceiling on visible detail is set by defects 1-3, in that order, not by the number
of cells.

---

# Frames

All in `docs/images/`, all captured 2026-09-11 in the session described under
*Measurement conditions*: viewport 1440x900 CSS at DPR 1, Chromium with
`--use-angle=metal --enable-gpu`, `data-orbit3d-sampler = gpu-sampled` for every
frame, `data-render-size = 2429x1518`, `data-orbit3d-point-budget = 16000000`,
`data-orbit3d-points = 13235784`. Frames are downscaled to 1200 px wide from the
1440 px captures; no other processing. Camera figures are read from the uploaded
view-projection matrix as described above.

| frame | file | parameters | camera |
|---|---|---|---|
| 01 default view | `2026-09-11-logistic-mandelbrot-zoom-01-default-view.png` | kernel defaults, no camera input since load; cascade reveal complete (`plottedIterations` 8) | `d = 5.09828`, `az = 0.6769`, `el = 0.4353` |
| 02 maximum zoom-in | `2026-09-11-logistic-mandelbrot-zoom-02-max-zoom-in.png` | kernel defaults; 25 wheel steps of `deltaY = -100`, clamp saturated | `d = 0.35000`, `az = 0.6807`, `el = 0.4353` |
| 03 period-2 bulb close-up | `2026-09-11-logistic-mandelbrot-zoom-03-period-2-bulb.png` | kernel defaults; `resetCamera`, right-button pan of `(-79, -39)` CSS px, then 9 wheel steps of `deltaY = -100`. The pan puts the line of sight through world `(-0.39, -0.28, 0)`, i.e. `c = -1`, `Re(z) = -0.5` — the lower branch of the period-2 cycle | `d = 1.32168`, `az = -0.6781`, `el = 0.4353` |
| 04 10 s after a zoom, no further input | `2026-09-11-logistic-mandelbrot-zoom-04-hold-10s.png` | kernel defaults; zoomed to the clamp, then untouched for 10 s. This is the evidence for A4 | `d = 0.35000`, `az = 1.0240`, `el = 0.4353` |
| 05 the same, **non-default** | `2026-09-11-logistic-mandelbrot-zoom-05-spin-off-10s.png` | **"Continuous camera spin" unticked**, every other control at its kernel default; zoomed to the clamp, then untouched for 10 s | `d = 4.48252`, `az = -0.3795`, `el = 0.3053` |

Frame 05 is the only one not on the shipped defaults, and it is there to bound
defect 5. Frames 02 and 04 differ only in azimuth, which is the point: 10 s of
inactivity moved the azimuth by `0.05 rad/s` and moved the distance by nothing.

# Corrections to the Surfacing concern

| claim | verdict |
|---|---|
| `orbit3d.ts:1282` `dolly` mutates only `camera.distance`, clamped 0.35..12 at `:635`/`:637` | **confirmed**, line numbers exact |
| `webglRenderer.ts:2750` `orbit3dBuildKey` carries no camera term | **confirmed**, line number exact; and the sampled domain is a module constant too |
| `orbit3d.ts:1255-1280` `syncCameraToSweep` drives distance back, with `renderer.ts:51` `ORBIT_AUTO_ROTATE_RESUME_SECONDS = 4` | **corrected.** Both line numbers are exact and the function does what is claimed, but it is unreachable at the shipped defaults because `continuousSpin` defaults to `true` (`kernel.ts:205`) and gates the branch at `renderer.ts:650`. Measured: the distance holds at `0.35` through 15 s. The 4 s constant delays the spin, not the distance |
| `orbit3d.ts:3178` point size `Math.min(3, Math.max(1.8, width / 650))`, no depth term | **confirmed** as to content; the line is **3179**, not 3178. `gl_PointSize` is at `:209` (point shader) and `:436` (marker shader), both exact |
| `model.ts:104` `const limit = Math.min(maxPeriod, count - 1)` with `DEFAULT_KERNEL_SAMPLES = 8` at `kernel.ts:55` | **confirmed**, both line numbers exact. Adding the part the concern left open: `count - 1` is the binding term, the cap is 7, and `MAX_DETECTABLE_PERIOD` is inert |
| `bake-orbit3d.mjs:382-383` `q16` quantises to u16 over the fixed domain | **confirmed**, line numbers exact. Adding: the floor is 11.3x below the baker's own finest output, so it constrains nothing |
