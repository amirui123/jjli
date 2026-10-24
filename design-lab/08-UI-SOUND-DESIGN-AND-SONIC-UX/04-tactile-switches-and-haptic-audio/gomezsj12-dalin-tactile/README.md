# @dalin/tactile

**Make web interactions feel real.** One call fires coordinated **haptics + sound + motion**, each channel independently tunable and toggleable. Pure‑web today; swappable to a native haptic backend later, behind the same API.

![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![types: included](https://img.shields.io/badge/types-included-blue.svg) ![deps: zero](https://img.shields.io/badge/deps-zero-brightgreen.svg)

```ts
import { createTactile } from "@dalin/tactile";

const tactile = createTactile({ haptics: true, sound: true, motion: true });

button.addEventListener("click", (e) => tactile.success(e));
//                                       ↳ taptic buzz + chime + emoji burst 🎉
```

---

## Why

The web has no real haptics API. On Android there's only `navigator.vibrate` (binary on/off, no amplitude); on iOS Safari there's no vibration API at all, just a hack (toggling a hidden `<input switch>` fires the Taptic Engine). No library can make that "unbreakable," because the fragility lives in the platform, not the library.

So `@dalin/tactile` doesn't pretend to. Instead it:

- **owns a thin, tunable layer** you can fix fast and reuse everywhere,
- **coordinates three channels** from one semantic call (haptics, sound, *and* on‑screen motion), which nothing else does, and
- keeps a **Capacitor‑shaped surface** so a real native backend can slot in later without touching call sites.

## Install

Not on npm yet. Install straight from GitHub with any package manager:

```bash
npm install github:gomezsj12/dalin-tactile
# pnpm add / yarn add / bun add  github:gomezsj12/dalin-tactile
```

It still imports as `@dalin/tactile`. Zero runtime dependencies. Ships ESM + TypeScript types.

## Quick start

```ts
import { createTactile } from "@dalin/tactile";

// Pick any combination of channels. All three off by default except haptics.
const t = createTactile({ haptics: true, sound: true, motion: true });

t.selection();            // a light tick + soft click
t.impact("heavy", el);    // one strong pulse + boom + a springy "boop" on `el`
t.success(clickEvent);    // success buzz + chime + an emoji shower at the tap point
t.buzz();                 // ~2.5s sound + emoji shower; Android vibrates, iOS ticks once

// Interaction events, for the moments a button actually has:
btn.addEventListener("pointerdown", (e) => t.press(e));   // goes in
btn.addEventListener("pointerup", (e) => t.release(e));   // comes back up
t.toggle(switchEl);       // one detent
t.loading();              // work started, deliberately unresolved
t.ready(el);              // work finished, lighter than success()

// Sound with no haptic and no motion:
t.cue("droplet");

// One channel only? Drop-in replacement for a plain haptics helper:
const haptics = createTactile();            // haptics only
haptics.light();
```

The semantic methods are Capacitor / iOS `UIFeedbackGenerator`‑shaped:

| Method | Feel |
| --- | --- |
| `selection()` | a value snapping to a new state |
| `impact("light" \| "medium" \| "heavy")` · `light()` / `medium()` / `heavy()` | a tap → a firm press → a heavy thud |
| `notification("success" \| "warning" \| "error")` · `success()` / `warning()` / `error()` | confirmation / caution / rejection |
| `buzz()` | a multi-second buzz: sustained Android vibration, sound, and emoji shower; iOS haptics are one tick |
| `press()` / `release()` | a key going down, then coming back up. Wire them to `pointerdown` / `pointerup` on the same element and the pair reads as one physical button |
| `toggle()` | a switch or checkbox landing in its other state: one detent |
| `loading()` / `ready()` | work started, then work finished. `loading` stays unresolved on purpose; `ready` lands lighter than `success` |
| `play(nameOrSteps, target?)` | a preset, a raw duration in ms, or a custom step sequence |
| `cue(name, opts?)` | one sound cue on its own: no haptic, no motion |

Any method optionally takes a **target** (an `Element`, a `MouseEvent`, or `{ x, y }`) so the motion channel knows where to anchor. `cue()` is the exception, since sound has nowhere to anchor.

## Channels

Each channel is **opt‑in and lazily loaded**, so a haptics‑only build never bundles the sound or motion code.

- **haptic** is Android `navigator.vibrate` plus the iOS `<input switch>` tick. Strength comes from duration plus PWM duty; the web has no amplitude control. Sub-full intensity uses 20 ms windows, which lets Android LRA motors make roughness distinguishable from a solid pulse. iOS ignores haptic duration, so sustained presets such as `buzz()` still produce one Taptic tick there.
- **sound** is Web Audio. A built‑in zero‑asset **synth pack** by default, or your own sample pack. Twenty cues; see [Sound](#sound).
- **motion** is a dependency‑free canvas **emoji‑particle** engine + a springy **boop**. Respects `prefers-reduced-motion`.

Toggle or retune any channel at runtime:

```ts
t.set({ sound: false });        // mute sound (e.g. from a settings screen)
t.set({ strength: 1.4 });       // punch up every haptic
```

## Tuning

```ts
createTactile({
  strength: 1.2,   // global haptic magnitude (scales pulse duration)
  volume: 0.8,     // global sound volume
  scale: 1.5,      // global motion scale (particle count, boop distance)
  events: {
    // override the channels you want; omitted channels keep their defaults.
    // A supplied channel replaces that whole recipe, so include the full motion spec.
    success: { motion: { kind: "particles", emojis: ["🐝", "🍯", "🌼"], count: 10, duration: 800 } },
    heavy:   { haptic: { steps: [{ duration: 120 }, { delay: 60, duration: 200 }] } },
  },
});
```

## Sound

Twenty cues, no audio files. Each is synthesized the moment it plays, from a stack of oscillator or filtered-noise voices with their own envelopes and filters. The voices layer, which is the whole difference: `thud` is a noise snap over two *simultaneous* sub-bass booms, not three beeps in a row. Everything sums through a tanh soft-clip that is the last node before the output, so cues piling up saturate gently instead of crackling.

Twelve cues back the thirteen default events (`medium` and `press` share one). The other eight are timbres to compose with:

| | |
| --- | --- |
| **wired to an event** | `tick` `tap` `press` `release` `toggle` `thud` `success` `warning` `error` `loading` `ready` `buzz` |
| **palette only** | `chime` `sparkle` `droplet` `bloom` `pop` `whisper` `swipe` `page` |

Reach a palette cue directly, or point an event at it:

```ts
t.cue("chime");                     // sound only, no haptic and no motion
t.cue("swipe", { volume: 0.4 });    // multiplies the instance volume, doesn't replace it
t.cues();                           // what the active pack knows, [] until it loads

createTactile({ sound: true, events: { selection: { sound: "droplet" } } });
```

`SYNTH_CUES` and the `SynthCue` union are exported from `@dalin/tactile/sound` if you're building a picker or a settings screen.

### Sample packs

For real recordings, point a **sample pack** at audio files you have rights to, e.g. [CC0 sounds from freesound.org](https://freesound.org) or [Kenney](https://kenney.nl/assets). Cue names are free-form, so a pack only needs the cues your events actually name:

```ts
import { createTactile } from "@dalin/tactile";
import { createSamplePack } from "@dalin/tactile/sound";

createTactile({
  sound: createSamplePack({
    baseUrl: "/sounds/",
    cues: { tick: "tick.wav", tap: "tap.wav", thud: "boom.wav", success: "chime.wav", error: "denied.wav" },
  }),
});
```

## Motion drivers

The built‑in `dom` driver covers boop + emoji bursts with no dependencies. For heavier effects, implement `MotionDriver` and pass it in, e.g. wrapping [`canvas-confetti`](https://github.com/catdad/canvas-confetti), [`tsParticles`](https://github.com/tsparticles/tsparticles), or `react-rewards` (all MIT):

```ts
import type { MotionDriver } from "@dalin/tactile/motion";
const confettiDriver: MotionDriver = { name: "confetti", render(spec, target, runtime) { /* … */ } };
createTactile({ motion: confettiDriver });
```

## Diagnostics

When haptics don't seem to fire, ask the library why:

```ts
t.diagnose();
// → { backend, channels, platform, vibrate: { exists, lastReturn }, iosSwitch, audio, reducedMotion, notes: [...] }
await t.test(); // fires every preset in sequence, great for tuning on a real device
```

`notes` is plain English, e.g. *"navigator.vibrate returned true but if you feel nothing, the OS vibration setting or battery saver is off."*

## SSR & frameworks

`createTactile()` is SSR‑safe: with no DOM it returns a silent no‑op object, so you can construct it anywhere and call it freely on the client. It's framework‑agnostic; in React, keep one instance:

```ts
const t = useMemo(() => createTactile({ sound: true, motion: true }), []);
```

## Accessibility

The motion channel is automatically suppressed when the user has `prefers-reduced-motion: reduce`. Haptics and sound still fire.

## Platform notes

- **Android**: `navigator.vibrate` works in Chrome/Firefox, but only if the OS "Touch feedback / vibration" setting and battery saver allow it.
- **iOS Safari**: uses the `<input switch>` Taptic trick (one light tick per call), so `buzz()` gets one haptic tick while sound + motion carry the multi-second duration. Apple patched the script‑driven path in **iOS 26.5**; this is a platform limitation, not a bug.
- **Desktop**: no vibration motor; sound + motion carry the feedback.
- A native (Capacitor) backend behind the same API is on the roadmap, for apps that ship a native shell and want guaranteed haptics.

## Credits

- The canvas emoji‑particle physics are adapted from **[web‑haptics](https://github.com/lochie/web-haptics)** by Lochie Axon (MIT).
- The sound and micro‑interaction approach is inspired by **[use‑sound](https://github.com/joshwcomeau/use-sound)** and the **["boop"](https://www.joshwcomeau.com/react/boop/)** technique by Josh W. Comeau.

## License

[MIT](./LICENSE)
