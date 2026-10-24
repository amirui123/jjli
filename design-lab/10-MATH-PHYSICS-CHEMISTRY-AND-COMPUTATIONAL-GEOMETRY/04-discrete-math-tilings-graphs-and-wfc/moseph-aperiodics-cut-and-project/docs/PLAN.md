# aperiodics — design plan

Draft, 2026-09-08. Successor to `CNCExplorations/ca`.

Goal: a workbench for exploring mathematical constructions and turning them into
things — plotter drawings, screen-printed shirts, CNC cuts in wood, layers on the
surfaces of 3D models.

---

## 1. What's in the old `ca` repo

~2100 lines across four loose packages, no packaging, no tests, mixed with 166
untracked SVGs in `output/`.

### Worth keeping (the ideas, re-implemented)

**`tiling/tiling.py` — `TileWorld`.** The best thing in there. Tiles don't own
their vertices; vertices are *shared*, deduplicated by position, and each knows
which tiles hang off it (`Point.attached`). That turns a tiling from a pile of
polygons into a graph you can reason about. Everything interesting downstream
depends on it.

**`tiling/penrose.py` — `PenroseLabeller` + `PenroseTransformer`.** The actual
magic of the "modified Penrose" work: classify each vertex by its *star* (how
many large vs small tiles meet there → types T1–T7), then displace each vertex
along a structurally-derived direction (toward the mean centre of its small
tiles) by a per-type weight. The deformation is driven by the combinatorics, not
painted on top. This generalises far beyond Penrose and is the core idea to carry
forward.

**`tiling/deformations.py` — scalar fields.** `circular`, `sweep`,
`circular_ripple` returning `position → weight` closures, fed as the "weight"
into a transformer. Right shape; wants to become a proper composable field
algebra.

**`PenroseP3.selective_inflate`.** Inflate only the tiles matching a predicate,
per generation. Gives multi-scale detail — dense in the middle, coarse at the
edges — and produced some of the best outputs (`circ_select_8`, `rand_select_9`).
A really good idea, generalises to any substitution system.

**`RobinsonTriangle.get_arc_d`.** Penrose matching-rule arcs as SVG arc paths.
Latent general idea: *decorations attached to tile types* — which is Truchet
tiling, and is where a lot of good plotter output lives.

**`SVGRender.render`'s `per_type` split.** Writes one SVG per tile type alongside
the combined file. That's colour separation for screen printing, discovered by
accident. Deserves to be a first-class layer system.

**`cnc/render.py`.** Clean retract/plunge/feed structure. The *shape* is right
even if `pygcode` goes.

**`experimentation/2022…quasicrystal_hypercube.ipynb`.** Growing an 8-D cubic
lattice outward and keeping cells whose N-cube intersects a 2-plane — a genuine
cut-and-project quasicrystal. Slow (memoised linear-programming feasibility test
per cell) but mathematically the real thing, and the direction the whole project
should go: quasiperiodic patterns of *arbitrary* symmetry, not just Penrose.

### Worth dropping

- `tiling/penrose_tiles.py` — the pre-refactor copy of `penrose.py`. Superseded.
- All `__pycache__` (Python 3.7/3.8/3.10 `.pyc` files, no sources for some).
- `output/` — 166 files, names like `circle_7_extreme_neg.svg`, no record of what
  made any of them. This is exactly the problem §4 exists to solve.
- `experimentation/CurvePlotting.ipynb` + `cnc/sympy_render.py` — sympy
  `Parametric3DLineSeries` as a curve sampler is slow and awkward. Same curves in
  20 lines of numpy.

### Bugs found while reading (don't port these)

| where | what |
|---|---|
| `tiling/deformations.py:sweep` | `print()` on every point — dominates runtime at 8 generations |
| `tiling/deformations.py` ×2 | `axis is 'x'` — identity comparison on strings; works by string interning, `SyntaxWarning` on modern Python |
| `tiling/square.py:Chessboard.generate` | uses bare `scale`, not `self._scale`; only works by accident because its own `__main__` happens to define a module-level `scale` |
| `ca/one_d_ca.py:start_ones` | returns zeros |
| `ca/one_d_ca.py:CA_Grid.__init__` | `rule or rule_31`, `init_func or random_start` — neither name exists; latent `NameError` |
| `svg/tile_render.py` | draws every face as a closed polygon, so every interior edge is stroked **twice**. Invisible on screen, doubles pen-down time and thickens every line on a plotter |
| `tiling/tiling.py:point_id` | string-formatted position key with a `"-0.000"→"0.000"` patch, and mismatched precision (`.4f` on real, `.3f` on imag). Fragile vertex identity |

---

## 2. Architecture

Five layers. Each is useful alone; each only knows about the one below.

```
  sketches/            parameterised, named, versioned explorations
      │
  extract/             structure → drawable geometry
      │
  structure/           vertices · edges · faces, shared identity, tags
      │                      ▲
      │                      └── fields/  scalar & vector fields, composable
  geometry/            exact primitives: Line Arc Circle Cubic Path
      │
  output/              SVG · DXF · GCode · mesh · vpype
```

### 2.1 `geometry` — exact primitives, flattened only at the last moment

The one firm decision: **primitives stay exact all the way down**. A circle is a
circle until something demands otherwise.

```python
Pt = complex          # keep this from the old code — rotation is just multiply

Line(a, b)
Arc(centre, r, a0, a1, ccw)
Circle(centre, r)
Cubic(p0, c0, c1, p1)
Path(segs, closed)     .flatten(tol) -> list[Pt]
```

Complex numbers as 2-D points was a good call in the old code and the whole
Penrose construction leans on it (`A1 * rot`). Keep it. Promote to numpy only at
the 3-D boundary.

This is what settles the vpype/vsketch question: those are polyline worlds.
`flatten(tol)` is the bridge *to* them, taken when we choose — so SVG and DXF get
true `<circle>`/`A`-arcs and CAD arcs, while the plotter pipeline gets polylines
with a tolerance we set.

### 2.2 `structure` — the `TileWorld` idea, generalised

```python
Vertex:  pos, tag, star (incident faces, angularly ordered)
Edge:    v0, v1, tag, faces
Face:    vertices, centre, tag
Complex: vertices · edges · faces, spatial-hash identity with real tolerance
```

Three changes from `TileWorld`:

1. **Edges are first-class.** The old model had none, which is why interior edges
   got drawn twice. With an edge set, `extract.edges()` is deduplicated by
   construction — every line drawn once, which is what a plotter wants.
2. **Vertex identity via spatial hash** with an explicit tolerance, replacing the
   formatted-string key.
3. **Vertex types are discovered, not enumerated.** `PenroseLabeller`
   hand-enumerated T1–T7. Instead: canonicalise the cyclic sequence of incident
   face tags and angles around each vertex, and let identical stars collapse to
   the same generated type name. Works on *any* tiling, and tells you what the
   vertex configurations are rather than requiring you to know them.

### 2.3 `fields` — composable, `deformations.py` grown up

```python
Field  = Pt -> float
VField = Pt -> Pt
```

Sources: `radial`, `sweep`, `ripple`, `noise`, `image`, `const`, `distance_to`.
Combinators: arithmetic, `remap`, `clamp`, `warp`, `mask`, `mix`. So
`radial(...) * ripple(...) + 0.2` composes, instead of writing a new closure each
time.

Direction for a displacement comes from a *named source*, generalising
`PenroseTransformer`'s "toward the mean of my small neighbours":

- `toward_faces(tag)` — the original Penrose move
- `vertex_normal`, `along_edge(k)`
- `gradient(field)` — displace up/down a scalar field
- `const(1j)` — the chessboard case

### 2.3a The jumble regime — validity is never assumed

Some of the best old outputs came from pushing deformation *past* the point where
faces stay faces — `PenroseTransformer(default_weight=-tile_size/.02)` with
`tile-opacity: 0.0, stroke-opacity: 0.1`. Polygons invert, self-intersect and
overlap, and the tiling dissolves into a jumble of line work. That regime is a
first-class target, not an edge case, and it constrains the whole core:

- **`Face` is an ordered vertex loop and nothing more.** No convexity,
  simplicity, orientation or non-self-intersection is assumed anywhere in
  `structure` or in `extract.edges()` / `extract.outlines()`.
- **Deformation is unclamped.** No sanity guards, no "keep it reasonable" limits.
  The interesting parameter values are the unreasonable ones.
- **Shapely is quarantined.** `inset`/`offset`/boolean ops need valid geometry, so
  they are explicitly opt-in and must **fail soft** — skip the face or return it
  unchanged, never abort a 100k-face run because face 8,432 turned inside out.
- **The edge path is primary here.** In the jumble regime there are no meaningful
  faces, only lines; `extract.edges()` must never touch shapely.
- **Displacement is measured in local edge lengths**, not absolute units, so the
  same `weight` means the same thing at 6 generations and at 9. The old code
  recomputed `scale / sqrt(n_tiles)` by hand at every call site — make it
  intrinsic.
- **Sweeps are how you find the transition.** `sweep weight=-0.1:-5:20` walks the
  continuum from tidy tiling to full jumble in one command, and the contact sheet
  shows where it breaks in an interesting way rather than a boring one.
- A `dense-linework` render preset — hairline strokes, low opacity, no fill —
  formalising what `extreme_negative` discovered.

### 2.4 `extract` — structure → geometry

Where structure becomes something drawable. The point of the whole design is that
each of these works on *every* generator.

- `outlines()` — face polygons, layered by tag
- `edges()` — deduplicated line work
- `inset(d)` / `offset(d)` — per face; the "thick stroke as fill" look from
  `living_room.py`, done properly
- `decorate(tag → motif)` — arcs/curves per tile type; Penrose matching arcs and
  Truchet are the same operation
- `dual()` — the dual complex
- `hatch(field)` — fill lines with density/angle driven by a field
- `isolines(field)` — contours. The bridge to CNC depth passes and to layers on a
  3-D surface

### 2.5 `output`

**SVG is the primary format** and the archival master. Written with `lxml` — real
XML rather than the old code's string concatenation, but not an opinionated SVG
library that would fight us over arcs and metadata. Layers per tag, true
`<circle>` elements and `A` arc commands, deduplicated edges.

- **vpype** — `--simplify` flag, off by default, since your plotting setup already
  runs vpype. Subprocess, not a hard dependency.
- **DXF** — deferred. It preserves arcs, but so does SVG, so it buys nothing
  geometrically; it's purely a question of what your CAM will ingest. Add it if
  and when SVG-into-CAM proves annoying.
- **GCode** — not built. `cnc/` and `pygcode` retire.
- **3-D** — deferred (§8).

#### Provenance in the SVG — tested, not assumed

Storing the command line in an SVG comment **doesn't work**: `--` is forbidden
inside XML comments, so `aperiodics project.multigrid --n 7` makes the file
unparseable. Verified — it's a hard XML rule, not a quirk.

So: a short human comment at the top carrying the run id, and the real payload in
`<metadata>` wrapped in `CDATA`, where `--` is legal. Verbatim command line plus
the resolved-parameter JSON, visible in `head -20`, parseable by machine.

**vpype destroys all of it.** Round-tripping a file through `vpype read … write …`
was tested, and it:

- drops our comment and *replaces* our `<metadata>` with its own RDF block —
  which records vpype's command line, not ours
- converts `<circle r="20">` into a **~700-point polygon**, and the arc likewise
- rescales mm to px at 96 dpi

Three consequences, all of which shape the design:

1. Provenance can't survive into the plotted file. The **sidecar JSON is the
   durable record**, and the run hash goes in the *filename*, which does survive.
2. This is exactly the "real circles, not polylines" problem, and it is
   specifically a vpype problem. Since your plotter path runs vpype anyway,
   exactness matters for the *other* outputs — screen print, CNC, laser, and
   the archival master — which is why `--simplify` is opt-in and we always keep
   the unflattened original.
3. Anything reading a plotted file back gets polylines. Never round-trip through
   vpype as a working step; it's strictly a terminal export.

## 3. Modules — what to actually explore

### Tier 1 — port and generalise (gets us back to parity, better)

> Build order is set in §8: `project` (Tier 2) comes **first**, with
> `substitution` immediately after. Tiers are dependency depth, not schedule.

**`substitution`** — inflation systems. Penrose P3 (direct port), P2 kites/darts,
Ammann–Beenker (8-fold), chair, pinwheel (∞ orientations), sphinx, and the
**Hat and Spectre monotiles** — the 2023 aperiodic monotiles, which didn't exist
when the old code was written and are the obvious headline addition. All get
`selective_inflate` for multi-scale detail.

**`deform`** — fields + structural displacement, per §2.3.

**`automata`** — port 1D Wolfram; add 2D (life-like, cyclic, Langton); then the
interesting one: **CA on an arbitrary complex**, using face adjacency as the
neighbourhood. A Wolfram-ish rule running on a Penrose tiling has no uniform
neighbour count, which makes it genuinely strange, and it's nearly free once
`structure` exists.

### Tier 2 — the weird maths the notebooks were reaching for

**`project`** — cut-and-project, done properly. Two routes to the same place:
de Bruijn's **multigrid** (intersect *n* families of parallel lines; each
intersection becomes a rhomb) which is fast and direct, and **hyperplane slicing**
of a *n*-D cubic lattice, which is what the 2022 notebook was doing the slow way.
Both give quasiperiodic tilings of *arbitrary* n-fold symmetry, with a continuous
**shift/phase vector** as a parameter — turn the offsets and the whole pattern
flows through a family of related tilings. That continuous parameter space is
exactly what "tweakable" should mean here, and Penrose falls out as the 5-fold
case.

**`curves`** — parametric families in numpy: Lissajous, harmonographs (damped, so
they spiral in), superformula, epitrochoids, and space-filling curves
(Hilbert/Moore on squares, Gosper on hexes). Single continuous paths — ideal
plotter output, and directly the 3-D toolpath case from `sympy_render`.

**`circles`** — Apollonian gaskets, Descartes circle theorem, circle packings,
inversive geometry. **The case that justifies exact primitives**: output is true
circles, no polygonisation, arbitrary zoom.

**`hyperbolic`** — {p,q} tilings in the Poincaré disk, plus Möbius transforms as
a general operator applicable to *any* 2-D output. Möbius maps preserve circles
and lines, so an exact-geometry pipeline survives it intact — arcs in, arcs out.
Weird maths, and cheap given `circles`.

### Tier 3 — texture and process

**`waves`** — sums of *n* plane waves at equal angular spacing. One line of maths;
quasiperiodic interference for any *n*; threshold or contour it into line work.
Deeply related to `project` (it's the same Fourier picture from the other side),
and produces moiré.

**`growth`** — differential line growth, DLA, reaction–diffusion. Organic
counterweight to the crystalline stuff; naturally produces isoline stacks, which
is the CNC-layers and 3-D-surface-layers case.

**`truchet`** — decorated and Wang tiles laid over *any* tiling from Tier 1,
including multi-scale subdivision. Reuses `extract.decorate`.

---

## 3a. Module documentation and galleries

Every module carries `docs/modules/<name>.md` with four parts:

1. **The maths** — what the construction is, in prose, hand-written.
2. **References** — papers (with DOIs), and other people's projects and artworks
   in the same territory. Held as a `REFERENCES` list *in the module source*, so
   the citation sits next to the code implementing it, and rendered into the
   markdown from there.
3. **Parameters** — a table, generated from the `param()` declarations (§5).
4. **Gallery** — example outputs with the parameters that made them, generated
   from runs in `examples/`.

`aperiodics docs <module>` regenerates parts 2–4 **in place**, between HTML-comment
markers, leaving hand-written prose untouched. So the maths you write by hand
survives, and the params and gallery never drift from the code.

The gallery is the payoff: `aperiodics keep <run>` promotes an output to
`examples/`, and it appears in the module's documentation with its full parameter
set on the next `docs` run. The exploration writes its own documentation.

## 4. Runs, versioning and filenames

Named as a pain point, and the old `output/` proves it. Design: **nothing is ever
produced without a record of what produced it.**

Every run writes a pair:

```
output/2026-09-08/penrose-deform-3f9a21c4.svg
output/2026-09-08/penrose-deform-3f9a21c4.json
```

`3f9a21c4` is a hash of the fully-resolved parameter set. Same params → same
filename → re-running is idempotent, and two different explorations can never
silently collide. Date folders keep the exploration chronologically browsable.

The sidecar JSON records: schema version, package version + git SHA (+ dirty
flag), module and sketch name, **every** parameter with defaults filled in, the
seed, the verbatim command line, output files with content hashes, timing, and
element counts. Same idea as `knotgen`'s `"command"` / `"cli_options"` fields,
pushed a bit further. The SVG carries the run id in its metadata, so a stray file
can always be traced back.

Commands:

| command | what it does |
|---|---|
| `aperiodics <sketch> [--param ...]` | generate; writes svg + sidecar |
| `aperiodics replay <json\|svg>` | reproduce a run exactly |
| `aperiodics vary <json> freq=0.2` | branch from a previous run, change some params |
| `aperiodics sweep <sketch> gen=6,7,8 w=0.1:0.5:5` | cartesian product, one file each + contact sheet |
| `aperiodics index` | build `output/index.html` — thumbnail grid, filterable by parameter |
| `aperiodics keep <run> --name "living room v2"` | promote to `designs/` |

`index` is the one that changes day-to-day life: a browsable contact sheet of
everything ever made, each thumbnail carrying its parameters, so "what was the
one with the ripple that worked" is a look rather than an archaeology.

Folder convention, following `knotgen`:

- `output/` — git-ignored scratch, everything lands here
- `designs/` — git-ignored keepers
- `examples/` — shipped, in-repo, documented

## 5. Tweakability — one declaration, four affordances

Each sketch declares its parameters once:

```python
@sketch("substitution.penrose.deform")
class PenroseDeform:
    gens:   int   = param(8,    range=(1, 10), doc="inflation generations")
    scale:  float = param(100.0)
    weight: float = param(-0.5, range=(-3, 3), doc="displacement, in tile-sizes")
    seed:   int   = param(0)
```

From that single declaration we get, for free: CLI flags with validation and
help; JSON preset round-tripping; sweep ranges; and a GUI binding. Write the
sketch once, tweak it however suits the moment.

**On vsketch** — decided: *adapter, not foundation, and deliberately thin*.

vsketch is polyline-only, so building on it would force flattening everywhere and
lose the exact circles. Instead `aperiodics.gui.vsk` is a shim that wraps any
declared sketch as a vsketch sketch, mapping `param(...)` → `vsk.Param` and
`flatten(tol)` → `vsk.polygon`. `vsk run` gives live sliders while exploring; the
CLI path stays exact for the final artefact.

The constraint that matters: **the shim only ever reads the param declarations and
consumes flattened geometry.** It gets no privileged hooks into the core. So when
the vsketch workflow stops fitting — likely for tilings, where you'll want
click-a-tile interaction rather than sliders — it can be replaced by our own
viewer without touching a line of sketch code. Deliberately a leaf, not a root.

---

## 6. Fabrication targets

| target | route |
|---|---|
| **pen plotter** | SVG, one layer per pen, deduplicated edges; your setup's own vpype pass does the optimisation, or `--simplify` here |
| **t-shirt** | per-tag layer SVGs = colour separations (the old `per_type` split, made deliberate); flat fills, no strokes |
| **CNC in wood** | `isolines()` → depth passes → SVG into your existing CAM; DXF only if that proves awkward |
| **3-D surfaces** | deferred; `isolines()` and exact geometry are the groundwork and get built regardless |

---

## 7. Build

Following `knotgen`: `uv`, `src/aperiodics/` layout, hatchling, `requires-python
>=3.11`, `[project.scripts] aperiodics = "aperiodics.cli:main"`, pytest.

**Libraries over hand-rolling**, wherever one genuinely earns its place:

| need | library | why not by hand |
|---|---|---|
| arrays, everything | `numpy` | — |
| vertex identity, dedup | `scipy.spatial.cKDTree` | replaces the old formatted-string position key; real tolerance, fast |
| inset/offset/boolean/validity | `shapely` | polygon offsetting is genuinely hard to get right; quarantined per §2.3a |
| isolines/contours | `contourpy` | matplotlib's contour engine, standalone. Don't write marching squares |
| SVG writing | `lxml` | proper XML, namespaces, CDATA, comments — without an SVG library's opinions about arcs |
| graph ops, duals, cycles | `networkx` | dual complexes and connectivity for free |
| noise fields | `opensimplex` | — |
| plotter optimisation | `vpype` | already installed via pipx; stays a subprocess |
| GUI | `vsketch` | optional `[gui]` extra; core never imports it |

Tests worth having: substitution tile counts against known growth rates (the
Penrose large:small ratio → φ), vertex-star classification against the published
Penrose vertex configurations, multigrid 5-fold agreeing with a direct Penrose
construction, geometry round-trips, run-hash determinism, and — given §2.3a —
that extreme deformations produce output rather than exceptions.

## 8. Decisions

Settled 2026-09-08.

| | decision | consequence |
|---|---|---|
| **primary format** | SVG, always | archival master, exact arcs, provenance in `<metadata>` |
| **DXF** | deferred | buys nothing geometrically over SVG; add if CAM demands it |
| **CNC** | via SVG into existing CAM | no GCode writer; `pygcode` and `cnc/` retire |
| **vpype** | opt-in `--simplify` | your plotter path already runs it; terminal export only, never a working step |
| **3-D** | deferred | 2-D only for now; `isolines()` + exact geometry keep the door open |
| **GUI** | thin, replaceable vsketch adapter | `[gui]` extra, reads params + flattened geometry only |
| **libraries** | prefer them (§7) | shapely, scipy, contourpy, lxml, networkx |
| **the jumble regime** | first-class (§2.3a) | validity never assumed; shapely quarantined and fail-soft |
| **module docs** | per-module md with refs + gallery (§3a) | partly generated, `aperiodics docs <module>` |
| **first module** | `project` — multigrid quasicrystals | Penrose arrives as the 5-fold case rather than as a port |
| **old `ca` repo** | never modified | reference only; the port is a re-implementation |

Building `project` first is the more interesting bet: rather than porting Penrose
and generalising later, we build the general construction and let Penrose fall out
of it. The de Bruijn multigrid also stresses the core in the right places — it
generates vertices by line-family intersection, so vertex identity, tolerance and
edge deduplication all have to be right from day one rather than being retrofitted.

## 9. Build order

Steps 1–7 are **built**; see §10 for what was decided along the way.

1. ✅ **`geometry`** — primitives, `flatten(tol)`, transforms, bounds.
2. ✅ **`structure`** — vertex welding, edges, faces, star canonicalisation.
3. ✅ **`multigrid`** — de Bruijn multigrid, *n*-fold, with the Penrose condition.
4. ✅ **`run`** — params, hashed filenames, sidecar JSON, `replay`/`vary`/`sweep`.
5. ✅ **`svg`** — layered output, exact arcs, provenance, `--simplify`.
6. ✅ **`fields` + `deform`** — composable field algebra, structural displacement.
7. ✅ **`docs`** — per-module markdown with references, params, gallery.
8. ✅ **`substitution`** — recursive inflation with selective detail; Penrose P3,
   cross-checked against `multigrid`.
9. ✅ **`gui.vsk`** — thin, replaceable vsketch adapter.
10. ✅ **`rules`** — Fields (shape) split from Rules (effect), in Python or JSON.

Then more substitution systems (Ammann–Beenker, sphinx, pinwheel, Hat/Spectre)
and onward through the tiers in §3.

---

## 10. Decisions taken during the build

Recorded here because several were judgement calls that the plan did not settle.

**Vertex welding uses a grid hash, not a KD-tree.** §7 named `scipy.spatial.cKDTree`
for vertex identity, but welding is *incremental* — a vertex is looked up as each
face arrives — and scipy's trees are static. A grid hash with the bucket size
equal to the weld tolerance makes a 3×3 neighbourhood scan exact and O(1) per
insert. scipy stays a dependency for bulk spatial work.

**Positions are not re-welded after deformation.** `set_positions` drops the
spatial index rather than rebuilding it. Deformation is expected to push
vertices through each other, and re-welding would silently merge distinct
vertices and destroy the structure. Build first, deform second.

**Declared ranges are advisory, never clamped.** A `range=` on a parameter is a
hint for sliders and sweeps. Enforcing it would put the jumble regime (§2.3a)
out of reach, since the interesting values are exactly the unreasonable ones.

**Non-conformal transforms on a `Circle` raise rather than approximate.** An
anisotropic scale turns a circle into an ellipse; returning a `Circle` would be
quietly wrong. Callers flatten first, deliberately.

**Displacement is computed from a snapshot.** Every vertex's move is worked out
against the original configuration and applied at once, so results don't depend
on vertex ordering. The old code got this by accident (stale cached centres);
here it is deliberate, and tested.

**SVG is y-up.** Content sits in a `scale(1,-1)` group with an offset viewBox, so
mathematical and drawing coordinates agree. Costs one group; saves every future
chirality bug.

**Coordinates are rounded to 4 dp of a mm.** 100 nm — far below any plotter or
router, and it keeps files roughly an order of magnitude smaller. The old
`example4.svg` was 695 KB largely from unrounded floats.

### Two findings that changed the code

**de Bruijn's Penrose condition does not survive the half-turn normal fan.**
His ``sum(gamma) in Z`` assumes normals over a full turn. With ``e_m = exp(i*pi*m/n)``
half of them point the other way, and the condition becomes an **alternating**
sum, ``sum_m (-1)^m gamma_m``. Uniform offsets never satisfy it. Measured: uniform
`0.2` gives 12 vertex stars (a *generalised* Penrose tiling), alternating gives 7,
stable from 6k tiles to 76k. Hence the `--alternate` flag.

**The tiling's symmetry centre is not the origin.** Each grid *cell* maps to a
tiling *vertex*, so the vertex answering to the grid origin sits at
``sum_m ceil(gamma_m) e_m``, whose magnitude grows like ``2n/pi`` — 3.2 edge
lengths at n=5, 7.7 at n=12. Clipping a disc around the origin cut an off-centre
bite out of the pattern.

Worth recording *how* that one was caught: it passed every numerical check —
Euler characteristic exactly 1, tile ratios converging to φ and √2, zero singular
points — and was only visible in the rendered image, where the n=12 rosette sat
plainly off to one side. Numerical invariants pin down the combinatorics; they
say nothing about whether you are looking at the right part of it. Render and
look.

### Two more findings, from building `substitution`

**An L Robinson tile cannot be fanned apex-first.** Its apex is 108°, and 360/108
is not an integer, so a "sun" seed has to place L's 36° *base* angle at the origin
and build from whole rhombs. Constructing it the other way produced degenerate
spikes that still passed the tile-count *and* Euler-characteristic checks — the
faces were present and correctly connected, just collapsed. An **angle-sum test**
(every interior vertex totalling exactly 2π) caught it, and is now the standard
check on any new substitution system, alongside a positive-area assertion.

That is the second time a bug survived every combinatorial invariant. Both times
the missing check was *metric* rather than topological. Worth treating as a rule:
Euler characteristic and tile counts verify the connectivity; angles and areas
verify the geometry; the picture verifies the framing. All three, every time.

**Penrose inflation takes a star vertex to a sun in one generation**, and sun is a
fixed point. So beyond generation 1 the two seeds share a central vertex, and what
they actually choose is the patch *outline* — measured with the isoperimetric
ratio, 4.97 for the near-disc against 5.86 for the five-pointed patch. The
parameter is documented for what it does rather than what its name suggests.

### Findings from the Field/Rule split and the second substitution system

**Frequency-based names were a latent trap.** Vertex types were being named `V1`,
`V2`, … by descending frequency, so changing a radius or a seed could silently
make `V1` mean a different configuration — and a saved ruleset would then quietly
do something else. Names are now derived from the star's own contents: `5x72` is
where five 72° rhombs meet, on any tiling at any radius.

**Guessed substitution rules look fine and are wrong.** First attempts at
Ammann–Beenker and pinwheel lost 35% and 110% of the tile area; a first chair
double-covered one cell while leaving another empty. All three produced
plausible-looking output. Unioning the children with shapely and requiring zero
overlap and zero gap against the parent catches every one instantly, and is now
the gate any new system must pass. Ammann–Beenker and pinwheel were **removed**
rather than shipped wrong — Ammann–Beenker is available from `multigrid --n 4`
anyway.

That makes three bugs now that passed every combinatorial invariant. The rule in
§10 holds: connectivity, then geometry, then the picture.

**Adapters translate, they don't forward.** vsketch's `unit` is a physical length
it converts through vpype; ours is documentation ("edge lengths", "degrees").
Passing ours through makes vsketch raise. Small, but it is the shape of every
adapter problem: the same word, different contract.

### The GUI question, settled

vsketch turned out to be the wrong foundation, for a concrete reason rather than
a matter of taste: **it cannot fill a polygon**. It is a plotter tool, and a
plotter has no fills. That rules it out for colour separations, which is one of
the four stated fabrication targets.

`aperiodics serve` is a local web GUI instead — stdlib `http.server`, one
self-contained HTML file, no npm and no framework. Three properties earn it:

* **The browser is the SVG renderer.** Fills, strokes, opacity, zoom, at the
  exact fidelity of the output format. No Python toolkit is close; Qt's SVG
  widget is a viewer rather than a canvas, and Tk has none.
* **The UI writes itself** from `/api/schema` — the same `param()` declarations
  that generate the CLI flags. A new parameter, field or ruleset shows up in the
  GUI with no GUI work.
* **No new save format.** A setup document is `{sketch, params}`, which is
  exactly what a run record already holds, so the GUI's state, the save file and
  `aperiodics replay` are one object. This was the piece worth noticing: the
  format being asked for already existed.

Rejected: **serverless**, because the maths is numpy/scipy/shapely and Pyodide
would mean tens of megabytes with fragile shapely support, while cutting the GUI
off from the provenance pipeline. **Streaming**, for now — renders take tens of
milliseconds, so request/response is already interactive, and SSE would be a
change of transport rather than of architecture.

The vsketch adapter stays, since it plugs into an existing plotter workflow, but
it is documented as the weaker option.

### Parameters whose vocabulary depends on other parameters

`substitution` hosts several systems, and a system's seeds mean nothing to a
different one — `star` is a Penrose configuration, `wheel` means something else
again to the chair. A single flat `choices` list offered all of them everywhere,
so half the combinations failed.

`param(choices_by=...)` plus a `CHOICE_SETS` table on the sketch fixes it
generally rather than for this one case. The declared `choices` stay the union,
so argparse accepts them all and nothing about the CLI surface changes; the real
check runs in `resolve`, which knows the other parameter's value and can say
*that one offers ['one', 'wheel']*. The schema serves the sets, so the GUI filters
its select and re-picks when the value goes stale.

Worth generalising because it will recur: any generator hosting a family of
constructions has this shape.

### The key as an editor

The vertex key started as a legend and became the place rules get written. Three
things made that work:

* **Arrows come from a representative vertex, not an average.** In a symmetric
  tiling every configuration occurs at every orientation, so the mean
  displacement cancels to nothing and would draw no arrow at all. The magnitude
  *is* averaged, since that means something.
* **Stars are captured before deformation.** A key drawn from deformed positions
  shows the answer rather than the question.
* **`~other` in `--per-type`** ties one configuration's weight to another's. With
  a dozen types, saying which behave alike is most of the work, and repeated
  numbers are how that drifts. Alias chains are followed, and cycles fall back to
  the default rather than hanging.

A configuration that cannot move is reported rather than given a control that
silently does nothing — but *cannot move* turned out to need care, and the first
version was wrong twice over:

* **Immovability is a property of the rule, not the vertex.** Only `toward` and
  `away` can be blocked, because they aim at a neighbouring tile of a given kind;
  a vertex with none of that kind cannot move under them however it is weighted.
  Every geometric direction moves it fine. Calling such a vertex "immovable" is
  wrong for eight of the nine built-in rulesets.
* **A still representative is not a still configuration.** The note keyed on the
  one vertex the key draws. Under `normal`, the representative five-fat-rhomb
  vertex happens to have zero net edge normal while others of the same
  configuration travel a full edge length — so it reported the whole
  configuration as immovable, which is false.

The key now carries the representative's displacement, the mean and the maximum
over the configuration, and distinguishes three cases: nothing of this kind
moves, the field is zero here, or this one sits at a still point while its kind
does move.

### Two corrections worth recording

**Colour slots belong to the construction, not the render.** They were being
derived from whatever layers the last render produced, so toggling `render`
between edges and faces reshuffled the swatches. A tiling has its prototiles and
its configurations whether or not they are currently drawn.

**A browser normalises `..` out of a URL before sending it.** Doc images were
rewritten from `../../examples/x.png` to `/docs/../../examples/x.png`, which
arrives at the server as `/examples/x.png` — so nothing resolved. The `../` has
to be resolved server-side, not routed around.

### Four things the GUI got wrong, and one that mattered more

**`will-change: transform` made vector zoom blurry.** The claim that the pane was
"already resolution-free" was true of the content and false in practice: that one
CSS property promotes the element to a GPU layer, which rasterises it once at its
natural size and scales the *texture*. Zoom now moves the SVG's own viewBox, which
re-renders vectors at every scale and cannot be defeated by a compositing hint.

**The form rebuilt itself under the pointer.** A finished render whose colour-slot
list had changed triggered a full `buildForm()` — and a radius slider changes the
vertex-configuration set on nearly every step, so the control being dragged was
destroyed and recreated mid-drag. Only the colour block is replaced now, and
`buildForm` is re-entrancy-guarded.

**Slider steps were `span/200`.** A 2–200 range gave a step of 0.99, so asking for
12 landed on 11.9. Round steps now.

**Three residual conflations between rules and fields**, all of the same kind —
something filed under one heading that belongs to neither, or to the other:
`strength` and `shake` sat in the rules block though they are properties of the
whole deformation; `field_preview` sat in the field block though it is a display
option (now `show_field`, under output); and the `bearing` slot was hard-wired to
an angular sweep inside the deformation glue, which put a *field* decision where
no user could see it. A ruleset now declares which slots it reads, and the UI
offers a field per slot.

### Renaming a parameter must not orphan saved runs

Renaming `field_preview` to `show_field` broke every archived run — the provenance
system failing at exactly the thing it exists for. `param(was=...)` records former
names and translates them on load.

That covers renames. It does not cover the earlier Field/Rule split, where
parameters stopped existing in any form: `direction=toward, toward=A, weight=1.2,
falloff=radial` has no single new key, it is four settings becoming three of a
different shape. Rather than encode a one-off historical migration forever, those
records were re-made — they were examples committed two days earlier, not anyone's
saved work — and `replay` now explains such a record instead of listing key
errors: what version wrote it, which parameters no longer exist, and that the SVG
and its settings are still readable.

`test_every_archived_example_still_replays` is the standing check. A model change
that leaves the examples unreplayable now fails a test rather than surfacing
months later.

### Field slots were an over-generalisation

A rule used to name a *slot* so a ruleset could ask for two shapes — `spin`
wanted a magnitude and a bearing. But a single field already carries more than
one signal: its **value**, and its **gradient**'s direction and magnitude. A rule
now says which aspect it reads (`value` or `slope`) and which direction it takes
(`gradient` uphill, `contour` along the isolines), and the whole dict-of-fields
plumbing goes. `spin` became `flow` and `climb`, which are better things anyway.

Worth noting as a pattern: the slot mechanism was invented to serve one built-in
ruleset. Generality added for a single case is usually a sign the case was
modelled wrong.

### The key became the rule designer

Each configuration now gets its **own small drawing** with the vertex actually
displaced and a ghosted outline where it was — the local effect rather than a
symbol for it. Only the shared vertex moves: its neighbours belong to other
stars, and pretending they hold still is the honest depiction of one rule's
effect. Beside each is a tick for whether the rule applies and a *same as*.

One bug worth recording: the designer was being handed the ruleset *after*
`--per-type` had been merged into it. Writing that back would have baked the
selection into the rules, leaving two copies that drift apart. `raw_ruleset()`
returns it as written.

### A caution about range edits

Rewriting the pan/zoom code with a `text[text.index(a):text.index(b)]` slice
silently deleted the key-panel functions, which happened to sit between the two
anchors. It went unnoticed because the tests that followed exercised zoom, the
form and the field picker — not the panel. Anchored slices over a file this size
need a check that only the intended thing moved.

### Eight directions were four bases and an angle

`transverse` was `radial` turned 90 degrees; `contour` was `gradient` turned 90.
And `toward`, `away` and `normal` were three guesses at *some direction belonging
to this vertex* — each committing to a different guess, none of them saying
which neighbouring tile was meant when there was more than one.

A direction is now a **base** and an **angle**: `local`, `radial`, `absolute`,
`gradient`. That is fewer concepts and strictly more expressive — 45 degrees off
the gradient, or a different bearing per configuration, neither of which the
eight could express.

**The `local` base needs a frame**, or a per-configuration angle means something
different at every instance, since instances sit at every orientation. The
canonicalisation that names a configuration already picks a winning rotation;
that rotation names a tile, and that tile is the frame. Measured: instances occur
at many orientations, and the frame lands on the same prototile at every one.
Mirrored instances turn the other way, so a mirror image behaves as a mirror
image rather than as an unrelated configuration.

It also removed a failure mode. `toward` could be *blocked* — a vertex with no
tile of the sought kind had nothing to aim at — so "does this rule apply here"
depended on the tiling rather than on the user. A frame exists at every interior
vertex.

### Snap points

Aiming a local rule should not be a number. Each configuration's picture carries
its tile centres and corners as clickable points, each with the angle it
corresponds to in that configuration's frame already worked out. Clicking sets
the angle; clicking again clears it.

### I did the same range-edit damage twice

Last round an anchored `text[index(a):index(b)]` slice silently deleted the
key-panel functions. This round the same manoeuvre deleted `syncJSON`,
`schedule` and `doRender` — and again the tests that followed did not touch
them, so the first sign was a console error in the browser.

The check that would have caught both, and now does, is trivial: parse the
script, collect what is defined and what is called, and diff. Worth running after
any structural edit to the app, because the Python test suite cannot see inside
the page.

### Counts were the wrong name

Configurations were named by their multiset of tiles — `3xA+3xB`. That is lossy,
and Penrose was the misleading case: at n=5 no two stars collide, so it looked
fine. At n=7 four names each cover two genuinely different stars (`A.B.C.C` and
`A.C.B.C`), papered over with an arbitrary `#a`/`#b` suffix.

The name is now the canonical cyclic sequence — `ABBB`, concatenated where
prototile ids are single characters and dot-separated otherwise. Shorter than the
counts form in most cases, never ambiguous, and it fixes the *starting point*
that `star_frame` measures from, so the name and the frame agree by construction
rather than by coincidence.

### A guard for the thing the Python suite cannot see

Three times now an anchored text-slice edit of `app.html` has left the page
broken while every Python test passed: twice by deleting a function, once by
duplicating a function header so the script would not parse. Two tests now cover
it — `node --check` on the extracted script, and a defined-versus-called diff for
the deletions that parse fine but blow up at runtime. The second needs comments
and string literals stripped first, or prose like "sign(v)" in a docstring reads
as a call.

### Composite fields

A `FieldStack` is an ordered list of layers, each a preset with its own
parameters and a mode — `add`, `multiply`, `max`, `min`, `replace`. It mirrors
`Ruleset` deliberately: same JSON-or-Python shape, same `load` accepting a name,
a path or inline JSON, same rule that the editor writes an ordinary parameter.
Fields and rules are the two halves of a deformation and there was no reason to
edit them through different machinery.

**Renormalising the result is what keeps `--strength` meaningful.** Four layers
must not be four times as strong as one. Measured on a grid rather than derived,
because `multiply` and `max` have no tidy closed-form range.

Multi-octave noise caught the same problem one level down: summing octaves
without dividing by their total amplitude reached +2.47 on a scale where
everything else stops at 1. There is now a test over every field at every octave
count, which is the sort of invariant worth spending a parametrised test on.

**Previews are PNGs, written by hand.** A field is a continuous surface; drawing
one as thousands of SVG rectangles is slower and less honest. The alternative was
a new dependency for what is a hundred lines of a well-specified format — and
there is a test that the bytes actually decode, since "returned something" and
"returned a PNG" are different claims.

Two colour schemes, because they answer different questions. `grey` stretches
whatever range is present, which shows faint structure and makes a field running
to 4 look exactly like one running to 0.4. `signed` uses the true scale — 0
black, +1 red, −1 blue — and tinges the tails green where the field passes 1.
With per-layer normalisation switchable, seeing *that* is the point.

**Controls are per layer type.** A preset declares which parameters it responds
to, beside the preset. A control that does nothing is worse than a missing one:
it invites you to reason about an effect that is not there. The case that made
this worth writing down: a plane wave offset along its direction of travel is
*exactly* a phase shift, and offset across it is nothing at all, so `offset` and
`phase` on a `wave` were the same control twice.

### `jitter` was not noise

The multigrid's `jitter` looked like grit in the construction, and the instinct
that construction should always be clean is right. But measuring it: with jitter
at 0.3 every edge is still exactly 1.0 and the Euler characteristic is still 1.
It does not perturb a tiling — it *selects* one, a generic member of the family
rather than the one symmetric about the origin, which at n=7 is the difference
between 22 vertex configurations and 48.

So the construction was already always clean, and removing the parameter would
have removed the only route to a generic quasicrystal. Renamed to `asymmetry`,
which says what it does, with the old name still accepted.

Worth noting as a pattern: when a name makes something look like a mistake, check
whether the name is the mistake.

### The field backdrop is a view, not a drawing

The grid preview drew the field as thousands of little rectangles: slower,
larger on disk, and worse to look at than the renderer the field editor already
had. It is now one embedded `<image>`, which also made the file smaller —
130 KB against 361 KB for the contour version of the same drawing.

In the pane it is a **view** rather than part of the drawing: the image is
inserted into the live SVG, so it pans and zooms with everything for free, and
off/grey/colour is a DOM change rather than a re-render. Asking the server to
redraw a drawing that has not changed, to answer a question about how to look at
it, would be the wrong shape.

### Renamed to `aperiodics`

The tilings at the centre of this are aperiodic — Penrose, Ammann–Beenker, the
multigrid quasicrystals, the chair. `periodics` said close to the opposite.

Two occurrences survived a word-boundary rename and were caught by tests rather
than by reading: `"```bash\nperiodics ..."`, where the character before the word
is the `n` of an escaped newline, so the boundary rule correctly refused. The
right response was to fix those two by hand, not to loosen the rule — a looser
one would have turned every "aperiodic" in the prose into "aaperiodic".

## 11. `project` — cut and project

The general construction the multigrid is a special case of. Take the integer
lattice in n dimensions, choose a 2-plane, keep the points whose perpendicular
part lands in a bounded **window**, project what survives.

The multigrid fixes two of those choices. Unbolting them is the whole point:

* **the plane's orientation.** Measured on the 1-D analogue before building
  anything: a rational cut slope gives a periodic chain with period *p+q* (1/2 →
  3, 3/5 → 8, 3/4 → 7), an irrational one never repeats. So the slope is a
  continuous dial from wallpaper to quasicrystal, and it is the *slope* that
  makes a tiling aperiodic — not the number of dimensions.
* **the window.** Which turned out **not** to be a free parameter after all;
  see below.

### Three things measurement changed

**Even dimensions need a half-turn fan.** A full-turn fan of star vectors sends
axes *k* and *k + n/2* to antiparallel directions, so the rhombus they span has
no area and its face lands on top of the tiling. At n=4 that gave 2.3 faces per
lattice point and χ=5181. The multigrid avoids it the same way, for the same
reason — the second time this exact trap has appeared.

**The window's size is not a dial.** It looks like one, and the parameter range
invited turning it. Measured: χ = −89 at 0.95, **1 at 1.0**, 571 at 1.1, 2631 at
1.3. Only the canonical size tiles; everything else is holes or overlaps. Below
about 0.9 the accepted set stops being *connected*, and since points are grown
outward from a seed, the growth ends where it started — which is now detected and
reported rather than returned as a one-point tiling.

**Growth, not enumeration.** The obvious approach — filter a box of lattice
points — is exponential in the dimension and almost all rejections. Growing
outward from an accepted seed visits the answer plus its boundary: at seven
dimensions it tests 33k points where the equivalent box holds 10^10.

### Walkthroughs

Modules can declare a `WALKTHROUGH`: ordered steps of prose plus the parameters
that illustrate them. `aperiodics walkthrough <module>` runs each step, saves its
picture and writes the markdown between the usual comment markers.

Generated rather than written because a tutorial whose examples no longer run is
worse than none, and one whose images were made by hand from an older version is
worse still — it looks right and is quietly wrong. The prose is the part a person
writes; the picture, the command and the numbers under it all come from the run.

Writing the projection walkthrough immediately caught a claim of mine that was
false: I had written that shrinking the window "thins the tiling out", and it
does not — it produces rubble. The step now says what actually happens, with the
measured table.

### Does `project` subsume `multigrid`?

Mathematically yes: for the canonical window the two constructions are the same
thing, and with `--window-axes` the projection now exposes the same (n−2)
dimensions of window position that the multigrid's offsets do.

In practice, no — and the reason is worth keeping. **Penrose P3 proper is a
measure-zero window position.** A generic shift lands on a *generalised* Penrose
tiling with 12 to 14 vertex configurations rather than 7. Scanning the internal
axes found it at `--window-shift 0.55 --window-axes "0,0,1"`, which agrees with
the multigrid exactly at radius 26 and drifts by one configuration at radius 40 —
so the scan located it only to the precision a patch that size can resolve.

The multigrid's `--alternate` *names* that condition rather than approximating
it, having been derived rather than searched for. That is a good reason to keep
both: one module is the general space, the other is a handle on the special
points inside it.

### The orientation is a space, not a number

`orientation="star"` and `tilt=0` turned out to produce the identical basis, so
the mode was redundant and is gone. More importantly, one tilt number was
reaching one direction out of many: the orientations of a 2-plane in n dimensions
form the Grassmannian Gr(2, n), of dimension **2(n−2)** — six at five dimensions,
twelve at eight.

`--tilt` is now arc length along a geodesic and `--tilt-axes` is the direction,
using the exact Grassmannian geodesic rather than an ad-hoc rotation of one basis
vector. That matters for the parameter to mean anything: measured, the same
`--tilt` in four different directions gives principal angles that differ
completely but always the same total distance. Two tilings equally far from
symmetric, looking nothing alike.

`--window-axes` follows the same convention, so there is one thing to learn
rather than two.

## 12. Colour, groups, and the tiling check

Three things that were each a small hole, and one interface bug that had been
misread twice.

### Colour was three things pretending to be none

There was a list of six tile colours living in `multigrid` — which every other
module imported, for no reason beyond that being where it was first written — a
second list for vertex marks in `annotate`, and a `--palette` string of
`name=colour` overrides. Nothing named a *scheme*, so "the same tiling in a
darker key" meant retyping every swatch.

`aperiodics/palette.py` now holds the whole vocabulary. A palette is a
background, an ink and a run of tile colours; it is either **listed** or
**generated**; and either kind is asked for *n* colours and always answers with
*n*. That last property is what makes it usable: at seven dimensions a
projection has three prototiles and at eight it has four, and a tilt pulls
congruent rhombs apart until there are fifteen. A list of five colours has to
answer all of those, so a listed palette interpolates between its entries and a
generated one just takes more steps.

Two decisions worth writing down:

**`--palette` still carries both halves.** Bare words name a scheme,
`name=colour` pairs override one layer, and both can appear at once. One
parameter rather than two, and — the reason it was done this way — every setup
written before schemes existed is still a valid override list, so nothing
orphaned. Changing the scheme in the GUI *clears* the overrides, because keeping
them means picking `night` and getting most of the old colours back, which is
precisely the clash between the two ways of setting a colour.

**A background is off by default.** A background is a rectangle, and a plotter
handed a rectangle draws one right round the edge of the piece. So `paper` — the
default — has no page colour at all and the SVG stays transparent, exactly as
before palettes existed. Only palettes that need a ground to read against carry
one, and `--background` overrides either way.

The mark colours took a correction. The first version generated them from the
palette's own rule offset by one step, which for `golden` and `complement` is no
offset at all — the hue depends only on the index, so the marks came out as the
tile colours shifted along by one. A test caught it. Marks are now always
darkened by a fixed factor, because a mark is a dot drawn *on top of* a tile and
hue alone cannot separate the two: at `paper` the tile colours and the mark
colours are the same six in a different order.

### Groups: layers were right, but only at one scale

Layers are the unit a plotter or a screen print wants — one per pen, one per
colour. An editor wants the coarser division: hide every fill, keep the line
work. Both, then: `tiles`, `lines`, `notes`, `field` as enclosing groups, with
the layers still inside them, so a tile type is separable and the whole tile set
is one click.

Grouped by **runs** of layers rather than by gathering every layer with a given
name. SVG paints in document order, so collecting scattered layers into one
group would silently restack the drawing — and the entire point of the groups is
that they change nothing about what you see. In practice the layers arrive
already sorted, so a run per group is exactly one group per name; the rule
matters only as a guarantee that it can never be otherwise.

### Three cheap tests that decide whether it is a tiling

Nearly every real mistake in this project was structural and did not look like
one: a chair substitution that double-covered a cell, a Penrose seed fanned
apex-first into degenerate spikes, an even-dimensional projection whose rhombs
had no area. Each passed the obvious checks.

`structure/check.py` runs three tests on every render:

- **Euler characteristic** `V − E + F`, which is 1 for a disc;
- **angle sum** at interior vertices, which must be 360°;
- **edge multiplicity**, which must be 2 in the interior.

They are complementary, not redundant, and the window-size sweep shows why: at
`--window-scale 0.95` the accepted set has holes, χ drops to −49, and *every
angle sum is still exact* — because the rim of a hole is boundary, and boundary
vertices are excluded. Only χ sees it. At 1.1 all three fire at once.

Cost is 1.3 ms on a normal tiling and 4 ms on 5,600 faces, which is what makes
it affordable on every render rather than only in the tests. The expensive
version — unioning the polygons with shapely and comparing areas — stays in the
test suite, where a second is free.

The reading is deliberately descriptive rather than a pass mark. Pushing a
tiling past the point where it is one is half of what this project is for
(§2.3a), so the status line says *what* stopped holding — `969 folded vertices,
worst 324°` — rather than that something went wrong. That number turns out to be
a good handle on the jumble regime: it counts how much of the drawing has
actually folded over.

### The slider that "jumped" was the panel moving under it

Reported as the `window_scale` slider's range changing as you drag it. It was
neither the range nor the slider.

Raising `window_scale` above 1 makes faces overlap, which invents vertex
configurations: 14 of them at 1.0, 28 at 1.1, 44 at 1.15, 87 at 1.2. Each got a
colour swatch, so the colour block grew by hundreds of pixels. When the sidebar
is scrolled near the bottom, a block that then *shrinks* drags everything above
it upward — including the slider under your finger, which now reads a different
value than the one your pointer is over.

Measured before: `scrollTop` 4042 → 3174 → 2894 → 2698 across four steps of the
slider, the row moving 1,970 px. After: unchanged at every step.

Three fixes, each addressing a different part of it:

1. **Nothing is replaced while a pointer is down.** A capture-phase listener
   holds the rebuild until pointer-up. This is the third variant of the same
   bug — the first was rebuilding the whole form mid-drag, the second was the
   colour block changing under a colour picker.
2. **The scroll position is pinned across the swap**, so even an idle rebuild
   does not shift the panel.
3. **The vertex list is capped at 16.** Past the point where it tiles, those
   configurations are accidents of the overlap rather than colours anyone will
   set. A count of what was left out replaces them.

The general lesson, which is now three for three: *a panel that rebuilds itself
from a render is a panel that moves while you are using it.* Every rebuild needs
a reason to believe the user is not mid-gesture.

### Two smaller ones

**The walkthrough images were invisible in the GUI.** The side-by-side
comparisons are `<img width="46%">`, because Markdown has no syntax for two
pictures at a percentage width, and the converter escapes HTML by design. So the
tags arrived on screen spelled out. `<img>` is now the one tag that survives —
not passed through, but parsed, filtered down to five recognised attributes and
written out again, so what reaches the page is a tag the converter built. The
`&middot;` entities the fact lines used had the same problem and became the
character.

**`seed` was filed under output.** It decides which random construction you are
looking at and everything downstream inherits it, so it belongs to construction
— at the end of it, since it is the control you reach for once the rest is
settled.

## 13. `rauzy` — the window a substitution implies

`project` picks a window and asks what tiling falls out. This asks the opposite
question: given a substitution, what window would a cut-and-project construction
need in order to produce the same point set? The answer is almost never a
polygon, and that it is a fractal is the reason substitution tilings and
cut-and-project tilings looked like separate subjects for thirty years.

### Drawn as a tiling, not a point cloud

The obvious implementation is to iterate the substitution, walk the letters as
steps in the cubic lattice, project the staircase onto the contracting plane and
plot the points. That gives a picture and nothing else: no polygons, no
structure, nothing the rest of this project can act on.

The **dual substitution** `E1*` (Arnoux and Ito, 2001) acts on the unit *faces*
of the lattice rather than on its points. Iterate it and you get an exact patch
of unit squares, which projects to exact rhombi — real geometry, welded into a
`Complex` like every other module, so the deformations, the palettes, the vertex
classification and the structural checks all apply to it unchanged. And because
a unimodular matrix has an integral inverse, every position stays an exact
integer across thirty generations: two faces are the same face or they are not,
with no tolerance anywhere.

### Three things measurement settled

**The transpose.** The `E1*` formula has one, and the wrong way round produces
something that iterates happily, looks like a fractal, and is not a tiling. At
nine generations: as written, chi = 1 with no angle defects and no stacked
edges; transposed, chi = 29 with 24 edges under three or more faces. There is no
way to see that in the picture.

**Which decomposition is the famous one.** Labelling each rhombus by its
*orientation* — which pair of axes it spans — is what the construction natively
produces, and it gives three classes that interleave everywhere. That is not the
classical image. The classical image labels by **ancestry**: which of the three
faces at the origin a rhombus descends from. Those form three interlocking
regions, and their areas are the letter frequencies of the infinite word —
exactly, to five decimals, on all eight catalogue entries. Both are now
available, because both are true things about the same object and they look
nothing alike.

The orientation areas follow `l_i * r_i`, the left Perron component times the
right: the left eigenvector counts the faces, because the dual substitution
transposes the incidence matrix, and the right one gives each face its area.
That was worked out to explain a number that did not match, and it holds.

**A degenerate case that drew a straight line.** The contracting plane is built
from the real and imaginary parts of a left eigenvector. When the two
contracting eigenvalues are a conjugate pair that is right. When they are *real*
the imaginary part is zero and the "plane" collapses — one substitution rendered
as a 3 mm by 224 mm streak. Now handled: two real eigenvalues give two rows.
Such windows are self-*affine* rather than self-similar, they need absurd
resolution to look like anything, and they are reported rather than shipped in
the catalogue.

### The Euler characteristic answered a question it was not written for

`structure/check.py` exists to say whether a construction still tiles. Applied
here it says something else:

| substitution | chi as the detail climbs |
|---|---|
| tribonacci | 1, 1, 1, 1 — a topological disc at every resolution |
| plastic | 1, 2, 5, 7, 7, −8, −48, −243 |

The window of the smallest Pisot number is not simply connected, and there are
more holes at every scale. That is a known and fairly deep result, and here it
falls out of a millisecond of arithmetic written for a different purpose. Three
of the eight catalogue entries have holes and five do not.

### `detail`, not `generations`

The inflation factor runs from 1.3247 to 2.5468 across the catalogue, and the
face count grows like `beta^n` — so a fixed generation count gives 86 rhombi for
one substitution and 175,000 for another. `--detail` says roughly how many
rhombi to resolve the boundary with, generations are derived from it, and the
derived number is recorded. Same picture from every entry at the same setting.

## 14. Other lattices, and where the tiles come from

`project` had three free choices — the plane, the window's shape, the window's
position. The lattice was the fourth, and adding it turned out to answer a
different question than expected.

### The root lattices come from their diagrams

A simply-laced root lattice's natural plane is its **Coxeter plane**, on which
the whole root system falls into rings of `h`-fold symmetry: `n+1` for A_n,
`2n-2` for D_n, thirty for E8. A4 gives fivefold from *four* dimensions where
the integer lattice needs five.

Nothing in the code knows what a Coxeter number is. The path is: Dynkin diagram
(three families, each a chain with at most one node moved) → Cartan matrix →
Cholesky factor, which is legal because a simply-laced root has length-squared
two so the Cartan matrix *is* the Gram matrix → the simple roots → the product
of their reflections → the eigenvector for the smallest positive argument. The
Coxeter number falls out of the eigenvalue, and a test checks it against all
nine known values. Writing the diagrams as edge lists rather than three tables
of coordinates is what made E6, E7 and E8 free once A and D existed.

### The classical rhombs are specific to the cubic lattice

This is the finding, and it cost an afternoon. In *generator* coordinates every
lattice is `Z^n`, so projecting the 2-faces of the unit cell looks as though it
should carry over unchanged. It does not.

Measured on A4: 56 interior vertices short of a full turn by exactly 72 degrees
and 42 over by exactly 72, the total areas balancing while the tiles do not fit.
A random invertible generator matrix does the same, so it is not about root
lattices — it is about any non-identity basis. The acceptance rule is fine: the
four-corners condition is provably equivalent to "in the zonotope of the other
n−2 generators" for any generators, checked over 31,250 cases. What fails is the
tiling, because the rule needs the internal space to be the *orthogonal*
complement in the coordinates where the cells are cubes, and on a root lattice
orthogonality lives in the Cartan metric instead.

So `--tiles` now offers rules that are about the **point set** rather than about
the lattice, and those survive the change:

| rule | works for | what it is |
|---|---|---|
| `faces` | cubic only | the classical rhombs |
| `delaunay` | every lattice | triangulate the projected points |
| `voronoi` | every lattice | the region nearer each point than any other |

This also answers the Voronoi/Delaunay question directly rather than as a
separate module: they are alternative decorations of the same point set, and for
the cubic lattice they give two more tilings of the familiar Penrose vertices.
The Voronoi of a Penrose vertex set is worth the module on its own.

Two trims were needed, both boundary effects rather than mathematics. A Delaunay
of a bounded set joins rim points that are only neighbours because the patch
stopped; anything whose longest side exceeds twice the median is dropped. A
Voronoi cell on the rim reaches outward as far as the next point allows, which
drew a ring of long spikes round every picture; a cell is kept only when it lies
entirely inside the point set that made it.

### Some Coxeter planes are not totally irrational

A Coxeter plane is symmetric enough that its complement can pick up a *lattice*
direction, and then distinct lattice points land on the same physical point. D5,
D6 and E6 all do it; A5 loses 508 of 577 points to it. Left in, the duplicates
gave Voronoi two cells for one site and a "tiling" that overlapped itself by a
quarter of its area — sum of cell areas 10,398 against a union of 8,176.

Clean at the ranks worth using: **A4, A6, E7, E8**. The rest are reported, with
a count, and the duplicates removed before the tiles are built. A `--tilt` off
the symmetric plane clears it. This is the third appearance of the same theme —
the multigrid's antiparallel axes at even `n`, the projection's full-turn fan,
and now this: *a plane symmetric enough to be worth looking at is a plane likely
to contain something rational.*

### A generator's image is now one edge long

`--edge 6` drew 3 mm edges at eight dimensions, because a generator's image is
shorter than the generator by `sqrt(2/n)` — and by a different factor again on
each root lattice, which would have made `--radius` mean four different things.
The plane is now scaled so the median generator image is one edge. Every patch
got smaller at the same `--radius`, which is the honest reading of "extent in
edge lengths".

### `Context.say` now keeps what it said

It printed only under `-v`, so a warning about a degenerate run reached nobody
unless someone happened to be watching a terminal. Notices are recorded and land
in the sidecar, which is where you want to find "this run hit a degenerate case"
six months later.

## 15. Motifs, and the window as a field

### Decorated prototiles

Penrose's 1974 tiles carried arcs, and the matching rule was that the arcs had
to join across an edge. `output/motif.py` generalises that: a mark drawn inside
every face, in that face's own frame. It lives in `output` rather than in a
module because it is a decoration of *any* tiling, so all four modules get it
for nothing and so does anything added later — and because it inherits every
deformation the tiling has had, being built from the deformed faces.

It is also the best output this project makes for a pen plotter. A tiling is
tens of thousands of short shared segments; a motif is a few long continuous
curves, which is what a pen wants and what looks alive on paper. `--render none`
takes the tiles away and leaves them.

Two pieces of geometry worth recording:

**Why two corners and not four.** An arc runs between points partway along the
two edges that share a corner. Put one at every corner of a quadrilateral and
each edge gets two arc-ends per tile, so every joint is a four-way crossing
rather than a continuation. Two *opposite* corners use each edge exactly once,
and the curves flow. Which pair is then a choice, once per tile — Truchet's
whole point from 1704, that the tile is the same either way and the pattern is
in the choosing. `--motif-turn` offers four ways of choosing and they look
nothing alike.

**Exact where it can be.** At a corner whose two arms are equal — every rhombus
— a single circle passes through both points, so the mark is an exact `Arc` and
survives into the SVG as an arc command. Where the arms differ, no such circle
exists and pretending otherwise puts a kink at the join, so it is a `Cubic` with
the usual quarter-turn constant. A plotter would rather have the arc.

An odd-sided tile has no pairing of its edges at all, which matters now that
`--tiles delaunay` hands out triangles. `arcs` and `chords` leave those bare and
report the count; `cross` falls back to spokes from the centre.

### The window's position as a field

`--window-shift` is one number. `--phason` makes it a field over the drawing,
reusing the whole existing field machinery — same presets, same stacks, same
`--field-*` shaping — because a field is a field. What differs is what it
drives: the deformation rules move vertices, and this moves the *window*, so the
tiling rearranges by flips rather than being pushed about, and stays a genuine
tiling while the field is gentle.

Measured: `radial` at 0.1 still reads χ = 1 with no defects; at 0.3 it is
folding; by 0.5 it is in pieces. A *linear* field is exactly a tilt of the
plane, so only a non-linear one goes anywhere the tilt cannot.

Worth being straight about the payoff, which was doubted in advance and the
doubt was fair. At gentle settings this is a **statistical** change and not a
visual one: the point count moves by well under a percent — a phason is a
rearrangement, not a deformation — while the census of vertex configurations
goes from 11 to 20, because the window reaches positions the untouched tiling
never visits. It reads as the tenfold rosettes thinning out toward the rim
rather than as anything dramatic. `--vertex-marks` shows it properly; pushing
the strength makes it obvious at the cost of no longer tiling.

## 16. Layers you can turn off without redrawing

Toggling a motif against its tiles wants to be as fast as moving the pointer,
and a round trip per tick is not that. The layer is already in the page — the
browser has it parsed — so hiding it should be one line of CSS.

Three things had to be true for that to be honest rather than a lie about the
file:

**Layers need names in the output.** They had `id="layer7"`, which is a position
and moves the moment a layer above it disappears. Now `id="layer-motif-A"` from
a slug of the name, plus `data-layer` and `data-tag`. Stable across renders, and
useful outside the GUI too — a stylesheet or an Inkscape user gets the same
handle.

**Hiding must not move the framing.** `Drawing.hidden` is a set of names the
writer skips; the layers themselves stay on the drawing, so `bounds()` is still
the whole picture's and the viewBox does not change. Deleting the layers instead
would have made the view jump on every tick *and* made the local hide differ
from the file. Verified: identical viewBox with and without `--hide`.

**The preview and the file want opposite things.** A written file should drop
what `--hide` names — a plotter asked to draw a layer you turned off will draw
it. A preview must keep it, or turning it back on means fetching geometry the
browser had a moment ago. So `serve.render()` clears `drawing.hidden` before
writing the preview and reports the hidden set alongside, and the client does
the hiding. The first version missed this and the panel was one-way: you could
turn a layer off and not back on.

The toggle also writes the `hide` parameter, so it is not merely a view: find
the combination, save, and the file matches. That is the part that makes it safe
not to re-render, and it is guarded by a test that reads `setLayer` and fails if
it ever grows a `schedule()` or `doRender()`.

## 17. Saving the view

`--crop` sets a smaller page, and **Save view** in the GUI fills it in from the
pane's own viewBox. Three decisions:

**Drawing coordinates, not SVG ones.** The content sits under `scale(1,-1)`, so
the file's viewBox reads `xmin, -ymax, w, h`. Asking anyone to think in that in
order to crop a picture would be unkind, so `--crop` is `xmin,ymin,xmax,ymax`
with y up and the conversion happens once, in the client. There is a test on
that one line, because it is the only place the flip has to be undone by hand.

**Drop what is wholly off, keep what crosses.** Clipping an arc or a cubic
exactly is real work and would need every primitive to know how; half a rhomb
hanging over the page edge is what a cropped drawing looks like anyway. What is
worth removing is the 90% that is nowhere near — a plotter would still traverse
it, and zoomed in that is most of the drawing. Measured: 194 KB to 24 KB, 2,444
items of 2,750 gone. `vpype crop` on the end of `--simplify` does a true one.
Touching counts as overlapping, or an edge lying exactly on a round number would
blink out.

**The counts have to be of the file.** `Drawing.stats()` now counts only what
survives the crop and skips hidden layers, because reporting 2,750 items about a
file holding 306 is worse than reporting nothing. Groups left empty by the crop
are removed from the tree rather than written as empty `<g>`s.

One O(1) guard: a crop that does not overlap the drawing at all is warned about.
It is the mistake that actually happens, and without it you get a valid, empty
and entirely silent file.

### A note on churn

Adding `crop` renamed all 31 examples, as `hide` did before it and `motif` before
that: `param_hash` covers every resolved parameter, so a new one with a default
changes every archived id. Excluding parameters sitting at their default would
stop that permanently, at the cost of one more rename now and of a changed
default silently reusing an old id. Left alone deliberately — it is a change to
what an archive id *means*, and this is not a deeply versioned system.

## 18. The plotter, and two toolbars

### Feature detection, not configuration UI

`PLOTTER_URL` in a `.env` (or the real environment, which wins) is the whole of
it. With one, the GUI grows **Send** and **Send view**; without one they are not
there — not disabled, not hidden behind a menu that has to explain itself. A
button that exists and always fails is worse than no button.

*Configured* and *reachable* are deliberately different questions. A plotter
that is switched off keeps its buttons, because the fix is to switch it on
rather than to edit a file; the toolbar badge names the machine when it answered
and says "offline" when it did not.

Sending is not archiving. `send_to_plotter` renders and uploads and writes
nothing locally — a drawing you are trying on the machine should not quietly
fill `output/`, and Save and Send being one button each is what lets either
happen without the other.

### Stdlib, against the usual rule

The house rule is to use libraries. Here it does not pay: `.env` is `KEY=value`
lines, and the upload API takes a raw body as well as multipart, so the whole
client is `urllib` plus a dozen lines of parsing instead of `requests` and
`python-dotenv`. The rule exists to stop us reimplementing hard things; two
optional packages in everyone's install, for an optional feature, is the cost it
was meant to avoid.

### The arcs

Buried in the API docs: *"Arcs in a transformed group occasionally convert
imperfectly (an upstream bug in `svgelements`)... Emitting paths as Béziers
rather than arcs avoids it entirely."*

Every file this project writes is that combination the moment a motif is on. The
content sits under `scale(1,-1)` — which is how the whole project gets to think
in y-up — and `--motif arcs` on a rhombus emits exact `A` commands, because
equal arms mean one circle passes through both points. So the flagship plotter
output is precisely the case the plotter's reader is worst at.

`arc_to_cubics` converts, at one cubic per 45 degrees with the standard `4/3 *
tan(d/4)` control distance. Measured over arcs from 0.1 radians to nearly a full
turn, the worst point is 4.2e-6 of the radius off the true circle — a fifth of a
micron on a 50 mm arc. The file on disk keeps its arcs, since it is the archival
master and every other reader handles them; only the copy over the wire is
converted.

A first attempt rewrote the `A` commands in the finished *text*, so that
`aperiodics plot` could fix any file. It recovered the wrong arc centre in
places — the two candidates are picked between by the large-arc and sweep flags
together, and getting that wrong turns a curve inside out — and the geometry
came out up to 17 mm off. Dropped: where there is a run record the drawing is
rebuilt from its parameters and re-emitted, which is exact; where there is only
a loose SVG it goes as it is and says why.

### Two toolbars, two jobs

The top bar had accumulated everything: Render, live, Save, Setup JSON, Docs,
Vertex key, Save view, Copy command. Now it is only **getting the drawing out**
— Save, Save view, Send, Send view, Copy command, JSON.

Everything about *looking* is behind a cog at the corner of the pane: Render and
live, zoom, line weight, the field backdrop, the vertex key, the layers list,
and the status line at the bottom of it. Three consequences worth recording:

- The status line stops being a floating overlay whose width changed on every
  render. That was already the second attempt at it — it used to be in the
  document flow and shoved the image about.
- The layers list folded into this panel instead of being a popup of its own.
  Two popovers anchored to the same corner was worse than one that grows.
- The panel is shut by default, so the tiling verdict would have been hidden by
  closing it. The cog carries a warning dot instead, which is the one bit of
  that panel worth seeing without opening anything.

Docs moved to the sidebar, beside the construction dropdown it documents.

**And it shipped broken.** Putting the panel *inside* `#stage` killed every
control in it. The stage calls `setPointerCapture` on pointerdown so a drag can
leave it, and a captured pointer retargets the `click` to the capturing element
— so a button inside the stage never sees its own click. The old zoom bar had
always been a sibling of the stage, which is why this had never come up.

What made it ship is the more useful lesson: every browser check was
`element.click()` from a script, which dispatches straight to the target and
bypasses pointer capture entirely. Synthetic clicks proved the handlers, the
state and the rendering, and could not have caught this. Driving a real pointer
at real coordinates found it in one go. There is now a test asserting `#stage`
contains nothing but the drawing.

### Pasting a setup in

The JSON pane parsed on `change`, which fires on blur — so pasting appeared to
do nothing until you clicked away. Now `input` with a 400 ms pause, and
half-typed JSON simply does not parse yet.

Forgiving about shape, because what people paste comes from several places: a
whole sidecar record (with a dozen keys that are not parameters), a
`{"sketch", "params"}` pair, or a bare object of parameters. Strict about
contents, because a parameter the construction does not have is a 400 from the
server naming none of them — so unknown names are reported here and dropped.

And it fills in the defaults it was not given. Without that, a paste of
`{"n": 5}` left every other slider undefined and the sidebar read `NaN`.

## 19. An arbitrary direction where there is none

`--rules gather` on a fivefold multigrid with a uniform field came out visibly
lopsided, on a construction that is fivefold to floating point. Measured: 167 of
361 vertices had a frame that did not turn with the drawing, and the worst
vertex was 7 mm out on a 6 mm edge.

Three causes, one theme. Each was a place where the code produced a definite
direction for something that has none.

### Boundary vertices were pointed due east

`star_frame` returned `(0.0, False)` for a vertex with no complete star. Zero is
not "no direction": it is a bearing, and `exp(0i)` is east. So the entire rim of
every drawing leaned the same way regardless of how the tiling was turned — 100
of the 167 wrong frames. A vertex with no star now has an empty frame set and
does not move under a local rule.

### Ties in the canonicalisation were broken by enumeration order

This is the interesting one. `_canonical_with_frame` took the smallest rotation
of the star's tag sequence, keeping the first winner on a tie. Ties are not
rare — they are the star's **symmetry group**. `ABAB` reaches its canonical form
from two starting tiles, `BBBBB` from five, and any star that reads the same
backwards reaches it reflected as well. Which winner the loop happened to reach
first depended on where `star_faces` started, which depends on absolute
orientation. So the frame was not equivariant.

The fix is not a better tie-break — there isn't one, because the tie *is* a
symmetry. `_canonical_frames` returns all of them and the local direction is
their average. That is equivariant by construction, and it gives the right
answers rather than merely consistent ones:

| star | frames | what survives |
|---|---|---|
| `ABBB` | 2, both on the mirror | everything |
| `AABBBB` | 2 | 0.95 |
| `ABABB` | 2 | 0.59 |
| `AAB` | 2 | 0.31 |
| `AABAABB` | 2, exactly opposite | nothing |
| `BBBBB` | 10 | nothing |

A `k`-fold star's `k` directions cancel: there is no way to pick one of five
identical arms without breaking the symmetry that makes them identical. A star
with a mirror keeps only the component along the mirror line, and the amount is
the cosine of how far off that line the rule points — a rule asking to go
*across* a mirror is asking for something a reflection forbids. The magnitude is
deliberately not renormalised: the shrinkage is the answer.

The panel had been claiming this for a while — "a rotationally symmetric star is
left out of a local rule" — and nothing implemented it. Now it is true, and it
covers the mirror case the rotational test missed.

### A 1e-15 guard on millimetres

`radial` and `gradient` normalised with `where=m > 1e-15`. Coordinates are
millimetres across a 100 mm drawing, where float noise is around 1e-14 — so the
vertex sitting *at* the centre of a radial rule had its rounding error
normalised into a perfectly definite direction and moved a whole edge length,
diagonally. The threshold is now relative to the largest vector present.

### What the tests were worth

Every one of the three passed the existing suite. The property that catches all
of them is one line — *deform a fivefold tiling with a uniform field and check
it is still fivefold* — and it is now a parametrised test over every ruleset,
with `shear` asserted to **fail** it so the test cannot pass by doing nothing.

Three existing tests had encoded the old behaviour as correct: two picked
`BBBBB` as the configuration to steer, which under the corrected rule cannot be
steered, and one asserted that a local rule is defined at every vertex. All
three were about something else and now say so.

### And the plotter's framing

`Send view` was sending a cropped drawing with the plotter's default
`bounds=lines`, which measures the image by its *geometry* — including the tiles
hanging over the crop edge. It would have placed and scaled to the overhang,
off by up to a tile all round and differently on each side. A crop now sends
`bounds=document` and `crop=true`, so the page you framed is the page that gets
plotted. A palette's background goes as `paper_color` rather than as the
rectangle it is locally, since a plotter asked to draw a rectangle draws one.

## 20. Reachability as a constraint

A fair question after the last fix: was `gather` simply configured wrong — the
original deformation only ever moved *non-symmetric* vertex types — rather than
the maths being broken?

Measured, on a fivefold multigrid at radius 9 with a uniform field, edge 6 mm:

| | fivefold error |
|---|---|
| old maths, everything moves | 7.05 mm |
| old maths, fivefold stars weighted out | **7.05 mm** |
| old maths, and the whole rim weighted out too | 4.16 mm |
| current maths, nothing weighted out | 2.6e-14 mm |

Excluding the symmetric stars by parameter would have changed nothing at all.
The residual was in the *mirror-symmetric* stars — `AAB`, `ABABB` — which are
precisely the non-symmetric types that are supposed to move, and whose frames
were being chosen by enumeration order. So the maths did need fixing.

But the design point is separate and it is right: **a local rule should not
offer to set something it can never do.** That is now a constraint rather than
an emergent zero.

### Where the line falls

Sharper than "symmetric or not", and the sharpness matters:

* **Rotational symmetry** (`BBBBB`, `ABAB`) — `k` frames pointing `k` ways, and
  they sum to zero *however much angle is added to all of them*. No setting
  reaches it. Unreachable, and the card is locked.
* **A mirror alone** (`AAB`, `AABAABB`, `ABBB`) — two frames, and the direction
  they agree on is the mirror line. Fully reachable; the angle is the control.
  Measured across the offset: `ABBB` runs 1.00 at 0 degrees to 0.00 at 90,
  `AABAABB` runs 0.00 at 0 to 1.00 at 90. Calling either unreachable would be
  wrong, and calling the shortfall a bug would be wrong too — it is the cosine
  of how far off the mirror the rule points.

So `local_is_reachable(key)` is `star_symmetry(key) <= 1`, plus boundary
vertices, which have no star at all.

### What changed

`symmetric_types` was a default with an override — symmetric stars were
weighted out unless you named one in `--per-type`, and naming one "put it back
in". It cannot be put back in. It is now `unreachable_types`, always applied,
and naming one gets a notice saying why and what to use instead.

The panel gains `reachable` and `reach` per configuration. `reach` is the
fraction of the rule that survives that star's own symmetry at its current
angle — and it is not a second opinion: `reach x edge` equals the displacement
the drawing uses, because both now come from one `local_direction`. They used
to be two pieces of arithmetic that happened to agree.

## 21. Alpha

A fourth palette adjustment beside hue, saturation and brightness, and an
opacity slider on every swatch. Three decisions:

**It rides inside the colour.** `#rrggbbaa`, so an override is one value in the
JSON, one on the command line, one in a swatch — rather than a parallel set of
`*_opacity` parameters that would have to be kept in step with the colours. It
is split apart again at the last moment.

**That last moment is `Style.__post_init__`, not `with_`.** The vertex marks and
the key both build a `Style(...)` from scratch, so a check in `with_` would let
those past. Splitting on construction catches every path, and multiplies rather
than replaces — `DENSE_LINEWORK` is already at 0.35 opacity and stays relatively
faint. The page colour is a `<rect>` rather than a layer, so it needed the same
treatment separately in the writer.

Why split at all: an eight-digit hex is CSS Color 4, and the SVG reader inside a
plotter is exactly the kind that has not caught up. `fill="#e8623c"` with
`fill-opacity="0.45"` is SVG 1.1 and universally understood. An opaque colour
still writes the six digits it always did, so nothing that never touches alpha
changes — including every archived run.

**It multiplies, and the swatch reports its own.** `palette_slots` returns a
slot's *own* alpha, 1 unless overridden, not the product with the master.
Reporting the product would have meant that nudging a slot's opacity while the
master sat at 0.4 wrote 0.4 into the override and squared it to 0.16 on the next
render — a control that changes its own meaning the moment you touch it.

`<input type=color>` is six digits and always will be, so the alpha needs a
separate control beside each swatch; `rgbOf`/`alphaOf`/`withAlpha` split and
recombine, dropping the alpha again when it is fully opaque.

### Still open

- **Thumbnails.** `--png` via cairosvg (system cairo, already installed) works and
  is optional; a run degrades to no thumbnail rather than failing. Animated GIF
  across a sweep would be a small addition on the same dependency — worth doing
  once sweeps are in regular use.
- **`git init`.** Not done; it is the user's call. `RunRecord` captures the commit
  and dirty flag when a repo exists and records `{"available": false}` otherwise,
  so provenance is materially better with one.
- **DXF** stays deferred (§8) until SVG-into-CAM proves awkward.
