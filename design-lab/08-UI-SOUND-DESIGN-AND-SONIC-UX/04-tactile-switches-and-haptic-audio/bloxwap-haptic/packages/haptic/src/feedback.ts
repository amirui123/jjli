/** Structural compatibility with HIG 0.1.0; this entry has no platform imports. */
export type FeedbackIntent = 'press' | 'activate' | 'release' | 'cancel' | 'selection' | 'toggle' | 'disclosure' | 'success' | 'warning' | 'error' | 'notification';
export interface FeedbackEvent {
  id: string; source: string; intent: FeedbackIntent;
  origin: 'pointer' | 'keyboard' | 'native' | 'programmatic';
  impact?: 'light' | 'medium' | 'heavy';
  cancelled?: boolean; disabled?: boolean; busy?: boolean; suppressed?: boolean;
}
export interface FeedbackPreferences { version: 1; sound: boolean; haptics: boolean; volume: number; motion: boolean }
export interface HapticCapability {
  available: boolean; mechanism: 'none' | 'browser-vibration' | 'physical-tap' | 'native-haptics';
  observed: boolean; reason?: string;
}
/** HIG's intentionally silent phases stay silent on every backend. */
export const semanticHaptics = {
  press: null, activate: 'selection', release: null, cancel: null,
  selection: 'selection', toggle: 'selection', disclosure: null,
  success: 'success', warning: 'warning', error: 'error', notification: null,
} as const;
export type SemanticHaptic = Exclude<typeof semanticHaptics[FeedbackIntent], null> | 'light' | 'medium' | 'heavy';
export interface HapticBackend {
  capability: HapticCapability;
  trigger: (cue: SemanticHaptic) => void | Promise<void>;
  cancel: () => void | Promise<void>;
  dispose: () => void | Promise<void>;
}
async function attempt(action: () => void | Promise<void>): Promise<void> {
  try { await action(); } catch { /* Feedback cannot reject the host action. */ }
}
/** Inject browser/native operations. HIG owns deduplication, cadence and storage. */
export function createHapticAdapter(backend: HapticBackend) {
  let disposed = false;
  let background = false;
  return {
    capability: backend.capability,
    async play(event: FeedbackEvent, preferences: FeedbackPreferences): Promise<void> {
      if (disposed || background || !backend.capability.available || !preferences.haptics || event.cancelled || event.disabled || event.busy || event.suppressed) return;
      if (event.intent === 'cancel') { await attempt(() => backend.cancel()); return; }
      const cue = semanticHaptics[event.intent];
      if (cue) await attempt(() => backend.trigger(event.impact ?? cue));
    },
    cancel: () => attempt(() => backend.cancel()),
    async setBackground(value: boolean): Promise<void> {
      background = value;
      if (value) await attempt(() => backend.cancel());
    },
    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      await attempt(() => backend.cancel());
      await attempt(() => backend.dispose());
    },
  };
}

/** Pass the Expo Haptics module from the native host; no Expo dependency here. */
export function createNativeHapticAdapter<Impact, Notification>(haptics: {
  ImpactFeedbackStyle: { Light: Impact; Medium: Impact; Heavy: Impact };
  NotificationFeedbackType: { Success: Notification; Warning: Notification; Error: Notification };
  selectionAsync: () => Promise<void>;
  impactAsync: (style: Impact) => Promise<void>;
  notificationAsync: (type: Notification) => Promise<void>;
}, capability: HapticCapability) {
  return createHapticAdapter({
    capability,
    trigger(cue) {
      switch (cue) {
        case 'selection': return haptics.selectionAsync();
        case 'light': return haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
        case 'medium': return haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
        case 'heavy': return haptics.impactAsync(haptics.ImpactFeedbackStyle.Heavy);
        case 'success': return haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
        case 'warning': return haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
        case 'error': return haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      }
    },
    // Expo exposes no cancellation/disposal handle for an already submitted tick.
    cancel() {}, dispose() {},
  });
}
