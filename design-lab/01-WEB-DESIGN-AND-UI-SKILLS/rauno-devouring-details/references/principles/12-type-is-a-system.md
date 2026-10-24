# Principle 12 ... Type is a system, not a decision per element

> Scale, leading, weight, optical sizing follow rules.

## What it means

Typography is a system of relationships: each size, weight, leading, and spacing value exists in relation to the others. When type decisions are made per-element rather than from a system, the relationships are incoherent. Six font sizes in a single component do not communicate six levels of hierarchy; they communicate that each element was sized independently, and the user must interpret the noise.

## Why it matters

The pre-HCI source is Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1981), which established the typographic grid as an architecture... not a layout aid but the systematic structure within which every type decision becomes meaningful in relation to every other. Modular scales, baseline grids, and column structures are not style; they are the conditions under which type can form a language rather than a collection of per-element choices. Edward Tufte's information hierarchy principles extend this: visual encoding must be systematic to be readable, and inconsistent type signals inconsistent hierarchy. Christopher Alexander's pattern language makes the same structural claim: a pattern applied once is a coincidence, applied consistently it is a language. Sam Henri Gold's typography craft work translates this to the current web context. The Vercel design org's Geist type system demonstrates the production answer: every size is a role, every role has a justifiable relationship to the scale, and no element makes a type decision for itself.

## Register sensitivity

**`brand`** ... more tolerance for display typography with high contrast, multiple weights, and expressive character. A marketing page can have a 100px display headline in a custom face next to 16px body; a product UI cannot. Drift zone: multiple sizes or weights selected per-element instead of from a scale.

**`product`** ... strict. A tight modular type scale (typically 4-6 sizes) with disciplined weight choices. Body text between 14-16px in a neutral face. Display type rarely used at all. Tabular / mono used for numbers and counts, text use for prose. Violations fire as 🔴 BREAK.

**Common ground** ... absence of any typographic system fires in both (using `text-sm`, `text-md`, `text-base`, `text-lg`, `text-xl`, `text-2xl` all in one component is a 🟡 DRIFT or 🔴 BREAK in both registers). Mono face for prose or sans face for numerical counts fires in both... the principle is one voice, one system.

## Tactics

- Define 3-5 semantic type roles for the product: headline, body, label, caption, micro. Each role has a size, weight, leading, and tracking. Every element maps to a role, not to a size.
- Assign weight to semantic roles, not to elements. Bold is not "this looked right"; bold is "this is a primary data value."
- Apply `font-optical-sizing: auto` at the root CSS or on large display type. Variable fonts with `opsz` axes render correctly across the size range; without it, body-calibrated letterforms appear at display sizes.
- Large type uses tight leading (`leading-none` or `leading-tight`). Body uses generous leading (`leading-relaxed`). The system defines this; no element decides for itself.

## Anti-patterns

- **Six font sizes in one component:** `text-xs` through `text-2xl` all used within a single card, each chosen per-element. Together they are noise, not hierarchy.
- **Weight without a system:** `font-bold`, `font-semibold`, `font-medium`, and `font-normal` applied based on what looked right per element. Weight is a signal; without a system, the signal is arbitrary.
- **Body line-height on display type:** `leading-relaxed` inherited by a large heading. Display type at 48px with body leading reads as gapped and unintentional. The system gap is visible.
- **Inconsistent tracking:** `tracking-tight` on some headings, `tracking-normal` on others with no systematic rule. Tracking variation without a rule reads as unfinished.

## Exemplars

- **Geist type scale:** Modular, auditable, every step justifiable. Individual type decisions in the Vercel dashboard are not decisions... they are system lookups. The system is the decision.
- **Vercel dashboard:** Count the distinct font sizes in use. The number is small. The hierarchy is clear. The system is doing its job invisibly.

## Further study

- Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981) ... the Layer 0 source; modular grids and systematic type scales as the architecture for typographic decision-making
- Sam Henri Gold, samhenri.gold ... typography craft; the thesis that Layer 4 type work is increasingly the differentiator AI cannot easily reproduce
- Robert Bringhurst, *The Elements of Typographic Style* ... the foundational text for understanding type as a system of relationships
