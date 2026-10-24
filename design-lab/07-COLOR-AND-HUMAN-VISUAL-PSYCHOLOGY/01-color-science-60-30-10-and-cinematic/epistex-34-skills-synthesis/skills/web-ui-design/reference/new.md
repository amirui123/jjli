# New

A surface with no UI yet. Clarify first, so the patterns are chosen, not guessed.

## 1. Question round

Run the question round in SKILL.md. Then write the Brief into `DESIGN.md` at the project root, using [design-md-template.md](design-md-template.md):

- **Subject**: what the product is and its world (materials, vernacular, industry).
- **Primary action** of this screen, and the audience with their main device.
- **Mode**: *Persuade*, *Operate* or *Read*, from the page type.
- **Assets**: brand colors, logo, type, references, and the real content and proof the user gave. Missing facts and proof follow point 5 of the question round.

Done when every Brief line has a value and a source.

## 2. Pick the patterns

From [patterns.md](patterns.md), pick:

- the **page type**, which gives the sections in order, the UX patterns and the rendering budget;
- the **style family**, which gives the starting tokens. Use the family the user chose. Otherwise pick the one that fits the subject and audience, with a one-line reason.

Name 2 or 3 real products from the subject's world and the specific thing each contributes ("Linear's 13px dense table rows", not "clean like Linear"). Use the user's references first.

Done when the page type, family and references are written in `DESIGN.md`.

## 3. Tailor

Turn the family's starting tokens into this subject's tokens in `DESIGN.md`:

- Color: 4 to 6 named values with roles, one accent. Brand colors from the user come first. Every other color names its source in the subject's world. A color with no source gets replaced.
- Type: 1 or 2 families with roles, and a type scale.
- Spacing base (4px), radius scale, one depth strategy, motion tokens.
- The **signature element**: one thing on the screen only this subject would have, such as a tide chart on a sailing school's booking page or a live diff on a code review tool.

Check the plan against **Tells** in the rules. Any part you would have produced for any similar brief gets revised, with the change and reason stated.

Done when every token has a value and a reason tied to the Brief.

## 4. Build

Use the stack the request or repo names. With none, take the rendering line of the page type in the catalog. Use the tokens from `DESIGN.md` only, never literal values. Build every state the screen can reach and the UX patterns the page type lists. Follow the rules section by section.

## 5. Check and record

Run the render loop, then record decisions, both in SKILL.md. The final reply lists every assumption from the question round.
