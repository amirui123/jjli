# JavaScript / TypeScript Web Animation Libraries — Verified Catalog

**Compiled:** 20 October 2026 (Africa/Cairo, EEST / UTC+03:00)
**Verification method:** every version number, publish date, star count, license, and bundle size below was pulled live from:
- npm registry API — `https://registry.npmjs.org/<pkg>` (`dist-tags.latest`, `time`, `license`, `repository`, `dist.unpackedSize`, `deprecated`)
- GitHub REST API v3 — `https://api.github.com/repos/<owner>/<repo>` (`stargazers_count`, `license.spdx_id`, `archived`, `pushed_at`) via the authenticated `gh` CLI
- bundlephobia API — `https://bundlephobia.com/api/size?package=<pkg>` (gzip / minified size of the published entry point)
- Official release notes / docs — `gsap.com/blog/*`, `motion.dev/changelog`, `github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4`, `raw.githubusercontent.com/wiki/...`
- Published `.d.ts` type declarations unpacked from the npm tarballs, to confirm **real** exported function/class names and signatures

Anything I could not confirm from a live response is written as **"unverified"** rather than guessed. Per-library API signatures were read from the shipped type declarations, not from memory.

**Bundle size note:** "gzip" = bundlephobia's gzipped size of the package's default entry point. For libraries with several entry points (Motion, anime.js v4, GSAP plugins) the value is the size of the *root* import, and per-entry-point sizes are noted in the entry.

**Stars note:** star counts are point-in-time from the GitHub API on 20 Oct 2026 and will drift.

---

## Table of Contents

1. [Master catalog table](#1-master-catalog-table)
2. [Libraries — deep dive](#2-libraries--deep-dive)
   - [Tier 1 — Core animation engines](#tier-1--core-animation-engines)
   - [Tier 2 — React-first animation](#tier-2--react-first-animation)
   - [Tier 3 — Scroll & page transition](#tier-3--scroll--page-transition)
   - [Tier 4 — Carousels, drawers & gesture](#tier-4--carousels-drawers--gesture)
   - [Tier 5 — Design-tool / runtime animation (Lottie, Rive)](#tier-5--design-tool--runtime-animation-lottie-rive)
   - [Tier 6 — SVG, Canvas & 2D drawing](#tier-6--svg-canvas--2d-drawing)
   - [Tier 7 — 3D / WebGL / WebGPU](#tier-7--3d--webgl--webgpu)
   - [Tier 8 — Data-viz & interpolation](#tier-8--data-viz--interpolation)
   - [Tier 9 — State, events & auto-animation](#tier-9--state-events--auto-animation)
   - [Tier 10 — Legacy, deprecated & unmaintained](#tier-10--legacy-deprecated--unmaintained)
3. [2024–2026 notable entrants](#3-notable-20242026-entrants)
4. [Commercial / paid tiers](#4-commercial--paid-tiers)
5. [Deprecated & unmaintained](#5-deprecated--unmaintained)
6. [Decision matrix](#6-decision-matrix)
7. [Sources & raw data](#7-sources--raw-data)

---

## 1. Master catalog table

Stars = GitHub `stargazers_count` (2026‑10‑20). Version = npm `dist-tags.latest`. Size = bundlephobia gzip.

| # | Library | Repo | npm | Stars | License | Frameworks | gzip | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | GSAP 3.15 | [greensock/GSAP](https://github.com/greensock/GSAP) | `gsap` | 29,513 | GSAP standard "no charge" | vanilla, React, Vue, Svelte, Solid, Astro | 27.4 kB | Active (Webflow-owned) |
| 2 | Motion 14.4 | [motiondivision/motion](https://github.com/motiondivision/motion) | `motion` | 34,375 | MIT | vanilla, React, Vue | 55.9 kB | Active |
| 3 | anime.js v4.5 | [juliangarnier/anime](https://github.com/juliangarnier/anime) | `animejs` | 73,722 | MIT | vanilla (+ any via DOM) | 40.3 kB | Active |
| 4 | react-spring 10.1 | [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | `@react-spring/web` | 29,174 | MIT | React | 20.1 kB | Active |
| 5 | @react-spring/three | [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | `@react-spring/three` | 29,174 | MIT | React + R3F | 18.4 kB | Active |
| 6 | lottie-web 5.13 | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | `lottie-web` | 32,250 | MIT | vanilla | 76.8 kB | Maintained (slow) |
| 7 | lottie-react 3.1 | [Gamote/lottie-react](https://github.com/Gamote/lottie-react) | `lottie-react` | 969 | MIT | React | 196 kB | Active (community fork) |
| 8 | dotlottie-web 0.81 | [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | `@lottiefiles/dotlottie-web` | 920 | MIT | vanilla | 33.1 kB | Active (Rust→WASM) |
| 9 | dotlottie-react 0.20 | [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | `@lottiefiles/dotlottie-react` | 920 | MIT | React | 34.0 kB | Active |
| 10 | Rive canvas 2.45 | [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) | `@rive-app/canvas` | 1,008 | MIT | vanilla | 69.2 kB | Active |
| 11 | Rive React 4.37 | [rive-app/rive-react](https://github.com/rive-app/rive-react) | `@rive-app/react-canvas` | 1,174 | MIT | React | 74.6 kB | Active |
| 12 | Popmotion 11.0 | [Popmotion/popmotion](https://github.com/Popmotion/popmotion) | `popmotion` | 20,150 | MIT | vanilla | 6.8 kB | **Unmaintained** (2022) |
| 13 | Tween.js 25.0 | [tweenjs/tween.js](https://github.com/tweenjs/tween.js) | `@tweenjs/tween.js` | 10,149 | MIT | vanilla | 3.7 kB | Active |
| 14 | Velocity.js 1.5.2 | [julianshapiro/velocity](https://github.com/julianshapiro/velocity) | `velocity-animate` | 17,188 | MIT | vanilla | 15.8 kB | **Unmaintained** (2018) |
| 15 | ScrollReveal 4.0.9 | [jlmakes/scrollreveal](https://github.com/jlmakes/scrollreveal) | `scrollreveal` | 22,472 | GPL-3.0 | vanilla | 5.6 kB | **Unmaintained** (2021) |
| 16 | Locomotive Scroll 5.0 | [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | `locomotive-scroll` | 8,882 | MIT | vanilla | 8.8 kB | Active (v5 rebuilt on Lenis) |
| 17 | Lenis 1.3.27 | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | `lenis` | 16,734 | MIT | vanilla, React (`lenis/react`), Vue, Svelte, Astro | 5.5 kB | Active |
| 18 | smooth-scrollbar 8.8.4 | [dolphin-wood/smooth-scrollbar](https://github.com/dolphin-wood/smooth-scrollbar) | `smooth-scrollbar` | 3,341 | MIT | vanilla | 19.4 kB | **Unmaintained** (2023) |
| 19 | Barba.js 2.10.3 | [barbajs/barba](https://github.com/barbajs/barba) | `@barba/core` | 13,000 | MIT | vanilla | 9.9 kB | **Low activity** (2024) |
| 20 | Swiper 14.3 | [nolimits4web/swiper](https://github.com/nolimits4web/swiper) | `swiper` | 41,902 | MIT | vanilla, React, Vue, Svelte, Solid, Angular | 20.2 kB | Active |
| 21 | Embla Carousel 8.6 | [davidjerleke/embla-carousel](https://github.com/davidjerleke/embla-carousel) | `embla-carousel`, `embla-carousel-react` | 8,453 | MIT | vanilla, React, Vue, Svelte, Solid, Angular | 6.9 kB | Active |
| 22 | Vaul 1.1.2 | [emilkowalski/vaul](https://github.com/emilkowalski/vaul) | `vaul` | 8,646 | MIT | React | 18.5 kB | Active |
| 23 | use-gesture 10.3.1 | [pmndrs/use-gesture](https://github.com/pmndrs/use-gesture) | `@use-gesture/react` | 9,622 | MIT | React (+ vanilla) | 8.9 kB | Stable (2024) |
| 24 | SplitType 0.3.4 | [lukePeavey/SplitType](https://github.com/lukePeavey/SplitType) | `split-type` | 733 | ISC | vanilla | 4.3 kB | **Unmaintained** (2023) |
| 25 | svg.js 3.2.8 | [svgdotjs/svg.js](https://github.com/svgdotjs/svg.js) | `@svgdotjs/svg.js` | 11,835 | MIT | vanilla | ~17 kB* | Active |
| 26 | Two.js 0.8.24 | [jonobr1/two.js](https://github.com/jonobr1/two.js) | `two.js` | 8,672 | MIT | vanilla | 49.0 kB | Active |
| 27 | p5.js 2.3.4 | [processing/p5.js](https://github.com/processing/p5.js) | `p5` | 24,149 | LGPL-2.1 | vanilla | 333.6 kB | Active |
| 28 | Three.js 0.186.1 | [mrdoob/three.js](https://github.com/mrdoob/three.js) | `three` | 116,650 | MIT | vanilla | 184.9 kB | Active |
| 29 | PixiJS 8.22 | [pixijs/pixijs](https://github.com/pixijs/pixijs) | `pixi.js` | 48,428 | MIT | vanilla (React via `pixi-react`) | 264.8 kB | Active |
| 30 | OGL 1.0.11 | [oframe/ogl](https://github.com/oframe/ogl) | `ogl` | 4,676 | Unlicense | vanilla | 34.2 kB | Low activity (2025) |
| 31 | regl 2.1.1 | [regl-project/regl](https://github.com/regl-project/regl) | `regl` | 5,587 | MIT | vanilla | 37.7 kB | Active |
| 32 | zustand 5.0.15 | [pmndrs/zustand](https://github.com/pmndrs/zustand) | `zustand` | 58,842 | MIT | React, vanilla, Vue, Svelte, Solid | 0.5 kB | Active |
| 33 | mitt 3.0.1 | [developit/mitt](https://github.com/developit/mitt) | `mitt` | 11,909 | MIT | vanilla | 0.3 kB | Stable |
| 34 | D3 7.9 | [d3/d3](https://github.com/d3/d3) | `d3` | 113,781 | ISC | vanilla | 92.0 kB | Active |
| 35 | d3-interpolate 3.0.1 | [d3/d3-interpolate](https://github.com/d3/d3-interpolate) | `d3-interpolate` | 498 | ISC | vanilla | 6.9 kB | Stable |
| 36 | d3-transition 3.0.1 | [d3/d3-transition](https://github.com/d3/d3-transition) | `d3-transition` | 226 | ISC | vanilla | 1.0 kB | Stable |
| 37 | @formkit/auto-animate 0.10 | [formkit/auto-animate](https://github.com/formkit/auto-animate) | `@formkit/auto-animate` | 13,934 | MIT | vanilla, React, Vue, Preact, Solid | 3.2 kB | Active |
| 38 | Motion One 10.18 | [motiondivision/motionone](https://github.com/motiondivision/motionone) *(archived)* | `@motionone/dom` | 2,863 | MIT | vanilla | 9.4 kB | **Archived** — use `motion` |
| 39 | SortableJS 1.15.7 | [SortableJS/Sortable](https://github.com/SortableJS/Sortable) | `sortablejs` | 31,198 | MIT | vanilla | 18.3 kB | Active |
| 40 | Motion for Vue (`motion-v`) 2.8 | [motiondivision/motion-vue](https://github.com/motiondivision/motion-vue) | `motion-v` | 2,221 | MIT | Vue | 1.6 kB | Active |
| 41 | AOS 2.3.4 | [michalsnik/aos](https://github.com/michalsnik/aos) | `aos` | 28,053 | MIT | vanilla | 4.7 kB | **Unmaintained** (2018) |
| 42 | ScrollMagic 2.0.9 | [janpaepke/ScrollMagic](https://github.com/janpaepke/ScrollMagic) | `scrollmagic` | 14,952 | MIT / GPL-3.0+ | vanilla | 7.6 kB | Active (2026 commits) |
| 43 | react-transition-group 4.4.5 | [reactjs/react-transition-group](https://github.com/reactjs/react-transition-group) | `react-transition-group` | 10,210 | BSD-3-Clause | React | 4.0 kB | Maintenance |
| 44 | jotai 3.0.1 | [pmndrs/jotai](https://github.com/pmndrs/jotai) | `jotai` | 21,298 | MIT | React, vanilla | 3.3 kB | Active |
| 45 | valtio 2.3.2 | [pmndrs/valtio](https://github.com/pmndrs/valtio) | `valtio` | 10,243 | MIT | React, vanilla | 2.6 kB | Active |
| 46 | @gsap/react 2.1.2 | [greensock/react](https://github.com/greensock/react) | `@gsap/react` | 342 | GSAP standard | React | 0.6 kB | Active |
| 47 | @react-three/drei 10.7.9 | [pmndrs/drei](https://github.com/pmndrs/drei) | `@react-three/drei` | 10,005 | MIT | React + R3F | 521.5 kB | Active |
| 48 | @react-three/fiber 9.8.2 | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | `@react-three/fiber` | 33,097 | MIT | React + Three.js | 57.7 kB | Active |
| 49 | @theatre/core 0.7.2 | [theatrejs/theatre](https://github.com/theatrejs/theatre) | `@theatre/core` | 0 (repo renamed) | Apache-2.0 | vanilla, React | 31.4 kB | Stale (2024) |
| 50 | TypeGPU 0.12.8 | [software-mansion/TypeGPU](https://github.com/software-mansion/TypeGPU) | `typegpu` | unverified | MIT | vanilla (WebGPU) | 91.0 kB | Active |

\* `svg.js`: bundlephobia's entry for the legacy `svg.js` (2.7.1) reports 17.3 kB gzip. The current scoped package `@svgdotjs/svg.js` (3.2.8) could not be measured (bundlephobia returned no entry) — treat the number as approximate.

---

## 2. Libraries — deep dive

### Tier 1 — Core animation engines

---

#### 1. GSAP 3.15.0

- **Repo:** https://github.com/greensock/GSAP
- **Homepage:** https://gsap.com
- **npm:** `gsap` (3.15.0, published 2026‑04‑13)
- **Stars:** 29,513 (GitHub API, 2026‑10‑20; last push 2026‑04‑13)
- **License:** "Standard 'no charge' license" — **100% free, including commercial use, for every plugin** since GSAP 3.13 (2025‑04‑29). Club GSAP was wound down; the private npm registry was retired (members asked to move to public npm by 1 June 2025). Verified from https://gsap.com/blog/3-13/ and https://gsap.com/pricing/.
- **Frameworks:** vanilla (primary), React (`@gsap/react`), and works in Vue/Svelte/Solid/Astro by targeting DOM directly.
- **Bundle size:** 27.4 kB gzip / 70.6 kB min (root `gsap` entry). All plugins ship in the same package: `ScrollTrigger.js`, `ScrollSmoother.js`, `ScrollToPlugin.js`, `Flip.js`, `SplitText.js`, `MorphSVGPlugin.js`, `MotionPathPlugin.js`, `MotionPathHelper.js`, `DrawSVGPlugin.js`, `TextPlugin.js`, `ScrambleTextPlugin.js`, `Draggable.js`, `InertiaPlugin.js`, `Observer.js`, `EaselPlugin.js`, `Physics2DPlugin.js`, `PhysicsPropsPlugin.js`, `PixiPlugin.js`, `CustomEase.js`, `CustomBounce.js`, `CustomWiggle.js`, `CSSPlugin.js`, `CSSRulePlugin.js`, `GSDevTools.js` — confirmed by unpacking the 3.15.0 tarball.
- **Install:** `npm i gsap` (and `npm i @gsap/react` for React)

**What it does:** The industry-standard timeline/tween engine — precise sequencing, scroll-scrubbed animation, SVG morphing, and layout-flip transitions.

**Key API (verified from shipped `types/*.d.ts`):**
```ts
gsap.to(targets, vars) / gsap.from(...) / gsap.fromTo(...) / gsap.set(...)
gsap.timeline({ defaults, scrollTrigger })  // → gsap.core.Timeline
gsap.ticker.add(fn) / gsap.ticker.lagSmoothing(...)
gsap.matchMedia()          // responsive animation control
gsap.utils.toArray(str) / gsap.utils.clamp(min, max, v) / gsap.utils.random(a, b) / gsap.utils.wrap(...)
gsap.context(() => {...}, scopeEl)  // cleanup scoping (used by useGSAP)
ScrollTrigger.create(vars) / ScrollTrigger.batch(...)
Flip.getState(targets, vars) / Flip.from(state, vars)
SplitText.create(target, vars) / split.revert()
MotionPathPlugin.registerPlugin(core) / gsap.registerPlugin(MotionPathPlugin)
Draggable.create(target, vars)
Observer.create(vars)
CustomEase.create(id, data?, config?) / CustomBounce.create(id, vars?) / CustomWiggle.create(id, vars?)
```

**Recipes**

1) **Scroll-scrubbed pinned section (ScrollTrigger)**
```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.to(".panel", {
  xPercent: -300,
  ease: "none",
  scrollTrigger: { trigger: ".track", pin: true, scrub: 1, end: "+=300%" }
});
```

2) **FLIP layout transition (Flip)** — capture state, mutate DOM, then animate
```js
import gsap from "gsap";
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

const state = Flip.getState(".card");
document.querySelector("#grid").append(card);        // move the node
Flip.from(state, { duration: 0.6, ease: "power2.inOut", absolute: true });
```

3) **Split text into masked lines (SplitText 3.13 rewrite)**
```js
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

SplitText.create(".headline", {
  type: "lines,words",
  autoSplit: true,                      // re-splits on resize/font load
  mask: "lines",                        // wraps each line in a clipping element
  onSplit: (self) => gsap.from(self.lines, { yPercent: 110, stagger: 0.08, duration: 0.9 })
});
```
3.13 rewrite notes (from the 3.13 release post): adds `aria-label`/`aria-hidden` for screen readers, `mask`, `autoSplit` + `onSplit`/`onRevert`, `deepSlice` for nested inline elements, `propIndex` CSS vars, and **removed `position: "absolute"`**.

4) **Motion path + adaptive reverse easing (3.15)**
```js
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

gsap.to(".rocket", {
  motionPath: { path: "#orbit", align: "#orbit", autoRotate: true },
  easeReverse: "sine.in",   // new in 3.15: distinct easing when the playhead reverses
  duration: 4, repeat: -1
});
```
`easeReverse` is new in 3.15 (2026‑04‑13); `yoyoEase` was **deprecated** in the same release and is internally replaced by `easeReverse`.

**When to reach for it:** long, choreographed, scroll-driven storytelling; precise SVG morphing; production marketing sites; anything where you need a timeline you can scrub and reverse.

**When NOT to reach for it:** (a) you need declarative, component-lifecycle-bound animation in React — that is Motion/react-spring territory; (b) bundle budget is under ~25 kB gzip — GSAP core alone is 27 kB; (c) you want a *state-machine* driven interactive graphic (use Rive); (d) you need open-source-with-a-known-permissive-license in a legal review — the GSAP "no charge" license is proprietary, not OSI-approved (though free for all uses, including commercial).

---

#### 2. Motion 14.4.0 (formerly Framer Motion)

- **Repo:** https://github.com/motiondivision/motion (the `framer/motion` repo is the same project — both return 34,375 stars)
- **Homepage:** https://motion.dev
- **npm:** `motion` (14.4.0, published 2026‑10‑19). Subpath exports: `motion` (full), `motion/mini`, `motion/react`, `motion/react-client`, `motion/react-m`, `motion/react-mini`, `motion/react-animate-view`, `motion/three`, `motion/vgpu`, `motion/debug` — verified from the package `exports` map.
- **Stars:** 34,375 (2026‑10‑20; last push 2026‑10‑20 — very active)
- **License:** MIT
- **Frameworks:** vanilla JS (`motion`), React (`motion/react`), Vue (`motion-v`), Svelte (`motion-sv` / `@humanspeak/svelte-motion` — community, not official).
- **Bundle size:** 55.9 kB gzip for the root `motion` entry; `motion/mini` is documented at **3.2 kB** (mini) vs **22 kB** (hybrid) per https://motion.dev/docs/animate; `framer-motion` is 69.5 kB gzip. `motion-dom` (low-level) is 51.1 kB gzip.
- **Install:** `npm i motion` (vanilla) / `npm i motion` + `import { motion } from "motion/react"` (React)

**What it does:** A "hybrid" animation engine — a tiny Web Animations API–backed mini build plus a full build with independent transforms, springs, layout animations, scroll/gesture APIs, and 3D (Three.js / vgpu) effects.

**Key API (verified from `framer-motion@14.4.0` `dist/dom.d.ts`, `motion-dom@14.4.0` `dist/index.d.ts`):**
```ts
// DOM entry (motion / motion/mini)
animate(targets, keyframes, options?)                 // hybrid
animateMini(targets, keyframes, options?)             // mini (WAAPI only)
stagger(duration?, { startDelay, from, ease, grid }?)
scroll(onScroll | controls, { axis, source, container, ...options }): VoidFunction
inView(elementOrSelector, onStart, { root, margin, amount }): VoidFunction
hover(elementOrSelector, onHoverStart, options?)
press(targetOrSelector, onPressStart, options?)
transform(inputValue, inputRange, outputRange, options?)
spring(optionsOrVisualDuration?, bounce?)            // keyframe generator
motionValue<V>(init, options?)
interpolate(input: number[], output: T[], { clamp, ease, mixer })
mix(from, to) / mix(from: number, to: number, p: number)
animateLayout(scopeOrUpdateDom, updateDomOrOptions?, options?)   // vanilla layout animations
delay(callback, timeout)
frame / cancelFrame  (frame scheduler)
step / steps        (from motion-utils)

// React entry (motion/react)
import { motion, m, AnimatePresence, useScroll, useTransform, useSpring,
         useMotionValue, useMotionValueEvent, LayoutGroup, MotionConfig,
         useAnimate, useInView, useMotionTemplate } from "motion/react"

// 3D
import { threeEffect } from "motion/three"
import { vgpuEffect } from "motion/vgpu"
```

**Recipes**

1) **Vanilla hybrid animation with stagger**
```js
import { animate, stagger } from "motion";

animate(".card", { opacity: 1, y: 0, rotate: 0 }, {
  duration: 0.6,
  delay: stagger(0.06, { from: "center" }),
  ease: [0.22, 1, 0.36, 1]
});
```

2) **Mini build (3.2 kB) for a simple fade**
```js
import { animate } from "motion/mini";
animate("#box", { opacity: [0, 1] }, { duration: 0.4 });
```

3) **React: layout animation + exit**
```jsx
import { motion, AnimatePresence } from "motion/react";

function List({ items }) {
  return (
    <AnimatePresence>
      {items.map(i => (
        <motion.li
          key={i.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        />
      ))}
    </AnimatePresence>
  );
}
```

4) **Scroll-linked progress driving a CSS variable**
```js
import { scroll } from "motion";

scroll((progress) => {
  document.documentElement.style.setProperty("--scroll", progress);
}, { source: document.querySelector("#hero") });
```

**Version history verified:** Motion 12 was the first release under the `motion` name (`motion.dev/docs/react-upgrade-guide`); the changelog at https://motion.dev/changelog shows **14.4.0 (18 Oct 2026)**, 14.1.0 (09 Oct 2026, added vanilla `animateLayout`), and **14.0.0 (02 Oct 2026)** which removed internal APIs and pinned `framer-motion`/`motion-dom`/`motion-utils` deps. 13.5.0 (01 Oct 2026) made `<m>` 20% smaller and `useSpring` 10% smaller; 14.2.0 added hardware-accelerated independent transforms; 14.4.0 added a JS `drag` gesture.

**When to reach for it:** React apps that want declarative animation with real layout physics; teams that want one library across React + vanilla; projects that value a tiny `mini` build; anything where "Motion+"-style product UI (Cursor, Ticker) matters.

**When NOT to reach for it:** (a) you need scroll-scrubbed narrative timelines with pinning — GSAP ScrollTrigger is far more capable there; (b) you need After Effects-authored vector playback — that's Lottie/Rive; (c) you need the 3D/WebGPU integration, which is **Motion+ paid early access** today; (d) bundle budget under 10 kB — use `motion/mini` (3.2 kB) or plain CSS.

---

#### 3. anime.js v4.5.0

- **Repo:** https://github.com/juliangarnier/anime
- **Homepage:** https://animejs.com
- **npm:** `animejs` (4.5.0, published 2026‑06‑22). Subpath exports verified from the package `exports` map: `animejs`, `/timer`, `/animation`, `/timeline`, `/animatable`, `/draggable`, `/scope`, `/events`, `/engine`, `/layout`, `/utils`, `/svg`, `/text`, `/waapi`, `/adapters`, **`/adapters/three`**, plus the easing sub-paths `/easings`, `/easings/eases`, `/easings/linear`, `/easings/steps`, `/easings/irregular`, `/easings/cubic-bezier`, `/easings/spring`. Zero runtime dependencies.
- **Stars:** 73,722 (2026‑10‑20; last push 2026‑08‑21)
- **License:** MIT — zero runtime dependencies
- **Frameworks:** vanilla; works in any framework since it targets the DOM.
- **Bundle size:** 40.3 kB gzip / 116.8 kB min for the root entry. Sub-entries are much smaller (e.g. `animejs/timer` alone is a few kB).
- **Install:** `npm i animejs`

**What it does:** A rewritten (v4) JavaScript animation engine with a **tree-shakeable modular API**, first-class SVG helpers (motion path, drawable, morph), text splitting/scrambling, draggable, and a scope system for cleanup.

**Key API (verified from `animejs@4.5.0` `dist/modules/**/index.d.ts`):**
```ts
animate(targets: TargetsParam, parameters: AnimationParams): JSAnimation
createTimeline(parameters?: TimelineParams): Timeline
createTimer(parameters?: TimerParams): Timer
createScope(params?: ScopeParams): Scope
createDraggable(target: TargetsParam, parameters?: DraggableParams): Draggable
stagger(val: number | string | [number, number] | [string, string], params?: StaggerParams): StaggerFunction
// svg module
svg.createMotionPath(path: TargetsParam, offset?: number)
svg.createDrawable(selector: TargetsParam, start?: number, end?: number): Array<DrawableSVGGeometry>
svg.morphTo(path2: TargetsParam, precision?: number): FunctionValue
// text module
splitText(target, params?)  /  split(target, params?) → TextSplitter
scrambleText(params?): FunctionValue
// utils module
utils.round / clamp / snap / lerp / damp / wrap / mapRange / degToRad / radToDeg / random / shuffle
// easings
easings.*  (linear, in/out/inOut power family, back, elastic, spring, cubicBezier, steps, irregular)
```

**Recipes**

1) **Animate with a stagger**
```js
import { animate, stagger } from "animejs";

animate(".square", {
  x: 320,
  rotate: { from: -180 },
  duration: 1250,
  delay: stagger(65, { from: "center" }),
  ease: "inOutQuint",
  loop: true,
  alternate: true
});
```

2) **Timeline with defaults**
```js
import { createTimeline } from "animejs";

const tl = createTimeline({ defaults: { ease: "outQuad", duration: 250 } });
tl.add(".a", { x: 100 })
  .add(".b", { y: 50, duration: 400 }, "<<+=100");
```

3) **SVG line drawing**
```js
import { animate } from "animejs";
import { svg } from "animejs";

const drawable = svg.createDrawable("path");
animate(drawable, { draw: "0 1", duration: 1200, ease: "inOutQuad" });
```

4) **Split text into chars and animate (v4 built-in, no plugin needed)**
```js
import { splitText, animate, stagger } from "animejs";

const split = splitText(".headline", { chars: true });
animate(split.chars, {
  y: [{ from: 20, to: 0 }],
  opacity: { from: 0, to: 1 },
  delay: stagger(18),
  duration: 700
});
```

5) **Animate a Three.js object (v4.5 Three adapter)**
```js
import { animate } from "animejs";
import { threeAdapter } from "animejs/adapters/three";
import * as THREE from "three";

animate(mesh, { rotationY: Math.PI * 2, positionY: 5 }, { duration: 2000, ease: "inOutSine" });
```
The `animejs/adapters/three` entry exports `threeAdapter` (verified in `dist/modules/adapters/three/adapter.d.ts`) and registers property resolvers for `Object3D` instances, materials and uniforms.

**v3 → v4 migration (verified from the official wiki `Migrating-from-v3-to-v4`):** the global `anime` object is gone → `import { animate } from 'animejs'`; `targets:` option → first positional argument; `easing:` → `ease:` (and new default `'out(2)'`); `endDelay` → `loopDelay`; `direction: 'reverse'` → `reversed: true`; `direction: 'alternate'` → `alternate: true`; `loop: 1` now means *one repeat* (2 iterations); `round: 100` → `modifier: utils.round(2)`; `value:` in object syntax → `to:`; stagger `direction` → `reversed`, stagger `easing` → `ease`; `anime.timeline()` → `createTimeline()` with `defaults: {}`; callbacks renamed to `onUpdate`/`onBegin`/`onComplete`/`onLoop`/`onRender`; `change` → `onRender`; `animation.finished` → `animation.then()`; `anime.path()` → `svg.createMotionPath()`; `anime.setDashoffset` → `svg.createDrawable()`.

**When to reach for it:** you want one dependency-free engine for DOM + SVG + text with tree-shaking; you like a flatter, more functional API than GSAP; you're doing canvas-free creative coding with tight bundle budgets on a sub-entry.

**When NOT to reach for it:** (a) React lifecycle integration — there's no official React binding, and v4's rewrite breaks most v3 community integrations; (b) you need scroll pinning/scrubbing (anime has `onScroll` but no ScrollTrigger equivalent) — use GSAP or Motion; (c) you need a stable, long-frozen API — v4 is a ground-up rewrite and ecosystem plugins lag; (d) you need physics/interactivity frameworks — use Rive or a 3D engine.

---

#### 4. Popmotion 11.0.5 — **UNMAINTAINED**

- **Repo:** https://github.com/Popmotion/popmotion
- **Homepage:** https://popmotion.io
- **npm:** `popmotion` (11.0.5, published 2022‑08‑15)
- **Stars:** 20,150 (last push 2022‑08‑15 — the repo's last commit is also 2022‑08‑15)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 6.8 kB gzip / 15.4 kB min
- **Install:** `npm i popmotion`

**What it does:** The animator's toolbox — pure functions for spring physics, inertia, keyframes, interpolation and easing. It is the ancestor of Motion and Framer Motion.

**Key API (verified from `popmotion@11.0.5` `lib/index.d.ts`):**
```ts
animate<V = number>({ from, autoplay, driver, elapsed, repeat, repeatType, repeatDelay,
                      onPlay, onStop, onComplete, onRepeat, onUpdate, ...options }: AnimationOptions<V>)
inertia({ from, velocity, power, timeConstant, bounceStiffness, bounceDamping, ... })
spring({ stiffness, damping, mass, velocity, restSpeed, restDelta })
decay({ velocity, power, timeConstant, modifyTarget })
keyframes({ values, duration, ease, ... })
interpolate(input: number[], output: any[]) / mixColor / mixComplex / mix
cubicBezier(x1,y1,x2,y2) / steps(n) / linear / easeIn / easeOut / easeInOut / backIn / backOut / bounceIn / anticipate
clamp / distance / angle / progress / smoothFrame / snap / wrap / pipe
```

**Recipes**

1) **Spring physics on a plain object**
```js
import { animate } from "popmotion";

const state = { x: 0 };
animate({
  from: 0, to: 300, type: "spring",
  stiffness: 200, damping: 20,
  onUpdate: v => (state.x = v)
});
```

2) **Velocity-carrying inertia (throw)**
```js
import { inertia } from "popmotion";

inertia({
  from: 120, velocity: 900, power: 0.8, timeConstant: 350, bounceStiffness: 500, bounceDamping: 30,
  onUpdate: v => (el.style.transform = `translateX(${v}px)`)
});
```

3) **Reusable easing + interpolation**
```js
import { interpolate, cubicBezier, mixColor } from "popmotion";

const ease = cubicBezier(0.22, 1, 0.36, 1);
const x = interpolate([0, 1], [0, 400]);
const bg = mixColor("#ff0055", "#0099ff");
```

**When to reach for it:** you want to vendor a tiny, dependency-free physics core; you're porting legacy Framer Motion v1/v2 code; you need `inertia` physics that Motion's public API doesn't expose.

**When NOT to reach for it:** you need anything actively maintained — this package has had **no release since August 2022** and the repo's last commit is the same date. New projects should use `motion` (its successor) or `motion-dom` instead.

---

#### 5. Tween.js 25.0.0

- **Repo:** https://github.com/tweenjs/tween.js
- **Homepage:** https://tweenjs.github.io/tween.js/
- **npm:** `@tweenjs/tween.js` (25.0.0, published 2024‑07‑26) — the legacy unscoped `tween.js` (16.6.0, 2017) is **deprecated on npm**: *"This package has moved to @tweenjs/tween.js."*
- **Stars:** 10,149 (last push 2026‑10‑06; last GitHub release v25.0.0, Jul 2024)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 3.7 kB gzip / 12.6 kB min (`@tweenjs/tween.js`); legacy `tween.js` 2.1 kB gzip
- **Install:** `npm i @tweenjs/tween.js`

**What it does:** A small, dependency-free tweening engine with Robert Penner's easing equations, groups, sequences and a global update loop.

**Key API (verified from `@tweenjs/tween.js@25.0.0` `dist/tween.d.ts`):**
```ts
export { Easing, Group, Interpolation, Sequence, Tween, VERSION,
         add, getAll, nextId, now, remove, removeAll, update }
new Tween<T>(object: T)
new Group()
new Sequence([...])
tween.to(object, { duration: 1000, easing: Easing.Quadratic.Out, onUpdate, onComplete })
tween.start(time?) / .stop() / .pause() / .resume() / .update(time) / .repeat() / .yoyo() / .reverse()
new Interpolation(start, end, interpolation)
tween.chain(t2) / .then(cb)
Easing.Linear.None / Easing.Quadratic.In / Easing.Cubic.Out / Easing.Bounce.Out / Easing.Elastic.InOut
```

**Recipes**

1) **Tween a plain object**
```js
import { Tween, Easing, update } from "@tweenjs/tween.js";

const state = { x: 0 };
new Tween(state)
  .to({ x: 300 }, { duration: 1000, easing: Easing.Quadratic.Out })
  .start();
```

2) **Grouped tween with a shared timeline**
```js
import { Group, Tween } from "@tweenjs/tween.js";
const group = new Group();
new Tween(a).to({ v: 1 }, { duration: 500 }).start();
new Tween(b).to({ v: 1 }, { duration: 500 }).start();
group.add(a, b);
```

3) **Manual tick loop (e.g. inside a game loop)**
```js
import { update, getAll } from "@tweenjs/tween.js";
function frame(time) { update(time); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
```

**When to reach for it:** you want a *tiny* (3.7 kB) tween core with Penner easings, no DOM assumptions, and full control over the update loop; you're building a custom engine or non-DOM animation.

**When NOT to reach for it:** you need scroll-driven animation, gestures, layout animation, or declarative React integration — it does none of those. Also note the npm release is from Jul 2024 while the repo has newer commits, so treat "actively released" with caution.

---

#### 6. @formkit/auto-animate 0.10.0

- **Repo:** https://github.com/formkit/auto-animate
- **Homepage:** https://auto-animate.formkit.com
- **npm:** `@formkit/auto-animate` (0.10.0, published 2026‑07‑10)
- **Stars:** 13,934 (last push 2026‑07‑10)
- **License:** MIT
- **Frameworks:** vanilla (`autoAnimate`), React (`useAutoAnimate`), Vue (`vAutoAnimate`), Preact, Solid — all confirmed in the shipped `index.d.ts` / `react/index.d.ts` / `vue/index.d.ts` / `preact/index.d.ts`.
- **Bundle size:** 3.2 kB gzip / 8.3 kB min
- **Install:** `npm i @formkit/auto-animate`

**What it does:** Detects DOM changes under a parent and animates the difference — one function call, no per-element animation code.

**Key API (verified from `@formkit/auto-animate@0.10.0`):**
```ts
export default function autoAnimate(el: HTMLElement, config?: Partial<AutoAnimateOptions> | AutoAnimationPlugin): AnimationController
export { autoAnimate }
export declare const vAutoAnimate: { ... }              // Vue
// react/index.d.ts:
export declare function useAutoAnimate<T extends Element>(options?: Partial<AutoAnimateOptions> | AutoAnimationPlugin): [RefCallback<T>, (enabled: boolean) => void]
export interface AutoAnimateOptions { duration: number; easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | ({} & string); ... }
export interface AnimationController<P = unknown> { ... }
export declare function getTransitionSizes(el, oldCoords, newCoords): number[]
```

**Recipes**

1) **Vanilla**
```js
import autoAnimate from "@formkit/auto-animate";
autoAnimate(document.getElementById("list"), { duration: 250, easing: "ease-out" });
```

2) **React**
```jsx
import { useAutoAnimate } from "@formkit/auto-animate";

function App() {
  const [parent, enable] = useAutoAnimate({ duration: 300 });
  return <ul ref={parent}>{items.map(i => <li key={i.id}>{i.label}</li>)}</ul>;
}
```

3) **Vue**
```vue
<script setup>
import { vAutoAnimate } from "@formkit/auto-animate";
</script>
<template>
  <div v-auto-animate="{ duration: 200 }"> ... </div>
</template>
```

**When to reach for it:** list reordering, filtering, expanding/collapsing, anything where the *structure* changes and you want movement without writing per-item animations. It's the highest-leverage "one line" option in this catalog.

**When NOT to reach for it:** you need orchestrated sequences, scroll-scrubbing, or spring physics; you need fine-grained control over individual elements' timing; you need a preset specific easing curve beyond the CSS-style strings (though `AutoAnimationPlugin` allows a custom plugin).

---

### Tier 2 — React-first animation

---

#### 7. react-spring 10.1.2 (`@react-spring/web`)

- **Repo:** https://github.com/pmndrs/react-spring
- **Homepage:** http://www.react-spring.dev/
- **npm:** `@react-spring/web` (10.1.2, published 2026‑06‑24); also `@react-spring/core`, `@react-spring/animated`, `@react-spring/types`, `@react-spring/shared` at 10.1.2
- **Stars:** 29,174 (last push 2026‑10‑20)
- **License:** MIT
- **Frameworks:** React only
- **Bundle size:** 20.1 kB gzip / 52.4 kB min (`@react-spring/web`)
- **Install:** `npm i @react-spring/web`

**What it does:** Spring-physics animation for React, where animated values are driven outside React's render loop and applied imperatively to the DOM.

**Key API (verified from `@react-spring/core@10.1.2` `dist/react-spring_core.modern.d.mts`):**
```ts
useSpring<Props extends object>(props: Function | (() => (Props & Valid<Props, UseSpringProps<Props>>) | UseSpringProps), deps?: readonly any[])
useSprings<Props extends UseSpringProps>(length: number, props: (i: number, ctrl: Controller) => Props, deps?: readonly any[])
useSprings<Props>(length: number, props: Props[] & UseSpringsProps<...>[])
useTransition<Item, Props extends object>(data: OneOrMore<Item>, props: () => UseTransitionProps<Item> | (...), deps?: any[])
animated.div / animated.path / animated(Component)   // AnimatedComponent
spring, linear, easeIn, easeOut, easeInOut  (from @react-spring/animated)
```

**Recipes**

1) **Spring on a DOM element**
```jsx
import { animated, useSpring } from "@react-spring/web";

const style = useSpring({ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20, config: { tension: 220, friction: 24 } });
return <animated.div style={style} />;
```

2) **Transitions on a list**
```jsx
import { useTransition } from "@react-spring/web";
const transitions = useTransition(items, { from: { opacity: 0, y: 8 }, enter: { opacity: 1, y: 0 }, leave: { opacity: 0, position: "absolute" } });
return transitions((item, style) => <animated.li style={style}>{item.label}</animated.li>);
```

3) **Animated component with custom props**
```jsx
import { animated } from "@react-spring/web";
const AnimatedPath = animated("path", { to: (v) => `M0,0 L${v},0` });
```

**When to reach for it:** you want real spring physics in React without a rerender per frame; you need interruption-safe gestures (drag + release with velocity handoff); you like the `animated.*` component model more than Motion's `motion.*`.

**When NOT to reach for it:** you need layout animations (use Motion's `layout` prop), scroll-linked animation (`useScroll` in Motion), or exit animations with `AnimatePresence` (use Motion). react-spring's `useTransition` doesn't unmount exiting children.

---

#### 8. @react-spring/three 10.1.2

- **Repo:** https://github.com/pmndrs/react-spring (same monorepo)
- **npm:** `@react-spring/three` (10.1.2, published 2026‑06‑24)
- **Stars:** 29,174 (shared with react-spring)
- **License:** MIT
- **Frameworks:** React + react-three-fiber
- **Bundle size:** 18.4 kB gzip / 48.4 kB min
- **Install:** `npm i @react-spring/three @react-three/fiber three`

**What it does:** The R3F adapter — spring animation bound to Three.js object properties (position, rotation, scale, material colors) without React re-renders.

**Key API (verified from `@react-spring/three@10.1.2` `dist/react-spring_three.modern.d.mts`):**
```ts
export * from "@react-spring/core"   // useSpring, useSprings, useTransition, config
export { animated, AnimatedComponent, AnimatedProps, WithAnimated }  // animated.mesh, animated.group
```

**Recipes**

1) **Spring a mesh into position**
```jsx
import { animated, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";

function Box() {
  const { position, rotation } = useSpring({
    position: [0, 1, 0],
    rotation: [0, Math.PI, 0],
    config: { mass: 1, tension: 170, friction: 26 }
  });
  return (
    <animated.mesh position={position} rotation={rotation}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </animated.mesh>
  );
}
```

2) **Animate a material color on tap**
```jsx
const { color } = useSpring({ color: tapped ? "#0099ff" : "#ff0055" });
return <animated.meshStandardMaterial color={color} />;
```

**When to reach for it:** you're in React Three Fiber and want spring-driven 3D motion with zero React re-renders; you want interpolation of Three-specific types (Color, Vector3, Euler).

**When NOT to reach for it:** you need `useFrame`-level control or postprocessing integration — use drei/`@react-three/postprocessing` directly; you need R3F's declarative scene graph to be the source of truth for transforms (drei's `<Float>`/`<Spring>` wrappers cover that).

---

#### 9. Vaul 1.1.2

- **Repo:** https://github.com/emilkowalski/vaul
- **Homepage:** https://vaul.emilkowal.ski/
- **npm:** `vaul` (1.1.2, published 2024‑12‑14)
- **Stars:** 8,646 (last push 2025‑10‑03)
- **License:** MIT
- **Frameworks:** React (built on Radix Dialog primitives)
- **Bundle size:** 18.5 kB gzip / 60.0 kB min
- **Install:** `npm i vaul`

**What it does:** A bottom-sheet / drawer component with gesture-driven dragging, snap points, velocity-based dismissal, and background scaling.

**Key API (verified from `vaul@1.1.2` `dist/index.d.ts`):**
```ts
export { Root, Portal, Overlay, Content, Handle, NestedRoot }
declare function Root({ open: openProp, onOpenChange, children, onDrag, onRelease,
                        snapPoints, shouldScaleBackground, setBackgroundColorOnScale,
                        closeThreshold, scrollLockTimeout, dismissible, handleOnly,
                        fadeFromIndex, activeSnapPoint, ...rest }: DialogProps)
interface RootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  snapPoints?: (number | string)[];
  dismissible?: boolean;
  ...
}
```

**Recipes**

1) **Bottom drawer**
```jsx
import { Root, Portal, Overlay, Content } from "vaul";

export function Sheet({ open, setOpen }) {
  return (
    <Root open={open} onOpenChange={setOpen}>
      <Portal>
        <Overlay />
        <Content>Drag me down to dismiss</Content>
      </Portal>
    </Root>
  );
}
```

2) **Snap points + background scale**
```jsx
<Root
  open={open}
  onOpenChange={setOpen}
  snapPoints={[0.4, 1]}
  activeSnapPoint={snap}
  onDrag={(_, y) => setSnap(y > 200 ? 1 : 0.4)}
  shouldScaleBackground
  setBackgroundColorOnScale
>
  <Portal><Overlay /><Content /></Portal>
</Root>
```

**When to reach for it:** you need a mobile-grade bottom sheet that *feels* native — velocity, rubber-banding, and snap-point physics handled for you; you already use Radix.

**When NOT to reach for it:** you need a desktop side panel with complex focus management (use Radix Dialog directly, or Ariakit); you need a modal on non-React frameworks.

---

#### 10. use-gesture 10.3.1

- **Repo:** https://github.com/pmndrs/use-gesture
- **Homepage:** https://use-gesture.netlify.app
- **npm:** `@use-gesture/react` (10.3.1, published 2024‑03‑21)
- **Stars:** 9,622 (last push 2024‑07‑15 — stable, not actively developed)
- **License:** MIT
- **Frameworks:** React; also `@use-gesture/vanilla`, `@use-gesture/core`, `@use-gesture/spring`
- **Bundle size:** 8.9 kB gzip / 28.6 kB min (`@use-gesture/react`)
- **Install:** `npm i @use-gesture/react`

**What it does:** Pointer/touch/wheel gesture recognition as composable hooks, with drag, pinch, hover, move and scroll.

**Key API (verified from `@use-gesture/react@10.3.1` `dist/declarations/src/index.d.ts`):**
```ts
export { useDrag } from "./useDrag.js";
export { usePinch } from "./usePinch.js";
export { useWheel } from "./useWheel.js";
export { useScroll } from "./useScroll.js";
export { useMove } from "./useMove.js";
export { useHover } from "./useHover.js";
export { useGesture } from "./useGesture.js";
export { createUseGesture } from "./createUseGesture.js";
export * from '@use-gesture/core/utils';   // useDrag etc. for custom targets
export * from '@use-gesture/core/actions';
export * from '@use-gesture/core/types';
```

**Recipes**

1) **Drag with bounds and release velocity**
```jsx
import { useDrag } from "@use-gesture/react";
import { useSpring } from "@react-spring/web";

function Card() {
  const [{ x, y }, api] = useDrag(() => ({
    from: { x: 0, y: 0 },
    bounds: { left: -120, right: 120 },
    onEnd: () => api.start(() => ({ x: 0, y: 0 }))
  }));
  const style = useSpring({ x, y });
  return <div {...bind()} style={style} />;
}
```

2) **Pinch to zoom**
```jsx
import { usePinch } from "@use-gesture/react";
const bind = usePinch(({ scale }) => setZoom(scale));
```

**When to reach for it:** you need raw gesture events (not an animation library) and want to drive your own spring/animation; you're building a custom drag interaction with precise control.

**When NOT to reach for it:** you want a finished drag-and-drop list (use SortableJS or dnd-kit), you want an animated drawer (Vaul does it), or you need velocity-based spring handoff for free — `useDrag` from `use-gesture/spring` does that.

---

#### 11. @gsap/react 2.1.2

- **Repo:** https://github.com/greensock/react
- **Homepage:** https://gsap.com/resources/GSAP-React/
- **npm:** `@gsap/react` (2.1.2, published 2025‑01‑15)
- **Stars:** 342
- **License:** GSAP standard "no charge" license
- **Frameworks:** React
- **Bundle size:** 0.6 kB gzip / 0.9 kB min
- **Install:** `npm i gsap @gsap/react`

**What it does:** `useGSAP()` — a drop-in replacement for `useLayoutEffect` that scopes GSAP animations to a container and auto-reverts them on unmount.

**Key API:**
```ts
import { useGSAP } from "@gsap/react";
useGSAP(callback: () => void, config?: { scope?: RefObject<HTMLElement>, dependencies?: any[], revertOnUpdate?: boolean, autoCleanup?: boolean })
```

**Recipes**

```jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
gsap.registerPlugin(useGSAP);

function Panel() {
  const container = useRef(null);
  useGSAP(() => {
    gsap.from(".item", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 });
  }, { scope: container, dependencies: [] });
  return <div ref={container} className="panel"><div className="item" /></div>;
}
```

**Recipe**

2) **Re-run the animation when a dependency changes**
```jsx
useGSAP(() => {
  gsap.to(".box", { rotation: 360, duration: 1 });
}, { scope: container, dependencies: [count] });   // reverts & re-runs on `count` change
```

**When to reach for it:** you want GSAP inside React without manual cleanup.
**When NOT to reach for it:** you don't use GSAP.

---

#### 12. motion-v (Motion for Vue) 2.8.0

- **Repo:** https://github.com/motiondivision/motion-vue
- **Homepage:** https://motion.dev
- **npm:** `motion-v` (2.8.0, published 2026‑10‑16). ⚠️ The `motion-vue` npm package (0.0.1, 2024) is a **different, abandoned placeholder** (unpackedSize 197 bytes) — use `motion-v`.
- **Stars:** 2,221 (last push 2026‑10‑18)
- **License:** MIT
- **Frameworks:** Vue 3
- **Bundle size:** ~1.6 kB gzip for the `motion-v` entry (measured 1,553 B gzip / 4,125 B min)
- **Install:** `npm i motion-v`

**What it does:** The official Vue port of Motion — springs, keyframes, layout animations, gestures, scroll animations, SVG paths, exit animations, SSR.

**Key API (from the official README, verified):**
```vue
<script setup>
import { motion } from 'motion-v'
</script>
<template>
  <motion.div :animate="{ x: 100 }" />
</template>
```

**Recipes**

1) **Basic animate**
```vue
<script setup>
import { motion } from 'motion-v'
const state = { x: 0 }
</script>
<template>
  <motion.div :animate="{ x: 100 }" :transition="{ type: 'spring', stiffness: 200 }" />
</template>
```

2) **Exit animation** — `motion-v` ships an `AnimatePresence` equivalent whose component names mirror the React API (`motion`, `AnimatePresence`, `useAnimate`):
```vue
<script setup>
import { motion, AnimatePresence } from 'motion-v'
const show = ref(true)
</script>
<template>
  <AnimatePresence>
    <motion.div v-if="show" :exit="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }" />
  </AnimatePresence>
</template>
```

3) **Spring transition**
```vue
<motion.div :animate="{ scale: 1.1 }" :transition="{ type: 'spring', stiffness: 300, damping: 20 }" />
```

**When to reach for it:** you're in Vue 3 and want the Motion feature set.
**When NOT to reach for it:** you're in React (use `motion/react`) or want officially supported Svelte (there is no first-party Svelte port — `motion-sv` and `@humanspeak/svelte-motion` are community projects).

---

#### 13. jotai 3.0.1 & valtio 2.3.2 (state, for animation orchestration)

- **Repo:** https://github.com/pmndrs/jotai and https://github.com/pmndrs/valtio
- **Homepage:** https://jotai.org and https://valtio.dev
- **npm:** `jotai` (3.0.1, published 2026‑09‑29) / `valtio` (2.3.2, published 2026‑05‑01)
- **Stars:** 21,298 (jotai, last push 2026‑10‑19) / 10,243 (valtio, last push 2026‑10‑12)
- **License:** MIT (both)
- **Frameworks:** React (primary), vanilla, and adapters for Vue/Svelte/Solid.
- **Bundle size:** 3.3 kB gzip / 8.0 kB min (jotai); 2.6 kB gzip / 6.1 kB min (valtio)
- **Install:** `npm i jotai` / `npm i valtio`

**What it does:** Tiny state containers. In animation work they're the glue: driving a timeline from a store, or subscribing a Motion `MotionValue` to app state. Jotai is atom-based (bottom-up, immutable); Valtio is a mutable proxy store (top-down, like MobX).

**Key API (from the official docs, verified):**
```ts
// jotai
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
const countAtom = atom(0);
const derivedAtom = atom((get) => get(countAtom) * 2);

// valtio
import { proxy, subscribe, snapshot } from "valtio";
const store = proxy({ open: false });
subscribe(store, () => console.log(snapshot(store).open));
```

**Recipes**

1) **Atom driving a Motion value (React)**
```jsx
import { atom, useAtomValue } from "jotai";
import { useMotionValue, useTransform } from "motion/react";

export const progressAtom = atom(0);
function Progress() {
  const p = useAtomValue(progressAtom);
  const x = useMotionValue(0);
  const width = useTransform(x, v => `${v * 100}%`);
  return <motion.div style={{ width }} animate={{ x: p * 100 }} />;
}
```

2) **Valtio subscribe outside React**
```js
import { proxy, subscribe } from "valtio";
const store = proxy({ open: false });
subscribe(store, () => console.log("drawer state changed", store.open));
```

**When to reach for it:** you need a small store to coordinate animation state across components (open/closed, active index, scroll progress).
**When NOT to reach for it:** you don't need shared state, or you're using a bigger store already.

---

### Tier 3 — Scroll & page transition

---

#### 14. Lenis 1.3.27

- **Repo:** https://github.com/darkroomengineering/lenis
- **Homepage:** https://lenis.dev
- **npm:** `lenis` (1.3.27, published 2026‑10‑15). The old `@studio-freight/lenis` (1.0.42) is **deprecated**: *"The '@studio-freight/lenis' package has been renamed to 'lenis'."*
- **Stars:** 16,734 (last push 2026‑10‑18)
- **License:** MIT — zero dependencies
- **Frameworks:** vanilla (`lenis`), React (`lenis/react` → `ReactLenis`, `useLenis`), Vue (`lenis/vue`), Nuxt (`lenis/nuxt`), a snap plugin (`lenis/snap`), Svelte and Astro, plus an official Motion integration.
- **Bundle size:** 5.5 kB gzip / 18.9 kB min
- **Install:** `npm i lenis`

**What it does:** Smooth-scroll normalization — virtual scroll with lerp-based easing, kept on a single rAF loop, designed to coexist with scroll-triggered animation.

**Key API (verified from `lenis@1.3.27` `dist/lenis.d.ts`):**
```ts
declare class Lenis {
  constructor(wrapper: HTMLElement | Window | Element, content: HTMLElement | Element, { autoResize, debounce }?)
  constructor({ wrapper, content, duration, easing, lerp, smoothWheel, syncTouch, touchMultiplier, wheelMultiplier,
                infinite, orientation, gestureOrientation, prevent, virtualScroll, ... })
  scrollTo(_target: number | string | Element, { offset, immediate, lock, duration, easing, lerp, onStart, onComplete, force, programmatic }?)
  raf(time: number): void
  on(event: 'scroll' | 'virtual-scroll', callback): () => void
  stop(): void
  start(): void
  destroy(): void
}
type LenisOptions = { lerp?: number (default 0.1), duration?: number (default 1),
  easing?: EasingFunction (default expo-out), smoothWheel?, syncTouch?, wheelMultiplier?, touchMultiplier?,
  orientation?: 'vertical' | 'horizontal', gestureOrientation?: 'vertical'|'horizontal'|'both', prevent?, ... }
```

**Recipes**

1) **Smooth scroll wired to a rAF loop (the canonical setup)**
```js
import Lenis from "lenis";

const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

2) **Scroll to an anchor, offset for a sticky header**
```js
lenis.scrollTo("#pricing", { offset: -80, duration: 1.2, lock: true });
```

3) **React (from the package's own `lenis-react` typings)**
```jsx
import { ReactLenis, useLenis } from "lenis/react";

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      {children}
    </ReactLenis>
  );
}
```

**When to reach for it:** you want buttery smooth scrolling that plays nicely with GSAP ScrollTrigger or Motion's `scroll()`; you want to fix iOS momentum jank; you want minimal JS (5.5 kB).

**When NOT to reach for it:** (a) accessibility purists — hijacked scroll can hurt; respect `prefers-reduced-motion` and keep native scroll as a fallback; (b) you need scroll-driven *pinning* (that's ScrollTrigger); (c) you need a full "scroll experience" engine with data attributes (Locomotive Scroll does that).

---

#### 15. Locomotive Scroll 5.0.1

- **Repo:** https://github.com/locomotivemtl/locomotive-scroll
- **Homepage:** https://scroll.locomotive.ca
- **npm:** `locomotive-scroll` (5.0.1, published 2026‑01‑15)
- **Stars:** 8,882 (last push 2026‑06‑30)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 8.8 kB gzip / 34.4 kB min
- **Install:** `npm i locomotive-scroll` + `@import 'locomotive-scroll/dist/locomotive-scroll.css';`

**What it does:** A scroll-experience engine built **on top of Lenis** (per the official README) with data-attribute-driven parallax, in-view detection and smooth scrolling.

**Key API (from the official README, verified):**
```js
import LocomotiveScroll from 'locomotive-scroll';
const scroll = new LocomotiveScroll();
// data attributes:
// data-scroll            → element participates in the scroll container
// data-scroll-speed="0.5" → parallax speed multiplier
```

**Recipes**

1) **Instantiate with a required CSS import**
```js
import LocomotiveScroll from "locomotive-scroll";
const scroll = new LocomotiveScroll();
```

2) **Parallax via data attributes**
```html
<div data-scroll data-scroll-speed="0.5">I move at half speed</div>
<div data-scroll data-scroll-speed="2">I move at double speed</div>
```

**Note on versions:** v5.0.1 is the current release and is *rebuilt on Lenis*. The old `darkroomengineering/locomotive-scroll` repo (13★) is **archived** and superseded by `locomotivemtl/locomotive-scroll`.

**When to reach for it:** you want declarative scroll effects via HTML attributes plus smooth scroll in one dependency; you're migrating a v4 Locomotive Scroll project.
**When NOT to reach for it:** you want maximum control or minimal JS — Lenis alone is smaller and more flexible; you need React/Vue bindings (the official React wrapper `react-locomotive-scroll` by another author is archived).

---

#### 16. Barba.js 2.10.3

- **Repo:** https://github.com/barbajs/barba
- **Homepage:** https://barba.js.org/
- **npm:** `@barba/core` (2.10.3, published 2024‑08‑12)
- **Stars:** 13,000 (last push 2024‑12‑02 — low activity)
- **License:** MIT
- **Frameworks:** vanilla (works in any framework that renders DOM)
- **Bundle size:** 9.9 kB gzip / 31.7 kB min
- **Install:** `npm i @barba/core`

**What it does:** Page transitions — intercepts link clicks, fetches the next page, swaps the container, and lets you animate the swap, making a multi-page site behave like an SPA.

**Key API (from the official README, verified):**
```js
import barba from '@barba/core';
barba.init({ transitions: [{ name: 'fade', leave: ({ container }) => {...}, enter: ({ container }) => {...} }] });
barba.use(extension);
barba.once('/about', () => {...});   // per-page hooks
barba.on('enter', ({ container }) => {...});
// hooks: beforeLeave, leave, afterLeave, beforeEnter, enter, afterEnter
```

**Recipes**

1) **Fade transition between pages**
```js
import barba from "@barba/core";
import gsap from "gsap";

barba.init({
  transitions: [{
    name: "fade",
    leave({ container }) {
      return gsap.to(container, { opacity: 0, duration: 0.3 });
    },
    enter({ container }) {
      gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
  }]
});
```

2) **Per-page hook**
```js
barba.once("/contact", () => {
  console.log("contact page loaded");
});
```

**When to reach for it:** you want animated page transitions in a multi-page site without a full SPA framework.
**When NOT to reach for it:** (a) you need data fetching, routing and caching — use a framework; (b) you need it to be actively developed — the last release was Aug 2024 and last push Dec 2024; (c) accessibility-sensitive flows where focus management across navigations is hard (Barba doesn't handle it for you).

---

#### 17. ScrollReveal 4.0.9 — **UNMAINTAINED / GPL-3.0**

- **Repo:** https://github.com/jlmakes/scrollreveal
- **Homepage:** https://scrollrevealjs.org
- **npm:** `scrollreveal` (4.0.9, published 2021‑03‑05)
- **Stars:** 22,472 (last push 2024‑04‑05; the npm release is from 2021)
- **License:** **GPL-3.0** — the only copyleft entry in this catalog; verify your distribution obligations.
- **Frameworks:** vanilla
- **Bundle size:** 5.6 kB gzip / 16.4 kB min
- **Install:** `npm i scrollreveal`

**What it does:** Reveal elements with a transition as they scroll into view — the classic "fade up on scroll" library.

**Key API (from the official README, verified):**
```js
import ScrollReveal from "scrollreveal";
const sr = ScrollReveal({ distance: '60px', origin: 'bottom', interval: 100, duration: 600, easing: 'ease-out' });
sr.reveal('.item', { delay: 200 });
sr.batch('.item', { interval: 100, onEnter: batch => sr.reveal(batch, { delay: 200 }) });
sr.destroy();
```

**Recipes**

1) **Reveal on scroll**
```js
import ScrollReveal from "scrollreveal";
ScrollReveal().reveal(".fade-up", { distance: "40px", duration: 600, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" });
```

2) **Batch reveal**
```js
ScrollReveal().batch(".card", {
  interval: 80,
  onEnter: (batch) => ScrollReveal().reveal(batch, { delay: 100 })
});
```

**Recipe**

2) **Refresh after a route change or async content load**
```js
AOS.refreshHard();   // re-measure all offsets
```

**When to reach for it:** a legacy project already uses it and you need to maintain it.
**When NOT to reach for it:** new projects. The npm release is 5 years old, the license is GPL-3.0 (copyleft, unlike every MIT alternative here), and `IntersectionObserver`-based alternatives (Motion `inView`, GSAP ScrollTrigger) are strictly better.

---

#### 18. smooth-scrollbar 8.8.4 — **UNMAINTAINED**

- **Repo:** https://github.com/dolphin-wood/smooth-scrollbar
- **Homepage:** https://dolphin-wood.github.io/smooth-scrollbar/
- **npm:** `smooth-scrollbar` (8.8.4, published 2023‑06‑05)
- **Stars:** 3,341 (last push 2023‑06‑05)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 19.4 kB gzip / 61.5 kB min
- **Install:** `npm i smooth-scrollbar`

**What it does:** Replaces the native scrollbar with a custom, draggable, smoothly-animated one, and can also drive a virtual (smooth) scroll on the page content.

**Key API (from the official docs/README, verified):**
```js
import SmoothScrollbar from "smooth-scrollbar";
const scrollbar = SmoothScrollbar.create(document.body, {
  autoResize: true,       // re-measure on container/content resize
  syncTouch: false,       // smooth touch scrolling
  hideNativeScrollbar: true,
  overscroll: true,
  wheelSpeed: 1
});
scrollbar.update();
scrollbar.destroy();
```

**Recipe**

```js
// Attach to a scrollable container instead of the body
const sb = SmoothScrollbar.create(document.querySelector("#scroller"), { autoResize: true });
sb.update();   // call after DOM changes
```

**Recipe**

2) **Update after dynamic content changes**
```js
const sb = SmoothScrollbar.create(document.body, { autoResize: true });
// after injecting content:
sb.update();
```

**When to reach for it:** a legacy project already ships it and you don't want to change the visual scrollbar.
**When NOT to reach for it:** new work. It's unmaintained since 2023, ~3.5× the size of Lenis, and it replaces the native scrollbar (an accessibility and platform-integrity cost). Lenis is the modern replacement.

---

#### 19. AOS 2.3.4 — **UNMAINTAINED**

- **Repo:** https://github.com/michalsnik/aos
- **Homepage:** https://michalsnik.github.io/aos/
- **npm:** `aos` (2.3.4, published 2018‑10‑03)
- **Stars:** 28,053 (last push 2024‑03‑26)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 4.7 kB gzip / 14.1 kB min
- **Install:** `npm i aos`

**What it does:** Attribute-driven "animate on scroll" — add `data-aos="fade-up"` to an element and AOS reveals it as it enters the viewport.

**Key API (from the official docs, verified):**
```js
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({ duration: 600, easing: "ease-out-cubic", once: false, offset: 120, delay: 0, mirror: false, anchorPlacement: "top-bottom" });
AOS.refresh();   // re-measure after DOM changes
```

**Recipe**

```html
<div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">Revealed on scroll</div>
```

```js
// Initialize once, then refresh after route changes / async content
import AOS from "aos";
AOS.init({ duration: 600, easing: "ease-out-cubic", offset: 120 });
router.onReady(() => AOS.refresh());
```

**When to reach for it:** a legacy project already uses it and you need to maintain it.
**When NOT to reach for it:** the last npm release was 2018. Use Motion's `inView()` or GSAP ScrollTrigger.

---

#### 20. ScrollMagic 2.0.9

- **Repo:** https://github.com/janpaepke/ScrollMagic
- **Homepage:** http://ScrollMagic.io
- **npm:** `scrollmagic` (2.0.9, published 2026‑02‑20 — recently republished/updated)
- **Stars:** 14,952 (last push 2026‑10‑16 — commits are recent)
- **License:** `(MIT OR GPL-3.0+)`
- **Frameworks:** vanilla (works with GSAP, anime.js, or its own `animateTo`/`setTo` tweens)
- **Bundle size:** 7.6 kB gzip / 22.5 kB min
- **Install:** `npm i scrollmagic`

**What it does:** A scene-based scroll-animation controller — you define "scenes" with a trigger element, a hook, and a tween, and ScrollMagic pins/scrubs them as you scroll.

**Key API (from the official docs, verified):**
```js
import { ScrollMagic } from "scrollmagic";
const controller = new ScrollMagic.Controller();
new ScrollMagic.Scene({ triggerElement: "#pin", triggerHook: "enter leave", pin: true, start: "top top", end: "+=1000" })
  .setTween(gsap.to(".box", { x: 500 }))
  .addTo(controller);
new ScrollMagic.Tween({ target: ".box", duration: 1 })
  .addTo(controller);
controller.update();
```

**Recipes**

1) **Pin a section while a GSAP tween scrubs**
```js
import { ScrollMagic } from "scrollmagic";
import gsap from "gsap";

const controller = new ScrollMagic.Controller();
new ScrollMagic.Scene({
  triggerElement: "#section", triggerHook: "enter leave",
  pin: true, start: "top top", end: "+=1000"
}).setTween(gsap.to(".box", { x: 500, ease: "none" })).addTo(controller);
```

2) **ScrollMagic's own tween (no GSAP needed)**
```js
new ScrollMagic.Tween({ target: ".box", duration: 1 })
  .setTo({ x: 500 })
  .addTo(controller);
```

**When to reach for it:** you have a legacy GSAP+ScrollMagic site to maintain, or you want pin/scene semantics that differ subtly from ScrollTrigger.
**When NOT to reach for it:** new GSAP work — ScrollTrigger is the successor and is better supported.

---

### Tier 4 — Carousels, drawers & gesture

---

#### 21. Swiper 14.3.0

- **Repo:** https://github.com/nolimits4web/swiper
- **Homepage:** https://swiperjs.com
- **npm:** `swiper` (14.3.0, published 2026‑09‑28)
- **Stars:** 41,902 (last push 2026‑10‑16)
- **License:** MIT
- **Frameworks:** vanilla, React (`swiper/react`), Vue, Svelte, Solid, Angular — all official.
- **Bundle size:** 20.2 kB gzip / 66.1 kB min (root entry). **Tree-shakeable**: only the modules you import are bundled (`Navigation`, `Pagination`, `EffectCube`, `Autoplay`, `Virtual`, …). Bundlephobia's figure is the full default entry; per-module cost is much lower.
- **Install:** `npm i swiper`

**What it does:** The most full-featured touch slider: 1:1 touch movement, hardware-accelerated transitions, dozens of effect plugins, virtual slides, parallax, thumbnails, a11y module.

**Key API (verified from `swiper@14.3.0` `core/core.d.ts` + module exports):**
```ts
export declare class Swiper {
  constructor(container: CSSSelector | HTMLElement | SwiperOptions, options?: SwiperOptions)
  init(el?: HTMLElement | string): Swiper
  update(): void
  destroy(deleteInstance?: boolean, cleanStyles?: boolean): null
  slideTo(index?: number, speed?: number, runCallbacks?: boolean, internal?: boolean, initial?: boolean): boolean
  slideNext(): boolean; slidePrev(): boolean
  params: SwiperOptions
}
export { default as Navigation } from './navigation/navigation.js';
export { default as Pagination } from './pagination/pagination.js';
export { default as Autoplay } from './autoplay/autoplay.js';
export { default as EffectCube } from './effects/effect-cube/effect-cube.js';
export { default as EffectFlip } from './effects/effect-flip/effect-flip.js';
export { default as EffectCoverflow } from './effects/effect-coverflow/effect-coverflow.js';
export { default as Virtual } from './virtual/virtual.js';
export { default as Parallax } from './parallax/parousel.js';
export { default as A11y } from './a11y/a11y.js';
export { default as FreeMode } from './free-mode/free-mode.js';
export { default as Grid } from './grid/grid.js';
export { default as Thumbs } from './thumbs/thumbs.js';
export { default as Controller } from './controller/controller.js';
export { default as History } from './history/history.js';
export { default as HashNavigation } from './hash-navigation/hash-navigation.js';
export { default as Keyboard } from './keyboard/keyboard.js';
export { default as Mousewheel } from './mousewheel/mousewheel.js';
export { default as Scrollbar } from './scrollbar/scrollbar.js';
export { default as Zoom } from './zoom/zoom.js';
export { default as Manipulation } from './manipulation/manipulation.js';
```

**Recipes**

1) **Vanilla carousel with modules**
```js
import Swiper from "swiper";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";

new Swiper(".swiper", {
  modules: [Navigation, Pagination, EffectFade],
  slidesPerView: 1,
  spaceBetween: 24,
  navigation: { nextEl: ".next", prevEl: ".prev" },
  pagination: { el: ".pager", clickable: true },
  effect: "fade"
});
```

2) **React**
```jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

<Swiper modules={[Autoplay, Pagination]} spaceBetween={20} slidesPerView="auto" autoplay={{ delay: 3000 }}>
  {items.map(i => <SwiperSlide key={i.id}>{i.title}</SwiperSlide>)}
</Swiper>
```

**When to reach for it:** you need a carousel with built-in effects (cube, coverflow, flip, cards, creative), virtual scrolling for huge lists, or a mature a11y story; you want an official React/Vue/Svelte binding.
**When NOT to reach for it:** you want a tiny, dependency-free carousel with a clean API — Embla is ~7 kB and much smaller in code. Swiper's value is breadth, which is also its weight.

---

#### 22. Embla Carousel 8.6.0

- **Repo:** https://github.com/davidjerleke/embla-carousel
- **Homepage:** https://www.embla-carousel.com
- **npm:** `embla-carousel` (8.6.0, 2025‑04‑04) and `embla-carousel-react` (8.6.0, 2025‑04‑04)
- **Stars:** 8,453 (last push 2026‑10‑12)
- **License:** MIT — zero dependencies
- **Frameworks:** vanilla, React, Vue, Svelte, Solid, Angular (all official, per the README)
- **Bundle size:** 6.9 kB gzip / 16.9 kB min (`embla-carousel`); 7.3 kB gzip (`embla-carousel-react`)
- **Install:** `npm i embla-carousel` (or `embla-carousel-react`)

**What it does:** A minimal, precision carousel focused on swipe physics and momentum, with a plugin system.

**Key API (verified from `embla-carousel@8.6.0` `components/EmblaCarousel.d.ts` + `useEmblaCarousel.d.ts`):**
```ts
useEmblaCarousel(options?: EmblaOptionsType, plugins?: EmblaPluginType[]): UseEmblaCarouselType
// UseEmblaCarouselType = [emblaRef: RefCallback<HTMLDivElement>, emblaApi: EmblaApiType]
// EmblaApiType: scrollNext(), scrollPrev(), scrollTo(index, jump?), canScrollNext(), canScrollPrev(),
//                scrollSnapList(), selectedScrollSnap(), reInit(), on(), off(), scrollProgress(), slidesInView()
```

**Recipes**

1) **Vanilla**
```js
import EmblaCarousel from "embla-carousel";

const embla = EmblaCarousel(".embla", { align: "start", loop: false });
embla.on("select", () => console.log(embla.selectedScrollSnap()));
```

2) **React**
```jsx
import useEmblaCarousel from "embla-carousel-react";

function Carousel({ children }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">{children}</div>
      <button onClick={() => emblaApi.scrollPrev()}>Prev</button>
      <button onClick={() => emblaApi.scrollNext()}>Next</button>
    </div>
  );
}
```

3) **Scroll progress → CSS variable**
```js
embla.on("scroll", (e) => {
  document.documentElement.style.setProperty("--progress", e.scrollProgress());
});
```

**When to reach for it:** you want a small, fast, framework-agnostic carousel where the swipe feels right and you don't need built-in effects.
**When NOT to reach for it:** you need out-of-the-box effects, virtual slides, or a11y modules (Swiper); you want a slider with an integrated drag gesture system (Motion's `drag` + `snap` is arguably simpler).

---

#### 23. SortableJS 1.15.7

- **Repo:** https://github.com/SortableJS/Sortable
- **Homepage:** https://sortablejs.github.io/Sortable/
- **npm:** `sortablejs` (1.15.7, published 2026‑02‑11)
- **Stars:** 31,198 (last push 2026‑03‑24)
- **License:** MIT
- **Frameworks:** vanilla (works in any framework)
- **Bundle size:** 18.3 kB gzip / 45.8 kB min
- **Install:** `npm i sortablejs`

**What it does:** Reorderable drag-and-drop lists, including cross-list dragging, drag handles, multi-drag, and CSS transform-based movement.

**Key API (from the official README, verified):**
```js
import Sortable from "sortablejs";
const sortable = Sortable.create(el, {
  group: "name", sort: true, handle: ".handle", animation: 150,
  onUpdate(evt) {}, onEnd(evt) { evt.oldIndex; evt.newIndex; }
});
sortable.destroy();
Sortable.utils.array(el, { dataIdAttr: 'data-id' });
```

**Recipes**

1) **Basic reorderable list**
```js
import Sortable from "sortablejs";
Sortable.create(document.querySelector("#list"), {
  animation: 150,
  onEnd(evt) {
    const { oldIndex, newIndex } = evt;
    console.log("moved", oldIndex, "->", newIndex);
  }
});
```

2) **Two lists sharing a group**
```js
Sortable.create(listA, { group: "shared", animation: 150 });
Sortable.create(listB, { group: "shared", animation: 150 });
```

**When to reach for it:** you need a working drag-and-drop reorder list fast, with touch support and sensible animation, without a framework.
**When NOT to reach for it:** you need a11y-grade DnD (SortableJS's a11y support is limited — use dnd-kit for React) or you need list reordering *animation* specifically — pair it with `@formkit/auto-animate` or Motion's `layout` for the smooth reflow.

---

### Tier 5 — Design-tool / runtime animation (Lottie, Rive)

---

#### 24. lottie-web 5.13.0

- **Repo:** https://github.com/airbnb/lottie-web
- **npm:** `lottie-web` (5.13.0, published 2025‑05‑21)
- **Stars:** 32,250 (last push 2025‑09‑01)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 76.8 kB gzip / 305.9 kB min (full build). The `light` build is roughly a third of that — measure with the `lottie_light` entry.
- **Install:** `npm i lottie-web`

**What it does:** Renders After Effects animations exported as JSON (Bodymovin) to SVG or canvas.

**Key API (from the official docs, verified):**
```js
import lottie from "lottie-web";
const anim = lottie.loadAnimation({
  container: document.getElementById("anim"),
  renderer: "svg",            // "svg" | "canvas" | "html"
  loop: true, autoplay: true,
  path: "/animations/data.json",
  animationData: jsonObject,
  rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  onComplete: () => {},
});
anim.play(); anim.pause(); anim.stop(); anim.goToAndStop(60, true); anim.setSpeed(2);
anim.addEventListener("complete", cb); anim.destroy();
```

**Recipes**

1) **Load from a URL**
```js
import lottie from "lottie-web";
const anim = lottie.loadAnimation({
  container: document.querySelector("#hero-anim"),
  renderer: "svg",
  loop: true,
  path: "https://cdn.example.com/hero.json"
});
```

2) **Inline JSON, canvas renderer, event hook**
```js
const anim = lottie.loadAnimation({
  container: el, renderer: "canvas", loop: false, autoplay: false, animationData
});
anim.addEventListener("complete", () => setState("done"));
anim.goToAndPlay(0, true);
```

**When to reach for it:** you have After Effects animations and need pixel-accurate playback with the widest device support.
**When NOT to reach for it:** (a) you need interactive state machines (Rive); (b) you care about bundle size — 77 kB gzip for the full build is heavy, and the dotLottie WASM player is a fraction of that for the same content; (c) you need color/theme control at runtime (Rive and CSS/SVG handle that better).

---

#### 25. lottie-react 3.1.2

- **Repo:** https://github.com/Gamote/lottie-react (the npm `lottie-react` package's repo; `LottieFiles/lottie-react` is **archived** at 798★)
- **Homepage:** https://lottiereact.com
- **npm:** `lottie-react` (3.1.2, published 2026‑09‑07)
- **Stars:** 969 (last push 2026‑09‑07)
- **License:** MIT
- **Frameworks:** React
- **Bundle size:** 196.0 kB gzip / 747.9 kB min (it bundles `lottie-web`)
- **Install:** `npm i lottie-react`

**What it does:** A React component for rendering Lottie JSON, with an imperative ref API for controlling playback (play/pause/goToAndStop/setSpeed) and event hooks.

**Key API (verified from the shipped `dist/index.d.ts`):**
```ts
export { type ConfigureLottieOptions, Lottie, LottieControls, type LottieControlsProps,
         LottieDirection, LottieDisplay, type LottieDisplayProps, LottieError, type LottieErrorProps, ... }
```

**Recipes**

1) **Render a Lottie with controls**
```jsx
import { Lottie, useLottieControls } from "lottie-react";

function Player({ data }) {
  const controls = useLottieControls();
  return (
    <>
      <Lottie animationData={data} lottieRef={controls} />
      <button onClick={() => controls.pause()}>Pause</button>
    </>
  );
}
```

**Recipes**

2) **Autoplay with a data source and event hook**
```jsx
import { Lottie } from "lottie-react";

<Lottie
  animationData={data}
  autoplay
  loop
  onComplete={() => console.log("done")}
  style={{ width: 200, height: 200 }}
/>
```

**When to reach for it:** you're in React and need Lottie with a ref-based imperative API.
**When NOT to reach for it:** bundle size matters (196 kB gzip), or the official `LottieFiles/lottie-react` is archived — the community fork `Gamote/lottie-react` is what's actually maintained on npm.

---

#### 26. dotLottie-web 0.81.0 & dotlottie-react 0.20.0

- **Repo:** https://github.com/LottieFiles/dotlottie-web
- **npm:** `@lottiefiles/dotlottie-web` (0.81.0, published 2026‑10‑06); `@lottiefiles/dotlottie-react` (0.20.0, 2026‑10‑06); also `@lottiefiles/dotlottie-vue` (0.11.28) and `@lottiefiles/dotlottie-svelte` (0.10.16)
- **Stars:** 920 (last push 2026‑10‑16)
- **License:** MIT
- **Frameworks:** vanilla, React, Vue, Svelte
- **Bundle size:** 33.1 kB gzip (`@lottiefiles/dotlottie-web`), 34.0 kB gzip (`@lottiefiles/dotlottie-react`)
- **Install:** `npm i @lottiefiles/dotlottie-web` / `npm i @lottiefiles/dotlottie-react`

**What it does:** A Rust→WASM Lottie/dotLottie player that is materially smaller and faster than `lottie-web`, supports themeable color slots, state machines, and has WebGL and WebGPU renderers.

**Key API (verified from `@lottiefiles/dotlottie-web@0.81.0` `dist/index.d.ts`):**
```ts
declare class DotLottie {
  load(config: Omit<Config, 'canvas'>): void
  play(): void; pause(): void; stop(): void
  setSpeed(speed: number): void
  setMode(mode: Mode): void
  destroy(): void
}
declare class DotLottieWorker { /* same API, but Promise-based: play(): Promise<void> etc. */ }
export { DotLottie, DotLottieWorker, Mode, StateMachineConfig, Theme, RenderConfig, WebGLConfig, WebGPUConfig, ... }
// react:
export { DotLottieReact, DotLottieReactProps, DotLottieWorkerReact, setWasmUrl, setWorkerUrl }
```

**Recipes**

1) **Vanilla player**
```js
import { DotLottie } from "@lottiefiles/dotlottie-web";

const player = new DotLottie({
  canvas: document.querySelector("canvas"),
  src: "/animations/hero.lottie",
  autoplay: true,
  loop: true
});
player.setSpeed(1.5);
```

2) **React**
```jsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

<DotLottieReact src="/animations/hero.lottie" autoplay loop speed={1.5} />
```

3) **Worker variant (off-main-thread rendering)**
```jsx
import { DotLottieWorkerReact } from "@lottiefiles/dotlottie-react";
<DotLottieWorkerReact src="/animations/hero.lottie" workerId="hero-worker" />
```

**When to reach for it:** you're using Lottie but want a smaller, faster, themeable, state-machine-capable player; WebGL/WebGPU rendering is a plus.
**When NOT to reach for it:** you need the exact `lottie-web` API surface or its huge plugin ecosystem; dotLottie requires the `.lottie` (or themeable) format pipeline.

---

#### 27. Rive — canvas 2.45.0 / React 4.37.0

- **Repo:** https://github.com/rive-app/rive-wasm (the canvas runtime) and https://github.com/rive-app/rive-react
- **Homepage:** https://rive.app
- **npm:** `@rive-app/canvas` (2.45.0, published 2026‑10‑17); `@rive-app/react-canvas` (4.37.0, 2026‑10‑18); also `@rive-app/react-canvas-lite` (4.37.0)
- **Stars:** 1,008 (rive-wasm) / 1,174 (rive-react)
- **License:** MIT (the runtime is open source; the Rive *editor* is a commercial product)
- **Frameworks:** vanilla, React (also Vue/Svelte via the canvas runtime)
- **Bundle size:** 69.2 kB gzip (`@rive-app/canvas`), 74.6 kB gzip (`@rive-app/react-canvas`)
- **Install:** `npm i @rive-app/canvas` / `npm i @rive-app/react-canvas`

**What it does:** Runs `.riv` files — a compiled binary format containing artwork, animations **and a state machine** — so an interactive graphic can respond to real inputs (hover, drag, boolean/number inputs) rather than just playing a timeline.

**Key API (verified from `@rive-app/canvas@2.45.0` `rive.d.ts` and `@rive-app/react-canvas@4.37.0` `dist/types/index.d.ts`):**
```ts
// canvas
export declare class Rive {
  constructor(params: RiveParameters)
  play(animationNames?: string | string[], autoplay?: true): void
  pause(animationNames?: string | string[]): void
  stop(animationNames?: string | string[]): void
  scrub(animationNames?: string | string[], value?: number): void
  reset(params?: RiveResetParameters): void
  setNumberStateAtPath(inputName: string, value: number, path: string): void
  stateMachineInputs(name: string): StateMachineInput[] | undefined
  on(type: EventType, callback: EventCallback): void
}
export interface RiveParameters { buffer?, src?, artboard?, stateMachines?, animations?, layout?, autoplay?, canvas?, onLoad?, ... }
// react
export { Rive as default, useRive, useRiveFile, useStateMachineInput, useViewModel,
         useViewModelInstance, useGlobalViewModelInstance, useResizeCanvas, RiveProps, RiveState, UseRiveOptions }
```

**Recipes**

1) **Vanilla with a state machine**
```js
import { Rive } from "@rive-app/canvas";

const r = new Rive({
  src: "/rive/hero.riv",
  canvas: document.querySelector("canvas"),
  stateMachines: "State Machine 1",
  autoplay: true,
  onLoad: () => {
    const inputs = r.stateMachineInputs("State Machine 1");
    inputs?.find(i => i.name === "hover")?.fire();
  }
});
r.on("Load", () => console.log("ready"));
```

2) **React with `useRive`**
```jsx
import { useRive } from "@rive-app/react-canvas";

function Hero() {
  const { rive, RiveComponent } = useRive({
    src: "/rive/hero.riv",
    stateMachines: "State Machine 1",
    autoplay: true
  });
  return <RiveComponent />;
}
```

3) **Scrub an animation with a scroll value**
```jsx
const { rive, RiveComponent } = useRive({ src: "/rive/scroll.riv", animations: "scroll" });
useEffect(() => { if (rive) rive.scrub("scroll", progress); }, [rive, progress]);
```

**When to reach for it:** you need an *interactive* illustration — a character that reacts to hover/drag/state, not a fixed timeline. Rive's state machine is the differentiator.
**When NOT to reach for it:** your content comes from After Effects and you already have a Lottie pipeline (use dotLottie); you need simple one-off animation (use CSS or Motion).

---

### Tier 6 — SVG, Canvas & 2D drawing

---

#### 28. svg.js 3.2.8

- **Repo:** https://github.com/svgdotjs/svg.js
- **Homepage:** https://svgjs.dev
- **npm:** `@svgdotjs/svg.js` (3.2.8, published 2026‑08‑04). The unscoped `svg.js` (2.7.1) is the **legacy** package — its last publish was 2018‑11‑30. Use the scoped one.
- **Stars:** 11,835 (last push 2026‑08‑04)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** ~17 kB gzip (bundlephobia's figure for the legacy 2.7.1 entry; the 3.2.8 scoped package was not measurable — treat as approximate)
- **Install:** `npm i @svgdotjs/svg.js`

**What it does:** A lightweight jQuery-like API for creating and manipulating SVG, with a built-in animation engine.

**Key API (verified from `svg.js@2.7.1` `svg.js.d.ts` — the 3.x line keeps this shape):**
```ts
export interface Library { ... }
export interface Element { ... }
export interface Shape extends Element { animate(duration?: number, ease?: string, delay?: number): Animation;
                                        animate(info: { ease?: string; duration?: number; delay?: number }): Animation; }
export interface Animation { ... }
export interface Container extends Parent { ... }
export interface Path extends Shape { ... }
export interface Rect extends Shape { ... }
export interface Circle extends CircleMethods { ... }
export interface Text extends Shape { ... }
```

**Recipes**

1) **Create and animate a shape**
```js
import { SVG, animate } from "@svgdotjs/svg.js";

const draw = SVG().addTo("#stage").size(400, 300).viewbox(0, 0, 400, 300);
const rect = draw.rect(120, 80, 160, 100).fill("#0099ff");
rect.animate(600, "ease-in-out").move(20, 30).fill("#ff0055");
```

2) **Animate a path with `animate()` chain**
```js
const path = draw.path("M10 10 L 100 100");
path.animate({ duration: 800, ease: "ease-out" }).plot("M10 10 L 200 50");
```

**When to reach for it:** you need to *generate* SVG imperatively (icons, charts, diagrams) and animate the result, rather than animate existing DOM.
**When NOT to reach for it:** you only need to animate existing HTML/SVG — GSAP or Motion is far more capable; and note the v2→v3 package rename (use `@svgdotjs/svg.js`, not `svg.js`).

---

#### 29. Two.js 0.8.24

- **Repo:** https://github.com/jonobr1/two.js
- **Homepage:** https://two.js.org
- **npm:** `two.js` (0.8.24, published 2026‑08‑29)
- **Stars:** 8,672 (last push 2026‑10‑20)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 49.0 kB gzip / 206.5 kB min
- **Install:** `npm i two.js`

**What it does:** A renderer-agnostic 2D drawing API — write your scene once, render to SVG, Canvas, or WebGL.

**Key API (verified from `two.js@0.8.24` shipped `.d.ts` files):**
```ts
export default class Two {
  constructor(options?: { type?: 'svg' | 'canvas' | 'webgl', width?, height?, ... })
  update(): Two
  add(objects: Shape[]): Two
  add(...args: Shape[]): Two
  makeCircle(x?, y?, radius?, resolution?): Circle
  makeRectangle(x?, y?, width?, height?): Rectangle
  makeRoundedRectangle(x?, y?, width?, height?, radius?): RoundedRectangle
  makeLine(x1?, y2?, x2?, y2?): Line
  makePath(...): Path
  makeText(text?, x?, y?): Text
  makeSprite(...): Sprite
  makeStar(x?, y?, radius?, sides?): Star
  makeGroup(children?): Group
}
export class Group extends Shape { add(objects: Shape | Shape[]): Group; add(...args: Shape[]): Group }
export class Vector extends Events { constructor(x?, y?); add(v); x; y }
export class Anchor extends Vector { ... }
export class Events { on(...); off(...); emit(...); bind(...); unbind(...) }
export class Matrix extends Events { ... }
export class Shape extends TwoElement { ... }
```

**Recipes**

1) **Create a WebGL/Canvas scene and animate it**
```js
import Two from "two.js";

const two = new Two({ type: Two.Types.canvas, width: 600, height: 400 }).appendTo(document.body);
const circle = two.makeCircle(0, 0, 60);
circle.fill = "#ff0055";

two.bind("update", () => {
  circle.rotation = two.frame * 0.01;
  circle.x = 300 + Math.cos(two.frame * 0.02) * 200;
}).play();
```

2) **SVG renderer with a group**
```js
const two = new Two({ type: Two.Types.svg, width: 400, height: 300 }).appendTo("#stage");
const group = two.makeGroup();
group.add(two.makeCircle(100, 100, 40).fill("#0099ff"));
```

**When to reach for it:** you want to author 2D scenes in code and be able to switch renderers (SVG for crispness, WebGL for performance) without rewriting.
**When NOT to reach for it:** you need WebGL shaders/3D (use OGL/regl/Three.js); you need a tiny bundle (49 kB gzip is significant); p5.js may serve you better if you want an artistic coding environment.

---

#### 30. p5.js 2.3.4

- **Repo:** https://github.com/processing/p5.js
- **Homepage:** https://p5js.org
- **npm:** `p5` (2.3.4, published 2026‑09‑25)
- **Stars:** 24,149 (last push 2026‑10‑20)
- **License:** **LGPL-2.1** — the only copyleft entry alongside ScrollReveal
- **Frameworks:** vanilla
- **Bundle size:** 333.6 kB gzip / 1,161 kB min
- **Install:** `npm i p5`

**What it does:** A Processing-style creative coding platform for 2D/3D generative art, with a large built-in ecosystem (sound, physics, typography, WebGL).

**Key API (from the official reference, verified via the repo):**
```js
function setup() { createCanvas(400, 400); }
function draw() { background(0); ellipse(mouseX, mouseY, 20, 20); }
createCanvas(w, h) / background(c) / fill(c) / noFill() / stroke(c) / strokeWeight(w)
ellipse(x,y,w,h) / rect(x,y,w,h) / line() / arc() / bezier() / text(str,x,y)
translate(x,y) / rotate(a) / scale(s) / push() / pop()
p5.Vector / p5.Color / p5.Element
createShader(vert, frag) / WEBGL renderer / WEBGPU support (2.x)
```

**Recipes**

1) **Generative art sketch**
```js
import p5 from "p5";

new p5((s) => {
  s.setup = () => s.createCanvas(600, 600);
  s.draw = () => {
    s.background(20);
    s.noStroke();
    for (let i = 0; i < 12; i++) {
      s.fill(255, i * 18, 120, 120);
      s.ellipse(s.width / 2 + s.sin(s.frameCount * 0.02 + i) * 180,
               s.height / 2 + s.cos(s.frameCount * 0.015 + i) * 180, 40, 40);
    }
  };
});
```

2) **Custom shader (2.x supports WebGPU/WGSL alongside GLSL)**
```js
const sketch = (s) => {
  s.setup = () => { s.createCanvas(400, 400, s.WEBGL); s.noStroke(); };
  s.draw = () => { s.background(0); s.shader(myShader); s.rect(0, 0, 400, 400); };
};
```

**When to reach for it:** generative art, data-art, creative-coding teaching, sound-reactive visuals, and 2.x's WebGPU/WGSL support.
**When NOT to reach for it:** production UI animation (333 kB gzip, LGPL, and it owns the whole canvas); typical marketing-site motion.

---

### Tier 7 — 3D / WebGL / WebGPU

---

#### 31. Three.js 0.186.1

- **Repo:** https://github.com/mrdoob/three.js
- **Homepage:** https://threejs.org
- **npm:** `three` (0.186.1, published 2026‑09‑24); `@types/three` (0.186.0)
- **Stars:** 116,650 (last push 2026‑10‑20)
- **License:** MIT
- **Frameworks:** vanilla (React via `@react-three/fiber`)
- **Bundle size:** 184.9 kB gzip / 736.2 kB min (full build; tree-shakable via `three/webgpu` or modular imports)
- **Install:** `npm i three`

**What it does:** The dominant WebGL/WebGPU 3D library. Animation here is via a scene graph + `Clock` + the `AnimationMixer` system, or via Motion's `threeEffect` / React Spring.

**Key API (from the official docs, verified):**
```ts
import * as THREE from "three";
new THREE.Scene() / new THREE.PerspectiveCamera(fov, aspect, near, far) / new THREE.WebGLRenderer({ antialias: true })
new THREE.WebGPURenderer({ forceWebGL: false })          // WebGPU backend (TSL node system)
new THREE.Mesh(geometry, material) / new THREE.BoxGeometry() / new THREE.MeshStandardMaterial({ color })
THREE.Clock / renderer.setAnimationLoop((time) => {...})
new THREE.AnimationMixer(root)  // mixer.clipAction(clip).play()
THREE.MathUtils.lerp / damp
// TSL (Three.js Shading Language) for WGSL/GLSL node graphs
```

**Recipes**

1) **Minimal render loop**
```js
import * as THREE from "three";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101014);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;

const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0055 })
);
scene.add(mesh);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  mesh.rotation.x = clock.getElapsedTime();
  mesh.rotation.y += 0.005;
  renderer.render(scene, camera);
});
```

2) **Bind a Motion value to a Three.js object (`motion/three`)**
```js
import { animate } from "motion";
import { threeEffect } from "motion/three";
import * as THREE from "three";

const mesh = new THREE.Mesh(geo, mat);
const x = motionValue(0);
threeEffect(mesh, { x });                 // or: animate.addEffect(threeEffect)
animate(x, 300, { duration: 1 });
```

3) **WebGPU renderer (TSL node materials)**
```js
import * as THREE from "three/webgpu";
const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
```

**When to reach for it:** you need real 3D: product configurators, games, spatial UI, WebGPU experiments, or a serious shader pipeline.
**When NOT to reach for it:** 2D/canvas work (PixiJS/OGL/p5); simple DOM motion. 185 kB gzip is a real cost.

---

#### 32. PixiJS 8.22.0

- **Repo:** https://github.com/pixijs/pixijs
- **Homepage:** http://pixijs.com/
- **npm:** `pixi.js` (8.22.0, published 2026‑10‑01); `pixi-react` (2,887★, official community package)
- **Stars:** 48,428 (last push 2026‑10‑17)
- **License:** MIT
- **Frameworks:** vanilla; React via `pixi-react`
- **Bundle size:** 264.8 kB gzip / 925.5 kB min
- **Install:** `npm i pixi.js`

**What it does:** A fast 2D WebGL/WebGPU renderer with a scene graph, sprite batching, filters, and a `Ticker` for animation.

**Key API (from the official docs, verified):**
```ts
import { Application, Container, Sprite, Texture, Graphics, Ticker, Assets } from "pixi.js";
const app = new Application();
await app.init({ background: '#1099bb', resizeTo: window, antialias: true });
document.body.appendChild(app.canvas);
const sprite = new Sprite(Texture.from('/img.png'));
app.stage.addChild(sprite);
app.ticker.add((ticker) => { sprite.rotation += 0.01 * ticker.deltaTime; });
app.ticker.add((ticker) => { ... }, null, UPDATE_PRIORITY.HIGH);
```

**Recipes**

1) **Animated sprite**
```js
import { Application, Sprite, Texture } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600, background: "#1099bb" });
document.body.appendChild(app.canvas);

const sprite = new Sprite(Texture.from("/hero.png"));
sprite.anchor.set(0.5);
app.stage.addChild(sprite);

app.ticker.add((ticker) => {
  sprite.rotation += 0.02 * ticker.deltaTime;
});
```

2) **Procedural graphics + filter**
```js
import { Graphics, BlurFilter } from "pixi.js";
const g = new Graphics().circle(200, 200, 120).fill(0xff0055);
g.filters = [new BlurFilter({ strength: 8 })];
app.stage.addChild(g);
```

**When to reach for it:** 2D games, sprite-heavy interactive graphics, particle systems, and high-count object rendering where WebGL batching matters.
**When NOT to reach for it:** DOM/SVG animation (GSAP/Motion); 3D (Three.js). Note PixiJS 8 also supports a WebGPU renderer.

---

#### 33. OGL 1.0.11

- **Repo:** https://github.com/oframe/ogl
- **Homepage:** https://oframe.github.io/ogl/examples
- **npm:** `ogl` (1.0.11, published 2025‑01‑27)
- **Stars:** 4,676 (last push 2025‑04‑13)
- **License:** **Unlicense** (public domain)
- **Frameworks:** vanilla
- **Bundle size:** 34.2 kB gzip / 131.4 kB min
- **Install:** `npm i ogl`

**What it does:** A minimal WebGL library — 4,676★ but only ~34 kB gzip; the "small Three.js".

**Key API (verified from `ogl@1.0.11` `types/core/*.d.ts`):**
```ts
export class Camera extends Transform {
  constructor(gl: OGLRenderingContext, options?: Partial<CameraOptions>)
  perspective(options?: Partial<PerspectiveOptions>): this
  orthographic(options?: Partial<OrthographicOptions>): this
  lookAt(target: Vec3 | Vec3Tuple): this
  updateMatrixWorld(): this
  updateProjectionMatrix(): this
}
export class Renderer { constructor({ canvas, width, height, dpr, alpha, ... }) }
export class Geometry { constructor(gl, attributes) }
export class Program { constructor(gl, { vertex, fragment, uniforms, ... }) }
export class Mesh { constructor(gl, { geometry, program }) }
export class Transform { position: Vec3; rotation: Vec3; scale: Vec3; ... }
```

**Recipes**

1) **Minimal OGL triangle**
```js
import { Renderer, Camera, Transform, Program, Mesh, Triangle } from "ogl";

const renderer = new Renderer({ dpr: 2 });
const camera = new Camera(renderer.gl, { fov: 35 });
camera.position.z = 5;

const geometry = new Triangle(gl);
const program = new Program(renderer.gl, {
  vertex: `attribute vec3 position; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
            void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragment: `precision highp float; void main() { gl_FragColor = vec4(1.0, 0.0, 0.33, 1.0); }`
});
const mesh = new Mesh(renderer.gl, { geometry, program });

function update() {
  camera.perspective({ aspect: renderer.width / renderer.height });
  mesh.rotation.y = (mesh.rotation.y + 0.01) % (Math.PI * 2);
  renderer.render({ scene: mesh, camera });
  requestAnimationFrame(update);
}
update();
```

**Recipe**

2) **Transform hierarchy (Transform extends Object3D-like node)**
```js
const group = new Transform();
group.position.set(0, 0, -5);
group.rotation.x = 0.5;
const mesh = new Mesh(gl, { geometry, program });
group.add(mesh);          // nested transforms
```

**When to reach for it:** you need WebGL but want a 5× smaller bundle than Three.js and don't need Three's ecosystem.
**When NOT to reach for it:** you need the huge Three.js ecosystem, loaders, or postprocessing; or you need a maintained library — OGL's last npm publish was Jan 2025 and last push Apr 2025.

---

#### 34. regl 2.1.1

- **Repo:** https://github.com/regl-project/regl
- **Homepage:** https://regl-project.github.io/regl
- **npm:** `regl` (2.1.1, published 2024‑11‑12)
- **Stars:** 5,587 (last push 2026‑10‑17 — commits are recent)
- **License:** MIT
- **Frameworks:** vanilla
- **Bundle size:** 37.7 kB gzip / 117.4 kB min
- **Install:** `npm i regl`

**What it does:** A *functional* WebGL framework — you describe GPU state declaratively and regl handles buffers, shaders and the draw call.

**Key API (verified from `regl@2.1.1` `dist/regl.d.ts`):**
```ts
export interface Regl {
  readonly attributes: WebGLContextAttributes
  readonly _gl: WebGLRenderingContext
  readonly limits: REGL.Limits
  readonly stats: REGL.Stats
  <Uniforms, Attributes, Props, OwnContext, ParentContext>(drawConfig: REGL.DrawConfig<...>): REGL.DrawCommand<...>
  clear(options: REGL.ClearOptions): void
  read<T extends Uint8Array | Float32Array = Uint8Array>(): T
  read<T extends Uint8Array | Float32Array>(data: T): T
  read<T extends Uint8Array | Float32Array = Uint8Array>(options: REGL.ReadOptions<T>): T
  // plus createBuffer / createTexture / draw / init / destroy
}
```

**Recipes**

1) **Declarative draw command**
```js
const regl = require("regl")({});

const drawTriangle = regl({
  vert: `precision mediump float; attribute vec2 position; void main(){ gl_Position = vec4(position,0,1); }`,
  frag: `precision mediump float; void main(){ gl_FragColor = vec4(1,0,0.33,1); }`,
  attributes: { position: regl.buffer([[0, 1], [-1, -1], [1, -1]]) },
  count: 3
});

function frame(time) {
  regl.poll();
  drawTriangle();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

2) **Uniform-driven animation**
```js
const draw = regl({ vert, frag, uniforms: { t: regl.prop("t") }, attributes: { position: buf } });
function frame(t) { draw({ t: t / 1000 }); requestAnimationFrame(frame); }
```

**When to reach for it:** you want tight control over GPU state and a functional style; you like regl's "everything is a pure function of props" model.
**When NOT to reach for it:** you want scene-graph conveniences (use OGL or Three.js); regl's last npm publish was Nov 2024.

---

#### 35. TypeGPU 0.12.8 (WGSL / WebGPU)

- **Repo:** https://github.com/software-mansion/TypeGPU
- **Homepage:** https://docs.typegpu.com
- **npm:** `typegpu` (0.12.8, published 2026‑10‑16)
- **Stars:** unverified (the GitHub repo stats for this org were not fetched live in this pass — read them from the repo directly before citing)
- **License:** MIT
- **Frameworks:** vanilla (WebGPU); works with any framework
- **Bundle size:** 91.0 kB gzip / 328.6 kB min
- **Install:** `npm i typegpu`

**What it does:** A typed layer over WebGPU/WGSL — you write WGSL-like TypeScript and it compiles to real WGSL, with type-checked bindings between JS values and GPU buffers/uniforms.

**Related WGSL tooling verified on npm:** `wgsl_reflect` (1.6.0, 2026‑09‑05, MIT) — a WGSL parser/reflection library; `@webgpu/types` (0.1.74, BSD-3-Clause) — the official ambient types.

**Key API (from the official docs/README, verified at the package level):**
```ts
import tgpu from "typegpu";
const root = tgpu.init();
const counter = root.createMutable(0);
const shader = tgpu["~unstable"].wgslFn`...`;
const pipeline = root["~unstable"].computePipeline({ ... });
```

**Recipes**

1) **Typed uniform + a compute pipeline**
```ts
import tgpu from "typegpu";

const root = tgpu.init();
const counter = root.createMutable(0);

const compute = tgpu["~unstable"].wgslFn`
  @compute @workgroup_size(64) fn main() {
    // read/write the bound buffer
  }
`;

const pipeline = root["~unstable"].computePipeline({ compute: compute });
```

2) **A typed WGSL function shared between JS and shaders**
```ts
const clamp01 = tgpu["~unstable"].wgslFn`fn clamp01(v: f32) -> f32 { return clamp(v, 0.0, 1.0); }`;
```

**When to reach for it:** you're writing real WebGPU compute/render pipelines and want type safety across the JS↔WGSL boundary.
**When NOT to reach for it:** you just want animated DOM (use Motion), or you want a scene graph (use Three.js's WebGPU renderer).

---

### Tier 8 — Data-viz & interpolation

---

#### 36. D3 7.9.0

- **Repo:** https://github.com/d3/d3
- **Homepage:** https://d3js.org
- **npm:** `d3` (7.9.0, published 2024‑03‑12; repo last push 2026‑05‑28)
- **Stars:** 113,781
- **License:** ISC
- **Frameworks:** vanilla (React via `d3-react`/Observable Plot; Svelte via `d3-hierarchy` adapters)
- **Bundle size:** 92.0 kB gzip / 279.4 kB min (the whole suite; import submodules for less)
- **Install:** `npm i d3` (or individual `d3-*` packages)

**What it does:** Data-driven documents — a declarative join/enter/update/exit model over DOM and SVG, with scales, shapes, axes and transitions.

**Key API (from the official docs, verified):**
```ts
import { select, selectAll, scaleLinear, scaleTime, axisBottom, line, area, pie, arc, extent, max, min } from "d3";
select("body").append("p").text("hi");
d3.selectAll("rect").data(data).join("rect").attr("x", d => x(d.x)).attr("y", d => y(d.y))
d3.transition().duration(750).attr("fill", "red");
d3.axisBottom(xScale); d3.line().x(d=>d.x).y(d=>d.y);
```

**Recipes**

1) **Data join + transition**
```js
import { select, scaleLinear } from "d3";

const x = scaleLinear().domain([0, 100]).range([0, 500]);
const bars = select("#chart").selectAll("rect").data([10, 40, 70]).join("rect")
  .attr("y", 0).attr("height", 100).attr("width", 30).attr("fill", "#0099ff");
bars.transition().duration(600).attr("x", (d, i) => i * 40).attr("height", d => 100 - d);
```

2) **Animate an axis**
```js
const axis = axisBottom(x).ticks(5);
select("#axis").transition().duration(500).call(axis);
```

**When to reach for it:** charts, graphs, and any data-driven visual where the data shape changes — D3's join model is unmatched.
**When NOT to reach for it:** general UI animation — D3's transitions are a small subset of what GSAP/Motion do, and D3's own transition module is tiny but limited.

---

#### 37. d3-interpolate 3.0.1 & d3-transition 3.0.1

- **Repo:** https://github.com/d3/d3-interpolate and https://github.com/d3/d3-transition
- **Homepage:** https://d3js.org/d3-interpolate/ and https://d3js.org/d3-transition/
- **npm:** `d3-interpolate` (3.0.1, published 2021‑06‑05) and `d3-transition` (3.0.1, published 2021‑06‑09)
- **Stars:** 498 (d3-interpolate) / 226 (d3-transition)
- **License:** ISC (both)
- **Frameworks:** vanilla
- **Bundle size:** 6.9 kB gzip / 17.8 kB min (`d3-interpolate`); 1.0 kB gzip / 24.3 kB min (`d3-transition`)
- **Types:** `@types/d3-interpolate` (3.0.4) and `@types/d3-transition` (3.0.9) — D3 does not ship its own types.
- **Install:** `npm i d3-interpolate d3-transition`

**What it does:** `d3-interpolate` is the pure numeric/color/string interpolator set (no DOM, no timers). `d3-transition` adds the `selection.transition()` layer that schedules those interpolators over time on D3 selections.

**Key API (from the official docs, verified):**
```ts
// d3-interpolate
interpolateNumber(a, b)
interpolateRound(a, b)
interpolateString(a, b)
interpolateRgb("red", "blue")
interpolateRgbBasis(["red", "green", "blue"])
interpolateHsl / interpolateLab / interpolateHcl
interpolateArray(a, b, interpolator)
interpolateObject(a, b, interpolator)
interpolateRound
// d3-transition
selection.transition()
  .duration(750).delay(250).ease(d3.easeCubicInOut).attr("fill", "red")
  .on("start", fn).on("end", fn).on("interrupt", fn)
d3.active(node)  // current transition on a node
d3.timer(callback)  // raw frame loop
```

**Recipes**

1) **Interpolate a color numerically**
```js
import { interpolateRgb } from "d3-interpolate";
const color = interpolateRgb("#ff0055", "#0099ff");
console.log(color(0.5));  // mid-point color
```

2) **Interpolate an object of values**
```js
import { interpolateObject } from "d3-interpolate";
const state = interpolateObject({ x: 0, y: 0 }, { x: 300, y: 120 });
requestAnimationFrame(function loop(t) {
  const { x, y } = state(Math.min(1, t / 1000));
  el.style.transform = `translate(${x}px, ${y}px)`;
  if (t < 1000) requestAnimationFrame(loop);
});
```

3) **A transition with a custom interpolator**
```js
import { select } from "d3-selection";
import { interpolate } from "d3-interpolate";
select("#r").transition().duration(800).attr("r", interpolate(0, 100));
```

**Key API (from the official docs, verified):**
```ts
// d3-interpolate
interpolateNumber(a, b); interpolateRound(a, b); interpolateString(a, b)
interpolateRgb("red", "blue"); interpolateRgbBasis(["red","green","blue"])
interpolateHsl(a, b); interpolateLab(a, b); interpolateHcl(a, b)
interpolateArray(a, b, interpolator); interpolateObject(a, b, interpolator)
interpolateRound(a, b)
// d3-transition
selection.transition().duration(750).delay(250).ease(d3.easeCubicInOut)
             .attr("fill", "red").on("start", fn).on("end", fn).on("interrupt", fn)
d3.active(node); d3.timer(callback)
```

**When to reach for it:** you need precise numeric/color interpolation independent of any DOM library; you're writing your own animation engine on top of D3.
**When NOT to reach for it:** you need a complete animation system — use GSAP/Motion/anime.js, which bundle interpolation with scheduling, easing, and DOM handling.

---

### Tier 9 — State, events & auto-animation

---

#### 38. zustand 5.0.15

- **Repo:** https://github.com/pmndrs/zustand
- **Homepage:** https://zustand-demo.pmnd.rs/
- **npm:** `zustand` (5.0.15, published 2026‑08‑13)
- **Stars:** 58,842 (last push 2026‑10‑14)
- **License:** MIT
- **Frameworks:** React, vanilla, Vue, Svelte, Solid
- **Bundle size:** 0.5 kB gzip / 0.9 kB min
- **Install:** `npm i zustand`

**What it does:** A minimal shared state store — the "zustand-free state" pattern where animation state (open/closed, active index, scroll progress) lives outside React so animations can be driven imperatively.

**Key API (from the official docs, verified):**
```ts
import { create } from "zustand";
const useStore = create((set, get) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 })
}));
useStore.subscribe((state, prev) => {/* side effects */});
useStore.getState();
useStore.setState({ count: 5 });
```

**Recipes**

1) **Store driving an animation timeline**
```jsx
import { create } from "zustand";
import { useEffect } from "react";
import gsap from "gsap";

const useUI = create((set) => ({
  drawer: false,
  setDrawer: (drawer) => set({ drawer })
}));

function Drawer() {
  const open = useUI((s) => s.drawer);
  useEffect(() => {
    gsap.to(".drawer", { xPercent: open ? 0 : 100, duration: 0.45, ease: "power3.out" });
  }, [open]);
  return <div className="drawer" />;
}
```

2) **Vanilla store outside React**
```js
const store = create((set) => ({ open: false, setOpen: (open) => set({ open }) }));
store.getState().setOpen(true);
store.subscribe((s) => console.log(s.open));
```

**When to reach for it:** you need a tiny shared store to coordinate animation state without prop drilling or context re-renders.
**When NOT to reach for it:** you don't need shared state, or you already have a store (Redux, Jotai, Valtio).

---

#### 39. mitt 3.0.1

- **Repo:** https://github.com/developit/mitt
- **Homepage:** https://npm.im/mitt
- **npm:** `mitt` (3.0.1, published 2023‑07‑04)
- **Stars:** 11,909 (last push 2024‑08‑14)
- **License:** MIT
- **Frameworks:** vanilla (framework-agnostic)
- **Bundle size:** 0.3 kB gzip / 0.5 kB min
- **Install:** `npm i mitt`

**What it does:** A ~200-byte typed event emitter / pub-sub bus — the lightest way to decouple "something happened" triggers from "animate this" handlers.

**Key API (verified from `mitt@3.0.1` `index.d.ts`):**
```ts
export default function mitt<Events extends Record<EventType, unknown>>(all?: EventHandlerMap<Events>): Emitter<Events>
export interface Emitter<Events> {
  all: EventHandlerMap<Events>
  on(type, handler): void
  off(type, handler): void
  emit(type, event): void
}
export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (type: keyof T, event: T[keyof T]) => void;
```

**Recipes**

1) **Event bus between animation components**
```js
import mitt from "mitt";
const bus = mitt();

bus.on("reveal", ({ id }) => document.getElementById(id)?.classList.add("is-visible"));
bus.emit("reveal", { id: "hero" });
```

2) **Wildcard listener**
```js
bus.on("*", (type, event) => console.log("any event", type, event));
```

**When to reach for it:** you need to decouple animation triggers from their sources with ~500 bytes of code.
**When NOT to reach for it:** you need state, not events (use zustand/jotai); or you need async/await orchestration.

---

#### 40. react-transition-group 4.4.5

- **Repo:** https://github.com/reactjs/react-transition-group
- **Homepage:** https://reactcommunity.org/react-transition-group/
- **npm:** `react-transition-group` (4.4.5, published 2022‑08‑01)
- **Stars:** 10,210 (last push 2026‑03‑05)
- **License:** BSD-3-Clause
- **Frameworks:** React
- **Bundle size:** 4.0 kB gzip / 13.6 kB min
- **Install:** `npm i react-transition-group`

**What it does:** Low-level React primitives for mount/unmount transitions driven by CSS class names or a render-prop state machine — the ancestor of every "AnimatePresence" since.

**Key API (from the official docs, verified):**
```tsx
import { Transition, TransitionGroup, CSSTransition, ReplaceTransition } from "react-transition-group";
<Transition in={show} timeout={300} unmountOnExit
  enter="fade-enter" enterActive="fade-enter-active" enterDone="fade-enter-done"
  exit="fade-exit" exitActive="fade-exit-active" exitDone="fade-exit-done">
  {state => <div className={state}>…</div>}
</Transition>
```

**Recipes**

1) **CSS-class-driven enter/exit**
```jsx
import { Transition } from "react-transition-group";

<Transition in={show} timeout={300} unmountOnExit>
  <div className="modal">Hello</div>
</Transition>
```
```css
.modal-enter { opacity: 0; }
.modal-enter-active { opacity: 1; transition: opacity 300ms; }
.modal-exit { opacity: 1; }
.modal-exit-active { opacity: 0; transition: opacity 300ms; }
```

2) **Render-prop access to the transition state**
```jsx
<Transition in={show} timeout={300} unmountOnExit>
  {(state) => <div className={`box box-${state}`} />}
</Transition>
```

**When to reach for it:** a legacy React codebase with CSS-class-based enter/exit transitions.
**When NOT to reach for it:** new work — Motion's `AnimatePresence` is the modern equivalent with far more capability.

---

#### 41. @theatre/core 0.7.2 (motion design authoring)

- **Repo:** the GitHub repo referenced in the package metadata is `https://github.com/AriaMinaei/theatre`; the `theatrejs/theatre` repo (0★, last push 2023‑03‑02) is a **different, deprecated JS game engine** — a name collision to avoid.
- **Homepage:** https://www.theatrejs.com/
- **npm:** `@theatre/core` (0.7.2, published 2024‑05‑19) and `@theatre/studio` (0.7.2, same date)
- **Stars:** unverified for the animation-tooling repo (the `theatrejs/theatre` repo returns 0★ but is a *different, deprecated* JS game engine — a name collision)
- **License:** `@theatre/core` is **Apache-2.0**; `@theatre/studio` is **AGPL-3.0-only**
- **Frameworks:** vanilla, React (`@theatre/react` is a separate package)
- **Bundle size:** 31.4 kB gzip / 100.1 kB min (`@theatre/core`); 237.5 kB gzip / 776.7 kB min (`@theatre/studio`)
- **Install:** `npm i @theatre/core` (+ `@theatre/studio` in dev only)

**What it does:** A timeline authoring tool — a GUI studio where designers edit animation parameters, exported as JSON that drives code.

**Key API (verified from `@theatre/core@0.7.2` shipped `index.d.ts`):**
```ts
import { getProject, types, val, onChange, createRafDriver, notify } from "@theatre/core";
declare function getProject(id: string, config?: IProjectConfig): IProject;
declare function val<T>(pointer: PointerType<T>): T;
declare function onChange<P>(pointer: P, callback: (value) => void): () => void;
declare function createRafDriver(conf?: { ... }): IRafDriver;
// types namespace: types.number, types.boolean, types.string, types.stringLiteral, types.compound,
//                 types.rgba, types.image, types.file
```

**Recipes**

1) **Authorable props, edited in Studio and exported as JSON**
```ts
import { getProject, types, val, onChange } from "@theatre/core";

const project = getProject("My Project", { state: savedStateJson });
const sheet = project.sheet("Scene");
const obj = sheet.object("Box", { x: types.number(0, { range: [-100, 100] }) });

onChange(obj.props.x, (x) => { el.style.transform = `translateX(${x}px)`; });
await project.ready;
```

2) **Read a pointer's value imperatively**
```ts
import { val } from "@theatre/core";
const x = val(obj.props.x);
```

**License caution:** `@theatre/studio` is **AGPL-3.0-only** — do not bundle it into a proprietary product. `@theatre/core` is Apache-2.0.

**When to reach for it:** you need designers to author motion parameters in a GUI that ships as JSON to code.
**When NOT to reach for it:** you need a maintained release (last npm publish May 2024), or you're shipping proprietary code with the studio bundle (AGPL).

---

### Tier 10 — Legacy, deprecated & unmaintained

These are documented because you will meet them in existing codebases. **Do not start new projects on any of these.**

| Library | npm | Version / date | GitHub | License | Status | Verdict |
|---|---|---|---|---|---|---|
| **TweenMax / TweenLite / GSAP 2** | `gsap` (legacy v2 in `greensock/GSAP` history) | GSAP 2 was distributed from greensock.com, not npm; GSAP 3 replaced it | same repo | — | Superseded | GSAP 3.13+ replaced the whole 2.x line. `TweenMax` was folded into `gsap` core. |
| **Velocity.js** | `velocity-animate` | 1.5.2 (2018‑07‑31) | [julianshapiro/velocity](https://github.com/julianshapiro/velocity) 17,188★, last push 2020‑10‑24 | MIT | **Unmaintained** | MIT, so it is safe to keep, but do not adopt. Use Motion or GSAP. |
| **Popmotion** | `popmotion` | 11.0.5 (2022‑08‑15) | 20,150★, last push 2022‑08‑15 | MIT | **Unmaintained** | Superseded by `motion`. |
| **ScrollReveal** | `scrollreveal` | 4.0.9 (2021‑03‑05) | 22,472★ | **GPL-3.0** | **Unmaintained + copyleft** | Avoid in proprietary products. |
| **AOS** | `aos` | 2.3.4 (2018‑10‑03) | 28,053★ | MIT | **Unmaintained** | Use Motion `inView()` or GSAP ScrollTrigger. |
| **smooth-scrollbar** | `smooth-scrollbar` | 8.8.4 (2023‑06‑05) | 3,341★ | MIT | **Unmaintained** | Use Lenis. |
| **SplitType** | `split-type` | 0.3.4 (2023‑10‑22) | [lukePeavey/SplitType](https://github.com/lukePeavey/SplitType) 733★ | ISC | **Unmaintained** | Use GSAP SplitText (now free) or `animejs` `splitText()`, or `motion`'s splitText. |
| **Motion One** | `@motionone/dom` | 10.18.0 (2024‑06‑02) | [motiondivision/motionone](https://github.com/motiondivision/motionone) 2,863★ — **archived: true** | MIT | **Archived** | The repo is archived (2024‑11‑12). Use `motion`. |
| **`gsap-trial`** | `gsap-trial` | 3.13.0 (2025‑04‑30) | — | GSAP standard | **Deprecated on npm** | *"This package has been deprecated in favor of the standard 'gsap' package."* Also `club.green-sock` npm access is gone. |
| **`@studio-freight/lenis`** | `@studio-freight/lenis` | 1.0.42 (2024‑03‑17) | — | MIT | **Deprecated on npm** | *"renamed to 'lenis'."* |
| **`tween.js` (unscoped)** | `tween.js` | 16.6.0 (2017‑01‑26) | same repo as `@tweenjs/tween.js` | MIT | **Deprecated on npm** | *"This package has moved to @tweenjs/tween.js."* |
| **`framer-motion-3d`** | `framer-motion-3d` | 12.4.13 (2025‑03‑11) | — | MIT | **Deprecated on npm** | *"Package no longer supported."* Use `motion/three`. |
| **`svg.js` (unscoped)** | `svg.js` | 2.7.1 (2018‑11‑30) | same repo | MIT | Superseded | Use `@svgdotjs/svg.js` (3.2.8). |
| **`motion-vue` (npm)** | `motion-vue` | 0.0.1 (2024‑11‑12) | — | MIT | **Abandoned placeholder** (unpackedSize 197 B) | Use `motion-v` (2.8.0) from the `motiondivision/motion-vue` repo. |
| **`@types/gsap`, `@types/animejs`, `@types/tween.js`** | — | — | — | MIT | **Deprecated stubs** | Both gsap and animejs ship their own types; these stubs say so explicitly. |
| **LottieFiles/lottie-react** | `lottie-react` (older major) | 3.5.0 (2022‑12‑07) | 798★ — **archived: true** | MIT | **Archived** | The maintained npm `lottie-react` is the `Gamote/lottie-react` fork (3.1.2). |
| **darkroomengineering/locomotive-scroll** | — | — | 13★ — **archived: true** | MIT | **Archived** | Superseded by `locomotivemtl/locomotive-scroll` v5. |
| **gauss** | `gauss` | 0.2.12 (2014‑04‑22) | 427★ — **archived: true** | NOASSERTION | **Archived / abandoned** | Not an animation library at all (it's a stats/analytics lib). |
| **mo.js** | `mo.js` | 0.0.2 (2015‑03‑06) | dreamerslab/mo | none | **Abandoned** | Not an animation library — an MVC web framework. |
| **just-animate** | `just-animate` | 2.6.2 (2019‑03‑26) | 269★, last push 2019‑03‑26 | none | **Abandoned** | CSS keyframe generator. Not maintained. |
| **anime-easing** | `anime-easing` | **not on npm** | — | — | **Does not exist** | Requested in the brief — verified 404 on the npm registry. Use `d3-ease` (3.0.1, BSD-3-Clause, 607★) or anime.js's own `easings` module. |
| **tweenify** | `tweenify` | **not on npm** | — | — | **Does not exist** | Requested in the brief — verified 404. The closest real packages are `tween.js`/`@tweenjs/tween.js` and `d3-timer`. |
| **@motionone/animations** | `@motionone/animations` | **not on npm** | — | — | **Does not exist** | 404. The real Motion One sub-packages are `@motionone/dom`, `@motionone/utils`, `@motionone/animation`, `@motionone/easing` (all 10.18.0, Jun 2024). |
| **shockingly** | `shockingly` | **not on npm** | — | — | **Does not exist** | 404 on both `shockingly` and `@gsap/shockingly`. |
| **@react-spring/rapier** | `@react-spring/rapier` | **not on npm** | — | — | **Does not exist** | 404. The real physics package is `@react-three/rapier` (2.2.0, 2025‑11‑03). |
| **@react-spring/three-fiber** | `@react-spring/three-fiber` | **not on npm** | — | — | **Does not exist** | 404. The real package is `@react-spring/three` (10.1.2). |

---

## 3. Notable 2024–2026 entrants

| Item | Date | What changed | Verified at |
|---|---|---|---|
| **GSAP 3.13 — everything free** | 2025‑04‑29 | Webflow made GSAP 100% free including *all* Club plugins (SplitText, MorphSVG, DrawSVG, MotionPath, etc.) for commercial use. Club GSAP was wound down; the private npm repo was retired. `gsap-trial` deprecated. | gsap.com/blog/3-13/, gsap.com/pricing/ |
| **GSAP 3.13 — SplitText rewrite** | 2025‑04‑29 | ~50% smaller; added `autoSplit`/`onSplit`/`onRevert`, `mask`, `deepSlice`, `propIndex`, ARIA attributes, `smartWrap`; removed `position:"absolute"`. | gsap.com/blog/3-13/ |
| **GSAP 3.14** | 2025‑12‑08 | MorphSVG `smooth` feature (extra anchor points) + `curveMode`; new demo hub. | gsap.com/blog/3-14/ |
| **GSAP 3.15 — `easeReverse`** | 2026‑04‑13 | New tween property for distinct easing when the playhead reverses; `yoyoEase` deprecated and internally replaced by `easeReverse`. | gsap.com/blog/3-15/ |
| **Motion 12 — the rename** | 2024 | `framer-motion` → `motion`; `motion/react` becomes the React entry. | motion.dev/docs/react-upgrade-guide |
| **Motion 13.5** | 2026‑10‑01 | `<m>` 20% smaller; `useSpring` 10% smaller; springs accept negative bounce (overdamped). | motion.dev/changelog |
| **Motion 14.0** | 2026‑10‑02 | Removed internal APIs; pinned `framer-motion`/`motion-dom`/`motion-utils` deps. | motion.dev/changelog |
| **Motion 14.1** | 2026‑10‑09 | **Vanilla layout animations** via `animateLayout()`. | motion.dev/changelog, motion-dom types |
| **Motion 14.2** | 2026‑10‑13 | Hardware-accelerated independent transforms (`x`, `y`, `scaleX`, …). | motion.dev/changelog |
| **Motion 14.4** | 2026‑10‑18 | JS `drag` gesture; `stagger` gains `from: "edges" | "random"`. | motion.dev/changelog |
| **Motion 3D / vgpu** | 2026 | `motion/three` exports `threeEffect`; `motion/vgpu` exports `vgpuEffect` — both bind MotionValues directly to Three.js/vgpu objects. Currently **Motion+ early access** (paid). | `motion@14.4.0` `dist/three.d.ts`, `dist/vgpu.d.ts` |
| **anime.js v4** | 2024–2026 | Full rewrite: modular/tree-shakeable exports, `svg` module (`createMotionPath`, `createDrawable`, `morphTo`), `text` module (`splitText`, `scrambleText`), `createScope`, `createDraggable`, `createTimer`, `layout` module, `waapi` module. Currently 4.5.0 (2026‑06‑22). | animejs tarball exports map + types |
| **Locomotive Scroll v5** | 2026‑01‑15 | Rebuilt on top of Lenis; 9.4 kB gzipped claim; native scrollbar + keyboard nav + ARIA. | locomotivemtl/locomotive-scroll README |
| **dotLottie 0.8x** | 2026 | Rust→WASM player with themeable color slots, state machines, and separate WebGL and WebGPU renderers (`@lottiefiles/dotlottie-web/webgl`, `/webgpu`). | `@lottiefiles/dotlottie-web@0.81.0` types |
| **Rive 4.37 / canvas 2.45** | 2026‑10 | Active weekly releases; React `useRive`, `useViewModel`, `useStateMachineInput`, `useGlobalViewModelInstance`. | `@rive-app/react-canvas@4.37.0` types |
| **Three.js WebGPU / TSL** | 2026 | `three/webgpu` entry, `WebGPURenderer`, and Three.js Shading Language (TSL) node materials; `@react-three/tsl` (10.0.0-alpha.6) provides R3F TSL hooks. | three 0.186.1 tarball; npm search |
| **TypeGPU / WGSL** | 2026‑10 | Typed TS→WGSL compilation layer; `wgsl_reflect` (1.6.0) for WGSL parsing; `@webgpu/types` (0.1.74) ambient types. | npm registry + bundlephobia |
| **Motion for Vue** | 2026‑10 | `motion-v` 2.8.0 published from `motiondivision/motion-vue`; official Vue port. | npm registry + repo README |
| **@react-three/fiber 9.x** | 2026‑10 | R3F 9.8.2 (note: the `react-three-fiber` unscoped package is 6.0.13 from 2021 — use `@react-three/fiber`). | npm registry |

---

## 4. Commercial / paid tiers

| Product | What is paid | Price model | Free tier |
|---|---|---|---|
| **GSAP** | **Nothing.** Since 3.13 (2025‑04‑29) the whole library including all plugins is free for all uses including commercial. | Was: Club GSAP annual subscription. Now: free, supported by Webflow. | Full library, free. |
| **Motion / Motion+** | **Motion+** is a one-time-fee lifetime membership: 160+ premium examples, Motion UI features (Cursor, Ticker, Gallery), Motion Studio for VS Code, early access. **3D integrations (`motion/three`, `motion/vgpu`) are Motion+ early access.** | One-time fee, lifetime updates. | The core `motion`, `motion/react`, `motion/mini` libraries are fully MIT and free. |
| **Rive** | The **editor** (Rive.app) is a commercial SaaS with a free tier. The **web runtimes are MIT/open source**. | SaaS subscription for the editor. | Editor free tier + MIT runtimes. |
| **LottieFiles** | The platform (editor, marketplace, optimization) is a paid SaaS. The **players (`lottie-web`, `dotlottie-web`) are MIT**. | SaaS subscription. | Free tier + MIT players. |
| **Remotion** | License is **not** free for company use — the npm package's license field points to a proprietary `LICENSE.md` with company-size tiers. | Per-company tier pricing. | Free for individuals and small companies; paid for larger companies. |
| **@theatre/studio** | AGPL-3.0-only — not commercial-friendly to bundle. | Free (copyleft). | Free, but AGPL obligations. |
| **p5.js** | LGPL-2.1 — free, but copyleft obligations on distribution. | Free. | Free. |

---

## 5. Deprecated & unmaintained — summary

**Deprecated by their authors (npm `deprecated` field):** `gsap-trial`, `@studio-freight/lenis`, `tween.js` (unscoped), `framer-motion-3d`, `@types/gsap`, `@types/animejs`, `@types/tween.js`.

**Archived on GitHub (`archived: true`):** `motiondivision/motionone` (Motion One), `LottieFiles/lottie-react`, `darkroomengineering/locomotive-scroll`, `wayoutmind/gauss`.

**Unmaintained by release date (no release in years):** `velocity-animate` (2018), `popmotion` (2022), `scrollreveal` (2021), `aos` (2018), `smooth-scrollbar` (2023), `split-type` (2023), `just-animate` (2019), `mo.js` (2015), `theatrejs/theatre` (2023, and it's a different project).

**Packages in the brief that do not exist on npm** (verified 404 from `registry.npmjs.org`): `tweenify`, `anime-easing`, `shockingly`, `@gsap/shockingly`, `@motionone/animations`, `@react-spring/rapier`, `@react-spring/three-fiber`, `@lottiefiles/dotlottie-player`, `@lottiefiles/dotlottie-canvas`, `@dotlottie/react`, `@formkit/auto-animate-vue`, `@formkit/auto-animate-react`, `@formkit/auto-animate-solid`, `@formkit/auto-animate-svelte`, `scroll-timeline`, `view-timeline`, `motion-canvas`, `ogl-shader`, `gsap-motion-path-plugin`, `animejs-v3`.

**Real packages that fill those gaps:** `d3-ease` (easing), `@tweenjs/tween.js` (tweening), `motion/three` (3D), `@react-three/rapier` (physics), `@lottiefiles/dotlottie-vue` / `-svelte` (other frameworks), `@formkit/auto-animate` with its `react`/`vue`/`preact` sub-entries.

---

## 6. Decision matrix

| If you need… | Use | Why not the alternative |
|---|---|---|
| Scroll-scrubbed storytelling, pinning, SVG morphing | **GSAP 3.15** + ScrollTrigger/Flip/SplitText/MotionPath | Motion's scroll API is simpler but not equivalent in power |
| Declarative React animation + layout physics | **Motion 14** (`motion/react`) | GSAP has no React lifecycle story; react-spring lacks layout animations |
| Spring physics in React, no re-renders | **react-spring 10** | Motion is more feature-complete; pick react-spring for `animated.*` ergonomics |
| One dependency-free engine for DOM + SVG + text, tree-shakeable | **anime.js v4.5** | GSAP is heavier; Motion's mini build is smaller but less capable |
| Smallest possible animation (≈3 kB) | **Motion mini** (`motion/mini`, 3.2 kB) or **`@formkit/auto-animate`** (3.2 kB) | |
| "Animate whatever changed" in one call | **@formkit/auto-animate** | |
| After Effects animation playback | **dotLottie** (smallest, themable) or **lottie-web** (most compatible) | |
| Interactive state-machine graphics | **Rive** | Lottie has no state machine |
| Smooth scrolling (with any animation lib) | **Lenis** | Locomotive v5 is heavier; smooth-scrollbar is abandoned |
| Page transitions (multi-page site) | **Barba.js** | |
| Touch carousel, maximal features | **Swiper 14** | |
| Touch carousel, minimal | **Embla 8** | |
| Mobile bottom sheet | **Vaul** | |
| Raw gestures (vanilla React) | **use-gesture** | |
| Reorderable lists | **SortableJS** (+ auto-animate/Motion for smooth reflow) | |
| Charts / data-driven visuals | **D3 7.9** | |
| 3D | **Three.js 0.186** (+ R3F/drei for React) | OGL/regl only if bundle size dominates |
| 2D sprite scenes | **PixiJS 8** | |
| Generative art | **p5.js 2.3** | |
| Authorable motion from a designer GUI | **@theatre/core** (stale) or **Motion Studio** (paid) | |

**Cross-cutting rules of thumb**
- Don't ship two animation libraries. Pick the one whose *model* matches your app: timeline (GSAP) vs declarative (Motion) vs physics (react-spring).
- If you use GSAP, use `gsap.context()` / `useGSAP()` so animations are cleaned up on unmount in React.
- Respect `prefers-reduced-motion` — GSAP's `gsap.matchMedia()`, Motion's `<MotionConfig reducedMotion="user">`, and Lenis's `prefers-reduced-motion` handling all support it.
- Watch out for the license landmines: `scrollreveal` (GPL-3.0), `p5.js` (LGPL-2.1), `@theatre/studio` (AGPL-3.0-only), `remotion` (proprietary company tiers). Everything else listed here is MIT, ISC, BSD, Unlicense, or (for GSAP) a free proprietary "no charge" license.

---

## 7. Sources & raw data

**Live API calls made during this compilation (2026‑10‑20, 13:42–13:58 EEST):**
- `https://registry.npmjs.org/<pkg>` for 91 + 50 + targeted packages — `dist-tags.latest`, `time`, `versions[latest].license`, `repository`, `dist.unpackedSize`, `deprecated`
- `https://api.github.com/repos/<owner>/<repo>` via `gh` CLI (authenticated) for ~110 repos — `stargazers_count`, `license.spdx_id`, `archived`, `pushed_at`, `homepage`, `description`
- `https://api.github.com/repos/<owner>/<repo>/releases/latest` for 37 repos — last release tag + publish date
- `https://api.github.com/search/repositories?q=...` to resolve renamed/moved repos (`nolimits4web/swiper`, `dolphin-wood/smooth-scrollbar`, `regl-project/regl`, `Gamote/lottie-react`, `locomotivemtl/locomotive-scroll`, `wayoutmind/gauss`, `micku7zu/vanilla-tilt.js`, `motiondivision/motion-vue`, `greensock/react`)
- `https://bundlephobia.com/api/size?package=<pkg>` for 60 packages — gzip/minified size of the published entry
- npm tarballs unpacked for `gsap`, `motion`, `framer-motion`, `motion-dom`, `motion-utils`, `animejs`, `lenis`, `embla-carousel*`, `vaul`, `use-gesture`, `split-type`, `two.js`, `svg.js`, `@rive-app/*`, `@lottiefiles/*`, `lottie-react`, `@tweenjs/tween.js`, `popmotion`, `@motionone/dom`, `@formkit/auto-animate`, `swiper`, `d3-*`, `ogl`, `regl`, `@barba/core`, `locomotive-scroll`, `mitt`, `zustand`, `react-spring/*` — to read the real exported API and signatures
- `https://gsap.com/blog/3-13/`, `/3-14/`, `/3-15/`, `/pricing/` — GSAP free-tier and release facts
- `https://motion.dev/changelog`, `/docs/animate`, `/docs/react-upgrade-guide` — Motion release history and `animate()` API
- `https://raw.githubusercontent.com/wiki/juliangarnier/anime/Migrating-from-v3-to-v4.md` — anime.js v4 migration
- GitHub READMEs for `nolimits4web/swiper`, `davidjerleke/embla-carousel`, `barbajs/barba`, `locomotivemtl/locomotive-scroll`, `jlmakes/scrollreveal`, `SortableJS/Sortable`, `motiondivision/motion-vue`

**Raw JSON snapshots saved alongside this document:**
- `npm_data.json` — npm registry responses
- `github_data.json` — GitHub API responses
- `bundle_data.json` — bundlephobia responses
- `api_out.txt`, `api2.txt`, `api8.txt` — extracted `.d.ts` API surfaces

**Known unverified items** (explicitly not guessed): `typegpu` GitHub star count; `@theatre/core`'s true upstream repo star count; the exact gzip size of `@svgdotjs/svg.js` 3.2.8; the `motion-v` gzip figure beyond the bundlephobia root entry; the npm scope/status of `lottie-react` v2 vs the `Gamote` fork's exact release cadence.
