---
name: ux-laws
description: UX reading grid for justifying, critiquing, or designing interfaces using the laws of UX (Fitts, Hick, Jakob, Miller, Tesler...), Nielsen's 10 usability heuristics, Gestalt principles, and the cognitive biases relevant to interface design. Use this skill whenever an interface, component, user flow, or design decision is discussed, evaluated, or modified: whether in a product design conversation, a mockup review, a UX audit, or while Claude Code writes or edits front-end/UI code (forms, navigation, lists, dashboards, onboarding, etc.). Trigger even if the user doesn't explicitly say "UX", "law", or "heuristic"; simply discussing an interface, its usability, readability, or user journey is enough.
---

# UX Laws

This skill gives Claude a reading grid to ground its opinions, critiques, and design decisions in established UX principles, rather than in unjustified personal taste.

## When to use it

- Discussing or critiquing an interface, component, flow, or user journey
- Mockup review (Figma, screenshot, text description of a screen)
- UX audit of an existing product
- Claude Code writing, editing, or reviewing front-end/UI code: forms, navigation, menus, lists, dashboards, onboarding, error messages, loading states, pagination, search, etc.
- Weighing design options ("should we do A or B?")
- Writing guidelines, a design system, or justifying a product decision

## How to apply it

**The goal is to justify, not to lecture.** A UI critique or recommendation is stronger when it's grounded in a recognized law or principle, but cited naturally and functionally, never as an academic list bolted on.

- Name the law/principle only when it genuinely illuminates the decision (e.g. "we're capping the menu at 5-7 entries, beyond that cognitive load climbs fast, Miller's Law"), not in every sentence.
- One clear justification beats three laws cited in bulk.
- For a **structured audit** (the user explicitly asks to run an interface through a checklist), go through it methodically: Nielsen's heuristics first (the baseline for any usability audit), then the UX laws relevant to the context, then Gestalt if visual readability is at stake, then cognitive biases if the flow involves a user decision/conversion.
- For a **one-off critique or design decision**, pull the single most relevant principle directly instead of sweeping the whole list.
- Stay concrete: always tie the principle to the specific interface element in question, never a standalone abstract definition.
- If a design choice contradicts a principle for good reasons (technical constraint, business context, accessibility), say so, these laws are heuristics, not absolute rules.

## Quick reference

A selection of the most frequently invoked principles, for a fast answer without opening the reference files. For everything else (or for a full audit), consult the files in `references/`.

| Principle | In one sentence |
|---|---|
| Fitts's Law | The smaller or farther a target, the longer/harder it is to reach, frequent actions should be big and close |
| Hick's Law | More options mean longer decisions, reduce or prioritize choices |
| Jakob's Law | Users prefer things to work like the sites/apps they already know |
| Miller's Law | Working memory holds about 5 to 9 items, group information |
| Tesler's Law | Total complexity is irreducible, it must be absorbed by the system, not offloaded onto the user |
| Doherty Threshold | Under ~400ms response time, users stay engaged and productive |
| Von Restorff Effect | A visually distinct element is noticed and remembered better |
| Zeigarnik Effect | An interrupted/incomplete task stays in memory, useful for progress, frustrating otherwise |
| Postel's Law | Be liberal in what you accept as input, strict in what you produce as output |
| Aesthetic-Usability Effect | An interface perceived as beautiful is perceived as more usable, even at equal real usability |
| Peak-End Rule | An experience is judged mostly by its most intense moment and by how it ends |
| Serial Position Effect | The beginning and end of a list are remembered better than the middle |

## Reference files

- `references/laws-of-ux.md`: UX laws in detail (Fitts, Hick, Jakob, Miller, Tesler, Doherty, Von Restorff, Zeigarnik, Postel, aesthetic-usability, peak-end, serial position, goal-gradient, Occam's razor, Parkinson's law...) with a definition, practical implication, and concrete example for each.
- `references/nielsen-heuristics.md`: Nielsen's 10 usability heuristics, the baseline for any UX audit.
- `references/gestalt-principles.md`: Gestalt principles (proximity, similarity, closure, continuity, figure-ground, common region) for anything touching visual readability and organization.
- `references/cognitive-biases.md`: Cognitive biases relevant to design (anchoring, loss aversion, choice paradox, default effect, IKEA effect, confirmation bias, framing effect, social proof, scarcity, curse of knowledge), useful for decision/conversion flows and message writing.

Open the relevant file before developing a detailed answer or an audit; the quick reference above is enough for a one-off remark.

## Credits & sources

This skill is a synthesis, in original wording, of principles documented and popularized by others. It draws primarily on:

- **Laws of UX**: the naming and framing of most laws in `references/laws-of-ux.md` follows the corpus popularized by **Jon Yablonski** in *Laws of UX* ([lawsofux.com](https://lawsofux.com)).
- **Usability heuristics**: `references/nielsen-heuristics.md` is based on the 10 usability heuristics originally defined by **Jakob Nielsen** for the **Nielsen Norman Group**.
- **Gestalt principles**: `references/gestalt-principles.md` draws on Gestalt psychology, a field of research originating with Max Wertheimer, Kurt Koffka, and Wolfgang Köhler in the early 20th century, as commonly applied to visual/UI design.
- **Cognitive biases**: `references/cognitive-biases.md` covers biases from the broader behavioral psychology and behavioral economics literature (e.g. Daniel Kahneman, Amos Tversky, Richard Thaler), as applied to interface and product design.

None of the underlying frameworks were invented for this skill; credit for the original thinking belongs to the researchers and authors above.
