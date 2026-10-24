# Extend

New UI inside a project that already has some. The existing code is the design. Consistency beats novelty.

## 1. Extract the contract

When there is no `DESIGN.md`, write one from the code, using [design-md-template.md](design-md-template.md) "as found": the tokens and where they live, the components and their variants, the layout shell, spacing and type in use. Record what exists, never invent values. Note inconsistencies you find in the existing code, without fixing them.

Done when you can build the new UI from named tokens and components without opening a style file for a value.

## 2. Close behavior gaps

The request usually decides the look. What it can leave open is behavior: which items come first, what an action requires, what the user sees after it. Infer from the code, the data and the API first. Run the question round in SKILL.md only for a gap that changes what you build, which is usually 0 or 1 question.

## 3. Pick the patterns

Take the page type from [patterns.md](patterns.md) for its sections and UX patterns. Ignore its style family: the project's own look is the family.

## 4. Build

- Use existing components and tokens first. Compose before you create.
- Add a component only when no existing one or composition fits, in the project's file and styling conventions.
- Add a token only when a value is missing, and record it in `DESIGN.md` with its reason.
- Match the project's patterns for routing, data loading, errors and naming.
- Leave existing pages and shared components as they look now. A shared change the feature needs is listed in the reply.

Done when the build or typecheck passes and every new value in the diff is a token reference.

## 5. Check and record

Run the render loop on the new UI and on one existing page, and compare the two tiles side by side: the new page should read as the same product. Record decisions. The reply lists any inconsistency you noted in step 1.
