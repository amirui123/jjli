/**
 * Canvas emoji-particle system for the motion channel.
 *
 * Physics + emoji rasterization adapted from lochie/web-haptics (MIT), the same
 * engine behind haptics.lochie.me's emoji showers, ported to dependency-free
 * vanilla TS. A single shared full-screen canvas draws every particle; the rAF
 * loop runs ONLY while particles are alive and stops itself when idle. Emoji are
 * pre-rasterized to offscreen canvases for fast drawImage (cheap on iOS Safari).
 */

interface Particle {
  x: number;
  y: number;
  xv: number;
  yv: number;
  a: number;
  s: number;
  opacity: number;
  life: number;
  maxLife: number;
  emoji: string;
  flipH: boolean;
  fontSize: number;
  radius: number;
  gx: number;
  gy: number;
}

const MAX_ACTIVE = 500;
const ANIM_FRAMES = 120;
const MAX_DPR = 2;

let canvas: HTMLCanvasElement | null = null;
let ctx2d: CanvasRenderingContext2D | null = null;
const particles: Particle[] = [];
let raf: number | null = null;
const emojiCache = new Map<string, HTMLCanvasElement>();

function dpr(): number {
  return Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

function getEmojiCanvas(emoji: string): HTMLCanvasElement {
  const hit = emojiCache.get(emoji);
  if (hit) return hit;
  const px = Math.ceil(64 * dpr());
  const size = Math.ceil(px * 1.5); // pad so glyphs that overflow aren't clipped
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const c = off.getContext("2d")!;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `${px}px serif`;
  c.fillText(emoji, size / 2, size / 2);
  emojiCache.set(emoji, off);
  return off;
}

function resize(): void {
  if (!canvas) return;
  const d = dpr();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const tw = Math.round(w * d);
  const th = Math.round(h * d);
  if (canvas.width !== tw || canvas.height !== th) {
    canvas.width = tw;
    canvas.height = th;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
}

function ensureCanvas(): boolean {
  if (typeof document === "undefined") return false;
  if (canvas && canvas.isConnected && ctx2d) return true;
  const host = document.body ?? document.documentElement;
  if (!host) return false;
  const el = document.createElement("canvas");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;inset:0;z-index:2147483646;pointer-events:none;user-select:none;contain:strict;";
  host.appendChild(el);
  canvas = el;
  ctx2d = el.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  return ctx2d !== null;
}

function updateParticle(p: Particle): boolean {
  p.a += p.xv * 0.5;
  p.yv *= 0.9;
  p.y += p.yv;
  p.xv *= 0.98;
  p.x += p.xv;
  p.s += (1 - p.s) * 0.3; // scale eases from 0.2 → 1 (pop-in)
  p.xv += p.gx * 0.1;
  p.yv += (p.gy + p.yv) * 0.1;
  p.radius = p.fontSize * p.s * 0.5;
  p.life--;
  const ratio = p.life / p.maxLife;
  if (ratio < 0.25) p.opacity = ratio / 0.25;
  return p.life > 0 && p.opacity > 0.01;
}

// AUDIT-006 (Medium): O(n²) pairwise pass every frame, no spatial partitioning. ~125k
// checks/frame at the MAX_ACTIVE=500 cap (a single buzz is only ~80 particles); the
// worst case needs stacked showers/rapid taps, and is the likely jank source on low-end
// mobile. Spatial-hash the broad phase, cap collisions above a threshold, or lower the
// active cap. See docs/code-audit.md.
function resolveCollisions(): void {
  const n = particles.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = particles[i]!;
      const b = particles[j]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const min = a.radius + b.radius;
      if (d2 < min * min && d2 > 0.0001) {
        const dist = Math.sqrt(d2);
        const nx = dx / dist;
        const ny = dy / dist;
        const sep = (min - dist) * 0.5;
        a.x -= nx * sep;
        a.y -= ny * sep;
        b.x += nx * sep;
        b.y += ny * sep;
        const dot = (a.xv - b.xv) * nx + (a.yv - b.yv) * ny;
        if (dot > 0) {
          const imp = dot * 0.5;
          a.xv -= imp * nx;
          a.yv -= imp * ny;
          b.xv += imp * nx;
          b.yv += imp * ny;
        }
      }
    }
  }
}

function frame(): void {
  if (!canvas || !ctx2d) {
    raf = null;
    return;
  }
  const c = ctx2d;
  const d = dpr();
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!updateParticle(particles[i]!)) {
      particles[i] = particles[particles.length - 1]!;
      particles.pop();
    }
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (particles.length === 0) {
    raf = null; // idle → stop the loop
    return;
  }
  resolveCollisions();
  c.globalAlpha = 1;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const fading = p.opacity < 1;
      if (pass === 0 && fading) continue;
      if (pass === 1 && !fading) continue;
      if (pass === 1) c.globalAlpha = p.opacity;
      // AUDIT-012 (Low, micro-opt): a Map.get per particle per frame. Resolve the
      // rasterized canvas once at spawn and store it on the Particle instead. code-audit.md.
      const img = getEmojiCanvas(p.emoji);
      const draw = p.fontSize * p.s * 1.5;
      const half = draw / 2;
      const rad = (p.a * Math.PI) / 180;
      const cos = Math.cos(rad) * d;
      const sin = Math.sin(rad) * d;
      const fx = p.flipH ? -1 : 1;
      c.setTransform(cos * fx, sin * fx, -sin, cos, p.x * d, p.y * d);
      c.drawImage(img, -half, -half, draw, draw);
    }
  }
  raf = requestAnimationFrame(frame);
}

function startLoop(): void {
  if (raf === null) raf = requestAnimationFrame(frame);
}

export interface BurstOptions {
  emojis?: string[];
  flip?: boolean;
  count?: number;
  /** If set, keep spawning bursts for this many ms (a sustained shower). */
  duration?: number;
  gravityX?: number;
  gravityY?: number;
}

function spawn(x: number, y: number, opts: BurstOptions): void {
  const emojis = opts.emojis && opts.emojis.length > 0 ? opts.emojis : ["✨"];
  const amount = Math.max(1, opts.count ?? 5);
  // AUDIT-007 (Low): drops the ENTIRE burst at the cap instead of spawning the remaining
  // headroom (min(amount, MAX_ACTIVE - length)): feedback vanishes under rapid input
  // exactly when the user is most active. See docs/code-audit.md.
  if (particles.length + amount > MAX_ACTIVE) return;
  const gx = opts.gravityX ?? 0;
  const gy = opts.gravityY ?? -1.5; // slight upward bias, like a fountain
  for (let i = 0; i < amount; i++) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]!;
    particles.push({
      x,
      y,
      xv: Math.random() * 16 - 8,
      yv: (2 + Math.random() * 8) * (0.25 + Math.random() * 0.25),
      a: 0,
      s: 0.2,
      opacity: 1,
      life: ANIM_FRAMES,
      maxLife: ANIM_FRAMES,
      emoji,
      flipH: opts.flip ? Math.random() < 0.5 : false,
      fontSize: 20 + Math.ceil(Math.random() * 28),
      radius: 0,
      gx,
      gy,
    });
  }
}

/** Spawn an emoji burst at viewport point (x, y). A no-op outside the browser. */
export function particleBurst(x: number, y: number, opts: BurstOptions = {}): void {
  if (!ensureCanvas()) return;
  spawn(x, y, opts);
  startLoop();
  const duration = opts.duration ?? 0;
  if (duration > 0) {
    // AUDIT-005 (Medium): these setTimeouts are untracked/uncancelable and re-spawn at the
    // ORIGINAL captured (x, y), so they ignore scroll/element-movement/unmount and can't be
    // stopped if motion is disabled mid-shower. Track timer ids + expose a cancel (tie into
    // the dispose() of AUDIT-003); re-resolve the anchor per tick. See docs/code-audit.md.
    const interval = 150;
    const reps = Math.floor(duration / interval);
    for (let i = 1; i <= reps; i++) {
      setTimeout(() => {
        spawn(x, y, opts);
        startLoop();
      }, i * interval);
    }
  }
}
