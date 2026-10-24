<div align="center">

<h1>UX writing</h1>

**Turn a UI component or flow into interface copy that reads human, or strip AI-generated tells out of copy you already have - a Claude Code skill built for design teams and the engineers who ship their work.**

[![CI](https://img.shields.io/github/actions/workflow/status/humbleteam/ux-writing/validate.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/humbleteam/ux-writing/actions/workflows/validate.yml)
[![GitHub stars](https://img.shields.io/github/stars/humbleteam/ux-writing?style=for-the-badge&logo=github&color=181717)](https://github.com/humbleteam/ux-writing/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/humbleteam/ux-writing?style=for-the-badge&color=339933)](https://github.com/humbleteam/ux-writing/commits/main)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-skill-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://github.com/humbleteam/ux-writing/blob/main/SKILL.md)

</div>

ux-writing takes a UI component or flow - a button, an error message, an empty state, a confirmation dialog - and returns copy ready to ship: a verb-led label, a plain-language error, a consequence-named confirmation. Given copy that already exists, it switches to strip mode and rewrites it line by line, naming the pattern each fix removed and the element rule the line failed. A pre-ship self-check keeps either mode from drifting into generic filler: ten yes/no questions run against every draft, nine reading one line each and ending with the pattern table itself, the tenth reading the element set a flow was broken into, and one "yes" sends the line back for a rewrite.

## Table of contents

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Example output](#example-output)
- [How it works](#how-it-works)
- [How is this different from just asking the model?](#how-is-this-different-from-just-asking-the-model)
- [FAQ](#faq)
- [Related skills](#related-skills)
- [Who maintains this](#who-maintains-this)

## What it does

- Writes microcopy for buttons, errors, empty states, confirmations, placeholders, tooltips, and toasts - one line per element, shippable as it stands or carrying a marked slot for a product fact the request never gave.
- Rewrites existing copy that reads AI-generated, in strip mode, line by line, with Before/After pairs, naming the pattern each fix removed and the element rule the line failed.
- Runs every draft through a ten-question pre-ship self-check: nine read a line, ending with the full 14-row pattern table, and the tenth reads a flow's element set; a failed check forces a rewrite, not a footnote.
- Names the outcome in every button label instead of a bare verb like "Submit" or "OK".
- Writes error copy as what happened plus how to fix it, with no blame and no bare apology.
- Defers to a provided brand voice guide wherever its rules conflict with the defaults here.

## Quick start

**Personal - available in every project:**

```bash
git clone https://github.com/humbleteam/ux-writing ~/.claude/skills/ux-writing
```

**Project-scoped - checked into one repo:**

```bash
git clone https://github.com/humbleteam/ux-writing .claude/skills/ux-writing
```

**Any other agent:** the skill is plain markdown in the Agent Skills format. Paste `SKILL.md` into the system prompt of Cursor, Codex, or any other LLM agent - no Claude-specific runtime required.

To verify: restart Claude Code, then ask it to list its skills. Skills load automatically from `~/.claude/skills/` (personal) and `.claude/skills/` (project); `ux-writing` should appear.

## Usage

- **"Write the button, confirmation, and error copy for this delete-project flow."** - write mode: breaks the flow into its elements and writes each to its type's rule.
- **"This error message sounds like an AI wrote it: 'Oops! Something went wrong. Please try again later.'"** - strip mode: rewrites the line and names the patterns removed.
- **"Draft the empty-state copy for a project list with zero projects."** - write mode against a single element: what's missing, plus the one action that fills it.

## Example output

Example write-mode output for a fictional delete-project flow. The request named
the flow and nothing else - no data model, no failure modes:

```
## Delete project flow

**Button (destructive):** Delete project

**Confirmation dialog:** Delete "<project name>"? This removes the project and
all <n> <items> inside it. <Whether a delete can be undone>.

**Buttons:** Cancel / Delete project

**Error (delete failed):** The project didn't delete because <cause>. <Fix for
that cause>.

**Toast (success):** Project deleted.

**Needs:** Confirmation - what does a project hold, how many of them go with it,
and does a delete come back, which also decides whether this dialog belongs;
Error - what actually blocks a delete in this product.
```

The button and the toast are finished copy: their rules need nothing the request
did not carry. The confirmation and the error are drafts, because a named
consequence, a stated cause and whether the action reverses are facts about the
product, and the slots mark the three the request never gave. The last of them
carries further than its own sentence: a delete that comes back wants a toast
with an undo and no dialog at all, so the answer that fills that slot is also
the one self-check question 10 reads the block against, which is why the `Needs:`
line says so. Answering them - a project holds tasks, this one holds 14, a
delete is permanent, and it is blocked while members are still assigned, 2 on
this project - fills the slots, keeps the dialog, drops the `Needs:` line, and
re-emits the block:

```
**Confirmation dialog:** Delete "Q3 Roadmap"? This removes the project and
all 14 tasks inside it. This can't be undone.

**Error (delete failed):** The project didn't delete because it still has
2 members assigned. Remove the members first, then try again.
```

Example strip-mode output, for the error message in [Usage](#usage) above. The
user supplied the cause along with the string: this is the error shown when an
upload exceeds the 25 MB limit.

```
### Error message

- Before: "Oops! Something went wrong. Please try again later."
- After: "The file didn't upload because it's over the 25 MB limit. Try a
  smaller file."
- Removed: apology with no fact
```

Without that stated limit the rewrite has no cause to name, and naming the cause
is the fix for this row. The line comes back with a slot where the cause belongs
and the question under it, the same shape write mode uses:

```
### Error message

- Before: "Oops! Something went wrong. Please try again later."
- After: "The file didn't upload because <cause>. <Fix for that cause>."
- Removed: apology with no fact
- Needs: what actually blocks an upload in this product
```

The rule is the same one that governs numbers: what the input does not say, the
output does not say. Twelve of the 14 patterns are fixed by cutting something,
so no slot can arise on them - only the two fixed by adding a fact, an apology
with no fact and an unnamed consequence, can produce one.

The pattern table is one of two checks, though, and a slot can also come from
the other. Strip mode reads the copy against its element's own rule as well, and
a line can carry no tell at all and still fail the job its type has. A bare empty
state is the clearest case: it has no adjective, no dash, no Title Case and no
closer, so every one of the 14 patterns comes back clean, while the empty-state
rule names that exact wording as the failure.

```
### Empty state

- Before: "Nothing here yet."
- After: "No <items> yet. <Action that creates the first one>."
- Rule: an empty state names what belongs in the space and the one action that
  fills it
- Needs: what belongs in this list, and what action puts the first one there
```

There is no `Removed:` line on that block, because nothing came out - the fix
puts something in, and the `Rule:` line is what reports it. A block that ships a
rewrite carries at least one of the two lines, and a block that carries neither
is the skip branch: the copy reads fine on both checks.

That second check reads one rule, chosen by the element type, and the type is
not always in the request. A string handed over on its own gets a type inferred
from its shape, and for some strings the shape does not decide it:

```
### Element type unclear

- Before: "Save changes"
- Type: button, or the tooltip on a Save changes button? As a button this passes
  - verb first, outcome named, sentence case. As the tooltip on that button it
  restates its own label, which the tooltip rule forbids.
```

There is no `After:` and no `Rule:` line, because no rule failure has been
established: the table came back clean, and the other check is waiting on which
element this is. Shipping the button verdict would call the copy fine when it
may be the tooltip case this skill already names as a failure, and shipping the
tooltip verdict would rewrite a button label that was correct.

## How it works

- **Mode detection first.** A component or flow with no existing copy triggers write mode; a string of copy, or a request to fix copy that "sounds AI", triggers strip mode.
- **The pattern table loads before either mode runs.** `references/banned-patterns.md` holds 14 AI-tell patterns, each with a bad and fixed example, checked before a draft is done.
- **The table is read against the copy going out, not only the copy coming in.** Strip mode's first check reads it against the original; the pre-ship gate reads it against whatever this skill wrote - a written draft, or the rewrite that replaces a stripped line. The gate's first eight questions reach nine of the 14 rows, and the ninth reads the other five, so a draft cannot ship carrying a row this skill's own table names.
- **A rewrite names what it fixed, on one of two lines.** Strip mode runs two checks: the pattern table, reported on `Removed:`, and the element's own rule, reported on `Rule:`. A block that ships a rewrite carries at least one of them. Both checks clean means the copy reads fine and the rewrite is skipped, not invented - a clean table pass alone does not, which is how a bare "Nothing here yet" used to come back as good copy.
- **An inferred element type is tested in both modes.** Where the request states the type, its rule just runs. Where the type was inferred, the second plausible type's rule is read too, and what that protects differs by mode. In strip mode it protects a verdict: a bare "Save changes" passes the button rule and fails the tooltip rule, so the block asks which element it is instead of shipping either verdict as a finding about the copy. In write mode it protects the line itself, because the type picks the rule the copy is built to - the line explaining why Publish is disabled states the condition as a tooltip and reports a failure that has not happened as an error - so the label ships marked `[inferred]` with the question under the block rather than the copy held back.
- **Buttons name the outcome.** Verb first, then the object, sentence case - never a bare "Submit" or "OK" when a concrete outcome exists to name.
- **Errors state cause, then fix.** What happened, then how to fix it - no blame language, no meaningless apology.
- **Empty states name what's missing and the one action that fills it.** Never a bare "Nothing here yet" with no next step.
- **Destructive confirmations name the consequence.** What gets removed, how much, whether it's reversible - never a generic "Are you sure?"
- **Placeholder text is never a label's substitute.** If removing it would leave a field unlabeled, that's a bug to flag, not a copy choice.
- **A fact the request never gave becomes a slot, not a guess.** Both modes mark the missing count or cause where it belongs and ask for it on a `Needs:` line: write mode when an element's rule needs a fact the request skipped, strip mode when the pattern that applied is one of the two fixed by adding a fact rather than cutting one, or when the element rule the line failed is. Elements whose rules need no product fact still ship as finished copy in the same block.
- **The ten-question self-check runs before every output ships.** One "yes" sends the line back for a rewrite. Nine of the questions read a line; the tenth reads the elements a flow was broken into, which is the one path whose output nothing else checks - a stated type runs its rule and an inferred one is tested, while an element the decomposition invented is treated as stated. A confirmation dialog on a reversible delete passes every other question in the file.
- **Legal or compliance-reviewed copy gets flagged, not silently rewritten.** A meaning-changing edit needs a human sign-off first.

## How is this different from just asking the model?

A bare "write me a button label" prompt tends to return exactly the copy this skill exists to catch: "Submit", or an error that opens with "Oops! Something went wrong" and gives no next step. It also drifts toward promotional filler - "seamlessly", "effortlessly" - words that sound confident but tell the user nothing to do. This skill pins the shape down per element type (button = verb plus outcome, error = cause plus fix, confirmation = named consequence) and runs a fixed ten-question check before the draft ships, so the output holds shape run to run. It does not know your product's actual voice - a provided brand voice guide wins where its rules conflict with the defaults here.

## FAQ

**How do I make AI writing sound human?**
Cut patterns that read as generated before the copy ships: promotional adjectives (seamless, effortless), negative parallelism ("it's not just X - it's Y"), filler openers ("in order to"), and copula avoidance ("serves as" instead of "is"). This skill checks every draft against ten questions, the ninth of which is the full table; `references/banned-patterns.md` has it.

**What are AI writing tells?**
Patterns that show up disproportionately in generated text: framing openers ("Here's your..."), promotional adjectives, negative parallelism, vague attributions, forced rule-of-three lists, em dashes (one is enough to read as generated, which is why the check here fires at one, not at two), generic upbeat closers. In interface copy they also show up as Title Case buttons, "Oops!" errors with no fact, and "Are you sure?" dialogs that never say what happens if you are. `references/banned-patterns.md` lists all 14 with a before/after example each.

**How do I write good error messages?**
State what happened, then how to fix it. "The project didn't delete because it still has 2 members assigned. Remove the members first, then try again" beats "Oops! Something went wrong" - it gives a fact and an action, not an apology. Never blame the user.

**Should button labels be Title Case?**
No - sentence case. "Save changes", not "Save Changes". Title Case reads as a menu item or a headline, not an action. Sentence case is Material Design's default; Apple's Human Interface Guidelines leave the choice between title-style and sentence-style to each app, favoring title-style for navigation titles.

**What is UX writing?**
The words in a product's interface - buttons, errors, empty states, tooltips, confirmations - chosen deliberately, not left as engineering placeholders. This skill works at the sentence level: what makes one label or error clear, and what makes copy read as generated instead of written for its screen.

**Can Claude write microcopy for my app?**
Yes, with real product context. Describe the component or flow - what it does, what happens if it fails, what a destructive action removes - and this skill returns a label, error, or confirmation. Less context produces a more generic draft, same as for a person.

## Related skills

Part of a 10-skill open-source kit for design teams by Humbleteam.

- [design-review](https://github.com/humbleteam/design-review) - structured UX critique with a 0-4 score, Before/After/Why fixes, and a citation for every claim.
- [ascii-wireframes](https://github.com/humbleteam/ascii-wireframes) - three distinct layout hypotheses as ASCII wireframes before any hi-fi work.
- [html-mockup](https://github.com/humbleteam/html-mockup) - census-first HTML mockups that match a reference screenshot: exact palette, item counts, component states.
- [extract-design-tokens](https://github.com/humbleteam/extract-design-tokens) - pull palette, type, spacing, radii, and shadows from a URL or screenshot into CSS variables and JSON.
- [audit-design-tokens](https://github.com/humbleteam/audit-design-tokens) - find token drift in a codebase: raw hex values, off-scale spacing, near-duplicate colors.
- [design-qa](https://github.com/humbleteam/design-qa) - a pre-ship design QA gate: states, contrast, touch targets, breakpoints, keyboard paths.
- [design-handoff](https://github.com/humbleteam/design-handoff) - turn a finished mockup into a dev-ready spec: tokens, states, accessibility annotations, open questions.
- [accessibility-audit](https://github.com/humbleteam/accessibility-audit) - WCAG 2.2-grounded accessibility review with success-criterion citations and severity levels.
- [design-brief](https://github.com/humbleteam/design-brief) - extract a 5-bullet design brief from messy project inputs, with a gap report for what is missing.

## Who maintains this

[Humbleteam](https://humbleteam.com/) is a digital product design and AI-engineering studio: founded in 2017, working from Prague and Dubai, with 80+ digital awards to the name, including 14 Awwwards wins, a Webby, and a Red Dot. We design digital products for startups and enterprises in fintech, healthtech, sports, and AI, and we build AI infrastructure for design teams - agents, workflows, and skills like this one.

This skill is distilled from the internal playbooks we run on client work: the same checklists behind the case studies at [humbleteam.com/work](https://humbleteam.com/work), for clients like Tinder and Acronis.

- The full 10-skill kit: [Related skills](#related-skills) above, or all repos at [github.com/humbleteam](https://github.com/humbleteam)
- What we do with AI for design teams: [humbleteam.com/ai](https://humbleteam.com/ai)
- Design and AI writing: [humbleteam.com/blog](https://humbleteam.com/blog)
- LinkedIn: [linkedin.com/company/humbleteam](https://www.linkedin.com/company/humbleteam/)
- Talk to us: [hi@humbleteam.com](mailto:hi@humbleteam.com)

Issues and PRs welcome.

MIT - see [LICENSE](LICENSE).
