# Generative Media Operating System

Date: 2026-06-22

## Thesis

Best-in-class motion teams do not start by asking "which model makes the coolest clip?"

They build a pipeline:

1. strategy
2. visual language
3. style frames
4. storyboard
5. motion test
6. generation
7. deterministic finishing
8. web integration
9. QA
10. provenance and learning

The local estate already has the ingredients. The missing piece is a single system that routes work across imagegen, Sora/Grok/Veo/Luma/Runway/Higgsfield, Remotion, Playwright, ffmpeg, and brand design systems.

## Correct Model Language

The local `imagegen` skill is **not GPT-2**.

- Default mode: built-in Codex `image_gen` tool.
- CLI fallback default: `gpt-image-2`.
- True native transparency fallback: `gpt-image-1.5` only after explicit confirmation.

Use "GPT Image 2" or "ChatGPT Images 2.0" for current image-generation language. Avoid saying "GPT-2 image generation"; GPT-2 is an old language-model name and creates confusion.

## The Stack We Should Run

### 1. Image Direction Layer

Use imagegen/GPT Image 2 for:

- art direction boards
- hero style frames
- product mockups
- character sheets
- UI mood frames
- poster frames for video
- before/after concept frames

Prompt structure:

```text
Use case:
Asset type:
Primary request:
Scene/backdrop:
Subject:
Style/medium:
Composition/framing:
Lighting/mood:
Color palette:
Text (verbatim):
Constraints:
Avoid:
```

### 2. Motion Concept Layer

For every motion asset, define:

- motion job
- audience
- platform and aspect ratio
- first frame
- final frame
- shot list or beat list
- camera movement
- subject movement
- timing
- audio needs
- safety/provenance constraints

### 3. Generation Provider Layer

Use provider routing:

- Sora: OpenAI-first cinematic video and image-to-video.
- Veo/Flow: high-fidelity 8-second cinematic clips with native audio and strong reference-frame control.
- Grok Imagine: fast image/video/social clips, especially stylized or audio-synced variants.
- Luma: cinematic exploration and creative-agent workflows.
- Runway: production editing and existing-video transformation.
- Higgsfield: creator/social/ad video formats and campaign variants.

### 4. Deterministic Finishing Layer

Use Remotion for:

- titles
- captions
- lower thirds
- exact typography
- UI overlays
- product cards
- format variants
- final cuts

Use ffmpeg for:

- GIF conversion
- compression
- WebM/MP4 variants
- social crops
- poster extraction

Use Playwright for:

- recording live web motion
- screenshot baselines
- reduced-motion evidence
- product demo source capture

## Workflow By Output

### Website Hero Still

1. Motion Director writes the art-direction brief.
2. imagegen produces 3-5 style frames.
3. Choose one frame.
4. Save asset in repo with provenance.
5. Integrate in page.
6. Verify desktop/mobile crop.

### Website Motion / GIF

1. Implement motion in code with Motion/GSAP/Three.
2. Run Playwright capture.
3. Export short MP4/WebM.
4. Convert GIF only if needed.
5. Score with motion rubric.
6. Save poster frame and provenance.

### Cinematic Brand Clip

1. Generate key style frame with imagegen/GPT Image 2.
2. Generate motion with Sora/Veo/Grok/Luma/Runway/Higgsfield.
3. Select best take.
4. Finish with Remotion overlays/captions.
5. Export with ffmpeg.
6. Archive prompt, provider, model, asset rights, and final variants.

### Social Ad Variant System

1. Define campaign concept and hook.
2. Create still/image board.
3. Generate 3-5 video variants through provider routing.
4. Finish in Remotion.
5. Export 9:16, 1:1, 4:5, 16:9.
6. Attach metrics once published.

## Brand Roles

### FrankX.ai

Use generative media to teach and sell:

- "before/after AI site polish"
- creator product demos
- founder-facing explainers
- social proof clips
- workshop/course promotional assets

Keep it crisp, concrete, and non-mythic.

### Arcanea

Use generative media for premium world and story:

- character sheets
- realm/world style frames
- cinematic motion loops
- onboarding atmosphere
- lore-aware social clips
- creator studio examples

Arcanea is where the wildness belongs, but it still needs provenance and visual QA.

### Starlight Intelligence Systems

Use generative media as infrastructure:

- Motion Designer MCP
- provider router
- prompt/asset provenance
- visual QA
- render/export automation
- capability registry

Starlight should own the process more than the vibe.

## Best Next Product

Build **Starlight Motion Designer MCP** as a provider-agnostic orchestration layer:

- `create_media_brief`
- `select_generation_provider`
- `write_image_prompt`
- `write_video_prompt`
- `plan_storyboard`
- `record_web_motion`
- `export_media_variant`
- `score_motion_quality`
- `write_asset_provenance`

Keep provider calls optional. The first value is excellent planning, prompting, scoring, and documentation. Generation integrations come after key/security review.

## Design-Team Operating Rhythm

For every serious media asset:

1. One strategist writes the brief.
2. One art director defines visual language.
3. One motion director defines timing and beats.
4. One generation operator creates candidates.
5. One editor finishes with Remotion/ffmpeg.
6. One QA reviewer checks crop, readability, reduced motion, compression, and provenance.
7. One publisher integrates and measures.

This is the scale pattern. Agents can play these roles, but the roles must exist.

