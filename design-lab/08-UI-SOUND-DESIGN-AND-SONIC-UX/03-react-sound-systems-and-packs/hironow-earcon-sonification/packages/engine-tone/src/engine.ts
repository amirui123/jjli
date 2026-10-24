import type { Bus, ContinuousSound, Engine, EngineStatus, OneShotSound, SoundSpec } from '@earcon/core'
import { presetIds } from './catalog'
import type { ContinuousFactory, OneShotFactory, SoundContext } from './presets'

type ToneModule = typeof import('tone')
type PresetsModule = typeof import('./presets')

export interface ToneEngineOptions {
  /** Seconds. Default 0.3 (background-tab safety). */
  lookAhead?: number
  /** Default -6. */
  masterVolumeDb?: number
  /** @internal Test seam. Default `() => import('tone')`. */
  loadTone?: () => Promise<ToneModule>
  /** @internal Test seam. Default `() => import('./presets')`. */
  loadPresets?: () => Promise<PresetsModule>
}

const DEFAULT_LOOK_AHEAD = 0.3
const DEFAULT_MASTER_DB = -6
const MIN_ONESHOT_GAP_SEC = 0.01

function webAudioAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return 'AudioContext' in globalThis || 'webkitAudioContext' in globalThis
}

/** A resource whose real Tone objects are built at unlock; commands before that are replayed. */
interface Lazy {
  materialize(): void
  dispose(): void
}

function resolveContinuous(spec: SoundSpec, presets: PresetsModule): ContinuousFactory {
  switch (spec.kind) {
    case 'preset':
      return presets.continuous[spec.id as keyof PresetsModule['continuous']]
    case 'custom':
      return spec.factory as ContinuousFactory
    case 'synth':
      return (ctx) => presets.fromSpec(spec, ctx) as ContinuousSound
  }
}

function resolveOneShot(spec: SoundSpec, presets: PresetsModule): OneShotFactory {
  switch (spec.kind) {
    case 'preset':
      return presets.oneShot[spec.id as keyof PresetsModule['oneShot']]
    case 'custom':
      return spec.factory as OneShotFactory
    case 'synth':
      return (ctx) => presets.fromSpec(spec, ctx) as OneShotSound
  }
}

function validateSpec(spec: SoundSpec, mode: 'continuous' | 'oneShot'): void {
  if (spec.kind === 'preset') {
    const known: readonly string[] = presetIds[mode]
    if (!known.includes(spec.id)) {
      throw new Error(`@earcon/engine-tone: unknown ${mode} preset "${spec.id}" (known: ${known.join(', ')})`)
    }
  } else if (spec.kind === 'synth' && spec.mode !== mode) {
    throw new Error(`@earcon/engine-tone: SynthSpec mode "${spec.mode}" cannot be used as ${mode}`)
  }
}

export function createToneEngine(opts: ToneEngineOptions = {}): Engine {
  const lookAhead = opts.lookAhead ?? DEFAULT_LOOK_AHEAD
  const loadTone = opts.loadTone ?? (() => import('tone'))
  const loadPresets = opts.loadPresets ?? (() => import('./presets'))

  let status: EngineStatus = webAudioAvailable() ? 'locked' : 'unavailable'
  let Tone: ToneModule | null = null
  let presets: PresetsModule | null = null
  let master: InstanceType<ToneModule['Gain']> | null = null
  let mute: InstanceType<ToneModule['Gain']> | null = null
  let masterDb = opts.masterVolumeDb ?? DEFAULT_MASTER_DB
  let muted = false
  let unlocking: Promise<void> | null = null
  let engineDisposed = false
  const listeners = new Set<(s: EngineStatus) => void>()
  const lazies = new Set<Lazy>()
  const busOutputs = new WeakMap<Bus, () => SoundContext>()

  function setStatus(next: EngineStatus) {
    if (status === next) return
    status = next
    for (const cb of listeners) cb(next)
  }

  function ready(): boolean {
    return Tone !== null
  }

  // ---------------------------------------------------------------- buses

  const inertBus = (id: string): Bus => ({ id, setPan() {}, setVolume() {}, dispose() {} })
  const inertContinuous: ContinuousSound = { start() {}, set() {}, stop() {}, dispose() {} }
  const inertOneShot: OneShotSound = { play() {}, dispose() {} }

  function createBus(id: string, busOpts: { pan?: number; volume?: number } = {}): Bus {
    if (engineDisposed) return inertBus(id)
    let pan = busOpts.pan ?? 0
    let volume = busOpts.volume ?? 0
    let gain: InstanceType<ToneModule['Gain']> | null = null
    let panner: InstanceType<ToneModule['Panner']> | null = null
    const lazy: Lazy = {
      materialize() {
        if (gain || !Tone || !mute) return
        panner = new Tone.Panner(pan).connect(mute)
        gain = new Tone.Gain(volume, 'decibels').connect(panner)
      },
      dispose() {
        gain?.dispose()
        panner?.dispose()
        gain = null
        panner = null
        lazies.delete(lazy)
      },
    }
    lazies.add(lazy)
    const bus: Bus = {
      id,
      setPan(p) {
        pan = p
        if (panner) panner.pan.value = p
      },
      setVolume(db) {
        volume = db
        if (gain) gain.gain.value = db
      },
      dispose: lazy.dispose,
    }
    busOutputs.set(bus, () => {
      lazy.materialize()
      if (!gain) throw new Error('@earcon/engine-tone: bus used before the engine is ready')
      return { out: gain }
    })
    if (ready()) lazy.materialize()
    return bus
  }

  function contextFor(bus: Bus): SoundContext {
    const get = busOutputs.get(bus)
    if (!get) throw new Error(`@earcon/engine-tone: bus "${bus.id}" was not created by this engine`)
    return get()
  }

  // ---------------------------------------------------------------- sounds

  function createContinuous(spec: SoundSpec, bus: Bus): ContinuousSound {
    validateSpec(spec, 'continuous')
    if (engineDisposed) return inertContinuous
    let real: ContinuousSound | null = null
    let started = false
    let intensity = 0
    let disposed = false
    const lazy: Lazy = {
      materialize() {
        if (real || disposed || !presets) return
        real = resolveContinuous(spec, presets)(contextFor(bus))
        if (started) real.start(intensity)
      },
      dispose() {
        disposed = true
        real?.dispose()
        real = null
        lazies.delete(lazy)
      },
    }
    lazies.add(lazy)
    if (ready()) lazy.materialize()
    return {
      start(i) {
        started = true
        intensity = i
        real?.start(i)
      },
      set(i) {
        intensity = i
        real?.set(i)
      },
      stop() {
        started = false
        real?.stop()
      },
      dispose: lazy.dispose,
    }
  }

  function createOneShot(spec: SoundSpec, bus: Bus): OneShotSound {
    validateSpec(spec, 'oneShot')
    if (engineDisposed) return inertOneShot
    let real: OneShotSound | null = null
    let disposed = false
    const lazy: Lazy = {
      materialize() {
        if (real || disposed || !presets) return
        real = resolveOneShot(spec, presets)(contextFor(bus))
      },
      dispose() {
        disposed = true
        real?.dispose()
        real = null
        lazies.delete(lazy)
      },
    }
    lazies.add(lazy)
    if (ready()) lazy.materialize()
    let lastTime = -Infinity
    return {
      // Plays before the engine is ready are dropped on purpose (ADR-0001 §15).
      play(o) {
        if (!real || !Tone) return
        // Monophonic Tone synths throw when an attack is scheduled at or before the
        // previous one; two transitions in the same instant must both sound.
        const time = Math.max(Tone.now(), lastTime + MIN_ONESHOT_GAP_SEC)
        lastTime = time
        real.play({ ...o, time } as Parameters<OneShotSound['play']>[0])
      },
      dispose: lazy.dispose,
    }
  }

  // ---------------------------------------------------------------- clock

  function scheduleRepeat(cb: (nowMs: number) => void, intervalSec: number): () => void {
    if (engineDisposed) return () => {}
    let clock: InstanceType<ToneModule['Clock']> | null = null
    const lazy: Lazy = {
      materialize() {
        if (clock || !Tone) return
        // Tone passes AudioContext seconds; Monitor.tick needs the Sample.t axis.
        clock = new Tone.Clock(() => cb(performance.now()), 1 / intervalSec)
        clock.start()
      },
      dispose() {
        clock?.stop()
        clock?.dispose()
        clock = null
        lazies.delete(lazy)
      },
    }
    lazies.add(lazy)
    if (ready()) lazy.materialize()
    return lazy.dispose
  }

  // ---------------------------------------------------------------- lifecycle

  async function unlock(): Promise<void> {
    if (status === 'unavailable' || Tone || engineDisposed) return
    if (unlocking) return unlocking
    unlocking = (async () => {
      const [tone, loadedPresets] = await Promise.all([loadTone(), loadPresets()])
      if (engineDisposed) return
      await tone.start()
      if (engineDisposed) return // dispose() raced the user gesture: build nothing
      const context = tone.getContext()
      context.lookAhead = lookAhead
      master = new tone.Gain(masterDb, 'decibels').connect(tone.getDestination())
      mute = new tone.Gain(muted ? 0 : 1).connect(master)
      presets = loadedPresets
      Tone = tone
      for (const lazy of [...lazies]) {
        try {
          lazy.materialize()
        } catch (e) {
          // One bad spec (e.g. invalid SynthSpec) must not take the whole engine down.
          console.error('@earcon/engine-tone: could not build a sound queued before unlock', e)
          lazies.delete(lazy)
        }
      }
      setStatus(context.state === 'running' ? 'ready' : 'suspended')
    })()
    try {
      await unlocking
    } finally {
      unlocking = null
    }
  }

  async function resume(): Promise<void> {
    if (engineDisposed) return
    if (!Tone) return unlock()
    const context = Tone.getContext()
    try {
      await context.resume()
      setStatus(context.state === 'running' ? 'ready' : 'suspended')
    } catch {
      setStatus('suspended')
    }
  }

  function onVisibilityChange() {
    if (!Tone || typeof document === 'undefined' || document.visibilityState !== 'visible') return
    if (Tone.getContext().rawContext.state === 'suspended') void resume()
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibilityChange)

  /** After dispose the engine is permanently `unavailable`; every factory returns an inert object. */
  function dispose() {
    if (engineDisposed) return
    engineDisposed = true
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityChange)
    for (const lazy of [...lazies]) lazy.dispose()
    mute?.dispose()
    master?.dispose()
    mute = null
    master = null
    Tone = null
    presets = null
    setStatus('unavailable')
    listeners.clear()
  }

  return {
    get status() {
      return status
    },
    unlock,
    resume,
    setMasterVolume(db) {
      masterDb = db
      if (master) master.gain.value = db
    },
    setMuted(m) {
      muted = m
      if (mute) mute.gain.value = m ? 0 : 1
    },
    createBus,
    createContinuous,
    createOneShot,
    scheduleRepeat,
    onStatusChange(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    dispose,
  }
}
