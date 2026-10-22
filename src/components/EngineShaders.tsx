import React, { useEffect, useRef, useState } from "react";

type Mode = "matrix" | "gravity" | "aurora";

const PERSIAN_GLYPHS = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹".split("");

/**
 * Lightweight 60fps canvas scenes. Paused when off-screen or when the tab is
 * hidden, DPR capped at 2 — keeps the studio smooth on low-end devices.
 */
export const EngineShader: React.FC<{ mode: Mode; speed?: number; accent?: string; height?: number }> = ({
  mode,
  speed = 1,
  accent = "#E8B33A",
  height = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* --------------------------------------------------------------- matrix */
    const columns = Math.max(8, Math.floor(canvas.clientWidth / 16));
    const drops = Array.from({ length: columns }, () => Math.random() * -40);

    /* -------------------------------------------------------------- gravity */
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 0.6 + Math.random() * 1.6,
      a: 0.25 + Math.random() * 0.65,
    }));

    let t = 0;

    const frame = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      t += 0.008 * speed;

      if (mode === "matrix") {
        ctx.fillStyle = "rgba(8,8,10,0.16)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        drops.forEach((y, i) => {
          const x = i * 16 + 8;
          const ch = PERSIAN_GLYPHS[Math.floor(Math.random() * PERSIAN_GLYPHS.length)];
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.85;
          ctx.fillText(ch, x, y * 16);
          ctx.globalAlpha = 0.22;
          ctx.fillText(ch, x, y * 16 - 16);
          drops[i] = y * 16 > h && Math.random() > 0.975 ? 0 : y + 0.6 * speed;
        });
        ctx.globalAlpha = 1;
      } else if (mode === "gravity") {
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        particles.forEach((p) => {
          const dx = cx - p.x * w;
          const dy = cy - p.y * h;
          const dist = Math.hypot(dx, dy) || 1;
          const force = (60 / (dist * 0.6 + 60)) * 0.00009;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.x += p.vx * speed;
          p.y += p.vy * speed;
          if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
            p.x = Math.random();
            p.y = Math.random();
            p.vx = 0;
            p.vy = 0;
          }
          ctx.beginPath();
          ctx.fillStyle = accent;
          ctx.globalAlpha = p.a * 0.8;
          ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 4; i++) {
          const x = w * (0.5 + 0.32 * Math.sin(t * (0.7 + i * 0.23) + i));
          const y = h * (0.5 + 0.3 * Math.cos(t * (0.5 + i * 0.31) + i * 1.7));
          const r = Math.min(w, h) * (0.32 + i * 0.06);
          const grad = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
          grad.addColorStop(0, `${accent}44`);
          grad.addColorStop(0.5, `${accent}12`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode, speed, accent, visible]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#07070A]"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.55))]" />
      <span className="absolute bottom-2 start-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
        {mode} · canvas2d
      </span>
    </div>
  );
};
