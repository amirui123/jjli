# 04 — Generating the tilings in code

Two viable architectures. Pick based on whether you need a fixed patch or
random access to an unbounded plane.

| | **A. Substitution / inflation** | **B. Combinatorial coordinates** |
| --- | --- | --- |
| Idea | Start from one metatile, apply the substitution rule *n* times, draw the leaves | Give every tile an address; compute neighbours by combinatorial rules; walk outward |
| Cost | Exponential in *n*; you build the whole hierarchy to fill any region | Lazy — cost proportional to tiles actually drawn |
| Precision | Float coordinates accumulate error over deep hierarchies | Exact; geometry computed once at the end |
| Good for | Static images, posters, laser-cut sets, understanding the structure | Infinite pan/zoom, random access, huge patches, simulations |
| Reference | Kaplan's `hatviz` (H7/H8 rules) | [Tatham's spectre coordinates](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-spectre/) |

A third option exists — direct/local growth without substitution — see
[arXiv:2306.06512](https://arxiv.org/html/2306.06512), *Direct Construction of
Aperiodic Tilings with the Hat Monotile*.

## A. Substitution

For the **hat**: four metatiles **H, T, P, F**, each expanding into a patch of
smaller metatiles. Kaplan's app implements the paper's `H7` and `H8` rule variants.

For the **spectre**: two rules, `Spectre → Mystic + 7 Spectres` and
`Mystic → Mystic + 6 Spectres`, with the whole replacement patch reflected each
step. Inflation factor 4 + √15 ≈ 7.873, so tile count grows ~7.9× per level —
6 levels ≈ 240k tiles. Budget accordingly.

Implementation shape:

```
Metatile := { label, transform, children: [Metatile] }

expand(m)  -> Metatile with children = rule[m.label]
              each child transform = m.transform ∘ childRule.transform
draw(m)    -> if leaf: emit polygon(shape[m.label], m.transform)
              else: for c in m.children: draw(c)
```

Keep transforms as exact 2×2-plus-translation matrices over ℤ[√3] (or ℤ[ω]) rather
than floats if you plan to go deep; convert to float only when emitting geometry.

## B. Combinatorial coordinates (spectre)

Tatham's scheme, summarised:

1. Work with the **nine hexagonal metatiles** G, D, J, L, X, P, S, F, Y
   ([03](03-the-spectre.md#hexagonal-metatiles-the-implementation-friendly-view)),
   not with spectres.
2. A tile's **address** records, for each level of the hierarchy, which hexagon
   type it descends from and its index within that hexagon's expansion — plus,
   at the bottom, which spectre within the hexagon (only G has two).
3. Number the 6 edges of each hexagon and the 14 edges of each spectre
   systematically. Crossing an edge is then a pure lookup: given (address, edge),
   compute the neighbour's (address, edge), carrying up the hierarchy only as far
   as needed — usually one or two levels.
4. Traverse by BFS from a seed tile, or by raster scan over a target rectangle.
5. Compute actual geometry only for tiles you emit.

No floating-point comparisons anywhere in the traversal. This is what you want for
anything interactive.

## Shape coordinates

Don't retype vertex coordinates from a paper figure. Take them from source:

- **Hat** — `hat.js` in [isohedral/hatviz](https://github.com/isohedral/hatviz/blob/main/hat.js)
  has the outline as a vertex array.
- **Hat / turtle / spectre in many formats** (SVG, DXF, STL, JSON) —
  [christianp/aperiodic-monotile](https://github.com/christianp/aperiodic-monotile).
- **Spectre SVG outline** — direct from [Kaplan's spectre page](https://cs.uwaterloo.ca/~csk/spectre/).

If you do want to derive the hat yourself: build the deltoidal trihexagonal
([3.4.6.4] Laves) tiling by cutting each hexagon of a hex grid into 6 kites
(centre → vertex → edge-midpoint), then take the specific 8-kite union. Angles
are all multiples of 30°, so exact arithmetic in ℤ[√3] works throughout. Verify
against one of the sources above before trusting it.

For the parameterized family, `Tile(a,b)` has 14 edges alternating between the two
lengths; setting `(a,b) = (1,√3)` gives the hat, `(√3,1)` the turtle, `(1,1)` the
equilateral hurtle. A single slider over `a/b` animates between them, and every
intermediate value is a valid aperiodic monotile — a cheap and very effective
demo.

## Existing code

| Repo / page | What |
| --- | --- |
| [isohedral/hatviz](https://github.com/isohedral/hatviz) | Kaplan's p5.js app. Substitution via H7/H8, continuum slider, PNG + SVG export. **BSD 3-clause.** The reference implementation. |
| [isohedral/hatvalidate](https://github.com/isohedral/hatvalidate) | Python code reproducing the computer-assisted half of the aperiodicity proof. |
| [isohedral/tactile-js](https://github.com/isohedral/tactile-js) | Kaplan's general library for periodic tilings — useful scaffolding, not hat-specific. |
| [christianp/aperiodic-monotile](https://github.com/christianp/aperiodic-monotile) | The shapes in many file formats, incl. laser-cut / 3D-print ready. |
| [kerupani129s/spectre-monotile-js](https://kerupani129s.github.io/spectre-monotile-js/) | JS spectre / `Tile(1,1)` generator. |
| [Tatham's aperiodic-tilings](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/) | Two algorithms for *randomly* generating aperiodic tilings — relevant if you need an unbiased random patch rather than a substitution-rooted one. |

## Licensing

- `hatviz` source: **BSD 3-clause**.
- Images and animations on Kaplan's [hat](https://cs.uwaterloo.ca/~csk/hat/) and
  [spectre](https://cs.uwaterloo.ca/~csk/spectre/) pages: **CC BY 4.0** — reuse
  and modification permitted with attribution.
- The shapes themselves are mathematical objects, not copyrightable. Attribute
  Smith, Myers, Kaplan and Goodman-Strauss anyway; it is the decent thing and the
  authors have been generous.

## Gotchas

- **Reflections are mandatory for the hat.** If your renderer silently drops
  negative-determinant transforms, roughly 1 in 7.9 tiles will be wrong and the
  patch will not close up.
- **The spectre's handedness flips every inflation level.** Track it, or
  alternate levels will come out mirrored.
- **Float drift** over deep substitution shows up as visible gaps. Use exact
  arithmetic in the hierarchy, or option B.
- **`Tile(1,1)` is not aperiodic on its own** — it needs either the reflection ban
  or the modified edges. Don't ship it as "the einstein" without one of those.
