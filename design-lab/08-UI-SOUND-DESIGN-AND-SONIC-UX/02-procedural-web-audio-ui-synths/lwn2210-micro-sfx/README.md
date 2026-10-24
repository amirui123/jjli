# 🎛️ micro-sfx

> **Zero-asset, zero-dependency procedural sound synthesis engine.**  
> Real-time mathematical audio for **Web, Mobile Web, React Native, Unity, Godot, Flutter, iOS (Swift), Android (Kotlin), and C99**.

[![CI](https://github.com/lwn2210/micro-sfx/actions/workflows/ci.yml/badge.svg)](https://github.com/lwn2210/micro-sfx/actions)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/badge/gzipped-<2KB-brightgreen?style=flat-square)](#)

---

## 💡 Why `micro-sfx`?

Stop bundling megabytes of `.wav` and `.mp3` files for UI clicks and arcade game sounds.

- **0 KB Asset Downloads:** Audio synthesized mathematically on-the-fly via native DSP.
- **Zero Dependencies:** Pure TypeScript / WebAudio / Native PCM.
- **True Multi-Platform:** One unified sound parameter contract across Web, Mobile (iOS/Android/Flutter/React Native), and Game Engines (Unity/Godot).
- **Offline WAV Generator:** Export raw WAV files in Node.js or browser without third-party encoders.
- **Instant Playback:** `< 5ms` latency, immune to HTTP network lag.

---

## 🚀 Live Interactive Demos

- 🎛️ **[Web Studio Playground](https://lwn2210.github.io/micro-sfx/)** — Test presets, tweak sliders, and copy one-line code.
- 🎮 **[CYBER-RAID 2088 Retro Game](https://lwn2210.github.io/micro-sfx/game/)** — Zero-asset arcade game powered 100% by `micro-sfx`.

---

## 💻 Integration Guides

### 1. 🌐 Web & Mobile Web (HTML5 / Vanilla JS / React / Vue / Svelte)

Mobile browsers (iOS Safari, Android Chrome) require a user gesture (tap/click) before playing audio. `micro-sfx` handles this automatically by unlocking the `AudioContext` on first interaction!

#### A. Direct Script Tag (Zero Bundler / CDN)
```html
<script type="module">
  import { sfx } from 'https://cdn.jsdelivr.net/gh/lwn2210/micro-sfx@main/dist/index.js';

  // Play retro arcade sounds
  document.getElementById('jumpBtn').addEventListener('click', () => sfx.jump());
  document.getElementById('coinBtn').addEventListener('click', () => sfx.coin());

  // Play modern UI & system feedback sounds
  document.getElementById('clickBtn').addEventListener('click', () => sfx.click());
  document.getElementById('likeBtn').addEventListener('click', () => sfx.badge());
  document.getElementById('saveBtn').addEventListener('click', () => sfx.success());
  document.getElementById('delBtn').addEventListener('click', () => sfx.error());
</script>
```

#### B. Modern Frontend Frameworks (React, Vue, Next.js)
```bash
npm install micro-sfx
```

```tsx
import React from 'react';
import { sfx } from 'micro-sfx';

export function ActionButton() {
  const handleClick = () => {
    // 1-line instant sound with optional pitch or volume modifier
    sfx.tap({ pitch: 1.1, volume: 0.8 });
  };

  return <button onClick={handleClick}>Tap Me</button>;
}
```

#### C. Mobile Web (iOS Safari / PWA Best Practices)
In mobile web views, hook into `touchstart` or `pointerdown` for zero touch-delay audio:
```javascript
import { sfx } from 'micro-sfx';

// Immediate sound response on touch without 300ms click delay
window.addEventListener('touchstart', (e) => {
  if (e.target.matches('.sfx-tap')) sfx.tap();
  if (e.target.matches('.sfx-toggle')) sfx.toggle();
}, { passive: true });
```

---

### 2. ⚛️ React Native / Expo (Zero Asset Sound)

No static `.wav` files needed inside your mobile `assets/` folder. Generate Base64 Data URIs on-the-fly:

```typescript
import { sfx } from 'micro-sfx';
import { Audio } from 'expo-av';

export async function playSound(preset: 'coin' | 'jump' | 'success') {
  // Generate zero-asset data:audio/wav;base64,... URI
  const uri = sfx.toDataURI(preset);

  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
}
```

---

### 3. 💙 Flutter / Dart (Byte Buffer & PCM)

Drop `runtimes/flutter/micro_sfx.dart` into your project:

```dart
import 'package:audioplayers/audioplayers.dart';
import 'micro_sfx.dart';

final player = AudioPlayer();

// 1. Play directly via WAV byte buffer (audioplayers)
void onCoinPickup() async {
  await player.play(BytesSource(MicroSFX.generateWAV('coin', pitch: 1.2)));
}

// 2. Or generate raw 16-bit Mono PCM Int16List for low-level audio streams
final pcm = MicroSFX.generatePCM('laser');
```

---

### 4. 🎮 Game Engines

#### A. Unity (C#)
Drop `runtimes/unity/MicroSFX.cs` into your project:
```csharp
using MicroSFX;

// Generates procedural AudioClip dynamically
MicroSFX.Play("coin");
MicroSFX.Play("laser", pitch: 1.2f, volume: 0.8f);
```

#### B. Godot 4 (GDScript)
Drop `runtimes/godot/MicroSFX.gd` into your project:
```gdscript
# Synthesize real-time audio via AudioStreamGenerator
MicroSFX.play("coin", get_tree())
MicroSFX.play("explosion", get_tree(), 0.9, 1.0)
```

---

### 5. 🍏 iOS / macOS (Swift) & 🤖 Android (Kotlin)

#### Native iOS (AVAudioEngine)
```swift
MicroSFX.shared.play("coin")
MicroSFX.shared.play("laser", pitch: 1.2, volume: 0.9)
```

#### Native Android (AudioTrack)
```kotlin
MicroSFX.play("coin")
MicroSFX.play("hit", pitch: 1.0f, volume: 0.8f)
```

---

## 🎛️ 28 Built-in Presets (Daily Sound Drops)

| Category | Preset | Waveform | Ideal For |
| :--- | :--- | :--- | :--- |
| **Retro & Action** | `coin` | Square | Coins, score increases, pickups |
| | `laser` | Sawtooth | Projectiles, blasters, retro shooter guns |
| | `jump` | Square | Character jumping, bouncy platforms |
| | `explosion` | Noise | Bombs, impacts, crumbling walls |
| | `hit` | Sawtooth | Damage taken, shield hits |
| | `powerup` | Triangle | Level complete, upgrades, buffs |
| **UI & Touch** | `click` | Sine | Standard buttons, switches |
| | `select` | Sine | Menu navigation, list focus |
| | `blip` | Sine | Subtle key presses, micro-interactions |
| | `tap` | Triangle | Mobile bottom sheet taps, card clicks |
| | `toggle` | Sine | Switch on/off state changes |
| **Feedback Alerts**| `success` | Triangle | Form submit ok, transaction done |
| | `error` | Sawtooth | Validation fail, rejected action |
| | `notification` | Sine | Push alerts, new message pings |
| | `badge` | Triangle | Like reaction, heart award, achievement |
| | `warp` | Sine | Teleport, screen transitions, speed boost |
| **Sci-Fi Combat #2** | `phaser` | Square | Charged beam weapons, heavy blaster fire |
| | `thruster` | Noise | Engine rumble, continuous boost, ambient hum |
| | `alarm` | Square | Boss warning, danger alerts, countdown signals |
| **Daily Drop #3** | `heal` | Sine | Soft rising major arpeggio, warmth, HP pickup |
| | `critical` | Sawtooth | Heavy low boom + metallic ring, crit hit / boss break |
| | `teleport` | Sine | Fast rise-and-fall sweep + shimmer, blink/dash |
| **Daily Drop #4** | `inventory-open` | Triangle | Light two-step pop, opening loot bags & menus |
| | `low-ammo` | Square | Dry mechanical clack, magazine running empty |
| | `levelup` | Triangle | Bright C5→C6 fanfare leap, level complete & rank ups |

---

## 🛠️ CLI Tool

Generate and inspect sound presets directly in your terminal:

```bash
# List all 28 presets
npx micro-sfx list

# Export a preset to a WAV file
npx micro-sfx export coin ./sounds/coin.wav --pitch 1.2

# Export all presets at once
npx micro-sfx export-all ./public/sfx
```

---

## 📄 License

MIT © [lwn2210](https://github.com/lwn2210)
