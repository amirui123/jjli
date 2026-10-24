# web-haptics-polyfill

Cross-platform haptic feedback for mobile web apps. Uses the iOS Safari `<input type="checkbox" switch>` exploit for real haptics on iPhone, `navigator.vibrate()` with PWM intensity control on Android, and an AudioContext fallback for desktop debugging.

## Install

```sh
# Not yet published to npm — install from GitHub:
npm install github:doublej/web-haptics-polyfill
```

## Usage

```ts
import { haptics } from 'web-haptics-polyfill'

// Preset
haptics.trigger('success')

// Duration (ms)
haptics.trigger(100)

// Custom vibration sequence
haptics.trigger([
  { duration: 30, intensity: 0.5 },
  { duration: 40, intensity: 1.0, delay: 60 },
])
```

### Presets

`success` `error` `warning` `selection` `light` `medium` `heavy` `soft` `rigid` `nudge` `buzz`

### Options

```ts
import { Haptics } from 'web-haptics-polyfill'

const h = new Haptics({
  engine: 'auto',  // 'auto' | 'ios' | 'android' | 'audio' | 'noop'
  debug: true,     // use audio engine on desktop for testing
})
```

## Framework Integrations

### React

```tsx
import { useHaptics } from 'web-haptics-polyfill/react'

function Button() {
  const { trigger, isSupported } = useHaptics()
  return <button onClick={() => trigger('success')}>Tap me</button>
}
```

### Svelte

```svelte
<script>
  import { createHaptics } from 'web-haptics-polyfill/svelte'

  const { trigger, isSupported } = createHaptics()
</script>

<button onclick={() => trigger('success')}>Tap me</button>
```

### Vue

```vue
<script setup>
import { useHaptics } from 'web-haptics-polyfill/vue'

const { trigger, isSupported } = useHaptics()
</script>

<template>
  <button @click="trigger('success')">Tap me</button>
</template>
```

## How It Works

| Platform | Engine | Technique |
|----------|--------|-----------|
| iOS Safari 17.4+ | `IosEngine` | Programmatically toggles a hidden `<input switch>` checkbox, which triggers the native haptic feedback built into Safari's switch control |
| Android Chrome | `AndroidEngine` | `navigator.vibrate()` with PWM (pulse-width modulation) patterns to simulate variable intensity |
| Desktop | `AudioEngine` | Bandpass-filtered white noise bursts through AudioContext for development/testing |
| Unsupported | `NoopEngine` | Silent no-op |

## Credits

Inspired by and based on [Haptics](https://haptics.lochie.me/) by [Lochie](https://github.com/lochie) — the original discovery and implementation of the iOS Safari switch checkbox haptic exploit.

## License

MIT
