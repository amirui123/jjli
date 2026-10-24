# 12 — What is verified, and what isn't

The point of this page is that green CI must never be mistaken for *"tested"*.
Everything below is accurate as of sprint 3.

## Verified, automatically, on every push

| | How |
| --- | --- |
| Engine correctness | 142 unit tests — exact lattice arithmetic, isometries, hulls, kites, legal moves, alignment, palette colour-vision gates |
| The page renders | Browser smoke check: canvases backed at devicePixelRatio, not blank, drawn in many colours |
| The scenes teach what they claim | Hexagon floor clicks into alignment; hat tiling never does; the conclusion appears; the hierarchy redraws as it coarsens |
| Accessibility basics | Every control has an accessible name; one `h1`; `lang` set; every content scene has a standalone text takeaway |
| Degradation | With JavaScript off, no empty figures remain and 698 words of prose survive |
| Budgets | First contentful paint, total JavaScript ≤ 120 KB |

The smoke check runs in CI as of sprint 3. Before that it only ever ran locally,
which meant CI verified that the site *compiled*, not that it *worked*.

## Verified once, by hand, not on every push

- **Seven viewport sizes** — 320×568 up to 1440×900, including two landscape
  orientations. No horizontal scroll, no figure taller than its viewport.
- **Frame rate under a 4× CPU throttle** — 60 fps median on both interactive
  scenes; scene 5's zoom shows occasional ~92 ms frames, which is canvas
  rasterisation rather than JavaScript and cannot be cached away
  ([09](09-sprint-01.md) X1).
- **Heap** — flat across fifteen scene changes.
- **Colour-vision safety** — computed, and re-asserted in unit tests, so this one
  is actually continuous.

## ⚠️ Not verified at all

**Safari, and therefore most iPhones.** Every measurement in this repository
comes from Chromium. WebKit will not install in the development environment —
`npx playwright install webkit` exits 0 and downloads nothing. The harness
supports it (`npm run smoke:webkit`) and fails loudly rather than skipping, so
this cannot be mistaken for a pass. **This is the highest-value unrun check in
the project.**

Specific unknowns, in rough order of risk:

1. `setPointerCapture` under WebKit — historically buggy; a stuck or dropped
   drag would break scene 3 entirely.
2. Whether the drag and pinch gestures feel right under Safari's touch handling.
3. `mask-composite` — mitigated by a plain fallback plus `@supports`, but the
   mitigation itself is untested.
4. `color-mix` and `dvh` on Safari below 16.4 / 15.4 — fallbacks added, untested.

**Firefox.** Same situation, lower stakes.

**Any physical device.** Everything is emulation. A Pixel 7 viewport with a 4×
CPU throttle is a *model* of a mid-range Android, not one. Nobody has held this
in their hands.

**Any human reader.** No playtest has been run
([09](09-sprint-01.md) X2). The one time a real reader tried a scene, they did
not understand it and it had to be rebuilt from scratch — which is the strongest
evidence in this repo that the automated checks above do not measure whether the
thing teaches.

## How to close the gaps

```bash
npx playwright install webkit && npm run smoke:webkit   # the big one
npm run verify                                          # everything else
```

For the reader gap: five people, three of whom dislike maths, watched but not
helped. One question afterwards — *why can't it repeat?*
