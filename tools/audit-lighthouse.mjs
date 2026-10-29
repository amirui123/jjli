#!/usr/bin/env node
/**
 * Lighthouse on every key page, mobile + desktop.
 * Runs the lighthouse CLI once per page/preset and keeps the full JSON so the
 * report can list exact failing audits, not just scores.
 *
 * Output: audit/before/lighthouse/{mobile,desktop}/<page>.json + summary.json
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PAGES, urlFor, auditDir, writeJSON, ROOT } from "./lib/browser.mjs";

const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const OUT = auditDir("before");
const CHROME = process.env.CHROME_PATH || "/tmp/chromium";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) jsdom Chromium/153 Safari/537.36";

// The 404 page is deliberately excluded: it is a dev-only route.
const TARGETS = PAGES.filter((p) => p.id !== "notfound");

const summary = [];

for (const preset of ["mobile", "desktop"]) {
  const dir = path.join(OUT, `lighthouse/${preset}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const p of TARGETS) {
    const outFile = path.join(dir, `${p.id}.json`);
    const args = [
      urlFor(BASE, p),
      "--output=json",
      `--output-path=${outFile}`,
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage --disable-gpu --no-zygote",
      "--quiet",
      "--only-categories=performance,accessibility,best-practices,seo",
    ];
    if (preset === "desktop") args.push("--preset=desktop");
    try {
      execFileSync(path.join(ROOT, "node_modules/.bin/lighthouse"), args, {
        stdio: "pipe",
        timeout: 240_000,
        env: {
          ...process.env,
          CHROME_PATH: CHROME,
          LIGHTHOUSE_CHROMIUM_PATH: CHROME,
          LD_LIBRARY_PATH: `${path.join(ROOT, ".tooling/browser-libs")}:${process.env.LD_LIBRARY_PATH ?? ""}`,
        },
      });
      const r = JSON.parse(fs.readFileSync(outFile, "utf8"));
      const cats = Object.fromEntries(
        Object.entries(r.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)])
      );
      // audits that failed or scored below 1 and are flagged in the report
      const failing = Object.entries(r.audits)
        .filter(
          ([, a]) =>
            a.score !== null &&
            a.score < 1 &&
            a.scoreDisplayMode !== "informative" &&
            a.scoreDisplayMode !== "notApplicable"
        )
        .map(([id, a]) => ({
          id,
          score: a.score,
          title: a.title,
          displayValue: a.displayValue ?? "",
        }))
        .slice(0, 40);
      const metrics = {
        FCP: r.audits["first-contentful-paint"]?.displayValue,
        LCP: r.audits["largest-contentful-paint"]?.displayValue,
        TBT: r.audits["total-blocking-time"]?.displayValue,
        CLS: r.audits["cumulative-layout-shift"]?.displayValue,
        SI: r.audits["speed-index"]?.displayValue,
        TTI: r.audits["interactive"]?.displayValue,
      };
      summary.push({ preset, page: p.id, scores: cats, metrics, failing });
      console.log(
        `${preset.padEnd(7)} ${p.id.padEnd(11)} P${cats.performance} A${cats.accessibility} BP${cats["best-practices"]} SEO${cats.seo}  LCP ${metrics.LCP} CLS ${metrics.CLS}`
      );
    } catch (e) {
      summary.push({ preset, page: p.id, error: String(e.message).slice(0, 300) });
      console.log(`${preset} ${p.id} FAILED: ${String(e.message).slice(0, 120)}`);
    }
  }
}

writeJSON(path.join(OUT, "lighthouse/summary.json"), {
  generatedAt: new Date().toISOString(),
  summary,
});

const ok = summary.filter((s) => s.scores);
const avg = (k) => Math.round(ok.reduce((a, s) => a + s.scores[k], 0) / ok.length);
console.log("\nAVERAGE:", {
  performance: avg("performance"),
  accessibility: avg("accessibility"),
  bestPractices: avg("best-practices"),
  seo: avg("seo"),
});
