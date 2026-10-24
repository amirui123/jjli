export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';

export interface SoundSpec {
  name?: string;
  waveform: WaveformType;
  frequency: number; // Base frequency in Hz
  frequencyEnd?: number; // Target frequency for slide
  frequencyJump?: {
    time: number; // Seconds into playback when jump occurs
    to: number; // Target frequency in Hz
  };
  attack?: number; // Attack duration in seconds
  decay?: number; // Decay duration in seconds
  sustain?: number; // Sustain volume level (0.0 to 1.0)
  release?: number; // Release duration in seconds
  volume?: number; // Master volume multiplier (default: 0.3)
  noiseFilterCutoff?: number; // Low-pass filter for noise (Hz)
}

export interface PlayOptions {
  volume?: number; // Scale master volume (e.g. 0.8)
  pitch?: number; // Scale pitch multiplier (e.g. 1.2 for higher pitch)
  detune?: number; // Detune in cents
}
