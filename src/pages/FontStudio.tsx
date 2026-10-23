import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Sparkles,
  Type,
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
import { StudioShell, StudioList } from "../ui/StudioShell";
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
  exportTab: "css",
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "nastaliq-calligraphy", label: "نستعلیق" },
  { id: "special-display", label: "هنری" },
  { id: "modern-ui", label: "مدرن" },
  { id: "code", label: "کد" },
];

const SAMPLES = [
  { label: "شعر", text: "دوش دیدم که ملائک در میخانه زدند" },
  { label: "برند", text: "آزمایشگاه موشن فارسی" },
  { label: "عدد", text: "۱٬۲۵۰٬۰۰۰ تومان — ۱۲۳۴۵۶۷۸۹۰" },
  { label: "تمام‌نویسی", text: "ابجد هوز حطی کلمن سعفص قرشت ثخذ ضظغ" },
  { label: "ترکیبی", text: "طراحی RTL با Tailwind v4 و Motion" },
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

  // deep-link from the landing page: ?font=<id> stored under "studio-fonts.pick"
  useEffect(() => {
    try {
      const pick = localStorage.getItem("studio-fonts.pick");
      if (pick && PERSIAN_FONT_CATALOG.some((f) => f.id === pick)) {
        set({ fontId: pick });
        localStorage.removeItem("studio-fonts.pick");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const font = PERSIAN_FONT_CATALOG.find((f) => f.id === s.fontId) ?? PERSIAN_FONT_CATALOG[0];
  const compareFont = PERSIAN_FONT_CATALOG.find((f) => f.id === s.compareId) ?? PERSIAN_FONT_CATALOG[1];
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
    fontFeatureSettings: `"liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0}, "ss01" ${s.ss01 ? 1 : 0}, "kern" 1`,
    fontVariantNumeric: s.tabular ? "tabular-nums" : "normal",
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

  const cssSnippet = `/* ${font.nameFa} — ${font.nameEn} */
@font-face {
  font-family: "${font.nameEn}";
  src: url("./${file?.file ?? `${font.nameEn}.woff2`}") format("${file?.format ?? "woff2"}");
  font-weight: ${font.isVariable ? "100 900" : s.weight};
  font-display: swap;
}

.type-${font.id} {
  font-family: "${font.nameEn}", "Vazirmatn", sans-serif;
  font-size: ${s.size}px;
  font-weight: ${s.weight};
  line-height: ${s.lineHeight};
  letter-spacing: ${s.tracking}px;
  word-spacing: ${s.wordSpacing}px;
  font-feature-settings: "ss01" ${s.ss01 ? 1 : 0}, "liga" ${s.ligatures ? 1 : 0}, "calt" ${s.ligatures ? 1 : 0};
}`;

  const tailwindSnippet = `<h1
  dir="rtl"
  className="text-[${s.size}px] font-[${s.weight}] leading-[${pad(s.lineHeight)}] tracking-[${s.tracking}px] ${
    s.align === "center" ? "text-center" : s.align === "start" ? "text-start" : s.align === "end" ? "text-end" : "text-justify"
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

  const exportCode = { css: cssSnippet, tailwind: tailwindSnippet, react: reactSnippet, next: nextSnippet }[
    s.exportTab
  ];

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
    },
    [set]
  );

  const rows = useMemo(
    () =>
      filtered.map((f) => {
        const active = s.fontId === f.id;
        const info = fontFileFor(f.family);
        return (
          <div
            key={f.id}
            className={cn(
              "group relative rounded-xl border transition-colors",
              active
                ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.07]"
                : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
            )}
          >
            <button
              data-font-id={f.id}
              onClick={() => selectFont(f.id)}
              className="flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-start"
            >
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-[15px] leading-tight text-zinc-100"
                  style={{ fontFamily: f.family }}
                >
                  {f.nameFa}
                </span>
                <span
                  className="mt-1 block truncate text-[12px] leading-tight text-zinc-500"
                  style={{ fontFamily: f.family }}
                >
                  {rowText || "نمونه متن"}
                </span>
              </span>
              {f.isVariable && <Badge tone="accent">VF</Badge>}
            </button>
            <div className="absolute end-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <DownloadButton
                compact
                label="دانلود فونت"
                filename={info?.file}
                onDownload={() => downloadFont(f)}
              />
            </div>
          </div>
        );
      }),
    [filtered, s.fontId, selectFont, rowText]
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
      { name: "fonts.css", content: `/* ${ok.length} خانواده فونت فارسی — RTL Motion Lab */\n\n${sheet}\n` },
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

  /* ---------------------------------------------------------------- stage */

  const stage = (
    <div className="space-y-4">
      <Panel padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="truncate text-[11.5px] font-medium text-zinc-200">{font.nameFa}</span>
            <span className="hidden truncate font-mono text-[10px] text-zinc-600 sm:block" dir="ltr">
              {font.nameEn}
            </span>
            {file && <Badge>{file.ext}</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            <DownloadButton
              label="دانلود فونت"
              filename={file?.file}
              onDownload={() => downloadFont(font)}
              variant="solid"
            />
            <DownloadButton
              label="کیت کامل"
              filename={`rtl-motion-font-${font.id}.zip`}
              onDownload={downloadKit}
            />
          </div>
        </div>

        {/* the visitor's own sentence drives every preview and every list row */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-2">
          <input
            value={s.text}
            onChange={(e) => set({ text: e.target.value })}
            dir="rtl"
            placeholder="جمله خودتان را بنویسید…"
            aria-label="متن نمونه"
            className="min-w-[160px] flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1.5 text-[12px] text-zinc-200 outline-none transition-colors focus:border-[color:var(--accent)]/50"
          />
          <div className="flex items-center gap-1">
            {SAMPLES.slice(0, 3).map((sample) => (
              <button
                key={sample.label}
                onClick={() => set({ text: sample.text })}
                className="hidden rounded-md border border-white/[0.07] bg-white/[0.02] px-1.5 py-1 text-[9.5px] text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 sm:block"
              >
                {sample.label}
              </button>
            ))}
            <button
              onClick={() => setReplay((r) => r + 1)}
              title="پخش دوباره حرکت"
              aria-label="پخش دوباره حرکت"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative flex min-h-[240px] items-center justify-center overflow-hidden p-5 sm:min-h-[290px] sm:p-8",
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
                    transition={{ type: "spring", stiffness: 240 * s.speed, damping: 24, delay: i * s.stagger }}
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

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2 text-[10px] text-zinc-500">
          <span className="font-mono" dir="ltr">
            {s.size}px / {pad(s.size * s.lineHeight)}px · w{s.weight} · ls {s.tracking}px
          </span>
          <span>
            {faNum(s.text.trim().split(/\s+/).filter(Boolean).length)} واژه ·{" "}
            {faNum(s.text.replace(/\s/g, "").length)} حرف
          </span>
        </div>
      </Panel>

      <Panel title="نمونه کامل حروف" subtitle={`ابجد، ارقام فارسی و لاتین در ${font.nameFa}`}>
        <div className="space-y-3">
          <div style={{ fontFamily: font.family, fontWeight: s.weight }} className="text-[clamp(18px,3vw,30px)] leading-[2] text-zinc-200">
            ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی
          </div>
          <div style={{ fontFamily: font.family }} className="text-[17px] leading-[2] text-zinc-400">
            ۰۱۲۳۴۵۶۷۸۹ — 0123456789 — «گفتا که…» (۱۲٪)
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
            {["۱۲۳", "۴۵۶", "۷۸۹", "۰", "٬", "٫", "،", "؛", "؟"].map((g) => (
              <div
                key={g}
                className="flex h-11 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[17px] text-zinc-300"
                style={{ fontFamily: font.family }}
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel
        title="خروجی کد"
        subtitle="دقیقاً همان مقادیری که در استودیو تنظیم کرده‌اید"
        actions={
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
        }
      >
        <CodeBlock
          code={exportCode}
          language={s.exportTab === "css" ? "css" : "tsx"}
          filename={`${font.id}.${s.exportTab === "css" ? "css" : "tsx"}`}
          maxLines={20}
        />
      </Panel>
    </div>
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

      <Panel tone="inset" title="آرشیو کامل" subtitle={`همه ${faNum(PERSIAN_FONT_CATALOG.length)} فایل فونت + fonts.css`}>
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
          <Slider label="اندازه قلم" value={s.size} min={12} max={140} unit="px" onChange={(v) => set({ size: v })} />
          <Slider
            label="وزن"
            value={s.weight}
            min={100}
            max={900}
            step={100}
            onChange={(v) => set({ weight: v })}
            hint={font.isVariable ? "این فونت محور وزن متغیر دارد" : "فونت ثابت — نزدیک‌ترین وزن جایگزین می‌شود"}
          />
          <Slider label="ارتفاع خط" value={s.lineHeight} min={1} max={3} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set({ lineHeight: v })} />
          <Slider label="فاصله حروف" value={s.tracking} min={-2} max={8} step={0.1} unit="px" format={(v) => v.toFixed(1)} onChange={(v) => set({ tracking: v })} hint="برای فارسی صفر توصیه می‌شود" />
          <Slider label="فاصله واژه‌ها" value={s.wordSpacing} min={-2} max={14} step={0.5} unit="px" format={(v) => v.toFixed(1)} onChange={(v) => set({ wordSpacing: v })} />
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

      <Panel title="ویژگی‌های فونت">
        <div className="space-y-2">
          <Toggle label="لیگاتورها (liga/calt)" checked={s.ligatures} onChange={(v) => set({ ligatures: v })} />
          <Toggle label="جایگزین سبک ss01" checked={s.ss01} onChange={(v) => set({ ss01: v })} hint="اعداد و فرم‌های فارسی" />
          <Toggle label="ارقام جدولی" checked={s.tabular} onChange={(v) => set({ tabular: v })} />
        </div>
      </Panel>

      <Panel title="حرکت جنبشی">
        <div className="space-y-3">
          <Toggle label="فعال‌سازی انیمیشن واژه‌ها" checked={s.kinetic} onChange={(v) => set({ kinetic: v })} />
          <Slider label="سرعت فنر" value={s.speed} min={0.3} max={2.5} step={0.1} format={(v) => `${v.toFixed(1)}×`} onChange={(v) => set({ speed: v })} />
          <Slider label="تأخیر پله‌ای" value={s.stagger} min={0} max={0.3} step={0.01} unit="s" format={(v) => v.toFixed(2)} onChange={(v) => set({ stagger: v })} />
        </div>
      </Panel>

      <Panel title="مقایسه">
        <div className="space-y-2">
          <Toggle label="حالت مقایسه" checked={s.compare} onChange={(v) => set({ compare: v })} hint="نمایش هم‌زمان با فونت دوم" />
          {s.compare && (
            <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-lg border border-white/[0.06] p-1">
              {PERSIAN_FONT_CATALOG.filter((f) => f.id !== s.fontId).map((f) => (
                <button
                  key={f.id}
                  onClick={() => set({ compareId: f.id })}
                  className={cn(
                    "block w-full truncate rounded px-2 py-1 text-start text-[13px] transition-colors",
                    s.compareId === f.id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
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
    <StudioShell
      eyebrow="FONT STUDIO"
      title="استودیو تایپوگرافی فارسی"
      description={`جمله خودتان را بنویسید و آن را در هر ${faNum(PERSIAN_FONT_CATALOG.length)} خانواده فونت فارسی ببینید؛ تنظیمات کامل سمت چپ و دانلود فایل واقعی فونت کنار هر مورد.`}
      icon={Type}
      stats={
        <>
          <Badge tone="accent">{faNum(PERSIAN_FONT_CATALOG.length)} خانواده</Badge>
          <Badge>{faNum(PERSIAN_FONT_CATALOG.filter((f) => f.isVariable).length)} متغیر</Badge>
        </>
      }
      actions={
        <DownloadButton
          label="دانلود کیت"
          filename={`rtl-motion-font-${font.id}.zip`}
          onDownload={downloadKit}
          variant="outline"
        />
      }
      onReset={() => {
        reset();
        soundEngine.playSnap();
      }}
      listWidth="252px"
      settingsWidth="308px"
      list={
        <StudioList
          title="همه فونت‌ها"
          subtitle={`${faNum(filtered.length)} از ${faNum(PERSIAN_FONT_CATALOG.length)}`}
          toolbar={<Badge tone="accent">{faNum(PERSIAN_FONT_CATALOG.length)}</Badge>}
          className="min-h-[360px] xl:min-h-0"
          footer="روی هر فونت دانلود فایل اصلی فعال است"
        >
          <div className="sticky top-0 z-10 -m-1.5 mb-1.5 space-y-2 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
            <SearchField value={q} onChange={setQ} placeholder="نام فونت…" />
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((c) => {
                const n = c.id === "all" ? PERSIAN_FONT_CATALOG.length : PERSIAN_FONT_CATALOG.filter((f) => f.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[9.5px] transition-colors",
                      cat === c.id
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                        : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                    )}
                  >
                    {c.label} <span className="font-mono opacity-60">{faNum(n)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {rows}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-[11px] text-zinc-600">فونتی پیدا نشد</p>
          )}
        </StudioList>
      }
      stage={stage}
      settings={settings}
    />
  );
};

export default FontStudio;
