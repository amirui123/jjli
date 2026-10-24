import { noise, sequence, tone, type ToneOptions } from './engine';
import type { BeepOptions, SoundOptions } from './types';

const clickTone: ToneOptions = {
  frequency: 1000,
  endFrequency: 700,
  duration: 0.05,
  type: 'triangle',
  volume: 0.8,
};

function playClick(options: SoundOptions, delay = 0): void {
  tone({ ...clickTone, ...options, delay });
}

/**
 * Plays a sharp click, e.g. for buttons and links.
 *
 * @param options - Per-call sound options.
 */
export function click(options: SoundOptions = {}): void {
  playClick(options);
}

/**
 * Plays a soft tick for pointer hover states.
 *
 * @param options - Per-call sound options.
 */
export function hover(options: SoundOptions = {}): void {
  tone({
    frequency: 900,
    duration: 0.04,
    type: 'sine',
    volume: 0.4,
    ...options,
  });
}

/**
 * Plays a subtle cue for keyboard focus.
 *
 * @param options - Per-call sound options.
 */
export function focus(options: SoundOptions = {}): void {
  tone({
    frequency: 1200,
    duration: 0.05,
    type: 'sine',
    volume: 0.5,
    ...options,
  });
}

/**
 * Plays a descending tone for a pointer or key press.
 *
 * @param options - Per-call sound options.
 */
export function press(options: SoundOptions = {}): void {
  tone({
    frequency: 700,
    endFrequency: 500,
    duration: 0.06,
    type: 'triangle',
    volume: 0.7,
    ...options,
  });
}

/**
 * Plays a rising tone for a pointer or key release.
 *
 * @param options - Per-call sound options.
 */
export function release(options: SoundOptions = {}): void {
  tone({
    frequency: 500,
    endFrequency: 750,
    duration: 0.06,
    type: 'triangle',
    volume: 0.7,
    ...options,
  });
}

/**
 * Plays a sustained rising tone for long press gestures.
 *
 * @param options - Per-call sound options.
 */
export function longPress(options: SoundOptions = {}): void {
  tone({
    frequency: 440,
    endFrequency: 660,
    duration: 0.3,
    attack: 0.05,
    type: 'sine',
    volume: 0.7,
    ...options,
  });
}

/**
 * Plays two quick clicks for double click gestures.
 *
 * @param options - Per-call sound options.
 */
export function doubleClick(options: SoundOptions = {}): void {
  playClick(options);
  playClick(options, 0.09);
}

/**
 * Plays a soft friction tick for drag gestures.
 *
 * @param options - Per-call sound options.
 */
export function drag(options: SoundOptions = {}): void {
  noise({
    duration: 0.1,
    type: 'bandpass',
    frequency: 1200,
    q: 2,
    volume: 0.4,
    ...options,
  });
}

/**
 * Plays a low thud for drop gestures.
 *
 * @param options - Per-call sound options.
 */
export function drop(options: SoundOptions = {}): void {
  tone({
    frequency: 150,
    endFrequency: 60,
    duration: 0.18,
    type: 'sine',
    volume: 0.9,
    ...options,
  });
  noise({
    duration: 0.12,
    type: 'lowpass',
    frequency: 500,
    volume: 0.3,
    ...options,
  });
}

/**
 * Plays a keystroke tap for text input.
 *
 * @param options - Per-call sound options.
 */
export function type(options: SoundOptions = {}): void {
  noise({
    duration: 0.03,
    type: 'bandpass',
    frequency: 2500,
    q: 1,
    volume: 0.5,
    ...options,
  });
}

/**
 * Plays a rising two-note chime for selection.
 *
 * @param options - Per-call sound options.
 */
export function select(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 660, duration: 0.06 },
      { frequency: 990, duration: 0.09 },
    ],
    { type: 'sine', gap: 0, volume: 0.65, ...options },
  );
}

/**
 * Plays a falling two-note chime for deselection.
 *
 * @param options - Per-call sound options.
 */
export function deselect(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 990, duration: 0.06 },
      { frequency: 660, duration: 0.09 },
    ],
    { type: 'sine', gap: 0, volume: 0.65, ...options },
  );
}

/**
 * Plays a rising sweep for opening UI such as modals and popovers.
 *
 * @param options - Per-call sound options.
 */
export function open(options: SoundOptions = {}): void {
  tone({
    frequency: 300,
    endFrequency: 900,
    duration: 0.18,
    type: 'triangle',
    volume: 0.65,
    ...options,
  });
}

/**
 * Plays a falling sweep for closing UI such as modals and popovers.
 *
 * @param options - Per-call sound options.
 */
export function close(options: SoundOptions = {}): void {
  tone({
    frequency: 900,
    endFrequency: 300,
    duration: 0.18,
    type: 'triangle',
    volume: 0.65,
    ...options,
  });
}

/**
 * Plays a falling swoosh for navigating back.
 *
 * @param options - Per-call sound options.
 */
export function back(options: SoundOptions = {}): void {
  tone({
    frequency: 700,
    endFrequency: 350,
    duration: 0.15,
    type: 'sine',
    volume: 0.65,
    ...options,
  });
}

/**
 * Plays a rising swoosh for navigating forward.
 *
 * @param options - Per-call sound options.
 */
export function forward(options: SoundOptions = {}): void {
  tone({
    frequency: 350,
    endFrequency: 700,
    duration: 0.15,
    type: 'sine',
    volume: 0.65,
    ...options,
  });
}

/**
 * Plays a plain sine beep.
 *
 * @example
 * ```ts
 * beep();
 * beep({ frequency: 440 });
 * ```
 *
 * @param options - Per-call sound options and tone frequency.
 */
export function beep(options: BeepOptions = {}): void {
  const { frequency = 880, ...rest } = options;
  tone({ frequency, duration: 0.15, type: 'sine', volume: 0.7, ...rest });
}

/**
 * Plays a rising major arpeggio for successful operations.
 *
 * @param options - Per-call sound options.
 */
export function success(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 523.25, duration: 0.08 },
      { frequency: 659.25, duration: 0.08 },
      { frequency: 783.99, duration: 0.08 },
      { frequency: 1046.5, duration: 0.16 },
    ],
    { type: 'sine', gap: 0.02, volume: 0.65, ...options },
  );
}

/**
 * Plays a low two-note buzz for failed operations.
 *
 * @param options - Per-call sound options.
 */
export function error(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 220, duration: 0.12 },
      { frequency: 165, duration: 0.18 },
    ],
    { type: 'square', gap: 0, volume: 0.45, ...options },
  );
}

/**
 * Plays an alternating two-tone alert for warnings.
 *
 * @param options - Per-call sound options.
 */
export function warning(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 880, duration: 0.08 },
      { frequency: 660, duration: 0.08 },
      { frequency: 880, duration: 0.08 },
      { frequency: 660, duration: 0.08 },
    ],
    { type: 'square', gap: 0.04, volume: 0.4, ...options },
  );
}

/**
 * Plays a gentle descending two-note tone for cancelled operations.
 *
 * @param options - Per-call sound options.
 */
export function cancel(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 600, duration: 0.09 },
      { frequency: 450, duration: 0.14 },
    ],
    { type: 'triangle', gap: 0.01, volume: 0.65, ...options },
  );
}

/**
 * Plays a two-note chime for notifications.
 *
 * @param options - Per-call sound options.
 */
export function notification(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 880, duration: 0.1 },
      { frequency: 1320, duration: 0.18 },
    ],
    { type: 'sine', gap: 0.08, volume: 0.65, ...options },
  );
}

/**
 * Plays a rising two-note blip for copy operations.
 *
 * @param options - Per-call sound options.
 */
export function copy(options: SoundOptions = {}): void {
  sequence(
    [
      { frequency: 900, duration: 0.05 },
      { frequency: 1350, duration: 0.07 },
    ],
    { type: 'sine', gap: 0.03, volume: 0.6, ...options },
  );
}

/**
 * Plays a soft falling tone for paste operations.
 *
 * @param options - Per-call sound options.
 */
export function paste(options: SoundOptions = {}): void {
  tone({
    frequency: 1100,
    endFrequency: 800,
    duration: 0.09,
    type: 'sine',
    volume: 0.65,
    ...options,
  });
}

/**
 * Plays a descending blip for destructive remove actions.
 *
 * @param options - Per-call sound options.
 */
export function remove(options: SoundOptions = {}): void {
  tone({
    frequency: 500,
    endFrequency: 250,
    duration: 0.12,
    type: 'triangle',
    volume: 0.7,
    ...options,
  });
}

/**
 * Plays a playful rising bloop for reactions.
 *
 * @param options - Per-call sound options.
 */
export function reaction(options: SoundOptions = {}): void {
  tone({
    frequency: 500,
    endFrequency: 1400,
    duration: 0.12,
    type: 'sine',
    volume: 0.65,
    ...options,
  });
}
