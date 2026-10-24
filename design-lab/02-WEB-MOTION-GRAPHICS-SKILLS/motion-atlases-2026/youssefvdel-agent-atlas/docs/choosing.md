# Choosing: what to reach for

> Read this before you add any dependency. Most animation needs are now
> covered by CSS, and a library you didn't need is a library you maintain.
>
> Every version, count, and license here was read from a live API on
> **2026-10-20**. The linked pages carry the details.

---

## Step 0 — Do you need a library at all?

Modern CSS (2024–2026) covers most of what people reach for GSAP to do.

| If you need… | Use this, not a library |
|---|---|
| Scroll-linked reveals, parallax | `animation-timeline: view()` + `animation-range` |
| Page / modal transitions | View Transitions API (`@view-transition`, `startViewTransition`) |
| Entry animation for new elements | `@starting-style` + `transition-behavior: allow-discrete` |
| Animating a custom property | `@property` |
| Component-aware layout | `@container` + `cqi` / `cqw` units |
| Tabular figures, resting states | `color-mix()`, `oklch()`, `light-dark()` |

**The rule:** a one-off transition is CSS. A timeline with sequencing and
interruption needs a library.

Full reference: [`research/modern-css.md`](research/modern-css.md)

---

## Animation engines

| Reach for | When | Not the other one |
|---|---|---|
| **[GSAP](links/animation-core.md)** | Complex timelines, scroll choreography, production marketing sites | Heavy for simple fades |
| **[Motion](links/animation-core.md)** (`motion.dev`) | React components, layout animation, `layoutId` shared-element transitions | Weaker than GSAP for long scrubbed scroll timelines |
| **[anime.js v4](links/animation-core.md)** | Vanilla JS, real timeline control, small footprint, ESM-first | No React binding |
| **[react-spring](links/animation-core.md)** | React + physics, gesture-driven values | More boilerplate than Motion for layout work |
| **[Theatre.js](links/animation-core.md)** | The animation *is* the product — a visual timeline editor | Overkill for a hover transition |
| **CSS only** | Simple fades, transforms, one-off states | No interruption handling, no sequencing |

**GSAP is now free all the way up.** Since 3.13 (2025-04-29) every Club
plugin — SplitText, MorphSVG, DrawSVG, ScrollSmoother, InertiaPlugin — is
free for commercial use. Club GSAP wound down.

**GSAP is not MIT.** Its license is the "Standard 'no charge' license": free
for commercial use, but not OSI open source. Everything else on this list is
MIT, ISC, or Apache-2.0.

---

## Scroll

| Reach for | When |
|---|---|
| **[Lenis](links/scroll-and-reveal.md)** | Smooth scrolling that still respects native scroll. Integrates cleanly with GSAP ScrollTrigger. |
| **[Locomotive Scroll](links/scroll-and-reveal.md)** | A heavier virtual-scroll feel. Rebuilt on top of Lenis. |
| **CSS scroll-driven** | Reveals and parallax with zero JS. Best for static content pages. |
| **GSAP ScrollTrigger** | Pinned sections, scrubbed timelines, snap points. |

> **Do not use** `smooth-scrollbar` (untouched since 2023) or `ScrollReveal`
> (GPL-3.0, unmaintained since 2021) for new work. Lenis replaced both.

---

## Carousel, drawer, gesture, reordering

| Reach for | When |
|---|---|
| **[Embla](links/carousel-and-ui.md)** | Accessible carousel with the best swipe physics. Small. Not a framework. |
| **[Swiper](links/carousel-and-ui.md)** | Feature-rich with a huge plugin ecosystem — but 20 kB+ and opinionated. |
| **[Vaul](links/carousel-and-ui.md)** | Bottom drawer with gesture-to-dismiss. Focus trap and ARIA already handled. |
| **[SortableJS](links/gesture-and-drag.md)** | Drag-to-reorder that works with touch and keyboard. |
| **[Auto-Animate](links/gesture-and-drag.md)** | List reordering in about a kilobyte, framework-agnostic. |
| **[use-gesture](links/gesture-and-drag.md)** | Raw pointer / drag / pinch primitives. |

---

## Vector and runtime animation

| Reach for | When |
|---|---|
| **[Lottie](links/lottie-and-rive.md)** | Designer-exported JSON animation. The de-facto standard. |
| **[dotLottie](links/lottie-and-rive.md)** | Same content, WASM-compiled, themeable, smaller. |
| **[Rive](links/lottie-and-rive.md)** | Interactive, state-machine driven — animations that *respond* to input instead of just playing. |
| **[Rough.js](links/creative-and-3d.md)** | Hand-drawn, sketchy diagrams. |

---

## 3D and particles

| Reach for | When |
|---|---|
| **[React Three Fiber](links/creative-and-3d.md)** | 3D inside a React component tree, not a scene graph. |
| **[Drei](links/creative-and-3d.md)** | The helpers that make R3F pleasant. Install with it. |
| **[PixiJS](links/creative-and-3d.md)** | 2D WebGL renderer. Faster than canvas for many sprites. |
| **[tsParticles](links/creative-and-3d.md)** | Confetti, snow, cursor trails — the effects people actually ship. |
| **[OGL](links/creative-and-3d.md)** | Tiny WebGL wrapper, if you don't want Three.js's weight. |

---

## Code to video

| Reach for | When |
|---|---|
| **[Remotion](links/code-to-video.md)** | React components → MP4. The industry default. Free for individuals and small companies, paid for larger orgs. |
| **[Revideo](links/code-to-video.md)** | MIT-licensed Remotion fork, if the license doesn't work. |
| **[Motion Canvas](links/code-to-video.md)** | TypeScript scripted animation. Great for math and data visuals. |
| **[Manim](links/code-to-video.md)** | Python + LaTeX → animation. Unbeatable for mathematical explainers. |
| **[WebCodecs + mp4box.js](research/code-video.md)** | Low-level, in-browser encode and mux. Full control over timing. |
| **[Playwright](links/code-to-video.md) / [Puppeteer](links/code-to-video.md)** | Deterministic frame capture from a live page. |

**Determinism matters more than people expect.** To capture frames reliably:

1. Freeze the clock — drive time explicitly, never `Date.now()`
2. Seed the RNG — no `Math.random()` in a render path
3. Load fonts deterministically — `await document.fonts.ready` before capture
4. Use `--virtual-time-budget` (Chromium) or a fixed-step ticker
5. Capture the **canvas**, not the DOM, when the output is a video

---

## UI foundations

| Reach for | When |
|---|---|
| **[shadcn/ui](links/creative-craft.md)** | You want to own the code. Copy the component in and change it. |
| **[Base UI](links/creative-craft.md)** | Unstyled, accessible primitives. Bring your own styles. |
| **[Ark UI](links/creative-craft.md)** | Headless, framework-agnostic, good state-machine behaviour. |
| **[Cult UI](links/creative-craft.md)** | 150+ shadcn components already animated with Motion. |
| **[Aceternity UI](links/creative-craft.md)** | The gradient-blob and spotlight look, done properly. |
| **[Magic UI](links/creative-craft.md)** | Animated components, copy-paste, plus an MCP server. |
| **[React Bits](links/creative-craft.md)** | The largest open-source set of animated React / Next components. |

---

## The ones that make people stop and look

If the goal is *"this makes people stop and look"* rather than *"this works"*:

- **[hairline](links/creative-craft.md)** — 33 isometric line figures that answer
  the pointer. Zero dependencies, MIT. The `intensity` slider is worth
  stealing: it makes the interaction design space *legible*.
- **[cobe](links/ux-craft-2026.md)** — a spinning globe you can theme, a few kB.
- **[snapdom](links/ux-craft-2026.md)** — rasterises any DOM node to an image.
  For "share this card" features.
- **[number-flow](links/ux-craft-2026.md)** — numbers that animate when they
  change, and stay accessible.

More in [`research/creative-libs.md`](research/creative-libs.md).

---

## Anti-patterns

| Don't | Why |
|---|---|
| Reach for a library before checking if CSS does it | A 27 kB dependency for a fade is a real cost |
| Use GSAP Club plugins believing they're paid | Free since 3.13 |
| Pick a library by star count alone | `smooth-scrollbar` has 3.3k stars and hasn't moved since 2023 |
| Animate `width` / `height` / `top` / `left` | Layout thrash — animate `transform` and `opacity` |
| Use one clock for both discrete and continuous | See the two-clock rule below |
| Forget `prefers-reduced-motion` | An accessibility requirement, not a nice-to-have |
| Copy a skill repo without reading its `SKILL.md` | "Installs with npx" ≠ "understands your codebase" |

---

## The two-clock rule

Applies to every animation you write:

- **Discrete** change (which item is active) → long ease-out, ~700 ms on
  `(.32, .72, 0, 1)`
- **Continuous** input (where the pointer is) → **spring**, never a timed
  ease, because the target moves every frame and a timed ease is always
  chasing it

Mixing these is the most common production animation bug.
