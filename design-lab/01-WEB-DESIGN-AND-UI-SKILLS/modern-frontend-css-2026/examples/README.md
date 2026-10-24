# Example Prompts — 2026 Edition

These prompts are calibrated to trigger the 2026 modern-frontend-design skill correctly.
Each includes niche context, stack, and key 2026 requirements.

## Prompts by Category

### AI SaaS Landing Page
"Build a cinematic landing page for 'Lumina AI' — an AI writing assistant.
Dark theme, OKLCH indigo palette, video background hero with grain overlay,
native CSS scroll-driven animations (animation-timeline: view()), liquid glass
components, bento feature grid, and glassmorphism pricing. Next.js 15 + Tailwind."

### Fintech Dashboard
"Build a professional expense dashboard for 'Clearpath'. Light mode, OKLCH
professional blue. Sidebar with Container scroll-state sticky shadow, 4 KPI cards
with semantic trend colors, area chart, filterable transactions table, skeleton
loaders. Use @starting-style for any entering drawers. Next.js 15."

### Developer Tool Hero
"Build a hero section for 'Axiom' — developer observability. Dark green OKLCH
terminal aesthetic, monospace font, terminal block with staggered line reveal
using sibling-index() CSS. @starting-style on terminal block enter. React + Tailwind."

### Creative Agency (Neo-Brutalism)
"Build an Awwwards-quality hero for 'Forma Studio' design agency. Neo-brutalism:
warm dark OKLCH (copper primary), zero border radius, oversized mixed-weight serif
type (80px+), GSAP character reveal, ScrollTrigger parallax, custom cursor.
Grain texture. Asymmetric layout. React + GSAP."

### Wellness App
"Build a wellness app hero for 'Bloom'. Soft sage OKLCH palette, light mode,
organic blob backgrounds (CSS radial-gradient with blur, CSS animation), phone
mockup right column, native scroll reveals (animation-timeline: view()). Framer Motion."

### SaaS Pricing Page
"Build a pricing page for 'Forma AI'. Three tiers: Free/Pro($29 or $24 yearly)/
Enterprise. OKLCH dark bg, liquid-glass cards, Framer layoutId price toggle animation,
AnimatePresence savings badge, FAQ accordion with @starting-style expand. React."

## Expected Behaviors from Skill v3.0

When these prompts are processed by an agent using this skill, the agent should:

1. **Define OKLCH :root tokens first** — before any component code
2. **Add .liquid-glass utility** — in globals.css
3. **Use animation-timeline: view()** — for scroll reveals, not Intersection Observer
4. **Add @starting-style** — on every entering element (modal, drawer, toast)
5. **Include @view-transition** — for page navigation
6. **Add grain texture** — body::after with SVG filter
7. **Specify per-element animation timing** — delay + duration + easing for each
8. **Write realistic copy** — not lorem ipsum
9. **Pass token audit** — zero hex values in DevTools
