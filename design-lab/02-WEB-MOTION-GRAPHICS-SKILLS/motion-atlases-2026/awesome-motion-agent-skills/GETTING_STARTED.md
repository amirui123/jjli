# Getting Started with Motion Design Agent Skills

This repository contains **installable agent skills** under [`skills/`](./skills) and **read-only guidance** under folders like [`rubrics/`](./rubrics), [`playbooks/`](./playbooks), and [`rankings/`](./rankings).

## 1. Discover the available skills

Use the official [`vercel-labs/skills`](https://github.com/vercel-labs/skills) CLI to list what this repo exposes:

```bash
npx skills add frankxai/awesome-motion-design-agent-skills --list
```

As of **2026-09-28**, this returns five first-party skills:

- `motion-director`
- `site-motion-excellence-director`
- `web-motion-auditor`
- `remotion-video-agent`
- `generative-media-director`

## 2. Read the skill before installing it

Open the matching `SKILL.md` first:

- [`skills/motion-director/SKILL.md`](./skills/motion-director/SKILL.md)
- [`skills/site-motion-excellence-director/SKILL.md`](./skills/site-motion-excellence-director/SKILL.md)
- [`skills/web-motion-auditor/SKILL.md`](./skills/web-motion-auditor/SKILL.md)
- [`skills/remotion-video-agent/SKILL.md`](./skills/remotion-video-agent/SKILL.md)
- [`skills/generative-media-director/SKILL.md`](./skills/generative-media-director/SKILL.md)

## 3. Install only the skill you need

Project-local install is the default:

```bash
npx skills add frankxai/awesome-motion-design-agent-skills --skill motion-director -a claude-code
```

Useful agent ids from the official CLI docs include `claude-code`, `github-copilot`, `codex`, `cursor`, `gemini-cli`, and `opencode`.

If you intentionally want a global install, add `-g`:

```bash
npx skills add frankxai/awesome-motion-design-agent-skills --skill web-motion-auditor -a github-copilot -g
```

## 4. Verify what is installed

```bash
npx skills list
npx skills list -g
```

## 5. If you only want the guidance, read these instead

- [`README.md`](./README.md)
- [`rubrics/motion-quality-rubric.md`](./rubrics/motion-quality-rubric.md)
- [`rubrics/site-motion-excellence-gate.md`](./rubrics/site-motion-excellence-gate.md)
- [`rankings/best-motion-design-stack.md`](./rankings/best-motion-design-stack.md)

## 6. Safety for third-party installs

For third-party skill packs, prefer official upstream repositories and scan them before installation with [`NVIDIA/SkillSpector`](https://github.com/NVIDIA/SkillSpector).
