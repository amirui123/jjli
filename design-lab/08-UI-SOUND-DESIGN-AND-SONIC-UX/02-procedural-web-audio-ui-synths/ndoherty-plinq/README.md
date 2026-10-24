# plinq

Dependency-free library for creating programmatic UI sounds. Inspired by [Sounds on the Web](https://www.userinterface.wiki/sounds-on-the-web) by Raphael Salaja.

[Docs & Playground](https://plinq.dev)

## Install

```bash
npm install plinq
```

```bash
pnpm add plinq
```

```bash
yarn add plinq
```

```bash
bun add plinq
```

## Quick Start

```ts
import { pop } from "plinq";

pop();
```

## Presets

| Preset      | Description                           |
| ----------- | ------------------------------------- |
| `click()`   | Short, percussive click               |
| `pop()`     | Downward pitch glide                  |
| `toggle()`  | Two-note switch sound                 |
| `tick()`    | High-pitched tick                     |
| `drop()`    | Descending pitch drop                 |
| `success()` | Ascending three-note chord (C5–E5–G5) |
| `error()`   | Dissonant two-note buzz               |
| `warning()` | Single-note warning tone              |

## Options

Every preset accepts an optional `PresetOptions` object:

```ts
import { success } from "plinq";

success({ volume: 0.5, pitch: "high" });
```

| Option   | Type                                 | Default | Description                                                                               |
| -------- | ------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `volume` | `number`                             | `1`     | Volume from 0 to 1                                                                        |
| `pitch`  | `'low' \| 'mid' \| 'high' \| number` | `'mid'` | Pitch multiplier — `'low'` = 0.8x, `'mid'` = 1x, `'high'` = 1.3x, or pass a custom number |

## Custom Sounds

Use `play()` to define your own sounds:

```ts
import { play } from "plinq";

play({
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 440,
        frequencyEnd: 220,
      },
      envelope: { attack: 0.001, decay: 0.15 },
      gain: 0.3,
    },
  ],
});
```

Each layer supports oscillator or noise sources, an optional biquad `filter`, an `envelope` with attack/decay, `gain`, and an optional `delay` (in seconds) to stagger layers.

## API

### `play(config: SoundConfig, options?: PresetOptions): void`

Play an arbitrary sound configuration.

### `getContext(): AudioContext`

Returns the shared `AudioContext`, lazily creating one if needed.

### `setContext(userCtx: AudioContext): void`

Provide your own `AudioContext` to share with other audio in your app.

### Type Exports

`SoundConfig`, `LayerConfig`, `Source`, `OscillatorSource`, `NoiseSource`, `WaveformType`, `FilterConfig`, `EnvelopeConfig`, `PresetOptions`

## Browser Notes (Safari)

Safari requires audio playback to originate from a user interaction (e.g. `click`, `pointerdown`, `keydown`). plinq handles `AudioContext` creation, suspension, and resumption automatically — including after tab and app switches.

If you run into Safari-specific audio issues, please [open an issue](https://github.com/ndoherty-xyz/plinq/issues).

## License

MIT
