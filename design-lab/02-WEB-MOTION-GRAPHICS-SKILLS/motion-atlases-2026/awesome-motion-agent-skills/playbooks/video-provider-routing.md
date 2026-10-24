# Video Provider Routing Playbook

Date: 2026-06-22

## What Codex Can Manage Today

Codex can manage the complete preflight and finishing system:

- media strategy, shot lists, and creative briefs
- imagegen/GPT Image 2 style frames and poster frames
- provider routing and dry-run job specs
- Remotion compositions for exact typography, UI overlays, captions, and variants
- Playwright capture of real site/app motion
- ffmpeg GIF, MP4, WebM, poster, and compression exports
- QA checklists for crop, file size, readability, reduced motion, and provenance

Codex should route real third-party video jobs through the safest available authenticated surface:

- logged-in CLI native tools first when they exist
- provider OAuth/session auth when the CLI owns the generation
- Vercel AI Gateway when the generation belongs inside a Vercel app
- direct provider API only when advanced controls or automation require it

## Current Local Capability Reading

Local commands were found for Grok and Gemini:

- `grok.exe`
- `gr`
- `gemini.ps1`

`grok models` confirmed the local Grok CLI is logged in with `grok.com`.

Grok's local `imagine` skill documents these native tool calls:

- `image_gen`: generate a new image from text.
- `image_edit`: edit or compose from one or more source images.
- `image_to_video`: animate a source image as frame 1.
- `reference_to_video`: use only when multiple references are genuinely needed.

For the Grok CLI lane, raw provider keys are not the first blocker. The first blocker is a clean handoff contract: Codex must provide a media job, a source image, a short video prompt, target output path, and QA requirements, then let Grok execute the native tool call.

No direct command was found for `xai`, `veo`, `runway`, `luma`, or `higgsfield`.

The checked environment did not expose these API credentials, which only matters for direct API lanes:

- `XAI_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `OPENAI_API_KEY`
- `RUNWAYML_API_SECRET`
- `RUNWAY_API_KEY`
- `LUMA_API_KEY`
- `HIGGSFIELD_API_KEY`
- `HIGGSFIELD_KEY_ID`
- `HIGGSFIELD_KEY_SECRET`
- `FAL_KEY`
- `REPLICATE_API_TOKEN`
- `VERCEL_OIDC_TOKEN`

So the safe default is **CLI-agent routing** for Grok and **dry-run routing** for providers whose CLI/API surface is not authenticated or installed.

## Recommended Provider Order

### 1. Grok Build CLI First For Grok Imagine

Use this when Codex is routing generation work to the local logged-in Grok CLI.

Best for:

- source image creation through `image_gen`
- source image editing/compositing through `image_edit`
- short image-to-video shots through `image_to_video`
- iterative social/video experiments where Grok owns the generation and Codex owns the brief, file organization, finishing, and QA

Operational handoff:

1. Codex writes a `media-job.json`.
2. Codex creates or selects a source image.
3. Codex writes a short shot prompt.
4. Grok executes `image_gen`, `image_edit`, or `image_to_video`.
5. Codex ingests the resulting file or URL.
6. Codex finishes with Remotion/ffmpeg when exact text, overlays, variants, or compression matter.

### 2. Vercel AI Gateway For App-Native Grok/Veo

Use this when the output supports a Vercel site or web product. It keeps generation closer to the existing hosting and deployment stack.

Best for:

- Grok Imagine social loops
- Veo cinematic clips
- quick web-to-media experiments
- unified model access from a Next.js/Vercel app

### 3. Direct Provider APIs For Advanced Control

Use direct APIs when provider-specific features matter:

- OpenAI Sora: OpenAI-first video generation, image-to-video, editing, and management.
- xAI Grok Imagine: fast image/video/social generation and image-to-video.
- Google Veo: high-fidelity cinematic video, native audio, first/last-frame workflows.
- Luma: cinematic exploration and creative-agent motion workflows.
- Runway: existing video transformation and production editing.
- Higgsfield: creator/social/ad video variants.

### 4. Starlight Motion Designer MCP After Adapters

Do not make the MCP call raw vendor APIs first. Build a provider adapter layer first, then expose those adapters as tools:

- `select_media_provider`
- `create_media_job`
- `submit_media_job`
- `poll_media_job`
- `download_media_asset`
- `finish_with_remotion`
- `export_with_ffmpeg`
- `write_asset_provenance`

This keeps the MCP stable even when providers change endpoints, prices, or model names.

## Routing Rules

Use imagegen first when:

- the visual language is not locked
- a poster frame is needed
- a hero image or keyframe must be strong before motion
- exact UI text should be controlled outside the video model

Use Grok Imagine when:

- speed matters
- the asset is social-first
- image-to-video is enough, especially through the logged-in Grok CLI
- audio-synced or stylized variants are desired

For the local Grok CLI lane, start video from a strong image. The local `imagine` skill says video starts from an image, so do not ask the CLI for an unsupported text-to-video path unless the tool surface confirms it.

Use Veo when:

- the shot needs premium realism
- native audio matters
- first/last-frame control matters
- the asset is a brand hero or cinematic trailer beat

Use Sora when:

- the team wants OpenAI-first provenance
- the project needs Sora's video workflow
- the clip is high-end image-to-video or generated video with synced audio

Use Luma when:

- the brief is exploratory
- cinematic texture and alternative motion takes matter
- the team wants quick concept-to-motion options

Use Runway when:

- editing existing footage is the core task
- a production video workflow is more important than a raw generated clip

Use Higgsfield when:

- the deliverable is creator/social/ad format
- the project needs trend-aware commercial variants

Use Remotion when:

- exact text, layout, UI, captions, and brand lockups matter
- the deliverable needs repeatable variants
- the asset must be regenerated from data

Use Playwright when:

- the clip must prove real product motion
- the source is a Vercel preview, localhost, or live site

Use ffmpeg when:

- the asset is ready for export, compression, GIF conversion, poster extraction, or format variants

## Minimal Job Flow

1. Create `media-job.json` using `schemas/media-job.schema.json`.
2. Route with `configs/provider-routing.default.json`.
3. Generate or select a style frame.
4. Write a provider-specific video prompt.
5. Submit only if credentials and rights are confirmed.
6. Save raw output plus prompt/provenance.
7. Finish in Remotion if text, layout, overlays, or variants matter.
8. Export with ffmpeg.
9. QA final output in target crop and device context.

## Source Links

- xAI Grok Build CLI: https://x.ai/news/grok-build-cli
- xAI Imagine overview: https://docs.x.ai/developers/model-capabilities/imagine
- AI SDK xAI provider: https://ai-sdk.dev/providers/ai-sdk-providers/xai
- OpenAI Sora video generation: https://developers.openai.com/api/docs/guides/video-generation
- Google Veo in Gemini API: https://ai.google.dev/gemini-api/docs/video
- Vercel AI Gateway text-to-video: https://vercel.com/docs/ai-gateway/capabilities/video-generation/text-to-video
- Vercel AI Gateway image-to-video: https://vercel.com/docs/ai-gateway/capabilities/video-generation/image-to-video
- Luma API: https://docs.lumalabs.ai/docs/api
- Runway API: https://docs.dev.runwayml.com/
- Higgsfield JS SDK: https://github.com/higgsfield-ai/higgsfield-js
