import {
  createTheme,
  renderPCM,
  validateTheme,
  type SoundEvent,
  type SoundTheme,
  type ThemeName,
} from "./catalog.js";
import type { Provider, Voice } from "./types.js";

export function webAudioProvider(
  options: { theme?: ThemeName | SoundTheme; context?: AudioContext; destination?: AudioNode } = {},
): Provider {
  const theme = typeof options.theme === "object" ? options.theme : createTheme(options.theme);
  if (!validateTheme(theme))
    throw new TypeError("Theme must implement every Sonant event with valid recipes.");
  let context = options.context;
  let master: GainNode | undefined;
  let volume = 0.35;
  let destroyed = false;
  const buffers = new Map<SoundEvent, AudioBuffer>();
  const voices = new Set<Voice>();
  const setup = () => {
    if (destroyed) return undefined;
    if (!context) {
      if (typeof globalThis.AudioContext === "undefined") return undefined;
      context = new globalThis.AudioContext();
    }
    if (!master) {
      master = context.createGain();
      master.gain.value = volume;
      master.connect(options.destination ?? context.destination);
    }
    return context;
  };
  return {
    name: "Web Audio",
    async unlock() {
      try {
        const ctx = setup();
        if (!ctx) return false;
        if (ctx.state === "suspended") await ctx.resume();
        return ctx.state === "running";
      } catch {
        return false;
      }
    },
    play(event, settings) {
      const ctx = context;
      if (!ctx || !master || ctx.state !== "running" || destroyed) return null;
      let buffer = buffers.get(event);
      if (!buffer) {
        const samples = renderPCM(theme[event], ctx.sampleRate);
        buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
        buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
        buffers.set(event, buffer);
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = settings.loop;
      // Loops breathe once per second; they never emit at token frequency.
      if (settings.loop && buffer.duration < 0.9) {
        const padded = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        padded.copyToChannel(buffer.getChannelData(0) as Float32Array<ArrayBuffer>, 0);
        source.buffer = padded;
      }
      gain.gain.value = settings.volume;
      source.connect(gain);
      gain.connect(master);
      let finish!: () => void;
      let stopped = false;
      const ended = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const voice: Voice = {
        ended,
        stop() {
          if (stopped) return;
          stopped = true;
          try {
            source.stop();
          } catch {
            /* Already ended. */
          }
          source.disconnect();
          gain.disconnect();
          voices.delete(voice);
          finish();
        },
      };
      source.onended = () => voice.stop();
      voices.add(voice);
      source.start();
      return voice;
    },
    setVolume(value) {
      volume = value;
      if (master && context) master.gain.setTargetAtTime(value, context.currentTime, 0.015);
    },
    getStatus: () => (destroyed ? "closed" : (context?.state ?? "locked")),
    async suspend() {
      if (!options.context && context?.state === "running") await context.suspend();
    },
    async destroy() {
      destroyed = true;
      for (const voice of voices) voice.stop();
      buffers.clear();
      master?.disconnect();
      if (!options.context && context && context.state !== "closed") await context.close();
    },
  };
}
