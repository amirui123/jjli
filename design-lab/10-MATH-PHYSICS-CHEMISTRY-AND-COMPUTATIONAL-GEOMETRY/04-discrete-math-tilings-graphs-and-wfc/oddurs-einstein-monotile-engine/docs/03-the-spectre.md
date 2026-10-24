# 03 — The spectre

**Smith, Myers, Kaplan, Goodman-Strauss, *A chiral aperiodic monotile*.**
[arXiv:2305.17743](https://arxiv.org/abs/2305.17743), submitted 28 May 2023,
published *Combinatorial Theory* 4(2) #13, 2024.

> The recently discovered "hat" aperiodic monotile mixes unreflected and reflected
> tiles in every tiling it admits, leaving open the question of whether a single
> shape can tile aperiodically using translations and rotations alone.

## The objection this answers

The hat needs its mirror image ([02](02-the-hat.md#the-reflection-ratio)). If you
insist a physical tile cannot be flipped — a sheet of material printed on one side,
a chiral molecule — then the hat is really a two-tile set. The spectre closes that
gap.

Three grades of the property, worth keeping straight:

| Term | Meaning |
| --- | --- |
| **aperiodic** | tiles the plane, and every tiling it admits is non-periodic |
| **weakly chiral** | aperiodic *provided reflections are forbidden by fiat*; with reflections allowed it can tile periodically |
| **strictly chiral** | aperiodic even when reflections are permitted — reflected copies simply never help |

## `Tile(1,1)` — weakly chiral

The equilateral member of the continuum, the *hurtle*. Because all 14 edges have
equal length it is more flexible than its neighbours, and that flexibility lets it
tile **periodically** — but only in tilings that use both handednesses.

Forbid reflections and every remaining tiling is non-periodic. So `Tile(1,1)` is
a weakly chiral aperiodic monotile. Not good enough on its own: "forbid
reflections" is an external rule, exactly the kind of crutch the einstein problem
was supposed to do without.

## The spectre — strictly chiral

Fix it geometrically. Replace `Tile(1,1)`'s straight edges with matching curved or
jigsaw-like edges, chosen so that a reflected copy physically cannot mate with an
unreflected one. Any such modification is a **spectre**; there is a whole family
of them, since the exact curve is free.

The result is a single shape, no decorations, no matching rules, no reflections
needed or usable. Tiles appear in **12 orientations** (multiples of 2π/12 = 30°).

The original paper's canonical spectre uses a shape sometimes described as having
14 equal edges with 90° and 120° angles (plus the 180° vertex) before the edge
modification.

## Substitution: Spectres and Mystics

Spectre tilings come in two flavours of tile, **even** and **odd** spectres. One
even and one odd spectre glue into a compound called a **Mystic** — a symmetric
two-spectre cluster that the authors note resembles a seated Buddha.

The substitution system has two rules:

```
Spectre  →  1 Mystic + 7 Spectres     (9 spectres' worth)
Mystic   →  1 Mystic + 6 Spectres     (8 spectres' worth)
```

with **all tiles in the replacement reflected** — so the handedness of the whole
patch flips at every inflation step. (Note this is chirality of the *hierarchy*,
not of the tile: the individual spectres in any one finished tiling are all the
same handedness.)

The substitution matrix in the basis (Spectre, Mystic) is

```
[ 7  6 ]
[ 1  1 ]
```

with characteristic polynomial λ² − 8λ + 1, so the **inflation factor (Perron
root) is 4 + √15 ≈ 7.873**, and the limiting Spectre : Mystic ratio is the
eigenvector ratio 3 + √15 ≈ 6.873. This is the source of the `4 + √15` that turns
up throughout the physics literature — see the warning in
[02](02-the-hat.md#the-reflection-ratio) about not confusing it with the hat's
φ⁴ reflection ratio.

## Hexagonal metatiles (the implementation-friendly view)

Simon Tatham's reformulation, and the basis for the algorithm in
[04-implementation.md](04-implementation.md): instead of substituting spectres
directly, substitute **nine regular hexagonal metatiles** labelled

```
G  D  J  L  X  P  S  F  Y
```

The hexagons themselves tile aperiodically and expand under a substitution rule.
Only at the very end do you convert hexagons to spectres — each hexagon yields one
spectre, except **G**, which yields two. (G is the Mystic.)

Working in hexagons rather than 14-gons makes adjacency, addressing and traversal
tractable, because the neighbour structure is regular.

## Where this leaves the einstein problem

Solved, under every reasonable reading of the question. What remains open is
*why* — see [05-frontier.md](05-frontier.md).
