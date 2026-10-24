import { getContext } from "./context";
import { createNoiseBuffer } from "./utils";
import type { SoundConfig, PresetOptions, LayerConfig } from "./types";

const PITCH_MAP: Record<string, number> = {
  low: 0.8,
  mid: 1.0,
  high: 1.3,
};

function getPitchMultiplier(pitch: PresetOptions["pitch"]): number {
  if (pitch == null) return 1;
  if (typeof pitch === "number") return pitch;
  return PITCH_MAP[pitch] ?? 1;
}

export function playSound(config: SoundConfig, options?: PresetOptions): void {
  const ctx = getContext();
  const volume = options?.volume ?? 1;
  const pitchMul = getPitchMultiplier(options?.pitch);

  for (const layer of config.layers) {
    playLayer(ctx, layer, volume, pitchMul);
  }
}

function playLayer(
  ctx: AudioContext,
  layer: LayerConfig,
  volume: number,
  pitchMul: number,
): void {
  const startTime = ctx.currentTime + (layer.delay ?? 0);
  const curve = layer.envelope.curve ?? "exponential";

  // --- source ---
  let sourceNode: AudioScheduledSourceNode;
  if (layer.source.type === "oscillator") {
    const osc = ctx.createOscillator();
    osc.type = layer.source.waveform;
    const freq = layer.source.frequency * pitchMul;
    osc.frequency.setValueAtTime(freq, startTime);
    if (layer.source.frequencyEnd != null) {
      const endFreq = layer.source.frequencyEnd * pitchMul;
      const rampEnd = startTime + layer.envelope.attack + layer.envelope.decay;
      if (curve === "exponential") {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(endFreq, 0.001),
          rampEnd,
        );
      } else {
        osc.frequency.linearRampToValueAtTime(endFreq, rampEnd);
      }
    }
    sourceNode = osc;
  } else {
    // noise
    const duration = layer.envelope.attack + layer.envelope.decay;
    const buffer = createNoiseBuffer(ctx, duration + 0.1);
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;
    sourceNode = bufferSource;
  }

  // --- filter ---
  let filterNode: BiquadFilterNode | null = null;
  if (layer.filter) {
    filterNode = ctx.createBiquadFilter();
    filterNode.type = layer.filter.type;
    filterNode.frequency.setValueAtTime(
      layer.filter.frequency * pitchMul,
      startTime,
    );
    if (layer.filter.Q != null) {
      filterNode.Q.setValueAtTime(layer.filter.Q, startTime);
    }
  }

  // --- gain envelope ---
  const gainNode = ctx.createGain();
  const peakGain = layer.gain * volume;
  const decayEnd = startTime + layer.envelope.attack + layer.envelope.decay;

  // start silent, ramp to peak over attack, then decay to ~zero
  gainNode.gain.setValueAtTime(0.001, startTime);
  if (curve === "exponential") {
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(peakGain, 0.001),
      startTime + layer.envelope.attack,
    );
    gainNode.gain.exponentialRampToValueAtTime(0.001, decayEnd);
  } else {
    gainNode.gain.linearRampToValueAtTime(
      peakGain,
      startTime + layer.envelope.attack,
    );
    gainNode.gain.linearRampToValueAtTime(0.001, decayEnd);
  }

  // --- connect chain ---
  let current: AudioNode = sourceNode;
  if (filterNode) {
    current.connect(filterNode);
    current = filterNode;
  }
  current.connect(gainNode);
  gainNode.connect(ctx.destination);

  // --- start & stop ---
  sourceNode.start(startTime);
  sourceNode.stop(decayEnd + 0.05);

  // Disconnect nodes after playback to prevent audio graph accumulation.
  sourceNode.addEventListener(
    "ended",
    () => {
      sourceNode.disconnect();
      if (filterNode) filterNode.disconnect();
      gainNode.disconnect();
    },
    { once: true },
  );
}

/** Escape-hatch: play an arbitrary SoundConfig directly */
export function play(config: SoundConfig, options?: PresetOptions): void {
  playSound(config, options);
}
