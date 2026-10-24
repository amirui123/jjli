# Offline demo (zero API keys)

The README's three-turn exchange rendered with local voices only: no API keys, no network, no cost.

| File | Voices | Runs on |
|---|---|---|
| `timeline.yaml` | macOS `say` (`Samantha`, `Daniel`) + the built-in `mock` voice for the sign-off | macOS |
| `timeline.mock.yaml` | the deterministic `mock` voice for every speaker | any OS (used by CI) |

What it demonstrates: the same layout as the [tech briefing](../tech-briefing) (`cue_03` pushed after
`cue_02`), a speakers registry with subtitle labels, a ducked open-ended bed with an automatic fade-out tail,
sound effects anchored to speech (an impact after `cue_03`, a chime after the sign-off), a -16 LUFS 16-bit
WAV master, every subtitle format (VTT, SRT, JSON word timings, HyperFrames transcript) and a manifest.

## Run

```bash
# macOS
soniccraft plan   examples/offline-demo/timeline.yaml               # layout, ducking regions, diagram
soniccraft render examples/offline-demo/timeline.yaml --preview     # adds offline-demo.preview.html

# any OS
soniccraft render examples/offline-demo/timeline.mock.yaml
```

Outputs, next to the timeline: `offline-demo.wav` (or `offline-demo-mock.wav`), `.vtt`, `.srt`,
`.words.json`, `.transcript.json` and `.manifest.json`. Open the preview HTML in a browser to see the
waveform, the bed's ducking envelope and the captions while it plays.

Rendering twice gives byte-identical files (the second run is served from the TTS cache in
`examples/offline-demo/.soniccraft/cache`).

To caption a HyperFrames video with this audio:

```bash
npx hyperframes transcribe examples/offline-demo/offline-demo.transcript.json --dir my-video
```

and play `offline-demo.wav` in the composition with `data-start="0"`.

## Assets

Royalty-free: synthesized from scratch by
[`scripts/generate-example-assets.sh`](../../scripts/generate-example-assets.sh).

| File | Content |
|---|---|
| `assets/audio/synthwave_loop.wav` | 8 bars of 2/4 at 120 BPM (Am-F-C-G), pumping detuned pad over an eighth-note octave bass; exactly 8.000 s, 48 kHz stereo 16-bit, loops seamlessly |
| `assets/sfx/whoosh.wav` | 1.2 s stereo swept band-pass noise, panning left to right, peaking at 0.85 s |
| `assets/sfx/impact.wav` | 2.0 s mono cinematic hit: pitch-dropping sub boom, noise transient, low rumble |
| `assets/sfx/chime.wav` | 1.5 s mono two-note bell chime (E5, then A5) |
