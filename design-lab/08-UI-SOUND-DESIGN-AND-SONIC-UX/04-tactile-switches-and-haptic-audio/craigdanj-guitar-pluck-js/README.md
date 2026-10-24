# String Pluck JS

A dependency-free browser instrument built with the Web Audio API. `string-pluck.js` implements a Karplus–Strong plucked string; `index.html` is a responsive, playable demo.

## Try it

Put `index.html` and `string-pluck.js` in the same folder and open `index.html` in a modern browser. Click a string or press 1–6; press Space to strum. Audio starts after a user interaction, as browsers require.

## Use it in a page

```html
<script src="string-pluck.js"></script>
<button id="play">Pluck A</button>
<script>
  const stringPluck = new StringPluck({ decay: 2.4, brightness: 0.7 });
  document.querySelector('#play').addEventListener('click', async () => {
    await stringPluck.resume();
    stringPluck.pluck(110); // A2, 110 Hz
  });
</script>
```

`new StringPluck({ context?, destination?, attack?, decay?, brightness?, damping?, pickPosition?, volume? })` accepts an optional existing `AudioContext` and destination node. `pluck(frequency, velocity = 1, overrides = {})` plays a note and returns its voice; `setParams({...})` updates subsequent plucks; `stopAll()` silences active voices; `dispose()` releases nodes and closes the context only if the plugin created it. Values are clamped to safe ranges. Frequency must be 40–2000 Hz.

| Parameter | Range | Default | Effect |
| --- | --- | --- | --- |
| `attack` | 0.001–0.5 s | 0.008 | Fade-in time |
| `decay` | 0.15–8 s | 2.2 | Approximate sustain length |
| `brightness` | 0–1 | 0.65 | Excitation noise and low-pass cutoff |
| `damping` | 0–1 | 0.28 | High-frequency loss in the feedback loop |
| `pickPosition` | 0.05–0.5 | 0.22 | Pluck location along the string |
| `volume` | 0–1 | 0.7 | Note level |

The plugin generates a short buffer for every pluck. It is suited to interactive demos and modest polyphony; very long decays and heavy polyphony increase CPU and memory use. This synthesizes a string rather than using guitar samples, so it does not model a guitar body, fret noise, or realistic articulation.
