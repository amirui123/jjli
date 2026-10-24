// ---------------------------------------------------------------- monitor

/** Which way the value moves when it approaches danger. */
export type Direction = 'increasing' | 'decreasing'

export interface Level {
  id: string
  /** Enter the level when the value reaches this (following `direction`). */
  enter: number
  /** Leave the level when the value returns to this. Must be on the safe side of `enter`. */
  exit: number
}

export type Urgency =
  | { mode: 'value' }
  | { mode: 'eta'; eventAt: number; horizonSec?: number } // horizonSec default 300

export interface MonitorOptions {
  id: string
  direction: Direction
  /** Safe → dangerous order. Empty is an error. */
  levels: Level[]
  /** Default `{ mode: 'value' }`. */
  urgency?: Urgency
  /** EMA time constant for the velocity estimate. Default 10_000. */
  velocityWindowMs?: number
  /** Default 15_000. `0` disables the watchdog. */
  staleAfterMs?: number
  /** Default `'level'`. */
  ackScope?: 'level' | 'until-safe'
}

export interface Sample {
  value: number
  /** Milliseconds on a monotonic axis (`performance.now()`-like). */
  t: number
}

/** `null` = safe zone. */
export type LevelId = string | null

export interface MonitorState {
  id: string
  level: LevelId
  stale: boolean
  /** 0..1 urgency within the current level. 0 in the safe zone. */
  intensity: number
  /** Seconds until `eventAt`. `null` in value mode, `Infinity` when not approaching. */
  eta: number | null
  /** Rate of change of the danger score per second. Positive = approaching danger. */
  velocity: number
  acknowledged: boolean
  lastSample: Sample | null
}

export type MonitorEvent =
  | { type: 'enter'; level: string; from: LevelId }
  | { type: 'exit'; level: string; to: LevelId }
  | { type: 'intensity'; value: number }
  | { type: 'stale' }
  | { type: 'resume' }
  | { type: 'ack' }
  | { type: 'ack-cleared'; reason: 'escalate' | 'exit' }

export interface Monitor {
  readonly state: Readonly<MonitorState>
  update(sample: Sample): MonitorEvent[]
  /** Watchdog check. `nowMs` is on the same axis as `Sample.t`. The host calls it periodically. */
  tick(nowMs: number): MonitorEvent[]
  acknowledge(): MonitorEvent[]
  reset(): void
}

// ---------------------------------------------------------------- arbiter

export type ArbiterPolicy = { mode: 'all' } | { mode: 'worst-only' } | { mode: 'top-n'; n: number }

// ---------------------------------------------------------------- engine

export type EngineStatus = 'locked' | 'ready' | 'suspended' | 'unavailable'

export interface ContinuousSound {
  start(intensity: number): void
  set(intensity: number): void
  stop(): void
  dispose(): void
}

export interface OneShotSound {
  play(opts?: { transpose?: number; velocity?: number }): void
  dispose(): void
}

export interface Bus {
  readonly id: string
  /** -1..1 */
  setPan(pan: number): void
  setVolume(db: number): void
  dispose(): void
}

export interface Engine {
  readonly status: EngineStatus
  /** Call from a user-gesture handler. */
  unlock(): Promise<void>
  resume(): Promise<void>
  setMasterVolume(db: number): void
  setMuted(muted: boolean): void
  createBus(id: string, opts?: { pan?: number; volume?: number }): Bus
  createContinuous(spec: SoundSpec, bus: Bus): ContinuousSound
  createOneShot(spec: SoundSpec, bus: Bus): OneShotSound
  /**
   * Periodic callback that keeps running in background tabs (worker clock or similar).
   * `nowMs` MUST be on the same axis as `Sample.t` (`performance.now()`-like
   * milliseconds), never AudioContext seconds — `Monitor.tick` compares it against
   * `lastSample.t`.
   */
  scheduleRepeat(cb: (nowMs: number) => void, intervalSec: number): () => void
  onStatusChange(cb: (s: EngineStatus) => void): () => void
  dispose(): void
}

// ---------------------------------------------------------------- sound specs

/** Declarative synth description; JSON-serializable. Interpreted by an engine. */
export interface SynthSpec {
  kind: 'synth'
  mode: 'continuous' | 'oneShot'
  voice: 'synth' | 'fm' | 'am' | 'membrane' | 'metal' | 'noise' | 'pluck'
  oscillator?: 'sine' | 'square' | 'triangle' | 'sawtooth'
  envelope: { attack: number; decay: number; sustain: number; release: number }
  /** dB */
  volume: number
  fx?: {
    delay?: { time: number; feedback: number; wet: number }
    filter?: { type: 'lowpass' | 'highpass'; freq: number }
  }
  // --- continuous ---
  /** Tick rate at intensity 0 → 1. */
  rate?: { minHz: number; maxHz: number; curve?: 'linear' | 'exp' }
  pitch?: { base: string; semitonesAtMax: number }
  /** Hits within one tick. `offset` in seconds. Default: one hit of `pitch.base`. */
  pattern?: Array<{ offset: number; note?: string; dur: number }>
  // --- oneShot ---
  /** Seconds. */
  notes?: Array<{ note: string; at: number; dur: number }>
}

export type SoundSpec =
  | { kind: 'preset'; id: string }
  | SynthSpec
  | { kind: 'custom'; factory: unknown }
