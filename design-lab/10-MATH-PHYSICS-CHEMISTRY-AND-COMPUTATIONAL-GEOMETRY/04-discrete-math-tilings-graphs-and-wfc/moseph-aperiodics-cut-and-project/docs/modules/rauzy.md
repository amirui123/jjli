# rauzy

Rauzy fractals: the window a substitution implies, drawn as an exact tiling of rhombi

## The maths

<!-- Written by hand. `aperiodics docs` never touches this section. -->

Rauzy fractals: the acceptance window of a substitution, drawn as a tiling.

`project` chooses a window and gets a tiling. This module goes the other way:
it starts from a **substitution** and computes the window that substitution
implies — which is almost never a polygon. It is a fractal, and it is the same
kind of object as the hypercube shadow that `project` uses.

The construction
----------------
Take a substitution on three letters, say Tribonacci: `1 -> 12`, `2 -> 13`,
`3 -> 1`. Abelianise it — count the letters — and you get a 3x3 integer matrix
`M`. Its eigenvalues split: one real one bigger than 1 (a **Pisot** number, the
inflation factor), and a conjugate pair inside the unit circle.

The expanding direction is the tiling: iterate the substitution, walk the
letters as steps along the three axes of the cubic lattice, and you get a
staircase in three dimensions that hugs a line. That line is a one-dimensional
quasiperiodic point set — a cut-and-project set with `n=3` and a one-dimensional
physical space.

The *contracting* plane is what we draw. Project that staircase sideways, onto
the plane the substitution shrinks, and the points do not run off: they fill a
bounded region with a fractal boundary. That region is the **Rauzy fractal**,
and it is exactly the window of the model set. Its three pieces — one per letter
— are the sub-windows that decide which letter comes next.

So this module and `project` are the same construction seen from opposite ends.
`project` picks a window and asks what tiling comes out; this picks a
substitution and asks what window it needs. That the answer is a fractal is why
substitution tilings and cut-and-project tilings looked like different subjects
for thirty years.

How it is drawn
---------------
Not as a point cloud. The **dual substitution** `E1*` acts on the unit *faces*
of the cubic lattice rather than on its points (Arnoux and Ito, 2001):

    E1*(s)[x, i*] = union over j, and over each way of writing s(j) = p.i.s,
                    of [ M^-1 (x + l(s)), j* ]

where `l(s)` counts the letters of the suffix. Start from the three unit faces
at the origin and iterate. Every face stays an exact unit square of the lattice,
so projecting gives exact rhombi rather than pixels — and the result is a
genuine tiling, which the structural checks confirm rather than assume. Its
outline converges to the fractal; `--generations` is a resolution control.

Two decompositions, and only one of them is the famous picture
--------------------------------------------------------------
Every rhombus can be labelled two ways, and they give different pictures:

* **sub-window** — which of the three faces at the origin it descends from.
  This is the classical decomposition: three interlocking regions, and the area
  of each is exactly the frequency of that letter in the infinite word, which
  is the normalised right Perron eigenvector of `M`. Measured to five decimals
  on three different substitutions.
* **orientation** — which pair of lattice axes the rhombus spans. These three
  classes interleave everywhere rather than forming regions, so it looks like a
  fine weave. Its areas follow `l_i * r_i`, the product of the *left* and right
  Perron components: the left eigenvector counts the faces, because the dual
  substitution transposes the incidence matrix, and the right one gives each
  face its area.

The first is the default because it is the picture people mean. The second is
there because it is what the construction natively produces, and it looks
completely different.

One thing that was checked rather than assumed
-----------------------------------------------
The `E1*` formula has a transpose in it, and getting it the wrong way round
produces something that looks plausible and is not a tiling. Measured at nine
generations: as written, chi = 1 with no angle defects and no stacked edges; the
transposed version gives chi = 29 and overlapping faces. That is the whole
argument for having a cheap tiling check.

And it earns its keep a second time. For Tribonacci chi is **exactly 1 at every
generation** — the fractal is a topological disc. For the plastic number it runs
1, 2, 5, 7, 7, -8, -48, -243 as the generations climb: the window is riddled
with holes, more of them at every scale. That is a known and quite deep property
of that particular fractal, and here it falls out of a millisecond of arithmetic
that was written for something else.

Why three letters
-----------------
A Pisot substitution on `k` letters has one expanding eigenvalue and `k-1`
contracting ones, so the fractal lives in `k-1` dimensions. Three letters is the
case that is a picture. Four is a solid, and a flat drawing of it would be a
shadow rather than the thing — so this refuses rather than pretending.

References
----------
- G. Rauzy (1982), "Nombres algebriques et substitutions", Bulletin de la SMF
  110, 147-178. https://doi.org/10.24033/bsmf.1957
- P. Arnoux, S. Ito (2001), "Pisot substitutions and Rauzy fractals", Bulletin
  of the Belgian Mathematical Society 8(2), 181-207.
  https://doi.org/10.36045/bbms/1102714169
- V. Berthe, A. Siegel (2005), "Tilings associated with beta-numeration and
  substitutions", Integers 5(3), A2.
- N. Pytheas Fogg (2002), "Substitutions in Dynamics, Arithmetics and
  Combinatorics", Springer Lecture Notes in Mathematics 1794.

## References

<!-- aperiodics:references -->
- G. Rauzy (1982), "[Nombres algebriques et substitutions](https://doi.org/10.24033/bsmf.1957)", *Bulletin de la Societe Mathematique de France 110, 147-178*.
- P. Arnoux, S. Ito (2001), "[Pisot substitutions and Rauzy fractals](https://doi.org/10.36045/bbms/1102714169)", *Bulletin of the Belgian Mathematical Society 8(2), 181-207*.
- V. Berthe, A. Siegel (2005), "Tilings associated with beta-numeration and substitutions", *Integers 5(3), A2*.
- N. Pytheas Fogg (2002), "Substitutions in Dynamics, Arithmetics and Combinatorics", *Springer LNM 1794*.

**Also worth looking at**

- Tilings Encyclopedia, "[Substitution tilings and their windows](https://tilings.math.uni-bielefeld.de/)".
- Shigeki Akiyama, "[Pictures of Rauzy fractals and the Pisot conjecture](https://www.math.tsukuba.ac.jp/~akiyama/)".
<!-- /aperiodics:references -->

## Walkthrough

<!-- aperiodics:walkthrough -->
### 1. A substitution, and the number hiding in it

Start with a rule for replacing letters. Tribonacci: **1 becomes 12, 2 becomes
13, 3 becomes 1**. Apply it to `1` over and over and you get an infinite word
that never repeats.

Count the letters instead of reading them and the rule becomes a 3x3 matrix. Its
largest eigenvalue is 1.8393 — the Tribonacci constant, the three-term cousin of
the golden ratio — and *that* is how fast the word grows. The other two
eigenvalues are a complex pair with modulus 0.7374: less than one, so they
shrink.

One direction stretching and two shrinking is the whole story. The picture below
is the shrinking part.

![A substitution, and the number hiding in it](../../docs/images/rauzy/01.png)

```bash
aperiodics rauzy
```

**inflation** 1.83929 · **generations** 14 · **rhombi** 13745 · **is it a tiling** tiles

### 2. Why there is a picture at all

Walk the infinite word in three dimensions: a `1` steps along the first axis, a
`2` along the second, a `3` along the third. You get a staircase that hugs a
line — and points on that line, read off in order, are a one-dimensional
quasiperiodic sequence. That is cut-and-project with a *one*-dimensional
physical space.

So where is the window? Project the staircase **sideways**, onto the plane the
substitution shrinks. The points do not run off. They pile into a bounded region
with a ragged edge, and that region is the acceptance window — the same kind of
object as the hypercube shadow `project` uses, except that it is a fractal.

That is the whole point of this module: `project` picks a window and asks what
tiling falls out. This picks a substitution and asks what window it *needs*.

The three colours are the three sub-windows, one per letter. Which one a point
lands in decides which letter comes next.

<img src="../../docs/images/rauzy/02.png" width="46%"> <img src="../../docs/images/rauzy/02b.png" width="46%">

*Left:* `aperiodics rauzy`  

*Right: the same figure labelled by rhombus shape instead:* `aperiodics rauzy --colour-by orientation`

Left — **areas** A 0.54369, B 0.2956, C 0.16071 · **letter frequencies** A 0.54369, B 0.2956, C 0.16071. Right — **areas** A 0.61842, B 0.28219, C 0.09939 · **letter frequencies** A 0.54369, B 0.2956, C 0.16071.

### 3. The areas are the letter frequencies, exactly

Left and right above are the same tiling with two different labellings, and only
one of them is the classical picture.

**Sub-window** asks which of the three faces at the origin a rhombus descends
from, and gives three interlocking regions. Their areas are the frequencies of
the three letters in the infinite word — to five decimal places, for every
substitution in the catalogue. That is not a coincidence to be checked once; it
is the defining property of the decomposition, and it is a test.

**Orientation** asks which pair of lattice axes the rhombus spans. Those three
classes interleave everywhere instead of forming regions, so the same figure
reads as a fine weave. Their areas follow a different quantity — the left Perron
eigenvector times the right one, because one counts the faces and the other
gives each face its area.

Neither is more correct. They are two true things about one object.

<img src="../../docs/images/rauzy/03.png" width="46%"> <img src="../../docs/images/rauzy/03b.png" width="46%">

*Left:* `aperiodics rauzy --substitution wide`  

*Right: a slower inflation:* `aperiodics rauzy --substitution narrow`

Left — **inflation** 2.54682 · **areas** A 0.64649, B 0.25384, C 0.09967. Right — **inflation** 1.75488 · **areas** A 0.24512, B 0.32472, C 0.43016.

### 4. Some of these windows have holes

The Euler characteristic is computed on every render for a completely different
reason — to say whether a construction still tiles — and it answers a question
here that it was never meant to.

For Tribonacci it reads **exactly 1 at every resolution**. The window is a
topological disc: one piece, no holes, however far in you look.

For the **plastic number** — the smallest Pisot number there is, where
`b^3 = b + 1` — it reads 1, then 2, then 5, 7, 7, then −8, −48, −243 as the
detail climbs. The window is riddled with holes, and there are more of them at
every scale. That is a real and quite deep property of that particular fractal,
and it falls out here of a millisecond of arithmetic.

Look at the two below and you can see it without the number.

<img src="../../docs/images/rauzy/04.png" width="46%"> <img src="../../docs/images/rauzy/04b.png" width="46%">

*Left:* `aperiodics rauzy --detail 40000`  

*Right: the plastic number, full of holes:* `aperiodics rauzy --substitution plastic --detail 40000`

Left — **is it a tiling** tiles. Right — **is it a tiling** χ -2059 (holes).

### 5. Slow numbers, fast numbers

The inflation factor decides how many iterations it takes to resolve the same
amount of boundary — 1.3247 needs 31 of them where 2.5468 needs 9. So the
control here is **detail**, meaning roughly how many rhombi you want, and the
generations are worked out from the substitution. Ask for the same detail from
any of them and you get comparable pictures.

The shape has nothing to do with resolution. It is fixed by the substitution;
detail only decides how finely the edge is cut.

<img src="../../docs/images/rauzy/05.png" width="46%"> <img src="../../docs/images/rauzy/05b.png" width="46%">

*Left:* `aperiodics rauzy --substitution supergolden --detail 3000`  

*Right: the same fractal, twenty times the detail:* `aperiodics rauzy --substitution supergolden --detail 60000`

Left — **generations** 18 · **rhombi** 2745. Right — **generations** 26 · **rhombi** 58425.

<!-- /aperiodics:walkthrough -->

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
| `--substitution` | str | `'tribonacci'` | which substitution's window to draw — one of `plastic`, `supergolden`, `narrow`, `tribonacci`, `cubic`, `broad`, `blocky`, `wide` |
| `--rule` | str | `''` | your own substitution, like '1->12,2->13,3->1'; overrides the name. Three letters, unimodular and Pisot, or it says why not |
| `--detail` | int | `20000` | roughly how many rhombi to resolve the boundary with. Generations are derived from the inflation factor, so a slow substitution gets more of them on its own — and this is resolution, not size — usually 200…120000 |
| `--size` | float | `120.0` | radius the finished patch is scaled to (mm) — usually 20…400 |
| `--colour-by` | str | `'sub-window'` | 'sub-window' gives the classical three regions, whose areas are the letter frequencies; 'orientation' labels each rhombus by its shape, and those interleave everywhere — one of `sub-window`, `orientation` |
| `--render` | str | `'faces'` | what to draw. 'none' leaves the tiling to whatever --motif puts on it — one of `edges`, `faces`, `both`, `none` |
| `--dense` | bool | `False` | hairline low-opacity style, for dense line work |
| `--label` | bool | `True` | classify vertex stars and report them |
<!-- /aperiodics:params -->

## Gallery

<!-- aperiodics:gallery -->
### rauzy-outline-57895009

![rauzy-outline-57895009](../../examples/rauzy-outline-57895009.png)

```bash
aperiodics rauzy --dense --render edges --substitution wide
```

10605 faces, 30 vertex types.

### rauzy-plastic-holes-e77bafb6

![rauzy-plastic-holes-e77bafb6](../../examples/rauzy-plastic-holes-e77bafb6.png)

```bash
aperiodics rauzy --detail 60000 --palette slate --substitution plastic
```

55405 faces, 101 vertex types.

### rauzy-supergolden-941dcca9

![rauzy-supergolden-941dcca9](../../examples/rauzy-supergolden-941dcca9.png)

```bash
aperiodics rauzy --detail 30000 --palette earth --substitution supergolden
```

27201 faces, 28 vertex types.

### rauzy-tribonacci-86021032

![rauzy-tribonacci-86021032](../../examples/rauzy-tribonacci-86021032.png)

```bash
aperiodics rauzy --detail 40000
```

46499 faces, 32 vertex types.

### rauzy-weave-b037e56b

![rauzy-weave-b037e56b](../../examples/rauzy-weave-b037e56b.png)

```bash
aperiodics rauzy --colour-by orientation --detail 40000 --palette riso
```

46499 faces, 4 vertex types.

<!-- /aperiodics:gallery -->
