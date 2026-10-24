import {
  applyDisplacementMap,
  backdropFilterUrlSyntaxSupported,
  setCssMode,
  type CssMode,
} from "./css-glass";
import type { PanelShape } from "./displacement-map";
import { createHud } from "./hud";
import {
  formatMeasureLine,
  isMeasureMode,
  MeasureAborted,
  runMeasurement,
} from "./measure";
import {
  DEFAULT_BEVEL,
  DEFAULT_DEPTH,
  DEFAULT_IOR,
  DEFAULT_SAMPLES,
  DEFAULT_SCALE,
  DEFAULT_SPREAD,
  DEFAULT_THICKNESS,
  PANEL_HEIGHT,
  PANEL_RADIUS,
  PANEL_WIDTH,
  Renderer,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  type GlassPath,
  type ViewMode,
} from "./renderer";

function need<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`No DOM node: ${selector}`);
  return el;
}

const canvas = need<HTMLCanvasElement>("#scene");
const banner = need<HTMLElement>("#banner");
const badge = need<HTMLElement>("#supportBadge");
const hudRoot = need<HTMLElement>("#hud");
const cssGlass = need<HTMLElement>("#cssGlass");
const toggleButton = need<HTMLButtonElement>("#toggle");
const pathSelect = need<HTMLSelectElement>("#path");
const viewSelect = need<HTMLSelectElement>("#view");
const samplesSelect = need<HTMLSelectElement>("#samples");
const backdropScaleSelect = need<HTMLSelectElement>("#backdropScale");
const scaleSelect = need<HTMLSelectElement>("#scale");
const iorInput = need<HTMLInputElement>("#ior");
const spreadInput = need<HTMLInputElement>("#spread");
const bevelInput = need<HTMLInputElement>("#bevel");
const thicknessInput = need<HTMLInputElement>("#thickness");
const depthInput = need<HTMLInputElement>("#depth");

const supported = backdropFilterUrlSyntaxSupported();
badge.innerHTML = supported
  ? "backdrop-filter <code>url()</code> syntax: <b>supported</b> — this is a syntax check, not a guarantee of behavior."
  : "backdrop-filter <code>url()</code> syntax: <b>not supported</b> — the CSS path applies blur only.";

let renderer: Renderer;
try {
  renderer = new Renderer(canvas);
} catch (error) {
  canvas.remove();
  cssGlass.remove();
  banner.hidden = false;
  banner.textContent = `This browser has no WebGL2, the demo cannot run. (${String(error)})`;
  throw error;
}

const hud = createHud(hudRoot);
hud.setInfo({ timerSource: renderer.timer.available ? "gpu" : "raf" });

canvas.addEventListener(
  "webglcontextlost",
  (event) => {
    event.preventDefault();
    setRunning(false);
    banner.hidden = false;
    banner.textContent = "The WebGL context was lost. Reload the page.";
  },
  false,
);

const shape: PanelShape = {
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
  radius: PANEL_RADIUS,
  bevel: DEFAULT_BEVEL,
  thickness: DEFAULT_THICKNESS,
};

let mapDirty = true;
function refreshDisplacementMap(): void {
  if (!mapDirty) return;
  mapDirty = false;
  applyDisplacementMap(shape);
}

const PATHS: Record<string, { glass: GlassPath; css: CssMode }> = {
  none: { glass: "none", css: "none" },
  webgl: { glass: "webgl", css: "none" },
  "css-blur": { glass: "none", css: "blur" },
  "css-displace": { glass: "none", css: "displace" },
  "css-rgb": { glass: "none", css: "rgb" },
};

let running = true;
let frameId = 0;
let previous = Number.NaN;
let resolutionScale = DEFAULT_SCALE;
let backdropScale = 1;

function resize(): void {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.round(rect.width) || STAGE_WIDTH);
  const cssHeight = Math.max(1, Math.round(rect.height) || STAGE_HEIGHT);
  renderer.resize(
    cssWidth,
    cssHeight,
    window.devicePixelRatio,
    resolutionScale,
  );
  hud.setInfo({
    backingWidth: renderer.backingWidth,
    backingHeight: renderer.backingHeight,
    stageWidth: cssWidth,
    stageHeight: cssHeight,
  });
  mapDirty = true;
}

function loop(now: number): void {
  frameId = requestAnimationFrame(loop);
  if (Number.isFinite(previous)) hud.pushFrame(now - previous);
  previous = now;

  refreshDisplacementMap();
  renderer.renderFrame(now * 0.001);
  renderer.timer.trim(90);
  hud.setGpuSamples(renderer.timer.samplesMs);
  hud.render();
}

function setRunning(next: boolean): void {
  if (next === running) return;
  running = next;
  toggleButton.textContent = running ? "Pause" : "Resume";
  if (running) {
    hud.setNote("");
    previous = Number.NaN;
    frameId = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(frameId);
    hud.setNote("Loop paused — counters frozen.");
  }
}

function syncPath(): void {
  const entry = PATHS[pathSelect.value] ?? PATHS.webgl;
  renderer.setGlassPath(entry.glass);
  setCssMode(cssGlass, entry.css);
  hud.setInfo({ path: pathSelect.value });
}

function wireControls(): void {
  iorInput.value = String(DEFAULT_IOR);
  spreadInput.value = String(DEFAULT_SPREAD);
  bevelInput.value = String(DEFAULT_BEVEL);
  thicknessInput.value = String(DEFAULT_THICKNESS);
  depthInput.value = String(DEFAULT_DEPTH);
  samplesSelect.value = String(DEFAULT_SAMPLES);
  scaleSelect.value = String(DEFAULT_SCALE);

  const out = (id: string, value: string): void => {
    need<HTMLElement>(id).textContent = value;
  };

  pathSelect.addEventListener("change", syncPath);

  viewSelect.addEventListener("change", () => {
    renderer.params.mode = Number(viewSelect.value) as ViewMode;
  });

  samplesSelect.addEventListener("change", () => {
    renderer.params.samples = Number(samplesSelect.value);
    hud.setInfo({ samples: renderer.params.samples });
  });

  iorInput.addEventListener("input", () => {
    renderer.params.ior = Number(iorInput.value);
    hud.setInfo({ ior: renderer.params.ior });
    out("#ior-out", renderer.params.ior.toFixed(2));
  });

  spreadInput.addEventListener("input", () => {
    renderer.params.spread = Number(spreadInput.value);
    hud.setInfo({ spread: renderer.params.spread });
    out("#spread-out", renderer.params.spread.toFixed(3));
  });

  bevelInput.addEventListener("input", () => {
    renderer.params.bevel = Number(bevelInput.value);
    shape.bevel = renderer.params.bevel;
    mapDirty = true;
    out("#bevel-out", bevelInput.value);
  });

  thicknessInput.addEventListener("input", () => {
    renderer.params.thickness = Number(thicknessInput.value);
    shape.thickness = renderer.params.thickness;
    mapDirty = true;
    out("#thickness-out", thicknessInput.value);
  });

  depthInput.addEventListener("input", () => {
    renderer.params.depth = Number(depthInput.value);
    out("#depth-out", depthInput.value);
  });

  backdropScaleSelect.addEventListener("change", () => {
    backdropScale = Number(backdropScaleSelect.value);
    renderer.setBackdropScale(backdropScale);
    hud.setInfo({ backdropScale });
  });

  scaleSelect.addEventListener("change", () => {
    resolutionScale = Number(scaleSelect.value);
    resize();
  });

  toggleButton.addEventListener("click", () => setRunning(!running));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setRunning(false);
  });
  window.addEventListener("resize", resize);
}

if (isMeasureMode(location.search)) {
  document.body.classList.add("measuring");
  toggleButton.disabled = true;
  running = false;
  applyDisplacementMap(shape);
  mapDirty = false;
  hud.setNote("Preparing the deterministic measurement…");

  runMeasurement(renderer, cssGlass, {
    progress(done, total, label) {
      hud.setNote(`measurement: ${done}/${total} — ${label}`);
    },
  })
    .then((result) => {
      console.log(formatMeasureLine(result));
      hud.setInfo({
        path: "measurement done",
        samples: 3,
        ior: 1.52,
        spread: 0.15,
        backdropScale: 1,
        backingWidth: renderer.backingWidth,
        backingHeight: renderer.backingHeight,
        stageWidth: renderer.cssSize.width,
        stageHeight: renderer.cssSize.height,
        timerSource: renderer.timer.available ? "gpu" : "raf",
      });
      const webgl = result.paths.find((p) => p.label === "webgl-glass");
      const css = result.paths.find((p) => p.label === "css-displace");
      hud.setNote(
        `measurement done · WebGL ${webgl?.frameMsMedian.toFixed(2) ?? "—"} ms · ` +
          `CSS displace ${css?.frameMsMedian.toFixed(2) ?? "—"} ms · ` +
          `fringe ${result.fringe.map((f) => f.maxSeparationPx.toFixed(3)).join(" / ")} px · ` +
          `GPU ms/sample ${result.msPerSample.toFixed(4)} (${result.msPerSampleMethod})`,
      );
      hud.render(true);
    })
    .catch((error: unknown) => {
      const reason = error instanceof MeasureAborted ? error.message : "failed";
      console.log(formatMeasureLine({ error: reason }));
      hud.setNote(`measurement aborted: ${reason}`);
    });
} else {
  wireControls();
  syncPath();
  resize();
  hud.setInfo({
    samples: DEFAULT_SAMPLES,
    ior: DEFAULT_IOR,
    spread: DEFAULT_SPREAD,
    backdropScale,
  });
  frameId = requestAnimationFrame(loop);
}
