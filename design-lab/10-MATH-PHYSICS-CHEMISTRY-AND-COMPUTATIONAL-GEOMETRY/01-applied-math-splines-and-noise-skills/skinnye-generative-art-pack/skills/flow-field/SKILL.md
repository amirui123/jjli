---
name: flow-field
description: Generate a flow-field sketch — the signature generative-art technique where particles trace a Perlin/simplex noise angle field, accumulating into flowing, organic, hair-like strokes. Use when the user wants a flow field, noise-driven particles, "silk/wind/marble" generative imagery, or an instant high-impact piece.
---

# Flow field

A noise field defines an angle at every point; particles walk along it leaving translucent strokes that accumulate into organic flowing forms. The most recognizable, highest-impact generative technique.

## Core idea
1. Scatter N particles.
2. Each step: sample `angle = noise(x * scale, y * scale [, t]) * TAU * turns`.
3. Move the particle along that angle; draw a faint line from old→new position.
4. Repeat for many steps; strokes overlap into flowing forms. Respawn particles that leave the canvas or exceed a lifetime.

## p5.js (static, re-rollable)
```js
const params = {
  seed: Math.floor(Math.random()*1e9),
  count: 1500,      // particles
  steps: 220,       // path length
  scale: 0.0016,    // noise frequency — smaller = smoother, longer flows
  turns: 2,         // how many full rotations the field spans
  step: 2.2,        // pixels per step
  alpha: 18,        // stroke alpha (lower = more layering)
}
const palette = ['#0c0a0d','#ff6b5c','#ffb347','#3ad6c5','#e85aff']

new p5((p) => {
  p.setup = () => {
    p.createCanvas(900, 1200)
    p.pixelDensity(Math.min(p.displayDensity(), 2))
    p.randomSeed(params.seed); p.noiseSeed(params.seed)
    p.noLoop()
  }
  p.draw = () => {
    p.background(palette[0])
    p.strokeWeight(1.1)
    for (let i = 0; i < params.count; i++) {
      let x = p.random(p.width), y = p.random(p.height)
      const c = p.color(p.random(palette.slice(1))); c.setAlpha(params.alpha)
      p.stroke(c)
      for (let s = 0; s < params.steps; s++) {
        const a = p.noise(x * params.scale, y * params.scale) * p.TWO_PI * params.turns
        const nx = x + Math.cos(a) * params.step
        const ny = y + Math.sin(a) * params.step
        p.line(x, y, nx, ny)
        x = nx; y = ny
        if (x < 0 || x > p.width || y < 0 || y > p.height) break
      }
    }
  }
  const reseed = () => { params.seed = Math.floor(p.random(1e9)); p.randomSeed(params.seed); p.noiseSeed(params.seed); p.redraw(); console.log('seed', params.seed) }
  p.mousePressed = reseed
  p.keyPressed = () => { if (p.key === 'r' || p.key === 'R') reseed() }
})
```

## Tuning (the sweet spot)
- **scale** is the master knob: `0.001–0.003` = long smooth flows; `0.005+` = tight turbulence.
- **alpha** low (`8–25`) + many particles = silky layered look; high alpha = harsh lines.
- **turns** `1–3`; higher adds swirl/chaos.
- Animate by adding a time term: `noise(x*scale, y*scale, t)` and don't `noLoop()`; fade with `background(col, 12)` each frame for evolving trails.
- **Curl noise** (divergence-free) gives smoother, non-converging flow than raw noise gradients — upgrade via **generative-systems** if particles clump.

## Variations
- Vary stroke weight by speed or noise value.
- Mask the field to a shape (text, circle) for figure/ground.
- Multiple noise octaves (fBm) for richer structure.

## Hand off
- Palette polish → **color-composition**; smoother math (curl/fBm) → **generative-systems**; high-res print or video loop → **art-export-engineer** (`/export-art`).
