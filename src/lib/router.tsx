/**
 * Zero-dependency hash router.
 * Hash routing keeps the build portable: it works on any static host
 * (Vercel, GitHub Pages, plain file server) without rewrite rules.
 */
import { useSyncExternalStore, useCallback } from "react";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { faCount, faNum } from "./format";

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
    labelFa: "داشبورد",
    labelEn: "Dashboard",
    shortFa: "داشبورد",
    descFa: "نمای کلی همه استودیوها",
    accent: "#8B5CF6",
    glyph: "▦",
  },
  {
    id: "fonts",
    path: "/studio/fonts",
    labelFa: "استودیو فونت",
    labelEn: "Font Studio",
    shortFa: "فونت",
    descFa: `${faNum(TOOLKIT_STATS.fonts)} خانواده فونت فارسی و نستعلیق`,
    accent: "#E8B33A",
    glyph: "ی",
  },
  {
    id: "motion",
    path: "/studio/motion",
    labelFa: "استودیو موشن",
    labelEn: "Motion Studio",
    shortFa: "موشن",
    descFa: "فیزیک فنر، تایم‌لاین و کد زنده",
    accent: "#22D3EE",
    glyph: "◇",
  },
  {
    id: "components",
    path: "/studio/components",
    labelFa: "استودیو کامپوننت",
    labelEn: "Components",
    shortFa: "کامپوننت",
    descFa: `${faCount(TOOLKIT_STATS.components)} فایل در ${faNum(TOOLKIT_STATS.registries.length)} رجیستری`,
    accent: "#5EEAD4",
    glyph: "❖",
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    labelFa: "استودیو صدا",
    labelEn: "Sound Studio",
    shortFa: "صدا",
    descFa: `${faNum(TOOLKIT_STATS.sounds)} افکت سینتز زنده`,
    accent: "#FB7185",
    glyph: "♪",
  },
  {
    id: "skills",
    path: "/studio/skills",
    labelFa: "استودیو اسکیل",
    labelEn: "Skills Studio",
    shortFa: "اسکیل",
    descFa: `${faNum(TOOLKIT_STATS.skills)} اسکیل و ${faNum(TOOLKIT_STATS.brands)} سیستم برند`,
    accent: "#A78BFA",
    glyph: "✧",
  },
  {
    id: "engines",
    path: "/studio/engines",
    labelFa: "استودیو موتور",
    labelEn: "Engines",
    shortFa: "موتور",
    descFa: "فین‌تک، RTL و شیدر",
    accent: "#34D399",
    glyph: "⚙",
  },
  {
    id: "ai",
    path: "/studio/ai",
    labelFa: "استودیو هوش مصنوعی",
    labelEn: "AI Studio",
    shortFa: "هوش مصنوعی",
    descFa: "دیتاست و QLoRA",
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

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("hashchange", emit);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("hashchange", emit);
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
