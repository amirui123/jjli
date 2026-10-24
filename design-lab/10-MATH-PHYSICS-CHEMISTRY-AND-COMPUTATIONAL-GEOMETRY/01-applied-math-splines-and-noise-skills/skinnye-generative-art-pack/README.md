<div align="center">

<img src="assets/banner.svg" alt="Generative Art Pack" width="100%" />

### The Claude Code pack for **generative art &amp; creative coding** — sketch to print, loop, or mint.

[![License: MIT](https://img.shields.io/badge/License-MIT-e85aff.svg?style=flat-square)](LICENSE)
[![Agents](https://img.shields.io/badge/agents-6-ff6b5c?style=flat-square)](#-agents)
[![Skills](https://img.shields.io/badge/skills-4-ffb347?style=flat-square)](#-skills)
[![Claude Code](https://img.shields.io/badge/Claude_Code-ready-3ad6c5?style=flat-square)](https://docs.claude.com/en/docs/claude-code)
[![p5.js](https://img.shields.io/badge/p5.js-creative_coding-ed225d?style=flat-square)](https://p5js.org)
[![Live demo](https://img.shields.io/badge/demo-live-7c5cff?style=flat-square)](https://skinnye.github.io/generative-art-pack/)

[**Live gallery**](https://skinnye.github.io/generative-art-pack/) · [Agents](#-agents) · [Skills](#-skills) · [Toolkit](#-recommended-toolkit) · [Install](#-installation)

</div>

> [!NOTE]
> Six agents and four skills that take a generative piece from **concept → sketch → algorithm → shader → color → export** (print, video, or a hash-seeded series), all wired into Claude Code. The landing page is a **live gallery** — every tile is generated in your browser by the same techniques the pack builds. Install just `agents/` and `skills/`. Sibling of the [**3D Web Pack**](https://github.com/skinnye/3d-web-pack) — `shader-artist` is shared.

---

## 📋 Table of contents

- [What's inside](#-whats-inside)
- [Installation](#-installation)
- [Agents](#-agents)
- [Skills](#-skills)
- [Recommended toolkit](#-recommended-toolkit)
- [Typical workflow](#-typical-workflow)
- [How a pack file is structured](#-how-a-pack-file-is-structured)
- [Repository layout](#-repository-layout)
- [Related packs](#-related-packs)
- [License](#-license)

---

## 📦 What's inside

| Component | Count | Purpose |
| :--- | ---: | :--- |
| **Agents** | 6 | Specialized subagents, one per layer of a generative piece |
| **Skills** | 4 | One-command guided workflows |
| **Live demo** | 1 | A browser gallery of 10 generative techniques — 6 still + 4 animated (regenerate / re-seed any tile) |
| **Guide** | 1 | [`GENERATIVE-ART-PACK.md`](GENERATIVE-ART-PACK.md) — full reference (RU) |

---

## 🚀 Installation

Agents and skills go in your **global** `~/.claude` so they work in every project.

```bash
# 1. clone
git clone https://github.com/skinnye/generative-art-pack.git

# 2. copy agents + skills into global Claude Code config (macOS / Linux)
cp -r generative-art-pack/agents/*  ~/.claude/agents/
cp -r generative-art-pack/skills/*  ~/.claude/skills/
```

```powershell
# Windows (PowerShell)
Copy-Item generative-art-pack/agents/* $HOME/.claude/agents/ -Recurse
Copy-Item generative-art-pack/skills/* $HOME/.claude/skills/ -Recurse
```

Then describe what you want — agents trigger by task, or call them by name. Skills run as `/skill-name`.

> Already have the [3D Web Pack](https://github.com/skinnye/3d-web-pack)? `shader-artist` is shared — copying again just overwrites it with the identical file.

---

## 🤖 Agents

| Agent | Owns | Reach for it when… |
| :--- | :--- | :--- |
| [**generative-art-director**](agents/generative-art-director.md) | Concept, technique, composition, palette strategy, seed plan | Starting a piece or a series |
| [**p5-sketch-engine**](agents/p5-sketch-engine.md) | p5.js / canvas sketch code — seeded, re-rollable | Building the actual sketch |
| [**generative-systems**](agents/generative-systems.md) | The algorithms — flow fields, packing, CA, reaction-diffusion, attractors, WFC | The system needs to be coded & tuned |
| [**shader-artist**](agents/shader-artist.md) | GLSL & TSL shaders, noise, raymarching | GPU visuals / textures *(shared with 3D Web Pack)* |
| [**color-composition**](agents/color-composition.md) | Palettes, OKLCH ramps, grain, composition | It looks flat, muddy, or unbalanced |
| [**art-export-engineer**](agents/art-export-engineer.md) | High-res print, video/GIF loops, hash-seeded series | Shipping it out into the world |

---

## 🛠 Skills

| Skill | What it does |
| :--- | :--- |
| [`/scaffold-sketch`](skills/scaffold-sketch/SKILL.md) | New seeded p5.js or vanilla-canvas sketch |
| [`/flow-field`](skills/flow-field/SKILL.md) | The signature technique — noise-driven particles into flowing forms |
| [`/export-art`](skills/export-art/SKILL.md) | Print-ready stills + perfect video/GIF loops |
| [`/generative-series`](skills/generative-series/SKILL.md) | Deterministic, hash-seeded editions (fxhash / Art Blocks) |

---

## 🧱 Recommended toolkit

| Layer | Tools |
| :--- | :--- |
| **Author** | p5.js · HTML5 canvas · GLSL/shaders · three.js (3D) |
| **Systems** | Perlin/simplex/curl noise · flow fields · packing · reaction-diffusion · CA · attractors · WFC |
| **Color** | OKLCH/OKLab ramps · culori · palette-from-image · dithering · grain |
| **Export** | high-res PNG/SVG · CCapture · WebCodecs · ffmpeg loops/GIF · fxhash · Art Blocks |

---

## 🔄 Typical workflow

```text
1. generative-art-director  →  concept, technique, palette, seed plan
2. /scaffold-sketch         →  clean seeded sketch
3. generative-systems       →  the algorithm, tuned to the sweet spot
4. shader-artist            →  optional GPU visuals
5. color-composition        →  palette + composition polish
6. /export-art  or  /generative-series  →  print, loop, or mint
```

---

## 🧩 How a pack file is structured

**Agent** (`agents/<name>.md`):

```markdown
---
name: generative-systems
description: When this agent should be invoked…
tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
---

System prompt: role, rules, techniques, output format.
```

**Skill** (`skills/<name>/SKILL.md`):

```markdown
---
name: flow-field
description: What it does and when to use it…
---

Step-by-step procedure the model follows.
```

---

## 🗂 Repository layout

```text
generative-art-pack/
├─ index.html              # live gallery (vanilla canvas generative engine)
├─ assets/
│  ├─ art.js               # seeded PRNG + noise + 6 techniques + hero
│  ├─ app.js               # scroll / reveals / UI
│  ├─ style.css
│  └─ banner.svg
├─ agents/                 # ← the 6 agents (install these)
├─ skills/                 # ← the 4 skills (install these)
├─ GENERATIVE-ART-PACK.md  # full guide (RU)
├─ README.md
└─ LICENSE
```

---

## 🔗 Related packs

- [**3D Web Pack**](https://github.com/skinnye/3d-web-pack) — Three.js, React Three Fiber, WebGPU, scroll-motion & asset pipelines for award-style 3D websites. Shares the `shader-artist` agent.

## 📄 License

[MIT](LICENSE) — use it, fork it, make beautiful things.

<div align="center">
<sub>The gallery is rendered live with the pack's own techniques.</sub>
</div>
