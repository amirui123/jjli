# Skill spec compliance

Checked against the Agent Skills spec. The portability boundary is narrow:
only `name`, `description`, `license`, `compatibility`, `metadata` and
`allowed-tools` survive a claude.ai upload or `package_skill.py`.
Everything else is a local or Claude Code extension.

_110 of 110 skills pass with no hard errors._

| Code | Count | Meaning |
|---|---|---|
| `extension-fields-at-top-level` | 88 | Claude Code extension fields sit at the top level instead of under `metadata:` |
| `name-dir-mismatch` | 7 | `name:` in the frontmatter does not match the directory name — the spec expects them equal |

## Name / directory mismatches

| `name:` | directory | path |
|---|---|---|
| `animate` | `kowalski-animate` | `kowalski-animate/SKILL.md` |
| `animation-vocabulary` | `kowalski-animation-vocabulary` | `kowalski-animation-vocabulary/SKILL.md` |
| `emil-design-eng` | `kowalski-design-eng` | `kowalski-design-eng/SKILL.md` |
| `improve-animations` | `kowalski-improve-animations` | `kowalski-improve-animations/SKILL.md` |
| `design-taste-frontend` | `taste-skill` | `taste-skill/SKILL.md` |
| `ui-ux-pro-max` | `ui-ux-pro-max-plus` | `ui-ux-pro-max-plus/SKILL.md` |
| `web-design-guidelines` | `vercel-web-design-guidelines` | `vercel-web-design-guidelines/SKILL.md` |
