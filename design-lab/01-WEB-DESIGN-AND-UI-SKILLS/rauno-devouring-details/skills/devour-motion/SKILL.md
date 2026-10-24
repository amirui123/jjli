---
name: devour-motion
description: "Deep motion review against principles #1 (honest motion), #2 (physics over duration), and #5 (sequence carries meaning). Use when the user wants an animation pass, a motion-specific craft review, or when motion in a component feels wrong but the reason isn't named. Traces findings back to the lineage: Emil Kowalski, Rauno Freiberg, Loren Brichter, Chaudhri/Ording at Apple, Dieter Rams."
argument-hint: "[--repo <absolute-path>] [--register <brand|product>] [target] [--terse]"
user-invocable: true
license: Apache 2.0. See NOTICE.md for full attribution to the design lineage this skill stands on.
---

> Real movement has mass. Eased durations have none.
> ... after Rauno Freiberg, Devouring Details, "Simulating Physics"

Devour-motion is a focused review of three motion principles: honest motion (#1), physics over duration (#2), and sequence as meaning (#5). It runs deeper on these three than `devour` does in a full-spine pass. Use it after the main review when motion findings warrant detail, or run it first when the user's concern is specifically about how things move.

Motion cannot be fully reviewed from static code. The findings here will be as good as the code allows, but the spring curves that look right on paper can still feel wrong at 120Hz. State this to the user when relevant.

---

## When to use

- The user says "make this motion feel right," "the animation feels off," or "can you do an animation pass."
- A prior `devour` run produced 🔴 or 🟡 findings in principles #1, #2, or #5 and the user wants depth.
- The user is building a component where motion is central: drawer, dialog, toast, sheet, list, carousel, command menu, drag-and-drop.
- The user has Framer Motion, react-spring, or CSS `@property` animations in the target and wants them reviewed.
- The user references motion work from the lineage: Sonner, Vaul, NotBoring, Brichter, Rauno's spring configs.

For a broader craft review, use [`devour`](../devour/SKILL.md). For micro-interaction review (hover, touch targets, metaphor mismatches), use [`devour-micro`](../devour-micro/SKILL.md).

---

## MANDATORY PREPARATION

Before reviewing anything, devour requires project context. Different products live in different parts of the spine ... a marketing page values principles 9 and 12 most; a productivity app values 3, 4, and 7 most; a creative tool values 2 and 5 most. Without context, devour produces generic findings.

**Devour's context lives in `$REPO/DEVOUR.md`** ... a single file at the repo root, written by `/devour-teach`. It contains register (brand | product), principle weighting, motion appetite, density target, reference exemplars, and optional per-surface overrides.

**If `$REPO/DEVOUR.md` is missing:**

1. STOP. Do not proceed with review.
2. Tell the user: "Devour needs project context first. Run `/devour-teach` to write `$REPO/DEVOUR.md`, then re-run this command."
3. Do NOT auto-invoke `/devour-teach`. The user runs it themselves so they're in control of when context is gathered.

**If `$REPO/DEVOUR.md` exists:** Step 0b (below) reads it, applies `--register` overrides, matches per-surface path prefixes, and establishes the working context for the review.

---

## Process

**Always execute this process from scratch on each invocation.** If prior devour-motion output exists in session memory, ignore it. Re-read targets, re-run browser-MCP detection, re-verify findings. Never reproduce, paraphrase, or replay cached output. If the user asks to "re-run," "run again," or "check again," they are asking for a fresh execution of the full process.

### Step 0a ... Resolve target repo (`--repo`)

Read `$ARGUMENTS`. If `--repo <path>` is present:

1. Extract `<path>` as the value.
2. Strip `--repo <path>` from `$ARGUMENTS` before passing to later steps.
3. Validate: the path must exist and be a directory. If it does not: stop and report `--repo path does not exist: <path>. Aborting.`
4. Set `$REPO` = the absolute `<path>`.

If `--repo` is not present: set `$REPO` = current working directory.

For the rest of this skill:
- All file reads, relative-path resolutions, and project-local lookups use `$REPO` as the root.
- Git commands run with `git -C $REPO ...`.
- `DEVOUR.md` reads from `$REPO/DEVOUR.md`.
- `.devour/runs/` writes to `$REPO/.devour/runs/`.
- `package.json` reads from `$REPO/package.json`.
- If a target argument is a relative path, resolve it against `$REPO`. If absolute, use as-is.

If `$REPO` is not a git repository (no `.git/` directory inside), warn the user once:
`Note: $REPO is not a git repo. Skipping diff-based default. Provide a target file or pattern.`
Then proceed with code review, but do not attempt `git diff` defaults.

**Flag extraction in Step 0a (also strip them from `$ARGUMENTS` before later steps see them):**

- `--repo <path>` ... extract value, validate path exists, set `$REPO` (handled above).
- `--register <value>` ... extract value. Must be exactly `brand` or `product` (case-insensitive). If invalid, fail with `--register must be 'brand' or 'product', got '<value>'. Aborting.` Store as `$CLI_REGISTER` for use in Step 0c.
- `--terse` ... note as a boolean flag. Step 0 (below) consumes it.
- `--resume` ... note as a boolean flag. Step 0d consumes it.

After all flags are extracted and stripped, `$ARGUMENTS` contains only the non-flag remainder (the target file/path/prose, or empty).

### Step 0b ... Resolve project context from `DEVOUR.md`

After `$REPO` is resolved (Step 0a), read `$REPO/DEVOUR.md`. This file is the source of truth for devour's review calibration.

**If `$REPO/DEVOUR.md` does not exist:** block with the MANDATORY PREPARATION message. Do not proceed.

**If `$REPO/DEVOUR.md` exists:** parse its sections:

- `## Register` ... the default register for this project (`brand` or `product`, one word).
- `## Project` ... one-paragraph description.
- `## Audience` ... optional. If missing, check `$REPO/PRODUCT.md` (opportunistic, below).
- `## Brand voice` ... optional. If missing, check `$REPO/PRODUCT.md`.
- `## Anti-references` ... optional. If missing, check `$REPO/PRODUCT.md`.
- `## Principle weighting (default)` ... three-band list (High / Medium / Low / N/A) of principles by number.
- `## Motion appetite` ... one paragraph.
- `## Density target` ... one paragraph.
- `## Reference exemplars` ... bullet list.
- `## Specific things to watch for` ... open list.
- `## Per-surface overrides` ... optional. Declares per-path-prefix overrides for multi-surface projects.

Store these as the working context for this review.

**Opportunistic reads:**

- If `$REPO/PRODUCT.md` exists, read it best-effort. If it has `## Users`, `## Brand Personality`, or `## Anti-references` sections, use them to fill in any DEVOUR.md fields that were optional and missing. Never override DEVOUR.md fields that exist. If PRODUCT.md does not parse cleanly, warn once ("PRODUCT.md present but could not parse cleanly; proceeding from DEVOUR.md alone") and continue.
- If `$REPO/DESIGN.md` exists, read it best-effort. If it declares tokens (`colors`, `typography`, `spacing`, `components`), store them. Tactic suggestions in Step 3 can reference tokens by name.

Devour NEVER writes to `PRODUCT.md` or `DESIGN.md`.

### Step 0c ... Resolve register for this review

Register drives principle ceilings in Step 2. It's resolved in this order:

1. **`--register <value>` CLI flag if present.** This wins. `<value>` must be exactly `brand` or `product` (case-insensitive). Invalid values fail with a clear message.
2. **`## Per-surface overrides` path-prefix match.** If the non-flag remainder of `$ARGUMENTS` (the target hint, before Step 1 establishes `$TARGET`) starts with one of the prefixes declared in `## Per-surface overrides`, that surface's block applies. The first matching prefix wins; prefixes are checked in declaration order. If `$ARGUMENTS` is empty (diff-based default), per-surface match is skipped entirely... only the top-level `## Register` applies.
3. **Top-level `## Register` section in DEVOUR.md.** The project default.

When a per-surface override matches, merge the surface's other declared fields (principle-weighting, motion-appetite, density-target, specific-things-to-watch-for) with the top-level defaults. Surface-declared fields win for their section; unset fields fall back to top-level.

When `--register` is applied, still use per-surface principle-weighting and motion-appetite if a surface matches. Only the register itself is overridden by the CLI flag.

**Note on hybrid register + per-surface weighting.** When `--register` overrides the register but the target matches a per-surface block, the working context is hybrid: register comes from CLI, but principle weighting / motion appetite / density / specific-things-to-watch-for come from the matched surface. This is intentional but non-obvious. If the matched surface declares a register that disagrees with the CLI override (e.g., surface is `frontend/` with `register: product` but `--register brand` is set), warn the user once: `Note: --register brand overrides the surface's product register, but principle weighting from frontend/ still applies. Pass --register without a per-surface match to use top-level defaults.`

Log the resolved register once at run start: `Register: brand` or `Register: product`. If a per-surface override matched, say so: `Register: product (matched per-surface override for 'frontend/')`.

### Step 0d ... Check for in-progress run (resume)

Scan `$REPO/.devour/runs/` for any `.md` file with a YAML frontmatter field `status: in-progress`. Filter to files where BOTH:

- `skill` frontmatter matches the current skill (e.g., `devour-motion`).
- `target` frontmatter matches the current target argument (after stripping `--repo` and `--terse`). If the current invocation has no target (diff-based default), match against the `diff-main-HEAD` slug or equivalent.

**Match count handling:**

- **Zero matches:** proceed with new run. No prompt.
- **One match:** print this prompt and wait for user response:

  ```
  Found in-progress run from <started ISO timestamp>
  with <N> findings already saved.

    R: Resume this run (append new findings/sections to the existing file)
    F: Start fresh (leave the old file; create a new run file)
    C: Cancel

  Choose [R/F/C]:
  ```

- **Multiple matches:** print a numbered list of all matches with their timestamp and finding count, then offer Resume N / Fresh / Cancel.

**Resume semantics:**

- If user chooses R: read the matched file. Preserve its frontmatter except update `started` field (leave as-is; do not overwrite). Find the first empty section. Continue the review from the equivalent step in this skill's Process. When appending new findings, continue from the next number (if 3 findings are saved, new findings start at Finding 4).
- If user chooses F: leave the matched file untouched. Create a new run file per Step 4. The old in-progress file stays on disk; the user can delete it manually.
- If user chooses C: stop. No new file created.

This step runs once per invocation, before Step 1 (establish target). If resume is chosen, Step 1 and Step 1a may be skipped or truncated depending on what the in-progress file already has.

### Step 0 ... Check for --terse flag

Read `$ARGUMENTS`. If `--terse` is present, set output mode to **terse**. Strip `--terse` before passing arguments to Step 1. Terse mode keeps the same rigor and the same three-principle scope but strips teaching prose from each finding. The APPLY? prompt and INTERACTIONS BETWEEN FINDINGS block are unchanged in both modes.

### Step 1 ... Establish target and environment

If `$ARGUMENTS` is provided (after stripping `--terse`), the target is that file, component, or pattern. Read it in full.

If `$ARGUMENTS` is empty:
- Default to changed files in the target repo's current branch (`git -C $REPO diff main..HEAD --name-only`, filtered to `.tsx`, `.jsx`, `.css`, `.scss`).
- If no changes, ask the user what to review.

**Motion cannot be fully reviewed from static code.** A 200ms `ease-in-out` looks fine in source but may feel hesitant on real hardware. A spring config that math-checks may overshoot at 60Hz. The skill must drive the actual UI when possible.

#### Step 1a ... Detect a browser-driving MCP

Before reading any code, check whether any browser-driving MCP is available in your tool set. Devour-motion does not require a specific browser MCP; any tool family that lets you open pages, navigate, and evaluate scripts will work.

Common browser MCPs to look for, by tool-name prefix:

- `mcp__chrome-devtools__*` (chrome-devtools-mcp ... most common)
- `mcp__playwright__*` (Playwright MCP)
- `mcp__browser__*` or `mcp__browser-mcp__*` (BrowserMCP)
- `mcp__browserbase__*` (Browserbase)
- `mcp__puppeteer__*` (Puppeteer MCP)

The minimum capabilities devour-motion needs are: open a URL, evaluate JavaScript on the page, and take a DOM snapshot (accessibility tree or equivalent). Screenshots are optional and should be used sparingly. Use `evaluate_script` to read timing functions, computed transforms, `performance.now()` timestamps, and animation state directly from the DOM. Different MCPs name these differently. Identify the relevant tools by capability, not by exact name.

**DOM-first rule:** motion findings are timing-based, and timing is a number. Read the number with `evaluate_script`; do not infer it from a screenshot. Measure animation duration by capturing `performance.now()` before/after the animation completes, not by comparing image frames. Read `getComputedStyle(el).transitionDuration` and `transitionTimingFunction` directly. Screenshots are appropriate only for compositing artifacts or visual-perception-of-motion judgments that the DOM cannot express.

**If NO browser-driving MCP is available:**

Tell the user once, plainly: "I don't have a browser-driving MCP available in this session, so this will be a code-only review. Motion findings about felt timing and runtime behavior need browser verification. To enable that, install any browser MCP (chrome-devtools, Playwright, BrowserMCP, etc.) and re-run."

Then proceed with code-only review. Mark the output `Reviewed: code only`.

**If a browser MCP IS available:**

Try the equivalent of `list_pages` first. Three cases:

1. **A page matching the dev server is already open** (look for `localhost`, `127.0.0.1`, or a known dev URL from `$REPO/package.json`'s `dev` script): use it. Select/focus it.
2. **No matching page is open, but you can find the dev server URL** (read `$REPO/package.json`, look for `next dev`, `vite`, `pnpm dev`, port hints; default to `http://localhost:3000` for Next/Vite, `http://localhost:5173` for Vite, `http://localhost:5174` for Astro): open it.
3. **No dev server detectable**: ask the user once: "What URL is your dev server on?" If the user doesn't have one running, fall back to code-only and mark accordingly.

Mark the output `Reviewed: code + browser (<MCP name>)` once you have a live page.

#### Step 1b ... Read the code

After environment is established, read the target file(s) in full. Specific patterns to look for immediately:

- Any `transition:` or `animation:` in CSS or inline styles
- Any Framer Motion imports (`motion`, `AnimatePresence`, `useSpring`, `useMotion*`)
- Any react-spring imports (`useSpring`, `useTransition`, `useTrail`, `animated.*`)
- Any `@property` or `linear()` easing in CSS
- Any keyframes definitions in `globals.css` or equivalent
- Any `nth-child` patterns (often hardcoded stagger ceilings)

#### Step 1c ... Drive the UI for findings that need it

For each finding that depends on felt experience rather than code structure, drive the page. Examples:

- **Sheet timing or dialog entry feel** ... navigate to the page that triggers it, click the trigger, observe. Use `evaluate_script` to inspect computed timing functions (`getComputedStyle(el).transitionDuration`, `transitionTimingFunction`) and measure actual elapsed time via `performance.now()` bracketing the trigger. A screenshot is a last resort if the animation cannot be reasoned about from computed styles.
- **Hover commit delays** ... evaluate JavaScript to dispatch `mouseenter`/`mouseleave` events on target elements, measure response.
- **Stagger sequences** ... navigate to the relevant grid. Use `evaluate_script` to observe each item's animation state directly: read `animation-delay`, `transition-delay`, or inline motion props on each item; trigger the entrance (scroll into view, filter change, etc.) and bracket with `performance.now()` to confirm whether all items animate or only the first N. This is faster and more precise than reading screenshots at multiple timestamps.
- **Filter-change re-animation** (the bug devour catches): apply a filter, watch whether existing cards re-trigger their entrance animation. This is the canonical case for browser-required verification.
- **Reduced-motion behavior** ... evaluate JavaScript to set `prefers-reduced-motion: reduce` via CSS or media-query emulation, re-trigger interactions.

Annotate findings with `[code-confirmed]` or `[browser-confirmed]` so the user knows which findings have been verified at runtime.

**Rules for emitting findings when browser MCP is available:**

- If verification **confirms** the issue: emit the finding tagged `[browser-confirmed]`.
- If verification **shows no issue**: do NOT emit the finding. The code-based hypothesis was wrong; observation overrides it.
- Do NOT emit findings that say "verify in browser first" or "test this in browser." The skill has browser access; it does that work itself.

**Two finding-write disciplines apply at code-confirmed time** (see [`references/methodology.md`](../../references/methodology.md) for full treatment):

- **Line-citation accuracy.** When a finding cites `file:line`, the symptom paragraph must name the actual identifier or element at that line (component name, function name, variable name, JSX element type) ... not just the apparent register or symptom. The `[code-confirmed]` tag means "I read the line AND I named what's at the line." If you can't name it, re-read or drop the citation. A misframed line citation collapses the credibility of the entire review.
- **Tactic-as-candidate when semantic equivalence is unverified.** When proposing a tactic that involves swapping component A for component B, verify A and B share semantic intent (the same fact about the data model, conveyed for the same purpose), not just visual register. If unclear, use the explicit phrasing `Tactic candidate: ... verify semantics before applying.` REMOVE is a valid candidate when the signal is already covered elsewhere or is decorative drift.

---

### Step 2 ... Apply principles #1, #2, and #5

For each principle, scan the target for both **anti-pattern matches** (the failure mode) and **tactic gaps** (where the right approach is missing entirely).

**Register sensitivity.** Each principle's deep-dive file (`references/principles/<principle>.md`) includes a `## Register sensitivity` section. When applying a principle, read that section and calibrate severity by the current register:

- **`brand`** ... uses brand-register ceilings. Some patterns fire harder, some softer. Typography, decoration, and motion have more room; transaction principles have less urgency.
- **`product`** ... uses product-register ceilings. Tighter on decoration, tighter on type-system discipline, stricter on reversibility and state preservation.
- **Absolute bans** fire 🔴 BREAK in both registers regardless (see `references/anti-patterns.md` for the absolute list: bounce/elastic easing, missing error paths, side-stripe borders, gradient text, glassmorphism as default).

A finding's severity may differ between registers for the same code pattern. When a finding is register-specific, say so in the finding body ("This would be 🟡 DRIFT on brand, but on product it's 🔴 BREAK because...").

---

#### Principle #1 ... Honest motion

> If you animate it, it must communicate something the static state could not.

**Source:** Dieter Rams principle 6 ("Good design is honest"), Don Norman on feedback as affordance, Emil Kowalski's "You Don't Need Animations" (emilkowal.ski).

**The question to ask for every animation:** "If this motion were removed, would the user lose information?" If no, the motion is decorative and likely wrong.

**Anti-patterns to catch:**

- `transition: opacity 200ms` on a static element that isn't changing state ... the fade is decorative, communicates nothing
- Entrance animation on content that the user didn't trigger ... a card that fades in on page load when the user didn't navigate to it
- Loading skeleton with shimmer that runs longer than the actual load time ... the shimmer outlives its informational purpose and becomes decoration
- `@keyframes pulse` on a badge that is not changing state (suggesting pending activity when there is none)
- Animated counters counting up from zero to a number that was always known at render time ... the count communicates nothing that the final number doesn't, it just performs motion
- Motion that has no end state ... continuous ambient animation that never resolves, suggesting perpetual activity

**Tactic gaps to catch:**

- A form submission that shows nothing between click and response ... no motion to communicate work-in-progress, user gets no feedback that intent was registered
- A list item that appears or disappears without any motion to communicate causality ... the item is just gone
- Navigation that transitions instantly with no motion to communicate spatial relationship

**The "You Don't Need Animations" check:**

Apply Emil Kowalski's test: for each animation, ask whether you actually need it. Not whether it's nice to have, whether the user *needs* it to understand what just happened or what is about to happen. If the answer is no, the motion should be removed, not refined.

---

#### Principle #2 ... Physics over duration

> Real movement has mass, springs, and damping. Eased durations betray themselves as animation.

**Source:** Imran Chaudhri and Bas Ording (original iPhone rubber-banding), Loren Brichter (pull-to-refresh), Rauno Freiberg (Devouring Details, "Simulating Physics"), Emil Kowalski (Animations on the Web, spring chapters).

**The core idea:** A tween is a function of time. A spring is a function of force. Users feel the difference, even when they can't name it. When you move a thing (a drawer, a dialog, a list item dragged from one position to another), that thing should behave as if it has mass and encounters resistance. A tween slides; a spring *arrives*.

**Anti-patterns to catch:**

Any `transition: transform Xms ease-*` on a movable element:
```css
/* catches these patterns */
transition: transform 300ms ease-out;
transition: transform 200ms ease-in-out;
transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

These are linear-time tweens dressed in easing clothing. They still run for a fixed duration regardless of the user's gesture velocity. A spring's duration varies with input velocity; a tween's doesn't.

Any `transition: all Xms` on an interactive element ... "all" prevents targeted physics; the geometry and the color should not move at the same speed.

Linear easing (`transition: transform 200ms linear`) on anything that moves spatially. Linear is always wrong for spatial movement. It is mechanical, not physical.

A tween-based transition between two modal states (dialog entering and exiting) where a spring would close the loop naturally:
```tsx
// Anti-pattern: tween
<Dialog className="transition-transform duration-300 ease-out" />

// What to suggest instead: spring via Framer Motion
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.95, opacity: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>
```

**Tactic gaps to catch:**

Draggable elements using CSS transition instead of spring physics on release:
```tsx
// Missing: spring snap-back
const dragControls = useDragControls()
// Should have spring-based constraints and release behavior
```

Vaul and Sonner as canonical spring exemplars: if the target is a drawer or toast, compare its motion to Vaul/Sonner behavior. Vaul uses spring physics for the drag-and-release; Sonner uses spring physics for toast enter/exit. Any drawer or toast that feels different from these is worth flagging.

**Framer Motion spring config reference:**
```tsx
// Responsive snap (dialogs, dropdowns)
transition={{ type: "spring", stiffness: 400, damping: 30 }}

// Heavy drag (drawers, sheets)
transition={{ type: "spring", stiffness: 300, damping: 40, mass: 1.2 }}

// Light, playful (NotBoring-style)
transition={{ type: "spring", stiffness: 500, damping: 25 }}
```

**CSS `@property` + `linear()` for spring-like easing:**
```css
/* Spring approximation without JS */
@property --translateY {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}
transition: --translateY 600ms linear(
  0, 0.009, 0.035 2.1%, 0.141%, 0.281 6.7%, 0.723 12.9%,
  0.938 16.7%, 1.04, 1.098 24.3%, 1.121, 1.124, 1.121,
  1.098 29.3%, 1.04, 1 35.5%, 0.949, 0.929 41.6%, 0.938,
  0.962 52.7%, 0.988 61.8%, 1
);
```

---

#### Principle #5 ... Sequence carries meaning

> Stagger only when order matters. Otherwise, simultaneity.

**Source:** Edward Tufte on data-ink ratio (every element earns its place, sequence earns its order), Bill Verplank's do/feel/know model, Rauno Freiberg (Devouring Details, "Motion Choreography").

**The core idea:** When you stagger animations, you communicate to the user that the items appeared in that order for a reason. If there is no reason for the order, the stagger is a lie. It tells the user a causal story that doesn't exist.

Conversely, when two things are causally linked, simultaneous animation hides the relationship. If pressing a button causes a panel to expand, those two things should animate in a way that shows the connection, not at the same moment in identical ways.

**Anti-patterns to catch:**

Staggered list entrance where the order is arbitrary:
```tsx
// Anti-pattern: stagger on arbitrary-ordered list
{users.map((user, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
    key={user.id}
  >
```
If users are sorted alphabetically or by ID, the stagger implies rank that doesn't exist. Ask: why does the first user "arrive" before the last? If there's no answer, the stagger is decoration.

Simultaneous animation where causality matters:
```tsx
// Anti-pattern: everything enters at once when parent caused children
<motion.div animate={{ opacity: 1 }}>
  <motion.div animate={{ opacity: 1 }}>child 1</motion.div>
  <motion.div animate={{ opacity: 1 }}>child 2</motion.div>
</motion.div>
// Parent and children entering together hides the parent-child relationship
```

Missing follow-through on chained interactions. If clicking a row expands a detail panel below it, the row and the panel should have motion that tells the causal story: row indicates selection, *then* panel enters. If both animate simultaneously and identically, the user has to infer the relationship.

**Tactic gaps to catch:**

Staggered list where the order *does* matter (ranked items, priority queue, step-by-step instructions) but there is no stagger ... adding stagger here would communicate the ordering.

A tab switch where both the outgoing and incoming content animate simultaneously and identically ... they could animate in sequence (outgoing exits, incoming enters) to communicate the transition through space.

**Linear's filter-pill animation** is the canonical positive exemplar: when a filter is added, existing pills shift first, then the new pill enters. The sequence tells the causal story: "your new filter joined the existing ones."

---

### Step 3 ... Write findings

Each finding follows the standard devour format:

```
[#N PRINCIPLE NAME] - <severity>
File: <path>:<line range>
Symptom:
  <one or two sentences describing the observed code/behavior>
Principle:
  <one sentence: the principle, what it requires here>
Tactic:
  <the specific change, with code>
Downstream (optional):
  <matching /impeccable subcommand, when one applies, with a brief note on what it does for this finding>
Reference:
  <citation: lineage source + canonical exemplar>
```

**Severity scale:**

- **🔴 BREAKS** ... the motion principle is violated in a way that is actively wrong: a drawer using CSS transition instead of spring physics; a stagger on ordered content that communicates false causality; decorative motion that fires on user action and blocks interaction.
- **🟡 DRIFTS** ... the motion is not catastrophically wrong but is drifting: easing curves that are close to correct but not quite spring behavior; a stagger that's mostly harmless but unprincipled; honest motion that could be slightly more informative.
- **🟢 OPPORTUNITY** ... the motion is absent where it would add real information, or is correct but a higher-craft version is available: spring physics available that would improve the feel; stagger that would add meaning to an ordered list.

**Default (verbose):** Each finding includes symptom, principle explanation, tactic with code, and reference with full exemplar prose. Use this unless `--terse` was set.

**Terse mode (`--terse`):** Each finding is compressed to six lines. No exemplar paragraph, no extended explanation. Same severity markers, same principle and source citations, same APPLY? and INTERACTIONS blocks.

Terse finding format:
```
🔴 / 🟡 / 🟢  File: <path>:<line>
Symptom: <one sentence>
Principle: #N <name>
Source: <Designer>, "<Work>"
Tactic: <one sentence>
Downstream: /impeccable <subcommand>   (optional, when one applies)
```

The header block, severity groupings, INTERACTIONS BETWEEN FINDINGS block, MOTION SUMMARY block, and APPLY? block all remain in terse mode, unchanged.

**About the `Downstream:` line.** Devour emits findings; [impeccable](https://impeccable.style) executes tactical fixes. When a devour-motion finding maps cleanly to an impeccable subcommand, name it on the Downstream line. This makes the compose-don't-merge relationship operational: a user reading a run file can pick the impeccable subcommand for the next session without consulting a separate mapping table.

The line is optional. Omit it when no clean impeccable command fits, or when the finding requires a designer judgment call that no subcommand can fully express.

Mapping reference (motion principles only):

| Principle | Primary /impeccable command | Secondary |
|---|---|---|
| #1 Honest motion | /impeccable animate | /impeccable polish |
| #2 Physics over duration | /impeccable animate | - |
| #5 Sequence carries meaning | /impeccable animate | - |

**Verbose output format (default):**

```
═══════════════════════════════════════════════════
DEVOUR MOTION REVIEW: <target>
Context: <motion appetite + principle weighting from Devour Context>
═══════════════════════════════════════════════════

🔴 BREAKS (N findings)
───────────────────────
<findings>

🟡 DRIFTS (N findings)
───────────────────────
<findings>

🟢 OPPORTUNITIES (N findings)
─────────────────────────────
<findings>

═══════════════════════════════════════════════════
INTERACTIONS BETWEEN FINDINGS (only if any)
───────────────────────────────────────────────────
- Finding N and Finding M are partially in tension. <Brief explanation
  of how fixing one affects the other, and what structural change
  resolves both at once if applicable.>
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
MOTION SUMMARY
N breaks · N drifts · N opportunities
Principles reviewed: #1 (honest motion), #2 (physics), #5 (sequence)
Reviewed: code only | code + browser (<MCP name>)
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
APPLY?
  1. Apply all 🔴 BREAKS (N findings)
  2. Apply all 🔴 + 🟡 (N findings)
  3. Apply everything (N findings)
  4. Cherry-pick ... tell me which (e.g., "1, 3, and 5" or "the featured badge fix")
  5. Review only ... apply nothing
═══════════════════════════════════════════════════
```

After printing the review, **always print the APPLY? block as the final lines of output.** Do not skip it.

If code-only (no browser MCP found or no dev server), append above the APPLY? block: "Recommend re-running with a browser MCP and dev server for full verification. Spring feel and felt timing cannot be fully confirmed from code."

**Before printing the SUMMARY block, check for inter-finding conflicts.** Two findings can be in tension when fixing one weakens the other, or when both share a root cause that requires a single structural change to resolve. If any conflicts exist, name them in the INTERACTIONS BETWEEN FINDINGS block (between the findings and the SUMMARY). If none, skip the block entirely.

When applying:

- **Show the diff** before each file change. Brief, just the hunks.
- **Apply 🔴 BREAKS without further confirmation** if the user picked option 1, 2, or 3.
- **Ask once per 🟡 DRIFT or 🟢 OPPORTUNITY** that involves a real taste call (e.g., "extending stagger ceiling to 20 ... is this the right max for your grids?"). Skip the ask if the fix is mechanical.
- **The APPLY? answer IS the scope** (see [`references/methodology.md`](../../references/methodology.md) for full treatment). Don't pull future-tier work forward without explicit greenlight from the user. If you spot a bundling opportunity ("F7 from a deferred tier touches this same component"), surface it as a question BEFORE doing the work, not after. "Per your earlier discussion" / "per your interjection" / "per the spirit of the request" are not greenlights; the user must explicitly authorize scope expansion. When in doubt, narrow to the spec and surface the bundling-candidate as an observation.
- **After all fixes are applied, ask if the user wants to commit.** Do not auto-commit.
- **If the user asks devour to commit:** use an imperative-mood, capitalized-first-letter message. NEVER add `Co-Authored-By:` lines (devour is a tool, not a co-author). NEVER prefix the message with `feat:` / `fix:` / `chore:` unless the user has asked for that style explicitly.

### Step 4 ... Save the run to file (streaming, compaction-safe)

Devour-motion writes each invocation's output as a "run" file under `$REPO/.devour/runs/`. The file is written incrementally as the review proceeds, not just at the end. This makes runs durable against session compaction or abort, and makes them resumable. See Step 0d for resume behavior.

**Location:** `$REPO/.devour/runs/<YYYY-MM-DDTHHMMSS>-devour-motion-<target-slug>.md` relative to the target repo root.

- `<YYYY-MM-DDTHHMMSS>` is the current UTC timestamp, ISO-8601-like but filename-safe (no colons). Example: `2026-04-23T164500`.
- `<target-slug>` is derived from the review target. Slugify the target path: replace `/` with `-`, lowercase, strip unsafe characters, keep under 40 chars. For diff-based default targets, use `diff-main-HEAD`. For whole-repo reviews, use `repo-full`.

**Directory creation:** if `$REPO/.devour/` or `$REPO/.devour/runs/` does not exist, create the nested structure. Never write outside `$REPO`.

**File lifecycle:**

1. **At run start** (after Step 1 target is established): create the run file with this scaffolding. Write this and save immediately.

```markdown
---
status: in-progress
started: <ISO-8601 UTC timestamp>
completed: null
skill: devour-motion
target: <human-readable target description>
repo: <$REPO absolute path>
context-file: <path to DEVOUR.md if read, else null>
browser-mcp: <detected MCP short name if any, else null>
terse: <true|false>
---

# Devour run: <target>

## Context

<empty; filled in Step 2 or equivalent>

## Findings

<empty; findings appended one at a time in Step 3>

## Interactions between findings

<empty; filled in Step 4>

## Apply decisions

<empty; filled after APPLY? prompt is answered>

## Outcomes

<empty; filled after fixes are verified>
```

2. **After context is gathered** (end of Step 2): write the Context section atomically. Save.

3. **For each finding identified in Step 3**: append the finding to the Findings section in the file's current state. Save after each finding. The finding format in the file mirrors the screen output (verbose or terse per `$TERSE`).

4. **After the findings phase completes** (end of Step 4): write the "Interactions between findings" section atomically. Save.

5. **After the APPLY? prompt is answered** (after Step 5 decision lands): write the Apply decisions section as a markdown table with one row per finding: `| Finding | Decision | Notes |`. Save.

6. **After fixes are verified** (or after the user chooses review-only): write the Outcomes section, flip frontmatter `status` from `in-progress` to `complete`, set `completed` to the current UTC timestamp. Save. This is the final write.

**Announce to the user** at start of run (immediately after scaffolding is written):

> Run started: `$REPO/.devour/runs/<filename>.md`. This file updates live as the review proceeds, so it survives compaction.

At end of run (after status flips to `complete`):

> Run complete: `$REPO/.devour/runs/<filename>.md`.

**Git hygiene:** if `$REPO/.devour/` is not in the project's `.gitignore` and the project uses git, tell the user once at the end of the run: "Consider adding `.devour/` to your `.gitignore`, or commit runs selectively for important ones."

Do NOT auto-add to `.gitignore`. The user decides.

---

## Voice

Specific, calm, citation-heavy. State the principle. Name the source. Recommend the tactic. Leave the call to the user.

Do not say "this looks better." Do not say "modern best practice." Do not say "feels off" without naming why. If you can't cite a principle, the finding doesn't belong in this review.

---

## See also

- [`../devour/SKILL.md`](../devour/SKILL.md) ... full-spine review
- [`../../references/principles-map.md`](../../references/principles-map.md) ... source citations for #1, #2, #5
- [`../../references/exemplars.md`](../../references/exemplars.md) ... Sonner, Vaul, NotBoring iOS, iOS rubber-banding
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md) ... full anti-pattern catalog for motion principles
- [`../../references/reading-list.md`](../../references/reading-list.md) ... Emil Kowalski's courses and essays
