import React, { useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowLeft,
  Boxes,
  BookOpen,
  Cpu,
  Download,
  Gauge,
  Layers,
  Sparkles,
  Type,
  Volume2,
  Waves,
} from "lucide-react";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { TOOLKIT_SKILL_SLUGS, TOOLKIT_STATS } from "../data/toolkitStats";
import { FEATURED_SOUNDS } from "../data/featuredSounds";
import { IRANIAN_BANKS } from "../engines/persianEngines";
import { navigate } from "../lib/router";
import { useAppSettings, writePersisted } from "../lib/store";
import { soundEngine } from "../engines/soundEngine";
import { faCount, faNum } from "../lib/format";
import { cn } from "../ui/kit";

const HEADLINE = ["حرکت،", "زبانِ", "رابطِ", "فارسی", "است"];

const FEATURED_FONTS = [
  { id: "iran-nastaliq", word: "نستعلیق", family: '"IranNastaliq", serif', note: "خوشنویسی" },
  { id: "hasti", word: "هستی", family: '"Hasti", sans-serif', note: "نمایشی" },
  { id: "morabba", word: "مربع", family: '"Morabba", sans-serif', note: "متغیر" },
  { id: "kahroba", word: "کهربا", family: '"Kahroba FD", sans-serif', note: "۳محوره" },
  { id: "darvish", word: "درویش", family: '"Darvish", serif', note: "دست‌نویس" },
  { id: "vazirmatn", word: "وزیرمتن", family: '"Vazirmatn", sans-serif', note: "متن" },
];

/** real pair count of public/ai/dataset.json (kept in sync by the generator) */
const AI_DATASET_PAIRS = 40;

const STUDIO_CARDS = [
  {
    id: "fonts",
    path: "/studio/fonts",
    title: "استودیو فونت",
    desc: `${TOOLKIT_STATS.fonts} خانواده فارسی، نستعلیق و نمایشی — با تنظیمات کامل و دانلود فایل واقعی فونت.`,
    count: `${faNum(TOOLKIT_STATS.fonts)} خانواده`,
    icon: Type,
    accent: "#E8B33A",
  },
  {
    id: "motion",
    path: "/studio/motion",
    title: "استودیو موشن",
    desc: "فیزیک فنر، منحنی بیزی و شبیه‌سازی عددی؛ کد خروجی همان چیزی است که می‌بینید.",
    count: "۸ رسیپی",
    icon: Gauge,
    accent: "#22D3EE",
  },
  {
    id: "components",
    path: "/studio/components",
    title: "استودیو کامپوننت",
    desc: `کاوشگر سورس واقعی ${faNum(TOOLKIT_STATS.registries.length)} رجیستری متن‌باز با دانلود فایل و کیت.`,
    count: `${faNum(TOOLKIT_STATS.components)} فایل`,
    icon: Layers,
    accent: "#5EEAD4",
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    title: "استودیو صدا",
    desc: `${faNum(TOOLKIT_STATS.sounds)} افکت رویه‌ای با Web Audio — قابل تنظیم، پخش و دانلود WAV.`,
    count: `${faNum(TOOLKIT_STATS.sounds)} رسیپی`,
    icon: Waves,
    accent: "#FB7185",
  },
  {
    id: "skills",
    path: "/studio/skills",
    title: "استودیو مهارت",
    desc: `${faNum(TOOLKIT_STATS.skills)} سند مهارتی و ${faNum(TOOLKIT_STATS.brands)} سیستم برند، با متن کامل و پرامپت آماده.`,
    count: `${faNum(TOOLKIT_STATS.skills)} اسکیل`,
    icon: BookOpen,
    accent: "#A78BFA",
  },
  {
    id: "engines",
    path: "/studio/engines",
    title: "استودیو موتور",
    desc: "فین‌تک ایران، ممیزی RTL و شیدر — همه در مرزگر و بدون سرور.",
    count: `${faNum(IRANIAN_BANKS.length)} بانک`,
    icon: Cpu,
    accent: "#34D399",
  },
  {
    id: "ai",
    path: "/studio/ai",
    title: "استودیو هوش مصنوعی",
    desc: `${faNum(AI_DATASET_PAIRS)} جفت‌داده آموزش، QLoRA و بنچمارک — آماده تریس برای مدل‌های فارسی.`,
    count: `${faNum(AI_DATASET_PAIRS)} جفت‌داده`,
    icon: Sparkles,
    accent: "#F472B6",
  },
];

const Marquee: React.FC<{ items: string[]; reverse?: boolean; duration: number }> = ({
  items,
  reverse,
  duration,
}) => (
  <div className="marquee-mask overflow-hidden py-1">
    <div
      className="marquee-track gap-2"
      data-reverse={reverse ? "true" : undefined}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      {[...items, ...items].map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-[11px] text-zinc-400"
        >
          {t}
        </span>
      ))}
    </div>
  </div>
);

const SpecimenStack: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [fontIdx, setFontIdx] = useState(0);

  const fonts = useMemo(() => PERSIAN_FONT_CATALOG.filter((f) => f.category !== "code").slice(0, 7), []);
  const activeFont = fonts[fontIdx % fonts.length];

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((e.clientY - r.top) / r.height - 0.5) * -8,
          y: ((e.clientX - r.left) / r.width - 0.5) * 10,
        });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative space-y-3"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(var(--accent-glow),0.18),transparent_70%)] blur-2xl" />

        <div className="rounded-2xl border border-white/[0.08] bg-[#0C0C0F]/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-500">SPECIMEN</span>
            <button
              onClick={() => setFontIdx((i) => i + 1)}
              className="tap-target rounded-md border border-white/10 px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
            >
              فونت بعدی ←
            </button>
          </div>
          <div
            className="mt-3 text-center text-[34px] leading-[1.6] text-white transition-[font-family] duration-300"
            style={{ fontFamily: activeFont.family }}
          >
            زیبایی در جزئیات است
          </div>
          <div className="mt-1 flex items-center justify-between text-[9.5px] text-zinc-500">
            <span>{activeFont.nameFa}</span>
            <span className="font-mono" dir="ltr">
              {activeFont.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0C0C0F]/95 p-3 shadow-xl">
            <div className="flex items-center justify-between text-[9px] text-zinc-500">
              <span className="font-mono">SPRING</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <motion.button
              whileHover={{ scale: 1.06, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              onClick={() => soundEngine.playSnap()}
              className="mt-3 w-full rounded-xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 py-2 text-[11px] text-[color:var(--accent)]"
            >
              دکمه مغناطیسی
            </motion.button>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0C0C0F]/95 p-3 shadow-xl">
            <div className="flex items-center justify-between text-[9px] text-zinc-500">
              <span className="font-mono">AUDIO</span>
              <Volume2 className="h-3 w-3" />
            </div>
            <div className="mt-2 flex h-9 items-end gap-[2px]">
              {[6, 12, 20, 32, 24, 14, 8, 16, 28, 18, 10, 5].map((h, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-sm bg-rose-400/70"
                  animate={{ height: [h * 0.5, h, h * 0.6] }}
                  transition={{ duration: 1.2 + i * 0.06, repeat: Infinity, ease: "easeInOut" }}
                  style={{ height: h }}
                />
              ))}
            </div>
            <button
              onClick={() => soundEngine.playRecipe(FEATURED_SOUNDS[0])}
              className="mt-2 w-full rounded-lg border border-white/10 py-1 text-[9.5px] text-zinc-400 hover:text-white"
            >
              پخش {FEATURED_SOUNDS[0]?.id ?? "sound"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


const MagneticTile: React.FC = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 });

  return (
    <div
      className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * 60);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 40);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.button
        style={{ x: sx, y: sy }}
        whileTap={{ scale: 0.94 }}
        onClick={() => soundEngine.playSnap()}
        className="rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-5 py-2.5 text-[12.5px] font-bold text-[color:var(--accent)]"
      >
        دکمه مغناطیسی
      </motion.button>
      <span className="absolute bottom-2.5 start-3 font-mono text-[9px] text-zinc-600">useSpring</span>
    </div>
  );
};

const SpringStack: React.FC = () => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-[74px] w-[150px] rounded-xl border border-white/10 bg-gradient-to-br from-[#1A1A20] to-[#0D0D11]"
          animate={{
            y: hover ? -i * 12 : i * 10,
            rotate: hover ? (i - 1) * 5 : (i - 1) * 2,
            scale: hover ? 1 - i * 0.04 : 1 - i * 0.06,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22, delay: i * 0.03 }}
          style={{ zIndex: 3 - i }}
        >
          <span className="absolute bottom-2 start-2 font-mono text-[8.5px] text-zinc-600">card {i + 1}</span>
        </motion.div>
      ))}
      <span className="absolute bottom-2.5 start-3 font-mono text-[9px] text-zinc-600">stagger + spring</span>
    </div>
  );
};

const KineticTile: React.FC = () => {
  const [run, setRun] = useState(0);
  const words = ["حرکت", "با", "وزن", "و", "معنا"];
  return (
    <button
      onClick={() => {
        setRun((r) => r + 1);
        soundEngine.playTick(1);
      }}
      className="relative flex h-[150px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F]"
    >
      <span key={run} className="flex flex-wrap justify-center gap-1.5 px-3">
        {words.map((w, i) => (
          <motion.span
            key={`${run}-${w}-${i}`}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 22 }}
            className="font-hasti text-[19px] text-zinc-100"
          >
            {w}
          </motion.span>
        ))}
      </span>
      <span className="absolute bottom-2.5 start-3 font-mono text-[9px] text-zinc-600">click to replay</span>
    </button>
  );
};

const MotionTeaser: React.FC = () => (
  <section>
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="font-hasti text-[22px] leading-tight text-white sm:text-[26px]">حرکت را لمس کن</h2>
        <p className="mt-1 text-[12px] text-zinc-500">
          سه نمونه واقعی با فیزیک فنر؛ همان چیزی که در استودیو موشن قابل تنظیم است.
        </p>
      </div>
      <button
        onClick={() => navigate("/studio/motion")}
        className="text-[11px] text-[color:var(--accent)] hover:underline"
      >
        باز کردن استودیو موشن
      </button>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MagneticTile />
      <SpringStack />
      <KineticTile />
    </div>
  </section>
);

export const Landing: React.FC = () => {
  const { settings } = useAppSettings();
  const [copied, setCopied] = useState(false);

  const skillTitles = useMemo(() => TOOLKIT_SKILL_SLUGS, []);
  const firstRow = useMemo(() => skillTitles.slice(0, 34), [skillTitles]);
  const secondRow = useMemo(() => skillTitles.slice(34, 68), [skillTitles]);
  const componentTotal = TOOLKIT_STATS.components;

  return (
    <div className="space-y-16 pb-6 sm:space-y-20">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative -mx-4 overflow-hidden px-4 pb-2 pt-4 sm:-mx-6 sm:px-6">
        <div
          className="pointer-events-none absolute -top-32 start-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-[color:var(--accent)]/10 aurora-blob"
          aria-hidden
        />
        <div className="pointer-events-none absolute -top-14 end-0 -z-10 h-[320px] w-[320px] rounded-full bg-[#6366F1]/10 aurora-blob" aria-hidden />

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10.5px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              کاملاً رایگان · بدون حساب کاربری · همه‌چیز در مرورگر
            </div>

            <h1 className="mt-4 font-hasti text-[31px] leading-[1.35] text-white sm:text-[46px] lg:text-[58px]">
              {HEADLINE.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.06 * i, type: "spring", stiffness: 220, damping: 24 }}
                  className={cn("inline-block", i === 3 && "text-[color:var(--accent)]")}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              className="mt-4 max-w-xl text-[13px] leading-relaxed text-zinc-400 sm:text-[13.5px]"
            >
              یک آزمایشگاه مهندسی کامل برای رابط‌های فارسی: {faNum(TOOLKIT_STATS.fonts)} خانواده فونت،
              فیزیک حرکت با شبیه‌سازی واقعی، {faCount(componentTotal)} فایل کامپوننت متن‌باز،{" "}
              {faNum(TOOLKIT_STATS.sounds)} افکت صوتی و {faNum(TOOLKIT_STATS.skills)} سند
              مهارتی — همه با استودیوی اختصاصی، تنظیمات کامل و خروجی قابل دانلود.
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  if (settings.sound) soundEngine.playSuccess();
                  navigate("/dashboard");
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-[12.5px] font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                ورود به داشبورد
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={() => navigate("/studio/fonts")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-[12.5px] text-zinc-200 transition-colors hover:border-white/25"
              >
                <Type className="h-4 w-4" />
                امتحان فونت‌ها
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    soundEngine.playTick(1.2);
                    window.setTimeout(() => setCopied(false), 1600);
                  } catch {
                    /* ignore */
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-[11.5px] text-zinc-500 transition-colors hover:text-zinc-200"
              >
                {copied ? "کپی شد" : "اشتراک لینک"}
              </button>
            </div>

            <dl className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {[
                { k: "فونت فارسی", v: faNum(TOOLKIT_STATS.fonts) },
                { k: "فایل کامپوننت", v: faCount(componentTotal) },
                { k: "اسکیل مهندسی", v: faNum(TOOLKIT_STATS.skills) },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <dt className="text-[10px] text-zinc-500">{s.k}</dt>
                  <dd className="font-mono text-[18px] tracking-tight text-zinc-100">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <SpecimenStack />
        </div>
      </section>

      {/* ---------------------------------------------------------- marquee */}
      <section className="space-y-2">
        <div className="flex items-end justify-between">
          <h2 className="text-[12px] text-zinc-500">
            {faNum(TOOLKIT_STATS.skills)} سند مهارتی مستند — از Awwwards تا شیدر و شادcn
          </h2>
          <button
            onClick={() => navigate("/studio/skills")}
            className="text-[11px] text-[color:var(--accent)] hover:underline"
          >
            همه را ببین
          </button>
        </div>
        <Marquee items={firstRow} duration={58} />
        <Marquee items={secondRow} reverse duration={70} />
      </section>

      {/* ----------------------------------------------------------- studios */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-hasti text-[24px] leading-tight text-white sm:text-[26px]">
              {faNum(STUDIO_CARDS.length)} استودیو، یک زبان طراحی
            </h2>
            <p className="mt-1 text-[12px] text-zinc-500">
              هر بخش صفحه مستقل، تنظیمات کامل و خروجی واقعی دارد — نه دموی تزئینی.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-white"
          >
            نمای داشبورد
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIO_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              onClick={() => navigate(card.path)}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-4 text-start transition-colors hover:border-white/15"
            >
              <span
                className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `${card.accent}33` }}
              />
              <div className="flex items-start justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl border"
                  style={{ borderColor: `${card.accent}33`, background: `${card.accent}12`, color: card.accent }}
                >
                  <card.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full border border-white/[0.07] px-2 py-0.5 font-mono text-[9px] text-zinc-500">
                  {card.count}
                </span>
              </div>
              <h3 className="mt-3 text-[14px] font-bold text-zinc-100">{card.title}</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-zinc-500">{card.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[10.5px] text-zinc-500 transition-colors group-hover:text-[color:var(--accent)]">
                ورود به استودیو
                <ArrowLeft className="h-3 w-3" />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <MotionTeaser />

      {/* ------------------------------------------------------------- fonts */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-hasti text-[22px] leading-tight text-white sm:text-[26px]">فونت‌هایی که واقعاً فارسی‌اند</h2>
            <p className="mt-1 text-[12px] text-zinc-500">
              نستعلیق، خوشنویسی، نمایشی و متغیر — هر کدام با فایل واقعی و پیش‌نمایش زنده.
            </p>
          </div>
          <button
            onClick={() => navigate("/studio/fonts")}
            className="text-[11px] text-[color:var(--accent)] hover:underline"
          >
            استودیو فونت
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURED_FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                // hand the choice to the font studio through its own persisted key
                writePersisted<{ fontId: string }>("studio-fonts", { fontId: f.id });
                navigate("/studio/fonts");
              }}
              className="group rounded-2xl border border-white/[0.07] bg-[#0B0B0E] p-3 text-center transition-all hover:-translate-y-1 hover:border-[color:var(--accent)]/30"
            >
              <div
                className="text-[26px] leading-[1.9] text-zinc-100 transition-colors group-hover:text-[color:var(--accent)]"
                style={{ fontFamily: f.family }}
              >
                {f.word}
              </div>
              <div className="mt-1 text-[9.5px] text-zinc-500">{f.note}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ motion */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0E0E12] to-[#08080A] p-5 sm:p-6">
          <span className="font-mono text-[9.5px] tracking-[0.2em] text-[color:var(--accent)]">REAL PHYSICS</span>
          <h2 className="mt-2 font-hasti text-[24px] leading-tight text-white sm:text-[30px]">
            حرکت را با ریاضی بساز، نه با حدس
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
            استودیو موشن فنر را عددی انتگرال می‌گیرد: زمان نشست، نسبت میرایی، فراجهش و منحنی
            واقعی. همان اعداد داخل کد و کیت دانلودی قرار می‌گیرند.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (settings.sound) soundEngine.playSpring();
                navigate("/studio/motion");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-3 py-2 text-[11.5px] text-[color:var(--accent)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ساختن حرکت
            </button>
            <button
              onClick={() => navigate("/studio/components")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-[11.5px] text-zinc-400 hover:text-white"
            >
              <Boxes className="h-3.5 w-3.5" />
              دیدن کامپوننت‌ها
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { t: "دانلود واقعی", d: "فایل فونت، TSX، WAV و ZIP — بدون لینک الکی", i: Download },
            { t: `${faNum(TOOLKIT_STATS.fonts)} فونت بومی`, d: "از ایران‌نستعلیق تا کهربای سه‌محوره", i: Type },
            { t: "بدون سرور", d: "همه پردازش‌ها در مرورگر شما", i: Cpu },
            { t: "RTL-first", d: "کلاس‌های منطقی، اعداد فارسی، نیم‌فاصله", i: Sparkles },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <f.i className="h-4 w-4 text-[color:var(--accent)]" />
              <div className="mt-2 text-[11.5px] font-bold text-zinc-200">{f.t}</div>
              <div className="mt-0.5 text-[10.5px] leading-relaxed text-zinc-500">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- cta */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0B0B0E] px-5 py-10 text-center sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute inset-0 -z-0 opacity-70">
          <div className="absolute start-1/4 top-0 h-56 w-56 rounded-full bg-[color:var(--accent)]/12 aurora-blob" />
          <div className="absolute end-1/4 bottom-0 h-52 w-52 rounded-full bg-[#6366F1]/12 aurora-blob" />
        </div>
        <div className="relative">
          <p className="font-nastaliq text-[22px] leading-[2] text-[color:var(--accent)] sm:text-[32px]">
            هر چه بسازی، از آنِ خودت است
          </p>
          <h2 className="mt-2 font-hasti text-[25px] leading-tight text-white sm:text-[36px]">
            همین حالا شروع کن — بدون ثبت‌نام
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[12px] leading-relaxed text-zinc-500">
            همه استودیوها آزادند. تنظیمات ذخیره می‌شوند، خروجی‌ها واقعی‌اند و هیچ سطح پولی وجود ندارد.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-[12.5px] font-bold text-black"
            >
              رفتن به داشبورد
            </button>
            <button
              onClick={() => navigate("/studio/components")}
              className="rounded-xl border border-white/12 px-4 py-2.5 text-[12px] text-zinc-300 hover:border-white/25"
            >
              مرور کامپوننت‌ها
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
