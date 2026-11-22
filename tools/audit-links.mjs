#!/usr/bin/env node
/**
 * Render-aware link & asset check.
 *
 * linkinator only sees the static index.html of a hash-routed SPA, so it reports
 * 9 links. This tool renders every route in a real browser, harvests every
 * <a href> the app actually produces, then:
 *   • validates in-app hash routes against the router's own route table
 *   • HEAD/GET checks every internal asset the pages request
 *   • reports external links separately (never fetched, so the audit stays
 *     offline-safe, but listed so dead external URLs can be spotted by hand)
 *
 * Output: audit/before/links/links.json
 */
import path from "node:path";
import { chromium } from "playwright-core";
import { getBrowser, PAGES, urlFor, auditDir, writeJSON, INTRO_BYPASS_UA } from "./lib/browser.mjs";

const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const OUT = auditDir("before");
const KNOWN_ROUTES = new Set(PAGES.map((p) => p.path));

const b = await getBrowser();
const browser = await chromium.launch({
  executablePath: b.executablePath,
  args: b.args,
  env: b.env,
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: INTRO_BYPASS_UA,
});

const internalAssets = new Set();
const anchors = [];
const pageAssets = {};

for (const p of PAGES) {
  const page = await ctx.newPage();
  const reqs = new Set();
  page.on("response", (r) => {
    const u = r.url();
    if (u.startsWith(BASE)) reqs.add(new URL(u).pathname + new URL(u).search);
  });
  await page.goto(urlFor(BASE, p), { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(1800);

  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]")).map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim().slice(0, 60),
      aria: a.getAttribute("aria-label") || "",
    }))
  );
  for (const a of found) anchors.push({ page: p.id, ...a });
  pageAssets[p.id] = [...reqs];
  for (const r of reqs) internalAssets.add(r);
  await page.close();
}
await ctx.close();
await browser.close();

// ── classify anchors ───────────────────────────────────────────────────────
const appRoutes = new Set();
const external = new Set();
const hashes = new Set();
const brokenAnchors = [];

for (const a of anchors) {
  const h = a.href ?? "";
  if (!h) continue;
  if (h.startsWith("#/")) {
    appRoutes.add(h.slice(1));
    if (!KNOWN_ROUTES.has(h.slice(1))) brokenAnchors.push({ ...a, reason: "unknown hash route" });
  } else if (h.startsWith("#")) {
    hashes.add(h);
    brokenAnchors.push({ ...a, reason: "same-page hash anchor — breaks hash routing" });
  } else if (/^https?:/i.test(h)) {
    external.add(h);
  } else if (h.startsWith("/")) {
    internalAssets.add(h);
  } else {
    brokenAnchors.push({ ...a, reason: "relative href in a hash-routed app" });
  }
}

// ── HTTP-check every internal asset ────────────────────────────────────────
const results = [];
for (const asset of [...internalAssets].sort()) {
  try {
    const res = await fetch(BASE + asset, { method: "GET" });
    results.push({ asset, status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ asset, status: 0, ok: false, error: String(e.message).slice(0, 120) });
  }
}
const failed = results.filter((r) => !r.ok);

writeJSON(path.join(OUT, "links/links.json"), {
  generatedAt: new Date().toISOString(),
  anchorsFound: anchors.length,
  appRoutesHit: [...appRoutes].sort(),
  samePageHashes: [...hashes],
  externalLinks: [...external].sort(),
  internalAssetsChecked: results.length,
  internalAssetsFailed: failed.length,
  brokenAnchors,
  failedAssets: failed,
  assetsByPage: pageAssets,
});

console.log("anchors found:", anchors.length);
console.log(
  "app hash routes hit:",
  appRoutes.size,
  "| unknown:",
  brokenAnchors.filter((x) => x.reason === "unknown hash route").length
);
console.log("same-page hash anchors (break the router):", hashes.size, [...hashes].slice(0, 5));
console.log("external links:", external.size);
console.log("internal assets checked:", results.length, "| failed:", failed.length);
for (const f of failed.slice(0, 20)) console.log("  ✗", f.status, f.asset);
