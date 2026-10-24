# 🎬 Animate Anything

<div align="center">

[![Awesome](https://awesome.re/badge-flat2.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Last Updated](https://img.shields.io/github/last-commit/wjlgatech/animate-anything?style=flat-square&label=last%20updated)](https://github.com/wjlgatech/animate-anything/commits/main)
[![Stars](https://img.shields.io/github/stars/wjlgatech/animate-anything?style=flat-square)](https://github.com/wjlgatech/animate-anything)
[![Pages](https://img.shields.io/badge/interactive%20map-live-8b5cf6?style=flat-square)](https://wjlgatech.github.io/animate-anything/)

**The comprehensive, ranked, living map of animation — from a CSS keyframe to an AI-authored launch video.**

*One place to **learn** motion, hand your **agents** a machine-readable registry to build with, and a **community** that keeps it fresh.*

[Learn](#-learn--the-map) • [Ranked Tables](#-the-registry-ranked) • [Tooling for Agents](#-tooling--for-agents) • [Roadmaps](#-learning-roadmaps) • [Community](#-community--contribute) • [Interactive Map](https://wjlgatech.github.io/animate-anything/)

</div>

---

> **⚡ Three folds, one repo** (modeled on [`rsi`](https://github.com/wjlgatech/awesome-auto-ai-research) and [`FDE-os`](https://github.com/wjlgatech/FDE-os)):
> 1. **📚 Learn** — a taxonomy of *what animates what*, every tool ranked (not just listed), with beginner→pro roadmaps and "when to reach for which."
> 2. **🤖 Tooling for agents** — the whole list compiles to a machine-readable [`knowledge/graph.json`](knowledge/graph.json) + [`llms.txt`](llms.txt), so an agent can *query* the landscape and pick the right library for a task. Pairs with [`anyagent skills`](#-tooling--for-agents).
> 3. **🌍 Community** — Awesome-list convention, PRs welcome, and a **weekly freshness check** (GitHub Action) that probes every link and files an issue when one dies. Editing the README is all a contributor ever does — the graph and map recompile themselves.

---

## 🕸️ Living Knowledge Graph

This list **compiles**. Every tool below is a node in a typed graph (`part_of` a category, `has_code` its repo), so you can *explore* it, not just scroll it:

- **🗺️ [Explore the interactive map](https://wjlgatech.github.io/animate-anything/)** — force-layout graph with search + type filters + click-to-inspect (self-contained HTML; also open [`docs/index.html`](docs/index.html) locally).
- **🧩 [`knowledge/graph.json`](knowledge/graph.json)** — the full machine-readable graph for your own agents, RAG pipelines, or analysis.
- **🤖 [`llms.txt`](llms.txt)** — a flat, agent-friendly index of every tool + its one-line use-case + license + observed agentic surface.
- **🛠️ [`knowledge/agentic.json`](knowledge/agentic.json)** — which 🥇 repos *actually ship* agent tooling (AGENTS.md · CLAUDE.md · skills · Claude/Codex/Cursor plugins · MCP config · llms.txt), probed weekly from the repos themselves ([workflow](.github/workflows/agentic.yml)) — evidence, never reputation.

**It stays alive automatically.** On every README merge, [a GitHub Action](.github/workflows/knowledge.yml) recompiles the graph + map + `llms.txt` (all three are compiled — only the README is hand-edited); [a weekly freshness check](.github/workflows/freshness.yml) probes every link and opens an issue if any die; and [`make check`](Makefile) gates every PR (linter goldens + graph integrity).

---

## 🧭 Learn — the map

Animation isn't one thing — it's a stack of *materials* and the *runtimes* that move them. This taxonomy is the mental model the whole registry hangs on:

| Layer | What moves | Reach for it when… | Examples |
|---|---|---|---|
| **CSS / declarative** | DOM elements via keyframes/transitions | micro-interactions, cheap & offline, no JS | Animate.css, Tailwind, hand-rolled CSS |
| **JS timeline / tween** | anything, on a scriptable timeline | orchestrated sequences, scroll-driven, SVG | GSAP, Motion, Anime.js |
| **UI-framework motion** | React/Vue component state | app UIs, gestures, layout transitions | Motion (Framer), React Spring, AutoAnimate |
| **Vector runtime** | designer-authored vector art | icon/illustration motion shipped from design tools | Lottie, Rive |
| **3D / WebGL / shader** | meshes, particles, fragment shaders | immersive scenes, generative/ambient motion | Three.js, R3F, PixiJS, Babylon.js |
| **Video-as-code** | a composition rendered to frames | reproducible MP4s, launch videos, data-driven video | Remotion, Motion Canvas, HeyGen Hyperframes |
| **AI / agent-authored** | a prompt or a reference → a composition | agents generating motion from intent | Hyperframes, the `/watch` workflow, generative video |

**The craft that spans all layers** (from Emil Kowalski's animation review + Apple's fluid-interface talks): enter animations **ease-out, never ease-in**; UI transitions **under ~300ms**, a button press **100–160ms**; **no animation on high-frequency actions** — spend motion where it's rare and meaningful; and always honor **`prefers-reduced-motion`**. A tool doesn't make motion good; these rules do.

---

## 📊 How we rank

Every tool carries a **tier** (🥇 best-in-class · 🥈 solid · 🥉 niche/fading) computed from six criteria — so the list is *opinionated*, not a flat dump:

| Criterion | Why it matters |
|---|---|
| **Adoption** | stars + npm/CDN usage — social proof it's battle-tested |
| **Performance** | jank-free at 60fps; GPU-friendly; bundle weight |
| **Learning curve** | time-to-first-animation vs ceiling |
| **License openness** | MIT/Apache (build freely) vs commercial/gated |
| **Agent-authorability** | can an LLM write it reliably from a prompt? (declarative, well-documented, deterministic) |
| **Maintenance health** | recent commits, releases, issue responsiveness |

Popularity is *one* input, never the whole verdict — a well-maintained MIT library an agent can author beats a flashier gated one for this repo's purpose.

---

## 🗂️ The Registry (ranked)

<!-- TABLES:START — each row is a node in the knowledge graph. Tier: 🥇 best-in-class · 🥈 solid · 🥉 niche/fading. Edit a row → the graph + map recompile on merge. -->

### 🌊 Web / JS animation — timeline, tween & UI motion

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [GSAP](https://github.com/greensock/GSAP) | 🥇 | Free (GSAP Standard License) | ~26k | The pro timeline engine — scroll, SVG, precise sequencing. **Now 100% free incl. all plugins (2025).** Reach for orchestrated, exact motion. |
| [Motion](https://github.com/motiondivision/motion) | 🥇 | MIT (core; Motion+ paid) | ~33k | Formerly **Framer Motion** — spring/layout/gesture animation for React & JS. The default for app UIs. |
| [Anime.js](https://github.com/juliangarnier/anime) | 🥇 | MIT | ~71k | Lightweight, expressive timeline for DOM/SVG/JS objects (v4, 2025). |
| [Lenis](https://github.com/darkroomengineering/lenis) | 🥇 | MIT | ~14k | Smooth-scroll foundation that scroll-driven motion is built on. |
| [React Spring](https://github.com/pmndrs/react-spring) | 🥈 | MIT | ~29k | Spring-physics animation for React. |
| [AutoAnimate](https://github.com/formkit/auto-animate) | 🥈 | MIT | ~14k | One line → automatic add/remove/move transitions. Zero-config delight. |
| [Tween.js](https://github.com/tweenjs/tween.js) | 🥈 | MIT | ~10k | Minimal tweening primitive, often paired with Three.js. |
| [Motion One](https://github.com/motiondivision/motionone) | 🥉 | MIT | ~3k | Tiny (~2kb) WAAPI-based animator. |
| [Theatre.js](https://github.com/theatre-js/theatre) | 🥉 | Apache-2.0 / AGPL studio | ~12k | Visual sequence editor for JS & 3D. |
| [Mo.js](https://github.com/mojs/mojs) | 🥉 | MIT | ~19k | Motion-graphics toolkit for the web. |
| [Popmotion](https://github.com/Popmotion/popmotion) | 🥉 fading | MIT | ~20k | Being absorbed into Motion — prefer Motion. |
| [Velocity.js](https://github.com/julianshapiro/velocity) | 🥉 dead | MIT | ~17k | Historic jQuery-era animator, unmaintained since 2020. |

### 🎨 CSS / utility & component motion

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [Sonner](https://github.com/emilkowalski/sonner) | 🥇 | MIT | ~13k | Emil Kowalski's toast — the craft reference (13M+ weekly npm). |
| [Vaul](https://github.com/emilkowalski/vaul) | 🥇 | MIT | ~8.5k | Emil Kowalski's drawer — physics-y, accessible. |
| [Magic UI](https://github.com/magicuidesign/magicui) | 🥇 | MIT (+ Pro) | ~21k | Animated React/Tailwind components, shadcn-style registry. |
| [Aceternity UI](https://ui.aceternity.com) | 🥇 | MIT free + Pro | — | Copy-paste flashy animated sections. |
| [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | 🥈 rising | MIT | ~780 | Tailwind v4 animation utilities — the current shadcn default. |
| [Animate.css](https://github.com/animate-css/animate.css) | 🥈 | Hippocratic 2.1 (ethical, not OSI) | ~83k | Drop-in CSS keyframe classes. Note the non-standard license. |
| [animations.dev](https://animations.dev) | 📚 resource | Commercial course | — | Emil Kowalski's animation course — the craft curriculum. |
| [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) | 🥉 | MIT | ~3k | v3-era; superseded by tw-animate-css. |
| [AOS](https://github.com/michalsnik/aos) | 🥉 fading | MIT | ~28k | Animate-on-scroll, low maintenance. |

### 🪁 Lottie / vector runtimes — designer-authored motion

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [Lottie (lottie-web)](https://github.com/airbnb/lottie-web) | 🥇 | MIT | ~32k | Play After-Effects vector animations as JSON on the web. The foundation (aging). |
| [Rive](https://github.com/rive-app/rive-runtime) | 🥇 | MIT runtimes (editor SaaS) | ~1.1k | Interactive, state-machine vector animation — small, real-time, input-driven. |
| [dotLottie](https://github.com/LottieFiles/dotlottie-web) | 🥇 | MIT | ~800 | The modern Lottie player/format (compressed, themable). |
| [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) | 🥇 | Apache-2.0 | ~17k | Lottie for React Native. |
| [LottieFiles](https://lottiefiles.com) | 🥇 platform | Proprietary SaaS (free tier) | — | The vector-animation ecosystem — marketplace, tools, players, MCP. |
| [SVGator](https://svgator.com) | 🥈 | Proprietary SaaS (free tier) | — | No-code SVG animation editor. |

### 🌐 3D / WebGL / shaders — immersive & generative motion

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [Three.js](https://github.com/mrdoob/three.js) | 🥇 | MIT | ~114k | The WebGL 3D standard. |
| [PixiJS](https://github.com/pixijs/pixijs) | 🥇 | MIT | ~48k | Fast 2D WebGL renderer for effects & particles. |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | 🥇 | MIT | ~31k | Three.js as declarative React components. |
| [Babylon.js](https://github.com/BabylonJS/Babylon.js) | 🥇 | Apache-2.0 | ~26k | Full-featured 3D engine (games, XR). |
| [drei](https://github.com/pmndrs/drei) | 🥈 | MIT | ~9.7k | R3F helpers — the batteries for react-three-fiber. |
| [PlayCanvas](https://github.com/playcanvas/engine) | 🥈 | MIT (editor freemium) | ~16k | 3D engine with a cloud editor. |
| [p5.js](https://github.com/processing/p5.js) | 🥈 | LGPL-2.1 | ~24k | Creative-coding for generative/ambient motion. |
| [Spline](https://spline.design) | 🥇 no-code | Proprietary SaaS (free tier) | — | No-code 3D design & animation, exportable to web. |
| [OGL](https://github.com/oframe/ogl) | 🥉 | Unlicense | ~4.6k | Minimal WebGL when Three.js is too heavy. |
| [Shadertoy](https://www.shadertoy.com) | 📚 resource | Platform (per-shader) | — | The fragment-shader learning & sharing hub (not a dependency). |
| [Zdog](https://github.com/metafizzy/zdog) | 🥉 fading | MIT | ~10.6k | Pseudo-3D round vector illustrations (dormant). |

### 🎞️ Video-as-code — a composition rendered to frames

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [HeyGen Hyperframes](https://github.com/heygen-com/hyperframes) | 🥇 | Apache-2.0 (no render fees) | ~34k | **Agent-native**: author HTML/CSS/GSAP, render MP4 locally (headless-Chrome+FFmpeg), deterministic. The center of "video as code for agents." |
| [Remotion](https://github.com/remotion-dev/remotion) | 🥇 | Source-available (free ≤3 ppl; paid 4+) | ~53k | Make videos in React — data-driven, programmatic MP4. Note the tiered commercial license. |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) | 🥈 | MIT core (org exploring GPL) | ~19k | Code-driven vector animation with a visual editor — great for explainers. |
| [Revideo](https://github.com/redotvideo/revideo) | 🥈 | MIT | ~3.9k | Programmatic video built on Motion Canvas, API-first. |
| [Editly](https://github.com/mifi/editly) | 🥉 | MIT | ~5.4k | Declarative FFmpeg video editing from a spec. |

### 🤖 AI / agent-authored animation — a prompt or reference → a composition

| Tool | Tier | License | Stars | Description |
|---|---|---|---|---|
| [HeyGen Hyperframes](https://github.com/heygen-com/hyperframes) | 🥇 | Apache-2.0 | ~34k | "Write HTML. Render video. Built for agents." Ships `AGENTS.md` + loadable skills + a `/hyperframes` router. |
| [Manim (Community)](https://github.com/ManimCommunity/manim) | 🥇 | MIT | ~39k | The most LLM-authorable animator — Python `Scene` classes, huge training footprint. Ideal for agent-generated explainers. |
| [Remotion Agent Skills](https://github.com/remotion-dev/remotion) | 🥇 | Source-available | ~53k | Official Agent Skills (Jan 2026) for Claude Code/Cursor — agents author React video. |
| [Claude Design / Artifacts](https://claude.ai) | 🥈 product | Proprietary product | — | The mainstream path for an LLM to author self-contained animated HTML/CSS/JS. |
| [Lottie Creator MCP](https://lottiefiles.com) | 🌱 emerging | Proprietary | — | LottieFiles' MCP — the most production-credible agent path to vector animation. |
| [css-animation-skill](https://github.com/neonwatty/css-animation-skill) | 🌱 emerging | MIT | small | A Claude Code skill that teaches an agent CSS-animation craft. |
| [claude-video `/watch`](https://github.com/bradautomates/claude-video) | 🔗 adjacent | MIT | ~7.5k | Lets an agent **watch** a reference video (yt-dlp + FFmpeg + Whisper). *Comprehension, not authoring* — the "study a reference" half of the loop. |

> **Not on this list, on purpose:** *"Fable 5 galleries"* — **Fable 5 is Anthropic's frontier LLM** (the authoring *engine*), not an animation product; there is no official gallery.

### 🎥 Commercial generative video (proprietary SaaS)

| Tool | Tier | Pricing (mid-2026) | Description |
|---|---|---|---|
| [Runway](https://runwayml.com) | 🥇 | Free / $15 / $35 / $95 · API ~$0.05–0.40/s | Production text/image→video suite (Gen-4). |
| [OpenAI Sora 2](https://openai.com/sora) | 🥇 | ChatGPT Plus $20 / Pro $200 | Frontier-quality generative video. |
| [Google Veo 3.1](https://deepmind.google/models/veo) | 🥇 | API $0.15–0.75/s | 4K generation with lip-sync. |
| [Kling 3.0](https://klingai.com) | 🥇 | from ~$6/mo | Best price/quality generative video. |
| [HeyGen](https://heygen.com) | 🥇 | Free / $29 / $99 / $149 | AI-avatar spokesperson video. |
| [Synthesia](https://synthesia.io) | 🥇 | Free / $29 / $89 / Ent | Enterprise avatar video. |
| [Pika](https://pika.art) | 🥈 | from ~$8/mo | Fast, playful generative video. |
| [Luma Dream Machine](https://lumalabs.ai) | 🥈 | Free / ~$30 / ~$90 | Text/image→video. |
| [Jitter](https://jitter.video) | 🥈 | Free / ~$16/mo | Motion-design tool (not AI-gen) — quick branded animation. |
| [Adobe After Effects](https://www.adobe.com/products/aftereffects.html) | 🥇 | $22.99/mo | The professional motion-graphics incumbent. |

<!-- TABLES:END -->

---

## 🤖 Tooling — for agents

### ⭐ `/animate-anything` — a concept → a 3Blue1Brown-style explainer

The flagship tool: point it at an idea, get back a **real ManimCommunity scene** authored in Grant
Sanderson's **reverse-engineered style**, style-gated, and rendered to MP4 — **locally, no cloud video
API**. Built by reverse-engineering his toolchain (Manim) and production style (palette, choreography,
pacing) from `3b1b/videos` + `manimlib`. See [`skills/animate-anything/`](skills/animate-anything/SKILL.md).

```bash
pip install manim                                             # + ffmpeg (LaTeX only for MathTex)
python3 scripts/animate.py scaffold "eigenvectors" --out scene.py   # concept → 5-beat 3b1b skeleton
python3 scripts/animate.py lint scene.py --gate 80                  # computed 0–100 style score (CI-gateable)
manim -qh scene.py EigenvectorsScene                               # render locally
```

It encodes a **style contract** the linter enforces — the `#333333` warm-grey canvas (never pure
black), role-based palette (blue=given · yellow=focus · red=tension · green=resolved), *morph-to-show-
equivalence* (`Transform`, never `FadeOut→FadeIn`), and play→wait pacing. Golden reference (renders
without LaTeX, scores 100/100): [`examples/odd_squares.py`](examples/odd_squares.py). **Emit the
composition, render locally** — same principle as the video-as-code row above.

### The rest of the substrate

This repo is built to be **consumed by agents**, not just read by humans:

- **`knowledge/graph.json`** — point a RAG pipeline or agent at it to answer *"what should I use to animate X?"* grounded in real nodes.
- **`llms.txt`** — a flat, token-cheap index (name · use-case · license · repo) for quick tool selection.
- **Catalog it into `anyagent`:** several entries here (Hyperframes, `/watch`, Emil Kowalski's pack) are installable **skill libraries** — `anyagent skills sync <clone> --source … && anyagent skills find "animate a hero section"` surfaces the right one, **trust-graded** (safety class + license + relevance), never a popularity guess.
- **Emit the composition, not the render** — the pattern this whole field rewards: author animation as *self-contained web code* (HTML/CSS/GSAP), then render to MP4 **locally** (Hyperframes / headless-Chrome+FFmpeg) only if you need a shareable file. No paid cloud video API required for launch-video-grade motion.

---

## 🗺️ Learning Roadmaps

**Beginner (0–2 weeks) — ship your first delightful motion**
1. Learn the four CSS primitives: `transition`, `@keyframes`, `transform`, `animation-timing-function`. Build a hover + a page-load fade. *(Rule: ease-out on enter.)*
2. Add **Motion** (framer-motion) to a React component — animate mount/unmount + a layout shift.
3. Read Emil Kowalski's animation review; refactor your motion to obey the durations.
4. Drop in a **Lottie** file from LottieFiles for an icon.

**Intermediate — orchestration & scroll**
1. **GSAP** + ScrollTrigger: build a scroll-driven sequence with a pinned section.
2. **Rive**: author an interactive state-machine graphic and wire it to input.
3. Ship one thing that respects `prefers-reduced-motion` end-to-end.

**Advanced — 3D & video-as-code**
1. **React Three Fiber**: an ambient WebGL hero with a fragment shader.
2. **Remotion** or **Hyperframes**: render a data-driven MP4 from a React/HTML composition.
3. Wire an **agent** (`/watch` → a template → Claude Design/Code) to author a launch reel from a reference.

---

## 🌍 Community — Contribute

This is a **living, community list** — the best entries come from people who ship motion.

- **Add or re-rank a tool:** edit the relevant table in `README.md` (name, repo/homepage, license, stars, use-case, tier) and open a PR. That's it — the graph + map recompile on merge.
- **Fix a dead link:** the weekly freshness Action files an issue when links die; PRs that fix them are gold.
- **Add lineage:** curator "builds-on / inspired-by" edges live in [`knowledge/enrichments.json`](knowledge/enrichments.json) (they survive regeneration — edit that, not `graph.json`).
- **Rules:** one row per tool; prefer primary sources (repo/homepage); keep the one-liner to *what it is + when to use it*. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 📜 Citation

```bibtex
@misc{animate-anything,
  title  = {Animate Anything: a ranked, living map of animation tooling},
  author = {Wu, Paul (wjlgatech) and contributors},
  year   = {2026},
  url    = {https://github.com/wjlgatech/animate-anything}
}
```

## 📄 License

Content (the curated lists, docs) — [CC BY 4.0](LICENSE). Code (`scripts/`) — MIT. Each listed tool keeps its own license (shown in its row).
