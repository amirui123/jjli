// Single vibration segment: duration (ms), optional intensity (0–1), optional delay before it.
export interface Vibration {
  duration: number;
  intensity?: number;
  delay?: number;
}

// Alternating on/off ms (e.g. [10, 50, 20]) or array of Vibration segments.
export type HapticPattern = number[] | Vibration[];

export interface HapticPreset {
  pattern: Vibration[];
}

// Preset name (string), number (ms), HapticPattern, or HapticPreset.
export type HapticInput = number | string | HapticPattern | HapticPreset;

export interface TriggerOptions {
  intensity?: number;
}

// Options for WebHaptics instance: debug (play sound on desktop), showSwitch (on-screen toggle).
export interface WebHapticsOptions {
  debug?: boolean;
  showSwitch?: boolean;
}
