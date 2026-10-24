# multigrid

de Bruijn multigrid: quasiperiodic rhombic tilings of any symmetry (n=4 Ammann-Beenker, n=5 Penrose)

## The maths

<!-- Written by hand. `aperiodics docs` never touches this section. -->

de Bruijn's multigrid — quasiperiodic rhombic tilings of any symmetry.

Take *n* families of equally-spaced parallel lines, their normals fanned evenly
across a half-turn. Every intersection of a line from family *r* with one from
family *s* becomes a rhombus with sides `e_r` and `e_s`. The result is a
quasiperiodic tiling with 2n-fold symmetry for odd *n*, n-fold for even.

**n = 5 is Penrose P3** — the thin (36 degrees) and fat (72 degrees) rhombs fall
straight out. **n = 4 is Ammann-Beenker**, the 45-degree rhomb and the square.
Beyond that the construction keeps going: n = 7 gives three rhombs, n = 12 gives
six, and none of it needs a substitution rule.

This is why the module is first (PLAN.md 8). Rather than porting Penrose and
generalising afterwards, the general construction gets built and Penrose arrives
as a special case. It also stresses the core in the right places: vertices are
produced by line intersection in essentially arbitrary order, so welding
tolerance and edge deduplication have to be right from the start.

Construction
------------
Family *j* has normal ``e_j = exp(i*pi*j/n)``, and its *k*-th line is the locus of
``z.e_j + gamma_j = k``. Note the half-turn spacing: with ``2*pi*j/n``, families
*j* and *j + n/2* would be antiparallel for even *n* — the same line family twice,
never intersecting.

For an intersection *z* of line *k_r* with line *k_s*, take the index vector
``K_m = ceil(z.e_m + gamma_m)`` (with ``K_r = k_r`` and ``K_s = k_s`` set exactly,
since floating point makes `ceil` of an exact integer a coin toss). The four
rhomb corners are then ``sum_m K_m e_m`` with ``K_r`` and ``K_s`` each free to take
their value or one more.

Because ``sum_m e_m e_m^T = (n/2) I``, a vertex sits at roughly ``(n/2) z`` — so
grid coordinates scale up by n/2, which is how `radius` translates into a line
index range.

Centring
--------
Each *cell* of the grid maps to a *vertex* of the tiling, so the vertex answering
to the grid origin — the pattern's symmetry centre — is at
``sum_m ceil(gamma_m) e_m``, **not** at the origin. Its magnitude grows like
``2n/pi``: about 3.2 edge lengths at n=5, but 7.7 at n=12. Clipping a disc around
the origin therefore cuts an off-centre bite out of the pattern, which at n=12 is
plainly visible as a rosette pushed to one side. The construction re-centres on
that vertex, so `radius` means what it looks like it means.

This one is worth remembering as a method note: it passed every numerical check —
Euler characteristic 1, correct tile ratios, no singular points — and was only
caught by looking at the picture.

Offsets, and a trap worth knowing about
---------------------------------------
`gamma` decides *which* tiling out of the family you get, and is the interesting
continuous parameter. Equal offsets give a tiling symmetric about the origin;
``gamma = 0`` is maximally singular, since every family then has a line through
the origin.

de Bruijn's condition for a tiling to be **Penrose P3 proper** rather than a
*generalised* Penrose tiling is that the offsets sum to an integer. That is
stated for *his* convention, ``E_j = exp(2i*pi*j/n)``, which fans the normals over
a **full** turn — and it does not carry over to the half-turn fan used here.

Half of de Bruijn's normals point the other way: ``E_j = -e_(2j-n)`` once
``2j >= n``, and reversing a normal negates that family's offset. For odd *n*,
``m = 2j mod n`` is a bijection, and working the signs through gives

    sum_j delta_j  =  sum_m (-1)^m gamma_m

so the Penrose condition in this module's convention is that the **alternating**
sum of the offsets is an integer, not the plain sum.

This was confirmed experimentally before it was believed. With ``n = 5`` at
radius 140 (76k tiles):

* uniform ``gamma = 0.2`` (plain sum 1, alternating sum 0.2) gives **12** vertex
  stars — a generalised Penrose tiling;
* alternating ``gamma = (0.2, -0.2, 0.2, -0.2, 0.2)`` (alternating sum 1) gives
  **7**, stable from 6k tiles through 76k, every star summing to exactly 360
  degrees.

Hence the `alternate` flag: set it and `offset = k/n` to land on Penrose P3.
`MultigridResult.alternating_sum` reports where you actually are.

References
----------
- N. G. de Bruijn (1981), "Algebraic theory of Penrose's non-periodic tilings of
  the plane", Indagationes Mathematicae 43(1), 39-66.
  https://doi.org/10.1016/1385-7258(81)90017-2
- J. E. S. Socolar, P. J. Steinhardt (1986), "Quasicrystals II: Unit-cell
  configurations", Phys. Rev. B 34, 617. https://doi.org/10.1103/PhysRevB.34.617
- F. Gahler, J. Rhyner (1986), "Equivalence of the generalised grid and
  projection methods", J. Phys. A 19, 267.
  https://doi.org/10.1088/0305-4470/19/2/020

## References

<!-- aperiodics:references -->
- N. G. de Bruijn (1981), "[Algebraic theory of Penrose's non-periodic tilings of the plane](https://doi.org/10.1016/1385-7258(81)90017-2)", *Indagationes Mathematicae 43(1), 39-66*.
- J. E. S. Socolar, P. J. Steinhardt (1986), "[Quasicrystals II: Unit-cell configurations](https://doi.org/10.1103/PhysRevB.34.617)", *Physical Review B 34, 617*.
- F. Gahler, J. Rhyner (1986), "[Equivalence of the generalised grid and projection methods for the construction of quasiperiodic tilings](https://doi.org/10.1088/0305-4470/19/2/020)", *Journal of Physics A 19, 267*.
- M. Senechal (1995), "Quasicrystals and Geometry", *Cambridge University Press*.
- D. Levine, P. J. Steinhardt (1984), "[Quasicrystals: A new class of ordered structures](https://doi.org/10.1103/PhysRevLett.53.2477)", *Physical Review Letters 53, 2477*.

**Also worth looking at**

- Greg Egan, "[de Bruijn's algorithm, worked through with diagrams](https://www.gregegan.net/APPLETS/12/deBruijnNotes.html)".
- Tilings Encyclopedia, "[Substitution and cut-and-project tilings, with literature](https://tilings.math.uni-bielefeld.de/)".
- Craig S. Kaplan, "Introductory tiling theory for computer graphics", *Synthesis Lectures on Computer Graphics and Animation, 2009*.
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
| `--n` | int | `5` | line families; 4=Ammann-Beenker, 5=Penrose, 7+ onwards — usually 3…24 |
| `--radius` | float | `20.0` | tiling extent (edge lengths) — usually 2…200 |
| `--edge` | float | `6.0` | rhomb edge length (mm) — usually 0.5…50 |
| `--offset` | float | `0.5` | base grid offset; 0 is degenerate — usually -1…1 |
| `--alternate` | bool | `False` | negate odd families; with offset=k/n and odd n this gives Penrose P3 proper |
| `--asymmetry` | float | `0.0` | spread the family offsets apart, selecting a generic tiling instead of the symmetric one. Not noise: the result is still an exact tiling with every edge the same length — usually 0…0.5 |
| `--render` | str | `'edges'` | what to draw. 'none' leaves the tiling to whatever --motif puts on it, which is how you get Penrose's arcs without the rhombs under them — one of `edges`, `faces`, `both`, `none` |
| `--dense` | bool | `False` | hairline low-opacity style, for dense line work |
| `--label` | bool | `True` | classify vertex stars and report them |
<!-- /aperiodics:params -->

## Gallery

<!-- aperiodics:gallery -->
### multigrid-flow-field-f9802f3f

![multigrid-flow-field-f9802f3f](../../examples/multigrid-flow-field-f9802f3f.png)

```bash
aperiodics multigrid --alternate --field ripple-fade --offset 0.2 --radius 12 --rules flow --show-field colour --strength 1.4
```

555 faces, 7 vertex types.

### multigrid-generic-sevenfold-5e5c535b

![multigrid-generic-sevenfold-5e5c535b](../../examples/multigrid-generic-sevenfold-5e5c535b.png)

```bash
aperiodics multigrid --asymmetry 0.3 --n 7 --radius 12 --seed 3
```

561 faces, 43 vertex types.

### multigrid-jumble-a317622b

![multigrid-jumble-a317622b](../../examples/multigrid-jumble-a317622b.png)

```bash
aperiodics multigrid --alternate --dense --field flat --offset 0.2 --radius 12 --rules star --strength 4
```

555 faces, 7 vertex types.

### multigrid-penrose-af560cea

![multigrid-penrose-af560cea](../../examples/multigrid-penrose-af560cea.png)

```bash
aperiodics multigrid --alternate --offset 0.2 --radius 14
```

760 faces, 7 vertex types.

### multigrid-penrose-arcs-248975ad

![multigrid-penrose-arcs-248975ad](../../examples/multigrid-penrose-arcs-248975ad.png)

```bash
aperiodics multigrid --alternate --motif arcs --radius 26 --render none
```

2610 faces, 11 vertex types.

### multigrid-quasiwave-24d357be

![multigrid-quasiwave-24d357be](../../examples/multigrid-quasiwave-24d357be.png)

```bash
aperiodics multigrid --dense --field waves --field-freq 3 --n 7 --radius 13 --rules star --strength 1.7
```

644 faces, 18 vertex types.

### multigrid-sevenfold-key-a716dbad

![multigrid-sevenfold-key-a716dbad](../../examples/multigrid-sevenfold-key-a716dbad.png)

```bash
aperiodics multigrid --n 7 --radius 8 --render both --vertex-key --vertex-marks
```

252 faces, 11 vertex types.

### multigrid-spotlight-8c91a62b

![multigrid-spotlight-8c91a62b](../../examples/multigrid-spotlight-8c91a62b.png)

```bash
aperiodics multigrid --alternate --dense --field spotlight --offset 0.2 --radius 12 --rules push --strength 1.6
```

555 faces, 7 vertex types.

### multigrid-twelvefold-d49f17f0

![multigrid-twelvefold-d49f17f0](../../examples/multigrid-twelvefold-d49f17f0.png)

```bash
aperiodics multigrid --n 12 --radius 12
```

552 faces, 16 vertex types.

<!-- /aperiodics:gallery -->

<!-- aperiodics:walkthrough -->
*No walkthrough for this module. Add a `WALKTHROUGH` list to `aperiodics/modules/multigrid.py`.*
<!-- /aperiodics:walkthrough -->
