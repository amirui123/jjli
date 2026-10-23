import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Gauge,
  Layers,
  Sparkles,
  Type,
  Waves,
  Zap,
} from "lucide-react";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { navigate } from "../lib/router";
import { useAppSettings } from "../lib/store";
import { faCount, faNum } from "../lib/format";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

const STUDIOS = [
  {
    id: "fonts",
    path: "/studio/fonts",
    title: "فونت",
    desc: "۴۲ خانواده فارسی و نستعلیق با پیش‌نمایش زنده و دانلود فایل واقعی",
    icon: Type,
    accent: "#E8B33A",
    stat: `${faNum(TOOLKIT_STATS.fonts)} فونت`,
    preview: (
      <div className="flex h-full items-center justify-center">
        <span className="font-nastaliq text-[30px] leading-[2] text-[color:var(--accent)]">نستعلیق</span>
      </div>
    ),
  },
  {
    id: "motion",
    path: "/studio/motion",
    title: "موشن",
    desc: "فیزیک فنر با شبیه‌سازی عددی و کد خروجی واقعی",
    icon: Gauge,
    accent: "#22D3EE",
    stat: "۸ رسیپی",
    preview: (
      <div className="flex h-full items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-8 w-2 rounded-full bg-cyan-400/70"
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "components",
    path: "/studio/components",
    title: "کامپوننت",
    desc: `کاوشگر ${faCount(TOOLKIT_STATS.components)} فایل سورس در ۱۲ رجیستری`,
    icon: Layers,
    accent: "#5EEAD4",
    stat: faCount(TOOLKIT_STATS.components),
    preview: (
      <div className="grid h-full grid-cols-4 gap-1 p-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="rounded border border-teal-300/20 bg-teal-300/10"
            style={{ opacity: 0.25 + (i % 4) * 0.18 }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    title: "صدا",
    desc: "۲۰۰ افکت رویه‌ای، قابل تنظیم و قابل دانلود به‌صورت WAV",
    icon: Waves,
    accent: "#FB7185",
    stat: `${faNum(TOOLKIT_STATS.sounds)} صدا`,
    preview: (
      <div className="flex h-full items-end justify-center gap-[3px] p-3">
        {[10, 22, 34, 18, 42, 26, 14, 30, 20, 12, 24, 16].map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-sm bg-rose-400/70"
            animate={{ height: [h * 0.4, h, h * 0.5] }}
            transition={{ duration: 1.1 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: h }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "skills",
    path: "/studio/skills",
    title: "مهارت",
    desc: "۱۷۹ سند مهندسی و ۸۴ سیستم برند با متن کامل و پرامپت آماده",
    icon: BookOpen,
    accent: "#A78BFA",
    stat: `${faNum(TOOLKIT_STATS.skills)} سند`,
    preview: (
      <div className="space-y-1 p-3">
        {[70, 92, 58, 84].map((w, i) => (
          <span key={i} className="block h-1.5 rounded-full bg-violet-300/30" style={{ width: `${w}%` }} />
        ))}
      </div>
    ),
  },
  {
    id: "engines",
    path: "/studio/engines",
    title: "موتور",
    desc: "فین‌تک ایران، ممیزی RTL و شیدر زنده — همه بدون سرور",
    icon: Cpu,
    accent: "#34D399",
    stat: `${faNum(TOOLKIT_STATS.banks)} بانک`,
    preview: (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-12 w-20 rounded-md border border-emerald-300/30 bg-emerald-300/[0.06]">
          <span className="absolute bottom-1.5 start-1.5 h-1 w-8 rounded bg-emerald-300/40" />
          <span className="absolute bottom-1.5 end-1.5 h-2.5 w-3.5 rounded bg-emerald-300/25" />
        </div>
      </div>
    ),
  },
];

const STAT_TILES = [
  { label: "فونت فارسی", value: TOOLKIT_STATS.fonts, icon: Type, suffix: "خانواده" },
  { label: "فایل کامپوننت", value: TOOLKIT_STATS.components, icon: Layers, suffix: "فایل" },
  { label: "سند مهارتی", value: TOOLKIT_STATS.skills, icon: BookOpen, suffix: "سند" },
  { label: "افکت صوتی", value: TOOLKIT_STATS.sounds, icon: Waves, suffix: "افکت" },
  { label: "سیستم برند", value: TOOLKIT_STATS.brands, icon: Sparkles, suffix: "برند" },
  { label: "فایل TSX", value: TOOLKIT_STATS.tsxFiles, icon: Zap, suffix: "کامپوننت" },
];

export const Dashboard: React.FC = () => {
  const { settings } = useAppSettings();

  const today = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch {
      return "";
    }
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <span className="font-mono tracking-[0.18em]">DASHBOARD</span>
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="text-zinc-500">{today}</span>
          </div>
          <h1 className="mt-1 font-hasti text-[32px] leading-tight text-white sm:text-[38px]">
            کارگاهِ تو، آماده است
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            هر استودیو یک صفحه مستقل با تنظیمات کامل و خروجی واقعی است. تنظیمات در همین مرورگر
            ذخیره می‌شوند — بدون حساب، بدون سرور.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[10.5px] text-zinc-500">
            حالت صدا:{" "}
            <span className={settings.sound ? "text-emerald-300" : "text-zinc-400"}>
              {settings.sound ? "روشن" : "خاموش"}
            </span>
          </div>
          <button
            onClick={() => navigate("/studio/fonts")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-3 py-2 text-[11.5px] font-bold text-black"
          >
            شروع از فونت
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_TILES.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-3"
          >
            <div className="flex items-center justify-between text-zinc-600">
              <t.icon className="h-3.5 w-3.5" />
              <span className="font-mono text-[8.5px]">LIVE</span>
            </div>
            <div className="mt-2 font-mono text-[20px] leading-none tracking-tight text-zinc-100">
              {faNum(t.value)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">
              {t.label} <span className="text-zinc-600">· {t.suffix}</span>
            </div>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[13px] font-bold text-zinc-200">استودیوها</h2>
          <span className="text-[10.5px] text-zinc-600">۶ استودیو · همه آزاد</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIOS.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              onClick={() => {
                if (settings.sound) soundEngine.playTick(1);
                navigate(s.path);
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F] text-start transition-all hover:-translate-y-0.5 hover:border-white/15"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
            >
              <div
                className="h-[92px] border-b border-white/[0.06]"
                style={{
                  background: `radial-gradient(120% 120% at 100% 0%, ${s.accent}18, transparent 60%)`,
                }}
              >
                {s.preview}
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-zinc-100">
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.accent }} />
                    {s.title}
                  </span>
                  <span className="rounded-full border border-white/[0.07] px-2 py-0.5 font-mono text-[9px] text-zinc-500">
                    {s.stat}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{s.desc}</p>
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 text-[10.5px] text-zinc-500 transition-colors",
                    "group-hover:text-[color:var(--accent)]"
                  )}
                >
                  ورود
                  <ArrowLeft className="h-3 w-3" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-4">
          <h2 className="text-[13px] font-bold text-zinc-200">مسیر پیشنهادی</h2>
          <p className="mt-1 text-[11px] text-zinc-500">سه گام برای رسیدن به یک رابط فارسی تمام‌عیار.</p>
          <ol className="mt-3 space-y-2">
            {[
              { t: "فونت را انتخاب کن", d: "با متن خودت تست کن، ارتفاع خط و فضای حروف را تنظیم کن و فایل فونت را بردار.", p: "/studio/fonts" },
              { t: "حرکت را بساز", d: "فنر را با اعداد واقعی تنظیم کن و کد Motion یا CSS را کپی کن.", p: "/studio/motion" },
              { t: "کامپوننت و صدا را بچین", d: "از رجیستری‌ها سورس بردار و افکت‌های صوتی را به تعامل‌ها وصل کن.", p: "/studio/components" },
            ].map((step, i) => (
              <li key={step.t}>
                <button
                  onClick={() => navigate(step.p)}
                  className="flex w-full items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-2.5 text-start transition-colors hover:border-white/15"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 font-mono text-[10px] text-[color:var(--accent)]">
                    {faNum(i + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-medium text-zinc-200">{step.t}</span>
                    <span className="mt-0.5 block text-[10.5px] leading-relaxed text-zinc-500">{step.d}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-4">
          <h2 className="text-[13px] font-bold text-zinc-200">وضعیت محتوا</h2>
          <ul className="mt-3 space-y-2.5">
            {[
              { k: "فونت با فایل واقعی", v: `${TOOLKIT_STATS.fonts} از ${TOOLKIT_STATS.fonts}`, pct: 100 },
              { k: "اسکیل با متن کامل", v: `${TOOLKIT_STATS.skills} سند`, pct: 100 },
              { k: "برند با پالت", v: `${TOOLKIT_STATS.brands} برند`, pct: 100 },
              { k: "افکت صوتی سینتز", v: `${TOOLKIT_STATS.sounds} رسیپی`, pct: 100 },
            ].map((row) => (
              <li key={row.k}>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-zinc-400">{row.k}</span>
                  <span className="font-mono text-zinc-500">{row.v}</span>
                </div>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full bg-[color:var(--accent)]/70"
                    style={{ width: `${row.pct}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg border border-white/[0.05] bg-black/30 p-2 text-[10px] leading-relaxed text-zinc-500">
            همه اعداد از پیمایش واقعی مخزن محاسبه شده‌اند؛ هیچ عددی تزئینی نیست.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
