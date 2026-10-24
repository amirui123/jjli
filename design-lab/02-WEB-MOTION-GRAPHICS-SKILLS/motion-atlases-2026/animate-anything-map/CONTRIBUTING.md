# Contributing to Animate Anything

Editing the **README** is all you ever do — the knowledge graph and interactive map recompile
themselves on merge.

## Add or re-rank a tool
1. Find the right category table in `README.md`.
2. Add one row: `[Name](repo-or-homepage)` · Stars · License · one-line *what-it-is + when-to-use* · Tier (🥇/🥈/🥉).
3. Open a PR. `make check` gates it (graph integrity + style-linter goldens); on merge, CI
   recompiles `knowledge/graph.json` + `docs/index.html` + `llms.txt` — all three are generated,
   only the README is hand-edited.

## Rules
- **One row per tool.** No duplicates across categories — pick its primary home.
- **Primary sources.** Link the GitHub repo or official homepage, not a blog about it.
- **Honest tiers.** 🥇 best-in-class · 🥈 solid · 🥉 niche/fading. Popularity is one input, not the verdict.
- **License is required** — it's how agents decide what they can build with.

## Lineage edges
"builds-on / inspired-by" relationships go in `knowledge/enrichments.json` (they survive
regeneration). Add an edge as `{"src": "repo:child", "dst": "repo:parent", "type": "builds_on"}`.

## Local preview
```bash
make build   # README → graph.json + docs/index.html + llms.txt
make check   # what CI runs on your PR (needs: pip install pytest)
make fresh   # verify no dead links
open docs/index.html
```
