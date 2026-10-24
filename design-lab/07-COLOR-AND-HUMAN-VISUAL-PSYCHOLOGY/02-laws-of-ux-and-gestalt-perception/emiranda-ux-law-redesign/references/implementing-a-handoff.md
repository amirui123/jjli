# Implementing a design handoff

Use this in phase 7, when the user comes back with a prototype, handoff bundle or design link. The goal: keep every pixel, string and interaction the user liked, keep every function the old screen had, and keep the real system's rules.

## Contents

- [1. Bring the handoff into the repo](#1-bring-the-handoff-into-the-repo)
- [2. Break the design down](#2-break-the-design-down)
- [3. Find where the build must differ](#3-find-where-the-build-must-differ)
- [4. Plan and get approval](#4-plan-and-get-approval)
- [5. Build in layers](#5-build-in-layers)
- [6. Verify](#6-verify)
- [7. Ship](#7-ship)

## 1. Bring the handoff into the repo

- Copy the bundle into `docs/design/<screen>-v<N>/` (skip thumbnails and caches). The prototype becomes a file you can open in the browser preview beside the build, and the handoff can cite the brief by path.
- Save the brief next to it if it isn't already in the repo.
- Read the handoff README first: it maps the parity checklist and answers the brief's open questions. Note any question it skipped.

If the handoff comes as a link or through a design-tool connector, fetch it with the tool the user points to. Never enter credentials yourself; ask the user to export the bundle if access fails.

## 2. Break the design down

Read the prototype's markup, styles and scripts block by block and write down, in the plan:

1. **Page anatomy**, top to bottom: each region, what it contains, what's conditional on role or state.
2. **Visual system:** the encodings and their single meanings; the type scale (sizes and line heights, weights and where each is used); icons (name the set, normalize inconsistent stroke widths); surfaces, radii, shadows; motion durations and easing; the design tokens that already exist and the ones to add.
3. **Components and variants:** each component's parts and every variant, as a table where it helps (state → background, border, text).
4. **Interactions:** each way to do each task (click, drag, keyboard, touch), shortcuts, and what happens after (toast, focus, scroll).
5. **Easy-to-miss details:** z-order of floating layers; card offsets and anchoring; one-open-at-a-time rules; click-outside behaviour; timings (toast duration, debounce, pulse); focus management; exact copy.
6. **States:** loading, empty, error, read-only, closed, finished.

This list is what makes "retain as much of the prototype as possible" real. Users who liked a prototype want to see that every detail made it into the plan.

## 3. Find where the build must differ

**The prototype is the source of truth for design and interaction, never for business rules.** Prototypes recompute verdicts, eligibility, suggestions and totals in the browser with rules the design tool inferred, and they get them subtly wrong. Their seed data won't match the real data either.

Produce three lists:

1. **Deliberate differences**, as a table: *prototype does → build does → why*. Typical rows: verdicts read from the server rather than computed in the browser; the real data model where the prototype simplified (several time windows, not one); real persistence (undo as operation inverses, not snapshots); behaviour nobody asked to change stays as it is.
2. **Prototype defects not to port:** missing focus styles (`outline: none`), touch that blocks scrolling (`touch-action: none` everywhere), editors' controls shown to read-only users, ID collisions, keyboard shortcuts that hijack text fields, debugging tags left in the UI, hard-coded users, filler copy in the unhappy states ("Something went wrong", "No data"), and copy that promises a capability the build doesn't have.
3. **Parity items the prototype dropped**, which the build keeps: diff the handoff against the brief's parity checklist and the phase 2 inventory.

Every other visual or interaction difference between the build and the prototype is a bug.

## 4. Plan and get approval

The plan (in plan mode if available) holds §2 and §3 plus:

- **Backend additions** for anything tagged NEW·API that the user wants. Ask which ones; each needs store, route and tests.
- **Undo design** if the design has Undo: for each action, its inverse (delete what was created; re-create what was removed and remap its new ID; patch back the previous value). Say which actions can't be undone and why.
- **PR sequence:** independent work first (uncommitted work the user already has, renames), backend additions next (the old UI ignores them), the new UI last. One reviewable concern per PR.
- **File map:** where each component lives, and which pure logic is split out so it can be unit-tested.
- **Verification:** the checks in §6.

Ask the user the decisions that remain (target sizes, rollout behind a flag or direct replacement, which backend features) in one batch.

## 5. Build in layers

1. **Pure model first.** Turn the server payload into view models (rows, cells, verdict text, summary ordering, candidate ranking) in plain modules with unit tests. It's the cheapest place to catch rule mistakes, and it keeps the components thin.
2. **Foundations:** tokens, the icon set as inline SVG, shared primitives (toast with a live region, anchored popover, side sheet), coarse-pointer target rules.
3. **Read-only view** next; it proves the rendering against real data before any editing exists.
4. **Editing:** add, remove, move (pointer, touch hold, keyboard), undo, the detail cards.
5. **Screen-level features:** panels, summary, find, finished state.
6. **Swap:** route the page to the new screen, keep the permission gates, delete the old screen.

Port by reading the prototype's block and the build's component side by side: markup structure, style values and copy come across verbatim; map raw colours to existing tokens; replace Unicode glyphs with the icon set.

Watch for these while building:

- A floating card inside a cell must scroll with the cell (anchor it to the cell, not the viewport).
- Anything that appears during a drag must be an overlay, or rows shift under the pointer.
- An `overflow` wrapper turns into the scroll container for any sticky header inside it.
- Every pop-up gets a visible ×, Esc, and click-outside that doesn't also trigger what's underneath.
- Switching views clears the old data at once (skeleton), with request cancellation so a slow response can't overwrite a newer one.

## 6. Verify

- Typecheck, tests and a production build on every PR. Don't run the build into a live dev server's output directory.
- **Parity walk** in the browser: every item in the brief's §8 checklist, as each permission tier.
- **Measure** with `scripts/measure-ui.js` at 1280, 1440 and 1920 and compare with the brief's §12 targets and §5 baseline. Report the before/after table.
- **Scene by scene:** open the prototype and the build side by side at the same width and walk every scene the prototype shows. List any difference that isn't in §3's table and fix it.
- **Copy walk:** compare every string in the build with the handoff's copy deck, including the error, empty, loading and confirmation states (trigger the safe ones; read the rest from the code). Re-run the `copy` section of the measurement script and compare with the brief's copy targets.
- Check keyboard focus is visible everywhere, reduced motion collapses animation, and nothing says the old product name.

## 7. Ship

- Commit and open PRs only when the user asks. Use the house commit style.
- For stacked PRs merged by squash, rebase each later branch with `git rebase --onto <new base> <old base commit> <branch>` so it carries only its own commits.
- Schema changes: write them as guarded, re-runnable SQL and tell the user exactly what to run and where, before deploying.
- Record the user's decisions and the deliberate differences in project memory so the next session doesn't re-port the prototype's rules.
