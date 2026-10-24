import { catalog, events, type Category, type SoundEvent } from "./catalog.js";
import { webAudioProvider } from "./audio.js";
import type {
  Decision,
  EmitOptions,
  FeedbackHandle,
  Preferences,
  Reason,
  Snapshot,
  SoundOptions,
  TraceEntry,
  Voice,
} from "./types.js";

const outcome = (event: string) =>
  /^(state\.|progress\.(complete|fail)|agent\.(ready|waiting-for-user|tool.failed))/.test(event);
const priorityFor = (event: string) =>
  /error|fail|warning/.test(event) ? 100 : outcome(event) ? 70 : 30;
const categoryFor = new Map(catalog.map(([event, , category]) => [event, category]));
const clamp = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

function preferences(
  previous: Preferences,
  input: Partial<Preferences> | null | undefined,
): Preferences {
  if (!input || typeof input !== "object") return previous;
  const categories: Preferences["categories"] = { ...previous.categories };
  if (input.categories && typeof input.categories === "object") {
    for (const category of [
      "Controls",
      "Feedback",
      "Navigation",
      "Progress",
      "Agent",
    ] as Category[]) {
      if (typeof input.categories[category] === "boolean")
        categories[category] = input.categories[category];
    }
  }
  return {
    enabled: typeof input.enabled === "boolean" ? input.enabled : previous.enabled,
    volume:
      typeof input.volume === "number" ? clamp(input.volume, previous.volume) : previous.volume,
    profile: ["quiet", "balanced", "expressive"].includes(input.profile ?? "")
      ? input.profile!
      : previous.profile,
    categories,
  };
}

export function createSoundSystem(options: SoundOptions = {}) {
  const provider = options.provider ?? webAudioProvider({ theme: options.theme });
  let prefs = preferences(
    { enabled: true, volume: 0.35, profile: "balanced", categories: {} },
    options.preferences,
  );
  try {
    prefs = preferences(prefs, options.storage?.load());
  } catch {
    /* A storage adapter cannot break feedback. */
  }
  provider.setVolume?.(prefs.volume);
  let destroyed = false;
  let speechActive = false;
  let sequence = 0;
  let trace: TraceEntry[] = [];
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const active = new Map<number, { priority: number; stop: () => void }>();
  const last = new Map<string, number>();
  const density = new Map<string, number[]>();
  const now = options.now ?? Date.now;
  const maxVoices = Number.isFinite(options.maxVoices ?? 4)
    ? Math.max(1, Math.min(16, Math.floor(options.maxVoices ?? 4)))
    : 4;
  let snapshot: Snapshot;
  const notify = () => {
    snapshot = {
      preferences: prefs,
      trace,
      activeVoices: active.size,
      speechActive,
      destroyed,
      provider: provider.name,
    };
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        /* Diagnostics must not break application work. */
      }
    }
  };
  const idle = () => {
    clearTimeout(idleTimer);
    if (!active.size && !destroyed)
      idleTimer = setTimeout(async () => {
        if (!active.size) {
          try {
            await provider.suspend?.();
          } catch {
            /* Optional provider lifecycle. */
          }
          notify();
        }
      }, options.idleSuspendMs ?? 800);
  };
  const push = (entry: TraceEntry) => {
    trace = [...trace, entry].slice(-Math.max(1, options.traceLimit ?? 100));
    notify();
  };
  const stopAll = () => {
    for (const entry of [...active.values()]) entry.stop();
  };
  const onVisibility = async () => {
    if (document.hidden) {
      stopAll();
      try {
        await provider.suspend?.();
      } catch {
        /* Optional provider lifecycle. */
      }
      notify();
    }
  };
  let observing = false;
  const observeVisibility = () => {
    if (!observing && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
      observing = true;
    }
  };
  notify();

  async function emit(event: SoundEvent, meta: EmitOptions = {}): Promise<FeedbackHandle> {
    const id = ++sequence;
    const time = now();
    const rule = options.policy?.[event];
    const category = categoryFor.get(event);
    const priority = rule?.priority ?? priorityFor(event);
    const key = `${meta.surface ?? "global"}:${event}`;
    const windowKey = meta.surface ?? "global";
    const recent = (density.get(windowKey) ?? []).filter((t) => time - t < 1000);
    let reason: Reason | undefined;
    if (destroyed) reason = "destroyed";
    else if (meta.signal?.aborted) reason = "cancelled";
    else if (!events.includes(event)) reason = "unknown-event";
    else if (!prefs.enabled || prefs.volume === 0) reason = "muted";
    else if (category && prefs.categories[category] === false) reason = "category";
    else if (rule?.enabled === false) reason = "profile";
    else if (prefs.profile === "quiet" && !outcome(event)) reason = "profile";
    else if (speechActive && priority < 80) reason = "speech";
    else if (typeof document !== "undefined" && document.visibilityState === "hidden")
      reason = "background";
    else if (meta.surface && options.mutedSurfaces?.includes(meta.surface)) reason = "surface";
    else if (options.requireVisibleEquivalent && outcome(event) && meta.visibleEquivalent !== true)
      reason = "visual-equivalent";
    else if (
      time - (last.get(key) ?? -Infinity) <
      (rule?.cooldownMs ??
        (event === "agent.streaming" ? 500 : prefs.profile === "expressive" ? 65 : 140))
    )
      reason = "cooldown";
    else if (
      recent.length >= (options.densityPerSecond ?? (prefs.profile === "expressive" ? 12 : 6)) &&
      priority < 90
    )
      reason = "density";
    const record = (decision: Decision, why?: Reason) =>
      push({
        id,
        event,
        time,
        source: meta.source,
        surface: meta.surface,
        provider: provider.name,
        decision,
        reason: why,
        active: decision === "played",
        loop: meta.loop === true,
      });
    const silent = (why: Reason, decision: Decision = "suppressed"): FeedbackHandle => {
      record(decision, why);
      return { id, decision, reason: why, stop() {}, ended: Promise.resolve() };
    };
    if (reason) return silent(reason);
    observeVisibility();
    if (active.size >= maxVoices) {
      const lower = [...active.values()].sort((a, b) => a.priority - b.priority)[0];
      if (lower && lower.priority < priority) lower.stop();
      else return silent("voice-limit");
    }
    clearTimeout(idleTimer);
    let voice: Voice | null = null;
    let stopped = false;
    let finish!: () => void;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    let finishUnlock: ((value: boolean) => void) | undefined;
    let finishPlayback: ((value: Voice | null) => void) | undefined;
    let playbackTimer: ReturnType<typeof setTimeout> | undefined;
    const providerAbort = new AbortController();
    const ended = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const stop = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      clearTimeout(unlockTimer);
      clearTimeout(playbackTimer);
      finishUnlock?.(false);
      finishPlayback?.(null);
      providerAbort.abort();
      meta.signal?.removeEventListener("abort", stop);
      try {
        voice?.stop();
      } catch {
        /* A provider's cleanup failure is isolated. */
      }
      active.delete(id);
      trace = trace.map((entry) => (entry.id === id ? { ...entry, active: false } : entry));
      finish();
      notify();
      idle();
    };
    active.set(id, { priority, stop });
    meta.signal?.addEventListener("abort", stop, { once: true });
    // Reserve cooldown and density before async unlock: concurrent requests cannot bypass policy.
    last.set(key, time);
    density.set(windowKey, [...recent, time]);
    notify();
    try {
      const interrupted = new Promise<boolean>((resolve) => {
        finishUnlock = resolve;
      });
      unlockTimer = setTimeout(() => finishUnlock?.(false), 1500);
      const unlocked = await Promise.race([provider.unlock(), interrupted]);
      clearTimeout(unlockTimer);
      finishUnlock = undefined;
      if (stopped || destroyed) {
        stop();
        return silent(destroyed ? "destroyed" : meta.signal?.aborted ? "cancelled" : "muted");
      }
      if (!unlocked) {
        stop();
        return silent("activation", "blocked");
      }
      const incomplete = new Promise<Voice | null>((resolve) => {
        finishPlayback = resolve;
      });
      playbackTimer = setTimeout(() => finishPlayback?.(null), 1500);
      const pendingPlayback = Promise.resolve(
        provider.play(event, {
          volume: clamp(rule?.volume ?? 1, 1) * (prefs.profile === "quiet" ? 0.65 : 1),
          loop: meta.loop === true,
          signal: providerAbort.signal,
        }),
      );
      void pendingPlayback.then(
        (lateVoice) => {
          if (stopped) lateVoice?.stop();
        },
        () => {},
      );
      voice = await Promise.race([pendingPlayback, incomplete]);
      clearTimeout(playbackTimer);
      finishPlayback = undefined;
      if (stopped || destroyed) {
        voice?.stop();
        stop();
        return silent(destroyed ? "destroyed" : meta.signal?.aborted ? "cancelled" : "muted");
      }
      if (!voice) {
        stop();
        return silent("provider", "error");
      }
      record("played");
      void voice.ended.then(stop, stop);
      timer = setTimeout(
        stop,
        Math.max(10, Math.min(rule?.maxDurationMs ?? (meta.loop ? 3000 : 3500), 30000)),
      );
      return { id, decision: "played", stop, ended };
    } catch (error) {
      stop();
      return silent(
        error instanceof Error && error.name === "NotAllowedError" ? "activation" : "provider",
        error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "error",
      );
    }
  }

  function begin(event: SoundEvent = "progress.start", meta: Omit<EmitOptions, "loop"> = {}) {
    let settled = false;
    const controller = new AbortController();
    const started = emit(event, { ...meta, loop: true, signal: controller.signal });
    let finish!: () => void;
    const ended = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const stop = () => {
      if (settled) return;
      settled = true;
      controller.abort();
      void started.then((handle) => handle.stop());
      finish();
    };
    void started.then((handle) => handle.ended.then(finish));
    return {
      stop,
      ended,
      update(next: SoundEvent) {
        return settled ? Promise.resolve(undefined) : emit(next, meta);
      },
      resolve(next: SoundEvent = "progress.complete") {
        if (settled) return Promise.resolve(undefined);
        stop();
        return emit(next, meta);
      },
      reject(next: SoundEvent = "progress.fail") {
        if (settled) return Promise.resolve(undefined);
        stop();
        return emit(next, meta);
      },
    };
  }

  return {
    emit,
    begin,
    unlock: async () => {
      if (destroyed) return Promise.resolve(false);
      observeVisibility();
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          provider.unlock(),
          new Promise<boolean>((resolve) => {
            timeout = setTimeout(() => resolve(false), 1500);
          }),
        ]);
      } catch {
        return false;
      } finally {
        clearTimeout(timeout);
      }
    },
    getStatus: () => ({ ...snapshot, audio: provider.getStatus?.() ?? "external" }),
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setPreferences(value: Partial<Preferences>) {
      if (destroyed) return;
      prefs = preferences(prefs, value);
      provider.setVolume?.(prefs.volume);
      if (!prefs.enabled || prefs.volume === 0 || value.profile || value.categories) stopAll();
      try {
        options.storage?.save(prefs);
      } catch {
        /* Device storage is optional. */
      }
      notify();
    },
    setSpeechActive(value: boolean) {
      speechActive = value;
      if (value) stopAll();
      notify();
    },
    clearTrace() {
      trace = [];
      notify();
    },
    exportTrace() {
      return JSON.stringify(
        {
          schemaVersion: 1,
          exportedAt: new Date(now()).toISOString(),
          preferences: prefs,
          provider: provider.name,
          trace,
        },
        null,
        2,
      );
    },
    stopAll,
    async suspend() {
      stopAll();
      await provider.suspend?.();
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      stopAll();
      clearTimeout(idleTimer);
      if (typeof document !== "undefined")
        document.removeEventListener("visibilitychange", onVisibility);
      await provider.destroy?.();
      notify();
      listeners.clear();
    },
  };
}

export type SoundSystem = ReturnType<typeof createSoundSystem>;
