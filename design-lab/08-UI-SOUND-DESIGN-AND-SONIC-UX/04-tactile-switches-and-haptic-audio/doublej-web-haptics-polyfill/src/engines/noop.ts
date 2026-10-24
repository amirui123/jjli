import type { HapticEngine } from './types'

export class NoopEngine implements HapticEngine {
  readonly isSupported = false
  trigger() {}
  cancel() {}
  destroy() {}
}
