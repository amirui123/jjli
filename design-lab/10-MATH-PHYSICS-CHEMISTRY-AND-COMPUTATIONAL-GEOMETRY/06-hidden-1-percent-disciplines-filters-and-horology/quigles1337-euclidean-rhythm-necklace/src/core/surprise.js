/**
 * "Surprise me": two or three of the paper's named rhythms that share a bar nicely,
 * each on its own voice, at a tempo in a musical range. Pure: pass an rng in [0, 1)
 * (Math.random by default; mulberry32(seed) for a reproducible scene).
 */
import { pickerEntries } from './rhythms.js';
import { VOICE_IDS } from '../audio/voices.js';
import { normalize, LIMITS } from './state.js';

/**
 * Step counts that nest inside one bar: every n in a family divides the family's largest,
 * so the necklaces land on a common grid instead of fighting (3 against 8 is a texture,
 * 8 against 16 is a groove).
 */
export const FAMILIES = Object.freeze([
  Object.freeze([2, 4, 8, 16]),
  Object.freeze([3, 6, 12, 24]),
  Object.freeze([5]),
  Object.freeze([7]),
  Object.freeze([9]),
  Object.freeze([11]),
]);

export const TEMPO_RANGE = Object.freeze({ min: 84, max: 150 });

/** Small, fast, seedable PRNG (Tommy Ettinger's mulberry32). Returns a function giving [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates on a copy. */
export function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The named rhythms a surprise may draw from: on-screen step counts, at least two onsets. */
export function candidates() {
  return pickerEntries().filter((e) => e.n >= LIMITS.nMin && e.n <= LIMITS.nMax && e.k >= 2);
}

/** Candidate pools per family, weighted by size; families with fewer than two rhythms are out. */
export function pools() {
  const all = candidates();
  return FAMILIES.map((family) => all.filter((e) => family.includes(e.n))).filter((p) => new Set(p.map((e) => `${e.k}/${e.n}`)).size >= 2);
}

/**
 * A valid state with 2-3 distinct named rhythms from one family, distinct voices and a
 * tempo in TEMPO_RANGE. Rings are ordered by step count, most steps outermost.
 */
export function surprise(rng = Math.random) {
  const ps = pools();
  const total = ps.reduce((a, p) => a + p.length, 0);
  let r = rng() * total;
  let pool = ps[ps.length - 1];
  for (const p of ps) {
    if (r < p.length) {
      pool = p;
      break;
    }
    r -= p.length;
  }
  const want = rng() < 0.5 ? 3 : 2;
  const picks = [];
  const taken = new Set();
  for (const e of shuffle(pool, rng)) {
    const key = `${e.k}/${e.n}`;
    if (taken.has(key)) continue;
    taken.add(key);
    picks.push(e);
    if (picks.length === want) break;
  }
  picks.sort((a, b) => b.n - a.n || b.k - a.k);
  const voices = shuffle(VOICE_IDS, rng);
  const tempo = TEMPO_RANGE.min + Math.floor(rng() * (TEMPO_RANGE.max - TEMPO_RANGE.min + 1));
  return normalize({
    tempo,
    necklaces: picks.map((e, i) => ({ k: e.k, n: e.n, rot: e.rot, voice: voices[i] })),
  });
}
