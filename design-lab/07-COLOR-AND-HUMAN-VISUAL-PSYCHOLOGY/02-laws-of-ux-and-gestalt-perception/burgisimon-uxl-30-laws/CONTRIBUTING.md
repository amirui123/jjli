# Contributing to UXL

Thanks for helping make AI-built interfaces better.

## Ground rules

- **Original wording only.** lawsofux.com content is CC BY-NC-ND. Never copy or closely paraphrase it. Explain laws from the underlying research in your own words and keep the `source:` link for attribution.
- **Concrete over abstract.** Every rule should be something an agent can apply or check: numbers, code, detection hints.
- **Keep SKILL.md lean** (< 500 lines). Depth belongs in `references/`.
- **Every finding cites a law.** New lint or audit rules must map to at least one § id.

## Layout

```
skills/ux-lawyer/          the Agent Skill (portable: Claude Code, Codex, Cursor, Gemini, Copilot, …)
  SKILL.md                 entry point: modes, statutes, reference map
  references/laws/*.md     one file per law (strict template, see below)
  references/*.md          playbook, platforms, tokens, audit workflow, tensions
  assets/                  tokens (CSS + Tailwind v4), checklist, report template
  scripts/uxl_lint.py      static linter (stdlib Python)
  scripts/uxl_audit.mjs    runtime auditor (Playwright)
.claude-plugin/            Claude Code plugin + marketplace manifests
commands/, agents/         Claude Code slash commands and subagent
adapters/                  generated rule files for non-skill agents (don't edit by hand)
evals/                     eval prompts, assertions, fixtures, grader
tests/                     linter unit tests + fixtures
tools/                     validate_skill.py, build_adapters.py
```

## Law file template

Frontmatter keys, in this order: `id, name, source, origin, category, summary (≤ 140 chars), applies_to (6–10), rules (3–5, each ≤ 140 chars)`.
Sections, in this order: `# Name (Lxx)`, `## In plain words`, `## Why it matters in a UI`, `## Build it right` (`### Everywhere`, `### Mobile`, `### Desktop`), `## Code patterns`, `## Audit: violations to look for` (table: Violation | How to detect | Severity | Remedy), `## Tensions & trade-offs`, `## Quick test`.
Reference automated checks as `lint: <rule-id>` / `audit: <rule-id>`; `tools/validate_skill.py` verifies they exist.

## Before opening a PR

```bash
python3 tools/validate_skill.py           # structure, links, check ids, manifests
python3 tools/build_adapters.py           # regenerate adapters/ after changing laws or statutes
python3 -m unittest discover -s tests     # linter tests
node skills/ux-lawyer/scripts/uxl_audit.mjs tests/fixtures/good/index.html --fail-on minor   # needs Playwright
claude plugin validate .                  # if you have Claude Code
```

Adding a lint rule: add a `Rule(...)` in `uxl_lint.py`, implement it, add a positive case to a bad fixture and make sure the good fixtures stay clean, add a test, and reference it from the relevant law files' audit tables.

## Evals

`evals/evals.json` holds realistic prompts with assertions; `evals/grade.py` grades runs using the UXL scanners. The workflow follows Anthropic's skill-creator: run each prompt with and without the skill, grade, aggregate, review, iterate.
