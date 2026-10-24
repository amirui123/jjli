import { coveragePct } from "./coverage";
import { PANEL_HEIGHT, PANEL_RADIUS, PANEL_WIDTH } from "./renderer";
import { median } from "./stats";
import { backdropBytes } from "./vram";

export interface HudInfo {
  path: string;
  samples: number;
  ior: number;
  spread: number;
  backdropScale: number;
  /** Backing buffer (VRAM math) — can differ from the CSS size. */
  backingWidth: number;
  backingHeight: number;
  /** CSS size of the stage (coverage percent uses the same unit as the panel dims). */
  stageWidth: number;
  stageHeight: number;
  timerSource: "gpu" | "raf";
}

export interface Hud {
  pushFrame(deltaMs: number): void;
  setGpuSamples(samples: readonly number[]): void;
  setInfo(info: Partial<HudInfo>): void;
  setNote(text: string): void;
  render(force?: boolean): void;
}

const WINDOW = 90;
const REFRESH_MS = 250;

function row(label: string, value: string): string {
  return `<div class="hud-row"><span class="hud-label">${label}</span><span class="hud-value">${value}</span></div>`;
}

function fmt(x: number, digits = 2): string {
  return Number.isFinite(x) ? x.toFixed(digits) : "—";
}

export function createHud(el: HTMLElement): Hud {
  const deltas: number[] = [];
  let gpuSamples: readonly number[] = [];
  let note = "";
  let lastPaint = -Infinity;

  const info: HudInfo = {
    path: "webgl",
    samples: 3,
    ior: 1.52,
    spread: 0.15,
    backdropScale: 1,
    backingWidth: 960,
    backingHeight: 540,
    stageWidth: 960,
    stageHeight: 540,
    timerSource: "raf",
  };

  const paint = (): void => {
    const frameMs = median(deltas);
    const fps = Number.isFinite(frameMs) && frameMs > 0 ? 1000 / frameMs : NaN;
    const gpuMs = gpuSamples.length > 0 ? median(gpuSamples) : NaN;
    const vram = backdropBytes(
      info.backingWidth,
      info.backingHeight,
      info.backdropScale,
    );
    const coverage = coveragePct(
      PANEL_WIDTH,
      PANEL_HEIGHT,
      PANEL_RADIUS,
      info.stageWidth,
      info.stageHeight,
    );

    el.innerHTML =
      row("FPS", fmt(fps, 1)) +
      row("frame ms (median)", fmt(frameMs)) +
      row(
        info.timerSource === "gpu" ? "GPU ms (median)" : "GPU ms (no ext.)",
        info.timerSource === "gpu" ? fmt(gpuMs, 3) : "—",
      ) +
      row("path", info.path) +
      row("dispersion samples", String(info.samples)) +
      row("IOR", fmt(info.ior, 3)) +
      row("spread", fmt(info.spread, 3)) +
      row("backdrop scale", fmt(info.backdropScale, 2)) +
      row("backing buffer", `${info.backingWidth}×${info.backingHeight}`) +
      row("panel coverage", `${fmt(coverage, 2)}%`) +
      row("backdrop VRAM", `${fmt(vram.total / 1048576, 2)} MB`) +
      (note ? `<div class="hud-note">${note}</div>` : "");
  };

  return {
    pushFrame(deltaMs: number): void {
      if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
      deltas.push(deltaMs);
      if (deltas.length > WINDOW) deltas.shift();
    },
    setGpuSamples(samples: readonly number[]): void {
      gpuSamples = samples.slice(-WINDOW);
    },
    setInfo(next: Partial<HudInfo>): void {
      Object.assign(info, next);
    },
    setNote(text: string): void {
      note = text;
      paint();
    },
    render(force = false): void {
      const now = performance.now();
      if (!force && now - lastPaint < REFRESH_MS) return;
      lastPaint = now;
      paint();
    },
  };
}
