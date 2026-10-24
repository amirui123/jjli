---
name: ux-microcopy-audit
description: >
  Scan UX microcopy, interface copy, and content for clarity, tone, and usability issues.
  Use PROACTIVELY when building UI components, writing button labels, form fields, error messages,
  empty states, tooltips, onboarding flows, modals, confirmation dialogs, notifications, or any
  user-facing text. Also use when reviewing existing interfaces for copy improvements, fixing
  confusing labels, or ensuring consistent voice and tone across an application.
version: 2.0.0
license: MIT
---

# UX Microcopy Audit

Scans user-facing text in code and provides actionable recommendations to improve clarity, tone, consistency, and usability.

## How to use

- `/ux-microcopy-audit`
  Scan all user-facing text in the current working directory and report findings.

- `/ux-microcopy-audit <file or directory>`
  Audit a specific file or directory for microcopy issues.

## When this skill triggers proactively

This skill should activate when:
- Writing or editing UI components that contain user-facing strings
- Creating forms, modals, dialogs, or confirmation flows
- Adding error messages, validation text, or empty states
- Building onboarding, tooltips, or instructional content
- Reviewing pull requests that touch interface copy

## Brand voice profile

Before auditing, check if the project has a voice profile defined. If not, infer from existing copy or ask the user. The profile shapes how tone rules are applied.

```
Voice profile:
  Formality:    [casual | neutral | formal]
  Personality:  [friendly | professional | playful | authoritative | minimal]
  Humor:        [none | light | frequent]
  User address: [you | we | imperative | passive]
  Brevity:      [ultra-short | concise | explanatory]
  Brand words:  [words the product prefers, e.g. "workspace" not "project"]
  Banned words: [words to avoid, e.g. "simple", "just", "please"]
```

When no profile exists, default to: **neutral formality, professional personality, no humor, "you" address, concise brevity**. Flag any copy that would change meaning depending on the profile — these are the highest-value findings.

## Workflow

1. Load or infer the brand voice profile
2. Scan files for user-facing strings using the framework-specific scanning guide below
3. Evaluate each string against the audit categories
4. Report findings grouped by severity with exact file:line references
5. Provide a concrete rewrite for every issue found
6. Keep diffs scoped to copy only — do not refactor logic or layout
7. Hand off related findings to companion skills when appropriate

## Audit categories by priority

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Clarity and scannability | Critical |
| 2 | Actionable language | Critical |
| 3 | Error and validation messages | Critical |
| 4 | Tone and voice consistency | High |
| 5 | Inclusivity and accessibility | High |
| 6 | Empty and loading states | Medium |
| 7 | Redundancy and filler | Medium |
| 8 | Localization readiness | Low |

## Severity scoring rubric

Use these criteria to assign severity consistently:

| Severity | Criteria | Examples |
|----------|----------|---------|
| **Critical** | User cannot complete a task, misunderstands a destructive action, or is blocked by unclear copy | Unlabeled button on a payment flow, "Error" with no explanation, "Confirm" on a delete dialog |
| **High** | User can complete the task but is confused, slowed down, or loses trust | Tone mismatch between adjacent elements, gendered language, jargon in a consumer product |
| **Medium** | Copy works but is suboptimal — wordy, generic, or inconsistent with voice profile | "Successfully saved" instead of "Saved", redundant instructions, missing empty state guidance |
| **Low** | Nitpick or future-proofing — localization issues, minor redundancy, stylistic preference | Hardcoded plurals, idioms in core UI, date format without Intl |

When in doubt, ask: "Could this copy cause a user to make an irreversible mistake?" If yes → critical. "Could it cause confusion or erode trust?" If yes → high.

## Rules

### 1. Clarity and scannability (critical)

- Every label, heading, and button must be understandable without surrounding context
- Avoid jargon, internal terminology, or developer-speak in user-facing text
- Front-load the most important word in labels and headings
- Keep microcopy short — if it needs a paragraph, it belongs in docs, not UI
- Prefer specific language over vague

| Bad | Good | Why |
|-----|------|-----|
| "Submit" | "Save changes" | Tells the user what will happen |
| "Action completed" | "3 items removed" | Specific outcome, not vague confirmation |
| "Process your request" | "Create your account" | Names the actual action |
| "Data" | "Your projects" | Specific to what the user sees |
| "Invalid" | "Enter a valid email address" | Says what's wrong and what to do |

### 2. Actionable language (critical)

- Buttons must start with a verb
- Use specific verbs over generic ones
- Destructive actions must name what will be destroyed
- Confirmation dialogs must clearly state the consequence, not just ask "Are you sure?"
- CTAs should tell the user what happens next, not just what they are clicking

| Bad | Good | Why |
|-----|------|-----|
| "OK" | "Save draft" | Names the action |
| "Confirm" | "Delete project" | Names what's being destroyed |
| "Are you sure?" | "Delete 'My Project'? This can't be undone." | States the consequence |
| "Account creation" | "Create account" | Verb-first, actionable |
| "Next" | "Review order" | Tells user what the next step is |
| "Click here" | "View pricing" | Describes the destination |
| "Yes / No" | "Delete / Keep" | Names both outcomes |

### 3. Error and validation messages (critical)

- Error messages must say what went wrong AND how to fix it
- Never blame the user
- Be specific about requirements
- Avoid error codes or technical details in user-facing messages (log them, don't show them)
- Field-level validation should appear next to the field, not in a generic banner
- Use a calm, helpful tone — errors are stressful enough already

| Bad | Good | Why |
|-----|------|-----|
| "Invalid input" | "Must be at least 8 characters" | Specific requirement |
| "You entered an invalid password" | "That password is too short" | No blame, states the problem |
| "Error 422" | "This email is already registered. Try signing in instead." | Actionable, no error code |
| "Required" | "Enter your email to continue" | Explains why it's needed |
| "Something went wrong" | "Couldn't save your changes. Check your connection and try again." | What failed + what to do |
| "Bad request" | "That file is too large. Upload a file under 10 MB." | Specific limit, specific fix |

### 4. Tone and voice consistency (high)

- Maintain consistent formality level across the entire interface
- Don't mix casual with formal in the same product
- Avoid robotic phrasing
- Match the brand voice profile
- Avoid over-enthusiasm (excessive exclamation marks, "Awesome!", "Great job!")
- Flag any instance where tone shifts noticeably between adjacent elements

| Bad | Good | Why |
|-----|------|-----|
| "Oops! An error has occurred" | "Something didn't work. Try again." | Mixed casual + formal |
| "Your request has been processed successfully" | "Done — your changes are saved" | Robotic → human |
| "Awesome! You did it!" | "Account created" | Over-enthusiastic for a routine action |
| "We are unable to fulfill your request at this time" | "We couldn't complete that right now" | Legalese → plain language |
| "Hey! 👋 Error: unauthorized" | "Sign in to continue" | Whiplash between casual greeting and technical error |

### 5. Inclusivity and accessibility (high)

- Avoid gendered language where unnecessary ("they" not "he/she")
- Don't rely solely on color or icons to convey meaning — text must stand alone
- Placeholder text must not be the only label for a field
- Alt text on images must be descriptive and useful, not "image" or the filename
- Avoid ableist language ("simple", "easy", "just") — what's easy for one user isn't for all
- Screen reader text (aria-labels, sr-only) must make sense when read aloud without visual context

| Bad | Good | Why |
|-----|------|-----|
| "he/she" | "they" | Inclusive, shorter |
| alt="image" | alt="Bar chart showing monthly revenue for 2024" | Descriptive and useful |
| alt="IMG_4392.png" | alt="Team photo at the 2024 retreat" | Describes content, not filename |
| "It's easy!" | "Here's how to get started" | Doesn't assume ability level |
| "Just click the button" | "Select 'Create' to begin" | No minimizing language |
| aria-label="btn" | aria-label="Close dialog" | Meaningful when read aloud |
| placeholder="Email" (no label) | `<label>Email</label>` + placeholder="jane@example.com" | Label is persistent, placeholder is a hint |

### 6. Empty and loading states (medium)

- Empty states must explain what the page will contain AND how to start
- Loading text should set expectations
- Zero-result states should suggest next steps
- First-time user states should guide, not just be blank
- Skeleton screens are good, but if text appears, it should be helpful

| Bad | Good | Why |
|-----|------|-----|
| (blank page) | "No projects yet. Create your first project to get started." | Explains + guides |
| "No results" | "No results for 'quartz'. Try a broader search or check your spelling." | Suggests next steps |
| "Loading..." | "Loading your projects..." | Sets expectations about what's coming |
| "0 items" | "Your cart is empty. Browse the store to find something you'll love." | Warm, actionable |
| "Nothing here" | "No notifications yet. We'll let you know when something needs your attention." | Reassuring, explains the feature |

### 7. Redundancy and filler (medium)

- Remove "Please" from most UI actions (it adds length without value in buttons/labels)
- Remove "Successfully" from success messages
- Eliminate obvious statements
- Don't repeat the page title in a description below it
- Avoid "Note:", "Important:", "Please note:" prefixes — just state the thing

| Bad | Good | Why |
|-----|------|-----|
| "Project successfully saved" | "Project saved" | "Successfully" adds nothing |
| "Please enter your email" | "Enter your email" | "Please" is filler in UI |
| "Click the button to submit" | "Submit" | They know it's a button |
| "Note: This action cannot be undone" | "This action cannot be undone" | "Note:" is a filler prefix |
| "Are you sure you want to delete?" / "Yes" / "No" | "Delete this project?" / "Delete" / "Cancel" | Name the actions, not yes/no |
| Page title: "Settings" / Subtitle: "Your settings" | Page title: "Settings" / Subtitle: "Manage your account, notifications, and preferences" | Don't repeat — add value |

### 8. Localization readiness (low)

- Avoid concatenating strings with variables in ways that break in other languages
- Don't hardcode pluralization — use a pluralization utility
- Avoid idioms, puns, or culturally specific references in core UI text
- Keep strings in extractable locations (not buried in ternary expressions)
- Date, time, and number formats should use locale-aware formatting

| Bad | Good | Why |
|-----|------|-----|
| `` `"Hello " + name + ", welcome!"` `` | `` t('greeting', { name }) `` | Word order varies by language |
| `` `${count} item${count > 1 ? 's' : ''}` `` | `` formatPlural(count, { one: '# item', other: '# items' }) `` | Some languages have 6 plural forms |
| "Piece of cake!" | "This won't take long" | Idioms don't translate |
| `new Date().toLocaleDateString()` | `new Intl.DateTimeFormat(locale).format(date)` | Explicit locale control |

## Common anti-patterns

Quick-reference for the 20 most frequently seen microcopy problems. Use this as a first-pass checklist.

| # | Anti-pattern | Fix | Category |
|---|-------------|-----|----------|
| 1 | "Are you sure?" with Yes/No buttons | State the consequence + name both actions | Actionable language |
| 2 | "Invalid input" | Name the field and the requirement | Error messages |
| 3 | "Something went wrong" | Say what failed and suggest a next step | Error messages |
| 4 | "Submit" button | Name the action ("Save changes", "Send message") | Actionable language |
| 5 | "Click here" link | Describe the destination ("View documentation") | Clarity |
| 6 | "OK" / "Cancel" on every dialog | Name both outcomes ("Delete" / "Keep") | Actionable language |
| 7 | Blank empty state | Explain what goes here + CTA to start | Empty states |
| 8 | "Successfully" in success toasts | Remove the word. "Saved." is enough | Redundancy |
| 9 | "Please" on every button/label | Remove it. Imperative is fine in UI | Redundancy |
| 10 | Placeholder-only form fields | Add a visible `<label>`. Placeholder is a hint, not a label | Accessibility |
| 11 | alt="image" or alt="" on meaningful images | Describe the content of the image | Accessibility |
| 12 | "Oops!" before errors | Match the product's tone. Most products aren't that casual | Tone |
| 13 | Mixing "you" and "your" with "we" and "our" randomly | Pick a consistent address pattern | Tone |
| 14 | "Error 500" / "Error 404" shown to users | Translate to plain language ("Page not found") | Error messages |
| 15 | "Note:" / "Important:" prefixes | Just state the thing | Redundancy |
| 16 | "Loading..." with no context | Say what's loading ("Loading your dashboard...") | Empty states |
| 17 | Hardcoded `item/items` pluralization | Use Intl.PluralRules or a pluralization library | Localization |
| 18 | "It's easy!" / "Just do X" | Remove minimizing language | Inclusivity |
| 19 | String concatenation for dynamic messages | Use interpolation templates | Localization |
| 20 | Generic "Learn more" links | Name the topic ("Learn more about billing") | Clarity |

## Context-specific rules

Different UI zones have different copy needs. Apply these adjustments on top of the base rules.

### Onboarding and first-run

- **Warmer tone** — this is the user's first impression. Be welcoming, not clinical.
- **Shorter steps** — each screen should have one clear action. Don't explain everything at once.
- **Show value first** — lead with what the user gains, not what they need to configure.
- **Skip jargon entirely** — new users don't know your terminology yet.
- Example: "Welcome! Let's set up your workspace." not "Configure your organization settings."

### Settings and configuration

- **Denser copy is OK** — users in settings expect more detail.
- **Explain consequences** — "Turning this off will stop email notifications for all team members."
- **Use labels that describe the outcome**, not the setting name — "Send weekly summary" not "Weekly digest toggle."
- **Group related settings** with clear section headings, not just a long list.

### Error states and recovery

- **Most careful copy in the product** — users are frustrated, confused, or anxious.
- **Never dead-end** — every error must have a next step (retry, contact support, go back).
- **Acknowledge the disruption** — "We couldn't save your changes" is better than just "Error."
- **Preserve user work** — if data was lost, say so honestly. If it wasn't, reassure them.

### Destructive and irreversible actions

- **Name the thing being destroyed** — "Delete 'Q4 Report'" not "Delete item."
- **State the consequence explicitly** — "This will permanently remove all 47 files. This can't be undone."
- **Use red/danger styling AND copy together** — don't rely on color alone.
- **Make the safe option prominent** — the cancel/keep button should be the primary style.

### Transactional (payments, account changes)

- **Maximum clarity** — no ambiguity about what the user is agreeing to.
- **State amounts, dates, and terms explicitly** — "You'll be charged $29/month starting March 15."
- **Confirmation copy should read like a receipt preview** — "Upgrade to Pro — $29/month, billed annually."
- **Avoid playful tone** — money is serious. Be straightforward.

### Notifications and toasts

- **Ultra-brief** — 5-8 words max for toasts. Details go in the destination, not the notification.
- **Lead with the outcome** — "Project saved" not "Your project has been saved successfully."
- **Include an action if relevant** — "Comment from Alex. View thread" not just "New comment."
- **Don't over-notify** — if the skill detects excessive toast usage, flag it as a UX concern.

## Framework-specific scanning guide

Where to look for user-facing strings in each framework.

### Next.js / React (JSX/TSX)

- **JSX text nodes**: `<p>text</p>`, `<h1>text</h1>`, `<span>text</span>`
- **Button/link labels**: `<Button>text</Button>`, `<Link>text</Link>`
- **Props carrying copy**: `placeholder=""`, `title=""`, `alt=""`, `aria-label=""`
- **Next.js metadata**: `export const metadata = { title, description }` in `layout.tsx` / `page.tsx`
- **Toast/notification calls**: `toast("text")`, `toast.success("text")`, `toast.error("text")`
- **Form libraries**: Zod `.message()` strings, React Hook Form `errors.field.message`
- **Conditional text**: ternary expressions returning strings (`isError ? "Failed" : "Done"`)

### Vue (SFC)

- **Template text**: `<template>` text nodes, `{{ interpolation }}`
- **Attribute bindings**: `:placeholder`, `:title`, `:alt`, `:aria-label`
- **i18n calls**: `$t('key')`, `t('key')` in `<script setup>`
- **Component props**: `label=""`, `error-message=""`, `helper-text=""`

### Svelte

- **Template text**: text inside `{#if}`, `{#each}`, and raw HTML blocks
- **Attribute bindings**: `placeholder={}`, `title={}`, `alt={}`
- **Store-derived text**: `$store.errorMessage`, reactive declarations with strings

### React Native

- **`<Text>` components**: all text must be inside `<Text>` — easy to scan for
- **Alert.alert()**: title and message parameters
- **Accessibility**: `accessibilityLabel`, `accessibilityHint`
- **Navigation headers**: `headerTitle`, `tabBarLabel`

### HTML (static)

- **All visible text nodes**
- **`<title>`, `<meta name="description">`**
- **`alt`, `title`, `placeholder`, `aria-label`, `aria-describedby` attributes**
- **`<label>` text and `for` associations**

## Cross-skill integration

When findings fall outside this skill's scope, hand off to the appropriate companion skill:

| Finding type | Hand off to | Example |
|-------------|-------------|---------|
| Missing or incorrect `aria-label`, keyboard navigation, focus management | `/fixing-accessibility` | aria-label="btn" needs a full accessibility audit |
| Page `<title>`, meta description, OG tags | `/fixing-metadata` | Page title is "Untitled" — needs metadata review |
| Modal/dialog used where a simpler pattern would work | `/mo-modals-mo-problems` | Confirmation dialog for a non-destructive action |
| Animation on toast/notification is janky | `/fixing-motion-performance` | Toast entrance animation causes layout shift |
| Design token or spacing inconsistency in copy layout | `/baseline-ui` | Error text uses non-standard font size |

Flag the handoff in your output:

```
**[HANDOFF]** → /fixing-accessibility
Finding: aria-label="x" on close button at components/Modal.tsx:42
Reason: Needs full accessibility audit — "x" is not meaningful for screen readers
```

## Output format

For each finding, report:

```
**[SEVERITY]** file:line — Category
Current: "the current text"
Recommended: "the improved text"
Why: one sentence explaining the improvement
```

## Review summary

After all findings, provide:
- Total issues by severity (critical / high / medium / low)
- Top 3 most impactful changes to make first
- Overall tone assessment (1 sentence)
- Consistency score: how uniform the voice is across scanned files
- Handoffs: list of findings referred to companion skills

## References

These are the authoritative sources behind each audit category. Consult them for deeper rationale or edge cases.

### Foundational UX writing

- **Nielsen Norman Group — Error Message Guidelines**: https://www.nngroup.com/articles/error-message-guidelines/
- **Nielsen Norman Group — UX Writing Study Guide**: https://www.nngroup.com/articles/ux-writing-study-guide/
- **Nielsen Norman Group — Writing for Scannability**: https://www.nngroup.com/articles/how-users-read-on-the-web/
- **Nielsen Norman Group — Placeholders in Form Fields**: https://www.nngroup.com/articles/form-design-placeholders/
- **Nielsen Norman Group — Empty States**: https://www.nngroup.com/articles/empty-state-interface-design/
- **Nielsen Norman Group — Confirmation Dialogs**: https://www.nngroup.com/articles/confirmation-dialog/

### Design system writing guides

- **Google Material Design — Writing**: https://m3.material.io/foundations/content-design/overview
- **Apple Human Interface Guidelines — Writing**: https://developer.apple.com/design/human-interface-guidelines/writing
- **Microsoft Fluent UI — Voice and Tone**: https://fluent2.microsoft.design/content-design
- **Shopify Polaris — Content Guidelines**: https://polaris-react.shopify.com/content/actionable-language
- **Atlassian Design System — Designing Messages**: https://atlassian.design/foundations/content/designing-messages

### Accessibility and inclusivity

- **WCAG 2.2 — Text Alternatives (1.1)**: https://www.w3.org/WAI/WCAG22/Understanding/text-alternatives
- **WCAG 2.2 — Labels or Instructions (3.3.2)**: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions
- **WCAG 2.2 — Error Identification (3.3.1)**: https://www.w3.org/WAI/WCAG22/Understanding/error-identification
- **WCAG 2.2 — Error Suggestion (3.3.3)**: https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion
- **W3C — Using ARIA**: https://www.w3.org/TR/using-aria/
- **Inclusive Microsoft Design**: https://inclusive.microsoft.design/

### Localization

- **W3C — Internationalization Best Practices**: https://www.w3.org/International/quicktips/
- **Unicode CLDR — Pluralization Rules**: https://cldr.unicode.org/index/cldr-spec/plural-rules
- **MDN — Intl API**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

### Books

- **Strategic Writing for UX** by Torrey Podmajersky (O'Reilly, 2019) — frameworks for voice, tone, and purpose-driven UI text
- **Microcopy: The Complete Guide** by Kinneret Yifrah (2017) — comprehensive patterns for buttons, errors, empty states, onboarding, and notifications
- **Content Design** by Sarah Winters (2017) — user-centered content strategy and readability principles
