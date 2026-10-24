# 15 — Sprint 6

## Theme: something to take away

> **The piece ends and the reader leaves with nothing.**

## Why this, now

Five sprints have gone into making the piece good. None have gone into what
happens at the end of it, and the answer today is: the reader closes the tab.

There is nothing to make, nothing to keep, and nothing to post. For a project
whose entire distribution model is a shared link
([06 §3](06-webapp-design.md)), that is the last structural gap.

**And the exit is actively broken.** The footer links to the source, and the
README a reader lands on says:

> *"**Status:** early. The tiling engine works and is tested; the web app
> doesn't exist yet."*

Written in sprint 1 and never touched since. Anyone who follows the one outbound
link in the finished piece is told the piece does not exist. That is the kind of
thing that is invisible from the inside and obvious to everyone else.

## The tension to respect

[07](07-scope.md) is emphatic that the piece should feel *slightly too short*,
and warns that adjacent-interesting additions are individually defensible and
collectively fatal. A sandbox is exactly that kind of addition.

The resolution: **the sandbox is not part of the piece.** The arc ends where it
ends, and the sandbox is a separate place, linked from the outro, for readers
who want to keep going. Nothing about the three-minute read changes.

And it gets **few knobs, not every knob**. The temptation is a control panel;
the goal is one good picture.

## Tickets

### T1. The front door — **S** — ✅ done

Rewritten for a project that exists. It now leads with the link, describes the
engine as the reusable thing it is, and points at
[12-verification.md](12-verification.md) so nobody reads a green build as
"tested".

*Original ticket text:*

Rewrite the README for a project that exists. It is the second thing a reader
sees and currently contradicts the first.

Also worth stating there: what the engine is, since it is genuinely reusable and
nobody would guess it from the piece.

---

### T2. The sandbox — **M** — ✅ done

`/make/`, three knobs, linked from the outro. The tripwire held: **no new engine
code was needed** — `buildPatch`, the sprint-1 palettes and `deform`, assembled.

Two things measurement changed:

- **Depth stops at 4.** Level 5 is 54,289 tiles and deforming them costs 490ms
  — about two seconds on a throttled phone. A knob that hangs the page is worse
  than a knob that isn't there. Found because a browser test timed out, which
  turned out to be evidence rather than flakiness.
- **The shape knob is coarse — twelve stops, not a hundred.** The continuum
  *scene* animates smoothly because watching the morph is its point; here you
  are *choosing* a shape, so each step is a deliberate pick and a drag cannot
  queue a hundred recomputes.

Geometry is cached by (level, shape), since colour and dark mode do not move a
vertex, and the hat skips deformation entirely because at its own parameters
there is nothing to deform.

**One bug worth recording.** `draw()` wrote `data-dark` onto the root element,
which collided with the checkbox's own `data-dark` hook — one selector, two
elements. The app worked by luck (`root.querySelector` never matches root
itself), and a browser test in strict mode is what surfaced it. The attribute
was also dead: nothing styled on it. Deleted rather than renamed.

*Original ticket text:*

One screen. Your tiling. Three choices, no more:

- **how much** — patch depth
- **what colour** — the schemes already validated in [A3](09-sprint-01.md)
- **what shape** — the continuum slider, hat through turtle

Everything needed exists: `buildPatch`, the palettes, `deform`. This should be
assembly, not invention. If it starts needing new engine work, that is a signal
the scope has drifted.

Lives at `/make/`, linked from the outro. Not in the narrative page.

---

### T3. Export — **S** — ✅ done

SVG and PNG, filenames carrying the design (`einstein-4-100-orientation-d.svg`).
The PNG is rasterised from the same SVG at export size rather than scaled up
from the visible canvas, so it is genuinely high-resolution.

SVG is the one that matters — [04](04-implementation.md) notes people laser-cut
and 3D-print these, and exact polygons are what that takes.

*Original ticket text:*

PNG at a resolution worth posting, and SVG, which is what anyone cutting or
printing one actually needs.

The engine emits exact polygons, so SVG is nearly free and is the more valuable
of the two — [04](04-implementation.md) notes people laser-cut and 3D-print
these, and an SVG is what that takes.

---

### T4. Share links — **S** — ✅ done

`?d=4.100.orientation.d` — readable on purpose, so a link someone looks at is
guessable rather than opaque. Written with `replaceState`, so dragging a slider
does not fill the back button with forty entries.

The smoke check asserts the round trip, because a share link that reopens the
wrong tiling is worse than no share link.

*Original ticket text:*

The state goes in the URL, so a posted link reopens the same tiling. This is the
growth loop [06 §7](06-webapp-design.md) named: someone posts a picture, the
link comes back here.

Keep the encoding short and readable. No backend — [07](07-scope.md) rules one
out, and none is needed for three numbers.

## Not in this sprint

The spectre scene. Deeper maths. A gallery, accounts, or anything that needs a
server. If the sandbox grows a fourth knob, it has gone wrong.

## Definition of done

1. The README describes the project that exists.
2. A reader can make a tiling, export it, and post a link that reopens it.
3. The narrative page is unchanged apart from one link in the outro.
4. No new engine code was required.
