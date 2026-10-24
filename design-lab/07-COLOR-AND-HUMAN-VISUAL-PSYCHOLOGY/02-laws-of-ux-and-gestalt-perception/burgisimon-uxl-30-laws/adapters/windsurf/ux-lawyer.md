---
trigger: glob
globs: **/*.html,**/*.css,**/*.scss,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte,**/*.astro
description: UX Lawyer (UXL): the 30 Laws of UX for web UI
---

# UXL: UX Lawyer rules

> Generated from the [UXL skill](https://github.com/BurgiSimon/UXL) by `tools/build_adapters.py`. Do not edit by hand.
> The full skill (deep references per law, component playbook, tokens, static and Playwright audit scripts)
> works natively in agents that support Agent Skills: `npx skills add BurgiSimon/UXL` or see https://github.com/BurgiSimon/UXL#install.

When you create or change any user-facing UI (websites, web apps, pages, flows, components) for desktop **and** mobile,
act as UX counsel: every decision should be defensible by one of the 30 Laws of UX (https://lawsofux.com, by Jon Yablonski).
Cite laws as `§L07 Fitts's Law`. Build mode: brief (critical tasks, primary action per screen), structure, tokens,
mobile-first composition, all states (loading/empty/error/success), journey polish, then verify against the checklist.
Audit mode: scope critical flows, gather evidence, rank findings critical → major → minor with §-citation, evidence, impact, remedy; then fix root causes first.
End UI work with a short "UX decisions" list (≤ 8 bullets, each citing its law).

## The statutes: defaults that apply to every UI you touch

These are UXL's non-negotiable defaults, each backed by a law. Apply them without being asked. Deviate only with a stated reason, such as an existing design system that defines otherwise or a platform convention that wins under §L11. Exact token values are in `https://github.com/BurgiSimon/UXL/blob/main/skills/ux-lawyer/references/design-tokens.md`, and a drop-in stylesheet is in `https://github.com/BurgiSimon/UXL/blob/main/skills/ux-lawyer/assets/uxl-tokens.css`.

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

**Be conventional in structure, distinctive in style (§L11 + §L01).** Layout patterns should feel familiar. Typography, color, imagery and micro-interactions are where the product earns its own identity and the "stunning" factor. Avoid the generic AI-UI look described in `https://github.com/BurgiSimon/UXL/blob/main/skills/ux-lawyer/references/laws/aesthetic-usability.md`.

## The 30 laws: rules to apply

### §L01 Aesthetic-Usability Effect: Make the UI look deliberate with a strict type, space, and color system, then judge usability by watching behavior, not opinions.
- Use one type scale (ratio 1.2–1.333, 5–7 sizes), one 4/8px spacing scale, and one accent color on top of neutrals.
- Use one radius family and one shadow ramp of 2–3 levels across every component.
- Give content room: 45–75 character lines, 1.5 body line height, section gaps 2–4x component gaps.
- Skip the default AI look: purple-blue gradients, emoji as icons, everything centered, identical 3-up card grids.
- Measure task success, errors, and time. 'Looks great' feedback is not evidence: polish hides friction in tests.

### §L02 Choice Overload: Lead with a small, curated set of comparable options and one honest recommendation; give filters and comparison for the rest.
- Pricing: 3 tiers side by side (4 at most), with exactly one visibly marked as recommended.
- Catalogs: filters with live result counts, a sort control, and removable filter chips. Never an unfilterable wall of items.
- Open with a curated default (best sellers, starter template, recommended plan) and link to 'See all'.
- Make options comparable: same attributes, same order, same units. Offer side-by-side compare for 2–4 items.
- Onboarding: one question per step, 3–6 options, and always a 'Skip' or 'Not sure' path.

### §L03 Chunking: Group related information into small, labeled units so users can scan, understand, and finish each piece before moving on.
- Group related fields in a <fieldset> with a <legend>, one topic per group (contact, address, payment).
- Split long forms into steps by topic, not by field count. Name each step and show progress ('Step 2 of 4: Delivery').
- Put a descriptive heading every few paragraphs. Paragraphs run 2–4 sentences, one idea each.
- Format long numbers as users type (cards and IBANs in 4s) and accept pasted input with or without spaces.
- Every card in a set shares one anatomy: title, key fact, supporting detail, one primary action.

### §L04 Cognitive Bias: Users decide with mental shortcuts; set defaults, framing, and anchors so they choose well, and never use them to trick.
- Pre-select only what's best for most users. Paid add-ons, donations, and marketing or data consent start unchecked.
- Show the full price, including mandatory fees and taxes, from the first price the user sees.
- Make leaving as easy as joining: cancel online, in no more steps than it took to sign up.
- Back every urgency, scarcity, or social-proof claim with real, current data, or remove it.
- Decide what result would prove your design wrong before you test it.

### §L05 Cognitive Load: Strip out every bit of mental effort the interface adds on top of the task, so users spend their attention on their goal.
- Remove before you rearrange: every banner, duplicate link, field, or decoration must serve the screen's one task or go.
- Show the essentials first. Put advanced or rare options behind progressive disclosure, one level deep.
- Pre-fill a sensible default for every setting most users would accept unchanged.
- Label actions with verb + object ('Save draft', 'Delete 3 files'), never a bare 'OK', 'Submit', or unlabeled icon.
- Body text ≥ 16px, line-height 1.5, prose width 45–75ch (aim for ~65ch).

### §L06 Doherty Threshold: Acknowledge every input at once and respond in under 400ms; when you can't, show progress and keep the UI usable.
- Show visual feedback for every input within 100ms, and aim to complete the response within 400ms.
- Over ~1s, show a loading indicator. Over ~4–10s, show real progress (%, steps) and let people keep working.
- Use optimistic UI for actions that almost always succeed, and roll back with a clear message on failure.
- Meet Core Web Vitals at p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Reserve space for every image and embed.
- Never block input. Keep UI motion at 150–300ms and honor prefers-reduced-motion.

### §L07 Fitts's Law: The time to reach a target grows with its distance and shrinks with its size, so important targets should be big and close.
- Touch targets are at least 44x44 CSS px. 24x24 is the absolute floor (WCAG 2.5.8).
- Keep at least 8px between adjacent targets so neighbors don't get hit by mistake.
- Put the primary action where the pointer or thumb already is: at the end of the task, in the thumb zone on mobile.
- Grow the hit area, not only the visual: wrap labels around controls, make whole rows and cards clickable.
- Keep destructive actions away from frequent ones. Distance is deliberate friction.

### §L08 Flow: Keep people absorbed in the task: strip out interruptions, keep feedback instant, and match the challenge to their skill.
- Nothing interrupts before value: no modal on load, no native alert(), no forced sign-up before people try the product.
- Validate on blur, then live once a field is invalid. Never on the first keystroke, and never wipe input on error.
- Autosave work, show a quiet 'Saved' status, and make leaving and coming back lossless.
- Desktop: offer keyboard shortcuts (Esc, Enter, /, ⌘K) and show them in tooltips and menus.
- Mobile: input, select, and textarea font-size ≥ 16px so iOS doesn't zoom on focus. Keep pinch-zoom enabled.

### §L09 Goal-Gradient Effect: Show people how close they are to done, and keep the remaining distance short and real, so effort speeds up toward the end.
- Every flow longer than 2 steps shows position and total ('Step 2 of 4') or a labeled stepper.
- Keep flows to 3–5 steps, and never let the count shown at the start grow mid-flow.
- Give credit for real work already done (account created = item 1 checked). Never invent progress.
- Onboarding checklists have 3–6 items, and the first can be completed in under a minute.
- On mobile, use a compact stepper ('2/4' plus a thin bar) instead of a full row of labeled steps.

### §L10 Hick's Law: Cut the options visible at each decision point and point to a sensible default, so people can decide quickly.
- Desktop top nav: about 5–7 items. Mobile bottom tab bar: 3–5. Move the rest to 'More', a utility nav, or search.
- Give each view one primary action, mark the recommended option, and preselect a safe default.
- Past ~10–15 options, add type-to-filter search or a command palette instead of growing the list.
- Show the common options and reveal advanced ones on demand (progressive disclosure).
- Long lists in a known order (countries A–Z, years) are fine as one list. Add type-to-filter instead of splitting them.

### §L11 Jakob's Law: Users expect your site to work like the sites they already use, so follow established conventions and put originality into style.
- Logo top-left links home, search sits in the header, account and cart top-right. Mirror for RTL; never relocate them.
- Use native semantics: <a href> to navigate, <button> to act, underlined links in body text, real form inputs.
- Never break browser behavior: back button, Cmd/Ctrl-click, pinch zoom, find in page, text selection, native scroll.
- Be conventional in structure and interaction, distinctive in visual style and voice.
- Roll out big redesigns gradually: opt-in preview, staged release, temporary switch-back, hints only where things moved.

### §L12 Law of Common Region: Put things that belong together inside one shared container (card, panel, tinted area) and keep unrelated things outside it.
- One container holds one object or one task. If a card mixes two unrelated things, split it.
- Use the lightest boundary that works: background tint first, 1px border second, shadow only for floating layers.
- Show at most 2 levels of visible containers inside the page. Separate deeper sub-groups with spacing or a divider.
- Pad containers 16–24px, at least as much as the gaps inside them, and space containers apart by at least as much again.
- Put a group's actions inside its container. Actions outside every box read as page-level.

### §L13 Law of Proximity: Set related things close together and unrelated things far apart, so spacing alone shows what belongs to what.
- Inner spacing < outer spacing, always. The gap inside a group is at most half the gap between groups.
- Use a 4/8px scale: 4–8px inside a control, 12–16px between items, 24–32px between groups, 48–96px between sections.
- A label sits 4–8px from its input. The next field starts 16–24px below. Never make the two gaps equal.
- Headings sit closer to what they introduce than to what precedes them: e.g. 32–64px above, 8–12px below.
- Put help text, errors, units, and actions directly next to the element they belong to.

### §L14 Law of Prägnanz: Build screens from simple, regular shapes on shared alignments so users read the layout as one obvious structure at a glance.
- Align to one grid (4 columns mobile, 12 desktop). Keep distinct left edges per viewport to about 3–4.
- Items of one kind share size, aspect ratio, and radius. Vary shape only where the meaning differs.
- Icons are simple silhouettes from one family on a 24px grid, still recognizable at 16px.
- Skeleton screens match the final layout block for block, so content fills a shape users already parsed.
- If a chart needs a legend to be decoded, simplify first: ≤ 5–7 series, direct labels, no 3D.

### §L15 Law of Similarity: Make things that behave alike look alike and things that behave differently look different, and enforce it with design tokens.
- Same look means same behavior: one style per role (primary, secondary, link, destructive), reused everywhere.
- Underline links in running text. Color-only links need ≥ 3:1 against body text plus a hover and focus cue.
- Never give non-interactive text a link or button look: no accent color, underline, or pill shape on static content.
- One meaning per visual channel. If color means status, it doesn't also mean category.
- Take every color, size, radius, and shadow from tokens. A one-off value creates an unintended new group.

### §L16 Law of Uniform Connectedness: Physically join related elements with lines, shared surfaces, or attached shapes when spacing and boxes can't show the relationship.
- Tie sequences together with one continuous 2px connector that takes the accent color as steps complete.
- Attach the active tab to its panel: same background, no border between them.
- Anchor tooltips and popovers to their trigger with an 8–12px arrow or a flush edge.
- Fuse options that form one choice into one control (segmented control, button group, input + addon).
- Never connect unrelated things: full-width rules and shared bands imply relationships that aren't there.

### §L17 Mental Model: Design around how users believe the product works: use their words, match their cause-and-effect expectations, show what's clickable.
- Name things in users' words, taken from search logs, support tickets, and interviews, not internal or database names.
- Make affordances visible: buttons look pressable, links look like links, draggable items show a grip handle.
- Never require hover. Hover-revealed content and actions also need a tap, focus, and keyboard path.
- Switches apply immediately; checkboxes and fields in a form wait for Save. Don't mix the two models in one form.
- Show the result of every action (Saved, Sent, Archived, Deleted forever) so the user's model stays in sync.

### §L18 Miller's Law: People hold only a few chunks in mind at once, so group anything they must remember, verify, or retype into small, familiar units.
- Budget about 4 chunks for anything users must hold in mind, not 7±2. Fewer under stress, distraction, or on mobile.
- Display long numbers and codes in groups of 3–4: '482 913', '4242 4242 4242 4242', '+44 20 7946 0018'.
- Group by structure users already know (country code, area code, card blocks), not arbitrary splits.
- Don't cap visible menus at 7 citing Miller: visible items are recognized, not memorized. That is Hick's Law territory.
- Codes people read or retype are short and unambiguous: no 0/O or 1/I/l, ideally ≤ 8 characters.

### §L19 Occam's Razor: Remove every element, step, and field the task doesn't need, and stop the moment clarity starts to suffer.
- Remove until it breaks: delete an element, rerun the task, and restore it only if something fails.
- Every field needs a reason. Ask only what this step requires; infer or defer the rest.
- Keep the system small: ~2 typefaces, a 5–7 step type scale, one accent color, one spacing scale.
- One clear path per common task: one primary CTA per view, no duplicate buttons for the same action.
- Never trade clarity for minimalism: icon-only buttons need a visible label, or an aria-label plus tooltip.

### §L20 Paradox of the Active User: Assume nobody reads instructions first: teach inside the interface at the moment of need, and make experimenting safe.
- Put help where the question arises: a one-sentence hint under the field, not a link to a help page.
- Replace upfront tours with contextual tips at first use of a feature: one at a time, always dismissible.
- Empty states teach: say what goes here, why it helps, and offer the one action that fills it.
- Keep submit buttons enabled. On submit, focus the first problem and say exactly what's missing.
- Prefer undo over confirmation dialogs for reversible actions, so trial and error is safe.

### §L21 Pareto Principle: A few tasks, pages, and issues drive most of the outcome, so find that vital few with data and optimize them before anything else.
- Identify the top 3–5 user tasks from analytics and research. Give them the best placement, speed, and test coverage.
- Fix audit findings by severity × reach: shared components and top-traffic templates before one-off pages.
- Put the long tail behind progressive disclosure (More menu, Advanced section, command palette). Hide it, don't delete it.
- Rare but critical tasks (cancel, delete account, reset password, contact) still get clear, working paths.
- Re-check the data every release cycle. The vital few shift as the product and its audience change.

### §L22 Parkinson's Law: Cut every task to its shortest honest path with autofill, defaults, and fewer steps, and say up front how long it takes.
- Set autocomplete tokens on every personal, address, and payment field so the browser can fill them in one tap.
- Pre-select the most common safe, reversible option. Never pre-tick consent, add-ons, or a pricier plan.
- Offer express checkout (wallets, saved card) above the manual payment form.
- State a realistic duration up front ('Takes about 2 minutes', '5 questions') and keep it true.
- No fake time pressure: no countdowns that reset on reload, no invented 'only 2 left'.

### §L23 Peak-End Rule: Design the best and the last moment of every journey on purpose, and soften the worst one, because those are what users remember.
- Every completed flow ends on a success screen: what happened, proof (number, email), and one next action.
- Errors get plain language, cause, fix, and a way forward. Never a dead end, never lost input.
- Keep delight short and earned: celebrations ≤ 1 s, at real milestones only, honoring prefers-reduced-motion.
- Nothing stands between users and their confirmation: no upsell walls, surveys, or sign-up prompts.
- 404 and 500 pages keep the site nav, offer search and likely links, and speak like a person.

### §L24 Postel's Law: Accept input in any reasonable form, normalize it yourself, and always show it back in one clean, consistent format.
- Strip spaces, dashes, and dots from numeric fields before validating. Never reject '4242 4242 4242 4242'.
- Trim whitespace and compare emails case-insensitively. Stray spaces and capitals are noise, not errors.
- Never block paste or pinch-zoom. Each is an input method someone depends on.
- Every control works by touch, mouse, keyboard, and screen reader, at any width from 320px up.
- Display values in one canonical format everywhere, and re-validate everything on the server.

### §L25 Selective Attention: Users skip whatever looks irrelevant or ad-like and miss changes outside their focus, so put key info and feedback in their path.
- Never style essential content like an ad: no banner-shaped boxes, right-rail placement, or promo framing for key info.
- Show messages next to their cause: errors under the field, confirmations by the button, status on the changed row.
- No autoplay. Motion lasting > 5s needs pause/stop (WCAG 2.2.2). Wrap all non-essential motion in prefers-reduced-motion.
- Make every change visible at the point of focus: inline update, brief highlight, and role=status for screen readers.
- Show one banner or overlay at a time. Badges only for counts the user can act on, cleared once seen.

### §L26 Serial Position Effect: People recall the first and last items in a sequence best, so put the most important items at the start and end, never the middle.
- Rank items by importance before ordering them. Put #1 first, #2 last, and the least critical in the middle.
- Mobile tab bars: 3–5 tabs, with Home or the main destination first and Account or Profile last.
- Front-load labels: the first 1–2 words of a link, heading, button, or notification must carry the meaning.
- End every multi-step flow with a recap of what happened and what comes next. The last screen is what users carry away.
- Reorder in the DOM, not with CSS order or row-reverse, so visual, tab, and screen-reader order match.

### §L27 Tesler's Law: Every task has complexity that can't be removed, only moved; make the system carry it so users don't have to.
- Never ask for what you can detect or derive: timezone, locale, currency, card brand, city from postcode.
- Give every personal, address, and payment field the correct autocomplete token.
- Accept input in any reasonable format and normalize it in code; never make users match your format.
- Default every setting to what most users need. Offer overrides, not blank choices.
- Never simplify by hiding meaning: keep units, timezones, totals, and consequences explicit.

### §L28 Von Restorff Effect: Make the one thing users should notice or do next clearly different from its surroundings, and keep everything else consistent.
- One primary (filled) action per view, or per independent region such as a dialog. Everything else is secondary or tertiary.
- Isolate with at least two cues (fill, size, weight, border, icon, space). Never color alone (WCAG 1.4.1).
- Emphasize at most one item per group. When three things shout, none of them is heard.
- Emphasized controls keep 4.5:1 text contrast and 3:1 against adjacent colors, in light and dark themes.
- Highlight what helps the user, never a decoy: equal weight for Accept and Reject, no fake 'Most popular' badges.

### §L29 Working Memory: Never make users carry information between screens in their heads; keep what they need visible at the moment they need it.
- If step B needs info from step A, show it on step B as a summary, recap, or side panel. Never rely on 'as shown earlier'.
- Prefer recognition over recall: pickers, suggestions, and recent items instead of typing from memory.
- Every input keeps a visible label while typing. A placeholder is never the only label.
- Persist filters, sort, selections, and scroll position across Back, refresh, and shared links.
- Show location on every deep or multi-step page: a clear h1, breadcrumbs, and 'Step 2 of 4: Shipping'.

### §L30 Zeigarnik Effect: Keep unfinished work saved, visible, and one tap from resuming, without turning incompleteness into a nag.
- Autosave drafts about 1 s after the last edit and show a visible 'Saved' status with time.
- On return, offer 'Continue where you left off' that opens the exact step, values, and scroll position.
- Completion meters list each missing item with a direct link, show counts, and can be dismissed.
- Never invent incompleteness: no meters that can't reach 100%, no fake unread badges, no guilt copy.
- Always offer closure: discard a draft, leave a flow, or hide a checklist in one action, with undo.
