<div align="center">

# ⚖️ UXL: UX Lawyer

**The 30 Laws of UX, applied by your AI coding agent.**

An Agent Skill and Claude Code plugin that makes Claude Code, Codex, Cursor, Gemini CLI, Copilot and other coding agents
design, build, audit and fix websites and web apps **for desktop and mobile** by applying the
[Laws of UX](https://lawsofux.com). Every decision cites the law behind it, backed by evidence from static and runtime scanners.

[Demo](#demo-the-fernwheel-case) · [Demo 2: with awards](#demo-2-the-lumenvale-case-uxl-with-awards) · [Demo 3: an award brief](#demo-3-the-voxmere-case-an-award-brief) · [Install](#install) · [Use](#use-it) · [The 30 laws](#the-30-laws) · [Scanners](#the-scanners) · [Benchmark](#benchmark) · [Contributing](CONTRIBUTING.md)

</div>

[![The Voxmere case: a 70-second film of two Claude Code sessions building the same award-hungry site, one with UXL](docs/voxmere/screens/film-poster.jpg)](https://burgisimon.github.io/UXL/voxmere/uxl-voxmere.mp4)

<p align="center"><sub>▶ <a href="https://burgisimon.github.io/UXL/voxmere/uxl-voxmere.mp4">Watch the film</a> (69 seconds, no sound): the <a href="#demo-3-the-voxmere-case-an-award-brief">Voxmere case</a>, recorded from both live pages and edited in code with Remotion.</sub></p>

---

## Why

AI-built interfaces usually look fine in a screenshot and then fail in use. Typical problems:

- Buttons are 32px tall, so thumbs miss them.
- Six equally loud calls to action compete for attention.
- Placeholder-only labels vanish as you type.
- Nothing happens for two seconds after you click.
- There are no empty, error or success states.
- The "responsive" layout is a desktop page squeezed onto a phone.

The [Laws of UX](https://lawsofux.com) explain why these fail: Fitts, Hick, Jakob, Miller, Doherty, Tesler, Peak-End, Von Restorff, the Gestalt laws and more. **UXL turns them into rules, numbers, code patterns and automated checks that an agent applies on every UI task.** Like a good lawyer, it cites the law, shows the evidence and proposes the remedy.

```
[MAJOR] §L07 Fitts's Law: "Add to cart" is 32×32 px on mobile
  Evidence: src/components/ProductCard.tsx:48 · audit: tap-target-size (32×32 at 390px)
  Impact:   Frequent mis-taps on the most valuable action on the page
  Remedy:   min-height 44px, full-width below 640px (patch below)
```

## Demo: the Fernwheel case

One prompt, two fresh Claude Code sessions, one difference. We asked both sessions to *"build a stunning website for Fernwheel"*, a fictional e-bike subscription startup, with plans, a postcode check and a test-ride booking form, *"great on phones and desktop"*. Same model, same tools, and the prompt never mentions UX. Session B had UXL installed as a project skill and loaded it as its first action.

| | Exhibit A · without UXL | Exhibit B · with UXL |
|---|---|---|
| First phone screen | <img src="docs/fernwheel/screens/a-mobile.png" width="260" alt="Exhibit A first phone screen"> | <img src="docs/fernwheel/screens/b-mobile.png" width="260" alt="Exhibit B first phone screen"> |
| Footer on a phone (red = under 44 px) | <img src="docs/fernwheel/screens/a-mobile-footer.png" width="260" alt="Exhibit A footer with seven undersized links outlined"> | <img src="docs/fernwheel/screens/b-mobile-footer.png" width="260" alt="Exhibit B footer with 44 px link rows"> |
| Runtime audit (360 / 390 / 1440 px) | 58 / 100 (2 critical, 2 major) | **96 / 100** (3 minor) |
| Phone tap targets under 44 px | 11 of 35 (9 under 24 px) | **0 of 31** |
| Booking | 8 inputs at once, no pending state | **"Step 1 of 2"**, tiles, pending state, resumable |
| Font sizes rendered | 19–21 | **11** |
| Time · cost | 6 min · $1.42 | 12 min · $2.91 |

Both pages look launch-ready in a screenshot. Only one of them holds up under a thumb. **[See the full case with both pages live →](https://burgisimon.github.io/UXL/)** The showcase is served with GitHub Pages from `docs/` and is built with `tools/build_demo.py`. It's one run per condition, so treat it as an illustration, not a statistic. The [benchmark](#benchmark) covers repeated evals.

## Demo 2: the Lumenvale case, UXL with awards

UXL is built to work alongside other skills. In the second case, both sessions ran the [awards](https://github.com/BurgiSimon/awards) plugin, a pipeline of skills built to win Site of the Day, on the same model at effort xhigh. The prompt asks for an *"award-worthy"* site for Lumenvale, a fictional dark-sky observatory in the Swiss Alps, with upcoming nights, moon phases, seats left and booking. Session B also had UXL. It called the skill on its own right after `awards:structure`, ran the `ux-auditor` agent before shipping, and handed the auditor's case file to `awards:ship`.

| | Exhibit A · awards | Exhibit B · awards + UXL |
|---|---|---|
| First phone screen | <img src="docs/lumenvale/screens/a-mobile.png" width="260" alt="Exhibit A first phone screen: Stay until the stars arrive, with a Choose your night button"> | <img src="docs/lumenvale/screens/b-mobile.png" width="260" alt="Exhibit B first phone screen: One night, exposed, over star trails, with the next dark night and a Book button"> |
| Booking on a phone | <img src="docs/lumenvale/screens/a-mobile-booking.png" width="260" alt="Exhibit A booking sheet with a Hold 2 seats button"> | <img src="docs/lumenvale/screens/b-mobile-booking.png" width="260" alt="Exhibit B booking step 1 of 2, total with pay on the night"> |
| Blind awards jury (weighted · Usability) | 7.23 · Usability 6.0 · "fix" | **8.14** · Usability 8.1 · "ship" |
| UXL runtime audit | 90 / 100 | **96 / 100** |
| Filled Book buttons in the nights list | 16 of 16 | **1 of 27**, on the recommended night |
| Says when you pay | no | **yes**, on both booking steps and the ticket |
| Time · cost | 88 min · $29.95 | 105 min · $39.24 |

Awards gave both pages the concept, the WebGL sky and the motion. UXL's auditor booked seats in a real browser and found 5 major issues the craft review had mostly missed, each fixed before hand-off. **[See the Lumenvale case with both pages live →](https://burgisimon.github.io/UXL/lumenvale/)** One run per condition, again: an illustration, not a statistic.

## Demo 3: the Voxmere case, an award brief

The third case raises the stakes. The client is Voxmere, a fictional deep-tech startup whose glass cube holds a true 3D image, and its brief asks outright for Awwwards Site of the Day: *"push it, be experimental"*. Both sessions ran the [awards](https://github.com/BurgiSimon/awards) plugin at effort xhigh; session B also had UXL. B called UXL on its own before writing any markup and ran UXL's scanners before its first jury. Before UXL, B's own brief planned a "first-batch remaining" counter. After, it struck it as *"invented scarcity, UXL §L04"*. Exhibit A shipped that counter.

| | Exhibit A · awards | Exhibit B · awards + UXL |
|---|---|---|
| First phone screen | <img src="docs/voxmere/screens/a-mobile.png" width="260" alt="Exhibit A first phone screen: Glass that holds light, with the second half of the headline behind a smoked glass cube"> | <img src="docs/voxmere/screens/b-mobile.png" width="260" alt="Exhibit B first phone screen: a glass cube on a degree ring, the headline Light, held. below it, and one Reserve a Cube button"> |
| Where it ships, on a phone | <img src="docs/voxmere/screens/a-mobile-shipto.png" width="260" alt="Exhibit A: a Ship to dropdown, then the summary and the line Batch one has 123 of 500 places left"> | <img src="docs/voxmere/screens/b-mobile-shipto.png" width="260" alt="Exhibit B: four regions, each with its ship month, then the summary and the batch rule in words"> |
| Blind awards jury (weighted · Usability) | 7.65 · Usability 7.0 · "fix" | **7.83** · Usability 7.0 · "ship" |
| UXL runtime audit | 86 / 100 | **96 / 100** |
| Scarcity | "123 of 500 places left", from a hard-coded number | **the batch rule, no counter** |
| Payment form submitted empty | the browser's bubble, on one field | **all five problems listed; a declined-card path** |
| Time · cost | 117 min · $36.33 | 118 min · $37.28 |

The blind jury barely separates the two pages, and both Usability scores sit at the cap, each held there by one failed check. A's is the 41 px phone button that UXL's audit had flagged. What UXL changed is what a buyer meets: no invented urgency next to a deposit, the ship month where the choice is made, a checkout that explains failure, and a phone headline you can read. It cost one more minute and $0.95. **[See the Voxmere case with both pages live →](https://burgisimon.github.io/UXL/voxmere/)** The film above is cut from these two pages; its source is in [`video/`](video/).

## What you get

| | |
|---|---|
| **`ux-lawyer` skill** | Three modes. **Build** creates new sites, pages, flows and components. **Audit & Fix** reviews and improves existing projects. **Consult** answers which law applies and how. "Statutes" set numeric defaults that apply everywhere. |
| **30 law references** | One deep file per law: plain-words explanation, desktop *and* mobile build rules, code patterns, an audit table (violation → detection → severity → remedy), and trade-offs with other laws. |
| **Playbooks** | 25 components (navigation, forms, checkout, pricing, tables, dashboards, modals, onboarding, empty states…), plus mobile and desktop platform guides, design tokens and visual polish, law tensions, and the audit workflow. |
| **`uxl_lint.py`** | Static linter with 31 rules, each mapped to laws. Covers HTML, CSS/SCSS, JSX/TSX, Vue, Svelte, Astro and Tailwind classes. Pure Python stdlib. |
| **`uxl_audit.mjs`** | Playwright runtime auditor with 19 checks at 390px mobile and 1440px desktop: tap targets, contrast, input zoom, overflow, nav load, competing CTAs, LCP/CLS, focus visibility and more. It writes **annotated screenshots** with every violation outlined. |
| **Assets** | Drop-in design tokens (`uxl-tokens.css`, Tailwind v4 `@theme`), a pre-ship checklist covering all 30 laws, and a case-file report template. |
| **Claude Code plugin** | `/uxl:build`, `/uxl:audit`, `/uxl:fix`, `/uxl:law` and a `ux-auditor` subagent. |
| **Adapters** | Generated rule files for agents without skill support: AGENTS.md, Cursor `.mdc`, Copilot `.instructions.md`, Windsurf. |

## Install

### Claude Code: plugin (recommended)
```
/plugin marketplace add BurgiSimon/UXL
/plugin install uxl@uxl
```
This gives you the skill, which triggers automatically on UI work, plus the `/uxl:*` commands and the `ux-auditor` agent.

### Any agent that supports Agent Skills
UXL is a standard [Agent Skill](https://agentskills.io) at `skills/ux-lawyer/`.

```bash
npx skills add BurgiSimon/UXL                # skills CLI: detects your agents and installs to the right place
# or
git clone https://github.com/BurgiSimon/UXL && ./UXL/install.sh          # ~/.claude/skills + ~/.agents/skills
./UXL/install.sh --project path/to/your/app                               # project-level .claude/skills + .agents/skills
```

| Agent | Where UXL goes | Install command |
|---|---|---|
| **Claude Code** | `~/.claude/skills/` or `.claude/skills/` | plugin (above) or `./install.sh --claude` |
| **OpenAI Codex** | `~/.agents/skills/` or `.agents/skills/` | `./install.sh --codex`. Older builds use `~/.codex/skills`: `--codex-legacy` |
| **Cursor** | `.agents/skills/` or `.cursor/skills/`; rules in `.cursor/rules/` | `./install.sh --project .`, or rules only: `--cursor .` |
| **Gemini CLI** | `~/.gemini/skills/` or `~/.agents/skills/`; also an extension | `gemini extensions install https://github.com/BurgiSimon/UXL`, or `./install.sh --gemini` |
| **GitHub Copilot** | `.github/skills/`, `.agents/skills/`, `~/.copilot/skills/` | `./install.sh --project .`, or instructions only: `--copilot .` |
| **Windsurf / Devin Desktop** | `.agents/skills/` or `.windsurf/skills/`; rules in `.windsurf/rules/` | `./install.sh --project .`, or rules only: `--windsurf .` |
| **OpenCode, Amp, Cline, Zed, others** | `.agents/skills/` or `~/.agents/skills/` | `./install.sh` |
| **Agents that only read AGENTS.md** | `AGENTS.md` | `./install.sh --agents-md .` (adds a refreshable UXL section) |
| **claude.ai** | Settings → Capabilities → Skills | `python3 tools/build_adapters.py --zip`, then upload `adapters/claude-ai/ux-lawyer.zip` |

The runtime auditor needs Playwright in the project or globally: `npm i -D playwright && npx playwright install chromium`. The linter needs only Python 3.8+.

## Use it

The skill triggers on its own whenever your agent builds or changes UI. You don't have to say "UX". For example:

```text
Build me a landing page with an email signup for my meal-planning app. It has to look great on phones and desktop.
Our checkout converts terribly on mobile. Fix it.
The sidebar has 14 items and users get lost. Redesign the app navigation for desktop and mobile.
Review the onboarding flow in src/app/(onboarding) for UX problems.
Which UX law applies to our pricing page having 5 plans?
```

Claude Code commands:

| Command | What it does |
|---|---|
| `/uxl:build <what>` | Build mode: brief → structure → tokens → mobile-first composition → states → verify → "UX decisions" list |
| `/uxl:audit [path\|url]` | Report-only case file: static + runtime scans, the 30-law sweep, findings ranked with § citations |
| `/uxl:fix [scope]` | Audit, then fix root causes first, re-scan, and report before → after |
| `/uxl:law <law\|question>` | Explain a law or decide which laws apply, with build rules and code |

Run the scanners directly:

```bash
python3 skills/ux-lawyer/scripts/uxl_lint.py src/ --format md
node skills/ux-lawyer/scripts/uxl_audit.mjs http://localhost:3000 http://localhost:3000/signup --out uxl-report
```

## How it works

**Modes.** *Build*: a short brief (critical tasks via §L21 Pareto, conventions via §L11 Jakob, where complexity lives via §L27 Tesler), then IA, tokens, mobile-first composition, interaction and states, journey polish, and verification. *Audit & Fix*: scope the critical flows, gather static and runtime evidence, run a manual sweep with one question per law, write a cited case file, fix root causes, and report before → after. *Consult*: name the law, explain the mechanism, recommend, and resolve any tension between laws.

**Statutes.** Defaults that apply to every UI, each backed by a law. A few:

- Targets ≥ 44px with ≥ 8px gaps, and the primary action in the thumb zone (§L07).
- Feedback in < 100ms, results in < 400ms or a visible progress state (§L06).
- One primary action per view (§L28). Nav ≤ 7 items, mobile tab bar 3–5 (§L10).
- Visible labels, correct `type`/`inputmode`/`autocomplete`, 16px inputs, and an enabled submit button that explains errors (§L29, §L24, §L08, §L20).
- Loading, empty, error and success states everywhere (§L06, §L23).
- No dark patterns, ever (§L04).
- Be conventional in structure and distinctive in style (§L11 + §L01).

## The 30 laws

| § | Law | Rule of thumb |
|---|---|---|
| L01 | [Aesthetic-Usability Effect](skills/ux-lawyer/references/laws/aesthetic-usability.md) | Polish earns patience and trust, but don't let beauty hide a broken flow |
| L02 | [Choice Overload](skills/ux-lawyer/references/laws/choice-overload.md) | Too many options stall decisions: curate, recommend, filter |
| L03 | [Chunking](skills/ux-lawyer/references/laws/chunking.md) | Break content, forms and numbers into small, labeled groups |
| L04 | [Cognitive Bias](skills/ux-lawyer/references/laws/cognitive-bias.md) | Use defaults, anchors and framing honestly, never as dark patterns |
| L05 | [Cognitive Load](skills/ux-lawyer/references/laws/cognitive-load.md) | Remove whatever makes users think about the UI instead of the task |
| L06 | [Doherty Threshold](skills/ux-lawyer/references/laws/doherty-threshold.md) | Respond in < 400 ms or show progress |
| L07 | [Fitts's Law](skills/ux-lawyer/references/laws/fitts-law.md) | Big, close targets: ≥ 44 px, primary action within thumb reach |
| L08 | [Flow](skills/ux-lawyer/references/laws/flow.md) | Protect focus: no needless interruptions, instant feedback |
| L09 | [Goal-Gradient Effect](skills/ux-lawyer/references/laws/goal-gradient.md) | Show progress. Effort rises near the finish line |
| L10 | [Hick's Law](skills/ux-lawyer/references/laws/hicks-law.md) | Fewer, clearer choices per step |
| L11 | [Jakob's Law](skills/ux-lawyer/references/laws/jakobs-law.md) | Work like the sites users already know |
| L12 | [Law of Common Region](skills/ux-lawyer/references/laws/common-region.md) | A shared boundary makes a group |
| L13 | [Law of Proximity](skills/ux-lawyer/references/laws/proximity.md) | Near means related. Spacing is structure |
| L14 | [Law of Prägnanz](skills/ux-lawyer/references/laws/pragnanz.md) | People read the simplest form |
| L15 | [Law of Similarity](skills/ux-lawyer/references/laws/similarity.md) | Alike-looking means alike-acting |
| L16 | [Law of Uniform Connectedness](skills/ux-lawyer/references/laws/uniform-connectedness.md) | Connected elements read as related |
| L17 | [Mental Model](skills/ux-lawyer/references/laws/mental-model.md) | Match what users believe, in their words |
| L18 | [Miller's Law](skills/ux-lawyer/references/laws/millers-law.md) | Short-term memory is tiny: chunk, don't cram |
| L19 | [Occam's Razor](skills/ux-lawyer/references/laws/occams-razor.md) | The simplest design that fully works wins |
| L20 | [Paradox of the Active User](skills/ux-lawyer/references/laws/active-user-paradox.md) | Nobody reads the manual: teach in context |
| L21 | [Pareto Principle](skills/ux-lawyer/references/laws/pareto-principle.md) | Perfect the 20 % that carries 80 % of the value |
| L22 | [Parkinson's Law](skills/ux-lawyer/references/laws/parkinsons-law.md) | Shorten tasks: autofill, defaults, express paths |
| L23 | [Peak-End Rule](skills/ux-lawyer/references/laws/peak-end-rule.md) | Design the peak and the end |
| L24 | [Postel's Law](skills/ux-lawyer/references/laws/postels-law.md) | Accept messy input; output clean results |
| L25 | [Selective Attention](skills/ux-lawyer/references/laws/selective-attention.md) | Users filter out what looks irrelevant or ad-like |
| L26 | [Serial Position Effect](skills/ux-lawyer/references/laws/serial-position.md) | Put key items first and last |
| L27 | [Tesler's Law](skills/ux-lawyer/references/laws/teslers-law.md) | The system, not the user, should carry the complexity |
| L28 | [Von Restorff Effect](skills/ux-lawyer/references/laws/von-restorff.md) | Reserve emphasis for the one key action |
| L29 | [Working Memory](skills/ux-lawyer/references/laws/working-memory.md) | Recognition over recall; keep context visible |
| L30 | [Zeigarnik Effect](skills/ux-lawyer/references/laws/zeigarnik-effect.md) | Show what's unfinished; let people resume |

## The scanners

**Static: `uxl_lint.py`** (31 rules). Each finding names its law(s), points to a `file:line` and gives a remedy. Examples: `small-target`, `placeholder-as-label`, `input-font-small`, `nav-overload`, `multiple-primary-cta`, `async-no-feedback`, `focus-outline-removed`, `hover-only`, `div-button`, `form-long`, `autocomplete-missing`, `dark-pattern-urgency`, `dark-pattern-precheck`, `dark-pattern-confirmshaming`, `reduced-motion-missing`, `font-size-sprawl` and more (`--list-rules`). Supports `--format text|md|json`, `--fail-on major` for CI, and `uxl-ignore <rule>` comments.

**Runtime: `uxl_audit.mjs`** (19 checks). Renders each page in Chromium at mobile (390×844, touch) and desktop (1440×900), plus an optional small phone (360×740, `--viewports small,mobile,desktop`). It measures real tap-target sizes and spacing, WCAG contrast, body and input font sizes, horizontal overflow, nav item counts, filled CTAs in the first screen, the h1, FCP/LCP/CLS, keyboard focus visibility, labels, form length, font and color sprawl, viewport/zoom settings and autoplaying media. Output: `report.md`, `report.json`, a first-screen screenshot per viewport, and a **full-page annotated screenshot** with each violation outlined and labelled.

<!-- BENCHMARK:START -->
## Benchmark

UXL was built with Anthropic's **skill-creator** loop. Each realistic task ran in a fresh agent **with** and **without** the skill. Outputs were graded by the UXL scanners and an independent grader agent, including a blind side-by-side comparison. The skill was then revised and re-run. Results with the current version (iteration 2):

| Task | With UXL | Without | Static score | Runtime score |
|---|---|---|---|---|
| Build a landing page + email signup (single HTML file, phone + desktop) | **13/13** | 11/13 | 100 vs 89 | 100 vs 89 |
| Fix a broken e-commerce checkout (bad mobile UX, dark patterns) | **15/15** | 14/15 | 98 vs 94 | 100 vs 100 |
| Redesign a 14-item SaaS sidebar for desktop + mobile (React + Tailwind) | **9/9** | 8/9 | 100 vs 90 | n/a (TSX) |
| **Total** | **100%** | 89% | | |

How to read this honestly: the baseline (the same strong model without UXL) is already good. On the functional assertions, UXL scores **34/34** and the baseline **33/34**. Most of the gap is the law-citation assertion, which UXL asks for by design. The differences that matter:

- **The last mile.** Without UXL, the baseline still shipped a 29px footer link on mobile and scored 89–94 on the static scanner. UXL runs scored 98–100. In the nav redesign, the baseline used 36px icon-only rows on touch tablets and read `localStorage` during render (an SSR hydration mismatch). A blind grader **chose the UXL design in both iterations**.
- **Reasoning on the record.** UXL runs hand off a "UX decisions" list that cites the laws, so a reviewer can see why each choice was made.
- **Evidence.** UXL runs measure before → after. The checkout went from 63 static and 25 runtime findings to 1 deliberate exception and 0.

**Cost:** UXL runs used about 1.7× the tokens and about 1.5× the wall time. The extra goes on verification: scanning, then exercising the main flow, which caught real interaction bugs in most runs. Iteration 2 already cut overhead by 18% (time) and 12% (tokens) versus iteration 1 without losing quality.

**Triggering:** the skill description loads UXL for **10/10** realistic UI requests and **0/10** near-misses such as scraping, CI, schemas and translations (`evals/trigger_eval.py`, 2 runs each).

Raw data: [`evals/results/`](evals/results/) · prompts and assertions: [`evals/evals.json`](evals/evals.json) · grader: [`evals/grade.py`](evals/grade.py).
<!-- BENCHMARK:END -->

## Repository layout

```
skills/ux-lawyer/        the Agent Skill: SKILL.md, references/ (30 laws + guides), assets/, scripts/
.claude-plugin/          Claude Code plugin + marketplace manifests
commands/  agents/       /uxl:* commands and the ux-auditor subagent
adapters/                generated AGENTS.md / Cursor / Copilot / Windsurf rule files
gemini-extension.json    Gemini CLI extension manifest
install.sh               multi-agent installer
evals/                   eval prompts + assertions, fixtures, grader
tests/ tools/            linter tests, skill validator, adapter builder, demo builders
docs/                    the demo cases, served with GitHub Pages: Fernwheel, Lumenvale, Voxmere
video/                   the Voxmere film: Playwright frame capture + Remotion source
```

## Credits & license

- The laws and their names come from **[Laws of UX](https://lawsofux.com) by Jon Yablonski**, a wonderful resource; read it and buy the book. Its site content is licensed CC BY-NC-ND 4.0, so **UXL does not copy it**. All explanations, rules, code and checks here are original, and every law file links back to its lawsofux.com page.
- UXL itself is [MIT licensed](LICENSE).
