/** Area of a rounded rectangle: the four corners take away (4 - π)r². */
export function roundedRectArea(w: number, h: number, r: number): number {
  const rr = Math.min(Math.max(r, 0), Math.min(w, h) / 2);
  return w * h - (4 - Math.PI) * rr * rr;
}

export function coveragePct(
  panelW: number,
  panelH: number,
  radius: number,
  screenW: number,
  screenH: number,
): number {
  if (screenW <= 0 || screenH <= 0) return 0;
  return (roundedRectArea(panelW, panelH, radius) / (screenW * screenH)) * 100;
}
