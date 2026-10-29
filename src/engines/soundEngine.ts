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

export type SoundCategory = "ui" | "impact" | "sweep" | "air" | "texture" | "cinematic" | "notify";

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
  /** playback the user explicitly asked for, even when global UI sound is muted */
  force?: boolean;
  /** layer this voice on top of whatever is already playing (UI ticks) */
  overlap?: boolean;
}

/* ---------------------------------------------------------------- helpers */

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(v) ? v : min, min), max);
}

/** Largest absolute sample in a rendered buffer (0 when empty). */
function peakOf(buffer: AudioBuffer) {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i]);
      if (!Number.isFinite(v)) return Number.POSITIVE_INFINITY;
      if (v > peak) peak = v;
    }
  }
  return peak;
}

/**
 * طول واقعی شنیدنی یک طراحی — با احتساب استرچ نویز، انتهای آخرین لایه و دنباله ریورب.
 * UI باید همین را برای نوار پیشرفت و تایمر توقف استفاده کند، نه عدد دستی.
 */
export function audibleDuration(design: SoundDesign, options: PlayOptions = {}): number {
  const stretch = clamp(options.stretch ?? 1, 0.25, 4);
  let end = 0;
  for (const layer of design.layers) {
    if (options.noise === false && layer.k === "noise") continue;
    if (layer.k === "seq") {
      const lastStep = layer.steps.reduce((m, step) => Math.max(m, step.at + step.dur), 0);
      end = Math.max(end, lastStep * stretch);
      continue;
    }
    end = Math.max(end, ((layer.at ?? 0) + layer.dur) * stretch);
  }
  end = Math.max(end, design.duration * Math.min(1, stretch));
  if (design.reverb && design.reverb.mix > 0) {
    end += Math.min(2.5, design.reverb.decay * 0.6 * design.reverb.mix);
  }
  return Math.max(0.05, end);
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

interface ActiveVoice {
  master: GainNode;
  limiter: AudioNode | null;
  /** wall-clock time (ms) after which the voice is considered finished */
  endsAt: number;
}

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseCache = new Map<string, AudioBuffer>();
  private impulseCache = new Map<string, AudioBuffer>();
  private active = new Set<ActiveVoice>();
  public enabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx && this.ctx.state === "closed") this.ctx = null;
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

  /** Ramp every live voice to silence and release its nodes. */
  stopAll(fade = 0.035) {
    const ctx = this.ctx;
    if (this.active.size === 0) return;
    if (!ctx) {
      this.active.clear();
      return;
    }
    const now = ctx.currentTime;
    const wait = Math.ceil((fade + 0.12) * 1000);
    for (const voice of this.active) {
      const gain = voice.master.gain;
      try {
        const current = Math.max(gain.value, 0.0002);
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(current, now);
        gain.exponentialRampToValueAtTime(0.0001, now + fade);
      } catch {
        /* param already torn down */
      }
      if (typeof window === "undefined") continue;
      window.setTimeout(() => {
        try {
          voice.master.disconnect();
          voice.limiter?.disconnect();
        } catch {
          /* already disconnected */
        }
      }, wait);
    }
    this.active.clear();
  }

  /** "none" until the first user gesture creates the audio context. */
  get contextState(): AudioContextState | "none" {
    return this.ctx ? this.ctx.state : "none";
  }

  /** True while any voice is still audible (used by the studio play/stop button). */
  get playing() {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    for (const voice of this.active) if (voice.endsAt > now) return true;
    return false;
  }

  private prune() {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    for (const voice of this.active) {
      if (voice.endsAt + 500 < now) this.active.delete(voice);
    }
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

  private impulseFor(ctx: BaseAudioContext, decay: number) {
    const key = `${ctx.sampleRate}:${clamp(decay, 0.05, 6).toFixed(2)}`;
    let buffer = this.impulseCache.get(key);
    if (!buffer) {
      buffer = impulse(ctx, decay);
      this.impulseCache.set(key, buffer);
    }
    return buffer;
  }

  /* --------------------------------------------------------------- voices */

  private filterNode(
    ctx: BaseAudioContext,
    spec: FilterSpec,
    cutoffScale: number,
    at: number,
    dur: number
  ) {
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

  private lfo(
    ctx: BaseAudioContext,
    spec: LfoSpec,
    param: AudioParam,
    at: number,
    dur: number,
    scale = 1
  ) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(clamp(spec.rate, 0.02, 30), at);
    /* Depth is bounded: an unbounded filter LFO used to push the biquad into
       numerical blow-up (NaN → 1e38 samples) on long wind/pad textures. */
    amp.gain.setValueAtTime(clamp(Math.abs(spec.depth) * scale, 0, 6000), at);
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
    if (sustainUntil > at + a)
      node.gain.linearRampToValueAtTime(Math.max(peak * 0.86, 0.0002), sustainUntil);
    node.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  }

  /** Renders one design into any BaseAudioContext (live or offline). */
  private render(
    ctx: BaseAudioContext,
    destination: AudioNode,
    design: SoundDesign,
    options: PlayOptions,
    startAt: number,
    register = false
  ) {
    const pitch = clamp(options.pitch ?? 1, 0.25, 4);
    const gainScale = clamp(options.gain ?? 1, 0, 2.5);
    const cutoffScale = clamp(options.cutoff ?? 1, 0.15, 4);
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);

    /* `options.noise` is a real switch, not decoration:
       false → drop noise layers, true → add one when the design has none. */
    let layers: SoundLayer[] = design.layers;
    if (options.noise === false) {
      layers = layers.filter((layer) => layer.k !== "noise");
    } else if (options.noise === true && !layers.some((layer) => layer.k === "noise")) {
      layers = [
        ...layers,
        {
          k: "noise",
          color: "white",
          dur: Math.max(0.05, Math.min(0.4, design.duration * 0.5)),
          gain: 0.05,
          attack: 0.004,
          release: 0.12,
          filter: { type: "highpass", f: 1400 },
        } satisfies NoiseLayer,
      ];
    }

    const master = ctx.createGain();
    master.gain.setValueAtTime(clamp((design.gain ?? 0.9) * gainScale, 0, 2.4), startAt);

    /* A gentle limiter keeps layered stacks from clipping on phone speakers. */
    let limiter: AudioNode | null = null;
    if (typeof ctx.createDynamicsCompressor === "function") {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-9, startAt);
      comp.knee.setValueAtTime(9, startAt);
      comp.ratio.setValueAtTime(12, startAt);
      comp.attack.setValueAtTime(0.003, startAt);
      comp.release.setValueAtTime(0.25, startAt);
      master.connect(comp);
      comp.connect(destination);
      limiter = comp;
    } else {
      master.connect(destination);
    }

    if (register) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      this.active.add({
        master,
        limiter,
        endsAt: now + audibleDuration(design, options) * 1000 + 1000,
      });
    }

    let bus: AudioNode = master;
    if (design.reverb && design.reverb.mix > 0) {
      const convolver = ctx.createConvolver();
      convolver.buffer = this.impulseFor(ctx, design.reverb.decay);
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

    for (const layer of layers) {
      /* stretch is a real time-scale: offsets, lengths and step spacing all follow it */
      const at = startAt + (layer.k === "seq" ? 0 : (layer.at ?? 0) * stretch);
      const dur = Math.max(0.02, (layer.k === "seq" ? design.duration : layer.dur) * stretch);

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
        this.envelope(
          ctx,
          voiceGain,
          at,
          dur,
          peak,
          layer.attack ?? 0.006,
          layer.release ?? Math.min(0.4, dur * 0.5)
        );
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

        if (layer.lfo?.target === "gain")
          this.lfo(ctx, layer.lfo, voiceGain.gain, at, dur, peak * 0.6);
        if (layer.lfo?.target === "filter" && layer.filter && tail !== out) {
          const base = clamp(layer.filter.f * cutoffScale, 30, 19000);
          const depth = Math.min(Math.abs(layer.lfo.depth), base * 0.85);
          this.lfo(ctx, { ...layer.lfo, depth }, (tail as BiquadFilterNode).frequency, at, dur, 1);
        }
      }

      if (layer.k === "noise") {
        const src = ctx.createBufferSource();
        src.buffer = this.noise(ctx, layer.color ?? "white");
        src.loop = true;
        const env = ctx.createGain();
        const peak = clamp(layer.gain ?? 0.12, 0.0005, 1);
        this.envelope(
          ctx,
          env,
          at,
          dur,
          peak,
          layer.attack ?? 0.01,
          layer.release ?? Math.min(0.5, dur * 0.6)
        );
        let tail: AudioNode = env;
        if (layer.filter) {
          const f = this.filterNode(ctx, layer.filter, cutoffScale, at, dur);
          env.connect(f);
          tail = f;
        }
        place(tail, layer.pan);
        if (layer.lfo?.target === "gain") this.lfo(ctx, layer.lfo, env.gain, at, dur, peak * 0.5);
        if (layer.lfo?.target === "filter" && layer.filter) {
          const base = clamp(layer.filter.f * cutoffScale, 30, 19000);
          const depth = Math.min(Math.abs(layer.lfo.depth), base * 0.85);
          this.lfo(ctx, { ...layer.lfo, depth }, (tail as BiquadFilterNode).frequency, at, dur, 1);
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
          const sAt = at + step.at * stretch;
          const sDur = Math.max(0.03, step.dur * stretch);
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
    if (!this.enabled && !options.force) return false;
    const ctx = this.getContext();
    if (!ctx) return false;
    /* A single click replaces the previous voice instead of stacking on it. */
    this.prune();
    if (!options.overlap && this.active.size) this.stopAll(0.03);
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    try {
      this.render(ctx, ctx.destination, design, options, ctx.currentTime + 0.02, true);
      return true;
    } catch {
      return false;
    }
  }

  async renderDesign(design: SoundDesign, options: PlayOptions = {}): Promise<AudioBuffer | null> {
    const OfflineCtor =
      typeof window !== "undefined"
        ? window.OfflineAudioContext ||
          (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
            .webkitOfflineAudioContext
        : undefined;
    if (!OfflineCtor) return null;
    const stretch = clamp(options.stretch ?? 1, 0.25, 4);
    const seconds = clamp(audibleDuration(design, { ...options, stretch }) + 0.15, 0.2, 40);
    const sampleRate = 44100;
    const offline = new OfflineCtor(1, Math.ceil(sampleRate * seconds), sampleRate);
    this.render(offline, offline.destination, design, { ...options, stretch }, 0, false);
    const buffer = await offline.startRendering();
    /* Exported WAVs must never clip, whatever gain/pitch combination the user
       throws at them — live playback is protected by the compressor, the
       offline path gets an explicit peak guard as a second line of defence. */
    const peak = peakOf(buffer);
    if (!Number.isFinite(peak) || peak > 0.99) {
      const scale = Number.isFinite(peak) && peak > 0 ? 0.99 / peak : 0;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) data[i] *= scale;
      }
    }
    return buffer;
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
    /* UI ticks must never cut a sound the user is auditioning in the studio */
    this.playDesign(design, { gain: 0.7, overlap: true });
  }

  playTick(pitch = 1) {
    const p = clamp(pitch, 0.5, 2);
    this.quick({
      duration: 0.09,
      layers: [
        {
          k: "tone",
          f: 1250 * p,
          to: 980 * p,
          dur: 0.07,
          gain: 0.16,
          filter: { type: "highpass", f: 700 * p },
        },
      ],
    });
  }

  playSnap() {
    this.quick({
      duration: 0.14,
      layers: [
        {
          k: "tone",
          f: 620,
          to: 380,
          dur: 0.1,
          gain: 0.2,
          partials: [{ m: 2.4, a: 0.2, d: 0.05 }],
        },
        {
          k: "noise",
          color: "white",
          dur: 0.05,
          gain: 0.08,
          filter: { type: "highpass", f: 2400 },
        },
      ],
    });
  }

  playSpring() {
    this.quick({
      duration: 0.34,
      layers: [
        {
          k: "tone",
          f: 320,
          to: 720,
          dur: 0.3,
          gain: 0.14,
          type: "triangle",
          lfo: { rate: 18, depth: 20, target: "pitch" },
        },
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
      layers: [
        {
          k: "tone",
          f: 220,
          to: 160,
          dur: 0.26,
          gain: 0.16,
          type: "square",
          filter: { type: "lowpass", f: 1200 },
        },
      ],
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

  /** Returns true when Web Audio is unlocked and actively running in the browser. */
  isUnlocked(): boolean {
    const ctx = this.ctx;
    return Boolean(ctx && ctx.state === "running");
  }

  /** Unlocks Web Audio on the first user gesture and resolves true if running. */
  async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    return ctx.state === "running";
  }

  /**
   * 4-Act Cinema-Grade Procedural Soundtrack for the Entrance Motion Graphic.
   * Engineered using modal synthesis (wood/glass ratios), stereo RTL panning,
   * calligraphic pink-noise foley, sub-bass bloom, and hall convolution reverb.
   */
  playEntranceAct(act: 1 | 2 | 3 | 4) {
    if (!this.enabled) return;

    if (act === 1) {
      // Act I: Deep Sub-Bass Drop + Warm Modal Strike + RTL Reed-Pen Silk Whoosh
      this.playDesign(
        {
          duration: 1.35,
          gain: 0.85,
          reverb: { decay: 1.45, mix: 0.28 },
          layers: [
            {
              k: "tone",
              f: 73.42, // D2
              to: 36.71, // D1 sub drop
              dur: 0.95,
              gain: 0.28,
              type: "sine",
              attack: 0.015,
              release: 0.65,
              filter: { type: "lowpass", f: 180 },
            },
            {
              k: "bell",
              f: 293.66, // D4 warm wood/glass mallet
              dur: 0.9,
              at: 0.02,
              gain: 0.18,
              pan: 0.32,
              ratios: [
                [1, 1, 1],
                [2.4, 0.36, 0.65],
                [3.9, 0.14, 0.4],
              ],
            },
            {
              k: "noise",
              color: "pink",
              dur: 0.85,
              at: 0.08,
              gain: 0.09,
              pan: 0.2,
              attack: 0.14,
              release: 0.45,
              filter: { type: "bandpass", f: 280, to: 1480, q: 2.2 },
            },
          ],
        },
        { overlap: true, gain: 0.88 }
      );
      return;
    }

    if (act === 2) {
      // Act II: 3-Word Kinetic Reveal (Stereo Right -> Center -> Left Crystalline Arpeggio + Bezier Snap)
      this.playDesign(
        {
          duration: 1.4,
          gain: 0.85,
          reverb: { decay: 1.3, mix: 0.26 },
          layers: [
            {
              k: "bell",
              f: 293.66, // D4 (Right)
              dur: 0.75,
              at: 0.0,
              gain: 0.16,
              pan: 0.42,
              ratios: [
                [1, 0.95, 1],
                [2.756, 0.3, 0.6],
              ],
            },
            {
              k: "bell",
              f: 440.0, // A4 (Center)
              dur: 0.8,
              at: 0.2,
              gain: 0.17,
              pan: 0.0,
              ratios: [
                [1, 0.95, 1],
                [2.756, 0.32, 0.62],
              ],
            },
            {
              k: "bell",
              f: 659.25, // E5 (Left)
              dur: 0.9,
              at: 0.4,
              gain: 0.18,
              pan: -0.42,
              ratios: [
                [1, 1, 1],
                [2.0, 0.35, 0.7],
                [3.01, 0.14, 0.45],
              ],
            },
            {
              k: "tone",
              f: 920,
              to: 420,
              dur: 0.08,
              at: 0.58,
              gain: 0.11,
              type: "triangle",
              filter: { type: "highpass", f: 600 },
            },
          ],
        },
        { overlap: true, gain: 0.85 }
      );
      return;
    }

    if (act === 3) {
      // Act III: Lush Warm D-Major9 Studio Swell + Delicate Horological Ticks
      this.playDesign(
        {
          duration: 1.65,
          gain: 0.85,
          reverb: { decay: 1.85, mix: 0.36 },
          layers: [
            {
              k: "tone",
              f: [146.83, 220.0, 329.63, 369.99], // D3 - A3 - E4 - F#4
              dur: 1.45,
              at: 0.0,
              gain: 0.22,
              type: "triangle",
              attack: 0.22,
              release: 0.85,
              filter: { type: "lowpass", f: 460, to: 2100, q: 0.9 },
              lfo: { rate: 4.2, depth: 8, target: "pitch" },
            },
            {
              k: "seq",
              gain: 0.25,
              filter: { type: "highpass", f: 1400 },
              steps: [
                { f: 1760, at: 0.12, dur: 0.045, gain: 0.08, type: "sine" },
                { f: 1975.5, at: 0.28, dur: 0.045, gain: 0.09, type: "sine" },
                { f: 2217.4, at: 0.44, dur: 0.05, gain: 0.1, type: "sine" },
              ],
            },
          ],
        },
        { overlap: true, gain: 0.85 }
      );
      return;
    }

    // Act IV: Camera Push-Through & L-Cut Crystalline Shimmer Release
    this.playDesign(
      {
        duration: 1.6,
        gain: 0.85,
        reverb: { decay: 2.1, mix: 0.42 },
        layers: [
          {
            k: "noise",
            color: "pink",
            dur: 0.65,
            at: 0.0,
            gain: 0.08,
            attack: 0.08,
            release: 0.45,
            filter: { type: "bandpass", f: 420, to: 2600, q: 1.8 },
          },
          {
            k: "bell",
            f: 587.33, // D5
            dur: 1.35,
            at: 0.04,
            gain: 0.17,
            pan: -0.18,
            ratios: [
              [1, 1, 1],
              [1.5, 0.48, 0.85], // A5
              [2.0, 0.32, 0.72], // D6
            ],
          },
        ],
      },
      { overlap: true, gain: 0.86 }
    );
  }

  /**
   * Interactive Physics/Chemistry/Geometry Pluck:
   * Maps cursor (normX in -1..1, normY in 0..1) to a D-Dorian harmonic crystal/water droplet resonance.
   */
  /**
   * Synchronized Studio Sound Engine for the "Line -> Spin -> Shatter -> Word-by-Word Morph" Entrance:
   * - "sweep": Stereo RTL/LTR beam whoosh across the screen
   * - "spin": Accelerating vortex swirl into the center
   * - "shatter": Crystalline fracture into 7 glowing line shards + sub impact
   * - "word": 7 ascending harmonic crystal notes (one for each word as its shard morphs into text)
   * - "portal": Warm studio resolution chord with L-Cut reverb tail
   */
  playLineMorphCue(
    stage: "sweep" | "rebound" | "astrolabe" | "spin" | "shatter" | "word" | "prism" | "portal",
    wordIndex = 0
  ) {
    if (!this.enabled) return;

    if (stage === "sweep") {
      this.playDesign(
        {
          duration: 0.95,
          gain: 0.85,
          reverb: { decay: 1.1, mix: 0.22 },
          layers: [
            {
              k: "noise",
              color: "pink",
              dur: 0.85,
              gain: 0.11,
              pan: 0.45,
              attack: 0.06,
              release: 0.35,
              filter: { type: "bandpass", f: 240, to: 1850, q: 2.0 },
            },
            {
              k: "tone",
              f: 98.0,
              to: 220.0,
              dur: 0.8,
              gain: 0.2,
              type: "sine",
              attack: 0.03,
              release: 0.4,
              filter: { type: "lowpass", f: 420 },
            },
          ],
        },
        { overlap: true, gain: 0.88 }
      );
      return;
    }

    if (stage === "rebound") {
      this.playDesign(
        {
          duration: 0.88,
          gain: 0.86,
          reverb: { decay: 1.25, mix: 0.26 },
          layers: [
            {
              k: "noise",
              color: "pink",
              dur: 0.78,
              gain: 0.11,
              pan: -0.48,
              attack: 0.04,
              release: 0.32,
              filter: { type: "bandpass", f: 340, to: 2400, q: 2.2 },
            },
            {
              k: "tone",
              f: 146.83,
              to: 329.63,
              dur: 0.75,
              gain: 0.19,
              pan: -0.35,
              type: "triangle",
              attack: 0.02,
              release: 0.36,
              filter: { type: "lowpass", f: 960, to: 2200 },
            },
          ],
        },
        { overlap: true, gain: 0.88 }
      );
      return;
    }

    if (stage === "astrolabe") {
      this.playDesign(
        {
          duration: 1.15,
          gain: 0.9,
          reverb: { decay: 1.6, mix: 0.34 },
          layers: [
            {
              k: "bell",
              f: 440.0,
              dur: 0.95,
              gain: 0.18,
              ratios: [
                [1, 1, 1],
                [1.5, 0.52, 0.8],
                [2.0, 0.36, 0.65],
                [3.0, 0.2, 0.45],
              ],
            },
            {
              k: "tone",
              f: [110.0, 164.81, 220.0],
              to: 293.66,
              dur: 0.9,
              gain: 0.22,
              type: "sine",
              attack: 0.015,
              release: 0.55,
              filter: { type: "lowpass", f: 1400 },
            },
          ],
        },
        { overlap: true, gain: 0.9 }
      );
      return;
    }

    if (stage === "prism") {
      this.playDesign(
        {
          duration: 1.45,
          gain: 0.92,
          reverb: { decay: 1.95, mix: 0.38 },
          layers: [
            {
              k: "seq",
              gain: 0.17,
              filter: { type: "lowpass", f: 3600 },
              steps: [
                { f: 587.33, at: 0.0, dur: 0.32, type: "triangle" },
                { f: 739.99, at: 0.09, dur: 0.35, type: "triangle" },
                { f: 880.0, at: 0.18, dur: 0.42, type: "triangle" },
                { f: 1174.66, at: 0.28, dur: 0.65, type: "sine" },
              ],
            },
            {
              k: "tone",
              f: [146.83, 220.0, 293.66, 440.0],
              dur: 1.25,
              gain: 0.22,
              type: "sine",
              attack: 0.06,
              release: 0.85,
              filter: { type: "lowpass", f: 1800, to: 3200 },
            },
          ],
        },
        { overlap: true, gain: 0.9 }
      );
      return;
    }

    if (stage === "spin") {
      this.playDesign(
        {
          duration: 1.05,
          gain: 0.85,
          reverb: { decay: 1.25, mix: 0.26 },
          layers: [
            {
              k: "tone",
              f: 196.0,
              to: 587.33,
              dur: 0.95,
              gain: 0.18,
              type: "triangle",
              attack: 0.05,
              release: 0.35,
              filter: { type: "lowpass", f: 600, to: 2800, q: 1.4 },
              lfo: { rate: 14, depth: 32, target: "pitch" },
            },
            {
              k: "noise",
              color: "pink",
              dur: 0.9,
              gain: 0.09,
              attack: 0.1,
              release: 0.35,
              filter: { type: "bandpass", f: 520, to: 2400, q: 2.4 },
            },
          ],
        },
        { overlap: true, gain: 0.86 }
      );
      return;
    }

    if (stage === "shatter") {
      this.playDesign(
        {
          duration: 0.95,
          gain: 0.9,
          reverb: { decay: 1.4, mix: 0.3 },
          layers: [
            {
              k: "tone",
              f: 110.0,
              to: 36.71,
              dur: 0.55,
              gain: 0.28,
              type: "sine",
              attack: 0.005,
              release: 0.4,
            },
            {
              k: "bell",
              f: 587.33,
              dur: 0.75,
              gain: 0.2,
              ratios: [
                [1, 1, 1],
                [1.414, 0.45, 0.7],
                [2.38, 0.3, 0.55],
                [3.92, 0.16, 0.4],
              ],
            },
            {
              k: "noise",
              color: "white",
              dur: 0.14,
              gain: 0.1,
              attack: 0.002,
              release: 0.1,
              filter: { type: "highpass", f: 2800 },
            },
          ],
        },
        { overlap: true, gain: 0.9 }
      );
      return;
    }

    if (stage === "word") {
      const notes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 739.99];
      const idx = Math.max(0, Math.min(notes.length - 1, wordIndex));
      const f = notes[idx] ?? 440;
      const pan = clamp(0.54 - idx * 0.18, -0.6, 0.6); // Right-to-Left stereo image

      this.playDesign(
        {
          duration: 0.75,
          gain: 0.85,
          reverb: { decay: 1.2, mix: 0.28 },
          layers: [
            {
              k: "bell",
              f,
              dur: 0.65,
              gain: 0.17,
              pan,
              ratios: [
                [1, 1, 1],
                [2.0, 0.38, 0.75],
                [2.756, 0.18, 0.5],
              ],
            },
            ...(idx === 6
              ? [
                  {
                    k: "tone" as const,
                    f: [146.83, 220.0, 369.99],
                    dur: 1.35,
                    gain: 0.2,
                    type: "triangle" as const,
                    attack: 0.08,
                    release: 0.85,
                    filter: { type: "lowpass" as const, f: 1800 },
                  },
                ]
              : []),
          ],
        },
        { overlap: true, gain: 0.86 }
      );
      return;
    }

    // "portal" — Multi-stage Cinema Portal Opening (Riser -> Split-Curtain Whoosh -> Warm L-Cut Chord)
    this.playDesign(
      {
        duration: 2.4,
        gain: 0.92,
        reverb: { decay: 2.3, mix: 0.44 },
        layers: [
          // 1. Inward Reverse-Crystal Riser (0.00s -> 0.36s) as words condense into the horizon seam
          {
            k: "tone",
            f: 293.66,
            to: 880.0,
            dur: 0.36,
            gain: 0.16,
            type: "sine",
            attack: 0.24,
            release: 0.08,
            filter: { type: "lowpass", f: 600, to: 3600 },
          },
          // 2. Deep Velvet Sub-Drop at the exact moment the shutter splits open (t = 0.32s)
          {
            k: "tone",
            f: 98.0,
            to: 36.71,
            at: 0.3,
            dur: 0.95,
            gain: 0.3,
            type: "sine",
            attack: 0.01,
            release: 0.75,
            filter: { type: "lowpass", f: 180 },
          },
          // 3. Stereo Silk Curtain Whoosh (t = 0.30s -> 1.25s)
          {
            k: "noise",
            color: "pink",
            at: 0.28,
            dur: 0.95,
            gain: 0.12,
            attack: 0.08,
            release: 0.65,
            filter: { type: "bandpass", f: 1800, to: 320, q: 1.5 },
          },
          // 4. Warm D-Major9 Studio Resolution Pad (L-Cut ringing inside the live site)
          {
            k: "tone",
            f: [146.83, 220.0, 293.66, 369.99, 440.0, 659.25],
            at: 0.32,
            dur: 2.0,
            gain: 0.24,
            type: "triangle",
            detune: 5,
            attack: 0.14,
            release: 1.55,
            filter: { type: "lowpass", f: 2400, to: 720 },
          },
        ],
      },
      { overlap: true, gain: 0.92 }
    );
  }

  /**
   * One crystalline tick per landing word of the entrance film's sentence.
   *
   * The point of these is the stereo image: Persian reads right to left, so the
   * first word is placed hard right and the last one hard left. Walking a chord
   * upward while the pan sweeps R→L is what makes the line feel like it is
   * physically travelling across the screen instead of just fading in.
   */
  playIntroWordTick(index: number, total: number) {
    if (!this.enabled) return;

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const f = scale[Math.max(0, Math.min(scale.length - 1, index))] ?? 440;
    const t = total > 1 ? index / (total - 1) : 0.5;
    const pan = clamp(0.74 - t * 1.48, -0.74, 0.74);

    this.playDesign(
      {
        duration: 0.7,
        gain: 0.85,
        reverb: { decay: 1.15, mix: 0.26 },
        layers: [
          {
            k: "bell",
            f,
            dur: 0.6,
            gain: 0.15,
            pan,
            ratios: [
              [1, 1, 1],
              [2.0, 0.34, 0.72],
              [2.756, 0.16, 0.48],
            ],
          },
          {
            k: "noise",
            color: "pink",
            dur: 0.28,
            at: 0.005,
            gain: 0.045,
            pan: pan * 0.7,
            attack: 0.01,
            release: 0.2,
            filter: { type: "bandpass", f: 1600 + index * 260, q: 1.6 },
          },
        ],
      },
      { overlap: true, gain: 0.86 }
    );
  }

  /** Deep, wide "the point just gave way" bloom for the tap moment. */
  playIntroIgnition() {
    if (!this.enabled) return;

    this.playDesign(
      {
        duration: 1.5,
        gain: 0.9,
        reverb: { decay: 2.1, mix: 0.42 },
        layers: [
          {
            k: "tone",
            f: 98.0,
            to: 49.0,
            dur: 1.25,
            gain: 0.3,
            type: "sine",
            attack: 0.008,
            release: 0.9,
            filter: { type: "lowpass", f: 260 },
          },
          {
            k: "bell",
            f: 392.0,
            dur: 1.1,
            at: 0.0,
            gain: 0.16,
            pan: 0.55,
            ratios: [
              [1, 1, 1],
              [1.5, 0.44, 0.8],
              [2.4, 0.24, 0.55],
            ],
          },
          {
            k: "bell",
            f: 587.33,
            dur: 1.2,
            at: 0.07,
            gain: 0.14,
            pan: -0.55,
            ratios: [
              [1, 0.95, 1],
              [2.0, 0.3, 0.6],
            ],
          },
          {
            k: "noise",
            color: "pink",
            dur: 0.9,
            at: 0.0,
            gain: 0.075,
            attack: 0.02,
            release: 0.6,
            filter: { type: "highpass", f: 320, to: 5200 },
          },
        ],
      },
      { overlap: true, gain: 0.9 }
    );
  }

  /** Soft stereo shimmer that runs under the sentence while it settles. */
  playIntroSentenceBed() {
    if (!this.enabled) return;

    this.playDesign(
      {
        duration: 3.2,
        gain: 0.8,
        reverb: { decay: 2.6, mix: 0.46 },
        layers: [
          {
            k: "tone",
            f: [146.83, 220.0, 293.66],
            dur: 2.9,
            gain: 0.14,
            type: "sine",
            attack: 0.5,
            release: 1.4,
            filter: { type: "lowpass", f: 1200, to: 2400 },
          },
          {
            k: "seq",
            gain: 0.1,
            filter: { type: "lowpass", f: 4200 },
            steps: [
              { f: 880.0, at: 0.0, dur: 0.4, type: "triangle" },
              { f: 1174.66, at: 0.28, dur: 0.5, type: "triangle" },
              { f: 1318.51, at: 0.6, dur: 0.6, type: "sine" },
            ],
          },
        ],
      },
      { overlap: true, gain: 0.82 }
    );
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
  return {
    duration: dur + 0.1,
    gain: 0.85,
    reverb: { decay: Math.min(1.6, dur * 1.4), mix: 0.16 },
    layers,
  };
}
