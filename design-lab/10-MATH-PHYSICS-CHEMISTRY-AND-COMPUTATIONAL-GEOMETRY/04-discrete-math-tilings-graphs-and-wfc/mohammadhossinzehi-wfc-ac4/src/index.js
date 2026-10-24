import { Solver } from './solver.js';

export { Solver } from './solver.js';
export { OverlappingModel, parseSample } from './overlapping.js';
export { TiledModel } from './tiled.js';
export { mulberry32 } from './rng.js';

/** Render an image from model.render() as text, using '?' for undecided pixels. */
export function toText(image) {
  const rows = [];
  for (let y = 0; y < image.height; y++) {
    let row = '';
    for (let x = 0; x < image.width; x++) {
      const c = image.data[x + y * image.width];
      row += c < 0 ? '?' : image.palette[c];
    }
    rows.push(row);
  }
  return rows.join('\n');
}

/**
 * Convenience wrapper: build a solver for the requested output size, run it,
 * and restart with a derived seed if backtracking gives up.
 */
export function generate(model, { width, height, periodic = false, seed = 1, attempts = 10, maxBacktracks = 1000 } = {}) {
  const [mx, my] = model.waveSize(width, height, periodic);
  const totals = { observations: 0, bans: 0, backtracks: 0 };
  for (let a = 0; a < attempts; a++) {
    const solver = new Solver(model, {
      width: mx,
      height: my,
      periodic,
      seed: (seed + a * 0x9e3779b1) >>> 0,
      maxBacktracks,
    });
    const status = solver.run();
    for (const k of Object.keys(totals)) totals[k] += solver.stats[k];
    if (status === 'done') {
      return { image: model.render(solver), solver, attempts: a + 1, stats: totals };
    }
  }
  throw new Error(`no solution after ${attempts} attempts`);
}
