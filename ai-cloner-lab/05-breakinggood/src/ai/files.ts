/**
 * The model writes projects in a plain, provider-agnostic format:
 *
 *   === FILE: path/to/file.ext ===
 *   <contents>
 *   === END FILE ===
 *
 * This parses that back into a map. Robust to code fences the model
 * sometimes wraps around the whole thing.
 */
export function parseFileBlocks(text: string): Map<string, string> {
  const files = new Map<string, string>();
  const re = /^=== FILE: (.+?) ===\r?\n([\s\S]*?)^=== END FILE ===/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const rawPath = m[1].trim().replace(/^[`'"]|[`'"]$/g, "");
    let body = m[2];
    // Strip a surrounding ``` fence if the model added one inside the block.
    const fence = body.match(/^```[a-zA-Z0-9]*\r?\n([\s\S]*?)\r?\n```\s*$/);
    if (fence) body = fence[1] + "\n";
    if (!body.endsWith("\n")) body += "\n";
    files.set(normalise(rawPath), body);
  }
  return files;
}

function normalise(p: string): string {
  const slashPath = p.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(slashPath) || slashPath.startsWith("//")) {
    throw new Error(`Refusing absolute path: ${p}`);
  }
  const clean = slashPath.replace(/^\.\//, "").replace(/^\/+/, "");
  if (clean.split("/").includes("..")) throw new Error(`Refusing path with '..': ${p}`);
  return clean;
}

export const FILE_FORMAT_INSTRUCTIONS = `Output every file using EXACTLY this format, nothing else between blocks:

=== FILE: relative/path.ext ===
<full file contents>
=== END FILE ===

Rules: no markdown fences around blocks, no commentary outside blocks, every file complete (no "..." or "rest unchanged").`;
