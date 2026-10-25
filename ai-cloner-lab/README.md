# 🧬 AI App & Website Cloner Lab (`ai-cloner-lab/`)

A dedicated, self-contained vault of **15 open-source AI reverse-engineering, application-cloning, and pixel-perfect website-rebuilding repositories, MCP servers, and agent skills** (`4,150+` source, skill, prompt, and specification files).

---

## 📦 Complete Inventory of Downloaded Repositories (`15` Suites)

| # | Folder Path | Upstream GitHub Repository | Category & Core Capability |
| :--- | :--- | :--- | :--- |
| **01** | [`01-morluto-rea`](./01-morluto-rea) | [`morluto/rea`](https://github.com/morluto/rea) | **Reverse Engineer Anything (REA):** MCP server, CLI (`rea-agents`), and `.agents/skills` for decompiling & rebuilding native binaries, Electron apps, Android APKs, .NET assemblies, and websites |
| **02** | [`02-rea-prompts`](./02-rea-prompts) | [`JoasASantos/REA-Prompts`](https://github.com/JoasASantos/REA-Prompts) | **REAP Prompt Library:** Clean-room application cloning prompts (`CLONE_SPEC.md`, state machines, network protocols, and binary evidence extraction) |
| **03** | [`03-awesome-rea`](./03-awesome-rea) | [`AIshihzong/awesome-reverse-engineer-anything`](https://github.com/AIshihzong/awesome-reverse-engineer-anything) | **Awesome REA Encyclopedia:** Curated case studies, rebuild workflows, and architecture breakdowns of software recreated with REA |
| **04** | [`04-replica-skill`](./04-replica-skill) | [`Jakeschincariol/replica-skill`](https://github.com/Jakeschincariol/replica-skill) | **11 Claude Skills That Clone Any App:** `/replica-recon`, `/replica-build`, `/replica-backend`, `/replica-test`, `/replica-diff`, and `/replica-entrepreneur` |
| **05** | [`05-breakinggood`](./05-breakinggood) | [`bhoomizz/breakinggood`](https://github.com/bhoomizz/breakinggood) | **BreakingGood CLI:** One command (`npx breakinggood <url>`) to capture DOM, computed styles, and API traffic and rebuild a running clone |
| **06** | [`06-open-lovable`](./06-open-lovable) | [`firecrawl/open-lovable`](https://github.com/firecrawl/open-lovable) | **Open Lovable:** Full-stack application that scrapes any live URL and recreates it as a modern React + Tailwind + TypeScript codebase |
| **07** | [`07-ai-website-cloner-template`](./07-ai-website-cloner-template) | [`JCodesMore/ai-website-cloner-template`](https://github.com/JCodesMore/ai-website-cloner-template) | **Portable `/clone-website` Agent Skill:** 4-stage pipeline (`Map -> Observe -> Build -> Compare`) for Claude Code, Cursor, Codex, and OpenCode |
| **08** | [`08-perfect-web-clone`](./08-perfect-web-clone) | [`ericshang98/perfect-web-clone`](https://github.com/ericshang98/perfect-web-clone) | **Perfect Web Clone:** Measured full-page Vite + React cloning harness (`capture -> section plan -> clean React -> build -> measured repair`) |
| **09** | [`09-screenshot-to-code`](./09-screenshot-to-code) | [`abi/screenshot-to-code`](https://github.com/abi/screenshot-to-code) | **Screenshot & Video to Code:** Converts screenshots, Figma designs, screen recordings, and URLs into clean HTML/Tailwind, React, or Vue |
| **10** | [`10-claude-website-cloner-skills`](./10-claude-website-cloner-skills) | [`Mood-Global-Services/How-to-Clone-Website---Claude-Skills`](https://github.com/Mood-Global-Services/How-to-Clone-Website---Claude-Skills) | **Multi-Agent Chrome MCP Cloner:** Inspects sites via Chrome MCP, extracts design tokens, and dispatches parallel builder agents in isolated git worktrees |
| **11** | [`11-uholli-ai-website-cloner`](./11-uholli-ai-website-cloner) | [`UHolli/ai-website-cloner`](https://github.com/UHolli/ai-website-cloner) | **AI Website Cloner Skills:** Multi-phase `.claude/skills/clone-website/SKILL.md` workflow synchronized across coding agents |
| **12** | [`12-promptwhisper-clone-skill`](./12-promptwhisper-clone-skill) | [`promptwhisper/clone-any-website-skill`](https://github.com/promptwhisper/clone-any-website-skill) | **Codex & Agent Website Cloner Skill:** Rebuilds public websites as maintainable projects with strict visual and interaction QA gates |
| **13** | [`13-braxton-pixel-cloner`](./13-braxton-pixel-cloner) | [`braxtonROSE4/clone-any-website`](https://github.com/braxtonROSE4/clone-any-website) | **Pixel-by-Pixel UX/UI Cloner Skill:** Agent skill engineered for 1:1 visual, layout, and micro-interaction fidelity |
| **14** | [`14-dittu-mcp-cloner`](./14-dittu-mcp-cloner) | [`Manish-Tamang/dittu`](https://github.com/Manish-Tamang/dittu) | **Dittu CLI & MCP Server:** Clones any website frontend into Next.js or Astro with `≥ 95%` measured pixel match |
| **15** | [`15-varalix-clone-team`](./15-varalix-clone-team) | [`Varalix-Digitech-Solutions/clone-team`](https://github.com/Varalix-Digitech-Solutions/clone-team) | **Clone Team Multi-Agent Workflow:** Team of specialized AI agents producing a pixel-perfect UI clone + reverse-engineered architecture docs with an unskippable test gate |

---

## ⚡ Quick-Start Commands

### 1. Reverse Engineer & Clone Any Native/Desktop/Web Application (`01-morluto-rea`)
```bash
npx rea-agents setup
```
Or run directly from the local prompt library in [`02-rea-prompts/README.md`](./02-rea-prompts/README.md).

### 2. Clone Any App End-to-End with the 11 Replica Skills (`04-replica-skill`)
Copy the skill folders from [`04-replica-skill/skills/`](./04-replica-skill) into your agent's `.claude/skills/` or `.agents/skills/` directory and run:
```text
/replica-recon <target-app>
/replica-build
/replica-backend
/replica-test
/replica-diff
```

### 3. Clone Any Live Website into React / Next.js (`05`, `06`, `07`, `08`, `14`, `15`)
- **BreakingGood CLI (`05-breakinggood`):**
  ```bash
  npx breakinggood https://example.com
  ```
- **Agent `/clone-website` Skill (`07-ai-website-cloner-template` / `10` / `11` / `15`):**
  ```text
  /clone-website https://example.com
  ```
