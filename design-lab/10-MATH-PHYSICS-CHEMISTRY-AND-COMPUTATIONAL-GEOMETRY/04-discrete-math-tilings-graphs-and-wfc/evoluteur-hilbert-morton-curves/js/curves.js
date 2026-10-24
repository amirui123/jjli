/*
  Space-Filling Curves
  One line that visits every cell of a square: Hilbert, Peano, Moore,
  Gosper's flowsnake, the dragon, Sierpinski's curves, the Z-order and the
  Levy C curve, drawn level by level as L-systems (Lindenmayer rewriting).
  https://github.com/evoluteur/space-filling-curves
  (c) 2026 Olivier Giulieri
*/

// F and G draw a step, + and - turn, other letters only rewrite
const CURVES = {
  hilbert: {
    name: "Hilbert", year: 1891, angle: 90, axiom: "A", rules: { A: "+BF-AFA-FB+", B: "-AF+BFB+FA-" }, max: 8, level: 5,
    text: "David Hilbert's curve: four copies of itself, turned and joined. Points close on the line stay close on the square.",
  },
  moore: {
    name: "Moore", year: 1900, angle: 90, axiom: "LFL+F+LFL", rules: { L: "-RF+LFL+FR-", R: "+LF-RFR-FL+" }, max: 7, level: 4,
    text: "E. H. Moore's closed version of the Hilbert curve: it ends where it began.",
  },
  peano: {
    name: "Peano", year: 1890, angle: 90, axiom: "X", rules: { X: "XFYFX+F+YFXFY-F-XFYFX", Y: "YFXFY-F-XFYFX+F+YFXFY" }, max: 5, level: 3,
    text: "The first one, by Giuseppe Peano: nine copies in a 3 by 3 grid, snaking back and forth.",
  },
  gosper: {
    name: "Gosper flowsnake", year: 1973, angle: 60, axiom: "A", rules: { A: "A-B--B+A++AA+B-", B: "+A-BB--B-A++A+B" }, draw: "AB", max: 6, level: 4,
    text: "Bill Gosper's flowsnake fills a hexagon-like island with a fractal coast, on a grid of triangles.",
  },
  sierpinski: {
    name: "Sierpiński", year: 1912, angle: 45, axiom: "F--XF--F--XF", rules: { X: "XF+G+XF--F--XF+G+X" }, max: 7, level: 4,
    text: "Wacław Sierpiński's closed curve, made of diagonal steps, fills a square tilted on its point.",
  },
  arrowhead: {
    name: "Sierpiński arrowhead", year: 1915, angle: 60, axiom: "A", rules: { A: "B-A-B", B: "A+B+A" }, draw: "AB", flip: true, max: 9, level: 6,
    text: "A single line that traces the Sierpiński triangle, the triangle with holes inside holes.",
  },
  dragon: {
    name: "Dragon", year: 1966, angle: 90, axiom: "F", rules: { F: "F+G", G: "F-G" }, max: 16, level: 11,
    text: "Fold a strip of paper in half again and again, unfold it at right angles: the dragon of NASA physicists Heighway, Harter and Banks.",
  },
  levy: {
    name: "Lévy C", year: 1938, angle: 45, axiom: "F", rules: { F: "+F--F+" }, max: 16, level: 10,
    text: "Paul Lévy's C curve: each segment replaced by two at right angles. It fills a region with a fractal boundary.",
  },
  zorder: {
    name: "Z-order (Morton)", year: 1966, max: 8, level: 4,
    text: "Guy Morton's order: interleave the bits of x and y. Not one continuous line (it jumps), but simple, and used in databases and maps.",
  },
};

const PALETTES = {
  rainbow: { name: "Rainbow", bg: "#101418", hues: true },
  sunset: { name: "Sunset", bg: "#1b1024", stops: ["#ffd36e", "#ff7a59", "#d6336c", "#6b2a9e"] },
  ocean: { name: "Ocean", bg: "#06192a", stops: ["#e8fbff", "#7fdcf0", "#2f9bd6", "#2d4fa8"] },
  ink: { name: "Ink on paper", bg: "#f3eee2", stops: ["#1c1b19", "#1c1b19"] },
  blueprint: { name: "Blueprint", bg: "#1f4e8c", stops: ["#e6f0ff", "#e6f0ff"] },
  gold: { name: "Black and gold", bg: "#0d0d0d", stops: ["#fff1c9", "#d9b45a", "#9c7424"] },
};

const state = {
  curve: "hilbert",
  level: 5,
  width: 0.5, // line width, as a share of a step
  palette: "rainbow",
  animate: true,
};

let canvas, ctx, pts = [], drawn = 0, anim = null;

// ------------------------------------------------------------ building the curve

const lsystem = (c, level) => {
  const rad = (c.angle * Math.PI) / 180;
  const draws = c.draw || "FG";
  let x = 0, y = 0, a = 0;
  const out = [[0, 0]];
  const run = (sym, depth) => {
    if (depth > 0 && c.rules[sym]) {
      for (const s of c.rules[sym]) run(s, depth - 1);
      return;
    }
    if (sym === "+") a += rad;
    else if (sym === "-") a -= rad;
    else if (draws.includes(sym)) {
      x += Math.cos(a);
      y += c.flip ? -Math.sin(a) : Math.sin(a); // upside down, so the triangle stands on its base
      out.push([x, y]);
    }
  };
  for (const s of c.axiom) run(s, level);
  return out;
};

// the Z-order: interleave the bits of x and y
const zorder = (level) => {
  const n = 1 << level, out = [];
  for (let i = 0; i < n * n; i++) {
    let x = 0, y = 0;
    for (let b = 0; b < level; b++) {
      x |= ((i >> (2 * b)) & 1) << b;
      y |= ((i >> (2 * b + 1)) & 1) << b;
    }
    out.push([x, y]);
  }
  return out;
};

const build = () => {
  const c = CURVES[state.curve];
  pts = state.curve === "zorder" ? zorder(state.level) : lsystem(c, state.level);
};

// ------------------------------------------------------------ drawing

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const colorAt = (t) => {
  const pal = PALETTES[state.palette];
  if (pal.hues) return `hsl(${Math.round(t * 300)}, 85%, 62%)`;
  const s = pal.stops.map(hex);
  const u = t * (s.length - 1), k = Math.min(s.length - 2, Math.floor(u)), f = u - k;
  const c = s[k].map((v, j) => Math.round(v + (s[k + 1][j] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// fit the curve in the square, with a margin
let fit = null;
const fitCurve = (w) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const m = w * 0.06, span = Math.max(x1 - x0, y1 - y0) || 1;
  const s = (w - 2 * m) / span;
  const ox = (w - (x1 - x0) * s) / 2 - x0 * s, oy = (w - (y1 - y0) * s) / 2 - y0 * s;
  // a step on screen, for the line width: the shortest segment
  const step = s * Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  fit = { s, ox, oy, step };
};

const P = (i) => [fit.ox + pts[i][0] * fit.s, fit.oy + pts[i][1] * fit.s];

const CHUNKS = 240; // the color changes in this many steps along the line
const drawRange = (from, to) => {
  const n = pts.length - 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(0.6, fit.step * state.width);
  const per = Math.max(1, Math.ceil(n / CHUNKS));
  for (let a = from; a < to; ) {
    const b = Math.min(to, (Math.floor(a / per) + 1) * per);
    ctx.beginPath();
    ctx.moveTo(...P(a));
    for (let i = a + 1; i <= b; i++) ctx.lineTo(...P(i));
    ctx.strokeStyle = colorAt(a / n);
    ctx.stroke();
    a = b;
  }
};

const clear = () => {
  ctx.fillStyle = PALETTES[state.palette].bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const redraw = () => {
  if (!canvas.width) return;
  fitCurve(canvas.width);
  clear();
  drawn = anim ? drawn : pts.length - 1;
  drawRange(0, drawn);
  stats();
};

// draw the line from its start, over about four seconds
const play = () => {
  anim = { start: performance.now() };
  drawn = 0;
  fitCurve(canvas.width);
  clear();
};
const loop = (now) => {
  if (anim) {
    const n = pts.length - 1;
    const t = Math.min(1, (now - anim.start) / Math.min(6000, 1500 + n * 0.08));
    const to = Math.round(t * n);
    if (to > drawn) {
      drawRange(drawn, to);
      drawn = to;
    }
    if (t >= 1) anim = null;
  }
  requestAnimationFrame(loop);
};

const stats = () => {
  $("v-steps").textContent = (pts.length - 1).toLocaleString("en-US");
};

// ------------------------------------------------------------ export

const download = (blob, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

const exportSVG = () => {
  const W = 1000;
  fitCurve(W);
  const n = pts.length - 1, per = Math.max(1, Math.ceil(n / CHUNKS));
  let paths = "";
  for (let a = 0; a < n; a = Math.min(n, a + per)) {
    const b = Math.min(n, a + per);
    let d = "M" + P(a).map((v) => v.toFixed(2)).join(" ");
    for (let i = a + 1; i <= b; i++) d += "L" + P(i).map((v) => v.toFixed(2)).join(" ");
    paths += `<path d="${d}" stroke="${colorAt(a / n)}"/>\n`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
<rect width="${W}" height="${W}" fill="${PALETTES[state.palette].bg}"/>
<g fill="none" stroke-width="${Math.max(0.6, fit.step * state.width).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">
${paths}</g>
</svg>`;
  fitCurve(canvas.width);
  download(new Blob([svg], { type: "image/svg+xml" }), `${state.curve}-${state.level}.svg`);
};

// ------------------------------------------------------------ controls

const $ = (id) => document.getElementById(id);

let hashTimer;
const saveHash = () => {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const q = new URLSearchParams({ c: state.curve, l: state.level, p: state.palette, w: state.width });
    history.replaceState(null, "", "#" + q.toString());
  }, 300);
};

const readHash = () => {
  const q = new URLSearchParams(location.hash.slice(1));
  if (CURVES[q.get("c")]) {
    state.curve = q.get("c");
    state.level = CURVES[state.curve].level;
  }
  if (PALETTES[q.get("p")]) state.palette = q.get("p");
  const l = +q.get("l"), w = parseFloat(q.get("w"));
  if (l >= 1 && l <= CURVES[state.curve].max) state.level = l;
  if (w > 0 && w <= 1) state.width = w;
};

const showCurve = () => {
  const c = CURVES[state.curve];
  $("level").max = c.max;
  $("level").value = state.level;
  $("v-level").textContent = state.level;
  $("curve-text").textContent = c.text + " (" + c.year + ")";
  $("v-width").textContent = Math.round(state.width * 100) + "%";
};

const update = (animate) => {
  build();
  showCurve();
  saveHash();
  if (animate && state.animate) {
    play();
    stats();
  } else {
    anim = null;
    redraw();
  }
};

const options = (o) => Object.entries(o).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join("");

const initCurves = () => {
  canvas = $("curve");
  ctx = canvas.getContext("2d");
  readHash();
  $("type").innerHTML = options(CURVES);
  $("palette").innerHTML = options(PALETTES);
  $("type").value = state.curve;
  $("palette").value = state.palette;
  $("width").value = state.width;
  $("animate").checked = state.animate;
  const fitCanvas = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.round(r.width * Math.min(2, window.devicePixelRatio || 1));
    if (w && canvas.width !== w) {
      canvas.width = canvas.height = w;
      redraw();
    }
  };
  build();
  showCurve();
  fitCanvas();
  window.addEventListener("resize", fitCanvas);

  $("type").addEventListener("change", (e) => {
    state.curve = e.target.value;
    state.level = CURVES[state.curve].level;
    update(true);
  });
  $("level").addEventListener("input", (e) => {
    state.level = +e.target.value;
    update(false);
  });
  $("width").addEventListener("input", (e) => {
    state.width = +e.target.value;
    showCurve();
    saveHash();
    if (!anim) redraw();
  });
  $("palette").addEventListener("change", (e) => {
    state.palette = e.target.value;
    saveHash();
    anim = null;
    redraw();
  });
  $("animate").addEventListener("change", (e) => (state.animate = e.target.checked));
  $("btn-play").addEventListener("click", () => {
    play();
  });
  $("btn-png").addEventListener("click", () => {
    anim = null;
    redraw();
    canvas.toBlob((b) => download(b, `${state.curve}-${state.level}.png`));
  });
  $("btn-svg").addEventListener("click", exportSVG);

  saveHash();
  if (state.animate) play();
  requestAnimationFrame(loop);
};
