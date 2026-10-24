# tufte-codexskill

A Codex-native skill for Tufte-style quantitative communication. It helps Codex turn vague chart requests into honest, quiet, high-density data displays: chart critique, chart selection, dashboard/KPI tables, sparklines, small multiples, and implementation plans for HTML/SVG or React.

This repository is a fork and Codex conversion of [`aref-vc/tufte-claude-skill`](https://github.com/aref-vc/tufte-claude-skill). Upstream attribution and the MIT license are preserved.

<table>
  <tr>
    <td align="center" width="33%"><img src="assets/vdqi-cover.svg" alt="The Visual Display of Quantitative Information" width="240"/></td>
    <td align="center" width="33%"><img src="assets/ei-cover.svg" alt="Envisioning Information" width="240"/></td>
    <td align="center" width="33%"><img src="assets/ve-cover.svg" alt="Visual Explanations" width="240"/></td>
  </tr>
  <tr>
    <td align="center"><b>The Visual Display of Quantitative Information</b><br/><i>1983, 2nd ed. 2001</i><br/><sub>pictures of <b>numbers</b></sub></td>
    <td align="center"><b>Envisioning Information</b><br/><i>1990</i><br/><sub>pictures of <b>nouns</b></sub></td>
    <td align="center"><b>Visual Explanations</b><br/><i>1997</i><br/><sub>pictures of <b>verbs</b></sub></td>
  </tr>
</table>

## Install

Clone the skill into Codex's skill directory. If `CODEX_HOME` is not set, Codex uses `~/.codex`.

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
git clone https://github.com/transpara-ai/tufte-codexskill.git "${CODEX_HOME:-$HOME/.codex}/skills/tufte"
```

Restart Codex so the skill metadata is loaded.

To verify the local layout:

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/tufte/scripts/validate-skill.py" "${CODEX_HOME:-$HOME/.codex}/skills/tufte"
```

## Update

```bash
cd "${CODEX_HOME:-$HOME/.codex}/skills/tufte"
git pull --ff-only
python3 scripts/validate-skill.py .
```

Restart Codex after updating.

## Uninstall

```bash
rm -rf "${CODEX_HOME:-$HOME/.codex}/skills/tufte"
```

## Usage

Ask naturally, or mention `$tufte` when you want to force the skill into the prompt.

```text
Use $tufte to turn this default dashboard into a compact KPI table with sparklines.
```

```text
Use $tufte to critique this chart code and return a React-oriented repair plan.
```

```text
Use $tufte to choose the right chart for monthly revenue by region, then produce self-contained HTML/SVG.
```

Codex discovers skills from `SKILL.md` frontmatter. This repo also includes `agents/openai.yaml` metadata following current Codex skill guidance for UI display name, short description, brand color, and a default prompt. The `$tufte` examples follow the current `$skill-name` explicit mention convention; natural-language prompts remain the portable path.

Codex should use the skill when work involves:

- Chart critique or redesign.
- Chart type selection from a data shape and reader goal.
- Dashboard and KPI table design.
- Sparklines and word-data integration.
- Small multiples, slopegraphs, dot plots, cohort tables, funnels, time series, and distributions.
- React, Recharts, D3-in-React, or self-contained HTML/SVG chart output.

The skill should not be used for decorative illustration, logo work, generic flowcharts, architecture diagrams, or non-quantitative visual art unless the task also includes data that must be communicated accurately.

## How The Skill Is Organized

`SKILL.md` stays small so Codex can load it quickly. It routes to the supporting files only when needed.

| File | Purpose |
|---|---|
| [`SKILL.md`](./SKILL.md) | Codex trigger description and routing instructions |
| [`principles.md`](./principles.md) | Tufte principles and practical interpretation |
| [`chart-selection.md`](./chart-selection.md) | Data shape plus goal to chart type |
| [`kill-list.md`](./kill-list.md) | Chartjunk, weak chart types, and misleading encodings to remove |
| [`checklist.md`](./checklist.md) | Pre-publish review checklist |
| [`report-voice.md`](./report-voice.md) | Plain prose rules for captions, reports, and slides |
| [`presets/html-svg.md`](./presets/html-svg.md) | Self-contained HTML/SVG patterns |
| [`presets/react.md`](./presets/react.md) | React, Recharts, and D3-in-React patterns |
| [`examples/smoke-test.md`](./examples/smoke-test.md) | Smoke-test example for converting a bad default chart request |
| [`before-after.html`](./before-after.html) | Side-by-side visual examples |
| [`cheatsheet.html`](./cheatsheet.html) / [`cheatsheet.pdf`](./cheatsheet.pdf) | One-page reference |
| [`scripts/validate-skill.py`](./scripts/validate-skill.py) | Repo-local structure, reference, and stale-path checks |

## The Three Books, Distilled

The skill is grounded in the three-book taxonomy Tufte gives in *Visual Explanations*:

- **VDQI**: how to depict data and enforce statistical honesty. It contributes data-ink ratio, chartjunk, lie factor, and small multiples.
- **EI**: how to lay out information in space. It contributes layering, micro/macro readings, color restraint, and escaping flatland.
- **VE**: how to show motion, causality, and narrative. It contributes smallest effective difference, parallelism, and visual explanations.

Together they produce the operating rules in [`principles.md`](./principles.md).

## What Codex Should Produce

Default to one of these:

| User asks for | Codex should produce |
|---|---|
| "Make a quick chart" | Self-contained HTML/SVG unless the repo context says otherwise |
| "Use React" | A React component aligned with local project patterns |
| "Improve this chart" | A critique plus a focused rewrite plan or patch |
| "Build a dashboard" | A compact table with values, sparklines, deltas, and thresholds |
| "Use a pie, 3D, dual-axis, gauge, or rainbow heatmap" | Acknowledge the request, name the Tufte alternative, and avoid misleading encodings |

## Before And After

Nine pairs compare typical default output to Tufte-applied output. The interactive gallery is [`before-after.html`](./before-after.html), and a bounded PNG gallery is kept at [`assets/gallery-full.png`](./assets/gallery-full.png).

Examples include:

- 3D bars to sorted dot plot.
- Framed time series to sparkline plus endpoint labels.
- KPI cards to compact table with sparklines.
- Clustered bars to slopegraph.
- 3D funnel to horizontal stage bars.
- Rainbow cohort heatmap to sequential table with values.

## Validation

Run the local checks before opening or updating a PR:

```bash
python3 scripts/validate-skill.py .

quick_validate="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"
if [ -f "$quick_validate" ]; then
  python3 "$quick_validate" .
fi
```

The repo-local validator checks:

- Required skill files and folders.
- `SKILL.md` frontmatter.
- Required reference routing.
- Broken relative Markdown and HTML links.
- Stale Claude-only install paths or invocation assumptions.
- Basic `agents/openai.yaml` metadata.

The smoke-test example is a documentation fixture for expected behavior. The validation scripts check package structure and references; they do not prove that a future model invocation will produce a Tufte-compliant chart.

## Attribution And License

Forked from [`aref-vc/tufte-claude-skill`](https://github.com/aref-vc/tufte-claude-skill), which was released under MIT. This fork preserves the upstream license and contributor attribution in [`LICENSE`](./LICENSE).

Short quotations and references to Edward R. Tufte's books are attributed inline and retained for educational reference. This project is not affiliated with or endorsed by Edward R. Tufte.
