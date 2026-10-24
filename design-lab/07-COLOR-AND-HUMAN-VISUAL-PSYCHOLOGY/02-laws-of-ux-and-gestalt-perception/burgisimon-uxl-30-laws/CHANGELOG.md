# Changelog

## Unreleased

- Demo 3, "The Voxmere case" (`docs/voxmere/`): an award-hungry brief for a fictional deep-tech startup. Both sessions ran the awards plugin; session B also had UXL. It called the skill before writing markup, ran UXL's scanners before its first jury, struck a planned scarcity counter as "invented scarcity, UXL §L04", and used §L05/§L25 to turn down a jury request that would have hidden the phone headline. Both pages are live, with a blind awards jury, scanner evidence and an event-by-event trace of how B used UXL.
- A film of the Voxmere case (`docs/voxmere/uxl-voxmere.mp4`, linked from the README). `video/` holds its source: `capture.mjs` records both pages frame by frame under a virtual clock (so GSAP, Lenis and WebGL move at video speed), and a Remotion project cuts the footage into scenes, one per law.
- `tools/demo_evidence_voxmere.mjs`: phone captures of the ship-to choice and summary, the checkout submitted empty, a declined card and the confirmation, plus where keyboard focus lands.
- Demo 2, "The Lumenvale case" (`docs/lumenvale/`): UXL working alongside the awards plugin. Both sessions ran the awards pipeline; session B also called UXL before building and ran the `ux-auditor` agent before shipping. Both pages are live, with a blind awards jury, scanner evidence and the UX case file traced into the shipped code.
- `tools/build_demo.py`: `--slug` for more than one demo; records sub-agents; sums duration, turns and output tokens across all result events of a session that background tasks woke more than once.
- `tools/demo_evidence_lumenvale.mjs`: phone captures of the nights list, the booking dialog and the confirmation, plus where keyboard focus lands after booking.
- Auditor: elements with `display: contents` (an `h1` wrapping animated lines, say) are measured by their contents, so such a heading no longer reads as missing or off-screen.
- Linter: "ends in" counts as urgency copy only before a time ("ends in 2 hours", a countdown), not in ordinary prose.

## 1.0.0 (2026-10-20)

First release.

Eval-driven refinements, from two skill-creator iterations (with vs. without skill, 3 tasks):
- Verification is proportionate: scan, fix, re-scan once, and exercise the main flow (happy path plus one failure). In fix mode the case file goes into the hand-off. Scanner findings are evidence, not verdicts.
- Target sizing follows the input type (`pointer: coarse`) rather than screen width. Labels must fit at 360px. Persisted UI state must not cause flashes or hydration mismatches. The hand-off respects the requested format and length.
- Scanner accuracy: grouped navigation counts one choice per group; a repeated identical CTA is not competition; focus rings drawn via `:focus-within` and transitions are recognised; honeypot fields are ignored; postal codes are not forced to a numeric keyboard; icons inside buttons are not counted as targets. New optional 360px `small` viewport.
- Fair trigger evaluator (`evals/trigger_eval.py`): 20/20 correct.
- Demo, "The Fernwheel case" (`docs/`): the same prompt in two headless Claude Code sessions, with and without UXL. Both pages are published live, with scanner evidence, law-cited findings and `tools/build_demo.py` to reproduce it.
- Auditor: menu toggles aren't counted as calls to action; focus inside iframes is skipped. Linter: `fetch` inside comments is ignored.

- `ux-lawyer` Agent Skill with Build, Audit & Fix and Consult modes, plus the UXL statutes (numeric defaults backed by the laws).
- 30 law references (one per Law of UX). Each has build rules for desktop and mobile, code patterns, an audit table and trade-offs.
- Component playbook covering 25 patterns, mobile and desktop platform guides, design tokens, law tensions, the audit workflow, a pre-ship checklist and a case-file template.
- `uxl_lint.py`: a static linter with 31 rules mapped to laws. Stdlib only. Handles HTML, CSS, JSX/TSX, Vue, Svelte, Astro and Tailwind.
- `uxl_audit.mjs`: a Playwright runtime auditor with 19 checks at mobile and desktop viewports, plus annotated screenshots.
- Claude Code plugin and marketplace with `/uxl:build`, `/uxl:audit`, `/uxl:fix`, `/uxl:law` and the `ux-auditor` agent.
- Generated adapters for AGENTS.md, Cursor, GitHub Copilot and Windsurf; a Gemini CLI extension manifest; `install.sh`.
