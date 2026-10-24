// Cyclic cellular automaton (Griffeath 1988; Fisch–Gravner–Griffeath 1991).
// k colour states on a torus. A cell in state s advances to (s+1)%k when at
// least `threshold` cells in its neighbourhood already hold (s+1)%k.
// Neighbourhood is given as a flat Int32Array of [dx, dy] pairs (see offsets()).
// Noise -> debris -> droplets -> spirals, depending on (range, threshold, k).

export function offsets(range = 1, shape = 'moore') {
  const out = [];
  for (let dy = -range; dy <= range; dy++) for (let dx = -range; dx <= range; dx++) {
    if (dx === 0 && dy === 0) continue;
    if (shape === 'neumann' && Math.abs(dx) + Math.abs(dy) > range) continue;
    out.push(dx, dy);
  }
  return Int32Array.from(out);
}

const MOORE1 = offsets(1, 'moore');

// Presets follow the MCell naming: range / threshold / colours / neighbourhood.
export const PRESETS = {
  cca:       { label: 'CCA 1/1/14/N',      k: 14, threshold: 1, off: offsets(1, 'neumann') },
  spirals:   { label: 'Spirals 3/5/8/M',   k: 8,  threshold: 5, off: offsets(3, 'moore') },
  turbulent: { label: 'Turbulent 2/5/8/M', k: 8,  threshold: 5, off: offsets(2, 'moore') },
  r313:      { label: '313 1/3/3/M',       k: 3,  threshold: 3, off: MOORE1 },
};

export function stepCyclic(src, dst, w, h, k, threshold = 1, off = MOORE1) {
  let changed = 0;
  const m = off.length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x, s = src[i];
      const t = s + 1 === k ? 0 : s + 1;
      let c = 0;
      for (let j = 0; j < m; j += 2) {
        let nx = x + off[j], ny = y + off[j + 1];
        if (nx < 0) nx += w; else if (nx >= w) nx -= w;
        if (ny < 0) ny += h; else if (ny >= h) ny -= h;
        if (src[ny * w + nx] === t && ++c >= threshold) break;
      }
      const next = c >= threshold ? t : s;
      dst[i] = next;
      if (next !== s) changed++;
    }
  }
  return changed;
}
