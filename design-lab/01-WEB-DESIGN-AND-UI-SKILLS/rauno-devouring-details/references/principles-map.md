# Principles map

This document maps each of devour's twelve principles back to its primary sources across the five-layer lineage. Every principle is cited. None are original to me. The phrasing is mine for clarity and consistency, but the thinking is borrowed openly from people who have done the work.

For each principle: **primary sources** (the load-bearing influences), **secondary sources** (related), and **canonical exemplar** (the production work that demonstrates it best).

See [`lineage.md`](lineage.md) for the five-layer model and full attribution.

---

## 1. Honest motion

> If you animate it, it must communicate something the static state could not.

**Primary sources:**
- **Dieter Rams, principle 6** ... "Good design is honest" (Layer 1)
- **Don Norman** ... feedback as a first-class affordance (Layer 2)
- **Emil Kowalski** ... ["You Don't Need Animations"](https://emilkowal.ski/animations) (Layer 4)

**Secondary sources:** Bruce Tognazzini on feedback first principles; Christopher Alexander's "quality without a name" (decoration without function violates it).

**Canonical exemplar:** Sonner's toast lifecycle (loading → success → error). The motion does informational work; remove it and you lose meaning, not just polish.

**Anti-pattern:** A 200ms fade-in on a static element that has nothing new to communicate. The motion performs animation rather than communicating anything.

---

## 2. Physics over duration

> Real movement has mass, springs, and damping. Eased durations betray themselves as animation.

**Primary sources:**
- **Ollie Johnston and Frank Thomas** ... *The Illusion of Life* (1981), 12 principles of animation (squash and stretch, arcs, slow-in/slow-out) (Layer 0)
- **Imran Chaudhri / Bas Ording** ... iPhone rubber-banding and inertial scrolling (Layer 3)
- **Loren Brichter** ... pull-to-refresh (Layer 3)
- **Rauno Freiberg** ... Devouring Details, "Simulating Physics" chapter (Layer 4)
- **Emil Kowalski** ... [Animations on the Web](https://animations.dev), spring chapters (Layer 4)

**Secondary sources:** Bret Victor on dynamic feedback; the Apple HIG section on motion.

**Canonical exemplar:** iOS rubber-banding at the top of a scroll view. Indistinguishable from real physics, because it *is* real physics.

**Anti-pattern:** `transition: transform 300ms ease-out` for any movement that should feel like the user moved a thing. The ease curve is recognizable as animation, not interaction.

---

## 3. Commit on intent, not on contact

> Distinguish hover-passing-through from hover-with-intent.

**Primary sources:**
- **Bruce Tognazzini** ... First Principles of Interaction Design, the prediction principle (Layer 2)
- **Rauno Freiberg** ... Devouring Details, "Inferring Intent" chapter (Layer 4)
- **Linear team** ... keyboard-first navigation, hover delays for tooltips (Layer 3)

**Secondary sources:** Jakob Nielsen on response times; Don Norman on signifiers vs. affordances.

**Canonical exemplar:** Linear's nav hover state. Brief commit delay (~80ms) prevents hover flicker as the cursor passes over items en route to its target.

**Anti-pattern:** A tooltip that fires instantly on `mouseenter` and dismisses instantly on `mouseleave`. The cursor brushing past surfaces five tooltips in 200ms. Visual noise that punishes mouse movement.

---

## 4. Reversibility is craft

> Every optimistic state needs a believable error path.

**Primary sources:**
- **Dieter Rams, principle 6** ... "Good design is honest" (Layer 1)
- **Don Norman** ... gulf of evaluation, feedback (Layer 2)
- **Bret Victor** ... "Magic Ink" on state visibility (Layer 2)
- **Emil Kowalski** ... Sonner's lifecycle design (Layer 4)

**Secondary sources:** Andy Matuschak on user state preservation; cmdk's keyboard model.

**Canonical exemplar:** Sonner's `toast.promise()` API. One call sets up loading → success → error transitions, all with equal craft. The error path is not an afterthought.

**Anti-pattern:** Optimistic UI that shows "Saved!" for 1.5s with no error path. Or worse, a silent rollback that the user never sees.

---

## 5. Sequence carries meaning

> Stagger only when order matters. Otherwise, simultaneity.

**Primary sources:**
- **Ollie Johnston and Frank Thomas** ... *The Illusion of Life* (1981), 12 principles of animation (anticipation, staging, timing, follow-through) (Layer 0)
- **Edward Tufte** ... data-ink ratio, every choice signifies (Layer 1)
- **Bill Verplank** ... do/feel/know feedback model (Layer 2)
- **Rauno Freiberg** ... Devouring Details, "Motion Choreography" chapter (Layer 4)

**Secondary sources:** Disney's 12 principles of animation (anticipation, follow-through); Andy Matuschak on working memory.

**Canonical exemplar:** Linear's filter-pill animation. When you add a filter, the existing pills shift to make room and the new pill enters with a subtle scale-from-zero. The sequence (existing pills move first, new pill appears) communicates causality. Reverse the order and it reads as glitchy.

**Anti-pattern:** Staggered fade-in for a list of 10 items where order is arbitrary (e.g., user names sorted alphabetically). The stagger implies sequence; the data has none. Reads as decorative motion.

---

## 6. The fingertip and the cursor are not the same

> Touch targets, hit boxes, ergonomic distance, Fitts's law.

**Primary sources:**
- **Bill Buxton** ... Sketching User Experiences, input-first thinking (Layer 2)
- **Bruce Tognazzini** ... Fitts's law applications (Layer 2)
- **Apple HIG, original iPhone team** ... 44pt touch target standard (Layer 3)
- **Rauno Freiberg** ... Devouring Details, "Ergonomic Interactions" chapter (Layer 4)

**Secondary sources:** WCAG 2.5.5 touch target size; Linear's keyboard-first density model.

**Canonical exemplar:** iOS keyboard. Each key is visually small but has an oversized hit box that grows during touch-down to match what your finger thinks it tapped.

**Anti-pattern:** A 16px close button on a mobile dialog. Visible, technically tappable, fails Fitts every time.

---

## 7. Preserve user state across boundaries

> Loading must not lose your scroll, your selection, your draft.

**Primary sources:**
- **Bruce Tognazzini** ... state preservation as first principle (Layer 2)
- **Andy Matuschak** ... working memory, Patches (Layer 3)
- **Loren Brichter** ... Tweetie's state continuity across navigation (Layer 3)
- **Linear team** ... offline-first state preservation (Layer 3)

**Secondary sources:** Bret Victor's "Magic Ink" on state visibility; Don Norman on cognitive load.

**Canonical exemplar:** Linear's offline-first model. Open the app on a plane, navigate, edit, close ... reopen on the ground, everything is exactly where you left it.

**Anti-pattern:** A page refresh that resets scroll position to the top, loses unsaved form state, or returns to a default tab. Common, defended as "simpler," and quietly punishing for users.

---

## 8. Make affordances visible without making them loud

> Signifiers should be discoverable, not declarative.

**Primary sources:**
- **Don Norman** ... affordances and signifiers (Layer 2)
- **Naoto Fukasawa** ... super-normal, "without thought" (Layer 1)
- **Dieter Rams, principle 4** ... "good design makes a product understandable" (Layer 1)
- **Dieter Rams, principle 5** ... "good design is unobtrusive" (Layer 1)

**Secondary sources:** Andy Allen / NotBoring on considered restraint.

**Canonical exemplar:** macOS scrollbar (modern). Thin and present but invisible until you hover over the scroll region or scroll. Affordance is there when needed, decoration is not there when not.

**Anti-pattern:** A drag handle that's a 32px gradient bar with text "drag here." The signifier is so loud it dominates the surface. Compare to Vaul's drawer ... a 4px bar at the top, recognizable as a drag handle by everyone who has touched a phone, present without claiming attention.

---

## 9. Reduce decoration, increase information

> Every element earns its pixels.

**Primary sources:**
- **Jacques Bertin** ... *Semiology of Graphics* (1967), the theoretical foundation for visual variables as information grammar (Layer 0)
- **Edward Tufte** ... data-ink ratio (Layer 1)
- **Dieter Rams, principle 5** ... unobtrusive (Layer 1)
- **Dieter Rams, principle 10** ... "as little design as possible" (Layer 1)
- **Naoto Fukasawa** ... super-normal (Layer 1)

**Secondary sources:** Christopher Alexander on form following function; the entire Linear visual language.

**Canonical exemplar:** Linear's issue list. High information density, near-zero chartjunk. Every visible element communicates state, not decoration.

**Anti-pattern:** A dashboard card with a decorative gradient background, a stock-photo icon, a colored top border, and three font sizes ... communicating exactly one number. The decoration buries the data.

---

## 10. Density is a craft choice, not a default

> Linear's density and Notion's spaciousness are both right; choose intentionally.

**Primary sources:**
- **Josef Müller-Brockmann** ... *Grid Systems in Graphic Design* (1981), systematic grids as the foundation for intentional density (Layer 0)
- **Edward Tufte** ... density as a virtue when designed well (Layer 1)
- **Bret Victor** ... "Magic Ink" on dense information software (Layer 2)
- **Linear team** ... density as a productivity choice (Layer 3)

**Secondary sources:** Notion as the legitimate counter-example; Bloomberg Terminal as the extreme case for power users.

**Canonical exemplar:** The Vercel dashboard. High information density, but every space is intentional. Compare to a generic SaaS dashboard from 2018 with 80% whitespace and three KPIs.

**Anti-pattern:** Default density. The "we used the design system spacing tokens" answer. Density without intent reads as either oppressive (too tight) or bureaucratic (too loose).

---

## 11. Match the metaphor to the medium

> Do not paginate what should scroll. Do not modal what should be inline. Do not toast what should be persistent.

**Primary sources:**
- **Bill Buxton** ... Sketching User Experiences, the medium-shapes-the-message thesis (Layer 2)
- **Don Norman** ... mapping (Layer 2)
- **Rauno Freiberg** ... Devouring Details, "Interaction Metaphors" chapter (Layer 4)

**Secondary sources:** Loren Brichter's pull-to-refresh as a paradigm-creating example; Apple HIG modal vs. popover guidance.

**Canonical exemplar:** Notion's slash menu. The action surface is *inline* in the document, not a modal that interrupts. The metaphor (writing) and the medium (a contenteditable surface) match perfectly.

**Related exemplar:** Sonner and cmdk's singleton host pattern... see `exemplars.md`. Global overlays are conceptually singletons; implementation matches. Bundling a trigger and overlay into one component and rendering it multiple times (per breakpoint, per nav slot) produces orphan portals that block interaction on navigation.

**Anti-pattern:** A modal dialog for a single-field text edit when an inline edit would do. The modal is overkill; the friction loses people.

---

## 12. Type is a system, not a decision per element

> Scale, leading, weight, optical sizing follow rules.

**Primary sources:**
- **Josef Müller-Brockmann** ... *Grid Systems in Graphic Design* (1981), modular grids and systematic type scales (Layer 0)
- **Edward Tufte** ... typography as information hierarchy (Layer 1)
- **Christopher Alexander** ... pattern languages (Layer 1)
- **Sam Henri Gold** ... typography craft (Layer 4)
- **Vercel design org** ... Geist Sans/Mono as a system, not a font (Layer 4)

**Secondary sources:** Robert Bringhurst, *The Elements of Typographic Style*; Erik Spiekermann, *Stop Stealing Sheep*.

**Canonical exemplar:** Geist's type scale. Modular, predictable, every step justifiable. The system makes individual decisions easier and more consistent.

**Anti-pattern:** A page with `text-sm`, `text-md`, `text-base`, `text-lg`, `text-xl`, `text-2xl` all used within a single component. Each was a per-element decision; together they are noise.

---

## Coverage of Dieter Rams's 10 principles

For traceability, here is the explicit map from Rams's 10 principles to devour's spine:

| Rams                                    | Devour                                  |
|-----------------------------------------|-----------------------------------------|
| 1. Innovative                           | (out of scope ... innovation is a brief, not a review heuristic) |
| 2. Useful                               | #11 Match metaphor to medium            |
| 3. Aesthetic                            | #12 Type is a system                    |
| 4. Understandable                       | #8 Affordances visible                  |
| 5. Unobtrusive                          | #8 Affordances visible, #9 Reduce decoration |
| **6. Honest**                           | **#1 Honest motion, #4 Reversibility** (load-bearing) |
| 7. Long-lasting                         | (epigraph, tone) ... preference for stable physics over trendy easing |
| **8. Thorough down to the last detail** | **(epigraph of the entire skill)**      |
| 9. Environmentally friendly             | (light) ... performance, "do less" stance |
| 10. As little design as possible        | #9 Reduce decoration                    |

Five of devour's twelve principles trace primarily to Rams. Principle 6 ("honest") is the most important single influence on the spine.

**Note on HfG Ulm:** Rams's 10 principles did not originate in isolation. They descend from the systematic design method codified at the Hochschule für Gestaltung Ulm (1953 to 1968), where Otl Aicher, Max Bill, and Tomás Maldonado established that design proceeds from method and criteria, not from individual stylistic intuition. Rams worked within that tradition. The table above maps Rams to devour; this note maps Rams to Layer 0.
