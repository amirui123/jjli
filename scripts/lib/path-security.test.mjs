import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { isPathInside, resolvePathWithin } from "./path-security.mjs";

test("accepts normal descendants and rejects sibling-prefix tricks", () => {
  const root = path.resolve("/tmp/rtl-root");
  assert.equal(isPathInside(root, path.join(root, "assets", "app.js")), true);
  assert.equal(isPathInside(root, path.resolve("/tmp/rtl-root-evil/secret")), false);
  assert.equal(isPathInside(root, path.resolve("/tmp/other/secret")), false);
});

test("rejects traversal, absolute paths, drive paths and backslashes", () => {
  const root = path.resolve("/tmp/rtl-root");
  for (const candidate of ["../secret", "assets/../../secret", "/etc/passwd", "C:/Windows/win.ini", "assets\\secret", decodeURIComponent("assets/%2e%2e/secret"), ""]) {
    assert.equal(resolvePathWithin(root, candidate), null, candidate);
  }
});

test("resolves ordinary relative paths under the root", () => {
  const root = path.resolve("/tmp/rtl-root");
  assert.equal(resolvePathWithin(root, "assets/app.js"), path.join(root, "assets", "app.js"));
});

test("rejects symlinks whose real target escapes the static root", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rtl-path-test-"));
  const root = path.join(temp, "dist");
  const outside = path.join(temp, "outside");
  fs.mkdirSync(root);
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, "secret.txt"), "secret");
  try {
    fs.symlinkSync(outside, path.join(root, "linked"), "dir");
  } catch (error) {
    t.skip(`symlinks unavailable: ${error.message}`);
    return;
  }
  const candidate = resolvePathWithin(root, "linked/secret.txt");
  assert.ok(candidate);
  assert.equal(isPathInside(fs.realpathSync(root), fs.realpathSync(candidate)), false);
  fs.rmSync(temp, { recursive: true, force: true });
});
