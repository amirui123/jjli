# Devour runs

This directory holds curated devour runs... the public collection that newcomers read to see what a good devour output looks like.

> Devour's project context lives in `DEVOUR.md` at the target repo root. See the main [README](../README.md#project-context-devourmd) for details.

A **run** is the complete honest record of one devour invocation: context, findings, interactions, apply decisions, and outcomes. The format is the same whether the run lives in a user's `.devour/runs/` directory or here in the public collection. The only difference is that the runs here are hand-picked.

## Format

One markdown file per run: `NNNN-<codebase>-<short-title>.md`. Sequential numbering starting at `0001`. Slug is descriptive but under 50 characters.

Before/after code snapshots (when captured) live in a sibling `NNNN-<codebase>-<short-title>.assets/` directory.

## Frontmatter

Every run file starts with YAML frontmatter:

```yaml
---
status: complete
started: <ISO-8601 UTC timestamp>
completed: <ISO-8601 UTC timestamp>
skill: devour | devour-motion | devour-micro | devour-state
target: <human-readable target description>
repo: <absolute path to the target repo, local-only... public runs may redact>
context-file: <path to DEVOUR.md if read, else null>
browser-mcp: <MCP name if used, else null>
terse: <true|false>
---
```

## Sections

1. **Context** ... one paragraph. Project, surface, what devour was asked to review, relevant signals from `DEVOUR.md`.
2. **Findings** ... each finding with severity, file:line, principle, source, tactic, reference. Verbose or terse format preserved as-is from the run.
3. **Interactions between findings** ... optional. Surface trade-offs when findings conflict.
4. **Apply decisions** ... table: Finding / Decision (applied/skipped/deferred) / Notes.
5. **Outcomes** ... what shipped. Commit SHAs when applicable. Whether fixes held up in browser verification.
6. **Judgment calls and surprises** ... optional. Honest reflection on what the reviewer weighted, what they skipped and why, what the browser verification revealed.
7. **Asset references** ... optional. Pointer to `.assets/` sibling if present.

## Contributing a run

Runs in the public collection come from users who had a run they wanted to share. The process:

1. Pick a run from your local `.devour/runs/` that would teach someone new to devour something.
2. Copy it here as `NNNN-<slug>.md` (next sequential number, good slug).
3. If your run has before/after snapshots, copy the `.assets/` sibling too.
4. Review the file for anything project-private (internal path names, repo names you don't want public). Redact or rename.
5. Commit with a clean imperative message: `Add run NNNN from <codebase>: <short title>`.

We favor runs that show the spine clearly, have a mix of severities, name real judgment calls, and prefer honest reflection over tidy narrative.

## Current runs

- [0001 ... Fifth Set motion review](0001-fifthset-motion-review.md)
- [0002 ... Fifth Set search + cmdk migration](0002-fifthset-search-cmdk-migration.md)
- [0003 ... jaredvolpe.com full-spine browser-verified review](0003-jaredvolpe-full-spine-browser-verified.md)
