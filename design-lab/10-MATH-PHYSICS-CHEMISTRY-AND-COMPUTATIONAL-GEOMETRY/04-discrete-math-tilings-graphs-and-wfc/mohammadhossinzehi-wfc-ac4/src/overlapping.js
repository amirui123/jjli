import { DX, DY } from './directions.js';

/**
 * Parse a text bitmap. Every distinct character becomes one colour.
 * Blank lines at the start/end are ignored; all remaining rows must have
 * the same length.
 */
export function parseSample(text) {
  const rows = text.replace(/\r/g, '').split('\n');
  while (rows.length && rows[0].length === 0) rows.shift();
  while (rows.length && rows[rows.length - 1].length === 0) rows.pop();
  if (rows.length === 0) throw new Error('sample is empty');
  const width = rows[0].length;
  const palette = [];
  const index = new Map();
  const data = new Int32Array(width * rows.length);
  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(`sample row ${y + 1} has length ${row.length}, expected ${width}`);
    }
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      if (!index.has(ch)) {
        index.set(ch, palette.length);
        palette.push(ch);
      }
      data[x + y * width] = index.get(ch);
    }
  });
  return { width, height: rows.length, data, palette };
}

const build = (N, f) => {
  const out = new Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) out[x + y * N] = f(x, y);
  return out;
};
export const rotatePattern = (p, N) => build(N, (x, y) => p[N - 1 - y + x * N]);
export const reflectPattern = (p, N) => build(N, (x, y) => p[N - 1 - x + y * N]);

/** The 8 elements of the dihedral group D4 applied to p, in the reference order. */
export function symmetries(p, N) {
  const ps = new Array(8);
  ps[0] = p;
  ps[1] = reflectPattern(ps[0], N);
  ps[2] = rotatePattern(ps[0], N);
  ps[3] = reflectPattern(ps[2], N);
  ps[4] = rotatePattern(ps[2], N);
  ps[5] = reflectPattern(ps[4], N);
  ps[6] = rotatePattern(ps[4], N);
  ps[7] = reflectPattern(ps[6], N);
  return ps;
}

/** Do p1 and p2 agree on their overlap when p2 is placed at offset (dx, dy)? */
export function agrees(p1, p2, dx, dy, N) {
  const xmin = dx < 0 ? 0 : dx;
  const xmax = dx < 0 ? dx + N : N;
  const ymin = dy < 0 ? 0 : dy;
  const ymax = dy < 0 ? dy + N : N;
  for (let y = ymin; y < ymax; y++) {
    for (let x = xmin; x < xmax; x++) {
      if (p1[x + N * y] !== p2[x - dx + N * (y - dy)]) return false;
    }
  }
  return true;
}

/**
 * Overlapping model: learn every N x N window of a sample image and
 * generate outputs where every N x N window is one of them.
 */
export class OverlappingModel {
  constructor(sample, { N = 3, periodicInput = true, symmetry = 8 } = {}) {
    if (!Number.isInteger(N) || N < 2) throw new RangeError('N must be an integer >= 2');
    if (!Number.isInteger(symmetry) || symmetry < 1 || symmetry > 8) {
      throw new RangeError('symmetry must be an integer in 1..8');
    }
    const { width: SX, height: SY, data } = sample;
    if (!periodicInput && (SX < N || SY < N)) throw new Error('sample is smaller than N');

    this.N = N;
    this.palette = sample.palette;
    this.patterns = [];
    const counts = [];
    const seen = new Map();

    const xmax = periodicInput ? SX : SX - N + 1;
    const ymax = periodicInput ? SY : SY - N + 1;
    for (let y = 0; y < ymax; y++) {
      for (let x = 0; x < xmax; x++) {
        const p = build(N, (dx, dy) => data[((x + dx) % SX) + ((y + dy) % SY) * SX]);
        const variants = symmetries(p, N);
        for (let k = 0; k < symmetry; k++) {
          const key = variants[k].join(',');
          if (seen.has(key)) {
            counts[seen.get(key)]++;
          } else {
            seen.set(key, this.patterns.length);
            this.patterns.push(variants[k]);
            counts.push(1);
          }
        }
      }
    }
    this.weights = counts;
    this.index = seen;

    const T = this.patterns.length;
    this.propagator = [0, 1, 2, 3].map((d) => {
      const lists = new Array(T);
      for (let t1 = 0; t1 < T; t1++) {
        const list = [];
        for (let t2 = 0; t2 < T; t2++) {
          if (agrees(this.patterns[t1], this.patterns[t2], DX[d], DY[d], N)) list.push(t2);
        }
        lists[t1] = Int32Array.from(list);
      }
      return lists;
    });
  }

  static fromText(text, options) {
    return new OverlappingModel(parseSample(text), options);
  }

  /** Wave grid size needed for an output image of width x height pixels. */
  waveSize(width, height, periodic) {
    if (periodic) return [width, height];
    const w = width - this.N + 1;
    const h = height - this.N + 1;
    if (w < 1 || h < 1) throw new RangeError(`output must be at least ${this.N}x${this.N}`);
    return [w, h];
  }

  /**
   * Map a wave node back to output pixels. In a non periodic output the last
   * row/column of nodes also paint the N-1 pixels past them.
   */
  pixelSource(x, y, waveWidth, waveHeight, periodic) {
    if (periodic) return { node: x + y * waveWidth, offset: 0 };
    const cx = Math.min(x, waveWidth - 1);
    const cy = Math.min(y, waveHeight - 1);
    return { node: cx + cy * waveWidth, offset: x - cx + (y - cy) * this.N };
  }

  render(solver) {
    const { width: MX, height: MY, periodic } = solver;
    const width = periodic ? MX : MX + this.N - 1;
    const height = periodic ? MY : MY + this.N - 1;
    const observed = solver.observed();
    const data = new Int32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { node, offset } = this.pixelSource(x, y, MX, MY, periodic);
        const t = observed[node];
        data[x + y * width] = t < 0 ? -1 : this.patterns[t][offset];
      }
    }
    return { width, height, data, palette: this.palette };
  }
}
