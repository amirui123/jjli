# 14 — Sprint 5

## Theme: the cold read

> **Be the most demanding reader available, since no human one is.**

## Why this, now

The piece is finished. Six scenes, 698 words, hardened across seven viewports,
degrading without JavaScript, 142 tests and 25 smoke assertions green on every
push.

And **nobody has read it.** Every sprint since sprint 2 has improved something
no human has experienced. The copy in particular was written in fragments across
four sprints — a lead-in here, a takeaway there — and has never been read end to
end as a single argument by anyone, including me.

That is the exact failure mode that produced the scene 3 disaster: building
parts, assuming the whole works, and finding out from a reader that it didn't.
The playtest is still the real answer and is still blocked. Until then, the
useful thing is to read it as adversarially as possible.

## The finding that motivated the theme

Before writing this plan I checked one claim the piece makes in a takeaway:

> *"The einstein tiling never does — the closest any slide gets is 46% of tiles
> landing."*

| patch | tiles | best slide |
| --- | --- | --- |
| level 1 | 25 | 72.7% |
| level 2 | 169 | 45.9% |
| level 3 | 1,156 | 45.2% |
| level 4 | 7,921 | 44.1% |

**It is not a property of the tiling. It is a property of the patch that scene
happens to show**, and it *falls* as the patch grows. Stated the way it is, a
reader could reasonably infer that 46% is a real ceiling — that the tiling
"almost" repeats and stops just short. The truth is less cute and more
interesting: the more tiling you look at, the worse the best slide does.

One sentence, one wrong impression, found in five minutes. That is what this
sprint is for.

## Findings

### R1 — the cold read

Read as plain text, no canvases, start to finish.

**The arc holds.** hook → ordinary shape → what repeating means → not random →
why → not even one shape → afterwards. Each transition is carried by a sentence
that refers back to what the reader just did, and the ending ("It still
doesn't.") lands.

**Two real problems, both around the same number.**

1. **The 46% claim is stated as a property of the tiling and is not one** — see
   the table above. It falls as the patch grows.
2. **It appears twice, and the second use builds on the first.** The recurrence
   lead-in argued *"one wrong conclusion is that it nearly repeats — it got to
   46%, after all"*, so a wrong number had become load-bearing for a later
   paragraph.

The in-scene copy was already correct: it says *"the very best any slide manages
**here**"*, which scopes the claim to the patch on screen. Only the article
prose overreached.

**The fix is truer and rhetorically stronger.** Rather than a ceiling —
*"the closest any slide gets is 46%"* — the honest statement is that the best
slide gets **worse the more floor you look at**. A ceiling invites "so it almost
repeats"; a downward trend says the opposite, and it is what the measurements
actually show.

### R2 — the fact audit

Every number in the copy traced to `docs/01`–`05`:

| claim | source | verdict |
| --- | --- | --- |
| 20,426 tiles | Berger, [01](01-history.md) | ✅ |
| down to six, then two, by 1974 | Robinson 1971, Penrose 1974 | ✅ |
| ~fifty years stuck | 1974 → 2022 is 48 | ✅ round, defensible |
| eight kites, thirteen sides | [02](02-the-hat.md) | ✅ |
| about one tile in eight flipped | φ⁴ ⇒ 1 in 7.85, [02](02-the-hat.md) | ✅ well hedged |
| proof four months later | Nov 2022 → Mar 2023 | ✅ |
| spectre two months after | Mar → May 2023 | ✅ |
| almost all of the family are einsteins | all but three members, [02](02-the-hat.md) | ✅ hedged correctly |
| no theory of which shapes do this | [05](05-frontier.md) open questions | ✅ |
| **best slide 46%** | engine, one patch only | ❌ **fixed** |

Notably the piece does *not* repeat the errors [references.md](references.md)
warns about — no "1 in 6", no "1 : 7.53", no confusion of φ⁴ with 4+√15.

## Tickets

### R1. Read it cold — **M** — ✅ done

Extract the piece as plain text and read it as a stranger would, start to
finish, with no canvases. Write down every place it stumbles: repetition, a
scene that does not earn its place, momentum lost, a transition that assumes
something not yet said, an ending that arrives early or late.

**Findings first.** No fixes until the list exists, so the fixes serve the read
rather than my memory of writing it.

---

### R2. Audit every factual claim — **M** — ✅ done

The piece asserts a lot in 698 words: 20,426 tiles, six, two, 1974, fifty years,
eight kites, thirteen sides, one tile in eight flipped, four months, two months.
`docs/01`–`05` exist precisely because popular coverage garbles these — and
[references.md](references.md) already records φ⁴ ≈ 6.854 being widely misquoted
as "1 in 6" and "1 : 7.53".

Check every number in the copy against the research docs. Re-measure every
number that came from the engine, at more than one patch size, so
patch-dependent quantities are caught rather than quoted.

An explainer that gets a fact wrong forfeits the reader's trust for everything
else on the page, which is a bad trade for a number nobody asked for.

---

### R3. Hold each scene to its promise — **M** — ✅ done

Checked by asking what each scene says to a reader who **never interacts**,
which is most readers.

| scene | untouched, it says | verdict |
| --- | --- | --- |
| the hat | "Start with a floor of hexagons. Ordinary, and it repeats." | ✅ |
| slide it | "Drag the pale copy. Find a spot where every tile lands." | ✅ instruction, takeaway carries it |
| recurrence | *"Tap anywhere on the tiling."* | ❌ pure instruction, said nothing |
| hierarchy | "One shape, laid down over and over." | ✅ |
| continuum | *"The hat."* | ⚠️ thin |

**A continuity bug, introduced by my own reordering.** The hat scene opened with
*"Ordinary, and it repeats — you just proved that"* — a back-reference to the
hexagon floor in the sliding scene. But scene 2 was deliberately placed *before*
scene 3, so the reader has proved nothing yet. A forward reference disguised as
a callback, invisible unless you read in order.

**Two captions told a passive reader nothing.** A bare instruction shows someone
who is not going to tap a command they are not following. Both now name the
*outcome* as well: *"Tap anywhere — the same patch will be somewhere else too"*,
and the continuum opens with what the drag will do rather than just the shape's
name.

Every scene still delivers its one sentence from [07](07-scope.md). None had the
scene-3 failure of delivering something merely adjacent.

*Original ticket text:*

[07](07-scope.md) gives every scene one sentence it must deliver. Check each
against it — and specifically for the failure scene 3 had: delivering something
*adjacent* to the promise and feeling finished.

| scene | must deliver |
| --- | --- |
| the hat | this is an ordinary shape, and you could have drawn it |
| slide it | you try to make it repeat and you can't |
| recurrence | it never repeats, but it isn't random |
| hierarchy | tiles group into bigger copies, forever — *this is the why* |
| continuum | there isn't one einstein, there are infinitely many |

---

### R4. Fix what R1–R3 find — **M** — ✅ done

Four changes, in order of how badly each would mislead:

1. The 46% overclaim, in the takeaway — replaced with the downward trend.
2. The 46% again in the recurrence lead-in, which had made a wrong number
   load-bearing for a later argument.
3. The hat scene's false callback.
4. Two captions that spoke only to readers who interact.

*Original ticket text:*

Ordered by what would most mislead a reader, not by what is easiest.

## Not in this sprint

The sandbox and share links. They are the growth loop
([06 §7](06-webapp-design.md)) and the strongest candidate for sprint 6 — but a
toy attached to a piece with a wrong number in it is worth less than the piece
being right.

## Definition of done

1. A written findings list from a cold read, not from memory.
2. Every number in the copy traced to a source or a re-measurement.
3. No claim that is true of one patch stated as true of the tiling.
4. Each scene either delivers its one sentence or is honestly marked as not
   doing so.
