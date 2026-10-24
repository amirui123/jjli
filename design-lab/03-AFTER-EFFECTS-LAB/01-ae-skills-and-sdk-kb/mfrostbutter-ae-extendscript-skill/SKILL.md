---
name: after-effects-extendscript
description: >-
  Build and edit After Effects motion graphics from scratch with ExtendScript
  (.jsx) — comps, text, typing-on effects, expression-driven tracking, keyframes
  with easy-ease, shape/polystar elements (sparkles, glints), and timed audio.
  Use whenever the task is to author or change an AE script, build a title /
  splash / lower-third / logo animation, sync animation to a sound effect, or
  drive layers by expression. Encodes the hard-won rules: ExtendScript is ES3
  (no const/let/arrow/template-literals), the property matchname cheatsheet, the
  sourceRectAtTime layout+tracking pattern, Source Text typing expressions,
  per-dimension KeyframeEase, server-side font resolution with graceful
  fallback, AE-can't-import-Opus (convert with ffmpeg), and the ffmpeg
  silencedetect → audio-sync recipe.
---

# After Effects via ExtendScript (.jsx)

After Effects is scripted with **ExtendScript** against the AE scripting DOM (`app`, `comp`, layers, properties). A `.jsx` builds a comp deterministically and is fully parameterized — the right tool for repeatable, brand-locked motion (intros, titles, logo animations) where you want a `CONFIG` block instead of hand-keyframing.

There is **no AE MCP**. You write the script; the user runs it in AE and renders/previews to verify. Treat the render (a frame or clip the user shares) as the feedback loop — build, ask for a render, read it, fix, repeat. There is also no automated screenshot; favor a `CONFIG` block + an end-of-run `alert()` summary so the user can self-tune.

## Run + verify model

- Run: AE → `File > Scripts > Run Script File...` → pick the `.jsx`. No project/comp setup needed if the script builds its own.
- Syntax-check locally before handing off: `node` rejects the `.jsx` extension, so `cp script.jsx _check.js && node --check _check.js && rm _check.js`. This catches parse errors; it does NOT validate AE DOM calls.
- Headless render (optional): `aerender` CLI can render a comp for an automated check, but it needs AE installed and is heavy — default to the user previewing.

## ExtendScript is ES3 — write accordingly

- `var` only. **No** `const`/`let`, arrow functions, template literals, destructuring, or `for...of`. Use function declarations, `for` loops, and string concatenation. `===`, `try/catch`, `Array.push` are fine; avoid `Array.forEach`/`map` (spotty).
- Wrap mutations in `app.beginUndoGroup("...")` / `app.endUndoGroup()`, and the whole body in `try/catch` ending with an `alert()` so failures surface.
- Build expression strings by concatenation and inject CONFIG numbers/strings at build time (expressions can't read your CONFIG). Escape injected strings (`'"' + s.replace(/"/g,'\\"') + '"'`). Newlines in expression source: `\r`.

## Core principles

1. **Anchor at the origin, then measure.** For text layout set `Anchor Point = [0,0]` (baseline-left), then `layer.sourceRectAtTime(0, false)` → `{left, top, width, height}` relative to that anchor. Left-edge placement: `position.x = desiredLeft - rect.left`; baseline `position.y = baselineY`. Vertical-center off the tallest glyph: `baselineY = compH/2 - (rect.top + rect.height/2)`. The same `sourceRectAtTime` convention holds in expressions, so build-time layout and expression-time tracking agree.
2. **Prefer expressions over keyframes for anything derived.** Typing-on, edge-tracking, blinking — all are one expression and need no rebuild when strings change.
3. **CONFIG at the top.** Every tunable (strings, fonts, colors as hex, sizes, timings) in one object. Colors: store hex, convert to 0–1 RGB. This is what makes the script reusable and brand-switchable.
4. **Verify state before reading children.** `app.project` always exists. For multi-page/precomp work, set the active item before reading its layers.

## Property matchname cheatsheet

Use matchnames (stable across locales), not display names:

- Transform: `ADBE Transform Group` → `ADBE Anchor Point`, `ADBE Position`, `ADBE Scale`, `ADBE Rotate Z` (2D rotation), `ADBE Opacity`.
- Text source: `layer.property("ADBE Text Properties").property("ADBE Text Document")` — `.value` is a `TextDocument`; mutate it then `setValue(doc)`. Put a typing expression on this property's `.expression`.
- Shape layer: `ADBE Root Vectors Group` → `addProperty("ADBE Vector Group")` → `.property("ADBE Vectors Group")` → `addProperty("ADBE Vector Shape - Star")` (or `...- Rect`, `...- Ellipse`) + `addProperty("ADBE Vector Graphic - Fill")`. Fill color via `.property("ADBE Vector Fill Color").setValue([r,g,b,1])`.
- Polystar: `ADBE Vector Star Type` (1 = star, 2 = polygon), `ADBE Vector Star Points`, `ADBE Vector Star Outer Radius`, `ADBE Vector Star Inner Radius`, and the **misspelled** `ADBE Vector Star Outer Roundess` / `ADBE Vector Star Inner Roundess` (wrap in try/catch). A 4-point star with inner radius ≈ 0.16×outer = a sparkle/glint.

## TextDocument gotchas

- Set `applyFill=true` + `fillColor=[r,g,b]`, `applyStroke=false`, `justification` (use `ParagraphJustification.LEFT_JUSTIFY` for left-anchored growth), then `text`, then `setValue(doc)`.
- AE style names use spaces: `"Semi Bold"`, `"Extra Bold"` — not `"SemiBold"`.

## Fonts: PostScript names + graceful fallback

`TextDocument.font` wants a **PostScript name**, not a family name. Resolve family→PS via `app.fonts.getFontsByFamilyNameAndStyleName(family, style)` or by scanning `app.fonts.allFonts` when that API exists; otherwise trust your first guess (AE substitutes a missing font rather than erroring). Pattern: `resolvePS(family, style, guessList, fallbackPS)` returning a PS name; fallbacks like `Consolas` (mono) / `ArialMT` (sans). See `assets/helpers.jsx`.

**AE renders only SYSTEM-installed fonts.** A brand's *web* font (e.g. one loaded via a Google Fonts `@import` in a webapp) is invisible to AE — it silently falls back (you'll see `Arial-BoldMT` in the build alert). To actually match an in-app wordmark, install the font on the OS first. Windows per-user install (no admin), then **restart AE**: copy the static `.ttf`s to `%LOCALAPPDATA%\Microsoft\Windows\Fonts` and add `HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts` values like `"Inter Bold (TrueType)"` = the full font path. Have the script's alert print the resolved PS name and warn if the family didn't resolve, so a silent substitution is caught.

## Keyframes + easy-ease

Set values with `prop.setValueAtTime(t, v)`, then per key: `setInterpolationTypeAtKey(i, BEZIER, BEZIER)` and `setTemporalEaseAtKey(i, easeIn, easeOut)` where each ease array has **one `new KeyframeEase(0, 33)` per value dimension** — 1 for opacity/rotation, 2 for `Scale [x,y]`. **Exception: spatial properties (Position) take a SINGLE element regardless of dimensionality** — passing 2 to a keyframed Position throws `Unable to call "setTemporalEaseAtKey" ... Value array does not have 1 elements`. Gate on `prop.isSpatial` (use 1) vs `prop.value.length`. Wrong length throws. `easeAll(prop)` in `assets/helpers.jsx` handles this.

## Patterns

- **Typing-on:** Source Text expression `n=(time<ts)?0:Math.floor((time-ts)/iv)+1; s.substr(0,n)`. Measure the full string first for layout, then apply the expression.
- **Edge tracking:** drive a follower's `position.x` off the typed layer's `sourceRectAtTime` so a closing bracket / caret tracks the growing text. See `reference/audio-sync.md` and `assets/helpers.jsx` (`edgeTrackExpr`).
- **Blink:** opacity expression gated to a window: `(time<ts||time>te)?0:(Math.floor((time-ts)*hz*2)%2===0?100:0)`.
- **Sparkle/glint:** a polystar that scales `0→peak→0`, slow-rotates, and flashes opacity, timed to a beat (e.g. a ding). `makeSparkle` + `animSparkle` in helpers.
- **Audio sync:** see **`reference/audio-sync.md`** — convert non-WAV with ffmpeg, extract onsets with `silencedetect`, import + `layer.startTime`, lock the typing interval to the recording.

## Portability + render

- Resolve bundled assets relative to the script: `(new File($.fileName)).parent.fsName + "/sfx/"`. Bundle SFX/images next to the `.jsx`.
- Transparent background = **no solid layer** (comps are transparent by default). Render with an alpha codec (ProRes 4444 / PNG sequence) and **Audio Output On**.

## Committing AE scripts (secret scanners)

High-entropy asset filename literals (e.g. `keystrokes-14.wav`) inside a `.jsx` can trip a secret scanner's `generic-api-key` rule. Path-allowlist the script in your scanner config rather than renaming the asset.

## Keep a canonical example

Maintain one CONFIG-driven reference script in your repo and point new work at it. A good intro/splash reference exercises the whole toolkit in one file: transparent 1920×1080 / 30fps, a two-tone-capable wordmark, expression typing + an edge-tracked bracket + a blinking caret, timed keystroke/enter/ding SFX locked to the typing, and a polystar sparkle on the ding. When the code and this skill disagree, the code wins — update the skill.
