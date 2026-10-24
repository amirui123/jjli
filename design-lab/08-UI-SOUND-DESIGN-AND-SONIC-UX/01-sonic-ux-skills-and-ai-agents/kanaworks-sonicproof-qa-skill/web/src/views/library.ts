import { api, type DedupeResult, type FsListing, type Hit, type LibEntry, type LibraryView, type SearchResult, toastError, waitJob } from "../api";
import { copyText, h, ICON, put, svg, toast } from "../dom";
import { type Dropped, isAudio, isPicture } from "../drop";
import { bytes, duration, fixed, getLang, t, tv } from "../i18n";
import { changed, go, selKey, select, store } from "../store";
import { badge, meter, playable, scoreLabel, similarity } from "../viz";
import { button, emptyState, fileName, folderOf, header, jobLine, modal, section } from "./common";
import { followJob, refreshInbox } from "./inbox";

const L = () => store.library;

export async function openLibrary(root: string) {
  const lib = L();
  if (lib.root !== root) {
    lib.view = null;
    lib.search = null;
    lib.dedupe = null;
    lib.shown = 120;
  }
  lib.root = root;
  localStorage.setItem("sonicproof.library", root);
  changed("center", "sidebar");
  try {
    const { job } = await api.openLibrary(root);
    const view = await waitJob<LibraryView>(job, (j) => {
      lib.job = j;
      changed("center");
    });
    lib.view = view;
    const u = view.update;
    if (u && (u.added || u.changed || u.removed) && (u.unchanged || u.changed || u.removed)) {
      toast(t("library.updated", { added: u.added, changed: u.changed, removed: u.removed }));
    }
    if (u?.failed.length) toast(t("library.failed", { n: u.failed.length }), "warn");
  } catch (e) {
    toastError(e);
  }
  lib.job = null;
  changed("center", "panel", "sidebar");
}

export async function runSearch(body: { query?: string; like?: string; picture?: string }, label: string) {
  const lib = L();
  if (!lib.root) {
    toast(t("panel.searchNoLibrary"), "warn");
    return;
  }
  if (store.view !== "library") go("library");
  lib.tab = "sounds";
  lib.searchLabel = label;
  lib.search = null;
  changed("center");
  try {
    const { job } = await api.search({ path: lib.root, ...body, top: 40 });
    lib.search = await waitJob<SearchResult>(job, (j) => {
      lib.searchJob = j;
      changed("center");
    });
  } catch (e) {
    toastError(e);
  }
  lib.searchJob = null;
  changed("center", "panel");
}

export async function searchDropped(d: Dropped) {
  const i = d.files.findIndex((f) => isAudio(f.name) || isPicture(f.name));
  if (i < 0) {
    toast(t("drop.nothing"), "warn");
    return;
  }
  const f = d.files[i];
  let up;
  try {
    up = (await api.upload([f])).files[0];
  } catch (e) {
    toastError(e);
    return;
  }
  if (!up?.path) {
    toast(isAudio(f.name) ? t("errors.codes.unreadable") : t("picture.broken"), "error");
    return;
  }
  if (isAudio(f.name)) await runSearch({ like: up.path }, t("library.resultsLike", { name: f.name }));
  else await runSearch({ picture: up.path }, t("library.resultsPicture", { name: f.name }));
}

async function runDedupe() {
  const lib = L();
  if (!lib.root) return;
  lib.dedupe = null;
  try {
    const { job } = await api.dedupe(lib.root);
    lib.dedupe = await waitJob<DedupeResult>(job, (j) => {
      lib.dedupeJob = j;
      changed("center");
    });
  } catch (e) {
    toastError(e);
  }
  lib.dedupeJob = null;
  changed("center");
}

// -- center --------------------------------------------------------------------------------------
export function libraryCenter(): HTMLElement {
  const lib = L();
  if (!lib.root) {
    return h(
      "div",
      { class: "view" },
      header(t("library.title"), t("library.subtitle")),
      h(
        "div",
        { class: "dropzone static" },
        emptyState(ICON.library, t("library.emptyTitle"), t("library.emptyBody"), button(t("library.choose"), folderPicker, { icon: ICON.folder, kind: "primary" })),
      ),
    );
  }
  if (!lib.view && !lib.job) void openLibrary(lib.root);
  const v = lib.view;
  const stats = v ? t("library.indexed", { n: v.files, d: duration(v.duration) }) : "";
  const head = header(
    t("library.title"),
    "",
    button(t("library.change"), folderPicker, { icon: ICON.folder, kind: "quiet" }),
    button(t("library.reindex"), () => openLibrary(lib.root!), { icon: ICON.refresh, kind: "quiet", disabled: !!lib.job }),
  );
  head.querySelector(".sub")!.replaceWith(
    h("p", { class: "sub lib-path" }, svg(ICON.folder), h("span", { class: "mono ellipsis", title: lib.root }, lib.root), stats ? h("span", { class: "dim nowrap" }, `· ${stats}`) : null),
  );
  const tabs = h(
    "div",
    { class: "tabs" },
    tab("sounds", t("library.sounds"), ICON.wave),
    tab("dupes", t("library.duplicates"), ICON.dupes),
  );
  const body =
    lib.tab === "dupes"
      ? dupesView()
      : lib.search || lib.searchJob
        ? resultsView()
        : v
          ? soundsView(v)
          : null;
  return h("div", { class: "view" }, head, tabs, jobLine(lib.job, t("library.indexing")), body);
}

function tab(id: "sounds" | "dupes", label: string, icon: string) {
  return h(
    "button",
    {
      class: `tab${L().tab === id ? " on" : ""}`,
      onclick: () => {
        L().tab = id;
        changed("center");
      },
    },
    svg(icon),
    label,
  );
}

function soundsView(v: LibraryView): HTMLElement {
  if (!v.entries.length) return h("p", { class: "note dim pad" }, t("library.noSounds"));
  const lib = L();
  const rows = v.entries.slice(0, lib.shown).map((e) => entryCard(e));
  const more = v.entries.length - lib.shown;
  return h(
    "div",
    { class: "rows" },
    rows,
    more > 0
      ? h(
          "button",
          {
            class: "btn quiet more",
            onclick: () => {
              lib.shown += 200;
              changed("center");
            },
          },
          t("library.showMore", { n: Math.min(more, 200) }),
        )
      : null,
  );
}

function abs(rel: string): string {
  return `${L().root}/${rel}`;
}

function entryCard(e: LibEntry | undefined, hit?: Hit, rank?: number): HTMLElement {
  const path = abs(e?.path ?? hit!.path);
  const rel = e?.path ?? hit!.path;
  const sel = selKey({ kind: "lib", path: rel });
  const { btn, wave } = playable(path, { height: 34 });
  const heard = hit?.heard_as ?? e?.heard_as;
  return h(
    "article",
    {
      class: `row-card${store.selected && selKey(store.selected) === sel ? " selected" : ""}`,
      dataset: { sel },
      tabindex: 0,
      onclick: () => select({ kind: "lib", path: rel }),
      onkeydown: (ev: KeyboardEvent) => {
        if (ev.key === " ") {
          ev.preventDefault();
          btn.click();
        }
      },
    },
    h("span", { class: "rank mono" }, rank !== undefined ? String(rank) : ""),
    btn,
    h(
      "div",
      { class: "row-main" },
      h(
        "div",
        { class: "row-title" },
        h("span", { class: "card-name", title: rel }, fileName(rel)),
        folderOf(rel) ? h("span", { class: "dim ellipsis small" }, folderOf(rel)) : null,
      ),
      heard ? h("div", { class: "row-heard dim ellipsis" }, tv(heard)) : null,
    ),
    h("div", { class: "row-wave" }, wave.el),
    hit
      ? hit.verdict
        ? h("div", { class: "row-score" }, h("div", { class: "verdict" }, badge(hit.verdict), scoreLabel(hit.score, hit.verdict)), meter(hit.score, hit.verdict))
        : store.pro
          ? h("div", { class: "row-score" }, h("span", { class: "score mono" }, fixed(hit.score, 3)), h("span", { class: "dim small" }, t("library.similarity")))
          : h(
              "div",
              { class: "row-score" },
              h("span", { class: "score plain" }, h("small", null, t("plain.similar")), String(similarity(hit.score))),
            )
      : h("div", { class: "row-score" }, store.pro && e?.lufs != null ? h("span", { class: "mono dim right" }, `${e.lufs.toFixed(1)} LUFS`) : null),
    h("span", { class: "dur mono" }, duration(e?.duration ?? hit!.duration)),
  );
}

function resultsView(): HTMLElement {
  const lib = L();
  const r = lib.search;
  const entries = new Map((lib.view?.entries ?? []).map((e) => [e.path, e]));
  return h(
    "div",
    { class: "results" },
    h(
      "div",
      { class: "results-head" },
      svg(ICON.search),
      h("b", null, t("library.results")),
      h("span", { class: "ellipsis" }, lib.searchLabel),
      h("span", { class: "spacer" }),
      button(t("library.clearSearch"), () => {
        lib.search = null;
        changed("center", "panel");
      }, { kind: "quiet", icon: ICON.close }),
    ),
    jobLine(lib.searchJob, t("common.working")),
    r
      ? r.results.length
        ? h("div", { class: "rows" }, r.results.map((hit, i) => entryCard(entries.get(hit.path), hit, i + 1)))
        : h("p", { class: "note dim pad" }, t("library.noResults"))
      : null,
  );
}

function dupesView(): HTMLElement {
  const lib = L();
  const d = lib.dedupe;
  const intro = h(
    "div",
    { class: "dupes-intro" },
    h("p", { class: "note" }, t("library.dedupeIntro")),
    button(t("library.dedupeRun"), runDedupe, { kind: d ? "ghost" : "primary", icon: ICON.dupes, disabled: !!lib.dedupeJob }),
  );
  const prog = jobLine(lib.dedupeJob, t("common.comparing"));
  if (!d) return h("div", { class: "dupes" }, intro, prog);
  if (!d.groups.length) return h("div", { class: "dupes" }, intro, h("p", { class: "note ok pad" }, t("library.dedupeNone", { n: d.files })));
  return h(
    "div",
    { class: "dupes" },
    intro,
    prog,
    h(
      "div",
      { class: "dupes-summary" },
      h("b", null, t("library.dedupeSummary", { groups: d.groups.length, redundant: d.redundant_files, bytes: bytes(d.reclaimable_bytes) })),
      h("span", { class: "dim" }, t("library.dedupeNothingDeleted")),
    ),
    d.groups.map((g) =>
      h(
        "div",
        { class: "dupe-group" },
        h(
          "div",
          { class: "dupe-head" },
          h("b", null, fileName(g.keep)),
          h("span", { class: "dim" }, t("library.keepReason", { reason: keepReason(g.reason) })),
          h("span", { class: "spacer" }),
          h("span", { class: "mono dim" }, bytes(g.reclaimable_bytes)),
        ),
        g.members.map((m) => {
          const { btn } = playable(abs(m.path));
          return h(
            "div",
            { class: `dupe-row r-${m.relation.replace(" ", "-")}` },
            btn,
            h("span", { class: "rel" }, t(`library.relation.${m.relation}`)),
            h("span", { class: "card-name ellipsis", title: m.path }, m.path),
            h(
              "span",
              { class: "mono dim small" },
              `${m.duration.toFixed(2)} s · ${m.sample_rate / 1000} kHz · ${m.channels} ch · ${t(m.lossless ? "library.lossless" : "library.lossy")}`,
            ),
            h(
              "span",
              { class: "mono dim small match" },
              m.relation === "keep" || (!store.pro && m.relation !== "identical")
                ? ""
                : m.relation === "identical"
                  ? t("library.sameBytes")
                  : t("library.match", { v: m.match.toFixed(3) }),
            ),
          );
        }),
      ),
    ),
  );
}

// -- panel -----------------------------------------------------------------------------------------
export function searchBox(): HTMLElement {
  const lib = L();
  const input = h("input", {
    class: "search-input",
    type: "search",
    placeholder: lib.root ? t("panel.searchPlaceholder") : t("panel.searchNoLibrary"),
    disabled: !lib.root,
    value: lib.search?.mode === "words" ? (lib.search.query ?? "") : "",
  });
  const go = () => {
    const q = input.value.trim();
    if (q) void runSearch({ query: q }, t("library.resultsFor", { q }));
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing) go();
  });
  return h("div", { class: "search" }, svg(ICON.search), input);
}

export function libraryPanel(): HTMLElement[] {
  const lib = L();
  const out: HTMLElement[] = [];
  const sel = store.selected;
  const e = sel?.kind === "lib" ? lib.view?.entries.find((x) => x.path === sel.path) : undefined;
  if (!e) {
    out.push(h("p", { class: "note dim" }, t("drop.overlaySearch")));
    return out;
  }
  const path = abs(e.path);
  const hit = lib.search?.results.find((x) => x.path === e.path);
  out.push(
    h(
      "div",
      { class: "psummary" },
      h("div", { class: "psum-name", title: path }, fileName(e.path)),
      h("div", { class: "dim small mono ellipsis" }, folderOf(e.path)),
      hit?.verdict
        ? h("div", { class: "psum-score" }, badge(hit.verdict), scoreLabel(hit.score, hit.verdict), h("span", { class: "dim ellipsis" }, lib.searchLabel))
        : null,
      hit?.verdict ? meter(hit.score, hit.verdict) : null,
    ),
  );
  out.push(section(t("panel.heardAs"), h("p", { class: "heard-one" }, tv(e.heard_as)), { tip: t("panel.heardAsTip") }));
  out.push(
    section(
      t("scorecard.format"),
      h(
        "dl",
        { class: "kv" },
        h("dt", null, t("library.fmtAudio")),
        h("dd", { class: "mono" }, `${duration(e.duration)} · ${e.sample_rate / 1000} kHz · ${e.channels} ch · ${t(e.lossless ? "library.lossless" : "library.lossy")}`),
        h("dt", null, t("library.fmtLoudness")),
        h("dd", { class: "mono" }, e.lufs !== null ? `${e.lufs.toFixed(1)} LUFS · ${t("library.peak")} ${fixed(e.peak_db, 1)} dBFS` : "—"),
        h("dt", null, t("library.fmtSize")),
        h("dd", { class: "mono" }, bytes(e.size)),
      ),
    ),
  );
  out.push(
    h(
      "div",
      { class: "pactions" },
      button(t("panel.findSimilar"), () => runSearch({ like: path }, t("library.resultsLike", { name: fileName(e.path) })), { icon: ICON.search }),
      button(t("panel.addToInbox"), async () => {
        const r = await api.addPaths([path]);
        await refreshInbox();
        if (r.added) toast(t("drop.added", { n: r.added }));
        else if (r.skipped) toast(t("drop.skipped", { n: r.skipped }), "warn");
        void followJob(r.job);
      }, { icon: ICON.inbox }),
      button(t("panel.copyPath"), async () => {
        await copyText(path);
        toast(t("common.copied"));
      }, { icon: ICON.file, kind: "quiet" }),
    ),
  );
  return out;
}

// -- folder picker ---------------------------------------------------------------------------------
export function folderPicker() {
  const list = h("div", { class: "picker-list" });
  const side = h("div", { class: "picker-side" });
  const pathInput = h("input", { class: "path-input mono", placeholder: t("picker.pathPlaceholder") });
  const info = h("div", { class: "picker-info" });
  let cur: FsListing | null = null;
  const useBtn = button(t("picker.use"), () => {
    if (!cur) return;
    m.close();
    void openLibrary(cur.path);
  }, { kind: "primary", icon: ICON.check });

  const load = async (p?: string) => {
    try {
      cur = await api.fs(p);
    } catch (e) {
      toastError(e);
      return;
    }
    pathInput.value = cur.path;
    put(
      list,
      cur.parent ? h("button", { class: "picker-row up", onclick: () => load(cur!.parent!) }, svg(ICON.up), t("picker.up")) : null,
      ...cur.dirs.map((d) => h("button", { class: "picker-row", onclick: () => load(d.path) }, svg(ICON.folder), d.name)),
    );
    put(
      info,
      h("span", null, cur.audio_files ? t("picker.audioHere", { n: cur.audio_files }) : t("picker.noAudioHere")),
      cur.indexed ? h("span", { class: "chip ok" }, t("picker.indexedAlready")) : null,
    );
    put(
      side,
      h("h4", null, t("picker.places")),
      h("button", { class: "picker-row", onclick: () => load(cur!.home) }, svg(ICON.folder), "~"),
      ...cur.places.map((pl) => h("button", { class: "picker-row", onclick: () => load(pl.path) }, svg(ICON.folder), pl.name)),
      cur.recent.length ? h("h4", null, t("picker.recent")) : null,
      ...cur.recent.map((r) => h("button", { class: "picker-row", title: r, onclick: () => load(r) }, svg(ICON.library), fileName(r))),
    );
  };
  pathInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void load(pathInput.value.trim());
  });
  const body = h(
    "div",
    { class: "picker" },
    h("div", { class: "picker-bar" }, pathInput, button(t("picker.go"), () => load(pathInput.value.trim()), { kind: "quiet" })),
    h("div", { class: "picker-main" }, side, list),
    info,
  );
  const m = modal(t("picker.title"), body, { wide: true, footer: [button(t("common.cancel"), () => m.close(), { kind: "quiet" }), useBtn] });
  void load(L().root ?? undefined);
}

/** The server writes the keep reason in English; translate its fixed phrases. */
function keepReason(reason: string): string {
  if (getLang() !== "ja") return reason;
  const map: Record<string, string> = {
    lossless: "ロスレス",
    "wider frequency range": "周波数帯域が広い",
    stereo: "ステレオ",
    "longest (not trimmed)": "最長（カットなし）",
    "not clipped": "クリップなし",
    "higher level": "レベルが高い",
    "same range, lower rate": "同じ帯域でサンプルレートが低い",
    "equal quality — shortest path": "品質は同等 — パスが最短",
  };
  return reason
    .split(", ")
    .map((x) => map[x] ?? x)
    .join("、");
}
