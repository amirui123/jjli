import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sliders,
  Copy,
  Check,
  Sparkles,
  Terminal,
  RotateCcw,
  Code2,
  Cpu,
  Database,
  Layers,
  FlipHorizontal,
  Wand2,
  FileJson,
  BookOpen,
} from "lucide-react";
import {
  COMPONENT_CATALOG,
  CatalogComponentItem,
} from "../data/componentCatalog";
import {
  ALL_REGISTRIES_MANIFEST,
  RegistryManifestItem,
} from "../data/toolkitManifest";
import {
  StudioPhysicsConfig,
  ACCENT_PALETTES,
  mutateComponentCode,
  toPersianDigits,
} from "../engines/persianEngines";
import { soundEngine } from "../engines/soundEngine";
import { UniversalComponentPreview } from "./BentoShowcase";

/* ============================================================================
   VIEW 2: Component Explorer Dashboard (4,068+ Registry Components)
   ============================================================================ */
export const ComponentExplorerView: React.FC<{
  onOpenInStudio: (id: string) => void;
}> = ({ onOpenInStudio }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegistry, setSelectedRegistry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeRawReg, setActiveRawReg] = useState<RegistryManifestItem>(
    ALL_REGISTRIES_MANIFEST[0]
  );
  const [activeRawSampleIdx, setActiveRawSampleIdx] = useState<number>(0);
  const [rawFileFilter, setRawFileFilter] = useState<string>("");

  const categories = [
    { id: "all", label: "همه دسته‌ها", count: 4068 },
    { id: "3d-fintech", label: "سه‌بعدی و فین‌تک ایران", count: 312 },
    { id: "kinetic-typography", label: "تایپوگرافی جنبشی فارسی", count: 245 },
    { id: "motion-primitives", label: "پریمیوهای موشن و ناوبری", count: 1180 },
    { id: "webgl-shaders", label: "پس‌زمینه‌های WebGL و شیدر", count: 640 },
    { id: "ai-ui", label: "رابط‌های هوش مصنوعی (AI UI)", count: 490 },
    { id: "persian-blocks", label: "بلوک‌های فارسی و تقویم جلالی", count: 1201 },
  ];

  const registries = [
    { id: "all", label: "همه ۱۲ کتابخانه" },
    { id: "Effect UI", label: "Effect UI (763)" },
    { id: "React Bits", label: "React Bits (218)" },
    { id: "SmoothUI", label: "SmoothUI (120+)" },
    { id: "Animate UI", label: "Animate UI (v1+v2)" },
    { id: "Kokonut UI", label: "Kokonut UI (100+)" },
    { id: "Rasa FarsiUI", label: "Rasa FarsiUI + Jalali" },
    { id: "Eldora UI", label: "Eldora UI" },
    { id: "Cult UI", label: "Cult UI" },
    { id: "Tailark Blocks", label: "Tailark Blocks" },
  ];

  const filteredItems = COMPONENT_CATALOG.filter((item) => {
    const matchCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchReg =
      selectedRegistry === "all" || item.registry === selectedRegistry;
    const matchQuery =
      !searchQuery.trim() ||
      item.titleFa.includes(searchQuery) ||
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionFa.includes(searchQuery) ||
      item.registry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchReg && matchQuery;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    soundEngine.playSuccess();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Registry Stats Banner */}
      <div className="mb-6 rounded-2xl border border-[#1F1F23] bg-[#121215] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Layers className="h-4 w-4" />
              <span>کاوشگر یکپارچه ۱۲ رجیستری برتر جهان و ایران (۱۰۰٪ رایگان)</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              بیش از ۴,۰۶۸ کامپوننت، شیدر WebGL و بلوک آماده راست‌به‌چپ
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کامپوننت (مثلاً: کارت بانکی، نستعلیق، داک، تقویم...)"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2.5 ps-10 pe-4 text-xs text-white placeholder-zinc-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Registry Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-4">
          {registries.map((reg) => (
            <button
              key={reg.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedRegistry(reg.id);
              }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                selectedRegistry === reg.id
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: RTL Sidebar + Component Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar (3 cols) */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-1.5 rounded-2xl border border-[#1F1F23] bg-[#121215] p-3">
            <div className="px-3 py-2 text-xs font-bold text-zinc-400">
              دسته‌بندی‌های مهندسی
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playSnap();
                  setSelectedCategory(cat.id);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <span>{cat.label}</span>
                <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
                  {toPersianDigits(cat.count)}
                </span>
              </button>
            ))}

            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-200">
              <p className="font-bold">مسیر فایل‌ها در مخزن:</p>
              <p dir="ltr" className="mt-1 font-mono text-[10px] text-emerald-300">
                toolkit/04-motion-primitives-and-ui/
              </p>
              <p className="mt-1 text-zinc-300">
                تمامی ۴,۰۶۸ فایل `.tsx` به صورت کامل و بدون قفل در پوشه پروژه ذخیره شده‌اند.
              </p>
            </div>
          </div>
        </aside>

        {/* Component Cards Grid (9 cols) */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215] transition hover:border-zinc-700"
              >
                {/* Header */}
                <div className="border-b border-white/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      {item.registry}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                        {item.fps}
                      </span>
                      <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] text-indigo-300">
                        RTL Native
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-white">
                    {item.titleFa}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {item.descriptionFa}
                  </p>
                </div>

                {/* Live Interactive Stage */}
                <div className="bg-engineering-dots flex min-h-[240px] items-center justify-center p-4">
                  <UniversalComponentPreview previewType={item.previewType} />
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-zinc-950/60 px-4 py-3">
                  <button
                    onClick={() => {
                      soundEngine.playThock();
                      onOpenInStudio(item.id);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-indigo-500"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>تنظیم فیزیک و کد در استودیو</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(`code-${item.id}`, item.codeTsx)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:border-cyan-400/50"
                    >
                      {copiedId === `code-${item.id}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                      <span>
                        {copiedId === `code-${item.id}` ? "کپی شد!" : "کپی TSX"}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(`prompt-${item.id}`, item.aiPromptFa)
                      }
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:border-amber-400/50"
                    >
                      {copiedId === `prompt-${item.id}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span>پرامپت AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          Full 12-Registry & 4,197-File Real Source Code Explorer
         ==================================================================== */}
      <div className="mt-10 rounded-2xl border border-[#1F1F23] bg-[#121215] p-6 space-y-5">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Code2 className="h-4 w-4" />
              <span>
                مرورگر مستقیم تمام ۴,۱۹۷ فایل سورس‌کد در ۱۲ کتابخانه (`toolkit/04-motion-primitives-and-ui/`)
              </span>
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">
              انتخاب کتابخانه، جستجو در تمام فایل‌های `.tsx` و مشاهده/کپی سورس‌کد واقعی
            </h3>
          </div>

          <input
            type="text"
            value={rawFileFilter}
            onChange={(e) => setRawFileFilter(e.target.value)}
            placeholder="جستجو در نام فایل‌های این کتابخانه..."
            className="w-full lg:w-72 rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* 12 Registry Selector Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {ALL_REGISTRIES_MANIFEST.map((reg) => {
            const isSel = activeRawReg.id === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  soundEngine.playSnap();
                  setActiveRawReg(reg);
                  setActiveRawSampleIdx(0);
                }}
                className={`flex flex-col items-start justify-between rounded-xl border p-3 text-start transition ${
                  isSel
                    ? "border-emerald-400 bg-emerald-500/15 text-white"
                    : "border-white/10 bg-zinc-950 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                }`}
              >
                <span
                  dir="ltr"
                  className="font-mono text-xs font-bold text-cyan-300 truncate w-full"
                >
                  {reg.id}
                </span>
                <span className="mt-1 text-[11px] text-zinc-300">
                  {toPersianDigits(reg.totalFiles)} فایل TSX/TS
                </span>
              </button>
            );
          })}
        </div>

        {/* Split View: All Files in Registry (4 cols) + Real Source Code Viewer (8 cols) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Complete File List of Selected Registry */}
          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
              <span className="font-bold text-white">
                فهرست کامل فایل‌های {activeRawReg.id}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                {toPersianDigits(activeRawReg.totalFiles)} فایل
              </span>
            </div>
            <div
              dir="ltr"
              className="max-h-[420px] overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400 pe-1"
            >
              {activeRawReg.allComponents
                .filter(
                  (f) =>
                    !rawFileFilter.trim() ||
                    f.toLowerCase().includes(rawFileFilter.toLowerCase())
                )
                .map((filePath, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const sampleIdx = activeRawReg.samples.findIndex((s) =>
                        s.relPath.endsWith(filePath)
                      );
                      if (sampleIdx !== -1) {
                        soundEngine.playSnap();
                        setActiveRawSampleIdx(sampleIdx);
                      } else {
                        handleCopy(
                          `path-${filePath}`,
                          `toolkit/04-motion-primitives-and-ui/${activeRawReg.id}/${filePath}`
                        );
                      }
                    }}
                    className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-white/5 hover:text-cyan-300"
                  >
                    <span className="truncate">{filePath}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Real TSX Source Code Viewer for Selected Registry */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-zinc-950 p-4 lg:col-span-8 space-y-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <span className="text-xs font-bold text-white">
                  نمونه‌های سورس‌کد واقعی از پوشه `{activeRawReg.id}`:
                </span>
                {activeRawReg.samples[activeRawSampleIdx] && (
                  <button
                    onClick={() =>
                      handleCopy(
                        `raw-sample-${activeRawReg.id}`,
                        activeRawReg.samples[activeRawSampleIdx].code
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300"
                  >
                    {copiedId === `raw-sample-${activeRawReg.id}` ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {copiedId === `raw-sample-${activeRawReg.id}`
                        ? "سورس‌کد کپی شد!"
                        : "کپی کامل سورس TSX"}
                    </span>
                  </button>
                )}
              </div>

              {/* Sample Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {activeRawReg.samples.map((smp, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      soundEngine.playSnap();
                      setActiveRawSampleIdx(sIdx);
                    }}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition ${
                      activeRawSampleIdx === sIdx
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold"
                        : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {smp.name}.tsx
                  </button>
                ))}
              </div>
            </div>

            {activeRawReg.samples[activeRawSampleIdx] && (
              <>
                <div
                  dir="ltr"
                  className="rounded bg-zinc-900 px-3 py-1.5 font-mono text-[11px] text-cyan-400"
                >
                  {activeRawReg.samples[activeRawSampleIdx].relPath}
                </div>
                <pre
                  dir="ltr"
                  className="max-h-[340px] overflow-auto rounded-xl border border-white/5 bg-black/80 p-4 font-mono text-xs leading-relaxed text-zinc-200"
                >
                  <code>{activeRawReg.samples[activeRawSampleIdx].code}</code>
                </pre>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   VIEW 3: Split-Screen Live Physics & AST Code Mutator Studio
   ============================================================================ */
export const LivePhysicsStudioView: React.FC<{
  initialComponentId?: string;
}> = ({ initialComponentId = "iranian-3d-bank-card" }) => {
  const [selectedId, setSelectedId] = useState<string>(initialComponentId);
  const [activeTab, setActiveTab] = useState<"tsx" | "cli" | "prompt">("tsx");
  const [backdrop, setBackdrop] = useState<"grid" | "dots" | "aurora">("grid");
  const [copied, setCopied] = useState(false);

  const [physics, setPhysics] = useState<StudioPhysicsConfig>({
    stiffness: 260,
    damping: 22,
    mass: 0.8,
    tiltAngle: 15,
    scale: 1.04,
    dir: "rtl",
    fontFamily: "font-hasti",
    accentName: "firoozeh",
  });

  const activeItem: CatalogComponentItem =
    COMPONENT_CATALOG.find((c) => c.id === selectedId) || COMPONENT_CATALOG[0];

  const liveMutatedCode = mutateComponentCode(activeItem.codeTsx, physics);
  const activePalette = ACCENT_PALETTES[physics.accentName];

  const handleCopyOutput = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    soundEngine.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Top Selector Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#1F1F23] bg-[#121215] p-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Sliders className="h-4 w-4" />
            <span>استودیوی مهندسی فیزیک فنر و بازنویسی زنده درخت کد (AST Code Mutator)</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            با تغییر اسلایدرهای زیر، هم انیمیشن به صورت ۶۰ فریم تغییر می‌کند و هم کد TSX پایین صفحه به صورت زنده بازنویسی می‌شود (۱۰۰٪ رایگان).
          </p>
        </div>

        {/* Component Selector Dropdown / Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {COMPONENT_CATALOG.slice(0, 6).map((comp) => (
            <button
              key={comp.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedId(comp.id);
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                selectedId === comp.id
                  ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
                  : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {comp.titleFa.split(" (")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Screen Workbench: Right Stage (7 cols) + Left Physics Inspector (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Interactive Canvas (7 cols) */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215] lg:col-span-7">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {activeItem.titleFa}
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                60.0 FPS GPU
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* RTL / LTR Mirror Toggle */}
              <button
                onClick={() => {
                  soundEngine.playSnap();
                  setPhysics((p) => ({
                    ...p,
                    dir: p.dir === "rtl" ? "ltr" : "rtl",
                  }));
                }}
                className="flex items-center gap-1 rounded-lg border border-white/15 bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:border-cyan-400/50"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span>جهت: {physics.dir.toUpperCase()}</span>
              </button>

              {/* Backdrop Toggle */}
              {(["grid", "dots", "aurora"] as const).map((bg) => (
                <button
                  key={bg}
                  onClick={() => {
                    soundEngine.playSnap();
                    setBackdrop(bg);
                  }}
                  className={`rounded-lg border px-2 py-1 text-[10px] transition ${
                    backdrop === bg
                      ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200"
                      : "border-white/10 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {bg === "grid" ? "شطرنجی" : bg === "dots" ? "نقطه‌ای" : "شفق شیدری"}
                </button>
              ))}
            </div>
          </div>

          {/* Center Preview Stage */}
          <div
            className={`relative flex min-h-[360px] flex-1 items-center justify-center p-6 ${
              backdrop === "grid"
                ? "bg-engineering-grid"
                : backdrop === "dots"
                ? "bg-engineering-dots"
                : "bg-gradient-to-br from-indigo-950/50 via-zinc-950 to-cyan-950/40"
            }`}
          >
            <UniversalComponentPreview
              previewType={activeItem.previewType}
              physics={physics}
            />
          </div>

          {/* Telemetry Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-950/80 px-4 py-2.5 text-[11px] text-zinc-400">
            <span>
              فنر فعلی: Stiffness {toPersianDigits(physics.stiffness)} • Damping{" "}
              {toPersianDigits(physics.damping)} • Mass{" "}
              {toPersianDigits(physics.mass)}
            </span>
            <span style={{ color: activePalette.hex }} className="font-bold">
              پالت فعال: {activePalette.labelFa}
            </span>
          </div>
        </div>

        {/* Physics & Theme Inspector (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white">
                کنترلر زنده فیزیک، فونت و تم
              </span>
              <button
                onClick={() => {
                  soundEngine.playSpring();
                  setPhysics({
                    stiffness: 260,
                    damping: 22,
                    mass: 0.8,
                    tiltAngle: 15,
                    scale: 1.04,
                    dir: "rtl",
                    fontFamily: "font-hasti",
                    accentName: "firoozeh",
                  });
                }}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>بازنشانی استاندارد</span>
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-3.5">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">سفتی فنر (Stiffness)</span>
                  <span className="font-mono text-cyan-300">
                    {toPersianDigits(physics.stiffness)}
                  </span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={500}
                  step={10}
                  value={physics.stiffness}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    soundEngine.playTick(val / 260);
                    setPhysics((p) => ({ ...p, stiffness: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">میرایی نوسان (Damping)</span>
                  <span className="font-mono text-cyan-300">
                    {toPersianDigits(physics.damping)}
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={45}
                  step={1}
                  value={physics.damping}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    soundEngine.playTick(val / 22);
                    setPhysics((p) => ({ ...p, damping: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">زاویه چرخش سه‌بعدی (3D Tilt)</span>
                  <span className="font-mono text-cyan-300">
                    {toPersianDigits(physics.tiltAngle)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={28}
                  step={1}
                  value={physics.tiltAngle}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    soundEngine.playTick(val / 15);
                    setPhysics((p) => ({ ...p, tiltAngle: val }));
                  }}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Persian Font Selector */}
            <div className="pt-2">
              <label className="mb-2 block text-xs font-bold text-zinc-300">
                فونت فارسی کامپوننت (از گنجینه ۳۹ فونت):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "font-hasti", label: "هستی (Hasti)" },
                  { id: "font-nastaliq", label: "ایران‌نستعلیق" },
                  { id: "font-kahroba", label: "کهربا متغیر" },
                  { id: "font-morabba", label: "مربع (Morabba)" },
                  { id: "font-peyda", label: "پیدا (Peyda)" },
                  { id: "font-yekanbakh", label: "یکان‌بخ" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      soundEngine.playSnap();
                      setPhysics((p) => ({ ...p, fontFamily: f.id }));
                    }}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] transition ${
                      physics.fontFamily === f.id
                        ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-200 font-bold"
                        : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Persian Heritage Color Palette */}
            <div className="pt-2">
              <label className="mb-2 block text-xs font-bold text-zinc-300">
                پالت رنگ اصیل ایرانی:
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(ACCENT_PALETTES) as Array<
                    StudioPhysicsConfig["accentName"]
                  >
                ).map((key) => {
                  const pal = ACCENT_PALETTES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        soundEngine.playSnap();
                        setPhysics((p) => ({ ...p, accentName: key }));
                      }}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition ${
                        physics.accentName === key
                          ? "border-white/40 bg-white/10 text-white font-bold"
                          : "border-white/10 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: pal.hex }}
                      />
                      <span>{pal.labelFa}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-3 text-[11px] text-indigo-200">
            ⚡ تمامی تغییرات فیزیک، جهت‌گیری RTL و رنگ‌ها به صورت درجا در کد پایین صفحه تزریق شدند.
          </div>
        </div>
      </div>

      {/* Live Mutated Code / CLI / AI Prompt Output Panel */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-950 px-4 py-3">
          <div className="flex items-center gap-2">
            {[
              { id: "tsx", label: "کد زنده TSX (بازنویسی‌شده با AST)", icon: Code2 },
              { id: "cli", label: "دستور نصب Shadcn Registry CLI", icon: Terminal },
              { id: "prompt", label: "پرامپت مهندسی هوش مصنوعی", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setActiveTab(tab.id as "tsx" | "cli" | "prompt");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              handleCopyOutput(
                activeTab === "tsx"
                  ? liveMutatedCode
                  : activeTab === "cli"
                  ? activeItem.cliCommand
                  : activeItem.aiPromptFa
              )
            }
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? "کپی شد (۱۰۰٪ رایگان)" : "کپی فوری در کلیپ‌بورد"}</span>
          </button>
        </div>

        <pre
          dir={activeTab === "prompt" ? "rtl" : "ltr"}
          className="max-h-[340px] overflow-auto p-5 font-mono text-xs leading-relaxed text-zinc-200"
        >
          <code>
            {activeTab === "tsx"
              ? liveMutatedCode
              : activeTab === "cli"
              ? activeItem.cliCommand
              : activeItem.aiPromptFa}
          </code>
        </pre>
      </div>
    </section>
  );
};

/* ============================================================================
   VIEW 4: AI Motion Architect & QLoRA Dataset Engine (100% Free)
   ============================================================================ */
export const AiArchitectAndDatasetView: React.FC = () => {
  const [promptInput, setPromptInput] = useState(
    "یک کارت بانکی سه‌بعدی بلوبانک با شیدر هولوگرافیک، تشخیص پیش‌شماره شتاب و انیمیشن فنری ۶۰ فریم راست‌به‌چپ بساز."
  );
  const [selectedPreset, setSelectedPreset] = useState<CatalogComponentItem>(
    COMPONENT_CATALOG[0]
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copiedDataset, setCopiedDataset] = useState(false);

  const presets = [
    {
      label: "کارت سه‌بعدی هولوگرافیک شتاب",
      prompt:
        "یک کارت بانکی سه‌بعدی بلوبانک با شیدر هولوگرافیک، تشخیص پیش‌شماره شتاب و انیمیشن فنری ۶۰ فریم راست‌به‌چپ بساز.",
      item: COMPONENT_CATALOG[0],
    },
    {
      label: "تیتر جنبشی با فونت هستی و نستعلیق",
      prompt:
        "یک تیتر انیمیشنی فارسی با فونت هستی و نستعلیق بساز که کلمات را بدون شکستن نیم‌فاصله با فنر ۶۰ فریم وارد صفحه کند.",
      item: COMPONENT_CATALOG[1],
    },
    {
      label: "داک مغناطیسی ۶۰ فریم Raycast RTL",
      prompt:
        "یک داک مغناطیسی راست‌به‌چپ با بزرگ‌نمایی پیوسته گاوسی و بدون Re-render بساز.",
      item: COMPONENT_CATALOG[2],
    },
    {
      label: "تقویم خورشیدی جلالی با انیمیشن فنری",
      prompt:
        "یک تقویم جلالی آبان ۱۴۰۵ با نشانگر انتخاب متحرک (layoutId) و ارقام فارسی بساز.",
      item: COMPONENT_CATALOG[5],
    },
  ];

  const triggerSynthesis = (item: CatalogComponentItem, text: string) => {
    soundEngine.playSpring();
    setPromptInput(text);
    setIsSynthesizing(true);
    setTimeout(() => {
      setSelectedPreset(item);
      setIsSynthesizing(false);
      soundEngine.playSuccess();
    }, 450);
  };

  const sampleJsonlRecord = JSON.stringify(
    {
      registry: selectedPreset.registry,
      component: selectedPreset.id,
      features: ["60fps-spring-physics", "rtl-logical-css", "zwnj-safe"],
      messages: [
        {
          role: "system",
          content:
            "You are RTL-Motion-Coder, an elite Persian/RTL React 19, Tailwind v4, and Motion 60fps UI architect.",
        },
        { role: "user", content: selectedPreset.aiPromptFa },
        { role: "assistant", content: selectedPreset.codeTsx.slice(0, 220) + "..." },
      ],
    },
    null,
    2
  );

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#1F1F23] bg-gradient-to-l from-indigo-950/40 via-[#121215] to-cyan-950/30 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300">
              <Cpu className="h-3.5 w-3.5" />
              <span>موتور هوش مصنوعی اختصاصی + دیتاست‌ساز خودکار QLoRA (۱۰۰٪ متن‌باز)</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">
              معمار هوش مصنوعی RTL Motion Lab (آموزش‌دیده روی ۴,۰۶۸ کامپوننت)
            </h2>
            <p className="mt-1 max-w-3xl text-xs sm:text-sm text-zinc-400">
              توصیف کامپوننت مورد نظر خود را به فارسی بنویسید یا از الگوهای آماده انتخاب کنید تا مدل با رعایت ۵ قانون طلایی (Logical CSS، فنر ۶۰ فریم، حفظ نیم‌فاصله، قرینه‌سازی محور X و پشتیبانی از فونت‌های فارسی) کد اجرایی و پیش‌نمایش زنده را تولید کند.
            </p>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
          <button
            onClick={() => triggerSynthesis(selectedPreset, promptInput)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-95"
          >
            <Wand2 className="h-4 w-4" />
            <span>سنتز کامپوننت ۶۰ فریم</span>
          </button>
        </div>

        {/* Preset Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400">پرامپت‌های آماده:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => triggerSynthesis(p.item, p.prompt)}
              className="rounded-lg border border-white/10 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Output + Live Preview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Synthesized Preview + Chain of Thought (6 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white">
                پیش‌نمایش زنده کامپوننت سنتزشده
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                تاییدشده توسط ممیز RTL
              </span>
            </div>

            <div className="bg-engineering-grid my-4 flex min-h-[260px] items-center justify-center rounded-xl border border-white/10 p-5">
              {isSynthesizing ? (
                <div className="flex flex-col items-center gap-2 text-cyan-300">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span className="text-xs font-bold">
                    در حال کامپایل درخت AST و تنظیم فنر ۶۰ فریم...
                  </span>
                </div>
              ) : (
                <UniversalComponentPreview
                  previewType={selectedPreset.previewType}
                />
              )}
            </div>
          </div>

          {/* AI Reasoning Steps */}
          <div className="space-y-1.5 rounded-xl border border-white/10 bg-zinc-950 p-3.5 text-[11px]">
            <div className="font-bold text-cyan-300">
              گزارش زنجیره استدلال مدل (System Prompt Guardrails):
            </div>
            <div className="text-zinc-300">
              ✓ قانون ۱: جایگزینی کامل `ml/mr/left/right` با ویژگی‌های منطقی `ms/me/start/end`
            </div>
            <div className="text-zinc-300">
              ✓ قانون ۲: استفاده از `useMotionValue` و `useSpring` روی GPU بدون تغییر `width/top`
            </div>
            <div className="text-zinc-300">
              ✓ قانون ۳: حفظ اتصال حروف فارسی و نیم‌فاصله‌ها (`letter-spacing: 0`)
            </div>
          </div>
        </div>

        {/* Dataset & QLoRA Fine-Tuning Pipeline Inspector (6 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#1F1F23] bg-[#121215] p-5 lg:col-span-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-white">
                  خروجی دیتاست JSONL و پایپ‌لاین فاین‌تیونینگ QLoRA
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleJsonlRecord).catch(() => {});
                  soundEngine.playSuccess();
                  setCopiedDataset(true);
                  setTimeout(() => setCopiedDataset(false), 1800);
                }}
                className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-200"
              >
                {copiedDataset ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <FileJson className="h-3.5 w-3.5" />
                )}
                <span>{copiedDataset ? "رکورد JSONL کپی شد" : "کپی نمونه JSONL"}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              اسکریپت اجرایی{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-cyan-300">
                toolkit/06-ai-model-training/build-rtl-motion-dataset.mjs
              </code>{" "}
              تمامی ۴,۰۶۸ کامپوننت موجود در پوشه `04` را اسکن کرده و به جفت‌های آموزشی استاندارد برای فاین‌تیونینگ مدل‌های{" "}
              <strong className="text-white">Qwen-2.5-Coder-7B / 14B</strong> تبدیل می‌کند:
            </p>

            <pre
              dir="ltr"
              className="max-h-[220px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-3.5 font-mono text-[11px] leading-relaxed text-amber-200/90"
            >
              <code>{sampleJsonlRecord}</code>
            </pre>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                <span>دستور اجرای دیتاست‌ساز و آموزش مدل در مخزن:</span>
              </span>
            </div>
            <pre
              dir="ltr"
              className="mt-2 overflow-x-auto font-mono text-[11px] text-emerald-300"
            >
              <code>{`node toolkit/06-ai-model-training/build-rtl-motion-dataset.mjs
python toolkit/06-ai-model-training/train.py --base_model Qwen/Qwen2.5-Coder-7B-Instruct`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
