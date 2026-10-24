import React, { useEffect, useRef, useState } from "react";
import { VERTEX_SHADER, SHADER_PRELUDE, FRAGMENT_MAIN, type ShaderDef } from "../engines/shaderLab";
import { cn } from "../ui/kit";

interface Props {
  def: ShaderDef;
  speed: number;
  scale: number;
  hue: number;
  warp: number;
  grain: number;
  paused?: boolean;
  interactive?: boolean;
  className?: string;
  onError?: (message: string) => void;
}

/** Reads the live accent colour so shaders follow the global theme. */
function accentRgb(): [number, number, number] {
  if (typeof window === "undefined") return [0.91, 0.7, 0.23];
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const hex = raw.replace("#", "");
  if (hex.length !== 6) return [0.91, 0.7, 0.23];
  const n = Number.parseInt(hex, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Real WebGL renderer for the shader lab.
 * - pauses when off-screen or when the tab is hidden (never burns the GPU)
 * - caps DPR for phones
 * - reports compile errors instead of silently showing black
 */
export const ShaderSurface: React.FC<Props> = ({
  def,
  speed,
  scale,
  hue,
  warp,
  grain,
  paused,
  interactive,
  className,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const stateRef = useRef({ speed, scale, hue, warp, grain, paused, interactive });
  const mouseRef = useRef<[number, number]>([0, 0]);
  const accentRef = useRef<[number, number, number]>([0.91, 0.7, 0.23]);

  stateRef.current = { speed, scale, hue, warp, grain, paused, interactive };

  useEffect(() => {
    accentRef.current = accentRgb();
  }, [hue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      const message = "WebGL در این مرورگر در دسترس نیست";
      setFailed(message);
      onError?.(message);
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader) ?? "shader compile error";
        gl.deleteShader(shader);
        throw new Error(log);
      }
      return shader;
    };

    let program: WebGLProgram | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    try {
      vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      fs = compile(gl.FRAGMENT_SHADER, `${SHADER_PRELUDE}\n${def.scene}\n${FRAGMENT_MAIN}`);
      if (!vs || !fs) throw new Error("shader allocation failed");
      program = gl.createProgram();
      if (!program) throw new Error("program allocation failed");
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link error");
      }
    } catch (error) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      const message = error instanceof Error ? error.message : String(error);
      setFailed(message);
      onError?.(message);
      return;
    }

    setFailed(null);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      speed: gl.getUniformLocation(program, "u_speed"),
      scale: gl.getUniformLocation(program, "u_scale"),
      hue: gl.getUniformLocation(program, "u_hue"),
      warp: gl.getUniformLocation(program, "u_warp"),
      grain: gl.getUniformLocation(program, "u_grain"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      accent: gl.getUniformLocation(program, "u_accent"),
    };

    const dprCap = window.matchMedia("(max-width: 767px)").matches ? 1.5 : 2;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    resize();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
    ro?.observe(canvas);

    let visible = true;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.02 })
        : null;
    io?.observe(canvas);

    let raf = 0;
    const started = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const s = stateRef.current;
      if (!visible || s.paused || document.hidden) return;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, (now - started) / 1000);
      gl.uniform1f(u.speed, s.speed);
      gl.uniform1f(u.scale, s.scale);
      gl.uniform1f(u.hue, s.hue);
      gl.uniform1f(u.warp, s.warp);
      gl.uniform1f(u.grain, s.grain);
      gl.uniform2f(u.mouse, mouseRef.current[0], mouseRef.current[1]);
      const [r, g, b] = accentRef.current;
      gl.uniform3f(u.accent, r, g, b);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        ((event.clientY - rect.top) / rect.height - 0.5) * -2,
      ];
    };
    if (interactive) canvas.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      if (buffer) gl.deleteBuffer(buffer);
      gl.useProgram(null);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [def.id, def.scene, interactive, onError]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-[#07070B]", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-label={`پیش‌نمایش زنده شیدر ${def.nameFa}`}
        role="img"
      />
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(120%_120%_at_30%_20%,rgba(var(--accent-glow),0.22),#07070B)] p-4 text-center">
          <span className="text-[11px] text-zinc-300">رندر GLSL ممکن نشد</span>
          <span dir="ltr" className="max-w-full overflow-hidden text-ellipsis font-mono text-[9px] text-zinc-500">
            {failed.slice(0, 140)}
          </span>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
    </div>
  );
};

export default ShaderSurface;
