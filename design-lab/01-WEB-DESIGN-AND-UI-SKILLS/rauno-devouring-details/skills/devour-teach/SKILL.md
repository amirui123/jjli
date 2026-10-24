---
name: devour-teach
description: "Project context setup for devour reviews. Run once per repo before the first devour review. Reads the project, opportunistically reads impeccable's PRODUCT.md and DESIGN.md if present, asks questions (pre-filling where possible), and writes DEVOUR.md to the repo root. Supports multi-surface projects via a per-surface overrides section inside DEVOUR.md."
argument-hint: "[--repo <absolute-path>] [--surfaces] [--force]"
user-invocable: true
license: Apache 2.0. See NOTICE.md for full attribution to the design lineage this skill stands on.
---

> Different products live in different parts of the spine. A marketing page and a productivity tool share the same twelve principles, but weight them very differently.

Devour's principles are stable. Their relative importance is not. A landing page rarely fails #4 (reversibility) but often fails #9 (decoration). A productivity tool rarely fails #12 (type system) but often fails #3 (intent). A creative tool values #2 (physics) and #5 (sequence) highly; a dashboard values #10 (density) and #9 (information) highly.

Without context, devour produces findings that are technically correct but practically wrong for the product. You get a reversibility audit on a marketing page and a decoration audit on an offline-first productivity tool.

Run `/devour-teach` once per repo before any other devour skill. The output is a `DEVOUR.md` file at the repo root that all subsequent devour invocations will read before reviewing.

---

## When to use

- First time devour is run on any project.
- A project has significantly changed product direction, target audience, or surface type since the last `/devour-teach` run.
- The existing `DEVOUR.md` feels misaligned with what the project actually is. Pass `--force` to regenerate.
- Another devour skill (`devour`, `devour-motion`, `devour-micro`, `devour-state`) stopped and said "Devour needs project context first."

---

## Process

### Step 0a ... Resolve target repo (`--repo`) and parse known flags

Read `$ARGUMENTS`. If `--repo <path>` is present:

1. Extract `<path>` as the value.
2. Strip `--repo <path>` from `$ARGUMENTS` before passing to later steps.
3. Validate: the path must exist and be a directory. If it does not: stop and report `--repo path does not exist: <path>. Aborting.`
4. Set `$REPO` = the absolute `<path>`.

If `--repo` is not present: set `$REPO` = current working directory.

Also parse two other known flags before later steps use them:

- `--surfaces` ... set a flag `$MULTI_SURFACE = true`. Skip the multi-surface question in Step 4; go straight to surface declaration.
- `--force` ... set a flag `$FORCE = true`. Allow overwriting an existing `DEVOUR.md` in Step 0b.

Strip both from `$ARGUMENTS`.

For the rest of this skill:

- All file reads, relative-path resolutions, and project-local lookups use `$REPO` as the root.
- Git commands run with `git -C $REPO ...`.
- `DEVOUR.md` writes to `$REPO/DEVOUR.md`.
- `package.json` reads from `$REPO/package.json`.

### Step 0b ... Check for existing `DEVOUR.md`

Check `$REPO/DEVOUR.md`. Three cases:

1. **Does not exist:** proceed to Step 1.
2. **Exists, `$FORCE = true`:** confirm with user once ("`DEVOUR.md` already exists at `$REPO/DEVOUR.md`. Overwrite? [y/N]"). If yes, proceed to Step 1. If no, stop.
3. **Exists, `$FORCE` not set:** tell the user `DEVOUR.md already exists at $REPO/DEVOUR.md. Pass --force to regenerate. Showing current contents:` and print the file. Stop.

### Step 1 ... Opportunistic reads of impeccable's files

Check `$REPO/PRODUCT.md` and `$REPO/DESIGN.md`. If either exists, parse best-effort.

From `PRODUCT.md` (if present), extract:

- `register` (the bare value: `brand` or `product`) ... if the file has a `## Register` section with a single-word body.
- `## Users` section content ... for audience context.
- `## Brand Personality` section content ... for brand voice context.
- `## Anti-references` section content ... for anti-refs.

From `DESIGN.md` (if present), extract:

- Token declarations (`colors`, `typography`, `spacing`, `components`) ... for later reference in review runs.

If either file exists but does not parse cleanly, warn once ("Found `PRODUCT.md` but could not parse cleanly; proceeding as if absent") and continue.

### Step 2 ... Scan the codebase

Before asking questions, scan `$REPO` for signals:

- `README.md` ... project purpose, audience hints.
- `package.json` ... tech stack, dependencies (React version, Next.js, Framer Motion, animation libraries, UI library, form library, routing).
- `CLAUDE.md` or `.claude/CLAUDE.md` ... any existing design or product context.
- Top-level directory structure ... candidate surfaces (see Step 4).
- `.gitignore` ... does it already exclude `DEVOUR.md` or `.devour/`?
- Design-system references: `tailwind.config.*`, `tokens.css`, `theme.ts`, `design-tokens.*`.
- A sample of source files: two or three representative page or component files.

Note what can be inferred. Use these signals to skip questions in Step 3 where the answer is already clear.

### Step 3 ... Ask context questions

Ask the user these questions one at a time. For each, show any pre-fill from Steps 1-2 and confirm or let the user override.

1. **Register (required).** `brand` or `product`?
   - If PRODUCT.md had register, pre-fill: "I see `PRODUCT.md` declares register: `<value>`. Using that. Confirm? [Y/n]"
   - Else: "What register best describes this project? `brand` (marketing, landing, portfolio) or `product` (app UI, admin, dashboard)?"

2. **Project description (one paragraph).** Use README or CLAUDE.md as draft. Confirm or edit.

3. **Audience (one paragraph).** Pre-fill from PRODUCT.md's `## Users` section if present. Else ask: "Who uses this product? Consumers, developers, designers, operations / SRE / power users, executives, or a mix? Be specific about the primary segment."

4. **Brand voice.** Pre-fill from PRODUCT.md's `## Brand Personality` if present. Else ask: "How should the interface feel? Calm and considered? Playful and expressive? Bold and direct? Minimal and receding? Dense and information-first?"

5. **Anti-references.** Pre-fill from PRODUCT.md's `## Anti-references` if present. Else ask: "What should this explicitly NOT look like? Specific bad-example sites or patterns to avoid."

6. **Principle weighting.** devour's domain. Ask: "Which devour principles apply hardest to this project? Give three bands: High (🔴 BREAK fires easily), Medium, Low / N/A."

   Suggest sensible defaults based on register:

   - **`brand` defaults:** #1, #9, #12 High; #8, #11, #5 Medium; #4, #7 Low.
   - **`product` defaults:** #4, #7, #8, #3 High; #6, #12, #11 Medium; #1, #2 (varies by appetite); #10 Medium.

7. **Motion appetite.** One paragraph. Suggest scale:
   - None / static (no animation except functional loading states)
   - Restrained / functional (only where motion communicates state change)
   - Considered (deliberate motion that adds craft without calling attention to itself)
   - Expressive (motion is part of the product personality)

8. **Density target.** One paragraph. Suggest scale:
   - Spacious (Notion, Craft ... generous whitespace)
   - Balanced (Vercel dashboard, GitHub ... functional density)
   - Dense (Linear, VS Code ... maximum information per viewport)
   - Very dense (Bloomberg Terminal, Datadog ... power-user specific)

9. **Reference exemplars.** Bullet list. Pre-fill with known exemplars from `references/exemplars.md` matching the register if useful. Be specific: "Apple" is too broad; "Linear" or "Arc" or "Vercel dashboard" is useful.

10. **Specific things to watch for.** Open list. User provides. Examples:
    - "Framer Motion is installed; spring config is reviewable in detail."
    - "shadcn Tooltip is used in 12 components; watch for `delayDuration={0}` patterns."
    - "react-hook-form is installed but localStorage persistence is not; draft preservation worth reviewing."
    - "44pt targets... this is a mobile app; principle #6 findings should assume that."

Skip any question where pre-fill content is already sufficient and the user accepts it.

### Step 4 ... Multi-surface detection

If `$MULTI_SURFACE = true` (set by `--surfaces` flag), skip the detection question and go straight to surface declaration.

Otherwise, ask: "Does this project have multiple distinct surfaces with different registers or review priorities (for example: a marketing landing site AND a product app in the same repo)? [y/N]"

If `N`, skip to Step 5.

If `y`:

1. Ask: "Name the surfaces as path prefixes. Example: `homepage/, frontend/, admin/`. What are they?"
   - If user names zero surfaces (empty answer): tell them `--surfaces requires at least one named surface. If this is a single-surface project, run /devour-teach without --surfaces.` and stop.
   - If user names exactly one surface: ask `Only one surface named. Multi-surface mode adds a Per-surface overrides section to DEVOUR.md. For a single surface, the top-level register and weighting are usually enough. Proceed with one-surface override anyway, or skip the Per-surface section?` Let user pick. If skip, treat the same as `--surfaces` not having been passed.
   - If user names two or more: proceed normally to per-surface declaration loop.
2. For each named surface, ask:
   - **Register for this surface.** `brand` or `product`. Required.
   - Optional overrides for:
     - Principle weighting (three-band, like Step 3 question 6).
     - Motion appetite (one paragraph).
     - Density target (one paragraph).
     - Specific things to watch for (open list, additive to top-level).

Default behavior for optional overrides: show the top-level value (from Step 3) as the default; user can edit or skip with "default" to use the top-level.

Collect each surface block for Step 5.

### Step 5 ... Write `DEVOUR.md`

Compose the file from gathered content. Use this exact structure, skipping the `## Per-surface overrides` section entirely if the project is single-surface:

```markdown
# DEVOUR

<!-- Devour's review context for this project. Written by /devour-teach. -->
<!-- Devour reads this file before every review. -->

## Register

<top-level register, one word: brand or product>

## Project

<description from Step 3 question 2>

## Audience

<audience paragraph from Step 3 question 3>

## Brand voice

<brand voice paragraph from Step 3 question 4>

## Anti-references

<bullet list from Step 3 question 5>

## Principle weighting (default)

- **High:** <principles with names>
- **Medium:** <principles with names>
- **Low / N/A:** <principles with names and one-sentence reasons>

## Motion appetite

<paragraph from Step 3 question 7>

## Density target

<paragraph from Step 3 question 8>

## Reference exemplars

<bullet list from Step 3 question 9>

## Specific things to watch for

<open list from Step 3 question 10>
```

**If multi-surface, append this section after the top-level sections above:**

```markdown

## Per-surface overrides

For projects with multiple surfaces (e.g., marketing landing + product app), these declarations override the top-level defaults when a target path matches the surface prefix. First match wins; prefixes are checked in declaration order.

### <first surface, e.g., homepage/>

- **Register:** <brand|product>
- **Principle weighting:** <overrides, optional... if absent, inherits top-level>
- **Motion appetite:** <overrides, optional>
- **Density target:** <overrides, optional>
- **Specific things to watch for:** <additions, optional>

### <second surface, e.g., frontend/>

- **Register:** <brand|product>
- **Principle weighting:** ...
- ...
```

Write the composed content to `$REPO/DEVOUR.md`. Never overwrite without confirmation (already handled in Step 0b).

### Step 6 ... Git / version-control decision

Ask: "Track `DEVOUR.md` in version control? [Y/n]" (default yes; recommend yes).

If yes: tell the user `DEVOUR.md is ready to be staged and committed when you're ready. devour-teach does not run git commands automatically.` Do not stage or commit on the user's behalf.

If no: offer to add `DEVOUR.md` to `.gitignore`. "Add `DEVOUR.md` to `.gitignore`? [y/N]" If yes, append `DEVOUR.md` as a new line to `$REPO/.gitignore`, creating the file if it doesn't exist.

**If the user later asks devour-teach to commit:** use an imperative-mood, capitalized-first-letter message (e.g., `Add DEVOUR.md for devour reviews`). NEVER add `Co-Authored-By:` lines (devour is a tool, not a co-author). NEVER prefix the message with `feat:` / `fix:` / `chore:` unless the user has asked for that style explicitly.

### Step 7 ... Wrap-up

Summarize what was written:

- `DEVOUR.md` at `$REPO/DEVOUR.md`.
- Register: `<value>`.
- Surfaces: `<list of path prefixes if multi-surface, else "none (single surface)">`.
- `PRODUCT.md` read opportunistically: [yes / no].
- `DESIGN.md` read opportunistically: [yes / no].

Tell the user: "Devour is now ready. Run `/devour` or a focused review (`/devour-motion`, `/devour-micro`, `/devour-state`) to start. Use `/devour --register <value>` for a one-off register override; pass `--force` to `/devour-teach` to regenerate this file."

---

## Principle weighting guide by register

This is a starting point for Step 3 question 6. Adjust based on the specific answers to other questions.

**Brand register (marketing, landing, portfolio):**

- High: #1 (honest motion), #9 (reduce decoration), #12 (type system)
- Medium: #8 (affordances), #11 (metaphor), #5 (sequence)
- Low: #4 (reversibility), #7 (state preservation)
- N/A: rarely #6 on desktop-only sites

**Product register (app UI, admin, dashboard, productivity tool):**

- High: #3 (intent commit), #4 (reversibility), #6 (ergonomics), #7 (state preservation), #8 (affordances)
- Medium: #9 (decoration), #10 (density), #12 (type system)
- Low: #1 (motion ... functional only), #2 (physics, unless gestures are central)
- Adjust if mobile: raise #6 significantly.

These defaults are starting points. Real products land between them: a content-heavy product (e.g., Notion, Linear's docs) borrows from both.

---

## What `DEVOUR.md` enables

Without a `DEVOUR.md`, the review applies all twelve principles at equal weight. The result is technically correct and practically noisy: six findings about motion on a tool where the motion appetite is "none/static," and no findings about state preservation on a tool where every async operation is a potential data-loss event.

With a `DEVOUR.md`, the review front-loads the principles that matter, calibrates severity by register, and skips (or lowers) principles that are not relevant. The findings are sharper, shorter, and more actionable.

For multi-surface projects, the `## Per-surface overrides` section ensures that a marketing landing in the same repo as a product app gets brand-register findings while the app gets product-register findings, all from a single context file.

---

## See also

- [`../devour/SKILL.md`](../devour/SKILL.md) ... start here after running teach
- [`../../references/lineage.md`](../../references/lineage.md) ... the five-layer model (Layer 0 pre-HCI foundations through Layer 4 modern web)
- [`../../references/principles-map.md`](../../references/principles-map.md) ... per-principle source citations
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md) ... what each principle is protecting against
