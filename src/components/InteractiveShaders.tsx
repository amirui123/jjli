import React, { useEffect, useRef, useState } from "react";
import { toPersianDigits } from "../engines/persianEngines";

/**
 * Interactive 60fps 3D Dot-Matrix Globe (Inspired by Cobe / Vercel Edge Globe)
 * Highlights Iranian tech hubs (Tehran, Isfahan, Shiraz, Tabriz, Mashhad) with glowing arcs & drag inertia.
 */
export const InteractiveCobeGlobe: React.FC<{
  accentHex?: string;
  size?: number;
}> = ({ accentHex = "#06B6D4", size = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCity, setActiveCity] = useState<string>("تهران • ۳۵.۶۸° شمالی");
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const rotationY = useRef(0.65);
  const velocityY = useRef(0.0045);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Generate Fibonacci sphere points
    const numPoints = 460;
    const points: { lat: number; lon: number; isHub?: string }[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numPoints; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      points.push({
        lat: phi - Math.PI / 2,
        lon: theta,
      });
    }

    // Add Iranian & Global Hub markers
    const hubs = [
      { lat: 0.62, lon: 0.9, name: "تهران • ۳۵.۶۸° شمالی" },
      { lat: 0.56, lon: 0.91, name: "اصفهان • ۳۲.۶۵° شمالی" },
      { lat: 0.51, lon: 0.92, name: "شیراز • ۲۹.۵۹° شمالی" },
      { lat: 0.66, lon: 0.81, name: "تبریز • ۳۸.۰۷° شمالی" },
      { lat: 0.63, lon: 1.03, name: "مشهد • ۳۶.۲۶° شمالی" },
    ];

    let animId = 0;
    let tick = 0;

    const render = () => {
      tick += 0.03;
      if (!isDragging.current) {
        rotationY.current += velocityY.current;
        velocityY.current += (0.0045 - velocityY.current) * 0.04;
      }

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.39;

      // Outer atmospheric glow
      const glow = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.65,
        cx,
        cy,
        radius * 1.22
      );
      glow.addColorStop(0, "rgba(99, 102, 241, 0.08)");
      glow.addColorStop(0.6, "rgba(6, 182, 212, 0.14)");
      glow.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // Core dark sphere body
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, "#1E1E28");
      sphereGrad.addColorStop(0.75, "#0B0B10");
      sphereGrad.addColorStop(1, "#060609");
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle rim border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Fibonacci matrix dots
      for (const pt of points) {
        const lon = pt.lon + rotationY.current;
        const x3d = Math.cos(pt.lat) * Math.sin(lon);
        const y3d = Math.sin(pt.lat);
        const z3d = Math.cos(pt.lat) * Math.cos(lon);

        if (z3d > -0.15) {
          const px = cx + x3d * radius;
          const py = cy - y3d * radius;
          const alpha = Math.max(0.08, (z3d + 0.15) * 0.65);
          ctx.fillStyle = `rgba(228, 228, 231, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, z3d > 0.5 ? 1.35 : 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw glowing Iranian hub beacons & connecting arcs
      const visibleHubs: { x: number; y: number; name: string }[] = [];
      for (const hub of hubs) {
        const lon = hub.lon + rotationY.current;
        const x3d = Math.cos(hub.lat) * Math.sin(lon);
        const y3d = Math.sin(hub.lat);
        const z3d = Math.cos(hub.lat) * Math.cos(lon);

        if (z3d > 0.05) {
          const px = cx + x3d * radius;
          const py = cy - y3d * radius;
          visibleHubs.push({ x: px, y: py, name: hub.name });

          // Pulse ring
          const pulseRadius = 3 + ((Math.sin(tick * 2) + 1) * 4.5);
          ctx.strokeStyle = accentHex;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Core beacon dot
          ctx.globalAlpha = 1;
          ctx.fillStyle = accentHex;
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Connect visible hubs with bezier light arcs
      if (visibleHubs.length >= 2) {
        const origin = visibleHubs[0];
        for (let i = 1; i < visibleHubs.length; i++) {
          const target = visibleHubs[i];
          ctx.strokeStyle = accentHex;
          ctx.globalAlpha = 0.38;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          const midX = (origin.x + target.x) / 2;
          const midY = (origin.y + target.y) / 2 - 18;
          ctx.quadraticCurveTo(midX, midY, target.x, target.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [accentHex, size]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          isDragging.current = true;
          lastX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!isDragging.current) return;
          const delta = e.clientX - lastX.current;
          lastX.current = e.clientX;
          rotationY.current += delta * 0.012;
          velocityY.current = delta * 0.002;
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onPointerLeave={() => {
          isDragging.current = false;
        }}
        onClick={() => {
          const cities = [
            "تهران • ۳۵.۶۸° شمالی (نود مرکزی)",
            "اصفهان • ۳۲.۶۵° شمالی (کلاستر شیدر)",
            "شیراز • ۲۹.۵۹° شمالی (موتور WebGL)",
            "تبریز • ۳۸.۰۷° شمالی (پردازنده RTL)",
            "مشهد • ۳۶.۲۶° شمالی (لبه‌ای ۶۰fps)",
          ];
          setActiveCity(cities[Math.floor(Math.random() * cities.length)]);
        }}
      />
      <div className="mt-1 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur-md">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentHex }}
        />
        <span>{toPersianDigits(activeCity)}</span>
        <span className="text-zinc-500">• با ماوس بچرخانید</span>
      </div>
    </div>
  );
};

/**
 * Siri / AI Voice Harmonic Shader Orb (SmoothUI / Effect-UI inspired)
 */
export const SiriShaderOrb: React.FC<{ active?: boolean }> = ({
  active = true,
}) => {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-60 blur-xl transition-transform duration-700 ${
          active ? "scale-110 animate-pulse" : "scale-90 opacity-30"
        }`}
      />
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-zinc-950 shadow-inner">
        <div
          className="absolute -inset-4 animate-spin rounded-full bg-[conic-gradient(from_0deg,#06B6D4,#6366F1,#EC4899,#F59E0B,#06B6D4)] opacity-75 blur-md"
          style={{ animationDuration: active ? "3.2s" : "9s" }}
        />
        <div className="relative z-10 flex items-center gap-1">
          {[0.45, 0.85, 1, 0.7, 0.4].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-white transition-all duration-300"
              style={{
                height: active ? `${Math.round(h * 28)}px` : "6px",
                animation: active
                  ? `pulse ${0.6 + i * 0.15}s ease-in-out infinite alternate`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
