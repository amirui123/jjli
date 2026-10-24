import type { CapsuleCollider, CollisionContact } from './types';

export class CapsuleResolver {
  static resolve(
    pos: [number, number, number],
    particleIndex: number,
    capsule: CapsuleCollider
  ): CollisionContact | null {
    // Segment vector d = p2 - p1
    const d = [
      capsule.p2[0] - capsule.p1[0],
      capsule.p2[1] - capsule.p1[1],
      capsule.p2[2] - capsule.p1[2],
    ];
    const lenSq = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
    if (lenSq < 1e-6) return null;

    // Vector v = pos - p1
    const v = [
      pos[0] - capsule.p1[0],
      pos[1] - capsule.p1[1],
      pos[2] - capsule.p1[2],
    ];

    // Project onto segment clamped [0, 1]
    const t = Math.max(0, Math.min(1, (v[0] * d[0] + v[1] * d[1] + v[2] * d[2]) / lenSq));
    const closest = [
      capsule.p1[0] + t * d[0],
      capsule.p1[1] + t * d[1],
      capsule.p1[2] + t * d[2],
    ];

    const diff = [pos[0] - closest[0], pos[1] - closest[1], pos[2] - closest[2]];
    const dist = Math.hypot(diff[0], diff[1], diff[2]);

    if (dist < capsule.radius) {
      const normal: [number, number, number] = dist > 1e-6
        ? [diff[0] / dist, diff[1] / dist, diff[2] / dist]
        : [0, 1, 0];
      return {
        particleIndex,
        normal,
        penetrationDepth: capsule.radius - dist,
      };
    }

    return null;
  }
}
