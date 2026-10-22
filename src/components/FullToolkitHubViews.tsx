import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Type,
  Search,
  Copy,
  Check,
  Sparkles,
  Volume2,
  Cpu,
  Palette,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Wand2,
  Layers,
  Play,
  FileCode,
  FolderGit2,
} from "lucide-react";
import {
  PERSIAN_FONT_CATALOG,
  PersianFontItem,
} from "../data/persianFontsCatalog";
import {
  ALL_SKILLS_MANIFEST,
  ALL_BRAND_DESIGNS_MANIFEST,
  ALL_SOUND_RECIPES_MANIFEST,
  ALL_ENGINE_FOLDERS_MANIFEST,
  ALL_RTL_ENGINE_FILES,
  ALL_QA_FILES,
  ALL_AI_TRAINING_FILES,
  SkillManifestItem,
  BrandDesignManifestItem,
  SoundRecipeItem,
} from "../data/toolkitManifest";
import {
  IRANIAN_BANKS,
  toPersianDigits,
  splitPersianWordsSafe,
  validateIranianNationalCode,
  generateShebaFromCard,
  numberToPersianWords,
  cleanupPersianText,
} from "../engines/persianEngines";
import { soundEngine } from "../engines/soundEngine";
import { InteractiveCobeGlobe } from "./InteractiveShaders";

/* ============================================================================
   1. FULL 39 PERSIAN FONTS & KINETIC TYPOGRAPHY LAB
   ============================================================================ */
export const FullPersianFontsLabView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customText, setCustomText] = useState<string>(
    "هنر مهندسی موشن و تایپوگرافی اصیل ایرانی در ۶۰ فریم • ۱۲۳۴۵۶۷۸۹۰"
  );
  const [fontWeight, setFontWeight] = useState<number>(700);
  const [fontSize, setFontSize] = useState<number>(24);
  const [animateWords, setAnimateWords] = useState<boolean>(true);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "همه ۳۹ خانواده فونت", count: PERSIAN_FONT_CATALOG.length },
    {
      id: "nastaliq-calligraphy",
      label: "نستعلیق و خوشنویسی سنتی",
      count: PERSIAN_FONT_CATALOG.filter(
        (f) => f.category === "nastaliq-calligraphy"
      ).length,
    },
    {
      id: "special-display",
      label: "فونت‌های خاص، هنری و تیتر (هستی، کهربا، مربع...)",
      count: PERSIAN_FONT_CATALOG.filter((f) => f.category === "special-display")
        .length,
    },
    {
      id: "modern-ui",
      label: "مدرن رابط کاربری و متغیر (یکان‌بخ، ایران‌سنس X، دانا...)",
      count: PERSIAN_FONT_CATALOG.filter((f) => f.category === "modern-ui")
        .length,
    },
    {
      id: "code",
      label: "فونت کدنویسی (Monospace)",
      count: PERSIAN_FONT_CATALOG.filter((f) => f.category === "code").length,
    },
  ];

  const filteredFonts = PERSIAN_FONT_CATALOG.filter((f) => {
    const matchCat =
      selectedCategory === "all" || f.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      f.nameFa.includes(searchQuery) ||
      f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.descriptionFa.includes(searchQuery);
    return matchCat && matchSearch;
  });

  const handleCopyFontCss = (font: PersianFontItem) => {
    const snippet = `/* ${font.nameFa} (${font.nameEn}) */
.font-${font.id} {
  font-family: ${font.family};
  line-height: ${font.recommendedLineHeight ?? 1.7};
  letter-spacing: 0 !important;
  font-feature-settings: "ss01" 1, "kern" 1, "liga" 1;
}`;
    navigator.clipboard.writeText(snippet).catch(() => {});
    soundEngine.playSuccess();
    setCopiedId(font.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const words = splitPersianWordsSafe(customText);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Control Header */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Type className="h-4 w-4" />
              <span>
                آزمایشگاه کامل ۳۹ خانواده فونت فارسی (`toolkit/02-persian-fonts/`)
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              تست زنده تمام فونت‌های نستعلیق، هستی، خوشنویسی، متغیر و رابط کاربری
            </h2>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام فونت (هستی، نستعلیق، کهربا، یکان‌بخ...)"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2 ps-10 pe-4 text-xs text-white placeholder-zinc-500 focus:border-amber-400/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Text & Variable Axis Controls */}
        <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label className="mb-1.5 block text-xs font-bold text-zinc-300">
              متن آزمایشی زنده (روی همه ۳۹ فونت هم‌زمان اعمال می‌شود):
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-400">وزن فونت (Weight)</span>
              <span className="font-mono text-amber-300">
                {toPersianDigits(fontWeight)}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={900}
              step={100}
              value={fontWeight}
              onChange={(e) => {
                soundEngine.playTick(Number(e.target.value) / 500);
                setFontWeight(Number(e.target.value));
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-400">اندازه فونت</span>
              <span className="font-mono text-cyan-300">
                {toPersianDigits(fontSize)}px
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={42}
              step={2}
              value={fontSize}
              onChange={(e) => {
                soundEngine.playTick(Number(e.target.value) / 24);
                setFontSize(Number(e.target.value));
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-end gap-2 lg:col-span-2">
            <button
              onClick={() => {
                soundEngine.playSpring();
                setAnimateWords(!animateWords);
                setReplayKey((k) => k + 1);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>موج فنری کلمات</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "border-amber-400/60 bg-amber-500/20 text-amber-200 font-bold"
                  : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{cat.label}</span>
              <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[10px]">
                {toPersianDigits(cat.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* All 39 Fonts Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFonts.map((font) => (
          <div
            key={font.id}
            className="flex flex-col justify-between rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 transition hover:border-amber-500/40"
          >
            <div>
              {/* Top Meta */}
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {font.nameFa}
                    </h3>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {font.nameEn}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {font.descriptionFa}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {font.isVariable && (
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                      Variable VF
                    </span>
                  )}
                  {font.hasFarsiDigits && (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                      ارقام فارسی
                    </span>
                  )}
                </div>
              </div>

              {/* Live Rendered Persian Specimen */}
              <div
                onClick={() => {
                  soundEngine.playSpring();
                  setReplayKey((k) => k + 1);
                }}
                style={{
                  fontFamily: font.family,
                  fontWeight,
                  fontSize: `${fontSize}px`,
                  lineHeight: font.recommendedLineHeight ?? 1.7,
                  fontVariationSettings: `"wght" ${fontWeight}`,
                }}
                className="my-4 flex min-h-[110px] cursor-pointer flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border border-white/5 bg-zinc-950/90 px-4 py-4 text-center text-zinc-100"
              >
                {animateWords
                  ? words.map((w, idx) => (
                      <motion.span
                        key={`${replayKey}-${idx}`}
                        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 22,
                          delay: idx * 0.04,
                        }}
                        whileHover={{ scale: 1.1, color: "#F59E0B" }}
                        className="inline-block"
                      >
                        {w}
                      </motion.span>
                    ))
                  : customText}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
              <span dir="ltr" className="font-mono text-[10px] text-zinc-500">
                font-family: {font.family.split(",")[0]}
              </span>
              <button
                onClick={() => handleCopyFontCss(font)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-zinc-200 hover:border-amber-400/50 hover:text-amber-200"
              >
                {copiedId === font.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span>{copiedId === font.id ? "کپی شد!" : "کپی استایل CSS"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============================================================================
   2. FULL 179 SKILLS & 84 BRAND DESIGN SYSTEMS VAULT
   ============================================================================ */
export const FullSkillsAndBrandsVaultView: React.FC = () => {
  const [vaultMode, setVaultMode] = useState<"skills" | "brands">("skills");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSkill, setActiveSkill] = useState<SkillManifestItem>(
    ALL_SKILLS_MANIFEST[0]
  );
  const [activeBrand, setActiveBrand] = useState<BrandDesignManifestItem>(
    ALL_BRAND_DESIGNS_MANIFEST[0]
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const skillFolders = [
    { id: "all", label: "همه ۱۷۹ اسکیل تخصصی" },
    { id: "01-motion-and-awwwards", label: "۱. موشن و Awwwards" },
    { id: "02-3d-webgl-and-shaders", label: "۲. سه‌بعدی، WebGL و شیدر" },
    { id: "03-art-direction-and-taste", label: "۳. کارگردانی هنری و Taste" },
    { id: "04-ui-systems-and-shadcn", label: "۴. سیستم‌های UI و Shadcn" },
    { id: "05-brand-design-md-vault", label: "۵. معماری سیستم برندها" },
    { id: "06-persian-writing-and-rtl", label: "۶. نگارش فارسی و RTL" },
  ];

  const filteredSkills = ALL_SKILLS_MANIFEST.filter((s) => {
    const matchFolder =
      selectedFolder === "all" || s.categoryFolder === selectedFolder;
    const matchQuery =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchQuery;
  });

  const filteredBrands = ALL_BRAND_DESIGNS_MANIFEST.filter((b) => {
    return (
      !searchQuery.trim() ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    soundEngine.playSuccess();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Mode Switcher */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <BookOpen className="h-4 w-4" />
              <span>
                خزانه کامل استانداردها و سیستم‌های طراحی (`toolkit/01-skills-and-standards/`)
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              مرورگر زنده تمام ۱۷۹ فایل `SKILL.md` و ۸۴ فایل `DESIGN.md` برندهای جهان
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playSnap();
                setVaultMode("skills");
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                vaultMode === "skills"
                  ? "bg-indigo-600 text-white shadow"
                  : "border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              ۱۷۹ اسکیل مهندسی (SKILL.md)
            </button>
            <button
              onClick={() => {
                soundEngine.playSnap();
                setVaultMode("brands");
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                vaultMode === "brands"
                  ? "bg-cyan-600 text-white shadow"
                  : "border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              ۸۴ سیستم طراحی برندها (DESIGN.md)
            </button>
          </div>
        </div>

        {/* Search + Folder Filters */}
        <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 lg:flex-row lg:items-center lg:justify-between">
          {vaultMode === "skills" ? (
            <div className="flex flex-wrap gap-1.5">
              {skillFolders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedFolder(f.id);
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                    selectedFolder === f.id
                      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200 font-bold"
                      : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-400">
              نمایش هم‌زمان پالت رنگ و قوانین طراحی ۸۴ برند جهانی (Linear, Vercel, Apple, Cursor, Claude, Stripe, Ferrari...)
            </div>
          )}

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                vaultMode === "skills"
                  ? "جستجو در ۱۷۹ اسکیل (threejs, gsap, taste, shadcn...)"
                  : "جستجو در ۸۴ برند (linear, vercel, apple, claude, stripe...)"
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2 ps-10 pe-4 text-xs text-white placeholder-zinc-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Vault Content Area */}
      {vaultMode === "skills" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Inspector Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-indigo-500/30 bg-[#121215] p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] text-indigo-300">
                    {activeSkill.categoryFolder}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-white">
                    {activeSkill.title}
                  </h3>
                  <p
                    dir="ltr"
                    className="mt-0.5 font-mono text-[10px] text-cyan-400 break-all"
                  >
                    {activeSkill.path}
                  </p>
                </div>
                <button
                  onClick={() => copyText(activeSkill.id, activeSkill.excerpt)}
                  className="flex items-center gap-1 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300"
                >
                  {copiedId === activeSkill.id ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {copiedId === activeSkill.id ? "کپی شد" : "کپی SKILL.md"}
                  </span>
                </button>
              </div>

              <pre
                dir="ltr"
                className="max-h-[420px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap"
              >
                <code>{activeSkill.excerpt}</code>
              </pre>
            </div>
          </div>

          {/* All 179 Skills List (7 cols) */}
          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
              <span>
                تعداد اسکیل‌های یافت‌شده:{" "}
                <strong className="text-white">
                  {toPersianDigits(filteredSkills.length)}
                </strong>{" "}
                از ۱۷۹
              </span>
              <span>برای مشاهده محتوای هر اسکیل روی آن کلیک کنید</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[680px] overflow-y-auto pe-1">
              {filteredSkills.map((skill) => {
                const isSelected = activeSkill.id === skill.id;
                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      soundEngine.playSnap();
                      setActiveSkill(skill);
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500/15"
                        : "border-[#1F1F23] bg-[#121215] hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-cyan-300 truncate max-w-[180px]">
                        {skill.slug}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        SKILL.md
                      </span>
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-white truncate">
                      {skill.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                      {skill.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 84 Brand DESIGN.md Systems Grid + Inspector */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-cyan-500/30 bg-[#121215] p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300 uppercase">
                    {activeBrand.name}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-white">
                    {activeBrand.title}
                  </h3>
                  <p
                    dir="ltr"
                    className="mt-0.5 font-mono text-[10px] text-zinc-400 break-all"
                  >
                    {activeBrand.path}
                  </p>
                </div>
                <button
                  onClick={() => copyText(activeBrand.id, activeBrand.excerpt)}
                  className="flex items-center gap-1 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300"
                >
                  {copiedId === activeBrand.id ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {copiedId === activeBrand.id ? "کپی شد" : "کپی DESIGN.md"}
                  </span>
                </button>
              </div>

              {/* Brand Extracted Color Swatches */}
              <div className="flex flex-wrap items-center gap-2">
                {activeBrand.colors.map((hex) => (
                  <div
                    key={hex}
                    onClick={() => copyText(hex, hex)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-[11px] font-mono text-zinc-200 hover:border-white/30"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/20"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{hex}</span>
                  </div>
                ))}
              </div>

              <pre
                dir="ltr"
                className="max-h-[390px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap"
              >
                <code>{activeBrand.excerpt}</code>
              </pre>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
              <span>
                سیستم‌های طراحی برند:{" "}
                <strong className="text-white">
                  {toPersianDigits(filteredBrands.length)}
                </strong>{" "}
                از ۸۴ برند جهانی
              </span>
              <span>کلیک روی هر برند = نمایش توکن‌ها و DESIGN.md</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[680px] overflow-y-auto pe-1">
              {filteredBrands.map((brand) => {
                const isSelected = activeBrand.id === brand.id;
                return (
                  <div
                    key={brand.id}
                    onClick={() => {
                      soundEngine.playSnap();
                      setActiveBrand(brand);
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/15"
                        : "border-[#1F1F23] bg-[#121215] hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase text-white">
                        {brand.name}
                      </span>
                      <Palette className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      {brand.colors.slice(0, 5).map((c, i) => (
                        <span
                          key={i}
                          className="h-4 flex-1 rounded-sm border border-white/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================================
   3. FULL 7 CORE ENGINES, 200+ SOUND LAB, IRANIAN FINTECH & SHADERS WORKBENCH
   ============================================================================ */
export const FullCoreEnginesWorkbenchView: React.FC = () => {
  const [activeEngineTab, setActiveEngineTab] = useState<
    "sound200" | "fintech" | "shaders" | "files"
  >("sound200");

  // Sound Lab State
  const [soundSearch, setSoundSearch] = useState("");
  const [selectedSound, setSelectedSound] = useState<SoundRecipeItem>(
    ALL_SOUND_RECIPES_MANIFEST[0]
  );
  const [pitchMult, setPitchMult] = useState(1);

  // Iranian Fintech & Localization State
  const [selectedBankId, setSelectedBankId] = useState(IRANIAN_BANKS[0].id);
  const [cardNum, setCardNum] = useState("6219861940285519");
  const [nationalCode, setNationalCode] = useState("0013542819");
  const [tomanAmount, setTomanAmount] = useState("148500000");
  const [dirtyPersianText, setDirtyPersianText] = useState(
    "اين کامپوننت ها در حالت راست به چپ با سرعت 60 فريم اجرا مي شوند و حروف فارسي نمي شکند."
  );

  // Shader Studio State
  const [shaderMode, setShaderMode] = useState<
    "globe" | "matrix" | "aurora" | "particles"
  >("matrix");

  const filteredSounds = ALL_SOUND_RECIPES_MANIFEST.filter(
    (s) =>
      !soundSearch.trim() ||
      s.id.toLowerCase().includes(soundSearch.toLowerCase())
  );

  const nationalCodeRes = validateIranianNationalCode(nationalCode);
  const shebaPreview = generateShebaFromCard(cardNum);
  const persianWordsAmount = numberToPersianWords(tomanAmount);
  const cleanedTextRes = cleanupPersianText(dirtyPersianText);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Engine Switcher */}
      <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Cpu className="h-4 w-4" />
              <span>
                آزمایشگاه کامل موتورهای هسته‌ای (`07-core-engines/` + `03-persian-rtl-engine/`)
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              ۲۰۰ سینت‌سایزر صدای Web Audio، فین‌تک ۱۸ بانک ایران، شیدرهای WebGL و لینتر فارسی
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "sound200", label: "۲۰۰ موتور صدای تعاملی", icon: Volume2 },
              {
                id: "fintech",
                label: "۱۸ بانک ایران، شبا، کدملی و حروف",
                icon: CreditCard,
              },
              { id: "shaders", label: "استودیوی شیدر و WebGL", icon: Layers },
              { id: "files", label: "مرورگر فایل‌های ۷ موتور", icon: FolderGit2 },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setActiveEngineTab(
                      t.id as "sound200" | "fintech" | "shaders" | "files"
                    );
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeEngineTab === t.id
                      ? "bg-indigo-600 text-white shadow"
                      : "border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: 200+ Procedural Web Audio Sound Synthesizer Lab */}
      {activeEngineTab === "sound200" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Active Sound Synthesizer Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-[#121215] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[11px] text-cyan-400 font-bold">
                    سینت‌سایزر فعال Web Audio API
                  </span>
                  <h3 className="font-mono text-lg font-bold text-white uppercase">
                    {selectedSound.id}.ts
                  </h3>
                </div>
                <button
                  onClick={() => soundEngine.playRecipe(selectedSound, pitchMult)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:opacity-95"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>پخش صدا (Synthesize)</span>
                </button>
              </div>

              {/* Acoustic Parameters */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5">
                  <div className="text-[10px] text-zinc-500">مدت‌زمان</div>
                  <div className="mt-0.5 font-mono font-bold text-cyan-300">
                    {selectedSound.duration}s
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5">
                  <div className="text-[10px] text-zinc-500">فرکانس پایه</div>
                  <div className="mt-0.5 font-mono font-bold text-indigo-300">
                    {Math.round(selectedSound.freqFrom)}Hz →{" "}
                    {Math.round(selectedSound.freqTo)}Hz
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5">
                  <div className="text-[10px] text-zinc-500">فیلتر Lowpass</div>
                  <div className="mt-0.5 font-mono font-bold text-emerald-300">
                    {selectedSound.lowpass}Hz
                  </div>
                </div>
              </div>

              {/* Pitch Multiplier Slider */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">ضریب زیر و بمی (Pitch Shift)</span>
                  <span className="font-mono text-cyan-300">{pitchMult}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={pitchMult}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPitchMult(v);
                    soundEngine.playRecipe(selectedSound, v);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Recipe Source Code */}
              <pre
                dir="ltr"
                className="max-h-[280px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-3.5 font-mono text-[11px] leading-relaxed text-zinc-200"
              >
                <code>{selectedSound.snippet}</code>
              </pre>
            </div>
          </div>

          {/* All 200 Sound Pad Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-zinc-400">
                تمامی{" "}
                <strong className="text-white">
                  {toPersianDigits(filteredSounds.length)}
                </strong>{" "}
                موتور صدا در پوشه{" "}
                <code className="text-cyan-300">03-procedural-sound-engine/</code>{" "}
                (روی هر دکمه کلیک کنید تا سنتز شود):
              </span>
              <input
                type="text"
                value={soundSearch}
                onChange={(e) => setSoundSearch(e.target.value)}
                placeholder="جستجوی صدا (thock, spring, aurora, chime, snap...)"
                className="w-full sm:w-64 rounded-xl border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5 max-h-[540px] overflow-y-auto pe-1">
              {filteredSounds.map((snd) => {
                const isSelected = selectedSound.id === snd.id;
                return (
                  <button
                    key={snd.id}
                    onClick={() => {
                      setSelectedSound(snd);
                      soundEngine.playRecipe(snd, pitchMult);
                    }}
                    className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-start transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/20 text-white shadow"
                        : "border-[#1F1F23] bg-[#121215] text-zinc-300 hover:border-cyan-500/40 hover:text-white"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-xs font-bold truncate">
                        {snd.id}
                      </span>
                      <Volume2 className="h-3 w-3 text-cyan-400 shrink-0" />
                    </div>
                    <div className="mt-1.5 flex w-full items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{snd.duration}s</span>
                      <span>{Math.round(snd.freqFrom)}Hz</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: All 18 Iranian Banks + Sheba + National ID + Number-to-Words + Persian Linter */}
      {activeEngineTab === "fintech" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 18 Iranian Banks Matrix & Sheba Generator (6 cols) */}
          <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 space-y-4 lg:col-span-6">
            <h3 className="text-base font-bold text-white">
              ۱. پالت هولوگرافیک ۱۸ بانک ایران + محاسبه‌گر شبا (ISO-7064)
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {IRANIAN_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedBankId(bank.id);
                    setCardNum(bank.bins[0].padEnd(16, "4"));
                  }}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition ${
                    selectedBankId === bank.id
                      ? "border-cyan-400 bg-cyan-500/15 text-white font-bold"
                      : "border-white/10 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="truncate">{bank.nameFa}</span>
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: bank.accentHex }}
                  />
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>شماره کارت ۱۶ رقمی شتاب:</span>
                <span className="font-mono text-cyan-300">{cardNum}</span>
              </div>
              <input
                type="text"
                dir="ltr"
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value.slice(0, 16))}
                className="w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
              />
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400">شماره شبا محاسبه‌شده (Mod-97):</span>
                <span
                  dir="ltr"
                  className="rounded bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300"
                >
                  {shebaPreview}
                </span>
              </div>
            </div>
          </div>

          {/* National ID + Number to Words + Persian ZWNJ Cleanup (6 cols) */}
          <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 space-y-4 lg:col-span-6">
            {/* Number to Persian Words */}
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2">
              <label className="block text-xs font-bold text-white">
                ۲. موتور تبدیل عدد به حروف فارسی و تومان (`core-persianlabs`):
              </label>
              <input
                type="text"
                dir="ltr"
                value={tomanAmount}
                onChange={(e) => setTomanAmount(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 font-mono text-sm text-cyan-300"
              />
              <p className="text-xs font-bold text-emerald-300">
                معادل حروفی: {persianWordsAmount}
              </p>
            </div>

            {/* National Code Validator */}
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">
                  ۳. اعتبارسنجی کد ملی ایران (الگوریتم Modulo-11):
                </label>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    nationalCodeRes.valid
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {nationalCodeRes.valid
                    ? `معتبر • ${nationalCodeRes.cityFa}`
                    : "کد ملی نامعتبر"}
                </span>
              </div>
              <input
                type="text"
                dir="ltr"
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value.slice(0, 10))}
                className="w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 font-mono text-sm text-white"
              />
            </div>

            {/* Live Persian ZWNJ & Yeh/Kaf Cleanup (fa_lint.py port) */}
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  ۴. موتور اصلاح خودکار نیم‌فاصله و ی/ک فارسی (`fa_lint.py`):
                </span>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {toPersianDigits(cleanedTextRes.fixesCount)} اصلاح خودکار
                </span>
              </div>
              <textarea
                rows={2}
                value={dirtyPersianText}
                onChange={(e) => setDirtyPersianText(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-zinc-900 p-2 text-xs text-zinc-300"
              />
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                <strong className="text-emerald-300">خروجی استاندارد: </strong>
                {cleanedTextRes.cleaned}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Interactive Multi-Shader WebGL/Canvas Studio */}
      {activeEngineTab === "shaders" && (
        <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                استودیوی زنده شیدرهای ۶۰ فریم (`02-webgl-ogl-cobe-engine` & `react-bits`)
              </h3>
              <p className="text-xs text-zinc-400">
                شیدرهای تعاملی بدون افت فریم؛ ماوس را روی بوم حرکت دهید یا حالت شیدر را تغییر دهید.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "matrix", label: "باران ماتریکس حروف فارسی" },
                { id: "particles", label: "میدان ذرات مغناطیسی (Gravity Stars)" },
                { id: "aurora", label: "شفق قطبی و میدان پلاسما (Aurora)" },
                { id: "globe", label: "کره سه‌بعدی نودهای ایران (Cobe 3D)" },
              ].map((sh) => (
                <button
                  key={sh.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setShaderMode(
                      sh.id as "globe" | "matrix" | "aurora" | "particles"
                    );
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    shaderMode === sh.id
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {sh.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-4">
            {shaderMode === "globe" && (
              <InteractiveCobeGlobe accentHex="#06B6D4" size={300} />
            )}
            {shaderMode === "matrix" && <PersianMatrixShaderCanvas />}
            {shaderMode === "particles" && <GravityStarsShaderCanvas />}
            {shaderMode === "aurora" && <AuroraPlasmaShaderCanvas />}
          </div>
        </div>
      )}

      {/* TAB 4: Full File Tree of All 7 Core Engine Folders */}
      {activeEngineTab === "files" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ALL_ENGINE_FOLDERS_MANIFEST.map((folder) => (
            <div
              key={folder.id}
              className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-4 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span
                  dir="ltr"
                  className="font-mono text-xs font-bold text-cyan-400"
                >
                  07-core-engines/{folder.id}
                </span>
                <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                  {toPersianDigits(folder.count)} فایل
                </span>
              </div>
              <div
                dir="ltr"
                className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400"
              >
                {folder.files.map((f, i) => (
                  <div key={i} className="truncate hover:text-white">
                    • {f}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span
                dir="ltr"
                className="font-mono text-xs font-bold text-emerald-400"
              >
                03-persian-rtl-engine/
              </span>
              <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                {toPersianDigits(ALL_RTL_ENGINE_FILES.length)} فایل
              </span>
            </div>
            <div
              dir="ltr"
              className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400"
            >
              {ALL_RTL_ENGINE_FILES.map((f, i) => (
                <div key={i} className="truncate hover:text-white">
                  • {f}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1F1F23] bg-[#121215] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span
                dir="ltr"
                className="font-mono text-xs font-bold text-amber-400"
              >
                05-qa & 06-ai-training/
              </span>
              <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                {toPersianDigits(ALL_QA_FILES.length + ALL_AI_TRAINING_FILES.length)}{" "}
                فایل
              </span>
            </div>
            <div
              dir="ltr"
              className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400"
            >
              {[...ALL_QA_FILES, ...ALL_AI_TRAINING_FILES].map((f, i) => (
                <div key={i} className="truncate hover:text-white">
                  • {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================================
   Interactive Canvas Shaders for the Shader Studio
   ============================================================================ */
const PersianMatrixShaderCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 760;
    const h = 320;
    canvas.width = w;
    canvas.height = h;

    const chars = "آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹";
    const fontSize = 16;
    const cols = Math.floor(w / fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * -20);

    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(9, 9, 11, 0.12)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#06B6D4";
      ctx.font = `${fontSize}px Vazirmatn, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i] += 0.65;
      }
    }, 33);

    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[760px] h-[320px] rounded-xl"
    />
  );
};

const GravityStarsShaderCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 380, y: 160 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 760;
    const h = 320;
    canvas.width = w;
    canvas.height = h;

    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: 1.5 + Math.random() * 2,
    }));

    let animId = 0;
    const render = () => {
      ctx.fillStyle = "rgba(9, 9, 11, 0.25)";
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 5) {
          p.vx += (dx / dist) * 0.08;
          p.vy += (dy / dist) * 0.08;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;

        ctx.fillStyle = dist < 140 ? "#38BDF8" : "#818CF8";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (dist < 110) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 110) * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current = {
          x: ((e.clientX - rect.left) / rect.width) * 760,
          y: ((e.clientY - rect.top) / rect.height) * 320,
        };
      }}
      className="w-full max-w-[760px] h-[320px] rounded-xl cursor-crosshair"
    />
  );
};

const AuroraPlasmaShaderCanvas: React.FC = () => {
  return (
    <div className="relative flex h-[320px] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-xl bg-zinc-950">
      <div className="absolute -inset-20 animate-pulse bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.35),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.4),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.25),transparent_50%)] blur-2xl" />
      <div className="relative z-10 text-center">
        <p className="font-hasti text-3xl font-bold text-white">
          شفق قطبی و میدان پلاسمای ۶۰ فریم
        </p>
        <p className="mt-2 text-xs text-zinc-300">
          شیدر ترکیبی از مجموعه React Bits Backgrounds (`Aurora.tsx` + `Plasma.tsx`)
        </p>
      </div>
    </div>
  );
};
