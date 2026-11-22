/**
 * Copy + tuning for the app chrome (top bar, appearance panel, bottom dock).
 *
 * Everything the user reads in the shell lives here instead of being scattered
 * through JSX: it keeps labels in one place, makes them easy to proof-read in
 * Persian, and stops the top bar from turning into a wall of inline strings.
 */

import type { RouteId } from "../lib/router";

/* --------------------------------------------------------------- bottom dock */

/**
 * macOS-style magnetic magnification.
 *
 * `range` is the half-width (px) of the zone around the pointer that reacts.
 * Scale is applied with `transform-origin: bottom center`, so items grow
 * *upward* and never reflow their neighbours — the nav only needs enough
 * top padding to cover `itemHeight * (maxScale - 1)`.
 */
export const DOCK_TUNING = {
  maxScale: 1.26,
  range: 132,
  spring: { stiffness: 360, damping: 25, mass: 0.4 },
} as const;

/* ---------------------------------------------------------------- appearance */

export interface DisplayFontOption {
  id: string;
  /** label shown in the panel — the typeface name, always in its own face */
  label: string;
  /** short proof word rendered in that face */
  sample: string;
  hint: string;
}

export const DISPLAY_FONTS: DisplayFontOption[] = [
  { id: "font-hasti", label: "هستی", sample: "هستی", hint: "پیش‌فرض نمایشی" },
  { id: "font-nastaliq", label: "ایران‌نستعلیق", sample: "نستعلیق", hint: "خوشنویسی اصیل" },
  { id: "font-morabba", label: "مربع", sample: "مربع", hint: "هندسی مدرن" },
  { id: "font-kahroba", label: "کهربا", sample: "کهربا", hint: "متغیر سه‌محوره" },
  { id: "font-peyda", label: "پیدا", sample: "پیدا", hint: "تایپوگرافی پوستری" },
];

export const TEXT_SCALES: { value: 1 | 1.08 | 1.15; label: string; sample: string }[] = [
  { value: 1, label: "استاندارد", sample: "الف" },
  { value: 1.08, label: "بزرگ‌تر", sample: "الف" },
  { value: 1.15, label: "بزرگ", sample: "الف" },
];

export const MOTION_LEVELS: { value: 1 | 2 | 3; label: string; hint: string }[] = [
  { value: 1, label: "کم", hint: "حداقل حرکت" },
  { value: 2, label: "معمول", hint: "متعادل" },
  { value: 3, label: "کامل", hint: "کامل" },
];

/* ------------------------------------------------------------------ top bar */

export const TOPBAR_COPY = {
  brandName: "آزمایشگاه موشن فارسی",
  search: "جستجو",
  searchHint: "جستجو و پرش",
  appearance: "تنظیمات نمایش",
  accent: "رنگ پلتفرم",
  github: "مخزن گیت‌هاب",
  /** shown before the active section chip */
  youAreHere: "شما اینجا هستید",
  breadcrumbLabel: "مسیر فعلی",
  closeAppearance: "بستن تنظیمات نمایش",
  resetTitle: "بازگشت به حالت پیش‌فرض",
} as const;

export const ACCENT_COPY = {
  panelTitle: "پالت روانشناسی رنگ",
  panelTitleFull: "پالت روانشناسی رنگ (۶۰·۳۰·۱۰)",
  ratio: "۶۰ · ۳۰ · ۱۰",
  close: "بستن انتخاب رنگ",
  custom: "رنگ دلخواه",
  customPicker: "انتخاب رنگ سفارشی",
  backToPalette: "بازگشت به پالت",
} as const;

export const COMMAND_COPY = {
  placeholder: "جستجوی استودیو، فونت، شیدر یا ابزار…",
  close: "بستن",
  results: "نتایج جستجو",
} as const;

export const DOCK_COPY = {
  label: "ناوبری بخش‌ها",
} as const;

/**
 * Compact labels for the bottom dock. The router keeps the long editorial names
 * (used in the command palette and page headers); the dock needs something that
 * fits nine items on one row, so it has its own copy.
 */
export const DOCK_LABELS: Record<RouteId, string> = {
  home: "خانه",
  dashboard: "داشبورد",
  fonts: "فونت",
  motion: "موشن",
  components: "کامپوننت",
  sounds: "صدا",
  skills: "اسکیل",
  engines: "شیدر",
  ai: "هوش",
};

export const APPEARANCE_COPY = {
  title: "تنظیمات نمایش",
  subtitle: "تایپوگرافی، حرکت، کنتراست و صدا",
  reset: "بازنشانی",
  font: "فونت تیترها",
  scale: "اندازهٔ متن",
  motion: "شدت حرکت",
  contrast: "کنتراست بالا",
  contrastHint: "برای آستیگماتیسم و نور شدید",
  sound: "صدای رابط",
  soundHint: "کلیک و فیدبک صوتی",
  replayIntro: "پخش مجدد موشن ورود",
} as const;
