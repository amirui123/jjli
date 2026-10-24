import { useEffect, useRef } from 'react';
import { attachMechanicalAudio, playSwitch } from './index';
import { AttachOptions, PlaySwitchOptions, SwitchProfile } from './types';

export interface UseClickClackOptions extends AttachOptions {
  /** Whether the audio listener is active. Default: true */
  enabled?: boolean;
}

/**
 * React hook that binds mechanical keyboard audio feedback to a DOM ref.
 *
 * @example
 * ```tsx
 * import { useClickClack } from 'click-clack/react';
 *
 * function CodeEditor() {
 *   const inputRef = useRef<HTMLTextAreaElement>(null);
 *   useClickClack(inputRef, { profile: 'thock' });
 *
 *   return <textarea ref={inputRef} placeholder="Type something..." />;
 * }
 * ```
 */
export function useClickClack<T extends HTMLElement = HTMLElement>(
  targetRef: React.RefObject<T | null>,
  options: UseClickClackOptions = {}
): void {
  const { enabled = true, profile, volume, playRelease, filter } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const cleanup = attachMechanicalAudio(targetRef.current, {
      profile,
      volume,
      playRelease,
      filter: filter ?? ((e) => optionsRef.current.filter?.(e) ?? true),
    });

    return cleanup;
  }, [targetRef, enabled, profile, volume, playRelease, filter]);
}

/**
 * React hook that binds mechanical audio globally to the window or document.
 */
export function useGlobalClickClack(options: UseClickClackOptions = {}): void {
  const { enabled = true, profile, volume, playRelease, filter } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const cleanup = attachMechanicalAudio(window, {
      profile,
      volume,
      playRelease,
      filter,
    });

    return cleanup;
  }, [enabled, profile, volume, playRelease, filter]);
}

/**
 * React hook for imperatively triggering mechanical switch sounds.
 */
export function useMechanicalSound(defaultProfile: SwitchProfile = 'thock') {
  return {
    play: (opts?: PlaySwitchOptions) => playSwitch({ profile: defaultProfile, ...opts }),
  };
}
