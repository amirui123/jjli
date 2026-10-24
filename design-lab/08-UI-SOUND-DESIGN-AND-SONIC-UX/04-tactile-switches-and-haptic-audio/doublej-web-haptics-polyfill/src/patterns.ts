import type { PresetName, Vibration } from './types'

const d = (duration: number, intensity: number, delay?: number): Vibration => ({
  duration,
  intensity,
  ...(delay != null && { delay }),
})

export const presets: Record<PresetName, Vibration[]> = {
  success:   [d(30, 0.5), d(40, 1.0, 60)],
  error:     [d(40, 0.9), d(40, 0.9, 30), d(40, 0.9, 30)],
  warning:   [d(40, 0.8), d(40, 0.6, 80)],
  selection: [d(15, 0.4)],
  light:     [d(20, 0.3)],
  medium:    [d(25, 0.6)],
  heavy:     [d(30, 1.0)],
  soft:      [d(40, 0.3)],
  rigid:     [d(15, 0.8)],
  nudge:     [d(20, 0.6), d(20, 0.8, 40)],
  buzz:      [d(300, 0.7)],
}
