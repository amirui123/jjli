# 02 — The hat

**Smith, Myers, Kaplan, Goodman-Strauss, *An aperiodic monotile*.**
[arXiv:2303.10798](https://arxiv.org/abs/2303.10798), submitted 20 Mar 2023,
published *Combinatorial Theory* 4(1) #6, 2024.

> We exhibit a continuum of combinatorially equivalent aperiodic polygons.

## The shape

Start from the **deltoidal trihexagonal tiling** (the [3.4.6.4] Laves tiling): a
hexagonal grid in which every hexagon is cut into 6 kites by joining its centre to
its vertices and edge midpoints. Each kite has angles 90°, 120°, 90°, 60°.

The **hat is an 8-kite polykite**. As a simple polygon it is a **13-gon**; in the
parameterized form below it has 14 edges, one vertex being a straight 180° angle.
All its angles are multiples of 30°. It has no reflection symmetry.

It is not exotic. Kaplan: *"a comically boring shape that had been catalogued by
others many times in the past."* Earlier polyform enumerations had listed it and
moved on, because nobody tried to tile with it.

## The `Tile(a,b)` continuum — the real result

The hat's 14 edges alternate in a pattern of two lengths. Replace those with free
parameters `a` and `b` and you get a one-parameter family (up to scale) of
combinatorially equivalent polygons, `Tile(a,b)`.

| Member | Name | Behaviour |
| --- | --- | --- |
| `Tile(1, √3)` | **the hat** | aperiodic |
| `Tile(√3, 1)` | **the turtle** | aperiodic |
| `Tile(1, 1)` | the *hurtle* — equilateral | **admits periodic tilings too** |
| `Tile(0, 1)` | the **chevron** | degenerate; admits periodic tilings |
| `Tile(1, 0)` | the **comet** | degenerate; admits periodic tilings |
| all others | — | aperiodic monotiles, with combinatorially identical tilings |

So there is not one einstein but an uncountable family of them, all tiling "the
same way". Smith found the hat and the turtle independently and they looked
unrelated; Myers spotted that they were two points on one curve. That observation
is what unlocked the second proof.

`Tile(1,1)` looks like a mere exception here. It is the seed of the spectre —
see [03-the-spectre.md](03-the-spectre.md).

## Metatiles and the substitution system

Hats in any tiling clump into four **metatiles**, labelled **H, T, P, F**:

- **H** — contains 4 hats (3 unreflected + 1 reflected), triangular arrangement
- **T** — 1 hat
- **P** — 2 hats
- **F** — 2 hats

The metatiles obey a substitution (inflation) rule: each metatile expands into a
patch of smaller metatiles, and the process iterates. The limit is a hierarchical
tiling, and hierarchical ⟹ non-periodic. The paper's `H7`/`H8` variants of the
rule are what Kaplan's `hatviz` app implements.

## The two proofs

### 1. Combinatorial, computer-assisted

Show that any legal patch of hats is forced into the H/T/P/F metatile
decomposition, that the metatiles obey the substitution rule, and that the
substitution generates a hierarchical structure admitting no translational
symmetry. Case analysis is large enough to need a computer; Myers' verification
code is published (see [04-implementation.md](04-implementation.md)).

This is a Robinson-style argument — the same shape of proof as every aperiodic set
since 1971.

### 2. Geometric incommensurability — the surprise

This one is short and checkable by hand, and it proves the *whole continuum*
aperiodic at once.

Suppose some `Tile(a,b)` admitted a periodic tiling. Because all members are
combinatorially equivalent, you can continuously deform that tiling — stretching
the `a` edges and squeezing the `b` edges — into periodic tilings by any other
member, including both degenerate endpoints, the **chevron** `Tile(0,1)` and the
**comet** `Tile(1,0)`. Those two degenerate tilings inherit their combinatorics
from the same hypothesised periodic hat tiling, so their underlying triangular
grids must be related by a fixed scaling factor. Compute that factor and it turns
out to be irrational — an impossible ratio between two lattices forced to be
commensurate. Contradiction.

The authors did not expect a proof of this kind to exist. It is arguably the more
important contribution: it is a *new technique* for proving aperiodicity, not just
a new tile.

## The reflection ratio

Every hat tiling uses both the hat and its mirror image (the "anti-hat"). This is
unavoidable, not an artefact of a particular tiling.

The ratio is **unreflected : reflected = φ⁴ : 1**, where φ is the golden ratio:

```
φ⁴ = (7 + 3√5)/2 ≈ 6.8541
reflected density = 1/(φ⁴ + 1) ≈ 0.1273     (about 1 tile in 7.85)
```

> ⚠️ **Two constants that get confused.** φ⁴ ≈ 6.854 is the *reflection ratio*
> above. **4 + √15 ≈ 7.873** is the Perron root of the *spectre's* Spectre/Mystic
> substitution matrix — a different quantity from a different paper, derived in
> [03](03-the-spectre.md#substitution-spectres-and-mystics). They are close enough
> to swap unnoticed. Popular coverage also repeats a plain-wrong "1 in 6" and a
> "1 : 7.53". Check the source before quoting any of them.

Whether the reflection requirement disqualifies the hat as an einstein is a matter
of definition. Most tiling theorists say no, it counts. The objection was common
enough that the team went and eliminated it anyway, two months later.
