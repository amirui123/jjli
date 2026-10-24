# 06 — Designing the webapp

Research + recommendation for an interactive, design-forward explainer that teaches
the einstein tile to a broad audience, on web and mobile.

**Recommendation in one line:** build a **scroll-driven explorable explanation** —
a single narrative page of ~8 interactive scenes ending in a free-play sandbox —
as **one responsive web app** for desktop and mobile browsers, canvas-rendered,
with a framework-agnostic tiling engine built on exact combinatorial coordinates.

---

## 1. What already exists, and the gap

| Thing | What it is | What it isn't |
| --- | --- | --- |
| [hatviz](https://github.com/isohedral/hatviz) (Kaplan) | Substitution tool, continuum slider, SVG export | An explanation. It assumes you already know what you're looking at. |
| [Polypad](https://mathigon.org/polypad) (Mathigon) | Drag hats around freely | Unguided sandbox. No narrative, no payoff. |
| [cs.uwaterloo.ca/~csk/hat](https://cs.uwaterloo.ca/~csk/hat/) | Authoritative reference, figures, papers | Reference material for people who already care. |
| InFUNity Tiles | Physical puzzle set | Not digital, not free, not linkable. |
| News coverage | "Mathematicians find 13-sided shape!" | Explains nothing. Frequently wrong (see [references](references.md#caveats-on-secondary-sources)). |

**The gap is the middle.** Everything is either a tool for the initiated or a
headline for the uninterested. Nobody has built the thing that takes a curious
person with no maths background and gives them the actual *idea* — and the
"oh, **that's** why" moment.

That is the product. It's also a very good fit for the medium, because
aperiodicity is a property you can only really feel by *failing to break it*.

---

## 2. The pedagogy: what are we actually teaching?

### The one sentence

> A single shape that covers an infinite floor forever — and the pattern never,
> ever repeats.

### The misconception to kill first

Most people hear "never repeats" and think **random**, like digits of π. The truth
is the opposite and far more interesting: hat tilings are **highly ordered**.
Locally they look repetitive. Any finite patch you point at *does* appear again,
infinitely often, elsewhere. What never happens is a global translation that maps
the whole tiling onto itself.

If the app doesn't dismantle "non-repeating = random", it has failed, no matter how
pretty it is. This should be an explicit scene, not a footnote.

### The three "aha" moments, in order

1. **Failure.** You try to make it repeat. You can't. Not because you're bad at it
   — because it is impossible. This is *procedural rhetoric*: the user enacts the
   theorem rather than being told it.
2. **Hierarchy.** Zoom out and the tiles clump into metatiles, which clump into
   bigger metatiles, forever. *This is why it can't repeat.* The structure is a
   tree, and trees have no period. This is the actual proof, made visible.
3. **The continuum.** Drag one slider and the hat morphs continuously into the
   turtle. Every shape in between works. There isn't one einstein — there are
   infinitely many, and the family is the real discovery.

Aha #2 is the one nobody else shows well, and it's the one that converts
"neat shape" into "I understand something".

### Design principles this is built on

From [Nicky Case's *Explorable Explanations*](https://blog.ncase.me/explorable-explanations/):

- **Do & Show & Tell** — interactivity is for *processes and systems*, not for
  everything. Use prose for the abstract, animation for the temporal, interaction
  for the causal. Don't make people drag things to learn a definition.
- **Start small, build big** — teach one mechanic per scene in isolation, then
  combine. (Tile → placement rules → patch → metatile → hierarchy → continuum.)
- **Cognitive gates** — deliberately withhold. Case found in playtesting that
  people skim and learn nothing; gating content until they've *done* the thing
  measurably improved learning. Don't let the user scroll past the failure
  experiment without attempting it.
- **See, Model, Apply** — let people generate their own data points and notice the
  pattern themselves, rather than reading the conclusion.
- **Not gamification** — "Gamification is about changing behavior. We're about
  changing knowledge." No points, no streaks, no badges. Appeal to curiosity and
  the pleasure of making something beautiful.
- **Playtest, for real** — with people who don't like maths. Every assumption in
  this document is a hypothesis until then.

Also relevant: Bret Victor's distinction that an explorable explanation is not a
pile of widgets — it **guides attention** to specific phenomena in the simulation.
Every interaction needs a question attached to it.

---

## 3. The narrative arc

Eight scenes, ~10 minutes end to end. Each has one mechanic and one question.
Mobile pacing is tighter than desktop, so this is deliberately short — the sandbox
is where the time goes for people who want it.

| # | Scene | Mechanic | The question it answers |
| --- | --- | --- | --- |
| 0 | **Hook** | Ambient, slowly growing tiling behind the title | "…wait, is that repeating?" |
| 1 | **Floors repeat** | Tap to lay squares/hexagons; the app snaps them into a lattice and highlights the repeat vector | What *is* periodicity? (Establish the baseline so the payoff lands.) |
| 2 | **Meet the hat** | Rotate/inspect one tile; show it built from 8 kites | What is this shape? Make it feel ordinary and boring — that's the point. |
| 3 | **Try to break it** ⚑ | Place hats yourself, snapped and auto-oriented. Attempt to build a repeating block. Gate the scroll until an attempt is made. | Aha #1 — you *can't*. |
| 4 | **Not random** | Point at a patch; the app finds and pulses the same patch elsewhere. Side by side with a genuinely random tiling for contrast. | Kills the misconception. Order without repetition. |
| 5 | **Zoom out** ⚑ | Pinch/scroll to zoom; metatile outlines fade in at scale 1, then 2, then 3… | Aha #2 — the hierarchy. This is the proof. |
| 6 | **The mirror problem** | Toggle "no flipping allowed" → the tiling breaks. Then morph edges into the spectre → it works again. | Why there were *two* discoveries. Honest about the asterisk. |
| 7 | **One slider, infinite einsteins** | The `Tile(a,b)` continuum slider, hat ⇄ turtle, tiling re-flowing live | Aha #3 — the family. |
| 8 | **Sandbox** | Free play: colour schemes, substitution depth, export PNG/SVG, share a link | Make something beautiful and post it. This is the growth loop. |

⚑ = gated. Everything else scrolls freely.

Two framing beats worth threading through, not as their own scenes:
- **David Smith.** A retired print technician found this by hand, with card and
  scissors, after 50 years of professional failure on the problem. For a broad
  audience this is the most compelling fact in the whole story, and it costs one
  paragraph. Use it early — probably scene 2 — as the reason to keep reading.
- **It was hiding in plain sight.** The hat had been catalogued and overlooked
  repeatedly. Good closing note.

---

## 4. Mobile is the hard constraint, so design for it first

> **Decided: we do not skip mobile.** It was raised and rejected, for three reasons.
> (1) Distribution *is* the product's growth mechanism — the link gets posted and
> tapped, and a large share of that traffic is phones. Mobile-broken loses the
> audience at peak attention. (2) "Broad audience" and "desktop only" are in direct
> contradiction; this would be the single largest available narrowing of reach.
> (3) The constraint only actually binds on **one** scene. Seven of eight are
> scroll/tap/pinch/slider — two are *better* on touch — and the touch workaround for
> scene 3 is pedagogically superior to free drag anyway.
>
> What we *do* scope down is the **sandbox (scene 8)**: desktop-rich, mobile-reduced.
> The story is complete on a phone; the tool rewards a laptop. Responsive does not
> have to mean identical.
>
> Honest cost of doing this properly: touch hit-testing on 13-gons, address-bar/`vh`
> handling, a second layout per scene, and testing on a real mid-range Android.
> Roughly +20–30% on the interactive work.

Not "responsive later". The interactions have to be *conceived* for touch, because
the desktop degradation is trivial and the reverse isn't.

### What breaks on mobile

From [The Pudding's responsive scrollytelling research](https://pudding.cool/process/responsive-scrollytelling/) and mobile-viz literature:

- **`vh` units are a trap.** Mobile browsers resize the address bar mid-scroll, so
  viewport height fluctuates and scroll triggers go janky. Use `window.innerHeight`
  computed in JS on load/resize, or `dvh` with a JS fallback.
- **Hover doesn't exist.** Any hover affordance must become fixed annotation or an
  explicit tap target.
- **Gestures aren't discoverable.** Precise-positioning gestures in dense
  visualizations are "difficult to discover" and should be limited or avoided.
  Every gesture needs a visible hint on first encounter.
- **Don't hijack scroll.** Steppers and swipe-to-advance are anti-patterns — they
  fight the one gesture the user already understands.
- **Pacing differs.** What reads as brisk on desktop is fatiguing on a phone.

### The hardest UX problem in this app

**Free-form tile manipulation on a small touchscreen.** A hat has 13 sides, 12
orientations, and needs reflection. Dragging and rotating that with a thumb, on a
surface where your finger covers the target, is miserable.

Recommendation: **do not ship free drag-and-rotate as the primary mechanic.**

- Scene 3 (the important one): tap an edge of an existing tile → a ghost tile
  appears in every *legal* orientation → tap to commit. Placement becomes a choice
  among a few options, not a dexterity task. It is also more instructive, because
  the legal-move set is precisely what the mathematics is about.
- Reserve free drag for the desktop sandbox, where it's pleasant.
- One gesture per scene, and the same gesture means the same thing everywhere.
  Pinch = zoom, always. Drag = pan, always.

### Accessibility, decided up front not retrofitted

- **Colour-by-orientation is a colourblind hazard.** 12 hues around a wheel is the
  obvious and beautiful choice, and it is unusable for ~8% of men. Ship at least
  one palette that also varies lightness monotonically, plus an optional outline/
  texture mode. See the `dataviz` skill's palette guidance when we get to it.
- `prefers-reduced-motion` — the substitution animation is the whole point of
  scene 5, so provide a scrub-through-steps alternative rather than just disabling.
- Every scene needs a text takeaway that stands alone without the visual. This is
  also good for SEO and for people who skim.
- Target ≥44px touch targets; a hat at legible size on a phone is roughly that,
  which sets the minimum zoom level.

---

## 5. Design direction

"Design-forward" here has an unusually easy answer: **the mathematics is already
the aesthetic.** Hat tilings are genuinely beautiful. The job is to not get in the
way, and to resist decorating.

- **The tiling is the interface.** Backgrounds, section dividers, the loading
  state, the favicon, the OG image — all generated by the engine, never drawn by
  hand. Consistency comes free and it demonstrates the subject.

### 5.1 Colour is information, and it is spent

Colour in this piece is **not decoration and not scene identity**. It carries one
job — *telling things apart that the argument needs told apart* — and where the
argument does not need it, the piece is grey.

That gives a shape, and the shape is now deliberate rather than accidental:

| | scene | colour | why |
| --- | --- | --- | --- |
| 1 | hook | **12** orientations | the subject, at its most beautiful, before any argument |
| 2 | the hat | grey + **1** | one shape is being pointed at; everything else is workbench |
| 3 | repeat | grey + **2** | landed or missed. Exactly two states, so exactly two colours |
| 4 | recurrence | grey + **2** | the patch you picked, and its echoes |
| 5 | hierarchy | **4** metatiles | four kinds of cluster *is* the argument |
| 6 | continuum | **12** orientations | colour returns, because the shape is now the variable |

The middle is grey **on purpose**: those scenes are about position and motion,
and a tile's identity is irrelevant to both. Colour returning at the hierarchy
should read as the argument arriving, not as a change of theme.

**The rule for anything added later:** a new colour must name a distinction the
reader is being asked to make. If it does not, it is grey.

For the values themselves, and why they cannot simply be picked, see
`src/renderer/palette.ts`. Two rules bind:

1. **No scene defines a colour.** `test/ink.test.ts` fails the build if one
   does. Four scenes once carried four different greys for a single idea; the
   check exists because a convention nobody enforces decays back into that.
2. **Supporting marks are roles, not values** — `scaffold`, `plain`, `grid`,
   `guide`, `ghost`, `outline`, and three stroke weights. A mark's weight says
   what it is: `hairline` for construction seen through, `fine` for a boundary
   that matters, `strong` for the thing being pointed at.
- **Colour carries meaning, always.** Three schemes, each teaching something:
  by **orientation** (12 hues — reveals the rotational structure), by **metatile**
  (4 colours — reveals the hierarchy), by **reflection** (2 colours — reveals the
  φ⁴ ratio, and makes the mirror problem visible at a glance). Never colour
  randomly; it looks nice and teaches nothing.
- **Motion is explanation.** The two animations that carry real information are
  *inflation* (patch grows into its supertile) and the *continuum morph*
  (hat → turtle). Both should be scrubbable, not fire-and-forget. Everything else
  should be still.
- **Typography does the heavy lifting** for the "serious but friendly" register —
  a large-scale serif or a high-quality geometric sans, generous measure, real
  hierarchy. The page should look like *The Pudding* or Ciechanowski, not like a
  textbook or a kids' app. Broad audience does not mean childish; it means no
  jargon.
- **Dark mode from day one.** Aperiodic tilings look spectacular on dark, and it's
  the default on most phones.
- **One accent colour** that isn't in any tiling palette, reserved for interactive
  affordances, so "you can touch this" is never ambiguous.

Reference standard for craft: [Bartosz Ciechanowski](https://ciechanow.ski/) —
custom-built canvas/WebGL diagrams, no stock components, every figure earns its
place. That is the bar. It is achievable here because the domain is 2D.

---

## 6. Technology

### Platform: one responsive web app, desktop and mobile browsers

No native app, no app stores, no install step, no service-worker/PWA machinery.
One URL that works on a phone and on a laptop.

This is the right call for this product because distribution *is* the link —
someone posts it, you tap it, you're in the thing. Indexable, shareable,
instantly usable. And we need nothing from the device: no camera, no sensors, no
offline mode, no push. The entire experience is a canvas and some prose.

The practical consequence is that "mobile" here means **mobile Safari and Chrome
on a mid-range phone**, which is a rendering-and-touch constraint rather than a
platform decision. That constraint is real and shapes §4 below — but it's the
only thing about mobile we have to think about.

### Dimensionality: 2D. No 3D, anywhere.

The subject is a plane. There is no 3D content, so any 3D would be ornament — and
§5 commits to motion and form as *explanation*. Rejected: extruded "physical" tiles
with lighting (design-forward temptation, ages badly), hero parallax/tilt
(decorative, fights reduced-motion and battery), and a 3D stack-of-levels for the
hierarchy scene (a good poster and a worse explanation than nested fading outlines
at increasing scale, which also survives a phone).

Practical reinforcements: a 3D camera adds an orbit gesture that collides with both
pinch-zoom and drag-pan, which §4 works hard to keep unambiguous; and it costs
camera + lighting + depth work on a mid-range Android for zero teaching gain.

**"2D" ≠ visually flat.** Elevation on the active tile, layered outlines, depth via
overlap and shadow are all in — that's graphic design, not a 3D engine.

> **WebGL is not 3D.** It's a rendering API. Where the table below reaches for it,
> the output is orthographic 2D — one tile geometry, instanced, per-instance
> transform and colour. No camera, no lighting, no z-axis.

### Rendering: Canvas 2D, with a WebGL path held in reserve

| Tiles on screen | Renderer |
| --- | --- |
| < ~500 (scenes 1–7) | **Canvas 2D.** Simple, exact, trivially debuggable. |
| ~500–3,000 | Canvas 2D, with dirty-rect redraw and offscreen caching of tile paths. |
| > ~5,000 (deep sandbox, ambient hero) | **WebGL** — instanced rendering of one tile geometry with per-instance transform + colour. |

Canvas comfortably does 1–3k draws/frame at 60fps on a mid laptop; WebGL goes past
50k. But mobile GPUs are weaker and battery-constrained, so budget against a
mid-range Android, not a MacBook. Don't reach for WebGL until a scene actually
demands it — most don't.

**SVG only for export**, never for live rendering. Thousands of retained DOM nodes
will not hold 60fps.

### The tiling engine

Framework-agnostic TypeScript module, zero UI dependencies, its own tests.
This is the asset; the webapp is a client of it.

- Core: **combinatorial coordinates** ([04](04-implementation.md#b-combinatorial-coordinates-spectre)),
  not naive substitution. Lazy, exact, supports unbounded pan/zoom and random
  access — all of which scenes 5 and 8 need.
- Exact arithmetic in ℤ[√3] internally; convert to float only at draw time. Float
  drift over deep hierarchies shows up as visible gaps, and on this subject a
  visible gap is a factual error.
- Must expose: metatile membership per tile (scene 5), reflection flag (scene 6),
  orientation index (colouring), and the `Tile(a,b)` parameter (scene 7).
- Reflections are mandatory for the hat — if the renderer silently drops
  negative-determinant transforms, ~1 tile in 7.9 will be wrong.

### App shell

Lean. Suggested: **Astro or SvelteKit** with the interactive scenes as islands —
the page is mostly prose, and shipping a full SPA framework for eight canvases is
waste. Scroll triggering via **IntersectionObserver** directly, or Scrollama if we
want the battle-tested version. State per scene stays local; there's almost no
global state.

Performance budget, enforced in CI:
- FCP < 2.5s on a throttled mid-range mobile connection
- 60fps sustained during scroll and during the inflation animation
- Lighthouse > 90
- Passive listeners on `touchstart`/`touchmove`/`wheel` — non-passive listeners are
  a classic source of scroll jank
- No memory growth over a full read-through (easy to get wrong with per-frame
  geometry allocation)

### Licensing

`hatviz` is BSD-3 and Kaplan's figures are CC BY 4.0 — we can read the source and
reuse imagery with attribution. The shapes themselves aren't copyrightable.
Attribute Smith, Myers, Kaplan and Goodman-Strauss prominently anyway; they've been
generous, and the credit is part of the story we're telling.

---

## 7. Scope

**MVP** — scenes 0–5 plus a minimal sandbox. That's the complete emotional arc:
hook → try → fail → understand why. Scenes 6 and 7 are enrichment; they can ship
in v1.1 without the story feeling truncated.

**Cut ruthlessly if needed:** scene 1 (periodicity baseline) can become a single
static figure. Scene 4 can fold into scene 3's aftermath.

**Don't cut:** scene 3 and scene 5. Those are the product.

**Post-launch, in rough value order:** shareable permalinks to sandbox creations
(the growth loop), SVG/PNG export at print resolution, a spectre mode, an
educator's page with printable cut-out templates, translations.

---

## 8. Decisions

### Settled

- **Platform — one responsive web app.** Desktop and mobile browsers. No native
  app, no app stores, no PWA machinery. (§6)
- **Mobile — in scope, designed for first.** Skipping it was raised and rejected;
  reasoning recorded in §4. Sandbox is the one surface that degrades on phones.
- **Audience — adult register.** *The Pudding* / Ciechanowski, not a kids' app.
  Broad means **no jargon**, not childish. Rationale: adult-register work travels
  further socially and children engage with it fine, whereas adults bounce off
  anything that looks made for children. Concretely this fixes:
  - **Prose** — real sentences, dry wit allowed, no exclamation marks, no mascot,
    no "Let's explore!" voice. Assume intelligence, assume zero maths background.
    Those are compatible.
  - **Type & colour** — editorial, generous measure, restrained palette. See §5.
  - **No gamification** — no points, streaks, badges, or celebratory confetti. The
    reward is understanding something true, plus a beautiful artifact to share.
  - **Not a classroom product.** Printable templates for educators are a
    post-launch add-on (§7), not a design driver. Designing for the classroom is
    what would pull this childish.

### Still open

- **Sandbox-first or story-first?** I've assumed story-first with the sandbox as
  the reward. The inverse (tool with optional tutorial) is a different product —
  closer to hatviz, which already exists.
- **How much maths?** Proofs are kept conceptual (hierarchy = why); the
  incommensurability argument is omitted entirely. An optional "go deeper" layer
  could serve the ~5% who want it without taxing the main path.

Neither is blocking. Default to the above and playtest early rather than debating
in the abstract — with people who don't like maths.
