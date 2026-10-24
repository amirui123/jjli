---
name: tufte
description: Apply Edward Tufte-style quantitative communication to data visualization work. Use when Codex is asked to design, build, critique, or improve charts, graphs, dashboards, KPI tables, sparklines, small multiples, time series, distributions, cohort views, funnels, geographic views, or visual explanations of quantitative or categorical data. Produces chart plans or code for self-contained HTML/SVG and React-oriented outputs while avoiding chartjunk, weak chart choices, and misleading encodings.
---

# Tufte Quantitative Display

Use this skill when a task involves communicating data visually or improving an existing chart. Prefer clear quantitative reasoning over decoration. Use the user's project stack when one exists, and otherwise default to self-contained HTML/SVG for portable output.

## Workflow

1. Identify the data shape, comparison goal, audience, and output stack.
2. Read [chart-selection.md](chart-selection.md) to choose a chart type from the data and goal.
3. Read [principles.md](principles.md) when the task needs design judgment, critique, or tradeoff reasoning.
4. Apply [kill-list.md](kill-list.md) before producing output.
5. Use [presets/html-svg.md](presets/html-svg.md) for self-contained HTML/SVG output.
6. Use [presets/react.md](presets/react.md) when the target project is React or already uses Recharts/D3.
7. Read [report-voice.md](report-voice.md) when prose, captions, slide text, or report copy surrounds the chart.
8. Run [checklist.md](checklist.md) before declaring the chart, critique, or implementation plan complete.

For a compact overview, use [cheatsheet.html](cheatsheet.html). For visual comparison examples, use [before-after.html](before-after.html).

## Default Decisions

- Prefer sorted dot plots, sparklines, small multiples, slopegraphs, compact KPI tables, range-frame line charts, and directly labeled values.
- Prefer tables when exact values matter and the row count is small.
- Prefer one focal accent color and quiet context marks.
- Prefer direct labels over legends.
- Preserve graphical integrity: no misleading axes, no area or volume for one-dimensional values, and no unmarked scale changes.
- If the user explicitly requests a chart type on the kill list, comply only after naming the Tufte alternative and keeping the output honest.

## Codex Output Guidance

- In an existing codebase, follow local chart libraries, component patterns, styling tokens, test conventions, and accessibility patterns.
- For a new standalone artifact, produce a single HTML file with inline CSS/SVG unless the user asks for React.
- For React, use Recharts only where it fits cleanly; use SVG/D3-in-React for dot plots, slopegraphs, sparklines in tables, and small multiples.
- Keep chart code inspectable. Avoid hidden magic, decorative animation, gradients, shadows, 3D effects, and remote dependencies unless the project already requires them.
- Verify layout constraints for long labels, narrow containers, and responsive resizing.

## Not In Scope

Do not use this skill for logo design, decorative illustration, generic flowcharts, architecture diagrams, or non-quantitative visual art unless the task also includes data that must be communicated accurately.
