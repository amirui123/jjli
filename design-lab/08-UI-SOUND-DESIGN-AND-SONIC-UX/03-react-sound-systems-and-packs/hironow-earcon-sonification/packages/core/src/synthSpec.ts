import type { SynthSpec } from './types'

const VOICES = ['synth', 'fm', 'am', 'membrane', 'metal', 'noise', 'pluck']
const OSCILLATORS = ['sine', 'square', 'triangle', 'sawtooth']
const MODES = ['continuous', 'oneShot']
const CURVES = ['linear', 'exp']
const FILTERS = ['lowpass', 'highpass']
/** Practical bounds: rates a clock can drive, volumes that cannot clip the master. */
export const SYNTH_SPEC_LIMITS = { minRateHz: 0.05, maxRateHz: 60, minVolumeDb: -60, maxVolumeDb: 6, maxHits: 64 } as const
/** Scientific pitch notation: C4, F#3, Bb-1, A#10 */
export const NOTE_NAME = /^[A-Ga-g][#b]?-?\d{1,2}$/

type Rec = Record<string, unknown>
const isRec = (x: unknown): x is Rec => typeof x === 'object' && x !== null && !Array.isArray(x)
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

/**
 * Structural validation of a `SynthSpec` (spec §4.4), e.g. JSON pasted by a user.
 * Returns every problem found as a human-readable path + reason; empty = valid.
 */
export function validateSynthSpec(input: unknown): string[] {
  const errors: string[] = []
  if (!isRec(input)) return ['spec must be an object']
  const s = input
  if (s.kind !== 'synth') errors.push(`kind must be "synth" (got ${JSON.stringify(s.kind)})`)
  if (!MODES.includes(s.mode as string)) errors.push(`mode must be one of ${MODES.join(' | ')}`)
  if (!VOICES.includes(s.voice as string)) errors.push(`voice must be one of ${VOICES.join(' | ')}`)
  if (s.oscillator !== undefined && !OSCILLATORS.includes(s.oscillator as string)) {
    errors.push(`oscillator must be one of ${OSCILLATORS.join(' | ')}`)
  }
  if (!isRec(s.envelope)) errors.push('envelope is required: { attack, decay, sustain, release }')
  else {
    for (const k of ['attack', 'decay', 'release']) {
      const v = s.envelope[k]
      if (!isNum(v) || v < 0) errors.push(`envelope.${k} must be a number >= 0`)
    }
    const sus = s.envelope.sustain
    if (!isNum(sus) || sus < 0 || sus > 1) errors.push('envelope.sustain must be a number in [0, 1]')
  }
  if (!isNum(s.volume) || s.volume < SYNTH_SPEC_LIMITS.minVolumeDb || s.volume > SYNTH_SPEC_LIMITS.maxVolumeDb) {
    errors.push(`volume must be a number in [${SYNTH_SPEC_LIMITS.minVolumeDb}, ${SYNTH_SPEC_LIMITS.maxVolumeDb}] dB`)
  }

  if (s.fx !== undefined) {
    if (!isRec(s.fx)) errors.push('fx must be an object')
    else {
      if (s.fx.delay !== undefined) {
        const d = s.fx.delay
        if (!isRec(d)) errors.push('fx.delay must be an object')
        else {
          if (!isNum(d.time) || d.time < 0) errors.push('fx.delay.time must be a number >= 0 (seconds)')
          if (!isNum(d.feedback) || d.feedback < 0 || d.feedback >= 1) errors.push('fx.delay.feedback must be in [0, 1)')
          if (!isNum(d.wet) || d.wet < 0 || d.wet > 1) errors.push('fx.delay.wet must be in [0, 1]')
        }
      }
      if (s.fx.filter !== undefined) {
        const f = s.fx.filter
        if (!isRec(f)) errors.push('fx.filter must be an object')
        else {
          if (!FILTERS.includes(f.type as string)) errors.push(`fx.filter.type must be one of ${FILTERS.join(' | ')}`)
          if (!isNum(f.freq) || f.freq <= 0) errors.push('fx.filter.freq must be a number > 0 (Hz)')
        }
      }
    }
  }

  if (s.rate !== undefined) {
    const r = s.rate
    if (!isRec(r)) errors.push('rate must be an object')
    else {
      const { minRateHz, maxRateHz } = SYNTH_SPEC_LIMITS
      if (!isNum(r.minHz) || r.minHz < minRateHz || r.minHz > maxRateHz) errors.push(`rate.minHz must be in [${minRateHz}, ${maxRateHz}] Hz`)
      if (!isNum(r.maxHz) || r.maxHz < minRateHz || r.maxHz > maxRateHz) errors.push(`rate.maxHz must be in [${minRateHz}, ${maxRateHz}] Hz`)
      else if (isNum(r.minHz) && r.maxHz < r.minHz) errors.push('rate.maxHz must be >= rate.minHz')
      if (r.curve !== undefined && !CURVES.includes(r.curve as string)) errors.push(`rate.curve must be one of ${CURVES.join(' | ')}`)
    }
  }
  if (s.pitch !== undefined) {
    const p = s.pitch
    if (!isRec(p)) errors.push('pitch must be an object')
    else {
      if (typeof p.base !== 'string' || !NOTE_NAME.test(p.base)) errors.push('pitch.base must be a note name like "C5" or "F#3"')
      if (!isNum(p.semitonesAtMax)) errors.push('pitch.semitonesAtMax must be a number')
    }
  }
  if (s.pattern !== undefined) {
    if (!Array.isArray(s.pattern)) errors.push('pattern must be an array')
    else if (s.pattern.length > SYNTH_SPEC_LIMITS.maxHits) errors.push(`pattern must have at most ${SYNTH_SPEC_LIMITS.maxHits} hits`)
    else {
      let last = -Infinity
      s.pattern.forEach((h, i) => {
        if (!isRec(h)) return errors.push(`pattern[${i}] must be an object`)
        if (!isNum(h.offset) || h.offset < 0) errors.push(`pattern[${i}].offset must be a number >= 0 (seconds)`)
        else if (h.offset <= last) errors.push(`pattern[${i}].offset must be later than the previous hit (one voice cannot re-attack at the same time)`)
        else last = h.offset
        if (h.note !== undefined && (typeof h.note !== 'string' || !NOTE_NAME.test(h.note))) errors.push(`pattern[${i}].note must be a note name`)
        if (!isNum(h.dur) || h.dur <= 0) errors.push(`pattern[${i}].dur must be a number > 0 (seconds)`)
      })
    }
  }
  if (s.notes !== undefined) {
    if (!Array.isArray(s.notes)) errors.push('notes must be an array')
    else if (s.notes.length > SYNTH_SPEC_LIMITS.maxHits) errors.push(`notes must have at most ${SYNTH_SPEC_LIMITS.maxHits} entries`)
    else {
      let last = -Infinity
      s.notes.forEach((n, i) => {
        if (!isRec(n)) return errors.push(`notes[${i}] must be an object`)
        if (typeof n.note !== 'string' || !NOTE_NAME.test(n.note)) errors.push(`notes[${i}].note must be a note name`)
        if (!isNum(n.at) || n.at < 0) errors.push(`notes[${i}].at must be a number >= 0 (seconds)`)
        else if (n.at <= last) errors.push(`notes[${i}].at must be later than the previous note (one voice cannot re-attack at the same time)`)
        else last = n.at
        if (!isNum(n.dur) || n.dur <= 0) errors.push(`notes[${i}].dur must be a number > 0 (seconds)`)
      })
    }
  }
  return errors
}

export function isSynthSpec(input: unknown): input is SynthSpec {
  return validateSynthSpec(input).length === 0
}
