#!/usr/bin/env node
/**
 * نمایش تک‌فایلی: فونت‌های واقعی را به‌صورت base64 داخل یک HTML جاسازی می‌کند
 * تا فایل نهایی بدون هیچ درخواست شبکه‌ای باز شود.
 *
 * ورودی : standalone/template.html
 * خروجی : public/showcase.html  (سرو شده در /showcase.html)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FONTS = {
  __FONT_VAZIR__: "public/fonts/Vazirmatn-Variable.woff2",
  __FONT_MORABBA__: "public/fonts/Morabba-VF.woff",
  __FONT_HASTI__: "public/fonts/Hasti-Heavy.woff",
  __FONT_GANDOM__: "public/fonts/05-editorial-and-international/Gandom-FD.woff2",
  __FONT_AMIRI__: "public/fonts/05-editorial-and-international/Amiri-Regular.woff2",
};

let html = fs.readFileSync(path.join(ROOT, "standalone/template.html"), "utf8");
let injected = 0;

for (const [token, rel] of Object.entries(FONTS)) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.warn(`[standalone] missing font ${rel} — token left empty`);
    html = html.replaceAll(token, "");
    continue;
  }
  const b64 = fs.readFileSync(abs).toString("base64");
  html = html.replaceAll(token, b64);
  injected += 1;
}

if (html.includes("__FONT_")) {
  console.error("[standalone] unresolved font tokens remain — aborting");
  process.exit(1);
}

const out = path.join(ROOT, "public/showcase.html");
fs.writeFileSync(out, html, "utf8");
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`✅ showcase.html: ${kb} KB · ${injected} fonts inlined · zero network requests`);
