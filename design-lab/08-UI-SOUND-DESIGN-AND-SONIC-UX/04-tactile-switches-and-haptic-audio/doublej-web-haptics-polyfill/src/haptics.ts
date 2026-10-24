import type { HapticInput, HapticsOptions, Vibration } from './types'
import type { HapticEngine } from './engines/types'
import { detectPlatform } from './detect'
import { presets } from './patterns'
import { IosEngine } from './engines/ios'
import { AndroidEngine } from './engines/android'
import { AudioEngine } from './engines/audio'
import { NoopEngine } from './engines/noop'

function normalizeInput(input: HapticInput): Vibration[] {
  if (typeof input === 'string') return presets[input]
  if (typeof input === 'number') return [{ duration: input, intensity: 1 }]
  return input
}

function createEngine(options: HapticsOptions): HapticEngine {
  const engineType = options.engine ?? 'auto'

  if (engineType === 'ios') return new IosEngine()
  if (engineType === 'android') return new AndroidEngine()
  if (engineType === 'audio') return new AudioEngine()
  if (engineType === 'noop') return new NoopEngine()

  // auto-detect
  const platform = detectPlatform()
  if (platform === 'ios') return new IosEngine()
  if (platform === 'android') return new AndroidEngine()
  if (options.debug) return new AudioEngine()
  return new NoopEngine()
}

export class Haptics {
  private engine: HapticEngine

  constructor(options: HapticsOptions = {}) {
    this.engine = createEngine(options)
  }

  get isSupported(): boolean {
    return this.engine.isSupported
  }

  trigger(input: HapticInput) {
    this.engine.trigger(normalizeInput(input))
  }

  cancel() {
    this.engine.cancel()
  }

  destroy() {
    this.engine.destroy()
  }
}
