// Runs the compiled tests in dist/. Shell globs differ between bash/pwsh and
// node's own discovery varies by version, so we list the files ourselves.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const files = readdirSync("dist", { recursive: true })
  .map(String)
  .filter((f) => f.endsWith(".test.js"))
  .map((f) => path.join("dist", f));

if (files.length === 0) {
  console.error("no tests found in dist/");
  process.exit(1);
}
const r = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(r.status ?? 1);
