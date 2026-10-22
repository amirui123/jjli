import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  Brain,
  CheckCircle2,
  Cpu,
  Gauge,
  LayoutDashboard,
  Palette,
  Sparkles,
  Type,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import { TOOLKIT_STATS, TOOLKIT_SKILL_SLUGS } from "../data/toolkitStats";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { IRANIAN_BANKS } from "../engines/persianEngines";
import { navigate, useRouter } from "../lib/router";
import { ACCENTS, useAppSettings } from "../lib/store";
import { Panel, Segmented, cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

const TOTAL_COMPONENTS = TOOLKIT_STATS.components;

const CARD_META = [
  {
    id: "fonts",
    path: "/studio/fonts",
    title: "فونت",
    en: "Typography",
    desc: `${PERSIAN_FONT_CATALOG.length} خانواده، نستعلیق تا متغیر`,
    icon: Type,
    accent: "#E8B33A",
    stat: `${PERSIAN_FONT_CATALOG.length}`,
    unit: "خانواده",
  },
  {
    id: "motion",
    path: "/studio/motion",
    title: "موشن",
    en: "Physics",
    desc: "فنر، منحنی و کد زنده",
    icon: Zap,
    accent: "#22D3EE",
    stat: "∞",
    unit: "پیکربندی",
  },
  {
    id: "components",
    path: "/studio/components",
    title: "کامپوننت",
    en: "Registry",
    desc: "سورس واقعی ۱۲ کتابخانه",
    icon: Boxes,
    accent: "#5EEAD4",
    stat: TOTAL_COMPONENTS.toLocaleString("fa-IR"),
    unit: "فایل",
  },
  {
    id: "sounds",
    path: "/studio/sounds",
    title: "صدا",
    en: "Synth",
    desc: "افکت‌های سینتز و WAV",
    icon: Waves,
    accent: "#FB7185",
    stat: `${TOOLKIT_STATS.sounds}`,
    unit: "افکت",
  },
  {
    id: "skills",
    path: "/studio/skills",
    title: "اسکیل",
    en: "Standards",
    desc: "مهارت‌ها و سیستم برندها",
    icon: BookOpen,
    accent: "#A78BFA",
    stat: `${TOOLKIT_STATS.skills}`,
    unit: "اسکیل",
  },
  {
    id: "engines",
    path: "/studio/engines",
    title: "موتور",
    en: "Engines",
    desc: "فین‌تک، RTL و شیدر",
    icon: Cpu,
    accent: "#34D399",
    stat: `${IRANIAN_BANKS.length}`,
    unit: "بانک",
  },
  {
    id: "ai",
    path: "/studio/ai",
    title: "هوش مصنوعی",
    en: "QLoRA",
    desc: "پرامپت، دیتاست، آموزش",
    icon: Brain,
    accent: "#F472B6",
    stat: "40",
    unit: "جفت داده",
  },
];

const MiniVisual: React.FC<{ id: string; accent: string }> = ({ id, accent }) => {
  if (id === "fonts")
    return (
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span className="font-hasti text-[22px] leading-none text-zinc-200">هستی</span>
        <span className="font-nastaliq text-[17px] leading-none text-zinc-400">نستعلیق</span>
        <span className="font-morabba text-[16px] leading-none text-zinc-600">مربع</span>
      </div>
    );
  if (id === "motion")
    return (
      <div className="relative h-8 overflow-hidden rounded-md bg-black/40">
        <motion.span
          animate={{ scaleX: [0.08, 0.98, 0.08] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          className="absolute start-0 top-1/2 h-4 w-full origin-right -translate-y-1/2 rounded-lg"
          style={{ background: accent, opacity: 0.85 }}
        />
      </div>
    );
  if (id === "sounds")
    return (
      <div className="flex h-8 items-center gap-[3px]">
        {[0.3, 0.7, 0.45, 1, 0.6, 0.85, 0.35, 0.65, 0.9, 0.5, 0.75, 0.4, 0.95, 0.55, 0.7, 0.3].map(
          (h, i) => (
            <motion.span
              key={i}
              animate={{ scaleY: [h, h * 0.35, h] }}
              transition={{ duration: 1.1 + i * 0.07, repeat: Infinity, ease: "easeInOut" }}
              className="w-full origin-center rounded-sm"
              style={{ height: `${h * 100}%`, background: accent, opacity: 0.75 }}
            />
          )
        )}
      </div>
    );
  if (id === "engines")
    return (
      <div className="flex gap-1">
        {IRANIAN_BANKS.slice(0, 10).map((b) => (
          <span
            key={b.id}
            className="h-6 flex-1 rounded"
            style={{ background: b.accentHex, opacity: 0.85 }}
          />
        ))}
      </div>
    );
  if (id === "components")
    return (
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="h-2 rounded-[2px]"
            style={{ background: accent, opacity: 0.15 + (i % 6) * 0.12 }}
          />
        ))}
      </div>
    );
  if (id === "skills")
    return (
      <div className="flex flex-wrap gap-1">
        {TOOLKIT_SKILL_SLUGS.slice(0, 9).map((slug) => (
          <span
            key={slug}
            className="rounded border border-white/[0.07] px-1 py-0.5 font-mono text-[7.5px] text-zinc-500"
            dir="ltr"
          >
            {slug.slice(0, 9)}
          </span>
        ))}
      </div>
    );
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
      ))}
      <span className="ms-1 font-mono text-[9px] text-zinc-600">training-ready</span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { settings, update, accent } = useAppSettings();
  const { meta } = useRouter();

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    []
  );

  const totalSkills = TOOLKIT_STATS.skills;
  const totalBrands = TOOLKIT_STATS.brands;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">DASHBOARD</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            داشبورد
          </h1>
          <p className="mt-1 text-[12px] text-zinc-500">{today} · همه استودیوها در یک نگاه</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-[10.5px] text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            همه موتورها فعال
          </span>
          <span className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 font-mono text-[10px] text-zinc-500">
            {meta.labelEn}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CARD_META.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035, duration: 0.3 }}
                onClick={() => {
                  soundEngine.playSnap();
                  navigate(c.path);
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-3.5 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: `radial-gradient(120% 100% at 100% 0%, ${c.accent}16, transparent 60%)` }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                    style={{ borderColor: `${c.accent}30`, background: `${c.accent}10`, color: c.accent }}
                  >
                    <c.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-end">
                    <span className="block font-mono text-[16px] leading-none text-zinc-100">{c.stat}</span>
                    <span className="mt-0.5 block text-[9px] text-zinc-600">{c.unit}</span>
                  </span>
                </div>

                <div className="relative mt-3">
                  <MiniVisual id={c.id} accent={c.accent} />
                </div>

                <div className="relative mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[12.5px] font-bold text-white">
                      {c.title}
                      <span className="ms-1.5 font-mono text-[9px] font-normal text-zinc-600">
                        {c.en}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">{c.desc}</div>
                  </div>
                  <ArrowLeft className="h-3.5 w-3.5 text-zinc-600 transition-all group-hover:-translate-x-1 group-hover:text-[color:var(--accent)]" />
                </div>
              </motion.button>
            ))}

            <button
              onClick={() => navigate("/")}
              className="flex flex-col justify-between rounded-2xl border border-dashed border-white/[0.09] bg-transparent p-3.5 text-start transition-colors hover:border-[color:var(--accent)]/40"
            >
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              <div>
                <div className="text-[12.5px] font-bold text-white">صفحه معرفی</div>
                <div className="mt-0.5 text-[10px] text-zinc-500">بازگشت به نمای معرفی</div>
              </div>
            </button>
          </div>

          <Panel
            title="وضعیت خزانه"
            subtitle="همه اعداد مستقیماً از دارایی‌های واقعی مخزن خوانده می‌شوند"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { k: "کامپوننت", v: TOTAL_COMPONENTS },
                { k: "رجیستری", v: TOOLKIT_STATS.registries.length },
                { k: "فونت", v: PERSIAN_FONT_CATALOG.length },
                { k: "اسکیل", v: totalSkills },
                { k: "برند", v: totalBrands },
                { k: "صدا", v: TOOLKIT_STATS.sounds },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="font-mono text-[17px] leading-none text-zinc-100">
                    {x.v.toLocaleString("fa-IR")}
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500">{x.k}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1.5">
              {TOOLKIT_STATS.registries.map((r) => {
                const pct = (r.total / TOTAL_COMPONENTS) * 100;
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="w-40 shrink-0 truncate font-mono text-[9.5px] text-zinc-500" dir="ltr">
                      {r.id}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 1.5)}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="block h-full rounded-full bg-[color:var(--accent)]/70"
                      />
                    </span>
                    <span className="w-9 shrink-0 text-end font-mono text-[9.5px] text-zinc-600">
                      {r.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="تنظیمات سریع" subtitle="روی همه استودیوها اثر می‌گذارد">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Palette className="h-3 w-3" />
                  رنگ پلتفرم
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        update({ accent: a.id, customAccent: null });
                        soundEngine.playTick(1.1);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] transition-colors",
                        settings.accent === a.id
                          ? "border-white/30 text-white"
                          : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.hex }} />
                      {a.labelFa}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Gauge className="h-3 w-3" />
                  شدت حرکت
                </div>
                <Segmented
                  className="w-full"
                  value={String(settings.motionLevel) as "1" | "2" | "3"}
                  onChange={(v) => update({ motionLevel: Number(v) as 1 | 2 | 3 })}
                  options={[
                    { value: "1", label: "کم" },
                    { value: "2", label: "معمول" },
                    { value: "3", label: "کامل" },
                  ]}
                />
                <button
                  onClick={() => update({ reduceMotion: !settings.reduceMotion })}
                  className={cn(
                    "mt-2 w-full rounded-lg border px-2 py-1.5 text-[10.5px] transition-colors",
                    settings.reduceMotion
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {settings.reduceMotion ? "کاهش حرکت: فعال" : "کاهش حرکت: غیرفعال"}
                </button>
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Type className="h-3 w-3" />
                  فونت تیتر
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { k: "font-hasti", l: "هستی" },
                    { k: "font-nastaliq", l: "نستعلیق" },
                    { k: "font-kahroba", l: "کهربا" },
                    { k: "font-morabba", l: "مربع" },
                  ].map((f) => (
                    <button
                      key={f.k}
                      onClick={() => update({ displayFont: f.k })}
                      className={cn(
                        "rounded-lg border py-1.5 text-[12px] transition-colors",
                        f.k,
                        settings.displayFont === f.k
                          ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-white"
                          : "border-white/[0.07] text-zinc-400 hover:text-white"
                      )}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const next = !settings.sound;
                  soundEngine.enabled = next;
                  update({ sound: next });
                  if (next) soundEngine.playSuccess();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-[10.5px] transition-colors",
                  settings.sound
                    ? "border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                    : "border-white/[0.07] text-zinc-500"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3 w-3" />
                  صدای رابط
                </span>
                <span>{settings.sound ? "روشن" : "خاموش"}</span>
              </button>
            </div>
          </Panel>

          <Panel tone="inset" title="میان‌بر صفحه‌کلید">
            <div className="space-y-1.5 text-[10.5px] text-zinc-500">
              {[
                ["⌘K / Ctrl K", "جستجوی سریع بخش‌ها"],
                ["Esc", "بستن پنجره‌ها"],
                ["کلیک روی تیتر", "پخش دوباره حرکت"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <kbd className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                    {k}
                  </kbd>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: `${accent.hex}33`,
              background: `linear-gradient(140deg, ${accent.hex}12, transparent 70%)`,
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: accent.hex }} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-zinc-300">
              همه تنظیمات به‌صورت محلی ذخیره می‌شوند؛ بدون حساب کاربری و بدون ارسال داده.
            </p>
            <p className="mt-1 text-[10px] text-zinc-600">localStorage · آفلاین</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
