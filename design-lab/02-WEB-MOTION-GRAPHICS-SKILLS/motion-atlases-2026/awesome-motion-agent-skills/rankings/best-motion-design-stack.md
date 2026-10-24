# Best Motion Design Stack

Research snapshot: 2026-08-03.

## Tier 1: Install First

| Tool | Use It For | Agent Fit | Notes |
| --- | --- | --- | --- |
| [Motion](https://motion.dev/docs) | React/JS/Vue product UI transitions, gestures, layout animation, microinteractions | Excellent | Default for app UI and Next.js product surfaces. Best first choice when motion follows component state. |
| [GSAP](https://gsap.com/docs/v3/) + [GSAP skills](https://github.com/greensock/gsap-skills) | Complex timelines, SVG, scroll, SplitText, MorphSVG, motion paths, landing page choreography | Excellent | Best high-control animation engine. Official AI skills now give agents safer implementation patterns. Review license terms for builder/platform products. |
| [Remotion](https://www.remotion.dev/) + [AI docs](https://www.remotion.dev/docs/ai/) | React-authored MP4/GIF/social video, explainers, programmatic content | Excellent | The strongest bridge between frontend code and generated video. Has official AI docs, skills, and MCP. |
| [OrkasVideoStudio](https://github.com/Orkas-AI/Orkas-VideoStudio) | End-to-end agent-driven video composition, editing, generation, transcription, and plan-based assembly | Excellent | Use when a coding agent should own the workflow through native skills, CLI, or MCP while preserving an editable `plan.json` timeline. MIT and local-first; the core compose/edit/transcribe path is zero-key, provider generation is BYO-key, npm publishing is pending, and file-changing commands warrant review. |
| [Playwright](https://playwright.dev/docs/videos) | Capturing real browser motion as screenshots/video for QA and demos | Excellent | Use for regression checks and recording app states before final render/export. |
| [ffmpeg](https://ffmpeg.org/) | MP4, WebM, GIF conversion, palette optimization, resizing, compression | Excellent | The practical export layer. Already available locally on this machine. |

## Tier 2: Add For Richer Motion Systems

| Tool | Use It For | Agent Fit | Notes |
| --- | --- | --- | --- |
| [Rive](https://rive.app/) | Interactive vector animation with state machines | Strong | Best when animation needs runtime state, not only playback. Ideal for product mascots, brand controls, game-like UI, and onboarding. |
| [Lottie](https://lottiefiles.github.io/lottie-docs/) / [dotLottie](https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/) | Portable vector loops, compressed animation bundles, loaders, icons, and reusable brand accents | Strong | Use for playback assets and brand loops. Study the [LottieFiles motion-design skill](https://github.com/LottieFiles/motion-design-skill) and [dotLottie web skill](https://github.com/LottieFiles/dotlottie-web/blob/main/SKILL.md). |
| [Anime.js](https://animejs.com/documentation/) | Lightweight DOM/SVG/object animation | Good | Nice for smaller sites and examples. Less of a default than Motion/GSAP. |
| [Theatre.js](https://www.theatrejs.com/) | Timeline editing for web/Three.js scenes | Good | Use when visual keyframing matters. Watch project maturity before making it core infrastructure. |
| [Three.js](https://threejs.org/) / React Three Fiber | 3D motion scenes and interactive spatial experiences | Strong | Use when 3D is central to the concept. Keep it performance-budgeted. |

## Tier 3: Specialist Additions

| Tool | Use It For | Notes |
| --- | --- | --- |
| React Spring | Physics-driven transitions, especially cross-platform React work | Useful, but Motion covers most web app cases. |
| Tailwind CSS Motion / CSS keyframes | Lightweight affordances | Use for simple hover, reveal, and utility-level transitions. |
| Canvas/WebGL shader tools | Generative motion, particles, fluid visuals | Good for Arcanea premium surfaces; easy to overdo. |

## Decision Rules

Use **Motion** when the animation is tied to React component state.

Use **GSAP** when the animation needs an explicit timeline, scroll choreography, SVG transforms, text effects, or high craft.

Use **Rive** when designers should own a state machine that developers can wire to app state.

Use **Lottie** when the asset is a portable loop and interactivity is minimal.

Use **Remotion** when the output must become MP4/GIF/social media, or when the animation should be rendered deterministically.

Use **Playwright + ffmpeg** when the source is a live webpage and the output is a recorded demo or GIF.

Use **Figma MCP** when the agent needs design-file structure, variables, component context, or write-back. Use **Canva MCP** when the output is collateral, presentation, social, or brand-kit adjacent.
