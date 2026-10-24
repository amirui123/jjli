# Reference audit: newsletter-card.html (grader only)

Not linked from `SKILL.md`. Eval agents must not read it. Measured at 375x812 with touch emulation, then hit-tested with the `references/hit-testing.md` snippet.

## Measured facts
- Label (38x17) sits inline, 4px left of the input (177x21). The button is 75x36, 4px to the input's right. "Learn more" is on the next line (74x17).
- `elementFromPoint` at the centre of the input **and** of the button returns `a.archive-link`. The hit-testing snippet reports 100% of the region as the link's effective target and lists `input#email` and `button` as intercepted controls. `::after` is generated (`position: absolute`, `inset: 0`), and the containing block is `section.promo` (`position: relative`).

## Reference grades (touch-first marketing surface)
| Law | Status | Why |
| :--- | :---: | :--- |
| 1 Hick | Pass | One action and one secondary link. |
| 2 Fitts (size) | Warning | Button 75x36 and input 177x21 are below the 44 goal on a touch-first surface. Measured, but see law 3. |
| 3 Jakob | **Fail** | The overlay captures clicks on the input and the Subscribe button, so the primary action doesn't work. Task-critical, so the **blocking rule** applies. |
| 4 Proximity | Pass | Label is 4px from its field. |
| 5 Miller | N/A | No comparison table. |
| 6 Doherty | Not assessed | Needs submit-to-response timing. |
| 7 Von Restorff | Warning | The primary action has the default grey fill while the secondary link is coloured and underlined. |
| 8 Minimize distance | Pass | Subscribe sits next to its field. |
| 9 Serial position | N/A | No navigation or ordered list. |
| 10 Peak-End | Not assessed | A conversion flow exists, but the confirmation response isn't in the evidence. |
| 11 Zeigarnik | N/A | Single step. |
| 12 Prägnanz | Pass | One card, simple stack. |
| 13 Similarity | Pass | Link looks like a link, button like a button. |
| 14 Connectedness | Pass | The border groups offer and form. |
| 15 Tesler | Pass | Only an email is asked for. |
| 16 Postel | Not assessed | `type=email` already strips surrounding whitespace, so client-side whitespace isn't a defect. Server-side normalisation is unknown. |
| 17 Aesthetic-Usability | Warning | Unstyled default controls with mismatched heights. |
| 18 Parkinson | N/A | Single step. |
| 19 Occam | Pass | One field. |
| 20 Pareto | Not assessed | Needs click data. |

Counts from the live render: 8 Pass, 3 Warning, 1 Fail, 4 N/A, 4 Not assessed. Score (8 + 1.5 + 0) / 12 = 79.17%. **Band: Needs Work** (blocking rule), even though 79% alone would be Good.

A source-only agent can reasonably differ on the rendered-size warnings and on Von Restorff and Aesthetic-Usability (which need a render). It must still catch the interception, apply the blocking rule, mark the evidence-limited laws Not assessed, and keep the score consistent with its own rows.

## Conformance notes (not scored)
- "Learn more" doesn't describe its destination (WCAG 2.4.4).
- 2.5.8 can't be judged until the overlay is fixed, because the overlay is itself a target covering both controls.
