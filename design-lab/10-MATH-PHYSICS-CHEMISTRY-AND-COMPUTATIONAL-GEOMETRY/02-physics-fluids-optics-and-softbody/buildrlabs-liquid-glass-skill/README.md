# Gemini Liquid Glass UI

One gesture, one lens, one CTA. A glass dome rests on the bottom edge,
refracting an aurora; the user swipes it up, it shrinks into a docked
button, the crown flares, badges orbit out, and the headline and pill CTA
appear.

## Stack

React Native + Expo + `@shopify/react-native-skia` (SkSL runtime shader as
a `BackdropFilter`), Reanimated 4 + Gesture Handler. A single-file
HTML5 Canvas/WebGL prototype of the same shader is also possible.

## Files

- `SKILL.md` — the skill: mechanics, layout rules, tokens, fallbacks
- `references/dome.sksl` — the optics: refraction, dispersion, Fresnel rim,
  crown caustic, every uniform
- `references/DomeScreen.tsx` — gesture, spring, progress-to-uniform
  mapping, docking, badges, fallbacks

Copy both references into the app (e.g. `src/welcome/`), then theme and
tune. Do not rewrite the shader from scratch; change uniforms first.

## Palette (Gemini Agent obsidian/starlight)

Deep Space Obsidian `#090A0F`, Nebula Indigo `#1A2342`, Gemini Starlight
Blue `#4B90FF`, Cosmic Violet `#A87FFB`, Aurora Coral `#FF6B8B` (crown
only, nowhere else).

## Provenance

Inspired by Wabi's welcome gesture and Appllama's `liquid-glass-screens`
(GPL-3.0). The references here are written independently; do not paste code
from that repo into a closed-source app.
