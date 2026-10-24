---
description: Explain a Law of UX (or find which laws apply to a UI question) with concrete build rules, code patterns and audit checks.
argument-hint: "<law name | id like L07 | UI question>"
---

Using the `ux-lawyer` skill, answer: $ARGUMENTS

- If it names a law (e.g. "fitts", "L10", "peak-end"), read its file in `${CLAUDE_PLUGIN_ROOT}/skills/ux-lawyer/references/laws/` and give: the law in plain words, the 3–5 most important build rules (desktop and mobile), one short code pattern, and how to detect violations.
- If it's a question about a design decision or a piece of UI, identify the relevant laws (cite them as §Lxx), explain the mechanism briefly, and give a concrete recommendation. Mention any tension between laws (see `references/law-tensions.md`) and how to resolve it.
- If no argument is given, show the 30-law table from the skill.

Keep it practical and short. Link the source: https://lawsofux.com
