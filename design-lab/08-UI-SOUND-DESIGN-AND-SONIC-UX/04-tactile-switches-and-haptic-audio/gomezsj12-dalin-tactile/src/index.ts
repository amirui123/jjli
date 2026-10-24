/**
 * @dalin/tactile: one call, three coordinated channels.
 *
 * createTactile() returns an object whose semantic methods (success, selection,
 * impact, …) fire every ENABLED channel together: a haptic (Android vibrate +
 * iOS switch tick), a sound (Web Audio), and motion (emoji burst / boop).
 * Choose haptics, sound, motion, or any combination.
 *
 * The haptic backend is a swap seam: pure-web today, native (Capacitor) later
 * behind the same surface. See ROADMAP.md and docs/DEFERRED.md. (AUDIT-016: this
 * comment previously pointed at a cross-repo path; repointed to local docs.)
 */
import type {
  BackendProbe,
  EventName,
  EventRecipe,
  EventTable,
  HapticRecipe,
  MotionDriver,
  MotionRuntime,
  MotionSpec,
  MotionTarget,
  SoundChannel,
  SoundPack,
  Tactile,
  TactileConfig,
  TactileReport,
  Targetish,
} from "./types.js";
import { PRESET_EVENTS, resolveEvents } from "./presets.js";
import { createWebBackend } from "./backends/web.js";
import { createSilentBackend } from "./backends/silent.js";
import { detectPlatform } from "./platform.js";
import type { Platform } from "./platform.js";
import { iosSwitchAvailable } from "./ios-switch.js";

// Public type surface, so consumers can type their integration + custom packs.
export type {
  Tactile,
  TactileConfig,
  TactileReport,
  ChannelConfig,
  EventName,
  EventRecipe,
  EventOverrides,
  HapticStep,
  HapticRecipe,
  BackendKind,
  HapticBackend,
  BackendProbe,
  SoundPack,
  SoundChannel,
  MotionDriver,
  MotionSpec,
  MotionTarget,
  MotionRuntime,
  Targetish,
} from "./types.js";

const isBrowser = typeof window !== "undefined";
const TEST_MIN_GAP_MS = 500;

export function createTactile(config: TactileConfig = {}): Tactile {
  let events: EventTable = resolveEvents(config.events);
  let hapticsOn = config.haptics ?? true;
  let strength = config.strength ?? 1;
  let volume = config.volume ?? 1;
  let scale = config.scale ?? 1;
  const debug = config.debug ?? false;

  // Browser runtime uses the pure-web backend unless explicitly silenced; SSR/no DOM
  // always gets the silent backend so construction remains safe at module scope.
  const backend =
    !isBrowser || config.backend === "silent" ? createSilentBackend() : createWebBackend();

  // ── sound channel: opt-in, lazily constructed, never bundled unless enabled ──
  let audioCtx: AudioContext | null = null;
  let sound: SoundChannel | null = null;
  let soundName: string | false = false;
  let soundSpec: boolean | SoundPack | undefined; // last requested, for idempotent re-enable

  function getAudioContext(): AudioContext | null {
    if (!isBrowser) return null;
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        audioCtx = new Ctor();
      } catch {
        return null;
      }
    }
    return audioCtx;
  }

  // Resume whenever suspended. Safe to call from any user gesture (iOS needs it).
  function resumeAudio(): void {
    const c = audioCtx;
    if (c && c.state !== "running") void c.resume().catch(() => {});
  }

  function enableSound(pack: boolean | SoundPack): void {
    if (pack === soundSpec) {
      if (pack) resumeAudio(); // already in this state, so just keep it unlocked
      return;
    }
    soundSpec = pack;
    sound = null;
    soundName = false;
    if (!pack || !isBrowser) return;
    // Create + resume the context SYNCHRONOUSLY within the enabling gesture.
    // Doing it later (inside the async import) is what left iOS silent.
    if (getAudioContext()) resumeAudio();
    void (async () => {
      try {
        const resolved: SoundPack =
          pack === true ? (await import("./sound/synth.js")).synthPack : pack;
        const ctx = getAudioContext();
        if (!ctx) return;
        const channel = await resolved.create(ctx);
        // AUDIT-001 (High): no re-check that `soundSpec === pack` here. A set({sound:false})
        // or pack swap issued while this import/create was in flight gets clobbered: the
        // channel re-enables itself after the caller turned it off. Fix: guard with
        // `if (soundSpec !== pack) return;` before assigning. See docs/code-audit.md.
        sound = channel;
        soundName = channel.name;
      } catch (err) {
        if (debug) console.warn("[tactile] sound pack failed to load", err);
      }
    })();
  }

  // ── motion channel: opt-in, lazily constructed ──────────────────────────────
  let motion: MotionDriver | null = null;
  let motionName: string | false = false;
  let motionSpec: boolean | MotionDriver | undefined; // last requested, for idempotent re-enable

  function enableMotion(driver: boolean | MotionDriver): void {
    if (driver === motionSpec) return; // already in this state, so don't tear down a loaded driver
    motionSpec = driver;
    motion = null;
    motionName = false;
    if (!driver || !isBrowser) return;
    if (driver !== true) {
      motion = driver;
      motionName = driver.name;
      return;
    }
    void (async () => {
      try {
        const { domMotionDriver } = await import("./motion/index.js");
        // AUDIT-001 (High, motion extension): same stale-async race as enableSound:
        // a set({motion:false}) during this import is clobbered. Guard with
        // `if (motionSpec !== driver) return;` before assigning. See docs/code-audit.md.
        motion = domMotionDriver;
        motionName = domMotionDriver.name;
      } catch (err) {
        if (debug) console.warn("[tactile] motion driver failed to load", err);
      }
    })();
  }

  if (config.sound) enableSound(config.sound);
  if (config.motion) enableMotion(config.motion);

  // Resume audio on ANY gesture while suspended (NOT once, which was the bug before).
  // AUDIT-003 (High): these 4 capturing listeners (and any AudioContext) are never
  // removed: the returned Tactile has no dispose()/destroy(). Fine for the documented
  // single-instance usage; leaks listeners + can exhaust the AudioContext cap under
  // React StrictMode / HMR / SPA churn. onGesture is already a stable ref, so a
  // dispose() can removeEventListener it. See docs/code-audit.md + docs/DEFERRED.md.
  if (isBrowser) {
    const onGesture = (): void => resumeAudio();
    for (const ev of ["pointerdown", "touchend", "mousedown", "keydown"]) {
      window.addEventListener(ev, onGesture, { capture: true, passive: true });
    }
  }

  function reducedMotion(): boolean {
    return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ── firing ───────────────────────────────────────────────────────────────
  function fire(recipe: EventRecipe, target: MotionTarget): void {
    if (hapticsOn && recipe.haptic) {
      backend.cancel();
      backend.fire(recipe.haptic, strength);
    }
    if (sound && recipe.sound) {
      resumeAudio(); // we're inside the tap gesture, so it's safe to unlock here too
      sound.play(recipe.sound, { volume });
    }
    if (motion && recipe.motion) {
      const runtime: MotionRuntime = { reducedMotion: reducedMotion(), scale };
      const specs = Array.isArray(recipe.motion) ? recipe.motion : [recipe.motion];
      for (const spec of specs) motion.render(spec, target, runtime);
    }
  }

  function fireEvent(name: EventName, target?: Targetish): void {
    const recipe = events[name];
    if (recipe) fire(recipe, toTarget(target));
  }

  function buildReport(): TactileReport {
    const platform = detectPlatform();
    const probe = backend.probe();
    return {
      backend: backend.kind,
      channels: { haptics: hapticsOn, sound: soundName, motion: motionName },
      platform,
      vibrate: probe.vibrate ?? { exists: false, lastReturn: null },
      iosSwitch: probe.iosSwitch ?? { available: iosSwitchAvailable() },
      audio: { enabled: soundName !== false, state: audioCtx ? audioCtx.state : "absent" },
      reducedMotion: reducedMotion(),
      notes: buildNotes(platform, probe, hapticsOn, soundName, motionName),
    };
  }

  return {
    impact: (style = "medium", target) => fireEvent(style, target),
    notification: (type, target) => fireEvent(type, target),
    selection: (target) => fireEvent("selection", target),
    light: (target) => fireEvent("light", target),
    medium: (target) => fireEvent("medium", target),
    heavy: (target) => fireEvent("heavy", target),
    success: (target) => fireEvent("success", target),
    warning: (target) => fireEvent("warning", target),
    error: (target) => fireEvent("error", target),
    buzz: (target) => fireEvent("buzz", target),
    press: (target) => fireEvent("press", target),
    release: (target) => fireEvent("release", target),
    toggle: (target) => fireEvent("toggle", target),
    loading: (target) => fireEvent("loading", target),
    ready: (target) => fireEvent("ready", target),
    cue: (name, opts) => {
      if (!sound) return; // channel off, or the pack import is still in flight
      resumeAudio(); // callers reach for cue() from a gesture too
      // Multiply, don't replace: a global volume: 0.5 still holds for one-off cues.
      sound.play(name, { volume: volume * (opts?.volume ?? 1) });
    },
    cues: () => sound?.cues ?? [],
    play: (input, target) => {
      // AUDIT-018 (Low): play(0) / play([]) build an empty pattern, but fire() calls
      // backend.cancel() before checking length, so an "empty" play silently kills any
      // in-flight vibration with no caller-visible signal. See docs/code-audit.md.
      if (typeof input === "number") {
        fire({ haptic: { steps: [{ duration: input, intensity: 1 }] } }, toTarget(target));
      } else if (Array.isArray(input)) {
        fire({ haptic: { steps: input } }, toTarget(target));
      } else {
        fireEvent(input, target);
      }
    },
    set: (next) => {
      // AUDIT-002 (High): re-merges from the IMMUTABLE constructor config.events, so two
      // successive set({events}) calls don't accumulate: the second drops the first's
      // overrides. Fix: keep a mutable accumulator and resolveEvents from it. code-audit.md.
      if (next.events) events = resolveEvents({ ...config.events, ...next.events });
      if (next.haptics !== undefined) hapticsOn = next.haptics;
      if (next.strength !== undefined) strength = next.strength;
      if (next.volume !== undefined) volume = next.volume;
      if (next.scale !== undefined) scale = next.scale;
      if (next.sound !== undefined) enableSound(next.sound);
      if (next.motion !== undefined) enableMotion(next.motion);
    },
    diagnose: () => buildReport(),
    test: async () => {
      for (const name of PRESET_EVENTS) {
        fireEvent(name);
        if (debug) console.log(`[tactile] ${name}`);
        await new Promise((r) => setTimeout(r, recipeTestGap(events[name]!, strength)));
      }
    },
  };
}

function recipeTestGap(recipe: EventRecipe, strength: number): number {
  return Math.max(TEST_MIN_GAP_MS, hapticDuration(recipe.haptic, strength), motionDuration(recipe.motion));
}

function hapticDuration(recipe: HapticRecipe | undefined, strength: number): number {
  if (!recipe) return 0;
  return recipe.steps.reduce((total, step) => total + (step.delay ?? 0) + (step.duration ?? 0) * strength, 0);
}

function motionDuration(motion: EventRecipe["motion"]): number {
  if (!motion) return 0;
  const specs = Array.isArray(motion) ? motion : [motion];
  return specs.reduce((longest, spec) => Math.max(longest, motionSpecDuration(spec)), 0);
}

function motionSpecDuration(spec: MotionSpec): number {
  switch (spec.kind) {
    case "particles":
      return spec.duration ?? 0;
    case "boop":
      return spec.timing ?? 300;
    case "custom":
    case "none":
      return 0;
  }
}

function toTarget(target?: Targetish): MotionTarget {
  if (!target || typeof window === "undefined") return {};
  if (target instanceof Element) return { el: target };
  if ("clientX" in target && "clientY" in target) {
    const ev = target;
    const el =
      ev.currentTarget instanceof Element
        ? ev.currentTarget
        : ev.target instanceof Element
          ? ev.target
          : null;
    return { el, x: ev.clientX, y: ev.clientY };
  }
  return target;
}

function buildNotes(
  platform: Platform,
  probe: BackendProbe,
  hapticsOn: boolean,
  soundName: string | false,
  motionName: string | false,
): string[] {
  const notes: string[] = [];
  if (!hapticsOn) notes.push("Haptic channel off.");
  if (platform.desktop)
    notes.push("Desktop has no vibration motor, so sound + motion carry the feedback here.");
  if (platform.android) {
    notes.push(
      probe.vibrate?.exists
        ? "Android: navigator.vibrate is available. If a call returns true but you feel nothing, the OS vibration / touch-feedback setting or battery saver is off, not the app."
        : "Android: navigator.vibrate is missing in this engine.",
    );
  }
  if (platform.ios) {
    notes.push(
      probe.iosSwitch?.available
        ? "iOS: invisible-switch Taptic tick (one light tick per call). iOS 26.5 patched the script path; silence on ≥26.5 is the platform, not the app."
        : "iOS: switch-based haptics unavailable on this WebKit version.",
    );
  }
  notes.push(soundName ? `Sound channel: "${soundName}".` : "Sound channel off.");
  notes.push(motionName ? `Motion channel: "${motionName}".` : "Motion channel off.");
  if (platform.standalonePWA) notes.push("Running as an installed PWA.");
  return notes;
}
