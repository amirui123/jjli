import type { Vibration } from '../types'
import type { HapticEngine } from './types'

export class AudioEngine implements HapticEngine {
  readonly isSupported: boolean
  private ctx: AudioContext | null = null

  constructor() {
    this.isSupported =
      typeof window !== 'undefined' && 'AudioContext' in window
  }

  trigger(vibrations: Vibration[]) {
    if (!this.isSupported) return
    this.ensureContext()
    if (!this.ctx) return

    let offset = 0
    for (const v of vibrations) {
      offset += (v.delay ?? 0) / 1000
      this.playBurst(offset, v.duration / 1000, v.intensity ?? 1)
      offset += v.duration / 1000
    }
  }

  cancel() {
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }

  destroy() {
    this.cancel()
  }

  private ensureContext() {
    if (!this.ctx) this.ctx = new AudioContext()
  }

  private playBurst(start: number, duration: number, intensity: number) {
    const ctx = this.ctx!
    const now = ctx.currentTime + start

    // White noise source
    const bufferSize = Math.max(1, Math.ceil(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * intensity
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    // Bandpass filter at 4kHz for haptic-like feel
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 4000
    filter.Q.value = 1

    const gain = ctx.createGain()
    gain.gain.value = intensity * 0.3

    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start(now)
    source.stop(now + duration)
  }
}
