---
name: perfect-design
description: Comprehensive design engineering standard for crafting world-class, human-grade digital interfaces. Enforces Swiss typographic rigor, calibrated chromatic systems, physical spring motion, spatial hierarchy, and anti-slop rules.
---

# Perfect Design Engineering Standard

An authoritative design engineering framework for building software that feels alive, intentional, and unmistakably crafted by human hands.

## 1. Visual Hierarchy and Spatial Architecture

### 1.1 The Baseline Grid
All layout dimensions, paddings, gaps, and component heights adhere strictly to an 8px spatial grid with a 4px sub-grid for micro-elements:
- Micro spacing: 2px, 4px, 8px (icon margins, badge padding, button gaps).
- Structural spacing: 12px, 16px, 24px, 32px (card padding, section offsets).
- Macro spacing: 48px, 64px, 96px (viewport gutters, hero breaks).
Arbitrary pixel values outside this progression are prohibited.

### 1.2 Optical Alignment vs Geometric Alignment
Geometric center is rarely optical center:
- Play icons, arrows, and irregular glyphs require optical X/Y offset compensation (+1px to +2px toward visual weight).
- Text paired with icons must align to the font cap-height, not the bounding box.
- Borders eat into content boxes unless set to inset or border-box; compensate paddings so interior visual space remains consistent.

### 1.3 Surface Elevation Architecture
Depth is established through calibrated luminosity rather than heavy black drop shadows:
- Layer 0 (Canvas Void): #000000 or deep obsidian #050608.
- Layer 1 (Navigation & Bars): #08090C with 1px border #1A1C23.
- Layer 2 (Workspaces & Panels): #0D0E14 with 1px border #22252F.
- Layer 3 (Cards & Raised Modules): #14161F with 1px border #2A2E3B.
- Layer 4 (Popovers & Floating Menus): #1B1E2B with 1px outer stroke #383D4F and subtle 16px ambient blur.

## 2. Typographic Rigor

### 2.1 Optical Sizing and Tracking Scale
Letter spacing (tracking) must inversely correlate with font size:
- Display headlines (32px - 64px): tight tracking (-0.03em to -0.04em), line-height 1.05 to 1.15.
- Section titles (20px - 28px): tight tracking (-0.02em to -0.025em), line-height 1.2 to 1.25.
- UI labels and buttons (13px - 15px): neutral tracking (-0.005em to 0.0em), line-height 1.35.
- Micro telemetry and small caps (10px - 12px): wide tracking (+0.04em to +0.08em), uppercase, line-height 1.4.

### 2.2 Font Pairing Discipline
Restrict the typography system to two complementary typefaces:
- Primary Sans: SF Pro Display, Geist, Helvetica Neue, or Segoe UI for functional clarity.
- Monospace Accent: SF Mono, JetBrains Mono, or Cascadia Code for technical telemetry, numbers, coordinates, and shortcuts.
Mixing decorative serifs with modern sans-serif interfaces is strictly prohibited unless the domain is classical literature or archival journalism.

### 2.3 Numbers and Tabular Figures
Any UI displaying metrics, coordinates, timers, or currency must enable tabular figures (font-variant-numeric: tabular-nums) to prevent horizontal jitter during real-time value updates.

## 3. Chromatic Calibration

### 3.1 The 90-8-2 Palette Rule
World-class interfaces enforce strict chromatic hierarchy:
- 90% Neutral Dominance: deep obsidian, charcoal, and warm titanium grays.
- 8% Structural Support: crisp hairline borders, surface cards, and muted divider lines.
- 2% Singular Accent: one high-intent functional color (electric cyan #00F0FF, signal emerald #10B981, or pure titanium white #FFFFFF).
Rainbow UI and arbitrary color shifts between panels destroy brand authority.

### 3.2 Contrast Thresholds (WCAG AAA)
- Primary text against surface: contrast ratio >= 7:1.
- Secondary labels against surface: contrast ratio >= 4.5:1.
- Interactive borders and focus rings: contrast ratio >= 3:1 against surrounding background.
- Disabled states must remain legible (minimum 2.5:1), never disappearing into background darkness.

## 4. Physical Motion and Spring Dynamics

### 4.1 The First Law of UI Motion
Never animate high-frequency interactions. Keyboard shortcuts, command palettes, and rapid tool switching must be instantaneous (0ms latency). Animation is reserved for spatial orientation, state confirmation, and physical drag gestures.

### 4.2 Critically Damped Springs
Replace fixed-duration cubic-bezier curves with physical springs for interactive components:
- Standard UI Settle: Damping ratio 1.0 (critically damped, zero oscillation, smooth deceleration).
- Physical Flick / Momentum: Damping ratio 0.82 to 0.88 (single subtle settle wave).
- Duration ceiling: UI micro-interactions must resolve within 140ms to 220ms. Anything exceeding 300ms feels sluggish.

### 4.3 Zero-Scale Ban
Elements must never scale from 0.0. In physical reality, matter does not emerge from a mathematical singularity. Entrance transitions must start from scale 0.95 with simultaneous opacity fade from 0.0 to 1.0.

### 4.4 Origin-Aware Anchoring
Modals and dialogs enter centered. Popovers, context menus, and tooltips must originate (transform-origin) from their exact triggering button coordinate.

### 4.5 Tactile Feedback on Press
Every clickable and tappable element must provide immediate tactile feedback on pointer-down:
- Buttons: scale 0.97 to 0.98 on :active with 100ms ease-out.
- Sliders and drag handles: visual highlight on grab with active cursor lock.

## 5. Direct Manipulation and Viewport Physics

### 5.1 1:1 Tracking Fidelity
During dragging, panning, or slicing, content coordinates must remain locked 1:1 to pointer coordinates. Snapping an object's center to the cursor upon click destroys direct manipulation immersion.

### 5.2 Momentum and Velocity Handoff
When a swipe or drag gesture ends, the release velocity must be handed off directly to the deceleration curve:
Projected resting point = currentPosition + (velocity / (1 - decelerationRate)).
The animation glides toward the projected rest point rather than snapping abruptly at the release coordinate.

### 5.3 Soft Boundary Resistance (Rubber-Banding)
When panning or dragging beyond defined canvas bounds, movement must attenuate progressively using exponential decay:
offset = maxOffset * (1.0 - exp(-rawDrag / maxOffset))
Hard stops feel like system crashes; elastic resistance communicates structural boundaries with elegance.

## 6. Layout Architecture and Density

### 6.1 Viewport Stability
- Full-height heroes and canvas frames must rely on dynamic viewport height units (100dvh) rather than static 100vh to eliminate mobile URL-bar jump.
- Main application navigation bars must fit entirely on a single horizontal row on desktop screens. Multi-line navigation wrapping is considered a structural failure.

### 6.2 Bento Grid Composition
Bento cards must provide distinct rhythmic utility:
- Never stack identical card shapes across consecutive sections.
- Vary tile proportions (e.g., 2:1 hero cell paired with dual 1:1 satellite cells).
- Ensure high-density data cells breathe with structured typography rather than decorative borders.

## 7. Anti-Slop Discipline

### 7.1 Banned Generic Patterns
- No AI purple/violet glowing button gradients.
- No dark mesh gradient blobs serving as lazy background decoration.
- No three equal feature cards with generic stock icons.
- No fake screenshots fabricated from empty divs and gray lines.
- No placeholder names (Jane Doe, Acme Corp, John Smith).
- No em-dash typographic flourishes in headlines or quotes.

### 7.2 Human Craft Signature
- Crisp 1px hairline borders with RGBA alpha transparency matching background luminosity.
- Authentic micro-copy that speaks directly, technically, and concisely.
- Intentional empty states that instruct the operator on exact next steps.
- Predictable keyboard navigability across every single interactive node.

## 8. Pre-Flight Verification Ledger

Before committing any interface component or view, verify against this checklist:
- [ ] 8px/4px spatial alignment verified on all paddings and margins.
- [ ] Tabular numerals applied to all coordinates, meters, and numerical values.
- [ ] Text contrast exceeds WCAG AAA (7:1 for primary, 4.5:1 for secondary).
- [ ] No button scales from 0.0 or exceeds 250ms transition duration.
- [ ] Click feedback (:active state scale 0.97) verified on all buttons.
- [ ] No multi-line navigation wrapping on desktop viewports.
- [ ] Single accent color disciplined across the entire view.
- [ ] Popovers anchored to trigger coordinate rather than screen center.
- [ ] Full keyboard focusability and ESC dismissal on all modals.
