export class DihedralCalculator {
  static calculateDihedralAngle(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ): number {
    // Edge vector e = p2 - p1
    const e = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const eLen = Math.hypot(e[0], e[1], e[2]);
    if (eLen < 1e-6) return 0;

    // Normal 1: n1 = (p2 - p1) x (p3 - p1)
    const d1 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    const n1 = [
      e[1] * d1[2] - e[2] * d1[1],
      e[2] * d1[0] - e[0] * d1[2],
      e[0] * d1[1] - e[1] * d1[0],
    ];

    // Normal 2: n2 = (p2 - p1) x (p4 - p1)
    const d2 = [p4[0] - p1[0], p4[1] - p1[1], p4[2] - p1[2]];
    const n2 = [
      e[1] * d2[2] - e[2] * d2[1],
      e[2] * d2[0] - e[0] * d2[2],
      e[0] * d2[1] - e[1] * d2[0],
    ];

    const l1 = Math.hypot(n1[0], n1[1], n1[2]);
    const l2 = Math.hypot(n2[0], n2[1], n2[2]);
    if (l1 < 1e-6 || l2 < 1e-6) return 0;

    const dot = (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]) / (l1 * l2);
    return Math.acos(Math.max(-1, Math.min(1, dot)));
  }
}
