/**
 * Zero-dependency hash router.
 * Hash routing keeps the build portable: it works on any static host
 * (Vercel, GitHub Pages, plain file server) without rewrite rules.
 */
import { useSyncExternalStore, useCallback } from "react";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { faNum } from "./format";

export type RouteId =
  | "home"
  | "dashboard"
  | "fonts"
  | "motion"
  | "components"
  | "sounds"
  | "skills"
  | "engines"
  | "ai";

export interface RouteMeta {
  id: RouteId;
  path: string;
  labelFa: string;
  labelEn: string;
  shortFa: string;
  descFa: string;
  accent: string;
  glyph: string;
}

export const ROUTES: RouteMeta[] = [
  {
    id: "home",
    path: "/",
    labelFa: "خانه",
    labelEn: "Home",
    shortFa: "خانه",
    descFa: "معرفی پلتفرم",
    accent: "#E8B33A",
    glyph: "✦",
  },
  {
    id: "dashboard",
    path: "/dashboard",
    labelFa: "همه ابزارها",
    labelEn: "All tools",
    shortFa: "ابزارها",
    descFa: "پیدا کردن ابزار مناسب برای کاری که می‌خواهی انجام بدهی",
    accent: "#8B5CF6",
    glyph: "▦",
  },
  {
    id: "fonts",
    path: "/studio/fonts",
    labelFa: "انتخاب فونت",
    labelEn: "Persian fonts",
    shortFa: "فونت",
    descFa: `${faNum(TOOLKIT_STATS.fonts)} فونت فارسی برای دیدن، امتحان‌کردن و دانلود`,
    accent: "#E8B33A",
    glyph: "ی",
  },
  {
    id: "motion",
    path: "/studio/motion",
    labelFa: "ساخت انیمیشن",
    labelEn: "Animation maker",
    shortFa: "انیمیشن",
    descFa: "ساخت و تنظیم حرکت‌های ساده برای صفحه",
    accent: "#22D3EE",
    glyph: "◇",
  },
  {
    id: "components",
    path: "/studio/components",
    labelFa: "طراحی ظاهر سایت",
    labelEn: "Website design",
    shortFa: "ظاهر سایت",
    descFa: "نمونه‌ها و اجزای آماده برای ساخت صفحه‌ی سایت",
    accent: "#5EEAD4",
    glyph: "❖",
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    labelFa: "ساخت صدا",
    labelEn: "Sound maker",
    shortFa: "صدا",
    descFa: `${faNum(TOOLKIT_STATS.sounds)} صدای آماده برای شنیدن و ذخیره`,
    accent: "#FB7185",
    glyph: "♪",
  },
  {
    id: "skills",
    path: "/studio/skills",
    labelFa: "راهنمای طراحی",
    labelEn: "Design guides",
    shortFa: "راهنماها",
    descFa: "راهنماها و نمونه‌هایی برای رنگ، چیدمان و نوشتن متن",
    accent: "#A78BFA",
    glyph: "✧",
  },
  {
    id: "engines",
    path: "/studio/engines",
    labelFa: "جلوه‌های تصویری",
    labelEn: "Visual effects",
    shortFa: "جلوه‌ها",
    descFa: "جلوه‌های نور، رنگ و تصویر برای صفحه",
    accent: "#22D3EE",
    glyph: "◈",
  },
  {
    id: "ai",
    path: "/studio/ai",
    labelFa: "کمک‌یار هوشمند",
    labelEn: "AI helper",
    shortFa: "کمک‌یار",
    descFa: "کمک برای پیدا کردن ایده و آماده‌کردن متن اولیه",
    accent: "#F472B6",
    glyph: "◉",
  },
];

export function routeMeta(id: RouteId): RouteMeta {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0];
}

/* ------------------------------------------------------------------ state */

function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

let hashBound = false;

/** One shared hashchange listener, no matter how many components subscribe. */
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!hashBound) {
    window.addEventListener("hashchange", emit);
    hashBound = true;
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && hashBound) {
      window.removeEventListener("hashchange", emit);
      hashBound = false;
    }
  };
}

let cachedPath = typeof window === "undefined" ? "/" : currentPath();

function matchId(path: string): RouteId {
  const clean = path.replace(/\/+$/, "") || "/";
  const found = ROUTES.find(
    (r) => r.path === clean || (r.path !== "/" && clean.startsWith(r.path))
  );
  return found ? found.id : "home";
}

function getSnapshot() {
  const next = currentPath();
  if (next !== cachedPath) cachedPath = next;
  return cachedPath;
}

export function navigate(path: string, opts?: { keepScroll?: boolean }) {
  const target = path.startsWith("/") ? path : `/${path}`;
  if (currentPath() === target) {
    if (!opts?.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = `#${target}`;
  if (!opts?.keepScroll) {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

export function useRouter(): { path: string; route: RouteId; meta: RouteMeta } {
  const path = useSyncExternalStore(subscribe, getSnapshot, () => "/");
  return { path, route: matchId(path), meta: routeMeta(matchId(path)) };
}

export function useNavigate() {
  return useCallback((path: string) => navigate(path), []);
}

export function href(path: string) {
  return `#${path.startsWith("/") ? path : `/${path}`}`;
}
