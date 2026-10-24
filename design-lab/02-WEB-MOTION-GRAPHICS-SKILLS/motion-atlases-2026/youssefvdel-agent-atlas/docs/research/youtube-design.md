# YouTube: AI Design, Claude Code Skills & Polished AI-Generated UI

**Compiled:** 2026-10-20 (Africa/Cairo) · **Method:** every video ID below was fetched with
`fetch_transcript.py` and returned a **non-empty** transcript (segment counts shown). Metadata
(view count, likes, upload date, duration) was pulled live via `yt-dlp --dump-single-json` on
2026-10-20. No video in this list is unverified.

**Corpus:** 80 verified videos across 11 topic queries. Ranked by **practical value**, not views —
a 3-minute Anthropic explainer outranks a 1.3M-view generic "build an app" video because it
teaches a mechanism rather than a demo.

---

## The 10 most useful things these videos teach

### 1. The skill model is progressive disclosure — that is why skills beat CLAUDE.md
`fOxC44g8vig` (Anthropic), `bjdBVZa66oU` (Anthropic), `tol7eILAF8w`, `7Z-t3njCjyk`, `TzJecWCbex0`

At session start Claude loads **only** the `name` + `description` of every installed skill
(~30–50 tokens each). The full `SKILL.md` loads only when a prompt semantically matches the
description; referenced scripts/assets load on demand. Verify what is actually loaded with
`/context` (skill front matter is always present; MCP tools are muted to save context).
Consequence taught repeatedly: **keep `CLAUDE.md` short and put repeated workflow instructions in
a skill**, so the two don't fight for the same budget.

**The scope hierarchy:** enterprise → personal `~/.claude/skills` (all projects) → project
`.claude/skills` → plugin. A skill is *one markdown file*; a *plugin* is a bundle of skills plus
hooks and MCP servers.

### 2. The single highest-leverage install: the `front-end-design` skill
`Q9ty3eopOPs`, `f2FnYRP5kC4`, `Iup1WlUyj9M`, `Em9EzurouOU`, `95_NJ-a-CMQ`, `jT5YdajTg6I`

It is a **plain markdown file** (open source in `anthropics/claude-code` even though Claude Code
itself is closed). Its body forces a design-thinking pass — **purpose, tone, constraints,
differentiation** — then typography, color, motion, spatial composition, atmosphere — and it
**explicitly bans** what the authors call AI slop:

> "Never use generic AI generated aesthetics like overused font families like Roboto, Inter, Arial,
> system fonts, cliched color schemes, particularly purple gradients on white backgrounds,
> predictable layouts and component patterns… Interpret creatively and make unexpected choices."
> — *"Bold maximalism and refined minimalism both work. The key is intentionality, not intensity."*

Install (the pattern repeated across videos): download
`skills/frontend-design/SKILL.md` from the `anthropics/claude-code` repo → drop it in
`~/.claude/skills/<your-name>/SKILL.md` → restart Claude → `/skills` to verify → invoke as
`/your-name`. Or via the CLI: `npx skills add <owner>/<repo>`.

**The counter-intuitive result** (`f2FnYRP5kC4`, 6-agent bake-off across Gemini 3 Pro, Opus 4.5
and GPT-5.2): raw design ranking was Opus 4.5 **worst** → GPT-5.2 → Gemini → and Opus **best**
once the skill is loaded. *The skill, not the model, is what supplies taste.*

### 3. Give the agent eyes: Playwright MCP / Chrome DevTools MCP
`xOO8Wt_i72s` (Patrick Ellis), `pSritFeoYFo` (Matt Pocock), `f2FnYRP5kC4`

The single biggest unlock for design quality. Coding agents currently use only the **text** side of
their multimodality — they cannot see their own output. Two mechanisms:

- **Playwright MCP** — screenshots (incl. full-page), browser console + network logs, viewport /
  iOS emulation, click-and-fill navigation to reproduce states, accessibility audits, and scraping
  reference URLs for inspiration.
- **Chrome DevTools MCP** — Matt Pocock's setup is two files: an `.mcp.json` running the server
  against a running browser URL, plus a one-line skill: *"Before using Chrome DevTools MCP, you
  must launch Chrome in headless mode with remote debugging enabled."*

Repos: `github.com/ChromeDevTools/chrome-devtools-mcp`, `github.com/remorses/playwriter`,
`github.com/SawyerHood/dev-browser`, `github.com/OneRedOak/claude-code-workflows`.

### 4. The "orchestration layer" — context + tools + a fixed validator
`xOO8Wt_i72s`, `1PXFAFMgdns`, `g3X8JauSWTM`

Claude Code needs three things, and most setups supply only the first:
1. **Context** — well-written prompts, docs, `CLAUDE.md`, competitor references.
2. **Tools** — Playwright/shadcn-MCP for actions and ground truth.
3. **Validation** — a *fixed spec* (UI mock, style guide, design system, examples of good **and
   bad** outcomes) to iterate against.

That produces the **iterative agentic loop**: read spec → screenshot own work → diff against spec →
edit → repeat. This replaces five rounds of "change this, change this" prompting with one
kick-off. FreeCodeCamp's 64-minute course (`g3X8JauSWTM`) applies it as five explicit steps:
collect context first → clone a proven UI architecture → build your own version → restyle with
skills/tools → add Apple-style scroll animations → deploy to Cloudflare.

### 5. Show, don't describe: reverse-engineering beats prompt-writing
`57FpQnLTEBY` (Ben AI), `Q9ty3eopOPs`

Anthropic's own guidance, quoted in the video: **"Examples convey the desired style and level of
detail to Claude more clearly than descriptions alone."** So instead of describing how to do a
task, hand Claude a finished good output and let it reverse-engineer the process. The `reverse-
engineer-anything` repo (`github.com/morluto/rea`, 200k+ stars in one week) generalizes this: it
gives agents security-researcher tooling to study how an app *behaves* (not its code) so the agent
can rebuild and test a matching version. The same principle applies to authoring skills — a skill
can carry an exemplar instead of prose steps.

### 6. Vendor skills on demand: the `skills` CLI + `npx skills add`
`rcRS8-7OgBo`, `14RP8liACqo`, `u2QqWkMv3Lg`, `m-gIqQTHcAY`

`skills.sh` (Vercel) is the CLI for discovering and installing skills. Verified commands captured
in transcripts:

```bash
npx skills add <owner>/<repo>     # e.g. anthropics/skills
npx skills add clerk
npx skills add prisma
npx skills add liveblocks
npx skills add trigger.dev
npx skills add betterauth
npx skills add shadcn/ui
npx skills initialize
```

Inside Claude Code: `/plugin install skill-creator`, `/skills` (list, with scope and token cost),
`/find-skills` (in-CLI marketplace — Matt Pocock's *Grill Me* alone shows ~150k installs).

### 7. Concrete skill recipes worth copying
`tol7eILAF8w`, `EJyuu6zlQCg`, `7Z-t3njCjyk`, `Ik-Xbz2hvM0`

- **Front matter** = `name` (becomes the slash command) + `description` (drives auto-load) +
  `allowed-tools` (scopes permissions) + optional `when_to_use`, `model`, and reasoning `effort`
  (`low`/`medium`/`high`/`xhigh`/`max` — use high effort for planning skills). String
  substitution (`$ARGUMENTS`-style) parameterizes a skill.
- **Body pattern** — a skill that *asks* rather than asserts: *"ask questions, explore the
  repository, interview the user, sketch the major modules"* plus *"You might skip steps if you
  don't consider them necessary."*
- **`grill-me`** — Claude interviews *you* with challenging questions about edge cases,
  assumptions and trade-offs before any code is written. Widely cited as the single best skill.
- **`prd` → `prd-to-issues`** — one skill produces a PRD; the next breaks it into independently
  grabbable **vertical-slice GitHub issues** that reference the parent, which an agent loop then
  works issue-by-issue.
- **Example front matter from `tol7eILAF8w`:**
  `name: code-review` · `description: "Review code for quality issues. Use when reviewing PRs,
  checking for bugs, or validating implementation before merging."` · body: *"Stage changes using
  `git diff --cached`, write a commit message following conventional commit."*
- **Authoring tool:** `skill-creator` — describe the job in plain English, Claude drafts, tests,
  iterates and packages it; you never hand-edit `SKILL.md`. You can drop in an existing SOP and it
  becomes a reusable skill. `github.com/anthropics/skills`

### 8. shadcn v4 + the shadcn MCP: stop agents hallucinating components
`m-gIqQTHcAY`, `YKJLpgXTxCo`, `TxsNTqaTrKw`, `tPQgw_DPIoM`

Verified CLI v4 commands and features:

```bash
npx shadcn init
npx shadcn add demo
```

New in v4: templates for **React Router, Astro, Laravel** (plus Next.js/TanStack) and Vite;
a **monorepo** setup question at init; a **Radix vs Base UI** choice in the CLI; and **presets** —
a new concept pairing an icon set with a font (Nova = Lucide + Geist, Vega = Lucide + Inter, etc.).
The shadcn *create-project* page emits a shareable **preset code** (also embedded in the URL), so a
config round-trips between web UI and CLI. `npx shadcn add demo` pulls a whole demo component set
that doubles as a live mini design system (buttons, colors, icons, dark mode).

The MCP route fixes broken agent UIs: a GitHub PAT raises the rate limit from **60 → 5,000
req/hour**; tools include `get component`, `get component usage examples`, `list all components`,
`get component metadata`, and `get blocks` (a block = a bundle of components: sidebars, charts).
Verify with a prompt that calls `get-component` and returns real shadcn button source.

### 9. Design systems for agents: agents read context, metadata and examples — not prose
`Vg78K3t9KYc` (Chromatic/Brad Frost), `XfezMs8B-O8`, `gIvxgXRGGpk`, `j_ZPV10bu54`, `ER0YxBlJMZg`

The canonical diagnosis (Chromatic, 588 attendees): agents **ignore your design system, invent
their own patterns, and say "you're absolutely right."** Why? *"Agents don't interpret things like
humans. They consume context, metadata and examples. When that context is flaky, they don't ask
questions — they just make things up."* So documenting a design system for humans (prose + visual
QA) does not transfer; agents need structured context plus worked examples.

The equally important negative space, with hard numbers: AI **cannot** build a Figma variable
library, **cannot** translate "build me a dashboard" into a Figma file using your system, and
**cannot** build components. "AI built my design system in 5 minutes" is clickbait — a real system
has **200+ components**, and one button set still took **11 minutes**. AI-generated Figma output
uses *groups* instead of auto-layout frames and applies your variables without using your
components, so you rebuild it anyway. AI *is* good for generating modules and for documenting
existing components.

**How to fix it** (`ER0YxBlJMZg`, `j_ZPV10bu54`): a 5-level "AI-ready design system" built via
**Figma MCP + Claude Code**, and an explicit training loop — you cannot upload a system and have
AI know every variable, style, component and usage rule; you run a series of prompts to train it.
Figma's `implement-design` skill does the heavy lifting: parse the Figma URL → pull file key +
node ID → call the Figma MCP for auto-layout, typography, color and spacing tokens → screenshot
as visual reference → download assets → **map onto your existing components** → validate
(layout, typography, colors, interactive states, responsive, a11y) against that one screenshot.

### 10. Workflow patterns that actually produce polished UI
`nbk0PMS0tos`, `lkKGQVHrXzE`, `Em9EzurouOU`, `xYv4_cTOSNM`, `hqIU6hluMZA`, `vH8Gj-aDHcw`, `86HM0RUWhCk`

- **Real screenshot over invented UI.** Don't let the model fake your product in the hero — put an
  actual screenshot in, then tighten the radius and match the palette to it (Steve Schoger's
  workflow explicitly fixes the screenshot's corner radius to match the generated card radius and
  swaps slate grays for neutral grays).
- **Five designs, not one.** *"Create five different designs, each creative and unique from all
  the others, hosted on /1 /2 /3 /4 /5."* Because the model sees the other four in-context it
  differentiates instead of re-rolling one template.
- **Competitor research in the skill.** Encode look-and-feel *plus* inspiration references
  (Mobbin is the library used) in one skill, referenced on every new feature — so you stop
  prompting "change this" forever.
- **Design system first, then the skill.** Build the system (in code or via `design.md` /
  getdesign.md brand kits → Claude Design's "additional notes"), then apply the front-end design
  skill *against that framework* — better than the skill alone.
- **`CLAUDE.md` is the system prompt.** Keep it concise; expect to revisit it as the project moves.
- **v0/Lovable → Claude Code, for a reason.** Sandboxes make decisions for you; when they guess
  wrong you can't fix what you don't understand, and the prototype doesn't match your codebase,
  design system or architecture — you *added* a cycle instead of removing one. And the "Lovable is
  only for MVPs" myth is wrong: Lovable runs on Supabase (edge functions, DB triggers, cron,
  webhooks, RLS) in the *same* project, so "front-end in Lovable, back-end in Claude Code" creates
  two codebases and two deploys. You actually need Claude Code when you have an **existing
  codebase you cannot rebuild** (their example: 40,000 lines, 3 devs, 2 years, half undocumented).

---

---

## Appendix A — How this was collected

```bash
# metadata (live view count, likes, upload date, duration)
yt-dlp "https://www.youtube.com/watch?v=<ID>" --dump-single-json --skip-download --no-playlist

# discovery
yt-dlp "ytsearch20:<query>" --print "%(id)s|%(title)s|%(channel)s|%(view_count)s" --flat-playlist

# transcript (verified non-empty for all 80)
python ~/.hermes/skills/media/youtube-content/scripts/fetch_transcript.py "<URL>" --text-only
python ~/.hermes/skills/media/youtube-content/scripts/fetch_transcript.py "<URL>" --timestamps
```

Discovery queries run: `claude code skills`, `agent skills claude code`, `ai design system`,
`claude code ui design`, `design engineering with ai`, `building apps with claude code`,
`v0 vs claude code`, `ai frontend design 2026`, `shadcn ui with ai`, `motion design with ai`,
`claude code frontend design`, `ai ux design workflow`, `claude code design skill plugin`,
`polished UI ai generated`, `skill creator anthropic skills`, `claude code frontend best practices`,
`design systems for AI agents`.

**Tooling note:** `pip install yt-dlp` inside the PM-managed Hermes venv does not survive — the
`activate` script re-syncs the environment from `uv.lock` and removes it. Fix: a standalone venv
(`python3 -m venv ytenv && ./ytenv/bin/pip install yt-dlp`).

**Coverage gap:** a second wave of 34 candidate videos (including `QUI6Ug4cHnE`, `T96O8dTzi2Q`,
`Z-CKUQSS8AY`, `pY52H5gKhGg`, `RVeCbPg0liw`) could **not** be verified — YouTube began returning
HTTP 429 / "YouTube is blocking requests from your IP" for both `youtube-transcript-api` and
`yt-dlp --write-auto-subs` partway through the run. They are excluded rather than listed
unverified. Known-good candidates in that wave, pending a retry: `QUI6Ug4cHnE` (Nate Herk, *I Built
The Ultimate Claude Website Design Skill*), `T96O8dTzi2Q` (Sergei Chyrkov, *NO MORE AI SLOP |
Claude Design Full Tutorial*), `Z-CKUQSS8AY` (*How to Build an AI-managed Design System With Claude
Code Skills*), `pY52H5gKhGg` (Better Stack, *Your AI UI Looks Generic… This Fixes It (DESIGN.md)*),
`RVeCbPg0liw` (Chase AI, *The #1 Claude Code Design Skill Just Got a HUGE Upgrade*),
`YNQBCRcwXV4` (Nate Herk, *I Deleted All My Claude Skills… And Claude Got Smarter*),
`npS5jzOoji8` / `VQyYzLJ6xos` (Anthropic's new rules for building great skills),
`kS1MJFZWMq4` (Anthropic, *Creating custom Skills with Claude*).

## Appendix B — Verified video index

 1. **Claude Agent Skills Explained** — Anthropic | `fOxC44g8vig` | 251,736 views | 4,187 likes | 2025-11-26 | 3:14
 2. **What are skills?** — Claude | `bjdBVZa66oU` | 1,835,155 views | 17,994 likes | 2026-02-27 | 2:54
 3. **Claude Code Skills & Agents — The .claude/ Folder Part 2** — Daniel Noworyta | `tol7eILAF8w` | 1,116 views | 18 likes | 2026-04-13 | 23:58
 4. **Claude Code Skills & skills.sh - Crash Course** — Alejandro AO | `rcRS8-7OgBo` | 86,853 views | 1,931 likes | 2026-01-28 | 22:03
 5. **Top 10 Claude Code Frontend Design Skills, Plugins, & CLIs** — Chase AI | `Q9ty3eopOPs` | 112,660 views | 2,997 likes | 2026-04-15 | 20:07
 6. **Turn Claude Code into Your Own INCREDIBLE UI Designer (using Playwright MCP Subagents)** — Patrick Ellis | `xOO8Wt_i72s` | 302,934 views | 12,076 likes | 2025-08-16 | 29:59
 7. **The Best Model For Frontend Design Is...** — Theo - t3․gg | `f2FnYRP5kC4` | 127,965 views | 3,738 likes | 2026-02-05 | 31:36
 8. **Frontend is HARDER for AI than backend (here's how to fix it)** — Matt Pocock | `pSritFeoYFo` | 54,844 views | 1,834 likes | 2026-01-12 | 5:29
 9. **5 Claude Code skills I use every single day** — Matt Pocock | `EJyuu6zlQCg` | 539,491 views | 12,338 likes | 2026-03-16 | 16:42
10. **Every Claude Code Skill I Use to Drive My Entire Development Process** — Cole Medin | `MbiMwgbGdxw` | 32,808 views | 713 likes | 2026-08-13 | 23:00
11. **I Tried 100+ Claude Code Skills. These 6 Are The Best** — Nate Herk | AI Automation | `eRS3CmvrOvA` | 467,653 views | 13,287 likes | 2026-05-03 | 13:39
12. **Stop Writing Claude Skills. Reverse Engineer Them** — Ben AI | `57FpQnLTEBY` | 62,678 views | 713 likes | 2026-10-16 | 9:23
13. **Generate Better AI Designs in Claude Code** — UI Collective | `nbk0PMS0tos` | 53,892 views | 1,283 likes | 2026-03-16 | 11:00
14. **Use Claude Code DESIGNER Skill to 10x UI Designs** — DesignCourse | `Em9EzurouOU` | 129,266 views | 1,576 likes | 2026-02-20 | 7:03
15. **How to Build ACTUALLY Beautiful UI With This Claude Code Skill** — Build Great Products | `95_NJ-a-CMQ` | 189,773 views | 3,491 likes | 2025-11-18 | 12:35
16. **I Tested Claude Skills for Web Design** — Flux Academy | `jT5YdajTg6I` | 107,115 views | 2,343 likes | 2026-05-18 | 23:11
17. **How to Use Claude Skills as a Designer** — Griffin Wooldridge | `Iup1WlUyj9M` | 318,077 views | 8,594 likes | 2026-03-09 | 9:30
18. **Design with Claude Code: The Designer’s Guide** — UI Collective | `JMQ0X_si144` | 240,632 views | 5,443 likes | 2026-02-23 | 16:10
19. **Designing with Claude Code** — Steve Schoger | `lkKGQVHrXzE` | 68,324 views | 1,885 likes | 2026-03-20 | 60:31
20. **How to build a design system from scratch with Claude Code** — 02ui - Idea to Product | `tzn8AAJI6jw` | 37,409 views | 516 likes | 2026-08-28 | 20:52
21. **The 7 Levels of Building ELITE Websites with Claude Code** — Chase AI | `1PXFAFMgdns` | 214,165 views | 7,560 likes | 2026-03-27 | 38:46
22. **Building Beautiful Websites with Claude Code Is Too Easy** — Nate Herk | AI Automation | `86HM0RUWhCk` | 578,094 views | 14,868 likes | 2026-02-19 | 27:51
23. **How I Built INSANE Claude Design Websites In 10 Minutes** — Jono Catliff | `xYv4_cTOSNM` | 225,601 views | 4,849 likes | 2026-04-18 | 16:28
24. **Insane Claude Design Skills You Need To Build Beautiful Websites** — AI LABS | `Ot582-E61ac` | 174,799 views | 4,672 likes | 2026-06-23 | 14:14
25. **Claude Code Just Dropped /Design. (Master it in 8 Minutes).** — Tristen O'Brien | `Fqlc0N1qyMo` | 161,296 views | 2,749 likes | 2026-08-25 | 8:03
26. **Claude Code Frontend Design: 2 Skills That will 10x your UI** — Coding With Abbas | `QDqjteRiOdI` | 11,690 views | 39 likes | 2026-09-14 | 15:00
27. **Design with Claude Code: A Crash Course** — UI Collective | `ljJuOxTsrtY` | 51,826 views | 428 likes | 2026-09-29 | 17:15
28. **Design in Claude Code Like This** — UI Collective | `lwOIVNRHndM` | 27,193 views | 767 likes | 2026-04-13 | 15:51
29. **Full Tutorial: From Idea to App with Claude Design and Claude Code in 25 Minutes** — Peter Yang | `G9o8eoHzpxc` | 29,823 views | 603 likes | 2026-07-29 | 25:27
30. **AI + Design Systems in 2026: The Workflow I Actually Use** — UI Collective | `XfezMs8B-O8` | 62,568 views | 1,467 likes | 2026-01-26 | 31:49
31. **AI and Design Systems: What Actually Works (and What Doesn’t)** — UI Collective | `gIvxgXRGGpk` | 39,446 views | 1,099 likes | 2026-04-27 | 42:05
32. **Agentic Design Systems in 2026 with Brad Frost** — Chromatic | `Vg78K3t9KYc` | 14,827 views | 243 likes | 2025-12-11 | 80:50
33. **Design Systems in the Age of Agents: What Changes, What Doesn't** — Hatch Conference | `JeJhPtsbIGA` | 54,042 views | 689 likes | 2026-10-05 | 31:20
34. **AI + Design Systems: The Honest Truth Nobody’s Telling You** — UI Collective | `dWEvzEkg9hM` | 17,679 views | 299 likes | 2026-10-12 | 35:45
35. **How to Build an AI-Ready Design System (Figma MCP + Claude Code)** — Headway | `ER0YxBlJMZg` | 3,592 views | 58 likes | 2026-07-23 | 58:42
36. **Designing With AI: Claude, Codex, Figma | Full Guide** — UI Collective | `j_ZPV10bu54` | 219,373 views | 5,009 likes | 2026-05-04 | 87:43
37. **Design with AI - Full Guide (Tools, Workflows, Design Systems)** — UI Collective | `r-MPiu0E4W4` | 81,274 views | 1,225 likes | 2026-09-15 | 111:39
38. **Shadcn CLI v4 - This Changes Everything (Exclusive First Look 👀)** — OrcDev | `m-gIqQTHcAY` | 69,648 views | 4,123 likes | 2026-03-06 | 16:00
39. **Shadcn UI Agent: The Fix for Broken, AI-Generated UIs** — Eric Tech | `YKJLpgXTxCo` | 32,766 views | 1,054 likes | 2025-07-25 | 10:30
40. **Shadcn's NEW MCP is Here: Build UIs with AI Agents & Claude Code** — Eric Tech | `TxsNTqaTrKw` | 25,106 views | 565 likes | 2025-09-15 | 12:09
41. **The Ultimate Shadcn UI + Claude Code Workflow (Design System, Claude Extension, MCP, Figma, Builder)** — ByteGrad | `qutWPWDlzRw` | 39,291 views | 599 likes | 2026-01-26 | 1115
42. **Shadcn Just Fixed Tailwind's Biggest Problem** — Better Stack | `tPQgw_DPIoM` | 125,316 views | 1,467 likes | 2026-09-21 | 6:59
43. **This NEW Shadcn Update Builds Beautiful App UI in Minutes (Shadcn Create)** — Build Great Products | `1hhjW_YtNdA` | 6,797 views | 148 likes | 2025-12-16 | 11:47
44. **Shadcn Create + Opus 4.5 / Gemini 3 Pro: This is THE BEST WAY to make BEAUTIFUL APPS with AI!** — AICodeKing | `eSUe62dnfYw` | 16,122 views | 421 likes | 2025-12-14 | 11:38
45. **Shadcn is now PERFECT for Vibe Coding (v2 changes)** — Better Stack | `sIvYbCZzAts` | 17,098 views | 381 likes | 2025-12-19 | 6:59
46. **Shadcn Isn’t Just a Library Anymore… Here’s How to 10x Your UI** — AI LABS | `V8rGgwQ-VJ0` | 118,054 views | 3,734 likes | 2025-07-17 | 9:24
47. **Stop Building AI Slop – Build High-End Web Apps with AI** — freeCodeCamp.org | `g3X8JauSWTM` | 136,038 views | 1,915 likes | 2026-08-25 | 64:16
48. **Stop using V0 and Lovable to prototype, use Claude Code instead** — The Design Project | `hqIU6hluMZA` | 7,600 views | 199 likes | 2026-02-01 | 11:49
49. **Claude Code vs. Lovable: 90% of You Are Choosing Wrong** — Luuk Alleman | `vH8Gj-aDHcw` | 38,495 views | 715 likes | 2026-02-15 | 7:19
50. **I Made Vox-Style Motion Graphics Using Only Claude Code & Remotion** — MoSidd | `7wuYBfE131U` | 232,244 views | 7,161 likes | 2026-06-28 | 13:11
51. **Master 95% of Claude Code Skills in 28 Minutes** — Nate Herk | AI Automation | `zKBPwDpBfhs` | 245,947 views | 4,859 likes | 2026-02-27 | 27:18
52. **Anthropic's Full Claude Skills Guide In 22 Minutes** — Mark Kashef | `TzJecWCbex0` | 62,523 views | 1,372 likes | 2026-02-15 | 22:19
53. **From Prompts to Agents: AI Agent Skills in Claude Code** — Dataminded | `jlX4sTbNHpc` | 1,321 views | 21 likes | 2026-02-24 | 25:21
54. **How AI agents & Claude skills work (Clearly Explained)** — Greg Isenberg | `S_oN3vlzpMw` | 922,241 views | 19,459 likes | 2026-04-08 | 35:25
55. **How Senior Engineers Actually Build With AI in 2026 | Build a Full Stack Systems Architecture App** — JavaScript Mastery | `14RP8liACqo` | 1,375,517 views | 12,591 likes | 2026-05-01 | 238:17
56. **Claude Code Full Course 2026 | How Senior Engineers Actually Build with AI** — JavaScript Mastery | `u2QqWkMv3Lg` | 244,505 views | 3,302 likes | 2026-09-25 | 133:39
57. **Building a Real App with Claude Code (Start to Finish)** — Tech With Tim | `misjUj4Q_ho` | 139,688 views | 1,217 likes | 2026-09-28 | 22:58
58. **Build and deploy a full app with Claude Code in 2026 (full tutorial)** — No Code MBA | `sKBuSaaoN1Y` | 124,023 views | 1,624 likes | 2026-03-25 | 16:34
59. **How I Vibe Coded a $400K/mo App with Claude Code (Full Tutorial)** — Jason Lee | `hDOUzlJwM1E` | 393,399 views | 10,273 likes | 2026-04-24 | 20:28
60. **How I Vibe Coded a Full App using Claude Code (with Database, Payment, Login)** — Jason Lee | `fgrXAeNj9tM` | 378,692 views | 7,651 likes | 2026-05-30 | 31:44
61. **Build $10,000 Websites using Claude Code (Ultimate Guide)** — Metics Media | `VMvZuhcDdnw` | 1,213,274 views | 39,006 likes | 2026-05-29 | 26:09
62. **Claude just got another superpower...** — Fireship | `jeA-KBv0b68` | 932,527 views | 27,532 likes | 2026-04-21 | 5:12
63. **Agent Skills or MCP in the era of Claude Code?** — Confluent Developer | `pvxNcQTcIy4` | 224,221 views | 4,217 likes | 2026-03-10 | 9:56
64. **How to Create Claude Code Agent Skills in 2026** — Code with Beto | `nbqqnl3JdR0` | 71,650 views | 960 likes | 2026-01-05 | 14:11
65. **How to Create Good Agent Skills | Claude Code Guide** — Code with Beto | `Ik-Xbz2hvM0` | 24,236 views | 324 likes | 2026-01-28 | 11:06
66. **How to Create Skills in Claude** — Tom Nassr | XRAY  | `FWjDzITF86k` | 111,300 views | 1,137 likes | 2026-04-06 | 8:42
67. **Stop Prompting: How Claude Code Skills Actually Work** — J-HAYER | `7Z-t3njCjyk` | 257 views | 3 likes | 2026-05-18 | 16:17
68. **Everything You Know About Skills IS OUTDATED** — Simon Scrapes | `e7TY56-yIvM` | 316,115 views | 3,036 likes | 2026-10-01 | 12:49
69. **Claude Code's #1 Token Saving Skill Just Got Upgraded (But Is It BS?)** — Chase AI | `4B1iGFShCnI` | 28,015 views | 408 likes | 2026-10-19 | 17:06
70. **The Ultimate AI Design Workflow for UI/UX** — Griffin Wooldridge | `GcNwDqqoafo` | 55,247 views | 1,399 likes | 2026-02-23 | 14:58
71. **My Simple AI Workflow for UI/UX Design in 2026** — Griffin Wooldridge | `mrXOSXLb8-g` | 14,289 views | 283 likes | 2026-04-27 | 489
72. **Use AI Like a Senior Designer (3 Workflows)** — UI Collective | `Oo-5AWdQAt8` | 63,360 views | 1,363 likes | 2026-08-18 | 14:18
73. **How I use (and don’t use) AI to design better in 2026** — Aliena Cai | `2u6bH17NIQk` | 65,483 views | 2,645 likes | 2026-03-11 | 21:32
74. **My AI Design Process (What Actually Works)** — UI Collective | `BLW5NLtQVHM` | 42,273 views | 1,142 likes | 2026-02-09 | 30:13
75. **How I use AI to design faster (my complete workflow)** — Rachel How | `ni19lPH_wy0` | 112,912 views | 3,217 likes | 2025-08-12 | 5:45
76. **Claude Makes a New Kind of Video - Full Tutorial** — Futurepedia | `Ge1B-Ok1Pfk` | 92,628 views | 1,657 likes | 2026-10-19 | 11:19
77. **How to Generate Insane AI Motion Graphics (Full Control)** — Zane Hoyer | `sCc7O9K92Mg` | 134,272 views | 3,428 likes | 2026-02-07 | 5:43
78. **Build an App With Claude Design** — Claude | `COJAZQM1aeQ` | 192,841 views | 2,040 likes | 2026-10-02 | 1:42
79. **Learn Design Systems: Figma Variables, Components, AI, and More** — UI Collective | `lsgVRCJ4fko` | 62,860 views | 1,100 likes | 2026-09-09 | 240:41
80. **Claude Design Now Builds Beautiful $10,000 Websites (NO AI Slop)** — Jack Roberts | `VwGrXe2ricE` | 283,315 views | 5,130 likes | 2026-08-17 | 22:17
81. **Figma Make vs Lovable vs V0 vs Claude Code: What We Actually Use in Production** — The Design Project | `dN3bL9l8uEk` | 3,641 views | 136 likes | 2025-11-20 | 12:05

## Appendix C — Per-video concrete takeaways

### 1. Claude Agent Skills Explained

- **Channel:** Anthropic  |  **Video ID:** `fOxC44g8vig`  |  **URL:** https://www.youtube.com/watch?v=fOxC44g8vig
- **Views:** 251,736  |  **Likes:** 4,187  |  **Upload date:** 2025-11-26  |  **Length:** 3:14  |  **Transcript segments:** 84 ✅ verified non-empty
- **Concrete takeaways:**
  - Canonical Anthropic explainer. Progressive disclosure: at session start ONLY the name+description of every installed skill is loaded (~30-50 tokens each); the full SKILL.md loads only when a prompt matches the description; referenced files/scripts load on demand.
  - The 4-layer stack: CLAUDE.md (project-specific: stack, conventions, repo layout) -> MCP servers (connect data/external context) -> subagents (fixed role, own context window, own tool permissions) -> skills (portable expertise any agent can load).
  - Explicit use-case for design: a front-end design skill can encode typography standards, animation patterns, layout conventions and activate automatically when building UI components.

### 2. What are skills?

- **Channel:** Claude  |  **Video ID:** `bjdBVZa66oU`  |  **URL:** https://www.youtube.com/watch?v=bjdBVZa66oU
- **Views:** 1,835,155  |  **Likes:** 17,994  |  **Upload date:** 2026-02-27  |  **Length:** 2:54  |  **Transcript segments:** 72 ✅ verified non-empty
- **Concrete takeaways:**
  - Official 3-minute Anthropic primer on Agent Skills - the canonical reference for how skills are packaged and auto-invoked.

### 3. Claude Code Skills & Agents — The .claude/ Folder Part 2

- **Channel:** Daniel Noworyta  |  **Video ID:** `tol7eILAF8w`  |  **URL:** https://www.youtube.com/watch?v=tol7eILAF8w
- **Views:** 1,116  |  **Likes:** 18  |  **Upload date:** 2026-04-13  |  **Length:** 23:58  |  **Transcript segments:** 571 ✅ verified non-empty
- **Concrete takeaways:**
  - Anatomy of .claude/: .claude/skills/<name>/SKILL.md plus supporting files (templates, guidelines, checklists). Skills are PACKAGES, unlike legacy single-file slash commands.
  - Front matter = name (becomes the slash command), description (drives auto-load), allowed-tools (tool permission scoping). Example real front matter: name: code-review, description: 'Review code for quality issues. Use when reviewing PRs, checking for bugs, or validating implementation before merging.'
  - Two trigger paths: explicit /code-review, OR Claude reads the description and auto-invokes on a matching request.
  - Real skill body pattern shown: 'At detailed-guide.md reference' - a skill can point at sibling markdown files loaded only when needed.
  - Full worked example of a commit-message skill: allowed-tools: Bash, Read; body = 'Stage changes using git diff --cached, write a commit message following conventional commit'.
  - Matt Pocock's skills (github.com/mattpocock/skills): PRD (structured Q&A to produce a PRD), PRD-to-issues (breaks a PRD into independently-grabbable vertical-slice GitHub issues), grill-me (Claude interviews YOU with challenging questions about edge cases/assumptions/trade-offs before any code is written).
  - Docs links: code.claude.com/docs/en/overview and github.com/mattpocock/skills.

### 4. Claude Code Skills & skills.sh - Crash Course

- **Channel:** Alejandro AO  |  **Video ID:** `rcRS8-7OgBo`  |  **URL:** https://www.youtube.com/watch?v=rcRS8-7OgBo
- **Views:** 86,853  |  **Likes:** 1,931  |  **Upload date:** 2026-01-28  |  **Length:** 22:03  |  **Transcript segments:** 273 ✅ verified non-empty
- **Concrete takeaways:**
  - skills.sh is Vercel's new CLI for managing/installing agent skills. Install form is: npx skills add <owner>/<repo>. The video literally runs 'npx skills add anthropics/skills' (or similar), picks 'front-end design', enables it for all detected agents, and installs at PROJECT scope rather than global.
  - skills.sh is described as the 'only CLI you need' - also covers npx skills initialize, skill creation, sharing, marketplaces, and Anthropic plugins.
  - Runs a controlled A/B: identical prompt ('fix the style of the UI of the landing page... make it look modern and appealing... FAQ/pricing with three plans, hero, feature sections, CTA email form') with and WITHOUT the front-end design skill, side by side. The skill version is visibly less 'AI slop'.
  - Skill anatomy: YAML header with name + description is the ONLY thing in context before load; the body is plain markdown with specialized instructions.
  - Timeline: Anthropic introduced Claude Code agent skills Oct 2025; the open standard landed Dec 2025 and was adopted by OpenAI Codex, Microsoft, GitHub, Cursor; Vercel shipped skills.sh shortly after.

### 5. Top 10 Claude Code Frontend Design Skills, Plugins, & CLIs

- **Channel:** Chase AI  |  **Video ID:** `Q9ty3eopOPs`  |  **URL:** https://www.youtube.com/watch?v=Q9ty3eopOPs
- **Views:** 112,660  |  **Likes:** 2,997  |  **Upload date:** 2026-04-15  |  **Length:** 20:07  |  **Transcript segments:** 607 ✅ verified non-empty
- **Concrete takeaways:**
  - Catalogue of 10 real front-end design skills/tools, with concrete repos: Skill-UI (reverse-engineers ANY live website into a Claude-ready design-system skill; 'ultra mode' uses Playwright for scroll screenshots and hover interactions, not just HTML), a web-GPU skill (teaches renderer setup, shaders, node-based materials for WebGL), and awesome-design.md (50k+ stars - per-website design.md prompt files ripped apart into form elements, cards, buttons, headings, typography, colors).
  - Workflow: copy the prompt from 21st.dev components (one-click 'copy prompt' button) straight into Claude Code instead of hand-writing Spline/Three.js code.
  - Method: point Skill-UI at Stripe.com, ask for 'make me a fake Stripe website in that sort of style', get a one-shot result, then reuse the generated skill for every future page in that style.
  - Anchor for 'design.md': design.md files are prompts describing how to build a site; Google Stitch popularized the concept, awesome-design.md is the open library of them.

### 6. Turn Claude Code into Your Own INCREDIBLE UI Designer (using Playwright MCP Subagents)

- **Channel:** Patrick Ellis  |  **Video ID:** `xOO8Wt_i72s`  |  **URL:** https://www.youtube.com/watch?v=xOO8Wt_i72s
- **Views:** 302,934  |  **Likes:** 12,076  |  **Upload date:** 2025-08-16  |  **Length:** 29:59  |  **Transcript segments:** 817 ✅ verified non-empty
- **Concrete takeaways:**
  - THE visual-feedback unlock: coding agents only use the text side of their multimodality - they cannot see their own designs. Wiring the Playwright MCP gives them eyes and unlocks the vision half of the model.
  - Playwright MCP capabilities used: automatic screenshots (incl. full-page), reading browser console + network logs, device/viewport emulation (tablet, desktop, mobile, iOS), browser navigation (click buttons, fill form fields to reproduce a state), accessibility audits, and scraping reference URLs for inspiration.
  - The 'orchestration layer' framing: Claude Code needs (a) CONTEXT - well-written prompts/docs, (b) TOOLS - Playwright for actions/screenshots, (c) VALIDATION - a fixed spec/UI mock/style guide with examples of good and bad outcomes.
  - The 'iterative agentic loop': Claude reads a spec -> screenshots its own work via Playwright -> compares against the spec -> identifies the mismatch -> edits -> repeats. This is what beats 5 rounds of manual prompting.
  - Repo for the full workflow: github.com/OneRedOak/claude-code-workflows (includes subagents/commands setup and Playwright MCP config details, plus a customized CLAUDE.md).
  - Emergent behavior worth knowing: when Firecrawl got 403-blocked, Claude spun up its own Playwright browser and scraped the data itself.

### 7. The Best Model For Frontend Design Is...

- **Channel:** Theo - t3․gg  |  **Video ID:** `f2FnYRP5kC4`  |  **URL:** https://www.youtube.com/watch?v=f2FnYRP5kC4
- **Views:** 127,965  |  **Likes:** 3,738  |  **Upload date:** 2026-02-05  |  **Length:** 31:36  |  **Transcript segments:** 945 ✅ verified non-empty
- **Concrete takeaways:**
  - Controlled 6-agent bake-off: 2 jobs each on Gemini 3 Pro, Claude Code (Opus 4.5), and GPT-5.2 (Codex) on the identical prompt. Rough design ranking: Opus 4.5 bottom, GPT-5.2 next, Gemini next, and Opus + the front-end design skill on top.
  - The counter-intuitive result: Opus is the WORST raw design model but the BEST once the front-end-design SKILL is loaded. The skill, not the model, is what produces taste.
  - The front-end-design skill is a plain markdown file (open source in the Claude Code repo even though Claude Code itself is closed) - 'a description of behavior you want the model to have'.
  - The prompt trick that made the biggest difference: 'create five different designs, each creative and unique from all the others, hosted on /1 /2 /3 /4 /5'. Because the model sees the other four in-context, it actively differentiates instead of re-rolling the same template. The author also uses it to reverse-engineer which templates a model was trained on (estimate: GPT-5 ~10 templates, Opus ~20, Gemini ~1-2).
  - What the skill actually bans (verbatim): 'Never use generic AI generated aesthetics like overused font families like Roboto, Inter, Arial, system fonts, cliched color schemes, particularly purple gradients on white backgrounds, predictable layouts and component patterns, and cookie cutter designs that lack context specific character.' Plus: 'Bold maximalism and refined minimalism both work. The key is intentionality, not intensity.'
  - skills.sh is cited as the directory for discovering the skill. A Remotion design skill exists and has driven a wave of programmatic video generation.

### 8. Frontend is HARDER for AI than backend (here's how to fix it)

- **Channel:** Matt Pocock  |  **Video ID:** `pSritFeoYFo`  |  **URL:** https://www.youtube.com/watch?v=pSritFeoYFo
- **Views:** 54,844  |  **Likes:** 1,834  |  **Upload date:** 2026-01-12  |  **Length:** 5:29  |  **Transcript segments:** 170 ✅ verified non-empty
- **Concrete takeaways:**
  - Root-cause framing: back-end feedback loops are textual (tests, lint, type-check) so LLMs are good at back-end; front-end feedback loops are VISUAL (write code -> look at UI -> go back), which LLMs cannot do.
  - The fix: add a visual channel via the Chrome DevTools MCP. Matt runs it against localhost:5175, screenshots full-page in light and dark mode, emulates prefers-color-scheme via a strict script, and diagnoses 'adding the dark class did nothing - the site uses media prefers-color-scheme'.
  - Concrete setup - two files only: an .mcp.json running the Chrome DevTools MCP server pointed at a running browser URL, plus a skill whose entire body says 'Before using Chrome DevTools MCP, you must launch Chrome in headless mode with remote debugging enabled.'
  - Repos named: github.com/ChromeDevTools/chrome-devtools-mcp, github.com/remorses/playwriter, github.com/SawyerHood/dev-browser.
  - Also covers: a Ralph loop (used to drive TDD-style red/green/refactor), and how a skill acts like an on-demand AGENTS.md section.

### 9. 5 Claude Code skills I use every single day

- **Channel:** Matt Pocock  |  **Video ID:** `EJyuu6zlQCg`  |  **URL:** https://www.youtube.com/watch?v=EJyuu6zlQCg
- **Views:** 539,491  |  **Likes:** 12,338  |  **Upload date:** 2026-03-16  |  **Length:** 16:42  |  **Transcript segments:** 524 ✅ verified non-empty
- **Concrete takeaways:**
  - Five skills Matt actually uses daily, with the mechanics: (1) a TDD skill he feeds to his Ralph loops to enforce red-green-refactor; (2) PRD -> submitted as a GitHub issue; (3) PRD -> MORE GitHub issues that reference the parent PRD; (4) a Ralph loop that loops over each issue until done; (5) grill-me.
  - The PRD skill's body structure is the reusable pattern: 'ask questions, explore the repository, interview the user, sketch the major modules' - and it explicitly allows skipping steps: 'You might skip steps if you don't consider them necessary.'
  - Why it works: agents have no memory, so 'extremely strict and well-defined processes' are what make them useful; encoding the process is what makes AI code quality go up.
  - Skills are shared as markdown, so a team's PR/security/standards workflow ships with the repo.
  - Matt's own skills are published (links in description).

### 10. Every Claude Code Skill I Use to Drive My Entire Development Process

- **Channel:** Cole Medin  |  **Video ID:** `MbiMwgbGdxw`  |  **URL:** https://www.youtube.com/watch?v=MbiMwgbGdxw
- **Views:** 32,808  |  **Likes:** 713  |  **Upload date:** 2026-08-13  |  **Length:** 23:00  |  **Transcript segments:** 701 ✅ verified non-empty
- **Concrete takeaways:**
  - A pick-and-choose library of minimal, plug-and-play skills covering the whole dev cycle, explicitly contrasted with adopting an entire framework (GitHub spec-kit, Gas Town) - 'the entire software development life cycle is defined for you'.
  - Install path shown: add the author's Claude Code marketplace plugin from inside a running Claude Code session, then cherry-pick individual skills into your own project.
  - Flags 'validation-first' as the most important part of his process: let the model cook but keep confidence in the output.

### 11. I Tried 100+ Claude Code Skills. These 6 Are The Best

- **Channel:** Nate Herk | AI Automation  |  **Video ID:** `eRS3CmvrOvA`  |  **URL:** https://www.youtube.com/watch?v=eRS3CmvrOvA
- **Views:** 467,653  |  **Likes:** 13,287  |  **Upload date:** 2026-05-03  |  **Length:** 13:39  |  **Transcript segments:** 506 ✅ verified non-empty
- **Concrete takeaways:**
  - The money angle: after 400 hours in Claude Code he argues businesses buy 6 boring skill types (save time / save money / remove mistakes), not fancy demo skills.
  - Install command shown verbatim: /plugin install skill-creator - installed at USER scope so it auto-invokes in any project.
  - Clarifies the taxonomy: a SKILL is the markdown file; a PLUGIN is a larger package that can bundle multiple skills plus hooks and MCP servers.
  - skill-creator is 'the factory that builds the product' - you describe the job in plain English, Claude drafts, tests, iterates, and packages the skill; you never hand-edit SKILL.md. You can drop in an existing SOP and it becomes a reusable skill.

### 12. Stop Writing Claude Skills. Reverse Engineer Them

- **Channel:** Ben AI  |  **Video ID:** `57FpQnLTEBY`  |  **URL:** https://www.youtube.com/watch?v=57FpQnLTEBY
- **Views:** 62,678  |  **Likes:** 713  |  **Upload date:** 2026-10-16  |  **Length:** 9:23  |  **Transcript segments:** 293 ✅ verified non-empty
- **Concrete takeaways:**
  - The reverse-engineer-anything repo (200k+ stars in one week) is an MCP + skill that gives agents the same tooling security researchers use; point it at an app and it reports how the app behaves so an agent can rebuild and test a matching version - it does not copy code.
  - The transferable principle (the real lesson): instead of DESCRIBING how to do a task, SHOW Claude a good output example and let it reverse-engineer the process. Anthropic's own guidance quoted: 'Examples convey the desired style and level of detail to Claude more clearly than descriptions alone.'
  - Applies equally to one-off tasks, repetitive tasks, and to authoring skills themselves: a skill can carry an exemplar instead of prose steps.
  - Also noted: Opus 5.5 is good enough at this without the repo - people have rebuilt Adobe-suite-class tools and whole tech stacks (e.g. Peter Levels').
  - Repo: github.com/morluto/rea. Anthropic best-practices doc: platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.

### 13. Generate Better AI Designs in Claude Code

- **Channel:** UI Collective  |  **Video ID:** `nbk0PMS0tos`  |  **URL:** https://www.youtube.com/watch?v=nbk0PMS0tos
- **Views:** 53,892  |  **Likes:** 1,283  |  **Upload date:** 2026-03-16  |  **Length:** 11:00  |  **Transcript segments:** 330 ✅ verified non-empty
- **Concrete takeaways:**
  - Before/after demo with the SAME simple prompt ('Please build me a landing page for a crypto back...') - generic gradients and AI-looking cards vs. a much better first result.
  - The method: build a Claude skill that encodes look-and-feel, add competitor/inspiration references to it (Mobbin is used as the inspiration library - a repository of real screens, UI elements and flows), and reference that skill on every new feature so you stop prompting 'change this' forever.

### 14. Use Claude Code DESIGNER Skill to 10x UI Designs

- **Channel:** DesignCourse  |  **Video ID:** `Em9EzurouOU`  |  **URL:** https://www.youtube.com/watch?v=Em9EzurouOU
- **Views:** 129,266  |  **Likes:** 1,576  |  **Upload date:** 2026-02-20  |  **Length:** 7:03  |  **Transcript segments:** 190 ✅ verified non-empty
- **Concrete takeaways:**
  - Install path shown explicitly: download skills/frontend-design/SKILL.md (raw) from the anthropics/claude-code repo, create ~/.claude/skills/<your-skill>/ and paste SKILL.md in, restart Claude Code, then verify with /skills and invoke with /<skill-name>.
  - The front-end design skill forces a design-thinking pass before code: purpose, tone, constraints, differentiation - then typography, color, motion, spatial composition, atmosphere.
  - Example prompt that one-shot a strong result: '/frontend-design designer  Hero section of a landing page for an AI identity verification service. Light beige background, two columns, strong headline + copy + CTA on the left, a fictional but simplistic UI animation demonstrating identity verification on the right. Place this in an HTML file with CSS and include variables.'
  - Repo: github.com/anthropics/claude-code/tree/main/plugins/frontend-design

### 15. How to Build ACTUALLY Beautiful UI With This Claude Code Skill

- **Channel:** Build Great Products  |  **Video ID:** `95_NJ-a-CMQ`  |  **URL:** https://www.youtube.com/watch?v=95_NJ-a-CMQ
- **Views:** 189,773  |  **Likes:** 3,491  |  **Upload date:** 2025-11-18  |  **Length:** 12:35  |  **Transcript segments:** 336 ✅ verified non-empty
- **Concrete takeaways:**
  - The 'frontend-design' plugin is presented as the single highest-leverage install for non-generic UI, and the video shows the same landing page redesigned from an attached SCREENSHOT reference.
  - Progression taught: create the design system first in code (or in a framework), then have Claude Code apply the front-end design skill against that framework - 'that would probably yield even better results' than the skill alone.

### 16. I Tested Claude Skills for Web Design

- **Channel:** Flux Academy  |  **Video ID:** `jT5YdajTg6I`  |  **URL:** https://www.youtube.com/watch?v=jT5YdajTg6I
- **Views:** 107,115  |  **Likes:** 2,343  |  **Upload date:** 2026-05-18  |  **Length:** 23:11  |  **Transcript segments:** 751 ✅ verified non-empty
- **Concrete takeaways:**
  - Ranks the design skills that actually matter: front-end design (by far the most popular; Anthropic-released) as the headliner, then theme-factory, brand-guidelines, and web-artifacts-builder as the official ones relevant to web designers.
  - Shows where skills live in the Claude desktop app: Customize -> Skills -> + -> Browse skills; you can open any skill and read its file contents.
  - Skill anatomy examples: theme-factory = SKILL.md + pre-packaged theme MD files with color palettes and typography systems; canvas-design = SKILL.md + a folder of font files Claude is instructed to use.
  - Practical framing: a skill is a job description handed to Claude before assigning a task; with a skill loaded it knows your stack, your style and your client context, so it stops being a generic AI designer and becomes a collaborator.

### 17. How to Use Claude Skills as a Designer

- **Channel:** Griffin Wooldridge  |  **Video ID:** `Iup1WlUyj9M`  |  **URL:** https://www.youtube.com/watch?v=Iup1WlUyj9M
- **Views:** 318,077  |  **Likes:** 8,594  |  **Upload date:** 2026-03-09  |  **Length:** 9:30  |  **Transcript segments:** 293 ✅ verified non-empty
- **Concrete takeaways:**
  - Details the Figma 'implement-design' skill: paste a Figma URL, the skill parses the file key and node ID, calls the Figma MCP server for full design context (auto-layout, typography specs, color values, spacing tokens), takes a screenshot as visual reference, downloads assets, then maps output onto your project's existing components (reuses your buttons/inputs/typography rather than recreating them), and finishes with a validation checklist: layout, typography, colors, interactive states, responsive behavior, accessibility - all checked against the Figma screenshot.
  - Requires the Figma MCP to be connected first.
  - Skill catalog links used: mcpservers.org/agent-skills/anthropic/brand-guidelines, .../canvas-design, .../theme-factory, and mcpservers.org/agent-skills/figma/implement-design.
  - Skill source: github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md

### 18. Design with Claude Code: The Designer’s Guide

- **Channel:** UI Collective  |  **Video ID:** `JMQ0X_si144`  |  **URL:** https://www.youtube.com/watch?v=JMQ0X_si144
- **Views:** 240,632  |  **Likes:** 5,443  |  **Upload date:** 2026-02-23  |  **Length:** 16:10  |  **Transcript segments:** 499 ✅ verified non-empty
- **Concrete takeaways:**
  - Designer's-eye framing: Claude Code has NO Figma-like design interface - you drive it from VS Code, Cursor, a terminal, or the desktop app. Expectation management first, technique second.
  - Two-way Figma sync via Figma MCP: prompt in Claude -> push into a Figma file -> iterate/show the client in Figma -> pull changes back into Claude.
  - Explicit warning about one-shot expectations - what you see on X omits the effort.

### 19. Designing with Claude Code

- **Channel:** Steve Schoger  |  **Video ID:** `lkKGQVHrXzE`  |  **URL:** https://www.youtube.com/watch?v=lkKGQVHrXzE
- **Views:** 68,324  |  **Likes:** 1,885  |  **Upload date:** 2026-03-20  |  **Length:** 60:31  |  **Transcript segments:** 1487 ✅ verified non-empty
- **Concrete takeaways:**
  - A designer-skeptical, concrete 60-minute workflow: Steve Schoger (Tailwind Labs) uses Claude Code as his primary design tool and keeps a personal project template he copies for every start.
  - Two concrete tactics shown: (1) put a REAL SCREENSHOT of your product in the hero instead of letting the model invent fake UI, and (2) tighten the color system to match - explicitly fixing the corner radius of the screenshot to match the generated card radius and swapping 'slate' grays for 'neutral' grays.
  - Also a deliberate non-default palette choice (emerald, explicitly because 'AI kind of defaults to indigo every time').
  - Meta point: you cannot describe a design you have not internalized - 'if you don't know what right looks like, how is Claude Code supposed to figure it out?'

### 20. How to build a design system from scratch with Claude Code

- **Channel:** 02ui - Idea to Product  |  **Video ID:** `tzn8AAJI6jw`  |  **URL:** https://www.youtube.com/watch?v=tzn8AAJI6jw
- **Views:** 37,409  |  **Likes:** 516  |  **Upload date:** 2026-08-28  |  **Length:** 20:52  |  **Transcript segments:** 476 ✅ verified non-empty
- **Concrete takeaways:**
  - An actual from-scratch design-system build with Claude Code, done live by two designers with 20 years of experience, for a hypothetical 'Zero Bank' brand.
  - The ordering principle they argue for: start with COLOR and TYPEFACE only, chosen from absolute minimum requirements (mobile-friendly, light + dark mode, worldwide audience), and only then style everything else. Color psychology is weighed explicitly (orange for friendliness; avoid red/green because meanings differ across cultures).
  - Claude Code is run against a real project folder (Desktop/zero-bank) with the workspace trusted, so output is GitHub-ready by construction.
  - The trap they call out: social media 'design systems' are usually just style guides, not real systems.

### 21. The 7 Levels of Building ELITE Websites with Claude Code

- **Channel:** Chase AI  |  **Video ID:** `1PXFAFMgdns`  |  **URL:** https://www.youtube.com/watch?v=1PXFAFMgdns
- **Views:** 214,165  |  **Likes:** 7,560  |  **Upload date:** 2026-03-27  |  **Length:** 38:46  |  **Transcript segments:** 1237 ✅ verified non-empty
- **Concrete takeaways:**
  - A 7-level progression for Claude Code front-end design, with the level-1 trap named precisely: prompt + plan mode with no design direction yields purple gradients and generic hero/features/CTA - 'holy AI slop'.
  - Why: 'AI has no taste' is only half true - most people cannot articulate taste, and Claude Code cannot invent what you cannot describe.
  - Level 1 competencies to build deliberately: writing descriptive prompts, specifying frameworks, and building a design vocabulary. Use plan mode as a teaching device - it asks 'what tech stack?' (Next.js / plain HTML / Astro) and forces explicit style decisions.
  - Also shows using 21st.dev for component reference.

### 22. Building Beautiful Websites with Claude Code Is Too Easy

- **Channel:** Nate Herk | AI Automation  |  **Video ID:** `86HM0RUWhCk`  |  **URL:** https://www.youtube.com/watch?v=86HM0RUWhCk
- **Views:** 578,094  |  **Likes:** 14,868  |  **Upload date:** 2026-02-19  |  **Length:** 27:51  |  **Transcript segments:** 924 ✅ verified non-empty
- **Concrete takeaways:**
  - Five concrete hacks for non-slop websites. Hack #0 (the prerequisite) is a CLAUDE.md: treat it as the system prompt read on every request, keep it concise, and give it the rules - you will have to revisit and update it as the project evolves.
  - Setup shown: VS Code -> Extensions -> install 'Claude Code' -> sign in with a paid Anthropic plan (Pro works; Max if you hit limits) -> Open Folder on an empty project folder -> files on the left, agent on the right.

### 23. How I Built INSANE Claude Design Websites In 10 Minutes

- **Channel:** Jono Catliff  |  **Video ID:** `xYv4_cTOSNM`  |  **URL:** https://www.youtube.com/watch?v=xYv4_cTOSNM
- **Views:** 225,601  |  **Likes:** 4,849  |  **Upload date:** 2026-04-18  |  **Length:** 16:28  |  **Transcript segments:** 470 ✅ verified non-empty
- **Concrete takeaways:**
  - Uses getdesign.md - free brand kits for 68 major brands - copied into Claude Design's Design Systems tab > 'additional notes', which then generates a full reusable design system (headlines, colors, font families, icon set, buttons, marketing UI kit) in ~5 minutes.
  - Also: dark mode toggle, and tying the site to the user's time zone (light by day, dark at night).
  - Then choose prototype -> name it -> select the created design system -> pick HIGH FIDELITY (not wireframe) - that choice is what makes the output beautiful.

### 24. Insane Claude Design Skills You Need To Build Beautiful Websites

- **Channel:** AI LABS  |  **Video ID:** `Ot582-E61ac`  |  **URL:** https://www.youtube.com/watch?v=Ot582-E61ac
- **Views:** 174,799  |  **Likes:** 4,672  |  **Upload date:** 2026-06-23  |  **Length:** 14:14  |  **Transcript segments:** 443 ✅ verified non-empty
- **Concrete takeaways:**
  - Install-and-go tour of the Claude design skills needed for beautiful sites, focused on getting from a generic prompt to a designed result.

### 25. Claude Code Just Dropped /Design. (Master it in 8 Minutes).

- **Channel:** Tristen O'Brien  |  **Video ID:** `Fqlc0N1qyMo`  |  **URL:** https://www.youtube.com/watch?v=Fqlc0N1qyMo
- **Views:** 161,296  |  **Likes:** 2,749  |  **Upload date:** 2026-08-25  |  **Length:** 8:03  |  **Transcript segments:** 274 ✅ verified non-empty
- **Concrete takeaways:**
  - Claude Code shipped a native /design command - a first-class design mode inside the agent, taught end-to-end in 8 minutes.

### 26. Claude Code Frontend Design: 2 Skills That will 10x your UI

- **Channel:** Coding With Abbas  |  **Video ID:** `QDqjteRiOdI`  |  **URL:** https://www.youtube.com/watch?v=QDqjteRiOdI
- **Views:** 11,690  |  **Likes:** 39  |  **Upload date:** 2026-09-14  |  **Length:** 15:00  |  **Transcript segments:** 368 ✅ verified non-empty
- **Concrete takeaways:**
  - Two specific skills that multiply UI quality in Claude Code, contrasted against the default output, including an impeccable-style design skill and skill-creator as the way to author your own.

### 27. Design with Claude Code: A Crash Course

- **Channel:** UI Collective  |  **Video ID:** `ljJuOxTsrtY`  |  **URL:** https://www.youtube.com/watch?v=ljJuOxTsrtY
- **Views:** 51,826  |  **Likes:** 428  |  **Upload date:** 2026-09-29  |  **Length:** 17:15  |  **Transcript segments:** 485 ✅ verified non-empty
- **Concrete takeaways:**
  - Crash-course format: from zero to producing design-grade output, including where an 'impeccable' design skill fits into the pipeline.

### 28. Design in Claude Code Like This

- **Channel:** UI Collective  |  **Video ID:** `lwOIVNRHndM`  |  **URL:** https://www.youtube.com/watch?v=lwOIVNRHndM
- **Views:** 27,193  |  **Likes:** 767  |  **Upload date:** 2026-04-13  |  **Length:** 15:51  |  **Transcript segments:** 479 ✅ verified non-empty
- **Concrete takeaways:**
  - Specific UI Collective take on driving design decisions through Claude Code rather than bolting AI on at the end.

### 29. Full Tutorial: From Idea to App with Claude Design and Claude Code in 25 Minutes

- **Channel:** Peter Yang  |  **Video ID:** `G9o8eoHzpxc`  |  **URL:** https://www.youtube.com/watch?v=G9o8eoHzpxc
- **Views:** 29,823  |  **Likes:** 603  |  **Upload date:** 2026-07-29  |  **Length:** 25:27  |  **Transcript segments:** 754 ✅ verified non-empty
- **Concrete takeaways:**
  - End-to-end: idea -> Claude Design (for the design/system) -> Claude Code (to build), 25 minutes. Uses design.md as the shared artifact between the two tools.

### 30. AI + Design Systems in 2026: The Workflow I Actually Use

- **Channel:** UI Collective  |  **Video ID:** `XfezMs8B-O8`  |  **URL:** https://www.youtube.com/watch?v=XfezMs8B-O8
- **Views:** 62,568  |  **Likes:** 1,467  |  **Upload date:** 2026-01-26  |  **Length:** 31:49  |  **Transcript segments:** 892 ✅ verified non-empty
- **Concrete takeaways:**
  - The negative space is the value: what AI CANNOT do in a design system today - it cannot build a Figma variable library from scratch, cannot translate 'build me a dashboard' into a Figma file using your system, and cannot build components.
  - It also cannot use your components: AI-generated Figma output uses GROUPS rather than auto-layout frames and only applies your variables/component styles, so 'the components aren't actually used' - you end up rebuilding it anyway.
  - Hard warning: 'don't trust any tool that says it builds perfect components / builds designs using your components' - you will spend more time fighting it than making progress.
  - Also: AI-generated images are not good enough for mockups - use AI for quick mockups only.

### 31. AI and Design Systems: What Actually Works (and What Doesn’t)

- **Channel:** UI Collective  |  **Video ID:** `gIvxgXRGGpk`  |  **URL:** https://www.youtube.com/watch?v=gIvxgXRGGpk
- **Views:** 39,446  |  **Likes:** 1,099  |  **Upload date:** 2026-04-27  |  **Length:** 42:05  |  **Transcript segments:** 1248 ✅ verified non-empty
- **Concrete takeaways:**
  - Hard numbers on the 'AI built my design system in 5 minutes' claim: it is clickbait. A real design system has 200+ components and atom components; AI gave him a button component set - the easiest possible component - and it STILL took 11 minutes, and none of it was wired into any UI yet.
  - Google Stitch produces a palette/fonts/radius list plus a component preview - that is not a design system.
  - What AI IS good for: generating modules that go into real client design systems, and building DOCUMENTATION of existing components.

### 32. Agentic Design Systems in 2026 with Brad Frost

- **Channel:** Chromatic  |  **Video ID:** `Vg78K3t9KYc`  |  **URL:** https://www.youtube.com/watch?v=Vg78K3t9KYc
- **Views:** 14,827  |  **Likes:** 243  |  **Upload date:** 2025-12-11  |  **Length:** 80:50  |  **Transcript segments:** 801 ✅ verified non-empty
- **Concrete takeaways:**
  - Chromatic/Storybook founder Dominic Gannaway + Brad Frost (author of Atomic Design) on agentic design systems, 80 minutes. The core diagnosis: agents ignore your design system and invent their own patterns while saying 'you're absolutely right'.
  - Why: agents don't interpret like humans - they consume CONTEXT, METADATA AND EXAMPLES. 'When that context is flaky, they don't ask questions, they just make things up.'
  - The implication for design systems: the way we document them for humans (prose, visual QA) does not suit agents; they need structured, machine-readable context plus worked examples.
  - Attended by ~588 participants - the canonical long-form reference on design systems for agents.

### 33. Design Systems in the Age of Agents: What Changes, What Doesn't

- **Channel:** Hatch Conference  |  **Video ID:** `JeJhPtsbIGA`  |  **URL:** https://www.youtube.com/watch?v=JeJhPtsbIGA
- **Views:** 54,042  |  **Likes:** 689  |  **Upload date:** 2026-10-05  |  **Length:** 31:20  |  **Transcript segments:** 753 ✅ verified non-empty
- **Concrete takeaways:**
  - Hatch Conference talk on what changes and what does NOT when design systems meet agents - a useful counterweight to the hype videos.

### 34. AI + Design Systems: The Honest Truth Nobody’s Telling You

- **Channel:** UI Collective  |  **Video ID:** `dWEvzEkg9hM`  |  **URL:** https://www.youtube.com/watch?v=dWEvzEkg9hM
- **Views:** 17,679  |  **Likes:** 299  |  **Upload date:** 2026-10-12  |  **Length:** 35:45  |  **Transcript segments:** 1044 ✅ verified non-empty
- **Concrete takeaways:**
  - The skeptical, honest-truth pass on AI + design systems - the counterpoint video to the workflow-optimistic ones.

### 35. How to Build an AI-Ready Design System (Figma MCP + Claude Code)

- **Channel:** Headway  |  **Video ID:** `ER0YxBlJMZg`  |  **URL:** https://www.youtube.com/watch?v=ER0YxBlJMZg
- **Views:** 3,592  |  **Likes:** 58  |  **Upload date:** 2026-07-23  |  **Length:** 58:42  |  **Transcript segments:** 1456 ✅ verified non-empty
- **Concrete takeaways:**
  - Build an 'AI-ready' design system via Figma MCP + Claude Code, in 5 levels. Companion article: headway.io/blog/the-5-levels-of-an-ai-ready-design-system.

### 36. Designing With AI: Claude, Codex, Figma | Full Guide

- **Channel:** UI Collective  |  **Video ID:** `j_ZPV10bu54`  |  **URL:** https://www.youtube.com/watch?v=j_ZPV10bu54
- **Views:** 219,373  |  **Likes:** 5,009  |  **Upload date:** 2026-05-04  |  **Length:** 87:43  |  **Transcript segments:** 2546 ✅ verified non-empty
- **Concrete takeaways:**
  - The most complete 87-minute AI design workflow reference (Claude, Codex, Claude Design, Figma), teaching how to TRAIN AI on your design system rather than just upload it.
  - The dream tool does not exist - you cannot upload a design system and have AI know every variable, style, component and usage rule; you must run a series of prompts to train it.
  - Explicitly teaches: how to train AI on your design system, generate original screens, improve AI output quality, and combine tools without wasting tokens.
  - Figma MCP catalog link: figma.com/mcp-catalog/

### 37. Design with AI - Full Guide (Tools, Workflows, Design Systems)

- **Channel:** UI Collective  |  **Video ID:** `r-MPiu0E4W4`  |  **URL:** https://www.youtube.com/watch?v=r-MPiu0E4W4
- **Views:** 81,274  |  **Likes:** 1,225  |  **Upload date:** 2026-09-15  |  **Length:** 111:39  |  **Transcript segments:** 3215 ✅ verified non-empty
- **Concrete takeaways:**
  - 111-minute end-to-end AI design guide: tools, workflows and design systems, with live model comparisons (Opus 4.8 vs Claude Fable) and an explicit 'what AI still cannot do' section.

### 38. Shadcn CLI v4 - This Changes Everything (Exclusive First Look 👀)

- **Channel:** OrcDev  |  **Video ID:** `m-gIqQTHcAY`  |  **URL:** https://www.youtube.com/watch?v=m-gIqQTHcAY
- **Views:** 69,648  |  **Likes:** 4,123  |  **Upload date:** 2026-03-06  |  **Length:** 16:00  |  **Transcript segments:** 386 ✅ verified non-empty
- **Concrete takeaways:**
  - Shadcn CLI v4 walkthrough with exact commands: npx shadcn init (new templates for React Router, Astro, Laravel plus the existing Next.js/TanStack; Vite supported), then npx shadcn add demo to pull the whole demo component set.
  - New in v4: a monorepo setup question at init time; a component-library choice between Radix and Base UI (Base UI selectable from the CLI, previously only from the create page); and PRESETS - a new concept pairing an icon set with a font (Nova = Lucide + Geist, Vega = Lucide + Inter, others = Phosphor + JetBrains Mono).
  - The demo component becomes a live mini design system you can inspect - buttons, colors, icons - plus dark mode toggle.
  - The shadcn 'create project' page is now the source of a shareable PRESET CODE (e.g. a preset string like 'aKG33fG' that also appears in the URL), letting you round-trip a config between the web UI and the CLI.
  - Also referenced: npx skills add shadcn/ui.

### 39. Shadcn UI Agent: The Fix for Broken, AI-Generated UIs

- **Channel:** Eric Tech  |  **Video ID:** `YKJLpgXTxCo`  |  **URL:** https://www.youtube.com/watch?v=YKJLpgXTxCo
- **Views:** 32,766  |  **Likes:** 1,054  |  **Upload date:** 2025-07-25  |  **Length:** 10:30  |  **Transcript segments:** 326 ✅ verified non-empty
- **Concrete takeaways:**
  - The 'fix for broken AI-generated UIs' workflow, using the shadcn-ui MCP server to give coding agents the component context they lack.
  - Install steps: create a GitHub Personal Access Token (github.com/settings/tokens) - without a token the MCP is limited to 60 req/hour, with one up to 5,000/hour - then set the GITHUB_TOKEN env var and add the shadcn-ui MCP server to your editor (Cursor gear icon -> MCP servers -> Edit).
  - Test prompt calls the MCP's get-component function and returns the actual shadcn button source code - that is how you verify the server works.
  - Available MCP tools: get component, get component usage examples, list all components, get component metadata/dependencies, and get blocks (a block = a bundle of components, e.g. sidebars, charts).
  - The end goal shown: one prompt produces a fully functional Next.js app with a correct UI instead of broken components and styling issues.

### 40. Shadcn's NEW MCP is Here: Build UIs with AI Agents & Claude Code

- **Channel:** Eric Tech  |  **Video ID:** `TxsNTqaTrKw`  |  **URL:** https://www.youtube.com/watch?v=TxsNTqaTrKw
- **Views:** 25,106  |  **Likes:** 565  |  **Upload date:** 2025-09-15  |  **Length:** 12:09  |  **Transcript segments:** 401 ✅ verified non-empty
- **Concrete takeaways:**
  - Shadcn's MCP server for building UIs with AI agents + Claude Code - the registry/manifest route so agents can pull real component definitions instead of hallucinating them.

### 41. The Ultimate Shadcn UI + Claude Code Workflow (Design System, Claude Extension, MCP, Figma, Builder)

- **Channel:** ByteGrad  |  **Video ID:** `qutWPWDlzRw`  |  **URL:** https://www.youtube.com/watch?v=qutWPWDlzRw
- **Views:** 39,291  |  **Likes:** 599  |  **Upload date:** 2026-01-26  |  **Length:** 18:35  |  **Transcript segments:** 548 ✅ verified non-empty
- **Concrete takeaways:**
  - The canonical 'set the fundamentals BEFORE handing to an agent' workflow: scaffold the project manually first (he deliberately does NOT let an agent scaffold a new app: 'I do like to do it manually in the beginning because I want to be very precise with how we're starting off the project'), then bring in Claude Code to build on top.
  - Shadcn's create UI now exposes presets, a component-library choice (Radix UI vs the newer Base UI - he expects Base UI to become the default) and a **shuffle** button that randomly combines style+color so you can click through combinations and pick one.
  - Scaffold by copying the command the create page gives you (e.g. create-next-app), run the app, and the generated example page doubles as a live preview of the design system you just committed to - inspect its cart and form components before writing any code.
  - Uses the Claude Code VS Code extension (icon in the gutter) rather than the terminal if you prefer it.

### 42. Shadcn Just Fixed Tailwind's Biggest Problem

- **Channel:** Better Stack  |  **Video ID:** `tPQgw_DPIoM`  |  **URL:** https://www.youtube.com/watch?v=tPQgw_DPIoM
- **Views:** 125,316  |  **Likes:** 1,467  |  **Upload date:** 2026-09-21  |  **Length:** 6:59  |  **Transcript segments:** 221 ✅ verified non-empty
- **Concrete takeaways:**
  - Better Stack on the shadcn/Tailwind combination problem that shadcn now fixes - includes the github.com/shadcn-ui/lint tooling.

### 43. This NEW Shadcn Update Builds Beautiful App UI in Minutes (Shadcn Create)

- **Channel:** Build Great Products  |  **Video ID:** `1hhjW_YtNdA`  |  **URL:** https://www.youtube.com/watch?v=1hhjW_YtNdA
- **Views:** 6,797  |  **Likes:** 148  |  **Upload date:** 2025-12-16  |  **Length:** 11:47  |  **Transcript segments:** 336 ✅ verified non-empty
- **Concrete takeaways:**
  - Shadcn Create end-to-end: the new create-project page generates a full app UI (not just a component) in minutes, with light/dark and preset configuration.

### 44. Shadcn Create + Opus 4.5 / Gemini 3 Pro: This is THE BEST WAY to make BEAUTIFUL APPS with AI!

- **Channel:** AICodeKing  |  **Video ID:** `eSUe62dnfYw`  |  **URL:** https://www.youtube.com/watch?v=eSUe62dnfYw
- **Views:** 16,122  |  **Likes:** 421  |  **Upload date:** 2025-12-14  |  **Length:** 11:38  |  **Transcript segments:** 255 ✅ verified non-empty
- **Concrete takeaways:**
  - The 'best way to make beautiful apps with AI' pairing: Shadcn Create with a strong model (Opus 4.5 / Gemini 3 Pro) - the combination of a structured UI generator plus a capable model.

### 45. Shadcn is now PERFECT for Vibe Coding (v2 changes)

- **Channel:** Better Stack  |  **Video ID:** `sIvYbCZzAts`  |  **URL:** https://www.youtube.com/watch?v=sIvYbCZzAts
- **Views:** 17,098  |  **Likes:** 381  |  **Upload date:** 2025-12-19  |  **Length:** 6:59  |  **Transcript segments:** 230 ✅ verified non-empty
- **Concrete takeaways:**
  - Shadcn v2 changes that made it viable for vibe coding - the specific structural changes that stop agents producing broken components.

### 46. Shadcn Isn’t Just a Library Anymore… Here’s How to 10x Your UI

- **Channel:** AI LABS  |  **Video ID:** `V8rGgwQ-VJ0`  |  **URL:** https://www.youtube.com/watch?v=V8rGgwQ-VJ0
- **Views:** 118,054  |  **Likes:** 3,734  |  **Upload date:** 2025-07-17  |  **Length:** 9:24  |  **Transcript segments:** 280 ✅ verified non-empty
- **Concrete takeaways:**
  - Shadcn as more than a component library - the registry/blocks model is what lets agents assemble real interfaces instead of hallucinating markup.

### 47. Stop Building AI Slop – Build High-End Web Apps with AI

- **Channel:** freeCodeCamp.org  |  **Video ID:** `g3X8JauSWTM`  |  **URL:** https://www.youtube.com/watch?v=g3X8JauSWTM
- **Views:** 136,038  |  **Likes:** 1,915  |  **Upload date:** 2026-08-25  |  **Length:** 64:16  |  **Transcript segments:** 1945 ✅ verified non-empty
- **Concrete takeaways:**
  - 64-minute freeCodeCamp course on shipping high-end web apps with AI instead of AI slop. Five steps, with a real app (an influencer/stock tracker with charts) as the case study.
  - Step 1 - CONTEXT FIRST: you cannot collect context without knowing what context to collect, so use a skill that interrogates YOU until the model fully understands what you're building (a grill-me-style interview skill).
  - Steps 2-3: find inspirations and CLONE a proven UI architecture, then build your own version using the context you collected.
  - Step 4: use skills/tools to RESTYLE the entire application rather than hand-tuning.
  - Step 5: add Apple-style scroll animations, then deploy the front-end to Cloudflare.
  - The stated thesis: if you don't provide context, AI guesses your features and style, and accuracy drops.

### 48. Stop using V0 and Lovable to prototype, use Claude Code instead

- **Channel:** The Design Project  |  **Video ID:** `hqIU6hluMZA`  |  **URL:** https://www.youtube.com/watch?v=hqIU6hluMZA
- **Views:** 7,600  |  **Likes:** 199  |  **Upload date:** 2026-02-01  |  **Length:** 11:49  |  **Transcript segments:** 298 ✅ verified non-empty
- **Concrete takeaways:**
  - The v0/Lovable vs Claude Code argument, stated as a failure mode: 45 minutes of 'fix this, break that, fix the other' is the wall where a sandbox stops working.
  - Root cause: sandbox tools MAKE DECISIONS FOR YOU, so when they guess wrong you don't know what they decided or why it broke - 'you can't fix what you don't understand'.
  - The stakeholder trap: a v0/Lovable prototype looks great, then your dev team says 'we can't use any of this code - it doesn't match our codebase, our design system, or our architecture' - you ADDED a cycle to the dev process instead of removing one.
  - The fix: prototype directly in the real codebase. Same chat UX, but built on your team's existing foundation. Uses Ghostty as the terminal (Cursor if you want the whole IDE, Ghostty if you only want the chat window).
  - Also: dictate instead of typing (Whisper Flow, Fn key), and in plan mode prefix with 'I am a world-renowned startup CTO' to raise the quality of the plan.

### 49. Claude Code vs. Lovable: 90% of You Are Choosing Wrong

- **Channel:** Luuk Alleman  |  **Video ID:** `vH8Gj-aDHcw`  |  **URL:** https://www.youtube.com/watch?v=vH8Gj-aDHcw
- **Views:** 38,495  |  **Likes:** 715  |  **Upload date:** 2026-02-15  |  **Length:** 7:19  |  **Transcript segments:** 192 ✅ verified non-empty
- **Concrete takeaways:**
  - A direct rebuttal of the 'Lovable is for MVPs, graduate to Claude Code' myth: people are making thousands/month from Lovable apps with full OAuth, database, payments and edge functions - 'calling those prototypes is just not accurate'.
  - Also rebuts 'use Lovable for front-end, Claude Code for back-end' - that creates TWO codebases, TWO deployment setups, and a connection problem, when Lovable's backend (Supabase edge functions, DB triggers, cron, webhooks, RLS) is already in the SAME project.
  - When you actually need Claude Code, the list is short and specific: (1) you have an existing codebase you can't rebuild (their example: 40,000 lines from 3 developers over 2 years, half undocumented) - something that can read the entire codebase and understand it.

### 50. I Made Vox-Style Motion Graphics Using Only Claude Code & Remotion

- **Channel:** MoSidd  |  **Video ID:** `7wuYBfE131U`  |  **URL:** https://www.youtube.com/watch?v=7wuYBfE131U
- **Views:** 232,244  |  **Likes:** 7,161  |  **Upload date:** 2026-06-28  |  **Length:** 13:11  |  **Transcript segments:** 362 ✅ verified non-empty
- **Concrete takeaways:**
  - Building a 47-second Vox-style explainer with Claude Code + Remotion, with the production pipeline spelled out: script (voice-over lines) IS the timeline; each beat maps to a visual; foreground and midground cutout assets are generated (they used GPT image gen / Magnific); then you LOCK A VISUAL SYSTEM - one shared background across all scenes, the same fonts, the same accent palette - and only the midground/foreground cutouts change per scene.
  - Folder architecture: each scene is its own folder containing its cutouts, with the shared background living in every scene.
  - MCP setup shown: in Claude Code go to Settings -> Connectors -> Customize, add a custom connector with the Magnific (and Higgsfield) MCP server address, so the agent fetches images directly instead of you downloading them.
  - Skill/dir names: remotion.dev is the core tool.

### 51. Master 95% of Claude Code Skills in 28 Minutes

- **Channel:** Nate Herk | AI Automation  |  **Video ID:** `zKBPwDpBfhs`  |  **URL:** https://www.youtube.com/watch?v=zKBPwDpBfhs
- **Views:** 245,947  |  **Likes:** 4,859  |  **Upload date:** 2026-02-27  |  **Length:** 27:18  |  **Transcript segments:** 936 ✅ verified non-empty
- **Concrete takeaways:**
  - The clearest live demo of parallel skill-driven agents: four Claude Code instances running at once - a 'morning coffee' skill that plans your day from ClickUp, a 'pulse check' on projects and commitments, an Excalidraw diagram skill, and a YouTube comment analysis skill. ~30 seconds of prompting.
  - Two distinct skills solve one problem: 'excalidraw visuals' (AI-generated image, garbled text) vs 'excalidraw diagrams' (real, editable, perfectly-spelled Excalidraw because it is typed, not rendered).
  - The compounding argument: all agents share the same skill context about your business/projects/channel, so output stays consistent across sessions.
  - Skills can be monetized as packaged SOPs for a team, and shipped in a free community library.

### 52. Anthropic's Full Claude Skills Guide In 22 Minutes

- **Channel:** Mark Kashef  |  **Video ID:** `TzJecWCbex0`  |  **URL:** https://www.youtube.com/watch?v=TzJecWCbex0
- **Views:** 62,523  |  **Likes:** 1,372  |  **Upload date:** 2026-02-15  |  **Length:** 22:19  |  **Transcript segments:** 617 ✅ verified non-empty
- **Concrete takeaways:**
  - A 22-minute diagrammed walkthrough of Anthropic's own 33-page skills guide, organized around its six chapters: fundamentals, planning and design, testing and iteration, distribution and sharing, patterns and troubleshooting, resources.
  - Three levels of 'magic': (1) YAML front matter - always in the system prompt of every session, (2) the full SKILL.md body loaded on match, (3) referenced scripts/assets loaded and executed as needed.
  - Concrete verification technique: run /context to see which skills are actually loaded (and their token cost) - MCP tools are muted to preserve context but skill front matter is always present.
  - Also covers the Claude Agent SDK as the programmatic surface for skills.

### 53. From Prompts to Agents: AI Agent Skills in Claude Code

- **Channel:** Dataminded  |  **Video ID:** `jlX4sTbNHpc`  |  **URL:** https://www.youtube.com/watch?v=jlX4sTbNHpc
- **Views:** 1,321  |  **Likes:** 21  |  **Upload date:** 2026-02-24  |  **Length:** 25:21  |  **Transcript segments:** 412 ✅ verified non-empty
- **Concrete takeaways:**
  - Conceptual bridge from prompt engineering to context engineering, with a chapter list (what are skills / skills vs commands / how an agent uses a skill / creating skills step-by-step / advanced: arguments / sharing & integrations / the .claude folder).
  - Two worked example skills shown: an 'explain code' skill that structures educational breakdowns, and a 'PR review' skill that FORKS CONTEXT, LIMITS TOOL PERMISSIONS, and uses CLI commands.
  - Links the Anthropic 'Complete Guide to Building Skills for Claude' PDF and the agent-skills overview doc.

### 54. How AI agents & Claude skills work (Clearly Explained)

- **Channel:** Greg Isenberg  |  **Video ID:** `S_oN3vlzpMw`  |  **URL:** https://www.youtube.com/watch?v=S_oN3vlzpMw
- **Views:** 922,241  |  **Likes:** 19,459  |  **Upload date:** 2026-04-08  |  **Length:** 35:25  |  **Transcript segments:** 1061 ✅ verified non-empty
- **Concrete takeaways:**
  - 35-minute plain-English explanation of how AI agents and Claude skills work, aimed at people who have not read the docs - good orientation before the deeper videos.

### 55. How Senior Engineers Actually Build With AI in 2026 | Build a Full Stack Systems Architecture App

- **Channel:** JavaScript Mastery  |  **Video ID:** `14RP8liACqo`  |  **URL:** https://www.youtube.com/watch?v=14RP8liACqo
- **Views:** 1,375,517  |  **Likes:** 12,591  |  **Upload date:** 2026-05-01  |  **Length:** 238:17  |  **Transcript segments:** 6166 ✅ verified non-empty
- **Concrete takeaways:**
  - Nearly 4 hours, the single densest end-to-end build. The concrete skills-on-demand commands are the standout: npx skills add clerk, npx skills add prisma, npx skills add liveblocks, npx skills add trigger.dev, plus npm install prisma and npm install @trigger.dev/react-hooks - i.e. vendor-published skills pulled straight into Claude Code via the skills CLI.
  - Uses an AGENTS.md file alongside CLAUDE.md for repo-wide agent instructions.
  - The flow is GitHub-issue-driven: write a PRD, file it as an issue, break it into child issues, then loop over issues with an agent until each is done.

### 56. Claude Code Full Course 2026 | How Senior Engineers Actually Build with AI

- **Channel:** JavaScript Mastery  |  **Video ID:** `u2QqWkMv3Lg`  |  **URL:** https://www.youtube.com/watch?v=u2QqWkMv3Lg
- **Views:** 244,505  |  **Likes:** 3,302  |  **Upload date:** 2026-09-25  |  **Length:** 133:39  |  **Transcript segments:** 3398 ✅ verified non-empty
- **Concrete takeaways:**
  - 2h15m full course on how senior engineers actually build with AI. Concrete commands: npx skills add betterauth (install a vendor's skill), pnpm build, git status; uses both CLAUDE.md and AGENTS.md.

### 57. Building a Real App with Claude Code (Start to Finish)

- **Channel:** Tech With Tim  |  **Video ID:** `misjUj4Q_ho`  |  **URL:** https://www.youtube.com/watch?v=misjUj4Q_ho
- **Views:** 139,688  |  **Likes:** 1,217  |  **Upload date:** 2026-09-28  |  **Length:** 22:58  |  **Transcript segments:** 762 ✅ verified non-empty
- **Concrete takeaways:**
  - A real app build start to finish, with the Claude Code workflow surfaces actually used: /skills, /plugin, and /design inside the session.

### 58. Build and deploy a full app with Claude Code in 2026 (full tutorial)

- **Channel:** No Code MBA  |  **Video ID:** `sKBuSaaoN1Y`  |  **URL:** https://www.youtube.com/watch?v=sKBuSaaoN1Y
- **Views:** 124,023  |  **Likes:** 1,624  |  **Upload date:** 2026-03-25  |  **Length:** 16:34  |  **Transcript segments:** 341 ✅ verified non-empty
- **Concrete takeaways:**
  - Full app build AND deploy in 16 minutes - includes the deploy step that most skill videos omit.

### 59. How I Vibe Coded a $400K/mo App with Claude Code (Full Tutorial)

- **Channel:** Jason Lee  |  **Video ID:** `hDOUzlJwM1E`  |  **URL:** https://www.youtube.com/watch?v=hDOUzlJwM1E
- **Views:** 393,399  |  **Likes:** 10,273  |  **Upload date:** 2026-04-24  |  **Length:** 20:28  |  **Transcript segments:** 647 ✅ verified non-empty
- **Concrete takeaways:**
  - Building a real revenue-generating app end to end; useful as a reference for how much process a serious build needs vs a demo.

### 60. How I Vibe Coded a Full App using Claude Code (with Database, Payment, Login)

- **Channel:** Jason Lee  |  **Video ID:** `fgrXAeNj9tM`  |  **URL:** https://www.youtube.com/watch?v=fgrXAeNj9tM
- **Views:** 378,692  |  **Likes:** 7,651  |  **Upload date:** 2026-05-30  |  **Length:** 31:44  |  **Transcript segments:** 997 ✅ verified non-empty
- **Concrete takeaways:**
  - The same author on wiring a real backend into an AI-built app: database, payments, and login - the parts Claude Code demos usually skip.

### 61. Build $10,000 Websites using Claude Code (Ultimate Guide)

- **Channel:** Metics Media  |  **Video ID:** `VMvZuhcDdnw`  |  **URL:** https://www.youtube.com/watch?v=VMvZuhcDdnw
- **Views:** 1,213,274  |  **Likes:** 39,006  |  **Upload date:** 2026-05-29  |  **Length:** 26:09  |  **Transcript segments:** 636 ✅ verified non-empty
- **Concrete takeaways:**
  - 26-minute guide to getting a $10k-quality marketing site out of Claude Code, including pulling components from 21st.dev.

### 62. Claude just got another superpower...

- **Channel:** Fireship  |  **Video ID:** `jeA-KBv0b68`  |  **URL:** https://www.youtube.com/watch?v=jeA-KBv0b68
- **Views:** 932,527  |  **Likes:** 27,532  |  **Upload date:** 2026-04-21  |  **Length:** 5:12  |  **Transcript segments:** 158 ✅ verified non-empty
- **Concrete takeaways:**
  - 5-minute Fireship summary of a major Claude release - fast context on what shipped.

### 63. Agent Skills or MCP in the era of Claude Code?

- **Channel:** Confluent Developer  |  **Video ID:** `pvxNcQTcIy4`  |  **URL:** https://www.youtube.com/watch?v=pvxNcQTcIy4
- **Views:** 224,221  |  **Likes:** 4,217  |  **Upload date:** 2026-03-10  |  **Length:** 9:56  |  **Transcript segments:** 243 ✅ verified non-empty
- **Concrete takeaways:**
  - The cleanest explanation of the Skills vs MCP boundary: MCP is a protocol for reaching external systems; Skills are portable instruction packages that run inside any agent. Config framing for enterprise adoption.

### 64. How to Create Claude Code Agent Skills in 2026

- **Channel:** Code with Beto  |  **Video ID:** `nbqqnl3JdR0`  |  **URL:** https://www.youtube.com/watch?v=nbqqnl3JdR0
- **Views:** 71,650  |  **Likes:** 960  |  **Upload date:** 2026-01-05  |  **Length:** 14:11  |  **Transcript segments:** 356 ✅ verified non-empty
- **Concrete takeaways:**
  - Practical 2026 walkthrough of creating agent skills in Claude Code, using skill-creator rather than hand-writing files.

### 65. How to Create Good Agent Skills | Claude Code Guide

- **Channel:** Code with Beto  |  **Video ID:** `Ik-Xbz2hvM0`  |  **URL:** https://www.youtube.com/watch?v=Ik-Xbz2hvM0
- **Views:** 24,236  |  **Likes:** 324  |  **Upload date:** 2026-01-28  |  **Length:** 11:06  |  **Transcript segments:** 311 ✅ verified non-empty
- **Concrete takeaways:**
  - The 'don't write skills manually' argument, with a minimal worked example (an email-footer skill) and skill-creator as the tool to use instead.
  - Skill Creator repo: github.com/anthropics/skills

### 66. How to Create Skills in Claude

- **Channel:** Tom Nassr | XRAY   |  **Video ID:** `FWjDzITF86k`  |  **URL:** https://www.youtube.com/watch?v=FWjDzITF86k
- **Views:** 111,300  |  **Likes:** 1,137  |  **Upload date:** 2026-04-06  |  **Length:** 8:42  |  **Transcript segments:** 238 ✅ verified non-empty
- **Concrete takeaways:**
  - How to create skills in the Claude app (not just Claude Code) - the desktop-side workflow and where skills live there.

### 67. Stop Prompting: How Claude Code Skills Actually Work

- **Channel:** J-HAYER  |  **Video ID:** `7Z-t3njCjyk`  |  **URL:** https://www.youtube.com/watch?v=7Z-t3njCjyk
- **Views:** 257  |  **Likes:** 3  |  **Upload date:** 2026-05-18  |  **Length:** 16:17  |  **Transcript segments:** 379 ✅ verified non-empty
- **Concrete takeaways:**
  - The skill hierarchy made explicit: enterprise scope -> personal ~/.claude/skills (all projects) -> project .claude/skills -> plugins.
  - The 'keep CLAUDE.md short and precise' rule: put repeated workflow instructions in a SKILL instead of bloating CLAUDE.md.
  - Front matter options beyond name/description: when-to-use, model, and reasoning effort (low / medium / high / xhigh / max) - use a stronger model + high effort for planning skills.
  - The $ARGUMENTS-style string substitution for parameterizing a skill, and /skills to list what's loaded (it shows the scope - user vs project vs plugin - and the token cost).
  - Workflow for improving an existing skill: paste the Anthropic docs into a higher model (Opus), ask it to analyze and split the skill correctly, then review the proposed front matter and reference-file split.
  - Cites Matt Pocock's 'Grill Me' skill (~150k installs in the in-CLI marketplace) and the /find-skills marketplace command.

### 68. Everything You Know About Skills IS OUTDATED

- **Channel:** Simon Scrapes  |  **Video ID:** `e7TY56-yIvM`  |  **URL:** https://www.youtube.com/watch?v=e7TY56-yIvM
- **Views:** 316,115  |  **Likes:** 3,036  |  **Upload date:** 2026-10-01  |  **Length:** 12:49  |  **Transcript segments:** 423 ✅ verified non-empty
- **Concrete takeaways:**
  - A 2026-dated 'everything you know about skills is outdated' update - the most recent state of the skills ecosystem (Oct 2026 upload), worth reading for changes since the earlier videos.

### 69. Claude Code's #1 Token Saving Skill Just Got Upgraded (But Is It BS?)

- **Channel:** Chase AI  |  **Video ID:** `4B1iGFShCnI`  |  **URL:** https://www.youtube.com/watch?v=4B1iGFShCnI
- **Views:** 28,015  |  **Likes:** 408  |  **Upload date:** 2026-10-19  |  **Length:** 17:06  |  **Transcript segments:** 465 ✅ verified non-empty
- **Concrete takeaways:**
  - Examines a token-saving skill (Oct 2026) - the mechanism by which Claude Code reuses session context to avoid re-spending tokens, and whether the claims hold up.
  - Repo: github.com/DietrichGebert/ponytail

### 70. The Ultimate AI Design Workflow for UI/UX

- **Channel:** Griffin Wooldridge  |  **Video ID:** `GcNwDqqoafo`  |  **URL:** https://www.youtube.com/watch?v=GcNwDqqoafo
- **Views:** 55,247  |  **Likes:** 1,399  |  **Upload date:** 2026-02-23  |  **Length:** 14:58  |  **Transcript segments:** 501 ✅ verified non-empty
- **Concrete takeaways:**
  - A single coherent UI/UX workflow rather than a tool tour - the practical 'what do I actually do on Monday' version.

### 71. My Simple AI Workflow for UI/UX Design in 2026

- **Channel:** Griffin Wooldridge  |  **Video ID:** `mrXOSXLb8-g`  |  **URL:** https://www.youtube.com/watch?v=mrXOSXLb8-g
- **Views:** 14,289  |  **Likes:** 283  |  **Upload date:** 2026-04-27  |  **Length:** 8:09  |  **Transcript segments:** 264 ✅ verified non-empty
- **Concrete takeaways:**
  - The anti-tool-hoarding argument: designers end up with 15 disconnected AI tools; a complete practical workflow only needs a few. The point is that they connect.
  - The chain: Granola (runs locally, no bot joining the call, produces a *structured* meeting summary - key decisions / action items / open questions, not a wall of transcript) -> Notion as the single source of truth for specs, PRDs and interview notes -> Claude Code working *inside* that workspace.
  - Concrete integration points named: Notion's MCP support for Linear, Teams, Slack, Gmail, Drive; Claude Code in VS Code; Figma MCP.
  - Useful for structuring a real delivery pipeline rather than one-shot prompting.

### 72. Use AI Like a Senior Designer (3 Workflows)

- **Channel:** UI Collective  |  **Video ID:** `Oo-5AWdQAt8`  |  **URL:** https://www.youtube.com/watch?v=Oo-5AWdQAt8
- **Views:** 63,360  |  **Likes:** 1,363  |  **Upload date:** 2026-08-18  |  **Length:** 14:18  |  **Transcript segments:** 452 ✅ verified non-empty
- **Concrete takeaways:**
  - Three concrete senior-designer workflows with Claude, showing when a human should stay in the loop rather than delegate.

### 73. How I use (and don’t use) AI to design better in 2026

- **Channel:** Aliena Cai  |  **Video ID:** `2u6bH17NIQk`  |  **URL:** https://www.youtube.com/watch?v=2u6bH17NIQk
- **Views:** 65,483  |  **Likes:** 2,645  |  **Upload date:** 2026-03-11  |  **Length:** 21:32  |  **Transcript segments:** 696 ✅ verified non-empty
- **Concrete takeaways:**
  - The counterweight video: an experienced designer on where AI genuinely helps and where it actively hurts - the 'how I use (and don't use) AI to design better in 2026' framing.

### 74. My AI Design Process (What Actually Works)

- **Channel:** UI Collective  |  **Video ID:** `BLW5NLtQVHM`  |  **URL:** https://www.youtube.com/watch?v=BLW5NLtQVHM
- **Views:** 42,273  |  **Likes:** 1,142  |  **Upload date:** 2026-02-09  |  **Length:** 30:13  |  **Transcript segments:** 921 ✅ verified non-empty
- **Concrete takeaways:**
  - A documented personal AI design process, with the specific tools used: Mobbin, Antigravity, Cursor, CollectiveKit, Design System Labs, and the Figma MCP catalog.

### 75. How I use AI to design faster (my complete workflow)

- **Channel:** Rachel How  |  **Video ID:** `ni19lPH_wy0`  |  **URL:** https://www.youtube.com/watch?v=ni19lPH_wy0
- **Views:** 112,912  |  **Likes:** 3,217  |  **Upload date:** 2025-08-12  |  **Length:** 5:45  |  **Transcript segments:** 155 ✅ verified non-empty
- **Concrete takeaways:**
  - A short, concrete workflow from a working designer, including their Figma and Mobbin sources.

### 76. Claude Makes a New Kind of Video - Full Tutorial

- **Channel:** Futurepedia  |  **Video ID:** `Ge1B-Ok1Pfk`  |  **URL:** https://www.youtube.com/watch?v=Ge1B-Ok1Pfk
- **Views:** 92,628  |  **Likes:** 1,657  |  **Upload date:** 2026-10-19  |  **Length:** 11:19  |  **Transcript segments:** 277 ✅ verified non-empty
- **Concrete takeaways:**
  - Futurepedia tutorial on Claude generating a new kind of video - the newest (Oct 2026) motion capability, tying back to the Remotion/MCP pipeline.

### 77. How to Generate Insane AI Motion Graphics (Full Control)

- **Channel:** Zane Hoyer  |  **Video ID:** `sCc7O9K92Mg`  |  **URL:** https://www.youtube.com/watch?v=sCc7O9K92Mg
- **Views:** 134,272  |  **Likes:** 3,428  |  **Upload date:** 2026-02-07  |  **Length:** 5:43  |  **Transcript segments:** 185 ✅ verified non-empty
- **Concrete takeaways:**
  - Generating motion graphics with full control (Higgsfield) rather than one-shot - the control-oriented counterpart to the Claude Motion videos.

### 78. Build an App With Claude Design

- **Channel:** Claude  |  **Video ID:** `COJAZQM1aeQ`  |  **URL:** https://www.youtube.com/watch?v=COJAZQM1aeQ
- **Views:** 192,841  |  **Likes:** 2,040  |  **Upload date:** 2026-10-02  |  **Length:** 1:42  |  **Transcript segments:** 34 ✅ verified non-empty
- **Concrete takeaways:**
  - Official 100-second Anthropic demo of building an app with Claude Design (cowork mode) - the canonical short for the new Claude Design product.

### 79. Learn Design Systems: Figma Variables, Components, AI, and More

- **Channel:** UI Collective  |  **Video ID:** `lsgVRCJ4fko`  |  **URL:** https://www.youtube.com/watch?v=lsgVRCJ4fko
- **Views:** 62,860  |  **Likes:** 1,100  |  **Upload date:** 2026-09-09  |  **Length:** 240:41  |  **Transcript segments:** 6665 ✅ verified non-empty
- **Concrete takeaways:**
  - 4-hour design-systems course covering Figma variables, components and AI - the foundational reference if you need the variable/component mechanics themselves.

### 80. Claude Design Now Builds Beautiful $10,000 Websites (NO AI Slop)

- **Channel:** Jack Roberts  |  **Video ID:** `VwGrXe2ricE`  |  **URL:** https://www.youtube.com/watch?v=VwGrXe2ricE
- **Views:** 283,315  |  **Likes:** 5,130  |  **Upload date:** 2026-08-17  |  **Length:** 22:17  |  **Transcript segments:** 708 ✅ verified non-empty
- **Concrete takeaways:**
  - A test of Claude Design's output quality against a $10,000-site bar, with the specific reasons generated sites still read as slop.

### 81. Figma Make vs Lovable vs V0 vs Claude Code: What We Actually Use in Production

- **Channel:** The Design Project  |  **Video ID:** `dN3bL9l8uEk`  |  **URL:** https://www.youtube.com/watch?v=dN3bL9l8uEk
- **Views:** 3,641  |  **Likes:** 136  |  **Upload date:** 2025-11-20  |  **Length:** 12:05  |  **Transcript segments:** 319 ✅ verified non-empty
- **Concrete takeaways:**
  - Production-team comparison of Figma Make, Lovable, v0 and Claude Code - which they actually ship with, and why.
