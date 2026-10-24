# DESIGN.md template

Copy into the repo root as `DESIGN.md`. Fill every value. Suggest to the user adding `Read DESIGN.md before any UI work.` to the project's `CLAUDE.md` or `AGENTS.md`, so the contract loads even when no design skill triggers. Edit those files only if the user agrees.

```markdown
---
name: <product>
mode: operate | persuade | read
page-type: <from the catalog>
family: <from the catalog, or "as found">
stack: <framework, styling system, component library>
colors:
  bg: "oklch(L C H)"
  surface: "oklch(L C H)"
  text: "oklch(L C H)"
  text-secondary: "oklch(L C H)"
  border: "oklch(L C H)"
  accent: "oklch(L C H)"
typography:
  display: "<family>, <fallback>"
  body: "<family>, <fallback>"
  scale: [12, 14, 16, 20, 24, 32, 48]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders | ring-shadow | tonal
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# <Product> design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | ... | user / inferred from <where> / assumed (left to you) |
| Primary action | ... | ... |
| Audience and device | ... | ... |
| Assets and references | ... | ... |
| Content and proof | ... | ... |
| Must keep and scope (Improve) | ... | ... |

## Direction
One paragraph: the feeling, why this family, and the signature element.

## References
- <product>: <the specific thing taken from it>

## Components
- Button primary: height 36, padding 12/16, radius md, 14/500
- Card: padding 16, radius lg, depth per `depth`

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Borders only, no shadows | Dense data tables; shadows add noise | YYYY-MM-DD |
```

If the project already has a styling system, record what exists instead of inventing values, with the file each token lives in. Tokens in code stay the source of truth, and this file explains them.
