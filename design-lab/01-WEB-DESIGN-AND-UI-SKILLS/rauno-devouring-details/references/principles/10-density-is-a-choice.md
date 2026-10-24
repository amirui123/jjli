# Principle 10 ... Density is a craft choice, not a default

> Linear's density and Notion's spaciousness are both right; choose intentionally.

## What it means

Density is not a scale from bad to good. It is a dimension that must be calibrated for the audience and the task. Linear is information-dense because product teams scan dozens of issues per session. Notion is spacious because writing requires breath. Neither got there by accepting design system defaults. The failure is not high density or low density... it is unexamined density.

## Why it matters

The pre-HCI source is Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1981): systematic grids are the architecture that makes density decisions legible rather than arbitrary. A dense layout without an underlying grid is not designed density... it is compressed layout. Müller-Brockmann's argument is that the grid is not a constraint applied from the outside; it is the logic that makes every element's position meaningful in relation to every other. Edward Tufte extends this: well-designed density is more usable, not less... small multiples and dense data displays allow comparison and pattern recognition that spacious layouts prevent. Bret Victor's "Magic Ink" makes the case for information software as a graphic design problem where density in service of comprehension is a virtue. The Linear team made density a named product principle: "speed as a feature" and "density as a craft choice" are in the Linear Method. The Vercel dashboard is the contemporary web example: high density, but every space is intentional.

## Register sensitivity

**`brand`** ... density is more often spacious. Marketing pages use whitespace to create rhythm and pace reading. Cramped brand pages feel desperate or bureaucratic. Fires when a brand surface tries to be dense without the system to support it (jammed pricing tables, cramped feature grids).

**`product`** ... density is more often dense. Linear, the Vercel dashboard, Notion, Bloomberg Terminal are references at different points on the density spectrum. Fires when product UI is spacious for no reason ("dashboard" with 80% whitespace and three KPIs). Also fires when density is unsystematic (random per-element spacing tokens).

**Common ground** ... density without systematic backing (grid, type scale, spacing tokens) fires in both. Default density (the design system's default used everywhere, without intent) is 🟡 DRIFT in both.

## Tactics

- Make an explicit density decision for each surface type in the product: working surface vs. reading surface vs. marketing surface. Document it in Devour Context.
- On high-frequency working surfaces, use compact row padding (`py-2 px-3`) to maximize the number of rows visible without scrolling. Do not apply card padding to tables.
- On spacious surfaces, intentional whitespace is communicating something: calm, hierarchy, breathing room. Each gap should be a decision, not a default spacing token.
- Density requires stronger typographic hierarchy, not weaker. If you compress space, increase contrast between primary and secondary information to compensate.

## Anti-patterns

- **Default density:** The "we used the design system spacing tokens" answer. The tokens describe the system; they do not make the product decision.
- **Card padding on a data table:** Generous padding on each row of an issue list or log table. The audience needs scan-ability, not breathing room. The padding serves a consumer-product aesthetic applied to a power-user surface.
- **Spacious layout on a high-frequency working surface:** Margins and breathing room appropriate for a landing page, applied to an app users navigate fifty times per day.
- **Dense layout without typographic hierarchy:** Items compressed without contrast. Not dense design... compressed design. The user must work to find entry points.

## Exemplars

- **Linear:** Information density as a named product decision. Issue rows carry status, priority, assignee, title, and label at a glance. The density is the feature.
- **Vercel dashboard:** High density, every space intentional. Compare to a generic SaaS dashboard from 2018 with 80% whitespace and three KPIs.
- **Notion:** Spaciousness is also a craft choice. Notion's whitespace supports writing and thought. It is not a default; it is a product decision for a different audience and task.

## Further study

- Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981) ... the Layer 0 source; systematic grids as the foundation for intentional density
- Bret Victor, "Magic Ink" (worrydream.com) ... information software as a graphic design problem; density in service of comprehension
- Edward Tufte, *Envisioning Information* (1990) ... small multiples and the case for designed density
