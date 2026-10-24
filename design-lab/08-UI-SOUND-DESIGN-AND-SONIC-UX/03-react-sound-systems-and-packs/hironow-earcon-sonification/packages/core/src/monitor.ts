import type { Level, Monitor, MonitorEvent, MonitorOptions, MonitorState, Sample } from './types'

const DEFAULT_VELOCITY_WINDOW_MS = 10_000
const DEFAULT_STALE_AFTER_MS = 15_000
const DEFAULT_HORIZON_SEC = 300
const INTENSITY_EPSILON = 1e-3

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Level thresholds normalized to the danger score axis (`d >= enter` enters, `d <= exit` exits). */
interface NormalizedLevel {
  id: string
  enter: number
  exit: number
}

function normalizeLevels(opts: MonitorOptions): NormalizedLevel[] {
  if (opts.levels.length === 0) throw new Error(`createMonitor(${opts.id}): levels must not be empty`)
  const sign = opts.direction === 'decreasing' ? -1 : 1
  const ids = new Set<string>()
  const levels = opts.levels.map((level: Level) => {
    if (!Number.isFinite(level.enter) || !Number.isFinite(level.exit)) {
      throw new Error(`createMonitor(${opts.id}): level "${level.id}" enter/exit must be finite numbers`)
    }
    if (ids.has(level.id)) throw new Error(`createMonitor(${opts.id}): duplicate level id "${level.id}"`)
    ids.add(level.id)
    const enter = sign * level.enter
    const exit = sign * level.exit
    if (!(exit < enter)) {
      throw new Error(
        `createMonitor(${opts.id}): level "${level.id}" exit (${level.exit}) must be on the safe side of enter (${level.enter})`,
      )
    }
    return { id: level.id, enter, exit }
  })
  for (let i = 1; i < levels.length; i++) {
    if (!(levels[i]!.enter > levels[i - 1]!.enter)) {
      throw new Error(
        `createMonitor(${opts.id}): levels must be in safe → dangerous order; "${levels[i]!.id}" is not more dangerous than "${levels[i - 1]!.id}"`,
      )
    }
  }
  return levels
}

function bandWidth(levels: NormalizedLevel[], k: number): number {
  const current = levels[k]!
  const next = levels[k + 1]
  if (next) return next.enter - current.enter
  const previous = levels[k - 1]
  if (previous) return current.enter - previous.enter
  return Math.abs(current.enter - current.exit) * 4 // single level: provisional (spec §3.4)
}

function validateOptions(opts: MonitorOptions): void {
  if (opts.urgency?.mode === 'eta' && !Number.isFinite(opts.urgency.eventAt)) {
    throw new Error(`createMonitor(${opts.id}): urgency.eventAt must be a finite number`)
  }
  const horizon = opts.urgency?.mode === 'eta' ? (opts.urgency.horizonSec ?? DEFAULT_HORIZON_SEC) : DEFAULT_HORIZON_SEC
  if (!(horizon > 1)) throw new Error(`createMonitor(${opts.id}): urgency.horizonSec must be > 1 (log10 scale), got ${horizon}`)
  if (opts.staleAfterMs !== undefined && !(opts.staleAfterMs >= 0)) {
    throw new Error(`createMonitor(${opts.id}): staleAfterMs must be >= 0, got ${opts.staleAfterMs}`)
  }
  if (opts.velocityWindowMs !== undefined && !(opts.velocityWindowMs > 0)) {
    throw new Error(`createMonitor(${opts.id}): velocityWindowMs must be > 0, got ${opts.velocityWindowMs}`)
  }
}

export function createMonitor(opts: MonitorOptions): Monitor {
  validateOptions(opts)
  const levels = normalizeLevels(opts)
  const sign = opts.direction === 'decreasing' ? -1 : 1
  const urgency = opts.urgency ?? { mode: 'value' }
  const tauSec = (opts.velocityWindowMs ?? DEFAULT_VELOCITY_WINDOW_MS) / 1000
  const staleAfterMs = opts.staleAfterMs ?? DEFAULT_STALE_AFTER_MS
  const ackScope = opts.ackScope ?? 'level'
  const eventAt = urgency.mode === 'eta' ? sign * urgency.eventAt : null
  const horizonSec = urgency.mode === 'eta' ? (urgency.horizonSec ?? DEFAULT_HORIZON_SEC) : DEFAULT_HORIZON_SEC

  let levelIdx = -1
  let prev: { d: number; t: number } | null = null
  let ema: number | null = null
  let state: MonitorState = initialState()

  function initialState(): MonitorState {
    return {
      id: opts.id,
      level: null,
      stale: false,
      intensity: 0,
      eta: null,
      velocity: 0,
      acknowledged: false,
      lastSample: null,
    }
  }

  /** Highest index in (above, below) whose enter threshold is met, or -1. */
  function highestEntered(d: number, above: number, below: number): number {
    for (let j = below - 1; j > above; j--) {
      if (d >= levels[j]!.enter) return j
    }
    return -1
  }

  function intensityFor(d: number): { intensity: number; eta: number | null; velocity: number } {
    const velocity = ema ?? 0
    let eta: number | null = null
    let iEta = 0
    if (eventAt !== null) {
      const approach = Math.max(0, velocity)
      const remaining = eventAt - d
      eta = approach > 0 ? remaining / approach : Number.POSITIVE_INFINITY
      iEta = clamp01(1 - Math.log10(Math.max(eta, 1)) / Math.log10(horizonSec))
    }
    if (levelIdx < 0) return { intensity: 0, eta, velocity }
    const iValue = clamp01((d - levels[levelIdx]!.enter) / bandWidth(levels, levelIdx))
    return { intensity: Math.max(iValue, iEta), eta, velocity }
  }

  function update(sample: Sample): MonitorEvent[] {
    // Non-finite input cannot be mapped; it is dropped like a stale timestamp.
    if (!Number.isFinite(sample.value) || !Number.isFinite(sample.t)) return []
    if (prev && sample.t <= prev.t) return []
    const events: MonitorEvent[] = []
    const d = sign * sample.value

    if (state.stale) events.push({ type: 'resume' })

    if (prev) {
      const dt = (sample.t - prev.t) / 1000
      const raw = (d - prev.d) / dt
      const alpha = 1 - Math.exp(-dt / tauSec)
      ema = ema === null ? raw : ema + alpha * (raw - ema)
    }
    prev = { d, t: sample.t }

    let acknowledged = state.acknowledged
    const k = levelIdx
    const promoted = highestEntered(d, k, levels.length)
    if (promoted > k) {
      if (acknowledged) {
        acknowledged = false
        events.push({ type: 'ack-cleared', reason: 'escalate' })
      }
      levelIdx = promoted
      events.push({ type: 'enter', level: levels[promoted]!.id, from: k < 0 ? null : levels[k]!.id })
    } else if (k >= 0 && d <= levels[k]!.exit) {
      const to = highestEntered(d, -1, k)
      levelIdx = to
      events.push({ type: 'exit', level: levels[k]!.id, to: to < 0 ? null : levels[to]!.id })
      if (acknowledged && (ackScope === 'level' || to < 0)) {
        acknowledged = false
        events.push({ type: 'ack-cleared', reason: 'exit' })
      }
      if (to >= 0) events.push({ type: 'enter', level: levels[to]!.id, from: levels[k]!.id })
    }

    const { intensity, eta, velocity } = intensityFor(d)
    if (Math.abs(intensity - state.intensity) >= INTENSITY_EPSILON) {
      events.push({ type: 'intensity', value: intensity })
    }

    state = {
      ...state,
      level: levelIdx < 0 ? null : levels[levelIdx]!.id,
      stale: false,
      intensity,
      eta,
      velocity,
      acknowledged,
      lastSample: { value: sample.value, t: sample.t },
    }
    return events
  }

  function tick(nowMs: number): MonitorEvent[] {
    if (staleAfterMs <= 0 || state.stale || !state.lastSample) return []
    if (nowMs - state.lastSample.t <= staleAfterMs) return []
    state = { ...state, stale: true }
    return [{ type: 'stale' }]
  }

  function acknowledge(): MonitorEvent[] {
    if (levelIdx < 0 || state.acknowledged) return []
    state = { ...state, acknowledged: true }
    return [{ type: 'ack' }]
  }

  function reset(): void {
    levelIdx = -1
    prev = null
    ema = null
    state = initialState()
  }

  return {
    get state() {
      return state
    },
    update,
    tick,
    acknowledge,
    reset,
  }
}
