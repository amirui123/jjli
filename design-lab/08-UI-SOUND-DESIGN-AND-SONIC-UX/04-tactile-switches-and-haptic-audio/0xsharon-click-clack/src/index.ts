import {
  calculateKeyPan,
  closeAudio,
  getMasterProfile,
  getMasterVolume,
  isMuted,
  playSwitch,
  setMasterProfile,
  setMasterVolume,
  setMuted,
  synthesizeCarriageBell,
  toggleMute,
  triggerHaptic,
} from './synth';
import { AttachOptions, PlaySwitchOptions, SwitchEngine, SwitchProfile } from './types';
export { autoInitClickClack } from './auto';

export * from './types';
export {
  playSwitch,
  setMasterProfile,
  getMasterProfile,
  setMasterVolume,
  getMasterVolume,
  isMuted,
  setMuted,
  toggleMute,
  calculateKeyPan,
  synthesizeCarriageBell,
  triggerHaptic,
  closeAudio,
};

/**
 * Attaches mechanical keyboard sound synthesis to any DOM element or window.
 *
 * @example
 * ```ts
 * import { attachMechanicalAudio } from '@0xsharon/click-clack';
 *
 * const unsubscribe = attachMechanicalAudio(document.querySelector('textarea'), {
 *   profile: 'creamy',
 *   volume: 0.8,
 *   stereoPan: true,
 *   wpmDynamics: true,
 *   deskmat: 'wood',
 *   carriageBell: true
 * });
 *
 * // Later, teardown when needed:
 * unsubscribe();
 * ```
 */
export function attachMechanicalAudio(
  target: Window | Document | HTMLElement | null | undefined,
  options: AttachOptions = {}
): () => void {
  if (!target) {
    return () => {};
  }

  const {
    profile = 'thock',
    volume = 0.8,
    playRelease = true,
    stereoPan = true,
    haptic = false,
    wpmDynamics = false,
    deskmat = 'none',
    carriageBell = false,
    filter,
  } = options;

  let keyTimestamps: number[] = [];

  const getWpmMultiplier = (): number => {
    if (!wpmDynamics) return 1.0;
    const now = Date.now();
    keyTimestamps.push(now);
    // Retain only keystrokes from the last 3 seconds
    keyTimestamps = keyTimestamps.filter((t) => now - t < 3000);
    const estimatedWpm = keyTimestamps.length * 4;
    if (estimatedWpm > 60) {
      return 1.0 + Math.min(0.18, (estimatedWpm - 60) * 0.0025);
    }
    return 1.0;
  };

  const handleKeyDown = (event: Event) => {
    const kbEvent = event as KeyboardEvent;
    if (kbEvent.repeat) return;
    if (filter && !filter(kbEvent)) return;

    const pitchBoost = getWpmMultiplier();
    const pan = stereoPan ? calculateKeyPan(kbEvent.key) : 0;

    playSwitch({
      profile,
      volume,
      pitch: pitchBoost,
      pan,
      key: kbEvent.key,
      isRelease: false,
      deskmat,
      carriageBell,
      haptic,
    });
  };

  const handleKeyUp = (event: Event) => {
    if (!playRelease) return;
    const kbEvent = event as KeyboardEvent;
    if (filter && !filter(kbEvent)) return;

    const pan = stereoPan ? calculateKeyPan(kbEvent.key) : 0;

    playSwitch({
      profile,
      volume: volume * 0.4,
      pan,
      key: kbEvent.key,
      isRelease: true,
      deskmat,
      carriageBell: false,
      haptic: false,
    });
  };

  target.addEventListener('keydown', handleKeyDown as EventListener, { passive: true });
  if (playRelease) {
    target.addEventListener('keyup', handleKeyUp as EventListener, { passive: true });
  }

  return () => {
    target.removeEventListener('keydown', handleKeyDown as EventListener);
    if (playRelease) {
      target.removeEventListener('keyup', handleKeyUp as EventListener);
    }
  };
}

/**
 * Creates an isolated or standalone switch engine controller.
 */
export function createSwitchEngine(defaultOptions: PlaySwitchOptions = {}): SwitchEngine {
  let profile = defaultOptions.profile ?? getMasterProfile();
  let volume = defaultOptions.volume ?? getMasterVolume();

  return {
    play: (opts = {}) => {
      playSwitch({
        profile: opts.profile ?? profile,
        volume: opts.volume ?? volume,
        pitch: opts.pitch,
        pan: opts.pan,
        isRelease: opts.isRelease,
        key: opts.key,
        deskmat: opts.deskmat,
        carriageBell: opts.carriageBell,
        haptic: opts.haptic,
      });
    },
    getProfile: () => profile,
    setProfile: (p: SwitchProfile) => {
      profile = p;
    },
    getVolume: () => volume,
    setVolume: (v: number) => {
      volume = v;
    },
    close: () => {
      closeAudio();
    },
  };
}
