# project

cut and project: a tiling as the shadow of a lattice in higher dimensions, with the plane and the window both free to change

## The maths

<!-- Written by hand. `aperiodics docs` never touches this section. -->

Cut and project: a tiling as the shadow of a lattice in higher dimensions.

Take the integer lattice in **n** dimensions. Choose a 2-plane through it — the
*physical* space, the one you will end up looking at. Everything perpendicular to
that plane is *internal* space, which you never see. Now keep only the lattice
points whose internal part falls inside a bounded region, the **window**, and
project what survives onto the plane.

That is the whole construction, and almost every aperiodic tiling is a special
case of it. What makes it worth building as its own module rather than as a
variant of `multigrid` is that the multigrid nails down two of the choices:

* **the plane's orientation.** The multigrid always uses the symmetric one, the
  plane that sees the lattice axes as an even fan. Tilt it and the tiling
  changes character completely — and whether the tilt is rational or irrational
  decides whether the result repeats. Sweeping that one number walks from
  wallpaper to quasicrystal.
* **the window's shape.** The multigrid always uses the shadow of the unit
  hypercube, which is what gives Penrose exactly two rhombs. Any other window is
  a different tiling.

There is a third choice the multigrid does expose, under another name: *where*
the window sits. Translating it in internal space makes the tiling rearrange in
discrete jumps — **phason flips** — which is `--offset` in the multigrid and
`--window-shift` here.

How the points are found
------------------------
The obvious enumeration — take every lattice point in a box and test it — is
exponential in `n` and almost entirely wasted: at n=5 with a modest radius it is
a hundred million candidates for a few thousand hits. Instead the accepted set is
**grown**: start from one accepted point and repeatedly test the neighbours of
what has been accepted so far. The accepted set is connected, so this visits the
output plus its immediate boundary and nothing else. The same approach the 2022
hypercube notebook took, for the same reason.

Faces come from the lattice's own 2-faces: wherever `x`, `x+e_i`, `x+e_j` and
`x+e_i+e_j` are all accepted, that square of the hypercube projects to a rhombus.

References
----------
- N. G. de Bruijn (1981), "Algebraic theory of Penrose's non-periodic tilings",
  Indagationes Mathematicae 43(1), 39-66.
- M. Duneau, A. Katz (1985), "Quasiperiodic patterns", Physical Review Letters
  54, 2688. https://doi.org/10.1103/PhysRevLett.54.2688
- V. Elser (1986), "The diffraction pattern of projected structures",
  Acta Crystallographica A42, 36. https://doi.org/10.1107/S0108767386099932
- M. Baake, U. Grimm (2013), "Aperiodic Order, Volume 1", Cambridge.

## References

<!-- aperiodics:references -->
- N. G. de Bruijn (1981), "[Algebraic theory of Penrose's non-periodic tilings of the plane](https://doi.org/10.1016/1385-7258(81)90017-2)", *Indagationes Mathematicae 43(1), 39-66*.
- M. Duneau, A. Katz (1985), "[Quasiperiodic patterns](https://doi.org/10.1103/PhysRevLett.54.2688)", *Physical Review Letters 54, 2688*.
- V. Elser (1986), "[The diffraction pattern of projected structures](https://doi.org/10.1107/S0108767386099932)", *Acta Crystallographica A42, 36*.
- M. Baake, U. Grimm (2013), "Aperiodic Order, Volume 1: A Mathematical Invitation", *Cambridge University Press*.

**Also worth looking at**

- Greg Egan, "[de Bruijn's algorithm and the projection method, with diagrams](https://www.gregegan.net/APPLETS/12/deBruijnNotes.html)".
- Tilings Encyclopedia, "[Cut-and-project tilings, with the literature](https://tilings.math.uni-bielefeld.de/)".
<!-- /aperiodics:references -->

## Walkthrough

<!-- aperiodics:walkthrough -->
### 1. A lattice seen from the corner

Start with the simplest case there is: the ordinary cubic lattice in **three**
dimensions, and a plane that looks at it straight down the body diagonal.

Every lattice point near that plane gets kept, and each little square face of the
cubes projects to a rhombus. What comes out is the pattern you have seen on
kitchen floors — and if you let your eyes relax it reads as a heap of cubes,
which is exactly what it is: a two-dimensional drawing of a three-dimensional
thing.

Note that it **repeats**. Nothing about projecting from a higher dimension makes
a tiling aperiodic on its own. That comes later, and from somewhere specific.

![A lattice seen from the corner](../../docs/images/project/01.png)

```bash
aperiodics project --dim 3 --radius 13 --render both
```

**faces** 546 · **vertex configurations** 2 · **lattice points kept** 607

### 2. Where the aperiodicity actually comes from

Now four dimensions, then five. The construction has not changed at all — the
same plane through the same kind of lattice, the same rule about which points to
keep — but the results no longer repeat.

The reason is the *angle*. Projecting from three dimensions symmetrically, the
three lattice axes land 60 degrees apart, and 60 divides 360, so the pattern
closes up on itself. From five, the axes land 36 degrees apart in a way that
never closes: the plane's slope relative to the lattice is irrational, and an
irrational slope can never come back to where it started.

So the number of dimensions is not what matters. **The slope is.**

<img src="../../docs/images/project/02.png" width="46%"> <img src="../../docs/images/project/02b.png" width="46%">

*Left:* `aperiodics project --dim 4 --radius 13 --render both`  

*Right: five dimensions, Penrose:* `aperiodics project --radius 13 --render both`

Left — **faces** 560 · **vertex configurations** 6 · **tile shapes** A, B. Right — **faces** 570 · **vertex configurations** 10 · **tile shapes** A, B.

### 3. The window decides which points survive

A point is kept when its *internal* part — everything the plane cannot see —
falls inside a bounded region called the **window**.

The default window is the shadow of the unit hypercube, and it turns out not to
be one choice among many. It is the *only* size that tiles. Measured, at five
dimensions:

| window size | Euler characteristic | what that means |
|---|---|---|
| 0.95 | −89 | holes |
| **1.0** | **1** | a disc: it tiles |
| 1.1 | 571 | faces overlapping |
| 1.3 | 2631 | badly overlapping |

Shrink it much below 0.9 and something else happens: the accepted points stop
being *connected*, and since they are found by walking outward from a seed, the
walk ends immediately. A window smaller than canonical does not give you a
sparser tiling; it gives you rubble.

So the window's *size* is fixed if you want a tiling. Its *position* is not,
which is the next step.

<img src="../../docs/images/project/03.png" width="46%"> <img src="../../docs/images/project/03b.png" width="46%">

*Left:* `aperiodics project --radius 13 --render both`  

*Right: window at 120%, faces overlapping:* `aperiodics project --radius 13 --render both --window-scale 1.2`

Left — **faces** 570 · **lattice points kept** 641. Right — **faces** 2050 · **lattice points kept** 1121.

### 4. Sliding the window: phason flips

Leave everything alone and just move the window sideways through internal space.

Because the lattice points are discrete, nothing happens for a while — and then a
point crosses the window's edge and a small cluster of rhombs rearranges. These
are **phason flips**, and they are the closest thing a quasicrystal has to a
continuous degree of freedom: the tiling is locally different everywhere, but it
is still the same *kind* of tiling, with the same statistics.

This is the multigrid's `--offset` under another name.

<img src="../../docs/images/project/04.png" width="46%"> <img src="../../docs/images/project/04b.png" width="46%">

*Left:* `aperiodics project --radius 13 --render both`  

*Right: window slid a third of the way:* `aperiodics project --radius 13 --render both --window-shift 0.31`

Left — **faces** 570 · **vertex configurations** 10. Right — **faces** 580 · **vertex configurations** 8.

### 5. Tilting the plane

The last thing nailed down is the plane's orientation, and it is the most
interesting one to let go of.

At the symmetric orientation, many pairs of lattice axes project to *congruent*
rhombs — which is why five dimensions gives only two tile shapes rather than the
ten pairs you might expect. Tilt the plane and those coincidences break: each
pair becomes its own shape, and the tiling loses its rotational symmetry while
staying perfectly aperiodic.

Watch the tile-shape count. It is a direct measure of how much symmetry the
orientation still has.

<img src="../../docs/images/project/05.png" width="46%"> <img src="../../docs/images/project/05b.png" width="46%">

*Left:* `aperiodics project --radius 13 --render both`  

*Right: tilted by 0.22 radians:* `aperiodics project --radius 13 --render both --tilt 0.22`

Left — **tile shapes** A, B · **vertex configurations** 10. Right — **tile shapes** A, B, C, D, E, F, G, H, I, J · **vertex configurations** 33.

### 6. Which way to tilt

"Tilt" sounds like one number, and for a while it was. It is not.

The orientations of a 2-plane in n dimensions form a space of their own — the
Grassmannian — and it has **2(n−2)** dimensions: one angle for each internal
direction, for each of the plane's two basis vectors. At five dimensions that is
six independent ways to lean; at eight it is twelve. A single tilt number picks
one of them and leaves the rest untouched.

`--tilt` is now the *distance* travelled, measured as arc length along a
geodesic, and `--tilt-axes` is the direction. Two tilings at the same `--tilt`
in different directions are equally far from symmetric, and look nothing alike.

<img src="../../docs/images/project/06.png" width="46%"> <img src="../../docs/images/project/06b.png" width="46%">

*Left:* `aperiodics project --dim 6 --radius 13 --render both --tilt 0.3 --tilt-axes 1,0,0,0,0,0`  

*Right: same distance, a different direction:* `aperiodics project --dim 6 --radius 13 --render both --tilt 0.3 --tilt-axes 0,1,0.6,0,0.4,1`

Left — **tile shapes** A, B, C, D, E, F, G, H, I, J, K, L, M, N, O · **orientation freedoms** 8. Right — **tile shapes** A, B, C, D, E, F, G, H, I, J, K, L, M, N, O · **orientation freedoms** 8.

### 7. Higher up

Nothing stops at five. Each extra dimension adds another lattice axis, another
direction for rhombs to point in, and another tile shape for every two
dimensions — seven gives three shapes and fourteen-fold symmetry, eight gives
four.

The cost is that the internal space grows too, so the window becomes a polytope
in ever more dimensions and fewer and fewer lattice points survive. That is why
the points are *grown* outward from a seed rather than filtered out of a box: at
eight dimensions a box large enough to hold this patch would have a hundred
million times more points than the answer.

<img src="../../docs/images/project/07.png" width="46%"> <img src="../../docs/images/project/07b.png" width="46%">

*Left:* `aperiodics project --dim 7 --radius 13 --render both`  

*Right: eight dimensions:* `aperiodics project --dim 8 --radius 12 --render both`

Left — **tile shapes** A, B, C · **points kept** 673 · **points tested** 8135. Right — **tile shapes** A, B, C, D · **points kept** 577 · **points tested** 8129.

### 8. A lattice is a choice too

Everything so far has projected the **integer** lattice. It is not the only one.

The simply-laced root lattices — the A, D and E families — come with a plane of
their own: the **Coxeter plane**, on which the whole root system falls into
rings of `h`-fold symmetry. That `h` is the Coxeter number, and it is `n+1` for
A_n, `2n-2` for D_n, and thirty for E8. So A4 gives fivefold symmetry from
*four* dimensions where the integer lattice needed five, and E8 gives thirtyfold
from eight.

Nothing here knows what a Coxeter number is. The code takes a Dynkin diagram,
turns it into a Cartan matrix, takes a Cholesky factor of that to get the simple
roots — legal because a simply-laced root has length-squared two, so the Cartan
matrix *is* the Gram matrix — and multiplies out the reflections. The number
falls out, and a test checks it against all nine known values.

<img src="../../docs/images/project/08.png" width="46%"> <img src="../../docs/images/project/08b.png" width="46%">

*Left:* `aperiodics project --radius 13 --render both --tiles voronoi`  

*Right: E8, thirtyfold, in Voronoi cells:* `aperiodics project --dim 8 --radius 13 --render both --lattice e --tiles voronoi`

Left — **symmetry order** 10 · **tile shapes** A, B, C, D, E. Right — **symmetry order** 30 · **tile shapes** A, B, C, D, E, F, G, H, I.

### 9. Which means the tiles have to come from somewhere else

Projecting the 2-faces of the lattice's unit cell — the rhombs every picture so
far is made of — **only works for the cubic lattice**. That took an afternoon to
establish, because in generator coordinates every lattice is `Z^n`, so the rule
looks as though it should carry over unchanged.

It does not. Measured on A4: 56 interior vertices short of a full turn by 72
degrees and 42 over by the same, the areas balancing exactly while the tiles do
not fit. The reason is that the rule needs the internal space to be the
orthogonal complement in the coordinates where the cells are cubes, and on a
root lattice orthogonality lives in the Cartan metric instead.

So `--tiles` offers two rules that are about the *point set* rather than about
the lattice, and therefore survive the change: **Delaunay**, which triangulates
the points, and **Voronoi**, which gives each point the region closer to it than
to any other. Both tile every lattice in the catalogue. And for the cubic
lattice they are two more tilings of the same familiar points — the Voronoi of a
Penrose vertex set is worth seeing on its own.

<img src="../../docs/images/project/09.png" width="46%"> <img src="../../docs/images/project/09b.png" width="46%">

*Left:* `aperiodics project --radius 13 --render both --tiles delaunay`  

*Right: the same points, as Voronoi cells:* `aperiodics project --radius 13 --render both --tiles voronoi`

Left — **tile shapes** A, B, C, D · **is it a tiling** tiles. Right — **tile shapes** A, B, C, D, E · **is it a tiling** tiles.

### 10. Decorating the tiles

Penrose's tiles were never bare rhombs. Each carried two arcs, and the matching
rule was that the arcs had to join across an edge. Follow them and they close
into curves that wind through the whole tiling and never repeat — which is
arguably more the thing to look at than the rhombs are.

`--motif arcs` draws them, and it is not part of this module: it belongs to any
tiling here, so `multigrid`, `substitution` and `rauzy` all have it too. The arcs
meet at the midpoint of each edge, which the tile on the other side also draws
to, so the curves continue across the whole patch. With `--render none` the
rhombs go away and only the curves are left — and that is the best output this
project makes for a **pen plotter**: long continuous lines instead of tens of
thousands of short shared segments.

<img src="../../docs/images/project/10.png" width="46%"> <img src="../../docs/images/project/10b.png" width="46%">

*Left:* `aperiodics project --radius 16 --motif arcs`  

*Right: the same curves without the tiles underneath:* `aperiodics project --radius 16 --render none --motif arcs`

Left — **tiles decorated** 900. Right — **tiles decorated** 900.

### 11. The pattern is in the choosing

A quadrilateral has four corners. Putting an arc at every one uses each edge
twice, so every joint becomes a four-way crossing rather than a continuation.
Using two **opposite** corners uses each edge exactly once, and the curves flow.

Which pair is a *choice*, once per tile — and that choice is the whole character
of the result. This is Truchet's observation from 1704: the tile is the same
either way, and the pattern lives in the choosing. `--motif-turn` decides how:
by prototile (the closest thing to a matching rule), by a repeatable coin, by
which way the tile faces from the centre, or by a parity of where it sits.

`cross`, `inset` and `rings` need no choice, and unlike `arcs` they do not mind
an odd-sided tile — which matters the moment `--tiles delaunay` starts handing
you triangles.

<img src="../../docs/images/project/11.png" width="46%"> <img src="../../docs/images/project/11b.png" width="46%">

*Left:* `aperiodics project --radius 16 --render none --motif arcs --motif-turn random`  

*Right: sevenfold, crossed instead:* `aperiodics project --dim 7 --radius 16 --render none --motif cross`

Left — **tiles decorated** 900 · **left bare** 0. Right — **tiles decorated** 896 · **left bare** 0.

### 12. Sliding the window differently in different places

Step 4 slid the window by one number. `--phason` makes that number a **field**,
so the window sits somewhere different depending on where in the drawing you
are.

A *linear* field there is the same thing as tilting the plane — that is what
phason strain is — so only a non-linear one goes anywhere new. And unlike the
deformation rules, which move vertices, this rearranges the tiling
*combinatorially*: it stays a genuine tiling as long as the field is gentle.
Measured, `radial` holds to about 0.15 and is in pieces by 0.5.

It is worth being straight about what you get. At gentle settings this is a
**statistical** change rather than a visual one: the point count moves by well
under a percent, because a phason is a rearrangement and not a deformation,
while the census of vertex configurations grows from 11 to 20 — the window
reaches positions the untouched tiling never visits. Push the strength, or turn
`--vertex-marks` on, to see it.

<img src="../../docs/images/project/12.png" width="46%"> <img src="../../docs/images/project/12b.png" width="46%">

*Left:* `aperiodics project --radius 20 --render both`  

*Right: the window sliding outward as you go:* `aperiodics project --radius 20 --render both --phason radial --phason-strength 0.15`

Left — **vertex configurations** 11 · **lattice points kept** 1541 · **is it a tiling** tiles. Right — **vertex configurations** 14 · **lattice points kept** 1540 · **is it a tiling** tiles.

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
| `--dim` | int | `5` | lattice dimension: 3 gives lozenges, 4 Ammann-Beenker, 5 Penrose, and on upward. For --lattice e it picks which exceptional one, so 6, 7 or 8 — usually 3…8 |
| `--radius` | float | `18.0` | extent of the patch (edge lengths) — usually 3…90 |
| `--edge` | float | `6.0` | rhomb edge length (mm) — usually 0.5…50 |
| `--tilt` | float | `0.0` | how far to move the plane from the symmetric one, as arc length along a geodesic. Zero is exactly symmetric. This is the dial from periodic to quasiperiodic, and it pulls congruent rhombs apart (radians) — usually 0…1.571 |
| `--tilt-axes` | str | `''` | which way to lean: blank for the first internal direction, 'random' for a direction drawn by --seed, 'spread' for all of them equally, or explicit weights like '1,0,0.5' |
| `--lattice` | str | `'cubic'` | which lattice to project from. The root lattices use their Coxeter plane, so the symmetry order is the Coxeter number: n+1 for A, 2n-2 for D, and 30 for E8. Anything but cubic needs --tiles delaunay or voronoi — one of `cubic`, `a`, `d`, `e` |
| `--tiles` | str | `'faces'` | how to turn the accepted points into tiles. 'faces' is the classical rhombs and only tiles for the cubic lattice; the other two are rules about a point set and work for any of them — one of `faces`, `delaunay`, `voronoi` |
| `--window` | str | `'canonical'` | the region of internal space a point must land in — one of `canonical`, `disc`, `box` |
| `--window-scale` | float | `1.0` | its size. 1.0 is the only value that tiles: below it leaves holes, above it makes faces overlap. Interesting as line work, not as a tiling — usually 0.9…1.6 |
| `--window-shift` | float | `0.0` | slide the window through internal space. Small moves rearrange the tiling in discrete jumps — phason flips — usually 0…1 |
| `--phason` | str | `''` | a field name, to make --window-shift vary across the drawing instead of being one number. The tiling rearranges by flips as you move, and stays a tiling while the field is gentle — measured, it holds to about 0.2 and starts folding after that |
| `--phason-strength` | float | `0.3` | how far the window swings, in the same units as --window-shift — usually 0…1.5 |
| `--window-axes` | str | `''` | which way to slide it, by the same convention as --tilt-axes |
| `--render` | str | `'edges'` | what to draw. 'none' leaves the tiling to whatever --motif puts on it — one of `edges`, `faces`, `both`, `none` |
| `--dense` | bool | `False` | hairline low-opacity style, for dense line work |
| `--label` | bool | `True` | classify vertex stars and report them |
<!-- /aperiodics:params -->

## Gallery

<!-- aperiodics:gallery -->
### project-a6-delaunay-ad6f9b17

![project-a6-delaunay-ad6f9b17](../../examples/project-a6-delaunay-ad6f9b17.png)

```bash
aperiodics project --dim 6 --lattice a --tiles delaunay
```

3514 faces, 357 vertex types.

### project-e8-voronoi-499eb7e2

![project-e8-voronoi-499eb7e2](../../examples/project-e8-voronoi-499eb7e2.png)

```bash
aperiodics project --dim 8 --lattice e --palette night --radius 22 --render faces --tiles voronoi
```

7775 faces, 356 vertex types.

### project-lozenges-ca072cd1

![project-lozenges-ca072cd1](../../examples/project-lozenges-ca072cd1.png)

```bash
aperiodics project --dim 3 --radius 16 --render both
```

864 faces, 2 vertex types.

### project-penrose-by-window-49012f8d

![project-penrose-by-window-49012f8d](../../examples/project-penrose-by-window-49012f8d.png)

```bash
aperiodics project --radius 20 --render both --window-axes 0,0,1 --window-shift 0.55
```

1445 faces, 7 vertex types.

### project-penrose-projected-ff7938fd

![project-penrose-projected-ff7938fd](../../examples/project-penrose-projected-ff7938fd.png)

```bash
aperiodics project --radius 16 --render both
```

900 faces, 10 vertex types.

### project-penrose-voronoi-836d7f8f

![project-penrose-voronoi-836d7f8f](../../examples/project-penrose-voronoi-836d7f8f.png)

```bash
aperiodics project --palette dusk --radius 22 --render both --tiles voronoi
```

1741 faces, 9 vertex types.

### project-phason-field-f7d373cf

![project-phason-field-f7d373cf](../../examples/project-phason-field-f7d373cf.png)

```bash
aperiodics project --palette earth --phason ripple --phason-strength 0.22 --radius 26 --render faces
```

2456 faces, 31 vertex types.

### project-sevenfold-cross-00defdd5

![project-sevenfold-cross-00defdd5](../../examples/project-sevenfold-cross-00defdd5.png)

```bash
aperiodics project --dim 7 --motif cross --radius 24 --render none
```

2128 faces, 28 vertex types.

### project-sevenfold-projected-b9ded3f4

![project-sevenfold-projected-b9ded3f4](../../examples/project-sevenfold-projected-b9ded3f4.png)

```bash
aperiodics project --dim 7 --radius 14 --render both
```

700 faces, 18 vertex types.

### project-tilt-direction-a4258900

![project-tilt-direction-a4258900](../../examples/project-tilt-direction-a4258900.png)

```bash
aperiodics project --dim 6 --radius 13 --render both --tilt 0.3 --tilt-axes 0,1,0.6,0,0.4,1
```

612 faces, 89 vertex types.

### project-tilted-e36d032d

![project-tilted-e36d032d](../../examples/project-tilted-e36d032d.png)

```bash
aperiodics project --radius 14 --render both --tilt 0.22
```

624 faces, 34 vertex types.

<!-- /aperiodics:gallery -->
