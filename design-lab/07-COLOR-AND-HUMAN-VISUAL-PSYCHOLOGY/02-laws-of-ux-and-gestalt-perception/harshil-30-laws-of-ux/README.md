# UI-UX-laws

A working reference on the Laws of UX for use across projects, written for coding agents (Claude Code, Codex) and the people directing them.

It is opt-in. Nothing here applies to a project unless someone asks for it.

## Contents

| Path | What it is |
|---|---|
| `SKILL.md` | The skill entry point: ground rules and five modes (`build`, `audit`, `rubric`, `explain`, `ethics`). |
| `agents/openai.yaml` | Tells Codex to run the skill only when it is named. |
| `reference/laws.md` | All 30 laws listed on lawsofux.com as of 2026-10-13. For each: the rule in a sentence, what it means when building a web UI, violation signs, whether it can be checked from code, the running app or only with users, and sources. Also: evidence strength, conflicts between laws, overlap with Octalysis core drives. |
| `book/chapter-notes.md` | Chapter-by-chapter notes on Jon Yablonski's *Laws of UX*, first edition (2020), with page references. |
| `method/principle-law-rule.md` | The book's method for turning laws into a project standard: principle → law → rule. Includes a rubric layout. |
| `method/ethics-checklist.md` | The book's seven behaviour-shaping mechanisms as a checklist, with notes for gamified features. |

## How it is meant to be used

1. A project owner writes a **rubric**: a short list of principles in "X over Y" form, each tied to a law and to checkable rules. See `method/principle-law-rule.md`.
2. When building UI, an agent reads the rubric and the reference, and notes which laws it considered.
3. When auditing, an agent checks named screens against the rubric and reports findings by rule ID. Opinions with no rule behind them are kept separate.

The reference informs. The rubric decides.

## Sources and limits

- Written in the author's own words. No text is copied from the Laws of UX website (CC BY-NC-ND) or from the book. The book itself is not in this repo.
- The book notes cover the first edition, which treats 10 laws in depth. The other 20 laws rest on the website and on Nielsen Norman Group, WCAG and primary papers cited inline.
- The book was read from extracted text. Its figures were not viewed.
- Numbers are marked **(sourced)** or **(heuristic)**. Only the first kind is research.
- Two laws are flagged as contested (Choice Overload, and the Zeigarnik Effect as a memory claim). See the entries for the evidence.

## Installing as a personal skill

Claude Code reads personal skills from `~/.claude/skills/<name>/SKILL.md`. Link this repo there:

```bash
ln -s ~/Downloads/UI-UX-laws ~/.claude/skills/laws-of-ux
```

`SKILL.md` sets `disable-model-invocation: true`, so the skill is not loaded into context and runs only when invoked by name:

```
/laws-of-ux audit app/hub/[slug]
/laws-of-ux rubric
/laws-of-ux explain goal-gradient
```

Moving the repo breaks the link. Re-run the command with the new path.

### Codex

Codex reads personal skills from `~/.agents/skills/<name>/SKILL.md` and repo skills from `.agents/skills/`. It does not read `.claude/skills/`.

```bash
ln -s ~/Downloads/UI-UX-laws ~/.agents/skills/laws-of-ux
```

`agents/openai.yaml` sets `allow_implicit_invocation: false`, so Codex runs the skill only when it is named: `$laws-of-ux audit <screens>`.

## Open items

- Second edition of the book not yet read.
- Nielsen Norman Group articles on the Zeigarnik effect and the serial position effect were not found at a working URL.
