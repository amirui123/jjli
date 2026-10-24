# @earcon/core

Pure sonification state machine: hysteresis levels, ETA-based intensity, stale
watchdog, acknowledge, and the arbiter that decides which of many monitors sounds.
No DOM, no Web Audio, no clock — time comes in as arguments.

```ts
import { createMonitor, selectAudible } from '@earcon/core'

const m = createMonitor({
  id: 'w1',
  direction: 'decreasing',
  levels: [{ id: 'watch', enter: 0.1, exit: 0.12 }, { id: 'critical', enter: 0.02, exit: 0.03 }],
  urgency: { mode: 'eta', eventAt: 0 },
})
m.update({ value: 0.09, t: performance.now() }) // → [{ type: 'enter', level: 'watch', from: null }, { type: 'intensity', value: … }]
```

Part of [earcon](https://github.com/hironow/earcon). API: `docs/api.md` in the repository.
