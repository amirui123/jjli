---
description: UX audit of this project (or a path/URL) against the 30 Laws of UX. Produces a cited case file, no code changes.
argument-hint: "[path | url | flow to focus on]"
---

Run a **UXL Audit & Fix review in report-only mode** using the `ux-lawyer` skill (load it if it isn't loaded yet).

Target: $ARGUMENTS (if empty, audit the current project's critical flows).

Steps:
1. Scope the critical flows (§L21 Pareto) and the stack.
2. Static scan: `python3 ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_lint.py <source dirs> --format md`
3. If the app can be served (or the target is a URL/HTML file), run the runtime audit:
   `node ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_audit.mjs <url-or-file> --out uxl-report`
   and **view the annotated screenshots** for mobile and desktop. If Playwright is unavailable, say so. Don't invent measurements.
4. Do the manual 30-law sweep from `${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/references/workflow-audit.md` on each critical screen.
5. Write the case file following `${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/assets/report-template.md`: findings ranked critical → major → minor, each with §-citation, evidence, impact and remedy.

Do not modify project files in this command. End by offering `/uxl:fix` for the top issues.
