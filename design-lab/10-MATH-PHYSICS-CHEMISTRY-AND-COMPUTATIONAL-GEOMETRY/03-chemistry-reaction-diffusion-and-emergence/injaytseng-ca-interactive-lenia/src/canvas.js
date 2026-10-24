// The one place a sim sizes its backing store.
//
// Every sim used to carry its own copy of `Math.min(2, devicePixelRatio)` and
// none of them survived a 0×0 host: a minimised window on Windows reports 0×0,
// so does a `display: none` or unsized embed, and `createImageData(w, 0)` throws.
// The clamp to one pixel keeps every downstream grid at least 1×1.
//
// `maxDpr` is a sim decision. The Canvas 2D sims draw crisp cells and want the
// device's pixels (capped at 2); the GL sims upscale a 128- or 160-row state and
// gain nothing from rendering more fragments than the display has CSS pixels.
export function fitCanvas(canvas, { maxDpr = 2 } = {}) {
  const dpr = Math.min(maxDpr, globalThis.devicePixelRatio || 1);
  const w = Math.max(1, canvas.clientWidth | 0), h = Math.max(1, canvas.clientHeight | 0);
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  return { w, h, dpr };
}
