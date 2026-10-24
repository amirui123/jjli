---
name: export-art
description: Export a generative sketch for the real world — high-resolution print-ready stills (raster or SVG) and smooth video/GIF loops from an animation (CCapture.js, WebCodecs, ffmpeg). Use when a sketch is finished and the user wants to save a crisp image, a print, or a clip to share on social.
---

# Export generative art

Display resolution ≠ export resolution. Render large only when exporting, keep sizes relative so scaling doesn't break the composition, and always preserve the seed so the output is reproducible.

## High-res still (p5.js)
Render to an offscreen graphics buffer at a higher scale, then save:
```js
function exportHiRes(scale = 4) {
  const g = createGraphics(width * scale, height * scale)
  g.pixelDensity(1)
  randomSeed(params.seed); noiseSeed(params.seed)   // reproduce the exact piece
  drawInto(g, scale)                                 // your draw, parameterized by target + scale
  save(g, `art_${params.seed}.png`)
  g.remove()
}
```
- Make stroke weights / radii proportional to canvas size (e.g. `width * 0.002`) so they scale cleanly.
- **Print sizing**: pixels = inches × 300. A3 (11.7×16.5in) @300dpi ≈ 3508×4961px. Compute the scale to hit that.
- **SVG** for vector pieces (packing, tiling, line work) → use `p5.svg` (`createCanvas(w, h, SVG)`) for infinite-resolution print.

## Video / GIF loop
**Perfect loop**: drive all motion by normalized time `t = frame / TOTAL` so the last frame meets the first.

CCapture.js (frames → WebM/PNG seq):
```html
<script src="https://cdn.jsdelivr.net/npm/ccapture.js@1.1.0/build/CCapture.all.min.js"></script>
```
```js
const TOTAL = 360
const capturer = new CCapture({ format: 'webm', framerate: 60 })
let frame = 0, recording = false
function startRec(){ recording = true; capturer.start() }
function draw(){
  const t = (frame % TOTAL) / TOTAL          // 0..1 loop
  renderFrame(t)
  if (recording) { capturer.capture(document.querySelector('canvas')); if (++frame >= TOTAL) { recording = false; capturer.stop(); capturer.save() } }
}
```

ffmpeg (PNG sequence → MP4 / high-quality GIF):
```bash
# MP4 (web/social safe)
ffmpeg -framerate 60 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart out.mp4
# GIF with a generated palette (crisp colors)
ffmpeg -i out.mp4 -vf "fps=30,scale=720:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i out.mp4 -i palette.png -lavfi "fps=30,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse" out.gif
```
(ffmpeg is a separate install; on modern browsers `WebCodecs` `VideoEncoder` can encode MP4/WebM directly in-page.)

## Always
- Capture/print the **seed** with the file name so any output can be regenerated.
- Never use unseeded `Math.random()` in the art path.
- Square (1:1) for IG, 9:16 for stories/reels, 16:9 for X/YouTube.

## Hand off
- A reproducible minted **series** (fxhash / Art Blocks, traits + hash) → `/generative-series` and **art-export-engineer**.
