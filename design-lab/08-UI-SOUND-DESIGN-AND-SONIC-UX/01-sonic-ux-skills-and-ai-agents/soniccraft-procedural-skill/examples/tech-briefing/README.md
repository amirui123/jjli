# Tech briefing (the README timeline)

A three-turn briefing: a narrator on ElevenLabs and a guest on a local Kokoro server, over a looping
synthwave bed that ducks under both voices, with a whoosh at the top. This is the timeline walked through in
the [main README](../../README.md#how-soniccraft-works).

What it demonstrates:

- an explicit relative anchor: `cue_02` starts 150 ms after `cue_01` ends;
- the default `push` overlap policy: `cue_03` is sequential (350 ms after `cue_01`), would collide with
  `cue_02`, and is moved to 350 ms after `cue_02` ends (info `cue_pushed`);
- a cloud and a local provider in one timeline, matched by per-cue loudness normalization;
- an open-ended bed (`loop: true`, no length) whose `fade_out_ms` becomes the tail after the last word;
- sidechain ducking (-18 dB, 80 ms attack and lookahead, 350 ms release), subtle stereo placement;
- a -16 LUFS / -1 dBTP master as a 320 kbps MP3, with WebVTT and SRT subtitles.

## Requirements

- `ELEVENLABS_API_KEY` in the environment (cues `cue_01` and `cue_03`).
- A Kokoro-FastAPI server for `cue_02` (`local_kokoro` is an alias of the built-in `kokoro` provider):
  `docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest`, or set `KOKORO_BASE_URL`. `validate`
  and `plan` probe it and report `provider_unavailable` ("no Kokoro-FastAPI server answered at ...") until it
  answers.

No keys? [`../offline-demo`](../offline-demo) is the same exchange with local voices.

## Run

```bash
soniccraft validate examples/tech-briefing/timeline.yaml
soniccraft plan     examples/tech-briefing/timeline.yaml    # dry run: layout and cost, no API calls
soniccraft render   examples/tech-briefing/timeline.yaml
```

Outputs, next to the timeline: `timeline.mp3`, `timeline.vtt`, `timeline.srt` (the timeline sets no
`output.path`, so files are named after the timeline). Add `--preview` for `timeline.preview.html`.

## Assets

Royalty-free: synthesized from scratch by
[`scripts/generate-example-assets.sh`](../../scripts/generate-example-assets.sh).

| File | Content |
|---|---|
| `assets/audio/synthwave_loop.wav` | 8 bars of 2/4 at 120 BPM (Am-F-C-G), pumping detuned pad over an eighth-note octave bass; exactly 8.000 s, 48 kHz stereo 16-bit, loops seamlessly |
| `assets/sfx/whoosh.wav` | 1.2 s stereo swept band-pass noise, panning left to right, peaking at 0.85 s |
