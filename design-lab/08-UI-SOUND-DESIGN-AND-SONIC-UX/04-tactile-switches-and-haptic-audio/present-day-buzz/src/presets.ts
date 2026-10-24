export const HAPTIC_PRESET = {
  BUZZ: 'buzz',
  ERROR: 'error',
  HEAVY: 'heavy',
  LIGHT: 'light',
  MEDIUM: 'medium',
  NUDGE: 'nudge',
  RIGID: 'rigid',
  SELECTION: 'selection',
  SOFT: 'soft',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const

export type HapticFeedbackPreset =
  (typeof HAPTIC_PRESET)[keyof typeof HAPTIC_PRESET]

export const SOUND_PRESET = {
  BUZZ: 'buzz',
  ERROR: 'error',
  HEAVY: 'heavy',
  LIGHT: 'light',
  MEDIUM: 'medium',
  NUDGE: 'nudge',
  RIGID: 'rigid',
  SELECTION: 'selection',
  SOFT: 'soft',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const

export type SoundFeedbackPreset =
  (typeof SOUND_PRESET)[keyof typeof SOUND_PRESET]

export const INTERACTION_FEEDBACK_PRESET = {
  ...HAPTIC_PRESET,
} as const

export type InteractionFeedbackPreset =
  (typeof INTERACTION_FEEDBACK_PRESET)[keyof typeof INTERACTION_FEEDBACK_PRESET]