/*
 * Illustrator's contact sheet and single-capture rendering.
 *
 * Kept separate from contact-sheet.js, which is the After Effects server's and
 * is left exactly as it was. Artboards come in different sizes and imageCapture
 * cannot render below 72 ppi, so this one fits mixed-size cells and scales
 * captures down - behaviour After Effects does not need.
 *
 * Composites N captures into one labelled contact sheet.
 *
 * Runs on a <canvas> in the extension's CEF page rather than through a native
 * image library, so the .zxp ships no node_modules and no binary dependency.
 * One sheet of every artboard costs a fraction of the context that N separate
 * images would.
 */

const { readCompletePng } = require('./png-ready.js');

const GREY = '#4a4a4a';

async function loadImage(filePath) {
  // Wait until the PNG is complete - a file read mid-write decodes with its
  // bottom rows missing.
  const b64 = (await readCompletePng(filePath)).toString('base64');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not decode ${filePath}`));
    img.src = `data:image/png;base64,${b64}`;
  });
}

/**
 * Cells are sized to the largest image and each image is fitted inside its
 * cell, so captures of different sizes (artboards for several ad formats)
 * share one sheet without being stretched.
 *
 * maxEdge scales each capture down so its long edge fits - imageCapture
 * cannot render below 72 ppi, so a large artboard arrives bigger than asked.
 *
 * @param {Array<{path:string,label?:string}>} frames
 * @param {{columns?:number, label?:boolean, gap?:number, maxEdge?:number}} options
 * @returns {Promise<{base64:string, width:number, height:number, columns:number, rows:number}>}
 */
async function buildContactSheet(frames, options = {}) {
  if (!frames.length) throw new Error('No frames to composite');

  const images = await Promise.all(frames.map((f) => loadImage(f.path)));
  const fit = (img) => (options.maxEdge ? Math.min(1, options.maxEdge / Math.max(img.width, img.height)) : 1);
  const cellW = Math.round(Math.max(...images.map((i) => i.width * fit(i))));
  const cellH = Math.round(Math.max(...images.map((i) => i.height * fit(i))));
  const labelH = options.label === false ? 0 : 16;
  const gap = options.gap === undefined ? 4 : options.gap;
  const columns = Math.max(1, Math.min(frames.length, options.columns || Math.ceil(Math.sqrt(frames.length))));
  const rows = Math.ceil(frames.length / columns);

  const canvas = document.createElement('canvas');
  canvas.width = columns * cellW + (columns - 1) * gap;
  canvas.height = rows * (cellH + labelH) + (rows - 1) * gap;
  const ctx = canvas.getContext('2d');

  // The gutters are near-black so cell edges read; each cell is mid grey, not
  // black or white, so a transparent region is not mistaken for a fill.
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((img, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * (cellW + gap);
    const y = row * (cellH + labelH + gap);
    ctx.fillStyle = GREY;
    ctx.fillRect(x, y, cellW, cellH);
    const scale = Math.min(cellW / img.width, cellH / img.height, fit(img));
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, x + (cellW - w) / 2, y + (cellH - h) / 2, w, h);

    if (labelH) {
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(x, y + cellH, cellW, labelH);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(frames[i].label || i + 1), x + 5, y + cellH + labelH / 2);
    }
  });

  const dataUrl = canvas.toDataURL('image/png');
  return {
    base64: dataUrl.replace(/^data:image\/png;base64,/, ''),
    width: canvas.width,
    height: canvas.height,
    columns,
    rows,
  };
}

/**
 * One capture, flattened onto a background and scaled to fit maxEdge.
 *
 * imageCapture keeps transparency, and most clients show a transparent PNG on
 * white - so an empty area would read as a white fill. Flattening onto mid grey
 * makes "nothing drawn here" visible. background null keeps the alpha.
 *
 * Scaling happens here because imageCapture refuses resolutions below 72 ppi
 * (measured on 30.8.1: "Specified value less than minimum allowed value"), so a
 * 728pt-wide leaderboard cannot be rendered at 320px directly.
 *
 * Outside the CEF page (unit tests under plain Node) there is no canvas, and
 * the raw PNG is returned unchanged.
 *
 * @param {string} filePath
 * @param {{background?: string|null, maxEdge?: number}} [opts]
 * @returns {Promise<{base64: string, width: number|null, height: number|null}>}
 */
async function renderCapture(filePath, { background = GREY, maxEdge } = {}) {
  if (typeof document === 'undefined') {
    return { base64: (await readCompletePng(filePath)).toString('base64'), width: null, height: null };
  }
  const img = await loadImage(filePath);
  const scale = maxEdge ? Math.min(1, maxEdge / Math.max(img.width, img.height)) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return {
    base64: canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''),
    width: canvas.width,
    height: canvas.height,
  };
}

module.exports = { buildContactSheet, renderCapture };
