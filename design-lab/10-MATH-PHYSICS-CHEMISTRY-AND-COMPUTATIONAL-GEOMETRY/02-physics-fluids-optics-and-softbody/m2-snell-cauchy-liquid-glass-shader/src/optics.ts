// optics.ts — the TypeScript twin of the refraction math on the GLSL side.
// Pure: no WebGL, no DOM, no timers. Every test runs through here.

export type Vec3 = readonly [number, number, number];

/**
 * Behaves exactly like GLSL refract(I, N, eta).
 * I: incident unit vector, N: unit normal, eta: n1 / n2.
 * Returns the zero vector on total internal reflection.
 */
export function refract(i: Vec3, n: Vec3, eta: number): Vec3 {
  const ni = i[0] * n[0] + i[1] * n[1] + i[2] * n[2];
  const k = 1 - eta * eta * (1 - ni * ni);
  if (k < 0) return [0, 0, 0];
  const s = eta * ni + Math.sqrt(k);
  return [eta * i[0] - s * n[0], eta * i[1] - s * n[1], eta * i[2] - s * n[2]];
}

export function refractOffsetPx(
  n: Vec3,
  eta: number,
  depthPx: number,
): readonly [number, number] {
  const r = refract([0, 0, -1], n, eta);
  if (r[0] === 0 && r[1] === 0 && r[2] === 0) return [0, 0];
  const rz = Math.max(Math.abs(r[2]), 1e-3);
  return [(r[0] * depthPx) / rz, (r[1] * depthPx) / rz];
}

export const IOR = {
  air: 1.0,
  water: 1.333,
  acrylic: 1.49,
  crownGlass: 1.52,
  sapphire: 1.77,
  diamond: 2.417,
} as const;

export function iorToEta(from: number, to: number): number {
  return from / to;
}

/**
 * Abbe number: V = (n_d - 1) / (n_F - n_C).
 * The return value is the index difference between blue (486 nm) and red (656 nm).
 */
export function abbeSpread(nd: number, abbe: number): number {
  return (nd - 1) / abbe;
}

/** t: 0 = red end, 1 = blue end. A linear sweep between the two ends. */
export function dispersedIor(nd: number, spread: number, t: number): number {
  return nd + spread * (t - 0.5);
}

/** Reflectance at normal incidence: ((n1 - n2) / (n1 + n2))². */
export function schlickF0(n1: number, n2: number): number {
  const r = (n1 - n2) / (n1 + n2);
  return r * r;
}

export function fresnelSchlick(cosTheta: number, f0: number): number {
  const c = Math.min(Math.max(1 - cosTheta, 0), 1);
  return f0 + (1 - f0) * c ** 5;
}
