#!/usr/bin/env node
/**
 * One-time (per machine) setup for the audit browsers.
 *
 * What it does
 *  1. Downloads the statically-linked Chromium bundled in @sparticuz/chromium
 *     (npm, allowed here) into /tmp/chromium and records the path.
 *  2. Rebuilds the two shared libraries Chrome needs but this image lacks:
 *       - NSS  (libnss3, libnssutil3, libsoftokn3) from the `chrome-aws-lambda`
 *         npm tarball (same binaries AWS ships for Chrome; MPL-2.0/GPL-compatible)
 *       - NSPR (libnspr4, libplc4, libplds4) compiled from mozilla/nspr (MPL-2.0)
 *  3. Writes them to .tooling/browser-libs so every launcher can use
 *     LD_LIBRARY_PATH instead of touching system directories.
 *
 * Nothing is installed globally and no sudo is required.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { LIB_DIR } from "./lib/browser.mjs";

const NET = "https://registry.npmjs.org";
const log = (...a) => console.log("[tool:setup]", ...a);

async function main() {
  fs.mkdirSync(LIB_DIR, { recursive: true });

  // 1 ── Chromium ------------------------------------------------------------
  const pkg = await import("@sparticuz/chromium");
  const chromium = pkg.default ?? pkg;
  const exe = await chromium.executablePath();
  log("chromium ready →", exe);

  const missing = ["libnspr4.so", "libnss3.so", "libnssutil3.so", "libsoftokn3.so"].filter(
    (f) => !fs.existsSync(path.join(LIB_DIR, f))
  );
  if (!missing.length) {
    log("browser libs already present — nothing to build");
    verify(exe);
    return;
  }
  log("building missing libs:", missing.join(", "));

  const tmp = fs.mkdtempSync("/tmp/tool-setup-");

  // 2 ── NSS from the chrome-aws-lambda tarball ------------------------------
  if (missing.some((f) => f.startsWith("libnss") || f.startsWith("libsoftokn"))) {
    const tgz = path.join(tmp, "cal.tgz");
    await download(`${NET}/chrome-aws-lambda/-/chrome-aws-lambda-10.1.0.tgz`, tgz);
    execFileSync("tar", ["xzf", tgz, "-C", tmp]);
    const br = path.join(tmp, "package/bin/aws.tar.br");
    const tar = path.join(tmp, "aws.tar");
    // node 22 has zlib.brotliDecompressSync
    const zlib = await import("node:zlib");
    fs.writeFileSync(tar, zlib.brotliDecompressSync(fs.readFileSync(br)));
    execFileSync("tar", ["xf", tar, "-C", tmp]);
    for (const f of ["libnss3.so", "libnssutil3.so", "libsoftokn3.so", "libexpat.so.1"]) {
      const src = path.join(tmp, "lib", f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(LIB_DIR, f));
    }
    log("NSS installed");
  }

  // 3 ── NSPR compiled from source ------------------------------------------
  if (missing.some((f) => f.startsWith("libnspr") || f.startsWith("libpl"))) {
    const src = path.join(tmp, "nspr.tar.gz");
    await download("https://codeload.github.com/mozilla/nspr/tar.gz/refs/heads/main", src);
    execFileSync("tar", ["xzf", src, "-C", tmp]);
    const nspr = path.join(tmp, "nspr-main");

    // This VM reports `uname -p` as "unknown", which makes NSPR's configure pick
    // a 32-bit (i386) build. Shim uname, and drop in minimal config.guess/sub.
    const shim = path.join(tmp, "shim");
    fs.mkdirSync(shim, { recursive: true });
    fs.writeFileSync(
      path.join(shim, "uname"),
      '#!/bin/sh\n[ "$1" = "-p" ] && { echo x86_64; exit 0; }\nexec /usr/bin/uname "$@"\n',
      { mode: 0o755 }
    );
    const aux = path.join(nspr, "build/autoconf");
    fs.mkdirSync(aux, { recursive: true });
    fs.writeFileSync(path.join(aux, "config.guess"), "#!/bin/sh\necho x86_64-pc-linux-gnu\n", {
      mode: 0o755,
    });
    fs.writeFileSync(
      path.join(aux, "config.sub"),
      '#!/bin/sh\ncase "$1" in ""|--) echo x86_64-pc-linux-gnu;; *) echo "$1";; esac\n',
      { mode: 0o755 }
    );

    execFileSync("sh", ["./configure", "--disable-debug", "--enable-optimize", "--enable-64bit"], {
      cwd: nspr,
      stdio: "pipe",
      env: { ...process.env, PATH: `${shim}:${process.env.PATH}` },
    });
    execFileSync("make", ["-j4"], {
      cwd: nspr,
      stdio: "pipe",
      env: { ...process.env, PATH: `${shim}:${process.env.PATH}` },
    });
    for (const f of ["libnspr4.so", "libplc4.so", "libplds4.so"]) {
      fs.copyFileSync(path.join(nspr, "dist/lib", f), path.join(LIB_DIR, f));
    }
    log("NSPR compiled and installed");
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  verify(exe);
}

function verify(exe) {
  const out = execFileSync(exe, ["--version"], {
    encoding: "utf8",
    env: { ...process.env, LD_LIBRARY_PATH: LIB_DIR },
  });
  log("verified:", out.trim());
}

/**
 * Node's TLS stack cannot verify some hosts here (codeload.github.com sends an
 * incomplete chain: UNABLE_TO_VERIFY_LEAF_SIGNATURE). curl handles it fine, so
 * prefer curl and fall back to fetch.
 */
async function download(url, dest) {
  try {
    execFileSync("curl", ["-sSL", "--fail", "-o", dest, url], { stdio: "pipe" });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return;
  } catch {
    /* fall through to fetch */
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

main().catch((e) => {
  console.error("[tool:setup] FAILED:", e.message);
  process.exit(1);
});
