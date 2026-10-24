/**
 * Percussive voices synthesized from oscillators and noise. No samples.
 * Each synth schedules one hit at audio-clock time `t` into `out` and returns nothing;
 * nodes disconnect themselves when the longest source ends.
 */
export const VOICES = [
  { id: 'tick', label: 'Tick', hint: 'bright click' },
  { id: 'wood', label: 'Wood', hint: 'woodblock' },
  { id: 'bell', label: 'Bell', hint: 'FM bell' },
  { id: 'kick', label: 'Kick', hint: 'drum' },
  { id: 'snare', label: 'Snare', hint: 'noise + tone' },
  { id: 'hat', label: 'Hat', hint: 'metallic' },
];
export const VOICE_IDS = VOICES.map((v) => v.id);

const FLOOR = 0.0001;

/** Gain node with an attack/exponential-decay envelope, connected to `out`. */
function env(ctx, out, t, peak, decay, attack = 0.002) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.linearRampToValueAtTime(Math.max(FLOOR, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + attack + decay);
  g.connect(out);
  return g;
}

function osc(ctx, dest, t, dur, { type = 'sine', freq, glideTo = null, glideTime = 0.05 }) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + glideTime);
  o.connect(dest);
  o.start(t);
  o.stop(t + dur);
  return o;
}

function noise(engine, dest, t, dur) {
  const s = engine.ctx.createBufferSource();
  s.buffer = engine.noise;
  s.loop = true;
  s.connect(dest);
  s.start(t);
  s.stop(t + dur);
  return s;
}

function filter(ctx, dest, type, freq, q = 1) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  f.connect(dest);
  return f;
}

/** When `source` ends, disconnect every node this hit created. */
function cleanup(source, nodes) {
  source.onended = () => {
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        /* already gone */
      }
    }
  };
}

const SYNTHS = {
  tick(e, t, out, v) {
    const { ctx } = e;
    const g = env(ctx, out, t, 0.6 * v, 0.05);
    const o = osc(ctx, g, t, 0.12, { type: 'triangle', freq: 2200, glideTo: 1500, glideTime: 0.04 });
    const ng = env(ctx, out, t, 0.25 * v, 0.015);
    const hp = filter(ctx, ng, 'highpass', 6000);
    const s = noise(e, hp, t, 0.05);
    cleanup(o, [g, ng, hp, s]);
  },

  wood(e, t, out, v) {
    const { ctx } = e;
    const g = env(ctx, out, t, 0.85 * v, 0.1);
    const o = osc(ctx, g, t, 0.22, { freq: 820, glideTo: 560, glideTime: 0.06 });
    const g2 = env(ctx, out, t, 0.25 * v, 0.05);
    const o2 = osc(ctx, g2, t, 0.12, { freq: 1230 });
    const ng = env(ctx, out, t, 0.3 * v, 0.012);
    const bp = filter(ctx, ng, 'bandpass', 2600, 3);
    const s = noise(e, bp, t, 0.04);
    cleanup(o, [g, g2, o2, ng, bp, s]);
  },

  bell(e, t, out, v) {
    const { ctx } = e;
    const f = 740;
    const g = env(ctx, out, t, 0.35 * v, 1.4);
    const car = ctx.createOscillator();
    car.type = 'sine';
    car.frequency.setValueAtTime(f, t);
    const mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(f * 2.5, t);
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(f * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.8);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    car.connect(g);
    mod.start(t);
    car.start(t);
    mod.stop(t + 1.6);
    car.stop(t + 1.6);
    const g2 = env(ctx, out, t, 0.12 * v, 0.5);
    const p = osc(ctx, g2, t, 0.7, { freq: f * 2.98 });
    cleanup(car, [g, mod, modGain, g2, p]);
  },

  kick(e, t, out, v) {
    const { ctx } = e;
    const g = env(ctx, out, t, 1.0 * v, 0.4);
    const o = osc(ctx, g, t, 0.6, { freq: 170, glideTo: 42, glideTime: 0.14 });
    const ng = env(ctx, out, t, 0.2 * v, 0.01);
    const hp = filter(ctx, ng, 'highpass', 1500);
    const s = noise(e, hp, t, 0.03);
    cleanup(o, [g, ng, hp, s]);
  },

  snare(e, t, out, v) {
    const { ctx } = e;
    const ng = env(ctx, out, t, 0.55 * v, 0.2);
    const bp = filter(ctx, ng, 'bandpass', 1900, 0.9);
    const s = noise(e, bp, t, 0.3);
    const g = env(ctx, out, t, 0.5 * v, 0.1);
    const o = osc(ctx, g, t, 0.2, { freq: 200, glideTo: 140, glideTime: 0.06 });
    cleanup(s, [ng, bp, g, o]);
  },

  hat(e, t, out, v) {
    const { ctx } = e;
    const g = env(ctx, out, t, 0.4 * v, 0.08);
    const hp = filter(ctx, g, 'highpass', 7000);
    const bp = filter(ctx, hp, 'bandpass', 10000, 1);
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const oscs = ratios.map((r) => osc(ctx, bp, t, 0.15, { type: 'square', freq: 40 * r }));
    cleanup(oscs[0], [g, hp, bp, ...oscs.slice(1)]);
  },
};

/**
 * Schedule one hit.
 * @param engine  from createEngine()
 * @param id      voice id
 * @param t       audio-clock time
 * @param opts    { dest: AudioNode (default engine.master), gain: 0..1 }
 */
export function playVoice(engine, id, t, opts = {}) {
  const synth = SYNTHS[id];
  if (!synth) throw new RangeError(`unknown voice: ${id}`);
  const out = opts.dest || engine.master;
  const v = opts.gain == null ? 1 : Math.max(0, Math.min(1, opts.gain));
  synth(engine, t, out, v);
}
