---
name: ui-sound-design
description: >-
  Expert guide and best practices for integrating semantic UI sound effects into web and mobile
  applications using UI SFX (`uisfx`). Use when adding audio feedback to interface interactions,
  selecting sound packs, mapping user events to semantic cues, handling Web Audio autoplay unlock,
  managing continuous state loops, configuring mute/volume accessibility preferences, and avoiding
  audio fatigue.
---

# UI Sound Design & Integration Guide (`uisfx`)

This skill guides the design and implementation of semantic sound effects in web and mobile applications using the open-source **UI SFX** library (`uisfx`).

UI SFX replaces raw, fragmented audio files with **78 semantic cues** and **12 coherent sonic personalities** powered by a zero-dependency ~12 kB Web Audio runtime with CC0 royalty-free audio.

---

## 1. Golden Rules of Interface Sound Design

1. **Do not sonify every click**: Sound must reinforce meaning, not produce fatigue. Never add audio to basic hover states or standard text links in productivity tools.
2. **One cue per interaction**: Do not stack `press`, `select`, and `success` on a single ordinary action.
3. **Sound describes the outcome, not the control**: Play cues when state changes *succeed* or *fail* (e.g. after an API call completes), not immediately when a button is clicked.
4. **Sound is an enhancement, never the sole signal**: Visual, textual, motion, and ARIA feedback must remain completely functional even when audio is muted.
5. **Always provide a persistent Mute toggle**: Sound preferences (`enabled`, `volume`) must be respected, saved (e.g., in `localStorage` or user settings), and default to a moderate volume (`0.2` - `0.4`).
6. **Never autoplay**: Web Audio requires a genuine user gesture (click/pointerdown/keydown) to unlock.

---

## 2. Choosing the Sonic Personality (Pack)

Review the product's purpose and tone before choosing a pack:

| Pack | Character | Best Match |
| :--- | :--- | :--- |
| `minimal` | Dry, precise, almost invisible | SaaS, dashboards, productivity tools, devtools |
| `soft` | Rounded felt, warm and reassuring | Mobile apps, wellness, friendly apps, lifestyle |
| `glass` | Bright, crystalline, premium | Fintech, luxury, high-end media |
| `arcade` | 8-bit chunky pixels, cheerful voltage | Games, streaks, gamified education (Duolingo style) |
| `mechanical` | Switches, relays, firm physical detents | Hardware interfaces, devtools, industrial UI |
| `organic` | Wood, water, breath, small stones | Education, calm games, children's tools |
| `scifi` | Clean holographic pings, digital shimmer | AI tools, spatial UI, futuristic apps |
| `rubber` | Tactile elastic taps with friendly rebound | Playful mobile, casual games, creative tools |
| `cinematic` | Deep impacts, polished tails, scale | Premium media, streaming, dramatic moments |
| `studio` | Tactile editing precision, warm restraint | Video/audio editing, digital workstations |
| `zen` | Pure tones, dry wood, washi paper detail | Mindfulness, reading, note-taking |
| `dreamy` | Airy blooms, soft sparkle | Ambient apps, exploration, creative relaxation |

See [Packs Reference](./references/packs-reference.md) for details.

---

## 3. Implementation Workflow

### Step 1: Install & Centralize Player

```bash
npm install uisfx
```

Create a single shared, client-only player singleton:

```typescript
import { createUISFX, type UISFXPlayer } from 'uisfx'

export const ui: UISFXPlayer = createUISFX({
  pack: 'minimal',
  volume: 0.3,
  enabled: true
})
```

* **SSR Protection**: Do not instantiate or play audio during Server-Side Rendering (Next.js, Nuxt, Astro).
* **React Strict Mode**: Ensure player is a singleton or stored in a ref/context to avoid duplicate instances on remount.

### Step 2: Unlock on User Gesture

Browsers block Web Audio until the user interacts with the page:

```typescript
// Call from the first trusted pointer or keyboard interaction
window.addEventListener('pointerdown', async () => {
  await ui.unlock()
}, { once: true })
```

### Step 3: Map Real Product Events to Semantic Cues

Prioritize meaningful transitions:

| Interaction / Event | Semantic Cue | Rationale |
| :--- | :--- | :--- |
| Save / Submit confirmed | `success` | Action completed successfully |
| Form validation error | `error` | Requires immediate user correction |
| Destructive action confirmed | `delete` | Permanent removal committed |
| Action cancelled | `cancel` | Pending operation abandoned |
| Toggle switch | `toggle-on` / `toggle-off` | Reflects the resulting state |
| Checkbox | `check` / `uncheck` | Task completion status |
| Tab / Segment changed | `select` | View or item selected |
| Modal opened / closed | `open` / `close` | Spatial layer transition |
| Item copied to clipboard | `copy` | Data placed in clipboard |
| Drag & drop successful | `drop` | Dragged item accepted |
| Drag & drop rejected | `invalid-drop` | Target invalid |
| Gamification / Milestones | `reward`, `level-up`, `streak` | Positive reinforcement |
| Chat / Message incoming | `receive`, `notification` | Communication alert |

See [Cues Reference](./references/cues-reference.md) for the complete list of 78 cues.

### Step 4: Manage State Loops (`loading`, `processing`, etc.)

Loops continue indefinitely until explicitly stopped:

```typescript
// Start loop when async work begins
const loopHandle = ui.play('processing')

try {
  await performLongTask()
  // Stop loop before playing outcome!
  loopHandle?.stop()
  ui.play('complete')
} catch (err) {
  loopHandle?.stop()
  ui.play('error')
}
```

* **Always retain the loop handle** and call `handle.stop()` in `finally` or exit paths.
* When changing packs (`ui.setPack()`), active loops are automatically preserved in the new pack.

### Step 5: Accessible Sound Preferences

Provide an accessible toggle in the settings:

```typescript
// Mute handler
function toggleSound(enabled: boolean) {
  if (!enabled) {
    ui.stopAll() // Stop all active loops immediately
  }
  ui.setEnabled(enabled)
  localStorage.setItem('sound-enabled', JSON.stringify(enabled))
}

// Volume handler
function updateVolume(vol: number) {
  ui.setVolume(vol)
  localStorage.setItem('sound-volume', JSON.stringify(vol))
}
```

---

## 4. Reference Code Examples

* [React Hook & Provider](./examples/react-hook.ts): Complete React integration with context and loop cleanup.
* [Declarative HTML](./examples/declarative-html.html): Usage with `bindUISFX` data attributes.
