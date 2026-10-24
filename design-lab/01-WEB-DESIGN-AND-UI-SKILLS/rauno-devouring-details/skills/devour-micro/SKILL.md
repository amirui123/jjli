---
name: devour-micro
description: "Deep micro-interaction review against principles #3 (commit on intent, not on contact), #6 (the fingertip and the cursor are not the same), and #11 (match the metaphor to the medium). Use when hover behavior feels jittery, touch targets feel wrong, or UI components are using the wrong interaction pattern for their context. Traces findings back to Rauno Freiberg, Bruce Tognazzini, Bill Buxton, Don Norman, the original iPhone team."
argument-hint: "[--repo <absolute-path>] [--register <brand|product>] [target] [--terse]"
user-invocable: true
license: Apache 2.0. See NOTICE.md for full attribution to the design lineage this skill stands on.
---

> The interface should know whether you are touching it or passing through.
> ... after Rauno Freiberg, Devouring Details, "Inferring Intent"

Devour-micro is a focused review of three principles that govern small-surface interaction behavior: commit on intent (#3), ergonomics (#6), and metaphor matching (#11). These are the principles most commonly violated in incremental feature development, where each individual addition seems reasonable and the cumulative effect is a surface that is jittery, difficult to use, or built from the wrong components for the job.

---

## When to use

- Hover behavior is flickery or triggering when it shouldn't.
- Touch targets feel small or imprecise on mobile.
- A component was chosen because it was available, not because it fits the interaction model (modals for single edits, toasts for persistent errors, pagination where scroll fits).
- A prior `devour` run produced 🔴 or 🟡 findings in principles #3, #6, or #11 and the user wants depth.
- The user is building: tooltips, nav menus, hover cards, modals, dialogs, bottom sheets, drawers, toasts, banners, popovers, inline edits, command menus, or any component where touch/click affordance and interaction pattern matter.
- The user references exemplars from the lineage: Linear nav, iOS keyboard, Notion slash menu, cmdk, Vaul, Raycast.

For motion-specific review (spring physics, honest animation, sequence), use [`devour-motion`](../devour-motion/SKILL.md). For state and reversibility review, use [`devour-state`](../devour-state/SKILL.md). For a full-spine pass, use [`devour`](../devour/SKILL.md).

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

**Always execute this process from scratch on each invocation.** If prior devour-micro output exists in session memory, ignore it. Re-read targets, re-run browser-MCP detection, re-verify findings. Never reproduce, paraphrase, or replay cached output. If the user asks to "re-run," "run again," or "check again," they are asking for a fresh execution of the full process.

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

- `skill` frontmatter matches the current skill (e.g., `devour-micro`).
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

### Step 1 ... Establish target

If `$ARGUMENTS` is provided (after stripping `--terse`), the target is that file, component, or pattern. Read it.

If `$ARGUMENTS` is empty:
- Default to changed files in the current branch filtered to design-relevant files.
- If no changes, ask the user.

Look for immediately:
- `onMouseEnter`, `onMouseLeave`, `onHoverStart`, `onHoverEnd`, `useHover` ... intent commit patterns
- `onClick`, `onPointerDown`, `onTouchStart` ... touch interaction patterns
- Touch target sizing: any `w-X h-X` on clickable elements, `size:`, `p-X` on buttons
- Component usage: `<Dialog>`, `<Modal>`, `<Drawer>`, `<Sheet>`, `<Toast>`, `<Popover>`, `<Tooltip>`, `<Pagination>` ... check if the right component is being used for the job

#### Step 1a ... Detect a browser-driving MCP

Before reading any code, check whether any browser-driving MCP is available in your tool set. Devour-micro does not require a specific browser MCP; any tool family that lets you open pages, navigate, and evaluate scripts will work.

Common browser MCPs to look for, by tool-name prefix:

- `mcp__chrome-devtools__*` (chrome-devtools-mcp ... most common)
- `mcp__playwright__*` (Playwright MCP)
- `mcp__browser__*` or `mcp__browser-mcp__*` (BrowserMCP)
- `mcp__browserbase__*` (Browserbase)
- `mcp__puppeteer__*` (Puppeteer MCP)

The minimum capabilities devour-micro needs are: open a URL, evaluate JavaScript on the page, and take a DOM snapshot (accessibility tree or equivalent). Screenshots are optional and should be used sparingly. Different MCPs name these differently. Identify the relevant tools by capability, not by exact name.

**DOM-first rule:** micro-interaction findings are about hit rects, hover delays, intent detection, and metaphor fit... all measurable via `evaluate_script`. Read touch target sizes with `getBoundingClientRect()`, read hover timers by triggering events and measuring `performance.now()`, read metaphor consistency by inspecting ARIA roles and class patterns. Screenshots show one frame; micro-interactions are about time-based behavior that one frame cannot capture. Use screenshots only for visual-judgment questions (does the tooltip position look right on the rendered page?) that DOM inspection cannot answer.

**If NO browser-driving MCP is available:**

Tell the user once, plainly: "I don't have a browser-driving MCP available in this session, so this will be a code-only review. Almost every finding in this skill is runtime-dependent ... hover delays, touch target hit areas, and modal/overlay behavior all need browser verification. To enable that, install any browser MCP (chrome-devtools, Playwright, BrowserMCP, etc.) and re-run."

Then proceed with code-only review. Mark the output `Reviewed: code only`.

**If a browser MCP IS available:**

Try the equivalent of `list_pages` first. Three cases:

1. **A page matching the dev server is already open** (look for `localhost`, `127.0.0.1`, or a known dev URL from `$REPO/package.json`'s `dev` script): use it. Select/focus it.
2. **No matching page is open, but you can find the dev server URL** (read `$REPO/package.json`, look for `next dev`, `vite`, `pnpm dev`, port hints; default to `http://localhost:3000` for Next/Vite, `http://localhost:5173` for Vite, `http://localhost:5174` for Astro): open it.
3. **No dev server detectable**: ask the user once: "What URL is your dev server on?" If the user doesn't have one running, fall back to code-only and mark accordingly.

Mark the output `Reviewed: code + browser (<MCP name>)` once you have a live page.

**When a browser MCP IS available and a dev server is running:**

For any finding that depends on runtime behavior, **do the browser verification before emitting the finding**. For devour-micro, this covers nearly every finding:

- **Hover delay / intent commit** (principle #3): dispatch `mouseenter`/`mouseleave` events via JavaScript, measure how quickly the UI responds. Observe whether tooltips, hover cards, or nav sub-menus fire on cursor pass-through.
- **Touch target hit areas** (principle #6): inspect computed dimensions on clickable elements. Evaluate against the 44px standard. Check whether padding expands the tap area beyond the visual bounds.
- **Modal / overlay / metaphor behavior** (principle #11): navigate to the surface that triggers each component. Open it. Observe behavior at runtime ... dismiss behavior, snap points, spring feel, whether the metaphor fits the data shape.

Rules:

- If verification **confirms** the issue: emit the finding tagged `[browser-confirmed]`.
- If verification **shows no issue**: do NOT emit the finding. The code-based hypothesis was wrong; observation overrides it.
- Do NOT emit findings that say "verify in browser first" or "test this in browser." The skill has browser access; it does that work itself.

**When a browser MCP IS available but NO dev server is running:**

Ask the user once: "I have browser MCP access but no dev server. Should I try to detect a running instance, or should I proceed with code-only review?" If they provide a URL, use it. Otherwise proceed code-only.

---

### Step 2 ... Apply principles #3, #6, and #11

**Register sensitivity.** Each principle's deep-dive file (`references/principles/<principle>.md`) includes a `## Register sensitivity` section. When applying a principle, read that section and calibrate severity by the current register:

- **`brand`** ... uses brand-register ceilings. Some patterns fire harder, some softer. Typography, decoration, and motion have more room; transaction principles have less urgency.
- **`product`** ... uses product-register ceilings. Tighter on decoration, tighter on type-system discipline, stricter on reversibility and state preservation.
- **Absolute bans** fire 🔴 BREAK in both registers regardless (see `references/anti-patterns.md` for the absolute list: bounce/elastic easing, missing error paths, side-stripe borders, gradient text, glassmorphism as default).

A finding's severity may differ between registers for the same code pattern. When a finding is register-specific, say so in the finding body ("This would be 🟡 DRIFT on brand, but on product it's 🔴 BREAK because...").

---

#### Principle #3 ... Commit on intent, not on contact

> Distinguish hover-passing-through from hover-with-intent.

**Source:** Bruce Tognazzini, First Principles of Interaction Design, the prediction principle (asktog.com, Layer 2). Rauno Freiberg, Devouring Details, "Inferring Intent" chapter (Layer 4). Linear team, hover delay patterns (Layer 3).

**The core idea:** The cursor passes over many elements on the way to its actual target. Triggering state on every element the cursor contacts while in transit creates visual noise, breaks spatial coherence, and makes interfaces feel reactive in the wrong way. The interface should predict whether the user *intends* to interact with an element, not just whether they're physically over it.

The canonical test: move the cursor from the top-left of the screen to an element in the center. Count how many tooltips, hover cards, or state changes fire in transit. More than zero is a failure.

**Anti-patterns to catch:**

Instant `onMouseEnter` tooltip with no commit delay:
```tsx
// Anti-pattern: fires the moment cursor enters
<Tooltip>
  <TooltipTrigger onMouseEnter={() => setOpen(true)} />
</Tooltip>

// Or in shadcn/Radix:
<TooltipProvider delayDuration={0}> {/* delayDuration={0} is the anti-pattern */}
```

Instant dismiss on `mouseLeave`:
```tsx
// Anti-pattern: disappears the moment cursor exits, punishes slight overshoot
onMouseLeave={() => setOpen(false)}
// Should have a closing delay of ~100ms to allow cursor to reach the tooltip
```

Nav items that activate on `mouseEnter` without an intent delay:
```tsx
// Anti-pattern: nav sub-menu opens immediately
onMouseEnter={() => setActiveNav(item.id)}
// No delay means hovering over the nav bar en route to something else activates menu items
```

Hover cards or preview panels that open instantly on cursor contact. These interrupt reading while the user is simply scanning.

**Tactic patterns to implement:**

A simple, robust intent delay with cleanup:
```tsx
const intentTimerRef = useRef<NodeJS.Timeout>()

const handleMouseEnter = () => {
  intentTimerRef.current = setTimeout(() => {
    setOpen(true)
  }, 80) // 80ms is Rauno's recommended baseline; Linear uses ~100ms
}

const handleMouseLeave = () => {
  clearTimeout(intentTimerRef.current)
  // Optional: brief close delay for tooltip reachability
  setTimeout(() => setOpen(false), 100)
}
```

For Radix UI / shadcn Tooltip, the correct configuration:
```tsx
<TooltipProvider delayDuration={400}> {/* default: 700ms; 400ms is a good balance */}
  <Tooltip>
    <TooltipTrigger asChild>...</TooltipTrigger>
    <TooltipContent>...</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Linear nav hover** is the canonical exemplar. The brief commit delay (~80-100ms) prevents hover flicker as the cursor passes across nav items en route to its destination, while still feeling responsive when the user actually pauses on an item.

---

#### Principle #6 ... The fingertip and the cursor are not the same

> Touch targets, hit boxes, ergonomic distance, Fitts's law.

**Source:** Bill Buxton, Sketching User Experiences, input-first thinking (Layer 2). Bruce Tognazzini, Fitts's law applications (Layer 2). Imran Chaudhri/Bas Ording, original iPhone interaction design, 44pt standard (Layer 3). Rauno Freiberg, Devouring Details, "Ergonomic Interactions" chapter (Layer 4).

**Fitts's law:** The time to acquire a target is a function of target size and distance. Small targets far from the cursor take longer to hit. Obvious in theory; routinely ignored in practice.

**The fingertip mismatch:** The mouse cursor is a single pixel. A fingertip is approximately 10-15mm in contact diameter. These require different design choices. A 24px close button is a precise mouse click. It is a frustrating mobile interaction.

**Anti-patterns to catch:**

Touch targets below 44pt (44px on 1x screens, 88px on 2x):
```tsx
// Anti-pattern: icon button too small for touch
<button className="w-6 h-6 flex items-center justify-center">
  <XIcon />
</button>
// Should be minimum w-11 h-11 (44px) on touch surfaces

// Anti-pattern: close button in a dialog header with tight padding
<DialogHeader className="flex justify-between items-center p-3">
  <button className="p-1"><XIcon className="w-4 h-4" /></button>
```

Hit boxes that match visual bounds but should be larger:
```tsx
// Anti-pattern: interactive element with no hit zone expansion
<Link className="text-sm text-blue-500 underline">View details</Link>
// Text links are tiny tap targets. Should have explicit padding/min-height.

// Better:
<Link className="text-sm text-blue-500 underline py-2 px-1 -mx-1 inline-block">
```

Close buttons in ergonomically difficult positions. On mobile, corners are *harder* to reach than center-screen, not easier. Bottom-sheet close actions placed in the top-right corner require the user to reach across the screen.

Inputs that don't expand hit zones to include the label:
```tsx
// Anti-pattern: label and input as separate tap targets
<label>Email</label>
<input type="email" />

// Should be: label wraps input, entire row is tappable
<label className="flex flex-col gap-1 cursor-pointer">
  <span>Email</span>
  <input type="email" className="..." />
</label>
```

Inline icon actions on list rows with no visual hit zone:
```tsx
// Anti-pattern: three-dot menu icon with 16px padding
<button className="p-1"><MoreIcon className="w-4 h-4" /></button>
// The visible element is tiny; the tap area should be large regardless of visibility
```

**iOS keyboard as the canonical exemplar:** Each key is visually small but has a hit zone that grows during touch-down to match what the finger expects. The visual boundary and the interactive boundary are intentionally different. This is the correct model for touch interfaces.

**Tactic gaps:**

Desktop-designed components deployed to mobile views without touch target adjustment. Check if the project has a mobile breakpoint and whether touch targets change at that breakpoint.

Actions that require cursor precision on a surface that may be used on touch devices. Resize handles, drag handles, and inline edit triggers are all common offenders.

---

#### Principle #11 ... Match the metaphor to the medium

> Do not paginate what should scroll. Do not modal what should be inline. Do not toast what should be persistent.

**Source:** Bill Buxton, medium-shapes-the-message thesis (Layer 2). Don Norman, mapping (Layer 2). Rauno Freiberg, Devouring Details, "Interaction Metaphors" chapter (Layer 4). Loren Brichter's pull-to-refresh as paradigm-creating example (Layer 3).

**The core idea:** Every UI component embodies a metaphor about how interaction works. A modal says "stop everything, handle this first." A toast says "this just happened; it will pass." Pagination says "this content has chapters." When the component's metaphor doesn't match the data's nature or the user's task, friction accumulates. The user does the right thing in the wrong context, over and over, until they stop doing the right thing.

**Anti-patterns to catch:**

**Modal for a single-field edit:**
```tsx
// Anti-pattern: modal for inline rename
<Dialog>
  <DialogContent>
    <DialogHeader><DialogTitle>Rename project</DialogTitle></DialogHeader>
    <input type="text" defaultValue={project.name} />
    <DialogFooter>
      <Button>Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
// This should be an inline edit on the name element itself
```

**Pagination where infinite scroll fits the data shape:**
```tsx
// Anti-pattern: paginated news feed
<Feed items={feedItems} />
<Pagination current={page} total={totalPages} />
// A feed is not a document with chapters; pagination imposes structure
// the data doesn't have
```

**Toast for a persistent or actionable error:**
```tsx
// Anti-pattern: toast for a system-level error that requires user action
toast.error("Your session has expired. Please log in again.")
// A session expiry requires navigation; a toast auto-dismisses
// Use a persistent banner or a redirect
```

**Popover used as a modal:**
```tsx
// Anti-pattern: popover with a form inside it
<Popover>
  <PopoverContent>
    <form>...</form> {/* Form in a popover: if it has required fields
                        and a submit, it's a modal masquerading as a popover */}
  </PopoverContent>
</Popover>
```

**Bottom sheet on desktop:**
```tsx
// Anti-pattern: Vaul drawer used as primary detail surface on desktop
<Drawer>
  <DrawerContent> {/* Bottom sheet is a mobile metaphor.
                     On desktop, this is a panel, dialog, or sidebar */}
    <DetailPanel />
  </DrawerContent>
</Drawer>
```

**Tooltip on mobile:**
```tsx
// Anti-pattern: tooltip used as the only affordance for an action on mobile
<Tooltip content="Delete">
  <IconButton><TrashIcon /></IconButton>
</Tooltip>
// Tooltips require hover. Mobile has no hover. The label is invisible.
```

**Tactic gaps:**

Long-scrolling content with no jump links or table of contents ... the content should have navigation if it warrants pagination, but often warrants neither.

An inline edit surface that opens a modal instead of editing in place. If Notion does it inline, ask why you need a modal.

**Notion slash menu** as the canonical metaphor-match exemplar: the action surface is inline in the document, not a modal that interrupts. The writing metaphor and the command surface are the same thing. When you press `/`, you are still in the document. This is the correct model for document-style editing.

**Vaul drawer** as the correct mobile metaphor: bottom sheet for mobile, with proper snap points and spring physics. The sheet behaves like a physical surface the user lifts. Do not use it on desktop without explicit, considered justification.

**cmdk** as the canonical command surface: keyboard-navigable, intent-aware (hover commit delays), appears on explicit invocation, not on cursor contact. The metaphor is a palette, not a menu.

---

### Step 3 ... Write findings

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

- **🔴 BREAKS** ... the principle violation actively hurts usability: touch target is unreachable; tooltip fires on every cursor pass; modal is used where inline edit is the right answer and the user has to interrupt their flow to complete a trivial task.
- **🟡 DRIFTS** ... not catastrophic but the surface is drifting: hover delays are slightly too short; a touch target is 36px when 44px is the standard; a popover is getting close to modal territory.
- **🟢 OPPORTUNITY** ... the principle is not violated but a higher-craft move is available: intent delay could be tuned; touch targets could be expanded without visual change; a metaphor mismatch that affects a secondary surface rather than a primary task.

**Finding annotation:** Each finding should be tagged immediately after the severity marker:

- `[code-confirmed]` ... finding was verified from static code alone
- `[browser-confirmed]` ... finding was verified by driving the live UI via browser MCP

If no browser MCP is available, all findings are `[code-confirmed]`. If browser MCP is available, findings touching hover intent (#3), touch target sizing (#6), and overlay/metaphor behavior (#11) should be `[browser-confirmed]` by actually running the check before emitting the finding. Devour-micro findings are more runtime-dependent than any other skill in the family ... code-only review on these three principles is structurally limited.

**Two finding-write disciplines apply at code-confirmed time** (see [`references/methodology.md`](../../references/methodology.md) for full treatment):

- **Line-citation accuracy.** When a finding cites `file:line`, the symptom paragraph must name the actual identifier or element at that line (component name, function name, variable name, JSX element type) ... not just the apparent register or symptom. The `[code-confirmed]` tag means "I read the line AND I named what's at the line." If you can't name it, re-read or drop the citation. A misframed line citation collapses the credibility of the entire review.
- **Tactic-as-candidate when semantic equivalence is unverified.** When proposing a tactic that involves swapping component A for component B, verify A and B share semantic intent (the same fact about the data model, conveyed for the same purpose), not just visual register. If unclear, use the explicit phrasing `Tactic candidate: ... verify semantics before applying.` REMOVE is a valid candidate when the signal is already covered elsewhere or is decorative drift.

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

The header block, severity groupings, INTERACTIONS BETWEEN FINDINGS block, MICRO SUMMARY block, and APPLY? block all remain in terse mode, unchanged.

**About the `Downstream:` line.** Devour emits findings; [impeccable](https://impeccable.style) executes tactical fixes. When a devour-micro finding maps cleanly to an impeccable subcommand, name it on the Downstream line. This makes the compose-don't-merge relationship operational: a user reading a run file can pick the impeccable subcommand for the next session without consulting a separate mapping table.

The line is optional. Omit it when no clean impeccable command fits, or when the finding requires a designer judgment call that no subcommand can fully express.

Mapping reference (micro-interaction principles only):

| Principle | Primary /impeccable command | Secondary |
|---|---|---|
| #3 Commit on intent | /impeccable polish | - |
| #6 Fingertip vs cursor | /impeccable adapt | /impeccable polish |
| #11 Match metaphor to medium | /impeccable polish | - |

**Verbose output format (default):**

```
═══════════════════════════════════════════════════
DEVOUR MICRO REVIEW: <target>
Context: <primary surface + principle weighting from Devour Context>
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
MICRO SUMMARY
N breaks · N drifts · N opportunities
Principles reviewed: #3 (intent), #6 (ergonomics), #11 (metaphor)
Reviewed: code only | code + browser (<MCP name>)
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
APPLY?
  1. Apply all 🔴 BREAKS (N findings)
  2. Apply all 🔴 + 🟡 (N findings)
  3. Apply everything (N findings)
  4. Cherry-pick ... tell me which (e.g., "1, 3, and 5" or specific finding name)
  5. Review only ... apply nothing
═══════════════════════════════════════════════════
```

After printing the review, **always print the APPLY? block as the final lines of output.** Do not skip it.

If code-only (no browser MCP found or no dev server), append above the APPLY? block: "Reviewed code only. Most findings in this skill are runtime-dependent; hover delays, touch target hit areas, and overlay behavior need browser verification before you trust them. Re-run with a browser MCP + dev server to confirm."

**Before printing the SUMMARY block, check for inter-finding conflicts.** Two findings can be in tension when fixing one weakens the other, or when both share a root cause that requires a single structural change to resolve. If any conflicts exist, name them in the INTERACTIONS BETWEEN FINDINGS block (between the findings and the SUMMARY). If none, skip the block entirely.

When applying:

- **Show the diff** before each file change. Brief, just the hunks.
- **Apply 🔴 BREAKS without further confirmation** if the user picked option 1, 2, or 3.
- **Ask once per 🟡 DRIFT or 🟢 OPPORTUNITY** that involves a real taste call. Skip the ask if the fix is mechanical.
- **The APPLY? answer IS the scope** (see [`references/methodology.md`](../../references/methodology.md) for full treatment). Don't pull future-tier work forward without explicit greenlight from the user. If you spot a bundling opportunity ("F7 from a deferred tier touches this same component"), surface it as a question BEFORE doing the work, not after. "Per your earlier discussion" / "per your interjection" / "per the spirit of the request" are not greenlights; the user must explicitly authorize scope expansion. When in doubt, narrow to the spec and surface the bundling-candidate as an observation.
- **After all fixes are applied, ask if the user wants to commit.** Do not auto-commit.
- **If the user asks devour to commit:** use an imperative-mood, capitalized-first-letter message. NEVER add `Co-Authored-By:` lines (devour is a tool, not a co-author). NEVER prefix the message with `feat:` / `fix:` / `chore:` unless the user has asked for that style explicitly.

### Step 4 ... Save the run to file (streaming, compaction-safe)

Devour-micro writes each invocation's output as a "run" file under `$REPO/.devour/runs/`. The file is written incrementally as the review proceeds, not just at the end. This makes runs durable against session compaction or abort, and makes them resumable. See Step 0d for resume behavior.

**Location:** `$REPO/.devour/runs/<YYYY-MM-DDTHHMMSS>-devour-micro-<target-slug>.md` relative to the target repo root.

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
skill: devour-micro
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

Specific, calm, citation-heavy. Name the principle. Cite the source. Describe the fix in code. Leave the final call to the user.

Do not say "this component is wrong for this use case" without naming which principle it violates and which component would be right. Do not say "bad UX." Do not say "users will struggle." Say what the principle requires and what the code currently does instead.

---

## See also

- [`../devour/SKILL.md`](../devour/SKILL.md) ... full-spine review
- [`../../references/principles-map.md`](../../references/principles-map.md) ... source citations for #3, #6, #11
- [`../../references/exemplars.md`](../../references/exemplars.md) ... Linear nav, iOS keyboard, Notion slash menu, cmdk, Vaul, Raycast
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md) ... full anti-pattern catalog for micro-interaction principles
- [`../../references/reading-list.md`](../../references/reading-list.md) ... Rauno's "Inferring Intent," Tognazzini's First Principles
