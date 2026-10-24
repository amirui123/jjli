/**
 * Pure scheduling math for the look-ahead scheduler (no Web Audio here).
 *
 * All necklaces share one bar. A necklace with n steps divides the bar into n equal
 * steps, so necklaces with different n form a polyrhythm. The Sequencer walks bars in
 * order, emitting step events whose times fall before a horizon; tempo changes take
 * effect at the next bar so the necklaces never drift relative to each other.
 */
export const BEATS_PER_BAR = 4;

/** Seconds per bar at a tempo in beats per minute. */
export function barDuration(tempo) {
  return (60 / tempo) * BEATS_PER_BAR;
}

export function stepTime(barStart, barDur, n, i) {
  return barStart + (barDur * i) / n;
}

/** Smallest step index i (0..n) whose time is >= t within the bar; n when none is. */
export function firstStepAtOrAfter(barStart, barDur, n, t) {
  if (t <= barStart) return 0;
  return Math.min(n, Math.ceil(((t - barStart) / barDur) * n - 1e-9));
}

export class Sequencer {
  /**
   * @param maxLate steps more than this many seconds in the past are skipped rather than
   *                emitted in a burst (a tab that was stalled catches up silently).
   */
  constructor({ tempo = 120, startTime = 0, maxLate = 0.25 } = {}) {
    this.tempo = tempo;
    this.maxLate = maxLate;
    this.barIndex = 0;
    this.bars = [{ start: startTime, dur: barDuration(tempo) }];
    this.cursors = new Map();
  }

  /** The bar currently being scheduled (the last one). */
  get bar() {
    return this.bars[this.bars.length - 1];
  }

  /** Applies from the next bar. */
  setTempo(tempo) {
    this.tempo = tempo;
  }

  /**
   * Emit every step event with time < horizon, for the given necklaces [{ id, n }].
   * A necklace that appears for the first time starts at its first step at or after `now`.
   * A necklace whose n changed re-aligns to the new grid after its last emitted step.
   */
  advance(now, horizon, necklaces) {
    const events = [];
    const live = new Set();
    for (;;) {
      const bar = this.bar;
      for (const nk of necklaces) {
        live.add(nk.id);
        let cur = this.cursors.get(nk.id);
        if (!cur) {
          cur = { bar: this.barIndex, n: nk.n, idx: firstStepAtOrAfter(bar.start, bar.dur, nk.n, now), lastTime: -Infinity };
          this.cursors.set(nk.id, cur);
        } else if (cur.bar !== this.barIndex) {
          cur.bar = this.barIndex;
          cur.n = nk.n;
          cur.idx = 0;
        } else if (cur.n !== nk.n) {
          cur.n = nk.n;
          cur.idx = firstStepAtOrAfter(bar.start, bar.dur, nk.n, Math.max(now, cur.lastTime + 1e-6));
        }
        while (cur.idx < nk.n) {
          const t = stepTime(bar.start, bar.dur, nk.n, cur.idx);
          if (t >= horizon) break;
          if (t >= now - this.maxLate) events.push({ id: nk.id, step: cur.idx, n: nk.n, time: t, bar: this.barIndex });
          cur.lastTime = t;
          cur.idx++;
        }
      }
      const end = bar.start + bar.dur;
      if (end < horizon) {
        this.barIndex++;
        this.bars.push({ start: end, dur: barDuration(this.tempo) });
        if (this.bars.length > 4) this.bars.shift();
        continue;
      }
      break;
    }
    for (const id of [...this.cursors.keys()]) if (!live.has(id)) this.cursors.delete(id);
    return events;
  }

  /**
   * The bar { start, dur } that contains audio time t: the latest known bar starting at or
   * before t, or the first known bar when t is before the sequencer started.
   */
  barAt(t) {
    for (let i = this.bars.length - 1; i >= 0; i--) {
      const b = this.bars[i];
      if (t >= b.start) return { start: b.start, dur: b.dur };
    }
    return { start: this.bars[0].start, dur: this.bars[0].dur };
  }

  /** Bar phase in [0, 1) at audio time t. */
  phaseAt(t) {
    for (let i = this.bars.length - 1; i >= 0; i--) {
      const b = this.bars[i];
      if (t >= b.start) return ((t - b.start) / b.dur) % 1;
    }
    return 0;
  }
}
