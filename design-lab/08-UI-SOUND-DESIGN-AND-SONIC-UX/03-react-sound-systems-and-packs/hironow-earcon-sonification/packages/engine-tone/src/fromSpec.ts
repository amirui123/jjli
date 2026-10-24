import * as Tone from 'tone'
import { validateSynthSpec, type ContinuousSound, type OneShotSound, type SynthSpec } from '@earcon/core'
import type { OneShotOptions, SoundContext } from './presets'
import { ticker } from './ticker'

/**
 * Interprets a declarative `SynthSpec` (spec §4.4) into a sound.
 * Chain: voice → [fx.filter] → [fx.delay] → out.
 */
export function fromSpec(spec: SynthSpec, ctx: SoundContext): ContinuousSound | OneShotSound {
  const errors = validateSynthSpec(spec)
  if (errors.length) throw new Error(`@earcon/engine-tone: invalid SynthSpec:\n  ${errors.join('\n  ')}`)
  return spec.mode === 'continuous' ? continuousFromSpec(spec, ctx) : oneShotFromSpec(spec, ctx)
}

type Voice = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.MembraneSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth

const DEFAULT_PITCH = { base: 'C5', semitonesAtMax: 0 }
const DEFAULT_HIT_DUR = 0.1

const freqOf = (note: string, semitones: number) => Tone.Frequency(note).transpose(Math.round(semitones)).toFrequency()

function buildChain(spec: SynthSpec, out: Tone.InputNode): { voice: Voice; nodes: Array<{ dispose(): unknown }> } {
  const nodes: Array<{ dispose(): unknown }> = []
  let dest: Tone.InputNode = out
  if (spec.fx?.delay) {
    const { time, feedback, wet } = spec.fx.delay
    const delay = new Tone.FeedbackDelay({ delayTime: time, feedback, wet }).connect(dest)
    nodes.push(delay)
    dest = delay
  }
  if (spec.fx?.filter) {
    const filter = new Tone.Filter(spec.fx.filter.freq, spec.fx.filter.type).connect(dest)
    nodes.push(filter)
    dest = filter
  }
  const voice = makeVoice(spec)
  voice.connect(dest)
  nodes.push(voice)
  return { voice, nodes }
}

function makeVoice(spec: SynthSpec): Voice {
  const { envelope, volume } = spec
  const osc = spec.oscillator ? { oscillator: { type: spec.oscillator } } : {}
  switch (spec.voice) {
    case 'synth':
      return new Tone.Synth({ ...osc, envelope, volume })
    case 'fm':
      return new Tone.FMSynth({ ...osc, envelope, volume })
    case 'am':
      return new Tone.AMSynth({ ...osc, envelope, volume })
    case 'membrane':
      return new Tone.MembraneSynth({ ...osc, envelope, volume })
    case 'metal':
      return new Tone.MetalSynth({ envelope: { attack: envelope.attack, decay: envelope.decay, release: envelope.release }, volume })
    case 'noise':
      return new Tone.NoiseSynth({ envelope, volume })
    case 'pluck':
      return new Tone.PluckSynth({ release: envelope.release, volume })
  }
}

/** Trigger one hit. Noise voices have no pitch (spec §4.4). */
function hit(spec: SynthSpec, voice: Voice, note: string, semitones: number, dur: number, time: number, velocity?: number) {
  if (spec.voice === 'noise') {
    ;(voice as Tone.NoiseSynth).triggerAttackRelease(dur, time, velocity)
    return
  }
  ;(voice as Tone.Synth).triggerAttackRelease(freqOf(note, semitones), dur, time, velocity)
}

function oneShotFromSpec(spec: SynthSpec, { out }: SoundContext): OneShotSound {
  const { voice, nodes } = buildChain(spec, out)
  const notes = spec.notes ?? [{ note: DEFAULT_PITCH.base, at: 0, dur: DEFAULT_HIT_DUR }]
  return {
    play({ transpose = 0, velocity, time = Tone.now() }: OneShotOptions = {}) {
      for (const n of notes) hit(spec, voice, n.note, transpose, n.dur, time + n.at, velocity)
    },
    dispose() {
      for (const n of nodes) n.dispose()
    },
  }
}

function continuousFromSpec(spec: SynthSpec, { out }: SoundContext): ContinuousSound {
  const { voice, nodes } = buildChain(spec, out)
  const rate = spec.rate ?? { minHz: 1, maxHz: 1 }
  const pitch = spec.pitch ?? DEFAULT_PITCH
  const pattern = spec.pattern ?? [{ offset: 0, dur: DEFAULT_HIT_DUR }]
  const hzOf =
    rate.curve === 'exp'
      ? (i: number) => rate.minHz * (rate.maxHz / rate.minHz) ** i
      : (i: number) => rate.minHz + (rate.maxHz - rate.minHz) * i
  const t = ticker((time, i) => {
    const period = 1 / hzOf(i)
    for (const h of pattern) {
      if (h.offset >= period) continue
      hit(spec, voice, h.note ?? pitch.base, pitch.semitonesAtMax * i, h.dur, time + h.offset)
    }
  }, hzOf)
  return {
    start: t.start,
    set: t.set,
    stop: t.stop,
    dispose() {
      t.dispose()
      for (const n of nodes) n.dispose()
    },
  }
}
