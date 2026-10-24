import type { SoundEvent } from "./catalog.js";
import type { Provider, Voice } from "./types.js";

export { webAudioProvider } from "./audio.js";

/** Connect an existing sound engine without importing it into Sonant. */
export function mappedProvider<T extends string>(options: {
  name: string;
  mapping: Partial<Record<SoundEvent, T>>;
  unlock: () => boolean | Promise<boolean>;
  play: (
    cue: T,
    options: { volume: number; loop: boolean; signal?: AbortSignal },
  ) => Voice | null | Promise<Voice | null>;
  setVolume?: (volume: number) => void;
  suspend?: () => void | Promise<void>;
  destroy?: () => void | Promise<void>;
}): Provider {
  return {
    name: options.name,
    unlock: async () => options.unlock(),
    play(event, settings) {
      const cue = options.mapping[event];
      return cue ? options.play(cue, settings) : null;
    },
    setVolume: options.setVolume,
    suspend: options.suspend,
    destroy: options.destroy,
  };
}

/** Application-owned samples. URLs are only requested during explicit playback. */
export function htmlAudioProvider(assets: Partial<Record<SoundEvent, string>>): Provider {
  const voices = new Set<{ audio: HTMLAudioElement; voice: Voice; gain: number }>();
  let volume = 0.35;
  let destroyed = false;
  return {
    name: "HTML Audio",
    async unlock() {
      return !destroyed && typeof Audio !== "undefined";
    },
    async play(event, settings) {
      if (destroyed || settings.signal?.aborted || !assets[event] || typeof Audio === "undefined")
        return null;
      const audio = new Audio(assets[event]);
      audio.volume = volume * settings.volume;
      audio.loop = settings.loop;
      let finish!: () => void;
      const ended = new Promise<void>((resolve) => {
        finish = resolve;
      });
      let stopped = false;
      const item = {
        audio,
        gain: settings.volume,
        voice: {
          ended,
          stop() {
            if (stopped) return;
            stopped = true;
            settings.signal?.removeEventListener("abort", abort);
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            voices.delete(item);
            finish();
          },
        },
      };
      const abort = () => item.voice.stop();
      settings.signal?.addEventListener("abort", abort, { once: true });
      audio.onended = () => item.voice.stop();
      audio.onerror = () => item.voice.stop();
      voices.add(item);
      try {
        await audio.play();
      } catch (error) {
        item.voice.stop();
        throw error;
      }
      return item.voice;
    },
    setVolume(value) {
      volume = value;
      for (const { audio, gain } of voices) audio.volume = value * gain;
    },
    suspend() {
      for (const { voice } of [...voices]) voice.stop();
    },
    destroy() {
      destroyed = true;
      for (const { voice } of [...voices]) voice.stop();
    },
  };
}
