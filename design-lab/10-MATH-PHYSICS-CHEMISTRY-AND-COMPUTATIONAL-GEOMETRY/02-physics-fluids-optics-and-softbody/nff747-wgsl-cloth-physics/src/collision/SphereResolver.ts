import type { SphereCollider, CollisionContact } from './types';

export class SphereResolver {
  static resolve(pos: [number, number, number], particleIndex: number, sphere: SphereCollider): CollisionContact | null {
    const diff = [
      pos[0] - sphere.center[0],
      pos[1] - sphere.center[1],
      pos[2] - sphere.center[2],
    ];
    const dist = Math.hypot(diff[0], diff[1], diff[2]);

    if (dist < sphere.radius) {
      const normal: [number, number, number] = dist > 1e-6
        ? [diff[0] / dist, diff[1] / dist, diff[2] / dist]
        : [0, 1, 0];
      return {
        particleIndex,
        normal,
        penetrationDepth: sphere.radius - dist,
      };
    }
    return null;
  }
}
