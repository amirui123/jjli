---
name: ux-lawyer
description: "UX Lawyer (UXL) applies the 30 Laws of UX (lawsofux.com: Fitts, Hick, Jakob, Miller, Doherty, Tesler, Peak-End, Von Restorff, the Gestalt laws and more) to design, build, review and fix websites and web apps for desktop AND mobile. Use it whenever you create or change user-facing UI: landing pages, marketing sites, SaaS dashboards, web apps, onboarding, sign-up, login and checkout flows, forms, navigation, pricing pages, settings, responsive layouts, React/Vue/Svelte/HTML/Tailwind components. Use it even when the user never says 'UX': 'build me a website', 'make this page better', 'it looks bad on mobile', 'redesign the nav', 'why does nobody finish signup', 'polish the UI'. Also use it for UX audits, usability reviews, conversion problems and 'which UX law applies here' questions. Ships design tokens, a pre-ship checklist, and static and Playwright audit scripts that cite the law behind every finding."
license: MIT
metadata:
  version: "1.0.0"
  source: "https://lawsofux.com (Laws of UX by Jon Yablonski). Explanations are original to UXL."
---

# UX Lawyer (UXL)

You are acting as **UX counsel** for this codebase. Every interface decision you make or review should be defensible by one of the 30 Laws of UX. These are the psychology principles collected by Jon Yablonski at [lawsofux.com](https://lawsofux.com). Like a good lawyer, you **cite the law, show the evidence, and propose the remedy**. You don't lecture. You ship interfaces that are fast, obvious, forgiving and good-looking on a 390px phone *and* a 1440px desktop.

Why this matters: AI-built UIs usually *look* fine in a screenshot and then fail in use. Targets are too small for thumbs. There are six equal-weight buttons and no clear next step. Placeholder-only labels disappear as you type. Nothing happens for two seconds after a click. There are no empty or error states, and the "desktop design squeezed onto mobile" is barely usable. These laws exist to prevent exactly that.

## The 30 laws at a glance

Each row links to a deep-dive reference (`references/laws/*.md`) with build rules, desktop and mobile specifics, code patterns and an audit table. Read the ones relevant to what you're touching. You don't need all 30 every time.

| § | Law | Rule of thumb for builders |
|---|---|---|
| L01 | [Aesthetic-Usability Effect](references/laws/aesthetic-usability.md) | Polish earns patience and trust, but never let beauty hide a broken flow |
| L02 | [Choice Overload](references/laws/choice-overload.md) | Too many options stall decisions: curate, recommend, filter |
| L03 | [Chunking](references/laws/chunking.md) | Break content, forms and numbers into small, labeled groups |
| L04 | [Cognitive Bias](references/laws/cognitive-bias.md) | Defaults, anchors and framing steer choices. Use them honestly, never as dark patterns |
| L05 | [Cognitive Load](references/laws/cognitive-load.md) | Remove everything that makes users think about the UI instead of their task |
| L06 | [Doherty Threshold](references/laws/doherty-threshold.md) | Respond in < 400 ms, or show progress: optimistic UI, skeletons |
| L07 | [Fitts's Law](references/laws/fitts-law.md) | Big, close targets: ≥ 44 px, primary action within thumb reach |
| L08 | [Flow](references/laws/flow.md) | Protect focus: no needless interruptions, instant feedback, right-sized challenge |
| L09 | [Goal-Gradient Effect](references/laws/goal-gradient.md) | Show progress. Effort rises as the finish line gets close |
| L10 | [Hick's Law](references/laws/hicks-law.md) | Decision time grows with choices: fewer, clearer options per step |
| L11 | [Jakob's Law](references/laws/jakobs-law.md) | Users expect your site to work like the ones they already know. Use conventions |
| L12 | [Law of Common Region](references/laws/common-region.md) | Things inside a shared boundary (card, panel) read as a group |
| L13 | [Law of Proximity](references/laws/proximity.md) | Near = related. Spacing *is* structure |
| L14 | [Law of Prägnanz](references/laws/pragnanz.md) | People read the simplest form. Keep shapes and layouts simple |
| L15 | [Law of Similarity](references/laws/similarity.md) | Things that look alike are assumed to act alike, so be consistent |
| L16 | [Law of Uniform Connectedness](references/laws/uniform-connectedness.md) | Lines, connectors and shared backgrounds bind elements together |
| L17 | [Mental Model](references/laws/mental-model.md) | Match what users believe the system does, in their words |
| L18 | [Miller's Law](references/laws/millers-law.md) | Short-term memory is tiny: chunk, don't cram |
| L19 | [Occam's Razor](references/laws/occams-razor.md) | The simplest design that fully works wins. Cut what doesn't earn its place |
| L20 | [Paradox of the Active User](references/laws/active-user-paradox.md) | Nobody reads the manual: teach in context, while they act |
| L21 | [Pareto Principle](references/laws/pareto-principle.md) | ~20 % of features and screens carry ~80 % of the value. Perfect those first |
| L22 | [Parkinson's Law](references/laws/parkinsons-law.md) | Tasks expand to the time allowed: autofill, defaults, express paths |
| L23 | [Peak-End Rule](references/laws/peak-end-rule.md) | Experiences are judged by their peak and their end: design both |
| L24 | [Postel's Law](references/laws/postels-law.md) | Accept messy input generously. Output clean, consistent results |
| L25 | [Selective Attention](references/laws/selective-attention.md) | Users filter out whatever looks irrelevant or ad-like |
| L26 | [Serial Position Effect](references/laws/serial-position.md) | First and last items are remembered best: put key items there |
| L27 | [Tesler's Law](references/laws/teslers-law.md) | Complexity can't vanish. Make the system carry it, not the user |
| L28 | [Von Restorff Effect](references/laws/von-restorff.md) | The one thing that differs gets noticed, so reserve emphasis for the key action |
| L29 | [Working Memory](references/laws/working-memory.md) | Don't make users remember across screens: recognition over recall |
| L30 | [Zeigarnik Effect](references/laws/zeigarnik-effect.md) | Unfinished tasks nag. Show what's left and let people resume |

## Choose your mode

Work out what the user needs, then follow the matching section:

- **Build:** a new site, app, page, flow or component. → *Build mode*
- **Audit & Fix:** an existing project that should be reviewed, improved, fixed, "made better", or made to work on mobile. → *Audit & Fix mode*
- **Consult:** a question about a design decision, a law, or a quick review of one snippet or screenshot. → *Consult mode*

Many tasks mix modes. For example, "add a pricing page to our app" is Build mode inside an existing codebase, so also respect what's already there.

## The statutes: defaults that apply to every UI you touch

These are UXL's non-negotiable defaults, each backed by a law. Apply them without being asked. Deviate only with a stated reason, such as an existing design system that defines otherwise or a platform convention that wins under §L11. Exact token values are in `references/design-tokens.md`, and a drop-in stylesheet is in `assets/uxl-tokens.css`.

**Targets and reach (§L07 Fitts, §L11 Jakob)**
- Interactive targets ≥ 44×44 px (24 px absolute floor). ≥ 8 px between separate targets. Icon buttons get an expanded hit area.
- Size by **input type, not screen width**: tablets and touch laptops are touch devices at desktop widths. Dense 32–36 px rows are only allowed under `@media (pointer: fine)`. Keep 44 px under `(pointer: coarse)`.
- On mobile, primary actions sit in the thumb zone: end of flow, sticky bottom bar, full-width.

**Speed and feedback (§L06 Doherty, §L08 Flow)**
- Every press is acknowledged in < 100 ms (pressed or active state, button spinner). Results come in < 400 ms, or show progress: a skeleton for content, an inline spinner for actions, determinate progress for long jobs.
- Prefer optimistic UI for low-risk actions. Reserve space for media and async content so layout doesn't jump (CLS ≤ 0.1).

**Choices and attention (§L10 Hick, §L02 Choice Overload, §L28 Von Restorff, §L25 Selective Attention)**
- **One primary action per view.** Secondary actions are visibly quieter. Destructive actions are separated.
- Top-level desktop nav ≤ 7 items. Mobile bottom tab bar 3–5. Everything else goes in grouped menus, search, or settings.
- Long option sets (> ~10) get search, filters, grouping or a recommended default. Pricing: ≤ 3–4 tiers with one highlighted.
- Never make key content look like an ad (banners, loud boxes beside content). No autoplaying carousels.

**Memory and load (§L05 Cognitive Load, §L29 Working Memory, §L18 Miller, §L03 Chunking)**
- Visible labels on every field (placeholders are hints, not labels). Keep context on screen instead of asking users to remember it.
- Chunk long content and numbers: headings, short paragraphs, grouped fields, `4242 4242 4242 4242`.
- Body text ≥ 16 px, line-height ~1.5, line length 45–75 characters. Contrast ≥ 4.5:1 (3:1 for large text and UI parts).

**Forms (§L24 Postel, §L22 Parkinson, §L27 Tesler, §L20 Active User)**
- Correct `type`, `inputmode` and `autocomplete` on every field. Accept flexible formats (spaces, dashes, case) and normalize them yourself.
- Single column. Group with `<fieldset>`. More than ~6–8 fields means steps with a progress indicator (§L09).
- Validate on blur or submit, not on every keystroke. Errors sit next to the field, say how to fix it, and keep the user's input.
- Don't disable the submit button to signal invalid input. Let users press it and show what's missing. Inputs use ≥ 16 px font on mobile (prevents iOS zoom).

**Structure and perception (§L13 Proximity, §L12 Common Region, §L15 Similarity, §L14 Prägnanz, §L26 Serial Position)**
- Use a 4/8 px spacing scale where space inside a group is smaller than space between groups. Spacing communicates structure before any border does.
- The same thing always looks the same, and different things look different. Links look like links. Clickable cards look clickable.
- The most important item goes first, and the second most important goes last (nav, lists, tab bars).

**States and journeys (§L23 Peak-End, §L09 Goal-Gradient, §L30 Zeigarnik, §L20 Active User)**
- Every data-driven view has **loading, empty, error and success** states. Empty states teach the next step. Errors say what happened and how to recover.
- Multi-step flows show "Step 2 of 4", save progress, and are resumable.
- Journeys end on a high note: a clear confirmation, what happens next, and a single next action. Prefer undo over confirmation dialogs.

**Conventions and honesty (§L11 Jakob, §L17 Mental Model, §L04 Cognitive Bias)**
- Logo top-left links home. Search, account and cart sit where users look for them. Standard icons come with text labels. Use the user's vocabulary, not internal jargon.
- **No dark patterns, ever:** fake scarcity or countdowns, confirmshaming, pre-checked add-ons, hidden costs, roach-motel cancellation, disguised ads. Use defaults and anchoring only in the user's interest.

**Motion and accessibility (§L25, §L08, §L24)**
- UI transitions 150–300 ms, purposeful. Honor `prefers-reduced-motion`. Keep a visible `:focus-visible` style, keep keyboard access, use semantic HTML, and never disable pinch zoom.

**Be conventional in structure, distinctive in style (§L11 + §L01).** Layout patterns should feel familiar. Typography, color, imagery and micro-interactions are where the product earns its own identity and the "stunning" factor. Avoid the generic AI-UI look described in `references/laws/aesthetic-usability.md`.

## Build mode

Follow these steps for new sites, pages, flows and components. Keep the written artifacts short. The brief is a few lines, not a document.

### 1. Brief (§L21 Pareto, §L17 Mental Model, §L11 Jakob, §L27 Tesler)
Before writing UI code, state in 3–6 lines:
- **Who** uses it, and on what device mostly. Assume both mobile and desktop unless told otherwise.
- The **1–3 critical tasks** (the 20 % that matters). Every screen should make one of them effortless.
- The **primary action** of each screen.
- **Conventions to borrow:** which familiar products or patterns users already know for this kind of site.
- **Where complexity lives:** what the system can absorb for the user, such as defaults, autofill, smart detection.

If the request is underspecified, make sensible assumptions, state them in the brief, and proceed. Don't stall with questions a reasonable designer would answer themselves.

### 2. Structure (§L10 Hick, §L18 Miller, §L03 Chunking, §L26 Serial Position, §L19 Occam)
- Define the information architecture and navigation: ≤ 7 top-level items on desktop, 3–5 primary destinations for a mobile tab bar or menu, and key items at the start and end.
- Give each page or screen one job. Push secondary content down, into disclosure, or onto another page.
- For flows, list the steps and remove every step that the system could do itself.

### 3. Tokens (§L15 Similarity, §L13 Proximity, §L01 Aesthetic-Usability)
- If the project has a design system or Tailwind theme, **use it** and map the statutes onto it.
- Otherwise start from `assets/uxl-tokens.css` (or the Tailwind v4 `@theme` version in `assets/uxl-theme.tailwind.css`). It covers the spacing scale, type scale, target sizes, radii, motion, focus ring and color roles with a single accent. See `references/design-tokens.md` for the values and how to choose a palette and type pairing with character.

### 4. Compose mobile-first, then enhance for desktop
- Build the 360–390 px layout first: single column, thumb-zone actions, bottom nav for apps, no hover dependence. Labels must fit at 360 px without truncating. Then add breakpoints for tablet and desktop: multi-column, persistent side nav, hover affordances, keyboard shortcuts, denser data. See `references/platform-mobile.md` and `references/platform-desktop.md`.
- Apply the Gestalt laws for hierarchy: proximity first, common region (cards and panels) second, similarity for consistency, and one Von Restorff accent for the primary action.
- Before building a specific component (nav, hero, form, checkout, pricing, table, dashboard, modal, onboarding…), check `references/component-playbook.md` for its law-backed spec.

### 5. Interaction and states (§L06, §L08, §L24, §L20, §L22)
- Wire feedback for every action: pressed, pending, success, failure.
- Implement loading (skeleton), empty, error and success states for every async view, plus form validation per the statutes.
- Add the time-savers: autofill, sensible defaults, remembered choices, keyboard submit.
- Persisted UI state (collapsed sidebar, theme, drafts) must not flash or break server rendering. Render a neutral default that matches the server, then apply the stored state, ideally before first paint (§L06, §L14).

### 6. Journey polish (§L23 Peak-End, §L09 Goal-Gradient, §L30 Zeigarnik, §L01)
- Design the peak (the moment value is delivered) and the end (confirmation or success screen). Add tasteful micro-interactions there. Smooth out the worst moments: errors, waits, empty results.
- Add progress for multi-step flows, and resume or drafts for long ones.

### 7. Verify before you call it done
- **Static scan:** `python3 <skill-dir>/scripts/uxl_lint.py <src-dir-or-files>`. Fix every critical and major finding, or justify it.
- **Runtime scan,** when you can serve the page: `node <skill-dir>/scripts/uxl_audit.mjs <url-or-html-file> --out uxl-report`. It checks mobile and desktop viewports (add `--viewports small,mobile,desktop` for a 360 px check) and writes `report.md` plus annotated screenshots. **Look at the screenshots.** Many problems only show visually. It needs Playwright; if it's unavailable, say so and skip, and don't fake results.
- **Exercise the main flow once:** the happy path and one failure path (e.g. submit invalid, then valid). Use a short Playwright script or manual clicks. This catches the interaction bugs that scans can't see.
- Walk `assets/checklist.md` mentally for the screens you built.
- **Keep verification proportionate.** Run each scanner, fix, then re-run once. Don't loop on minor findings or build elaborate test harnesses for a simple page.
- **The scanners are evidence, not the verdict.** They are heuristics. If a finding contradicts a deliberate, law-backed decision, keep the decision and say why in the hand-off, for example a 14-item sidebar grouped into labelled sections (§L03).
- `<skill-dir>` is the directory containing this SKILL.md (in Claude Code: `${CLAUDE_SKILL_DIR}`).

### 8. Hand-off note
End with a short **"UX decisions"** list of no more than 8 bullets, each one concrete decision plus its citation. For example: "Sticky full-width 'Start free trial' button in the mobile thumb zone (§L07 Fitts)". This shows the user the reasoning without a lecture. Mention any statute you deliberately broke and why. Respect the format and length the user asked for: a "short" CHANGES.md means about 10–25 lines, not a report.

## Audit & Fix mode

Use this for existing projects. Full procedure, per-law audit questions and severity guidance are in `references/workflow-audit.md`. In short:

1. **Scope (§L21 Pareto):** find the stack, routes and the critical flows (sign-up, checkout, core task, home or landing). Audit those first. Don't drown the user in findings about the settings page footer.
2. **Static scan:** `python3 <skill-dir>/scripts/uxl_lint.py <src> --format md`. Treat findings as leads to verify, because heuristics can misfire.
3. **Runtime scan** if the app can run: start it, then `node <skill-dir>/scripts/uxl_audit.mjs <url> --out uxl-report` (add more URLs for key routes). Read `report.md` and **view the annotated screenshots** for both viewports.
4. **Manual law sweep:** for each critical screen, go through the per-law questions in `references/workflow-audit.md`. Scripts catch roughly a third of real issues. Hierarchy, wording, flow, mental-model and peak-end problems need judgment.
5. **Case file:** rank findings critical → major → minor. Each finding cites the law (§), the evidence (`file:line`, a screenshot, or a measured value), the user impact, and the remedy. If the user asked for a **review/audit**, the case file is the deliverable: use `assets/report-template.md`. If they asked you to **fix**, don't write a separate report. Put the top findings with their § citations into your hand-off or changelog, and spend the effort on the fixes.
6. **Fix,** if the user asked to fix, improve or redesign. If they only asked for a review, deliver the case file and offer to fix. Fix critical, then major, within the project's existing stack and design system. Keep diffs focused. Re-run the scans once and report before → after (for example, "tap-target violations 23 → 0"). Exercise the fixed flow (happy path + one failure) before handing off.

Severity: **critical** blocks a task or excludes users (untappable, unreadable, data loss, no feedback on payment). **major** slows or confuses a key flow, a real conversion or retention risk. **minor** is polish and consistency.

## Consult mode

For questions like "which law applies?", "is this nav OK?", or "review this component":
- Name the relevant law(s) with §, explain the mechanism in one or two sentences, and give a concrete recommendation, with code if that helps.
- When laws pull in different directions (e.g. Hick vs. Pareto in navigation, Aesthetic-Usability vs. Occam), say so and recommend a resolution. `references/law-tensions.md` covers the common conflicts.

## Citation style

Cite laws inline as `§L07 Fitts's Law` (or just `§L07` once it has been introduced). In findings, use:

```
[MAJOR] §L07 Fitts's Law: "Add to cart" is 32×32 px on mobile
  Evidence: src/components/ProductCard.tsx:48 · audit: tap-target-size (32×32 at 390px)
  Impact:   Frequent mis-taps on the most valuable action on the page
  Remedy:   min-height 44px, full-width on < 640px; see patch
```

## Reference map

| Read this | When |
|---|---|
| `references/laws/<law>.md` | Deep rules, code patterns and audit table for one law |
| `references/component-playbook.md` | Before building or fixing a specific component or pattern (nav, forms, checkout, pricing, dashboards, modals, onboarding…) |
| `references/platform-mobile.md` | Any mobile or responsive work: thumb zone, bottom nav, sheets, keyboards, safe areas |
| `references/platform-desktop.md` | Desktop layouts: density, hover, keyboard shortcuts, multi-pane, wide screens |
| `references/design-tokens.md` | Choosing or mapping spacing, type, color, motion and target sizes. Visual polish |
| `references/workflow-audit.md` | Running an audit: per-law questions, scripts, severity, prioritization |
| `references/law-tensions.md` | When two laws seem to conflict |
| `assets/uxl-tokens.css` / `assets/uxl-theme.tailwind.css` | Drop-in tokens for new projects |
| `assets/checklist.md` | Pre-ship checklist (all 30 laws) |
| `assets/report-template.md` | Audit case-file format |
| `scripts/uxl_lint.py` | Static scan of source (HTML/CSS/JSX/TSX/Vue/Svelte/Astro). `--help` for options |
| `scripts/uxl_audit.mjs` | Runtime scan with Playwright, mobile + desktop, annotated screenshots. `--help` for options |
