# UX Writing Audit

A [Claude Code](https://claude.ai/code) skill that scans user-facing text in your codebase and provides actionable recommendations to improve clarity, tone, consistency, and usability.

It triggers **proactively** when you write UI components, error messages, form fields, empty states, or any user-facing copy — and can also be invoked manually.

## Quick start

### Install

Copy the skill into your Claude Code skills directory:

```bash
# Clone the repo
git clone https://github.com/markj81/ux-writing.git

# Copy into your Claude Code skills directory
mkdir -p ~/.claude/skills/ux-microcopy-audit
cp ux-writing/SKILL.md ~/.claude/skills/ux-microcopy-audit/SKILL.md
```

Or copy `SKILL.md` directly into `~/.claude/skills/ux-microcopy-audit/`.

### Use

```
/ux-microcopy-audit              # Scan the current directory
/ux-microcopy-audit src/components  # Scan a specific directory
```

The skill also activates automatically when you're writing or editing UI copy in Claude Code.

## What it audits

The skill evaluates user-facing strings across **8 categories**, ordered by priority:

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

## Example findings

```
[CRITICAL] src/components/DeleteDialog.tsx:24 — Actionable language
Current: "Are you sure?"
Recommended: "Delete 'My Project'? This can't be undone."
Why: Names the consequence instead of asking a vague question

[HIGH] src/components/LoginForm.tsx:45 — Error messages
Current: "Invalid input"
Recommended: "Enter a valid email address"
Why: Tells the user what's wrong and how to fix it

[MEDIUM] src/components/Toast.tsx:12 — Redundancy
Current: "Project successfully saved"
Recommended: "Project saved"
Why: "Successfully" adds no information
```

## Features

### Brand voice profile

Define your product's tone so audits are tailored, not generic:

```
Voice profile:
  Formality:    casual | neutral | formal
  Personality:  friendly | professional | playful | authoritative | minimal
  Humor:        none | light | frequent
  User address: you | we | imperative | passive
  Brevity:      ultra-short | concise | explanatory
  Brand words:  words the product prefers
  Banned words: words to avoid
```

### Before/after examples

Every rule includes a table of concrete bad-to-good rewrites:

| Bad | Good | Why |
|-----|------|-----|
| "Submit" | "Save changes" | Tells the user what will happen |
| "OK" | "Save draft" | Names the action |
| "Error 422" | "This email is already registered. Try signing in instead." | Actionable, no error code |
| "Oops! An error has occurred" | "Something didn't work. Try again." | Mixed casual + formal |

### 20 common anti-patterns

A quick-reference checklist for the most frequently seen microcopy problems — from "Are you sure?" dialogs to placeholder-only form fields.

### Context-specific rules

Different rules for different UI zones:
- **Onboarding** — warmer tone, shorter steps, show value first
- **Settings** — denser copy, explain consequences
- **Errors** — most careful copy, never dead-end
- **Destructive actions** — name the thing, state the consequence
- **Payments** — maximum clarity, no ambiguity
- **Notifications** — ultra-brief, lead with the outcome

### Framework-specific scanning

Knows where to find user-facing strings in:
- **Next.js / React** — JSX text, metadata exports, toast calls, Zod messages
- **Vue** — template text, attribute bindings, i18n calls
- **Svelte** — template text, store-derived strings
- **React Native** — `<Text>` components, Alert.alert(), accessibility props
- **HTML** — text nodes, alt/title/placeholder/aria attributes

### Cross-skill integration

Hands off related findings to companion skills when appropriate:

| Finding | Hands off to |
|---------|-------------|
| Broken aria-labels, focus issues | `/fixing-accessibility` |
| Page titles, meta descriptions | `/fixing-metadata` |
| Unnecessary modals | `/mo-modals-mo-problems` |
| Janky toast animations | `/fixing-motion-performance` |
| Design token inconsistencies | `/baseline-ui` |

## Severity scoring

| Severity | When to use |
|----------|-------------|
| **Critical** | User can't complete a task or misunderstands a destructive action |
| **High** | User is confused, slowed down, or loses trust |
| **Medium** | Copy works but is wordy, generic, or inconsistent |
| **Low** | Localization issues, minor redundancy, stylistic preference |

## References

The audit rules are grounded in established UX writing research and industry standards:

- [Nielsen Norman Group](https://www.nngroup.com/articles/ux-writing-study-guide/) — error messages, scannability, empty states, confirmation dialogs
- [Google Material Design](https://m3.material.io/foundations/content-design/overview) — content design guidelines
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/writing) — writing guidelines
- [Shopify Polaris](https://polaris-react.shopify.com/content/actionable-language) — actionable language patterns
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/error-identification) — error identification, labels, text alternatives
- *Strategic Writing for UX* by Torrey Podmajersky
- *Microcopy: The Complete Guide* by Kinneret Yifrah
- *Content Design* by Sarah Winters

Full reference list with direct links in [SKILL.md](SKILL.md#references).

## License

MIT
