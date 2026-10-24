# einstein-tile

**[A shape that never repeats →](https://oddurs.github.io/einstein/)**

An interactive explainer for the einstein tile: one ordinary-looking polygon
that covers an endless floor without the pattern ever repeating. Six scenes,
about four minutes.

Three of them are driven by scroll — the hat assembles, the hierarchy pulls
back, the tile stretches into the turtle — because those scenes were already a
function of one number and scroll is one number. The other two are not, and
that is deliberate: they are the ones where you use your hands.

> Slide a copy of a hexagon floor onto itself and it clicks. Slide a copy of
> this one and it never does — and there are only thirty-one slides that could
> possibly have worked, so you can try them all.

Also: **[make one](https://oddurs.github.io/einstein/make/)**.

## What's here

| | |
| --- | --- |
| `src/pages/` | The piece. One page, scenes as figures in an article |
| `src/scenes/` | One module per scene |
| `src/renderer/` | Canvas 2D renderer, gestures, validated palettes |
| `src/engine/` | The tiling engine — no DOM, no dependencies |
| `docs/` | The research, the design decisions, and what is still unverified |

## The engine

`src/engine/` is a standalone TypeScript library with no dependencies and no
rendering. It produces **exact** tile placements — integers, not floats.

```ts
import { buildPatch, polygon, boundaryLoops, deform } from './src/engine/index.js';

const patch = buildPatch(4);              // 7,921 hats, ~3ms
for (const tile of patch.tiles) polygon(tile);   // 13 vertices each
boundaryLoops(patch.tiles);               // the true outline of any tile group
deform(patch.tiles, 0.6, 0.7);            // the same tiling, a different shape
```

Tiles live on the half-Eisenstein lattice ℤ[ω] at half scale, where
ω = e^(iπ/3). Since ω² = ω − 1, rotating by 60° is `(a,b) ↦ (−b, a+b)` and
reflecting is `(a,b) ↦ (a+b, −b)` — both exact integer operations. A patch at
substitution level 6 is positioned as precisely as one at level 1.

The substitution itself must run in floating point, because the metatile
scaffold polygons are genuinely irrational; every hat is then snapped back onto
the lattice with an **asserted** 1e-6 tolerance against an observed residual of
~1e-10. Details and measurements in [`docs/08-engine.md`](docs/08-engine.md).

| level | tiles | build | polygons |
| --- | --- | --- | --- |
| 4 | 7,921 | 3 ms | 7 ms |
| 5 | 54,289 | 13 ms | 40 ms |
| 6 | 372,100 | 74 ms | 230 ms |

A few things in here were derived rather than looked up, and are written down
because they were not obvious:

- **The hat's 8 kites**, and the index-12 sublattice their hexagons live on — so
  overlap is a set-intersection on integers rather than a geometry problem.
  Alignment turns out to be *relative*, not absolute ([`docs/08`](docs/08-engine.md)).
- **Exact group outlines** by pairing directed lattice edges, which needs no
  polygon clipping and no tolerances.
- **The `Tile(a,b)` deformation.** Every edge has one of two lengths, and the
  unit vectors of each length class sum to zero *independently* — so the polygon
  closes for any pair, and a whole tiling can be deformed by walking it.

## Running it

```bash
npm install
npm run dev        # the piece, at /einstein/
npm run verify     # typecheck, 168 unit tests, browser smoke check
npm run og         # regenerate the share card from the engine
```

`npm run verify` needs browsers once: `npx playwright install chromium`.

## What is and isn't verified

[`docs/12-verification.md`](docs/12-verification.md) is the honest version, and
worth reading before trusting a green build. The short form: the engine and the
page are checked on every push; **Safari is entirely unverified** because WebKit
would not install in the development environment; and **no human has read the
piece**, which is the gap that matters most.

## Docs

The research came first and is kept separately from the product decisions.

| | |
| --- | --- |
| [01 History](docs/01-history.md) | The einstein problem, 1961–2022 |
| [02 The hat](docs/02-the-hat.md) | `Tile(a,b)`, metatiles, the two proofs |
| [03 The spectre](docs/03-the-spectre.md) | Chirality and the 2023 follow-up |
| [04 Implementation](docs/04-implementation.md) | Algorithms and prior art |
| [05 Frontier](docs/05-frontier.md) | 2024–2026 research, open questions |
| [06 Design](docs/06-webapp-design.md) | Pedagogy, narrative, mobile UX |
| [07 Scope](docs/07-scope.md) | What this teaches, and what it refuses to |
| [08 Engine](docs/08-engine.md) | Exact-arithmetic design and measurements |
| [12 Verification](docs/12-verification.md) | What is verified, and what isn't |
| [References](docs/references.md) | Annotated bibliography |

Sprint records are `docs/09`–`11` and `13`–`21`.

## Typography

Set in **Computer Modern** — Knuth's face for TeX, and the reason a LaTeX
document is recognisable across a room — self-hosted as two Latin subsets, 21 KB
together, with no bold: the piece needed emphasis twice, and that is what italic
is for.

One correction was needed to make it read naturally on a web page. `cmr10`
declares an interword space of 0.333em, but it also declares **0.111em of
shrink**, which TeX spends routinely while justifying; a browser setting
ragged-right never spends it, so it renders the full 0.333em and the paragraph
fills with rivers. Taking 0.09em back lands the space at 0.243em — the same
space-to-x-height ratio as Times, and still inside what cmr10 itself says is
available.

The measure is stated in characters rather than pixels, because line length is a
count of characters and a fixed width silently becomes a different count when the
typeface changes. `npm run type` measures it, along with the *rag* — the spread
of line lengths, which is the quantity TeX minimises. Both are reported at three
widths, because a measure regression once slipped through a screenshot check that
only looked at a phone.

## Credits

The hat and the spectre were discovered and proved by **David Smith, Joseph
Samuel Myers, Craig S. Kaplan and Chaim Goodman-Strauss** —
[*An aperiodic monotile*](https://arxiv.org/abs/2303.10798) and
[*A chiral aperiodic monotile*](https://arxiv.org/abs/2305.17743), both in
*Combinatorial Theory* 4 (2024).

The substitution data and float geometry in `src/engine/internal/` are ported
from Craig Kaplan's [hatviz](https://github.com/isohedral/hatviz) under BSD
3-clause. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Licence

MIT — see [LICENSE](LICENSE). Third-party terms in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) must be retained in
redistributions.
