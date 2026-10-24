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
  glyphText?: string;
  glyphFont?: string;
  className?: string;
  onError?: (message: string) => void;
}

const DEFAULT_PERSIAN_GLYPHS: readonly string[] = [
  // 0..31: 32 Persian letters
  "آ", "ب", "پ", "ت", "ث", "ج", "چ", "ح",
  "خ", "د", "ذ", "ر", "ز", "ژ", "س", "ش",
  "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ک", "گ", "ل", "م", "ن", "و", "ه", "ی",
  // 32..41: 10 Persian digits
  "۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹",
  // 42..55: 14 Persian calligraphic & hacker short words/ligatures
  "نور", "خط", "جان", "کد", "رمز", "حق", "هو",
  "لا", "موج", "شب", "صفر", "یک", "مرز", "روح",
  // 56..63: 8 Cyber / Hacker terminal symbols
  "⌘", "✦", "⚡", "◈", "∆", "Ω", "∑", "∞",
];

/**
 * Generates an 8x8 (64-cell, 512x512) high-contrast glyph texture atlas
 * containing real Persian letters, digits, words, and optional user text.
 */
function buildPersianGlyphAtlas(customText?: string, fontFamily = '"Vazirmatn", "Hasti", sans-serif'): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 512, 512);

  // Extract custom tokens/graphemes if user provided custom text
  const customTokens: string[] = [];
  if (customText && customText.trim().length > 0) {
    const cleaned = customText.trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (w.length <= 4) customTokens.push(w);
    }
    for (const ch of Array.from(cleaned)) {
      if (ch.trim() && ch !== "‌") customTokens.push(ch);
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 64; i++) {
    const col = i % 8;
    const row = Math.floor(i / 8);
    const cx = col * 64 + 32;
    const cy = row * 64 + 34;

    let token = DEFAULT_PERSIAN_GLYPHS[i] ?? "نور";
    if (customTokens.length > 0 && i % 2 === 0) {
      token = customTokens[(i / 2) % customTokens.length] ?? token;
    }

    const isWord = token.length > 1;
    const fontSize = isWord ? (token.length > 2 ? 22 : 28) : 38;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;

    // Soft bloom halo in green/blue + crisp core in red/white
    ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(token, cx, cy);

    ctx.shadowBlur = 0;
    ctx.fillText(token, cx, cy);
  }

  return canvas;
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
 * - Binds a real 8x8 Persian Glyph Atlas texture (`u_glyphTex`) to TEXTURE0
 * - Pauses when off-screen or when the tab is hidden (never burns the GPU)
 * - Caps DPR for phones
 * - Reports compile errors instead of silently showing black
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
  glyphText,
  glyphFont,
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

    // Build and upload the 8x8 Persian Glyph Texture Atlas to TEXTURE0
    const glyphTexture = gl.createTexture();
    const atlasCanvas = buildPersianGlyphAtlas(glyphText, glyphFont);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);

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
      glyphTex: gl.getUniformLocation(program, "u_glyphTex"),
    };

    if (u.glyphTex !== null) {
      gl.uniform1i(u.glyphTex, 0);
    }

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
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
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
      gl.bindTexture(gl.TEXTURE_2D, null);
      if (glyphTexture) gl.deleteTexture(glyphTexture);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      if (buffer) gl.deleteBuffer(buffer);
      gl.useProgram(null);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [def.id, def.scene, interactive, glyphText, glyphFont, onError]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-[#07070B]", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-label={`پیش‌نمایش زنده شیدر ${def.nameFa}`}
      />
      {failed && (
        <div
          dir="ltr"
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center font-mono text-[11px] text-rose-300"
        >
          <div className="mb-1 text-xs font-bold">Shader compile error</div>
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap text-[10px] text-zinc-400">
            {failed}
          </pre>
        </div>
      )}
    </div>
  );
};
