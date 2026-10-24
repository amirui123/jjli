---
name: web-ui-design
description: "Designs and builds web UI that looks deliberate, not generated, in React, Vue, Svelte or plain HTML: landing pages, web apps and app screens (including small apps built from scratch, such as a todo or CRUD app with a settings screen), dashboards, docs, forms and components; adding a page or feature with UI to an existing app; improving a UI's look or UX; and reviewing a UI. Use whenever the task produces a web page or screen a person will see, even when the brief is mostly about functionality: build, make or add an app, page, screen, landing page, dashboard, form or component; restyle, redesign or \"make it look better\"; review a UI. Use it alongside web-platform API guidance skills, which cover APIs and browser support, not visual design."
---

# Web UI design

The look comes from the process, not from a rule list. Name the case first, then run that case's steps. New, Extend and Improve share the contract, the question round, the render loop and the record below. Review and Small edit skip the question round and the `DESIGN.md` record. Choices come from [reference/patterns.md](reference/patterns.md), and [reference/rules.md](reference/rules.md) applies to everything you build or judge.

## 1. Name the case

| Case | Signals | Steps |
| --- | --- | --- |
| **New** | No UI exists yet for this surface: "build a site", "make a landing page" | [reference/new.md](reference/new.md) |
| **Extend** | The project already has UI and the request adds to it: a page, a feature, a component | [reference/extend.md](reference/extend.md) |
| **Improve** | The request is to redesign, modernize or fix how existing UI looks or works | [reference/improve.md](reference/improve.md) |
| **Review** | Only a critique is asked for | Review, below |
| **Small edit** | One component, style or bug, with the outcome already stated | Small edit, below |

Read the signals from the request and the repo together. A new page inside a project with a design system is Extend: its tokens and components still bind you. Ask one question only when the request and the repo point to different cases.

Done when you can state the case in one line with its evidence, such as "Extend: React app with tokens in `src/styles`, request adds a page".

## 2. Load the contract

Read `DESIGN.md` at the repo root (or `.interface-design/system.md`) if it exists. Read the stack from the repo: the framework, the styling system (CSS variables, Tailwind config, CSS modules), the component library and the build and dev scripts. The brief outranks `DESIGN.md`, `DESIGN.md` outranks the code's habits, and the code's habits outrank this skill's defaults.

Done when you can name the project's colors, type, spacing, radius, depth strategy and stack, or you know there is no contract yet.

## 3. Run the case's steps

Open the case's file and run its steps in order. They call the shared sections below.

## Question round

Ask about every gap that would change a choice from the catalog. A guessed gap is how a page comes out generic.

1. Infer from the request, the repo and `DESIGN.md` first. Never ask what they already answer.
2. The gaps, in this order: the primary action of the screen; who uses it and on what device; brand assets and references that already exist; the feel, offered as the 2 or 3 style families from the catalog that fit, one line each; real content and proof; for Improve, what must stay and the scope.
3. Ask once, at most 4 questions. Each is multiple choice with your recommended option first and the reason for it. Use your question tool when you have one. Otherwise make the questions your whole reply and end the turn. The build waits for the answer.
4. When the user answers "your call" or declines, or the request says not to ask, take your recommended options and record them as assumptions. Any other instruction in the request, such as "use sample data" or "make it modern", answers only the gap it names. Ask about the rest.
5. Facts the page needs that the user did not give (names, hours, prices, dates, items) become realistic sample values that fill the layout as real content would. List each one in the Brief and in your reply for the user to replace. Every line on the page reads as finished copy. Proof (reviews, ratings, customer logos, stats) still comes only from the user, so drop a proof section rather than fill it.

Skip the round only when the request, the repo or `DESIGN.md` already answer every gap. Done when every line of the Brief in `DESIGN.md` has a value and a source: the user, inferred (name from where), or assumed after you asked and the user left it to you. A line marked assumed before you asked means the round has not run yet.

## Render loop

Run the checker from this skill's directory (`${CLAUDE_SKILL_DIR}` in Claude Code) on the page. For an app with a build step, start its dev server or build it and pass the URL or the built file.

```bash
node <this skill's directory>/scripts/check.mjs <page file or URL>   # add --dark if the page has dark mode, --budget landing for a landing page
```

It renders the full page at 390, 768 and 1440 px. It reports overflow, clipped content, contrast, unloaded fonts, script errors, tap targets, controls out of reach on phones, keyboard focus, wide tables, placeholder text and a performance budget, and it saves screenshot tiles. Open every tile it lists, the 390 px tiles first. Then walk the primary flow once with your browser tool: the main action, one error and one empty state. Critique the tiles and the flow against every section of the rules, fix the failures and findings as one batch, and run the checker again. Stop after 3 rounds, and list any failure still open in your reply.

When the checker cannot start (no Node 22 or no Chrome), use your browser tool instead: full-page screenshots at the same widths, plus measured overflow, contrast and tap targets.

Done when the run after your last edit reports 0 failures, you opened every tile from that run, every WARN is fixed or listed with its reason, and every rule passes or is a listed exception. A clean pass is the floor, not proof of quality, so end with one sentence on what makes this screen belong to its subject.

## Record decisions

Update `DESIGN.md`, laid out as in [reference/design-md-template.md](reference/design-md-template.md), with the tokens as built and each non-obvious decision with its rationale. The next session reads it in step 2.

## Review

Run the render loop without building or fixing. Report findings as one table with the columns `Location | Before | After | Why`, most severe first.

## Small edit

Load the contract, make the change with existing tokens and components, and run the render loop on the affected page. Leave everything outside the request as it was, and list any problem you noticed there in one line.
