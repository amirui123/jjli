/**
 * Audio engine: one AudioContext (created lazily on the first user gesture), a master
 * gain into a gentle compressor, a shared noise buffer, and a small set of stereo
 * "buses" (one per necklace) so layered necklaces sit at slightly different positions.
 *
 * Browser APIs are always called as methods on their own objects (never detached),
 * otherwise Chrome throws "Illegal invocation".
 */
let engine = null;

export function createEngine(AC) {
  const ctx = new AC({ latencyHint: 'interactive' });
  const master = ctx.createGain();
  master.gain.value = 0.7;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 18;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.12;
  master.connect(comp);
  comp.connect(ctx.destination);

  const noise = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate)), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const buses = new Map();
  function bus(index, pan = 0) {
    let b = buses.get(index);
    if (!b) {
      if (typeof ctx.createStereoPanner === 'function') {
        b = ctx.createStereoPanner();
      } else {
        b = ctx.createGain();
      }
      b.connect(master);
      buses.set(index, b);
    }
    if (b.pan) b.pan.value = pan;
    return b;
  }

  return {
    ctx,
    master,
    noise,
    bus,
    /** Seconds between a scheduled time and the sound reaching the speakers. */
    latency() {
      return ctx.outputLatency || ctx.baseLatency || 0;
    },
    /**
     * A MediaStream carrying exactly what the speakers get (post-compressor), for
     * recording. The speakers keep playing. Call release() when the recording is done.
     */
    capture() {
      const dest = ctx.createMediaStreamDestination();
      comp.connect(dest);
      return {
        stream: dest.stream,
        release() {
          try {
            comp.disconnect(dest);
          } catch {
            /* already gone */
          }
        },
      };
    },
  };
}

export function getEngine() {
  return engine;
}

/** Create (or resume) the engine. Call from a user gesture. */
export function ensureAudio() {
  if (!engine) {
    const AC = window.AudioContext || window.webkitAudioContext;
    engine = createEngine(AC);
  }
  if (engine.ctx.state === 'suspended') engine.ctx.resume();
  return engine;
}
