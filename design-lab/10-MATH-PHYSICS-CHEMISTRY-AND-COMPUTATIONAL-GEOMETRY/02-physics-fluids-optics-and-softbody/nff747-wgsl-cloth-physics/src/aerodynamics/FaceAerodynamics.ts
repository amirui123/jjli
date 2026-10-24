export class FaceAerodynamics {
  static calculateForce(
    vRel: [number, number, number],
    normal: [number, number, number],
    area: number,
    density = 1.225,
    cDrag = 1.2,
    cLift = 0.8
  ): [number, number, number] {
    const speed = Math.hypot(vRel[0], vRel[1], vRel[2]);
    if (speed < 1e-4) return [0, 0, 0];

    const vDir = [vRel[0] / speed, vRel[1] / speed, vRel[2] / speed];
    const cosAlpha = vDir[0] * normal[0] + vDir[1] * normal[1] + vDir[2] * normal[2];

    const q = 0.5 * density * speed * speed * area;
    const fDragMagnitude = q * cDrag * Math.abs(cosAlpha);
    const fDrag = [vDir[0] * fDragMagnitude, vDir[1] * fDragMagnitude, vDir[2] * fDragMagnitude];

    // Lift normal to vRel
    const liftDir = [
      normal[0] - cosAlpha * vDir[0],
      normal[1] - cosAlpha * vDir[1],
      normal[2] - cosAlpha * vDir[2]
    ];
    const liftLen = Math.hypot(liftDir[0], liftDir[1], liftDir[2]);
    const fLift = liftLen > 1e-6
      ? [
          (liftDir[0] / liftLen) * q * cLift * (1 - cosAlpha * cosAlpha),
          (liftDir[1] / liftLen) * q * cLift * (1 - cosAlpha * cosAlpha),
          (liftDir[2] / liftLen) * q * cLift * (1 - cosAlpha * cosAlpha),
        ]
      : [0, 0, 0];

    return [fDrag[0] + fLift[0], fDrag[1] + fLift[1], fDrag[2] + fLift[2]];
  }
}
