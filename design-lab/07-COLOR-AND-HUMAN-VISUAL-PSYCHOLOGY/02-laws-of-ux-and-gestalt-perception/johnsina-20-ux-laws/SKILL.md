---
name: ux-laws
description: >-
  Evidence-based UX audits of a page, flow or component against the laws of UX (Hick, Fitts, Jakob, Gestalt, Doherty, Peak-End), with a scored rubric, Not assessed handling and hit-area measurement rules. Use when asked to review, audit, score or critique UX or interaction design. Not a WCAG audit (use an accessibility review), a visual-style critique (see ui-styles) or performance profiling.
metadata:
  version: "1.3.0"
---

# UX & Interaction Design Laws Skill (v1.3)

A framework for **consistent, evidence-backed** UX reviews against 20 laws of UX and HCI. Every grade must cite observable evidence. If the evidence isn't available, the law is reported as *Not assessed* instead of guessed.

**Scope.** This skill grades usability heuristics. It does **not** certify accessibility: contrast, keyboard access, screen-reader semantics and WCAG conformance are out of scope, apart from the target-size note in §6. A high score doesn't mean a page is production-ready. State this in every report. For WCAG and Lighthouse audits, a companion such as [web-quality-skills](https://github.com/addyosmani/web-quality-skills) covers what this skill doesn't.

---

## 1. Evidence sources
| Source | Can assess | Cannot assess |
| :--- | :--- | :--- |
| Live page (browser tools; measure with [`references/page-probe.md`](references/page-probe.md)) | Layout, measured hit areas, interaction feedback, response timing, flows | Usage frequency, real user errors |
| Source code (HTML/CSS/JS) | Structure, static hit-area estimates, validation logic, defaults | Rendered layout (estimate only), timing |
| Screenshot / design file | Layout, grouping, hierarchy, visual emphasis | Hit areas, timing, behaviour |
| Analytics / research data | Frequency (Pareto), errors, drop-off | — |

Record which sources you had at the top of the report.

## 2. Statuses and score
| Status | Points | Use when |
| :--- | :---: | :--- |
| **Pass** | 1.0 | The evidence in §4 for Pass is observed. |
| **Warning** | 0.5 | The Warning evidence is observed: real friction that doesn't block the task. |
| **Fail** | 0.0 | The Fail evidence is observed: the task is blocked, mis-performed or seriously slowed. |
| **N/A** | excluded | The law doesn't apply to this surface (§3), or a Contextual law's trigger is absent. |
| **Not assessed** | excluded | The law applies, but the available sources can't show it (§1). List the evidence that would be needed. |

**Score formula:**

$$\text{UX Score} = \frac{\sum \text{points}}{\text{Pass} + \text{Warning} + \text{Fail}} \times 100\%$$

- N/A and Not assessed are excluded from both the numerator and the denominator.
- If **Pass + Warning + Fail = 0**, report **"No score — insufficient evidence"**. Never divide by zero or report 0%.
- Worked examples: 9 Pass + 1 Not assessed gives 9 / 9 = **100%**. 6 Pass + 2 Warning + 1 Fail gives 7 / 9 = **78%**. 0 assessed gives **no score**.

**Blocking rule.** A Fail on a task-critical path (the primary conversion, checkout, sign-up or the main job of the screen) caps the band at **Needs Work**, whatever the percentage.

**Bands (heuristic guidance, not certification).** Assign the band from the **unrounded** score, then display the score rounded to a whole percent:
- score ≥ 90%: Strong
- 75% ≤ score < 90%: Good, with friction
- 60% ≤ score < 75%: Needs Work
- score < 60%: Redesign recommended

## 3. Applicability matrix

Classify the surface first. For several pages or viewports, classify per template and combine evidence as [`references/multi-surface.md`](references/multi-surface.md) says.
- **Core:** always scored.
- **Contextual:** scored only if the named trigger element is present. Name the trigger in the Observation column. Mark it **N/A only when the evidence shows the trigger is absent** from the audited scope (for example, the full page source has no form). If the evidence can't show whether the trigger exists (a cropped screenshot, or one view of a long page), mark it **Not assessed** and name the missing view.
- **N/A:** not scored.

| # | Law | Marketing & Landing | SaaS & Dashboards | Forms & Wizards | Content & Docs |
| :-: | :--- | :---: | :---: | :---: | :---: |
| 1 | Hick's Law | Core | Contextual (menus, filters) | Core | Contextual (navigation) |
| 2 | Fitts's Law (target size) | Contextual (CTAs) | Core | Core | Contextual (navigation) |
| 3 | Jakob's Law | Core | Core | Core | Core |
| 4 | Law of Proximity | Core | Core | Core | Core |
| 5 | Miller's Law (memory load) | Contextual (comparison tables) | Core | Core | Contextual (long procedures) |
| 6 | Doherty Threshold | Contextual (interactive widget) | Core | Core | Contextual (search) |
| 7 | Von Restorff Effect | Core | Contextual (primary action) | Contextual (primary action) | Contextual (callouts) |
| 8 | Minimize Target Distance | Contextual (interactive widget) | Core | Core | N/A |
| 9 | Serial Position Effect | Contextual (navigation, ordered lists) | Contextual (navigation) | Contextual (step lists, long option lists) | Core |
| 10 | Peak-End Rule | Contextual (any conversion flow: form, sign-up, purchase) | Contextual (completable task) | Core | N/A |
| 11 | Zeigarnik Effect | Contextual (multi-step widget) | Contextual (onboarding checklist) | Core | N/A |
| 12 | Law of Prägnanz | Core | Core | Core | Core |
| 13 | Law of Similarity | Core | Core | Core | Core |
| 14 | Uniform Connectedness | Core | Core | Core | Core |
| 15 | Tesler's Law | Contextual (interactive widget) | Core | Core | N/A |
| 16 | Postel's Law | Contextual (input fields) | Core | Core | N/A |
| 17 | Aesthetic-Usability Effect | Core | Contextual (first-run screens) | Contextual (public forms) | Contextual (landing docs) |
| 18 | Parkinson's Law (time expectations) | Contextual (multi-step widget) | Contextual (long tasks) | Core | N/A |
| 19 | Occam's Razor | Core | Core | Core | Core |
| 20 | Pareto Principle | Core | Core | Contextual (optional fields) | Contextual (navigation) |

**Laws 2 and 8 never grade the same defect twice.** Law 2 grades the *size* of a target, and law 8 the *distance* to it. One element may appear under both only when there is separate evidence for each, such as a 20×20 Save button that is also far from its field. Never record one problem under both laws.

## 4. Evidence rubric

Option counts and similar numbers are **prompts to look closer, never grades by themselves**. Numeric thresholds appear only where an external source defines them. **Precedence:** if any Fail condition holds, grade Fail. Otherwise, if any Warning condition holds, grade Warning. Otherwise grade Pass when its evidence is observed. The law 6 timings (Doherty & Thadhani 1982; Card et al. 1991) are covered this way for every combination of acknowledgement and result time.

| # | Pass | Warning | Fail |
| :-: | :--- | :--- | :--- |
| 1 | Choices are organised for the task: grouped, ordered, or with a recommended default | A flat set of options with equal visual weight, and no default or grouping | Observed hesitation or errors, or the primary action can't be told apart from the alternatives |
| 2 | Primary and frequent targets meet the touch goal (§6) on touch-first surfaces, and are comfortable with a pointer | A primary or frequent target, **or any target within 8px of another target**, is below the touch goal on a touch-first surface | Measured interaction failure: overlapping hit areas or mis-taps on a primary action |
| 3 | Standard patterns behave as users expect (logo goes home, search in the header, recognisable controls) | A convention is changed but still discoverable; or a `<button>` inside a `<form>` has no explicit `type`, so it submits by default | A convention is broken so the task fails or misleads (a fake button, scrolling hijacked; an untyped Cancel, Close or Back button that submits the form) |
| 4 | Gaps between groups are clearly larger than gaps within groups. Labels sit nearest their own field | Spacing between groups and within groups is ambiguous in one region | Labels or controls read as belonging to the wrong item |
| 5 | Nothing must be remembered across screens. Long values are chunked | The user must recall a short value across one step | The task needs a value from another screen with no way to view or copy it |
| 6 | Acknowledgement ≤ 0.1 s, **and** one of: result ≤ 0.4 s; a progress or skeleton state until a result ≤ 10 s; or determinate progress (with cancel where possible) for longer work | Acknowledgement in 0.1–1 s; **or** result in 0.4–1 s with no progress state | No acknowledgement within 1 s; **or** result over 1 s with no progress state; **or** result over 10 s without determinate progress |
| 7 | One primary action or recommended item is distinct | Several elements compete with the same emphasis | The primary action is less prominent than a secondary one |
| 8 | Controls sit near the task (inline, contextual, next to the last field) | The control needs a long but direct move | The control is placed so it's routinely missed or needs repeated long moves |
| 9 | The key items are at the start or end of navigation and lists | A key item is buried mid-list | The primary destination is buried and observed to be missed |
| 10 | Completion and error states are clear, with next steps | The end state is generic but not confusing | No confirmation, an abrupt or blank end, or an error with no way to recover. A missing confirmation is evidence for Fail, not a reason for N/A |
| 11 | Progress is visible in multi-step flows ("Step 2 of 4") | Progress is shown but inaccurate or vague | No progress shown in a long mandatory flow |
| 12 | Clean alignment and predictable shapes *in the structure* | One region is visually ambiguous | The structure has to be decoded before it can be used |
| 13 | Same function, same look. Different function, different look | One inconsistent control style | Non-interactive text styled like links or buttons, or the reverse |
| 14 | Related items share a container or connector | A grouping relies on subtle whitespace only | A container wrongly groups unrelated items |
| 15 | The system absorbs complexity (smart defaults, auto-detection) | The user does avoidable work once | Internal complexity is exposed and required (raw IDs, config syntax) |
| 16 | Unambiguous variations are accepted and normalised (spaces in card numbers, phone formats) | Format rules are strict but stated up front | Valid input is rejected, or ambiguous input is silently guessed (e.g. `03/04/2026`) |
| 17 | Polish supports trust and hierarchy | Polish is uneven between regions | Polish hides broken function |
| 18 | Time and effort expectations are set ("~2 min", "3 steps") and defaults or autofill are used | No expectation is set in a long task | A simple task is spread over many screens with no indication of length |
| 19 | No redundant elements, fields or confirmations | Some removable clutter | Redundancy causes errors or blocks the task |
| 20 | Prime space goes to frequent actions (per usage data), and rare but critical actions stay findable | Rare actions take prime space | Frequent actions are hidden. **Without usage data, report Not assessed** |

## 5. Declared visual styles

If the project declares a visual style (for example one from the `ui-styles` skill, such as Scrapbook, Maximalism or Surrealism), **decoration that follows that style is not a violation**. Grade structure, not aesthetic: alignment of interactive elements, grouping, affordances and reading order. A tilted photo is decoration. A tilted form field is a structural defect.

## 6. Target size and hit-area measurement

### Usability (law 2) vs conformance (WCAG)
- **Usability goal:** 44×44 (Apple HIG, WCAG 2.5.5 AAA) or 48×48 dp (Material) on touch-first surfaces. Missing the goal is a **Warning**, never a Fail on size alone.
- **WCAG 2.2 AA (2.5.8) conformance note.** This is reported separately and doesn't change the score. A target under 24×24 CSS px is a *possible* 2.5.8 failure only after both of these checks:
  - **Spacing test:** a 24px-diameter circle centred on the target's bounding box must intersect neither another target nor the circle of another undersized target.
  - **Exceptions:** an inline target in text, an equivalent control elsewhere, a user-agent default control, or an essential presentation.

  Record which check decided the outcome.

### Measuring the real hit area
1. **Live page (preferred).** Find candidates first with [`references/page-probe.md`](references/page-probe.md); its `stretched` flag is a prompt, not a result. Then sample points across the visible card or row with `document.elementFromPoint(x, y)`. A point belongs to the target if the hit element is the anchor or button, or one of its descendants, **or** a container whose own or delegated handler activates the same action. Look for an inline `onclick`, `cursor: pointer`, and framework handlers in the DevTools Event Listeners panel. Page JavaScript can't see handlers added with `addEventListener`, so report such an area as **unknown, confirm manually**. Confirm only with a safe manual click on a non-destructive page, **never by submitting a live form**. A non-mutating snippet is in [`references/hit-testing.md`](references/hit-testing.md). This handles stretched links, overlays, clipping and whole-card handlers. If a whole-card handler has no semantic link or button, report it as an accessibility note.
2. **Static CSS only: estimate, and label it "static estimate".** First confirm the pseudo-element is **actually generated and hit-testable**: `content` isn't `none` or `normal`, `display` isn't `none`, `visibility` is visible, and `pointer-events` isn't `none`. On a page, read `getComputedStyle(anchor, '::after')`. If any of these fails or can't be determined, measure the anchor's own box or mark the estimate uncertain. For a generated stretched link, where `::before` or `::after` has `position: absolute` and `inset: 0`, the pseudo-element covers its **containing block**. Start the search **at the anchor that generates the pseudo-element**: if the anchor itself is positioned, the overlay covers only the anchor. Otherwise walk outward to the nearest ancestor that is positioned or that establishes one in another way. Examples of the latter are `transform`, `translate`, `rotate`, `scale`, `perspective`, `filter`, `backdrop-filter`, `contain: layout|paint|strict|content`, `container-type`, and the matching `will-change`. This list isn't exhaustive. Then check:
   - Clipping: an ancestor with `overflow: hidden`, `clip-path` or `mask` cuts the area down.
   - Overlays: a sibling with a higher `z-index` covers it.
   - Inert areas: `pointer-events: none` on the pseudo-element.
   - **Nested controls:** any other link or button inside a stretched-link card must be raised above the overlay (`position: relative; z-index: 2`), or it can't be clicked. Grade click interception under **law 3 (Jakob)** only, because a control that doesn't do what it shows breaks convention. Law 13 is reserved for misleading visual role matches.
   - **Link text:** the anchor's accessible name must describe the destination ("Learn more about Product X", or use `aria-labelledby`). A bare "Learn more" goes in the report as an accessibility note.

## 7. The 20 laws (summary)

Full detail, origins and caveats are in [`references/principles-breakdown.md`](references/principles-breakdown.md).

1. **Hick's Law.** $T = a + b\log_2(n+1)$ for choices among known, equally likely options. Organise choices and offer a default. Scanning unfamiliar menus is closer to linear search.
2. **Fitts's Law, target size.** Bigger targets are faster to acquire. Grades size only. Distance is law 8.
3. **Jakob's Law.** Users expect your product to work like the ones they already use.
4. **Law of Proximity.** Nearness implies relationship.
5. **Miller's Law, memory load.** Working memory is small (Miller 1956's 7±2 for span; Cowan 2001 suggests about 4 chunks). Don't require recall, and chunk long values. This doesn't cap the number of visible menu items, because visible items are recognised, not recalled.
6. **Doherty Threshold.** Feedback under 400 ms keeps users in flow.
7. **Von Restorff Effect.** The item that stands out is noticed and remembered.
8. **Minimize Target Distance.** The distance term of Fitts's Law: keep controls near the task.
9. **Serial Position Effect.** First and last items are remembered best.
10. **Peak-End Rule.** Experiences are judged by their peak and their end.
11. **Zeigarnik Effect.** Supporting rationale for progress cues. The memory effect replicates inconsistently, and the grade rests on visibility of system status (Nielsen heuristic #1) and goal-gradient.
12. **Law of Prägnanz.** People read structure in its simplest form.
13. **Law of Similarity.** Shared appearance implies shared function.
14. **Uniform Connectedness.** Connected elements are seen as related.
15. **Tesler's Law.** Complexity is conserved: the system should absorb it.
16. **Postel's Law.** Accept *unambiguous* variation and normalise it. Never silently guess ambiguous input.
17. **Aesthetic-Usability Effect.** Attractive designs are perceived as easier to use.
18. **Parkinson's Law, time expectations.** Set expectations and reduce effort. (The original law is an observation about work. Here it grades whether the time a task will take is communicated.)
19. **Occam's Razor.** Prefer the simplest design that does the job.
20. **Pareto Principle.** Most use concentrates on a few features. That needs usage evidence.

## 8. Report template (use this structure)

The score breakdown **must contain one row for each of the 20 laws**, including N/A and Not assessed, so the counts and the score can be checked against the rows. The four rows below are illustrative only.

```markdown
# UX Law Audit: [Page / Component]

- **Surface type**: [Marketing & Landing | SaaS & Dashboard | Form & Wizard | Content & Docs]
- **Evidence sources**: [live page | source code | screenshot | analytics]
- **Coverage** (several pages or viewports): [pages × viewports measured, and gaps; see references/multi-surface.md]
- **UX Score**: **XX%** | *No score — insufficient evidence* ([P] Pass, [W] Warning, [F] Fail, [NA] N/A, [NS] Not assessed)
- **Band**: [Strong | Good, with friction | Needs Work | Redesign recommended] [capped by blocking rule: yes/no]
- **Scope note**: Usability heuristics only; not a WCAG/accessibility conformance result.

### Score breakdown
| Law | Status | Points | Observation / evidence |
| :--- | :---: | :---: | :--- |
| 1. Hick's Law | Pass | 1.0 | Three pricing tiers, "Recommended" marked. |
| 2. Fitts's Law | Pass | 1.0 | Card uses a stretched link; hit-tested area 320×240 (live). |
| 16. Postel's Law | N/A | – | Contextual trigger absent: no input fields. |
| 20. Pareto | Not assessed | – | Needs usage analytics for nav items. |

### Key findings
#### 1. [Law] – [Warning | Fail]
- **Observed**: …
- **Evidence / location**: [selector, screenshot ref, measurement]
- **Remediation**: …

### Not assessed — evidence needed
- [Law]: [what evidence would allow grading]

### Conformance notes (not scored)
- [e.g. WCAG 2.5.8 possible failure: 18×18 icon button, spacing test failed against adjacent link]
```

### Audit-completeness checklist (check before sending)
- [ ] One row for each of the 20 laws (including N/A and Not assessed), evidence sources listed, and every Pass/Warning/Fail citing observable evidence.
- [ ] Every N/A cites the matrix's unconditional exclusion or the evidence that a Contextual trigger is absent; every Not assessed names the evidence needed.
- [ ] Score and counts recomputed from the rows (denominator = Pass + Warning + Fail), and the band assigned from the unrounded score.
- [ ] Blocking rule checked, and the scope note and conformance notes included.

A worked example is in [`examples/sample-audit.md`](examples/sample-audit.md). Never use it as a source of answers for a new audit.

## 9. Working with `ui-styles`
Grade structure, not aesthetic (section 5). The `ui-styles` index cites these laws against each style's risk. Use them as places to look, not as automatic findings. The two lists must agree, which `RELEASING.md` checks in both directions.

| Law to look at | ui-styles IDs |
| :--- | :--- |
| 1 Hick | `maximalism` |
| 3 Jakob (affordances, icon-only controls, focus visibility) | `cybercore`, `cyberpunk`, `minimalism`, `neumorphism`, `surrealism` |
| 4 Proximity (grouping when shadows are heavy) | `claymorphism` |
| 12 Prägnanz (rotated, overlapping or busy interactive items) | `glassmorphism`, `maximalism`, `scrapbook`, `surrealism` |
| 13 Similarity (raised vs pressed states) | `neumorphism` |
| 14 Uniform Connectedness (grouping) | `claymorphism` |
| 17 Aesthetic-Usability (polish masking function) | `glassmorphism`, `neo-brutalism`, `sketch` |

## References
- [`references/principles-breakdown.md`](references/principles-breakdown.md): each law's definition, scope and Do and Don't.
- [`references/hit-testing.md`](references/hit-testing.md): the live hit-area snippet.
- [`references/page-probe.md`](references/page-probe.md): the read-only page measurement snippet, false-positive rules and the viewport set.
- [`references/multi-surface.md`](references/multi-surface.md): coverage, per-template classification and how evidence combines across pages and viewports.
- [`references/provenance.md`](references/provenance.md): sources, caveats and what was not confirmed.
