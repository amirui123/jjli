import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Compass,
  Gauge,
  Layers,
  Palette,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { DESIGN_LAB_PILLARS, DESIGN_LAB_TOTAL_FILES } from "../data/designLabManifest";
import { SHADERS } from "../engines/shaderLab";
import { navigate } from "../lib/router";
import { ACCENTS, useAppSettings, writePersisted } from "../lib/store";
import { faNum } from "../lib/format";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

const SPRING_DECK = {
  type: "spring" as const,
  stiffness: 115,
  damping: 20,
  mass: 0.88,
};

interface RadialTelemetryItem {
  id: string;
  code: string;
  label: string;
  sub: string;
  valueStr: string;
  percent: number;
  color: string;
  path: string;
  icon: React.ElementType;
}

const RADIAL_TELEMETRY: RadialTelemetryItem[] = [
  {
    id: "vault",
    code: "VAULT · 11 PILLARS",
    label: "اسکیل‌ها و بلوپرینت‌ها",
    sub: "۱۱ ستون و ۴۶ زیرشاخه تخصصی",
    valueStr: faNum(DESIGN_LAB_TOTAL_FILES),
    percent: 94,
    color: "#A78BFA",
    path: "/studio/skills",
    icon: BookOpen,
  },
  {
    id: "components",
    code: "REGISTRY · 13 PACKS",
    label: "سورس کامپوننت‌های بومی",
    sub: "۱۳ رجیستری متن‌باز + ۶ ویجت",
    valueStr: faNum(TOOLKIT_STATS.components),
    percent: 88,
    color: "#34D399",
    path: "/studio/components",
    icon: Layers,
  },
  {
    id: "fonts",
    code: "ATELIER · VARIABLE",
    label: "خانواده فونت فارسی",
    sub: "نستعلیق، نمایشی و رابط کاربری",
    valueStr: faNum(TOOLKIT_STATS.fonts),
    percent: 82,
    color: "#E8B33A",
    path: "/studio/fonts",
    icon: Type,
  },
  {
    id: "audio-shader",
    code: "SYNTH & GPU · 120HZ",
    label: "صداهای رویه‌ای و شیدر",
    sub: `${faNum(TOOLKIT_STATS.sounds)} صدا + ${faNum(SHADERS.length)} شیدر WebGL`,
    valueStr: faNum(TOOLKIT_STATS.sounds + SHADERS.length),
    percent: 79,
    color: "#22D3EE",
    path: "/studio/sounds",
    icon: Waves,
  },
];

interface StudioDeckItem {
  id: string;
  num: string;
  code: string;
  title: string;
  tagline: string;
  desc: string;
  path: string;
  accent: string;
  icon: React.ElementType;
  metrics: { k: string; v: string }[];
}

const STUDIO_DECK: StudioDeckItem[] = [
  {
    id: "skills",
    num: "۰۱",
    code: "CODEX WORKBENCH",
    title: "استودیو ۴٬۰۲۳ اسکیل و دانش",
    tagline: "کاوشگر درختی ۱۱ ستون، ۴۶ زیرشاخه و ۸۴ سیستم برند",
    desc: "انتخاب دسته و زیرشاخه، مطالعه زندهٔ مستندات و کدها، ساخت سیستم‌پرامپت سفارشی و دانلود مستقیم.",
    path: "/studio/skills",
    accent: "#A78BFA",
    icon: BookOpen,
    metrics: [
      { k: "کل فایل‌های مخزن", v: faNum(DESIGN_LAB_TOTAL_FILES) },
      { k: "زیرشاخه موضوعی", v: "۴۶ دسته" },
      { k: "سیستم‌های برند", v: `${faNum(TOOLKIT_STATS.brands)} برند` },
    ],
  },
  {
    id: "fonts",
    num: "۰۲",
    code: "OPTICAL ATELIER",
    title: "آتلیه تایپوگرافی و فونت",
    tagline: "کالیبراسیون نوری حروف، محور GRAD و بدون پرش (Zero-CLS)",
    desc: "تست جملهٔ دلخواه روی ۵۰ فونت فارسی، تنظیم طلاکوبی، فاصله کلمات، کلیدهای OpenType و دانلود WOFF2.",
    path: "/studio/fonts",
    accent: "#E8B33A",
    icon: Type,
    metrics: [
      { k: "خانواده فونت", v: `${faNum(TOOLKIT_STATS.fonts)} فونت` },
      { k: "کنترل نوری", v: "۱۶ پارامتر" },
      { k: "خروجی", v: "WOFF2 + CSS" },
    ],
  },
  {
    id: "motion",
    num: "۰۳",
    code: "120HZ OSCILLOSCOPE",
    title: "استودیو فیزیک حرکت و فنر",
    tagline: "شبیه‌سازی عددی معادلات دیفرانسیل مرتبه دوم",
    desc: "تنظیم سختی، میرایی، جرم، پرش عمودی و چرخش سه‌بعدی با خروجی آماده Framer Motion و CSS linear().",
    path: "/studio/motion",
    accent: "#22D3EE",
    icon: Gauge,
    metrics: [
      { k: "نرخ شبیه‌سازی", v: "۱۲۰ هرتز" },
      { k: "پریست‌های آماده", v: "۲۰ رسیپی" },
      { k: "خروجی کد", v: "۴ فرمت" },
    ],
  },
  {
    id: "components",
    num: "۰۴",
    code: "BLUEPRINT REGISTRY",
    title: "استودیو کامپوننت و سورس",
    tagline: "۶ ویجت پرچم‌دار ایرانی + کاوشگر ۴٬۱۹۹ فایل سورس",
    desc: "کارت بانکی شتاب سه‌بعدی، تقویم جلالی، داک مغناطیسی و شخصی‌سازی شعاع Squircle و شیشه مات.",
    path: "/studio/components",
    accent: "#34D399",
    icon: Layers,
    metrics: [
      { k: "فایل سورس", v: faNum(TOOLKIT_STATS.components) },
      { k: "رجیستری متن‌باز", v: "۱۳ مخزن" },
      { k: "ویجت بومی", v: "۶ ویجت" },
    ],
  },
  {
    id: "sounds",
    num: "۰۵",
    code: "ACOUSTIC SYNTH DAW",
    title: "استودیو صدای رویه‌ای",
    tagline: "سینت‌سایزر Web Audio و سکوئنسر ریتم اقلیدسی",
    desc: "طراحی صدا بدون فایل خارجی با کنترل زیر و بمی، فیلتر، ریورب، پن استریو و رندر مستقیم WAV.",
    path: "/studio/sounds",
    accent: "#FB7185",
    icon: Waves,
    metrics: [
      { k: "رسیپی صوتی", v: `${faNum(TOOLKIT_STATS.sounds)} صدا` },
      { k: "سکوئنسر", v: "اقلیدسی E(k,n)" },
      { k: "خروجی", v: "16-Bit WAV" },
    ],
  },
  {
    id: "engines",
    num: "۰۶",
    code: "SHADER & RTL DECK",
    title: "آزمایشگاه شیدر و ممیزی RTL",
    tagline: "۱۸ شیدر زندهٔ GLSL + عدسی شیشه مایع اسنل",
    desc: "کنترل ضریب شکست نور (IOR)، پراکندگی کروماتیک کوشی، بازتاب فرنل و اصلاح خودکار باگ‌های RTL.",
    path: "/studio/engines",
    accent: "#38BDF8",
    icon: Sparkles,
    metrics: [
      { k: "شیدرهای GPU", v: `${faNum(SHADERS.length)} شیدر` },
      { k: "اپتیک عدسی", v: "Snell + Fresnel" },
      { k: "ممیزی کد", v: "۱۰ قاعده RTL" },
    ],
  },
  {
    id: "ai",
    num: "۰۷",
    code: "NEURAL FORGE",
    title: "کارگاه هوش مصنوعی و QLoRA",
    tagline: "سیستم‌پرامپت‌ساز تخصصی RTL و دیتاست آموزش مدل",
    desc: "مونتاژ پرامپت برای Claude و Cursor، مرور ۴۰ جفت داده طلایی و تولید اسکریپت train_qlora.py.",
    path: "/studio/ai",
    accent: "#E879F9",
    icon: Brain,
    metrics: [
      { k: "جفت داده طلایی", v: "۴۰ نمونه" },
      { k: "مدل‌های پایه", v: "۴ مدل" },
      { k: "کوانتیزاسیون", v: "4-Bit NF4" },
    ],
  },
];

export const Dashboard: React.FC = () => {
  const { settings, update } = useAppSettings();
  const [activeStudioId, setActiveStudioId] = useState<string>("skills");
  const [animKey, setAnimKey] = useState<number>(0);

  const activeStudio = useMemo(
    () => STUDIO_DECK.find((s) => s.id === activeStudioId) ?? STUDIO_DECK[0],
    [activeStudioId]
  );

  const todayJalali = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch {
      return "امروز";
    }
  }, []);

  const openPillarDirect = (pillarId: string) => {
    soundEngine.playTick(1.08);
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

  return (
    <div
      key={animKey}
      className="mx-auto max-w-6xl space-y-16 overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10"
    >
      {/* =====================================================================
         SECTION 1: AVIONICS TELEMETRY HEADER
         - Status bar drops from TOP (y: -60 -> 0)
         - Main Title slides from RIGHT (x: 140 -> 0)
         - Live Theme & Audio Controller slides from LEFT (x: -140 -> 0)
         ===================================================================== */}
      <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#080A11] p-6 sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-65"
          style={{
            background:
              "radial-gradient(75% 95% at 85% 0%, rgba(var(--accent-glow),0.14), transparent 65%)",
          }}
        />

        {/* Top-Dropping Status Strip */}
        <motion.div
          initial={{ opacity: 0, y: -55, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={SPRING_DECK}
          className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4"
        >
          <div className="flex items-center gap-2.5 text-[11px] text-zinc-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <span className="font-mono tracking-[0.18em] text-[color:var(--accent)]">
              ORBITAL TELEMETRY DECK
            </span>
            <span className="text-zinc-600">·</span>
            <span>{todayJalali}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTick(1.15);
              setAnimKey((k) => k + 1);
            }}
            aria-label="پخش مجدد انیمیشن‌ها"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10.5px] text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <RotateCcw className="h-3 w-3 text-[color:var(--accent)]" />
            <span>پخش مجدد انیمیشن‌ها</span>
          </button>
        </motion.div>

        {/* Side-Converging Header Body */}
        <div className="relative z-10 mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Right Wing: Title & Intro sliding in from RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 140, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ ...SPRING_DECK, delay: 0.12 }}
            className="lg:col-span-7"
          >
            <h1 className="font-hasti text-[32px] leading-tight text-white sm:text-[44px]">
              عرشهٔ فرماندهی و رصدخانهٔ آزمایشگاه
            </h1>
            <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-zinc-400">
              نمای یکپارچهٔ تمام دارایی‌ها، کنترل زندهٔ رنگ و صدای پلتفرم و دسترسی سریع به ۷ میز کار
              مهندسی.
            </p>
          </motion.div>

          {/* Left Wing: Live Hardware Theme & Sound Console sliding in from LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -140, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ ...SPRING_DECK, delay: 0.22 }}
            className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md lg:col-span-5"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                <Palette className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                <span>کالیبراسیون آنی رنگ و صدای محیط:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !settings.sound;
                  update({ sound: next });
                  if (next) soundEngine.playSuccess();
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10.5px] transition-all",
                  settings.sound
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                    : "border-white/10 bg-white/[0.03] text-zinc-400"
                )}
              >
                {settings.sound ? (
                  <Volume2 className="h-3 w-3 text-emerald-300" />
                ) : (
                  <VolumeX className="h-3 w-3" />
                )}
                <span>{settings.sound ? "صدا: فعال" : "صدا: خاموش"}</span>
              </button>
            </div>

            {/* 6 Live Accent Orbs */}
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {ACCENTS.map((ac) => {
                const active = settings.accent === ac.id;
                return (
                  <button
                    key={ac.id}
                    type="button"
                    onClick={() => {
                      update({ accent: ac.id });
                      soundEngine.playTick(1.1);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] transition-all",
                      active
                        ? "border-white/50 bg-white/10 font-bold text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/20"
                    )}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ backgroundColor: ac.hex }}
                    >
                      {active && <Check className="h-2.5 w-2.5 text-black" />}
                    </span>
                    <span>{ac.labelFa}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
         SECTION 2: 4 ANIMATED RADIAL TELEMETRY GAUGES
         - Cards drop from TOP & glide from SIDES with animated SVG rings
         ===================================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RADIAL_TELEMETRY.map((item, idx) => {
          const Icon = item.icon;
          const radius = 34;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference * (1 - item.percent / 100);

          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{
                opacity: 0,
                y: -55,
                x: idx % 2 === 0 ? 70 : -70,
                filter: "blur(10px)",
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
                filter: "blur(0px)",
              }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...SPRING_DECK, delay: idx * 0.07 }}
              onClick={() => {
                soundEngine.playTick(1.05);
                navigate(item.path);
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#090B12] p-5 text-start transition-all hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] tracking-[0.16em] text-zinc-500">
                  {item.code}
                </span>
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>

              {/* Animated SVG Radial Gauge + Number */}
              <div className="my-5 flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 84 84" className="h-20 w-20 -rotate-90">
                    <circle
                      cx="42"
                      cy="42"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="5"
                    />
                    <motion.circle
                      cx="42"
                      cy="42"
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      whileInView={{ strokeDashoffset: dashOffset }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 1.2, delay: 0.15 + idx * 0.08, ease: "easeOut" }}
                    />
                  </svg>
                  <span
                    className="absolute font-mono text-[11px] font-bold"
                    style={{ color: item.color }}
                  >
                    {faNum(item.percent)}٪
                  </span>
                </div>

                <div>
                  <div className="font-mono text-[28px] font-bold leading-none text-white">
                    {item.valueStr}
                  </div>
                  <div className="mt-1.5 text-[12.5px] font-semibold text-zinc-200">
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-zinc-500">{item.sub}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-zinc-400 group-hover:text-white">
                <span>باز کردن میز کار</span>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </motion.button>
          );
        })}
      </section>

      {/* =====================================================================
         SECTION 3: INTERACTIVE HOLOGRAPHIC STUDIO COMMAND MATRIX
         - Header drops from TOP
         - Studio Selector Rail slides from RIGHT (x: 130 -> 0)
         - Live Holographic Stage slides from LEFT (x: -130 -> 0)
         ===================================================================== */}
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={SPRING_DECK}
          className="flex flex-wrap items-end justify-between gap-2 px-1"
        >
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-[color:var(--accent)]">
              INTERACTIVE WORKBENCH MATRIX
            </span>
            <h2 className="mt-1 font-hasti text-[25px] text-white sm:text-[30px]">
              کنسول انتخاب و پیش‌نمایش زندهٔ ۷ استودیو
            </h2>
          </div>
          <span className="text-[12px] text-zinc-400">
            روی هر استودیو کلیک یا هاور کنید تا مشخصات تله‌متری آن در صحنهٔ سمت چپ باز شود
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Right Column (5 cols): 7 Studio Selector Rows sliding from RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 130, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.2 }}
            transition={SPRING_DECK}
            className="space-y-2 lg:col-span-5"
          >
            {STUDIO_DECK.map((st) => {
              const Icon = st.icon;
              const active = st.id === activeStudio.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onMouseEnter={() => setActiveStudioId(st.id)}
                  onClick={() => {
                    soundEngine.playTick(1.05);
                    if (activeStudioId === st.id) {
                      navigate(st.path);
                    } else {
                      setActiveStudioId(st.id);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-start transition-all",
                    active
                      ? "border-white/25 bg-white/[0.07] text-white shadow-lg"
                      : "border-white/[0.06] bg-[#090B12] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: `${st.accent}40`,
                        backgroundColor: `${st.accent}15`,
                        color: st.accent,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-bold text-white">{st.title}</div>
                      <div className="truncate text-[11px] text-zinc-400">{st.tagline}</div>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-zinc-500">{st.num}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Left Column (7 cols): Live Holographic Inspector Stage sliding from LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -130, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ ...SPRING_DECK, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStudio.id}
                initial={{ opacity: 0, y: -24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#090C14] p-6 sm:p-8"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-35"
                  style={{
                    background: `radial-gradient(80% 80% at 20% 0%, ${activeStudio.accent}33, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-widest"
                      style={{
                        borderColor: `${activeStudio.accent}50`,
                        backgroundColor: `${activeStudio.accent}18`,
                        color: activeStudio.accent,
                      }}
                    >
                      {activeStudio.code} · {activeStudio.num}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400" dir="ltr">
                      ROUTE: {activeStudio.path}
                    </span>
                  </div>

                  <h3 className="mt-5 font-hasti text-[28px] text-white sm:text-[34px]">
                    {activeStudio.title}
                  </h3>
                  <p
                    className="mt-2 text-[14px] font-medium"
                    style={{ color: activeStudio.accent }}
                  >
                    {activeStudio.tagline}
                  </p>
                  <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-zinc-300">
                    {activeStudio.desc}
                  </p>

                  {/* 3 Animated Metric Plinths inside the Holographic Stage */}
                  <div className="mt-7 grid grid-cols-3 gap-3">
                    {activeStudio.metrics.map((m, i) => (
                      <motion.div
                        key={m.k}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-2xl border border-white/[0.07] bg-black/40 p-3.5"
                      >
                        <div className="text-[10.5px] text-zinc-400">{m.k}</div>
                        <div
                          className="mt-1 font-mono text-[18px] font-bold text-white"
                          style={{ color: i === 0 ? activeStudio.accent : undefined }}
                        >
                          {m.v}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSuccess();
                      navigate(activeStudio.path);
                    }}
                    style={{ backgroundColor: activeStudio.accent }}
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[13px] font-bold text-[#05060A] shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <span>ورود مستقیم به {activeStudio.title}</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span>ذخیره خودکار تنظیمات در مرورگر فعال است</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
         SECTION 4: ANIMATED 11-PILLAR KNOWLEDGE SPECTRUM
         - Bars animate width on scroll; clicking opens that Pillar in SkillsStudio
         ===================================================================== */}
      <section className="rounded-[30px] border border-white/[0.08] bg-[#080A11] p-6 sm:p-9">
        <motion.div
          initial={{ opacity: 0, y: -45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={SPRING_DECK}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-violet-300">
              11-PILLAR VAULT SPECTRUM · {faNum(DESIGN_LAB_TOTAL_FILES)} FILES
            </span>
            <h2 className="mt-1 font-hasti text-[24px] text-white sm:text-[28px]">
              طیف زندهٔ ۱۱ ستون دانش و مهارت‌ها
            </h2>
          </div>
          <button
            type="button"
            onClick={() => openPillarDirect("all")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-[11.5px] font-bold text-violet-200 hover:bg-violet-500/25"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>باز کردن کاوشگر کامل ۴٬۰۲۳ اسکیل</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {DESIGN_LAB_PILLARS.map((pillar, idx) => {
            const ratio = Math.max(8, Math.min(100, Math.round((pillar.totalFiles / 850) * 100)));
            return (
              <motion.button
                key={pillar.id}
                type="button"
                initial={{
                  opacity: 0,
                  x: idx % 2 === 0 ? 80 : -80,
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ ...SPRING_DECK, delay: idx * 0.04 }}
                onClick={() => openPillarDirect(pillar.id)}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-start transition-all hover:border-violet-400/45 hover:bg-violet-500/[0.06]"
              >
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate font-bold text-zinc-100 group-hover:text-white">
                    <span className="me-2 font-mono text-[10.5px] text-violet-300">
                      {pillar.code}
                    </span>
                    {pillar.titleFa}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-zinc-400">
                    {faNum(pillar.totalFiles)} فایل · {faNum(pillar.subcategories.length)} زیرشاخه
                  </span>
                </div>

                {/* Animated Progress Spectrum Bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${ratio}%` }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.9, delay: 0.1 + idx * 0.04, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-l from-violet-400 via-cyan-400 to-[color:var(--accent)]"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
