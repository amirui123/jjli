// Minimal dependency-free static server for the @dalin/tactile demo.
// Serves files under the package root so the demo can import ../dist/*.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join, normalize } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 8137;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  res.setHeader("cache-control", "no-store"); // always serve fresh dist during dev
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  try {
    const p = pathname === "/" ? "/demo/index.html" : pathname;
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(PORT, () => console.log(`@dalin/tactile demo → http://localhost:${PORT}/`));
