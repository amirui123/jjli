# docs/INTERFACE.md — Kernel to Renderer Interface Contract

**Status: reviewed contract — v1.3.0 (2026-08-15)**

This file defines the TypeScript interface that all simulation kernels must
implement and that the renderer consumes. It is the only shared surface
between kernels and the renderer, and a reviewed boundary not owned by any one
model. Code that implements or consumes it must not change its shape casually:
any change to the shape is a new version and must be committed before any
dependent code work begins.

---

## SimKernel interface

```typescript
/**
 * A single tunable parameter, used by the renderer to auto-generate controls.
 * No per-sim hardcoding in the renderer: it builds the controls panel from
 * the kernel's paramSchema alone.
 */
export interface ParamDescriptor {
  key: string;            // matches a key in SimParams
  label: string;          // human-readable, for the control label
  type: "number" | "boolean" | "enum";
  default: number | boolean | string;
  min?: number;           // required when type === "number"
  max?: number;           // required when type === "number"
  step?: number;          // slider granularity when type === "number"
  options?: readonly string[]; // required when type === "enum"
  info?: string;          // one/two plain sentences: what the control does,
                          // what changes visually, and any rebuild cost.
                          // Rendered by the controls panel as an info popup.
  group?: string;         // optional section heading; params sharing a group
                          // render together, in schema order. Ungrouped params
                          // render in the sim's default section.
}

/**
 * Parameters passed to a kernel on initialisation. Keys must correspond to
 * ParamDescriptor.key entries in the kernel's paramSchema.
 */
export type SimParams = Record<string, number | boolean | string>;

/**
 * The contract every simulation kernel must satisfy.
 *
 * Lifecycle:
 *   1. new KernelClass()          — construct; no side effects
 *   2. kernel.init(w, h, params)  — allocate buffers, set initial state
 *   3. kernel.step(dt)            — advance simulation by dt seconds
 *   4. kernel.readState()         — read current state for rendering
 *   5. kernel.destroy()           — release any resources
 */
export interface SimKernel {
  /**
   * Initialise or re-initialise the simulation.
   * Must be idempotent — calling again resets to initial conditions.
   *
   * @param width   Grid columns. The renderer chooses this; it is the
   *                 simulation's compute resolution, NOT the canvas pixel width.
   * @param height  Grid rows. Renderer-chosen compute resolution, not canvas
   *                 pixel height.
   * @param params  Simulation-specific parameter set. Missing keys take the
   *                 default from paramSchema.
   */
  init(width: number, height: number, params: SimParams): void;

  /**
   * Advance the simulation. SYNCHRONOUS by contract.
   *
   * Workers, WASM and GPU compute are an internal kernel detail. A kernel that
   * computes asynchronously must double-buffer internally and have step()
   * advance to the latest available state without blocking the caller. step()
   * never returns a promise. This keeps the render loop and the Codex/Cursor
   * boundary simple; the cost of async is borne inside the kernels that need
   * it, not imposed on every simple sim.
   *
   * @param dt  Elapsed time in seconds since the last step. Kernels that use a
   *            fixed internal timestep may ignore the value but must accept it.
   */
  step(dt: number): void;

  /**
   * Return the current state as a flat Float32Array.
   *
   * Float32Array is the single canonical state representation: it preserves
   * field precision. Kernels never produce ImageData or Uint8 buffers. Mapping
   * floats to pixels (colour maps, normalisation) is the renderer's job, using
   * channelRanges to normalise.
   *
   * Layout: one float per cell per channel, row-major, channel-interleaved.
   * Length must equal width * height * channelCount.
   *
   * The renderer calls this after every step(); the kernel must return a
   * stable pre-allocated reference and must not allocate per call.
   */
  readState(): Float32Array;

  /**
   * Number of float channels per cell (e.g. 1 scalar field, 2 for
   * reaction-diffusion U+V, 4 for RGBA).
   */
  readonly channelCount: number;

  /**
   * Expected [min, max] value range for each channel, so the renderer can
   * normalise to a colour map without inspecting the data. Length must equal
   * channelCount. Use the analytic range where known (e.g. [0, 1]).
   */
  readonly channelRanges: readonly (readonly [number, number])[];

  /**
   * Human-readable name of this simulation, e.g. "Gray-Scott".
   */
  readonly name: string;

  /**
   * Descriptive label for each channel, for the renderer's legend.
   * Length must equal channelCount.
   */
  readonly channelLabels: readonly string[];

  /**
   * The tunable parameters this kernel exposes. The renderer builds its
   * controls panel from this alone. Order is the display order.
   */
  readonly paramSchema: readonly ParamDescriptor[];

  /**
   * Release any resources held by the kernel (Workers, WASM memory, etc.).
   * The renderer calls this before discarding a kernel instance.
   */
  destroy(): void;

  /**
   * OPTIONAL pointer-interaction hook (v1.1.0). When present, the renderer
   * calls it in response to a user pointer gesture (click / drag) over the sim
   * canvas, perturbing the simulation under the pointer. Kernels that omit it
   * are simply not interactive; nothing else changes for them.
   *
   * Coordinates are in GRID CELLS, matching readState()'s row-major layout:
   * x in [0, width), y in [0, height), origin at the first cell of the state
   * array. The renderer owns the CSS-pixel -> letterboxed-canvas -> grid-cell
   * mapping (including any backend-specific axis orientation); the kernel only
   * ever sees grid coordinates.
   *
   * @param x         Grid column, may be fractional. Out-of-range is clamped or
   *                   ignored by the kernel.
   * @param y         Grid row, may be fractional.
   * @param radius    Brush radius in cells (>= 0).
   * @param strength  Normalised intensity in [0, 1]; 1 is a full-strength poke.
   *
   * Contract:
   *   - Called only BETWEEN step() calls, never re-entrantly during one.
   *   - Must NOT allocate (same rule as step()/readState()); mutate existing
   *     buffers in place.
   *   - Determinism: identical to the pure step() sequence EXCEPT for the user
   *     input it applies. Given the same impulses at the same points in the
   *     step sequence, the result is reproducible.
   */
  applyImpulse?(x: number, y: number, radius: number, strength: number): void;

  /**
   * OPTIONAL completion signal (v1.2.0). Returns true once a run has reached a
   * terminal state that further step() calls will not change (e.g. a growth
   * sim whose aggregate has filled the frame). The renderer polls it after
   * stepping; when a sim reports completion and the user has auto-cycle
   * enabled, the renderer re-initialises the kernel with a fresh seed after a
   * brief hold, so a new randomised run begins. Kernels that omit it are
   * treated as never-complete and run indefinitely (the previous behaviour).
   *
   * Must be a cheap, allocation-free read of existing state — the renderer may
   * call it every frame. It reports the kernel's own notion of "done"; it does
   * not itself reset anything.
   */
  isComplete?(): boolean;
}
```

---

## Resolved design decisions (v1.2.0)

6. **Optional `isComplete` for run auto-cycling.** Kernels whose runs reach a
   terminal, unchanging state may expose `isComplete(): boolean`. The renderer
   polls it after stepping; when it returns true and the user has auto-cycle
   enabled, the renderer holds the finished frame briefly and then re-seeds via
   its normal reset path, starting a fresh randomised run. It is additive and
   backwards-compatible: kernels without it are treated as never-complete and
   run indefinitely, exactly as before, and the auto-cycle control is only
   surfaced for sims that implement it. The method is a cheap, allocation-free
   read of existing state (same rule as `step()`/`readState()`); it only
   *reports* completion and never mutates or resets anything — the reset is the
   renderer's job. This is a purely additive surface change, so it bumps the
   minor version.

## Resolved design decisions (v1.3.0)

7. **Optional `info` and `group` on `ParamDescriptor`.** `info` carries a
   short plain-language description of what the control does; the renderer
   surfaces it as an info affordance (an ⓘ popup) beside the control.
   `group` names a section heading; the renderer renders params sharing a
   group together in schema order, using the existing collapsible-section
   component, with ungrouped params in the sim's default section. Both fields
   are optional and additive: kernels that omit them render exactly as
   before, and the renderer still builds the panel from `paramSchema` alone
   with no per-sim branching. Purely additive surface change; bumps the minor
   version because the descriptor shape gains members.

   The kernel schema is now the sole source of parameter grouping for every
   sim, with no app-side grouping table. After the existing View controls
   claim their keys, sections follow first-appearance schema order and their
   members retain schema order; the ungrouped remainder follows in Parameters.
   This consolidation preserves the rendered grouping and does not change the
   descriptor shape, so the interface version remains v1.3.0.

## Resolved design decisions (v1.1.0)

5. **Optional `applyImpulse` for pointer interaction.** Kernels may expose an
   optional `applyImpulse(x, y, radius, strength)` method to accept a pointer
   perturbation under the cursor (click / drag). It is additive and
   backwards-compatible: existing kernels that do not implement it are simply
   non-interactive, and no renderer or kernel behaviour changes for them. The
   renderer owns the pixel -> grid-cell mapping (the letterbox contain-rect plus
   backend axis orientation), so coordinates reach the kernel already in grid
   cells; radius is in cells and strength is normalised to [0, 1]. The method
   obeys the same no-allocation rule as `step()` and preserves determinism apart
   from the user input it applies. This is a purely additive surface change; it
   bumps the minor version because the interface shape gains a member.

## Resolved design decisions (v1.0.1)

4. **`init(width, height)` receives a renderer-chosen grid size, not the canvas
   pixel size.** Compute resolution (the grid passed to `init()`) and display
   resolution (the canvas backing store) are independent. The renderer derives
   the grid from a user-selectable quality preset and the viewport aspect, then
   upscales the kernel's state to fill the canvas (letterboxed). This keeps
   simulation cost constant across screen sizes and means a pure window/viewport
   resize updates only the display — it does **not** re-init the kernel. Kernels
   are unaffected: they still receive `width`/`height` and allocate accordingly.
   This is a documentation clarification of existing semantics; the interface
   surface is unchanged.

## Resolved design decisions (v1.0)

1. **`step()` is synchronous.** Workers/WASM/GPU are internal kernel details;
   async kernels double-buffer and expose the latest state non-blocking. A sync
   contract keeps the render loop and the model boundary clean and avoids
   forcing async ceremony on every simple sim.
2. **Parameters are self-describing via `paramSchema`.** The renderer
   auto-generates controls from `ParamDescriptor[]`; no per-sim UI code. This
   resolves the Cursor controls-panel placeholder generically.
3. **`Float32Array` is the only state type.** It preserves field precision.
   Display conversion (colour maps, normalisation via `channelRanges`) is the
   renderer's responsibility. Kernels never emit ImageData.

---

## Notes for kernel authors

- Implement `SimKernel` exactly. Do not add methods the renderer cannot see.
- `readState()` returns a stable pre-allocated reference; never allocate per call.
- Deterministic: same `params` + same `step(dt)` sequence => identical `readState()`.
- Provide `paramSchema` and `channelRanges`; the renderer depends on both.
- Export a `selfTest(): boolean` alongside the class (not on the interface).
- `applyImpulse` is optional; implement it only for sims where a pointer poke is
  meaningful. It follows the same no-allocation and determinism rules as `step()`.
- `isComplete` is optional; implement it only for sims that reach a terminal,
  unchanging state. Keep it a cheap, allocation-free read; it must report the
  kernel's own "done" state and never reset or mutate anything.
- Do not import from `src/app/**`. The kernel has no knowledge of the renderer.

## Notes for renderer authors

- Import `SimKernel`, `SimParams`, `ParamDescriptor` from this file (or a `.d.ts`).
- Build the controls panel from `paramSchema` only; no per-sim branching.
- Normalise with `channelRanges`; treat `readState()` as read-only.
- Call `init()` before the first `step()`, and on a grid-size or param change.
  A pure display/viewport resize must NOT call `init()` — it only rescales the
  canvas; the grid and simulation state are preserved.
- Call `destroy()` when swapping kernels or unmounting.
- Do not import from `src/sims/**` directly. Kernels load dynamically.

## Testing a pure `src/app` module

`npm test` discovers tests and compiles sources by two different mechanisms,
and only one of them is automatic. `scripts/run-kernel-tests.cjs` walks
`src/sims`, `src/app` and `e2e/harness` and runs every `*.test.cjs` it finds,
so **discovery needs nothing from you**. Compilation is the explicit `include`
array in `tsconfig.test.json`, which `npm run build:test` emits to
`.test-build/` and which `npm run typecheck` also typechecks. A new module is
not in that array until someone puts it there.

So there are two routes, and which one you take is fixed by what the module is:

- **The module is TypeScript under `src/app`** (the normal case, e.g.
  `orbitRefinement.ts`). Add its path to the `include` array in
  `tsconfig.test.json`, and have the test `require("../../.test-build/app/<name>.js")`.
  **A stage card that adds such a test must claim `tsconfig.test.json` in its
  path claims**, or the worker will be blocked on an unclaimed file for a
  one-line edit.
- **The module is already plain CommonJS** (e.g. a script under `scripts/`,
  as `paramGroups.test.cjs` does). Require it directly. No `include` entry,
  no build step, nothing to claim.

Two constraints are worth knowing before you try to widen this:

- The `include` array cannot be a glob over `src/app`. The app build
  (`tsconfig.json`) uses `moduleResolution: "Bundler"` with
  `allowImportingTsExtensions`, so app modules import each other with explicit
  `.ts` specifiers; the test build uses `moduleResolution: "Node16"`, which
  rejects those with TS5097. Twenty of the thirty-seven modules under `src/app`
  cannot compile under the test config at all. Only modules whose relative
  imports are type-only (or absent) are eligible. Measured and recorded in
  `docs/audits/2026-09-13-app-test-build-convention.md`.
- `src/sims/**/kernel.ts` stays the first `include` entry. Kernel test coverage
  does not depend on anyone remembering to list a file.

If you forget the `include` entry, `npm test` now says so by name rather than
failing with `MODULE_NOT_FOUND`: the runner checks every `.test-build/` require
before it starts node:test and reports the missing source path.

This section is a build convention, not part of the `SimKernel` shape, so it
carries no contract version of its own.

## Changing this contract

Bump the version, record the change under "Resolved design decisions", and
commit. Update `HANDOFF.md` if the change affects the active work plan, then
re-prompt code agents.
