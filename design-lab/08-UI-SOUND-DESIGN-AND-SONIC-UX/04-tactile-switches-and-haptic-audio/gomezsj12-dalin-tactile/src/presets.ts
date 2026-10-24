import type { EventName, EventOverrides, EventRecipe, EventTable } from "./types.js";

/**
 * DEFAULT_EVENTS maps each semantic event across three channels. Haptics produce a
 * vibration pattern. Sound supplies a cue name for the SoundPack to resolve. Motion
 * drives on-screen effects, and every event includes emoji so a tap always shows
 * something. Override any channel via `createTactile({ events: {...} })`.
 *
 * Use `strength` as the global duration multiplier for every step. Within a haptic
 * recipe, write a continuous rough run as one step with `intensity` below 1. Write a
 * small number of separate events as steps with `delay` between them. A chopped
 * step ends with an off-window; when a delay follows, that off-window merges into
 * the delay, so the emitted gap is a few milliseconds longer than the delay in the
 * source.
 *
 * Design rungs in this order: start with texture, use rhythm next, then use coarse
 * weight only as a tiebreaker. Roughness and smoothness survive the motor better
 * than fine duration changes; an airy feel does too.
 *
 * Rhythm separates a single event from repeated events. It also distinguishes a
 * rising sequence from one that stays even or falls. A ladder of smooth pulses at
 * 25 ms, 40 ms, 60 ms, or 100 ms feels like one haptic at four volumes.
 *
 * Tune pairs that users feel in sequence during real use. Array values can look
 * widely separated while feeling identical; the old light half of this ladder did
 * on Android hardware.
 */
export const DEFAULT_EVENTS: EventTable = {
  selection: {
    // Rough and quick, so moving feels different from arriving.
    haptic: { steps: [{ duration: 14 }, { delay: 6, duration: 4 }], ios: "light" },
    sound: "tick",
    motion: { kind: "particles", emojis: ["✨"], count: 3 },
  },
  press: {
    // Smooth and crisp, with similar weight to selection but none of its roughness.
    haptic: { steps: [{ duration: 35 }], ios: "light" },
    sound: "press",
    // Scale BELOW 1: the element goes in, which is the whole point of a press.
    motion: { kind: "boop", scale: 0.94, timing: 160 },
  },
  release: {
    // A pinprick that barely registers as something leaves.
    haptic: { steps: [{ duration: 8 }], ios: "light" },
    sound: "release",
    motion: { kind: "boop", scale: 1.05, timing: 220 },
  },
  toggle: {
    // A click then clack, like a detent seating.
    haptic: { steps: [{ duration: 10 }, { delay: 45, duration: 32 }], ios: "light" },
    sound: "toggle",
    motion: [
      { kind: "boop", scale: 1.1 },
      { kind: "particles", emojis: ["🔘", "✨"], count: 3, flip: true },
    ],
  },
  light: {
    // An airy, widely spaced flutter unlike anything else in the ladder.
    haptic: { steps: [{ duration: 80, intensity: 0.3 }], ios: "light" },
    sound: "tap",
    motion: { kind: "particles", emojis: ["✨", "👆"], count: 4, flip: true },
  },
  medium: {
    // One smooth thud, the heaviest rung that is a single strike.
    haptic: { steps: [{ duration: 80 }], ios: "medium" },
    // The impact ladder is audible as well as felt: tap, then press, then thud.
    sound: "press",
    motion: [
      { kind: "boop", scale: 1.12 },
      { kind: "particles", emojis: ["👍", "✨"], count: 5, flip: true },
    ],
  },
  heavy: {
    // A 35 ms strike, then a heavier landing. Two onsets read as more force than
    // one long pulse, which only adds sustain. The 30 ms gap fuses them into one hit.
    haptic: {
      steps: [
        { duration: 35 },
        { delay: 30, duration: 55 },
      ],
      ios: "heavy",
    },
    sound: "thud",
    motion: [
      { kind: "boop", scale: 1.24 },
      { kind: "particles", emojis: ["💥", "🔥", "⭐️"], count: 8, flip: true },
    ],
  },
  success: {
    // A rising flutter that resolves in a solid tap, the payoff gesture.
    haptic: {
      steps: [
        { duration: 100, intensity: 0.5 },
        { delay: 60, duration: 45 },
      ],
      ios: "medium",
    },
    sound: "success",
    motion: {
      kind: "particles",
      emojis: ["🎉", "✅", "⭐️", "💛", "🥳"],
      count: 6,
      duration: 600, // sustained shower
      flip: true,
    },
  },
  warning: {
    // Two rough clusters, with a softer second cluster that makes the sequence fall.
    haptic: {
      steps: [
        { duration: 60, intensity: 0.8 },
        { delay: 100, duration: 60, intensity: 0.6 },
      ],
      ios: "medium",
    },
    sound: "warning",
    motion: { kind: "particles", emojis: ["⚠️", "😬", "👀"], count: 5, flip: true },
  },
  error: {
    // Three tight clusters whose count makes failure unmistakable.
    haptic: {
      steps: [
        { duration: 60, intensity: 0.9 },
        { delay: 42, duration: 60, intensity: 0.9 },
        { delay: 42, duration: 60, intensity: 0.9 },
      ],
      ios: "heavy",
    },
    sound: "error",
    motion: { kind: "particles", emojis: ["⛔️", "🚫", "💢"], count: 6 },
  },
  loading: {
    // Two distant pinpricks; the gap says the work remains unresolved.
    haptic: { steps: [{ duration: 5 }, { delay: 220, duration: 5 }], ios: "light" },
    sound: "loading",
    motion: { kind: "particles", emojis: ["⏳", "💭"], count: 3, flip: true },
  },
  ready: {
    // The success gesture at half size, for work that has finished.
    haptic: {
      steps: [
        { duration: 40, intensity: 0.4 },
        { delay: 70, duration: 26 },
      ],
      ios: "medium",
    },
    sound: "ready",
    motion: [
      { kind: "boop", scale: 1.14 },
      { kind: "particles", emojis: ["🟢", "✨", "👌"], count: 5, flip: true },
    ],
  },
  buzz: {
    // Sustained on Android haptics, sound, and motion. iOS haptics remain one tick.
    haptic: {
      steps: [{ duration: 2500, intensity: 1 }], // Android: one long, steady vibration
      ios: "light",
    },
    sound: "buzz", // sustained buzzing tone (~2.5s), see the synth pack
    motion: {
      kind: "particles",
      emojis: ["📳", "🐝", "💫", "✨"],
      count: 6,
      duration: 2500, // keep the emoji shower going for the whole buzz
      flip: true,
    },
  },
};

const EVENT_NAMES = Object.keys(DEFAULT_EVENTS) as EventName[];

function cloneRecipe(r: EventRecipe): EventRecipe {
  return {
    haptic: r.haptic ? { steps: r.haptic.steps.map((s) => ({ ...s })), ios: r.haptic.ios } : undefined,
    sound: r.sound,
    motion: Array.isArray(r.motion)
      ? r.motion.map((m) => ({ ...m }))
      : r.motion
        ? { ...r.motion }
        : undefined,
  };
}

/**
 * Merge overrides onto the defaults, producing a fresh, fully-populated table.
 *
 * AUDIT-014 (Low): merge is PER CHANNEL, not per field: an override's `haptic`/`sound`/
 * `motion` replaces the whole channel recipe (you can't tweak just `motion.count`). The
 * README's "override just what you want" reads field-level; clarify the wording. code-audit.md.
 */
export function resolveEvents(overrides?: EventOverrides): EventTable {
  const out = {} as EventTable;
  for (const name of EVENT_NAMES) {
    const base = cloneRecipe(DEFAULT_EVENTS[name]!);
    const ov = overrides?.[name];
    out[name] = ov
      ? { haptic: ov.haptic ?? base.haptic, sound: ov.sound ?? base.sound, motion: ov.motion ?? base.motion }
      : base;
  }
  return out;
}

export { EVENT_NAMES as PRESET_EVENTS };
