import pc from "picocolors";
import ora, { type Ora } from "ora";
import readline from "node:readline";

export const log = {
  info: (msg: string) => console.log(pc.cyan("›") + " " + msg),
  ok: (msg: string) => console.log(pc.green("✔") + " " + msg),
  warn: (msg: string) => console.log(pc.yellow("▲") + " " + msg),
  err: (msg: string) => console.error(pc.red("✖") + " " + msg),
  dim: (msg: string) => console.log(pc.dim("  " + msg)),
  blank: () => console.log(),
  step: (n: number, total: number, msg: string) =>
    console.log(pc.bold(pc.magenta(`[${n}/${total}]`)) + " " + pc.bold(msg)),
};

export function spinner(text: string): Ora {
  return ora({ text, color: "magenta" }).start();
}

export function banner(version: string): void {
  console.log(pc.bold("breakinggood") + pc.dim(` v${version}`));
  console.log();
}

export async function confirm(question: string, defaultYes = false): Promise<boolean> {
  if (!process.stdin.isTTY) return defaultYes;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await new Promise<string>((res) =>
    rl.question(`${pc.yellow("?")} ${question} ${pc.dim(hint)} `, res),
  );
  rl.close();
  const a = answer.trim().toLowerCase();
  if (!a) return defaultYes;
  return a === "y" || a === "yes";
}

export function table(rows: string[][]): void {
  if (rows.length === 0) return;
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => (r[i] ?? "").length)));
  for (const r of rows) {
    console.log("  " + r.map((c, i) => (c ?? "").padEnd(widths[i])).join("  "));
  }
}
