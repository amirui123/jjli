# 11 — Sprint 3

## Theme: survives contact

> **The piece works for whoever opens it — not just in the one browser at the
> one size we happened to test.**

## Why this, now

The piece is finished enough to post, and posting is the entire distribution
model ([06 §3](06-webapp-design.md)). Which makes this the uncomfortable fact:

**We have tested exactly one browser engine, at exactly one viewport size.**

Every screenshot, every smoke run, every performance number in this repo came
from headless Chromium at a Pixel 7. Nobody has opened this in Safari. On a
piece whose readers will arrive by tapping a link — disproportionately on
iPhones — that is the largest untested risk we have, and it is invisible until
it is embarrassing.

A static audit found concrete exposure, not hypothetical:

| Feature | Uses | Risk |
| --- | --- | --- |
| `mask-composite` | 2 | WebKit uses different keywords entirely. If it fails, the hook renders at full strength across the lede — wrecking the exact readability problem N4 just fixed. |
| `color-mix()` | 3 | Safari 16.4+. Older Safari drops the declaration; borders and muted text lose their colour. |
| `text-wrap: balance` | 3 | Safari 17.5+. Degrades gracefully, but headline ragging is a craft detail we claim to care about. |
| `dvh` | 1 | Safari 15.4+. Below that, stage height collapses. |
| `setPointerCapture` | 1 | Historically buggy in WebKit; drag could stick or drop. |

The mask one is the real worry: a *silent* failure that makes the page look
cheap rather than broken, so it would never show up in an error log.

This sprint is deliberately not new scenes. The arc is complete and
[07](07-scope.md) says the piece should feel slightly too short. What it should
not feel is broken on someone's phone.

## Tickets

### C1. Run the smoke check on WebKit and Firefox — **M** — ◐ plumbing done, **findings blocked**

The harness is parameterised: `npm run smoke -- --engine=webkit` (or `firefox`),
and `npm run smoke:webkit`. Non-Chromium engines get a plain viewport rather
than the `devices['Pixel 7']` descriptor, whose Chrome user-agent would make the
engine misreport itself.

**But WebKit will not install in this environment.** `npx playwright install
webkit` exits 0 and downloads nothing — the same silent failure the Chromium
download hit earlier in the project. So:

> ⚠️ **The piece has never been run in WebKit. Safari is unverified.**

The harness fails loudly rather than skipping, so this cannot be mistaken for a
pass. Anyone with a working network should run `npx playwright install webkit &&
npm run smoke:webkit` — it is the highest-value unrun check in the project.

*Original ticket text:*

Parameterise the harness by engine. WebKit is Safari's engine and is the one
that matters; Firefox is cheap to add once the plumbing exists.

**Done when:** `npm run smoke -- --engine=webkit` runs the full suite, and we
have a written list of what actually differs. Findings first, fixes after — I do
not want to guess at fallbacks for problems that may not exist.

---

### C2. Fix what C1 finds — **M** — ◐ defensive subset applied

C1 could not produce findings, so this is deliberately limited to changes that
are **correct practice regardless** of whether any specific browser needs them —
declare the simple thing first, enhance after. That is not guessing at a
problem; it is the ordering that should have been there anyway.

- `color-mix()` — a static colour precedes each of the three uses.
- `dvh` — `vh` precedes it.
- The hook's mask — a single `mask-image` now stands alone and works everywhere,
  with the composited pair moved behind `@supports (mask-composite: intersect)`.
  This was the one flagged as most dangerous, because a silent failure there
  makes the page look *cheap* rather than *broken* and would never surface in an
  error log.
- `text-wrap: balance` — left as-is. It degrades to normal wrapping, which is
  fine.

What remains genuinely unverified is behaviour rather than styling:
`setPointerCapture` in WebKit, and whether the drag gestures feel right under
Safari's touch handling.

*Original ticket text:*

Fallbacks in the right order: a working plain declaration first, the enhanced
one behind `@supports`. Never the reverse, which is how you ship a page that
looks correct only in the browser you wrote it in.

Expected, pending C1's evidence: `-webkit-mask-*` for the hook, a static colour
under each `color-mix`, `vh` under `dvh`.

---

### C3. Viewport sweep — **S** — ✅ done

Swept 320×568, 375×667, 430×932, 844×390, 568×320, 834×1112, 1440×900. **Two
real bugs, present at every size except desktop** — which is to say, present for
almost every actual reader.

**Horizontal scroll everywhere.** The hook bleeds past the article to reach the
page edges and nothing clipped it, adding 40–60px of sideways scroll on every
phone and tablet. `overflow-x: hidden` on `<body>` did *not* fix it: the
scrollport is `<html>`, so the overflow propagates straight past. Clipping the
containing block — `.lede { overflow: hidden }` — is what actually holds.

**Landscape phones trapped the reader.** A 62dvh canvas plus its HUD came to
420px inside a 390px viewport, so no prose was reachable — and the canvas owns
touch, so there was nothing left to scroll with. Exactly the failure the stage
height was designed to prevent, in the one orientation nobody tests. Landscape
is *wide*, so the stage now lays the HUD beside the canvas (466px + 336px) and
the whole thing fits in 213px.

*Original ticket text:*

Small phone (320px), large phone, tablet, desktop, and **landscape phone** —
the one nobody tests, where a 62dvh stage plus a HUD can leave no room for the
prose that makes scrolling possible.

**Done when:** screenshots at five sizes, no horizontal scroll anywhere, no
stage taller than its viewport.

---

### C4. Degrade honestly — **M** — ✅ done

With JavaScript off the page was four empty bordered boxes — ~2,700px of blank
frame — which reads as broken rather than degraded.

**The fix was already written.** The takeaway paragraphs added in N6 for screen
readers and skim-readers turn out to be exactly the no-JS story: a `<noscript>`
block hides the figures and promotes each takeaway from a quiet aside to the
scene's prose. 597 words survive, and the page reads as an article. The same
rule set is reused for `[data-failed]`, so a scene that throws at runtime
degrades identically. Writing the meaning down once paid for itself three times.

*Original ticket text:*

- **No JavaScript:** the prose is the argument and should survive alone. Today
  the stages would render as empty bordered boxes, which reads as broken.
  They should be absent or explained.
- **Canvas unavailable / context lost:** don't leave a blank frame.
- **Slow connection:** the piece is ~600 words and a few KB of JS; make sure
  nothing blocks first paint on the tiling being ready.

---

### C5. Performance and a11y budgets in CI — **S** — ✅ done

**Found the real gap first: the smoke check had never run in CI.** Every push
verified that the site *compiled*, not that it *worked*. It runs now.

Budgets are asserted in the smoke harness rather than by Lighthouse: first
contentful paint (20 ms), total JavaScript (29 KB against a 120 KB ceiling),
every control has an accessible name, exactly one `h1`, `lang` present. A
Lighthouse *score* is hard to act on and the tool is heavy and flaky in CI;
these fail with the specific thing that broke. A full Lighthouse audit stays a
deliberate manual step.

*Original ticket text:*

Lighthouse against the built site on every push, with thresholds that fail the
build. [09](09-sprint-01.md) ticket X1 left this outstanding; it is cheap now
that the harness exists.

---

### C6. The real-device gap — **S** — ✅ done

[12-verification.md](12-verification.md) — a standing page separating what is
verified on every push, what was verified once by hand, and what is not verified
at all. The last list is the important one: Safari, any physical device, and any
human reader.

*Original ticket text:*

Everything above is emulation. Write down honestly what has and has not been
verified on physical hardware, so nobody reads green CI as "tested on an
iPhone". If a device is available, use it.

## Sequencing

```
C1 findings ── C2 fixes ──┬── C5 budgets
                          └── C3 viewports ── C4 degradation ── C6 honesty
```

C1 strictly first: it converts guesses into a list.

## Not in this sprint

Scene 6 (spectre), scene 7 (the continuum), the sandbox, export. The continuum
is the strongest candidate for sprint 4 — one slider morphing hat into turtle,
both aperiodic, and the genuinely surprising fact that there is not one einstein
but infinitely many.

## Definition of done

1. The smoke check passes on WebKit as well as Chromium.
2. No horizontal scroll and no trapped scroll at any of five viewport sizes.
3. With JavaScript off, the piece still reads as an article rather than a broken
   page.
4. CI fails on a performance or accessibility regression.
5. An honest written statement of what remains unverified on real hardware.
