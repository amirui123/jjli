#!/usr/bin/env node
/**
 * contour-svg: render a topographic contour map as SVG.
 *
 *   node bin/contour-svg.js elevation.csv --levels 10 > map.svg
 *   cat grid.csv | node bin/contour-svg.js --values 0.5,1,1.5 --scale 4 > out.svg
 *   node bin/contour-svg.js --demo terrain --levels 14 > terrain.svg
 *
 * Input is a CSV (or whitespace separated) matrix of numbers, one row per
 * line. Empty cells, "NaN" or "nan" are treated as missing data.
 */
import { readFileSync } from 'node:fs';
import { contours, thresholds, sampleField, simplify, toSvgPath, gridSize } from '../src/marching-squares.js';

function parseArgs(argv) {
  const args = { levels: 10, scale: 4, simplify: 0, values: null, demo: null, file: null, index: 5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`missing value for ${a}`);
      return argv[++i];
    };
    if (a === '--levels') args.levels = parseInt(next(), 10);
    else if (a === '--values') args.values = next().split(',').map(Number);
    else if (a === '--scale') args.scale = parseFloat(next());
    else if (a === '--simplify') args.simplify = parseFloat(next());
    else if (a === '--index') args.index = parseInt(next(), 10);
    else if (a === '--demo') args.demo = next();
    else if (a === '-h' || a === '--help') args.help = true;
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
    else args.file = a;
  }
  return args;
}

export function parseGrid(text) {
  const rows = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) =>
      (/[,;]/.test(l) ? l.split(/\s*[,;]\s*/) : l.split(/\s+/)).map((v) =>
        v === '' || /^nan$/i.test(v) ? NaN : Number(v),
      ),
    );
  gridSize(rows);
  return rows;
}

// Smooth pseudo-terrain from a few summed sinusoids plus gaussian hills.
const DEMOS = {
  terrain: () =>
    sampleField(
      (x, y) =>
        900 * Math.exp(-((x - 60) ** 2 + (y - 45) ** 2) / 900) +
        600 * Math.exp(-((x - 130) ** 2 + (y - 90) ** 2) / 1400) +
        120 * Math.sin(x / 11) * Math.cos(y / 13) +
        60 * Math.sin((x + 2 * y) / 7),
      181,
      131,
    ),
  metaballs: () =>
    sampleField(
      (x, y) =>
        [
          [40, 40, 14],
          [75, 55, 18],
          [55, 85, 10],
          [110, 70, 16],
        ].reduce((s, [cx, cy, r]) => s + (r * r) / ((x - cx) ** 2 + (y - cy) ** 2 + 1), 0),
      151,
      121,
    ),
};

// Colour ramp from deep teal through sand to rust, like a hypsometric tint.
function ramp(t) {
  const stops = [
    [0.0, [22, 78, 99]],
    [0.35, [52, 140, 110]],
    [0.6, [196, 170, 90]],
    [1.0, [150, 60, 40]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const k = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(',')})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`;
}

export function renderSvg(grid, opts) {
  const { width, height } = gridSize(grid);
  const levels = opts.values ?? thresholds(grid, opts.levels);
  const lines = contours(grid, levels);
  const s = opts.scale;
  const paths = lines.map((c) => {
    const li = levels.indexOf(c.level);
    const t = levels.length > 1 ? li / (levels.length - 1) : 0.5;
    const isIndex = opts.index > 0 && (li + 1) % opts.index === 0;
    const pts = opts.simplify > 0 ? simplify(c.points, opts.simplify, c.closed) : c.points;
    return `  <path d="${toSvgPath({ points: pts, closed: c.closed }, { scale: s, precision: 2 })}" stroke="${ramp(t)}" stroke-width="${isIndex ? 2 : 1}" data-level="${+c.level.toFixed(4)}"/>`;
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(width - 1) * s} ${(height - 1) * s}" width="${(width - 1) * s}" height="${(height - 1) * s}">`,
    `  <rect width="100%" height="100%" fill="#fbf8f1"/>`,
    `  <g fill="none" stroke-linejoin="round" stroke-linecap="round">`,
    ...paths,
    `  </g>`,
    `</svg>`,
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(readFileSync(new URL(import.meta.url)).toString().split('*/')[0] + '*/\n');
    return;
  }
  let grid;
  if (args.demo) {
    if (!DEMOS[args.demo]) throw new Error(`unknown demo "${args.demo}" (try: ${Object.keys(DEMOS).join(', ')})`);
    grid = DEMOS[args.demo]();
  } else {
    let text;
    if (args.file) text = readFileSync(args.file, 'utf8');
    else {
      const chunks = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      text = Buffer.concat(chunks).toString('utf8');
    }
    grid = parseGrid(text);
  }
  process.stdout.write(renderSvg(grid, args));
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('contour-svg.js')) {
  main().catch((err) => {
    process.stderr.write(`contour-svg: ${err.message}\n`);
    process.exit(1);
  });
}
