/**
 * Haptics engine bundled in web-haptics-toast (no extra npm dependency).
 * `<Toaster />` uses its own WebHaptics instance; `triggerHaptic` uses a lazy singleton for standalone use.
 */

import React from "react";
import { WebHaptics } from "./lib/web-haptics";
import type { HapticInput, TriggerOptions } from "./lib/web-haptics/types";

export { WebHaptics } from "./lib/web-haptics";
export { defaultPatterns } from "./lib/web-haptics/patterns";
export type {
  Vibration,
  HapticPattern,
  HapticPreset,
  HapticInput,
  TriggerOptions,
  WebHapticsOptions,
} from "./lib/web-haptics/types";

export const isHapticsSupported = WebHaptics.isSupported;

/**
 * React hook: whether this device/browser can produce haptic feedback.
 * Use to build settings UIs ("enable vibrations?") without feature-sniffing yourself.
 * SSR-safe: `false` during server render, resolves after mount.
 */
export function useHapticsSupported(): boolean {
  const [supported, setSupported] = React.useState(false);
  React.useEffect(() => {
    setSupported(WebHaptics.isSupported);
  }, []);
  return supported;
}

/**
 * Minimum gap (ms) between vibration triggers. Rapid-fire UI churn (lists,
 * async re-renders) can fire dozens of identical patterns per second; this
 * coalesces them invisibly (30 ms is below human pattern perception).
 */
const MIN_TRIGGER_GAP_MS = 30;
let lastTriggerAt = 0;

let defaultInstance: WebHaptics | null = null;

// Lazy singleton for triggerHaptic() when used outside Toaster.
function getDefaultInstance(debug?: boolean): WebHaptics {
  if (!defaultInstance) {
    defaultInstance = new WebHaptics({ debug: debug ?? false, showSwitch: false });
  } else if (debug !== undefined) {
    defaultInstance.setDebug(debug);
  }
  return defaultInstance;
}

export interface TriggerHapticOptions extends TriggerOptions {
  /** When true, play pattern as sound on desktop (same as web-haptics debug). */
  debug?: boolean;
}

/** Trigger a haptic pattern by name, custom array, or duration. For standalone use; Toaster uses its own WebHaptics instance. Rate-limited to one trigger per MIN_TRIGGER_GAP_MS. */
export function triggerHaptic(input: HapticInput, options?: TriggerHapticOptions): void {
  const now = Date.now();
  if (now - lastTriggerAt < MIN_TRIGGER_GAP_MS) return;
  lastTriggerAt = now;

  const instance = getDefaultInstance(options?.debug);
  const { debug: _d, ...triggerOpts } = options ?? {};
  instance.trigger(input, triggerOpts);
}
