import type { Provider } from "../ai/provider.js";
import type { Command, RepoFacts, RunPlan } from "./detect-stack.js";

const SYSTEM = `You are an expert release engineer. Given a repository's file tree, README and package.json, decide the exact commands to install and run it locally for a developer who wants to SEE it working in a browser as fast as possible.

Reply with ONLY a JSON object (no prose, no fences):
{
  "install": [{"cmd": "npm", "args": ["install"], "label": "npm install"}],
  "run": {"cmd": "npm", "args": ["run", "dev"], "label": "npm run dev"} | null,
  "ports": [3000],
  "notes": ["one-line things the human must do manually, e.g. API keys, databases"]
}

Rules:
- Prefer a dev/watch server over a production build. Prefer commands the README itself gives.
- Never use sudo, never install global packages, never curl|sh. Everything runs inside the repo directory.
- If the project needs Docker, use "docker compose up".
- For Python, assume a virtualenv at .venv already exists; use ".venv/bin/python" (or ".venv\\\\Scripts\\\\python.exe" on Windows) as cmd.
- "run" is null only if there is genuinely nothing to run (a library).`;

export async function aiRefinePlan(provider: Provider, facts: RepoFacts, base: RunPlan): Promise<RunPlan> {
  const prompt = [
    `OS: ${process.platform}`,
    `Detected stack: ${facts.stack}`,
    `Heuristic guess: install=${base.install.map((c) => c.label).join(" && ") || "(none)"}; run=${base.run?.label ?? "(none)"}`,
    "",
    "FILE TREE:",
    facts.tree,
    "",
    "README (truncated):",
    facts.readme || "(none)",
    "",
    facts.packageJson ? "package.json:\n" + JSON.stringify(facts.packageJson, null, 2).slice(0, 6000) : "",
  ].join("\n");

  const text = await provider.complete({ system: SYSTEM, prompt, maxTokens: 2000 });
  const json = extractJson(text);
  if (!json) return base;

  const toCmd = (c: unknown): Command | null => {
    if (!c || typeof c !== "object") return null;
    const o = c as Record<string, unknown>;
    if (typeof o.cmd !== "string" || !Array.isArray(o.args)) return null;
    if (/sudo|curl|wget|rm\s+-rf/.test([o.cmd, ...o.args].join(" "))) return null;
    return { cmd: o.cmd, args: o.args.map(String), label: typeof o.label === "string" ? o.label : [o.cmd, ...o.args].join(" ") };
  };

  const install = Array.isArray(json.install) ? (json.install.map(toCmd).filter(Boolean) as Command[]) : base.install;
  const run = json.run === null ? null : toCmd(json.run) ?? base.run;
  const ports = Array.isArray(json.ports) ? json.ports.map(Number).filter((n) => n > 0) : base.ports;
  const notes = Array.isArray(json.notes) ? json.notes.map(String) : [];

  return {
    ...base,
    install: install.length ? install : base.install,
    run,
    ports: ports.length ? ports : base.ports,
    reasons: [...base.reasons, `AI (${provider.name}/${provider.model}) reviewed the README and confirmed the plan`, ...notes.map((n) => "note: " + n)],
    confident: true,
  };
}

function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
