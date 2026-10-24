// A tiny element builder — enough for this app without a framework.

type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> & { class?: string; style?: string };

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith("on") && typeof v === "function") {
        el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      } else if (k === "class") {
        el.className = String(v);
      } else if (k === "dataset" && typeof v === "object") {
        Object.assign(el.dataset, v);
      } else if (k in el && typeof v !== "string") {
        (el as unknown as Record<string, unknown>)[k] = v;
      } else {
        el.setAttribute(k, v === true ? "" : String(v));
      }
    }
  }
  append(el, children);
  return el;
}

export function append(el: Node, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function svg(markup: string, cls = "icon"): HTMLSpanElement {
  const s = document.createElement("span");
  s.className = cls;
  s.innerHTML = markup;
  return s;
}

/** Replace an element's children (null / false children are skipped). */
export function put(el: Element, ...children: Child[]) {
  clear(el);
  append(el, children);
}

export function clear(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function toast(message: string, kind: "info" | "warn" | "error" = "info") {
  let host = document.getElementById("toasts");
  if (!host) {
    host = h("div", { id: "toasts" });
    document.body.appendChild(host);
  }
  const el = h("div", { class: `toast ${kind}` }, message);
  host.appendChild(el);
  setTimeout(() => el.classList.add("out"), 3600);
  setTimeout(() => el.remove(), 4000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = h("textarea", { style: "position:fixed;opacity:0" }, text);
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

// Line icons (1.5px strokes, 20px grid)
export const ICON = {
  inbox:
    '<svg viewBox="0 0 20 20"><path d="M3 11.5 5 4.5h10l2 7M3 11.5V15.5h14v-4M3 11.5h4l1 2h4l1-2h4"/></svg>',
  library:
    '<svg viewBox="0 0 20 20"><path d="M4 3.5v13M7.5 3.5v13M11 4l3.8 12.2M16 16.5"/></svg>',
  picture:
    '<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="m3.5 14 4-4 3 3 2-2 4 4"/><circle cx="13" cy="7.5" r="1.2"/></svg>',
  play: '<svg viewBox="0 0 20 20"><path d="M6.5 4.5v11l9-5.5z" fill="currentColor" stroke="none"/></svg>',
  pause:
    '<svg viewBox="0 0 20 20"><path d="M6 4.5h3v11H6zM11 4.5h3v11h-3z" fill="currentColor" stroke="none"/></svg>',
  search: '<svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5"/><path d="m12.5 12.5 4 4"/></svg>',
  folder:
    '<svg viewBox="0 0 20 20"><path d="M2.5 5.5a1 1 0 0 1 1-1h4l1.5 2h7.5a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"/></svg>',
  file: '<svg viewBox="0 0 20 20"><path d="M5 2.5h6.5l3.5 3.5v11.5H5z"/><path d="M11.5 2.5V6H15"/></svg>',
  close: '<svg viewBox="0 0 20 20"><path d="m5 5 10 10M15 5 5 15"/></svg>',
  refresh:
    '<svg viewBox="0 0 20 20"><path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3.2h-3.2"/></svg>',
  up: '<svg viewBox="0 0 20 20"><path d="M10 15.5v-11M5.5 9 10 4.5 14.5 9"/></svg>',
  expand:
    '<svg viewBox="0 0 20 20"><path d="M11.5 3.5h5v5M8.5 16.5h-5v-5M16.5 3.5 11 9M3.5 16.5 9 11"/></svg>',
  dupes:
    '<svg viewBox="0 0 20 20"><rect x="3" y="6" width="9" height="11" rx="1.5"/><path d="M8 3h7.5a1.5 1.5 0 0 1 1.5 1.5V13"/></svg>',
  wave: '<svg viewBox="0 0 20 20"><path d="M2 10h2M5.5 6v8M9 3v14M12.5 7v6M16 9v2M18 10h0"/></svg>',
  check: '<svg viewBox="0 0 20 20"><path d="m4.5 10.5 3.5 3.5 7.5-8"/></svg>',
  trash:
    '<svg viewBox="0 0 20 20"><path d="M4 6h12M8 6V4h4v2M5.5 6l.8 10.5h7.4L14.5 6"/></svg>',
  gear: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6"/></svg>',
  plus: '<svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>',
  globe:
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.2 2.2 2.2 11.8 0 14M10 3c-2.2 2.2-2.2 11.8 0 14"/></svg>',
  spark:
    '<svg viewBox="0 0 20 20"><path d="M10 2.5v4M10 13.5v4M2.5 10h4M13.5 10h4M5 5l2.2 2.2M12.8 12.8 15 15M15 5l-2.2 2.2M7.2 12.8 5 15"/></svg>',
};
