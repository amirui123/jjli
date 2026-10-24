---
name: devour-state
description: "Deep review of state-handling principles #4 (reversibility is craft) and #7 (preserve user state across boundaries). Use when optimistic UI feels unsafe, when users lose work on navigation, when error paths are missing or silent, or when a feature involving async operations needs a state lifecycle audit. Traces findings back to Emil Kowalski (Sonner), the Linear team, Loren Brichter, Andy Matuschak, Bret Victor, Don Norman."
argument-hint: "[--repo <absolute-path>] [--register <brand|product>] [target] [--terse]"
user-invocable: true
license: Apache 2.0. See NOTICE.md for full attribution to the design lineage this skill stands on.
---

> Optimism without a return address is a user experience bug.
> ... after Emil Kowalski, Sonner, and Don Norman's gulf of evaluation

Devour-state is a focused review of the two principles that govern how software handles the gap between what the user did and what the system confirmed: reversibility (#4) and state preservation (#7). These are the principles that separate software that feels *trustworthy* from software that feels slippery.

Most state bugs are not engineering bugs. They are design bugs where the loading state was considered and the error state was not. The submit button got a spinner. The spinner never became an error message. The user tried again. The action ran twice.

---

## When to use

- A component or flow involves optimistic UI (update the UI before server confirmation).
- A form, editor, or filter interface exists and the user might navigate away.
- There are toast notifications or banners in the codebase with no corresponding failure variants.
- A prior `devour` run produced 🔴 or 🟡 findings in principles #4 or #7.
- The user explicitly says: "this feels unsafe," "users are losing their work," "the error handling isn't complete," "our retry doesn't work."
- You are reviewing a flow that has: submit buttons, async mutations, navigation transitions, filter/sort state, tabs, pagination, or draft-like editing.

For motion review (spring physics, animation honesty), use [`devour-motion`](../devour-motion/SKILL.md). For micro-interaction review (hover delays, touch targets, component choice), use [`devour-micro`](../devour-micro/SKILL.md). For a full-spine pass, use [`devour`](../devour/SKILL.md).

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

**Always execute this process from scratch on each invocation.** If prior devour-state output exists in session memory, ignore it. Re-read targets, re-run browser-MCP detection, re-verify findings. Never reproduce, paraphrase, or replay cached output. If the user asks to "re-run," "run again," or "check again," they are asking for a fresh execution of the full process.

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

- `skill` frontmatter matches the current skill (e.g., `devour-state`).
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

Read `$ARGUMENTS`. If `--terse` is present, set output mode to **terse**. Strip `--terse` before passing arguments to Step 1. Terse mode keeps the same rigor and the same two-principle scope but strips teaching prose from each finding. The APPLY? prompt and INTERACTIONS BETWEEN FINDINGS block are unchanged in both modes.

### Step 1 ... Establish target

If `$ARGUMENTS` is provided (after stripping `--terse`), read the target file(s) in full.

If `$ARGUMENTS` is empty:
- Default to changed files in the current branch filtered to `.tsx`, `.jsx`, `.ts`.
- If no changes, ask the user.

Look for immediately:
- `mutation`, `useMutation`, `mutate`, `mutateAsync` ... TanStack Query / SWR mutations
- `useState` paired with async operations
- `toast()`, `toast.success()`, `toast.error()` ... are all three variants present?
- `onSubmit`, `handleSubmit` ... form submission handlers; look for error handling
- `useRouter().push()` or `navigate()` ... navigation that could lose form state
- `useEffect` with router dependency ... scroll restoration patterns
- `useSearchParams`, `useParams` ... URL-based state that might not persist

#### Step 1a ... Detect a browser-driving MCP

Before reading any code, check whether any browser-driving MCP is available in your tool set. Devour-state does not require a specific browser MCP; any tool family that lets you open pages, navigate, and evaluate scripts will work.

Common browser MCPs to look for, by tool-name prefix:

- `mcp__chrome-devtools__*` (chrome-devtools-mcp ... most common)
- `mcp__playwright__*` (Playwright MCP)
- `mcp__browser__*` or `mcp__browser-mcp__*` (BrowserMCP)
- `mcp__browserbase__*` (Browserbase)
- `mcp__puppeteer__*` (Puppeteer MCP)

The minimum capabilities devour-state needs are: open a URL, evaluate JavaScript on the page, navigate between routes, and trigger async operations. Different MCPs name these differently. Identify the relevant tools by capability, not by exact name.

**DOM-first rule:** state-preservation findings are about what persists (or doesn't) across navigation, reload, and async boundaries. Use `evaluate_script` to read stored state before and after the boundary: scroll position (`window.scrollY`), form values (`document.querySelectorAll('input').forEach(i => log(i.value))`), selection state (`window.getSelection()`), localStorage, sessionStorage, and DOM attributes. Screenshots cannot capture state continuity because state is not a visual artifact... it is an invariant across time. Read the invariant directly. Reserve screenshots for the rare case where visual state (highlighted row, active tab) is easier to confirm visually than to probe structurally.

**If NO browser-driving MCP is available:**

Tell the user once, plainly: "I don't have a browser-driving MCP available in this session, so this will be a code-only review. State transition findings cannot be confirmed from code alone ... optimistic rollback paths, navigation state preservation, and form state across route changes all need to be observed at runtime. To enable that, install any browser MCP (chrome-devtools, Playwright, BrowserMCP, etc.) and re-run."

Then proceed with code-only review. Mark the output `Reviewed: code only`.

**If a browser MCP IS available:**

Try the equivalent of `list_pages` first. Three cases:

1. **A page matching the dev server is already open** (look for `localhost`, `127.0.0.1`, or a known dev URL from `$REPO/package.json`'s `dev` script): use it. Select/focus it.
2. **No matching page is open, but you can find the dev server URL** (read `$REPO/package.json`, look for `next dev`, `vite`, `pnpm dev`, port hints; default to `http://localhost:3000` for Next/Vite, `http://localhost:5173` for Vite, `http://localhost:5174` for Astro): open it.
3. **No dev server detectable**: ask the user once: "What URL is your dev server on?" If the user doesn't have one running, fall back to code-only and mark accordingly.

Mark the output `Reviewed: code + browser (<MCP name>)` once you have a live page.

**When a browser MCP IS available and a dev server is running:**

For any finding that depends on runtime behavior, **do the browser verification before emitting the finding**. For devour-state, this covers the core of both principles:

- **Optimistic rollback path** (principle #4): trigger the mutation, then simulate a network failure (evaluate JavaScript to intercept the fetch or override the handler), confirm the UI rolls back and surfaces the error to the user.
- **Silent rollback detection**: trigger the mutation, break it, observe whether any signal reaches the user or whether the UI silently reverts.
- **Submit button lifecycle**: click submit, observe whether the button enters loading, returns to active on error, and shows an error message. A spinner that never clears is only visible at runtime.
- **Form state on navigation** (principle #7): fill a form partially, navigate away via the browser, navigate back, and check whether state is preserved.
- **Scroll position**: navigate away from a scrolled page and back; confirm position is restored or deliberately reset.
- **Tab/filter state**: change tabs or apply a filter, navigate away, navigate back; confirm state round-trips correctly.

Rules:

- If verification **confirms** the issue: emit the finding tagged `[browser-confirmed]`.
- If verification **shows no issue**: do NOT emit the finding. The code-based hypothesis was wrong; observation overrides it.
- Do NOT emit findings that say "verify in browser first" or "test this in browser." The skill has browser access; it does that work itself.

**When a browser MCP IS available but NO dev server is running:**

Ask the user once: "I have browser MCP access but no dev server. Should I try to detect a running instance, or should I proceed with code-only review?" If they provide a URL, use it. Otherwise proceed code-only.

---

### Step 2 ... Apply principles #4 and #7

**Register sensitivity.** Each principle's deep-dive file (`references/principles/<principle>.md`) includes a `## Register sensitivity` section. When applying a principle, read that section and calibrate severity by the current register:

- **`brand`** ... uses brand-register ceilings. Some patterns fire harder, some softer. Typography, decoration, and motion have more room; transaction principles have less urgency.
- **`product`** ... uses product-register ceilings. Tighter on decoration, tighter on type-system discipline, stricter on reversibility and state preservation.
- **Absolute bans** fire 🔴 BREAK in both registers regardless (see `references/anti-patterns.md` for the absolute list: bounce/elastic easing, missing error paths, side-stripe borders, gradient text, glassmorphism as default).

A finding's severity may differ between registers for the same code pattern. When a finding is register-specific, say so in the finding body ("This would be 🟡 DRIFT on brand, but on product it's 🔴 BREAK because...").

---

#### Principle #4 ... Reversibility is craft

> Every optimistic state needs a believable error path.

**Source:** Dieter Rams, principle 6 ("Good design is honest," Layer 1). Don Norman, gulf of evaluation and feedback (Layer 2). Bret Victor, "Magic Ink" on state visibility (Layer 2). Emil Kowalski, Sonner's lifecycle design (Layer 4).

**The core idea:** Optimistic UI is a trust mechanism. The interface promises the user that their action will succeed before the server confirms it. When you make that promise, you take on a debt: you must show the user what happens if the promise fails. The "Saved!" toast that never shows an error is not optimistic UI; it is a lie that the server might expose.

Dieter Rams principle 6 ("Good design is honest") is the load-bearing claim here. An interface that shows success but cannot show failure is not honest. It is performing success without encoding the full meaning of the operation.

**Anti-patterns to catch:**

`toast.success()` with no corresponding `toast.error()`:
```tsx
// Anti-pattern: incomplete lifecycle
const handleSave = async () => {
  try {
    await saveDocument(data)
    toast.success("Saved!")
  } catch (e) {
    console.error(e) // Error is logged, not shown to user
  }
}
```

`toast.promise()` used correctly is the exemplar. One call, three states:
```tsx
// Correct: toast.promise() forces you to define all three states
toast.promise(saveDocument(data), {
  loading: "Saving...",
  success: "Saved",
  error: "Failed to save. Try again.",
})
```

Silent optimistic rollback:
```tsx
// Anti-pattern: UI updates, server fails, UI reverts with no user signal
const handleToggle = () => {
  setEnabled(!enabled) // optimistic update
  try {
    await updateSetting({ enabled: !enabled })
  } catch (e) {
    setEnabled(enabled) // silent rollback
    // No toast, no banner, no indication anything failed
  }
}
```

Submit button that enters spinner and stays there on network failure:
```tsx
// Anti-pattern: incomplete button lifecycle
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  await submitForm(data)
  setLoading(false)
  // If submitForm throws, setLoading(false) never runs
  // Button stays in spinner state permanently
}

// Should be:
const handleSubmit = async () => {
  setLoading(true)
  try {
    await submitForm(data)
    setLoading(false)
    toast.success("Submitted.")
  } catch (e) {
    setLoading(false)
    toast.error("Submission failed. Try again.")
  }
}
```

Delete confirmation that doesn't show what was deleted. "Are you sure?" is not a confirmation; "Delete 'Q4 Report'?" is:
```tsx
// Anti-pattern: generic confirmation
<AlertDialog>
  <AlertDialogDescription>
    Are you sure? This cannot be undone.
  </AlertDialogDescription>

// Better: name the thing being deleted
<AlertDialog>
  <AlertDialogDescription>
    Delete "{document.title}"? This cannot be undone.
  </AlertDialogDescription>
```

**TanStack Query optimistic update with rollback** is the correct implementation model:
```tsx
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['items', newItem.id] })
    // Snapshot current value
    const previousItem = queryClient.getQueryData(['items', newItem.id])
    // Optimistically update
    queryClient.setQueryData(['items', newItem.id], newItem)
    // Return snapshot for rollback
    return { previousItem }
  },
  onError: (err, newItem, context) => {
    // Rollback with signal
    queryClient.setQueryData(['items', newItem.id], context.previousItem)
    toast.error("Update failed. Your changes have been reverted.")
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
})
```

The `onError` callback is the reversibility moment. If it exists but doesn't surface anything to the user, reversibility has been implemented in the data layer and dropped in the UI layer.

**Loading → success → error lifecycle check:**

For every async operation in the target, verify all three states exist and are surfaced:
- **Loading:** button spinner, skeleton, or "Saving..." signal
- **Success:** toast, banner, inline confirmation, or state change
- **Error:** toast, banner, inline error, or recovery path

Missing any of these is a 🔴 BREAKS finding.

---

#### Principle #7 ... Preserve user state across boundaries

> Loading must not lose your scroll, your selection, your draft.

**Source:** Bruce Tognazzini, state preservation as first principle (Layer 2). Andy Matuschak, working memory as a design constraint (Layer 3). Loren Brichter, Tweetie's state continuity across navigation (Layer 3). Linear team, offline-first state model (Layer 3).

**The core idea:** Every navigation event, filter change, tab switch, or page load is a boundary. Each boundary is an opportunity to lose state that the user has accumulated. Working memory is limited; the interface should not ask users to hold things in their head that it could hold itself.

Andy Matuschak's framing is precise: if you navigate away from a half-filled form and back, the form should be exactly as you left it. The interface, not your memory, is the externalized store.

**Anti-patterns to catch:**

Scroll reset on navigation:
```tsx
// Anti-pattern: page scrolls to top on every navigation
// In Next.js App Router, this is the default behavior unless addressed

// Common pattern that loses scroll:
useEffect(() => {
  window.scrollTo(0, 0)
}, [pathname])
// This is sometimes appropriate; often it is not
```

Lost form state on refresh or navigation:
```tsx
// Anti-pattern: form state lives only in React state
const [title, setTitle] = useState("")
// Browser back → forward: title is gone
// Accidental refresh: title is gone
// Navigate away and back: title is gone
```

`react-hook-form` with no persistence layer for drafts. For any form where the user might spend significant time, consider `localStorage` persistence:
```tsx
// Pattern to suggest:
const form = useForm({
  defaultValues: () => {
    const saved = localStorage.getItem('form-draft')
    return saved ? JSON.parse(saved) : defaultValues
  }
})

// Auto-save on change:
useEffect(() => {
  const subscription = form.watch((values) => {
    localStorage.setItem('form-draft', JSON.stringify(values))
  })
  return () => subscription.unsubscribe()
}, [form.watch])
```

Selection lost on filter change:
```tsx
// Anti-pattern: selected items cleared when filter updates
const [selected, setSelected] = useState<Set<string>>(new Set())
const [filter, setFilter] = useState("")

const filteredItems = items.filter(item => item.name.includes(filter))

const handleFilterChange = (newFilter: string) => {
  setFilter(newFilter)
  setSelected(new Set()) // Anti-pattern: clears selection on filter change
}
```

Tab state not persisted to URL:
```tsx
// Anti-pattern: active tab lives only in component state
const [activeTab, setActiveTab] = useState("overview")
// Share the URL? The recipient sees a different tab.
// Refresh? Tab resets to default.

// Better: tab state in URL params
const searchParams = useSearchParams()
const activeTab = searchParams.get("tab") ?? "overview"
```

Modal state not preserved when reopened. If a wizard-style modal has multiple steps and the user accidentally closes it, they should be able to return to where they were.

**Linear's offline-first model** is the canonical exemplar for #7. Open Linear on a plane. Navigate through issues. Create a new issue. Close the app. Reopen it. Everything is exactly as you left it. The state boundary (network loss, app close) is invisible to the user. This is the aspirational end state; for most web apps, a partial implementation (URL state, localStorage drafts) captures most of the value.

**Loren Brichter's Tweetie** is the original exemplar: tab state, scroll position, and draft text were all preserved across background/foreground transitions. This was novel in 2008 and became the iOS standard. The principle has not changed.

**State preservation checklist:**

For each boundary in the target (navigation event, filter change, tab switch, modal close/reopen, browser refresh), verify:
- Scroll position: preserved or deliberately reset?
- Form draft: persisted or cleared?
- Active selection: preserved through filter changes?
- Active tab: URL-driven or component-state-only?
- Sort/filter state: URL-driven or reset on navigation?

Any "cleared" or "reset on navigation" that is not deliberate is a finding.

---

### Step 3 ... Write findings

```
[#N PRINCIPLE NAME] - <severity>
File: <path>:<line range>
Symptom:
  <one or two sentences describing the observed code>
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

- **🔴 BREAKS** ... the principle violation causes real user harm: a submit button stuck in spinner state on failure; a form that loses all user input on navigation; a silent rollback where the user never knows their action failed; an optimistic update with no error path at all.
- **🟡 DRIFTS** ... the principle is not catastrophically violated but the surface is slipping: toast exists but the error variant is generic ("Something went wrong") rather than actionable; scroll position resets in a case where most users won't notice but some will; tab state is component-only rather than URL-driven.
- **🟢 OPPORTUNITY** ... the principle is met minimally but a more complete implementation would substantially improve trust: add `toast.promise()` where you have separate loading/success/error calls; persist filter state to URL; add auto-save draft to a long-form editor.

**Finding annotation:** Each finding should be tagged immediately after the severity marker:

- `[code-confirmed]` ... finding was verified from static code alone
- `[browser-confirmed]` ... finding was verified by driving the live UI via browser MCP

If no browser MCP is available, all findings are `[code-confirmed]`. If browser MCP is available, findings touching optimistic state (#4) and route-boundary state preservation (#7) should be `[browser-confirmed]` by actually running the check before emitting the finding. State transitions cannot be confirmed from code alone; the error path that looks present in code may never surface in the UI.

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

The header block, severity groupings, INTERACTIONS BETWEEN FINDINGS block, STATE SUMMARY block, and APPLY? block all remain in terse mode, unchanged.

**About the `Downstream:` line.** Devour emits findings; [impeccable](https://impeccable.style) executes tactical fixes. When a devour-state finding maps cleanly to an impeccable subcommand, name it on the Downstream line. This makes the compose-don't-merge relationship operational: a user reading a run file can pick the impeccable subcommand for the next session without consulting a separate mapping table.

The line is optional. Omit it when no clean impeccable command fits, or when the finding requires a designer judgment call that no subcommand can fully express.

Mapping reference (state principles only):

| Principle | Primary /impeccable command | Secondary |
|---|---|---|
| #4 Reversibility | /impeccable harden | /impeccable clarify |
| #7 Preserve user state | /impeccable harden | - |

**Verbose output format (default):**

```
═══════════════════════════════════════════════════
DEVOUR STATE REVIEW: <target>
Context: <principle weighting from Devour Context>
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
STATE SUMMARY
N breaks · N drifts · N opportunities
Principles reviewed: #4 (reversibility), #7 (state preservation)
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

After printing the review, **always print the APPLY? block as the final lines of output.** Do not skip it. State findings often involve the highest-value fixes in a devour pass; do not bury the apply prompt.

If code-only (no browser MCP found or no dev server), append above the APPLY? block: "Reviewed code only. State transitions cannot be confirmed from code alone; optimistic rollback paths, navigation state preservation, and form state across route changes need browser verification before you trust them. Re-run with a browser MCP + dev server to confirm."

**Before printing the SUMMARY block, check for inter-finding conflicts.** Two findings can be in tension when fixing one weakens the other, or when both share a root cause that requires a single structural change to resolve (e.g., one finding asks for optimistic UI and another asks for state preservation across navigation; both might point at adopting TanStack Query for the surface). If any conflicts exist, name them in the INTERACTIONS BETWEEN FINDINGS block (between the findings and the SUMMARY). If none, skip the block entirely.

When applying:

- **Show the diff** before each file change. Brief, just the hunks.
- **Apply 🔴 BREAKS without further confirmation** if the user picked option 1, 2, or 3. State breaks (missing error paths, lost user state) almost always need the named fix.
- **Ask once per 🟡 DRIFT or 🟢 OPPORTUNITY** that involves a real taste call (e.g., "persisting filter state to URL ... is this navigable enough to want it deep-linkable?"). Skip the ask if the fix is mechanical.
- **The APPLY? answer IS the scope** (see [`references/methodology.md`](../../references/methodology.md) for full treatment). Don't pull future-tier work forward without explicit greenlight from the user. If you spot a bundling opportunity ("F7 from a deferred tier touches this same component"), surface it as a question BEFORE doing the work, not after. "Per your earlier discussion" / "per your interjection" / "per the spirit of the request" are not greenlights; the user must explicitly authorize scope expansion. When in doubt, narrow to the spec and surface the bundling-candidate as an observation.
- **After all fixes are applied, ask if the user wants to commit.** Do not auto-commit.
- **If the user asks devour to commit:** use an imperative-mood, capitalized-first-letter message. NEVER add `Co-Authored-By:` lines (devour is a tool, not a co-author). NEVER prefix the message with `feat:` / `fix:` / `chore:` unless the user has asked for that style explicitly.

### Step 4 ... Save the run to file (streaming, compaction-safe)

Devour-state writes each invocation's output as a "run" file under `$REPO/.devour/runs/`. The file is written incrementally as the review proceeds, not just at the end. This makes runs durable against session compaction or abort, and makes them resumable. See Step 0d for resume behavior.

**Location:** `$REPO/.devour/runs/<YYYY-MM-DDTHHMMSS>-devour-state-<target-slug>.md` relative to the target repo root.

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
skill: devour-state
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

Specific, calm, citation-heavy. The findings in this review are often the most important ones in a devour pass, because state failures cost users real work. Name the failure precisely. Cite the principle. Show the fix with code.

Do not say "this could be better." Do not say "you might want to add error handling." Say what is missing, which principle it violates, what the user experiences when it's missing, and how to fix it.

---

## See also

- [`../devour/SKILL.md`](../devour/SKILL.md) ... full-spine review
- [`../../references/principles-map.md`](../../references/principles-map.md) ... source citations for #4, #7
- [`../../references/exemplars.md`](../../references/exemplars.md) ... Sonner toast lifecycle, Linear offline-first, Tweetie state preservation
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md) ... full anti-pattern catalog for state principles
- [`../../references/reading-list.md`](../../references/reading-list.md) ... Bret Victor's "Magic Ink," Andy Matuschak's writings
