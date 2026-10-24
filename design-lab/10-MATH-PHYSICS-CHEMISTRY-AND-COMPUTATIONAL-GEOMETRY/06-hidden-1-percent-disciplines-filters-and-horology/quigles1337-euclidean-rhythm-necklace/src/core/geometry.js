/**
 * Geometry of a rhythm necklace: n points evenly spaced on a circle, clockwise from
 * 12 o'clock (Toussaint's figures), the onsets joined into an inscribed polygon.
 * Canvas coordinates: y grows downward, so increasing angle is clockwise.
 */
export const TAU = Math.PI * 2;

/** Angle of step i of n. Step 0 is straight up; fractional i is fine (used by the playhead). */
export function stepAngle(i, n) {
  return -Math.PI / 2 + (i / n) * TAU;
}

export function pointAt(angle, cx, cy, r) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/** All n step positions on a ring. */
export function ringPoints(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => pointAt(stepAngle(i, n), cx, cy, r));
}

/** Vertices of the inscribed polygon: the onset positions, in step order. */
export function polygonPoints(bits, cx, cy, r) {
  const n = bits.length;
  const out = [];
  bits.forEach((b, i) => {
    if (b) out.push(pointAt(stepAngle(i, n), cx, cy, r));
  });
  return out;
}

/**
 * Radius of ring `index` out of `count` concentric rings inside outer radius R.
 * Rings are spaced evenly, never closer than 17% of R, never inside `inner` * R.
 */
export function ringRadius(index, count, R, { inner = 0.5, maxStep = 0.17 } = {}) {
  if (count <= 1) return R;
  const step = Math.min(maxStep, (1 - inner) / (count - 1));
  return R * (1 - index * step);
}

/** Playhead angle for a bar phase in [0, 1). */
export function playheadAngle(phase) {
  return stepAngle(phase, 1);
}

/** Shoelace area of a polygon given as [{x, y}]. */
export function polygonArea(points) {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/** Dot radius that stays legible as rings shrink and n grows. */
export function dotRadius(n, r) {
  const spacing = (TAU * r) / n;
  return Math.max(2.5, Math.min(7, spacing * 0.22, r * 0.045));
}
