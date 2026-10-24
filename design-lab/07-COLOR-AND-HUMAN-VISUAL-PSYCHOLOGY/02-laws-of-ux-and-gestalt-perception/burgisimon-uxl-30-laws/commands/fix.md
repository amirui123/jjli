---
description: Fix UX problems in this project by applying the 30 Laws of UX, then verify with the UXL scanners and report before → after.
argument-hint: "[path | screen | issue to fix]"
---

Run **UXL Audit & Fix mode** using the `ux-lawyer` skill (load it if needed) and fix what you find.

Target: $ARGUMENTS (if empty: the project's critical flows, at mobile 390px and desktop 1440px).

1. Baseline: run `python3 ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_lint.py <src> --format json > /tmp/uxl-before.json` (or keep the text output) and, if the app can be served, `node ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_audit.mjs <url> --out uxl-report-before`. View the annotated screenshots.
2. Confirm each finding in code, then do the manual law sweep for the critical screens (`references/workflow-audit.md`).
3. Fix in this order: root causes (tokens: type scale, spacing, colors, focus ring, target sizes) → shared components → individual screens. Critical → major → minor. Stay within the existing stack and design language.
4. Keep behavior intact: run the project's tests, typecheck and build if available.
5. Re-run both scanners (write the runtime report to `uxl-report-after`) and compare.
6. Report: changes grouped by law (§ citations), before → after counts and scores, and anything deliberately left (with the reason).
