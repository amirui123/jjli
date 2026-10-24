# Current Motion Estate Audit

Date: 2026-06-19

Scope: the maintainer's local repo estate, focused on FrankX.ai, Arcanea, Starlight Intelligence Systems, and adjacent media/video repos.

## Executive Read

The estate already has serious motion capability, but it is scattered.

- FrankX and Arcanea already use Framer Motion heavily.
- GSAP, Three.js, React Three Fiber, and Anime.js are installed in key web repos, but they are not yet governed as a shared motion system.
- Arcanea has the strongest design-system posture: tokens, brand kits, Framer Motion variants, LazyMotion guidance, Playwright verification, and a repo-local motion-designer skill.
- Starlight has a different kind of strength: Hyperframes motion packages and MCP-style render services for Remotion and ffmpeg already exist in adjacent systems.
- Rive and Lottie are not first-class in the scanned primary sites yet.
- Remotion and ffmpeg exist in media/video repos, not as a unified brand-wide motion pipeline.

The opportunity is not "install more animation libraries." The opportunity is to standardize motion intent, tokens, capture, QA, and export across the estate.

## Stack Presence

| Capability | Current Evidence | Estate Status |
| --- | --- | --- |
| Motion / Framer Motion | `frankx.ai-vercel-website`, `FrankX`, `arcanea-ai-app`, `gencreator.ai`, `AnimeLegends` templates | Strong but inconsistent. Make it the default UI motion runtime. |
| GSAP | `FrankX`, `frankx.ai-vercel-website`, `arcanea-ai-app`, `arcanea-ecosystem` video packages | Present but under-standardized. Reserve for signature timelines and scroll narratives. |
| Remotion | `AnimeLegends/remotion`, `claude-code-config` Remotion test corpora, `starlight-cosmos-engine/mcp-servers/mcp-remotion-render` | Existing proof. Promote into a shared video/GIF render lane. |
| Rive | No meaningful primary-site usage found in package scan | Do not force yet. Use for state-machine mascots, onboarding, interactive badges. |
| Lottie | Minimal/no primary-site adoption found | Add only when there are real designer-authored loops or Remotion playback needs. |
| Playwright | `arcanea-ai-app/apps/web`, `gencreator.ai`, `agentic-creator-os`, `arcanea-orchestrator`, other infra repos | Strong enough for visual and motion QA. Standardize capture recipes. |
| ffmpeg | Local binary installed; `arcanea-ai-app/packages/media`; `starlight-cosmos-engine/mcp-servers/mcp-ffmpeg-render` | Strong candidate for shared export service. |
| Three.js / R3F | `FrankX`, `frankx.ai-vercel-website`, `arcanea-ai-app`, `gencreator.ai`, `Starlight-Intelligence-System/console` | Use selectively for spatial surfaces; avoid decorative 3D by default. |
| Hyperframes | `Starlight-Intelligence-System/site/motion/estate-hero-loop`, `estate-factory-scroll` | Existing Starlight motion artifact lane. Fold into motion estate map. |

## Brand Repos

### FrankX / frankx.ai

Current setup:

- Production site repo: `frankx.ai-vercel-website`.
- Private/dev/content source: `FrankX`.
- Stack: Next.js, React, Tailwind, Vercel.
- Motion packages: `framer-motion`, `gsap`, `three`, `@react-three/fiber`, `@react-three/drei`, `animejs`.
- Existing scripts: broad quality gates, design-token checks, route checks, image ops, claim audits, AI-slop audits.
- Existing agent rule: motion work should route through the shared Design Taste Kernel and Motion Design Studio.

Observed pattern:

- Heavy Framer Motion use in app routes and components.
- Reduced-motion appears in some components.
- GSAP/Three/Anime are installed, but not yet clearly codified as product lanes.
- No first-class Playwright motion-capture script in the main package.

Best role:

- Public proof, education, creator-facing examples, conversion pages, and "before/after" motion polish case studies.

### Arcanea

Current setup:

- Primary web app: `arcanea-ai-app/apps/web`.
- Stack: Next.js, React 19, Tailwind, Vercel, `@arcanea/design-system`.
- Motion packages: `framer-motion`, `gsap`, `@gsap/react`, `three`, R3F, Drei, Theatre.js in `apps/agenthub`.
- QA: Playwright in `apps/web`.
- Media: `packages/media` uses `fluent-ffmpeg`.
- Existing design-system authority: tokens, brand kits, Framer Motion variants, `domAnimation`, expoOut easing, 60ms stagger rule.
- Existing repo-local memory says a `motion-designer` skill was created and compiled on 2026-06-18.

Observed pattern:

- Arcanea is closest to having a real motion operating system.
- It already has curatorial doctrine and implementation primitives.
- It can become the premium example gallery and taste layer.

Best role:

- Premium creative motion language, high-craft demos, mythic onboarding, interactive motion patterns, gallery examples.

### Starlight Intelligence Systems

Current setup:

- Main `site` package is currently lightweight Next.js without core motion dependencies.
- `console` package has Three/R3F/Drei.
- `site/motion/estate-hero-loop` and `site/motion/estate-factory-scroll` are Hyperframes packages with preview/check/render/publish commands.
- `starlight-cosmos-engine` includes MCP server packages for Remotion rendering and ffmpeg rendering.
- Root rules already frame Starlight as premium, high-intellect, purpose-driven, and visual.

Observed pattern:

- Starlight owns infrastructure and motion-product architecture more naturally than public web animation.
- Existing Hyperframes + MCP render packages are extremely relevant to the Motion Designer MCP plan.

Best role:

- Protocol, MCP server, render/capture/QA infrastructure, asset provenance, and enterprise-grade motion governance.

## Adjacent Media Assets

| Repo | Evidence | Use |
| --- | --- | --- |
| `AnimeLegends/remotion` | Remotion project with `render:short` for vertical video | Reuse as a working Remotion reference pipeline. |
| `starlight-cosmos-engine/mcp-servers/mcp-remotion-render` | TypeScript MCP package | Candidate base or reference for Motion Designer MCP render tool. |
| `starlight-cosmos-engine/mcp-servers/mcp-ffmpeg-render` | TypeScript MCP package | Candidate base or reference for GIF/MP4 export tool. |
| `Starlight-Intelligence-System/site/motion/*` | Hyperframes packages | Candidate motion artifact lane for Starlight site and demos. |
| `arcanea-ecosystem/videos/*` | GSAP/video-related packages | Candidate old examples to mine for gallery patterns. |

## Gaps

1. No single motion token contract across FrankX, Arcanea, and Starlight.
2. No standard "motion QA capture" command shared across production sites.
3. No shared GIF/video export recipe package despite ffmpeg/Remotion assets existing.
4. No Rive/Lottie adoption criteria.
5. No central motion pattern registry.
6. No Vercel demo site for the awesome repo yet.
7. No provenance template for generated motion/video assets.

## Immediate Recommendation

Use the current estate as the product:

- Standardize what FrankX and Arcanea already do with Motion.
- Promote Starlight's existing render/capture infrastructure into the Motion Designer MCP.
- Add Rive and Lottie later as pattern types, not defaults.
- Make Playwright + ffmpeg the practical visual proof layer.

