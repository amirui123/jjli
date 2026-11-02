import path from "node:path";

export function isPathInside(root, candidate) {
  const absoluteRoot = path.resolve(root);
  const absoluteCandidate = path.resolve(candidate);
  const relative = path.relative(absoluteRoot, absoluteCandidate);

  const isRoot = relative === "";
  const isParent = relative === ".." || relative.startsWith(`..${path.sep}`);
  return isRoot || (!isParent && !path.isAbsolute(relative));
}

export function resolvePathWithin(root, relativePath) {
  if (
    typeof relativePath !== "string" ||
    !relativePath ||
    relativePath.includes("\0") ||
    relativePath.includes("\\") ||
    path.isAbsolute(relativePath) ||
    /^[a-zA-Z]:/.test(relativePath)
  ) {
    return null;
  }

  if (relativePath.split("/").some((segment) => segment === "..")) return null;

  const absoluteRoot = path.resolve(root);
  const candidate = path.resolve(absoluteRoot, relativePath);

  if (candidate === absoluteRoot || !isPathInside(absoluteRoot, candidate)) return null;
  return candidate;
}
