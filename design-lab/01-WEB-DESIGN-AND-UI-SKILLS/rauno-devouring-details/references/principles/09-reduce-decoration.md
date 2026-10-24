# Principle 9 ... Reduce decoration, increase information

> Every element earns its pixels.

## What it means

Decoration is any element that occupies visual space without communicating information the user needs to act. The test is subtraction: remove the element and see whether the user loses any ability to understand or use the surface. If they lose nothing, the element is decoration. Applying this test rigorously leaves surfaces that are denser, clearer, and faster to scan.

## Why it matters

The pre-HCI source is Jacques Bertin's *Semiology of Graphics* (1967), which established that visual variables (position, size, shape, value, color, orientation, texture) are a grammar with rules... not an aesthetic palette to fill arbitrarily. Decoration, in Bertin's terms, is the occupation of a visual variable without communicating the information that variable is capable of carrying. Edward Tufte's data-ink ratio is the practice-manual extension of Bertin's grammar: maximize the proportion of ink (or pixels) devoted to displaying data, minimize the proportion used for everything else. Dieter Rams's principle 10 ("good design is as little design as possible") makes the same claim from the product design direction. Naoto Fukasawa's super-normal applies it to the everyday object: the thing that does its job without drawing attention to itself. The Linear issue list is the current software production example: high information density, near-zero chartjunk, every visible element communicating state.

## Register sensitivity

**`brand`** ... decoration earns more room. Editorial layouts, custom illustration, display typography, and decorative motion on hero surfaces all fit. A landing page with a bespoke hero is not a #9 finding. Drift zone: "generic dark SaaS" decoration that doesn't come from the brand's language (random gradients, placeholder-style icons, cards stacked on cards).

**`product`** ... decoration is #9's primary hunting ground. Decorative gradients, icon-for-icon's-sake, card-on-card nesting, ornamented headers all fire. Tool UI earns decoration only when it carries information (state indicators, progress, severity). Chartjunk in the dashboard sense.

**Common ground** ... decoration that doesn't come from the design system fires in both. Chartjunk (Tufte) fires in both. Unearned visual weight fires in both. Icons with no semantic link to the text they accompany fire in both.

## Tactics

- On functional surfaces (dashboards, data tables, editors), treat each decorative element as a proposal that requires justification. The gradient header needs to earn its pixels.
- Replace decorative dividers with spacing. A line that separates content can often be replaced by `mt-4`; the semantic separation is preserved, the chartjunk is not.
- For data cards, start from the number or the fact. Ask what additional context is needed to understand it. Add only that. The gradient background, the colored top border, and the stock-photo icon are not context.
- On marketing surfaces, decoration is a different calculation. This principle applies most strictly to working surfaces that users navigate repeatedly.

## Anti-patterns

- **Stat card with four competing design decisions for one number:** Gradient background, colored top border, decorative icon, three font sizes... for a single metric. The decoration is proportional to the design effort, not the information value.
- **Decorative dividers between list items:** Horizontal rules that add visual rhythm without marking a semantic boundary. Spacing does the same work without the pixel cost.
- **Motion as a quality proxy:** Entrance animations, hover microinteractions, and transitions that exist to signal "this is a quality product." The result is visual busyness without information gain.

## Exemplars

- **Linear issue list:** Status, priority, assignee, title, and label coexist in a single dense row. Near-zero decoration. Every visible element communicates state.
- **Geist Design System:** Semantic color tokens, not hex values. Every token has a role. Decoration without a role does not exist in the system.
- **Vercel dashboard:** Deployments, domains, build status, and commit messages coexist without chartjunk. More information per viewport than any comparable SaaS dashboard.

## Further study

- Jacques Bertin, *Semiology of Graphics* (1967) ... the Layer 0 source; visual variables as a grammar for information encoding
- Edward Tufte, *The Visual Display of Quantitative Information* (1983) ... the data-ink ratio and chartjunk; the practice manual built on Bertin's foundation
- Dieter Rams, principle 10 in *Less and More: The Design Ethos of Dieter Rams* (Klemp & Ueki-Polet, 2009)
