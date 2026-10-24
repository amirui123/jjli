import { SoundSpec, PlayOptions } from '../types';

let globalAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('WebAudio is only available in browser environments.');
  }
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    globalAudioCtx = new AudioContextClass();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

/**
 * Play a procedural sound specification using WebAudio API
 */
export function playWebAudio(spec: SoundSpec, options: PlayOptions = {}): void {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const baseVolume = (spec.volume ?? 0.25) * (options.volume ?? 1.0);
  const baseFreq = spec.frequency * (options.pitch ?? 1.0);
  const detune = options.detune ?? 0;

  const attack = spec.attack ?? 0.005;
  const decay = spec.decay ?? 0.15;
  const sustain = spec.sustain ?? 0.0;
  const release = spec.release ?? 0.05;
  const duration = attack + decay + release;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // ADSR volume envelope
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(baseVolume, t + attack);
  if (sustain > 0) {
    gain.gain.linearRampToValueAtTime(baseVolume * sustain, t + attack + decay);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  } else {
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  }

  if (spec.waveform === 'noise') {
    // Generate white noise buffer
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter for noise (low-pass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = spec.noiseFilterCutoff ?? baseFreq;
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, cutoff * 0.1), t + duration);

    noiseSource.connect(filter);
    filter.connect(gain);

    noiseSource.start(t);
    noiseSource.stop(t + duration);
  } else {
    // Standard oscillator
    const osc = ctx.createOscillator();
    osc.type = spec.waveform;
    osc.frequency.setValueAtTime(baseFreq, t);
    if (detune !== 0) osc.detune.setValueAtTime(detune, t);

    // Frequency slide
    if (spec.frequencyEnd) {
      const endFreq = spec.frequencyEnd * (options.pitch ?? 1.0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), t + duration);
    }

    // Two-tone jump (e.g. coin / chirp)
    if (spec.frequencyJump) {
      const jumpFreq = spec.frequencyJump.to * (options.pitch ?? 1.0);
      osc.frequency.setValueAtTime(jumpFreq, t + spec.frequencyJump.time);
    }

    osc.connect(gain);
    osc.start(t);
    osc.stop(t + duration);
  }
}

/**
 * Generate raw PCM 16-bit Mono Buffer (Universal for React Native, Node.js, File export)
 */
export function generatePCM(spec: SoundSpec, options: PlayOptions = {}, sampleRate = 44100): Int16Array {
  const baseVolume = (spec.volume ?? 0.25) * (options.volume ?? 1.0);
  const baseFreq = spec.frequency * (options.pitch ?? 1.0);
  const attack = spec.attack ?? 0.005;
  const decay = spec.decay ?? 0.15;
  const release = spec.release ?? 0.05;
  const duration = attack + decay + release;

  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = new Int16Array(totalSamples);

  let currentFreq = baseFreq;
  let phase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Pitch handling
    if (spec.frequencyJump && t >= spec.frequencyJump.time) {
      currentFreq = spec.frequencyJump.to * (options.pitch ?? 1.0);
    } else if (spec.frequencyEnd) {
      const progress = t / duration;
      currentFreq = baseFreq + (spec.frequencyEnd * (options.pitch ?? 1.0) - baseFreq) * progress;
    }

    // Envelope
    let env = 0;
    if (t < attack) {
      env = t / attack;
    } else {
      env = Math.max(0, 1.0 - (t - attack) / (decay + release));
    }

    // Sample synthesis
    phase += (2 * Math.PI * currentFreq) / sampleRate;
    let sample = 0;

    switch (spec.waveform) {
      case 'sine':
        sample = Math.sin(phase);
        break;
      case 'square':
        sample = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample = 2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5));
        break;
      case 'triangle':
        sample = 2 * Math.abs(2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5))) - 1;
        break;
      case 'noise':
        sample = Math.random() * 2 - 1;
        break;
    }

    buffer[i] = Math.floor(sample * env * baseVolume * 32767);
  }

  return buffer;
}
