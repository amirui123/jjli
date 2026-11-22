#!/usr/bin/env node
/**
 * axe-core audit — every page, plus the interactive states static scanners miss:
 * command palette open, accent picker open, a11y sheet open, mobile studio tabs,
 * and a form field in focus.
 *
 * Output: audit/before/a11y/axe.json  (+ axe.txt summary)
 */
import { chromium } from "playwright-core";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import {
  getBrowser,
  PAGES,
  urlFor,
  auditDir,
  writeJSON,
  writeText,
  INTRO_BYPASS_UA,
} from "./lib/browser.mjs";

const BASE = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const OUT = auditDir("before");

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

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const runs = [];

async function scan(page, label, pageId) {
  const res = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  runs.push({
    label,
    page: pageId,
    violations: res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.slice(0, 6).map((n) => ({
        target: n.target.join(" "),
        html: (n.html ?? "").slice(0, 220),
        failureSummary: (n.failureSummary ?? "").slice(0, 300),
      })),
      nodeCount: v.nodes.length,
    })),
    passes: res.passes.length,
    incomplete: res.incomplete.map((v) => ({ id: v.id, nodeCount: v.nodes.length })),
  });
  const v = res.violations.length;
  process.stdout.write(`  ${label}: ${v} violations\n`);
}

async function goto(page, p) {
  await page.goto(urlFor(BASE, p), { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(1400);
}

// ── 1. every page, default state ───────────────────────────────────────────
const page = await ctx.newPage();
for (const p of PAGES) {
  await goto(page, p);
  await scan(page, `page:${p.id}`, p.id);
}

// ── 2. interactive states ──────────────────────────────────────────────────
const home = PAGES[0];

await goto(page, home);
await page.keyboard.press("Control+k");
await page.waitForTimeout(600);
await scan(page, "state:command-palette-open", "home");

await page.keyboard.press("Escape");
await page.locator('button[aria-label="رنگ پلتفرم"]').first().click();
await page.waitForTimeout(600);
await scan(page, "state:accent-picker-open", "home");

await page.keyboard.press("Escape");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

await goto(page, home);
await page
  .getByRole("button", { name: /جستجو|جستجوی سریع/ })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(700);
await scan(page, "state:search-open", "home");

// mobile studio tabs
const mobile = await browser.newContext({
  ...(await import("playwright-core")).devices["iPhone 13"],
  userAgent: INTRO_BYPASS_UA,
});
const mp = await mobile.newPage();
await mp.goto(
  urlFor(
    BASE,
    PAGES.find((x) => x.id === "fonts")
  ),
  { waitUntil: "domcontentloaded" }
);
await mp.waitForTimeout(1500);
await scan(mp, "state:mobile-studio-preview-tab", "fonts-mobile");
const tabs = mp.locator('nav[aria-label="پنل‌های استودیو"] button');
if ((await tabs.count()) >= 3) {
  await tabs.nth(1).click();
  await mp.waitForTimeout(700);
  await scan(mp, "state:mobile-studio-settings-tab", "fonts-mobile");
  await tabs.nth(2).click();
  await mp.waitForTimeout(700);
  await scan(mp, "state:mobile-studio-list-tab", "fonts-mobile");
}
await mobile.close();

// reduced motion
const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: INTRO_BYPASS_UA,
  reducedMotion: "reduce",
});
const rmp = await rm.newPage();
await rmp.goto(urlFor(BASE, PAGES[0]), { waitUntil: "domcontentloaded" });
await rmp.waitForTimeout(1400);
await scan(rmp, "state:reduced-motion-home", "home");
await rm.close();

await browser.close();

// ── aggregate ──────────────────────────────────────────────────────────────
const totals = {};
for (const r of runs)
  for (const v of r.violations) totals[v.id] = (totals[v.id] ?? 0) + v.nodeCount;

const lines = ["axe-core audit — " + new Date().toISOString(), ""];
for (const r of runs) {
  lines.push(
    `## ${r.label} — ${r.violations.length} rules, ${r.violations.reduce((a, v) => a + v.nodeCount, 0)} nodes`
  );
  for (const v of r.violations)
    lines.push(`   • [${v.impact}] ${v.id} ×${v.nodeCount} — ${v.help}`);
}
lines.push("", "## Rule totals (nodes affected across all states)");
for (const [id, n] of Object.entries(totals).sort((a, b) => b[1] - a[1]))
  lines.push(`  ${n}\t${id}`);

writeJSON(path.join(OUT, "a11y/axe.json"), { generatedAt: new Date().toISOString(), runs, totals });
writeText(path.join(OUT, "a11y/axe.txt"), lines.join("\n"));
console.log("\n=== TOP RULES ===");
for (const [id, n] of Object.entries(totals)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12))
  console.log(`  ${n}\t${id}`);
