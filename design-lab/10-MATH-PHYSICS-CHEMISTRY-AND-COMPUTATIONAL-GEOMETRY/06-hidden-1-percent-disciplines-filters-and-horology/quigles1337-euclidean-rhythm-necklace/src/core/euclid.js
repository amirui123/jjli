/**
 * Euclidean rhythms.
 *
 * Bjorklund's algorithm exactly as Godfried Toussaint walks through it in
 * "The Euclidean Algorithm Generates Traditional Musical Rhythms" (BRIDGES 2005), section 2.
 *
 * Start with k sequences [1] and n-k sequences [0]. Repeatedly append one remainder
 * sequence to each leading sequence; whatever is left over becomes the new remainder.
 * Stop when the remainder is a single sequence (or none).
 *
 * The distribution step always runs at least once (do/while). That is what yields the
 * paper's E(3,4) = [x . x x] rather than [x x x .].
 */
export function bjorklund(k, n) {
  if (!Number.isInteger(k) || !Number.isInteger(n)) throw new TypeError('k and n must be integers');
  if (n < 1) throw new RangeError('n must be >= 1');
  if (k < 0 || k > n) throw new RangeError('k must satisfy 0 <= k <= n');
  if (k === 0) return new Array(n).fill(0);
  if (k === n) return new Array(n).fill(1);

  let groups = Array.from({ length: k }, () => [1]);
  let remainder = Array.from({ length: n - k }, () => [0]);
  do {
    const m = Math.min(groups.length, remainder.length);
    const merged = [];
    for (let i = 0; i < m; i++) merged.push(groups[i].concat(remainder[i]));
    const leftoverGroups = groups.slice(m);
    const leftoverRemainder = remainder.slice(m);
    groups = merged;
    remainder = leftoverGroups.length ? leftoverGroups : leftoverRemainder;
  } while (remainder.length > 1);
  return groups.flat().concat(remainder.flat());
}

/** Box notation: 'x' for an onset, '.' for a rest. */
export const toBox = (bits) => bits.map((b) => (b ? 'x' : '.')).join('');
export const fromBox = (s) => [...s].map((c) => (c === 'x' || c === 'X' ? 1 : 0));

/** Indices of the onsets, in order. */
export function onsets(bits) {
  const out = [];
  bits.forEach((b, i) => {
    if (b) out.push(i);
  });
  return out;
}

/** Cyclic inter-onset interval vector, e.g. E(3,8) -> [3,3,2]. */
export function intervals(bits) {
  const o = onsets(bits);
  const n = bits.length;
  return o.map((p, i) => (i + 1 < o.length ? o[i + 1] - p : n - p + o[0]));
}

/** Left rotation: the result starts at index d of the input. Any integer d is fine. */
export function rotate(bits, d) {
  const n = bits.length;
  if (n === 0) return [];
  d = ((d % n) + n) % n;
  return bits.slice(d).concat(bits.slice(0, d));
}

/** The pattern the app actually plays: E(k,n) started at step `rot`. */
export function pattern(k, n, rot = 0) {
  return rotate(bjorklund(k, n), rot);
}

/** Canonical representative of the rhythm necklace: the lexicographically largest rotation. */
export function canonical(bits) {
  let best = null;
  let bestKey = '';
  for (let d = 0; d < bits.length; d++) {
    const r = rotate(bits, d);
    const key = r.join('');
    if (best === null || key > bestKey) {
      best = r;
      bestKey = key;
    }
  }
  return best;
}

export function isRotation(a, b) {
  if (a.length !== b.length) return false;
  const hay = ',' + b.concat(b).join(',') + ',';
  return hay.includes(',' + a.join(',') + ',');
}

export function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
