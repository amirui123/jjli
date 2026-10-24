# agent-atlas

**A catalog of the front-end libraries and agent skills worth using — with
links, live numbers, and a plain-English reason for each one.**

Built for one job: you point your agent at this repo mid-build, and it comes
back with the right library instead of whatever it remembered from training
data.

Every version, download count, star count, and license came from a live API
response on **2026-10-20**. Nothing is written from memory.

---

## The links

**247 entries, 14 files, sorted by stars.** Each line is a name, a link, one
line of description, and the live facts.

| File | What's in it |
|---|---|
| **[animation-core.md](docs/links/animation-core.md)** | The engines — GSAP, Motion, anime.js, react-spring, Theatre |
| **[scroll-and-reveal.md](docs/links/scroll-and-reveal.md)** | Lenis, AOS, ScrollReveal, Locomotive, smooth-scrollbar |
| **[carousel-and-ui.md](docs/links/carousel-and-ui.md)** | Embla, Swiper, Vaul |
| **[gesture-and-drag.md](docs/links/gesture-and-drag.md)** | SortableJS, Auto-Animate, use-gesture |
| **[lottie-and-rive.md](docs/links/lottie-and-rive.md)** | Lottie, dotLottie, Rive |
| **[page-transitions.md](docs/links/page-transitions.md)** | Barba.js, Astro View Transitions |
| **[creative-and-3d.md](docs/links/creative-and-3d.md)** | Three.js, R3F, Drei, PixiJS, OGL, regl, TypeGPU |
| **[data-and-visualization.md](docs/links/data-and-visualization.md)** | D3, ECharts |
| **[text-and-svg.md](docs/links/text-and-svg.md)** | SplitType, SVG drawing, Rough.js |
| **[code-to-video.md](docs/links/code-to-video.md)** | Remotion, Revideo, Motion Canvas, Manim, Playwright, Puppeteer, ffmpeg.wasm |
| **[design-skills.md](docs/links/design-skills.md)** | 41 agent skills that change design output quality |
| **[ux-craft-2026.md](docs/links/ux-craft-2026.md)** | 35 carefully-made web repos |
| **[creative-craft.md](docs/links/creative-craft.md)** | 61 isometric, shader, doodle, and icon repos |
| **[tiktok-pushed.md](docs/links/tiktok-pushed.md)** | 28 repos the design crowd is pushing right now |

---

## Which one do I use?

**Read [`docs/choosing.md`](docs/choosing.md).** It routes by task, not by
name, and it tells you when *not* to reach for a library.

| You want to… | Reach for | Why not the other one |
|---|---|---|
| An accessible carousel | **Embla** | Swiper is 20 kB+ and opinionated |
| Smooth scroll | **Lenis** | not `smooth-scrollbar` — untouched since 2023 |
| A hero animation timeline | **GSAP** | Motion is React-only |
| React layout animation | **Motion** | GSAP is heavier for this |
| List reordering, animated | **Auto-Animate** | ~1 kB, framework-agnostic |
| A bottom sheet | **Vaul** | focus trap and ARIA already handled |
| React → MP4 | **Remotion** | Revideo if the license doesn't work |
| Designer-exported animation | **Lottie** | Rive if it must respond to input |
| 3D in React | **React Three Fiber** | Three.js directly if not in React |
| Components you own | **shadcn/ui** | Base UI if you want them unstyled |
| Scroll reveal | **CSS `animation-timeline: view()`** | no dependency at all |

Full table with alternatives and footguns: [`docs/choosing.md`](docs/choosing.md)

---

## For an agent

The catalog is layered cheapest-first. Stop at the first layer that answers
the question.

```
1. docs/choosing.md          "I want a carousel"  →  Embla
2. docs/links/*.md            the links, with live facts
3. docs/research/*.md         the long-form API reference, only if needed
```

**Rules:**

1. **Never quote a version, download count, or star count from memory.**
   Read it from the link file.
2. **Check `docs/choosing.md` before adding any dependency.** A 27 kB
   library for a fade is a real cost, and modern CSS covers most of it.
3. **Prefer the canonical repo.** Some packages have same-named impostors
   with a fraction of the stars. The link files point at the real one.
4. **Report the license.** It's on every line, copied from the registry.

---

## The corrections that change the advice

**1. GSAP's Club plugins are free.** Since 3.13 (2025-04-29) every plugin —
SplitText, MorphSVG, DrawSVG, ScrollSmoother, InertiaPlugin — is free for
commercial use. Club GSAP wound down. Advice saying they're paid is out of
date.

**2. GSAP is *not* MIT.** Its license is the "Standard 'no charge' license" —
free for commercial use, but not OSI open source. Read it before you ship it
in a product. Every other library in this catalog is MIT, ISC, Apache-2.0, or
equally permissive.

**3. The `skills` CLI is not Anthropic's.** `npx skills add <owner>/<repo>`
is [vercel-labs/skills](https://github.com/vercel-labs/skills) — MIT,
harness-agnostic, installs into 75+ agents. Anthropic publishes *skills*;
that CLI installs them.

**4. Stars lie, installs don't.**
[`designed-by-ai/skills`](https://github.com/designed-by-ai/skills) has 19
stars and 916,408 installs — but its README points at a *different* repo, so
those installs belong elsewhere. Install counters are attributable and
resellable. Star counts are not.

**5. A repo with 80k stars is not automatically a skill.**
[`DavidHDev/react-bits`](https://github.com/DavidHDev/react-bits) has 49.8k
stars and ships **zero** `SKILL.md` files — its `skill-*.webp` files are
marketing images. Check with:

```sh
gh api repos/<owner>/<repo>/git/trees/HEAD?recursive=1 \
  --jq '[.tree[].path | select(test("SKILL.md$"))] | length'
```

**6. Two of the most-starred libraries here are the ones to avoid.**
`smooth-scrollbar` (3.3k stars) hasn't been touched since 2023.
`ScrollReveal` (22.5k stars) is GPL-3.0 and unmaintained since 2021. Lenis
replaced both.

---

## The two-clock rule

Applies to every animation you write, and it's the most common production
animation bug:

- **Discrete** change (which item is active) → long ease-out, ~700 ms on
  `(.32, 0.72, 0, 1)`
- **Continuous** input (where the pointer is) → **spring**, never a timed
  ease, because the target moves every frame and a timed ease is always
  chasing it

---

## The rest of the repo

| Path | What |
|---|---|
| [`docs/choosing.md`](docs/choosing.md) | The decision guide. Read this first. |
| [`docs/links/`](docs/links/) | **The catalog** — 247 entries, 14 files |
| [`docs/research/`](docs/research/) | Long-form references: animation APIs, modern CSS, code-to-video, the skill ecosystem, 80 YouTube transcripts, the TikTok repos |
| [`docs/skills/`](docs/skills/) | The 110 skills installed on this machine, parsed and filed into a taxonomy |
| [`data/`](data/) | Machine-readable JSON — every entry with its live facts |
| [`tools/`](tools/) | The scrapers that re-verify everything |
| [`site/`](site/) | A browser for the whole thing |
| [`SKILL.md`](SKILL.md) | Makes this repo installable as an agent skill |

**Live site:** <https://youssefvdel.github.io/agent-atlas/>

---

## Keeping it honest

Everything here is regenerated from live APIs. Nothing is remembered.

```sh
cd ~/Projects/agent-atlas
export GITHUB_TOKEN=$(gh auth token)

python3 tools/extract_skills.py --out data/                 # local skills
python3 tools/resolve_repos.py  --spec data/libs.spec.json \
        --out data/libs.spec.final.json                      # canonical repos
python3 tools/scrape_libs.py    --spec data/libs.spec.final.json \
        --out data/libs.live.json                             # live npm + GitHub
python3 tools/build_site.py                                   # site + counts
```

Four rules the pipeline obeys:

1. **No invented numbers.** A field that can't be resolved is recorded as an
   error, never a guess.
2. **Verified repo resolution.** A repo is only canonical when it is
   non-fork, non-archived, and its own `package.json` name matches the
   package. Search-by-description hands you `rustdesk` for `remotion`.
3. **Forks are never the source.** npm's `repository` field sometimes points
   at a personal fork; the resolver walks `parent`/`source` upstream.
4. **Errors are recorded, not hidden.** Every entry keeps its own `errors`
   array.

---

## License

This repo's research and tooling: **MIT**. Catalogued libraries and skills
remain under their own licenses — each entry states the authoritative one,
copied from the registry, not paraphrased.
