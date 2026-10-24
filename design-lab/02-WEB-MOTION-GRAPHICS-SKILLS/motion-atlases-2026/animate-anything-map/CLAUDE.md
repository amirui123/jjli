# CLAUDE.md — animate-anything

A ranked, living map of animation tooling with an executable skill. Three folds:
**Learn** (the README registry) · **Tooling** (`skills/animate-anything` + `scripts/`) ·
**Community** (Awesome-list conventions + freshness CI).

## The one rule: README.md is the single source of truth

`knowledge/graph.json`, `docs/index.html`, and `llms.txt` are **compiled** from the README
by `scripts/awesome_kg.py` — never edit them by hand. Contributors edit a README table row;
CI (`.github/workflows/knowledge.yml`) recompiles all three on merge to main.
The only hand-curated knowledge file is `knowledge/enrichments.json` (curator `builds_on`
lineage — it survives regeneration because `make build` merges it back in).
`knowledge/agentic.json` is also generated — by `make agentic` (or the weekly `agentic.yml`
CI), which probes each 🥇 repo's GitHub root for its *observed* agentic surface (AGENTS.md,
CLAUDE.md, skills, plugins, .mcp.json, llms.txt). No evidence ⇒ not claimed; a failed probe
is "not measured", never "surface-free". Annotations flow into graph nodes (`agentic` field)
and llms.txt lines.

## Commands

```bash
make check   # THE finish line: pytest (tests/) + style-gate both examples. stdlib+pytest only.
make build   # README → graph.json + docs/index.html + llms.txt (deterministic, zero LLM tokens)
make fresh   # probe every README link for rot (weekly in CI: freshness.yml)
make agentic # re-probe 🥇 repos' agentic surface → knowledge/agentic.json (GITHUB_TOKEN lifts rate limit)

# the /animate-anything skill loop (see skills/animate-anything/SKILL.md)
python3 scripts/animate.py scaffold "eigenvectors" --out scene.py
python3 scripts/animate.py lint scene.py --gate 80
manim -pql scene.py EigenvectorsScene
```

## Architecture

- `scripts/awesome_kg.py` — stdlib-only README→graph compiler. GFM tables → typed nodes
  (Tier/License/Pricing/Stars columns become node fields; 🥇🥈🥉 also yields numeric `rank`).
- `scripts/animate.py` — the 3b1b style engine: scaffold / lint (0–100, `--gate` exits
  non-zero) / contract. Golden reference: `examples/odd_squares.py` — **must stay 100/100**.
- `tests/` — linter goldens + anti-slop tells + graph integrity + llms.txt coverage.
  Fail-loud by design: nothing skips when a dep is missing (tests need no manim/LaTeX).

## CI (three workflows)

- `check.yml` — `make check` on every push/PR (no manim; fast).
- `render.yml` — proves examples actually render to MP4 (manim container, LaTeX included).
- `knowledge.yml` + `freshness.yml` — recompile artifacts on main; weekly link-rot probe.

## Gotchas

- `MathTex` needs a LaTeX distro; `Text` (Pango) doesn't. `odd_squares.py` renders without
  LaTeX on purpose — keep it that way.
- Target **ManimCommunity** (`from manim import *`), never `manimlib` (the linter rejects it).
- `media/` and `__pycache__` are render artifacts — gitignored, never commit them.
- Adding an example = it must clear `lint --gate 80` AND be added to `render.yml`'s render step.
- Licenses: content CC BY 4.0, `scripts/` MIT (see LICENSE + each tool's own row).
