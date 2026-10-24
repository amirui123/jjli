/* ============================================================
   Generative engine — seeded PRNG, value noise, 6 techniques.
   Vanilla canvas, zero dependencies. Each gallery piece renders
   once; the hero animates a flow field and pauses off-screen.
   ============================================================ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower =
  ((navigator.hardwareConcurrency || 8) <= 4) ||
  matchMedia('(max-width: 820px), (pointer: coarse)').matches;

/* ---------- seeded random + value noise ---------- */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(rng) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rng() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const val = (ix, iy) => perm[(ix + perm[iy & 255]) & 255] / 255;
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const u = fade(x - x0), v = fade(y - y0);
    const n00 = val(x0, y0), n10 = val(x0 + 1, y0), n01 = val(x0, y0 + 1), n11 = val(x0 + 1, y0 + 1);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
  };
}

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const INK = '#0b0a0f';
const PALETTES = [
  ['#ff6b5c', '#ffb347', '#ffe66d', '#3ad6c5'],
  ['#e85aff', '#7c5cff', '#5b8cff', '#3ad6c5'],
  ['#ff5c8a', '#ffb347', '#5b8cff', '#f4f1ea'],
  ['#3ad6c5', '#5b8cff', '#e85aff', '#ffe66d'],
  ['#ffb347', '#ff6b5c', '#e85aff', '#7c5cff'],
  ['#f4f1ea', '#ff6b5c', '#3ad6c5', '#ffb347'],
];
const pick = (rng, arr) => arr[(rng() * arr.length) | 0];

/* ---------- generators: (ctx, w, h, rng, noise, pal) ---------- */

function flowField(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const scale = 0.0015 + rng() * 0.0022, turns = 1 + rng() * 1.8;
  const count = Math.min(2600, Math.floor((w * h) / 650));
  ctx.lineWidth = 1.1;
  for (let i = 0; i < count; i++) {
    let x = rng() * w, y = rng() * h;
    ctx.strokeStyle = hexA(pick(rng, pal), 0.085);
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 130; s++) {
      const a = noise(x * scale, y * scale) * Math.PI * 2 * turns;
      x += Math.cos(a) * 2; y += Math.sin(a) * 2;
      ctx.lineTo(x, y);
      if (x < 0 || x > w || y < 0 || y > h) break;
    }
    ctx.stroke();
  }
}

function circlePacking(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const circles = [], maxR = Math.min(w, h) * 0.17, tries = 1100;
  for (let i = 0; i < tries; i++) {
    const x = rng() * w, y = rng() * h;
    let inside = false;
    for (const c of circles) if (Math.hypot(x - c.x, y - c.y) < c.r + 2) { inside = true; break; }
    if (inside) continue;
    let r = 2, grow = true;
    while (grow && r < maxR) {
      r += 1.5;
      if (x - r < 2 || x + r > w - 2 || y - r < 2 || y + r > h - 2) { r -= 1.5; break; }
      for (const c of circles) if (Math.hypot(x - c.x, y - c.y) < r + c.r) { r -= 1.5; grow = false; break; }
    }
    if (r > 3) circles.push({ x, y, r });
  }
  for (const c of circles) {
    const col = pick(rng, pal);
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    if (rng() < 0.55) { ctx.fillStyle = hexA(col, 0.92); ctx.fill(); }
    else { ctx.lineWidth = Math.max(1, c.r * 0.13); ctx.strokeStyle = col; ctx.stroke(); }
  }
}

function noiseField(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const scale = 0.006 + rng() * 0.004, off = rng() * 1000, bands = pal.length, cell = 5;
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      let n = noise(x * scale + off, y * scale + off) * 0.6 + noise(x * scale * 2 + off, y * scale * 2 + off) * 0.4;
      ctx.fillStyle = hexA(pal[Math.min(bands - 1, (n * bands) | 0)], 0.92);
      ctx.fillRect(x, y, cell, cell);
    }
  }
}

function subdivision(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const minS = Math.min(w, h) * 0.09;
  (function split(x, y, ww, hh, d) {
    if (d > 0 && (ww > minS || hh > minS) && rng() < 0.93) {
      if (ww > hh) { const c = ww * (0.3 + rng() * 0.4); split(x, y, c, hh, d - 1); split(x + c, y, ww - c, hh, d - 1); }
      else { const c = hh * (0.3 + rng() * 0.4); split(x, y, ww, c, d - 1); split(x, y + c, ww, hh - c, d - 1); }
    } else {
      const pad = Math.min(ww, hh) * 0.09, col = pick(rng, pal);
      ctx.fillStyle = hexA(col, 0.92);
      if (rng() < 0.66) ctx.fillRect(x + pad, y + pad, ww - pad * 2, hh - pad * 2);
      else { ctx.beginPath(); ctx.arc(x + ww / 2, y + hh / 2, Math.min(ww, hh) / 2 - pad, 0, Math.PI * 2); ctx.fill(); }
    }
  })(0, 0, w, h, 7);
}

function attractor(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const a = rng() * 4 - 2, b = rng() * 4 - 2, c = rng() * 4 - 2, d = rng() * 4 - 2;
  let x = 0, y = 0;
  const n = 70000, cx = w / 2, cy = h / 2, sc = Math.min(w, h) * 0.23;
  for (let i = 0; i < n; i++) {
    const nx = Math.sin(a * y) - Math.cos(b * x);
    const ny = Math.sin(c * x) - Math.cos(d * y);
    x = nx; y = ny;
    if (i < 20) continue;
    ctx.fillStyle = hexA(pal[Math.min(pal.length - 1, (i / n * pal.length) | 0)], 0.06);
    ctx.fillRect(cx + x * sc, cy + y * sc, 1, 1);
  }
}

function truchet(ctx, w, h, rng, noise, pal) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  const n = 7 + ((rng() * 6) | 0), s = Math.min(w, h) / n;
  const cols = Math.ceil(w / s), rows = Math.ceil(h / s);
  ctx.lineWidth = Math.max(2, s * 0.16); ctx.lineCap = 'round';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * s, y = j * s;
    ctx.strokeStyle = pick(rng, pal);
    ctx.beginPath();
    if (rng() < 0.5) {
      ctx.arc(x, y, s / 2, 0, Math.PI / 2);
      ctx.moveTo(x + s, y + s); ctx.arc(x + s, y + s, s / 2, Math.PI, Math.PI * 1.5);
    } else {
      ctx.arc(x + s, y, s / 2, Math.PI / 2, Math.PI);
      ctx.moveTo(x, y + s); ctx.arc(x, y + s, s / 2, Math.PI * 1.5, Math.PI * 2);
    }
    ctx.stroke();
  }
}

const GENS = { flow: flowField, packing: circlePacking, noise: noiseField, subdivision, attractor, truchet };

/* ---------- gallery: render each piece once, regenerate on click ---------- */
function renderPiece(card) {
  const canvas = card.querySelector('canvas');
  if (!canvas) return;
  const gen = GENS[card.dataset.gen] || flowField;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.max(2, Math.round(rect.width)), h = Math.max(2, Math.round(rect.height));
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const seed = (Math.random() * 1e9) | 0;
  const rng = mulberry32(seed);
  const noise = makeNoise(rng);
  gen(ctx, w, h, rng, noise, PALETTES[(rng() * PALETTES.length) | 0]);
  const tag = card.querySelector('[data-seed]');
  if (tag) tag.textContent = '#' + (seed >>> 0).toString(16).slice(0, 6);
}

function initGallery() {
  const pieces = document.querySelectorAll('.piece[data-gen]');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !e.target.dataset.rendered) {
        renderPiece(e.target); e.target.dataset.rendered = '1'; io.unobserve(e.target);
      }
    }
  }, { rootMargin: '140px' });
  pieces.forEach((p) => io.observe(p));
  document.querySelectorAll('.piece[data-gen] [data-regen]').forEach((btn) =>
    btn.addEventListener('click', () => renderPiece(btn.closest('.piece')))
  );
}

/* ---------- hero: animated flow field, paused off-screen ---------- */
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rng = mulberry32((Math.random() * 1e9) | 0);
  let w, h, particles, noise, pal;
  const scale = 0.0014, turns = 1.6;

  const spawn = () => ({ x: rng() * w, y: rng() * h, life: 20 + rng() * 120, c: pick(rng, pal) });

  function setup() {
    const r = hero.getBoundingClientRect();
    w = Math.round(r.width); h = Math.round(r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    noise = makeNoise(rng);
    pal = PALETTES[(rng() * PALETTES.length) | 0];
    const count = lowPower ? 700 : 1600;
    particles = Array.from({ length: count }, spawn);
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  }

  function step() {
    ctx.fillStyle = 'rgba(11,10,15,0.022)'; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1.1;
    for (const p of particles) {
      const a = noise(p.x * scale, p.y * scale) * Math.PI * 2 * turns;
      const nx = p.x + Math.cos(a) * 1.8, ny = p.y + Math.sin(a) * 1.8;
      ctx.strokeStyle = hexA(p.c, 0.1);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.life--;
      if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) Object.assign(p, spawn());
    }
  }

  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  setup();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 200); });

  if (reduceMotion) { for (let k = 0; k < 220; k++) step(); }
  else (function loop() {
    requestAnimationFrame(loop);
    if (!visible || hero.getBoundingClientRect().bottom <= 0) return;
    step();
  })();
}

/* ---------- animated techniques (only the on-screen ones run) ---------- */
function swarm(ctx, w, h, rng) {
  const noise = makeNoise(rng);
  const pal = PALETTES[(rng() * PALETTES.length) | 0];
  const count = lowPower ? 260 : 700;
  const ps = Array.from({ length: count }, () => ({ x: rng() * w, y: rng() * h, c: pick(rng, pal), life: rng() * 200 }));
  const scale = 0.0022; let t = 0;
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  return { step() {
    t += 0.003;
    ctx.fillStyle = 'rgba(11,10,15,0.08)'; ctx.fillRect(0, 0, w, h);
    for (const p of ps) {
      const a = noise(p.x * scale, p.y * scale + t) * Math.PI * 4;
      p.x += Math.cos(a) * 1.3; p.y += Math.sin(a) * 1.3; p.life--;
      if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = rng() * w; p.y = rng() * h; p.life = 60 + rng() * 160; }
      ctx.fillStyle = hexA(p.c, 0.7); ctx.fillRect(p.x, p.y, 1.7, 1.7);
    }
  }};
}

function life(ctx, w, h, rng) {
  const col = pick(rng, PALETTES[(rng() * PALETTES.length) | 0]);
  const cell = Math.max(5, Math.round(Math.min(w, h) / 60));
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  let grid = new Uint8Array(cols * rows), next = new Uint8Array(cols * rows);
  const seedGrid = () => { for (let i = 0; i < grid.length; i++) grid[i] = rng() < 0.32 ? 1 : 0; };
  seedGrid();
  let frame = 0, gens = 0;
  const at = (x, y) => grid[((y + rows) % rows) * cols + ((x + cols) % cols)];
  return { step() {
    if (++frame % 4 !== 0) return;        // ~15 generations/sec
    let live = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += at(x + dx, y + dy);
      const c = grid[y * cols + x];
      const v = (c && (n === 2 || n === 3)) || (!c && n === 3) ? 1 : 0;
      next[y * cols + x] = v; live += v;
    }
    const tmp = grid; grid = next; next = tmp; gens++;
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = col;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (grid[y * cols + x]) ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
    if (live < grid.length * 0.02 || gens > 320) { seedGrid(); gens = 0; }
  }};
}

function plasma(ctx, w, h, rng) {
  const noise = makeNoise(rng);
  const pal = PALETTES[(rng() * PALETTES.length) | 0];
  const cell = lowPower ? 10 : 7;
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const scale = 0.05; let t = 0;
  return { step() {
    t += 0.012;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      let n = noise(i * scale + t, j * scale) * 0.6 + noise(i * scale * 2 - t, j * scale * 2 + t) * 0.4;
      ctx.fillStyle = pal[Math.min(pal.length - 1, (n * pal.length) | 0)];
      ctx.fillRect(i * cell, j * cell, cell, cell);
    }
  }};
}

function harmonograph(ctx, w, h, rng) {
  const pal = PALETTES[(rng() * PALETTES.length) | 0];
  const cx = w / 2, cy = h / 2;
  let P, t, maxT, px, py;
  function reset() {
    const ff = () => 2 + ((rng() * 4) | 0) + rng() * 0.04;
    P = { a: Math.min(w, h) * 0.3, f1: ff(), f2: ff(), f3: ff(), f4: ff(),
      p1: rng() * 6.28, p2: rng() * 6.28, p3: rng() * 6.28, p4: rng() * 6.28, d: 0.0016 + rng() * 0.0022 };
    t = 0; maxT = 380 + rng() * 240; px = py = null;
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1; ctx.strokeStyle = hexA(pick(rng, pal), 0.5);
  }
  const pt = (tt) => {
    const e = Math.exp(-P.d * tt);
    return [
      cx + P.a * e * (Math.sin(P.f1 * tt + P.p1) + 0.5 * Math.sin(P.f2 * tt + P.p2)),
      cy + P.a * e * (Math.sin(P.f3 * tt + P.p3) + 0.5 * Math.sin(P.f4 * tt + P.p4)),
    ];
  };
  reset();
  return { step() {
    for (let k = 0; k < 7; k++) {
      const [x, y] = pt(t);
      if (px !== null) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); }
      px = x; py = y; t += 0.05;
      if (t > maxT) { reset(); break; }
    }
  }};
}

function initAnimated() {
  const F = { swarm, life, plasma, harmonograph };
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const items = [];
  document.querySelectorAll('.piece[data-anim]').forEach((el) => {
    const canvas = el.querySelector('canvas');
    const make = F[el.dataset.anim];
    if (canvas && make) items.push({ el, canvas, ctx: canvas.getContext('2d'), make, state: null, visible: false });
  });
  if (!items.length) return;

  function setupItem(it) {
    const r = it.canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
    it.canvas.width = w * dpr; it.canvas.height = h * dpr;
    it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    it.state = it.make(it.ctx, w, h, mulberry32((Math.random() * 1e9) | 0));
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const it = items.find((i) => i.el === e.target);
      if (!it) continue;
      it.visible = e.isIntersecting;
      if (e.isIntersecting && !it.state) setupItem(it);
    }
  }, { rootMargin: '80px' });
  items.forEach((it) => io.observe(it.el));

  document.querySelectorAll('.piece[data-anim] [data-regen]').forEach((btn) =>
    btn.addEventListener('click', () => { const it = items.find((i) => i.el === btn.closest('.piece')); if (it) setupItem(it); })
  );

  let docVisible = true;
  document.addEventListener('visibilitychange', () => { docVisible = !document.hidden; });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => items.forEach((it) => { if (it.state) setupItem(it); }), 200); });

  if (reduceMotion) { items.forEach((it) => { setupItem(it); for (let k = 0; k < 140; k++) it.state.step(); }); return; }
  (function loop() {
    requestAnimationFrame(loop);
    if (!docVisible) return;
    for (const it of items) if (it.visible && it.state) it.state.step();
  })();
}

initHero();
initGallery();
initAnimated();
