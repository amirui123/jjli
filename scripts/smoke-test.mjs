#!/usr/bin/env node
/**
 * Real-DOM smoke test: bundles the app with esbuild, mounts it in jsdom and
 * walks every route, collecting console errors, crashes and empty renders.
 * Also asserts that two critical interactions actually mutate the DOM.
 */
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><body><div id="root"></div></body></html>`,
  { url: "http://localhost:5173/", pretendToBeVisual: true }
);
const { window } = dom;

// ---------------------------------------------------------------- jsdom gaps
// viewport shim: enough of matchMedia for the 1200px studio breakpoint
let VIEWPORT_WIDTH = 1440;
const evalQuery = (query) => {
  const min = /min-width:\s*(\d+)px/.exec(query);
  const max = /max-width:\s*(\d+)px/.exec(query);
  if (min && VIEWPORT_WIDTH < Number(min[1])) return false;
  if (max && VIEWPORT_WIDTH > Number(max[1])) return false;
  return true;
};
window.matchMedia = (query) => ({
  matches: evalQuery(query),
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false; },
});
class Obs {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
window.ResizeObserver = Obs;
window.IntersectionObserver = Obs;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === "2d") {
    return new Proxy({}, {
      get: (t, k) => {
        if (k === "canvas") return this;
        if (k === "createLinearGradient" || k === "createRadialGradient")
          return () => ({ addColorStop() {} });
        if (k === "getImageData") return () => ({ data: new Uint8ClampedArray(4) });
        if (k === "measureText") return () => ({ width: 10 });
        return () => {};
      },
      set: () => true,
    });
  }
  return null;
};
Object.defineProperty(window.navigator, "clipboard", {
  value: { writeText: async () => {} },
  configurable: true,
});

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.SVGElement = window.SVGElement;
globalThis.HTMLDivElement = window.HTMLDivElement;
globalThis.DOMRect = window.DOMRect;
globalThis.AbortController = window.AbortController;
globalThis.AbortSignal = window.AbortSignal;
globalThis.Event = window.Event;
globalThis.MouseEvent = window.MouseEvent;
globalThis.CustomEvent = window.CustomEvent;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = (cb) => window.setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
globalThis.ResizeObserver = Obs;
globalThis.IntersectionObserver = Obs;
globalThis.localStorage = window.localStorage;

// ---- static file fetch shim: serve /public assets out of dist ---------------
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (/^https?:/i.test(url)) return nativeFetch(url, init);
  const clean = url.replace(/^\/+/, "").split("?")[0];
  const candidates = [`dist/${clean}`, `public/${clean}`, clean];
  for (const file of candidates) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const body = fs.readFileSync(file, "utf8");
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
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

const errors = [];
const origError = console.error;
console.error = (...args) => {
  const msg = args.map((a) => (a && a.message) || String(a)).join(" ");
  if (/not implemented|Not implemented|Warning: ReactDOMServer/.test(msg)) return;
  errors.push(msg.slice(0, 300));
};
process.on("uncaughtException", (e) => { errors.push(`UNCAUGHT: ${e?.stack ?? e?.message}`); });
process.on("unhandledRejection", (e) => { errors.push(`REJECTION: ${e?.stack ?? e?.message ?? e}`); });

// ------------------------------------------------------------------- bundle
const out = await build({
  entryPoints: ["src/dev/smoke.tsx"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  jsx: "automatic",
  target: "es2022",
  define: { "process.env.NODE_ENV": '"development"' },
  loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css" },
  logLevel: "error",
});
fs.mkdirSync(".smoke", { recursive: true });
fs.writeFileSync(".smoke/bundle.mjs", out.outputFiles[0].text);
const mod = await import(`../.smoke/bundle.mjs?t=${Date.now()}`);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  ["/", "خانه"],
  ["/dashboard", "داشبورد"],
  ["/studio/fonts", "فونت"],
  ["/studio/motion", "موشن"],
  ["/studio/components", "کامپوننت"],
  ["/studio/sounds", "صدا"],
  ["/studio/skills", "اسکیل"],
  ["/studio/engines", "موتور"],
  ["/studio/ai", "هوش مصنوعی"],
  ["/nope", "۴۰۴"],
];

try { mod.mount(); } catch (e) { errors.push(`MOUNT: ${e?.stack}`); }
await wait(500);
console.log("mounted. text len:", mod.text().length);

const rows = [];
for (const [path, label] of ROUTES) {
  mod.setHash(`#${path}`);
  await wait(650);
  const t = mod.text();
  rows.push({ path, label, len: t.length, head: t.slice(0, 70) });
  if (t.length < 80) errors.push(`EMPTY ${path}: only ${t.length} chars`);
}

// interaction 1: font switch changes the specimen
mod.setHash("#/studio/fonts");
await wait(500);
const before = document.querySelector("[data-testid=font-specimen]")?.getAttribute("style") ?? "";
const fontBtn = document.querySelectorAll("[data-font-id]")[3];
if (!fontBtn) errors.push("FONT: no [data-font-id] buttons found");
else {
  fontBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(300);
  const after = document.querySelector("[data-testid=font-specimen]")?.getAttribute("style") ?? "";
  if (before === after) errors.push("FONT: speciment style did not change on font switch");
}

// studio layout: every studio must expose the three rails
for (const studio of ["fonts", "motion", "components", "sounds", "skills", "engines", "ai"]) {
  mod.setHash(`#/studio/${studio}`);
  await wait(450);
  const main = document.querySelector("main");
  const rails = main?.querySelectorAll("[data-rail]").length ?? 0;
  if (rails !== 3) errors.push(`RAILS ${studio}: expected 3 rails, found ${rails}`);
  if (main && main.textContent.trim().length < 200) errors.push(`RAILS ${studio}: stage content is empty`);
}

// interaction 2: component file opens real source
mod.setHash("#/studio/components");
await wait(600);
const fileBtn = document.querySelectorAll("[data-file-row]")[2];
if (!fileBtn) errors.push("COMPONENTS: no [data-file-row] rows found");
else {
  fileBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(900);
  const code = document.querySelector("[data-testid=code-panel]")?.textContent ?? "";
  if (code.length < 200) {
    errors.push(`COMPONENTS: code panel too small (${code.length})`);
    console.log("DEBUG rows:", document.querySelectorAll("[data-file-row]").length);
    console.log("DEBUG stage:", (document.querySelector("main")?.textContent ?? "").slice(600, 2200));
    const r = await fetch("/regcode/chunks/animate-ui/0.json");
    console.log("DEBUG fetch ok:", r.ok, "rows:", document.querySelectorAll("[data-file-row]").length);
  }
}

// interaction 3: a featured font on the landing page must pre-select the studio
mod.setHash("#/");
await wait(600);
const featuredBtn = [...document.querySelectorAll("main button")].find((b) =>
  (b.textContent || "").includes("هستی")
);
if (!featuredBtn) errors.push("DEEPLINK: featured font tile not found on the landing page");
else {
  featuredBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(700);
  const specimen = document.querySelector("[data-testid=font-specimen]");
  const style = specimen?.getAttribute("style") ?? "";
  if (!/Hasti/i.test(style)) errors.push(`DEEPLINK: specimen did not pick Hasti (${style.slice(0, 60)})`);
}

// interaction 4: accent choice must reach the CSS custom properties
mod.setHash("#/dashboard");
await wait(400);
const accentButton = [...document.querySelectorAll("button")].find(
  (b) => b.getAttribute("aria-label") === "رنگ پلتفرم"
);
if (!accentButton) errors.push("THEME: accent picker button missing");
else {
  accentButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(200);
  const turquoise = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("فیروزه")
  );
  if (!turquoise) errors.push("THEME: accent option فیروزه missing");
  else {
    turquoise.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await wait(250);
    const applied = document.documentElement.style.getPropertyValue("--accent").toLowerCase();
    if (applied !== "#2dd4bf") errors.push(`THEME: --accent not applied (${applied || "empty"})`);
    const saffron = [...document.querySelectorAll("button")].find(
      (b) => b.getAttribute("aria-label") === "رنگ پلتفرم"
    );
    saffron?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await wait(150);
    const back = [...document.querySelectorAll("button")].find((b) =>
      (b.textContent || "").includes("زعفران")
    );
    back?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await wait(200);
  }
}

// ---------------------------------------------------------------- mobile tabs
mod.setHash("#/studio/fonts");
await wait(600);
const tabBar = document.querySelector('nav[aria-label="پنل‌های استودیو"]');
if (!tabBar) errors.push("MOBILE: studio tab bar missing");
else {
  const buttons = [...tabBar.querySelectorAll("button")];
  if (buttons.length !== 3) errors.push(`MOBILE: expected 3 tabs, found ${buttons.length}`);
  const visibleRail = () =>
    [...document.querySelectorAll("[data-rail]")].filter(
      (el) => !el.className.split(/\s+/).includes("hidden")
    ).length;
  if (visibleRail() !== 1) errors.push(`MOBILE: expected 1 visible rail, found ${visibleRail()}`);
  const settingsTab = buttons[1];
  settingsTab?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const settingsRail = document.querySelector('[data-rail="settings"]');
  if (!settingsRail || settingsRail.className.split(/\s+/).includes("hidden")) {
    errors.push("MOBILE: settings tab did not reveal the settings rail");
  }
  if (visibleRail() !== 1) errors.push(`MOBILE: settings tab left ${visibleRail()} rails visible`);
  buttons[0]?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(200);
}

// mobile: choosing a list row must jump to the preview it just changed
VIEWPORT_WIDTH = 390;
mod.setHash("#/studio/fonts");
await wait(700);
const tabs = [...document.querySelectorAll('nav[aria-label="پنل‌های استودیو"] button')];
tabs[2]?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); // list
await wait(250);
let listRail = document.querySelector('[data-rail="list"]');
if (!listRail || listRail.className.split(/\s+/).includes("hidden")) {
  errors.push("MOBILE: list tab did not reveal the list rail");
}
const row = document.querySelector("[data-font-id]");
row?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await wait(350);
const stageRail = document.querySelector('[data-rail="stage"]');
if (!stageRail || stageRail.className.split(/\s+/).includes("hidden")) {
  errors.push("MOBILE: choosing a font did not return to the preview panel");
}
VIEWPORT_WIDTH = 1440;

// ------------------------------------------------------------ a11y sanity pass
for (const [path] of ROUTES) {
  mod.setHash(`#${path}`);
  await wait(320);
  const h1s = document.querySelectorAll("main h1").length;
  if (h1s !== 1) errors.push(`A11Y ${path}: expected exactly one h1, found ${h1s}`);
  const nameless = [...document.querySelectorAll("main button")].filter((b) => {
    const label = (b.getAttribute("aria-label") || b.textContent || "").trim();
    return label.length === 0;
  });
  if (nameless.length) errors.push(`A11Y ${path}: ${nameless.length} button(s) without a name`);
}

// dock must expose every section with a real label on every screen size
const dock = document.querySelector('nav[aria-label="ناوبری بخش‌ها"]');
if (!dock) errors.push("DOCK: navigation dock missing");
else {
  const items = [...dock.querySelectorAll("button")];
  if (items.length !== 9) errors.push(`DOCK: expected 9 sections, found ${items.length}`);
  const anonymous = items.filter((b) => !(b.getAttribute("aria-label") || "").trim());
  if (anonymous.length) errors.push(`DOCK: ${anonymous.length} section(s) without aria-label`);
}

console.error = origError;
const pad = (s, n) => String(s).padEnd(n);
console.log("\n" + pad("مسیر", 22) + pad("طول", 8) + "نمونه");
for (const r of rows) console.log(pad(r.path, 22) + pad(r.len, 8) + r.head);

if (errors.length) {
  console.log(`\n❌ ${errors.length} خطا:`);
  for (const e of errors) console.log(" •", e);
  process.exitCode = 1;
} else {
  console.log(`\n✅ ${rows.length} مسیر بدون خطا رندر شد`);
}
