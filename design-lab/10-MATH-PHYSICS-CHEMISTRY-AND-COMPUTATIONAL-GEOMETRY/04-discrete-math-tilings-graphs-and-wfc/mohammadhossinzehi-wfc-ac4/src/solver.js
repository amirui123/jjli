import { DX, DY, OPPOSITE } from './directions.js';
import { mulberry32 } from './rng.js';

/**
 * Model agnostic Wave Function Collapse solver.
 *
 * A model supplies:
 *   weights[t]          relative frequency of pattern t (must be > 0)
 *   propagator[d][t]    Int32Array of patterns allowed at offset d from t
 *
 * The propagator must be symmetric: t2 in propagator[d][t1] exactly when
 * t1 in propagator[OPPOSITE[d]][t2]. Both bundled models guarantee this.
 *
 * Propagation uses support counting (the AC4 arc consistency idea used by the reference
 * implementation): compatible[cell][t][d] counts how many patterns still
 * possible at the neighbour in direction OPPOSITE[d] support t. When that
 * count drops to zero, t is banned. Each ban costs O(sum of supports)
 * instead of rescanning whole domains.
 *
 * On top of that, every mutation is written to an undo trail, so the solver
 * can backtrack out of contradictions instead of throwing away the whole run.
 */
export class Solver {
  constructor(model, { width, height, periodic = false, seed = 1, maxBacktracks = 1000 } = {}) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      throw new RangeError(`invalid grid size ${width}x${height}`);
    }
    const T = model.weights.length;
    if (T === 0) throw new Error('model has no patterns');
    if (!model.propagator || model.propagator.length !== 4) {
      throw new Error('model.propagator must have 4 directions');
    }
    for (const w of model.weights) {
      if (!(w > 0)) throw new RangeError('all pattern weights must be positive');
    }

    this.T = T;
    this.width = width;
    this.height = height;
    this.periodic = periodic;
    this.cells = width * height;
    this.propagator = model.propagator;
    this.maxBacktracks = maxBacktracks;
    this.seed = seed;

    this.weights = Float64Array.from(model.weights);
    this.weightLogWeights = this.weights.map((w) => w * Math.log(w));
    let sw = 0;
    let swl = 0;
    for (let t = 0; t < T; t++) {
      sw += this.weights[t];
      swl += this.weightLogWeights[t];
    }
    this.sumOfWeights = sw;
    this.sumOfWeightLogWeights = swl;
    this.startingEntropy = T > 1 ? Math.log(sw) - swl / sw : 0;

    this.wave = new Uint8Array(this.cells * T);
    this.compatible = new Int32Array(this.cells * T * 4);
    this.sumsOfOnes = new Int32Array(this.cells);
    this.sumsOfWeights = new Float64Array(this.cells);
    this.sumsOfWeightLogWeights = new Float64Array(this.cells);
    this.entropies = new Float64Array(this.cells);

    this.clear();
  }

  /** Reset to the fully superposed state (every pattern possible everywhere). */
  clear() {
    const { T, cells } = this;
    this.rng = mulberry32(this.seed);
    this.wave.fill(1);
    for (let t = 0; t < T; t++) {
      for (let d = 0; d < 4; d++) {
        const n = this.propagator[OPPOSITE[d]][t].length;
        for (let i = 0; i < cells; i++) this.compatible[(i * T + t) * 4 + d] = n;
      }
    }
    this.sumsOfOnes.fill(T);
    this.sumsOfWeights.fill(this.sumOfWeights);
    this.sumsOfWeightLogWeights.fill(this.sumOfWeightLogWeights);
    this.entropies.fill(this.startingEntropy);

    this.stack = [];
    this.trail = [];
    this.frames = [];
    this.contradiction = false;
    this.status = 'running';
    this.stats = { observations: 0, bans: 0, backtracks: 0 };

    // A pattern with zero support from a direction that actually has a
    // neighbour can never appear there. The reference implementation only
    // discovers this lazily; banning up front avoids wasted observations.
    for (let i = 0; i < cells; i++) {
      const x = i % this.width;
      const y = (i / this.width) | 0;
      for (let d = 0; d < 4; d++) {
        if (!this._hasNeighbour(x - DX[d], y - DY[d])) continue;
        for (let t = 0; t < T; t++) {
          if (this.wave[i * T + t] && this.compatible[(i * T + t) * 4 + d] === 0) this._ban(i, t);
        }
      }
    }
    if (!this._propagate()) this.status = 'contradiction';
    this.baseTrailLength = this.trail.length;
  }

  _hasNeighbour(x, y) {
    return this.periodic || (x >= 0 && y >= 0 && x < this.width && y < this.height);
  }

  _entropy(i) {
    if (this.sumsOfOnes[i] <= 1) return 0;
    const s = this.sumsOfWeights[i];
    return Math.log(s) - this.sumsOfWeightLogWeights[i] / s;
  }

  _ban(i, t) {
    const w = i * this.T + t;
    this.wave[w] = 0;
    this.trail.push(-w - 1);
    this.stack.push(w);
    this.sumsOfOnes[i]--;
    this.sumsOfWeights[i] -= this.weights[t];
    this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[t];
    this.entropies[i] = this._entropy(i);
    if (this.sumsOfOnes[i] === 0) this.contradiction = true;
    this.stats.bans++;
  }

  _propagate() {
    const { T, width: W, height: H, periodic, wave, compatible, trail, stack } = this;
    while (stack.length > 0) {
      if (this.contradiction) break;
      const e = stack.pop();
      const i1 = (e / T) | 0;
      const t1 = e - i1 * T;
      const x1 = i1 % W;
      const y1 = (i1 / W) | 0;
      for (let d = 0; d < 4; d++) {
        let x2 = x1 + DX[d];
        let y2 = y1 + DY[d];
        if (!periodic && (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H)) continue;
        x2 = (x2 + W) % W;
        y2 = (y2 + H) % H;
        const i2 = x2 + y2 * W;
        const p = this.propagator[d][t1];
        for (let k = 0; k < p.length; k++) {
          const t2 = p[k];
          const w = i2 * T + t2;
          if (!wave[w]) continue; // already gone; its counters no longer matter
          const ci = w * 4 + d;
          compatible[ci]--;
          trail.push(ci);
          if (compatible[ci] === 0) this._ban(i2, t2);
        }
      }
    }
    if (this.contradiction) {
      stack.length = 0;
      return false;
    }
    return true;
  }

  /** Roll the trail back to `length`, restoring wave, counters and entropies. */
  _undoTo(length) {
    const { T, trail, wave, compatible } = this;
    while (trail.length > length) {
      const e = trail.pop();
      if (e >= 0) {
        compatible[e]++;
      } else {
        const w = -e - 1;
        const i = (w / T) | 0;
        const t = w - i * T;
        wave[w] = 1;
        this.sumsOfOnes[i]++;
        this.sumsOfWeights[i] += this.weights[t];
        this.sumsOfWeightLogWeights[i] += this.weightLogWeights[t];
        this.entropies[i] = this._entropy(i);
      }
    }
    this.stack.length = 0;
    this.contradiction = false;
  }

  /** Lowest entropy undecided cell, ties broken by a tiny seeded jitter. -1 if all decided. */
  _pickCell() {
    let min = Infinity;
    let arg = -1;
    for (let i = 0; i < this.cells; i++) {
      if (this.sumsOfOnes[i] <= 1) continue;
      const e = this.entropies[i] + 1e-6 * this.rng();
      if (e < min) {
        min = e;
        arg = i;
      }
    }
    return arg;
  }

  _pickPattern(i) {
    const { T, wave, weights } = this;
    const base = i * T;
    let total = 0;
    for (let t = 0; t < T; t++) if (wave[base + t]) total += weights[t];
    let r = this.rng() * total;
    let last = -1;
    for (let t = 0; t < T; t++) {
      if (!wave[base + t]) continue;
      last = t;
      r -= weights[t];
      if (r <= 0) return t;
    }
    return last;
  }

  /**
   * One observe + propagate cycle. Returns 'running', 'done' or 'contradiction'.
   * Useful for animation; run() just calls this in a loop.
   */
  step() {
    if (this.status !== 'running') return this.status;
    const i = this._pickCell();
    if (i < 0) {
      this.status = 'done';
      return this.status;
    }
    const chosen = this._pickPattern(i);
    this.frames.push({ trailLength: this.trail.length, cell: i, pattern: chosen });
    this.stats.observations++;
    const base = i * this.T;
    for (let t = 0; t < this.T; t++) {
      if (t !== chosen && this.wave[base + t]) this._ban(i, t);
    }
    if (this._propagate()) return this.status;
    return this._backtrack();
  }

  /**
   * Undo the most recent decision and forbid the choice that led to the
   * contradiction. If that also fails, keep unwinding. Running out of frames
   * means the constraints are unsatisfiable from the initial state.
   */
  _backtrack() {
    for (;;) {
      const frame = this.frames.pop();
      if (!frame || this.stats.backtracks >= this.maxBacktracks) {
        this.status = 'contradiction';
        return this.status;
      }
      this.stats.backtracks++;
      this._undoTo(frame.trailLength);
      this._ban(frame.cell, frame.pattern);
      if (this._propagate()) return this.status;
    }
  }

  run(maxSteps = Infinity) {
    let steps = 0;
    while (this.status === 'running' && steps++ < maxSteps) this.step();
    return this.status;
  }

  /** Patterns still possible at cell i. */
  possibilities(i) {
    const out = [];
    const base = i * this.T;
    for (let t = 0; t < this.T; t++) if (this.wave[base + t]) out.push(t);
    return out;
  }

  /** Int32Array of the chosen pattern per cell, or -1 where undecided. */
  observed() {
    const out = new Int32Array(this.cells).fill(-1);
    for (let i = 0; i < this.cells; i++) {
      if (this.sumsOfOnes[i] !== 1) continue;
      const base = i * this.T;
      for (let t = 0; t < this.T; t++) {
        if (this.wave[base + t]) {
          out[i] = t;
          break;
        }
      }
    }
    return out;
  }
}
