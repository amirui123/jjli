# @earcon/engine-tone

Tone.js engine for earcon: 28 synthesized presets (sonar, parking sensor, Geiger
counter, heartbeat, countdown, hi-lo siren, red alert, stall warning, missile
lock-on, pulse oximeter, lane departure, foghorn, kettle, ticking clock; bell,
register, coin, knock, all clear, buzzer, chime, SOS, gong, glass break, power
down, squelch, water drop, latch click), per-monitor buses with pan and volume, and
`fromSpec` (subpath `@earcon/engine-tone/from-spec`), which turns a JSON `SynthSpec`
into a sound. `tone` is a peer dependency; the main entry imports it lazily inside
`unlock()`, while the `from-spec` subpath imports it statically.

```ts
import { createToneEngine } from '@earcon/engine-tone'
const engine = createToneEngine({ masterVolumeDb: -6 })
button.onclick = () => engine.unlock()
```

Part of [earcon](https://github.com/hironow/earcon).
