# Modern Frontend Design 

A skill for coding agents that transforms vague UI requests into polished, production-quality
frontends. v3.0 is the first edition built specifically for 2026's design landscape: OKLCH
color tokens, native CSS scroll-driven animations, Liquid Glass surfaces, View Transitions,
CSS Anchor Positioning, `@starting-style` enters, and niche-aware AI Minimalism vs
Neo-Brutalism design direction.


## What's New in v3.0 (2026)

| Feature | v2.0 | v3.0 (2026) |
|---------|------|-------------|
| Color format | HSL tokens | **OKLCH — Baseline 2026, perceptual uniformity** |
| Scroll animations | Framer / Intersection Observer | **Native CSS `animation-timeline: view()`** |
| Enter animations | Framer initial/animate | **`@starting-style` — flash-free, no JS** |
| Page transitions | Manual | **`@view-transition { navigation: auto }`** |
| Tooltips | Floating UI / Popper.js | **CSS Anchor Positioning** |
| Staggered animations | JS delays | **`sibling-index()` CSS function** |
| Grid layouts | Manual JS masonry | **Native CSS Grid Lanes / masonry** |
| AI aesthetic | Generic glow | **AI Minimalism — restrained, Perplexity/OpenAI style** |
| Color vocabulary | 2 niches | **5 aesthetics: AI Minimalism, Technical Mono, Neo-Brutalism, Organic, Cinematic** |
| Evals | 7 cases / 108 assertions | **7 cases / 129 assertions** |
| CI | ✅ | **✅ 13/13 tests** |

## The 2026 Paradigm Shift

After years of everyone copying the same "dark purple glow" SaaS aesthetic, 2026 splits into
distinct visual languages:

| Aesthetic | Products | Visual Signature |
|-----------|----------|-----------------|
| **AI Minimalism** | Perplexity, Claude, OpenAI | Aggressive whitespace, single font, barely-there UI |
| **Technical Mono** | Terminal-style dev tools | Monospace, dark green, code blocks, zero decoration |
| **Cinematic** | SaaS marketing, AI startups | Video heroes, liquid glass, oversized type, marquees |
| **Neo-Brutalism** | Agencies, art projects, edgy brands | Zero radius, stark borders, offset shadows, bold type |
| **Organic** | Wellness, agencies, portfolios | Earthy OKLCH, soft curves, blob backgrounds, grain |

The skill detects which aesthetic fits the product niche and applies it correctly.

## How It Works

Ask your agent: *"Build a cinematic landing page for my AI startup Nimbus."*

The skill runs a **12-step Atom of Thought Design Process**:

0. **OKLCH Token System** — complete :root variables before any component
1. **Product Understanding** — type, audience, value prop, conversion goal
2. **2026 Visual Research** — 5 hero patterns, aesthetic selection, trend application
3. **Visual System** — OKLCH palette, variable font pairing, spacing scale, radius
4. **Layout Architecture** — section structure mapped before coding
5. **Component System** — liquid-glass surfaces, anchor-based tooltips
6. **2026 Motion System** — native CSS scroll-driven, `@starting-style`, View Transitions
7. **Technology Stack** — Next.js 15, Tailwind v4, TypeScript baseline
8. **Backend + Performance** — RSC, Core Web Vitals, sustainable design
9. **Responsive + Accessible** — WCAG 2.1 AA baked in, not afterthought
10. **Quality Validation** — OKLCH token audit, 2026 CSS feature checklist
11. **Hero Prompt Engineering** — MotionSites-style precise spec output
12. **Final Testing** — build, lint, runtime, component scan, hex audit

## What's Inside

```
modern-frontend-skill/
├── skills/modern-frontend-design/
│   ├── SKILL.md                     # 598-line 12-step process — CI validated ✓
│   ├── references/
│   │   ├── design-systems.md        # 615-line: OKLCH palettes, liquid glass,
│   │   │                            #   2026 CSS features, neo-brutalism recipes,
│   │   │                            #   gradient/glow, marquee, grain, a11y
│   │   └── hero-prompts.md          # 431-line: 6 MotionSites-quality templates
│   └── evals/
│       └── evals.json               # 7 cases · 129 assertions
├── scripts/
│   ├── validate_skill.py            # CI validator — enforces ≤600 line limit
│   └── run_evals.py                 # Eval summary printer
├── tests/
│   ├── test_validate_skill.py       # 6 tests
│   └── test_evals.py                # 7 tests — 13 total
├── examples/
│   └── README.md                    # 6 calibrated prompt examples
├── docs/
│   └── SKILL-GUIDE.md               # Customization guide
├── .github/workflows/ci.yml         # CI: validate + evals + pytest
└── README.md
```

## 2026 Niche Design Table

| Niche | Aesthetic | Primary Color | Hero Pattern |
|-------|-----------|--------------|--------------|
| AI / ML tools | AI Minimalism | OKLCH neutral or indigo | B (minimal) or A (cinematic) |
| Developer tools | Technical Mono | OKLCH green | Code block terminal |
| Fintech | Professional light | OKLCH deep blue | Two-column + dashboard card |
| Cybersecurity | Dark terminal | OKLCH green or red | Status-driven |
| Creative agencies | Neo-Brutalism | Warm OKLCH copper | D (editorial type) |
| SaaS dashboards | Cinematic | OKLCH indigo | Bento grid |
| E-commerce (lifestyle) | Dopamine | Vivid OKLCH chroma | Product grid |
| Health / Wellness | Organic | OKLCH sage/earthy | Blob bg + phone mockup |
| Portfolios | Neo-Brutal or Organic | Niche-dependent | Asymmetric |
| Startups | Cinematic | OKLCH indigo/purple | Video + marquee |
| B2B / Consulting | Premium dark | OKLCH muted | Authority-driven |

## Anti-Patterns — 2026 Edition

| Anti-Pattern | Why It Fails in 2026 | Fix |
|-------------|---------------------|-----|
| HSL/hex colors | Perceptual non-uniformity, no relative color syntax | OKLCH everywhere |
| JS scroll listeners for animation | Blocks main thread, needs library | `animation-timeline: view()` |
| Flash of final state on modals | Jarring, amateur feel | `@starting-style` |
| Floating UI / Popper.js for tooltips | Unnecessary dependency | CSS Anchor Positioning |
| "Purple glow on dark" for every AI app | Overdone, AI Minimalism has won | Choose your aesthetic intentionally |
| JS stagger with timeouts | Fragile, unnecessary | `sibling-index()` or CSS delay calc |
| Lorem ipsum copy | Can't judge real design | Write realistic product copy always |
| Accessibility as afterthought | Legal risk, bad UX, fails WCAG | OKLCH contrast tokens baked in |
| Ignoring RSC in Next.js 15 | Heavy client bundle, slow LCP | Static content → RSC default |

## Test Cases

| # | Scenario | Stack | Key 2026 Focus |
|---|---------|-------|----------------|
| 1 | AI SaaS landing (Lumina AI) | Next.js + Framer | OKLCH, video hero, scroll-driven, @starting-style |
| 2 | Fintech dashboard (Clearpath) | Next.js | OKLCH light, Container scroll-state, RSC |
| 3 | Designer portfolio (Aria Chen) | HTML/CSS/JS | OKLCH, animation-timeline, no frameworks |
| 4 | Dev tool hero (Axiom) | React | OKLCH green, sibling-index(), terminal |
| 5 | SaaS pricing (Forma AI) | React + Framer | OKLCH, layoutId toggle, @starting-style FAQ |
| 6 | Agency hero (Forma Studio) | React + GSAP | Neo-brutalism, zero radius, GSAP character |
| 7 | PM dashboard token audit | Next.js | Full OKLCH audit — zero hex proof |

7 evals · 129 assertions · CI: 13/13 tests ✅

## Installation

```bash
# Claude Code
npx skills add deveshpunjabi/modern-frontend-skill

# Cursor
cp -r skills/modern-frontend-design .cursor/skills/

# Windsurf / Cline
cp -r skills/modern-frontend-design .<agent>/skills/

# Any agent
cp skills/modern-frontend-design/SKILL.md <agent-skills-dir>/
```

## Verify It Works

In a new session, ask:

> "Build a cinematic hero for my AI startup 'Nimbus'. Dark OKLCH indigo, video background,
> native CSS scroll-driven animations, liquid glass, and @starting-style on the CTA modal."

The agent should: define OKLCH :root tokens → add .liquid-glass utility → build video hero
→ use `animation-timeline: view()` for reveals → add `@starting-style` → include
`@view-transition` → add grain texture → specify per-element animation timing.

## Scripts

```bash
# Validate SKILL.md (required to pass CI)
python scripts/validate_skill.py skills/modern-frontend-design/SKILL.md
# → ✓ valid

# View eval summary
python scripts/run_evals.py skills/modern-frontend-design/evals/evals.json
# → 7 evals, 129 assertions

# Run all 13 tests
python -m pytest tests/ -v
# → 13 passed
```

## Philosophy

- **OKLCH-first** — perceptually uniform, relative color syntax, Baseline 2026
- **CSS-native motion** — scroll-driven animations over JS libraries where possible
- **`@starting-style`** — every modal/drawer/toast has a flash-free enter
- **View Transitions** — page navigation feels like a native app
- **Aesthetic intentionality** — AI Minimalism, Technical Mono, Neo-Brutalism, Organic, Cinematic
- **Liquid Glass** — the 2026 standard for floating surfaces
- **WCAG baked in** — not a checkbox, a design foundation
- **RSC-aware** — static by default, client only for interactivity

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `python -m pytest tests/ -v` before PRs.

## License

MIT — see [LICENSE](LICENSE)
