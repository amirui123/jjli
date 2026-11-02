/**
 * Zero-dependency production static server for the RTL Motion Lab build.
 * - Brotli / gzip compression with in-memory caching
 * - immutable caching for hashed assets
 * - SPA fallback ONLY for navigation requests (never for missing .js/.json)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { isPathInside, resolvePathWithin } from "./lib/path-security.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../dist");
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".md", ".svg", ".txt"]);

const cache = new Map();

function cached(filePath, encoding) {
  const key = `${filePath}:${encoding}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const raw = fs.readFileSync(filePath);
  let out = raw;
  if (encoding === "br")
    out = zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } });
  else if (encoding === "gzip") out = zlib.gzipSync(raw, { level: 9 });
  cache.set(key, out);
  return out;
}

function send(req, res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": type,
    "Cache-Control":
      ext === ".html"
        ? "no-cache"
        : ext === ".json" || ext === ".md"
          ? "public, max-age=3600"
          : "public, max-age=31536000, immutable",
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };

  let body;
  const accept = String(req.headers["accept-encoding"] || "");
  if (COMPRESSIBLE.has(ext) && accept) {
    if (accept.includes("br")) {
      body = cached(filePath, "br");
      headers["Content-Encoding"] = "br";
    } else if (accept.includes("gzip")) {
      body = cached(filePath, "gzip");
      headers["Content-Encoding"] = "gzip";
    } else {
      body = fs.readFileSync(filePath);
    }
    headers["Vary"] = "Accept-Encoding";
  } else {
    body = fs.readFileSync(filePath);
  }

  headers["Content-Length"] = body.length;
  res.writeHead(status, headers);
  if (req.method === "HEAD") res.end();
  else res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relativePath = urlPath.replace(/^\/+/, "");
    let filePath = relativePath ? resolvePathWithin(ROOT, relativePath) : path.join(ROOT, "index.html");
    if (!filePath) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    try {
      const realRoot = fs.realpathSync(ROOT);
      let realFile = fs.realpathSync(filePath);
      if (!isPathInside(realRoot, realFile)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      if (fs.statSync(realFile).isDirectory()) {
        realFile = fs.realpathSync(path.join(realFile, "index.html"));
        if (!isPathInside(realRoot, realFile)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
      }
      if (fs.statSync(realFile).isFile()) {
        send(req, res, realFile);
        return;
      }
    } catch (error) {
      if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error;
    }

    // Only a browser navigation gets the SPA shell; missing assets are real 404s.
    const isNavigation =
      String(req.headers.accept || "").includes("text/html") && !path.extname(urlPath);

    if (isNavigation) {
      send(req, res, fs.realpathSync(path.join(ROOT, "index.html")));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`RTL Motion Lab static build serving at http://${HOST}:${PORT}`);
});
