/**
 * RTL Motion Lab — Full 200+ Procedural Web Audio Synthesizer Engine
 * Zero external MP3 dependencies. Synthesizes all 200 sound recipes from
 * toolkit/07-core-engines/03-procedural-sound-engine/ in real time.
 */

import type { SoundRecipeItem } from "../data/toolkitManifest";

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

  /** Synthesize any of the 200 procedural sound recipes from the toolkit */
  playRecipe(recipe: SoundRecipeItem, pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.min(Math.max(recipe.duration || 0.18, 0.04), 1.6);

    // Master lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(
      Math.min(Math.max(recipe.lowpass || 5000, 300), 16000),
      now
    );
    filter.connect(ctx.destination);

    // Primary harmonic oscillator sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = recipe.freqFrom > recipe.freqTo ? "triangle" : "sine";

    const fStart = Math.min(
      Math.max((recipe.freqFrom || 320) * pitchMultiplier, 55),
      4000
    );
    const fEnd = Math.min(
      Math.max((recipe.freqTo || 520) * pitchMultiplier, 45),
      4500
    );

    osc.frequency.setValueAtTime(fStart, now);
    osc.frequency.exponentialRampToValueAtTime(fEnd, now + dur * 0.75);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + Math.min(0.012, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + dur + 0.02);

    // Secondary harmonic partial for richer timbre
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(fStart * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(fEnd * 1.5, now + dur * 0.65);
    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.0005, now + dur * 0.8);
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start(now);
    osc2.stop(now + dur);

    // Optional procedural noise burst for tactile clicks/thocks/air
    if (recipe.hasNoise) {
      const bufferSize = Math.floor(ctx.sampleRate * Math.min(dur, 0.15));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.05, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(dur, 0.15));
      noise.connect(nGain);
      nGain.connect(filter);
      noise.start(now);
    }
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
