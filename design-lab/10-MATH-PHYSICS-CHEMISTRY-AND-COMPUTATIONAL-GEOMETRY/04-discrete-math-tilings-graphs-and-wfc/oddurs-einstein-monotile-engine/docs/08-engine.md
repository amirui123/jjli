# 08 — The tiling engine

`src/` — framework-agnostic TypeScript, no DOM, no canvas, no dependencies.
Produces exact integer tile placements; callers turn them into pixels.

Run `npm test` (23 tests) and `npm run typecheck`.

## The finding that determined the architecture

The docs specified exact arithmetic in ℤ[√3]. Before writing anything I ported
hatviz's pure geometry into a probe and measured what the substitution actually
produces. Three results:

| Measurement | Result |
| --- | --- |
| Hat vertices vs. the half-Eisenstein lattice | Exact at every level. Deviation 2.7e-15 at level 0 → 3.0e-10 at level 7 (2.5M tiles) — pure float accumulation, never structural |
| Hat placements vs. the 12 hexagonal symmetries | Zero exceptions across 2.5M tiles. Uniform scale exactly ½ |
| Metatile outlines | **Not** on the lattice. `intersect()` produces genuinely irrational vertices |

So the tiles are exactly representable and the outlines are not. That splits the
engine cleanly, and it is why the code looks the way it does.

**The lattice.** ℤ[ω] with ω = e^(iπ/3), at half scale. A point is the integer
pair (a, b) meaning (a + bω)/2, i.e. x = (2a+b)/4, y = b√3/4. Since ω² = ω − 1,
rotation by 60° is `(a,b) ↦ (−b, a+b)` and reflection is `(a,b) ↦ (a+b, −b)` —
both exact integer ops. This is a better fit than ℤ[√3]: it makes the hexagonal
symmetry group act by integer arithmetic rather than merely representing √3.

**Why float, then snap.** The substitution has to run in float, because the
supertile outlines it matches against are irrational. But every hat it emits
lands on the lattice, so `fromXY` rounds to integers and *asserts* the residual
is under 1e-6. Observed residual is ~1e-10 — five orders of margin. After the
snap, everything downstream is integer: adjacency, dedup, patch matching and
hashing need no tolerances at all.

That assertion is also the drift test. `buildPatch(5)` succeeding *is* the proof
that 54,289 tiles are still exactly positioned.

**Inflation grows, it does not subdivide.** Hats keep their size and supertiles
get bigger, by φ² ≈ 2.618 linear / φ⁴ ≈ 6.854 in count. Subdividing instead
would introduce a new denominator per level and destroy the fixed lattice.

## Verified properties

Facts the test suite pins down, several of which also validate the maths docs:

- **Tile counts are Fibonacci squared** — 4, 25, 169, 1156, 7921, 54289 = 2², 5²,
  13², 34², 89². Growth converges to φ⁴.
- **The reflection ratio converges to φ⁴** — measured 6.864 at level 3, 6.850 at
  level 4, against φ⁴ = 6.8541. This independently confirms
  [02](02-the-hat.md#the-reflection-ratio) and rules out the "1 in 6" and
  "1 : 7.53" figures in popular coverage.
- **Reflected ⟺ the `H1` hat.** Metatiles are placed by rotation only
  (`matchTwo` is orientation-preserving), so all reflection comes from the single
  mirrored hat inside each H metatile.
- **All 12 orientations occur** by level 3.
- **No overlaps, no gaps** — 40,000 seeded Monte Carlo samples over level 2: no
  sample ever lands in two tiles, and covered area matches n × (hat area) to
  within 2%.
- **All hats congruent** to 12 decimal places.

## ⚠️ Metatile scaffolds are not tile boundaries

`MetaInstance.scaffold` is the polygon hatviz uses to drive the substitution's
edge-matching. It is emphatically *not* the outline of the tiles it contains:

| Level | Tile vertices outside their own scaffold | Tiles entirely outside |
| --- | --- | --- |
| 1 | 23.4% | 0 / 25 |
| 2 | 28.4% | 24 / 169 |
| 3 | 29.1% | 273 / 1156 |

Stroking these will look broken. The field is named `scaffold` rather than
`outline` so the API cannot mislead, and a test asserts the non-containment so
the semantics can't silently change.

**Consequence for scene 5.** Draw the hierarchy by grouping on `Tile.path` and
tinting by ancestor — no outline geometry needed, and it's the
`colourKey(tile, 'metatile')` scheme already specified in
[06 §5](06-webapp-design.md). If we later want stroked hulls, compute the true
union boundary: because tiles are on an exact lattice, the hull is just the
directed edges that appear once instead of twice. That is cheap and exact, but
needs care over T-junctions where one hat's long edge abuts two short ones. Not
built yet.

## Layout

```
src/
  eisenstein.ts        exact half-Eisenstein lattice arithmetic
  isometry.ts          the 12 hexagonal symmetries, exact
  patch.ts             public build + ancestry + the float→exact snap
  render.ts            the float boundary: lattice in, drawing coords out
  index.ts             public surface
  internal/
    affine.ts          float affine helpers (port of hatviz geometry.js)
    hat-data.ts        hat outline, 4 metatiles, 29-rule substitution table
    substitution.ts    one inflation step (port of hatviz hat.js)
test/                  23 tests
```

`internal/` is construction-time float machinery and is not exported. The data in
`hat-data.ts` is transcribed, not derived — a single wrong digit yields a tiling
that looks plausible and is wrong, so it must not be hand-edited.

## Performance

Measured on this machine, build plus full polygon generation:

| Level | Tiles | Build | Polygons |
| --- | --- | --- | --- |
| 3 | 1,156 | 1 ms | 2 ms |
| 4 | 7,921 | 3 ms | 7 ms |
| 5 | 54,289 | 13 ms | 40 ms |
| 6 | 372,100 | 74 ms | 230 ms |

Comfortably inside the budget in [06 §6](06-webapp-design.md). Scenes 0–7 use a
few hundred tiles; level 5+ is desktop-sandbox territory, and at those counts the
renderer, not the engine, is the constraint.

## What's next

1. **Legal-move enumeration** for scene 3 — given a placed hat and an exposed
   edge, which of the 12 orientations produce a legal neighbour. This is the
   MVP's load-bearing interaction and the engine doesn't do it yet.
2. **Patch matching** for scene 4 — find other occurrences of a selected patch.
   Exact integer keys make this straightforward.
3. **True metatile hulls**, per above, if tinting proves insufficient.
4. **The `Tile(a,b)` continuum** for scene 7. The combinatorics are shared across
   the whole family, so this is a re-parameterised *rendering* of the same
   placement data — geometry only, no new substitution. Deliberately deferred:
   scene 7 is not MVP.

## Provenance

Substitution data and float geometry ported from
[isohedral/hatviz](https://github.com/isohedral/hatviz) (Craig S. Kaplan,
BSD 3-clause), the reference implementation for Smith, Myers, Kaplan &
Goodman-Strauss, *An aperiodic monotile* (2023). Ported faithfully so our output
provably agrees with the reference.
