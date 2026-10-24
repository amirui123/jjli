<h1 align="center">SFX</h1>

<p align="center">
  <strong>Interface sounds for the web, synthesized with Web Audio. No audio files, zero dependencies.
  <a href="https://bloxwap.github.io/sfx/">Try the sound board</a>.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@bloxwap/sfx"><img alt="npm version" src="https://img.shields.io/npm/v/@bloxwap/sfx?color=blue&style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@bloxwap/sfx"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@bloxwap/sfx.svg?style=flat-square"></a>
  <a href="https://codecov.io/gh/bloxwap/sfx"><img alt="Codecov coverage" src="https://img.shields.io/codecov/c/github/bloxwap/sfx?branch=main&style=flat-square"></a>
  <a href="https://bundlejs.com/?q=@bloxwap/sfx"><img alt="Bundle size" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3D%40bloxwap%2Fsfx&amp;query=%24.size.compressedSize&amp;label=minzipped+size&amp;style=flat-square&amp;color=blue"></a>
</p>

## Features

- **19 sounds.** Hovers, presses, toggles, confirmations, errors, loading, and money moments.
- **Zero files, zero dependencies.** Every sound is a small recipe of oscillators and filtered noise.
- **One node per play.** Each sound is rendered once with an `OfflineAudioContext` and cached. After that, a play is a single `AudioBufferSourceNode`, 5-75× cheaper on the main thread than building the synth graph each time.
- **A mixed output.** One master bus with volume control and a limiter, so overlapping sounds don't clip. Voice stealing and retrigger guards stop sounds from piling up.
- **Declarative binding.** Add `data-sound-*` attributes and call `bind()` once. It uses delegated listeners with no MutationObserver, handles keyboard press and release, skips disabled controls, and returns an unbind function.
- **Safe everywhere.** Importing is SSR-safe. `play()` never throws, and it waits for the browser's first user gesture before touching audio. Audio resumes on its own when the page comes back from the background or an iOS interruption.
- **Native and video export.** The `sfx-wav` CLI and `@bloxwap/sfx/wav` render the same sounds to WAV files for native apps, and `renderTo()` bakes them into a video soundtrack.
- **Tested.** 100% line, branch, and function coverage, including real offline renders of every sound.

## Installation

```sh
npm install @bloxwap/sfx
```

ESM only. Works in all modern browsers, and is a silent no-op on the server.

## Release status

`0.2.1` is an early developer preview; expect breaking changes before `1.0`.

## Usage

Declarative: add attributes, then call `bind()` once.

```html
<button data-sound-press data-sound-release>Save</button>
<a href="/docs" data-sound-hover="tick">Docs</a>
<button role="switch" data-sound-toggle>Dark mode</button>
```

```ts
import { bind } from '@bloxwap/sfx';

const unbind = bind(); // the whole document, including elements added later
```

Imperative: play a sound from your own code.

```ts
import { play, preload, setVolume } from '@bloxwap/sfx';

preload(); // optional: render every sound now so the first play is as cheap as the rest
setVolume(0.6);

try {
  await save();
  play('success');
} catch {
  play('error');
}

play('tick', { volume: 0.5, rate: 1.25, pan: -0.3 });

const loading = new AbortController();
play('loading', { signal: loading.signal });
loading.abort(); // stops this play only; other voices keep going

// A tap: release 90 ms after press, scheduled on the audio clock.
play('press');
play('release', { delay: 0.09 });
```

## React

Optional React 18/19 bindings live at `@bloxwap/sfx/react`: `useBindSounds(ref, options)`,
`useSound(name, options)`, `useSoundPreference()`, and `<SoundProvider enabled volume>`.
Mute and volume preferences persist in localStorage and synchronize across tabs. The core bundle
has no React imports. See the [React guide](https://bloxwap.github.io/sfx/docs/guides/react/).

## Attributes

| Attribute            | Plays on                         | Default sound |
| -------------------- | -------------------------------- | ------------- |
| `data-sound-hover`   | mouse `pointerenter`             | `chime`       |
| `data-sound-press`   | primary `pointerdown`, Enter/Space down | `press` |
| `data-sound-release` | primary `pointerup`, Enter/Space up     | `release` |
| `data-sound-toggle`  | `click` (including keyboard)     | `toggle`      |

Set the value to a sound name to choose a different sound (`data-sound-hover="tick"`). Hover sounds
play only for a mouse on a fine pointer, at most one every 150 ms. Controls that are disabled,
`aria-disabled="true"`, or `inert` stay silent.

## Sounds

| Sound | Character | Good for |
| --- | --- | --- |
| `chime` | soft rising two-note bell | default hover |
| `sparkle` | quick four-note twinkle | playful accents |
| `droplet` | single note gliding down | dismiss, collapse |
| `bloom` | warm slow swell | reveal, expand |
| `whisper` | breathy quiet texture | dense lists |
| `tick` | crisp instant tick | navigation hover |
| `press` | dull muted knock | pointer down |
| `release` | bright springy tick | pointer up |
| `toggle` | mechanical click-clack | switches, tabs |
| `success` | warm three-note confirmation | completed actions |
| `error` | soft descending refusal | recoverable errors |
| `page` | papery flick and glass tick | pages, carousels |
| `loading` | brief unresolved rise | work starting |
| `ready` | focus tick and open fifth | content ready |
| `payout` | deep two-stage coin | payouts, rewards |
| `deposit` | wide metallic shimmer | deposits, credits |
| `pluck` | tight falling pluck | pickups, selections |
| `notification` | bright physical bell | messages, activity |
| `loss` | heavy two-stage fall | losses, negative outcomes |

## API

```ts
import {
  play, preload, bind, unlock, define,
  setEnabled, isEnabled, setVolume, getVolume, configure,
  stopAll, activeVoices, getOutput, dispose,
  renderTo, renderBuffer,
  sounds, isSound, duration,
  type SoundName, type PlayOptions, type BindOptions, type EngineOptions, type RenderOptions,
} from '@bloxwap/sfx';
```

| Function | Description |
| --- | --- |
| `play(name = 'chime', options?)` | Plays a sound now. `options`: `volume` (0-2), `rate` (0.25-4), `pan` (-1 to 1), `delay` (seconds, 0-10), `minInterval` (ms, overrides `configure()`), `force` (skip the user-gesture check), `signal` (AbortSignal that stops this play only). Never throws. |
| `define(name, recipe)` | Registers or replaces an immutable custom recipe. Built-in names are reserved. Invalid data throws `RangeError`. |
| `preload(names?)` | Renders sounds (all of them by default) to buffers. Safe to call before any user gesture. |
| `bind(root = document, options?)` | Wires `data-sound-*` attributes under `root`. Returns `unbind()`. Options: `keyboard`, `hoverInterval`. |
| `unlock()` | Creates and resumes audio from inside a gesture. `bind()` calls it on the first press. |
| `setEnabled(on)` / `isEnabled()` | Global mute. Sounds already playing finish. |
| `setVolume(0-1)` / `getVolume()` | Master volume, with a short glide to avoid clicks. |
| `configure({ maxVoices, minInterval, resume })` | Voice cap (default 24), per-sound retrigger guard (default 16 ms), and what `play()` does while audio is suspended: `'queue'` (default) or `'eager'`. |
| `stopAll()` / `activeVoices()` | Stops every playing sound / counts them. |
| `getOutput()` | The last node before the speakers, for an `AnalyserNode` or a recorder. |
| `dispose()` | Closes the audio context, removes its page listeners, and clears caches. |
| `renderTo(context, name, options?)` | Schedules a sound onto any `BaseAudioContext`, such as an `OfflineAudioContext`. `options`: `volume`, `rate`, `pan`, `delay`, `destination`. Returns `false` instead of throwing. |
| `renderBuffer(name, { sampleRate }?)` | Renders one sound to a new stereo `AudioBuffer` (3000-768000 Hz). Resolves `null` if it can't. |
| `sounds` / `isSound(value)` / `duration(name)` | The catalog, a type guard, and each sound's length in seconds. |

Define custom sounds with `define('coin', { level: 0.6, layers: [{ wave: 'sine', freq: 880, at: 0, attack: 0.006, decay: 0.15, peak: 0.2 }] })`. Then `play('coin')` and `data-sound-press="coin"` use the recipe.

The raw recipe data is available from `@bloxwap/sfx/recipes`.

With the default `resume: 'queue'`, sounds requested while the audio context is suspended play once it
resumes, and requests older than 250 ms are dropped. `'eager'` schedules them at once for the lowest
latency, at the cost of stacking up during a long suspension. The engine also resumes the context when
the page becomes visible, is shown, or regains focus, as long as it has had a user gesture.

### Category volume and reduced-motion preferences

```ts
import { configure, setVolume, getVolume, play } from '@bloxwap/sfx';

configure({ respectReducedMotion: true }); // opt-in startup master volume of 0.5
setVolume(0.8);                           // an explicit master setting takes priority
setVolume(0.4, { category: 'hover' });
setVolume(0.7, { category: 'money' });
getVolume({ category: 'hover' });          // 0.4
play('tick', { category: 'hover' });       // override its default control group
```

The defaults match the sound board: hover/ambience, controls, feedback and money. Every category
starts at 1; category volume multiplies the per-play volume before the shared master volume.
Category changes affect subsequent plays; sounds already playing finish at their original gain.
Custom sounds default to feedback. `categoryOf(name)`, `categories` and `soundCategories` expose
the group assignments. Offline exports ignore preference and category volumes.

Reduced-motion handling is off by default. Call `configure({ respectReducedMotion: true })`
before setting a master volume to start at 0.5 when `prefers-reduced-motion: reduce` matches.
An explicitly chosen master volume is preserved. This is a startup preset; it does not track
later media-query changes or override a user's volume choice.

## WAV export and native apps

Render the same sounds to WAV files for iOS, Android, or desktop apps. The CLI needs the optional peer
dependency `node-web-audio-api`:

```sh
npm install --save-dev @bloxwap/sfx node-web-audio-api
npx sfx-wav --out assets/sfx --sounds tick,toggle,success --combo tap=press@0,release@0.09 --trim
```

| Flag | Default | |
| --- | --- | --- |
| `--out <dir>` | `./sfx` | Output directory |
| `--sounds <a,b,c>` | all | Sounds to render (`""` for only combos) |
| `--sample-rate <hz>` | `48000` | 3000-768000 |
| `--bit-depth <16\|24\|32>` | `16` | 16/24-bit PCM or 32-bit float |
| `--channels <1\|2>` | `2` | Mono is an average of both channels |
| `--trim` | off | Cut the tail below -60 dB, keeping 20 ms |
| `--combo <name=sound@s,...>` | | Mix sounds into one file (repeatable) |

It exits with 0 on success, 1 when rendering or writing fails, and 2 for bad flags.

The encoder is also a separate, dependency-free entry point that works on any `AudioBuffer`:

```ts
import { renderBuffer } from '@bloxwap/sfx';
import { encodeWav, trimSilence } from '@bloxwap/sfx/wav';

// In a browser. In Node, use renderTo() with node-web-audio-api's OfflineAudioContext.
const buffer = await renderBuffer('success', { sampleRate: 44100 });
if (buffer) {
  const wav = encodeWav(trimSilence(buffer), { bitDepth: 24, channels: 1 }); // an ArrayBuffer
  const file = new Blob([wav], { type: 'audio/wav' });
}
```

`encodeWav(buffer, { bitDepth: 16 | 24 | 32, channels: 1 | 2 })` throws a `RangeError` for an invalid
format. `trimSilence(buffer, { thresholdDb = -60, padMs = 20 })` cuts the tail relative to the peak.
See [Native apps and WAV export](https://bloxwap.github.io/sfx/docs/guides/native/), which also covers
baking sounds into a video soundtrack.

## Documentation

Guides, the full API reference, and a live sound board: **https://bloxwap.github.io/sfx/**

## Development

This repository is an npm workspace: the library lives in [`packages/sfx`](packages/sfx) and the
documentation site, with its live sound board, in [`apps/docs`](apps/docs).

```sh
npm ci
npm test            # build and run the test suite
npm run coverage    # tests with 100% line, branch, and function coverage enforcement
npm run bench       # play() cost: live synthesis vs. pre-rendered buffers
npm run size        # gzip bundle-size budget
npm run dev         # docs and sound board at http://localhost:3903
```

Type checking and the library build go through
[`packages/sfx/scripts/tsc-or-tsrs.mjs`](packages/sfx/scripts/tsc-or-tsrs.mjs). It runs
[`tsrs`](https://github.com/oxc-project/tsrs), a Rust port of the TypeScript 7 compiler with
byte-identical output, where tsrs ships a native binary (macOS on Apple Silicon, Linux x64/arm64),
and falls back to the regular `tsc` automatically everywhere else (Windows, Intel Mac), so every
command above works on any platform. It logs which compiler it used. To force `tsc`, set
`TYPECHECK=tsc` or run the aliases:

```sh
npm run build:tsc       # library build with tsc
npm run typecheck:tsc   # build plus test/bench/script type check with tsc
npm run docs:check:tsc  # docs type check with tsc
```

Requires Node.js 24 or newer. CI runs on self-hosted Apple Silicon Mac minis; see
[docs/ci-runners.md](docs/ci-runners.md) for the runner labels and tools.

Releases publish to npm from GitHub Actions with the org-level `NPM_TOKEN` secret when a GitHub
release tagged `v<version>` is created. Self-hosted runners cannot use npm trusted publishing, so
releases do not attach provenance. See [Releasing](https://bloxwap.github.io/sfx/docs/releasing/).

## License

[MIT](LICENSE)
