import { api, type Described, type FitResult, media, type SearchResult, toastError, waitJob } from "../api";
import { copyText, h, ICON, svg, toast } from "../dom";
import { type Dropped, isPicture, isVideo, pick } from "../drop";
import { duration, fixed, sigma, t, tcat, tv } from "../i18n";
import { changed, selKey, select, store } from "../store";
import { badge, meter, playable, scoreLabel } from "../viz";
import { altList, button, details, emptyState, fileName, header, jobLine, section } from "./common";

const P = () => store.picture;

export async function setPicture(d: Dropped) {
  const i = d.files.findIndex((f) => isPicture(f.name));
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
  const p = P();
  Object.assign(p, {
    path: up?.path ?? null,
    name: f.name,
    kind: isVideo(f.name) ? "video" : "image",
    broken: !up?.path,
    described: null,
    fit: null,
    search: null,
  });
  select(null);
  changed("center", "panel");
  if (!up?.path) {
    toast(t("picture.broken"), "error");
    return;
  }
  try {
    const { job } = await api.describe(up.path);
    p.described = await waitJob<Described>(job, (j) => {
      p.describeJob = j;
      changed("center");
    });
  } catch (e) {
    toastError(e);
  }
  p.describeJob = null;
  changed("center", "panel");
}

async function runFit(opts: { own?: boolean }) {
  const p = P();
  if (!p.path) return;
  const items = (store.inbox?.groups ?? []).flatMap((g) => g.items.map((i) => i.id));
  p.fit = null;
  p.search = null;
  changed("center");
  try {
    const { job } = await api.fit({ picture: p.path, items: opts.own ? [] : items, scene: p.scene, own: opts.own });
    const r = await waitJob<{ results: FitResult[] }>(job, (j) => {
      p.fitJob = j;
      changed("center");
    });
    p.fit = r.results;
  } catch (e) {
    toastError(e);
  }
  p.fitJob = null;
  changed("center", "panel");
}

async function findInLibrary() {
  const p = P();
  const root = store.library.root;
  if (!p.path) return;
  if (!root) {
    toast(t("panel.searchNoLibrary"), "warn");
    return;
  }
  p.fit = null;
  p.search = null;
  changed("center");
  try {
    const { job } = await api.search({ path: root, picture: p.path, query: p.scene || null, top: 30 });
    p.search = await waitJob<SearchResult>(job, (j) => {
      p.fitJob = j;
      changed("center");
    });
  } catch (e) {
    toastError(e);
  }
  p.fitJob = null;
  changed("center", "panel");
}

// -- center --------------------------------------------------------------------------------------
export function pictureCenter(): HTMLElement {
  const p = P();
  const choose = async () => setPicture(await pick("image/*,video/*"));
  if (!p.path && !p.broken) {
    return h(
      "div",
      { class: "view" },
      header(t("picture.title"), t("picture.subtitle")),
      h(
        "div",
        { class: "dropzone" },
        emptyState(ICON.picture, t("picture.dropTitle"), t("picture.dropBody"), button(t("picture.choose"), choose, { icon: ICON.picture, kind: "primary" })),
      ),
    );
  }
  const nInbox = store.inbox?.count ?? 0;
  const preview = !p.path
    ? h("div", { class: "pic pic-broken" }, svg(ICON.picture, "icon big"), h("span", null, t("picture.broken")))
    : p.kind === "video"
      ? h("video", { src: media(p.path), controls: true, muted: true, preload: "metadata", playsInline: true, class: "pic" })
      : h("img", { src: media(p.path), alt: p.name, class: "pic" });
  if (preview instanceof HTMLVideoElement) preview.muted = true; // never makes a sound
  const scene = h("input", { class: "scene-input", placeholder: t("picture.scenePlaceholder"), value: p.scene });
  scene.addEventListener("input", () => (p.scene = scene.value));
  const busy = !!p.fitJob || !!p.describeJob || p.broken;
  const stage = h(
    "div",
    { class: "stage" },
    h("div", { class: "pic-frame" }, preview),
    h(
      "div",
      { class: "stage-side" },
      h("div", { class: "pic-name ellipsis", title: p.name }, p.name),
      h("div", { class: "dim small" }, p.kind === "video" ? (p.described ? t("picture.video", { n: p.described.frames }) : "video") : t("picture.image")),
      h("label", { class: "field" }, h("span", null, t("picture.scene")), scene),
      button(nInbox ? t("picture.fitInbox", { n: nInbox }) : t("picture.fitInboxNone"), () => runFit({}), {
        kind: "primary",
        icon: ICON.inbox,
        disabled: !nInbox || busy,
      }),
      button(t("picture.findInLibrary"), findInLibrary, { icon: ICON.library, disabled: busy || !store.library.root, title: store.library.root ? store.library.root : t("panel.searchNoLibrary") }),
      p.kind === "video" ? button(t("picture.ownSound"), () => runFit({ own: true }), { icon: ICON.wave, kind: "quiet", title: t("picture.ownSoundTip"), disabled: busy }) : null,
    ),
  );
  return h(
    "div",
    { class: "view" },
    header(t("picture.title"), t("picture.subtitle"), button(t("picture.replace"), choose, { icon: ICON.picture, kind: "quiet" })),
    stage,
    jobLine(p.describeJob, t("common.working")),
    jobLine(p.fitJob, t("common.listening")),
    p.fit ? fitList(p.fit) : null,
    p.search ? searchList(p.search) : null,
  );
}

function fitList(results: FitResult[]): HTMLElement {
  return h(
    "div",
    { class: "results" },
    h("div", { class: "results-head" }, svg(ICON.picture), h("b", null, t("picture.results"))),
    h(
      "div",
      { class: "rows" },
      results.map((r, i) => {
        const sel = selKey({ kind: "fit", file: r.file });
        const { btn, wave } = playable(r.file, { height: 34 });
        return h(
          "article",
          {
            class: `row-card${store.selected && selKey(store.selected) === sel ? " selected" : ""}`,
            dataset: { sel },
            onclick: () => select({ kind: "fit", file: r.file }),
          },
          h("span", { class: "rank mono" }, String(i + 1)),
          btn,
          h(
            "div",
            { class: "row-main" },
            h("div", { class: "row-title" }, h("span", { class: "card-name" }, fileName(r.file))),
            h("div", { class: "row-heard dim ellipsis" }, r.heard_as[0] ? tv(r.heard_as[0].text) : ""),
          ),
          h("div", { class: "row-wave" }, wave.el),
          h("div", { class: "row-score" }, h("div", { class: "verdict" }, badge(r.verdict), scoreLabel(r.score, r.verdict)), meter(r.score, r.verdict)),
          h("span", { class: "dur mono" }, ""),
        );
      }),
    ),
  );
}

function searchList(r: SearchResult): HTMLElement {
  const root = r.library;
  return h(
    "div",
    { class: "results" },
    h("div", { class: "results-head" }, svg(ICON.library), h("b", null, t("picture.results")), h("span", { class: "dim mono ellipsis" }, root)),
    h(
      "div",
      { class: "rows" },
      r.results.map((hit, i) => {
        const { btn, wave } = playable(`${root}/${hit.path}`, { height: 34 });
        return h(
          "article",
          { class: "row-card" },
          h("span", { class: "rank mono" }, String(i + 1)),
          btn,
          h(
            "div",
            { class: "row-main" },
            h("div", { class: "row-title" }, h("span", { class: "card-name", title: hit.path }, fileName(hit.path))),
            h("div", { class: "row-heard dim ellipsis" }, hit.heard_as ? tv(hit.heard_as) : ""),
          ),
          h("div", { class: "row-wave" }, wave.el),
          hit.verdict
            ? h("div", { class: "row-score" }, h("div", { class: "verdict" }, badge(hit.verdict), scoreLabel(hit.score, hit.verdict)), meter(hit.score, hit.verdict))
            : h("div", { class: "row-score" }),
          h("span", { class: "dur mono" }, duration(hit.duration)),
        );
      }),
    ),
  );
}

// -- panel -----------------------------------------------------------------------------------------
export function picturePanel(): HTMLElement[] {
  const p = P();
  const out: HTMLElement[] = [];
  const sel = store.selected;
  const fit = sel?.kind === "fit" ? p.fit?.find((r) => r.file === sel.file) : undefined;
  if (fit) {
    out.push(
      h(
        "div",
        { class: "psummary" },
        h("div", { class: "psum-name" }, fileName(fit.file)),
        h(
          "div",
          { class: "psum-score" },
          badge(fit.verdict),
          scoreLabel(fit.score, fit.verdict),
          h("span", { class: "dim" }, t(store.pro ? `verdict.fit.${fit.verdict}` : `plain.fitHint.${fit.verdict}`)),
        ),
        meter(fit.score, fit.verdict),
        store.pro ? rawFit(fit) : null,
      ),
    );
    if (!store.pro) out.push(details(rawFit(fit)));
    out.push(section(t("picture.picturedAs"), altList(fit.pictured_as, t("picture.pictured")), { tip: t("picture.picturedAsTip") }));
    out.push(section(t("panel.heardAs"), altList(fit.heard_as, t("picture.heardPictured")), { tip: t("panel.heardAsTip") }));
    if ((fit.verdict === "weak" || fit.verdict === "miss") && fit.pictured_as[0]) out.push(suggestion(fit.pictured_as[0].text));
    return out;
  }
  if (p.described) {
    out.push(
      section(
        t("picture.picturedAs"),
        h(
          "ol",
          { class: "alts" },
          p.described.pictured_as.map((a) =>
            h(
              "li",
              null,
              store.pro ? h("span", { class: "alt-score" }, sigma(a.score)) : null,
              h("span", { class: "alt-text", title: a.text }, tv(a.text)),
              a.category ? h("span", { class: "alt-cat" }, tcat(a.category)) : null,
            ),
          ),
        ),
        { tip: t("picture.picturedAsTip") },
      ),
    );
    if (p.described.pictured_as[0]) out.push(suggestion(p.described.pictured_as[0].text));
  } else if (!p.path) {
    out.push(h("p", { class: "note dim" }, t("picture.dropBody")));
  }
  return out;
}

function rawFit(fit: FitResult): HTMLElement {
  return h(
    "div",
    { class: "mono dim small" },
    `${sigma(fit.score)} · ${t("scorecard.direct")} ${sigma(fit.z_direct)} · ${t("scorecard.described")} ${sigma(fit.z_described)}${fit.z_scene !== null ? ` · ${t("scorecard.scene")} ${sigma(fit.z_scene)}` : ""} · ${t("scorecard.cosine")} ${fixed(fit.cosine, 3)}`,
  );
}

function suggestion(text: string): HTMLElement {
  return section(t("picture.suggest"), [
    h(
      "div",
      { class: "suggest" },
      h("span", { class: "mono" }, `“${text}”`),
      h(
        "button",
        {
          class: "icon-btn",
          title: t("common.copy"),
          onclick: async () => {
            await copyText(text);
            toast(t("common.copied"));
          },
        },
        svg(ICON.file),
      ),
    ),
  ]);
}
