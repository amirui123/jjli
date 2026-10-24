import type { Vibration } from '../types'
import type { HapticEngine } from './types'
import { toPwmPattern } from '../pwm'

export class AndroidEngine implements HapticEngine {
  readonly isSupported: boolean

  constructor() {
    this.isSupported =
      typeof navigator !== 'undefined' && 'vibrate' in navigator
  }

  trigger(vibrations: Vibration[]) {
    if (!this.isSupported) return
    navigator.vibrate(toPwmPattern(vibrations))
  }

  cancel() {
    if (this.isSupported) navigator.vibrate(0)
  }

  destroy() {
    this.cancel()
  }
}
