# Awesome Motion Design Agent Skills [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

<!-- fleet:hero:start -->
<p align="center"><img src="assets/banner.png" width="100%" alt="Awesome Motion Design Agent Skills — Interface motion, cinematic web and programmatic video — installable in one line."></p>
<!-- fleet:hero:end -->

[![Stars](https://img.shields.io/github/stars/frankxai/awesome-motion-design-agent-skills?style=flat)](https://github.com/frankxai/awesome-motion-design-agent-skills) [![Last commit](https://img.shields.io/github/last-commit/frankxai/awesome-motion-design-agent-skills?style=flat)](https://github.com/frankxai/awesome-motion-design-agent-skills/commits/main) [![License: CC0](https://img.shields.io/badge/license-CC0--1.0-lightgrey?style=flat)](LICENSE)

<!-- fleet:install-badges:start -->
[![Install: any agent](https://img.shields.io/badge/npx%20skills%20add-any%20agent-000000?style=for-the-badge&logo=npm)](#install) [![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://code.claude.com/docs/en/discover-plugins) [![Download for Claude.ai](https://img.shields.io/badge/Claude.ai%20%2F%20Cowork-download%20.zip-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://github.com/frankxai/awesome-motion-design-agent-skills/releases)
<!-- fleet:install-badges:end -->

> The motion-design stack for AI agents — curated GSAP, Motion, Remotion, Lottie and Rive resources, plus five installable skills that make agents animate with taste.

Every entry links to its primary source and carries a dated pulse. Companion FrankX lists sit at the end, never in front.

**Doctrine:** static hierarchy first. Animate only to clarify state or narrative. Design the reduced-motion path — don't just disable it. Verify on real devices.

<!-- fleet:install:start -->
## Install

Five skills ship in [`skills/`](skills) as open-standard `SKILL.md` folders, so one source feeds every surface.

| Surface                                                                                               | Install                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Any agent** — Claude Code, Codex, Cursor, Copilot, Gemini CLI and 70+ more via `vercel-labs/skills` | `npx skills add frankxai/awesome-motion-design-agent-skills`                                                                                                                            |
| One skill, one agent                                                                                  | `npx skills add frankxai/awesome-motion-design-agent-skills --skill web-motion-auditor -a claude-code` (or `codex`, `cursor`, `github-copilot`, `gemini-cli`; add `-g` for global)      |
| **Claude Code** plugin (all five, auto-updating)                                                      | `/plugin marketplace add frankxai/awesome-motion-design-agent-skills` then `/plugin install motion-design-studio@frankx-motion`                                                         |
| **Claude.ai · Claude Desktop · Cowork**                                                               | Download a skill `.zip` from the [rolling release](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/tag/skills-latest) and upload it in Claude's Skills settings |
| **GitHub Copilot** (cloud agent, CLI, VS Code)                                                        | Copy `skills/<name>/` into your repo's `.github/skills/` — or `npx skills add … -a github-copilot`                                                                                      |
| **Codex**                                                                                             | `npx skills add frankxai/awesome-motion-design-agent-skills -a codex`                                                                                                                   |

Preview with `npx skills add frankxai/awesome-motion-design-agent-skills --list`; verify with `npx skills list`. Scan any third-party pack with `NVIDIA/SkillSpector` before it reaches a live profile.
<!-- fleet:install:end -->

## Choose your workflow

Five first-party skills, one per job. Read the `SKILL.md`, then install only what the work needs.

| Job                                               | Skill                                                                                | Read without installing                                                                                                           | Zip                                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Product UI motion, stack choice, vector/3D assets | [`motion-director`](skills/motion-director/SKILL.md)                                 | [motion quality rubric](rubrics/motion-quality-rubric.md)                                                                         | [↓](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/download/skills-latest/motion-director.zip)                 |
| Cinematic site choreography                       | [`site-motion-excellence-director`](skills/site-motion-excellence-director/SKILL.md) | [site motion spec](templates/site-motion/SITE_MOTION_SPEC.md) · [excellence gate](rubrics/site-motion-excellence-gate.md)         | [↓](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/download/skills-latest/site-motion-excellence-director.zip) |
| Deterministic video in React                      | [`remotion-video-agent`](skills/remotion-video-agent/SKILL.md)                       | [GIF/video pipeline](playbooks/gif-video-pipeline.md)                                                                             | [↓](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/download/skills-latest/remotion-video-agent.zip)            |
| Generative media routing and finishing            | [`generative-media-director`](skills/generative-media-director/SKILL.md)             | [production workflow](playbooks/image-video-gif-production-workflow.md) · [provider routing](playbooks/video-provider-routing.md) | [↓](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/download/skills-latest/generative-media-director.zip)       |
| Review, capture, motion QA                        | [`web-motion-auditor`](skills/web-motion-auditor/SKILL.md)                           | [site motion rollout](playbooks/site-motion-rollout.md)                                                                           | [↓](https://github.com/frankxai/awesome-motion-design-agent-skills/releases/download/skills-latest/web-motion-auditor.zip)              |

New here? [GETTING_STARTED](GETTING_STARTED.md) walks discovery → read → install → verify.

<details>
<summary>Everything else in the repo</summary>

| Layer     | Files                                                                                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Templates | [`MOTION.md` brand motion](templates/brand-motion/MOTION.md) · [media brief](templates/creative-briefs/motion-media-brief.md)                                                                                                                                                           |
| Playbooks | [recommended installs](playbooks/recommended-installs.md)                                                                                                                                                                                                                               |
| Contracts | [media job schema](schemas/media-job.schema.json) · [provider routing config](configs/provider-routing.default.json) · [motion pattern registry](patterns/motion-pattern-registry.json)                                                                                                 |
| Maps      | [motion capability matrix](capabilities/motion-capability-matrix.md) · [generative media provider matrix](capabilities/generative-media-provider-matrix-2026-06-22.md) · [Motion Designer MCP spec](mcp/motion-designer-mcp.md) · [stack ranking](rankings/best-motion-design-stack.md) |

</details>

<!-- earned-skill-index:2026-09-28 -->

## Earned third-party skill packs

Operators get leverage from **about 5–7 named workflows**, not bulk dumps. Method: [earned-skills index](https://github.com/frankxai/awesome-hermes-agent-skills/blob/main/docs/EARNED-SKILLS.md) · [safety gate](https://github.com/frankxai/awesome-hermes-agent-skills/blob/main/docs/QUALITY-AND-SAFETY.md).

| Pack                                                                                  | Pulse               | Job                                                          | Install                                          |
| ------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills)                     | MIT · 15.8k★        | Official GSAP agent skills — timelines, ScrollTrigger, React | `npx skills add greensock/gsap-skills`           |
| [remotion-dev/skills](https://github.com/remotion-dev/skills)                         | 4.8k★               | Official Remotion agent skills                               | `npx skills add remotion-dev/skills`             |
| [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | MIT · 1.8k★         | Motion-design principles for Lottie / dotLottie output       | `npx skills add LottieFiles/motion-design-skill` |
| [Orkas-AI/Orkas-VideoStudio](https://github.com/Orkas-AI/Orkas-VideoStudio)           | MIT · 496★          | 14-skill video pack driven by `plan.json`                    | see repo                                         |
| [garrytan/gstack](https://github.com/garrytan/gstack)                                 | MIT · 134k★         | Design / motion QA passes                                    | see repo                                         |
| [nexu-io/open-design](https://github.com/nexu-io/open-design)                         | Apache-2.0 · 98k★   | Design + media workflows, Hermes via ACP                     | see repo                                         |
| [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector)                         | Apache-2.0 · 18.5k★ | Scan skill packs before install                              | see repo                                         |

Do not install unsigned ZIP/S3 skill blobs or mass-dump skill collections into a live profile.

## Curated catalog

| Project                                                          | Pulse snapshot          | Why it is here                                                           |
| ---------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| [GSAP](https://github.com/greensock/GSAP)                        | Custom license · 28.7k★ | Timeline-grade JavaScript animation; ScrollTrigger for narrative scroll. |
| [Motion](https://github.com/motiondivision/motion)               | MIT · 33.8k★            | React/JavaScript animation with layout and gesture primitives.           |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | MIT · 32.6k★            | Three.js as a React renderer for 3D scenes with fallbacks.               |
| [Remotion](https://github.com/remotion-dev/remotion)             | Custom license · 60.9k★ | Programmatic video rendered from React.                                  |
| [Anime.js](https://github.com/juliangarnier/anime)               | MIT · 73.2k★            | Lightweight timeline animation for DOM, SVG and CSS.                     |
| [Rive WebAssembly](https://github.com/rive-app/rive-wasm)        | MIT · 970★              | State-machine interactive vector animation runtime.                      |
| [dotLottie web](https://github.com/LottieFiles/dotlottie-web)    | MIT · 888★              | Modern Lottie player for web UI motion assets.                           |
| [Phaser](https://github.com/phaserjs/phaser)                     | MIT · 40.4k★            | Real-time web interaction and game-feel patterns.                        |
| [1human reference client](https://github.com/mdagnolops/1human-reels) | MIT client · checked 2026-10-10 | Discover attributed motion references and retrieve recipes with owner-authorized agent access. |
| [Agent Skills](https://github.com/agentskills/agentskills)       | Apache-2.0 · 25.8k★     | The open `SKILL.md` standard these skills follow.                        |
| [skills CLI](https://github.com/vercel-labs/skills)              | MIT · 32.7k★            | Cross-agent installer behind `npx skills add`.                           |
| [product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) | MIT · 253★ | Claude Code skill: website URL to a 60 fps launch video with music, SFX and motion blur. Needs local Playwright and ffmpeg. |

The 1human client serves reference discovery rather than rendering: [public previews](https://reels.1human.tech/) need no account, while recipes, publication and private preferences require owner-approved credentials. The client/examples are MIT; the hosted service, brand and private data are not. Reference licenses remain per creation. Basic participation is free, with a capped beta; this is not a universal importer or evidence of adoption.

<details>
<summary>Editorial curation lens (optional)</summary>

```mermaid
mindmap
  root((Curated agent capability))
    Strategy
      fit and scope
    Governance
      provenance and license
    Talent
      human review
    Technology
      tools and integration
    Data
      evidence and memory
    Ethics
      safety and disclosure
```

This lens is editorial, not an endorsement or a claim that a project satisfies every pillar.

</details>

<!-- fleet:ecosystem:start -->
## Explore the FrankX Awesome Ecosystem

Companion catalogs. The third-party projects above are this list's primary value.

**Agents & systems** — [agent operating systems](https://github.com/frankxai/awesome-agent-operating-systems) · [hermes agents](https://github.com/frankxai/awesome-hermes-agents) · [hermes agent skills](https://github.com/frankxai/awesome-hermes-agent-skills) · [automation](https://github.com/frankxai/awesome-automation-agent-skills) · [AI CoE](https://github.com/frankxai/awesome-ai-coe)

**Create** — [design](https://github.com/frankxai/awesome-design-agent-skills) · **motion design** · [music](https://github.com/frankxai/awesome-music-agent-skills) · [gamification](https://github.com/frankxai/awesome-gamification-agent-skills)

**Capital** — [agentic income](https://github.com/frankxai/awesome-agentic-income) · [investor](https://github.com/frankxai/awesome-investor-agent-skills) · [wealth](https://github.com/frankxai/awesome-wealth-agent-skills) · [payments](https://github.com/frankxai/awesome-payment-agent-skills)

**Mind & cosmos** — [mind](https://github.com/frankxai/awesome-mind-agent-skills) · [manifestation](https://github.com/frankxai/awesome-manifestation-skills) · [cosmos](https://github.com/frankxai/awesome-cosmos-ai-agents)
<!-- fleet:ecosystem:end -->

## Contribution standard

Open a PR with a primary URL, one-sentence distinct value, current maintenance evidence, license posture, and relevant safety/deployment caveat. New skills must pass `skills-validate` (frontmatter name matches folder, description ≤ 1024 chars, no private paths). No affiliate links, private workflow exports, unverified claims, or product pitches in place of a useful third-party resource.

## Research method

Repository metadata (stars, SPDX license, archived state, last push) was pulled from the GitHub API on **2026-09-28**. "Custom license" means GitHub returned no standard SPDX identifier — read the license before adoption. Counts are dated discovery signals, not rankings. Links are checked on every PR and monthly by [Lychee](.github/workflows/link-checker.yml). Nothing here is financial, legal, medical, or safety advice.

