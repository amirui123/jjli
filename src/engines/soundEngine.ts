/**
 * RTL Motion Lab — layered procedural synth.
 *
 * Everything is generated from a small, declarative design DSL: oscillators,
 * noise colours, bells, arpeggios, filters with sweeps, stereo panning, LFOs
 * and a generated convolution reverb. No audio files, no downloads, ~0 KB.
 *
 * The 200 legacy recipes coming from the vendored toolkit are mapped onto the
 * same DSL, so they gain the richer synthesis instead of the old two-oscillator
 * sketch (which is why several of them used to sound broken or identical).
 */

/* ------------------------------------------------------------------ types */

export type SoundCategory =
  | "ui"
  | "impact"
  | "sweep"
  | "air"
  | "texture"
  | "cinematic"
  | "notify";

export interface FilterSpec {
  type: "lowpass" | "highpass" | "bandpass";
  f: number;
  to?: number;
  q?: number;
}

export interface LfoSpec {
  rate: number;
  depth: number;
  target?: "gain" | "filter" | "pan" | "pitch";
}

export interface ToneLayer {
  k: "tone";
  /** base frequency, or a chord */
  f: number | number[];
  /** glide target */
  to?: number;
  dur: number;
  at?: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  partials?: { m: number; a: number; d?: number }[];
  detune?: number;
  pan?: number;
  filter?: FilterSpec;
  lfo?: LfoSpec;
}

export interface NoiseLayer {
  k: "noise";
  dur: number;
  at?: number;
  gain?: number;
  color?: "white" | "pink" | "brown";
  attack?: number;
  release?: number;
  pan?: number;
  filter?: FilterSpec;
  lfo?: LfoSpec;
}

export interface BellLayer {
  k: "bell";
  f: number;
  dur: number;
  at?: number;
  gain?: number;
  pan?: number;
  /** [partial multiplier, amplitude, decay share] */
  ratios?: [number, number, number][];
}

export interface SeqLayer {
  k: "seq";
  steps: { f: number; at: number; dur: number; gain?: number; type?: OscillatorType }[];
  gain?: number;
  pan?: number;
  filter?: FilterSpec;
}

export type SoundLayer = ToneLayer | NoiseLayer | BellLayer | SeqLayer;

export interface SoundDesign {
  duration: number;
  gain?: number;
  reverb?: { decay: number; mix: number };
  layers: SoundLayer[];
}

export interface SoundItem {
  id: string;
  nameFa: string;
  category: SoundCategory;
  duration: number;
  descFa: string;
  tags: string[];
  design: SoundDesign;
}

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

/* ---------------------------------------------------------------- helpers */

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

/** Short, deterministic pink/brown-ish noise buffer (built once per context). */
function noiseBuffer(ctx: BaseAudioContext, color: "white" | "pink" | "brown", seconds: number) {
  const len = Math.max(128, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "pink") {
      b0 = 0.99765 * b0 + white * 0.099;
      b1 = 0.963 * b1 + white * 0.2965;
      data[i] = (b0 + b1 + white * 0.1848) * 0.34;
    } else if (color === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

/** Generated impulse response — a real reverb, no assets. */
function impulse(ctx: BaseAudioContext, decay: number) {
  const rate = ctx.sampleRate;
  const len = Math.max(1, Math.floor(rate * clamp(decay, 0.05, 6)));
  const buffer = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.4) * (1 - t * 0.15);
    }
  }
  return buffer;
}

/* ------------------------------------------------------------------ engine */

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseCache = new Map<string, AudioBuffer>();
  public enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
    }
    return this.ctx;
  }

  private noise(ctx: BaseAudioContext, color: "white" | "pink" | "brown") {
    const key = `${color}`;
    let buffer = this.noiseCache.get(key);
    if (!buffer || buffer.sampleRate !== ctx.sampleRate) {
      buffer = noiseBuffer(ctx, color, 2.5);
      this.noiseCache.set(key, buffer);
    }
    return buffer;
  }

  /* --------------------------------------------------------------- voices */

  private filterNode(ctx: BaseAudioContext, spec: FilterSpec, cutoffScale: number, at: number, dur: number) {
    const filter = ctx.createBiquadFilter();
    filter.type = spec.type;
    const from = clamp(spec.f * cutoffScale, 30, 19000);
    filter.frequency.setValueAtTime(from, at);
    if (spec.to && spec.to !== spec.f) {
      filter.frequency.exponentialRampToValueAtTime(
        clamp(spec.to * cutoffScale, 30, 19000),
        at + Math.max(0.02, dur * 0.9)
      );
    }
    if (spec.q) filter.Q.setValueAtTime(clamp(spec.q, 0.0001, 30), at);
    return filter;
  }

  private lfo(ctx: BaseAudioContext, spec: LfoSpec, param: AudioParam, at: number, dur: number, scale = 1) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(clamp(spec.rate, 0.02, 30), at);
    amp.gain.setValueAtTime(Math.abs(spec.depth) * scale, at);
    osc.connect(amp);
    amp.connect(param);
    osc.start(at);
    osc.stop(at + dur + 0.05);
    return { osc, amp };
  }

  private envelope(
    ctx: BaseAudioContext,
    node: GainNode,
    at: number,
    dur: number,
    peak: number,
    attack = 0.006,
    release = 0.18
  ) {
    const a = clamp(attack, 0.001, Math.max(0.002, dur * 0.9));
    const r = clamp(release, 0.02, Math.max(0.03, dur));
    const sustainUntil = Math.max(at + a + 0.001, at + dur - r);
    node.gain.setValueAtTime(0.0001, at);
    node.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + a);
    if (sustainUntil > at + a) node.gain.linearRampToValueAtTime(Math.max(peak * 0.86, 0.0002), sustainUntil);
    node.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  }

  /** Renders one design into any BaseAudioContext (live or offline). */
  private render(
    ctx: BaseAudioContext,
    destination: AudioNode,
    design: SoundDesign,
    options: PlayOptions,
    startAt: number
  ) {
    const pitch = clamp(options.pitch ?? 1, 0.25, 4);
    const gainScale = clamp(options.gain ?? 1, 0, 2.5);
    const cutoffScale = clamp(options.cutoff ?? 1, 0.15, 4);
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);

    const master = ctx.createGain();
    master.gain.setValueAtTime(clamp((design.gain ?? 0.9) * gainScale, 0, 2.4), startAt);
    master.connect(destination);

    let bus: AudioNode = master;
    if (design.reverb && design.reverb.mix > 0) {
      const convolver = ctx.createConvolver();
      convolver.buffer = impulse(ctx, design.reverb.decay);
      const wet = ctx.createGain();
      wet.gain.setValueAtTime(clamp(design.reverb.mix, 0, 1), startAt);
      const dry = ctx.createGain();
      dry.gain.setValueAtTime(1 - clamp(design.reverb.mix, 0, 0.9) * 0.5, startAt);
      const split = ctx.createGain();
      split.connect(dry);
      dry.connect(master);
      split.connect(convolver);
      convolver.connect(wet);
      wet.connect(master);
      bus = split;
    }

    const place = (node: AudioNode, pan?: number) => {
      if (!pan || !("createStereoPanner" in ctx)) {
        node.connect(bus);
        return;
      }
      const panner = (ctx as AudioContext).createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -1, 1), startAt);
      node.connect(panner);
      panner.connect(bus);
    };

    for (const layer of design.layers) {
      const at = startAt + (layer.k === "seq" ? 0 : layer.at ?? 0);
      const dur = Math.max(0.02, (layer.k === "seq" ? design.duration : layer.dur) * (layer.k === "noise" ? stretch : 1));

      if (layer.k === "tone") {
        const freqs = Array.isArray(layer.f) ? layer.f : [layer.f];
        const out = ctx.createGain();
        out.gain.setValueAtTime(1 / Math.sqrt(freqs.length), startAt);
        let tail: AudioNode = out;
        if (layer.filter) {
          const f = this.filterNode(ctx, layer.filter, cutoffScale, at, dur);
          out.connect(f);
          tail = f;
        }
        place(tail, layer.pan);

        const voiceGain = ctx.createGain();
        const peak = clamp(layer.gain ?? 0.18, 0.0005, 1.2);
        this.envelope(ctx, voiceGain, at, dur, peak, layer.attack ?? 0.006, layer.release ?? Math.min(0.4, dur * 0.5));
        voiceGain.connect(out);

        freqs.forEach((base, index) => {
          const osc = ctx.createOscillator();
          osc.type = layer.type ?? "sine";
          const f0 = clamp(base * pitch, 20, 16000);
          const f1 = clamp((layer.to ?? base) * pitch * (1 + index * 0.003), 20, 17000);
          osc.frequency.setValueAtTime(f0, at);
          if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.82);
          if (layer.detune) osc.detune.setValueAtTime(clamp(layer.detune, -1200, 1200), at);
          if (layer.lfo?.target === "pitch") this.lfo(ctx, layer.lfo, osc.detune, at, dur, 60);
          osc.connect(voiceGain);
          osc.start(at);
          osc.stop(at + dur + 0.03);

          for (const p of layer.partials ?? []) {
            const part = ctx.createOscillator();
            const pg = ctx.createGain();
            part.type = "sine";
            part.frequency.setValueAtTime(clamp(f0 * p.m, 20, 18000), at);
            const pd = clamp(p.d ?? dur, 0.02, dur);
            pg.gain.setValueAtTime(0.0001, at);
            pg.gain.exponentialRampToValueAtTime(clamp(peak * p.a, 0.00005, 1), at + 0.008);
            pg.gain.exponentialRampToValueAtTime(0.0001, at + pd);
            part.connect(pg);
            pg.connect(out);
            part.start(at);
            part.stop(at + pd + 0.02);
          }
        });

        if (layer.lfo?.target === "gain") this.lfo(ctx, layer.lfo, voiceGain.gain, at, dur, peak * 0.6);
      }

      if (layer.k === "noise") {
        const src = ctx.createBufferSource();
        src.buffer = this.noise(ctx, layer.color ?? "white");
        src.loop = true;
        const env = ctx.createGain();
        const peak = clamp(layer.gain ?? 0.12, 0.0005, 1);
        this.envelope(ctx, env, at, dur, peak, layer.attack ?? 0.01, layer.release ?? Math.min(0.5, dur * 0.6));
        let tail: AudioNode = env;
        if (layer.filter) {
          const f = this.filterNode(ctx, layer.filter, cutoffScale, at, dur);
          env.connect(f);
          tail = f;
        }
        place(tail, layer.pan);
        if (layer.lfo?.target === "gain") this.lfo(ctx, layer.lfo, env.gain, at, dur, peak * 0.5);
        if (layer.lfo?.target === "filter" && layer.filter) {
          const f = (tail as BiquadFilterNode).frequency;
          if (f) this.lfo(ctx, layer.lfo, f, at, dur, 900);
        }
        src.connect(env);
        src.start(at);
        src.stop(at + dur + 0.05);
      }

      if (layer.k === "bell") {
        const ratios = layer.ratios ?? [
          [1, 1, 1],
          [2.01, 0.42, 0.72],
          [3.02, 0.22, 0.52],
          [4.7, 0.11, 0.4],
          [7.1, 0.05, 0.28],
        ];
        const out = ctx.createGain();
        out.gain.setValueAtTime(clamp(layer.gain ?? 0.2, 0.0005, 1), startAt);
        place(out, layer.pan);
        for (const [m, amp, decayShare] of ratios) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(clamp(layer.f * m * pitch, 20, 18000), at);
          const d = clamp(dur * decayShare, 0.03, dur * 2);
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(Math.max(amp, 0.0002), at + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, at + d);
          osc.connect(g);
          g.connect(out);
          osc.start(at);
          osc.stop(at + d + 0.02);
        }
      }

      if (layer.k === "seq") {
        const out = ctx.createGain();
        out.gain.setValueAtTime(clamp(layer.gain ?? 0.8, 0.001, 1.5), startAt);
        let tail: AudioNode = out;
        if (layer.filter) {
          const f = this.filterNode(ctx, layer.filter, cutoffScale, at, dur);
          out.connect(f);
          tail = f;
        }
        place(tail, layer.pan);
        for (const step of layer.steps) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const sAt = at + step.at;
          const sDur = Math.max(0.03, step.dur);
          osc.type = step.type ?? "triangle";
          osc.frequency.setValueAtTime(clamp(step.f * pitch, 20, 16000), sAt);
          g.gain.setValueAtTime(0.0001, sAt);
          g.gain.exponentialRampToValueAtTime(clamp(step.gain ?? 0.2, 0.0002, 1), sAt + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, sAt + sDur);
          osc.connect(g);
          g.connect(out);
          osc.start(sAt);
          osc.stop(sAt + sDur + 0.02);
        }
      }
    }
  }

  /* ------------------------------------------------------------- playback */

  playDesign(design: SoundDesign, options: PlayOptions = {}) {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    try {
      this.render(ctx, ctx.destination, design, options, ctx.currentTime + 0.01);
      return true;
    } catch {
      return false;
    }
  }

  async renderDesign(design: SoundDesign, options: PlayOptions = {}): Promise<AudioBuffer | null> {
    const OfflineCtor =
      typeof window !== "undefined"
        ? window.OfflineAudioContext ||
          (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
        : undefined;
    if (!OfflineCtor) return null;
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);
    const seconds = clamp(design.duration * stretch + 0.25, 0.2, 30);
    const sampleRate = 44100;
    const offline = new OfflineCtor(1, Math.ceil(sampleRate * seconds), sampleRate);
    this.render(offline, offline.destination, design, { ...options, stretch }, 0);
    return offline.startRendering();
  }

  async renderDesignWav(design: SoundDesign, options: PlayOptions = {}): Promise<Blob> {
    const rendered = await this.renderDesign(design, options);
    if (!rendered || rendered.length === 0) throw new Error("offline audio unavailable");
    return encodeWav(rendered);
  }

  /** Backwards-compatible entry points for the 200 legacy recipes. */
  playRecipe(recipe: LegacyRecipe, options: PlayOptions = {}) {
    return this.playDesign(designFromLegacy(recipe), options);
  }

  async renderWavFor(item: SoundItem, options: PlayOptions = {}): Promise<Blob> {
    return this.renderDesignWav(item.design, options);
  }

  /* ------------------------------------------------------------ UI sounds */

  /** Convenience wrappers used across the app (kept intentionally cheap). */
  private quick(design: SoundDesign) {
    if (!this.enabled) return;
    this.playDesign(design, { gain: 0.7 });
  }

  playTick(pitch = 1) {
    this.quick({
      duration: 0.09,
      layers: [{ k: "tone", f: 1250, to: 980, dur: 0.07, gain: 0.16, filter: { type: "highpass", f: 700 } }],
    });
    void pitch;
  }

  playSnap() {
    this.quick({
      duration: 0.14,
      layers: [
        { k: "tone", f: 620, to: 380, dur: 0.1, gain: 0.2, partials: [{ m: 2.4, a: 0.2, d: 0.05 }] },
        { k: "noise", color: "white", dur: 0.05, gain: 0.08, filter: { type: "highpass", f: 2400 } },
      ],
    });
  }

  playSpring() {
    this.quick({
      duration: 0.34,
      layers: [
        { k: "tone", f: 320, to: 720, dur: 0.3, gain: 0.14, type: "triangle", lfo: { rate: 18, depth: 20, target: "pitch" } },
        { k: "tone", f: 480, to: 1080, dur: 0.24, gain: 0.05 },
      ],
    });
  }

  playSuccess() {
    this.quick({
      duration: 0.6,
      reverb: { decay: 0.5, mix: 0.2 },
      layers: [
        {
          k: "seq",
          gain: 0.5,
          steps: [
            { f: 783.99, at: 0, dur: 0.16 },
            { f: 1046.5, at: 0.09, dur: 0.22 },
          ],
        },
      ],
    });
  }

  playError() {
    this.quick({
      duration: 0.3,
      layers: [{ k: "tone", f: 220, to: 160, dur: 0.26, gain: 0.16, type: "square", filter: { type: "lowpass", f: 1200 } }],
    });
  }

  playThock() {
    this.quick({
      duration: 0.12,
      layers: [
        { k: "tone", f: 175, to: 48, dur: 0.1, gain: 0.22, type: "triangle" },
        { k: "noise", color: "brown", dur: 0.06, gain: 0.06, filter: { type: "lowpass", f: 900 } },
      ],
    });
  }
}

export const soundEngine = new ProceduralSoundEngine();

/* ------------------------------------------------- legacy recipe bridging */

export interface LegacyRecipe {
  id: string;
  duration: number;
  lowpass: number;
  freqFrom: number;
  freqTo: number;
  hasNoise: boolean;
  snippet?: string;
}

/**
 * Old recipes only carried four numbers. Mapping them onto the layered DSL
 * keeps every one of the 200 sounding different (and audible) instead of the
 * former two-oscillator sketch that collapsed into the same blip.
 */
export function designFromLegacy(r: LegacyRecipe): SoundDesign {
  const dur = clamp(r.duration || 0.25, 0.06, 6);
  const sweep = Math.abs(r.freqTo - r.freqFrom) / Math.max(r.freqFrom, 1);
  const bright = clamp((r.lowpass || 6000) / 8000, 0.2, 1.6);
  const layers: SoundLayer[] = [
    {
      k: "tone",
      f: clamp(r.freqFrom || 320, 40, 5000),
      to: clamp(r.freqTo || r.freqFrom || 320, 40, 8000),
      dur,
      gain: 0.16,
      type: sweep > 0.6 ? "triangle" : "sine",
      partials: [
        { m: 2, a: 0.28 * bright, d: dur * 0.7 },
        { m: 3.01, a: 0.12 * bright, d: dur * 0.5 },
      ],
      filter: { type: "lowpass", f: clamp((r.lowpass || 6000) * 0.8, 200, 16000), q: 0.8 },
      attack: Math.min(0.05, dur * 0.15),
      release: Math.min(0.4, dur * 0.7),
    },
  ];
  if (r.hasNoise) {
    layers.push({
      k: "noise",
      color: "white",
      dur: Math.min(dur, 0.5),
      gain: 0.06,
      filter: { type: "bandpass", f: clamp(r.freqFrom * 3, 300, 12000), q: 1.2 },
      attack: 0.002,
      release: Math.min(0.3, dur),
    });
  }
  return { duration: dur + 0.1, gain: 0.85, reverb: { decay: Math.min(1.6, dur * 1.4), mix: 0.16 }, layers };
}
