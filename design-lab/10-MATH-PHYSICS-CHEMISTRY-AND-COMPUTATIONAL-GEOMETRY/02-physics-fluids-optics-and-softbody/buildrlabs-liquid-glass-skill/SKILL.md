---
name: gemini-liquid-glass-ui
description: Build a swipe-up liquid glass welcome screen (refractive dome, RGB dispersion, crown caustic, docked button, orbiting badges) in the Gemini Agent obsidian/starlight palette. Stack is React Native + Expo + @shopify/react-native-skia (SkSL runtime shader as a BackdropFilter) with Reanimated 4 + Gesture Handler; or a single-file HTML5 Canvas/WebGL prototype of the same shader. Use for liquid glass onboarding or welcome screens, refractive dome or lens effects, Wabi-style or liquid-glass-screens-style hero gestures, and Gemini-themed mobile intros. Do NOT use for native SwiftUI/UIKit iOS 26 Liquid Glass (.glassEffect, use the liquid-glass skills), CSS backdrop-filter glassmorphism cards, Flutter, Figma or static mockups, or full-app UI beyond the welcome surface.
---

# Gemini Liquid Glass UI

One gesture, one lens, one CTA. A glass dome rests on the bottom edge, refracting an aurora; the user swipes it up, it shrinks into a docked button, the crown flares, badges orbit out, and the headline and pill CTA appear.

## When to use which file

| Need | Read |
| --- | --- |
| The optics (refraction, dispersion, Fresnel rim, crown caustic) and every uniform | `references/dome.sksl` |
| Gesture, spring, progress-to-uniform mapping, docking, badges, fallbacks | `references/DomeScreen.tsx` |

Copy both into the app (e.g. `src/welcome/`), then theme and tune. Do not rewrite the shader from scratch; change uniforms first.

## Setup (RN + Expo)

```bash
npx expo install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-worklets react-native-safe-area-context expo-haptics
npm i -D babel-plugin-inline-import
```

- `babel.config.js` plugins: `["inline-import", { extensions: [".sksl"] }]`, then `npx expo start -c`.
- Add `declare module '*.sksl' { const src: string; export default src; }` to a `.d.ts`.
- Requires a dev build (`expo run:ios|android`), not Expo Go, if your Skia version isn't bundled there.

## Tokens

| Token | Value |
| --- | --- |
| `background` | `#090A0F` Deep Space Obsidian |
| `horizonGlow` | `#1A2342` Nebula Indigo |
| `primaryAccent` | `#4B90FF` Gemini Starlight Blue |
| `secondaryAccent` | `#A87FFB` Cosmic Violet |
| `causticHighlight` | `#FF6B8B` Aurora Coral (crown only, nowhere else) |
| `ior` / `chromaticDispersion` | `1.48` / `0.038` |
| Dome radius | `210` → `34` pt, authored at 402 pt wide, scaled by `width / 402` |
| Dome centre | bottom edge → `54%` of height |
| Spring | `{ damping: 18, stiffness: 160 }`, release velocity passed in |

## Mechanics (how)

1. **Rest (`progress = 0`)**: dome centred on the bottom edge; barrel magnification from `z = sqrt(max(0, 1 - r²))`.
2. **Drag (`0..1`)**: finger moves the centre 1:1 over the travel; radius interpolates linearly with progress; 25% rubber band past either end.
3. **Crown caustic**: `pow(r, 3.2)` Fresnel × crown mask × `u_force` (upward finger velocity, smoothed). Dark when idle, coral when pushed.
4. **Release**: project `progress + 0.15 × velocity`; > 0.5 docks. Spring to target. Landing gives one haptic and a brief crown flare (the peak-end moment).
5. **Docked (`> 0.97`, un-docks `< 0.80`)**: badges orbit out, headline + pill fade in (420 ms). Hint fades out as soon as the user drags.

## Layout rules

- Primary CTA pill in the thumb zone: `bottom = insets.bottom + 24`, height ≥ 52, full-width minus 24 margins. One CTA only.
- Docked button diameter 68 pt (≥ 44 pt target). Tapping the dome docks it too; swipe is never the only way in.
- ≤ 6 orbit badges. Coral appears only in the caustic so it stays the single standout.
- Content refracted by the lens must be drawn in the Skia `<Canvas>` *before* `<BackdropFilter>`. RN views above the canvas are not refracted.

## Fallbacks and accessibility

- **Reduce Motion** (`useReducedMotion`): timing (220 ms) instead of spring, no caustic flare, aurora and orbit frozen, copy appears in place.
- **Reduce Transparency** (iOS `AccessibilityInfo.isReduceTransparencyEnabled`) or **shader compile failure** (`RuntimeEffect.Make` returns null): no backdrop filter; draw a solid indigo disc with a starlight stroke at the same centre/radius. Gesture and layout are unchanged.
- **Screen readers**: the dome is an accessible button ("Open" / "Close", hint "Swipe up or double tap") supporting the `activate` action. The CTA is hidden from the accessibility tree until docked. Badges are decorative (`accessible={false}`).
- **Contrast**: headline `#FFFFFF` and body `#C9D3F0` on `#090A0F`; CTA label `#090A0F` on `#4B90FF` (≈ 6.5:1).
- **Low-end Android**: clip the backdrop filter to the dome bounds (already done) and drop aurora blur sigma to 40 if frames drop.
- **Web prototype**: port `dome.sksl` to GLSL ES fragment shader: `uniform sampler2D u_image`, `image.eval(p)` → `texture2D(u_image, p / u_resolution)`, flip y, multiply pixel uniforms by `devicePixelRatio`. Fallback to a CSS radial-gradient disc when WebGL is unavailable.

## Done when

- [ ] Dome responds on the first frame of the drag (no delay, no loading state) and holds 60 fps on a mid-range Android.
- [ ] Refraction magnifies the interior, edges shear, and the RGB split is visible at the rim but not in the centre.
- [ ] Caustic is dark at rest, coral on an upward push, and flares once on landing.
- [ ] Fling up docks; weak drag returns; drag down from docked returns to the dome.
- [ ] Haptic fires once per dock, never on un-dock.
- [ ] CTA sits in the thumb zone, is inert until docked, and is reachable by VoiceOver/TalkBack.
- [ ] Double-tap on the dome (screen reader) docks without a swipe.
- [ ] Reduce Motion and Reduce Transparency each tested on device; shader-failure fallback tested by passing a broken source.
- [ ] No coral outside the caustic; all text meets 4.5:1.

## Provenance

Inspired by Wabi's welcome gesture and Appllama's `liquid-glass-screens` (GPL-3.0). The references here are written independently; do not paste code from that repo into a closed-source app.
