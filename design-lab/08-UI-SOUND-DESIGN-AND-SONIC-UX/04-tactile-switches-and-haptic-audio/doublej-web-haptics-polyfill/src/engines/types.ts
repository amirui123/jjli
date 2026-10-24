import type { Vibration } from '../types'

export interface HapticEngine {
  readonly isSupported: boolean
  trigger(vibrations: Vibration[]): void
  cancel(): void
  destroy(): void
}
