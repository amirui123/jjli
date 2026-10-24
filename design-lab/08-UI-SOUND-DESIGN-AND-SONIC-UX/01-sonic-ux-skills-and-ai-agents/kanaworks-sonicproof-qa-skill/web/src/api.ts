// Typed client for the local workbench API (src/sonicproof/server.py).
import { toast } from "./dom";
import { t, tm } from "./i18n";

export interface Alternative {
  text: string;
  score: number;
  category: string | null;
  agrees: boolean;
}

export interface Check {
  file: string;
  prompt: string;
  prompt_source: string;
  score: number;
  verdict: Verdict;
  cosine: number;
  z_clip: number;
  z_prompt: number;
  vocab_rank: number;
  vocab_size: number;
  heard_as: Alternative[];
}

export interface QcCheck {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  value: string;
  hint: string;
  code: string;
  data: Record<string, number | string | null>;
}

export interface Qc {
  file: string;
  status: "pass" | "warn" | "fail";
  duration: number;
  sample_rate: number;
  channels: number;
  checks: QcCheck[];
}

export type Verdict = "strong" | "plausible" | "weak" | "miss";
export type Overall = "ship" | "review" | "redo";

export interface Item {
  id: string;
  name: string;
  path: string;
  digest: string;
  prompt: string | null;
  prompt_source: "sidecar" | "user" | null;
  seed: number | null;
  loop: boolean;
  status: "queued" | "working" | "done" | "error";
  check: Check | null;
  qc: Qc | null;
  heard_as: Alternative[] | null;
  suggest: string[] | null;
  overall: Overall | null;
  note: string | null;
  error: string | null;
  error_code: string | null;
}

export interface Group {
  key: string;
  prompt: string | null;
  pick: string | null;
  settled: boolean;
  suggest: string[] | null;
  items: Item[];
}

export interface InboxState {
  version: number;
  groups: Group[];
  count: number;
  settings: { target_lufs: number | null };
}

export interface CacheUsage {
  path: string;
  embeddings: number;
  thumbnails: number;
  indexes: number;
  indexes_unused: number;
  uploads: number;
  uploads_unused: number;
  total: number;
}

export interface Job<R = unknown> {
  id: string;
  kind: string;
  label: string;
  status: "queued" | "running" | "done" | "error" | "cancelled";
  done: number;
  total: number;
  result: R;
  error: string | null;
  error_code: string | null;
  cancel_requested?: boolean;
}

export interface Status {
  version: string;
  model: string;
  model_cached: boolean;
  loaded: null | "audio" | "vision";
  jobs: Job[];
  state: number;
  libraries: string[];
}

export interface Uploaded {
  path: string | null; // null when the file could not be read (kind "broken")
  name: string;
  kind: "audio" | "image" | "video" | "broken";
  error_code?: string;
}

export interface Thumb {
  duration: number;
  sample_rate: number;
  channels: number;
  peaks: [number, number][];
  spec: string;
  spec_rows: number;
  spec_cols: number;
}

export interface LibEntry {
  path: string;
  size: number;
  duration: number;
  sample_rate: number;
  channels: number;
  lossless: boolean;
  lufs: number | null;
  peak_db: number;
  heard_as: string;
}

export interface LibraryView {
  library: string;
  files: number;
  duration: number;
  entries: LibEntry[];
  update?: { added: number; changed: number; removed: number; unchanged: number; failed: string[] };
}

export interface Hit {
  path: string;
  score: number;
  cosine: number;
  verdict: Verdict | null;
  heard_as: string | null;
  duration: number;
}

export interface SearchResult {
  library: string;
  mode: "words" | "like" | "picture";
  query: string | null;
  results: Hit[];
  like?: string;
  picture?: string;
}

export interface DupMember {
  path: string;
  relation: "keep" | "identical" | "same audio" | "trimmed" | "same start";
  match: number;
  similarity: number;
  duration: number;
  sample_rate: number;
  channels: number;
  lossless: boolean;
  size: number;
}

export interface DedupeResult {
  library: string;
  files: number;
  groups: { keep: string; reason: string; members: DupMember[]; reclaimable_bytes: number }[];
  redundant_files: number;
  reclaimable_bytes: number;
}

export interface Pictured {
  text: string;
  score: number;
  category: string | null;
}

export interface Described {
  picture: string;
  kind: "image" | "video";
  frames: number;
  pictured_as: Pictured[];
}

export interface FitResult {
  file: string;
  picture: string;
  picture_kind: "image" | "video";
  frames: number;
  scene: string | null;
  score: number;
  verdict: Verdict;
  cosine: number;
  z_direct: number;
  z_described: number;
  z_scene: number | null;
  pictured_as: Alternative[];
  heard_as: Alternative[];
  qc: string | null;
}

export interface FsListing {
  path: string;
  parent: string | null;
  dirs: { name: string; path: string }[];
  audio_files: number;
  indexed: boolean;
  home: string;
  places: { name: string; path: string }[];
  recent: string[];
}

/** An error from the local server: `message` is already in the UI language, `detail` is the server's text. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
    readonly status: number,
    readonly detail: string = "",
  ) {
    super(message);
  }
}

/** The UI-language message for a server error code (falls back to the server's English text). */
export function errorMessage(code: string | null, detail: string, status = 400): string {
  const known = code ? tm("errors.codes", code) : undefined;
  if (known) return known;
  if (status >= 500 || !detail) return t("errors.server");
  return detail;
}

/** The text to show for anything thrown (no "Error:" prefix). */
export function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Toast a caught error; a task the user stopped is not an error. */
export function toastError(e: unknown) {
  toast(errText(e), e instanceof ApiError && e.code === "cancelled" ? "info" : "error");
}

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "content-type": "application/json" };
  }
  let r: Response;
  try {
    r = await fetch(url, init);
  } catch {
    throw new ApiError(t("errors.network"), "network", 0);
  }
  if (!r.ok) {
    let detail = "";
    let code: string | null = null;
    try {
      const j = await r.json();
      if (typeof j.detail === "string") detail = j.detail;
      if (typeof j.code === "string") code = j.code;
    } catch {
      /* not json */
    }
    throw new ApiError(errorMessage(code, detail, r.status), code, r.status, detail);
  }
  return r.json() as Promise<T>;
}

export const api = {
  status: () => req<Status>("GET", "/api/status"),
  inbox: () => req<InboxState>("GET", "/api/inbox"),
  addPaths: (paths: string[]) =>
    req<{ added: number; skipped: number; job: string | null }>("POST", "/api/inbox/paths", { paths }),
  uploadInbox: (files: File[], paths: string[]) =>
    req<{ added: number; skipped: number; job: string | null }>("POST", "/api/inbox/upload", form(files, paths)),
  updateItem: (id: string, body: { prompt?: string | null; loop?: boolean }) =>
    req<{ item: Item; job: string }>("PATCH", `/api/inbox/${id}`, body),
  removeItem: (id: string) => req("DELETE", `/api/inbox/${id}`),
  clearInbox: () => req("DELETE", "/api/inbox"),
  cache: () => req<CacheUsage>("GET", "/api/cache"),
  clearCache: () => req<{ freed: number; usage: CacheUsage }>("POST", "/api/cache/clear"),
  reanalyze: (ids?: string[]) => req<{ job: string }>("POST", "/api/inbox/reanalyze", { ids }),
  settings: (s: { target_lufs: number | null }) => req("POST", "/api/settings", s),
  upload: (files: File[], paths: string[] = []) =>
    req<{ files: Uploaded[] }>("POST", "/api/upload", form(files, paths)),
  thumb: (path: string) => req<Thumb>("GET", `/api/thumb?path=${encodeURIComponent(path)}`),
  fs: (path?: string) => req<FsListing>("GET", `/api/fs${path ? `?path=${encodeURIComponent(path)}` : ""}`),
  openLibrary: (path: string) => req<{ job: string }>("POST", "/api/library/open", { path }),
  search: (body: { path: string; query?: string | null; like?: string; picture?: string; top?: number }) =>
    req<{ job: string }>("POST", "/api/library/search", body),
  dedupe: (path: string) => req<{ job: string }>("POST", "/api/library/dedupe", { path }),
  describe: (picture: string) => req<{ job: string }>("POST", "/api/picture/describe", { picture }),
  fit: (body: { picture: string; items?: string[]; files?: string[]; scene?: string; own?: boolean }) =>
    req<{ job: string }>("POST", "/api/picture/fit", body),
  job: <R>(id: string) => req<Job<R>>("GET", `/api/jobs/${id}`),
  cancelJob: (id: string) => req<Job>("POST", `/api/jobs/${id}/cancel`),
};

export const media = (path: string) => `/api/media?path=${encodeURIComponent(path)}`;

function form(files: File[], paths: string[]): FormData {
  const fd = new FormData();
  files.forEach((f, i) => {
    fd.append("files", f, f.name);
    fd.append("paths", paths[i] || f.name);
  });
  return fd;
}

/** Poll a job until it settles; onProgress sees every update. */
export async function waitJob<R>(id: string, onProgress?: (j: Job<R>) => void): Promise<R> {
  for (;;) {
    const j = await api.job<R>(id);
    onProgress?.(j);
    if (j.status === "done") return j.result;
    if (j.status === "error" || j.status === "cancelled") {
      throw new ApiError(errorMessage(j.error_code, j.error ?? ""), j.error_code, 0, j.error ?? "");
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}
