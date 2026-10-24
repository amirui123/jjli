# Claude Code Tooling in 2026 — what to reach for BEFORE starting a project

**Verified:** 2026-10-20 (Africa/Cairo). Every repo below was queried live via `gh api` (authenticated as `youssefvdel`); every npm package via `npm view` + the npm downloads API. Stars are live at query time and move daily — treat them as a snapshot, not a ranking. Anything I could not confirm live is marked **unverified**.

Raw evidence: `verified-stats.json` (same directory). GitHub API cache: `ghcache/`.

---

## 0. TL;DR — the 5-minute baseline for a new project

This is the stack the community converges on, and it is the only part of the ecosystem where
Anthropic-vetted and community-agreed answers actually agree.

```bash
# 0. Behaviour layer — one file, fixes the model's default bad habits (zero install)
curl -o CLAUDE.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md

# 1. Skill layer — Anthropic's official example skills (3 plugins in one marketplace)
#    (run inside a Claude Code session)
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
/plugin install document-skills@anthropic-agent-skills

# 2. Methodology layer — a workflow framework that forces plan → test → review
/plugin install superpowers@claude-plugins-official

# 3. MCP layer — the two that matter for a frontend build
/plugin install context7@claude-plugins-official     # current library docs
/plugin install playwright@claude-plugins-official   # drive the real app
```

Four layers, four different jobs. The community's most-cited framing (buildthisnow.com's
"10 Best .claude/ Setups in 2026", updated 2026-06-14) calls these **behaviour / skill /
methodology / memory**, and warns that a stack missing any layer breaks down inside one session.

**Important correction to a common belief:** the `skills` CLI (`npx skills add <owner>/<repo> -g`)
is **NOT** Anthropic's. It is **[vercel-labs/skills](https://github.com/vercel-labs/skills)** (MIT,
35.8k★, `skills` on npm v1.7.4, **22.9M downloads/month**). Anthropic publishes *skills*, not the
CLI. The CLI is harness-agnostic and installs into 75+ agents.

---

## 1. The skills CLI and plugin marketplaces — how they actually work

### 1.1 `npx skills add <owner>/<repo> -g` (vercel-labs/skills)

| Field | Value |
|---|---|
| Repo | https://github.com/vercel-labs/skills |
| Stars | **35,786** · forks 3,058 |
| License | MIT · npm `skills` v1.7.4 · **22.9M downloads/mo** |
| Last commit | 2026-10-19 |
| Maintained | ✅ Yes — pushed yesterday relative to query date |
| Requires | Node.js ≥ 22.20 |

**Verified behaviour** (I ran these locally):

```bash
npx skills add anthropics/skills --skill frontend-design -y   # → ./.agents/skills/frontend-design + skills-lock.json
npx skills add anthropics/skills --skill theme-factory -g -y   # → ~/.agents/skills/theme-factory, symlinked to ~/.claude/skills/theme-factory
npx skills add obra/superpowers -g --dry-run -y                # → found 15 skills, 79 agents, "Installing to: GitHub Copilot, Hermes Agent, OpenCode"
```

What actually happens:

- **Default = project scope.** It writes to `<project>/.agents/skills/<skill>/` and creates a
  `skills-lock.json` with `source`, `sourceType`, `skillPath`, `computedHash`.
- **`-g` = user scope.** Writes to `~/.agents/skills/` and **symlinks** into each agent's
  directory (`.claude/skills/`, `.cursor/skills/`, `.opencode/skills/`, `~/.hermes/skills/` …).
  Use `--copy` to copy instead of symlink.
- **Multi-agent by default.** It installs to *every* detected agent, not just Claude Code.
  Force one with `-a claude-code`.
- **`-s/--skill <name>`** installs a single skill; **`-l/--list`** previews; **`-y`** skips prompts.
- **Other verbs:** `find` (search skills.sh), `list`/`ls`, `update`, `remove`/`rm`, `init`,
  `use <source>@<skill>` (generate a prompt or launch an agent with a skill without installing),
  `experimental_sync` (pull skills out of npm package.json `skills` fields).
- **Source formats:** `owner/repo`, full GitHub URL, a `/tree/main/skills/<name>` subpath,
  GitLab, Azure Repos, any git URL, or a local path. Private repos work via Git credential
  helper → `gh repo clone` → SSH fallback.
- **Claude Code path:** `.claude/skills/` (project) / `~/.claude/skills/` (global). Note that
  Claude Code, Codex, Cursor, Gemini CLI, OpenCode and friends all read the universal
  `.agents/skills/` path — that's why one install fans out.

`skills.sh` (the directory/registry behind it) shows a live leaderboard. Current top entries:
`find-skills` (vercel-labs, 4.0M installs), `grill-me` / `grill-with-docs` / `tdd` /
`improve-codebase-architecture` (mattpocock), `agent-browser` (vercel-labs), and
`frontend-design` (anthropics/skills, 1.0M installs).

### 1.2 The Claude Code plugin marketplace system (different thing)

Two parallel systems that people constantly conflate:

| | `npx skills` (vercel-labs) | Claude Code plugins (Anthropic) |
|---|---|---|
| Unit | a **skill** = one folder with `SKILL.md` | a **plugin** = skills + agents + hooks + MCP servers + commands, installed as one unit |
| Install | `npx skills add owner/repo` | `/plugin marketplace add owner/repo` then `/plugin install name@marketplace` |
| Config | `skills-lock.json` | `enabledPlugins` in `~/.claude/settings.json` (user), `.claude/settings.json` (project), `.claude/settings.local.json` (local) |
| Context cost | Skill name+description only when the skill can self-invoke | **Every enabled plugin's skill/agent/command names and descriptions sit in context on every turn** — plugins are loaded even when unused |
| Runs as | markdown + optional scripts | your user privileges (hooks + MCP servers) — trust required |

**Anthropic's three marketplaces** (verified against `code.claude.com/docs/en/plugins/anthropic-marketplaces`):

| Marketplace | Repository | Name you type after `@` | Size | How to add |
|---|---|---|---|---|
| Official | `anthropics/claude-plugins-official` | `claude-plugins-official` | **315 plugins** | auto-added on first interactive session |
| Community | `anthropics/claude-plugins-community` | `claude-community` | **2,283 plugins** | `/plugin marketplace add anthropics/claude-plugins-community` |
| Demo | `anthropics/claude-code` (plugins/ dir) | `claude-code-plugins` | 13 example plugins | `/plugin marketplace add anthropics/claude-code` |

Plus topic-specific ones you add by hand: `anthropics/skills` (→ `anthropic-agent-skills`),
`anthropics/knowledge-work-plugins` (30.6k★).

**Marketplace anatomy (verified):** a repo (or local dir) with `.claude-plugin/marketplace.json`:

```json
{
  "name": "my-marketplace",
  "owner": { "name": "...", "email": "..." },
  "plugins": [
    { "name": "my-plugin", "source": "./plugins/my-plugin" },
    { "name": "remote", "source": { "source": "url", "url": "https://github.com/o/r.git" } },
    { "name": "sub", "source": { "source": "git-subdir", "url": "https://github.com/o/r.git", "path": "plugins/x", "ref": "main" } }
  ]
}
```

Rules worth knowing (from Anthropic's own docs, quoted): plugin **names are immutable slugs** —
rename them and you break installs with `plugin-not-found`; use `displayName` instead, or add a
`renames` map so the loader auto-migrates. A skill-bundle plugin (no `plugin.json`) is declared
with `"strict": false` plus an explicit `skills` array.

**Install scopes:** user (every project on the machine), project (committed to `.claude/settings.json`,
so collaborators must run `claude plugin install <name>@<marketplace> --scope project` once
themselves — committing the entry does **not** download it), local (you, this repo only).
Local > project > user when the same plugin is set at several scopes.

### 1.3 The repos you named

**`anthropics/skills`** — https://github.com/anthropics/skills
- **182,406★**, 21,611 forks, created 2025-09-22, last commit **2026-10-09** (11 days before query — mildly stale but the repo is a doc/reference artifact, not code)
- **License: none at repo root.** Each skill ships its own `LICENSE.txt`: **Apache-2.0** for
  `frontend-design`, `canvas-design`, `theme-factory`, `webapp-testing`, `mcp-builder`,
  `skill-creator`, `brand-guidelines`, `internal-comms`, `algorithmic-art`, `slack-gif-creator`,
  `web-artifacts-builder`, `academy-guide`, `claude-api`, `discernment-nudge`;
  **proprietary (© Anthropic, PBC, source-available not OSS)** for `docx`, `pdf`, `pptx`, `xlsx`.
  `doc-coauthoring` has **no LICENSE file at all**.
- Marketplace `anthropic-agent-skills` = 3 plugins: `document-skills`, `example-skills`, `claude-api`.
- 20 skills total, incl. `frontend-design`, `mcp-builder`, `skill-creator`, `webapp-testing`.
- Install: `/plugin marketplace add anthropics/skills` → `/plugin install example-skills@anthropic-agent-skills`
- **The repo's own disclaimer:** *"provided for demonstration and educational purposes only"*.

**`obra/superpowers`** — https://github.com/obra/superpowers
- **302,439★**, 27,003 forks, MIT, created 2025-10-09, last commit **2026-10-20 (today)** — most actively maintained tool in this whole list
- 15 skills: `brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`,
  `systematic-debugging`, `verification-before-completion`, `subagent-driven-development`,
  `requesting-code-review`, `receiving-code-review`, `dispatching-parallel-agents`,
  `using-git-worktrees`, `writing-skills`, `finishing-a-development-branch`,
  `diagnosing-superpowers`, `using-superpowers`. Plugin v7.0.0 + a `session-start` hook.
- Install: `/plugin install superpowers@claude-plugins-official` (also in Anthropic's official
  marketplace), or `/plugin marketplace add obra/superpowers-marketplace` → `/plugin install superpowers@superpowers-marketplace`
- Also ships `.hermes-plugin/`, `.opencode/`, `.codex-plugin/`, `.cursor-plugin/`, `.gemini` — the
  most cross-harness-maintained repo here.
- **Methodology:** brainstorm → spec → plan → TDD → subagent development → review → finalize. It
  refuses to ship code without tests. That is the whole value proposition, and also its cost: it
  inserts a large amount of process before the first line of code.

**`vercel-labs/skills`** (the actual skills CLI) — see §1.1.

---

## 2. MCP servers that matter for a DESIGN / FRONTEND build

| Tool | Repo | Stars | License | Last commit | Install | Why it matters |
|---|---|---|---|---|---|---|
| **Figma MCP (official)** | https://github.com/figma/mcp-server-guide | 2,090 | none (Figma Dev Terms) | 2026-10-19 | `/plugin install figma@claude-plugins-official` — or `claude mcp add --transport http figma https://mcp.figma.com/mcp` | Reads variables/components/layout from real design files; write-to-canvas (remote only, beta, free for now); Code Connect keeps generated code on your real components. **Rate limit: Starter/View/Collab seats = 6 tool calls per month**; Dev/Full seats get per-minute REST-API-tier limits |
| **Context7** | https://github.com/upstash/context7 | 63,354 | MIT | 2026-10-20 | `/plugin install context7@claude-plugins-official` (bundles `https://mcp.context7.com/mcp?client=claude-code-plugin`) — or `npx -y @upstash/context7-mcp` | Version-specific library docs. Highest ROI MCP for "the API changed 3 months ago". npm 4.4.4, 2.6M dl/mo. Also has a **CLI+skill mode** (`ctx7`) that needs no MCP at all |
| **shadcn MCP** | https://ui.shadcn.com/docs/mcp | — | MIT | CLI v4.22.1 (2026-10-18) | `npx shadcn@latest mcp init --client claude` (verified: writes `.mcp.json` with `{"mcpServers":{"shadcn":{"command":"npx","args":["shadcn@latest","mcp"]}}}`) | Browse/search/install components from **any registry** (shadcn/ui, private company libs, third-party) by natural language. Reads `components.json` for your aliases/base library |
| **shadcn/ui skill** | https://github.com/shadcn-ui/ui | 126,039 | MIT | 2026-10-19 | `npx skills add shadcn/ui` | Reads `components.json` via `shadcn info --json` so the agent knows your framework, Tailwind version, aliases, base library (base/radix/aria), icon library, installed components. **This is the better half of shadcn** — the MCP installs components, the skill makes the agent *use* them correctly |
| **Playwright MCP** | https://github.com/microsoft/playwright-mcp | 38,411 | Apache-2.0 | 2026-10-19 | `/plugin install playwright@claude-plugins-official` — or `npx @playwright/mcp@latest` | Browser automation + screenshots + form filling + a11y-tree snapshots. npm v0.0.83, **27.9M downloads/mo** — the most-installed MCP npm package measured |
| **Chrome DevTools MCP** | https://github.com/ChromeDevTools/chrome-devtools-mcp | 53,907 | Apache-2.0 | 2026-10-20 | `/plugin install chrome-devtools-mcp@claude-plugins-official` | Performance traces, network inspection, console errors, Lighthouse. npm v1.11.0, 7.9M dl/mo |
| **GitHub MCP (official)** | https://github.com/github/github-mcp-server | 33,791 | MIT | 2026-10-19 | `/plugin install github@claude-plugins-official` → `https://api.githubcopilot.com/mcp/` with `Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}` | Issues, PRs, code search, Actions runs, releases. Remote server preferred; local Docker/stdio fallback. Repo is now a Go module (`github.com/github/github-mcp-server/v2`) — v2.0.0 tag predates the module-path fix |
| **vercel-labs/agent-browser** | https://github.com/vercel-labs/agent-browser | 44,324 | Apache-2.0 | 2026-10-20 | `npm i -g agent-browser && agent-browser install` + `npx skills add vercel-labs/agent-browser` | CLI browser automation (~20 namespaced `browser__*` tools) instead of MCP. 1.2M skill installs. Useful when you want a browser *without* an MCP server in context |
| **Serena** | (bundled in official marketplace as `serena`) | — | MIT | — | `/plugin install serena@claude-plugins-official` → `uvx --from git+https://github.com/oraios/serena serena start-mcp-server` | LSP-based semantic code understanding. Not design, but it's the one that stops the agent guessing your codebase structure |

### 2.1 Figma alternatives (all verified live, all MIT unless noted)

| Repo | Stars | Last commit | Notes |
|---|---|---|---|
| https://github.com/GLips/Figma-Context-MCP | 16,020 | **2026-06-24** (3.5 months idle) | Local MCP using your own Figma PAT. Framer ecosystem origin. **Stale-ish** |
| https://github.com/southleft/figma-console-mcp | 2,565 | 2026-10-02 | "Your design system as an API" — bidirectional Figma⇄code, deterministic design-code-parity + a11y checks. `claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=... -- npx -y figma-console-mcp@latest` |
| https://github.com/grab/cursor-talk-to-figma-mcp | 7,063 | **2026-07-26** (~3 months idle) | Agent↔Figma, reads *and* modifies designs |
| https://github.com/awdr74100/figwright | 1,122 | 2026-10-19 | Free two-way Figma MCP, framework-aware code gen, push code back to canvas |
| https://github.com/gethopp/figma-mcp-bridge | 774 | 2026-10-11 | Figma plugin + MCP to **bypass API rate limits** |
| https://github.com/Jpisnice/shadcn-ui-mcp-server | 3,064 | 2026-10-03 | Community shadcn MCP (react/svelte5/vue/react-native). **Redundant** — the official `shadcn mcp init` is better maintained |
| https://github.com/Manavarya09/design-extract (`designlang`) | 4,271 | 2026-10-19 | Not Figma — **scrapes any website's design system** into DTCG tokens, emits a Next.js clone, scores fidelity vs the original, ships an MCP server (`npx designlang mcp`). npm v13.3.2 but only **4.4k downloads/mo** — very new, tiny adoption |
| https://github.com/marvkr/better-design | 502 | 2026-09-22 | Design MCP + 31 brand-grade shadcn themes (Linear, Stripe, Apple…) + shadcn registry. `npx skills add marvkr/better-design --skill better-design && npx better-design`. **Small and young** |
| https://github.com/nexu-io/open-design | 102,713 | 2026-10-20 | Local-first collaborative AI design workspace w/ MCP server + `DESIGN.md` token spec. Apache-2.0. 102k★ is suspiciously high for a design tool — treat the star count as suspect; the repo is real and pushed today |

---

## 3. Top plugins & marketplaces

### 3.1 Anthropic's own plugins (in `anthropics/claude-code/plugins/`, marketplace `claude-code-plugins`)

13 plugins, all in-repo at https://github.com/anthropics/claude-code/tree/main/plugins:

`frontend-design` ⭐ (design quality; auto-invoked skill, Apache-2.0) · `feature-dev` (7-phase
feature workflow + 3 agents) · `code-review` (5 parallel Sonnet agents, confidence scoring) ·
`pr-review-toolkit` (6 review agents: comments, tests, error handling, type design, code quality,
simplification) · `commit-commands` · `hookify` (write hooks from conversation patterns) ·
`security-guidance` (PreToolUse pattern warnings on 9 vuln classes) · `plugin-dev` (7 skills for
authoring plugins) · `mcp-server-dev` · `ralph-wiggum` (self-referential iteration loops) ·
`agent-sdk-dev` · `claude-opus-4-5-migration` · `explanatory-output-style` · `learning-output-style`.

Two of these are directly relevant to a frontend build: **`frontend-design`** (the "don't ship
generic AI aesthetics" skill — reads like a design director's brief) and **`feature-dev`**.

Also relevant, from `anthropics/claude-plugins-official` (315 plugins) — verified by parsing the
marketplace.json:
`figma` (design) · `context7` · `github` · `playwright` (testing) · `chrome-devtools-mcp` ·
`frontend-design` · `feature-dev` · `plugin-dev` · `pr-review-toolkit` · `hookify` ·
`security-guidance` · `claude-code-setup` ⭐ · `mcp-server-dev` · `mcp-tunnels` · `serena` ·
`browser-use` · `superdesign` (design) · `ui-theme-designer` (SAP, design) · `exa` · `firecrawl` ·
`tavily` · `vercel` · `mongodb` · `supabase` · `neon` · `prisma` · `cloudflare` · `grafana-mcp` ·
`datadog` · `sonarqube` · `terraform` · `atlassian-forge-skills` · `sanity` · `mapbox`.

**`claude-code-setup`** is the single most on-brief tool for "what should I set up before starting":
a read-only skill that scans your codebase and recommends the top 1–2 automations in each of
MCP servers / skills / hooks / subagents / slash commands. It literally names context7 and
Playwright as the MCP picks for a frontend project.

### 3.2 Community marketplaces

| Marketplace | Repo | Stars | Lic. | Last commit | Size | Install |
|---|---|---|---|---|---|---|
| `claude-code-workflows` | https://github.com/wshobson/agents | 41,223 | MIT | 2026-10-19 | **94 plugins** (202 agents, 185 skills, 105 commands) | `/plugin marketplace add wshobson/agents` → `/plugin install python-development@claude-code-workflows` |
| `superpowers-marketplace` | https://github.com/obra/superpowers-marketplace | 1,303 | MIT | 2026-10-10 | 10 plugins | `/plugin marketplace add obra/superpowers-marketplace` |
| `ecc` | https://github.com/affaan-m/ECC | **284,543** | MIT | 2026-10-20 | 1 plugin, ~170+ contributors | `/plugin marketplace add affaan-m/ECC` → `/plugin install ecc@ecc` |
| `addy-agent-skills` | https://github.com/addyosmani/agent-skills | 108,832 | MIT | 2026-10-13 | 25 skills | `/plugin marketplace add addyosmani/agent-skills` → `/plugin install agent-skills@addy-agent-skills` |
| `thedotmack` | https://github.com/thedotmack/claude-mem | 101,909 | Apache-2.0 | 2026-10-20 | 2 plugins | `/plugin marketplace add thedotmack/claude-mem` → `/plugin install claude-mem@thedotmack` |
| `ponytail` | https://github.com/DietrichGebert/ponytail | 168,908 | MIT | 2026-10-18 | 1 plugin, 6 skills + hook | `/plugin marketplace add DietrichGebert/ponytail` |
| `caveman` | https://github.com/JuliusBrussee/caveman | 113,786 | Apache-2.0 | 2026-10-19 | 1 plugin | `/plugin marketplace add JuliusBrussee/caveman` |
| `open-design` | https://github.com/nexu-io/open-design | 102,713 | Apache-2.0 | 2026-10-20 | 1 plugin (MCP server) | `/plugin marketplace add nexu-io/open-design` |
| `openskills` | https://github.com/openskillsapp/skills | — | — | — | 1 plugin | `/plugin marketplace add openskillsapp/skills` |
| `claude-community` | https://github.com/anthropics/claude-plugins-community | 4,700 | Apache-2.0 | 2026-10-20 | **2,283 plugins** | `/plugin marketplace add anthropics/claude-plugins-community` |

**Caveat on `claude-community`:** 2,283 plugins means a lot of unreviewed surface. Anthropic's own
README warns: *"Make sure you trust a plugin before installing... Anthropic does not control what
MCP servers, files, or other software is included in plugins."* Community plugins run hooks and
MCP servers **with your user privileges**.

### 3.3 Curated lists (verified)

| Repo | Stars | Lic. | Last commit | Notes |
|---|---|---|---|---|
| https://github.com/hesreallyhim/awesome-claude-code | 56,081 | **CC BY-NC-ND 4.0** (NOASSERTION) | 2026-10-20 | The canonical list. Structured sections: *Start Here*, *From Anthropic*, *Documentation*, *Observability*, *Configuration*, *Testing*, *Linting*, *Multi-Purpose*. **Non-commercial, no-derivatives** — you can read it, you can't fork it into a product |
| https://github.com/VoltAgent/awesome-agent-skills | 36,052 | MIT | 2026-10-19 | 1000+ skills from official dev teams |
| https://github.com/davila7/claude-code-templates | 32,779 | MIT | 2026-10-20 | CLI for configuring/monitoring Claude Code (aitmpl.com) — agent + subagent + command templates |
| https://github.com/VoltAgent/awesome-claude-code-subagents | 25,887 | MIT | 2026-10-11 | 100+ specialised subagents |
| https://github.com/Piebald-AI/claude-code-system-prompts | 12,948 | MIT | 2026-10-19 | All parts of Claude Code's system prompt + tool descriptions — for auditing what the model actually sees |

---

## 4. AGENTS.md / CLAUDE.md templates

### 4.1 The AGENTS.md standard

| Repo | Stars | Lic. | Last commit | Notes |
|---|---|---|---|---|
| https://github.com/agentsmd/agents.md | 25,012 | MIT | 2026-09-10 | **The standard itself.** The canonical example is three sections: *Dev environment tips*, *Testing instructions*, *PR instructions* — all concrete commands, no prose. The repo's own `AGENTS.md` is a great reference: "always use `npm run dev`, **do not** run `npm run build` inside the agent session" |
| https://github.com/agentskills/agentskills | 26,322 | Apache-2.0 | 2026-08-09 | The **specification** (now hosted at agentskills.io/specification): directory structure, `SKILL.md` frontmatter fields (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`), progressive disclosure, `scripts/`, `references/`, `assets/` |

**Critical 2026 behaviour change (verified in `code.claude.com/docs/en/memory`):**

Claude Code **reads `AGENTS.md` natively** as of **v2.1.277+**, but the default
`instructionFiles` setting is **`claude-md-or-agents-md`** — i.e.:

> Claude reads `AGENTS.md` **only when there is no `CLAUDE.md` or `CLAUDE.local.md`** in your working directory or any directory above it.

| You have | Claude loads |
|---|---|
| `AGENTS.md` only | `AGENTS.md` |
| `AGENTS.md` + `CLAUDE.md` (or `CLAUDE.local.md`) | **only `CLAUDE.md`** |
| `CLAUDE.md` importing `@AGENTS.md` | `CLAUDE.md` with `AGENTS.md` inlined |

To get both, set **Project instructions** to `claude-md-and-agents-md` (in `/config`, or via
`pluginConfigs["cc-plugin-agents-md@builtin"].options.instructionFiles` in `~/.claude/settings.json`
— note: only the *user* settings file is read for this). Before v2.1.285 the plugin ID was
`agents-md@builtin`. `InstructionsLoaded` hooks **do not fire** for an `AGENTS.md` read via the
setting (they do fire for an imported/symlinked one). Also: `~/.claude/CLAUDE.md` and
`.claude/rules/` do **not** suppress `AGENTS.md` loading.

**Practical consequence:** if you want one instruction file that works across Claude Code, Codex,
Cursor, Gemini CLI and OpenCode, use `AGENTS.md` — but do **not** also drop a `CLAUDE.md` in the same
tree, or the `AGENTS.md` silently stops loading.

### 4.2 CLAUDE.md templates

| Template | Repo | Stars | Lic. | Last commit | Install |
|---|---|---|---|---|---|
| **Karpathy behavioural CLAUDE.md** | https://github.com/multica-ai/andrej-karpathy-skills | **221,408** | none | **2026-04-20** (6 months idle) | `curl -o CLAUDE.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md` |
| **gstack** (Garry Tan / YC) | https://github.com/garrytan/gstack | 137,034 | MIT | 2026-10-20 | `git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup` |
| **mattpocock/skills** | https://github.com/mattpocock/skills | 298,228 | MIT | 2026-10-19 | `npx skills@latest add mattpocock/skills` (include `setup-matt-pocock-skills`) |
| **addyosmani/agent-skills** | https://github.com/addyosmani/agent-skills | 108,832 | MIT | 2026-10-13 | `npx skills add addyosmani/agent-skills` |
| **steipete/agent-rules** | https://github.com/steipete/agent-rules | 5,677 | MIT | 2026-04-27 | ⚠️ **ARCHIVED** — do not use |

The Karpathy file (~70 lines) encodes four rules: *Think Before Coding, Simplicity First, Surgical
Changes, Goal-Driven Execution.* **Attribution matters:** Forrest Chang derived it from Karpathy's
public post; **Karpathy did not write it**. Note the repo was renamed/redirected —
`forrestchang/andrej-karpathy-skills` now resolves to `multica-ai/andrej-karpathy-skills`, and the
older curl URL in many guides still 301s. It also has **no license file**.

gstack is the most interesting for a *design* build: 23 slash commands organised as a virtual
engineering team, including `/design-consultation`, `/design-shotgun`, `/design-html`,
`/design-review`, `/plan-design-review`.

---

## 5. Hooks, statusline, slash-command packs

### 5.1 Hook systems

Claude Code's hook surface is much bigger than the old 8-event list — the current reference
(`code.claude.com/docs/en/hooks`) documents a full lifecycle: `SessionStart`/`SessionEnd`,
`UserPromptSubmit`/`UserPromptExpansion`, `PreToolUse` → `PermissionRequest` → `PostToolUse`
(+`PostToolUseFailure`, `PostToolBatch`), `SubagentStart`/`SubagentStop`, `TaskCreated`/`TaskCompleted`,
`Stop`/`StopFailure`, `TeammateIdle`, `PreCompact`/`PostCompact`, `Elicitation`/`ElicitationResult`,
`PermissionDenied`, `WorktreeCreate`/`WorktreeRemove`, `Notification`, `ConfigChange`,
`InstructionsLoaded`, `CwdChanged`, `FileChanged`, `DirectoryAdded`, `PreModelSwitch`/`PostModelSwitch`,
`MessageDisplay`. Handlers can be shell commands, **HTTP endpoints, MCP tool calls, LLM prompts, or
subagents** — not just shell scripts.

| Tool | Repo | Stars | Last commit | Notes |
|---|---|---|---|---|
| **`hookify`** (official) | https://github.com/anthropics/claude-code/tree/main/plugins/hookify | in `claude-code` (152,887★) | 2026-10-19 | `/plugin install hookify@claude-plugins-official`. Turns "a correction you keep repeating" into a rule. Commands `/hookify`, `/hookify:list`, `/hookify:configure` + a `conversation-analyzer` agent + `writing-rules` skill |
| **`security-guidance`** (official) | https://github.com/anthropics/claude-code/tree/main/plugins/security-guidance | ↑ | 2026-10-19 | PreToolUse hook monitoring 9 patterns (command injection, XSS, `eval`, dangerous HTML, pickle deserialization, `os.system`…) + LLM diff review on Stop + commit reviewer |
| **`disler/claude-code-hooks-mastery`** | 3,945 | none | **2026-02-01** (8 months idle) | The best-written hook reference, but **stale** and unlicensed |
| **superpowers hooks** | https://github.com/obra/superpowers | 302,439 | 2026-10-20 | `hooks/hooks.json` + `hooks/session-start` — injects methodology at session start |
| **`claude-code-setup`** | official marketplace | — | 2026-10-20 | Recommends hooks (auto-format, auto-lint, block sensitive files) after reading your repo |

### 5.2 Statusline

| Tool | Repo | Stars | Lic. | Last commit | Install | npm |
|---|---|---|---|---|---|---|
| **ccstatusline** | https://github.com/sirmalloc/ccstatusline | 13,349 | MIT | 2026-10-19 | `npx -y ccstatusline@latest` (TUI; choose "Pinned global install" to pin the version) | v2.2.32, **147,766 dl/mo** |

The de-facto statusline tool. TUI config at `~/.config/ccstatusline/settings.json`; widgets for
model, git branch, token usage, cache timer, cost. **Gotcha found in its own docs:** *"Claude Code
only runs the status line command in trusted workspaces, and nested git repositories stopped
inheriting trust in Claude Code 2.1.232"* — if your statusline is blank in a subfolder, that's why.
Alternatives (all verified to exist, all far smaller): `nilbuild/claude-statusline` (1,398★, MIT,
last commit 2026-04-03), `Haleclipse/CCometixLine` (3,476★, Rust, last commit 2026-03-14),
`chongdashu/cc-statusline` (646★).

### 5.3 Slash-command packs (official)

`commit-commands` (`/commit`, `/commit-push-pr`, `/clean_gone`) · `feature-dev` (`/feature-dev`) ·
`code-review` (`/code-review`) · `pr-review-toolkit` (`/pr-review-toolkit:review-pr`) ·
`plugin-dev` (`/plugin-dev:create-plugin`) · `hookify` · `ralph-wiggum` (`/ralph-loop`) ·
`agent-sdk-dev` (`/new-sdk-app`).

Community: **gstack** (`/design-review`, `/plan-design-review`, `/ship`, `/qa`, `/retro`) ·
**mattpocock/skills** (`/diagnose`, `/grill-with-docs`, `/triage`, `/implement`, `/handoff`) ·
**addyosmani/agent-skills** (`interview-me` — requirements interrogation one question at a time).

---

## 6. "Best tool before starting a project" — what the community publishes

Two guides worth reading in full (both verified live, and both correct about the *layer* model):

1. **buildthisnow.com — "The 10 Best .claude/ Setups in 2026"** (written 2026-05-15, updated
   2026-06-14). Four-layer model: behaviour (CLAUDE.md) / skill / methodology / memory. Its
   "5-minute baseline" is: Karpathy CLAUDE.md → `anthropics/skills` → `superpowers`. Its advice
   that old guides telling you to `git clone` into `~/.claude/` are outdated is **confirmed by
   Anthropic's current docs** — marketplace is the recommended path.
2. **openskills.app/best/claude-code-plugins** (updated October 2026). 12 hand-picked plugins;
   it explicitly says *"We have not yet tested these plugins first-hand"* and picks on
   checkable criteria: usage, maintenance, manifest contents. Its ordering: Superpowers →
   feature-dev → code-review → pr-review-toolkit → commit-commands → skill-creator → hookify →
   security-guidance → plugin-dev → context7 → claude-mem → ECC. It repeats Anthropic's warning
   that an enabled plugin costs context in **every** session.

Also: **Anthropic's own best-practices page** (`code.claude.com/docs/en/best-practices`) orders
setup as: verify work → explore/plan/code → specific context → configure environment → effective
CLAUDE.md → permissions → CLI tools → MCP → hooks → skills → subagents → plugins.

---

## 7. DECISION TABLE

### 7.1 "If you are building X, reach for Y because Z"

| If you are building… | Reach for | Because | Verified install |
|---|---|---|---|
| **Anything, first day** | Karpathy CLAUDE.md + `superpowers` + `anthropics/skills` | Behaviour + methodology + skill layers; three different jobs, minimal overlap | curl + `/plugin install superpowers@claude-plugins-official` + `/plugin marketplace add anthropics/skills` |
| **A React / Next.js UI** | `shadcn` **skill** (`npx skills add shadcn/ui`) + `context7` MCP | The skill makes the agent read your `components.json` (aliases, base library, Tailwind version) so generated code actually compiles; context7 stops it hallucinating a Radix API that moved | `npx skills add shadcn/ui` · `/plugin install context7@claude-plugins-official` |
| **A UI with distinctive art direction** | `frontend-design` plugin (official) or `superdesign` | Both explicitly target "don't ship generic AI aesthetics"; `frontend-design` is Anthropic-maintained and Apache-2.0 | `/plugin install frontend-design@claude-plugins-official` |
| **From an existing Figma file** | Figma MCP (official) via the plugin | Only official route to variables/components/Code Connect; write-to-canvas included | `/plugin install figma@claude-plugins-official` |
| **From a competitor's / any website** | `designlang` (`npx designlang <url>`) | Only tool that extracts a full design system (DTCG tokens) + emits a clone + scores fidelity | `npx designlang https://stripe.com` |
| **From a screenshot / no source of truth** | `marvkr/better-design` (31 brand-grade shadcn themes) | Gives you a *starting* visual system instead of a blank canvas | `npx skills add marvkr/better-design --skill better-design && npx better-design` |
| **Anything that renders in a browser** | Playwright MCP **or** `agent-browser` | Playwright = MCP-native (27.9M dl/mo, Microsoft-maintained); agent-browser = CLI, no MCP context cost | `/plugin install playwright@claude-plugins-official` · `npm i -g agent-browser && agent-browser install` |
| **Anything performance- or a11y-sensitive** | Chrome DevTools MCP | Only one of these gives you traces, network waterfall, console errors, Lighthouse | `/plugin install chrome-devtools-mcp@claude-plugins-official` |
| **A PR-heavy team workflow** | `code-review` + `pr-review-toolkit` + `commit-commands` | Confidence-scored parallel review agents first, then per-aspect deep review | `/plugin install code-review@claude-plugins-official` etc. |
| **A codebase with >50k LOC** | `serena` MCP (LSP semantics) | Stops the agent `grep`-ing its way through structure | `/plugin install serena@claude-plugins-official` |
| **A project that spans sessions** | `claude-mem` (or `episodic-memory` from superpowers-marketplace) | Only the memory layer carries context across sessions; everything else resets | `/plugin marketplace add thedotmack/claude-mem` → `/plugin install claude-mem@thedotmack` |
| **Multi-harness work (Claude + Codex + Cursor + OpenCode)** | `npx skills add` (not git clone) | One install fans out to 75+ agents via `.agents/skills/` + symlinks; `git clone` does not | `npx skills add mattpocock/skills` |
| **Team sharing** | A marketplace with `project` scope | Committing `enabledPlugins` to `.claude/settings.json` enables it for collaborators, but each must run `claude plugin install … --scope project` once | `/plugin marketplace add <org>/<repo>` |
| **Scientific / data work** | `K-Dense-AI/scientific-agent-skills` (53,169★, MIT) | Domain skill library, not a generic framework | `npx skills add K-Dense-AI/scientific-agent-skills` |
| **Building your own plugin** | `plugin-dev` + `mcp-server-dev` (official) | Anthropic's own 7-skill toolkit; `mcp-server-dev` covers remote-HTTP/MCPB/local deployment models | `/plugin install plugin-dev@claude-plugins-official` |
| **"What should I even install?"** | `claude-code-setup` (official) | Read-only skill that scans the repo and recommends top-1/2 per category — this question, answered by the vendor | `/plugin install claude-code-setup@claude-plugins-official` |

### 7.2 Layer cheat-sheet (which layer are you missing?)

| Layer | Question it answers | Canonical tool |
|---|---|---|
| **Behaviour** | "Why does it over-engineer / ignore my patterns?" | `CLAUDE.md` / `AGENTS.md` (Karpathy file) |
| **Skill** | "How does it know how to do *this specific thing*?" | `npx skills add` + `anthropics/skills` + `shadcn/ui` skill |
| **Methodology** | "Why did it ship code without tests?" | `superpowers` (or ECC / gstack) |
| **Memory** | "Why did it forget everything from last session?" | `claude-mem` / `episodic-memory` |
| **Ground truth** | "Why is it using an API that changed 4 months ago?" | `context7` |
| **Verification** | "How do we know it works?" | Playwright MCP + Chrome DevTools MCP |

---

## 8. PITFALLS — what looks good but is stale, conflicting, or a trap

### 8.1 Stale or archived

| Thing | Reality |
|---|---|
| **`steipete/agent-rules`** (5,677★) | **ARCHIVED** (last commit 2026-04-27). Still surfaces in "awesome lists". Don't use |
| **`executeautomation/mcp-playwright`** (5,669★) | Last commit **2025-12-13** — 10 months stale. Microsoft's `microsoft/playwright-mcp` (38,411★, pushed 2026-10-19) superseded it. Don't pick the community one for new work |
| **`disler/claude-code-hooks-mastery`** (3,945★) | Last commit **2026-02-01**, **no license**. Still the best *written* hook guide, but its event list predates the current hook lifecycle. Read it, don't clone it |
| **`humanlayer/12-factor-agents`** (26,801★) | Last commit **2025-09-21** — 13 months idle. Still excellent as *principles*, but it is a book, not a tool, and the agent-pattern taxonomy it describes has moved on |
| **`multica-ai/andrej-karpathy-skills`** (221,408★) | Last commit **2026-04-20** — 6 months idle, **no license**. It's one 70-line file so staleness barely matters, but the missing license is a real problem for commercial use |
| **`GLips/Figma-Context-MCP`** (16,020★) | Last commit 2026-06-24. Fine but idle; the official Figma MCP has caught up and has write-to-canvas |
| **`grab/cursor-talk-to-figma-mcp`** (7,063★) | Last commit 2026-07-26 — ~3 months idle |
| **`idosal/git-mcp`** (8,472★) | Last commit 2026-05-08. Cute idea (read any repo's docs via MCP) but the GitHub MCP already covers it |
| **`anthropics/claude-code-security-review`** (6,456★) | Last commit 2026-02-11 — 8 months idle. And the **`security-guidance` plugin inside `anthropics/claude-code` is actively maintained** — prefer the plugin |
| **`forrestchang/andrej-karpathy-skills`** | The URL in most guides **redirects** to `multica-ai/andrej-karpathy-skills`. Old URLs work; old `git clone` instructions point at a moved repo |
| **`codex-team/codex`** | 26★ — a *website* repo, not the OpenAI Codex CLI. Easy to grab by mistake |

### 8.2 Conflicting / overlapping — pick ONE

**The methodology layer is the worst offender.** Installing more than one is actively harmful:
- `superpowers` (302k★) vs `affaan-m/ECC` (284k★) vs `gstack` (137k★) vs `mattpocock/skills` (298k★)
  vs `addyosmani/agent-skills` (108k★) — all impose a *process*, and they disagree about what that
  process is. ECC even ships "instincts" and "continuous learning" that fight Superpowers'
  TDD gate.
- **ECC's `superpowers-dev` plugin explicitly warns: "YOU MUST UNINSTALL OTHER VERSIONS OF
  SUPERPOWERS BEFORE INSTALLING THIS."** That's the maintainers telling you the conflict is real.

**Memory layer:** `claude-mem` (101,909★) vs `episodic-memory` (obra) vs `agentmemory`
(`@agentmemory/agentmemory` v0.9.30, Apache-2.0) vs `open-design`'s own memory — four ways to
persist context, each injecting its own retrieval into your context window. Choose one.

**Browser layer:** Playwright MCP vs Chrome DevTools MCP vs `browser-use` vs `agent-browser` vs
`superpowers-chrome` — five ways to drive a browser. Playwright (automation) + DevTools
(diagnostics) is a defensible pair; adding a third is redundant.

**Design layer:** `figma` (official plugin) vs `figma-console-mcp` vs `figwright` vs
`figma-mcp-bridge` vs `Figma-Context-MCP` vs `designlang` vs `better-design` vs `open-design`.
These are not interchangeable: Figma MCP reads *your* Figma files; `designlang` extracts from *any*
website; `better-design` supplies *themes*; `open-design` is a *workspace*. Most projects need at
most two.

**Context7 duplication:** it installs as an MCP server *or* as a `ctx7` CLI + skill. Running both
duplicates every doc lookup in context.

### 8.3 Licensing traps

| Repo | Problem |
|---|---|
| **`anthropics/skills`** | No root LICENSE. Per-skill: Apache-2.0 for most, **proprietary "© Anthropic, PBC"** for `docx`/`pdf`/`pptx`/`xlsx`, and `doc-coauthoring` has **no license file at all** |
| **`hesreallyhim/awesome-claude-code`** | **CC BY-NC-ND 4.0** — non-commercial, no derivatives. You may read it; you may not fork it into a product or use it commercially |
| **`anthropics/claude-code`** | **Proprietary** — "© Anthropic PBC. All rights reserved. Subject to Commercial ToS." The *plugins* inside it are separately licensed (e.g. `frontend-design` is Apache-2.0), but the repo isn't OSS |
| **`anthropics/claude-plugins-official`** | Apache-2.0 ✅ — but the *plugins* it lists point at third-party repos with their own licenses. Check per-plugin |
| **`modelcontextprotocol/servers`** | Mid-transition MIT → Apache-2.0; API reports NOASSERTION. It's also **reference implementations, explicitly "not production-ready"** per its own README |
| **`multica-ai/andrej-karpathy-skills`**, **`disler/claude-code-hooks-mastery`**, **`figma/mcp-server-guide`**, **`vercel-labs/agent-skills`** | **No license file** — default copyright, no grant to reuse |
| **`mattpocock/skills`** | MIT ✅ but it's a *personal* pack with opinions; read before adopting wholesale |
| **`garrytan/gstack`** | MIT ✅ but ships 23 slash commands that assume a solo-founder workflow |

### 8.4 Context / performance traps

- **Every enabled plugin taxes every session.** Anthropic's docs: *"for each skill, agent, and
  command that Claude can invoke on its own, the name and description are in Claude's context on
  every turn."* A 20-plugin stack is a permanent context tax. The `/plugin` UI shows a **Context
  cost** estimate before install — use it. `claude plugin disable` turns one off without
  uninstalling.
- **The `claude-community` marketplace has 2,283 plugins.** Installing a random one runs its hooks
  and MCP servers with your user privileges. Anthropic's own README: *"Make sure you trust a plugin
  before installing, updating, or using it."*
- **MCP output floods context.** Cap it: `export MAX_MCP_OUTPUT_TOKENS=50000`. Tool descriptions
  are capped at ~2KB per server; large results need the `maxResultSizeChars` annotation (up to 500K).
- **Skills are not free either.** A skill's name+description sit in context once installed; the
  body loads only when invoked. That is why `npx skills add` installing *all* 15 Superpowers skills
  globally is fine, but copying 200 skill files into a repo is not.
- **`--bare` exists.** `claude --bare -p …` skips hooks, plugins, MCP discovery, and CLAUDE.md
  loading. Use it for CI and for measuring the *real* cost of your stack.

### 8.5 Correctness traps in the install patterns themselves

- **`/plugin` is interactive-only.** `claude -p` / CI / Agent SDK: `/plugin` replies *"/plugin isn't
  available in this environment."* Use `claude plugin install <name>@<marketplace>` from the shell
  instead.
- **Project scope ≠ installed.** Committing `enabledPlugins` to `.claude/settings.json` turns the
  plugin on for collaborators but **does not download it** — each teammate must run
  `claude plugin install <name>@<marketplace> --scope project` once.
- **`CLAUDE.local.md` silently kills `AGENTS.md`.** Because `claude-md-or-agents-md` counts
  `CLAUDE.local.md` as a CLAUDE.md, adding one to a repo that relies on `AGENTS.md` stops Claude
  reading the `AGENTS.md`. Set `instructionFiles: "claude-md-and-agents-md"` if you want both.
- **Plugin names are immutable.** Renaming a marketplace entry breaks installs with
  `plugin-not-found`. Use `displayName` or the `renames` map.
- **`npx skills add` installs to *every* detected agent.** If you only want Claude Code, use
  `-a claude-code`. It also **symlinks** by default — `--copy` if your agent directory must be
  self-contained.
- **`npx skills add <repo>` with no `-s` installs everything.** Always preview with `--list` first;
  use `--skill <name>` for surgical installs.
- **`npx skills add` writes `skills-lock.json`.** Commit it — that's how `skills update` and
  `experimental_install` restore state.
- **Figma MCP seat limits.** Starter / View / Collab seats get **6 tool calls per month**. If you're
  on a cheap seat you are one screenshot away from being cut off. Verify your seat type first.
- **Statusline blank in a subfolder?** Claude Code 2.1.232 stopped nested git repos inheriting
  workspace trust, and statuslines only run in trusted workspaces. Not a bug in your config.

### 8.6 Third-party / commercial overlays to be careful with

- `anthropics/claude-plugins-official` includes **partner plugins that route your data to vendors**
  (42Crunch, BrightData, Tavily, Exa, Firecrawl, Atlassian, Notion-adjacent, Vanta, SonarQube…).
  They install MCP servers that hold your API keys and see your code. Audit `.mcp.json` per plugin.
- `nexu-io/open-design` and `marvkr/better-design` both have a hosted/paid tier (API keys, credits).
  The open-source parts are MIT/Apache-2.0; the hosted MCP endpoints are not.
- `davila7/claude-code-templates` (aitmpl.com) carries Z.AI / Neon / Vercel sponsorship badges —
  the code is MIT but the site is a funnel.

---

## 9. The 10-minute, 4-command setup I'd actually ship

```bash
# 1. Behaviour — one file at repo root
curl -o CLAUDE.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md

# 2. Skills — harness-agnostic, fans out to Claude Code + everything else
npx skills add anthropics/skills --skill frontend-design
npx skills add shadcn/ui                              # only if you use shadcn
npx skills add vercel-labs/agent-skills --skill web-design-guidelines

# 3. Inside a Claude Code session:
/plugin marketplace add anthropics/skills
/plugin install superpowers@claude-plugins-official   # methodology
/plugin install context7@claude-plugins-official      # ground truth
/plugin install playwright@claude-plugins-official    # verification
/plugin install figma@claude-plugins-official         # only if designs exist

# 4. Statusline (optional, cheap, big QoL win)
npx -y ccstatusline@latest
```

Then, once, in a fresh session: ask Claude *"what should I set up for this repo?"* with
`claude-code-setup` installed — it will read the repo and tell you what you actually missed.

---

## 10. Verification notes

- **All GitHub numbers** came from `gh api repos/<owner>/<repo>` on 2026-10-20 16:56–17:27 EEST.
  Cached responses in `ghcache/` for re-checking.
- **Every repo listed in a table was confirmed to exist** (no 404s remain; repos that 404'd during
  research and were replaced: `snoobdog/ccstatusline` → `sirmalloc/ccstatusline`;
  `ComposioHQ/awesome-claude-code-skills` → `VoltAgent/awesome-agent-skills`;
  `shadcn-ui/mcp` → `Jpisnice/shadcn-ui-mcp-server` (and the *official* shadcn MCP, which is not a
  repo — it's `shadcn mcp init`).
- **Install commands were verified by reading the repo's own README/marketplace.json**, not from
  memory. `npx skills add …` was executed locally (dry-run and a real global install, since
  cleaned up). `shadcn mcp init --client claude` was executed and the resulting `.mcp.json` inspected.
- **Plugin counts** for `claude-plugins-official` (315) and `claude-community` (2,283) come from
  parsing each repo's live `.claude-plugin/marketplace.json`.
- **Licenses** come from the GitHub API *and* from reading the actual `LICENSE`/`LICENSE.txt` file,
  because the API reports `NOASSERTION` for several repos whose real license is a specific
  non-SPDX one (CC BY-NC-ND, proprietary).
- **Not verified:** no tool in this document was installed into a real Claude Code session, because
  the `claude` CLI is not installed on this machine (`claude: command not found`). The plugin
  *mechanics* are taken from Anthropic's current documentation at `code.claude.com/docs/en/plugins*`
  plus the literal contents of each marketplace.json and plugin manifest. The `skills` CLI *was*
  exercised for real.
- `claude-code` is at npm v2.1.304 as of 2026-10-19; the `AGENTS.md` behaviours cited require
  **v2.1.277+** (and v2.1.285+ for the `cc-plugin-agents-md` settings key).
