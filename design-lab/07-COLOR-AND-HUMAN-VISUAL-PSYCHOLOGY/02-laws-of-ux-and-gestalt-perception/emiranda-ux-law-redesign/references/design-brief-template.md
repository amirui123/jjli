# Design brief template

Use this in phase 6. The brief goes to an AI design tool (Claude Design, v0, Figma Make, Lovable) or a human designer. It has to hold up when read by someone with no access to this conversation.

## Contents

- [What makes a brief work](#what-makes-a-brief-work)
- [The template](#the-template)
- [Section notes](#section-notes)
- [Handing it over](#handing-it-over)

## What makes a brief work

- **Real content, not placeholders.** Real names, real data, a real week. Lorem ipsum hides the problems that matter: long names, name collisions, many entries in one cell, an empty state.
- **Constraints tell the tool what not to invent.** Design tools fill gaps with plausible features and plausible rules. Say what exists, tag what's new, and list the rules the screen must express without adding any.
- **The why beside the what.** Each directive carries its reason (the law, the measured problem, the task). Tools make better calls on edge cases when they know the goal.
- **States, not just the happy path.** Loading, empty, error, read-only, conflict, the finished state.
- **Numbers for success.** "Fits in 1.5 screens at 1440×900" gets met; "more compact" doesn't.
- **Questions it must answer.** Anything you can't decide yourself becomes a numbered question the handoff must answer in writing.
- **Plain language.** Short sentences in the users' own terms. No codebase words (chip, popover, toggle) in the product copy the tool writes.
- **Real copy for every state.** Left alone, a design tool writes "Something went wrong" and "No data". Ask for a copy deck and give it the copy rules (voice, button labels, error pattern) from `references/ux-copy.md`.

## The template

Copy from here, fill every section, delete the guidance in italics. Numbered sections let the handoff cite them (§8, §13).

```markdown
# <Product> · <Screen>, v<N> redesign brief

Written <date> for <design tool>. <One line on where the handoff should go when it comes back.>

## 0. How to work from this brief

- Read the whole brief before you draw.
- Draw only what exists today. Tag anything new as **NEW** (works in the browser alone) or **NEW·API** (needs a backend change); engineering decides on those.
- Every item in the §8 parity checklist must appear somewhere in your design. You may move, merge or restyle an item, but you may not drop it.
- Answer every question in §13 explicitly in your handoff. An unanswered question gets answered in code by someone who wasn't in the room.
- Deliverables are in §14.

## 1. What you're designing

*Product, organization and domain in two sentences. Who uses this screen (names and roles; permission tiers). The one question the screen must answer within a few seconds, and the second question.*

## 2. The routine (Pareto: design for the top rows)

| How often | Task |
|---|---|
| Every <day/week> | … |
| Some <days/weeks> | … |
| Rarely | … |
| <Read-only tier> | … |

*One line: rare tasks should be quiet, never missing.*

## 3. The rules the screen expresses (don't add any)

*The domain rules, with their source. What the system refuses (hard) versus what it flags but allows (soft). Severity grades. Required vocabulary and banned words. Privacy limits (for example: no client identifiers).*

## 4. Seed data: use real content

*The real people, items, dates and states to seed the prototype with. Keep the awkward cases (long names, duplicate names, a crowded cell, an empty one). List the issues to seed, one per state the design must show.*

## 5. What's wrong today (measured)

*Use the widths from phase 3; add a 390×844 column for anything people open on a phone.*

| | 1280×800 | 1440×900 | 1920×1080 |
|---|---|---|---|
| Height, in screens | | | |
| Truncated text | | | |
| Smallest text / share under 12px | | | |
| Controls under 44px (under 24px) | | | |
| Typefaces / colours / border styles | | | |
| Unicode glyphs used as icons | | | |
| Text below AA contrast | | | |

*Then the egregious findings a number can't show, and the problems grouped: too many signals, hidden actions, layout that changes by width, duplicated information, feedback problems.*

## 6. UX laws: what each one means on this screen

1. **<Law>** (<its idea in a few words>). <Directive naming real elements, with the evidence.>
2. …
20. …

**Copy audit** (see `references/ux-copy.md`)

| Principle | State | Today | Change to |
|---|---|---|---|
| <e.g. Names the action> | <default> | <the real string> | <the better string> |

*Five to eight rows for the worst strings: real text from the screen, the state it appears in, the principle it breaks.*

## 7. Visual and copy direction

*Feel (for example "premium, Apple/Google craft on the existing brand"). Voice: three traits and one thing it never does. Tone by state (error, success, destructive confirmation, empty). Banned words. Palette with one meaning per colour. Type: families, weights, sizes and the minimum. Icons: one set, a maximum count, no Unicode glyphs as icons. Surfaces, radius, shadows. Motion tokens and reduced motion. Accessibility: AA contrast, colour never the only signal, target size, keyboard path, visible focus, accessible names. Dark mode: required or not.*

## 8. Parity checklist: every one of these must exist in the design

- **<Area>:** item; item; item.
- …

## 9. Current bugs your design must not carry over

- …

## 10. New affordances you may propose (tag each one)

- **NEW:** …
- **NEW·API:** … *(Say what not to invent, too.)*

## 11. Constraints

*Widths supported and the smallest that must not clip. Platform (desktop-first, mobile, both). Must be buildable from <data contract>. Styling approach and framework limits. Copy rules: buttons are verb + object; errors say what's wrong and how to fix it, next to the field; every field keeps a visible label; one term per concept.*

## 12. Acceptance targets (hard numbers)

- Height: ≤ <N> screens at <viewport>.
- 0 truncated <names/titles> at <width>.
- No text under <12>px (uppercase labels ≥ <11>px).
- One meaning per visual treatment; readable without a legend.
- ≤ <8> icons from one set; 0 Unicode glyphs as icons.
- <Top task> in ≤ <N> interactions. Destructive actions undoable for ≥ <5> s.
- Visible feedback within 100ms for every action.
- AA contrast on all text; targets ≥ <44 / 24> px.
- Copy: 0 buttons labelled Submit, OK, Yes or No; 0 links labelled "click here" or "read more"; 0 fields labelled only by a placeholder; every error names the problem and the fix; body sentences average ≤ <20> words, none over <25>.

## 13. Questions to answer explicitly in the handoff

1. …

## 14. Deliverables

- One HTML prototype, seeded with §4, showing every state in the §8 parity checklist.
- A "Why this shape" panel mapping each decision to a §6 law and a §2 task.
- A handoff README mapping each §8 item to where it lives, and answering §13.
- A copy deck: every string by screen and state (default, empty, loading, error, success, destructive confirmation), in a table the build can copy verbatim.
```

## Section notes

**§1.** State the screen's job as a question a user asks. For a scheduling board: "Is every session this week safely staffed, and if not, what should I do next?" For an inquiry page: "Can I get help here, and what's the fastest way to start?" Every later directive should serve that question.

**§2.** Frequencies come from phase 1 (users, logs, feedback), not guesses. Note any frequent task that is hidden today; it is usually the most valuable single fix.

**§3.** Quote or cite the source for each rule. Separate law from policy (a regulatory minimum versus the organization's own standard), because the design should grade them differently.

**§4.** Use real content wherever privacy allows. Staff names are usually fine; client or patient identifiers never are.

**§5.** Numbers come from `scripts/measure-ui.js` at three widths. Say where and when you measured (build, mode, data). If you had to estimate, say so.

**§6.** Twenty short entries. Each names a real element and carries evidence. Merge laws that produce the same directive rather than repeating it. If the user supplied a list with errors, the corrected names go here and the correction goes in your reply.

**§6 copy audit.** Use the real strings and name the state each appears in. Errors, destructive confirmations and the empty state usually carry the most value.

**§7.** When the user asks for a feel ("premium, like Google or Apple"), translate it into specifics: Apple HIG's clarity, deference and depth used only where it means something; Material 3's precise type and spacing scales and adaptive layout. Keep the existing brand unless the user decided otherwise in phase 5.

**§8.** The parity checklist is the redesign's contract. Build it from the phase 2 inventory: every piece of information, interaction, state and permission tier. Group by area of the screen.

**§9.** Bugs found in phase 2 that a redesign could easily carry over. Keep each to one line.

**§10.** Suggest the affordances your audit wants (undo, jump-to, a finished state), tagged. Say explicitly what the tool should *not* invent (for example publishing, locking, payment).

**§12.** Every target maps to a §5 measurement, so the build can be checked with the same script. The copy targets map to the script's `copy` and `forms` sections; the sentence-length numbers are starting points to tune, not researched limits.

**§13.** Five to ten questions. Good ones are decisions with real trade-offs: where a week-level item lives at every width; how a draft reads against a final item without dashed borders; how the design tells apart people who share a name.

## Handing it over

Save the brief in the repo (`docs/design-brief-<screen>-v<N>.md`). Then give the user:

1. The text to paste into the design tool (the brief itself, or a short opener plus the file).
2. What to attach: screenshots of the current screen's main states, and the repo if the tool can read it (Claude Design can build from a codebase and a design system).
3. What to bring back: the handoff bundle (prototype, README) or a link to it.

A short opener that works:

> Redesign <screen> from the attached brief. Read it all first. Build one HTML prototype seeded with §4 that shows every state in §8, a "Why this shape" panel tying each decision to §6 and §2, a copy deck of every string by state, and a handoff README that maps §8 and answers §13. Tag anything new NEW or NEW·API.
