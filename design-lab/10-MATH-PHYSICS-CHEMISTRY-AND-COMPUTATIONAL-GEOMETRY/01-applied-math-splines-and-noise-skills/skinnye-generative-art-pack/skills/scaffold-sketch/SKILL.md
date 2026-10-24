---
name: scaffold-sketch
description: Scaffold a new generative / creative-coding sketch from scratch with a clean, seeded, reproducible setup (Vite + p5.js instance mode, or a zero-build vanilla canvas + GLSL starter). Use when the user wants to START a new generative art piece, p5.js sketch, or creative-coding project skeleton.
---

# Scaffold a generative sketch

Set up a clean, reproducible starting point. Confirm the two choices (or pick the default and state it), then build.

## Choices
1. **Setup**: `vite-p5` (Vite + p5.js, default — best DX) or `vanilla` (single HTML, p5 via CDN, zero build).
2. **Mode**: `static` (one-shot image, re-roll on click — default) or `animated` (loop).

## Vite + p5.js (default)
```bash
npm create vite@latest my-sketch -- --template vanilla
cd my-sketch
npm i p5
```

`src/sketch.js` — instance mode, seeded, re-rollable:
```js
import p5 from 'p5'

const params = {
  seed: Math.floor(Math.random() * 1e9),
  // your knobs here:
  count: 1200,
}

new p5((p) => {
  let palette

  const reseed = () => {
    params.seed = Math.floor(Math.random() * 1e9)
    p.randomSeed(params.seed); p.noiseSeed(params.seed)
    build(); p.redraw()
    console.log('seed', params.seed)
  }

  function build() {
    palette = ['#0c0a0d', '#ff6b5c', '#ffb347', '#3ad6c5', '#e85aff']
  }

  p.setup = () => {
    p.createCanvas(900, 1200)            // portrait; pick your ratio
    p.pixelDensity(Math.min(p.displayDensity(), 2))
    p.randomSeed(params.seed); p.noiseSeed(params.seed)
    build()
    p.noLoop()                            // static piece → redraw on demand
  }

  p.draw = () => {
    p.background(palette[0])
    // --- your generative code here ---
    p.noStroke()
    for (let i = 0; i < params.count; i++) {
      const x = p.random(p.width), y = p.random(p.height)
      p.fill(p.random(palette.slice(1)))
      p.circle(x, y, p.random(2, 10))
    }
  }

  // re-roll the seed on click / "R"
  p.mousePressed = reseed
  p.keyPressed = () => { if (p.key === 'r' || p.key === 'R') reseed() }
})
```

Run `npm run dev`, confirm it renders and that clicking re-rolls a new variation (and logs the seed).

## Vanilla (zero build)
Single `index.html` with p5 from CDN:
```html
<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#0c0a0d;display:grid;place-items:center;min-height:100vh">
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.0/lib/p5.min.js"></script>
<script>
let seed = Math.floor(Math.random()*1e9)
function setup(){ createCanvas(900,1200); randomSeed(seed); noiseSeed(seed); noLoop() }
function draw(){ background('#0c0a0d'); /* ... */ }
function mousePressed(){ seed=Math.floor(random(1e9)); randomSeed(seed); noiseSeed(seed); redraw() }
</script>
</body>
```

## Always
- **Seed everything** (`randomSeed`/`noiseSeed`) and log/surface it so any output is reproducible.
- Put the tweakable values in a `params` object at the top.
- Choose a deliberate canvas ratio (square 1:1, portrait 3:4, print A-series) up front.

## Hand off
- The algorithm → **generative-systems**; visuals on GPU → **shader-artist**; palette → **color-composition**; export/series → **art-export-engineer** (skills: `/flow-field`, `/export-art`, `/generative-series`).

Check current p5 version/APIs before scaffolding if unsure.
