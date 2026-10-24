# Recommended Installs

This is the install posture for FrankX, Arcanea, and Starlight motion design work. Keep installs minimal, official, and scoped to the repo where the motion work actually happens.

## Keep Enabled In Codex

- Figma plugin/connector
- Canva plugin/connector
- Vercel plugin/connector
- Browser automation
- GitHub CLI/connector
- Image generation

These are already visible or locally available in this environment.

## Add To Motion/Video Projects

```bash
npm i motion gsap
npm i -D @playwright/test
```

For Remotion projects:

```bash
npm create video@latest
npm i @remotion/lottie lottie-web @remotion/rive
```

For 3D or cinematic web scenes:

```bash
npm i three @react-three/fiber @react-three/drei
npm i @theatre/core @theatre/studio
```

For interactive vector animation:

```bash
npm i @rive-app/react-canvas
```

For Lottie in React UI:

```bash
npm i lottie-react
```

## Add Agent Skills

Official Remotion docs currently recommend:

```bash
npx skills add remotion-dev/skills
```

Run this in the agent environment where the video work will happen. Then verify the installed path before relying on it in production.

Installed locally on 2026-06-18 for this repo and link posture refreshed on 2026-06-19:

```text
.agents/skills/remotion-best-practices
```

The installed skill is intentionally not committed to this public repo; keep third-party skill source pinned in `skills-lock.json` and reinstall from the official source when needed.

Current high-value third-party skill references:

- LottieFiles motion-design skill: https://github.com/LottieFiles/motion-design-skill
- LottieFiles dotLottie web skill: https://github.com/LottieFiles/dotlottie-web/blob/main/SKILL.md
- GSAP official skills: https://github.com/greensock/gsap-skills

## Add MCP Carefully

Recommended:

- Figma MCP for design context and write-back: https://developers.figma.com/docs/figma-mcp-server/
- Figma MCP catalog for client setup: https://www.figma.com/mcp-catalog/
- Canva MCP for asset/design creation and collateral: https://www.canva.dev/docs/mcp/
- Remotion MCP for Remotion-specific docs/context: https://www.remotion.dev/docs/ai/mcp
- Vercel connector for deploy/preview/log workflows.

Security rule: install MCP servers from official vendors or audited source only. Review scopes, command execution behavior, and whether the tool can read secrets or write files.

## Local Machine Status

Checked on 2026-06-18; source recommendations refreshed on 2026-06-19:

- `git` is available.
- `gh` is available.
- `node` is available.
- `npm` is available.
- `ffmpeg` is available.
