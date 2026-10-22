import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Boxes,
  LayoutDashboard,
  Play,
  Sparkles,
  Type,
  Waves,
  Zap,
} from "lucide-react";
import { TOOLKIT_STATS, TOOLKIT_SKILL_SLUGS, FEATURED_SOUNDS } from "../data/toolkitStats";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { navigate } from "../lib/router";
import { useAppSettings } from "../lib/store";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

const HERO_WORDS = ["حرکت،", "زبانِ", "رابطِ", "فارسی", "است"];

const FEATURED_FONTS = [
  { id: "hasti", label: "هستی", className: "font-hasti", note: "نمایشی و هنری" },
  { id: "iran-nastaliq", label: "ایران نستعلیق", className: "font-nastaliq", note: "خوشنویسی اصیل" },
  { id: "kahroba", label: "کهربا", className: "font-kahroba", note: "متغیر و گرم" },
  { id: "morabba", label: "مربع", className: "font-morabba", note: "تیتر مدرن" },
  { id: "doran", label: "دوران", className: "font-doran", note: "خوانا و نرم" },
  { id: "yekanbakh", label: "یکان‌بخ", className: "font-yekanbakh", note: "رابط کاربری" },
];

const STUDIOS = [
  {
    id: "fonts",
    path: "/studio/fonts",
    title: "استودیو فونت",
    desc: `${PERSIAN_FONT_CATALOG.length} خانواده، کنترل کامل وزن و فاصله، خروجی CSS و React`,
    icon: Type,
    accent: "#E8B33A",
    stat: `${PERSIAN_FONT_CATALOG.length} فونت`,
  },
  {
    id: "motion",
    path: "/studio/motion",
    title: "استودیو موشن",
    desc: "شبیه‌سازی واقعی فنر، منحنی زمان و کد آماده",
    icon: Zap,
    accent: "#22D3EE",
    stat: "فیزیک زنده",
  },
  {
    id: "components",
    path: "/studio/components",
    title: "استودیو کامپوننت",
    desc: "سورس واقعی ۴,۱۹۷ فایل در ۱۲ رجیستری متن‌باز",
    icon: Boxes,
    accent: "#5EEAD4",
    stat: "۴٬۱۹۷ فایل",
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    title: "استودیو صدا",
    desc: "۲۰۰ افکت سینتز، شکل موج واقعی و خروجی WAV",
    icon: Waves,
    accent: "#FB7185",
    stat: "۲۰۰ صدا",
  },
];

export const Landing: React.FC = () => {
  const { settings, motionScale } = useAppSettings();
  const reduce = useReducedMotion();
  const [replay, setReplay] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || reduce) return;
    let raf = 0;
    let next = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      next = {
        x: (e.clientX - r.left) / r.width - 0.5,
        y: (e.clientY - r.top) / r.height - 0.5,
      };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (tiltRef.current) {
          tiltRef.current.style.transform = `perspective(1000px) rotateX(${(-next.y * 6).toFixed(
            2
          )}deg) rotateY(${(next.x * 8).toFixed(2)}deg)`;
        }
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const marqueeSkills = TOOLKIT_SKILL_SLUGS.slice(0, 34);

  const stats = [
    { v: "۴٬۱۹۷", l: "فایل کامپوننت واقعی", s: "۱۲ رجیستری" },
    { v: PERSIAN_FONT_CATALOG.length.toLocaleString("fa-IR"), l: "خانواده فونت فارسی", s: "نستعلیق تا مدرن" },
    { v: TOOLKIT_STATS.skills.toLocaleString("fa-IR"), l: "اسکیل مهندسی", s: "SKILL.md" },
    { v: TOOLKIT_STATS.brands.toLocaleString("fa-IR"), l: "سیستم طراحی برند", s: "DESIGN.md" },
    { v: TOOLKIT_STATS.sounds.toLocaleString("fa-IR"), l: "افکت صوتی", s: "Web Audio" },
    { v: "۱۸", l: "بانک ایرانی", s: "فین‌تک" },
  ];

  return (
    <div className="space-y-20 pb-8">
      {/* ------------------------------------------------------------- hero */}
      <section ref={heroRef} className="relative -mx-4 overflow-hidden px-4 pb-6 pt-6 sm:-mx-6 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="aurora-blob absolute -top-40 start-1/4 h-[420px] w-[420px] rounded-full opacity-40 blur-[110px]"
            style={{ background: "rgba(var(--accent-glow),0.35)" }}
          />
          <div
            className="aurora-blob absolute -top-20 end-1/5 h-[360px] w-[360px] rounded-full opacity-30 blur-[120px]"
            style={{ background: "rgba(99,102,241,0.45)", animationDelay: "-8s" }}
          />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-[10.5px] text-zinc-400 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--accent)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            </span>
            صددرصد رایگان · متن‌باز · بدون سطح پولی
          </motion.div>

          <h1
            key={replay}
            onClick={() => {
              setReplay((r) => r + 1);
              soundEngine.playSpring();
            }}
            className={cn(
              "mx-auto mt-7 flex cursor-pointer flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[42px] leading-[1.35] text-white sm:text-[64px] lg:text-[78px]",
              settings.displayFont
            )}
          >
            {HERO_WORDS.map((word, i) => (
              <motion.span
                key={`${replay}-${i}`}
                initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  type: "spring",
                  stiffness: 220 * motionScale,
                  damping: 26,
                  delay: i * 0.07,
                }}
                className={cn(
                  "inline-block",
                  i === 2 && "accent-gradient",
                  i === 4 && "font-nastaliq text-[0.96em] leading-[1.6]"
                )}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-[13px] leading-[2] text-zinc-400 sm:text-[14px]"
          >
            یک آزمایشگاه کامل برای ساخت رابط‌های فارسی: تایپوگرافی نستعلیق و هستی،
            فیزیک حرکت واقعی، ۴٬۱۹۷ کامپوننت متن‌باز، ۲۰۰ افکت صوتی و موتورهای
            فین‌تک ایران — همه در مرورگر، بدون سرور و بدون هزینه.
          </motion.p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playSnap();
                navigate("/dashboard");
              }}
              className="group flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-[12.5px] font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ boxShadow: "0 12px 40px -14px rgba(var(--accent-glow),0.9)" }}
            >
              <LayoutDashboard className="h-4 w-4" />
              ورود به داشبورد
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => {
                soundEngine.playSnap();
                navigate("/studio/fonts");
              }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-[12.5px] text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
            >
              <Type className="h-4 w-4" />
              آزمایش فونت‌ها
            </button>
            <button
              onClick={() => soundEngine.playRecipe(FEATURED_SOUNDS[3] ?? FEATURED_SOUNDS[0], { gain: 1.1 })}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-[12.5px] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <Play className="h-3.5 w-3.5" />
              یک صدا بشنو
            </button>
          </div>

          {/* floating specimen */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 24 }}
            className="relative mx-auto mt-12 max-w-3xl"
          >
            <div
              ref={tiltRef}
              style={{
                willChange: "transform",
                transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)",
              }}
              className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0B0B0E]/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  live-specimen
                </span>
                <span className="font-mono text-[9.5px] text-zinc-600" dir="ltr">
                  60fps · RTL
                </span>
              </div>
              <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden p-6">
                <div className="absolute inset-0 bg-engineering-grid opacity-40" />
                <div className="relative text-center">
                  <p className="font-nastaliq text-[30px] leading-[1.9] text-white sm:text-[38px]">
                    دوش دیدم که ملائک در میخانه زدند
                  </p>
                  <p className="mt-2 font-hasti text-[19px] text-[color:var(--accent)] sm:text-[22px]">
                    گل آدم بسرشتند و به پیمانه زدند
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] text-center [direction:ltr]">
                {["spring · 260/22", "fonts · 39", "components · 4197"].map((t) => (
                  <div key={t} className="px-2 py-2 font-mono text-[9.5px] text-zinc-500">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- stat strip */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center transition-colors hover:border-[color:var(--accent)]/30"
          >
            <div className="font-mono text-[20px] leading-none text-white">{s.v}</div>
            <div className="mt-1.5 text-[10.5px] text-zinc-400">{s.l}</div>
            <div className="mt-0.5 text-[9.5px] text-zinc-600">{s.s}</div>
          </div>
        ))}
      </section>

      {/* ----------------------------------------------------------- marquee */}
      <section className="relative -mx-4 overflow-hidden py-2 sm:-mx-6">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-r from-[#08080A] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-l from-[#08080A] to-transparent" />
        <div className="mb-3 flex items-center gap-2 px-4 text-[10.5px] text-zinc-500 sm:px-6">
          <Sparkles className="h-3 w-3 text-[color:var(--accent)]" />
          از میان {TOOLKIT_STATS.skills} اسکیل مهندسی
        </div>
        <div className="flex w-max marquee-track" style={{ ["--marquee-duration" as string]: "60s" }}>
          {[...marqueeSkills, ...marqueeSkills].map((s, i) => (
            <span
              key={i}
              className="mx-1 whitespace-nowrap rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] text-zinc-500"
              dir="ltr"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- studios */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-white sm:text-[24px]">
              چهار استودیوی مستقل
            </h2>
            <p className="mt-1 text-[12px] text-zinc-500">
              هر بخش تنظیمات، پیش‌نمایش و کد خروجی مخصوص خودش را دارد.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden items-center gap-1 text-[11.5px] text-[color:var(--accent)] hover:underline sm:flex"
          >
            همه بخش‌ها
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIOS.map((studio) => (
            <button
              key={studio.id}
              onClick={() => {
                soundEngine.playSnap();
                navigate(studio.path);
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-4 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(120% 100% at 100% 0%, ${studio.accent}18, transparent 60%)`,
                }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `${studio.accent}33`,
                    background: `${studio.accent}12`,
                    color: studio.accent,
                  }}
                >
                  <studio.icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-[9.5px] text-zinc-600">{studio.stat}</span>
              </div>
              <h3 className="relative mt-3 text-[14px] font-bold text-white">{studio.title}</h3>
              <p className="relative mt-1 text-[11px] leading-relaxed text-zinc-500">{studio.desc}</p>
              <span className="relative mt-3 flex items-center gap-1 text-[10.5px] text-zinc-500 transition-colors group-hover:text-[color:var(--accent)]">
                ورود به استودیو
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- fonts */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-white sm:text-[24px]">تایپوگرافی، ستون فقرات</h2>
            <p className="mt-1 text-[12px] text-zinc-500">
              از نستعلیق خوشنویسی تا فونت‌های متغیر رابط کاربری — همه با فایل واقعی.
            </p>
          </div>
          <button
            onClick={() => navigate("/studio/fonts")}
            className="hidden items-center gap-1 text-[11.5px] text-[color:var(--accent)] hover:underline sm:flex"
          >
            استودیو فونت
            <ArrowLeft className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_FONTS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => navigate("/studio/fonts")}
              className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0C0C0F] px-4 py-5 text-start transition-colors hover:border-[color:var(--accent)]/30"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] text-zinc-600">{f.note}</span>
                <span className="text-[9.5px] text-zinc-700">↗</span>
              </div>
              <div
                className={cn(
                  "mt-2 truncate text-[26px] text-zinc-100 transition-transform duration-300 group-hover:-translate-y-0.5",
                  f.className
                )}
              >
                {f.label}
              </div>
              <div className="mt-1 text-[13px] text-zinc-600">آزمایشگاه موشن فارسی</div>
            </button>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- cta */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0C0C0F] px-6 py-12 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-[520px] rounded-full opacity-40 blur-[100px]"
          style={{ background: "rgba(var(--accent-glow),0.5)" }}
        />
        <h2 className={cn("relative text-[26px] leading-[1.5] text-white sm:text-[34px]", settings.displayFont)}>
          همه‌چیز آماده است. فقط انتخاب کن.
        </h2>
        <p className="relative mx-auto mt-2 max-w-lg text-[12px] leading-relaxed text-zinc-500">
          {TOOLKIT_STATS.registries.length} رجیستری، {PERSIAN_FONT_CATALOG.length} فونت،{" "}
          {TOOLKIT_STATS.skills} اسکیل و {TOOLKIT_STATS.sounds} صدا —
          بدون ثبت‌نام، بدون محدودیت.
        </p>
        <div className="relative mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-[12.5px] font-bold text-black transition-transform hover:scale-[1.02]"
          >
            شروع از داشبورد
          </button>
          <button
            onClick={() => navigate("/studio/components")}
            className="rounded-xl border border-white/[0.12] px-5 py-2.5 text-[12.5px] text-zinc-200 hover:border-white/25"
          >
            مرور ۴٬۱۹۷ کامپوننت
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
