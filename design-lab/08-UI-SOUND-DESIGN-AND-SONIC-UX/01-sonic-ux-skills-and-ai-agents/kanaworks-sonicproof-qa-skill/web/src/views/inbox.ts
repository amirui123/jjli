import { api, type Group, type Item, toastError, waitJob } from "../api";
import { copyText, h, ICON, svg, toast } from "../dom";
import { audioOnly, type Dropped, isAudio, pick } from "../drop";
import { duration, fixed, plural, sigma, t, tm, tv } from "../i18n";
import { changed, selKey, select, store } from "../store";
import { badge, match, meter, playable, qcDots, qcList, qcPlain, scoreLabel, spinner } from "../viz";
import {
  altList,
  button,
  details,
  emptyState,
  header,
  jobLine,
  modal,
  overallNote,
  overallPill,
  section,
  verdictLegend,
} from "./common";

let activeJob: import("../api").Job | null = null;
let uploading = 0;

export async function refreshInbox() {
  store.inbox = await api.inbox();
  changed("center", "panel", "sidebar");
}

/** Track the analysis job so the header shows progress; refresh as items finish. */
export async function followJob(id: string | null) {
  if (!id) return;
  let last = -1;
  try {
    await waitJob(id, (j) => {
      activeJob = j;
      if (j.done !== last) {
        last = j.done;
        void refreshInbox();
      } else changed("center");
    });
  } catch (e) {
    toastError(e);
  }
  activeJob = null;
  await refreshInbox();
}

export async function addDropped(d: Dropped) {
  const audio = audioOnly(d);
  const nAudio = audio.files.filter((f) => isAudio(f.name)).length;
  if (!nAudio) {
    toast(d.files.length ? t("drop.notAudio") : t("drop.nothing"), "warn");
    return;
  }
  uploading = nAudio;
  changed("center");
  try {
    const r = await api.uploadInbox(audio.files, audio.paths);
    uploading = 0;
    if (r.added) toast(t("drop.added", { n: r.added }));
    if (r.skipped) toast(t("drop.skipped", { n: r.skipped }), "warn");
    await refreshInbox();
    void followJob(r.job);
  } catch (e) {
    uploading = 0;
    toastError(e);
    changed("center");
  }
}

export function findItem(id: string): Item | undefined {
  for (const g of store.inbox?.groups ?? []) for (const it of g.items) if (it.id === id) return it;
  return undefined;
}

// -- center --------------------------------------------------------------------------------------
export function inboxCenter(): HTMLElement {
  const st = store.inbox;
  const count = st?.count ?? 0;
  const addFiles = button(t("drop.addFiles"), async () => addDropped(await pick("audio/*,.json", { multiple: true })), {
    icon: ICON.plus,
    kind: count ? "ghost" : "primary",
  });
  const addFolder = button(t("drop.addFolder"), async () => addDropped(await pick("", { directory: true })), {
    icon: ICON.folder,
  });
  const actions = count
    ? [
        addFiles,
        addFolder,
        button(t("inbox.recheck"), async () => followJob((await api.reanalyze()).job), { icon: ICON.refresh, kind: "quiet" }),
        button(
          t("inbox.clear"),
          async () => {
            if (!confirm(t("inbox.clearConfirm"))) return;
            await api.clearInbox();
            select(null);
            await refreshInbox();
          },
          { icon: ICON.trash, kind: "quiet" },
        ),
      ]
    : [];
  const head = header(t("inbox.title"), t(store.pro ? "inbox.subtitle" : "plain.subtitle"), ...actions);
  const progress = uploading
    ? jobLine({ id: "", kind: "", label: "", status: "running", done: 0, total: 0, result: null, error: null, error_code: null }, t("drop.uploading", { n: uploading }))
    : jobLine(activeJob, t("common.listening"));

  if (!st) return h("div", { class: "view" }, head, h("div", { class: "center-loading" }, spinner()));
  if (!count && !uploading) {
    return h(
      "div",
      { class: "view" },
      head,
      h("div", { class: "dropzone" }, emptyState(ICON.wave, t("drop.title"), t("drop.body"), addFiles, addFolder)),
    );
  }
  return h("div", { class: "view" }, head, progress, h("div", { class: "groups" }, st.groups.map(groupView)));
}

function groupView(g: Group): HTMLElement {
  const n = g.items.length;
  const anyScored = g.items.some((i) => i.check);
  const noPick = n > 1 && g.settled && anyScored && !g.pick;
  const noneClose =
    g.settled && anyScored && !g.items.some((i) => i.check && (i.check.verdict === "strong" || i.check.verdict === "plausible"));
  return h(
    "div",
    { class: "group" },
    h(
      "div",
      { class: "group-head" },
      g.prompt
        ? h("span", { class: "group-prompt" }, `“${g.prompt}”`)
        : h("span", { class: "group-prompt none" }, t("inbox.noPrompt")),
      h("span", { class: "group-count" }, plural(n, "inbox.take", "inbox.takes")),
      noPick && !noneClose ? h("span", { class: "group-warn" }, t("inbox.qcBlocked")) : null,
      noPick && noneClose && store.pro ? h("span", { class: "group-warn" }, t("inbox.noPick")) : null,
    ),
    noneClose && !store.pro ? nextStep(g, n) : null,
    h("div", { class: "cards" }, g.items.map((it) => card(it, g.pick === it.id))),
  );
}

/** "None of these really sound like it. Try writing: “…”" — the one thing to do next. */
function nextStep(g: Group, n: number): HTMLElement {
  const say = g.suggest?.[0];
  return h(
    "div",
    { class: "next-step" },
    h("span", { class: "next-mark" }, "△"),
    h(
      "div",
      { class: "next-body" },
      h("b", null, t(n > 1 ? "plain.noneClose" : "plain.oneNotClose")),
      say
        ? h(
            "div",
            { class: "next-try" },
            h("span", null, t("plain.tryWriting")),
            h("span", { class: "next-prompt" }, `“${say}”`),
            tv(say) !== say ? h("span", { class: "dim" }, `（${tv(say)}）`) : null,
            h(
              "button",
              {
                class: "icon-btn",
                title: t("common.copy"),
                onclick: async (e: Event) => {
                  e.stopPropagation();
                  await copyText(say);
                  toast(t("common.copied"));
                },
              },
              svg(ICON.file),
            ),
          )
        : null,
      h("span", { class: "dim small" }, t("plain.orNewSeeds")),
    ),
  );
}

/** The raw evidence behind a check, for the Details fold and Pro mode. */
function rawCheck(it: Item): HTMLElement | null {
  const c = it.check;
  if (!c) return null;
  return h(
    "dl",
    { class: "kv" },
    h("dt", null, t("scorecard.score")),
    h("dd", { class: "mono" }, `${sigma(c.score)} · ${t(`verdict.${c.verdict}`)} · ${t("plain.match")} ${match(c.score)}/100`),
    h("dt", null, t("scorecard.evidence")),
    h(
      "dd",
      { class: "mono" },
      `${t("scorecard.cosine")} ${fixed(c.cosine, 3)} · ${t("scorecard.clipSide")} ${sigma(c.z_clip)} · ${t("scorecard.promptSide")} ${sigma(c.z_prompt)}`,
    ),
    h("dt", null, ""),
    h("dd", { class: "dim" }, t("scorecard.ranking", { rank: c.vocab_rank, total: c.vocab_size + 1 })),
  );
}

function technical(checks: import("../api").QcCheck[]): HTMLElement {
  if (store.pro) {
    const issues = checks.some((c) => c.status === "warn" || c.status === "fail");
    return section(t("panel.technical"), [issues ? null : h("p", { class: "note ok" }, t("panel.allClean")), qcList(checks)] as HTMLElement[]);
  }
  return section(t("plain.technical"), qcPlain(checks));
}

function card(it: Item, isPick: boolean): HTMLElement {
  const sel = selKey({ kind: "item", id: it.id });
  const busy = it.status === "queued" || it.status === "working";
  const { btn, wave } = playable(it.path, { silent: it.status === "error" });
  const c = it.check;
  const top = it.heard_as?.[0];
  const right = busy
    ? h("span", { class: "status" }, spinner(), t(it.status === "working" ? "common.listening" : "common.queued"))
    : it.status === "error"
      ? h("span", { class: "status err", title: itemError(it) }, t("common.error"))
      : c
        ? h("span", { class: "verdict" }, badge(c.verdict), scoreLabel(c.score, c.verdict))
        : h("span", { class: "status muted" }, t("inbox.noPrompt"));
  return h(
    "article",
    {
      class: `card${isPick ? " pick" : ""}${busy ? " busy" : ""}${store.selected && selKey(store.selected) === sel ? " selected" : ""}`,
      dataset: { sel },
      tabindex: 0,
      onclick: () => select({ kind: "item", id: it.id }),
      ondblclick: () => openScorecard(it),
      onkeydown: (e: KeyboardEvent) => {
        if (e.key === "Enter") openScorecard(it);
        if (e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      },
    },
    h(
      "div",
      { class: "card-top" },
      isPick ? h("span", { class: "pick-tag", title: t("inbox.pickTip") }, svg(ICON.check), t(store.pro ? "inbox.pick" : "plain.pick")) : null,
      h("span", { class: "card-name", title: it.path }, it.name),
      it.seed !== null ? h("span", { class: "chip" }, t("inbox.seed", { n: it.seed })) : null,
      it.loop ? h("span", { class: "chip" }, t("inbox.loop")) : null,
      h("span", { class: "spacer" }),
      right,
    ),
    h("div", { class: "card-wave" }, it.status === "error" ? h("span", { class: "play-gap" }) : btn, wave.el),
    c ? meter(c.score, c.verdict) : h("div", { class: "meter-gap" }),
    h(
      "div",
      { class: "card-foot" },
      top
        ? h(
            "span",
            { class: "heard ellipsis" },
            h("span", { class: "dim" }, `${t("inbox.heard")} `),
            tv(top.text),
            top.agrees ? h("span", { class: "ok" }, " ✓") : null,
          )
        : h("span", { class: "heard" }),
      h("span", { class: "spacer" }),
      it.qc ? qcDots(it.qc.checks) : null,
      it.qc ? h("span", { class: "dur mono" }, duration(it.qc.duration)) : null,
    ),
  );
}

// -- panel -----------------------------------------------------------------------------------------
export function inboxPanel(): HTMLElement[] {
  const sel = store.selected;
  const it = sel?.kind === "item" ? findItem(sel.id) : undefined;
  if (!it) {
    return [
      store.pro
        ? section(t("panel.readScore"), [h("p", { class: "note" }, t("panel.readScoreBody")), verdictLegend()])
        : section(t("plain.readTitle"), [verdictLegend(), h("p", { class: "note" }, t("plain.readBody"))]),
      h("p", { class: "note dim" }, t("panel.nothingSelected")),
      h("p", { class: "note dim small" }, t("panel.secondOpinion")),
    ];
  }
  const out: HTMLElement[] = [];
  out.push(
    h(
      "div",
      { class: "psummary" },
      h("div", { class: "psum-name", title: it.path }, it.name),
      it.overall
        ? h("div", { class: "psum-overall" }, overallPill(it.overall), h("span", null, overallNote(it)))
        : null,
      it.check
        ? h(
            "div",
            { class: "psum-score" },
            badge(it.check.verdict),
            scoreLabel(it.check.score, it.check.verdict),
            h("span", { class: "dim" }, t(store.pro ? `verdict.hint.${it.check.verdict}` : `plain.hint.${it.check.verdict}`)),
          )
        : null,
      it.check ? meter(it.check.score, it.check.verdict) : null,
      it.check && store.pro ? rawCheck(it) : null,
      h(
        "div",
        { class: "psum-actions" },
        button(t("panel.openScorecard"), () => openScorecard(it), { icon: ICON.expand, kind: "quiet" }),
        button(t("common.remove"), async () => {
          await api.removeItem(it.id);
          select(null);
          await refreshInbox();
        }, { icon: ICON.trash, kind: "quiet" }),
      ),
    ),
  );
  out.push(promptEditor(it));
  if (it.heard_as?.length) out.push(section(t("panel.heardAs"), altList(it.heard_as, "✓"), { tip: t("panel.heardAsTip") }));
  if (it.qc) out.push(technical(it.qc.checks));
  if (!store.pro && (it.check || it.qc)) out.push(details(rawCheck(it), it.qc ? qcList(it.qc.checks) : null));
  if (it.status === "error") out.push(...errorNote(it));
  return out;
}

/** What went wrong with an item, in the UI language. */
function itemError(it: Item): string {
  return (it.error_code && tm("errors.codes", it.error_code)) || t("common.error");
}

function errorNote(it: Item): HTMLElement[] {
  const msg = itemError(it);
  const out: HTMLElement[] = [h("p", { class: "note err" }, msg)];
  if (it.error && it.error !== msg) {
    // the raw text (often English, sometimes from ffmpeg) for whoever wants to dig in
    const raw = h("p", { class: "note err raw mono small" }, it.error);
    out.push(store.pro ? raw : details(raw));
  }
  return out;
}

function promptEditor(it: Item): HTMLElement {
  const ta = h("textarea", { class: "prompt-input", rows: 2, placeholder: t("panel.promptPlaceholder") }, it.prompt ?? "");
  const apply = async () => {
    const r = await api.updateItem(it.id, { prompt: ta.value });
    await refreshInbox();
    void followJob(r.job);
  };
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      void apply();
    }
  });
  const loop = h("input", { type: "checkbox", checked: it.loop });
  loop.addEventListener("change", async () => {
    const r = await api.updateItem(it.id, { loop: loop.checked });
    await refreshInbox();
    void followJob(r.job);
  });
  return section(
    t("panel.prompt"),
    [
      ta,
      h(
        "div",
        { class: "prompt-row" },
        it.prompt_source === "sidecar" ? h("span", { class: "chip" }, t("panel.promptFromSidecar")) : null,
        h("span", { class: "spacer" }),
        it.prompt_source === "user"
          ? button(t("panel.promptReset"), async () => {
              const r = await api.updateItem(it.id, { prompt: "" });
              await refreshInbox();
              void followJob(r.job);
            }, { kind: "quiet" })
          : null,
        button(t("panel.promptApply"), apply, { kind: "primary" }),
      ),
      h("label", { class: "toggle" }, loop, h("span", null, t("panel.isLoop"))),
    ] as HTMLElement[],
  );
}

// -- scorecard -------------------------------------------------------------------------------------
export function openScorecard(it: Item) {
  const { btn, wave } = playable(it.path, { height: 120 });
  const c = it.check;
  const q = it.qc;
  const body = h(
    "div",
    { class: "scorecard" },
    h(
      "div",
      { class: "sc-top" },
      it.overall ? overallPill(it.overall) : null,
      h("span", { class: "sc-note" }, overallNote(it)),
      h("span", { class: "spacer" }),
      q
        ? h(
            "span",
            { class: "mono dim" },
            `${duration(q.duration)} · ${q.sample_rate / 1000} kHz · ${q.channels} ch`,
          )
        : null,
    ),
    h("div", { class: "sc-wave" }, btn, wave.el),
    c
      ? h(
          "div",
          { class: "sc-verdict" },
          h(
            "div",
            { class: "sc-line" },
            badge(c.verdict),
            store.pro ? h("span", { class: "sc-score" }, sigma(c.score)) : scoreLabel(c.score, c.verdict),
            h("span", { class: "dim" }, t(store.pro ? `verdict.hint.${c.verdict}` : `plain.hint.${c.verdict}`)),
          ),
          meter(c.score, c.verdict),
          h(
            "dl",
            { class: "kv" },
            h("dt", null, t("panel.prompt")),
            h("dd", null, `“${c.prompt}”`, it.prompt_source === "sidecar" ? h("span", { class: "chip" }, t("panel.promptFromSidecar")) : null),
          ),
          store.pro ? rawCheck(it) : null,
        )
      : h("p", { class: "note dim" }, t("inbox.noPromptHint")),
    h(
      "div",
      { class: "sc-cols" },
      it.heard_as ? section(t("panel.heardAs"), altList(it.heard_as, "✓"), { tip: t("panel.heardAsTip") }) : null,
      q ? technical(q.checks) : null,
    ),
    store.pro ? null : details(rawCheck(it), q ? qcList(q.checks) : null),
  );
  const json = () => ({
    file: it.path,
    overall: it.overall,
    note: it.note,
    adherence: c,
    qc: q ? { status: q.status, checks: q.checks } : null,
    duration: q?.duration,
    sample_rate: q?.sample_rate,
    channels: q?.channels,
  });
  modal(`${t("scorecard.title")} — ${it.name}`, body, {
    wide: true,
    footer: [
      button(t("common.copyJson"), async () => {
        await copyText(JSON.stringify(json(), null, 2));
        toast(t("common.copied"));
      }, { kind: "quiet" }),
    ],
  });
}
