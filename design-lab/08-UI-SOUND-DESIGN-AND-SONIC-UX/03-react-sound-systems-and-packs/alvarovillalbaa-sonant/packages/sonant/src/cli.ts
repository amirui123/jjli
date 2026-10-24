#!/usr/bin/env node
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  catalog,
  createTheme,
  encodeWav,
  renderPCM,
  validateTheme,
  type SoundTheme,
  type ThemeName,
} from "./catalog.js";
import { createConfig, kitFiles } from "./config.js";
import { registry, type RegistryItem } from "./registry.js";
import type { Profile } from "./types.js";

const help = `Sonant — sound for interfaces

sonant init [--theme studio|soft|arcade] [--profile quiet|balanced|expressive]
            [--volume 0.35] [--enabled] [--dry-run]
sonant add sound-button|sound-switch|sound-settings|async-action [--dry-run]
sonant list
sonant audit [--strict] [--json]
sonant test [--theme studio|soft|arcade]
sonant export [--out sonant-assets] [--theme studio|soft|arcade]
sonant compile [--out sonant-assets]

All file-writing commands refuse to overwrite existing files or follow symlinks.
Use --cwd <directory> to choose the project. No telemetry or remote code execution.
`;

async function exists(path: string) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
async function safePath(root: string, path: string) {
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw new Error(`Path must stay inside the project: ${path}`);
  let current = root;
  for (const part of rel.split(/[\\/]/)) {
    current = join(current, part);
    if ((await exists(current)) && (await lstat(current)).isSymbolicLink())
      throw new Error(`Refusing symlink: ${current}`);
  }
  return target;
}
async function writeFiles(
  root: string,
  files: Record<string, string | Uint8Array>,
  dryRun: boolean,
) {
  for (const file of Object.keys(files)) {
    const target = await safePath(root, file);
    if (await exists(target))
      throw new Error(`Already exists: ${file}. Move or review it before retrying.`);
  }
  for (const [file, content] of Object.entries(files)) {
    console.log(`${dryRun ? "Would create" : "Created"} ${file}`);
    if (!dryRun) {
      const target = await safePath(root, file);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content, { flag: "wx" });
    }
  }
}
async function configAt(root: string) {
  const config = JSON.parse(await readFile(await safePath(root, "sonant.config.json"), "utf8"));
  createConfig({ theme: config.theme, ...config.preferences });
  if (config.schemaVersion !== 1 || typeof config.directory !== "string")
    throw new Error("Unsupported sonant.config.json.");
  await safePath(root, config.directory);
  return config as ReturnType<typeof createConfig>;
}
async function scan(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "dist", "build", "coverage", "tests"].includes(entry.name)
    )
      continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await scan(path)));
    else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) result.push(path);
  }
  return result;
}
export async function audit(root: string) {
  const findings: { file: string; line: number; rule: string; message: string }[] = [];
  for (const path of await scan(root)) {
    const text = await readFile(path, "utf8");
    if (!/sonant|\.emit\(|\.begin\(/.test(text)) continue;
    const add = (rule: string, message: string, at: number) =>
      findings.push({
        file: relative(root, path),
        line: text.slice(0, at).split("\n").length,
        rule,
        message,
      });
    const begin = text.indexOf(".begin(");
    if (begin >= 0 && !/\.(stop|resolve|reject)\(/.test(text))
      add(
        "operation-cleanup",
        "Review operation cleanup; no stop/resolve/reject call appears in this file.",
        begin,
      );
    const hover = text.indexOf("data-sonant-hover");
    if (hover >= 0)
      add(
        "hover-density",
        "Review hover density and keep hover opt-in, especially in lists.",
        hover,
      );
    const error = text.search(/\.emit\(["']state\.(error|success)["']/);
    if (
      error >= 0 &&
      !/visibleEquivalent\s*:\s*true|role=["'](status|alert)["']|aria-live/.test(text)
    )
      add(
        "visible-equivalent",
        "Review visual or announced feedback; no local explicit equivalent was detected.",
        error,
      );
    const realm = text.indexOf("instanceof Element");
    if (realm >= 0)
      add(
        "realm-check",
        "Use capability checks when an integration can cross iframe realms.",
        realm,
      );
  }
  return findings;
}

export async function run(argv = process.argv.slice(2)) {
  const [command = "help", ...args] = argv;
  const valued = new Set(["--cwd", "--theme", "--profile", "--volume", "--out"]);
  const boolean = new Set(["--enabled", "--dry-run", "--strict", "--json", "--help"]);
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (valued.has(token)) {
      if (!args[i + 1] || args[i + 1].startsWith("--"))
        throw new Error(`Missing value for ${token}`);
      flags[token] = args[++i];
    } else if (boolean.has(token)) flags[token] = "true";
    else if (token.startsWith("--")) throw new Error(`Unknown option: ${token}`);
    else positional.push(token);
  }
  const root = resolve(flags["--cwd"] ?? process.cwd());
  const dryRun = !!flags["--dry-run"];
  if (["help", "--help", "-h"].includes(command) || flags["--help"]) {
    console.log(help);
    return 0;
  }
  if (command === "--version" || command === "-v") {
    console.log("0.1.0");
    return 0;
  }
  if (command === "list") {
    for (const [name, entry] of Object.entries(registry))
      console.log(`${name.padEnd(18)} ${entry.description}`);
    return 0;
  }
  if (command === "init") {
    const config = createConfig({
      theme: flags["--theme"] as ThemeName | undefined,
      profile: flags["--profile"] as Profile | undefined,
      volume: flags["--volume"] === undefined ? 0.35 : Number(flags["--volume"]),
      enabled: !!flags["--enabled"],
    });
    await writeFiles(root, kitFiles(config), dryRun);
    console.log(
      "\nNext: install @alvarovillalbaa/sonant and wrap your client tree with SonantProvider.",
    );
    console.log("Add sound-settings for explicit opt-in and device-local controls.");
    return 0;
  }
  if (command === "add") {
    if (!positional.length || positional.some((name) => !Object.hasOwn(registry, name)))
      throw new Error("Choose an item from `sonant list`.");
    const config = await configAt(root);
    const files: Record<string, string> = {};
    for (const name of positional as RegistryItem[])
      files[`${config.directory}/${registry[name].file}`] = registry[name].source;
    await writeFiles(root, files, dryRun);
    return 0;
  }
  if (command === "audit") {
    const findings = await audit(root);
    if (flags["--json"])
      console.log(JSON.stringify({ kind: "heuristic-review", findings }, null, 2));
    else {
      console.log(
        "Sonant source review — advisory heuristics, not control-flow or accessibility proof.\n",
      );
      for (const f of findings) console.log(`${f.file}:${f.line} [${f.rule}] ${f.message}`);
      console.log(
        `\n${findings.length} review hint(s). Listening and runtime checks are still required.`,
      );
    }
    return flags["--strict"] && findings.length ? 1 : 0;
  }
  if (["test", "export", "compile"].includes(command)) {
    let theme: SoundTheme;
    const themeName = flags["--theme"] ?? "studio";
    if (!["studio", "soft", "arcade"].includes(themeName)) throw new Error("Unknown theme.");
    if (command === "compile") {
      const config = await configAt(root);
      theme = JSON.parse(
        await readFile(await safePath(root, `${config.directory}/theme.json`), "utf8"),
      );
    } else theme = createTheme(themeName as ThemeName);
    if (!validateTheme(theme))
      throw new Error("Theme does not implement the complete valid event contract.");
    if (command === "test") {
      let maxPeak = 0;
      let maxTail = 0;
      for (const [event] of catalog) {
        const pcm = renderPCM(theme[event]);
        const peak = pcm.reduce((max, x) => Math.max(max, Math.abs(x)), 0);
        const tail = pcm.slice(-440).reduce((max, x) => Math.max(max, Math.abs(x)), 0);
        maxPeak = Math.max(maxPeak, peak);
        maxTail = Math.max(maxTail, tail);
        if (peak > 0.5 || !pcm.every(Number.isFinite) || tail > 0.001)
          throw new Error(`Acoustic gate failed: ${event}`);
      }
      console.log(
        `PASS ${catalog.length}/${catalog.length} recipes: finite samples, peak ≤ 0.5, final 10ms ≤ 0.001.`,
      );
      console.log(
        `Observed peak ${maxPeak.toFixed(4)}, tail ${maxTail.toFixed(6)}. Not a perceptual loudness or true-peak certification.`,
      );
      return 0;
    }
    const out = flags["--out"] ?? "sonant-assets";
    const files: Record<string, string | Uint8Array> = {};
    const manifest = catalog.map(([event]) => {
      const bytes = encodeWav(renderPCM(theme[event]));
      const file = `${event}.wav`;
      files[`${out}/${file}`] = bytes;
      return {
        event,
        file,
        duration: theme[event].duration,
        license: "MIT",
        author: "Alvaro Villalba",
        source: "Original deterministic Sonant recipe",
        sha256: createHash("sha256").update(bytes).digest("hex"),
      };
    });
    files[`${out}/manifest.json`] =
      JSON.stringify(
        { schemaVersion: 1, sampleRate: 44100, channels: 1, encoding: "PCM16", cues: manifest },
        null,
        2,
      ) + "\n";
    if (command === "compile")
      files[`${out}/theme.ts`] =
        `import type { SoundTheme } from "@alvarovillalbaa/sonant";\nexport const theme: SoundTheme = ${JSON.stringify(theme, null, 2)};\n`;
    await writeFiles(root, files, dryRun);
    return 0;
  }
  throw new Error(`Unknown command: ${command}. Run sonant --help.`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`Sonant: ${error.message}`);
      process.exitCode = 1;
    });
}
