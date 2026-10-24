/**
 * Planning a recorded clip: exactly `bars` bars, aligned to the next bar boundary of the
 * sequencer's clock, and a filename that says what is in it. Pure; the MediaRecorder
 * plumbing lives in src/recorder.js.
 */
import { barDuration } from './schedule.js';

export const CLIP_BARS = Object.freeze([1, 2, 4]);
export const DEFAULT_CLIP_BARS = 2;

/** Container types to try, best first. */
export const CLIP_MIME_TYPES = Object.freeze(['video/webm;codecs=vp9,opus', 'video/webm']);

/** The first candidate the browser supports, or '' when none is (let the browser choose). */
export function pickMimeType(isSupported, candidates = CLIP_MIME_TYPES) {
  for (const t of candidates) {
    try {
      if (isSupported(t)) return t;
    } catch {
      /* an isTypeSupported that throws counts as unsupported */
    }
  }
  return '';
}

export function clampClipBars(bars) {
  const b = Number(bars);
  return CLIP_BARS.includes(b) ? b : DEFAULT_CLIP_BARS;
}

/** `necklace-E3-8_E4-4-120bpm.webm`: every necklace's E(k,n), then the tempo. */
export function clipFilename(state, ext = 'webm') {
  const rhythms = state.necklaces.map((nk) => `E${nk.k}-${nk.n}`).join('_');
  return `necklace-${rhythms}-${state.tempo}bpm.${ext}`;
}

/**
 * When to start and stop recording, on the audio clock.
 *
 * @param state  { tempo, necklaces }
 * @param bars   1, 2 or 4 (anything else becomes the default)
 * @param clock  { now, barStart, barDur, minLead }
 *               now      audio time now (default 0)
 *               barStart start of the bar that contains `now`, from the sequencer
 *               barDur   that bar's duration (it may differ from the state's tempo when the
 *                        tempo was just changed: the sequencer applies tempo at bar ends)
 *               minLead  if the next boundary is closer than this, wait for the one after
 *
 * The clip starts at the first bar boundary at or after `now` and lasts `bars` bars at the
 * state's tempo, which is the tempo in force from that boundary on.
 */
export function clipPlan(state, bars = DEFAULT_CLIP_BARS, clock = {}) {
  const b = clampClipBars(bars);
  const barDur = barDuration(state.tempo);
  const now = Number.isFinite(clock.now) ? clock.now : 0;
  const anchor = Number.isFinite(clock.barStart) ? clock.barStart : now;
  const anchorDur = clock.barDur > 0 ? clock.barDur : barDur;
  const minLead = clock.minLead > 0 ? clock.minLead : 0;
  let start = anchor;
  if (now > anchor) start = anchor + Math.ceil((now - anchor) / anchorDur - 1e-9) * anchorDur;
  // too close: the bar after the anchor bar already runs at the state's tempo
  if (start - now < minLead) start += start === anchor ? anchorDur : barDur;
  const duration = b * barDur;
  return { bars: b, start, stop: start + duration, duration, barDur, filename: clipFilename(state) };
}
