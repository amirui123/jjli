import { useEffect, useRef } from 'react'
import { Haptics } from '../haptics'
import type { HapticInput, HapticsOptions } from '../types'

export function useHaptics(options: HapticsOptions = {}) {
  const ref = useRef<Haptics | null>(null)

  if (!ref.current) ref.current = new Haptics(options)

  useEffect(() => {
    return () => {
      ref.current?.destroy()
      ref.current = null
    }
  }, [])

  return {
    trigger: (input: HapticInput) => ref.current?.trigger(input),
    cancel: () => ref.current?.cancel(),
    get isSupported() {
      return ref.current?.isSupported ?? false
    },
  }
}
