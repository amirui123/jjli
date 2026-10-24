# Documentation index

Everything here was **scraped and verified live** on 2026-10-20. No star count,
version, license, or install count in these documents came from memory.

---

## The catalog

**247 entries across 14 files.** One line each: name, link, description, live
facts.

| File | Entries | What it covers |
|---|---|---|
| **[links/animation-core.md](links/animation-core.md)** | 29 | GSAP, Motion, anime.js, react-spring, Theatre, Svelte/Vue/Solid transitions |
| **[links/scroll-and-reveal.md](links/scroll-and-reveal.md)** | 5 | Lenis, AOS, ScrollReveal, Locomotive, smooth-scrollbar |
| **[links/carousel-and-ui.md](links/carousel-and-ui.md)** | 3 | Embla, Swiper, Vaul |
| **[links/gesture-and-drag.md](links/gesture-and-drag.md)** | 3 | SortableJS, Auto-Animate, use-gesture |
| **[links/lottie-and-rive.md](links/lottie-and-rive.md)** | 5 | Lottie, dotLottie, Rive |
| **[links/page-transitions.md](links/page-transitions.md)** | 3 | Barba.js, Astro View Transitions, polyfill |
| **[links/creative-and-3d.md](links/creative-and-3d.md)** | 16 | Three.js, R3F, Drei, PixiJS, OGL, regl, TypeGPU, Zdog, Rough.js |
| **[links/data-and-visualization.md](links/data-and-visualization.md)** | 4 | D3, ECharts |
| **[links/text-and-svg.md](links/text-and-svg.md)** | 3 | SplitType, SVG drawing, svgedit |
| **[links/code-to-video.md](links/code-to-video.md)** | 11 | Remotion, Revideo, Motion Canvas, Manim, Playwright, Puppeteer, ffmpeg.wasm, Mediabunny |
| **[links/design-skills.md](links/design-skills.md)** | 41 | Agent skills that change design output quality |
| **[links/ux-craft-2026.md](links/ux-craft-2026.md)** | 35 | The carefully-made web repos |
| **[links/creative-craft.md](links/creative-craft.md)** | 61 | Isometric illustration, shaders, doodles, icons, CSS art |
| **[links/tiktok-pushed.md](links/tiktok-pushed.md)** | 28 | What the design crowd is pushing right now |

---

## Start here

| Document | What it answers |
|---|---|
| [**choosing.md**](choosing.md) | **Which library for which job** — CSS-first routing tables, alternatives, anti-patterns, the two-clock rule |
| [**start-here.md**](start-here.md) | The 2026 stack in one page — what to install, what is hype, what is real |
| [**../README.md**](../README.md) | The front page — the links, the corrections, the agent rules |

---

## Research documents

Long-form references. Read them when you need the exact API of a library you
already chose, not before.

| Document | What it answers |
|---|---|
| [**research/animation-libraries.md**](research/animation-libraries.md) | 50 libraries, deep-dive, with real API signatures read from the shipped `.d.ts` files — 144 code blocks |
| [**research/modern-css.md**](research/modern-css.md) | What CSS can do natively in 2026 — verified against MDN browser-compat-data |
| [**research/code-video.md**](research/code-video.md) | Making video from code — 41 tools, 22 experiments actually run on this machine |
| [**research/creative-libs.md**](research/creative-libs.md) | 67 "hairline class" repos with live stars and install commands |
| [**research/ux-craft-2026.md**](research/ux-craft-2026.md) | The high-craft web repos of 2026, tiered by craft |
| [**research/hairline-design-study.md**](research/hairline-design-study.md) | The ten rules for pointer-reactive interface figures |
| [**research/anchor-hairline.md**](research/anchor-hairline.md) | The reference repo, fully documented |
| [**research/creative-craft.md**](research/creative-craft.md) | Creative-craft repos, tiered |
| [**research/tiktok-pushed.md**](research/tiktok-pushed.md) | The repos the TikTok design crowd is actually pushing |

## The skill ecosystem

| Document | What it answers |
|---|---|
| [**research/agent-skills-ecosystem.md**](research/agent-skills-ecosystem.md) | How agent skills actually work — the spec, the formats, the install paths |
| [**research/claude-code-tooling.md**](research/claude-code-tooling.md) | The 5-minute baseline setup, the decision table, and the pitfalls |
| [**research/design-skills.md**](research/design-skills.md) | Which AI design skills are real, and the `SKILL.md` vs component-code distinction |
| [**research/youtube-design.md**](research/youtube-design.md) | 80 video transcripts, mined for techniques and tools |
| [**research/tiktok-hyped.md**](research/tiktok-hyped.md) | The hype repos, and which ones hold up |

---

## The skills on this machine

110 skills parsed from `~/.hermes/skills` and filed into a taxonomy.

| Document | What it covers |
|---|---|
| [**skills/creative.md**](skills/creative.md) | Design, animation, illustration, video, image work |
| [**skills/engineering.md**](skills/engineering.md) | Rust, Go, Python, testing, code review, debugging |
| [**skills/research.md**](skills/research.md) | Papers, citations, monitoring, scraping |
| [**skills/productivity.md**](skills/productivity.md) | Notes, spreadsheets, documents, meetings |
| [**skills/media.md**](skills/media.md) | YouTube, GIFs, music, spectrograms |
| [**skills/agents.md**](skills/agents.md) | Multi-agent orchestration and delegation |
| [**skills/comms.md**](skills/comms.md) | Email, social platforms |
| [**skills/spec-compliance.md**](skills/spec-compliance.md) | Which skill fields are portable across harnesses |

The full tree: [`../data/skills.tree.md`](../data/skills.tree.md)

---

## How the data is produced

```sh
cd ~/Projects/agent-atlas
export GITHUB_TOKEN=$(gh auth token)

python3 tools/extract_skills.py --out data/                    # local skills
python3 tools/resolve_repos.py  --spec data/libs.spec.json \
        --out data/libs.spec.final.json                         # canonical repos
python3 tools/scrape_libs.py    --spec data/libs.spec.final.json \
        --out data/libs.live.json                                # live npm + GitHub
python3 tools/build_site.py                                      # site + counts
```

Live data lives in [`../data/`](../data/). The link files are generated from
it, and every one of them carries a `verified_on` date.
