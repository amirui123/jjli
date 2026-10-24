---
name: ux-law-redesign
description: Runs an evidence-based UX redesign of an existing screen, dashboard, board, form or page. It studies the domain rules and the code, measures the current UI (height, truncation, text size, target size, visual noise), audits it against 20 laws of UX (Hick, Fitts, Jakob, the Gestalt laws, Miller, Doherty, Von Restorff, Tesler, Postel, peak-end, Pareto and others) plus UX-writing principles for its copy (buttons, errors, labels, empty states), writes a structured design brief for Claude Design or another AI design tool, and later implements the returned handoff without losing any function. Use when the user says a screen is clunky, messy, confusing, dated or hard to use and wants it redesigned; mentions UX laws or "laws of UX"; asks for a prompt or brief to give Claude Design, v0 or Figma Make; or comes back with a design prototype or handoff to build, even if they don't name this skill.
compatibility: Works best in Claude Code with a repo, subagents and a browser tool for measuring the live UI. Without a browser it falls back to reading code and screenshots.
---

# UX-law redesign

Turn "this screen is clunky" into a measured audit, a brief an AI design tool can execute, and an implementation that keeps every function. The value is in the evidence chain: domain rules → functional inventory → measured baseline → law-by-law findings → acceptance targets → handoff → the same measurements on the build.

## Workflow

Copy this checklist and keep it current:

```
- [ ] 1. Ground truth: the domain rules the screen must express
- [ ] 2. Inventory: every function, state and data field on the current screen
- [ ] 3. Baseline: measure the live UI at the widths people use
- [ ] 4. Audit: each law → evidence here → directive; then the copy audit
- [ ] 5. Decisions: ask the user only what is theirs to decide
- [ ] 6. Brief: write it from the template; save it in the repo
- [ ] 7. (Later) Implement the handoff: port the design, keep the rules
```

Phases 1–6 produce the brief. Phase 7 happens when the user comes back with the design tool's handoff. When the request is only one of these (an audit, a brief, or "build this handoff"), do that phase and the ones it depends on.

### 1. Ground truth

Before judging the UI, learn what it is for. Read the recent merges, specs and decision docs that define the rules the screen expresses, and who uses it for what. Pull the latest code first if the user asks, without discarding local work (stash or branch it, and say so).

Capture: the users and their weekly or daily tasks (with frequency, for Pareto), the hard rules (what the system refuses), the soft rules (what it flags but allows), the severity grades, the vocabulary users use, and the data contract the screen consumes. A redesign that misreads the rules produces a beautiful wrong screen.

For a large codebase, fan out up to three read-only subagents in parallel: one on the domain rules, one on the current screen's full functional inventory, one on prior design briefs, feedback from real users and the design system.

### 2. Inventory

List every function the current screen has: each piece of information shown, each interaction (including keyboard, drag and touch), each state (loading, empty, error, read-only, conflict, closed), each permission tier. This list becomes the brief's **parity checklist**, the guarantee that the redesign loses nothing. Also collect every visible string by screen and state (default, empty, loading, error, success, destructive confirmation) into a copy inventory; it becomes the brief's copy deck. Also note bugs you find; they go in the brief as "don't carry over".

### 3. Baseline

Numbers turn opinions into targets. Pick widths that match how people actually arrive: for a desktop tool, 1280×800, 1440×900 and 1920×1080; for a public site or anything people open on their phones, 390×844 plus 1280×800 and 1440×900. Check the product docs or analytics for this rather than assuming.

Read `scripts/measure-ui.js` and paste its contents into the page with the browser's JavaScript tool; it runs `measureUI()` once. Resize (don't reload) and call `measureUI()` again for each width; after any navigation, paste it again. Measure each state that matters (default, after the first click, first visit with the cookie banner). It reports page height in screens, truncated text, the smallest and share of small text, typefaces, undersized controls, distinct colours and borders, text below AA contrast, Unicode glyphs used as icons, and copy proxies (generic button and link labels, vague error text on screen, sentence length). Pass `keep:` a selector for text that must never be cut off (names, titles). Take screenshots of the main states for yourself.

Look for the one or two egregious findings a number can't show (for example: the most important name on the screen is squeezed out by a control). Put them in the brief with the numbers.

No browser tool? Estimate from the code and screenshots, and say that the figures are estimates.

### 4. Audit

Read `references/ux-laws.md`. For each law, write what it means **on this screen**: the evidence (a measured number, a file and line, a screenshot observation) and a concrete directive that names a real element. Skip nothing, but keep each to two or three sentences; a law with no finding says so in one line.

Then run the copy audit. Read `references/ux-copy.md`, walk the copy inventory against its principles and write 5–8 before → after pairs for the worst strings, using the real text from the screen and naming the state each one appears in. Errors, destructive confirmations and the empty state usually matter most. When citing research, use the evidence ratings in that file; several popular copy statistics are old, small or unverified.

If the user supplied their own list of laws, use it, and correct misnamed or duplicated laws out loud (for example "Zeigamnik" → Zeigarnik, "Tester's law" → Tesler's law, a duplicated Postel's law). People want to be told.

### 5. Decisions

Some choices change the brief and belong to the user. Typically: visual direction versus the existing brand, scope (one screen, the shell, the whole product), whether to add capabilities that need backend work, and anything the rules docs leave open. Ask them together, at most four, each with a recommended option first. Don't ask what you can decide or look up.

### 6. Brief

Read `references/design-brief-template.md` and write the brief from it. It should give the design tool everything it needs and nothing it can misread: what and who, the routine by frequency, the rules, real seed data (real names and a real week beat lorem ipsum), the measured problems, the law-by-law directives and copy audit, visual and copy direction (voice and tone), the parity checklist, bugs not to carry over, new affordances (tagged **NEW** for browser-only and **NEW·API** for backend changes), constraints, hard acceptance targets, the open questions it must answer in writing, and the deliverables, including a copy deck (every string by screen and state).

Keep the brief readable in one sitting, roughly 3,000–5,000 words: the full inventory, raw measurements and long evidence go in a separate audit file the user can attach alongside it.

Save it in the repo (for example `docs/design-brief-<screen>-v<N>.md`) and give the user the text to paste. Browser tools usually can't save screenshots to disk, so list the exact screenshots the user should take and attach (state, width), and suggest connecting the repo if the design tool can read one.

### 7. Implement the handoff

When the user returns with a prototype or handoff bundle, read `references/implementing-a-handoff.md` and follow it. The core rule: **the prototype is the source of truth for every pixel, string and interaction; it is never the source of truth for business rules.** Plan first (the user usually wants to see how each design element maps to code), then build, measure with the same script, and walk every prototype scene against the build.

## Gotchas

These came from a real redesign; each one cost time.

- **Prototypes invent rules.** A design tool will happily recompute business logic in the browser (verdicts, eligibility, suggestions) and get it subtly wrong. Port the design and interactions; keep reading the real system's rules. List every difference you deliberately keep.
- **Unanswered questions get answered in code**, by someone who wasn't in the room. The brief's open questions must be answered explicitly in the handoff, and the plan must answer any the handoff skipped.
- **Out-of-scope lists go stale.** A capability ruled out of scope twice became the real user's first request. Base scope on what users actually said and did.
- **Mocks invent capabilities.** Make the design tool tag anything new (NEW / NEW·API) and remove copy that claims something the build doesn't do.
- **Design tools fill the unhappy states with filler copy.** Without a copy deck you get "Something went wrong" and "No data". Ask for real strings for every error, empty and confirmation state, and check them against `references/ux-copy.md`.
- **Targets that aren't numbers get missed.** A density goal written as prose was missed by a third. State hard numbers, then re-measure the build with the same script.
- **Breakpoint-dependent controls go missing.** A control that moved between a rail and a drawer at one width became unfindable. Prefer one pattern at every width.
- **One visual treatment, one meaning.** The audit usually finds dashed borders, one accent colour or one glyph each carrying five or more meanings, and success messages styled as warnings.
- **Every pop-up needs a way out**: a visible × in the top-right corner, Esc, and a click outside that dismisses (without also triggering what's underneath).
- **Layout must not move under the pointer.** Text that appears in drop targets when a drag starts shifts rows away from the cursor; use overlays.
- **Overflow wrappers break sticky headers.** An `overflow` ancestor becomes the sticky element's scroll container.
- **Don't touch live forms.** On a public site, measuring and switching tabs is fine; typing into fields or submitting sends real data to real people. Accepting a cookie banner changes what you measure, so measure the first visit as it is.
- **Measure honestly.** Selectors can match more than you think (an aria-label prefix shared by an unrelated button); background browser tabs don't advance CSS transitions, so read inline styles rather than computed ones when the tab isn't visible, and a background tab can report a 0-pixel-wide viewport, which makes block text count as hidden (front the tab or set the viewport size first, and check `viewport` in the output).
- **Don't build into a running dev server's output directory** (for Next.js, `next build` over the dev server's `.next`); stop the server or build elsewhere.
- **The laws are heuristics, not physics.** Miller's 7±2 is not a menu limit; the Zeigarnik memory effect replicates poorly (use "people want to resume unfinished work" instead); WCAG 2.2 AA asks for 24×24 CSS px targets, Apple's default is 44×44 pt (minimum 28), Material's is 48×48 dp. `references/ux-laws.md` has the caveats.

## Reference files

- `references/ux-laws.md`: the 20 laws with definitions, what to look for, directives and caveats, plus others worth reaching for. Read in phase 4.
- `references/ux-copy.md`: UX-writing principles with evidence ratings, rules by component, and how to run the copy audit. Read in phases 4 and 6.
- `references/design-brief-template.md`: the brief's structure and what goes in each section. Read in phase 6.
- `references/implementing-a-handoff.md`: turning a design handoff into code without losing function. Read in phase 7.
- `scripts/measure-ui.js`: the baseline and acceptance measurements, including the copy proxies. Run it; don't paraphrase it.
