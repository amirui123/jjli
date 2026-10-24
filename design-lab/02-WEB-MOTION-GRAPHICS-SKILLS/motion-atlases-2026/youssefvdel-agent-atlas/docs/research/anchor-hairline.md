# Anchor case: `lucasmarkes/hairline`

> The reference point for this atlas. Everything in `docs/libraries/` was chosen
> with this repo in mind: what is the *caliber* of a well-made interactive
> front-end library, and what else lives at that altitude?

**Verified 2026-10-20** against the GitHub REST API and the npm registry.

| Field | Value |
|---|---|
| Repo | [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) |
| Live demo | <https://hairline.lucasmarkes.com> |
| npm | [`@lucasmarkes/hairline`](https://www.npmjs.com/package/@lucasmarkes/hairline) |
| Latest version | `0.5.1` (published 2026-10-14) |
| Stars | 2,459 |
| License | MIT |
| Language | TypeScript |
| Topics | `animation`, `isometric`, `react`, `shadcn`, `svg`, `typescript` |
| Dependencies | **none** |
| Peer deps | `react >= 18` — **optional** |
| Exports | `.`, `./react`, `./package.json` |
| ESM | only |
| Last push | 2026-10-14 |

## What it is

Thirty-three isometric line figures that answer the pointer. The description in
the README says "six" — the repo grew; the package description is the newer
number, the README header is the older one.

Each figure is an isometric line drawing built from rounded solids in a single
stroke. Nothing is rasterised: it's SVG geometry, so it stays crisp at any size
and the whole thing is inspectable in devtools.

## The API

### React

```tsx
import { Terrain } from "@lucasmarkes/hairline/react";

export function Hero() {
  return <Terrain />;
}
```

The figure fills its parent's width at a **5:4 aspect ratio**. The entry is a
client module, so a Server Component can render it without its own
`"use client"`. Every component accepts the options below plus any `<div>`
attribute, and forwards its ref to the `<div>`.

### Anything with a DOM (the interesting part)

```ts
import { terrain } from "@lucasmarkes/hairline";

const figure = terrain(document.getElementById("figure")!, { play: true });

figure.update({ intensity: 0.8 });
figure.destroy();
```

A figure draws into the element you give it, at that element's width and a 5:4
aspect ratio. `update` changes options on the running figure; `destroy` removes
what the figure added. **That is the shape of a Svelte action**, so
`use:terrain={{ intensity }}` works as-is.

That last detail is the design tell. The library is framework-agnostic first,
with React as an optional peer, and its core API deliberately matches Svelte's
action contract so it drops into Svelte with no adapter.

### shadcn

```sh
npx shadcn@latest add https://hairline.lucasmarkes.com/r/hairline.json
```

The registry wrapper reads your theme's tokens, so the figures inherit your
palette instead of shipping their own.

## The figures

All 33, with the behaviour the pointer triggers. `intensity` is the single
knob every figure exposes — it scales the *strength* of the response, never
changing the gesture.

| Function | Component | What it does |
|---|---|---|
| `riffle` | `Riffle` | Tray of eight cards; the card under the pointer stands up, arrow keys walk the cards |
| `terrain` | `Terrain` | 81 pillars on a plinth that rise around the pointer |
| `exploded` | `Exploded` | App window in four layers; moving across opens the gap, moving down picks a layer |
| `phosphor` | `Phosphor` | Dot matrix that plays a loop and fades like phosphor where the pointer paints |
| `slow` | `Slow` | Crates on a belt through a gate; hovering slows the clock without stopping it |
| `turntable` | `Turntable` | Blocks on a turntable; a flick spins it, it settles on the nearest quarter turn |
| `keyboard` | `Keyboard` | 60-key board; the key under the pointer sinks, neighbours follow down |
| `elevator` | `Elevator` | Four floors beside an open shaft; pointer height picks a floor, the car travels there |
| `phone` | `Phone` | Phone in layers (glass, board, battery, shell); across opens the gap, down picks a layer |
| `laptop` | `Laptop` | Thin laptop on its hinge; pointer height sets the lid, it follows on a spring |
| `terminal` | `Terminal` | Terminal with history in rows; pointer height scrolls back, the line under it lifts |
| `cabinet` | `Cabinet` | Rack of twelve blades, a few half out; pointer height pulls the nearest ones out |
| `branches` | `Branches` | Commit graph forking off main; the commit under the pointer rises, its history after it |
| `vault` | `Vault` | Vault door with dial and three bolts; detents every ten, the combination draws the bolts back |
| `lockers` | `Lockers` | Bank of twelve lockers, one ajar at rest; the one under the pointer opens |
| `padlock` | `Padlock` | Shackle in; as the pointer nears, the shackle lifts out and swings open |
| `patch` | `Patch` | Patch panel of 24 ports with cables; the cable under the pointer lifts, neighbours lean away |
| `dish` | `Dish` | Parabolic dish on a two-axis gimbal; the pointer aims it, it follows on a spring |
| `router` | `Router` | Router with antennas up; each antenna leans toward the pointer, nearest most |
| `loupe` | `Loupe` | Stand loupe on ruled sheet; the pointer drags it, rules pass enlarged under the glass |
| `sieve` | `Sieve` | Three test sieves over a pan; pointer height picks one, it rises clear of the stack |
| `rail` | `Rail` | Garment rail with seven hangers; the pointer brushes them, each rocks away |
| `plug` | `Plug` | Wall socket and a plug on the floor; the pointer draws the plug up, it stops short and falls back |
| `meter` | `Meter` | *(continues in the README table)* |
| `...` | | 33 total — the live demo is the index |

The README's table also documents how `intensity` escalates for each figure
("the ripple spreads further from the pulled card", "the tray closes further",
etc.), which is a neat bit of interaction design writing.

## Why it's in the atlas

1. **Zero dependencies.** The whole thing is SVG geometry and a pointer
   handler. There is no animation engine underneath.
2. **The core API is a framework primitive.** `mount` → `{ update, destroy }`
   matches a Svelte action, so the DOM build is the *primary* API and React is
   a thin optional binding — not the other way round.
3. **One knob, many gestures.** `intensity` is a scalar the demo exposes as a
   slider, which makes the figures *legible*: you can see the design space
   rather than guessing at it.
4. **It ships a registry entry and its own agent skills.** See below.

## The repo ships agent skills

Unusual and worth knowing: `skills/hairline-create/` and `skills/hairline-adopt/`
are Claude Code skills for *authoring new figures in the Hairline style*.

`hairline-create` is a genuinely well-written skill. Its structure:

- **Step 0 — Source.** Only when the request came with an `.svg`. Runs
  `read.mjs` to measure the drawing, producing `source.md` with questions to
  answer. The object and its parts are then fixed.
- **Step 1 — Concept.** Read `concepts.md`, then offer two or three concepts,
  one line each: *name, the object, what the pointer does, what the read-out
  says, where the tour stops.* Wait for the person to pick. "A concept that
  needs a label to be understood is not a concept yet."
- **Step 2 — Build.** Read `rules.md` — "the ten rules are not advice: a figure
  that breaks one is not finished." Read only the API index at the top of
  `kernel.js`, down to `var HL`; **do not read the code under it.** Then write
  `<name>.js` in the shape of the examples, defining
  `mount({ stage, svg, read }, value)` returning `{ set, destroy }`, ending with
  `hairline({ name, means, rules, range, tour, mount })`.
- **Step 3 — Check.** Build with `node build.mjs <name>.js`, verify with
  `look.mjs`.

The `range` field is the clever part: it's the one number the slider drives, at
intensity 0, 0.5 and 1, and the three values must move one way. The figure's
own units, not 0-to-1.

`hairline-adopt` does the inverse: take someone's SVG (icon, logo,
illustration), read the drawing, rebuild the object as solids on the engine,
and give it a gesture. It explicitly **never animates the SVG itself and never
traces it** — "the drawing gives the identity, and the figure is built new".

## The rules

The skill's `rules.md` holds ten non-negotiable rules for a figure. The
constraint "one figure, one idea. A concept that needs a label to be
understood is not a concept yet" is the one that shows the author's taste.

## Try it

```sh
npm i @lucasmarkes/hairline
```

Then the live demo with an `intensity` slider:
<https://hairline.lucasmarkes.com>

## Related

- `docs/libraries/creative-libs.md` — the wider "hairline class" catalog
- `docs/ecosystem/agent-skills-ecosystem.md` — how the skill spec works
