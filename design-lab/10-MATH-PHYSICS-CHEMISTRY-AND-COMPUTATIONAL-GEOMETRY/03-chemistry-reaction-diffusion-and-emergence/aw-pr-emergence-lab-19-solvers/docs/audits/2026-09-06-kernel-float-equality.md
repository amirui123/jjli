# Kernel float-equality audit — 2026-09-06

Stage 72 found that Brian's Brain stored `dyingValue` in a `Float32Array` and
compared it with `===` against the unrounded parameter, so every non-dyadic
value silently failed to match (fixed by rounding the parameter through
`Math.fround` at the point it is stored, `src/sims/brians-brain/kernel.ts:135-137`).
Stage 72's envelope asked for the same pattern to be checked in every other
kernel that stores `Float32Array` state. This audit covers all 22 kernels
under `src/sims/*/kernel.ts`.

The defect pattern being searched for is specifically: a value derived from a
user-facing, non-dyadic `number` parameter is stored into a `Float32Array`
(which truncates it to float32 precision), and is later compared with `===`
or `!==` against the original, unrounded (float64) parameter or a value
derived from it. Comparisons that are safe by construction — integer-valued
or dyadic-only state, reference/pointer comparisons, change-detection between
two values that both already went through the same float32 rounding, string
or boolean comparisons, and sentinel-constant comparisons — are marked
`safe` with the reason. `none` means no exact-equality comparison against
float-typed state exists in that kernel at all.

## Result

**Zero open defects.** The one known defect (Brian's Brain, stage 72) is
already fixed on `dev`. No other kernel exhibits the pattern.

## Audit table

| Kernel | Comparison site(s) | Verdict | Reason |
|---|---|---|---|
| abelian-sandpile | `kernel.ts:342` `this.queued[index] === 1` | safe | `queued` is a `Uint8Array` flag, always exactly 0 or 1; `grains`/`activity` (the `Float32Array`s) are never compared with `===` against a parameter. |
| belousov-zhabotinsky | — | none | No exact-equality comparison against `Float32Array` state or a float parameter anywhere in the kernel. |
| boids | `kernel.ts:212` `candidate.halfX === 0 && candidate.halfY === 0` | safe | `halfX`/`halfY` come from parsed JSON input (full float64), compared against the exact literal `0`, not read back from a `Float32Array`. |
| brians-brain | `kernel.ts:174` `current === dyingValue` | safe (fixed, stage 72) | `dyingValue` is rounded through `Math.fround` at `kernel.ts:135-137` before being stored/compared, so both sides carry the same float32 value. |
| burning-ship | `kernel.ts:320` `value !== before[index]` (selfTest) | safe | Change-detection between two `Float32Array` reads; both sides already passed through the same rounding, so no precision mismatch is possible. |
| clifford-dejong | `kernel.ts:537,540` `this.colourMode === "cycle"` / `"angle"` | safe | String/enum comparison, not numeric. |
| cyclic-ca | `kernel.ts:248` `state[ny*width+nx] === target` | safe | `state` holds integers in `0..states-1` (`states` is `boundedInteger`); `target` is `(current + 1) % states`, also integer. All values are exactly representable in float32. |
| diffusion-limited-aggregation | `kernel.ts:469,494-497` `this.order[...] !== 0` | safe | `order` stores an integer attachment sequence number (or 0 for unattached); never a rounded fractional parameter. |
| elementary-cellular-automata | `kernel.ts:240,243` `state[index] === 1`, `!== 0 && !== 1` | safe | `state` is strictly binary (0/1). |
| game-of-life | `kernel.ts:345,387,388` `alive[index] === 1` | safe | `alive`/`aliveNext` are only ever assigned the literal `0` or `1`. |
| gray-scott | `kernel.ts:242` `state !== output` | safe | Reference (pointer) comparison of the double-buffer swap, not a value comparison. |
| ising-model | — | none | Spins are stored as exact `±1`; no comparison against a stored float parameter. |
| julia-set | `kernel.ts:351` `value !== before[index]` (selfTest) | safe | Change-detection between two `Float32Array` reads, same reasoning as burning-ship. |
| kuramoto-oscillators | `kernel.ts:267` `value !== before[index]` (selfTest) | safe | Change-detection between two `Float32Array` reads. |
| lenia | — | none | No exact-equality comparison against float-typed state or parameters. |
| logistic-mandelbrot | `kernel.ts:400` `result === ESCAPED`; `kernel.ts:475-546` selfTest literal checks | safe | `ESCAPED` is an integer sentinel returned by `sampleAttractorCell`, not a stored user parameter; the selfTest literals (`0`, `0.5`, `1`, `2`) are values the kernel itself writes directly in code, not a float32-truncated copy of an unrounded parameter. |
| lorenz-attractor | `kernel.ts:574` `this.previousGridX !== null` | safe | Null-sentinel check, not numeric. |
| mandelbrot | `kernel.ts:276` `base === 0` | safe | `this.base[index]` is only ever assigned the exact literal `0` (line 262) or a `boundedNumber` fraction; the comparison is against the exact `0`, which is always representable, not against an unrounded parameter. |
| markus-lyapunov | — | none | No exact-equality comparison against float-typed state or parameters. |
| particle-life | `kernel.ts:351` `distSq === 0` | safe | Self-pair squared-distance check (`i === j` case), not a comparison against a stored parameter. |
| physarum | — | none | No exact-equality comparison against float-typed state or parameters. |
| swarmalators | `kernel.ts:449` `index % CHANNEL_COUNT === 0` (selfTest) | safe | Integer modulo, not a float comparison. |

## Method

For every `kernel.ts`, every `===`/`!==` site was enumerated (`grep -nE
"===|!=="`), then classified by tracing both operands back to their origin:
literal, integer-only parameter (`boundedInteger`), string/boolean/enum,
array-reference, or a value that passed through `Float32Array` storage. Sites
where a `Float32Array`-stored value is compared against a raw (unrounded)
`number`-typed parameter were searched for explicitly with:

```
grep -nE '\]\s*(===|!==)\s*this\.|this\.\w+\s*(===|!==)\s*\w*\[' */kernel.ts
```

which returned no matches outside the already-fixed Brian's Brain site.

## Escalation

Per the stage card's escalation clause: a clean audit with zero defects is a
full pass. No fixes, no new tests, and no preset-divergence measurement were
required.
