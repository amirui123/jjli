# Image, Video, And GIF Production Workflow

## Default Rules

- Use Codex built-in `image_gen` for normal image work.
- Use CLI/API `gpt-image-2` only when explicit model/path control is needed.
- Use `gpt-image-1.5` only for confirmed native transparent-background fallback.
- Use generated images as style frames, references, poster frames, or source stills for image-to-video.
- Use code-native animation for product UI.
- Use Remotion for final deterministic video packaging.
- Use ffmpeg for delivery formats.

## Image Prompt Checklist

```text
Use case:
Asset type:
Primary request:
Input images:
Scene/backdrop:
Subject:
Style/medium:
Composition/framing:
Lighting/mood:
Color palette:
Materials/textures:
Text (verbatim):
Constraints:
Avoid:
```

## Video Prompt Checklist

```text
Output:
Aspect ratio:
Duration:
Provider candidates:
Source frame:
Subject:
Setting:
Camera:
Subject motion:
Environmental motion:
Audio:
Beginning:
Middle:
End:
Style:
Constraints:
Avoid:
```

## GIF Workflow From Web UI

1. Build or open the real web interaction.
2. Capture with Playwright.
3. Trim source video.
4. Convert with ffmpeg:

```bash
ffmpeg -i input.mp4 -vf "fps=15,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```

5. Check loop seam, file size, readability, and crop.

## Video Workflow From Generated Style Frame

1. Generate style frame with imagegen/GPT Image 2.
2. Save source frame with provenance.
3. Animate with provider router:
   - Sora for OpenAI-first cinematic video.
   - Veo for high-fidelity controlled scenes.
   - Grok for fast social/audio-synced clips.
   - Luma for cinematic exploration.
   - Runway for editing/generation pipelines.
   - Higgsfield for creator/social ad formats.
4. Select best take.
5. Finish in Remotion:
   - title
   - captions
   - overlays
   - logo/brand lockup
   - call-to-action
6. Export variants with ffmpeg.
7. Run QA and archive prompts/assets.

## Asset Provenance

Every final asset should record:

```yaml
asset_id:
title:
brand:
project:
created_at:
owner:
purpose:
source_prompt:
input_assets:
provider:
model:
settings:
output_files:
license_notes:
commercial_use_status:
people_or_likeness:
third_party_marks:
qa_verdict:
```

## Provider Decision Tree

- Need exact text/layout: Remotion, not raw video generation.
- Need product UI proof: Playwright capture.
- Need static visual direction: imagegen/GPT Image 2.
- Need cinematic clip with audio: Sora, Veo, Grok, Luma, Runway, or Higgsfield.
- Need social ad variants quickly: Higgsfield/Grok plus Remotion finishing.
- Need edited real video: Runway/Aleph-style tools, then Remotion/ffmpeg.
- Need premium world/mood: Veo/Luma/Sora with imagegen style frames.

