import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlignCenter, AlignJustify, AlignLeft, AlignRight, 
  Sparkles, Type, Search, Download, Maximize, RotateCcw,
  ChevronRight, ChevronLeft, Save, Trash2, Command
} from "lucide-react";
import { PERSIAN_FONT_CATALOG, type PersianFontItem } from "../data/persianFontsCatalog";
import { fontFileFor, type FontFileInfo } from "../data/fontFiles";
import { usePersisted, useDebounced } from "../lib/store";
import { fetchAsBlob, saveKit, saveUrl } from "../lib/download";
import {
  Badge,
  CodeBlock,
  CopyButton,
  Panel,
  SearchField,
  Segmented,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList, focusStudioPreview } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";

// Import the new tokens
import "../styles/font-studio-tokens.css";

type Category = "all" | PersianFontItem["category"];

interface FontSettings {
  fontId: string;
  compareId: string;
  text: string;
  size: number;
  weight: number;
  lineHeight: number;
  tracking: number;
  wordSpacing: number;
  align: "start" | "center" | "end" | "justify";
  backdrop: "night" | "paper" | "ink" | "grid";
  color: "light" | "accent" | "warm" | "ink";
  kinetic: boolean;
  speed: number;
  stagger: number;
  ligatures: boolean;
  ss01: boolean;
  tabular: boolean;
  compare: boolean;
  gradAxis: number;
  glowRadius: number;
  strokeOutline: boolean;
  goldFoil: boolean;
  sizeAdjust: number;
  ascentOverride: number;
  exportTab: "css" | "tailwind" | "react" | "next";
}

const DEFAULT: FontSettings = {
  fontId: "hasti",
  compareId: "iran-nastaliq",
  text: "هنر، در جزئیاتی نهفته است که دیده نمی‌شوند",
  size: 58,
  weight: 700,
  lineHeight: 1.9,
  tracking: 0,
  wordSpacing: 0,
  align: "center",
  backdrop: "night",
  color: "light",
  kinetic: false,
  speed: 1,
  stagger: 0.06,
  ligatures: true,
  ss01: true,
  tabular: false,
  compare: false,
  gradAxis: 0,
  glowRadius: 0,
  strokeOutline: false,
  goldFoil: false,
  sizeAdjust: 98,
  ascentOverride: 90,
  exportTab: "css",
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "همه ۹۳" },
  { id: "nastaliq-calligraphy", label: "نستعلیق ۱۷" },
  { id: "special-display", label: "هنری ۲۴" },
  { id: "modern-ui", label: "مدرن ۲۹" },
  { id: "code", label: "کد و هکری ۱۰" },
  { id: "english-display", label: "لاتین ۱۳" },
];

const SAMPLES = [
  { label: "شعر", text: "دوش دیدم که ملائک در میخانه زدند" },
  { label: "برند", text: "آزمایشگاه موشن فارسی — RTL Motion Lab" },
  { label: "کد هکری", text: "const cipher = (x: u32) => x !== 0x9E3779B9 ? x >>= 4 : 0;" },
  { label: "عدد", text: "۱٬۲۵۰٬۰۰۰ تومان — ۱۲۳۴۵۶۷۸۹۰" },
  { label: "تمام‌نویسی", text: "ابجد هوز حطی کلمن سعفص قرشت ثخذ ضظغ" },
  { label: "انگلیسی", text: "QUANTUM KINETIC TYPOGRAPHY — 60FPS WEBGL SHADERS" },
];

const pad = (n: number) => n.toFixed(2).replace(/\.00$/, "");

/** Saves one real font file from /public/fonts. */
function downloadFont(font: PersianFontItem) {
  const file: FontFileInfo | null = fontFileFor(font.family);
  if (!file) return Promise.resolve(false);
  return saveUrl(file.url, file.file);
}

export const FontStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<FontSettings>("studio-fonts", DEFAULT);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [replay, setReplay] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "typography" | "layout" | "calibration" | "effects" | "motion" | "compare"
  >("typography");

  const font = PERSIAN_FONT_CATALOG.find((f) => f.id === s.fontId) ?? PERSIAN_FONT_CATALOG[0];
  const compareFont =
    PERSIAN_FONT_CATALOG.find((f) => f.id === s.compareId) ?? PERSIAN_FONT_CATALOG[1];
  const file = fontFileFor(font.family);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PERSIAN_FONT_CATALOG.filter((f) => {
      const inCat = cat === "all" || f.category === cat;
      const inTerm =
        !term ||
        f.nameFa.includes(term) ||
        f.nameEn.toLowerCase().includes(term) ||
        f.id.includes(term);
      return inCat && inTerm;
    });
  }, [q, cat]);

  const rowText = useDebounced(s.text, 180);
  const words = useMemo(() => s.text.split(/\s+/).filter(Boolean), [s.text]);

  // --- STAGE STYLE (Live Preview) ---
  const stageStyle: React.CSSProperties = {
    fontFamily: font.family,
    fontSize: `${s.size}px`,
    fontWeight: s.weight,
    lineHeight: s.lineHeight,
    letterSpacing: `${s.tracking}px`,
    wordSpacing: `${s.wordSpacing}px`,
    textAlign: s.align,
    fontVariationSettings: `"wght" ${s.weight}, "GRAD" ${s.gradAxis ?? 0}`,
    fontFeatureSettings: `"liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0}, "ss01" ${s.ss01 ? 1 : 0}, "kern" 1`,
    fontVariantNumeric: s.tabular ? "tabular-nums" : "normal",
    textShadow:
      (s.glowRadius ?? 0) > 0 ? `0 0 ${s.glowRadius}px rgba(45,212,191,0.45)` : undefined,
    WebkitTextStroke: s.strokeOutline ? "1.3px #E6B84B" : undefined,
    backgroundImage: s.goldFoil
      ? "linear-gradient(135deg, #FEF3C7 0%, #F59E0B 50%, #D97706 100%)"
      : undefined,
    WebkitBackgroundClip: s.goldFoil ? "text" : undefined,
    WebkitTextFillColor: s.goldFoil || s.strokeOutline ? "transparent" : undefined,
  };

  const colorClass =
    s.color === "light"
      ? "text-zinc-50"
      : s.color === "accent"
        ? "text-[color:var(--teal-primary)]"
        : s.color === "warm"
          ? "text-[#F0D9A8]"
          : "text-[#191410]";

  const backdropClass =
    s.backdrop === "night"
      ? "bg-[#0A0A0C]"
      : s.backdrop === "paper"
        ? "paper"
        : s.backdrop === "ink"
          ? "bg-[#141210]"
          : "bg-[#0A0A0C] bg-engineering-grid";

  /* ------------------------------------------------------------- snippets */

  const cssSnippet = `/* ${font.nameFa} — ${font.nameEn} (Zero-CLS Optical Calibration) */
@font-face {
  font-family: "${font.nameEn}";
  src: url("./${file?.file ?? `${font.nameEn}.woff2`}") format("${file?.format ?? "woff2"}");
  font-weight: ${font.isVariable ? "100 900" : s.weight};
  font-display: swap;
  size-adjust: ${s.sizeAdjust ?? 98}%;
  ascent-override: ${s.ascentOverride ?? 90}%;
  descent-override: 25%;
}

.type-${font.id} {
  font-family: "${font.nameEn}", "Vazirmatn", sans-serif;
  font-size: ${s.size}px;
  font-weight: ${s.weight};
  line-height: ${s.lineHeight};
  letter-spacing: ${s.tracking}px;
  word-spacing: ${s.wordSpacing}px;
  font-variation-settings: "wght" ${s.weight}, "GRAD" ${s.gradAxis ?? 0};
  font-feature-settings: "ss01" ${s.ss01 ? 1 : 0}, "liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0};${
    (s.glowRadius ?? 0) > 0
      ? `\n  text-shadow: 0 0 ${s.glowRadius}px rgba(45,212,191,0.45);`
      : ""
  }${s.strokeOutline ? `\n  -webkit-text-stroke: 1.3px #E6B84B;\n  color: transparent;` : ""}}`;

  const tailwindSnippet = `<h1
  dir="rtl"
  className="text-[${s.size}px] font-[${s.weight}] leading-[${pad(s.lineHeight)}] tracking-[${s.tracking}px] ${
    s.align === "center"
      ? "text-center"
      : s.align === "start"
        ? "text-start"
        : s.align === "end"
          ? "text-end"
          : "text-justify"
  }"
  style={{ fontFamily: '"${font.nameEn}", "Vazirmatn", sans-serif' }}
>
  ${s.text}
</h1>`;

  const reactSnippet = `import { motion } from "framer-motion";

const WORDS = ${JSON.stringify(s.text)}.split(" ");

export function PersianHeadline() {
  return (
    <motion.h1
      dir="rtl"
      style={{
        fontFamily: '"${font.nameEn}", "Vazirmatn", sans-serif',
        fontSize: ${s.size},
        fontWeight: ${s.weight},
        lineHeight: ${s.lineHeight},
        letterSpacing: ${s.tracking},
        wordSpacing: ${s.wordSpacing},
      }}
      className="flex flex-wrap justify-center gap-x-3 text-center text-[#FAFAFA]"
    >
      {WORDS.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: ${Math.round(240 * s.speed)}, damping: 24, delay: i * ${s.stagger} }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}`;

  const nextSnippet = `import localFont from "next/font/local";

export const ${font.id.replace(/[^\\w]/g, "_")} = localFont({
  src: "./${file?.file ?? `${font.nameEn}.woff2`}",
  weight: "${font.isVariable ? "100 900" : String(s.weight)}",
  display: "swap",
  variable: "--font-${font.id.replace(/[^\\w]/g, "-")}",
  fallback: ["Vazirmatn", "sans-serif"],
});`;

  const exportCode = {
    css: cssSnippet,
    tailwind: tailwindSnippet,
    react: reactSnippet,
    next: nextSnippet,
  }[s.exportTab];

  /* ------------------------------------------------------------- downloads */

  const downloadKit = useCallback(async () => {
    const info = fontFileFor(font.family);
    if (!info) return false;
    const blob = await fetchAsBlob(info.url);
    if (!blob) return false;
    return saveKit(`rtl-motion-font-${font.id}`, [
      { name: info.file, content: blob },
      {
        name: "font.css",
        content: `/* ${font.nameFa} (${font.nameEn}) — RTL Motion Lab */
@font-face {
  font-family: "${font.nameEn}";
  src: url("./${info.file}") format("${info.format}");
  font-weight: ${font.isVariable ? "100 900" : info.weight};
  font-display: swap;
}

.persian-type {
  font-family: "${font.nameEn}", "Vazirmatn", sans-serif;
  line-height: ${font.recommendedLineHeight ?? s.lineHeight};
  letter-spacing: 0;
  font-feature-settings: "ss01" 1, "kern" 1, "liga" 1;
}
`,
      },
      { name: "Example.tsx", content: reactSnippet },
      {
        name: "README.txt",
        content: `RTL Motion Lab — ${font.nameFa} (${font.nameEn})
=========================================================
متن فونت: ${font.descriptionFa}
دسته: ${font.category}${font.isVariable ? " · متغیر (Variable)" : ""}
فایل: ${info.file} (${info.format})
ارتفاع خط پیشنهادی: ${font.recommendedLineHeight ?? 1.8}

استفاده:
1. فایل ${info.file} را کنار فایل CSS خود قرار دهید.
2. font.css را import کنید.
3. کلاس .persian-type یا font-family را روی متن فارسی بگذارید.
4. هرگز letter-spacing مثبت روی متن فارسی اعمال نکنید.
`,
      },
    ]);
  }, [font, reactSnippet, s.lineHeight]);

  const downloadAllFonts = useCallback(async () => {
    const entries = await Promise.all(
      PERSIAN_FONT_CATALOG.map(async (f) => {
        const info = fontFileFor(f.family);
        if (!info) return null;
        const blob = await fetchAsBlob(info.url);
        if (!blob) return null;
        return { font: f, info, blob };
      })
    );
    const ok = entries.filter((e): e is NonNullable<typeof e> => Boolean(e));
    if (ok.length === 0) return false;
    const sheet = ok
      .map(
        ({ font: f, info }) =>
          `.${f.id} {
  font-family: "${f.nameEn}", "Vazirmatn", sans-serif;
  line-height: ${
            f.recommendedLineHeight ?? 1.8
          };
}
@font-face {
  font-family: "${f.nameEn}";
  src: url("./${info.file}") format("${info.format}");
  font-weight: ${info.weight};
  font-display: swap;
}`
      )
      .join("\n\n");
    return saveKit("rtl-motion-all-fonts", [
      ...ok.map(({ info, blob }) => ({ name: info.file, content: blob })),
      {
        name: "fonts.css",
        content: `/* ${ok.length} خانواده فونت فارسی — RTL Motion Lab */

${sheet}
`,
      },
      {
        name: "catalog.json",
        content: JSON.stringify(
          ok.map(({ font: f, info }) => ({
            id: f.id,
            nameFa: f.nameFa,
            nameEn: f.nameEn,
            category: f.category,
            file: info.file,
            format: info.format,
            variable: Boolean(f.isVariable),
            farsiDigits: Boolean(f.hasFarsiDigits),
          })),
          null,
          2
        ),
      },
      {
        name: "README.txt",
        content: `RTL Motion Lab — آرشیو کامل خانواده‌های فونت فارسی
تعداد: ${ok.length} خانواده
شامل فایل اصلی هر فونت + fonts.css + catalog.json

مجوز هر فونت مطابق مخزن اصلی آن است؛ پیش از استفاده تجاری بررسی کنید.
`,
      },
    ]);
  }, []);

  /* ----------------------------------------------------------------- list */

  const selectFont = useCallback(
    (id: string) => {
      soundEngine.playTick(1);
      set({ fontId: id });
      focusStudioPreview();
    },
    [set]
  );

  /* --- THE STAGE (NEW LAYOUT) --- */

  const topBar = (
    <div className="flex items-center justify-between px-5 py-3 bg-[color:var(--bg-surface-1)] border-b border-[color:var(--border-base)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-[#2DD4BF] to-[#0F3A35] flex items-center justify-center text-white font-bold">
          م
        </div>
        <div>
          <h1 className="text-[16px] font-bold text-[color:var(--text-main)] leading-tight">آزمایشگاه موشن فارسی</h1>
          <p className="text-[12px] text-[color:var(--text-muted)]">استودیو فونت · ۹۳ خانواده</p>
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)] group-focus-within:text-[color:var(--teal-primary)] transition-colors" />
          <input 
            type="text"
            placeholder="جستجو ⌘K"
            className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--border-base)] rounded-[var(--radius-md)] py-1.5 pl-10 pr-4 text-[14px] text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--teal-primary)] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => reset()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] border border-[color:var(--border-base)] text-[13px] text-[color:var(--text-muted)] hover:bg-[color:var(--bg-surface-2)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> بازنشانی
        </button>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-[var(--radius-md)] border border-[color:var(--border-base)] text-[color:var(--text-muted)] hover:bg-[color:var(--bg-surface-2)] transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button 
          onClick={downloadAllFonts}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-md)] bg-[color:var(--teal-primary)] text-[color:var(--bg-base)] font-medium text-[13px] hover:bg-[color:var(--teal-active)] transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)]"
        >
          <Download className="w-3.5 h-3.5" /> دانلود کیت کامل
        </button>
      </div>
    </div>
  );

  const inspector = (
    <div className="w-[390px] h-full rounded-[var(--radius-lg)] bg-gradient-to-b from-[color:var(--bg-inspector-top)] to-[color:var(--bg-inspector-bottom)] border border-[color:var(--border-inspector)] p-5 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[color:var(--text-main)]">تنظیمات</h2>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-md)] bg-[color:var(--bg-surface-2)] border border-[color:var(--border-base)] text-[12px] text-[color:var(--teal-primary)] hover:bg-[color:var(--teal-bg-active)] transition-colors">
          <Save className="w-3 h-3" /> ذخیره پریست
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "typography", label: "تایپوگرافی", count: 5 },
          { id: "layout", label: "چیدمان و رنگ", count: 3 },
          { id: "calibration", label: "کالیبراسیون", count: 4 },
          { id: "effects", label: "افکت‌ها", count: 2 },
          { id: "motion", label: "حرکت", count: 3 },
          { id: "compare", label: "مقایسه", count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-h-[34px] px-2 py-1 rounded-[var(--radius-md)] text-[12px] font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)] shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
            }`}
          >
            {tab.label} <span className="opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === "typography" && (
          <div className="space-y-4">
            {[
              { label: "اندازه قلم", key: "size", min: 12, max: 140, unit: "px", step: 1 },
              { label: "وزن", key: "weight", min: 100, max: 900, unit: "", step: 100, hint: font.isVariable ? "این فونت محور وزن متغیر دارد" : "فونت ثابت — نزدیک‌ترین وزن جایگزین می‌شود" },
              { label: "ارتفاع خط", key: "lineHeight", min: 1, max: 3, unit: "", step: 0.05, format: (v: number) => v.toFixed(2) },
              { label: "فاصله حروف", key: "tracking", min: -2, max: 8, unit: "px", step: 0.1, format: (v: number) => v.toFixed(1), hint: "برای فارسی صفر توصیه می‌شود" },
              { label: "فاصله واژه‌ها", key: "wordSpacing", min: -2, max: 14, unit: "px", step: 0.5, format: (v: number) => v.toFixed(1) },
            ].map((t) => (
              <div key={t.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] text-[color:var(--text-main)]">{t.label}</label>
                  <span className="font-mono text-[12px] text-[color:var(--teal-primary)]">
                    {t.format ? t.format(s[t.key as keyof FontSettings] as number) : `${s[t.key as keyof FontSettings]}${t.unit}`}
                  </span>
                </div>
                <input 
                  type="range"
                  min={t.min}
                  max={t.max}
                  step={t.step}
                  value={s[t.key as keyof FontSettings]}
                  onChange={(e) => set({ [t.key]: parseFloat(e.target.value) } as Partial<FontSettings>)}
                  className="w-full h-1.5 bg-[color:var(--border-base)] rounded-lg appearance-none cursor-pointer accent-[color:var(--teal-primary)]"
                />
                {t.hint && <p className="text-[10px] text-[color:var(--text-muted)]">{t.hint}</p>}
              </div>
            ))}
            
            <div className="pt-4 border-t border-[color:var(--border-base)]">
              <h3 className="text-[12px] font-bold text-[color:var(--text-muted)] mb-3 uppercase tracking-wider">ویژگی‌های فونت</h3>
              <div className="space-y-2">
                {[
                  { label: "لیگاتورها (liga/calt)", key: "ligatures" },
                  { label: "جایگزین سبک ss01", key: "ss01", hint: "اعداد و فرم‌های فارسی" },
                  { label: "ارقام جدولی", key: "tabular" },
                ].map((t) => (
                  <div key={t.key} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[color:var(--text-main)]">{t.label}</span>
                      {t.hint && <span className="text-[10px] text-[color:var(--text-muted)]">{t.hint}</span>}
                    </div>
                    <input 
                      type="checkbox"
                      checked={s[t.key as keyof FontSettings]}
                      onChange={(e) => set({ [t.key]: e.target.checked } as Partial<FontSettings>)}
                      className="w-4 h-4 accent-[color:var(--teal-primary)]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[color:var(--border-base)]">
              <h3 className="text-[12px] font-bold text-[color:var(--text-muted)] mb-3 uppercase tracking-wider">تراز متن</h3>
              <div className="flex gap-1">
                {["راست", "وسط", "چپ", "تراز"].map((label, idx) => (
                  <button
                    key={label}
                    onClick={() => set({ align: ["start", "center", "end", "justify"][idx] as FontSettings["align"] })}
                    className={`flex-1 py-1.5 rounded-[var(--radius-md)] text-[12px] transition-colors ${
                      s.align === ["start", "center", "end", "justify"][idx]
                        ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                        : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-[color:var(--text-muted)] uppercase tracking-wider">تراز</h3>
            <div className="flex gap-1">
              {["راست", "وسط", "چپ", "تراز"].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => set({ align: ["start", "center", "end", "justify"][idx] as FontSettings["align"] })}
                  className={`flex-1 py-1.5 rounded-[var(--radius-md)] text-[12px] transition-colors ${
                    s.align === ["start", "center", "end", "justify"][idx]
                      ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                      : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <h3 className="text-[12px] font-bold text-[color:var(--text-muted)] uppercase tracking-wider mt-4">رنگ متن</h3>
            <div className="flex gap-1">
              {["روشن", "اکسنت", "گرم", "مرکب"].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => set({ color: ["light", "accent", "warm", "ink"][idx] as FontSettings["color"] })}
                  className={`flex-1 py-1.5 rounded-[var(--radius-md)] text-[12px] transition-colors ${
                    s.color === ["light", "accent", "warm", "ink"][idx]
                      ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                      : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <h3 className="text-[12px] font-bold text-[color:var(--text-muted)] uppercase tracking-wider mt-4">پس‌زمینه</h3>
            <div className="flex gap-1">
              {["شب", "کاغذ", "مرکب", "شبکه"].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => set({ backdrop: ["night", "paper", "ink", "grid"][idx] as FontSettings["backdrop"] })}
                  className={`flex-1 py-1.5 rounded-[var(--radius-md)] text-[12px] transition-colors ${
                    s.backdrop === ["night", "paper", "ink", "grid"][idx]
                      ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                      : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "calibration" && (
          <div className="space-y-4">
            {[
              { label: "محور نوری GRAD", key: "gradAxis", min: -50, max: 150, step: 5, unit: "" },
              { label: "هاله نوری (Optical Bloom)", key: "glowRadius", min: 0, max: 36, step: 2, unit: "px" },
              { label: "تطبیق ابعاد Zero-CLS", key: "sizeAdjust", min: 85, max: 115, step: 1, unit: "%" },
              { label: "تطبیق کرسی خط", key: "ascentOverride", min: 75, max: 110, step: 1, unit: "%" },
            ].map((t) => (
              <div key={t.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] text-[color:var(--text-main)]">{t.label}</label>
                  <span className="font-mono text-[12px] text-[color:var(--teal-primary)]">{s[t.key as keyof FontSettings]}{t.unit}</span>
                </div>
                <input 
                  type="range"
                  min={t.min} max={t.max} step={t.step}
                  value={s[t.key as keyof FontSettings]}
                  onChange={(e) => set({ [t.key]: parseFloat(e.target.value) } as Partial<FontSettings>)}
                  className="w-full h-1.5 bg-[color:var(--border-base)] rounded-lg appearance-none cursor-pointer accent-[color:var(--teal-primary)]"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "effects" && (
          <div className="space-y-3">
            {[
              { label: "طلاکوبی سلطنتی (Gold Foil Ink)", key: "goldFoil" },
              { label: "حاشیه توخالی پوستر (Text Stroke)", key: "strokeOutline" },
            ].map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-[13px] text-[color:var(--text-main)]">{t.label}</span>
                <input 
                  type="checkbox"
                  checked={s[t.key as keyof FontSettings]}
                  onChange={(e) => set({ [t.key]: e.target.checked } as Partial<FontSettings>)}
                  className="w-4 h-4 accent-[color:var(--teal-primary)]"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "motion" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[color:var(--text-main)]">فعال‌سازی انیمیشن واژه‌ها</span>
              <input 
                type="checkbox"
                checked={s.kinetic}
                onChange={(e) => set({ kinetic: e.target.checked } as Partial<FontSettings>)}
                className="w-4 h-4 accent-[color:var(--teal-primary)]"
              />
            </div>
            {[
              { label: "سرعت فنر", key: "speed", min: 0.3, max: 2.5, step: 0.1, unit: "×" },
              { label: "تأخیر پله‌ای", key: "stagger", min: 0, max: 0.3, step: 0.01, unit: "s" },
            ].map((t) => (
              <div key={t.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] text-[color:var(--text-main)]">{t.label}</label>
                  <span className="font-mono text-[12px] text-[color:var(--teal-primary)]">{s[t.key as keyof FontSettings]}{t.unit}</span>
                </div>
                <input 
                  type="range"
                  min={t.min} max={t.max} step={t.step}
                  value={s[t.key as keyof FontSettings]}
                  onChange={(e) => set({ [t.key]: parseFloat(e.target.value) } as Partial<FontSettings>)}
                  className="w-full h-1.5 bg-[color:var(--border-base)] rounded-lg appearance-none cursor-pointer accent-[color:var(--teal-primary)]"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "compare" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[color:var(--text-main)]">حالت مقایسه</span>
              <input 
                type="checkbox"
                checked={s.compare}
                onChange={(e) => set({ compare: e.target.checked } as Partial<FontSettings>)}
                className="w-4 h-4 accent-[color:var(--teal-primary)]"
              />
            </div>
            {s.compare && (
              <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-[var(--radius-md)] border border-[color:var(--border-base)] p-1">
                {PERSIAN_FONT_CATALOG.filter((f) => f.id !== s.fontId).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => set({ compareId: f.id })}
                    className={`block w-full truncate rounded px-2 py-1 text-start text-[13px] transition-colors ${
                      s.compareId === f.id
                        ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                        : "text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
                    }`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.nameFa}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const canvas = (
    <div className="flex-1 flex flex-col rounded-[var(--radius-lg)] border border-[color:var(--border-canvas)] bg-[color:var(--bg-base)] overflow-hidden relative">
      {/* Canvas Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border-base)]">
        <div>
          <h2 className="text-[34px] font-bold text-[color:var(--gold-primary)] leading-tight" style={{ fontFamily: font.family }}>
            {font.nameFa}
          </h2>
          <span className="text-[11px] text-[color:var(--text-muted)] font-mono">{font.nameEn} · {file?.ext.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample.label}
              onClick={() => set({ text: sample.text })}
              className="px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-base)] text-[12px] text-[color:var(--text-muted)] hover:border-[color:var(--teal-primary)] hover:text-[color:var(--teal-primary)] transition-colors"
            >
              {sample.label}
            </button>
          ))}
          <button 
            onClick={() => downloadFont(font)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-md)] bg-[color:var(--gold-primary)] text-[color:var(--bg-base)] font-bold text-[13px] hover:bg-[#D97706] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> دانلود فونت
          </button>
        </div>
      </div>

      {/* Live Preview Stage */}
      <div 
        className="flex-1 relative flex items-center justify-center p-8 overflow-hidden"
        style={{ background: "var(--bg-canvas-radial)" }}
      >
        {s.kinetic ? (
          <div
            key={replay}
            style={stageStyle}
            className={cn("flex flex-wrap justify-center gap-x-4 gap-y-1", colorClass)}
          >
            {words.map((w, i) => (
              <motion.span
                key={`${replay}-${i}`}
                initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  type: "spring",
                  stiffness: 240 * s.speed,
                  damping: 24,
                  delay: i * s.stagger,
                }}
                className="inline-block"
              >
                {w}
              </motion.span>
            ))}
          </div>
        ) : (
          <p
            data-tracking
            data-testid="font-specimen"
            style={stageStyle}
            className={cn("whitespace-pre-wrap break-words", colorClass)}
          >
            {s.text || "…"}
          </p>
        )}

        {s.compare && (
          <div className="mt-7 border-t border-[color:var(--border-base)] pt-5">
            <div className="mb-2 flex items-center gap-2 text-[10px] text-[color:var(--text-muted)]">
              <span className="font-mono">COMPARE</span>
              <span>{compareFont.nameFa}</span>
            </div>
            <p
              data-tracking
              style={{ ...stageStyle, fontFamily: compareFont.family }}
              className={cn("whitespace-pre-wrap break-words opacity-80", colorClass)}
            >
              {s.text}
            </p>
          </div>
        )}

        {/* Metrics Line */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[11px] text-[color:var(--text-muted)] font-mono">
          <span>{s.size}px / {pad(s.size * s.lineHeight)}px · w{s.weight} · ls {s.tracking}px</span>
          <span>{faNum(s.text.trim().split(/\s+/).filter(Boolean).length)} واژه · {faNum(s.text.replace(/\s/g, "").length)} حرف</span>
        </div>

        {/* Code Card (Floating) */}
        <div className="absolute bottom-6 right-6 w-[480px] bg-[color:var(--bg-surface-1)]/80 backdrop-blur-md border border-[color:var(--border-base)] rounded-[var(--radius-md)] p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <Segmented
              size="sm"
              value={s.exportTab}
              onChange={(v) => set({ exportTab: v })}
              options={[
                { value: "css", label: "CSS" },
                { value: "tailwind", label: "Tailwind" },
                { value: "react", label: "React" },
                { value: "next", label: "next/font" },
              ]}
            />
            <CopyButton text={exportCode} label="کپی" className="text-[11px]" />
          </div>
          <CodeBlock
            code={exportCode}
            language={s.exportTab === "css" ? "css" : "tsx"}
            filename={`${font.id}.${s.exportTab === "css" ? "css" : "tsx"}`}
            maxLines={10}
            className="text-[11px]"
          />
        </div>
      </div>
    </div>
  );

  const fontDock = (
    <div className="h-[140px] rounded-[var(--radius-lg)] bg-[color:var(--bg-surface-1)] border border-[color:var(--border-base)] flex flex-col p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-bold text-[color:var(--text-main)]">کتابخانه فونت</h2>
          <span className="text-[12px] text-[color:var(--teal-primary)] font-mono">{faNum(filtered.length)} از {faNum(PERSIAN_FONT_CATALOG.length)}</span>
        </div>
        <div className="flex items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-2 py-0.5 rounded-[var(--radius-md)] text-[11px] transition-colors ${
                cat === c.id
                  ? "bg-[color:var(--teal-primary)] text-[color:var(--bg-base)]"
                  : "bg-[color:var(--bg-surface-2)] text-[color:var(--text-muted)] hover:bg-[color:var(--border-base)]"
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[color:var(--text-muted)]" />
            <input 
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام فونت…"
              className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--border-base)] rounded-[var(--radius-md)] py-1 pl-8 pr-2 text-[12px] text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--teal-primary)] transition-colors"
            />
          </div>
          <button 
            onClick={downloadAllFonts}
            className="px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-base)] text-[12px] text-[color:var(--teal-primary)] hover:bg-[color:var(--teal-bg-active)] transition-colors"
          >
            دانلود همه ۹۳
          </button>
        </div>
      </div>

      {/* Font Rail */}
      <div className="flex-1 overflow-x-auto flex gap-3 pb-2 custom-scrollbar-x">
        {filtered.map((f) => {
          const active = s.fontId === f.id;
          const info = fontFileFor(f.family);
          return (
            <div
              key={f.id}
              onClick={() => selectFont(f.id)}
              className={`flex-shrink-0 w-[164px] h-[108px] rounded-[var(--radius-md)] border transition-all cursor-pointer flex flex-col items-center justify-center p-3 ${
                active
                  ? "border-[color:var(--teal-primary)] bg-[color:var(--bg-surface-2)] shadow-[0_0_34px_rgba(45,212,191,0.25)]"
                  : "border-[color:var(--border-base)] bg-[color:var(--bg-surface-2)]/50 hover:border-[color:var(--teal-primary)]/50 hover:bg-[color:var(--border-base)]/30 transition-colors"
              }`}
            >
              <span 
                className="text-[30px] leading-none text-[color:var(--text-main)] truncate mb-1"
                style={{ fontFamily: f.family }}
              >
                {f.nameFa}
              </span>
              <span 
                className="text-[11px] text-[color:var(--text-muted)] font-mono truncate"
                style={{ fontFamily: f.family }}
              >
                {f.nameEn} {f.isVariable ? "· VF" : ""}
              </span>
              {f.isVariable && <Badge tone="accent" className="absolute top-1 right-1 text-[9px]">VF</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[color:var(--bg-base)] text-[color:var(--text-main)] font-[var(--font-ui)] overflow-hidden">
      {/* Top Bar */}
      {topBar}

      {/* Main Stage (2 Columns) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center Canvas */}
        <div className="flex-1 relative flex flex-col p-4 gap-4 overflow-hidden">
          {canvas}
        </div>

        {/* Right Inspector */}
        {!isFullscreen && (
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-[390px] shrink-0"
          >
            {inspector}
          </motion.div>
        )}
      </div>

      {/* Bottom Font Dock */}
      <div className="h-[140px] shrink-0">
        {fontDock}
      </div>
    </div>
  );
};

export default FontStudio;