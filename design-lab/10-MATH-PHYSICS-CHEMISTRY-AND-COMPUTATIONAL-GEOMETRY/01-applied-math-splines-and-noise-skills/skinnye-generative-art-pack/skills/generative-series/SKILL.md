---
name: generative-series
description: Set up a deterministic, hash-seeded generative SERIES / editions (fxhash or Art Blocks style) — one codebase that produces a unique, reproducible artwork per token hash, with named features/traits and rarity, and a deterministic preview. Use when the user wants an edition, a mint-ready generative project, or "1 of N" reproducible variations.
---

# Hash-seeded generative series

A series is one sketch that yields a unique piece per hash, and the **same hash always yields the same piece**. Everything random must flow from a single seeded RNG derived from the hash.

## 1. Deterministic RNG from the hash
Never call `Math.random()`. Seed a small PRNG from the token hash.

fxhash provides `$fx.rand()` (uniform 0..1, deterministic from the token). Wrap it:
```js
// fxhash: $fx.rand() is already deterministic per token
const R = () => $fx.rand()
```

Generic / Art Blocks-style (hash → seeded PRNG):
```js
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296 } }
function seedFromHash(hash){ let h=1779033703^hash.length; for(let i=0;i<hash.length;i++){ h=Math.imul(h^hash.charCodeAt(i),3432918353); h=h<<13|h>>>19 } return h>>>0 }
const R = mulberry32(seedFromHash(tokenData.hash))   // Art Blocks: tokenData.hash
```
Use `R()` for *all* randomness; derive helpers: `rint=(a,b)=>Math.floor(a+R()*(b-a))`, `pick=arr=>arr[Math.floor(R()*arr.length)]`.

## 2. Define features / traits
Pick high-level choices from `R()` and expose them so platforms can index rarity:
```js
const PALETTES = { Ember:['#ff6b5c','#ffb347'], Tide:['#3ad6c5','#5b8cff'], Orchid:['#e85aff','#7c5cff'] }
const paletteName = pick(Object.keys(PALETTES))
const density = pick(['Sparse','Balanced','Dense'])
const technique = R() < 0.15 ? 'Rare-Variant' : 'Classic'   // rarity via thresholds

// fxhash:
$fx.features({ Palette: paletteName, Density: density, Technique: technique })
// Art Blocks: expose window.$generativeTraits or log for the script
```
Draw the piece deterministically from these traits + `R()`.

## 3. Deterministic preview
Platforms snapshot a still. Make sure the canvas reaches its final, stable frame quickly (or signal readiness):
```js
// fxhash: call when the artwork is rendered and ready to capture
$fx.preview()
```

## 4. Project hygiene
- Self-contained bundle; **pin** library versions (no CDN drift).
- Fixed aspect ratio; scale all sizes relative to canvas so it renders at any resolution (thumbnail → print).
- Test determinism: render the same hash twice → pixel-identical. Render many random hashes → variety without ugly outliers (clamp the bad regions of your parameter space).
- Keep a `?seed=` / hash override for local testing so you can browse the space.

## 5. Sanity checklist before mint
- [ ] No unseeded randomness anywhere (search for `Math.random`).
- [ ] Same hash → identical output (verified).
- [ ] Features exposed and rarities feel right across ~100 sample hashes.
- [ ] Renders cleanly at low and very high resolution.
- [ ] Preview/capture fires at the right moment.

## Hand off
- The art itself → **generative-systems** / **p5-sketch-engine** / **shader-artist**; palette as a trait → **color-composition**; high-res/video capture → **art-export-engineer** (`/export-art`).
