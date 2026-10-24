# Jury report — index.html (Lumenvale) — 2026-10-20

disposition: fix
Design 7.6 · Usability 6.0 · Creativity 7.8 · Content 8.3 — weighted 7.23

> Offer: no `AWARDS.md` and no direction contract exist for this whole-site build; `/awards:craft` would write one so later juries can check contract fidelity.
> `--verdict` was requested, but there is no earlier `.awards/jury/*.md` fix list to check. This run is therefore a from-scratch baseline (sections 0–6). The next `--verdict` pass uses the fix list below as its checklist.
> `AWARDS.md` is absent, so the two Jury-log lines and the Status update could not be appended. They are reproduced at the end of this report for `awards:craft` or `awards:ship` to paste once the file exists.

## Evidence
- Environment: `doctor.mjs . --json` reported ready (Chromium 141.0.7390.37, headless WebGL2 available). It warned that there is no `package.json` or build step; the target is static HTML.
- Primary manifest: `.awards/captures/20261020T215616-jury-chapters/manifest.json`. Valid: yes. 0 page errors, 0 console errors, 0 failed requests. CLS is 0.0051 desktop, 0.0003 mobile and 0.0049 desktop-rm. 818 DOM nodes, WebGL true, `__awards` hook present, `scrollMode: hook`.
  - Scroll frames: `desktop-`, `mobile-` and `desktop-rm-` at s00, s12, s26, s32, s40, s50, s53, s66, s82 and s100. Thirty frames, all opened. None is blank, flat or a stuck preloader. s00, s50 and s100 differ (mean diff 17.8 desktop and 24.0 mobile).
  - Named states (plan replayed with `--states`, in desktop, mobile and desktop-rm): `kbd-tab1`, `kbd-skip`, `rail-2145`, `moon-full`, `book-open`, `book-submit-empty` and `book-escape`. All 21 succeeded and were opened.
- Baseline manifest: `.awards/captures/20261020T215425-jury/manifest.json`. Valid: yes, with 0 errors. It holds s00, s50 and s100 in all three viewports, plus the control frames `desktop-focus-1..3` and `desktop-hover-2..3`. Every control frame has `matched: true`, and all were opened.
- Resilience: `.awards/captures/20261020T215818-nogl/nogl-manifest.json` (desktop s00, `--no-webgl`). Valid. 0 errors, sky reported as `"2d"`.
- 404 evidence: `.awards/captures/20261020T215835-jury-404/manifest.json` was captured from `http://127.0.0.1:8765/index.html#nowhere`. The capture hook reset scroll to 0, so its frames show the hero rather than the 404.
  - `.awards/captures/20261020T220026-jury-404-states/manifest.json` failed every state with `target unreachable: undefined` (exit 2). capture.mjs does not handle navigation to a hash on the same document.
  - The 404 was therefore judged from supplementary Playwright probe frames, outside any manifest: `desktop-uncharted.png` and `mobile-uncharted.png`. In both, `#uncharted` is visible and scrolled into view, with focus on `#h-uncharted`.
- Coverage: there is no Page map, so the chapters come from the DOM `[data-chapter]` offsets.
  - Desktop: top 0 %, c2010 11.2 %, c2100 25.2 %, c2145 38.7 %, c2230 51.6 %, nights 65.3 %, close 97.9 %.
  - Mobile: 0, 8.0, 17.9, 27.4, 38.2, 50.2 and 96.8 %.
  - Every chapter has a desktop frame, and the desktop-rm frames mirror them. On mobile, the moon chapter falls between scroll stops and is covered by `mobile-state-moon-full.png` (scroll 0.204). Every other chapter is covered by mobile scroll frames.
- Reduced motion: `desktop-rm-s00` and `desktop-rm-s100` are pixel-identical to the full tier. The other chapters differ only in the sky (mean diff ≤ 0.96, and the diff bbox falls only in sky areas). No element is stuck.
- Audit: `.awards/audit.json` (2026-10-20). P0 0 · P1 0 · P2 0 · P3 1 (S06: no Open Graph image). No exceptions.
- Console and page errors: 0 in every manifest. The 404-states run is the exception, with 4 action errors caused by the capture tool rather than the page.
- `metrics.*.lcpColdSynthetic` reads 328, 80 and 132 ms. It is a headless cold-cache synthetic figure, used only as a rough asset-weight signal and never as a score. Whole-page gzip is 150,388 B, covering 2 woff2 fonts, GSAP, ScrollTrigger, Lenis and the page code.

## First-viewport inventory (written from `desktop-s00.png` before anything else was read)
The page sits on a warm near-black brown sky with only a few faint star specks. A two-line display headline is split across the screen. "Stay until" sits top-left in pale blush at about 100 px. "the stars arrive." is right-aligned in coral red at the same size, about 200 px lower, with empty sky between the two lines. Below it are two lines of body copy: "Lumenvale is a dark-sky observatory at 2,340 m in Graubünden. Twelve guests a night, from CHF 48." Under the copy is a coral filled rectangle, "Choose your night", which is the primary action. A second coral button, "Book a night", sits top right.

The header holds the wordmark on the left, a monospace row of times in the centre (19:40 active in coral with a dot, then 20:10, 21:00, 21:45, 22:30 and 00:45), and a mono readout on the right: "37 stars limit 2.7 mag". A mono caption bottom-left gives the live sky and its coordinates. Across the bottom runs a black ridge silhouette with a small observatory dome and a hut with one coral lamp. Type is one grotesque (display and body) plus one mono for data. Colour is three tokens: ground, blush ink and coral. Motion, read from the source rather than the still: scroll advances the clock and fills a WebGL sky with stars.

## Scores
| Axis (weight) | Score /10 | One-line reason |
|---|---|---|
| Design (40) | 7.6 | The world is committed and held everywhere: night-vision red on a warm near-black, one grotesque plus one mono, a themed scrollbar, selection, focus ring and favicon, an echo of the ridge and dome at the close (desktop-s100) and an authored 404. The seams: the signature sky barely reads on desktop, the close's 01:15 hides under the strip, a 16-row ledger runs with no rest on mobile, and there is no OG image. |
| Usability (30) | 6.0 | Capped at 6 by walk 1: in the full-motion tier the skip link leaves focus on itself. Walk steps 2 to 8 all pass. |
| Creativity (20) | 7.8 | One concept replaces the feature list: scroll is the night's clock (19:40 → 01:15), the sky fills toward 4,000 stars as eyes adapt, and the moon dial washes them out (desktop-state-moon-full). On desktop the arrival is a faint dust rather than a sky, so the medium enacts the idea only partly. |
| Content (10) | 8.3 | It uses numbers, not adjectives: 30 min, 620 nm, 6.9 mag, 508 mm (20 in), 2,340 m (7,677 ft), and per-night meet times, moon %, star counts and seats. The 404 and footer copy are authored. Seats and star counts are generated per night, and no `AWARDS.md` exists to label them as synthetic. |
| **Weighted** | **7.23** | 7.6×0.4 + 6.0×0.3 + 7.8×0.2 + 8.3×0.1. The weighted score clears 7.2, but Usability is below 6.8, so this is not Site of the Day territory. |

| Developer criteria | Score /10 | Note |
|---|---|---|
| Animation and interaction | 8.2 | One clock drives everything: GSAP ticker → Lenis → ScrollTrigger → sky (index.html:2172-2184, `lagSmoothing(0)`). The scrubbed shutter uses `ease: 'none'` (index.html:2265). There is one masked heading reveal per chapter (index.html:2245-2252), no `will-change`, and full, reduced and static tiers. |
| Performance | 8.0 | 150 KB gz for everything, with no rasters, DPR capped (index.html:1597) and CLS ≤ 0.0051. The WebGL sky is inline rather than a lazy chunk, and the fonts are base64 inside the HTML, so they cannot be cached separately. |
| Responsive | 8.3 | The phone layout is designed, not shrunk: the rail drops to a second header row, the readout is trimmed and the ledger reflows (mobile-s00, mobile-s66). There is no overflow at 390 or 320 px (scrollWidth equals innerWidth), and rail targets are 48×44. |
| Accessibility and semantics | 6.9 | Strengths: landmarks, one h1, `lang`, an `aria-hidden` canvas with all text in the DOM, sr-only rail labels, a native modal dialog with focus return, and `aria-valuetext` on the dial. Against that, the skip link is broken in the default tier (index.html:287 + 2207-2211), and the colophon is 14 px muted text at about 4.7:1. |
| Code quality | 7.8 | 0 console and page errors and 0 failed requests. No debug output was found. Fallback probes call `loseContext()`. The only finding is S06 (P3, no `og:image`, index.html:10-12). |

## Usability walk
- walk 1 — fail — In the full-motion tier, Enter on "Skip to the night" leaves `document.activeElement` on the skip link, and the next Tab lands on the header wordmark instead of inside `<main>` (desktop-state-kbd-skip.png, mobile-state-kbd-skip.png; a live probe gave tab2 = `A.strip__mark`). The cause has three parts:
  - The click handler calls `preventDefault()` (index.html:2201).
  - `focusTarget()` then focuses the h1 (index.html:2207-2211).
  - `.hero__title { display: contents; }` (index.html:287) gives the h1 no box, so `.focus()` does nothing.

  Every link to `#top` (the logo, rail 19:40 and "Back to 19:40") fails the same way. The reduced tier passes (desktop-rm-state-kbd-skip.png lands on "Choose your night"). Every other item passes:
  - The focus ring is in the world's own style (desktop-focus-1..3).
  - The dialog is a native modal: Escape closes it and focus returns to its Book button (desktop-state-book-escape.png).
  - The dial moves on arrow keys (Day 0 → 2).
  - PageDown, Space and ArrowDown move the Lenis scroll (0 → 787 → 1574 → 1614).
  - There is no preloader.

  Usability is capped at 6.
- walk 2 — pass — There is no custom cursor or magnetic effect, and nothing is hover-only. The dial is a native range with chips, mobile rail targets are 48×44, and the rail stays visible on mobile (mobile-s00).
- walk 3 — pass — The rm frames are readable at rest and match the full tier. The moon dial, booking and Escape all still work (desktop-rm-state-moon-full, desktop-rm-state-book-open, desktop-rm-state-book-escape). Lenis is off. There is no global kill; the motion is shortened by tokens (index.html:89-95, 583-591).
- walk 4 — pass — There is no gate, and content is present at first paint. The 1.4 s entrance is recorded in sessionStorage (index.html:2294-2295).
- walk 5 — pass — s00 answers what (a dark-sky observatory, 2,340 m, Graubünden), who (twelve guests a night) and what to do ("Choose your night", from CHF 48).
- walk 6 — pass — The rail's `aria-current` tracks the chapter (desktop-state-rail-2145), and the clock and star readout act as a progress cue. After a rail jump, Back returns to scroll 0. The 404 is authored and offers three ways out (probe frames).
- walk 7 — pass — "Book a night" sits in the header in every chapter frame and names the outcome. The booking dialog validates inline (desktop-state-book-submit-empty).
- walk 8 — pass — With WebGL off the hero is identical, drawn by the 2D fallback (nogl-desktop-s00.png), and the canvas is `aria-hidden` (index.html:598). A 320 px viewport has no overflow. The page is a single inline file, so there is no blank stage. Long strings were not tested.

## Memory test
A nearly empty dark-brown sky over a black alpine ridge with a tiny observatory dome, the line "Stay until the stars arrive." in coral, and a header that is a row of evening times (19:40 to 00:45) beside a live "37 stars, limit 2.7 mag" counter.

## Specificity test
no — No juror could name a source site from s00. The nearest corpus rows by register differ on the points that matter:
- `the-line` uses one hot red, but on cool-grey and near-white grounds.
- `to-top` is Swiss mountain scroll-as-climb, but in daylight cartography.
- `mont-fort` has a procedural landscape and a jump rail, but uses a desaturated blue ramp.

No corpus row pairs a red-lit night ground with a clock rail.
- Finish bar: no DIVERGENCE block exists on disk (`AWARDS.md` is absent), so there are no neighbour cards to capture against and none was run.

## Slop scan
families present: 1
- Colour: dark ground plus a saturated accent as the register (judge row). It is derived from the subject: the 620 nm note (index.html:650-651, desktop-s12) and the colophon (index.html:808, desktop-s100) explain the red as night-vision light. It is not recorded under `## Exceptions` because no `AWARDS.md` exists, so it counts.
- Checked and absent:
  - Audit L05/X07/X08: none flagged. The mono middle-dot strips carry per-night facts.
  - Fade-and-rise: absent. The page uses one masked heading reveal per chapter (index.html:2245-2252).
  - One family for everything: absent. Familjen Grotesk is paired with Martian Mono.
  - Staple kit: absent. There is no preloader, cursor, marquee or menu overlay.
  - Template order: absent. Chapters are ordered by clock time.
  - Glass, glow, gradient text and blobs: none.

generator nameable: no

## Contract fidelity
| Block | Kept? | Evidence (capture, file:line) |
|---|---|---|
| THESIS | no contract on disk | `AWARDS.md` absent; the evident thesis "Stay until the stars arrive." is visible at desktop-s00 |
| WORLD | no contract on disk | — |
| STORY | no contract on disk | — |
| FIRST VIEWPORT | no contract on disk | — |
| SIGNATURE | no contract on disk | — |
| SCROLL MODEL | no contract on disk | — |
| LOAD & CLOSE | no contract on disk | — |

There is no contract, so no block can be failed and fidelity does not move the disposition.

## Material fixes
### Floor (uncapped: fidelity, walk 1 and 3, audit P0/P1)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| index.html:2207-2211 (`focusTarget`), with index.html:287 (`.hero__title { display: contents; }`) | When the chosen heading has no box (`getClientRects().length === 0`), focus a box-generating target instead: the section or `#main` with `tabindex="-1"`. This also covers the logo, rail 19:40 and "Back to 19:40". | Tab, then Enter on "Skip to the night", then Tab focuses "Choose your night" inside `<main>`, not the header wordmark | desktop + mobile, state `kbd-skip`, full-motion tier | `.awards/captures/20261020T215616-jury-chapters/manifest.json` + desktop-state-kbd-skip.png, mobile-state-kbd-skip.png | pending | unresolved |

No audit P0/P1 findings. Walk 3 passed.

### Craft (at most 5, inside the contract)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| Sky renderer star size and brightness floor, index.html:1534 (`gl_PointSize`) and the tier table at index.html:1597 | Raise the size and brightness floor of faint stars at the tier the capture ran (`quality: low`), so the readout's 4,000 reads as a sky | At 1:1, desktop-s40 and desktop-s53 show a field clearly denser than s00 across the whole sky, not a dust concentrated top-right. The thesis "the stars arrive" is seen, not only counted. | desktop, s00 vs s40/s53 | `20261020T215616-jury-chapters` + desktop-s00.png (about 3 visible points in a 640×360 sky crop) vs desktop-s53.png | pending | unresolved |
| Close sizing, index.html:434-437 (`.close`, `.close__inner`, `.close__title .clock`) | Fit the close to 100svh at 1440×900 (top padding + inner + ridge), so its clock sits below the 64 px strip at max scroll | "01:15" is visible above "Lights on." on the last screen, like every other chapter's clock | desktop + desktop-rm, s100 | desktop-s100.png, desktop-rm-s100.png (01:15 hidden under the strip) | pending | unresolved |
| Ledger length, index.html:756-772 (`.nights`, 16 rows) | Show the next 6 nights, with a "Show all 16 nights" button after them. The dark-nights filter at index.html:750 stays. | The mobile ledger shrinks from 4,945 px (47 % of the page) to about a third of that; mobile s66 and s82 reach the close instead of more identical rows | mobile, s53–s82 | mobile-s53.png, mobile-s66.png, mobile-s82.png | pending | unresolved |
| Open Graph, index.html:10-12 | Add `og:image` (1200×630) drawn from the ridge, the dome and the coral headline (audit S06) | Shared links unfurl as the red-lit ridge instead of a blank card | link unfurl | `.awards/audit.json` S06 | pending | unresolved |
| `AWARDS.md ## Exceptions` (file to be created by `awards:craft`) | Record the dark-plus-red register: "red at 620 nm keeps night vision (index.html:650-651, 808)" | No page change. The slop scan reads 0 families. | — | this report, Slop scan | pending | unresolved |

## Keep
The scroll-as-clock chain must survive every fix: the rail of night times, the live stars/limit readout, the sky filling toward 4,000 and the moon dial washing it out.

## Ceiling
Ceiling: Every ledger row names what the 508 mm reflector will turn to (Saturn's rings, Albireo, the Ring Nebula), yet the page never lets the visitor look through the eyepiece.

## Jury log lines (for `AWARDS.md ## Jury log`, not appended because the file does not exist)
```
- 2026-10-20 · fix · D 7.6 / U 6.0 / C 7.8 / Co 8.3 → 7.2 · dev 8.2 / 8.0 / 8.3 / 6.9 / 7.8 · .awards/jury/2026-10-20.md
  top fixes: 1) skip link focus lands nowhere in full tier (index.html:2207-2211, :287) 2) desktop star arrival too faint (index.html:1534) 3) close clock hidden under strip at s100 (index.html:434-437)
```
