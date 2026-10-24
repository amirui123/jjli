# Generative Media Provider Matrix

Date: 2026-06-22

This matrix routes image, GIF, and video work across the motion-design stack.

## Core Principle

Use generative media for style frames, cinematic scenes, character/world assets, and social/video material. Use code-native motion for product UI and deterministic interfaces. Use Remotion/ffmpeg/Playwright to package, capture, composite, and verify.

## Provider Matrix

| Provider | Best Use | Current Notes | Recommended Role |
| --- | --- | --- | --- |
| Codex built-in `image_gen` | Fast image generation/editing inside Codex | Default path from the local `imagegen` skill. Does not require `OPENAI_API_KEY`. | First-pass visual direction, style frames, site assets, mockups, references. |
| OpenAI GPT Image 2 | High-quality image generation/editing via API/CLI | Official docs list `gpt-image-2` as the latest GPT Image model. | API/CLI path for production-grade image batches and high-control image workflows. |
| OpenAI Sora | Text/image to video with audio; creation, extension, editing, management | Official Videos API exposes Sora video workflows. | High-end cinematic clips and image-to-video when OpenAI API access is preferred. |
| xAI Grok Imagine | Image, image editing, text/still-to-video, video editing | Official docs expose Imagine API; Grok Imagine Video 1.5 supports image-to-video with 480p/720p and per-second pricing. | Fast social loops, stylized motion, anime/cyberpunk/retro tests, audio-synced clips. |
| Google Veo / Flow | High-fidelity 8-second video with native audio; 720p/1080p/4K; first/last frame control | Veo 3.1 is available programmatically through Gemini API. | Premium brand scenes, controlled cinematic references, first/last-frame storyboards. |
| Luma Dream Machine / Ray | Text-to-video, image-to-video, creative-agent workflows | Official Dream Machine API supports image and video jobs with async polling. | Cinematic exploration, concept-to-motion, mood variants. |
| Runway | Video generation and editing; Gen/Aleph models; API at scale | Runway API supports generative models and video editing with prompts/keyframes. | Production video editing, existing video transformation, enterprise-ready API lane. |
| Higgsfield | Social/ad video, image/video generation, creator-friendly production | Official JS SDK exists; server-side v2 client uses key credentials and polling. | Trend/social-ad formats, fast creator video tests, commercial social production. |
| Remotion | Deterministic React video, captions, brand layout, exports | Already present in local estate through AnimeLegends and Starlight/Cosmos. | Final assembly, typography, overlays, lower thirds, explainers, GIF/MP4 variants. |
| Playwright | Real browser capture | Already present in Arcanea and other local repos. | Capture web motion into screenshots/video for QA and social demos. |
| ffmpeg | Compression, transcode, GIF/MP4/WebM, palette optimization | Local binary exists; Starlight/Cosmos has ffmpeg MCP package. | Final export and automation layer. |

## Selection Rules

Use **Codex imagegen / GPT Image 2** for:

- brand style frames
- website hero images
- visual references
- product mockups
- infographic drafts
- character sheets
- poster frames

Use **Sora / Veo / Grok / Luma / Runway / Higgsfield** for:

- cinematic clips
- image-to-video animation
- social ads
- music visuals
- mood films
- b-roll-style generated scenes
- motion studies before code implementation

Use **Remotion** when:

- text must be exact
- layout must be deterministic
- multiple formats are needed
- the video is a product demo, explainer, or branded template
- generated clips need captions, cards, overlays, or final packaging

Use **Playwright** when:

- the source of truth is a website/app
- we need proof that the real UI motion works
- the goal is a GIF/video of the actual product

Use **ffmpeg** when:

- the output needs compression
- a GIF must be palette-optimized
- aspect ratios or codecs need variants
- assets need final delivery sizes

## Strong Recommendation

For FrankX, Arcanea, and Starlight, do not choose one "winner" video model. Build a routing layer:

- OpenAI imagegen/GPT Image 2 for static visual strategy.
- Sora/Veo/Grok/Luma/Runway/Higgsfield as generation providers.
- Remotion as the deterministic finishing suite.
- Playwright/ffmpeg as proof and export.
- Starlight Motion Designer MCP as the orchestration brain.

## Safety And Legal Notes

- Do not generate likenesses of real people for commercial use without rights.
- Do not use platform outputs in client work until that provider's commercial terms are checked.
- Keep prompts, input references, provider, model, generated outputs, and licenses in provenance metadata.
- Avoid providers or modes with weak deepfake/NSFW controls for brand-safe public workflows.
- Treat unofficial provider APIs as experimental until reviewed.

## Sources

- OpenAI Image Generation docs: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI Sora Video Generation docs: https://developers.openai.com/api/docs/guides/video-generation
- xAI Imagine docs: https://docs.x.ai/developers/model-capabilities/imagine
- Google Veo Gemini API docs: https://ai.google.dev/gemini-api/docs/video
- Luma Dream Machine API docs: https://docs.lumalabs.ai/docs/api
- Runway API docs: https://docs.dev.runwayml.com/
- Higgsfield JS SDK: https://github.com/higgsfield-ai/higgsfield-js

