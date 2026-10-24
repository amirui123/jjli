/**
 * marching-squares-contours
 *
 * Isoline extraction from a 2D scalar field using the marching squares
 * algorithm, with:
 *   - linear interpolation of crossing points along cell edges
 *   - saddle disambiguation using the bilinear cell-centre value
 *   - O(n) stitching of per-cell segments into polylines / closed rings
 *   - consistent orientation (values >= level always lie on the left
 *     side of the direction of travel, in a y-down coordinate system)
 *   - NaN-aware: cells touching missing data are skipped
 *
 * Grid convention: grid[y][x], x grows to the right, y grows downward.
 * Output points are in grid coordinates (x in [0, width-1], y in [0, height-1]).
 */

// Edge identifiers inside a single cell.
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;

// Segment table for the 14 unambiguous cases. Bits: tl=8, tr=4, br=2, bl=1,
// a bit is set when that corner is >= level. Saddles (5, 10) are resolved
// at runtime.
const SEGMENTS = {
  0: [],
  1: [[LEFT, BOTTOM]],
  2: [[BOTTOM, RIGHT]],
  3: [[LEFT, RIGHT]],
  4: [[TOP, RIGHT]],
  6: [[TOP, BOTTOM]],
  7: [[TOP, LEFT]],
  8: [[TOP, LEFT]],
  9: [[TOP, BOTTOM]],
  11: [[TOP, RIGHT]],
  12: [[LEFT, RIGHT]],
  13: [[BOTTOM, RIGHT]],
  14: [[LEFT, BOTTOM]],
  15: [],
};

/**
 * Validate a grid and return its dimensions.
 * @param {number[][]} grid
 */
export function gridSize(grid) {
  if (!Array.isArray(grid) || grid.length < 2) {
    throw new TypeError('grid must be an array of at least 2 rows');
  }
  const width = grid[0] && grid[0].length;
  if (!width || width < 2) {
    throw new TypeError('grid rows must contain at least 2 values');
  }
  for (let y = 0; y < grid.length; y++) {
    if (!grid[y] || grid[y].length !== width) {
      throw new TypeError(`grid row ${y} has length ${grid[y] && grid[y].length}, expected ${width}`);
    }
  }
  return { width, height: grid.length };
}

/**
 * Bilinear sample of the grid at a fractional coordinate. Coordinates are
 * clamped to the grid bounds.
 */
export function sample(grid, x, y) {
  const { width, height } = gridSize(grid);
  const cx = Math.min(Math.max(x, 0), width - 1);
  const cy = Math.min(Math.max(y, 0), height - 1);
  const x0 = Math.min(Math.floor(cx), width - 2);
  const y0 = Math.min(Math.floor(cy), height - 2);
  const fx = cx - x0;
  const fy = cy - y0;
  const a = grid[y0][x0];
  const b = grid[y0][x0 + 1];
  const c = grid[y0 + 1][x0];
  const d = grid[y0 + 1][x0 + 1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}

function interp(a, b, level) {
  // a and b straddle level (one is < level, the other >= level).
  if (a === b) return 0.5;
  const t = (level - a) / (b - a);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Extract all isolines at a single level.
 *
 * @param {number[][]} grid  scalar field, grid[y][x]
 * @param {number} level     iso value
 * @param {object} [opts]
 * @param {boolean} [opts.orient=true] orient contours so that values >= level lie on the left
 * @returns {{level:number, points:[number,number][], closed:boolean}[]}
 */
export function isolines(grid, level, opts = {}) {
  const { orient = true } = opts;
  const { width, height } = gridSize(grid);
  if (!Number.isFinite(level)) throw new TypeError('level must be a finite number');

  // Crossing points are shared between neighbouring cells, so they are keyed
  // by the grid edge they sit on rather than by cell. Horizontal edge (x,y)
  // joins (x,y)-(x+1,y); vertical edge (x,y) joins (x,y)-(x,y+1).
  const hKey = (x, y) => 2 * (y * width + x);
  const vKey = (x, y) => 2 * (y * width + x) + 1;
  const coords = new Map(); // key -> [x, y]
  const adj = new Map(); // key -> key[] (degree <= 2)

  const point = (key, px, py) => {
    if (!coords.has(key)) coords.set(key, [px, py]);
    return key;
  };
  const link = (a, b) => {
    if (a === b) return;
    let la = adj.get(a);
    if (!la) adj.set(a, (la = []));
    let lb = adj.get(b);
    if (!lb) adj.set(b, (lb = []));
    la.push(b);
    lb.push(a);
  };

  for (let y = 0; y < height - 1; y++) {
    const row = grid[y];
    const next = grid[y + 1];
    for (let x = 0; x < width - 1; x++) {
      const tl = row[x];
      const tr = row[x + 1];
      const br = next[x + 1];
      const bl = next[x];
      if (Number.isNaN(tl) || Number.isNaN(tr) || Number.isNaN(br) || Number.isNaN(bl)) continue;

      const idx = (tl >= level ? 8 : 0) | (tr >= level ? 4 : 0) | (br >= level ? 2 : 0) | (bl >= level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      let segs;
      if (idx === 5 || idx === 10) {
        const centre = (tl + tr + br + bl) / 4;
        const centreHigh = centre >= level;
        if (idx === 5) {
          // tr and bl are high.
          segs = centreHigh ? [[LEFT, TOP], [RIGHT, BOTTOM]] : [[TOP, RIGHT], [LEFT, BOTTOM]];
        } else {
          // tl and br are high.
          segs = centreHigh ? [[TOP, RIGHT], [BOTTOM, LEFT]] : [[TOP, LEFT], [RIGHT, BOTTOM]];
        }
      } else {
        segs = SEGMENTS[idx];
      }

      const edgePoint = (edge) => {
        switch (edge) {
          case TOP:
            return point(hKey(x, y), x + interp(tl, tr, level), y);
          case BOTTOM:
            return point(hKey(x, y + 1), x + interp(bl, br, level), y + 1);
          case LEFT:
            return point(vKey(x, y), x, y + interp(tl, bl, level));
          default:
            return point(vKey(x + 1, y), x + 1, y + interp(tr, br, level));
        }
      };

      for (const [e1, e2] of segs) link(edgePoint(e1), edgePoint(e2));
    }
  }

  const contours = stitch(adj, coords).map(({ keys, closed }) => ({
    level,
    points: dedupe(keys.map((k) => coords.get(k)), closed),
    closed,
  }));

  if (orient) {
    for (const c of contours) orientContour(grid, c, level);
  }
  return contours.filter((c) => c.points.length >= (c.closed ? 3 : 2));
}

/**
 * Walk the adjacency graph (every node has degree 1 or 2) and emit chains.
 * Open chains start at degree-1 nodes (the grid border or a NaN hole);
 * whatever remains afterwards are closed loops.
 */
function stitch(adj, coords) {
  const visited = new Set();
  const out = [];

  const walk = (start) => {
    const keys = [start];
    visited.add(start);
    let prev = -1;
    let cur = start;
    for (;;) {
      const nbrs = adj.get(cur);
      let nxt = -1;
      for (const n of nbrs) {
        if (n !== prev && !visited.has(n)) {
          nxt = n;
          break;
        }
      }
      if (nxt === -1) break;
      visited.add(nxt);
      keys.push(nxt);
      prev = cur;
      cur = nxt;
    }
    return keys;
  };

  for (const [key, nbrs] of adj) {
    if (nbrs.length === 1 && !visited.has(key)) {
      out.push({ keys: walk(key), closed: false });
    }
  }
  for (const key of adj.keys()) {
    if (!visited.has(key)) {
      const keys = walk(key);
      const last = keys[keys.length - 1];
      const closed = keys.length > 2 && adj.get(last).includes(key);
      out.push({ keys, closed });
    }
  }
  return out;
}

function dedupe(points, closed) {
  const out = [];
  for (const p of points) {
    const q = out[out.length - 1];
    if (!q || q[0] !== p[0] || q[1] !== p[1]) out.push(p);
  }
  if (closed && out.length > 1) {
    const a = out[0];
    const b = out[out.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) out.pop();
  }
  return out;
}

/**
 * Reverse a contour if needed so that values >= level lie on its left
 * (with y pointing down, "left" of direction (dx,dy) is (dy,-dx)).
 * We vote over every segment to be robust to degenerate spots.
 */
function orientContour(grid, contour, level) {
  const pts = contour.points;
  const n = pts.length;
  if (n < 2) return;
  const segCount = contour.closed ? n : n - 1;
  let vote = 0;
  for (let i = 0; i < segCount; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const eps = Math.min(0.25, len);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const lx = mx + (dy / len) * eps;
    const ly = my - (dx / len) * eps;
    const rx = mx - (dy / len) * eps;
    const ry = my + (dx / len) * eps;
    const left = sample(grid, lx, ly);
    const right = sample(grid, rx, ry);
    if (Number.isNaN(left) || Number.isNaN(right)) continue;
    vote += Math.sign(left - right);
  }
  if (vote < 0) pts.reverse();
}

/**
 * Extract isolines for several levels at once.
 * @param {number[][]} grid
 * @param {number[]} levels
 */
export function contours(grid, levels, opts) {
  return levels.flatMap((lvl) => isolines(grid, lvl, opts));
}

/**
 * Produce `count` evenly spaced levels strictly inside [min, max] of the grid
 * (ignoring NaNs), e.g. count=3 over [0,4] gives [1,2,3].
 */
export function thresholds(grid, count) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be a positive integer');
  let min = Infinity;
  let max = -Infinity;
  for (const row of grid) {
    for (const v of row) {
      if (Number.isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!(max > min)) return [];
  const step = (max - min) / (count + 1);
  return Array.from({ length: count }, (_, i) => min + step * (i + 1));
}

/**
 * Build a grid by sampling f(x, y) over a rectangle.
 * @param {(x:number,y:number)=>number} f
 * @param {number} width   number of samples along x (>= 2)
 * @param {number} height  number of samples along y (>= 2)
 * @param {{x0?:number,x1?:number,y0?:number,y1?:number}} [bounds]
 */
export function sampleField(f, width, height, bounds = {}) {
  const { x0 = 0, x1 = width - 1, y0 = 0, y1 = height - 1 } = bounds;
  const grid = [];
  for (let j = 0; j < height; j++) {
    const y = y0 + ((y1 - y0) * j) / (height - 1);
    const row = new Array(width);
    for (let i = 0; i < width; i++) {
      row[i] = f(x0 + ((x1 - x0) * i) / (width - 1), y);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Signed shoelace area of a closed ring. In a y-down coordinate system a
 * positive value means the ring runs clockwise on screen.
 */
export function signedArea(points) {
  let a = 0;
  for (let i = 0, n = points.length; i < n; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % n];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

/** Total length of a polyline (closing edge included if closed). */
export function contourLength(points, closed = false) {
  let len = 0;
  const n = points.length;
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % n];
    len += Math.hypot(x2 - x1, y2 - y1);
  }
  return len;
}

/**
 * Ramer-Douglas-Peucker polyline simplification (iterative, no recursion
 * limit issues on long contours). For closed rings the ring is split at the
 * point farthest from the start so both halves simplify cleanly.
 */
export function simplify(points, tolerance, closed = false) {
  if (!(tolerance > 0) || points.length <= 2) return points.slice();
  if (closed) {
    if (points.length <= 3) return points.slice();
    let far = 0;
    let best = -1;
    const [sx, sy] = points[0];
    for (let i = 1; i < points.length; i++) {
      const d = (points[i][0] - sx) ** 2 + (points[i][1] - sy) ** 2;
      if (d > best) {
        best = d;
        far = i;
      }
    }
    const a = rdp(points.slice(0, far + 1), tolerance);
    const b = rdp(points.slice(far).concat([points[0]]), tolerance);
    return a.concat(b.slice(1, -1));
  }
  return rdp(points, tolerance);
}

function rdp(points, tol) {
  const n = points.length;
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  const tol2 = tol * tol;
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = -1;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = segDist2(points[i], points[s], points[e]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (idx !== -1 && maxD > tol2) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function segDist2([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return qx * qx + qy * qy;
}

/**
 * Convert a contour to an SVG path "d" string.
 * @param {{points:[number,number][], closed:boolean}} contour
 * @param {{scale?:number, precision?:number}} [opts]
 */
export function toSvgPath(contour, opts = {}) {
  const { scale = 1, precision = 3 } = opts;
  const f = (v) => +(v * scale).toFixed(precision);
  const pts = contour.points;
  if (!pts.length) return '';
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${f(pts[i][0])},${f(pts[i][1])}`;
  if (contour.closed) d += 'Z';
  return d;
}
