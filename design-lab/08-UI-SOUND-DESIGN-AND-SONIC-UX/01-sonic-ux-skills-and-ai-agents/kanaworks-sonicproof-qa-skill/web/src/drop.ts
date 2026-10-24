// Drag & drop of files and whole folders (keeps relative paths so .json sidecars stay next to their audio).

export interface Dropped {
  files: File[];
  paths: string[];
}

const AUDIO = /\.(wav|wave|flac|aif|aiff|caf|w64|mp3|ogg|oga|opus|m4a|aac|wma)$/i;
const IMAGE = /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i;
const VIDEO = /\.(mp4|mov|m4v|mkv|webm|avi|ogv|mpe?g|wmv)$/i;

export const isAudio = (name: string) => AUDIO.test(name);
export const isPicture = (name: string) => IMAGE.test(name) || VIDEO.test(name);
export const isVideo = (name: string) => VIDEO.test(name);
const isSidecar = (name: string) => /\.json$/i.test(name);

export async function collect(dt: DataTransfer): Promise<Dropped> {
  const out: Dropped = { files: [], paths: [] };
  const entries = Array.from(dt.items || [])
    .map((it) => (it.kind === "file" ? it.webkitGetAsEntry?.() : null))
    .filter((e): e is FileSystemEntry => !!e);
  if (!entries.length) {
    for (const f of Array.from(dt.files)) {
      out.files.push(f);
      out.paths.push(f.name);
    }
    return out;
  }
  await Promise.all(entries.map((e) => walk(e, "", out)));
  return out;
}

async function walk(entry: FileSystemEntry, prefix: string, out: Dropped): Promise<void> {
  if (entry.name.startsWith(".")) return;
  if (entry.isFile) {
    const file = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej));
    if (isAudio(file.name) || isPicture(file.name) || isSidecar(file.name)) {
      out.files.push(file);
      out.paths.push(prefix + file.name);
    }
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: FileSystemEntry[] = [];
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej));
      if (!batch.length) break;
      all.push(...batch);
    }
    await Promise.all(all.map((e) => walk(e, `${prefix}${entry.name}/`, out)));
  }
}

/** Files from an <input type=file> (webkitdirectory inputs carry webkitRelativePath). */
export function fromInput(input: HTMLInputElement): Dropped {
  const files = Array.from(input.files || []).filter(
    (f) => !f.name.startsWith(".") && (isAudio(f.name) || isPicture(f.name) || isSidecar(f.name)),
  );
  return { files, paths: files.map((f) => f.webkitRelativePath || f.name) };
}

/** Only the audio files, plus the sidecars that belong to them. */
export function audioOnly(d: Dropped): Dropped {
  const keep: Dropped = { files: [], paths: [] };
  d.files.forEach((f, i) => {
    if (isAudio(f.name) || isSidecar(f.name)) {
      keep.files.push(f);
      keep.paths.push(d.paths[i]);
    }
  });
  return keep;
}

export function pick(accept: string, opts: { multiple?: boolean; directory?: boolean } = {}): Promise<Dropped> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = !!opts.multiple;
    if (opts.directory) input.setAttribute("webkitdirectory", "");
    input.style.display = "none";
    input.addEventListener("change", () => {
      resolve(fromInput(input));
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  });
}
