# substitution

substitution tilings by repeated inflation, with selective detail (currently Penrose P3)

## The maths

<!-- Written by hand. `aperiodics docs` never touches this section. -->

Substitution tilings — inflate, subdivide, repeat.

The other half of the aperiodic story. `multigrid` builds a quasiperiodic tiling
all at once from a grid; a substitution system builds it recursively, each tile
replaced by a scaled arrangement of smaller ones. Penrose P3 comes out of both,
which makes them a strong check on each other — see `tests/test_substitution.py`,
where the two constructions are required to agree on the tile ratio and on the
exact set of vertex configurations.

What substitution gives that the multigrid cannot is **selective inflation**:
subdivide only the tiles matching a predicate, and the tiling ends up finer in
some places than others. That was the best idea in the original code
(`selective_inflate`, and the `circle_check` that shrank the radius each
generation) and produced its best output. It is exposed here as `--detail`.

Tiles are carried as `(tag, vertices)` pairs and inflated by direct vertex
arithmetic rather than by composing transforms. That follows the original, and it
means a new system is a single function over points with no canonical frame to
set up.

Penrose P3 is built from Robinson triangles — half-rhombs — which are merged into
rhombs at the end, deduplicated by centre. Working in half-tiles is what makes
the subdivision rule expressible at all.

Seeds, and what they actually control
-------------------------------------
`star` and `sun` name the vertex configuration you *start* from: ten S half-tiles
apex-to-apex (five thin rhombs), or five fat rhombs. Two things measured rather
than assumed:

* **An L tile cannot be fanned apex-first.** Its apex is 108 degrees and 360/108
  is not an integer, so the `sun` seed has to put L's 36-degree *base* angle at
  the origin and build from whole rhombs. Doing it the other way produced
  degenerate spikes that still passed the tile-count and Euler-characteristic
  checks — only an angle-sum test caught it.
* **The central vertex converges.** Inflation takes a star vertex to a sun after
  a single generation, and sun is then a fixed point. So beyond generation 1 both
  seeds have five fat rhombs at the centre, and what actually differs is the
  **patch outline**: `star` grows a decagonal disc, `sun` a five-pointed star,
  `wedge` a 36-degree sector with straight edges for a rectangular crop.

## References

<!-- aperiodics:references -->
- R. Penrose (1974), "The role of aesthetics in pure and applied mathematical research", *Bulletin of the Institute of Mathematics and its Applications 10, 266*.
- B. Grunbaum, G. C. Shephard (1987), "Tilings and Patterns", *W. H. Freeman*.
- C. Goodman-Strauss (1998), "[Matching rules and substitution tilings](https://doi.org/10.2307/120988)", *Annals of Mathematics 147(1), 181-223*.
- D. Smith, J. S. Myers, C. S. Kaplan, C. Goodman-Strauss (2024), "[An aperiodic monotile](https://doi.org/10.5070/C64163843)", *Combinatorial Theory 4(1)*.

**Also worth looking at**

- Christian Kaplan, "[Penrose tiling explained, with the substitution rules drawn out](https://scipython.com/blog/penrose-tiling-1/)".
- Tilings Encyclopedia, "[Substitution rules and literature for several hundred tilings](https://tilings.math.uni-bielefeld.de/)".
<!-- /aperiodics:references -->

## Parameters

<!-- aperiodics:params -->
| flag | type | default | meaning |
|---|---|---|---|
| `--rules` | str | `''` | what vertices do with the field: a built-in name (climb, curl, flow, gather, pinch, push, shear, star, swirl), a JSON path, or inline JSON; empty leaves the tiling undeformed |
| `--field` | str | `'radial'` | the shape of the deformation: a preset name, a built-in stack, a JSON path, or inline JSON. Every field works with every ruleset |
| `--strength` | float | `1.0` | the single magnitude control; fields are normalised so this means the same thing whichever you pick. >1 crosses faces, >3 is the jumble (edge lengths) — usually -6…6 |
| `--noise` | float | `0.0` | random per-vertex displacement, independent of the field — a quick way to rough something up (edge lengths) — usually 0…1 |
| `--field-freq` | float | `2.0` | cycles across the tiling, for the periodic fields — usually 0.2…20 |
| `--field-phase` | float | `0.0` | phase offset — usually 0…6.284 |
| `--field-angle` | float | `0.0` | direction of travel for wave/sweep (degrees) — usually 0…360 |
| `--field-fold` | int | `5` | lobes for angular, wave count for waves, levels for steps — usually 2…16 |
| `--field-power` | float | `1.0` | reshape the field: >1 accelerates, <1 eases off; sign is kept — usually 0.2…5 |
| `--per-type` | str | `''` | per-configuration weight and angle, e.g. '2xA+3xB=1@45,5xB=0,*=0.5'; the angle after @ is degrees from that configuration's own frame. Open the rule designer to set these |
| `--show-field` | str | `'none'` | draw the field itself, in layers behind the drawing — a display option, not part of the field's shape — one of `none`, `contours`, `grid`, `colour` |
| `--show-field-levels` | int | `10` | contours or bands when showing the field — usually 2…40 |
| `--seed` | int | `0` | seed for anything random |
| `--palette` | str | `''` | a palette name (paper, mono, slate, riso, earth, dusk, night, neon, spectrum, analogous, complement, ramp, golden), per-layer overrides like 'A=#e8623c,edges=#111111', or both: 'dusk,edges=#111' |
| `--hue` | float | `0.0` | rotate every colour round the wheel (degrees) — usually -180…180 |
| `--saturation` | float | `1.0` | 0 is greyscale, 1 as designed, above that louder — usually 0…2 |
| `--brightness` | float | `1.0` | below 1 darkens, above 1 lifts toward white — usually 0.3…1.8 |
| `--alpha` | float | `1.0` | opacity for every colour at once. Multiplies whatever a swatch already carries, so one set half transparent stays half as opaque as its neighbours as this comes down. Overlapping tiles start showing through each other, which is worth having in the jumble regime — usually 0…1 |
| `--background` | str | `'auto'` | 'auto' for the palette's own page colour (most have none), 'none' for transparent, or a colour like '#111' |
| `--vertex-marks` | bool | `False` | a coloured dot at each vertex, one colour per configuration |
| `--vertex-key` | bool | `False` | draw a labelled key of the vertex configurations below the tiling |
| `--motif` | str | `'none'` | a mark drawn inside every tile, in the tile's own frame. 'arcs' is Penrose's original decoration: the curves join across every edge into long continuous lines, which is the best thing here to plot — one of `none`, `arcs`, `chords`, `cross`, `inset`, `rings` |
| `--motif-reach` | float | `0.5` | how far along each edge the marks meet. 0.5 is the midpoint, which is the only value that joins exactly across an edge — usually 0.1…0.95 |
| `--motif-turn` | str | `'tile'` | which way each tile turns its arcs. This is the whole character of the result — Truchet's point is that the pattern is in the choosing — one of `tile`, `random`, `radial`, `alternate` |
| `--motif-layers` | int | `3` | how many nested copies, for 'rings' — usually 1…10 |
| `--crop` | str | `''` | a smaller page, as 'xmin,ymin,xmax,ymax' in mm — the GUI's Save view fills it in from what you are looking at. Items wholly off it are dropped; ones crossing the edge are kept whole |
| `--hide` | str | `''` | layer names to leave out of the file, comma separated — 'edges', 'motif-A', a tile tag. The framing does not move when one goes, so this subtracts from the picture without redrawing it |
| `--system` | str | `'penrose-p3'` | which substitution system — one of `penrose-p3`, `chair` |
| `--generations` | int | `6` | inflation generations; tiles grow ~phi^2 per generation, so 9 is already ~100k — usually 0…11 |
| `--seed-shape` | str | `'star'` | starting vertex; past generation 1 this mainly sets the patch outline — star gives a decagonal disc, sun a five-pointed star, wedge a sector — one of `one`, `star`, `sun`, `wedge`, `wheel` |
| `--size` | float | `120.0` | radius of the starting configuration (mm) — usually 10…500 |
| `--detail` | str | `'uniform'` | selective inflation: subdivide everywhere, or only near the centre / only near the rim / at random — one of `uniform`, `centre`, `edge`, `random` |
| `--detail-falloff` | float | `0.72` | how fast the subdivided disc shrinks per generation, for centre/edge — usually 0.3…1 |
| `--detail-p` | float | `0.8` | subdivision probability, for detail=random — usually 0…1 |
| `--render` | str | `'edges'` | what to draw. 'none' leaves the tiling to whatever --motif puts on it — one of `edges`, `faces`, `both`, `none` |
| `--dense` | bool | `False` | hairline low-opacity style, for dense line work |
| `--label` | bool | `True` | classify vertex stars and report them |
<!-- /aperiodics:params -->

## Gallery

<!-- aperiodics:gallery -->
### substitution-chair-adaptive-d4fba613

![substitution-chair-adaptive-d4fba613](../../examples/substitution-chair-adaptive-d4fba613.png)

```bash
aperiodics substitution --detail centre --detail-falloff 0.8 --seed-shape wheel --system chair
```

6628 faces, 5 vertex types.

### substitution-chair-rings-008c96f8

![substitution-chair-rings-008c96f8](../../examples/substitution-chair-rings-008c96f8.png)

```bash
aperiodics substitution --generations 4 --motif rings --motif-layers 4 --palette slate --render none --seed-shape wheel --system chair
```

1024 faces, 5 vertex types.

### substitution-detail-centre-466cb81a

![substitution-detail-centre-466cb81a](../../examples/substitution-detail-centre-466cb81a.png)

```bash
aperiodics substitution --dense --detail centre --detail-falloff 0.8 --generations 9
```

1095 faces, 7 vertex types.

### substitution-detail-random-7c86450b

![substitution-detail-random-7c86450b](../../examples/substitution-detail-random-7c86450b.png)

```bash
aperiodics substitution --detail random --detail-p 0.78 --generations 8 --seed 4
```

3129 faces, 7 vertex types.

### substitution-per-type-08b9a13f

![substitution-per-type-08b9a13f](../../examples/substitution-per-type-08b9a13f.png)

```bash
aperiodics substitution --dense --generations 7 --per-type BBBBB=0,*=1.4 --rules star --strength 1.2
```

3090 faces, 7 vertex types.

### substitution-sun-rhombs-c00e479f

![substitution-sun-rhombs-c00e479f](../../examples/substitution-sun-rhombs-c00e479f.png)

```bash
aperiodics substitution --render both --seed-shape sun
```

1925 faces, 7 vertex types.

<!-- /aperiodics:gallery -->

<!-- aperiodics:walkthrough -->
*No walkthrough for this module. Add a `WALKTHROUGH` list to `aperiodics/modules/substitution.py`.*
<!-- /aperiodics:walkthrough -->
