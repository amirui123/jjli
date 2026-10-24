import { getAudio } from './context';
import type { SoundOptions } from './types';
import { clamp } from './utils';

/**
 * Floor for exponential gain ramps; `0` is not a valid ramp target.
 */
const FLOOR = 0.0001;

/**
 * Options for a single oscillator tone.
 */
export interface ToneOptions extends SoundOptions {
  /**
   * Frequency of the tone in hertz.
   */
  frequency: number;

  /**
   * Frequency the tone sweeps to over its duration.
   */
  endFrequency?: number;

  /**
   * Duration of the tone in seconds.
   *
   * @defaultValue 0.1
   */
  duration?: number;

  /**
   * Delay from the current time before the tone starts, in seconds.
   *
   * @defaultValue 0
   */
  delay?: number;

  /**
   * Time in seconds to reach full volume.
   *
   * @defaultValue 0.005
   */
  attack?: number;

  /**
   * Oscillator waveform.
   *
   * @defaultValue 'sine'
   */
  type?: OscillatorType;
}

/**
 * Options for a filtered noise burst.
 */
export interface NoiseOptions extends SoundOptions {
  /**
   * Duration of the burst in seconds.
   *
   * @defaultValue 0.1
   */
  duration?: number;

  /**
   * Delay from the current time before the burst starts, in seconds.
   *
   * @defaultValue 0
   */
  delay?: number;

  /**
   * Time in seconds to reach full volume.
   *
   * @defaultValue 0.002
   */
  attack?: number;

  /**
   * Filter type.
   *
   * @defaultValue 'lowpass'
   */
  type?: BiquadFilterType;

  /**
   * Filter cutoff frequency in hertz, scaled by `pitch`.
   *
   * @defaultValue 1500
   */
  frequency?: number;

  /**
   * Filter resonance.
   */
  q?: number;
}

/**
 * A single note in a sequence.
 */
export interface Note {
  /**
   * Frequency of the note in hertz.
   */
  frequency: number;

  /**
   * Duration of the note in seconds.
   *
   * @defaultValue 0.08
   */
  duration?: number;
}

/**
 * Options for a sequence of notes.
 */
export interface SequenceOptions extends SoundOptions {
  /**
   * Oscillator waveform applied to every note.
   *
   * @defaultValue 'sine'
   */
  type?: OscillatorType;

  /**
   * Silence between notes in seconds.
   *
   * @defaultValue 0.02
   */
  gap?: number;
}

/**
 * Plays a single oscillator tone through the master gain.
 *
 * Does nothing when Web Audio is unavailable, or when the requested
 * volume, duration, or frequency is not positive.
 *
 * @param options - Tone options.
 */
export function tone(options: ToneOptions): void {
  const audio = getAudio();
  if (!audio) return;
  const {
    frequency,
    endFrequency,
    duration = 0.1,
    delay = 0,
    attack = 0.005,
    type = 'sine',
    volume = 1,
    pitch = 1,
  } = options;
  const peak = clamp(volume);
  const startFrequency = frequency * pitch;
  if (duration <= 0 || peak <= 0 || startFrequency <= 0) return;
  const { context, master } = audio;
  const start = context.currentTime + delay;
  const end = start + duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, start);
  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency * pitch),
      end,
    );
  }
  gain.gain.setValueAtTime(FLOOR, start);
  gain.gain.exponentialRampToValueAtTime(
    peak,
    start + Math.min(attack, duration),
  );
  gain.gain.exponentialRampToValueAtTime(FLOOR, end);
  oscillator.connect(gain);
  gain.connect(master);
  oscillator.start(start);
  oscillator.stop(end);
}

/**
 * Plays a filtered burst of white noise through the master gain.
 *
 * The noise buffer is generated once per `AudioContext` and reused.
 *
 * @param options - Noise options.
 */
export function noise(options: NoiseOptions = {}): void {
  const audio = getAudio();
  if (!audio) return;
  const {
    duration = 0.1,
    delay = 0,
    attack = 0.002,
    type = 'lowpass',
    frequency = 1500,
    q,
    volume = 1,
    pitch = 1,
  } = options;
  const peak = clamp(volume);
  if (duration <= 0 || peak <= 0) return;
  const { context, master } = audio;
  const start = context.currentTime + delay;
  const end = start + duration;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = getNoiseBuffer(context);
  filter.type = type;
  filter.frequency.setValueAtTime(Math.max(1, frequency * pitch), start);
  if (q !== undefined) {
    filter.Q.value = q;
  }
  gain.gain.setValueAtTime(FLOOR, start);
  gain.gain.exponentialRampToValueAtTime(
    peak,
    start + Math.min(attack, duration),
  );
  gain.gain.exponentialRampToValueAtTime(FLOOR, end);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(start);
  source.stop(end);
}

/**
 * Plays a series of tones, one after another.
 *
 * @param notes - The notes to play.
 * @param options - Sequence options applied to every note.
 */
export function sequence(notes: Note[], options: SequenceOptions = {}): void {
  const { gap = 0.02, type = 'sine', ...rest } = options;
  let delay = 0;
  for (const note of notes) {
    const duration = note.duration ?? 0.08;
    tone({ frequency: note.frequency, duration, delay, type, ...rest });
    delay += duration + gap;
  }
}

const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

/**
 * Returns a one-second white noise buffer for the given context,
 * creating and memoizing it on first use.
 *
 * @param context - The context to create the buffer for.
 * @returns The noise buffer.
 */
function getNoiseBuffer(context: AudioContext): AudioBuffer {
  const cached = noiseBuffers.get(context);
  if (cached) return cached;
  const length = Math.floor(context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  noiseBuffers.set(context, buffer);
  return buffer;
}
