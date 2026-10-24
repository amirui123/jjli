# Start here — the 2026 front-end stack, verified

> Everything below was checked live on 2026-10-20. Sources in
> `docs/ecosystem/claude-code-tooling.md`, `docs/ecosystem/design-skills.md`,
> and `docs/libraries/`.

---

## Part 1 — What to install before you start

**The four layers.** A stack missing any layer breaks down inside one session.

| Layer | Question it answers | Canonical tool | Install |
|---|---|---|---|
| **Behaviour** | "Why does it over-engineer?" | Karpathy's `CLAUDE.md` | `curl -o CLAUDE.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md` |
| **Skill** | "How does it know how to do *this*?" | `npx skills add <owner>/<repo>` | `npx skills add shadcn/ui` |
| **Methodology** | "Why did it ship without tests?" | `obra/superpowers` | `/plugin install superpowers@claude-plugins-official` |
| **Memory** | "Why did it forget last session?" | `claude-mem` | `/plugin marketplace add thedotmack/claude-mem` |
| **Ground truth** | "Why is it using an API from 4 months ago?" | `context7` MCP | `/plugin install context7@claude-plugins-official` |
| **Verification** | "How do we know it works?" | Playwright MCP | `/plugin install playwright@claude-plugins-official` |

**The three skills with the most installs:**

| Skill | Installs | What it does |
|---|---|---|
| `anthropics/skills/frontend-design` | **1,007,521** | A plain markdown file that forces a design-thinking pass. Bans "Roboto, Inter, Arial… purple gradients on white backgrounds" |
| `vercel-labs/agent-skills/web-design-guidelines` | **760,123** | Lints your own UI against the guidelines |
| `Leonxlnx/taste-skill` | **640,624** | The anti-slop frontend skill |

> A 6-agent bake-off found Opus 4.5 **worst** on raw output but **best** with
> `frontend-design` loaded. **The skill supplies taste, not the model.**

---

## Part 2 — Two things that will waste your afternoon

**1. `AGENTS.md` silently stops loading.**
Claude Code v2.1.277+ reads `AGENTS.md` natively — but only if there is no
`CLAUDE.md` or `CLAUDE.local.md` **anywhere above it**. Adding a
`CLAUDE.local.md` kills `AGENTS.md` loading with no error message.

**2. The methodology layer conflicts with itself.**
ECC's own manifest says *"YOU MUST UNINSTALL OTHER VERSIONS OF SUPERPOWERS"*.
Superpowers / ECC / gstack / mattpocock / addyosmani genuinely compete. Same
for 4 competing memory layers and 5 browser layers. **Pick one per layer.**

---

## Part 3 — What is real, and what is hype

### The hype is real, but shallow

TikTok: 148 unique videos across 13 queries → **125 distinct creators**, and
**107 of them posted exactly one relevant video**. The median relevant video
gets ~1,300 likes and ~26 comments. High plays, low comments — passive
scrollers, not practitioners.

**The four biggest "Claude Code" videos (656K likes, 8.7M plays combined) name
no tool, no repo, no feature.** They are agency funnels with a Claude Code
hook attached.

Two near-siloed clusters share almost zero tools: an Arabic "Claude Code
skills" cluster (Egypt/Gulf) and an English "AI slop / design taste" cluster.

### The substance

| Claim | Verdict |
|---|---|
| "`mattpocock/skills` has more stars than React" | **TRUE** — 298,275 vs React's 251,512 |
| "`coreyhaines31/marketingskills` is 50 skills, MIT" | **TRUE** on every point — 55,627 stars |
| "Find Skills", "Voice DNA", "Content Engine", "ClaudeX" | **No repos exist** — fake |
| "`getdesign.md`" | No official GitHub org; mirrors are 0–14 stars |
| "`ismail9k/vibe-coder-survival-guide`" | 51 stars, abandoned after 3 days |
| "0% AI detector" | False precision |

### The counter-trend is large

`@geeklevelasian` alone got **102.6K likes** on a video called "Ai design is
the ugliest crap I've ever seen." The demand for *not*-slop is bigger than the
hype for AI-generated work.

---

## Part 4 — A repo with 80k stars is not automatically a skill

Verified by walking git trees, not by reading the README:

**Zero `SKILL.md` — component code only**
`ibelick/motion-primitives` · `DavidHDev/react-bits` (its `skill-*.webp` files
are marketing images) · `Trystan-SA/claude-design-system-prompt` (plain `.md`
prompt library) · `wilwaldon/Claude-Code-Frontend-Design-Toolkit` (README
pointer) · `figma/community-resources` (an index) · `shadcn-ui/lint` (an npm
linter) · `iart-ai/motion-skills` (a hub README claiming "50 skills" that
actually live in 18 sibling repos)

**Real skills**
`nexu-io/open-design` (549) · `educlopez/ui-craft` (217) ·
`wshobson/agents` (185) · `Owl-Listener/designer-skills` (111) ·
`figma/mcp-server-guide` (32) · `plugin87/ux-ui-agent-skills` (27) ·
`pbakaus/impeccable` (25 — but only **2 unique** skills, vendored into 19
harness folders)

**Third format:** `DESIGN.md` as a separate channel from `SKILL.md`.

**How to tell, in 10 seconds:**
```sh
gh api repos/<owner>/<repo> --jq '[.name, .stargazers_count] | @tsv'
gh api repos/<owner>/<repo>/git/trees/HEAD?recursive=1 \
  --jq '[.tree[].path | select(test("SKILL.md$"))] | length'
```
Second command returns `0` → it is not a skill.

---

## Part 5 — Rank by installs, not stars

Install counters are attributable and resellable. Star counts are not.

`designed-by-ai/skills` has **19 stars** and **916,408 installs** — because its
README tells you to run `npx skills add sleekdotdesign/agent-skills`. Those
installs belong to a *different* repo (589 stars).

```sh
curl -s "https://skills.sh/api/search?q=<query>" | head -c 2000
```

---

## Part 6 — Library routing (the short version)

**Check CSS first.** Scroll-driven reveals, page transitions, and entry
animations are all native in 2026. See `docs/libraries/modern-css.md`.

| Need | Reach for |
|---|---|
| Complex timelines, scroll choreography | **GSAP** (all Club plugins free since 3.13) |
| React layout animation, shared-element | **Motion** (`motion.dev`) |
| Vanilla timeline, tiny | **anime.js v4** |
| Smooth scroll | **Lenis** (not `smooth-scrollbar` — dead since 2023) |
| Accessible carousel | **Embla** |
| Interactive state-machine animation | **Rive** |
| React → MP4 | **Remotion** (or **Revideo** for MIT) |
| Math animation | **Manim Community** |

**The two-clock rule:** discrete change → long ease-out (~700ms on
`(.32, .72, 0, 1)`). Continuous input → **spring**, never a timed ease.

---

## Part 7 — The 10 repos worth reading the source of

1. `lucasmarkes/hairline` — 6,460 LOC, zero deps. Real orthographic camera with
   an **inverse projection** so pointer hits are tested in world space.
   Two-clock motion model at fixed 240 Hz. Hand-rolled **Newton+bisection
   cubic-bezier solver**. One shared rAF that stops when nothing moves.
2. `lucasmarkes/motes` — 1,738 LOC WebGL2. The shader is assembled
   `common → field() → pointer → main`, so an effect *provably* cannot see the
   pointer. Phosphor ping-pong with premultiplied alpha.
3. `wheresryan22/anatomy` — hairline's successor, with a **geometry audit
   harness** that proves nothing interpenetrates.
4. `squall01337/abyssal-ocean` — JONSWAP spectrum, 512² inverse FFT per frame
   with MRT carrying 4 complex fields.
5. `meodai/heerich` — 3D CSG → SVG.
6. `guillermolg00/morphicons` — stroke↔fill icon morphing.
7. `bybit-exchange/svg-diagram` — a 12-check linter that gates agent output.
8. `dembrandt/dembrandt` — design tokens + motion + CI drift gate.
9. `GoogleChromeLabs/view-transitions-toolkit` — pause, resume, and **scrub** a
   View Transition.
10. `pbakaus/impeccable` — `reference/craft-floor.md` is a quality floor with
    absolute bans. Worth reading even if you never install it.

---

## The one thing to remember

**Stars and installs both lie. Read the source.**

`hairline` is 2,494 stars. `react-bits` is 49,773. `react` is 251,512. None of
those numbers tell you whether the code is good — only reading it does.
