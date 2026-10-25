import { existsSync } from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { resolveProvider } from "../ai/resolve.js";
import type { ProviderOptions } from "../ai/provider.js";
import type { ParsedTarget } from "../util/detect-url.js";
import { prepareEnv } from "../util/env-file.js";
import { run, which } from "../util/shell.js";
import { confirm, log, spinner, table } from "../util/ui.js";
import { aiRefinePlan } from "./ai-plan.js";
import { heuristicPlan, readFacts } from "./detect-stack.js";
import { describePlan, runInstall, runServer } from "./run.js";
import { scanRepo } from "./scan.js";

export interface RepoOptions extends ProviderOptions {
  dir?: string;
  yes: boolean;
  open: boolean;
  noAi: boolean;
  scanOnly: boolean;
}

export async function cloneAndRun(target: ParsedTarget, opts: RepoOptions): Promise<void> {
  const total = 6;
  const dest = path.resolve(opts.dir ?? target.name);

  // 1. clone
  log.step(1, total, `Clone ${pc.cyan(target.cloneUrl!)}`);
  if (existsSync(dest)) {
    log.warn(`${dest} already exists — reusing it (delete it for a fresh clone).`);
  } else {
    if (!which("git")) throw new Error("git is not installed or not on PATH.");
    const args = ["clone", "--depth", "1"];
    if (target.branch) args.push("--branch", target.branch);
    args.push(target.cloneUrl!, dest);
    const res = await run("git", args, { cwd: process.cwd(), quiet: true });
    if (res.code !== 0) throw new Error("git clone failed:\n" + res.output.trim());
    log.ok(`cloned into ${pc.bold(path.relative(process.cwd(), dest) || ".")}`);
  }

  // 2. understand
  log.step(2, total, "Detect the stack");
  const facts = readFacts(dest);
  let plan = heuristicPlan(facts);
  const provider = opts.noAi ? null : safeResolve(opts);
  if (provider && (!plan.confident || !plan.run)) {
    const sp = spinner(`heuristics unsure → asking ${provider.name} to read the README…`);
    try {
      plan = await aiRefinePlan(provider, facts, plan);
      sp.succeed(`plan reviewed by ${provider.name}`);
    } catch (e) {
      sp.warn(`AI planner unavailable (${(e as Error).message.split("\n")[0]}) — using heuristics`);
    }
  } else if (!provider && !plan.confident) {
    log.dim("tip: set ANTHROPIC_API_KEY / OPENAI_API_KEY and I'll read the README to pick the exact commands.");
  }
  describePlan(plan);
  if (!plan.run && plan.stack === "unknown") {
    throw new Error("Couldn't figure out how to run this repository. Open it and check its README.");
  }

  // 3. safety scan
  log.step(3, total, "Read the dependencies before running them");
  const sp = spinner("scanning install scripts, registries, publish dates, obfuscation…");
  const report = await scanRepo(dest);
  sp.stop();
  for (const c of report.checked) log.dim("checked " + c);
  if (report.findings.length === 0) {
    log.ok("nothing suspicious found");
  } else {
    for (const f of report.findings) {
      const tag = f.severity === "high" ? pc.red("HIGH  ") : f.severity === "medium" ? pc.yellow("MEDIUM") : pc.dim("low   ");
      console.log(`  ${tag} ${f.title}`);
      log.dim("      " + f.detail);
    }
    const worst = report.findings[0].severity;
    if (worst === "high" && !opts.yes) {
      const go = await confirm(pc.red("High-risk patterns found. Install anyway?"), false);
      if (!go) {
        log.info("Stopped. The clone is still on disk if you want to inspect it.");
        return;
      }
    }
  }
  if (opts.scanOnly) return;

  // 4. env
  log.step(4, total, "Environment");
  const env = prepareEnv(dest);
  if (env.created) {
    log.ok(`created .env from ${env.created}`);
    if (env.autoFilled.length) log.dim(`generated random secrets for: ${env.autoFilled.join(", ")}`);
    if (env.needsYou.length) {
      log.warn("these still need real values from you (the app may run in a limited mode without them):");
      table(env.needsYou.map((n) => [pc.yellow(n.key), pc.dim(n.hint)]));
    }
  } else {
    log.dim(existsSync(path.join(dest, ".env")) ? ".env already present" : "no .env.example — nothing to configure");
  }

  // 5. install
  log.step(5, total, "Install");
  if (plan.install.length) {
    if (!opts.yes) {
      const go = await confirm(`Run ${pc.bold(plan.install.map((c) => c.label).join(" && "))} ?`, true);
      if (!go) return;
    }
    await runInstall(dest, plan);
    log.ok("installed");
  } else {
    log.dim("nothing to install");
  }

  // 6. run
  log.step(6, total, "Run");
  if (!plan.run) {
    log.warn("This looks like a library — nothing to start. It's cloned and installed.");
    return;
  }
  const code = await runServer(dest, plan.run, { open: opts.open, knownPorts: plan.ports });
  if (code !== 0) log.warn(`process exited with code ${code}`);
}

function safeResolve(opts: ProviderOptions) {
  try {
    return resolveProvider(opts);
  } catch (e) {
    log.warn((e as Error).message);
    return null;
  }
}
