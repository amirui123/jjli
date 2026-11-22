import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export type Severity = "high" | "medium" | "low";

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

export interface ScanReport {
  findings: Finding[];
  checked: string[];
}

/** Popular native/binary packages that legitimately run install scripts. */
const KNOWN_INSTALL_SCRIPT_PACKAGES = new Set([
  "esbuild", "sharp", "better-sqlite3", "sqlite3", "bcrypt", "puppeteer", "playwright", "playwright-core",
  "fsevents", "node-sass", "sass-embedded", "protobufjs", "core-js", "core-js-pure", "prisma", "@prisma/engines",
  "@prisma/client", "cypress", "electron", "canvas", "node-gyp", "nodemon", "husky", "@swc/core", "@parcel/watcher",
  "lmdb", "msgpackr-extract", "cpu-features", "ssh2", "keytar", "bufferutil", "utf-8-validate", "unix-dgram",
  "@sentry/cli", "@tailwindcss/oxide", "lightningcss", "@biomejs/biome", "workerd", "@cloudflare/workerd",
  "re2", "iltorb", "grpc", "@grpc/grpc-js", "argon2", "libpq", "pg-native", "snappy", "zeromq", "deasync",
  "oniguruma", "tree-sitter", "@nx/nx", "nx", "turbo", "vue-demi", "es5-ext", "spawn-sync", "ngrok",
]);

const SUSPICIOUS_SCRIPT = /(curl|wget|iwr|invoke-webrequest)[^\n|]*\|\s*(ba)?sh|powershell\s+-e(nc)?|base64\s+(-d|--decode)|eval\s*\(\s*(atob|Buffer\.from)|new\s+Function\s*\(\s*atob|\bchmod\s+\+x\b.*&&|\/dev\/tcp\//i;
const OBFUSCATION = /(?:[A-Za-z0-9+/]{200,}={0,2})|\\x[0-9a-f]{2}(?:\\x[0-9a-f]{2}){20,}|String\.fromCharCode\((?:\d+,\s*){20,}/;

export async function scanRepo(dir: string): Promise<ScanReport> {
  const report: ScanReport = { findings: [], checked: [] };

  await scanNodeLockfile(dir, report);
  scanPackageJsonScripts(dir, report);
  scanPythonSetup(dir, report);
  scanObfuscation(dir, report);
  scanCommittedSecrets(dir, report);

  // highest severity first
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  report.findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return report;
}

async function scanNodeLockfile(dir: string, report: ScanReport): Promise<void> {
  const lock = path.join(dir, "package-lock.json");
  if (!existsSync(lock)) return;
  let json: { packages?: Record<string, { hasInstallScript?: boolean; version?: string; resolved?: string }> };
  try {
    json = JSON.parse(readFileSync(lock, "utf8"));
  } catch {
    return;
  }
  const pkgs = json.packages ?? {};
  report.checked.push(`${Object.keys(pkgs).length} locked npm packages`);

  const withScripts: string[] = [];
  for (const [key, meta] of Object.entries(pkgs)) {
    if (!meta.hasInstallScript) continue;
    const name = key.replace(/^.*node_modules\//, "");
    if (!KNOWN_INSTALL_SCRIPT_PACKAGES.has(name)) withScripts.push(`${name}@${meta.version ?? "?"}`);
  }
  if (withScripts.length) {
    report.findings.push({
      severity: "medium",
      title: `${withScripts.length} dependency(ies) run code at install time and aren't on the well-known list`,
      detail: withScripts.slice(0, 15).join(", ") + (withScripts.length > 15 ? ", …" : ""),
    });
  }

  // Unusual registries (workspace links like "packages/foo" are fine)
  const foreign = Object.entries(pkgs)
    .filter(([, m]) => m.resolved && /^[a-z]+:/.test(m.resolved) && !/^https:\/\/registry\.(npmjs\.org|yarnpkg\.com)\//.test(m.resolved))
    .map(([k, m]) => `${k.replace(/^.*node_modules\//, "")} ← ${m.resolved}`);
  if (foreign.length) {
    report.findings.push({
      severity: "medium",
      title: `${foreign.length} package(s) resolve outside the public npm registry`,
      detail: foreign.slice(0, 8).join("\n      "),
    });
  }

  // Very new direct dependencies (registry check, best-effort, 6 s budget)
  const pkgJsonPath = path.join(dir, "package.json");
  if (!existsSync(pkgJsonPath)) return;
  let direct: string[] = [];
  try {
    const pj = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    direct = Object.keys({ ...(pj.dependencies ?? {}), ...(pj.devDependencies ?? {}) });
  } catch {
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  const young: string[] = [];
  await Promise.all(
    direct.slice(0, 60).map(async (name) => {
      try {
        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { signal: controller.signal });
        if (!res.ok) return;
        const meta = (await res.json()) as { time?: { created?: string } };
        const created = meta.time?.created ? new Date(meta.time.created).getTime() : 0;
        if (created && Date.now() - created < 90 * 86400_000) {
          young.push(`${name} (published ${Math.round((Date.now() - created) / 86400_000)} days ago)`);
        }
      } catch {
        /* offline or timeout → skip silently */
      }
    }),
  ).finally(() => clearTimeout(timer));
  report.checked.push(`publish dates of ${Math.min(direct.length, 60)} direct dependencies`);
  if (young.length) {
    report.findings.push({
      severity: "low",
      title: `${young.length} direct dependency(ies) are less than 90 days old`,
      detail: young.join(", "),
    });
  }
}

function scanPackageJsonScripts(dir: string, report: ScanReport): void {
  const p = path.join(dir, "package.json");
  if (!existsSync(p)) return;
  try {
    const pj = JSON.parse(readFileSync(p, "utf8"));
    const scripts: Record<string, string> = pj.scripts ?? {};
    for (const hook of ["preinstall", "install", "postinstall", "prepare", "prepublish"]) {
      const s = scripts[hook];
      if (!s) continue;
      if (SUSPICIOUS_SCRIPT.test(s)) {
        report.findings.push({ severity: "high", title: `package.json "${hook}" pipes the network into a shell`, detail: s });
      } else {
        report.findings.push({ severity: "low", title: `package.json has a "${hook}" hook`, detail: s });
      }
    }
    report.checked.push("package.json lifecycle scripts");
  } catch {
    /* ignore */
  }
}

function scanPythonSetup(dir: string, report: ScanReport): void {
  for (const f of ["setup.py", "pyproject.toml"]) {
    const p = path.join(dir, f);
    if (!existsSync(p)) continue;
    const src = readFileSync(p, "utf8");
    report.checked.push(f);
    if (/os\.system|subprocess|urllib\.request|requests\.get|base64\.b64decode|exec\(|eval\(/.test(src)) {
      report.findings.push({
        severity: "high",
        title: `${f} executes code / touches the network at install time`,
        detail: "Python setup files run arbitrary code during pip install. Review before installing.",
      });
    }
  }
}

function scanObfuscation(dir: string, report: ScanReport): void {
  const hits: string[] = [];
  const walk = (d: string, depth: number) => {
    if (depth > 3 || hits.length > 5) return;
    for (const e of readdirSync(d)) {
      if (["node_modules", ".git", "dist", "build", ".next", "vendor", "assets", "public", "static"].includes(e)) continue;
      const full = path.join(d, e);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full, depth + 1);
      else if (/\.(c?js|mjs|ts|py|sh|ps1)$/.test(e) && st.size < 2_000_000 && !/\.min\.|\.bundle\./.test(e)) {
        const src = readFileSync(full, "utf8");
        if (SUSPICIOUS_SCRIPT.test(src) || OBFUSCATION.test(src)) hits.push(path.relative(dir, full));
      }
    }
  };
  walk(dir, 0);
  report.checked.push("source files for obfuscation / curl|bash patterns");
  if (hits.length) {
    report.findings.push({
      severity: "medium",
      title: `${hits.length} source file(s) contain obfuscated blobs or network→shell patterns`,
      detail: hits.join(", "),
    });
  }
}

function scanCommittedSecrets(dir: string, report: ScanReport): void {
  const envs = readdirSync(dir).filter((f) => /^\.env(\.(local|production|prod))?$/.test(f));
  if (envs.length) {
    report.findings.push({
      severity: "low",
      title: `repo ships a real ${envs.join(", ")} file`,
      detail: "It may contain the author's credentials or point your install at their servers. Check it before running.",
    });
  }
}
