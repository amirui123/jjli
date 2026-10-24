# After Effects Motion DNA (`after-effects-motion-dna`)

A cross-platform (**Windows and macOS**) AI Agent Skill & Zero-Dependency MCP Server for **Adobe After Effects** that:
1. **Extracts your Motion DNA** from previous approved After Effects projects (`.aep` files, active compositions, or `.mp4`/`.mov` motion renders) — capturing exact PostScript fonts, hex color systems, layer hierarchies, **Bezier keyframe easing curves (`inInfluencePct` / `outInfluencePct`)**, stagger timing, expressions (`wiggle`, overshoot), and effect stacks.
2. **Turns any plain-text motion brief into a 100% editable, fully keyframed After Effects composition built LIVE on screen in front of the user** — complete with parametric vector shape cards, centered kinetic typography, custom cubic-bezier easing, expressions, timeline markers, exported preview frames, and a saved `.aep` project.

Built with **zero manual preference clicking** (`setup_after_effects_mcp.py` automatically enables After Effects' script file/network permission on both Windows and macOS).

---

## ✨ Key Capabilities

1. **Live Foreground Step-by-Step Execution (`scripts/after_effects_cli.py` + `assets/ae_comp_builder.jsx`)**:
   - Brings Adobe After Effects to the front on both **macOS** (`osascript` `DoScriptFile`) and **Windows** (`WScript.Shell.AppActivate` + `AfterFX.exe -r`).
   - Opens the Composition in the Viewer (`comp.openInViewer()`) immediately and builds the scene **stage-by-stage** (Background & Gradient $\rightarrow$ Ambient Glow Orbs $\rightarrow$ Vector Cards $\rightarrow$ Staggered Kinetic Typography $\rightarrow$ Markers), scrubbing the playhead (`comp.time`) so the user watches every layer and animation appear live.

2. **Motion DNA Extractor (`scripts/extract_motion_dna.py` + `assets/inspect_aep_dna.jsx`)**:
   - Inspects `.aep` compositions directly inside After Effects to extract ground-truth fonts, colors, `KeyframeEase` influence percentages, and expressions.
   - Caches the synthesized brand motion system in `.motion-dna/motion_dna.json` via SHA-256 hashing so future motion briefs build immediately.

3. **Multimodal Frame Verification (`saveFrameToPng`)**:
   - Automatically exports PNG stills at key animation beats (e.g., `0.45s` mid-entrance and `1.50s` hero hold) so the AI agent visually inspects alignment, contrast, and spacing via `view_file` and self-corrects.

---

## 📂 Repository Structure

```text
after-effects-motion-dna/
├── SKILL.md                            # Complete 5-Stage Agent Skill workflow
├── README.md                           # Quickstart & documentation
├── LICENSE                             # MIT License
├── assets/
│   ├── inspect_aep_dna.jsx             # ExtendScript Motion DNA inspector for .aep files & active comps
│   └── ae_comp_builder.jsx             # Live Foreground Comp, Vector Shape, Kinetic Type & Bezier Ease builder
└── scripts/
    ├── setup_after_effects_mcp.py      # Zero-touch installer (auto-enables AE script prefs + registers MCP)
    ├── after_effects_mcp_server.py     # Zero-dependency Stdio MCP server
    ├── after_effects_cli.py            # Cross-platform Live Foreground CLI bridge (macOS & Windows)
    └── extract_motion_dna.py           # Reference .aep and motion video scanner & SHA-256 cache manager
```

---

## 🚀 Installation (Windows & macOS)

> **Prerequisite:** Adobe After Effects installed on the laptop.

### Option 1: Zero-Touch via Antigravity Chat (Recommended)
Paste this single prompt into Antigravity:
> **"Install the skill from https://github.com/vamshicreates/after-effects-motion-dna into `.agents/skills/after-effects-motion-dna` and run its setup script."**

### Option 2: 1-Line Terminal Install
```bash
git clone https://github.com/vamshicreates/after-effects-motion-dna.git .agents/skills/after-effects-motion-dna && python3 .agents/skills/after-effects-motion-dna/scripts/setup_after_effects_mcp.py --ping
```
*(On Windows PowerShell, replace `python3` with `python`).*

---

## ⚡ How to Use

1. **Extract Your Motion DNA (One-Time)**:
   Point Antigravity to a folder of your previous approved `.aep` files or `.mp4`/`.mov` motion renders:
   > **"Extract our Motion DNA from `./approved-motion` and animate this new composition live in After Effects: [your motion brief]."**
2. **Generate Any Future Motion Graphic from a Text Brief Alone**:
   Once `.motion-dna/motion_dna.json` is cached:
   > **"Using our Motion DNA, build a 60fps kinetic typography and UI card reveal live in After Effects for: [your text brief]."**

---

## What's New in v1.1.0 — Embedded Laya Decision Gate (`NandhaKishorM/laya`)

This skill now embeds **[Laya (`https://github.com/NandhaKishorM/laya`)](https://github.com/NandhaKishorM/laya)** via `scripts/laya_decision_gate.py` with a **Strict Complexity Gate**:

- **Basic Tasks → Direct Manual Execution (Laya Bypassed)**: Simple, explicit commands (*"change comp duration to 10 seconds"*, *"set text layer opacity from 0 to 100"*, *"add Gaussian Blur of 40px"*, *"export frame at 2.5s to PNG"*) bypass Laya completely (`laya_called: false`) and run directly in Adobe After Effects with zero model overhead.
- **Complex / Ambiguous Creative Briefs → Laya System-1 Router (`from laya import Router`)**: Only when a task requires multi-branch creative routing (`choice`, `score`, `noul`), `scripts/laya_decision_gate.py` invokes Laya's non-autoregressive `Router` in a single forward pass.
