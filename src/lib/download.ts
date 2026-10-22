import { createZip, type ZipEntry } from "./zip";

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  saveLink(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 6000);
}

function saveLink(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function saveText(text: string, filename: string, mime = "text/plain;charset=utf-8") {
  saveBlob(new Blob([text], { type: mime }), filename);
}

/** Fetches a same-origin asset and saves it with the given filename. */
export async function saveUrl(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    saveBlob(await res.blob(), filename);
    return true;
  } catch {
    // Fallback: plain anchor download (lets the browser stream it)
    try {
      saveLink(url, filename);
      return true;
    } catch {
      return false;
    }
  }
}

export interface KitFile {
  name: string;
  content: string | Blob;
}

/** Bundles several text/binary files into a single .zip and saves it. */
export async function saveKit(kitName: string, files: KitFile[]): Promise<boolean> {
  const entries: ZipEntry[] = [];
  for (const f of files) {
    if (typeof f.content === "string") {
      entries.push({ name: f.name, data: f.content });
    } else {
      entries.push({ name: f.name, data: new Uint8Array(await f.content.arrayBuffer()) });
    }
  }
  saveBlob(createZip(entries), `${kitName}.zip`);
  return true;
}

export async function fetchAsBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
