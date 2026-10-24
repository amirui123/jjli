# Two-person podcast

A podcast segment: a host and a guest (two ElevenLabs voices) alternate on one conversation track, with an
intro music bed under the welcome, an outro bed that swells in under the last line, and chimes at the open and
the close.

What it demonstrates:

- **one speech track for a dialogue**, with a `speaker` per cue: turns are sequential, so they can never
  collide, and each `pause` sets the gap before the next turn;
- a speakers registry with subtitle labels (`Host`, `Guest`) and a configured provider instance
  (`providers.elevenlabs`: model, concurrency, shared voice settings);
- a `caption` override: the guest says "minus sixteen LUFS", the subtitles show "-16 LUFS";
- a two-clip music track: a looping intro bed that ends 1.5 s after the welcome (`end_relative`), and a
  9-second outro bed that starts 1.5 s before the last line ends (`after_cue` with a negative offset);
- chimes anchored to speech: one that ends 300 ms before the welcome (`before_cue`), one 600 ms after the
  sign-off;
- ducking at -18 dB with a slower 600 ms release, the `podcast` loudness preset (-16 LUFS, -1 dBTP), a
  192 kbps MP3, VTT/SRT/JSON subtitles and a manifest.

## Requirements

`ELEVENLABS_API_KEY` in the environment. To render locally instead, run Kokoro-FastAPI
(`docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest`) and change both speakers to
`provider: kokoro` with Kokoro voices, for example `am_michael` (host) and `af_heart` (guest).

## Run

```bash
soniccraft validate examples/two-person-podcast/timeline.yaml
soniccraft plan     examples/two-person-podcast/timeline.yaml   # dry run: estimated layout, characters to bill
soniccraft render   examples/two-person-podcast/timeline.yaml
```

Outputs, next to the timeline: `podcast.mp3`, `podcast.vtt`, `podcast.srt`, `podcast.words.json` and
`podcast.manifest.json`.

## Assets

Royalty-free: synthesized from scratch by
[`scripts/generate-example-assets.sh`](../../scripts/generate-example-assets.sh).

| File | Content |
|---|---|
| `assets/audio/synthwave_loop.wav` | 8 bars of 2/4 at 120 BPM (Am-F-C-G), pumping detuned pad over an eighth-note octave bass; exactly 8.000 s, 48 kHz stereo 16-bit, loops seamlessly |
| `assets/sfx/chime.wav` | 1.5 s mono two-note bell chime (E5, then A5) |
