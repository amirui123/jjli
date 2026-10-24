# Hush

Hush is a browser app that makes ASMR sounds in real time. Nothing is prerecorded: every sound is synthesised from noise, filters, oscillators and random timing, then placed around your head with binaural (HRTF) panning.

It is plain HTML, CSS and JavaScript, with no dependencies and no build step.

> Use headphones. The 3D placement only works when each ear gets its own channel.

## What it can do

### Sounds

| Section | Sound | How it is made |
|---|---|---|
| Ambience | Noise colours | White, pink, brown, grey, blue and violet noise, with tone and slow "waves" |
| | Rain | Poisson-distributed drops over a filtered noise bed |
| | Fire | Brown-noise rumble with heavy-tailed, clustered crackles |
| | Water drops | Impact click plus a rising Minnaert bubble tone |
| Touch and objects | Tapping | Modal synthesis: an impulse exciting three resonators (wood, plastic, glass) |
| | Brushing | Filtered noise with stroke envelopes and spectral sweeps |
| | Squishy | Squeezed filtered noise with bubble pops and sticky micro-clicks |
| | Crinkles and cracks | Crinkly wrapper, cracking ice (dispersive chirps) or snapping twigs |
| Animals | Birds | Repeated motifs of frequency sweeps, whistles and trills |
| | Crickets | Tone pulses; the chirp rate follows Dolbear's law for the chosen temperature |
| | Cat purring | ~25 Hz pulse train in alternating exhale and inhale phases |
| | Frogs | Pulse-gated sawtooth through a throat resonance, with answering croaks |
| Instruments | Singing bowl | Beating inharmonic modes, struck or sung |
| | Kalimba | Tine modes (fundamental and 6.27× overtone), wandering melodies |
| | Harp | Karplus–Strong plucked strings playing rolled chords |
| | Wind chimes | Free-free tube modes struck by gusty wind |
| | Warm pad | Detuned sawtooth chords that glide into each other |
| Mouth and voice | Mouth sounds | Tongue clicks, lip smacks and wet micro-click clusters |
| | Whispering | Noise through a cascade of formant filters, with consonants and speech rhythm; wordless |
| Your sounds | Three slots | Your own audio or video files, analysed in the browser and played as the recording or as a synthesised copy |

### Mixing and listening

- **Placement.** Every sound has a direction, a distance and a movement (still, circling, ear to ear, drifting). Drag the dots on the head map to move sounds.
- **Per-sound controls.** Volume, reverb amount, a high-pass and low-pass filter with a live frequency-response plot, and each sound's own settings.
- **Room.** A shared reverb: small room, bathroom, concert hall or outdoors.
- **Instruments** all play in one key and scale, so any combination fits together.
- **Patterns.** Record a slider movement or generate one (periodic or random shapes) and loop it onto any setting of any sound.
- **Scenes.** Ready-made mixes, your own saved mixes, and share links that carry a whole mix.
- **Surprise me** builds a random, balanced mix; **Chaos mode** builds a new one at a chosen interval.
- **Sleep timer** fades everything out and pauses; **Record** saves what you hear to an audio file.
- **Now playing** lists every sound that is on, with its volume and the patterns moving it.
- **Phones.** Lock-screen play and pause, and the app can be installed and used offline.

The **?** button in the app explains every feature.

## Running it

Open `index.html` in a browser, or, more reliably, serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Press **Start listening**: browsers only allow audio after a click. Installing as an app and offline use need the page to be served over `http(s)`, for example from GitHub Pages; they don't work from a double-clicked file.

It works in current versions of Chrome, Edge, Firefox and Safari.

## Project layout

```
hush/
├── index.html             page markup and the in-app guide
├── css/
│   └── style.css          styles
├── js/                    loaded in this order as plain scripts
│   ├── engine.js          audio context, noise, helpers, per-sound filter, room reverb
│   ├── analysis.js        Your sounds: audio analysis and synthesised copies
│   ├── sounds.js          every sound generator and the music helpers
│   ├── sources.js         sound definitions, voices, the scheduler, audio start-up
│   ├── map.js             the head map: drawing and dragging
│   ├── ui.js              controls, sections, sound cards, Your sounds panel
│   ├── patterns.js        Register pattern and Now playing
│   └── app.js             transport, sleep timer, recording, room, scenes, installable app
├── manifest.webmanifest   makes the page installable as an app
├── sw.js                  service worker: offline use
├── icons/                 app icons
├── docs/
│   └── how-it-works.md    technical guide to the audio engine
├── .nojekyll              tells GitHub Pages to serve the files as they are
└── .gitignore
```

The scripts are ordinary (non-module) scripts sharing one global scope, so the page also runs from a double-clicked file. The technical guide explains the scheduler, every sound, the spatial audio, the analysis of your own files and how to add a new sound: [docs/how-it-works.md](docs/how-it-works.md).

## Publishing on GitHub

The folder is already a git repository with a first commit, so only three steps are left.

**1. Create an empty repository** called `hush` on github.com, without a README, licence or `.gitignore` (the project already has them, and extra files would make the first push conflict).

**2. Push**, from inside the folder:

```bash
git remote add origin https://github.com/<your-username>/hush.git
git push -u origin main
```

With the GitHub CLI (`gh auth login` first), steps 1 and 2 are a single command:

```bash
gh repo create hush --public --source=. --push
```

**3. Turn on GitHub Pages:** in the repository, open **Settings → Pages**, choose **Deploy from a branch**, then the `main` branch and the `/ (root)` folder, and save. After a minute or two the app is live at `https://<your-username>.github.io/hush/`, where it can also be installed as an app.

Later changes follow the usual routine:

```bash
git add .
git commit -m "Describe the change"
git push
```

When you change any script or style, also raise the cache name in `sw.js` (for example `hush-v2` to `hush-v3`), so installed copies drop their old files.

## Privacy and your own recordings

Everything runs in the browser. Files loaded into Your sounds are read on your device, never uploaded, and gone after a reload; the repository contains no recordings. Saved mixes and patterns are kept in the browser's local storage. Share links carry the mix in the part of the address after `#`, which browsers never send to a server.

If you use recordings made by someone else, the synthesised copy option rebuilds the sound from measurements (rhythm, decay, resonances, brightness) without using the recorded audio itself.

## Licence

No licence has been chosen yet, which means others may look at the code but not reuse it. To make it open source, add a `LICENSE` file: on GitHub, **Add file → Create new file**, type `LICENSE` as the name and pick a template. MIT is the common permissive choice; GPL-3.0 requires derivative works to stay open.

## Ideas for next steps

Intelligible whispered speech, by rendering text with a speech model and removing the voicing. Measured HRTFs loaded from SOFA files for more convincing placement near the ears. Head tracking with a phone's motion sensors. Rendering a scene to a file faster than real time with `OfflineAudioContext`.
