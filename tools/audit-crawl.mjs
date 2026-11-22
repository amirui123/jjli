#!/usr/bin/env node
/**
 * Playwright crawl: every page × every viewport, collecting
 *   • console errors/warnings and uncaught exceptions
 *   • failed requests and HTTP ≥ 400 responses
 *   • screenshots (width matrix, mobile emulation, reduced motion, light scheme)
 *   • layout health: horizontal overflow (critical for an RTL app), h1 count,
 *     unnamed buttons, DOM size, image/font counts
 *
 * Output: audit/before/playwright/{crawl.json, shots/}
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { getBrowser, PAGES, urlFor, auditDir, writeJSON, INTRO_BYPASS_UA } from "./lib/browser.mjs";

const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const OUT = auditDir("before");
const SHOTS = path.join(OUT, "playwright/shots");
fs.mkdirSync(SHOTS, { recursive: true });

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];
const HEIGHT = 900;

const b = await getBrowser();
const browser = await chromium.launch({
  executablePath: b.executablePath,
  args: b.args,
  env: b.env,
});

const results = [];
const allIssues = [];

async function openPage(ctx) {
  const page = await ctx.newPage();
  const rec = { console: [], pageerror: [], failed: [], http4xx: [] };
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      rec.console.push({ type: m.type(), text: m.text().slice(0, 400) });
    }
  });
  page.on("pageerror", (e) => rec.pageerror.push(String(e.message).slice(0, 400)));
  page.on("requestfailed", (r) =>
    rec.failed.push({ url: r.url().slice(0, 300), error: r.failure()?.errorText ?? "?" })
  );
  page.on("response", (r) => {
    if (r.status() >= 400) rec.http4xx.push({ url: r.url().slice(0, 300), status: r.status() });
  });
  return { page, rec };
}

/** Waits until the page has painted and lazy chunks have settled. */
async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(650);
  await page.evaluate(() =>
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))])
  );
  await page.waitForTimeout(350);
}

const layoutProbe = () => {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const offenders = [];
  for (const el of Array.from(document.querySelectorAll("body *"))) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.visibility === "hidden") continue;
    // ignore intentionally clipped decorative layers
    if (style.overflowX === "hidden" || style.overflowX === "clip") continue;
    if (r.right > vw + 2 || r.left < -2) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 120),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
  }
  return {
    docScrollWidth: de.scrollWidth,
    innerWidth: vw,
    overflows: de.scrollWidth > vw + 2,
    offenders: offenders.slice(0, 8),
    nodes: document.querySelectorAll("*").length,
    h1: document.querySelectorAll("main h1").length,
    imgs: document.querySelectorAll("img").length,
    fonts: document.fonts ? document.fonts.size : 0,
    unnamedButtons: Array.from(document.querySelectorAll("main button")).filter(
      (x) => !(x.getAttribute("aria-label") || x.textContent || "").trim()
    ).length,
  };
};

try {
  // ── 1. width matrix ───────────────────────────────────────────────────────
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: HEIGHT },
      userAgent: INTRO_BYPASS_UA,
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });
    for (const p of PAGES) {
      const { page, rec } = await openPage(ctx);
      const started = Date.now();
      try {
        await page.goto(urlFor(BASE, p), { timeout: 45_000 });
        await settle(page);
        const probe = await page.evaluate(layoutProbe);
        const shot = path.join(SHOTS, `${p.id}-${width}.jpg`);
        await page.screenshot({ path: shot, type: "jpeg", quality: 72 });

        const entry = {
          page: p.id,
          path: p.path,
          width,
          loadMs: Date.now() - started,
          ...probe,
          shot: path.relative(OUT, shot),
          console: rec.console,
          pageerror: rec.pageerror,
          failed: rec.failed,
          http4xx: rec.http4xx,
        };
        results.push(entry);

        if (probe.overflows) {
          allIssues.push({
            kind: "horizontal-overflow",
            page: p.id,
            width,
            detail: `${probe.docScrollWidth}px content in ${probe.innerWidth}px viewport`,
            offenders: probe.offenders,
          });
        }
        if (probe.h1 !== 1) {
          allIssues.push({
            kind: "h1-count",
            page: p.id,
            width,
            detail: `found ${probe.h1} <h1> in <main>`,
          });
        }
        if (probe.unnamedButtons > 0) {
          allIssues.push({
            kind: "unnamed-button",
            page: p.id,
            width,
            detail: `${probe.unnamedButtons} buttons`,
          });
        }
        for (const c of rec.console.filter((x) => x.type === "error"))
          allIssues.push({ kind: "console-error", page: p.id, width, detail: c.text });
        for (const e of rec.pageerror)
          allIssues.push({ kind: "page-error", page: p.id, width, detail: e });
        for (const f of rec.failed)
          allIssues.push({
            kind: "request-failed",
            page: p.id,
            width,
            detail: `${f.url} — ${f.error}`,
          });
        for (const h of rec.http4xx)
          allIssues.push({ kind: "http-error", page: p.id, width, detail: `${h.status} ${h.url}` });
      } catch (err) {
        allIssues.push({
          kind: "navigation-failed",
          page: p.id,
          width,
          detail: String(err.message).slice(0, 300),
        });
      } finally {
        await page.close();
      }
    }
    await ctx.close();
    process.stdout.write(`  width ${width}px done (${results.length} page loads)\n`);
  }

  // ── 2. mobile emulation (touch + DPR 3) ───────────────────────────────────
  const mobile = await browser.newContext({
    ...(await import("playwright-core")).devices["iPhone 13"],
    userAgent: INTRO_BYPASS_UA,
    colorScheme: "dark",
  });
  for (const p of PAGES) {
    const { page, rec } = await openPage(mobile);
    try {
      await page.goto(urlFor(BASE, p), { timeout: 45_000 });
      await settle(page);
      const probe = await page.evaluate(layoutProbe);
      const shot = path.join(SHOTS, `${p.id}-iphone13.jpg`);
      await page.screenshot({ path: shot, type: "jpeg", quality: 72 });
      results.push({
        page: p.id,
        path: p.path,
        width: 390,
        device: "iPhone 13",
        ...probe,
        shot: path.relative(OUT, shot),
        console: rec.console,
        pageerror: rec.pageerror,
        failed: rec.failed,
        http4xx: rec.http4xx,
      });
      if (probe.overflows)
        allIssues.push({
          kind: "horizontal-overflow",
          page: p.id,
          device: "iPhone 13",
          detail: `${probe.docScrollWidth}px in ${probe.innerWidth}px`,
          offenders: probe.offenders,
        });
      for (const c of rec.console.filter((x) => x.type === "error"))
        allIssues.push({ kind: "console-error", page: p.id, device: "iPhone 13", detail: c.text });
      for (const f of rec.failed)
        allIssues.push({ kind: "request-failed", page: p.id, device: "iPhone 13", detail: f.url });
    } catch (err) {
      allIssues.push({
        kind: "navigation-failed",
        page: p.id,
        device: "iPhone 13",
        detail: err.message.slice(0, 200),
      });
    } finally {
      await page.close();
    }
  }
  await mobile.close();
  process.stdout.write("  mobile emulation done\n");

  // ── 3. reduced motion + light colour scheme ───────────────────────────────
  for (const variant of [
    { id: "reduced-motion", opts: { reducedMotion: "reduce" } },
    { id: "light-scheme", opts: { colorScheme: "light" } },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: HEIGHT },
      userAgent: INTRO_BYPASS_UA,
      ...variant.opts,
    });
    for (const p of ["home", "fonts", "engines"]) {
      const meta = PAGES.find((x) => x.id === p);
      const { page } = await openPage(ctx);
      await page.goto(urlFor(BASE, meta), { timeout: 45_000 });
      await settle(page);
      await page.screenshot({
        path: path.join(SHOTS, `${p}-${variant.id}.jpg`),
        type: "jpeg",
        quality: 72,
      });
      await page.close();
    }
    await ctx.close();
    process.stdout.write(`  ${variant.id} done\n`);
  }

  // ── 4. the intro film itself (real UA, no bypass) ─────────────────────────
  const introCtx = await browser.newContext({
    viewport: { width: 1440, height: HEIGHT },
    colorScheme: "dark",
  });
  const introPage = await introCtx.newPage();
  await introPage.goto(`${BASE}/`, { timeout: 45_000 });
  await introPage.waitForTimeout(2500);
  await introPage.screenshot({ path: path.join(SHOTS, "00-intro-film-real-ua.png") });
  const introVisible = await introPage
    .locator('[aria-label="شروع انیمیشن ورود با صدا"]')
    .isVisible()
    .catch(() => false);
  await introCtx.close();
  writeJSON(path.join(OUT, "playwright/console-intro.json"), { introBlocksPage: introVisible });
  process.stdout.write(`  intro film captured (blocks page: ${introVisible})\n`);
} finally {
  await browser.close();
}

// ── summary ────────────────────────────────────────────────────────────────
const byKind = allIssues.reduce((acc, i) => {
  acc[i.kind] = (acc[i.kind] ?? 0) + 1;
  return acc;
}, {});

writeJSON(path.join(OUT, "playwright/crawl.json"), {
  generatedAt: new Date().toISOString(),
  base: BASE,
  widths: WIDTHS,
  pages: PAGES.length,
  loads: results.length,
  issueCounts: byKind,
  issues: allIssues,
  results,
});

console.log("\n=== CRAWL SUMMARY ===");
console.log("page loads:", results.length);
console.log("issues:", JSON.stringify(byKind, null, 2));
const overflow = allIssues.filter((i) => i.kind === "horizontal-overflow");
if (overflow.length) {
  console.log("\nhorizontal overflow:");
  for (const o of overflow) console.log(` • ${o.page} @${o.width ?? o.device}: ${o.detail}`);
}
