import "./style.css";
import { api, ApiError, type CacheUsage, errText, toastError } from "./api";
import { h, ICON, put, svg, toast } from "./dom";
import { collect, isAudio, isPicture } from "./drop";
import { bytes, getLang, onLangChange, setLang, t } from "./i18n";
import { changed, go, on, setPro, store, type View } from "./store";
import { player } from "./viz";
import { button, fileName, modal } from "./views/common";
import { addDropped, inboxCenter, inboxPanel, refreshInbox } from "./views/inbox";
import { libraryCenter, libraryPanel, searchBox, searchDropped } from "./views/library";
import { pictureCenter, picturePanel, setPicture } from "./views/picture";

const sidebar = h("nav", { class: "sidebar" });
const center = h("main", { class: "center" });
const panel = h("aside", { class: "panel" });
const overlay = h("div", { class: "drop-overlay" }, h("div", { class: "drop-card" }));
document.getElementById("app")!.append(sidebar, center, panel, overlay);

// -- sidebar ---------------------------------------------------------------------------------------
function renderSidebar() {
  const nav = (id: View, icon: string, count: string | number | null) =>
    h(
      "button",
      { class: `nav${store.view === id ? " on" : ""}`, onclick: () => go(id) },
      svg(icon),
      h("span", { class: "nav-text" }, h("b", null, t(`nav.${id}`)), h("small", null, t(`nav.${id}Hint`))),
      count !== null && count !== "" ? h("span", { class: "count" }, String(count)) : null,
    );
  const st = store.status;
  const loading = st?.jobs.some((j) => j.label === "@model" || j.label === "@vision");
  const modelText = loading
    ? t(st!.jobs.some((j) => j.label === "@vision") ? "model.loadingVision" : "model.loading")
    : st?.loaded === "vision"
      ? t("model.vision")
      : st?.loaded === "audio"
        ? t("model.audio")
        : t("model.idle");
  const modelSub = st && !st.loaded && !loading ? (st.model_cached ? t("model.idleHint") : t("model.notCached")) : (st?.model ?? "");
  const libName = store.library.view ? store.library.view.files : store.library.root ? fileName(store.library.root) : null;
  sidebar.replaceChildren(
    h(
      "div",
      { class: "brand" },
      logo(),
      h("div", null, h("div", { class: "brand-name" }, "Sonicproof"), h("div", { class: "brand-sub" }, t("app.tagline"))),
    ),
    h(
      "div",
      { class: "navs" },
      nav("inbox", ICON.inbox, store.inbox?.count || null),
      nav("library", ICON.library, libName),
      nav("picture", ICON.picture, null),
    ),
    h("div", { class: "spacer" }),
    h(
      "div",
      { class: "side-foot" },
      h(
        "div",
        { class: `model-state${loading ? " loading" : st?.loaded ? " ready" : ""}` },
        h("i", { class: "led" }),
        h("div", null, h("div", null, modelText), h("small", { class: "ellipsis" }, modelSub)),
      ),
      h(
        "button",
        { class: "nav settings-btn", onclick: openSettings },
        svg(ICON.gear),
        h("span", { class: "nav-text" }, h("b", null, t("settings.title"))),
        store.pro ? h("span", { class: "count" }, t("settings.proShort")) : null,
      ),
      h(
        "div",
        { class: "lang", role: "group", "aria-label": t("settings.language") },
        svg(ICON.globe),
        (["en", "ja"] as const).map((l) =>
          h("button", { class: getLang() === l ? "on" : "", onclick: () => setLang(l) }, l === "en" ? "English" : "日本語"),
        ),
      ),
      h("div", { class: "local" }, h("i", { class: "led ready" }), t("app.local"), st ? h("span", { class: "dim" }, ` · v${st.version}`) : null),
    ),
  );
}

// -- settings --------------------------------------------------------------------------------------
function openSettings() {
  const target = h(
    "select",
    { class: "select" },
    [null, -14, -16, -18, -23].map((v) =>
      h("option", { value: v === null ? "" : String(v), selected: (store.inbox?.settings.target_lufs ?? null) === v }, v === null ? t("settings.targetNone") : `${v} LUFS`),
    ),
  );
  target.addEventListener("change", async () => {
    try {
      await api.settings({ target_lufs: target.value ? Number(target.value) : null });
      await refreshInbox();
    } catch (e) {
      toastError(e);
    }
  });
  const pro = h("input", { type: "checkbox", checked: store.pro });
  pro.addEventListener("change", () => setPro(pro.checked));
  const usage = h("div", { class: "cache-usage" }, h("span", { class: "dim" }, t("common.working")));
  const fill = async () => {
    let u: CacheUsage;
    try {
      u = await api.cache();
    } catch (e) {
      usage.replaceChildren(h("span", { class: "note err" }, errText(e)));
      return;
    }
    const row = (label: string, n: number, note?: string) =>
      h("div", { class: "cache-row" }, h("span", null, label), h("span", { class: "mono" }, bytes(n)), note ? h("small", { class: "dim" }, note) : null);
    usage.replaceChildren(
      row(t("settings.cacheEmbeddings"), u.embeddings, t("settings.cacheEmbeddingsNote")),
      row(t("settings.cacheThumbs"), u.thumbnails),
      row(t("settings.cacheIndexes"), u.indexes, u.indexes_unused ? t("settings.cacheUnused", { size: bytes(u.indexes_unused) }) : undefined),
      row(t("settings.cacheUploads"), u.uploads, u.uploads_unused ? t("settings.cacheUnused", { size: bytes(u.uploads_unused) }) : undefined),
      h("div", { class: "cache-row total" }, h("b", null, t("settings.cacheTotal")), h("b", { class: "mono" }, bytes(u.total))),
      h("div", { class: "dim small mono ellipsis", title: u.path }, u.path),
    );
  };
  void fill();
  const clear = button(
    t("settings.cacheClear"),
    async () => {
      if (!confirm(t("settings.cacheClearConfirm"))) return;
      try {
        const r = await api.clearCache();
        toast(t("settings.cacheCleared", { size: bytes(r.freed) }));
      } catch (e) {
        toast(errText(e), "warn");
      }
      await fill();
    },
    { icon: ICON.trash },
  );
  modal(
    t("settings.title"),
    h(
      "div",
      { class: "settings" },
      h("label", { class: "field" }, h("span", null, t("settings.target")), target, h("small", { class: "dim" }, t("settings.targetHint"))),
      h(
        "label",
        { class: "toggle" },
        pro,
        h("span", null, h("b", null, t("settings.pro")), h("small", { class: "dim block" }, t("settings.proHint"))),
      ),
      h("div", { class: "field" }, h("span", null, t("settings.cache")), usage, h("small", { class: "dim" }, t("settings.cacheHint")), h("div", null, clear)),
    ),
  );
}

function logo(): HTMLElement {
  // A shield (proof) holding a waveform.
  return svg(
    `<svg viewBox="0 0 32 32" class="logo"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ee0c3"/><stop offset="1" stop-color="#5aa9ff"/></linearGradient></defs>
    <path d="M16 3.5 26 7v8.2c0 6.3-4.2 10.9-10 13.3-5.8-2.4-10-7-10-13.3V7z" fill="none" stroke="url(#lg)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M10.5 15.5v2M13.2 12v9M16 9.5v13M18.8 12.5v8M21.5 14.5v4" stroke="url(#lg)" stroke-width="2" stroke-linecap="round"/></svg>`,
    "logo-wrap",
  );
}

// -- center / panel --------------------------------------------------------------------------------
function renderCenter() {
  const scroll = center.scrollTop;
  const view = store.view === "inbox" ? inboxCenter() : store.view === "library" ? libraryCenter() : pictureCenter();
  center.replaceChildren(view);
  center.scrollTop = scroll;
}

function renderPanel() {
  const active = document.activeElement;
  if (active && panel.contains(active) && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
    // don't yank the field the user is typing in; refresh once they leave it
    active.addEventListener("blur", () => changed("panel"), { once: true });
    return;
  }
  const body =
    store.view === "inbox" ? inboxPanel() : store.view === "library" ? libraryPanel() : picturePanel();
  put(
    panel,
    store.view !== "picture" ? h("div", { class: "panel-search" }, searchBox()) : null,
    h("div", { class: "panel-body" }, body),
  );
}

on("sidebar", renderSidebar);
on("center", renderCenter);
on("panel", renderPanel);
onLangChange(() => changed("all"));
window.addEventListener("popstate", () => changed("all"));

// -- drag & drop: anywhere in the window; meaning depends on the view and what is dropped -----------
let depth = 0;
function dropIntent(dt: DataTransfer | null): string {
  const types = Array.from(dt?.items ?? []).map((i) => i.type);
  const looksPicture = types.length > 0 && types.every((x) => x.startsWith("image/") || x.startsWith("video/"));
  if (store.view === "picture") return t("drop.overlayPicture");
  if (store.view === "library") return t("drop.overlaySearch");
  return looksPicture ? t("drop.overlayPicture") : t("drop.overlayInbox");
}
window.addEventListener("dragenter", (e) => {
  if (!e.dataTransfer?.types.includes("Files")) return;
  depth++;
  overlay.firstElementChild!.replaceChildren(svg(ICON.plus, "icon big"), h("div", null, dropIntent(e.dataTransfer)));
  overlay.classList.add("on");
});
window.addEventListener("dragleave", () => {
  depth = Math.max(0, depth - 1);
  if (!depth) overlay.classList.remove("on");
});
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", async (e) => {
  e.preventDefault();
  depth = 0;
  overlay.classList.remove("on");
  if (!e.dataTransfer) return;
  const d = await collect(e.dataTransfer);
  const hasAudio = d.files.some((f) => isAudio(f.name));
  const hasPicture = d.files.some((f) => isPicture(f.name));
  if (store.view === "picture" && hasPicture) return setPicture(d);
  if (store.view === "library" && (hasAudio || hasPicture)) return searchDropped(d);
  if (!hasAudio && hasPicture) {
    go("picture");
    return setPicture(d);
  }
  return addDropped(d);
});

// -- keep in sync with the server ------------------------------------------------------------------
let lastState = -1;
let failing = false; // tell the user once per outage, not on every retry
async function poll() {
  try {
    const st = await api.status();
    const busy = st.jobs.length > 0;
    const prevLoaded = store.status?.loaded;
    store.status = st;
    if (st.state !== lastState) {
      await refreshInbox();
      lastState = st.state; // only once the Inbox really is up to date, so a failed refresh is retried
    } else if (busy || prevLoaded !== st.loaded) changed("sidebar");
    failing = false;
    setTimeout(poll, busy ? 800 : 2500);
  } catch (e) {
    if (!failing) toast(e instanceof ApiError && e.code === "network" ? t("errors.offline") : errText(e), "warn");
    failing = true;
    setTimeout(poll, 4000);
  }
}

// any failed action nobody caught (a button's request, say) still tells the user, translated
window.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  toastError(e.reason);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.querySelector(".modal-back")) player.stop();
});

document.body.classList.toggle("pro", store.pro);
changed("all");
void poll();
