/**
 * Clamps a number to the inclusive range 0-1.
 *
 * @param value - The number to clamp.
 * @returns The clamped value.
 */
export function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
