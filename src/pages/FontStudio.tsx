import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  RotateCcw,
  Sparkles,
  Type,
} from "lucide-react";
import {
  PERSIAN_FONT_CATALOG,
  type PersianFontItem,
} from "../data/persianFontsCatalog";
import { usePersisted } from "../lib/store";
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
import { soundEngine } from "../engines/soundEngine";
import { faNum } from "../lib/format";

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
}

const DEFAULT: FontSettings = {
  fontId: "hasti",
  compareId: "iran-nastaliq",
  text: "هنر، در جزئیاتی نهفته است که دیده نمی‌شوند",
  size: 64,
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
  { label: "عدد", text: "۱۲۳۴۵۶۷۸۹۰ — ۱٬۲۵۰٬۰۰۰ تومان" },
  { label: "تمام‌نویسی", text: "ابجد هوز حطی کلمن سعفص قرشت ثخذ ضظغ" },
  { label: "دوجهته", text: "طراحی RTL با Tailwind v4 و Motion" },
];

const pad = (n: number) => n.toFixed(2).replace(/\.00$/, "");

export const FontStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<FontSettings>("studio-fonts", DEFAULT);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [replay, setReplay] = useState(0);
  const [exportTab, setExportTab] = useState<"css" | "tailwind" | "react" | "next">("css");

  const font = PERSIAN_FONT_CATALOG.find((f) => f.id === s.fontId) ?? PERSIAN_FONT_CATALOG[0];
  const compareFont = PERSIAN_FONT_CATALOG.find((f) => f.id === s.compareId) ?? PERSIAN_FONT_CATALOG[1];

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

  /* ---------------------------------------------------------------- exports */

  const cssSnippet = `.type-${font.id} {
  font-family: ${font.family};
  font-size: ${s.size}px;
  font-weight: ${s.weight};
  line-height: ${s.lineHeight};
  letter-spacing: ${s.tracking}px;
  word-spacing: ${s.wordSpacing}px;
  text-align: ${s.align === "start" ? "right" : s.align === "end" ? "left" : s.align};
  font-feature-settings: "ss01" ${s.ss01 ? 1 : 0}, "liga" ${s.ligatures ? 1 : 0},
    "calt" ${s.ligatures ? 1 : 0}, "kern" 1;
  ${s.tabular ? "font-variant-numeric: tabular-nums;" : ""}
}`;

  const tailwindSnippet = `<h1
  className="text-[${s.size}px] font-[${s.weight}] leading-[${pad(s.lineHeight)}]
    tracking-[${s.tracking}px] ${s.align === "center" ? "text-center" : s.align === "start" ? "text-start" : s.align === "end" ? "text-end" : "text-justify"}"
  style={{ fontFamily: ${JSON.stringify(font.family)} }}${s.tabular ? '\n  /* tabular-nums */' : ""}
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
        fontFamily: ${JSON.stringify(font.family)},
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

// مسیر فایل واقعی در مخزن: public/fonts/<category>/${font.nameEn}
export const ${font.id.replace(/[^\w]/g, "_")} = localFont({
  src: "./fonts/${font.nameEn}.woff2",
  weight: "${font.isVariable ? "100 900" : String(s.weight)}",
  style: "normal",
  display: "swap",
  variable: "--font-${font.id.replace(/[^\w]/g, "-")}",
  preload: true,
  fallback: ["Vazirmatn", "sans-serif"],
});`;

  const exportCode = {
    css: cssSnippet,
    tailwind: tailwindSnippet,
    react: reactSnippet,
    next: nextSnippet,
  }[exportTab];

  const selectFont = useCallback(
    (id: string) => {
      soundEngine.playTick(1);
      set({ fontId: id });
    },
    [set]
  );

  const fontRows = useMemo(
    () =>
      filtered.map((f) => (
        <button
          key={f.id}
          data-font-id={f.id}
          onClick={() => selectFont(f.id)}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-start transition-colors",
            s.fontId === f.id
              ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
              : "border-transparent hover:bg-white/[0.04]"
          )}
        >
          <span className="min-w-0">
            <span
              className="block truncate text-[15px] leading-tight text-zinc-200"
              style={{ fontFamily: f.family }}
            >
              {f.nameFa}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[9.5px] text-zinc-600" dir="ltr">
              {f.nameEn}
            </span>
          </span>
          {f.isVariable && <Badge tone="accent">VF</Badge>}
        </button>
      )),
    [filtered, s.fontId, selectFont]
  );

  /* ---------------------------------------------------------------- render */

  return (
    <div className="space-y-5">
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Type className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">FONT STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو تایپوگرافی فارسی
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            هر {faNum(PERSIAN_FONT_CATALOG.length)} خانواده فونت نستعلیق، هنری، مدرن و کد — با کنترل کامل وزن، رده‌بندی،
            فاصله‌گذاری و انیمیشن. هر تغییری که می‌دهید روی پیش‌نمایش و کد خروجی
            به‌صورت هم‌زمان اعمال می‌شود.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent">{faNum(PERSIAN_FONT_CATALOG.length)} خانواده</Badge>
          <Badge>{faNum(PERSIAN_FONT_CATALOG.filter((f) => f.isVariable).length)} متغیر</Badge>
          <button
            onClick={() => {
              reset();
              soundEngine.playSnap();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            بازنشانی
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ------------------------------------------------------- stage */}
        <div className="space-y-4">
          <Panel padded={false} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11.5px] font-medium text-zinc-300">{font.nameFa}</span>
                <span className="font-mono text-[10px] text-zinc-600" dir="ltr">
                  {font.nameEn}
                </span>
                {font.isVariable && <Badge tone="accent">Variable</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                <Segmented
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
                <button
                  onClick={() => {
                    setReplay((r) => r + 1);
                    soundEngine.playSpring();
                  }}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10.5px] text-zinc-400 hover:text-white"
                >
                  <Sparkles className="h-3 w-3" />
                  پخش حرکت
                </button>
              </div>
            </div>

            <div
              className={cn(
                "relative flex min-h-[290px] items-center justify-center overflow-hidden p-6 sm:min-h-[340px] sm:p-10",
                backdropClass
              )}
            >
              {s.backdrop === "night" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background:
                      "radial-gradient(60% 80% at 50% 0%, rgba(var(--accent-glow),0.14), transparent 70%)",
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
                    data-testid="font-preview"
                    style={stageStyle}
                    className={cn("whitespace-pre-wrap break-words", colorClass)}
                  >
                    {s.text}
                  </p>
                )}

                {s.compare && (
                  <div className="mt-8 border-t border-white/10 pt-6">
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
                {s.text.trim().split(/\s+/).filter(Boolean).length} واژه ·{" "}
                {s.text.replace(/\s/g, "").length} حرف
              </span>
            </div>
          </Panel>

          {/* specimen */}
          <Panel title="نمونه کامل حروف" subtitle="ابجد، اعداد فارسی و لاتین در همان فونت انتخابی">
            <div className="space-y-3">
              <div
                style={{ fontFamily: font.family, fontWeight: s.weight }}
                className="text-[clamp(20px,3.4vw,34px)] leading-[2] text-zinc-200"
              >
                ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی
              </div>
              <div
                style={{ fontFamily: font.family }}
                className="text-[19px] leading-[2] text-zinc-400"
                dir="rtl"
              >
                ۰۱۲۳۴۵۶۷۸۹ — 0123456789 — «گفتا که…» (۱۲٪)
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
                {["۱۲۳", "۴۵۶", "۷۸۹", "۰", "٬", "٫", "،", "؛", "؟"].map((g) => (
                  <div
                    key={g}
                    className="flex h-12 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[18px] text-zinc-300"
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
                value={exportTab}
                onChange={setExportTab}
                options={[
                  { value: "css", label: "CSS" },
                  { value: "tailwind", label: "Tailwind" },
                  { value: "react", label: "React" },
                  { value: "next", label: "next/font" },
                ]}
              />
            }
          >
            <CodeBlock code={exportCode} language={exportTab} filename={`${font.id}.${exportTab === "css" ? "css" : "tsx"}`} maxLines={22} />
          </Panel>
        </div>

        {/* ----------------------------------------------------- controls */}
        <aside className="space-y-4">
          <Panel
            title="انتخاب فونت"
            subtitle={`${faNum(filtered.length)} از ${faNum(PERSIAN_FONT_CATALOG.length)}`}
          >
            <div className="space-y-2.5">
              <SearchField value={q} onChange={setQ} placeholder="نام فونت…" />
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((c) => {
                  const n =
                    c.id === "all"
                      ? PERSIAN_FONT_CATALOG.length
                      : PERSIAN_FONT_CATALOG.filter((f) => f.category === c.id).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCat(c.id)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[10.5px] transition-colors",
                        cat === c.id
                          ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                          : "border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      {c.label} <span className="font-mono opacity-60">{faNum(n)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="max-h-[260px] space-y-1 overflow-y-auto pe-1">
                {fontRows}
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-zinc-600">فونتی پیدا نشد</p>
                )}
              </div>

              <Toggle
                label="حالت مقایسه"
                checked={s.compare}
                onChange={(v) => set({ compare: v })}
                hint="نمایش هم‌زمان با فونت دوم"
              />
              {s.compare && (
                <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-lg border border-white/[0.06] p-1">
                  {PERSIAN_FONT_CATALOG.filter((f) => f.id !== s.fontId).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => set({ compareId: f.id })}
                      className={cn(
                        "block w-full truncate rounded px-2 py-1 text-start text-[13px]",
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

          <Panel title="متن و چیدمان">
            <div className="space-y-3">
              <textarea
                value={s.text}
                onChange={(e) => set({ text: e.target.value })}
                rows={3}
                dir="rtl"
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 text-[12px] leading-relaxed text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
                placeholder="متن نمونه…"
              />
              <div className="flex flex-wrap gap-1">
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => set({ text: sample.text })}
                    className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[10px] text-zinc-400 hover:text-zinc-100"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

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
                    aria-label={v}
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
            </div>
          </Panel>

          <Panel title="تنظیمات تایپوگرافی">
            <div className="space-y-3.5">
              <Slider
                label="اندازه قلم"
                value={s.size}
                min={14}
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
                hint={font.isVariable ? "این فونت محور وزن متغیر دارد" : "فونت ثابت — وزن نزدیک‌ترین جایگزین می‌شود"}
              />
              <Slider
                label="ارتفاع خط"
                value={s.lineHeight}
                min={1}
                max={3}
                step={0.05}
                onChange={(v) => set({ lineHeight: v })}
                format={(v) => v.toFixed(2)}
              />
              <Slider
                label="فاصله حروف"
                value={s.tracking}
                min={-2}
                max={8}
                step={0.1}
                unit="px"
                onChange={(v) => set({ tracking: v })}
                hint="برای فارسی صفر توصیه می‌شود"
                format={(v) => v.toFixed(1)}
              />
              <Slider
                label="فاصله واژه‌ها"
                value={s.wordSpacing}
                min={-2}
                max={14}
                step={0.5}
                unit="px"
                onChange={(v) => set({ wordSpacing: v })}
                format={(v) => v.toFixed(1)}
              />
              <div className="space-y-2 border-t border-white/[0.06] pt-3">
                <Toggle label="لیگاتورها (liga/calt)" checked={s.ligatures} onChange={(v) => set({ ligatures: v })} />
                <Toggle label="جایگزین سبک ss01" checked={s.ss01} onChange={(v) => set({ ss01: v })} hint="اعداد و فرم‌های فارسی" />
                <Toggle label="ارقام جدولی" checked={s.tabular} onChange={(v) => set({ tabular: v })} />
              </div>
            </div>
          </Panel>

          <Panel title="حرکت جنبشی">
            <div className="space-y-3">
              <Toggle label="فعال‌سازی انیمیشن واژه‌ها" checked={s.kinetic} onChange={(v) => set({ kinetic: v })} />
              <Slider label="سرعت فنر" value={s.speed} min={0.3} max={2.5} step={0.1} onChange={(v) => set({ speed: v })} format={(v) => `${v.toFixed(1)}×`} />
              <Slider label="تأخیر پله‌ای" value={s.stagger} min={0} max={0.3} step={0.01} unit="s" onChange={(v) => set({ stagger: v })} format={(v) => v.toFixed(2)} />
              <CopyButton
                text={reactSnippet}
                label="کپی کامپوننت جنبشی"
                className="w-full justify-center"
              />
            </div>
          </Panel>

          <Panel tone="inset" title="درباره این فونت">
            <p className="text-[11.5px] leading-relaxed text-zinc-400">{font.descriptionFa}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge>{font.category}</Badge>
              <Badge>ارتفاع خط {font.recommendedLineHeight ?? 1.7}</Badge>
              {font.hasFarsiDigits && <Badge tone="success">ارقام فارسی</Badge>}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default FontStudio;
