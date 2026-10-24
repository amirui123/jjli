# Evals

Data files, a few inert fixtures and grader-only reference audits. Nothing here runs automatically.

- `fixtures/site-sections.html` and `fixtures/overflow-unclipped.html` pin the page probe: the first has no page overflow, and the second scrolls sideways.
- `evals.json` follows the Anthropic skill-creator schema: `skill_name` and `evals[]`, each with `id`, `prompt`, `expected_output`, `files` and `expectations[]`.
- `trigger-eval.json` is a list of `{query, should_trigger}`: ten positives and ten **near-miss negatives** (WCAG audit, style change, performance profiling, copywriting, research summary).
- `fixtures/` holds **inert** HTML (static markup, no script). `evals/expected/` holds the reference audits for graders only.

## Fixtures stay separate from the worked example
The worked audit in `examples/sample-audit.md` already contains its own answer, so **it is not an eval fixture**. Eval agents must not read `examples/` or `evals/expected/`. Eval 2 uses an unseen variant (`pricing-card.html`) whose delegated click handler is quoted as text in the prompt instead of shipping as code.

## Manual run: functional evals
1. Start a fresh session that has only this skill available, and tell it not to read `examples/` or `evals/expected/`.
2. Give it each `prompt` and attach the listed `files`.
3. Grade every entry in `expectations` as pass or fail, using `evals/expected/` as a reference. Record a reason for each failure.
4. Optional baseline: repeat without the skill and compare.

## Manual run: trigger evals
The queries alternate between positives and near-miss negatives, so each part of the split holds both labels. Use the first 12 queries as the tuning set and the last 8 as held-out. Look at held-out results only after you finish editing the description. A query is correct when whether the skill loaded equals `should_trigger`.

## Checking the hit-testing snippet
Serve `fixtures/` over HTTP, open each page in a browser at a phone-sized viewport, and run the snippet in `references/hit-testing.md`:
- `newsletter-card.html` with region `.promo` and target `.archive-link`: expect `interceptedControls` to list the input and the button.
- `pricing-card.html` with region `.plan` and target `.plan-link`: expect `delegated-unknown` for the details panel and `occluded: 0`. After attaching a click listener to `#plan-details` in DevTools, the result must not change (page JavaScript can't see it). After setting an inline `onclick` attribute on it, expect `delegated-possible`. Never fire a click.

## Checking the page probe
Serve `fixtures/` over HTTP, for example `python -m http.server 4180 --directory evals/fixtures`. Run the snippet in `references/page-probe.md` as the top-level expression of the browser tool, at 375×812 and at 1440×900:
- `site-sections.html`:
  - `overflowX: 0` at both widths;
  - `wide` lists `div.deco` with `clipped: true`;
  - "Read the case" stays in `targets.list` and `conformanceCandidates` with `stretched: true`, and appears in `needsHitTest` with an `overlayEstimate` about the card's size;
  - "method note" is listed with `inline: true` and is absent from `conformanceCandidates`;
  - "Explore this product", "Open" (whose only surrounding words are hidden) and all three "Edit"/"Delete" pairs (the plain row, the "Alice" row and the "Alexandria Catherine Johnson" row) are listed with `inline: false` and appear in `conformanceCandidates` with a passing spacing test;
  - the empty anchor "Open the price index" (own box 0×0) appears in `needsHitTest` with an overlay about the tile's size, and in `conformanceCandidates`; it is the one entry `targets.omitted` (1) leaves out of the capped `targets.list`;
  - nothing from the collapsed panels ("Hidden action", "Hidden details…", "Bordered hidden action", their images) appears in any list, and `imagesWithoutAlt` is 0;
  - "Shifted action" is listed: only the x axis of its container clips;
  - `p.bridge` and `p.merge` are **one** line each, `p.spaced` is 10 characters, `p.contents` is measured (its text is inside a `display: contents` wrapper), and `smallText` lists only `sup.hi 9px` and `span.tiny 9px`;
  - at 1440, `lineLength.blocks` shows `p.padded` and `p.normal` as **one** line each (about 92–93 characters, both named in `long`), `p.mixed` as one line with `estimate: true`, and the bullets as one line of 37–38 characters each.
- `overflow-unclipped.html`: `overflowX` greater than 0 (about 188 at 375), and `wide` lists `div.deco` with `clipped: false`.

The full expected table is in `evals/expected/site-sections.md`, for graders only. The snippet must not click, focus, scroll or write anything.

## Automated run (not run in this repository's release process)
Anthropic's skill-creator ships `run_eval.py` and `run_loop.py`, which run trigger queries through the `claude` CLI and split the queries themselves. They need `claude -p`. The v1.2.0 release was prepared without that CLI, so the trigger set was reviewed by hand and **not** run through the automated tester.
