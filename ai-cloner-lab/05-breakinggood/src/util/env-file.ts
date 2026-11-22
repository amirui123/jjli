import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

export interface EnvReport {
  created: string | null;
  autoFilled: string[];
  needsYou: { key: string; hint: string }[];
}

const SECRET_RE = /(SECRET|JWT|SESSION|ENCRYPTION|SIGNING|COOKIE|NEXTAUTH_SECRET|AUTH_SECRET|MASTER_KEY|SALT)/i;
const PLACEHOLDER_RE = /^(|your[-_ ]|change[-_ ]?me|replace|xxx+|<.*>|\.\.\.|todo|example|placeholder|dummy|0123456789abcdef)/i;
const LOCAL_OK_RE = /^(localhost|127\.0\.0\.1|http:\/\/localhost|postgres|sqlite|true|false|development|production|\d+)$/i;

/**
 * Finds .env.example (or .env.sample / .env.template), copies it to .env if
 * missing, fills random values for secret-looking keys, and reports what the
 * human still has to provide.
 */
export function prepareEnv(dir: string): EnvReport {
  const report: EnvReport = { created: null, autoFilled: [], needsYou: [] };
  const target = path.join(dir, ".env");
  if (existsSync(target)) return report;

  const example = readdirSync(dir).find((f) => /^\.env\.(example|sample|template|dist)$/i.test(f));
  if (!example) return report;

  const src = readFileSync(path.join(dir, example), "utf8");
  const out: string[] = [];
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) {
      out.push(line);
      continue;
    }
    const [, key, rawVal] = m;
    const val = rawVal.replace(/^["']|["']$/g, "").trim();
    const isPlaceholder = PLACEHOLDER_RE.test(val);

    if (SECRET_RE.test(key) && (isPlaceholder || /change|secret|min_32|example/i.test(val))) {
      out.push(`${key}=${randomBytes(32).toString("hex")}`);
      report.autoFilled.push(key);
      continue;
    }
    if (isPlaceholder && val !== "" && !LOCAL_OK_RE.test(val)) {
      report.needsYou.push({ key, hint: val });
    } else if (val === "" && /KEY|TOKEN|PASSWORD|DSN|URL|ID|SID|EMAIL|HOST/i.test(key)) {
      report.needsYou.push({ key, hint: "(empty)" });
    }
    out.push(line);
  }
  writeFileSync(target, out.join("\n"));
  report.created = example;
  return report;
}
