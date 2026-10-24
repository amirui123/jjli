// Boids (Reynolds 1987): separation, alignment, cohesion.
// The world is a closed tank, not a torus: a bird steers away once it is within
// `margin` of a wall, and reflects off the glass if it still arrives.
// Threats push the flock around — the pointer and the predators are the same
// kind of thing, so they share one force path. Predators hunt but never catch,
// which is what keeps the population constant.
// `b` and `pred` are flat Float32Arrays [x, y, vx, vy, ...]; a spatial hash
// keeps the flock O(n).
export const DEFAULTS = {
  perception: 60, separation: 22, maxSpeed: 2.4, minSpeed: 1.0,
  wSep: 0.08, wAli: 0.05, wCoh: 0.012, wMouse: 0.35, mouseRadius: 140,
  margin: 90, wEdge: 0.14,
  // A predator turns lazily and is only a little faster than the flock, so it
  // reads as a big fish in the tank rather than a chase sequence.
  predRadius: 110, wPred: 0.5, predSpeed: 2.8, predSight: 320, predTurn: 0.06,
  predSep: 90, wPredSep: 0.05,
  // The pointer moves the predators too, with the same polarity `mood` gives the
  // flock: it scares them off, or it becomes the bait they chase.
  predMouseRadius: 220, wPredMouse: 0.09,
};

const tankMargin = (p, w, h) => Math.max(1, Math.min(p.margin, w / 2, h / 2));

// Proportional turn away from one wall inside `margin`; zero in open water.
function wallTurn(pos, extent, margin, wEdge) {
  if (pos < margin) return wEdge * (1 - pos / margin);
  if (pos > extent - margin) return -wEdge * (1 - (extent - pos) / margin);
  return 0;
}

// Move one entity by its velocity and reflect it off the glass, in place.
function reflectInTank(a, i, w, h) {
  let x = a[i] + a[i + 2], y = a[i + 1] + a[i + 3], vx = a[i + 2], vy = a[i + 3];
  if (x < 0) { x = -x; vx = -vx; } else if (x > w) { x = 2 * w - x; vx = -vx; }
  if (y < 0) { y = -y; vy = -vy; } else if (y > h) { y = 2 * h - y; vy = -vy; }
  a[i] = x < 0 ? 0 : x > w ? w : x;       // a resize can strand one outside; clamp rather than ping-pong
  a[i + 1] = y < 0 ? 0 : y > h ? h : y;
  a[i + 2] = vx; a[i + 3] = vy;
}

// threats: [{ x, y, attract?, radius?, weight? }] — radius/weight default to the
// pointer's, so a bare { x, y } behaves exactly like the old mouse argument.
export function stepBoids(b, n, w, h, p = DEFAULTS, threats = null) {
  const cs = p.perception, gw = Math.max(1, Math.ceil(w / cs)), gh = Math.max(1, Math.ceil(h / cs));
  const cell = (v, g) => Math.min(g - 1, Math.max(0, (v / cs) | 0));
  const head = new Int32Array(gw * gh).fill(-1), next = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const c = cell(b[i * 4 + 1], gh) * gw + cell(b[i * 4], gw);
    next[i] = head[c]; head[c] = i;
  }
  const r2 = cs * cs, s2 = p.separation * p.separation;
  const margin = tankMargin(p, w, h);
  for (let i = 0; i < n; i++) {
    const x = b[i * 4], y = b[i * 4 + 1];
    let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, cnt = 0;
    const gx = cell(x, gw), gy = cell(y, gh);
    for (let oy = -1; oy <= 1; oy++) {
      const cellY = gy + oy; if (cellY < 0 || cellY >= gh) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const cellX = gx + ox; if (cellX < 0 || cellX >= gw) continue;
        for (let j = head[cellY * gw + cellX]; j !== -1; j = next[j]) {
          if (j === i) continue;
          const dx = b[j * 4] - x, dy = b[j * 4 + 1] - y;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2 || d2 === 0) continue;
          cnt++; ax += b[j * 4 + 2]; ay += b[j * 4 + 3]; cx += dx; cy += dy;
          if (d2 < s2) { const f = 1 - Math.sqrt(d2) / p.separation; sx -= dx * f; sy -= dy * f; }
        }
      }
    }
    let vx = b[i * 4 + 2], vy = b[i * 4 + 3];
    if (cnt) {
      vx += (ax / cnt - vx) * p.wAli + (cx / cnt) * p.wCoh;
      vy += (ay / cnt - vy) * p.wAli + (cy / cnt) * p.wCoh;
    }
    vx += sx * p.wSep; vy += sy * p.wSep;
    if (threats) for (let t = 0; t < threats.length; t++) {
      const th = threats[t];
      const radius = th.radius ?? p.mouseRadius, weight = th.weight ?? p.wMouse;
      const dx = x - th.x, dy = y - th.y, d = Math.hypot(dx, dy);
      if (d < radius && d > 0) { const f = (1 - d / radius) * weight * (th.attract ? -1 : 1); vx += dx / d * f; vy += dy / d * f; }
    }
    vx += wallTurn(x, w, margin, p.wEdge);
    vy += wallTurn(y, h, margin, p.wEdge);
    const sp = Math.hypot(vx, vy) || 1e-6;
    const cl = Math.min(p.maxSpeed, Math.max(p.minSpeed, sp)) / sp;
    b[i * 4 + 2] = vx * cl; b[i * 4 + 3] = vy * cl;
  }
  for (let i = 0; i < n; i++) reflectInTank(b, i * 4, w, h);
}

// Each predator turns toward the nearest bird it can see, and answers the
// pointer with whatever polarity the flock is using. Brute force over the flock:
// at two predators that cost is noise next to the flock's own work, and it keeps
// the hash out of here.
export function stepPredators(pred, np, b, n, w, h, p = DEFAULTS, pointer = null) {
  const margin = tankMargin(p, w, h);
  const sight2 = p.predSight * p.predSight, sep2 = p.predSep * p.predSep;
  for (let i = 0; i < np; i++) {
    const x = pred[i * 4], y = pred[i * 4 + 1];
    let vx = pred[i * 4 + 2], vy = pred[i * 4 + 3];
    let best = sight2, tx = 0, ty = 0, found = false;
    for (let j = 0; j < n; j++) {
      const dx = b[j * 4] - x, dy = b[j * 4 + 1] - y, d2 = dx * dx + dy * dy;
      if (d2 < best && d2 > 0) { best = d2; tx = dx; ty = dy; found = true; }
    }
    if (found) { const d = Math.sqrt(best); vx += tx / d * p.predTurn; vy += ty / d * p.predTurn; }
    for (let k = 0; k < np; k++) { // without this the two lock onto one bird and overlap into a single shape
      if (k === i) continue;
      const dx = x - pred[k * 4], dy = y - pred[k * 4 + 1], d2 = dx * dx + dy * dy;
      if (d2 < sep2 && d2 > 0) { const d = Math.sqrt(d2), f = (1 - d / p.predSep) * p.wPredSep; vx += dx / d * f; vy += dy / d * f; }
    }
    if (pointer) { // same sign convention as the flock's threats: attract pulls, otherwise it pushes
      const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
      if (d < p.predMouseRadius && d > 0) {
        const f = (1 - d / p.predMouseRadius) * p.wPredMouse * (pointer.attract ? -1 : 1);
        vx += dx / d * f; vy += dy / d * f;
      }
    }
    vx += wallTurn(x, w, margin, p.wEdge);
    vy += wallTurn(y, h, margin, p.wEdge);
    const sp = Math.hypot(vx, vy) || 1e-6;
    const cl = Math.min(p.predSpeed, Math.max(p.minSpeed, sp)) / sp;
    pred[i * 4 + 2] = vx * cl; pred[i * 4 + 3] = vy * cl;
  }
  for (let i = 0; i < np; i++) reflectInTank(pred, i * 4, w, h);
}
