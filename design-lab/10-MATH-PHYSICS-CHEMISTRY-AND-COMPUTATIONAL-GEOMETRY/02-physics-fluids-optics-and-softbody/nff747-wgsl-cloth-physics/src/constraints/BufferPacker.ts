import type { DihedralHinge } from './types';

export class BufferPacker {
  static packHinges(hinges: DihedralHinge[]): { indices: Uint32Array; params: Float32Array } {
    const indices = new Uint32Array(hinges.length * 4);
    const params = new Float32Array(hinges.length * 2);

    for (let i = 0; i < hinges.length; i++) {
      const h = hinges[i];
      indices[i * 4 + 0] = h.p1;
      indices[i * 4 + 1] = h.p2;
      indices[i * 4 + 2] = h.p3;
      indices[i * 4 + 3] = h.p4;

      params[i * 2 + 0] = h.restAngle;
      params[i * 2 + 1] = h.stiffness;
    }

    return { indices, params };
  }
}
