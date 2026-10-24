# SFX Mo 🔊

Procedural sound effects studio — every sound is synthesized live in your browser with the Web Audio API. No samples, no audio files, 100% code.

## 8 sound categories

| Sound | Synthesis |
|-------|-----------|
| 🖱️ **Click** | Band-passed noise snap + triangle body |
| 🫧 **Pop** | Sine with dropping pitch envelope + noise wetness |
| 🌪️ **Whoosh** | Looped noise through sweeping bandpass filter |
| ⌨️ **Keypress** | Low sine thock + highpassed click transient |
| 💥 **Impact** | Sub sine boom with pitch drop + lowpassed punch |
| 📈 **Riser** | Sawtooth sweep + filtered noise, building to the drop |
| 🔔 **Ding** | FM synthesis bell (carrier + modulator) |
| ⚡ **Zap** | Square wave pitch dive through waveshaper grit |

## Features

- **Tweak** — 3 parameters per sound, live preview on every slider move
- **🎲 Surprise me** — randomize parameters for happy accidents
- **⬇ WAV** — export 44.1kHz 16-bit WAV (rendered offline, trimmed)
- **Waveform** — live visualization of the generated sound
- **EN / 中** — language toggle

## Tech

Single `index.html`, vanilla JS + Web Audio API, zero dependencies. OfflineAudioContext for WAV rendering. Dela Gothic One display type, OpenX house style.

## Demo

https://artzdesignmo.github.io/sfx-mo/

## License

MIT
