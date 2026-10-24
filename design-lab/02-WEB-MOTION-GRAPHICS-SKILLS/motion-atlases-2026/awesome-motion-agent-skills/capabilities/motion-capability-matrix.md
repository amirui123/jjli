# Motion Capability Matrix

## Default Capability Lanes

| Lane | Primary Stack | Secondary Stack | Owner Brand | When To Use |
| --- | --- | --- | --- | --- |
| Product UI microinteraction | Motion / Framer Motion | CSS transitions | FrankX, Arcanea | Buttons, cards, tabs, modals, route states, dashboards. |
| Premium landing choreography | GSAP | Motion, CSS | Arcanea, FrankX | Hero sequences, text reveals, scroll narratives, launch pages. |
| Spatial/3D experience | Three.js / R3F | GSAP timeline, Theatre.js | Arcanea, Starlight | Memory palace, cosmos, worlds, interactive scenes. |
| Rendered video/GIF | Remotion | ffmpeg, Playwright capture | Starlight, FrankX | Social clips, explainer videos, demo GIFs, product launch assets. |
| Browser capture QA | Playwright | Vercel preview fetch, Browser connector | Starlight | Screenshot/video capture, reduced-motion checks, mobile/desktop QA. |
| Interactive vector asset | Rive | Lottie | Arcanea | Mascots, onboarding, badges, stateful brand objects. |
| Portable vector loop | Lottie/dotLottie | Rive | FrankX, Arcanea | Icons, loading loops, small editorial flourishes. |
| Motion product infrastructure | MCP + TypeScript | Existing cosmos render MCPs | Starlight | Motion brief, tokens, stack selection, render/export, QA. |

## What To Standardize First

1. Motion tokens:
   - durations
   - easings
   - stagger
   - spring defaults
   - reduced-motion branch

2. Runtime rules:
   - Motion for React state/layout.
   - GSAP for explicit timelines and scroll narratives.
   - Remotion for rendered video.
   - Playwright for proof capture.
   - ffmpeg for export/compression.

3. QA evidence:
   - desktop screenshot
   - mobile screenshot
   - reduced-motion check
   - video or frame sequence for non-trivial motion
   - rubric score

4. Asset provenance:
   - source
   - license
   - generated/owned/third-party
   - allowed surfaces
   - export variants

## Install Policy

Install by lane, not by hype.

- FrankX sites: Motion first, GSAP only for named launch/story pages, no Rive/Lottie until assets exist.
- Arcanea: Motion + GSAP + R3F are core; Rive/Lottie are appropriate for premium assets.
- Starlight: prioritize MCP, Playwright, Remotion, ffmpeg, Hyperframes, and R3F for memory/spatial products.

## Capability Gaps To Build

| Gap | Build Artifact |
| --- | --- |
| Motion standard scattered across repos | `MOTION.md` or `motion-tokens.ts` template for each brand repo. |
| No shared capture path | `scripts/motion/capture.mjs` Playwright recipe. |
| No shared export path | `scripts/motion/export-gif.ps1` or Node wrapper around ffmpeg. |
| No motion registry | JSON/YAML pattern registry in the awesome repo, later served by MCP. |
| No automated score | `score_motion_quality` MCP tool backed by rubric fields. |
| No cross-brand proof | Vercel demo/gallery showing before/after and exported clips. |

