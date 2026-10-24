# AI Design & Design-System Skills in the Claude Code / Agent-Skills Ecosystem
**Research date: 2026-10-20.** All star counts, licenses, push dates and SKILL.md counts were
retrieved live via `gh api repos/<owner>/<repo>` on 2026-10-20 and cached to
`~/.hermes/cache/scratch/research/ghcache/`. Install counts come from the skills.sh public
search API (`https://skills.sh/api/search?q=`) on the same date.

**Method note:** the `skills` npm CLI (v1.7.4, published 2026-10-19) was executed to confirm it
is the real install path (`npx skills add <owner/repo>`); `vercel-labs/skills` (35.8k★) is its
source. The YouTube transcript tool was verified working but was not needed for this topic.

---

## THE HEADLINE FINDING

**Stars and installs disagree, and installs are the better signal.**

| Repo | Stars | installs (skills.sh) |
|---|---|---|
| `designed-by-ai/skills` | **19** | **916,408** |
| `pbakaus/impeccable` | 83,582 | 345,329 |
| `Leonxlnx/taste-skill` | 99,682 | 640,624 (design-taste-frontend) |
| `anthropics/skills` (frontend-design) | 182,406 | 1,007,521 |

`designed-by-ai/skills` has 19 stars, 1 SKILL.md, and a README that instructs you to run
`npx skills add sleekdotdesign/agent-skills` — i.e. its 916k installs are **attributed to a
different repo** (`sleekdotdesign/agent-skills`, 589★). Install counters are attributable and
resellable; star counts are not. Rank by installs and shipped SKILL.md files, not stars.

---

## TIER 1 — The actual leaders (real skills, real usage)

### 1. pbakaus/impeccable — ★83,582 · Apache-2.0 · pushed 2026-10-20
- **URL:** https://github.com/pbakaus/impeccable
- **Installs:** 345,329 (`impeccable`), 50,025 (`teach-impeccable`)
- **Ships SKILL.md:** YES — 25 SKILL.md files, but only **2 unique skills** (`impeccable`, `audit`);
  the rest are the same skill vendored into 19 harness folders (`.claude/`, `.cursor/`, `.codex/`,
  `.hermes/`, `.gemini/`, `.grok/`, `.opencode/`, `.kiro/`, `.veto/`, `.pi/`, …).
- **What it does:** A design-director skill for critiquing, polishing, and reshaping frontend UI.
  Ships `reference/craft-floor.md` (quality floor + absolute bans), sub-commands
  (`shape · audit · animate · bolder · colorize · layout · overdrive · quieter · typeset · adapt ·
  clarify · distill · harden · onboard · optimize · polish · init · document · extract · live ·
  generate`), a self-contained binary launcher (`scripts/impeccable`), and native hook manifests
  per harness. Version 4.7.0.
- **Install:** `npx impeccable install` → `/impeccable init`. Flags: `--providers=claude,codex,cursor,grok,hermes,veto`,
  `--scope=project|global`. Also has a Claude Code plugin path.
- **Why it matters:** The most mature design skill in the ecosystem — it installs into Hermes
  Agent natively and enforces craft rules against a real engine, not just prompt text.

### 2. Leonxlnx/taste-skill — ★99,682 · MIT · pushed 2026-10-19
- **URL:** https://github.com/Leonxlnx/taste-skill
- **Installs:** 640,624 (`design-taste-frontend`), 458,788 (`high-end-visual-design`),
  458,655 (`redesign-existing-projects`), 394,845 (`stitch-design-taste`)
- **Ships SKILL.md:** YES — `skills/taste-skill/SKILL.md` (v2, `name: design-taste-frontend`)
- **What it does:** Anti-slop frontend skill. A script (`scripts/draw.mjs`) *deals* three of twenty
  researched art directions distilled from 247 curated gallery sites (One Page Love, Awwwards),
  each with its own type system, palette, hero and section compositions. A real-browser inspector
  (`scripts/inspect.mjs`) enforces a no-ornament house style. Then a screenshot → juror rubric →
  fix → look-again loop at three widths. Node 22+ and Chrome required.
- **Install:** `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`
  · Claude Code plugin: `/plugin marketplace add Leonxlnx/taste-skill` then
  `/plugin install taste-skill@taste-skill` · `./install.sh` symlinks for live `git pull` updates.
- **Why it matters:** The clearest formulation of the actual thesis — the model defaults to the
  average of every page it has seen; this skill replaces defaults with *dealt decisions*.

### 3. anthropics/skills (frontend-design) — ★182,406 · license: none declared (NOASSERTION) · pushed 2026-10-09
- **URL:** https://github.com/anthropics/skills
- **Installs:** 1,007,521 (`frontend-design`) — the single most-installed design skill measured.
  Also `canvas-design` (119,413).
- **Ships SKILL.md:** YES — 20 SKILL.md files, including `skills/frontend-design/SKILL.md`,
  `skills/canvas-design/SKILL.md`, `skills/brand-guidelines/SKILL.md`, `skills/algorithmic-art/SKILL.md`.
- **What it does:** Anthropic's own official skill collection. `frontend-design` and `canvas-design`
  are the design-relevant ones — craft guidance for producing visual HTML/canvas artifacts rather
  than generic component output.
- **Install:** `npx skills add anthropics/skills` (or Claude Code plugin marketplace).
- **Why it matters:** The baseline every third-party design skill is measured against, and the
  only "official-by-the-model-vendor" entry at the top of the install table.

### 4. vercel-labs/agent-skills (web-design-guidelines) — ★32,702 · license: none declared · pushed 2026-10-14
- **URL:** https://github.com/vercel-labs/agent-skills
- **Installs:** 760,123 (`web-design-guidelines`) — the highest-install non-Anthropic design skill.
- **Ships SKILL.md:** YES — 9 SKILL.md files (`skills/web-design-guidelines/SKILL.md`,
  `skills/react-best-practices/`, `skills/composition-patterns/`, `skills/react-view-transitions/`, …).
- **What it does:** A review checklist skill for UI code — accessibility, interaction states,
  layout, forms, performance, animation — intended to be run against generated or authored frontend code.
- **Install:** `npx skills add vercel-labs/agent-skills`
- **Why it matters:** The "lint your output" pattern; Vercel ships the review criteria as a skill
  rather than a component library, which is the opposite of the old model.

### 5. nexu-io/open-design — ★102,711 · Apache-2.0 · pushed 2026-10-20
- **URL:** https://github.com/nexu-io/open-design
- **Installs:** 4,691 (`frontend-design`), 3,346 (`design-brief`), 3,325 (`creative-director`),
  3,177 (`apple-hig`), 3,029 (`threejs`), 3,028 (`design-md`)…
- **Ships SKILL.md:** YES — **549 SKILL.md files**, the largest count in this survey.
- **What it does:** A local-first collaborative AI design agent *workspace* (desktop app) with
  design templates that each carry a SKILL.md — magazines, decks, posters, prototypes, data
  reports. Ships a Claude Code plugin (`.claude-plugin/marketplace.json` +
  `plugins/open-design/.claude-plugin/plugin.json`).
- **Install:** Claude Code plugin marketplace (`/plugin marketplace add nexu-io/open-design`), or
  the desktop app + agent integration.
- **Why it matters:** Largest design-skill corpus on GitHub, and it explains the "design system +
  template" model — every output format is a skill, not a component.

### 6. Mattpocock/skills — ★298,223 · MIT · pushed 2026-10-19
- **URL:** https://github.com/mattpocock/skills
- **Installs:** 826,319 (`codebase-design`), 208,834 (`design-an-interface`)
- **Ships SKILL.md:** YES — 38 SKILL.md files (`skills/engineering/codebase-design/SKILL.md`,
  `skills/engineering/design-an-interface/…`, domain-modeling, diagnosing-bugs…).
- **What it does:** Mostly engineering skills; the design-relevant pair is `codebase-design`
  (how to structure code for change) and `design-an-interface` (interface design as a skill).
- **Install:** `npx skills add mattpocock/skills`
- **Why it matters:** Highest-starred repo in the survey overall — but design is a minority slice
  of it. Good example of a generalist repo that happens to contain design skills.

### 7. emilkowalski/skills — ★47,893 · MIT · pushed 2026-10-11
- **URL:** https://github.com/emilkowalski/skills
- **Installs:** 368,004 (`emil-design-eng`), 225,951 (`apple-design`)
- **Ships SKILL.md:** YES — 15 SKILL.md files (`skills/apple-design/SKILL.md`,
  `skills/pick-ui-library/SKILL.md`, `skills/animate/`, `skills/animation-performance/`, …)
- **What it does:** Emil Kowalski's design-engineering philosophy as skills: UI polish, animation
  performance, and `pick-ui-library` (steers the agent to trusted libraries instead of hand-rolling
  a toast component).
- **Install:** `npx skills@latest add emilkowalski/skills`
- **Why it matters:** The most "senior designer in the room" voice in the ecosystem; `apple-design`
  is the most-installed Apple-HIG skill by a wide margin.

---

## TIER 2 — Strong, focused design skills

### 8. google-labs-code/stitch-skills — ★8,550 · Apache-2.0 · pushed 2026-08-17
- **URL:** https://github.com/google-labs-code/stitch-skills
- **Installs:** 64,154 (`design-md`), 55,978 (`stitch-loop`), 25,095 (`stitch-design`),
  10,445 (`stitchgenerate-design`), 9,937 (`stitchmanage-design-system`), 9,821 (`stitchcode-to-design`)
- **Ships SKILL.md:** YES — 16 SKILL.md files across `plugins/stitch-build/skills/` and
  `plugins/stitch-design/skills/` (`react-components`, `react-native`, `react-vite-dashboard`,
  `remotion`, `shadcn-ui`, `code-to-design`, `design-md`, …).
- **What it does:** Agent Skills for Google Stitch (design-to-code). Includes `design-md` — the
  canonical DESIGN.md generation flow — plus design-system management, code-to-design, and
  per-framework component generation. Follows the Agent Skills open standard.
- **Install:** `npx plugins add google-labs-code/stitch-skills --scope project --target claude-code`
  · Codex: `codex plugin marketplace add google-labs-code/stitch-skills --ref main`
- **Why it matters:** The reference implementation of "design tool as MCP + skills"; also where
  `DESIGN.md` as a portable artifact gets formalized.

### 9. greensock/gsap-skills — ★16,725 · MIT · pushed 2026-07-29
- **URL:** https://github.com/greensock/gsap-skills
- **Installs:** 70,982 (`gsap-core`), 68,102 (`gsap-scrolltrigger`), 65,476 (`gsap-performance`),
  65,169 (`gsap-timeline`), 63,406 (`gsap-plugins`), 62,631 (`gsap-react`), 61,668 (`gsap-utils`),
  59,065 (`gsap-frameworks`)
- **Ships SKILL.md:** YES — 8 SKILL.md files, one per GSAP domain.
- **What it does:** Official GreenSock skills teaching correct GSAP usage — core API, timelines,
  ScrollTrigger, plugins, React integration, performance budgets, framework patterns.
- **Install:** `npx skills add https://github.com/greensock/gsap-skills` · Claude Code:
  `/plugin marketplace add greensock/gsap-skills` · Cursor: Settings → Rules → Remote Rule (Github).
- **Why it matters:** Vendor-official animation skills — the model of a library teaching agents
  its own API correctly instead of agents guessing from stale docs.

### 10. nextlevelbuilder/ui-ux-pro-max-skill — ★137,848 · MIT · pushed 2026-10-15
- **URL:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Installs:** 38,333 (`design`), 39,630 (`design-system`), 32,495 (`ckmdesign`),
  36,615 (`banner-design`), 32,796 (`ckmdesign-system`), 31,969 (`ckmbanner-design`)
- **Ships SKILL.md:** YES — 13 SKILL.md files (`.claude/skills/design/`, `design-system/`,
  `ui-styling/`, `banner-design/`, `brand/`, `slides/`, …).
- **What it does:** Design intelligence for professional UI/UX across platforms; a knowledge-base
  style skill with a `uipro` CLI (`uipro init --ai claude --global`).
- **Install:** `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then
  `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` · or `npm install -g ui-ux-pro-max-cli`
- **Why it matters:** Highest-starred *pure design* skill repo by a wide margin; the "huge
  knowledge table" approach to design skills.

### 11. remotion-dev/skills — ★5,421 · license: none declared · pushed 2026-10-19
- **URL:** https://github.com/remotion-dev/skills
- **Installs:** 648,438 (`remotion-best-practices`), 182,382 (`remotion-render`), 181,344
  (`remotion-create`), 179,080 (`remotion-captions`), 175,287 (`remotion-markup`), 159,940
  (`remotion-upgrade`), 144,922 (`remotion-studio`)
- **Ships SKILL.md:** YES — 12 SKILL.md files.
- **What it does:** Official Remotion (programmatic video) skills — best practices, create, render,
  captions, markup, interactivity, maps, upgrade, studio.
- **Install:** `npx skills add remotion-dev/skills`
- **Why it matters:** Video is the fastest-growing design-adjacent surface and the official vendor
  ships skills, not just docs. (License not declared in repo — **unverified** license.)

### 12. twostraws/SwiftUI-Agent-Skill — ★6,270 · MIT · pushed 2026-10-16
- **URL:** https://github.com/twostraws/SwiftUI-Agent-Skill
- **Installs:** 34,125 (`swiftui-pro`)
- **Ships SKILL.md:** YES — 2 (`swiftui-pro/SKILL.md`, `swiftui-pro/skills/swiftui-pro/SKILL.md`).
- **What it does:** SwiftUI best-practices skill for Claude Code, Codex and other agents.
- **Install:** `npx skills add https://github.com/twostraws/swiftui-agent-skill --skill swiftui-pro` ·
  Claude Code: `/plugin marketplace add twostraws/SwiftUI-Agent-Skill` then
  `/plugin install swiftui-pro@swiftui-agent-skill`
- **Why it matters:** The strongest platform-specific design skill in the ecosystem; the Apple
  design lane is well covered by design skills (HIG, Liquid Glass, SwiftUI).

### 13. figma/mcp-server-guide — ★2,090 · license: none declared · pushed 2026-10-19
- **URL:** https://github.com/figma/mcp-server-guide
- **Ships SKILL.md:** YES — 32 SKILL.md files. `skills/` has 18 (one per Figma MCP operation:
  `figma-design-to-code`, `figma-generate-design`, `figma-generate-library`, `figma-code-connect`,
  `figma-generate-diagram`, `figma-shaders`, `figma-swiftui`, `figma-use-motion`, `figma-use-slides`,
  `figma-use-figjam`, `figma-spec`, …); `skills-figquery/` has 13 mirrored variants;
  `workflow-skills/` has 2.
- **What it does:** Official Figma skills for driving the Figma MCP server — design-to-code,
  design generation, library/component creation, diagrams, shaders, SwiftUI export.
- **Install:** Claude Code: `claude plugin install figma@claude-plugins-official` ·
  Gemini CLI: `gemini extensions install https://github.com/figma/mcp-server-guide` ·
  Cursor: install the Figma Plugin via agent chat.
- **Why it matters:** The canonical "design tool vendor ships agent skills" reference; the
  `figma-design-to-code` skill is the Figma→code bridge that `stitch-skills` also implements.

### 14. plugin87/ux-ui-agent-skills — ★2,453 · MIT · pushed 2026-10-20
- **URL:** https://github.com/plugin87/ux-ui-agent-skills
- **Installs:** 653 (`image-to-code`), 532 (`design-review`), 486 (`a11y-audit`),
  477 (`design-tokens`), 476 (`redesign`), 465 (`apply-aesthetic`), 464 (`design-code`)
- **Ships SKILL.md:** YES — 27 SKILL.md files in `.claude/skills/` (`design-code`, `design-review`,
  `a11y-audit`, `design-tokens`, `apply-aesthetic`, `brandkit`, `critique`, `redesign`, `prototype`,
  `data-dashboard`, `ux-writing`, …).
- **What it does:** A senior-design-architect kit: DTCG tokens, 52 components, WCAG 2.2 AA–AAA,
  138 design systems, adapters for React+Tailwind / Next.js / SwiftUI / Vue / Svelte / Angular /
  Solid / Lit / RN / Flutter / Jetpack Compose / vanilla CSS / CSS-in-JS, and 50 objective gates
  that fail the build instead of faking success.
- **Install:** `/plugin marketplace add plugin87/ux-ui-agent-skills` then
  `/plugin install ux-ui-agent-skills@ux-ui-agent-skills` · also `npx ux-ui-agent-skills init`
- **Why it matters:** The most rigorous *design-system* skill in the survey — tokens, adapters and
  hard gates rather than taste advice.

### 15. nateherkai/scroll-craft — ★3,740 · MIT · pushed 2026-09-30
- **URL:** https://github.com/nateherkai/scroll-craft
- **Ships SKILL.md:** YES — 1 (`plugins/nateherk-design/skills/scroll-craft/SKILL.md`).
- **What it does:** Premium scroll-driven landing pages. Plans a journey map, page grammar,
  feeling curve with one engineered peak, and a bespoke signature move; dimensional heroes with
  independent visual planes; separate mobile composition; verifies desktop / mobile / reduced-motion
  scroll states visually via Playwright.
- **Install:** `/plugin marketplace add nateherkai/scroll-craft` then `/plugin install nateherk-design`,
  then `/reload-plugins`. Needs `npm i playwright-core` + Chrome in the build folder.
- **Why it matters:** The clearest example of a *narrow, deep, verifiable* design skill — one
  surface done properly rather than "all of UI".

### 16. Manavarya09/design-extract — ★4,271 · MIT · pushed 2026-10-19
- **URL:** https://github.com/Manavarya09/design-extract
- **Installs:** 2,777 (`extract-design`)
- **Ships SKILL.md:** YES — 25 SKILL.md files (`skills/extract-design/SKILL.md` plus per-site
  `designlang` skills for cal.com, clerk.com, coinbase.com, discord.com, duolingo.com, …).
- **What it does:** Extracts any website's complete design system — DTCG tokens
  (semantic + primitive + composite), an MCP server for Claude Code/Cursor/Windsurf, emitters for
  iOS SwiftUI / Android Compose / Flutter / WordPress, Tailwind v4, Figma variables, shadcn/ui,
  a CSS health audit and WCAG remediation.
- **Install:** `npm i -g designlang` + `designlang install-browser` (one-time Chromium) ·
  as a skill: `npx skills add Manavarya09/design-extract` · Claude Code plugin:
  `/plugin marketplace add Manavarya09/design-extract`
- **Why it matters:** The "design-system extraction" primitive — the inverse of every other skill
  here, and the most reusable one for retrofitting an existing codebase.

### 17. superdesigndev/superdesign-skill — ★860 · MIT · pushed 2026-08-21
- **URL:** https://github.com/superdesigndev/superdesign-skill
- **Installs:** 10,939 (`superdesign`)
- **Ships SKILL.md:** YES — 1 (`skills/superdesign/SKILL.md`).
- **What it does:** Drives the Superdesign infinite canvas from the terminal via `@superdesign/cli`:
  design/reproduce/improve UI, compare leading AI models side by side, extract or set a design
  system, build multi-page flows, make presentations (incl. editable PPTX), posters and marketing
  graphics, generate image/video assets, design from a live website URL.
- **Install:** `npx skills add superdesigndev/superdesign-skill` **or** (Claude Code, preferred)
  `/plugin marketplace add superdesigndev/superdesign-skill` then `/plugin install superdesign@superdesign`
  — plus `npm install -g @superdesign/cli@latest`. Invoked as `/superdesign:superdesign`.
  Note: README warns not to run *both* (duplicate unnamespaced copy).
- **Why it matters:** Model-comparison on one canvas is a genuinely new capability; but it is a
  **thin wrapper around a paid CLI** — the skill is the marketing surface.

---

## TIER 3 — Real and useful, smaller scope

| Repo | URL | ★ | License | Pushed | SKILL.md? | Installs | What it does / Install |
|---|---|---|---|---|---|---|---|
| wheresryan22/anatomy | https://github.com/wheresryan22/anatomy | 17,341 | MIT | 2026-10-18 | **1** | 16,465 | Isometric illustrations of real machines/systems as interactive SVG + optional WebGL shaders. `npx skills add wheresryan22/anatomy -g -a claude-code` (no API keys, Node built-ins only) |
| Jakubantalik/transitions.dev | https://github.com/Jakubantalik/transitions.dev | 5,435 | none declared | 2026-10-17 | **5** | 9,887 (`transitions-polish`) | 43+ crafted UI transitions + 18 per-transition reference files; a "UI generation" skill that reveals UI as if an agent were writing it; live Refine panel. `npx skills add Jakubantalik/transitions.dev` · `npx transitions-dev add card-resize` |
| iart-ai/web-animation-skills | https://github.com/iart-ai/web-animation-skills | 46 | MIT | 2026-06-22 | **9** | 2,218 (`60fps-animation`), 2,209 (`accessible-animation`), 2,173 (`svg-animation`), 2,164 (`micro-interaction`), 2,104 (`gsap-web`), 2,015, 2,002, 1,891 | Web animation skills: GSAP, SVG, Lottie, micro-interactions, page transitions, 60fps. `npx skills add iart-ai/web-animation-skills` · `/plugin marketplace add iart-ai/web-animation-skills` |
| tt-a1i/archify | https://github.com/tt-a1i/archify | 86,160 | MIT | 2026-10-20 | **5** | 163,768 (`archify`), 24,233 (`archify-review`) | Turns ideas/codebases into beautiful interactive diagrams (self-contained HTML). `npx skills add tt-a1i/archify -g` — largest-install *diagram* skill |
| cathrynlavery/diagram-design | https://github.com/cathrynlavery/diagram-design | 58,797 | MIT | 2026-10-20 | **1** | 15,988 | 44 editorial diagram types, self-contained HTML+SVG, no Mermaid slop. `npx skills add cathrynlavery/diagram-design` · `/plugin marketplace add cathrynlavery/diagram-design` |
| alchaincyf/huashu-design | https://github.com/alchaincyf/huashu-design | 25,510 | MIT | 2026-10-17 | **1** | 49,184 | HTML-native design skill: hi-fi prototypes / slides / animation, 20 design philosophies, 5-dimension review, MP4 export. `npx skills add alchaincyf/huashu-design` (also `npm i -g skills@latest`) |
| JimLiu/baoyu-design | https://github.com/JimLiu/baoyu-design | 4,423 | MIT | 2026-09-23 | **2** | 6,193 | Runs Claude Design locally as an agent skill — polished UI mockups, prototypes, decks, wireframes as self-contained HTML. `npx skills add JimLiu/baoyu-design` (`-g`, `--agent claude-code|cursor|codex`) |
| kaankiziltug/logo-design-skill | https://github.com/kaankiziltug/logo-design-skill | 3,817 | MIT | 2026-10-20 | **1** | — (rknall/svg-logo-designer 7,913) | Logo design: principles, process, SVG craft, testing tools, 1,400+ logo reference library. `/plugin marketplace add kaankiziltug/logo-design-skill` then `/plugin install logo-design@logo-design-skill` |
| Owl-Listener/designer-skills | https://github.com/Owl-Listener/designer-skills | 2,977 | MIT | 2026-09-05 | **111** | 2,970 (`presentation-deck`), 2,452, 2,408, 2,393 | The broadest design *practice* library: 9 collections (design-research 14, ux-strategy 12, design-systems 11, ui-design 19, interaction-design 22, visual-critique 7, prototyping-testing 10, design-ops 9, designer-toolkit 7). `/plugin marketplace add Owl-Listener/designer-skills` → `/plugin` → Discover tab |
| LottieFiles/motion-design-skill | https://github.com/LottieFiles/motion-design-skill | 2,359 | MIT | 2026-05-18 | **1** | 18,406 | Universal motion design principles for AI agents — timing, easing, choreography, Disney principles for UI. `npx skills add LottieFiles/motion-design-skill` |
| bergside/awesome-design-skills | https://github.com/bergside/awesome-design-skills | 3,275 | MIT | 2026-06-28 | **67** | 2,057 (`impeccable`) | A *catalog* of 67 DESIGN.md/SKILL.md design skill files (agentic, ant, artistic, basic, bento, bold, brutalism, …). Install via `npx skills add` against the individual skill paths |
| arla6ka/design.how | https://github.com/arla6ka/design.how | 141 | MIT | 2026-10-19 | **9** | 246 (`token-mapping`), 246 (`design-system-boss`), 40 (`ui-review`), 40 (`build-design-system`) | Design systems *with* their component code; each ships its own skill plus a shadcn theme. `npx skills@latest add https://design.how` · `npx shadcn@latest add https://design.how/r/quartz/theme.json` |
| educlopez/ui-craft | https://github.com/educlopez/ui-craft | 393 | MIT | 2026-10-19 | **217** | 1,373 (`ui-craft`), 1,102, 869, 865 | Design-engineering system with a 10-item acceptance bar ("would a designer retouch this?"); ~217 skill files. `curl -fsSL https://skills.smoothui.dev/install \| bash` then `ui-craft install` (Go binary, no Node) |
| bitjaru/styleseed | https://github.com/bitjaru/styleseed | 981 | MIT | 2026-10-14 | **3** | 864 (`ss-review`), 864 (`ss-audit`), 863 (`ss-setup`), 862, 861, 855, 852, 849, 836, 729, 540 | Design-*method* engine — 23 skills for fixed design judgment, multiple grammars, semantic palettes, reference compilation, evidence-verified UI. `npx -y skills add bitjaru/styleseed -a codex claude-code -y --copy` |
| oil-oil/oil-ui | https://github.com/oil-oil/oil-ui | 1,902 | MIT | 2026-10-18 | **1** | 1,393 | UI design skill: explore distinct directions, compare side by side, refine against real screenshots. `npx skills add oil-oil/oil-ui` · DeepSeek: `dsh plugin --profile web add github:oil-oil/dsh-oil-ui` |
| dickwu/apple-design-skill | https://github.com/dickwu/apple-design-skill | 1,675 | none declared | 2026-10-15 | **1** | 7,795 | Cross-platform UI/UX *reviewer* based on Apple HIG — Flutter, Tauri, Electron, React Native. `npx skills add dickwu/apple-design-skill` (`-a claude-code`, `-g`, `--list`) |
| dominikmartn/hue | https://github.com/dominikmartn/hue | 843 | MIT | 2026-06-11 | **1** | 212 | Learns any brand from a URL/name/screenshot and turns it into a complete design system. `git clone … ~/.claude/skills/hue` (or `~/.agents/skills/hue`, `$CODEX_HOME/skills/hue`) |
| dominikmartn/nothing-design-skill | https://github.com/dominikmartn/nothing-design-skill | 2,832 | MIT | 2026-04-01 | **1** | 590 | The Nothing design language — monochrome, typographic, industrial. `git clone …` (README's only documented path) |
| viettranx/3dviz-pro-max | https://github.com/viettranx/3dviz-pro-max | 825 | MIT | 2026-09-11 | **1** | 81 | Creative 3D visualization: idea → Three.js/Blender scene; 223 recipes, 440 knowledge records, 22 proved kits. `/plugin marketplace add viettranx/3dviz-pro-max` then `/plugin install 3dviz-pro-max@3dviz-pro-max` |
| inkboard/system-atlas | https://github.com/inkboard/system-atlas | 446 | MIT | 2026-09-01 | **1** | 491 | Turns an architecture discussion into an explorable isometric atlas — one data file, interactive map, generated SYSTEM.md. `npx skills add inkboard/system-atlas` |
| HRuiCcc/RuiC-card-skill | https://github.com/HRuiCcc/RuiC-card-skill | 563 | MIT | 2026-09-30 | **1** | — | One sentence → interactive 3D holographic card page with layered parallax + editable Blender project. Host-agnostic. Install: no command found in README — **unverified** install path |
| justinwetch/HIGAgentSkills | https://github.com/justinwetch/HIGAgentSkills | 662 | MIT | 2026-10-17 | **1** | — | Apple Human Interface Guidelines distilled for agents, with a `/duo` slash command and an opt-in "enforce mode". Install: copy-paste prompt from README (no CLI command) |
| bergside/typeui | https://github.com/bergside/typeui | 2,092 | none declared | 2026-07-04 | **4** | 2,088 (`typeui-fundamentals`), 23, 14 | TypeUI MCP + CLI; design systems, prompts and layout-variation guidance for agents. `npx skills add bergside/typeui`; MCP install per typeui.sh docs |
| AnxForever/stylekit-skill | https://github.com/AnxForever/stylekit-skill | 33 | MIT | 2026-10-20 | **1** | 49 | 148 curated visual styles with design tokens; the skill-pack export of the larger `AnxForever/stylekit` repo (632★, which ships an MCP server + CLI but **0** SKILL.md). `npx skills@latest add AnxForever/stylekit-skill` |
| Manavarya09/design-extract | see Tier 2 | — | — | — | — | — | — |
| bergside/typeui | see Tier 3 | — | — | — | — | — | — |
| Trystan-SA/claude-design-system-prompt | https://github.com/Trystan-SA/claude-design-system-prompt | 2,006 | MIT | 2026-07-06 | **0** | — | Reverse-engineered system prompt + skill library (Claude & Codex variants: `claude/system-prompt.md`, `claude/skills/*.md`, `codex/AGENTS.md`). **NOT the Agent Skills format** — skills are `.md` without frontmatter/SKILL.md naming |
| wilwaldon/Claude-Code-Frontend-Design-Toolkit | https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit | 1,204 | none declared | 2026-04-11 | **0** | — | Curated list of skills/plugins/MCP servers that improve Claude Code frontend output. **README-only — a pointer, not a skill** |
| shadcn-ui/lint | https://github.com/shadcn-ui/lint | 3,233 | MIT | 2026-10-19 | **0** | — | Agent-first linter for Tailwind design systems; agents can verify the rules. `npm install -D @shadcn/lint eslint @typescript-eslint/parser` (also oxlint / vue / svelte variants) |
| figma/community-resources | https://github.com/figma/community-resources | 857 | MIT | 2026-07-17 | **0** | — | Index repo for Figma community plugins/widgets/agent skills. `agent_skills/` contains only a README that redirects to `figma/mcp-server-guide` |
| remotion-dev/skills | see Tier 2 | — | — | — | — | — | — |

---

## THE DISTINCTION THAT MATTERS: SKILL.md vs COMPONENT CODE

This is the point of the survey. Verified by walking each repo's git tree
(`gh api repos/<o>/<r>/git/trees/<branch>?recursive=1`) and counting paths matching `SKILL.md`:

### Ship actual SKILL.md (agent-installable)
`anthropics/skills` (20) · `nexu-io/open-design` (549) · `educlopez/ui-craft` (217) ·
`wshobson/agents` (185) · `Owl-Listener/designer-skills` (111) · `bergside/awesome-design-skills` (67) ·
`nexu-io/html-anything` (81) · `plugin87/ux-ui-agent-skills` (27) · `Manavarya09/design-extract` (25) ·
`pbakaus/impeccable` (25, but 2 unique) · `google-labs-code/stitch-skills` (16) ·
`emilkowalski/skills` (15) · `nextlevelbuilder/ui-ux-pro-max-skill` (13) ·
`remotion-dev/skills` (12) · `greensock/gsap-skills` (8) · `iart-ai/web-animation-skills` (9) ·
`Jakubantalik/transitions.dev` (5) · `tt-a1i/archify` (5) · `vercel-labs/agent-skills` (9) ·
`figma/mcp-server-guide` (32) · `mattpocock/skills` (38) · `arla6ka/design.how` (9) ·
`bergside/typeui` (4) · `bitjaru/styleseed` (3) · and ~25 single-skill repos
(`superdesign`, `scroll-craft`, `anatomy`, `oil-ui`, `apple-design`, `swiftui-pro`, `logo-design`,
`motion-design`, `nothing-design`, `hue`, `system-atlas`, `3dviz-pro-max`, `magicui`,
`RuiC-card`, `archify`, `design.how`, `stylekit-skill`, `HIGAgentSkills`, `baoyu-design` ×2,
`huashu-design`, `diagram-design`, `taste-skill`, `design-mobile-apps`, `extract-design-system`).

### Do NOT ship SKILL.md — component code, docs, or pointers only
- **`ibelick/motion-primitives` (★6,763, MIT, 2026-09-28) — 0 SKILL.md.** A React/motion UI kit
  for animated interfaces. Install is `npx jsrepo add` / manual copy of components. It is a
  **component library that happens to be popular**, not a skill.
- **`DavidHDev/react-bits` (★49,773, MIT + Commons Clause, 2026-10-19) — 0 SKILL.md.** The largest
  animated React component library. `public/rbp/showcase/agent-kit/skill-*.webp` files are
  *marketing images* for a "Pro agent kit", not SKILL.md files. Install:
  `npx shadcn@latest add @react-bits/SplitText-TS-TW`. Also ships `public/llms.txt` for LLM
  consumption — the pre-skill version of the same idea.
- **`magicuidesign/magicui` (★22,755, MIT) — 1 SKILL.md** (`skills/magic-ui/SKILL.md`), a thin
  "how to use our registry" guide. It is primarily a component library (`npx shadcn@latest add @magicui/*`).
- **`iart-ai/motion-skills` (★912, MIT) — 0 SKILL.md.** The README claims "55 open-source skills"
  across "18 packs", but this repo contains only a README, a showcase GIF and shell tools. The
  actual skills live in the **sibling repos** (`iart-ai/web-animation-skills`, `tiktok-video-skills`,
  `data-animation-skills`, …). The README also says 50 in the GitHub description and 55 in the
  body — the count is inflated and the repo itself ships no skill.
- **`Trystan-SA/claude-design-system-prompt` (★2,006) — 0 SKILL.md.** 15 skills as plain `.md`
  files under `claude/skills/` and `codex/skills/` — a *prompt library*, not the Agent Skills format.
  Useful, but not installable by `npx skills add`.
- **`wilwaldon/Claude-Code-Frontend-Design-Toolkit` (★1,204) — 0 SKILL.md.** A README listing other
  people's skills. Pure pointer.
- **`figma/community-resources` (★857) — 0 SKILL.md.** Index; `agent_skills/` holds only a README
  pointing at `figma/mcp-server-guide`.
- **`shadcn-ui/lint` (★3,233) — 0 SKILL.md.** An npm linter, installable as a dev dependency, not a skill.
- **`AnxForever/stylekit` (★632) — 0 SKILL.md.** The MCP server + CLI; the skill lives in the
  separate `AnxForever/stylekit-skill` repo (★33).
- **`OpenCoworkAI/open-codesign` (★8,086) — 0 SKILL.md.** A Claude Design *alternative app* (BYOK).
- **`rohitg00/awesome-claude-design` (★1,155) — 0 SKILL.md.** A curated awesome-list.
- **`Meliwat/awesome-ios-design-md` (★609) — 0 SKILL.md.** 200 real-app `DESIGN.md` files
  (`design-md/<category>/<app>/DESIGN-ios.md`). **This is the DESIGN.md format, not SKILL.md** —
  a separate and important distribution mechanism.

### The DESIGN.md channel (a third format, separate from SKILL.md)
DESIGN.md is a portable design-system document handed to an agent. It is *not* SKILL.md and is
installed differently (drop the file in, or reference it).
- `Meliwat/awesome-ios-design-md` (★609) — 200 production-grade DESIGN.md files, framework-neutral
  plus SwiftUI / Jetpack Compose / Expo variants.
- `bergside/typeui` — DESIGN.md generation as a skill (`skills/fundamentals/SKILL.md`).
- `google-labs-code/stitch-skills/design-md` — 64,154 installs; the canonical DESIGN.md flow.
- `nexu-io/open-design/design-md` — 3,028 installs.
- `ihlamury/design-skills`, `frhscopex/design-skill-os`, `arumwu/design-md-skill` — smaller DESIGN.md
  skill packs.

---

## WHAT THE HYPE IS ACTUALLY ABOUT

**1. Skills are the new component library.** A year ago "make AI build good UI" meant shipping
React components. Now the same goal is shipped as prose-plus-scripts in a `SKILL.md` that any of
70+ agents can load. `designed-by-ai/skills` (19★) vs `designed-by-ai`'s 916k installs via a
*sibling* repo shows the migration is underway and the stars haven't caught up.

**2. The real product is the verification loop, not the instructions.** The top skills
(taste-skill, impeccable, scroll-craft, ui-craft) all end the same way: render it, screenshot it,
judge it against a rubric, fix it, look again. Every README I've read that *only* describes
principles is the weak version. The differentiator is whether the agent can see its own output.
This is why `taste-skill` needs Node 22 + Chrome and `scroll-craft` needs Playwright.

**3. "Taste" is being reframed as a lottery with a library.** taste-skill's core insight — a
script *deals* three of twenty researched directions and the human picks one — is the most
important idea in the ecosystem. The model has no reason to prefer the right direction, so you
stop asking it to have taste and start giving it a menu plus a chooser.

**4. Vendor-official skills are the endorsement layer.** GSAP, Remotion, Figma, Anthropic, Vercel,
Google all now ship skills. This is the strongest signal of legitimacy in the whole field and it
replaces documentation as the support surface. (`figma/mcp-server-guide` alone is 32 SKILL.md files.)

**5. Distribution is consolidating onto two mechanisms.** `npx skills add owner/repo` (the
`skills` CLI from vercel-labs/skills, v1.7.4, works across 70+ agents) and the Claude Code plugin
marketplace (`/plugin marketplace add owner/repo`). Several top repos support both and warn
that installing both creates a duplicate unnamespaced copy (superdesign's README says this
explicitly). Third-party registries like skills.sh have become the de-facto install counter.

**6. The monetization is thin and the split is visible.** Some skills are wrappers around a paid
CLI — `superdesign-skill` (860★, 10.9k installs) drives `@superdesign/cli`; `open-design` (102k★)
is an app with a Pro tier; `nexu-io/html-anything` (9.2k★) is a desktop editor with 81 skills.
Others are pure MIT open source with no business model (`greensock/gsap-skills` 16.7k★,
`emilkowalski/skills` 47.9k★, `plugin87/ux-ui-agent-skills` 2.5k★). The OSS ones have far better
install economics than the wrapper ones.

**7. Design-system skills are converging on tokens + gates, not vibes.** The strongest
design-system work (`plugin87/ux-ui-agent-skills`, `Manavarya09/design-extract`, `arla6ka/design.how`,
`shadcn-ui/lint`) uses DTCG tokens, framework adapters, and CI-checkable rules. The
taste/anti-slop camp (`taste-skill`, `impeccable`, `ui-craft`, `styleseed`) supplies the judgment
the token layer can't. The strongest setups run both.

**8. The counter-signal: skill counts are not quality.** `nexu-io/open-design` (549 SKILL.md),
`educlopez/ui-craft` (217), `Owl-Listener/designer-skills` (111) and `wshobson/agents` (185) are
large *catalogues* — breadth across research, UX, design-ops, engineering. `pbakaus/impeccable`
has 25 SKILL.md files but only 2 unique skills and 345k installs. Install counts, not file counts,
tell you what people actually reach for.

**9. Most of this is brand new.** Every repo in this survey except a handful
(`magicuidesign/magicui` @2026-10-17 push but long history, `nextlevelbuilder/ui-ux-pro-max-skill`
@2026-10-15) was created in 2026. `iart-ai/web-animation-skills` last pushed 2026-06-22 with 46★
and 9 SKILL.md files — it is abandoned relative to the rest of the field. Treat 2026 star counts as
a snapshot of a moving target, and re-verify before citing.

---

## VERIFIED-ABSENT / CORRECTED CLAIMS
- `huashu-design` → `alchaincyf/huashu-design` (25,510★, MIT, 1 SKILL.md). English mirror exists
  at `pc-software-org/huashu-design-en` (24★).
- `gsap-skills` → `greensock/gsap-skills` (official, 16,725★, 8 SKILL.md).
- `stitch-skills` → `google-labs-code/stitch-skills` (8,550★, 16 SKILL.md).
- `baoyu-design` → `JimLiu/baoyu-design` (4,423★, 2 SKILL.md).
- `awesome-design-skills` → `bergside/awesome-design-skills` (3,275★, 67 SKILL.md).
- `nothing-design-skill` → `dominikmartn/nothing-design-skill` (2,832★, 1 SKILL.md).
- `ux-ui-agent-skills` → `plugin87/ux-ui-agent-skills` (2,453★, 27 SKILL.md).
- `claude-design-system-prompt` → `Trystan-SA/claude-design-system-prompt` (2,006★, **0** SKILL.md —
  prompt library, not Agent Skills format).
- `oil-ui` → `oil-oil/oil-ui` (1,902★, 1 SKILL.md).
- `apple-design-skill` → `dickwu/apple-design-skill` (1,675★, 1 SKILL.md).
- `SwiftUI-Agent-Skill` → `twostraws/SwiftUI-Agent-Skill` (6,270★, 2 SKILL.md). A distinct repo
  `AvdLee/SwiftUI-Agent-Skill` (3,729★) also exists.
- `Frontend-Design-Toolkit` → `wilwaldon/Claude-Code-Frontend-Design-Toolkit` (1,204★, **0** SKILL.md —
  README only).
- `motion-skills` → `iart-ai/motion-skills` (912★, **0** SKILL.md — hub README only).
- `superdesign-skill` → `superdesigndev/superdesign-skill` (860★, 1 SKILL.md).
- `3dviz-pro-max` → `viettranx/3dviz-pro-max` (825★, 1 SKILL.md).
- `transitions.dev` → `Jakubantalik/transitions.dev` (5,435★, 5 SKILL.md).
- `logo-design-skill` → `kaankiziltug/logo-design-skill` (3,817★, 1 SKILL.md).
- `figma/community-resources` → real, 857★, MIT, but 0 SKILL.md (index only). The real Figma skills
  are at `figma/mcp-server-guide` (2,090★, 32 SKILL.md).
- `remotion-dev/skills` → real, 5,421★, 12 SKILL.md, **license not declared in the repo** (unverified).

## UNVERIFIED / COULD NOT CONFIRM
- No repo named exactly `huashu-design`, `gsap-skills`, `stitch-skills`, `baoyu-design`,
  `awesome-design-skills`, `nothing-design-skill`, `ux-ui-agent-skills`, `claude-design-system-prompt`,
  `oil-ui`, `apple-design-skill`, `SwiftUI-Agent-Skill`, `Frontend-Design-Toolkit`, `motion-skills`,
  `superdesign-skill`, `3dviz-pro-max`, `transitions.dev`, `logo-design-skill` exists at the bare
  owner — all were resolved to a specific owner above.
- `HRuiCcc/RuiC-card-skill` (563★, MIT, 1 SKILL.md) — the README contains **no install command**
  that I could find; treat the install path as unverified.
- `wilwaldon/Claude-Code-Frontend-Design-Toolkit`, `Jakubantalik/transitions.dev`,
  `vercel-labs/agent-skills`, `remotion-dev/skills`, `dickwu/apple-design-skill`,
  `figma/mcp-server-guide`, `bergside/typeui`, `anthropics/skills` — **license not declared /
  NOASSERTION**. I read the LICENSE file where present (react-bits = "MIT + Commons Clause",
  RuiC-card = MIT) but did not find a LICENSE file for these.
- `DavidHDev/react-bits` license is `MIT + Commons Clause License Condition v1.0` — **not plain MIT**;
  the Commons Clause adds a commercial restriction.
- Skills.sh install counts are a point-in-time snapshot from a third-party registry and may differ
  from the `skills` CLI's own counters.
