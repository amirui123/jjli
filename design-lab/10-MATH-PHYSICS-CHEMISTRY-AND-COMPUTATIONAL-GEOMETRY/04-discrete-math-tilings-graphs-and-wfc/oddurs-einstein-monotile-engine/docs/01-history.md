# 01 — The einstein problem

## Statement

A set of prototiles is **aperiodic** if it tiles the plane and *every* tiling it
admits is non-periodic. (Note the quantifier: a square tiles non-periodically too —
just shift alternating rows — but it also tiles periodically, so it is not
aperiodic.)

The **einstein problem** asks: does an aperiodic set of size **1** exist?

It is the planar sibling of the second part of **Hilbert's 18th problem**, which
asked about anisohedral tiles in 3-space. Karl Reinhardt found anisohedral tiles in
1928, but they still tiled periodically.

Constraints on what counts made the problem slippery. Reasonable people disagreed
about whether the answer may use:

- matching rules or decorations (markings that restrict adjacency),
- a disconnected tile, or a tile with holes,
- **reflections** — is a mirror image "the same tile"?

The hat answers the question if you allow reflections. The spectre answers it under
every reading.

## Timeline

| Year | Who | Result |
| --- | --- | --- |
| 1961 | Hao Wang | Conjectures that every tile set that tiles the plane tiles it periodically (the *domino problem*). |
| 1964 | Robert Berger | Disproves it — the first aperiodic set, **20,426 Wang tiles**. |
| 1971 | Raphael Robinson | Down to **6 tiles**, with a hierarchical forcing argument that becomes the template for everything after. |
| 1974 | Roger Penrose | Down to **2 tiles** (kites and darts / thin and thick rhombs). Then the count stops moving for half a century. |
| 1988 | Peter Schmitt; later Conway & Danzer | The **SCD tile**: a single aperiodic prototile in **3D** — but it tiles with screw symmetry (translation composed with an irrational rotation), so it is not aperiodic in the strong sense, and it is not planar. |
| 1996 | Petra Gummelt | A decorated decagon covering the plane aperiodically — but tiles must **overlap**, so it is a covering, not a tiling. |
| 2010 | Joshua Socolar & Joan Taylor | The **Socolar–Taylor tile**: a genuine planar aperiodic monotile, but it needs **matching rules**. The undecorated version that enforces them geometrically is **disconnected**; a connected 3D variant is only weakly aperiodic (periodic in one direction). |
| Nov 2022 | David Smith | Finds the **hat** by cutting shapes out of card and by hand-assembling patches in PolyForm Puzzle Solver. Emails Craig Kaplan: this one "keeps going". |
| Dec 2022 | David Smith | Finds the **turtle**, an apparently unrelated shape that tiles the same way — the clue that leads Myers to the continuum. |
| Mar 2023 | Smith, Myers, Kaplan, Goodman-Strauss | [arXiv:2303.10798](https://arxiv.org/abs/2303.10798) — *An aperiodic monotile*. |
| May 2023 | same team | [arXiv:2305.17743](https://arxiv.org/abs/2305.17743) — *A chiral aperiodic monotile*. The spectre. |
| 2024 | — | Both papers published in *Combinatorial Theory* vol. 4 issue 2. |

## Why the near-misses were near

Every partial result traded away one property of "a single ordinary tile":

- SCD — wrong dimension, and screw symmetry rather than true aperiodicity.
- Gummelt — overlaps.
- Socolar–Taylor — decorations, or disconnection.

The hat gives up nothing except reflections. The spectre gives up nothing.

## The human story

Smith is a retired print technician and hobbyist with no formal mathematical
training, working from a kitchen table in Bridlington, Yorkshire. He found both
shapes by hand. Kaplan (computer graphics, Waterloo) supplied software and
searched the neighbourhood of the shape; Myers (a competitive-programming and
combinatorics background) supplied both proofs; Goodman-Strauss (a tiling theorist,
later at the National Museum of Mathematics) supplied the framing and exposition.

The relevant methodological lesson: Kaplan's own account is that the hat is
"a comically boring shape that had been catalogued by others many times in the
past". Prior enumerations had walked straight past it. What was missing was
someone patiently trying to *tile* with it.

See [references.md](references.md).
