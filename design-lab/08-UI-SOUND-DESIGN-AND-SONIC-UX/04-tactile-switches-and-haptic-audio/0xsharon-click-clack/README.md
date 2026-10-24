# click-clack ⌨️

> Procedurally synthesized mechanical keyboard acoustics for the web.  
> **Zero audio files**, under **2KB minified**, powered entirely by the Web Audio API.

<p align="left">
  <a href="https://www.npmjs.com/package/@0xsharon/click-clack"><img src="https://img.shields.io/npm/v/@0xsharon/click-clack?color=18181b&style=flat-square&label=npm" alt="npm version" /></a>
  <a href="https://github.com/0xSHARON/click-clack/packages"><img src="https://img.shields.io/badge/GitHub%20Packages-v1.2.0-18181b?style=flat-square&logo=github" alt="GitHub Packages" /></a>
  <a href="https://bundlephobia.com/package/@0xsharon/click-clack"><img src="https://img.shields.io/bundlephobia/minzip/@0xsharon/click-clack?color=18181b&style=flat-square" alt="bundle size" /></a>
  <a href="https://github.com/0xSHARON/click-clack/actions"><img src="https://img.shields.io/github/actions/workflow/status/0xSHARON/click-clack/ci.yml?branch=main&style=flat-square&label=CI&color=18181b" alt="CI Status" /></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/dependencies-0-22c55e?style=flat-square" alt="0 Dependencies" /></a>
  <a href="https://github.com/0xSHARON/click-clack/stargazers"><img src="https://img.shields.io/github/stars/0xSHARON/click-clack?style=flat-square&color=18181b" alt="stars" /></a>
  <a href="https://socket.dev/npm/package/@0xsharon/click-clack"><img src="https://img.shields.io/badge/Socket-Security%20Verified-22c55e?style=flat-square" alt="Socket Verified" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@0xsharon/click-clack?color=18181b&style=flat-square" alt="license" /></a>
</p>

---

## 🎧 Interactive Studio Demo

👉 **[Try the Live Web Demo](https://0xsharon.github.io/click-clack/)**  
*Plug in headphones to experience real-time 3D stereo ear-to-ear panning as your fingers move across the physical keyboard.*

<p align="center">
  <a href="https://0xsharon.github.io/click-clack/">
    <img src="https://raw.githubusercontent.com/0xSHARON/click-clack/main/assets/preview.png" alt="click-clack interactive mechanical keyboard studio demo" width="940" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />
  </a>
</p>

---

## Why this exists

Tactile micro-feedback makes web applications, code playgrounds, games, and terminal emulators feel responsive and satisfying. But adding mechanical switch audio usually comes with trade-offs:

1. **Asset Bloat:** A standard switch sound pack adds 300KB to 1.5MB of `.mp3` or `.wav` files to your network payload.
2. **Playback Latency:** Browser audio decoding and standard `<audio>` tags create noticeable micro-delays (15–40ms) between a physical keystroke and the sound trigger.
3. **The "Machine Gun" Effect:** Repeatedly firing the identical static audio sample 120 times a minute sounds robotic, repetitive, and unnatural.

`click-clack` takes an acoustic physics approach. Instead of fetching and playing recorded audio files, it synthesizes the sound of mechanical switches **in real time** using the browser's native **Web Audio API**.

- **Payload:** Under 2KB minified (<1.2KB gzipped).
- **Runtime Dependencies:** Exactly 0.
- **Audio Assets Required:** 0 files (no MP3s, WAVs, or base64 audio strings).
- **Acoustic Latency:** Instantaneous (<1ms).
- **Organic Variance:** Every keystroke features dynamic pitch and decay jitter (±4%) so typing fast feels organic and alive.

---

## Audio Synthesis Signal Chain

Here is how `click-clack` transforms a physical key event into tactile acoustics in under a millisecond:

<p align="center">
  <img src="https://raw.githubusercontent.com/0xSHARON/click-clack/main/assets/architecture.png" alt="click-clack Web Audio API Signal Chain Architecture" width="940" style="border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.4);" />
</p>

```
Physical Keystroke / Input Event
              │
      [Key Role Analysis] ─── Spacebar? ─── Heavy sub-bass bottom-out + wire rattle
              │
    [calculateKeyPan] ─────── Maps horizontal coordinate (-0.42 Left to +0.42 Right)
              │
   [Procedural Synthesis Nodes]
   ├── Click Leaf Transient: Bandpass filtered pink noise burst (Q: 3.5, 3.2kHz)
   ├── Bottom-Out Clack:     Dual exponential sine sweep (130Hz → 65Hz)
   └── Spring Resonance:     Triangle oscillator (1100Hz ring)
              │
     [Deskmat Acoustic] ───── BiquadFilter: Lowpass (Felt) / Peaking (Wood/Metal)
              │
    [StereoPannerNode] ────── Ear-to-ear headphone positioning
              │
      [Master Gain] ───────── WPM Flow dynamics scaler (tightens envelope >60 WPM)
              │
      AudioDestination ────── Headphones / Speakers
```

---

## Switch Profiles

`click-clack` ships with 6 procedural switch profiles modeled after real mechanical switches and vintage typewriters:

| Profile | Real-World Equivalent | Base Frequency | Noise Filter | Acoustic Character |
| :--- | :--- | :--- | :--- | :--- |
| `thock` | Lubed Holy Panda / Topre | 130Hz → 65Hz Sine | 1.8kHz Lowpass | Deep, rounded bottom-out with dampened housing clack. Heavy 85Hz spacebar wire ping. |
| `creamy` | Lubed Linear (Gateron Oil King) | 380Hz → 160Hz Sine | 3.8kHz Bandpass (Q: 4.5) | High-pitch marbly "pop" with smooth linear glide and minimal housing rattle. |
| `clicky` | Cherry MX Blue / Kailh Box White | 180Hz → 90Hz Sine | 3.2kHz Bandpass (Q: 3.5) | Sharp click-leaf snap followed by high-frequency spring harmonic ping (1.1kHz). |
| `typewriter` | 1940s Underwood / Smith Corona | 140Hz Sawtooth | 2.6kHz Bandpass (Q: 2.0) | Heavy mechanical steel strike, mechanical chassis clunk, and optional carriage bell on `Enter`. |
| `cyberpunk` | 1980s Sci-Fi CRT Terminal | 440Hz → 220Hz Square | N/A (FM blip) | Digital 8-bit keypress blip with retro synthesizer harmonic overtone. |
| `bubble` | Modern Soft UI Pop | 280Hz → 620Hz Sine | N/A (Liquid envelope) | Gentle, rounded liquid water droplet pop for modern minimalist app interfaces. |

---

## 📦 Installation

You can install `@0xsharon/click-clack` from either **npm** or **GitHub Packages**:

### Option 1: Via npm (Standard)

```bash
npm install @0xsharon/click-clack
```

Or with your preferred package manager:

```bash
pnpm add @0xsharon/click-clack
# or
yarn add @0xsharon/click-clack
# or
bun add @0xsharon/click-clack
```

### Option 2: Via GitHub Packages Registry

`@0xsharon/click-clack` is also hosted on [GitHub Packages](https://github.com/0xSHARON/click-clack/packages):

1. Add the GitHub npm registry scope to your `.npmrc`:
   ```ini
   @0xsharon:registry=https://npm.pkg.github.com
   ```
2. Install as usual:
   ```bash
   npm install @0xsharon/click-clack
   ```

Dual ESM and CommonJS bundles are included out of the box with zero runtime dependencies and complete TypeScript definitions.

---

## Quick Start

### 1. Attach to an Input or Textarea

The fastest way to add mechanical audio to an editor or form:

```ts
import { attachMechanicalAudio } from '@0xsharon/click-clack';

const inputElement = document.querySelector('textarea');

// Attach audio listener
const detach = attachMechanicalAudio(inputElement, {
  profile: 'creamy',      // 'thock' | 'creamy' | 'clicky' | 'typewriter' | 'cyberpunk' | 'bubble'
  volume: 0.8,           // Master volume (0.0 to 1.0)
  stereoPan: true,       // Enable 3D ear-to-ear spatial positioning
  wpmDynamics: true,     // Dynamically ramps pitch when typing fast (>60 WPM)
  deskmat: 'wood',       // 'none' | 'felt' | 'wood' | 'metal'
  carriageBell: true,    // Rings vintage bell chime on Enter key
  playRelease: true      // Plays subtle upstroke release click on keyup
});

// Detach whenever the component unmounts or element is removed
// detach();
```

### 2. Global Window Binding

To provide subtle mechanical feedback across your entire application:

```ts
import { attachMechanicalAudio } from '@0xsharon/click-clack';

// Attach to window so any typing in any field plays audio
const detach = attachMechanicalAudio(window, {
  profile: 'thock',
  volume: 0.6,
  stereoPan: true
});
```

### 3. Imperative Manual Trigger

You can also trigger switch sounds imperatively for UI buttons, games, modal confirmations, or calculator keys:

```ts
import { playSwitch } from '@0xsharon/click-clack';

// Play switch sound on button click
submitBtn.addEventListener('click', () => {
  playSwitch({
    profile: 'creamy',
    volume: 0.9,
    key: 'Enter' // Triggers Enter acoustics & bell
  });
});

// Trigger spacebar stabilizer manually
playSwitch({ profile: 'thock', key: ' ' });
```

---

## Framework Integrations

### React (`@0xsharon/click-clack/react`)

Use custom React hooks to attach to refs or the entire window:

```tsx
import React, { useRef } from 'react';
import { useClickClack, useGlobalClickClack } from '@0xsharon/click-clack/react';

export function NoteEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically binds keydown & keyup listeners to this ref
  useClickClack(textareaRef, {
    profile: 'creamy',
    stereoPan: true,
    wpmDynamics: true,
    deskmat: 'felt'
  });

  return (
    <div className="editor-card">
      <textarea
        ref={textareaRef}
        placeholder="Type to feel the switches..."
      />
    </div>
  );
}

// Or enable globally across your entire app:
export function App() {
  useGlobalClickClack({ profile: 'thock', volume: 0.7 });
  return <div id="root">...</div>;
}
```

### Vue 3 (`@0xsharon/click-clack/vue`)

Use the `vClickClack` directive:

```vue
<script setup lang="ts">
import { vClickClack } from '@0xsharon/click-clack/vue';
</script>

<template>
  <textarea
    v-click-clack="{ profile: 'creamy', stereoPan: true, wpmDynamics: true }"
    placeholder="Vue 3 mechanical switch feedback..."
  />
</template>
```

### Svelte (`@0xsharon/click-clack/svelte`)

Use the `clickClack` action:

```svelte
<script>
  import { clickClack } from '@0xsharon/click-clack/svelte';
</script>

<textarea
  use:clickClack={{ profile: 'creamy', stereoPan: true }}
  placeholder="Svelte mechanical switch feedback..."
/>
```

### Zero-Code HTML Script (`@0xsharon/click-clack/auto`)

For static blogs, Webflow, Shopify, or documentation sites, simply drop in the auto script and add `data-click-clack` attributes to your HTML tags:

```html
<!-- Enable on the entire page -->
<body data-click-clack="thock">

<!-- Or customize per input/textarea -->
<textarea
  data-click-clack="creamy"
  data-volume="0.8"
  data-stereo="true"
  data-bell="true"
  data-deskmat="wood"
></textarea>

<script type="module" src="https://unpkg.com/@0xsharon/click-clack/dist/auto.mjs"></script>
```

> **Built-in Global Mute Hotkey:** When using the auto-script, users can press `Ctrl + Alt + M` (or `Cmd + Alt + M`) anytime to mute or unmute audio. A clean, non-intrusive on-screen toast is automatically displayed.

---

## Complete API Reference

### `attachMechanicalAudio(target, options)`

Attaches mechanical audio listeners to a DOM element, `window`, or `document`.

```ts
function attachMechanicalAudio(
  target: EventTarget | HTMLElement | Window,
  options?: AttachOptions
): () => void;
```

**`AttachOptions` Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `profile` | `SwitchProfile` | `'thock'` | Switch signature: `'thock'`, `'creamy'`, `'clicky'`, `'typewriter'`, `'cyberpunk'`, `'bubble'` |
| `volume` | `number` | `0.8` | Master output volume between `0.0` (silent) and `1.0` (maximum) |
| `stereoPan` | `boolean` | `true` | Positions sounds across the stereo field based on the key's physical horizontal position |
| `wpmDynamics` | `boolean` | `false` | Dynamically ramps pitch and tightens envelope decay when typing speed exceeds 60 WPM |
| `deskmat` | `DeskmatAcoustic` | `'none'` | Acoustic resonance filter: `'none'` (neutral), `'felt'` (damped), `'wood'` (warm), `'metal'` (bright) |
| `carriageBell` | `boolean` | `false` | Plays a vintage mechanical bell chime when the `Enter` key is pressed |
| `haptic` | `boolean` | `false` | Fires a 7ms vibration pulse via `navigator.vibrate` on supported touchscreen devices |
| `playRelease` | `boolean` | `true` | Synthesizes a subtle upstroke reset click when releasing keys (`keyup`) |
| `filter` | `(e: KeyboardEvent) => boolean` | `undefined` | Custom filter predicate to ignore specific keys (e.g., ignoring `Escape` or modifier keys) |

**Returns:** A cleanup function `() => void` that removes all attached event listeners.

---

### `playSwitch(options)`

Imperatively synthesizes a single switch stroke.

```ts
function playSwitch(options?: PlaySwitchOptions): void;
```

**`PlaySwitchOptions` Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `profile` | `SwitchProfile` | Active Profile | Switch profile used for synthesis |
| `volume` | `number` | `1.0` | Individual trigger volume |
| `pitch` | `number` | `1.0` | Pitch scaling multiplier |
| `pan` | `number` | `0.0` | Stereo pan position (`-1.0` hard left to `+1.0` hard right) |
| `key` | `string \| KeyRole` | `'standard'` | Key identifier (e.g., `' '` for spacebar bottom-out, `'Enter'` for carriage return) |
| `deskmat` | `DeskmatAcoustic` | `'none'` | Deskmat surface resonance filter |
| `carriageBell` | `boolean` | `false` | Whether to chime the carriage bell on enter |
| `haptic` | `boolean` | `false` | Trigger mobile tactile vibration |
| `isRelease` | `boolean` | `false` | Whether this trigger represents a key release upstroke |

---

### Global Controls & Mute State

```ts
import {
  isMuted,
  setMuted,
  toggleMute,
  getMasterVolume,
  setMasterVolume,
  getMasterProfile,
  setMasterProfile
} from '@0xsharon/click-clack';

// Toggle mute state globally
toggleMute();
setMuted(true);
console.log('Is audio muted?', isMuted()); // true

// Adjust master volume and default profile
setMasterVolume(0.5);
setMasterProfile('creamy');
```

---

## Acoustic Physics & Engine Internals

### 1. Pink Noise Caching (Zero Garbage Collection)
In real mechanical switches, the high-frequency contact snap is shaped noise rather than a pure tone. Standard Web Audio implementations often generate fresh noise buffers on every keystroke, which triggers JavaScript garbage collector spikes during fast typing.

`click-clack` pre-calculates a single 1-second pink noise buffer using the **Paul Kellet 3-pole filtering algorithm** once at initialization:

```ts
// Pre-computed 1-second pink noise buffer reused across all keystrokes
const bufSize = audioCtx.sampleRate;
const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
const data = buffer.getChannelData(0);
let b0 = 0, b1 = 0, b2 = 0;

for (let i = 0; i < bufSize; i++) {
  const white = Math.random() * 2 - 1;
  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
}
```
During typing, a lightweight `AudioBufferSourceNode` references this pre-allocated buffer with a random time offset, ensuring 0 memory allocation per keystroke.

### 2. 3D Spatial Stereo Panning
When using headphones, typing on a physical keyboard produces sound in distinct physical locations:
- Left keys (`Q`, `A`, `Z`, `Tab`, `Shift`) map to pan `-0.42` to `-0.22` (Left ear)
- Center keys (`T`, `G`, `B`, `Space`) map to pan `0.0` (Center)
- Right keys (`P`, `L`, `Enter`, `Backspace`) map to pan `+0.22` to `+0.42` (Right ear)

This produces an authentic sense of physical keyboard width in headphones without fatiguing the listener.

### 3. WPM Flow-State Dynamics
When typing speed exceeds 60 WPM, the engine dynamically tightens the decay envelope (from 70ms down to 45ms) and subtly nudges the pitch upward by 2–18%. This prevents acoustic mudding during fast typing and provides a rewarding sense of momentum.

### 4. Tab Visibility Auto-Sleep
When a user switches browser tabs (`document.visibilityState === 'hidden'`), the engine automatically suspends the underlying `AudioContext`, preventing background battery drain and CPU consumption. The context instantly resumes when the tab becomes active again.

---

## Browser Support & Autoplay Policy

`click-clack` is compatible with all modern browsers:
- **Chrome / Chromium** 66+
- **Firefox** 60+
- **Safari** 14.1+ (macOS & iOS)
- **Edge** 79+

Modern browsers require a genuine user gesture (mouse click or keystroke) before allowing web audio playback. `click-clack` handles this automatically: the `AudioContext` remains idle until the first user interaction, then resumes instantly without throwing autoplay warnings or unhandled promise errors.

---

## Local Development

If you'd like to contribute or experiment with sound profiles locally:

```bash
# Clone the repository
git clone https://github.com/0xSHARON/click-clack.git
cd click-clack

# Install dependencies
npm install

# Run unit tests with Vitest
npm test

# Build dual ESM/CJS bundles with tsup
npm run build

# Start live TypeScript watch mode
npm run dev
```

To run the interactive studio locally, simply open `index.html` or `demo.html` in your browser.

---

## 🌟 Star History

<p align="center">
  <a href="https://star-history.com/#0xSHARON/click-clack&Date">
    <img src="https://api.star-history.com/svg?repos=0xSHARON/click-clack&type=Date&theme=dark" alt="click-clack Star History Chart" width="850" style="border-radius: 10px;" />
  </a>
</p>

---

## 🤝 Contributors

Contributions of all kinds—submitting new switch acoustics, framework plugins, bug fixes, or documentation improvements—are warmly welcomed!

<p align="center">
  <a href="https://github.com/0xSHARON/click-clack/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=0xSHARON/click-clack" alt="click-clack Contributors" />
  </a>
</p>

Please read our [Contributing Guide](./CONTRIBUTING.md) and [Security Policy](./SECURITY.md) before submitting pull requests.

---

## 💖 Community & Support

- ⭐ **Star this repository** on [GitHub](https://github.com/0xSHARON/click-clack) to support future switch profiles.
- 📦 **View on GitHub Packages**: [@0xsharon/click-clack](https://github.com/0xSHARON/click-clack/packages)
- 📮 **Submit feature requests or switch sound ideas** on [GitHub Issues](https://github.com/0xSHARON/click-clack/issues).
- ☕ **Sponsor the developer** on [GitHub Sponsors](https://github.com/sponsors/0xSHARON).

---

## License

MIT © [0xSHARON](https://github.com/0xSHARON)
