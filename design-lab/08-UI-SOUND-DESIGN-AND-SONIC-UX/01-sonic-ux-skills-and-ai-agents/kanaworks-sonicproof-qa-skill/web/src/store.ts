import type {
  DedupeResult,
  Described,
  FitResult,
  InboxState,
  Job,
  LibraryView,
  SearchResult,
  Status,
} from "./api";

export type View = "inbox" | "library" | "picture";

export type Selection =
  | { kind: "item"; id: string }
  | { kind: "lib"; path: string }
  | { kind: "fit"; file: string }
  | null;

export interface LibraryState {
  root: string | null;
  view: LibraryView | null;
  job: Job | null; // indexing
  tab: "sounds" | "dupes";
  search: SearchResult | null;
  searchJob: Job | null;
  searchLabel: string;
  dedupe: DedupeResult | null;
  dedupeJob: Job | null;
  shown: number;
}

export interface PictureState {
  path: string | null;
  name: string;
  kind: "image" | "video" | null;
  broken: boolean; // the chosen file could not be read: shown, but nothing can run on it
  described: Described | null;
  describeJob: Job | null;
  scene: string;
  fit: FitResult[] | null;
  fitJob: Job | null;
  search: SearchResult | null;
}

export const store = {
  view: (localStorage.getItem("sonicproof.view") as View) || "inbox",
  status: null as Status | null,
  /** Pro mode: raw σ / cosine numbers everywhere instead of plain words and a 0–100 match. */
  pro: localStorage.getItem("sonicproof.pro") === "1",
  inbox: null as InboxState | null,
  selected: null as Selection,
  library: {
    root: localStorage.getItem("sonicproof.library"),
    view: null,
    job: null,
    tab: "sounds",
    search: null,
    searchJob: null,
    searchLabel: "",
    dedupe: null,
    dedupeJob: null,
    shown: 120,
  } as LibraryState,
  picture: {
    path: null,
    name: "",
    kind: null,
    broken: false,
    described: null,
    describeJob: null,
    scene: "",
    fit: null,
    fitJob: null,
    search: null,
  } as PictureState,
};

type Region = "sidebar" | "center" | "panel" | "all";
const subs = new Map<Region, Set<() => void>>();

export function on(region: Region, f: () => void) {
  if (!subs.has(region)) subs.set(region, new Set());
  subs.get(region)!.add(f);
}

let pending = new Set<Region>();
let scheduled = false;

/** Ask for regions to re-render on the next frame (batched). */
export function changed(...regions: Region[]) {
  regions.forEach((r) => pending.add(r));
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    const todo = pending.has("all") ? new Set<Region>(["sidebar", "center", "panel"]) : pending;
    pending = new Set();
    todo.forEach((r) => subs.get(r)?.forEach((f) => f()));
  });
}

export function selKey(sel: Selection): string {
  if (!sel) return "";
  return sel.kind === "item" ? `item:${sel.id}` : sel.kind === "lib" ? `lib:${sel.path}` : `fit:${sel.file}`;
}

/** Select a card: highlight it in place (no re-render, keeps scroll and players) and refresh the panel. */
export function select(sel: Selection) {
  store.selected = sel;
  const key = selKey(sel);
  document.querySelectorAll<HTMLElement>("[data-sel]").forEach((el) => {
    el.classList.toggle("selected", el.dataset.sel === key);
  });
  changed("panel");
}

export function setPro(on: boolean) {
  store.pro = on;
  localStorage.setItem("sonicproof.pro", on ? "1" : "0");
  document.body.classList.toggle("pro", on);
  changed("all");
}

export function go(view: View) {
  store.view = view;
  localStorage.setItem("sonicproof.view", view);
  store.selected = null;
  changed("all");
}
