# 13 — Sprint 4

## Theme: not one shape, but a family

> **There isn't one einstein. There are infinitely many, and one slider walks
> through them.**

This is the last genuinely surprising fact left on the table, and
[07](07-scope.md) already decided it belongs — it was deferred as enrichment,
not cut:

> *The continuum stays in despite being the most abstract idea, because "there
> are infinitely many of these" is a genuinely surprising ending and it's
> carried entirely by one slider — near-zero prose cost.*

The piece currently ends on "nobody has a reason." That is a good ending. This
puts one more turn before it: the shape you have been looking at is a single
point on a continuous family, and every point on it works.

## Feasibility, checked before planning

Measured rather than assumed, because it determines the whole sprint shape.

**The hat's 14 edges use exactly two lengths** — ½ and √3/2, ratio exactly √3,
which is the `Tile(1, √3)` of the literature at half scale. Eight short, six
long. (Thirteen vertices, fourteen edges: one vertex is a straight 180°, and
that edge splits into two short ones.)

**The unit vectors of the short edges sum to zero. So do the long ones —
independently.** Which means the polygon closes for *any* (a, b), with no
constraint linking them. The family is free:

| | a | b | area |
| --- | --- | --- | --- |
| hat | ½ | √3/2 | 3.46 |
| turtle | √3/2 | ½ | 4.33 |
| `Tile(1,1)` | equal | equal | 4.02 |
| chevron | ½ | 0 | 0.87 |
| comet | 0 | ½ | 0.43 |

All five close to (0, 0) to nine decimal places.

**Consequence for the engine.** A deformed tiling is *not* on the
half-Eisenstein lattice, so the exact arithmetic that everything else rests on
does not extend to it. That is fine — this scene needs no adjacency, overlap or
matching, only positions to draw — but it must be a separate float path rather
than a change to `patch.ts`. The exactness boundary stays where it is.

## Tickets

### D1. The deformation — **L** — ✅ done

`src/engine/continuum.ts`. The 14-edge outline is derived by reinstating the
straight vertex, and a patch is deformed by breadth-first walk over shared
lattice vertices.

**The test that matters is not area — it is agreement.** Congruent tiles prove
nothing about whether the tiling survived; two tiles disagreeing about where a
shared vertex went would mean a torn gap or a forced overlap. Measured across
six members of the family including near-degenerate ones: **1,222 shared-vertex
incidences, worst disagreement 1.1e-14.** That is also the empirical form of the
path-independence argument — the walk's route cannot change the answer.

Deforming to the hat's own parameters reproduces the exact engine's geometry to
nine decimal places, which is the other end of the check.

*Original ticket text:*

Given a patch and a parameter, produce deformed vertex positions.

**Why it is well-defined, and not obvious.** A lattice vector does not decompose
uniquely into short and long steps in general, so "scale the short parts by a"
is not automatically meaningful. It becomes meaningful *because* each tile's
short-edge and long-edge sums vanish separately: every cycle around a tile
preserves the counts, tiles generate all cycles in a simply-connected patch, and
so the decomposition is path-independent. Propagating positions by breadth-first
walk over the tiling is therefore exact in the combinatorial sense even though
the coordinates are floats.

**Done when:** deforming to the hat's own parameters reproduces the existing
geometry to floating-point tolerance, the turtle reproduces the published
turtle, and no gaps or overlaps appear anywhere along the slider.

---

### D2. Scene 7 — the continuum — **M** — ✅ done

`src/scenes/continuum.ts`. One slider, hat to turtle. **120fps while dragging
at a 4× CPU throttle** — the deformation is cheap enough to run per frame.

Two decisions protect the point rather than the pixels. The view fits **once**
and never again, because re-fitting per frame would make the tiling appear to
swim rather than deform in place. And colours are keyed to orientation and
computed once, so a tile keeps its colour throughout — which is what lets a
reader see that the *arrangement* is unchanged while the *shape* moves.

*Original ticket text:*

One slider. The tiling re-flows continuously from hat to turtle. Nothing else on
screen — no second control, no numbers.

The tiling must stay recognisably *the same tiling* as it deforms, or the point
is lost: it is not morphing into a different pattern, it is the same
arrangement wearing different proportions. Keep the view anchored and the
colouring stable.

Depth ceiling per [07](07-scope.md): no `Tile(a,b)` notation on screen, no
coordinates, no naming of the family.

**Done when:** dragging is smooth at 60fps on a throttled phone, and the hat and
turtle are both reachable and recognisable.

---

### D3. Copy and placement — **S** — ✅ done

After the hierarchy, before the outro. 698 words total now, still ~3 minutes.

*Original ticket text:*

Goes after the hierarchy, before the outro — an escalation, not a coda. Roughly:
*you have been looking at one shape; it is one of infinitely many, and the whole
family behaves the same way.*

Plus a text takeaway that stands alone, as every scene has.

---

### D4. Hold the line — **S** — ✅ done

Seven viewports clean with five stages, no-JS degradation intact, four new smoke
assertions, 32 KB of JavaScript against a 120 KB ceiling, keyboard route via the
slider, accessible name on the canvas.

*Original ticket text:*

Everything sprint 3 established, applied to the new scene: viewport sweep
including landscape, no-JS degradation, budgets, accessible name and a keyboard
route, smoke coverage.

The JavaScript budget is 120 KB and we are at 29 KB, so there is room — but the
deformation runs on every slider frame, so the perf check is the real one.

## Stretch, to decide while building

The slider's extremes are the **chevron** and the **comet**, and those degenerate
shapes are not a curiosity: collapsing the family onto them is how the
aperiodicity was actually proved. One sentence could connect the reader's own
slider to the argument.

[07](07-scope.md) says stop before "the chevron and comet, why the endpoints are
degenerate", so this is right at the ceiling. Build the scene first, then judge
whether one line earns its place or reads as a lecture. Default is to leave it
out.

## Not in this sprint

The spectre scene (still absorbed into one outro paragraph, still the right
call), the sandbox, export and share links. The sandbox is the strongest
candidate for sprint 5, since it is the growth loop
[06 §7](06-webapp-design.md) named — but the piece should be finished before it
is given a toy.

## Definition of done

1. One slider moves the tiling continuously from hat to turtle.
2. It stays gap-free and overlap-free throughout.
3. The scene meets every bar sprint 3 set: viewports, no-JS, keyboard, budgets.
4. The piece still feels slightly too short.
