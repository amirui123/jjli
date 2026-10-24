import { type Alternative, api, type Item, type Job, type Overall, type Verdict } from "../api";
import { h, ICON, svg } from "../dom";
import { sigma, t, tcat, tv } from "../i18n";
import { store } from "../store";
import { badge, progressBar, spinner } from "../viz";

export function header(title: string, subtitle: string, ...actions: (HTMLElement | null)[]): HTMLElement {
  return h(
    "header",
    { class: "view-head" },
    h("div", { class: "titles" }, h("h1", null, title), h("p", { class: "sub" }, subtitle)),
    h("div", { class: "actions" }, actions),
  );
}

export function button(
  label: string,
  onClick: () => void,
  opts: { icon?: string; kind?: "primary" | "ghost" | "quiet"; disabled?: boolean; title?: string } = {},
): HTMLButtonElement {
  return h(
    "button",
    {
      class: `btn ${opts.kind ?? "ghost"}`,
      onclick: (e: Event) => {
        e.stopPropagation();
        onClick();
      },
      disabled: opts.disabled,
      title: opts.title,
    },
    opts.icon ? svg(opts.icon) : null,
    h("span", null, label),
  );
}

export function emptyState(icon: string, title: string, body: string, ...actions: HTMLElement[]): HTMLElement {
  return h(
    "div",
    { class: "empty" },
    h("div", { class: "empty-art" }, svg(icon, "icon big"), h("div", { class: "rings" })),
    h("h2", null, title),
    h("p", null, body),
    h("div", { class: "empty-actions" }, actions),
  );
}

/** "Loading the model…" / "Listening… 3 of 8 — door.wav" with a bar, and Stop for library / picture tasks. */
export function jobLine(job: Job | null, fallback: string): HTMLElement | null {
  if (!job || job.status === "done" || job.status === "error" || job.status === "cancelled") return null;
  let label = fallback;
  if (job.label === "@model") label = t("model.loading");
  else if (job.label === "@vision") label = t("model.loadingVision");
  else if (job.label === "@scan") label = t("common.scanning");
  const count = job.total > 0 ? t("common.of", { a: Math.min(job.done + 1, job.total), b: job.total }) : "";
  const name = job.label && !job.label.startsWith("@") ? job.label : "";
  return h(
    "div",
    { class: "job-line" },
    h(
      "div",
      { class: "job-text" },
      spinner(),
      h("b", null, label),
      count ? h("span", null, count) : null,
      name ? h("span", { class: "dim ellipsis" }, name) : null,
      job.id && job.kind !== "analyze"
        ? h(
            "button",
            {
              class: "btn quiet job-stop",
              disabled: job.cancel_requested,
              onclick: (e: Event) => {
                e.stopPropagation();
                (e.currentTarget as HTMLButtonElement).disabled = true;
                void api.cancelJob(job.id).catch(() => undefined);
              },
            },
            t("common.stop"),
          )
        : null,
    ),
    progressBar(job.label?.startsWith("@") ? 0 : job.done, job.label?.startsWith("@") ? 0 : job.total),
  );
}

export function overallPill(o: Overall): HTMLElement {
  return h("span", { class: `overall o-${o}` }, t(store.pro ? `overall.${o}` : `plain.overall.${o}`));
}

export function overallNote(item: Item): string {
  if (!item.overall) return "";
  if (!store.pro) {
    if (item.overall === "redo") return t(item.check?.verdict === "miss" ? "plain.note.redoMiss" : "plain.note.redoTech");
    return t(`plain.note.${item.overall}`);
  }
  if (item.overall === "redo") return t(item.check?.verdict === "miss" ? "overall.note.redoMiss" : "overall.note.redoTech");
  return t(`overall.note.${item.overall}`);
}

export function altList(alts: Alternative[], mark: string): HTMLElement {
  return h(
    "ol",
    { class: "alts" },
    alts.map((a) =>
      h(
        "li",
        { class: a.agrees ? "agrees" : "" },
        store.pro ? h("span", { class: "alt-score" }, sigma(a.score)) : null,
        h("span", { class: "alt-text", title: a.text }, tv(a.text)),
        a.agrees ? h("span", { class: "alt-mark" }, mark) : null,
        a.category ? h("span", { class: "alt-cat" }, tcat(a.category)) : null,
      ),
    ),
  );
}

export function section(title: string, body: Node | Node[] | null, opts: { tip?: string; extra?: HTMLElement } = {}) {
  return h(
    "section",
    { class: "psec" },
    h("h3", null, h("span", null, title), opts.tip ? h("i", { class: "tip", title: opts.tip }, "?") : null, opts.extra ?? null),
    body,
  );
}

/** Raw numbers, folded away unless asked for. */
export function details(...body: (Node | null)[]): HTMLElement {
  return h("details", { class: "details" }, h("summary", null, t("plain.details")), h("div", { class: "details-body" }, body));
}

export function verdictLegend(kind: "prompt" | "fit" = "prompt"): HTMLElement {
  const vs: Verdict[] = ["strong", "plausible", "weak", "miss"];
  if (!store.pro) {
    return h(
      "div",
      { class: "legend plain" },
      vs.map((v) =>
        h(
          "div",
          { class: "legend-row" },
          badge(v),
          h("span", { class: "legend-hint" }, t(kind === "fit" ? `plain.fitHint.${v}` : `plain.hint.${v}`)),
        ),
      ),
    );
  }
  return h(
    "div",
    { class: "legend" },
    vs.map((v) =>
      h(
        "div",
        { class: "legend-row" },
        h("span", { class: `badge v-${v}` }, t(`verdict.${v}`)),
        h("span", { class: "mono dim" }, t(`panel.legend.${v}`)),
        h("span", { class: "legend-hint" }, t(`verdict.hint.${v}`)),
      ),
    ),
  );
}

// -- modal -----------------------------------------------------------------------------------------
export function modal(title: string, body: HTMLElement, opts: { wide?: boolean; footer?: HTMLElement[] } = {}) {
  const close = () => {
    root.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
  const root = h(
    "div",
    { class: "modal-back", onclick: (e: Event) => e.target === root && close() },
    h(
      "div",
      { class: `modal${opts.wide ? " wide" : ""}`, role: "dialog", "aria-label": title },
      h(
        "div",
        { class: "modal-head" },
        h("h2", null, title),
        h("button", { class: "icon-btn", onclick: close, title: t("common.close") }, svg(ICON.close)),
      ),
      h("div", { class: "modal-body" }, body),
      opts.footer ? h("div", { class: "modal-foot" }, opts.footer) : null,
    ),
  );
  document.body.appendChild(root);
  return { close, root };
}

export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

export function folderOf(path: string): string {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join("/");
}
