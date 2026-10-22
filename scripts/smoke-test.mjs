import { JSDOM } from "jsdom";
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><head></head><body><div id="root"></div></body></html>`,
  { url: "http://localhost:5173/", pretendToBeVisual: true, runScripts: "outside-only" }
);

const { window } = dom;

// ---- browser shims jsdom lacks -------------------------------------------
window.matchMedia = (query) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });

class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
window.ResizeObserver = Observer;
window.IntersectionObserver = Observer;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLCanvasElement.prototype.getContext = () => null;
Object.defineProperty(window.navigator, "clipboard", {
  value: { writeText: async () => {} },
  configurable: true,
});

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
globalThis.MouseEvent = window.MouseEvent;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.localStorage = window.localStorage;
globalThis.SVGElement = window.SVGElement;
globalThis.AbortController = window.AbortController;
globalThis.AbortSignal = window.AbortSignal;
globalThis.Element = window.Element;
globalThis.HTMLDivElement = window.HTMLDivElement;
globalThis.DOMRect = window.DOMRect;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.PointerEvent = window.PointerEvent || window.MouseEvent;
globalThis.AudioContext = undefined;
globalThis.OfflineAudioContext = undefined;
globalThis.queueMicrotask = queueMicrotask;
process.on("uncaughtException", (e) => {
  console.log("UNCAUGHT:", e && e.message);
});
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

// fetch: serve from dist so lazy pages + asset loaders work
const DIST = path.resolve("dist");
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  const rel = u.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  const candidates = [path.join(DIST, rel), path.join("public", rel)];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      const body = fs.readFileSync(c, "utf8");
      return {
        ok: true,
        status: 200,
        text: async () => body,
        json: async () => JSON.parse(body),
      };
    }
  }
  return { ok: false, status: 404, text: async () => "", json: async () => ({}) };
};
window.fetch = globalThis.fetch;

// --------------------------------------------------------------------------
const result = await build({
  entryPoints: ["src/dev/smoke.tsx"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  jsx: "automatic",
  target: "es2020",
  define: { "process.env.NODE_ENV": '"development"' },
  loader: { ".tsx": "tsx", ".ts": "ts" },
  external: [],
});

const code = result.outputFiles[0].text;
fs.writeFileSync("/tmp/smoke-bundle.mjs", code);
const mod = await import("/tmp/smoke-bundle.mjs?" + Date.now());

const routes = [
  "/", "/dashboard", "/studio/fonts", "/studio/motion",
  "/studio/components", "/studio/sounds", "/studio/skills",
  "/studio/engines", "/studio/ai",
];

const { errors, html, perRoute } = await mod.runSmoke(routes, 420);
for (const r of perRoute) console.log(`  ${r.route.padEnd(22)} ${String(r.len).padStart(5)} chars  | ${r.sample}`);
console.log("HTML length:", html);
if (errors.length) {
  console.log("\n❌ ERRORS (" + errors.length + "):");
  for (const e of errors) console.log(" -", e);
  process.exitCode = 1;
} else {
  console.log("✅ smoke test passed for", routes.length, "routes");
}
