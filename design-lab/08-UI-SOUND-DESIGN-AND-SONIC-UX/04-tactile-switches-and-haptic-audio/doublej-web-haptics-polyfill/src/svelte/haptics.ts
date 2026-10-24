import { onDestroy } from 'svelte'
import { Haptics } from '../haptics'
import type { HapticInput, HapticsOptions } from '../types'

export function createHaptics(options: HapticsOptions = {}) {
  const instance = new Haptics(options)

  onDestroy(() => instance.destroy())

  return {
    trigger: (input: HapticInput) => instance.trigger(input),
    cancel: () => instance.cancel(),
    get isSupported() {
      return instance.isSupported
    },
  }
}
