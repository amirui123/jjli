#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = "/home/user/jjli/toolkit";
const OUT_FILE = "/home/user/jjli/src/data/toolkitManifest.ts";

function walk(dir, filterFn, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, filterFn, list);
    } else if (entry.isFile() && filterFn(full, entry.name)) {
      list.push(full);
    }
  }
  return list;
}

// 1. Scan all 179 SKILL.md files
const skillFiles = walk(
  path.join(ROOT, "01-skills-and-standards"),
  (full, name) => name === "SKILL.md"
);

const skills = skillFiles.map((file) => {
  const rel = path.relative(path.join(ROOT, "01-skills-and-standards"), file);
  const parts = rel.split(path.sep);
  const categoryFolder = parts[0] || "general";
  const skillSlug = parts.slice(1, -1).join("/") || parts[0];
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const heading =
    lines.find((l) => l.startsWith("# "))?.replace(/^#+\s*/, "") || skillSlug;
  const summary =
    lines
      .filter((l) => !l.startsWith("#") && !l.startsWith("---") && l.length > 25)
      .slice(0, 2)
      .join(" ")
      .slice(0, 190) || "استاندارد و مهارت تخصصی مهندسی رابط کاربری و موشن";
  const excerpt = raw.slice(0, 320);

  return {
    id: rel.replace(/\/SKILL\.md$/, ""),
    slug: skillSlug,
    categoryFolder,
    title: heading.slice(0, 85),
    summary,
    path: `toolkit/01-skills-and-standards/${rel}`,
    excerpt,
  };
});

// 2. Scan all 84 Brand *-DESIGN.md files
const designFiles = walk(
  path.join(ROOT, "01-skills-and-standards/05-brand-design-md-vault"),
  (full, name) => name.endsWith("DESIGN.md")
);

const brandDesigns = designFiles.map((file) => {
  const fileName = path.basename(file);
  const brandSlug = fileName.replace(/-?DESIGN\.md$/i, "");
  const raw = fs.readFileSync(file, "utf8");
  const hexMatches = Array.from(
    new Set(raw.match(/#[0-9A-Fa-f]{6}\b/g) || [])
  ).slice(0, 6);
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const title =
    lines.find((l) => l.startsWith("# "))?.replace(/^#+\s*/, "") ||
    brandSlug.toUpperCase();
  const excerpt = raw.slice(0, 340);

  return {
    id: brandSlug,
    name: brandSlug,
    title: title.slice(0, 80),
    colors: hexMatches.length
      ? hexMatches
      : ["#09090B", "#6366F1", "#06B6D4", "#FAFAFA"],
    path: `toolkit/01-skills-and-standards/05-brand-design-md-vault/${fileName}`,
    excerpt,
  };
});

// 3. Scan all 12 Component Registries in 04-motion-primitives-and-ui
const compRoot = path.join(ROOT, "04-motion-primitives-and-ui");
const registryDirs = fs
  .readdirSync(compRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const registriesManifest = registryDirs.map((regName) => {
  const regPath = path.join(compRoot, regName);
  const files = walk(
    regPath,
    (full, name) => name.endsWith(".tsx") || name.endsWith(".ts")
  );

  const allFileNames = files.map((f) => path.relative(regPath, f));

  // Pick up to 8 representative .tsx files per registry with real source code
  const tsxFiles = files.filter((f) => f.endsWith(".tsx"));
  const codeSamples = [];
  for (const tf of tsxFiles) {
    if (codeSamples.length >= 4) break;
    const content = fs.readFileSync(tf, "utf8");
    if (content.length >= 250 && content.length <= 2000) {
      codeSamples.push({
        name: path.basename(tf, ".tsx"),
        relPath: `toolkit/04-motion-primitives-and-ui/${regName}/${path.relative(
          regPath,
          tf
        )}`,
        code: content,
      });
    }
  }

  return {
    id: regName,
    totalFiles: files.length,
    allComponents: allFileNames,
    samples: codeSamples,
  };
});

// 4. Scan all 200+ Procedural Sound files in 07-core-engines/03-procedural-sound-engine
const soundRoot = path.join(
  ROOT,
  "07-core-engines/03-procedural-sound-engine"
);
const soundFilesRaw = walk(
  soundRoot,
  (full, name) => name.endsWith(".ts") && name !== "react-bits-sound.ts"
);

const soundRecipes = soundFilesRaw.map((f) => {
  const name = path.basename(f, ".ts");
  const raw = fs.readFileSync(f, "utf8");
  const durMatch = raw.match(/duration:\s*([\d.]+)/);
  const lpMatch = raw.match(/lowpass:\s*(\d+)/);
  const freqMatch = raw.match(/freq:\s*(\d+(?:\.\d+)?)/);
  const fromMatch = raw.match(/from:\s*(\d+(?:\.\d+)?)/);
  const toMatch = raw.match(/to:\s*(\d+(?:\.\d+)?)/);

  return {
    id: name,
    duration: durMatch ? Number(durMatch[1]) : 0.18,
    lowpass: lpMatch ? Number(lpMatch[1]) : 6000,
    freqFrom: fromMatch
      ? Number(fromMatch[1])
      : freqMatch
      ? Number(freqMatch[1])
      : 340,
    freqTo: toMatch
      ? Number(toMatch[1])
      : freqMatch
      ? Number(freqMatch[1]) * 1.25
      : 520,
    hasNoise: raw.includes("type: 'noise'"),
    snippet: raw.slice(0, 420),
  };
});

// 5. Scan all Core Engine folders in 07-core-engines and 03-persian-rtl-engine
const engineRoot = path.join(ROOT, "07-core-engines");
const engineFolders = fs
  .readdirSync(engineRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const p = path.join(engineRoot, d.name);
    const all = walk(p, () => true);
    return {
      id: d.name,
      count: all.length,
      files: all.map((f) => path.relative(p, f)),
    };
  });

const rtlEngineFiles = walk(
  path.join(ROOT, "03-persian-rtl-engine"),
  () => true
).map((f) => path.relative(path.join(ROOT, "03-persian-rtl-engine"), f));

const qaFiles = walk(
  path.join(ROOT, "05-qa-and-bug-hunters"),
  () => true
).map((f) => path.relative(path.join(ROOT, "05-qa-and-bug-hunters"), f));

const aiFiles = walk(
  path.join(ROOT, "06-ai-model-training"),
  () => true
).map((f) => path.relative(path.join(ROOT, "06-ai-model-training"), f));

const outputTs = `/**
 * AUTO-GENERATED FULL TOOLKIT MANIFEST
 * - ${skills.length} SKILL.md files
 * - ${brandDesigns.length} Brand DESIGN.md files
 * - ${registriesManifest.reduce((a, b) => a + b.totalFiles, 0)} Component & Primitive TSX/TS files across ${registriesManifest.length} registries
 * - ${soundRecipes.length} Procedural Sound Engine recipes
 */

export interface SkillManifestItem {
  id: string;
  slug: string;
  categoryFolder: string;
  title: string;
  summary: string;
  path: string;
  excerpt: string;
}

export interface BrandDesignManifestItem {
  id: string;
  name: string;
  title: string;
  colors: string[];
  path: string;
  excerpt: string;
}

export interface RegistryManifestItem {
  id: string;
  totalFiles: number;
  allComponents: string[];
  samples: {
    name: string;
    relPath: string;
    code: string;
  }[];
}

export interface SoundRecipeItem {
  id: string;
  duration: number;
  lowpass: number;
  freqFrom: number;
  freqTo: number;
  hasNoise: boolean;
  snippet: string;
}

export const ALL_SKILLS_MANIFEST: SkillManifestItem[] = ${JSON.stringify(
  skills,
  null,
  2
)};

export const ALL_BRAND_DESIGNS_MANIFEST: BrandDesignManifestItem[] = ${JSON.stringify(
  brandDesigns,
  null,
  2
)};

export const ALL_REGISTRIES_MANIFEST: RegistryManifestItem[] = ${JSON.stringify(
  registriesManifest,
  null,
  2
)};

export const ALL_SOUND_RECIPES_MANIFEST: SoundRecipeItem[] = ${JSON.stringify(
  soundRecipes,
  null,
  2
)};

export const ALL_ENGINE_FOLDERS_MANIFEST = ${JSON.stringify(
  engineFolders,
  null,
  2
)};

export const ALL_RTL_ENGINE_FILES: string[] = ${JSON.stringify(
  rtlEngineFiles,
  null,
  2
)};

export const ALL_QA_FILES: string[] = ${JSON.stringify(qaFiles, null, 2)};

export const ALL_AI_TRAINING_FILES: string[] = ${JSON.stringify(
  aiFiles,
  null,
  2
)};
`;

fs.writeFileSync(OUT_FILE, outputTs, "utf8");
console.log(
  `Generated ${OUT_FILE}: ${skills.length} skills, ${brandDesigns.length} brands, ${registriesManifest.length} registries (${registriesManifest.reduce(
    (a, b) => a + b.totalFiles,
    0
  )} files), ${soundRecipes.length} sound recipes.`
);
