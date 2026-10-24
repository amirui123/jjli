# 07 — SONIC UX, PSYCHOACOUSTICS & WEB AUDIO MICRO-INTERACTIONS DOCTRINE

> **Vault Pillar:** `08-UI-SOUND-DESIGN-AND-SONIC-UX` (42 Curated Repositories across 4 Engineering Sub-Pillars)  
> **Target Application:** Persian RTL Motion Lab (`https://amirui123.github.io/jjli/`) — Landing (`#/`), Dashboard (`#/dashboard`), and 7 Interactive Studios (`#/studio/*`, especially `SoundStudio.tsx`).  
> **Core Mandate:** Zero external MP3 bloat for core UI chrome; 100% deterministic, click-free, psychoacoustically tuned Web Audio API synthesis + CC0 reference packs + multimodal Haptic-Motion synchronization.

---

## 1. Scientific & Psychoacoustic Foundations of Interface Sound

Every micro-interaction sound in a world-class interface is governed by measurable laws of human auditory perception and physics:

### 1.1 Neuro-Temporal Asymmetry (Why Sound Makes UI Feel Instant)
1. **Auditory vs. Visual Reaction Time:** Human auditory cortex processes transient onsets in **8–10 ms**, whereas primary visual cortex requires **20–40 ms** (Bhatara 2025; Buxton, Gaver & Bly). Pairing a crisp `4–10 ms` acoustic transient with a button press makes the visual frame render feel **2× faster and physically solid**.
2. **Echoic vs. Iconic Memory:** Visual iconic memory decays in **250–500 ms**, whereas auditory echoic memory persists for **2–4 seconds**. A brief two-note confirmation arpeggio (`120–240 ms`) anchors task completion in working memory without requiring the user's eyes to stay fixed on a toast or status badge.
3. **Temporal Binding Window (TBW) & Stimulus Onset Asynchrony (SOA):**
   - For simple UI transients (clicks, snaps, toggles), humans detect audio-visual desynchronization when sound lags visual contact by **> 40 ms** or leads by **> 15 ms** (Vatakis & Spence; Apple WWDC *Designing Sound*).
   - **Rule:** Trigger `press` sound synchronously inside `pointerdown` / `keydown` (`t = ctx.currentTime`, `0 ms` lag), never inside delayed `click` or async promise callbacks. Reserve outcome cues (`confirm`, `success`, `error`) for the exact frame the state resolves.

### 1.2 Equal-Loudness Contours (ISO 226:2003 / Fletcher-Munson) & Device Physics
1. **Peak Ear Sensitivity (`1–5 kHz`):** The human ear canal resonates between **2,000 Hz and 5,000 Hz** (speech consonants). At quiet desktop/mobile listening levels (`40–55 phon`), a `3,000 Hz` tone sounds dramatically louder than a `150 Hz` tone of identical amplitude.
   - **Rule:** Never place loud, unattenuated pure square/sawtooth waves in the `2.5–4.5 kHz` band—they cause immediate **auditory fatigue**. Always tame `>2 kHz` energy with a low-pass/band-pass filter or rapid exponential decay (`< 35 ms`).
2. **The Laptop & Smartphone Speaker Cutoff (`300 Hz` Rule / "Teacup Rule"):**
   - Micro-speakers in phones and ultra-thin laptops roll off sharply below **250–300 Hz**. A fundamental at `110 Hz` is inaudible unless accompanied by **upper harmonics (`220 Hz`, `330 Hz`, `440 Hz`)** so the brain reconstructs the missing fundamental via virtual pitch perception.
3. **The Haas Precedence Effect (`5–30 ms` Fusion Window):**
   - Two transients separated by **5–30 ms** fuse into a single spatial event localized toward the first arrival (Helmut Haas, 1949); transients separated by **> 35 ms** are heard as two distinct events (e.g., Andy Farnell's realistic physical switch: plastic actuator contact at `t = 0 ms` followed by metal leaf snap at `t = +10 to +18 ms`, and release click at `t = +65 to +90 ms`).

### 1.3 Cross-Modal Correspondences & The Bouba/Kiki Law in UI
Research by Köhler (1929), Ramachandran & Hubbard (2001), and Spence shows universal cross-modal mappings between visual geometry, motion springs, and acoustic spectra:
- **Bouba (Soft, Rounded `border-radius: 9999px`, Under-damped Gentle Springs, Fluid/Organic):**
  - **Waveform:** Pure `sine` or warm `triangle` wave.
  - **Envelope:** Soft linear attack (`8–15 ms`), smooth exponential release (`80–180 ms`).
  - **Spectrum:** Low spectral centroid (`400–1,200 Hz`), low-pass filtered (`cutoff < 1,400 Hz`).
- **Kiki (Sharp `border-radius: 4–6px`, Crisp High-Stiffness Springs, Precision Technical Chrome):**
  - **Waveform:** Bandpass-filtered pink noise burst + high-Q modal partials or FM transient.
  - **Envelope:** Sub-millisecond/2ms attack (`0.5–2 ms`), ultra-tight exponential decay (`12–45 ms`).
  - **Spectrum:** Higher spectral centroid (`1,800–4,200 Hz`), high Q (`Q = 3.0–8.0`).

---

## 2. Physical Modeling & Harmonic Architecture of a Coherent UI Sound Kit

### 2.1 One Key + One Material (`plausibleventures/foley` & `romainsimon/uisfx` Law)
A random folder of downloaded `.mp3` files sounds broken because every file is in a different musical key and implies a different physical object. A world-class UI sound system defines **all cues relative to a single root pitch ($f_{\text{root}}$, e.g. `C5 = 523.25 Hz` or `A4 = 440 Hz`) and a single physical material voicing**:

| Material Voicing | Overtonal Partial Ratios ($f_k / f_0$) | Physical & Acoustic Reason | Best UI Personality |
| :--- | :--- | :--- | :--- |
| **Glass (`glass`)** | `1.0 : 2.00 : 3.00` | Pure harmonic integer multiples; ear fuses partials into a crystalline, luminous tone. | Luxury, Fintech, Obsidian + Gold Chrome |
| **Wood (`organic`)** | `1.0 : 2.40 : 3.90` | Euler-Bernoulli free-free bar modes (marimba/xylophone); warm, dry, short decay. | Craft Workbenches, Editorial, Calm Tools |
| **Metal / Bell (`crisp`)** | `1.0 : 2.756 : 5.404` | Exact bending-wave modes of a metal rod/bell; inharmonicity reads as struck precision metal. | Pro DevTools, Linear-style Precision UI |
| **Rubber / Soft (`soft`)** | `1.0` (single sine + downward pitch glide) | Over-damped elastomer; zero upper partials, feels like a soft thumb pad on matte surface. | Mobile-first, Consumer Apps |
| **Vapour / Aero (`aero`)** | `1.0 : 2.00` + `50 ms` attack + pink noise air | Slow onset erases mechanical impact; reads as spatial air movement. | Ambient Transitions, Drawer/Sheet Reveals |

### 2.2 Melodic Contour Semantics (Brewster's Earcons + Gaver's Auditory Icons)
Users decode pitch direction pre-attentively without musical training:
- **Affirmative / Constructive (`confirm`, `success`, `toggle-on`, `open`, `expand`):**
  - **Rising pitch contour:** Perfect fifth (`0 → +7 semitones`, ratio `1.0 → 1.498`) for quick confirms; ascending major triad (`0 → +4 → +7 → +12 semitones`) for major completions.
- **Negative / Destructive / Refusal (`error`, `invalid-drop`, `reject`):**
  - **Falling dissonant contour:** Descending minor second (`+1 → 0 semitones`) or tritone (`+6 → 0 semitones`), low-pass filtered (`< 1,200 Hz`) so it communicates refusal clearly without startling the user.
- **Advisory / Caution (`warning`, `stale`):**
  - **Repeated neutral pitch:** Mid-range (`550–650 Hz`) double pulse at constant pitch (`0 → 0 semitones`, `80 ms` on, `80 ms` gap).
- **Reversible Spatial Pairs (`open`/`close`, `expand`/`collapse`, `toggle-on`/`toggle-off`, `press`/`release`):**
  - Exact pitch/filter inversion: `press` sits a fourth lower (`-5 semitones`, darker cutoff `0.8×`) and `release` answers `0 semitones` at `0.65×` gain so press+release forms a single physical button cycle.

### 2.3 Classic Physical Synthesis Equations for UI Micro-Interactions
1. **Paul Kellet's 3-Pole & 6-Pole Pink Noise ($1/f$, $-3\text{ dB/octave}$):**
   White noise (`Math.random() * 2 - 1`) has flat energy per Hz and sounds harsh/hissy (`+3 dB/octave` perceived brightness). Real mechanical switches and air whooshes follow a $1/f$ pink noise spectrum. Pre-compute a 1-second `AudioBuffer` once at initialization (zero GC pressure):
   ```ts
   // Paul Kellet's instrumentation-grade pink noise filter (±0.05 dB accuracy)
   let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
   for (let i = 0; i < sampleRate; i++) {
     const white = Math.random() * 2 - 1;
     b0 = 0.99886 * b0 + white * 0.0555179;
     b1 = 0.99332 * b1 + white * 0.0750759;
     b2 = 0.96900 * b2 + white * 0.1538520;
     b3 = 0.86650 * b3 + white * 0.3104856;
     b4 = 0.55000 * b4 + white * 0.5329522;
     b5 = -0.76160 * b5 - white * 0.0168980;
     data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
     b6 = white * 0.115926;
   }
   ```
2. **Minnaert Bubble Resonance (for `pop`, `droplet`, `badge-appear`):**
   A spherical air bubble of radius $R$ oscillating in liquid resonates at the **Minnaert frequency** (Minnaert 1933; Andy Farnell *Designing Sound*):
   $$f_M = \frac{1}{2\pi R}\sqrt{\frac{3\gamma P_0}{\rho}} \approx \frac{3.26\text{ m/s}}{R}$$
   As the bubble detaches and rises to the surface, its hydrodynamic mass decreases, causing an **exponential upward pitch inflection** ($f(t) = f_0 \cdot e^{\alpha t}$, e.g. `450 Hz → 1,650 Hz` over `55 ms`).
3. **Karplus-Strong Plucked String Waveguide (for `pluck`, `slider-snap`, `card-strum`):**
   Excite a short circular delay buffer of length $N = \lfloor f_s / f_0 \rfloor$ with filtered noise and pass each cycle through a one-zero averaging lowpass filter $y[n] = \gamma \cdot \frac{y[n-N] + y[n-N-1]}{2}$.

---

## 3. Production-Grade Web Audio Synthesis Recipes (Copy-Paste Reference)

All recipes obey the 8 mandatory Web Audio engineering rules:
1. **`context-singleton`**: One lazy `AudioContext` shared across the entire app.
2. **`scheduling-capture-once`**: Capture `const now = ctx.currentTime` once per call.
3. **`gain-no-zero-target`**: Never pass `0` to `exponentialRampToValueAtTime` (throws `RangeError`); always use `0.0001` or `0.001`.
4. **`declick-attack`**: Start gain at `0.0001` and ramp linearly over `1.5–4 ms` before exponential decay to eliminate onset DC clicks.
5. **`stop-after-envelope`**: Stop oscillators at `now + duration + 0.01` so the envelope reaches `-60 dBFS` before termination.
6. **`micro-jitter`**: Apply `±3%` pitch jitter (`1 + (Math.random() - 0.5) * 0.06`) on rapid repeated actions (typing, slider ticks, stepper clicks) to prevent the robotic "machine-gun effect".
7. **`offline-bake-cache`**: For complex multi-layer cues, render once into an `AudioBuffer` via `OfflineAudioContext` (`17× to 75×` lower main-thread CPU cost on replay).
8. **`master-limiter`**: Route `masterGain` through a safety `DynamicsCompressorNode` (`threshold: -6`, `knee: 6`, `ratio: 12`, `attack: 0.003`, `release: 0.08`) so overlapping cues never clip above `-1 dBFS`.

### 3.1 Tactile Button Press & Release Pair (Farnell Dual-Transient Model)
```ts
export function playButtonPress(ctx: AudioContext, dest: AudioNode, isRelease = false) {
  const now = ctx.currentTime;
  const jitter = 1 + (Math.random() - 0.5) * 0.04;
  const duration = isRelease ? 0.032 : 0.048;

  // Layer 1: Low housing body thump (sine pitch drop)
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  const startHz = (isRelease ? 260 : 190) * jitter;
  const endHz = (isRelease ? 140 : 92) * jitter;

  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(startHz, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(endHz, now + duration);

  const peakBody = isRelease ? 0.14 : 0.24;
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.linearRampToValueAtTime(peakBody, now + 0.0015);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  bodyOsc.connect(bodyGain).connect(dest);
  bodyOsc.start(now);
  bodyOsc.stop(now + duration + 0.005);

  // Layer 2: Crisp high-Q contact snap (4ms micro-burst)
  const snapOsc = ctx.createOscillator();
  const snapFilter = ctx.createBiquadFilter();
  const snapGain = ctx.createGain();

  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime((isRelease ? 3400 : 2600) * jitter, now);
  snapOsc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

  snapFilter.type = 'bandpass';
  snapFilter.frequency.setValueAtTime(isRelease ? 3600 : 2800, now);
  snapFilter.Q.setValueAtTime(4.5, now);

  const peakSnap = isRelease ? 0.06 : 0.11;
  snapGain.gain.setValueAtTime(0.0001, now);
  snapGain.gain.linearRampToValueAtTime(peakSnap, now + 0.0008);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

  snapOsc.connect(snapFilter).connect(snapGain).connect(dest);
  snapOsc.start(now);
  snapOsc.stop(now + 0.016);
}
```

### 3.2 Mechanical Switch Profiles (`Thock`, `Creamy`, `Clicky`)
Extracted from `0xSHARON/click-clack` & `anonimBRO-design/Clackify`:
- **`Thock` (Lubed POM/PBT Deep Switch):**
  - Body: `sine` `240 Hz → 96 Hz` over `60 ms` (`spacebar`: `165 Hz → 66 Hz` over `90 ms`).
  - Stem Noise: Paul Kellet pink noise through `lowpass` sweeping `850 Hz → 180 Hz` over `48 ms`.
- **`Creamy` (Marbly Long-Pole Linear Switch):**
  - Body: `triangle` `396 Hz → 154 Hz` over `50 ms`.
  - Stem Noise: Pink noise through `bandpass` (`Q = 2.2`) sweeping `1,350 Hz → 320 Hz`.
- **`Clicky` (Click-Jacket / Buckling Spring Switch):**
  - Body: `sine` `180 Hz → 90 Hz` over `45 ms`.
  - Jacket Snap: Pink noise through `bandpass` (`3,200 Hz`, `Q = 5.0`, `18 ms`).
  - Metallic Leaf Ring: `sine` at `1,100 Hz` + `2,760 Hz` with `0.025` gain decaying over `65 ms`.

### 3.3 Binary Toggle Switch (`toggle-on` / `toggle-off`)
```ts
export function playToggle(ctx: AudioContext, dest: AudioNode, isOn: boolean) {
  const now = ctx.currentTime;
  const dur = 0.095;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isOn ? 520 : 740, now);
  osc.frequency.exponentialRampToValueAtTime(isOn ? 780 : 480, now + dur);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.20, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain).connect(dest);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}
```

### 3.4 Glassy FM Confirmation & Apple Pay-Style Success Chime
```ts
export function playGlassConfirm(ctx: AudioContext, dest: AudioNode) {
  const now = ctx.currentTime;
  // Two-note ascending fifth in C5 -> G5 with Glass modal partials (1 : 2 : 3)
  const notes = [587.33, 880.0]; // D5 -> A5
  notes.forEach((freq, idx) => {
    const start = now + idx * 0.065;
    const dur = idx === 0 ? 0.16 : 0.38;
    [1, 2, 3].forEach((ratio, pIdx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const partialGain = [0.18, 0.06, 0.02][pIdx];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(partialGain, start + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur / (pIdx * 0.6 + 1));

      osc.connect(gain).connect(dest);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    });
  });
}
```

---

## 4. Multimodal Choreography: Haptics + Sound + Spring Physics

Following **Apple WWDC19 Session 810 (*Designing Audio-Haptic Experiences*)** and **Emil Kowalski's Multimodal Feedback Standard**:

### 4.1 The Three Laws of Audio-Haptic Design
1. **Causality:** Feedback must make it immediately obvious what physical interaction caused it. A button press triggers a transient at the exact moment of contact; a slider snap triggers at the exact tick threshold.
2. **Harmony:** Visual mass, spring stiffness, haptic sharpness, and acoustic spectral centroid must agree:
   - **Small UI control (`Switch`, `Checkbox`, `Chip`):** High spring stiffness (`400–500`), high pitch (`700–1,400 Hz`), short duration (`25–60 ms`), crisp light haptic (`6 ms`).
   - **Large UI surface (`Modal`, `Drawer`, `Sheet`, `Bento Card`):** Lower spring stiffness (`220–300`), lower pitch (`180–450 Hz`), longer filtered air whoosh (`140–240 ms`), soft medium haptic (`12 ms`).
3. **Utility & Restraint:** Never add sound+haptics to every passive element. Reserve multimodal feedback for state transitions, primary actions, tactile workbenches, and confirmations.

### 4.2 Cross-Platform Web Haptics + Audio Synchronization (`lochie/web-haptics` & `@bloxwap/haptic`)
- **Android / Chromium:** `navigator.vibrate(pattern)` for transient (`7 ms`), confirm (`[8, 50, 14]`), error (`[18, 40, 18]`).
- **iOS Safari 17.4+ Taptic Engine Bridge:** Safari does not expose `navigator.vibrate`, but toggling a hidden `<input type="checkbox" switch>` inside a synchronous user gesture triggers the native iPhone Taptic Engine transient click.
- **Temporal Alignment:** Fire the haptic pulse and the Web Audio `start(ctx.currentTime)` on the **exact same synchronous event tick** (`0 ms` delta). As shown in WWDC17 *Designing Sound*, keeping the haptic transient identical while swapping a dull vs. crisp audio transient changes the user's tactile perception of physical sharpness!

---

## 5. The 10 Anti-Fatigue & Accessibility Golden Rules

1. **Default Opt-In or Polite Chrome Toggle:** Always expose a persistent, single-click **Mute / Volume HUD toggle** (`localStorage` persisted) with clear visual state (`🔊 / 🔇`). In `SoundStudio.tsx`, sound is the primary craft subject and unlocks on the first pad/control gesture.
2. **Volume Hierarchy Ceiling:**
   - **Hover / Subliminal Tick:** `0.03 – 0.06` (`-30 to -24 dBFS`), pointer-fine desktop only (`@media (hover: hover) and (pointer: fine)`), global cooldown `≥ 90 ms`.
   - **Micro-Clicks / Toggles / Tabs / Sliders:** `0.15 – 0.25` (`-16 to -12 dBFS`), per-cue retrigger guard `≥ 35 ms`.
   - **Outcomes (`Confirm`, `Success`, `Warning`, `Error`):** `0.25 – 0.35` (`-12 to -9 dBFS`), cooldown `≥ 180 ms`.
   - **Hard Ceiling:** Never exceed `0.80` linear gain; always clamp master bus with a compressor/limiter.
3. **One Cue Per Gesture (Yield Rule):** If clicking a button immediately opens a modal or triggers `confirm`, suppress the generic button click or let the semantic outcome cue own the gesture—never stack two competing sounds on the same `pointerdown`.
4. **Disabled & Inert Controls Stay Silent:** Delegate listeners must check `el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[inert]')` before firing any sound.
5. **Touch Scroll Guard:** On touch devices (`pointerType === 'touch'`), trigger tap/press sounds on verified `click` / `pointerup` (when movement `< 10px`), never on `touchstart`, so scrolling a page full of buttons stays 100% silent.
6. **Background Tab & iOS Interruption Recovery:**
   - Suspend `AudioContext` on `document.hidden === true` (`visibilitychange`).
   - Set `navigator.audioSession.type = 'ambient'` (where supported on iOS 17+) so UI micro-sounds mix gently with the user's Spotify/Apple Music instead of pausing their background music!
7. **Visual Parity (WCAG 2.2):** Sound is never the sole carrier of status, error, or completion. Every audio cue must have a synchronized visual state change, spring motion, and ARIA state.

---

## 6. Indexed Vault Directory Map (`08-UI-SOUND-DESIGN-AND-SONIC-UX`)

| Sub-Pillar | Directory | Key Included Repositories & Capabilities |
| :--- | :--- | :--- |
| **`01`** | `01-sonic-ux-skills-and-ai-agents/` | `dannyjpwilliams-ui-sound-design-skill` (`SKILL.md` + 9 Web Audio recipes + CLI analyzer), `laurentvv-uisfx-playground` (`uisfx` `SKILL.md`), `plyght-tonejs-skill`, `elevenlabs-official-skills`, `soniccraft-procedural-skill`, `lochie-web-haptics-and-skill`, `hudsonkit-sfx-ai-engine`, `kanaworks-sonicproof-qa-skill` (loudness/clipping/seam QA `SKILL.md`), `sonicfieldlabs-skills`, `awesome-genmedia-sound-skills`, `tm59-web-audio-skill` |
| **`02`** | `02-procedural-web-audio-ui-synths/` | `romainsimon-uisfx` (78 cues × 12 packs), `danielwh2-cuelume` (14 context-aware cues), `plausibleventures-foley-foundry` (24 sketches × 5 physical materials + non-clipping gate), `eakbulut-foley-28-cues`, `rexa-tiks`, `bloxwap-sfx` (19 `OfflineAudioContext` cached recipes), `productdevbook-seslen`, `m1ckc3s-procedural-sounds`, `lwn2210-micro-sfx`, `peetzweg-sonics`, `ndoherty-plinq`, `remarkablemark-websfx`, `pinkneyjiang-synth-sound`, `artzdesignmo-sfx-mo`, `killedbyapixel-zzfx`, `chr15m-jsfxr`, `kittykatattack-sound-js` |
| **`03`** | `03-react-sound-systems-and-packs/` | `satyamvyas-sensory-ui` (17 roles × 9 Web Audio packs × 24 shadcn components), `alvarovillalbaa-sonant` (32 semantic cues + surface density budgets), `raphaelsalaja-audio` (declarative Web Audio synths), `kapishdima-soundcn-registry` (`use-sound.ts` + inline base64 UI sounds), `dentsu-snd-lib`, `joshwcomeau-use-sound`, `e3ntity-react-sounds`, `cabralorenzo-bencho-shadcn`, `plebsnet-sounded-shadcn`, `hironow-earcon-sonification` (continuous ETA/hysteresis sonification), `wle8300-uifx`, `ljungmark-audings`, `kenney-cc0-ui-audio-pack`, `kenney-cc0-interface-sounds-pack` |
| **`04`** | `04-tactile-switches-and-haptic-audio/` | `0xsharon-click-clack` (`thock`/`creamy`/`clicky` + Paul Kellet pink noise + deskmat resonance), `anonimbro-clackify` (Cherry MX / Holy Panda / Topre / Buckling Spring), `rishabjs03-keyboard-graph`, `gomezsj12-dalin-tactile` (unified Haptics + Web Audio + Motion), `bloxwap-haptic`, `doublej-web-haptics-polyfill`, `present-day-buzz`, `gaurav-web-haptics-toast`, `danigb-synthlet-worklets` (`AudioWorklet` ADSR/ModalResonator/KarplusStrong/SVF), `positivelofi-strong-plus-eks` (Extended Karplus-Strong + commuted body IRs), `craigdanj-guitar-pluck-js`, `mohayonao-pink-noise-node`, `zacharydenton-noise-js`, `audiojs-filter-resonators`, `francescoslongo-minnaert-modal-asmr` (Minnaert bubble + modal wood/plastic/glass) |
