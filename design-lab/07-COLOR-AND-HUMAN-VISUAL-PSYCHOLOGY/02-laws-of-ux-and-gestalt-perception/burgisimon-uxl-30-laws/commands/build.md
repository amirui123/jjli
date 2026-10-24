---
description: Build a new website, page, flow or component the UXL way, applying the 30 Laws of UX for desktop and mobile from the start.
argument-hint: "<what to build>"
---

Build the following using **UXL Build mode** from the `ux-lawyer` skill (load it if needed):

$ARGUMENTS

Follow the Build mode steps in the skill:
1. Write the short brief (who, 1–3 critical tasks, primary action per screen, conventions to borrow, where complexity lives). Make sensible assumptions instead of stalling.
2. Structure/IA (≤ 7 top-level nav items, 3–5 mobile destinations, one job per screen).
3. Tokens: the project's design system if one exists, otherwise `${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/assets/uxl-tokens.css` (or `uxl-theme.tailwind.css` for Tailwind v4).
4. Compose mobile-first, then enhance for desktop; check `references/component-playbook.md` for each component you build.
5. Implement all states (loading, empty, error, success), feedback, and form rules from the statutes.
6. Design the peak and the end of the journey.
7. Verify: `python3 ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_lint.py <files>` and, when servable, `node ${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/scripts/uxl_audit.mjs <url-or-file> --out uxl-report`, view the screenshots, and fix what they find.
8. Finish with a "UX decisions" list (≤ 8 bullets, each citing its law).
