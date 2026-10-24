# Site Motion Excellence System

Date: 2026-06-22

## Thesis

The previous Grok-generated clip proved the transport layer, not the design layer. It was useful as an integration test, but it was not yet excellent motion design.

Excellent site motion starts with product truth, hierarchy, and choreography. Generation is only one source of pixels. The standard for FrankX, Arcanea, and Starlight should be: every motion moment has a reason, a subject, a timing model, a reduced-motion equivalent, and browser evidence.

## What Great Motion Designers Do First

They do not start with "make it move."

They define:

1. The still frame.
2. The user or viewer's first read.
3. The one object that deserves motion.
4. The cause of the motion.
5. The sequence of attention.
6. The final resting state.
7. The reduced-motion version.
8. The proof artifact.

If those are unclear, generation and animation tools will create expensive noise.

## House Principles

- Motion is hierarchy over time.
- Stillness is a design material.
- Product evidence beats abstract atmosphere.
- One signature behavior is worth more than ten fade-ups.
- Repeated task motion should be fast and quiet.
- Brand motion should be recognizable without a logo.
- Generated media must be judged inside the page, not in isolation.
- Accessibility is part of the concept, not a late fix.

## Site Motion Levels

### Level 0: Static Excellence

Use when the page lacks hierarchy, product specificity, or visual assets.

Deliverables:

- better layout
- better first viewport
- stronger visual asset
- no animation yet

Gate: the still frame must pass before motion is added.

### Level 1: Functional Motion

Use for common UI state:

- hover/focus/tap
- menus
- modals
- forms
- loading
- success/error
- route changes

Runtime:

- CSS first
- Motion for React when component state or layout transitions matter

Target:

- 80-240ms
- transform/opacity
- no layout shift

### Level 2: Product Story Motion

Use for homepage/product sections that explain a workflow, agent system, transformation, or proof moment.

Runtime:

- Motion for React for React component choreography
- GSAP ScrollTrigger for pinned, scrubbed, or complex authored timelines
- Playwright for capture and QA

Target:

- clear beats
- stable reading
- mobile-specific choreography
- reduced-motion static keyframes

### Level 3: Signature Brand Motion

Use sparingly for first viewport hero, launch moment, product reveal, world reveal, or campaign loop.

Runtime:

- GSAP, Three.js, Rive, Lottie, generated media, or Remotion depending on need
- Remotion/ffmpeg for video variants

Target:

- memorable behavior
- strong first frame
- clean final hold
- poster/static fallback
- no generic abstract motion

### Level 4: Media System

Use for social, launch trailers, explainers, GIFs, product demos, and reusable campaign variants.

Runtime:

- imagegen/Grok/Veo/Sora/Luma/Runway/Higgsfield for generated source material
- Remotion for exact typography, captions, cards, layout, and variants
- ffmpeg for packaging

Target:

- prompt and provenance saved
- source image plus motion output
- export variants
- taste critique before publishing

## Brand Motion Lanes

### Starlight

Job: make intelligence legible.

Motion behaviors:

- signal sweep
- trace reveal
- confidence settle
- constellation assembly
- evidence stack
- queue handoff

Rules:

- Calm and operational.
- Animate status, provenance, confidence, and causality.
- Avoid hype sci-fi, radiant overgrowth, endless particles, and unreadable dashboards.

### Arcanea

Job: make creative worlds feel alive and navigable.

Motion behaviors:

- portal reveal
- ritual sequence
- character/world emergence
- symbolic transformation
- cinematic scene-to-interface transition

Rules:

- More expressive than Starlight.
- Preserve readability and product control.
- Use generated media for world assets, but interface motion must remain usable.

### FrankX

Job: make the offer feel sharp, credible, and commercially useful.

Motion behaviors:

- before/after reveal
- proof stack
- creator workflow trace
- fast social hook
- founder command reveal

Rules:

- Direct, crisp, concrete.
- Show sites, assets, dashboards, products, revenue flows, and outcomes.
- Avoid mythic abstraction unless the page is explicitly personal/visionary.

## Runtime Decision Matrix

| Need | Default | Upgrade When |
| --- | --- | --- |
| Hover/focus/tap | CSS | Motion if state spans components |
| Component enter/exit | Motion for React | GSAP if timeline is authored across many elements |
| Route/page transition | Motion for React | CSS if trivial |
| Scroll reveal | Motion for React or CSS | GSAP ScrollTrigger for pin/scrub/snap |
| Scrollytelling | GSAP ScrollTrigger | Remotion if it becomes video |
| Interactive vector | Rive | Lottie if non-interactive loop |
| Portable icon/loop | Lottie/dotLottie | Rive if stateful |
| 3D scene | Three.js | Avoid unless 3D is central |
| Product demo video | Playwright + Remotion | Generated video only for non-exact scenes |
| Social/launch media | Remotion + ffmpeg | Grok/Veo/Sora/Luma/Runway as source generation |

## Agentic Workflow

### 1. Motion Director

Creates motion thesis, surface, audience, motion job, personality, and runtime direction.

### 2. Still Frame Critic

Scores the static first frame before any animation work begins.

Fail if:

- unclear subject
- generic AI atmosphere
- weak hierarchy
- unreadable text
- no product proof

### 3. Choreographer

Writes beat sequence:

- setup
- trigger
- primary motion
- secondary support
- pause/hold
- final state
- reduced-motion version

### 4. Implementer

Builds the lightest runtime that preserves the intent.

### 5. Media Producer

Creates or captures assets only after the choreography is approved.

### 6. Taste Critic

Scores the result against the excellence gate.

### 7. QA/Publisher

Runs browser/mobile/reduced-motion/build checks, then verifies Vercel preview when connected.

## Spec Required Before Build

Every meaningful site motion change needs:

- motion name
- surface and audience
- motion job
- still frame description or screenshot
- affected elements
- trigger
- beat sequence
- timing/easing
- runtime choice
- asset needs
- reduced-motion route
- acceptance checks
- proof required

Use `templates/site-motion/SITE_MOTION_SPEC.md`.

## Acceptance Bar

Do not ship if:

- the still frame is weak
- the page depends on motion to explain essential information
- every section uses the same reveal
- text becomes hard to read
- scroll motion traps reading
- generated media feels disconnected from the actual product
- there is no reduced-motion path
- there is no screenshot/video proof

Ship when:

- the motion has a clear job
- the eye lands where intended
- the product/brand feels more specific
- repeated interactions remain fast
- mobile is intentionally composed
- final media survives compression
- QA artifacts exist

## Source Anchors

- Motion accessibility: https://motion.dev/docs/react-accessibility
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Rive web runtime: https://github.com/rive-app/rive-wasm
- Remotion: https://www.remotion.dev/
- Remotion parameterized rendering: https://www.remotion.dev/docs/parameterized-rendering
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
