---
name: after-effects-motion-dna
description: >-
  Cross-platform (Windows & macOS) AI Agent Skill & MCP Server for Adobe After
  Effects that extracts a motion designer's or brand's Motion DNA from previous
  approved projects (.aep files or .mp4/.mov renders) and builds complete,
  fully keyframed, editable After Effects compositions LIVE on screen in the
  foreground from a plain-text brief (kinetic typography, vector UI cards,
  ambient glow orbs, custom Bezier easing curves, expressions, markers, and
  preview frame renders). Zero manual setup required.
---

# After Effects Motion DNA (`after-effects-motion-dna`)

A cross-platform (**Windows and macOS**) AI Agent Skill & Zero-Dependency MCP Server for **Adobe After Effects** that learns a motion designer's or brand's **Motion DNA** from their previous approved `.aep` projects or exported videos, and turns any plain-text motion brief into a **100% editable, fully keyframed After Effects composition built LIVE on screen in front of the user**.

---

## Cross-Platform Execution Notes (Windows & macOS)

- **Python Command:**
  - **Windows (PowerShell / CMD):** Use `python` (or `py -3`).
  - **macOS:** Use `python3`.
- **Skill Directory Resolution:**
  - Determine `<SKILL_DIR>` as `.agents/skills/after-effects-motion-dna` (workspace) or `~/.gemini/config/skills/after-effects-motion-dna` (global).
- **Zero-Plugin Live Foreground Bridge (`scripts/after_effects_cli.py` & `scripts/after_effects_mcp_server.py`):**
  - Automatically enables After Effects' `"Allow Scripts to Write Files and Access Network"` preference (`Pref_SCRIPTING_FILE_NETWORK_SECURITY = "1"`) on disk so the user never has to open Preferences.
  - **macOS:** Brings After Effects to the foreground and drives it live via native AppleEvents (`tell application id "com.adobe.AfterEffects" to DoScriptFile ...`).
  - **Windows:** Brings After Effects to the foreground (`WScript.Shell.AppActivate('Adobe After Effects')`) and drives it live via `AfterFX.exe -r <script.jsx>`.

---

## Stage 0: Zero-Touch Setup & Connection Check

On first run (or if `after_effects_*` MCP tools are not yet loaded in the session), run:

```bash
python3 <SKILL_DIR>/scripts/setup_after_effects_mcp.py --ping
```

- Automatically locates Adobe After Effects on Windows or macOS, enables script file/network write permissions in After Effects' preferences, and registers `"after-effects"` in `~/.gemini/config/mcp_config.json`.

---

## The 5-Stage Motion DNA $\rightarrow$ Brief $\rightarrow$ Live After Effects Composition Pipeline

### Stage 1: Motion DNA Extraction & Caching (`.motion-dna/motion_dna.json`)

Whenever the user provides previous approved motion designs (`.aep` files, an active After Effects composition, or `.mp4`/`.mov` motion renders):

1. **Run the Automated Motion DNA Scanner**:
   ```bash
   python3 <SKILL_DIR>/scripts/extract_motion_dna.py <PATH_TO_PREVIOUS_MOTION_DESIGNS> --state-dir .motion-dna
   ```
   - **If `status == "CACHE_HIT"`**: Read `.motion-dna/motion_dna.json` directly and proceed to Stage 2.
   - **If `status == "SCAN_COMPLETED"`**:
     - For `.aep` files (or active compositions), `extract_motion_dna.py` runs [`assets/inspect_aep_dna.jsx`](assets/inspect_aep_dna.jsx) inside After Effects to extract **exact PostScript font names**, hex colors, layer structures, **Bezier keyframe easing influence percentages (`inInfluencePct` / `outInfluencePct`)**, expressions (`wiggle`, overshoot), and effect matchNames (`ADBE Drop Shadow`, `ADBE Ramp`, `ADBE Gaussian Blur 2`).
     - For `.mp4` / `.mov` files, extracts resolution, frame rate (`60fps` vs `30fps`), and duration.
2. **Synthesize & Save `.motion-dna/motion_dna.json`**:
   ```json
   {
     "brand_or_designer": "Company / Studio Name",
     "corpus_hash": "<from_raw_motion_scan>",
     "comp_defaults": {
       "width": 1080,
       "height": 1920,
       "fps": 60,
       "durationSec": 6.0,
       "bgColor": "#0B0F19",
       "motionBlur": true
     },
     "motion_physics_dna": {
       "entrance_duration_sec": 0.45,
       "stagger_delay_sec": 0.10,
       "bezier_influence_in_pct": 18,
       "bezier_influence_out_pct": 85,
       "ambient_pulse_expression": "wiggle(0.6, 12)"
     },
     "color_system": {
       "bg_top": "#0B0F19",
       "bg_bottom": "#111827",
       "card_fill": "#1E293B",
       "card_stroke": "#334155",
       "text_primary": "#F8FAFC",
       "text_secondary": "#94A3B8",
       "accent_primary": "#38BDF8",
       "accent_secondary": "#818CF8"
     },
     "typography_system": {
       "eyebrow": { "font": "Inter-Bold", "size": 26, "tracking": 120, "allCaps": true },
       "hero_title": { "font": "Inter-ExtraBold", "size": 84, "tracking": -20 },
       "subtitle": { "font": "Inter-Medium", "size": 36, "tracking": 0 },
       "cta_badge": { "font": "Inter-Bold", "size": 30, "tracking": 40 }
     }
   }
   ```

---

### Stage 2: Brief Deconstruction & Declarative `motion_spec.json`

When the user shares a **plain-text motion brief**:
1. Load `.motion-dna/motion_dna.json`.
2. Design a staggered, multi-layer choreography (`0.0s` Background & Ambient Glows $\rightarrow$ `0.15s` Eyebrow Badge $\rightarrow$ `0.25s` Hero Headline Line 1 $\rightarrow$ `0.35s` Hero Headline Accent Line $\rightarrow$ `0.50s` Feature UI Card $\rightarrow$ `0.65s` Subtitle & CTA) with custom Bezier easing (`influenceIn: 18, influenceOut: 85`) and centered layer anchor points.
3. Write `motion_spec.json`:

```json
{
  "composition": {
    "name": "Brand_Motion_Reveal_01",
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "durationSec": 6.0,
    "bgColor": "#0B0F19",
    "motionBlur": true,
    "heroPreviewTimeSec": 1.5
  },
  "outputAep": "./output/Brand_Motion_Reveal_01.aep",
  "background": {
    "name": "06_Background_Gradient",
    "color": "#0B0F19",
    "gradientTopColor": "#0B0F19",
    "gradientBottomColor": "#152238"
  },
  "glows": [
    { "name": "05_Top_Cyan_Glow", "x": 840, "y": 360, "radius": 340, "color": "#38BDF8", "opacity": 32, "blur": 190, "pulse": true },
    { "name": "05_Bottom_Indigo_Glow", "x": 240, "y": 1520, "radius": 320, "color": "#818CF8", "opacity": 28, "blur": 190, "pulse": true }
  ],
  "cards": [
    {
      "name": "04_Feature_Glass_Card",
      "x": 540,
      "y": 1140,
      "width": 900,
      "height": 420,
      "radius": 32,
      "fillColor": "#1E293B",
      "fillOpacity": 92,
      "strokeColor": "#38BDF8",
      "strokeWidth": 2,
      "inSec": 0.35,
      "outSec": 6.0,
      "influenceIn": 18,
      "influenceOut": 85,
      "animations": {
        "scale": {
          "keyframes": [
            { "timeSec": 0.35, "value": [82, 82] },
            { "timeSec": 0.85, "value": [100, 100] }
          ]
        },
        "opacity": {
          "keyframes": [
            { "timeSec": 0.35, "value": 0 },
            { "timeSec": 0.70, "value": 100 }
          ]
        }
      }
    }
  ],
  "texts": [
    {
      "name": "01_Eyebrow_Tag",
      "text": "INTRODUCING MOTION DNA",
      "font": "Inter-Bold",
      "size": 26,
      "color": "#38BDF8",
      "tracking": 120,
      "align": "center",
      "x": 540,
      "y": 420,
      "inSec": 0.10,
      "outSec": 6.0,
      "influenceIn": 18,
      "influenceOut": 85,
      "animations": {
        "position": {
          "keyframes": [
            { "timeSec": 0.10, "value": [540, 465] },
            { "timeSec": 0.55, "value": [540, 420] }
          ]
        },
        "opacity": {
          "keyframes": [
            { "timeSec": 0.10, "value": 0 },
            { "timeSec": 0.45, "value": 100 }
          ]
        }
      }
    },
    {
      "name": "02_Hero_Headline_Line1",
      "text": "ANIMATE AT THE",
      "font": "Inter-ExtraBold",
      "size": 82,
      "color": "#F8FAFC",
      "tracking": -20,
      "align": "center",
      "x": 540,
      "y": 540,
      "inSec": 0.20,
      "outSec": 6.0,
      "influenceIn": 18,
      "influenceOut": 85,
      "animations": {
        "position": {
          "keyframes": [
            { "timeSec": 0.20, "value": [540, 610] },
            { "timeSec": 0.70, "value": [540, 540] }
          ]
        },
        "opacity": {
          "keyframes": [
            { "timeSec": 0.20, "value": 0 },
            { "timeSec": 0.55, "value": 100 }
          ]
        }
      }
    },
    {
      "name": "03_Hero_Headline_Accent",
      "text": "SPEED OF SOUND.",
      "font": "Inter-ExtraBold",
      "size": 82,
      "color": "#38BDF8",
      "tracking": -20,
      "align": "center",
      "x": 540,
      "y": 640,
      "inSec": 0.30,
      "outSec": 6.0,
      "influenceIn": 18,
      "influenceOut": 85,
      "animations": {
        "position": {
          "keyframes": [
            { "timeSec": 0.30, "value": [540, 710] },
            { "timeSec": 0.80, "value": [540, 640] }
          ]
        },
        "opacity": {
          "keyframes": [
            { "timeSec": 0.30, "value": 0 },
            { "timeSec": 0.65, "value": 100 }
          ]
        }
      }
    }
  ],
  "markers": [
    { "name": "INTRO REVEAL", "timeSec": 0.10, "comment": "Staggered kinetic type entrance" },
    { "name": "HERO HOLD", "timeSec": 1.20, "comment": "Full lockup settled" }
  ],
  "previewFrames": [
    { "timeSec": 0.45, "outputPng": "./output/frame_0_45s_entrance.png" },
    { "timeSec": 1.50, "outputPng": "./output/frame_1_50s_hero.png" }
  ]
}
```

---

### Stage 3: Execute Live Step-by-Step in the After Effects Composition Viewer

Run the build in Live Foreground Mode:

```bash
python3 <SKILL_DIR>/scripts/after_effects_cli.py build-spec ./output/motion_spec.json
```

- **What the user sees live on screen**:
  1. After Effects comes to the front and opens the Composition in the Viewer (`comp.openInViewer()`).
  2. The Background Solid + Gradient Ramp and Ambient Glow Orbs appear.
  3. Each Vector Shape Card pops into the Viewer with its drop shadow, stroke, and Bezier entrance keyframes.
  4. Each Kinetic Text layer is created one by one, centered via `sourceRectAtTime`, and keyframed as the playhead scrubs forward across the timeline.
  5. Timeline Markers are placed, preview PNG frames are rendered to disk, and the `.aep` project is saved.

---

### Stage 4: Multimodal Keyframe Frame Critique & Refinement

1. View the exported `previewFrames` (`frame_0_45s_entrance.png`, `frame_1_50s_hero.png`) using `view_file`.
2. Check for:
   - **Zero Text/Card Collisions**: Are all text lines cleanly spaced and centered inside or above their target cards?
   - **Motion Choreography**: At `0.45s` (mid-entrance), is the stagger progression visible and balanced? At `1.50s` (hero hold), is the full layout locked in with high contrast?
   - **Brand Motion DNA Fidelity**: Do colors, fonts, and easing feel consistent with `.motion-dna/motion_dna.json`?
3. If any coordinate or timing needs adjustment, update `motion_spec.json` (or run a targeted `after_effects_cli.py exec` call) and re-verify.

---

## Embedded Laya Decision Gate (`NandhaKishorM/laya`) — Call Laya ONLY When Necessary

This skill embeds the **[Laya Non-Autoregressive Decision Model (`https://github.com/NandhaKishorM/laya`)](https://github.com/NandhaKishorM/laya)** inside [`scripts/laya_decision_gate.py`](scripts/laya_decision_gate.py) (`from laya import Router`).

### Strict Execution Policy: When to Call Laya vs. Manual Execution

1. **BASIC / EXPLICIT TASKS → DO NOT CALL LAYA (Execute Directly & Manually)**:
   - If the user gives a clear, direct, or single-step command (for example: *"change comp duration to 10 seconds"*, *"set text layer opacity from 0 to 100"*, *"add Gaussian Blur of 40px"*, *"export frame at 2.5s to PNG"*), **DO NOT call Laya**.
   - Execute the step directly using the skill's native CLI/MCP tools to keep execution instant and zero-overhead.
2. **COMPLEX / AMBIGUOUS MULTI-BRANCH TASKS → CALL LAYA (`laya_decision_gate.py`)**:
   - Call Laya **only when** a genuine typed decision (`choice`, `score`, `noul`) across multiple creative lanes or ambiguous requirements is needed (for example: *Select the motion choreography, Bezier velocity influence profile, and scene staging for an open-ended motion brief*; *Arbitrate between kinetic brutalist cuts vs. smooth exponential luxury easing across multi-scene comps*).
   - Run the Laya Decision Gate:
     ```bash
     python3 scripts/laya_decision_gate.py --state "<user_brief_or_complex_state>"
     ```
   - `laya_decision_gate.py` automatically runs `should_call_laya()` first:
     - If the task is basic, it immediately returns `"laya_called": false, "execution_mode": "direct_manual_execution"` without loading neural weights.
     - If the task is genuinely complex, it invokes `laya.Router().predict(...)` in a single forward pass (~33ms) with calibrated confidence gating (`min_confidence=0.55`) and neutral `noul` labels (`{"true": "A", "false": "B"}`).
   - To install the `laya` neural weights package (`pip install laya`) on a machine:
     ```bash
     python3 scripts/laya_decision_gate.py --install
     ```
