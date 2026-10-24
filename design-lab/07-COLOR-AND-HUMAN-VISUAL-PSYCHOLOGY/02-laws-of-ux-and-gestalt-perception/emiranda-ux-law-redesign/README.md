# ux-law-redesign

An agent skill that turns "this screen is clunky" into a measured audit, a design brief an AI design tool can build from, and, when the design comes back, an implementation that keeps every function.

It works on any existing screen, dashboard, board, form or page. The chain of evidence is:

```
domain rules → functional inventory → measured baseline → law-by-law audit
            → acceptance targets → design brief → handoff → same measurements on the build
```

## What you get

1. **Ground truth.** The agent reads the code, specs and recent changes to learn what the screen is for and which rules it must express.
2. **Inventory.** Every function, state and permission tier on the current screen, kept as a parity checklist so the redesign loses nothing.
3. **Baseline.** [`scripts/measure-ui.js`](scripts/measure-ui.js) measures the live UI: page height in screens, truncated text, smallest text, undersized tap targets, colours and borders in use, text below AA contrast, Unicode glyphs used as icons, and copy proxies (generic button and link labels, vague error text on screen, sentence length).
4. **Audit.** 20 laws of UX (Hick, Fitts, Tesler, Occam, Pareto, the four Gestalt grouping laws, Prägnanz, Von Restorff, Miller, serial position, Zeigarnik, peak-end, Jakob, Doherty, Postel, Parkinson, aesthetic-usability). Each gets evidence from your screen and a directive that names a real element. The reference also lists the caveats, such as Miller's law not being a menu limit and the Zeigarnik memory effect replicating poorly.
5. **Copy audit.** The words get their own pass, using [`references/ux-copy.md`](references/ux-copy.md): UX-writing principles with evidence ratings, rules by component (buttons, errors, labels, empty states, confirmations), and before → after rewrites of the worst strings. The measuring script reports copy proxies such as generic button labels and vague error text.
6. **Brief.** A structured document for Claude Design, v0, Figma Make or a human designer: real seed data, the measured problems, hard numeric targets, voice and copy rules, open questions the designer must answer in writing, and a deliverables list that includes a copy deck.
7. **Handoff.** When the prototype comes back, the skill builds it. The prototype decides every pixel, string and interaction. It never decides business rules.

## Install

The skill is a folder of markdown plus one JavaScript file. [`SKILL.md`](SKILL.md) is the entry point.

**Claude Code**

```bash
git clone https://github.com/emiranda927/ux-law-redesign.git ~/.claude/skills/ux-law-redesign
```

For a single project, clone into `<project>/.claude/skills/ux-law-redesign` instead. The skill triggers on requests like "this screen is clunky, redesign it", "audit this against the laws of UX", or "write a brief for Claude Design". You can also call it with `/ux-law-redesign`.

**Other agents**

Agents that load `SKILL.md` folders (the Agent Skills format) can use the same clone in their own skills directory. For any other agent, clone the repo anywhere and tell it:

> Read `ux-law-redesign/SKILL.md` and follow it for this screen.

Or paste the contents of `SKILL.md` into your agent's rules file (`AGENTS.md`, `.cursorrules` and similar) and keep the `references/` and `scripts/` folders next to it. `SKILL.md` points to them by relative path.

**Download without git**

Use *Code → Download ZIP* on the GitHub page and unzip it into your skills folder.

## Measuring a screen

Phases 3 and 7 use `scripts/measure-ui.js`. Paste the whole file into a browser JavaScript tool or the DevTools console on the page you are measuring. It defines `window.measureUI`, runs it once, and returns a JSON report. Resize the window and call `measureUI()` again for each width.

```js
measureUI({
  root: 'main section',                    // what to measure (default: <main>, else <body>)
  keep: '[data-chip] > span:nth-child(2)', // text that must never be cut off
  minText: 12,                             // smallest body text you accept, px
  target: 44,                              // comfortable target size, px
  minTarget: 24,                           // WCAG 2.2 AA minimum, px
})
```

It is read-only. It never clicks, types or changes the page. Without a browser tool, the skill falls back to estimating from code and screenshots and says the figures are estimates.

## Contents

| Path | Purpose |
|---|---|
| [`SKILL.md`](SKILL.md) | The workflow, seven phases, plus gotchas from a real redesign |
| [`references/ux-laws.md`](references/ux-laws.md) | The 20 laws: definition, what to look for, directives, caveats, platform target sizes |
| [`references/ux-copy.md`](references/ux-copy.md) | UX-writing principles, rules by component, the copy audit, and what the research does and doesn't show |
| [`references/design-brief-template.md`](references/design-brief-template.md) | The brief's 15-section structure |
| [`references/implementing-a-handoff.md`](references/implementing-a-handoff.md) | Turning a design handoff into code without losing function |
| [`scripts/measure-ui.js`](scripts/measure-ui.js) | Baseline and acceptance measurements |

## Contributing

Issues and pull requests are welcome, especially corrections to a law's definition or sources, better caveats, and measurements the script is missing.

## License

[MIT](LICENSE)
