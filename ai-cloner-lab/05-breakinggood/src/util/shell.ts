import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export const isWindows = process.platform === "win32";

export interface RunResult {
  code: number | null;
  output: string;
}

/** Run a command, streaming output to the terminal while also capturing it. */
export function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; quiet?: boolean } ,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      shell: isWindows, // lets npm/pip/.cmd shims resolve on Windows
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const onData = (buf: Buffer) => {
      const s = buf.toString();
      output += s;
      if (!opts.quiet) process.stdout.write(s);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output }));
  });
}

export function which(bin: string): boolean {
  try {
    execFileSync(isWindows ? "where" : "which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function openBrowser(url: string): void {
  try {
    if (isWindows) {
      // `start` is a cmd builtin; empty first arg is the window title
      spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch {
    /* non-fatal */
  }
}

/** Kill a process and all of its children. */
export function killTree(child: ChildProcess): void {
  if (!child.pid) return;
  try {
    if (isWindows) {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(-child.pid, "SIGTERM");
    }
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

/** Spawn a long-running process (dev server) in its own group so it can be killed as a tree. */
export function spawnLongRunning(cmd: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv): ChildProcess {
  return spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env, FORCE_COLOR: "1" },
    shell: isWindows,
    detached: !isWindows,
    stdio: ["inherit", "pipe", "pipe"],
  });
}

export function exists(...segments: string[]): boolean {
  return existsSync(path.join(...segments));
}
