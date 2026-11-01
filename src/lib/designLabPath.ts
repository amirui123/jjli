/**
 * Canonical paths for files in the generated Design Lab vault.
 * The "root" subcategory is a manifest grouping, not a real directory.
 */
export function designLabFileUrl(
  pillarId: string,
  subcategoryId: string,
  relativePath: string
): string {
  const segments = [
    pillarId,
    ...(subcategoryId === "root" ? [] : [subcategoryId]),
    ...relativePath.split("/").filter(Boolean),
  ];
  return `/design-lab/${segments.map(encodeURIComponent).join("/")}`;
}

/** Migrate URLs persisted by older builds that inserted the virtual "root" folder. */
export function normalizeDesignLabUrl(url: string): string {
  return url.replace(/(\/design-lab\/[^/]+)\/root(?=\/)/, "$1");
}
