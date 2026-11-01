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
fs.mkdirSync(DESTINATION, { recursive: true });

/**
 * Copy only regular files and directories. The vault contains a few optional
 * symlinks whose targets are not committed; carrying those links into Vite's
 * public directory makes its recursive copy fail with ENOENT.
 */
function copyRegularTree(sourceDir, destinationDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if ([".DS_Store", "Thumbs.db"].includes(entry.name)) continue;
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyRegularTree(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
    // Symlinks and special entries are intentionally excluded.
  }
}

copyRegularTree(SOURCE, DESTINATION);

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
