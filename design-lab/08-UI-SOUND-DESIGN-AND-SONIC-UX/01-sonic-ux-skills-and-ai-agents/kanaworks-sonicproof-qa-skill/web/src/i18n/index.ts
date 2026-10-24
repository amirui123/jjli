import { en, type Messages } from "./en";
import { ja, vocabJa } from "./ja";

export type Lang = "en" | "ja";
const TABLES: Record<Lang, Messages> = { en, ja };
const KEY = "sonicproof.lang";

function initial(): Lang {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "en" || q === "ja") return q;
  const saved = localStorage.getItem(KEY);
  if (saved === "en" || saved === "ja") return saved;
  return (navigator.languages || [navigator.language]).some((l) => l.toLowerCase().startsWith("ja")) ? "ja" : "en";
}

let lang: Lang = initial();
const listeners = new Set<() => void>();

export const getLang = () => lang;

export function setLang(l: Lang) {
  if (l === lang) return;
  lang = l;
  localStorage.setItem(KEY, l);
  document.documentElement.lang = l;
  listeners.forEach((f) => f());
}

export function onLangChange(f: () => void) {
  listeners.add(f);
}

function lookup(table: unknown, key: string): string | undefined {
  let cur: unknown = table;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as object)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

/** t("inbox.takes", {n: 4}) — falls back to English, then to the key itself. */
export function t(key: string, params?: Record<string, string | number>): string {
  const s = lookup(TABLES[lang], key) ?? lookup(en, key) ?? key;
  return fill(s, params);
}

/** Lookup in a map whose keys contain dots (qc codes): tm("qc.hint", "loudness.quiet", data). */
export function tm(map: string, key: string, params?: Record<string, unknown>): string | undefined {
  const get = (tbl: Messages) => {
    const m = lookupObj(tbl, map);
    return m ? m[key] : undefined;
  };
  const s = get(TABLES[lang]) ?? get(en);
  return s === undefined ? undefined : fill(s, params);
}

function lookupObj(table: unknown, key: string): Record<string, string> | undefined {
  let cur: unknown = table;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as object)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return cur && typeof cur === "object" ? (cur as Record<string, string>) : undefined;
}

function fill(s: string, params?: Record<string, unknown>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? fmtParam(params[k]) : m));
}

function fmtParam(v: unknown): string {
  if (v === null || v === undefined) return "—"; // qc data may be null (not measurable)
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  return String(v);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? t(one, { n }) : t(many, { n });
}

/** A vocabulary description ("a dog barking") in the UI language. */
export function tv(text: string): string {
  return lang === "ja" ? (vocabJa[text] ?? text) : text;
}

export function tcat(cat: string | null | undefined): string {
  if (!cat) return "";
  const m = TABLES[lang].category[cat];
  return m ?? cat.replace(/_/g, " ");
}

export function sigma(x: number | null | undefined): string {
  if (x == null || !Number.isFinite(x)) return "—";
  const s = Math.abs(x).toFixed(2);
  return `${x < 0 ? "−" : "+"}${s}σ`;
}

export function signed(x: number | null | undefined, digits = 1): string {
  if (x == null || !Number.isFinite(x)) return "—";
  return `${x < 0 ? "−" : "+"}${Math.abs(x).toFixed(digits)}`;
}

export function duration(sec: number): string {
  if (sec < 60) return `${sec.toFixed(sec < 10 ? 2 : 1)} s`;
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

/** A number to fixed digits, or "—" when the server sent null (not measurable). */
export function fixed(x: number | null | undefined, digits: number): string {
  return x == null || !Number.isFinite(x) ? "—" : x.toFixed(digits);
}

export function bytes(n: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return i ? `${n.toFixed(1)} ${units[i]}` : `${n} B`;
}

document.documentElement.lang = lang;
