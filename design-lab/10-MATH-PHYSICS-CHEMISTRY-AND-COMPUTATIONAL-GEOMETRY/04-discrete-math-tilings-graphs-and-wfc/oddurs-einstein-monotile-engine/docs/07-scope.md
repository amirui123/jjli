# 07 — Scope

What the app teaches, how deep it goes, and what it deliberately refuses.

## The one sentence

> **One ordinary-looking shape can cover an infinite floor, and the pattern can
> never repeat — and here is *why* it can't.**

Everything in the app serves that sentence. Everything that doesn't is out,
however interesting it is. On this subject almost everything is interesting, so
this rule will have to be applied unsentimentally.

## The success test

A reader who finishes can, unprompted, tell a friend:

1. that a single tile was found that covers the plane but never repeats;
2. that "never repeats" does **not** mean random or chaotic — it's highly ordered;
3. roughly *why* it can't repeat — "the tiles group into bigger copies of
   themselves, forever, so there's no block you can stamp out".

Point 3 is the bar. Points 1 and 2 are achievable by a news article. If a
playtester can't get near 3 in their own words, the app hasn't done its job,
regardless of how it looks.

Non-goals of the test: nobody needs to reproduce a proof, name the four authors,
recall "aperiodic monotile", or define a translation group.

---

## In scope — the seven ideas, with depth ceilings

The ceiling matters more than the in/out call. Each idea has a point past which we
stop, on purpose.

| # | Idea | We go this far | We stop before |
| --- | --- | --- | --- |
| 1 | **Periodicity** | You can slide a square/hex tiling onto itself. Here's the repeat block. | Symmetry groups, wallpaper groups, lattices, any notation |
| 2 | **The hat** | An ordinary polygon, buildable from 8 kites, all angles boring | The [3.4.6.4] Laves tiling by name; polykite enumeration; exact coordinates |
| 3 | **Aperiodicity** | You try to force a repeat, you fail, and the failure is *lawful* | Any formal definition of aperiodic; "every tiling it admits" quantifier games |
| 4 | **Order ≠ repetition** | Every patch recurs elsewhere, infinitely often; it is not random | Repetitivity, local isomorphism, hulls, diffraction, Fourier anything |
| 5 | **Hierarchy** ★ | Tiles clump into metatiles clump into bigger metatiles, forever. *This is the why.* | Substitution matrices, Perron roots, `4+√15`, inflation factors as numbers |
| 6 | **Reflections & the spectre** | The hat needs mirror images; some people objected; two months later they fixed it with curved edges | Weak vs strict chirality as terminology; `Tile(1,1)`'s periodic tilings; Mystics; even/odd spectres |
| 7 | **The continuum** | One slider, hat ⇄ turtle, all of them work | `Tile(a,b)` as notation; the chevron and comet; why the endpoints are degenerate |

★ = the load-bearing one. If we cut scope under pressure, everything else goes before this.

### Two framing threads, woven in, not scenes of their own

- **David Smith.** Retired print technician, card and scissors, found it by hand.
  One paragraph, placed early, as the reason to keep reading. *Not* a biography.
- **Fifty years stuck.** Aperiodic tile sets went 20,426 → 6 → 2 by 1974, then
  nothing until 2022. One sentence, to establish stakes. *Not* a history lesson.

### The sandbox

Free play, ending the piece. Colour schemes (by orientation / metatile /
reflection), substitution depth, pan and zoom, export PNG/SVG, shareable link.
Desktop-rich, mobile-reduced ([06 §4](06-webapp-design.md)).

Its job is to convert understanding into an artifact worth posting. That's the
growth loop, and it's the only "feature" in the app.

---

## Out of scope — content

Each of these is genuinely good material. Each would make the app worse.

| Cut | Why |
| --- | --- |
| **Both proofs, in full** | The computer-assisted case analysis is unshowable. The incommensurability argument is beautiful but needs the whole continuum plus a commensurability intuition — that's a second app. Scene 5 conveys *why* without proving it, which is the right trade for this audience. |
| **The history of the einstein problem** | Wang tiles, Berger, Robinson, Socolar–Taylor, SCD, Gummelt. Fascinating, and it's [doc 01](01-history.md), not the app. Compressed to one sentence of stakes. |
| **Penrose tilings** | Deserves its own explainer. Here it's at most a one-line "the record was two tiles". Explaining Penrose properly would double the length and steal the ending. |
| **Quasicrystals, Shechtman, physics, metamaterials** | The strongest temptation, because it answers "what's it *for*". But it's a different story with different characters, and it would relocate the climax from the maths to the applications. At most a closing paragraph with no interactive. |
| **Numbers: φ⁴, 4+√15, Perron roots, inflation factors** | The φ⁴ reflection ratio may appear once as a *visual* ("about 1 tile in 8 is flipped") in scene 6. Never as algebra. |
| **Vocabulary: aperiodic monotile, chirality, substitution, polykite, translational symmetry** | Adult register means no jargon, not no rigour. Terms may appear once, glossed, if the plain-English version is clumsier — but the app must be fully comprehensible to someone who skips every one of them. |
| **Any equation or notation on screen** | Hard rule. No `Tile(a,b)`, no ℤ[√3], no set-builder anything. This is the single most reliable way to lose a general reader. |
| **The turtle as a character** | It's the far end of the continuum slider. It doesn't get a name card. |
| **Spectre internals** | Mystics, even/odd spectres, the hex metatiles. All implementation ([04](04-implementation.md)) or too deep. The user sees "curved edges fix it". |
| **Open problems, higher dimensions, convex einsteins** | One closing line at most. A reader who wants this will follow a link. |
| **3D, printing, laser cutting** | Post-launch educator add-on if ever ([06 §7](06-webapp-design.md)). |

---

## Out of scope — product surface

| Cut | Note |
| --- | --- |
| Accounts, login, profiles | Nothing to save that a URL can't hold |
| Backend, database, CMS | Static site. Share links encode state in the URL. If that gets unwieldy, *shorten the state*, don't add a server |
| Progress tracking, quizzes, scores, streaks, badges | Explicitly rejected in [06 §8](06-webapp-design.md) — we change knowledge, not behaviour |
| Comments, social features | A share button is the entire social surface |
| Multi-page site, blog, docs section | One page. The `docs/` in this repo is for us, not for readers |
| Localization | Post-launch. Design so it's *possible* (no text baked into canvas) but don't do it |
| Offline / installability | Explicitly not a PWA ([06 §6](06-webapp-design.md)) |
| Analytics beyond a basic privacy-respecting counter | We playtest with humans, not funnels |

---

## The adjudication rule

For every future "should we add…":

1. **Does it serve the one sentence?** Not "is it related" — everything is related.
   Does a reader need it to reach the success test?
2. **Is it adjacent-interesting?** Quasicrystals, Penrose, the proofs, the physics
   are all adjacent-interesting. That category is the primary threat to this
   project, because each addition is individually defensible and collectively
   fatal.
3. **What does it push out?** Attention is the budget, not screen space. On a
   phone, a scene that doesn't earn its place isn't neutral — it's a place people
   stop scrolling.

Default answer is no. The piece should feel slightly too short. Ten minutes,
eight scenes, one idea.

## Judgment calls I've already made

Recording these so they don't get relitigated by accident:

- **The 8-kite construction stays in** (scene 2), because it makes the shape feel
  *constructible* rather than magic — it defuses "mathematicians found a weird
  shape" and replaces it with "you could have drawn this". Cheap, high value.
- **The reflection problem stays in** (scene 6), even though it complicates the
  clean story. Omitting it would be dishonest, and the spectre resolution is a
  satisfying second act rather than a caveat.
- **The continuum stays in** (scene 7) despite being the most abstract idea,
  because "there are infinitely many of these" is a genuinely surprising ending
  and it's carried entirely by one slider — near-zero prose cost.
- **Scene 1 (periodicity) is the first thing to cut** if the opening drags. It can
  become a static figure inside scene 3 without breaking the arc.
