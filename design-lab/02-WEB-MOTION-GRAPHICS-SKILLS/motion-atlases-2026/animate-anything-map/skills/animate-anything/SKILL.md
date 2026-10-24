---
name: animate-anything
description: Turn any concept into a 3Blue1Brown-style animated explainer — a real ManimCommunity scene, authored in Grant Sanderson's reverse-engineered style, style-gated, and rendered to MP4 locally. Use when the user wants to "animate/explain <concept>", "make a 3blue1brown / manim video", "visualize this math", or "turn this idea into an animation". Triggers on 'animate', '3blue1brown', 'manim', 'explainer video', 'visualize <concept>'. NOT for a generative/photoreal video (use a video model) or a UI micro-interaction (use CSS/Motion — see the animate-anything registry).
---

# /animate-anything — a concept → a 3Blue1Brown-style explainer

Point it at an idea; get back a **real Manim scene** authored in Grant Sanderson's style, checked
against a reverse-engineered **style contract**, and rendered to an MP4 — all locally, no cloud
video API. This is the *tooling* fold of the [animate-anything](../../README.md) registry made
executable.

## The principle: emit the composition, render locally

Like the rest of the anyagent ecosystem — **emit the composition, not the render.** The tool
authors a self-contained ManimCommunity scene (Python) + a style verdict; rendering to MP4 is a
local step (`manim -qh scene.py Name`) — deterministic, free, no paid video model, no async job.
Target is **ManimCommunity** (`pip install manim`, `from manim import *`), *not* Grant's ManimGL
(`from manimlib import *`): Community is pip-installable under the plain name, fully documented at
docs.manim.community, and reliably LLM-authorable. Study `github.com/3b1b/videos` as a **style corpus
only** — it's not a dependency.

## The loop (scaffold → author → lint → render)

```bash
# 0) once: the render toolchain (checked, never bundled)
pip install manim          # + ffmpeg (encode) ; + a LaTeX distro ONLY for MathTex (Text needs none)

# 1) SCAFFOLD — concept → a 3b1b-style skeleton with the 5-beat arc
python3 scripts/animate.py scaffold "eigenvectors" --out scene.py

# 2) AUTHOR — fill the beats, obeying the style contract below (this is where you, the agent, work)

# 3) LINT — a computed 0–100 style score; gate it in CI
python3 scripts/animate.py lint scene.py --gate 80

# 4) RENDER — locally
manim -pql scene.py EigenvectorsScene       # draft (854×480, fast)
manim -qh  scene.py EigenvectorsScene       # final (1080p60)
```

`animate.py contract` prints the full contract; the golden reference is
[`examples/odd_squares.py`](../../examples/odd_squares.py) (scores 100/100, renders without LaTeX).

## The 3Blue1Brown style contract (reverse-engineered, lint-checked)

Grounded in Grant's `manimlib/default_config.yml` (colors), `constants.py` (`COLORMAP_3B1B`), and real
scene code in `3b1b/videos` (e.g. `_2024/transformers/attention.py`). The linter checks each item.

- **Warm-grey canvas — the #1 tell.** `config.background_color = "#333333"`. **Never pure black** (reads
  as "not 3b1b") or white.
- **Palette by role, not garnish.** Colors from the 3b1b constants — the blues `BLUE_A #C7E9F1 · BLUE_B
  #9CDCEB · BLUE_C/BLUE #58C4DD · BLUE_D #29ABCA · BLUE_E #1C758A`, plus `YELLOW GOLD GREEN RED MAROON
  TEAL GREY_BROWN`. Role convention (`COLORMAP_3B1B = [BLUE_E, GREEN, YELLOW, RED]`): **blue/grey =
  given · YELLOW = focus · RED = tension · GREEN/GOLD = resolved.** Highlights are a thin stroke (2–3) +
  faint fill (opacity ≤ 0.25), never opaque.
- **Introduce gently.** `Write` (text), `Create` (shapes/graphs), `FadeIn(shift=…)` (groups); many items
  via `LaggedStart(..., lag_ratio≈0.25)` — a rippling cascade, never a mass appearance.
- **Morph to show equivalence — the load-bearing move.** When two forms are mathematically the same,
  `Transform` / `ReplacementTransform` / `TransformMatchingTex` **one into the other** — so the eye
  tracks which piece became which. **Never `FadeOut(a)` then `FadeIn(b)`** for equivalent things (that's
  the tell-tale AI-slop miss the linter flags). Give the key morph `run_time ≥ 1.5`.
- **Pacing: play → wait → play → wait.** A `self.wait()` after every meaningful change; a longer
  `self.wait(2)` after the reveal. Unhurried because *nothing new appears during a wait* and *only one
  thing moves per play*.
- **One idea per beat; generous negative space.** The frame is mostly empty. No decorative
  spins/bounces/pulses — every motion relates two things.
- **Narrative arc.** Open on a **concrete instance** (a specific number/word/shape — never "let X be…"),
  build visual intuition, **morph** the picture into the formal symbols, end on the "aha" collapse.

## Honest edges

- **MathTex needs LaTeX.** `Text(...)` (Pango) renders without it; swap `MathTex(...)` → `Text(...)` if a
  LaTeX distro isn't installed, or install one for real equations.
- **Community ≠ Grant's exact renders.** The Community API faithfully reproduces his *style* (palette,
  pacing, vocabulary); for bit-identical output you'd need ManimGL. For an agent, Community wins.
- **The linter is a heuristic gate**, not a taste oracle — it catches the encodable tells (canvas, morph,
  pacing, palette, arc). The judgment of *what to animate* is still yours.
- **It's not a video model.** This produces a hand-crafted vector explainer, not generative/photoreal
  footage. For that, see the commercial row of the registry.
