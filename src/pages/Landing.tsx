import React, { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  BookOpen,
  Brain,
  Clapperboard,
  Gauge,
  Layers,
  RotateCcw,
  Sparkles,
  Type,
  Waves,
} from "lucide-react";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { DESIGN_LAB_PILLARS, DESIGN_LAB_TOTAL_FILES } from "../data/designLabManifest";
import { navigate } from "../lib/router";
import { writePersisted } from "../lib/store";
import { soundEngine } from "../engines/soundEngine";
import { faNum } from "../lib/format";
import { cn } from "../ui/kit";
import { ShaderSurface } from "../components/ShaderSurface";
import { SHADERS } from "../engines/shaderLab";

const SPRING_SILK = {
  type: "spring" as const,
  stiffness: 110,
  damping: 20,
  mass: 0.9,
};

const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 145,
  damping: 22,
  mass: 0.85,
};

const HERO_FONTS = [
  { id: "iran-nastaliq", label: "ایران‌نستعلیق" },
  { id: "hasti", label: "فونت هستی" },
  { id: "vazirmatn", label: "وزیرمتن" },
  { id: "peyda", label: "پیدا" },
] as const;

interface ShowcaseChapter {
  num: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
  metricValue: string;
  metricLabel: string;
  ctaLabel: string;
  path: string;
  accent: string;
  icon: React.ElementType;
  visualType: "typography" | "physics" | "vault" | "engines";
}

const CHAPTERS: ShowcaseChapter[] = [
  {
    num: "۰۱",
    eyebrow: "ATELIER · PERSIAN TYPOGRAPHY",
    titleLine1: "پنجاه خانواده فونت اصیل؛",
    titleLine2: "کالیبره‌شده برای خوانایی بی‌نقص",
    desc: "از شکوه ایران‌نستعلیق تا دقت وزیرمتن و هستی؛ با محور نوری GRAD، طلاکوبی و خروجی بدون پرش.",
    metricValue: faNum(TOOLKIT_STATS.fonts),
    metricLabel: "فونت فارسی آماده دانلود (.WOFF2)",
    ctaLabel: "ورود به آتلیه فونت",
    path: "/studio/fonts",
    accent: "#E8B33A",
    icon: Type,
    visualType: "typography",
  },
  {
    num: "۰۲",
    eyebrow: "OSCILLOSCOPE · 120HZ SPRING PHYSICS",
    titleLine1: "فیزیک حرکت ۱۲۰ هرتز؛",
    titleLine2: "بر پایهٔ معادلات دیفرانسیل فنر",
    desc: "طراحی حرکت‌های ابریشمی با شبیه‌سازی زندهٔ سختی، میرایی و جرم؛ آماده برای Framer Motion و CSS.",
    metricValue: "۱۲۰Hz",
    metricLabel: "میرایی مستقل از نرخ فریم",
    ctaLabel: "ورود به استودیو موشن",
    path: "/studio/motion",
    accent: "#22D3EE",
    icon: Gauge,
    visualType: "physics",
  },
  {
    num: "۰۳",
    eyebrow: "CODEX · 11 KNOWLEDGE PILLARS",
    titleLine1: "چهار هزار و بیست و سه اسکیل؛",
    titleLine2: "مرتب‌شده در ۱۱ ستون و ۴۶ زیرشاخه",
    desc: "مخزن کامل قوانین زیبایی‌شناسی، کپی‌رایتینگ، روانشناسی رنگ، هندسهٔ گره‌چینی و ۸۴ سیستم برند.",
    metricValue: faNum(DESIGN_LAB_TOTAL_FILES),
    metricLabel: "فایل، بلوپرینت و مهارت تخصصی",
    ctaLabel: "کاوش در ۴٬۰۲۳ اسکیل",
    path: "/studio/skills",
    accent: "#A78BFA",
    icon: BookOpen,
    visualType: "vault",
  },
  {
    num: "۰۴",
    eyebrow: "BLUEPRINT & DECK · COMPONENTS, SOUND & SHADERS",
    titleLine1: "کامپوننت، شیدر و صدای رویه‌ای؛",
    titleLine2: "همه‌چیز زنده، قابل شخصی‌سازی و دانلود",
    desc: "۴٬۱۹۹ سورس کامپوننت، ۱۸ شیدر WebGL با عدسی شیشه مایع، ۲۰۰ صدای سنتزشده و کارگاه هوش مصنوعی.",
    metricValue: "۴٬۱۹۹",
    metricLabel: "سورس کامپوننت + شیدر + صدا",
    ctaLabel: "ورود به استودیو کامپوننت",
    path: "/studio/components",
    accent: "#34D399",
    icon: Layers,
    visualType: "engines",
  },
];

const QUICK_STUDIOS = [
  { label: "فونت", path: "/studio/fonts", icon: Type, accent: "#E8B33A" },
  { label: "موشن", path: "/studio/motion", icon: Gauge, accent: "#22D3EE" },
  { label: "کامپوننت", path: "/studio/components", icon: Layers, accent: "#34D399" },
  { label: "صدا", path: "/studio/sounds", icon: Waves, accent: "#FB7185" },
  { label: "۴٬۰۲۳ اسکیل", path: "/studio/skills", icon: BookOpen, accent: "#A78BFA" },
  { label: "شیدر و RTL", path: "/studio/engines", icon: Sparkles, accent: "#38BDF8" },
  { label: "هوش مصنوعی", path: "/studio/ai", icon: Brain, accent: "#E879F9" },
] as const;

export const Landing: React.FC<{ onReplayIntro?: () => void }> = ({ onReplayIntro }) => {
  const [heroFontId, setHeroFontId] = useState<string>("iran-nastaliq");
  const [heroMotionKey, setHeroMotionKey] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const heroSlideX = isMobile ? 58 : 180;
  const chapterSlideX = isMobile ? 48 : 150;
  const dropY = isMobile ? -32 : -70;

  const activeHeroFont =
    PERSIAN_FONT_CATALOG.find((f) => f.id === heroFontId) ?? PERSIAN_FONT_CATALOG[0];
  const heroShader = SHADERS.find((s) => s.id === "mesh-aurora") ?? SHADERS[0];

  // Scroll-driven progress & opposite horizontal kinetic ribbons
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.6,
  });

  const ribbonRightToLeft = useTransform(smoothProgress, [0, 1], [160, -240]);
  const ribbonLeftToRight = useTransform(smoothProgress, [0, 1], [-160, 240]);
  const heroParallaxY = useTransform(smoothProgress, [0, 0.28], [0, -55]);

  const openFontInStudio = (fontId: string) => {
    soundEngine.playTick(1.05);
    setHeroFontId(fontId);
    writePersisted("studio-fonts", { fontId });
    navigate("/studio/fonts");
  };

  const openPillarInSkills = (pillarId: string) => {
    soundEngine.playTick(1.05);
    const pillar = DESIGN_LAB_PILLARS.find((p) => p.id === pillarId);
    const firstSc = pillar?.subcategories[0];
    const firstFile = firstSc?.files[0];
    const firstUrl =
      pillar && firstSc && firstFile
        ? `/design-lab/${pillar.id}/${firstSc.id}/${firstFile[0]}`
        : undefined;
    writePersisted("studio-skills-pick-v2", {
      pillarId,
      ...(firstUrl ? { vaultUrl: firstUrl } : {}),
    });
    navigate("/studio/skills");
  };

  const replayIntroFilm = () => {
    soundEngine.playSuccess();
    if (onReplayIntro) {
      onReplayIntro();
      return;
    }
    window.dispatchEvent(new CustomEvent("rtmlab:open-intro"));
  };

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">
      {/* Top Scroll Progress Laser Line */}
      <motion.div
        style={{ scaleX: smoothProgress, transformOrigin: "right" }}
        className="fixed inset-x-0 top-14 z-30 h-[2px] bg-gradient-to-l from-[color:var(--accent)] via-cyan-400 to-violet-400"
      />

      {/* =====================================================================
         SCENE 01: FULL-SCREEN CHOREOGRAPHED HERO
         - Intro badge drops from TOP (y: -70 -> 0)
         - Line 1 slides from RIGHT (x: 170 -> 0)
         - Line 2 slides from LEFT (x: -170 -> 0)
         ===================================================================== */}
      <section className="relative flex min-h-[80dvh] flex-col items-center justify-center overflow-hidden px-3.5 py-12 sm:min-h-[84vh] sm:px-10 sm:py-16">
        {/* Soft Ambient Living Shader Aura */}
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <ShaderSurface
            def={heroShader}
            speed={0.2}
            scale={1.35}
            hue={0.12}
            warp={0.7}
            grain={0.15}
            interactive={false}
            className="h-full w-full"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 65% at 50% 45%, rgba(5,6,10,0.15) 0%, #05060A 82%)",
          }}
        />

        <motion.div
          key={heroMotionKey}
          style={{ y: heroParallaxY }}
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        >
          {/* 1. TOP-DROP INTRO PILL (معرفی از بالا می‌آید پایین) */}
          <motion.div
            initial={{ opacity: 0, y: dropY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SILK, delay: 0.05 }}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10.5px] text-zinc-300 backdrop-blur-md sm:gap-2.5 sm:px-4 sm:text-[11.5px]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent)]" />
            <span className="truncate">
              آتلیهٔ مهندسی تایپوگرافی، فیزیک حرکت و طراحی راست‌به‌چپ
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(1.15);
                setHeroMotionKey((k) => k + 1);
              }}
              aria-label="پخش دوباره انیمیشن ورود"
              title="پخش دوباره انیمیشن ورود نوشته‌ها"
              className="ms-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition-transform hover:rotate-180 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </motion.div>

          {/* 2. SIDE-SLIDING MONUMENTAL HEADLINE (نوشته از کنار می‌آید سر جاش) */}
          <h1
            style={{ fontFamily: activeHeroFont.family }}
            className="mt-8 flex w-full flex-col items-center justify-center gap-1.5 text-[clamp(36px,10.5vw,52px)] leading-[1.68] text-white sm:mt-10 sm:gap-2 sm:text-[68px] sm:leading-[1.7] lg:text-[80px]"
          >
            {/* Right-to-Center Glide */}
            <motion.span
              initial={{ opacity: 0, x: heroSlideX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SILK, delay: 0.16 }}
              className="block text-zinc-100 will-change-transform"
            >
              در امتدادِ نور،
            </motion.span>

            {/* Left-to-Center Glide */}
            <motion.span
              initial={{ opacity: 0, x: -heroSlideX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SILK, delay: 0.3 }}
              className="block bg-gradient-to-l from-amber-200 via-[color:var(--accent)] to-amber-100 bg-clip-text text-transparent will-change-transform"
            >
              هر خط جان می‌گیرد
            </motion.span>
          </h1>

          {/* 3. TOP-DROP SUBTITLE (معرفی کوتاه از بالا فرود می‌آید) */}
          <motion.p
            initial={{ opacity: 0, y: isMobile ? -20 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SILK, delay: 0.44 }}
            className="mt-5 max-w-xl px-2 text-[13.5px] leading-relaxed text-zinc-400 sm:mt-6 sm:text-[16px]"
          >
            هفت استودیوی تخصصی، {faNum(DESIGN_LAB_TOTAL_FILES)} اسکیل مهندسی،{" "}
            {faNum(TOOLKIT_STATS.fonts)} فونت اصیل و ۴٬۱۹۹ کامپوننت تعاملی — با اسکرول به پایین، هر
            بخش تیکه‌تیکه در برابر شما جان می‌گیرد.
          </motion.p>

          {/* 4. SIDE-CONVERGING ACTION BUTTONS (دکمه‌ها از دو طرف به مرکز می‌آیند) */}
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-2.5 px-2 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3.5">
            <motion.button
              type="button"
              initial={{ opacity: 0, x: isMobile ? 36 : 90 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.56 }}
              onClick={() => {
                soundEngine.playTick(1.1);
                navigate("/studio/skills");
              }}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[color:var(--accent)] px-6 py-3.5 text-[13px] font-bold text-[#06070B] shadow-[0_14px_38px_-10px_rgba(232,179,58,0.65)] transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto sm:px-7"
            >
              <span>ورود به مخزن {faNum(DESIGN_LAB_TOTAL_FILES)} اسکیل</span>
              <ArrowLeft className="h-4 w-4" />
            </motion.button>

            <motion.button
              type="button"
              initial={{ opacity: 0, x: isMobile ? -36 : -90 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SNAPPY, delay: 0.62 }}
              onClick={replayIntroFilm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-3.5 text-[12.5px] text-zinc-200 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto"
            >
              <Clapperboard className="h-4 w-4 text-[color:var(--accent)]" />
              <span>تماشای فیلم ورودی</span>
            </motion.button>
          </div>

          {/* 5. TOP-DROPPING FEATURED FONT PILLS (شامل «فونت هستی» برای تست مستقیم) */}
          <motion.div
            initial={{ opacity: 0, y: -32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SILK, delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="me-1 text-[11px] text-zinc-500">تغییر زندهٔ خط تیتر:</span>
            {HERO_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onMouseEnter={() => setHeroFontId(f.id)}
                onClick={() => openFontInStudio(f.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] transition-all",
                  heroFontId === f.id
                    ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/15 text-white"
                    : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Breathing Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-14 flex flex-col items-center gap-2 text-zinc-500"
        >
          <span className="text-[10.5px] tracking-wider">اسکرول کنید تا پرده‌ها باز شوند</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4 text-[color:var(--accent)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================================
         SCENE 02: SCROLL-DRIVEN KINETIC TYPOGRAPHY RIBBONS
         - Two monumental lines glide horizontally in opposite directions on scroll
         ===================================================================== */}
      <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#07080D] py-16 sm:py-24">
        <div className="space-y-4 select-none">
          <motion.div
            style={{ x: ribbonRightToLeft }}
            className="whitespace-nowrap font-hasti text-[34px] text-white/15 sm:text-[56px]"
          >
            تایپوگرافی نوری فارسی ✦ فیزیک فنر ۱۲۰ هرتز ✦ هندسهٔ گره‌چینی ایرانی ✦ شیشهٔ مایع اسنل ✦
          </motion.div>

          <motion.div
            style={{ x: ribbonLeftToRight }}
            className="whitespace-nowrap font-nastaliq text-[38px] text-[color:var(--accent)]/35 sm:text-[64px]"
          >
            در امتدادِ نور هر خط جان می‌گیرد ✦ چهار هزار و بیست و سه مهارت مهندسی ✦ هفت استودیوی
            تخصصی ✦
          </motion.div>
        </div>

        {/* Center Manifesto Card Dropping from Top on Scroll */}
        <div className="mx-auto mt-10 max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: dropY }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: isMobile, amount: 0.3 }}
            transition={SPRING_SILK}
            className="rounded-3xl border border-white/[0.08] bg-[#0B0D15]/90 px-6 py-7 backdrop-blur-xl sm:px-10"
          >
            <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--accent)]">
              SCROLL-CHOREOGRAPHED ARCHITECTURE
            </span>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-200 sm:text-[17px]">
              به‌جای صفحه‌های شلوغ و پر از باکس‌های تودرتو، هر قلمرو در یک پردهٔ مستقل با حرکت از
              بالا و کناره‌ها در برابر چشم شما شکل می‌گیرد.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
         SCENE 03: PIECE-BY-PIECE SCROLL SHOWCASES (تیکه‌تیکه با اسکرول)
         - For each chapter:
           1) Number & Eyebrow drop from TOP (y: -70 -> 0)
           2) Headline & Story glide in from RIGHT (x: 150 -> 0)
           3) Interactive Stage glides in from LEFT (x: -150 -> 0)
         ===================================================================== */}
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:space-y-28 sm:px-8 sm:py-32">
        {CHAPTERS.map((ch, idx) => {
          const Icon = ch.icon;
          const isEven = idx % 2 === 0;

          return (
            <section
              key={ch.num}
              className="relative flex min-h-[56vh] flex-col justify-center sm:min-h-[68vh]"
            >
              {/* PIECE 1: TOP-DROP INTRODUCTION HEADER (معرفی از بالا می‌آید) */}
              <motion.div
                initial={{ opacity: 0, y: dropY }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: isMobile, amount: 0.2 }}
                transition={SPRING_SILK}
                className="mb-6 flex items-center gap-3 sm:mb-8"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border font-mono text-[14px] font-bold"
                  style={{
                    borderColor: `${ch.accent}45`,
                    backgroundColor: `${ch.accent}15`,
                    color: ch.accent,
                  }}
                >
                  {ch.num}
                </span>
                <div className="h-px w-10 bg-white/15" />
                <span className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-400">
                  {ch.eyebrow}
                </span>
              </motion.div>

              {/* PIECE 2 & 3: SIDE-SLIDING TEXT + SIDE-SLIDING VISUAL STAGE */}
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
                {/* Text Column: Glides in from the Side into its slot */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: isEven ? chapterSlideX : -chapterSlideX,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{ once: isMobile, amount: 0.2 }}
                  transition={{ ...SPRING_SILK, delay: 0.06 }}
                  className={cn("space-y-5 lg:col-span-6", !isEven && "lg:order-2")}
                >
                  <h2 className="font-hasti text-[28px] leading-[1.45] text-white sm:text-[40px]">
                    <span className="block">{ch.titleLine1}</span>
                    <span className="mt-1 block" style={{ color: ch.accent }}>
                      {ch.titleLine2}
                    </span>
                  </h2>

                  <p className="max-w-lg text-[14px] leading-relaxed text-zinc-400 sm:text-[15.5px]">
                    {ch.desc}
                  </p>

                  {/* Metric + Action Button */}
                  <div className="flex flex-wrap items-center gap-5 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(1.1);
                        navigate(ch.path);
                      }}
                      style={{
                        borderColor: `${ch.accent}55`,
                        backgroundColor: `${ch.accent}18`,
                      }}
                      className="group inline-flex items-center gap-2.5 rounded-2xl border px-6 py-3 text-[13px] font-bold text-white transition-all hover:scale-[1.03]"
                    >
                      <Icon className="h-4 w-4" style={{ color: ch.accent }} />
                      <span>{ch.ctaLabel}</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </button>

                    <div className="border-s border-white/10 ps-4">
                      <div
                        className="font-mono text-[22px] font-bold leading-none"
                        style={{ color: ch.accent }}
                      >
                        {ch.metricValue}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500">{ch.metricLabel}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Interactive Visual Stage: Glides in from the Opposite Side */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: isEven ? -chapterSlideX : chapterSlideX,
                    scale: 0.94,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  viewport={{ once: isMobile, amount: 0.2 }}
                  transition={{ ...SPRING_SILK, delay: 0.14 }}
                  className={cn("lg:col-span-6", !isEven && "lg:order-1")}
                >
                  {/* Visual Stage 1: Typography Specimen Showcase */}
                  {ch.visualType === "typography" && (
                    <button
                      type="button"
                      onClick={() => navigate("/studio/fonts")}
                      className="group block w-full cursor-pointer overflow-hidden rounded-[28px] border border-amber-400/25 bg-gradient-to-b from-amber-500/[0.08] to-[#090B11] p-8 text-center transition-all hover:border-amber-400/50"
                    >
                      <div className="font-mono text-[10px] tracking-[0.2em] text-amber-300/80">
                        IRAN NASTALIQ · HASTI · VAZIRMATN
                      </div>
                      <p className="my-8 font-nastaliq text-[40px] leading-[1.95] text-white transition-transform duration-500 group-hover:scale-105 sm:text-[50px]">
                        هنر، در جزئیاتی نهفته است
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] text-amber-200">
                        <span>کلیک برای تست زنده و دانلود ۵۰ فونت</span>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  )}

                  {/* Visual Stage 2: 120Hz Spring Wave Showcase */}
                  {ch.visualType === "physics" && (
                    <button
                      type="button"
                      onClick={() => navigate("/studio/motion")}
                      className="group block w-full cursor-pointer overflow-hidden rounded-[28px] border border-cyan-400/25 bg-gradient-to-b from-cyan-500/[0.08] to-[#090B11] p-8 text-start transition-all hover:border-cyan-400/50"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-cyan-300">
                        <span>SPRING OSCILLATOR · f=2.4Hz · ζ=0.68</span>
                        <span>120 FPS</span>
                      </div>
                      <svg viewBox="0 0 400 130" className="my-6 h-32 w-full overflow-visible">
                        <line
                          x1="0"
                          y1="45"
                          x2="400"
                          y2="45"
                          stroke="rgba(34,211,238,0.2)"
                          strokeDasharray="4 4"
                        />
                        <motion.path
                          d="M 0 115 C 35 115, 55 12, 95 18 C 135 24, 155 68, 195 40 C 235 28, 265 50, 400 45"
                          fill="none"
                          stroke="#22D3EE"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: false, amount: 0.4 }}
                          transition={{ duration: 1.3, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="flex items-center justify-between text-[11.5px] text-zinc-300">
                        <span>شبیه‌ساز زندهٔ معادله دیفرانسیل فنر</span>
                        <span className="text-cyan-300">باز کردن اسیلوسکوپ ←</span>
                      </div>
                    </button>
                  )}

                  {/* Visual Stage 3: 4,023 Skills Pillar Selector */}
                  {ch.visualType === "vault" && (
                    <div className="rounded-[28px] border border-violet-400/25 bg-gradient-to-b from-violet-500/[0.08] to-[#090B11] p-6 sm:p-7">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[12px] font-bold text-violet-200">
                          انتخاب مستقیم دستهٔ مهارت (۱۱ ستون):
                        </span>
                        <span className="font-mono text-[10.5px] text-violet-300">
                          {faNum(DESIGN_LAB_TOTAL_FILES)} FILES
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {DESIGN_LAB_PILLARS.slice(0, 6).map((pillar) => (
                          <button
                            key={pillar.id}
                            type="button"
                            onClick={() => openPillarInSkills(pillar.id)}
                            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/35 px-3.5 py-2.5 text-start text-[11.5px] text-zinc-200 transition-all hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white"
                          >
                            <span className="truncate">{pillar.titleFa}</span>
                            <span className="ms-2 shrink-0 font-mono text-[10px] text-violet-300">
                              {faNum(pillar.totalFiles)}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => openPillarInSkills("all")}
                        className="mt-3 w-full rounded-xl border border-violet-400/30 bg-violet-500/15 py-2.5 text-center text-[11.5px] font-bold text-violet-200 transition-colors hover:bg-violet-500/25"
                      >
                        مشاهده هر ۱۱ ستون و ۴۶ زیرشاخه ←
                      </button>
                    </div>
                  )}

                  {/* Visual Stage 4: Components, Sound, Shaders & AI Portals */}
                  {ch.visualType === "engines" && (
                    <div className="grid grid-cols-2 gap-3 rounded-[28px] border border-emerald-400/25 bg-gradient-to-b from-emerald-500/[0.07] to-[#090B11] p-5 sm:p-6">
                      {[
                        {
                          title: "استودیو کامپوننت",
                          sub: "۴٬۱۹۹ سورس + ۶ ویجت",
                          path: "/studio/components",
                          color: "#34D399",
                        },
                        {
                          title: "استودیو صدا",
                          sub: "۲۰۰ رسیپی + خروجی WAV",
                          path: "/studio/sounds",
                          color: "#FB7185",
                        },
                        {
                          title: "آزمایشگاه شیدر",
                          sub: "۱۸ شیدر + شیشه مایع",
                          path: "/studio/engines",
                          color: "#38BDF8",
                        },
                        {
                          title: "کارگاه هوش مصنوعی",
                          sub: "پرامپت‌ساز + QLoRA",
                          path: "/studio/ai",
                          color: "#E879F9",
                        },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            soundEngine.playTick(1.05);
                            navigate(item.path);
                          }}
                          className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-start transition-all hover:-translate-y-0.5 hover:border-white/25"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="mt-5">
                            <div className="text-[13px] font-bold text-white">{item.title}</div>
                            <div className="mt-0.5 text-[10.5px] text-zinc-400">{item.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* =====================================================================
         SCENE 04: MINIMAL HORIZON FOOTER DOCK (ورود هماهنگ از بالا و کناره‌ها)
         ===================================================================== */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-6 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={SPRING_SILK}
          className="rounded-[32px] border border-white/[0.08] bg-[#090B12] px-6 py-12 sm:px-12"
        >
          <span className="font-mono text-[10px] tracking-[0.22em] text-zinc-500">
            DIRECT STUDIO ACCESS
          </span>
          <h2 className="mt-2 font-hasti text-[26px] text-white sm:text-[32px]">
            مستقیم وارد استودیوی مورد نظر خود شوید
          </h2>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {QUICK_STUDIOS.map((st, idx) => {
              const Icon = st.icon;
              return (
                <motion.button
                  key={st.path}
                  type="button"
                  initial={{
                    opacity: 0,
                    x: idx % 2 === 0 ? 60 : -60,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ ...SPRING_SNAPPY, delay: idx * 0.05 }}
                  onClick={() => {
                    soundEngine.playTick(1.05);
                    navigate(st.path);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[12px] font-medium text-zinc-200 transition-all hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: st.accent }} />
                  <span>{st.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
