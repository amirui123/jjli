/**
 * RTL Motion Lab — Full 200+ Procedural Web Audio Synthesizer Engine
 * Zero external MP3 dependencies. Synthesizes all 200 sound recipes from
 * toolkit/07-core-engines/03-procedural-sound-engine/ in real time.
 */

import type { SoundRecipeItem } from "../data/soundsManifest";

/* ------------------------------------------------------------------ helpers */

export interface PlayOptions {
  /** pitch multiplier (0.25 – 4) */
  pitch?: number;
  /** output gain multiplier (0 – 2.5) */
  gain?: number;
  /** lowpass cutoff multiplier (0.15 – 4) */
  cutoff?: number;
  /** duration multiplier (0.25 – 4) */
  stretch?: number;
  /** force the procedural noise burst on/off */
  noise?: boolean;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(v) ? v : min, min), max);
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataSize = samples.length * 2;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([out], { type: "audio/wav" });
}



class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Synthesize any of the 200 procedural sound recipes from the toolkit.
   * Accepts optional overrides so the Sound Studio edits are audible & real.
   */
  playRecipe(recipe: SoundRecipeItem, opts: PlayOptions | number = {}) {
    const options: PlayOptions = typeof opts === "number" ? { pitch: opts } : opts;
    const ctx = this.getContext();
    if (!ctx) return;
    this.schedule(ctx, ctx.destination, recipe, options, ctx.currentTime);
  }

  /** Shared scheduler used by live playback (AudioContext) and WAV export (OfflineAudioContext). */
  private schedule(
    ctx: BaseAudioContext,
    destination: AudioNode,
    recipe: SoundRecipeItem,
    options: PlayOptions,
    startAt: number
  ) {
    const pitch = clamp(options.pitch ?? 1, 0.25, 4);
    const gainScale = clamp(options.gain ?? 1, 0, 2.5);
    const cutoffScale = clamp(options.cutoff ?? 1, 0.15, 4);
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);
    const noiseOn = options.noise ?? recipe.hasNoise;

    const now = startAt;
    const dur = clamp((recipe.duration || 0.18) * stretch, 0.03, 3.2);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(
      clamp((recipe.lowpass || 5000) * cutoffScale, 200, 18000),
      now
    );
    filter.connect(destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = recipe.freqFrom > recipe.freqTo ? "triangle" : "sine";

    const fStart = clamp((recipe.freqFrom || 320) * pitch, 40, 12000);
    const fEnd = clamp((recipe.freqTo || 520) * pitch, 30, 14000);

    osc.frequency.setValueAtTime(fStart, now);
    osc.frequency.exponentialRampToValueAtTime(fEnd, now + dur * 0.75);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(
      clamp(0.14 * gainScale, 0, 0.9),
      now + Math.min(0.012, dur * 0.2)
    );
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + dur + 0.02);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(fStart * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(fEnd * 1.5, now + dur * 0.65);
    gain2.gain.setValueAtTime(clamp(0.04 * gainScale, 0, 0.5), now);
    gain2.gain.exponentialRampToValueAtTime(0.0005, now + dur * 0.8);
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start(now);
    osc2.stop(now + dur);

    if (noiseOn) {
      const bufferSize = Math.max(64, Math.floor(ctx.sampleRate * Math.min(dur, 0.15)));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(clamp(0.05 * gainScale, 0, 0.6), now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(dur, 0.15));
      noise.connect(nGain);
      nGain.connect(filter);
      noise.start(now);
    }
  }

  /** Offline render → AudioBuffer (used for real waveform drawing). */
  async renderBuffer(recipe: SoundRecipeItem, options: PlayOptions = {}): Promise<AudioBuffer | null> {
    const OfflineCtor =
      typeof window !== "undefined"
        ? window.OfflineAudioContext ||
          (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
            .webkitOfflineAudioContext
        : undefined;
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);
    const seconds = clamp((recipe.duration || 0.18) * stretch + 0.12, 0.2, 4);
    const sampleRate = 44100;

    if (!OfflineCtor) return null;

    const offline = new OfflineCtor(1, Math.ceil(sampleRate * seconds), sampleRate);
    this.schedule(offline, offline.destination, recipe, options, 0);
    return offline.startRendering();
  }

  /** Offline render of a recipe to a downloadable 16-bit WAV. */
  async renderWav(recipe: SoundRecipeItem, options: PlayOptions = {}): Promise<Blob> {
    const rendered = await this.renderBuffer(recipe, options);
    // never hand the user an empty 44-byte header: fail loudly so the UI can say so
    if (!rendered || rendered.length === 0) {
      throw new Error("offline audio rendering is unavailable in this browser");
    }
    return encodeWav(rendered);
  }

  /** Mechanical Topre/Cherry switch "thock" for primary buttons */
  playThock() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.055);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  /** Crisp magnetic snap for tabs, dock items & toggles */
  playSnap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.032);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Subtle rotary encoder tick for physics sliders */
  playTick(pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const baseFreq = Math.min(Math.max(320 * pitchMultiplier, 180), 980);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.018);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.022);
  }

  /** Harmonic spring pluck for physics & morphing cards */
  playSpring() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Crystalline chord shimmer for AI generation, code copy & bug auto-fix */
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const start = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }
}

export const soundEngine = new ProceduralSoundEngine();
