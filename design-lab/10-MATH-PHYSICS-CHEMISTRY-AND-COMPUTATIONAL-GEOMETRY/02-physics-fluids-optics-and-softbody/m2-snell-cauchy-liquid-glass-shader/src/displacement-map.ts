import { glassNormal } from "./sdf2d";

export interface PanelShape {
  width: number;
  height: number;
  radius: number;
  bevel: number;
  thickness: number;
}

/**
 * feDisplacementMap encoding: the R channel carries the x offset, the G channel the
 * y offset, both centered on 0.5. The `scale` in the filter sets the magnitude.
 *
 * The map encodes the offset, NOT the normal: the refracted sample moves opposite to
 * the normal, so both channels are negated. The coordinates are computed in SVG's
 * y-down frame, so no extra flip is needed.
 */
export function buildDisplacementRGBA(shape: PanelShape): Uint8ClampedArray {
  const { width, height, radius, bevel, thickness } = shape;
  const data = new Uint8ClampedArray(width * height * 4);
  const half = [width / 2, height / 2] as const;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = [x + 0.5 - half[0], y + 0.5 - half[1]] as const;
      const n = glassNormal(p, half, radius, bevel, thickness, 1);
      const i = (y * width + x) * 4;
      data[i] = Math.round((-n[0] * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((-n[1] * 0.5 + 0.5) * 255);
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
  return data;
}

export function toPngDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D context");
  const image = new ImageData(width, height);
  image.data.set(data);
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
