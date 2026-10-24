export interface AABB {
  min: [number, number, number];
  max: [number, number, number];
}

export interface SphereCollider {
  center: [number, number, number];
  radius: number;
}

export interface CapsuleCollider {
  p1: [number, number, number];
  p2: [number, number, number];
  radius: number;
}

export interface CollisionContact {
  particleIndex: number;
  normal: [number, number, number];
  penetrationDepth: number;
}
