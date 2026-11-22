import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Code2,
  RotateCcw,
  Sparkles,
  Type,
  X,
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
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";

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
  { id: "all", label: "همه" },
  { id: "nastaliq-calligraphy", label: "نستعلیق" },
  { id: "special-display", label: "هنری" },
  { id: "modern-ui", label: "مدرن" },
  { id: "code", label: "کد و هکری" },
  { id: "english-display", label: "لاتین" },
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
  const [codeOpen, setCodeOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"stage" | "settings" | "list">("stage");

  useEffect(() => {
    if (!codeOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCodeOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [codeOpen]);

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
      (s.glowRadius ?? 0) > 0 ? `0 0 ${s.glowRadius}px rgba(245, 197, 66, 0.55)` : undefined,
    WebkitTextStroke: s.strokeOutline ? "1.3px #F5C542" : undefined,
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
        ? "text-[color:var(--accent)]"
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
      ? `\n  text-shadow: 0 0 ${s.glowRadius}px rgba(245, 197, 66, 0.55);`
      : ""
  }${s.strokeOutline ? `\n  -webkit-text-stroke: 1.3px #F5C542;\n  color: transparent;` : ""}
}`;

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

export const ${font.id.replace(/[^\w]/g, "_")} = localFont({
  src: "./${file?.file ?? `${font.nameEn}.woff2`}",
  weight: "${font.isVariable ? "100 900" : String(s.weight)}",
  display: "swap",
  variable: "--font-${font.id.replace(/[^\w]/g, "-")}",
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

  /* ----------------------------------------------------------------- list */

  const selectFont = useCallback(
    (id: string) => {
      soundEngine.playTick(1);
      set({ fontId: id });
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 1199px)").matches) {
        setMobileTab("stage");
      }
    },
    [set]
  );

  const fontCards = useMemo(
    () =>
      filtered.map((f) => {
        const active = s.fontId === f.id;
        return (
          <button
            key={f.id}
            type="button"
            data-font-id={f.id}
            aria-pressed={active}
            onClick={() => selectFont(f.id)}
            className={cn(
              "group relative flex w-[172px] min-w-[172px] snap-start flex-col rounded-xl border p-3 text-start transition-all",
              active
                ? "border-[color:var(--accent)]/55 bg-[color:var(--accent)]/[0.09] shadow-[0_10px_28px_-18px_rgba(var(--accent-glow),0.8)]"
                : "border-white/[0.07] bg-[#0A0C12]/80 hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-[12px] font-bold text-zinc-100">{f.nameFa}</span>
              {f.isVariable && <Badge tone="accent">VF</Badge>}
            </span>
            <span
              className="mt-2 line-clamp-2 min-h-10 w-full text-[15px] leading-[1.7] text-zinc-200"
              style={{ fontFamily: f.family }}
            >
              {rowText || "آزمایش حروف فارسی"}
            </span>
            <span
              className="mt-2 block w-full truncate font-mono text-[9px] text-zinc-500"
              dir="ltr"
            >
              {f.nameEn}
            </span>
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[color:var(--accent)]" />
            )}
          </button>
        );
      }),
    [filtered, rowText, s.fontId, selectFont]
  );

  /** Bundles every real font file + a catalog sheet into one archive. */
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
          `.${f.id} {\n  font-family: "${f.nameEn}", "Vazirmatn", sans-serif;\n  line-height: ${
            f.recommendedLineHeight ?? 1.8
          };\n}\n@font-face {\n  font-family: "${f.nameEn}";\n  src: url("./${info.file}") format("${info.format}");\n  font-weight: ${info.weight};\n  font-display: swap;\n}`
      )
      .join("\n\n");
    return saveKit("rtl-motion-all-fonts", [
      ...ok.map(({ info, blob }) => ({ name: info.file, content: blob })),
      {
        name: "fonts.css",
        content: `/* ${ok.length} خانواده فونت فارسی — RTL Motion Lab */\n\n${sheet}\n`,
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

  /* ---------------------------------------------------------------- workbench */

  const stage = (
    <Panel
      padded={false}
      className="overflow-hidden border-white/[0.09] shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400/30" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[12px] font-bold text-zinc-100">{font.nameFa}</span>
              {file && <Badge>{file.ext}</Badge>}
            </div>
            <span
              className="hidden truncate font-mono text-[9.5px] text-zinc-500 sm:block"
              dir="ltr"
            >
              {font.nameEn}
            </span>
          </div>
        </div>
        <DownloadButton
          compact
          label="دانلود فونت"
          filename={file?.file}
          onDownload={() => downloadFont(font)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <input
          value={s.text}
          onChange={(e) => set({ text: e.target.value })}
          dir="rtl"
          placeholder="جمله خودتان را بنویسید…"
          aria-label="متن نمونه"
          className="min-w-[180px] flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-[12px] text-zinc-200 outline-none transition-colors focus:border-[color:var(--accent)]/50"
        />
        <div className="flex items-center gap-1">
          {SAMPLES.slice(0, 3).map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => set({ text: sample.text })}
              className="hidden rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1.5 text-[10px] text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 sm:block"
            >
              {sample.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setReplay((r) => r + 1)}
            title="پخش دوباره حرکت"
            aria-label="پخش دوباره حرکت"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)]/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative flex min-h-[280px] items-center justify-center overflow-hidden p-5 sm:min-h-[340px] sm:p-8 desk:min-h-[clamp(300px,42vh,380px)]",
          backdropClass
        )}
      >
        {s.backdrop === "night" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(var(--accent-glow),0.13), transparent 70%)",
            }}
          />
        )}
        <div className="relative w-full">
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
            <div className="mt-7 border-t border-white/10 pt-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] text-zinc-500">
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
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3.5 py-2.5 text-[10px] text-zinc-500">
        <span className="font-mono" dir="ltr">
          {s.size}px / {pad(s.size * s.lineHeight)}px · w{s.weight} · ls {s.tracking}px
        </span>
        <span>
          {faNum(s.text.trim().split(/\s+/).filter(Boolean).length)} واژه ·{" "}
          {faNum(s.text.replace(/\s/g, "").length)} حرف
        </span>
      </div>
    </Panel>
  );

  const fontPicker = (
    <Panel
      title="انتخاب خانوادهٔ فونت"
      subtitle="نمونهٔ زندهٔ هر قلم را ببینید و انتخاب کنید"
      actions={<Badge tone="accent">{faNum(filtered.length)} نتیجه</Badge>}
      className="overflow-hidden"
    >
      <div className="mb-3 flex flex-col gap-2">
        <SearchField value={q} onChange={setQ} placeholder="جستجوی نام فارسی یا لاتین…" />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const count =
              c.id === "all"
                ? PERSIAN_FONT_CATALOG.length
                : PERSIAN_FONT_CATALOG.filter((f) => f.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={cn(
                  "rounded-lg border px-2 py-1 text-[10px] transition-colors",
                  cat === c.id
                    ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                    : "border-white/[0.07] text-zinc-500 hover:border-white/15 hover:text-zinc-200"
                )}
              >
                {c.label} <span className="ms-1 font-mono opacity-60">{faNum(count)}</span>
              </button>
            );
          })}
        </div>
      </div>
      {filtered.length > 0 ? (
        <div
          dir="rtl"
          aria-label="فونت‌ها؛ افقی پیمایش کنید"
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 studio-scroll"
        >
          {fontCards}
        </div>
      ) : (
        <p className="py-8 text-center text-[11px] text-zinc-500">فونتی با این مشخصات پیدا نشد</p>
      )}
    </Panel>
  );

  const glyphSpecimen = (
    <Panel
      title="آزمایشگاه حروف"
      subtitle={`حروف، اعداد و لیگچرهای ${font.nameFa} را در یک نگاه بررسی کنید`}
      tone="flat"
    >
      <div className="space-y-3">
        <div
          style={{ fontFamily: font.family, fontWeight: s.weight }}
          className="text-[clamp(18px,3vw,28px)] leading-[2] text-zinc-200"
        >
          ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی
        </div>
        <div
          dir="ltr"
          style={{
            fontFamily: font.family,
            fontWeight: s.weight,
            fontFeatureSettings: `"liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0}`,
          }}
          className="text-[clamp(15px,2.2vw,22px)] leading-[1.65] text-emerald-300/90"
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz
        </div>
        <div style={{ fontFamily: font.family }} className="text-[16px] leading-[2] text-zinc-400">
          ۰۱۲۳۴۵۶۷۸۹ — 0123456789 — «گفتا که…» (۱۲٪) · 0x9E3779B9
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
          {["۱۲۳", "۴۵۶", "۷۸۹", "۰", "٬", "٫", "،", "؛", "؟"].map((g) => (
            <div
              key={g}
              className="flex h-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[16px] text-zinc-300"
              style={{ fontFamily: font.family }}
            >
              {g}
            </div>
          ))}
        </div>
        <div dir="ltr" className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-9">
          {["=>", "!==", "===", "<=", ">=", "|>", "::", ">>=", "/**/"].map((lig) => (
            <div
              key={lig}
              className="flex h-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] font-mono text-[14px] text-emerald-300"
              style={{
                fontFamily: font.family,
                fontFeatureSettings: `"liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0}`,
              }}
              title="تست لیگچر کدنویسی (Coding Ligature)"
            >
              {lig}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );

  /* ------------------------------------------------------------- settings */

  const settings = (
    <div className="space-y-4">
      <Panel title="متن نمونه" subtitle="جمله خودتان یا یکی از این‌ها">
        <textarea
          value={s.text}
          onChange={(e) => set({ text: e.target.value })}
          rows={2}
          dir="rtl"
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2 text-[12px] leading-relaxed text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {SAMPLES.map((sample) => (
            <button
              key={sample.label}
              onClick={() => set({ text: sample.text })}
              className={cn(
                "rounded-md border px-1.5 py-1 text-[9.5px] transition-colors",
                s.text === sample.text
                  ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                  : "border-white/[0.07] text-zinc-400 hover:border-white/20 hover:text-zinc-100"
              )}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        tone="inset"
        title="آرشیو کامل"
        subtitle={`همه ${faNum(PERSIAN_FONT_CATALOG.length)} فایل فونت + fonts.css`}
      >
        <DownloadButton
          label="دانلود همه فونت‌ها"
          filename="rtl-motion-all-fonts.zip"
          onDownload={downloadAllFonts}
          variant="solid"
          className="w-full justify-center"
        />
      </Panel>

      <Panel title="تایپوگرافی" subtitle="کنترل کامل قلم">
        <div className="space-y-3.5">
          <Slider
            label="اندازه قلم"
            value={s.size}
            min={12}
            max={140}
            unit="px"
            onChange={(v) => set({ size: v })}
          />
          <Slider
            label="وزن"
            value={s.weight}
            min={100}
            max={900}
            step={100}
            onChange={(v) => set({ weight: v })}
            hint={
              font.isVariable
                ? "این فونت محور وزن متغیر دارد"
                : "فونت ثابت — نزدیک‌ترین وزن جایگزین می‌شود"
            }
          />
          <Slider
            label="ارتفاع خط"
            value={s.lineHeight}
            min={1}
            max={3}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ lineHeight: v })}
          />
          <Slider
            label="فاصله حروف"
            value={s.tracking}
            min={-2}
            max={8}
            step={0.1}
            unit="px"
            format={(v) => v.toFixed(1)}
            onChange={(v) => set({ tracking: v })}
            hint="برای فارسی صفر توصیه می‌شود"
          />
          <Slider
            label="فاصله واژه‌ها"
            value={s.wordSpacing}
            min={-2}
            max={14}
            step={0.5}
            unit="px"
            format={(v) => v.toFixed(1)}
            onChange={(v) => set({ wordSpacing: v })}
          />
        </div>
      </Panel>

      <Panel title="چیدمان و رنگ">
        <div className="space-y-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-0.5">
            {[
              { v: "start", icon: AlignRight },
              { v: "center", icon: AlignCenter },
              { v: "end", icon: AlignLeft },
              { v: "justify", icon: AlignJustify },
            ].map(({ v, icon: Icon }) => (
              <button
                key={v}
                onClick={() => set({ align: v as FontSettings["align"] })}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors",
                  s.align === v ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-200"
                )}
                aria-label={`چیدمان ${v}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <Segmented
            className="w-full"
            size="sm"
            value={s.color}
            onChange={(v) => set({ color: v })}
            options={[
              { value: "light", label: "روشن" },
              { value: "accent", label: "اکسنت" },
              { value: "warm", label: "گرم" },
              { value: "ink", label: "مرکب" },
            ]}
          />
          <Segmented
            className="w-full"
            size="sm"
            value={s.backdrop}
            onChange={(v) => set({ backdrop: v })}
            options={[
              { value: "night", label: "شب" },
              { value: "paper", label: "کاغذ" },
              { value: "ink", label: "مرکب" },
              { value: "grid", label: "شبکه" },
            ]}
          />
        </div>
      </Panel>

      <Panel title="کالیبراسیون نوری و بدون پرش (Zero-CLS)">
        <div className="space-y-3">
          <Slider
            label="محور نوری GRAD (بدون تغییر عرض)"
            value={s.gradAxis ?? 0}
            min={-50}
            max={150}
            step={5}
            onChange={(v) => set({ gradAxis: v })}
            hint="تغییر ضخامت نوری بدون جابجایی چیدمان"
          />
          <Slider
            label="هالهٔ نوری حروف (Optical Bloom)"
            value={s.glowRadius ?? 0}
            min={0}
            max={36}
            step={2}
            unit="px"
            onChange={(v) => set({ glowRadius: v })}
          />
          <Slider
            label="تطبیق ابعاد Zero-CLS (size-adjust)"
            value={s.sizeAdjust ?? 98}
            min={85}
            max={115}
            step={1}
            unit="%"
            onChange={(v) => set({ sizeAdjust: v })}
          />
          <Slider
            label="تطبیق کرسی خط (ascent-override)"
            value={s.ascentOverride ?? 90}
            min={75}
            max={110}
            step={1}
            unit="%"
            onChange={(v) => set({ ascentOverride: v })}
          />
          <Toggle
            label="طلاکوبی سلطنتی (Gold Foil Ink)"
            checked={Boolean(s.goldFoil)}
            onChange={(v) => set({ goldFoil: v })}
          />
          <Toggle
            label="حاشیهٔ توخالی پوستر (Text Stroke)"
            checked={Boolean(s.strokeOutline)}
            onChange={(v) => set({ strokeOutline: v })}
          />
        </div>
      </Panel>

      <Panel title="ویژگی‌های فونت">
        <div className="space-y-2">
          <Toggle
            label="لیگاتورها (liga/calt)"
            checked={s.ligatures}
            onChange={(v) => set({ ligatures: v })}
          />
          <Toggle
            label="جایگزین سبک ss01"
            checked={s.ss01}
            onChange={(v) => set({ ss01: v })}
            hint="اعداد و فرم‌های فارسی"
          />
          <Toggle label="ارقام جدولی" checked={s.tabular} onChange={(v) => set({ tabular: v })} />
        </div>
      </Panel>

      <Panel title="حرکت جنبشی">
        <div className="space-y-3">
          <Toggle
            label="فعال‌سازی انیمیشن واژه‌ها"
            checked={s.kinetic}
            onChange={(v) => set({ kinetic: v })}
          />
          <Slider
            label="سرعت فنر"
            value={s.speed}
            min={0.3}
            max={2.5}
            step={0.1}
            format={(v) => `${v.toFixed(1)}×`}
            onChange={(v) => set({ speed: v })}
          />
          <Slider
            label="تأخیر پله‌ای"
            value={s.stagger}
            min={0}
            max={0.3}
            step={0.01}
            unit="s"
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ stagger: v })}
          />
        </div>
      </Panel>

      <Panel title="مقایسه">
        <div className="space-y-2">
          <Toggle
            label="حالت مقایسه"
            checked={s.compare}
            onChange={(v) => set({ compare: v })}
            hint="نمایش هم‌زمان با فونت دوم"
          />
          {s.compare && (
            <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-lg border border-white/[0.06] p-1">
              {PERSIAN_FONT_CATALOG.filter((f) => f.id !== s.fontId).map((f) => (
                <button
                  key={f.id}
                  onClick={() => set({ compareId: f.id })}
                  className={cn(
                    "block w-full truncate rounded px-2 py-1 text-start text-[13px] transition-colors",
                    s.compareId === f.id
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5"
                  )}
                  style={{ fontFamily: f.family }}
                >
                  {f.nameFa}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel tone="inset" title="درباره این فونت">
        <p className="text-[11.5px] leading-relaxed text-zinc-400">{font.descriptionFa}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge>{font.category}</Badge>
          <Badge>ارتفاع خط {font.recommendedLineHeight ?? 1.7}</Badge>
          {font.hasFarsiDigits && <Badge tone="success">ارقام فارسی</Badge>}
          {file && <Badge tone="accent">{file.ext}</Badge>}
        </div>
        <CopyButton text={cssSnippet} label="کپی CSS فونت" className="mt-2 w-full justify-center" />
      </Panel>
    </div>
  );

  /* ---------------------------------------------------------------- shell */

  return (
    <div className="flex min-h-0 flex-col gap-3 desk:h-full">
      <header className="glass-bevel flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8B33A]/20 bg-[radial-gradient(100%_160%_at_100%_0%,rgba(232,179,58,0.12),rgba(8,10,15,0.94)_65%)] px-4 py-3 shadow-[0_18px_44px_-38px_rgba(232,179,58,0.5)]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8B33A]/30 bg-[#E8B33A]/[0.08] text-[#E8B33A] shadow-[0_0_24px_-12px_rgba(232,179,58,0.8)]">
            <Type className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#E8B33A]/70">
                FONT STUDIO / ATELIER
              </span>
              <Badge tone="accent">{faNum(PERSIAN_FONT_CATALOG.length)} خانواده</Badge>
              <Badge>{faNum(PERSIAN_FONT_CATALOG.filter((f) => f.isVariable).length)} متغیر</Badge>
            </div>
            <h1 className="mt-1 font-hasti text-[17px] leading-tight text-white sm:text-[20px]">
              کارگاه تایپوگرافی فارسی
            </h1>
            <p className="mt-1 hidden text-[10.5px] text-zinc-400 sm:block">
              فونت را انتخاب کنید، متن را تنظیم کنید و نتیجه را زنده ببینید.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCodeOpen(true)}
            className="flex h-9 items-center gap-2 rounded-xl border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/10 px-3 text-[11px] font-bold text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)]/18"
          >
            <Code2 className="h-3.5 w-3.5" />
            کد و خروجی
          </button>
          <DownloadButton
            label="کیت فونت"
            filename={`rtl-motion-font-${font.id}.zip`}
            onDownload={downloadKit}
            variant="outline"
          />
          <button
            type="button"
            onClick={() => {
              reset();
              soundEngine.playSnap();
            }}
            aria-label="بازنشانی تنظیمات"
            title="بازنشانی"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-2 text-[9.5px] text-zinc-400 sm:text-[10px]">
          <span className="rounded-lg border border-white/[0.08] bg-black/25 px-2 py-1">
            ۱ · انتخاب فونت
          </span>
          <span className="text-zinc-600">←</span>
          <span className="rounded-lg border border-white/[0.08] bg-black/25 px-2 py-1">
            ۲ · تنظیم نمونه
          </span>
          <span className="text-zinc-600">←</span>
          <span className="rounded-lg border border-[#E8B33A]/25 bg-[#E8B33A]/[0.06] px-2 py-1 text-[#E8B33A]">
            ۳ · کپی کد یا دانلود
          </span>
        </div>
      </header>

      <nav
        aria-label="پنل‌های استودیو"
        className="sticky top-14 z-20 flex shrink-0 items-center gap-1 rounded-2xl border border-white/[0.09] bg-[#090B12]/95 p-1 shadow-[0_14px_34px_-14px_rgba(0,0,0,0.95)] backdrop-blur-xl desk:hidden"
      >
        {[
          { id: "stage", label: "پیش‌نمایش" },
          { id: "settings", label: "تنظیمات" },
          { id: "list", label: "فونت‌ها" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id as "stage" | "settings" | "list")}
            aria-pressed={mobileTab === tab.id}
            className={cn(
              "tap-target relative flex flex-1 items-center justify-center rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition-all",
              mobileTab === tab.id
                ? "bg-[color:var(--accent)]/15 text-white ring-1 ring-inset ring-[color:var(--accent)]/35"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 desk:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="order-1 flex min-h-0 flex-col gap-3 studio-scroll desk:order-none desk:overflow-y-auto desk:pe-1">
          <section
            data-rail="stage"
            className={cn("min-w-0 space-y-3", mobileTab !== "stage" && "hidden desk:block")}
          >
            {stage}
          </section>
          <section
            data-rail="list"
            className={cn("min-w-0 space-y-3", mobileTab !== "list" && "hidden desk:block")}
          >
            {fontPicker}
            {glyphSpecimen}
          </section>
        </div>

        <aside
          data-rail="settings"
          className={cn(
            "order-2 min-h-0 studio-scroll desk:order-none desk:overflow-y-auto desk:pe-1",
            mobileTab !== "settings" && "hidden desk:block"
          )}
        >
          <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#080A10]/95 px-3 py-2.5 shadow-[0_12px_24px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div>
              <h2 className="text-[12px] font-bold text-zinc-100">تنظیمات قلم</h2>
              <p className="mt-0.5 text-[9.5px] text-zinc-500">همهٔ تغییرها زنده اعمال می‌شوند</p>
            </div>
            <Badge tone="accent">{font.nameFa}</Badge>
          </div>
          {settings}
        </aside>
      </div>

      {codeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCodeOpen(false);
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="font-code-title"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[min(88dvh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[color:var(--accent)]/25 bg-[#090B12] shadow-[0_32px_100px_-24px_rgba(0,0,0,0.95)]"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[radial-gradient(100%_150%_at_100%_0%,rgba(var(--accent-glow),0.12),transparent_70%)] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                  <Code2 className="h-4 w-4" />
                </span>
                <div>
                  <h2 id="font-code-title" className="text-[13px] font-bold text-zinc-100">
                    کد آمادهٔ استفاده
                  </h2>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {font.nameFa} · بر اساس تنظیمات فعلی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCodeOpen(false)}
                aria-label="بستن پنجره کد"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
              <Segmented
                size="sm"
                value={s.exportTab}
                onChange={(v) => set({ exportTab: v })}
                options={[
                  { value: "css", label: "CSS" },
                  { value: "tailwind", label: "Tailwind" },
                  { value: "react", label: "React" },
                  { value: "next", label: "Next.js" },
                ]}
              />
              <CopyButton text={exportCode} label="کپی این خروجی" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 studio-scroll">
              <CodeBlock
                code={exportCode}
                language={s.exportTab === "css" ? "css" : "tsx"}
                filename={`${font.id}.${s.exportTab === "css" ? "css" : "tsx"}`}
                maxLines={24}
              />
            </div>
            <footer className="flex items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5 text-[10px] text-zinc-500">
              <span>می‌توانید هر نوع خروجی را جداگانه کپی کنید.</span>
              <span className="font-mono text-[color:var(--accent)]" dir="ltr">
                {font.id}
              </span>
            </footer>
          </motion.section>
        </div>
      )}
    </div>
  );
};

export default FontStudio;
