---
name: color-theory
description: "Color theory intelligence for design work. Use when user asks to choose a color palette, pick colors, create color schemes, check color contrast, apply the 60-30-10 rule, select brand colors, build design system color tokens, or work with color spaces (RGB, HSL, OKLCH). Covers harmony schemes, psychology, accessibility (WCAG), color blindness, and dark/light mode. Do NOT use for typography-only questions, layout-only tasks, or image editing."
---
# Color Theory - Design Intelligence

## Instructions

When the user needs color guidance, follow this workflow:

### Step 1: Identify the Color Task

Determine which type of color decision is needed:
- **Palette creation** - User needs a new set of colors (use Harmony Schemes + 60-30-10 Rule)
- **Palette evaluation** - User has colors, wants feedback (check Accessibility + Harmony rules)
- **Brand color selection** - User choosing primary brand color (use Psychology + Harmony)
- **Theme implementation** - User building light/dark mode (use Dark/Light Mode rules)
- **Design system tokens** - User structuring color architecture (use Semantic Tokens)
- **Color space choice** - User asking which format to use (recommend OKLCH for modern work)

### Step 2: Apply the Relevant Knowledge

Use the reference sections below. For deeper detail on any topic, consult `references/` files:
- `references/history-and-models.md` - Color wheel history, RYB/RGB/CMYK models, mixing, OKLCH/OKLAB deep dive, gamut
- `references/psychology-and-perception.md` - Full hue association table, cultural variations, perception phenomena

### Step 3: Validate the Result

Before delivering any color recommendation:
- [ ] Contrast meets WCAG AA minimum (4.5:1 normal text, 3:1 large text)
- [ ] Not relying on color alone to convey information
- [ ] Works for color-blind users (no red/green-only differentiation)
- [ ] 60-30-10 proportions are reasonable
- [ ] Dark mode variant considered if applicable

---

## Quick Decision Guide

| User Asks | Apply |
|-----------|-------|
| "What colors go together?" | Harmony Schemes below |
| "How much of each color?" | 60-30-10 Rule below |
| "Is this readable?" / "Check contrast" | WCAG Contrast Ratios below |
| "Does this work for color-blind users?" | Color Blindness rules below |
| "What color space should I use?" | OKLCH for palettes, OKLAB for gradients (see `references/history-and-models.md`) |
| "What mood does this palette create?" | Color Psychology summary below; full table in `references/psychology-and-perception.md` |
| "How should dark mode colors differ?" | Dark/Light Mode rules below |
| "How to structure design system colors?" | Semantic Color Tokens below |

---

## Color Harmony Schemes

Systematic combinations on a 360-degree color wheel:

| Scheme | Structure | Colors | Character | Best For |
|--------|-----------|--------|-----------|----------|
| **Monochromatic** | Single hue + tints/shades/tones | 1 hue | Cohesive, elegant | Minimalist designs |
| **Complementary** | Opposite (180 deg) | 2 hues | High contrast, vibrant | CTAs, emphasis |
| **Split-Complementary** | Base + 2 neighbors of complement | 3 hues | Strong but less jarring | Versatile layouts |
| **Analogous** | Adjacent (~30 deg apart) | 3-5 hues | Harmonious, natural | Serene designs |
| **Triadic** | Evenly spaced (120 deg) | 3 hues | Lively, balanced | Playful designs |
| **Tetradic/Rectangle** | Two complementary pairs | 4 hues | Richest variety | Dashboards, complex UI |
| **Square** | Evenly spaced (90 deg) | 4 hues | Dynamic tension | Bold compositions |

### Application Rules
- **One dominant hue** in every scheme; others support or accent
- Complementary: avoid 50/50 splits; use one dominant, one accent
- Analogous: span no more than ~90 degrees total
- Triadic/Tetradic: desaturate all but one color to avoid visual chaos

---

## The 60-30-10 Rule

Proportion formula for distributing color in any design:

| Proportion | Role | Typical Usage |
|-----------|------|---------------|
| **60% Dominant** | Foundation; sets mood | Backgrounds, large surfaces. Usually neutral. |
| **30% Secondary** | Supports dominant; adds interest | Navigation, sidebars, cards, headings |
| **10% Accent** | Draws eye to key elements | CTAs, buttons, links, icons, badges |

### How to Apply
1. Choose palette using a harmony scheme
2. Assign each color to 60%, 30%, or 10%
3. Test: place colors against backgrounds; check legibility
4. Verify accent contrast (e.g., yellow on beige fails)
5. Every color must have a purpose

### Variations
- **70-25-5** for subdued/professional (legal, finance)
- **50-30-20** for richer compositions (creative, gaming)
- Split the 10% across 2-3 accents (5%+3%+2%)
- Dark mode: 60% becomes dark surface instead of light

### Anti-Patterns
- Accent color on large surfaces (overwhelming)
- No clear dominant (colors fight for attention)
- Accent too similar to secondary (no focal point)

---

## Color Properties (Quick Reference)

| Property | Definition |
|----------|-----------|
| **Hue** | Pure color family; 0-360 degrees on wheel |
| **Saturation** | Purity/vividness; 0% = gray, 100% = purest |
| **Value/Lightness** | Light vs dark; most important for hierarchy |
| **Tint** | Hue + white (lighter, pastel, calming) |
| **Shade** | Hue + black (darker, dramatic, sophisticated) |
| **Tone** | Hue + gray (muted, subtle, natural) |
| **Warm colors** | Red, Orange, Yellow - advance, energize |
| **Cool colors** | Blue, Green, Violet - recede, calm |

---

## Color Psychology (Summary)

| Color | Key Associations | Common Design Use |
|-------|-----------------|-------------------|
| **Red** | Energy, urgency, passion | CTAs, alerts, food brands |
| **Orange** | Warmth, creativity, fun | Playful CTAs, friendly brands |
| **Yellow** | Happiness, optimism | Highlights, warnings |
| **Green** | Nature, health, growth | Success states, eco, finance |
| **Blue** | Trust, calm, professionalism | SaaS, corporate, tech |
| **Purple** | Luxury, creativity, royalty | Premium brands |
| **Pink** | Compassion, romance | Beauty, wellness |
| **Black** | Power, elegance, authority | Luxury, fashion |
| **White** | Purity, simplicity, space | Minimalism, tech |

For full association table with negatives, brands, and cultural variations, consult `references/psychology-and-perception.md`.

---

## Color Accessibility

### WCAG Contrast Ratios

| Level | Normal Text | Large Text (18pt+) | UI Components |
|-------|------------|-------------------|---------------|
| **AA (minimum)** | 4.5:1 | 3:1 | 3:1 |
| **AAA (enhanced)** | 7:1 | 4.5:1 | - |

### Color Blindness (~8% of men, ~0.5% of women)

| Type | Confusion | Rule |
|------|-----------|------|
| **Deuteranopia** (most common) | Red-green | Never use red/green as sole differentiator |
| **Protanopia** | Red-green | Never use red/green as sole differentiator |
| **Tritanopia** (rare) | Blue-yellow | Never use blue/yellow as sole differentiator |

### Rules
- Never rely on color alone; pair with icons, labels, patterns, or text
- Test with color blindness simulators (Figma, ChromaSim)
- Ensure luminance contrast between adjacent colors
- OKLCH shortcut: all colors with L >= 0.87 have good contrast with black text

---

## Dark Mode vs. Light Mode

| Aspect | Light Mode | Dark Mode |
|--------|-----------|-----------|
| **Backgrounds** | White / very light gray | Dark gray (NOT pure black) |
| **Saturation** | Full saturation OK | Desaturate to prevent glow |
| **Elevation** | Shadows create depth | Lighter surfaces = higher |
| **Brand colors** | Use as-is | Adjust lightness for contrast |
| **Borders** | `border-gray-200` | `border-gray-700` or lighter |

---

## Semantic Color Tokens (Design Systems)

Three-layer architecture:

- **Layer 1 - Primitives:** Raw values. `blue-500: #3B82F6`
- **Layer 2 - Semantic:** Functional names. `color-primary: {blue-500}`, `color-error: {red-600}`. Enables theme switching.
- **Layer 3 - Component:** Scoped. `button-primary-bg: {color-primary}`

Naming hierarchy: `category-property-variant-state` (e.g., `color-bg-surface-hover`)

| System | Approach |
|--------|----------|
| **Tailwind** | Hue families + numeric shades (50-950): `blue-500` |
| **Material** | Role-based: Primary, OnPrimary, Surface |
| **Custom** | Purpose-based semantic + appearance-based primitives |

---

## Color Models (Quick Reference)

| Model | Use Case | Key Fact |
|-------|----------|----------|
| **RGB** | Screens | Additive; hex/0-255 |
| **CMYK** | Print | Subtractive; device-dependent |
| **HSL** | CSS `hsl()` | Not perceptually uniform |
| **OKLCH** | Modern CSS, palette gen | Perceptually uniform; best choice |
| **OKLAB** | Gradients | Smooth interpolation, no muddy midpoints |

For CSS gradient interpolation: `linear-gradient(in oklab, blue, yellow)`

For full color model details, OKLCH deep dive, and gamut comparison, consult `references/history-and-models.md`.

---

## Examples

### Example 1: "Help me pick colors for a SaaS dashboard"
1. Psychology: Blue = trust, professionalism (ideal for SaaS)
2. Harmony: Complementary - blue primary + orange accent for CTAs
3. 60-30-10: 60% light gray background, 30% blue navigation/headers, 10% orange buttons/alerts
4. Validate: Check 4.5:1 contrast on text, test color-blind safe, plan dark mode variant

### Example 2: "Are these colors accessible?"
1. Check WCAG contrast ratio for each text/background pair (minimum 4.5:1 for AA)
2. Verify color is not the only indicator (error states have icons + text, not just red)
3. Simulate deuteranopia/protanopia to check red-green differentiation
4. Suggest fixes for any failures (adjust lightness, add non-color indicators)

### Example 3: "Set up color tokens for our design system"
1. Define primitives: `blue-50` through `blue-950`, same for gray, red, green, etc.
2. Create semantic layer: `color-primary`, `color-error`, `color-bg-surface`, etc.
3. Map light theme: `color-bg-surface: {white}`, `color-text-primary: {gray-900}`
4. Map dark theme: `color-bg-surface: {gray-900}`, `color-text-primary: {gray-50}`
5. Apply 60-30-10 to validate distribution
