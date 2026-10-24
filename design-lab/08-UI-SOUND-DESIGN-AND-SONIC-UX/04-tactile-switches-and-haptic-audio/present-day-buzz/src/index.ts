// Main feedback functionality
export {
  triggerInteractionFeedback,
  cancelInteractionFeedback,
  isHapticFeedbackAvailable,
  getInteractionFeedbackPreferences,
  setInteractionFeedbackPreferences,
  type TriggerInteractionFeedbackOptions,
} from './feedback'

// Presets and types
export {
  HAPTIC_PRESET,
  SOUND_PRESET,
  INTERACTION_FEEDBACK_PRESET,
  type HapticFeedbackPreset,
  type SoundFeedbackPreset,
  type InteractionFeedbackPreset,
} from './presets'

// Preferences management
export {
  getHapticFeedbackEnabled,
  setHapticFeedbackEnabled,
  getSoundFeedbackEnabled,
  setSoundFeedbackEnabled,
  isLikelyMobileDevice,
  LocalStorageAdapter,
  type StorageAdapter,
} from './preferences'