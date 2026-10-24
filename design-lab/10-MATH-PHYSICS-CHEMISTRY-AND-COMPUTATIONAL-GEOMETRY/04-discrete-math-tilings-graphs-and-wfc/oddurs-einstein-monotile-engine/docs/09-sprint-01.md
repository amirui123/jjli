# 09 — Sprint 1

## Goal

> **A deployable page where scenes 3 and 5 work on a real phone.**

Those are the two scenes [07](07-scope.md) marks *don't cut*. They are also the
two biggest risks in the project. If they land and playtest well, the rest of the
MVP is assembly. If they don't, we learn it now rather than after building six
other scenes around them.

## The reasoning behind this shape

The engine is currently **ahead of the app**, and that's the wrong way round.
There are no pixels yet, so every further design decision is being made blind.
More engine work in isolation compounds risk: we'd be building features whose
required shape we're guessing at.

So this sprint is a **thin vertical slice**, not a layer. It deliberately leaves
engine capabilities unbuilt (continuum, patch matching, hulls) in favour of
getting the two load-bearing interactions in front of humans.

Sequencing note: **scene 5 needs no new engine work** — `Tile.path` already
carries the ancestry, and [08](08-engine.md) established that tinting by ancestor
is the right approach anyway. So the load-bearing scene can be de-risked *first*,
in parallel with the hard engine work that scene 3 needs.

## Tickets

### 0. Version control — **S** — ✅ done

`git init`, initial commit on `main` (`6197977`, 26 files). The hatviz BSD-3
provenance and the arXiv reference are recorded in the commit message, not only
in doc comments.

Remote: **github.com/oddurs/einstein-tile**, public. Going public brought the
BSD-3 obligation live, so `LICENSE` (MIT), `THIRD-PARTY-NOTICES.md` (the hatviz
copyright notice, retained as the licence requires) and a root `README.md` are
in place.

Sprint tracking lives in this file, not Linear. The only Linear team is the Sava
company workspace and this is a side project, so it stays out of there.

---

### E1. Kite decomposition + exact overlap predicate — **M**

Derive each hat's **8 constituent kites** in exact lattice coordinates, giving
every kite a canonical integer ID.

This is the keystone piece. With it, *"do two hats overlap?"* becomes a
set-intersection on 8 integer IDs — exact, allocation-free, no geometry, no
tolerances. It unlocks three separate things:

- legal-move enumeration (E2)
- true metatile hulls (deferred, but the same primitive)
- an exact area/coverage test to replace the Monte Carlo one in `patch.test.ts`

**Done when:** every tile in `buildPatch(4)` maps to 8 kite IDs; the 7,921 tiles
yield exactly 63,368 distinct IDs (proving no overlap, exactly, replacing the
statistical test).

---

### E2. Legal-move enumeration — **L**

Given a patch and an exposed edge, return every legal placement of a new hat.

Use **local matching, not the substitution.** Enumerate candidate translations
that butt a new tile against the exposed edge, across all 12 orientations, and
keep those whose kite set is disjoint from the existing patch (E1).

This distinction is the whole pedagogical point. Local matching admits placements
that are legal *now* but cannot extend to a full tiling — which is exactly the
trap scene 3 needs. Deriving moves from the substitution would only ever offer
correct moves, and the user could never fail. **The failure has to be reachable.**

**Done when:** enumeration around a single hat returns a stable, deduplicated set;
placements from a real patch are always included; and a scripted greedy walk can
reach a dead end.

*Highest-uncertainty ticket in the sprint. If it slips, scene 3 slips.*

---

### A1. App shell + deploy — **S** — ✅ done

Astro 7 at the repo root; the engine moved to `src/engine/` (via `git mv`, so
history survives) to leave `src/pages/` free for Astro. One static page, 12 KB of
JS. `.github/workflows/deploy.yml` runs typecheck → test → build → Pages on push
to `main`.

`base: '/einstein-tile'` is set for project-site deployment, so the dev URL is
`localhost:4321/einstein-tile/` — bare `/` 404s. Every in-page URL must go
through `import.meta.env.BASE_URL` rather than a root-absolute path.

*Original ticket text:*

Astro, TypeScript, one page, canvas island, static build, deploy on push from
`oddurs/einstein-tile`. No CMS, no router, no backend ([07](07-scope.md)).

The repo is public, so **GitHub Pages is now viable** and is the zero-setup
option. Cloudflare Pages remains the better pick if this gets posted somewhere
and spikes — Pages has a soft 100 GB/month bandwidth guideline, Cloudflare
doesn't meter. Either works; decide at wiring time.

**Done when:** a URL exists that someone can open on a phone.

---

### A2. Canvas renderer — **M** — ✅ done

`src/renderer/` — `gestures.ts`, `view.ts`, `renderer.ts`, plus a placeholder
`palette.ts` that A3 replaces. Verified in headless Chromium at a Pixel 7
viewport (`npm run smoke`): no console errors, canvas backed at dpr 2.625, 1,281
distinct colours sampled, drag pans, and the page does not scroll during a drag
— which is the real test of the passive-listener + `touch-action: none` contract.

Two things worth remembering:

- **The view transform is a pure, tested module.** The y-flip (engine y grows up,
  canvas y grows down) would otherwise produce a patch that renders and pans
  perfectly while being silently *mirrored* — on a tiling whose reflected tiles
  are the whole point, a bad bug to ship. 9 tests cover round-trip, zoom
  anchoring, clamping and fit.
- **Stroke width is constant on screen at any zoom**, because `lineWidth` is set
  in world units and the transform scales by `scale`. Stroke visibility
  therefore keys on *tile* screen size, not stroke width. Got this wrong first
  time; the wrong version hid outlines when zoomed out for no reason.

*Original ticket text:*

Framework-agnostic module consuming the engine: draw a patch, devicePixelRatio
handling, pan and drag, pinch-zoom, resize. Canvas 2D — no WebGL this sprint
([06 §6](06-webapp-design.md)).

Gesture vocabulary is fixed and must not vary between scenes: **pinch = zoom,
drag = pan, always.**

**The performance idea: merge by colour.** Tiles are grouped by colour key and
merged into one `Path2D` per colour, rebuilt only when the patch or scheme
changes. A frame is then a handful of `fill()` calls — twelve for the
orientation scheme — rather than one per tile. Per-frame cost is therefore
independent of tile count: panning 7,921 tiles costs what panning 25 costs.

**Done when:** a level-4 patch renders and pans smoothly at 60fps on a mid-range
Android.

---

### A3. Palette + theming — **M** — ✅ done

Values were **computed and validated**, not chosen — via the `dataviz` skill's
Machado–Oliveira–Fernandes severity-1.0 validator. `test/palette.test.ts` (32
tests) re-runs the same gates in CI, so a well-meant hex tweak that breaks
colour-vision safety fails the build rather than shipping.

A tiling is an **all-pairs** problem — any tile can neighbour any other — so
these face the strict gate, not the adjacent-only one charts use. Two findings
came out of that:

**1. Four hues at constant lightness cannot be made CVD-safe.** Of the reference
palette's 70 four-colour subsets, 2 passed all-pairs in both modes, both stuck
in the 6–8 warn band. A wider OKLCH sweep at fixed lightness found *nothing* at
ΔE ≥ 8. This is structural: CVD collapses the red–green axis, leaving roughly
one chromatic axis. The fix is to stop leaning on hue — **CVD preserves
lightness**. Varying lightness across the four slots reached ΔE 14.7 light /
9.0 dark. (Harmony fights this: requiring hues ≥ 65° apart *and* ΔE ≥ 10 has no
solution at all.)

**2. Twelve orientations cannot be twelve hues** — no categorical palette
supports twelve. But 12 = 6 rotations × 2 chiralities, so the accessible scheme
encodes the *factors*: rotation as a 6-step lightness ramp (ordinal, and
lightness survives CVD), chirality as blue vs ochre (the blue–yellow axis is the
one CVD leaves intact). Cross-family separation ΔE ≈ 19 at every rotation pair.

Rotation is **ordinal**, not categorical, so its ramp takes the ordinal gate
(monotone lightness, adjacent ΔL ≥ 0.06, end-step contrast ≥ 2:1) rather than
all-pairs ΔE. Applying the categorical gate to it was my own error, caught by
running the validator instead of reasoning about it.

The `vivid` orientation wheel is kept as a **non-default** option: beautiful,
honestly cyclic, and worst-pair ΔE 1.1. A test pins that it fails, so the two
modes can't silently converge. The toggle changes *only* the orientation scheme
— the other two are already safe — which is honesty over the appearance of
consistency.

Page surfaces now match `palette.ts` `SURFACE` exactly, since every published
number was computed against them.

*Original ticket text:*

The three colour schemes from [06 §5](06-webapp-design.md) — by orientation, by
metatile, by reflection — plus light/dark from day one.

**The colourblind constraint is part of this ticket, not a follow-up.** A 12-hue
orientation wheel is unusable for ~8% of men, so ship a lightness-varying
alternative alongside it. Load the `dataviz` skill before picking values.

**Done when:** all three schemes work in both themes and pass a simulated
protanopia/deuteranopia check.

---

### S1. Scene 5 — the hierarchy — **M** — ✅ done

`src/scenes/hierarchy.ts` + `/scene-5/`. Five stages: bare tiles, then metatile
groups coarsening one level at a time. Groups are drawn with **true hulls**, and
zoom and the slider drive the *same* one-dimensional reveal.

Three things changed during the build, all from looking at the output:

- **True hulls turned out to be buildable now**, without waiting for E1's kite
  decomposition. Because tiles sit on an exact lattice, a group's boundary is
  just the directed edges appearing once instead of twice
  (`src/engine/hull.ts`). Tinting alone did not read as *nesting*; outlines fixed
  that, and nesting is the entire point of the scene.
- **Stage 0 was an illegible grey blob.** At the fitted scale 7,921 tiles are two
  pixels each, so "one shape, laid down over and over" showed no shape at all.
  Stage 0 now starts several octaves zoomed in. Also why the slider now drives
  zoom: otherwise scrubbing and pinching disagreed about where you were.
- **Dropped the depth-0 stage.** The whole patch as one flat colour teaches
  nothing, and it threw away the strongest frame — depth 1, where the
  substitution rule itself becomes visible as 3 H + 1 T + 3 P + 3 F.

Two bugs the tests caught, both worth remembering:

- **`Tile.path` is not identity.** Sibling metatiles frequently share a label, so
  grouping on a label prefix silently merged distinct instances — visible as a
  "group" whose hull was several disjoint loops. Tiles now carry `trail`, the
  child-index ancestry, and grouping keys on that.
- **Hull area must be summed *signed*.** Outer loops wind counter-clockwise and
  holes clockwise, so taking each loop's absolute area adds holes instead of
  subtracting them.

The hull also gives an **exact** replacement for the Monte Carlo coverage test:
a group's hull area equals its tile count × hat area, to 6 decimal places, at
every depth.

*Original ticket text:*

The load-bearing scene. Pinch to zoom out; metatile groupings tint in by ancestor
depth, level 1, then 2, then 3. Scrubbable, with a stepped alternative for
`prefers-reduced-motion`.

Group on `Tile.path`; **do not stroke `MetaInstance.scaffold`** — see the warning
in [08](08-engine.md).

**Done when:** a person who doesn't like maths can, unprompted, say something like
"the tiles group into bigger copies of themselves". That sentence is the MVP's
success test.

---

### S2. Scene 3 — try to make it repeat — **L** — ✅ done (redesigned)

**The first build failed a playtest and was replaced.** It let a reader place
hats by hand and hoped the point would emerge. It didn't: nothing in it ever
asked you to make the pattern *repeat*, so there was no goal, no test, and no
moment of failure — a sandbox with a lesson's title on it. The reader's verdict
was "I didn't really get it", which was correct.

**The redesign: let the mechanic be the definition.** A pattern repeats exactly
when you can slide a copy of it onto itself and have everything land. That is
the textbook definition of periodic, and it is also something a thumb can do.
Two acts:

1. **A hexagon floor.** Drag the copy — it clicks, the whole overlap lights up.
   *That* is what repeating looks like. Without this act, "it never clicks" has
   no reference point and reads as a broken toy.
2. **The hat tiling.** Drag anywhere. A few tiles land by coincidence; it never
   clicks. The best slide that exists reaches 46%.

No paragraph does the teaching. The reader's hand does.

**The idea that makes it rigorous rather than suggestive:** dragging snaps to
the *complete set of candidate periods*. A period must map any given tile onto a
tile of the same form, so the only possible slides are `anchor_j − anchor_0` over
pieces sharing piece 0's form. There are 31 of them for this patch. So the reader
is not sampling slides and finding none — they are walking the entire set of
slides that could conceivably work and watching each one fail, with a
`4/31 slides tried` counter making the exhaustion visible.

Four bugs found by driving it, each worth remembering:

- **The identity slide matches everything**, so opening at zero announced "every
  tile landed" before the reader moved anything — asserting the opposite of the
  lesson. Opens at (3,1) now, which is outside the hexagon sublattice so both
  acts start genuinely unaligned.
- **Snapping on every pointer-move traps the copy.** Measuring the next delta
  from the snapped point means small moves never escape the current candidate's
  basin; the copy simply would not move. A free drag position now accumulates,
  and snapping only decides what is scored.
- **Snapping to the raw lattice made the hexagon act fail** — only 1 point in 12
  is a hex vector, so the floor almost never clicked. Snapping to candidate
  periods fixed it and is more correct.
- **The conclusion was gated on a partial match**, but most hat slides land
  *nothing*, so it never appeared.

`test/alignment.test.ts` proves the claim rather than trusting the UI: no slide
in a radius-12 sweep aligns the hat tiling, and no member of the complete
candidate set does either — which rules out every translation in the plane, not
just nearby ones.

### X1. Mobile + perf harness — **M** — ◐ measured, one known limit

Audited and **measured**, not asserted. Method: headless Chromium at a Pixel 7
viewport with `Emulation.setCPUThrottlingRate: 4` standing in for a low-end
Android, sampling `requestAnimationFrame` intervals during continuous
interaction, three runs each.

| | median | p95 | verdict |
| --- | --- | --- | --- |
| Scene 3, panning | 8.3 ms | 9.3 ms | 120 fps — comfortable |
| Scene 5, panning | 16.6 ms | 59 ms | 60 fps median |
| Scene 5, zooming | 17.5 ms | ~92 ms | 60 fps median, occasional dropped frame |

Heap is flat: **0.0 MB** growth across 15 stage changes, so no leak.

Verified rather than assumed: only `wheel` is a non-passive listener (deliberate
— there is no CSS equivalent for suppressing page zoom); `vh` appears nowhere but
in comments explaining why `dvh` is used instead.

**Two real fixes came out of this.** Tile geometry is now computed once per patch
rather than per recolour — 7,921 `polygon()` calls cost ~8 ms, ~33 ms throttled,
and scene 5 was paying that on every stage change. Merged colour buckets and
overlay paths are cached by token and by object identity respectively.

⚠️ **Known limit.** Scene 5's zoom still shows ~92 ms frames at 4× throttle, and
caching did not remove them — the cost is canvas *rasterisation*: filling ~7,900
merged hat outlines and stroking up to 442 group hulls, every frame. It is not
JS work, so it cannot be cached away at this level. Median stays at 60 fps and
unthrottled hardware is unaffected. If real-device testing says it matters, the
fix is the WebGL path [06 §6](06-webapp-design.md) already holds in reserve —
deliberately not built on a synthetic measurement.

**Not done:** testing on a real mid-range Android, and Lighthouse/FCP in CI.
Both need a device or a hosted run rather than this harness.

*Original ticket text:*

Runs alongside everything else, not at the end.

- `window.innerHeight` handling for the address-bar `vh` trap
- passive listeners on `touchstart` / `touchmove` / `wheel`
- perf budget in CI: FCP < 2.5s throttled, 60fps scroll, Lighthouse > 90
- no memory growth across a full read-through
- **testing on a real mid-range Android**, not just a simulator

---

### X2. Playtest round — **S**

Five people, at least three of whom don't enjoy maths. Watch, don't explain.

The one question that matters: *afterwards, can they say why it can't repeat?*

Case's finding is the thing to watch for — people skim and learn nothing, which
is what the scene 3 gate exists to prevent. Verify the gate actually works.

## Sequencing

```
0 ──┬─ A1 ── A2 ──┬── A3 ──┬── S1 ──┐
    │              │        │        ├── X2
    └─ E1 ── E2 ───┴────────┴── S2 ──┘
                    X1 runs throughout
```

Two tracks after ticket 0. The app track reaches a rendered scene 5 without
waiting on the engine track; the engine track's E2 is the long pole and feeds
only scene 2. If E2 slips, **ship S1 and playtest it alone** — it still answers
the most important question.

## Explicitly not in this sprint

Scenes 0, 1, 2, 4, 6, 7. The sandbox. Export and share links. WebGL. The
`Tile(a,b)` continuum. True metatile hulls. Patch matching. Copywriting beyond
placeholder. Localization.

Several of these are cheap and tempting. They are also exactly the
adjacent-interesting work [07](07-scope.md#the-adjudication-rule) warns about.
The sprint answers one question — *do the two load-bearing scenes work?* — and
nothing else earns a place until it's answered.

## Definition of done

1. A URL that works on a phone.
2. Scenes 3 and 5 playable there.
3. Five playtests run, notes written.
4. A go/no-go on the arc in [06 §3](06-webapp-design.md), informed by evidence
   rather than by this document.
