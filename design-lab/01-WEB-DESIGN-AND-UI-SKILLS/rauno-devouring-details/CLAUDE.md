# CLAUDE.md ... instructions for AI assistants working in this repo

This file is read by Claude Code and similar AI coding assistants at the start of a session. It captures project-level rules that apply to any session working on devour-skills, regardless of who is driving it.

---

## Authorship and attribution

- **Never add `Co-Authored-By:` lines to commits.** Jared Volpe is the sole author of this repository. AI-generated changes are part of his work, not separate authorship. This applies to every commit regardless of how much of the diff was AI-generated.
- **Never add "Generated with Claude Code" badges, footers, or markers** to any file in this repository ... commits, code, documentation, READMEs, examples. None of it. The project's voice is first-person-Jared.
- **NOTICE.md is the attribution file.** Every cited designer, author, book, course, school, or source belongs in NOTICE.md with a "buy the courses, read the books" framing. Keep it updated when you add new lineage citations.

## Voice

- **No em dashes.** Use `...` ellipses instead. This applies to every file: skills, references, READMEs, examples, commit messages.
- **No hype.** Never "powerful", "elegant", "amazing", "successfully", "timeless", "best practice", "industry standard", "revolutionary", "game-changing". Calm, direct, citation-heavy.
- **No decorative emoji.** The only emoji allowed in any file are the severity markers 🔴🟡🟢 used in review output format blocks. Not in prose, not in headers, not in commit messages.
- **No performative humility.** "This may oversimplify, but..." or "I think..." is out. State the claim.
- **Cite sources by name.** First time: full name with date (e.g., "Rauno Freiberg, 2023"). Subsequent: surname. Real titles, real years.

## Commit message format

- **Imperative, capitalized first letter, no prefix.** Examples from the repo: `Add Layer 0 pre-HCI foundations to lineage`, `Fix Animations on the Web price, cmdk authorship, and dead MercuryOS and Vimeo links`, `Expand cleanup-after-navigation and add orphan-portal anti-pattern from real debugging`.
- **No `feat:`, `fix:`, `chore:` prefixes.** Plain imperative.
- **One commit per coherent change.** Do not batch multiple unrelated fixes into a single commit. The commit history is a build-in-public artifact; every commit should be meaningful on its own.
- **Never skip hooks** (no `--no-verify`, no bypassing pre-commit checks).

## The spine is stable

- **Do not add principles.** The spine is 12 principles. Additions to the spine require strong Layer 1 through Layer 3 backing and explicit discussion with Jared first.
- **Do add exemplars, anti-patterns, and examples.** These grow with real use.
- **Never lose the lineage.** Every principle, finding, and tactic must trace to a named source across the five-layer lineage (Layer 0 pre-HCI through Layer 4 modern web). If a finding cannot cite a source, it does not belong.

## Factual accuracy

- **Verify before committing citations.** Name spellings, book titles, dates, URLs, role titles. A URL that 404s embarrasses the project. Verify via chrome-devtools MCP if available.
- **Rauno Freiberg, never "Fäber" or other variants.** Load-bearing Layer 4 name. Load-bearing project ethics.
- **URLs should resolve.** If a cited URL is dead (404, cert expired, domain lapsed), replace it with a live canonical source or remove the link.

## Never squash the commit history

- **The iteration is the thesis.** The history of devour-skills is a record of real use driving real improvement. Squashing the history destroys the build-in-public story.
- When merging feature branches, prefer fast-forward or rebase. Not squash.

## Working with the skills

- **SKILL.md files are the operational interface.** `references/*.md` are the material SKILL.md files draw from. Edits to SKILL.md should be structural (process steps, output format); edits to reference files should be content (principles, exemplars, anti-patterns, lineage).
- **When adding instruction to a skill, test the instruction.** If you change a skill's process, the next test run should exercise the changed path. Otherwise you are shipping dead code.
