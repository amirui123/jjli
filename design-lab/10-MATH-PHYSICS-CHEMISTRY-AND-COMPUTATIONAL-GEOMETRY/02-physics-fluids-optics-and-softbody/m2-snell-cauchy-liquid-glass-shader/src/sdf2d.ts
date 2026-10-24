// sdf2d.ts — the mathematical twin of the sdRoundedBox / glassHeight / glassNormal
// functions inside glass.frag.glsl. Signatures and parameter order are identical.
// If they drift, the CSS displacement map produces a different shape than the shader.

import type { Vec3 } from "./optics";

export type Vec2 = readonly [number, number];
export type { Vec3 };

/** p: coordinate relative to the panel center, b: half size, r: corner radius. */
export function sdRoundedBox(p: Vec2, b: Vec2, r: number): number {
  const qx = Math.abs(p[0]) - b[0] + r;
  const qy = Math.abs(p[1]) - b[1] + r;
  const inner = Math.min(Math.max(qx, qy), 0);
  const outer = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return inner + outer - r;
}

/**
 * d: signed distance to the edge (negative inside), w: bevel width.
 * Returns 0 at the edge and 1 where the bevel ends.
 */
export function glassHeight(d: number, w: number): number {
  const x = Math.min(Math.max(-d / Math.max(w, 1e-3), 0), 1);
  const t = 1 - x;
  return Math.sqrt(Math.max(1 - t * t, 0));
}

export function glassNormal(
  p: Vec2,
  halfSize: Vec2,
  radius: number,
  bevel: number,
  thickness: number,
  eps: number,
): Vec3 {
  const hx =
    glassHeight(sdRoundedBox([p[0] + eps, p[1]], halfSize, radius), bevel) -
    glassHeight(sdRoundedBox([p[0] - eps, p[1]], halfSize, radius), bevel);
  const hy =
    glassHeight(sdRoundedBox([p[0], p[1] + eps], halfSize, radius), bevel) -
    glassHeight(sdRoundedBox([p[0], p[1] - eps], halfSize, radius), bevel);

  const k = thickness / (2 * eps);
  const x = -hx * k;
  const y = -hy * k;
  const len = Math.hypot(x, y, 1);
  return [x / len, y / len, 1 / len];
}
