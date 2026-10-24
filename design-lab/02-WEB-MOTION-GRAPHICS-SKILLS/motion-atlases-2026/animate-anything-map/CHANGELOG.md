# Changelog

All notable changes to this list are documented here (newest first).

## [Unreleased]
### Added
- **Verification harness (OpenSpace-methodology transfer)** — `make check` is now the repo's
  finish line, run by CI on every push/PR (`check.yml`): a pytest suite (`tests/`) pinning the
  style linter's goldens (odd_squares stays 100/100), the anti-slop tells, scaffold
  self-validation, and knowledge-graph integrity (unique ids, no dangling edges, no orphan
  repos, curator lineage survives). Fail-loud: nothing skips; needs no manim/LaTeX.
- **Ranked columns reach the graph** — `Tier`/`License`/`Pricing` README columns now compile
  into node fields (`tier`, numeric `rank`, `license`, `pricing`); previously the ranking never
  left the README, so agents querying `graph.json` couldn't see it.
- **`llms.txt` is compiled, not hand-written** — generated from the same parse as the graph
  (`--llms` flag, wired into `make build` + knowledge CI), with tier + license/pricing per line.
  Kills silent drift between the README and the agent index.
- **Agentic-surface probe** — `scripts/agentic_probe.py` (+ `make agentic`, weekly `agentic.yml`
  CI) records which 🥇 repos *observably ship* agent tooling (AGENTS.md, CLAUDE.md, skills,
  Claude/Codex/Cursor plugins, `.mcp.json`, llms.txt) straight from their GitHub roots into
  `knowledge/agentic.json` → graph nodes → llms.txt. Evidence-or-absent: a failed probe is
  "not measured", never "surface-free".
- **`CLAUDE.md`** — dense agent-orientation file: the single-source-of-truth rule, exact
  commands, architecture, gotchas.
- **`/animate-anything` skill + engine** — turn a concept into a 3Blue1Brown-style ManimCommunity
  explainer, style-gated and rendered locally. Reverse-engineered Grant Sanderson's toolchain (target
  ManimCommunity, not ManimGL) and production style (palette incl. the `#333333` warm-grey canvas,
  role-based color, morph-to-show-equivalence, play→wait pacing) from `3b1b/videos` + `manimlib`.
  `scripts/animate.py {scaffold,lint,contract}` (stdlib, zero deps): scaffold a 5-beat scene, lint it
  0–100 against the style contract (gate slop in CI), print the contract. Golden `examples/odd_squares.py`
  renders without LaTeX and scores 100/100. Emit-the-composition, render-locally — no cloud video API.

### Added
- Initial release: ranked registry of animation tooling across 7 layers (CSS → AI-authored),
  the living knowledge-graph pipeline (README → `graph.json` → interactive map), `llms.txt`
  agent index, weekly link-freshness CI, and beginner→advanced roadmaps.
