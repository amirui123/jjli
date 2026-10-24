import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Clapperboard,
  Command,
  Eye,
  Github,
  LayoutGrid,
  Palette,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { ROUTES, navigate, useRouter } from "../lib/router";
import { publicUrl } from "../lib/base";
import { ACCENTS, useAppSettings } from "../lib/store";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

const PSYCHOLOGY_NOTES: Record<string, string> = {
  saffron: "کانون گرم توجه · کنتراست طلایی",
  turquoise: "تله‌متری مهندسی · تمرکز آرام",
  lapis: "عمق شناختی · تفکر تحلیلی",
  emerald: "تعادل زیستی · تایید آنی",
  rose: "انرژی جنبشی · موج صوتی",
  violet: "خلاقیت فضایی · سنتز هوش مصنوعی",
};

const DISPLAY_FONTS = [
  { id: "font-hasti", label: "هستی (پیش‌فرض نمایشی)", sample: "هستی" },
  { id: "font-nastaliq", label: "ایران‌نستعلیق (خوشنویسی اصیل)", sample: "نستعلیق" },
  { id: "font-morabba", label: "مربع (هندسی مدرن)", sample: "مربع" },
  { id: "font-kahroba", label: "کهربا (متغیر سه‌محوره)", sample: "کهربا" },
  { id: "font-peyda", label: "پیدا (تایپوگرافی پوستری)", sample: "پیدا" },
];

/* ------------------------------------------------------------------ top bar */

const TopBar: React.FC = () => {
  const { meta } = useRouter();
  const { settings, update, reset, accent } = useAppSettings();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const lastHoverTickRef = useRef(0);

  const playSubtleHover = () => {
    if (!settings.sound || !soundEngine.isUnlocked()) return;
    const now = performance.now();
    if (now - lastHoverTickRef.current > 75) {
      lastHoverTickRef.current = now;
      soundEngine.playTick(0.6);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setPaletteOpen(false);
        setA11yOpen(false);
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="app-topbar sticky top-0 z-40 border-b border-white/[0.07] bg-[#05060A]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-3.5 sm:px-6">
          {/* RIGHT (START): Brand Emblem + Title + Live Telemetry */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (settings.sound) soundEngine.playSnap();
                navigate("/");
              }}
              onMouseEnter={playSubtleHover}
              className="group flex items-center gap-2.5 text-start"
              aria-label="آزمایشگاه موشن فارسی"
            >
              <span
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-[#141824] to-[#080A10] transition-transform duration-300 group-hover:scale-105"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.14), 0 0 26px -6px rgba(var(--accent-glow),0.75)",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(var(--accent-glow),0.32), transparent 70%)",
                  }}
                />
                <span className="font-hasti relative z-10 text-[16px] leading-none text-[color:var(--accent)]">
                  م
                </span>
              </span>
              <span>
                <span className="block text-[12.5px] font-bold leading-tight text-zinc-100 transition-colors group-hover:text-white">
                  آزمایشگاه موشن فارسی
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-wide text-zinc-500">
                  <span>RTL MOTION LAB</span>
                  <span className="hidden h-1 w-1 rounded-full bg-emerald-400 sm:inline-block" />
                  <span className="hidden text-[9px] text-emerald-400/90 sm:inline">60FPS</span>
                </span>
              </span>
            </button>
          </div>

          {/* CENTER: Desktop Magnetic Navigation Pill (Zero-Click Hover Tracking + Spring Active Pill) */}
          <nav
            aria-label="ناوبری اصلی دسکتاپ"
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden items-center gap-0.5 rounded-2xl border border-white/[0.08] bg-[#0B0D14]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] xl:flex"
          >
            {ROUTES.map((r) => {
              const active = meta.id === r.id;
              const isHovered = hoveredNav === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (settings.sound) soundEngine.playSnap();
                    navigate(r.path);
                  }}
                  onMouseEnter={() => {
                    setHoveredNav(r.id);
                    playSubtleHover();
                  }}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-150",
                    active ? "text-white" : "text-zinc-400 hover:text-zinc-100"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="topbar-active-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-xl border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/14"
                      style={{
                        boxShadow: "0 0 20px -6px rgba(var(--accent-glow),0.55)",
                      }}
                    />
                  )}
                  {!active && isHovered && (
                    <motion.span
                      layoutId="topbar-hover-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 36 }}
                      className="absolute inset-0 rounded-xl bg-white/[0.05]"
                    />
                  )}
                  <span
                    className="relative z-10 text-[11px]"
                    style={{ color: active ? r.accent : undefined }}
                  >
                    {r.glyph}
                  </span>
                  <span className="relative z-10">{r.shortFa}</span>
                </button>
              );
            })}
          </nav>

          {/* LEFT (END): Command Search, Accessibility Suite, Color Psychology, Intro Film, Sound & Mobile Sheet */}
          <div className="flex items-center gap-1.5">
            {/* Command Palette (⌘K) */}
            <button
              onClick={() => {
                if (settings.sound) soundEngine.playTick(1);
                setCmdOpen(true);
              }}
              onMouseEnter={playSubtleHover}
              aria-label="جستجوی سریع"
              className="tap-icon flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-zinc-300 transition-all hover:border-[color:var(--accent)]/40 hover:bg-white/[0.06] hover:text-white sm:h-8 sm:w-auto sm:gap-2 sm:px-2.5 sm:text-[11px]"
            >
              <Command className="h-3.5 w-3.5 text-[color:var(--accent)]" />
              <span className="hidden sm:inline">جستجو و پرش</span>
              <kbd className="hidden rounded border border-white/10 bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline">
                ⌘K
              </kbd>
            </button>

            {/* ACCESSIBILITY & SENSORY CALIBRATION MENU (منوی دسترسی‌پذیری و کالیبراسیون ادراکی) */}
            <div className="relative">
              <button
                onClick={() => {
                  if (settings.sound) soundEngine.playTick(1.1);
                  setPaletteOpen(false);
                  setA11yOpen((v) => !v);
                }}
                onMouseEnter={playSubtleHover}
                aria-label="منوی دسترسی‌پذیری و تنظیمات خوانایی"
                aria-expanded={a11yOpen}
                title="منوی دسترسی‌پذیری، فونت سراسری، کنتراست و شدت حرکت"
                className={cn(
                  "tap-icon flex h-8 items-center gap-1.5 rounded-xl border px-2 text-[11px] font-medium transition-all",
                  a11yOpen || settings.highContrast || settings.fontScale > 1 || settings.displayFont !== "font-hasti"
                    ? "border-[color:var(--accent)]/45 bg-[color:var(--accent)]/14 text-white"
                    : "border-white/[0.09] bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                )}
              >
                <Accessibility className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                <span className="hidden md:inline">دسترسی‌پذیری</span>
              </button>

              {a11yOpen && (
                <button
                  type="button"
                  aria-label="بستن منوی دسترسی‌پذیری"
                  tabIndex={-1}
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setA11yOpen(false)}
                />
              )}

              <AnimatePresence>
                {a11yOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="absolute end-0 top-10 z-50 w-[300px] overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14]/98 p-3.5 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:w-[320px]"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                          <Accessibility className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <div className="text-[12px] font-bold text-white">
                            دسترسی‌پذیری و کالیبراسیون
                          </div>
                          <div className="text-[9.5px] text-zinc-500">
                            تنظیم زندهٔ تایپوگرافی، حرکت، کنتراست و صدا
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playTick(0.9);
                          reset();
                        }}
                        title="بازنشانی به حالت استاندارد"
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400 hover:border-white/20 hover:text-white"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>بازنشانی</span>
                      </button>
                    </div>

                    <div className="mt-3 space-y-3.5">
                      {/* 1. Global Display Font Switcher */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[10.5px] text-zinc-400">
                          <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                            <Type className="h-3 w-3 text-[color:var(--accent)]" />
                            فونت تیترهای کل سایت
                          </span>
                          <span className="text-[9.5px] text-zinc-500">تغییر آنی</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {DISPLAY_FONTS.map((df) => {
                            const active = (settings.displayFont || "font-hasti") === df.id;
                            return (
                              <button
                                key={df.id}
                                type="button"
                                onClick={() => {
                                  soundEngine.playSnap();
                                  update({ displayFont: df.id });
                                }}
                                className={cn(
                                  "flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-start text-[11px] transition-all",
                                  active
                                    ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15 text-white"
                                    : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                                )}
                              >
                                <span className="truncate">{df.sample}</span>
                                {active && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Text Scale (Font Size Multiplier) */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
                          <span className="font-medium text-zinc-200">اندازه و خوانایی متن</span>
                          <span className="font-mono text-[10px] text-[color:var(--accent)]">
                            {settings.fontScale === 1.15
                              ? "۱۱۵٪"
                              : settings.fontScale === 1.08
                              ? "۱۰۸٪"
                              : "۱۰۰٪"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { v: 1 as const, l: "استاندارد ۱۰۰٪" },
                            { v: 1.08 as const, l: "درشت ۱۰۸٪" },
                            { v: 1.15 as const, l: "فوق‌خوانا ۱۱۵٪" },
                          ].map((opt) => {
                            const active = (settings.fontScale ?? 1) === opt.v;
                            return (
                              <button
                                key={opt.v}
                                type="button"
                                onClick={() => {
                                  soundEngine.playTick(1);
                                  update({ fontScale: opt.v });
                                }}
                                className={cn(
                                  "rounded-xl border py-1.5 text-center text-[10.5px] font-medium transition-all",
                                  active
                                    ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15 text-white"
                                    : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                                )}
                              >
                                {opt.l}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Motion Physics Intensity */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
                          <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                            <Zap className="h-3 w-3 text-cyan-400" />
                            شدت فیزیک و انیمیشن
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { level: 3 as const, reduce: false, label: "کامل ۶۰fps" },
                            { level: 2 as const, reduce: false, label: "ملایم" },
                            { level: 1 as const, reduce: true, label: "بدون حرکت" },
                          ].map((m) => {
                            const active =
                              m.reduce === settings.reduceMotion &&
                              (m.reduce || settings.motionLevel === m.level);
                            return (
                              <button
                                key={m.label}
                                type="button"
                                onClick={() => {
                                  soundEngine.playTick(1);
                                  update({ motionLevel: m.level, reduceMotion: m.reduce });
                                }}
                                className={cn(
                                  "rounded-xl border py-1.5 text-center text-[10.5px] font-medium transition-all",
                                  active
                                    ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200"
                                    : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                                )}
                              >
                                {m.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. High Contrast & Astigmatism Anti-Halation Mode */}
                      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-200">
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                            کنتراست بالا و مرزهای واضح
                          </div>
                          <div className="text-[9.5px] text-zinc-500">
                            مناسب مطالعهٔ طولانی و کاهش هالهٔ نوری
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playSnap();
                            update({ highContrast: !settings.highContrast });
                          }}
                          aria-pressed={settings.highContrast}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-[10.5px] font-bold transition-all",
                            settings.highContrast
                              ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          )}
                        >
                          {settings.highContrast ? "فعال ✓" : "خاموش"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COLOR PSYCHOLOGY PICKER (aria-label="رنگ پلتفرم" preserved for smoke tests) */}
            <div className="relative">
              <button
                onClick={() => {
                  if (settings.sound) soundEngine.playTick(1);
                  setA11yOpen(false);
                  setPaletteOpen((v) => !v);
                }}
                onMouseEnter={playSubtleHover}
                className="tap-icon flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] transition-all hover:border-white/25"
                aria-label="رنگ پلتفرم"
                title="پالت روانشناسی رنگ (60-30-10 OKLCH)"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shadow-[0_0_12px_rgba(var(--accent-glow),0.8)]"
                  style={{ background: accent.hex }}
                />
              </button>
              {paletteOpen && (
                <button
                  type="button"
                  aria-label="بستن انتخاب رنگ"
                  tabIndex={-1}
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setPaletteOpen(false)}
                />
              )}
              <AnimatePresence>
                {paletteOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="absolute end-0 top-10 z-50 w-64 rounded-2xl border border-white/15 bg-[#0B0D14]/98 p-2.5 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-white/[0.07] px-1 pb-1.5 text-[10.5px] text-zinc-400">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-200">
                        <Palette className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                        پالت روانشناسی رنگ (OKLCH)
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">60·30·10</span>
                    </div>
                    <div className="space-y-1">
                      {ACCENTS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            soundEngine.playSnap();
                            update({ accent: a.id, customAccent: null });
                            setPaletteOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-start transition-colors hover:bg-white/[0.06]",
                            settings.accent === a.id && !settings.customAccent
                              ? "bg-white/[0.05] text-white"
                              : "text-zinc-300"
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{
                              background: a.hex,
                              boxShadow: `0 0 10px ${a.hex}88`,
                            }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11.5px] font-bold">{a.labelFa}</span>
                            <span className="block truncate text-[9.5px] text-zinc-500">
                              {PSYCHOLOGY_NOTES[a.id]}
                            </span>
                          </span>
                          {settings.accent === a.id && !settings.customAccent && (
                            <span className="text-[9.5px] font-bold text-[color:var(--accent)]">
                              فعال
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.07] pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-[10.5px] text-zinc-400 hover:text-zinc-200">
                        <input
                          type="color"
                          value={settings.customAccent ?? accent.hex}
                          onChange={(e) => update({ customAccent: e.target.value })}
                          className="h-6 w-6 cursor-pointer rounded border border-white/10 bg-transparent"
                          aria-label="انتخاب رنگ سفارشی"
                        />
                        <span>رنگ دلخواه</span>
                      </label>
                      {settings.customAccent && (
                        <button
                          onClick={() => update({ customAccent: null })}
                          className="ms-auto rounded-lg border border-white/10 px-2 py-0.5 text-[9.5px] text-zinc-400 hover:text-white"
                        >
                          بازگشت به پالت
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Replay Entrance Motion Graphic */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("rtmlab:open-intro"));
              }}
              onMouseEnter={playSubtleHover}
              aria-label="تماشای معرفی سایت"
              title="پخش موشن سینمایی ورود (خط به واژه)"
              className="tap-icon flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-zinc-300 transition-colors hover:border-[color:var(--accent)]/40 hover:text-white"
            >
              <Clapperboard className="h-3.5 w-3.5" />
            </button>

            {/* Web Audio Synthesizer Toggle */}
            <button
              onClick={async () => {
                const next = !settings.sound;
                soundEngine.enabled = next;
                update({ sound: next });
                if (next) {
                  await soundEngine.unlock();
                  soundEngine.playSuccess();
                }
              }}
              onMouseEnter={playSubtleHover}
              className={cn(
                "tap-icon flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                settings.sound
                  ? "border-[color:var(--accent)]/35 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                  : "border-white/[0.09] bg-white/[0.03] text-zinc-500"
              )}
              aria-label="صدای رابط"
              title="سینت‌سایزر صدای رابط (Web Audio)"
            >
              {settings.sound ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/amirui123/jjli"
              target="_blank"
              rel="noreferrer"
              onMouseEnter={playSubtleHover}
              className="tap-icon hidden h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/25 hover:text-white sm:flex"
              aria-label="مخزن گیت‌هاب"
            >
              <Github className="h-3.5 w-3.5" />
            </a>

            {/* Mobile Dedicated Studio & Sensory Sheet Trigger (<1280px) */}
            <button
              type="button"
              onClick={() => {
                if (settings.sound) soundEngine.playSnap();
                setMobileSheetOpen(true);
              }}
              aria-label="منوی جامع موبایل و استودیوها"
              className="tap-icon flex h-8 w-8 items-center justify-center rounded-xl border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/12 text-[color:var(--accent)] xl:hidden"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* DEDICATED MOBILE THUMB-ZONE BENTO SHEET */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSheetOpen(false)}
            className="fixed inset-0 z-[85] flex flex-col justify-end bg-black/75 backdrop-blur-md xl:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86dvh] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-[#0A0C12] p-4 pb-8 shadow-[0_-24px_60px_rgba(0,0,0,0.95)]"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <div className="flex items-center justify-between pb-3">
                <div>
                  <div className="text-[13.5px] font-bold text-white">
                    میز فرمان موبایل · آزمایشگاه موشن
                  </div>
                  <div className="text-[10.5px] text-zinc-500">
                    طراحی ارگونومیک ویژهٔ کار با یک دست (Thumb-Zone)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="بستن منوی موبایل"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 9 Studios Grid for Thumb Reach */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROUTES.map((r) => {
                  const active = meta.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        if (settings.sound) soundEngine.playSnap();
                        navigate(r.path);
                        setMobileSheetOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-2xl border p-2.5 text-start transition-all active:scale-95",
                        active
                          ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15 text-white"
                          : "border-white/[0.07] bg-white/[0.025] text-zinc-300"
                      )}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-[13px] font-bold"
                        style={{
                          borderColor: `${r.accent}40`,
                          background: `${r.accent}15`,
                          color: r.accent,
                        }}
                      >
                        {r.glyph}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-bold">{r.labelFa}</span>
                        <span className="block truncate text-[9.5px] text-zinc-500">
                          {r.shortFa}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Mobile Sensory & Color Bar */}
              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="mb-2 text-[11px] font-bold text-zinc-300">
                  کالیبراسیون سریع رنگ و تایپوگرافی
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playSnap();
                        update({ accent: a.id, customAccent: null });
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px]",
                        settings.accent === a.id
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/10 text-zinc-400"
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.hex }} />
                      {a.labelFa}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};

/* --------------------------------------------------------- command palette */

const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ROUTES;
    return ROUTES.filter(
      (r) =>
        r.labelFa.includes(term) ||
        r.labelEn.toLowerCase().includes(term) ||
        r.descFa.includes(term)
    );
  }, [q]);

  useEffect(() => setActive(0), [q]);

  const go = (index: number) => {
    const target = results[index];
    if (!target) return;
    soundEngine.playSnap();
    navigate(target.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/75 px-4 pt-[13vh] backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14] shadow-[0_28px_80px_-12px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-3.5 py-3">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-autocomplete="list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => (results.length ? (i + 1) % results.length : 0));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
                  } else if (e.key === "Enter") {
                    go(active);
                  }
                }}
                placeholder="جستجوی استودیو، فونت، شیدر یا ابزار…"
                className="w-full bg-transparent text-[13px] text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <button onClick={onClose} aria-label="بستن">
                <X className="h-4 w-4 text-zinc-500 hover:text-zinc-200" />
              </button>
            </div>
            <div
              id="command-results"
              role="listbox"
              aria-label="نتایج جستجو"
              className="max-h-80 overflow-y-auto p-1.5"
            >
              {results.map((r, i) => (
                <button
                  key={r.id}
                  id={`cmd-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
                    i === active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl border text-[13px] font-bold"
                    style={{
                      borderColor: `${r.accent}40`,
                      color: r.accent,
                      background: `${r.accent}15`,
                    }}
                  >
                    {r.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-zinc-100">{r.labelFa}</span>
                    <span className="block truncate text-[10.5px] text-zinc-400">{r.descFa}</span>
                  </span>
                  <span className="ms-auto font-mono text-[9.5px] text-zinc-500">{r.labelEn}</span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-[11.5px] text-zinc-500">نتیجه‌ای پیدا نشد</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------------- bottom dock */

const BottomDock: React.FC = () => {
  const { meta } = useRouter();
  const { settings } = useAppSettings();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-safe sm:pb-4">
      <motion.nav
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.12 }}
        onMouseLeave={() => setHoveredIdx(null)}
        className="dock-mask pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.11] bg-[#07090F]/94 p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl scrollbar-none snap-x-soft"
        aria-label="ناوبری بخش‌ها"
      >
        {ROUTES.map((r, idx) => {
          const active = meta.id === r.id;
          const dist = hoveredIdx === null ? 99 : Math.abs(hoveredIdx - idx);
          const scale = dist === 0 ? 1.12 : dist === 1 ? 1.04 : 1;

          return (
            <button
              key={r.id}
              onClick={() => {
                if (settings.sound) soundEngine.playSnap();
                navigate(r.path);
              }}
              onMouseEnter={() => {
                setHoveredIdx(idx);
                if (settings.sound && soundEngine.isUnlocked()) {
                  soundEngine.playTick(0.75);
                }
              }}
              style={{
                transform: `scale(${scale})`,
              }}
              className={cn(
                "tap-target group relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-150",
                active ? "text-white" : "text-zinc-400 hover:text-zinc-100"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={r.labelFa}
              title={`${r.labelFa} — ${r.descFa}`}
            >
              {active && (
                <motion.span
                  layoutId="dock-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl border border-white/[0.14] bg-white/[0.08]"
                  style={{ boxShadow: `0 0 24px -6px ${r.accent}88` }}
                />
              )}
              <span
                className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-[12.5px] font-bold transition-transform duration-150 group-hover:-translate-y-0.5"
                style={{ color: active ? r.accent : undefined }}
              >
                {r.glyph}
              </span>
              <span
                className={cn(
                  "relative z-10 whitespace-nowrap text-[11px] font-medium",
                  active ? "inline font-bold" : "hidden sm:inline"
                )}
              >
                {r.shortFa}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

/* -------------------------------------------------------------------- footer */

const Footer: React.FC = () => {
  const { settings } = useAppSettings();
  return (
    <footer className="border-t border-white/[0.07] bg-[#040508] pb-28 pt-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-[#0B0D14]">
              <span className="font-hasti text-[14px] leading-none text-[color:var(--accent)]">
                م
              </span>
            </span>
            <div>
              <span className="block text-[13px] font-bold text-zinc-100">
                آزمایشگاه موشن و تایپوگرافی فارسی
              </span>
              <span className="block font-nastaliq text-[18px] leading-[1.8] text-[color:var(--accent)]">
                در امتدادِ نور، هر خط جان می‌گیرد
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-zinc-400">
            پلتفرم رایگان، متن‌باز و ۶۰ فریم بر ثانیه برای مهندسی رابط‌های فارسی: ۵۰ خانواده فونت
            اصیل، فیزیک فنر مرتبهٔ دوم، ۴٬۱۹۹ فایل کامپوننت، ۱۸ شیدر WebGL و سینت‌سایزر Web Audio —
            کاملاً محلی در مرورگر شما.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
          {ROUTES.slice(1).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                if (settings.sound) soundEngine.playTick(0.9);
                navigate(r.path);
              }}
              className="flex items-center gap-1.5 text-start text-[11.5px] text-zinc-400 transition-colors hover:text-[color:var(--accent)]"
            >
              <span className="text-[10px]" style={{ color: r.accent }}>
                {r.glyph}
              </span>
              <span>{r.labelFa}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3.5 text-[10.5px] text-zinc-500">
          <p className="font-bold text-zinc-300">شناسنامهٔ مهندسی (Colophon)</p>
          <p className="mt-1">React 18 · Tailwind v4 · Motion · WebGL · Web Audio</p>
          <p className="mt-1">پالت ۶۰-۳۰-۱۰ OKLCH · ضد کشیدگی پنل‌های OLED</p>
          <p className="mt-2 font-mono text-[9.5px] text-[color:var(--accent)]" dir="ltr">
            {settings.accent.toUpperCase()} · {settings.displayFont} · 60FPS
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ------------------------------------------------------------------- shell */

const PAGE_ENTER: Record<string, { from: Record<string, string | number>; duration: number }> = {
  home: { from: { opacity: 0, y: 10 }, duration: 0.36 },
  dashboard: { from: { opacity: 0, y: 16, scale: 0.995 }, duration: 0.34 },
  fonts: { from: { opacity: 0, y: 12 }, duration: 0.36 },
  motion: { from: { opacity: 0, scale: 0.985, y: 14 }, duration: 0.36 },
  components: { from: { opacity: 0, x: 18 }, duration: 0.34 },
  sounds: { from: { opacity: 0, scale: 0.99, y: 12 }, duration: 0.35 },
  skills: { from: { opacity: 0, y: -12 }, duration: 0.35 },
  engines: { from: { opacity: 0, y: 14 }, duration: 0.38 },
  ai: { from: { opacity: 0, scale: 0.992, y: 12 }, duration: 0.36 },
};

const STUDIO_ROUTES = new Set([
  "fonts",
  "motion",
  "components",
  "sounds",
  "skills",
  "engines",
  "ai",
]);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { route } = useRouter();
  const { settings } = useAppSettings();
  const isStudio = STUDIO_ROUTES.has(route);

  const bgWallpaper = useMemo(() => {
    if (settings.accent === "turquoise" || settings.accent === "emerald") {
      return publicUrl("/backgrounds/emerald-turquoise-aurora.jpg");
    }
    if (settings.accent === "violet" || settings.accent === "rose") {
      return publicUrl("/backgrounds/amethyst-horizon-silk.jpg");
    }
    return publicUrl("/backgrounds/nebula-lapis-gold.jpg");
  }, [settings.accent]);

  return (
    <div
      dir="rtl"
      className={cn(
        "relative bg-[#05060A] text-zinc-100",
        isStudio ? "desk:h-[100dvh] desk:overflow-hidden" : "min-h-screen"
      )}
    >
      {/* Color-Psychology 60-30-10 Atmospheric Backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.17] transition-[background-image,opacity] duration-700"
          style={{ backgroundImage: `url("${bgWallpaper}")` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 65% at 50% 0%, transparent 15%, rgba(5, 6, 10, 0.88) 85%, #05060A 100%)",
          }}
        />
      </div>

      {/* Skip to content button — never an href="#…" since router uses hash */}
      <button
        type="button"
        onClick={() => document.getElementById("main")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-[95] focus:rounded-lg focus:bg-[color:var(--accent)] focus:px-3 focus:py-2 focus:text-[12px] focus:font-bold focus:text-black"
      >
        پرش به محتوا
      </button>
      <TopBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          tabIndex={-1}
          key={route}
          initial={(PAGE_ENTER[route] ?? { from: { opacity: 0, y: 8 }, duration: 0.22 }).from}
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            duration: (PAGE_ENTER[route] ?? { duration: 0.22 }).duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "relative z-10 mx-auto max-w-[1440px] px-3.5 sm:px-6",
            isStudio
              ? "min-h-[calc(100dvh-3.5rem)] pb-28 pt-3 desk:h-[calc(100dvh-3.5rem)] desk:min-h-0 desk:overflow-hidden desk:pb-[68px] desk:pt-3"
              : "min-h-[calc(100vh-3.5rem)] pb-24 pt-5"
          )}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isStudio && <Footer />}
      <BottomDock />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[-1] h-28 bg-gradient-to-t from-[#05060A] to-transparent" />
    </div>
  );
};
