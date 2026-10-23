#!/usr/bin/env node
/**
 * Generates lazy-loadable data vault for the platform:
 *   public/regcode/chunks/*.json    — real sources, written by generate-component-chunks.mjs
 *   public/vault/skills/<id>.md     — REAL full SKILL.md bodies (179)
 *   public/vault/brands/<id>.md     — REAL full DESIGN.md bodies (84)
 *   public/ai/dataset.json          — parsed QLoRA training pairs
 *
 * Everything is fetched on demand so the JS bundle stays small.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// resolve from this script, never from a hard-coded home directory
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TK = path.join(ROOT, "toolkit");
const PUB = path.join(ROOT, "public");
/* Safety guard: if the vendored toolkit is absent (e.g. shallow CI checkout),
   keep the committed generated data instead of overwriting it with empties. */
const TOOLKIT_DIR = TK;
if (!fs.existsSync(TOOLKIT_DIR) || fs.readdirSync(TOOLKIT_DIR).length < 4) {
  console.warn("[generate] toolkit/ not found — skipping generation, using committed data.");
  process.exit(0);
}

/** Reads the generated registry manifest so the vault index never lies. */
function registrySummary() {
  const file = path.join(ROOT, "src/data/registryFiles.ts");
  if (!fs.existsSync(file)) return { registries: [], components: 0 };
  const raw = fs.readFileSync(file, "utf8");
  const open = raw.indexOf("= [");
  const close = raw.lastIndexOf("]");
  if (open < 0 || close < open) return { registries: [], components: 0 };
  try {
    const rows = JSON.parse(raw.slice(open + 2, close + 1));
    const registries = rows.map((r) => ({ id: r.id, total: r.totalFiles ?? 0 }));
    const components = registries.reduce((a, r) => a + r.total, 0);
    return { registries, components };
  } catch {
    return { registries: [], components: 0 };
  }
}

function walk(dir, filterFn, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filterFn, list);
    else if (entry.isFile() && filterFn(full, entry.name)) list.push(full);
  }
  return list;
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

// ---------------------------------------------------------------- registry code
/* The component explorer does not ship one 27 MB JSON per registry any more.
   `scripts/generate-component-chunks.mjs` (run later in `npm run generate`)
   writes the same real sources as 47 lazy chunks under public/regcode/chunks.
   It owns that directory, so nothing is deleted here. */

// --------------------------------------------------------------------- skills
const skillsRoot = path.join(TK, "01-skills-and-standards");
const skillOut = path.join(PUB, "vault/skills");
rmrf(skillOut);
fs.mkdirSync(skillOut, { recursive: true });

const skillFiles = walk(skillsRoot, (f, n) => n === "SKILL.md").filter(
  (f) => !f.includes("05-brand-design-md-vault")
);
for (const f of skillFiles) {
  const rel = path.relative(skillsRoot, f).split(path.sep).join("/");
  const safe = rel.replace(/\/SKILL\.md$/, "").replace(/\//g, "__");
  fs.writeFileSync(path.join(skillOut, `${safe}.md`), fs.readFileSync(f, "utf8"));
}

// --------------------------------------------------------------------- brands
const brandsRoot = path.join(skillsRoot, "05-brand-design-md-vault");
const brandOut = path.join(PUB, "vault/brands");
rmrf(brandOut);
fs.mkdirSync(brandOut, { recursive: true });

const brandFiles = walk(brandsRoot, (f, n) => n.endsWith("DESIGN.md"));
for (const f of brandFiles) {
  const safe = path.basename(f).replace(/-?DESIGN\.md$/i, "");
  fs.writeFileSync(path.join(brandOut, `${safe}.md`), fs.readFileSync(f, "utf8"));
}

// -------------------------------------------------------------------- dataset
const dsPath = path.join(TK, "06-ai-model-training/rtl_motion_dataset_sample.jsonl");
const pairs = [];
if (fs.existsSync(dsPath)) {
  for (const line of fs.readFileSync(dsPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const row = JSON.parse(t);
      const msgs = row.messages || [];
      const sys = msgs.find((m) => m.role === "system")?.content || "";
      const user = msgs.find((m) => m.role === "user")?.content || "";
      const assistant = msgs.find((m) => m.role === "assistant")?.content || "";
      pairs.push({
        registry: row.registry || "",
        component: row.component || "",
        features: row.features || [],
        user,
        assistant,
        system: sys,
      });
    } catch {
      /* ignore malformed line */
    }
  }
}
writeJson(path.join(PUB, "ai/dataset.json"), { total: pairs.length, pairs });
fs.writeFileSync(
  path.join(PUB, "ai/system-prompt.md"),
  fs.existsSync(path.join(TK, "06-ai-model-training/rtl_motion_system_prompt.md"))
    ? fs.readFileSync(path.join(TK, "06-ai-model-training/rtl_motion_system_prompt.md"), "utf8")
    : ""
);

const summary = registrySummary();
writeJson(path.join(PUB, "vault/index.json"), {
  skills: skillFiles.length,
  brands: brandFiles.length,
  registries: summary.registries,
  components: summary.components,
});

console.log(
  `\nDONE  components=${summary.components} in ${summary.registries.length} registries  skills=${skillFiles.length}  brands=${brandFiles.length}  datasetPairs=${pairs.length}`
);
