# Claude Skills

A collection of custom [Claude Skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude), reusable instruction sets that give Claude domain-specific expertise. Each skill lives in its own folder and follows the open `SKILL.md` format.

## Skills in this repo

| Skill | What it does |
|---|---|
| [`ux-laws`](./skills/ux-laws) | Grounds interface critiques and design decisions in the Laws of UX, Nielsen's heuristics, Gestalt principles, and relevant cognitive biases. |
| [`uxmyths`](./skills/uxmyths) | Catches when a design decision rests on one of 34 common but debunked UX beliefs, and offers the evidence-based reality instead. |

## How to use a skill

### Via skills.sh (Claude Code, Cursor, OpenCode, and other CLI agents)

List everything available in this repo:

```bash
npx skills@latest add Papsi-Max/skills --list
```

Install one specific skill (recommended, installs just that one, not the whole repo):

```bash
npx skills@latest add Papsi-Max/skills --skill ux-laws
```

Install everything in this repo at once:

```bash
npx skills@latest add Papsi-Max/skills --all
```

### On claude.ai

1. Download the skill's `SKILL.md` and `references/` folder (or clone this repo) and zip that skill's folder, not the whole repo.
2. In claude.ai, go to **Settings → Capabilities → Skills**, and upload the zip.
3. Toggle it on. Claude will consult it automatically whenever the conversation matches what's described in the skill.

### In Claude Code (manual, without skills.sh)

1. Copy the skill's folder into your project's `.claude/skills/` directory (or your personal `~/.claude/skills/`).
2. That's it, Claude Code picks it up automatically.

## Why publish these

These skills are part of how I use AI in my day-to-day product design work. Sharing them here is meant to make that concrete: not just "I use AI," but *how*, and to what standard.

## Credits

Each skill's `SKILL.md` includes a "Credits & sources" section crediting the original frameworks, researchers, and authors it draws on. These skills are original syntheses written in my own words, see each skill's credits section for full attribution.

## License

The instructional content in this repo (the specific wording, structure, and organization of each `SKILL.md` and its reference files) is shared under the [MIT License](./LICENSE), feel free to reuse, adapt, and build on it. This doesn't extend to the underlying frameworks and research credited within each skill, which remain the work of their original authors.
