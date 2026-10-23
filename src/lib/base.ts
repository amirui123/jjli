/**
 * Public asset URLs must respect the deployment base.
 *
 * Everything under /public is referenced with a root-absolute path ("/fonts/x.woff2")
 * because that is what Vite expects, but the same build also has to work when it is
 * served from a sub-path (GitHub Pages: /jjli/). `import.meta.env.BASE_URL` carries
 * that prefix, and this helper is the single place that applies it.
 *
 * On Vercel BASE_URL is "/", so `publicUrl` is a no-op there.
 */
/* `import.meta.env` only exists in a Vite build; the esbuild-based test harness
   has no env object, so read it defensively instead of throwing. */
const ENV = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const RAW_BASE = ENV.BASE_URL || "/";

export const BASE_PATH = RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`;

export function publicUrl(path: string): string {
  if (!path) return path;
  if (!path.startsWith("/")) return path; // absolute or relative: leave alone
  if (path.startsWith("//")) return path; // protocol-relative
  return BASE_PATH.replace(/\/$/, "") + path;
}

/** Absolute URL for the current document (used by previews that need one). */
export function absoluteUrl(path: string): string {
  const url = publicUrl(path);
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.href).href;
}
