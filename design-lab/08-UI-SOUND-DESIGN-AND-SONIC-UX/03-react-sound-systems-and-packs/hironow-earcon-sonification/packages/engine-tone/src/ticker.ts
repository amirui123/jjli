import * as Tone from 'tone'
import type { ContinuousSound } from '@earcon/core'

/** A continuous sound driven by a Tone.Clock; `clock` is exposed for diagnostics and tests. */
export interface TickerSound extends ContinuousSound {
  readonly clock: Tone.Clock
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** 可変レートのティッカー。onTick には AudioContext 秒と現在の intensity が渡る */
export function ticker(
  onTick: (time: number, intensity: number) => void,
  hzOf: (intensity: number) => number,
): TickerSound {
  let intensity = 0
  let lastTime = -Infinity
  // While `frequency` ramps, Tone.Clock can deliver a tick at or before the previous
  // tick's time; monophonic synths throw on a non-increasing attack. Drop those ticks.
  const clock = new Tone.Clock((t) => {
    if (t <= lastTime) return
    lastTime = t
    onTick(t, intensity)
  }, hzOf(0))
  return {
    clock,
    start(i: number) {
      intensity = clamp01(i)
      clock.frequency.value = hzOf(intensity)
      if (clock.state !== 'started') clock.start()
    },
    set(i: number) {
      intensity = clamp01(i)
      clock.frequency.rampTo(hzOf(intensity), 0.2)
    },
    stop() {
      if (clock.state === 'started') clock.stop()
    },
    dispose() {
      clock.dispose()
    },
  }
}
