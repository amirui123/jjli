---
name: agent-atlas
description: Use when building or choosing front-end code — picking an animation library, CSS technique, carousel, scroll library, 3D or video tool, UI component set, or an agent/design skill. Covers GSAP vs Motion vs anime.js, modern CSS (View Transitions, scroll-driven, @starting-style), Lottie/Rive, Remotion/code-to-video, shadcn/Base UI/Ark UI, and the design-skill ecosystem, with live-verified versions, licenses, and decision guides. Triggers on "which animation library", "best library for", "what should I use for a carousel", "before I start building", "design skills for Claude Code", "make my site look good", "agent skills for frontend".
---

# agent-atlas

A live-verified catalog of the front-end libraries and agent skills worth
using. Full repo: `~/Projects/agent-atlas` (or
<https://github.com/youssefvdel/agent-atlas>).

## The rule for this skill

**Read `docs/choosing.md` before you add any dependency.**

Modern CSS (2024–2026) covers most of what people reach for GSAP to do. A
27 kB dependency for a fade is a real cost, and it is a cost you maintain.

## How to use the catalog

```
1. docs/choosing.md            "I want a carousel"  →  Embla
2. docs/links/<category>.md     the links for that category
3. docs/research/<topic>.md     only if you need the exact API
```

Never start at layer 3. Never read a 130 KB document when a link file
answers the question.

**Every entry in a link file is one line:**

```
- **[GSAP](https://github.com/greensock/GSAP)** — GSAP is a framework-agnostic JS animation library…  
  `gsap` · Standard 'no charge' license · v3.15.0 · 29,523★
```

Name, link, what it is, package, license, version, stars. If you need the
API, that's layer 3.

## The routing table

| Need | Reach for | Page |
|---|---|---|
| Complex timelines, scroll choreography | **GSAP** | `docs/links/animation-core.md` |
| React layout animation, shared elements | **Motion** | `docs/links/animation-core.md` |
| Vanilla timeline, small footprint | **anime.js v4** | `docs/links/animation-core.md` |
| React + physics | **react-spring** | `docs/links/animation-core.md` |
| Smooth scroll | **Lenis** | `docs/links/scroll-and-reveal.md` |
| Accessible carousel | **Embla** | `docs/links/carousel-and-ui.md` |
| Bottom sheet, gesture dismiss | **Vaul** | `docs/links/carousel-and-ui.md` |
| Drag-to-reorder | **SortableJS** | `docs/links/gesture-and-drag.md` |
| Animate list changes | **Auto-Animate** | `docs/links/gesture-and-drag.md` |
| Designer-exported vector animation | **Lottie** | `docs/links/lottie-and-rive.md` |
| Interactive, state-machine animation | **Rive** | `docs/links/lottie-and-rive.md` |
| React → MP4 | **Remotion** | `docs/links/code-to-video.md` |
| 3D in React | **React Three Fiber** | `docs/links/creative-and-3d.md` |
| 2D WebGL, many sprites | **PixiJS** | `docs/links/creative-and-3d.md` |
| Component set you own | **shadcn/ui** | `docs/links/creative-craft.md` |
| Unstyled accessible primitives | **Base UI** / **Ark UI** | `docs/links/creative-craft.md` |
| Data visualisation | **D3** | `docs/links/data-and-visualization.md` |

**Do not use:** `smooth-scrollbar` (untouched since 2023) or `ScrollReveal`
(GPL-3.0, unmaintained since 2021). Lenis replaced both.

## The CSS-first table

Check this before you install anything.

| Need | Use this, not a library |
|---|---|
| Scroll reveal / parallax | `animation-timeline: view()` + `animation-range` |
| Page / modal transition | View Transitions API (`@view-transition`, `startViewTransition`) |
| Entry animation for new elements | `@starting-style` + `transition-behavior: allow-discrete` |
| Animating a custom property | `@property` |
| Component-aware layout | `@container` + `cqi` / `cqw` units |
| Tabular figures, resting states | `color-mix()`, `oklch()`, `light-dark()` |

Full reference: `docs/research/modern-css.md`

## The two-clock rule

Applies to every animation. It is the most common production animation bug.

- **Discrete** change (which item is active) → long ease-out, ~700 ms on
  `(.32, 0.72, 0, 1)`
- **Continuous** input (where the pointer is) → **spring**, never a timed
  ease, because the target moves every frame and a timed ease is always
  chasing it

## Things that get reported wrong

**GSAP's Club plugins are free.** Since 3.13 (2025-04-29) every plugin —
SplitText, MorphSVG, DrawSVG, ScrollSmoother, InertiaPlugin — is free for
commercial use. Club GSAP wound down. Advice saying they're paid is out of
date.

**GSAP is not MIT.** Its license is the "Standard 'no charge' license" — free
for commercial use, but not OSI open source. Every other library in this
catalog is MIT, ISC, Apache-2.0, or equivalent.

**The `skills` CLI is not Anthropic's.** `npx skills add <owner>/<repo>` is
`vercel-labs/skills` — MIT, harness-agnostic, installs into 75+ agents.
Anthropic publishes *skills*; that CLI installs them.

**Stars lie, installs don't.** `designed-by-ai/skills` has 19 stars and
916,408 installs — but its README points at a *different* repo, so those
installs belong to `sleekdotdesign/agent-skills`. Rank by installs and
shipped `SKILL.md` files.

**A repo with 80k stars is not automatically a skill.** `DavidHDev/react-bits`
has 49.8k stars and ships **zero** `SKILL.md` files — its `skill-*.webp`
files are marketing images. Check with:

```sh
gh api repos/<owner>/<repo>/git/trees/HEAD?recursive=1 \
  --jq '[.tree[].path | select(test("SKILL.md$"))] | length'
```

**`AGENTS.md` silently stops loading.** Claude Code v2.1.277+ reads
`AGENTS.md` natively, but **only if no `CLAUDE.md` or `CLAUDE.local.md`
exists anywhere above it**. Adding a `CLAUDE.local.md` kills `AGENTS.md`
loading with no error.

## The design skills that change output quality

If the complaint is that the agent produces generic output, these are the
fix. Full list: `docs/links/design-skills.md` (41 entries).

| Skill | Repo | What it gives you |
|---|---|---|
| `frontend-design` | `anthropics/skills` | 1,007,521 installs. A plain markdown file that bans the exact defaults models reach for. A 6-agent bake-off found Opus **worst** raw and **best** with it loaded. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | 760,123 installs. A linter that reads your own UI code. |
| `taste-skill` | `Leonxlnx/taste-skill` | 640,624 installs. A design-sensibility layer. |
| `impeccable` | `pbakaus/impeccable` | Design-craft rules with a working launcher and a `critique` command. |

**The skill supplies taste, not the model.** That is the single most useful
fact in this catalog for anyone who complains that agents make slop.

## The craft floor

Whatever you build, these are the numbers. They are what separates a page
that looks considered from one that looks generated.

- Body text ≥ 4.5:1 contrast
- Display type ≤ 6rem
- Body measure 65–75 characters
- One `h1`, no heading-level skips
- Visible focus ring on every interactive element
- `prefers-reduced-motion` honored
- No horizontal overflow at 390px
- Headline ≤ 2 lines at every viewport

## Rules

1. **Never quote a version, download count, or star count from memory.** Read
   the library page — it carries a `verified_on` date.
2. **Check the CSS table before adding a dependency.**
3. **Read the "Skip it when" section.** That is the part that saves a
   rebuild.
4. **Prefer the canonical repo.** Some packages have same-named impostors
   with a fraction of the stars.
5. **Report the license.** It is in the frontmatter, copied from the
   registry, not paraphrased.
6. **Animate `transform` and `opacity`,** never `width`/`height`/`top`/`left`.
7. **Honor `prefers-reduced-motion`.** It is an accessibility requirement,
   not a nice-to-have.

## Where to look

| Question | File |
|---|---|
| What do I reach for before starting? | `docs/choosing.md` |
| Which library, and what are its real APIs? | `docs/research/animation-libraries.md` |
| What can CSS do natively in 2026? | `docs/research/modern-css.md` |
| How do I make video from code? | `docs/research/code-video.md` |
| Which AI design skills are real? | `docs/research/design-skills.md` |
| What skills are on this machine? | `data/skills.tree.md` |
| Live stars / versions / licenses | `data/libs.live.json` |
| Every link, by category | `docs/links/*.md` |

## Install this skill

```sh
npx skills add youssefvdel/agent-atlas
```

Or copy `SKILL.md` into your agent's skills directory.
