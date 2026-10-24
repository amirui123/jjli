export { Haptics } from './haptics'
export { presets } from './patterns'
export { detectPlatform } from './detect'
export type { HapticInput, HapticsOptions, PresetName, Vibration } from './types'
export type { HapticEngine } from './engines/types'

import { Haptics } from './haptics'

/** Default singleton instance */
export const haptics = new Haptics()
