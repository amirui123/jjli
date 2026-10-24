# Motion Execution Strategy

Date: 2026-06-19

## Current Read

The estate does not need another generic animation push. It needs a motion operating system:

- one vocabulary
- one token ladder
- one capture/export path
- one QA rubric
- one asset provenance policy
- one productized MCP layer

Motion/Framer Motion is already the dominant runtime in the sites. GSAP, Three.js, Remotion, ffmpeg, Hyperframes, and Playwright already exist in the wider system. The strategic move is to connect these into a coherent production lane.

## Highest-Leverage Opportunity

Build **Starlight Motion Designer** as a practical layer that can audit and upgrade the existing sites first, then become a public product.

The proof should come from real estate upgrades:

1. FrankX homepage or offer page motion polish.
2. Arcanea homepage or onboarding motion system.
3. Starlight motion artifact / MCP render pipeline.

## What I Can Execute Best Now

### 1. Estate standardization

Create brand-ready `MOTION.md` files and/or `lib/motion.ts` helpers for:

- `frankx.ai-vercel-website`
- `arcanea-ai-app/apps/web`
- `Starlight-Intelligence-System/site`

Deliverable:

- shared timing/easing/stagger defaults
- reduced-motion policy
- stack selection rules
- QA checklist

### 2. Motion QA capture

Add a Playwright-based capture recipe that records:

- desktop first viewport
- mobile first viewport
- one primary interaction
- reduced-motion mode
- short video clip where relevant

Best first target:

- Arcanea `apps/web`, because Playwright is already installed there.
- FrankX second, using Puppeteer or adding Playwright intentionally.

### 3. GIF/video export

Connect existing Remotion/ffmpeg strengths:

- Use `AnimeLegends/remotion` as the working Remotion reference.
- Use `starlight-cosmos-engine/mcp-remotion-render` and `mcp-ffmpeg-render` as infrastructure references.
- Add a simple repo-level export recipe in this awesome repo before touching production sites.

### 4. Pattern registry

Define reusable motion patterns:

- page reveal
- card hover
- modal entrance
- product state change
- scroll process explanation
- social hook loop
- memory palace / spatial node reveal
- brand signature hero

Each pattern should include runtime, timing, reduced-motion fallback, asset needs, and QA evidence.

### 5. Motion Designer MCP MVP

Build a TypeScript MCP server with narrow tools:

- `create_motion_brief`
- `select_motion_stack`
- `generate_motion_tokens`
- `score_motion_quality`
- `export_gif_recipe`

Then add capture/render tools only after the read-only planning tools are useful.

## Brand Strategy

### FrankX.ai

Role: public proof and creator education.

Do:

- upgrade high-traffic offer pages with restrained Motion patterns
- publish short demos and before/after writeups
- use Remotion/ffmpeg to create shareable clips from site interactions
- keep copy and motion direct, technical, and non-mythic

Avoid:

- over-cinematic effects that slow conversion
- Arcanea lore language
- decorative 3D unless it proves an AI workflow

### Arcanea

Role: premium taste and creative atmosphere.

Do:

- formalize motion variants in `@arcanea/design-system`
- build one cinematic GSAP/R3F story surface
- use Rive/Lottie for owned stateful creative assets
- create the example gallery that makes the motion repo feel alive

Avoid:

- one-off hardcoded animation constants
- overusing particles and glow without product meaning
- shipping motion without Playwright/visual QA evidence

### Starlight Intelligence Systems

Role: protocol, infrastructure, governance.

Do:

- turn existing Remotion/ffmpeg MCP packages into the Motion Designer MCP roadmap
- use Hyperframes motion packages as artifact references
- own scoring, provenance, capture, export, and install policy
- keep the core MCP narrow, auditable, and useful

Avoid:

- making Starlight another design inspiration site
- broad filesystem/shell MCP tools before security review
- mixing private strategy or private memory into public examples

## 30-Day Execution Plan

### Week 1: Standardize and prove

- Add estate audit and strategy docs to this repo.
- Create motion pattern registry v0.
- Add brand motion template files.
- Pick one FrankX page and one Arcanea page for motion QA baseline.

### Week 2: Capture and export

- Add Playwright motion capture recipe.
- Add ffmpeg GIF/MP4 export recipe.
- Render first before/after GIF from an existing page.
- Add provenance template for motion assets.

### Week 3: MCP MVP

- Scaffold Starlight Motion Designer MCP.
- Implement planning/scoring tools first.
- Point it at this repo's registry/rubric.
- Test against one real page brief.

### Week 4: Demo and distribution

- Build Vercel demo/gallery for the repo.
- Publish three examples:
  - FrankX conversion surface
  - Arcanea premium onboarding/hero
  - Starlight MCP/render pipeline
- Write FrankX public explainer: "The AI Motion Design Stack."

## Decisions

1. Motion/Framer Motion remains the default app UI runtime.
2. GSAP is for named signature surfaces, not every interaction.
3. Remotion is the video system.
4. Playwright plus ffmpeg is the proof/export layer.
5. Rive/Lottie are asset lanes, not default dependencies.
6. Starlight owns MCP/protocol.
7. Arcanea owns premium examples.
8. FrankX owns education and market distribution.

## Next Best Action

Build the pattern registry and capture/export scripts next, then apply them to one real FrankX or Arcanea page.

