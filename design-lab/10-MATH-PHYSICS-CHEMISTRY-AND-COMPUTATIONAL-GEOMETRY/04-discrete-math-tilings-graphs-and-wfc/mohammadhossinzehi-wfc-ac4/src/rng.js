/**
 * mulberry32: a tiny, fast, seedable 32 bit PRNG.
 * Every source of randomness in the solver goes through one of these so a
 * (model, size, seed) triple always produces exactly the same output.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
