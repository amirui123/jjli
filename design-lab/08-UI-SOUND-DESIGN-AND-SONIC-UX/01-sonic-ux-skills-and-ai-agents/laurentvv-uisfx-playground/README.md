<div align="center">

<img src="assets/banner.png" alt="UI SFX Studio Playground Banner" width="100%" />

# UI SFX Studio & Playground

**An interactive audio design laboratory and showcase for modern web interfaces.**  
Test, audition, and integrate semantic sound effects powered by [uisfx](https://github.com/romainsimon/uisfx), with 12 sound personalities, 78 UI cues, real-world component simulations, and a dedicated **AI Agent Skill**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Audio: CC0 1.0](https://img.shields.io/badge/Audio-CC0%201.0%20Universal-brightgreen.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![uisfx](https://img.shields.io/badge/uisfx-v0.4.0-violet.svg)](https://github.com/romainsimon/uisfx)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Antigravity Skill](https://img.shields.io/badge/AI%20Agent-Skill%20Included-7928CA.svg)](#-featured-ai-agent-skill-ui-sound-design)

</div>

---

## 📸 Application Preview

<div align="center">
  <img src="assets/screenshot.png" alt="UI SFX Playground Screenshot" width="100%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" />
</div>

---

## ⚡ Highlights

* **12 Curated Sound Personalities**: Instant live switching between aesthetics without page reload (*Minimal, Soft, Glass, Arcade, Mechanical, Organic, Dreamy, Sci-fi, Rubber, Cinematic, Studio, Zen*).
* **Real-World Component Simulations**: Test audio cues directly on common interaction patterns:
  * Form submissions (`success`), destructive alerts (`delete`), cancellations (`cancel`), clipboard (`copy`).
  * Toggles (`toggle-on`, `toggle-off`), checkboxes (`check`, `uncheck`), navigation tabs (`select`).
  * Long async workflows with continuous state loops (`processing`), milestone steps (`progress-step`), and completion (`complete`).
  * Gamified milestones (`reward`, `level-up`, `streak`, `achievement`).
  * Drag & Drop feedback (`drag-start`, `drop`, `invalid-drop`).
* **Complete 78 Cues Soundboard Explorer**: Filter by 13 semantic categories or search by name in real time, with active loop tracking.
* **Master Audio Engine Controls**: Web Audio unlock state detection, master volume slider, instant mute/unmute, and global emergency panic button (`ui.stopAll()`).
* **🧠 Built-in AI Agent Skill**: Includes [`ui-sound-design`](#-featured-ai-agent-skill-ui-sound-design), an engineering standard and prompt skill for AI coding assistants (Google Antigravity, Gemini, Claude, Cursor).

---

## 🧠 Featured: AI Agent Skill (`ui-sound-design`)

This repository ships with a complete, production-grade **Antigravity Agent Skill** located in [`skills/ui-sound-design/`](./skills/ui-sound-design/).

It equips AI coding assistants and autonomous agents with sound design domain expertise to automatically write accessible, fatigue-free audio code.

```
skills/ui-sound-design/
├── SKILL.md                          # Main skill guide & prompt rules
├── references/
│   ├── cues-reference.md             # Complete dictionary of all 78 semantic cues
│   └── packs-reference.md            # Aesthetic guide & product matching matrix
└── examples/
    ├── react-hook.ts                 # Production React SoundProvider & useSoundEffect hook
    └── declarative-html.html         # Zero-JS declarative HTML attributes pattern
```

### What the Skill Teaches AI Assistants

1. **Anti-Fatigue Golden Rules**:
   * Never attach sound to high-frequency actions (keystrokes, scrolling, hover cascades).
   * Separate audio feedback by frequency range (low thump for destructive, mid-high chime for success).
   * Keep interface sounds low in the mix (volume `0.15`–`0.35`).
2. **State Loop Lifecycle Management**:
   * How to start (`startLoop('processing')`), store loop references, and reliably clean them up on component unmount or async errors to prevent infinite audio leaks.
3. **Web Audio Autoplay Unlock**:
   * Graceful lazy unlock on first user gesture without throwing `AudioContext` browser warnings.
4. **Accessibility & Preference Respect**:
   * Automatically detect and honor `prefers-reduced-motion` and user mute preferences.

### How to Install the Skill in Your Environment

To use this skill across any project with Google Antigravity or Gemini coding agents:

```bash
# Copy into your global Antigravity skills directory:
cp -r skills/ui-sound-design ~/.gemini/config/skills/
```

Or keep it directly in your project root at `.gemini/skills/ui-sound-design/` or `skills/ui-sound-design/`.

---

## 🚀 Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* `npm` or `pnpm`

### Installation

```bash
git clone https://github.com/laurentvv/uisfx-playground.git
cd uisfx-playground
npm install
```

### Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173/`**

### Production Build

Compile and bundle the application into optimized static assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🎨 Sound Personalities (12 Packs)

| Pack | Tone & Texture | Ideal Use Case |
| :--- | :--- | :--- |
| **`minimal`** | Dry, precise, subtle, almost invisible | SaaS dashboards, developer tools, system UI |
| **`soft`** | Rounded felt, warm, reassuring | Mobile apps, health & wellness, friendly SaaS |
| **`glass`** | Bright, crystalline, premium chime | Fintech, luxury goods, media platforms |
| **`arcade`** | Chunky pixels, upbeat voltage | Casual games, streaks, gamified learning |
| **`mechanical`** | Switches, relays, firm physical detents | Industrial interfaces, hardware monitors, terminal apps |
| **`organic`** | Wood, water droplets, breath, pebbles | Education, children apps, nature & calm tools |
| **`dreamy`** | Airy blooms, soft light, slow sparkle | Creative suites, ambient software, meditation |
| **`scifi`** | Clean holographic pings, digital shimmer | AI tools, spatial computing, futuristic HUDs |
| **`rubber`** | Tactile elastic taps, playful bounce | Kids apps, casual games, playful mobile UI |
| **`cinematic`** | Deep impacts, polished tails, quiet scale | Video editing, games, high-impact moments |
| **`studio`** | Tactile editing precision, warm restraint | Film & audio workstations, creative AI tools |
| **`zen`** | Pure acoustic tones, dry bamboo, washi detail | Mindfulness, reading, writing, calm productivity |

---

## 🎼 The 78 Semantic Cues by Category

`uisfx` categorizes UI sound into 13 semantic domains:

| Category | Cues Included |
| :--- | :--- |
| **Input** | `hover`, `press`, `release`, `double-click`, `focus`, `long-press` |
| **Selection** | `select`, `deselect`, `toggle-on`, `toggle-off`, `check`, `uncheck` |
| **Editing** | `delete`, `cancel`, `undo`, `redo`, `copy`, `paste` |
| **Navigation** | `open`, `close`, `back`, `forward`, `expand`, `collapse` |
| **Movement** | `drag-start`, `drop`, `snap`, `swipe`, `reorder`, `invalid-drop` |
| **Communication** | `send`, `receive`, `notification`, `mention`, `typing` |
| **Feedback** | `reaction`, `success`, `error`, `warning`, `info`, `blocked`, `retry` |
| **Progress** | `start`, `stop`, `progress-step`, `complete`, `queued`, `checkpoint` |
| **Loops** | `loading`, `processing`, `searching`, `uploading`, `downloading`, `syncing`, `scanning`, `connecting`, `ringing`, `alarm`, `heartbeat`, `timer-tick`, `ambient-hum` |
| **Media** | `play`, `pause`, `record`, `mute`, `unmute`, `shutter` |
| **System** | `power-on`, `power-off`, `connect`, `disconnect`, `battery-low` |
| **Reward** | `reward`, `level-up`, `streak`, `achievement` |
| **Commerce** | `add-to-cart`, `checkout`, `purchase` |

---

## 🛠️ Code Examples

### Basic JavaScript / TypeScript Usage

```typescript
import { createUISFX } from 'uisfx';

// Initialize with a sound personality
const ui = createUISFX({
  pack: 'glass',
  volume: 0.25,
});

// Play discrete semantic sound cues
button.addEventListener('click', () => {
  ui.play('press');
});

// Manage long async task with a continuous state loop
async function runDataSync() {
  const loop = ui.startLoop('syncing');
  try {
    await syncData();
    loop.stop();
    ui.play('complete');
  } catch (err) {
    loop.stop();
    ui.play('error');
  }
}
```

### Declarative HTML Attributes

```html
<script type="module">
  import { bindUISFX } from 'uisfx';
  bindUISFX({ pack: 'minimal' });
</script>

<button data-sfx="press">Click me</button>
<input type="checkbox" data-sfx-checked="check" data-sfx-unchecked="uncheck" />
```

---

## 📜 License & Acknowledgments

* **Application Code**: Licensed under the [MIT License](LICENSE).
* **Audio Synthesis & Sound Design**: Released under [Creative Commons Zero (CC0 1.0 Universal - Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/).
* **Original Library**: Powered by [`uisfx`](https://github.com/romainsimon/uisfx) created by Romain Simon.

---

<div align="center">
  <sub>Built with ❤️ for interface designers, developers, and autonomous AI agents.</sub>
</div>
