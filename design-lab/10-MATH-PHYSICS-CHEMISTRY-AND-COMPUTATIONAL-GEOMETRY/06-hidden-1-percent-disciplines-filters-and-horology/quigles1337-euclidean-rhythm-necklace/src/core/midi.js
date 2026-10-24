/**
 * MIDI out, the pure part: which bytes to send for which onset, and when.
 * Each necklace plays one note (General MIDI drums by default) on one channel; every
 * onset is a note-on at its audio-clock time and a note-off one gate later, shortened
 * so it never lands after the necklace's next step.
 */
export const DEFAULT_NOTES = Object.freeze([36, 38, 42, 39]); // GM drums: kick, snare, closed hat, clap
export const DEFAULT_CHANNEL = 10; // the GM percussion channel
export const DEFAULT_VELOCITY = 100;
export const DEFAULT_GATE = 0.06; // seconds

const missing = (v) => v == null || v === '';

export function clampNote(v, fallback = DEFAULT_NOTES[0]) {
  if (missing(v)) return fallback;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(127, Math.max(0, n)) : fallback;
}

export function clampChannel(v, fallback = DEFAULT_CHANNEL) {
  if (missing(v)) return fallback;
  const c = Math.round(Number(v));
  return Number.isFinite(c) ? Math.min(16, Math.max(1, c)) : fallback;
}

export function clampVelocity(v, fallback = DEFAULT_VELOCITY) {
  if (missing(v)) return fallback;
  const x = Math.round(Number(v));
  return Number.isFinite(x) ? Math.min(127, Math.max(1, x)) : fallback;
}

/** Note-on bytes for a 1-based channel. */
export function noteOn(channel, note, velocity = DEFAULT_VELOCITY) {
  return [0x90 | (clampChannel(channel) - 1), clampNote(note), clampVelocity(velocity)];
}

/** Note-off bytes for a 1-based channel. */
export function noteOff(channel, note) {
  return [0x80 | (clampChannel(channel) - 1), clampNote(note), 0];
}

/** Per-necklace note: the configured one, else the GM default for that position. */
export function noteFor(index, notes = DEFAULT_NOTES) {
  const v = Array.isArray(notes) ? notes[index] : undefined;
  return clampNote(v, DEFAULT_NOTES[index % DEFAULT_NOTES.length]);
}

/**
 * MIDI messages for scheduled onsets.
 * @param onsets [{ index, time, dur? }]: necklace index, audio-clock time, and optionally
 *               the seconds until that necklace's next step (caps the gate at half of it)
 * @param config { notes, channel, velocity, gate }
 * @returns [{ data: [status, note, velocity], time }] in time order, note-offs after note-ons
 */
export function midiEventsFor(onsets, config = {}) {
  const channel = clampChannel(config.channel);
  const velocity = clampVelocity(config.velocity);
  const gate = config.gate > 0 ? config.gate : DEFAULT_GATE;
  const out = [];
  for (const o of onsets) {
    const note = noteFor(o.index, config.notes);
    const g = o.dur > 0 ? Math.min(gate, o.dur / 2) : gate;
    out.push({ data: noteOn(channel, note, velocity), time: o.time });
    out.push({ data: noteOff(channel, note), time: o.time + g });
  }
  return out.sort((a, b) => a.time - b.time || (a.data[0] & 0xf0) - (b.data[0] & 0xf0));
}

/**
 * DOMHighResTimeStamp (performance.now() clock) for an audio-clock time, given both
 * clocks read at the same instant.
 */
export function midiTimestamp(audioTime, ctxNow, perfNow) {
  return perfNow + (audioTime - ctxNow) * 1000;
}
