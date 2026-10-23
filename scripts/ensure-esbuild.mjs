/**
 * Some hosts (Vercel's Node 24 image, npm ≥ 11.6) skip dependency install
 * scripts by default. esbuild needs its postinstall to link the platform
 * binary, and without it `vite build` dies with a bare ENOENT.
 *
 * This runs from the root `postinstall`, is idempotent, and never fails the
 * install: if the binary is already there it does nothing, and if it cannot be
 * installed it exits 0 so the build can report a real error instead of a
 * cryptic install failure.
 */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const here = dirname(new URL(import.meta.url).pathname);
const root = join(here, "..");
const require = createRequire(pathToFileURL(join(root, "package.json")));

function binaryWorks() {
  try {
    const esbuild = require("esbuild");
    const path = esbuild.transformSync("const a = 1;", { loader: "js" });
    return Boolean(path?.code);
  } catch {
    return false;
  }
}

if (binaryWorks()) {
  console.log("[esbuild] binary ready");
} else {
  const installer = join(root, "node_modules", "esbuild", "install.js");
  if (existsSync(installer)) {
    try {
      await import(pathToFileURL(installer).href);
      console.log("[esbuild] re-ran install.js");
    } catch (error) {
      console.warn("[esbuild] install.js failed:", error?.message ?? error);
    }
  } else {
    console.warn("[esbuild] install.js missing — skipping");
  }
  if (!binaryWorks()) {
    console.warn("[esbuild] binary still unavailable; build will report the real error");
  }
}

process.exit(0);
