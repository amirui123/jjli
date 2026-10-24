# aperiodics

A workbench for exploring mathematical constructions and turning them into
things — plotter drawings, screen prints, CNC cuts, and eventually layers on the
surfaces of 3-D models.

> **Note**: this codebase is largely written by Claude; read it with that in
> mind. MIT licensed.

![Penrose P3](examples/multigrid-penrose-af560cea.png)

![12-fold quasicrystal](examples/multigrid-twelvefold-d49f17f0.png)

![Tribonacci Rauzy fractal](examples/rauzy-tribonacci-86021032.png)

![Penrose's arcs](examples/multigrid-penrose-arcs-248975ad.png)

Successor to the `CNCExplorations/ca` experiments, which are left untouched as
reference. See **[docs/PLAN.md](docs/PLAN.md)** for the design and the reasoning.

## Quick start

```bash
uv run aperiodics multigrid --n 5 --alternate --offset 0.2 --radius 20
```

```bash
uv run aperiodics list multigrid
```

Every run writes two files:

```
output/2026-09-08/multigrid-19d09368.svg
output/2026-09-08/multigrid-19d09368.json
```

The hash is of the parameters, so identical parameters land on the identical
name — re-running is idempotent, and nothing silently collides. The JSON records
every parameter with defaults filled in, the seed, the git commit, and the
verbatim command line, so any output can be reproduced or picked apart later.

## Commands

| command | what it does |
|---|---|
| `aperiodics <sketch> [opts]` | generate; writes SVG plus a run record |
| `aperiodics list [sketch]` | available sketches, or one sketch's parameters |
| `aperiodics replay <run>` | reproduce a recorded run exactly |
| `aperiodics vary <run> n=7` | branch from a run, changing some parameters |
| `aperiodics sweep <sketch> weight=0:4:12` | cartesian product, one file each |
| `aperiodics index` | contact sheet of every run, filterable |
| `aperiodics keep <run> --name x` | promote a keeper to `designs/` |
| `aperiodics plot <run\|file>` | send it to the plotter in `.env` (`--info` to ask which) |
| `aperiodics rules list\|show\|export` | rulesets — what a vertex does |
| `aperiodics fields` | fields — the shape of a deformation |
| `aperiodics serve` | local web GUI: sliders and a live SVG pane |
| `aperiodics gui <sketch>` | write a vsketch wrapper (weaker; no fills) |
| `aperiodics docs [sketch]` | regenerate module documentation |

A run can be named by its `.json`, its `.svg`, or just its hash.

Shared flags: `--out`, `--name`, `--png`, `--simplify [PIPELINE]`, `-v`.

## Modules

| module | what |
|---|---|
| [multigrid](docs/modules/multigrid.md) | de Bruijn multigrid — quasiperiodic rhombic tilings of any symmetry. `--n 4` is Ammann–Beenker, `--n 5` is Penrose P3 |
| [project](docs/modules/project.md) | **cut and project** — a tiling as the shadow of an n-dimensional lattice on a plane. Four free choices: the lattice (`cubic`, or the A/D/E root lattices on their Coxeter planes — thirtyfold from E8), the plane's orientation (a whole space, Gr(2,n), dimension 2(n−2)), the window's shape and its position. Three ways to turn the points into tiles: rhombs, Delaunay, Voronoi. Start with its [walkthrough](docs/modules/project.md#walkthrough) |
| [substitution](docs/modules/substitution.md) | recursive inflation, with **selective detail** — subdivide only near the centre, only near the rim, or at random, so the tiling is finer in some places than others. Penrose P3 and the chair |
| [rauzy](docs/modules/rauzy.md) | **Rauzy fractals** — the acceptance window a substitution implies, which is almost never a polygon. `project` picks a window and asks what tiling falls out; this picks a substitution and asks what window it needs. Drawn as an exact tiling of rhombi, so it is line work rather than pixels. Start with its [walkthrough](docs/modules/rauzy.md#walkthrough) |

Penrose P3 comes out of the first three independently, which makes them a check
on each other: multigrid and substitution are required to agree on the exact set
of seven vertex configurations, and the projection to reach the same golden tile
ratio from a different construction entirely.

`rauzy` closes the loop from the other side. A substitution tiling and a
cut-and-project tiling looked like different subjects for thirty years; the
Rauzy fractal is the object that says they are not.

Modules with a **walkthrough** have a generated step-by-step explainer — prose,
a picture, and the command that made it — where every image comes from actually
running the step, so the two cannot drift apart:

```bash
uv run aperiodics walkthrough project
```

More to come — Ammann–Beenker and the Hat/Spectre monotiles as substitutions,
circle packings and inversive geometry, hyperbolic tilings, parametric curves,
plane-wave interference. See [docs/PLAN.md](docs/PLAN.md) §3.

## Exploring

Sweeps are the tool for finding where a parameter gets interesting, then the
index is how you find it again:

```bash
uv run aperiodics sweep multigrid weight=0:4:12 --n 5 --alternate --offset 0.2 --toward rhomb-36 --dense --png
```

```bash
uv run aperiodics index && open output/index.html
```

Deformation amounts are in **median edge lengths**, so the same `--weight` means
the same thing at any scale or radius. Nothing is clamped: past about 1 the
faces start crossing, and past 3 or so the tiling dissolves into the jumble of
overlapping line work that is half the point.

## Deformation

Deformation splits in two, and the two halves are genuinely independent:

- a **Field** carries the *shape* — where the deformation is strong and where it
  is weak — as a pure function of position. It knows nothing about tilings.
- a **Ruleset** says what a vertex *does* with the value it finds there: which
  way it moves, whether it moves at all, how the value is scaled on the way in.

`--strength` and `--shake` belong to neither: strength is the magnitude of the
whole deformation, shake an independent random displacement.

There is exactly **one field**. A rule chooses which *aspect* of it to read —
the value, or the slope — and which direction to take from it.

A direction is a **base** plus an **angle**, not a name from a list:

| base | measured from |
|---|---|
| `local` | the vertex's own frame — the tile that starts its canonical star |
| `radial` | the outward radius; 90° gives what `transverse` used to |
| `absolute` | a compass bearing, the same everywhere |
| `gradient` | the field's uphill direction; 90° follows a contour |

Four bases replaced eight named directions that were mostly the same thing at an
offset, and say things none of them could — 45° off the gradient, or a different
bearing for each vertex configuration.

The `local` base is the important one. Every instance of a configuration sits at
a different orientation, so an angle needs a reference that rotates with it: the
frame points at the tile that starts the canonical star, which is the same
prototile at every instance. Mirrored instances count the other way, so a mirror
image behaves as a mirror image.

A star usually has **more than one** equally-canonical frame — one per symmetry
it has — and the direction is their average. That is the only choice that
behaves the same however the drawing is turned, and it lands on the right
answers by itself: five identical tiles round a point give five frames that
cancel, so such a vertex does not move; a star with a mirror keeps only what
lies along the mirror, shrinking smoothly to nothing as the angle turns square
to it; and a boundary vertex, having no complete star, has no frame and stays
put. The upshot is that a fivefold tiling with a uniform field comes out
fivefold, to floating point.

**A ruleset never names a field.** So any of the nine rulesets pairs with any of
the twelve fields, and swapping one does not touch the other:

```bash
uv run aperiodics rules list && uv run aperiodics fields
```

**Coming from the old `ca` code?** `PenroseTransformer` moved each vertex toward
the mean centre of its attached *thin rhombs* — a different direction at every
configuration, which is why no single global direction reproduces it. Open the
rule designer with a `local` rule and press **aim at A**: that computes the angle
to the mean centre of the A tiles for each configuration, and reproduces the
original exactly (verified to 1e-15 against the old structural direction). Then
pair it with `--field flat` for the old constant weight, `radial` for `circular`,
`ripple` for `circular_ripple`, `sweep-y` for `sweep`.

```bash
uv run aperiodics multigrid --n 5 --alternate --offset 0.2 --rules curl --field ripple --field-freq 4 --strength 1.3
```

```bash
uv run aperiodics multigrid --n 5 --alternate --offset 0.2 --rules curl --field waves --field-fold 7 --strength 1.3
```

Fields are **normalised**, and take frequencies in cycles across the tiling
rather than in mm, so `--strength` is the single magnitude control and a field
means the same thing on a 40 mm patch and a 400 mm one. Shape them with
`--field-freq`, `--field-phase`, `--field-angle`, `--field-fold`, `--field-power`.

### Composite fields

A field can be a **stack** of layers, each a preset with its own parameters and
a mode saying how it joins what is below: `add`, `multiply` (mask), `max`, `min`,
`replace`. The result is renormalised, so four layers are not four times as
strong as one.

```bash
uv run aperiodics fields
```

```bash
uv run aperiodics multigrid --rules push --field rough-waves --strength 1.5
```

`--field` takes a preset name, a built-in stack, a JSON path, or inline JSON.

**Edit field…** opens the editor: one column per layer, read left to right,
ending in the result. Each column leads with the **running stack** — what the
field looks like at that point, which is what you are actually reading — with the
layer's own contribution as the smaller picture below. The combining operator
sits in the **gutter between** the two columns it joins, alongside the button
that inserts a layer there.

Controls are per layer *type*. A preset declares which parameters it responds to,
so a control that does nothing is never shown: a plane `wave` has phase but no
centre offset, because offsetting one along its travel is exactly a phase shift
and across it is nothing at all. A `ripple` has both — offset moves the centre,
phase moves the rings.

**Normalisation is a checkbox**, per layer and for the result, because the
extreme version is often the point and clamping it silently would hide the
answer.

Previews are PNGs. `signed` colours 0 black, +1 red, −1 blue on the true scale,
with a green tinge where the field runs past 1 — so an out-of-range field looks
out of range. `grey` stretches whatever range is there, which shows faint
structure but cannot tell a mild field from an extreme one.

In the drawing pane, **field: off / grey / colour** lays the same picture behind
the tiling. It is a *view* of the drawing rather than a different drawing, so
switching costs no re-render — the image is inserted into the live SVG and pans
and zooms with everything else. For export, `--show-field colour` embeds it as a
single `<image>`; `--show-field contours` gives plotter-ready isolines instead.

In the main panel the field is a dropdown of presets and stacks with a
thumbnail of the current one beside it, an **Edit field…** button, and the two
controls that scale it: `strength` and `noise`. The per-layer shaping parameters
live in the editor, attached to the layers they belong to — repeating them here
would be a second place to change the same thing.

Two noise fields: `noise` is smooth and multi-octave (`--field-fold` sets the
octaves), `white` is uncorrelated grain — not much use alone, but good multiplied
into something too clean. Both are functions of position, so the same vertex gets
the same value on every render.

`--show-field contours|grid|colour` draws the field behind the drawing, so you can see the shape rather than infer it from the result. Contours
come from contourpy and are plotter-ready line work; bands are a printable or
cuttable stack.

Rulesets are Python **or** JSON. Export one, edit it, use it:

```bash
uv run aperiodics rules export curl --out mine.json
```

```json
{
  "name": "mine",
  "rules": [
    {"direction": "radial", "gain": 0.7},
    {"direction": "toward", "tag": "A", "gain": 0.5,
     "per_type": {"5xB": 3.0, "*": 0.4}}
  ]
}
```

### Seeing what you are selecting

Writing a `--per-type` table means knowing what configurations a tiling has.
`--vertex-key` draws each one as the actual fan of tiles around a representative
vertex, labelled with its name and count, with an **arrow showing where it moves**
under the current ruleset; `--vertex-marks` puts a matching coloured dot on every
vertex so the distribution is visible in place. The key is drawn from the
*undeformed* tiling — it shows what a configuration is and where it goes, not
where it ended up.

In the GUI the **rule designer** is the only rule editor — the left pane just
has a button that opens it. A tab per rule with sliders for direction, what it
reads, gain, bias, power and angle; and every configuration drawn with its vertex
*actually displaced*, ghosted outline showing where it was. Tick to say the rule
applies there, or *select all* / *none*.

For a `local` rule the pictures grow **snap points** — every tile centre and
corner — each carrying the angle it corresponds to in that configuration's frame,
so aiming one is a click rather than a number.

Curve shaping — gain, bias, power — has its own section with a live plot of the
response, since a picture of `bias + gain × sign(v)|v|^power` beats three
numbers. A preview-strength slider exaggerates the pictures without touching the
drawing.

It edits the ordinary `rules` and `per_type` parameters, so every state replays
from the CLI. `--per-type "ABABB=1@45,BBBBB=0,*=0.5"` — the number after `@` is
the offset from that configuration's frame.

Only a **structural** rule can be blocked outright. `toward`/`away` aim at a
neighbouring tile of a given kind, so a vertex with none of that kind cannot move
under them however it is weighted — the five-fat-rhomb vertex under `gather`, for
instance. Every geometric direction (`radial`, `transverse`, `fixed`, `normal`)
moves it perfectly well. The key says which of the three is happening: nothing of
this kind moves, the field is zero here, or this particular vertex sits at a
still point while others of its kind do move.

```bash
uv run aperiodics multigrid --n 5 --alternate --offset 0.2 --render both --vertex-marks --vertex-key
```

In `--per-type`, a value written `~other` means *behave like that type* rather
than repeating its number — with a dozen configurations, saying which ones go
together is most of the work, and duplicated numbers are how that drifts:

```bash
uv run aperiodics multigrid --n 5 --alternate --offset 0.2 --rules gather --field radial --per-type "5xB=0,2xA+1xB=~1xA+2xB,*=1.5"
```

`--palette "A=#e8623c,B=#3c6ee8,edges=#111111"` overrides any layer's colour.

### Naming things stably

**Prototiles are declared, not derived.** Each tiling states what it is made of,
with positional ids — for rhombic tilings, ascending acute angle, so `A` is
always the thinnest. A 7-fold multigrid used to emit `rhomb-25.7143`, a float
rendering masquerading as a name.

```bash
uv run aperiodics list multigrid
```

A star with **rotational symmetry** — `AAAAA`, five identical tiles round a
point — has no orientation of its own, so a `local` rule cannot move it at *any*
angle: its five frames point five ways and cancel however much you turn them.
That is a **constraint**, not a default you can override, and the rule designer
locks those cards rather than offering a weight that would do nothing.

A star with only a **mirror** is a different matter and stays settable. It moves
fully along its mirror line and not at all across it, so the angle is the
control — the card shows what fraction is getting through, and turning the
offset onto the mirror brings it back to 100%. On a Penrose tiling `ABBB` is
full at 0° and nothing at 90°; `AABAABB` is exactly the other way round.

**Vertex configurations are named by the tiles round them, in order**: `ABBB` is
a vertex where an `A` and three `B`s meet in that cyclic order, canonicalised
over rotation and reflection. The name means the same on any tiling at any
radius, and it fixes the starting point that a per-configuration angle is
measured from — so name and frame agree by construction.

Counts (`1xA+3xB`) are reported but not used as names: they are **lossy**.
`A.B.C.C` and `A.C.B.C` are different stars with the same counts, and a 7-fold
multigrid has four such collisions where Penrose happens to have none.

Amounts are in **median edge lengths**. Nothing is clamped: past about 1 the
faces start crossing, past 3 or so the tiling dissolves into the jumble of
overlapping line work that is half the point.

## The GUI

```bash
uv run aperiodics serve
```

A local web GUI: controls on the left, a live SVG pane on the right, rendering
in tens of milliseconds.

Two toolbars, doing two different jobs. The one across the top is about
**getting the drawing out** — Save, Save view, Send, Send view, Copy command,
JSON — and nothing else. **Save** writes through the normal run pipeline, so a
GUI run and a CLI run are indistinguishable afterwards; **Copy command** gives
you the equivalent command line.

Everything about *looking* at the drawing is behind the **⚙** at the bottom
right of the pane: Render and live, zoom, line weight, the field backdrop, the
vertex key, the layer list, and the status line at the bottom of it. It is shut
by default, and the cog grows a warning dot when the last render stopped being
a tiling — so the one thing worth knowing with the panel closed is not hidden by
closing it.

The sidebar follows the model: **construction** first — the sketch selector sits
inside it, since it decides what the construction parameters even are, with
**docs** beside it because that is what the docs are about — then
**deformation**, split into *rules — what vertices do* and *field — the shape*,
then **output** and **colours**.

**JSON** is not read-only. Paste a whole run record, a `{"sketch": …, "params":
…}`, or a bare object of parameters, and the controls follow — filling in the
defaults you left out, and saying which parameters the construction does not
have rather than letting the server reject the lot with no clue which one.

Rulesets are a dropdown (with *custom* for an edited one). Colour swatches come
from the **construction** — its prototiles, its edges, its vertex configurations
— so the list stays put as you toggle render modes; ones not currently drawn are
dimmed but keep their setting.

Every control has a way back to its default: the `↺` beside it, or a
double-click on a slider. It is dimmed when you are already there, so it also
reads as *which of these have I moved*. Some sliders have one value that lines
up — `window_scale` at 1, `tilt` at 0 — and at slider resolution finding it by
hand is not always even possible.

Parameters that are directions rather than numbers — which way to tilt the
projection plane, which way to slide the window — get a slider per component,
plus the named shorthands. The schema says how many components there are (an
arithmetic on another parameter: the orientations of a 2-plane in *n* dimensions
form a space of dimension 2(n−2)), so the panel draws the right number without
knowing what they mean. Under a named mode it shows what that mode resolved to,
which is the only way to see what `random` picked.

The status line sits **over** the drawing rather than in the toolbar: its width
changes with every render, and in the toolbar that wrapped the row, shortened
the stage and made the whole image jump on each keystroke.

Zoom moves the SVG's own **viewBox**, so it re-renders the vectors at every
scale and stays sharp however far in you go. Drag to pan, pinch or ctrl+wheel to
zoom about the pointer, double-click to fit. **thin lines** switches whether
strokes magnify with the drawing (like magnified paper) or stay a constant width
on screen (like CAD zoom) — the latter is what you want for dense line work.

**Docs** shows the module's markdown, converted server-side. Markdown stays the
source, so there is one copy of each document and no build step.

There is a **rule editor** under the rules field: add, reorder and delete rules,
set each one's direction, gain, bias and power, and give per-type tables. Naming
a built-in and then editing it expands it into your own ruleset. It writes inline
JSON into the `rules` parameter, so the setup document stays `{sketch, params}`
and replays like any other run — which means the CLI takes it too:

```bash
uv run aperiodics multigrid --rules '{"rules":[{"direction":"radial","gain":0.6},{"direction":"toward","tag":"A","gain":0.8}]}' --field ripple --strength 1.2
```

Where one sketch hosts several constructions with their own vocabularies — a
substitution system's seeds, say — the GUI offers only what applies, and the CLI
says so plainly rather than failing obscurely.

Three things make it small:

- **The browser is the SVG renderer.** Filled polygons, strokes, opacity, zoom,
  at the exact fidelity of the output format. No Python toolkit comes close, and
  fills were the specific thing vsketch could not do.
- **The UI writes itself.** `/api/schema` serves the sketches' own `param()`
  declarations plus the ruleset and field descriptions, and the page builds the
  form from that. A new parameter, field or ruleset appears in the GUI with no
  GUI work — the same property that gives us CLI flags for free.
- **No new save format.** A setup document is `{sketch, params}`, which is what
  every run record already contains. The GUI's state, the save file, and
  `aperiodics replay` are the same object.

Dependencies: none. `http.server` from the stdlib and one self-contained HTML
file — no npm, no framework, no CDN. It binds to localhost only.

Not done client-side: the maths is numpy, scipy and shapely, so a serverless
page would mean tens of megabytes of Pyodide and would cut the GUI off from the
provenance pipeline. Not streaming yet either — request/response is already
interactive at these speeds, and server-sent events would be a change of
transport, not of architecture.

### vsketch

There is also a vsketch adapter (`aperiodics gui <sketch>`, then `vsk run`), kept
because it plugs into an existing plotter workflow. It is the weaker option:
vsketch is polyline-only so every arc flattens, and it cannot do filled
polygons at all. Needs the `gui` extra.

## Motifs

Penrose's tiles were never bare rhombs. Each carried two arcs, and the matching
rule was that the arcs had to join across an edge; follow them and they close
into curves that wind through the whole tiling and never repeat.

```bash
uv run aperiodics multigrid --n 5 --alternate --radius 26 --render none --motif arcs
```

`--motif` draws a mark inside every tile in that tile's own frame, so it belongs
to *every* module and inherits any deformation the tiling has had. `arcs` is
Penrose's; `chords` is the same pairing drawn straight; `cross` joins opposite
edge points through the middle; `inset` and `rings` nest smaller copies.

`--render none` takes the tiles away and leaves only the marks, which is the
best thing here for a **pen plotter**: long continuous curves instead of tens of
thousands of short shared segments.

An arc runs between points partway along two edges that share a corner, and at
the default `--motif-reach 0.5` it ends exactly on the midpoint — where the tile
on the other side also ends one. That is why the curves continue. Putting an arc
at *every* corner of a quadrilateral would use each edge twice and turn every
joint into a four-way crossing, so only two opposite corners are used — and
**which** pair is a choice, once per tile. That choice is the whole character of
the result, which is Truchet's observation from 1704: the tile is the same
either way, and the pattern lives in the choosing. `--motif-turn` decides how —
by prototile, by a repeatable coin, by which way the tile faces, or by a parity
of where it sits.

Odd-sided tiles have no pairing of their edges at all, so `arcs` and `chords`
leave them bare and say how many. `cross`, `inset` and `rings` do not mind.

## Layers

Every layer in the SVG carries its own name:

```xml
<g id="lines" data-group="lines" inkscape:label="lines">
  <g id="layer-edges" data-layer="edges" inkscape:label="edges" ...>
```

The id comes from the name rather than the position, so `layer-motif-A` is the
same element in every render it appears in — addressable from a stylesheet, from
Inkscape, or from a script. Tile layers also carry `data-tag`.

`--hide edges,motif-B` leaves layers out of the file, and **the framing does not
move when one goes**: the bounds are still the whole drawing's. That is what
lets the GUI's `layers` button turn one off with a line of CSS instead of a
round trip — the layer is already in the page, so it is instant, and what you
see is pixel-for-pixel the file you would get. Click a group heading to toggle
all of it. Whatever you leave off is left out of the saved file too, because the
toggle writes the `hide` parameter rather than only changing the view.

## Sending to a plotter

If a plotter on the network speaks the Drawbot upload API, tell `aperiodics`
where it is and the GUI grows **Send** and **Send view** beside Save and Save
view:

```bash
cp .env.example .env      # then put your plotter's address in it
uv run aperiodics plot --info
```

```
PLOTTER_URL=http://drawbot.local:5000
PLOTTER_TOKEN=            # only if the plotter has one set
```

No `PLOTTER_URL`, no Send buttons — not greyed-out ones, none at all. A plotter
that is merely *switched off* keeps its buttons, because the fix for that is to
switch it on rather than to edit a file; the badge in the toolbar says which
machine it is, and warns when it did not answer.

Sending does not start plotting. The drawing lands in the plotter's library and
somebody looks at it, places it and presses Plot — which is what makes Send a
fire-and-forget button rather than a conversation about whether the machine is
busy. It also does not write anything locally: sending is not archiving, and a
drawing you are trying out should not quietly fill `output/`.

From the command line, on a file or on any archived run:

```bash
uv run aperiodics plot output/2026-09-11/multigrid-penrose-arcs-c270915a.svg
```

**One thing it does quietly.** The API warns that arcs inside a transformed
group sometimes convert imperfectly, and every file here is one when a motif is
on — the content sits under `scale(1,-1)` and an arc on a rhombus is an exact
`A` command. So what goes over the wire has its arcs re-emitted as cubic
Béziers, accurate to 4 parts in a million of the radius. The file on disk keeps
its arcs, because that is the archival master and every other reader handles
them.

## Saving what you are looking at

**Save view** writes the visible rectangle: the page becomes what is on screen,
and anything wholly off it is left out of the file. Zoomed into a rosette, that
took one drawing from 194 KB to 24 KB.

It is recorded as a parameter, so the same file comes back from the command
line:

```bash
uv run aperiodics multigrid --radius 12 --motif arcs --crop=-20,-20,20,20
```

`--crop` is `xmin,ymin,xmax,ymax` in mm, in the **drawing's** coordinates —
y up, origin in the middle — not the file's viewBox, which is y-down and offset
by the flip. The GUI converts. (Note the `=`: argparse reads a leading minus as
a flag otherwise.)

Items *crossing* the edge are kept whole rather than clipped, so tiles bleed off
the page, which is what a cropped drawing looks like anyway. If you need a true
clip, `--simplify` puts vpype on the end and `vpype crop` will do it exactly.

A crop that lands nowhere near the drawing says so rather than writing a valid,
empty, entirely silent file.

## Colour

Every module draws from one palette, chosen by name:

```bash
uv run aperiodics project --dim 7 --render faces --palette night
uv run aperiodics multigrid --n 7 --render faces --palette spectrum --saturation 1.4
```

A palette is a background, an ink, and a run of tile colours. Some are
**designed sets** — `paper`, `mono`, `slate`, `riso`, `earth`, `dusk`, `night`,
`neon` — and some are **generated**, sampling hue space by a rule: `spectrum`
spreads evenly round the wheel, `golden` steps by the golden angle so no two
hues are close however many you take, and `analogous`, `complement` and `ramp`
do what they say. Either kind is asked for *n* colours and always answers with
*n*: a designed set interpolates between its entries rather than repeating them,
so a nine-prototile tiling gets nine distinguishable colours from a set of five.

`--hue`, `--saturation`, `--brightness` and `--alpha` post-process whatever came
out, so those four mean the same thing for a designed palette and a generated
one. Alpha **multiplies**, so a swatch already set half transparent stays half
as opaque as its neighbours as the master comes down. Overlapping tiles start
showing through each other, which is worth having in the jumble regime.

Alpha rides inside a colour — `--palette "riso,A=#e8623c60"` — so an override is
one value in the JSON, on the command line and in a swatch. It is split apart
again at the last moment, into a plain colour and a `fill-opacity`: an
eight-digit hex is CSS Color 4 and not every SVG reader has caught up, least of
all the ones inside plotters. A colour nobody has made transparent keeps the
six-digit form it always had.

In the GUI the master is a slider with the other three, and each swatch has a
short opacity slider of its own. The swatch shows *its* alpha, not the product,
so moving one while the master sits at 0.4 does not square it.

`--palette` also carries per-layer overrides, and both halves can appear at
once — `--palette "dusk,edges=#111111"`. In the GUI the scheme is a dropdown at
the top of the **colours** block and the overrides are the swatches under it;
changing the scheme clears the overrides, because keeping them is exactly the
clash between the two ways of setting a colour.

`--background` is `auto` (the palette's own page colour), `none`, or a colour.
Most palettes have no page colour, so the default output stays transparent —
which matters, because a background is a rectangle and a plotter handed one
draws it right round the edge of the piece.

## Is it a tiling?

Every render answers this, from three O(n) structural tests:

- **Euler characteristic** `V − E + F`. A patch covering a simply connected
  region is a disc, so `χ = 1`. Holes push it below, stacked faces above.
- **Angle sum** at interior vertices: tiles round a point must close up to 360°.
- **Edge multiplicity**: an interior edge is shared by exactly two faces.

They are complementary rather than redundant — a hole leaves every angle sum
intact, because the rim of the hole is boundary, and only `χ` sees it. Together
they caught a chair substitution that double-covered one cell, a Penrose seed
fanned the wrong way round, and a projection whose rhombs had no area.

The reading is descriptive, not a pass mark: pushing a tiling past the point
where it is one is half of what this is for, so the GUI's status line says
*what* stopped holding — `969 folded vertices, worst 324°` — rather than that
something went wrong.

## Output

SVG is the primary format and the archival master. Circles stay `<circle>` and
arcs stay arc commands — nothing is flattened to polylines unless asked. Layers
are the unit of separation: one per pen on a plotter, one per screen in a print.

Layers are nested in **groups** — `tiles`, `lines`, `notes`, `field` — so an
editor can hide all the fills and keep the line work, while each tile type is
still its own layer inside `tiles`. Groups follow runs of layers rather than
gathering them by name, because SVG paints in document order and collecting
scattered layers into one group would silently restack the drawing.

`--simplify` runs a vpype pipeline (`linemerge linesort reloop` by default) into
a **sibling** file, always keeping the exact original, because vpype flattens
every curve and strips the embedded provenance. It is a terminal export, never a
working step.

## Folders

- `output/` — git-ignored scratch; everything lands here
- `designs/` — git-ignored keepers, via `aperiodics keep`
- `examples/` — shipped, in-repo, and the source of the module galleries
- `docs/modules/` — per-module maths, references, parameters and gallery

## Development

```bash
uv run pytest
```

Optional extras: `shapes` (shapely), `contour` (contourpy), `graph` (networkx),
`raster` (cairosvg — needs `brew install cairo`), `gui` (vsketch), or `all`.
