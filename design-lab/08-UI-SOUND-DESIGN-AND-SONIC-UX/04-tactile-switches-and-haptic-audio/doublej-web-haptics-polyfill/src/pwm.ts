import type { Vibration } from './types'

const CYCLE_MS = 20

/** Convert vibrations with intensity into a flat on/off pattern for navigator.vibrate() */
export function toPwmPattern(vibrations: Vibration[]): number[] {
  const pattern: number[] = []

  for (const v of vibrations) {
    if (v.delay) pattern.push(v.delay)

    const intensity = Math.max(0, Math.min(1, v.intensity ?? 1))
    if (intensity === 0) {
      pattern.push(0, v.duration)
      continue
    }
    if (intensity === 1) {
      pattern.push(v.duration)
      continue
    }

    const onTime = Math.round(CYCLE_MS * intensity)
    const offTime = CYCLE_MS - onTime
    const cycles = Math.floor(v.duration / CYCLE_MS)
    const remainder = v.duration % CYCLE_MS

    for (let i = 0; i < cycles; i++) {
      pattern.push(onTime, offTime)
    }
    if (remainder > 0) {
      pattern.push(Math.round(remainder * intensity))
    }
  }

  return pattern
}
