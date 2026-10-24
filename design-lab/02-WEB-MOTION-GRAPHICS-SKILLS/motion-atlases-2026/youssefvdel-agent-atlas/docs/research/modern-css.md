# Modern CSS & CSS Animation — Verification-Backed Reference (2024–2026)

> **Compiled:** 2026-10-20 (EEST)
> **Data sources:** MDN browser-compat-data (`mdn/browser-compat-data` @ `12bc026`, 2026-10-19), `web-features` (published Baseline dataset, build `3.43.0-dev-20261019130309-f898c6f`), caniuse feature JSON (`Fyrd/caniuse` @ main), plus MDN/web.dev/WebKit/Chromium release notes.
>
> **How to read the support tables.** "Baseline" is the official web-platform signal:
> `Baseline Newly available` = all four core engines (Chrome, Edge, Firefox, Safari) shipped it, but it has not been available for 30 months;
> `Baseline Widely available` = additionally available for 30+ months;
> `Limited` / `not Baseline` = at least one core engine lacks it.
> Version numbers are the **first stable release** with the feature, per BCD.
>
> **Browser release status as of 2026-10-20:** Chrome 155 (stable), Edge 155, Firefox 158 (stable) / 159 (beta, ships 2026-10-27), Safari 27 (current, released 2026-09-14).

---

## Table of contents

1. [Cheat sheet — all techniques at a glance](#1-cheat-sheet--all-techniques-at-a-glance)
2. [Scroll-driven animations](#2-scroll-driven-animations)
3. [View Transitions API](#3-view-transitions-api)
4. [CSS Houdini](#4-css-houdini)
5. [Discrete transitions: `@starting-style`, `transition-behavior`, `interpolate-size`](#5-discrete-transitions)
6. [`@property` — registered custom properties](#6-property--registered-custom-properties)
7. [Selectors: `:has()`, `@scope`, nesting](#7-selectors-has-scope-nesting)
8. [Container queries](#8-container-queries)
9. [Color: `oklch()`, `lab()`, `color-mix()`, `light-dark()`](#9-color)
10. [Layout & sizing: logical properties, `clamp()`, container query units, anchor positioning](#10-layout--sizing)
11. [Visual effects: masks, filters, blend modes, `clip-path`, 3D transforms](#11-visual-effects)
12. [Accessibility & motion safety](#12-accessibility--motion-safety)
13. [CSS animation libraries & tooling](#13-css-animation-libraries--tooling)
14. [Polyfills & progressive enhancement strategy](#14-polyfills--progressive-enhancement-strategy)
15. [Verification methodology & sources](#15-verification-methodology--sources)

---

## 1. Cheat sheet — all techniques at a glance

| # | Technique | What it does | Baseline status (2026-10-20) | Chrome / Edge / Firefox / Safari | Safe to ship? |
|---|---|---|---|---|---|
| 1 | `animation-timeline`, `scroll-timeline`, `view-timeline` | Drive animations from scroll/viewport position instead of time | **Limited** — not Baseline (Firefox ships in 159, 2026-10-27) | 115 / 115 / **159** / 26 | Yes, with `@supports` guard |
| 2 | `animation-range`, `animation-range-start/end` | Map keyframe attachment to named timeline ranges | **Limited** (same as above) | 115 / 115 / **159** / 26 | Yes, with guard |
| 3 | `timeline-scope` | Let a descendant reference an ancestor's named timeline | **Limited** | 116 / 116 / **159** / 26 | Yes, with guard |
| 4 | View Transitions — same-document | Animate DOM state changes in an SPA | **Baseline Newly available** (low 2025-10-14) | 111 / 111 / 144 / 18 | ✅ Yes |
| 5 | View Transitions — cross-document (`@view-transition`) | Animate MPA navigations | **Limited** — Firefox has no support | 126 / 126 / — / 18.2 | With `@supports` guard |
| 6 | `view-transition-class`, `::view-transition-group()` | Share animation across multiple elements | **Baseline Newly available** (low 2025-10-14) | 125 / 125 / 144 / 18.2 | ✅ Yes |
| 7 | View transition **types** (`options.types`) | Branch animations by transition kind | **Baseline Newly available** (low 2026-01-13) | 125 / 125 / 147 / 18.2 | ✅ Yes |
| 8 | Houdini **Paint API** (`CSS.paintWorklet`) | JS-drawn custom backgrounds/borders/masks | **Chromium-only** | 65 / 65 / — / — | Chromium-only + fallback |
| 9 | Houdini **Animation Worklet** | Procedural animation on a separate thread | **Chromium-only, experimental** | behind flag in Chrome | Avoid in production |
| 10 | Houdini **Effect Worklet** | Custom filter primitives | **Chromium-only, experimental** | behind flag in Chrome | Avoid in production |
| 11 | `@starting-style` | Define the "from" state for entry transitions | **Baseline Newly available** (low 2024-08-06) | 117 / 117 / 129 / 17.5 | ✅ Yes |
| 12 | `transition-behavior: allow-discrete` | Transition discrete props (`display`, `content-visibility`) | **Baseline Newly available** (low 2024-08-06) | 117 / 117 / 129 / 17.4 | ✅ Yes |
| 13 | `interpolate-size` | Animate `width`/`height`/`min-*`/`max-*` with intrinsic size | **Limited** — Chromium only | 129 / 129 / — / — | Chromium-only + fallback |
| 14 | `:has()` | Style an element based on its descendants/siblings | **Baseline Widely available** (high 2026-06-19) | 105 / 105 / 121 / 15.4 | ✅ Yes |
| 15 | `@scope` | Scope rules to a subtree | **Baseline Newly available** (low 2026-03-24) | 143 / 143 / 146 / 26.4 | ✅ Yes |
| 16 | CSS **nesting** | Nest selectors natively | **Baseline Widely available** (high 2026-06-11) | 120 / 120 / 117 / 17.2 | ✅ Yes |
| 17 | `@property` | Register typed, animatable custom properties | **Baseline Newly available** (low 2024-07-09) | 85 / 85 / 128 / 16.4 | ✅ Yes |
| 18 | **Container queries** (size) | Respond to container size, not viewport | **Baseline Widely available** (high 2025-08-14) | 105 / 105 / 110 / 16 | ✅ Yes |
| 19 | **Container style queries** (`@container style()`) | Respond to container's custom-property values | **Baseline Newly available** (low 2026-05-19) | 111 / 111 / 151 / 18 | ✅ Yes |
| 20 | **Container scroll-state queries** | Query `scrolled()`/`snapped()`/`stuck()` state | **Limited** — Chromium only | 133 / 133 / — / — | Chromium-only |
| 21 | **Container anchor-position queries** (`anchored()`) | Query an anchor's position from a container | **Limited** — Chromium only | 143 / 143 / — / — | Chromium-only |
| 22 | `color-mix()` | Mix two or more colors in a given space | **Baseline Widely available** (high 2025-11-09) | 111 / 111 / 113 / 16.2 | ✅ Yes |
| 23 | `color-mix()` variadic (3+ colors) | Mix more than two colors | **Limited** | — / — / 150 / 27 | No — 2-color only |
| 24 | `oklch()` / `oklab()` | Perceptually uniform color space | **Baseline Widely available** (high 2025-11-09) | 111 / 111 / 113 / 15.4 | ✅ Yes |
| 25 | `lab()` / `lch()` | CIE Lab perceptual space | **Baseline Widely available** | 111 / 111 / 113 / 15 | ✅ Yes |
| 26 | `light-dark()` | Two colors, picked by `color-scheme` | **Baseline Newly available** (low 2024-05-13) | 123 / 123 / 120 / 17.5 | ✅ Yes |
| 27 | **Logical properties** | Writing-mode-aware sizing/inset | **Baseline Widely available** (high 2024-03-20) | 89 / 89 / 66 / 15 | ✅ Yes |
| 28 | `clamp()` / `min()` / `max()` | Fluid sizing | **Baseline Widely available** (high 2023-01-28) | 79 / 79 / 75 / 13.1 | ✅ Yes |
| 29 | **Container query units** (`cqi`/`cqw`/`cqb`/`cqh`) | Size relative to the container | **Baseline Widely available** | 105 / 105 / 110 / 16 | ✅ Yes |
| 30 | **Anchor positioning** | Position elements relative to an anchor | **Limited** as a whole; core is Baseline Newly available | 125 / 125 / 147 / 26 | ✅ Yes for core; `position-anchor` is 151+/27+ |
| 31 | `mask` / `mask-image` | Mask an element with images/gradients | **Baseline Widely available** (high 2026-06-07) | 120 / 120 / 53 / 15.4 | ✅ Yes |
| 32 | `mask-border` | Mask with element's own border shape | **Limited** — Safari only | — / — / — / 17.2 | No |
| 33 | `filter` | Pixel filters on an element | **Baseline Widely available** (high 2019-03-07) | 53 / 12 / 35 / 9.1 | ✅ Yes |
| 34 | `backdrop-filter` | Filter what's behind an element | **Baseline Newly available** (low 2024-09-16) | 76 / 79 / 103 / 18 | ✅ Yes |
| 35 | `mix-blend-mode` | Blend element with backdrop | **Baseline Widely available** (high 2022-07-15) | 41 / 79 / 32 / 8 | ✅ Yes |
| 36 | `clip-path` | Clip element to a shape | **Baseline Widely available** (high 2023-07-21) | 88 / 88 / 71 / 13.1 | ✅ Yes |
| 37 | `transform-style: preserve-3d` + `perspective` | 3D rendering contexts | **Baseline Widely available** (high 2024-09-14) | 36 / 12 / 16 / 15.4 | ✅ Yes |
| 38 | `animation-composition: add` | Add/combine animations on the same property | **Baseline Widely available** | 112 / 112 / 115 / 16 | ✅ Yes |
| 39 | `@property` + `transition` | Animate custom properties (gradients, angles) | **Baseline Newly available** (low 2024-07-09) | 85 / 85 / 128 / 16.4 | ✅ Yes |
| 40 | `Temporal` API (JS) | High-precision dates/times for animation scheduling | **Limited** — not in Safari | 144 / 144 / 139 / — | No (JS-only, Safari pending) |

**Legend:** ✅ = safe to use unconditionally · "with guard" = wrap in `@supports` · "Chromium-only" = progressive enhancement required.

---

## 2. Scroll-driven animations

### What it does

Scroll-driven animations replace the *time* axis of a CSS animation with a **scroll position** or **element visibility** axis. The animation's progress (0%–100%) is derived from where the user is in a scroll container, or from how much of a subject element is visible in a scrollport. Because the timeline is not wall-clock time, the animation is **scrubbable**: scrolling backwards runs it backwards, and it stays in sync with content no matter how fast the user scrolls.

Three timeline types:

| Timeline | Driven by | Defined with |
|---|---|---|
| **Scroll timeline** | Progress through a scroll container | `scroll()` / `scroll(nearest)` / `scroll(root)` |
| **View timeline** | Visibility of a subject element | `view()` / `view(block)` / `view(inline)` |
| **Named timeline** | A named timeline on an ancestor | `scroll-timeline-name` / `view-timeline-name` |

### Minimal working example — scroll progress bar

```html
<div class="scroller">
  <div class="progress"></div>
  <div class="content">…lots of content…</div>
</div>
```

```css
.scroller {
  height: 60vh;
  overflow-y: scroll;
  scroll-timeline-name: --scroller;   /* publish this timeline */
  scroll-timeline-axis: block;
}

.progress {
  position: sticky;
  top: 0;
  height: 4px;
  background: hotpink;

  animation: grow linear;
  animation-timeline: --scroller;     /* consume the named timeline */
  animation-fill-mode: both;
}

@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

> **Key caveat:** `animation-duration: auto` is the default for a scroll/view timeline, so you rarely set a duration. But **for Firefox parity** set `animation-duration: 1ms` — Firefox historically required a non-auto duration to run timeline-driven animations. MDN explicitly recommends `animation-duration: 1ms` to make effects consistent across browsers.

### Minimal working example — reveal on scroll (view timeline)

```css
/* The subject element defines the timeline */
.reveal {
  view-timeline-name: --reveal;
  view-timeline-axis: block;
}

/* A descendant animates against it */
.reveal-child {
  animation: slide-in linear both;
  animation-timeline: --reveal;
  animation-range: entry 0% cover 40%;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(40px) scale(.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Minimal working example — parallax without JavaScript

```css
/* The scrolling element is the scroll container */
.hero {
  height: 100vh;
  overflow-y: scroll;
  scroll-timeline-name: --hero-scroll;
}

.hero__bg {
  /* background moves slower than the page = parallax */
  animation: parallax linear both;
  animation-timeline: --hero-scroll;
  animation-range: 0% 100%;
}

@keyframes parallax {
  from { transform: translateY(0); scale(1); }
  to   { transform: translateY(30%); scale(1.2); }
}
```

### `animation-range` — mapping keyframes onto named ranges

`animation-range` takes `<timeline-range-name> <percentage>` pairs. Six named ranges exist:

| Range name | Meaning |
|---|---|
| `cover` | From the subject first entering the scrollport to last leaving it |
| `contain` | While the subject fully covers the scrollport (or is fully contained) |
| `entry` | From the subject starting to enter the scrollport until fully entered |
| `exit` | From the subject starting to leave until fully exited |
| `entry-crossing` | While the subject crosses the scrollport's start edge |
| `exit-crossing` | While the subject crosses the scrollport's end edge |

```css
.anim {
  animation: grow linear both;
  animation-timeline: view();
  animation-range: entry 20% exit 80%;
  /* or the longhands */
  animation-range-start: entry 20%;
  animation-range-end: exit 80%;
}
```

### `timeline-scope` — using an ancestor's timeline from a descendant

A timeline named on an element is only visible to its **descendants** by default. `timeline-scope` hoists it to a common ancestor so siblings can consume it:

```css
html {
  timeline-scope: --page-scroll;
}
body {
  scroll-timeline-name: --page-scroll;
}
header {
  /* header is NOT a descendant of body in some layouts — this makes it work */
  animation: shrink linear both;
  animation-timeline: --page-scroll;
}
```

### `@supports` detection

Feature-detect with the exact property you intend to use. Note that `@supports (animation-timeline: scroll())` is the robust form — plain `animation-timeline: auto` is true in browsers that only partially implement it.

```css
@supports (animation-timeline: view()) {
  .reveal {
    animation: slide-in linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 30%;
  }
}

@supports not (animation-timeline: view()) {
  /* Fallback: plain time-based animation, or no animation at all */
  .reveal { opacity: 0; transform: translateY(24px); }
}
```

### Browser support (verified)

Source: BCD `css/properties/animation-timeline.json` @ `12bc026`; web-features `scroll-driven-animations`.

| Feature | Chrome | Edge | Firefox | Safari | Chrome Android | Safari iOS |
|---|---|---|---|---|---|---|
| `animation-timeline` | 115 | 115 | **159** | 26 | 115 | 26 |
| `view-timeline` / `-axis` / `-inset` / `-name` | 115 | 115 | **159** | 26 | 115 | 26 |
| `scroll-timeline` / `-axis` / `-name` | 115 | 115 | **159** | 26 | 115 | 26 |
| `animation-range` / `-start` / `-end` | 115 | 115 | **159** | 26 | 115 | 26 |
| `timeline-scope` | 116 | 116 | **159** | 26 | 116 | 26 |
| `ScrollTimeline` / `ViewTimeline` (JS) | 115 | 115 | **159** | 26 | 115 | 26 |

> ⚠️ **Firefox timing (important):** BCD lists Firefox **159**, which is still in **Beta** and is scheduled to ship **2026-10-27** — one week after this document's compile date. As of **2026-10-20**, Firefox **158 (stable)** does **not** support scroll-driven animations. Firefox had this behind `layout.css.scroll-driven-animations.enabled` (Bugzilla bug **1324602**, milestone 159). Treat the feature as **not Baseline today**, but shipping Firefox 159 on Oct 27 makes it Baseline Newly available.
>
> Safari shipped scroll-driven animations in **Safari 26** (2025-09-15); **Safari 26.4** added **threaded** scroll-driven animations, running them on the compositor thread.

### Practical caveats

- **Never use scroll-driven animation for anything load-bearing.** If a user can't or won't scroll, the animation may never run. Content must be readable in the initial state.
- **Don't fight the user's scroll.** Driving transforms against scroll can cause motion sickness. Respect `prefers-reduced-motion` (see §12).
- **`animation-duration: 1ms`** for Firefox consistency (MDN guidance).
- **Performance:** scroll-driven animations can run off the main thread, but only when the animated properties are compositor-friendly (`transform`, `opacity`, `filter`). Animating `width`, `top`, or `background-position` forces main-thread layout/paint on every frame.
- **`view-timeline-inset`** is the correct way to make a view timeline trigger earlier/later than the default viewport bounds; use it instead of negative `animation-range` percentages where possible.
- Firefox 158 and earlier: **no support at all**. A `@supports` guard is mandatory if you care about Firefox users today.

---

## 3. View Transitions API

### What it does

The View Transitions API animates *between two states* of a page. The browser captures the "old" state as a set of images, applies your DOM change, captures the "new" state, and then cross-fades/moves between them using a **pseudo-element tree** you can style with CSS.

Two flavors:

- **Same-document** — one URL, DOM changes in place (SPAs, tab switches, expanding cards). Triggered by `document.startViewTransition()`.
- **Cross-document** — a real navigation between two pages (MPAs). Triggered by a `@view-transition { navigation: auto; }` rule in **both** documents.

### Minimal working example — same-document

```js
document.getElementById('open').addEventListener('click', () => {
  if (!document.startViewTransition) {
    openDialog();          // fallback for older browsers
    return;
  }
  document.startViewTransition(() => openDialog());
});
```

```css
/* Give the dialog and the button distinct "names" so they're tracked */
#open  { view-transition-name: open-button; }
dialog { view-transition-name: dialog; }

/* Style the generated pseudo-elements */
::view-transition-old(dialog),
::view-transition-new(dialog) {
  animation-duration: .3s;
}
```

### The pseudo-element tree

```
::view-transition
└── ::view-transition-group(name)        ← the group box (position + size)
    ├── ::view-transition-image-pair(name)
    │   ├── ::view-transition-old(name)   ← snapshot of the old state
    │   └── ::view-transition-new(name)   ← snapshot of the new state
    └── ::view-transition-group-children(name)
```

### Minimal working example — cross-document (MPA)

Both `page-a.html` and `page-b.html` must opt in:

```css
/* page-a.html AND page-b.html */
@view-transition {
  navigation: auto;
}

/* Optional: name the transition type */
@view-transition {
  navigation: auto;
  types: slide;
}
```

Then the shared header morphs across the navigation:

```css
header { view-transition-name: site-header; }
```

### View transition **types** (branching by kind)

Types let one stylesheet serve several transitions. The transition declares its type; CSS matches it with `:` pseudo-class syntax.

```js
document.startViewTransition(update, {
  types: ['slide', 'gallery'],   // multiple types allowed
});
```

```css
/* Apply only when the "gallery" type is active */
html:active-view-transition-type(gallery) .card {
  view-transition-name: gallery-card;
}
```

> `active-view-transition-type()` matches the *currently active* type during the transition.

### `view-transition-class` — sharing an animation across many elements

By default, each `view-transition-name` gets its own group. `view-transition-class` lets multiple elements share a single group so they animate together:

```css
.list-item { view-transition-class: list-item; }  /* all share one group */
```

### Browser support (verified)

Source: BCD `api/ViewTransition.json`, `css/at-rules/view-transition.json`, `css/properties/view-transition-*.json`; web-features `view-transitions`, `cross-document-view-transitions`.

**Same-document (Baseline Newly available, low date 2025-10-14):**

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `document.startViewTransition()` | 111 | 111 | 144 | 18 |
| `ViewTransition` object | 111 | 111 | 144 | 18 |
| `::view-transition`, `-group`, `-old`, `-new`, `-image-pair` | 109 | 109 | 144 | 18 |
| `view-transition-name` | 111 | 111 | 144 | 18 |
| `view-transition-class` | 125 | 125 | 144 | 18.2 |
| `view-transition-group` (property) | 140 | 140 | — | — |
| `view-transition-scope` (element-scoped) | 147 | 147 | — | — |
| `options.types` / `active-view-transition-type()` | 125 | 125 | 147 | 18.2 |

**Cross-document (not Baseline — Firefox has no support):**

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `@view-transition` at-rule | 126 | 126 | **—** | 18.2 |
| `api.CSSViewTransitionRule` | 126 | 126 | **—** | 18.2 |

> **The reality check:** As of Oct 2026, same-document view transitions are Baseline Newly available in all four engines. **Cross-document view transitions are supported in Chromium and Safari 18.2+, but NOT in Firefox.** Cross-document is therefore *not* Baseline and must be feature-detected.

### Practical caveats

- **Feature-detect, always:** `if (document.startViewTransition) { … }`. Firefox only gained it in **144** (Oct 2025).
- **Cross-document requires opt-in in *both* documents** — a missing `@view-transition` rule in the destination page silently disables the transition.
- **Cross-document is same-origin only.**
- **`view-transition-name` must be unique** in the document at transition time. Duplicates cause the transition to be skipped (no error thrown).
- **Don't animate `view-transition-name` itself** — it is not animatable. Animate `view-transition-group` / `view-transition-old` / `view-transition-new` instead.
- **`::view-transition-group` needs explicit sizing** if you want a custom morph; by default the group animates position and size automatically.
- **Snapshots are images**, so text inside a transitioning element is not selectable and cannot be re-flowed mid-transition.
- **Reduced motion:** wrap your custom animations in `@media (prefers-reduced-motion: no-preference)`.

---

## 4. CSS Houdini

### What it does

Houdini is an umbrella of low-level CSS extensions that expose parts of the CSS engine to JavaScript, running in a **worklet** (a sandboxed, high-performance script context).

| Worklet | API | Purpose | Status |
|---|---|---|---|
| **Paint** | `CSS.paintWorklet.addModule()` | Draw custom backgrounds, borders, masks | Chromium only (stable-ish) |
| **Animation** | `CSS.animationWorklet` | Procedural animation on a dedicated thread | Chromium only, **experimental / behind flag** |
| **Effect** | `CSS.effectWorklet` | Custom filter primitives | Chromium only, **experimental / behind flag** |
| **Properties & Values** | `CSS.registerProperty()` | Register typed custom properties | **Baseline** (see §6) |

### Minimal working example — Paint API

```js
// paint.js
class HighlightPainter {
  static paint(ctx, geometry, props) {
    const { width, height } = geometry;
    const color = props.get('--highlight-color') || '#0af';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width * 0.5, height * 0.3);
    ctx.lineTo(width, height * 0.6);
    ctx.closePath();
    ctx.fill();
  }
  static get properties() {
    return ['--highlight-color'];
  }
}
registerPaint('highlight', HighlightPainter);
```

```js
// main.js
if (CSS.paintWorklet) {
  await CSS.paintWorklet.addModule('paint.js');
  document.body.classList.add('has-paint');
}
```

```css
body.has-paint .banner {
  background: paint(highlight);
}

/* Always provide a fallback for non-Chromium engines */
.banner {
  background: linear-gradient(180deg, #0af, #07f);
}
```

### Browser support (verified)

Source: BCD `api/CSS.json` → `paintWorklet_static`; `api/PaintWorkletGlobalScope.json`.

| API | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `CSS.paintWorklet` | **65** | 65 | — | — |
| `PaintWorkletGlobalScope` | 65 | 65 | — | — |
| `CSS.animationWorklet` | — (not in BCD stable data) | — | — | — |
| `CSS.effectWorklet` | — (not in BCD stable data) | — | — | — |

### Practical caveats

- **Paint API is Chromium-only.** Firefox and Safari have never shipped it. Always ship a plain-CSS fallback first.
- **Animation Worklet and Effect Worklet are not production-ready.** They are not in BCD's stable support table; Chromium only exposes them behind `chrome://flags/#enable-experimental-web-platform-features`. **Do not build on them.**
- **A paint worklet module is a separate file** and must be loaded before the `paint()` value is used, otherwise the property is invalid and the element falls back to its previous background.
- **Paint worklets cannot do layout or read the DOM.** They receive only geometry (a size) and the properties you declare. No `document` access.
- **Perf caveat:** the worklet re-runs on every repaint of the element; keep the drawing cheap.
- **`CSS.registerProperty()` (the Properties & Values API) IS Baseline** — it is the Houdini member you can safely use everywhere. See §6.

---

## 5. Discrete transitions

### `@starting-style` — transitions for elements that didn't exist before

**What it does:** Entry animations (e.g. a toast, a dialog, a popover) have no previous computed style to transition *from*. `@starting-style` defines that missing "before" state.

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity .3s, transform .3s, overlay .3s allow-discrete,
              display .3s allow-discrete;
}

/* The state before the element first exists */
@starting-style {
  .toast {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

> `transition` must list `display` (and usually `overlay`) with `allow-discrete`, otherwise the element is removed from the render tree instantly and the transition never runs.

### `transition-behavior: allow-discrete` — transitioning discrete properties

**What it does:** `display`, `content-visibility`, and `overlay` are "discrete" — they flip instantly rather than interpolating. `allow-discrete` makes them flip at the *end* (or start, per `direction`) of a transition, so they participate in transitions.

```css
.panel {
  display: none;
  opacity: 0;
  transition: opacity .25s, display .25s allow-discrete;
}
.panel.open {
  display: block;
  opacity: 1;
}
```

### `interpolate-size` — animating intrinsic sizes

**What it does:** `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height` are normally *not* interpolatable (they jump). `interpolate-size: allow-keywords` makes them interpolate when the keywords `auto`, `min-content`, `max-content`, `fit-content` are involved, by calculating the intrinsic size and animating from there.

```css
* {
  interpolate-size: allow-keywords;
}

.card {
  height: 200px;
  transition: height .4s ease;
}
.card.expanded {
  height: auto;              /* animates smoothly instead of snapping */
}
```

> Combined with `allow-discrete` on `content-visibility`, this enables the classic "auto-height accordion" without measuring in JS.

### Browser support (verified)

Source: BCD `css/at-rules/starting-style.json`, `css/properties/transition-behavior.json`, `css/properties/interpolate-size.json`; web-features `starting-style`, `transition-behavior`, `interpolate-size`.

| Feature | Chrome | Edge | Firefox | Safari | Baseline |
|---|---|---|---|---|---|
| `@starting-style` | 117 | 117 | 129 | 17.5 | Newly available (low 2024-08-06) |
| `transition-behavior` / `allow-discrete` | 117 | 117 | 129 | 17.4 | Newly available (low 2024-08-06) |
| `interpolate-size` | 129 | 129 | **—** | **—** | **Not Baseline** (Chromium only) |

> **Caveat — BCD notes on `allow-discrete` in Firefox:** MDN's `transition-behavior` page carries a compatibility note that Firefox's ability to transition `display` specifically has quirks (see mdn/browser-compat-data#26155). If you rely on `display` transitioning, test in Firefox; `content-visibility` is generally the safer property to transition.

### Practical caveats

- **`@starting-style` only applies to elements going from "not rendered" to "rendered."** It does not fire on elements that were already in the DOM.
- **`transition-behavior` must be on the *base* rule**, not the changed state — transitions are read from the element's own computed style at the time of the change.
- **`interpolate-size` is Chromium-only.** Provide a JS-measured fallback (or just accept the snap) for Firefox/Safari.
- `interpolate-size: allow-keywords` is **not** the default — you must opt in.

---

## 6. `@property` — registered custom properties

### What it does

`@property` registers a custom property with a **type**, an **inheritance flag**, and an **initial value**. This unlocks:

1. **Animating custom properties** (unregistered ones are just strings and can't interpolate).
2. **Type validation** — a bad value falls back to the initial value instead of poisoning the cascade.
3. **Inheritance control** — `inherits: false` keeps a token local.
4. **CSS fallbacks** — `initial-value` acts as a guaranteed fallback, unlike an unregistered property with no value.

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --glow-color {
  syntax: '<color>';
  inherits: true;
  initial-value: rgb(120 200 255);
}

@property --card-scale {
  syntax: '<number>';
  inherits: false;
  initial-value: 1;
}
```

```css
/* Animating a registered custom property */
.cone {
  --angle: 0deg;
  background: conic-gradient(from var(--angle), hotpink, transparent);
  transition: --angle .6s ease;
}
.cone:hover { --angle: 360deg; }
```

### Browser support (verified)

Source: BCD `css/at-rules/property.json` (+ `syntax`, `inherits`, `initial-value` sub-features); web-features `registered-custom-properties`.

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `@property` (all sub-features) | 85 | 85 | 128 | 16.4 |

**Baseline:** Newly available (low date **2024-07-09**). The JS equivalent, `CSS.registerProperty()`, shipped Chrome **78**, Edge 78, Firefox **128**, Safari **16.4**.

### Practical caveats

- **`syntax` is mandatory** in `@property`. A missing `syntax` makes the whole rule invalid.
- **`initial-value` is mandatory** unless `syntax` is the universal `*`. If `syntax` is `<angle>` and you omit `initial-value`, the rule is invalid.
- **Registered properties are validated at computed-value time**, so a bad value silently falls back to the initial value — which can mask authoring bugs.
- **`inherits: false` is a one-way door** for a token: children will not see the parent's value.
- **Animating a custom property forces style recalc**, so avoid animating huge numbers of them at once. Prefer animating `transform`/`opacity` where possible.
- **A registered `--angle` used in `conic-gradient` interpolates numerically** — but the gradient itself is re-rasterized each frame. For cheap animation, animate `transform: rotate()` instead.

---

## 7. Selectors: `:has()`, `@scope`, nesting

### `:has()` — relational pseudo-class

**What it does:** Selects an element that has a matching descendant (or sibling, with `~`/`+`).

```css
/* Style a card when it contains a figure */
.card:has(> img) {
  grid-template-columns: 120px 1fr;
}

/* Style a nav item that contains a submenu */
li:has(> ul) > a::after {
  content: " ▾";
}

/* Sibling form */
h2:has(+ p) { margin-bottom: 0; }
```

**Support (verified):** Chrome **105**, Edge 105, Firefox **121**, Safari **15.4** — **Baseline Widely available** (high date 2026-06-19). caniuse global usage ~95.9%.

**Caveats:**
- **`:has()` cannot be nested inside `:has()`.**
- **Specificity** is that of the most specific argument (like `:is()`), so `div:has(#id)` has `#id`'s specificity.
- **Performance:** the engine must evaluate descendants; modern engines optimise this well, but avoid `:has()` in hot loops over very large DOM subtrees.
- **Can't be used inside `@scope` to select the scope root's siblings** (`:scope` handles that).

### `@scope` — subtree-scoped rules

**What it does:** Limits a rule's applicability to a subtree, without needing a wrapper class or `:where()` chains.

```css
@scope (.card) {
  /* only applies inside .card, but .card itself is NOT matched */
  p { color: gray; }
  img { max-width: 100%; }
}

/* Scope limit — stop at a boundary */
@scope (.card) to (.content) {
  p { color: blue; }
}

/* Scoping root: also style the root element */
@scope (.card) {
  :scope { border: 1px solid; }
}
```

**Support (verified):** web-features `scope`: **Baseline Newly available** (low date 2026-03-24). Per-key detail from the published dataset:

| Sub-feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `css.at-rules.scope` (the `@scope` rule itself) | **118** | 118 | **146** | **26.4** |
| `api.CSSScopeRule` (CSSOM) | 118 | 118 | 146 | 17.4 |
| `css.selectors.nesting.at-scope` (`@scope` nested inside a style rule) | 143 | 143 | 142 | 26.2 |

> The **@scope at-rule** is the binding constraint: Chrome 118+, Firefox 146+, **Safari 26.4+**. Note that `CSSScopeRule` (the CSSOM interface) reached Safari in 17.4, but the **at-rule** did not land until Safari 26.4 — so `CSS.supports('at-rule', '@scope')` is the correct detection, not `CSSScopeRule in window`.

**Caveats:**
- **Safari 26.4 is the floor for the `@scope` at-rule.** If you need Safari 16–26.3 support, don't rely on `@scope`.
- **The at-rule and the CSSOM interface have different version floors** (Safari 26.4 vs 17.4). Detect with `CSS.supports('at-rule', '@scope')`.
- `@scope` changes **specificity**: the scope root's specificity is added to the inner selectors.
- Not to be confused with the **CSS Scoping Module Level 1** `scoped` *attribute* (`style-scoped` in caniuse), which Firefox alone supports (v21+) and which is a different, much smaller feature.

### CSS Nesting

**What it does:** Nest style rules inside a parent rule. Supported natively since 2023–2024.

```css
.card {
  padding: 1rem;
  border-radius: 8px;

  /* nested with & */
  &:hover { background: #eee; }

  /* nested descendant selectors */
  h2 { margin: 0 0 .5rem; }
  img { max-width: 100%; }

  /* nesting with no & — relaxed syntax */
  > footer { font-size: .8rem; }
}

/* @media can be nested too */
.card {
  color: black;
  @media (prefers-color-scheme: dark) {
    color: white;
  }
}
```

**Support (verified):** BCD `css/selectors/nesting.json` → Chrome **120**, Edge 120, Firefox **117**, Safari **17.2**. web-features `nesting`: **Baseline Widely available** (high date 2026-06-11). Note the *relaxed* parsing (omitting `&`) landed later than the original spec in some engines — see the caveats.

**Caveats:**
- **The relaxed syntax (bare element selector inside a nested rule) is not universally supported.** Safari 16.5–17.1 and Chrome 112–119 implemented the *older* spec text and will **reject** `.card { h2 { … } }`. **Always use `&` for maximum compatibility**, or use `& h2`.
- **Specificity:** the nesting selector `&` has the specificity of its parent selector (like `:is()`), not `:where()`.
- **Order matters:** declarations after a nested rule no longer "shift up" in the way Sass did — the CSS Nesting spec and the new `CSSNestedDeclarations` interface fixed this. BCD: `CSSNestedDeclarations` → Chrome **130**, Edge 130, Firefox **132**, Safari **18.2** (MDN lists `CSSNestedDeclarations` as Baseline 2024).
- Nested rules are **not** like Sass mixins — there's no `$variables`, no `@include`, and no implicit parent-selector concatenation beyond `&`.

---

## 8. Container queries

### Size container queries

**What it does:** Applies styles based on the **size of a container**, not the viewport. This is the correct way to build components that work at any placement.

```html
<div class="card-list">
  <article class="card">…</article>
</div>
```

```css
.card-list {
  container-type: inline-size;         /* establish a query container */
  container-name: card-list;            /* optional: name it */
}

.card {
  display: grid;
  gap: 1rem;
}

/* Below 30rem, stack the card */
@container card-list (max-width: 30rem) {
  .card {
    grid-template-columns: 1fr;
  }
}

/* Name-free version: query the nearest eligible ancestor container */
@container (min-width: 30rem) {
  .card { grid-template-columns: 200px 1fr; }
}
```

### `container-type` values

| Value | Queryable | Notes |
|---|---|---|
| `normal` | ✗ | Default; no containment |
| `size` | width + height | Requires the container to have a determinate size in both axes |
| `inline-size` | inline axis only | **Usually what you want** — height can stay auto |
| `scroll-state` | ✗ (enables scroll-state queries) | Chrome 133+ |

> `container-type: size` on a block in a vertical flow can collapse its height to 0 — use `inline-size` unless you truly need height queries.

### Style queries (`@container style(...)`)

**What it does:** Queries the **computed value of a custom property** on a container. This enables theme/variant reactivity without JS or prop drilling.

```css
.theme {
  --density: compact;
}

/* A style container can query its own custom properties */
@container style(--density: compact) {
  .row { padding: 2px 6px; }
}
```

```css
/* Range syntax (Chrome 142+, Firefox 151+) */
@container style(--density: compact < --density < spacious) {
  .row { padding: 8px 12px; }
}
```

**Support (verified):** BCD `css/at-rules/container.json` → `style_queries_for_custom_properties`: Chrome **111**, Edge 111, Firefox **151**, Safari **18**. Range syntax: Chrome **142**, Edge 142, Firefox **151**, Safari **—**. web-features `container-style-queries`: **Baseline Newly available** (low 2026-05-19).

### Scroll-state queries

**What it does:** Queries whether a scroll container is `scrollable()`, `scrolled()`, `snapped()`, or `stuck()`. Great for "fade out scrollbars", "shrink header when scrolled", "highlight the snapped item".

```css
.scroller {
  container-type: scroll-state;
}

.header {
  transition: padding .2s, opacity .2s;
}
@container scroller scroll-state(stuck: top) {
  .header { padding-block: 4px; }
}
@container scroller scroll-state(scrolled: y) {
  .header { opacity: .8; }
}
```

**Support (verified):** BCD `css/at-rules/container.json` → `scroll_state_queries`: Chrome **133** (parent), with `scrolled` at **144**; Firefox **—**; Safari **—**. web-features `container-scroll-state-queries`: **not Baseline**.

### Anchor-position container queries (`anchored()`)

**What it does:** From within a container, query whether an anchor element is visible relative to that container.

**Support (verified):** Chrome **143** only; Firefox and Safari **—**. Not Baseline.

### Container query units

`cqw` (container inline width), `cqh`, `cqi` (inline size), `cqb` (block size), `cqmin`, `cqmax`. These resolve against the **nearest eligible query container** (not the viewport).

```css
.card {
  container-type: inline-size;
}
.title {
  font-size: clamp(1rem, 5cqi, 2rem);   /* scales with the card, not the window */
}
```

**Support (verified):** Chrome/Edge **105**, Firefox **110**, Safari **16** — Baseline Widely available. caniuse `css-container-query-units`: global usage ~95.9%.

> **Important gotcha:** container query units resolve against the nearest *query container*. If no ancestor is a query container, they fall back to the **small viewport size**. Always establish `container-type` on the intended ancestor.

### Practical caveats

- **Query containers cannot be queried by themselves** for size — a container's own styles are evaluated before it becomes a container.
- **`container-type: size` requires both axes to be determinate.** Use `inline-size`.
- **Style queries need `container-type: normal` (the default) — do NOT set `container-type: size` on a style-query container.** A style-query container is any element; `container-name` alone is enough. Using `container-type: size` on the same element is fine but unnecessary.
- **Firefox 151 is the floor for style queries** — Firefox 150 and earlier lack them.
- **Firefox 158 and earlier don't support scroll-state or anchor-position container queries** at all.

---

## 9. Color

### `oklch()` / `oklab()` — perceptually uniform color

**What it does:** `oklch(lightness chroma hue)` gives perceptually even lightness steps, so a 50%-lightness color looks equally "half" bright across hues.

```css
:root {
  --brand-100: oklch(97% 0.02 250);
  --brand-500: oklch(63% 0.18 250);
  --brand-900: oklch(32% 0.09 250);
}
```

### `lab()` / `lch()` — CIE Lab

```css
--panel: lab(28% 20 -40);   /* lightness, a-axis, b-axis */
--panel: lch(28% 48 340);   /* lightness, chroma, hue */
```

### `color-mix()` — mixing colors

```css
.button {
  background: color-mix(in oklab, var(--brand) 70%, white);
  border-color: color-mix(in srgb, var(--brand) 80%, transparent);
}

/* Percentage-based custom property weighting (very handy) */
.tint {
  --amount: 30%;
  background: color-mix(in oklab, var(--brand), white var(--amount));
}
```

> **The `in <colorspace>` keyword is mandatory.** Mixing in `srgb` (the default for legacy) is often visually wrong; `in oklab` is usually what you want.

**Variadic `color-mix()` (3+ colors):** Chrome does not support 3+ arguments yet; Firefox **150** and Safari **27** do. web-features `color-mix-variadic`: **not Baseline**. Stick to two colors for now.

### `light-dark()` — theme-aware colors without media queries

**What it does:** Picks one of two colors based on the used `color-scheme`.

```css
:root {
  color-scheme: light dark;   /* declare support for both */
}
.card {
  background: light-dark(#ffffff, #14161a);
  color:       light-dark(#1a1a1a, #e8e8e8);
  border-color: light-dark(#d0d0d0, #333);
}
```

> Also declare it in HTML so the browser paints the correct page background:
> `<meta name="color-scheme" content="light dark">`

**Support (verified):**

| Feature | Chrome | Edge | Firefox | Safari | Baseline |
|---|---|---|---|---|---|
| `oklch()` / `oklab()` | 111 | 111 | 113 | 15.4 | Widely available (high 2025-11-09) |
| `lab()` / `lch()` | 111 | 111 | 113 | 15 | Widely available |
| `color-mix()` (2 colors) | 111 | 111 | 113 | 16.2 | Widely available (high 2025-11-09) |
| `color-mix()` (3+ colors) | — | — | 150 | 27 | Not Baseline |
| `light-dark()` | 123 | 123 | 120 | 17.5 | Newly available (low 2024-05-13) |
| `contrast-color()` | 147 | 147 | 146 | 26 | (auto-contrast text color) |

### Practical caveats

- **`color-mix()` percentages must sum to ≤ 100%** for the second color, otherwise the result is clamped/normalized. A `var(--amount)` above 100% will produce an invalid mix.
- **`light-dark()` requires `color-scheme` to be set** somewhere — otherwise the `light` value is always used.
- **`light-dark()` does not react to a manual theme toggle** unless you also change `color-scheme` on `:root` (e.g. `html.dataset.theme = 'dark'` → `:root { color-scheme: dark }`). This is the standard "auto + manual override" pattern.
- **`oklch()` gamut:** values outside sRGB are gamut-mapped by the browser, which can shift the color. Use `oklch(from ...)` relative color syntax or keep chroma conservative.
- **`contrast-color()`** picks black or white text for a given background — great for badges, but it isn't a full WCAG contrast guarantee for arbitrary backgrounds.

---

## 10. Layout & sizing

### Logical properties

**What it does:** Writing-mode-aware properties that replace physical `top/right/bottom/left` and `width/height`.

```css
.card {
  margin-block: 1rem;            /* top+bottom (or left+right in vertical writing modes) */
  margin-inline: 1.5rem;         /* left+right (or top+bottom) */
  padding-inline-start: 1rem;    /* start edge, flips with direction */
  inset-block-end: 0;            /* bottom in horizontal-tb */
  inline-size: 100%;             /* width in horizontal-tb */
  block-size: auto;              /* height in horizontal-tb */
}
```

**Support (verified):** web-features `logical-properties`: **Baseline Widely available** (high date 2024-03-20). Chrome 89 / Edge 89 / Firefox 66 / Safari 15. `logical-assignments` (the `inset`/`margin`/`padding` shorthands): Chrome 85, Firefox 79, Safari 14 — Baseline Widely available.

**Caveats:**
- **`margin-inline` etc. are *not* the same as `margin-left/right`** when `writing-mode` is vertical — that's the point, but it will surprise you if you're not checking.
- Physical and logical properties **cascade against each other** in source order. Keep them in one place.

### `clamp()` / `min()` / `max()` — fluid sizing

```css
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4.5rem);
}

.grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}

.sidebar {
  width: min(30rem, 100% - 2rem);
}
```

**Support (verified):** `min()`, `max()`, `clamp()` — Chrome **79**, Edge 79, Firefox **75**, Safari **13.1**. **Baseline Widely available** (high 2023-01-28). caniuse global usage ~97%+.

**Caveats:**
- **`vw` includes the scrollbar width** on desktop, which can cause horizontal overflow when a scrollbar appears. Use `100%` or `dvw`/`svw` where appropriate.
- **The `min()`/`max()`/`clamp()` argument order is `min < preferred < max`** — and mixing units is allowed and encouraged.

### Anchor positioning

**What it does:** Positions one element relative to another ("anchor") — tooltips, popovers, menus, dropdowns — with automatic fallback when space is tight.

```html
<button class="trigger">Menu</button>
<div class="menu">…</div>
```

```css
.trigger {
  anchor-name: --trigger;
}

.menu {
  position: absolute;
  position-anchor: --trigger;
  position-area: block-end span-inline-end;   /* place in a grid slot relative to anchor */
  margin-block-start: 6px;

  /* Try alternate positions if the preferred one doesn't fit */
  position-try-fallbacks: flip-block, flip-inline, --menu-bottom-left;
}

@position-try --menu-bottom-left {
  position-area: block-end span-inline-start;
  margin-inline-start: 0;
}
```

You can also use the `anchor()` function directly:

```css
.tooltip {
  position: absolute;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 8px;
}
```

**Support (verified):**

| Feature | Chrome | Edge | Firefox | Safari | Baseline |
|---|---|---|---|---|---|
| `anchor-name` | 125 | 125 | 147 | 26 | Newly available (low 2026-01-13) |
| `position-try` / `@position-try` | 125 | 125 | 147 | 26 | Newly available |
| `position-area` | 129 | 129 | 147 | 26 | Newly available |
| `anchor-scope` | 131 | 131 | 147 | 26 | Newly available |
| `position-try-fallbacks` | 128 | 128 | 147 | 26 | Newly available |
| `position-anchor` | **151** | **151** | **151** | **27** | Newly available (low 2026-09-13) |
| `anchor-size()` / `position-visibility` | 125 | 125 | 147 | 26 | — |

> **The `anchor-positioning` feature as a whole is NOT Baseline** because Safari 27 has the `position-visibility: anchor-valid` / `anchor-visible` plurals that Chrome and Firefox don't yet implement (web-features `anchor-positioning`: baseline `false`, support `{safari: 27, safari_ios: 27}` for that sub-feature). The **core** is Baseline Newly available in all four engines.
>
> `position-anchor` is the newest piece: Chrome/Edge **151**, Firefox **151**, Safari **27**.

**Caveats:**
- **`position-anchor` requires Chrome/Edge 151+, Firefox 151+, Safari 27+.** If you need broader support, use `anchor-name` + `position-area` instead (Chrome 125+, Firefox 147+, Safari 26+).
- **The anchored element must be `position: absolute` or `position: fixed`** (or another anchored positioning mode).
- **`position-area` uses a 3×3 implicit grid** — `top`, `bottom`, `left`, `right`, `center`, `span-all`, and the `block`/`inline`/`self` variants.
- **Always define `position-try-fallbacks`** — without them, an anchored popover can overflow the viewport.
- **`anchor-name` must be unique** in the document.

---

## 11. Visual effects

### CSS Masks

```css
.fade {
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-repeat: no-repeat;
}

.text-reveal {
  mask-image: linear-gradient(90deg, #000 0 70%, transparent 100%);
}

/* Animate a mask (works because mask-image gradients are interpolable) */
.fade {
  mask-image: linear-gradient(to bottom, #000 var(--p), transparent 100%);
  transition: --p .4s;
}

@property --p {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
```

**Support (verified):** BCD `css/properties/mask-image.json` → Chrome **120**, Edge 120, Firefox **53**, Safari **15.4**. web-features `masks`: **Baseline Widely available** (high date 2026-06-07). `mask-type` is Baseline Widely available. **`mask-border` is Safari-only (17.2)** — not Baseline.

**Caveats:**
- **The Chrome 120 floor is for the *full* mask shorthand** (`mask` as a shorthand). Individual `mask-*` longhands have much older support (Firefox 53, Safari 15.4).
- **`mask-composite` / `mask-mode`** are Chrome 120+, Firefox 53, Safari 15.4.
- **`mask-border` is Safari-only** — never rely on it.
- **Masks create a stacking context** and can affect `z-index` behaviour.
- **`mask-image` with an SVG URL** needs the SVG to have proper `viewBox`/dimensions.

### `filter` and `backdrop-filter`

```css
.card {
  filter: blur(2px) saturate(1.4) drop-shadow(0 4px 12px rgb(0 0 0 / .25));
  transition: filter .3s;
}
.card:hover { filter: brightness(1.1) contrast(1.05); }

.glass {
  background: rgb(255 255 255 / .12);
  backdrop-filter: blur(14px) saturate(1.6);
  -webkit-backdrop-filter: blur(14px) saturate(1.6);  /* still needed for older Safari */
}
```

**Support (verified):**

| Feature | Chrome | Edge | Firefox | Safari | Baseline |
|---|---|---|---|---|---|
| `filter` | 53 | 12 | 35 | 9.1 | Widely available (high 2019-03-07) |
| `backdrop-filter` | 76 | 79 | 103 | 18 | Newly available (low 2024-09-16) |

**Caveats:**
- **`backdrop-filter` requires Safari 18+.** Safari 16–17 lacks it (it was `-webkit-backdrop-filter` only in very old versions). Always include a semi-transparent background fallback.
- **`backdrop-filter` needs something to blur** — it blurs what's *behind* the element, so it only works over content, not over a transparent page background.
- **`filter` creates a containing block for fixed-position descendants** and a stacking context.
- **SVG filter references** (`filter: url(#id)`) are **not** Baseline — web-features `filter-function` lists only Safari 9.1+ for `css.types.image.filter`. Chrome/Firefox do not support referencing SVG filters via `url()` in the `filter` property.
- **Filters are GPU-expensive** when animated at large sizes; prefer `transform`/`opacity` for animation.

### `mix-blend-mode`

```css
.hero {
  isolation: isolate;      /* create a stacking context to contain the blend */
}
.hero__title {
  mix-blend-mode: difference;   /* or: exclusion, overlay, hard-light, color-dodge */
}
.overlay { background-blend-mode: multiply; }
```

**Support (verified):** Chrome **41**, Edge **79**, Firefox **32**, Safari **8**. web-features `mix-blend-mode`: **Baseline Widely available** (high date 2022-07-15). `background-blend-mode`: Chrome 35, Firefox 30, Safari 8 — also Baseline Widely available.

**Caveats:**
- **`mix-blend-mode` blends with the *backdrop*, which is everything painted below it in the same stacking context.** Use `isolation: isolate` to scope it — otherwise it blends with the page background, which produces surprising results.
- **Blending is not composited on the GPU in all engines** — large blended areas can be slow.
- **Text blending (`difference`) can produce illegible results** depending on the backdrop.

### `clip-path` (including animation)

```css
.card {
  clip-path: circle(0% at 50% 50%);
  transition: clip-path .6s cubic-bezier(.2,.8,.2,1);
}
.card.open {
  clip-path: circle(75% at 50% 50%);
}

/* Polygon morph — same number of points required */
.badge {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
```

**Support (verified):** Chrome **88** (full), Edge 88, Firefox **71**, Safari **13.1**. web-features `clip-path`: **Baseline Widely available** (high 2023-07-21). `clip-path-animatable`: Baseline Widely available — **shapes with matching vertex counts interpolate** (Chrome 55, Firefox 49, Safari 12.1).

**Caveats:**
- **Shapes must have the same number and type of vertices** to interpolate. `circle()` → `circle()` interpolates; `circle()` → `polygon()` does not.
- **`clip-path` clips but does not affect layout** — the element still occupies its original box.
- **`clip-path` creates a stacking context** and, in some engines, a containing block.
- **Firefox needed `-webkit-clip-path` for years**; Firefox 71+ supports the unprefixed property.

### 3D transforms

```css
.scene {
  perspective: 800px;
  transform-style: preserve-3d;
}

.card {
  transform: rotateY(35deg) translateZ(50px);
  transform-style: preserve-3d;
  transition: transform .4s;
}
.card:hover { transform: rotateY(0deg) translateZ(0); }
```

**Support (verified):** `transform-style` / `perspective` — Chrome **36**, Edge 12, Firefox **16**, Safari **9** (3D transforms as a group: Chrome 36, Firefox 16, Safari 15.4 per web-features `transforms3d`, **Baseline Widely available**, high 2024-09-14). Individual `translate`/`rotate`/`scale` properties: Chrome **104**, Firefox **72**, Safari **14.1**.

**Caveats:**
- **`transform-style: preserve-3d` is forced to `flat`** in some situations: when the element has `overflow` other than `visible`, a `filter`, `opacity < 1`, `mask`, `clip-path`, `contain: paint`, or `will-change` on a filtered ancestor.
- **`perspective` on a parent** affects children; `perspective()` in the child's own `transform` is per-element.
- **3D transforms can trigger blurry text** due to rasterization at fractional scales.
- **`transform` is compositor-friendly; `filter` and `backdrop-filter` are not always** — animate transforms for 60fps.

---

## 12. Accessibility & motion safety

### `prefers-reduced-motion`

The media query to detect a user's OS-level "reduce motion" setting.

```css
/* Default: the animated version */
.card {
  transition: transform .4s cubic-bezier(.2,.8,.2,1);
}

/* Opt out when the user asks for less motion */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition-duration: .01ms;
    animation-duration: .01ms;
    animation-iteration-count: 1;
    transform: none;
  }
}
```

For scroll-driven animations specifically:

```css
@media (prefers-reduced-motion: no-preference) {
  .parallax {
    animation: parallax linear both;
    animation-timeline: --hero-scroll;
  }
}
```

**Support (verified):** `prefers-reduced-motion` — Chrome **74**, Edge 74, Firefox **63**, Safari **10.1**; widely available. The `no-preference` value has the same support. (`prefers-reduced-transparency` is newer: Chrome 118, Firefox 113, Safari not supported.)

**Caveats:**
- **Reduced motion ≠ no motion.** Opacity and colour changes are generally acceptable. It's *movement* (translation, parallax, zoom, spin) that triggers symptoms.
- **Do not use `transition-duration: 0.01ms` as the only mechanism** if the animation is a scroll-driven one — a scroll-driven animation ignores duration. You must **remove the animation entirely** (as in the `no-preference` pattern above).
- **WCAG 2.2 Technique C39** is the reference implementation. Pair the media query with an **on-page control** so users can override the OS setting — WCAG requires that motion triggered by interaction be pausable/stoppable/hideable.

### Additional motion-safety patterns

```css
/* Provide a user toggle that overrides the OS preference */
:root {
  --motion-duration: .4s;
}
@media (prefers-reduced-motion: reduce) {
  :root { --motion-duration: .01ms; }
}
html[data-motion="off"] {
  --motion-duration: .01ms;
}

/* Skip animations entirely when off */
html[data-motion="off"] * {
  animation: none !important;
  transition-duration: .01ms !important;
  scroll-behavior: auto !important;
}
```

```css
/* Pause animations when the tab is hidden (saves battery) */
@media (prefers-reduced-motion: reduce) { /* also good: JS Page Visibility API */ }
```

> For **long-running/infinite** animations, WCAG 2.2 SC 2.2.2 requires a mechanism to pause, stop, or hide them. CSS alone can't do this — expose a control and toggle a class.

---

## 13. CSS animation libraries & tooling

### Runtime animation libraries

| Library | Version (latest, verified via npm registry) | Published | What it is | Notes |
|---|---|---|---|---|
| **animate.css** | **4.1.1** | 2020-09-07 | Pure-CSS animation library (~80 attention-grabbing animations) | Last release 2020 — **effectively unmaintained**. Still fine as a static asset; don't expect new effects. |
| **Motion** (`motion`) | **14.4.0** | 2026-10-19 | JS animation library (JS, React, Vue) | Active. `motion` v14 is the successor to both Motion One and Framer Motion. Has a CSS-specific surface (`motion.dev/docs/css`) that can **generate CSS spring animations server-side** — useful with React Server Components / Astro. |
| **Motion One** | — | — | Standalone Web Animations wrapper | **Merged into Motion**; the standalone package is retired. Use `motion` instead. |

**animate.css usage:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">
```
```html
<div class="animate__animated animate__fadeInUp">…</div>
```

**Caveats for animate.css:** it's v4.1.1 from 2020 — it uses `transform`/`opacity` (good), but its `animate__attention_seekers` are vestibular-triggering. Always gate them behind `prefers-reduced-motion`.

**Motion's CSS output** (for server-rendered markup):

```js
import { animate } from "motion";

const animation = animate(
  "#panel",
  { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0px)"] },
  { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }
);
```

### Design token / CSS variable libraries

| Library | Version | Published | Purpose |
|---|---|---|---|
| **Open Props** (`open-props`) | **1.7.23** | 2026-01-31 | ~350 "sub-atomic" CSS custom properties (shadows, gradients, sizes, easings, animations) by Adam Argyle. Import: `@import "https://unpkg.com/open-props";` |
| **modern-normalize** | **3.0.1** | 2024-09-05 | Minimal normalize for modern browsers by Sindre Sorhus — smaller than `normalize.css`, only current-browser fixes |

**Open Props usage:**

```css
@import "https://unpkg.com/open-props";

.card {
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  padding: var(--size-3);
}
```

**modern-normalize usage:**

```css
@import "modern-normalize/modern-normalize.css";
```

> **Note on `normalize.css` vs `modern-normalize`:** `normalize.css` is at 8.0.1 (last published ~8 years ago) and contains fixes for browsers that no longer exist. `modern-normalize` (3.0.1, 2024) drops those. For a 2026 project, `modern-normalize` is the better choice — but many teams prefer a full reset (e.g. Tailwind Preflight) since a normalize doesn't remove default margins.

### CSS generator / snippet tools

| Tool | What it does | URL |
|---|---|---|
| **Keyframes.app** | Visual editor for CSS keyframes, box-shadows, colors; exports CSS | `keyframes.app` |
| **css.gg** | 700+ pure-CSS/SVG/PNG icons + 6000 glyphs, snippets, patterns, color palettes | `css.gg` (npm `css.gg` v2.x) |
| **webcode.tools** | Broad CSS generator suite (keyframe animation, gradients, shadows, flexbox/grid) | `webcode.tools` |
| **CSSPortal** | CSS generators & snippets | `cssportal.com` |
| **SVGator** | SVG → CSS keyframe animation exporter | `svgator.com` |

> These tools are **generators, not libraries** — the output is plain CSS you own. Keyframes.app and css.gg are the two most commonly cited in the "CSS animation cheat sheet" category.

### Tailwind CSS v4 — `@theme` tokens and animation utilities

**Version verified:** **4.3.3** (published 2026-07-16). v4.3 added scrollbar styling, new colors, and more.

Tailwind v4 is **CSS-first**: you configure it with an `@theme` block in CSS rather than a JS config file.

```css
@import "tailwindcss";

@theme {
  /* Design tokens — each generates a utility */
  --color-avocado-100: oklch(99% 0.02 100);
  --color-avocado-500: oklch(80% 0.15 100);
  --font-display: "Poppins", sans-serif;
  --radius-card: 1rem;
  --shadow-lifted: 0 4px 24px oklch(0% 0 0 / .12);
  --ease-spring: cubic-bezier(.2,.8,.2,1);
  --animate-fade-up: fade-up .5s var(--ease-spring) both;

  /* Breakpoints */
  --breakpoint-3xl: 120rem;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- `--color-*` → `bg-avocado-500`, `text-avocado-500`
- `--animate-*` → `animate-fade-up` (this is how you add custom animations in v4)
- `--breakpoint-*` → `3xl:` variant
- `--ease-*` → `ease-spring`

v4 also ships built-ins: `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`.

**Tailwind v4 caveats:**
- **v4 requires a modern browser build pipeline** (it uses native CSS features: `@property`, `@layer`, `color-mix()`, `@theme`).
- **`@theme` variables are real CSS custom properties** — they cascade and can be overridden at runtime, but they are **not** the same as Tailwind's v3 `theme.extend` JS config.
- **Tailwind v4 no longer needs `tailwind.config.js`** — but the file is still supported if you need it.
- **Dark mode** in v4 defaults to `prefers-color-scheme`; override with `@custom-variant dark (&:where(.dark, .dark *));` for a class-based toggle.

### Other notable tooling

| Tool | Purpose |
|---|---|
| **Lightning CSS** | Fast CSS transformer/compiler (used by Tailwind v4's build) |
| **PostCSS** | Plugin ecosystem — `postcss-nesting`, `postcss-preset-env` |
| **Lightning Motion / `motion/react`** | React declarative animation |
| **Webflow / Framer** | Visual tools that export modern CSS |
| **`@mdn/browser-compat-data`** | The support data used in this document |
| **`web-features`** | The Baseline dataset (`npm i web-features`) |

---

## 14. Polyfills & progressive enhancement strategy

### View Transitions

| Polyfill | Notes |
|---|---|
| **Chrome's official polyfill** (`@view-transition` polyfill, `view-transition-polyfill`) | Backports same-document view transitions to older browsers; uses the Web Animations API under the hood |
| **`same-document-view-transitions`** polyfill | Community polyfill for Firefox < 144 |

> **Cross-document view transitions cannot be polyfilled** — they depend on browser-level navigation lifecycle hooks. Firefox users simply won't get them. Design so the transition is an enhancement, never the only navigation affordance.

### CSS Houdini

| Polyfill | Notes |
|---|---|
| **`css-paint-polyfill`** (GoogleChromeLabs) | Brings the Paint API to Firefox/Safari. Works but is **not free** — it serialises the paint function to a data URL, so it can't animate or respond to live input. |

### Scroll-driven animations

There is **no general polyfill**. Options:

1. **Feature-detect with `@supports (animation-timeline: view())`** and provide a time-based fallback animation.
2. **Use the Web Animations API** with a `ScrollTimeline` (only where supported).
3. **Fall back to a JS scroll listener** — but throttle with `requestAnimationFrame` and prefer `IntersectionObserver` for entry/exit effects.

### Anchor positioning

No polyfill. Chrome 125+/Firefox 147+/Safari 26+ is the floor for the core; `position-anchor` needs 151/151/27.

### `interpolate-size`

No polyfill. Use a JS `ResizeObserver` + explicit height measurement, or accept the snap in Firefox/Safari.

### `@property`

No polyfill needed for the CSS at-rule; `CSS.registerProperty()` (JS) is the fallback for browsers without `@property` — but note that a browser without `@property` support generally also lacks `CSS.registerProperty()`.

### Recommended progressive-enhancement pattern

```css
/* 1. Base = fully functional without any of the modern features */
.card { display: grid; }

/* 2. Layer enhancements, each behind its own @supports */
@supports (container-type: inline-size) {
  .card-list { container-type: inline-size; }
  @container (min-width: 30rem) {
    .card { grid-template-columns: 200px 1fr; }
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: slide-in linear both; animation-timeline: view(); }
  }
}

@supports (interpolate-size: allow-keywords) {
  * { interpolate-size: allow-keywords; }
}
```

```js
// 3. JS enhancements behind the same feature checks
if (document.startViewTransition) {
  // use view transitions
}
```

---

## 15. Verification methodology & sources

All version numbers in this document were extracted programmatically from primary sources rather than recalled:

1. **MDN browser-compat-data** — cloned from `github.com/mdn/browser-compat-data` at commit `12bc0268c7fe89a4b23fab5c54702c1fb9c34f7a` (2026-10-19). First-stable-release versions come from each feature's `__compat.support` block; `"mirror"` entries (Edge→Chrome, Safari iOS→Safari) were resolved to their upstream engine.

2. **web-features** — cloned from `github.com/web-platform-dx/web-features` at commit `f898c6f30088734ce13cdd10acb99b284e6eed74` (2026-10-19), and the **published** Baseline dataset was pulled from npm (`web-features@3.43.0-dev-20261019130309-f898c6f`) to obtain the official `baseline` / `baseline_low_date` / `baseline_high_date` values. Note that the npm `latest` tag (3.43.0) is *older* than the `next` dev build and lags the repo by a few days — the dev build matching the cloned commit was used.

3. **caniuse** — feature JSON from `github.com/Fyrd/caniuse` (main), used for global usage percentages and cross-checking.

4. **Release notes** — Firefox release notes / Bugzilla (bug 1324602, milestone 159), WebKit "WebKit Features in Safari 26.0" and 26.4, Chrome for Developers, web.dev Baseline digests, and MDN reference pages.

### Known-unverifiable / explicitly unverified items

| Item | Status |
|---|---|
| **Firefox 159** scroll-driven animations | BCD says 159; Firefox 159 is **Beta** and ships **2026-10-27**, i.e. *after* this document's compile date. **Verified as scheduled, not as shipped.** Firefox 158 (current stable) does not support it. |
| Safari **27.x** minor-version specifics | Safari 27 is current (2026-09-14). Per-minor deltas beyond what BCD records (e.g. 26.4's threaded scroll animations) are cited from the WebKit blog. |
| `CSS.animationWorklet` / `CSS.effectWorklet` | **Not present in BCD's stable support tables.** Reported as Chromium-only behind `chrome://flags/#enable-experimental-web-platform-features`, per the Chromium team's Animation Worklet page. **Treat as unverified for production use.** |
| `CSS Houdini` Baseline status | Houdini has **no web-features entry** (the tag search returns nothing), so no official Baseline status exists. Status is derived from the individual BCD entries. |
| `caniuse` entry for scroll-driven animations | The caniuse `features-json` directory in the cloned snapshot has **no** scroll-driven file; the `caniuse.com/wf-scroll-driven-animations` page is generated from the web-features dataset. |
| `interpolate-size` in Safari | BCD lists `version_added: false` with `impl_url: https://webkit.org/b/295132` — **not implemented**. |
| `mask-border` | BCD: Safari 17.2 only. Firefox/Chrome **not implemented**. |
| `color-mix()` variadic | BCD/web-features: Firefox 150, Safari 27; **no Chrome**. |
| `Temporal` API | Chrome 144, Firefox 139; **no Safari** in BCD. JS-only — not a CSS feature. |
| Library versions | Verified against the npm registry's `time` field on 2026-10-20. animate.css has not shipped a release since 4.1.1 (2020-09-07). |

### Primary URLs

- MDN CSS reference — `https://developer.mozilla.org/en-US/docs/Web/CSS`
- MDN View Transitions — `https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API`
- MDN scroll-driven animations — `https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations`
- MDN CSS Houdini — `https://developer.mozilla.org/en-US/docs/Web/API/Houdini_APIs`
- MDN Baseline — `https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility`
- caniuse — `https://caniuse.com`
- web.dev Baseline 2025 — `https://web.dev/baseline/2025`
- web.dev January 2026 platform update (anchor positioning) — `https://web.dev/blog/web-platform-01-2026`
- Chrome cross-document view transitions — `https://developer.chrome.com/docs/web-platform/view-transitions/cross-document`
- WebKit Safari 26.0 features — `https://webkit.org/blog/17333/webkit-features-in-safari-26-0/`
- WebKit Safari 26.4 features — `https://webkit.org/blog/17862/webkit-features-for-safari-26-4`
- Firefox Bug 1324602 (ship scroll-driven animations) — `https://bugzilla.mozilla.org/show_bug.cgi?id=1324602`
- Tailwind v4 theme variables — `https://tailwindcss.com/docs/theme`
- Motion CSS — `https://motion.dev/docs/css`
- Animate.css — `https://animate.style`
- Open Props — `https://open-props.style/`
- modern-normalize — `https://github.com/sindresorhus/modern-normalize`
