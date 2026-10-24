// Syncs the committed `dist/` output into the byte copy vendored by `tactile-site`.
// `@dalin/tactile` is a zero-dependency browser library installed straight from
// GitHub, so its consumers rely on committed build output.
// The site does not install the library, and its hand-maintained copy can drift
// while the public demo still builds and claims to show the current release.
// That defect has shipped twice. The second instance left the demo on the old 10 ms
// carrier and preset ladder after the 20 ms carrier change.
// This dependency-free Node script copies `dist/` into
// `../tactile-site/src/lib/tactile/`.
// Run `npm run sync:site` to copy. Run `npm run sync:site:check` to report drift
// and exit non-zero without writing.
// Comparisons remove CRLF differences because Windows checks out the site with
// CRLF. Writes use LF and leave checkout form to Git normalization.
// If `../tactile-site` is absent, check mode prints a skip and exits 0. Copy mode
// errors because the copy was explicitly requested.
import { readdir, readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname, posix } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "dist");
const SITE = join(ROOT, "..", "tactile-site");
const DEST = join(SITE, "src", "lib", "tactile");

const check = process.argv.includes("--check");

// The site is checked out with CRLF on Windows (core.autocrlf, no .gitattributes),
// so compare on content, not on line endings, or every file looks stale.
const normalize = (s) => s.replace(/\r\n/g, "\n");

async function walk(dir, prefix = "") {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const e of entries) {
    const rel = prefix ? posix.join(prefix, e.name) : e.name;
    if (e.isDirectory()) out.push(...(await walk(join(dir, e.name), rel)));
    else out.push(rel);
  }
  return out;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(SRC))) {
  console.error("dist/ is missing. Run `npm run build` first.");
  process.exit(1);
}

if (!(await exists(SITE))) {
  const msg = `tactile-site is not checked out at ${SITE}`;
  if (check) {
    console.log(`sync:site check skipped: ${msg}`);
    process.exit(0);
  }
  console.error(`${msg}. Clone gomezsj12/tactile-site beside this repo.`);
  process.exit(1);
}

const srcFiles = await walk(SRC);
const destFiles = await walk(DEST);
const srcSet = new Set(srcFiles);

const added = [];
const changed = [];
const removed = destFiles.filter((f) => !srcSet.has(f));

for (const rel of srcFiles) {
  const from = join(SRC, rel);
  const to = join(DEST, rel);
  if (!(await exists(to))) {
    added.push(rel);
    continue;
  }
  const [a, b] = await Promise.all([readFile(from, "utf8"), readFile(to, "utf8")]);
  if (normalize(a) !== normalize(b)) changed.push(rel);
}

const drift = added.length + changed.length + removed.length;

if (check) {
  if (drift === 0) {
    console.log(`sync:site check: ${srcFiles.length} vendored files in sync.`);
    process.exit(0);
  }
  console.error("The vendored copy in tactile-site has drifted from dist/:");
  for (const f of added) console.error(`  missing  ${f}`);
  for (const f of changed) console.error(`  stale    ${f}`);
  for (const f of removed) console.error(`  orphan   ${f}`);
  console.error("\nRun `npm run sync:site`, then commit the change in tactile-site.");
  process.exit(1);
}

for (const rel of [...added, ...changed]) {
  const to = join(DEST, rel);
  await mkdir(dirname(to), { recursive: true });
  // Write LF and let the site's own git normalization decide the checkout form.
  await writeFile(to, normalize(await readFile(join(SRC, rel), "utf8")), "utf8");
}
for (const rel of removed) await rm(join(DEST, rel));

if (drift === 0) {
  console.log(`sync:site: ${srcFiles.length} vendored files already in sync.`);
} else {
  console.log(
    `sync:site: ${added.length} added, ${changed.length} updated, ${removed.length} removed in ${DEST}.`,
  );
  console.log("Commit the change in tactile-site.");
}
