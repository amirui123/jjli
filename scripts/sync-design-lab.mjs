#!/usr/bin/env node
/**
 * Copy the source-controlled Design Lab vault into Vite's public directory.
 * Files under the repository root are not served by Vite unless they live
 * under public/, so the manifest URLs otherwise resolve to 404 in production.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "design-lab");
const DESTINATION = path.join(ROOT, "public", "design-lab");

if (!fs.existsSync(SOURCE) || !fs.statSync(SOURCE).isDirectory()) {
  throw new Error(`Design Lab source directory not found: ${SOURCE}`);
}

fs.rmSync(DESTINATION, { recursive: true, force: true });
fs.mkdirSync(path.dirname(DESTINATION), { recursive: true });
fs.cpSync(SOURCE, DESTINATION, {
  recursive: true,
  filter: (entry) => ![".DS_Store", "Thumbs.db"].includes(path.basename(entry)),
});

function countFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    const full = path.join(directory, entry.name);
    return count + (entry.isDirectory() ? countFiles(full) : entry.isFile() ? 1 : 0);
  }, 0);
}

const copied = countFiles(DESTINATION);
if (copied === 0) {
  throw new Error("Design Lab public copy is empty.");
}

console.log(`[design-lab] copied ${copied} files into public/design-lab`);
