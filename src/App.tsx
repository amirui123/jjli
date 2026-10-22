import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Sliders,
  Cpu,
  Volume2,
  VolumeX,
  Type,
  Compass,
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { BentoShowcaseGrid } from "./components/BentoShowcase";
import {
  ComponentExplorerView,
  LivePhysicsStudioView,
  AiArchitectAndDatasetView,
} from "./components/StudioAndAiViews";
import {
  FullPersianFontsLabView,
  FullSkillsAndBrandsVaultView,
  FullCoreEnginesWorkbenchView,
} from "./components/FullToolkitHubViews";
import { soundEngine } from "./engines/soundEngine";
import { splitPersianWordsSafe } from "./engines/persianEngines";

type ActiveView =
  | "all-in-one"
  | "explorer"
  | "fonts"
  | "studio"
  | "engines"
  | "skills"
  | "ai";

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>("all-in-one");
  const [studioComponentId, setStudioComponentId] = useState<string>(
    "iranian-3d-bank-card"
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [heroFont, setHeroFont] = useState<string>("font-hasti");
  const [heroReplay, setHeroReplay] = useState<number>(0);

  const handleOpenInStudio = (componentId: string) => {
    soundEngine.playThock();
    setStudioComponentId(componentId);
    setActiveView("studio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEngine.enabled = next;
    setSoundEnabled(next);
    if (next) soundEngine.playSuccess();
  };

  const heroFontOptions = [
    { id: "font-hasti", label: "هستی (Hasti)" },
    { id: "font-nastaliq", label: "ایران‌نستعلیق (Nastaliq)" },
    { id: "font-kahroba", label: "کهربا متغیر (Kahroba)" },
    { id: "font-morabba", label: "مربع متغیر (Morabba)" },
    { id: "font-doran", label: "دوران متغیر (Doran)" },
    { id: "font-peyda", label: "پیدا (Peyda)" },
    { id: "font-yekanbakh", label: "یکان‌بخ (YekanBakh)" },
    { id: "font-vazirmatn", label: "وزیرمتن (Vazirmatn)" },
  ];

  const heroTitleWords = splitPersianWordsSafe(
    "پلتفرم جامع مهندسی موشن ۶۰ فریم، شیدر سه‌بعدی، فونت فارسی و هوش مصنوعی"
  );

  const navTabs: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: "all-in-one", label: "نمای کامل (همه بخش‌ها یکجا)", icon: Compass },
    { id: "explorer", label: "۴,۱۹۷ کامپوننت (۱۲ کتابخانه)", icon: Layers },
    { id: "fonts", label: "۳۹ فونت فارسی و نستعلیق", icon: Type },
    { id: "studio", label: "استودیو فیزیک و کد زنده", icon: Sliders },
    { id: "engines", label: "۷ موتور هسته‌ای و ۲۰۰ صدا", icon: Zap },
    { id: "skills", label: "۱۷۹ اسکیل و ۸۴ برند", icon: BookOpen },
    { id: "ai", label: "هوش مصنوعی و QLoRA", icon: Cpu },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#09090B] text-[#FAFAFA] bg-grain flex flex-col justify-between"
    >
      {/* ====================================================================
          Sticky Top Engineering Navbar
         ==================================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#09090B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand Identity */}
            <div
              onClick={() => {
                soundEngine.playSnap();
                setActiveView("all-in-one");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-tr from-indigo-600/40 to-cyan-500/30 shadow-inner">
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-normal text-white">
                    آزمایشگاه موشن فارسی | RTL Motion Lab
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ۱۰۰٪ رایگان و کامل
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  ۴,۱۹۷ کامپوننت در ۱۲ رجیستری • ۳۹ فونت فارسی • ۱۷۹ اسکیل • ۸۴ برند • ۲۰۰ صدای Web Audio
                </p>
              </div>
            </div>

            {/* Right Controls: Sound Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                title="سینت‌سایزر صدای تعاملی Web Audio API"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  soundEnabled
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                    : "border-white/10 bg-zinc-900 text-zinc-500"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
                <span>
                  {soundEnabled ? "سینت‌سایزر ۲۰۰ صدا: فعال" : "بی‌صدا"}
                </span>
              </button>
            </div>
          </div>

          {/* 7-Section Navigation Bar */}
          <nav className="flex flex-wrap items-center gap-1 rounded-2xl border border-[#1F1F23] bg-[#121215] p-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playSnap();
                    setActiveView(tab.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="top-nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 26,
                      }}
                      className="absolute inset-0 rounded-xl border border-indigo-400/40 bg-gradient-to-l from-indigo-600/80 to-cyan-600/70 shadow"
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ====================================================================
          Main Content Area
          In "all-in-one" mode, ALL 7 pillars are rendered sequentially on one
          continuous page so the user can see EVERYTHING completely!
         ==================================================================== */}
      <main className="flex-1">
        {activeView === "all-in-one" && (
          <div className="space-y-4">
            {/* 1. Hero Section */}
            <section className="relative overflow-hidden border-b border-[#1F1F23] bg-engineering-grid pt-9 pb-10">
              <div className="pointer-events-none absolute -top-32 inset-x-0 mx-auto h-80 w-[680px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent blur-3xl" />

              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-4 py-1.5 text-xs text-zinc-300 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>
                    نمایش کامل تمام ۷ بخش زرادخانه مهندسی در یک صفحه یکپارچه • ۱۰۰٪ رایگان
                  </span>
                </div>

                {/* Live Hero Font Switcher Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="flex items-center gap-1 text-xs text-zinc-400 me-1">
                    <Type className="h-3.5 w-3.5 text-amber-400" />
                    <span>تغییر زنده فونت تیتر اصلی:</span>
                  </span>
                  {heroFontOptions.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        soundEngine.playSpring();
                        setHeroFont(font.id);
                        setHeroReplay((r) => r + 1);
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                        heroFont === font.id
                          ? "border-amber-400/60 bg-amber-500/20 text-amber-200 font-bold"
                          : "border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>

                {/* Animated Kinetic Persian Headline */}
                <h1
                  key={heroReplay}
                  onClick={() => {
                    soundEngine.playSpring();
                    setHeroReplay((r) => r + 1);
                  }}
                  className={`${heroFont} mx-auto mt-6 flex max-w-4xl cursor-pointer flex-wrap items-center justify-center gap-x-3 gap-y-2 text-3xl sm:text-5xl font-bold leading-[1.45] text-white`}
                >
                  {heroTitleWords.map((word, idx) => (
                    <motion.span
                      key={`${heroReplay}-${idx}`}
                      initial={{
                        opacity: 0,
                        y: 22,
                        filter: "blur(10px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                        delay: idx * 0.05,
                      }}
                      whileHover={{ scale: 1.08, color: "#38BDF8" }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                  در این صفحه تمام دارایی‌های زرادخانه به صورت زنده و کامل جلوی چشم شماست:{" "}
                  <strong className="text-white">۶ موتور تعاملی در بنتو گرید</strong>،{" "}
                  <strong className="text-white">آزمایشگاه کامل هر ۳۹ فونت فارسی (نستعلیق، هستی، کهربا...)</strong>،{" "}
                  <strong className="text-white">کاوشگر سورس‌کد تمام ۴,۱۹۷ کامپوننت در ۱۲ کتابخانه</strong>،{" "}
                  <strong className="text-white">استودیوی زنده فیزیک و تغییر کد AST</strong>،{" "}
                  <strong className="text-white">سینت‌سایزر تمام ۲۰۰ صدای Web Audio + فین‌تک ۱۸ بانک ایران</strong>،{" "}
                  <strong className="text-white">خزانه کامل ۱۷۹ اسکیل و ۸۴ سیستم طراحی برندها</strong> و{" "}
                  <strong className="text-white">معمار هوش مصنوعی QLoRA</strong>.
                </p>

                {/* Telemetry Stats */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-6 text-start">
                  {[
                    {
                      num: "۴,۱۹۷ فایل",
                      label: "۱۲ رجیستری کامپوننت",
                      sub: "Effect, ReactBits, SmoothUI...",
                      target: "explorer" as ActiveView,
                    },
                    {
                      num: "۳۹ خانواده",
                      label: "فونت فارسی و نستعلیق",
                      sub: "هستی، نستعلیق، کهربا، مربع...",
                      target: "fonts" as ActiveView,
                    },
                    {
                      num: "۱۷۹ اسکیل",
                      label: "مهارت‌های SKILL.md",
                      sub: "Three.js, GSAP, Awwwards...",
                      target: "skills" as ActiveView,
                    },
                    {
                      num: "۸۴ برند",
                      label: "سیستم‌های DESIGN.md",
                      sub: "Linear, Vercel, Apple, Stripe...",
                      target: "skills" as ActiveView,
                    },
                    {
                      num: "۲۰۰ صدا",
                      label: "سینت‌سایزر Web Audio",
                      sub: "پخش زنده بدون فایل MP3",
                      target: "engines" as ActiveView,
                    },
                    {
                      num: "۱۸ بانک + AI",
                      label: "فین‌تک ایران و QLoRA",
                      sub: "شبا، کدملی، حروف و دیتاست",
                      target: "ai" as ActiveView,
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        soundEngine.playSnap();
                        setActiveView(stat.target);
                      }}
                      className="cursor-pointer rounded-xl border border-[#1F1F23] bg-[#121215]/90 p-3 transition hover:border-cyan-400/50"
                    >
                      <div className="text-base sm:text-lg font-bold text-cyan-300">
                        {stat.num}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-white">
                        {stat.label}
                      </div>
                      <div className="mt-0.5 text-[10px] text-zinc-400 truncate">
                        {stat.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. 6-Card Live Bento Showcase */}
            <BentoShowcaseGrid onOpenInStudio={handleOpenInStudio} />

            {/* 3. Live Physics & AST Code Mutator Studio */}
            <div className="border-t border-[#1F1F23] pt-4">
              <LivePhysicsStudioView initialComponentId={studioComponentId} />
            </div>

            {/* 4. Full 39 Persian Fonts & Kinetic Typography Lab */}
            <div className="border-t border-[#1F1F23] pt-4">
              <FullPersianFontsLabView />
            </div>

            {/* 5. Full 4,197-Component & 12-Registry Explorer */}
            <div className="border-t border-[#1F1F23] pt-4">
              <ComponentExplorerView onOpenInStudio={handleOpenInStudio} />
            </div>

            {/* 6. Full 7 Core Engines, 200+ Sound Synthesizer, 18 Iranian Banks & WebGL Shaders */}
            <div className="border-t border-[#1F1F23] pt-4">
              <FullCoreEnginesWorkbenchView />
            </div>

            {/* 7. Full 179 Skills + 84 Brand DESIGN.md Vault */}
            <div className="border-t border-[#1F1F23] pt-4">
              <FullSkillsAndBrandsVaultView />
            </div>

            {/* 8. AI Motion Architect & QLoRA Fine-Tuning Pipeline */}
            <div className="border-t border-[#1F1F23] pt-4">
              <AiArchitectAndDatasetView />
            </div>
          </div>
        )}

        {activeView === "explorer" && (
          <ComponentExplorerView onOpenInStudio={handleOpenInStudio} />
        )}

        {activeView === "fonts" && <FullPersianFontsLabView />}

        {activeView === "studio" && (
          <LivePhysicsStudioView initialComponentId={studioComponentId} />
        )}

        {activeView === "engines" && <FullCoreEnginesWorkbenchView />}

        {activeView === "skills" && <FullSkillsAndBrandsVaultView />}

        {activeView === "ai" && <AiArchitectAndDatasetView />}
      </main>

      {/* ====================================================================
          Clean Engineering Footer
         ==================================================================== */}
      <footer className="mt-12 border-t border-[#1F1F23] bg-[#09090B] py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-zinc-300 font-medium">
              آزمایشگاه موشن فارسی (RTL Motion Lab) — نمایش ۱۰۰٪ کامل تمام دارایی‌ها، فونت‌ها، موتورها و کامپوننت‌ها
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span>۴,۱۹۷ کامپوننت</span>
            <span>•</span>
            <span>۳۹ فونت فارسی</span>
            <span>•</span>
            <span>۱۷۹ اسکیل</span>
            <span>•</span>
            <span>۸۴ برند DESIGN.md</span>
            <span>•</span>
            <span>۲۰۰ صدای Web Audio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
