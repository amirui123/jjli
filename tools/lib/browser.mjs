/**
 * Shared Chromium runtime for every audit tool.
 *
 * Why this file exists
 * --------------------
 * This sandbox cannot reach Playwright's CDN (`cdn.playwright.dev`), so
 * `playwright install` fails. Instead we extract a statically-built Chromium
 * from the `@sparticuz/chromium` npm package (Lambda-optimised build) and add
 * the two shared libraries it needs (NSS + NSPR) from `.tooling/browser-libs`.
 *
 * `npm run tool:setup` recreates both pieces from scratch on a fresh machine.
 * Everything is local to the repo: nothing is installed globally.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const LIB_DIR = path.join(ROOT, ".tooling/browser-libs");

/** Flags that keep Chromium stable inside a container. */
export const CHROME_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--no-zygote",
  "--font-render-hinting=none",
  "--force-color-profile=srgb",
  "--disable-features=AudioServiceOutOfProcess,Translate",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

let cached = null;

/** Extract Chromium once per process and return everything a launcher needs. */
export async function getBrowser() {
  if (cached) return cached;
  const pkg = await import("@sparticuz/chromium");
  const chromium = pkg.default ?? pkg;
  const executablePath = await chromium.executablePath();

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Chromium binary missing at ${executablePath} — run: npm run tool:setup`);
  }

  // The binary links against libnss3/libnspr4, which Debian slim images omit.
  const missing = ["libnspr4.so", "libnss3.so", "libnssutil3.so", "libsoftokn3.so"].filter(
    (f) => !fs.existsSync(path.join(LIB_DIR, f))
  );
  if (missing.length) {
    throw new Error(`Missing browser libs (${missing.join(", ")}) — run: npm run tool:setup`);
  }

  cached = {
    executablePath,
    args: CHROME_ARGS,
    env: { ...process.env, LD_LIBRARY_PATH: `${LIB_DIR}:${process.env.LD_LIBRARY_PATH ?? ""}` },
  };
  return cached;
}

/**
 * The app shows its 6-act intro film on every full page load, and it has no
 * skip control. `IntroHost` disables that film when the user agent contains
 * "jsdom" (its own automated-smoke escape hatch). We reuse that switch so the
 * audit measures pages, not the film — and we screenshot the film separately.
 */
export const INTRO_BYPASS_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) jsdom Chromium/153 Safari/537.36";

export const PAGES = [
  { id: "home", path: "/" },
  { id: "dashboard", path: "/dashboard" },
  { id: "fonts", path: "/studio/fonts" },
  { id: "motion", path: "/studio/motion" },
  { id: "components", path: "/studio/components" },
  { id: "sounds", path: "/studio/sounds" },
  { id: "skills", path: "/studio/skills" },
  { id: "engines", path: "/studio/engines" },
  { id: "ai", path: "/studio/ai" },
  { id: "notfound", path: "/nope" },
];

/** Hash-router URL for a page. Hash routes never hit the server. */
export const urlFor = (base, p) => `${base.replace(/\/$/, "")}/#${p.path}`;

export function auditDir(phase = "before") {
  const dir = path.join(ROOT, "audit", phase);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** npm bin shim so we never depend on a global install. */
export function bin(name) {
  return path.join(ROOT, "node_modules/.bin", name);
}

export const require_pkg = require;
