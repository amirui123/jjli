import type { Vibration } from '../types'
import type { HapticEngine } from './types'

const TOGGLE_MIN = 16
const TOGGLE_MAX = 184

export class IosEngine implements HapticEngine {
  readonly isSupported: boolean
  private label: HTMLLabelElement | null = null
  private checkbox: HTMLInputElement | null = null
  private rafId = 0

  constructor() {
    this.isSupported = this.checkSupport()
    if (this.isSupported) this.createDom()
  }

  trigger(vibrations: Vibration[]) {
    if (!this.label) return
    this.cancel()
    this.playSequence(vibrations, 0)
  }

  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  destroy() {
    this.cancel()
    this.label?.remove()
    this.label = null
    this.checkbox = null
  }

  private checkSupport(): boolean {
    if (typeof document === 'undefined') return false
    const input = document.createElement('input')
    input.type = 'checkbox'
    // The `switch` attribute is the key — only supported in Safari 17.4+
    return 'switch' in input
  }

  private createDom() {
    this.checkbox = document.createElement('input')
    this.checkbox.type = 'checkbox'
    ;(this.checkbox as any).switch = true
    this.checkbox.setAttribute('switch', '')

    this.label = document.createElement('label')
    this.label.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none'
    this.label.appendChild(this.checkbox)
    document.body.appendChild(this.label)
  }

  private playSequence(vibrations: Vibration[], index: number) {
    if (index >= vibrations.length || !this.label) return

    const v = vibrations[index]
    if (v.delay) {
      setTimeout(() => this.playVibration(v, index, vibrations), v.delay)
    } else {
      this.playVibration(v, index, vibrations)
    }
  }

  private playVibration(v: Vibration, index: number, all: Vibration[]) {
    if (!this.label) return

    const intensity = Math.max(0, Math.min(1, v.intensity ?? 1))
    const interval = TOGGLE_MAX - intensity * (TOGGLE_MAX - TOGGLE_MIN)
    const end = performance.now() + v.duration

    const tick = () => {
      if (performance.now() >= end) {
        this.playSequence(all, index + 1)
        return
      }
      this.label!.click()
      setTimeout(() => {
        this.rafId = requestAnimationFrame(tick)
      }, interval)
    }

    this.label.click()
    setTimeout(() => {
      this.rafId = requestAnimationFrame(tick)
    }, interval)
  }
}
