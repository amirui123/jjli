// Life-like CA on a torus. Rules given as bitmasks over neighbour counts 0..8:
// bit k set in `born` => dead cell with k neighbours is born, likewise `survive`.
export const RULES = {
  life:     { label: 'Life B3/S23',           born: mask([3]),       survive: mask([2, 3]) },
  highlife: { label: 'HighLife B36/S23',      born: mask([3, 6]),    survive: mask([2, 3]) },
  daynight: { label: 'Day & Night B3678/S34678', born: mask([3,6,7,8]), survive: mask([3,4,6,7,8]) },
};

function mask(counts) { return counts.reduce((m, k) => m | (1 << k), 0); }

export function stepLife(src, dst, w, h, born, survive) {
  let changed = 0, pop = 0;
  for (let y = 0; y < h; y++) {
    const ym = (y === 0 ? h - 1 : y - 1) * w, y0 = y * w, yp = (y === h - 1 ? 0 : y + 1) * w;
    for (let x = 0; x < w; x++) {
      const xm = x === 0 ? w - 1 : x - 1, xp = x === w - 1 ? 0 : x + 1;
      const n = src[ym + xm] + src[ym + x] + src[ym + xp]
              + src[y0 + xm]               + src[y0 + xp]
              + src[yp + xm] + src[yp + x] + src[yp + xp];
      const alive = src[y0 + x];
      const next = alive ? (survive >> n) & 1 : (born >> n) & 1;
      dst[y0 + x] = next;
      if (next !== alive) changed++;
      pop += next;
    }
  }
  return { changed, pop };
}

// Glider heading down-right, as [x,y] offsets.
export const GLIDER = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

export function stamp(grid, w, h, cells, ox, oy, flipX = false, flipY = false) {
  for (const [cx, cy] of cells) {
    const x = (((flipX ? -cx : cx) + ox) % w + w) % w;
    const y = (((flipY ? -cy : cy) + oy) % h + h) % h;
    grid[y * w + x] = 1;
  }
}
