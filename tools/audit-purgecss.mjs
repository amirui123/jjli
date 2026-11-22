/** Analysis-only PurgeCSS run: reports what would be removed, deletes nothing. */
import { PurgeCSS } from "purgecss";
import fs from "node:fs";
import path from "node:path";
import { auditDir, writeJSON, writeText, ROOT } from "./lib/browser.mjs";

const OUT = auditDir("before");
const distAssets = path.join(ROOT, "dist/assets");
const cssFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith(".css"));
const content = [
  path.join(ROOT, "dist/index.html"),
  ...fs
    .readdirSync(distAssets)
    .filter((f) => f.endsWith(".js"))
    .map((f) => path.join(distAssets, f)),
];

const res = await new PurgeCSS().purge({
  content,
  css: cssFiles.map((f) => path.join(distAssets, f)),
  safelist: false,
});

// Extract which top-level at-rules / selectors survive vs. vanish so a human can
// judge false positives (Tailwind v4 dynamic classes, JS-composed class strings).
const selectorsOf = (text) =>
  [...text.matchAll(/^([^\s@{][^{]*)\{/gm)].map((m) => m[1].trim().slice(0, 120));

const rows = [];
for (const [i, r] of res.entries()) {
  const original = fs.readFileSync(path.join(distAssets, cssFiles[i]), "utf8");
  const kept = r.css ?? "";
  const keptSet = new Set(selectorsOf(kept));
  const dropped = selectorsOf(original).filter((s) => !keptSet.has(s));
  rows.push({
    file: cssFiles[i],
    originalBytes: original.length,
    keptBytes: kept.length,
    removedBytes: original.length - kept.length,
    removedPct: +(((original.length - kept.length) / original.length) * 100).toFixed(1),
    samplesDropped: dropped.slice(0, 60),
    droppedCount: dropped.length,
  });
}

const total = rows.reduce((a, r) => a + r.removedBytes, 0);
writeJSON(path.join(OUT, "static/purgecss.json"), { rows });
writeText(
  path.join(OUT, "static/purgecss.txt"),
  rows
    .map(
      (r) =>
        `## ${r.file}\noriginal ${r.originalBytes}B → kept ${r.keptBytes}B (drop ${r.removedBytes}B / ${r.removedPct}%)\n` +
        `selectors that would vanish (${r.droppedCount}):\n` +
        r.samplesDropped.map((s) => "  " + s).join("\n")
    )
    .join("\n\n") + `\n\ntotal droppable: ${total}B\n`
);
for (const r of rows)
  console.log(
    `${r.file}: ${r.removedBytes}B (${r.removedPct}%) would be dropped, ${r.droppedCount} selectors`
  );
