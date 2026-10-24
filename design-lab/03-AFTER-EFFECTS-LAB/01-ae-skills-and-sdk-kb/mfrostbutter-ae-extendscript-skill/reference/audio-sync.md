# Syncing AE animation to a sound effect

The goal: visuals land exactly on the audio transients (e.g. one keystroke per typed character, a sparkle on a ding).

## Sourcing SFX on demand (ElevenLabs)

When there is no recording to use, generate the effect from the ElevenLabs **text-to-sound-effects** API.

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"smooth cinematic UI whoosh transition, soft airy swoosh, clean modern tech","duration_seconds":1.3,"prompt_influence":0.45}' \
  -o whoosh.mp3
```

- `duration_seconds` 0.5–30; `prompt_influence` 0–1 (~0.45 follows the prompt without going harsh). Response is `audio/mpeg`. On error the body is JSON, not audio — `head -c 4 file | grep '{'` to detect.
- AE imports MP3, but convert to WAV to keep the pipeline uniform and loudness-matched: `ffmpeg -i whoosh.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 whoosh.wav`.
- Prompt patterns that land: transitions → "smooth/fast digital swoosh transition, airy, crisp, futuristic"; confirmations → "clean soft UI chime, single bright digital bell, premium tech, short". Keep prompts short and concrete.
- Generate **2–3 variants per slot** (vary the prompt), audition, wire the winner, keep the rest in `sfx/options/`. Same `duration_seconds` yields the same MP3 byte size for different takes — that is NOT a duplicate; confirm with `md5sum`.
- **The API key is a secret.** Read `ELEVENLABS_API_KEY` from your environment or a secrets manager; never write it to a tracked file, and scrub any temp copy after use.

## 1. Make it importable

After Effects imports **WAV / AIFF / MP3 / AAC (m4a)**. It does **not** import Opus (`.opus`) or FLAC. Convert first:

```bash
ffmpeg -i in.opus -ar 48000 -ac 2 -c:a pcm_s16le out.wav
```

## 2. Find the transient onsets

Each `silence_end` reported by `silencedetect` is the start of a sound (a keystroke, a hit, a ding):

```bash
ffmpeg -hide_banner -nostats -i sound.wav \
  -af "silencedetect=noise=-38dB:d=0.035" -f null - 2>&1 | grep silence_
```

- Lower `noise` (e.g. `-45dB`) to catch quieter hits; raise it to ignore room noise.
- Lower `d` (min silence, e.g. `0.02`) to split fast adjacent hits; raise it to merge.
- A long `silence_end → next silence_start` span is a sustained sound (a ding/bell), not a click.

Record the in-file onset of each event you'll align to (first hit, last hit, enter, ding) — these become CONFIG constants.

## 3. Import + place in the script

```javascript
function importAudio(path) {
  var f = new File(path);
  if (!f.exists) return null;
  try { return app.project.importFile(new ImportOptions(f)); } catch (e) { return null; }
}
var item = importAudio(dir + "sound.wav");
if (item) {
  var L = comp.layers.add(item);   // audio-only footage adds as an AV layer
  L.name = "sfx";
  L.startTime = eventTime - onsetInFile;   // shift so the in-file onset lands on eventTime
}
```

`layer.startTime` shifts the whole clip; a negative value is allowed (only the part inside the comp plays).

## 4. Lock the animation to the recording

When the visual cadence should match the audio (e.g. one keystroke per typed character):

- Align the first transient to the first visual event: `startTime = typeStart - firstHitInFile`.
- Derive the per-step interval from the recording instead of guessing:
  `typeInterval = (lastHitInFile - firstHitInFile) / (stepCount - 1)`.
- With the `+1` reveal (`n = floor((t-ts)/iv)+1`), step _i_ shows at `ts + (i-1)*iv`, so the first and last steps line up with the first and last transients and the interior drift is imperceptible across a fast burst.

This couples the take to the step count: a keystroke recording with 14 hits matches a 14-character string. If the string length changes, re-record or disable the lock.

## 5. Place dependent beats by their in-file offset

A second sound's later transient is positioned relative to where you anchored it:

```
enter stroke aligned to the "]" pop  =>  startTime = popTime - enterHitInFile
ding rings at                            dingTime = popTime - enterHitInFile + dingInFile
```

Use `dingTime` to trigger a visual (a sparkle, a flash) exactly on the ding.

## 6. Render

Enable **Audio Output On** in Output Module settings, or the rendered file is silent. For a transparent background use an alpha codec (ProRes 4444 / PNG sequence) — audio still muxes into ProRes; for a PNG sequence render audio separately or use a movie format.
