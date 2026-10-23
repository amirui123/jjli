#!/usr/bin/env node
/**
 * ساخت نسخهٔ «تک‌فایلی» از خودِ اپلیکیشن (نه نسخهٔ دموی showcase).
 *
 * خروجی: share/rtl-motion-lab-standalone.html
 *   - همهٔ JS و CSS داخل فایل (بدون هیچ chunk جدا)
 *   - هر فایل public/ (فونت‌ها، آرشیوها، vault، دادهٔ هوش مصنوعی) به‌صورت
 *     base64 (متن‌ها gzip شده) داخل فایل
 *   - یک شبیه‌ساز fetch که همان مسیرهای اپ را از حافظه سرو می‌کند، پس روی
 *     file:// هم دقیقاً مثل سایت کار می‌کند
 *   - @font-face ها هنگام بوت از همان داده ساخته می‌شوند تا فونت‌ها دوبار
 *     داخل فایل ذخیره نشوند
 *
 * اجرا: node scripts/build-single-file.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = path.join(ROOT, "share");
const OUT_FILE = path.join(OUT_DIR, "rtl-motion-lab-standalone.html");
const DIST = path.join(ROOT, "dist-single");

const MIME = {
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};
const TEXTUAL = new Set([".json", ".md", ".txt", ".svg", ".css", ".html", ".ts", ".tsx", ".js"]);

const mb = (n) => (n / 1_000_000).toFixed(2) + "MB";
const step = (msg) => console.log("[single] " + msg);

/* ------------------------------------------------------------- 1. vite build */

step("building the app as one bundle (vite.single.config.ts)");
execFileSync(process.execPath, [path.join(ROOT, "node_modules/vite/bin/vite.js"), "build", "--config", "vite.single.config.ts"], {
  cwd: ROOT,
  stdio: "inherit",
});

const distIndex = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const jsFile = distIndex.match(/<script[^>]*src="([^"]+\.js)"[^>]*>/)?.[1];
const cssFile = distIndex.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/)?.[1];
if (!jsFile || !cssFile) throw new Error("could not find the built js/css in dist-single/index.html");

let js = fs.readFileSync(path.join(DIST, jsFile.replace(/^\//, "")), "utf8");
let css = fs.readFileSync(path.join(DIST, cssFile.replace(/^\//, "")), "utf8");
step(`bundle: js ${mb(Buffer.byteLength(js))} · css ${mb(Buffer.byteLength(css))}`);

/* --------------------------------------------------------- 2. font metadata */

const sourceCss = fs.readFileSync(path.join(ROOT, "src/index.css"), "utf8");
const fonts = [];
for (const match of sourceCss.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const body = match[1];
  const family = body.match(/font-family:\s*"([^"]+)"/)?.[1];
  const src = body.match(/url\("(\/fonts\/[^"]+)"\)\s*format\("([^"]+)"\)/);
  if (!family || !src) continue;
  fonts.push({
    family,
    url: src[1],
    format: src[2],
    weight: body.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() ?? "400",
    style: body.match(/font-style:\s*([^;]+);/)?.[1]?.trim() ?? "normal",
    display: body.match(/font-display:\s*([^;]+);/)?.[1]?.trim() ?? "swap",
  });
}
step(`fonts: ${fonts.length} @font-face declarations parsed`);

/* the built bundle must not keep its own @font-face rules (they point at /fonts) */
css = css.replace(/@font-face\s*\{[^}]*\}\s*/g, "");

/* a couple of vendored component snippets contain remote background images;
   Tailwind copied those urls into utility classes. A single-file document must
   never reach the network, so they become a 1×1 transparent pixel. */
const PIXEL = 'url("data:image/gif;base64,R0lGODlhAQABAAAAACw=")';
const remoteUrl = /url\(\s*["']?(?:https?:)?\/\/[^)"']+["']?\s*\)/gi;
const remoteCount = (css.match(remoteUrl) || []).length;
css = css.replace(remoteUrl, PIXEL);
if (remoteCount) step(`neutralised ${remoteCount} remote url() in css`);

/* ------------------------------------------------------- 3. public/ payload */

const assets = {};
let bytesRaw = 0;
let bytesPacked = 0;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

for (const file of walk(path.join(ROOT, "public"))) {
  const rel = "/" + path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");
  /* the demo page is a separate deliverable; embedding it would double the file */
  if (rel === "/showcase.html") continue;
  const ext = path.extname(file).toLowerCase();
  const raw = fs.readFileSync(file);
  const isFont = ext === ".woff" || ext === ".woff2" || ext === ".ttf" || ext === ".otf";
  const mime = MIME[ext] ?? "application/octet-stream";
  if (!isFont && TEXTUAL.has(ext)) {
    const gz = zlib.gzipSync(raw, { level: 9 });
    assets[rel] = ["g", mime, gz.toString("base64")];
    bytesPacked += gz.length;
  } else {
    assets[rel] = ["r", mime, raw.toString("base64")];
    bytesPacked += Math.ceil((raw.length * 4) / 3);
  }
  bytesRaw += raw.length;
}

const missingFonts = fonts.filter((f) => !assets[f.url]);
if (missingFonts.length) {
  throw new Error("fonts referenced by css but missing from public/: " + missingFonts.map((f) => f.url).join(", "));
}
step(`assets: ${Object.keys(assets).length} files · ${mb(bytesRaw)} raw → ${mb(bytesPacked)} embedded`);

/* ----------------------------------------------------------- 4. bootstrap */

const bootstrap = String.raw`
(function () {
  var el = document.getElementById("rtml-assets");
  var RAW = JSON.parse(el.textContent);
  el.textContent = "";
  el.remove();

  var index = Object.create(null);
  for (var key in RAW) index[key] = RAW[key];

  function norm(url) {
    var value = String(url || "");
    if (!value) return "";
    if (value.indexOf("data:") === 0) return "";
    try {
      if (/^[a-z]+:/i.test(value) && !/^file:/i.test(value)) return "";
      var u = new URL(value, location.href);
      var p = decodeURIComponent(u.pathname || "");
      if (!p.startsWith("/")) p = "/" + p;
      return p;
    } catch (e) {
      return "";
    }
  }

  function lookup(p) {
    if (!p) return null;
    if (index[p]) return index[p];
    /* the app builds some paths from ids; tolerate case and __ joins */
    if (index[p.toLowerCase()]) return index[p.toLowerCase()];
    return null;
  }

  function bytesOf(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function inflate(bytes) {
    if (typeof DecompressionStream === "undefined" || typeof ReadableStream === "undefined") {
      return Promise.reject(new Error("DecompressionStream unavailable"));
    }
    /* a hand-built stream keeps this working where Blob#stream is missing */
    var source = new ReadableStream({
      start: function (controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    var stream = source.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).arrayBuffer().then(function (buf) {
      return new Uint8Array(buf);
    });
  }

  function load(p) {
    var entry = lookup(p);
    if (!entry) return Promise.resolve(null);
    var bytes = bytesOf(entry[2]);
    return (entry[0] === "g" ? inflate(bytes) : Promise.resolve(bytes)).then(function (data) {
      return { data: data, mime: entry[1] };
    });
  }

  var native = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || String(input);
    var p = norm(url);
    if (p && lookup(p)) {
      return load(p).then(function (hit) {
        if (!hit) return new Response("", { status: 404 });
        return new Response(hit.data, {
          status: 200,
          headers: { "Content-Type": hit.mime, "Content-Length": String(hit.data.length) },
        });
      });
    }
    if (/^(https?|blob|data):/i.test(url) && native) return native(input, init);
    if (/^file:/i.test(url) && p) return Promise.resolve(new Response("", { status: 404 }));
    return native ? native(input, init) : Promise.resolve(new Response("", { status: 404 }));
  };

  /* fonts: one @font-face per file, built from the same bytes the fetch shim serves */
  var FONTS = __FONTS__;
  var rules = [];
  for (var f = 0; f < FONTS.length; f++) {
    var font = FONTS[f];
    var entry = index[font.u];
    if (!entry) continue;
    rules.push(
      '@font-face{font-family:"' + font.f + '";src:url("data:' + entry[1] + ";base64," + entry[2] +
        '") format("' + font.t + '");font-weight:' + font.w + ";font-style:" + font.s +
        ";font-display:" + font.d + "}"
    );
  }
  var style = document.createElement("style");
  style.setAttribute("data-rtml-fonts", "");
  style.textContent = rules.join("");
  document.head.appendChild(style);

  window.__RTML_SINGLE_FILE__ = {
    assets: Object.keys(RAW).length,
    fonts: rules.length,
    norm: norm,
    has: function (p) { return Boolean(lookup(norm(p))); },
  };
})();
`;

const fontManifest = fonts.map((f) => ({
  f: f.family,
  u: f.url,
  t: f.format,
  w: f.weight,
  s: f.style,
  d: f.display,
}));

const bootstrapCode =
  "var __RTML_FONT_MANIFEST__ = " +
  JSON.stringify(fontManifest) +
  ";\n" +
  bootstrap.replace("__FONTS__", "__RTML_FONT_MANIFEST__");

/* --------------------------------------------------------------- 5. markup */

const favicon = assets["/favicon.svg"];
const faviconHref = favicon
  ? "data:image/svg+xml;base64," + favicon[2]
  : "";

const escapedJs = js.replace(/<\/script/gi, "<\\/script");
const escapedCss = css.replace(/<\/style/gi, "<\\/style");
const assetsJson = JSON.stringify(assets).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="fa" dir="rtl" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>آزمایشگاه موشن فارسی | RTL Motion Lab</title>
    <meta
      name="description"
      content="آزمایشگاه موشن فارسی: استودیوهای مستقل تایپوگرافی، فیزیک حرکت، کامپوننت‌های متن‌باز، افکت صوتی و موتورهای فین‌تک ایران. این فایل کامل و آفلاین است."
    />
    <meta name="theme-color" content="#08080A" />
${faviconHref ? `    <link rel="icon" type="image/svg+xml" href="${faviconHref}" />\n    <link rel="apple-touch-icon" href="${faviconHref}" />` : ""}
    <style>
      html { background: #08080a; color-scheme: dark; }
      body { margin: 0; background: #08080a; }
      #boot {
        position: fixed; inset: 0; display: grid; place-items: center;
        background: #08080a; z-index: 100;
        transition: opacity .35s ease;
      }
      #boot span {
        font-family: "Vazirmatn", system-ui, sans-serif; color: #5b5b63; font-size: 12px;
        animation: bootpulse 1.4s ease-in-out infinite;
      }
      @keyframes bootpulse { 0%,100%{opacity:.35} 50%{opacity:.9} }
    </style>
    <style>${escapedCss}</style>
  </head>
  <body class="bg-[#08080A] text-[#FAFAFA] antialiased overflow-x-hidden">
    <div id="root"></div>
    <noscript>
      <div style="max-width: 32rem; margin: 18vh auto; padding: 0 1.5rem; text-align: center; font-family: system-ui, sans-serif">
        <p style="color: #FAFAFA; font-size: 16px; line-height: 1.9">
          آزمایشگاه موشن فارسی برای اجرا به جاوااسکریپت نیاز دارد. لطفاً آن را فعال کنید و صفحه را دوباره باز کنید.
        </p>
      </div>
    </noscript>
    <div id="boot"><span>آزمایشگاه موشن فارسی</span></div>
    <script type="application/json" id="rtml-assets">${assetsJson}</script>
    <script>${bootstrapCode}</script>
    <script>${escapedJs}</script>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
step(`wrote ${path.relative(ROOT, OUT_FILE)} · ${mb(Buffer.byteLength(html))}`);
