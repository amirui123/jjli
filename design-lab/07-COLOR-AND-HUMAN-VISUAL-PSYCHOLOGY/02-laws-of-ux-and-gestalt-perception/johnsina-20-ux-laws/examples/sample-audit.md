# Worked example: newsletter sign-up card

This example shows the rubric, the Contextual, N/A and Not assessed handling, live hit-testing and the score arithmetic on a small fixture. Every measurement below was taken from the fixture rendered in Chromium at **375×812 with touch emulation**.

## Fixture

```html
<section class="promo" style="position: relative; max-width: 340px; padding: 24px; border: 1px solid #ccc; border-radius: 12px">
  <h2>Weekly design notes</h2>
  <p>One email every Friday. Unsubscribe any time.</p>
  <form action="/subscribe" method="post">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required>
    <button type="submit" style="height: 36px">Subscribe</button>
  </form>
  <a href="/archive" class="archive-link">Learn more</a>
</section>
<style>.archive-link::after { content: ""; position: absolute; inset: 0; }</style>
```

Measured layout: the label (38×17) sits inline, 4px left of the input (177×21). The button (75×36) is 4px to the input's right. "Learn more" is on the next line. The button has the browser-default grey fill, and the link is the default blue and underlined.

---

# UX Law Audit: Newsletter sign-up card

- **Surface type**: Marketing & Landing (touch-first: mobile viewport)
- **Evidence sources**: source code; live render at 375×812 (touch emulation). No server, timing or analytics.
- **UX Score**: **79%** (8 Pass, 3 Warning, 1 Fail, 4 N/A, 4 Not assessed). The calculation is (8 × 1.0 + 3 × 0.5 + 1 × 0.0) / (8 + 3 + 1) = 9.5 / 12 = 79.17%.
- **Band**: Needs Work. The unrounded 79.17% falls in Good (75 ≤ score < 90), but the blocking rule caps it: sign-up is the task-critical path, and it fails under law 3.
- **Scope note**: Usability heuristics only; not a WCAG/accessibility conformance result.

### Score breakdown
| Law | Status | Points | Observation / evidence |
| :--- | :---: | :---: | :--- |
| 1. Hick's Law | Pass | 1.0 | One action (Subscribe) and one secondary link. |
| 2. Fitts's Law (size) | Warning | 0.5 | Trigger: CTA. On a touch-first surface the button is 75×36 and the input 177×21, both below the 44×44 goal. *Measured, but see law 3: the overlay captures both.* |
| 3. Jakob's Law | **Fail** | 0.0 | Pressing Subscribe doesn't subscribe. `elementFromPoint` at the centre of the button **and** of the input returns `a.archive-link`, because its stretched `::after` covers the whole `position: relative` section. The convention "a button does what it says" is broken on the task-critical path. |
| 4. Law of Proximity | Pass | 1.0 | The label is 4px from its own input, and it's the only field. |
| 5. Miller's Law | N/A | – | Contextual trigger absent: no comparison table. |
| 6. Doherty Threshold | Not assessed | – | Trigger present (the form), but there's no server to time. Needs the time to the post-submit response. |
| 7. Von Restorff Effect | Warning | 0.5 | The primary action uses the default grey fill, while the secondary link is coloured and underlined, so nothing marks Subscribe as primary. |
| 8. Minimize Target Distance | Pass | 1.0 | Trigger: the form. Subscribe is 4px from the field it submits. |
| 9. Serial Position Effect | N/A | – | Contextual trigger absent: no navigation or ordered list. |
| 10. Peak-End Rule | Not assessed | – | Trigger present (an attempted conversion). The confirmation response isn't in the evidence, so the `/subscribe` result is needed. |
| 11. Zeigarnik Effect | N/A | – | Contextual trigger absent: single step. |
| 12. Law of Prägnanz | Pass | 1.0 | One bordered card, with a heading, text, a form row and a link. |
| 13. Law of Similarity | Pass | 1.0 | The link looks like a link and the button looks like a button. |
| 14. Uniform Connectedness | Pass | 1.0 | The border groups the offer and the form. |
| 15. Tesler's Law | Pass | 1.0 | Trigger: the form. Only an email address is asked for. |
| 16. Postel's Law | Not assessed | – | Trigger: an input field. On the client, the `type="email"` value sanitisation already strips leading and trailing whitespace (HTML spec), so that is not a defect. Server-side normalisation is unknown, and the server's handling of valid variants is needed. |
| 17. Aesthetic-Usability | Warning | 0.5 | Unstyled browser-default controls with mismatched heights (21px input next to a 36px button). |
| 18. Parkinson's Law | N/A | – | Contextual trigger absent: single step. |
| 19. Occam's Razor | Pass | 1.0 | A single field and no extra confirmation. |
| 20. Pareto Principle | Not assessed | – | Core for Marketing. Needs usage data for Subscribe vs the archive link. |

### Key findings
#### 1. Jakob's Law – Fail (task-critical, blocking)
- **Observed**: the archive link's stretched overlay captures taps on the input and the button.
- **Evidence / location**: hit-tests at the input and button centres return `a.archive-link`. The containing-block search starts at the anchor (`position: static`), and the nearest positioned ancestor is `section.promo` (`position: relative`).
- **Remediation**: remove the stretch, because the card isn't a single destination. Alternatively raise the form with `.promo form { position: relative; z-index: 2; }`.

#### 2. Fitts's Law – Warning
- **Remediation**: `min-height: 44px` on the input and the button.

#### 3. Von Restorff Effect – Warning
- **Remediation**: give Subscribe the accent fill, and leave the archive link as plain text weight.

#### 4. Aesthetic-Usability – Warning
- **Remediation**: style the controls with shared height, radius and font tokens.

### Not assessed — evidence needed
- Doherty: the time from submit to response.
- Peak-End: the confirmation page returned by `/subscribe`.
- Postel: the server's handling of valid address variants.
- Pareto: click data for Subscribe vs the archive link.

### Conformance notes (not scored)
- Link text "Learn more" doesn't describe its destination (WCAG 2.4.4). Use "Read past issues".
- 2.5.8 can't be evaluated meaningfully yet. The stretched overlay is itself a target that covers both controls, so any spacing circle intersects it. Re-check after the fix: the button (36px) passes on size, and the 21px-high input will need the spacing test against its neighbours, which are 4px away.
