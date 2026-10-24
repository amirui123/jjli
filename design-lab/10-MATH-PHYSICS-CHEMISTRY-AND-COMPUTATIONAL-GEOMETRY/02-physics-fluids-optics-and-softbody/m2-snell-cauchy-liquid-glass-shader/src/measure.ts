// measure.ts — the `?measure=1` deterministic measurement mode.
// Fixed backing buffer, fixed time step, interaction off. At the end, ONE line
// on the console: MEASURE {...}

import { setCssMode, backdropFilterUrlSyntaxSupported } from "./css-glass";
import { coveragePct } from "./coverage";
import { maxFringePx, FRINGE_SCALE_PX } from "./fringe";
import {
  MODE_FRINGE,
  MODE_GLASS,
  PANEL_HEIGHT,
  PANEL_RADIUS,
  PANEL_WIDTH,
  type Renderer,
} from "./renderer";
import { median, percentile } from "./stats";
import { backdropBytes } from "./vram";

export const MEASURE_WIDTH = 960;
export const MEASURE_HEIGHT = 540;
export const WARMUP_FRAMES = 30;
export const SAMPLE_FRAMES = 180;
/** Physical reference: abbeSpread(1.5168, 64.17) ≈ 0.00805 */
export const PHYSICAL_SPREAD = 0.00805;
export const ART_SPREAD = 0.15;

export interface FrameStats {
  frameMsMedian: number;
  frameMsP95: number;
  droppedFrames: number;
}

/** Any frame longer than 1.5× the vsync interval counts as "dropped". */
export function frameStats(
  deltas: readonly number[],
  vsyncMs = 16.67,
): FrameStats {
  return {
    frameMsMedian: median(deltas),
    frameMsP95: percentile(deltas, 95),
    droppedFrames: deltas.filter((d) => d > vsyncMs * 1.5).length,
  };
}

/**
 * A vsync-bound row is useless for comparison; instead of hiding it, we flag it.
 * The threshold does not assume 60 Hz: the display's real frame period is measured
 * at the start of the run with an empty rAF window (at 120 Hz the ceiling is 8.3 ms).
 */
export function isVsyncBound(frameMsMedian: number, vsyncMs: number): boolean {
  return Number.isFinite(frameMsMedian) && frameMsMedian <= vsyncMs * 1.15;
}

export function isMeasureMode(search: string): boolean {
  return new URLSearchParams(search).get("measure") === "1";
}

export interface DispersionPoint {
  samples: number;
  texelFetches: number;
  gpuMsMedian: number | null;
  frameMsMedian: number;
  vsyncBound: boolean;
}

export interface BackdropScalePoint {
  scale: number;
  gpuMsMedian: number | null;
  frameMsMedian: number;
  vsyncBound: boolean;
  vramBytes: number;
}

export interface FringePoint {
  spread: number;
  maxSeparationPx: number;
}

export interface PathPoint {
  label: string;
  frameMsMedian: number;
  frameMsP95: number;
  droppedFrames: number;
  gpuMsMedian: number | null;
  vsyncBound: boolean;
  gpuMsNote?: string;
}

export interface MeasureResult {
  version: number;
  userAgent: string;
  dpr: number;
  backing: { w: number; h: number };
  /** Measured display frame period; the vsyncBound threshold comes from here. */
  vsyncMs: number;
  timerExt: boolean;
  cssFilterUrlSyntaxSupported: boolean;
  panel: { w: number; h: number; radius: number; coveragePct: number };
  dispersion: DispersionPoint[];
  msPerSample: number;
  msPerSampleMethod: "gpu" | "frame";
  backdropScale: BackdropScalePoint[];
  fringe: FringePoint[];
  fringeQuantizationPx: number;
  paths: PathPoint[];
}

export class MeasureAborted extends Error {}

export interface MeasureHooks {
  progress(done: number, total: number, label: string): void;
}

const TOTAL_RUNS = 13;

function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function assertVisible(): void {
  // rAF is throttled in a hidden tab; the measurement is garbage. Abort, don't invent.
  if (document.visibilityState !== "visible") {
    throw new MeasureAborted("hidden");
  }
}

function round(x: number, digits: number): number {
  if (!Number.isFinite(x)) return 0;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}

interface RunWindow {
  stats: FrameStats;
  gpuMsMedian: number | null;
}

/**
 * The display's real frame period. Assuming 60 Hz would mark every row pinned to
 * the ceiling on a 120 Hz display as "not bound".
 */
async function measureRefreshMs(): Promise<number> {
  const deltas: number[] = [];
  let previous = Number.NaN;
  for (let f = 0; f < 60; f++) {
    const now = await nextFrame();
    assertVisible();
    if (Number.isFinite(previous)) deltas.push(now - previous);
    previous = now;
  }
  const m = median(deltas);
  return Number.isFinite(m) && m > 0 ? m : 16.67;
}

/** Runs one configuration with a fixed time step and collects rAF and GPU samples. */
async function collect(
  renderer: Renderer,
  vsyncMs: number,
): Promise<RunWindow> {
  const deltas: number[] = [];
  let previous = Number.NaN;

  for (let f = 0; f < WARMUP_FRAMES + SAMPLE_FRAMES; f++) {
    const now = await nextFrame();
    assertVisible();
    renderer.renderFrame(f / 60); // fixed time step: performance.now() is not driving it
    if (f === WARMUP_FRAMES) renderer.timer.reset();
    if (f >= WARMUP_FRAMES && Number.isFinite(previous)) {
      deltas.push(now - previous);
    }
    previous = now;
  }

  const gpu = renderer.timer.samplesMs;
  return {
    stats: frameStats(deltas, vsyncMs),
    gpuMsMedian: gpu.length > 0 ? median(gpu) : null,
  };
}

async function measureFringe(
  renderer: Renderer,
  spread: number,
): Promise<FringePoint> {
  renderer.params.mode = MODE_FRINGE;
  renderer.params.spread = spread;
  for (let f = 0; f < 3; f++) {
    await nextFrame();
    assertVisible();
    renderer.renderFrame(f / 60);
  }
  const pixels = renderer.readFringe();
  return { spread, maxSeparationPx: round(maxFringePx(pixels), 4) };
}

export async function runMeasurement(
  renderer: Renderer,
  glassElement: HTMLElement,
  hooks: MeasureHooks,
): Promise<MeasureResult> {
  renderer.setFixedSize(MEASURE_WIDTH, MEASURE_HEIGHT);
  renderer.setBackdropScale(1);
  renderer.setGlassPath("webgl");
  setCssMode(glassElement, "none");
  renderer.params.mode = MODE_GLASS;
  renderer.params.ior = 1.52;
  renderer.params.spread = ART_SPREAD;
  renderer.params.samples = 3;

  const vsyncMs = await measureRefreshMs();

  let done = 0;
  const tick = (label: string): void => {
    done++;
    hooks.progress(done, TOTAL_RUNS, label);
  };

  // ——— Phase A: dispersion sample sweep ———
  const dispersion: DispersionPoint[] = [];
  for (const samples of [1, 3, 8]) {
    renderer.params.samples = samples;
    const w = await collect(renderer, vsyncMs);
    dispersion.push({
      samples,
      texelFetches: samples,
      gpuMsMedian: w.gpuMsMedian === null ? null : round(w.gpuMsMedian, 4),
      frameMsMedian: round(w.stats.frameMsMedian, 4),
      vsyncBound: isVsyncBound(w.stats.frameMsMedian, vsyncMs),
    });
    tick(`dispersion ${samples}`);
  }

  const at = (n: number): DispersionPoint | undefined =>
    dispersion.find((p) => p.samples === n);
  const one = at(1);
  const eight = at(8);
  const useGpu = one?.gpuMsMedian != null && eight?.gpuMsMedian != null;
  const lo = useGpu ? one!.gpuMsMedian! : (one?.frameMsMedian ?? Number.NaN);
  const hi = useGpu
    ? eight!.gpuMsMedian!
    : (eight?.frameMsMedian ?? Number.NaN);
  const msPerSample = (hi - lo) / 7;

  // ——— Phase B: backdrop texture scale sweep ———
  renderer.params.samples = 3;
  const backdropScale: BackdropScalePoint[] = [];
  for (const scale of [1, 0.5, 0.25]) {
    renderer.setBackdropScale(scale);
    const w = await collect(renderer, vsyncMs);
    backdropScale.push({
      scale,
      gpuMsMedian: w.gpuMsMedian === null ? null : round(w.gpuMsMedian, 4),
      frameMsMedian: round(w.stats.frameMsMedian, 4),
      vsyncBound: isVsyncBound(w.stats.frameMsMedian, vsyncMs),
      vramBytes: backdropBytes(MEASURE_WIDTH, MEASURE_HEIGHT, scale).total,
    });
    tick(`backdrop scale ${scale}`);
  }
  renderer.setBackdropScale(1);

  // ——— Phase C: fringe measurement (readPixels) ———
  const fringe: FringePoint[] = [];
  for (const spread of [PHYSICAL_SPREAD, ART_SPREAD]) {
    fringe.push(await measureFringe(renderer, spread));
    tick(`fringe ${spread}`);
  }
  renderer.params.mode = MODE_GLASS;
  renderer.params.spread = ART_SPREAD;

  // ——— Phase D: five-path comparison ———
  const paths: PathPoint[] = [];
  const setups = [
    { label: "baseline", webgl: false, css: "none" },
    { label: "webgl-glass", webgl: true, css: "none" },
    { label: "css-blur", webgl: false, css: "blur" },
    { label: "css-displace", webgl: false, css: "displace" },
    { label: "css-rgb", webgl: false, css: "rgb" },
  ] as const;

  for (const setup of setups) {
    renderer.setGlassPath(setup.webgl ? "webgl" : "none");
    setCssMode(glassElement, setup.css);
    const w = await collect(renderer, vsyncMs);
    const cssRow = setup.css !== "none";
    paths.push({
      label: setup.label,
      frameMsMedian: round(w.stats.frameMsMedian, 4),
      frameMsP95: round(w.stats.frameMsP95, 4),
      droppedFrames: w.stats.droppedFrames,
      // NO GPU clock on the CSS rows: the filter runs in the compositor.
      gpuMsMedian:
        cssRow || w.gpuMsMedian === null ? null : round(w.gpuMsMedian, 4),
      vsyncBound: isVsyncBound(w.stats.frameMsMedian, vsyncMs),
      ...(cssRow ? { gpuMsNote: "compositor — not measurable" } : {}),
    });
    tick(`path ${setup.label}`);
  }
  setCssMode(glassElement, "none");

  return {
    version: 1,
    userAgent: navigator.userAgent,
    dpr: window.devicePixelRatio,
    backing: { w: MEASURE_WIDTH, h: MEASURE_HEIGHT },
    vsyncMs: round(vsyncMs, 3),
    timerExt: renderer.timer.available,
    cssFilterUrlSyntaxSupported: backdropFilterUrlSyntaxSupported(),
    panel: {
      w: PANEL_WIDTH,
      h: PANEL_HEIGHT,
      radius: PANEL_RADIUS,
      coveragePct: round(
        coveragePct(
          PANEL_WIDTH,
          PANEL_HEIGHT,
          PANEL_RADIUS,
          MEASURE_WIDTH,
          MEASURE_HEIGHT,
        ),
        2,
      ),
    },
    dispersion,
    msPerSample: round(msPerSample, 5),
    msPerSampleMethod: useGpu ? "gpu" : "frame",
    backdropScale,
    fringe,
    fringeQuantizationPx: round(FRINGE_SCALE_PX / 255, 4),
    paths,
  };
}

export function formatMeasureLine(
  result: MeasureResult | { error: string },
): string {
  return `MEASURE ${JSON.stringify(result)}`;
}
