"use client";

export { Haptic, HapticTarget, type HapticTargetProps } from './haptic';
export { isIOSWebKitWithoutVibration, useIOSNativeHaptics } from './platform';
export { canTriggerHaptic, triggerHaptic, type HapticTriggerResult } from './trigger';
export type { HapticCapability } from './feedback';
export type { HapticInput, HapticPattern, HapticPreset, TriggerOptions, Vibration, WebHapticsOptions } from 'web-haptics';
