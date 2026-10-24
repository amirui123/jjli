# Site Motion Rollout Playbook

Use this to turn the Site Motion Excellence System into shipped work across FrankX, Arcanea, and Starlight sites.

## Pass 0: Motion Audit

For each site, collect:

- route list
- current animation libraries
- first viewport screenshot
- mobile screenshot
- reduced-motion behavior
- existing media/video assets
- Vercel project/deployment status
- top three business/product goals

Score each route with `rubrics/site-motion-excellence-gate.md`.

## Pass 1: Choose Signature Moments

Do not animate everything.

Pick:

- one hero/first-viewport motion moment
- one product proof/workflow motion moment
- one interaction pattern used across components
- one media/social export opportunity

## Pass 2: Write Specs

For every selected moment, create `SITE_MOTION_SPEC.md` in the relevant repo or issue.

Required decisions:

- what stays still
- what moves first
- what the motion proves
- runtime choice
- reduced-motion route
- proof artifact

## Pass 3: Implement By Brand

### FrankX

Recommended first motions:

- before/after site transformation reveal
- proof stack entrance with real screenshots or metrics
- creator product workflow trace
- fast social cutdown from a real page/demo

Runtime default:

- Motion for React for UI choreography
- Playwright capture plus Remotion for social/proof media

Avoid:

- abstract AI glow
- overly cinematic delays
- mythic Arcanea language on direct business pages

### Arcanea

Recommended first motions:

- world/realm reveal that resolves into usable product UI
- creator studio ritual sequence
- character or symbolic asset emergence
- scroll narrative for Genesis/Forge-style concepts

Runtime default:

- GSAP for authored scroll/scene choreography
- Rive for interactive symbolic/vector components
- generated media as source frames, finished in Remotion

Avoid:

- unreadable lore walls
- decorative portals that hide navigation
- motion that overwhelms actual creator workflows

### Starlight

Recommended first motions:

- command center reveal
- agent handoff/state trace
- evidence/provenance stack
- confidence settle or evaluation delta

Runtime default:

- Motion for React for dashboards and state
- GSAP only for signature enterprise landing moments
- Playwright for product proof

Avoid:

- hype sci-fi
- radiant particle overgrowth
- moving dashboards while the user is trying to read

## Pass 4: Verify

Minimum proof:

- desktop screenshot
- mobile screenshot
- reduced-motion screenshot
- short motion capture or frame sequence
- build/type/lint output
- Vercel preview URL when connected

For generated media:

- source prompt
- source image
- video/GIF output
- poster frame
- compression check
- provenance note

## Pass 5: Promote To Pattern

When a motion passes the excellence gate:

- add it to the brand motion library
- extract timing/easing tokens
- create a reusable component or recipe
- document reduced-motion behavior
- capture before/after proof

## First Execution Recommendation

Start with Starlight first, because the motion language has the clearest business/product purpose: make intelligence legible.

Order:

1. Starlight command center reveal.
2. FrankX before/after proof reveal.
3. Arcanea world-to-product transition.

This sequence builds a reusable motion foundation: operational precision, commercial proof, then expressive world motion.
