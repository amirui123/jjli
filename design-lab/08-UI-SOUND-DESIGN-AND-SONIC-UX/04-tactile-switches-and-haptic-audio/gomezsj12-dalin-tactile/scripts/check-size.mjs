// Bundle-size budget for @dalin/tactile.
//
// The library's whole pitch is "zero deps, tiny, lazily-loaded channels", so a
// size regression is a real defect. This measures the gzipped size of each
// published entry point (and its lazily-loaded chunks) and fails if any exceeds
// its budget. Pure Node, no dependencies, mirroring the package's own ethos.
//
// Budgets are deliberately generous headroom over today's sizes; tighten as the
// surface stabilizes. Run with `npm run size` (build first).
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// entry → gzipped KB budget. Core must stay small; channels are opt-in chunks.
const BUDGETS = {
  "dist/index.js": 6,
  // Raised 4 -> 6 when the synth pack went from 7 raw-oscillator cues to 20
  // filtered/layered ones. A good chunk of that is the tuning commentary in the
  // cue table, which tsc emits into dist; it stays because whoever retunes a
  // frequency needs to know why it was that frequency.
  "dist/sound/synth.js": 6,
  "dist/sound/sample.js": 2,
  "dist/motion/particles.js": 5,
  "dist/motion/dom-driver.js": 2,
};

let failed = false;
const rows = [];
for (const [rel, budgetKb] of Object.entries(BUDGETS)) {
  const path = ROOT + rel;
  try {
    await stat(path);
  } catch {
    rows.push(`  MISSING  ${rel} (did you run \`npm run build\`?)`);
    failed = true;
    continue;
  }
  const bytes = await readFile(path);
  const gz = gzipSync(bytes).length / 1024;
  const ok = gz <= budgetKb;
  failed = failed || !ok;
  rows.push(`  ${ok ? "ok " : "OVER"}  ${rel.padEnd(28)} ${gz.toFixed(2)} KB gz  (budget ${budgetKb} KB)`);
}

console.log("Bundle size (gzipped):");
console.log(rows.join("\n"));
if (failed) {
  console.error("\nBundle-size budget exceeded (or dist missing).");
  process.exit(1);
}
console.log("\nAll entry points within budget.");
