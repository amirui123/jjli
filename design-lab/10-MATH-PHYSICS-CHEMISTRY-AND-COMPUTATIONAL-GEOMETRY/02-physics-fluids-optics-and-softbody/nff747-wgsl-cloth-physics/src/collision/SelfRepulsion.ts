export class SelfRepulsion {
  static resolvePair(
    p1: [number, number, number],
    p2: [number, number, number],
    minDist = 0.02,
    stiffness = 0.5
  ): { delta1: [number, number, number]; delta2: [number, number, number] } | null {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    const dz = p1[2] - p2[2];
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < minDist * minDist && distSq > 1e-8) {
      const dist = Math.sqrt(distSq);
      const overlap = (minDist - dist) * 0.5 * stiffness;
      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;
      return {
        delta1: [nx * overlap, ny * overlap, nz * overlap],
        delta2: [-nx * overlap, -ny * overlap, -nz * overlap],
      };
    }
    return null;
  }
}
