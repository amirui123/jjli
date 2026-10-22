import React, { useEffect, useRef } from "react";

type ShaderMode = "matrix" | "gravity" | "aurora";

interface Props {
  mode?: ShaderMode;
  speed?: number;
  accent?: string;
  height?: number;
  className?: string;
}

const GLYPHS = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Three procedural canvas shaders — no WebGL context juggling, no library,
 * paused automatically when off-screen or when the tab is hidden.
 */
export const EngineShader: React.FC<Props> = ({
  mode = "matrix",
  speed = 1,
  accent = "#E8B33A",
  height = 380,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const [r, g, b] = hexToRgb(accent);
    const accentRgb = `${r},${g},${b}`;

    const resize = () => {
      width = canvas.clientWidth;
      heightPx = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(heightPx * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type Drop = { x: number; y: number; vy: number; char: string; size: number; alpha: number };
    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let drops: Drop[] = [];
    let particles: Particle[] = [];

    const setup = () => {
      if (mode === "matrix") {
        const colW = 16;
        const cols = Math.max(1, Math.floor(width / colW));
        drops = Array.from({ length: cols }, (_, i) => ({
          x: i * colW + colW / 2,
          y: Math.random() * heightPx,
          vy: 0.35 + Math.random() * 0.9,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          size: 11 + Math.random() * 5,
          alpha: 0.35 + Math.random() * 0.65,
        }));
      } else if (mode === "gravity") {
        particles = Array.from({ length: 90 }, () => ({
          x: Math.random() * width,
          y: Math.random() * heightPx,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 0.8 + Math.random() * 2.2,
        }));
      }
    };
    setup();

    let last = performance.now();
    let t = 0;

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visibleRef.current) {
        last = now;
        return;
      }
      const dt = Math.min(48, now - last) / 16.667;
      last = now;
      t += dt * speed * 0.01;

      if (mode === "matrix") {
        ctx.fillStyle = "rgba(6,6,8,0.16)";
        ctx.fillRect(0, 0, width, heightPx);
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        for (const d of drops) {
          d.y += d.vy * speed * dt * 2.2;
          if (d.y > heightPx + 20) {
            d.y = -20;
            d.x = Math.random() * width;
            d.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          if (Math.random() < 0.06) d.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.font = `${d.size}px monospace`;
          ctx.fillStyle = `rgba(${accentRgb},${d.alpha})`;
          ctx.shadowColor = `rgba(${accentRgb},0.8)`;
          ctx.shadowBlur = 8;
          ctx.fillText(d.char, d.x, d.y);
          ctx.shadowBlur = 0;
        }
      }

      if (mode === "gravity") {
        ctx.fillStyle = "rgba(6,6,8,0.22)";
        ctx.fillRect(0, 0, width, heightPx);
        const cx = width / 2 + Math.cos(t) * width * 0.22;
        const cy = heightPx / 2 + Math.sin(t * 1.3) * heightPx * 0.22;
        for (const p of particles) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.max(60, Math.hypot(dx, dy));
          p.vx += (dx / dist) * 0.05 * speed * dt;
          p.vy += (dy / dist) * 0.05 * speed * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < 0 || p.x > width) p.vx *= -0.9;
          if (p.y < 0 || p.y > heightPx) p.vy *= -0.9;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${accentRgb},${0.2 + Math.min(0.7, 60 / dist)})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
        grad.addColorStop(0, `rgba(${accentRgb},0.32)`);
        grad.addColorStop(1, `rgba(${accentRgb},0)`);
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      if (mode === "aurora") {
        ctx.fillStyle = "#060608";
        ctx.fillRect(0, 0, width, heightPx);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const phase = t * (1 + i * 0.35);
          const amp = heightPx * (0.08 + i * 0.03);
          const baseY = heightPx * (0.45 + i * 0.12);
          ctx.moveTo(0, heightPx);
          for (let x = 0; x <= width; x += 8) {
            const y =
              baseY +
              Math.sin(x * 0.006 + phase) * amp +
              Math.sin(x * 0.013 - phase * 0.7) * amp * 0.5;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, heightPx);
          ctx.closePath();
          const grad = ctx.createLinearGradient(0, baseY - amp, 0, heightPx);
          grad.addColorStop(0, `rgba(${accentRgb},${0.22 - i * 0.05})`);
          grad.addColorStop(1, "rgba(6,6,8,0)");
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode, speed, accent]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ height, width: "100%", display: "block", borderRadius: 12 }}
      aria-label="پیش‌نمایش شیدر"
    />
  );
};

export default EngineShader;
