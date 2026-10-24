# ux-laws

A Claude Skill that grounds interface critiques, design decisions, and audits in established UX principles, rather than unjustified personal taste.

## What it covers

- **Laws of UX**: Fitts, Hick, Jakob, Miller, Tesler, Doherty Threshold, Von Restorff, Zeigarnik, Postel, Aesthetic-Usability, Peak-End, Serial Position, Goal-Gradient, Occam's Razor, Parkinson's Law
- **Nielsen's 10 usability heuristics**
- **Gestalt principles**: proximity, similarity, closure, continuity, figure-ground, common region
- **Cognitive biases relevant to design**: anchoring, loss aversion, choice paradox, default effect, IKEA effect, confirmation bias, framing effect, social proof, scarcity, curse of knowledge

## When it triggers

Any interface, component, flow, or design decision being discussed, critiqued, or built, including when Claude Code writes or edits front-end/UI code. See the `description` field in [`SKILL.md`](./SKILL.md) for the exact trigger conditions.

## Structure

```
ux-laws/
├── SKILL.md                          : trigger conditions, method, quick-reference table
└── references/
    ├── laws-of-ux.md                 : Laws of UX, detailed
    ├── nielsen-heuristics.md         : Nielsen's 10 heuristics, detailed
    ├── gestalt-principles.md         : Gestalt principles, detailed
    └── cognitive-biases.md           : Cognitive biases, detailed
```

## Install

**Via [skills.sh](https://skills.sh)** (Claude Code, Cursor, OpenCode, and other CLI agents):

```bash
npx skills@latest add Papsi-Max/skills --skill ux-laws
```

**On claude.ai**: see the [repo README](../../README.md#how-to-use-a-skill) for upload steps.

## Credits

See the "Credits & sources" section at the end of [`SKILL.md`](./SKILL.md) for full attribution, this skill draws on and credits Jon Yablonski (Laws of UX), Jakob Nielsen / Nielsen Norman Group, the founders of Gestalt psychology, and the behavioral economics literature (Kahneman, Tversky, Thaler).
