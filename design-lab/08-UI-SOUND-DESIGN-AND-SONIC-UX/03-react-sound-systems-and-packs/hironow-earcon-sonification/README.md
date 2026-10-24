# earcon

[![npm](https://img.shields.io/npm/v/@earcon/core?label=npm%20%40earcon%2F*)](https://www.npmjs.com/org/earcon)
[![CI](https://github.com/hironow/earcon/actions/workflows/ci.yaml/badge.svg)](https://github.com/hironow/earcon/actions/workflows/ci.yaml)
[![Demo](https://img.shields.io/badge/demo-GitHub%20Pages-0a0c0f)](https://hironow.github.io/earcon/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Not a notification library that sounds when something *happened* — a sonification hook that sounds when something is *approaching*.

`earcon` maps a continuous value (distance to liquidation, time to a deadline, anything your app can normalize) onto the **repetition rate and pitch** of a synthesized sound. A trader can hear *how fast* things are going wrong without looking at the screen. The metaphors are ones people already know: sonar, parking sensor, heartbeat, Geiger counter, hi-lo siren.

| package | what it is |
| --- | --- |
| [`@earcon/core`](packages/core) | pure state machine: hysteresis levels, ETA-based intensity, arbiter. No DOM, no Web Audio |
| [`@earcon/engine-tone`](packages/engine-tone) | Tone.js engine: 28 presets, per-monitor buses (pan/volume), `SynthSpec` interpreter |
| [`@earcon/react`](packages/react) | `NotifierProvider`, `useMonitor`, `useToneNotifier`, headless `UnlockGate` |

Everything is synthesized (no audio files), ESM only, React ≥ 18. Published on npm as
`@earcon/core`, `@earcon/engine-tone` and `@earcon/react` (one shared version).

## Quick start

```sh
bun add @earcon/core @earcon/engine-tone @earcon/react tone react
```

```tsx
import { createToneEngine } from '@earcon/engine-tone'
import { NotifierProvider, UnlockGate, useMonitor } from '@earcon/react'

// Create the engine once, outside render. Tone.js is loaded lazily on unlock.
const engine = createToneEngine()

export function App() {
  return (
    <NotifierProvider engine={engine}>
      {/* Browsers require a user gesture before audio: renders a button until then, nothing after */}
      <UnlockGate.Default />
      <Wallet />
    </NotifierProvider>
  )
}

function Wallet() {
  const { state, update, acknowledge } = useMonitor({
    id: 'wallet-1',
    direction: 'decreasing', // the value shrinking toward 0 is the danger
    levels: [
      { id: 'watch', enter: 0.1, exit: 0.12 }, // enter at 10 % from liquidation, leave at 12 %
      { id: 'warn', enter: 0.05, exit: 0.06 },
      { id: 'critical', enter: 0.02, exit: 0.03 },
    ],
    urgency: { mode: 'eta', eventAt: 0 }, // fold the rate of change into the intensity
  })

  // Call update() whenever a new sample arrives. It is synchronous and cheap.
  useEffect(() => subscribeToDistance((d) => update(d)), [update])

  return (
    <div>
      {state.level ?? 'safe'} · intensity {state.intensity.toFixed(2)}
      {state.eta !== null && ` · eta ${state.eta.toFixed(0)}s`}
      <button onClick={acknowledge}>I know</button>
    </div>
  )
}
```

With the default sounds you get sonar in `watch`, a parking sensor in `warn` and a hi-lo siren in `critical`; the parking sensor goes from one beep per 0.9 s to eleven per second as the intensity rises. Leaving the danger zone plays an "all clear" arpeggio; a monitor whose samples stop plays a knock every 10 s.

## How it works

```
value ──▶ Monitor ──▶ level (with hysteresis) ──▶ continuous sound per level
             │             + intensity 0..1 ──▶ rate / pitch of that sound
             │             + events ──▶ one-shots (escalate, all clear, stale)
             └──▶ velocity, ETA ──▶ intensity gets a "how fast" term
    many monitors ──▶ Arbiter (worst-only / top-n / all) ──▶ which ones actually sound
```

- **Levels** are entered at `enter` and left at `exit`; the gap is the hysteresis. Promotion skips levels; demotion only happens through the current level's `exit`.
- **Intensity** inside a level is the position in the band to the next level. In `eta` mode the ETA (from an EMA of the rate of change) adds a logarithmic term: 8 s to the event is far more urgent than 200 s.
- **Acknowledge** silences a monitor until it escalates (or, with `ackScope: 'until-safe'`, until it is safe again).
- **Stale**: no sample for `staleAfterMs` stops the level sound and knocks until data resumes.
- **Arbiter**: with many monitors, `worst-only` (default) plays the single worst one, ranked by level, then intensity, then id.

## Sounds

`sounds` on the provider (or per monitor) maps level ids to a `SoundSpec`:

```ts
{ kind: 'preset', id: 'heartbeat' }          // one of the 28 presets
{ kind: 'synth', mode: 'continuous', ... }   // a declarative SynthSpec (JSON), see the Sound Designer in the demo
{ kind: 'custom', factory: (ctx) => sound }  // your own Tone.js code
```

28 presets, each a metaphor people already know. Continuous (the level sounds; what changes with intensity):

| id | metaphor | intensity 0 → 1 |
| --- | --- | --- |
| `sonar` | sonar ping | 3 s → 0.7 s apart, slightly higher |
| `parkingSensor` | parking sensor | 0.9 s → 0.09 s apart, fixed pitch |
| `geiger` | Geiger counter | click density (stochastic) |
| `heartbeat` | heart monitor | 55 → 170 bpm |
| `countdown` | countdown | 1 Hz, pitch rises and doubles near the end |
| `hiLoSiren` | hi-lo siren | 1.6 → 4 Hz alternation |
| `redAlert` | red alert | sweep rate 1.2 → 3.5 Hz |
| `stallWarning` | stall warning clicker | noise clicks 6 → 28 Hz |
| `rwrLock` | missile lock-on | beeps 3 → 30 Hz, duty grows until it fuses into one tone |
| `spo2Pulse` | pulse oximeter | fixed 72 bpm, pitch falls 880 → 330 Hz, tremolo in the danger zone |
| `laneDeparture` | lane-departure rumble | low noise bursts 1.2 s → 0.15 s apart |
| `foghorn` | foghorn | long low notes 8 s → 1.5 s apart, 110 → 160 Hz |
| `kettle` | kettle whistle | sustained 2.2 → 3.4 kHz, wobble fades |
| `tickingClock` | ticking clock | even clicks 1 → 8 Hz, accents late |

One-shot (transitions): `bell`, `register`, `coin`, `knock` (stale), `allClear` (back to safe), `buzzer`, `chime`, `sosMorse`, `gong`, `glassBreak`, `powerDown`, `squelch` (data back), `waterDrop`, `latchClick`.

Why these: abstract tones lose half their discriminability as soon as two sound at once, while everyday-sound metaphors hold up; rate is the most robust urgency axis and pitch alone should never carry the message. Sources and the selection rationale are in [ADR-0005](docs/adr/0005-preset-expansion-to-28.md).

## Browser support

Verified automatically in Chromium (Playwright, including the 90-second hidden-tab check). Desktop Firefox and Safari are supported targets but only checked by hand; report what you find. iOS Safari works while the tab is in the foreground; the OS suspends the AudioContext in the background, which no library can prevent. Background tabs on desktop Chromium keep their rate because the clock runs in a worker (Tone.js `Clock`).

## Demo

Live: https://hironow.github.io/earcon/ (deployed from `main` by GitHub Pages).

```sh
just install
just dev        # http://localhost:5173
```

Four sections: Preset Auditioner, Monitor Simulator (scenarios: slow approach, crash, whipsaw, stale), Sound Designer (build a `SynthSpec`, save, export, assign to a level) and Wallets (eight monitors, switch the arbiter policy, try the background-tab procedure). Works on phones, foldables and tablets (44 px touch targets, safe-area aware, hinge-aware on dual-screen devices).

## API

See [docs/api.md](docs/api.md).

## Development

```sh
just            # list tasks
just check      # tsc -b + semgrep + bun test + core coverage gate (≥ 90 %)
just test-e2e   # Playwright (Chromium) against the demo; run `bunx playwright install chromium` once
just build      # tsdown → packages/*/dist
```

| tool | role |
| --- | --- |
| bun ≥ 1.4 | workspaces + catalog, test runner |
| tsdown 0.22 (pinned) | ESM + `.d.ts` build |
| Vite | demo |
| Playwright | real-browser tests |
| Semgrep | keeps `@earcon/core` free of `Date` / `performance` / timers / `window` |
| changesets | releases (`fixed` group, one version for all three packages) |
| just | the only task runner |

Design decisions and deviations from the original spec live in [docs/adr](docs/adr).

## License

MIT
