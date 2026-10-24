# 10 — Sprint 2

## Goal

> **One page a stranger can read start to finish, and come away able to say why
> it can't repeat.**

Sprint 1 proved the two hard scenes work. It did not produce a *piece*. Today the
public URL is a developer harness with a level slider on it, and the two real
scenes are unlinked pages a reader would never find. This sprint turns working
parts into something you could post.

## Where sprint 1 actually left us

Worth being precise, because it changes what's left to build.

- **Scene 1 (periodicity) is already built.** The redesigned scene 3 opens on a
  hexagon floor that visibly clicks into alignment — that *is* the periodicity
  baseline [07](07-scope.md) asked for, delivered where it earns its keep
  instead of as a scene of its own. [07](07-scope.md) predicted scene 1 would be
  the first thing to fold; it folded.
- **Scenes 2 and 4 are nearly free.** `kites.ts` already decomposes the hat into
  its 8 kites, which is scene 2's whole content. `alignment.ts` already finds
  partial matches, which is exactly the recurrence machinery scene 4 needs.
  Neither needs new engine work.
- **Scene 5 stands.** Untouched this sprint.
- **The failure mode to avoid** is the one scene 3 hit: building an interaction
  and hoping the point emerges. Every scene here states its one sentence first,
  then earns it.

## Tickets

### N1. The narrative shell — **M** — ✅ done

`src/pages/index.astro` is the piece; `src/scenes/stage.ts` mounts scenes lazily
via two `IntersectionObserver`s with deliberately lopsided margins — mount a
viewport early so a scene is never blank on arrival, tear down two viewports
late so scrolling back doesn't churn. A scene that throws is caught and hidden
rather than taking the page down.

The dev harness moved to `/preview/` with `noindex`, and the smoke check now
asserts nothing on the piece links to it.

**The conflict worth recording: `touch-action: none` versus scrolling.** A
canvas needs it to own drag and pinch, but a full-bleed canvas would then
swallow vertical scrolling and strand a reader on a phone. The stage is
therefore capped at `62dvh` with ordinary prose above and below, so there is
always somewhere to scroll. This is why the scenes are figures in an article
rather than full-screen panels.

The smoke check was rewritten to drive the narrative page rather than the scenes
in isolation, since that is now the product. It also asserts every scene has a
standalone text takeaway.

*Original ticket text:*

One page. Scenes become sections in order, each mounting its own canvas. Scroll
is the only navigation.

Mount scenes **lazily** via `IntersectionObserver` and tear them down when far
offscreen — four live canvases each holding a patch is the obvious way to make a
phone crawl. `TileRenderer.destroy()` already exists for this.

Kill the dev harness from `/`. It moves to `/preview/`, unlisted.

**Done when:** one URL scrolls through the whole piece, and only the visible
scene holds a canvas.

---

### N2. Scene 2 — meet the hat — **S** — ✅ done

`src/scenes/thehat.ts`. Four steps: three hexagons → cut into kites → take
eight → that is the shape. The hexagons stay fixed throughout, which is what
makes it read as *"the hat comes from here"* rather than as four unrelated
pictures. Tap anywhere or drag the slider.

Placed **before** scene 3 rather than after, so a reader meets an ordinary
polygon before being asked to care what it does. Uses `HAT_KITES` unchanged —
zero new engine work, as predicted.

*Original ticket text:*

*One sentence: this is an ordinary shape, and you could have drawn it.*

Build the hat from its 8 kites, one at a time, on the hexagon grid the reader
just saw in scene 3's first act. Defuses "mathematicians found a magic shape"
and replaces it with "it's eight kites off a hex grid."

Uses `HAT_KITES` as-is. Ceiling per [07](07-scope.md): no Laves-tiling name, no
polykite enumeration, no coordinates on screen.

---

### N3. Scene 4 — order ≠ repetition — **M** — ✅ done

`src/scenes/recurrence.ts` + `recurrences()` in the engine. Tap the tiling; the
scene takes that tile and its six neighbours and highlights **every** other
place that exact patch occurs — about twenty, in view.

Completeness comes from the same argument as `candidateShifts`: the patch's
first piece must land on a piece of its own form, so this finds every
recurrence rather than a sample.

**Sized down deliberately.** A level-4 patch gives ~120 recurrences, which
sounds better and teaches worse — each copy is a few pixels and reads as a
speck, so the reader cannot see that they are *the same shape*, which is the
entire mechanism. Level 3 gives ~20 copies, each legible.

The honesty line: what is shown is recurrence inside one finite patch. That it
continues forever is a claim about the infinite tiling, so the copy says so
rather than implying the visible count is the whole story.

*Original ticket text:*

*One sentence: it never repeats, but it isn't random either.*

The misconception [07](07-scope.md) says must die. Tap any small patch; the app
finds and pulses **the same patch** elsewhere, and again, and again — while the
tiling still has no global repeat.

This lands hardest immediately after scene 3, where the reader has just watched
46% of tiles align and might reasonably conclude "so it nearly repeats". The
honest answer is: patches recur, the whole thing doesn't. Same fact, seen twice.

Engine: adapt `alignment.ts` — a patch recurs at shift *s* when every tile in
the selection matches under *s*, which is `alignment` restricted to a subset.

---

### N4. Scene 0 — the hook — **S** — ✅ done

`src/scenes/hook.ts`. A level-4 patch fades in outward from the centre over
~2.6s, eased so it reads as a floor being laid rather than a progress bar.
Geometry and draw order are computed once; the animation only changes how many
tiles are drawn, so no per-frame allocation happens.

`aria-hidden`, `pointer-events: none`, and under `prefers-reduced-motion` the
patch simply appears — the growth is decoration, the tiling is the content, and
nobody should sit through an effect to see it.

Tuned after looking at it: the first version put texture behind the standfirst,
which is the fastest way to make an editorial page look cheap and read badly.
Two composited masks now fade it out entirely before the body copy starts.

*Original ticket text:*

Ambient tiling growing behind the title. No interaction, no controls. Its only
job is *"…wait, is that repeating?"* and to make the reader keep going.

Respect `prefers-reduced-motion`: render the patch, skip the growth.

---

### N5. The copy pass — **M** — ✅ done

597 words, ~3 minutes. The arc holds as pure text with every canvas removed,
which is the test that matters: hook → fifty years stuck → the shape is ordinary
→ what "repeats" means → it never aligns → two wrong conclusions → patches recur
→ orderly *and* non-repeating → the hierarchy → afterwards.

Both threads landed as prose rather than scenes, as planned: David Smith with
card and scissors in the standfirst and the outro, and the 20,426 → 6 → 2 → stuck
history as the lead-in to scene 2, where it motivates *why anyone cares* about
an ordinary-looking polygon.

**Scene 6 got absorbed.** [07](07-scope.md) scoped the reflection problem and the
spectre as their own scene. It turns out to work better as one honest paragraph
in the outro — the hat needs mirrors, some people objected, the same four authors
answered it two months later. The scope doc's "one closing line at most" for the
enrichment material was right.

The closing beat is deliberately not triumphant: nobody has a theory of *which*
shapes do this, which is exactly why the hat sat in catalogues unnoticed.

*Original ticket text:*

The one ticket with no code. Every scene gets real prose at the register settled
in [06 §8](06-webapp-design.md) — adult, no jargon, no exclamation marks, no
mascot.

Threads to weave in, both one paragraph, neither a scene:

- **David Smith.** Retired print technician, card and scissors, found it by hand.
  Place early — it is the reason a general reader keeps going.
- **Fifty years stuck.** 20,426 tiles → 6 → 2 by 1974, then nothing until 2022.
  One sentence of stakes.

Also the closing: what it's for, and one honest line that the *why* is still
open. Then get out.

**Every scene needs a text takeaway that stands alone without its visual** —
docs/06 §4, and it is also the accessibility story.

---

### N6. Accessibility + polish pass — **M** — ✅ done

- Every content canvas is `role="img"` with a real `aria-label` describing what
  is drawn, plus `aria-describedby` pointing at its takeaway. The hook is
  `aria-hidden` and marked `data-decorative`.
- **Keyboard routes to every scene's point.** Scene 3 gained a *Try another
  slide* button that steps through the candidate periods; scene 4 gained *Pick a
  patch*. Both were pointer-only before, which meant their entire argument was
  unreachable without a mouse. Verified by driving them with clicks alone — the
  hexagon floor can be aligned from the keyboard.
- `aria-live="polite"` on the prompts, captions and meters, since those change
  without focus moving and they carry the teaching.
- Focus rings on controls and on the canvases themselves.

*Original ticket text:*

- Every canvas gets a real text alternative, not `alt=""`.
- Keyboard: scenes that are tap-only need a keyboard path, or an honest
  equivalent.
- `prefers-reduced-motion` honoured in each scene.
- Focus states on every control.
- One pass with a screen reader.

---

### N7. Share + open graph — **S** — ✅ done

`scripts/og.mjs` (`npm run og`) builds the card **from the engine** — same
substitution data, same palette, coloured by metatile group so the hierarchy is
visible at a glance. SVG in Node, rasterised with Playwright, which was already
a dev dependency. Committed to `public/` because Pages only runs `astro build`.

The tiling bleeds off every edge so it reads as a piece of an endless floor
rather than a specimen on a slide, with a gradient veil keeping the type legible.

*Original ticket text:*

An OG image generated by the engine, so the link looks like the thing. A real
`<title>` and description per the piece, not per scene.

Cheap, and it is the whole distribution mechanism ([06 §3](06-webapp-design.md)).

## Sequencing

```
N1 shell ──┬── N2 hat ──┬── N5 copy ── N6 a11y ── N7 share
           └── N3 recur ┘
                N4 hook (any time)
```

N1 first — it is the container everything else lands in. N2 and N3 are
independent. N5 needs the scenes to exist. N6 and N7 are last.

## Explicitly not in this sprint

Scene 6 (the spectre), scene 7 (the continuum), the sandbox, export, WebGL,
localization. [07](07-scope.md) calls 6 and 7 enrichment, and the arc is complete
without them — which is exactly the test of whether the scope doc meant it.

## Definition of done

1. One URL, readable start to finish, on a phone.
2. No developer surface reachable from it.
3. A stranger who reads it can say, unprompted, roughly *why* it can't repeat.
4. The link looks like something when posted.
